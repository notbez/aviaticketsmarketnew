class FlightOfferStore {
  private store = new Map<string, any>();

  save(route: any) {
    // ВАЖНО: ключ = route.Id от Onelya
    this.store.set(String(route.Id), route);
  }

  get(offerId: string): any | undefined {
    return this.store.get(String(offerId));
  }

  delete(offerId: string) {
    this.store.delete(String(offerId));
  }
}

export const flightOfferStore = new FlightOfferStore();