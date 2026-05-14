const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
  {
    roomId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Room", 
      required: true,
      index: true
    },
    title: { 
      type: String, 
      required: true 
    },
    type: { 
      type: String, 
      enum: ["pdf", "image", "link"], 
      required: true 
    },
    url: { 
      type: String, 
      required: true 
    },
    uploadedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resource", resourceSchema);
