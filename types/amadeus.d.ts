// Minimal type declaration for the amadeus npm package (no @types available)
declare module 'amadeus' {
  interface AmadeusConfig {
    clientId: string;
    clientSecret: string;
    hostname?: 'test' | 'production';
  }

  interface AmadeusResponse {
    data: unknown;
    meta?: unknown;
  }

  interface FlightOffersSearch {
    get(params: Record<string, string | number>): Promise<AmadeusResponse>;
  }

  interface Shopping {
    flightOffersSearch: FlightOffersSearch;
  }

  class Amadeus {
    constructor(config: AmadeusConfig);
    shopping: Shopping;
  }

  export = Amadeus;
}
