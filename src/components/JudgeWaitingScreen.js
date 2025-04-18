import React, { useState, useEffect } from 'react';
import DrawingScreen from './DrawingScreen';

const JudgeWaitingScreen = ({ onJudgeReady }) => {
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds timer for display
  const [timerActive, setTimerActive] = useState(true);
  
  // Generate a random wait time between 15-20 seconds
  const randomWaitTime = Math.floor(Math.random() * 6) + 15; // 15-20 seconds
  const [waitTime, setWaitTime] = useState(randomWaitTime);

  // Timer effect for display
  useEffect(() => {
    let interval;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  // Auto-advance effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setTimerActive(false);
      // Advance to voting screen when timer runs out
      onJudgeReady();
    }, waitTime * 1000);
    
    return () => clearTimeout(timer);
  }, [waitTime, onJudgeReady]);

  return (
    <div className="judge-waiting-screen">
      <h1 className="waiting-message">Hang tight while we wait for your friends to draw their masterpieces</h1>
      <p className="sub-message">You can still draw if you want, but your drawing won't be included in this round.</p>
      
      <div className="timer-container">
        <div className={`timer ${timeLeft <= 10 ? 'warning' : ''}`}>
          Time left: {timeLeft} seconds
        </div>
        <div className="auto-advance-message">
          Auto-advancing in {waitTime} seconds...
        </div>
      </div>
      
      <div className="judge-drawing-area">
        <DrawingScreen 
          onDrawingComplete={() => {}} // Empty function since we don't want to submit
          winners={[]}
          prompt="Draw whatever you want!"
          isJudgeMode={true}
        />
      </div>
    </div>
  );
};

export default JudgeWaitingScreen; 