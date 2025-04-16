import React, { useRef, useEffect } from 'react';

const Gallery = ({ drawings, onSelectDrawing }) => {
  const canvasRefs = useRef([]);

  useEffect(() => {
    // Draw all drawings on their respective canvases
    drawings.forEach((drawing, index) => {
      const canvas = canvasRefs.current[index];
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Calculate scaling factors
      const originalWidth = drawing.canvasWidth || 800; // Use stored width or default
      const originalHeight = drawing.canvasHeight || 600; // Use stored height or default
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
        ctx.lineWidth = path.width * Math.min(scaleX, scaleY); // Scale the line width
        ctx.stroke();
      });
    });
  }, [drawings]);

  return (
    <div className="gallery-container">
      <h2>Vote for Your Favorite Drawing</h2>
      <div className="gallery-grid">
        {drawings.map((drawing, index) => (
          <div key={drawing.id} className="gallery-item">
            <h3>{drawing.title}</h3>
            <canvas
              ref={el => canvasRefs.current[index] = el}
              width={400}
              height={300}
              className="gallery-canvas"
              onClick={() => onSelectDrawing(drawing)}
            />
            <button 
              className="vote-btn"
              onClick={() => onSelectDrawing(drawing)}
            >
              Vote for this drawing
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Gallery; 