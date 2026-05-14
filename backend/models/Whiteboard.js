const mongoose = require("mongoose");

const whiteboardSchema = new mongoose.Schema(
  {
    roomId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Room", 
      required: true,
      unique: true,
      index: true
    },
    data: { 
      type: String, // Store as JSON string or base64 if needed, for simplicity using JSON string
      default: "[]" 
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Whiteboard", whiteboardSchema);
