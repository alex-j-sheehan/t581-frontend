import React, { useRef, useState, useEffect } from 'react';
import WinnersGallery from './WinnersGallery';
import FloatingTimer from './FloatingTimer';
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
  
  // Total time constant
  const TOTAL_TIME = 60;

  const colors = {
    black: 'black',
    red: 'red',
    orange: '#ff5500',
    yellow: '#e6b800',
    green: '#00b300',
    blue: 'blue',
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
    <div className="drawing-screen" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%',
      padding: '20px'
    }}>
      {!isJudgeMode && <h1>Drawing App</h1>}
      {!isJudgeMode && <WinnersGallery winners={winners} />}
      {!isJudgeMode && <FloatingTimer timeLeft={timeLeft} totalTime={TOTAL_TIME} position="top-left" />}
      {!isJudgeMode && (
        <div className="prompt-display" style={{ width: '100%', maxWidth: '800px', marginBottom: '15px' }}>
          <h2>Draw this:</h2>
          <p className="prompt-text">{prompt}</p>
        </div>
      )}
      
      {/* Status Indicator */}
      <div className="drawing-status-container" style={{ width: '100%', maxWidth: '800px', textAlign: 'center', marginBottom: '15px' }}>
        <div className={`drawing-status ${isJudgeMode ? 'judge' : 'player'}`}>
          {isJudgeMode ? '👑 You are the Judge' : '🎨 You are a Player'}
        </div>
      </div>

      <div className="drawing-interface" style={{ 
        width: '100%', 
        maxWidth: '800px', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)', 
        borderRadius: '8px', 
        padding: '15px', 
        backgroundColor: 'white' 
      }}>
        <div className="controls" style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          flexWrap: 'wrap', 
          gap: '10px', 
          marginBottom: '10px', 
          width: '100%' 
        }}>
          {Object.entries(colors).map(([name, color]) => (
            <button
              key={name}
              className="color-btn"
              style={{ 
                backgroundColor: color, 
                width: '30px', 
                height: '30px', 
                borderRadius: '50%', 
                border: currentColor === color ? '3px solid #333' : '1px solid #ccc',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                transform: currentColor === color ? 'scale(1.2)' : 'scale(1)'
              }}
              onClick={() => setCurrentColor(color)}
            />
          ))}
        </div>
        <div className="controls" style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '10px', 
          marginBottom: '15px', 
          width: '100%' 
        }}>
          {widths.map(width => (
            <button
              key={width}
              className={`width-btn ${currentWidth === width ? 'active' : ''}`}
              style={{
                padding: '5px 15px',
                backgroundColor: currentWidth === width ? '#e6f7ff' : '#f0f0f0',
                border: currentWidth === width ? '2px solid #1890ff' : '1px solid #ccc',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
              onClick={() => setCurrentWidth(width)}
            >
              {width}px
            </button>
          ))}
        </div>
        <div className="controls" style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '15px', 
          marginBottom: '15px', 
          width: '100%' 
        }}>
          <button 
            className="undo-btn"
            style={{
              padding: '8px 20px',
              backgroundColor: paths.length === 0 ? '#f5f5f5' : '#ff4d4f',
              color: paths.length === 0 ? '#999' : 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: paths.length === 0 ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
            onClick={handleUndo}
            disabled={paths.length === 0}
          >
            Undo
          </button>
          {!isJudgeMode && (
            <button 
              className="submit-btn"
              style={{
                padding: '8px 20px',
                backgroundColor: '#52c41a',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
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
          style={{
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'crosshair',
            backgroundColor: 'white'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>
    </div>
  );
};

export default DrawingScreen; 