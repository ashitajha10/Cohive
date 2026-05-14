import React from 'react';

const NoteList = ({ notes, activeNoteId, onNoteSelect, onNewNote, isCreating, setIsCreating, onCreateNote }) => {
  const [newTitle, setNewTitle] = React.useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setIsCreating(false);
      return;
    }
    onCreateNote(newTitle.trim());
    setNewTitle('');
  };

  return (
    <div className="w-80 border-r border-white/5 flex flex-col bg-white/5 backdrop-blur-xl">
      <div className="p-8 border-b border-white/5">
        {isCreating ? (
          <form onSubmit={handleSubmit} className="animate-in fade-in zoom-in-95 duration-300">
            <input 
              autoFocus
              type="text" 
              placeholder="ENTER FILENAME..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value.toUpperCase())}
              className="w-full bg-primary-600/10 border border-primary-500/50 rounded-xl px-4 py-3 text-xs font-black text-white placeholder:text-gray-600 outline-none focus:ring-2 focus:ring-primary-500/30 transition-all mb-2"
              onKeyDown={(e) => { if (e.key === 'Escape') setIsCreating(false); }}
            />
            <div className="flex gap-2">
              <button 
                type="submit"
                className="flex-1 bg-primary-600 text-[9px] font-black uppercase tracking-widest py-2 rounded-lg hover:bg-primary-500 transition-all"
              >
                Sync
              </button>
              <button 
                type="button"
                onClick={() => setIsCreating(false)}
                className="flex-1 bg-white/5 text-[9px] font-black uppercase tracking-widest py-2 rounded-lg hover:bg-white/10 transition-all"
              >
                Abort
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsCreating(true)}
            className="w-full bg-white/5 hover:bg-white/10 text-white border-2 border-dashed border-white/10 hover:border-primary-500/50 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 group"
          >
            <svg className="w-4 h-4 transition-transform group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
            </svg>
            Initialize Note
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-3 custom-scrollbar">
        {notes.length === 0 ? (
          <div className="text-center py-20 px-6 opacity-30">
            <p className="text-white text-[10px] font-black uppercase tracking-widest leading-relaxed">No data fragments detected</p>
          </div>
        ) : (
          notes.map((note) => (
            <button
              key={note._id}
              onClick={() => onNoteSelect(note)}
              className={`w-full text-left p-5 rounded-[1.5rem] transition-all relative overflow-hidden group ${
                activeNoteId === note._id
                  ? 'bg-primary-600/20 shadow-glow-purple border border-primary-500/30'
                  : 'hover:bg-white/5 text-gray-400'
              }`}
            >
              {activeNoteId === note._id && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-500 rounded-r-full shadow-glow-purple"></div>
              )}
              <h4 className={`text-sm font-black truncate tracking-tight ${activeNoteId === note._id ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                {note.title || 'NULL_SEGMENT'}
              </h4>
              <div className="flex items-center gap-3 mt-3">
                <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[8px] font-black text-primary-400">
                  {note.lastEditedBy?.name?.charAt(0) || 'E'}
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">
                  {new Date(note.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default NoteList;
