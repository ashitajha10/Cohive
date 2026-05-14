import React, { useState } from 'react';
import Button from './Button';
import Card from './Card';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const AddResourceModal = ({ isOpen, onClose, roomId, onResourceAdded }) => {
  const [activeMode, setActiveMode] = useState('link'); // link, upload
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let resourceData = { roomId, title };

      if (activeMode === 'link') {
        if (!url.trim()) throw new Error('URL is required');
        resourceData.type = 'link';
        resourceData.url = url;
      } else {
        if (!file) throw new Error('Please select a file');
        
        const formData = new FormData();
        formData.append('file', file);
        
        const uploadRes = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        resourceData.url = uploadRes.data.url;
        resourceData.type = file.type.includes('pdf') ? 'pdf' : 'image';
        if (!title) resourceData.title = file.name;
      }

      const res = await api.post('/resources', resourceData);
      if (onResourceAdded) onResourceAdded(res.data);
      onClose();
      setTitle('');
      setUrl('');
      setFile(null);
      showToast('Resource uplinked successfully', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to add resource', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050608]/80 backdrop-blur-xl">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md p-10 bg-[#0a0b0d] border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] rounded-[3rem] relative overflow-hidden"
      >
        {/* Glow effect */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyber-cyan/10 rounded-full blur-[80px]" />
        
        <div className="flex items-center justify-between mb-8 relative z-10">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tighter uppercase">New Resource</h2>
            <p className="text-[9px] font-black text-cyber-cyan uppercase tracking-[0.3em] mt-1">Data Uplink Protocol</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-600 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex bg-white/[0.03] p-1.5 rounded-2xl mb-10 border border-white/5 relative z-10">
          <button
            onClick={() => setActiveMode('link')}
            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeMode === 'link' ? 'bg-white text-black shadow-glow-cyan' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Link
          </button>
          <button
            onClick={() => setActiveMode('upload')}
            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeMode === 'upload' ? 'bg-white text-black shadow-glow-cyan' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Upload
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Asset Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={activeMode === 'link' ? "RESOURCE TITLE" : "FILENAME (OPTIONAL)"}
              className="w-full px-6 py-4 bg-white/[0.03] border border-white/10 focus:border-cyber-cyan/40 rounded-2xl outline-none transition-all text-xs font-black text-white placeholder:text-gray-800 tracking-widest"
              required={activeMode === 'link'}
            />
          </div>

          {activeMode === 'link' ? (
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Universal Link</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="HTTPS://..."
                className="w-full px-6 py-4 bg-white/[0.03] border border-white/10 focus:border-cyber-cyan/40 rounded-2xl outline-none transition-all text-xs font-black text-white placeholder:text-gray-800 tracking-widest"
                required
              />
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Binary Input</label>
              <label className="flex flex-col items-center justify-center w-full h-32 border border-dashed border-white/10 rounded-[2rem] cursor-pointer hover:bg-white/[0.05] hover:border-cyber-cyan/40 transition-all group/upload">
                <div className="flex flex-col items-center justify-center text-center px-4">
                  <svg className="w-6 h-6 mb-2 text-gray-700 group-hover/upload:text-cyber-cyan transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest truncate max-w-[250px]">{file ? file.name : "Tap to select transmission"}</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files[0])}
                  accept=".pdf,image/*"
                />
              </label>
            </div>
          )}

          <div className="pt-4 flex gap-4">
            <button 
              type="button" 
              className="flex-1 rounded-2xl py-4 font-black text-[10px] uppercase tracking-widest bg-white/[0.03] border border-white/10 text-gray-500 hover:text-white transition-all" 
              onClick={onClose}
            >
              Abort
            </button>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              disabled={loading}
              className="flex-[2] rounded-2xl py-4 font-black text-[10px] uppercase tracking-widest bg-cyber-cyan text-black hover:bg-white shadow-glow-cyan transition-all disabled:opacity-50"
            >
              {loading ? "TRANSMITTING..." : "INITIATE UPLINK"}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};


export default AddResourceModal;
