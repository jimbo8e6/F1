// ============================================================
// UI RENDERING SYSTEM
// ============================================================

const UI = {
  root: null,
  raceInterval: null,
  raceSegmentSize: 3,
  raceAutoRunning: false,
  awaitingEventResolution: false,
  currentRaceEvent: null,
  drawnHandCards: [],
  selectedCard: null,
  lastLapData: null,

  init() {
    this.root = document.getElementById('app');
    this.showTitle();
  },

  render(html) {
    this.root.innerHTML = html;
  },

  // ============================================================
  // TITLE SCREEN
  // ============================================================
  showTitle() {
    GameState.screen = 'title';
    const save = SaveManager.getSummary();
    const continueBlock = save ? `
      <div class="save-continue-block">
        <div class="save-info">
          <span class="save-team" style="color:${save.teamColor}">${save.teamEmoji} ${save.teamName}</span>
          <span class="save-meta">Round ${save.round}/${save.totalRounds} · ${save.points} pts · $${save.money.toLocaleString()}</span>
          <span class="save-date">Saved ${save.savedAt}</span>
        </div>
        <div class="save-actions">
          <button class="btn btn-primary btn-large" onclick="UI.loadSave()">CONTINUE SEASON</button>
          <button class="btn btn-ghost save-delete-btn" onclick="UI.confirmDeleteSave()">✕ DELETE</button>
        </div>
      </div>
      <div class="save-divider">— or —</div>
    ` : '';

    this.render(`
      <div class="screen title-screen">
        <div class="title-content">
          <div class="title-badge">SEASON 1</div>
          <h1 class="game-title">PITWALL</h1>
          <p class="game-subtitle">F1 MANAGEMENT · STRATEGY · SURVIVAL</p>
          <div class="title-desc">
            <p>Navigate a full F1 season. Every decision shapes your championship.</p>
            <p>Build your deck. Manage your tyres. Survive the chaos.</p>
          </div>
          <div class="title-tags">
            <span class="tag">🏎 RACING</span>
            <span class="tag">🃏 DECK BUILDING</span>
            <span class="tag">🌧 DYNAMIC EVENTS</span>
            <span class="tag">🏆 SLAY THE GRID</span>
          </div>
          ${continueBlock}
          <button class="btn ${save ? 'btn-secondary' : 'btn-primary btn-large'}" onclick="UI.showTeamSelect()">
            NEW SEASON
          </button>
        </div>
        <div class="title-bg-elements">
          <div class="speed-line"></div>
          <div class="speed-line delay-1"></div>
          <div class="speed-line delay-2"></div>
        </div>
      </div>
    `);
  },

  loadSave() {
    const data = SaveManager.load();
    if (!data || !GameState.loadFromSave(data)) {
      alert('Save data could not be loaded.');
      return;
    }
    this.showSeasonMap();
  },

  confirmDeleteSave() {
    if (confirm('Delete saved season? This cannot be undone.')) {
      SaveManager.deleteSave();
      this.showTitle();
    }
  },

  manualSave() {
    const ok = SaveManager.save();
    const btn = document.getElementById('save-btn');
    if (btn) {
      btn.textContent = ok ? '✓ SAVED' : '✗ FAILED';
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = '💾 SAVE';
        btn.disabled = false;
      }, 1800);
    }
  },

  // ============================================================
  // TEAM SELECT
  // ============================================================
  showTeamSelect() {
    GameState.screen = 'teamselect';
    const teams = PLAYER_TEAMS.map(team => `
      <div class="team-card" onclick="UI.selectTeam('${team.id}')" style="--team-color: ${team.color}">
        <div class="team-logo">${team.logoEmoji}</div>
        <div class="team-info">
          <h3>${team.name}</h3>
          <div class="team-tier tier-${team.tier}">${team.tier.toUpperCase()}</div>
          <p>${team.description}</p>
          <div class="team-stats">
            ${this.renderStatBar('Speed', team.carStats.speed)}
            ${this.renderStatBar('Downforce', team.carStats.downforce)}
            ${this.renderStatBar('Reliability', team.carStats.reliability)}
            ${this.renderStatBar('Pit Speed', team.carStats.pitSpeed)}
          </div>
          <div class="team-drivers">
            ${team.drivers.map(d => `
              <span class="driver-tag">#${d.number} ${d.name}</span>
            `).join('')}
          </div>
          <div class="team-deck-preview">
            <span class="deck-label">STARTING CARDS:</span>
            ${team.startingDeck.map(id => {
              const card = getCard(id);
              return card ? `<span class="mini-card" style="background:${card.color}22;border-color:${card.color}">${card.icon} ${card.name}</span>` : '';
            }).join('')}
          </div>
        </div>
        <div class="team-difficulty">
          <span class="diff-label">DIFFICULTY</span>
          <span class="diff-${team.difficulty}">${team.difficulty.toUpperCase()}</span>
        </div>
      </div>
    `).join('');

    this.render(`
      <div class="screen">
        <div class="screen-header">
          <h2>CHOOSE YOUR TEAM</h2>
          <p>Select a constructor and begin your championship campaign</p>
        </div>
        <div class="team-select-grid">
          ${teams}
        </div>
        <button class="btn btn-ghost" onclick="UI.showTitle()">← BACK</button>
      </div>
    `);
  },

  selectTeam(teamId) {
    SaveManager.deleteSave(); // clear any previous run
    GameState.init(teamId);
    this.showSeasonMap();
  },

  renderStatBar(label, value) {
    return `
      <div class="stat-bar-row">
        <span class="stat-label">${label}</span>
        <div class="stat-bar">
          <div class="stat-fill" style="width:${value}%"></div>
        </div>
        <span class="stat-val">${value}</span>
      </div>
    `;
  },

  // ============================================================
  // SEASON MAP
  // ============================================================
  showSeasonMap() {
    GameState.screen = 'map';
    // Auto-save every time we return to the map (safe checkpoint)
    if (GameState.team) SaveManager.save();
    const cal = GameState.raceCalendar;
    const currentRound = GameState.round;

    const nodes = cal.map((trackId, idx) => {
      const track = TRACKS.find(t => t.id === trackId);
      const status = idx < currentRound ? 'done' :
                     idx === currentRound ? 'available' : 'locked';
      const result = GameState.results[idx];

      return `
        <div class="map-node node-${status}" ${status === 'available' ? `onclick="UI.startWeekend('${trackId}')"` : ''}>
          <div class="node-num">R${idx + 1}</div>
          <div class="node-flag">${track.emoji}</div>
          <div class="node-name">${track.name.replace(' Grand Prix', '')}</div>
          <div class="node-circuit">${track.circuit}</div>
          ${result ? `<div class="node-result pos-${result.position <= 3 ? 'podium' : result.position <= 10 ? 'points' : 'out'}">P${result.position} · ${result.points}pts</div>` : ''}
          ${status === 'available' ? '<div class="node-ready">NEXT RACE →</div>' : ''}
        </div>
        ${idx < cal.length - 1 ? '<div class="map-connector connector-' + (idx < currentRound ? 'done' : 'locked') + '">──</div>' : ''}
      `;
    }).join('');

    const gap = GameState.getChampionshipGap();
    const gapStr = gap > 0 ? `${gap} behind` : gap < 0 ? `${Math.abs(gap)} ahead` : 'Level';

    this.render(`
      <div class="screen">
        <div class="hud">
          <div class="hud-item">
            <span class="hud-label">TEAM</span>
            <span class="hud-val" style="color:${GameState.team.color}">${GameState.team.logoEmoji} ${GameState.team.name}</span>
          </div>
          <div class="hud-item">
            <span class="hud-label">POINTS</span>
            <span class="hud-val accent">${GameState.constructorsPoints} PTS</span>
          </div>
          <div class="hud-item">
            <span class="hud-label">CHAMPIONSHIP GAP</span>
            <span class="hud-val ${gap > 0 ? 'danger' : 'green'}">${gapStr}</span>
          </div>
          <div class="hud-item">
            <span class="hud-label">MONEY</span>
            <span class="hud-val green">$${GameState.money.toLocaleString()}</span>
          </div>
          <div class="hud-item">
            <span class="hud-label">ROUND</span>
            <span class="hud-val">${GameState.round} / ${GameState.totalRounds}</span>
          </div>
        </div>

        <div class="season-map-scroll">
          <div class="season-map">
            ${nodes}
          </div>
        </div>

        <div class="map-bottom-bar">
          <button class="btn btn-ghost" onclick="UI.showDeck()">🃏 VIEW DECK (${GameState.deck.length + GameState.hand.length} cards)</button>
          ${GameState.round > 0 ? `<button class="btn btn-ghost" onclick="UI.showResults()">📊 SEASON RESULTS</button>` : ''}
          <button class="btn btn-ghost save-btn" onclick="UI.manualSave()" id="save-btn">💾 SAVE</button>
        </div>
      </div>
    `);
  },

  // ============================================================
  // DECK VIEW
  // ============================================================
  showDeck() {
    const allCards = [...GameState.deck, ...GameState.hand, ...GameState.discard];
    const cardsByType = {};
    for (const id of allCards) {
      const card = getCard(id);
      if (!card) continue;
      if (!cardsByType[card.type]) cardsByType[card.type] = [];
      cardsByType[card.type].push(card);
    }

    const sections = Object.entries(cardsByType).map(([type, cards]) => `
      <div class="deck-section">
        <h3 class="deck-type-header type-${type}">${type.toUpperCase()} CARDS</h3>
        <div class="card-grid">
          ${cards.map(c => this.renderCardFull(c)).join('')}
        </div>
      </div>
    `).join('');

    this.render(`
      <div class="screen">
        <div class="screen-header">
          <h2>🃏 YOUR DECK</h2>
          <p>${allCards.length} cards total</p>
        </div>
        <div class="deck-view">
          ${sections}
        </div>
        <button class="btn btn-ghost" onclick="UI.showSeasonMap()">← BACK TO MAP</button>
      </div>
    `);
  },

  renderCardFull(card, playable = false, onClick = null) {
    const rarityColors = { common: '#888', uncommon: '#4488ff', rare: '#ff8800', epic: '#aa44ff' };
    const rarityColor = rarityColors[card.rarity] || '#888';
    return `
      <div class="card card-full rarity-${card.rarity}" style="--card-color:${card.color}" ${onClick ? `onclick="${onClick}"` : ''}>
        <div class="card-header">
          <span class="card-icon">${card.icon}</span>
          <span class="card-name">${card.name}</span>
          <span class="card-rarity" style="color:${rarityColor}">${card.rarity}</span>
        </div>
        <div class="card-type-badge type-${card.type}">${card.type}</div>
        <div class="card-desc">${card.description}</div>
        <div class="card-timing">⏰ ${card.timing?.replace(/_/g, ' ').toUpperCase()}</div>
        ${card.flavorText ? `<div class="card-flavor">"${card.flavorText}"</div>` : ''}
        ${playable ? `<button class="btn btn-card-play" onclick="${onClick}">PLAY CARD</button>` : ''}
      </div>
    `;
  },

  renderCardMini(card, selectable = false) {
    return `
      <div class="card-mini ${selectable ? 'selectable' : ''} ${UI.selectedCard === card.id ? 'selected' : ''}"
           style="--card-color:${card.color}"
           onclick="${selectable ? `UI.previewCard('${card.id}')` : ''}">
        <span class="card-mini-icon">${card.icon}</span>
        <span class="card-mini-name">${card.name}</span>
        <span class="card-mini-type type-${card.type}">${card.type[0].toUpperCase()}</span>
      </div>
    `;
  },

  // Show enlarged card preview modal before committing to a selection
  previewCard(cardId) {
    const card = getCard(cardId);
    if (!card) return;

    const isSelected = this.selectedCard === cardId;
    const rarityColors = { common: '#888', uncommon: '#4488ff', rare: '#ff8800', epic: '#aa44ff' };
    const rarityColor = rarityColors[card.rarity] || '#888';
    const timingLabel = (card.timing || '').replace(/_/g, ' ').toUpperCase();

    const timingDescriptions = {
      'any': 'Can be played at any point during the race',
      'pit stop': 'Play when pitting for maximum effect',
      'pit window': 'Play when deciding pit stop strategy',
      'safety car': 'Play when a safety car is deployed',
      'qualifying': 'Play during a qualifying session',
      'race': 'Play during the race',
      'after event': 'Play immediately after an event resolves',
      'between races': 'Applies permanently between race weekends',
    };
    const timingDesc = timingDescriptions[card.timing] || timingLabel;

    // Remove any existing preview
    document.getElementById('card-preview-overlay')?.remove();

    const overlay = document.createElement('div');
    overlay.id = 'card-preview-overlay';
    overlay.className = 'card-preview-overlay';
    overlay.innerHTML = `
      <div class="card-preview-modal" style="--card-color:${card.color}">
        <div class="card-preview-glow"></div>
        <div class="card-preview-header">
          <span class="card-preview-icon">${card.icon}</span>
          <div class="card-preview-titles">
            <div class="card-preview-name">${card.name}</div>
            <div class="card-preview-rarity" style="color:${rarityColor}">${card.rarity.toUpperCase()}</div>
          </div>
          <div class="card-preview-type type-${card.type}">${card.type.toUpperCase()}</div>
        </div>

        <div class="card-preview-divider"></div>

        <div class="card-preview-desc">${card.description}</div>

        <div class="card-preview-timing">
          <span class="timing-icon">⏰</span>
          <div>
            <div class="timing-label">${timingLabel}</div>
            <div class="timing-desc">${timingDesc}</div>
          </div>
        </div>

        ${card.tags?.length ? `
          <div class="card-preview-tags">
            ${card.tags.map(t => `<span class="card-tag">${t}</span>`).join('')}
          </div>
        ` : ''}

        ${card.flavorText ? `
          <div class="card-preview-flavor">"${card.flavorText}"</div>
        ` : ''}

        <div class="card-preview-actions">
          ${isSelected ? `
            <button class="btn btn-ghost" onclick="UI.deselectCard()">DESELECT</button>
          ` : `
            <button class="btn btn-primary" onclick="UI.selectCard('${cardId}')">SELECT CARD</button>
          `}
          <button class="btn btn-ghost" onclick="document.getElementById('card-preview-overlay').remove()">CANCEL</button>
        </div>
      </div>
    `;

    // Close on backdrop click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });

    document.body.appendChild(overlay);
  },

  selectCard(cardId) {
    this.selectedCard = cardId;
    document.getElementById('card-preview-overlay')?.remove();
    // Refresh any hand area on screen
    const handEl = document.getElementById('hand-area');
    if (handEl) handEl.innerHTML = this.renderHandArea();
    // Also refresh event overlay hand if present
    const eventCards = document.querySelector('.event-cards');
    if (eventCards) eventCards.innerHTML = this.renderEventHandCards();
  },

  deselectCard() {
    this.selectedCard = null;
    document.getElementById('card-preview-overlay')?.remove();
    const handEl = document.getElementById('hand-area');
    if (handEl) handEl.innerHTML = this.renderHandArea();
    const eventCards = document.querySelector('.event-cards');
    if (eventCards) eventCards.innerHTML = this.renderEventHandCards();
  },

  renderHandArea(synergyCards = []) {
    const cards = GameState.hand.map(id => getCard(id)).filter(Boolean);
    return cards.map(card => {
      const hasSynergy = synergyCards.includes(card.id);
      const isSelected = this.selectedCard === card.id;
      return `
        <div class="card-mini ${hasSynergy ? 'synergy' : ''} ${isSelected ? 'selected' : ''}"
             style="--card-color:${card.color}"
             onclick="UI.previewCard('${card.id}')">
          <span class="card-mini-icon">${card.icon}</span>
          <span class="card-mini-name">${card.name}</span>
          ${hasSynergy ? '<span class="synergy-badge">SYNERGY</span>' : ''}
          ${isSelected ? '<span class="selected-badge">✓</span>' : ''}
        </div>
      `;
    }).join('');
  },

  renderEventHandCards(synergyCards = []) {
    const hand = GameState.hand.map(id => getCard(id)).filter(Boolean);
    return hand.map(c => `
      <div class="card-mini ${synergyCards.includes(c.id) ? 'synergy' : ''} ${UI.selectedCard === c.id ? 'selected' : ''}"
           style="--card-color:${c.color}"
           onclick="UI.previewCard('${c.id}')">
        ${c.icon} ${c.name}
        ${synergyCards.includes(c.id) ? '<span class="synergy-badge">SYNERGY</span>' : ''}
        ${UI.selectedCard === c.id ? '<span class="selected-badge">✓</span>' : ''}
      </div>
    `).join('');
  },

  // ============================================================
  // WEEKEND START
  // ============================================================
  startWeekend(trackId) {
    GameState.startWeekend(trackId);
    this.showPractice();
  },

  // ============================================================
  // PRACTICE SESSION
  // ============================================================
  showPractice() {
    GameState.screen = 'practice';
    const practice = RaceFlow.startPractice();
    const track = GameState.getCurrentTrack();

    this.render(`
      <div class="screen">
        <div class="weekend-header">
          <div class="weekend-flag">${track.emoji}</div>
          <div class="weekend-info">
            <h2>${track.name}</h2>
            <span class="session-badge">FREE PRACTICE</span>
          </div>
          <div class="weekend-round">ROUND ${GameState.round} / ${GameState.totalRounds}</div>
        </div>

        <div class="practice-layout">
          <div class="practice-info">
            <div class="track-card">
              <h3>CIRCUIT DATA</h3>
              <div class="track-stats">
                <div class="ts-row"><span>Circuit Length</span><span>${track.lapLength} km</span></div>
                <div class="ts-row"><span>Race Laps</span><span>${track.laps}</span></div>
                <div class="ts-row"><span>Tyre Stress</span><span>${renderStressBar(track.characteristics.tyreStress)}</span></div>
                <div class="ts-row"><span>Downforce</span><span>${renderStressBar(track.characteristics.downforce)}</span></div>
                <div class="ts-row"><span>Power Sensitive</span><span>${renderStressBar(track.characteristics.power)}</span></div>
                <div class="ts-row"><span>Rain Chance</span><span>${Math.round(track.weather.rainChance * 100)}%</span></div>
                <div class="ts-row"><span>DRS Zones</span><span>${track.drsZones}</span></div>
              </div>
              <p class="track-desc">${track.description}</p>
            </div>
          </div>

          <div class="practice-controls">
            <h3>SETUP & SIMULATION</h3>
            <div class="setup-group">
              <label>Wing Level <span id="wing-val">5</span>/10</label>
              <input type="range" min="1" max="10" value="5" id="wing-slider"
                     oninput="document.getElementById('wing-val').textContent=this.value; UI.updateSetupPreview()">
              <div class="setup-hint">Low = speed / High = downforce</div>
            </div>
            <div class="setup-group">
              <label>Suspension <span id="susp-val">5</span>/10</label>
              <input type="range" min="1" max="10" value="5" id="susp-slider"
                     oninput="document.getElementById('susp-val').textContent=this.value">
              <div class="setup-hint">Soft = comfort / Stiff = aero efficiency</div>
            </div>
            <div id="setup-preview" class="setup-preview"></div>

            <div class="practice-buttons">
              <button class="btn btn-secondary" onclick="UI.runLongRun('soft')">
                🔴 Long Run — Soft
              </button>
              <button class="btn btn-secondary" onclick="UI.runLongRun('medium')">
                🟡 Long Run — Medium
              </button>
              <button class="btn btn-secondary" onclick="UI.runLongRun('hard')">
                ⚪ Long Run — Hard
              </button>
            </div>
            <div id="long-run-data" class="long-run-data"></div>
          </div>
        </div>

        <div class="practice-footer">
          <button class="btn btn-primary" onclick="UI.completePractice()">
            COMPLETE PRACTICE → QUALIFYING
          </button>
        </div>
      </div>
    `);

    this.updateSetupPreview();
  },

  updateSetupPreview() {
    const wing = parseInt(document.getElementById('wing-slider')?.value || 5);
    const susp = parseInt(document.getElementById('susp-slider')?.value || 5);
    const practice = RaceFlow.practice;
    if (!practice) return;
    const bonuses = practice.applySetup(wing, susp);
    const preview = document.getElementById('setup-preview');
    if (!preview) return;
    preview.innerHTML = `
      <div class="setup-effect">
        <span>Speed: <strong class="${bonuses.speed >= 0 ? 'green' : 'red'}">${bonuses.speed >= 0 ? '+' : ''}${bonuses.speed.toFixed(1)}</strong></span>
        <span>Downforce: <strong class="${bonuses.downforce >= 0 ? 'green' : 'red'}">${bonuses.downforce >= 0 ? '+' : ''}${bonuses.downforce.toFixed(1)}</strong></span>
        <span>Reliability: <strong class="${bonuses.reliability >= 0 ? 'green' : 'red'}">${bonuses.reliability >= 0 ? '+' : ''}${bonuses.reliability}</strong></span>
      </div>
    `;
  },

  runLongRun(compound) {
    const practice = RaceFlow.practice;
    const track = GameState.getCurrentTrack();
    const data = practice.runLongRun(compound);
    const compoundData = TYRE_COMPOUNDS[compound];

    const rows = data.map(d => `
      <tr class="${d.onCliff ? 'cliff-row' : ''}">
        <td>L${d.lap}</td>
        <td>${d.wear}%</td>
        <td><span class="perf-bar" style="width:${d.performance}%">${d.performance}%</span></td>
        <td>${d.temp}°C</td>
        <td>${d.onCliff ? '⚠️ CLIFF' : '✓'}</td>
      </tr>
    `).join('');

    document.getElementById('long-run-data').innerHTML = `
      <div class="long-run-table">
        <div class="lr-header">
          <span class="tyre-badge" style="background:${compoundData.color};color:#000">${compoundData.name} Compound</span>
          <span class="lr-subtitle">15 lap simulation on ${track.name}</span>
        </div>
        <table class="data-table">
          <thead><tr><th>Lap</th><th>Wear</th><th>Performance</th><th>Temp</th><th>Status</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <div class="lr-summary">
          Cliff point at: ~${compoundData.cliffPoint}% wear · Estimated ${Math.floor(compoundData.cliffPoint / compoundData.wearRate)} laps before cliff on this track
        </div>
      </div>
    `;
  },

  completePractice() {
    const practice = RaceFlow.practice;
    const wing = parseInt(document.getElementById('wing-slider')?.value || 5);
    const susp = parseInt(document.getElementById('susp-slider')?.value || 5);
    practice.applySetup(wing, susp);
    const bonuses = practice.complete();
    GameState.weekendState.practiceBonus = bonuses;
    this.showQualifying();
  },

  // ============================================================
  // QUALIFYING
  // ============================================================
  showQualifying() {
    GameState.screen = 'qualifying';
    RaceFlow.startQualifying();
    const track = GameState.getCurrentTrack();
    const driver = GameState.team.drivers[0];

    this.renderQualifyingPhase('q1', driver, track);
  },

  renderQualifyingPhase(phase, driver, track) {
    const phaseLabel = { q1: 'Q1 (18 cars → Top 15)', q2: 'Q2 (15 cars → Top 10)', q3: 'Q3 (Pole Position Battle)' };
    const phases = ['q1', 'q2', 'q3'];
    const phaseIdx = phases.indexOf(phase);

    this.render(`
      <div class="screen">
        <div class="weekend-header">
          <div class="weekend-flag">${track.emoji}</div>
          <div class="weekend-info">
            <h2>${track.name}</h2>
            <span class="session-badge session-quali">QUALIFYING</span>
          </div>
          <div class="phase-indicator">
            ${phases.map((p, i) => `<span class="phase-dot ${i < phaseIdx ? 'done' : i === phaseIdx ? 'active' : ''}">${p.toUpperCase()}</span>`).join('')}
          </div>
        </div>

        <div class="quali-layout">
          <div class="quali-info">
            <h3>${phaseLabel[phase]}</h3>
            <div class="driver-card">
              <div class="dc-name">${driver.name} #${driver.number}</div>
              <div class="dc-stats">
                <span>Qualifying: <strong>${driver.qualifying}</strong></span>
                <span>Rain: <strong>${driver.rain}</strong></span>
                <span>Consistency: <strong>${driver.consistency}</strong></span>
              </div>
            </div>
            <div class="tyre-selector">
              <h4>TYRE CHOICE</h4>
              <div class="tyre-options">
                ${['soft','medium','hard'].map(c => {
                  const td = TYRE_COMPOUNDS[c];
                  return `
                    <div class="tyre-option ${c === 'soft' ? 'selected' : ''}" onclick="UI.selectQualiTyre('${c}', this)" id="qt-${c}">
                      <div class="tyre-dot" style="background:${td.color}"></div>
                      <span>${td.name}</span>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

            <div class="hand-label">HAND — play a card to boost your lap:</div>
            <div class="hand-area" id="hand-area">
              ${this.renderHandArea()}
            </div>
          </div>

          <div class="quali-action">
            <div class="quali-attempt-info">
              <p>Track temperature: <strong>${Math.round(track.weather.baseTemp - 8)}°C</strong></p>
              <p>Weather: <strong>${track.weather.rainChance > 0.2 ? '⛈ Possible Rain' : '☀ Clear'}</strong></p>
              ${GameState.strategyVision ? '<p class="strategy-vision">📊 Strategy Vision: rivals on soft tyres pushing hard in sector 2</p>' : ''}
            </div>
            <button class="btn btn-primary btn-large" id="go-quali-btn" onclick="UI.executeQualiLap('${phase}')">
              🏎 SET FLYING LAP
            </button>
          </div>
        </div>

        <div id="quali-results" class="quali-results"></div>
      </div>
    `);
  },

  selectQualiTyre(compound, el) {
    document.querySelectorAll('.tyre-option').forEach(e => e.classList.remove('selected'));
    el.classList.add('selected');
    RaceFlow.qualifying.tyreUsed = compound;
  },

  executeQualiLap(phase) {
    const qualifying = RaceFlow.qualifying;
    const driver = GameState.team.drivers[0];
    const compound = qualifying.tyreUsed || 'soft';
    const track = GameState.getCurrentTrack();

    // Apply selected card if any
    if (this.selectedCard) {
      const card = getCard(this.selectedCard);
      if (card?.effect === 'quali_boost') {
        qualifying.qualiBonusFromCards += card.value * 0.15;
        GameState.playCard(this.selectedCard);
        this.selectedCard = null;
      }
    }

    document.getElementById('go-quali-btn').disabled = true;
    document.getElementById('go-quali-btn').textContent = '⏱ TIMING LAP...';

    setTimeout(() => {
      const result = qualifying.runPhase(phase, driver, compound, null);

      if (result.awaitingEvent) {
        this.showQualiEvent(result.event, phase, driver, compound, result.aiField, result.cutoff);
      } else {
        this.showQualiResult(result, phase);
      }
    }, 1200);
  },

  showQualiEvent(event, phase, driver, compound, aiField, cutoff) {
    const resultsEl = document.getElementById('quali-results');
    if (!resultsEl) return;

    const baseTime = RaceFlow.qualifying.calculatePlayerTime(driver, compound, { trackEvolution: 0.1 });

    resultsEl.innerHTML = `
      <div class="event-card event-quali">
        <div class="event-header">
          <span class="event-icon">${event.icon}</span>
          <h3>${event.name}</h3>
        </div>
        <p class="event-desc">${event.description}</p>
        <div class="event-choices">
          ${event.choices.map(choice => `
            <button class="btn btn-choice" onclick="UI.resolveQualiEvent('${event.id}', '${choice.id}', '${phase}', '${compound}', ${JSON.stringify(aiField).replace(/"/g,'&quot;')}, ${cutoff}, ${baseTime})">
              <strong>${choice.label}</strong>
              <span>${choice.description}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;
  },

  resolveQualiEvent(eventId, choiceId, phase, compound, aiField, cutoff, baseTime) {
    const qualifying = RaceFlow.qualifying;
    const driver = GameState.team.drivers[0];
    const event = QUALIFYING_EVENTS.find(e => e.id === eventId);
    const choice = event?.choices.find(c => c.id === choiceId);
    if (!event || !choice) return;

    const result = qualifying.applyEventChoice(phase, driver, compound, aiField, cutoff, baseTime, choice);
    this.showQualiResult(result, phase);
  },

  showQualiResult(result, phase) {
    const resultsEl = document.getElementById('quali-results');
    if (!resultsEl) return;

    const qualifying = RaceFlow.qualifying;
    const phases = ['q1', 'q2', 'q3'];
    const nextPhase = phases[phases.indexOf(phase) + 1];

    const posClass = result.playerPos <= 3 ? 'pos-podium' : result.playerPos <= 10 ? 'pos-points' : '';
    const top5 = result.times?.slice(0, 5) || [];
    const playerEntry = result.times?.find(t => t.isPlayer);

    const leaderboard = `
      <div class="quali-leaderboard">
        ${top5.map((t, i) => `
          <div class="ql-row ${t.isPlayer ? 'player-row' : ''}">
            <span class="ql-pos">P${i + 1}</span>
            <span class="ql-driver" style="color:${t.color}">${t.driver}</span>
            <span class="ql-time">${t.str}</span>
          </div>
        `).join('')}
        ${playerEntry && result.playerPos > 5 ? `
          <div class="ql-row ql-dots">...</div>
          <div class="ql-row player-row">
            <span class="ql-pos ${posClass}">P${result.playerPos}</span>
            <span class="ql-driver" style="color:${GameState.team.color}">${playerEntry.driver}</span>
            <span class="ql-time">${playerEntry.str}</span>
          </div>
        ` : ''}
      </div>
    `;

    if (result.eliminated) {
      const gridPos = result.playerPos;
      GameState.weekendState.gridPosition = gridPos;
      resultsEl.innerHTML = `
        <div class="event-card event-danger">
          <h3>❌ ELIMINATED — P${result.playerPos}</h3>
          <p>You will start the race from position ${gridPos}.</p>
          ${leaderboard}
          <button class="btn btn-primary" onclick="UI.showPreRace(${gridPos})">CONTINUE TO RACE →</button>
        </div>
      `;
    } else if (!nextPhase) {
      // Q3 complete - pole/grid set
      GameState.weekendState.gridPosition = result.playerPos;
      qualifying.gridPosition = result.playerPos;
      resultsEl.innerHTML = `
        <div class="event-card event-success">
          <h3>🏁 Q3 COMPLETE — P${result.playerPos} on the grid!</h3>
          ${result.playerPos === 1 ? '<div class="pole-banner">POLE POSITION! 🎉</div>' : ''}
          ${leaderboard}
          <button class="btn btn-primary" onclick="UI.showPreRace(${result.playerPos})">TO THE GRID →</button>
        </div>
      `;
    } else {
      resultsEl.innerHTML = `
        <div class="event-card event-success">
          <h3>✅ ${phase.toUpperCase()} — P${result.playerPos} — ADVANCES</h3>
          ${leaderboard}
          <button class="btn btn-primary" onclick="UI.continueQualifying('${nextPhase}')">
            CONTINUE TO ${nextPhase.toUpperCase()} →
          </button>
        </div>
      `;
    }
  },

  continueQualifying(phase) {
    const track = GameState.getCurrentTrack();
    const driver = GameState.team.drivers[0];
    this.renderQualifyingPhase(phase, driver, track);
  },

  // ============================================================
  // PRE-RACE
  // ============================================================
  showPreRace(gridPosition) {
    const track = GameState.getCurrentTrack();
    const tyre = TYRE_COMPOUNDS;
    const strategies = predictStrategy(track, GameState.carStats, track.weather.rainChance);

    this.render(`
      <div class="screen">
        <div class="weekend-header">
          <div class="weekend-flag">${track.emoji}</div>
          <div class="weekend-info">
            <h2>${track.name}</h2>
            <span class="session-badge session-race">RACE STRATEGY</span>
          </div>
          <div class="grid-position">
            <span class="grid-pos-num">P${gridPosition}</span>
            <span>GRID</span>
          </div>
        </div>

        <div class="prerace-layout">
          <div class="strategy-section">
            <h3>STARTING TYRE</h3>
            <div class="tyre-options">
              ${['soft','medium','hard'].map(c => {
                const td = tyre[c];
                const reqText = c === 'soft' && gridPosition <= 10 ? '⚠ Required (top 10 start on Q2 tyre)' : '';
                return `
                  <div class="tyre-option-large ${c === 'medium' ? 'selected' : ''}" onclick="UI.selectStartingTyre('${c}', this)">
                    <div class="tyre-badge-large" style="background:${td.color};color:#000">${td.name}</div>
                    <div>Wear rate: ${td.wearRate.toFixed(1)}/lap</div>
                    <div>Cliff at: ~${td.cliffPoint}% wear</div>
                    ${reqText ? `<div class="tyre-req">${reqText}</div>` : ''}
                  </div>
                `;
              }).join('')}
            </div>

            <h3>STRATEGY OPTIONS</h3>
            <div class="strategies-list">
              ${strategies.map((s, i) => `
                <div class="strategy-option ${i === 0 ? 'selected' : ''}" onclick="UI.selectStrategy(${i}, this)">
                  <div class="strat-name">${s.name}</div>
                  <div class="strat-details">
                    <span class="risk-${s.risk}">Risk: ${s.risk}</span>
                    <span>Stops: ${s.stops}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="race-conditions">
            <h3>RACE CONDITIONS</h3>
            <div class="conditions-card">
              <div class="cond-row"><span>🌡 Temperature</span><span>${Math.round(track.weather.baseTemp)}°C</span></div>
              <div class="cond-row"><span>🌧 Rain Risk</span><span>${Math.round(track.weather.rainChance * 100)}%</span></div>
              <div class="cond-row"><span>🏎 DRS Zones</span><span>${track.drsZones}</span></div>
              <div class="cond-row"><span>📍 Grid Position</span><span>P${gridPosition}</span></div>
              <div class="cond-row"><span>🔄 Laps</span><span>${track.laps}</span></div>
            </div>
            <div class="hand-preview">
              <h4>YOUR HAND</h4>
              ${GameState.hand.map(id => {
                const c = getCard(id);
                return c ? `<div class="hand-card-preview" style="border-color:${c.color}">${c.icon} ${c.name}</div>` : '';
              }).join('')}
            </div>
          </div>
        </div>

        <div class="prerace-footer">
          <button class="btn btn-primary btn-large" onclick="UI.startRace(${gridPosition})">
            🏁 LIGHTS OUT — START RACE
          </button>
        </div>
      </div>
    `);
  },

  selectStartingTyre(compound, el) {
    document.querySelectorAll('.tyre-option-large').forEach(e => e.classList.remove('selected'));
    el.classList.add('selected');
    UI._startingTyre = compound;
  },

  selectStrategy(idx, el) {
    document.querySelectorAll('.strategy-option').forEach(e => e.classList.remove('selected'));
    el.classList.add('selected');
    UI._strategyIdx = idx;
  },

  // ============================================================
  // RACE SCREEN
  // ============================================================
  startRace(gridPosition) {
    const startingTyre = this.selectedCard || this._startingTyre || 'medium';
    GameState.screen = 'race';
    const race = RaceFlow.startRace(gridPosition);

    // Set starting tyre
    const startTyre = UI._startingTyre || 'medium';
    race.playerTyres[0] = new TyreState(startTyre);

    this.renderRaceScreen(race);
    this.awaitingEventResolution = false;
    this.raceAutoRunning = false;
  },

  renderRaceScreen(race) {
    const track = race.track;
    const tyre = race.playerTyres[0];
    const pos = race.getPlayerPosition();
    const lapsLeft = race.laps - race.currentLap;
    const wearCat = tyre.getWearCategory();

    this.render(`
      <div class="screen race-screen">
        <div class="race-header">
          <div class="race-flag">${track.emoji}</div>
          <div class="race-title">
            <span>${track.name}</span>
            <span class="race-laps">LAP ${race.currentLap} / ${race.laps}</span>
          </div>
          <div class="race-pos-display">
            <span class="race-pos ${pos <= 3 ? 'podium' : pos <= 10 ? 'points' : ''}">P${pos}</span>
          </div>
        </div>

        <div class="race-main">
          <div class="race-telemetry">
            <div class="telemetry-grid">
              <div class="telem-item">
                <span class="telem-label">TYRE</span>
                <span class="telem-val">
                  <span class="tyre-indicator" style="background:${TYRE_COMPOUNDS[tyre.compound].color}"></span>
                  ${TYRE_COMPOUNDS[tyre.compound].name}
                </span>
              </div>
              <div class="telem-item">
                <span class="telem-label">WEAR</span>
                <span class="telem-val" style="color:${wearCat.color}">${tyre.getWearDisplay()}% ${wearCat.label}</span>
              </div>
              <div class="telem-item">
                <span class="telem-label">TYRE TEMP</span>
                <span class="telem-val">${Math.round(tyre.temp)}°C</span>
              </div>
              <div class="telem-item">
                <span class="telem-label">LAPS LEFT</span>
                <span class="telem-val">${lapsLeft}</span>
              </div>
              <div class="telem-item">
                <span class="telem-label">CAR DAMAGE</span>
                <span class="telem-val ${race.carDamage > 50 ? 'danger' : ''}">${race.carDamage}%</span>
              </div>
              <div class="telem-item">
                <span class="telem-label">RAIN</span>
                <span class="telem-val ${race.rainLevel > 0.3 ? 'warning' : ''}">${race.rainLevel > 0 ? Math.round(race.rainLevel * 100) + '%' : 'DRY'}</span>
              </div>
            </div>

            <div class="tyre-wear-visual">
              <div class="wear-bar-container">
                <div class="wear-bar-fill" style="width:${100 - tyre.wear}%; background:${wearCat.color}"></div>
                <div class="cliff-marker" style="left:${100 - tyre.data.cliffPoint}%"></div>
              </div>
              <div class="wear-bar-labels">
                <span>0%</span>
                <span class="cliff-label">CLIFF ${tyre.data.cliffPoint}%</span>
                <span>100%</span>
              </div>
            </div>

            ${tyre.isOnCliff() ? '<div class="cliff-warning">⚠️ TYRES ON CLIFF! Consider pitting NOW</div>' : ''}
            ${race.safetyCarActive ? '<div class="sc-banner">🚗 SAFETY CAR DEPLOYED</div>' : ''}
          </div>

          <div class="race-standings-panel">
            <h4>TOP 10</h4>
            <div class="standings-list" id="standings-list">
              ${this.renderStandingsRows(race)}
            </div>
          </div>
        </div>

        <div class="race-lap-log" id="lap-log">
          <div class="log-entry">Race started from P${pos}. Good luck.</div>
        </div>

        <div class="race-controls">
          <div class="hand-area-race" id="hand-area">
            ${this.renderHandArea()}
          </div>
          <div class="race-action-buttons">
            <button class="btn btn-secondary" onclick="UI.pitStop()" id="pit-btn">
              🔧 PIT STOP
            </button>
            <button class="btn btn-primary" id="advance-btn" onclick="UI.advanceRace()">
              ▶ RUN ${this.raceSegmentSize} LAPS
            </button>
            <button class="btn btn-ghost" id="play-card-btn" onclick="UI.playSelectedCard()">
              🃏 PLAY CARD
            </button>
          </div>
        </div>

        <div id="event-overlay" class="event-overlay hidden"></div>
      </div>
    `);
  },

  renderStandingsRows(race) {
    const top = race.getTopN(10);
    const playerEntry = race.standings.find(s => s.isPlayer);
    const playerInTop = top.some(s => s.isPlayer);

    let rows = top.map(s => `
      <div class="standing-row ${s.isPlayer ? 'player-standing' : ''}">
        <span class="sr-pos ${s.position <= 3 ? 'pos-' + s.position : ''}">${s.position}</span>
        <span class="sr-driver" style="color:${s.color}">${s.driver}</span>
        <span class="sr-gap">${s.gapToLeader > 0 ? '+' + s.gapToLeader.toFixed(1) + 's' : 'LEADER'}</span>
        <span class="sr-tyre" style="color:${TYRE_COMPOUNDS[s.tyreCompound]?.color || '#fff'}">${TYRE_COMPOUNDS[s.tyreCompound]?.abbr || '?'}</span>
      </div>
    `).join('');

    if (!playerInTop && playerEntry) {
      rows += `<div class="standing-dots">·  ·  ·</div>`;
      rows += `
        <div class="standing-row player-standing">
          <span class="sr-pos">${playerEntry.position}</span>
          <span class="sr-driver" style="color:${playerEntry.color}">${playerEntry.driver}</span>
          <span class="sr-gap">${playerEntry.gapToLeader?.toFixed(1) || '?'}s</span>
          <span class="sr-tyre" style="color:${TYRE_COMPOUNDS[race.playerTyres[0].compound]?.color}">${TYRE_COMPOUNDS[race.playerTyres[0].compound]?.abbr}</span>
        </div>
      `;
    }
    return rows;
  },

  advanceRace() {
    const race = RaceFlow.race;
    if (!race || this.awaitingEventResolution) return;
    if (race.currentLap >= race.laps) {
      this.endRace(race, false);
      return;
    }

    // Check for event before running laps
    const eventId = race.checkForEvent();

    if (eventId) {
      const event = RACE_EVENTS.find(e => e.id === eventId);
      if (event) {
        // Run 1 lap to reach event, then show it
        const lapData = race.simulateSegment(1);
        this.updateRaceDisplay(race, lapData);
        this.showRaceEvent(event, race);
        return;
      }
    }

    const lapData = race.simulateSegment(this.raceSegmentSize);
    this.updateRaceDisplay(race, lapData);

    if (race.currentLap >= race.laps) {
      setTimeout(() => this.endRace(race, false), 800);
    }
  },

  updateRaceDisplay(race, lapData) {
    const tyre = race.playerTyres[0];
    const pos = race.getPlayerPosition();
    const wearCat = tyre.getWearCategory();
    const lapsLeft = race.laps - race.currentLap;
    const lastLap = lapData[lapData.length - 1];

    // Update header
    const lapsEl = document.querySelector('.race-laps');
    if (lapsEl) lapsEl.textContent = `LAP ${race.currentLap} / ${race.laps}`;

    const posEl = document.querySelector('.race-pos');
    if (posEl) {
      posEl.textContent = `P${pos}`;
      posEl.className = `race-pos ${pos <= 3 ? 'podium' : pos <= 10 ? 'points' : ''}`;
    }

    // Update telemetry
    const telemItems = document.querySelectorAll('.telem-val');
    if (telemItems.length >= 6) {
      telemItems[0].innerHTML = `<span class="tyre-indicator" style="background:${TYRE_COMPOUNDS[tyre.compound].color}"></span>${TYRE_COMPOUNDS[tyre.compound].name}`;
      telemItems[1].textContent = `${tyre.getWearDisplay()}% ${wearCat.label}`;
      telemItems[1].style.color = wearCat.color;
      telemItems[2].textContent = `${Math.round(tyre.temp)}°C`;
      telemItems[3].textContent = lapsLeft;
      telemItems[4].textContent = `${race.carDamage}%`;
      telemItems[4].className = `telem-val ${race.carDamage > 50 ? 'danger' : ''}`;
      telemItems[5].textContent = race.rainLevel > 0 ? `${Math.round(race.rainLevel * 100)}%` : 'DRY';
      telemItems[5].className = `telem-val ${race.rainLevel > 0.3 ? 'warning' : ''}`;
    }

    // Wear bar
    const wearFill = document.querySelector('.wear-bar-fill');
    if (wearFill) {
      wearFill.style.width = `${Math.max(0, 100 - tyre.wear)}%`;
      wearFill.style.background = wearCat.color;
    }

    // Cliff warning
    const existingWarning = document.querySelector('.cliff-warning');
    if (tyre.isOnCliff() && !existingWarning) {
      const telemetry = document.querySelector('.race-telemetry');
      if (telemetry) {
        const w = document.createElement('div');
        w.className = 'cliff-warning';
        w.textContent = '⚠️ TYRES ON CLIFF! Consider pitting NOW';
        telemetry.appendChild(w);
      }
    } else if (!tyre.isOnCliff() && existingWarning) {
      existingWarning.remove();
    }

    // Safety car banner
    const existingSC = document.querySelector('.sc-banner');
    if (race.safetyCarActive && !existingSC) {
      const telemetry = document.querySelector('.race-telemetry');
      if (telemetry) {
        const sc = document.createElement('div');
        sc.className = 'sc-banner';
        sc.textContent = '🚗 SAFETY CAR DEPLOYED';
        telemetry.appendChild(sc);
      }
    } else if (!race.safetyCarActive && existingSC) {
      existingSC.remove();
    }

    // Standings
    const standingsEl = document.getElementById('standings-list');
    if (standingsEl) standingsEl.innerHTML = this.renderStandingsRows(race);

    // Lap log
    const logEl = document.getElementById('lap-log');
    if (logEl) {
      const entries = lapData.map(d => {
        const cliffNote = d.isOnCliff ? ' ⚠️ CLIFF' : '';
        const rainNote = d.rainLevel > 0.3 ? ' 🌧' : '';
        const scNote = d.safetyCarActive ? ' 🚗SC' : '';
        return `<div class="log-entry">L${d.lap}: P${d.position} | ${formatLapTime(d.lapTime)} | Wear ${Math.round(d.tyreWear)}%${cliffNote}${rainNote}${scNote}</div>`;
      }).join('');
      logEl.innerHTML = entries + logEl.innerHTML;
      // Keep only last 20 entries
      const allEntries = logEl.querySelectorAll('.log-entry');
      if (allEntries.length > 20) {
        for (let i = 20; i < allEntries.length; i++) allEntries[i].remove();
      }
    }

    // Update hand display
    const handEl = document.getElementById('hand-area');
    if (handEl) handEl.innerHTML = this.renderHandArea();
  },

  pitStop() {
    const race = RaceFlow.race;
    if (!race || race.currentLap >= race.laps) return;

    const currentCompound = race.playerTyres[0].compound;
    const track = race.track;

    // Show tyre selection dialog
    const overlay = document.getElementById('event-overlay');
    if (!overlay) return;

    overlay.classList.remove('hidden');
    overlay.innerHTML = `
      <div class="event-card">
        <h3>🔧 PIT STOP</h3>
        <p>Choose your new tyre compound:</p>
        <div class="pit-tyre-options">
          ${['soft','medium','hard','inter','wet'].map(c => {
            const td = TYRE_COMPOUNDS[c];
            const suited = (c === 'inter' && track.weather.rainChance > 0.2) || (c === 'wet' && race.rainLevel > 0.5);
            return `
              <div class="tyre-option-pit ${c === currentCompound ? '' : ''} ${suited ? 'suited' : ''}"
                   onclick="UI.confirmPit('${c}')">
                <div class="tyre-dot-large" style="background:${td.color}"></div>
                <span>${td.name}</span>
                <span class="tyre-wear-rate">${td.wearRate}/lap</span>
                ${suited ? '<span class="suited-badge">CONDITIONS</span>' : ''}
              </div>
            `;
          }).join('')}
        </div>
        <button class="btn btn-ghost" onclick="document.getElementById('event-overlay').classList.add('hidden')">
          CANCEL — STAY OUT
        </button>
      </div>
    `;
  },

  confirmPit(compound) {
    const race = RaceFlow.race;
    const pitResult = race.pit(0, compound);

    const overlay = document.getElementById('event-overlay');
    if (overlay) overlay.classList.add('hidden');

    const logEl = document.getElementById('lap-log');
    if (logEl) {
      const entry = document.createElement('div');
      entry.className = 'log-entry pit-entry';
      entry.textContent = `🔧 PIT STOP L${pitResult.lap}: ${TYRE_COMPOUNDS[pitResult.oldCompound].name} → ${TYRE_COMPOUNDS[compound].name} (${pitResult.pitTime}s)`;
      logEl.prepend(entry);
    }

    // Update display
    this.updateRaceDisplay(race, []);
  },

  showRaceEvent(event, race) {
    this.awaitingEventResolution = true;
    const overlay = document.getElementById('event-overlay');
    if (!overlay) return;

    const availableCards = RaceFlow.getAvailableCardsForEvent(event);
    const hand = GameState.hand.map(id => getCard(id)).filter(Boolean);

    overlay.classList.remove('hidden');
    overlay.innerHTML = `
      <div class="event-card event-${event.severity}">
        <div class="event-header">
          <span class="event-icon">${event.icon}</span>
          <h3 class="event-title">${event.name}</h3>
          <span class="event-lap">LAP ${race.currentLap}</span>
        </div>
        <p class="event-desc">${event.description}</p>

        ${hand.length > 0 ? `
          <div class="event-hand">
            <div class="event-hand-label">YOUR HAND — select a card to play with this choice:</div>
            <div class="event-cards">
              ${hand.map(c => `
                <div class="card-mini ${availableCards.includes(c.id) ? 'synergy' : ''} ${UI.selectedCard === c.id ? 'selected' : ''}"
                     style="--card-color:${c.color}"
                     onclick="UI.previewCard('${c.id}')">
                  ${c.icon} ${c.name}
                  ${availableCards.includes(c.id) ? '<span class="synergy-badge">SYNERGY</span>' : ''}
                  ${UI.selectedCard === c.id ? '<span class="selected-badge">✓</span>' : ''}
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <div class="event-choices">
          ${event.choices.map(choice => `
            <button class="btn btn-choice" onclick="UI.resolveRaceEvent('${event.id}', '${choice.id}')">
              <div class="choice-label">${choice.label}</div>
              <div class="choice-desc">${choice.description}</div>
              ${choice.cardSynergy?.length ? `
                <div class="choice-synergy">🃏 Synergy with: ${choice.cardSynergy.map(id => getCard(id)?.name || id).join(', ')}</div>
              ` : ''}
            </button>
          `).join('')}
        </div>
      </div>
    `;

    UI.currentRaceEvent = event;
  },

  resolveRaceEvent(eventId, choiceId) {
    const race = RaceFlow.race;
    const event = RACE_EVENTS.find(e => e.id === eventId);
    const choice = event?.choices.find(c => c.id === choiceId);
    if (!event || !choice) return;

    const cardPlayed = this.selectedCard;
    if (cardPlayed) {
      GameState.playCard(cardPlayed);
      this.selectedCard = null;
    }

    const result = race.resolveEventChoice(event, choice, cardPlayed);

    const overlay = document.getElementById('event-overlay');
    if (!overlay) return;

    const effects = result.effects.join('<br>');
    const dnf = result.dnf;

    overlay.innerHTML = `
      <div class="event-card event-result">
        <h3>${dnf ? '💀 DNF' : '✅ RESOLVED'}: ${event.name}</h3>
        <div class="event-effects">
          ${effects || 'No immediate effect.'}
        </div>
        ${result.riskTriggered !== undefined && !result.riskTriggered ? '<div class="lucky-banner">🍀 Risk avoided!</div>' : ''}
        ${cardPlayed ? `<div class="card-played-badge">🃏 ${getCard(cardPlayed)?.name} played</div>` : ''}
        <button class="btn btn-primary" onclick="UI.closeEventAndContinue(${dnf})">
          ${dnf ? 'ACCEPT DNF' : 'CONTINUE RACE'}
        </button>
      </div>
    `;
  },

  closeEventAndContinue(dnf) {
    const overlay = document.getElementById('event-overlay');
    if (overlay) overlay.classList.add('hidden');
    this.awaitingEventResolution = false;
    this.currentRaceEvent = null;

    const race = RaceFlow.race;
    if (dnf) {
      this.endRace(race, true);
      return;
    }

    this.updateRaceDisplay(race, []);
  },

  playSelectedCard() {
    const race = RaceFlow.race;
    if (!race || !this.selectedCard) return;

    const cardId = this.selectedCard;
    const card = getCard(cardId);
    if (!card) return;

    const result = RaceFlow.playCardEffect(cardId, race);
    this.selectedCard = null;

    if (result) {
      const logEl = document.getElementById('lap-log');
      if (logEl) {
        const entry = document.createElement('div');
        entry.className = 'log-entry card-entry';
        entry.innerHTML = `🃏 <strong>${card.name}</strong>: ${result.effects.join(', ')}`;
        logEl.prepend(entry);
      }
    }

    this.updateRaceDisplay(race, []);
  },

  endRace(race, dnf) {
    const result = race.getRaceResult(dnf);
    GameState.recordRaceResult(result.position, result.points, dnf);

    const track = GameState.getCurrentTrack();
    const moneyEarned = track.baseReward.money + (result.position <= 3 ? 5000 : 0) + (result.points * 500);
    GameState.addMoney(moneyEarned);

    this.showRaceResult(result, moneyEarned, track);
  },

  showRaceResult(result, moneyEarned, track) {
    const podium = result.position <= 3;
    const points = result.points > 0;
    const posLabel = result.position === 1 ? '🏆 VICTORY!' :
                     result.position === 2 ? '🥈 P2 FINISH' :
                     result.position === 3 ? '🥉 P3 FINISH' :
                     result.dnf ? '💀 DNF' : `P${result.position}`;

    const top5 = result.standings.slice(0, 5);

    this.render(`
      <div class="screen result-screen ${podium ? 'podium-result' : ''}">
        <div class="result-hero">
          <div class="result-position">${posLabel}</div>
          <div class="result-track">${track.emoji} ${track.name}</div>
          <div class="result-stats">
            <div class="res-stat"><span>POINTS</span><strong>+${result.points}</strong></div>
            <div class="res-stat"><span>MONEY EARNED</span><strong>+$${moneyEarned.toLocaleString()}</strong></div>
            <div class="res-stat"><span>PIT STOPS</span><strong>${result.pitStops}</strong></div>
            ${result.fastestLap ? '<div class="res-stat fl-bonus"><span>FASTEST LAP</span><strong>+1 pt 💜</strong></div>' : ''}
          </div>
        </div>

        <div class="result-standings">
          <h3>RACE RESULT — TOP 5</h3>
          ${top5.map(s => `
            <div class="result-row ${s.isPlayer ? 'player-result' : ''}">
              <span class="rr-pos">${s.position}</span>
              <span class="rr-driver" style="color:${s.color}">${s.driver}</span>
              <span class="rr-team">${s.team}</span>
              <span class="rr-pts">${POINTS_SYSTEM[s.position - 1] || 0} pts</span>
            </div>
          `).join('')}
        </div>

        <div class="championship-summary">
          <h3>CHAMPIONSHIP</h3>
          <div class="champ-stats">
            <span>Your Points: <strong class="accent">${GameState.constructorsPoints}</strong></span>
            <span>Rival: <strong>${GameState.rivalPoints}</strong></span>
            <span>Gap: <strong class="${GameState.getChampionshipGap() > 0 ? 'danger' : 'green'}">${Math.abs(GameState.getChampionshipGap())} pts</strong></span>
          </div>
        </div>

        ${!GameState.isSeasonOver() ? `
          <button class="btn btn-primary" onclick="UI.showPostRace()">
            NEXT → COLLECT REWARDS
          </button>
        ` : `
          <button class="btn btn-primary" onclick="UI.showSeasonEnd()">
            SEASON FINALE RESULTS →
          </button>
        `}
      </div>
    `);
  },

  // ============================================================
  // POST-RACE REWARDS
  // ============================================================
  showPostRace() {
    const rewards = getCardRewards(GameState.round);
    const upgradeOptions = getUpgradeOptions();
    const track = GameState.getCurrentTrack();

    this.render(`
      <div class="screen">
        <div class="screen-header">
          <h2>POST-RACE</h2>
          <p>Debrief complete. Choose your rewards and prepare for the next race.</p>
        </div>

        <div class="post-race-layout">
          <div class="reward-section">
            <h3>🃏 CARD REWARDS — Choose 1</h3>
            <div class="card-reward-options">
              ${rewards.map((card, i) => card ? `
                <div class="reward-card" onclick="UI.selectRewardCard('${card.id}', this)">
                  ${this.renderCardFull(card)}
                </div>
              ` : '').join('')}
              <div class="reward-card skip-card" onclick="UI.skipCard()">
                <div class="skip-content">
                  <span class="skip-icon">⏭</span>
                  <strong>Skip</strong>
                  <p>Don't take a card. Keep your deck lean.</p>
                </div>
              </div>
            </div>
          </div>

          <div class="upgrade-section">
            <h3>🔧 UPGRADES SHOP</h3>
            <p>Balance: <strong class="green">$${GameState.money.toLocaleString()}</strong></p>
            <div class="upgrade-list">
              ${upgradeOptions.map(u => `
                <div class="upgrade-item ${GameState.money < u.cost ? 'cannot-afford' : ''}">
                  <div class="upgrade-info">
                    <strong>${u.name}</strong>
                    <span>${u.description}</span>
                  </div>
                  <div class="upgrade-right">
                    <span class="upgrade-cost">$${u.cost.toLocaleString()}</span>
                    <button class="btn btn-secondary btn-small"
                            ${GameState.money < u.cost ? 'disabled' : ''}
                            onclick="UI.buyUpgrade('${u.id}')">
                      BUY
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <div id="selected-reward-display"></div>

        <button class="btn btn-primary" id="continue-btn" onclick="UI.continueToMap()">
          CONTINUE TO SEASON MAP →
        </button>
      </div>
    `);
  },

  selectRewardCard(cardId, el) {
    document.querySelectorAll('.reward-card').forEach(e => e.classList.remove('selected'));
    el.classList.add('selected');
    this._pendingRewardCard = cardId;

    const card = getCard(cardId);
    const displayEl = document.getElementById('selected-reward-display');
    if (displayEl && card) {
      displayEl.innerHTML = `<div class="reward-selected-banner">✅ Selected: ${card.icon} <strong>${card.name}</strong></div>`;
    }
  },

  skipCard() {
    document.querySelectorAll('.reward-card').forEach(e => e.classList.remove('selected'));
    document.querySelector('.skip-card')?.classList.add('selected');
    this._pendingRewardCard = null;
    const displayEl = document.getElementById('selected-reward-display');
    if (displayEl) displayEl.innerHTML = `<div class="reward-selected-banner">⏭ Skipping card reward</div>`;
  },

  buyUpgrade(upgradeId) {
    const upgrade = UPGRADES_SHOP.find(u => u.id === upgradeId);
    if (!upgrade || !GameState.spendMoney(upgrade.cost)) return;

    GameState.applyPermanentUpgrade(upgrade.effect);

    const btn = event.target;
    btn.textContent = '✅ BOUGHT';
    btn.disabled = true;

    const balanceEl = document.querySelector('.upgrade-section .green');
    if (balanceEl) balanceEl.textContent = `$${GameState.money.toLocaleString()}`;

    // Flash notification
    const notif = document.createElement('div');
    notif.className = 'buy-notif';
    notif.textContent = `✅ ${upgrade.name} installed!`;
    document.querySelector('.upgrade-section').prepend(notif);
    setTimeout(() => notif.remove(), 2500);
  },

  continueToMap() {
    if (this._pendingRewardCard) {
      GameState.addCardToDeck(this._pendingRewardCard);
    }
    this._pendingRewardCard = null;

    // Apply permanent upgrade cards
    const allCards = [...GameState.deck, ...GameState.hand, ...GameState.discard];
    for (const id of allCards) {
      const card = getCard(id);
      if (card?.effect === 'permanent_upgrade' && card.permanent && !GameState.appliedUpgrades?.includes(id)) {
        GameState.applyPermanentUpgrade(card.statBoost || {});
        if (!GameState.appliedUpgrades) GameState.appliedUpgrades = [];
        GameState.appliedUpgrades.push(id);
      }
      if (card?.effect === 'strategy_vision' && card.permanent) {
        GameState.strategyVision = true;
      }
    }

    if (GameState.isSeasonOver()) {
      this.showSeasonEnd();
    } else {
      this.showSeasonMap();
    }
  },

  // ============================================================
  // RESULTS / SEASON END
  // ============================================================
  showResults() {
    const results = GameState.results;
    this.render(`
      <div class="screen">
        <div class="screen-header">
          <h2>📊 SEASON RESULTS</h2>
        </div>
        <div class="results-table">
          ${results.map(r => `
            <div class="result-item pos-${r.position <= 3 ? 'podium' : r.position <= 10 ? 'points' : 'out'}">
              <span class="ri-round">R${r.round}</span>
              <span class="ri-track">${r.trackEmoji} ${r.track}</span>
              <span class="ri-pos">P${r.position}</span>
              <span class="ri-pts">+${r.points} pts</span>
              ${r.dnf ? '<span class="ri-dnf">DNF</span>' : ''}
            </div>
          `).join('')}
          <div class="results-total">
            <strong>TOTAL: ${GameState.constructorsPoints} POINTS</strong>
            <span>Rival: ${GameState.rivalPoints} pts</span>
          </div>
        </div>
        <button class="btn btn-ghost" onclick="UI.showSeasonMap()">← BACK</button>
      </div>
    `);
  },

  showSeasonEnd() {
    const result = GameState.getSeasonResult();
    const won = result.won;

    this.render(`
      <div class="screen season-end ${won ? 'won' : 'lost'}">
        <div class="season-end-content">
          ${won ? `
            <div class="trophy">🏆</div>
            <h1>CHAMPION!</h1>
            <p>You conquered the championship! A legendary season.</p>
          ` : `
            <div class="trophy">😤</div>
            <h1>SO CLOSE</h1>
            <p>The championship slipped away, but what a season.</p>
          `}

          <div class="final-stats">
            <div class="fs-row"><span>Your Points</span><strong class="accent">${result.totalPoints}</strong></div>
            <div class="fs-row"><span>Rival Points</span><strong>${result.rivalPoints}</strong></div>
            <div class="fs-row"><span>Best Result</span><strong>P${result.bestResult}</strong></div>
            <div class="fs-row"><span>Races Completed</span><strong>${result.results.length}</strong></div>
            <div class="fs-row"><span>Races Finished in Points</span><strong>${result.results.filter(r => r.points > 0).length}</strong></div>
          </div>

          <div class="race-recap">
            ${result.results.map(r => `
              <span class="recap-badge pos-${r.position <= 3 ? 'podium' : r.position <= 10 ? 'points' : 'out'}">${r.trackEmoji} P${r.position}</span>
            `).join('')}
          </div>

          <button class="btn btn-primary btn-large" onclick="UI.showTitle()">
            PLAY AGAIN
          </button>
        </div>
      </div>
    `);
  },
};

// Helper functions
function renderStressBar(value) {
  const pct = Math.round(value * 100);
  const color = pct > 70 ? '#ff4444' : pct > 40 ? '#ffaa00' : '#44ff88';
  return `<div class="inline-bar"><div style="width:${pct}%;background:${color}"></div></div>`;
}
