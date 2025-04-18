import React, { useState } from 'react';
import User from '../data/User';
import userClient from '../data/UserClient';

const NamePrompt = ({ onNameSubmitted }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    // Create current user
    const currentUser = new User(0, name.trim());
    userClient.setCurrentUser(currentUser);

    // Fetch other users
    await userClient.fetchUsers();
    
    onNameSubmitted(currentUser);
  };

  return (
    <div className="name-prompt">
      <div className="comic-title">
        LAUGH LAB GAMES
      </div>
      <h2>Welcome to the Drawing Game!</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="name-input"
          />
          {error && <p className="error">{error}</p>}
        </div>
        <button type="submit" className="submit-button">
          Start Game
        </button>
      </form>
    </div>
  );
};

export default NamePrompt; 