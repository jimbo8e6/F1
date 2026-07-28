/* Driver careers: arriving, getting hurt, losing a drive, growing old, stopping.
 *
 * Nobody dies in this timeline. The worst an accident can do is end a career —
 * which it does often enough in the early decades to reshape the sport. */

function blankCareer() {
  return {
    starts: 0, wins: 0, podiums: 0, poles: 0, fastestLaps: 0,
    points: 0, titles: 0, bestFinish: null, seasonsRun: 0,
  };
}

function createDriverState(def) {
  /* The defaults go first so anything the caller supplies — notably the
   * `procedural` flag on generated drivers — survives the merge. */
  return Object.assign({
    status: 'pending',      // pending | active | injured | resting | retired
    teamId: null,
    career: blankCareer(),
    seasons: [],
    story: [],              // notable career moments, for the driver page
    missRounds: 0,          // races still to sit out
    outUntilSeason: null,   // set when an injury ends a driver's year
    barrenYears: 0,         // consecutive seasons without a meaningful result
    contractYears: 0,       // seasons still owed to the current team
    retiredYear: null,
    retiredReason: null,
    procedural: false,
  }, def);
}

/* ---------------------------------------------------- procedural drivers ---- */

let proceduralCount = 0;

/* `elite` controls the talent ceiling. While the historical roster is still
 * feeding real debutants into the championship, generated drivers exist only to
 * fill out a grid — they can be respectable, but a fictional name should not be
 * taking titles off Clark and Moss. Once history runs out they get the full
 * distribution, tail and all, so the sport keeps producing greats. */
function generateDriver(year, rng, elite = true) {
  const total = NAME_POOL_WEIGHTS.reduce((a, w) => a + w[1], 0);
  let roll = rng.next() * total;
  let nat = 'GB';
  for (const [code, weight] of NAME_POOL_WEIGHTS) {
    roll -= weight;
    if (roll <= 0) { nat = code; break; }
  }
  const pool = NAME_POOL[nat];
  const name = `${rng.pick(pool.first)} ${rng.pick(pool.last)}`;

  /* Most arrivals are ordinary. A few are exceptional — the tail of this
   * distribution is where future champions come from. */
  const tier = rng.next();
  const base = elite
    ? (tier > 0.96 ? rng.int(90, 97)
      : tier > 0.85 ? rng.int(82, 90)
      : tier > 0.55 ? rng.int(74, 83)
      : rng.int(66, 76))
    : (tier > 0.88 ? rng.int(76, 84)
      : tier > 0.55 ? rng.int(70, 78)
      : rng.int(62, 72));

  const spread = () => Math.max(50, Math.min(99, base + rng.int(-7, 7)));
  const age = rng.int(19, 25);

  proceduralCount += 1;
  return createDriverState({
    id: `gen_${year}_${proceduralCount}`,
    name,
    nat,
    born: year - age,
    debut: year,
    pace: base,
    craft: spread(),
    cons: spread(),
    wet: spread(),
    risk: rng.int(25, 78),
    longevity: rng.int(50, 92),
    procedural: true,
  });
}

/* ------------------------------------------------------------- accidents ---- */

/* Decide what an accident costs the driver. Called only when a crash has already
 * been rolled as consequential for the era. */
function resolveAccident(driver, year, roundsLeft, rng) {
  const roll = rng.next();
  /* Older drivers recover more slowly and are likelier to be finished by a
   * heavy one. */
  const frailty = Math.max(0, (year - driver.born - 33)) * 0.012;

  if (roll < 0.45 - frailty) {
    return { kind: 'minor', races: 0 };
  }
  if (roll < 0.76 - frailty) {
    return { kind: 'miss', races: rng.int(1, 3) };
  }
  if (roll < 0.92 - frailty) {
    return { kind: 'season', races: roundsLeft };
  }
  return { kind: 'career', races: 0 };
}

function applyAccident(driver, outcome, year, round) {
  if (outcome.kind === 'minor') return;

  if (outcome.kind === 'career') {
    driver.status = 'retired';
    driver.retiredYear = year;
    driver.retiredReason = 'injury';
    driver.teamId = null;
    driver.story.push({ year, round, type: 'careerEnding',
      text: 'Career ended by injuries sustained in a Grand Prix accident.' });
    return;
  }
  if (outcome.kind === 'season') {
    driver.status = 'injured';
    driver.outUntilSeason = year + 1;
    driver.missRounds = 999;
    driver.story.push({ year, round, type: 'injury',
      text: 'Seriously injured; sidelined for the rest of the season.' });
    return;
  }
  driver.status = 'injured';
  driver.missRounds = outcome.races;
  driver.story.push({ year, round, type: 'injury',
    text: `Injured in an accident; expected to miss ${outcome.races} race${outcome.races > 1 ? 's' : ''}.` });
}

/* --------------------------------------------------------------- illness ---- */

function rollIllness(driver, year, rng) {
  const age = year - driver.born;
  const p = 0.010 + Math.max(0, age - 38) * 0.002;
  if (!rng.chance(p)) return null;
  return rng.int(1, 2);
}

/* ------------------------------------------------------------ retirement ---- */

/* Chance a driver calls it a career over the winter. Age dominates, but a run of
 * seasons with nothing to show for it will push a driver out early — and a
 * driver still winning races rarely walks away. */
function retirementChance(driver, year, hadSeat) {
  const age = year - driver.born;
  const lon = driver.longevity / 100;

  let p = 0;
  if (age >= 30) p += Math.pow((age - 29) / 12, 2.1) * (1.25 - lon);
  if (age >= 40) p += (age - 39) * 0.05;
  if (age >= 46) p += 0.18;

  p += driver.barrenYears * 0.11;
  if (!hadSeat) p += 0.38;

  const last = driver.seasons[driver.seasons.length - 1];
  if (last) {
    if (last.wins > 0) p *= 0.35;
    else if (last.podiums > 0) p *= 0.62;
    if (last.titles) p *= 0.5;
  }
  return Math.max(0, Math.min(0.96, p));
}

function retireDriver(driver, year, reason) {
  driver.status = 'retired';
  driver.retiredYear = year;
  driver.retiredReason = reason;
  driver.teamId = null;
  driver.contractYears = 0;
  const label = {
    age: 'Retired from Grand Prix racing.',
    form: 'Retired after a run of seasons without results.',
    noSeat: 'Left the championship, unable to find a drive.',
  }[reason] || 'Retired.';
  driver.story.push({ year, round: null, type: 'retirement', text: label });
}

/* --------------------------------------------------------- seat allocation -- */

/* What a team sees when it looks at a driver: current ability, weighted by what
 * they actually did last season. */
function reputation(driver, year) {
  const r = ratings(driver, year);
  const ability = 0.55 * r.pace + 0.30 * r.craft + 0.15 * r.cons;

  const last = driver.seasons[driver.seasons.length - 1];
  let form = 0;
  if (last) {
    form = last.wins * 9 + last.podiums * 3.5 + Math.min(last.points, 60) * 0.22;
    if (last.titles) form += 18;
  }
  /* Unraced talent gets the benefit of the doubt for a couple of seasons. */
  const unknown = driver.career.starts < 8 ? 6 : 0;
  return ability + Math.min(form, 32) + unknown;
}

/* Hand out every seat on the grid for a season. Teams choose in order of
 * competitiveness; drivers who held a seat there last year get a loyalty edge,
 * and everyone else is picked with a bias toward reputation rather than a
 * strict ranking, so the market has some churn in it. */
function assignSeats(world, teams, rng) {
  const year = world.year;
  const cap = ERA.gridCap(year);

  const pool = Object.values(world.drivers).filter(d =>
    (d.status === 'active' || d.status === 'pending') && d.debut <= year);

  for (const d of pool) d._rep = reputation(d, year) + rng.gauss(0, 4.5);

  /* Work out how many cars each team enters. In eras with only a handful of
   * constructors the works teams ran three, four, even five cars to make a
   * grid; in the modern era it is two apiece and the count barely moves. */
  const base = ERA.seats(year);
  const counts = teams.map(() => base);
  let total = base * teams.length;
  for (let i = 0; total < cap && i < teams.length * 4; i++) {
    const idx = i % teams.length;
    if (counts[idx] < 5) { counts[idx] += 1; total += 1; }
  }

  /* Order the seats the way the driver market fills them: every team lands a
   * lead driver before anyone signs a second, but a front-running team's second
   * seat is still more attractive than a backmarker's first. */
  const slots = [];
  teams.forEach((team, idx) => {
    for (let s = 0; s < counts[idx]; s++) {
      slots.push({ team, priority: s * 1.4 - (team.car / 100) });
    }
  });
  slots.sort((a, b) => a.priority - b.priority);

  const seatPlan = slots.slice(0, cap).map(s => s.team);

  const available = pool.slice().sort((a, b) => b._rep - a._rep);
  const taken = new Set();
  const assignments = [];

  /* Contracts come first. Without them the market re-forms from scratch every
   * winter and the fastest driver simply walks into the fastest car every year,
   * which is how one man ends up with fourteen titles. Being locked in at the
   * wrong team for a season or two is what makes a career have bad luck in it. */
  const seatsLeft = new Map();
  for (const team of seatPlan) seatsLeft.set(team, (seatsLeft.get(team) || 0) + 1);

  for (const d of pool) {
    if (!d.contractYears || d.contractYears <= 0 || !d.teamId) continue;
    const team = teams.find(t => t.id === d.teamId);
    if (!team || !seatsLeft.get(team)) { d.contractYears = 0; continue; }

    /* A team will still tear up a contract for someone who has stopped
     * delivering. */
    const last = d.seasons[d.seasons.length - 1];
    if (last && last.points === 0 && last.starts >= 4 && rng.chance(0.45)) {
      d.contractYears = 0;
      continue;
    }

    d.contractYears -= 1;
    seatsLeft.set(team, seatsLeft.get(team) - 1);
    taken.add(d.id);
    assignments.push({ driver: d, team });
  }

  /* Everything still open goes to the open market, best seats first. */
  for (const team of seatPlan) {
    if (!seatsLeft.get(team)) continue;
    seatsLeft.set(team, seatsLeft.get(team) - 1);

    let best = null, bestScore = -Infinity;
    /* Look at a shortlist rather than always taking the very best available —
     * teams have preferences, budgets and history. */
    const shortlist = available.filter(d => !taken.has(d.id)).slice(0, 8);
    for (const d of shortlist) {
      let score = d._rep;
      if (d.teamId === team.id) score += 9;          // incumbency
      if (d.nat === team.nat) score += 2.5;          // national affinity
      score += rng.gauss(0, 3);
      if (score > bestScore) { bestScore = score; best = d; }
    }
    if (!best) break;
    taken.add(best.id);
    assignments.push({ driver: best, team });
    /* A new deal runs one to three more seasons beyond this one. */
    best.contractYears = rng.int(1, 3);
  }

  /* Everyone who did not get a seat is out of the championship this year. */
  const seated = new Set(assignments.map(a => a.driver.id));
  for (const d of pool) {
    if (!seated.has(d.id)) {
      d.teamId = null;
      d.contractYears = 0;
      if (d.status === 'active') d.status = 'resting';
    }
  }
  for (const a of assignments) {
    a.driver.teamId = a.team.id;
    a.driver.status = 'active';
  }
  return assignments;
}

/* ------------------------------------------------------------- offseason ---- */

function runOffseason(world, rng) {
  const year = world.year;

  for (const d of Object.values(world.drivers)) {
    if (d.status === 'retired') continue;

    /* Injured drivers who lost a season come back for the next one. */
    if (d.status === 'injured') {
      if (d.outUntilSeason && year + 1 >= d.outUntilSeason) {
        d.status = 'active';
        d.missRounds = 0;
        d.outUntilSeason = null;
        d.story.push({ year: year + 1, round: null, type: 'return',
          text: 'Returned to the championship after injury.' });
      } else {
        d.missRounds = 0;
        d.status = 'active';
      }
    }

    if (d.status !== 'active' && d.status !== 'resting') continue;
    if (d.career.starts === 0 && d.debut > year) continue;

    /* Track fallow seasons — the trigger for drivers who simply stop being
     * competitive. */
    const last = d.seasons[d.seasons.length - 1];
    if (last && last.points === 0 && last.starts >= 3) d.barrenYears += 1;
    else if (last) d.barrenYears = 0;

    const hadSeat = !!d.teamId;
    const p = retirementChance(d, year, hadSeat);
    if (rng.chance(p)) {
      const age = year - d.born;
      const reason = !hadSeat ? 'noSeat' : (d.barrenYears >= 2 && age < 36 ? 'form' : 'age');
      retireDriver(d, year, reason);
    }
  }
}
