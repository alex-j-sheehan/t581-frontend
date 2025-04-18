import React, { useRef, useEffect } from 'react';

const EndPage = ({ winners }) => {
  const canvasRefs = useRef([]);

  useEffect(() => {
    // Draw all winning drawings on their respective canvases
    winners.forEach((drawing, index) => {
      const canvas = canvasRefs.current[index];
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Calculate scaling factors
      const originalWidth = drawing.canvasWidth || 800;
      const originalHeight = drawing.canvasHeight || 600;
      const scaleX = canvas.width / originalWidth;
      const scaleY = canvas.height / originalHeight;
      
      // Draw all paths for this drawing
      drawing.paths.forEach(path => {
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
    });
  }, [winners]);

  return (
    <div className="end-page">
      <h1>Your Story is Complete!</h1>
      <div className="comic-strip">
        {winners.map((drawing, index) => (
          <div key={`panel-${drawing.id}-${index}`} className="comic-panel">
            <div className="panel-title">{drawing.title}</div>
            <canvas
              ref={el => canvasRefs.current[index] = el}
              width={200}
              height={150}
              className="panel-canvas"
            />
          </div>
        ))}
      </div>
      <div className="end-message">
        <p>Congratulations! You've created a unique story with 6 amazing panels.</p>
        <button className="restart-btn" onClick={() => window.location.reload()}>
          Start a New Story
        </button>
      </div>
    </div>
  );
};

export default EndPage; 