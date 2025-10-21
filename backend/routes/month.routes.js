import express from 'express';
import monthController from '../controllers/month.controller.js';

const router = express.Router();

// GET /api/months/:year/:month/summary
router.get('/:year/:month/summary', monthController.getMonthSummary);

// GET /api/months/:year/:month/entries
router.get('/:year/:month/entries', monthController.getMonthEntries);

// GET /api/months/:year/status
router.get('/:year/status', monthController.getYearStatus);

// GET /api/months/:year/sentiment - NEW
router.get('/:year/sentiment', monthController.getYearSentiment);

// POST /api/months/entry
router.post('/entry', monthController.createEntry);

export default router;