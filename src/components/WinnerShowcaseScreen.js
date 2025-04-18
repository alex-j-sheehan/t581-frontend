import React, { useEffect, useRef } from 'react';

const WinnerShowcaseScreen = ({ winner, onComplete }) => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    // Draw the winning drawing on the canvas
    const canvas = canvasRef.current;
    if (!canvas || !winner) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Calculate scaling factors
    const originalWidth = winner.canvasWidth || 800;
    const originalHeight = winner.canvasHeight || 600;
    const scaleX = canvas.width / originalWidth;
    const scaleY = canvas.height / originalHeight;
    
    // Draw all paths for this drawing
    if (winner.paths && Array.isArray(winner.paths)) {
      winner.paths.forEach(path => {
        if (!path || !path.path) return;
        
        ctx.beginPath();
        
        // Scale the coordinates
        const scaledPath = path.path.map(point => [
          point[0] * scaleX,
          point[1] * scaleY
        ]);
        
        ctx.moveTo(scaledPath[0][0], scaledPath[0][1]);
        for (let i = 1; i < scaledPath.length; i++) {
          ctx.lineTo(scaledPath[i][0], scaledPath[i][1]);
        }
        
        ctx.strokeStyle = path.color;
        ctx.lineWidth = path.width * Math.min(scaleX, scaleY);
        ctx.stroke();
      });
    }
    
    // Set a timer to automatically advance after 5 seconds
    const timer = setTimeout(() => {
      onComplete();
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [winner, onComplete]);

  return (
    <div className="winner-showcase-screen">
      <h1 className="winner-title">Winner!</h1>
      <div className="winner-container">
        <h2>{winner?.userName || 'Anonymous'}'s Drawing</h2>
        <canvas
          ref={canvasRef}
          width={600}
          height={450}
          className="winner-showcase-canvas"
        />
      </div>
      <p className="next-round-message">Next round starting soon...</p>
    </div>
  );
};

export default WinnerShowcaseScreen; 