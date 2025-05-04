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
        Madly Illustrated
      </div>
      <div className="presented-by">
        ✨ presented by laugh lab games ✨
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        <h2>Welcome to the Drawing Game!</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '300px' }}>
          <div className="input-group" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="name-input"
              style={{ width: '100%' }}
            />
            {error && <p className="error">{error}</p>}
          </div>
          <button type="submit" className="submit-button">
            Start Game
          </button>
        </form>
      </div>
    </div>
  );
};

export default NamePrompt; 