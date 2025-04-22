import React, { useState, useEffect } from 'react';
import { ROUND_PROMPTS } from '../constants/prompts';
import PromptRoulette from './PromptRoulette';

const PromptScreen = ({ onPromptComplete, usedPrompts = [], roundNumber = 1, isJudge = false }) => {
  const [currentPair, setCurrentPair] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [finalPrompt, setFinalPrompt] = useState('');
  const [finalAnswer, setFinalAnswer] = useState('');
  const [showPrompt, setShowPrompt] = useState(false);
  const [showRoulette, setShowRoulette] = useState(false);
  const [rouletteOptions, setRouletteOptions] = useState([]);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);

  useEffect(() => {
    // Get round-specific prompts
    const roundPrompts = ROUND_PROMPTS[roundNumber] || ROUND_PROMPTS[1];
    
    // Filter out prompts that have already been used
    const availablePrompts = roundPrompts.filter(pair => !usedPrompts.includes(pair.question));
    
    if (availablePrompts.length === 0) {
      // If all prompts for this round have been used, just pick a random one
      const randomIndex = Math.floor(Math.random() * roundPrompts.length);
      setCurrentPair(roundPrompts[randomIndex]);
    } else {
      // Select a random prompt from available prompts for this round
      const randomIndex = Math.floor(Math.random() * availablePrompts.length);
      setCurrentPair(availablePrompts[randomIndex]);
    }
  }, [usedPrompts, roundNumber, onPromptComplete]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userAnswer.trim()) return;

    try {
      // Ensure our options array is properly formatted for the wheel component
      const optionsFormatted = [];
      
      // Add user's answer first to make sure it's included
      optionsFormatted.push({ option: userAnswer });
      
      // Add some pre-written answers if available
      if (currentPair && currentPair.preWrittenAnswers && Array.isArray(currentPair.preWrittenAnswers)) {
        currentPair.preWrittenAnswers.slice(0, 5).forEach(answer => {
          optionsFormatted.push({ option: answer });
        });
      } else {
        // Fallback options if pre-written answers are not available
        optionsFormatted.push({ option: 'A unicorn' });
        optionsFormatted.push({ option: 'A giant robot' });
        optionsFormatted.push({ option: 'A talking banana' });
      }
      
      // Make sure we have at least 3 options for the wheel
      while (optionsFormatted.length < 3) {
        optionsFormatted.push({ option: `Option ${optionsFormatted.length + 1}` });
      }
      
      // 50/50 chance to use user's answer or a pre-written answer
      const useUserAnswer = Math.random() < 0.5;
      let selectedIndex;
      let selectedAnswer;

      if (useUserAnswer) {
        selectedAnswer = userAnswer;
        selectedIndex = 0; // User answer is always the first option
      } else if (currentPair && currentPair.preWrittenAnswers && currentPair.preWrittenAnswers.length > 0) {
        // Randomly select a pre-written answer
        const randomAnswerIndex = Math.floor(Math.random() * currentPair.preWrittenAnswers.length);
        selectedAnswer = currentPair.preWrittenAnswers[randomAnswerIndex];
        
        // Find the index in the formatted options
        selectedIndex = optionsFormatted.findIndex(opt => opt.option === selectedAnswer);
        if (selectedIndex === -1) selectedIndex = 1; // Fallback to first pre-written answer
      } else {
        // Fallback if no pre-written answers
        selectedAnswer = userAnswer;
        selectedIndex = 0;
      }

      // Store the selected answer and its index for the roulette
      setFinalAnswer(selectedAnswer);
      setSelectedOptionIndex(selectedIndex);
      
      // Shuffle the options except the selected one
      // Move selected answer to a fixed position that we'll choose in the wheel
      const selectedOption = optionsFormatted[selectedIndex];
      const otherOptions = optionsFormatted.filter((_, i) => i !== selectedIndex);
      const shuffledOthers = [...otherOptions].sort(() => Math.random() - 0.5);
      
      // Put selected option first and others after
      const finalOptions = [selectedOption, ...shuffledOthers];
      setRouletteOptions(finalOptions);
      setSelectedOptionIndex(0); // Now it's always first
      
      // Fill in the mad lib with the selected answer
      if (currentPair && currentPair.madLib) {
        const filledPrompt = currentPair.madLib.replace('__', selectedAnswer);
        setFinalPrompt(filledPrompt);
      } else {
        // Fallback if madLib is missing
        setFinalPrompt(`Draw a scene involving: ${selectedAnswer}`);
      }
      
      // Show roulette instead of directly showing the prompt
      setShowRoulette(true);
    } catch (error) {
      console.error('Error preparing roulette:', error);
      // Fallback in case of error - skip roulette and go straight to prompt
      if (currentPair && currentPair.madLib) {
        const filledPrompt = currentPair.madLib.replace('__', userAnswer);
        setFinalPrompt(filledPrompt);
      } else {
        setFinalPrompt(`Draw a scene involving: ${userAnswer}`);
      }
      setShowPrompt(true);
    }
  };

  const handleRouletteComplete = () => {
    setShowRoulette(false);
    setShowPrompt(true);
    
    // Wait a moment to show the filled prompt before advancing
    // Increased from 3000ms to 6000ms to give more time to read
    setTimeout(() => {
      onPromptComplete(finalPrompt, currentPair ? currentPair.question : '');
    }, 6000);
  };

  if (!currentPair) return null;

  return (
    <div className="prompt-screen">
      {!showRoulette && !showPrompt ? (
        <div className="question-container">
          <div 
            className="round-indicator"
            style={{
              backgroundColor: `hsl(${(roundNumber * 137.5) % 360}, 70%, 45%)`,
              color: 'white',
              padding: '5px 15px',
              borderRadius: '20px',
              fontWeight: 'bold',
              display: 'inline-block',
              marginBottom: '15px',
              fontSize: '1rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
          >
            Round {roundNumber}
          </div>
          <h2>Answer this question:</h2>
          <p className="question">{currentPair.question}</p>
          <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '100%', paddingLeft: '30px', boxSizing: 'border-box' }}>
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type your answer here..."
                className="answer-input"
                style={{
                  width: '85%',
                  padding: '12px',
                  fontSize: '16px',
                  border: '1px solid #e66',
                  borderRadius: '8px',
                  marginBottom: '15px'
                }}
              />
            </div>
            <button type="submit" className="submit-btn">
              Submit Answer
            </button>
          </form>
        </div>
      ) : showRoulette ? (
        <div className="prompt-screen-roulette-container">
          <div 
            className="round-indicator"
            style={{
              backgroundColor: `hsl(${(roundNumber * 137.5) % 360}, 70%, 45%)`,
              color: 'white',
              padding: '5px 15px',
              borderRadius: '20px',
              fontWeight: 'bold',
              display: 'inline-block',
              marginBottom: '15px',
              fontSize: '1rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              position: 'absolute',
              top: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 10
            }}
          >
            Round {roundNumber}
          </div>
          <PromptRoulette 
            options={rouletteOptions}
            finalAnswer={finalAnswer}
            selectedIndex={selectedOptionIndex}
            onRouletteComplete={handleRouletteComplete}
          />
        </div>
      ) : (
        <div className="prompt-container">
          <div 
            className="round-indicator"
            style={{
              backgroundColor: `hsl(${(roundNumber * 137.5) % 360}, 70%, 45%)`,
              color: 'white',
              padding: '5px 15px',
              borderRadius: '20px',
              fontWeight: 'bold',
              display: 'inline-block',
              marginBottom: '15px',
              fontSize: '1rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
          >
            Round {roundNumber}
          </div>
          
          {isJudge ? (
            <>
              <div 
                className="judge-role-container"
                style={{
                  backgroundColor: '#FFD700',
                  borderRadius: '15px',
                  padding: '20px',
                  margin: '20px auto',
                  maxWidth: '800px',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                  border: '2px solid #B8860B'
                }}
              >
                <h2 style={{ fontSize: '28px', marginBottom: '15px', color: '#8B4513' }}>
                  👑 You are the JUDGE for this round! 👑
                </h2>
                <p style={{ fontSize: '18px', lineHeight: '1.5', marginBottom: '10px' }}>
                  Hang tight while we wait for your friends to draw their masterpieces.
                </p>
                <p style={{ fontSize: '18px', lineHeight: '1.5' }}>
                  You'll get to vote on the best drawing when all players are finished.
                </p>
              </div>
              
              <div style={{ marginTop: '20px', backgroundColor: 'white', padding: '15px', borderRadius: '10px' }}>
                <h3>The prompt for this round is:</h3>
                <p className="prompt" style={{ fontSize: '20px', fontWeight: 'bold' }}>{finalPrompt}</p>
              </div>
            </>
          ) : (
            <>
              <div 
                className="player-role-container"
                style={{
                  backgroundColor: '#E6F7FF',
                  borderRadius: '15px',
                  padding: '20px',
                  margin: '20px auto',
                  maxWidth: '800px',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                  border: '2px solid #1890FF'
                }}
              >
                <h2 style={{ fontSize: '28px', marginBottom: '15px', color: '#0050B3' }}>
                  🎨 You are a PAINTER for this round! 🎨
                </h2>
                <p style={{ fontSize: '18px', lineHeight: '1.5' }}>
                  You will have 60 seconds to paint the {roundNumber === 1 ? 'first' : 'next'} scene in the comic strip.
                </p>
              </div>
              
              <h2>Your Drawing Prompt:</h2>
              <p className="prompt" style={{ fontSize: '22px', fontWeight: 'bold' }}>{finalPrompt}</p>
              <p className="loading">Preparing your canvas...</p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PromptScreen; 