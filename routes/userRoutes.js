const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

// Public routes
router.post('/login', userController.loginUser);

// Protected routes
router.use(authenticate); // All routes below require authentication

// Current user profile
router.get('/me', userController.getCurrentUser);

// Admin only routes
router.get('/', authorize(['admin']), userController.getAllUsers);
router.get('/:id', authorize(['admin']), userController.getUserById);
router.post('/', authorize(['admin']), userController.createUser);
router.put('/:id', authorize(['admin']), userController.updateUser);
router.delete('/:id', authorize(['admin']), userController.deleteUser);

module.exports = router;