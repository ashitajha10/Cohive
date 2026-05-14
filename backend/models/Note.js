const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    roomId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Room", 
      required: false,
      index: true
    },
    title: { 
      type: String, 
      required: true 
    },
    content: { 
      type: String, 
      default: "" 
    },
    createdBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    lastEditedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Note", noteSchema);
