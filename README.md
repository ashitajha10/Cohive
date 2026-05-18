<div align="center">
  
  <h1 align="center">🐝 C O H I V E</h1>
  
  <p align="center">
    <strong>A next-generation, real-time collaborative workspace designed for modern teams and study groups.</strong>
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="NodeJS" />
    <img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge" alt="Express" />
    <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
    <img src="https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101" alt="Socket.io" />
    <img src="https://img.shields.io/badge/WebRTC-333333?style=for-the-badge&logo=webrtc&logoColor=white" alt="WebRTC" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="TailwindCSS" />
  </p>
</div>

<hr />

## 🚀 Overview

Cohive is a fully-featured, production-grade collaboration environment built on the MERN stack. It provides a seamless, all-in-one workspace combining high-performance WebRTC video conferencing, low-latency Socket.io messaging, and an elegant, productivity-focused interface. 

Whether you are hosting remote study sessions, brainstorming with a global team, or managing projects, Cohive provides the tools you need in a clean, professional, and highly responsive environment.

## ✨ Key Features

* **Real-time Video Conferencing:** Peer-to-peer audio and video communication powered by WebRTC with dynamic focused-speaker tracking and screen sharing.
* **Synchronized Whiteboard:** A responsive, real-time collaborative canvas for drawing and brainstorming with your peers.
* **Global Friend Network:** Search for users, send friend requests, and maintain a friends list to easily invite peers to your active rooms.
* **Room Resource Management:** Upload and share files, images, and important links seamlessly within your active workspace.
* **Instant Messaging:** Global notifications and room-specific text chat powered by persistent Socket.io connections.
* **Dynamic Note Management:** Create and manage personal study or mission notes from an interactive dashboard.
* **Robust Authentication:** Secure JWT-based local authentication system with persistent sessions, integrated Google OAuth 2.0 via Passport.js, and a robust Nodemailer password recovery system.
* **Permanent Avatars:** Client-side image compression and Base64 database storage for ultra-fast, permanent profile pictures.
* **Clean & Professional UI:** A beautiful, responsive light-mode design with subtle purple branding, crafted with Tailwind CSS and animated using Framer Motion.

## 🛠️ Technology Stack

### Frontend
- **Framework:** React.js (Vite)
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **State Management:** Zustand
- **Routing:** React Router v6
- **Real-time Comms:** Socket.io-client, simple-peer (WebRTC)

### Backend
- **Environment:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose ORM)
- **Real-time:** Socket.io
- **Security:** Passport.js (Google OAuth), JWT, bcryptjs, Helmet, CORS
- **Email Services:** Nodemailer (Gmail SMTP)

## 💻 Running Locally

To run Cohive on your local machine, you'll need Node.js and MongoDB installed.

### 1. Clone the repository
```bash
git clone https://github.com/ashitajha10/Cohive.git
cd Cohive
```

### 2. Setup the Backend
```bash
cd backend
npm install
```
Create a `.env` file in the `backend/` directory with the following variables:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
FRONTEND_URL=http://localhost:5173
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Mail SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_gmail_address
SMTP_PASS=your_gmail_app_password
EMAIL_FROM="Cohive" <your_gmail_address>
```
Start the backend development server:
```bash
npm run dev
```

### 3. Setup the Frontend
```bash
cd frontend
npm install
```
Create a `.env` file in the `frontend/` directory with the following variables:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```
Start the frontend development server:
```bash
npm run dev
```

### 4. Access the Platform
Navigate to `http://localhost:5173` in your browser.

## 🎨 Design Philosophy

Cohive adopts a clean, productivity-focused design aesthetic. Moving away from dark-mode heavy "cyber" themes, the interface leverages a pristine white and gray palette accented with vibrant purple branding. The UI utilizes modern design principles, including soft shadows, rounded corners, and strategic micro-interactions to create a workspace that feels premium, distraction-free, and highly responsive.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

---
*Developed with ❤️ by Ashita Jha*
