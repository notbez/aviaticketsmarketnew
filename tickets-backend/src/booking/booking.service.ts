import {
  BadRequestException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { randomUUID } from 'crypto';

import {
  Booking,
  BookingDocument,
} from '../schemas/booking.schema';
import { OnelyaService } from '../onelya/onelya.service';

import {
  ReservationConfirmRequest,
  ReservationBlankRequest,
  ReservationVoidRequest,
  ReservationCancelRequest,
  OrderInfoRequest,
} from '../onelya/dto/order-reservation.dto';

import { flightOfferStore } from '../flights/flight-offer.store';

export type CreateResult =
  | { success: true; booking: BookingDocument; raw?: any }
  | {
      success: false;
      booking: BookingDocument;
      error?: any;
      raw?: any;
    };

@Injectable()
export class BookingService {
  private readonly logger = new Logger(
    BookingService.name,
  );

  constructor(
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDocument>,
    private readonly onelyaService: OnelyaService,
  ) {}



  private normalizeString(value?: string): string {
    return value?.trim().toUpperCase() || '';
  }
  
  private normalizePassengers(passengers: any[] = []) {
    return passengers.map(p => ({
      ...p,
      firstName: p.firstName?.trim(),
      lastName: p.lastName?.trim(),
      middleName: p.middleName?.trim(),
    }));
  }
  
  private normalizeContact(contact: any) {
    return {
      phone: contact?.phone?.trim() || '79990000000',
      email: contact?.email?.trim() || 'test@test.ru',
    };
  }

  /**
   * Создание локального бронирования (fallback)
   */
  public async createLocal(
    userId: string,
    body: any,
  ): Promise<BookingDocument> {
    const booking = new this.bookingModel({
      user: new Types.ObjectId(userId),

      from: body.from || 'Санкт-Петербург',
      to: body.to || 'Москва',

      departureDate: body.date
        ? new Date(body.date)
        : new Date(),
      returnDate: body.returnDate
        ? new Date(body.returnDate)
        : null,
      isRoundTrip: Boolean(body.isRoundTrip),

      flightNumber: body.flightNumber || 'SU 5411',
      departTime: body.departTime || '23:15',
      arriveTime: body.arriveTime || '23:55',

      passengers: body.passengers || [],

      providerBookingId: `onelya-${randomUUID()}`,
      bookingStatus: 'reserved',
      provider: 'onelya-mock',

      payment: {
        paymentStatus: 'pending',
        amount: body.price || 5600,
        currency: 'RUB',
      },
    });

    await booking.save();
    this.logger.log(
      `Created local booking ${booking._id}`,
    );

    return booking;
  }

  /**
   * Публичный метод
   */
  public async create(
    userId: string,
    body: any,
  ): Promise<CreateResult> {
    return this.createOnelya(userId, body);
  }

  /**
   * Создание бронирования через Onelya
   */
  public async createOnelya(
    userId: string,
    body: any,
  ): Promise<CreateResult> {
    const {
      offerId,
      passengers,
      contact,
      selectedBrandId,
    } = body;

    if (!offerId) {
      throw new BadRequestException(
        'offerId is required',
      );
    }

    const storedOffer =
      flightOfferStore.get(offerId);

    if (!storedOffer) {
      throw new BadRequestException(
        'Offer not found or expired',
      );
    }

    const route = storedOffer.providerRaw as any;

    /**
     * ---------------------------
     * BRAND FARE SELECTION
     * ---------------------------
     */
    let brandFare: any = null;

    const safeBrandId =
      selectedBrandId && selectedBrandId !== 'NB'
        ? selectedBrandId
        : null;

    if (
      safeBrandId &&
      Array.isArray(route?.BrandFares)
    ) {
      brandFare = route.BrandFares.find(
        (bf: any) => {
          const info =
            bf?.BrandFareFlights?.[0]
              ?.BrandedFareInfo;
          return (
            info?.BrandId === selectedBrandId ||
            info?.GdsBrandId === selectedBrandId
          );
        },
      );
    }

    if (
      !brandFare &&
      Array.isArray(route?.BrandFares)
    ) {
      this.logger.warn(
        '[Booking] Brand not found, fallback to first BrandFare',
      );
      brandFare = route.BrandFares[0];
    }

    if (!brandFare) {
      throw new BadRequestException(
        'BrandFare is required for pricing',
      );
    }

    /**
 * ---------------------------
 * BRAND FARE PRICING (FINAL PRICE IN TEST)
 * ---------------------------
 */
this.logger.log('[Onelya] BrandFarePricing request');

const adults = Math.max(
  1,
  Array.isArray(passengers) ? passengers.length : 1,
);

const flightsForPricing =
  (brandFare.BrandFareFlights || []).map(f => ({
    ...f,
    ServiceSubclass: f.ServiceSubclass ?? f.Subclass,
  }));

const brandFarePricing =
  await this.onelyaService.brandFarePricing({
    Gds: brandFare.BrandFareFlights?.[0]?.Gds,
    AdultQuantity: adults,
    Flights: flightsForPricing,
  });

if (
  !brandFarePricing ||
  !Array.isArray(brandFarePricing.BrandFares) ||
  brandFarePricing.BrandFares.length === 0
) {
  throw new BadRequestException(
    'BrandFarePricing returned no fares',
  );
}

const finalBrandFare =
  brandFarePricing.BrandFares[0];


  /**
 * ------------------------------------
 * BUILD PROVIDER RAW FOR RESERVATION
 * ------------------------------------
 * IMPORTANT:
 * - base = providerRaw from Search
 * - exactly ONE BrandFare
 * - pricing data must be injected
 */

const pricedBrandFare = {
  ...brandFare,

  // flights from pricing (they are validated by Onelya)
  BrandFareFlights: finalBrandFare.BrandFareFlights.map(f => ({
    ...f,
    ServiceSubclass: f.ServiceSubclass ?? f.Subclass,
  })),

  // pricing info
  Prices: finalBrandFare.Prices,
  Cost: finalBrandFare.Cost,
};

const providerRawForReservation = {
  Id: route.Id, // Obsolete — ОК
  Segments: route.Segments,
  BrandFares: [pricedBrandFare],
};


this.logger.debug(
  '[Onelya] ProviderRaw for Reservation',
  JSON.stringify(providerRawForReservation, null, 2),
);
    /**
     * ---------------------------
     * PRICING / ROUTE (CRITICAL)
     * ---------------------------
     */
    

    /**
     * ---------------------------
     * RESERVATION CREATE
     * ---------------------------
     */
    try {
      this.logger.log(
        '[Onelya] Reservation/Create request',
      );

      const normalizedPassengers =
      this.normalizePassengers(passengers);

      const normalizedContact =
      this.normalizeContact(contact);

      this.logger.debug(
        '[Onelya] FinalBrandFare snapshot',
        JSON.stringify(finalBrandFare, null, 2),
      );

      this.logger.log(
        '[Onelya] Reservation payload ready',
      );
      
      
      const data =
        await this.onelyaService.createReservation({
          providerRaw: providerRawForReservation,
          passengers: normalizedPassengers,
          contact: normalizedContact,
        }) as { OrderId?: number };

      if (!data?.OrderId) {
        throw new Error(
          'Onelya did not return OrderId',
        );
      }

      const providerBookingId = String(
        data.OrderId,
      );

      const booking = new this.bookingModel({
        user: new Types.ObjectId(userId),

        passengers,
        providerBookingId,
        bookingStatus: 'reserved',
        provider: 'onelya',

        payment: {
          paymentStatus: 'pending',
          amount: finalBrandFare?.Cost?.Amount ?? 0,
          currency: finalBrandFare?.Cost?.Currency ?? 'RUB',
        },

        rawProviderData: data,
      });

      await booking.save();
      flightOfferStore.delete(offerId);

      return {
        success: true,
        booking,
        raw: data,
      };
    } catch (err: any) {
      this.logger.error(
        '[Onelya] Reservation create failed',
        err,
      );

      const booking =
        await this.createLocal(userId, body);

      return {
        success: false,
        booking,
        error: err?.message || String(err),
        raw: err,
      };
    }
  }

  /**
   * Confirm reservation
   */
  public async confirmOnelya(
    providerBookingId: string,
    payload?: Partial<ReservationConfirmRequest>,
  ) {
    const orderId = this.parseOrderId(
      providerBookingId,
      payload?.OrderId,
    );

    const result =

    await this.onelyaService.recalcReservation({
  OrderId: orderId,
});
      await this.onelyaService.confirmReservation(
        {
          OrderId: orderId,
          ...payload,
        },
      );

    const booking =
      await this.bookingModel.findOne({
        providerBookingId: String(orderId),
      });

    if (booking) {
      booking.bookingStatus = 'ticketed';
      booking.rawProviderData = result;
      await booking.save();
    }

    return result;
  }

  /**
   * Get blank / ticket
   */
  public async getBlank(providerBookingId: string) {
    const orderId =
      this.parseOrderId(providerBookingId);

    const result =
      await this.onelyaService.blankReservation(
        {
          OrderId: orderId,
          RetrieveMainServices: true,
          RetrieveUpsales: true,
        },
      );

    return {
      type: result.contentType?.includes('pdf')
        ? 'pdf'
        : 'binary',
      buffer: result.buffer,
      contentType: result.contentType,
    };
  }

  /**
   * Utils
   */
  private parseOrderId(
    providerBookingId?: string,
    fallback?: number,
  ): number {
    if (
      typeof fallback === 'number' &&
      Number.isFinite(fallback)
    ) {
      return fallback;
    }

    const parsed = Number(providerBookingId);
    if (Number.isFinite(parsed)) {
      return parsed;
    }

    throw new BadRequestException(
      'Valid OrderId is required',
    );
  }

  private buildPricingRoute(route: any) {
    return {
      Segments: route.Segments.map((seg: any) => ({
        Flights: seg.Flights.map((f: any) => ({
          MarketingAirlineCode: f.MarketingAirlineCode,
          OperatingAirlineCode: f.OperatingAirlineCode,
          FlightNumber: f.FlightNumber,
          OriginAirportCode: f.OriginAirportCode,
          DestinationAirportCode: f.DestinationAirportCode,
          DepartureDateTime: f.DepartureDateTime,
          ServiceClass: f.ServiceClass,
          Subclass: f.Subclass,
          FareCode: f.FareCode,
          FlightGroup: f.FlightGroup ?? 0,
          RouteGroup: f.RouteGroup ?? 0,
        })),
      })),
    };
  }

  /**
 * Get booking by internal Mongo ID
 */
public async getById(id: string) {
  if (!Types.ObjectId.isValid(id)) {
    return null;
  }

  return this.bookingModel.findById(id).exec();
}

/**
 * Get all bookings for user
 */
public async getUserBookings(userId: string) {
  return this.bookingModel
    .find({ user: new Types.ObjectId(userId) })
    .sort({ createdAt: -1 })
    .exec();
}
}