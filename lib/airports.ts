// Lightweight airport lookup — major airports only.
// Used by the LLM tool to resolve city names / partial strings → IATA codes.
// Zero cost, zero latency, no external API needed.

export interface Airport {
  iata: string;
  name: string;
  city: string;
  country: string;
  aliases: string[]; // common names / nicknames the user might type
}

export const AIRPORTS: Airport[] = [
  // USA
  {
    iata: 'ATL',
    name: 'Hartsfield-Jackson Atlanta International',
    city: 'Atlanta',
    country: 'US',
    aliases: ['atlanta', 'atl'],
  },
  {
    iata: 'LAX',
    name: 'Los Angeles International',
    city: 'Los Angeles',
    country: 'US',
    aliases: ['los angeles', 'la', 'lax'],
  },
  {
    iata: 'ORD',
    name: "O'Hare International",
    city: 'Chicago',
    country: 'US',
    aliases: ['chicago', "o'hare", 'ohare', 'ord'],
  },
  {
    iata: 'MDW',
    name: 'Chicago Midway International',
    city: 'Chicago',
    country: 'US',
    aliases: ['midway', 'chicago midway', 'mdw'],
  },
  {
    iata: 'DFW',
    name: 'Dallas/Fort Worth International',
    city: 'Dallas',
    country: 'US',
    aliases: ['dallas', 'fort worth', 'dfw', 'dallas fort worth'],
  },
  {
    iata: 'DAL',
    name: 'Dallas Love Field',
    city: 'Dallas',
    country: 'US',
    aliases: ['love field', 'dal'],
  },
  {
    iata: 'DEN',
    name: 'Denver International',
    city: 'Denver',
    country: 'US',
    aliases: ['denver', 'den'],
  },
  {
    iata: 'JFK',
    name: 'John F. Kennedy International',
    city: 'New York',
    country: 'US',
    aliases: ['new york', 'jfk', 'kennedy', 'nyc jfk'],
  },
  {
    iata: 'LGA',
    name: 'LaGuardia Airport',
    city: 'New York',
    country: 'US',
    aliases: ['laguardia', 'lga', 'new york lga'],
  },
  {
    iata: 'EWR',
    name: 'Newark Liberty International',
    city: 'Newark',
    country: 'US',
    aliases: ['newark', 'ewr', 'new york ewr'],
  },
  {
    iata: 'SFO',
    name: 'San Francisco International',
    city: 'San Francisco',
    country: 'US',
    aliases: ['san francisco', 'sf', 'sfo'],
  },
  {
    iata: 'OAK',
    name: 'Oakland International',
    city: 'Oakland',
    country: 'US',
    aliases: ['oakland', 'oak'],
  },
  {
    iata: 'SJC',
    name: 'San Jose International',
    city: 'San Jose',
    country: 'US',
    aliases: ['san jose', 'sjc'],
  },
  {
    iata: 'SEA',
    name: 'Seattle-Tacoma International',
    city: 'Seattle',
    country: 'US',
    aliases: ['seattle', 'sea-tac', 'seatac', 'sea'],
  },
  {
    iata: 'LAS',
    name: 'Harry Reid International',
    city: 'Las Vegas',
    country: 'US',
    aliases: ['las vegas', 'vegas', 'las'],
  },
  {
    iata: 'MIA',
    name: 'Miami International',
    city: 'Miami',
    country: 'US',
    aliases: ['miami', 'mia'],
  },
  {
    iata: 'FLL',
    name: 'Fort Lauderdale-Hollywood International',
    city: 'Fort Lauderdale',
    country: 'US',
    aliases: ['fort lauderdale', 'fll', 'miami fll'],
  },
  {
    iata: 'BOS',
    name: 'Logan International',
    city: 'Boston',
    country: 'US',
    aliases: ['boston', 'logan', 'bos'],
  },
  {
    iata: 'PHX',
    name: 'Phoenix Sky Harbor International',
    city: 'Phoenix',
    country: 'US',
    aliases: ['phoenix', 'sky harbor', 'phx'],
  },
  {
    iata: 'IAH',
    name: 'George Bush Intercontinental',
    city: 'Houston',
    country: 'US',
    aliases: ['houston', 'bush', 'iah'],
  },
  {
    iata: 'HOU',
    name: 'William P. Hobby Airport',
    city: 'Houston',
    country: 'US',
    aliases: ['hobby', 'hou', 'houston hobby'],
  },
  {
    iata: 'MSP',
    name: 'Minneapolis-Saint Paul International',
    city: 'Minneapolis',
    country: 'US',
    aliases: ['minneapolis', 'st paul', 'msp'],
  },
  {
    iata: 'DTW',
    name: 'Detroit Metropolitan Wayne County Airport',
    city: 'Detroit',
    country: 'US',
    aliases: ['detroit', 'dtw'],
  },
  {
    iata: 'PHL',
    name: 'Philadelphia International',
    city: 'Philadelphia',
    country: 'US',
    aliases: ['philadelphia', 'philly', 'phl'],
  },
  {
    iata: 'CLT',
    name: 'Charlotte Douglas International',
    city: 'Charlotte',
    country: 'US',
    aliases: ['charlotte', 'clt'],
  },
  {
    iata: 'BWI',
    name: 'Baltimore/Washington International',
    city: 'Baltimore',
    country: 'US',
    aliases: ['baltimore', 'bwi', 'washington bwi'],
  },
  {
    iata: 'IAD',
    name: 'Washington Dulles International',
    city: 'Washington DC',
    country: 'US',
    aliases: ['dulles', 'iad', 'washington dulles'],
  },
  {
    iata: 'DCA',
    name: 'Ronald Reagan Washington National',
    city: 'Washington DC',
    country: 'US',
    aliases: ['reagan', 'national', 'dca', 'washington national'],
  },
  {
    iata: 'MCO',
    name: 'Orlando International',
    city: 'Orlando',
    country: 'US',
    aliases: ['orlando', 'mco'],
  },
  {
    iata: 'TPA',
    name: 'Tampa International',
    city: 'Tampa',
    country: 'US',
    aliases: ['tampa', 'tpa'],
  },
  {
    iata: 'SAN',
    name: 'San Diego International',
    city: 'San Diego',
    country: 'US',
    aliases: ['san diego', 'san'],
  },
  {
    iata: 'PDX',
    name: 'Portland International',
    city: 'Portland',
    country: 'US',
    aliases: ['portland', 'pdx'],
  },
  {
    iata: 'SLC',
    name: 'Salt Lake City International',
    city: 'Salt Lake City',
    country: 'US',
    aliases: ['salt lake city', 'slc'],
  },
  {
    iata: 'MCI',
    name: 'Kansas City International',
    city: 'Kansas City',
    country: 'US',
    aliases: ['kansas city', 'mci'],
  },
  {
    iata: 'STL',
    name: 'St. Louis Lambert International',
    city: 'St. Louis',
    country: 'US',
    aliases: ['st louis', 'saint louis', 'stl'],
  },
  {
    iata: 'AUS',
    name: 'Austin-Bergstrom International',
    city: 'Austin',
    country: 'US',
    aliases: ['austin', 'aus'],
  },
  {
    iata: 'BNA',
    name: 'Nashville International',
    city: 'Nashville',
    country: 'US',
    aliases: ['nashville', 'bna'],
  },
  {
    iata: 'RDU',
    name: 'Raleigh-Durham International',
    city: 'Raleigh',
    country: 'US',
    aliases: ['raleigh', 'durham', 'rdu'],
  },
  // International
  {
    iata: 'LHR',
    name: 'Heathrow Airport',
    city: 'London',
    country: 'GB',
    aliases: ['london', 'heathrow', 'lhr'],
  },
  {
    iata: 'LGW',
    name: 'Gatwick Airport',
    city: 'London',
    country: 'GB',
    aliases: ['gatwick', 'lgw'],
  },
  {
    iata: 'CDG',
    name: 'Charles de Gaulle Airport',
    city: 'Paris',
    country: 'FR',
    aliases: ['paris', 'charles de gaulle', 'cdg'],
  },
  {
    iata: 'FRA',
    name: 'Frankfurt Airport',
    city: 'Frankfurt',
    country: 'DE',
    aliases: ['frankfurt', 'fra'],
  },
  {
    iata: 'AMS',
    name: 'Amsterdam Schiphol Airport',
    city: 'Amsterdam',
    country: 'NL',
    aliases: ['amsterdam', 'schiphol', 'ams'],
  },
  {
    iata: 'DXB',
    name: 'Dubai International Airport',
    city: 'Dubai',
    country: 'AE',
    aliases: ['dubai', 'dxb'],
  },
  {
    iata: 'NRT',
    name: 'Narita International Airport',
    city: 'Tokyo',
    country: 'JP',
    aliases: ['tokyo', 'narita', 'nrt'],
  },
  {
    iata: 'HND',
    name: 'Haneda Airport',
    city: 'Tokyo',
    country: 'JP',
    aliases: ['haneda', 'hnd', 'tokyo haneda'],
  },
  {
    iata: 'SYD',
    name: 'Sydney Kingsford Smith Airport',
    city: 'Sydney',
    country: 'AU',
    aliases: ['sydney', 'syd'],
  },
  {
    iata: 'YYZ',
    name: 'Toronto Pearson International',
    city: 'Toronto',
    country: 'CA',
    aliases: ['toronto', 'pearson', 'yyz'],
  },
  {
    iata: 'YVR',
    name: 'Vancouver International',
    city: 'Vancouver',
    country: 'CA',
    aliases: ['vancouver', 'yvr'],
  },
  {
    iata: 'MEX',
    name: 'Mexico City International',
    city: 'Mexico City',
    country: 'MX',
    aliases: ['mexico city', 'mex'],
  },
  {
    iata: 'GRU',
    name: 'São Paulo-Guarulhos International',
    city: 'São Paulo',
    country: 'BR',
    aliases: ['sao paulo', 'são paulo', 'guarulhos', 'gru'],
  },
  {
    iata: 'SIN',
    name: 'Singapore Changi Airport',
    city: 'Singapore',
    country: 'SG',
    aliases: ['singapore', 'changi', 'sin'],
  },
  {
    iata: 'HKG',
    name: 'Hong Kong International Airport',
    city: 'Hong Kong',
    country: 'HK',
    aliases: ['hong kong', 'hkg'],
  },
  {
    iata: 'ICN',
    name: 'Incheon International Airport',
    city: 'Seoul',
    country: 'KR',
    aliases: ['seoul', 'incheon', 'icn'],
  },
  {
    iata: 'PEK',
    name: 'Beijing Capital International',
    city: 'Beijing',
    country: 'CN',
    aliases: ['beijing', 'pek'],
  },
  {
    iata: 'PVG',
    name: 'Shanghai Pudong International',
    city: 'Shanghai',
    country: 'CN',
    aliases: ['shanghai', 'pvg'],
  },
];

// Resolve a user query string → best matching Airport (or null)
// Matches: exact IATA code, city name, airport name, or aliases (case-insensitive)
export function resolveAirport(query: string): Airport | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;

  // 1. Exact IATA match (case-insensitive)
  const byIata = AIRPORTS.find((a) => a.iata.toLowerCase() === q);
  if (byIata) return byIata;

  // 2. Alias exact match
  const byAlias = AIRPORTS.find((a) => a.aliases.includes(q));
  if (byAlias) return byAlias;

  // 3. City name starts with query
  const byCity = AIRPORTS.find((a) => a.city.toLowerCase().startsWith(q));
  if (byCity) return byCity;

  // 4. Any alias starts with query
  const byAliasPrefix = AIRPORTS.find((a) => a.aliases.some((alias) => alias.startsWith(q)));
  if (byAliasPrefix) return byAliasPrefix;

  // 5. Airport name contains query
  const byName = AIRPORTS.find((a) => a.name.toLowerCase().includes(q));
  if (byName) return byName;

  return null;
}

// Resolve and return formatted result for LLM tool response
export function resolveAirportForTool(query: string): {
  found: boolean;
  iata?: string;
  name?: string;
  city?: string;
  country?: string;
  message: string;
} {
  const airport = resolveAirport(query);

  if (!airport) {
    return {
      found: false,
      message: `No airport found matching "${query}". Please provide a valid city name or IATA code (e.g., "Chicago" or "ORD").`,
    };
  }

  return {
    found: true,
    iata: airport.iata,
    name: airport.name,
    city: airport.city,
    country: airport.country,
    message: `Found: ${airport.name} (${airport.iata}) in ${airport.city}, ${airport.country}`,
  };
}
