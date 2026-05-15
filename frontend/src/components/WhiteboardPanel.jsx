import React, { useRef, useEffect, useState } from 'react';
import socket from '../services/socket';
import { motion, AnimatePresence } from 'framer-motion';

const WhiteboardPanel = ({ roomId, user }) => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#00F3FF');
  const [brushSize, setBrushSize] = useState(5);
  const [tool, setTool] = useState('pen');
  const [cursors, setCursors] = useState({});

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = canvas.parentElement.clientWidth * 2;
    canvas.height = canvas.parentElement.clientHeight * 2;
    canvas.style.width = `${canvas.parentElement.clientWidth}px`;
    canvas.style.height = `${canvas.parentElement.clientHeight}px`;

    const context = canvas.getContext('2d');
    context.scale(2, 2);
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = color;
    context.lineWidth = brushSize;
    contextRef.current = context;

    const handleDraw = (data) => {
      if (data.roomId !== roomId) return;
      const { x, y, lastX, lastY, color: remoteColor, size, type } = data;
      const ctx = contextRef.current;
      ctx.beginPath();
      ctx.strokeStyle = remoteColor;
      ctx.lineWidth = size;
      ctx.globalCompositeOperation = type === 'eraser' ? 'destination-out' : 'source-over';
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.stroke();
    };

    const handleClear = (data) => {
      if (data.roomId !== roomId) return;
      const ctx = contextRef.current;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    const handleCursor = (data) => {
      if (data.roomId !== roomId || data.userId === user._id) return;
      setCursors(prev => ({
        ...prev,
        [data.userId]: { x: data.x, y: data.y, name: data.name }
      }));
    };

    socket.on('draw', handleDraw);
    socket.on('clear_whiteboard', handleClear);
    socket.on('whiteboard_cursor', handleCursor);

    return () => {
      socket.off('draw', handleDraw);
      socket.off('clear_whiteboard', handleClear);
      socket.off('whiteboard_cursor', handleCursor);
    };
  }, [roomId, user._id]);

  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.strokeStyle = color;
      contextRef.current.lineWidth = brushSize;
    }
  }, [color, brushSize]);

  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) {
      socket.emit('whiteboard_cursor', {
        roomId,
        userId: user._id,
        name: user.nickname || user.displayName || user.name,
        x: nativeEvent.offsetX,
        y: nativeEvent.offsetY
      });
      return;
    }

    const { offsetX, offsetY } = nativeEvent;
    const ctx = contextRef.current;
    
    const lastX = ctx.lastX || offsetX;
    const lastY = ctx.lastY || offsetY;

    ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();

    socket.emit('draw', {
      roomId,
      x: offsetX,
      y: offsetY,
      lastX,
      lastY,
      color,
      size: brushSize,
      type: tool
    });

    ctx.lastX = offsetX;
    ctx.lastY = offsetY;
    
    socket.emit('whiteboard_cursor', {
      roomId,
      userId: user._id,
      name: user.nickname || user.displayName || user.name,
      x: offsetX,
      y: offsetY
    });
  };

  const stopDrawing = () => {
    contextRef.current.closePath();
    contextRef.current.lastX = null;
    contextRef.current.lastY = null;
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    socket.emit('clear_whiteboard', { roomId });
  };

  return (
    <div className="relative w-full h-full bg-[#161b22]/50 overflow-hidden group border-t border-white/5">
      {/* Immersive Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02),transparent)] pointer-events-none z-0" />
      
      {/* Canvas */}
      <canvas
        onMouseDown={startDrawing}
        onMouseUp={stopDrawing}
        onMouseMove={draw}
        onMouseLeave={stopDrawing}
        ref={canvasRef}
        className="block cursor-crosshair relative z-10"
      />

      {/* Floating Toolbar */}
      <motion.div 
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="absolute top-6 left-6 flex flex-col items-center gap-4 p-3 bg-[#161b22] border border-white/10 rounded-2xl shadow-xl z-20"
      >
        <div className="flex flex-col items-center gap-2 bg-black/20 p-1.5 rounded-xl border border-white/5">
          <ToolButton active={tool === 'pen'} onClick={() => setTool('pen')} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>} />
          <ToolButton active={tool === 'eraser'} onClick={() => setTool('eraser')} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>} />
        </div>

        <div className="grid grid-cols-2 gap-2">
          {['#00F3FF', '#FF00C8', '#ffffff', '#22c55e', '#eab308', '#ef4444'].map(c => (
            <motion.button
              key={c}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => { setColor(c); setTool('pen'); }}
              className={`w-5 h-5 rounded-full transition-all border-2 ${color === c && tool === 'pen' ? 'border-white scale-110 shadow-sm' : 'border-transparent'}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        <div className="flex flex-col items-center gap-3 bg-black/20 p-2 rounded-xl border border-white/5">
          <div className="h-24 w-1 flex items-center justify-center relative">
            <input 
              type="range" 
              min="1" max="40" 
              value={brushSize} 
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="w-24 accent-white -rotate-90 absolute cursor-pointer"
            />
          </div>
          <span className="text-[10px] font-medium text-gray-500">{brushSize}px</span>
        </div>

        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={clearCanvas}
          className="w-10 h-10 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all flex items-center justify-center"
          title="Clear Board"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </motion.button>
      </motion.div>

      {/* Remote Cursors */}
      <AnimatePresence>
        {Object.entries(cursors).map(([id, data]) => (
          <motion.div
            key={id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, x: data.x, y: data.y }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 150, damping: 20 }}
            className="absolute top-0 left-0 z-30 pointer-events-none"
          >
            <svg className="w-5 h-5 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l-7 19 7-4 7 4-7-19z" />
            </svg>
            <div className="px-2.5 py-1.5 bg-white text-black rounded-lg text-[8px] font-black uppercase tracking-[0.2em] mt-1 whitespace-nowrap shadow-2xl">
              {data.name}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

const ToolButton = ({ active, onClick, icon }) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    className={`p-2.5 rounded-xl transition-all ${active ? 'bg-white text-black' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
  >
    {icon}
  </motion.button>
);


export default WhiteboardPanel;
