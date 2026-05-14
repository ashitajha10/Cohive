const router = require("express").Router();
const { createRoom, getRooms, deleteRoom, joinRoom, leaveRoom, renameRoom } = require("../controllers/room.controller");
const auth = require("../middleware/auth.middleware");
const Room = require("../models/room");

router.post("/", auth, createRoom);
router.post("/join", auth, joinRoom);
router.get("/", auth, getRooms);
router.delete("/:id", auth, deleteRoom);
router.post("/:id/leave", auth, leaveRoom);
router.patch("/:id", auth, renameRoom);

router.get("/:id", auth, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate("members", "name email avatar displayName status")
      .populate("createdBy", "name email avatar displayName status");

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Check membership
    const isMember = room.members.some(m => m._id.toString() === req.user._id.toString());
    if (!isMember) {
      return res.status(403).json({ message: "Access denied. You are not a member of this room." });
    }

    res.json(room);
  } catch (err) {
    console.error("Get room error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
