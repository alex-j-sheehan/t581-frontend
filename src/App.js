import React, { useRef, useState, useEffect } from 'react';
import Gallery from './components/Gallery';
import WinnersGallery from './components/WinnersGallery';
import EndPage from './components/EndPage';
import { getRandomDrawings } from './data/sampleDrawings';

const App = () => {
    // Drawing state
    const canvasRef = useRef(null);
    const [currentColor, setCurrentColor] = useState('black');
    const [currentWidth, setCurrentWidth] = useState(1);
    const [paths, setPaths] = useState([]);
    const [currentPath, setCurrentPath] = useState([]);
    const [isDrawing, setIsDrawing] = useState(false);
    
    // App state
    const [currentScreen, setCurrentScreen] = useState('drawing'); // 'drawing', 'voting', or 'end'
    const [userDrawing, setUserDrawing] = useState(null);
    const [galleryDrawings, setGalleryDrawings] = useState([]);
    const [winners, setWinners] = useState([]); // Track winning drawings

    const colors = {
        black: 'black',
        red: 'red',
        blue: 'blue',
        orange: 'orange',
        yellow: 'yellow',
        green: 'green',
        purple: 'purple',
        pink: 'pink',
        grey: 'grey'
    };

    const widths = [1, 5, 10, 15];

    // Load random drawings for the gallery
    useEffect(() => {
        if (currentScreen === 'voting') {
            // Get 5 random drawings from our sample data
            const randomDrawings = getRandomDrawings(5);
            setGalleryDrawings(randomDrawings);
        }
    }, [currentScreen]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        const redrawCanvas = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw all completed paths
            paths.forEach((path) => {
                ctx.beginPath();
                ctx.moveTo(path.path[0][0], path.path[0][1]);
                for (let i = 1; i < path.path.length; i++) {
                    ctx.lineTo(path.path[i][0], path.path[i][1]);
                }
                ctx.strokeStyle = path.color;
                ctx.lineWidth = path.width;
                ctx.stroke();
            });

            // Draw current path
            if (currentPath.length > 0) {
                ctx.beginPath();
                ctx.moveTo(currentPath[0][0], currentPath[0][1]);
                for (let i = 1; i < currentPath.length; i++) {
                    ctx.lineTo(currentPath[i][0], currentPath[i][1]);
                }
                ctx.strokeStyle = currentColor;
                ctx.lineWidth = currentWidth;
                ctx.stroke();
            }
        };

        redrawCanvas();
    }, [paths, currentPath, currentColor, currentWidth]);

    const handleMouseDown = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        setIsDrawing(true);
        setCurrentPath([[x, y]]);
    };

    const handleMouseMove = (e) => {
        if (!isDrawing) return;
        
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        setCurrentPath(prev => [...prev, [x, y]]);
    };

    const handleMouseUp = () => {
        if (currentPath.length > 0) {
            setPaths(prev => [...prev, {
                color: currentColor,
                width: currentWidth,
                path: currentPath
            }]);
        }
        setIsDrawing(false);
        setCurrentPath([]);
    };

    const handleUndo = () => {
        if (paths.length > 0) {
            setPaths(prev => prev.slice(0, -1));
        }
    };

    const handleSubmit = () => {
        if (paths.length > 0) {
            // Create a drawing object with a random ID
            const drawing = {
                id: Math.floor(Math.random() * 10000),
                title: "Your Drawing",
                paths: [...paths],
                canvasWidth: 800,  // Store the original canvas dimensions
                canvasHeight: 600
            };
            
            setUserDrawing(drawing);
            setCurrentScreen('voting');
        }
    };

    const handleSelectDrawing = (drawing) => {
        // Add the selected drawing to winners
        const newWinners = [...winners, drawing];
        setWinners(newWinners);
        
        // Check if we've reached 6 panels
        if (newWinners.length >= 6) {
            setCurrentScreen('end');
            return;
        }
        
        // Reset the drawing state
        setPaths([]);
        setCurrentPath([]);
        setCurrentColor('black');
        setCurrentWidth(1);
        setUserDrawing(null);
        
        // Go back to drawing screen
        setCurrentScreen('drawing');
    };

    // Render the drawing screen
    const renderDrawingScreen = () => (
        <div>
            <h1>Drawing App</h1>
            <WinnersGallery winners={winners} />
            <div className="controls">
                {Object.entries(colors).map(([name, color]) => (
                    <button
                        key={name}
                        className="color-btn"
                        style={{ backgroundColor: color }}
                        onClick={() => setCurrentColor(color)}
                    />
                ))}
            </div>
            <div className="controls">
                {widths.map(width => (
                    <button
                        key={width}
                        className={`width-btn ${currentWidth === width ? 'active' : ''}`}
                        onClick={() => setCurrentWidth(width)}
                    >
                        {width}px
                    </button>
                ))}
            </div>
            <div className="controls">
                <button 
                    className="undo-btn"
                    onClick={handleUndo}
                    disabled={paths.length === 0}
                >
                    Undo
                </button>
                <button 
                    className="submit-btn"
                    onClick={handleSubmit}
                    disabled={paths.length === 0}
                >
                    Submit Drawing
                </button>
            </div>
            <canvas
                ref={canvasRef}
                width={800}
                height={600}
                className="canvas-container"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            />
        </div>
    );

    // Render the voting screen
    const renderVotingScreen = () => {
        // Combine user's drawing with random drawings
        const allDrawings = userDrawing 
            ? [userDrawing, ...galleryDrawings] 
            : galleryDrawings;
            
        return (
            <Gallery 
                drawings={allDrawings} 
                onSelectDrawing={handleSelectDrawing} 
            />
        );
    };

    // Render the end screen
    const renderEndScreen = () => {
        return <EndPage winners={winners} />;
    };

    return (
        <div className="app-container">
            {currentScreen === 'drawing' && renderDrawingScreen()}
            {currentScreen === 'voting' && renderVotingScreen()}
            {currentScreen === 'end' && renderEndScreen()}
        </div>
    );
};

export default App; 