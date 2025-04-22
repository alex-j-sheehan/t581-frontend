import React, { useEffect, useState } from 'react';
import Gallery from './Gallery';
import userClient from '../data/UserClient';

const VotingScreen = ({ userDrawing, onVoteComplete, autoSelectedWinner, isJudge }) => {
  // Get all drawings for voting
  const getAllDrawings = () => {
    const allUsers = userClient.getAllUsers();
    const currentUser = userClient.getCurrentUser();
    
    // Filter out empty drawings and combine user's drawing with other users' drawings
    const drawings = allUsers
      .filter(user => user && user.drawing && !user.drawing.isEmpty)
      .map(user => ({
        ...user.drawing,
        userName: user.name,
        userAvatar: user.avatar
      }));
      
    // Add current user's drawing if it exists and isn't empty
    if (currentUser && currentUser.drawing && !currentUser.drawing.isEmpty) {
      drawings.unshift({
        ...currentUser.drawing,
        userName: currentUser.name,
        userAvatar: currentUser.avatar
      });
    }
    
    return drawings;
  };
  
  // If we have an auto-selected winner and user is not judge, show a message
  useEffect(() => {
    if (autoSelectedWinner && !isJudge) {
      // Auto-advance after a short delay to show the auto-selected winner
      const timer = setTimeout(() => {
        // Just advance to the next screen without passing the autoSelectedWinner
        onVoteComplete();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [autoSelectedWinner, onVoteComplete, isJudge]);
  
  // Get all drawings for the gallery
  const drawings = getAllDrawings();
  
  return (
    <div className="voting-screen">
      
      {autoSelectedWinner && !isJudge ? (
        <div className="auto-selected-winner">
          <h2>Winner Selected!</h2>
          <p>The judge has selected a winner for this round.</p>
          <div className="winner-display">
            <h3>Winning Drawing</h3>
            <canvas 
              width={400} 
              height={300} 
              className="winner-canvas"
              ref={canvas => {
                if (canvas && autoSelectedWinner) {
                  const ctx = canvas.getContext('2d');
                  ctx.clearRect(0, 0, canvas.width, canvas.height);
                  
                  // Draw the winning drawing
                  autoSelectedWinner.paths.forEach(path => {
                    ctx.beginPath();
                    ctx.moveTo(path.path[0][0], path.path[0][1]);
                    for (let i = 1; i < path.path.length; i++) {
                      ctx.lineTo(path.path[i][0], path.path[i][1]);
                    }
                    ctx.strokeStyle = path.color;
                    ctx.lineWidth = path.width;
                    ctx.stroke();
                  });
                }
              }}
            />
          </div>
        </div>
      ) : (
          <Gallery 
            drawings={drawings} 
            onSelectDrawing={onVoteComplete}
            isJudge={isJudge}
          />
      )}
    </div>
  );
};

export default VotingScreen; 