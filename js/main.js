/* Bootstrap and event wiring. */

const game = { world: null, rng: null };

/* ------------------------------------------------------------ lifecycle ---- */

function newGame(seed = Date.now()) {
  game.rng = makeRng(seed);
  game.world = createWorld(seed);
  proceduralCount = 0;
  startSeason(game.world, game.rng);
  UI.view = { name: 'season', arg: null };
  render(game);
}

function boot() {
  const loaded = hasSave() ? loadGame() : null;
  if (loaded) {
    game.world = loaded.world;
    game.rng = loaded.rng;
    /* A save written mid-season still needs its season scaffolding present. */
    if (!game.world.calendar || !game.world.calendar.length) {
      startSeason(game.world, game.rng);
    }
    UI.view = { name: 'season', arg: null };
    render(game);
    toast(`Resumed — ${game.world.year}`);
  } else {
    newGame();
  }
}

/* Auto-save after anything that moves the world forward. */
function persist() {
  saveGame(game);
}

/* --------------------------------------------------------------- actions -- */

function doNextRace() {
  const world = game.world;

  if (world.seasonOver) {
    advanceYear(world, game.rng);
    UI.view = { name: 'season', arg: null };
    render(game);
    persist();
    toast(`${world.year} season begins`);
    return;
  }

  runRound(world, game.rng);
  UI.view = { name: 'season', arg: null };
  render(game);
  persist();
}

function doRestOfSeason() {
  const world = game.world;
  if (world.seasonOver) return;

  let guard = 0;
  while (!world.seasonOver && guard < 40) {
    runRound(world, game.rng);
    guard += 1;
  }
  UI.view = { name: 'season', arg: null };
  render(game);
  persist();

  if (world.champion) {
    toast(`${world.year}: ${game.world.drivers[world.champion].name} takes the title`, 3200);
  }
}

/* ---------------------------------------------------------------- events -- */

function go(name, arg) {
  UI.view = { name, arg };
  render(game);
  window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
}

document.addEventListener('click', ev => {
  const t = ev.target.closest('[data-driver]');
  if (t) { go('driver', t.dataset.driver); return; }

  const tm = ev.target.closest('[data-team]');
  if (tm) { go('team', tm.dataset.team); return; }

  const race = ev.target.closest('[data-race]');
  if (race) { go('race', parseInt(race.dataset.race, 10)); return; }

  const back = ev.target.closest('.backlink[data-view]');
  if (back) { go(back.dataset.view, null); return; }

  const tab = ev.target.closest('.tab[data-view]');
  if (tab) { go(tab.dataset.view, null); return; }

  const chip = ev.target.closest('[data-dfilter]');
  if (chip) {
    UI.driverFilter = chip.dataset.dfilter;
    render(game);
    return;
  }
});

/* Driver search, kept responsive without re-rendering the whole app per key. */
document.addEventListener('input', ev => {
  if (ev.target.id !== 'driver-search') return;
  UI.driverQuery = ev.target.value;
  const pos = ev.target.selectionStart;
  render(game);
  const again = document.getElementById('driver-search');
  if (again) { again.focus(); again.setSelectionRange(pos, pos); }
});

document.getElementById('btn-next').addEventListener('click', doNextRace);
document.getElementById('btn-season').addEventListener('click', doRestOfSeason);

document.getElementById('btn-menu').addEventListener('click', () => {
  document.getElementById('sheet').hidden = false;
});
document.getElementById('btn-close-sheet').addEventListener('click', () => {
  document.getElementById('sheet').hidden = true;
});
document.getElementById('sheet').addEventListener('click', ev => {
  if (ev.target.id === 'sheet') ev.target.hidden = true;
});

document.getElementById('btn-save').addEventListener('click', () => {
  document.getElementById('sheet').hidden = true;
  toast(saveGame(game) ? 'Game saved' : 'Could not save');
});

document.getElementById('btn-load').addEventListener('click', () => {
  document.getElementById('sheet').hidden = true;
  const loaded = loadGame();
  if (!loaded) { toast('No saved game found'); return; }
  game.world = loaded.world;
  game.rng = loaded.rng;
  UI.view = { name: 'season', arg: null };
  render(game);
  toast(`Loaded — ${game.world.year}`);
});

document.getElementById('btn-new').addEventListener('click', () => {
  document.getElementById('sheet').hidden = true;
  if (!confirm('Start a new history? The current timeline will be lost.')) return;
  clearSave();
  newGame();
  toast('A new 1950 begins');
});

/* Keyboard: space or right-arrow runs the next race. */
document.addEventListener('keydown', ev => {
  if (ev.target.tagName === 'INPUT') return;
  if (ev.code === 'Space' || ev.code === 'ArrowRight') {
    ev.preventDefault();
    doNextRace();
  }
});

boot();
