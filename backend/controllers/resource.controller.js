const Resource = require("../models/Resource");
const Room = require("../models/room");

exports.createResource = async (req, res) => {
  try {
    const { roomId, title, type, url } = req.body;
    const userId = req.user._id;

    // Verify room existence and membership
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (!room.members.some(m => m.toString() === userId.toString())) {
      return res.status(403).json({ message: "You are not a member of this room" });
    }

    const resource = await Resource.create({
      roomId,
      title,
      type,
      url,
      uploadedBy: userId,
    });

    const populatedResource = await resource.populate("uploadedBy", "name avatar");

    res.status(201).json(populatedResource);
  } catch (err) {
    console.error("Create resource error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getResourcesByRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user._id;

    // Verify room membership
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (!room.members.some(m => m.toString() === userId.toString())) {
      return res.status(403).json({ message: "You are not a member of this room" });
    }

    const resources = await Resource.find({ roomId })
      .populate("uploadedBy", "name avatar")
      .sort({ createdAt: -1 });

    res.json(resources);
  } catch (err) {
    console.error("Get resources error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteResource = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const resource = await Resource.findById(id);
    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    const room = await Room.findById(resource.roomId);
    
    // Only uploader or room admin (creator) can delete
    const isUploader = resource.uploadedBy.toString() === userId.toString();
    const isRoomAdmin = room.createdBy.toString() === userId.toString();

    if (!isUploader && !isRoomAdmin) {
      return res.status(403).json({ message: "Unauthorized to delete this resource" });
    }

    await Resource.findByIdAndDelete(id);
    res.json({ message: "Resource deleted" });
  } catch (err) {
    console.error("Delete resource error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
