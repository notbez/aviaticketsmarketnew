
import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import {
  BrandFarePricingRequest,
  BrandFarePricingResponse,
  DatePricingRequest,
  DatePricingResponse,
  FareInfoByRouteRequest,
  FareInfoByRouteResponse,
  RoutePricingRequest,
  RoutePricingResponse,
} from './dto/avia-search.dto';
import {
  ReservationCreateRequest,
  ReservationCreateResponse,
  ReservationRecalcRequest,
  ReservationRecalcResponse,
  ReservationConfirmRequest,
  ReservationConfirmResponse,
  ReservationBlankRequest,
  ReservationVoidRequest,
  ReservationVoidResponse,
  ReservationCancelRequest,
  OrderInfoRequest,
  OrderInfoResponse,
  OrderListRequest,
  OrderListResponse,
} from './dto/order-reservation.dto';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const CyrillicToTranslit = require('cyrillic-to-translit-js');

const transliterator = new CyrillicToTranslit();

function toIsoDate(date?: string): string | undefined {
  if (!date) return undefined;

  if (date.includes('-')) return date;

  const parts = date.split('.');
  if (parts.length !== 3) return undefined;

  const [d, m, y] = parts;
  return `${y}-${m}-${d}`;
}

function transliterate(value?: string): string | undefined {
  if (!value) return undefined;
  return transliterator.transform(value).toUpperCase();
}

function mapPassengerToOnelyaCustomer(p: any, index: number) {
  if (!p.firstName || !p.lastName || !p.dateOfBirth) {
    throw new HttpException('Passenger data is incomplete', 400);
  }

  return {
    $type: 'ApiContracts.Order.V1.Reservation.OrderFullCustomerRequest, ApiContracts',

    DocumentNumber: String(p.passportNumber || '').replace(/\D/g, ''),
    DocumentType: p.documentType || 'RussianPassport',
    DocumentValidTill: null,

    CitizenshipCode: p.citizenship || 'RU',
    BirthPlace: null,

    FirstName: transliterate(p.firstName),
    MiddleName: p.middleName ? transliterate(p.middleName) : null,
    LastName: transliterate(p.lastName),

    Sex:
      p.gender === 'M'
        ? 'Male'
        : p.gender === 'F'
        ? 'Female'
        : null,

    Birthday: `${toIsoDate(p.dateOfBirth)}T00:00:00`,
    Index: index + 1,
  };
}

function assertValidProviderRaw(providerRaw: any) {
  if (
    !providerRaw ||
    !Array.isArray(providerRaw.Flights) ||
    providerRaw.Flights.length === 0
  ) {
    throw new HttpException(
      'ProviderRaw must contain Flights',
      400,
    );
  }
}

@Injectable()
export class OnelyaService {
  private readonly logger = new Logger(OnelyaService.name);
  private readonly baseUrl: string;
  private readonly login: string;
  private readonly password: string;
  private readonly pos: string;
  private readonly timeoutMs: number;
  

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl =
      this.configService.get<string>('ONELYA_BASE_URL')?.trim() ||
      'https://api-test.onelya.ru';
    this.login =
      this.configService.get<string>('ONELYA_LOGIN')?.trim() ||
      'trevel_test';
    this.password =
      this.configService.get<string>('ONELYA_PASSWORD') || '5mPaN5KyB!27LN!';
    this.pos =
      this.configService.get<string>('ONELYA_POS')?.trim() || 'trevel_test';
    this.timeoutMs = 180000; // 3 минуты для Onelya API

    if (!this.baseUrl.startsWith('http')) {
      this.logger.warn(
        `ONELYA_BASE_URL "${this.baseUrl}" выглядит некорректным, используются значения по умолчанию`,
      );
    }

    this.logger.log(
      `OnelyaService initialized (baseUrl=${this.baseUrl}, pos=${this.pos})`,
    );
  }

  async routePricing(body: RoutePricingRequest): Promise<RoutePricingResponse> {
    const response = await this.post<RoutePricingRequest, RoutePricingResponse>(
      '/Avia/V1/Search/RoutePricing',
      body,
    );
  
    return response;
  }

  async datePricing(
    body: DatePricingRequest,
  ): Promise<DatePricingResponse> {
    return this.post<DatePricingRequest, DatePricingResponse>(
      '/Avia/V1/Search/DatePricing',
      body,
    );
  }

  async fareInfoByRoute(
    body: FareInfoByRouteRequest,
  ): Promise<FareInfoByRouteResponse> {
    return this.post<FareInfoByRouteRequest, FareInfoByRouteResponse>(
      '/Avia/V1/Search/FareInfoByRoute',
      body,
    );
  }

  async brandFarePricing(
    body: BrandFarePricingRequest,
  ): Promise<BrandFarePricingResponse> {
    return this.post<BrandFarePricingRequest, BrandFarePricingResponse>(
      '/Avia/V1/Search/BrandFarePricing',
      body,
    );
  }

  

async createReservation(body: any) {
  const providerRaw = body.route || body.providerRaw;
  const customers = (body.passengers || []).map((p, i) =>
  mapPassengerToOnelyaCustomer(p, i),
);

  assertValidProviderRaw(providerRaw);

if (!Array.isArray(providerRaw.Flights) || providerRaw.Flights.length === 0) {
  throw new HttpException(
    'providerRaw.Flights is required for Reservation/Create',
    400,
  );
}

const flights = providerRaw.Flights.map(f => ({
  Id: null,

  MarketingAirlineCode: f.MarketingAirlineCode,
  OperatingAirlineCode: f.OperatingAirlineCode,
  FlightNumber: f.FlightNumber,

  OriginAirportCode: f.OriginAirportCode,
  DestinationAirportCode: f.DestinationAirportCode,

  DepartureDateTime: f.DepartureDateTime,
  ArrivalDateTime: f.ArrivalDateTime,

  ServiceSubclass: f.ServiceSubclass,
  FareCode: f.FareCode,

  ...(f.BrandedFareInfo && {
  BrandedFareInfo: {
    BrandName: f.BrandedFareInfo.BrandName,
    GdsBrandNotation: f.BrandedFareInfo.GdsBrandNotation,
    GdsBrandId: f.BrandedFareInfo.GdsBrandId,
  },
}),

  Tariff: f.Tariff ?? undefined,
  Gds: providerRaw.Gds,
  FlightGroup: f.FlightGroup,
}));

// 🔍 DEBUG: проверяем FlightGroup ПЕРЕД Reservation/Create
this.logger.warn(
  '[DEBUG][FLIGHT GROUPS BEFORE CREATE]',
  flights.map(f => ({
    flight: `${f.OriginAirportCode}-${f.DestinationAirportCode}`,
    routeGroup: f.RouteGroup,
    flightNumber: f.FlightNumber,
  })),
);


const reservationItem = {
  $type: 'ApiContracts.Avia.V1.Reservation.AviaReservationRequest, ApiContracts',

  Gds: providerRaw.Gds,
  PricingGds: providerRaw.Gds,
  ServiceClass: providerRaw.ServiceClass ?? 'Economic',

  Flights: flights,

  PaymentMethod: 'Confirm',
  ProviderPaymentForm: 'Cash',

  RelatedBooking: null,
  DiscountCodes: null,
  Interface: null,

  Passengers: body.passengers.map((p, i) => ({
  Category:
    p.customerType === 'Infant'
      ? 'Infant'
      : p.customerType === 'Child'
      ? 'Child'
      : 'Adult',
  Remarks: null,
  AdditionalServices: null,
  OrderCustomerIndex: i + 1,
})),

  Index: 0,
  AgentReferenceId: null,
  AgentPaymentId: null,
  ClientCharge: null,
};



const requestBody: ReservationCreateRequest = {
  ContactPhone: body.contact?.phone?.startsWith('+')
    ? body.contact.phone
    : `+${body.contact?.phone?.replace(/\D/g, '')}`,

  ContactEmails: body.contact?.email
    ? [body.contact.email]
    : ['test@test.ru'],

  RefuseToReceiveAutomaticRoundTripDiscountForRailwayTickets: false,

  Customers: customers,

  ReservationItems: [reservationItem],

  CheckDoubleBooking: true,
  PaymentRemark: null,
  WaitListApplicationId: null,
  PushNotificationUrl: null,
};



  // 🔥 ВОТ СЮДА
  this.logger.warn(
    '[Onelya] FINAL Reservation/Create body',
    JSON.stringify(requestBody, null, 2),
  );

  const response = await this.post<
    ReservationCreateRequest,
    ReservationCreateResponse
  >('/Order/V1/Reservation/Create', requestBody);

  this.logger.log(
    `[Onelya] Reservation created OrderId=${response?.OrderId}`,
  );

  return response;
}
  

  async recalcReservation(
    body: ReservationRecalcRequest,
  ): Promise<ReservationRecalcResponse> {
    return this.post<ReservationRecalcRequest, ReservationRecalcResponse>(
      '/Order/V1/Reservation/Recalc',
      body,
    );
  }

  async confirmReservation(
    body: ReservationConfirmRequest,
  ): Promise<ReservationConfirmResponse> {
    return this.post<ReservationConfirmRequest, ReservationConfirmResponse>(
      '/Order/V1/Reservation/Confirm',
      body,
    );
  }

  async blankReservation(body: ReservationBlankRequest): Promise<{
    buffer: Buffer;
    contentType?: string;
  }> {
    const endpoint = '/Order/V1/Reservation/Blank';
    const url = this.buildUrl(endpoint);
    const headers = this.buildHeaders();

    this.logger.log(`[Onelya] POST ${url} (blank)`);
    this.logger.debug(`[Onelya] Blank request: ${JSON.stringify(body)}`);

    try {
      const response = await firstValueFrom(
        this.httpService.post<ArrayBuffer>(url, body, {
          headers,
          timeout: this.timeoutMs,
          responseType: 'arraybuffer',
        }),
      );

      const contentType = response.headers?.['content-type'];
      this.logger.log(
        `[Onelya] Blank response ${response.status} (${contentType || 'unknown'})`,
      );

      return {
        buffer: Buffer.from(response.data),
        contentType,
      };
    } catch (error) {
      this.handleAxiosError(endpoint, error as AxiosError);
    }
  }

  async voidReservation(
    body: ReservationVoidRequest,
  ): Promise<ReservationVoidResponse> {
    return this.post<ReservationVoidRequest, ReservationVoidResponse>(
      '/Order/V1/Reservation/Void',
      body,
    );
  }

  async cancelReservation(
    body: ReservationCancelRequest,
  ): Promise<Record<string, never>> {
    return this.post<ReservationCancelRequest, Record<string, never>>(
      '/Order/V1/Reservation/Cancel',
      body,
    );
  }

  async orderInfo(body: OrderInfoRequest): Promise<OrderInfoResponse> {
    return this.post<OrderInfoRequest, OrderInfoResponse>(
      '/Order/V1/Info/OrderInfo',
      body,
    );
  }

  async orderList(body: OrderListRequest): Promise<OrderListResponse> {
    return this.post<OrderListRequest, OrderListResponse>(
      '/Order/V1/Info/OrderList',
      body,
    );
  }

  private async post<TRequest, TResponse>(
    endpoint: string,
    body: TRequest,
  ): Promise<TResponse> {
    const url = this.buildUrl(endpoint);
    const headers = this.buildHeaders();

    this.logger.log(`[Onelya] POST ${url}`);

    try {
      const response = await firstValueFrom(
        this.httpService.post<TResponse>(url, body, {
          headers,
          timeout: this.timeoutMs,
          responseType: 'json',
        }),
      );
      this.logger.log(
        `[Onelya] Response ${response.status} ${endpoint} (${this.safeSize(
          response.data,
        )})`,
      );
      return response.data;
    } catch (error) {
      this.handleAxiosError(endpoint, error as AxiosError);
    }
  }

  private buildUrl(endpoint: string): string {
    const base = this.baseUrl.replace(/\/+$/, '');
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${base}${path}`;
  }

  private buildHeaders() {
    const token = Buffer.from(`${this.login}:${this.password}`).toString(
      'base64',
    );
    return {
      Authorization: `Basic ${token}`,
      Pos: this.pos,
      'Content-Type': 'application/json',
      'Accept-Encoding': 'gzip',
    };
  }

  private handleAxiosError(endpoint: string, error: AxiosError): never {
    const status =
      error.response?.status && error.response.status > 0
        ? error.response.status
        : HttpStatus.BAD_GATEWAY;
    const data = error.response?.data;
    const message = `[Onelya] ${endpoint} request failed`;

    this.logger.error(
      `${message}. Status: ${status}.`,
      typeof data === 'string' ? data : JSON.stringify(data),
    );

    throw new HttpException(
      {
        message,
        statusCode: status,
        endpoint,
        error: data ?? error.message,
      },
      status,
    );
  }

  private safeSize(data: unknown): string {
    if (data === undefined || data === null) {
      return 'empty';
    }
    const text =
      typeof data === 'string' ? data : JSON.stringify(data).substring(0, 200);
    return `${text.length}b`;
  }
}

