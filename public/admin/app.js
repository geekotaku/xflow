const nodeTable = document.getElementById('nodeTable');
const createForm = document.getElementById('createForm');
const nameInput = document.getElementById('nameInput');
const toast = document.getElementById('toast');

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

async function copyToken(token) {
  try {
    await navigator.clipboard.writeText(token);
    showToast('Token copied to clipboard');
  } catch {
    showToast('Failed to copy, please select and copy manually');
  }
}

function renderNodes(nodes) {
  nodeTable.innerHTML = '';
  if (!nodes || nodes.length === 0) {
    nodeTable.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--text-muted);padding:24px;">No nodes created yet</td></tr>';
    return;
  }
  for (const node of nodes) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-weight:600">${node.name}</td>
      <td><code>${node.token}</code></td>
      <td style="color:var(--text-muted)">${new Date(node.created_at).toLocaleString('en-US', { hour12: false })}</td>
      <td class="actions">
        <button class="action-btn" data-action="copy" data-token="${node.token}">Copy Token</button>
        <button class="action-btn" data-action="rotate" data-id="${node.id}">Rotate</button>
        <button class="action-btn danger" data-action="delete" data-id="${node.id}">Delete</button>
      </td>
    `;
    nodeTable.appendChild(tr);
  }
}

async function loadNodes() {
  const res = await fetch('/admin/api/nodes');
  const nodes = await res.json();
  renderNodes(nodes);
}

createForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = nameInput.value.trim();
  if (!name) return;
  const res = await fetch('/admin/api/nodes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    showToast(err.error || 'Failed to create node');
    return;
  }
  nameInput.value = '';
  await loadNodes();
  showToast('Node created successfully');
});

nodeTable.addEventListener('click', async (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const action = btn.dataset.action;

  if (action === 'copy') {
    await copyToken(btn.dataset.token);
    return;
  }
  if (action === 'rotate') {
    if (!confirm('Regenerating this token will revoke the current token immediately. The agent on this node will need an updated configuration. Continue?')) return;
    await fetch(`/admin/api/nodes/${btn.dataset.id}/rotate`, { method: 'POST' });
    await loadNodes();
    showToast('Token regenerated');
    return;
  }
  if (action === 'delete') {
    if (!confirm('Delete this node? (Historical traffic records will be preserved)')) return;
    await fetch(`/admin/api/nodes/${btn.dataset.id}`, { method: 'DELETE' });
    await loadNodes();
    showToast('Node deleted');
  }
});

loadNodes();
