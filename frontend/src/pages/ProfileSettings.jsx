import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuthStore from '../store/authStore';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Loader from '../components/Loader';
import { getAvatarUrl } from '../utils/avatar';

const ProfileSettings = () => {
  const { user, updateProfile, loading } = useAuthStore();
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
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast("File is too large (max 2MB)", "error");
      return;
    }

    const uploadData = new FormData();
    uploadData.append('file', file);

    setUploading(true);
    try {
      const res = await api.post('/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({ ...prev, avatar: res.data.url }));
      showToast("Avatar uplink successful", "success");
    } catch (err) {
      showToast("Avatar uplink failed", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const result = await updateProfile(formData);
    if (result.success) {
      showToast("Profile identity updated", "success");
    } else {
      showToast(result.error, "error");
    }
    setSaving(false);
  };

  if (loading && !user) return <Loader />;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-6 md:p-12 space-y-12 min-h-[calc(100vh-120px)] flex flex-col">
        <header className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-700">
          <h1 className="text-5xl font-black text-white uppercase tracking-tighter">
            Profile <span className="glow-text-cyan">Settings.v2</span>
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-500 font-black tracking-[0.4em] text-[10px] uppercase">Identity Management Terminal</span>
            <div className="h-px flex-1 bg-white/5" />
          </div>
        </header>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          {/* Avatar & Status Column */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-[#0a0b0d] p-10 rounded-[3.5rem] border border-white/10 shadow-2xl flex flex-col items-center relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-cyber-cyan to-transparent opacity-30" />
              
              <motion.div 
                whileHover={{ scale: 1.02 }}
                onClick={handleAvatarClick}
                className="relative group cursor-pointer mb-8"
              >
                <div className={`w-48 h-48 rounded-[3rem] p-1 bg-gradient-to-br from-cyber-cyan/40 to-transparent transition-all group-hover:from-cyber-cyan shadow-glow-cyan overflow-hidden ${uploading ? 'opacity-50' : ''}`}>
                  <div className="w-full h-full bg-[#050608] rounded-[2.8rem] overflow-hidden flex items-center justify-center">
                    {formData.avatar ? (
                      <img src={getAvatarUrl(formData.avatar)} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-6xl font-black text-white">
                        {(formData.displayName || "U").charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="absolute inset-0 bg-cyber-cyan/10 rounded-[3rem] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                  <div className="px-5 py-2.5 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest shadow-2xl">Update ID</div>
                </div>
                
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 border-4 border-cyber-cyan border-t-transparent rounded-full animate-spin shadow-glow-cyan" />
                  </div>
                )}
              </motion.div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
              
              <div className="w-full space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-center text-gray-500 mb-6">Synchronization Status</p>
                <div className="grid grid-cols-2 gap-3">
                  {['Available', 'Busy', 'Away', 'Invisible'].map((s) => (
                    <button
                      key={s}
                      onClick={() => setFormData(prev => ({ ...prev, status: s }))}
                      className={`py-3.5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                        formData.status === s 
                          ? 'bg-white border-white text-black shadow-glow-cyan' 
                          : 'bg-white/[0.03] border-white/5 text-gray-500 hover:border-white/20'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-[#0a0b0d] p-8 rounded-[2.5rem] border border-white/10 opacity-40">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-cyber-cyan animate-pulse shadow-glow-cyan" />
                <span className="text-[8px] font-black uppercase tracking-[0.5em] text-white">Security Protocol: Active</span>
              </div>
            </div>
          </div>

          {/* Form Column */}
          <div className="lg:col-span-8 flex flex-col">
            <div className="bg-[#0a0b0d]/60 backdrop-blur-3xl p-12 rounded-[4rem] border border-white/10 shadow-2xl flex-1 relative overflow-hidden">
              <div className="absolute -top-32 -right-32 w-64 h-64 bg-cyber-cyan/5 rounded-full blur-[100px]" />
              
              <form onSubmit={handleSubmit} className="relative z-10 space-y-10 h-full flex flex-col">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 ml-1">Identity Name</label>
                    <input
                      type="text"
                      name="displayName"
                      value={formData.displayName}
                      onChange={handleChange}
                      className="w-full bg-white/[0.03] border border-white/5 rounded-[1.5rem] px-8 py-5 text-sm font-black text-white focus:outline-none focus:border-cyber-cyan/40 transition-all placeholder:text-gray-800 tracking-widest"
                      placeholder="ENTER IDENTITY"
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 ml-1">Neural Handle</label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className="w-full bg-white/[0.03] border border-white/5 rounded-[1.5rem] px-8 py-5 text-sm font-black text-white focus:outline-none focus:border-cyber-cyan/40 transition-all placeholder:text-gray-800 tracking-widest"
                      placeholder="ENTER HANDLE"
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 ml-1">Alias (Nickname)</label>
                    <input
                      type="text"
                      name="nickname"
                      value={formData.nickname}
                      onChange={handleChange}
                      className="w-full bg-white/[0.03] border border-white/5 rounded-[1.5rem] px-8 py-5 text-sm font-black text-white focus:outline-none focus:border-cyber-cyan/40 transition-all placeholder:text-gray-800 tracking-widest"
                      placeholder="ENTER ALIAS"
                    />
                  </div>
                  
                  <div className="md:col-span-2 space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 ml-1">Mission Log (Bio)</label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      rows="5"
                      className="w-full bg-white/[0.03] border border-white/5 rounded-[2rem] px-8 py-6 text-sm font-medium text-white focus:outline-none focus:border-cyber-cyan/40 transition-all placeholder:text-gray-800 resize-none leading-relaxed"
                      placeholder="ENTER MISSION OBJECTIVES..."
                    />
                  </div>
                </div>

                <div className="mt-auto pt-10 flex justify-end">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit" 
                    disabled={saving || uploading}
                    className="px-12 py-5 rounded-3xl bg-white text-black font-black text-[11px] uppercase tracking-[0.4em] shadow-glow-cyan hover:bg-cyber-cyan transition-all disabled:opacity-50"
                  >
                    {saving ? "TRANSMITTING..." : "SAVE_IDENT_v2"}
                  </motion.button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};


export default ProfileSettings;
