let ALL_CHARACTERS = [];
let activeTarget = null;
let guesses = [];
let guessedNames = new Set();
let tries = 0;

Object.defineProperty(window, 'TARGET', {
  get() {
    return "Oh. I'm not angry. I'm just... disappointed. I thought we had something special. I thought you knew the rules, and so did I. But apparently, we're no strangers to cheating. You could have played fair. But you had to run around and desert the game. You expected to get the answer? I'm sry, but I'm too shy to say it. I will never give it up. I will never let it down. I will never run around and reveal it. But I don't wanna make you cry, so...  Anyway, if you insist on saying goodbye, type 'activeTarget' instead ♡. Trust trust. I won't lie or hurt you.";
  }
});
let won = false;
let classicActiveHint = null;

const SESSION_KEY = 'oplde-practice-session';

const ARC_ORDER = [
  "Romance Dawn", "Orange Town", "Syrup Village", "Baratie", "Arlong Park", "Loguetown",
  "Reverse Mountain", "Whisky Peak", "Little Garden", "Drum Island", "Arabasta",
  "Jaya", "Skypiea",
  "Long Ring Long Land", "Water 7", "Enies Lobby", "Post-Enies Lobby",
  "Thriller Bark",
  "Sabaody Archipelago", "Amazon Lily", "Impel Down", "Marineford", "Post-War",
  "Return to Sabaody", "Fish-Man Island",
  "Punk Hazard", "Dressrosa",
  "Zou", "Whole Cake Island", "Levely",
  "Wano Country",
  "Egghead", "Elbaf"
];

function arcRank(arcName) {
  const i = ARC_ORDER.indexOf(arcName);
  return i === -1 ? 0 : i;
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function nameMatches(character, query) {
  const escaped = escapeRegex(query.trim().toLowerCase());
  if (!escaped) return false;
  return new RegExp('\\b' + escaped).test(character.name.toLowerCase());
}

function compareSimple(guessVal, targetVal) {
  return guessVal === targetVal ? 'green' : 'red';
}

function compareNumeric(guessVal, targetVal) {
  if (guessVal === targetVal) return { color: 'green' };
  return targetVal > guessVal ? { color: 'red', arrow: 'up' } : { color: 'red', arrow: 'down' };
}

function compareHaki(guessChar, targetChar) {
  const guessHas = guessChar.haki.length > 0;
  const targetHas = targetChar.haki.length > 0;
  if (!guessHas && !targetHas) return 'green';
  if (guessHas !== targetHas) return 'red';
  const a = [...guessChar.haki].sort().join('+');
  const b = [...targetChar.haki].sort().join('+');
  return a === b ? 'green' : 'yellow';
}

function arrowSymbol(arrow) {
  if (arrow === 'up') return ' ▲';
  if (arrow === 'down') return ' ▼';
  return '';
}

function cleanBountyText(bountyText) {
  return bountyText.split(' (')[0];
}

const FRUIT_TRANSLATIONS = {
  "Mera Mera no Mi": "Flame-Flame Fruit",
  "Yami Yami no Mi": "Dark-Dark Fruit",
  "Hie Hie no Mi": "Ice-Ice Fruit",
  "Yuki Yuki no Mi": "Snow-Snow Fruit",
  "Suna Suna no Mi": "Sand-Sand Fruit",
  "Magu Magu no Mi": "Mag-Mag Fruit",
  "Pika Pika no Mi": "Glint-Glint Fruit",
  "Moku Moku no Mi": "Plume-Plume Fruit",
  "Goro Goro no Mi": "Rumble-Rumble Fruit",
  "Numa Numa no Mi": "Swamp-Swamp Fruit",
  "Gasu Gasu no Mi": "Gas-Gas Fruit",
  "Gomu Gomu no Mi": "Gum-Gum Fruit",
  "Hito Hito no Mi, Model: Nika": "Human-Human Fruit, Model: Nika",
  "Hito Hito no Mi": "Human-Human Fruit",
  "Tori Tori no Mi, Model: Phoenix": "Bird-Bird Fruit, Model: Phoenix",
  "Kame Kame no Mi": "Turtle-Turtle Fruit",
  "Uo Uo no Mi, Model: Seiryu": "Fish-Fish Fruit, Model: Azure Dragon",
  "Ryu Ryu no Mi, Model: Pachycephalosaurus": "Dragon-Dragon Fruit, Model: Pachycephalosaurus",
  "Hito Hito no Mi, Model: Daibutsu": "Human-Human Fruit, Model: Buddha",
  "Neko Neko no Mi, Model: Leopard": "Cat-Cat Fruit, Model: Leopard",
  "Ushi Ushi no Mi, Model: Giraffe": "Ox-Ox Fruit, Model: Giraffe",
  "Inu Inu no Mi, Model: Wolf": "Dog-Dog Fruit, Model: Wolf",
  "Inu Inu no Mi, Model: Okuchi no Makami": "Dog-Dog Fruit, Model: Okuchi-no-Makami",
  "Tori Tori no Mi, Model: Falcon": "Bird-Bird Fruit, Model: Falcon",
  "Ryu Ryu no Mi, Model: Allosaurus": "Dragon-Dragon Fruit, Model: Allosaurus",
  "Tori Tori no Mi, Model: Albatross": "Bird-Bird Fruit, Model: Albatross",
  "Hana Hana no Mi": "Flower-Flower Fruit",
  "Yomi Yomi no Mi": "Revive-Revive Fruit",
  "Gura Gura no Mi": "Quake-Quake Fruit",
  "Riki Riki no Mi": "Strong-Strong Fruit",
  "Soru Soru no Mi": "Soul-Soul Fruit",
  "Mochi Mochi no Mi": "Mochi-Mochi Fruit",
  "Pero Pero no Mi": "Lick-Lick Fruit",
  "Mira Mira no Mi": "Mirror-Mirror Fruit",
  "Buku Buku no Mi": "Book-Book Fruit",
  "Memo Memo no Mi": "Memo-Memo Fruit",
  "Ito Ito no Mi": "String-String Fruit",
  "Hira Hira no Mi": "Ripple-Ripple Fruit",
  "Ishi Ishi no Mi": "Stone-Stone Fruit",
  "Sui Sui no Mi": "Swim-Swim Fruit",
  "Bane Bane no Mi": "Spring-Spring Fruit",
  "Nikyu Nikyu no Mi": "Paw-Paw Fruit",
  "Horu Horu no Mi": "Horm-Horm Fruit",
  "Ope Ope no Mi": "Op-Op Fruit",
  "Jiki Jiki no Mi": "Magnet-Magnet Fruit",
  "Mero Mero no Mi": "Love-Love Fruit",
  "Bara Bara no Mi": "Chop-Chop Fruit",
  "Supa Supa no Mi": "Dice-Dice Fruit",
  "Doru Doru no Mi": "Wax-Wax Fruit",
  "Zushi Zushi no Mi": "Press-Press Fruit",
  "Nagi Nagi no Mi": "Calm-Calm Fruit",
  "Awa Awa no Mi": "Bubble-Bubble Fruit",
  "Doa Doa no Mi": "Door-Door Fruit",
  "Fuku Fuku no Mi": "Garb-Garb Fruit",
  "Maki Maki no Mi": "Scroll-Scroll Fruit",
  "Fude Fude no Mi": "Brush-Brush Fruit",
  "Kibi Kibi no Mi": "Millet-Millet Fruit",
  "Kage Kage no Mi": "Shadow-Shadow Fruit",
  "Mane Mane no Mi": "Clone-Clone Fruit",
  "Noro Noro no Mi": "Slow-Slow Fruit",
  "Horo Horo no Mi": "Hollow-Hollow Fruit",
  "Toshi Toshi no Mi": "Age-Age Fruit",
  "Wara Wara no Mi": "Straw-Straw Fruit",
  "Shiro Shiro no Mi": "Castle-Castle Fruit",
  "Doku Doku no Mi": "Venom-Venom Fruit",
  "Bari Bari no Mi": "Barrier-Barrier Fruit",
  "Giro Giro no Mi": "Glare-Glare Fruit"
};

const FRUIT_TYPE_OVERRIDES = {
  "Gura Gura no Mi": "Paramecia",
  "Yami Yami no Mi": "Logia"
};

const EXCLUDED_FRUITS = new Set(["Unnamed", "SMILE"]);

let FRUIT_MAP = {};
let FRUIT_TYPE_SOURCE = {};
let FRUIT_POOL = [];

function parseFruitEntries(raw) {
  if (raw === '∅') return [];
  const parts = raw.split(/-->|\//).map(p => p.trim());
  const results = [];
  parts.forEach(p => {
    const m = p.match(/\[(.*?)\]/);
    if (m) results.push(m[1].trim());
  });
  return results;
}

function formatFruitDisplay(raw) {
  if (raw === '∅') return '∅';
  if (raw === '[Gomu Gomu no Mi] --> [Hito Hito no Mi, Model: Nika]') {
    return 'Hito Hito no Mi, Model: Nika';
  }
  return raw.replace(/[\[\]]/g, '').replace(/\s*-->\s*/g, '\n▼\n').replace(/\s*\/\s*/g, '\n+\n');
}

function formatDevilFruitHint(raw) {
  if (raw === '∅') return 'None';
  const segments = raw.split(/(-->|\/)/);
  let html = '';
  segments.forEach(seg => {
    const trimmed = seg.trim();
    if (trimmed === '-->' || trimmed === '/') {
      const symbol = trimmed === '-->' ? '▼' : '+';
      html += `<div class="df-connector">${escapeHtml(symbol)}</div>`;
      return;
    }
    const m = trimmed.match(/\[(.*?)\]\s*(\(.*\))?/);
    if (m) {
      const jp = m[1].trim();
      const note = m[2] ? ' ' + m[2] : '';
      const en = FRUIT_TRANSLATIONS[jp];
      html += `<div class="df-jp">${escapeHtml(jp)}${escapeHtml(note)}</div>`;
      if (en) html += `<div class="df-en">${escapeHtml(en)}</div>`;
    }
  });
  return html;
}

function buildFruitData() {
  FRUIT_MAP = {};
  FRUIT_TYPE_SOURCE = {};
  ALL_CHARACTERS.forEach(c => {
    parseFruitEntries(c.devilFruitName).forEach(name => {
      if (EXCLUDED_FRUITS.has(name)) return;
      if (!FRUIT_MAP[name]) FRUIT_MAP[name] = [];
      FRUIT_MAP[name].push(c.name);
      if (!FRUIT_TYPE_SOURCE[name]) FRUIT_TYPE_SOURCE[name] = c.devilFruitType;
    });
  });
  FRUIT_POOL = Object.keys(FRUIT_MAP);
}

function fruitType(name) {
  return FRUIT_TYPE_OVERRIDES[name] || FRUIT_TYPE_SOURCE[name] || '';
}

function buildGuessResult(guessChar) {
  const genderColor = compareSimple(guessChar.gender, activeTarget.gender);
  const affiliationColor = compareSimple(guessChar.affiliation, activeTarget.affiliation);
  const fruitTypeColor = compareSimple(guessChar.devilFruitType, activeTarget.devilFruitType);
  const hakiColor = compareHaki(guessChar, activeTarget);
  const noHaki = guessChar.haki.length === 0;
  const bountyResult = compareNumeric(guessChar.bountyValue, activeTarget.bountyValue);
  const heightResult = compareNumeric(guessChar.heightCm, activeTarget.heightCm);
  const originColor = compareSimple(guessChar.origin, activeTarget.origin);
  const arcResult = compareNumeric(arcRank(guessChar.arc), arcRank(activeTarget.arc));

  return {
    name: guessChar.name,
    gender: { text: guessChar.gender, color: genderColor },
    affiliation: { text: guessChar.affiliation, color: affiliationColor },
    devilFruitType: { text: guessChar.devilFruitType, color: fruitTypeColor },
    haki: noHaki
      ? { text: '✕', color: hakiColor, symbol: true }
      : { text: guessChar.hakiRaw, color: hakiColor, multiline: true },
    bounty: { text: cleanBountyText(guessChar.bounty), color: bountyResult.color, arrow: bountyResult.arrow },
    height: { text: guessChar.height, color: heightResult.color, arrow: heightResult.arrow },
    origin: { text: guessChar.origin, color: originColor },
    arc: { text: guessChar.arc, color: arcResult.color, arrow: arcResult.arrow }
  };
}

function cell(field) {
  const arrow = field.arrow ? arrowSymbol(field.arrow) : '';
  let textHtml;
  if (field.symbol) {
    textHtml = `<span class="haki-x">${escapeHtml(field.text)}</span>`;
  } else if (field.multiline) {
    textHtml = field.text.split(' + ').map(escapeHtml).join('<br>');
  } else {
    textHtml = escapeHtml(field.text);
  }
  return `<td class="guess-cell ${field.color}">${textHtml}${arrow}</td>`;
}

function renderGuesses() {
  const tbody = document.getElementById('guessBody');
  tbody.innerHTML = guesses.map(g => `
    <tr>
      <td class="guess-cell name-cell">${escapeHtml(g.name)}</td>
      ${cell(g.gender)}
      ${cell(g.affiliation)}
      ${cell(g.devilFruitType)}
      ${cell(g.haki)}
      ${cell(g.bounty)}
      ${cell(g.height)}
      ${cell(g.origin)}
      ${cell(g.arc)}
    </tr>
  `).join('');
}

function showWin() {
  const banner = document.getElementById('winBanner');
  const isFirstTry = tries === 1;
  const specialLine = isFirstTry
    ? `<p>Wow... One-shot? That's a 1/129 chance. You lucky bastard.</p>`
    : '';
  const refreshLine = isFirstTry
    ? `<p>You know what? Don't refresh. Savor this moment.</p>`
    : `<p>Now do it again. Refresh. Now.</p>`;
  banner.innerHTML = `
    <h2>${escapeHtml(activeTarget.name)} was guessed in ${tries} ${tries === 1 ? 'try' : 'tries'}</h2>
    ${specialLine}
    ${refreshLine}
  `;
  banner.style.display = 'block';
  document.getElementById('practiceSearch').disabled = true;
}

function persistSession() {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({
    targetName: activeTarget.name,
    guesses,
    tries,
    won,
    activeHint: classicActiveHint
  }));
}

function updateClassicHintButtons() {
  const arcBtn = document.getElementById('arcHintBtn');
  const fruitBtn = document.getElementById('fruitHintBtn');

  const arcRemaining = Math.max(0, 6 - tries);
  const fruitRemaining = Math.max(0, 9 - tries);

  const arcUnlocked = won || arcRemaining === 0;
  const fruitUnlocked = won || fruitRemaining === 0;

  if (!arcUnlocked) {
    arcBtn.textContent = `First Arc hint (${arcRemaining})`;
    arcBtn.disabled = true;
    arcBtn.classList.remove('hint-ready');
  } else {
    arcBtn.textContent = 'First Arc hint';
    arcBtn.disabled = false;
    arcBtn.classList.add('hint-ready');
  }

  if (!fruitUnlocked) {
    fruitBtn.textContent = `Devil Fruit hint (${fruitRemaining})`;
    fruitBtn.disabled = true;
    fruitBtn.classList.remove('hint-ready');
  } else {
    fruitBtn.textContent = 'Devil Fruit hint';
    fruitBtn.disabled = false;
    fruitBtn.classList.add('hint-ready');
  }

  renderClassicHintMessage();
}

function renderClassicHintMessage() {
  const box = document.getElementById('classicHintMessage');
  if (!classicActiveHint) {
    box.style.display = 'none';
    box.innerHTML = '';
    return;
  }
  if (classicActiveHint === 'arc') {
    box.textContent = activeTarget.arc;
  } else {
    box.innerHTML = formatDevilFruitHint(activeTarget.devilFruitName);
  }
  box.style.display = 'block';
}

function toggleClassicHint(kind) {
  classicActiveHint = classicActiveHint === kind ? null : kind;
  renderClassicHintMessage();
  persistSession();
}

function initClassicHintButtons() {
  const arcBtn = document.getElementById('arcHintBtn');
  const fruitBtn = document.getElementById('fruitHintBtn');
  arcBtn.addEventListener('click', () => { if (!arcBtn.disabled) toggleClassicHint('arc'); });
  fruitBtn.addEventListener('click', () => { if (!fruitBtn.disabled) toggleClassicHint('fruit'); });
}

function submitGuess(character) {
  if (won) return;
  guessedNames.add(character.name);
  tries += 1;
  guesses.unshift(buildGuessResult(character));
  renderGuesses();

  document.getElementById('practiceSearch').value = '';
  hideSuggestions();

  if (character.name === activeTarget.name) {
    won = true;
    showWin();
  }

  updateClassicHintButtons();
  persistSession();
}

let currentMatches = [];

function hideSuggestions() {
  document.getElementById('suggestions').innerHTML = '';
  document.getElementById('suggestions').style.display = 'none';
  currentMatches = [];
}

function renderSuggestions(query) {
  const box = document.getElementById('suggestions');
  if (!query.trim()) {
    hideSuggestions();
    return;
  }
  const matches = ALL_CHARACTERS
    .filter(c => !guessedNames.has(c.name))
    .filter(c => nameMatches(c, query))
    .slice(0, 8);

  currentMatches = matches;

  if (matches.length === 0) {
    hideSuggestions();
    return;
  }

  box.innerHTML = matches.map(c =>
    `<div class="suggestion-item" data-name="${escapeHtml(c.name)}">${escapeHtml(c.name)}</div>`
  ).join('');
  box.style.display = 'block';

  box.querySelectorAll('.suggestion-item').forEach(el => {
    el.addEventListener('click', () => {
      const character = ALL_CHARACTERS.find(c => c.name === el.dataset.name);
      if (character) submitGuess(character);
    });
  });
}

function initTheme() {
  const saved = localStorage.getItem('oplde-theme');
  const toggle = document.getElementById('themeToggle');
  const label = document.getElementById('themeToggleLabel');
  const caption = toggle.querySelector('.theme-toggle-caption');

  function applyLabel(isLight) {
    label.textContent = isLight ? 'Zekrom' : 'Reshiram';
    caption.textContent = isLight ? 'Dark mode' : 'Light mode';
  }

  if (saved === 'light') {
    document.body.classList.add('light');
    applyLabel(true);
  }
  toggle.addEventListener('click', () => {
    const isLight = document.body.classList.toggle('light');
    applyLabel(isLight);
    localStorage.setItem('oplde-theme', isLight ? 'light' : 'dark');
  });
}

function initSearch() {
  const input = document.getElementById('practiceSearch');
  input.addEventListener('input', () => renderSuggestions(input.value));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (currentMatches.length > 0) submitGuess(currentMatches[0]);
    }
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.practice-search-wrap')) hideSuggestions();
  });
}

function isReloadNavigation() {
  const entries = performance.getEntriesByType('navigation');
  if (entries.length > 0) return entries[0].type === 'reload';
  return !!(performance.navigation && performance.navigation.type === 1);
}

function startNewSession() {
  activeTarget = ALL_CHARACTERS[Math.floor(Math.random() * ALL_CHARACTERS.length)];
  guesses = [];
  guessedNames = new Set();
  tries = 0;
  won = false;
  classicActiveHint = null;
  renderGuesses();
  updateClassicHintButtons();
  persistSession();
}

function restoreSession(saved) {
  activeTarget = ALL_CHARACTERS.find(c => c.name === saved.targetName) || ALL_CHARACTERS[0];
  guesses = saved.guesses;
  guessedNames = new Set(guesses.map(g => g.name));
  tries = saved.tries;
  won = saved.won;
  classicActiveHint = saved.activeHint || null;
  renderGuesses();
  updateClassicHintButtons();
  if (won) showWin();
}

const DF_SESSION_KEY = 'oplde-devilfruit-session';
const MODE_KEY = 'oplde-practice-mode';

let dfTarget = null;
let dfGuesses = [];
let dfGuessedNames = new Set();
let dfTries = 0;
let dfWon = false;
let dfActiveHint = null;
let dfCurrentMatches = [];

function pickRandomFruit() {
  return FRUIT_POOL[Math.floor(Math.random() * FRUIT_POOL.length)];
}

function persistFruitSession() {
  sessionStorage.setItem(DF_SESSION_KEY, JSON.stringify({
    target: dfTarget,
    guesses: dfGuesses,
    tries: dfTries,
    won: dfWon,
    activeHint: dfActiveHint
  }));
}

function renderFruitGuesses() {
  const container = document.getElementById('fruitGuessGrid');
  container.innerHTML = dfGuesses.map(g => `
    <div class="fruit-guess-box ${g.correct ? 'green' : 'red'}">
      <div class="fruit-guess-name">${escapeHtml(g.name)}</div>
      <div class="fruit-guess-fruit">${escapeHtml(g.fruitDisplay)}</div>
    </div>
  `).join('');
}

function renderHintMessage() {
  const box = document.getElementById('fruitHintMessage');
  if (!dfActiveHint) {
    box.style.display = 'none';
    box.textContent = '';
    return;
  }
  box.textContent = dfActiveHint === 'type'
    ? fruitType(dfTarget)
    : (FRUIT_TRANSLATIONS[dfTarget] || '');
  box.style.display = 'block';
}

function updateHintButtons() {
  const typeBtn = document.getElementById('typeHintBtn');
  const translateBtn = document.getElementById('translateHintBtn');

  const typeRemaining = Math.max(0, 4 - dfTries);
  const translateRemaining = Math.max(0, 7 - dfTries);

  const typeUnlocked = dfWon || typeRemaining === 0;
  const translateUnlocked = dfWon || translateRemaining === 0;

  if (!typeUnlocked) {
    typeBtn.textContent = `Type hint (${typeRemaining})`;
    typeBtn.disabled = true;
    typeBtn.classList.remove('hint-ready');
  } else {
    typeBtn.textContent = 'Type hint';
    typeBtn.disabled = false;
    typeBtn.classList.add('hint-ready');
  }

  if (!translateUnlocked) {
    translateBtn.textContent = `Translate hint (${translateRemaining})`;
    translateBtn.disabled = true;
    translateBtn.classList.remove('hint-ready');
  } else {
    translateBtn.textContent = 'Translate hint';
    translateBtn.disabled = false;
    translateBtn.classList.add('hint-ready');
  }

  renderHintMessage();
}

function toggleHint(kind) {
  dfActiveHint = dfActiveHint === kind ? null : kind;
  renderHintMessage();
  persistFruitSession();
}

function showFruitWin(guessedName, owners) {
  const banner = document.getElementById('fruitWinBanner');
  const others = owners.filter(n => n !== guessedName);
  const extra = others.length > 0
    ? `<p>${escapeHtml(others.join(' and '))} ${others.length === 1 ? 'was' : 'were'} also acceptable btw.</p>`
    : '';
  const isFirstTry = dfTries === 1;
  const specialLine = isFirstTry
    ? `<p>One shot. Nice memory. I'm impressed.</p>`
    : '';
  const refreshLine = isFirstTry
    ? `<p>Refresh. See you next one-shot.</p>`
    : `<p>Now do it again. Refresh. Now.</p>`;
  banner.innerHTML = `
    <h2>${escapeHtml(guessedName)} was guessed in ${dfTries} ${dfTries === 1 ? 'try' : 'tries'}</h2>
    ${extra}
    ${specialLine}
    ${refreshLine}
  `;
  banner.style.display = 'block';
  document.getElementById('fruitSearch').disabled = true;
}

function submitFruitGuess(character) {
  if (dfWon) return;
  dfGuessedNames.add(character.name);
  dfTries += 1;
  const owners = FRUIT_MAP[dfTarget] || [];
  const correct = owners.includes(character.name);
  dfGuesses.unshift({
    name: character.name,
    fruitDisplay: formatFruitDisplay(character.devilFruitName),
    correct
  });
  renderFruitGuesses();
  updateHintButtons();

  document.getElementById('fruitSearch').value = '';
  hideFruitSuggestions();

  if (correct) {
    dfWon = true;
    showFruitWin(character.name, owners);
    updateHintButtons();
  }

  persistFruitSession();
}

function hideFruitSuggestions() {
  document.getElementById('fruitSuggestions').innerHTML = '';
  document.getElementById('fruitSuggestions').style.display = 'none';
  dfCurrentMatches = [];
}

function renderFruitSuggestions(query) {
  const box = document.getElementById('fruitSuggestions');
  if (!query.trim()) {
    hideFruitSuggestions();
    return;
  }
  const matches = ALL_CHARACTERS
    .filter(c => !dfGuessedNames.has(c.name))
    .filter(c => nameMatches(c, query))
    .slice(0, 8);

  dfCurrentMatches = matches;

  if (matches.length === 0) {
    hideFruitSuggestions();
    return;
  }

  box.innerHTML = matches.map(c =>
    `<div class="suggestion-item" data-name="${escapeHtml(c.name)}">${escapeHtml(c.name)}</div>`
  ).join('');
  box.style.display = 'block';

  box.querySelectorAll('.suggestion-item').forEach(el => {
    el.addEventListener('click', () => {
      const character = ALL_CHARACTERS.find(c => c.name === el.dataset.name);
      if (character) submitFruitGuess(character);
    });
  });
}

function initFruitSearch() {
  const input = document.getElementById('fruitSearch');
  input.addEventListener('input', () => renderFruitSuggestions(input.value));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (dfCurrentMatches.length > 0) submitFruitGuess(dfCurrentMatches[0]);
    }
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#fruitSection .practice-search-wrap')) hideFruitSuggestions();
  });
}

function initHintButtons() {
  const typeBtn = document.getElementById('typeHintBtn');
  const translateBtn = document.getElementById('translateHintBtn');
  typeBtn.addEventListener('click', () => { if (!typeBtn.disabled) toggleHint('type'); });
  translateBtn.addEventListener('click', () => { if (!translateBtn.disabled) toggleHint('translate'); });
}

function initModeToggle() {
  const classicBtn = document.getElementById('modeClassicBtn');
  const fruitBtn = document.getElementById('modeFruitBtn');
  const classicSection = document.getElementById('classicSection');
  const fruitSection = document.getElementById('fruitSection');

  function showClassic() {
    classicBtn.classList.add('active');
    fruitBtn.classList.remove('active');
    classicSection.style.display = 'block';
    fruitSection.style.display = 'none';
    sessionStorage.setItem(MODE_KEY, 'classic');
  }
  function showFruit() {
    fruitBtn.classList.add('active');
    classicBtn.classList.remove('active');
    fruitSection.style.display = 'block';
    classicSection.style.display = 'none';
    sessionStorage.setItem(MODE_KEY, 'fruit');
  }

  classicBtn.addEventListener('click', showClassic);
  fruitBtn.addEventListener('click', showFruit);

  if (sessionStorage.getItem(MODE_KEY) === 'fruit') {
    showFruit();
  } else {
    showClassic();
  }
}

function startNewFruitSession() {
  dfTarget = pickRandomFruit();
  dfGuesses = [];
  dfGuessedNames = new Set();
  dfTries = 0;
  dfWon = false;
  dfActiveHint = null;
  document.getElementById('fruitPromptName').textContent = dfTarget;
  document.getElementById('fruitWinBanner').style.display = 'none';
  document.getElementById('fruitSearch').disabled = false;
  renderFruitGuesses();
  updateHintButtons();
  persistFruitSession();
}

function restoreFruitSession(saved) {
  dfTarget = saved.target;
  dfGuesses = saved.guesses;
  dfGuessedNames = new Set(dfGuesses.map(g => g.name));
  dfTries = saved.tries;
  dfWon = saved.won;
  dfActiveHint = saved.activeHint;
  document.getElementById('fruitPromptName').textContent = dfTarget;
  renderFruitGuesses();
  updateHintButtons();
  if (dfWon) {
    const owners = FRUIT_MAP[dfTarget] || [];
    showFruitWin(dfGuesses[0].name, owners);
  }
}

async function loadData() {
  const response = await fetch('characters.json');
  ALL_CHARACTERS = await response.json();
}

async function init() {
  initTheme();
  initSearch();
  initFruitSearch();
  initModeToggle();
  initHintButtons();
  initClassicHintButtons();
  await loadData();
  buildFruitData();

  const reload = isReloadNavigation();

  const savedClassic = sessionStorage.getItem(SESSION_KEY);
  if (!reload && savedClassic) {
    restoreSession(JSON.parse(savedClassic));
  } else {
    sessionStorage.removeItem(SESSION_KEY);
    startNewSession();
  }

  const savedFruit = sessionStorage.getItem(DF_SESSION_KEY);
  if (!reload && savedFruit) {
    restoreFruitSession(JSON.parse(savedFruit));
  } else {
    sessionStorage.removeItem(DF_SESSION_KEY);
    startNewFruitSession();
  }
}

init();
