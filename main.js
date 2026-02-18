const dom = {
  count: document.getElementById('count'),
  group: document.getElementById('group'),
  tone: document.getElementById('tone'),
  seed: document.getElementById('seed'),
  generateBtn: document.getElementById('generateBtn'),
  copyBtn: document.getElementById('copyBtn'),
  resultList: document.getElementById('resultList'),
  status: document.getElementById('status'),
  themeToggle: document.getElementById('themeToggle')
};

const state = {
  lastResults: []
};

const preferredTheme = localStorage.getItem('theme');
if (preferredTheme) {
  document.body.classList.toggle('dark', preferredTheme === 'dark');
  dom.themeToggle.textContent = preferredTheme === 'dark' ? '화이트 모드' : '다크 모드';
}

dom.themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  dom.themeToggle.textContent = isDark ? '화이트 모드' : '다크 모드';
});

dom.generateBtn.addEventListener('click', () => {
  const count = clamp(Number(dom.count.value) || 1, 1, 10);
  const group = dom.group.value;
  const tone = dom.tone.value;
  const seed = dom.seed.value.trim();

  const results = generateRecommendations(count, group, tone, seed);
  state.lastResults = results;
  renderResults(results);
  dom.copyBtn.disabled = results.length === 0;
  dom.status.textContent = `${results.length}세트 생성 완료`;
});

dom.copyBtn.addEventListener('click', async () => {
  if (!state.lastResults.length) return;
  const text = state.lastResults
    .map((item, index) => `${index + 1}세트: ${item.group}조 ${item.number}`)
    .join('\n');
  await navigator.clipboard.writeText(text);
  dom.status.textContent = '클립보드에 복사됨';
});

function renderResults(results) {
  dom.resultList.innerHTML = '';
  if (!results.length) {
    const p = document.createElement('p');
    p.className = 'placeholder';
    p.textContent = '추천 번호를 생성하면 이곳에 표시됩니다.';
    dom.resultList.appendChild(p);
    return;
  }

  results.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'result-card';
    const title = document.createElement('h3');
    title.textContent = `${index + 1}세트`;
    const num = document.createElement('p');
    num.textContent = `${item.group}조 ${item.number}`;
    card.appendChild(title);
    card.appendChild(num);
    dom.resultList.appendChild(card);
  });
}

function generateRecommendations(count, group, tone, seed) {
  const results = [];
  const baseSeed = hashString(seed || String(Date.now()));

  for (let i = 0; i < count; i += 1) {
    const mix = baseSeed + i * 9973;
    const rng = mulberry32(mix);
    const groupNumber = group === 'random' ? 1 + Math.floor(rng() * 5) : Number(group);
    const number = generateNumber(rng, tone);
    results.push({ group: groupNumber, number });
  }

  return results;
}

function generateNumber(rng, tone) {
  let digits = [];
  for (let i = 0; i < 6; i += 1) {
    digits.push(Math.floor(rng() * 10));
  }

  if (tone === 'bold') {
    digits = digits.map((d) => (d + 5) % 10);
  } else if (tone === 'lucky') {
    digits[0] = (digits[0] + 7) % 10;
    digits[5] = (digits[5] + 3) % 10;
  }

  return digits.join('').padStart(6, '0');
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function hashString(value) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return hash >>> 0;
}

function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

renderResults([]);
