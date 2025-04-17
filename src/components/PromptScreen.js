import React, { useState, useEffect } from 'react';
import { PROMPT_PAIRS } from '../constants/prompts';

const PromptScreen = ({ onPromptComplete }) => {
  const [currentPair, setCurrentPair] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [finalPrompt, setFinalPrompt] = useState('');
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Randomly select a prompt pair when component mounts
    const randomIndex = Math.floor(Math.random() * PROMPT_PAIRS.length);
    setCurrentPair(PROMPT_PAIRS[randomIndex]);
  }, []);

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
      onPromptComplete(filledPrompt);
    }, 3000);
  };

  if (!currentPair) return null;

  return (
    <div className="prompt-screen">
      {!showPrompt ? (
        <div className="question-container">
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
          <h2>Your Drawing Prompt:</h2>
          <p className="prompt">{finalPrompt}</p>
          <p className="loading">Preparing your canvas...</p>
        </div>
      )}
    </div>
  );
};

export default PromptScreen; 