import express from "express";
import path from "path";
import { RETENTION_DAYS } from "./db"; // ensures schema exists and cleanup job starts
import reportRouter from "./routes/report";
import statsRouter from "./routes/stats";
import flowRouter from "./routes/flow";
import adminRouter from "./routes/admin";

const app = express();
app.use(express.json({ limit: "1mb" }));

const PORT = Number(process.env.PORT) || 3000;

// /admin is not protected at the app level — put it behind Basic Auth (or
// an IP allowlist) in your reverse proxy, scoped to this path.
app.use("/report", reportRouter);
app.use("/api/stats", statsRouter);
app.use("/flow", flowRouter);
app.use("/admin", adminRouter);
app.use(
  "/admin",
  express.static(path.join(__dirname, "..", "public", "admin")),
);
app.use(express.static(path.join(__dirname, "..", "public", "dashboard")));

app.listen(PORT, () => {
  console.log(`xflow listening on :${PORT} (data retention: ${RETENTION_DAYS > 0 ? `${RETENTION_DAYS} days` : 'unlimited'})`);
});
