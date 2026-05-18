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
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas.parentElement;
    if (!parent) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        if (width === 0 || height === 0) continue;

        let tempImage = null;
        try {
          if (canvas.width > 0 && canvas.height > 0) {
            tempImage = canvas.toDataURL();
          }
        } catch (e) {
          console.warn("Could not backup canvas:", e);
        }

        canvas.width = width * 2;
        canvas.height = height * 2;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        const context = canvas.getContext('2d');
        context.scale(2, 2);
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.strokeStyle = color;
        context.lineWidth = brushSize;
        contextRef.current = context;

        if (tempImage) {
          const img = new Image();
          img.onload = () => {
            context.save();
            context.setTransform(1, 0, 0, 1, 0, 0); // Reset scaling
            context.drawImage(img, 0, 0, width * 2, height * 2);
            context.restore(); // Restore context scale (2, 2)
          };
          img.src = tempImage;
        }
      }
    });

    resizeObserver.observe(parent);

    const handleDraw = (data) => {
      if (data.roomId !== roomId) return;
      const { x, y, lastX, lastY, color: remoteColor, size, type } = data;
      const ctx = contextRef.current;
      if (!ctx) return;
      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = remoteColor;
      ctx.lineWidth = size;
      ctx.globalCompositeOperation = type === 'eraser' ? 'destination-out' : 'source-over';
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.restore();
    };

    const handleClear = (data) => {
      if (data.roomId !== roomId) return;
      const ctx = contextRef.current;
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
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
      resizeObserver.disconnect();
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
    contextRef.current.lastX = offsetX;
    contextRef.current.lastY = offsetY;
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
    
    const lastX = ctx.lastX !== null ? ctx.lastX : offsetX;
    const lastY = ctx.lastY !== null ? ctx.lastY : offsetY;

    ctx.save();
    ctx.beginPath();
    ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
    ctx.restore();

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

  const handleClearClick = () => {
    if (showClearConfirm) {
      clearCanvas();
      setShowClearConfirm(false);
    } else {
      setShowClearConfirm(true);
      // Automatically cancel confirmation after 3 seconds
      setTimeout(() => setShowClearConfirm(false), 3000);
    }
  };

  return (
    <div className="relative w-full h-full bg-[#0a0b0d] overflow-hidden group">
      {/* Immersive Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,243,255,0.03),transparent)] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none" />
      
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
        className="absolute top-10 left-10 flex flex-col items-center gap-3 p-3 bg-[#0a0b0d]/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] z-20"
      >
        <div className="flex flex-col items-center gap-2 bg-white/[0.03] p-1.5 rounded-2xl border border-white/5">
          {/* Option 1: Pen */}
          <ToolButton 
            active={tool === 'pen'} 
            onClick={() => setTool('pen')} 
            title="Pen Tool" 
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>} 
          />

          {/* Option 2: Eraser */}
          <ToolButton 
            active={tool === 'eraser'} 
            onClick={() => setTool('eraser')} 
            title="Eraser Tool" 
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 7L2 14v4h4l7-7m-4-4l5-5c1-1 3.5 1.5 2.5 2.5l-5 5m-2.5-2.5l2.5 2.5M12 22h10" /></svg>} 
          />

          {/* Option 3: Clear Button */}
          <ToolButton 
            active={showClearConfirm} 
            onClick={handleClearClick} 
            title={showClearConfirm ? "Confirm Clear?" : "Clear Board"} 
            className={showClearConfirm ? 'bg-red-500/20 text-red-500 animate-pulse border border-red-500/30' : ''}
            icon={showClearConfirm ? (
              <svg className="w-5 h-5 text-red-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            ) : (
              <svg className="w-5 h-5 text-gray-600 hover:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            )} 
          />
        </div>

        {/* Dynamic Divider */}
        <div className="w-6 h-[1px] bg-white/10" />

        {/* Premium 6-Color Palette Grid */}
        <div className="grid grid-cols-2 gap-2 bg-white/[0.03] p-1.5 rounded-2xl border border-white/5">
          {['#00F3FF', '#FF00C8', '#9D00FF', '#39FF14', '#FFE600', '#FFFFFF'].map(c => (
            <motion.button
              key={c}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.85 }}
              onClick={() => { setColor(c); setTool('pen'); }}
              className={`w-4 h-4 rounded-full transition-all border ${
                color === c && tool === 'pen' 
                  ? 'border-white scale-110 shadow-[0_0_10px_var(--glow-color)]' 
                  : 'border-transparent hover:border-white/40'
              }`}
              style={{ 
                backgroundColor: c,
                '--glow-color': c 
              }}
              title={`Use ${c}`}
            />
          ))}
        </div>
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
    className={`p-3 rounded-xl transition-all ${active ? 'bg-white text-black shadow-glow-cyan' : 'text-gray-600 hover:text-gray-300'}`}
  >
    {icon}
  </motion.button>
);


export default WhiteboardPanel;
