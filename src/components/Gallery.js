import React, { useRef, useEffect } from 'react';

// Try different import approaches for ComicalJS to ensure compatibility
let Comical, Bubble;
try {
  const ComicalImport = require('comicaljs');
  Comical = ComicalImport.Comical || ComicalImport.default?.Comical || ComicalImport;
  Bubble = ComicalImport.Bubble || ComicalImport.default?.Bubble;
} catch (e) {
  console.warn("Failed to import ComicalJS directly:", e);
}

const Gallery = ({ drawings, onSelectDrawing, isJudge = false }) => {
  const canvasRefs = useRef([]);
  const bubbleContainerRefs = useRef([]);
  
  // Initialize ComicalJS on component mount
  useEffect(() => {
    // Attempt to load ComicalJS if not available through imports
    if (typeof window !== 'undefined' && !Comical && window.Comical) {
      Comical = window.Comical;
      Bubble = window.Comical.Bubble;
      console.log("Using global ComicalJS from window");
    }
    
    // Return cleanup function
    return () => {
      // Clean up any active editing on unmount
      if (Comical && typeof Comical.stopEditing === 'function') {
        try {
          Comical.stopEditing();
        } catch (e) {
          console.warn("Error stopping ComicalJS editing:", e);
        }
      }
    };
  }, []);
  
  // Add CSS for bubble containers
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .gallery-canvas-container {
        position: relative;
      }
      
      .gallery-bubble-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 10;
      }
      
      .gallery-bubble-content {
        position: absolute;
        font-family: 'Comic Sans MS', cursive, sans-serif;
      }
    `;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  useEffect(() => {
    // Draw all drawings on their respective canvases
    drawings.forEach((drawing, index) => {
      const canvas = canvasRefs.current[index];
      if (!canvas || !drawing) return;
      
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // If it's an empty drawing, display the message
      if (drawing.isEmpty) {
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Create gradient for colorful text
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        gradient.addColorStop(0, 'red');
        gradient.addColorStop(0.2, 'orange');
        gradient.addColorStop(0.4, 'yellow');
        gradient.addColorStop(0.6, 'green');
        gradient.addColorStop(0.8, 'blue');
        gradient.addColorStop(1, 'purple');
        
        ctx.fillStyle = gradient;
        ctx.fillText('Artist was too busy', canvas.width / 2, canvas.height / 2 - 20);
        ctx.fillText('tying their shoes', canvas.width / 2, canvas.height / 2 + 10);
        ctx.fillText('to draw!', canvas.width / 2, canvas.height / 2 + 40);
        return;
      }
      
      // Calculate scaling factors
      const originalWidth = drawing.canvasWidth || 800; // Use stored width or default
      const originalHeight = drawing.canvasHeight || 600; // Use stored height or default
      const scaleX = canvas.width / originalWidth;
      const scaleY = canvas.height / originalHeight;
      
      // Draw all paths for this drawing
      if (drawing.paths && Array.isArray(drawing.paths)) {
        drawing.paths.forEach(path => {
          if (!path || !path.path) return;
          
          ctx.beginPath();
          
          // Scale the coordinates
          const scaledPath = path.path.map(point => [
            point[0] * scaleX,
            point[1] * scaleY
          ]);
          
          ctx.moveTo(scaledPath[0][0], scaledPath[0][1]);
          for (let i = 1; i < scaledPath.length; i++) {
            ctx.lineTo(scaledPath[i][0], scaledPath[i][1]);
          }
          
          ctx.strokeStyle = path.color;
          ctx.lineWidth = path.width * Math.min(scaleX, scaleY); // Scale the line width
          ctx.stroke();
        });
      }
      
      // Get bubble container for this canvas
      const bubbleContainer = bubbleContainerRefs.current[index];
      if (!bubbleContainer) return;
      
      // Clear existing bubbles
      while (bubbleContainer.firstChild) {
        bubbleContainer.removeChild(bubbleContainer.firstChild);
      }
      
      // Draw bubbles if they exist using ComicalJS
      if (drawing.bubbles && Array.isArray(drawing.bubbles)) {
        try {
          console.log(`Gallery: Processing ${drawing.bubbles.length} bubbles for drawing ${index}`);
          const createdBubbles = [];
          
          drawing.bubbles.forEach((bubble, bubbleIndex) => {
            if (!bubble) return;
            
            console.log(`Gallery: Processing bubble ${bubbleIndex}:`, bubble);
            
            // Scale bubble position and size
            const scaledX = bubble.x * scaleX;
            const scaledY = bubble.y * scaleY;
            const scaledWidth = bubble.width * scaleX;
            const scaledHeight = bubble.height * scaleY;
            
            // Create bubble element
            const bubbleEl = document.createElement('div');
            bubbleEl.id = `gallery-bubble-${index}-${bubbleIndex}`;
            bubbleEl.className = 'gallery-bubble-content';
            bubbleEl.style.position = 'absolute';
            bubbleEl.style.left = `${scaledX}px`;
            bubbleEl.style.top = `${scaledY}px`;
            bubbleEl.style.width = `${scaledWidth}px`;
            bubbleEl.style.minWidth = `${scaledWidth}px`;
            bubbleEl.style.minHeight = `${scaledHeight}px`;
            
            // Create typewriter container for text
            const typewriterEl = document.createElement('div');
            typewriterEl.id = `${bubbleEl.id}-typewriter`;
            typewriterEl.innerHTML = bubble.text || '';
            bubbleEl.appendChild(typewriterEl);
            
            // Add to container
            bubbleContainer.appendChild(bubbleEl);
            
            // Track created bubble for later bulk update
            createdBubbles.push({el: bubbleEl, bubble});
          });
          
          // Initialize ComicalJS on all bubbles after they are in the DOM
          setTimeout(() => {
            try {
              if (Comical && typeof Comical.startEditing === 'function') {
                // First activate the container
                Comical.startEditing([bubbleContainer], { isEditable: false });
                
                // Then configure each bubble individually
                createdBubbles.forEach(({el: bubbleEl, bubble}) => {
                  try {
                    if (!Bubble) return;
                    
                    const comicalBubble = new Bubble(bubbleEl);
                    
                    // Get bubble tail data
                    let tailConfig;
                    if (bubble.tailX && bubble.tailY) {
                      // If we have explicit tail coordinates
                      console.log(`Gallery: Using explicit tail position for bubble: ${bubble.tailX}, ${bubble.tailY}`);
                      tailConfig = {
                        tipX: bubble.tailX * scaleX,
                        tipY: bubble.tailY * scaleY,
                        autoCurve: true
                      };
                    } else {
                      // Create default tail based on bubble type and scaling
                      tailConfig = Bubble.makeDefaultTail ? 
                        Bubble.makeDefaultTail(bubbleEl) : 
                        { tipX: 0, tipY: 0, autoCurve: true };
                      
                      // Adjust tail position based on bubble direction if available
                      if (bubble.direction) {
                        const direction = bubble.direction;
                        const scaledX = bubble.x * scaleX;
                        const scaledY = bubble.y * scaleY;
                        const scaledWidth = bubble.width * scaleX;
                        const scaledHeight = bubble.height * scaleY;
                        
                        // Calculate the position relative to the bubble center
                        const bubbleCenterX = scaledX + (scaledWidth / 2);
                        const bubbleCenterY = scaledY + (scaledHeight / 2);
                        
                        // Offset for tail to ensure it's visible outside the bubble
                        const tailOffset = 20 * Math.min(scaleX, scaleY);
                        
                        // Position according to direction
                        if (direction === 'left') {
                          // Position on the left of the bubble
                          tailConfig.tipX = scaledX - tailOffset;
                          tailConfig.tipY = bubbleCenterY;
                        } else if (direction === 'right') {
                          // Position on the right of the bubble
                          tailConfig.tipX = scaledX + scaledWidth + tailOffset;
                          tailConfig.tipY = bubbleCenterY;
                        } else if (direction === 'top') {
                          // Position on top of the bubble
                          tailConfig.tipX = bubbleCenterX;
                          tailConfig.tipY = scaledY - tailOffset;
                        } else if (direction === 'bottom') {
                          // Position below the bubble
                          tailConfig.tipX = bubbleCenterX;
                          tailConfig.tipY = scaledY + scaledHeight + tailOffset;
                        } else {
                          // Default bottom-left position
                          tailConfig.tipX = scaledX + scaledWidth / 4;
                          tailConfig.tipY = scaledY + scaledHeight + tailOffset;
                        }
                        console.log(`Gallery: Using directional tail (${direction}) at position:`, tailConfig.tipX, tailConfig.tipY);
                      }
                    }
                    
                    // Set bubble configuration
                    console.log(`Gallery: Setting bubble spec for ${bubbleEl.id}, type=${bubble.type || 'speech'}`);
                    comicalBubble.setBubbleSpec({
                      version: "1.0",
                      style: bubble.type || 'speech',
                      tails: [tailConfig],
                      level: 2,
                      backgroundColors: ["rgba(255,255,255,1)"]
                    });
                  } catch (bubbleError) {
                    console.error("Error configuring individual bubble:", bubbleError);
                  }
                });
                
                // Final update to render all bubbles
                console.log(`Gallery: Updating ComicalJS for container with ${createdBubbles.length} bubbles`);
                Comical.update(bubbleContainer);
              } else {
                console.warn("ComicalJS not available for bubble rendering in Gallery");
              }
            } catch (error) {
              console.error("Error initializing ComicalJS in Gallery:", error);
            }
          }, 50); // Small delay to ensure DOM is ready
        } catch (error) {
          console.error("Error creating bubbles in Gallery:", error);
          
          // Fallback to canvas-based bubble drawing if ComicalJS fails
          drawing.bubbles.forEach(bubble => {
            if (!bubble) return;
            
            // Scale bubble position and size
            const scaledBubble = {
              x: bubble.x * scaleX,
              y: bubble.y * scaleY,
              width: bubble.width * scaleX,
              height: bubble.height * scaleY,
              text: bubble.text || '',
              type: bubble.type || 'speech',
              direction: bubble.direction || 'left'
            };
            
            drawBubble(ctx, scaledBubble);
          });
        }
      }
    });
    
    // Cleanup function to stop ComicalJS editing for this component when drawings change
    return () => {
      if (Comical && typeof Comical.stopEditing === 'function') {
        try {
          Comical.stopEditing();
        } catch (e) {
          console.warn("Error stopping ComicalJS editing:", e);
        }
      }
    };
  }, [drawings]);

  // Fallback function to draw a speech or thought bubble on canvas
  const drawBubble = (ctx, bubble) => {
    const { x, y, width, height, text, type = 'speech', direction = 'left' } = bubble;
    
    ctx.save();
    
    // Draw bubble background
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    
    if (type === 'speech') {
      // Speech bubble (rounded rectangle with pointer)
      const radius = 10 * Math.min(width / 150, height / 100); // Scale radius with bubble size
      
      // Rounded rectangle
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      
      // Speech pointer - based on direction
      ctx.beginPath();
      
      if (direction === 'left') {
        // Pointer on left side (default)
        ctx.moveTo(x + width / 4, y + height);
        ctx.lineTo(x + width / 4 - 15 * (width / 150), y + height + 20 * (height / 100));
        ctx.lineTo(x + width / 4 + 15 * (width / 150), y + height);
      } else if (direction === 'right') {
        // Pointer on right side
        ctx.moveTo(x + width * 3/4, y + height);
        ctx.lineTo(x + width * 3/4 + 15 * (width / 150), y + height + 20 * (height / 100));
        ctx.lineTo(x + width * 3/4 - 15 * (width / 150), y + height);
      } else if (direction === 'top') {
        // Pointer on top
        ctx.moveTo(x + width / 2, y);
        ctx.lineTo(x + width / 2, y - 20 * (height / 100));
        ctx.lineTo(x + width / 2 + 15 * (width / 150), y);
      } else if (direction === 'bottom') {
        // Pointer on bottom
        ctx.moveTo(x + width / 2, y + height);
        ctx.lineTo(x + width / 2, y + height + 20 * (height / 100));
        ctx.lineTo(x + width / 2 + 15 * (width / 150), y + height);
      }
      
      ctx.fill();
      ctx.stroke();
    } else {
      // Thought bubble (cloud-like shape)
      const centerX = x + width / 2;
      const centerY = y + height / 2;
      const radiusX = width / 2;
      const radiusY = height / 2;
      
      // Main bubble
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
      
      // Thought dots (smaller circles leading away)
      const dotCount = 3;
      
      // Position dots based on direction
      let startX, startY, xStep = 0, yStep = 0;
      
      if (direction === 'left') {
        startX = x + width / 4;
        startY = y + height;
        yStep = 8;
      } else if (direction === 'right') {
        startX = x + width * 3/4;
        startY = y + height;
        yStep = 8;
      } else if (direction === 'top') {
        startX = x + width / 2;
        startY = y;
        yStep = -8;
      } else if (direction === 'bottom') {
        startX = x + width / 2;
        startY = y + height;
        yStep = 8;
      }
      
      for (let i = 0; i < dotCount; i++) {
        const dotSize = (5 - i) * (width / 150);
        const distance = (15 + i * 8) * (height / 100);
        const dotX = startX;
        const dotY = startY + (i * yStep);
        
        ctx.beginPath();
        ctx.arc(dotX, dotY + (direction === 'top' ? -distance : distance), dotSize, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
      }
    }
    
    // Draw text inside bubble
    ctx.fillStyle = 'black';
    ctx.font = `${14 * Math.min(width / 150, height / 100)}px Comic Sans MS`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Split text into lines to fit in bubble
    const words = text.split(' ');
    const lines = [''];
    let lineIndex = 0;
    
    words.forEach(word => {
      const testLine = lines[lineIndex] + (lines[lineIndex] ? ' ' : '') + word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > width - 20 && lines[lineIndex]) {
        lineIndex++;
        lines.push(word);
      } else {
        lines[lineIndex] = testLine;
      }
    });
    
    // Position text lines in the bubble
    const lineHeight = 20 * Math.min(width / 150, height / 100);
    const totalTextHeight = lines.length * lineHeight;
    const textStartY = y + (height - totalTextHeight) / 2 + lineHeight / 2;
    
    lines.forEach((line, i) => {
      ctx.fillText(line, x + width / 2, textStartY + i * lineHeight);
    });
    
    ctx.restore();
  };

  return (
    <div className="gallery-container">
      {isJudge && (
        <h2>Vote for Your Favorite Drawing</h2>
      )}
      <div className="gallery-grid">
        {drawings.map((drawing, index) => (
          <div key={drawing?.id || index} className={`gallery-item ${drawing?.isEmpty ? 'empty-drawing' : ''}`}>
            <h3>Drawing #{index + 1}</h3>
            <div className="gallery-canvas-container">
              <canvas
                ref={el => canvasRefs.current[index] = el}
                width={400}
                height={300}
                className="gallery-canvas"
                onClick={() => isJudge && drawing && !drawing.isEmpty && onSelectDrawing(drawing)}
              />
              <div 
                ref={el => bubbleContainerRefs.current[index] = el}
                className="gallery-bubble-container"
              ></div>
            </div>
            {isJudge && (
              <button 
                className={`vote-btn ${!drawing || drawing.isEmpty ? 'disabled' : ''}`}
                onClick={() => drawing && !drawing.isEmpty && onSelectDrawing(drawing)}
                disabled={!drawing || drawing.isEmpty}
              >
                {!drawing || drawing.isEmpty ? 'No drawing to vote for' : 'Vote for this drawing'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Gallery; 