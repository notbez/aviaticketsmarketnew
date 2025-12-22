import { Injectable, Logger } from '@nestjs/common';
import { OnelyaService } from '../onelya/onelya.service';
import {
  RoutePricingRequest,
  RoutePricingResponse,
  RoutePricingSegment,
  BrandFarePricingRequest,
  BrandFarePricingResponse,
} from '../onelya/dto/avia-search.dto';
import { flightOfferStore } from './flight-offer.store';
import { randomUUID } from 'crypto'; 

@Injectable()
export class FlightsService {
  private readonly logger = new Logger(FlightsService.name);

  constructor(private readonly onelyaService: OnelyaService) {}

  /**
   * SEARCH
   * 1) вызываем RoutePricing (обязательно по схеме Onelya)
   * 2) для каждого route (если нужно и возможно) вызываем BrandFarePricing
   * 3) объединяем результаты -> выдаём массив карточек (совместимый с фронтом)
   *
   * payload ожидает: {
   *   origin, destination, departureDate, returnDate?, passengers?,
   *   serviceClass?, tariff? (не передавать при поиске), tripType?, airlineCodes?, directOnly?
   * }
   */
  async search(payload: any) {
    this.logger.log('=== FLIGHTS SEARCH STARTED (RoutePricing + BrandFarePricing) ===');
    this.logger.debug(`Payload received: ${JSON.stringify(payload)}`);

    // Нормализация входа
    const origin = (payload?.origin || payload?.from || '').toString().trim().toUpperCase();
    const destination = (payload?.destination || payload?.to || '').toString().trim().toUpperCase();
    const departureDateRaw = payload?.departureDate || payload?.date || null;
    const returnDateRaw = payload?.returnDate || null;
    const passengers = this.toInt(payload?.passengers ?? payload?.AdultQuantity ?? 1, 1);
    const serviceClass = (payload?.serviceClass || payload?.ServiceClass || 'Economic').toString();
    // Не передаём Tariff при поиске (это было причиной того, что приходил только один тариф)
    const tripType = (payload?.tripType || 'oneway').toString(); // 'oneway' | 'roundtrip'
    const airlineCodes = this.normalizeArray(payload?.airlineCodes) || undefined;
    const directOnly = !!payload?.directOnly;

    if (!origin || !destination || !departureDateRaw) {
      this.logger.warn('Missing required search params (origin/destination/departureDate). Returning empty results.');
      return { Routes: [], results: [], mock: false, message: 'Недостаточно параметров поиска' };
    }

    // Форматирование даты для Onelya (YYYY-MM-DDT00:00:00)
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

    // Сборка сегментов (RoutePricing требует массив)
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

    // Собираем тело RoutePricingRequest
    const routeReq: RoutePricingRequest = {
      AdultQuantity: passengers,
      ChildQuantity: 0,
      BabyWithoutPlaceQuantity: 0,
      BabyWithPlaceQuantity: 0,
      YouthQuantity: 0,
      SeniorQuantity: 0,
      // Tariff НЕ отправляем при поиске (убрали ошибку)
      Tariff: undefined as any,
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
      const duration = Date.now() - startTime;
      this.logger.log(`[Onelya] RoutePricing completed in ${duration}ms, routes: ${routeResp?.Routes?.length || 0}`);
    } catch (err) {
      const duration = Date.now() - startTime;
      this.logger.error(`[Onelya] RoutePricing failed after ${duration}ms`, err);
      // fallback
      const fallbackResults = this.getFallbackFlights();
      this.logger.warn('[Onelya] Returning fallback demo flights');
      return {
        error: false,
        mock: true,
        results: fallbackResults,
        message: 'Используются демо-данные (RoutePricing failed)',
      };
    }

    // Если RoutePricing вернул маршруты — пытаемся дополнить их BrandFarePricing (опционально)
    const routes: any[] = routeResp?.Routes || [];
    const enrichedRoutes: any[] = [];

    // Выполняем BrandFarePricing для каждого route, но аккуратно — если провайдер не поддерживает/ошибка — оставляем исходный route
    // Используем последовательные вызовы или ограничиваем параллельность — здесь сделаем controlled parallelism (batch 5)
    const BATCH_SIZE = 5;

    for (let i = 0; i < routes.length; i += BATCH_SIZE) {
      const batch = routes.slice(i, i + BATCH_SIZE);
      const promises = batch.map(async (route: any, idx: number) => {
        try {
          const brandReq: BrandFarePricingRequest = this.buildBrandFareRequestForRoute(route, passengers, serviceClass);
          this.logger.debug(`[Onelya] BrandFarePricing request for route index ${i + idx}: ${JSON.stringify(brandReq)}`);
          const br = await this.onelyaService.brandFarePricing(brandReq);
          // Возвращаем объединённый объект (route + brand fares)
          return this.mergeRouteWithBrandFares(route, br);
        } catch (err) {
          this.logger.warn(`[Onelya] BrandFarePricing failed for route index ${i + idx}: ${err?.message || err}`);
          // fallback: возвращаем исходный route без брендированных тарифов
          return this.mergeRouteWithBrandFares(route, null);
        }
      });

      // дождёмся текущей пачки
      const resolved = await Promise.all(promises);
      enrichedRoutes.push(...resolved);
    }

    enrichedRoutes.forEach(route => {
      const offerId = randomUUID(); // генерируем уникальный UUID
    
      flightOfferStore.save({
        offerId,
        providerRaw: route,
        amount: route?.CheapestPrice ?? route?.Cost ?? 0,
        currency: route?.Currency ?? 'RUB',
      });
    
      route.__offerId = offerId; // для карточки фронта
    });
    // Теперь формируем карточки для фронта
    const cards = enrichedRoutes.map((route: any, idx: number) =>
      this.routeToCard(route as any, idx),
    );

    this.logger.log(`[Onelya] Transformed to ${cards.length} flight cards`);

    // Возвращаем сразу и raw Routes (enriched) и cards
    return {
      Routes: enrichedRoutes,
      results: cards,
      mock: false,
    };
  }

  /**
   * Формирует BrandFarePricingRequest для конкретного route (использует flights внутри route)
   * Если route уже содержит BrandFares в ответе — опционально можно не вызывать брандовый поиск.
   */
  private buildBrandFareRequestForRoute(route: any, passengers: number, serviceClass: string): BrandFarePricingRequest {
    // Составляем flights массив из route.Segments -> Flights
    const flightsReq: any[] = [];
    // Для BrandFarePricing требуется список flights (маршрут)
    // Берём все flights из route.Segments и формируем BrandFareFlightRequest элементы (минимально нужные поля)
    if (Array.isArray(route?.Segments)) {
      route.Segments.forEach((segment: any) => {
        if (!Array.isArray(segment.Flights)) return;
        segment.Flights.forEach((f: any) => {
          flightsReq.push({
            MarketingAirlineCode: f.MarketingAirlineCode || f.MarketingAirline,
            FlightNumber: f.FlightNumber,
            OriginAirportCode: f.OriginAirportCode || segment.OriginCode,
            DestinationAirportCode: f.DestinationAirportCode || segment.DestinationCode,
            DepartureDateTime: f.DepartureDateTime || f.DepartureDate,
            ServiceSubclass: f.ServiceSubclass || f.Subclass || null,
            FlightGroup: f.FlightGroup ?? 0,
            ServiceClass: f.ServiceClass || serviceClass,
            Gds: route?.Gds || route?.GDS || null,
            RouteGroup: f.RouteGroup ?? route?.RouteGroup ?? 0,
            FareAdditionalTextInfo: f.FareAdditionalTextInfo || null,
          });
        });
      });
    }

    const brandReq: BrandFarePricingRequest = {
      VariantId: undefined as any, // не обязателен
      Gds: route?.Gds || route?.GDS || undefined,
      AdultQuantity: passengers,
      ChildQuantity: 0,
      BabyWithoutPlaceQuantity: 0,
      BabyWithPlaceQuantity: 0,
      YouthQuantity: 0,
      SeniorQuantity: 0,
      Tariff: undefined as any, // НЕ передаем tariff на этапе поиска
      Flights: flightsReq,
      TreatyCode: null,
      DiscountCodes: null,
      Interface: route?.Interface || null,
    };

    return brandReq;
  }

  /**
   * Объединяет route из RoutePricing и ответ BrandFarePricing (если есть)
   * Результат — enriched route, где:
   * - если есть br (BrandFarePricingResponse) — добавляем br.BrandFares и br.Cost для конкретных тарифов
   * - если br == null — оставляем исходный route
   */
  private mergeRouteWithBrandFares(route: any, br: BrandFarePricingResponse | null) {
    const copy = { ...route };

    if (!br) {
      // При отсутствии brand fare — просто скопируем route как есть
      // но для совместимости с фронтом добавим поле BrandFares = null
      copy.BrandFares = copy.BrandFares || null;
      return copy;
    }

    // Если пришел ответ — перемещаем BrandFares в route.BrandFares
    // BrandFarePricingResponse содержит BrandFares: [...]
    (copy as any).BrandFares = br.BrandFares || br.BrandFares || [];
    // Иногда ответ содержит Cost / Prices — объединяем если нужно
    (copy as any).BrandFarePricingCost = null;
    // Возвращаем оба объекта — route + brand info в BrandFares
    return copy;
  }

  /**
   * Перевод одного enriched route в карточку для фронта
   */
  private routeToCard(route: any, idx: number) {
    // Если есть BrandFares — используем их для формирования fares
    let fares = [];
    if (Array.isArray(route?.BrandFares) && route.BrandFares.length > 0) {
      fares = this.extractBrandFares(route);
    } else {
      // fallback на route.Prices (RoutePricing)
      fares = this.extractPricesAsFares(route);
    }

    // Сборка сегментов и полей совместимых с фронтом
    const segments = this.extractSegments(route);

    const firstSeg = segments[0];
    const lastSeg = segments[segments.length - 1];
    const firstFlight = firstSeg?.flights?.[0] || null;
    const lastFlight = lastSeg?.flights?.slice(-1)[0] || null;

    // Определяем минимальную цену: если route.CheapestPrice есть — берем её; иначе первый fare.amount
    const price =
      route?.Cost ??
      route?.CheapestPrice ??
      (fares.length > 0 ? fares[0].amount : null);

    return {
      id: route.__offerId,
      providerRouteId: route.Id,
      offerId: route.__offerId,
      price: price ? Number(price) : null,
      currency: route?.Currency || 'RUB',
      fares,
      segments,
      from: firstSeg?.origin || null,
      to: lastSeg?.destination || null,
      departTime: firstFlight?.departureDateTime || null,
      arrivalTime: lastFlight?.arrivalDateTime || null,
      duration: route?.Duration || null,
      stopsCount: Math.max(0, (segments.length - 1)),
    };
  }

  /**
   * Извлекает брендированные тарифы из route.BrandFares в единый формат для фронта
   */
  private extractBrandFares(route: any) {
    const fares: any[] = [];
    if (!Array.isArray(route?.BrandFares)) return fares;
  
    for (const bf of route.BrandFares) {
      const fl = bf?.BrandFareFlights?.[0];
      const desc = fl?.FareDescription;
  
      fares.push({
        title: fl?.BrandedFareInfo?.BrandName || 'Тариф',
        amount: bf?.Cost ?? bf?.Prices?.[0]?.Amount ?? null,
        currency: bf?.Prices?.[0]?.Currency ?? route?.Currency ?? 'RUB',
  
        baggage: desc?.BaggageInfo?.Description ?? null,
        carryOn: desc?.CarryOnBaggageInfo?.Description ?? null,
        meal: desc?.MealInfo?.Description ?? null,
        refund: desc?.RefundInfo?.Description ?? null,
        exchange: desc?.ExchangeInfo?.Description ?? null,
  
        brandId:
          fl?.BrandedFareInfo?.BrandId ??
          fl?.BrandedFareInfo?.GdsBrandId ??
  null,
        raw: bf,
      });
    }
  
    return fares;
  }

  /**
   * Если брендированных тарифов нет — преобразует route.Prices (RoutePricing) в fares
   */
  private extractPricesAsFares(route: any) {
    const fares: any[] = [];
    if (!route?.Prices || !Array.isArray(route.Prices)) return fares;

    // Берём описание тарифа из первого flight (FareDescription), если есть
    const firstSegment = route?.Segments?.[0];
    const firstFlight = firstSegment?.Flights?.[0] || null;
    const fareDesc = firstFlight?.FareDescription || {};

    route.Prices.forEach((p: any) => {
      fares.push({
        title: p?.Fare || fareDesc?.BrandedFareInfo?.BrandName || 'Тариф',
        amount: p?.Total ?? p?.Amount ?? null,
        currency: route?.Currency || 'RUB',

        baggage: fareDesc?.BaggageInfo?.Description || null,
        carryOn: fareDesc?.CarryOnBaggageInfo?.Description || null,
        refund: fareDesc?.RefundInfo?.Description || null,
        exchange: fareDesc?.ExchangeInfo?.Description || null,
        meal: fareDesc?.MealInfo?.Description || null,

        passengerType: p?.PassengerType,
        quantity: p?.Quantity,
        raw: p,
      });
    });

    return fares;
  }

  /**
   * Конвертация сегментов в формат для фронта
   */
  private extractSegments(route: any) {
    if (!Array.isArray(route?.Segments)) return [];

    return route.Segments.map((segment: any) => {
      const flights = Array.isArray(segment.Flights) ? segment.Flights.map((f: any) => ({
        marketingAirline: f.MarketingAirlineCode,
        operatingAirline: f.OperatingAirlineCode,
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
   * getFareInfo — оставляем твою логику почти без изменений, она вызывается при клике на тариф,
   * чтобы получить подробные правила/price breakdown для выбранного рейса/тарифа.
   *
   * Ожидаемый payload:
   * {
   *   route: <provider route object> OR providerRaw (полный объект Routes[routeIndex]),
   *   segmentIndex: number,
   *   flightIndex: number,
   *   tariff?: string,
   *   passengers?: number,
   *   serviceClass?: string,
   * }
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
    const passengers = this.toInt(payload?.passengers ?? 1, 1);
    const serviceClass = payload?.serviceClass || payload?.ServiceClass || 'Economic';
    const tariff = payload?.tariff || payload?.Tariff || null;

    // Берём сегмент и flight из providerRoute
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

    // Строим массив Flights для FareInfoByRouteRequest (по документации)
    const fareFlights: any[] = [];

    // окружающие поля, которые Onelya может спросить
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

    // Составляем запрос FareInfoByRouteRequest
    const fareInfoReq = {
      Gds: providerRoute?.Gds || providerRoute?.GDS || null,
      Flights: fareFlights,
      FlightIndex: 0,
      Tariff: tariff || providerRoute?.Tariff || undefined,
      AdultQuantity: passengers,
      ChildQuantity: 0,
      BabyWithoutPlaceQuantity: 0,
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
   * parseFareInfoResponse
   * Универсальный парсер ответа Onelya FareInfoByRoute -> удобный JSON для фронта
   */
  private parseFareInfoResponse(res: any) {
    const result: any = {
      text: res?.Text || null,
      fares: [] as any[],
      raw: res,
    };

    // Возможные поля с тарифной информацией
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
      // fallback: если нет вложенного массива, попытаемся взять поля из res.FareDescription / res.FareInfo
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
   * Демка для fallback
   */
  private getFallbackFlights(): any[] {
    return [
      {
        id: 'fallback-1',
        price: 24730,
        currency: 'RUB',
        fares: [
          {
            title: 'Эконом - Базовый',
            amount: 24730,
            currency: 'RUB',
            baggage: 'Без багажа',
            carryOn: 'Ручная кладь 10 кг',
            refund: 'Невозвратный',
            exchange: 'Без обмена',
          },
        ],
        segments: [
          {
            id: 'fallback-1-s1',
            origin: 'VKO',
            destination: 'TJM',
            flights: [
              {
                marketingAirline: 'UT',
                flightNumber: 'UT 126',
                origin: 'VKO',
                destination: 'TJM',
                departureDateTime: '2025-12-10T09:30:00',
                arrivalDateTime: '2025-12-10T15:00:00',
                duration: '03:30:00',
                serviceClass: 'Economic',
                availableSeats: 9,
              },
            ],
          },
        ],
        from: 'VKO',
        to: 'TJM',
        departTime: '2025-12-10T09:30:00',
        arrivalTime: '2025-12-10T15:00:00',
        duration: '3ч 30м',
        stopsCount: 1,
        providerRaw: null,
      },
    ];
  }

  /* -----------------------
     Helpers
  ------------------------*/

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

  private buildPricingRoute(route: any) {
    if (!Array.isArray(route?.Segments)) {
      throw new Error('Invalid route: no segments');
    }

    return {
      Segments: route.Segments.map((seg: any) => ({
        Flights: Array.isArray(seg.Flights)
          ? seg.Flights.map((f: any) => ({
              MarketingAirlineCode: f.MarketingAirlineCode,
              OperatingAirlineCode: f.OperatingAirlineCode,
              FlightNumber: f.FlightNumber,
              OriginAirportCode: f.OriginAirportCode,
              DestinationAirportCode: f.DestinationAirportCode,
              DepartureDateTime: f.DepartureDateTime,
              ServiceClass: f.ServiceClass,
              Subclass: f.Subclass ?? f.ServiceSubclass ?? null,
              FareCode: f.FareCode ?? null,
              FlightGroup: f.FlightGroup ?? 0,
              RouteGroup: f.RouteGroup ?? 0,
            }))
          : [],
      })),
    };
  }

  async pricingOffer(payload: {
    route: any;
    brandFare: any;
  }) {
    const { route, brandFare } = payload;
  
    this.logger.log('[Flights] Pricing selected route');
  
    const pricingResult = await this.onelyaService.pricingRoute({
      Route: this.buildPricingRoute(route),
      BrandFare: brandFare,
    });
  
    const offerId = randomUUID();
  
    const cost = (pricingResult as any)?.Cost ?? null;
    const currency = (pricingResult as any)?.Currency ?? 'RUB';
  
    flightOfferStore.save({
      offerId,
      providerRaw: pricingResult,
      amount: cost,
      currency,
    });
  
    return {
      offerId,
      amount: cost,
      currency,
    };
  }
}