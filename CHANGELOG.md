# Changelog

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2026-09-10

### 📱 Mobile & UI Improvements
- **Full-Width Responsive Layout**: Optimized screen margin and card paddings for smartphones, expanding available viewport content by 30%+.
- **2x2 Grid Filter Controls**: Filter inputs (User, Node, Start/End Date) adapt into an intuitive 2-column grid on mobile with full-width touch buttons.
- **Horizontal Table Scrolling**: Wrapped stats tables inside responsive `.table-wrap` containers with zero-wrap (`white-space: nowrap`) and native iOS/Android momentum scrolling.
- **Adaptive Chart Labels**: Chart.js automatically consolidates X-axis time labels on mobile devices (max 6 ticks) to avoid overlapping angled clutter.
- **Table Height Stabilization**: Auto-pads placeholder rows on the last page to maintain constant 10-row table height and eliminate pagination button jumping.
- **Admin Mobile Support**: Node/Token management page now fully supports mobile viewports and long token horizontal scrolling.

### 🛡️ Docker & Reliability
- **Container Permission Normalization**: Standardized Dockerfile execution to default `root` user, preventing host-mount volume permission (`EACCES: permission denied`) issues.
- **Agent Directory Auto-Creation**: `xflow-agent` automatically ensures recursive creation of the parent directory before writing the state file (`.xflow-state.json`).

---

## [1.0.0] - 2026-09-10

### ✨ Initial Release
- **Zero-Loss Delta Tracking**: Agent monitors cumulative counters (`reset=false`) without zeroing Xray counters, eliminating query-report race condition traffic loss.
- **Persistent State File**: Byte cursors are persisted to `.xflow-state.json` to safely resume tracking across restarts and calibrate baselines on first boot.
- **Multi-View Traffic Dashboard**: Clean web dashboard with breakdowns by user, by node, and total bandwidth.
- **Sub-Store Subscription Endpoint**: `/flow` endpoint supporting `subscription-userinfo` headers and JSON details with custom default quotas.
- **Automatic Data Retention**: Database auto-cleans traffic reports older than `RETENTION_DAYS` (default: 90 days / 3 months).
- **One-Click Install Scripts**: Shell installers for automated systemd service deployment on both server and agent nodes.
