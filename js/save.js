/* Persistence. The whole world is plain data, so a save is just JSON plus the
 * random generator's current position — reload and the timeline continues from
 * exactly where it left off. */

const SAVE_KEY = 'flagtoflag.save.v1';

function saveGame(game) {
  try {
    const payload = {
      version: 1,
      savedAt: Date.now(),
      rngSeed: game.rng.seed(),
      proceduralCount,
      world: game.world,
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
    return true;
  } catch (err) {
    console.error('Save failed', err);
    return false;
  }
}

function hasSave() {
  try { return !!localStorage.getItem(SAVE_KEY); } catch (err) { return false; }
}

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const payload = JSON.parse(raw);
    if (!payload || !payload.world) return null;

    /* Restoring the generator at its saved position keeps the timeline
     * deterministic across sessions. */
    const rng = makeRng(payload.rngSeed);
    if (typeof payload.proceduralCount === 'number') {
      proceduralCount = payload.proceduralCount;
    }
    return { world: payload.world, rng };
  } catch (err) {
    console.error('Load failed', err);
    return null;
  }
}

function clearSave() {
  try { localStorage.removeItem(SAVE_KEY); } catch (err) { /* nothing to do */ }
}
