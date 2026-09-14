import { Router } from 'express';
import { db } from '../services/db';
import type { NodeRow, IncomingReport } from '../services/types';
import { logger, formatLocalTime, toMB, parseDateIso } from '../services/utils';

const router = Router();

const findNodeByToken = db.prepare('SELECT * FROM nodes WHERE token = ?');
const insertReport = db.prepare(
  'INSERT INTO traffic_reports (node, user, uplink, downlink, reported_at) VALUES (?, ?, ?, ?, ?)'
);

router.post('/', (req, res) => {
  const auth = req.header('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice('Bearer '.length) : '';
  if (!token) {
    logger.error(`[ERROR] Report rejected: missing bearer token (IP: ${req.ip})`);
    return res.status(401).json({ error: 'missing bearer token' });
  }

  // Node identity is derived from the token, never trusted from the body —
  // this stops one node from reporting traffic under another node's name.
  const node = findNodeByToken.get(token) as NodeRow | undefined;
  if (!node) {
    logger.error(`[ERROR] Report rejected: invalid token "${token}" (IP: ${req.ip})`);
    return res.status(401).json({ error: 'invalid token' });
  }

  const body = req.body as IncomingReport;
  if (!body || !Array.isArray(body.users) || body.users.length === 0) {
    logger.error(`[ERROR] Report rejected for node "${node.name}": body must include a non-empty users array`);
    return res.status(400).json({ error: 'body must include a non-empty users array' });
  }

  const reportedAt = parseDateIso(body.timestamp);

  const userSummaries = body.users
    .filter((entry) => typeof entry?.user === 'string' && entry.user)
    .map((entry) => {
      const up = Number(entry.uplink) || 0;
      const down = Number(entry.downlink) || 0;
      return `${entry.user}: upload ${toMB(up)}, download ${toMB(down)}`;
    });

  const reportedAtLocal = formatLocalTime(new Date(reportedAt));
  logger.info(
    `[INFO] Node "${node.name}" report at ${reportedAtLocal} (${body.users.length} users):\n` +
      userSummaries.map((s) => `  - ${s}`).join('\n'),
  );

  const insertMany = db.transaction((entries: IncomingReport['users']) => {
    for (const entry of entries) {
      if (typeof entry.user !== 'string' || !entry.user) continue;
      const uplink = Number(entry.uplink) || 0;
      const downlink = Number(entry.downlink) || 0;
      if (uplink < 0 || downlink < 0) continue;
      if (uplink === 0 && downlink === 0) continue;
      insertReport.run(node.name, entry.user, uplink, downlink, reportedAt);
    }
  });
  insertMany(body.users);

  res.status(204).end();
});

export default router;
