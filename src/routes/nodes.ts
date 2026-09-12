import { Router } from 'express';
import crypto from 'crypto';
import { db } from '../services/db';
import type { NodeRow } from '../services/types';

const router = Router();

function generateToken(): string {
  return crypto.randomBytes(24).toString('base64url');
}

// GET /api/admin/nodes
router.get('/', (_req, res) => {
  const nodes = db.prepare('SELECT * FROM nodes ORDER BY created_at DESC').all() as NodeRow[];
  res.json(nodes);
});

// POST /api/admin/nodes
router.post('/', (req, res) => {
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  if (!name) return res.status(400).json({ error: 'name is required' });

  const token = generateToken();
  try {
    const info = db.prepare('INSERT INTO nodes (name, token) VALUES (?, ?)').run(name, token);
    const node = db.prepare('SELECT * FROM nodes WHERE id = ?').get(info.lastInsertRowid) as NodeRow;
    res.status(201).json(node);
  } catch {
    res.status(409).json({ error: 'a node with this name already exists' });
  }
});

// POST /api/admin/nodes/:id/rotate
router.post('/:id/rotate', (req, res) => {
  const id = Number(req.params.id);
  const token = generateToken();
  const info = db.prepare('UPDATE nodes SET token = ? WHERE id = ?').run(token, id);
  if (info.changes === 0) return res.status(404).json({ error: 'node not found' });
  const node = db.prepare('SELECT * FROM nodes WHERE id = ?').get(id) as NodeRow;
  res.json(node);
});

// PATCH /api/admin/nodes/:id
router.patch('/:id', (req, res) => {
  const id = Number(req.params.id);
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  if (!name) return res.status(400).json({ error: 'name is required' });

  const oldNode = db.prepare('SELECT * FROM nodes WHERE id = ?').get(id) as NodeRow | undefined;
  if (!oldNode) return res.status(404).json({ error: 'node not found' });

  try {
    db.transaction(() => {
      db.prepare('UPDATE nodes SET name = ? WHERE id = ?').run(name, id);
      db.prepare('UPDATE traffic_reports SET node = ? WHERE node = ?').run(name, oldNode.name);
    })();
    const node = db.prepare('SELECT * FROM nodes WHERE id = ?').get(id) as NodeRow;
    res.json(node);
  } catch (err: any) {
    if (err?.code === 'SQLITE_CONSTRAINT_UNIQUE' || String(err).includes('UNIQUE')) {
      res.status(409).json({ error: 'a node with this name already exists' });
    } else {
      res.status(500).json({ error: 'failed to update node' });
    }
  }
});

// DELETE /api/admin/nodes/:id
router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  const info = db.prepare('DELETE FROM nodes WHERE id = ?').run(id);
  if (info.changes === 0) return res.status(404).json({ error: 'node not found' });
  res.status(204).end();
});

export default router;
