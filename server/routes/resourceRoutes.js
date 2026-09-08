const express = require('express');
const router = express.Router();
const { getResources, createResource, deleteResource } = require('../controllers/resourceController');
const { protect, requireAdmin } = require('../middleware/authMiddleware');
const { validateResource } = require('../middleware/validationMiddleware');

// Public route: GET /api/resources (allows browsing without login)
router.get('/', getResources);

// Protected routes: Manage resources (Admin only)
router.post('/', protect, requireAdmin, validateResource, createResource);
router.delete('/:id', protect, requireAdmin, deleteResource);

module.exports = router;
