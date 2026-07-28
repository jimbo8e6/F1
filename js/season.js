/* Season orchestration: building calendars and grids, running rounds, keeping
 * the championship tables, and rolling the world on into the next year. */

/* The last season with real debut data behind it. Past this point the
 * championship is entirely the simulation's invention. */
const LAST_HISTORICAL_YEAR = 2025;

/* Roughly where each event sits in the year, so calendars read in a plausible
 * order regardless of which venues are active. */
const GP_ORDER = {
  'Argentine Grand Prix': 10, 'Brazilian Grand Prix': 12, 'Australian Grand Prix': 14,
  'South African Grand Prix': 16, 'Bahrain Grand Prix': 18, 'Saudi Arabian Grand Prix': 19,
  'Chinese Grand Prix': 22, 'Miami Grand Prix': 24, 'Spanish Grand Prix': 30,
  'Monaco Grand Prix': 34, 'Indianapolis 500': 35, 'San Marino Grand Prix': 32,
  'Belgian Grand Prix': 40, 'Dutch Grand Prix': 42, 'Swiss Grand Prix': 44,
  'Canadian Grand Prix': 46, 'French Grand Prix': 50, 'British Grand Prix': 54,
  'German Grand Prix': 58, 'Austrian Grand Prix': 60, 'Hungarian Grand Prix': 62,
  'Malaysian Grand Prix': 20, 'Turkish Grand Prix': 64, 'European Grand Prix': 66,
  'Italian Grand Prix': 70, 'Portuguese Grand Prix': 72, 'Singapore Grand Prix': 74,
  'Russian Grand Prix': 75, 'Japanese Grand Prix': 78, 'Korean Grand Prix': 76,
  'United States Grand Prix': 80, 'United States Grand Prix West': 26,
  'Detroit Grand Prix': 56, 'Mexican Grand Prix': 84, 'Azerbaijan Grand Prix': 44,
  'Qatar Grand Prix': 86, 'Las Vegas Grand Prix': 88, 'Abu Dhabi Grand Prix': 92,
};

function buildCalendar(year, rng) {
  const eligible = CIRCUITS.filter(c => year >= c.from && year <= c.to);

  /* One venue per Grand Prix — the British round is at Silverstone or Aintree or
   * Brands Hatch, never all three. */
  const byGp = {};
  for (const c of eligible) {
    if (!byGp[c.gp]) byGp[c.gp] = [];
    byGp[c.gp].push(c);
  }
  const chosen = Object.keys(byGp).map(gp => {
    const opts = byGp[gp];
    return opts.length === 1 ? opts[0] : opts[Math.floor(rng.next() * opts.length)];
  });

  chosen.sort((a, b) => (GP_ORDER[a.gp] || 50) - (GP_ORDER[b.gp] || 50));

  const target = calendarSize(year);
  if (chosen.length <= target) return chosen;

  /* Too many candidates: keep the classics and rotate the rest. */
  const core = chosen.filter(c => ['monaco', 'monza', 'silverstone', 'spa'].includes(c.id));
  const rest = chosen.filter(c => !core.includes(c));
  const keep = rest.slice(0, Math.max(0, target - core.length));
  const cal = core.concat(keep);
  cal.sort((a, b) => (GP_ORDER[a.gp] || 50) - (GP_ORDER[b.gp] || 50));
  return cal;
}

function interpolateForm(form, year) {
  if (year <= form[0][0]) return form[0][1];
  if (year >= form[form.length - 1][0]) return form[form.length - 1][1];
  for (let i = 0; i < form.length - 1; i++) {
    const [y1, v1] = form[i], [y2, v2] = form[i + 1];
    if (year >= y1 && year <= y2) {
      const t = (year - y1) / (y2 - y1);
      return v1 + (v2 - v1) * t;
    }
  }
  return form[form.length - 1][1];
}

function activeTeams(world, rng) {
  const year = world.year;
  const out = [];
  for (const def of TEAMS) {
    if (year < def.from || year > def.to) continue;
    if (!world.teamState[def.id]) {
      world.teamState[def.id] = { drift: 0, history: [] };
    }
    const st = world.teamState[def.id];

    /* Fortunes wander away from the historical baseline as the years pass, but
     * they are pulled back toward it too — without that reversion a team that
     * drifts upward early simply stays on top forever, and the championship
     * stops turning over. Once the historical form curves run out there is no
     * baseline left to respect, so the leash gets much longer and the order of
     * the grid is free to reinvent itself across the decades. */
    const past = year > LAST_HISTORICAL_YEAR;
    const pull = past ? 0.94 : 0.85;
    const spread = past ? 3.0 : 2.0;
    const bound = past ? 30 : 16;

    st.drift = Math.max(-bound, Math.min(bound, st.drift * pull + rng.gauss(0, spread)));
    const car = Math.max(18, Math.min(99, interpolateForm(def.form, year) + st.drift));
    out.push(Object.assign({}, def, { car, reliabilityMod: 0.82 + rng.next() * 0.42 }));
  }
  out.sort((a, b) => b.car - a.car);
  return out;
}

/* ---------------------------------------------------------------- world ----- */

function createWorld(seed = Date.now()) {
  const rng = makeRng(seed);
  const world = {
    seed,
    rngSeed: rng.seed(),
    year: 1950,
    round: 0,
    drivers: {},
    teamState: {},
    calendar: [],
    races: [],
    seasonScores: {},        // driverId -> [points per round]
    constructorScores: {},   // teamId  -> [points per round]
    history: [],
    champion: null,
    seasonOver: false,
    started: false,
  };

  for (const def of DRIVERS) {
    world.drivers[def.id] = createDriverState(def);
  }
  return world;
}

/* Bring in everyone whose real debut year has arrived, plus procedurally
 * generated arrivals once the historical roster thins out. */
function admitDebutants(world, rng) {
  const year = world.year;

  for (const d of Object.values(world.drivers)) {
    if (d.status === 'pending' && d.debut <= year) d.status = 'active';
  }

  /* Real debut data runs out after 2025. Until then invented drivers are
   * grid-fillers only; afterwards they carry the sport. */
  const elite = year > LAST_HISTORICAL_YEAR;

  /* Keep the pipeline healthy: if the pool of available drivers is thin
   * relative to the grid, invent some. The count is taken after the historical
   * arrivals have been promoted, so it already includes them. */
  const countAvailable = () => Object.values(world.drivers)
    .filter(d => d.status === 'active' || d.status === 'resting').length;
  const needed = ERA.gridCap(year) + 6;

  let guard = 0;
  while (countAvailable() < needed && guard < 30) {
    const gen = generateDriver(year, rng, elite);
    gen.status = 'active';
    world.drivers[gen.id] = gen;
    guard += 1;
  }

  /* A trickle of new talent every year regardless, so the sport renews itself. */
  const trickle = elite ? rng.int(2, 5) : rng.int(0, 2);
  for (let i = 0; i < trickle; i++) {
    const gen = generateDriver(year, rng, elite);
    gen.status = 'active';
    world.drivers[gen.id] = gen;
  }
}

function startSeason(world, rng) {
  world.round = 0;
  world.races = [];
  world.seasonScores = {};
  world.constructorScores = {};
  world.champion = null;
  world.constructorChampion = null;
  world.seasonOver = false;

  admitDebutants(world, rng);
  world.calendar = buildCalendar(world.year, rng);
  const teams = activeTeams(world, rng);
  world.teams = teams;
  assignSeats(world, teams, rng);

  for (const d of Object.values(world.drivers)) {
    if (d.teamId) {
      world.seasonScores[d.id] = [];
      d._seasonStats = { starts: 0, wins: 0, podiums: 0, poles: 0, points: 0, best: null };
      /* A season's form: some years everything clicks, some years nothing does. */
      d.seasonForm = rng.gauss(0, 2.7);
    }
  }
  for (const t of teams) world.constructorScores[t.id] = [];

  world.started = true;
}

/* ----------------------------------------------------------------- round ---- */

function runRound(world, rng) {
  if (world.seasonOver) return null;

  const circuit = world.calendar[world.round];
  const year = world.year;
  const roundNo = world.round + 1;
  const rounds = world.calendar.length;
  const teamById = {};
  for (const t of world.teams) teamById[t.id] = t;

  // --------------------------------------------------------- who starts ----
  const withdrawals = [];
  const entries = [];

  for (const d of Object.values(world.drivers)) {
    if (!d.teamId || d.status === 'retired') continue;

    if (d.missRounds > 0) {
      d.missRounds -= 1;
      if (d.missRounds === 0 && d.status === 'injured') d.status = 'active';
      continue;
    }
    if (d.status === 'injured') continue;

    const ill = rollIllness(d, year, rng);
    if (ill) {
      d.missRounds = ill - 1;
      withdrawals.push({ driverId: d.id, races: ill });
      d.story.push({ year, round: roundNo, type: 'illness',
        text: `Missed the ${circuit.gp} through illness.` });
      continue;
    }

    const team = teamById[d.teamId];
    if (!team) continue;
    entries.push({
      driver: d, team, car: team.car,
      reliabilityMod: team.reliabilityMod,
      form: d.seasonForm || 0,
    });
  }

  if (entries.length < 4) {
    world.round += 1;
    if (world.round >= rounds) finishSeason(world, rng);
    return null;
  }

  // -------------------------------------------------------------- race -----
  const race = simulateRace(entries, circuit, year, rng);
  race.round = roundNo;
  awardPoints(race, year);
  race.withdrawals = withdrawals;

  // ------------------------------------------------------- consequences ----
  const incidents = [];
  const dangerP = ERA.danger(year);
  const roundsLeft = rounds - roundNo;

  for (const r of race.results) {
    if (r.status !== 'accident') continue;
    const d = world.drivers[r.driverId];
    /* Not every accident hurts anybody — most do not. Risk-takers and the
     * fastest circuits raise the odds. */
    const p = dangerP * (0.7 + (d.risk / 100) * 0.6) *
      (race.character === 'classic' || race.character === 'fast' ? 1.25 : 1);
    if (!rng.chance(p)) continue;

    const outcome = resolveAccident(d, year, roundsLeft, rng);
    applyAccident(d, outcome, year, roundNo);
    incidents.push({ driverId: d.id, kind: outcome.kind, races: outcome.races });
  }
  race.incidents = incidents;

  // ---------------------------------------------------------- bookkeeping --
  const milestones = [];

  for (const r of race.results) {
    const d = world.drivers[r.driverId];
    if (!d) continue;
    const s = d._seasonStats;

    const firstEver = d.career.starts === 0;
    d.career.starts += 1;
    s.starts += 1;
    /* Remember the car so the standings still name it after a driver retires
     * mid-season and loses their seat. */
    s.teamId = r.teamId;

    if (firstEver) {
      milestones.push({ type: 'debut', driverId: d.id });
      d.story.push({ year, round: roundNo, type: 'debut',
        text: `Made their Grand Prix debut at the ${circuit.gp}.` });
    }

    if (r.gridPos === 1) { d.career.poles += 1; s.poles += 1; }

    if (r.pos) {
      if (d.career.bestFinish === null || r.pos < d.career.bestFinish) d.career.bestFinish = r.pos;
      if (s.best === null || r.pos < s.best) s.best = r.pos;

      if (r.pos === 1) {
        const first = d.career.wins === 0;
        d.career.wins += 1; s.wins += 1;
        if (first) {
          milestones.push({ type: 'firstWin', driverId: d.id });
          d.story.push({ year, round: roundNo, type: 'firstWin',
            text: `Won the ${circuit.gp} — a first Grand Prix victory.` });
        } else {
          d.story.push({ year, round: roundNo, type: 'win',
            text: `Won the ${circuit.gp}.` });
        }
      }
      if (r.pos <= 3) {
        const firstP = d.career.podiums === 0;
        d.career.podiums += 1; s.podiums += 1;
        if (firstP && r.pos !== 1) milestones.push({ type: 'firstPodium', driverId: d.id });
      }
    }

    if (race.fastestLap === d.id) d.career.fastestLaps += 1;

    d.career.points += r.points;
    s.points += r.points;

    if (!world.seasonScores[d.id]) world.seasonScores[d.id] = [];
    world.seasonScores[d.id].push(r.points);

    if (!world.constructorScores[r.teamId]) world.constructorScores[r.teamId] = [];
    world.constructorScores[r.teamId].push(r.points);
  }
  race.milestones = milestones;

  // --------------------------------------------------------- standings -----
  world.round += 1;
  const standings = driverStandings(world);

  /* Has the title been settled with rounds to spare? */
  const sys = pointsSystem(year);
  const maxPerRound = sys.points[0] + (sys.fl || 0);
  const left = rounds - world.round;
  if (!world.champion && standings.length >= 2 && left > 0) {
    if (standings[0].total - standings[1].total > left * maxPerRound) {
      world.champion = standings[0].driverId;
    }
  }

  race.writeup = buildWriteup(race, {
    drivers: world.drivers,
    standings,
    round: world.round,
    rounds,
    year,
    champion: world.champion,
    firstEverRace: year === 1950 && roundNo === 1,
  }, rng);

  world.races.push(race);

  if (world.round >= rounds) finishSeason(world, rng);
  return race;
}

/* ------------------------------------------------------------ standings ----- */

function driverStandings(world) {
  const rounds = world.calendar.length;
  const rows = [];
  for (const [id, scores] of Object.entries(world.seasonScores)) {
    if (!scores.length) continue;
    const d = world.drivers[id];
    if (!d) continue;
    rows.push({
      driverId: id,
      teamId: (d._seasonStats && d._seasonStats.teamId) || d.teamId,
      total: championshipTotal(scores, world.year, rounds),
      raw: scores.reduce((a, b) => a + b, 0),
      wins: d._seasonStats ? d._seasonStats.wins : 0,
      podiums: d._seasonStats ? d._seasonStats.podiums : 0,
      starts: d._seasonStats ? d._seasonStats.starts : 0,
    });
  }
  rows.sort((a, b) => b.total - a.total || b.wins - a.wins || b.podiums - a.podiums);
  rows.forEach((r, i) => { r.pos = i + 1; });
  return rows;
}

function constructorStandings(world) {
  /* The constructors' championship did not exist before 1958. */
  if (world.year < 1958) return [];
  const rounds = world.calendar.length;
  const rows = [];
  for (const [id, scores] of Object.entries(world.constructorScores)) {
    if (!scores.length) continue;
    const t = world.teams.find(x => x.id === id);
    rows.push({
      teamId: id,
      name: t ? t.name : id,
      total: scores.reduce((a, b) => a + b, 0),
    });
  }
  rows.sort((a, b) => b.total - a.total);
  rows.forEach((r, i) => { r.pos = i + 1; });
  return rows;
}

/* --------------------------------------------------------- season close ----- */

function finishSeason(world, rng) {
  const standings = driverStandings(world);
  const constructors = constructorStandings(world);
  const year = world.year;

  if (standings.length) {
    world.champion = standings[0].driverId;
    const champ = world.drivers[world.champion];
    champ.career.titles += 1;
    champ.story.push({ year, round: null, type: 'title',
      text: `Won the ${year} World Championship.` });
  }
  if (constructors.length) world.constructorChampion = constructors[0].teamId;

  /* Freeze each driver's season into their career record. */
  for (const d of Object.values(world.drivers)) {
    if (!d._seasonStats || d._seasonStats.starts === 0) continue;
    const row = standings.find(s => s.driverId === d.id);
    d.seasons.push({
      year,
      teamId: d._seasonStats.teamId || d.teamId,
      starts: d._seasonStats.starts,
      wins: d._seasonStats.wins,
      podiums: d._seasonStats.podiums,
      poles: d._seasonStats.poles,
      points: row ? row.total : 0,
      pos: row ? row.pos : null,
      titles: world.champion === d.id ? 1 : 0,
    });
    d.career.seasonsRun += 1;
  }

  world.history.push({
    year,
    champion: world.champion,
    championName: world.champion ? world.drivers[world.champion].name : null,
    constructorChampion: world.constructorChampion,
    standings: standings.slice(0, 10).map(s => ({
      driverId: s.driverId, name: world.drivers[s.driverId].name,
      teamId: s.teamId, total: s.total, wins: s.wins,
    })),
    constructors: constructors.slice(0, 6),
    rounds: world.calendar.length,
  });

  world.seasonOver = true;
}

function advanceYear(world, rng) {
  runOffseason(world, rng);
  world.year += 1;
  startSeason(world, rng);
}
