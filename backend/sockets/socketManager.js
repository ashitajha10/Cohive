const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Room = require("../models/room");
const Message = require("../models/Message");
const Notification = require("../models/Notification");

const socketManager = (server) => {
  const io = new Server(server, {
    cors: {
      origin: [
        process.env.FRONTEND_URL,
        "https://cohive-seven.vercel.app",
        "https://cohive-extf.onrender.com"
      ].filter(Boolean),
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
    console.log(`[SOCKET] Connected: ${socket.id} | User: ${socket.user.name} (${userId})`);

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

    // Room Joining Logic
    socket.on("join-room", async ({ roomId }) => {
      try {
        console.log(`[ROOM] Join attempt: Socket ${socket.id} for Room ${roomId}`);
        if (!roomId) {
          console.error(`[ROOM] Error: No roomId provided by ${socket.id}`);
          return;
        }

        // Security: Verify membership in DB
        const dbRoom = await Room.findById(roomId);
        if (!dbRoom) {
          console.error(`[ROOM] Error: Room ${roomId} not found in DB`);
          socket.emit("error_message", { message: "Room not found" });
          return;
        }

        const isMember = dbRoom.members.some(m => m.toString() === socket.user._id.toString());
        if (!isMember) {
          console.error(`[ROOM] Unauthorized join attempt by ${socket.user.name} (${userId}) for room ${roomId}`);
          socket.emit("error_message", { message: "Unauthorized to join this room" });
          return;
        }

        socket.join(roomId);
        console.log(`[ROOM] Socket ${socket.id} successfully joined room ${roomId}`);

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

        // Send current participants list to the joining user
        socket.emit("participants-list", roomUsers[roomId]);
        
        // Notify others in the room
        socket.to(roomId).emit("user-connected", {
          socketId: socket.id,
          user: {
            _id: socket.user._id,
            name: socket.user.name,
            displayName: socket.user.displayName,
            avatar: socket.user.avatar
          }
        });

        // Sync list for all
        io.to(roomId).emit("room_users", roomUsers[roomId]);
        
        socket.to(roomId).emit("system_message", {
          text: `${socket.user.name} joined the room`,
          isSystem: true
        });

        console.log(`[ROOM] Participants in ${roomId}:`, roomUsers[roomId].map(u => u.userName).join(", "));
      } catch (err) {
        console.error("[ROOM] Join error:", err);
      }
    });

    socket.on("leave-room", (roomId) => {
      if (roomUsers[roomId]) {
        console.log(`[ROOM] User leaving: ${socket.id} from ${roomId}`);
        socket.leave(roomId);
        const userObj = roomUsers[roomId].find((u) => u.socketId === socket.id);
        roomUsers[roomId] = roomUsers[roomId].filter((u) => u.socketId !== socket.id);
        
        if (userObj) {
          socket.to(roomId).emit("system_message", {
            text: `${userObj.userName} left the room`,
            isSystem: true
          });
          socket.to(roomId).emit("user-disconnected", socket.id);
        }
        
        if (roomUsers[roomId].length === 0) {
          delete roomUsers[roomId];
        } else {
          io.to(roomId).emit("room_users", roomUsers[roomId]);
        }
      }
    });

    // WebRTC Signaling
    socket.on("call-user", (data) => {
      const { offer, to, roomId } = data;
      console.log(`[WEBRTC] Offer from ${socket.id} to ${to} in room ${roomId}`);
      io.to(to).emit("incoming-call", {
        offer,
        from: socket.id,
        user: {
          _id: socket.user._id,
          name: socket.user.name,
          displayName: socket.user.displayName,
          avatar: socket.user.avatar
        }
      });
    });

    socket.on("answer-call", (data) => {
      const { answer, to, roomId } = data;
      console.log(`[WEBRTC] Answer from ${socket.id} to ${to} in room ${roomId}`);
      io.to(to).emit("answer-call", {
        answer,
        from: socket.id
      });
    });

    socket.on("ice-candidate", (data) => {
      const { candidate, to, roomId } = data;
      // console.log(`[WEBRTC] ICE Candidate from ${socket.id} to ${to}`);
      io.to(to).emit("ice-candidate", {
        candidate,
        from: socket.id
      });
    });

    // Chat & Features
    socket.on("send_message", async (data) => {
      try {
        if (!data.roomId || (!data.message && !data.file)) return;

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
      } catch (err) {
        console.error("Message error:", err);
      }
    });

    socket.on("typing", (data) => {
      socket.to(data.roomId).emit("user_typing", socket.user.name);
    });

    socket.on("draw_event", (data) => {
      socket.to(data.roomId).emit("draw_event", data.drawData);
    });

    socket.on("clear_whiteboard", (data) => {
      socket.to(data.roomId).emit("clear_whiteboard");
    });

    socket.on("disconnect", async () => {
      console.log(`[SOCKET] Disconnected: ${socket.id}`);

      // Update online status
      const userSockets = onlineUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);
          
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

      // Cleanup room presence
      for (const roomId in roomUsers) {
        const userIndex = roomUsers[roomId].findIndex((u) => u.socketId === socket.id);
        if (userIndex !== -1) {
          const userObj = roomUsers[roomId][userIndex];
          socket.to(roomId).emit("system_message", {
            text: `${userObj.userName} left the room`,
            isSystem: true
          });
          socket.to(roomId).emit("user-disconnected", socket.id);
          roomUsers[roomId].splice(userIndex, 1);
          
          if (roomUsers[roomId].length === 0) {
            delete roomUsers[roomId];
          } else {
            io.to(roomId).emit("room_users", roomUsers[roomId]);
          }
        }
      }
    });
  });

  return io;
};

module.exports = socketManager;
