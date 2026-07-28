/* The circuit rotation, 1950 onward.
 *
 * c(id, grandPrix, venue, country, from, to, character)
 *
 * `grandPrix` is the event's identity — several venues have hosted the British
 * Grand Prix, and only one of them appears on any given year's calendar. The
 * builder in season.js picks between eligible venues so the calendar rotates the
 * way the real one did.
 *
 * `character` shapes how a race unfolds:
 *   fast       power circuits: slipstreaming, big speeds, engines under strain
 *   technical  handling and downforce matter more than raw grunt
 *   street     overtaking is desperately hard, walls punish every mistake
 *   classic    long, old-school, punishing; rewards bravery and hurts machinery
 *   oval       the Indianapolis anomaly of the fifties
 */

const CIRCUITS = (() => {
  const out = [];
  const c = (id, gp, venue, country, from, to, character) =>
    out.push({ id, gp, venue, country, from, to, character });

  // Founding events
  c('silverstone', 'British Grand Prix', 'Silverstone', 'GB', 1950, 9999, 'fast');
  c('monaco', 'Monaco Grand Prix', 'Monte Carlo', 'MC', 1950, 9999, 'street');
  c('indianapolis', 'Indianapolis 500', 'Indianapolis', 'US', 1950, 1960, 'oval');
  c('bremgarten', 'Swiss Grand Prix', 'Bremgarten', 'CH', 1950, 1954, 'classic');
  c('spa', 'Belgian Grand Prix', 'Spa-Francorchamps', 'BE', 1950, 9999, 'fast');
  c('reims', 'French Grand Prix', 'Reims', 'FR', 1950, 1966, 'fast');
  c('monza', 'Italian Grand Prix', 'Monza', 'IT', 1950, 9999, 'fast');

  // Fifties expansion
  c('nurburgring', 'German Grand Prix', 'Nürburgring', 'DE', 1951, 1976, 'classic');
  c('pedralbes', 'Spanish Grand Prix', 'Pedralbes', 'ES', 1951, 1954, 'fast');
  c('zandvoort', 'Dutch Grand Prix', 'Zandvoort', 'NL', 1952, 1985, 'technical');
  c('buenosaires', 'Argentine Grand Prix', 'Buenos Aires', 'AR', 1953, 1960, 'technical');
  c('aintree', 'British Grand Prix', 'Aintree', 'GB', 1955, 1962, 'fast');
  c('oporto', 'Portuguese Grand Prix', 'Oporto', 'PT', 1958, 1960, 'street');
  c('sebring', 'United States Grand Prix', 'Sebring', 'US', 1959, 1959, 'technical');

  // Sixties
  c('riverside', 'United States Grand Prix', 'Riverside', 'US', 1960, 1960, 'technical');
  c('watkinsglen', 'United States Grand Prix', 'Watkins Glen', 'US', 1961, 1980, 'technical');
  c('kyalami', 'South African Grand Prix', 'Kyalami', 'ZA', 1962, 1993, 'fast');
  c('rouen', 'French Grand Prix', 'Rouen-les-Essarts', 'FR', 1962, 1968, 'classic');
  c('mexico', 'Mexican Grand Prix', 'Mexico City', 'MX', 1963, 1992, 'technical');
  c('brands', 'British Grand Prix', 'Brands Hatch', 'GB', 1964, 1986, 'technical');
  c('mosport', 'Canadian Grand Prix', 'Mosport', 'CA', 1967, 1977, 'fast');
  c('jarama', 'Spanish Grand Prix', 'Jarama', 'ES', 1968, 1981, 'technical');
  c('montjuic', 'Spanish Grand Prix', 'Montjuïc', 'ES', 1969, 1975, 'street');

  // Seventies
  c('osterreichring', 'Austrian Grand Prix', 'Österreichring', 'AT', 1970, 1987, 'fast');
  c('paulricard', 'French Grand Prix', 'Paul Ricard', 'FR', 1971, 1990, 'fast');
  c('interlagos', 'Brazilian Grand Prix', 'Interlagos', 'BR', 1973, 9999, 'technical');
  c('anderstorp', 'Swedish Grand Prix', 'Anderstorp', 'SE', 1973, 1978, 'technical');
  c('dijon', 'French Grand Prix', 'Dijon-Prenois', 'FR', 1974, 1984, 'fast');
  c('longbeach', 'United States Grand Prix West', 'Long Beach', 'US', 1976, 1983, 'street');
  c('fuji', 'Japanese Grand Prix', 'Fuji', 'JP', 1976, 1977, 'fast');
  c('hockenheim', 'German Grand Prix', 'Hockenheim', 'DE', 1977, 2019, 'fast');
  c('montreal', 'Canadian Grand Prix', 'Montreal', 'CA', 1978, 9999, 'technical');

  // Eighties
  c('imola', 'San Marino Grand Prix', 'Imola', 'IT', 1981, 2006, 'technical');
  c('detroit', 'Detroit Grand Prix', 'Detroit', 'US', 1982, 1988, 'street');
  c('estoril', 'Portuguese Grand Prix', 'Estoril', 'PT', 1984, 1996, 'technical');
  c('adelaide', 'Australian Grand Prix', 'Adelaide', 'AU', 1985, 1995, 'street');
  c('hungaroring', 'Hungarian Grand Prix', 'Hungaroring', 'HU', 1986, 9999, 'technical');
  c('jerez', 'Spanish Grand Prix', 'Jerez', 'ES', 1986, 1990, 'technical');
  c('suzuka', 'Japanese Grand Prix', 'Suzuka', 'JP', 1987, 9999, 'classic');
  c('phoenix', 'United States Grand Prix', 'Phoenix', 'US', 1989, 1991, 'street');

  // Nineties onward
  c('barcelona', 'Spanish Grand Prix', 'Barcelona', 'ES', 1991, 9999, 'technical');
  c('magnycours', 'French Grand Prix', 'Magny-Cours', 'FR', 1991, 2008, 'technical');
  c('melbourne', 'Australian Grand Prix', 'Melbourne', 'AU', 1996, 9999, 'street');
  c('a1ring', 'Austrian Grand Prix', 'Red Bull Ring', 'AT', 1997, 9999, 'fast');
  c('sepang', 'Malaysian Grand Prix', 'Sepang', 'MY', 1999, 2017, 'technical');
  c('indygp', 'United States Grand Prix', 'Indianapolis', 'US', 2000, 2007, 'fast');
  c('bahrain', 'Bahrain Grand Prix', 'Sakhir', 'BH', 2004, 9999, 'technical');
  c('shanghai', 'Chinese Grand Prix', 'Shanghai', 'CN', 2004, 9999, 'technical');
  c('istanbul', 'Turkish Grand Prix', 'Istanbul Park', 'TR', 2005, 2011, 'fast');
  c('valencia', 'European Grand Prix', 'Valencia', 'ES', 2008, 2012, 'street');
  c('singapore', 'Singapore Grand Prix', 'Marina Bay', 'SG', 2008, 9999, 'street');
  c('abudhabi', 'Abu Dhabi Grand Prix', 'Yas Marina', 'AE', 2009, 9999, 'technical');
  c('korea', 'Korean Grand Prix', 'Yeongam', 'KR', 2010, 2013, 'technical');
  c('austin', 'United States Grand Prix', 'Austin', 'US', 2012, 9999, 'technical');
  c('sochi', 'Russian Grand Prix', 'Sochi', 'RU', 2014, 2021, 'street');
  c('baku', 'Azerbaijan Grand Prix', 'Baku', 'AZ', 2016, 9999, 'street');
  c('portimao', 'Portuguese Grand Prix', 'Portimão', 'PT', 2020, 2021, 'technical');
  c('zandvoort2', 'Dutch Grand Prix', 'Zandvoort', 'NL', 2021, 9999, 'technical');
  c('jeddah', 'Saudi Arabian Grand Prix', 'Jeddah', 'SA', 2021, 9999, 'street');
  c('losail', 'Qatar Grand Prix', 'Lusail', 'QA', 2021, 9999, 'fast');
  c('miami', 'Miami Grand Prix', 'Miami', 'US', 2022, 9999, 'street');
  c('vegas', 'Las Vegas Grand Prix', 'Las Vegas', 'US', 2023, 9999, 'street');

  return out;
})();

/* Target calendar length by era — the championship grew from seven rounds to
 * well over twenty. */
function calendarSize(year) {
  if (year <= 1957) return 8;
  if (year <= 1969) return 10;
  if (year <= 1976) return 14;
  if (year <= 1989) return 16;
  if (year <= 2003) return 17;
  if (year <= 2015) return 19;
  return 22;
}

/* How much rain a venue tends to see. Spa and the Nürburgring are notorious;
 * the desert circuits essentially never get wet. */
const RAIN_CHANCE = {
  spa: 0.30, nurburgring: 0.28, silverstone: 0.22, brands: 0.22, zandvoort: 0.20,
  zandvoort2: 0.20, suzuka: 0.20, interlagos: 0.22, montreal: 0.18, hockenheim: 0.16,
  monza: 0.14, imola: 0.14, hungaroring: 0.12, monaco: 0.14, sepang: 0.28,
  shanghai: 0.18, bremgarten: 0.24, aintree: 0.24, oporto: 0.14, estoril: 0.12,
  bahrain: 0.02, abudhabi: 0.02, jeddah: 0.02, losail: 0.02, vegas: 0.03,
  kyalami: 0.10, mexico: 0.12, indianapolis: 0.10,
};

function rainChance(circuitId) {
  return RAIN_CHANCE[circuitId] !== undefined ? RAIN_CHANCE[circuitId] : 0.11;
}
