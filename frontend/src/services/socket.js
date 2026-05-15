import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_SOCKET_URL || '', {
  autoConnect: false,
  auth: {
    token: localStorage.getItem("token")
  }
});

socket.on("connect", () => {
  console.log("Socket connected:", socket.id);
});

socket.on("connect_error", (err) => {
  console.error("Socket connection error:", err.message);
});

socket.on("disconnect", (reason) => {
  console.log("Socket disconnected:", reason);
});

export default socket;
