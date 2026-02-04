export interface FlightOffer {
  offerId: string;

  providerRoute: any;
  providerRaw: any;

  passengers?: {
  adults: number;
  children: number;
  infants: number;
};

  brandFares?: any[] | null;
  __brandFareFlights?: any[];
}

class FlightOfferStore {
  private store = new Map<string, FlightOffer>();

  save(data: FlightOffer) {
    this.store.set(String(data.offerId), data);
  }

  get(offerId: string): FlightOffer | undefined {
    return this.store.get(String(offerId));
  }

  delete(offerId: string) {
    this.store.delete(String(offerId));
  }
}

export const flightOfferStore = new FlightOfferStore();