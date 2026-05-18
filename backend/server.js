require('dotenv').config();
const dns = require('dns');

if (dns.setServers) {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
}

const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const { Server } = require('socket.io');

const startServer = async () => {
  try {
    await connectDB();

    const server = http.createServer(app);

    // Initialize Socket.io via Socket Manager
    const socketManager = require('./sockets/socketManager');
    socketManager(server);

    const PORT = process.env.PORT || 5000;

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('SERVER ERROR:', error.message);
  }
};

startServer();