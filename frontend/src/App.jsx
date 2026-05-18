import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useParams, useLocation } from "react-router-dom";
// App main entry point with routes configuration
import useAuthStore from "./store/authStore";
import useActiveRoomStore from "./store/activeRoomStore";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreateRoom from "./pages/CreateRoom";
import Room from "./pages/Room";
import JoinRoom from "./pages/JoinRoom";
import ProfileSettings from "./pages/ProfileSettings";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Friends from "./pages/Friends";
import MyRooms from "./pages/MyRooms";
import Notifications from "./pages/Notifications";
import Messages from "./pages/Messages";
import Resources from "./pages/Resources";
import Notes from "./pages/Notes";

import ProtectedRoute from "./components/ProtectedRoute";
import SocketManager from "./components/SocketManager";

function RoomRouteInitializer() {
  const { id } = useParams();
  const { setActiveRoom } = useActiveRoomStore();
  
  useEffect(() => {
    if (id) setActiveRoom(id);
  }, [id, setActiveRoom]);

  return null;
}

function PersistentRoomSession() {
  const { activeRoomId, leaveRoom } = useActiveRoomStore();
  const location = useLocation();

  if (!activeRoomId) return null;

  const isMinimized = !location.pathname.startsWith(`/room/${activeRoomId}`);

  return (
    <div className={isMinimized ? "fixed bottom-8 right-8 w-[380px] h-[260px] z-[100] shadow-2xl rounded-3xl overflow-hidden border border-purple-500/30 animate-fade-in bg-gray-950 transition-all duration-500 hover:scale-[1.02]" : "fixed inset-0 z-50 bg-gray-50"}>
      <Room roomIdProp={activeRoomId} isMinimized={isMinimized} onLeave={leaveRoom} />
    </div>
  );
}

function App() {
  const { fetchUser, token, setAuth } = useAuthStore();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    
    if (urlToken) {
      setAuth(urlToken);
      // Remove token from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [setAuth]);

  useEffect(() => {
    if (token) {
      fetchUser();
    }
  }, [token, fetchUser]);

  return (
    <BrowserRouter>
      <SocketManager />
      <PersistentRoomSession />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Protected Routes */}
        <Route path="/my-rooms" element={<ProtectedRoute><MyRooms /></ProtectedRoute>} />
        <Route path="/friends" element={<ProtectedRoute><Friends /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
        <Route path="/resources" element={<ProtectedRoute><Resources /></ProtectedRoute>} />
        <Route path="/notes" element={<ProtectedRoute><Notes /></ProtectedRoute>} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/room/new-room"
          element={
            <ProtectedRoute>
              <CreateRoom />
            </ProtectedRoute>
          }
        />

        <Route
          path="/room/:id"
          element={
            <ProtectedRoute>
              <RoomRouteInitializer />
            </ProtectedRoute>
          }
        />

        <Route
          path="/join/:code"
          element={
            <ProtectedRoute>
              <JoinRoom />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfileSettings />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;