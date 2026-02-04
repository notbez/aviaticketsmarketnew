
import { Injectable, Logger } from '@nestjs/common';
import { OnelyaService } from '../onelya/onelya.service';
import {
  RoutePricingRequest,
  RoutePricingSegment,
} from '../onelya/dto/avia-search.dto';
import { flightOfferStore } from './flight-offer.store';
import { randomUUID } from 'crypto';

/**
 * Flight search and booking service
 * Handles flight search, fare information, and brand fare retrieval
 * TODO: Add caching layer for frequently searched routes
 */
@Injectable()
export class FlightsService {
  private readonly logger = new Logger(FlightsService.name);

  constructor(private readonly onelyaService: OnelyaService) {}

  /**
   * Search for available flights
   * @param payload Search parameters including origin, destination, dates, passengers
   * @returns Flight search results with pricing and availability
   */
  async search(payload: any) {
    this.logger.log('=== FLIGHTS SEARCH STARTED (RoutePricing) ===');
    this.logger.debug(`Payload received: ${JSON.stringify(payload)}`);

    const origin = (payload?.origin || payload?.from || '').toString().trim().toUpperCase();
    const destination = (payload?.destination || payload?.to || '').toString().trim().toUpperCase();
    const departureDateRaw = payload?.departureDate || payload?.date || null;
    const returnDateRaw = payload?.returnDate || null;

    const pax = payload?.passengers ?? {};
    const adults = this.toInt(
      pax?.adults ?? payload?.AdultQuantity ?? payload?.passengers ?? 1,
      1,
    );
    const children = this.toInt(
      pax?.children ?? payload?.ChildQuantity ?? 0,
      0,
    );
    const infants = this.toInt(
      pax?.infants ?? payload?.BabyWithoutPlaceQuantity ?? 0,
      0,
    );

    if (infants > adults) {
      throw new Error('Количество младенцев не может превышать количество взрослых');
    }
    if (adults + children > 7) {
      throw new Error('Максимум 7 пассажиров с местом');
    }
    const serviceClass = (payload?.serviceClass || payload?.ServiceClass || 'Economic').toString();
    const tripType = (payload?.tripType || 'oneway').toString();
    const airlineCodes = this.normalizeArray(payload?.airlineCodes) || undefined;
    const directOnly = !!payload?.directOnly;

    if (!origin || !destination || !departureDateRaw) {
      this.logger.warn('Missing required search params (origin/destination/departureDate). Returning empty results.');
      return { Routes: [], results: [], mock: false, message: 'Недостаточно параметров поиска' };
    }

    const formatForOnelya = (dRaw?: string | Date | null) => {
      if (!dRaw) return null;
      try {
        const d = new Date(dRaw);
        if (isNaN(d.getTime())) return null;
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}T00:00:00`;
      } catch {
        return null;
      }
    };

    const depDate = formatForOnelya(departureDateRaw);
    if (!depDate) {
      this.logger.warn(`Invalid departure date: ${departureDateRaw}`);
      return { Routes: [], results: [], mock: false, message: 'Некорректная дата вылета' };
    }

    const segments: RoutePricingSegment[] = [
      {
        OriginCode: origin,
        DestinationCode: destination,
        DepartureDate: depDate,
        DepartureTimeFrom: null,
        DepartureTimeTo: null,
      },
    ];

    if (tripType === 'roundtrip' && returnDateRaw) {
      const retDate = formatForOnelya(returnDateRaw);
      if (retDate) {
        segments.push({
          OriginCode: destination,
          DestinationCode: origin,
          DepartureDate: retDate,
          DepartureTimeFrom: null,
          DepartureTimeTo: null,
        });
      }
    }

    const routeReq: RoutePricingRequest = {
      AdultQuantity: adults,
      ChildQuantity: children,
      BabyWithoutPlaceQuantity: infants,
      BabyWithPlaceQuantity: 0,
      YouthQuantity: 0,
      SeniorQuantity: 0,
      ServiceClass: serviceClass,
      AirlineCodes: airlineCodes,
      DirectOnly: directOnly,
      Segments: segments,
      DiscountCodes: null,
      PriceFilter: 'LowFare',
    };

    this.logger.log(`[Onelya] Starting RoutePricing request: ${origin} → ${destination}`);
    this.logger.debug(`[Onelya] RoutePricing request body: ${JSON.stringify(routeReq, null, 2)}`);

    const startTime = Date.now();
    let routeResp: any = null;

    try {
      routeResp = await this.onelyaService.routePricing(routeReq);
      this.logger.debug(
        '[DEBUG][RoutePricing][FIRST ROUTE]',
        JSON.stringify(routeResp?.Routes?.[0], null, 2),
      );
      const duration = Date.now() - startTime;
      this.logger.log(`[Onelya] RoutePricing completed in ${duration}ms, routes: ${routeResp?.Routes?.length || 0}`);
    } catch (err) {
      const duration = Date.now() - startTime;
      this.logger.error(
        `[Onelya] RoutePricing failed after ${duration}ms`,
        err,
      );
      return {
        Routes: [],
        results: [],
        mock: false,
        noResults: true,
        message: 'Рейсы не найдены. Пожалуйста, измените параметры поиска.',
      };
    }

    const routes: any[] = routeResp?.Routes || [];

    if (!routes.length) {
      this.logger.log('[Onelya] No routes found for given search params');
      return {
        Routes: [],
        results: [],
        mock: false,
        noResults: true,
        message: 'Рейсы не найдены. Пожалуйста, измените параметры поиска.',
      };
    }

    const enrichedRoutes = routes.map(providerRoute => {
      const offerId = randomUUID();
      const firstFlight = providerRoute?.Segments?.[0]?.Flights?.[0];

      const providerRaw = {
        Gds: providerRoute.Gds,
        Flights: providerRoute.Segments.flatMap((segment, segmentIndex) =>
          segment.Flights.map(f => ({
            MarketingAirlineCode: f.MarketingAirlineCode,
            OperatingAirlineCode: f.OperatingAirlineCode,
            FlightNumber: f.FlightNumber,
            OriginAirportCode: f.OriginAirportCode,
            DestinationAirportCode: f.DestinationAirportCode,
            DepartureDateTime: f.DepartureDateTime,
            ArrivalDateTime: f.ArrivalDateTime,
            ServiceClass: f.ServiceClass,
            ServiceSubclass: f.ServiceSubclass ?? f.Subclass,
            FareCode: f.FareCode,
            FlightGroup: segmentIndex,
          })),
        ),
      };

      flightOfferStore.save({
        offerId,
        providerRaw,
        providerRoute,
        passengers: {
          adults,
          children,
          infants,
        },
      });

      return {
        providerRoute,
        routeForFrontend: {
          ...providerRoute,
          __offerId: offerId,
        },
      };
    });
    const cards = enrichedRoutes
      .filter(r => r.routeForFrontend?.__offerId)
      .map((enriched, idx) =>
        this.routeToCard(enriched.routeForFrontend, idx),
      );

    this.logger.log(`[Onelya] Transformed to ${cards.length} flight cards`);

    return {
      Routes: enrichedRoutes,
      results: cards,
      mock: false,
    };
  }

  /**
   * Transform route data into frontend card format
   * @param route Provider route data
   * @param idx Route index
   * @returns Formatted flight card data
   */
  private routeToCard(route: any, idx: number) {
    const fares = [];
    const segments = this.extractSegments(route);
    const outboundSegments = segments[0] ? [segments[0]] : [];
    const inboundSegments = segments[1] ? [segments[1]] : [];

    const outboundFirstFlight = outboundSegments?.[0]?.flights?.[0] || null;
    const outboundLastFlight =
      outboundSegments?.[outboundSegments.length - 1]?.flights?.slice(-1)[0] || null;
    const inboundFirstFlight = inboundSegments?.[0]?.flights?.[0] || null;
    const inboundLastFlight =
      inboundSegments?.[inboundSegments.length - 1]?.flights?.slice(-1)[0] || null;

    const price =
      route?.Cost ??
      route?.CheapestPrice ??
      route?.Prices?.[0]?.Amount ??
      null;

    return {
      id: route.__offerId,
      providerRouteId: route.Id,
      offerId: route.__offerId,
      price: Number.isFinite(Number(price)) ? Number(price) : null,
      currency: route?.Currency || 'RUB',
      fares,
      outbound: {
        segments: outboundSegments,
        from: outboundFirstFlight?.origin || null,
        to: outboundLastFlight?.destination || null,
        departTime: outboundFirstFlight?.departureDateTime || null,
        arrivalTime: outboundLastFlight?.arrivalDateTime || null,
      },
      inbound:
        inboundSegments.length > 0
          ? {
              segments: inboundSegments,
              from: inboundFirstFlight?.origin || null,
              to: inboundLastFlight?.destination || null,
              departTime: inboundFirstFlight?.departureDateTime || null,
              arrivalTime: inboundLastFlight?.arrivalDateTime || null,
            }
          : null,
      duration: route?.Duration || null,
    };
  }

  /**
   * Extract and normalize flight segments from route data
   * @param route Raw route data from provider
   * @returns Normalized segment data with flight information
   */
  private extractSegments(route: any) {
    if (!Array.isArray(route?.Segments)) return [];

    return route.Segments.map((segment: any) => {
      const flights = Array.isArray(segment.Flights) ? segment.Flights.map((f: any) => ({
        marketingAirline: f.MarketingAirlineCode || f.MarketingAirline || null,
        operatingAirline: f.OperatingAirlineCode || f.OperatingAirline || null,
        airlineCode: f.MarketingAirlineCode || null,
        flightNumber: `${(f.MarketingAirlineCode || '')} ${f.FlightNumber || ''}`.trim(),
        origin: f.OriginAirportCode || segment.OriginCode || null,
        destination: f.DestinationAirportCode || segment.DestinationCode || null,
        departureDateTime: f.DepartureDateTime || f.DepartureDate || null,
        arrivalDateTime: f.ArrivalDateTime || f.ArrivalDate || null,
        duration: f.FlightDuration || null,
        serviceClass: f.ServiceClass || null,
        cabin: f.ServiceSubclass || null,
        availableSeats: f.AvailablePlaceQuantity ?? null,
        fare: f.FareDescription ?? null,
      })) : [];

      return {
        id: `${segment.OriginCode || 'seg'}-${segment.DestinationCode || 'seg'}`,
        origin: flights[0]?.origin || null,
        destination: flights[flights.length - 1]?.destination || null,
        flights,
      };
    });
  }

  /**
   * Retrieve brand fares and fare rules for a specific flight offer
   * @param payload Object containing offerId
   * @returns Combined brand fare data with pricing and rules
   */
  async getBrandFares(payload: { offerId: string }) {
    this.logger.log('=== FLIGHTS BRAND FARES + FARE INFO STARTED ===');

    const offer = flightOfferStore.get(payload.offerId);
    if (!offer) {
      throw new Error('Offer not found or expired');
    }

    const pax = offer.passengers ?? { adults: 1, children: 0, infants: 0 };
    const adults = pax.adults ?? 1;
    const children = pax.children ?? 0;
    const infants = pax.infants ?? 0;

    const providerRoute = offer.providerRoute;
    const flights = providerRoute.Segments.flatMap(
      (segment, segmentIndex) =>
        segment.Flights.map(f => ({
          ...f,
          FlightGroup: segmentIndex,
        })),
    );

    const brandResp = await this.onelyaService.brandFarePricing({
      Gds: providerRoute.Gds,
      AdultQuantity: adults,
      ChildQuantity: children,
      BabyWithoutPlaceQuantity: infants,
      BabyWithPlaceQuantity: 0,
      Flights: flights.map(f => ({
        MarketingAirlineCode: f.MarketingAirlineCode,
        OperatingAirlineCode: f.OperatingAirlineCode,
        FlightNumber: f.FlightNumber,
        OriginAirportCode: f.OriginAirportCode,
        DestinationAirportCode: f.DestinationAirportCode,
        DepartureDateTime: f.DepartureDateTime,
        ArrivalDateTime: f.ArrivalDateTime,
        ServiceClass: f.ServiceClass,
        ServiceSubclass: f.ServiceSubclass ?? f.Subclass,
        FareCode: f.FareCode,
        FlightGroup: f.FlightGroup,
      })),
    });

    const fareInfoResp = await this.onelyaService.fareInfoByRoute({
      Gds: providerRoute.Gds,
      Flights: flights.map(f => ({
        MarketingAirlineCode: f.MarketingAirlineCode,
        OperatingAirlineCode: f.OperatingAirlineCode,
        FlightNumber: f.FlightNumber,
        OriginAirportCode: f.OriginAirportCode,
        DestinationAirportCode: f.DestinationAirportCode,
        DepartureDateTime: f.DepartureDateTime,
        ServiceClass: f.ServiceClass,
        ServiceSubclass: f.ServiceSubclass ?? f.Subclass,
        FareCode: f.FareCode,
        FlightGroup: f.FlightGroup,
      })),
      FlightIndex: 0,
      AdultQuantity: adults,
      ChildQuantity: children,
      BabyWithoutPlaceQuantity: infants,
      BabyWithPlaceQuantity: 0,
    });

    const rulesText = fareInfoResp?.Text ?? null;

    const brandFares = (brandResp?.BrandFares ?? []).map((bf, idx) => {
      const flight = bf.BrandFareFlights?.[0];

      return {
        title: flight?.BrandedFareInfo?.BrandName ?? `Тариф ${idx + 1}`,
        brandId: flight?.BrandedFareInfo?.GdsBrandId ?? null,
        amount: bf?.Cost ?? bf?.Prices?.[0]?.Amount ?? null,
        currency: 'RUB',
        baggage: flight?.FareDescription?.BaggageInfo?.Description ?? null,
        carryOn: flight?.FareDescription?.CarryOnBaggageInfo?.Description ?? null,
        meal: flight?.FareDescription?.MealInfo?.Description ?? null,
        refund: flight?.FareDescription?.RefundInfo?.Description ?? rulesText,
        exchange: flight?.FareDescription?.ExchangeInfo?.Description ?? rulesText,

        raw: bf,
      };
    });

    offer.brandFares = brandFares;
    return brandFares;
  }

  /**
   * Get detailed fare information for a specific flight
   * @param payload Flight and passenger details
   * @returns Detailed fare rules and pricing information
   */
  async getFareInfo(payload: any) {
    this.logger.log('=== FLIGHTS GET FARE INFO STARTED ===');
    this.logger.debug(`Payload: ${JSON.stringify(payload)}`);

    const providerRoute = payload?.route || payload?.providerRaw;
    if (!providerRoute) {
      this.logger.warn('getFareInfo: provider route not provided');
      return { error: true, message: 'Нет данных маршрута для получения информации о тарифах' };
    }

    const segmentIndex = typeof payload.segmentIndex === 'number' ? payload.segmentIndex : 0;
    const flightIndex = typeof payload.flightIndex === 'number' ? payload.flightIndex : 0;
    const pax = payload?.passengers ?? { adults: 1, children: 0, infants: 0 };
    const adults = this.toInt(pax.adults ?? 1, 1);
    const children = this.toInt(pax.children ?? 0, 0);
    const infants = this.toInt(pax.infants ?? 0, 0);
    const serviceClass = payload?.serviceClass || payload?.ServiceClass || 'Economic';
    const tariff = payload?.tariff || payload?.Tariff || null;

    const segment = (providerRoute?.Segments && providerRoute.Segments[segmentIndex]) || null;
    if (!segment) {
      this.logger.warn('getFareInfo: segment not found in provider route');
      return { error: true, message: 'Сегмент не найден' };
    }
    const flight = (segment?.Flights && segment.Flights[flightIndex]) || null;
    if (!flight) {
      this.logger.warn('getFareInfo: flight not found in segment');
      return { error: true, message: 'Рейс не найден' };
    }

    const fareFlights: any[] = [];
    const fareFlightReq: any = {
      MarketingAirlineCode: flight.MarketingAirlineCode || flight.marketingAirline,
      OperatingAirlineCode: flight.OperatingAirlineCode || flight.operatingAirline || null,
      FlightNumber: flight.FlightNumber || flight.FlightNumber || null,
      OriginAirportCode: flight.OriginAirportCode || flight.origin || segment.OriginCode || null,
      DestinationAirportCode: flight.DestinationAirportCode || flight.destination || segment.DestinationCode || null,
      DepartureDateTime: flight.DepartureDateTime || flight.DepartureDate || null,
      ServiceClass: flight.ServiceClass || serviceClass,
      ServiceSubclass: flight.ServiceSubclass || flight.Subclass || null,
      FareCode: flight.FareCode || null,
      BrandId: (flight.BrandedFareInfo && flight.BrandedFareInfo.BrandId) || flight.BrandId || null,
      FareAdditionalTextInfo: flight.FareAdditionalTextInfo || null,
      FlightGroup: flight.FlightGroup || 0,
    };

    fareFlights.push(fareFlightReq);


    const fareInfoReq = {
      Gds: providerRoute?.Gds || providerRoute?.GDS || null,
      Flights: fareFlights,
      FlightIndex: 0,
      Tariff: tariff || providerRoute?.Tariff || undefined,
      AdultQuantity: adults,
      ChildQuantity: children,
      BabyWithoutPlaceQuantity: infants,
      BabyWithPlaceQuantity: 0,
      YouthQuantity: 0,
      SeniorQuantity: 0,
    };

    this.logger.debug(`[Onelya] FareInfoByRoute request: ${JSON.stringify(fareInfoReq, null, 2)}`);

    try {
      const start = Date.now();
      const res = await this.onelyaService.fareInfoByRoute(fareInfoReq);
      const duration = Date.now() - start;
      this.logger.log(`[Onelya] FareInfoByRoute completed in ${duration}ms`);
      this.logger.debug(`[Onelya] FareInfoByRoute response size: ${this.safeSize(res)}`);

      const parsed = this.parseFareInfoResponse(res);
      return { error: false, raw: res, parsed };
    } catch (err) {
      this.logger.error('FareInfoByRoute failed', err);
      return { error: true, message: err?.message || 'FareInfo failed', details: err?.response ?? err };
    }
  }

  /**
   * Parse and normalize fare information response from provider
   * @param res Raw fare info response from Onelya API
   * @returns Structured fare information with rules and pricing
   */
  private parseFareInfoResponse(res: any) {
    const result: any = {
      text: res?.Text || null,
      fares: [] as any[],
      raw: res,
    };

    const candidates = res?.FareInfos || res?.Fares || res?.BrandFares || res?.FareInfoItems || null;

    if (Array.isArray(candidates) && candidates.length > 0) {
      candidates.forEach((fi: any) => {
        const fareObj: any = {
          brandName: fi?.BrandName || fi?.Brand?.Name || fi?.BrandedFareInfo?.BrandName || null,
          fareFamily: fi?.FareFamily || fi?.FareFamilyName || null,
          fareCode: fi?.FareCode || fi?.Code || null,
          amount: fi?.Price?.Amount ?? fi?.Amount ?? fi?.PriceAmount ?? null,
          currency: fi?.Price?.Currency ?? fi?.Currency ?? null,
          baggage: fi?.BaggageInfo ?? fi?.Baggage ?? null,
          carryOn: fi?.CarryOnBaggageInfo ?? fi?.CarryOn ?? null,
          meal: fi?.MealInfo ?? fi?.Meal ?? null,
          refund: fi?.RefundInfo ?? fi?.Refund ?? null,
          exchange: fi?.ExchangeInfo ?? fi?.Exchange ?? null,
          rulesText: fi?.RulesText || fi?.Text || null,
          raw: fi,
        };
        result.fares.push(fareObj);
      });
    } else {
      const fd = res?.FareDescription || res?.FareInfo || res?.Fare;
      result.fares.push({
        brandName: fd?.BrandedFareInfo?.BrandName || fd?.Brand || null,
        fareFamily: fd?.FareFamily || null,
        fareCode: fd?.FareCode || null,
        amount: null,
        currency: null,
        baggage: fd?.BaggageInfo || fd?.Baggage || null,
        carryOn: fd?.CarryOnBaggageInfo || null,
        meal: fd?.MealInfo || null,
        refund: fd?.RefundInfo || null,
        exchange: fd?.ExchangeInfo || null,
        rulesText: res?.Text || null,
        raw: res,
      });
    }

    return result;
  }
  /**
   * Utility methods for data processing and validation
   */
  private toInt(value: unknown, fallback: number): number {
    const parsed = parseInt(String(value ?? ''), 10);
    return Number.isNaN(parsed) ? fallback : parsed;
  }

  private normalizeArray(value: unknown): string[] | undefined {
    if (!value) {
      return undefined;
    }
    if (Array.isArray(value)) {
      return value.filter(Boolean) as string[];
    }
    if (typeof value === 'string') {
      return value
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean);
    }
    return undefined;
  }

  private formatDate(dt: any) {
    if (!dt) return null;
    const d = new Date(dt);
    if (isNaN(d.getTime())) return null;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T00:00:00`;
  }

  private safeSize(value: any): number {
    if (!value) return 0;
    if (Array.isArray(value)) return value.length;
    return typeof value === 'number' ? value : 0;
  }
}