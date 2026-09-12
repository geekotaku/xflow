import express from "express";
import path from "path";
import { RETENTION_DAYS } from "./services/db"; // ensures schema exists and cleanup job starts
import reportRouter from "./routes/report";
import statsRouter from "./routes/stats";
import flowRouter from "./routes/flow";
import nodesRouter from "./routes/nodes";
import authRouter from "./routes/auth";
import { syncAdminFromEnv, requireAdminAuth } from "./services/auth";

const app = express();
app.use(express.json({ limit: "1mb" }));

const PORT = Number(process.env.PORT) || 3000;

// Sync admin credentials if ADMIN_PASSWORD environment variable is set
syncAdminFromEnv();

// Public protocol & API routes
app.use("/report", reportRouter);
app.use("/flow", flowRouter);
app.use("/api/stats", statsRouter);

// Admin Auth API (/api/admin/auth/status, /init, /login, /logout, /profile)
app.use("/api/admin/auth", authRouter);

// Protect all remaining /api/admin/* endpoints
app.use("/api/admin", requireAdminAuth);
app.use("/api/admin/nodes", nodesRouter);

// Static Web UIs
app.use(
  "/admin",
  express.static(path.join(__dirname, "..", "public", "admin")),
);
app.use(express.static(path.join(__dirname, "..", "public", "dashboard")));

app.listen(PORT, () => {
  console.log(
    `xflow listening on :${PORT} (data retention: ${RETENTION_DAYS > 0 ? `${RETENTION_DAYS} days` : "unlimited"})`,
  );
});
