import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuthStore from '../store/authStore';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import Layout from '../components/Layout';
import Loader from '../components/Loader';
import { getAvatarUrl } from '../utils/avatar';

const ProfileSettings = () => {
  const { user, updateProfile, loading, logout, changePassword, deleteAccount } = useAuthStore();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    displayName: '',
    username: '',
    bio: '',
    status: 'Available',
    avatar: '',
    nickname: ''
  });

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '' });
  const [savingPass, setSavingPass] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || user.name || '',
        username: user.username || '',
        bio: user.bio || '',
        status: user.status || 'Available',
        avatar: user.avatar || '',
        nickname: user.nickname || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarClick = () => {
    if (!isEditing) return;
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      return showToast("Please select an image file", "error");
    }

    setUploading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Compress and encode to base64
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        
        setFormData(prev => ({ ...prev, avatar: dataUrl }));
        setUploading(false);
        showToast("Avatar prepared! Click Save Changes to apply.", "success");
      };
      img.onerror = () => {
        setUploading(false);
        showToast("Failed to process image", "error");
      };
      img.src = event.target.result;
    };
    reader.onerror = () => {
      setUploading(false);
      showToast("Error reading file", "error");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const result = await updateProfile(formData);
    if (result.success) {
      showToast("Profile updated successfully", "success");
      setIsEditing(false);
    } else {
      showToast(result.error, "error");
    }
    setSaving(false);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passForm.currentPassword || !passForm.newPassword) {
      return showToast("Please fill both password fields", "error");
    }
    setSavingPass(true);
    const result = await changePassword(passForm.currentPassword, passForm.newPassword);
    if (result.success) {
      showToast(result.message || "Password updated successfully", "success");
      setPassForm({ currentPassword: '', newPassword: '' });
    } else {
      showToast(result.error, "error");
    }
    setSavingPass(false);
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you absolutely sure you want to delete your account? This action cannot be undone.")) {
      const result = await deleteAccount();
      if (result.success) {
        showToast("Account deleted successfully", "success");
      } else {
        showToast(result.error, "error");
      }
    }
  };

  if (loading && !user) return <Layout><div className="flex items-center justify-center h-full"><Loader size="xl" /></div></Layout>;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-10 animate-fade-in pb-20">
        <header>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-2">Account Settings</h1>
          <p className="text-gray-400 text-sm font-medium">Manage your public profile and account preferences.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Avatar Section */}
          <div className="lg:col-span-4">
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col items-center">
              <div className="relative group cursor-pointer mb-6" onClick={handleAvatarClick}>
                <div className={`w-40 h-40 rounded-3xl p-1 bg-gradient-to-br from-purple-100 to-transparent transition-all group-hover:from-purple-200 overflow-hidden ${uploading ? 'opacity-50' : ''}`}>
                  <div className="w-full h-full bg-gray-50 rounded-2xl overflow-hidden flex items-center justify-center border border-gray-100">
                    {formData.avatar ? (
                      <img src={getAvatarUrl(formData.avatar)} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-5xl font-bold text-gray-300">{(formData.displayName || "U").charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="px-4 py-2 bg-white/90 backdrop-blur-sm text-[#8b5cf6] rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-sm">Change Photo</div>
                  </div>
                )}
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 border-3 border-[#8b5cf6] border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
              
              <div className="w-full space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-center text-gray-400">Current Status</p>
                <div className="grid grid-cols-2 gap-2">
                  {['Available', 'Away', 'Busy', 'Invisible'].map((s) => (
                    <button
                      key={s}
                      onClick={() => setFormData(prev => ({ ...prev, status: s }))}
                      className={`py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border ${
                        formData.status === s 
                          ? 'bg-purple-50 border-purple-100 text-[#8b5cf6]' 
                          : 'bg-gray-50 border-gray-100 text-gray-400 hover:border-gray-200'
                      } ${!isEditing ? 'opacity-70 cursor-not-allowed' : ''}`}
                      disabled={!isEditing}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="lg:col-span-8">
            <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Display Name</label>
                    <input
                      type="text"
                      name="displayName"
                      value={formData.displayName}
                      onChange={handleChange}
                      readOnly={!isEditing}
                      className={`w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-medium text-gray-800 outline-none transition-all ${!isEditing ? 'opacity-70 cursor-not-allowed' : 'focus:border-purple-200 focus:bg-white'}`}
                      placeholder="Enter your name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Username</label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      readOnly={!isEditing}
                      className={`w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-medium text-gray-800 outline-none transition-all ${!isEditing ? 'opacity-70 cursor-not-allowed' : 'focus:border-purple-200 focus:bg-white'}`}
                      placeholder="Choose a handle"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Email (Gmail)</label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      readOnly
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-medium text-gray-800 outline-none opacity-70 cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Password</label>
                    <input
                      type="password"
                      value="********"
                      readOnly
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-medium text-gray-800 outline-none opacity-70 cursor-not-allowed"
                    />
                    <p className="text-[10px] text-gray-400 ml-1 mt-1">Change your password in the Security section below.</p>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Bio / Mission</label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      readOnly={!isEditing}
                      rows="4"
                      className={`w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-medium text-gray-800 outline-none transition-all resize-none ${!isEditing ? 'opacity-70 cursor-not-allowed' : 'focus:border-purple-200 focus:bg-white'}`}
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center pt-4 gap-4">
                  <button 
                    type="button" 
                    onClick={() => logout()}
                    className="px-8 py-4 bg-red-50 text-red-600 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-red-100 transition-all w-full sm:w-auto"
                  >
                    Log Out
                  </button>
                  
                  <div className="flex gap-4 w-full sm:w-auto">
                    {!isEditing ? (
                      <button 
                        type="button" 
                        onClick={(e) => { e.preventDefault(); setIsEditing(true); }}
                        className="px-10 py-4 bg-[#8b5cf6] text-white rounded-2xl font-bold text-sm uppercase tracking-widest shadow-lg shadow-purple-100 hover:bg-[#7c3aed] transition-all w-full sm:w-auto"
                      >
                        Edit Profile
                      </button>
                    ) : (
                      <>
                        <button 
                          type="button" 
                          onClick={() => {
                            setIsEditing(false);
                            setFormData({
                              displayName: user.displayName || user.name || '',
                              username: user.username || '',
                              bio: user.bio || '',
                              status: user.status || 'Available',
                              avatar: user.avatar || '',
                              nickname: user.nickname || ''
                            });
                          }}
                          className="px-8 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-gray-200 transition-all w-full sm:w-auto"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" 
                          disabled={saving || uploading}
                          className="px-10 py-4 bg-[#8b5cf6] text-white rounded-2xl font-bold text-sm uppercase tracking-widest shadow-lg shadow-purple-100 hover:bg-[#7c3aed] transition-all disabled:opacity-50 w-full sm:w-auto"
                        >
                          {saving ? "Saving..." : "Save Changes"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </form>
            </div>
            
            {/* Security Section */}
            <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm mt-10">
              <h2 className="text-xl font-bold text-gray-900 tracking-tight mb-6">Security & Password</h2>
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Current Password</label>
                    <input
                      type="password"
                      value={passForm.currentPassword}
                      onChange={(e) => setPassForm(p => ({ ...p, currentPassword: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-medium text-gray-800 outline-none focus:border-purple-200 focus:bg-white transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">New Password</label>
                    <input
                      type="password"
                      value={passForm.newPassword}
                      onChange={(e) => setPassForm(p => ({ ...p, newPassword: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-medium text-gray-800 outline-none focus:border-purple-200 focus:bg-white transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button 
                    type="submit" 
                    disabled={savingPass || user.authProvider === 'google'}
                    className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold text-sm uppercase tracking-widest shadow-lg hover:bg-gray-800 transition-all disabled:opacity-50"
                  >
                    {savingPass ? "Updating..." : "Update Password"}
                  </button>
                </div>
                {user.authProvider === 'google' && (
                  <p className="text-xs text-red-500 font-medium text-right mt-2">Password change is not available for Google Sign-In accounts.</p>
                )}
              </form>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50 p-10 rounded-[2.5rem] border border-red-100 shadow-sm mt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <h2 className="text-xl font-bold text-red-600 tracking-tight mb-2">Delete Account</h2>
                <p className="text-sm text-red-400 font-medium max-w-md">Once you delete your account, there is no going back. Please be certain.</p>
              </div>
              <button 
                type="button" 
                onClick={handleDeleteAccount}
                className="px-8 py-4 bg-red-600 text-white rounded-2xl font-bold text-sm uppercase tracking-widest shadow-lg shadow-red-200 hover:bg-red-700 transition-all flex-shrink-0"
              >
                Delete Account
              </button>
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfileSettings;
