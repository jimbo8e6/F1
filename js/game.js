// ============================================================
// CORE GAME STATE AND LOGIC
// ============================================================

const GameState = {
  screen: 'title',          // current screen
  phase: null,              // within-screen phase
  season: 1,
  round: 0,
  totalRounds: 8,
  money: 0,
  constructorsPoints: 0,
  championshipPosition: 0,
  rivalPoints: 0,           // main rival (championship contender)

  team: null,               // selected team object (from AI_TEAMS or custom)
  carStats: null,           // live car stats (modified by upgrades)

  deck: [],                 // card ids in deck
  hand: [],                 // card ids currently drawn
  discard: [],              // used cards
  playedThisRace: [],       // cards played in this race
  maxHandSize: 5,

  raceCalendar: [],         // ordered track ids for this season
  currentTrackId: null,

  // Per-weekend state
  weekendState: null,

  // Season history
  results: [],              // {round, track, position, points}

  // Flags
  strategyVision: false,    // from data_analysis upgrade
  futureQualiBonus: 0,      // carryover from data windfall card

  // Persistent modifiers
  wearModifier: 1.0,

  init(team) {
    this.team = team;
    this.carStats = { ...team.carStats };
    this.money = team.startMoney;
    this.constructorsPoints = 0;
    this.rivalPoints = 0;

    this.deck = [...team.startingDeck];
    this.hand = [];
    this.discard = [];
    this.playedThisRace = [];

    this.season = 1;
    this.round = 0;
    this.results = [];
    this.futureQualiBonus = 0;
    this.wearModifier = 1.0;
    this.strategyVision = false;

    // Generate season calendar
    this.raceCalendar = this.generateCalendar();
    this.currentTrackId = null;
    this.weekendState = null;

    this.screen = 'map';
  },

  generateCalendar() {
    // Start with bahrain, end with abudhabi, 8 rounds in between
    const starters = TRACKS.filter(t => t.tier === 1);
    const mid = TRACKS.filter(t => t.tier === 2);
    const hard = TRACKS.filter(t => t.tier === 3);
    const finale = TRACKS.filter(t => t.tier === 4);

    function pick(arr, n) {
      const shuffled = [...arr].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, n).map(t => t.id);
    }

    return [
      ...pick(starters, 2),
      ...pick(mid, 3),
      ...pick(hard, 2),
      ...pick(finale, 1),
    ];
  },

  getCurrentTrack() {
    return TRACKS.find(t => t.id === this.currentTrackId);
  },

  getNextTrack() {
    const idx = this.raceCalendar.indexOf(this.currentTrackId);
    return TRACKS.find(t => t.id === this.raceCalendar[idx + 1]);
  },

  startWeekend(trackId) {
    this.currentTrackId = trackId;
    this.round++;
    this.playedThisRace = [];
    this.drawHand();

    const track = TRACKS.find(t => t.id === trackId);
    this.weekendState = {
      trackId,
      practiceBonus: { speed: 0, downforce: 0, reliability: 0 },
      qualifyingResult: null,
      raceResult: null,
      gridPosition: 10,
      eventHistory: [],
      phase: 'practice',
    };
  },

  drawHand() {
    // Shuffle discard into deck if needed
    if (this.deck.length < this.maxHandSize) {
      this.deck = [...this.deck, ...this.discard].sort(() => Math.random() - 0.5);
      this.discard = [];
    }
    this.hand = this.deck.splice(0, this.maxHandSize);
  },

  playCard(cardId) {
    const idx = this.hand.indexOf(cardId);
    if (idx === -1) return false;
    this.hand.splice(idx, 1);
    this.discard.push(cardId);
    this.playedThisRace.push(cardId);
    return true;
  },

  addCardToDeck(cardId) {
    this.deck.push(cardId);
  },

  applyPermanentUpgrade(statBoost) {
    for (const [stat, val] of Object.entries(statBoost)) {
      if (stat === 'strategy_vision') {
        this.strategyVision = true;
      } else if (this.carStats[stat] !== undefined) {
        this.carStats[stat] = Math.min(100, this.carStats[stat] + val);
      } else if (stat === 'driver_skill') {
        this.team.drivers.forEach(d => d.skill = Math.min(100, d.skill + val));
      }
    }
  },

  recordRaceResult(position, points, dnf) {
    const track = this.getCurrentTrack();
    this.results.push({
      round: this.round,
      track: track.name,
      trackEmoji: track.emoji,
      position,
      points,
      dnf,
    });
    this.constructorsPoints += points;

    // Update rival points (simulated championship rival)
    const pos1 = Math.max(1, position - Math.floor(Math.random() * 4) + 1);
    this.rivalPoints += pos1 <= 10 ? POINTS_SYSTEM[pos1 - 1] : 0;
  },

  addMoney(amount) {
    this.money += amount;
  },

  spendMoney(amount) {
    if (this.money >= amount) {
      this.money -= amount;
      return true;
    }
    return false;
  },

  getChampionshipGap() {
    return this.rivalPoints - this.constructorsPoints;
  },

  isSeasonOver() {
    return this.round >= this.totalRounds;
  },

  loadFromSave(data) {
    // For custom teams, the full team object was saved; for real teams look up in AI_TEAMS
    const baseTeam = data.teamId === 'custom'
      ? data.customTeam
      : AI_TEAMS.find(t => t.id === data.teamId);
    if (!baseTeam) return false;

    // Restore team with potentially upgraded driver skills
    this.team = { ...baseTeam, drivers: data.drivers.map(d => ({ ...d })) };
    this.carStats = { ...data.carStats };
    this.money = data.money;
    this.constructorsPoints = data.constructorsPoints;
    this.rivalPoints = data.rivalPoints;
    this.season = data.season;
    this.round = data.round;
    this.totalRounds = data.totalRounds;
    this.deck = [...data.deck];
    this.hand = [...data.hand];
    this.discard = [...data.discard];
    this.playedThisRace = [];
    this.maxHandSize = data.maxHandSize;
    this.raceCalendar = [...data.raceCalendar];
    this.currentTrackId = null;
    this.weekendState = null;
    this.results = data.results.map(r => ({ ...r }));
    this.strategyVision = data.strategyVision;
    this.futureQualiBonus = data.futureQualiBonus;
    this.wearModifier = data.wearModifier;
    this.screen = 'map';
    return true;
  },

  getSeasonResult() {
    const totalPoints = this.constructorsPoints;
    const rival = this.rivalPoints;
    const won = totalPoints > rival;
    const bestResult = this.results.reduce((best, r) => r.position < best ? r.position : best, 20);

    return { totalPoints, rivalPoints: rival, won, bestResult, results: this.results };
  },
};

// ============================================================
// RACE FLOW CONTROLLER
// Controls the race weekend flow and interfaces between
// simulation and UI
// ============================================================
const RaceFlow = {
  practice: null,
  qualifying: null,
  race: null,
  currentEvent: null,
  pendingChoices: null,
  driverIndex: 0, // which driver is in focus for this weekend

  startPractice() {
    const track = GameState.getCurrentTrack();
    const drivers = GameState.team.drivers;
    this.practice = new PracticeSession(track, GameState.carStats, drivers);
    return this.practice;
  },

  startQualifying(gridOverride = null) {
    const track = GameState.getCurrentTrack();
    const team = GameState.team;
    const car = {
      ...GameState.carStats,
      downforce: GameState.carStats.downforce + (GameState.weekendState?.practiceBonus?.downforce || 0),
      speed: GameState.carStats.speed + (GameState.weekendState?.practiceBonus?.speed || 0),
    };
    this.qualifying = new QualifyingSession(track, team, car, GameState);
    return this.qualifying;
  },

  startRace(gridPosition) {
    const track = GameState.getCurrentTrack();
    const team = GameState.team;
    const car = {
      ...GameState.carStats,
      downforce: GameState.carStats.downforce + (GameState.weekendState?.practiceBonus?.downforce || 0),
      speed: GameState.carStats.speed + (GameState.weekendState?.practiceBonus?.speed || 0),
    };

    // Build starting grid
    const grid = buildStartingGrid(track, gridPosition, team);

    const drivers = team.drivers;
    this.race = new RaceSimulation(track, team, car, drivers, grid, {
      wearModifier: GameState.wearModifier,
      futureQualiBonus: GameState.futureQualiBonus,
      strategyVision: GameState.strategyVision,
    });

    return this.race;
  },

  getAvailableCardsForEvent(event) {
    return GameState.hand.filter(cardId => {
      const card = ALL_CARDS.find(c => c.id === cardId);
      if (!card) return false;
      const eventChoices = event.choices || [];
      return eventChoices.some(ch => ch.cardSynergy?.includes(cardId));
    });
  },

  playCardEffect(cardId, race) {
    const card = ALL_CARDS.find(c => c.id === cardId);
    if (!card) return null;

    const result = { card, effects: [] };

    switch (card.effect) {
      case 'reduce_wear':
        race.applyWearReduction(card.value);
        result.effects.push(`Tyre wear reduced by ${Math.round(card.value * 100)}%`);
        break;
      case 'engine_push':
        race.applySpeedBoost(card.value.speed, card.value.laps);
        result.effects.push(`-${card.value.speed}s/lap for ${card.value.laps} laps`);
        break;
      case 'ers_boost':
        race.applySpeedBoost(card.value, 1);
        result.effects.push(`ERS burst: -${card.value}s this lap`);
        break;
      case 'driver_push':
        race.applySpeedBoost(card.value.speed, card.value.laps);
        race.playerTyres[0].wear = Math.min(100, race.playerTyres[0].wear + 10);
        result.effects.push(`Push mode: -${card.value.speed}s/lap for ${card.value.laps} laps`);
        break;
      case 'tyre_conserve':
        race.conserveMode = !race.conserveMode;
        result.effects.push(race.conserveMode ? 'Tyre conservation mode ON' : 'Conservation mode OFF');
        break;
      case 'trigger_safety_car':
        race.triggerSafetyCar(5);
        result.effects.push('Safety car deployed for 5 laps');
        break;
      case 'trigger_rain':
        if (Math.random() < card.value.rain_chance) {
          race.rainLevel = card.value.intensity;
          for (let i = race.currentLap; i < race.currentLap + 8; i++) {
            if (race.rainForecast[i] !== undefined) {
              race.rainForecast[i] = card.value.intensity;
            }
          }
          result.effects.push('Rain triggered!');
        } else {
          result.effects.push('Rain attempt failed... skies remain clear');
        }
        break;
      case 'money_bonus':
        GameState.addMoney(card.value);
        result.effects.push(`$${card.value.toLocaleString()} bonus added`);
        break;
      case 'recovery':
        race.applySpeedBoost(0.3, 10);
        result.effects.push('Recovery mode: pushing hard for 10 laps');
        break;
      case 'pit_advantage':
      case 'pit_advantage_late':
        result.effects.push('Ready for optimal pit window');
        result.pitAdvantage = true;
        break;
      case 'free_pit':
        result.effects.push('Perfect SC pit stop ready to execute');
        result.freePit = true;
        break;
      case 'permanent_upgrade':
        GameState.applyPermanentUpgrade(card.statBoost || {});
        result.effects.push(`Permanent upgrade applied: ${Object.entries(card.statBoost || {}).map(([k,v]) => `+${v} ${k}`).join(', ')}`);
        break;
      case 'strategy_vision':
        GameState.strategyVision = true;
        result.effects.push('Advanced data analysis active');
        break;
      case 'drs_boost':
        race.applySpeedBoost(card.value * (race.track.drsZones || 2), 1);
        result.effects.push(`DRS harvest: -${(card.value * (race.track.drsZones || 2)).toFixed(1)}s this lap`);
        break;
      case 'prevent_brake_event':
        result.effects.push(`Brake events prevented for ${card.value} laps`);
        break;
      case 'double_pit_advantage':
        result.effects.push('Both cars on optimal strategy');
        break;
      case 'aggressive_stint':
        race.applySpeedBoost(0.6, 15);
        result.effects.push('-0.6s/lap on aggressive 3-stop strategy');
        break;
      case 'hold_position':
        result.effects.push(`Defensive mode for ${card.value} laps`);
        break;
      case 'quali_boost':
        GameState.futureQualiBonus = (GameState.futureQualiBonus || 0) + card.value;
        result.effects.push(`+${card.value} grid positions in qualifying`);
        break;
      case 'fix_damage':
        race.carDamage = Math.max(0, race.carDamage - 50);
        result.effects.push('Damage repaired');
        break;
      case 'risky_overtake': {
        const success = Math.random() < card.value.success_chance;
        const playerEntry = race.standings.find(s => s.isPlayer);
        if (success && playerEntry) {
          playerEntry.totalTime -= card.value.gain * 0.3;
          race.recalculatePositions();
          result.effects.push(`Overtake succeeded! Gained ${card.value.gain} positions`);
        } else if (!success && playerEntry) {
          playerEntry.totalTime += card.value.penalty * 0.3;
          race.recalculatePositions();
          result.effects.push(`Overtake failed! Lost ${card.value.penalty} position(s)`);
        }
        break;
      }
      default:
        result.effects.push('Card effect applied');
    }

    GameState.playCard(cardId);
    return result;
  },
};

function buildStartingGrid(track, playerGridPos, playerTeam) {
  const grid = [];

  // Exclude player's own team so they don't race against themselves
  const aiField = AI_TEAMS.filter(t => t.id !== playerTeam.id);

  for (const team of aiField) {
    for (let d = 0; d < team.drivers.length; d++) {
      const driver = team.drivers[d];
      grid.push({
        team: team.shortName,
        color: team.color,
        driver: driver.name,
        driverSkill: driver.skill,
        driverRainSkill: driver.rain,
        // Driver skill shifts the effective car strength; teammates are no longer identical
        carStrength: team.carStrength + (driver.skill - 82) * 0.35 + (Math.random() - 0.5) * 6,
        isPlayer: false,
        totalTime: 0,
        dnf: false,
      });
    }
  }

  // Sort AI by strength with some randomness
  grid.sort((a, b) => b.carStrength - a.carStrength);

  // Insert player car at grid position
  const playerEntry = {
    team: playerTeam.name,
    color: playerTeam.color,
    driver: playerTeam.drivers[0].name,
    carStrength: (GameState.carStats || playerTeam.carStats).speed + (GameState.carStats || playerTeam.carStats).downforce / 2,
    isPlayer: true,
    totalTime: 0,
    dnf: false,
  };

  grid.splice(Math.max(0, playerGridPos - 1), 0, playerEntry);

  return grid.slice(0, 22); // 11 teams × 2 drivers in 2026
}

// Get card data by id
function getCard(id) {
  return ALL_CARDS.find(c => c.id === id);
}

// Get 3 random reward cards (not already in deck, slightly weighted by rarity)
function getCardRewards(round) {
  const tierIdx = Math.min(Math.floor(round / 2), CARD_REWARDS.length - 1);
  const pool = CARD_REWARDS[tierIdx];
  const ownedIds = [...GameState.deck, ...GameState.hand, ...GameState.discard];
  const available = pool.filter(id => !ownedIds.includes(id));

  // Fall back to all cards if tier pool exhausted
  const allAvailable = available.length >= 3 ? available :
    ALL_CARDS.filter(c => !ownedIds.includes(c.id) && c.type !== 'upgrade').map(c => c.id);

  const shuffled = allAvailable.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3).map(id => getCard(id)).filter(Boolean);
}

// Get upgrade shop options
function getUpgradeOptions() {
  return UPGRADES_SHOP.filter(u => {
    if (u.effect.strategy_vision && GameState.strategyVision) return false;
    return GameState.money >= u.cost * 0.5; // show even if not quite affordable
  }).slice(0, 4);
}
