
import {
  BadRequestException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Booking,
  BookingDocument,
} from '../schemas/booking.schema';
import { OnelyaService } from '../onelya/onelya.service';
import { flightOfferStore } from '../flights/flight-offer.store';
import * as crypto from 'crypto';

type ReservationCreateResult = {
  OrderId: number;
};

export type CreateResult =
  | { success: true; booking: BookingDocument; raw?: any }
  | {
      success: false;
      booking: BookingDocument;
      error?: any;
      raw?: any;
    };

/**
 * Booking service for flight reservation management
 * Handles the complete booking flow: create, payment, confirmation, and document generation
 * TODO: Implement booking status transitions validation and audit logging
 */
@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);
  private readonly AUTO_CONFIRM_AFTER_CREATE = false;

  constructor(
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDocument>,
    private readonly onelyaService: OnelyaService,
  ) {}

  /**
   * Data normalization utilities
   */
  private normalizePassengers(passengers: any[] = []) {
    return passengers.map((p, i) => {
      const firstName =
        typeof p.firstName === 'string' && p.firstName.trim().length > 0
          ? p.firstName.trim()
          : typeof p.first_name === 'string' && p.first_name.trim().length > 0
          ? p.first_name.trim()
          : undefined;
    
      const lastName =
        typeof p.lastName === 'string' && p.lastName.trim().length > 0
          ? p.lastName.trim()
          : typeof p.last_name === 'string' && p.last_name.trim().length > 0
          ? p.last_name.trim()
          : undefined;
    
      if (!firstName || !lastName) {
        this.logger.error(
          `[Passenger normalize] Passenger ${i + 1} name missing`,
          JSON.stringify(p),
        );
      }
    
      return {
        ...p,
        firstName,
        lastName,
        middleName:
          typeof p.middleName === 'string' && p.middleName.trim().length > 0
            ? p.middleName.trim()
            : typeof p.middle_name === 'string' && p.middle_name.trim().length > 0
            ? p.middle_name.trim()
            : null,
        dateOfBirth: p.dateOfBirth || p.birthDate,
        documentType: p.documentType,
        passportNumber:
          p.passportNumber || p.document || p.documentNumber || null,
        passportExpiryDate: p.passportExpiryDate || null,
      };
    });
  }

  private generateBlankAccessToken(): string {
    return crypto.randomBytes(24).toString('hex');
  }

  private normalizeContact(contact: any) {
    const phone = contact?.phone?.replace(/\D/g, '') || '79990000000';
    const email = contact?.email?.trim() || 'test@test.ru';
    return {
      phone: phone.startsWith('7') ? phone : `7${phone}`,
      email,
    };
  }

  /**
   * Main booking creation entry point
   */
  public async create(userId: string, body: any): Promise<CreateResult> {
    return this.createOnelya(userId, body);
  }


  /**
   * Complete Onelya booking flow: validation, reservation, recalc, and persistence
   * TODO: Add transaction support for atomic booking operations
   */
  public async createOnelya(userId: string, body: any): Promise<CreateResult> {
    const { offerId, passengers, contact } = body;

    this.logger.log(`[Booking] brandId = ${body.brandId}`);

    const passengersCount = {
      Adult: passengers.filter(
        p => p.customerType !== 'Child' && p.customerType !== 'Infant',
      ).length,
      Infant: passengers.filter(p => p.customerType === 'Infant').length,
    };

    if (passengersCount.Infant > passengersCount.Adult) {
      throw new BadRequestException(
        'Infants count cannot exceed adults count',
      );
    }

    if (!offerId) {
      throw new BadRequestException('offerId is required');
    }

    const storedOffer = flightOfferStore.get(offerId);
    if (!storedOffer) {
      throw new BadRequestException('Offer expired or not found');
    }

    let providerRoute = storedOffer.providerRaw;

    // Apply selected brand fare if specified
    if (body.brandId) {
      providerRoute.Flights = providerRoute.Flights.map(f => ({
        ...f,
        BrandedFareInfo: {
          GdsBrandId: body.brandId,
        },
      }));
    }

    if (!providerRoute) {
      throw new BadRequestException('Offer corrupted or expired');
    }

    this.logger.log(
      `[Booking] Creating reservation from offer=${offerId}, flights=${providerRoute.Flights.length}`,
    );

    this.logger.warn(
      '[DEBUG PASSENGERS BEFORE ONELYA]',
      JSON.stringify(this.normalizePassengers(passengers), null, 2),
    );

    // Create reservation
    let reservation;

    try {
      reservation = await this.onelyaService.createReservation({
        providerRaw: providerRoute,
        passengers: this.normalizePassengers(passengers),
        contact: this.normalizeContact(contact),
      });
    } catch (e) {
      this.logger.error(
        '[Booking] createReservation crashed BEFORE HTTP',
        e instanceof Error ? e.stack : e,
      );
      throw e; 
    }

    if (!reservation?.OrderId) {
      throw new Error('Reservation did not return OrderId');
    }

    const orderId = reservation.OrderId;

    // Recalculate pricing (mandatory step)
    const recalced = await this.onelyaService.recalcReservation({
      OrderId: orderId,
    });

    this.logger.log(`[Booking] Recalc completed, OrderId=${orderId}`);

    const price =
      recalced?.AmountAfter ??
      recalced?.RecalcResults?.[0]?.Amount ??
      0;

    const currency = 'RUB';
    const firstFlight = providerRoute.Flights[0];
    const from = firstFlight.OriginAirportCode;
    const to = firstFlight.DestinationAirportCode;
    const departureDate = new Date(firstFlight.DepartureDateTime);

    this.logger.warn('[RECALC RAW]', JSON.stringify(recalced, null, 2));

    // Persist booking to database
    const booking = new this.bookingModel({
      user: new Types.ObjectId(userId),
      from,
      to,
      departureDate,
      passengers,
      providerBookingId: String(orderId),
      bookingStatus: 'created',
      provider: 'onelya',
      flightView: body.flightView ?? null,
      payment: {
        paymentStatus: 'pending',
        amount: price,
        currency,
      },
      rawProviderData: {
        create: reservation,
        recalc: recalced,
      },
    });

    await booking.save();
    flightOfferStore.delete(offerId);

    return { success: true, booking };
  }

  /**
   * Payment processing (virtual payment for testing)
   */
  public async virtualPay(providerBookingId: string) {
    const orderId = this.parseOrderId(providerBookingId);
    const booking = await this.bookingModel.findOne({
      providerBookingId: String(orderId),
    });

    if (!booking) {
      throw new BadRequestException('Booking not found');
    }

    booking.payment.paymentStatus = 'paid';
    await booking.save();

    this.logger.log(
      `[Booking] Virtual payment applied, OrderId=${orderId}`,
    );

    return { success: true };
  }

  /**
   * Booking confirmation with provider
   * Handles both successful confirmations and expected test environment failures
   */
  public async confirmOnelya(providerBookingId: string) {
    const orderId = this.parseOrderId(providerBookingId);
    const booking = await this.bookingModel.findOne({
      providerBookingId: String(orderId),
    });

    if (!booking) {
      throw new BadRequestException('Booking not found');
    }

    if (booking.payment.paymentStatus !== 'paid') {
      throw new BadRequestException(
        'Booking must be paid before confirmation',
      );
    }

    this.logger.log(
      `[Booking] Confirming reservation, OrderId=${orderId}`,
    );

    try {
      const result = await this.onelyaService.confirmReservation({
        OrderId: orderId,
      });
      booking.bookingStatus = 'ticketed';
      booking.rawProviderData.confirm = result;
    } catch (e) {
      // In test environment, confirmation may fail due to insufficient balance
      booking.bookingStatus = 'created';
      booking.rawProviderData.confirmError = e;
    }

    await booking.save();
    return { success: true };
  }

  /**
   * Document generation and retrieval
   * Generates PDF tickets and manages file storage with access tokens
   */
  public async getBlankByBookingId(bookingId: string) {
    if (!Types.ObjectId.isValid(bookingId)) {
      throw new BadRequestException('Invalid booking id');
    }

    const booking = await this.bookingModel.findById(bookingId);
    if (!booking) {
      throw new BadRequestException('Booking not found');
    }

    const orderId = this.parseOrderId(booking.providerBookingId);

    // Return existing blank if already generated
    if (booking.rawProviderData?.blank?.fileId) {
      return {
        success: true,
        fileId: booking.rawProviderData.blank.fileId,
        accessToken: booking.rawProviderData.blank.accessToken,
      };
    }

    // Generate new blank document
    const blank = await this.onelyaService.blankReservation({
      OrderId: orderId,
      RetrieveMainServices: true,
      RetrieveUpsales: true,
    });

    // Save file to storage
    const fileId = `blank_${orderId}.pdf`;
    const fs = require('fs');
    const path = require('path');

    const dir = path.join(process.cwd(), 'storage/blanks');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const filePath = path.join(dir, fileId);
    fs.writeFileSync(filePath, blank.buffer);

    booking.rawProviderData.blank = {
      fileId,
      contentType: blank.contentType || 'application/pdf',
      receivedAt: new Date(),
      accessToken: this.generateBlankAccessToken(),
    };

    booking.markModified('rawProviderData');
    await booking.save();

    return {
      success: true,
      fileId,
      accessToken: booking.rawProviderData.blank.accessToken,
    };
  }

  /**
   * Manual recalculation for debugging and price updates
   */
  public async recalcOnelya(providerBookingId: string) {
    const orderId = this.parseOrderId(providerBookingId);
    this.logger.warn(
      `[Booking] Manual recalc invoked, OrderId=${orderId}`,
    );
    return this.onelyaService.recalcReservation({
      OrderId: orderId,
    });
  }

  /**
   * Data retrieval methods
   */
  public async getById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    return this.bookingModel.findById(id).exec();
  }

  public async getUserBookings(userId: string) {
    return this.bookingModel
      .find({ user: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Utility methods
   */
  private parseOrderId(providerBookingId?: string): number {
    const parsed = Number(providerBookingId);
    if (!Number.isFinite(parsed)) {
      throw new BadRequestException('Invalid OrderId');
    }
    return parsed;
  }
}
