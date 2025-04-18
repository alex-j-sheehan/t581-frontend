import React, { useState, useEffect } from 'react';
import { ROUND_PROMPTS } from '../constants/prompts';

const PromptScreen = ({ onPromptComplete, usedPrompts = [], roundNumber = 1 }) => {
  const [currentPair, setCurrentPair] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [finalPrompt, setFinalPrompt] = useState('');
  const [showPrompt, setShowPrompt] = useState(false);

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

    // 50/50 chance to use user's answer or a pre-written answer
    const useUserAnswer = Math.random() < 0.5;
    let finalAnswer;

    if (useUserAnswer) {
      finalAnswer = userAnswer;
    } else {
      // Randomly select a pre-written answer
      const randomAnswerIndex = Math.floor(Math.random() * currentPair.preWrittenAnswers.length);
      finalAnswer = currentPair.preWrittenAnswers[randomAnswerIndex];
    }

    // Fill in the mad lib with the selected answer
    const filledPrompt = currentPair.madLib.replace('__', finalAnswer);
    setFinalPrompt(filledPrompt);
    setShowPrompt(true);

    // Wait a moment to show the filled prompt before advancing
    setTimeout(() => {
      onPromptComplete(filledPrompt, currentPair.question);
    }, 3000);
  };

  if (!currentPair) return null;

  return (
    <div className="prompt-screen">
      {!showPrompt ? (
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
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Type your answer here..."
              className="answer-input"
            />
            <button type="submit" className="submit-btn">
              Submit Answer
            </button>
          </form>
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
          <h2>Your Drawing Prompt:</h2>
          <p className="prompt">{finalPrompt}</p>
          <p className="loading">Preparing your canvas...</p>
        </div>
      )}
    </div>
  );
};

export default PromptScreen; 