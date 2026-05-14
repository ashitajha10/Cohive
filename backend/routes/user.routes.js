const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const userController = require('../controllers/user.controller');

const router = express.Router();

router.get('/me', authMiddleware, userController.getMe);
router.put('/profile', authMiddleware, userController.updateProfile);

// Friend System Routes
router.get('/search', authMiddleware, userController.searchUsers);
router.get('/friends', authMiddleware, userController.getFriends);
router.delete('/friends/:friendId', authMiddleware, userController.removeFriend);

// Friend Requests
router.post('/friend-request', authMiddleware, userController.sendFriendRequest);
router.get('/friend-requests', authMiddleware, userController.getFriendRequests);
router.post('/friend-request/respond', authMiddleware, userController.respondToFriendRequest);
router.delete('/friend-request/cancel/:receiverId', authMiddleware, userController.cancelFriendRequest);

module.exports = router;