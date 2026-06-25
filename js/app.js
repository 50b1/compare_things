// ============================================================
// Main Application Logic
// ============================================================

let currentUsername = localStorage.getItem('tm_username') || '';

// ---------- NAVIGATION ----------
function navigateTo(sectionId) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(sectionId).classList.add('active');
  document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');

  if (sectionId === 'community-section') {
    loadCommunityRankings();
  }
}

// ---------- USERNAME ----------
function ensureUsername() {
  return new Promise((resolve) => {
    if (currentUsername) {
      resolve(currentUsername);
      return;
    }
    const overlay = document.getElementById('username-modal');
    overlay.classList.add('active');
    const input = document.getElementById('username-input');
    const btn = document.getElementById('username-submit');
    input.focus();

    function submit() {
      const name = input.value.trim();
      if (!name) return;
      currentUsername = name;
      localStorage.setItem('tm_username', name);
      overlay.classList.remove('active');
      document.getElementById('current-user-display').textContent = name;
      resolve(name);
    }

    btn.onclick = submit;
    input.onkeydown = (e) => { if (e.key === 'Enter') submit(); };
  });
}

function updateUserDisplay() {
  const el = document.getElementById('current-user-display');
  if (currentUsername) {
    el.textContent = currentUsername;
    el.style.display = 'inline';
  } else {
    el.style.display = 'none';
  }
}

// ============================================================
// CUSTOM COMPARE (original tool)
// ============================================================
const customCompare = (() => {
  const items = [];
  let pairs = [];
  let currentPair = 0;
  const history = [];
  let wins = {};
  let elo = {};
  const K = 32;
  const START_ELO = 1000;

  function init() {
    const textInput = document.getElementById('cc-text-input');
    const addTextBtn = document.getElementById('cc-add-text-btn');
    const imageInput = document.getElementById('cc-image-input');
    const folderInput = document.getElementById('cc-folder-input');
    const startBtn = document.getElementById('cc-start-btn');

    addTextBtn.addEventListener('click', () => {
      const v = textInput.value.trim();
      if (!v) return;
      addItem('text', v);
      textInput.value = '';
      textInput.focus();
    });

    textInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') addTextBtn.click();
    });

    imageInput.addEventListener('change', () => {
      const file = imageInput.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => { addItem('image', e.target.result, file.name); imageInput.value = ''; };
      reader.readAsDataURL(file);
    });

    folderInput.addEventListener('change', () => {
      Array.from(folderInput.files).filter(f => f.type.startsWith('image/')).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => { addItem('image', e.target.result, file.name); };
        reader.readAsDataURL(file);
      });
      folderInput.value = '';
    });

    startBtn.addEventListener('click', startCompare);
    document.getElementById('cc-skip-btn').addEventListener('click', chooseTie);
    document.getElementById('cc-undo-btn').addEventListener('click', undo);
    document.getElementById('cc-card-a').addEventListener('click', () => { if (currentPair < pairs.length) choose(pairs[currentPair][0]); });
    document.getElementById('cc-card-b').addEventListener('click', () => { if (currentPair < pairs.length) choose(pairs[currentPair][1]); });
    document.getElementById('cc-restart-btn').addEventListener('click', restart);
    document.getElementById('cc-redo-btn').addEventListener('click', () => { showPhase('compare'); startCompare(); });
  }

  function addItem(type, value, name) {
    items.push({ id: Date.now() + Math.random(), type, value, name: name || '' });
    renderChips();
    updateStartBtn();
  }

  function removeItem(idx) {
    items.splice(idx, 1);
    renderChips();
    updateStartBtn();
  }

  function renderChips() {
    const list = document.getElementById('cc-items-list');
    list.innerHTML = '';
    items.forEach((item, i) => {
      const chip = document.createElement('div');
      chip.className = 'item-chip';
      if (item.type === 'image') {
        const img = document.createElement('img');
        img.src = item.value;
        chip.appendChild(img);
      }
      const span = document.createElement('span');
      span.textContent = item.type === 'text' ? item.value : (item.name || `Image ${i + 1}`);
      chip.appendChild(span);
      const btn = document.createElement('button');
      btn.textContent = '×';
      btn.addEventListener('click', () => removeItem(i));
      chip.appendChild(btn);
      list.appendChild(chip);
    });
  }

  function updateStartBtn() {
    document.getElementById('cc-start-btn').disabled = items.length < 2;
  }

  function showPhase(phase) {
    document.getElementById('cc-setup').style.display = phase === 'setup' ? 'block' : 'none';
    document.getElementById('cc-compare').style.display = phase === 'compare' ? 'block' : 'none';
    document.getElementById('cc-results').style.display = phase === 'results' ? 'block' : 'none';
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function startCompare() {
    pairs = [];
    for (let i = 0; i < items.length; i++)
      for (let j = i + 1; j < items.length; j++)
        pairs.push([i, j]);
    shuffle(pairs);
    currentPair = 0;
    history.length = 0;
    wins = {};
    elo = {};
    items.forEach((_, i) => { wins[i] = 0; elo[i] = START_ELO; });
    showPhase('compare');
    showPair();
  }

  function showPair() {
    if (currentPair >= pairs.length) { showResults(); return; }
    const [a, b] = pairs[currentPair];
    renderCard(document.getElementById('cc-card-a'), items[a]);
    renderCard(document.getElementById('cc-card-b'), items[b]);
    updateProgress();
    document.getElementById('cc-undo-btn').disabled = history.length === 0;
  }

  function renderCard(card, item) {
    card.innerHTML = '';
    if (item.type === 'image') {
      const img = document.createElement('img');
      img.src = item.value;
      card.appendChild(img);
    }
    const label = document.createElement('div');
    label.className = 'label';
    label.textContent = item.type === 'text' ? item.value : (item.name || '');
    card.appendChild(label);
  }

  function updateProgress() {
    const pct = pairs.length ? (currentPair / pairs.length) * 100 : 0;
    document.getElementById('cc-progress-fill').style.width = pct + '%';
    document.getElementById('cc-progress-text').textContent = `${currentPair} / ${pairs.length} comparisons`;
  }

  function expectedScore(ra, rb) { return 1 / (1 + Math.pow(10, (rb - ra) / 400)); }

  function recordResult(winnerIdx, loserIdx) {
    if (winnerIdx !== null) {
      wins[winnerIdx]++;
      const ea = expectedScore(elo[winnerIdx], elo[loserIdx]);
      elo[winnerIdx] += K * (1 - ea);
      elo[loserIdx] += K * (0 - (1 - ea));
    } else {
      const [a, b] = pairs[currentPair];
      const ea = expectedScore(elo[a], elo[b]);
      elo[a] += K * (0.5 - ea);
      elo[b] += K * (0.5 - (1 - ea));
    }
  }

  function choose(winnerIdx) {
    const [a, b] = pairs[currentPair];
    const loserIdx = winnerIdx === a ? b : a;
    history.push({ pair: currentPair, eloSnapshot: { ...elo }, winsSnapshot: { ...wins } });
    recordResult(winnerIdx, loserIdx);
    currentPair++;
    showPair();
  }

  function chooseTie() {
    history.push({ pair: currentPair, eloSnapshot: { ...elo }, winsSnapshot: { ...wins } });
    recordResult(null, null);
    currentPair++;
    showPair();
  }

  function undo() {
    if (!history.length) return;
    const last = history.pop();
    currentPair = last.pair;
    Object.assign(elo, last.eloSnapshot);
    Object.assign(wins, last.winsSnapshot);
    showPair();
  }

  function showResults() {
    showPhase('results');
    const ranked = items.map((item, i) => ({ item, idx: i, wins: wins[i], elo: elo[i] }));
    ranked.sort((a, b) => b.elo - a.elo);
    const maxElo = ranked[0]?.elo || 1;
    const minElo = ranked[ranked.length - 1]?.elo || 0;
    const range = maxElo - minElo || 1;

    const tbody = document.getElementById('cc-results-body');
    tbody.innerHTML = '';
    ranked.forEach((entry, rank) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><span class="rank-badge ${rank < 3 ? `rank-${rank + 1}` : 'rank-other'}">${rank + 1}</span></td>
        <td><div class="item-cell">${entry.item.type === 'image' ? `<img src="${entry.item.value}">` : ''}
          <span>${entry.item.type === 'text' ? entry.item.value : (entry.item.name || `Image ${entry.idx + 1}`)}</span></div></td>
        <td>${entry.wins}</td>
        <td><div class="score-bar-wrap"><div class="score-bar-fill" style="width:${Math.max(((entry.elo - minElo) / range) * 100, 4)}%"></div></div></td>
      `;
      tbody.appendChild(tr);
    });
  }

  function restart() {
    items.length = 0;
    showPhase('setup');
    renderChips();
    updateStartBtn();
  }

  return { init };
})();


// ============================================================
// TASKMASTER RANKING (rank series, not contestants)
// ============================================================
const taskmasterRanking = (() => {
  let selectedSubsets = new Set();
  let seriesToRank = [];
  let pairs = [];
  let currentPair = 0;
  let history = [];
  let wins = {};
  let elo = {};
  const K = 32;
  const START_ELO = 1000;

  function init() {
    renderSubsetSelector();
    document.getElementById('tm-start-btn').addEventListener('click', startRanking);
    document.getElementById('tm-skip-btn').addEventListener('click', chooseTie);
    document.getElementById('tm-undo-btn').addEventListener('click', undo);
    document.getElementById('tm-card-a').addEventListener('click', () => { if (currentPair < pairs.length) choose(pairs[currentPair][0]); });
    document.getElementById('tm-card-b').addEventListener('click', () => { if (currentPair < pairs.length) choose(pairs[currentPair][1]); });
    document.getElementById('tm-back-btn').addEventListener('click', backToSelection);
  }

  function renderSubsetSelector() {
    const container = document.getElementById('tm-subset-selector');
    container.innerHTML = '';

    const groups = [
      { key: 'main_series', label: 'Main Series', items: TASKMASTER_DATA.main_series },
      { key: 'champion_of_champions', label: 'Champion of Champions', items: TASKMASTER_DATA.champion_of_champions },
      { key: 'new_years_treat', label: "New Year's Treat", items: TASKMASTER_DATA.new_years_treat },
    ];

    groups.forEach(group => {
      const div = document.createElement('div');
      div.className = 'subset-group';
      div.innerHTML = `<h3>${group.label}</h3><div class="subset-options" id="opts-${group.key}"></div>`;
      container.appendChild(div);

      const optsDiv = div.querySelector('.subset-options');

      // "Select All" button
      const allLabel = document.createElement('label');
      allLabel.className = 'subset-check';
      allLabel.innerHTML = `<input type="checkbox" data-group="${group.key}" data-all="true"> All`;
      optsDiv.appendChild(allLabel);

      group.items.forEach(item => {
        const label = document.createElement('label');
        label.className = 'subset-check';
        label.innerHTML = `<input type="checkbox" data-id="${item.id}" data-group="${group.key}"> ${item.name}`;
        optsDiv.appendChild(label);
      });
    });

    container.addEventListener('change', (e) => {
      const checkbox = e.target;
      if (!checkbox.matches('input[type="checkbox"]')) return;

      const label = checkbox.closest('.subset-check');

      if (checkbox.dataset.all) {
        const group = checkbox.dataset.group;
        const groupChecks = container.querySelectorAll(`input[data-group="${group}"]:not([data-all])`);
        groupChecks.forEach(cb => {
          cb.checked = checkbox.checked;
          cb.closest('.subset-check').classList.toggle('selected', checkbox.checked);
          if (checkbox.checked) selectedSubsets.add(cb.dataset.id);
          else selectedSubsets.delete(cb.dataset.id);
        });
        label.classList.toggle('selected', checkbox.checked);
      } else {
        label.classList.toggle('selected', checkbox.checked);
        if (checkbox.checked) selectedSubsets.add(checkbox.dataset.id);
        else selectedSubsets.delete(checkbox.dataset.id);
      }

      updatePreview();
      document.getElementById('tm-start-btn').disabled = selectedSubsets.size < 2;
    });
  }

  function getSeriesForSubsets() {
    const allData = [...TASKMASTER_DATA.main_series, ...TASKMASTER_DATA.champion_of_champions, ...TASKMASTER_DATA.new_years_treat];
    return allData.filter(s => selectedSubsets.has(s.id));
  }

  function updatePreview() {
    const series = getSeriesForSubsets();
    const preview = document.getElementById('tm-contestant-preview');
    const count = document.getElementById('tm-contestant-count');

    count.textContent = `${series.length} series selected`;

    preview.innerHTML = '';
    series.forEach(s => {
      const chip = document.createElement('div');
      chip.className = 'contestant-chip';
      chip.innerHTML = `<span class="avatar">${s.name.replace(/[^0-9]/g, '').slice(0, 2) || s.name.slice(0, 2)}</span><span>${s.name} (${s.year})</span>`;
      preview.appendChild(chip);
    });

    preview.style.display = series.length > 0 ? 'flex' : 'none';
  }

  function showPhase(phase) {
    document.getElementById('tm-selection').style.display = phase === 'selection' ? 'block' : 'none';
    document.getElementById('tm-compare').style.display = phase === 'compare' ? 'block' : 'none';
    document.getElementById('tm-results').style.display = phase === 'results' ? 'block' : 'none';
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  async function startRanking() {
    await ensureUsername();
    seriesToRank = getSeriesForSubsets();
    if (seriesToRank.length < 2) return;

    pairs = [];
    for (let i = 0; i < seriesToRank.length; i++)
      for (let j = i + 1; j < seriesToRank.length; j++)
        pairs.push([i, j]);
    shuffle(pairs);
    currentPair = 0;
    history = [];
    wins = {};
    elo = {};
    seriesToRank.forEach((_, i) => { wins[i] = 0; elo[i] = START_ELO; });

    showPhase('compare');
    showPair();
  }

  function showPair() {
    if (currentPair >= pairs.length) { showResults(); return; }
    const [a, b] = pairs[currentPair];
    renderCard(document.getElementById('tm-card-a'), seriesToRank[a]);
    renderCard(document.getElementById('tm-card-b'), seriesToRank[b]);

    const pct = pairs.length ? (currentPair / pairs.length) * 100 : 0;
    document.getElementById('tm-progress-fill').style.width = pct + '%';
    document.getElementById('tm-progress-text').textContent = `${currentPair} / ${pairs.length} comparisons`;
    document.getElementById('tm-undo-btn').disabled = history.length === 0;
  }

  function renderCard(card, series) {
    card.innerHTML = '';

    // Series image (optional)
    const imgPath = `images/series/${series.id}.jpg`;
    const img = document.createElement('img');
    img.src = imgPath;
    img.onerror = function() { this.style.display = 'none'; };
    card.appendChild(img);

    // Series title
    const label = document.createElement('div');
    label.className = 'label';
    label.textContent = `${series.name} (${series.year})`;
    card.appendChild(label);

    // Contestants list
    const details = document.createElement('div');
    details.style.cssText = 'margin-top:0.75rem;font-size:0.82rem;color:var(--text-dim);line-height:1.5;';
    details.innerHTML = series.contestants.map(c =>
      c === series.winner ? `<strong style="color:var(--gold);">★ ${c}</strong>` : c
    ).join('<br>');
    card.appendChild(details);
  }

  function expectedScore(ra, rb) { return 1 / (1 + Math.pow(10, (rb - ra) / 400)); }

  function recordResult(winnerIdx, loserIdx) {
    if (winnerIdx !== null) {
      wins[winnerIdx]++;
      const ea = expectedScore(elo[winnerIdx], elo[loserIdx]);
      elo[winnerIdx] += K * (1 - ea);
      elo[loserIdx] += K * (0 - (1 - ea));
    } else {
      const [a, b] = pairs[currentPair];
      const ea = expectedScore(elo[a], elo[b]);
      elo[a] += K * (0.5 - ea);
      elo[b] += K * (0.5 - (1 - ea));
    }
  }

  function choose(winnerIdx) {
    const [a, b] = pairs[currentPair];
    const loserIdx = winnerIdx === a ? b : a;
    history.push({ pair: currentPair, eloSnapshot: { ...elo }, winsSnapshot: { ...wins } });
    recordResult(winnerIdx, loserIdx);
    currentPair++;
    showPair();
  }

  function chooseTie() {
    history.push({ pair: currentPair, eloSnapshot: { ...elo }, winsSnapshot: { ...wins } });
    recordResult(null, null);
    currentPair++;
    showPair();
  }

  function undo() {
    if (!history.length) return;
    const last = history.pop();
    currentPair = last.pair;
    Object.assign(elo, last.eloSnapshot);
    Object.assign(wins, last.winsSnapshot);
    showPair();
  }

  async function showResults() {
    showPhase('results');
    const ranked = seriesToRank.map((s, i) => ({ series: s, idx: i, wins: wins[i], elo: elo[i] }));
    ranked.sort((a, b) => b.elo - a.elo);
    const maxElo = ranked[0]?.elo || 1;
    const minElo = ranked[ranked.length - 1]?.elo || 0;
    const range = maxElo - minElo || 1;

    const tbody = document.getElementById('tm-results-body');
    tbody.innerHTML = '';
    ranked.forEach((entry, rank) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><span class="rank-badge ${rank < 3 ? `rank-${rank + 1}` : 'rank-other'}">${rank + 1}</span></td>
        <td><div class="item-cell">
          <span>${entry.series.name} (${entry.series.year})</span></div></td>
        <td>${entry.wins}</td>
        <td><div class="score-bar-wrap"><div class="score-bar-fill" style="width:${Math.max(((entry.elo - minElo) / range) * 100, 4)}%"></div></div></td>
      `;
      tbody.appendChild(tr);
    });

    // Auto-save
    await saveResults();
  }

  async function saveResults() {
    const ranked = seriesToRank.map((s, i) => ({
      series_id: s.id,
      name: s.name,
      year: s.year,
      elo: Math.round(elo[i]),
      wins: wins[i]
    }));
    ranked.sort((a, b) => b.elo - a.elo);

    const subset = Array.from(selectedSubsets).sort().join(',');
    await saveRanking(currentUsername, subset, ranked);
  }

  function backToSelection() {
    showPhase('selection');
  }

  return { init };
})();


// ============================================================
// COMMUNITY RANKINGS
// ============================================================
const communityRankings = (() => {
  let activeFilter = 'all';

  function init() {
    document.querySelectorAll('.community-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.community-filter-btn').forEach(b => {
          b.classList.remove('active', 'btn-accent');
          b.classList.add('btn-secondary');
        });
        btn.classList.add('active', 'btn-accent');
        btn.classList.remove('btn-secondary');
        activeFilter = btn.dataset.filter;
        loadCommunityRankings();
      });
    });
  }

  function getActiveFilter() { return activeFilter; }

  return { init, getActiveFilter };
})();

function buildSubsetHeader(ids) {
  const mainIds = ids.filter(id => id.startsWith('s'));
  const cocIds = ids.filter(id => id.startsWith('coc'));
  const nytIds = ids.filter(id => id.startsWith('nyt'));

  const parts = [];

  if (mainIds.length > 0) {
    const nums = mainIds.map(id => parseInt(id.replace('s', ''))).sort((a, b) => a - b);
    if (nums.length === 1) {
      parts.push(`Series ${nums[0]}`);
    } else {
      // Check if consecutive
      const isConsecutive = nums.every((n, i) => i === 0 || n === nums[i - 1] + 1);
      if (isConsecutive) {
        parts.push(`Series ${nums[0]}-${nums[nums.length - 1]}`);
      } else {
        parts.push(`Series ${nums.join(', ')}`);
      }
    }
  }

  if (cocIds.length > 0) {
    if (cocIds.length === TASKMASTER_DATA.champion_of_champions.length) {
      parts.push('Champion of Champions');
    } else {
      parts.push(`Champion of Champions ${cocIds.map(id => id.replace('coc', '')).join(', ')}`);
    }
  }

  if (nytIds.length > 0) {
    if (nytIds.length === TASKMASTER_DATA.new_years_treat.length) {
      parts.push("New Year's Treat");
    } else {
      parts.push(`New Year's Treat ${nytIds.map(id => id.replace('nyt', '')).join(', ')}`);
    }
  }

  return parts.join(' + ') || 'Unknown';
}

async function loadCommunityRankings() {
  const container = document.getElementById('community-content');
  container.innerHTML = '<div class="loading-msg">Loading rankings...</div>';

  const result = await fetchRankings('all');
  const rankings = result.data || [];

  if (rankings.length === 0) {
    container.innerHTML = '<div class="loading-msg">No rankings yet. Be the first to rank Taskmaster series!</div>';
    return;
  }

  // Filter rankings to only those that contain series from the active category
  const activeFilter = communityRankings.getActiveFilter();

  let filtered;
  if (activeFilter === 'all') {
    filtered = rankings;
  } else {
    const categoryIds = new Set(TASKMASTER_DATA[activeFilter].map(s => s.id));
    filtered = rankings.filter(ranking => {
      const ids = (ranking.subset || '').split(',');
      return ids.some(id => categoryIds.has(id));
    });
  }

  if (filtered.length === 0) {
    container.innerHTML = '<div class="loading-msg">No rankings for this category yet.</div>';
    return;
  }

  // For "All" filter, aggregate everything into one combined list
  if (activeFilter === 'all') {
    const seriesScores = {};
    filtered.forEach(ranking => {
      (ranking.rankings || []).forEach(entry => {
        const id = entry.series_id || entry.name;
        if (!seriesScores[id]) {
          seriesScores[id] = { name: entry.name, year: entry.year, totalElo: 0, count: 0, totalWins: 0 };
        }
        seriesScores[id].totalElo += entry.elo;
        seriesScores[id].totalWins += entry.wins;
        seriesScores[id].count++;
      });
    });

    const aggregated = Object.values(seriesScores)
      .map(c => ({ ...c, avgElo: c.totalElo / c.count, avgWins: c.totalWins / c.count }))
      .sort((a, b) => b.avgElo - a.avgElo);

    const maxElo = aggregated[0]?.avgElo || 1;
    const minElo = aggregated[aggregated.length - 1]?.avgElo || 0;
    const range = maxElo - minElo || 1;

    let html = `<table class="results-table"><thead><tr><th style="width:50px">Rank</th><th>Series</th><th style="width:60px">Avg Wins</th><th style="width:140px">Score</th></tr></thead><tbody>`;
    aggregated.forEach((entry, rank) => {
      const pct = Math.max(((entry.avgElo - minElo) / range) * 100, 4);
      html += `
        <tr>
          <td><span class="rank-badge ${rank < 3 ? `rank-${rank + 1}` : 'rank-other'}">${rank + 1}</span></td>
          <td><div class="item-cell"><span>${entry.name}${entry.year ? ` (${entry.year})` : ''}</span></div></td>
          <td>${entry.avgWins.toFixed(1)}</td>
          <td><div class="score-bar-wrap"><div class="score-bar-fill" style="width:${pct}%"></div></div></td>
        </tr>
      `;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
    return;
  }

  // Group by subset for category filters
  const bySubset = {};
  filtered.forEach(ranking => {
    const key = ranking.subset || 'unknown';
    if (!bySubset[key]) bySubset[key] = [];
    bySubset[key].push(ranking);
  });

  let html = '';

  // For each subset group, compute aggregated ranking
  Object.keys(bySubset).sort().forEach(subsetKey => {
    const group = bySubset[subsetKey];

    // Build a concise header from the subset IDs
    const ids = subsetKey.split(',');
    const headerText = buildSubsetHeader(ids);

    // Aggregate ELO per series within this subset
    const seriesScores = {};
    group.forEach(ranking => {
      (ranking.rankings || []).forEach(entry => {
        const id = entry.series_id || entry.name;
        if (!seriesScores[id]) {
          seriesScores[id] = { name: entry.name, year: entry.year, totalElo: 0, count: 0, totalWins: 0 };
        }
        seriesScores[id].totalElo += entry.elo;
        seriesScores[id].totalWins += entry.wins;
        seriesScores[id].count++;
      });
    });

    const aggregated = Object.values(seriesScores)
      .map(c => ({ ...c, avgElo: c.totalElo / c.count, avgWins: c.totalWins / c.count }))
      .sort((a, b) => b.avgElo - a.avgElo);

    const maxElo = aggregated[0]?.avgElo || 1;
    const minElo = aggregated[aggregated.length - 1]?.avgElo || 0;
    const range = maxElo - minElo || 1;

    html += `<div style="margin-bottom:2.5rem;">`;
    html += `<h3 style="margin-bottom:0.75rem;">${headerText}</h3>`;
    html += `<table class="results-table"><thead><tr><th style="width:50px">Rank</th><th>Series</th><th style="width:60px">Avg Wins</th><th style="width:140px">Score</th></tr></thead><tbody>`;

    aggregated.forEach((entry, rank) => {
      const pct = Math.max(((entry.avgElo - minElo) / range) * 100, 4);
      html += `
        <tr>
          <td><span class="rank-badge ${rank < 3 ? `rank-${rank + 1}` : 'rank-other'}">${rank + 1}</span></td>
          <td><div class="item-cell">
            <span>${entry.name}${entry.year ? ` (${entry.year})` : ''}</span></div></td>
          <td>${entry.avgWins.toFixed(1)}</td>
          <td><div class="score-bar-wrap"><div class="score-bar-fill" style="width:${pct}%"></div></div></td>
        </tr>
      `;
    });

    html += '</tbody></table></div>';
  });

  container.innerHTML = html;
}


// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  initSupabase();
  updateUserDisplay();

  // Nav buttons
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => navigateTo(btn.dataset.section));
  });

  // Change username
  document.getElementById('change-user-btn')?.addEventListener('click', () => {
    currentUsername = '';
    localStorage.removeItem('tm_username');
    ensureUsername().then(updateUserDisplay);
  });

  customCompare.init();
  taskmasterRanking.init();
  communityRankings.init();

  // Default section
  navigateTo('taskmaster-section');
});
