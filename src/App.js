import React, { useState, useEffect } from 'react';
import './App.css';
import DrawingScreen from './components/DrawingScreen';
import VotingScreen from './components/VotingScreen';
import PromptScreen from './components/PromptScreen';
import NamePrompt from './components/NamePrompt';
import JudgeWaitingScreen from './components/JudgeWaitingScreen';
import WaitingForJudgeScreen from './components/WaitingForJudgeScreen';
import userClient from './data/UserClient';

function App() {
    // App state
    const [currentScreen, setCurrentScreen] = useState('name'); // Start with name prompt
    const [userDrawing, setUserDrawing] = useState(null);
    const [winners, setWinners] = useState([]); // Track winning drawings
    const [currentPrompt, setCurrentPrompt] = useState('');
    const [isJudge, setIsJudge] = useState(false);
    const [currentJudge, setCurrentJudge] = useState(null);

    const handleNameSubmitted = () => {
        setCurrentScreen('prompt');
    };

    const handlePromptComplete = (prompt) => {
        setCurrentPrompt(prompt);
        
        // Select a random judge for this round
        const judge = userClient.selectRandomJudge();
        setCurrentJudge(judge);
        setIsJudge(judge === userClient.getCurrentUser());
        
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

    const handleJudgeReady = () => {
        // When judge is ready, advance to voting screen
        setCurrentScreen('voting');
    };

    const handleVoteComplete = (selectedDrawing) => {
        setWinners(prev => [...prev, selectedDrawing]);
        setCurrentScreen('prompt'); // Return to prompt screen for next round
    };

    const handleJudgeComplete = () => {
        setCurrentScreen('prompt'); // Return to prompt screen for next round
    };

    // Get all drawings for the gallery
    const getAllDrawings = () => {
        const allUsers = userClient.getAllUsers();
        const currentUser = userClient.getCurrentUser();
        
        // Filter out empty drawings and combine user's drawing with other users' drawings
        const drawings = allUsers
            .filter(user => user && user.drawing && !user.drawing.isEmpty)
            .map(user => ({
                ...user.drawing,
                userName: user.name
            }));
            
        // Add current user's drawing if it exists and isn't empty
        if (currentUser && currentUser.drawing && !currentUser.drawing.isEmpty) {
            drawings.unshift({
                ...currentUser.drawing,
                userName: currentUser.name
            });
        }
        
        return drawings;
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
                <>
                    {isJudge ? (
                        <JudgeWaitingScreen onJudgeReady={handleJudgeReady} />
                    ) : (
                        <DrawingScreen 
                            onDrawingComplete={handleDrawingComplete}
                            winners={winners}
                            prompt={currentPrompt}
                        />
                    )}
                </>
            )}
            {currentScreen === 'voting' && (
                <>
                    {isJudge ? (
                        <VotingScreen
                            userDrawing={userDrawing}
                            onVoteComplete={handleVoteComplete}
                        />
                    ) : (
                        <WaitingForJudgeScreen
                            drawings={getAllDrawings()}
                            judgeName={currentJudge ? currentJudge.name : 'the judge'}
                            onJudgeComplete={handleJudgeComplete}
                        />
                    )}
                </>
            )}
        </div>
    );
}

export default App; 