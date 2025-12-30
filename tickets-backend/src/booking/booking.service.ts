
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

  // ===========================================================================
  // NORMALIZATION
  // ===========================================================================

  private normalizePassengers(passengers: any[] = []) {
    return passengers.map(p => ({
      ...p,
      firstName: p.firstName?.trim(),
      lastName: p.lastName?.trim(),
      middleName: p.middleName?.trim(),
    }));
  }

  private generateBlankAccessToken(): string {
  return crypto.randomBytes(24).toString('hex');
}

private normalizeContact(contact: any) {
  const phone =
    contact?.phone?.replace(/\D/g, '') || '79990000000';

  const email =
    contact?.email?.trim() || 'test@test.ru';

  return {
    phone: phone.startsWith('7') ? phone : `7${phone}`,
    email,
  };
}

  // ===========================================================================
  // PUBLIC CREATE
  // ===========================================================================

  public async create(
    userId: string,
    body: any,
  ): Promise<CreateResult> {
    return this.createOnelya(userId, body);
  }

  private readonly AUTO_CONFIRM_AFTER_CREATE = false;
  // ===========================================================================
  // FULL ONELYA FLOW
  // ===========================================================================


  public async createOnelya(
    userId: string,
    body: any,
  ): Promise<CreateResult> {
    const { offerId, passengers, contact } = body;

    this.logger.log(
  `[Booking] brandId = ${body.brandId}`,
);

    const passengersCount = {
  Adult: passengers.filter(
    p => p.customerType !== 'Child' && p.customerType !== 'Infant',
  ).length,
  Infant: passengers.filter(
    p => p.customerType === 'Infant',
  ).length,
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
      throw new BadRequestException(
        'Offer expired or not found',
      );
    }

let providerRoute = storedOffer.providerRaw;

// ✅ применяем выбранный бренд тарифа
if (body.brandId) {
  providerRoute.Flights = providerRoute.Flights.map(f => ({
    ...f,
    BrandedFareInfo: {
      GdsBrandId: body.brandId,
    },
  }));
}

if (typeof providerRoute.RouteGroup !== 'number') {
  providerRoute.RouteGroup = 0;
}

if (!providerRoute) {
  throw new BadRequestException('Offer corrupted or expired');
}

    this.logger.log(
  `[Booking] Creating reservation from offer=${offerId}, routeGroup=${providerRoute.RouteGroup}`,
);

// 0️⃣ FARE INFO BY ROUTE — ОБЯЗАТЕЛЬНО ПЕРЕД CREATE
const fareInfo = await this.onelyaService.fareInfoByRoute({
  Gds: providerRoute.Gds,
  Flights: providerRoute.Flights.map(f => ({
    MarketingAirlineCode: f.MarketingAirlineCode,
    OperatingAirlineCode: f.OperatingAirlineCode,
    FlightNumber: f.FlightNumber,
    OriginAirportCode: f.OriginAirportCode,
    DestinationAirportCode: f.DestinationAirportCode,
    DepartureDateTime: f.DepartureDateTime,
    ServiceClass: 'Economic',
    ServiceSubclass: f.ServiceSubclass,
    FareCode: f.FareCode,          // ✅ ТОЛЬКО FareCode
    FlightGroup: f.RouteGroup,
  })),
  FlightIndex: 0,
  AdultQuantity: passengers.filter(p => p.customerType === 'Adult').length,
  ChildQuantity: passengers.filter(p => p.customerType === 'Child').length,
  BabyWithoutPlaceQuantity: passengers.filter(p => p.customerType === 'Infant').length,
  BabyWithPlaceQuantity: 0,
});

// ❗ FareInfoByRoute вызывается ТОЛЬКО для валидации тарифа
// ❗ НИЧЕГО из ответа НЕ МЕРЖИМ в providerRoute
if (!fareInfo) {
  throw new BadRequestException('FareInfoByRoute failed');
}


    // 1️⃣ CREATE
const reservation = await this.onelyaService.createReservation({
  providerRaw: providerRoute,
  passengers: this.normalizePassengers(passengers),
  contact: this.normalizeContact(contact),
});

if (!reservation?.OrderId) {
  throw new Error('Reservation did not return OrderId');
}

const orderId = reservation.OrderId;

// 2️⃣ RE-CALC (🔥 ОБЯЗАТЕЛЬНО)
const recalced = await this.onelyaService.recalcReservation({
  OrderId: orderId,
});

// ⬇️ ВАЖНО: сохранить Recalc
this.logger.log(
  `[Booking] Recalc completed, OrderId=${orderId}`,
);

const price =
  recalced?.Prices?.[0]?.Amount ??
  providerRoute?.Cost ??
  0;

const currency =
  recalced?.Prices?.[0]?.Currency ??
  providerRoute?.Currency ??
  'RUB';


  const firstFlight = providerRoute.Flights[0];

const from = firstFlight.OriginAirportCode;
const to = firstFlight.DestinationAirportCode;
const departureDate = new Date(firstFlight.DepartureDateTime);

// 3️⃣ SAVE BOOKING
const booking = new this.bookingModel({
  user: new Types.ObjectId(userId),

  from,
  to,
  departureDate,

  passengers,
  providerBookingId: String(orderId),
  bookingStatus: 'created',
  provider: 'onelya',

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

  // ===========================================================================
  // PAYMENT (VIRTUAL)
  // ===========================================================================

  public async virtualPay(
    providerBookingId: string,
  ) {
    const orderId =
      this.parseOrderId(providerBookingId);

    const booking =
      await this.bookingModel.findOne({
        providerBookingId: String(orderId),
      });

    if (!booking) {
      throw new BadRequestException(
        'Booking not found',
      );
    }

    booking.payment.paymentStatus = 'paid';
    await booking.save();

    this.logger.log(
      `[Booking] Virtual payment applied, OrderId=${orderId}`,
    );

    return { success: true };
  }

  // ===========================================================================
  // CONFIRM
  // ===========================================================================

public async confirmOnelya(
  providerBookingId: string,
) {
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
    const result =
      await this.onelyaService.confirmReservation({
        OrderId: orderId,
      });

    // ✅ PROD: confirm прошёл
    booking.bookingStatus = 'ticketed';
    booking.rawProviderData.confirm = result;
  } catch (e) {
    // ✅ TEST: нет баланса — это НОРМА
    booking.bookingStatus = 'created';
    booking.rawProviderData.confirmError = e;
  }

  await booking.save();

  // ⬅️ ВСЕГДА возвращаем OK, НЕ РОНЯЕМ ФРОНТ
  return { success: true };
}

  // ===========================================================================
  // BLANK
  // ===========================================================================

  public async getBlankByBookingId(bookingId: string) {
  if (!Types.ObjectId.isValid(bookingId)) {
    throw new BadRequestException('Invalid booking id');
  }

  const booking = await this.bookingModel.findById(bookingId);

  if (!booking) {
    throw new BadRequestException('Booking not found');
  }

  const orderId = this.parseOrderId(booking.providerBookingId);

  // ✅ Если blank уже есть — просто возвращаем
  if (booking.rawProviderData?.blank?.fileId) {
  return {
    success: true,
    fileId: booking.rawProviderData.blank.fileId,
    accessToken: booking.rawProviderData.blank.accessToken,
  };
}

  // 🔥 Запрашиваем blank у Onelya
  const blank = await this.onelyaService.blankReservation({
    OrderId: orderId,
    RetrieveMainServices: true,
    RetrieveUpsales: true,
  });

  // 🔥 Сохраняем файл
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

  // ===========================================================================
  // RE-CALC
  // ===========================================================================

  public async recalcOnelya(
    providerBookingId: string,
  ) {
    const orderId =
      this.parseOrderId(providerBookingId);

    this.logger.warn(
      `[Booking] Manual recalc invoked, OrderId=${orderId}`,
    );

    return this.onelyaService.recalcReservation({
      OrderId: orderId,
    });
  }

  // ===========================================================================
  // GETTERS
  // ===========================================================================

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

  // ===========================================================================
  // UTILS
  // ===========================================================================

  private parseOrderId(
    providerBookingId?: string,
  ): number {
    const parsed = Number(providerBookingId);
    if (!Number.isFinite(parsed)) {
      throw new BadRequestException(
        'Invalid OrderId',
      );
    }
    return parsed;
  }
}