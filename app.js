let ALL_CHARACTERS = [];
let currentView = 'clean'; // 'line' 
let currentSort = 'firstArc';



/* liste de l'ordre d'affichage */
   
const MASTER_IMPORTANCE = [
  // Straw Hat Pirates
  "Monkey D. Luffy", "Roronoa Zoro", "Nami", "Usopp", "Sanji",
  "Tony Tony Chopper", "Nico Robin", "Franky", "Brook", "Jinbe",
  // Roger Pirates
  "Gol D. Roger", "Silvers Rayleigh",
  // Red Hair Pirates
  "Shanks", "Benn Beckman",
  // Whitebeard Pirates
  "Edward Newgate (Whitebeard)", "Marco", "Portgas D. Ace",
  // Blackbeard Pirates
  "Marshall D. Teach (Blackbeard)", "Jesus Burgess", "Kuzan (Aokiji)",
  // Big Mom Pirates
  "Charlotte Linlin (Big Mom)", "Charlotte Katakuri", "Charlotte Perospero",
  "Charlotte Brulee", "Charlotte Mont d'Or", "Charlotte Pudding", "Pekoms",
  // Beasts Pirates
  "Kaido", "Ulti",
  // Donquixote Pirates
  "Donquixote Doflamingo (Joker)", "Diamante", "Pica", "Senor Pink", "Bellamy", "Monet",
  // Revolutionary Army
  "Monkey D. Dragon", "Sabo", "Bartholomew Kuma", "Emporio Ivankov", "Koala",
  // Heart Pirates
  "Trafalgar Law", "Bepo",
  // Kid Pirates
  "Eustass Kid", "Killer",
  // Kuja
  "Boa Hancock",
  // Cross Guild
  "Dracule Mihawk", "Buggy", "Crocodile", "Daz Bones", "Galdino (Mr.3)",
  // Marines
  "Sengoku", "Monkey D. Garp", "Sakazuki (Akainu)", "Borsalino (Kizaru)", "Smoker", "Tashigi",
  "Koby", "Issho (Fujitora)", "Donquixote Rosinante (Corazon)", "Bellemere",
  // CP0
  "Rob Lucci", "Kaku", "Kalifa", "Blueno", "Jabra", "Spandam",
  // Kozuki Family
  "Kozuki Oden", "Kin'emon", "Kozuki Momonosuke", "Kozuki Hiyori (Komurasaki)",
  "Kikunojo (O-Kiku)", "Denjiro", "Kawamatsu", "Raizo",
  // Mokomo Dukedom
  "Inuarashi", "Nekomamushi", "Pedro", "Wanda", "Carrot",
  // Vinsmoke Family
  "Vinsmoke Judge", "Vinsmoke Reiju",
  // Kurozumi Family
  "Kurozumi Kanjuro", "Kurozumi Tama",
  // Thriller Bark Pirates
  "Gecko Moria", "Hogback", "Shimotsuki Ryuma", "Oars",
  // Misc notable
  "Yamato"
];

function importanceRank(character) {
  const idx = MASTER_IMPORTANCE.indexOf(character.name);
  if (idx !== -1) return idx;
  return 100000 + character.orderIndex;
}




const DEVIL_FRUIT_TYPE_ORDER = ["Logia", "Zoan", "Paramecia", "None"];
const ORIGIN_ORDER = [
  "East Blue", "West Blue", "North Blue", "South Blue",
  "Grand Line", "Calm Belt", "Sky Islands", "Red Line", "Unknown"
];

function orderIndexOf(list, value) {
  const i = list.indexOf(value);
  return i === -1 ? list.length : i;
}

const UNKNOWN_BOUNTY_NAMES = new Set(["Monkey D. Dragon", "Silvers Rayleigh", "Koala", "Benn Beckman", "Zeff"]);
const UNKNOWN_CROSS_GUILD_BOUNTY_NAMES = new Set(["Smoker", "Sengoku", "Tashigi"]);

function bountyGroupRank(character) {
  if (character.bountyValue > 0) return 0;
  if (UNKNOWN_BOUNTY_NAMES.has(character.name)) return 1;
  if (UNKNOWN_CROSS_GUILD_BOUNTY_NAMES.has(character.name)) return 2;
  return 3;
}

function bountyGroupLabel(rank) {
  const map = {
    0: "Has a Bounty",
    1: "Unknown Bounty",
    2: "Unknown Cross Guild Bounty",
    3: "No Bounty"
  };
  return map[rank];
}

function hakiScore(character) {
  const set = new Set(character.haki);
  let score = 0;
  if (set.has("Conqueror's")) score += 100;
  if (set.has("Armament")) score += 10;
  if (set.has("Observation")) score += 1;
  return score;
}

function hakiTierLabel(score) {
  const map = {
    111: "Observation + Armament + Conqueror's",
    110: "Armament + Conqueror's",
    101: "Observation + Conqueror's",
    11: "Observation + Armament",
    10: "Armament only",
    1: "Observation only",
    0: "No Haki"
  };
  return map[score] || "Other";
}




function computeAffiliationGroupOrder(characters) {
  const bestRank = new Map();
  characters.forEach(c => {
    const key = c.affiliation;
    const rank = importanceRank(c);
    if (!bestRank.has(key) || rank < bestRank.get(key)) {
      bestRank.set(key, rank);
    }
  });
  return bestRank;
}




function getComparator(sortMode, characters) {
  switch (sortMode) {
    case 'firstArc':
      return (a, b) => a.orderIndex - b.orderIndex;

    case 'affiliation': {
      const groupRank = computeAffiliationGroupOrder(characters);
      return (a, b) => {
        const ga = groupRank.get(a.affiliation);
        const gb = groupRank.get(b.affiliation);
        if (ga !== gb) return ga - gb;
        if (a.affiliation !== b.affiliation) return a.affiliation.localeCompare(b.affiliation);
        return importanceRank(a) - importanceRank(b);
      };
    }

    case 'devilFruitType':
      return (a, b) => {
        const ta = orderIndexOf(DEVIL_FRUIT_TYPE_ORDER, a.devilFruitType);
        const tb = orderIndexOf(DEVIL_FRUIT_TYPE_ORDER, b.devilFruitType);
        if (ta !== tb) return ta - tb;
        return importanceRank(a) - importanceRank(b);
      };

    case 'haki':
      return (a, b) => {
        const sa = hakiScore(a), sb = hakiScore(b);
        if (sa !== sb) return sb - sa; // higher score first
        return importanceRank(a) - importanceRank(b);
      };

    case 'devilFruit':
      return (a, b) => {
        const fa = a.devilFruitName !== '∅' ? 0 : 1;
        const fb = b.devilFruitName !== '∅' ? 0 : 1;
        if (fa !== fb) return fa - fb;
        const ta = orderIndexOf(DEVIL_FRUIT_TYPE_ORDER, a.devilFruitType);
        const tb = orderIndexOf(DEVIL_FRUIT_TYPE_ORDER, b.devilFruitType);
        if (ta !== tb) return ta - tb;
        return importanceRank(a) - importanceRank(b);
      };

    case 'height':
      return (a, b) => {
        if (b.heightCm !== a.heightCm) return b.heightCm - a.heightCm;
        return importanceRank(a) - importanceRank(b);
      };

    case 'bounty':
      return (a, b) => {
        const ga = bountyGroupRank(a), gb = bountyGroupRank(b);
        if (ga !== gb) return ga - gb;
        if (ga === 0 && b.bountyValue !== a.bountyValue) return b.bountyValue - a.bountyValue;
        return importanceRank(a) - importanceRank(b);
      };

    case 'origin':
      return (a, b) => {
        const oa = orderIndexOf(ORIGIN_ORDER, a.origin);
        const ob = orderIndexOf(ORIGIN_ORDER, b.origin);
        if (oa !== ob) return oa - ob;
        return importanceRank(a) - importanceRank(b);
      };

    default:
      return (a, b) => a.orderIndex - b.orderIndex;
  }
}




function groupLabelFor(sortMode, character) {
  switch (sortMode) {
    case 'affiliation':
      return character.affiliation;
    case 'devilFruitType':
      return character.devilFruitType === 'None' ? 'No Devil Fruit' : character.devilFruitType;
    case 'haki':
      return hakiTierLabel(hakiScore(character));
    case 'devilFruit':
      return character.devilFruitName !== '∅' ? 'Has Devil Fruit' : 'No Devil Fruit';
    case 'origin':
      return character.origin;
    case 'bounty':
      return bountyGroupLabel(bountyGroupRank(character));
    default:
      return null; // firstArc handled separately (two-level saga/arc), height/bounty have no headings
  }
}



function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildHaystack(c) {
  return [
    c.name, c.gender, c.affiliation, c.devilFruitType, c.hakiRaw,
    c.bounty, c.height, c.origin, c.arc, c.saga, c.devilFruitName
  ].join(' | ').toLowerCase();
}

function matchesQuery(character, query) {
  if (!query) return true;
  const escaped = escapeRegex(query.trim().toLowerCase());
  if (!escaped) return true;
  const regex = new RegExp('\\b' + escaped);
  return regex.test(character._haystack);
}



   
function fieldRow(label, value) {
  return `<div class="field-label">${label}</div><div class="field-value">${escapeHtml(value)}</div>`;
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

function formatDevilFruitCell(raw) {
  if (raw === '∅') return escapeHtml('∅');
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
      html += `<div class="df-jp">[${escapeHtml(jp)}]${escapeHtml(note)}</div>`;
      if (en) html += `<div class="df-en">${escapeHtml(en)}</div>`;
    }
  });
  return html;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function renderCleanCard(c) {
  return `
    <div class="char-card">
      <div class="char-name">${escapeHtml(c.name)}</div>
      <div class="char-fields">
        ${fieldRow('Gender', c.gender)}
        ${fieldRow('Affiliation', c.affiliation)}
        ${fieldRow('Fruit type', c.devilFruitType)}
        ${fieldRow('Haki', c.hakiRaw)}
        ${fieldRow('Last Bounty', c.bounty)}
        ${fieldRow('Height', c.height)}
        ${fieldRow('Origin', c.origin)}
        ${fieldRow('First Arc', c.arc)}
        <div class="field-label">Devil Fruit Name</div><div class="field-value">${formatDevilFruitCell(c.devilFruitName)}</div>
      </div>
    </div>
  `;
}

function renderLineCard(c) {
  const line = [
    c.name, c.gender, c.affiliation, c.devilFruitType, c.hakiRaw,
    c.bounty, c.height, c.origin, c.arc, c.devilFruitName
  ].join(' | ');
  return `<div class="char-line">${escapeHtml(line)}</div>`;
}

function renderCharacter(c) {
  return currentView === 'clean' ? renderCleanCard(c) : renderLineCard(c);
}

function render() {
  const query = document.getElementById('searchBox').value.trim();
  const listEl = document.getElementById('characterList');
  const countEl = document.getElementById('resultCount');

  const filtered = ALL_CHARACTERS.filter(c => matchesQuery(c, query));
  const comparator = getComparator(currentSort, filtered);
  const sorted = [...filtered].sort(comparator);

  countEl.textContent = `${sorted.length} character${sorted.length === 1 ? '' : 's'} shown`;

  if (sorted.length === 0) {
    const isLight = document.body.classList.contains('light');
    const noResultsMessage = isLight ? "Too bright. Can't see anything... (× × )" : 'The void... (・・ )';
    listEl.innerHTML = `<div class="no-results">${escapeHtml(noResultsMessage)}</div>`;
    return;
  }

  let html = '';

  const isSearching = query.length > 0;

  if (currentSort === 'firstArc') {
    if (isSearching) {
      html = sorted.map(renderCharacter).join('');
    } else {
      let lastSaga = null;
      let lastArc = null;
      sorted.forEach(c => {
        if (c.saga !== lastSaga) {
          html += `<div class="saga-heading">${escapeHtml(c.saga)}</div>`;
          lastSaga = c.saga;
          lastArc = null;
        }
        if (c.arc !== lastArc) {
          html += `<div class="arc-heading">${escapeHtml(c.arc)}</div>`;
          lastArc = c.arc;
        }
        html += renderCharacter(c);
      });
    }
  } else {
    let lastGroup = Symbol('init');
    sorted.forEach(c => {
      const label = groupLabelFor(currentSort, c);
      if (label !== null && label !== lastGroup) {
        html += `<div class="saga-heading">${escapeHtml(label)}</div>`;
        lastGroup = label;
      }
      html += renderCharacter(c);
    });
  }

  listEl.innerHTML = html;
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
    render();
    localStorage.setItem('oplde-theme', isLight ? 'light' : 'dark');
  });
}

const VIEW_KEY = 'oplde-list-view';
const SEARCH_KEY = 'oplde-list-search';
const SORT_KEY = 'oplde-list-sort';

function isReloadNavigation() {
  const entries = performance.getEntriesByType('navigation');
  if (entries.length > 0) return entries[0].type === 'reload';
  return !!(performance.navigation && performance.navigation.type === 1);
}

function applyView(view) {
  currentView = view;
  document.getElementById('viewClean').classList.toggle('active', view === 'clean');
  document.getElementById('viewLine').classList.toggle('active', view === 'line');
}

function initControls() {
  document.getElementById('searchBox').addEventListener('input', (e) => {
    sessionStorage.setItem(SEARCH_KEY, e.target.value);
    render();
  });

  document.getElementById('sortSelect').addEventListener('change', (e) => {
    currentSort = e.target.value;
    sessionStorage.setItem(SORT_KEY, currentSort);
    render();
  });

  const cleanBtn = document.getElementById('viewClean');
  const lineBtn = document.getElementById('viewLine');
  cleanBtn.addEventListener('click', () => {
    applyView('clean');
    sessionStorage.setItem(VIEW_KEY, 'clean');
    render();
  });
  lineBtn.addEventListener('click', () => {
    applyView('line');
    sessionStorage.setItem(VIEW_KEY, 'line');
    render();
  });

  const savedView = sessionStorage.getItem(VIEW_KEY);
  applyView(savedView === 'line' ? 'line' : 'clean');
}

function restoreSearchAndSort() {
  const searchBox = document.getElementById('searchBox');
  const sortSelect = document.getElementById('sortSelect');

  if (isReloadNavigation()) {
    sessionStorage.removeItem(SEARCH_KEY);
    sessionStorage.removeItem(SORT_KEY);
    searchBox.value = '';
    currentSort = 'firstArc';
    sortSelect.value = 'firstArc';
    return;
  }

  const savedSearch = sessionStorage.getItem(SEARCH_KEY);
  const savedSort = sessionStorage.getItem(SORT_KEY);
  if (savedSearch !== null) searchBox.value = savedSearch;
  if (savedSort !== null) {
    currentSort = savedSort;
    sortSelect.value = savedSort;
  }
}

async function loadData() {
  const response = await fetch('characters.json');
  const data = await response.json();
  data.forEach(c => { c._haystack = buildHaystack(c); });
  ALL_CHARACTERS = data;
}

function updatePracticeHighlight() {
  const link = document.querySelector('a[href="practice.html"]');
  if (!link) return;
  try {
    const keys = ['oplde-practice-session', 'oplde-devilfruit-session'];
    for (const key of keys) {
      const saved = sessionStorage.getItem(key);
      if (saved) {
        const data = JSON.parse(saved);
        if (!data.won && data.tries > 0) {
          link.classList.add('practice-active');
          return;
        }
      }
    }
  } catch (e) {}
  link.classList.remove('practice-active');
}

async function init() {
  initTheme();
  initControls();
  restoreSearchAndSort();
  updatePracticeHighlight();
  await loadData();
  render();
}

init();



/*test très moyennement important*/

function colorizeText(text) {
  let coloredText = '';
  let currentIndex = 0;
  function getNextColor() {
    const colors = [
      [255, 0, 0],
      [0, 255, 0],
      [0, 0, 255]
    ];
    currentIndex = (currentIndex + 1) % colors.length;
    return colors[currentIndex];
  }
  function updateColors() {
    for (let i = 0; i < text.length; i++) {
      const randomColor = getNextColor();
      coloredText += `\x1b[38;2;${randomColor[0]};${randomColor[1]};${randomColor[2]}m${text[i]}\x1b[0m`;
    }
    console.clear();
    console.log(coloredText);
    coloredText = '';
  }
  setInterval(updateColors, 500);
}
colorizeText("ඞ".repeat(50));