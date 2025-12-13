export function buildProviderRawWithSelectedBrandFare(
      providerRaw: any,
      selectedBrandId: string,
    ) {
      if (!providerRaw?.BrandFares?.length) {
        throw new Error('BrandFares not found in ProviderRaw');
      }
    
      const selected = providerRaw.BrandFares.find(
        (bf: any) =>
          bf?.BrandFareFlights?.[0]?.BrandedFareInfo?.GdsBrandId === selectedBrandId,
      );
    
      if (!selected) {
        throw new Error(`BrandFare ${selectedBrandId} not found`);
      }
    
      return {
        ...providerRaw,
        BrandFares: [selected],
      };
    }