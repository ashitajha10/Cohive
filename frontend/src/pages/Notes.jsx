import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/Layout';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import { useToast } from '../context/ToastContext';
import debounce from 'lodash/debounce';
import Loader from '../components/Loader';

const Notes = () => {
  const { user } = useAuthStore();
  const { showToast } = useToast();
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchNotes = async () => {
    try {
      const res = await api.get('/notes/personal');
      setNotes(res.data);
      if (res.data.length > 0 && !selectedNote) {
        setSelectedNote(res.data[0]);
      }
    } catch (err) {
      showToast("System error: Failed to retrieve records", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const createNote = async () => {
    try {
      const res = await api.post('/notes', { title: "New Neural Record" });
      setNotes([res.data, ...notes]);
      setSelectedNote(res.data);
      showToast("New record initialized", "success");
    } catch (err) {
      showToast("Initialization failed", "error");
    }
  };

  const deleteNote = async (id) => {
    if (!window.confirm("Purge this record from the database?")) return;
    try {
      await api.delete(`/notes/${id}`);
      const updatedNotes = notes.filter(n => n._id !== id);
      setNotes(updatedNotes);
      if (selectedNote?._id === id) {
        setSelectedNote(updatedNotes[0] || null);
      }
      showToast("Record purged", "success");
    } catch (err) {
      showToast("Purge failed", "error");
    }
  };

  const saveNote = async (id, data) => {
    setIsSaving(true);
    try {
      const res = await api.put(`/notes/${id}`, data);
      setNotes(notes.map(n => n._id === id ? res.data : n));
      setLastSaved(new Date());
    } catch (err) {
      showToast("Data sync failed", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const debouncedSave = useCallback(
    debounce((id, data) => saveNote(id, data), 1500),
    []
  );

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setSelectedNote({ ...selectedNote, title: newTitle });
    debouncedSave(selectedNote._id, { title: newTitle });
  };

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setSelectedNote({ ...selectedNote, content: newContent });
    debouncedSave(selectedNote._id, { content: newContent });
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="flex h-full gap-8 relative">
        {/* Notes Explorer Sidebar */}
        <div className="w-96 flex flex-col gap-6 h-full">
          <div className="glass-panel p-8 rounded-[2.5rem] border-white/5 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-white uppercase tracking-tighter">Neural Core</h2>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={createNote}
                className="w-10 h-10 rounded-xl bg-cyber-cyan text-black flex items-center justify-center shadow-glow-cyan"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
              </motion.button>
            </div>
            
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search Records..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3 px-12 text-[10px] font-black uppercase tracking-widest text-white focus:outline-none focus:border-cyber-cyan/40 focus:bg-white/[0.06] transition-all"
              />
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
            <AnimatePresence mode="popLayout">
              {loading ? (
                <div className="flex justify-center py-20"><Loader size="md" /></div>
              ) : filteredNotes.map((note) => (
                <motion.div
                  key={note._id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onClick={() => setSelectedNote(note)}
                  className={`p-6 rounded-[2rem] border transition-all duration-300 cursor-pointer group relative overflow-hidden ${
                    selectedNote?._id === note._id 
                      ? 'bg-cyber-cyan/10 border-cyber-cyan/30 shadow-glow-cyan' 
                      : 'bg-[#0a0b0d]/40 border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[8px] font-black text-cyber-cyan uppercase tracking-widest">
                        {new Date(note.updatedAt).toLocaleDateString()}
                      </span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); deleteNote(note._id); }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-cyber-pink transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                    <h3 className={`text-sm font-black uppercase tracking-tight truncate ${selectedNote?._id === note._id ? 'text-white' : 'text-gray-400'}`}>
                      {note.title}
                    </h3>
                    <p className="text-[10px] text-gray-600 line-clamp-1 mt-1 font-medium tracking-tight">
                      {note.content || "Empty terminal data..."}
                    </p>
                  </div>
                  {selectedNote?._id === note._id && (
                    <motion.div 
                      layoutId="noteGlow"
                      className="absolute inset-0 bg-gradient-to-r from-cyber-cyan/5 to-transparent pointer-events-none"
                    />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Neural Terminal Editor */}
        <div className="flex-1 glass-panel rounded-[3.5rem] border-white/5 flex flex-col relative overflow-hidden bg-[#050608]/20">
          <AnimatePresence mode="wait">
            {selectedNote ? (
              <motion.div
                key={selectedNote._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col h-full"
              >
                {/* Editor Header */}
                <div className="px-10 py-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                  <div className="flex-1 max-w-xl">
                    <input 
                      type="text" 
                      value={selectedNote.title}
                      onChange={handleTitleChange}
                      className="w-full bg-transparent border-none focus:ring-0 text-3xl font-black text-white uppercase tracking-tighter glow-text-cyan placeholder:text-white/10"
                      placeholder="RECORD_TITLE_NULL"
                    />
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[9px] font-black text-gray-500 uppercase tracking-[0.4em]">ENCRYPTION_ID: {selectedNote._id.slice(-8)}</span>
                      {isSaving && (
                        <div className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-cyber-cyan rounded-full animate-pulse" />
                          <span className="text-[8px] font-black text-cyber-cyan uppercase tracking-widest">Saving...</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 p-12 relative flex flex-col">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,242,0.015),transparent)] pointer-events-none" />
                  <textarea 
                    value={selectedNote.content}
                    onChange={handleContentChange}
                    className="flex-1 bg-transparent border-none focus:ring-0 text-gray-200 text-lg leading-relaxed font-medium resize-none custom-scrollbar placeholder:text-gray-800 tracking-tight"
                    placeholder="Initialize neural uplink. Begin recording terminal data..."
                  />
                  
                  <div className="flex items-center justify-between mt-8 pt-8 border-t border-white/5">
                    <div className="flex gap-4">
                      <div className="px-4 py-2 bg-white/[0.03] rounded-xl border border-white/5 flex items-center gap-2">
                        <span className="text-[8px] font-black text-gray-500 uppercase">Words: {selectedNote.content.split(/\s+/).filter(w => w).length}</span>
                      </div>
                      <div className="px-4 py-2 bg-white/[0.03] rounded-xl border border-white/5 flex items-center gap-2">
                        <span className="text-[8px] font-black text-gray-500 uppercase">Chars: {selectedNote.content.length}</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-black text-white/10 uppercase tracking-[0.5em]">SYSTEM_VERSION_3.0</span>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-20 opacity-40">
                <div className="w-24 h-24 bg-white/5 rounded-[2rem] border border-white/10 flex items-center justify-center mb-8">
                  <svg className="w-10 h-10 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                </div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">No Record Active</h3>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest max-w-xs leading-loose">Select a record from the neural core or initialize a new sequence to begin documentation.</p>
                <Button onClick={createNote} className="mt-10">Initialize New Note</Button>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
};

export default Notes;

