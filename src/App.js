import React, { useState, useEffect } from 'react';
import './App.css';
import DrawingScreen from './components/DrawingScreen';
import VotingScreen from './components/VotingScreen';
import PromptScreen from './components/PromptScreen';
import NamePrompt from './components/NamePrompt';
import JudgeWaitingScreen from './components/JudgeWaitingScreen';
import WaitingForJudgeScreen from './components/WaitingForJudgeScreen';
import PlayersIntroScreen from './components/PlayersIntroScreen';
import userClient from './data/UserClient';

function App() {
    // App state
    const [currentScreen, setCurrentScreen] = useState('name'); // Start with name prompt
    const [userDrawing, setUserDrawing] = useState(null);
    const [winners, setWinners] = useState([]); // Track winning drawings
    const [currentPrompt, setCurrentPrompt] = useState('');
    const [isJudge, setIsJudge] = useState(false);
    const [currentJudge, setCurrentJudge] = useState(null);
    const [isFirstRound, setIsFirstRound] = useState(true); // Track if this is the first round
    const [autoSelectedWinner, setAutoSelectedWinner] = useState(null); // Track auto-selected winner

    const handleNameSubmitted = () => {
        // After name is submitted, show the players intro screen
        setCurrentScreen('players-intro');
    };

    const handlePlayersIntroComplete = () => {
        // After players intro, go to the prompt screen
        setCurrentScreen('prompt');
    };

    const handlePromptComplete = (prompt) => {
        setCurrentPrompt(prompt);
        
        // Clear the user's drawing when starting a new round
        setUserDrawing(null);
        const currentUser = userClient.getCurrentUser();
        if (currentUser) {
            currentUser.setDrawing(null);
        }
        
        // Reset auto-selected winner
        setAutoSelectedWinner(null);
        
        // Select a random judge for this round
        const judge = userClient.selectRandomJudge();
        setCurrentJudge(judge);
        setIsJudge(judge === userClient.getCurrentUser());
        
        // Go directly to drawing screen
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
        // Only add the selected drawing to winners if the user is the judge and a drawing was selected
        if (isJudge && selectedDrawing) {
            setWinners(prev => [...prev, selectedDrawing]);
            console.log("Judge selected winner:", selectedDrawing);
        }
        
        // Clear auto-selected winner if it exists
        setAutoSelectedWinner(null);
        
        // Return to prompt screen for next round
        setCurrentScreen('prompt');
    };

    const handleJudgeComplete = (autoSelectedWinner) => {
        // If an auto-selected winner was passed, add it to the winners array
        if (autoSelectedWinner) {
            setWinners(prevWinners => [...prevWinners, autoSelectedWinner]);
            console.log("Added auto-selected winner to winners array:", autoSelectedWinner);
        }
        
        // Return to prompt screen for next round
        setCurrentScreen('prompt');
    };

    // Auto-select a winner for the fake judge
    const handleAutoSelectWinner = () => {
        const allDrawings = getAllDrawings();
        if (allDrawings.length > 0) {
            // Randomly select a drawing as the winner
            const randomIndex = Math.floor(Math.random() * allDrawings.length);
            const selectedDrawing = allDrawings[randomIndex];
            
            // Store the auto-selected winner
            setAutoSelectedWinner(selectedDrawing);
            
            // Log for debugging
            console.log("Auto-selected winner:", selectedDrawing);
        }
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

    // Debug effect to log winners array changes
    useEffect(() => {
        console.log("Winners array updated:", winners);
    }, [winners]);

    return (
        <div className="App">
            {currentScreen === 'name' && (
                <NamePrompt onNameSubmitted={handleNameSubmitted} />
            )}
            {currentScreen === 'players-intro' && (
                <PlayersIntroScreen onIntroComplete={handlePlayersIntroComplete} />
            )}
            {currentScreen === 'prompt' && (
                <PromptScreen onPromptComplete={handlePromptComplete} />
            )}
            {currentScreen === 'drawing' && (
                <>
                    {isJudge ? (
                        <JudgeWaitingScreen 
                            onJudgeReady={handleJudgeReady} 
                            winners={winners}
                        />
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
                            autoSelectedWinner={autoSelectedWinner}
                            isJudge={isJudge}
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