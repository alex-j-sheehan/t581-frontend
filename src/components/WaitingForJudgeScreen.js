import React, { useEffect } from 'react';
import Gallery from './Gallery';

const WaitingForJudgeScreen = ({ drawings, judgeName, onJudgeComplete }) => {
  useEffect(() => {
    // Set a timer to automatically advance after 10 seconds
    const timer = setTimeout(() => {
      onJudgeComplete();
    }, 10000);
    
    return () => clearTimeout(timer);
  }, [onJudgeComplete]);

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