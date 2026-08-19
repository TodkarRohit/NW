const express = require('express');
const router = express.Router();
const { getUsers } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Protected route: GET /api/users
router.get('/', protect, getUsers);

module.exports = router;
