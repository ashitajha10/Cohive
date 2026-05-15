const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Room = require("../models/room");
const Message = require("../models/Message");
const Notification = require("../models/Notification");

const socketManager = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "https://cohive-seven.vercel.app",
      methods: ["GET", "POST"],
      credentials: true
    },
  });

  // In-memory state
  const roomUsers = {}; // roomId -> Array of { socketId, userId, userName }
  const onlineUsers = new Map(); // userId -> Set of socketIds

  // Middleware: Authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      
      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password -__v");

      if (!user) {
        return next(new Error("Authentication error: User not found"));
      }

      socket.user = user;
      next();
    } catch (err) {
      console.error("Socket Auth Error:", err.message);
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", async (socket) => {
    const userId = socket.user._id.toString();
    console.log(`DEBUG: User connected: ${socket.id} (${socket.user.name})`);

    // Track online status
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    // Join a private room for personal notifications
    socket.join(`user_${userId}`);

    // Notify friends that user is online
    const userWithFriends = await User.findById(userId).populate('friends', '_id');
    if (userWithFriends && userWithFriends.friends) {
      userWithFriends.friends.forEach(friend => {
        io.to(`user_${friend._id}`).emit("friend_status_change", {
          userId: userId,
          status: 'online'
        });
      });
    }

    // Handle friend request notification
    socket.on("send_friend_request", ({ receiverId }) => {
      io.to(`user_${receiverId}`).emit("new_friend_request", {
        sender: {
          _id: socket.user._id,
          name: socket.user.name,
          displayName: socket.user.displayName,
          avatar: socket.user.avatar
        }
      });
    });

    socket.on("friend_request_responded", ({ senderId, status }) => {
      io.to(`user_${senderId}`).emit("friend_request_update", {
        receiverId: userId,
        status: status
      });
      
      if (status === 'accepted') {
        // Both users are now friends, notify both to refresh friend lists
        io.to(`user_${userId}`).emit("refresh_friends");
        io.to(`user_${senderId}`).emit("refresh_friends");
      }
    });

    // Handle room invite
    socket.on("send_room_invite", async ({ friendId, roomId, roomName }) => {
      io.to(`user_${friendId}`).emit("room_invite", {
        sender: {
          _id: socket.user._id,
          name: socket.user.name,
          displayName: socket.user.displayName,
          avatar: socket.user.avatar
        },
        roomId,
        roomName
      });

      // Persist notification
      await Notification.create({
        recipient: friendId,
        sender: socket.user._id,
        type: 'room_invite',
        data: { roomId, roomName }
      });
    });

    socket.on("join_room", async ({ roomId }) => {
      try {
        if (!roomId) return;

        // Security: Verify membership in DB
        const dbRoom = await Room.findById(roomId);
        if (!dbRoom || !dbRoom.members.some(m => m.toString() === socket.user._id.toString())) {
          console.error(`DEBUG: Unauthorized join attempt by ${socket.user.name} for room ${roomId}`);
          socket.emit("error_message", { message: "Unauthorized to join this room" });
          return;
        }

        socket.join(roomId);

        if (!roomUsers[roomId]) {
          roomUsers[roomId] = [];
        }

        // Avoid duplicates for same socket
        const existing = roomUsers[roomId].find((u) => u.socketId === socket.id);
        if (!existing) {
          roomUsers[roomId].push({
            socketId: socket.id,
            userId: socket.user._id,
            userName: socket.user.displayName || socket.user.name,
            avatar: socket.user.avatar,
          });
        }

        io.to(roomId).emit("room_users", roomUsers[roomId]);
        
        socket.to(roomId).emit("system_message", {
          text: `${socket.user.name} joined the room`,
          isSystem: true
        });

        // Notify room creator if the creator is not the one joining
        if (dbRoom.createdBy && dbRoom.createdBy.toString() !== socket.user._id.toString()) {
          await Notification.create({
            recipient: dbRoom.createdBy,
            sender: socket.user._id,
            type: 'room_join',
            data: { roomId: dbRoom._id, roomName: dbRoom.name }
          });
          io.to(`user_${dbRoom.createdBy}`).emit("new_notification");
        }
        
        console.log(`DEBUG: ${socket.user.name} joined room ${roomId}`);
      } catch (err) {
        console.error("Socket join error:", err);
      }
    });

    socket.on("leave_room", (roomId) => {
      if (roomUsers[roomId]) {
        socket.leave(roomId);
        const userObj = roomUsers[roomId].find((u) => u.socketId === socket.id);
        roomUsers[roomId] = roomUsers[roomId].filter((u) => u.socketId !== socket.id);
        
        if (userObj) {
          socket.to(roomId).emit("system_message", {
            text: `${userObj.userName} left the room`,
            isSystem: true
          });
        }
        
        if (roomUsers[roomId].length === 0) {
          delete roomUsers[roomId];
        } else {
          io.to(roomId).emit("room_users", roomUsers[roomId]);
          socket.to(roomId).emit("user_left_video", socket.id);
        }
      }
    });

    socket.on("typing", (data) => {
      socket.to(data.roomId).emit("user_typing", socket.user.name);
    });

    socket.on("send_message", async (data) => {
      try {
        if (!data.roomId || (!data.message && !data.file)) return;

        // Security: Verify user is in the room
        if (!socket.rooms.has(data.roomId)) {
          return socket.emit("error_message", { message: "Unauthorized: You have not joined this room" });
        }

        const newMessage = await Message.create({
          roomId: data.roomId,
          sender: socket.user._id,
          text: data.message || "",
          file: data.file || "",
          type: data.type || "text",
        });

        const populatedMessage = await newMessage.populate("sender", "name avatar displayName");

        io.to(data.roomId).emit("receive_message", {
          ...populatedMessage.toObject(),
          userName: socket.user.displayName || socket.user.name, 
        });

        // Mentions check
        if (data.message && data.message.includes('@')) {
          const mentionMatches = data.message.match(/@(\w+)/g);
          if (mentionMatches) {
            const usernames = mentionMatches.map(m => m.slice(1));
            const mentionedUsers = await User.find({ username: { $in: usernames } });
            
            for (const mUser of mentionedUsers) {
              if (mUser._id.toString() !== socket.user._id.toString()) {
                await Notification.create({
                  recipient: mUser._id,
                  sender: socket.user._id,
                  type: 'mention',
                  data: { 
                    roomId: data.roomId, 
                    messageId: newMessage._id,
                    text: data.message
                  }
                });
                io.to(`user_${mUser._id}`).emit("new_notification");
              }
            }
          }
        }
      } catch (err) {
        console.error("Message save error:", err);
      }
    });

    socket.on("resource_added", (data) => {
      if (socket.rooms.has(data.roomId)) {
        socket.to(data.roomId).emit("resource_added", data.resource);
      }
    });

    socket.on("resource_deleted", (data) => {
      if (socket.rooms.has(data.roomId)) {
        socket.to(data.roomId).emit("resource_deleted", data.resourceId);
      }
    });

    socket.on("note_created", (data) => {
      if (socket.rooms.has(data.roomId)) {
        socket.to(data.roomId).emit("note_created", data.note);
      }
    });

    socket.on("note_updated", (data) => {
      if (socket.rooms.has(data.roomId)) {
        socket.to(data.roomId).emit("note_updated", data.note);
      }
    });

    socket.on("note_deleted", (data) => {
      if (socket.rooms.has(data.roomId)) {
        socket.to(data.roomId).emit("note_deleted", data.noteId);
      }
    });

    socket.on("draw_event", (data) => {
      if (socket.rooms.has(data.roomId)) {
        socket.to(data.roomId).emit("draw_event", data.drawData);
      }
    });

    socket.on("clear_whiteboard", (data) => {
      if (socket.rooms.has(data.roomId)) {
        socket.to(data.roomId).emit("clear_whiteboard");
      }
    });

    socket.on("update_profile", (data) => {
      const { displayName, avatar } = data;
      // Update socket user object
      if (displayName) socket.user.displayName = displayName;
      if (avatar) socket.user.avatar = avatar;

      // Update in-memory roomUsers
      for (const roomId in roomUsers) {
        const userObj = roomUsers[roomId].find((u) => u.userId.toString() === socket.user._id.toString());
        if (userObj) {
          userObj.userName = displayName || socket.user.name;
          userObj.avatar = avatar || socket.user.avatar;
          io.to(roomId).emit("room_users", roomUsers[roomId]);
          
          // Also notify about profile change for chat/etc
          io.to(roomId).emit("profile_updated", {
            userId: socket.user._id,
            displayName: userObj.userName,
            avatar: userObj.avatar
          });
        }
      }
    });

    // Check online status
    socket.on("check_online_status", (userIds, callback) => {
      const statusMap = {};
      userIds.forEach(id => {
        statusMap[id] = onlineUsers.has(id.toString()) ? 'online' : 'offline';
      });
      callback(statusMap);
    });

    // WebRTC Signaling - Multi-user Support
    socket.on("join_video_call", ({ roomId }) => {
      if (socket.rooms.has(roomId)) {
        // Broadcast to others that a new user is ready for video
        socket.to(roomId).emit("user_joined_video", { 
          socketId: socket.id, 
          user: {
            _id: socket.user._id,
            name: socket.user.name,
            displayName: socket.user.displayName,
            avatar: socket.user.avatar
          }
        });
      }
    });

    socket.on("webrtc_signal", (data) => {
      const { targetSocketId, signal, type, roomId } = data;
      if (socket.rooms.has(roomId)) {
        io.to(targetSocketId).emit("webrtc_signal", {
          type,
          signal,
          fromSocketId: socket.id,
          user: {
            _id: socket.user._id,
            name: socket.user.name,
            displayName: socket.user.displayName,
            avatar: socket.user.avatar
          }
        });
      }
    });

    socket.on("media_state_change", (data) => {
      const { roomId, type, enabled } = data;
      if (socket.rooms.has(roomId)) {
        socket.to(roomId).emit("user_media_state_changed", {
          socketId: socket.id,
          type, // 'audio', 'video', 'screen'
          enabled
        });
      }
    });

    socket.on("disconnect", async () => {
      console.log(`DEBUG: User disconnected: ${socket.id} (${socket.user.name})`);

      // Update online status
      const userSockets = onlineUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);
          
          // Notify friends that user is offline
          const userWithFriends = await User.findById(userId).populate('friends', '_id');
          if (userWithFriends && userWithFriends.friends) {
            userWithFriends.friends.forEach(friend => {
              io.to(`user_${friend._id}`).emit("friend_status_change", {
                userId: userId,
                status: 'offline'
              });
            });
          }
        }
      }

      for (const roomId in roomUsers) {
        const userIndex = roomUsers[roomId].findIndex((u) => u.socketId === socket.id);
        if (userIndex !== -1) {
          const userObj = roomUsers[roomId][userIndex];
          
          io.to(roomId).emit("system_message", {
            text: `${userObj.userName} left the room`,
            isSystem: true
          });

          roomUsers[roomId].splice(userIndex, 1);
          
          if (roomUsers[roomId].length === 0) {
            delete roomUsers[roomId];
          } else {
            io.to(roomId).emit("room_users", roomUsers[roomId]);
            socket.to(roomId).emit("user_left_video", socket.id);
          }
        }
      }
    });
  });

  return io;
};

module.exports = socketManager;
