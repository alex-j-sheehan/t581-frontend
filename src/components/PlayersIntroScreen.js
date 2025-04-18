import React, { useEffect, useState } from 'react';
import userClient from '../data/UserClient';

const PlayersIntroScreen = ({ onIntroComplete }) => {
  const [timeLeft, setTimeLeft] = useState(10); // 10 seconds timer
  const [players, setPlayers] = useState([]);
  
  useEffect(() => {
    // Get all players including current user
    const currentUser = userClient.getCurrentUser();
    const allUsers = userClient.getAllUsers();
    
    // Combine current user with other users
    const allPlayers = currentUser 
      ? [currentUser, ...allUsers.filter(user => user.id !== currentUser.id)]
      : allUsers;
    
    setPlayers(allPlayers);
    
    // Timer effect
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          onIntroComplete();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [onIntroComplete]);
  
  // Generate a random color for each player
  const getRandomColor = () => {
    const colors = ['#FF5733', '#33FF57', '#3357FF', '#F033FF', '#FF3333', '#33FFF3', '#F3FF33'];
    return colors[Math.floor(Math.random() * colors.length)];
  };
  
  return (
    <div className="players-intro-screen">
      <h1>Meet Your Fellow Artists!</h1>
      <div className="timer-container">
        <div className="timer">
          Starting in: {timeLeft} seconds
        </div>
      </div>
      
      <div className="players-grid">
        {players.map((player, index) => (
          <div key={player.id || index} className="player-card">
            <div 
              className="player-avatar" 
              style={{ backgroundColor: getRandomColor() }}
            >
              {player.name.charAt(0).toUpperCase()}
            </div>
            <div className="player-name">{player.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayersIntroScreen; 