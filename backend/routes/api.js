import { Router } from 'express';
import {
  getItems,
  addNewItems,
  getSelection,
  updateSelection,
} from '../services/stateService.js';

const router = Router();

/**
 * GET /api/items?offset=0&limit=20&filter=123&selected=false
 */
router.get('/items', (req, res) => {
  const { offset = 0, limit = 20, filter = '', selected = 'false' } = req.query;
  const isFiltered = Array.isArray(selected)
    ? selected.map(s => s.toLowerCase() === 'true')
    : [selected.toLowerCase() === 'true'];

  const result = getItems({
    offset: Number(offset),
    limit: Number(limit),
    filter: filter.toString(),
    selected: isFiltered[0],
  });

  res.json(result);
});

/**
 * POST /api/items/batch-add
 * { ids: [123456, 789012] }
 */
router.post('/items/batch-add', (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'Invalid or empty IDs array' });
  }
  addNewItems(ids);
  res.json({ added: ids.length });
});

/**
 * GET /api/selection
 * Возвращает { selected: [...], sortOrder: [...] }
 */
router.get('/selection', (req, res) => {
  res.json(getSelection());
});

/**
 * POST /api/selection
 * { selected: [...], sortOrder: [...] }
 */
router.post('/selection', (req, res) => {
  const { selected, sortOrder } = req.body;
  if (!Array.isArray(selected) || !Array.isArray(sortOrder)) {
    return res.status(400).json({ error: 'selected and sortOrder must be arrays' });
  }
  updateSelection(selected, sortOrder);
  res.json({ success: true });
});

export default router;