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
import EndGameScreen from './components/EndGameScreen';
import PromptRoulette from './components/PromptRoulette';
import userClient from './data/UserClient';

// Constants
const MAX_ROUNDS = 4;

// Simple RoundCounter component to display in the corner
const RoundCounter = ({ roundNumber, maxRounds }) => {
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
                borderColor: `hsl(${(roundNumber * 137.5) % 360}, 70%, 35%)`,
                boxShadow: `0 4px 8px rgba(0, 0, 0, 0.3)`,
                padding: '10px 15px',
                borderRadius: '12px',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}
        >
            <span style={{ fontSize: '0.8rem', marginBottom: '2px', opacity: 0.8 }}>Current Round</span>
            <span style={{ fontSize: '1.3rem' }}>{roundNumber} of {maxRounds}</span>
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
        
        // Go directly to drawing screen
        setCurrentScreen('drawing');
    };

    // Start a new round - sets the judge for the current round
    const startNewRound = () => {
        // Select a random judge for this round
        const judge = userClient.selectRandomJudge();
        console.log("Selected judge:", judge ? judge.name : "none");
        console.log("Current user:", userClient.getCurrentUser() ? userClient.getCurrentUser().name : "none");
        console.log("Are they the same?", judge === userClient.getCurrentUser());
        
        setCurrentJudge(judge);
        setIsJudge(judge === userClient.getCurrentUser());
        console.log("Setting isJudge to:", judge === userClient.getCurrentUser());
        
        // Set prompt screen
        setCurrentScreen('prompt');
    }

    const handleNameSubmitted = () => {
        // After name is submitted, show the players intro screen
        setCurrentScreen('players-intro');
    };

    const handlePlayersIntroComplete = () => {
        // After players intro, start the first round
        startNewRound();
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
            // Add the current prompt to the selected drawing
            const drawingWithPrompt = {
                ...selectedDrawing,
                prompt: currentPrompt
            };
            setWinners(prev => [...prev, drawingWithPrompt]);
            console.log("Judge selected winner:", drawingWithPrompt);
            setCurrentWinner(drawingWithPrompt);
        }
        
        // Clear auto-selected winner if it exists
        setAutoSelectedWinner(null);
        
        // Show the winner showcase screen before moving to the next round
        setCurrentScreen('winner-showcase');
    };

    const handleJudgeComplete = (autoSelectedWinner) => {
        // If an auto-selected winner was passed, add it to the winners array
        if (autoSelectedWinner) {
            // Add the current prompt to the auto-selected winner
            const winnerWithPrompt = {
                ...autoSelectedWinner,
                prompt: currentPrompt
            };
            setWinners(prevWinners => [...prevWinners, winnerWithPrompt]);
            console.log("Added auto-selected winner to winners array:", winnerWithPrompt);
            setCurrentWinner(winnerWithPrompt);
        }
        
        // Show the winner showcase screen before moving to the next round
        setCurrentScreen('winner-showcase');
    };

    const handleWinnerShowcaseComplete = () => {
        // Check if we've reached the maximum number of rounds
        if (roundNumber >= MAX_ROUNDS) {
            // If yes, show the end game screen
            setCurrentScreen('end-game');
        } else {
            // If not, increment the round number and continue
            setRoundNumber(prevRound => prevRound + 1);
            // Start a new round
            startNewRound();
        }
    };

    // Handle playing a new game
    const handlePlayAgain = () => {
        // Reset all game state
        setWinners([]);
        setCurrentPrompt('');
        setIsJudge(false);
        setCurrentJudge(null);
        setIsFirstRound(true);
        setAutoSelectedWinner(null);
        setUsedPrompts([]);
        setCurrentWinner(null);
        setRoundNumber(1);
        
        // Reset user client state
        userClient.resetAllUsers();
        
        // Go back to the name prompt to start fresh
        setCurrentScreen('name');
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
                userName: user.name,
                userAvatar: user.avatar
            }));
            
        // Add current user's drawing if it exists and isn't empty
        if (currentUser && currentUser.drawing && !currentUser.drawing.isEmpty) {
            drawings.unshift({
                ...currentUser.drawing,
                userName: currentUser.name,
                userAvatar: currentUser.avatar
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
            {/* Show round counter on all screens except the initial name prompt, players intro, and end game */}
            {currentScreen !== 'name' && currentScreen !== 'players-intro' && currentScreen !== 'end-game' && (
                <RoundCounter roundNumber={roundNumber} maxRounds={MAX_ROUNDS} />
            )}
            
            {currentScreen === 'name' && (
                <NamePrompt onNameSubmitted={handleNameSubmitted} />
            )}
            {currentScreen === 'players-intro' && (
                <PlayersIntroScreen onIntroComplete={handlePlayersIntroComplete} />
            )}
            {currentScreen === 'prompt' && (
                <>
                    {console.log("About to render PromptScreen with isJudge =", isJudge)}
                    <PromptScreen 
                        onPromptComplete={handlePromptComplete} 
                        usedPrompts={usedPrompts}
                        roundNumber={roundNumber}
                        isJudge={isJudge}
                    />
                </>
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
                    prompt={currentPrompt}
                />
            )}
            {currentScreen === 'end-game' && (
                <EndGameScreen
                    winners={winners}
                    onPlayAgain={handlePlayAgain}
                />
            )}
        </div>
    );
}

export default App; 