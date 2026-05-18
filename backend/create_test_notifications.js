const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const dns = require('dns');

// Set global DNS servers to avoid ECONNREFUSED errors with MongoDB Atlas SRV records
if (dns.setServers) {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
}

dotenv.config();

const User = require('./models/User');
const Notification = require('./models/Notification');
const Room = require('./models/Room');

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB.");

    const users = await User.find({});
    console.log(`Total users found: ${users.length}`);
    users.forEach(u => console.log(`- ${u.name} (${u.email}) ID: ${u._id}`));

    const rooms = await Room.find({});
    console.log(`Total rooms found: ${rooms.length}`);
    rooms.forEach(r => console.log(`- ${r.name} ID: ${r._id}`));

    // Look for Ashita
    const ashita = users.find(u => u.email.toLowerCase().includes('ashita'));
    if (!ashita) {
      console.log("Could not find user 'ashita'. Please make sure a user is registered or logged in.");
      mongoose.disconnect();
      return;
    }

    const otherUser = users.find(u => u._id.toString() !== ashita._id.toString()) || ashita;

    // Find or create dummy room
    let room = rooms[0];
    if (!room) {
      room = await Room.create({
        name: "Enterprise Cosmic Hub",
        code: "COSMIC-99",
        createdBy: otherUser._id
      });
      console.log(`Created dummy room: ${room.name}`);
    }

    // Clear notifications for Ashita
    await Notification.deleteMany({ recipient: ashita._id });
    console.log("Cleared old notifications.");

    // 1. Friend Request Notification
    await Notification.create({
      recipient: ashita._id,
      sender: otherUser._id,
      type: 'friend_request'
    });
    console.log("Created friend request notification.");

    // 2. Room Invite Notification
    await Notification.create({
      recipient: ashita._id,
      sender: otherUser._id,
      type: 'room_invite',
      data: {
        roomId: room._id,
        roomName: room.name
      }
    });
    console.log("Created room invite notification.");

    console.log("All test notifications injected successfully!");
    mongoose.disconnect();
  } catch (err) {
    console.error("Error running script:", err);
  }
}

run();
