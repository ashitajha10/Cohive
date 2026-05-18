require('dotenv').config();
const dns = require('dns');
if (dns.setServers) dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');

console.log('Attempting connection to MongoDB Atlas Cloud...');
console.log('URI:', process.env.MONGO_URI ? 'Present (Protected)' : 'MISSING');

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000 // 5 seconds timeout
})
.then(conn => {
  console.log('\x1b[32m%s\x1b[0m', '✅ SUCCESS: Database connected properly to MongoDB Atlas!');
  console.log(`Host: ${conn.connection.host}`);
  console.log(`Database Name: ${conn.connection.name}`);
  process.exit(0);
})
.catch(err => {
  console.error('\x1b[31m%s\x1b[0m', '❌ ERROR: Failed to connect to MongoDB Atlas!');
  console.error('Error Details:', err.message);
  process.exit(1);
});
