export interface FlightOffer {
      id: string; // UUID
      provider: 'onelya';
      providerRaw: any; // ВСЁ что вернул Onelya по конкретному рейсу
      price: number;
      currency: string;
      createdAt: string;
    }