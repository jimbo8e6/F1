// ============================================================
// SAVE MANAGER — localStorage persistence between races
// Only saves at the map screen (safe checkpoint between weekends)
// ============================================================

const SaveManager = {
  KEY: 'pitwall_save',
  VERSION: 1,

  save() {
    const gs = GameState;
    const data = {
      version: this.VERSION,
      savedAt: new Date().toISOString(),
      season: gs.season,
      round: gs.round,
      totalRounds: gs.totalRounds,
      money: gs.money,
      constructorsPoints: gs.constructorsPoints,
      rivalPoints: gs.rivalPoints,
      teamId: gs.team.id,
      ...(gs.team.id === 'custom' ? { customTeam: { ...gs.team } } : {}),
      carStats: { ...gs.carStats },
      drivers: gs.team.drivers.map(d => ({ ...d })),
      deck: [...gs.deck],
      hand: [...gs.hand],
      discard: [...gs.discard],
      maxHandSize: gs.maxHandSize,
      raceCalendar: [...gs.raceCalendar],
      results: gs.results.map(r => ({ ...r })),
      strategyVision: gs.strategyVision,
      futureQualiBonus: gs.futureQualiBonus,
      wearModifier: gs.wearModifier,
    };
    try {
      localStorage.setItem(this.KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.warn('Save failed:', e);
      return false;
    }
  },

  load() {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (data.version !== this.VERSION) return null;
      return data;
    } catch (e) {
      return null;
    }
  },

  hasSave() {
    return !!localStorage.getItem(this.KEY);
  },

  deleteSave() {
    localStorage.removeItem(this.KEY);
  },

  getSummary() {
    const data = this.load();
    if (!data) return null;
    const team = data.teamId === 'custom'
      ? data.customTeam
      : AI_TEAMS.find(t => t.id === data.teamId);
    const date = new Date(data.savedAt);
    const timeStr = date.toLocaleString(undefined, {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
    return {
      teamName: team?.name || data.teamId,
      teamEmoji: team?.logoEmoji || '🏎',
      teamColor: team?.color || '#fff',
      round: data.round,
      totalRounds: data.totalRounds,
      points: data.constructorsPoints,
      money: data.money,
      savedAt: timeStr,
    };
  },
};
