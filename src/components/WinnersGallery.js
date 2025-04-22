import React, { useRef, useEffect } from 'react';

const WinnersGallery = ({ winners }) => {
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

  if (winners.length === 0) {
    return null;
  }

  return (
    <div className="winners-gallery">
      <h3>Winners Gallery</h3>
      <div className="winners-strip" style={{ 
        display: 'flex', 
        flexDirection: 'row', 
        overflowX: 'auto',
        gap: '15px',
        padding: '10px 5px'
      }}>
        {winners.map((drawing, index) => (
          <div key={`winner-${drawing.id}-${index}`} className="winner-item" style={{ 
            flex: '0 0 auto',
            width: '200px'
          }}>
            <div className="winner-number">Round {index + 1}</div>
            <canvas
              ref={el => canvasRefs.current[index] = el}
              width={200}
              height={150}
              className="winner-canvas"
            />
            <div className="panel-prompt" style={{
              backgroundColor: '#f8f9fa',
              padding: '5px 8px',
              borderRadius: '5px',
              margin: '5px 0',
              fontSize: '0.8rem',
              minHeight: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
              wordBreak: 'break-word'
            }}>
              {drawing.prompt || `Round ${index + 1}`}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WinnersGallery; 