import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import socket from '../services/socket';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../context/ToastContext';
import debounce from 'lodash/debounce';

const NotesPanel = ({ roomId, user, room }) => {
  const [notes, setNotes] = useState("");
  const [lastSaved, setLastSaved] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();

  const fetchNotes = async () => {
    try {
      const res = await api.get(`/notes/${roomId}`);
      if (res.data) {
        setNotes(res.data.content);
        setLastSaved(new Date(res.data.updatedAt));
      }
    } catch (err) {
      console.error("Failed to load mission logs");
    }
  };

  useEffect(() => {
    fetchNotes();

    const handleNotesUpdate = (data) => {
      if (data.roomId === roomId && data.userId !== user._id) {
        setNotes(data.content);
        setLastSaved(new Date());
      }
    };

    socket.on('notes_updated', handleNotesUpdate);

    return () => {
      socket.off('notes_updated', handleNotesUpdate);
    };
  }, [roomId, user._id]);

  const saveNotes = async (content) => {
    setIsSaving(true);
    try {
      await api.put(`/notes/${roomId}`, { content });
      setLastSaved(new Date());
      socket.emit('notes_updated', { roomId, content, userId: user._id });
    } catch (err) {
      showToast("Data sync failed", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const debouncedSave = useCallback(
    debounce((content) => saveNotes(content), 1000),
    [roomId]
  );

  const handleChange = (e) => {
    const content = e.target.value;
    setNotes(content);
    debouncedSave(content);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#050608]/40 relative overflow-hidden">
      {/* Header */}
      <div className="px-10 py-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02] backdrop-blur-xl">
        <div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Mission Log</h2>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-[10px] font-black text-cyber-cyan uppercase tracking-[0.4em]">NEURAL RECORD</span>
            <div className="w-1 h-1 rounded-full bg-gray-800" />
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">REALTIME ENCRYPTION ACTIVE</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <AnimatePresence mode="wait">
            {isSaving ? (
              <motion.div 
                key="saving"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-3 px-5 py-2 bg-cyber-cyan/5 border border-cyber-cyan/20 rounded-2xl"
              >
                <div className="w-1.5 h-1.5 bg-cyber-cyan rounded-full animate-pulse shadow-glow-cyan" />
                <span className="text-[9px] font-black text-cyber-cyan uppercase tracking-[0.2em]">Synchronizing...</span>
              </motion.div>
            ) : lastSaved && (
              <motion.div 
                key="saved"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2"
              >
                <div className="w-1 h-1 bg-green-500/40 rounded-full" />
                <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">
                  SECURED: {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Workspace Area */}
      <div className="flex-1 p-12 relative flex flex-col">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,242,0.02),transparent)] pointer-events-none" />
        
        <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-[3rem] p-10 relative overflow-hidden group hover:border-white/10 transition-colors">
          <textarea
            value={notes}
            onChange={handleChange}
            className="w-full h-full bg-transparent border-none focus:ring-0 text-gray-100 text-lg leading-relaxed font-medium resize-none custom-scrollbar placeholder:text-gray-800 tracking-tight"
            placeholder="Begin terminal record of collaborative mission details..."
          />
          
          <div className="absolute bottom-8 right-8 pointer-events-none">
            <div className="text-[9px] font-black text-white/5 uppercase tracking-[0.4em] rotate-90 origin-right">
              TERMINAL_LOG_V2.0
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


export default NotesPanel;
