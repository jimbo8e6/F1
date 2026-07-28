/* Rendering. Every driver and team name in the interface is a way in — click one
 * and you get their whole career, whatever screen you were on. */

const UI = {
  view: { name: 'season', arg: null },
  driverFilter: 'active',
  driverQuery: '',
};

/* ------------------------------------------------------------- helpers ---- */

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

function el(id) { return document.getElementById(id); }

function teamName(world, teamId) {
  if (!teamId) return '—';
  const live = world.teams && world.teams.find(t => t.id === teamId);
  if (live) return live.name;
  const def = TEAMS.find(t => t.id === teamId);
  return def ? def.name : teamId;
}

function driverLink(world, id, extraClass = '') {
  const d = world.drivers[id];
  if (!d) return esc(id);
  return `<span class="link ${extraClass}" data-driver="${esc(id)}">${esc(d.name)}</span>`;
}

function teamLink(world, id) {
  if (!id) return '—';
  return `<span class="link tname" data-team="${esc(id)}">${esc(teamName(world, id))}</span>`;
}

function statusPill(d) {
  const label = {
    active: 'Racing', injured: 'Injured', retired: 'Retired',
    resting: 'No drive', pending: 'Not yet debuted',
  }[d.status] || d.status;
  return `<span class="status-pill st-${d.status}">${label}</span>`;
}

/* Turn driver names inside a generated race report into links, longest names
 * first so "Michael Schumacher" is not eaten by "Ralf Schumacher". */
function linkifyReport(world, text, race) {
  const ids = new Set(race.results.map(r => r.driverId));
  for (const inc of (race.incidents || [])) ids.add(inc.driverId);
  for (const w of (race.withdrawals || [])) ids.add(w.driverId);
  /* The championship sentence can name drivers who did not start this race. */
  for (const d of Object.values(world.drivers)) {
    if (d.teamId && text.includes(d.name)) ids.add(d.id);
  }

  const names = [...ids]
    .map(id => ({ id, name: world.drivers[id] ? world.drivers[id].name : null }))
    .filter(x => x.name)
    .sort((a, b) => b.name.length - a.name.length);

  let out = esc(text);
  const placeholders = [];
  for (const { id, name } of names) {
    const safe = esc(name);
    if (!out.includes(safe)) continue;
    const token = `\u0000${placeholders.length}\u0000`;
    placeholders.push(`<span class="nm" data-driver="${esc(id)}">${safe}</span>`);
    out = out.split(safe).join(token);
  }
  return out.replace(/\u0000(\d+)\u0000/g, (m, i) => placeholders[+i]);
}

/* --------------------------------------------------------------- clock ---- */

function renderClock(world) {
  el('clock-year').textContent = world.year;
  const total = world.calendar.length;
  el('clock-round').textContent = world.seasonOver
    ? 'Season complete'
    : `Round ${world.round} of ${total}`;
}

/* -------------------------------------------------------------- season ---- */

function renderSeason(world) {
  const standings = driverStandings(world);
  const constructors = constructorStandings(world);
  const last = world.races[world.races.length - 1];

  let left = '';

  if (world.seasonOver && world.champion) {
    const champ = world.drivers[world.champion];
    const row = standings[0];
    left += `
      <div class="champion-card">
        <div class="kicker">${world.year} World Champion</div>
        <h2>${esc(champ.name)}</h2>
        <p>${esc(teamName(world, row ? row.teamId : champ.teamId))}
           · ${row ? row.total : 0} points · ${row ? row.wins : 0} wins
           · title number ${champ.career.titles}</p>
      </div>`;
  }

  if (last) {
    left += `
      <div class="card">
        <div class="report">
          <div class="report-kicker">Round ${last.round} · ${world.year}</div>
          <h2>${esc(last.gp)}${last.wet ? '<span class="wet-tag">Wet</span>' : ''}</h2>
          <div class="report-venue">${esc(last.venue)}</div>
          <p class="report-body">${linkifyReport(world, last.writeup, last)}</p>
        </div>
      </div>`;
    left += resultTable(world, last);
  } else {
    left += `
      <div class="card"><div class="empty">
        The ${world.year} season is ready.<br>
        Run the first race to begin the history.
      </div></div>`;
  }

  left += calendarCard(world);

  const right = standingsCard(world, standings) + constructorCard(world, constructors);

  return `<div class="layout"><div>${left}</div><div>${right}</div></div>`;
}

function resultTable(world, race) {
  const rows = race.results.map(r => {
    const posClass = r.pos ? `pos pos-${r.pos <= 3 ? r.pos : 'n'}` : 'pos';
    const posText = r.pos !== null && r.pos !== undefined ? r.pos : '—';
    const statusText = r.status === 'mechanical' ? `Mechanical, lap ${r.lap}`
      : r.status === 'accident' ? `Accident, lap ${r.lap}` : '';
    const fl = race.fastestLap === r.driverId
      ? ' <span class="flag" title="Fastest lap">FL</span>' : '';
    return `
      <tr class="${r.status === 'finished' ? '' : 'out'}">
        <td class="${posClass}">${posText}</td>
        <td>${driverLink(world, r.driverId)}${fl}
            ${statusText ? `<div class="status">${statusText}</div>` : ''}</td>
        <td>${teamLink(world, r.teamId)}</td>
        <td class="num">${r.gridPos}</td>
        <td class="pts">${r.points || ''}</td>
      </tr>`;
  }).join('');

  const poleName = race.polePosition ? world.drivers[race.polePosition] : null;

  return `
    <div class="card">
      <div class="card-head">
        <h3>Result</h3>
        <span class="meta">${poleName ? `Pole: ${esc(poleName.name)}` : ''}</span>
      </div>
      <div class="card-body flush scroll-x">
        <table class="grid">
          <thead><tr>
            <th style="width:34px">Pos</th><th>Driver</th><th>Car</th>
            <th style="text-align:right">Grid</th><th style="text-align:right">Pts</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>`;
}

function calendarCard(world) {
  const rows = world.calendar.map((c, i) => {
    const race = world.races[i];
    if (race) {
      const winner = race.results.find(r => r.pos === 1);
      return `
        <div class="cal-row done" data-race="${i}">
          <span class="cal-no">${i + 1}</span>
          <span class="cal-gp">${esc(c.gp)}</span>
          <span class="cal-win">${winner ? esc(world.drivers[winner.driverId].name) : '—'}${race.wet ? ' · wet' : ''}</span>
        </div>`;
    }
    const isNext = i === world.round && !world.seasonOver;
    return `
      <div class="cal-row ${isNext ? 'next' : 'upcoming'}">
        <span class="cal-no">${i + 1}</span>
        <span class="cal-gp">${esc(c.gp)}</span>
        <span class="cal-win">${isNext ? 'Next' : esc(c.venue)}</span>
      </div>`;
  }).join('');

  return `
    <div class="card">
      <div class="card-head"><h3>${world.year} Calendar</h3>
        <span class="meta">${world.calendar.length} rounds</span></div>
      <div class="card-body flush">${rows}</div>
    </div>`;
}

function standingsCard(world, standings) {
  if (!standings.length) {
    return `<div class="card"><div class="card-head"><h3>Championship</h3></div>
      <div class="empty">No races run yet.</div></div>`;
  }
  const sys = pointsSystem(world.year);
  const rows = standings.slice(0, 14).map(s => `
    <tr>
      <td class="pos pos-${s.pos <= 3 ? s.pos : 'n'}">${s.pos}</td>
      <td>${driverLink(world, s.driverId)}
          <div class="tname">${esc(teamName(world, s.teamId))}</div></td>
      <td class="pts">${s.total}</td>
    </tr>`).join('');

  return `
    <div class="card">
      <div class="card-head"><h3>Championship</h3>
        <span class="meta">${sys.drop ? 'best results count' : 'all results count'}</span></div>
      <div class="card-body flush">
        <table class="grid"><tbody>${rows}</tbody></table>
      </div>
    </div>`;
}

function constructorCard(world, constructors) {
  if (!constructors.length) return '';
  const rows = constructors.slice(0, 10).map(c => `
    <tr>
      <td class="pos">${c.pos}</td>
      <td>${teamLink(world, c.teamId)}</td>
      <td class="pts">${c.total}</td>
    </tr>`).join('');
  return `
    <div class="card">
      <div class="card-head"><h3>Constructors</h3></div>
      <div class="card-body flush">
        <table class="grid"><tbody>${rows}</tbody></table>
      </div>
    </div>`;
}

/* ---------------------------------------------------------- past race ---- */

function renderRace(world, index) {
  const race = world.races[index];
  if (!race) return `<div class="card"><div class="empty">That race has not been run.</div></div>`;

  return `
    <span class="backlink" data-view="season">← Back to the season</span>
    <div class="card">
      <div class="report">
        <div class="report-kicker">Round ${race.round} · ${race.year}</div>
        <h2>${esc(race.gp)}${race.wet ? '<span class="wet-tag">Wet</span>' : ''}</h2>
        <div class="report-venue">${esc(race.venue)}</div>
        <p class="report-body">${linkifyReport(world, race.writeup, race)}</p>
      </div>
    </div>
    ${resultTable(world, race)}`;
}

/* ------------------------------------------------------------- drivers ---- */

function renderDrivers(world) {
  const q = UI.driverQuery.trim().toLowerCase();
  let list = Object.values(world.drivers);

  if (UI.driverFilter === 'active') list = list.filter(d => d.status === 'active' && d.teamId);
  else if (UI.driverFilter === 'retired') list = list.filter(d => d.status === 'retired');
  else if (UI.driverFilter === 'raced') list = list.filter(d => d.career.starts > 0);
  else list = list.filter(d => d.status !== 'pending' || d.career.starts > 0);

  if (q) list = list.filter(d => d.name.toLowerCase().includes(q));

  /* Searching a famous name that has not arrived yet should say so rather than
   * come back empty — half the interest is knowing who is still to come. */
  let widened = false;
  if (q && !list.length) {
    list = Object.values(world.drivers).filter(d => d.name.toLowerCase().includes(q));
    widened = list.length > 0;
  }

  list.sort((a, b) => b.career.titles - a.career.titles
    || b.career.wins - a.career.wins
    || b.career.points - a.career.points
    || a.name.localeCompare(b.name));

  const rows = list.slice(0, 300).map(d => `
    <tr>
      <td><span class="flag">${esc(d.nat)}</span>${driverLink(world, d.id)}</td>
      <td>${d.teamId ? teamLink(world, d.teamId) : `<span class="tname">${
        d.status === 'retired' ? 'Retired ' + (d.retiredYear || '')
          : d.status === 'pending' ? 'Debuts ' + d.debut
          : d.status === 'resting' ? 'No drive'
          : '—'}</span>`}</td>
      <td class="num">${d.career.starts}</td>
      <td class="num">${d.career.wins || ''}</td>
      <td class="num">${d.career.titles || ''}</td>
    </tr>`).join('');

  const filters = [
    ['active', 'Racing now'], ['raced', 'All who raced'],
    ['retired', 'Retired'], ['all', 'Everyone'],
  ].map(([k, label]) =>
    `<button class="chip ${UI.driverFilter === k ? 'on' : ''}" data-dfilter="${k}">${label}</button>`
  ).join('');

  return `
    <input class="search" id="driver-search" placeholder="Search drivers…"
           value="${esc(UI.driverQuery)}" autocomplete="off">
    <div class="filters">${filters}</div>
    ${widened ? `<div class="empty" style="padding:0 0 12px;text-align:left">
      Nobody currently racing matches “${esc(UI.driverQuery)}” — showing everyone.
    </div>` : ''}
    <div class="card">
      <div class="card-body flush scroll-x">
        <table class="grid">
          <thead><tr>
            <th>Driver</th><th>Car</th>
            <th style="text-align:right">Starts</th>
            <th style="text-align:right">Wins</th>
            <th style="text-align:right">Titles</th>
          </tr></thead>
          <tbody>${rows || '<tr><td colspan="5" class="empty">Nobody matches.</td></tr>'}</tbody>
        </table>
      </div>
    </div>`;
}

function renderDriver(world, id) {
  const d = world.drivers[id];
  if (!d) return `<div class="card"><div class="empty">Unknown driver.</div></div>`;

  const c = d.career;
  const age = world.year - d.born;
  const r = ratings(d, world.year);

  const seasonRows = d.seasons.slice().reverse().map(s => `
    <tr>
      <td class="num">${s.year}</td>
      <td>${teamLink(world, s.teamId)}</td>
      <td class="num">${s.starts}</td>
      <td class="num">${s.wins || ''}</td>
      <td class="num">${s.podiums || ''}</td>
      <td class="pts">${s.points}</td>
      <td class="pos ${s.pos === 1 ? 'pos-1' : ''}">${s.pos || '—'}</td>
    </tr>`).join('');

  const story = d.story.slice().reverse().map(s => `
    <div class="story-item ev-${esc(s.type)}">
      <span class="story-year">${s.year}</span>
      <span class="story-text">${esc(s.text)}</span>
    </div>`).join('');

  /* Ability read-out, shown as it stands this season rather than at peak. */
  const bars = [
    ['Pace', r.pace], ['Racecraft', r.craft], ['Consistency', r.cons],
    ['Wet', r.wet], ['Risk', r.risk],
  ].map(([label, v]) => `
    <div class="stat"><b>${Math.round(v)}</b><span>${label}</span></div>`).join('');

  return `
    <span class="backlink" data-view="season">← Back</span>
    <div class="card">
      <div class="profile-head">
        <div>
          <h2 class="profile-name">${esc(d.name)}${statusPill(d)}</h2>
          <p class="profile-sub">
            ${esc(d.nat)} · born ${d.born}${d.status !== 'retired' ? ` · age ${age}` : ''}
            · debut ${d.debut}
            ${d.teamId ? ` · ${esc(teamName(world, d.teamId))}` : ''}
            ${d.retiredYear ? ` · retired ${d.retiredYear}` : ''}
          </p>
        </div>
      </div>
      <div class="statline">
        <div class="stat ${c.titles ? 'hl' : ''}"><b>${c.titles}</b><span>Titles</span></div>
        <div class="stat"><b>${c.wins}</b><span>Wins</span></div>
        <div class="stat"><b>${c.podiums}</b><span>Podiums</span></div>
        <div class="stat"><b>${c.poles}</b><span>Poles</span></div>
        <div class="stat"><b>${c.starts}</b><span>Starts</span></div>
        <div class="stat"><b>${c.points}</b><span>Points</span></div>
      </div>
    </div>

    ${d.status !== 'retired' ? `
    <div class="card">
      <div class="card-head"><h3>Ability, ${world.year}</h3>
        <span class="meta">adjusted for age and experience</span></div>
      <div class="statline">${bars}</div>
    </div>` : ''}

    <div class="card">
      <div class="card-head"><h3>Seasons</h3></div>
      <div class="card-body flush scroll-x">
        ${seasonRows ? `<table class="grid">
          <thead><tr>
            <th>Year</th><th>Car</th>
            <th style="text-align:right">Starts</th>
            <th style="text-align:right">Wins</th>
            <th style="text-align:right">Pod</th>
            <th style="text-align:right">Pts</th>
            <th style="text-align:right">Pos</th>
          </tr></thead><tbody>${seasonRows}</tbody></table>`
          : '<div class="empty">No completed seasons yet.</div>'}
      </div>
    </div>

    <div class="card">
      <div class="card-head"><h3>Career</h3></div>
      <div class="card-body flush">
        ${story ? `<div class="story">${story}</div>`
          : '<div class="empty">Nothing has happened yet.</div>'}
      </div>
    </div>`;
}

/* --------------------------------------------------------------- teams ---- */

function renderTeams(world) {
  const rows = (world.teams || []).map((t, i) => {
    const drivers = Object.values(world.drivers).filter(d => d.teamId === t.id);
    return `
      <tr>
        <td class="pos">${i + 1}</td>
        <td>${teamLink(world, t.id)}
            <div class="tname">${drivers.map(d => esc(d.name)).join(', ') || '—'}</div></td>
        <td class="num">${Math.round(t.car)}</td>
      </tr>`;
  }).join('');

  return `
    <div class="card">
      <div class="card-head"><h3>${world.year} Constructors</h3>
        <span class="meta">ranked by car performance</span></div>
      <div class="card-body flush scroll-x">
        <table class="grid">
          <thead><tr><th style="width:34px">#</th><th>Team</th>
            <th style="text-align:right">Car</th></tr></thead>
          <tbody>${rows || '<tr><td colspan="3" class="empty">No teams.</td></tr>'}</tbody>
        </table>
      </div>
    </div>`;
}

function renderTeam(world, id) {
  const def = TEAMS.find(t => t.id === id);
  if (!def) return `<div class="card"><div class="empty">Unknown team.</div></div>`;
  const live = (world.teams || []).find(t => t.id === id);

  const drivers = Object.values(world.drivers).filter(d => d.teamId === id);

  /* Everyone who ever drove for them in this timeline. */
  const alumni = Object.values(world.drivers)
    .filter(d => d.seasons.some(s => s.teamId === id))
    .sort((a, b) => b.career.wins - a.career.wins);

  const titles = world.history.filter(h => h.constructorChampion === id).length;
  const driverTitles = world.history.filter(h =>
    h.standings[0] && h.standings[0].teamId === id).length;

  const alumniRows = alumni.slice(0, 40).map(d => {
    const yrs = d.seasons.filter(s => s.teamId === id);
    const span = yrs.length
      ? `${yrs[0].year}${yrs.length > 1 ? `–${yrs[yrs.length - 1].year}` : ''}` : '—';
    const wins = yrs.reduce((a, s) => a + s.wins, 0);
    return `<tr>
      <td>${driverLink(world, d.id)}</td>
      <td class="tname">${span}</td>
      <td class="num">${yrs.reduce((a, s) => a + s.starts, 0)}</td>
      <td class="num">${wins || ''}</td>
    </tr>`;
  }).join('');

  return `
    <span class="backlink" data-view="teams">← Back</span>
    <div class="card">
      <div class="profile-head">
        <div>
          <h2 class="profile-name">${esc(def.name)}</h2>
          <p class="profile-sub">${esc(def.nat)} · ${def.from}–${def.to > 3000 ? 'present' : def.to}
            ${live ? ` · car rating ${Math.round(live.car)}` : ' · not currently competing'}</p>
        </div>
      </div>
      <div class="statline">
        <div class="stat ${titles ? 'hl' : ''}"><b>${titles}</b><span>Constructor titles</span></div>
        <div class="stat"><b>${driverTitles}</b><span>Drivers' titles</span></div>
        <div class="stat"><b>${alumni.length}</b><span>Drivers used</span></div>
      </div>
    </div>

    ${drivers.length ? `
    <div class="card">
      <div class="card-head"><h3>${world.year} line-up</h3></div>
      <div class="card-body flush">
        <table class="grid"><tbody>${drivers.map(d => `
          <tr><td>${driverLink(world, d.id)}</td>
              <td class="tname">${world.year - d.born} years old</td>
              <td class="num">${d.career.wins} wins</td></tr>`).join('')}
        </tbody></table>
      </div>
    </div>` : ''}

    <div class="card">
      <div class="card-head"><h3>Everyone who has driven for them</h3></div>
      <div class="card-body flush scroll-x">
        ${alumniRows ? `<table class="grid">
          <thead><tr><th>Driver</th><th>Years</th>
            <th style="text-align:right">Starts</th>
            <th style="text-align:right">Wins</th></tr></thead>
          <tbody>${alumniRows}</tbody></table>`
          : '<div class="empty">Nobody has completed a season here yet.</div>'}
      </div>
    </div>`;
}

/* ------------------------------------------------------------- history ---- */

function renderHistory(world) {
  if (!world.history.length) {
    return `<div class="card"><div class="empty">
      No seasons are complete yet.<br>The record book fills as the years pass.
    </div></div>`;
  }

  const rows = world.history.slice().reverse().map(h => `
    <tr>
      <td class="num">${h.year}</td>
      <td>${h.champion ? driverLink(world, h.champion) : '—'}</td>
      <td>${h.standings[0] ? teamLink(world, h.standings[0].teamId) : '—'}</td>
      <td class="num">${h.standings[0] ? h.standings[0].wins : ''}</td>
      <td>${h.constructorChampion ? teamLink(world, h.constructorChampion) : '<span class="tname">—</span>'}</td>
    </tr>`).join('');

  /* Roll of honour across the whole timeline. */
  const tally = {};
  for (const h of world.history) {
    if (!h.champion) continue;
    tally[h.champion] = (tally[h.champion] || 0) + 1;
  }
  const honours = Object.entries(tally)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([id, n]) => `
      <tr><td>${driverLink(world, id)}</td><td class="pts">${n}</td></tr>`).join('');

  return `
    <div class="layout">
      <div>
        <div class="card">
          <div class="card-head"><h3>Champions</h3>
            <span class="meta">${world.history.length} seasons</span></div>
          <div class="card-body flush scroll-x">
            <table class="grid">
              <thead><tr><th>Year</th><th>Champion</th><th>Car</th>
                <th style="text-align:right">Wins</th><th>Constructors</th></tr></thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
        </div>
      </div>
      <div>
        <div class="card">
          <div class="card-head"><h3>Roll of honour</h3></div>
          <div class="card-body flush">
            <table class="grid"><tbody>${honours}</tbody></table>
          </div>
        </div>
      </div>
    </div>`;
}

/* ---------------------------------------------------------------- root ---- */

function render(game) {
  const world = game.world;
  renderClock(world);

  const v = UI.view;
  let html;
  if (v.name === 'season') html = renderSeason(world);
  else if (v.name === 'race') html = renderRace(world, v.arg);
  else if (v.name === 'drivers') html = renderDrivers(world);
  else if (v.name === 'driver') html = renderDriver(world, v.arg);
  else if (v.name === 'teams') html = renderTeams(world);
  else if (v.name === 'team') html = renderTeam(world, v.arg);
  else if (v.name === 'history') html = renderHistory(world);
  else html = renderSeason(world);

  el('main').innerHTML = html;

  /* Highlight whichever top-level tab this view belongs to. */
  const tabFor = { season: 'season', race: 'season', drivers: 'drivers',
    driver: 'drivers', teams: 'teams', team: 'teams', history: 'history' };
  const active = tabFor[v.name] || 'season';
  for (const b of document.querySelectorAll('.tab')) {
    b.classList.toggle('is-active', b.dataset.view === active);
  }

  updateControls(game);
}

function updateControls(game) {
  const world = game.world;
  const next = el('btn-next');
  const season = el('btn-season');

  if (world.seasonOver) {
    next.textContent = `Begin ${world.year + 1}`;
    next.disabled = false;
    season.disabled = true;
  } else {
    const c = world.calendar[world.round];
    next.textContent = c ? `Run: ${c.gp.replace(' Grand Prix', '')}` : 'Next race';
    next.disabled = false;
    season.disabled = false;
  }
}

function toast(msg, ms = 2100) {
  const t = el('toast');
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { t.hidden = true; }, ms);
}
