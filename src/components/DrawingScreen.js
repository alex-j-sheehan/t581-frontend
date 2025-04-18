import React, { useRef, useState, useEffect } from 'react';
import WinnersGallery from './WinnersGallery';
import userClient from '../data/UserClient';

const DrawingScreen = ({ onDrawingComplete, winners, prompt, isJudgeMode = false }) => {
  // Drawing state
  const canvasRef = useRef(null);
  const [currentColor, setCurrentColor] = useState('black');
  const [currentWidth, setCurrentWidth] = useState(1);
  const [paths, setPaths] = useState([]);
  const [currentPath, setCurrentPath] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds timer
  const [timerActive, setTimerActive] = useState(true);
  const [autoSubmitted, setAutoSubmitted] = useState(false);

  const colors = {
    black: 'black',
    red: 'red',
    blue: 'blue',
    orange: 'orange',
    yellow: 'yellow',
    green: 'green',
    purple: 'purple',
    pink: 'pink',
    grey: 'grey'
  };

  const widths = [1, 5, 10, 15];

  // Timer effect
  useEffect(() => {
    let interval;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0 && !autoSubmitted && !isJudgeMode) {
      // Time's up, submit the drawing (only if not in judge mode)
      setAutoSubmitted(true);
      handleSubmit();
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft, autoSubmitted, isJudgeMode]);

  // Redraw canvas when paths or current path changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw all completed paths
    paths.forEach(path => {
      ctx.beginPath();
      ctx.moveTo(path.path[0][0], path.path[0][1]);
      for (let i = 1; i < path.path.length; i++) {
        ctx.lineTo(path.path[i][0], path.path[i][1]);
      }
      ctx.strokeStyle = path.color;
      ctx.lineWidth = path.width;
      ctx.stroke();
    });
    
    // Draw current path
    if (currentPath.length > 0) {
      ctx.beginPath();
      ctx.moveTo(currentPath[0][0], currentPath[0][1]);
      for (let i = 1; i < currentPath.length; i++) {
        ctx.lineTo(currentPath[i][0], currentPath[i][1]);
      }
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = currentWidth;
      ctx.stroke();
    }
  }, [paths, currentPath, currentColor, currentWidth]);

  // Drawing functions
  const handleMouseDown = (e) => {
    setIsDrawing(true);
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCurrentPath([[x, y]]);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setCurrentPath(prev => [...prev, [x, y]]);
  };

  const handleMouseUp = () => {
    if (currentPath.length > 0) {
      setPaths(prev => [...prev, {
        color: currentColor,
        width: currentWidth,
        path: currentPath
      }]);
    }
    setIsDrawing(false);
    setCurrentPath([]);
  };

  const handleUndo = () => {
    if (paths.length > 0) {
      setPaths(prev => prev.slice(0, -1));
    }
  };

  const handleSubmit = () => {
    setTimerActive(false);
    
    // Create a drawing object with a random ID
    const drawing = {
      id: Math.floor(Math.random() * 10000),
      title: paths.length > 0 ? "Your Drawing" : "Artist was too busy tying their shoes to draw!",
      paths: [...paths],
      canvasWidth: 800,  // Store the original canvas dimensions
      canvasHeight: 600,
      isEmpty: paths.length === 0
    };
    
    // Only call onDrawingComplete if not in judge mode
    if (!isJudgeMode) {
      onDrawingComplete(drawing);
    }
  };

  return (
    <div>
      {!isJudgeMode && <h1>Drawing App</h1>}
      {!isJudgeMode && <WinnersGallery winners={winners} />}
      {!isJudgeMode && (
        <div className={`timer ${timeLeft <= 10 ? 'warning' : ''}`}>
          Time left: {timeLeft} seconds
        </div>
      )}
      {!isJudgeMode && (
        <div className="prompt-display">
          <h2>Draw this:</h2>
          <p className="prompt-text">{prompt}</p>
        </div>
      )}
      
      {/* Status Indicator */}
      <div className="drawing-status-container">
        <div className={`drawing-status ${isJudgeMode ? 'judge' : 'player'}`}>
          {isJudgeMode ? '👑 You are the Judge' : '🎨 You are a Player'}
        </div>
      </div>

      <div className="controls">
        {Object.entries(colors).map(([name, color]) => (
          <button
            key={name}
            className="color-btn"
            style={{ backgroundColor: color }}
            onClick={() => setCurrentColor(color)}
          />
        ))}
      </div>
      <div className="controls">
        {widths.map(width => (
          <button
            key={width}
            className={`width-btn ${currentWidth === width ? 'active' : ''}`}
            onClick={() => setCurrentWidth(width)}
          >
            {width}px
          </button>
        ))}
      </div>
      <div className="controls">
        <button 
          className="undo-btn"
          onClick={handleUndo}
          disabled={paths.length === 0}
        >
          Undo
        </button>
        {!isJudgeMode && (
          <button 
            className="submit-btn"
            onClick={handleSubmit}
          >
            Submit Drawing
          </button>
        )}
      </div>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="canvas-container"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  );
};

export default DrawingScreen; 