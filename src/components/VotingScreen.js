import React from 'react';
import Gallery from './Gallery';

const VotingScreen = ({ userDrawing, galleryDrawings, onVoteComplete }) => {
  // Combine user's drawing with random drawings
  const allDrawings = userDrawing 
    ? [userDrawing, ...galleryDrawings] 
    : galleryDrawings;
    
  return (
    <Gallery 
      drawings={allDrawings} 
      onSelectDrawing={onVoteComplete} 
    />
  );
};

export default VotingScreen; 