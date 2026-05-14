require('dotenv').config();
const mongoose = require('mongoose');
const Room = require('./models/room');
const User = require('./models/User');

async function test() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cohive');
    console.log('Connected to DB');
    
    // Create a dummy user
    const user = await User.create({
      googleId: '12345',
      name: 'Test',
      email: 'test@test.com'
    });
    console.log('User created:', user._id);
    
    // Create a room
    const room = await Room.create({
      name: 'Test Room',
      createdBy: user._id,
      members: [user._id]
    });
    console.log('Room created:', room);
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

test();
