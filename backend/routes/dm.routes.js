const router = require("express").Router();
const DirectMessage = require("../models/DirectMessage");
const auth = require("../middleware/auth.middleware");

// GET /api/dm/:friendId - Get message history with a friend
router.get("/:friendId", auth, async (req, res) => {
  try {
    const friendId = req.params.friendId;
    const userId = req.user._id;

    const messages = await DirectMessage.find({
      $or: [
        { sender: userId, receiver: friendId },
        { sender: friendId, receiver: userId }
      ]
    })
      .populate("sender", "name email avatar displayName status")
      .populate("receiver", "name email avatar displayName status")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error("Fetch DM history error:", err);
    res.status(500).json({ message: "Error fetching direct messages" });
  }
});

// POST /api/dm/read/:friendId - Mark messages from friend as read
router.post("/read/:friendId", auth, async (req, res) => {
  try {
    const friendId = req.params.friendId;
    const userId = req.user._id;

    await DirectMessage.updateMany(
      { sender: friendId, receiver: userId, read: false },
      { $set: { read: true } }
    );

    res.json({ message: "Messages marked as read" });
  } catch (err) {
    console.error("Mark read error:", err);
    res.status(500).json({ message: "Error marking messages as read" });
  }
});

module.exports = router;
