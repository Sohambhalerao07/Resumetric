/**
 * server.js — Application entry point
 *
 * WHY: server.js does exactly three things:
 *   1. Bootstrap (load env, create Express app, apply global middleware)
 *   2. Mount routes
 *   3. Start the HTTP listener
 *
 * Nothing else. No business logic. No route definitions. No service calls.
 *
 * This structure means the Express app can be imported and tested
 * independently of starting the HTTP listener.
 */

import 'dotenv/config';   // Must be first: loads .env before any other import reads process.env
import express from 'express';
import cors    from 'cors';
import path    from 'path';
import { fileURLToPath } from 'url';

import matchRoutes  from './routes/matchRoutes.js';
import errorHandler from './middleware/errorHandler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── App Configuration ────────────────────────────────────────────────────────

const PORT         = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// ── Express Application ──────────────────────────────────────────────────────

const app = express();

// ── Global Middleware ────────────────────────────────────────────────────────

// CORS: only allow requests from the configured frontend origin
app.use(cors({
  origin:      FRONTEND_URL,
  methods:     ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Parse JSON bodies (for any endpoints that receive JSON)
app.use(express.json({ limit: '1mb' }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// ── Routes ───────────────────────────────────────────────────────────────────

// All API routes are prefixed with /api
app.use('/api', matchRoutes);

// 404 handler for unmatched routes
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found.',
  });
});

// ── Global Error Handler ─────────────────────────────────────────────────────
// MUST be registered AFTER all routes — Express identifies error handlers by arity (4 params)
app.use(errorHandler);

// ── Start Server ─────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`[server] Resume Matcher API running on http://localhost:${PORT}`);
  console.log(`[server] Accepting requests from: ${FRONTEND_URL}`);
  console.log(`[server] Model: ${process.env.MODEL || '(not set)'}`);
});

export default app;
