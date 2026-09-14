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
    drilldownHourHint: '💡 点击柱子筛选下方分布明细',
    drilldownHourActiveHint: '💡 点击取消时段筛选',
    clearHourFilter: '清除时段筛选',
    detailsTableTitle: '流量明细记录',
    labelPresets:    '快捷筛选',
    presetToday:     '今日',
    presetLast7:     '近 7 天',
    presetThisMonth: '本月',
    presetLastMonth: '上月',
    showDetails:     '显示详情',
    hideDetails:     '隐藏详情',
    kpiMonth:        '本月总流量',
    kpiToday:        '今日实时流量',
    kpiUsers:        '用户总览',
    kpiNodes:        '在线节点数',
    kpiTotalUsers:   n => `全部登记用户: ${n}`,
    kpiTotalNodes:   n => `全部配置节点: ${n}`,
    breakdownTitleNode:     '节点用户分布',
    breakdownSubNode:       '展示各节点内的主要用户流量，点击可快速筛选或取消',
    breakdownTitleUser:     '用户节点分布',
    breakdownSubUser:       '展示各用户连接的节点流量分布，点击可快速筛选或取消',
    breakdownTitleTotal:    '流量分布概览',
    breakdownSubTotal:      '全网节点与用户消耗排行，点击可快速筛选或取消',
    breakdownNodeRank:      '节点流量排行',
    breakdownUserRank:      '用户流量排行',
    breakdownMore:          count => `展开其余 ${count} 项 ▾`,
    breakdownCollapse:      '收起 ▴',
    breakdownEmpty:         '当前范围内无分布数据',
    nodeBadgeCount:         n => `共 ${n} 个节点`,
    userBadgeCount:         n => `共 ${n} 位用户`,
    totalBadgeSummary:      (nodes, users) => `${nodes} 个节点 · ${users} 位用户`,
    clickToFilterUser:      u => `点击筛选/取消用户: ${u}`,
    clickToFilterNode:      n => `点击筛选/取消节点: ${n}`,
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
    drilldownHourHint: '💡 Click bar to filter breakdown below',
    drilldownHourActiveHint: '💡 Click to clear hour filter',
    clearHourFilter: 'Clear hour filter',
    detailsTableTitle: 'Traffic Detail Records',
    labelPresets:    'Quick Range',
    presetToday:     'Today',
    presetLast7:     'Last 7 Days',
    presetThisMonth: 'This Month',
    presetLastMonth: 'Last Month',
    showDetails:     'Show Details',
    hideDetails:     'Hide Details',
    kpiMonth:        'Monthly Traffic',
    kpiToday:        "Today's Traffic",
    kpiUsers:        'User Overview',
    kpiNodes:        'Online Nodes',
    kpiTotalUsers:   n => `Total registered: ${n}`,
    kpiTotalNodes:   n => `Total configured: ${n}`,
    breakdownTitleNode:     'User Breakdown',
    breakdownSubNode:       'Traffic by users on each node. Click to filter/clear.',
    breakdownTitleUser:     'Node Breakdown',
    breakdownSubUser:       'Traffic by nodes for each user. Click to filter/clear.',
    breakdownTitleTotal:    'Traffic Overview',
    breakdownSubTotal:      'Top nodes and top users ranking. Click to filter/clear.',
    breakdownNodeRank:      'Node Ranking',
    breakdownUserRank:      'User Ranking',
    breakdownMore:          count => `Show ${count} more ▾`,
    breakdownCollapse:      'Collapse ▴',
    breakdownEmpty:         'No breakdown data in selected range',
    nodeBadgeCount:         n => `${n} nodes`,
    userBadgeCount:         n => `${n} users`,
    totalBadgeSummary:      (nodes, users) => `${nodes} nodes · ${users} users`,
    clickToFilterUser:      u => `Click to filter/clear user: ${u}`,
    clickToFilterNode:      n => `Click to filter/clear node: ${n}`,
  },
};

// ── State ────────────────────────────────────────────────────────
const initialParams = new URLSearchParams(window.location.search);
let currentLang     = initialParams.get('lang') || localStorage.getItem('xflow-lang') || 'auto';
let currentTheme    = initialParams.get('theme') || localStorage.getItem('xflow-theme') || 'auto';
let currentView     = 'user'; // 'user' | 'node' | 'total'
let cachedStatsData = null;
let chart           = null;
let drilldownState  = null;
let selectedHourBucket = null;
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

function hexToRgba(hex, alpha) {
  if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) return hex;
  let c = hex.slice(1);
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const num = parseInt(c, 16);
  if (isNaN(num)) return hex;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function getBarColor(baseColor, bucketIndex, buckets) {
  if (!selectedHourBucket) return baseColor;
  return buckets[bucketIndex] === selectedHourBucket ? baseColor : hexToRgba(baseColor, 0.22);
}

function getBarBorderColor(baseColor, bucketIndex, buckets) {
  if (!selectedHourBucket) return 'transparent';
  return buckets[bucketIndex] === selectedHourBucket ? baseColor : 'transparent';
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
  setTxt('kpiLabelMonth',   'kpiMonth');
  setTxt('kpiLabelToday',   'kpiToday');
  setTxt('kpiLabelUsers',   'kpiUsers');
  setTxt('kpiLabelNodes',   'kpiNodes');

  const clearBtn = document.getElementById('breakdownHourClear');
  if (clearBtn) clearBtn.setAttribute('title', t('clearHourFilter'));

  setTxt('tableTitleText', 'detailsTableTitle');
  const tableClearBtn = document.getElementById('tableHourClear');
  if (tableClearBtn) tableClearBtn.setAttribute('title', t('clearHourFilter'));

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

  if (cachedStatsData) {
    renderChart(cachedStatsData);
    renderBreakdownCards(cachedStatsData);
    if (cachedStatsData.summary) renderKpis(cachedStatsData.summary);
  }
  if (showDetails) {
    loadRecords(recordsPage || 1);
  }
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
  if (meta.version) {
    const el = document.getElementById('footerVersion');
    if (el) {
      el.textContent = `v${meta.version}`;
      el.style.display = 'inline-block';
    }
  }
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
    datasets = users.map((user, idx) => {
      const color = getColor(idx);
      return {
        label: user,
        data: buckets.map(b => lookup[b]?.[user] ?? 0),
        backgroundColor: hourly && selectedHourBucket
          ? buckets.map((b, bIdx) => getBarColor(color, bIdx, buckets))
          : color,
        borderColor: hourly && selectedHourBucket
          ? buckets.map((b, bIdx) => getBarBorderColor(color, bIdx, buckets))
          : undefined,
        borderWidth: hourly && selectedHourBucket ? 1.5 : 0,
        stack: 'traffic',
        borderRadius: 3,
        borderSkipped: false,
      };
    });
  } else if (currentView === 'node') {
    const nodes = [...new Set(byTimeNode.map(r => r.node))];
    const lookup = {};
    for (const r of byTimeNode) {
      if (!lookup[r.bucket]) lookup[r.bucket] = {};
      lookup[r.bucket][r.node] = r.total;
    }
    datasets = nodes.map((node, idx) => {
      const color = getColor(idx);
      return {
        label: node,
        data: buckets.map(b => lookup[b]?.[node] ?? 0),
        backgroundColor: hourly && selectedHourBucket
          ? buckets.map((b, bIdx) => getBarColor(color, bIdx, buckets))
          : color,
        borderColor: hourly && selectedHourBucket
          ? buckets.map((b, bIdx) => getBarBorderColor(color, bIdx, buckets))
          : undefined,
        borderWidth: hourly && selectedHourBucket ? 1.5 : 0,
        stack: 'traffic',
        borderRadius: 3,
        borderSkipped: false,
      };
    });
  } else {
    // Total: Uplink and Downlink breakdown
    const lookup = {};
    for (const r of byTimeTotal) {
      lookup[r.bucket] = r;
    }
    const upColor = '#38bdf8';
    const downColor = '#6366f1';
    datasets = [
      {
        label: t('uplink'),
        data: buckets.map(b => lookup[b]?.uplink ?? 0),
        backgroundColor: hourly && selectedHourBucket
          ? buckets.map((b, bIdx) => getBarColor(upColor, bIdx, buckets))
          : upColor,
        borderColor: hourly && selectedHourBucket
          ? buckets.map((b, bIdx) => getBarBorderColor(upColor, bIdx, buckets))
          : undefined,
        borderWidth: hourly && selectedHourBucket ? 1.5 : 0,
        stack: 'traffic',
        borderRadius: 3,
        borderSkipped: false,
      },
      {
        label: t('downlink'),
        data: buckets.map(b => lookup[b]?.downlink ?? 0),
        backgroundColor: hourly && selectedHourBucket
          ? buckets.map((b, bIdx) => getBarColor(downColor, bIdx, buckets))
          : downColor,
        borderColor: hourly && selectedHourBucket
          ? buckets.map((b, bIdx) => getBarBorderColor(downColor, bIdx, buckets))
          : undefined,
        borderWidth: hourly && selectedHourBucket ? 1.5 : 0,
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
        const pts = (elements && elements.length)
          ? elements
          : chartInstance.getElementsAtEventForMode(event.native, 'index', { intersect: false }, true);
        if (!pts || !pts.length) return;
        const idx = pts[0].index;
        const clickedBucket = buckets[idx];
        if (!clickedBucket) return;

        if (!hourly) {
          drillDownToDate(clickedBucket);
        } else {
          // Toggle selection on clicked hour
          if (selectedHourBucket === clickedBucket) {
            clearHourFilter();
          } else {
            selectedHourBucket = clickedBucket;
            if (cachedStatsData) {
              renderChart(cachedStatsData);
              renderBreakdownCards(cachedStatsData);
            }
            if (showDetails) {
              loadRecords(1);
            }
          }
        }
      },
      onHover: (event, elements) => {
        const target = event?.native?.target;
        if (!target) return;
        target.style.cursor = (elements && elements.length) ? 'pointer' : 'default';
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
              if (!hourly) {
                return `${total}\n${t('drilldownHint')}`;
              }
              const bucket = buckets[items[0]?.dataIndex];
              if (selectedHourBucket && selectedHourBucket === bucket) {
                return `${total}\n${t('drilldownHourActiveHint')}`;
              }
              return `${total}\n${t('drilldownHourHint')}`;
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

// ── Breakdown Cards ──────────────────────────────────────────────
const expandedCards = new Set();

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderBreakdownCards(data) {
  const gridEl = document.getElementById('breakdownGrid');
  if (!gridEl) return;

  const titleEl = document.getElementById('breakdownTitle');
  const subEl = document.getElementById('breakdownSubtitle');
  const badgeEl = document.getElementById('breakdownCountBadge');
  const emptyEl = document.getElementById('breakdownEmpty');
  const hourBadgeEl = document.getElementById('breakdownHourBadge');
  const hourTextEl = document.getElementById('breakdownHourText');

  if (!data) {
    gridEl.innerHTML = '';
    if (emptyEl) emptyEl.style.display = 'block';
    if (badgeEl) badgeEl.textContent = '';
    if (hourBadgeEl) hourBadgeEl.style.display = 'none';
    return;
  }

  // Handle hourly filtering
  let byUserNode = data.byUserNode || [];
  let byNode = data.byNode || [];
  let byUser = data.byUser || [];

  if (selectedHourBucket && data.byTimeUserNode) {
    byUserNode = data.byTimeUserNode.filter(r => r.bucket === selectedHourBucket);

    const nodeAgg = new Map();
    const userAgg = new Map();
    for (const r of byUserNode) {
      if (!nodeAgg.has(r.node)) {
        nodeAgg.set(r.node, { node: r.node, uplink: 0, downlink: 0, total: 0 });
      }
      const n = nodeAgg.get(r.node);
      n.uplink += r.uplink || 0;
      n.downlink += r.downlink || 0;
      n.total += (r.uplink || 0) + (r.downlink || 0);

      if (!userAgg.has(r.user)) {
        userAgg.set(r.user, { user: r.user, uplink: 0, downlink: 0, total: 0 });
      }
      const u = userAgg.get(r.user);
      u.uplink += r.uplink || 0;
      u.downlink += r.downlink || 0;
      u.total += (r.uplink || 0) + (r.downlink || 0);
    }
    byNode = [...nodeAgg.values()];
    byUser = [...userAgg.values()];

    if (hourBadgeEl) {
      hourBadgeEl.style.display = 'inline-flex';
      if (hourTextEl) hourTextEl.textContent = formatBucket(selectedHourBucket, true);
    }
  } else {
    if (hourBadgeEl) hourBadgeEl.style.display = 'none';
  }

  // Compute total traffic across all entries
  let totalAll = 0;
  for (const r of byUserNode) {
    totalAll += (r.uplink || 0) + (r.downlink || 0);
  }
  if (totalAll === 0 && byNode.length > 0) {
    for (const r of byNode) {
      totalAll += (r.uplink || 0) + (r.downlink || 0);
    }
  }

  gridEl.innerHTML = '';

  const activeUser = userFilter?.value;
  const activeNode = nodeFilter?.value;

  if (currentView === 'node') {
    if (titleEl) titleEl.textContent = t('breakdownTitleNode');
    if (subEl) subEl.textContent = t('breakdownSubNode');

    // Aggregate by node
    const nodeMap = new Map();
    for (const r of byUserNode) {
      const rowTotal = (r.uplink || 0) + (r.downlink || 0);
      if (!nodeMap.has(r.node)) {
        nodeMap.set(r.node, { node: r.node, total: 0, uplink: 0, downlink: 0, users: [] });
      }
      const item = nodeMap.get(r.node);
      item.total += rowTotal;
      item.uplink += (r.uplink || 0);
      item.downlink += (r.downlink || 0);
      item.users.push({
        user: r.user,
        total: rowTotal,
        uplink: r.uplink || 0,
        downlink: r.downlink || 0,
      });
    }

    for (const n of byNode) {
      if (!nodeMap.has(n.node)) {
        nodeMap.set(n.node, {
          node: n.node,
          total: (n.uplink || 0) + (n.downlink || 0),
          uplink: n.uplink || 0,
          downlink: n.downlink || 0,
          users: [],
        });
      }
    }

    const nodeList = [...nodeMap.values()].sort((a, b) => b.total - a.total);
    if (badgeEl) badgeEl.textContent = t('nodeBadgeCount', nodeList.length);

    if (nodeList.length === 0 || totalAll === 0) {
      if (emptyEl) emptyEl.style.display = 'block';
      return;
    }
    if (emptyEl) emptyEl.style.display = 'none';

    const serverIcon = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="breakdown-icon"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>`;

    nodeList.forEach((item, nodeIdx) => {
      item.users.sort((a, b) => b.total - a.total);
      const cardId = `node:${item.node}`;
      const isExpanded = expandedCards.has(cardId);
      const visibleUsers = isExpanded ? item.users : item.users.slice(0, 4);
      const hasMore = item.users.length > 4;

      const nodeShare = totalAll > 0 ? ((item.total / totalAll) * 100).toFixed(1) : '0.0';

      const card = document.createElement('div');
      card.className = `breakdown-item-card${activeNode === item.node ? ' active-filter' : ''}`;

      let usersHtml = '';
      visibleUsers.forEach((u, uIdx) => {
        const uPct = item.total > 0 ? ((u.total / item.total) * 100).toFixed(1) : '0.0';
        const color = getColor(uIdx);
        const isActive = activeUser === u.user;
        usersHtml += `
          <div class="breakdown-subitem${isActive ? ' active-filter' : ''}" data-filter-user="${escapeHtml(u.user)}" title="${t('clickToFilterUser', u.user)}">
            <div class="breakdown-subitem-top">
              <span class="breakdown-subitem-name">
                <span class="breakdown-color-dot" style="background:${color}"></span>
                ${escapeHtml(u.user)}
              </span>
              <span class="breakdown-subitem-val">${formatBytes(u.total)} <span class="breakdown-subitem-pct">${uPct}%</span></span>
            </div>
            <div class="breakdown-bar-track">
              <div class="breakdown-bar-fill" style="width: ${Math.min(100, Math.max(0.5, uPct))}%; background: ${color};"></div>
            </div>
          </div>
        `;
      });

      let moreBtnHtml = '';
      if (hasMore) {
        const remaining = item.users.length - 4;
        moreBtnHtml = `<button type="button" class="breakdown-expand-btn" data-card-id="${cardId}">${isExpanded ? t('breakdownCollapse') : t('breakdownMore', remaining)}</button>`;
      }

      card.innerHTML = `
        <div class="breakdown-card-top">
          <div class="breakdown-card-name">
            <button type="button" class="breakdown-card-name-btn" data-filter-node="${escapeHtml(item.node)}" title="${t('clickToFilterNode', item.node)}">
              ${serverIcon}
              <span>${escapeHtml(item.node)}</span>
            </button>
          </div>
          <div class="breakdown-card-stat">
            <div class="breakdown-card-total">${formatBytes(item.total)}<span class="breakdown-card-share">(${nodeShare}%)</span></div>
            <div class="breakdown-card-sub"><span>↑ ${formatBytes(item.uplink)}</span> · <span>↓ ${formatBytes(item.downlink)}</span></div>
          </div>
        </div>
        <div class="breakdown-sublist">
          ${usersHtml || `<div class="breakdown-empty-sub">${t('empty')}</div>`}
        </div>
        ${moreBtnHtml}
      `;
      gridEl.appendChild(card);
    });

  } else if (currentView === 'user') {
    if (titleEl) titleEl.textContent = t('breakdownTitleUser');
    if (subEl) subEl.textContent = t('breakdownSubUser');

    // Aggregate by user
    const userMap = new Map();
    for (const r of byUserNode) {
      const rowTotal = (r.uplink || 0) + (r.downlink || 0);
      if (!userMap.has(r.user)) {
        userMap.set(r.user, { user: r.user, total: 0, uplink: 0, downlink: 0, nodes: [] });
      }
      const item = userMap.get(r.user);
      item.total += rowTotal;
      item.uplink += (r.uplink || 0);
      item.downlink += (r.downlink || 0);
      item.nodes.push({
        node: r.node,
        total: rowTotal,
        uplink: r.uplink || 0,
        downlink: r.downlink || 0,
      });
    }

    for (const u of byUser) {
      if (!userMap.has(u.user)) {
        userMap.set(u.user, {
          user: u.user,
          total: (u.uplink || 0) + (u.downlink || 0),
          uplink: u.uplink || 0,
          downlink: u.downlink || 0,
          nodes: [],
        });
      }
    }

    const userList = [...userMap.values()].sort((a, b) => b.total - a.total);
    if (badgeEl) badgeEl.textContent = t('userBadgeCount', userList.length);

    if (userList.length === 0 || totalAll === 0) {
      if (emptyEl) emptyEl.style.display = 'block';
      return;
    }
    if (emptyEl) emptyEl.style.display = 'none';

    const userIcon = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="breakdown-icon"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;

    userList.forEach((item, userIdx) => {
      item.nodes.sort((a, b) => b.total - a.total);
      const cardId = `user:${item.user}`;
      const isExpanded = expandedCards.has(cardId);
      const visibleNodes = isExpanded ? item.nodes : item.nodes.slice(0, 4);
      const hasMore = item.nodes.length > 4;

      const userShare = totalAll > 0 ? ((item.total / totalAll) * 100).toFixed(1) : '0.0';

      const card = document.createElement('div');
      card.className = `breakdown-item-card${activeUser === item.user ? ' active-filter' : ''}`;

      let nodesHtml = '';
      visibleNodes.forEach((n, nIdx) => {
        const nPct = item.total > 0 ? ((n.total / item.total) * 100).toFixed(1) : '0.0';
        const color = getColor(nIdx);
        const isActive = activeNode === n.node;
        nodesHtml += `
          <div class="breakdown-subitem${isActive ? ' active-filter' : ''}" data-filter-node="${escapeHtml(n.node)}" title="${t('clickToFilterNode', n.node)}">
            <div class="breakdown-subitem-top">
              <span class="breakdown-subitem-name">
                <span class="breakdown-color-dot" style="background:${color}"></span>
                ${escapeHtml(n.node)}
              </span>
              <span class="breakdown-subitem-val">${formatBytes(n.total)} <span class="breakdown-subitem-pct">${nPct}%</span></span>
            </div>
            <div class="breakdown-bar-track">
              <div class="breakdown-bar-fill" style="width: ${Math.min(100, Math.max(0.5, nPct))}%; background: ${color};"></div>
            </div>
          </div>
        `;
      });

      let moreBtnHtml = '';
      if (hasMore) {
        const remaining = item.nodes.length - 4;
        moreBtnHtml = `<button type="button" class="breakdown-expand-btn" data-card-id="${cardId}">${isExpanded ? t('breakdownCollapse') : t('breakdownMore', remaining)}</button>`;
      }

      card.innerHTML = `
        <div class="breakdown-card-top">
          <div class="breakdown-card-name">
            <button type="button" class="breakdown-card-name-btn" data-filter-user="${escapeHtml(item.user)}" title="${t('clickToFilterUser', item.user)}">
              ${userIcon}
              <span>${escapeHtml(item.user)}</span>
            </button>
          </div>
          <div class="breakdown-card-stat">
            <div class="breakdown-card-total">${formatBytes(item.total)}<span class="breakdown-card-share">(${userShare}%)</span></div>
            <div class="breakdown-card-sub"><span>↑ ${formatBytes(item.uplink)}</span> · <span>↓ ${formatBytes(item.downlink)}</span></div>
          </div>
        </div>
        <div class="breakdown-sublist">
          ${nodesHtml || `<div class="breakdown-empty-sub">${t('empty')}</div>`}
        </div>
        ${moreBtnHtml}
      `;
      gridEl.appendChild(card);
    });

  } else {
    // currentView === 'total'
    if (titleEl) titleEl.textContent = t('breakdownTitleTotal');
    if (subEl) subEl.textContent = t('breakdownSubTotal');
    if (badgeEl) badgeEl.textContent = t('totalBadgeSummary', byNode.length, byUser.length);

    if (totalAll === 0 || (byNode.length === 0 && byUser.length === 0)) {
      if (emptyEl) emptyEl.style.display = 'block';
      return;
    }
    if (emptyEl) emptyEl.style.display = 'none';

    // Sorted node list
    const sortedNodes = [...byNode]
      .map(n => ({ name: n.node, uplink: n.uplink, downlink: n.downlink, total: (n.uplink || 0) + (n.downlink || 0) }))
      .sort((a, b) => b.total - a.total);

    // Sorted user list
    const sortedUsers = [...byUser]
      .map(u => ({ name: u.user, uplink: u.uplink, downlink: u.downlink, total: (u.uplink || 0) + (u.downlink || 0) }))
      .sort((a, b) => b.total - a.total);

    // Node ranking card
    const nodeCard = document.createElement('div');
    nodeCard.className = 'breakdown-item-card';
    const isExpandedNodes = expandedCards.has('total:nodes');
    const visibleNodes = isExpandedNodes ? sortedNodes : sortedNodes.slice(0, 5);
    const hasMoreNodes = sortedNodes.length > 5;

    let nodesListHtml = '';
    visibleNodes.forEach((n, idx) => {
      const pct = totalAll > 0 ? ((n.total / totalAll) * 100).toFixed(1) : '0.0';
      const color = getColor(idx);
      const isActive = activeNode === n.name;
      nodesListHtml += `
        <div class="breakdown-subitem${isActive ? ' active-filter' : ''}" data-filter-node="${escapeHtml(n.name)}" title="${t('clickToFilterNode', n.name)}">
          <div class="breakdown-subitem-top">
            <span class="breakdown-subitem-name">
              <span class="breakdown-color-dot" style="background:${color}"></span>
              ${escapeHtml(n.name)}
            </span>
            <span class="breakdown-subitem-val">${formatBytes(n.total)} <span class="breakdown-subitem-pct">${pct}%</span></span>
          </div>
          <div class="breakdown-bar-track">
            <div class="breakdown-bar-fill" style="width: ${Math.min(100, Math.max(0.5, pct))}%; background: ${color};"></div>
          </div>
        </div>
      `;
    });

    const moreNodesBtn = hasMoreNodes ? `<button type="button" class="breakdown-expand-btn" data-card-id="total:nodes">${isExpandedNodes ? t('breakdownCollapse') : t('breakdownMore', sortedNodes.length - 5)}</button>` : '';

    nodeCard.innerHTML = `
      <div class="breakdown-card-top">
        <div class="breakdown-card-name">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="breakdown-icon"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
          <span>${t('breakdownNodeRank')}</span>
        </div>
        <div class="breakdown-card-stat">
          <span class="breakdown-card-share">${t('nodeBadgeCount', sortedNodes.length)}</span>
        </div>
      </div>
      <div class="breakdown-sublist">${nodesListHtml}</div>
      ${moreNodesBtn}
    `;
    gridEl.appendChild(nodeCard);

    // User ranking card
    const userCard = document.createElement('div');
    userCard.className = 'breakdown-item-card';
    const isExpandedUsers = expandedCards.has('total:users');
    const visibleUsers = isExpandedUsers ? sortedUsers : sortedUsers.slice(0, 5);
    const hasMoreUsers = sortedUsers.length > 5;

    let usersListHtml = '';
    visibleUsers.forEach((u, idx) => {
      const pct = totalAll > 0 ? ((u.total / totalAll) * 100).toFixed(1) : '0.0';
      const color = getColor(idx);
      const isActive = activeUser === u.name;
      usersListHtml += `
        <div class="breakdown-subitem${isActive ? ' active-filter' : ''}" data-filter-user="${escapeHtml(u.name)}" title="${t('clickToFilterUser', u.name)}">
          <div class="breakdown-subitem-top">
            <span class="breakdown-subitem-name">
              <span class="breakdown-color-dot" style="background:${color}"></span>
              ${escapeHtml(u.name)}
            </span>
            <span class="breakdown-subitem-val">${formatBytes(u.total)} <span class="breakdown-subitem-pct">${pct}%</span></span>
          </div>
          <div class="breakdown-bar-track">
            <div class="breakdown-bar-fill" style="width: ${Math.min(100, Math.max(0.5, pct))}%; background: ${color};"></div>
          </div>
        </div>
      `;
    });

    const moreUsersBtn = hasMoreUsers ? `<button type="button" class="breakdown-expand-btn" data-card-id="total:users">${isExpandedUsers ? t('breakdownCollapse') : t('breakdownMore', sortedUsers.length - 5)}</button>` : '';

    userCard.innerHTML = `
      <div class="breakdown-card-top">
        <div class="breakdown-card-name">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="breakdown-icon"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          <span>${t('breakdownUserRank')}</span>
        </div>
        <div class="breakdown-card-stat">
          <span class="breakdown-card-share">${t('userBadgeCount', sortedUsers.length)}</span>
        </div>
      </div>
      <div class="breakdown-sublist">${usersListHtml}</div>
      ${moreUsersBtn}
    `;
    gridEl.appendChild(userCard);
  }
}

// ── Breakdown Click Delegation ──────────────────────────────────
document.getElementById('breakdownGrid')?.addEventListener('click', e => {
  // 1. Expand / Collapse
  const expandBtn = e.target.closest('.breakdown-expand-btn');
  if (expandBtn) {
    const cardId = expandBtn.dataset.cardId;
    if (cardId) {
      if (expandedCards.has(cardId)) {
        expandedCards.delete(cardId);
      } else {
        expandedCards.add(cardId);
      }
      if (cachedStatsData) renderBreakdownCards(cachedStatsData);
    }
    return;
  }

  // 2. Filter by user (toggle if already active)
  const userEl = e.target.closest('[data-filter-user]');
  if (userEl) {
    const userVal = userEl.dataset.filterUser;
    if (userVal) {
      userFilter.value = (userFilter.value === userVal) ? '' : userVal;
      recordsPage = 1;
      refresh();
      document.getElementById('userFilter')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    return;
  }

  // 3. Filter by node (toggle if already active)
  const nodeEl = e.target.closest('[data-filter-node]');
  if (nodeEl) {
    const nodeVal = nodeEl.dataset.filterNode;
    if (nodeVal) {
      nodeFilter.value = (nodeFilter.value === nodeVal) ? '' : nodeVal;
      recordsPage = 1;
      refresh();
      document.getElementById('nodeFilter')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    return;
  }
});

function clearHourFilter() {
  selectedHourBucket = null;
  const tableHourBadge = document.getElementById('tableHourBadge');
  if (tableHourBadge) tableHourBadge.style.display = 'none';
  if (cachedStatsData) {
    renderChart(cachedStatsData);
    renderBreakdownCards(cachedStatsData);
  }
  if (showDetails) {
    loadRecords(1);
  }
}

document.getElementById('breakdownHourClear')?.addEventListener('click', e => {
  e.stopPropagation();
  clearHourFilter();
});

document.getElementById('tableHourClear')?.addEventListener('click', e => {
  e.stopPropagation();
  clearHourFilter();
});

// ── View switch handler ──────────────────────────────────────────
document.getElementById('viewSwitch')?.addEventListener('click', e => {
  const btn = e.target.closest('.view-btn');
  if (!btn) return;
  const view = btn.dataset.view;
  if (!view || view === currentView) return;
  currentView = view;
  document.querySelectorAll('.view-btn').forEach(b => b.classList.toggle('active', b === btn));
  if (cachedStatsData) {
    renderChart(cachedStatsData);
    renderBreakdownCards(cachedStatsData);
  }
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
  const p = new URLSearchParams();
  if (userFilter.value) p.set('user', userFilter.value);
  if (nodeFilter.value) p.set('node', nodeFilter.value);

  if (selectedHourBucket) {
    const [datePart, hourPart] = selectedHourBucket.split('T');
    const [y, m, d] = datePart.split('-').map(Number);
    const h = Number(hourPart);
    const startHour = new Date(y, m - 1, d, h, 0, 0, 0);
    const endHour = new Date(y, m - 1, d, h, 59, 59, 999);
    p.set('start', startHour.toISOString());
    p.set('end', endHour.toISOString());
  } else {
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
  }
  p.set('tz', String(-new Date().getTimezoneOffset()));

  const tableHourBadge = document.getElementById('tableHourBadge');
  const tableHourText = document.getElementById('tableHourText');
  if (tableHourBadge) {
    if (selectedHourBucket) {
      tableHourBadge.style.display = 'inline-flex';
      if (tableHourText) tableHourText.textContent = formatBucket(selectedHourBucket, true);
    } else {
      tableHourBadge.style.display = 'none';
    }
  }

  const res = await fetch(`/api/stats/records?${p.toString()}&page=${page}&limit=${recordsPageSize}`);
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

// ── KPI Summary Cards ────────────────────────────────────────────
function renderKpis(summary) {
  if (!summary) return;
  const setTxt = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  // 1. Monthly Traffic
  setTxt('kpiValMonth', formatBytes(summary.monthTotal));
  setTxt('kpiUpMonth', `↑ ${formatBytes(summary.monthUplink)}`);
  setTxt('kpiDownMonth', `↓ ${formatBytes(summary.monthDownlink)}`);

  // 2. Today's Traffic
  setTxt('kpiValToday', formatBytes(summary.todayTotal));
  setTxt('kpiUpToday', `↑ ${formatBytes(summary.todayUplink)}`);
  setTxt('kpiDownToday', `↓ ${formatBytes(summary.todayDownlink)}`);

  // 3. Active Users
  setTxt('kpiValUsers', String(summary.activeUsers ?? 0));
  setTxt('kpiSubUsers', t('kpiTotalUsers', summary.totalUsers ?? 0));

  // 4. Online Nodes
  setTxt('kpiValNodesCount', String(summary.onlineNodes ?? 0));
  setTxt('kpiSubNodes', t('kpiTotalNodes', summary.totalNodes ?? 0));

  const pulse = document.getElementById('kpiPulse');
  if (pulse) {
    const isOnline = (summary.onlineNodes || 0) > 0;
    pulse.className = `pulse-indicator ${isOnline ? 'online' : 'offline'}`;
  }
}

// ── Refresh ──────────────────────────────────────────────────────
async function refresh() {
  const res  = await fetch(`/api/stats?${buildQuery()}`);
  const data = await res.json();
  cachedStatsData = data;

  if (selectedHourBucket && data.byTimeTotal && !data.byTimeTotal.some(r => r.bucket === selectedHourBucket)) {
    selectedHourBucket = null;
  }

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
  renderBreakdownCards(data);
  renderKpis(data.summary);
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
  selectedHourBucket = null;
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
  selectedHourBucket = null;
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
  selectedHourBucket = null;
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
  selectedHourBucket = null;
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
  selectedHourBucket = null;
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
