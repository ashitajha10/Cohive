const express = require("express");
const cors = require("cors");
const passport = require("./config/passport");
const helmet = require("helmet");
const path = require("path");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const roomRoutes = require("./routes/room.routes");
const messageRoutes = require("./routes/message.routes");
const uploadRoutes = require("./routes/upload.routes");
const resourceRoutes = require("./routes/resource.routes");
const noteRoutes = require("./routes/note.routes");
const whiteboardRoutes = require("./routes/whiteboard.routes");
const notificationRoutes = require("./routes/notification.routes");

const app = express();

const corsOptions = {
  origin: process.env.FRONTEND_URL || "https://cohive-seven.vercel.app",
  credentials: true,
};

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false,
}));
app.use(cors(corsOptions));
app.use(express.json());
app.use(passport.initialize());

// Static folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/whiteboard", whiteboardRoutes);
app.use("/api/notifications", notificationRoutes);


module.exports = app;