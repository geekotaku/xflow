import { Router } from 'express';
import crypto from 'crypto';
import { db } from '../db';
import type { NodeRow } from '../types';

const router = Router();

function generateToken(): string {
  return crypto.randomBytes(24).toString('base64url');
}

router.get('/api/nodes', (_req, res) => {
  const nodes = db.prepare('SELECT * FROM nodes ORDER BY created_at DESC').all() as NodeRow[];
  res.json(nodes);
});

router.post('/api/nodes', (req, res) => {
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

router.post('/api/nodes/:id/rotate', (req, res) => {
  const id = Number(req.params.id);
  const token = generateToken();
  const info = db.prepare('UPDATE nodes SET token = ? WHERE id = ?').run(token, id);
  if (info.changes === 0) return res.status(404).json({ error: 'node not found' });
  const node = db.prepare('SELECT * FROM nodes WHERE id = ?').get(id) as NodeRow;
  res.json(node);
});

router.delete('/api/nodes/:id', (req, res) => {
  const id = Number(req.params.id);
  const info = db.prepare('DELETE FROM nodes WHERE id = ?').run(id);
  if (info.changes === 0) return res.status(404).json({ error: 'node not found' });
  res.status(204).end();
});

export default router;
