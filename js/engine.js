/* The simulation core: deterministic randomness, driver ratings over a career,
 * and the race model itself. */

/* ---------------------------------------------------------------- random ---- */

/* A small seeded generator, so a saved game replays identically and a season
 * can be re-simulated from its seed if needed. */
function makeRng(seed) {
  let s = seed >>> 0;
  const next = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    seed: () => s,
    /* Normally distributed, via Box-Muller. */
    gauss(mean = 0, sd = 1) {
      let u = 0, v = 0;
      while (u === 0) u = next();
      while (v === 0) v = next();
      return mean + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    },
    int(min, max) { return Math.floor(next() * (max - min + 1)) + min; },
    chance(p) { return next() < p; },
    pick(arr) { return arr[Math.floor(next() * arr.length)]; },
    shuffle(arr) {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    },
  };
}

/* ---------------------------------------------------------------- ratings --- */

/* How ability tracks with age. Drivers arrive short of their peak, hold it
 * through their late twenties and early thirties, then decline at a rate set by
 * their longevity — which is why Fangio is still winning at forty-six and others
 * are finished by thirty-four. */
function ageFactor(age, longevity) {
  const PEAK_START = 27, PEAK_END = 33;
  if (age < PEAK_START) {
    const gap = PEAK_START - age;
    return Math.max(0.55, 1 - Math.pow(gap / 10, 1.5) * 0.55);
  }
  if (age <= PEAK_END) return 1;
  const past = age - PEAK_END;
  const perYear = 0.032 - (longevity / 100) * 0.023;
  return Math.max(0.40, 1 - past * perYear);
}

/* Experience sharpens racecraft well after raw speed has stopped improving.
 *
 * Grand Prix starts alone are a poor measure of it: the 1950 field had raced for
 * years — some of them before the war — and the championship's very first race
 * cannot treat a 43-year-old veteran as a novice. Age stands in for everything
 * that happened before a driver's first championship round. */
function experienceFactor(starts, age) {
  const priorSeasons = Math.max(0, Math.min(age - 21, 12));
  const effective = starts + priorSeasons * 5;
  return Math.min(1, 0.72 + Math.min(effective, 60) / 60 * 0.28);
}

/* A driver's effective abilities in a given season. */
function ratings(driver, year) {
  const age = year - driver.born;
  const af = ageFactor(age, driver.longevity);
  const xf = experienceFactor(driver.career.starts, age);
  return {
    age,
    pace: driver.pace * af,
    craft: driver.craft * af * xf,
    cons: driver.cons * (0.80 + 0.20 * xf) * Math.min(1, af + 0.10),
    wet: driver.wet * af,
    risk: driver.risk * (age < 24 ? 1.18 : age > 36 ? 0.86 : 1),
  };
}

/* The driver's share of the overall performance equation. In 1950 a great driver
 * could drag an ordinary car a long way up the order; by the modern era the
 * machinery decides far more. */
function driverWeight(year) {
  const t = Math.min(1, Math.max(0, (year - 1950) / 70));
  return 0.46 - t * 0.13;
}

const OVERTAKE_DIFFICULTY = {
  street: 0.55, technical: 0.30, classic: 0.22, fast: 0.16, oval: 0.12,
};

const MECHANICAL_STRESS = {
  fast: 1.18, classic: 1.22, oval: 1.20, technical: 1.0, street: 0.92,
};

const ACCIDENT_RISK = {
  street: 1.55, classic: 1.35, oval: 1.25, fast: 1.05, technical: 1.0,
};

/* ------------------------------------------------------------------- race --- */

/* Simulate one Grand Prix.
 *
 * `entries` is a list of { driver, team, car } where `car` is the constructor's
 * effective strength this season. Drivers sitting out injured or ill have
 * already been filtered out by the season loop.
 */
function simulateRace(entries, circuit, year, rng) {
  const dw = driverWeight(year);
  const wet = rng.chance(rainChance(circuit.id));
  /* A drying or worsening track — the races that produce the strangest results. */
  const mixed = wet && rng.chance(0.35);

  const field = entries.map(e => {
    const r = ratings(e.driver, year);
    const wetPull = wet ? (r.wet - r.pace) * (mixed ? 0.62 : 0.45) : 0;
    /* Every driver carries a form figure for the season — the reason careers
     * have peaks and troughs that ability alone does not explain. */
    const form = e.form || 0;

    const qual = dw * (r.pace + form) + (1 - dw) * e.car + wetPull * 0.7 + rng.gauss(0, 3.6);
    const pace = dw * (0.56 * r.pace + 0.44 * r.craft + form) + (1 - dw) * e.car + wetPull;

    return { entry: e, r, qual, pace, gridPos: 0, status: 'running', lap: 0 };
  });

  // ------------------------------------------------------------ qualifying --
  field.sort((a, b) => b.qual - a.qual);
  field.forEach((f, i) => { f.gridPos = i + 1; });

  const events = [];
  const size = field.length;

  // ----------------------------------------------------------------- race --
  const attrition = ERA.attrition(year) * (MECHANICAL_STRESS[circuit.character] || 1);
  const accidentBase = ERA.accident(year) * (ACCIDENT_RISK[circuit.character] || 1) * (wet ? 2.1 : 1);

  for (const f of field) {
    const e = f.entry;

    /* Better-funded teams break down less often. Car strength stands in for
     * resources; a season-specific reliability roll adds the rest. */
    const reliability = 1.30 - (e.car / 100) * 0.55;
    const mechP = Math.min(0.72, attrition * reliability * (e.reliabilityMod || 1));

    /* Aggressive drivers crash more; consistent ones crash less. Starting deep
     * in the field means more traffic and more chances to be collected. */
    const crowding = 1 + (f.gridPos / size) * 0.45;
    const crashP = Math.min(0.45,
      accidentBase * (f.r.risk / 50) * (1.35 - f.r.cons / 160) * crowding);

    if (rng.chance(mechP)) {
      f.status = 'mechanical';
      f.lap = rng.int(1, 90);
    } else if (rng.chance(crashP)) {
      f.status = 'accident';
      f.lap = rng.int(1, 90);
      /* First-lap incidents read differently in a race report, so mark them. */
      f.firstLap = f.lap <= 2;
    }
  }

  /* Work out what actually caused each accident, and who else was caught up in
   * it. A race report that says a driver was hurt without saying how reads like
   * a non-sequitur, so every accident carries a cause from here on. */
  const crashed = field.filter(f => f.status === 'accident');

  for (const f of crashed) {
    if (f.cause) continue;                  // already assigned as someone else's victim
    if (f.firstLap) { f.cause = 'start'; continue; }

    const roll = rng.next();
    if (wet && roll < 0.30) f.cause = 'weather';
    else if (roll < 0.56) f.cause = 'error';
    else if (roll < 0.80) f.cause = 'collision';
    else f.cause = 'failure';               // something broke and pitched them off
  }

  /* Pair up the accidents that involved two cars. The other party is someone
   * they were plausibly racing — near them on the grid — and does not always
   * retire from it. */
  for (const f of crashed) {
    if (f.partnerId) continue;
    if (f.cause !== 'collision' && f.cause !== 'start') continue;

    const pool = field.filter(o => o !== f && !o.partnerId &&
      Math.abs(o.gridPos - f.gridPos) <= 6 &&
      (o.status === 'running' || (o.status === 'accident' && !o.cause)));

    if (!pool.length) {
      /* Nobody was near enough — call it a mistake instead of inventing a
       * collision with nobody. */
      if (f.cause === 'collision') f.cause = 'error';
      continue;
    }

    const other = pool[Math.floor(rng.next() * pool.length)];
    /* Linked by id, never by object reference: the pair point at each other, and
     * a cycle here would make the whole world unserialisable. */
    f.partnerId = other.entry.driver.id;
    other.partnerId = f.entry.driver.id;

    if (other.status === 'running' && !rng.chance(0.55)) {
      /* Survived the contact and carried on, damaged. */
      other.survivedContact = true;
      f.partnerRetired = false;
    } else {
      other.status = 'accident';
      other.lap = f.lap;
      other.cause = f.cause;
      other.firstLap = f.firstLap;
      other.taggedIn = true;                // reported as part of the same incident
      other.partnerRetired = true;
      f.partnerRetired = true;
    }
  }

  /* Where a driver ends up: race pace, plus how hard this circuit makes passing,
   * plus the day's noise. */
  const finishers = field.filter(f => f.status === 'running');
  const difficulty = OVERTAKE_DIFFICULTY[circuit.character] || 0.3;

  for (const f of finishers) {
    const gridPull = (size - f.gridPos) * difficulty;
    f.final = f.pace + gridPull + rng.gauss(0, 2.8);
  }
  finishers.sort((a, b) => b.final - a.final);
  finishers.forEach((f, i) => { f.pos = i + 1; });

  /* Fastest lap tends to fall to a quick car running free — often the winner,
   * sometimes someone recovering from the back on fresh tyres. */
  let flCandidates = finishers.slice(0, Math.max(1, Math.ceil(finishers.length * 0.5)));
  const fl = flCandidates.length
    ? flCandidates[Math.min(flCandidates.length - 1, Math.floor(Math.abs(rng.gauss(0, 1.6)))) ]
    : null;

  // -------------------------------------------------------------- results --
  const retirements = field.filter(f => f.status !== 'running')
    .sort((a, b) => b.lap - a.lap);

  const results = finishers.map(f => ({
    driverId: f.entry.driver.id,
    teamId: f.entry.team.id,
    pos: f.pos,
    gridPos: f.gridPos,
    status: 'finished',
    lap: null,
    /* Carried on after contact — worth a clause in the report. */
    contactWith: f.survivedContact ? f.partnerId : null,
  })).concat(retirements.map(f => ({
    driverId: f.entry.driver.id,
    teamId: f.entry.team.id,
    pos: null,
    gridPos: f.gridPos,
    status: f.status,
    lap: f.lap,
    firstLap: !!f.firstLap,
    cause: f.cause || null,
    withDriverId: f.partnerId || null,
    /* True when this car was collected in someone else's accident, so the
     * report describes the incident once rather than twice. */
    taggedIn: !!f.taggedIn,
    partnerRetired: !!f.partnerRetired,
  })));

  return {
    circuitId: circuit.id,
    gp: circuit.gp,
    venue: circuit.venue,
    country: circuit.country,
    character: circuit.character,
    year,
    wet,
    mixed,
    polePosition: field[0].entry.driver.id,
    fastestLap: fl ? fl.entry.driver.id : null,
    results,
    field,
    events,
  };
}

/* Award championship points for a finished race. */
function awardPoints(race, year) {
  const sys = pointsSystem(year);
  const table = {};

  for (const r of race.results) {
    let pts = 0;
    if (r.pos && r.pos <= sys.points.length) pts = sys.points[r.pos - 1];
    r.points = pts;
    table[r.driverId] = pts;
  }

  if (sys.fl && race.fastestLap) {
    const holder = race.results.find(r => r.driverId === race.fastestLap);
    /* From 2019 the bonus point only counts inside the top ten. */
    const eligible = year < 2019 || (holder && holder.pos && holder.pos <= 10);
    if (holder && eligible) {
      holder.points += sys.fl;
      table[holder.driverId] = holder.points;
    }
  }
  return table;
}

/* Championship totals, honouring the dropped-scores rules of the early decades. */
function championshipTotal(scores, year, rounds) {
  const sys = pointsSystem(year);
  if (!sys.drop) return scores.reduce((a, b) => a + b, 0);
  const counting = Math.max(1, Math.floor(rounds * 0.7));
  return scores.slice().sort((a, b) => b - a).slice(0, counting).reduce((a, b) => a + b, 0);
}
