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
  c('buenosaires', 'Argentine Grand Prix', 'Buenos Aires', 'AR', 1953, 1998, 'technical');
  c('aintree', 'British Grand Prix', 'Aintree', 'GB', 1955, 1962, 'fast');
  c('oporto', 'Portuguese Grand Prix', 'Oporto', 'PT', 1958, 1960, 'street');
  c('sebring', 'United States Grand Prix', 'Sebring', 'US', 1959, 1959, 'technical');

  // One-off and short-lived venues of the fifties and sixties. Several hosted a
  // single championship round and never returned.
  c('pescara', 'Pescara Grand Prix', 'Pescara', 'IT', 1957, 1957, 'classic');
  c('aindiab', 'Moroccan Grand Prix', 'Ain-Diab', 'MA', 1958, 1958, 'fast');
  c('avus', 'German Grand Prix', 'AVUS', 'DE', 1959, 1959, 'fast');
  c('monsanto', 'Portuguese Grand Prix', 'Monsanto', 'PT', 1959, 1959, 'street');
  c('eastlondon', 'South African Grand Prix', 'East London', 'ZA', 1962, 1965, 'fast');
  c('zeltweg', 'Austrian Grand Prix', 'Zeltweg', 'AT', 1964, 1964, 'technical');
  c('clermont', 'French Grand Prix', 'Clermont-Ferrand', 'FR', 1965, 1972, 'classic');
  c('lemansbugatti', 'French Grand Prix', 'Le Mans (Bugatti)', 'FR', 1967, 1967, 'technical');
  c('stjovite', 'Canadian Grand Prix', 'Mont-Tremblant', 'CA', 1968, 1970, 'technical');

  // Sixties
  c('riverside', 'United States Grand Prix', 'Riverside', 'US', 1960, 1960, 'technical');
  c('watkinsglen', 'United States Grand Prix', 'Watkins Glen', 'US', 1961, 1980, 'technical');
  c('kyalami', 'South African Grand Prix', 'Kyalami', 'ZA', 1962, 1993, 'fast');
  c('rouen', 'French Grand Prix', 'Rouen-les-Essarts', 'FR', 1952, 1968, 'classic');
  c('mexico', 'Mexican Grand Prix', 'Mexico City', 'MX', 1963, 2019, 'technical');
  c('brands', 'British Grand Prix', 'Brands Hatch', 'GB', 1964, 1986, 'technical');
  c('mosport', 'Canadian Grand Prix', 'Mosport', 'CA', 1967, 1977, 'fast');
  c('jarama', 'Spanish Grand Prix', 'Jarama', 'ES', 1968, 1981, 'technical');
  c('montjuic', 'Spanish Grand Prix', 'Montjuïc', 'ES', 1969, 1975, 'street');

  // Seventies
  c('osterreichring', 'Austrian Grand Prix', 'Österreichring', 'AT', 1970, 1987, 'fast');
  c('paulricard', 'French Grand Prix', 'Paul Ricard', 'FR', 1971, 2022, 'fast');
  c('interlagos', 'Brazilian Grand Prix', 'Interlagos', 'BR', 1973, 9999, 'technical');
  c('anderstorp', 'Swedish Grand Prix', 'Anderstorp', 'SE', 1973, 1978, 'technical');
  c('dijon', 'French Grand Prix', 'Dijon-Prenois', 'FR', 1974, 1984, 'fast');
  c('longbeach', 'United States Grand Prix West', 'Long Beach', 'US', 1976, 1983, 'street');
  c('fuji', 'Japanese Grand Prix', 'Fuji', 'JP', 1976, 2008, 'fast');
  c('hockenheim', 'German Grand Prix', 'Hockenheim', 'DE', 1970, 2019, 'fast');
  c('montreal', 'Canadian Grand Prix', 'Montreal', 'CA', 1978, 9999, 'technical');

  // Belgium moved around a great deal before settling back at Spa in 1983.
  c('nivelles', 'Belgian Grand Prix', 'Nivelles-Baulers', 'BE', 1972, 1974, 'technical');
  c('zolder', 'Belgian Grand Prix', 'Zolder', 'BE', 1973, 1984, 'technical');
  c('jacarepagua', 'Brazilian Grand Prix', 'Jacarepaguá', 'BR', 1978, 1989, 'technical');
  c('caesarspalace', 'Caesars Palace Grand Prix', 'Las Vegas', 'US', 1981, 1982, 'street');
  c('dallas', 'Dallas Grand Prix', 'Dallas', 'US', 1984, 1984, 'street');

  /* Some venues hosted a round under a different title than their usual one —
   * the same tarmac, a different Grand Prix. They need their own entries so the
   * race is reported by the name it actually ran under. */
  c('imolaitalian', 'Italian Grand Prix', 'Imola', 'IT', 1980, 1980, 'technical');
  c('dijonswiss', 'Swiss Grand Prix', 'Dijon-Prenois', 'FR', 1982, 1982, 'fast');
  c('brandseuropean', 'European Grand Prix', 'Brands Hatch', 'GB', 1983, 1985, 'technical');
  c('nurburgringnew', 'European Grand Prix', 'Nürburgring', 'DE', 1984, 2013, 'technical');
  c('nurburgringgerman', 'German Grand Prix', 'Nürburgring', 'DE', 1985, 2013, 'technical');

  // Eighties
  c('imola', 'San Marino Grand Prix', 'Imola', 'IT', 1981, 2006, 'technical');
  c('detroit', 'Detroit Grand Prix', 'Detroit', 'US', 1982, 1988, 'street');
  c('estoril', 'Portuguese Grand Prix', 'Estoril', 'PT', 1984, 1996, 'technical');
  c('adelaide', 'Australian Grand Prix', 'Adelaide', 'AU', 1985, 1995, 'street');
  c('hungaroring', 'Hungarian Grand Prix', 'Hungaroring', 'HU', 1986, 9999, 'technical');
  c('jerez', 'Spanish Grand Prix', 'Jerez', 'ES', 1986, 1990, 'technical');
  c('suzuka', 'Japanese Grand Prix', 'Suzuka', 'JP', 1987, 9999, 'classic');
  c('phoenix', 'United States Grand Prix', 'Phoenix', 'US', 1989, 1991, 'street');

  c('donington', 'European Grand Prix', 'Donington Park', 'GB', 1993, 1993, 'technical');
  c('aida', 'Pacific Grand Prix', 'TI Circuit Aida', 'JP', 1994, 1995, 'technical');
  c('jerezeuropean', 'European Grand Prix', 'Jerez', 'ES', 1994, 1997, 'technical');
  c('nurburgringlux', 'Luxembourg Grand Prix', 'Nürburgring', 'DE', 1997, 1998, 'technical');
  c('buddh', 'Indian Grand Prix', 'Buddh International', 'IN', 2011, 2013, 'fast');
  c('bakueuropean', 'European Grand Prix', 'Baku', 'AZ', 2016, 2016, 'street');

  /* The pandemic season improvised a calendar out of whatever circuits were
   * available, visiting several of them twice under different titles. */
  c('styrian', 'Styrian Grand Prix', 'Red Bull Ring', 'AT', 2020, 2021, 'fast');
  c('anniversary70', '70th Anniversary Grand Prix', 'Silverstone', 'GB', 2020, 2020, 'fast');
  c('mugello', 'Tuscan Grand Prix', 'Mugello', 'IT', 2020, 2020, 'fast');
  c('eifel', 'Eifel Grand Prix', 'Nürburgring', 'DE', 2020, 2020, 'technical');
  c('sakhirouter', 'Sakhir Grand Prix', 'Bahrain Outer Circuit', 'BH', 2020, 2020, 'fast');
  c('imolaemilia', 'Emilia Romagna Grand Prix', 'Imola', 'IT', 2020, 9999, 'technical');

  /* Two rounds were renamed rather than moved. */
  c('interlagossp', 'São Paulo Grand Prix', 'Interlagos', 'BR', 2021, 9999, 'technical');
  c('mexicocity', 'Mexico City Grand Prix', 'Mexico City', 'MX', 2021, 9999, 'technical');

  // Nineties onward
  c('barcelona', 'Spanish Grand Prix', 'Barcelona', 'ES', 1991, 9999, 'technical');
  c('magnycours', 'French Grand Prix', 'Magny-Cours', 'FR', 1991, 2008, 'technical');
  c('melbourne', 'Australian Grand Prix', 'Melbourne', 'AU', 1996, 9999, 'street');
  c('a1ring', 'Austrian Grand Prix', 'Red Bull Ring', 'AT', 1997, 9999, 'fast');
  c('sepang', 'Malaysian Grand Prix', 'Sepang', 'MY', 1999, 2017, 'technical');
  c('indygp', 'United States Grand Prix', 'Indianapolis', 'US', 2000, 2007, 'fast');
  c('bahrain', 'Bahrain Grand Prix', 'Sakhir', 'BH', 2004, 9999, 'technical');
  c('shanghai', 'Chinese Grand Prix', 'Shanghai', 'CN', 2004, 9999, 'technical');
  c('istanbul', 'Turkish Grand Prix', 'Istanbul Park', 'TR', 2005, 2021, 'fast');
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

/* The real championship calendars, in the order the rounds were actually run.
 *
 * Where a year appears here the season uses it verbatim — same events, same
 * venues, same sequence — so 1950 opens at Silverstone in May and finishes at
 * Monza in September, exactly as it did. Only the results are invented.
 *
 * Coverage runs 1950–2025. Seasons past that fall back to the generated
 * calendar, which picks era-appropriate venues and orders them by their usual
 * slot in the year. */
const HISTORICAL_CALENDARS = {
  1950: ['silverstone', 'monaco', 'indianapolis', 'bremgarten', 'spa', 'reims', 'monza'],
  1951: ['bremgarten', 'indianapolis', 'spa', 'reims', 'silverstone', 'nurburgring', 'monza', 'pedralbes'],
  1952: ['bremgarten', 'indianapolis', 'spa', 'rouen', 'silverstone', 'nurburgring', 'zandvoort', 'monza'],
  1953: ['buenosaires', 'indianapolis', 'zandvoort', 'spa', 'reims', 'silverstone', 'nurburgring', 'bremgarten', 'monza'],
  1954: ['buenosaires', 'indianapolis', 'spa', 'reims', 'silverstone', 'nurburgring', 'bremgarten', 'monza', 'pedralbes'],
  /* 1955 was cut short: the French, German, Swiss and Spanish rounds were all
   * cancelled in the aftermath of Le Mans. */
  1955: ['buenosaires', 'monaco', 'indianapolis', 'spa', 'zandvoort', 'aintree', 'monza'],
  1956: ['buenosaires', 'monaco', 'indianapolis', 'spa', 'reims', 'silverstone', 'nurburgring', 'monza'],
  1957: ['buenosaires', 'monaco', 'indianapolis', 'rouen', 'aintree', 'nurburgring', 'pescara', 'monza'],
  1958: ['buenosaires', 'monaco', 'zandvoort', 'indianapolis', 'spa', 'reims', 'silverstone', 'nurburgring', 'oporto', 'monza', 'aindiab'],
  1959: ['monaco', 'indianapolis', 'zandvoort', 'reims', 'aintree', 'avus', 'monsanto', 'monza', 'sebring'],
  1960: ['buenosaires', 'monaco', 'indianapolis', 'zandvoort', 'spa', 'reims', 'silverstone', 'oporto', 'monza', 'riverside'],
  1961: ['monaco', 'zandvoort', 'spa', 'reims', 'aintree', 'nurburgring', 'monza', 'watkinsglen'],
  1962: ['zandvoort', 'monaco', 'spa', 'rouen', 'aintree', 'nurburgring', 'monza', 'watkinsglen', 'eastlondon'],
  1963: ['monaco', 'spa', 'zandvoort', 'reims', 'silverstone', 'nurburgring', 'monza', 'watkinsglen', 'mexico', 'eastlondon'],
  1964: ['monaco', 'zandvoort', 'spa', 'rouen', 'brands', 'nurburgring', 'zeltweg', 'monza', 'watkinsglen', 'mexico'],
  1965: ['eastlondon', 'monaco', 'spa', 'clermont', 'silverstone', 'zandvoort', 'nurburgring', 'monza', 'watkinsglen', 'mexico'],
  1966: ['monaco', 'spa', 'reims', 'brands', 'zandvoort', 'nurburgring', 'monza', 'watkinsglen', 'mexico'],
  1967: ['kyalami', 'monaco', 'zandvoort', 'spa', 'lemansbugatti', 'silverstone', 'nurburgring', 'mosport', 'monza', 'watkinsglen', 'mexico'],
  1968: ['kyalami', 'jarama', 'monaco', 'spa', 'zandvoort', 'rouen', 'brands', 'nurburgring', 'monza', 'stjovite', 'watkinsglen', 'mexico'],
  1969: ['kyalami', 'montjuic', 'monaco', 'zandvoort', 'clermont', 'silverstone', 'nurburgring', 'monza', 'mosport', 'watkinsglen', 'mexico'],
  1970: ['kyalami', 'jarama', 'monaco', 'spa', 'zandvoort', 'clermont', 'brands', 'hockenheim', 'osterreichring', 'monza', 'stjovite', 'watkinsglen', 'mexico'],

  1971: ['kyalami', 'montjuic', 'monaco', 'zandvoort', 'paulricard', 'silverstone', 'nurburgring', 'osterreichring', 'monza', 'mosport', 'watkinsglen'],
  1972: ['buenosaires', 'kyalami', 'jarama', 'monaco', 'nivelles', 'clermont', 'brands', 'nurburgring', 'osterreichring', 'monza', 'mosport', 'watkinsglen'],
  1973: ['buenosaires', 'interlagos', 'kyalami', 'montjuic', 'zolder', 'monaco', 'anderstorp', 'paulricard', 'silverstone', 'zandvoort', 'nurburgring', 'osterreichring', 'monza', 'mosport', 'watkinsglen'],
  1974: ['buenosaires', 'interlagos', 'kyalami', 'jarama', 'nivelles', 'monaco', 'anderstorp', 'zandvoort', 'dijon', 'brands', 'nurburgring', 'osterreichring', 'monza', 'mosport', 'watkinsglen'],
  1975: ['buenosaires', 'interlagos', 'kyalami', 'montjuic', 'monaco', 'zolder', 'anderstorp', 'zandvoort', 'paulricard', 'silverstone', 'nurburgring', 'osterreichring', 'monza', 'watkinsglen'],
  1976: ['interlagos', 'kyalami', 'longbeach', 'jarama', 'zolder', 'monaco', 'anderstorp', 'paulricard', 'brands', 'nurburgring', 'osterreichring', 'zandvoort', 'monza', 'mosport', 'watkinsglen', 'fuji'],
  1977: ['buenosaires', 'interlagos', 'kyalami', 'longbeach', 'jarama', 'monaco', 'zolder', 'anderstorp', 'dijon', 'silverstone', 'hockenheim', 'osterreichring', 'zandvoort', 'monza', 'watkinsglen', 'mosport', 'fuji'],
  1978: ['buenosaires', 'jacarepagua', 'kyalami', 'longbeach', 'monaco', 'zolder', 'jarama', 'anderstorp', 'paulricard', 'brands', 'hockenheim', 'osterreichring', 'zandvoort', 'monza', 'watkinsglen', 'montreal'],
  1979: ['buenosaires', 'interlagos', 'kyalami', 'longbeach', 'jarama', 'zolder', 'monaco', 'dijon', 'silverstone', 'hockenheim', 'osterreichring', 'zandvoort', 'monza', 'montreal', 'watkinsglen'],
  /* The 1980 Italian Grand Prix was run at Imola, the only time Monza lost it. */
  1980: ['buenosaires', 'interlagos', 'kyalami', 'longbeach', 'zolder', 'monaco', 'paulricard', 'brands', 'hockenheim', 'osterreichring', 'zandvoort', 'imolaitalian', 'montreal', 'watkinsglen'],
  1981: ['longbeach', 'jacarepagua', 'buenosaires', 'imola', 'zolder', 'monaco', 'jarama', 'dijon', 'silverstone', 'hockenheim', 'osterreichring', 'zandvoort', 'monza', 'montreal', 'caesarspalace'],
  /* 1982's Swiss Grand Prix was held at Dijon, in France. */
  1982: ['kyalami', 'jacarepagua', 'longbeach', 'imola', 'zolder', 'monaco', 'detroit', 'montreal', 'zandvoort', 'brands', 'paulricard', 'hockenheim', 'osterreichring', 'dijonswiss', 'monza', 'caesarspalace'],
  1983: ['jacarepagua', 'longbeach', 'paulricard', 'imola', 'monaco', 'spa', 'detroit', 'montreal', 'silverstone', 'hockenheim', 'osterreichring', 'zandvoort', 'monza', 'brandseuropean', 'kyalami'],
  1984: ['jacarepagua', 'kyalami', 'zolder', 'imola', 'dijon', 'monaco', 'montreal', 'detroit', 'dallas', 'brands', 'hockenheim', 'osterreichring', 'zandvoort', 'monza', 'nurburgringnew', 'estoril'],
  1985: ['jacarepagua', 'estoril', 'imola', 'monaco', 'montreal', 'detroit', 'paulricard', 'silverstone', 'nurburgringgerman', 'osterreichring', 'zandvoort', 'monza', 'spa', 'brandseuropean', 'kyalami', 'adelaide'],
  1986: ['jacarepagua', 'jerez', 'imola', 'monaco', 'spa', 'montreal', 'detroit', 'paulricard', 'brands', 'hockenheim', 'hungaroring', 'osterreichring', 'monza', 'estoril', 'mexico', 'adelaide'],
  1987: ['jacarepagua', 'imola', 'spa', 'monaco', 'detroit', 'paulricard', 'silverstone', 'hockenheim', 'hungaroring', 'osterreichring', 'monza', 'estoril', 'jerez', 'mexico', 'suzuka', 'adelaide'],
  1988: ['jacarepagua', 'imola', 'monaco', 'mexico', 'montreal', 'detroit', 'paulricard', 'silverstone', 'hockenheim', 'hungaroring', 'spa', 'monza', 'estoril', 'jerez', 'suzuka', 'adelaide'],
  1989: ['jacarepagua', 'imola', 'monaco', 'mexico', 'phoenix', 'montreal', 'paulricard', 'silverstone', 'hockenheim', 'hungaroring', 'spa', 'monza', 'estoril', 'jerez', 'suzuka', 'adelaide'],
  1990: ['phoenix', 'interlagos', 'imola', 'monaco', 'montreal', 'mexico', 'paulricard', 'silverstone', 'hockenheim', 'hungaroring', 'spa', 'monza', 'estoril', 'jerez', 'suzuka', 'adelaide'],

  1991: ['phoenix', 'interlagos', 'imola', 'monaco', 'montreal', 'mexico', 'magnycours', 'silverstone', 'hockenheim', 'hungaroring', 'spa', 'monza', 'estoril', 'barcelona', 'suzuka', 'adelaide'],
  1992: ['kyalami', 'mexico', 'interlagos', 'barcelona', 'imola', 'monaco', 'montreal', 'magnycours', 'silverstone', 'hockenheim', 'hungaroring', 'spa', 'monza', 'estoril', 'suzuka', 'adelaide'],
  1993: ['kyalami', 'interlagos', 'donington', 'imola', 'barcelona', 'monaco', 'montreal', 'magnycours', 'silverstone', 'hockenheim', 'hungaroring', 'spa', 'monza', 'estoril', 'suzuka', 'adelaide'],
  1994: ['interlagos', 'aida', 'imola', 'monaco', 'barcelona', 'montreal', 'magnycours', 'silverstone', 'hockenheim', 'hungaroring', 'spa', 'monza', 'estoril', 'jerezeuropean', 'suzuka', 'adelaide'],
  1995: ['interlagos', 'buenosaires', 'imola', 'barcelona', 'monaco', 'montreal', 'magnycours', 'silverstone', 'hockenheim', 'hungaroring', 'spa', 'monza', 'estoril', 'nurburgringnew', 'aida', 'suzuka', 'adelaide'],
  1996: ['melbourne', 'interlagos', 'buenosaires', 'nurburgringnew', 'imola', 'monaco', 'barcelona', 'montreal', 'magnycours', 'silverstone', 'hockenheim', 'hungaroring', 'spa', 'monza', 'estoril', 'suzuka'],
  1997: ['melbourne', 'interlagos', 'buenosaires', 'imola', 'monaco', 'barcelona', 'montreal', 'magnycours', 'silverstone', 'hockenheim', 'hungaroring', 'spa', 'monza', 'a1ring', 'nurburgringlux', 'suzuka', 'jerezeuropean'],
  1998: ['melbourne', 'interlagos', 'buenosaires', 'imola', 'barcelona', 'monaco', 'montreal', 'magnycours', 'silverstone', 'a1ring', 'hockenheim', 'hungaroring', 'spa', 'monza', 'nurburgringlux', 'suzuka'],
  1999: ['melbourne', 'interlagos', 'imola', 'monaco', 'barcelona', 'montreal', 'magnycours', 'silverstone', 'a1ring', 'hockenheim', 'hungaroring', 'spa', 'monza', 'nurburgringnew', 'sepang', 'suzuka'],
  2000: ['melbourne', 'interlagos', 'imola', 'silverstone', 'barcelona', 'nurburgringnew', 'monaco', 'montreal', 'magnycours', 'a1ring', 'hockenheim', 'hungaroring', 'spa', 'monza', 'indygp', 'suzuka', 'sepang'],
  2001: ['melbourne', 'sepang', 'interlagos', 'imola', 'barcelona', 'a1ring', 'monaco', 'montreal', 'nurburgringnew', 'magnycours', 'silverstone', 'hockenheim', 'hungaroring', 'spa', 'monza', 'indygp', 'suzuka'],
  2002: ['melbourne', 'sepang', 'interlagos', 'imola', 'barcelona', 'a1ring', 'monaco', 'montreal', 'nurburgringnew', 'silverstone', 'magnycours', 'hockenheim', 'hungaroring', 'spa', 'monza', 'indygp', 'suzuka'],
  2003: ['melbourne', 'sepang', 'interlagos', 'imola', 'barcelona', 'a1ring', 'monaco', 'montreal', 'nurburgringnew', 'magnycours', 'silverstone', 'hockenheim', 'hungaroring', 'monza', 'indygp', 'suzuka'],
  2004: ['melbourne', 'sepang', 'bahrain', 'imola', 'barcelona', 'monaco', 'nurburgringnew', 'montreal', 'indygp', 'magnycours', 'silverstone', 'hockenheim', 'hungaroring', 'spa', 'monza', 'shanghai', 'suzuka', 'interlagos'],
  2005: ['melbourne', 'sepang', 'bahrain', 'imola', 'barcelona', 'monaco', 'nurburgringnew', 'montreal', 'indygp', 'magnycours', 'silverstone', 'hockenheim', 'hungaroring', 'istanbul', 'monza', 'spa', 'interlagos', 'suzuka', 'shanghai'],
  2006: ['bahrain', 'sepang', 'melbourne', 'imola', 'nurburgringnew', 'barcelona', 'monaco', 'silverstone', 'montreal', 'indygp', 'magnycours', 'hockenheim', 'hungaroring', 'istanbul', 'monza', 'shanghai', 'suzuka', 'interlagos'],
  2007: ['melbourne', 'sepang', 'bahrain', 'barcelona', 'monaco', 'montreal', 'indygp', 'magnycours', 'silverstone', 'nurburgringnew', 'hungaroring', 'istanbul', 'monza', 'spa', 'fuji', 'shanghai', 'interlagos'],
  2008: ['melbourne', 'sepang', 'bahrain', 'barcelona', 'istanbul', 'monaco', 'montreal', 'magnycours', 'silverstone', 'hockenheim', 'hungaroring', 'valencia', 'spa', 'monza', 'singapore', 'fuji', 'shanghai', 'interlagos'],
  2009: ['melbourne', 'sepang', 'shanghai', 'bahrain', 'barcelona', 'monaco', 'istanbul', 'silverstone', 'nurburgringgerman', 'hungaroring', 'valencia', 'spa', 'monza', 'singapore', 'suzuka', 'interlagos', 'abudhabi'],
  2010: ['bahrain', 'melbourne', 'sepang', 'shanghai', 'barcelona', 'monaco', 'istanbul', 'montreal', 'valencia', 'silverstone', 'hockenheim', 'hungaroring', 'spa', 'monza', 'singapore', 'suzuka', 'korea', 'interlagos', 'abudhabi'],

  2011: ['melbourne', 'sepang', 'shanghai', 'istanbul', 'barcelona', 'monaco', 'montreal', 'valencia', 'silverstone', 'nurburgringgerman', 'hungaroring', 'spa', 'monza', 'singapore', 'suzuka', 'korea', 'buddh', 'abudhabi', 'interlagos'],
  2012: ['melbourne', 'sepang', 'shanghai', 'bahrain', 'barcelona', 'monaco', 'montreal', 'valencia', 'silverstone', 'hockenheim', 'hungaroring', 'spa', 'monza', 'singapore', 'suzuka', 'korea', 'buddh', 'abudhabi', 'austin', 'interlagos'],
  2013: ['melbourne', 'sepang', 'shanghai', 'bahrain', 'barcelona', 'monaco', 'montreal', 'silverstone', 'nurburgringgerman', 'hungaroring', 'spa', 'monza', 'singapore', 'korea', 'suzuka', 'buddh', 'abudhabi', 'austin', 'interlagos'],
  2014: ['melbourne', 'sepang', 'bahrain', 'shanghai', 'barcelona', 'monaco', 'montreal', 'a1ring', 'silverstone', 'hockenheim', 'hungaroring', 'spa', 'monza', 'singapore', 'suzuka', 'sochi', 'austin', 'interlagos', 'abudhabi'],
  2015: ['melbourne', 'sepang', 'shanghai', 'bahrain', 'barcelona', 'monaco', 'montreal', 'a1ring', 'silverstone', 'hungaroring', 'spa', 'monza', 'singapore', 'suzuka', 'sochi', 'austin', 'mexico', 'interlagos', 'abudhabi'],
  2016: ['melbourne', 'bahrain', 'shanghai', 'sochi', 'barcelona', 'monaco', 'montreal', 'bakueuropean', 'a1ring', 'silverstone', 'hungaroring', 'hockenheim', 'spa', 'monza', 'singapore', 'sepang', 'suzuka', 'austin', 'mexico', 'interlagos', 'abudhabi'],
  2017: ['melbourne', 'shanghai', 'bahrain', 'sochi', 'barcelona', 'monaco', 'montreal', 'baku', 'a1ring', 'silverstone', 'hungaroring', 'spa', 'monza', 'singapore', 'sepang', 'suzuka', 'austin', 'mexico', 'interlagos', 'abudhabi'],
  2018: ['melbourne', 'bahrain', 'shanghai', 'baku', 'barcelona', 'monaco', 'montreal', 'paulricard', 'a1ring', 'silverstone', 'hockenheim', 'hungaroring', 'spa', 'monza', 'singapore', 'sochi', 'suzuka', 'austin', 'mexico', 'interlagos', 'abudhabi'],
  2019: ['melbourne', 'bahrain', 'shanghai', 'baku', 'barcelona', 'monaco', 'montreal', 'paulricard', 'a1ring', 'silverstone', 'hockenheim', 'hungaroring', 'spa', 'monza', 'singapore', 'sochi', 'suzuka', 'mexico', 'austin', 'interlagos', 'abudhabi'],
  /* 2020 was rebuilt from scratch mid-pandemic: seventeen rounds, several of
   * them second visits to a circuit under a different name. */
  2020: ['a1ring', 'styrian', 'hungaroring', 'silverstone', 'anniversary70', 'barcelona', 'spa', 'monza', 'mugello', 'sochi', 'eifel', 'portimao', 'imolaemilia', 'istanbul', 'bahrain', 'sakhirouter', 'abudhabi'],
  2021: ['bahrain', 'imolaemilia', 'portimao', 'barcelona', 'monaco', 'baku', 'paulricard', 'styrian', 'a1ring', 'silverstone', 'hungaroring', 'spa', 'zandvoort2', 'monza', 'sochi', 'istanbul', 'austin', 'mexicocity', 'interlagossp', 'losail', 'jeddah', 'abudhabi'],
  2022: ['bahrain', 'jeddah', 'melbourne', 'imolaemilia', 'miami', 'barcelona', 'monaco', 'baku', 'montreal', 'silverstone', 'a1ring', 'paulricard', 'hungaroring', 'spa', 'zandvoort2', 'monza', 'singapore', 'suzuka', 'austin', 'mexicocity', 'interlagossp', 'abudhabi'],
  2023: ['bahrain', 'jeddah', 'melbourne', 'baku', 'miami', 'monaco', 'barcelona', 'montreal', 'a1ring', 'silverstone', 'hungaroring', 'spa', 'zandvoort2', 'monza', 'singapore', 'suzuka', 'losail', 'austin', 'mexicocity', 'interlagossp', 'vegas', 'abudhabi'],
  2024: ['bahrain', 'jeddah', 'melbourne', 'suzuka', 'shanghai', 'miami', 'imolaemilia', 'monaco', 'montreal', 'barcelona', 'a1ring', 'silverstone', 'hungaroring', 'spa', 'zandvoort2', 'monza', 'baku', 'singapore', 'austin', 'mexicocity', 'interlagossp', 'vegas', 'losail', 'abudhabi'],
  2025: ['melbourne', 'shanghai', 'suzuka', 'bahrain', 'jeddah', 'miami', 'imolaemilia', 'monaco', 'barcelona', 'montreal', 'a1ring', 'silverstone', 'spa', 'hungaroring', 'zandvoort2', 'monza', 'baku', 'singapore', 'austin', 'mexicocity', 'interlagossp', 'vegas', 'losail', 'abudhabi'],
};

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
  clermont: 0.20, stjovite: 0.20, zeltweg: 0.18, lemansbugatti: 0.18, avus: 0.16,
  monsanto: 0.10, eastlondon: 0.10, pescara: 0.07, aindiab: 0.04,
};

function rainChance(circuitId) {
  return RAIN_CHANCE[circuitId] !== undefined ? RAIN_CHANCE[circuitId] : 0.11;
}
