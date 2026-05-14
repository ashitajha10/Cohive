import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const NoteEditor = ({ note, onUpdate, onDelete, currentUserId, isAdmin }) => {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const { showToast } = useToast();
  const timeoutRef = useRef(null);

  useEffect(() => {
    setTitle(note?.title || '');
    setContent(note?.content || '');
    setLastSaved(null);
  }, [note?._id]);

  const handleAutoSave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      if (!note?._id) return;
      setIsSaving(true);
      try {
        const res = await api.put(`/notes/${note._id}`, { title, content });
        onUpdate(res.data);
        setLastSaved(new Date());
      } catch (err) { console.error("Autosave failed", err); }
      finally { setIsSaving(false); }
    }, 1000);
  };

  const handleTitleChange = (e) => { setTitle(e.target.value); handleAutoSave(); };
  const handleContentChange = (e) => { setContent(e.target.value); handleAutoSave(); };

  if (!note) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-12 page-transition">
        <img src="/space_mascot_astronaut_1778492786001.png" className="w-32 h-32 mb-8 animate-float opacity-30" alt="empty" />
        <h3 className="text-2xl font-black text-white mb-3 glow-text-pink">Select a Note</h3>
        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs max-w-xs mx-auto">Choose a note from the list on the left to start editing.</p>
      </div>
    );
  }

  const canDelete = isAdmin || note.createdBy._id === currentUserId || note.createdBy === currentUserId;

  return (
    <div className="flex-1 flex flex-col bg-transparent overflow-hidden">
      <div className="px-10 py-8 border-b border-white/5 flex items-center justify-between backdrop-blur-md">
        <div className="flex-1">
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="NOTE_TITLE"
            className="text-3xl font-black text-white tracking-tighter outline-none border-none bg-transparent placeholder-white/10 w-full glow-text-pink"
          />
          <div className="flex items-center gap-3 mt-2">
            <div className={`w-1.5 h-1.5 rounded-full ${isSaving ? 'bg-yellow-500 animate-pulse' : 'bg-green-500 shadow-glow-cyan'}`}></div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
              {isSaving ? 'Saving changes...' : lastSaved ? `Last Saved: ${lastSaved.toLocaleTimeString()}` : 'All changes saved'}
            </span>
          </div>
        </div>
        
        {canDelete && (
          <button
            onClick={() => onDelete(note._id)}
            className="p-4 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all"
            title="Delete Note"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      <div className="flex-1 p-10">
        <textarea
          value={content}
          onChange={handleContentChange}
          placeholder=">>> START TYPING HERE <<<"
          className="w-full h-full resize-none outline-none border-none bg-transparent text-gray-300 leading-relaxed placeholder-white/5 font-bold text-lg custom-scrollbar"
        />
      </div>
      
      <div className="px-10 py-5 bg-white/5 border-t border-white/5 flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-cyber-cyan flex items-center justify-center text-[10px] font-black text-black shadow-glow-cyan border border-cyber-cyan/20">
            {note.createdBy?.name?.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] font-black uppercase tracking-widest text-gray-500">Created By</span>
            <span className="text-[10px] font-black text-white">{note.createdBy?.name}</span>
          </div>
        </div>
        <div className="w-px h-6 bg-white/10"></div>
        <div className="flex flex-col">
          <span className="text-[8px] font-black uppercase tracking-widest text-gray-500">Last Edited By</span>
          <span className="text-[10px] font-black text-cyber-cyan">{note.lastEditedBy?.name}</span>
        </div>
      </div>
    </div>
  );
};

export default NoteEditor;
