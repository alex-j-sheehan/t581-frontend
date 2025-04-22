import React, { useRef, useEffect } from 'react';

const EndGameScreen = ({ winners, onPlayAgain }) => {
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
    <div className="end-game-screen">
      <div className="comic-title-banner">
        <h1 className="game-complete-title">Game Complete!</h1>
      </div>
      
      <p className="thank-you-message">Thanks for playing!</p>
      
      <div className="all-winners-gallery">
        <div className="comic-header">
          <h2>Your Brilliant and Beautiful Comic Strip:</h2>
        </div>
        
        <div 
          className="comic-strip-container" 
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            width: '100%',
            maxWidth: '1200px',
            margin: '0 auto',
            gap: '20px',
            padding: '20px'
          }}
        >
          {winners.map((drawing, index) => (
            <div 
              key={`end-game-winner-${index}`} 
              className="comic-panel"
              style={{
                flex: '1 0 280px',
                maxWidth: '280px',
                margin: '0'
              }}
            >
              <div className="round-label">Round {index + 1}</div>
              <canvas
                ref={el => canvasRefs.current[index] = el}
                width={280}
                height={220}
                className="end-game-canvas"
              />
              <div 
                className="panel-prompt" 
                style={{
                  backgroundColor: '#f8f9fa',
                  padding: '8px 10px',
                  borderRadius: '5px',
                  margin: '8px 0',
                  fontSize: '0.9rem',
                  minHeight: '60px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  wordBreak: 'break-word'
                }}
              >
                {drawing.prompt || `Panel ${index + 1}`}
              </div>
              
              {/* Connector between panels (except for the last one) */}
              {index < winners.length - 1 && (
                <div className="panel-connector">
                  <div className="connector-dot"></div>
                  <div className="connector-dot"></div>
                  <div className="connector-dot"></div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* The End caption */}
        <div className="comic-ending">THE END</div>
      </div>
      
      <button className="play-again-btn" onClick={onPlayAgain}>
        Play Again!
      </button>
    </div>
  );
};

export default EndGameScreen; 