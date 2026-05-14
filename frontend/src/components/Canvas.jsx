import React, { useRef, useEffect, useState } from 'react';

const Canvas = ({ 
  brushColor, 
  brushSize, 
  tool, 
  onDraw, 
  externalDrawData, 
  onClear, 
  roomId, 
  initialData 
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const pathsRef = useRef([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const setupCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas.parentElement) return;

    const { offsetWidth, offsetHeight } = canvas.parentElement;
    
    // Set display size
    canvas.style.width = `${offsetWidth}px`;
    canvas.style.height = `${offsetHeight}px`;
    
    // Set actual resolution
    canvas.width = offsetWidth * 2;
    canvas.height = offsetHeight * 2;

    const context = canvas.getContext("2d");
    context.scale(2, 2);
    context.lineCap = "round";
    context.lineJoin = "round";
    contextRef.current = context;
    
    redraw();
  };

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      setupCanvas();
    });

    if (canvasRef.current && canvasRef.current.parentElement) {
      observer.observe(canvasRef.current.parentElement);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (initialData) {
      pathsRef.current = initialData;
      redraw();
    }
  }, [initialData]);

  useEffect(() => {
    if (externalDrawData) {
      drawPath(externalDrawData);
      pathsRef.current.push(externalDrawData);
    }
  }, [externalDrawData]);

  const redraw = () => {
    const context = contextRef.current;
    if (!context || !canvasRef.current) return;
    
    context.save();
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    context.restore();
    
    pathsRef.current.forEach(path => drawPath(path));
  };

  const drawPath = (path) => {
    const context = contextRef.current;
    if (!context) return;
    
    context.save();
    context.beginPath();
    
    if (path.tool === 'eraser') {
      context.globalCompositeOperation = 'destination-out';
    } else {
      context.globalCompositeOperation = 'source-over';
      context.strokeStyle = path.color;
    }
    
    context.lineWidth = path.size;
    context.moveTo(path.points[0].x, path.points[0].y);
    path.points.forEach(point => {
      context.lineTo(point.x, point.y);
    });
    context.stroke();
    context.restore();
  };

  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    
    const context = contextRef.current;
    if (!context) return;

    context.save();
    if (tool === 'eraser') {
      context.globalCompositeOperation = 'destination-out';
    } else {
      context.globalCompositeOperation = 'source-over';
      context.strokeStyle = brushColor;
    }
    context.lineWidth = brushSize;
    context.beginPath();
    context.moveTo(offsetX, offsetY);
    
    setIsDrawing(true);

    const newPath = {
      tool: tool,
      color: brushColor,
      size: brushSize,
      points: [{ x: offsetX, y: offsetY }]
    };
    pathsRef.current.push(newPath);
  };

  const finishDrawing = () => {
    if (!isDrawing) return;
    contextRef.current.restore();
    setIsDrawing(false);
    
    const lastPath = pathsRef.current[pathsRef.current.length - 1];
    onDraw(lastPath);
  };

  const draw = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    setMousePos({ x: offsetX, y: offsetY });

    if (!isDrawing) return;
    
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();

    const currentPath = pathsRef.current[pathsRef.current.length - 1];
    currentPath.points.push({ x: offsetX, y: offsetY });
  };

  const clearCanvas = () => {
    const context = contextRef.current;
    if (!context || !canvasRef.current) return;
    
    context.save();
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    context.restore();
    pathsRef.current = [];
    if (onClear) onClear();
  };

  window.clearLocalCanvas = clearCanvas;

  return (
    <div className="relative w-full h-full overflow-hidden" ref={containerRef}>
      <canvas
        onMouseDown={startDrawing}
        onMouseUp={finishDrawing}
        onMouseMove={draw}
        onMouseOut={finishDrawing}
        ref={canvasRef}
        className={`bg-white touch-none w-full h-full ${tool === 'eraser' ? 'cursor-none' : 'cursor-crosshair'}`}
      />
      
      {tool === 'eraser' && (
        <div 
          className="absolute pointer-events-none border-2 border-primary-500 rounded-full z-50 mix-blend-difference"
          style={{
            width: `${brushSize}px`,
            height: `${brushSize}px`,
            left: `${mousePos.x}px`,
            top: `${mousePos.y}px`,
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(255, 255, 255, 0.2)'
          }}
        />
      )}
    </div>
  );
};

export default Canvas;
