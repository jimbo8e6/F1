/* Race report generation.
 *
 * Every write-up is assembled from what actually happened in the simulation —
 * the margin, the weather, who broke, who crashed, who arrived. Nothing here
 * invents a result; it only finds the language for one.
 */

const NARR = {
  wetOpen: [
    'Rain swept {venue} from the opening laps',
    'The heavens opened over {venue} before the start',
    '{venue} was soaked, and stayed soaked',
    'A steady downpour turned {venue} treacherous',
    'Standing water at {venue} made the racing line a matter of guesswork',
  ],
  mixedOpen: [
    'A drying track at {venue} wrong-footed half the field',
    'Rain came and went at {venue}, and the timing of it decided the afternoon',
    '{venue} could not decide whether to be wet or dry',
    'The track at {venue} dried unevenly, punishing anyone who guessed wrong',
  ],
  dryOpen: [
    'Under clear skies at {venue}',
    '{venue} baked in the sun',
    'A dry, fast afternoon at {venue}',
    'Perfect conditions greeted the field at {venue}',
    'The {gp} ran in still, warm air',
  ],
  dominant: [
    '{winner} led from {start} and was never seriously troubled',
    '{winner} controlled the race from {start}, winning as they pleased',
    'It was {winner}\'s race from {start} — a demonstration rather than a contest',
    '{winner} disappeared into the distance from {start}',
    '{winner} made it look straightforward, leading from {start} to the flag',
  ],
  comfortable: [
    '{winner} took the win from {start} with something in hand',
    '{winner} came through from {start} and held the lead when it mattered',
    '{winner} won from {start}, managing the gap in the closing stages',
    'Victory went to {winner}, who converted {start} into a measured win',
  ],
  narrow: [
    '{winner} won it by a matter of seconds from {second}',
    '{winner} and {second} traded the lead before {winner} edged clear',
    'It went to the last laps, {winner} holding off {second}',
    '{winner} beat {second} in a finish that stayed in doubt to the flag',
    '{second} shadowed {winner} all afternoon but could never quite find a way past',
  ],
  photo: [
    '{winner} won by a car\'s length from {second} after a scrap that lasted the whole distance',
    'Barely a wheel separated {winner} and {second} at the flag',
    '{winner} and {second} crossed the line together — the verdict went to {winner}',
    'The closest finish in months: {winner} from {second}, with nothing in it',
  ],
  startPole: ['pole', 'the front of the grid', 'pole position'],
  startFront: ['the front row', 'second on the grid', 'the front row'],
  startMid: ['{n}th on the grid', 'the third row', 'midfield'],
  startBack: ['{n}th on the grid', 'deep in the field', 'the back half of the grid'],

  mechanical: [
    '{driver} was out on lap {lap} with a broken {part}',
    '{driver}\'s {part} let go on lap {lap}',
    '{artPart} failure ended {driver}\'s race on lap {lap}',
    '{driver} coasted to a halt on lap {lap}, the {part} finished',
    'Lap {lap} took {driver} out — {part}',
  ],
  mechanicalLeader: [
    '{driver} had been leading comfortably when the {part} failed on lap {lap}',
    '{driver} looked set for the win until the {part} cried enough on lap {lap}',
    'The race changed on lap {lap}, when {driver}\'s {part} failed from the lead',
    '{driver} was in command when the car broke on lap {lap}',
  ],
  /* Accidents, by what caused them. */
  crashError: [
    '{driver} put it into the barriers on lap {lap}',
    '{driver} lost the car on lap {lap} and spun out of contention',
    '{driver} ran wide on lap {lap} and went off for good',
    '{driver} got it wrong on lap {lap} and hit the fence',
    'Lap {lap} claimed {driver}, who slid off unaided',
  ],
  crashWeather: [
    '{driver} aquaplaned off on lap {lap}',
    '{driver} lost the car in the spray on lap {lap}',
    'The conditions caught {driver} out on lap {lap}',
    '{driver} found the standing water on lap {lap} and was pitched off',
  ],
  crashFailure: [
    "{artPart} failure pitched {driver} into the barriers on lap {lap}",
    "{driver}'s {part} let go on lap {lap} and put the car in the fence",
    "{artPart} broke on {driver}'s car on lap {lap} and sent it off the road",
    "{driver}'s {part} failed at speed on lap {lap}, putting the car off the road",
  ],
  crashCollision: [
    '{driver} and {other} came together on lap {lap}',
    '{driver} tried a move on {other} on lap {lap} and the two collided',
    'Contact between {driver} and {other} on lap {lap}',
    '{driver} and {other} touched wheels on lap {lap}',
    '{driver} misjudged a pass on {other} on lap {lap}',
  ],
  crashStart: [
    '{driver} and {other} collided at the first corner',
    '{driver} and {other} tangled before the field had completed a lap',
    'The run to the first corner put {driver} and {other} out on the spot',
  ],
  crashStartSolo: [
    '{driver} was eliminated at the first corner',
    '{driver} never completed a lap, collected in the opening-lap scramble',
    'The start accounted for {driver}',
    "{driver}'s afternoon lasted a matter of seconds",
  ],
  /* Tail clauses for a two-car incident. */
  bothOut: [
    ', both out on the spot',
    ', and neither car went any further',
    ', putting both of them out',
  ],
  oneOut: [
    ', {driver} out on the spot while {other} carried on with a damaged car',
    ', though only {driver} retired from it',
    ', {other} limping on while {driver} was done for the afternoon',
  ],
  /* Kept singular — these get an article in front of them. */
  parts: [
    'engine', 'gearbox', 'transmission', 'oil line', 'fuel pump', 'clutch',
    'differential', 'magneto', 'radiator', 'rear suspension', 'driveshaft', 'brake line',
  ],
  modernParts: [
    'power unit', 'gearbox', 'hydraulic system', 'energy store', 'turbo', 'brake-by-wire',
    'rear suspension', 'floor', 'water pump', 'battery',
  ],

  debutGood: [
    '{driver} marked a first championship appearance with {ord} place',
    'On debut, {driver} came home {ord}',
    '{driver} made a striking first impression, finishing {ord}',
    'A debut worth noting: {driver}, {ord}',
  ],
  debutQuiet: [
    '{driver} made a quiet championship debut',
    '{driver} took the start for the first time',
    'It was a first Grand Prix for {driver}',
  ],
  firstWin: [
    'It is a first championship victory for {driver}',
    '{driver} wins a Grand Prix for the first time',
    'A maiden win for {driver}',
    '{driver} joins the list of Grand Prix winners',
  ],
  firstPodium: [
    '{driver} stood on the podium for the first time',
    'A first podium finish for {driver}',
  ],

  injuryMinor: [
    '{driver} walked away shaken but unhurt',
    '{driver} climbed out unaided',
    '{driver} was helped from the car but needed no treatment',
  ],
  injuryMiss: [
    '{driver} was taken to hospital and is expected to miss {spell}',
    '{driver} suffered injuries serious enough to sit out {spell}',
    '{driver} broke bones in the accident and faces {spell} on the sidelines',
  ],
  injurySeason: [
    '{driver} was badly hurt and will take no further part this season',
    'Injuries end {driver}\'s season on the spot',
    '{driver} was seriously injured and is out for the remainder of the season',
  ],
  injuryCareer: [
    '{driver} was gravely injured, and will never race again',
    'The accident has ended {driver}\'s career — the injuries are too severe to return from',
    '{driver} survived, but will not race a Grand Prix car again',
    'It is the end of {driver}\'s career; the injuries will not permit a return',
  ],
  illness: [
    '{driver} withdrew before the start, unwell',
    '{driver} was declared unfit on the morning of the race',
    'Illness kept {driver} out of the car',
  ],

  titleClinched: [
    '{driver} is champion.',
    'The title is settled: {driver} takes the championship.',
    '{driver} has done enough — the championship is theirs.',
  ],
  titleTight: [
    '{leader} leads the championship by {gap} from {second}, with {left} to run.',
    'It leaves {leader} {gap} clear of {second}, {left} remaining.',
    '{leader} holds a {gap}-point advantage over {second} with {left} left.',
  ],
  titleClear: [
    '{leader} now looks difficult to catch, {gap} clear of {second}.',
    '{leader}\'s championship lead grows to {gap} points.',
    'The gap at the top is out to {gap}: {leader} from {second}.',
  ],
};

function pick(rng, list) { return list[Math.floor(rng.next() * list.length)]; }

/* Pick from a bank while avoiding anything already used in this passage — three
 * drivers in a row "having had enough" reads like a template, because it is. */
function pickFresh(rng, list, used) {
  const fresh = list.filter(t => !used.has(t));
  const choice = pick(rng, fresh.length ? fresh : list);
  used.add(choice);
  return choice;
}

function plural(n, word) {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

function fill(tpl, vars) {
  return tpl.replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined ? vars[k] : m));
}

function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function article(word) {
  return /^[aeiou]/i.test(word) ? 'An' : 'A';
}

const NUMBER_WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven'];

/* "the next round" / "the next two rounds" — never "the next 1 rounds". */
function spellRaces(n) {
  if (n <= 1) return 'the next round';
  return `the next ${NUMBER_WORDS[n] || n} rounds`;
}

/* Some circuits take a definite article: the Nürburgring, the Hungaroring. */
function venuePhrase(venue) {
  return /ring$|^AVUS$|Outer Circuit$/i.test(venue) ? `the ${venue}` : venue;
}

function sentenceCase(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/* Turn one simulated race into a few sentences of prose. */
function buildWriteup(race, ctx, rng) {
  const { drivers, standings, round, rounds, year } = ctx;
  const name = id => (drivers[id] ? drivers[id].name : id);
  const parts = [];

  const finishers = race.results.filter(r => r.status === 'finished');
  const winner = finishers.find(r => r.pos === 1);
  if (!winner) return 'The race was abandoned without a classified finisher.';

  const second = finishers.find(r => r.pos === 2);
  const third = finishers.find(r => r.pos === 3);

  // ------------------------------------------------------------- the win --
  /* Some openers put the venue mid-sentence, some lead with it — so the article
   * is always lower case and the finished sentence gets capitalised. */
  const opener = sentenceCase(fill(
    race.mixed ? pick(rng, NARR.mixedOpen)
      : race.wet ? pick(rng, NARR.wetOpen)
      : pick(rng, NARR.dryOpen),
    { venue: venuePhrase(race.venue), gp: race.gp }));

  let startPhrase;
  const g = winner.gridPos;
  if (g === 1) startPhrase = pick(rng, NARR.startPole);
  else if (g <= 3) startPhrase = pick(rng, NARR.startFront);
  else if (g <= 8) startPhrase = fill(pick(rng, NARR.startMid), { n: g });
  else startPhrase = fill(pick(rng, NARR.startBack), { n: g });

  /* Margin comes from the underlying performance gap, so a runaway win reads
   * like one and a scrap reads like a scrap. */
  const wf = race.field.find(f => f.entry.driver.id === winner.driverId);
  const sf = second ? race.field.find(f => f.entry.driver.id === second.driverId) : null;
  const gap = wf && sf ? wf.final - sf.final : 6;

  let winBank;
  if (gap > 5) winBank = NARR.dominant;
  else if (gap > 2.2) winBank = NARR.comfortable;
  else if (gap > 0.8) winBank = NARR.narrow;
  else winBank = NARR.photo;

  const winSentence = fill(pick(rng, winBank), {
    winner: name(winner.driverId),
    second: second ? name(second.driverId) : 'the field',
    start: startPhrase,
  });

  parts.push(`${opener}. ${winSentence}.`);

  if (third) {
    parts.push(`${name(second.driverId)} and ${name(third.driverId)} completed the podium.`);
  }

  // --------------------------------------------------------- the drama ----
  const dramas = [];
  const partBank = year >= 2000 ? NARR.modernParts : NARR.parts;

  /* A front-runner breaking down is the story of the race; anyone else is a
   * footnote. Sort retirements by how prominent the driver was. */
  const retirements = race.results
    .filter(r => r.status === 'mechanical' || r.status === 'accident')
    .sort((a, b) => a.gridPos - b.gridPos);

  /* Anyone who was hurt must have their accident described, however far down
   * the order they started — otherwise the report states a consequence whose
   * cause it never mentioned. */
  const hurt = new Set((race.incidents || []).map(i => i.driverId));
  const hurtRows = retirements.filter(r => hurt.has(r.driverId));
  const prominent = retirements.filter(r => !hurt.has(r.driverId)).slice(0, 3);
  /* Injuries go in the list first so the cap can never drop one. */
  const chosen = hurtRows.concat(prominent).slice(0, 6)
    .sort((a, b) => a.gridPos - b.gridPos);

  const told = new Set();
  /* Only one car can have been leading. Without this, three separate drivers
   * get described as having "looked set for the win" in the same afternoon. */
  let leaderTold = false;

  for (const r of chosen) {
    if (told.has(r.driverId)) continue;
    told.add(r.driverId);

    if (r.status === 'mechanical') {
      const leaderish = !leaderTold && r.gridPos <= 3 && r.lap > 20;
      if (leaderish) leaderTold = true;
      const part = pick(rng, partBank);
      dramas.push(fill(pick(rng, leaderish ? NARR.mechanicalLeader : NARR.mechanical), {
        driver: name(r.driverId), lap: r.lap, part, artPart: `${article(part)} ${part}`,
      }));
      continue;
    }

    // ------------------------------------------------------- an accident --
    const other = r.withDriverId ? name(r.withDriverId) : null;
    const vars = { driver: name(r.driverId), other, lap: r.lap };

    if ((r.cause === 'collision' || r.cause === 'start') && other) {
      /* Describe a two-car incident once, from one side, and say what became
       * of the other car. */
      told.add(r.withDriverId);
      const opening = pick(rng, r.cause === 'start' ? NARR.crashStart : NARR.crashCollision);
      const tail = r.partnerRetired
        ? pick(rng, NARR.bothOut)
        : fill(pick(rng, NARR.oneOut), vars);
      dramas.push(fill(opening, vars) + tail);
    } else if (r.cause === 'failure') {
      const part = pick(rng, partBank);
      dramas.push(fill(pick(rng, NARR.crashFailure), {
        ...vars, part, artPart: `${article(part)} ${part}`,
      }));
    } else if (r.cause === 'weather') {
      dramas.push(fill(pick(rng, NARR.crashWeather), vars));
    } else if (r.cause === 'start') {
      dramas.push(fill(pick(rng, NARR.crashStartSolo), vars));
    } else {
      dramas.push(fill(pick(rng, NARR.crashError), vars));
    }
  }
  if (dramas.length) parts.push(dramas.join('. ') + '.');

  // ------------------------------------------------------- consequences ---
  for (const inc of (race.incidents || [])) {
    const bank = inc.kind === 'career' ? NARR.injuryCareer
      : inc.kind === 'season' ? NARR.injurySeason
      : inc.kind === 'miss' ? NARR.injuryMiss
      : NARR.injuryMinor;
    parts.push(fill(pick(rng, bank), {
      driver: name(inc.driverId), n: inc.races, spell: spellRaces(inc.races),
    }) + '.');
  }

  for (const ill of (race.withdrawals || [])) {
    parts.push(fill(pick(rng, NARR.illness), { driver: name(ill.driverId) }) + '.');
  }

  // ---------------------------------------------------------- milestones --
  /* When the championship itself is new — or a rules change floods the entry
   * list — everybody is technically a debutant and every finish is technically a
   * first. Reporting each one individually buries the race, so summarise. */
  const ms = race.milestones || [];
  const debuts = ms.filter(m => m.type === 'debut');

  if (debuts.length > 6) {
    parts.push(ctx.firstEverRace
      ? 'It is the first World Championship Grand Prix; every man in the field is a debutant.'
      : `${debuts.length} drivers made their championship debut.`);
  } else {
    const win = ms.find(m => m.type === 'firstWin');
    if (win) parts.push(fill(pick(rng, NARR.firstWin), { driver: name(win.driverId) }) + '.');

    const pod = ms.find(m => m.type === 'firstPodium');
    if (pod) parts.push(fill(pick(rng, NARR.firstPodium), { driver: name(pod.driverId) }) + '.');

    /* Only debuts worth remarking on, and never more than a couple. */
    const notable = debuts
      .map(m => ({ m, res: race.results.find(r => r.driverId === m.driverId) }))
      .filter(x => x.res && x.res.pos && x.res.pos <= 6)
      .slice(0, 2);

    for (const { m, res } of notable) {
      parts.push(fill(pick(rng, NARR.debutGood), {
        driver: name(m.driverId), ord: ordinal(res.pos),
      }) + '.');
    }
    if (!notable.length && debuts.length) {
      const names = debuts.slice(0, 2).map(m => name(m.driverId)).join(' and ');
      parts.push(fill(pick(rng, NARR.debutQuiet), { driver: names }) + '.');
    }
  }

  // ------------------------------------------------------- championship ---
  if (standings && standings.length >= 2) {
    const lead = standings[0], chase = standings[1];
    const margin = lead.total - chase.total;
    const left = rounds - round;

    if (ctx.champion) {
      parts.push(fill(pick(rng, NARR.titleClinched), { driver: name(ctx.champion) }));
    } else if (left === 0) {
      parts.push(`${name(lead.driverId)} takes the championship.`);
    } else if (margin === 0) {
      parts.push(`${name(lead.driverId)} and ${name(chase.driverId)} are level on points at the top of the championship.`);
    } else {
      const bank = margin > 20 ? NARR.titleClear : NARR.titleTight;
      parts.push(fill(pick(rng, bank), {
        leader: name(lead.driverId),
        second: name(chase.driverId),
        gap: margin,
        left: left === 1 ? 'one round' : `${left} rounds`,
      }));
    }
  }

  return parts.join(' ');
}

/* ---------------------------------------------------------- pre-season ---- */

const PRE = {
  champReturns: [
    '{driver} returns to defend the title',
    '{driver} begins the year as champion',
    'The championship reopens with {driver} as the man to beat',
  ],
  retireAge: [
    '{driver} has retired at {age}',
    '{driver} calls it a career at {age}',
    '{driver} steps down after {seasonsPhrase}',
    '{driver} has had enough, and stops at {age}',
  ],
  retireForm: [
    '{driver} has given it up after a run of seasons with nothing to show for them',
    '{driver} retires, the results having dried up',
    '{driver} walks away with little left to prove and less to show',
  ],
  retireSeries: [
    '{driver} leaves Grand Prix racing for {series}',
    '{driver} has gone to {series}',
    '{driver} takes up {series} instead',
    '{driver} abandons the championship in favour of {series}',
  ],
  retireInjury: [
    '{driver} will not race again, the injuries too severe to come back from',
    "{driver}'s career was ended by injury last season",
    '{driver} never recovered from last season\'s accident and retires',
  ],
  retireNoSeat: [
    '{driver} leaves the championship, unable to find a drive',
    'No team would have {driver}, who drops out of the championship',
    '{driver} could not find a seat and is gone',
  ],
  debutOne: [
    '{driver} makes a championship debut with {team}',
    '{team} hand a first Grand Prix drive to {driver}',
    '{driver}, {age}, arrives at {team}',
    '{driver} steps up to {team}',
  ],
  moveOne: [
    '{driver} leaves {from} for {to}',
    '{driver} has signed for {to}, ending a spell at {from}',
    '{to} take {driver} from {from}',
    '{driver} swaps {from} for {to}',
  ],
  lostOne: [
    '{driver} lost the {from} seat and has no drive',
    '{from} have let {driver} go, with nothing lined up',
  ],
  quiet: [
    'The grid is much as it was.',
    'Little changed over the winter.',
    'The field reassembles largely unaltered.',
  ],
};

/* A written summary of the winter: who stopped, who arrives, and who moved. */
function buildPreseason(world, data, rng) {
  const name = id => (world.drivers[id] ? world.drivers[id].name : id);
  const team = id => {
    const t = TEAMS.find(x => x.id === id);
    return t ? t.name : id;
  };
  const parts = [];

  /* The reigning champion, carried over from last season's record. */
  const last = world.history[world.history.length - 1];
  if (last && last.champion && world.drivers[last.champion] &&
      world.drivers[last.champion].status !== 'retired') {
    parts.push(fill(pick(rng, PRE.champReturns), { driver: name(last.champion) }) + '.');
  }

  // ------------------------------------------------------- retirements ----
  if (data.retired.length) {
    const told = [];
    const used = new Set();
    for (const r of data.retired.slice(0, 4)) {
      const bank = r.reason === 'injury' ? PRE.retireInjury
        : r.reason === 'series' ? PRE.retireSeries
        : r.reason === 'form' ? PRE.retireForm
        : r.reason === 'noSeat' ? PRE.retireNoSeat
        : PRE.retireAge;
      told.push(fill(pickFresh(rng, bank, used), {
        driver: name(r.id), age: r.age,
        seasonsPhrase: plural(Math.max(1, r.seasons), 'season'),
        series: r.series || 'other racing',
      }));
    }
    let sentence = told.join('. ') + '.';
    const rest = data.retired.length - 4;
    if (rest > 0) {
      sentence += ` ${rest} other${rest > 1 ? 's' : ''} left the championship over the winter.`;
    }
    parts.push(sentence);
  }

  // ------------------------------------------------------------ debuts ----
  if (data.debuts.length) {
    const usedD = new Set();
    const shown = data.debuts.slice(0, 4).map(d => fill(pickFresh(rng, PRE.debutOne, usedD), {
      driver: name(d.id), team: team(d.teamId), age: d.age,
    }));
    let sentence = shown.join('. ') + '.';
    const rest = data.debuts.length - 4;
    if (rest > 0) {
      sentence += ` ${rest} further newcomer${rest > 1 ? 's take' : ' takes'} a seat.`;
    }
    parts.push(sentence);
  }

  // ------------------------------------------------------------- moves ----
  if (data.moves.length) {
    const usedM = new Set();
    const shown = data.moves.slice(0, 4).map(m => fill(pickFresh(rng, PRE.moveOne, usedM), {
      driver: name(m.id), from: team(m.from), to: team(m.to),
    }));
    let sentence = shown.join('. ') + '.';
    const rest = data.moves.length - 4;
    if (rest > 0) sentence += ` ${rest} other seat${rest > 1 ? 's' : ''} changed hands.`;
    parts.push(sentence);
  }

  // ------------------------------------------------- drivers left out ----
  if (data.lost.length) {
    const worth = data.lost.filter(l => l.starts >= 6).slice(0, 2);
    if (worth.length) {
      parts.push(worth.map(l => fill(pick(rng, PRE.lostOne), {
        driver: name(l.id), from: team(l.from),
      })).join('. ') + '.');
    }
  }

  if (parts.length <= 1) parts.push(pick(rng, PRE.quiet));
  return parts.join(' ');
}

/* A one-line summary for calendar listings. */
function raceHeadline(race, drivers) {
  const winner = race.results.find(r => r.pos === 1);
  if (!winner) return 'No classified finisher';
  const n = drivers[winner.driverId] ? drivers[winner.driverId].name : winner.driverId;
  return race.wet ? `${n} — wet` : n;
}
