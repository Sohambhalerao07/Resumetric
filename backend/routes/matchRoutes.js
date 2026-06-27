/**
 * matchRoutes.js — Route definitions for the match API
 *
 * WHY: Routes are declared here and nowhere else.
 * The route file is the only place that binds middleware to endpoints.
 * This makes it easy to see at a glance what middleware runs for each route.
 */

import { Router } from 'express';
import uploadMiddleware from '../middleware/uploadMiddleware.js';
import matchController  from '../controllers/matchController.js';

const router = Router();

/**
 * POST /api/match
 *
 * Middleware chain (runs in order):
 *   1. uploadMiddleware — validate + store the PDF file
 *   2. matchController.handleMatch — run the analysis pipeline
 */
router.post(
  '/match',
  uploadMiddleware,
  matchController.handleMatch
);

/**
 * GET /api/health
 * Simple health check endpoint for monitoring and readiness checks.
 */
router.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
