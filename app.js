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
  "Marshall D. Teach (Blackbeard)", "Jesus Burgess", "Kuzan",
  // Big Mom Pirates
  "Charlotte Linlin (Big Mom)", "Charlotte Katakuri", "Charlotte Perospero",
  "Charlotte Brulee", "Charlotte Mont d'Or", "Charlotte Pudding", "Pekoms",
  // Beasts Pirates
  "Kaido", "Ulti",
  // Donquixote Pirates
  "Donquixote Doflamingo (Joker)", "Diamante", "Pica", "Senor Pink", "Bellamy", "Monet",
  // Revolutionary Army
  "Monkey D. Dragon", "Sabo", "Bartholomew Kuma (PX-0)", "Emporio Ivankov", "Koala",
  // Heart Pirates
  "Trafalgar Law", "Bepo",
  // Kid Pirates
  "Eustass Kid", "Killer",
  // Kuja
  "Boa Hancock",
  // Cross Guild
  "Dracule Mihawk", "Buggy", "Crocodile (Mr.0)", "Daz Bones", "Galdino (Mr.3)",
  // Marines
  "Sengoku", "Monkey D. Garp", "Sakazuki (Akainu)", "Borsalino (Kizaru)", "Smoker", "Tashigi",
  "Koby", "Issho", "Donquixote Rosinante (Corazon)", "Bellemere",
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
  "Gecko Moria", "Hogback", "Shimotsu Ryuma", "Oars",
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
        if (b.bountyValue !== a.bountyValue) return b.bountyValue - a.bountyValue;
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
        ${fieldRow('Devil Fruit Name', c.devilFruitName)}
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
    listEl.innerHTML = `<div class="no-results">No characters match your search.</div>`;
    return;
  }

  let html = '';

  const isSearching = query.length > 0;

  if (isSearching) {
    html = sorted.map(renderCharacter).join('');
  } else if (currentSort === 'firstArc') {
    
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
  if (saved === 'light') {
    document.body.classList.add('light');
    toggle.textContent = 'Dark Mode';
  }
  toggle.addEventListener('click', () => {
    const isLight = document.body.classList.toggle('light');
    toggle.textContent = isLight ? 'Dark Mode' : 'Light Mode';
    localStorage.setItem('oplde-theme', isLight ? 'light' : 'dark');
  });
}

function initControls() {
  document.getElementById('searchBox').addEventListener('input', render);

  document.getElementById('sortSelect').addEventListener('change', (e) => {
    currentSort = e.target.value;
    render();
  });

  const cleanBtn = document.getElementById('viewClean');
  const lineBtn = document.getElementById('viewLine');
  cleanBtn.addEventListener('click', () => {
    currentView = 'clean';
    cleanBtn.classList.add('active');
    lineBtn.classList.remove('active');
    render();
  });
  lineBtn.addEventListener('click', () => {
    currentView = 'line';
    lineBtn.classList.add('active');
    cleanBtn.classList.remove('active');
    render();
  });
}

async function loadData() {
  const response = await fetch('characters.json');
  const data = await response.json();
  data.forEach(c => { c._haystack = buildHaystack(c); });
  ALL_CHARACTERS = data;
}

async function init() {
  initTheme();
  initControls();
  await loadData();
  render();
}

init();
