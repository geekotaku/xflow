# Changelog

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.5] - 2026-09-13

### Added
- Global system overview KPI cards (Monthly Traffic, Today's Traffic, User Overview, Online Nodes) positioned above filters.
- Footer with "Powered by xFlow", dynamic version badge, and GitHub repository link.
- Admin console authentication with password protection, session management, and brute-force protection.
- Quick date range presets ('Today', 'Last 7 Days', 'This Month', 'Last Month') and instant filter updates.
- Collapsible detailed traffic records table with "Show/Hide Details" toggle.
- Widescreen container layout (1240px) for both dashboard and admin console.
- Node last reported timestamp and inline node renaming in admin console.
- Native systemd one-click installer (`install-agent.sh`) for fast agent deployment.
- One-click agent install command copy button in admin console.
- Direct endpoint serving for installation scripts (`/install-agent.sh`, `/install.sh`).
- Non-interactive CLI flags and host timezone auto-detection for server `install.sh`.

### Fixed
- Fixed empty-state layout collapse when no traffic records match the selected filters.

---

## [1.0.4] - 2026-09-11

### 🐛 Bug Fixes
- **Local Timezone Date Filtering**: Fixed an issue where date filter inputs (`startDate`, `endDate`) were parsed as UTC timestamps instead of browser local time, which caused records during the early hours of the selected start date to be omitted and the next day's early hours to be included in non-UTC timezones (e.g. UTC+8).
- **Timezone-Aware Chart Bucketing**: Passed client timezone offset (`tz`) to `/api/stats` and converted UTC timestamps using SQLite's native `datetime(reported_at, tzModifier)` so daily/hourly chart buckets align with the user's local day (00:00 - 24:00) and hour instead of UTC boundaries.
- **Local Date Picker Initialization**: Updated `isoDate()` and month-start initialization to use the browser's local calendar dates instead of UTC to avoid displaying yesterday's date in non-UTC timezones during local morning hours.

### 📊 Dashboard & Analytics
- **Daily-to-Hourly Chart Drill-Down**: Clicking any column in the daily traffic chart instantly drills down into that specific day's 24-hour hourly view, complete with hover cursor indicators, tooltip hints, and a dedicated "Back to Daily" return button to restore the previous date range.
- **Refined Branding & Subtitles**: Updated dashboard header titles and descriptive subtitles in both Chinese and English to formally highlight multi-dimensional Xray node traffic auditing and Sub-Store synchronization.

### ⚙️ Container & Configuration
- **Container Timezone Support (`tzdata`)**: Added the `tzdata` package to the Alpine runtime Docker image and added a `TZ` option in `docker-compose.yml`, enabling scheduled maintenance tasks (e.g. daily 02:00 AM database cleanup and compaction) to execute according to the configured local timezone (e.g. `TZ=Asia/Shanghai`).

### 📖 Documentation
- **Chinese Documentation**: Added [`README_zh-CN.md`](./README_zh-CN.md) with bilingual navigation links.
- **README Improvements**: Updated documentation with preview screenshots, latest configuration options, and Sub-Store integration guides.

---

## [1.0.3] - 2026-09-11

### 🐛 Bug Fixes
- **Default Language to Auto**: Fixed initial language selection to default to 'Auto' (`auto`) instead of hardcoded English (`en`), aligning initial UI state with dynamic browser locale detection.
- **Full-Width Chart Layout**: Removed aspect-ratio constraints so the traffic chart stretches to 100% width across the card, matching the records table width below.

### 📊 Dashboard & Analytics
- **3-Day Hourly Granularity**: Expanded hourly chart granularity to support date ranges up to 3 days (previously 2 days).

### 🌐 Sub-Store Integration
- **Next-Month Expiration Alignment**: Adjusted the default dynamic expiration timestamp (`expire`) to the 1st of the next UTC month at 00:00:00 UTC.

### 🗄️ Database & Storage Optimization
- **Automated Daily Hourly Compaction**: Added a transactional database maintenance task that runs daily at 02:00 AM (and on startup) to aggregate raw reports older than 3 days into 1-hour summaries (`:00:00.000Z`) by user and node, dramatically reducing SQLite row count while preserving full historical accuracy.

---

## [1.0.2] - 2026-09-11

### 🎨 UI & UX Improvements
- **Row Index & Total Count**: Added 1-based continuous sequence column (`#`) to data records and total count display (`Total X records`).
- **Advanced Pagination Toolbar**: Enhanced pagination controls with page size selector (10, 15, 20, 50 / page), first/last page shortcuts (`<<` / `>>`), numeric page buttons, and direct page jumping.
- **Table Height Stabilization**: Auto-pads placeholder rows on the last page to maintain constant table height and eliminate pagination button jumping.

### 🌐 Sub-Store Integration
- **Dynamic End-of-Month Expiration**: Added `expire` field to `/flow` endpoint (`subscription-userinfo` header & JSON) dynamically set to the last second of the current UTC month (customizable via `FLOW_DEFAULT_EXPIRE`).
- **Client Profile Headers**: Added `profile-update-interval` (default: 24h, configurable via `PROFILE_UPDATE_INTERVAL`) and `profile-web-page-url` (configurable via `PROFILE_WEB_PAGE_URL`) for automatic subscription updates and dashboard links in proxy clients.

### ⚙️ CI/CD & Build Optimizations
- **Automated Release Notes**: Automatically parses version-specific changelog notes from `CHANGELOG.md` for GitHub Releases without hardcoded workflows.
- **Docker CI Optimization**: Multi-arch Docker images are built only upon new version release tags (e.g. `v*`), avoiding unnecessary builds on regular branch pushes.

---

## [1.0.1] - 2026-09-10

### 📱 Mobile & UI Improvements
- **Full-Width Responsive Layout**: Optimized screen margin and card paddings for smartphones, expanding available viewport content by 30%+.
- **2x2 Grid Filter Controls**: Filter inputs (User, Node, Start/End Date) adapt into an intuitive 2-column grid on mobile with full-width touch buttons.
- **Horizontal Table Scrolling**: Wrapped stats tables inside responsive `.table-wrap` containers with zero-wrap (`white-space: nowrap`) and native iOS/Android momentum scrolling.
- **Adaptive Chart Labels**: Chart.js automatically consolidates X-axis time labels on mobile devices (max 6 ticks) to avoid overlapping angled clutter.
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
