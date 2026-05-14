const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: { 
      type: String, 
      enum: ['friend_request', 'friend_accepted', 'room_invite', 'mention', 'room_join'],
      required: true 
    },
    read: { type: Boolean, default: false },
    data: {
      roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
      roomName: String,
      messageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
      text: String,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
