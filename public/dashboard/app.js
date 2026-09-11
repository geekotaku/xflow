// ── i18n strings ────────────────────────────────────────────────
const I18N = {
  zh: {
    title:      '流量统计',
    sub:        '按用户 / 节点 / 时间范围筛选自建节点的流量数据',
    labelUser:  '用户',
    labelNode:  '节点',
    labelStart: '起始日期',
    labelEnd:   '结束日期',
    optAll:     '全部',
    applyBtn:   '应用',
    thTime:     '时间',
    thUser:     '用户',
    thNode:     '节点',
    thUp:       '上行',
    thDown:     '下行',
    thTotal:    '合计',
    empty:      '所选范围内没有数据',
    themeAuto:  '自动',
    themeLight: '亮色',
    themeDark:  '暗色',
    langAuto:   '自动',
    granDay:    '按天',
    granHour:   '按小时',
    prev:       '上一页',
    next:       '下一页',
    pageInfo:   (cur, total) => `第 ${cur} / ${total} 页`,
    thId:       '#',
    goto:       '前往',
    pageSuffix: '页',
    pageSize:   s => `${s}条/页`,
    totalRecords: n => `共 ${n} 条记录`,
    viewUser:   '按用户',
    viewNode:   '按节点',
    viewTotal:  '总流量',
    uplink:     '上行',
    downlink:   '下行',
  },
  en: {
    title:      'Traffic Stats',
    sub:        'Filter traffic data by user / node / date range',
    labelUser:  'User',
    labelNode:  'Node',
    labelStart: 'Start Date',
    labelEnd:   'End Date',
    optAll:     'All',
    applyBtn:   'Apply',
    thTime:     'Time',
    thUser:     'User',
    thNode:     'Node',
    thUp:       'Upload',
    thDown:     'Download',
    thTotal:    'Total',
    empty:      'No data in selected range',
    themeAuto:  'Auto',
    themeLight: 'Light',
    themeDark:  'Dark',
    langAuto:   'Auto',
    granDay:    'Daily',
    granHour:   'Hourly',
    prev:       'Prev',
    next:       'Next',
    pageInfo:   (cur, total) => `Page ${cur} / ${total}`,
    thId:       '#',
    goto:       'Go to',
    pageSuffix: '',
    pageSize:   s => `${s} / page`,
    totalRecords: n => `Total ${n} records`,
    viewUser:   'By User',
    viewNode:   'By Node',
    viewTotal:  'Total',
    uplink:     'Upload',
    downlink:   'Download',
  },
};

// ── State ────────────────────────────────────────────────────────
let currentLang     = localStorage.getItem('xflow-lang') || 'en';
let currentTheme    = localStorage.getItem('xflow-theme') || 'auto';
let currentView     = 'user'; // 'user' | 'node' | 'total'
let cachedStatsData = null;
let chart           = null;
let recordsPage     = 1;
let recordsPageSize = 10;
let recordsTotal    = 0;
let recordsPages    = 1;

// ── Helpers ──────────────────────────────────────────────────────
function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  return `${(bytes / 1024 ** i).toFixed(2)} ${units[i]}`;
}

function isoDate(d) { return d.toISOString().slice(0, 10); }

function resolvedLang() {
  if (currentLang !== 'auto') return currentLang;
  return navigator.language?.startsWith('zh') ? 'zh' : 'en';
}

function t(key, ...args) {
  const v = I18N[resolvedLang()]?.[key];
  return typeof v === 'function' ? v(...args) : (v ?? key);
}

/** Format a UTC ISO string (reported_at) in local timezone */
function formatTimestamp(iso) {
  const d = new Date(iso);
  if (resolvedLang() === 'zh') {
    const mo = d.getMonth() + 1;
    const dy = d.getDate();
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${mo}月${dy}日 ${hh}:${mm}`;
  } else {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: false,
    }).format(d);
  }
}

// ── Palette ──────────────────────────────────────────────────────
const PALETTE = [
  '#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ec4899',
  '#8b5cf6', '#3b82f6', '#14b8a6', '#84cc16', '#f97316',
  '#6366f1', '#e11d48', '#0284c7', '#059669', '#d97706'
];

function getColor(index) {
  return PALETTE[index % PALETTE.length];
}

// ── Dropdown helper ──────────────────────────────────────────────
function initDropdown(dropdownId, btnId) {
  const dropdown = document.getElementById(dropdownId);
  const btn      = document.getElementById(btnId);
  if (!dropdown || !btn) return null;
  btn.addEventListener('click', e => {
    e.stopPropagation();
    const isOpen = dropdown.classList.contains('open');
    closeAllDropdowns();
    if (!isOpen) {
      dropdown.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
  return dropdown;
}

function closeAllDropdowns() {
  document.querySelectorAll('.dropdown.open').forEach(d => {
    d.classList.remove('open');
    d.querySelector('.icon-btn')?.setAttribute('aria-expanded', 'false');
  });
}
document.addEventListener('click', closeAllDropdowns);

// ── Theme ────────────────────────────────────────────────────────
const THEME_ICONS = { auto: '🖥️', light: '☀️', dark: '🌙' };

function isDarkNow() {
  const theme = document.documentElement.getAttribute('data-theme');
  return theme === 'dark'
    || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
}

function getChartColors() {
  const dark = isDarkNow();
  return {
    grid:        dark ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.07)',
    tick:        dark ? '#8b90a8' : '#6b7080',
    tooltipBg:   dark ? '#1a1d2e' : '#ffffff',
    tooltipText: dark ? '#c8cbe0' : '#444',
  };
}

function applyTheme(theme) {
  currentTheme = theme;
  localStorage.setItem('xflow-theme', theme);
  document.documentElement.setAttribute('data-theme', theme);
  const icon = document.getElementById('themeBtnIcon');
  if (icon) icon.textContent = THEME_ICONS[theme];
  document.querySelectorAll('[data-theme-val]').forEach(item =>
    item.classList.toggle('active', item.dataset.themeVal === theme));
  if (cachedStatsData) renderChart(cachedStatsData);
}

initDropdown('themeDropdown', 'themeBtn');
document.getElementById('themeDropdown')?.addEventListener('click', e => {
  const item = e.target.closest('[data-theme-val]');
  if (item) { applyTheme(item.dataset.themeVal); closeAllDropdowns(); }
});

// ── Language ─────────────────────────────────────────────────────
const LANG_LABELS = { auto: '文A', zh: '中文', en: 'EN' };

function applyLang(lang) {
  currentLang = lang;
  localStorage.setItem('xflow-lang', lang);
  document.documentElement.lang = resolvedLang();
  const label = document.getElementById('langBtnLabel');
  if (label) label.textContent = LANG_LABELS[lang];
  document.querySelectorAll('[data-lang-val]').forEach(item =>
    item.classList.toggle('active', item.dataset.langVal === lang));

  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });

  const setTxt = (id, key) => {
    const el = document.getElementById(id);
    if (el) el.textContent = t(key);
  };

  setTxt('titleText',   'title');
  setTxt('subText',     'sub');
  setTxt('labelUser',   'labelUser');
  setTxt('labelNode',   'labelNode');
  setTxt('labelStart',  'labelStart');
  setTxt('labelEnd',    'labelEnd');
  setTxt('optAllUser',  'optAll');
  setTxt('optAllNode',  'optAll');
  setTxt('applyBtn',    'applyBtn');
  setTxt('thId',        'thId');
  setTxt('thTime',      'thTime');
  setTxt('thUser',      'thUser');
  setTxt('thNode',      'thNode');
  setTxt('thUp',        'thUp');
  setTxt('thDown',      'thDown');
  setTxt('thTotal',     'thTotal');
  setTxt('emptyState',  'empty');
  setTxt('viewBtnUser', 'viewUser');
  setTxt('viewBtnNode', 'viewNode');
  setTxt('viewBtnTotal','viewTotal');
  setTxt('labelGoto',   'goto');
  setTxt('labelPageSuffix', 'pageSuffix');

  const pageSizeSel = document.getElementById('pageSizeSelect');
  if (pageSizeSel) {
    Array.from(pageSizeSel.options).forEach(opt => {
      opt.textContent = t('pageSize', opt.value);
    });
  }

  const pagTotal = document.getElementById('pagTotal');
  if (pagTotal) {
    pagTotal.textContent = t('totalRecords', recordsTotal);
  }

  document.title = `xflow · ${t('title')}`;

  const badge = document.getElementById('granBadge');
  if (badge && cachedStatsData) {
    badge.textContent = cachedStatsData.hourly ? t('granHour') : t('granDay');
  }

  const pageInfo = document.getElementById('pageInfo');
  if (pageInfo && pageInfo._cur && pageInfo._tot) {
    pageInfo.textContent = t('pageInfo', pageInfo._cur, pageInfo._tot);
  }

  if (cachedStatsData) renderChart(cachedStatsData);
}

initDropdown('langDropdown', 'langBtn');
document.getElementById('langDropdown')?.addEventListener('click', e => {
  const item = e.target.closest('[data-lang-val]');
  if (item) { applyLang(item.dataset.langVal); closeAllDropdowns(); }
});

// ── Selects ──────────────────────────────────────────────────────
const userFilter = document.getElementById('userFilter');
const nodeFilter = document.getElementById('nodeFilter');
const startDate  = document.getElementById('startDate');
const endDate    = document.getElementById('endDate');
const applyBtn   = document.getElementById('applyBtn');
const emptyState = document.getElementById('emptyState');

async function loadMeta() {
  const res  = await fetch('/api/stats/meta');
  const meta = await res.json();
  for (const sel of [userFilter, nodeFilter]) {
    while (sel.options.length > 1) sel.remove(1);
  }
  for (const v of meta.users) {
    const o = document.createElement('option'); o.value = o.textContent = v;
    userFilter.appendChild(o);
  }
  for (const v of meta.nodes) {
    const o = document.createElement('option'); o.value = o.textContent = v;
    nodeFilter.appendChild(o);
  }
}

function buildQuery() {
  const p = new URLSearchParams();
  if (userFilter.value) p.set('user', userFilter.value);
  if (nodeFilter.value) p.set('node', nodeFilter.value);
  if (startDate.value)  p.set('start', new Date(startDate.value).toISOString());
  if (endDate.value) {
    const end = new Date(endDate.value);
    end.setUTCHours(23, 59, 59, 999);
    p.set('end', end.toISOString());
  }
  return p.toString();
}

// ── Chart ────────────────────────────────────────────────────────

/**
 * Parse a SQLite bucket string (UTC) and format in local timezone.
 * Daily "2026-09-10"    → zh: "9月10日"       en: "Sep 10"
 * Hourly "2026-09-10T14" → zh: "9月10日 22:00" en: "Sep 10 22:00"
 */
function formatBucket(bucket, hourly) {
  if (hourly) {
    const d = new Date(bucket + ':00:00Z');
    if (resolvedLang() === 'zh') {
      const m  = d.getMonth() + 1;
      const dy = d.getDate();
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      return `${m}月${dy}日 ${hh}:${mm}`;
    }
    return new Intl.DateTimeFormat('en-US', {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: false,
    }).format(d);
  } else {
    const d = new Date(bucket + 'T00:00:00Z');
    if (resolvedLang() === 'zh') {
      return `${d.getMonth() + 1}月${d.getDate()}日`;
    }
    return new Intl.DateTimeFormat('en-US', {
      month: 'short', day: 'numeric',
    }).format(d);
  }
}

/**
 * Render chart according to currentView ('user' | 'node' | 'total')
 */
function renderChart(data) {
  if (!data) return;
  const { hourly, byTimeUser = [], byTimeNode = [], byTimeTotal = [] } = data;
  const colors = getChartColors();

  // Determine buckets
  const bucketSet = new Set();
  const source = currentView === 'user' ? byTimeUser : (currentView === 'node' ? byTimeNode : byTimeTotal);
  source.forEach(r => bucketSet.add(r.bucket));

  // If source is empty, check others
  if (bucketSet.size === 0) {
    byTimeTotal.forEach(r => bucketSet.add(r.bucket));
    byTimeUser.forEach(r => bucketSet.add(r.bucket));
  }

  const buckets = [...bucketSet].sort();
  const labels  = buckets.map(b => formatBucket(b, hourly));

  let datasets = [];

  if (currentView === 'user') {
    const users = [...new Set(byTimeUser.map(r => r.user))];
    const lookup = {};
    for (const r of byTimeUser) {
      if (!lookup[r.bucket]) lookup[r.bucket] = {};
      lookup[r.bucket][r.user] = r.total;
    }
    datasets = users.map((user, idx) => ({
      label: user,
      data: buckets.map(b => lookup[b]?.[user] ?? 0),
      backgroundColor: getColor(idx),
      stack: 'traffic',
      borderRadius: 3,
      borderSkipped: false,
    }));
  } else if (currentView === 'node') {
    const nodes = [...new Set(byTimeNode.map(r => r.node))];
    const lookup = {};
    for (const r of byTimeNode) {
      if (!lookup[r.bucket]) lookup[r.bucket] = {};
      lookup[r.bucket][r.node] = r.total;
    }
    datasets = nodes.map((node, idx) => ({
      label: node,
      data: buckets.map(b => lookup[b]?.[node] ?? 0),
      backgroundColor: getColor(idx),
      stack: 'traffic',
      borderRadius: 3,
      borderSkipped: false,
    }));
  } else {
    // Total: Uplink and Downlink breakdown
    const lookup = {};
    for (const r of byTimeTotal) {
      lookup[r.bucket] = r;
    }
    datasets = [
      {
        label: t('uplink'),
        data: buckets.map(b => lookup[b]?.uplink ?? 0),
        backgroundColor: '#38bdf8',
        stack: 'traffic',
        borderRadius: 3,
        borderSkipped: false,
      },
      {
        label: t('downlink'),
        data: buckets.map(b => lookup[b]?.downlink ?? 0),
        backgroundColor: '#6366f1',
        stack: 'traffic',
        borderRadius: 3,
        borderSkipped: false,
      }
    ];
  }

  if (chart) chart.destroy();
  const canvas = document.getElementById('trafficChart');
  if (!canvas) return;

  const isMobile = window.innerWidth < 640;

  chart = new Chart(canvas, {
    type: 'bar',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: !isMobile,
      interaction: { mode: 'index', intersect: false },
      scales: {
        x: {
          stacked: true,
          grid:  { color: colors.grid },
          ticks: {
            color: colors.tick,
            maxRotation: isMobile ? 0 : 45,
            autoSkip: true,
            maxTicksLimit: isMobile ? 6 : 20,
            font: { size: isMobile ? 10 : 11 },
          },
        },
        y: {
          stacked: true,
          grid:  { color: colors.grid },
          ticks: {
            color: colors.tick,
            callback: v => formatBytes(v),
            font: { size: isMobile ? 10 : 11 },
            maxTicksLimit: isMobile ? 5 : 8,
          },
        },
      },
      plugins: {
        legend: {
          labels: {
            color: colors.tick,
            font: { family: "'Inter', sans-serif", size: 12 },
            boxWidth: 12, boxHeight: 12, borderRadius: 3,
          },
        },
        tooltip: {
          backgroundColor: colors.tooltipBg,
          titleColor:      colors.tooltipText,
          bodyColor:       colors.tooltipText,
          borderColor:     'rgba(128,128,128,.2)',
          borderWidth:     1,
          callbacks: {
            label:  ctx   => `${ctx.dataset.label}: ${formatBytes(ctx.raw)}`,
            footer: items => `Total: ${formatBytes(items.reduce((s, i) => s + i.raw, 0))}`,
          },
        },
      },
    },
  });

  const badge = document.getElementById('granBadge');
  if (badge) badge.textContent = hourly ? t('granHour') : t('granDay');
}

// ── View switch handler ──────────────────────────────────────────
document.getElementById('viewSwitch')?.addEventListener('click', e => {
  const btn = e.target.closest('.view-btn');
  if (!btn) return;
  const view = btn.dataset.view;
  if (!view || view === currentView) return;
  currentView = view;
  document.querySelectorAll('.view-btn').forEach(b => b.classList.toggle('active', b === btn));
  if (cachedStatsData) renderChart(cachedStatsData);
});

// ── Pagination helpers ───────────────────────────────────────────
function renderPageNumbers(cur, total) {
  const container = document.getElementById('pagNumbers');
  if (!container) return;
  container.innerHTML = '';

  if (total <= 1) return;

  const pages = [];
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    if (cur <= 4) {
      pages.push(1, 2, 3, 4, 5, '...', total);
    } else if (cur >= total - 3) {
      pages.push(1, '...', total - 4, total - 3, total - 2, total - 1, total);
    } else {
      pages.push(1, '...', cur - 1, cur, cur + 1, '...', total);
    }
  }

  for (const p of pages) {
    if (p === '...') {
      const span = document.createElement('span');
      span.className = 'pag-ellipsis';
      span.textContent = '•••';
      container.appendChild(span);
    } else {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'pag-num' + (p === cur ? ' active' : '');
      btn.textContent = p;
      if (p !== cur) {
        btn.addEventListener('click', () => loadRecords(p));
      }
      container.appendChild(btn);
    }
  }
}

function handleJumpPage() {
  const input = document.getElementById('jumpPageInput');
  if (!input) return;
  let p = parseInt(input.value, 10);
  if (isNaN(p) || p < 1) p = 1;
  if (p > recordsPages) p = recordsPages;
  if (p !== recordsPage) {
    loadRecords(p);
  } else {
    input.value = recordsPage;
  }
}

// ── Records table (paginated) ────────────────────────────────────
async function loadRecords(page = 1) {
  recordsPage = page;
  const q = buildQuery();
  const res = await fetch(`/api/stats/records?${q}&page=${page}&limit=${recordsPageSize}`);
  const data = await res.json();

  recordsTotal = data.total || 0;
  recordsPages = data.pages || 1;

  const tbody = document.querySelector('#userTable tbody');
  tbody.innerHTML = '';

  let idx = 0;
  for (const row of data.records) {
    const tr = document.createElement('tr');
    const total = row.uplink + row.downlink;
    const rowNum = (data.page - 1) * recordsPageSize + idx + 1;
    tr.innerHTML =
      `<td>${rowNum}</td>` +
      `<td>${formatTimestamp(row.reported_at)}</td>` +
      `<td>${row.user}</td>` +
      `<td>${row.node}</td>` +
      `<td>${formatBytes(row.uplink)}</td>` +
      `<td>${formatBytes(row.downlink)}</td>` +
      `<td><strong>${formatBytes(total)}</strong></td>`;
    tbody.appendChild(tr);
    idx++;
  }

  // Pad empty placeholder rows so table height stays constant across pages (avoids pagination button jumping)
  const emptyCount = recordsPageSize - (data.records?.length || 0);
  if (emptyCount > 0 && recordsPages > 1) {
    for (let i = 0; i < emptyCount; i++) {
      const tr = document.createElement('tr');
      tr.className = 'empty-row';
      tr.setAttribute('aria-hidden', 'true');
      tr.innerHTML = '<td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td>';
      tbody.appendChild(tr);
    }
  }

  // Update pagination controls
  const firstBtn = document.getElementById('firstBtn');
  const prevBtn  = document.getElementById('prevBtn');
  const nextBtn  = document.getElementById('nextBtn');
  const lastBtn  = document.getElementById('lastBtn');
  const pagTotal = document.getElementById('pagTotal');
  const jumpInput = document.getElementById('jumpPageInput');

  if (firstBtn) firstBtn.disabled = data.page <= 1;
  if (prevBtn)  prevBtn.disabled  = data.page <= 1;
  if (nextBtn)  nextBtn.disabled  = data.page >= recordsPages;
  if (lastBtn)  lastBtn.disabled  = data.page >= recordsPages;

  if (pagTotal) {
    pagTotal.textContent = t('totalRecords', recordsTotal);
  }

  if (jumpInput) {
    jumpInput.value = data.page;
    jumpInput.max = recordsPages;
  }

  renderPageNumbers(data.page, recordsPages);

  // Show pagination bar if there are records
  const pagBar = document.getElementById('paginationBar');
  if (pagBar) pagBar.style.display = recordsTotal > 0 ? 'flex' : 'none';
}

// ── Refresh ──────────────────────────────────────────────────────
async function refresh() {
  const res  = await fetch(`/api/stats?${buildQuery()}`);
  const data = await res.json();
  cachedStatsData = data;

  const hasData = (data.byTimeTotal && data.byTimeTotal.length > 0)
    || (data.byTimeUser && data.byTimeUser.length > 0)
    || (data.byUser && data.byUser.length > 0);

  document.getElementById('chartCard').style.display = hasData ? '' : 'none';
  document.getElementById('tableCard').style.display = hasData ? '' : 'none';
  emptyState.style.display = hasData ? 'none' : '';

  if (hasData) {
    // Smart view adjustment: if user specifically filtered a single user, default view to 'node'
    if (userFilter.value && currentView === 'user') {
      currentView = 'node';
      document.querySelectorAll('.view-btn').forEach(b =>
        b.classList.toggle('active', b.dataset.view === 'node'));
    } else if (nodeFilter.value && currentView === 'node') {
      currentView = 'user';
      document.querySelectorAll('.view-btn').forEach(b =>
        b.classList.toggle('active', b.dataset.view === 'user'));
    }

    renderChart(data);
    await loadRecords(1);
  }
}

applyBtn.addEventListener('click', () => { recordsPage = 1; refresh(); });

document.getElementById('pageSizeSelect')?.addEventListener('change', e => {
  recordsPageSize = Number(e.target.value);
  loadRecords(1);
});

document.getElementById('firstBtn')?.addEventListener('click', () => {
  if (recordsPage > 1) loadRecords(1);
});

document.getElementById('prevBtn')?.addEventListener('click', () => {
  if (recordsPage > 1) loadRecords(recordsPage - 1);
});

document.getElementById('nextBtn')?.addEventListener('click', () => {
  if (recordsPage < recordsPages) loadRecords(recordsPage + 1);
});

document.getElementById('lastBtn')?.addEventListener('click', () => {
  if (recordsPage < recordsPages) loadRecords(recordsPages);
});

document.getElementById('jumpPageInput')?.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    e.preventDefault();
    handleJumpPage();
  }
});
document.getElementById('jumpPageInput')?.addEventListener('blur', () => {
  handleJumpPage();
});

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (currentTheme === 'auto' && cachedStatsData) renderChart(cachedStatsData);
});

// ── Init ─────────────────────────────────────────────────────────
(async function init() {
  applyTheme(currentTheme);
  applyLang(currentLang);

  const today      = new Date();
  const monthStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
  startDate.value  = isoDate(monthStart);
  endDate.value    = isoDate(today);

  await loadMeta();
  await refresh();
})();
