// Get the canvas and context
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Set initial drawing properties
let currentColor = 'black';
let drawing = false;
let currentPath = [];
let currentWidth = 1; // Default line width

// Store all drawing paths
let paths = [];

// Handle mouse events for drawing
canvas.addEventListener('mousedown', (e) => {
    drawing = true;
    currentPath = []; // Start a new path
    addPointToPath(e);
});

canvas.addEventListener('mousemove', (e) => {
    if (drawing) {
        addPointToPath(e);
        redrawCanvas();
    }
});

canvas.addEventListener('mouseup', () => {
    drawing = false;
    if (currentPath.length > 0) {
        paths.push({
            color: currentColor,
            width: currentWidth, // Store the width of the stroke
            path: currentPath
        });
    }
});

// Function to add point to the current path
function addPointToPath(e) {
    const mouseX = e.offsetX;
    const mouseY = e.offsetY;
    currentPath.push([mouseX, mouseY]);
}

// Function to redraw all paths on the canvas
function redrawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
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
    // Draw the current path (while drawing)
    if (currentPath.length > 0) {
        ctx.beginPath();
        ctx.moveTo(currentPath[0][0], currentPath[0][1]);
        for (let i = 1; i < currentPath.length; i++) {
            ctx.lineTo(currentPath[i][0], currentPath[i][1]);
        }
        ctx.strokeStyle = currentColor;
        ctx.lineWidth = currentWidth; // Set current stroke width
        ctx.stroke();
    }
}

// Handle color change via buttons
document.getElementById('blackBtn').addEventListener('click', () => {
    currentColor = 'black';
});
document.getElementById('redBtn').addEventListener('click', () => {
    currentColor = 'red';
});
document.getElementById('blueBtn').addEventListener('click', () => {
    currentColor = 'blue';
});
document.getElementById('orangeBtn').addEventListener('click', () => {
    currentColor = 'orange';
});
document.getElementById('yellowBtn').addEventListener('click', () => {
    currentColor = 'yellow';
});
document.getElementById('greenBtn').addEventListener('click', () => {
    currentColor = 'green';
});
document.getElementById('purpleBtn').addEventListener('click', () => {
    currentColor = 'purple';
});
document.getElementById('pinkBtn').addEventListener('click', () => {
    currentColor = 'pink';
});
document.getElementById('greyBtn').addEventListener('click', () => {
    currentColor = 'grey';
});

// Handle stroke width change
document.getElementById('width1').addEventListener('click', () => {
    currentWidth = 1;
});
document.getElementById('width5').addEventListener('click', () => {
    currentWidth = 5;
});
document.getElementById('width10').addEventListener('click', () => {
    currentWidth = 10;
});
document.getElementById('width15').addEventListener('click', () => {
    currentWidth = 15;
});