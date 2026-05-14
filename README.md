<div align="center">
  <img src="https://raw.githubusercontent.com/ashitajha10/Cohive/main/frontend/public/space_mascot_astronaut_1778492786001.png" alt="Cohive Logo" width="120" />
  
  <h1 align="center">C O H I V E</h1>
  
  <p align="center">
    <strong>A next-generation, real-time collaboration platform designed with a premium, cyberpunk cosmic aesthetic.</strong>
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

## 🌌 Overview

Cohive is a fully-featured, production-grade collaboration environment built on the MERN stack. It moves beyond traditional productivity tools by combining high-performance WebRTC video conferencing, low-latency Socket.io messaging, and an immersive "spaceship" glassmorphic UI driven by Tailwind CSS and Framer Motion. 

Whether you are hosting remote study sessions, brainstorming with a global team, or just hanging out, Cohive provides the tools you need in a visually stunning interface.

## 🚀 Key Features

* **Real-time Video Conferencing:** Peer-to-peer audio and video communication powered by WebRTC with dynamic focused-speaker tracking.
* **Synchronized Whiteboard:** A responsive, real-time collaborative canvas for drawing and brainstorming.
* **Global Friend Registry:** Add friends, accept/reject connection requests, and see who is online in real-time.
* **Mission Storage (Resource Sharing):** Upload and share PDFs, images, and important links seamlessly within your active workspace.
* **Instant Messaging:** Global notifications and room-specific text chat powered by persistent Socket.io connections.
* **Dynamic Note Management:** Create and manage personal study or mission notes from an interactive, animated dashboard.
* **Immersive Cosmic UI:** Breathtaking glassmorphism design, glowing neon accents, and smooth cinematic transitions powered by Framer Motion.
* **Robust Authentication:** Secure JWT-based authentication system with persistent sessions and password reset capabilities.

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
- **Security:** JWT, bcryptjs, CORS

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

Cohive departs from the clinical, bright aesthetics of enterprise collaboration tools. Instead, it adopts a deep space, cyber-themed design. The UI heavily utilizes `backdrop-blur`, custom CSS glowing shadows, and micro-interactions. Every hover state, route change, and socket event is paired with a deliberate animation to make the platform feel alive and responsive.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

---
*Developed with ❤️ by Ashita Jha*
