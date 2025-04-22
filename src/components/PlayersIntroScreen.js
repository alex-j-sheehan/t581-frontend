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
            <div className="player-avatar-container">
              {player.avatar ? (
                <img 
                  src={player.avatar} 
                  alt={`${player.name}'s avatar`} 
                  className="player-avatar-image"
                  style={{ width: '60px', height: '60px' }}
                />
              ) : (
                <div 
                  className="player-avatar-fallback"
                  style={{ 
                    backgroundColor: '#3357FF',
                    width: '60px', 
                    height: '60px', 
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '24px',
                    fontWeight: 'bold'
                  }}
                >
                  {player.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="player-name">{player.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayersIntroScreen; 