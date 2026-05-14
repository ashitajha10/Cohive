import React from 'react';

const WhiteboardToolbar = ({ 
  tool, 
  setTool, 
  brushColor, 
  setBrushColor, 
  brushSize, 
  setBrushSize, 
  onClear 
}) => {
  const colors = [
    '#000000', '#FF0000', '#FFA500', '#FFFF00', 
    '#00FF00', '#00FFFF', '#0000FF', '#7c3aed',
    '#FF00FF', '#FF1493'
  ];

  const sizes = [2, 5, 10, 15];

  return (
    <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-[#0b0a24]/80 backdrop-blur-2xl p-3.5 rounded-3xl shadow-glow-purple border border-white/10 z-20">
      <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 gap-1">
        <button 
          onClick={() => setTool('select')}
          className={`flex flex-col items-center justify-center gap-1 w-16 py-2 rounded-xl transition-all relative ${tool === 'select' ? 'bg-primary-600/20 text-white border border-primary-500/50 shadow-glow-purple' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
          </svg>
          <span className="text-[10px] font-black">Select</span>
        </button>
        <button 
          onClick={() => setTool('pen')}
          className={`flex flex-col items-center justify-center gap-1 w-16 py-2 rounded-xl transition-all relative ${tool === 'pen' ? 'bg-primary-600 text-white border border-primary-500 shadow-glow-purple' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          <span className="text-[10px] font-black">Pen</span>
        </button>
        <button 
          onClick={() => setTool('eraser')}
          className={`flex flex-col items-center justify-center gap-1 w-16 py-2 rounded-xl transition-all relative ${tool === 'eraser' ? 'bg-red-500/20 text-red-400 border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 16v1a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h2m4 3.4L20.4 12l-4.2 4.2L12 12.6l4.2-4.2z" />
          </svg>
          <span className="text-[10px] font-black">Eraser</span>
        </button>
      </div>

      <div className="w-px h-8 bg-white/10"></div>

      <div className="flex gap-2">
        {colors.map(c => (
          <button
            key={c}
            onClick={() => { setBrushColor(c); setTool('pen'); }}
            className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-125 ${brushColor === c && tool === 'pen' ? 'border-white scale-125 shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'border-transparent'}`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>

      <div className="w-px h-8 bg-white/10"></div>

      <div className="flex items-center gap-2">
        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2 hidden md:block">Size</span>
        {sizes.map(s => (
          <button
            key={s}
            onClick={() => setBrushSize(s)}
            className={`w-8 h-8 rounded-xl border flex items-center justify-center text-[10px] font-black transition-all ${brushSize === s ? 'bg-primary-600 border-primary-500 text-white shadow-glow-purple' : 'bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="w-px h-8 bg-white/10"></div>

      <button 
        onClick={onClear}
        className="flex flex-col items-center justify-center gap-1 w-16 py-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
        title="Clear Board"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
        <span className="text-[10px] font-black">Reset</span>
      </button>
    </div>
  );
};

export default WhiteboardToolbar;
