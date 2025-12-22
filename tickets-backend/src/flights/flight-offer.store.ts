class FlightOfferStore {
  private store = new Map<string, any>();

  save(data: {
    offerId: string;
    providerRaw: any;
    amount: number;
    currency: string;
    meta?: {
      passengers: number;
      serviceClass: string;
    };
  }) {
    this.store.set(String(data.offerId), data);
  }

  get(offerId: string) {
    return this.store.get(String(offerId));
  }

  delete(offerId: string) {
    this.store.delete(String(offerId));
  }
}

export const flightOfferStore = new FlightOfferStore();