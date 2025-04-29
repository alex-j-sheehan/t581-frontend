import React, { useEffect } from 'react';
import Gallery from './Gallery';

const WaitingForJudgeScreen = ({ drawings, judgeName, onJudgeComplete }) => {
  useEffect(() => {
    // Set a timer to automatically advance after 5 seconds
    const timer = setTimeout(() => {
      // Find the drawing that the player added bubbles to
      if (drawings && drawings.length > 0) {
        // Look for a drawing that has bubbles property (this is the one the player added bubbles to)
        const bubbleDrawing = drawings.find(drawing => drawing.bubbles && drawing.bubbles.length > 0);
        
        if (bubbleDrawing) {
          console.log("Auto-selected the player's bubble drawing:", bubbleDrawing);
          // Always select the drawing with bubbles as the winner
          onJudgeComplete(bubbleDrawing);
        } else {
          // Fallback: select a random drawing if none have bubbles
          const randomIndex = Math.floor(Math.random() * drawings.length);
          const randomWinner = drawings[randomIndex];
          console.log("No drawing with bubbles found, selecting random winner:", randomWinner);
          onJudgeComplete(randomWinner);
        }
      } else {
        // If no drawings available, just advance without selecting a winner
        onJudgeComplete();
      }
    }, 5000); // Reduced to 5 seconds for faster testing
    
    return () => clearTimeout(timer);
  }, [drawings, onJudgeComplete]);

  return (
    <div className="waiting-for-judge-screen">
      <h1 className="waiting-message">Waiting for {judgeName} to pick a winner!</h1>
      <div className="gallery-container">
        <Gallery drawings={drawings} isJudge={false} />
      </div>
    </div>
  );
};

export default WaitingForJudgeScreen; 