const Whiteboard = require("../models/Whiteboard");
const Room = require("../models/room");

exports.getWhiteboardByRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user._id;

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });

    if (!room.members.some(m => m.toString() === userId.toString())) {
      return res.status(403).json({ message: "Not a room member" });
    }

    let whiteboard = await Whiteboard.findOne({ roomId });
    if (!whiteboard) {
      whiteboard = await Whiteboard.create({ roomId, data: "[]" });
    }

    res.json(whiteboard);
  } catch (err) {
    console.error("Get whiteboard error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateWhiteboard = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { data } = req.body;
    const userId = req.user._id;

    const room = await Room.findById(roomId);
    if (!room.members.some(m => m.toString() === userId.toString())) {
      return res.status(403).json({ message: "Not a room member" });
    }

    const whiteboard = await Whiteboard.findOneAndUpdate(
      { roomId },
      { data },
      { new: true, upsert: true }
    );

    res.json(whiteboard);
  } catch (err) {
    console.error("Update whiteboard error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
