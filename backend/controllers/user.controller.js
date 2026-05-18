const User = require('../models/User');
const FriendRequest = require('../models/FriendRequest');
const Notification = require('../models/Notification');

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('friends', 'name displayName avatar email status nickname');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  const { displayName, username, bio, avatar, status, nickname } = req.body;

  try {
    let user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If username is changing, check if it's already taken
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: 'Username is already taken' });
      }
      user.username = username;
    }

    if (displayName) user.displayName = displayName;
    if (bio !== undefined) user.bio = bio;
    if (avatar) user.avatar = avatar;
    if (status) user.status = status;
    if (nickname !== undefined) user.nickname = nickname;

    await user.save();

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.searchUsers = async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json([]);

  try {
    const users = await User.find({
      $and: [
        { _id: { $ne: req.user.id } },
        {
          $or: [
            { name: { $regex: q, $options: 'i' } },
            { displayName: { $regex: q, $options: 'i' } },
            { username: { $regex: q, $options: 'i' } },
            { email: { $regex: q, $options: 'i' } },
          ],
        },
      ],
    })
      .select('name displayName username avatar email status nickname')
      .limit(10);

    // Get current user's friend requests to show status in search
    const sentRequests = await FriendRequest.find({ sender: req.user.id });
    const receivedRequests = await FriendRequest.find({ receiver: req.user.id });
    const currentUser = await User.findById(req.user.id).select('friends');

    const usersWithStatus = users.map((user) => {
      const userObj = user.toObject();
      
      const sent = sentRequests.find(r => r.receiver.toString() === user._id.toString());
      const received = receivedRequests.find(r => r.sender.toString() === user._id.toString());
      const isFriend = currentUser.friends.includes(user._id);

      if (isFriend) {
        userObj.friendStatus = 'friends';
      } else if (sent) {
        userObj.friendStatus = sent.status === 'pending' ? 'request_sent' : 'none';
      } else if (received) {
        userObj.friendStatus = received.status === 'pending' ? 'request_received' : 'none';
      } else {
        userObj.friendStatus = 'none';
      }

      return userObj;
    });

    res.json(usersWithStatus);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.sendFriendRequest = async (req, res) => {
  const { receiverId } = req.body;
  const senderId = req.user.id;

  if (receiverId === senderId) {
    return res.status(400).json({ message: 'Cannot send request to self' });
  }

  try {
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already friends
    const sender = await User.findById(senderId);
    if (sender.friends.includes(receiverId)) {
      return res.status(400).json({ message: 'Already friends' });
    }

    // Check if request already exists
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId }
      ]
    });

    if (existingRequest) {
      if (existingRequest.status === 'pending') {
        return res.status(400).json({ message: 'Request already pending' });
      }
      // If rejected, allow sending again? Usually, we might want to delete rejected ones or update status
      if (existingRequest.status === 'rejected') {
        existingRequest.status = 'pending';
        existingRequest.sender = senderId;
        existingRequest.receiver = receiverId;
        await existingRequest.save();
        return res.json(existingRequest);
      }
    }

    const newRequest = await FriendRequest.create({
      sender: senderId,
      receiver: receiverId,
      status: 'pending'
    });

    // Create a notification for the receiver
    await Notification.create({
      recipient: receiverId,
      sender: senderId,
      type: 'friend_request'
    });

    res.status(201).json(newRequest);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getFriendRequests = async (req, res) => {
  try {
    const requests = await FriendRequest.find({
      receiver: req.user.id,
      status: 'pending'
    }).populate('sender', 'name displayName avatar email status nickname');

    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.respondToFriendRequest = async (req, res) => {
  const { requestId, status } = req.body; // 'accepted' or 'rejected'

  if (!['accepted', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const request = await FriendRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.receiver.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (status === 'accepted') {
      request.status = 'accepted';
      await request.save();

      // Add to friends list for both users
      await User.findByIdAndUpdate(request.sender, { $addToSet: { friends: request.receiver } });
      await User.findByIdAndUpdate(request.receiver, { $addToSet: { friends: request.sender } });
      
      // Create a notification for the sender that the request was accepted
      await Notification.create({
        recipient: request.sender,
        sender: request.receiver,
        type: 'friend_accepted'
      });
      
      // Delete the request after accepting to keep DB clean, or keep it as 'accepted'
      // The requirement says status: pending, accepted, rejected. So we keep it.
    } else {
      request.status = 'rejected';
      await request.save();
      // Alternatively, delete the request:
      // await FriendRequest.findByIdAndDelete(requestId);
    }

    res.json({ message: `Friend request ${status}`, request });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('friends', 'name displayName avatar email status nickname');
    res.json(user.friends);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.removeFriend = async (req, res) => {
  const { friendId } = req.params;

  try {
    await User.findByIdAndUpdate(req.user.id, { $pull: { friends: friendId } });
    await User.findByIdAndUpdate(friendId, { $pull: { friends: req.user.id } });

    // Also remove any friend requests between them
    await FriendRequest.findOneAndDelete({
      $or: [
        { sender: req.user.id, receiver: friendId },
        { sender: friendId, receiver: req.user.id }
      ]
    });

    res.json({ message: 'Friend removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.cancelFriendRequest = async (req, res) => {
  const { receiverId } = req.params;

  try {
    await FriendRequest.findOneAndDelete({
      sender: req.user.id,
      receiver: receiverId,
      status: 'pending'
    });
    res.json({ message: 'Friend request cancelled' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    // We need to select password because it might be unselected by default in the model
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    if (user.authProvider === 'google' && !user.password) {
      return res.status(400).json({ message: 'Account uses Google Sign-In. Password change not supported.' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(400).json({ message: 'Incorrect current password' });

    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Remove user
    await User.findByIdAndDelete(req.user.id);
    
    // Cleanup relationships
    await User.updateMany({ friends: req.user.id }, { $pull: { friends: req.user.id } });
    await FriendRequest.deleteMany({ $or: [{ sender: req.user.id }, { receiver: req.user.id }] });

    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
