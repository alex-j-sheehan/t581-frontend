import React, { useState, useEffect } from 'react';
import './App.css';
import DrawingScreen from './components/DrawingScreen';
import VotingScreen from './components/VotingScreen';
import PromptScreen from './components/PromptScreen';
import { getRandomDrawings } from './data/sampleDrawings';

function App() {
    // App state
    const [currentScreen, setCurrentScreen] = useState('prompt'); // Changed initial screen to 'prompt'
    const [userDrawing, setUserDrawing] = useState(null);
    const [galleryDrawings, setGalleryDrawings] = useState([]);
    const [winners, setWinners] = useState([]); // Track winning drawings
    const [currentPrompt, setCurrentPrompt] = useState('');

    // Load random drawings when voting screen is active
    useEffect(() => {
        if (currentScreen === 'voting') {
            // Get 5 random drawings from our sample data
            const randomDrawings = getRandomDrawings(5);
            setGalleryDrawings(randomDrawings);
        }
    }, [currentScreen]);

    const handlePromptComplete = (prompt) => {
        setCurrentPrompt(prompt);
        setCurrentScreen('drawing');
    };

    const handleDrawingComplete = (drawing) => {
        setUserDrawing(drawing);
        setCurrentScreen('voting');
    };

    const handleVoteComplete = (selectedDrawing) => {
        setWinners(prev => [...prev, selectedDrawing]);
        setCurrentScreen('prompt'); // Return to prompt screen for next round
    };

    return (
        <div className="App">
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
                    galleryDrawings={galleryDrawings}
                    onVoteComplete={handleVoteComplete}
                />
            )}
        </div>
    );
}

export default App; 