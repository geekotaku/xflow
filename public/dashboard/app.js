// ── i18n strings ────────────────────────────────────────────────
const I18N = {
  zh: {
    title:      '自建节点流量统计',
    sub:        '汇总 Xray 节点与用户流量明细，提供多维数据分析并支持 Sub-Store 订阅同步',
    labelUser:  '用户',
    labelNode:  '节点',
    labelStart: '起始日期',
    labelEnd:   '结束日期',
    optAll:     '全部',
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
    drilldownBack: '返回日视图',
    drilldownHint: '💡 点击柱状图下钻按小时查看',
    labelPresets:    '快捷筛选',
    presetToday:     '今日',
    presetLast7:     '近 7 天',
    presetThisMonth: '本月',
    presetLastMonth: '上月',
    showDetails:     '显示详情',
    hideDetails:     '隐藏详情',
  },
  en: {
    title:      'Node Traffic Analytics',
    sub:        'Multi-dimensional Xray traffic analytics across nodes and users with Sub-Store integration',
    labelUser:  'User',
    labelNode:  'Node',
    labelStart: 'Start Date',
    labelEnd:   'End Date',
    optAll:     'All',
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
    drilldownBack: 'Back to Daily',
    drilldownHint: '💡 Click bar to view hourly detail',
    labelPresets:    'Quick Range',
    presetToday:     'Today',
    presetLast7:     'Last 7 Days',
    presetThisMonth: 'This Month',
    presetLastMonth: 'Last Month',
    showDetails:     'Show Details',
    hideDetails:     'Hide Details',
  },
};

// ── State ────────────────────────────────────────────────────────
let currentLang     = localStorage.getItem('xflow-lang') || 'auto';
let currentTheme    = localStorage.getItem('xflow-theme') || 'auto';
let currentView     = 'user'; // 'user' | 'node' | 'total'
let cachedStatsData = null;
let chart           = null;
let drilldownState  = null;
let recordsPage     = 1;
let recordsPageSize = 10;
let recordsTotal    = 0;
let recordsPages    = 1;
let showDetails     = false;

// ── Helpers ──────────────────────────────────────────────────────
function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  return `${(bytes / 1024 ** i).toFixed(2)} ${units[i]}`;
}

function isoDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

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
  setTxt('thId',        'thId');
  setTxt('thTime',      'thTime');
  setTxt('thUser',      'thUser');
  setTxt('thNode',      'thNode');
  setTxt('thUp',        'thUp');
  setTxt('thDown',      'thDown');
  setTxt('thTotal',     'thTotal');
  setTxt('emptyState',  'empty');
  setTxt('chartEmpty',  'empty');
  const emptyTd = document.querySelector('#userTable tbody tr td[colspan="7"]');
  if (emptyTd) emptyTd.textContent = t('empty');
  setTxt('viewBtnUser', 'viewUser');
  setTxt('viewBtnNode', 'viewNode');
  setTxt('viewBtnTotal','viewTotal');
  setTxt('drilldownBackLabel', 'drilldownBack');
  setTxt('labelGoto',   'goto');
  setTxt('labelPageSuffix', 'pageSuffix');
  setTxt('labelPresets',    'labelPresets');
  setTxt('presetToday',     'presetToday');
  setTxt('presetLast7',     'presetLast7');
  setTxt('presetThisMonth', 'presetThisMonth');
  setTxt('presetLastMonth', 'presetLastMonth');
  setTxt('toggleTableText', showDetails ? 'hideDetails' : 'showDetails');

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
  if (startDate.value) {
    const [y, m, d] = startDate.value.split('-').map(Number);
    const start = new Date(y, m - 1, d, 0, 0, 0, 0);
    p.set('start', start.toISOString());
  }
  if (endDate.value) {
    const [y, m, d] = endDate.value.split('-').map(Number);
    const end = new Date(y, m - 1, d, 23, 59, 59, 999);
    p.set('end', end.toISOString());
  }
  p.set('tz', String(-new Date().getTimezoneOffset()));
  return p.toString();
}

// ── Chart ────────────────────────────────────────────────────────

/**
 * Format a bucket string in local timezone.
 * Daily "2026-09-10"     → zh: "9月10日"       en: "Sep 10"
 * Hourly "2026-09-10T14" → zh: "9月10日 14:00" en: "Sep 10 14:00"
 */
function formatBucket(bucket, hourly) {
  if (hourly) {
    const [datePart, hourPart] = bucket.split('T');
    const [y, m, d] = (datePart || '').split('-').map(Number);
    const hh = (hourPart || '00').padStart(2, '0');
    if (resolvedLang() === 'zh') {
      return `${m}月${d}日 ${hh}:00`;
    }
    const dt = new Date(y, m - 1, d);
    const monthStr = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(dt);
    return `${monthStr} ${d} ${hh}:00`;
  } else {
    const [y, m, d] = bucket.split('-').map(Number);
    if (resolvedLang() === 'zh') {
      return `${m}月${d}日`;
    }
    const dt = new Date(y, m - 1, d);
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(dt);
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
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      onClick: (event, elements, chartInstance) => {
        if (hourly) return;
        const pts = (elements && elements.length)
          ? elements
          : chartInstance.getElementsAtEventForMode(event.native, 'index', { intersect: false }, true);
        if (!pts || !pts.length) return;
        const idx = pts[0].index;
        const clickedBucket = buckets[idx];
        if (clickedBucket) {
          drillDownToDate(clickedBucket);
        }
      },
      onHover: (event, elements) => {
        const target = event?.native?.target;
        if (!target) return;
        if (!hourly) {
          target.style.cursor = (elements && elements.length) ? 'pointer' : 'default';
        } else {
          target.style.cursor = 'default';
        }
      },
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
            footer: items => {
              const total = `Total: ${formatBytes(items.reduce((s, i) => s + i.raw, 0))}`;
              return !hourly ? `${total}\n${t('drilldownHint')}` : total;
            },
          },
        },
      },
    },
  });

  const badge = document.getElementById('granBadge');
  if (badge) badge.textContent = hourly ? t('granHour') : t('granDay');

  const backBtn = document.getElementById('drilldownBackBtn');
  if (backBtn) {
    backBtn.style.display = drilldownState ? 'inline-flex' : 'none';
  }
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

  if (!data.records || data.records.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td colspan="7" style="text-align: center; color: var(--text-muted); padding: 36px 16px;">${t('empty')}</td>`;
    tbody.appendChild(tr);
  } else {
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

  const chartEmpty = document.getElementById('chartEmpty');
  if (chartEmpty) {
    chartEmpty.textContent = t('empty');
    chartEmpty.style.display = hasData ? 'none' : 'flex';
  }

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
  if (showDetails) {
    await loadRecords(1);
  }
}

function updatePresetActiveState() {
  const s = startDate.value;
  const e = endDate.value;
  const now = new Date();

  const todayStr = isoDate(now);
  const last7StartStr = isoDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6));
  const monthStartStr = isoDate(new Date(now.getFullYear(), now.getMonth(), 1));
  const lastMonthStartStr = isoDate(new Date(now.getFullYear(), now.getMonth() - 1, 1));
  const lastMonthEndStr = isoDate(new Date(now.getFullYear(), now.getMonth(), 0));

  let matched = null;
  if (s === todayStr && e === todayStr) {
    matched = 'today';
  } else if (s === last7StartStr && e === todayStr) {
    matched = 'last7';
  } else if (s === monthStartStr && e === todayStr) {
    matched = 'thisMonth';
  } else if (s === lastMonthStartStr && e === lastMonthEndStr) {
    matched = 'lastMonth';
  }

  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.preset === matched);
  });
}

function applyPreset(presetKey) {
  const now = new Date();
  if (presetKey === 'today') {
    startDate.value = isoDate(now);
    endDate.value = isoDate(now);
  } else if (presetKey === 'last7') {
    startDate.value = isoDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6));
    endDate.value = isoDate(now);
  } else if (presetKey === 'thisMonth') {
    startDate.value = isoDate(new Date(now.getFullYear(), now.getMonth(), 1));
    endDate.value = isoDate(now);
  } else if (presetKey === 'lastMonth') {
    startDate.value = isoDate(new Date(now.getFullYear(), now.getMonth() - 1, 1));
    endDate.value = isoDate(new Date(now.getFullYear(), now.getMonth(), 0));
  }

  updatePresetActiveState();

  drilldownState = null;
  const backBtn = document.getElementById('drilldownBackBtn');
  if (backBtn) backBtn.style.display = 'none';
  recordsPage = 1;
  refresh();
}

document.getElementById('datePresets')?.addEventListener('click', e => {
  const btn = e.target.closest('.preset-btn');
  if (btn && btn.dataset.preset) {
    applyPreset(btn.dataset.preset);
  }
});

userFilter.addEventListener('change', () => {
  recordsPage = 1;
  refresh();
});

nodeFilter.addEventListener('change', () => {
  recordsPage = 1;
  refresh();
});

startDate.addEventListener('change', () => {
  if (startDate.value && endDate.value && startDate.value > endDate.value) {
    endDate.value = startDate.value;
  }
  drilldownState = null;
  const backBtn = document.getElementById('drilldownBackBtn');
  if (backBtn) backBtn.style.display = 'none';
  recordsPage = 1;
  updatePresetActiveState();
  refresh();
});

endDate.addEventListener('change', () => {
  if (startDate.value && endDate.value && endDate.value < startDate.value) {
    startDate.value = endDate.value;
  }
  drilldownState = null;
  const backBtn = document.getElementById('drilldownBackBtn');
  if (backBtn) backBtn.style.display = 'none';
  recordsPage = 1;
  updatePresetActiveState();
  refresh();
});

function drillDownToDate(dateStr) {
  if (!drilldownState) {
    drilldownState = {
      startDate: startDate.value,
      endDate: endDate.value,
    };
  }
  startDate.value = dateStr;
  endDate.value = dateStr;
  const backBtn = document.getElementById('drilldownBackBtn');
  if (backBtn) backBtn.style.display = 'inline-flex';
  recordsPage = 1;
  updatePresetActiveState();
  refresh();
}

function exitDrillDown() {
  if (drilldownState) {
    startDate.value = drilldownState.startDate;
    endDate.value = drilldownState.endDate;
    drilldownState = null;
  }
  const backBtn = document.getElementById('drilldownBackBtn');
  if (backBtn) backBtn.style.display = 'none';
  recordsPage = 1;
  updatePresetActiveState();
  refresh();
}

document.getElementById('drilldownBackBtn')?.addEventListener('click', exitDrillDown);

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

window.addEventListener('languagechange', () => {
  if (currentLang === 'auto') {
    applyLang('auto');
  }
});

// ── Toggle Details Table ─────────────────────────────────────────
function updateTableVisibility() {
  const tableCard = document.getElementById('tableCard');
  const btn = document.getElementById('toggleTableBtn');
  const text = document.getElementById('toggleTableText');
  if (tableCard) {
    tableCard.style.display = showDetails ? 'block' : 'none';
  }
  if (btn) {
    btn.classList.toggle('active', showDetails);
    btn.setAttribute('aria-expanded', String(showDetails));
  }
  if (text) {
    text.textContent = showDetails ? t('hideDetails') : t('showDetails');
  }
}

document.getElementById('toggleTableBtn')?.addEventListener('click', async () => {
  showDetails = !showDetails;
  updateTableVisibility();
  if (showDetails) {
    await loadRecords(recordsPage || 1);
    document.getElementById('tableCard')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
});

// ── Init ─────────────────────────────────────────────────────────
(async function init() {
  applyTheme(currentTheme);
  applyLang(currentLang);
  updateTableVisibility();

  const today      = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  startDate.value  = isoDate(monthStart);
  endDate.value    = isoDate(today);
  updatePresetActiveState();

  await loadMeta();
  await refresh();
})();
