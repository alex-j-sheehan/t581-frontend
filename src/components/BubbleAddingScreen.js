import React, { useState, useEffect, useRef } from 'react';
import FloatingTimer from './FloatingTimer';
import WinnersGallery from './WinnersGallery';

// Import ComicalJS - try both methods to ensure compatibility
import * as ComicalImport from 'comicaljs';
const { Comical, Bubble } = ComicalImport;

const BubbleAddingScreen = ({ drawing, winners, prompt, onBubblesComplete }) => {
  // Canvas and state setup
  const canvasRef = useRef(null);
  const bubbleContainerRef = useRef(null);
  const [timeLeft, setTimeLeft] = useState(30); // 30 seconds timer
  const [timerActive, setTimerActive] = useState(true);
  const [autoSubmitted, setAutoSubmitted] = useState(false);
  const [bubbles, setBubbles] = useState([]);
  const [activeBubbleIndex, setActiveBubbleIndex] = useState(null);
  const [currentText, setCurrentText] = useState('');
  const [bubbleType, setBubbleType] = useState('speech'); // 'speech' or 'thought'
  const [showTooltip, setShowTooltip] = useState(false);
  const [nextBubbleId, setNextBubbleId] = useState(1);
  const [comicalInitialized, setComicalInitialized] = useState(false);
  const [isDragging, setIsDragging] = useState(false); // Add drag state tracking
  
  // Total time constant
  const TOTAL_TIME = 30;

  // Updated ComicalJS initialization
  useEffect(() => {
    // Need to wait for DOM to be ready
    setTimeout(() => {
      const container = bubbleContainerRef.current;
      if (container) {
        console.log("Initializing ComicalJS with container:", container);
        try {
          // Make sure Comical is available
          if (typeof Comical !== 'undefined' && Comical) {
            // First check if we need to stop any existing editing
            if (typeof Comical.stopEditing === 'function') {
              try {
                Comical.stopEditing();
              } catch (e) {
                console.log("No active editing to stop");
              }
            }
            
            // Start editing in ComicalJS
            Comical.startEditing([container]);
            console.log("ComicalJS editing started");
            
            // Register ComicalJS event listener for bubble selection
            container.addEventListener('comicalselect', (e) => {
              try {
                console.log("ComicalJS selection event:", e.detail);
                if (e.detail && e.detail.content) {
                  const bubbleId = e.detail.content.id;
                  const index = bubbles.findIndex(b => b.id === bubbleId);
                  if (index !== -1) {
                    setActiveBubbleIndex(index);
                    setCurrentText(bubbles[index].text || '');
                    setBubbleType(bubbles[index].type || 'speech');
                  }
                }
              } catch (error) {
                console.error("Error handling ComicalJS selection:", error);
              }
            });
            
            // Set up drag handling for bubbles as backup
            setComicalInitialized(true);
            startDragging(container);
          } else {
            console.error("ComicalJS is not available");
            // Fallback to our custom dragging system
            startDragging(container);
            setComicalInitialized(true);
          }
        } catch (error) {
          console.error("Error initializing ComicalJS:", error);
          // Fallback to our custom dragging system
          startDragging(container);
          setComicalInitialized(true);
        }
      }
    }, 500);
    
    // Cleanup on unmount
    return () => {
      try {
        if (typeof Comical !== 'undefined' && Comical && typeof Comical.stopEditing === 'function') {
          Comical.stopEditing();
          console.log("ComicalJS editing stopped");
        }
      } catch (error) {
        console.error("Error stopping ComicalJS editing:", error);
      }
      
      // Clean up event listeners
      const container = bubbleContainerRef.current;
      if (container && container.dataset.cleanupDrag) {
        try {
          const cleanup = new Function(container.dataset.cleanupDrag);
          cleanup();
        } catch (error) {
          console.error("Error cleaning up drag handlers:", error);
        }
      }
    };
  }, []);

  // Timer effect
  useEffect(() => {
    let interval;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0 && !autoSubmitted) {
      // Time's up, submit automatically
      setAutoSubmitted(true);
      handleSubmit();
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft, autoSubmitted]);

  // Draw the original drawing on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !drawing) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw the original drawing
    if (drawing.paths && Array.isArray(drawing.paths)) {
      drawing.paths.forEach(path => {
        if (!path || !path.path) return;
        
        ctx.beginPath();
        ctx.moveTo(path.path[0][0], path.path[0][1]);
        for (let i = 1; i < path.path.length; i++) {
          ctx.lineTo(path.path[i][0], path.path[i][1]);
        }
        
        ctx.strokeStyle = path.color;
        ctx.lineWidth = path.width;
        ctx.stroke();
      });
    }
  }, [drawing]);
  
  // Improve the startDragging function with a fallback mechanism
  const startDragging = (containerIn) => {
    const container = containerIn;
    console.log("Setting up drag handling for", container);
    let startDragX = 0;
    let startDragY = 0;
    let dragWhat = undefined;
    let usingFallbackDrag = false;
    
    const handleMouseDown = (ev) => {
      try {
        console.log("Mouse down");
        startDragX = ev.clientX;
        startDragY = ev.clientY;
        
        // First try ComicalJS built-in detection
        if (typeof Comical !== 'undefined' && Comical && typeof Comical.getBubbleHit === 'function') {
          const dragBubble = Comical.getBubbleHit(container, startDragX, startDragY);
          dragWhat = dragBubble ? dragBubble.content : undefined;
          console.log("Dragging via ComicalJS:", dragWhat);
          
          // Update active bubble in state if we found one
          if (dragWhat) {
            const index = bubbles.findIndex(b => b.id === dragWhat.id);
            if (index !== -1) {
              console.log("Setting active bubble index to", index);
              setActiveBubbleIndex(index);
              setCurrentText(bubbles[index].text || '');
              setBubbleType(bubbles[index].type || 'speech');
            }
          }
        }
        
        // If ComicalJS fails, try our own detection
        if (!dragWhat) {
          // Check if we clicked on a bubble element
          const target = ev.target;
          const bubbleEl = target.closest('.bubble-content');
          if (bubbleEl) {
            dragWhat = bubbleEl;
            usingFallbackDrag = true;
            console.log("Fallback dragging:", dragWhat);
            
            // Update active bubble in state
            const index = bubbles.findIndex(b => b.id === dragWhat.id);
            if (index !== -1) {
              console.log("Setting active bubble index to", index);
              setActiveBubbleIndex(index);
              setCurrentText(bubbles[index].text || '');
              setBubbleType(bubbles[index].type || 'speech');
            }
          }
        }
        
        // Set drag state to true if we're dragging something
        if (dragWhat) {
          setIsDragging(true);
        }
      } catch (error) {
        console.error("Error in drag detection:", error);
      }
    };
    
    const handleMouseMove = (ev) => {
      if (ev.buttons === 1 && dragWhat) {
        try {
          console.log("dragWhat", dragWhat);
          const deltaX = ev.clientX - startDragX;
          const deltaY = ev.clientY - startDragY;
          
          // Make sure we indicate we're dragging when we actually move
          if ((deltaX !== 0 || deltaY !== 0) && !isDragging) {
            setIsDragging(true);
          }
          
          if (deltaX !== 0 || deltaY !== 0) {
            if (!dragWhat.dataset.left) {
              // Initialize position data if not available
              const rect = dragWhat.getBoundingClientRect();
              const containerRect = container.getBoundingClientRect();
              dragWhat.dataset.left = rect.left - containerRect.left;
              dragWhat.dataset.top = rect.top - containerRect.top;
            }
            
            // Update position data
            dragWhat.dataset.left = parseInt(dragWhat.dataset.left, 10) + deltaX;
            dragWhat.dataset.top = parseInt(dragWhat.dataset.top, 10) + deltaY;
            
            // Update position (percentage for responsive sizing)
            dragWhat.style.left = (dragWhat.dataset.left / container.clientWidth) * 100 + "%";
            dragWhat.style.top = (dragWhat.dataset.top / container.clientHeight) * 100 + "%";
            
            startDragX = ev.clientX;
            startDragY = ev.clientY;
            
            // Update ComicalJS to redraw
            if (!usingFallbackDrag && typeof Comical !== 'undefined' && Comical && typeof Comical.update === 'function') {
              Comical.update(container);
            }
          }
        } catch (error) {
          console.error("Error updating during drag:", error);
        }
      }
    };
    
    const handleMouseUp = (ev) => {
      if (dragWhat) {
        // Ensure ComicalJS is updated after drag ends
        try {
          if (typeof Comical !== 'undefined' && Comical && typeof Comical.update === 'function') {
            Comical.update(container);
          }
        } catch (error) {
          console.error("Error updating Comical after drag:", error);
        }
        
        // Reset drag variables
        dragWhat = undefined;
        usingFallbackDrag = false;
        
        // Wait a moment before clearing the drag state to prevent 
        // immediate bubble creation when releasing after a drag
        setTimeout(() => {
          setIsDragging(false);
        }, 100);
      }
    };
    
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    
    // Store cleanup function in container's dataset for later removal
    container.dataset.cleanupDrag = "document.removeEventListener('mousedown', handleMouseDown); document.removeEventListener('mousemove', handleMouseMove); document.removeEventListener('mouseup', handleMouseUp);";
  };
  
  // Helper function to reposition bubbles on resize
  const repositionBubble = (bubbleEl, parent) => {
    if (!bubbleEl || !parent) return;
    
    try {
      const left = parseInt(bubbleEl.style.left.replace("%", ""), 10) || 0;
      const top = parseInt(bubbleEl.style.top.replace("%", ""), 10) || 0;
      bubbleEl.dataset.left = (left / 100) * parent.clientWidth;
      bubbleEl.dataset.top = (top / 100) * parent.clientHeight;
    } catch (error) {
      console.error("Error repositioning bubble:", error);
    }
  };
  
  // Improve bubble creation to use ComicalJS properly
  const addBubble = (x, y) => {
    // Check if ComicalJS is available
    if (!bubbleContainerRef.current) return;
    
    try {
      const container = bubbleContainerRef.current;
      const newId = `bubble-${Date.now()}`;
      
      // Use ComicalJS directly if available
      if (typeof Comical !== 'undefined' && Comical && typeof Bubble !== 'undefined') {
        console.log("Creating bubble with ComicalJS");
        
        // Create bubble element manually
        const bubbleEl = document.createElement('div');
        bubbleEl.id = newId;
        bubbleEl.className = 'bubble-content';
        bubbleEl.style.position = 'absolute';
        bubbleEl.style.left = `${x}px`;
        bubbleEl.style.top = `${y}px`;
        bubbleEl.style.width = '150px';
        bubbleEl.style.minWidth = '150px';
        bubbleEl.style.minHeight = '80px';
        
        // Create typewriter container
        const typewriterEl = document.createElement('div');
        typewriterEl.id = `${newId}-typewriter`;
        typewriterEl.textContent = 'Enter text here';
        bubbleEl.appendChild(typewriterEl);
        
        // Add to container
        container.appendChild(bubbleEl);
        
        // Apply ComicalJS bubble styling
        try {
          const bubble = new Bubble(bubbleEl);
          bubble.setBubbleSpec({
            version: "1.0",
            style: bubbleType,
            tails: [Bubble.makeDefaultTail(bubbleEl)],
            level: 2,
            backgroundColors: ["rgba(255,255,255,1)"]
          });
          
          // Update ComicalJS
          Comical.update(container);
        } catch (error) {
          console.error("Error applying ComicalJS styling:", error);
        }
      } else {
        // Fallback to custom bubble
        console.log("Creating custom bubble (ComicalJS unavailable)");
        const bubbleEl = document.createElement('div');
        bubbleEl.id = newId;
        bubbleEl.className = 'bubble-content';
        bubbleEl.textContent = 'Enter text here';
        bubbleEl.style.position = 'absolute';
        bubbleEl.style.left = `${x}px`;
        bubbleEl.style.top = `${y}px`;
        bubbleEl.style.width = '150px';
        bubbleEl.style.height = '80px';
        bubbleEl.style.backgroundColor = 'white';
        bubbleEl.style.border = '2px solid black';
        bubbleEl.style.borderRadius = '10px';
        bubbleEl.style.padding = '8px';
        
        container.appendChild(bubbleEl);
      }
      
      // Add to state (after DOM update to avoid double rendering)
      const newBubble = {
        id: newId,
        x: x,
        y: y,
        width: 150,
        height: 80,
        text: 'Enter text here',
        type: bubbleType,
        direction: 'bottom'
      };
      
      setBubbles(prevBubbles => {
        const updatedBubbles = [...prevBubbles, newBubble];
        // Set as active immediately
        setActiveBubbleIndex(updatedBubbles.length - 1);
        setCurrentText('Enter text here');
        return updatedBubbles;
      });
    } catch (error) {
      console.error("Error adding bubble:", error);
    }
  };
  
  // Select a bubble by id or element
  const selectBubble = (bubbleElOrId) => {
    try {
      // Get bubble ID
      const bubbleId = typeof bubbleElOrId === 'string' ? 
        bubbleElOrId : bubbleElOrId.id;
      
      // Find the bubble in state
      const index = bubbles.findIndex(b => b.id === bubbleId);
      
      if (index !== -1) {
        console.log("Selecting bubble:", bubbleId, "at index:", index);
        
        // Update state
        setActiveBubbleIndex(index);
        setCurrentText(bubbles[index].text || '');
        setBubbleType(bubbles[index].type || 'speech');
        
        // Highlight the bubble visually
        const bubbleEl = document.getElementById(bubbleId);
        if (bubbleEl) {
          // Remove highlight from all bubbles
          document.querySelectorAll('.bubble-content').forEach(el => {
            el.style.boxShadow = '';
          });
          
          // Add highlight to selected bubble
          bubbleEl.style.boxShadow = '0 0 0 2px #3498db';
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error selecting bubble:", error);
      return false;
    }
  };
  
  // Handle canvas click with immediate response
  const handleCanvasClick = (e) => {
    e.stopPropagation(); // Prevent event bubbling
    
    // If we're dragging bubbles or tails, don't add a bubble
    if (isDragging) {
      console.log("Not adding bubble because we're dragging a bubble");
      return;
    }
    
    if (isTailDragging || isTailDraggingRef.current) {
      console.log("Not adding bubble because we're dragging a tail");
      return;
    }
    
    try {
      const container = bubbleContainerRef.current;
      if (!container) return;
      
      // Check if we clicked on tail indicator (by exact id match first)
      if (e.target.id === 'tail-indicator') {
        console.log("Clicked on tail indicator ID, not adding bubble");
        return;
      }
      
      // Check by class or parent (as fallback)
      if (e.target.classList.contains('tail-indicator') || 
          e.target.closest('.tail-indicator') ||
          e.target.closest('#tail-indicator')) {
        console.log("Clicked on tail indicator via class/parent, not adding bubble");
        return;
      }
      
      // Additional check to catch recent tail drags that might not be reflected in state yet
      if (activeTailBubbleId || activeTailBubbleIdRef.current) {
        console.log("Recent tail activity detected, not adding bubble");
        return;
      }
      
      // Get click position relative to container
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Check if we clicked directly on a bubble element
      const target = e.target;
      const bubbleEl = target.closest('.bubble-content');
      if (bubbleEl) {
        selectBubble(bubbleEl);
        return;
      }
      
      // Check if clicked on a ComicalJS bubble
      if (typeof Comical !== 'undefined' && Comical && typeof Comical.getBubbleHit === 'function') {
        const hitBubble = Comical.getBubbleHit(container, e.clientX, e.clientY);
        if (hitBubble && hitBubble.content) {
          if (selectBubble(hitBubble.content)) {
            return; // Don't add a new bubble if we hit an existing one
          }
        }
      }
      
      console.log("Adding new bubble at", x, y);
      // If no bubble hit and not dragging, add a new one immediately
      addBubble(x, y);
    } catch (error) {
      console.error("Error in canvas click handler:", error);
    }
  };
  
  // Handle text input
  const handleTextChange = (e) => {
    try {
      const newText = e.target.value;
      setCurrentText(newText);
      
      if (activeBubbleIndex !== null && activeBubbleIndex < bubbles.length) {
        // Update text in state
        setBubbles(prevBubbles => {
          const newBubbles = [...prevBubbles];
          newBubbles[activeBubbleIndex] = {
            ...newBubbles[activeBubbleIndex],
            text: newText
          };
          return newBubbles;
        });
        
        // Update text in DOM
        const bubbleId = bubbles[activeBubbleIndex].id;
        
        // Try updating typewriter element for ComicalJS
        const typewriterEl = document.getElementById(`${bubbleId}-typewriter`);
        if (typewriterEl) {
          typewriterEl.innerHTML = newText;
        }
        
        // Also update direct content for fallback system
        const bubbleEl = document.getElementById(bubbleId);
        if (bubbleEl && !typewriterEl) {
          bubbleEl.textContent = newText;
        }
          
        // Update ComicalJS to reflow the text
        try {
          const container = bubbleContainerRef.current;
          if (container && typeof Comical !== 'undefined' && Comical && typeof Comical.update === 'function') {
            Comical.update(container);
          }
        } catch (error) {
          console.error("Error updating Comical after text change:", error);
        }
      }
    } catch (error) {
      console.error("Error changing text:", error);
    }
  };
  
  // Toggle bubble type
  const toggleBubbleType = () => {
    try {
      const newType = bubbleType === 'speech' ? 'thought' : 'speech';
      setBubbleType(newType);
      
      if (activeBubbleIndex !== null && activeBubbleIndex < bubbles.length) {
        // Update type in state
        setBubbles(prevBubbles => {
          const newBubbles = [...prevBubbles];
          newBubbles[activeBubbleIndex] = {
            ...newBubbles[activeBubbleIndex],
            type: newType
          };
          return newBubbles;
        });
        
        // Update type in DOM
        const bubbleId = bubbles[activeBubbleIndex].id;
        const bubbleEl = document.getElementById(bubbleId);
        if (bubbleEl && typeof Bubble !== 'undefined' && Bubble) {
          try {
            const bubble = new Bubble(bubbleEl);
            bubble.setBubbleSpec({
              version: "1.0",
              style: newType,
              tails: [Bubble.makeDefaultTail(bubbleEl)],
              level: 2,
              backgroundColors: ["rgba(255,255,255,1)"]
            });
            
            // Update ComicalJS
            const container = bubbleContainerRef.current;
            if (container && typeof Comical !== 'undefined' && Comical && typeof Comical.update === 'function') {
              Comical.update(container);
            }
          } catch (error) {
            console.error("Error updating bubble type:", error);
          }
        }
      }
    } catch (error) {
      console.error("Error toggling bubble type:", error);
    }
  };
  
  // Delete the currently selected bubble
  const deleteBubble = () => {
    try {
      if (activeBubbleIndex !== null && activeBubbleIndex < bubbles.length) {
        const bubbleId = bubbles[activeBubbleIndex].id;
        const bubbleEl = document.getElementById(bubbleId);
        
        console.log("Deleting bubble:", bubbleId, "at index:", activeBubbleIndex);
        
        // Remove from DOM
        if (bubbleEl) {
          bubbleEl.remove();
        }
        
        // Remove from state
        setBubbles(prevBubbles => prevBubbles.filter((_, index) => index !== activeBubbleIndex));
        
        // Clear active bubble selection
        setActiveBubbleIndex(null);
        setCurrentText('');
        
        // Reset drag state to ensure we can add bubbles after deleting
        setIsDragging(false);
        
        // Update ComicalJS
        try {
          const container = bubbleContainerRef.current;
          if (container && typeof Comical !== 'undefined' && Comical && typeof Comical.update === 'function') {
            Comical.update(container);
          }
        } catch (error) {
          console.error("Error updating Comical after deletion:", error);
        }
      } else {
        console.warn("No active bubble to delete");
      }
    } catch (error) {
      console.error("Error deleting bubble:", error);
    }
  };
  
  // Handle submission
  const handleSubmit = () => {
    try {
      setTimerActive(false);
      setIsDragging(false); // Reset drag state
      
      // Stop ComicalJS editing
      try {
        if (typeof Comical !== 'undefined' && Comical && typeof Comical.stopEditing === 'function') {
          Comical.stopEditing();
        }
      } catch (error) {
        console.error("Error stopping ComicalJS editing:", error);
      }
      
      // Get all bubbles
      const container = bubbleContainerRef.current;
      const bubbleElements = container.querySelectorAll('.bubble-content');
      
      console.log("Found bubble elements:", bubbleElements.length);
      
      // Extract bubble data
      const extractedBubbles = Array.from(bubbleElements).map(el => {
        // Get bubble position and size
        const rect = el.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        // Calculate position relative to container
        const x = rect.left - containerRect.left;
        const y = rect.top - containerRect.top;
        const width = rect.width;
        const height = rect.height;
        
        // Get bubble text
        const typewriterEl = el.querySelector('[id$="-typewriter"]');
        const text = typewriterEl ? typewriterEl.innerHTML : el.textContent;
        
        // Get bubble type (speech or thought)
        let type = 'speech';
        try {
          if (el.dataset.bubble) {
            const bubbleData = JSON.parse(el.dataset.bubble.replace(/`/g, '"'));
            type = bubbleData.style || 'speech';
          }
        } catch (e) {
          console.warn("Could not parse bubble data for type:", e);
        }
        
        // Extract tail position if available
        let tailX, tailY, direction;
        
        try {
          if (el.dataset.bubble) {
            const bubbleData = JSON.parse(el.dataset.bubble.replace(/`/g, '"'));
            if (bubbleData.tails && bubbleData.tails.length > 0) {
              tailX = bubbleData.tails[0].tipX;
              tailY = bubbleData.tails[0].tipY;
              
              // Determine direction based on tail position
              const centerX = x + width/2;
              const centerY = y + height/2;
              
              // Calculate which side of the bubble the tail is closest to
              const distToLeft = Math.abs(tailX - x);
              const distToRight = Math.abs(tailX - (x + width));
              const distToTop = Math.abs(tailY - y);
              const distToBottom = Math.abs(tailY - (y + height));
              
              // Find the minimum distance
              const minDist = Math.min(distToLeft, distToRight, distToTop, distToBottom);
              
              // Set direction based on which side is closest
              if (minDist === distToLeft) direction = 'left';
              else if (minDist === distToRight) direction = 'right';
              else if (minDist === distToTop) direction = 'top';
              else direction = 'bottom';
            }
          }
        } catch (error) {
          console.error("Error extracting tail data:", error);
        }
        
        // Create bubble object
        return {
          id: el.id,
          x,
          y,
          width,
          height,
          text,
          type,
          tailX,
          tailY,
          direction
        };
      });
      
      console.log("Extracted bubbles:", extractedBubbles);
      
      // Make a copy of the original drawing
      const originalDrawing = drawing || {};
      console.log("Original drawing:", originalDrawing);
      
      // Create a drawing object with all properties from the original drawing
      const drawingWithBubbles = { 
        ...originalDrawing,
        // Override or add these properties
        id: originalDrawing.id || Math.floor(Math.random() * 10000),
        canvasWidth: container.clientWidth,
        canvasHeight: container.clientHeight,
        paths: originalDrawing.paths || [],
        bubbles: extractedBubbles
      };
      
      console.log("Final drawing object:", drawingWithBubbles);
      
      // Call the completion handler
      onBubblesComplete(drawingWithBubbles);
    } catch (error) {
      console.error("Error in submit handler:", error);
    }
  };
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      try {
        const container = bubbleContainerRef.current;
        if (container) {
          // Reposition all bubbles
          bubbles.forEach(bubble => {
            const bubbleEl = document.getElementById(bubble.id);
            if (bubbleEl) {
              repositionBubble(bubbleEl, container);
            }
          });
          
          // Update ComicalJS
          if (typeof Comical !== 'undefined' && Comical && typeof Comical.update === 'function') {
            Comical.update(container);
          }
        }
      } catch (error) {
        console.error("Error handling resize:", error);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [bubbles]);

  // Recreate ComicalJS bubbles from state
  const recreateBubbles = () => {
    try {
      const container = bubbleContainerRef.current;
      if (!container) return;
      
      // Remove existing bubble elements
      const existingBubbles = container.querySelectorAll('.bubble-content');
      existingBubbles.forEach(bubble => bubble.remove());
      
      // Recreate each bubble from state
      bubbles.forEach(bubble => {
        try {
          // Create bubble element
          const bubbleEl = document.createElement('div');
          bubbleEl.id = bubble.id;
          bubbleEl.className = 'bubble-content';
          bubbleEl.style.position = 'absolute';
          bubbleEl.style.left = `${bubble.x}px`;
          bubbleEl.style.top = `${bubble.y}px`;
          bubbleEl.style.width = '150px';
          bubbleEl.style.minWidth = '150px';
          bubbleEl.style.minHeight = '80px';
          
          // Create typewriter container
          const typewriterEl = document.createElement('div');
          typewriterEl.id = `${bubble.id}-typewriter`;
          typewriterEl.textContent = bubble.text || 'Enter text here';
          bubbleEl.appendChild(typewriterEl);
          
          // Add to container
          container.appendChild(bubbleEl);
          
          // Apply ComicalJS styling
          if (typeof Bubble !== 'undefined' && Bubble) {
            const comicalBubble = new Bubble(bubbleEl);
            comicalBubble.setBubbleSpec({
              version: "1.0",
              style: bubble.type || 'speech',
              tails: [Bubble.makeDefaultTail(bubbleEl)],
              level: 2,
              backgroundColors: ["rgba(255,255,255,1)"]
            });
          }
        } catch (error) {
          console.error("Error recreating bubble:", error);
        }
      });
      
      // Update ComicalJS to reflect changes
      if (typeof Comical !== 'undefined' && Comical && typeof Comical.update === 'function') {
        Comical.update(container);
      }
      
      console.log("Recreated", bubbles.length, "bubbles");
    } catch (error) {
      console.error("Error in recreateBubbles:", error);
    }
  };
  
  // Add CSS styles for tail indicators
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .tail-indicator {
        position: absolute;
        width: 16px;
        height: 16px;
        background-color: #ff3b30;
        border: 2px solid #fff;
        border-radius: 50%;
        cursor: move;
        z-index: 1000;
        box-shadow: 0 0 6px rgba(0, 0, 0, 0.5);
        transform: translate(-50%, -50%);
        transition: background-color 0.2s;
        pointer-events: all !important;
      }
      
      .tail-indicator:hover {
        background-color: #ff9500;
        transform: translate(-50%, -50%) scale(1.2);
      }
      
      .tail-indicator:active {
        background-color: #ff2d55;
        transform: translate(-50%, -50%) scale(1.1);
      }
      
      /* Visible path between bubble and tail */
      .tail-path {
        position: absolute;
        border-top: 2px dashed rgba(255, 59, 48, 0.7);
        pointer-events: none;
        z-index: 999;
      }
    `;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);
  
  // Track tail dragging state with refs for reliability
  const [isTailDragging, setIsTailDragging] = useState(false);
  const [activeTailBubbleId, setActiveTailBubbleId] = useState(null);
  const tailIndicatorRef = useRef(null);
  const isTailDraggingRef = useRef(false); // Use ref for instant access in event handlers
  const activeTailBubbleIdRef = useRef(null); // Use ref for instant access in event handlers
  
  // Keep refs in sync with state
  useEffect(() => {
    isTailDraggingRef.current = isTailDragging;
  }, [isTailDragging]);
  
  useEffect(() => {
    activeTailBubbleIdRef.current = activeTailBubbleId;
  }, [activeTailBubbleId]);
  
  // Create a direct DOM event handler for tail mousedown that doesn't use React state
  const setupTailIndicator = (tailIndicator, bubbleId) => {
    // Remove old event listeners if any
    const oldTailIndicator = document.getElementById('tail-indicator');
    if (oldTailIndicator) {
      oldTailIndicator.remove();
    }
    
    // Set up new event listeners
    tailIndicator.onmousedown = (e) => {
      e.stopPropagation();
      e.preventDefault();
      console.log("Tail indicator mousedown");
      isTailDraggingRef.current = true;
      activeTailBubbleIdRef.current = bubbleId;
      setIsTailDragging(true);
      setActiveTailBubbleId(bubbleId);
    };
    
    // Add to container
    bubbleContainerRef.current.appendChild(tailIndicator);
    tailIndicatorRef.current = tailIndicator;
  };
  
  // Update tail indicator position based on selected bubble
  useEffect(() => {
    if (activeBubbleIndex !== null && activeBubbleIndex < bubbles.length) {
      try {
        const bubbleId = bubbles[activeBubbleIndex].id;
        const bubbleEl = document.getElementById(bubbleId);
        
        if (bubbleEl) {
          // Check if bubble has tail data
          const bubbleData = bubbleEl.dataset.bubble ? JSON.parse(bubbleEl.dataset.bubble.replace(/`/g, '"')) : null;
          
          if (bubbleData && bubbleData.tails && bubbleData.tails.length > 0) {
            // Create new tail indicator (always create fresh to avoid event listener issues)
            const tailIndicator = document.createElement('div');
            tailIndicator.id = 'tail-indicator';
            tailIndicator.className = 'tail-indicator';
            
            // Position the indicator at the tail tip
            const tail = bubbleData.tails[0];
            tailIndicator.style.left = `${tail.tipX}px`;
            tailIndicator.style.top = `${tail.tipY}px`;
            
            // Store reference to the bubble this indicator controls
            tailIndicator.dataset.bubbleId = bubbleId;
            
            // Setup the indicator with event handlers
            setupTailIndicator(tailIndicator, bubbleId);
            
            return;
          }
        }
      } catch (error) {
        console.error("Error updating tail indicator:", error);
      }
    }
    
    // Remove tail indicator if no active bubble or no tail
    const tailIndicator = document.getElementById('tail-indicator');
    if (tailIndicator) {
      tailIndicator.remove();
      tailIndicatorRef.current = null;
    }
  }, [activeBubbleIndex, bubbles]);
  
  // Set up global mouse event handlers for tail dragging
  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (!isTailDraggingRef.current || !activeTailBubbleIdRef.current) return;
      
      try {
        const tailIndicator = document.getElementById('tail-indicator');
        const bubbleEl = document.getElementById(activeTailBubbleIdRef.current);
        
        if (!tailIndicator || !bubbleEl) return;
        
        // Get mouse position relative to the container
        const containerRect = bubbleContainerRef.current.getBoundingClientRect();
        const x = e.clientX - containerRect.left;
        const y = e.clientY - containerRect.top;
        
        console.log("Moving tail to:", x, y);
        
        // Update indicator position
        tailIndicator.style.left = `${x}px`;
        tailIndicator.style.top = `${y}px`;
        
        // Update the bubble's tail data
        if (bubbleEl.dataset.bubble) {
          try {
            const bubbleData = JSON.parse(bubbleEl.dataset.bubble.replace(/`/g, '"'));
            
            if (bubbleData.tails && bubbleData.tails.length > 0) {
              // Update tail position
              bubbleData.tails[0].tipX = x;
              bubbleData.tails[0].tipY = y;
              
              // Recalculate midpoint (approximately halfway between bubble center and tip)
              const bubbleRect = bubbleEl.getBoundingClientRect();
              const bubbleCenterX = (bubbleRect.left + bubbleRect.right) / 2 - containerRect.left;
              const bubbleCenterY = (bubbleRect.top + bubbleRect.bottom) / 2 - containerRect.top;
              
              bubbleData.tails[0].midpointX = (bubbleCenterX + x) / 2;
              bubbleData.tails[0].midpointY = (bubbleCenterY + y) / 2;
              
              // Update the bubble data
              bubbleEl.dataset.bubble = JSON.stringify(bubbleData).replace(/"/g, '`');
              
              // Update ComicalJS if available
              if (typeof Comical !== 'undefined' && Comical && typeof Comical.update === 'function') {
                Comical.update(bubbleContainerRef.current);
              }
            }
          } catch (error) {
            console.error("Error updating bubble tail data:", error);
          }
        }
      } catch (error) {
        console.error("Error in handleTailMove:", error);
      }
    };
    
    const handleGlobalMouseUp = (e) => {
      if (isTailDraggingRef.current) {
        console.log("Ending tail drag");
        e.preventDefault(); // Prevent creating bubbles on mouseup
        e.stopPropagation(); // Prevent other handlers
        isTailDraggingRef.current = false;
        setIsTailDragging(false);
        
        // Wait a bit before allowing new bubbles to be created
        setTimeout(() => {
          setActiveTailBubbleId(null);
          activeTailBubbleIdRef.current = null;
        }, 100);
      }
    };
    
    // Add event listeners
    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
    
    return () => {
      // Clean up
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

  return (
    <div className="bubble-adding-screen">
      <h1>What're they saying??</h1>
      
      <WinnersGallery winners={winners} />
      <FloatingTimer timeLeft={timeLeft} totalTime={TOTAL_TIME} position="top-left" />
      
      <div className="prompt-display">
        <h2>Original Prompt:</h2>
        <p className="prompt-text">{prompt || "Add some speech or thought bubbles!"}</p>
      </div>
      
      <div className="bubble-controls">
        <div className="bubble-text-input">
          <textarea
            value={currentText}
            onChange={handleTextChange}
            placeholder="Enter bubble text here..."
            rows={3}
            className="bubble-text-area"
            disabled={activeBubbleIndex === null}
          />
        </div>
        
        <div className="bubble-options">
          <button
            className={`bubble-type-btn ${bubbleType === 'speech' ? 'active' : ''}`}
            onClick={toggleBubbleType}
          >
            {bubbleType === 'speech' ? '💬 Speech' : '💭 Thought'}
          </button>
          
          <button
            className="delete-bubble-btn"
            onClick={deleteBubble}
            disabled={activeBubbleIndex === null}
          >
            🗑️ Delete Bubble
          </button>
          
          <button 
            className="submit-btn"
            onClick={handleSubmit}
          >
            Submit
          </button>
          
          <div className="help-container">
            <button 
              className="help-button"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              ?
            </button>
            
            {showTooltip && (
              <div className="custom-tooltip">
                <p>Click anywhere on the drawing to add a new bubble.</p>
                <p>Drag bubbles to reposition them.</p>
                <p>Select a bubble and edit its text in the box above.</p>
                <p>When a bubble is selected, a blue dot appears at the tail tip. Drag this dot to reposition the tail.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="canvas-container-wrapper" style={{ position: 'relative' }}>
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="canvas-container"
        />
        <div 
          ref={bubbleContainerRef}
          className="canvas-bubbles-container"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '800px', 
            height: '600px',
            zIndex: 10
          }}
          onClick={handleCanvasClick}
        ></div>
      </div>
      
      <style>
        {`
          .bubble-content {
            position: absolute;
            padding: 10px;
            background-color: white;
            border-radius: 10px;
            font-family: 'Comic Sans MS', cursive, sans-serif;
            cursor: move;
          }
          
          .initialize-btn {
            padding: 8px 16px;
            background-color: #9c27b0;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
            transition: background-color 0.2s;
          }
          
          .initialize-btn:hover {
            background-color: #7b1fa2;
          }
        `}
      </style>
    </div>
  );
};

export default BubbleAddingScreen; 