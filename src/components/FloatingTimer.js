import React, { useState } from 'react';

const FloatingTimer = ({ timeLeft, position = 'top-right', totalTime = 60 }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Determine position styles based on the position prop
  const getPositionStyles = () => {
    switch (position) {
      case 'top-left':
        return { top: '15px', left: '15px' };
      case 'bottom-left':
        return { bottom: '15px', left: '15px' };
      case 'bottom-right':
        return { bottom: '15px', right: '15px' };
      case 'top-right':
      default:
        return { top: '15px', right: '15px' };
    }
  };

  const positionStyles = getPositionStyles();
  const isWarning = timeLeft <= 10;
  
  // Calculate progress percentage
  const progressPercent = (timeLeft / totalTime) * 100;
  
  // Calculate circle properties
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progressPercent / 100);

  // Define CSS for the keyframes animation
  const pulseKeyframes = isWarning ? `
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); box-shadow: 0 2px 15px rgba(255, 50, 50, 0.7); }
      100% { transform: scale(1); }
    }
  ` : '';

  return (
    <>
      {isWarning && (
        <style>{pulseKeyframes}</style>
      )}
      <div 
        className={`floating-timer ${isWarning ? 'warning' : ''}`}
        style={{
          position: 'fixed',
          zIndex: 1000,
          background: isWarning ? 'rgba(255, 50, 50, 0.9)' : 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          padding: '12px',
          borderRadius: '50%',
          boxShadow: isWarning ? '0 2px 12px rgba(255, 50, 50, 0.5)' : '0 2px 8px rgba(0, 0, 0, 0.3)',
          fontWeight: 'bold',
          fontSize: '1.2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(3px)',
          border: '2px solid',
          borderColor: isWarning ? '#ff3232' : '#444',
          transition: 'all 0.3s ease',
          animation: isWarning ? 'pulse 1s infinite' : 'none',
          width: '60px',
          height: '60px',
          cursor: 'default',
          ...positionStyles
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* SVG Circle Progress */}
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            transform: 'rotate(-90deg)',
            overflow: 'visible'
          }}
          viewBox="0 0 100 100"
        >
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            style={{
              fill: 'none',
              stroke: 'rgba(255, 255, 255, 0.2)',
              strokeWidth: 5
            }}
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            style={{
              fill: 'none',
              stroke: isWarning ? '#ff6b6b' : '#61dafb',
              strokeWidth: 5,
              strokeDasharray: circumference,
              strokeDashoffset: strokeDashoffset,
              strokeLinecap: 'round',
              transition: 'stroke-dashoffset 0.5s ease'
            }}
          />
        </svg>
        
        {/* Time display */}
        <div style={{ position: 'relative', zIndex: 1, fontSize: '1.4rem' }}>
          {timeLeft}
        </div>
        
        {/* Tooltip/label that appears on hover */}
        {isHovered && (
          <div 
            style={{
              position: 'absolute',
              right: position.includes('right') ? '70px' : 'auto',
              left: position.includes('left') ? '70px' : 'auto',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              padding: '5px 10px',
              borderRadius: '4px',
              fontSize: '0.9rem',
              whiteSpace: 'nowrap',
              pointerEvents: 'none'
            }}
          >
            Seconds remaining
          </div>
        )}
      </div>
    </>
  );
};

export default FloatingTimer; 