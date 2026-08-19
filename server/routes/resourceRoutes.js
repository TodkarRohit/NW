const express = require('express');
const router = express.Router();
const { getResources, createResource, deleteResource } = require('../controllers/resourceController');
const { protect } = require('../middleware/authMiddleware');
const { validateResource } = require('../middleware/validationMiddleware');

// Public route: GET /api/resources (allows browsing without login)
router.get('/', getResources);

// Protected routes: Manage resources
router.post('/', protect, validateResource, createResource);
router.delete('/:id', protect, deleteResource);

module.exports = router;
