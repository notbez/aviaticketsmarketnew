export function buildCleanProviderRaw(
      original: any,
      selectedBrandFare: any,
    ) {
      return {
        ...original,
        BrandFares: [selectedBrandFare],
      };
    }