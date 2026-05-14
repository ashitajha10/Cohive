const Note = require("../models/Note");
const Room = require("../models/room");

exports.createNote = async (req, res) => {
  try {
    const { roomId, title, content } = req.body;
    const userId = req.user._id;

    if (roomId) {
      const room = await Room.findById(roomId);
      if (!room) return res.status(404).json({ message: "Room not found" });

      if (!room.members.some(m => m.toString() === userId.toString())) {
        return res.status(403).json({ message: "Not a room member" });
      }
    }

    const note = await Note.create({
      roomId: roomId || null,
      title: title || "Untitled Record",
      content: content || "",
      createdBy: userId,
      lastEditedBy: userId
    });

    const populatedNote = await note.populate("createdBy lastEditedBy", "name avatar");
    res.status(201).json(populatedNote);
  } catch (err) {
    console.error("Create note error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getUserNotes = async (req, res) => {
  try {
    const userId = req.user._id;
    const notes = await Note.find({ createdBy: userId, roomId: null })
      .sort({ updatedAt: -1 });
    res.json(notes);
  } catch (err) {
    console.error("Get user notes error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getNotesByRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user._id;

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });

    if (!room.members.some(m => m.toString() === userId.toString())) {
      return res.status(403).json({ message: "Not a room member" });
    }

    const notes = await Note.find({ roomId })
      .populate("createdBy lastEditedBy", "name avatar")
      .sort({ updatedAt: -1 });

    res.json(notes);
  } catch (err) {
    console.error("Get notes error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getNoteById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const note = await Note.findById(id).populate("createdBy lastEditedBy", "name avatar");
    if (!note) return res.status(404).json({ message: "Note not found" });

    if (note.roomId) {
      const room = await Room.findById(note.roomId);
      if (!room.members.some(m => m.toString() === userId.toString())) {
        return res.status(403).json({ message: "Unauthorized" });
      }
    } else if (note.createdBy._id.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.json(note);
  } catch (err) {
    console.error("Get note by ID error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const userId = req.user._id;

    const note = await Note.findById(id);
    if (!note) return res.status(404).json({ message: "Note not found" });

    if (note.roomId) {
      const room = await Room.findById(note.roomId);
      if (!room.members.some(m => m.toString() === userId.toString())) {
        return res.status(403).json({ message: "Not a room member" });
      }
    } else if (note.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    note.title = title !== undefined ? title : note.title;
    note.content = content !== undefined ? content : note.content;
    note.lastEditedBy = userId;
    
    await note.save();
    
    const updatedNote = await note.populate("createdBy lastEditedBy", "name avatar");
    res.json(updatedNote);
  } catch (err) {
    console.error("Update note error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const note = await Note.findById(id);
    if (!note) return res.status(404).json({ message: "Note not found" });

    if (note.roomId) {
      const room = await Room.findById(note.roomId);
      const isAdmin = room.createdBy.toString() === userId.toString();
      const isOwner = note.createdBy.toString() === userId.toString();
      if (!isAdmin && !isOwner) return res.status(403).json({ message: "Unauthorized" });
    } else if (note.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Note.findByIdAndDelete(id);
    res.json({ message: "Note deleted" });
  } catch (err) {
    console.error("Delete note error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
