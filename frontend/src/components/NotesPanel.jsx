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
    <div className="flex-1 flex flex-col h-full bg-transparent relative overflow-hidden">
      {/* Header */}
      <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Mission Log</h2>
          <p className="text-xs text-gray-400 mt-1">Realtime collaborative notes</p>
        </div>
        <div className="flex items-center gap-4">
          <AnimatePresence mode="wait">
            {isSaving ? (
              <motion.div 
                key="saving"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full"
              >
                <div className="w-1.5 h-1.5 bg-cyber-cyan rounded-full animate-pulse" />
                <span className="text-[10px] font-semibold text-gray-300 uppercase tracking-widest">Saving...</span>
              </motion.div>
            ) : lastSaved && (
              <motion.div 
                key="saved"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2"
              >
                <div className="w-1 h-1 bg-green-500/40 rounded-full" />
                <span className="text-[10px] font-medium text-gray-500 uppercase tracking-widest">
                  Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Workspace Area */}
      <div className="flex-1 p-6 lg:p-10 relative flex flex-col z-10">
        <div className="flex-1 bg-[#161b22]/50 border border-white/5 rounded-3xl p-8 relative overflow-hidden transition-all duration-300 focus-within:border-cyber-cyan/30 focus-within:bg-[#161b22] backdrop-blur-xl">
          <textarea
            value={notes}
            onChange={handleChange}
            className="w-full h-full bg-transparent border-none focus:ring-0 text-gray-200 text-base leading-relaxed resize-none custom-scrollbar placeholder:text-gray-600 outline-none"
            placeholder="Begin typing collaborative notes here..."
          />
        </div>
      </div>
    </div>
  );
};


export default NotesPanel;
