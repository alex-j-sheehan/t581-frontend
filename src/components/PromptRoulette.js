import React, { useState, useEffect, useRef } from 'react';
import { Wheel } from 'react-custom-roulette';
// Import the sound file directly, which will be handled by file-loader
import spinSound from '../../public/sounds/roulette-spin.mp3';

const PromptRoulette = ({ options, finalAnswer, selectedIndex = 0, onRouletteComplete }) => {
  // State for wheel
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [wheelData, setWheelData] = useState([{ option: 'Loading...' }]);
  const [result, setResult] = useState(null);
  const [showWheel, setShowWheel] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  
  // Audio reference
  const audioRef = useRef(null);
  
  // Process options on component mount
  useEffect(() => {
    // Ensure each option has the correct format
    const processedOptions = options.map(opt => {
      if (typeof opt === 'object' && opt !== null && opt.option) {
        return { option: String(opt.option).substring(0, 20) };
      } else if (typeof opt === 'string') {
        return { option: opt.substring(0, 20) };
      } else {
        return { option: 'Option' };
      }
    });
    
    setWheelData(processedOptions);
    console.log('Processed options:', processedOptions);
    
    // Start spinning after a short delay
    setTimeout(() => {
      setIsLoading(false);
      startSpin();
    }, 1000);
  }, [options, finalAnswer, selectedIndex]);
  
  // Start the spin after options are processed
  const startSpin = () => {
    try {
      // Use the provided selectedIndex
      const safeIndex = Math.min(
        Math.max(0, selectedIndex), 
        wheelData.length - 1
      );
      
      console.log('Using prize index:', safeIndex);
      setPrizeNumber(safeIndex);
      
      // Force a short delay before spinning
      setTimeout(() => {
        // Start spinning first
        setMustSpin(true);
        
        // Delay audio start to better sync with visual acceleration
        setTimeout(() => {
          // Play sound if audio element is available
          if (audioRef.current) {
            audioRef.current.volume = 0.5;
            audioRef.current.play().catch(err => {
              console.log('Audio play error:', err);
            });
          }
        }, 700); // Add 700ms delay for the audio to start after the spin begins
      }, 100);
    } catch (error) {
      console.error('Error starting spin:', error);
      setPrizeNumber(0);
      setMustSpin(true);
    }
  };

  const handleStopSpinning = () => {
    setMustSpin(false);
    
    // Stop sound
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    // Safely get the result text
    if (wheelData.length > 0 && prizeNumber < wheelData.length) {
      const selectedOption = wheelData[prizeNumber].option;
      setResult(selectedOption);
      console.log('Wheel stopped on:', selectedOption);
    } else {
      setResult(finalAnswer || 'Selected option');
    }
    
    // Advance after a short delay
    setTimeout(() => {
      setShowWheel(false);
      onRouletteComplete();
    }, 5000);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="prompt-roulette">
        <div className="roulette-container">
          <h2>
            Preparing options 
            <span className="loading-dots">
              <span className="dot">.</span>
              <span className="dot">.</span>
              <span className="dot">.</span>
            </span>
          </h2>
          <div className="loading-animation">
            <div className="spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="prompt-roulette" style={{ 
      minHeight: '100vh',
      padding: '2rem',
      backgroundColor: '#B2D8D8'
    }}>
      {/* Hidden audio element - use imported sound file */}
      <audio 
        ref={audioRef}
        src={spinSound} 
        loop 
        preload="auto"
        style={{ display: 'none' }}
      />
      
      {/* Container with header and wheel, separated vertically */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '30px',
      }}>
        {/* Header in its own white box */}
        <div style={{ 
          backgroundColor: 'white',
          borderRadius: '15px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          padding: '1.5rem 2rem',
          width: '100%',
          maxWidth: '600px',
          textAlign: 'center'
        }}>
          {result ? (
            <h2 className="result-text" style={{ margin: '0' }}>Selected: "{result}"</h2>
          ) : (
            <h2 style={{ margin: '0' }}>Spinning for your prompt...</h2>
          )}
        </div>
        
        {/* Wheel in its own container */}
        {showWheel && (
          <div style={{ 
            backgroundColor: 'white',
            borderRadius: '15px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            padding: '3rem 3rem 3rem 3rem', // Equal padding on all sides
            width: '100%',
            maxWidth: '800px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <div className="wheel-container" style={{ 
              transform: 'scale(1.3)',
              transformOrigin: 'center center',
              height: '500px',
              width: '100%',
              maxWidth: '600px',
              paddingTop: '30px' // Added top padding to lower the wheel
            }}>
              <Wheel
                mustStartSpinning={mustSpin}
                prizeNumber={prizeNumber}
                data={wheelData}
                onStopSpinning={handleStopSpinning}
                backgroundColors={['#ff8f43', '#70bbe0', '#3498db', '#f9dd50']}
                textColors={['#ffffff']}
                fontSize={15}
                outerBorderColor={'#eeeeee'}
                outerBorderWidth={5}
                innerRadius={15}
                innerBorderColor={'#eeeeee'}
                innerBorderWidth={5}
                radiusLineColor={'#eeeeee'}
                radiusLineWidth={3}
                spinDuration={0.35}
                prizeWidth={25}
                textDistance={70}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromptRoulette;