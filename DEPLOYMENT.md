# Cohive Deployment Guide 🚀

This guide walks you through deploying the Cohive platform (Frontend + Backend) to production.

## 1. Prepare your environment variables
Before deploying, you need to decide on your final production URLs. For example:
- **Frontend URL**: `https://cohive.vercel.app` (or your custom domain)
- **Backend URL**: `https://cohive-backend.onrender.com`

You also need your MongoDB connection string (e.g., from MongoDB Atlas) and a strong `JWT_SECRET`.

## 2. Deploying the Backend (Render.com)

Render is an excellent platform for Node.js backends that require WebSockets (Socket.io).

1. Go to [Render.com](https://render.com/) and create a free account.
2. Click **New +** and select **Web Service**.
3. Connect your GitHub account and select your `Cohive` repository.
4. Fill in the deployment details:
   - **Name**: `cohive-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start` (Ensure you have `"start": "node server.js"` in `backend/package.json`)
5. Scroll down to **Environment Variables** and add:
   - `PORT`: `10000`
   - `MONGODB_URI`: `<your-mongodb-atlas-url>`
   - `JWT_SECRET`: `<your-secure-random-string>`
   - `FRONTEND_URL`: `<your-vercel-frontend-url>` (e.g., `https://cohive.vercel.app`)
6. Click **Create Web Service**. Render will now build and deploy your backend. 
7. *Note the generated Render URL (e.g., `https://cohive-backend.onrender.com`). You will need this for the frontend.*

## 3. Deploying the Frontend (Vercel)

Vercel is the optimal hosting platform for Vite/React applications.

1. Go to [Vercel.com](https://vercel.com/) and create a free account.
2. Click **Add New Project**.
3. Import your `Cohive` repository from GitHub.
4. In the configuration settings:
   - **Framework Preset**: Vercel should auto-detect `Vite`.
   - **Root Directory**: Click `Edit` and select `frontend`.
5. Open the **Environment Variables** section and add:
   - `VITE_API_URL`: `https://cohive-backend.onrender.com/api` (Replace with your actual Render URL)
   - `VITE_SOCKET_URL`: `https://cohive-backend.onrender.com` (Replace with your actual Render URL)
6. Click **Deploy**. Vercel will build and host your frontend globally.

## 4. Final Verification
Once Vercel finishes deploying, visit your frontend URL. 
- Create an account or log in.
- Open a room and verify your video connects.
- Verify that messages and resources sync properly (confirming the Socket.io connection is alive).

> **Important**: Ensure your MongoDB cluster's Network Access (IP Whitelist) is set to `0.0.0.0/0` (Allow access from anywhere) so that Render can successfully connect to the database.
