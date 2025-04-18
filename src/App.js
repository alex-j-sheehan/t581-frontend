import React, { useState, useEffect } from 'react';
import './App.css';
import DrawingScreen from './components/DrawingScreen';
import VotingScreen from './components/VotingScreen';
import PromptScreen from './components/PromptScreen';
import NamePrompt from './components/NamePrompt';
import JudgeWaitingScreen from './components/JudgeWaitingScreen';
import WaitingForJudgeScreen from './components/WaitingForJudgeScreen';
import PlayersIntroScreen from './components/PlayersIntroScreen';
import WinnerShowcaseScreen from './components/WinnerShowcaseScreen';
import userClient from './data/UserClient';

// Simple RoundCounter component to display in the corner
const RoundCounter = ({ roundNumber }) => {
    // Generate a unique color based on the round number
    const getColorFromNumber = (num) => {
        // Create a pseudo-random hue based on the number
        const hue = (num * 137.5) % 360; // Golden ratio * 100, modulo 360 degrees
        return `hsl(${hue}, 70%, 45%)`;
    };
    
    const backgroundColor = getColorFromNumber(roundNumber);
    
    return (
        <div 
            className="round-counter" 
            key={roundNumber}
            style={{ 
                backgroundColor: backgroundColor,
                borderColor: `hsl(${(roundNumber * 137.5) % 360}, 70%, 35%)`
            }}
        >
            Round #{roundNumber}
        </div>
    );
};

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
    const [usedPrompts, setUsedPrompts] = useState([]); // Track which prompts have been used
    const [currentWinner, setCurrentWinner] = useState(null); // Track the current round's winner
    
    // Initialize with round number 1
    const [roundNumber, setRoundNumber] = useState(1);

    const handleNameSubmitted = () => {
        // After name is submitted, show the players intro screen
        setCurrentScreen('players-intro');
    };

    const handlePlayersIntroComplete = () => {
        // After players intro, go to the prompt screen
        setCurrentScreen('prompt');
    };

    const handlePromptComplete = (prompt, question) => {
        setCurrentPrompt(prompt);
        
        // Add the question to used prompts
        if (question) {
            setUsedPrompts(prev => [...prev, question]);
        }
        
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
            setCurrentWinner(selectedDrawing);
        }
        
        // Clear auto-selected winner if it exists
        setAutoSelectedWinner(null);
        
        // Show the winner showcase screen before moving to the next round
        setCurrentScreen('winner-showcase');
    };

    const handleJudgeComplete = (autoSelectedWinner) => {
        // If an auto-selected winner was passed, add it to the winners array
        if (autoSelectedWinner) {
            setWinners(prevWinners => [...prevWinners, autoSelectedWinner]);
            console.log("Added auto-selected winner to winners array:", autoSelectedWinner);
            setCurrentWinner(autoSelectedWinner);
        }
        
        // Show the winner showcase screen before moving to the next round
        setCurrentScreen('winner-showcase');
    };

    const handleWinnerShowcaseComplete = () => {
        // Increment the round number
        setRoundNumber(prevRound => prevRound + 1);
        
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
    
    // Debug effect to log round number changes
    useEffect(() => {
        console.log("Round number changed to:", roundNumber);
    }, [roundNumber]);

    return (
        <div className="App">
            {/* Show round counter on all screens except the initial name prompt and players intro */}
            {currentScreen !== 'name' && currentScreen !== 'players-intro' && (
                <RoundCounter roundNumber={roundNumber} />
            )}
            
            {currentScreen === 'name' && (
                <NamePrompt onNameSubmitted={handleNameSubmitted} />
            )}
            {currentScreen === 'players-intro' && (
                <PlayersIntroScreen onIntroComplete={handlePlayersIntroComplete} />
            )}
            {currentScreen === 'prompt' && (
                <PromptScreen 
                    onPromptComplete={handlePromptComplete} 
                    usedPrompts={usedPrompts}
                />
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
            {currentScreen === 'winner-showcase' && (
                <WinnerShowcaseScreen
                    winner={currentWinner}
                    onComplete={handleWinnerShowcaseComplete}
                />
            )}
        </div>
    );
}

export default App; 