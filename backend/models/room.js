const mongoose = require("mongoose");

const generateRoomCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const roomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    roomCode: { 
      type: String, 
      unique: true 
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", index: true }],
  },
  { timestamps: true }
);

roomSchema.pre("save", async function () {
  if (this.isNew || !this.roomCode) {
    let isUnique = false;
    while (!isUnique) {
      const code = generateRoomCode();
      const existingRoom = await mongoose.models.Room.findOne({ roomCode: code });
      if (!existingRoom) {
        this.roomCode = code;
        isUnique = true;
      }
    }
  }
});

module.exports = mongoose.model("Room", roomSchema);