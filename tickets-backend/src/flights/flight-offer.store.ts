import { randomUUID } from 'crypto';

interface StoredOffer {
  providerRaw: any;
  amount: number;
  currency: string;
  createdAt: number;
}

class FlightOfferStore {
  private store = new Map<string, StoredOffer>();

  save(route: any, amount = 0, currency = 'RUB'): string {
    const offerId = randomUUID();

    this.store.set(offerId, {
      providerRaw: route,
      amount,
      currency,
      createdAt: Date.now(),
    });

    return offerId;
  }

  get(offerId: string): StoredOffer | undefined {
    return this.store.get(offerId);
  }

  delete(offerId: string) {
    this.store.delete(offerId);
  }
}

export const flightOfferStore = new FlightOfferStore();