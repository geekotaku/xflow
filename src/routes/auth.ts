import { Router, Request, Response } from "express";
import {
  getAdminUser,
  createAdminUser,
  updateAdminCredentials,
  verifyPassword,
  createSessionToken,
  verifySessionToken,
  rotateSessionSecret,
  parseSessionToken,
  setSessionCookie,
  clearSessionCookie,
  requireAdminAuth,
  AuthenticatedRequest,
  checkLoginLimit,
} from "../services/auth";
import { logger } from "../services/utils";

const router = Router();

// GET /api/admin/auth/status
router.get("/status", (req: AuthenticatedRequest, res: Response) => {
  const admin = getAdminUser();
  if (!admin) {
    res.json({ initialized: false, loggedIn: false });
    return;
  }
  const token = parseSessionToken(req);
  const loggedIn = !!token && verifySessionToken(token, admin.session_secret);
  res.json({
    initialized: true,
    loggedIn,
    username: loggedIn ? admin.username : undefined,
  });
});

// POST /api/admin/auth/init
router.post("/init", (req: Request, res: Response) => {
  if (getAdminUser()) {
    res
      .status(403)
      .json({ error: "Admin account has already been initialized" });
    return;
  }

  const username =
    typeof req.body?.username === "string" ? req.body.username.trim() : "";
  const password =
    typeof req.body?.password === "string" ? req.body.password : "";

  if (!username || username.length < 2) {
    res.status(400).json({ error: "Username must be at least 2 characters" });
    return;
  }
  if (!password || password.length < 6) {
    res.status(400).json({ error: "Password must be at least 6 characters" });
    return;
  }

  const admin = createAdminUser(username, password);
  const token = createSessionToken(admin.session_secret);
  setSessionCookie(res, token);
  res.status(201).json({ success: true, username: admin.username, token });
});

// POST /api/admin/auth/login
router.post("/login", (req: Request, res: Response) => {
  const waitSeconds = checkLoginLimit(req);
  if (waitSeconds) {
    res.status(429).json({
      error: `Too many failed login attempts. Please try again in ${waitSeconds} seconds.`,
    });
    return;
  }

  const admin = getAdminUser();
  if (!admin) {
    res.status(400).json({
      error: "System not initialized. Please set up an admin account first.",
    });
    return;
  }

  const username = typeof req.body?.username === "string" ? req.body.username.trim() : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";

  if (!username || !password) {
    res.status(400).json({ error: "Username and password are required" });
    return;
  }

  if (
    username.toLowerCase() !== admin.username.toLowerCase() ||
    !verifyPassword(password, admin.password_hash, admin.salt)
  ) {
    const lockedSeconds = checkLoginLimit(req, true);
    if (lockedSeconds) {
      res.status(429).json({
        error: `Too many failed login attempts. Please try again in ${lockedSeconds} seconds.`,
      });
      return;
    }
    res.status(401).json({ error: "Invalid username or password" });
    return;
  }

  // Clear failed attempts on successful login
  checkLoginLimit(req, false);

  const token = createSessionToken(admin.session_secret);
  setSessionCookie(res, token);
  res.json({ success: true, username: admin.username, token });
});

// POST /api/admin/auth/logout
router.post("/logout", (req: Request, res: Response) => {
  const token = parseSessionToken(req);
  const admin = getAdminUser();
  // Only rotate secret if caller actually presents a valid admin session
  if (token && admin && verifySessionToken(token, admin.session_secret)) {
    rotateSessionSecret();
  }
  clearSessionCookie(res);
  res.json({ success: true });
});

// POST /api/admin/auth/profile
router.post(
  "/profile",
  requireAdminAuth,
  (req: AuthenticatedRequest, res: Response) => {
    const admin = getAdminUser();
    if (!admin) {
      res.status(404).json({ error: "Admin user not found" });
      return;
    }

    const newUsername =
      typeof req.body?.username === "string"
        ? req.body.username.trim()
        : admin.username;
    const oldPassword =
      typeof req.body?.oldPassword === "string" ? req.body.oldPassword : "";
    const newPassword =
      typeof req.body?.newPassword === "string" ? req.body.newPassword : "";

    if (!newUsername || newUsername.length < 2) {
      res.status(400).json({ error: "Username must be at least 2 characters" });
      return;
    }

    if (newPassword) {
      if (!oldPassword) {
        res
          .status(400)
          .json({
            error: "Current password is required to set a new password",
          });
        return;
      }
      if (!verifyPassword(oldPassword, admin.password_hash, admin.salt)) {
        res.status(400).json({ error: "Current password is incorrect" });
        return;
      }
      if (newPassword.length < 6) {
        res
          .status(400)
          .json({ error: "New password must be at least 6 characters" });
        return;
      }
    }

    try {
      const rotateSecret = !!newPassword;
      updateAdminCredentials(
        newUsername,
        newPassword || undefined,
        rotateSecret,
      );

      if (rotateSecret) {
        const updatedAdmin = getAdminUser()!;
        const newToken = createSessionToken(updatedAdmin.session_secret);
        setSessionCookie(res, newToken);
      }

      res.json({ success: true, username: newUsername });
    } catch (err: any) {
      logger.error("[AUTH ERROR] Failed to update profile:", err);
      res.status(500).json({ error: "Failed to update profile" });
    }
  },
);

export default router;
