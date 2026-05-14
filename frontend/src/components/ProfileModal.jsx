import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../store/authStore';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import Card from './Card';
import Button from './Button';
import { getAvatarUrl } from '../utils/avatar';

const ProfileModal = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuthStore();
  const { showToast } = useToast();
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
    if (user && isOpen) {
      setFormData({
        displayName: user.displayName || user.name || '',
        username: user.username || '',
        bio: user.bio || '',
        status: user.status || 'Available',
        avatar: user.avatar || '',
        nickname: user.nickname || ''
      });
    }
  }, [user, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast("ID File too large (max 2MB)", "error");
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
      showToast("ID Registry updated", "success");
    } catch (err) {
      showToast("ID processing failed", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const result = await updateProfile(formData);
    if (result.success) {
      showToast("Identity updated", "success");
      onClose();
    } else {
      showToast(result.error, "error");
    }
    setSaving(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 overflow-hidden bg-[#050608]/80 backdrop-blur-xl">
          {/* Backdrop Overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-5xl bg-[#0a0b0d] border border-white/10 shadow-[0_64px_128px_-16px_rgba(0,0,0,0.8)] rounded-[4rem] flex flex-col md:flex-row overflow-hidden max-h-full"
          >
            {/* Sidebar Identity View */}
            <div className="w-full md:w-[40%] p-12 flex flex-col items-center bg-white/[0.02] border-r border-white/5 relative">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-cyber-cyan to-transparent opacity-50" />
              
              <div className="text-center mb-12">
                <h3 className="text-[10px] font-black text-white uppercase tracking-[0.5em]">Identity Registry</h3>
                <p className="text-[8px] font-black text-cyber-cyan uppercase tracking-[0.3em] mt-2 opacity-60">Status: Verified</p>
              </div>

              <motion.div 
                whileHover={{ scale: 1.02 }}
                onClick={() => fileInputRef.current.click()}
                className="relative group cursor-pointer mb-10"
              >
                <div className={`w-52 h-52 rounded-[3.5rem] p-1.5 bg-gradient-to-br from-cyber-cyan/40 to-transparent transition-all group-hover:from-cyber-cyan shadow-2xl overflow-hidden ${uploading ? 'opacity-50' : ''}`}>
                  <div className="w-full h-full bg-[#0a0b0d] rounded-[3rem] overflow-hidden flex items-center justify-center">
                    {formData.avatar ? (
                      <img src={getAvatarUrl(formData.avatar)} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-6xl font-black text-white">
                        {(formData.displayName || formData.username || "U").charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="absolute inset-0 bg-cyber-cyan/10 rounded-[3.5rem] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                  <div className="px-4 py-2 bg-white text-black rounded-xl text-[9px] font-black uppercase tracking-widest shadow-2xl">Update ID</div>
                </div>

                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-cyber-cyan border-t-transparent rounded-full animate-spin shadow-glow-cyan" />
                  </div>
                )}
              </motion.div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
              
              <div className="w-full space-y-6">
                <div className="bg-white/[0.03] p-6 rounded-3xl border border-white/5 text-center">
                  <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1.5">Universal Handle</p>
                  <p className="text-base font-black text-white uppercase tracking-[0.1em]">@{formData.username || 'UNKNOWN'}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {['Available', 'Busy', 'Away', 'Invisible'].map((s) => (
                    <button
                      key={s}
                      type="button"
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
              
              <div className="mt-auto pt-10 flex items-center gap-3 opacity-20">
                <div className="w-1.5 h-1.5 rounded-full bg-cyber-cyan shadow-glow-cyan animate-pulse" />
                <span className="text-[8px] font-black uppercase tracking-[0.4em] text-white">Encryption Layer Active</span>
              </div>
            </div>

            {/* Main Form Area */}
            <form onSubmit={handleSubmit} className="flex-1 p-16 flex flex-col gap-10 overflow-y-auto bg-black/[0.1] backdrop-blur-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Edit Identity</h2>
                  <p className="text-[10px] font-black text-cyber-cyan uppercase tracking-[0.4em] mt-2">Personal Data Protocol</p>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={onClose}
                  className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-gray-600 hover:text-white transition-all"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2.5">
                  <label className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-600 ml-1">Callsign</label>
                  <input
                    type="text"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleChange}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-8 py-5 text-sm font-black text-white focus:outline-none focus:border-cyber-cyan/40 transition-all placeholder:text-gray-800 tracking-widest"
                    placeholder="ENTER IDENTITY"
                    required
                  />
                </div>

                <div className="space-y-2.5">
                  <label className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-600 ml-1">Neural Alias (Nickname)</label>
                  <input
                    type="text"
                    name="nickname"
                    value={formData.nickname}
                    onChange={handleChange}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-8 py-5 text-sm font-black text-white focus:outline-none focus:border-cyber-cyan/40 transition-all placeholder:text-gray-800 tracking-widest"
                    placeholder="ENTER ALIAS"
                  />
                </div>

                <div className="md:col-span-2 space-y-2.5">
                  <label className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-600 ml-1">Brief (Bio)</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows="4"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-[2rem] px-8 py-6 text-sm font-medium text-white focus:outline-none focus:border-cyber-cyan/40 transition-all placeholder:text-gray-800 resize-none leading-relaxed"
                    placeholder="ENTER MISSION OBJECTIVES..."
                  />
                </div>
              </div>

              <div className="mt-auto pt-12 flex gap-6">
                <button 
                  type="button" 
                  onClick={onClose}
                  className="flex-1 py-5 rounded-[2rem] border border-white/5 bg-white/[0.02] text-gray-500 font-black text-[10px] uppercase tracking-[0.3em] hover:text-white transition-all"
                >
                  Abort
                </button>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit" 
                  disabled={saving || uploading}
                  className="flex-[2] py-5 rounded-[2rem] bg-white text-black font-black text-[10px] uppercase tracking-[0.3em] shadow-glow-cyan hover:bg-cyber-cyan transition-all disabled:opacity-50"
                >
                  {saving ? "Transmitting..." : "Update Identity"}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};


export default ProfileModal;
