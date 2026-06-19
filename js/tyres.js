// ============================================================
// TYRE PHYSICS SYSTEM
// ============================================================

class TyreState {
  constructor(compound, lapsUsed = 0) {
    this.compound = compound;
    this.data = TYRE_COMPOUNDS[compound];
    this.wear = lapsUsed > 0 ? lapsUsed * this.data.wearRate * 1.2 : 0;
    this.temp = 60; // cold start
    this.graining = 0;
    this.blistering = 0;
    this.lapsOnTyre = lapsUsed;
    this.warmupComplete = lapsUsed >= this.data.warmupLaps;
  }

  // Simulate one lap of tyre behaviour
  simulateLap(opts = {}) {
    const {
      speed = 1.0,        // 0.7 (lift/coast) to 1.0 (push) to 1.2 (max attack)
      trackTemp = 40,
      ambientTemp = 25,
      rainLevel = 0,      // 0 = dry, 1 = heavy rain
      downforce = 1.0,    // normalized car downforce
      wearModifier = 1.0, // card/setup modifier
    } = opts;

    // Tyre temperature model
    const targetTemp = this.data.optimalTemp + (trackTemp - 30) * 0.5 - rainLevel * 25;
    const heatGeneration = speed * 8 * downforce;
    this.temp += (heatGeneration - (this.temp - (ambientTemp + 10)) * 0.15);
    this.temp = Math.max(ambientTemp, Math.min(150, this.temp));

    // Warmup check
    if (!this.warmupComplete && this.lapsOnTyre >= this.data.warmupLaps) {
      this.warmupComplete = true;
    }

    // Wear calculation
    let wearThisLap = this.data.wearRate * speed * wearModifier;

    // Temperature effect on wear
    const tempDelta = Math.abs(this.temp - this.data.optimalTemp);
    if (tempDelta > 15) {
      wearThisLap *= 1 + (tempDelta - 15) * 0.02;
    }

    // Rain effect on wear (slicks wear faster on wet, wet tyres wear slower)
    if (rainLevel > 0.1) {
      if (this.compound === 'soft' || this.compound === 'medium' || this.compound === 'hard') {
        wearThisLap *= 1 + rainLevel * 0.5; // slicks in rain wear fast
      } else {
        wearThisLap *= Math.max(0.3, 1 - rainLevel * 0.4); // wet tyres last longer in rain
      }
    }

    this.wear = Math.min(100, this.wear + wearThisLap);
    this.lapsOnTyre++;

    // Graining: occurs when cold tyres overheat quickly
    if (!this.warmupComplete && speed > 0.9) {
      this.graining = Math.min(15, this.graining + 2);
    } else if (this.graining > 0 && this.temp > this.data.optimalTemp - 10) {
      this.graining = Math.max(0, this.graining - 0.5); // graining burns off
    }

    // Blistering: high temp + high wear
    if (this.temp > this.data.optimalTemp + 20 && this.wear > 50) {
      this.blistering = Math.min(20, this.blistering + 1);
    }
  }

  // Returns performance multiplier (1.0 = peak, 0.5 = terrible)
  getPerformance(rainLevel = 0) {
    const data = this.data;
    let perf = data.baseGrip;

    // Warmup penalty
    if (!this.warmupComplete) {
      const warmupFraction = this.lapsOnTyre / data.warmupLaps;
      perf *= 0.92 + warmupFraction * 0.08;
    }

    // Wear degradation curve
    if (this.wear <= data.cliffPoint) {
      // Linear degradation before cliff
      const deg = (this.wear / data.cliffPoint) * 0.12;
      perf -= deg;
    } else {
      // Post-cliff: performance drops sharply
      const precliff = 0.12;
      const postCliffWear = this.wear - data.cliffPoint;
      const postCliffRange = 100 - data.cliffPoint;
      const cliffDeg = precliff + (postCliffWear / postCliffRange) * 0.35 * data.postCliffMult / 2;
      perf -= cliffDeg;
    }

    // Temperature effect
    const tempDelta = Math.abs(this.temp - data.optimalTemp);
    if (tempDelta > 5) {
      perf -= (tempDelta - 5) * 0.002;
    }

    // Graining and blistering
    perf -= this.graining * 0.005;
    perf -= this.blistering * 0.008;

    // Rain effects
    if (rainLevel > 0.15) {
      if (this.compound === 'wet') {
        perf = Math.min(perf * (1 + data.wetBonus), perf + 0.15);
      } else if (this.compound === 'inter') {
        if (rainLevel < 0.6) {
          perf = Math.min(perf * (1 + data.wetBonus * 0.6), perf + 0.10);
        } else {
          perf -= 0.10; // too wet for inters
        }
      } else {
        // Slick tyre in rain
        perf -= data.wetPenalty * rainLevel;
      }
    } else if (rainLevel < 0.05) {
      // Dry conditions
      if (this.compound === 'wet') perf -= data.dryPenalty;
      else if (this.compound === 'inter') perf -= data.dryPenalty * 0.5;
    }

    return Math.max(0.45, perf);
  }

  // Returns lap time delta in seconds (positive = slower than optimal)
  getLapTimeDelta(baseTime = 90, rainLevel = 0) {
    const perf = this.getPerformance(rainLevel);
    // Map performance to lap time: 1.0 perf = 0 delta, 0.8 perf = ~3s slower
    return (1.0 - perf) * baseTime * 0.15;
  }

  isOnCliff() {
    return this.wear >= this.data.cliffPoint;
  }

  getWearCategory() {
    if (this.wear < 25) return { label: 'NEW', color: '#00FF88' };
    if (this.wear < 50) return { label: 'GOOD', color: '#88FF00' };
    if (this.wear < this.data.cliffPoint - 5) return { label: 'USED', color: '#FFAA00' };
    if (this.wear < this.data.cliffPoint + 10) return { label: 'WORN', color: '#FF6600' };
    return { label: 'DEAD', color: '#FF0000' };
  }

  getWearDisplay() {
    return Math.round(this.wear);
  }

  clone() {
    const c = new TyreState(this.compound, 0);
    c.wear = this.wear;
    c.temp = this.temp;
    c.graining = this.graining;
    c.blistering = this.blistering;
    c.lapsOnTyre = this.lapsOnTyre;
    c.warmupComplete = this.warmupComplete;
    return c;
  }
}

// Predict optimal strategy for a given track and conditions
function predictStrategy(track, carStats, rainChance = 0) {
  const laps = track.laps;
  const strategies = [];

  // One-stop strategies
  const compounds = ['soft', 'medium', 'hard'];
  for (const c1 of compounds) {
    for (const c2 of compounds) {
      if (c1 === c2 && c1 !== 'medium') continue;
      const t1 = new TyreState(c1);
      let pitLap = -1;
      for (let lap = 0; lap < laps; lap++) {
        t1.simulateLap({ speed: 0.95, trackTemp: track.characteristics.heat * 50 + 20 });
        if (t1.isOnCliff() && pitLap === -1) {
          pitLap = lap;
          break;
        }
      }
      if (!pitLap) pitLap = Math.floor(laps * 0.5);
      strategies.push({
        name: `${TYRE_COMPOUNDS[c1].abbr}-${TYRE_COMPOUNDS[c2].abbr} (Pit ~L${pitLap})`,
        compounds: [c1, c2],
        pitLap,
        stops: 1,
        risk: c1 === 'soft' ? 'high' : 'medium',
      });
    }
  }

  return strategies.slice(0, 4);
}

function getTyreCompoundForStrategy(strategyIndex, stint) {
  const strategies = [
    ['medium', 'hard'],
    ['soft', 'medium'],
    ['soft', 'hard'],
    ['medium', 'medium'],
    ['soft', 'medium', 'soft'],
  ];
  const strat = strategies[strategyIndex % strategies.length];
  return strat[stint % strat.length];
}
