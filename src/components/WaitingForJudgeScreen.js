import React, { useEffect } from 'react';
import Gallery from './Gallery';

const WaitingForJudgeScreen = ({ drawings, judgeName, onJudgeComplete }) => {
  useEffect(() => {
    // Set a timer to automatically advance after 10 seconds
    const timer = setTimeout(() => {
      // Select a random drawing as the winner if there are drawings available
      if (drawings && drawings.length > 0) {
        const randomIndex = Math.floor(Math.random() * drawings.length);
        const randomWinner = drawings[randomIndex];
        console.log("Auto-selected winner:", randomWinner);
        // Pass the selected winner to the onJudgeComplete callback
        onJudgeComplete(randomWinner);
      } else {
        // If no drawings available, just advance without selecting a winner
        onJudgeComplete();
      }
    }, 10000);
    
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