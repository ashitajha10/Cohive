const router = require("express").Router();
const Message = require("../models/Message");
const auth = require("../middleware/auth.middleware");

// GET /api/messages/:roomId/messages
router.get("/:roomId/messages", auth, async (req, res) => {
  try {
    const messages = await Message.find({
      roomId: req.params.roomId,
    })
      .populate("sender", "name email")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Error fetching messages" });
  }
});

module.exports = router;
