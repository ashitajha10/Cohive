const Room = require("../models/room");
const Message = require("../models/Message");
const Note = require("../models/Note");
const Resource = require("../models/Resource");
const Whiteboard = require("../models/Whiteboard");

const createRoom = async (req, res) => {
  console.log("DEBUG: Room creation body:", req.body);
  console.log("DEBUG: Room creation user:", req.user);

  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Room name is required" });
    }

    const room = await Room.create({
      name: name.trim(),
      createdBy: req.user._id,
      members: [req.user._id],
    });

    res.json({
      _id: room._id,
      roomCode: room.roomCode
    });
  } catch (err) {
    console.error("DEBUG Room creation error:", err);
    res.status(500).json({ message: "Error creating room", error: err.message });
  }
};

const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ members: req.user._id });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: "Error fetching rooms" });
  }
};

const joinRoom = async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ message: "Invite code is required" });
    }

    const room = await Room.findOne({ roomCode: code });

    if (!room) {
      return res.status(404).json({ message: "Room not found or invalid invite code" });
    }

    // Prevent duplicate members
    const isAlreadyMember = room.members.some(m => m.toString() === req.user._id.toString());
    if (!isAlreadyMember) {
      room.members.push(req.user._id);
      await room.save();
    }

    res.json(room);
  } catch (err) {
    console.error("Join room error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Only creator can delete
    if (room.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this room" });
    }

    // Delete all associated data
    await Promise.all([
      Message.deleteMany({ roomId: room._id }),
      Note.deleteMany({ roomId: room._id }),
      Resource.deleteMany({ roomId: room._id }),
      Whiteboard.deleteMany({ roomId: room._id })
    ]);

    // Delete the room
    await room.deleteOne();

    res.json({ message: "Room deleted completely" });
  } catch (err) {
    console.error("Delete room error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const leaveRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Remove user from members
    room.members = room.members.filter(m => m.toString() !== req.user._id.toString());

    // Auto-delete if empty
    if (room.members.length === 0) {
      await Promise.all([
        Message.deleteMany({ roomId: room._id }),
        Note.deleteMany({ roomId: room._id }),
        Resource.deleteMany({ roomId: room._id }),
        Whiteboard.deleteMany({ roomId: room._id })
      ]);
      await room.deleteOne();
      return res.json({ message: "Room deleted as it was empty" });
    }

    await room.save();
    res.json({ message: "Left room" });
  } catch (err) {
    console.error("Leave room error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const renameRoom = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Room name is required" });
    }

    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Only creator/admin can rename
    if (room.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to rename this room" });
    }

    room.name = name.trim();
    await room.save();

    res.json(room);
  } catch (err) {
    console.error("Rename room error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { createRoom, getRooms, deleteRoom, joinRoom, leaveRoom, renameRoom };