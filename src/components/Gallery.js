import React, { useRef, useEffect } from 'react';

const Gallery = ({ drawings, onSelectDrawing, isJudge = false }) => {
  const canvasRefs = useRef([]);

  useEffect(() => {
    // Draw all drawings on their respective canvases
    drawings.forEach((drawing, index) => {
      const canvas = canvasRefs.current[index];
      if (!canvas || !drawing) return;
      
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // If it's an empty drawing, display the message
      if (drawing.isEmpty) {
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Create gradient for colorful text
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        gradient.addColorStop(0, 'red');
        gradient.addColorStop(0.2, 'orange');
        gradient.addColorStop(0.4, 'yellow');
        gradient.addColorStop(0.6, 'green');
        gradient.addColorStop(0.8, 'blue');
        gradient.addColorStop(1, 'purple');
        
        ctx.fillStyle = gradient;
        ctx.fillText('Artist was too busy', canvas.width / 2, canvas.height / 2 - 20);
        ctx.fillText('tying their shoes', canvas.width / 2, canvas.height / 2 + 10);
        ctx.fillText('to draw!', canvas.width / 2, canvas.height / 2 + 40);
        return;
      }
      
      // Calculate scaling factors
      const originalWidth = drawing.canvasWidth || 800; // Use stored width or default
      const originalHeight = drawing.canvasHeight || 600; // Use stored height or default
      const scaleX = canvas.width / originalWidth;
      const scaleY = canvas.height / originalHeight;
      
      // Draw all paths for this drawing
      if (drawing.paths && Array.isArray(drawing.paths)) {
        drawing.paths.forEach(path => {
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
          ctx.lineWidth = path.width * Math.min(scaleX, scaleY); // Scale the line width
          ctx.stroke();
        });
      }
    });
  }, [drawings]);

  return (
    <div className="gallery-container">
      {isJudge && (
        <h2>Vote for Your Favorite Drawing</h2>
      )}
      <div className="gallery-grid">
        {drawings.map((drawing, index) => (
          <div key={drawing?.id || index} className={`gallery-item ${drawing?.isEmpty ? 'empty-drawing' : ''}`}>
            <h3>Drawing #{index + 1}</h3>
            <canvas
              ref={el => canvasRefs.current[index] = el}
              width={400}
              height={300}
              className="gallery-canvas"
              onClick={() => isJudge && drawing && !drawing.isEmpty && onSelectDrawing(drawing)}
            />
            {isJudge && (
              <button 
                className={`vote-btn ${!drawing || drawing.isEmpty ? 'disabled' : ''}`}
                onClick={() => drawing && !drawing.isEmpty && onSelectDrawing(drawing)}
                disabled={!drawing || drawing.isEmpty}
              >
                {!drawing || drawing.isEmpty ? 'No drawing to vote for' : 'Vote for this drawing'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Gallery; 