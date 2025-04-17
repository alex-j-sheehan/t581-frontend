import React, { useState, useEffect } from 'react';
import './App.css';
import DrawingScreen from './components/DrawingScreen';
import VotingScreen from './components/VotingScreen';
import PromptScreen from './components/PromptScreen';
import NamePrompt from './components/NamePrompt';
import userClient from './data/UserClient';

function App() {
    // App state
    const [currentScreen, setCurrentScreen] = useState('name'); // Start with name prompt
    const [userDrawing, setUserDrawing] = useState(null);
    const [winners, setWinners] = useState([]); // Track winning drawings
    const [currentPrompt, setCurrentPrompt] = useState('');

    const handleNameSubmitted = () => {
        setCurrentScreen('prompt');
    };

    const handlePromptComplete = (prompt) => {
        setCurrentPrompt(prompt);
        setCurrentScreen('drawing');
    };

    const handleDrawingComplete = (drawing) => {
        setUserDrawing(drawing);
        // Assign the drawing to the current user
        const currentUser = userClient.getCurrentUser();
        if (currentUser) {
            currentUser.setDrawing(drawing);
        }
        setCurrentScreen('voting');
    };

    const handleVoteComplete = (selectedDrawing) => {
        setWinners(prev => [...prev, selectedDrawing]);
        setCurrentScreen('prompt'); // Return to prompt screen for next round
    };

    return (
        <div className="App">
            {currentScreen === 'name' && (
                <NamePrompt onNameSubmitted={handleNameSubmitted} />
            )}
            {currentScreen === 'prompt' && (
                <PromptScreen onPromptComplete={handlePromptComplete} />
            )}
            {currentScreen === 'drawing' && (
                <DrawingScreen 
                    onDrawingComplete={handleDrawingComplete}
                    winners={winners}
                    prompt={currentPrompt}
                />
            )}
            {currentScreen === 'voting' && (
                <VotingScreen
                    userDrawing={userDrawing}
                    onVoteComplete={handleVoteComplete}
                />
            )}
        </div>
    );
}

export default App; 