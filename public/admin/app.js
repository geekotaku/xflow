// ── i18n Strings ─────────────────────────────────────────────────
const I18N = {
  zh: {
    themeAuto: '自动',
    themeLight: '亮色',
    themeDark: '暗色',
    langAuto: '自动',
    langEn: 'English',
    langZh: '中文',

    // Init View
    initTitle: 'xflow · 首次初始化',
    initSub: '请设置系统首个管理员账号与密码',
    initLabelUser: '管理员用户名',
    initPlaceholderUser: '例如 admin',
    initLabelPwd: '密码',
    initPlaceholderPwd: '至少 6 位字符',
    initLabelConfirm: '确认密码',
    initPlaceholderConfirm: '再次输入密码',
    initBtnSubmit: '创建账号并登录',
    initTip: '💡 账号凭据安全保存在 SQLite 数据库中，可在管理后台随时修改。',

    // Login View
    loginTitle: 'xflow · 管理员登录',
    loginSub: '请输入管理员账号以进入节点管理控制台',
    loginLabelUser: '用户名',
    loginPlaceholderUser: '请输入用户名',
    loginLabelPwd: '密码',
    loginPlaceholderPwd: '请输入密码',
    loginBtnSubmit: '登录',
    backDashboard: '← 返回流量看板',
    loginTipReset: '提示：若遗忘密码，可在 docker-compose.yml 中配置 ADMIN_PASSWORD 并重启容器直接重置。',

    // Console View
    consoleTitle: '节点与凭据管理',
    consoleSub: '管理数据采集节点及上报 Agent 所需的认证 Token',
    btnChangePassword: '修改密码',
    btnSignOut: '退出登录',
    btnDashboard: '数据看板',
    placeholderNewNode: '节点名称，例如 hk-node-01',
    btnCreateNode: '创建节点',

    // Table
    thNodeName: '节点名称',
    thToken: 'Token (上报凭据)',
    thLastReported: '上次上报时间',
    neverReported: '从未上报',
    tooltipCreatedAt: '创建于',
    thActions: '操作',
    emptyNodes: '暂无节点，请在上方输入节点名称并创建。',
    btnInstallCmd: '一键部署指令',
    btnCopyToken: '复制',
    btnEditNode: '编辑',
    btnRotateToken: '重置',
    btnDeleteNode: '删除',

    // Modal
    modalTitle: '修改管理员资料与密码',
    modalEditNodeTitle: '修改节点名称',
    modalEditNodeLabel: '节点名称',
    modalLabelUser: '用户名',
    modalLabelOldPwd: '当前密码 (修改密码时必填)',
    modalPlaceholderOldPwd: '输入当前旧密码',
    modalLabelNewPwd: '新密码 (留空表示不修改密码)',
    modalPlaceholderNewPwd: '至少 6 位字符',
    modalLabelConfirmNewPwd: '确认新密码',
    modalPlaceholderConfirmNewPwd: '再次输入新密码',
    btnCancel: '取消',
    btnSave: '保存修改',

    // Toasts & Dialogs
    copied: 'Token 已复制到剪贴板',
    cmdCopied: '一键部署指令已复制到剪贴板',
    copyFailed: '复制失败，请手动选择复制',
    confirmRotate: '确定要为该节点重新生成 Token 吗？旧 Token 将立即失效。',
    tokenRotated: 'Token 已成功重新生成',
    confirmDelete: '确定要删除该节点吗？历史流量记录将继续保留。',
    nodeDeleted: '节点已删除',
    nodeCreated: '节点创建成功',
    nodeUpdated: '节点名称修改成功',
    failedUpdateNode: '修改节点名称失败',
    passwordsMismatch: '两次输入的密码不一致',
    passwordMinLength: '密码长度不能少于 6 位',
    oldPasswordRequired: '修改密码时必须输入当前旧密码',
    accountCreated: '管理员账号初始化成功',
    signedIn: '登录成功',
    signedOut: '已安全退出登录',
    profileUpdated: '资料修改成功',
    connError: '连接服务器失败，请检查网络连接',
    invalidCreds: '用户名或密码错误',
    failedLoadNodes: '获取节点列表失败',
    failedCreateNode: '创建节点失败',
    operationFailed: '操作失败，请重试',
  },
  en: {
    themeAuto: 'Auto',
    themeLight: 'Light',
    themeDark: 'Dark',
    langAuto: 'Auto',
    langEn: 'English',
    langZh: '中文',

    // Init View
    initTitle: 'xflow · Initial Setup',
    initSub: 'Set up your administrator credentials for first-time use',
    initLabelUser: 'Administrator Username',
    initPlaceholderUser: 'e.g. admin',
    initLabelPwd: 'Password',
    initPlaceholderPwd: 'At least 6 characters',
    initLabelConfirm: 'Confirm Password',
    initPlaceholderConfirm: 'Re-enter password',
    initBtnSubmit: 'Create Account & Sign In',
    initTip: '💡 Credentials are securely saved to the SQLite database and can be changed in the admin panel anytime.',

    // Login View
    loginTitle: 'xflow · Admin Sign In',
    loginSub: 'Enter administrator credentials to access node management',
    loginLabelUser: 'Username',
    loginPlaceholderUser: 'Username',
    loginLabelPwd: 'Password',
    loginPlaceholderPwd: 'Password',
    loginBtnSubmit: 'Sign In',
    backDashboard: '← Back to Dashboard',
    loginTipReset: 'Tip: If you forget your password, configure ADMIN_PASSWORD in docker-compose.yml and restart to reset directly.',

    // Console View
    consoleTitle: 'Node / Token Management',
    consoleSub: 'Manage node endpoints and authentication tokens for reporting agents',
    btnChangePassword: 'Change Password',
    btnSignOut: 'Sign Out',
    btnDashboard: 'Dashboard',
    placeholderNewNode: 'Node name, e.g. hk-node-01',
    btnCreateNode: 'Create Node',

    // Table
    thNodeName: 'Node Name',
    thToken: 'Token',
    thLastReported: 'Last Reported At',
    neverReported: 'Never',
    tooltipCreatedAt: 'Created at',
    thActions: 'Actions',
    emptyNodes: 'No nodes configured yet. Enter a name above to create one.',
    btnInstallCmd: 'Install Cmd',
    btnCopyToken: 'Copy',
    btnEditNode: 'Edit',
    btnRotateToken: 'Rotate',
    btnDeleteNode: 'Delete',

    // Modal
    modalTitle: 'Update Administrator Profile',
    modalEditNodeTitle: 'Edit Node Name',
    modalEditNodeLabel: 'Node Name',
    modalLabelUser: 'Username',
    modalLabelOldPwd: 'Current Password (required to change password)',
    modalPlaceholderOldPwd: 'Enter current password',
    modalLabelNewPwd: 'New Password (leave blank to keep unchanged)',
    modalPlaceholderNewPwd: 'At least 6 characters',
    modalLabelConfirmNewPwd: 'Confirm New Password',
    modalPlaceholderConfirmNewPwd: 'Re-enter new password',
    btnCancel: 'Cancel',
    btnSave: 'Save Changes',

    // Toasts & Dialogs
    copied: 'Token copied to clipboard',
    cmdCopied: 'Install command copied to clipboard',
    copyFailed: 'Copy failed, please copy manually',
    confirmRotate: 'Are you sure you want to regenerate the token for this node? The old token will be immediately revoked.',
    tokenRotated: 'Token regenerated successfully',
    confirmDelete: 'Are you sure you want to delete this node? Historical traffic records will be preserved.',
    nodeDeleted: 'Node deleted successfully',
    nodeCreated: 'Node created successfully',
    nodeUpdated: 'Node name updated successfully',
    failedUpdateNode: 'Failed to update node name',
    passwordsMismatch: 'Passwords do not match',
    passwordMinLength: 'Password must be at least 6 characters',
    oldPasswordRequired: 'Current password is required to change password',
    accountCreated: 'Administrator account created successfully',
    signedIn: 'Signed in successfully',
    signedOut: 'Signed out',
    profileUpdated: 'Profile updated successfully',
    connError: 'Failed to connect to server, please check connection',
    invalidCreds: 'Invalid username or password',
    failedLoadNodes: 'Failed to load nodes',
    failedCreateNode: 'Failed to create node',
    operationFailed: 'Operation failed, please try again',
  }
};

// ── State ────────────────────────────────────────────────────────
let currentTheme = localStorage.getItem('xflow-theme') || 'auto';
let currentLang  = localStorage.getItem('xflow-lang')  || 'auto';

const THEME_ICONS = { auto: '🖥️', light: '☀️', dark: '🌙' };
const LANG_LABELS = { auto: '文A', zh: '中文', en: 'EN' };

function resolvedLang() {
  if (currentLang === 'auto') {
    return navigator.language.startsWith('zh') ? 'zh' : 'en';
  }
  return currentLang === 'zh' ? 'zh' : 'en';
}

function t(key) {
  const lang = resolvedLang();
  return I18N[lang]?.[key] || I18N.en[key] || key;
}

// ── Theme Management ─────────────────────────────────────────────
function applyTheme(theme) {
  currentTheme = theme;
  localStorage.setItem('xflow-theme', theme);
  document.documentElement.setAttribute('data-theme', theme);
  document.querySelectorAll('.theme-btn-icon').forEach(icon => {
    icon.textContent = THEME_ICONS[theme] || '🖥️';
  });
  document.querySelectorAll('[data-theme-val]').forEach(item => {
    item.classList.toggle('active', item.dataset.themeVal === theme);
  });
}

// ── Language Management ──────────────────────────────────────────
function applyLang(lang) {
  currentLang = lang;
  localStorage.setItem('xflow-lang', lang);
  document.documentElement.lang = resolvedLang();

  document.querySelectorAll('.lang-btn-label').forEach(lbl => {
    lbl.textContent = LANG_LABELS[lang] || '文A';
  });
  document.querySelectorAll('[data-lang-val]').forEach(item => {
    item.classList.toggle('active', item.dataset.langVal === lang);
  });

  // Apply all data-i18n innerText
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });

  // Apply all data-i18n-ph placeholders
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    el.placeholder = t(el.dataset.i18nPh);
  });
}

// Sync across multiple open browser tabs/windows
window.addEventListener('storage', (e) => {
  if (e.key === 'xflow-theme') applyTheme(e.newValue || 'auto');
  if (e.key === 'xflow-lang') applyLang(e.newValue || 'auto');
});

// Dropdown initialization
function setupDropdown(dropdownId, btnId) {
  const dropdown = document.getElementById(dropdownId);
  const btn = document.getElementById(btnId);
  if (!dropdown || !btn) return;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = dropdown.classList.contains('open');
    closeAllDropdowns();
    if (!isOpen) {
      dropdown.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
}

function closeAllDropdowns() {
  document.querySelectorAll('.dropdown.open').forEach(dd => {
    dd.classList.remove('open');
    const btn = dd.querySelector('button');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  });
}

document.addEventListener('click', closeAllDropdowns);

// Hook up dropdown buttons
setupDropdown('themeDropdown', 'themeBtn');
setupDropdown('langDropdown', 'langBtn');
setupDropdown('themeDropdownAuth', 'themeBtnAuth');
setupDropdown('langDropdownAuth', 'langBtnAuth');

document.addEventListener('click', (e) => {
  const themeItem = e.target.closest('[data-theme-val]');
  if (themeItem) {
    applyTheme(themeItem.dataset.themeVal);
    closeAllDropdowns();
  }
  const langItem = e.target.closest('[data-lang-val]');
  if (langItem) {
    applyLang(langItem.dataset.langVal);
    closeAllDropdowns();
  }
});

// ── DOM References ───────────────────────────────────────────────
const authTopBar         = document.getElementById('authTopBar');
const initView           = document.getElementById('initView');
const loginView          = document.getElementById('loginView');
const consoleView        = document.getElementById('consoleView');

const initForm           = document.getElementById('initForm');
const initUsername       = document.getElementById('initUsername');
const initPassword       = document.getElementById('initPassword');
const initPasswordConfirm= document.getElementById('initPasswordConfirm');

const loginForm          = document.getElementById('loginForm');
const loginUsername      = document.getElementById('loginUsername');
const loginPassword      = document.getElementById('loginPassword');

let currentAdminUsername = 'admin';
const openProfileBtn     = document.getElementById('openProfileBtn');
const logoutBtn          = document.getElementById('logoutBtn');

const createForm         = document.getElementById('createForm');
const nameInput          = document.getElementById('nameInput');
const nodeTable          = document.getElementById('nodeTable');

const profileModal       = document.getElementById('profileModal');
const closeProfileModal  = document.getElementById('closeProfileModal');
const cancelProfileBtn   = document.getElementById('cancelProfileBtn');
const profileForm        = document.getElementById('profileForm');
const profileUsername    = document.getElementById('profileUsername');
const oldPassword        = document.getElementById('oldPassword');
const newPassword        = document.getElementById('newPassword');
const newPasswordConfirm = document.getElementById('newPasswordConfirm');

const editNodeModal      = document.getElementById('editNodeModal');
const closeEditNodeModal = document.getElementById('closeEditNodeModal');
const cancelEditNodeBtn  = document.getElementById('cancelEditNodeBtn');
const editNodeForm       = document.getElementById('editNodeForm');
const editNodeId         = document.getElementById('editNodeId');
const editNodeName       = document.getElementById('editNodeName');

const toast              = document.getElementById('toast');
let toastTimer           = null;

function showToast(msg) {
  if (toastTimer) clearTimeout(toastTimer);
  toast.textContent = msg;
  toast.classList.add('show');
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2800);
}

// ── View Switching ───────────────────────────────────────────────
function showView(view) {
  initView.classList.remove('active');
  loginView.classList.remove('active');
  consoleView.style.display = 'none';

  if (view === 'init') {
    initView.classList.add('active');
    authTopBar.style.display = 'flex';
  } else if (view === 'login') {
    loginView.classList.add('active');
    authTopBar.style.display = 'flex';
  } else if (view === 'console') {
    consoleView.style.display = 'block';
    authTopBar.style.display = 'none';
  }
}

// ── API & Auth Status ────────────────────────────────────────────
async function checkAuth() {
  try {
    const res = await fetch('/api/admin/auth/status');
    const data = await res.json();
    if (!data.initialized) {
      showView('init');
    } else if (!data.loggedIn) {
      showView('login');
    } else {
      currentAdminUsername = data.username || 'admin';
      showView('console');
      loadNodes();
    }
  } catch (err) {
    showToast(t('connError'));
  }
}

// ── Nodes List & Actions ─────────────────────────────────────────
function copyText(text, successMsg) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(
      () => showToast(successMsg || t('copied')),
      () => fallbackCopy(text, successMsg)
    );
  } else {
    fallbackCopy(text, successMsg);
  }
}

function copyToken(token) {
  copyText(token, t('copied'));
}

function copyInstallCmd(token, nodeName) {
  const origin = window.location.origin;
  const cmd = `sudo bash <(curl -fsSL ${origin}/install-agent.sh) -s ${origin} -t ${token} -n "${nodeName}"`;
  copyText(cmd, t('cmdCopied'));
}

function fallbackCopy(text, successMsg) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    showToast(successMsg || t('copied'));
  } catch {
    showToast(t('copyFailed'));
  }
  document.body.removeChild(ta);
}

function parseDate(str) {
  if (!str) return null;
  let s = String(str).trim();
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(s)) {
    s = s.replace(' ', 'T') + 'Z';
  }
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

function renderNodes(nodes) {
  nodeTable.innerHTML = '';
  if (!nodes || nodes.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td colspan="4" style="text-align: center; color: var(--text-muted); padding: 32px 16px;">${t('emptyNodes')}</td>`;
    nodeTable.appendChild(tr);
    return;
  }

  const locale = resolvedLang() === 'zh' ? 'zh-CN' : 'en-US';

  for (const n of nodes) {
    const tr = document.createElement('tr');
    const repDate = parseDate(n.last_reported_at);
    const reportedDate = repDate
      ? repDate.toLocaleString(locale, {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        })
      : t('neverReported');

    const crDate = parseDate(n.created_at);
    const createdTooltip = crDate
      ? crDate.toLocaleString(locale, {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '';

    const reportedHtml = n.last_reported_at
      ? `<span title="${t('tooltipCreatedAt')}: ${escapeHtml(createdTooltip)}">${escapeHtml(reportedDate)}</span>`
      : `<span style="opacity: 0.6;" title="${t('tooltipCreatedAt')}: ${escapeHtml(createdTooltip)}">${escapeHtml(reportedDate)}</span>`;

    tr.innerHTML = `
      <td><strong>${escapeHtml(n.name)}</strong></td>
      <td>
        <span class="token-box" title="${escapeHtml(n.token)}">${escapeHtml(n.token)}</span>
      </td>
      <td style="color: var(--text-muted);">${reportedHtml}</td>
      <td>
        <div class="actions">
          <button class="action-btn" data-action="cmd" data-token="${escapeHtml(n.token)}" data-name="${escapeHtml(n.name)}" title="${escapeHtml(t('btnInstallCmd'))}">${t('btnInstallCmd')}</button>
          <button class="action-btn" data-action="copy" data-token="${escapeHtml(n.token)}">${t('btnCopyToken')}</button>
          <button class="action-btn" data-action="edit" data-id="${n.id}" data-name="${escapeHtml(n.name)}">${t('btnEditNode')}</button>
          <button class="action-btn" data-action="rotate" data-id="${n.id}">${t('btnRotateToken')}</button>
          <button class="action-btn danger" data-action="delete" data-id="${n.id}">${t('btnDeleteNode')}</button>
        </div>
      </td>
    `;
    nodeTable.appendChild(tr);
  }
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function loadNodes() {
  try {
    const res = await fetch('/api/admin/nodes');
    if (res.status === 401) {
      showView('login');
      return;
    }
    const nodes = await res.json();
    renderNodes(nodes);
  } catch {
    showToast(t('failedLoadNodes'));
  }
}

// Create Node
createForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = nameInput.value.trim();
  if (!name) return;
  try {
    const res = await fetch('/api/admin/nodes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (res.status === 401) {
      showView('login');
      return;
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      showToast(err.error || t('failedCreateNode'));
      return;
    }
    nameInput.value = '';
    showToast(t('nodeCreated'));
    loadNodes();
  } catch {
    showToast(t('failedCreateNode'));
  }
});

// Rotate / Delete / Copy Actions
nodeTable.addEventListener('click', async (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  const action = btn.dataset.action;

  if (action === 'cmd') {
    copyInstallCmd(btn.dataset.token, btn.dataset.name);
  } else if (action === 'copy') {
    copyToken(btn.dataset.token);
  } else if (action === 'edit') {
    editNodeId.value = btn.dataset.id;
    editNodeName.value = btn.dataset.name;
    editNodeModal.classList.add('active');
    setTimeout(() => editNodeName.focus(), 50);
  } else if (action === 'rotate') {
    if (!confirm(t('confirmRotate'))) return;
    try {
      const res = await fetch(`/api/admin/nodes/${btn.dataset.id}/rotate`, { method: 'POST' });
      if (res.status === 401) { showView('login'); return; }
      if (!res.ok) { showToast(t('operationFailed')); return; }
      showToast(t('tokenRotated'));
      loadNodes();
    } catch {
      showToast(t('operationFailed'));
    }
  } else if (action === 'delete') {
    if (!confirm(t('confirmDelete'))) return;
    try {
      const res = await fetch(`/api/admin/nodes/${btn.dataset.id}`, { method: 'DELETE' });
      if (res.status === 401) { showView('login'); return; }
      if (!res.ok) { showToast(t('operationFailed')); return; }
      showToast(t('nodeDeleted'));
      loadNodes();
    } catch {
      showToast(t('operationFailed'));
    }
  }
});

// ── Auth Event Listeners ─────────────────────────────────────────

// 1. Initial Setup
initForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = initUsername.value.trim();
  const password = initPassword.value;
  const confirmPassword = initPasswordConfirm.value;

  if (password !== confirmPassword) {
    showToast(t('passwordsMismatch'));
    return;
  }
  if (password.length < 6) {
    showToast(t('passwordMinLength'));
    return;
  }

  try {
    const res = await fetch('/api/admin/auth/init', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      showToast(data.error || t('operationFailed'));
      return;
    }
    showToast(t('accountCreated'));
    currentAdminUsername = data.username;
    showView('console');
    loadNodes();
  } catch {
    showToast(t('connError'));
  }
});

// 2. Sign In
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = loginUsername.value.trim();
  const password = loginPassword.value;

  try {
    const res = await fetch('/api/admin/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      showToast(data.error || t('invalidCreds'));
      return;
    }
    showToast(t('signedIn'));
    loginPassword.value = '';
    currentAdminUsername = data.username;
    showView('console');
    loadNodes();
  } catch {
    showToast(t('connError'));
  }
});

// 3. Sign Out
logoutBtn.addEventListener('click', async () => {
  try {
    await fetch('/api/admin/auth/logout', { method: 'POST' });
  } catch {}
  showToast(t('signedOut'));
  showView('login');
});

// 4. Profile & Password Modal
openProfileBtn.addEventListener('click', () => {
  profileUsername.value = currentAdminUsername;
  oldPassword.value = '';
  newPassword.value = '';
  newPasswordConfirm.value = '';
  profileModal.classList.add('active');
});

function hideProfileModal() {
  profileModal.classList.remove('active');
}

closeProfileModal.addEventListener('click', hideProfileModal);
cancelProfileBtn.addEventListener('click', hideProfileModal);
profileModal.addEventListener('click', (e) => {
  if (e.target === profileModal) hideProfileModal();
});

profileForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = profileUsername.value.trim();
  const oldPwd = oldPassword.value;
  const newPwd = newPassword.value;
  const confirmPwd = newPasswordConfirm.value;

  if (newPwd) {
    if (!oldPwd) {
      showToast(t('oldPasswordRequired'));
      return;
    }
    if (newPwd.length < 6) {
      showToast(t('passwordMinLength'));
      return;
    }
    if (newPwd !== confirmPwd) {
      showToast(t('passwordsMismatch'));
      return;
    }
  }

  try {
    const res = await fetch('/api/admin/auth/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        oldPassword: oldPwd || undefined,
        newPassword: newPwd || undefined
      })
    });
    const data = await res.json();
    if (!res.ok) {
      showToast(data.error || t('operationFailed'));
      return;
    }
    showToast(t('profileUpdated'));
    currentAdminUsername = data.username;
    hideProfileModal();
  } catch {
    showToast(t('operationFailed'));
  }
});

// 5. Edit Node Modal Handlers
function hideEditNodeModal() {
  editNodeModal.classList.remove('active');
}

closeEditNodeModal.addEventListener('click', hideEditNodeModal);
cancelEditNodeBtn.addEventListener('click', hideEditNodeModal);
editNodeModal.addEventListener('click', (e) => {
  if (e.target === editNodeModal) hideEditNodeModal();
});

editNodeForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = editNodeId.value;
  const name = editNodeName.value.trim();
  if (!name) return;
  try {
    const res = await fetch(`/api/admin/nodes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (res.status === 401) {
      showView('login');
      return;
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      showToast(err.error || t('failedUpdateNode'));
      return;
    }
    showToast(t('nodeUpdated'));
    hideEditNodeModal();
    loadNodes();
  } catch {
    showToast(t('failedUpdateNode'));
  }
});

// ── Bootstrapping ────────────────────────────────────────────────
applyTheme(currentTheme);
applyLang(currentLang);
checkAuth();
