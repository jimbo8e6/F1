// ============================================================
// RACE & QUALIFYING SIMULATION
// ============================================================

// Calculate base lap time for a track given car stats
function getBaseLapTime(track, carStats) {
  const len = track.lapLength;
  // Theoretical minimum lap time based on circuit length and car performance
  const speedFactor = 1 + (carStats.speed - 70) / 200;
  const downFactor = 1 + (carStats.downforce - 70) / 400;
  const base = (len / 0.055) * (1 / speedFactor) * (1 / downFactor);
  return base; // in seconds
}

// Get a driver's lap time modifier (-1 to +1 seconds relative to teammate)
function getDriverLapMod(driver) {
  return -((driver.skill - 75) * 0.05);
}

// AI laptime for a given team on a track
function getAILapTime(aiTeam, track, driverSkill = 82) {
  // Driver skill shifts effective car strength up/down relative to the team baseline
  const effectiveStrength = aiTeam.carStrength + (driverSkill - 82) * 0.35;
  const base = (track.lapLength / 0.055);
  const strengthMod = 1 - (effectiveStrength - 70) / 600;
  return base * strengthMod * (0.97 + Math.random() * 0.06);
}

// ============================================================
// QUALIFYING SIMULATION
// ============================================================
class QualifyingSession {
  constructor(track, playerTeam, playerCar, gameState) {
    this.track = track;
    this.playerTeam = playerTeam;
    this.playerCar = playerCar;
    this.gameState = gameState;
    this.baseLapTime = getBaseLapTime(track, playerCar);
    this.results = { q1: null, q2: null, q3: null };
    this.gridPosition = 20;
    this.currentPhase = 'q1';
    this.eliminated = false;
    this.tyreUsed = 'soft';
    this.pendingEvent = null;
    this.qualiBonusFromCards = 0; // accumulated from card effects
    this.futureQualiBonus = gameState.futureQualiBonus || 0;
  }

  // Simulate the AI field for a qualifying phase
  generateAITimes(phase) {
    const field = [];
    const phaseMultipliers = { q1: 1.000, q2: 0.997, q3: 0.994 };
    const mult = phaseMultipliers[phase] || 1.0;

    for (const team of AI_TEAMS) {
      const numDrivers = phase === 'q3' ? 1 : 2;
      for (let d = 0; d < numDrivers; d++) {
        const driver = team.drivers[d];
        const baseTime = getAILapTime(team, this.track, driver.qualifying) * mult;
        field.push({
          team: team.shortName,
          color: team.color,
          driver: driver.name,
          time: baseTime,
          str: formatLapTime(baseTime),
        });
      }
    }
    field.sort((a, b) => a.time - b.time);
    return field;
  }

  // Calculate player's qualifying time
  calculatePlayerTime(driver, compound, modifiers = {}) {
    let time = this.baseLapTime;

    // Driver qualifying skill
    const qualiSkill = driver.qualifying / 100;
    time *= (1 - (qualiSkill - 0.75) * 0.15);

    // Tyre bonus (softs are fastest in quali)
    const tyreBonus = { soft: 0.0, medium: 0.5, hard: 1.1 };
    time += tyreBonus[compound] || 0;

    // Track evolution (later = faster)
    const trackEvo = modifiers.trackEvolution || 0;
    time -= trackEvo;

    // Card bonuses
    time -= this.qualiBonusFromCards;
    time -= this.futureQualiBonus * 0.15; // each position = ~0.15s

    // Ambient conditions
    time += (modifiers.timePenalty || 0);

    // Random variation (±0.3s)
    time += (Math.random() - 0.5) * 0.6;

    return Math.max(time * 0.85, time);
  }

  runPhase(phase, driver, compound, onEvent) {
    this.currentPhase = phase;
    const aiField = this.generateAITimes(phase);
    const cutoffMap = { q1: 14, q2: 9, q3: null };
    const cutoff = cutoffMap[phase];

    // Check for qualifying event (40% chance)
    if (Math.random() < 0.40) {
      const event = QUALIFYING_EVENTS[Math.floor(Math.random() * QUALIFYING_EVENTS.length)];
      this.pendingEvent = event;
      return { phase, awaitingEvent: true, event, aiField, cutoff };
    }

    const playerTime = this.calculatePlayerTime(driver, compound, { trackEvolution: 0.1 });
    return this.resolvePhase(phase, driver, compound, aiField, cutoff, playerTime);
  }

  resolvePhase(phase, driver, compound, aiField, cutoff, playerTime, eventMod = 0) {
    const finalTime = playerTime + eventMod;
    const combined = [...aiField, { driver: driver.name, time: finalTime, str: formatLapTime(finalTime), isPlayer: true, team: this.playerTeam.name, color: this.playerTeam.color }];
    combined.sort((a, b) => a.time - b.time);

    const playerPos = combined.findIndex(r => r.isPlayer) + 1;
    const eliminated = cutoff !== null && playerPos > cutoff;

    this.results[phase] = { times: combined, playerPos, eliminated, playerTime: finalTime };

    if (!eliminated) {
      this.gridPosition = playerPos;
    }

    return {
      phase, times: combined, playerPos, eliminated,
      playerTime: finalTime, cutoff,
      advances: !eliminated,
    };
  }

  applyEventChoice(phase, driver, compound, aiField, cutoff, baseTime, choice) {
    let timePenalty = 0;

    if (choice.outcome.lap_aborted) {
      // Fresh run - get a second chance but slightly slower due to time pressure
      const newTime = this.calculatePlayerTime(driver, compound, { trackEvolution: 0.05 });
      return this.resolvePhase(phase, driver, compound, aiField, cutoff, newTime, 0);
    }
    if (choice.outcome.time_penalty) timePenalty += choice.outcome.time_penalty;
    if (choice.outcome.time_bonus) timePenalty -= choice.outcome.time_bonus;
    if (choice.outcome.risk && Math.random() < choice.outcome.risk) timePenalty += 1.2;

    return this.resolvePhase(phase, driver, compound, aiField, cutoff, baseTime, timePenalty);
  }

  getFinalGrid() {
    const grid = this.results.q3 || this.results.q2 || this.results.q1;
    if (!grid) return [];
    return grid.times;
  }
}

// ============================================================
// RACE SIMULATION
// ============================================================
class RaceSimulation {
  constructor(track, playerTeam, playerCar, drivers, startingGrid, gameState) {
    this.track = track;
    this.playerTeam = playerTeam;
    this.playerCar = playerCar;
    this.drivers = drivers;
    this.startingGrid = startingGrid; // array of {driver, team, color, isPlayer, carStrength}
    this.gameState = gameState;
    this.laps = track.laps;
    this.currentLap = 0;
    this.rainLevel = 0;
    this.rainForecast = this.generateRainForecast();
    this.trackTemp = track.weather.baseTemp + Math.random() * track.weather.variance;
    this.ambientTemp = this.trackTemp - 12;

    // Player state
    this.playerDriver = drivers[0]; // currently "active" driver being tracked
    this.playerTyres = [
      new TyreState('medium'),
      new TyreState('medium'),
    ]; // one per driver
    this.playerPosition = startingGrid.findIndex(r => r.isPlayer) + 1;
    if (this.playerPosition <= 0) this.playerPosition = 12;

    this.playerPitStops = [0, 0]; // pit stop counts per driver
    this.playerPitHistory = [[], []]; // [(lap, compound), ...]
    this.carDamage = 0; // 0-100
    this.engineWear = 0;
    this.drsWorking = true;

    // Track standings
    this.standings = this.initStandings();
    this.lapHistory = [];
    this.eventHistory = [];
    this.fastestLap = null;
    this.safetyCarLaps = 0;
    this.safetyCarActive = false;
    this.wearModifier = gameState.wearModifier || 1.0;
    this.speedBoostLaps = 0;
    this.speedBoostValue = 0;
    this.conserveMode = false;
    this.drsBoostLaps = 0;
  }

  generateRainForecast() {
    const forecast = [];
    let raining = false;
    const baseChance = this.track.weather.rainChance;
    for (let lap = 0; lap <= this.laps; lap++) {
      if (!raining && Math.random() < baseChance / 5) {
        raining = true;
      } else if (raining && Math.random() < 0.08) {
        raining = false;
      }
      forecast.push(raining ? (Math.random() * 0.4 + 0.3) * this.track.weather.rainIntensity : 0);
    }
    return forecast;
  }

  initStandings() {
    return this.startingGrid.map((entry, idx) => ({
      ...entry,
      position: idx + 1,
      lapsBehind: 0,
      gap: 0,
      gapToLeader: 0,
      tyreCompound: idx < 5 ? 'soft' : (idx < 12 ? 'medium' : 'hard'),
      tyreWear: 0,
      pitted: false,
      pitCount: 0,
      lapsOnTyre: 0,
      dnf: false,
      fastestLap: false,
      totalTime: 0,
      lapTime: 90,
    }));
  }

  // Simulate a "segment" of laps (grouped for UI pacing)
  simulateSegment(segmentLaps, driverIndex = 0, activeCardEffects = {}) {
    const results = [];
    const playerEntry = this.standings.find(s => s.isPlayer);
    if (!playerEntry) return results;

    const tyre = this.playerTyres[driverIndex];
    const driver = this.drivers[driverIndex];

    for (let i = 0; i < segmentLaps && this.currentLap < this.laps; i++) {
      this.currentLap++;
      this.rainLevel = this.rainForecast[this.currentLap] || 0;

      // Check safety car
      if (this.safetyCarLaps > 0) {
        this.safetyCarLaps--;
        if (this.safetyCarLaps === 0) this.safetyCarActive = false;
      }

      // Simulate tyre wear
      const speedLevel = this.conserveMode ? 0.80 :
                         (this.speedBoostLaps > 0 ? 1.15 : 1.0);
      tyre.simulateLap({
        speed: speedLevel,
        trackTemp: this.trackTemp,
        ambientTemp: this.ambientTemp,
        rainLevel: this.rainLevel,
        downforce: this.playerCar.downforce / 100,
        wearModifier: this.wearModifier * (this.track.tyreMult[tyre.compound] || 1.0),
      });

      // Calculate player lap time
      const baseLapTime = getBaseLapTime(this.track, this.playerCar);
      const tyrePerf = tyre.getPerformance(this.rainLevel);
      const driverMod = getDriverLapMod(driver);

      let lapTime = baseLapTime / tyrePerf + driverMod;

      // Apply temporary effects
      if (this.speedBoostLaps > 0) {
        lapTime -= this.speedBoostValue;
        this.speedBoostLaps--;
      }
      if (this.conserveMode) lapTime += 0.8;
      if (this.carDamage > 30) lapTime += this.carDamage * 0.02;
      if (!this.drsWorking) lapTime += this.track.drsZones * 0.3;

      // Rain handling - wrong tyres
      if (this.rainLevel > 0.3 && ['soft', 'medium', 'hard'].includes(tyre.compound)) {
        lapTime += this.rainLevel * 4.0; // massive penalty on slicks in rain
      }

      // Safety car lap
      if (this.safetyCarActive) {
        lapTime = baseLapTime * 1.4; // follow SC
      }

      // Add random variation
      lapTime += (Math.random() - 0.5) * 0.4;

      playerEntry.lapTime = lapTime;
      playerEntry.totalTime = (playerEntry.totalTime || 0) + lapTime;

      // Simulate AI movement (simplified)
      this.simulateAILap(this.currentLap);

      // Fastest lap check
      if (!this.fastestLap || lapTime < this.fastestLap.time) {
        this.fastestLap = { time: lapTime, lap: this.currentLap, driver: driver.name, isPlayer: true };
        playerEntry.fastestLap = true;
      }

      // Update positions
      this.recalculatePositions();

      results.push({
        lap: this.currentLap,
        lapTime: lapTime,
        tyreWear: tyre.wear,
        tyrePerf: tyrePerf,
        tyreCompound: tyre.compound,
        position: this.standings.find(s => s.isPlayer)?.position || this.playerPosition,
        rainLevel: this.rainLevel,
        safetyCarActive: this.safetyCarActive,
        carDamage: this.carDamage,
        isOnCliff: tyre.isOnCliff(),
      });
    }

    this.lapHistory.push(...results);
    return results;
  }

  simulateAILap(lap) {
    const baseLapTime = getBaseLapTime(this.track, this.playerCar);

    for (const entry of this.standings) {
      if (entry.isPlayer) continue;
      if (entry.dnf) continue;

      const strengthFactor = 1 - (entry.carStrength - 70) / 500;
      let aiLapTime = baseLapTime * strengthFactor;

      // Tyre progression
      entry.lapsOnTyre = (entry.lapsOnTyre || 0) + 1;
      entry.tyreWear = Math.min(100, (entry.tyreWear || 0) + TYRE_COMPOUNDS[entry.tyreCompound || 'medium'].wearRate * (this.track.tyreMult[entry.tyreCompound] || 1.0) * strengthFactor);

      // AI pit strategy (simplified)
      if (!entry.pitted && entry.tyreWear > 70 && lap > this.laps * 0.3 && lap < this.laps * 0.8) {
        entry.pitted = true;
        entry.pitCount = (entry.pitCount || 0) + 1;
        entry.tyreWear = 0;
        entry.lapsOnTyre = 0;
        entry.tyreCompound = entry.tyreCompound === 'soft' ? 'medium' : 'hard';
        const pitTeam = AI_TEAMS.find(t => t.shortName === entry.team);
        aiLapTime += this.track.pitlaneTime + (25 - (pitTeam?.pitSpeed || 80) * 0.25) + Math.random() * 3;
      }

      // Rain — better rain drivers take less of a penalty
      if (this.rainLevel > 0.3 && ['soft', 'medium', 'hard'].includes(entry.tyreCompound)) {
        const rainSkill = entry.driverRainSkill || 76;
        const rainPenalty = Math.max(1.5, 3.5 - (rainSkill - 76) * 0.04);
        aiLapTime += this.rainLevel * rainPenalty;
        // AI slowly switches to inters
        if (this.rainLevel > 0.5 && Math.random() < 0.3) {
          entry.tyreCompound = 'inter';
          aiLapTime += this.track.pitlaneTime;
        }
      }

      // Safety car
      if (this.safetyCarActive) {
        aiLapTime = baseLapTime * 1.4;
      }

      // Random variation
      aiLapTime += (Math.random() - 0.5) * 0.8;
      entry.totalTime = (entry.totalTime || 0) + aiLapTime;
      entry.lapTime = aiLapTime;

      // DNF chance
      if (Math.random() < 0.002 * strengthFactor) {
        entry.dnf = true;
      }
    }
  }

  recalculatePositions() {
    const active = this.standings.filter(s => !s.dnf);
    active.sort((a, b) => (a.totalTime || 0) - (b.totalTime || 0));
    active.forEach((entry, idx) => {
      entry.position = idx + 1;
      entry.gapToLeader = idx === 0 ? 0 : (entry.totalTime - active[0].totalTime);
    });
    // Keep DNF cars at back
    const dnf = this.standings.filter(s => s.dnf);
    dnf.forEach((entry, idx) => {
      entry.position = active.length + idx + 1;
    });
  }

  // customPitTime: if provided, used as the total time cost instead of simulating the stop
  pit(driverIndex, newCompound, customPitTime = null) {
    const oldCompound = this.playerTyres[driverIndex].compound;

    // Always create a fresh tyre — wear resets to 0
    this.playerTyres[driverIndex] = new TyreState(newCompound);
    this.playerPitStops[driverIndex]++;
    this.playerPitHistory[driverIndex].push({ lap: this.currentLap, compound: newCompound });

    let totalPitTime;
    if (customPitTime !== null) {
      totalPitTime = customPitTime; // event-specified cost (e.g. SC reduces pit penalty)
    } else {
      const crewTime = 2.0 + (100 - this.playerCar.pitSpeed) / 50;
      totalPitTime = this.track.pitlaneTime + crewTime + (Math.random() - 0.5);
    }

    const playerEntry = this.standings.find(s => s.isPlayer);
    if (playerEntry) {
      playerEntry.totalTime += totalPitTime;
      playerEntry.tyreCompound = newCompound;
      playerEntry.tyreWear = 0;
      playerEntry.pitted = true;
      playerEntry.pitCount = (playerEntry.pitCount || 0) + 1;
    }

    this.recalculatePositions();

    return { oldCompound, newCompound, pitTime: totalPitTime.toFixed(1), lap: this.currentLap };
  }

  triggerSafetyCar(laps = 4) {
    this.safetyCarActive = true;
    this.safetyCarLaps = laps;
    return laps;
  }

  applySpeedBoost(secondsPerLap, laps) {
    this.speedBoostValue = secondsPerLap;
    this.speedBoostLaps = laps;
  }

  applyWearReduction(reduction) {
    this.wearModifier = Math.max(0.1, this.wearModifier * (1 - reduction));
  }

  checkForEvent() {
    if (this.currentLap < 2) return null; // No events on lap 1-2
    if (this.safetyCarActive) return null;

    const safetyCarRoll = Math.random();
    if (safetyCarRoll < this.track.safetyCarChance / this.laps * 3) {
      return 'safety_car';
    }

    const eventChance = 0.18;
    if (Math.random() > eventChance) return null;

    // Pick from track's event pool
    const pool = this.track.eventPool || [];
    if (pool.length === 0) return null;

    // Filter out events already used (avoid repeats) and any that belong to qualifying only
    const raceEventIds = new Set(RACE_EVENTS.map(e => e.id));
    const usedEvents = this.eventHistory.map(e => e.id);
    const available = pool.filter(id => {
      if (!raceEventIds.has(id)) return false; // not a valid race event
      if (id === 'safety_car') return true;     // allow SC multiple times
      return !usedEvents.includes(id);
    });

    if (available.length === 0) return null;

    const eventId = available[Math.floor(Math.random() * available.length)];
    return eventId;
  }

  resolveEventChoice(event, choice, cardPlayed = null) {
    const outcome = choice.outcome;
    const result = { eventId: event.id, choiceId: choice.id, effects: [], cardUsed: cardPlayed };

    // Apply card synergy bonus
    let synergyBonus = cardPlayed && choice.cardSynergy?.includes(cardPlayed) ? 0.15 : 0;

    if (outcome.tyre_change) {
      const compound = outcome.new_tyre || this.playerTyres[0].compound;
      const customTime = (outcome.time_penalty != null) ? Math.max(0, outcome.time_penalty - synergyBonus * 5) : null;
      const pitResult = this.pit(0, compound, customTime);
      result.effects.push(`Pitted for ${TYRE_COMPOUNDS[compound].name} tyres (${pitResult.pitTime}s stop)`);
    } else if (outcome.time_penalty) {
      const penalty = Math.max(0, outcome.time_penalty - synergyBonus * 5);
      const playerEntry = this.standings.find(s => s.isPlayer);
      if (playerEntry) playerEntry.totalTime += penalty;
      this.recalculatePositions();
      result.effects.push(`+${penalty.toFixed(1)}s time penalty`);
    }

    if (outcome.speed_bonus) {
      const laps = outcome.duration || 5;
      this.applySpeedBoost(outcome.speed_bonus * (1 + synergyBonus), laps);
      result.effects.push(`-${outcome.speed_bonus}s/lap for ${laps} laps`);
    }
    if (outcome.speed_penalty) {
      const laps = outcome.duration || 10;
      this.applySpeedBoost(-outcome.speed_penalty, laps); // negative = slow
      result.effects.push(`+${outcome.speed_penalty}s/lap for ${laps} laps`);
    }
    if (outcome.prevents === 'brake_failure' || outcome.prevents === 'wing_damage') {
      result.effects.push(`Prevented potential ${outcome.prevents.replace('_', ' ')}`);
    }
    if (outcome.pit_time_extra) {
      const playerEntry = this.standings.find(s => s.isPlayer);
      if (playerEntry) playerEntry.totalTime += outcome.pit_time_extra;
      this.recalculatePositions();
      result.effects.push(`Pit stop took extra ${outcome.pit_time_extra}s`);
    }
    if (outcome.position_change) {
      const playerEntry = this.standings.find(s => s.isPlayer);
      if (playerEntry && outcome.position_change > 0) {
        playerEntry.totalTime -= outcome.position_change * 0.5;
        this.recalculatePositions();
        result.effects.push(`Gained ~${outcome.position_change} position(s)`);
      }
    }
    if (outcome.wear_increase) {
      this.playerTyres[0].wear = Math.min(100, this.playerTyres[0].wear + outcome.wear_increase * 30);
      result.effects.push('Tyre wear increased');
    }
    if (outcome.wear_reduction) {
      this.wearModifier = Math.max(0.1, this.wearModifier * (1 - outcome.wear_reduction * 0.5));
      result.effects.push('Tyre wear rate reduced');
    }

    // Risk outcomes
    if (outcome.risk && outcome.risk_chance) {
      const effectiveRisk = Math.max(0, outcome.risk_chance - synergyBonus * 0.5);
      if (Math.random() < effectiveRisk) {
        result.riskTriggered = true;
        result.riskType = outcome.risk;
        if (outcome.risk === 'dnf' || outcome.risk === 'engine_dnf' || outcome.risk === 'brake_failure') {
          result.dnf = true;
          result.effects.push('💀 MECHANICAL FAILURE - DNF');
        } else if (outcome.risk === 'wing_failure') {
          this.carDamage = 80;
          const playerEntry = this.standings.find(s => s.isPlayer);
          if (playerEntry) playerEntry.totalTime += 25;
          this.recalculatePositions();
          result.effects.push('Front wing failure! 25 second penalty');
        } else if (outcome.risk === 'loose_wheel_dnf') {
          result.dnf = true;
          result.effects.push('💀 LOOSE WHEEL - BLACK FLAG - DNF');
        } else if (outcome.risk === 'position_gamble') {
          const success = Math.random() < (outcome.success_chance || 0.5);
          if (success) {
            const playerEntry = this.standings.find(s => s.isPlayer);
            if (playerEntry) {
              playerEntry.totalTime -= (outcome.success?.position_change || 1) * 0.3;
              this.recalculatePositions();
            }
            result.effects.push(`Overtake succeeded! Gained ${outcome.success?.position_change || 1} position(s)`);
          } else {
            const playerEntry = this.standings.find(s => s.isPlayer);
            if (playerEntry && outcome.fail?.position_change) {
              playerEntry.totalTime += Math.abs(outcome.fail.position_change) * 0.3;
              this.recalculatePositions();
            }
            result.effects.push('Overtake failed!');
          }
          result.riskTriggered = false; // already handled
        } else if (outcome.risk === 'heavy_rain_penalty') {
          const penaltyPerLap = 5.0;
          const playerEntry = this.standings.find(s => s.isPlayer);
          if (playerEntry) playerEntry.totalTime += penaltyPerLap * 5;
          this.recalculatePositions();
          result.effects.push('Rain got heavy! Lost time on slicks');
        }
      } else {
        result.riskTriggered = false;
        if (outcome.gamble_bonus) {
          result.effects.push(`Gamble paid off! Saved ${outcome.gamble_bonus}s`);
          const playerEntry = this.standings.find(s => s.isPlayer);
          if (playerEntry) playerEntry.totalTime -= outcome.gamble_bonus;
          this.recalculatePositions();
        } else {
          result.effects.push('Risk avoided!');
        }
      }
    }

    // Safety car trigger
    if (outcome.dnf === true && !result.dnf) {
      result.dnf = true;
      result.effects.push('DNF');
    }

    this.eventHistory.push({ id: event.id, lap: this.currentLap, result });
    return result;
  }

  getPlayerPosition() {
    return this.standings.find(s => s.isPlayer)?.position || 0;
  }

  getTopN(n = 10) {
    return this.standings
      .filter(s => !s.dnf)
      .sort((a, b) => a.position - b.position)
      .slice(0, n);
  }

  getRaceResult(dnf = false) {
    const pos = dnf ? 20 : this.getPlayerPosition();
    const points = pos <= 10 ? POINTS_SYSTEM[pos - 1] : 0;
    const fastestLapBonus = this.fastestLap?.isPlayer && pos <= 10 ? 1 : 0;

    return {
      position: pos,
      points: points + fastestLapBonus,
      fastestLap: this.fastestLap?.isPlayer,
      fastestLapBonus,
      dnf,
      pitStops: this.playerPitStops[0],
      pitHistory: this.playerPitHistory[0],
      lapHistory: this.lapHistory,
      standings: this.standings.sort((a, b) => a.position - b.position),
    };
  }
}

// ============================================================
// PRACTICE SESSION
// ============================================================
class PracticeSession {
  constructor(track, playerCar, drivers) {
    this.track = track;
    this.playerCar = playerCar;
    this.drivers = drivers;
    this.setupData = {
      wing: 5, // 1-10, low = more speed, high = more downforce
      suspension: 5, // 1-10, soft to stiff
      tyrePrep: 'medium', // which compound focused on
    };
    this.setupBonuses = { speed: 0, downforce: 0, reliability: 0 };
    this.longRunData = null;
    this.singleLapData = null;
    this.completed = false;
  }

  runLongRun(compound) {
    const tyre = new TyreState(compound);
    const laps = 15;
    const data = [];
    for (let i = 0; i < laps; i++) {
      tyre.simulateLap({
        speed: 0.90,
        trackTemp: this.track.weather.baseTemp - 5,
        rainLevel: 0,
        downforce: this.playerCar.downforce / 100,
        wearModifier: this.track.tyreMult[compound] || 1.0,
      });
      data.push({
        lap: i + 1,
        wear: Math.round(tyre.wear),
        performance: Math.round(tyre.getPerformance() * 100),
        temp: Math.round(tyre.temp),
        onCliff: tyre.isOnCliff(),
      });
    }
    this.longRunData = { compound, laps: data };
    return data;
  }

  runSingleLap(compound) {
    const baseLapTime = getBaseLapTime(this.track, this.playerCar);
    const driver = this.drivers[0];
    const tyre = new TyreState(compound, 0);

    // Push lap
    tyre.simulateLap({ speed: 1.1, trackTemp: this.track.weather.baseTemp });
    const lapTime = baseLapTime / tyre.getPerformance() + getDriverLapMod(driver);

    this.singleLapData = { compound, lapTime, str: formatLapTime(lapTime) };
    return this.singleLapData;
  }

  applySetup(wing, suspension) {
    this.setupData.wing = wing;
    this.setupData.suspension = suspension;

    // Convert setup to bonuses
    // High wing = more downforce, less speed
    this.setupBonuses.downforce = (wing - 5) * 1.5; // -7.5 to +7.5
    this.setupBonuses.speed = (5 - wing) * 1.0;     // -5 to +5

    // Suspension affects reliability in bumpy conditions
    this.setupBonuses.reliability = suspension > 6 ? 3 : (suspension < 4 ? -3 : 0);

    return this.setupBonuses;
  }

  complete() {
    this.completed = true;
    return this.setupBonuses;
  }
}

function formatLapTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(3);
  return `${mins}:${secs.padStart(6, '0')}`;
}
