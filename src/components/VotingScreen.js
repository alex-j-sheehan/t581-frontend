import React from 'react';
import Gallery from './Gallery';
import userClient from '../data/UserClient';

const VotingScreen = ({ userDrawing, onVoteComplete }) => {
  const currentUser = userClient.getCurrentUser();
  const allUsers = userClient.getAllUsers();
  
  // Assign drawings to users and ensure we have valid data
  const drawingsWithUsers = allUsers
    .filter(user => user && user.drawing) // Only include users with valid drawings
    .map(user => ({
      ...user.drawing,
      userName: user.name
    }));

  // Combine user's drawing with other users' drawings
  const allDrawings = userDrawing && currentUser
    ? [{ ...userDrawing, userName: currentUser.name }, ...drawingsWithUsers] 
    : drawingsWithUsers;
    
  return (
    <div className="voting-screen">
      <h2>Vote for the Best Drawing</h2>
      <Gallery 
        drawings={allDrawings} 
        onSelectDrawing={onVoteComplete}
        showUserNames={true}
      />
    </div>
  );
};

export default VotingScreen; 