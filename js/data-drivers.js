/* Driver roster, 1950 onward.
 *
 * Every driver enters the timeline in the year they really debuted. Everything
 * after that point is the simulation's business, not history's.
 *
 * d(id, name, nationality, born, debut, pace, craft, consistency, wet, risk, longevity)
 *
 *   pace        raw one-lap speed
 *   craft       racecraft: starts, overtaking, defending, tyre and fuel sense
 *   consistency resistance to unforced errors over a race distance
 *   wet         wet-weather ability
 *   risk        appetite for danger; raises both reward and crash probability
 *   longevity   how slowly ability decays past the peak years
 *
 * Ratings describe a driver at career peak. The engine applies an age curve, so
 * a 20-year-old debutant races well below these numbers and climbs toward them.
 */

const DRIVERS = (() => {
  const out = [];
  const d = (id, name, nat, born, debut, pace, craft, cons, wet, risk, longevity) =>
    out.push({ id, name, nat, born, debut, pace, craft, cons, wet, risk, longevity });

  // ---------------------------------------------------------------- 1950 ----
  // The founding field. Several of these men were already past forty when the
  // World Championship began; their age curves start in decline immediately.
  d('fangio',      'Juan Manuel Fangio',    'AR', 1911, 1950, 96, 96, 94, 97, 30, 96);
  d('farina',      'Nino Farina',           'IT', 1906, 1950, 90, 86, 83, 82, 58, 58);
  d('fagioli',     'Luigi Fagioli',         'IT', 1898, 1950, 86, 88, 86, 80, 40, 52);
  d('ascari',      'Alberto Ascari',        'IT', 1918, 1950, 95, 92, 90, 88, 46, 72);
  d('villoresi',   'Luigi Villoresi',       'IT', 1909, 1950, 87, 86, 84, 83, 44, 62);
  d('sommer',      'Raymond Sommer',        'FR', 1906, 1950, 85, 84, 78, 86, 60, 55);
  d('gonzalez',    'José Froilán González', 'AR', 1922, 1950, 89, 84, 80, 84, 62, 66);
  d('chiron',      'Louis Chiron',          'MC', 1899, 1950, 80, 85, 82, 84, 34, 60);
  d('etancelin',   'Philippe Étancelin',    'FR', 1896, 1950, 78, 80, 74, 79, 55, 45);
  d('rosier',      'Louis Rosier',          'FR', 1905, 1950, 79, 82, 84, 78, 30, 64);
  d('cabantous',   'Yves Giraud-Cabantous', 'FR', 1904, 1950, 74, 76, 78, 72, 32, 58);
  d('bira',        'Prince Bira',           'TH', 1914, 1950, 80, 78, 74, 76, 44, 62);
  d('graffenried', 'Toulo de Graffenried',  'CH', 1914, 1950, 78, 79, 80, 75, 36, 66);
  d('parnell',     'Reg Parnell',           'GB', 1911, 1950, 80, 82, 83, 80, 34, 63);
  d('whitehead',   'Peter Whitehead',       'GB', 1914, 1950, 74, 76, 79, 74, 30, 60);
  d('gerard',      'Bob Gerard',            'GB', 1914, 1950, 72, 78, 82, 78, 26, 68);
  d('harrison',    'Cuth Harrison',         'GB', 1906, 1950, 68, 72, 76, 72, 30, 52);
  d('rol',         'Franco Rol',            'IT', 1908, 1950, 70, 71, 72, 68, 40, 50);
  d('bonetto',     'Felice Bonetto',        'IT', 1903, 1950, 81, 78, 70, 78, 68, 50);
  d('serafini',    'Dorino Serafini',       'IT', 1909, 1950, 79, 76, 74, 74, 52, 52);
  d('claes',       'Johnny Claes',          'BE', 1916, 1950, 68, 70, 72, 70, 38, 58);
  d('trintignant', 'Maurice Trintignant',   'FR', 1917, 1950, 82, 86, 88, 82, 26, 80);
  d('manzon',      'Robert Manzon',         'FR', 1917, 1950, 79, 78, 76, 76, 46, 64);
  d('taruffi',     'Piero Taruffi',         'IT', 1906, 1950, 82, 84, 82, 80, 36, 62);
  d('sanesi',      'Consalvo Sanesi',       'IT', 1911, 1950, 76, 74, 76, 72, 42, 56);
  d('pietsch',     'Paul Pietsch',          'DE', 1911, 1950, 72, 70, 66, 74, 62, 48);
  d('schell',      'Harry Schell',          'US', 1921, 1950, 79, 80, 76, 78, 52, 70);
  d('branca',      'Toni Branca',           'CH', 1916, 1950, 66, 66, 68, 66, 44, 50);
  d('martin',      'Eugène Martin',         'FR', 1915, 1950, 70, 70, 70, 68, 46, 52);
  d('hampshire',   'David Hampshire',       'GB', 1917, 1950, 66, 68, 70, 68, 36, 54);
  d('shawetaylor', 'Brian Shawe-Taylor',    'GB', 1915, 1950, 69, 70, 72, 70, 38, 55);
  d('johnsonl',    'Leslie Johnson',        'GB', 1912, 1950, 68, 70, 70, 68, 36, 52);
  d('crossley',    'Geoff Crossley',        'GB', 1921, 1950, 64, 66, 68, 66, 40, 56);
  d('levegh',      'Pierre Levegh',         'FR', 1905, 1950, 74, 74, 70, 74, 58, 50);
  d('fry',         'Joe Fry',               'GB', 1915, 1950, 66, 66, 66, 66, 48, 48);

  // ---------------------------------------------------------------- 1951 ----
  d('moss',        'Stirling Moss',         'GB', 1929, 1951, 97, 95, 86, 96, 56, 80);
  d('marimon',     'Onofre Marimón',        'AR', 1923, 1951, 84, 80, 74, 80, 64, 62);
  d('fischer',     'Rudi Fischer',          'CH', 1912, 1951, 72, 74, 76, 72, 34, 54);
  d('landi',       'Chico Landi',           'BR', 1907, 1951, 70, 72, 72, 70, 42, 52);
  d('stuckh',      'Hans Stuck',            'DE', 1900, 1951, 76, 78, 74, 82, 44, 48);
  d('hamilton',    'Duncan Hamilton',       'GB', 1920, 1951, 72, 74, 70, 74, 58, 60);
  d('bayol',       'Élie Bayol',            'FR', 1914, 1951, 70, 70, 72, 68, 42, 55);

  // ---------------------------------------------------------------- 1952 ----
  // Formula Two rules brought a wave of new names into the championship.
  d('hawthorn',    'Mike Hawthorn',         'GB', 1929, 1952, 90, 86, 80, 86, 60, 66);
  d('behra',       'Jean Behra',            'FR', 1921, 1952, 86, 84, 74, 86, 70, 64);
  d('collins',     'Peter Collins',         'GB', 1931, 1952, 88, 86, 82, 84, 54, 74);
  d('salvadori',   'Roy Salvadori',         'GB', 1922, 1952, 80, 82, 82, 78, 42, 72);
  d('wharton',     'Ken Wharton',           'GB', 1916, 1952, 74, 76, 76, 76, 44, 60);
  d('frere',       'Paul Frère',            'BE', 1917, 1952, 78, 80, 80, 78, 36, 66);
  d('brown',       'Alan Brown',            'GB', 1919, 1952, 70, 72, 74, 70, 40, 58);
  d('thompson',    'Eric Thompson',         'GB', 1919, 1952, 68, 72, 74, 70, 34, 56);
  d('ulmen',       'Toni Ulmen',            'DE', 1906, 1952, 68, 70, 70, 70, 40, 50);
  d('carini',      'Piero Carini',          'IT', 1921, 1952, 70, 70, 68, 68, 50, 52);

  // ---------------------------------------------------------------- 1953 ----
  d('musso',       'Luigi Musso',           'IT', 1924, 1953, 84, 80, 76, 78, 66, 62);
  d('mieres',      'Roberto Mieres',        'AR', 1924, 1953, 80, 80, 78, 80, 46, 64);
  d('maglioli',    'Umberto Maglioli',      'IT', 1928, 1953, 78, 80, 80, 78, 40, 68);
  d('mantovani',   'Sergio Mantovani',      'IT', 1929, 1953, 74, 74, 74, 72, 46, 62);
  d('lang',        'Hermann Lang',          'DE', 1909, 1953, 80, 80, 78, 80, 40, 48);
  d('swaters',     'Jacques Swaters',       'BE', 1926, 1953, 70, 72, 74, 72, 38, 62);

  // ---------------------------------------------------------------- 1954 ----
  d('kling',       'Karl Kling',            'DE', 1910, 1954, 78, 80, 80, 78, 38, 54);
  d('herrmann',    'Hans Herrmann',         'DE', 1928, 1954, 78, 80, 80, 78, 44, 70);
  d('bucci',       'Clemar Bucci',          'AR', 1913, 1954, 68, 68, 68, 68, 50, 50);
  d('flockhart',   'Ron Flockhart',         'GB', 1923, 1954, 76, 78, 76, 76, 46, 62);
  d('pilette',     'André Pilette',         'BE', 1918, 1954, 70, 72, 74, 72, 42, 60);

  // ---------------------------------------------------------------- 1955 ----
  d('brabham',     'Jack Brabham',          'AU', 1926, 1955, 88, 92, 88, 84, 38, 86);
  d('castellotti', 'Eugenio Castellotti',   'IT', 1930, 1955, 86, 80, 74, 80, 72, 62);
  d('perdisa',     'Cesare Perdisa',        'IT', 1932, 1955, 74, 74, 76, 72, 44, 62);

  // ---------------------------------------------------------------- 1956 ----
  d('brooks',      'Tony Brooks',           'GB', 1932, 1956, 90, 88, 88, 88, 34, 74);
  d('vontrips',    'Wolfgang von Trips',    'DE', 1928, 1956, 84, 82, 76, 82, 62, 68);
  d('gendebien',   'Olivier Gendebien',     'BE', 1924, 1956, 80, 84, 84, 82, 36, 70);
  d('bonnier',     'Jo Bonnier',            'SE', 1930, 1956, 78, 80, 80, 80, 44, 72);
  d('halford',     'Bruce Halford',         'GB', 1931, 1956, 68, 70, 72, 70, 44, 60);
  d('gould',       'Horace Gould',          'GB', 1918, 1956, 68, 70, 70, 68, 46, 54);

  // ---------------------------------------------------------------- 1957 ----
  d('gregory',     'Masten Gregory',        'US', 1932, 1957, 80, 78, 72, 78, 70, 62);
  d('lewisevans',  'Stuart Lewis-Evans',    'GB', 1930, 1957, 82, 80, 78, 80, 50, 66);
  d('fairman',     'Jack Fairman',          'GB', 1913, 1957, 70, 74, 76, 72, 34, 54);
  d('bueb',        'Ivor Bueb',             'GB', 1923, 1957, 72, 72, 72, 72, 48, 58);

  // ---------------------------------------------------------------- 1958 ----
  d('phillhill',   'Phil Hill',             'US', 1927, 1958, 86, 86, 86, 88, 36, 74);
  d('grahamhill',  'Graham Hill',           'GB', 1929, 1958, 87, 90, 88, 86, 40, 84);
  d('mclaren',     'Bruce McLaren',         'NZ', 1937, 1958, 84, 88, 88, 84, 32, 80);
  d('allison',     'Cliff Allison',         'GB', 1932, 1958, 76, 78, 78, 76, 46, 64);
  d('shelby',      'Carroll Shelby',        'US', 1923, 1958, 76, 78, 76, 76, 48, 58);
  d('stacey',      'Alan Stacey',           'GB', 1933, 1958, 74, 74, 74, 74, 50, 64);
  d('seidel',      'Wolfgang Seidel',       'DE', 1926, 1958, 66, 68, 70, 68, 42, 58);

  // ---------------------------------------------------------------- 1959 ----
  d('gurney',      'Dan Gurney',            'US', 1931, 1959, 90, 88, 82, 88, 46, 78);
  d('ireland',     'Innes Ireland',         'GB', 1930, 1959, 80, 78, 74, 80, 60, 66);
  d('bristow',     'Chris Bristow',         'GB', 1937, 1959, 78, 74, 70, 76, 74, 64);
  d('taylort',     'Trevor Taylor',         'GB', 1936, 1959, 76, 76, 74, 76, 54, 66);
  d('bianchil',    'Lucien Bianchi',        'BE', 1934, 1959, 76, 78, 78, 78, 44, 68);
  d('daigh',       'Chuck Daigh',           'US', 1923, 1959, 70, 70, 70, 68, 46, 54);

  // ---------------------------------------------------------------- 1960 ----
  d('clark',       'Jim Clark',             'GB', 1936, 1960, 98, 94, 92, 96, 34, 82);
  d('surtees',     'John Surtees',          'GB', 1934, 1960, 88, 88, 84, 88, 48, 76);
  d('ginther',     'Richie Ginther',        'US', 1930, 1960, 78, 84, 86, 78, 32, 70);
  d('taylorh',     'Henry Taylor',          'GB', 1932, 1960, 70, 72, 72, 72, 46, 60);

  // ---------------------------------------------------------------- 1961 ----
  d('baghetti',    'Giancarlo Baghetti',    'IT', 1934, 1961, 78, 78, 76, 76, 48, 62);
  d('bandini',     'Lorenzo Bandini',       'IT', 1935, 1961, 84, 82, 78, 82, 58, 70);
  d('maggs',       'Tony Maggs',            'ZA', 1937, 1961, 76, 78, 78, 76, 44, 66);
  d('rodriguezr',  'Ricardo Rodríguez',     'MX', 1942, 1961, 84, 78, 70, 80, 76, 66);
  d('lewisj',      'Jackie Lewis',          'GB', 1936, 1961, 70, 72, 72, 72, 46, 60);

  // ---------------------------------------------------------------- 1962 ----
  d('siffert',     'Jo Siffert',            'CH', 1936, 1962, 84, 84, 78, 84, 58, 72);
  d('vaccarella',  'Nino Vaccarella',       'IT', 1933, 1962, 74, 78, 78, 78, 44, 64);
  d('settember',   'Tony Settember',        'US', 1926, 1962, 66, 66, 68, 66, 46, 54);

  // ---------------------------------------------------------------- 1963 ----
  d('amon',        'Chris Amon',            'NZ', 1943, 1963, 90, 86, 80, 88, 44, 76);
  d('rodriguezp',  'Pedro Rodríguez',       'MX', 1940, 1963, 84, 84, 78, 88, 60, 74);
  d('spence',      'Mike Spence',           'GB', 1936, 1963, 78, 78, 78, 78, 46, 68);
  d('hailwood',    'Mike Hailwood',         'GB', 1940, 1963, 82, 84, 80, 84, 52, 72);
  d('andersonb',   'Bob Anderson',          'GB', 1931, 1963, 72, 74, 74, 74, 46, 60);

  // ---------------------------------------------------------------- 1964 ----
  d('rindt',       'Jochen Rindt',          'AT', 1942, 1964, 94, 88, 80, 90, 66, 74);
  d('attwood',     'Richard Attwood',       'GB', 1940, 1964, 76, 80, 82, 78, 36, 70);
  d('revson',      'Peter Revson',          'US', 1939, 1964, 82, 82, 80, 80, 48, 72);
  d('bondurant',   'Bob Bondurant',         'US', 1933, 1964, 72, 76, 76, 74, 42, 62);

  // ---------------------------------------------------------------- 1965 ----
  d('stewart',     'Jackie Stewart',        'GB', 1939, 1965, 95, 97, 95, 96, 26, 84);
  d('hulme',       'Denny Hulme',           'NZ', 1936, 1965, 84, 88, 90, 84, 32, 78);
  d('schlesser',   'Jo Schlesser',          'FR', 1928, 1965, 72, 74, 74, 74, 52, 58);

  // ---------------------------------------------------------------- 1966 ----
  d('ickx',        'Jacky Ickx',            'BE', 1945, 1966, 90, 90, 84, 96, 44, 80);
  d('courage',     'Piers Courage',         'GB', 1942, 1966, 82, 80, 76, 82, 58, 70);
  d('ligier',      'Guy Ligier',            'FR', 1930, 1966, 68, 72, 74, 70, 44, 58);
  d('irwin',       'Chris Irwin',           'GB', 1942, 1966, 74, 74, 74, 74, 52, 64);
  d('beltoise',    'Jean-Pierre Beltoise',  'FR', 1937, 1966, 80, 82, 80, 86, 46, 70);

  // ---------------------------------------------------------------- 1967 ----
  d('oliver',      'Jackie Oliver',         'GB', 1942, 1967, 76, 78, 78, 76, 50, 68);
  d('hobbs',       'David Hobbs',           'GB', 1939, 1967, 74, 78, 78, 76, 40, 66);

  // ---------------------------------------------------------------- 1968 ----
  d('elford',      'Vic Elford',            'GB', 1935, 1968, 78, 80, 78, 86, 48, 66);
  d('bell',        'Derek Bell',            'GB', 1941, 1968, 78, 82, 84, 80, 34, 76);
  d('pescarolo',   'Henri Pescarolo',       'FR', 1942, 1968, 76, 80, 82, 80, 42, 74);
  d('servozgavin', 'Johnny Servoz-Gavin',   'FR', 1942, 1968, 76, 74, 72, 76, 60, 62);

  // ---------------------------------------------------------------- 1969 ----
  d('stommelen',   'Rolf Stommelen',        'DE', 1943, 1969, 76, 78, 78, 78, 46, 70);

  // ---------------------------------------------------------------- 1970 ----
  d('fittipaldie', 'Emerson Fittipaldi',    'BR', 1946, 1970, 90, 92, 90, 88, 34, 80);
  d('regazzoni',   'Clay Regazzoni',        'CH', 1939, 1970, 84, 84, 78, 82, 58, 72);
  d('cevert',      'François Cevert',       'FR', 1944, 1970, 86, 84, 80, 84, 52, 74);
  d('peterson',    'Ronnie Peterson',       'SE', 1944, 1970, 92, 84, 76, 90, 62, 74);
  d('wisell',      'Reine Wisell',          'SE', 1941, 1970, 76, 76, 76, 76, 48, 66);
  d('schenken',    'Tim Schenken',          'AU', 1943, 1970, 76, 78, 78, 76, 46, 68);

  // ---------------------------------------------------------------- 1971 ----
  d('lauda',       'Niki Lauda',            'AT', 1949, 1971, 90, 95, 94, 88, 30, 88);
  d('ganley',      'Howden Ganley',         'NZ', 1941, 1971, 74, 76, 78, 76, 42, 66);
  d('marko',       'Helmut Marko',          'AT', 1943, 1971, 76, 76, 76, 78, 52, 66);
  d('jarier',      'Jean-Pierre Jarier',    'FR', 1946, 1971, 82, 78, 72, 82, 56, 70);
  d('beuttler',    'Mike Beuttler',         'GB', 1940, 1971, 68, 70, 72, 70, 46, 60);

  // ---------------------------------------------------------------- 1972 ----
  d('reutemann',   'Carlos Reutemann',      'AR', 1942, 1972, 90, 86, 78, 88, 40, 76);
  d('scheckter',   'Jody Scheckter',        'ZA', 1950, 1972, 86, 86, 82, 84, 60, 74);
  d('merzario',    'Arturo Merzario',       'IT', 1943, 1972, 76, 76, 74, 76, 56, 66);
  d('pace',        'Carlos Pace',           'BR', 1944, 1972, 84, 84, 80, 84, 48, 74);
  d('depailler',   'Patrick Depailler',     'FR', 1944, 1972, 82, 82, 76, 82, 58, 72);
  d('fittipaldiw', 'Wilson Fittipaldi',     'BR', 1943, 1972, 72, 74, 74, 74, 46, 64);

  // ---------------------------------------------------------------- 1973 ----
  d('hunt',        'James Hunt',            'GB', 1947, 1973, 90, 84, 76, 86, 66, 66);
  d('mass',        'Jochen Mass',           'DE', 1946, 1973, 78, 82, 82, 80, 40, 74);
  d('watson',      'John Watson',           'GB', 1946, 1973, 82, 86, 84, 82, 34, 78);

  // ---------------------------------------------------------------- 1974 ----
  d('stuckhj',     'Hans-Joachim Stuck',    'DE', 1951, 1974, 80, 78, 74, 84, 52, 72);
  d('brambilla',   'Vittorio Brambilla',    'IT', 1937, 1974, 78, 72, 66, 82, 78, 60);
  d('pryce',       'Tom Pryce',             'GB', 1949, 1974, 84, 80, 78, 86, 48, 74);
  d('lombardil',   'Lella Lombardi',        'IT', 1941, 1974, 70, 72, 74, 72, 40, 64);

  // ---------------------------------------------------------------- 1975 ----
  d('jones',       'Alan Jones',            'AU', 1946, 1975, 88, 88, 84, 84, 50, 76);
  d('brise',       'Tony Brise',            'GB', 1952, 1975, 82, 78, 74, 80, 56, 70);
  d('laffite',     'Jacques Laffite',       'FR', 1943, 1975, 82, 84, 80, 84, 42, 76);

  // ---------------------------------------------------------------- 1976 ----
  d('nilsson',     'Gunnar Nilsson',        'SE', 1948, 1976, 82, 80, 78, 84, 48, 72);
  d('perkins',     'Larry Perkins',         'AU', 1950, 1976, 72, 74, 74, 74, 46, 66);

  // ---------------------------------------------------------------- 1977 ----
  d('villeneuveg', 'Gilles Villeneuve',     'CA', 1950, 1977, 95, 84, 70, 96, 82, 70);
  d('patrese',     'Riccardo Patrese',      'IT', 1954, 1977, 84, 84, 82, 84, 52, 88);
  d('tambay',      'Patrick Tambay',        'FR', 1949, 1977, 80, 82, 82, 80, 38, 72);
  d('giacomelli',  'Bruno Giacomelli',      'IT', 1952, 1977, 78, 76, 72, 78, 54, 66);
  d('keegan',      'Rupert Keegan',         'GB', 1955, 1977, 70, 72, 72, 72, 52, 64);

  // ---------------------------------------------------------------- 1978 ----
  d('piquet',      'Nelson Piquet',         'BR', 1952, 1978, 90, 92, 88, 86, 44, 80);
  d('pironi',      'Didier Pironi',         'FR', 1952, 1978, 86, 84, 80, 84, 58, 72);
  d('rosberg',     'Keke Rosberg',          'FI', 1948, 1978, 86, 84, 78, 88, 60, 72);
  d('arnoux',      'René Arnoux',           'FR', 1948, 1978, 84, 80, 76, 82, 58, 70);
  d('daly',        'Derek Daly',            'IE', 1953, 1978, 74, 76, 76, 76, 50, 66);
  d('cheever',     'Eddie Cheever',         'US', 1958, 1978, 78, 80, 78, 78, 46, 74);

  // ---------------------------------------------------------------- 1979 ----
  d('deangelis',   'Elio de Angelis',       'IT', 1958, 1979, 84, 84, 84, 84, 40, 76);
  d('lammers',     'Jan Lammers',           'NL', 1956, 1979, 74, 76, 76, 76, 46, 70);
  d('surer',       'Marc Surer',            'CH', 1951, 1979, 76, 78, 78, 78, 44, 70);

  // ---------------------------------------------------------------- 1980 ----
  d('prost',       'Alain Prost',           'FR', 1955, 1980, 94, 98, 96, 88, 24, 86);
  d('mansell',     'Nigel Mansell',         'GB', 1953, 1980, 92, 88, 80, 90, 56, 80);
  d('decesaris',   'Andrea de Cesaris',     'IT', 1959, 1980, 78, 72, 62, 80, 80, 70);
  d('johansson',   'Stefan Johansson',      'SE', 1956, 1980, 78, 80, 80, 78, 42, 72);

  // ---------------------------------------------------------------- 1981 ----
  d('salazar',     'Eliseo Salazar',        'CL', 1954, 1981, 68, 70, 72, 70, 50, 64);
  d('borgudd',     'Slim Borgudd',          'SE', 1946, 1981, 68, 70, 70, 70, 46, 60);

  // ---------------------------------------------------------------- 1982 ----
  d('guerrero',    'Roberto Guerrero',      'CO', 1958, 1982, 74, 74, 74, 76, 50, 68);
  d('byrne',       'Tommy Byrne',           'IE', 1958, 1982, 76, 72, 68, 76, 60, 62);
  d('boesel',      'Raul Boesel',           'BR', 1957, 1982, 72, 74, 74, 74, 46, 68);

  // ---------------------------------------------------------------- 1983 ----
  d('boutsen',     'Thierry Boutsen',       'BE', 1957, 1983, 82, 82, 84, 84, 36, 74);
  d('palmer',      'Jonathan Palmer',       'GB', 1956, 1983, 72, 76, 78, 76, 36, 68);
  d('ghinzani',    'Piercarlo Ghinzani',    'IT', 1952, 1983, 70, 72, 72, 72, 46, 64);

  // ---------------------------------------------------------------- 1984 ----
  d('senna',       'Ayrton Senna',          'BR', 1960, 1984, 99, 94, 86, 99, 64, 82);
  d('berger',      'Gerhard Berger',        'AT', 1959, 1984, 86, 84, 80, 84, 54, 76);
  d('brundle',     'Martin Brundle',        'GB', 1959, 1984, 80, 84, 82, 82, 40, 74);
  d('bellof',      'Stefan Bellof',         'DE', 1957, 1984, 88, 80, 72, 90, 72, 70);
  d('alliot',      'Philippe Alliot',       'FR', 1954, 1984, 72, 74, 74, 74, 50, 66);

  // ---------------------------------------------------------------- 1985 ----
  d('capelli',     'Ivan Capelli',          'IT', 1963, 1985, 78, 78, 76, 78, 48, 70);
  d('danner',      'Christian Danner',      'DE', 1958, 1985, 70, 72, 74, 72, 44, 66);

  // ---------------------------------------------------------------- 1986 ----
  d('nannini',     'Alessandro Nannini',    'IT', 1959, 1986, 82, 80, 76, 82, 54, 70);
  d('dumfries',    'Johnny Dumfries',       'GB', 1958, 1986, 72, 74, 74, 74, 46, 66);

  // ---------------------------------------------------------------- 1987 ----
  d('nakajima',    'Satoru Nakajima',       'JP', 1953, 1987, 72, 76, 78, 78, 40, 64);
  d('caffi',       'Alex Caffi',            'IT', 1964, 1987, 74, 76, 76, 76, 46, 70);

  // ---------------------------------------------------------------- 1988 ----
  d('modena',      'Stefano Modena',        'IT', 1963, 1988, 78, 76, 74, 78, 52, 68);
  d('larini',      'Nicola Larini',         'IT', 1964, 1988, 74, 76, 76, 76, 44, 70);

  // ---------------------------------------------------------------- 1989 ----
  d('alesi',       'Jean Alesi',            'FR', 1964, 1989, 86, 80, 74, 88, 60, 74);
  d('herbert',     'Johnny Herbert',        'GB', 1964, 1989, 80, 82, 80, 82, 42, 74);
  d('lehto',       'JJ Lehto',              'FI', 1966, 1989, 76, 76, 74, 78, 50, 68);
  d('pirro',       'Emanuele Pirro',        'IT', 1962, 1989, 74, 78, 80, 76, 38, 72);
  d('donnelly',    'Martin Donnelly',       'GB', 1964, 1989, 78, 76, 74, 78, 54, 68);
  d('gachot',      'Bertrand Gachot',       'BE', 1962, 1989, 72, 74, 74, 74, 48, 68);

  // ---------------------------------------------------------------- 1990 ----
  d('bernard',     'Éric Bernard',          'FR', 1964, 1990, 74, 76, 76, 76, 46, 68);
  d('comas',       'Érik Comas',            'FR', 1963, 1990, 74, 76, 76, 76, 44, 68);

  // ---------------------------------------------------------------- 1991 ----
  d('schumacherm', 'Michael Schumacher',    'DE', 1969, 1991, 97, 97, 94, 97, 48, 90);
  d('hakkinen',    'Mika Häkkinen',         'FI', 1968, 1991, 92, 88, 86, 88, 44, 78);
  d('morbidelli',  'Gianni Morbidelli',     'IT', 1968, 1991, 72, 74, 76, 74, 42, 68);

  // ---------------------------------------------------------------- 1992 ----
  d('fittipaldic', 'Christian Fittipaldi',  'BR', 1971, 1992, 74, 76, 76, 76, 46, 70);
  d('wendlinger',  'Karl Wendlinger',       'AT', 1968, 1992, 76, 76, 76, 78, 48, 68);

  // ---------------------------------------------------------------- 1993 ----
  d('barrichello', 'Rubens Barrichello',    'BR', 1972, 1993, 86, 86, 86, 88, 36, 84);
  d('irvine',      'Eddie Irvine',          'GB', 1965, 1993, 82, 80, 78, 80, 58, 72);
  d('andretti',    'Michael Andretti',      'US', 1962, 1993, 78, 80, 78, 78, 46, 68);
  d('blundell',    'Mark Blundell',         'GB', 1966, 1993, 76, 78, 78, 78, 44, 70);

  // ---------------------------------------------------------------- 1994 ----
  d('coulthard',   'David Coulthard',       'GB', 1971, 1994, 86, 86, 86, 84, 34, 80);
  d('frentzen',    'Heinz-Harald Frentzen', 'DE', 1967, 1994, 86, 82, 80, 86, 42, 74);
  d('verstappenj', 'Jos Verstappen',        'NL', 1972, 1994, 78, 76, 72, 80, 58, 70);
  d('panis',       'Olivier Panis',         'FR', 1966, 1994, 80, 82, 82, 82, 40, 74);
  d('salo',        'Mika Salo',             'FI', 1966, 1994, 78, 80, 80, 80, 42, 72);

  // ---------------------------------------------------------------- 1995 ----
  d('magnussenj',  'Jan Magnussen',         'DK', 1973, 1995, 76, 74, 72, 76, 50, 66);

  // ---------------------------------------------------------------- 1996 ----
  d('villeneuvej', 'Jacques Villeneuve',    'CA', 1971, 1996, 88, 84, 82, 86, 50, 70);
  d('fisichella',  'Giancarlo Fisichella',  'IT', 1973, 1996, 84, 82, 80, 84, 44, 76);
  d('diniz',       'Pedro Diniz',           'BR', 1970, 1996, 68, 72, 74, 72, 44, 66);

  // ---------------------------------------------------------------- 1997 ----
  d('ralf',        'Ralf Schumacher',       'DE', 1975, 1997, 84, 82, 80, 84, 48, 72);
  d('trulli',      'Jarno Trulli',          'IT', 1974, 1997, 84, 78, 78, 82, 42, 74);

  // ---------------------------------------------------------------- 1998 ----
  d('wurz',        'Alexander Wurz',        'AT', 1974, 1998, 76, 80, 80, 78, 40, 70);
  d('takagi',      'Toranosuke Takagi',     'JP', 1974, 1998, 70, 72, 72, 72, 48, 64);

  // ---------------------------------------------------------------- 1999 ----
  d('zonta',       'Ricardo Zonta',         'BR', 1976, 1999, 74, 76, 76, 76, 44, 68);
  d('dellanoce',   'Luca Badoer',           'IT', 1971, 1999, 70, 72, 74, 72, 42, 66);

  // ---------------------------------------------------------------- 2000 ----
  d('button',      'Jenson Button',         'GB', 1980, 2000, 88, 88, 88, 92, 34, 82);
  d('delaRosa',    'Pedro de la Rosa',      'ES', 1971, 2000, 74, 78, 78, 78, 38, 70);

  // ---------------------------------------------------------------- 2001 ----
  d('alonso',      'Fernando Alonso',       'ES', 1981, 2001, 94, 96, 92, 94, 44, 92);
  d('raikkonen',   'Kimi Räikkönen',        'FI', 1979, 2001, 92, 88, 84, 90, 40, 82);
  d('montoya',     'Juan Pablo Montoya',    'CO', 1975, 2001, 90, 84, 78, 88, 60, 70);
  d('heidfeld',    'Nick Heidfeld',         'DE', 1977, 2001, 80, 84, 86, 82, 32, 76);

  // ---------------------------------------------------------------- 2002 ----
  d('webber',      'Mark Webber',           'AU', 1976, 2002, 86, 84, 82, 86, 44, 78);
  d('massa',       'Felipe Massa',          'BR', 1981, 2002, 86, 84, 80, 82, 48, 78);
  d('sato',        'Takuma Sato',           'JP', 1977, 2002, 78, 72, 68, 78, 68, 66);

  // ---------------------------------------------------------------- 2003 ----
  d('pizzonia',    'Antônio Pizzonia',      'BR', 1980, 2003, 72, 74, 74, 74, 46, 66);

  // ---------------------------------------------------------------- 2005 ----
  d('liuzzi',      'Vitantonio Liuzzi',     'IT', 1981, 2005, 72, 74, 74, 74, 48, 68);
  d('monteiro',    'Tiago Monteiro',        'PT', 1976, 2005, 70, 74, 76, 74, 38, 66);

  // ---------------------------------------------------------------- 2006 ----
  d('rosbergn',    'Nico Rosberg',          'DE', 1985, 2006, 88, 86, 86, 84, 36, 78);
  d('kubica',      'Robert Kubica',         'PL', 1984, 2006, 90, 88, 84, 90, 46, 76);
  d('speed',       'Scott Speed',           'US', 1983, 2006, 70, 72, 72, 72, 52, 64);

  // ---------------------------------------------------------------- 2007 ----
  d('hamiltonl',   'Lewis Hamilton',        'GB', 1985, 2007, 97, 96, 93, 97, 38, 92);
  d('vettel',      'Sebastian Vettel',      'DE', 1987, 2007, 94, 92, 88, 92, 42, 82);
  d('kovalainen',  'Heikki Kovalainen',     'FI', 1981, 2007, 80, 80, 80, 80, 42, 72);
  d('sutil',       'Adrian Sutil',          'DE', 1983, 2007, 76, 76, 76, 78, 50, 70);

  // ---------------------------------------------------------------- 2008 ----
  d('bourdais',    'Sébastien Bourdais',    'FR', 1979, 2008, 78, 80, 80, 80, 42, 70);
  d('piquetjr',    'Nelson Piquet Jr.',     'BR', 1985, 2008, 72, 72, 72, 74, 52, 64);

  // ---------------------------------------------------------------- 2009 ----
  d('grosjean',    'Romain Grosjean',       'FR', 1986, 2009, 82, 76, 72, 84, 62, 72);
  d('buemi',       'Sébastien Buemi',       'CH', 1988, 2009, 78, 80, 80, 80, 42, 74);
  d('alguersuari', 'Jaime Alguersuari',     'ES', 1990, 2009, 74, 76, 76, 76, 46, 70);

  // ---------------------------------------------------------------- 2010 ----
  d('hulkenberg',  'Nico Hülkenberg',       'DE', 1987, 2010, 86, 84, 84, 88, 38, 82);
  d('kobayashi',   'Kamui Kobayashi',       'JP', 1986, 2010, 80, 78, 74, 80, 60, 70);
  d('petrov',      'Vitaly Petrov',         'RU', 1984, 2010, 74, 74, 74, 76, 48, 68);
  d('dimbrosio',   "Jérôme d'Ambrosio",     'BE', 1985, 2010, 70, 72, 74, 72, 44, 66);

  // ---------------------------------------------------------------- 2011 ----
  d('perez',       'Sergio Pérez',          'MX', 1990, 2011, 84, 84, 82, 84, 44, 80);
  d('diresta',     'Paul di Resta',         'GB', 1986, 2011, 78, 80, 80, 78, 40, 72);
  d('ricciardo',   'Daniel Ricciardo',      'AU', 1989, 2011, 88, 88, 84, 86, 44, 76);

  // ---------------------------------------------------------------- 2012 ----
  d('vergne',      'Jean-Éric Vergne',      'FR', 1990, 2012, 80, 80, 80, 80, 44, 74);
  d('pic',         'Charles Pic',           'FR', 1990, 2012, 70, 72, 74, 72, 44, 66);

  // ---------------------------------------------------------------- 2013 ----
  d('bottas',      'Valtteri Bottas',       'FI', 1989, 2013, 86, 84, 86, 84, 32, 80);
  d('bianchi',     'Jules Bianchi',         'FR', 1989, 2013, 84, 82, 80, 84, 46, 76);
  d('gutierrez',   'Esteban Gutiérrez',     'MX', 1991, 2013, 72, 74, 74, 74, 46, 68);
  d('chilton',     'Max Chilton',           'GB', 1991, 2013, 68, 72, 76, 72, 38, 66);

  // ---------------------------------------------------------------- 2014 ----
  d('magnussenk',  'Kevin Magnussen',       'DK', 1992, 2014, 80, 78, 76, 80, 56, 74);
  d('kvyat',       'Daniil Kvyat',          'RU', 1994, 2014, 78, 76, 74, 80, 54, 70);
  d('ericsson',    'Marcus Ericsson',       'SE', 1990, 2014, 72, 74, 76, 74, 44, 70);

  // ---------------------------------------------------------------- 2015 ----
  d('verstappenm', 'Max Verstappen',        'NL', 1997, 2015, 98, 96, 92, 97, 50, 90);
  d('sainz',       'Carlos Sainz',          'ES', 1994, 2015, 86, 86, 86, 84, 38, 82);
  d('nasr',        'Felipe Nasr',           'BR', 1992, 2015, 74, 76, 76, 76, 42, 70);

  // ---------------------------------------------------------------- 2016 ----
  d('ocon',        'Esteban Ocon',          'FR', 1996, 2016, 82, 82, 82, 84, 46, 80);
  d('wehrlein',    'Pascal Wehrlein',       'DE', 1994, 2016, 78, 76, 76, 78, 48, 72);
  d('haryanto',    'Rio Haryanto',          'ID', 1993, 2016, 66, 68, 70, 68, 48, 62);

  // ---------------------------------------------------------------- 2017 ----
  d('stroll',      'Lance Stroll',          'CA', 1998, 2017, 76, 76, 76, 82, 48, 76);
  d('gasly',       'Pierre Gasly',          'FR', 1996, 2017, 84, 82, 80, 84, 46, 78);
  d('giovinazzi',  'Antonio Giovinazzi',    'IT', 1993, 2017, 76, 76, 76, 78, 46, 72);

  // ---------------------------------------------------------------- 2018 ----
  d('leclerc',     'Charles Leclerc',       'MC', 1997, 2018, 94, 88, 84, 92, 46, 86);
  d('sirotkin',    'Sergey Sirotkin',       'RU', 1995, 2018, 70, 72, 74, 74, 44, 68);
  d('hartley',     'Brendon Hartley',       'NZ', 1989, 2018, 74, 78, 78, 78, 40, 68);

  // ---------------------------------------------------------------- 2019 ----
  d('norris',      'Lando Norris',          'GB', 1999, 2019, 92, 88, 86, 90, 42, 86);
  d('russell',     'George Russell',        'GB', 1998, 2019, 92, 90, 90, 90, 36, 88);
  d('albon',       'Alexander Albon',       'TH', 1996, 2019, 82, 82, 82, 84, 42, 80);

  // ---------------------------------------------------------------- 2020 ----
  d('latifi',      'Nicholas Latifi',       'CA', 1995, 2020, 68, 70, 72, 72, 46, 66);

  // ---------------------------------------------------------------- 2021 ----
  d('tsunoda',     'Yuki Tsunoda',          'JP', 2000, 2021, 82, 78, 76, 82, 58, 78);
  d('schumacherm2','Mick Schumacher',       'DE', 1999, 2021, 76, 76, 78, 78, 42, 74);
  d('mazepin',     'Nikita Mazepin',        'RU', 1999, 2021, 66, 66, 66, 68, 62, 62);

  // ---------------------------------------------------------------- 2022 ----
  d('zhou',        'Zhou Guanyu',           'CN', 1999, 2022, 76, 78, 78, 78, 42, 74);
  d('devries',     'Nyck de Vries',         'NL', 1995, 2022, 74, 76, 78, 76, 44, 68);

  // ---------------------------------------------------------------- 2023 ----
  d('piastri',     'Oscar Piastri',         'AU', 2001, 2023, 92, 88, 88, 88, 36, 88);
  d('sargeant',    'Logan Sargeant',        'US', 2000, 2023, 68, 70, 70, 72, 50, 68);

  // ---------------------------------------------------------------- 2024 ----
  d('bearman',     'Oliver Bearman',        'GB', 2005, 2024, 80, 78, 78, 80, 48, 82);
  d('colapinto',   'Franco Colapinto',      'AR', 2003, 2024, 78, 76, 74, 78, 52, 78);

  // ---------------------------------------------------------------- 2025 ----
  d('antonelli',   'Kimi Antonelli',        'IT', 2006, 2025, 88, 84, 82, 86, 46, 88);
  d('hadjar',      'Isack Hadjar',          'FR', 2004, 2025, 82, 80, 78, 82, 48, 82);
  d('bortoleto',   'Gabriel Bortoleto',     'BR', 2004, 2025, 82, 80, 78, 82, 44, 82);
  d('doohan',      'Jack Doohan',           'AU', 2003, 2025, 76, 76, 76, 78, 48, 78);
  d('lawson',      'Liam Lawson',           'NZ', 2002, 2025, 80, 78, 78, 80, 48, 78);

  return out;
})();

/* Name pools for the procedural era. Once the historical roster runs dry the
 * sim keeps producing drivers so a game can run indefinitely. */
const NAME_POOL = {
  GB: { first: ['Oliver', 'Harry', 'Callum', 'Freddie', 'Jack', 'Alfie', 'Reuben', 'Toby'],
        last: ['Ashcroft', 'Wexford', 'Halloway', 'Pemberton', 'Crane', 'Whitlock', 'Radcliffe', 'Vance'] },
  IT: { first: ['Matteo', 'Lorenzo', 'Nicolò', 'Tommaso', 'Federico', 'Riccardo', 'Andrea', 'Giulio'],
        last: ['Marchetti', 'Bellandi', 'Corsaro', 'Rovelli', 'Fiorentino', 'Baldini', 'Tosca', 'Vialli'] },
  BR: { first: ['Gabriel', 'Rafael', 'Lucas', 'Enzo', 'Thiago', 'Bruno', 'Caio', 'Vinícius'],
        last: ['Aragão', 'Menezes', 'Cardoso', 'Bittencourt', 'Ferraz', 'Nogueira', 'Salgado', 'Rocha'] },
  FR: { first: ['Théo', 'Hugo', 'Lucas', 'Nathan', 'Enzo', 'Mathis', 'Léo', 'Clément'],
        last: ['Roussel', 'Vasseur', 'Delacroix', 'Marchand', 'Ferrand', 'Aubert', 'Lemoine', 'Chastain'] },
  DE: { first: ['Luca', 'Jonas', 'Felix', 'Maximilian', 'Niklas', 'Tim', 'Elias', 'Moritz'],
        last: ['Brandtner', 'Reichert', 'Weissmann', 'Kohlberg', 'Sauerbier', 'Vogt', 'Hendricks', 'Adler'] },
  ES: { first: ['Álvaro', 'Diego', 'Pablo', 'Javier', 'Marc', 'Adrián', 'Iker', 'Rubén'],
        last: ['Solano', 'Bermúdez', 'Ferrer', 'Otero', 'Cabrera', 'Iglesias', 'Reyes', 'Palomar'] },
  NL: { first: ['Daan', 'Sem', 'Luuk', 'Bram', 'Thijs', 'Ruben', 'Jesse', 'Stijn'],
        last: ['Van Doorn', 'Bakhuis', 'De Ruyter', 'Vermeer', 'Hooghart', 'Van Leeuwen', 'Smits', 'Kuipers'] },
  FI: { first: ['Eero', 'Väinö', 'Onni', 'Aarne', 'Toivo', 'Elias', 'Niilo', 'Sulo'],
        last: ['Lahtinen', 'Virtanen', 'Koskela', 'Rautio', 'Hietala', 'Nieminen', 'Salminen', 'Toivonen'] },
  AU: { first: ['Cooper', 'Jasper', 'Hudson', 'Archie', 'Lachlan', 'Flynn', 'Beau', 'Angus'],
        last: ['Braddock', 'Corrigan', 'Marsden', 'Hollis', 'Kirby', 'Trescott', 'Danvers', 'Oakley'] },
  US: { first: ['Colton', 'Bryce', 'Wyatt', 'Chase', 'Hunter', 'Blake', 'Cade', 'Grayson'],
        last: ['Whitaker', 'Danforth', 'Boone', 'Kessler', 'Rand', 'Holloway', 'Sutter', 'Voss'] },
  JP: { first: ['Haruto', 'Sota', 'Ren', 'Yuma', 'Riku', 'Kaito', 'Hinata', 'Asahi'],
        last: ['Kurosawa', 'Tachibana', 'Miyamoto', 'Sakaguchi', 'Hoshino', 'Aoyama', 'Fujiwara', 'Nakahara'] },
  AR: { first: ['Mateo', 'Benjamín', 'Santiago', 'Thiago', 'Joaquín', 'Bautista', 'Ignacio', 'Tomás'],
        last: ['Quiroga', 'Beltrán', 'Ledesma', 'Arriola', 'Zabala', 'Fuentes', 'Escalante', 'Duarte'] },
};

const NAME_POOL_WEIGHTS = [
  ['GB', 16], ['IT', 12], ['BR', 10], ['FR', 10], ['DE', 9], ['ES', 7],
  ['NL', 6], ['FI', 6], ['AU', 6], ['US', 7], ['JP', 5], ['AR', 6],
];
