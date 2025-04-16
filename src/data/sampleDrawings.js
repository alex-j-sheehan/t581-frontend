// Sample drawings data
const sampleDrawings = [
  {
    id: 1,
    title: "Sunset Over Mountains",
    canvasWidth: 800,
    canvasHeight: 600,
    paths: [
      {
        color: "orange",
        width: 5,
        path: [[100, 300], [200, 200], [300, 250], [400, 150], [500, 200]]
      },
      {
        color: "blue",
        width: 3,
        path: [[150, 350], [250, 250], [350, 300], [450, 200], [550, 250]]
      },
      {
        color: "purple",
        width: 2,
        path: [[200, 400], [300, 300], [400, 350], [500, 250], [600, 300]]
      }
    ]
  },
  {
    id: 2,
    title: "Abstract Flowers",
    canvasWidth: 800,
    canvasHeight: 600,
    paths: [
      {
        color: "pink",
        width: 4,
        path: [[200, 200], [250, 150], [300, 200], [250, 250], [200, 200]]
      },
      {
        color: "green",
        width: 2,
        path: [[250, 250], [250, 350]]
      },
      {
        color: "yellow",
        width: 3,
        path: [[300, 300], [350, 250], [400, 300], [350, 350], [300, 300]]
      }
    ]
  },
  {
    id: 3,
    title: "City Skyline",
    canvasWidth: 800,
    canvasHeight: 600,
    paths: [
      {
        color: "black",
        width: 3,
        path: [[100, 400], [100, 200], [150, 250], [200, 150], [250, 300], [300, 100], [350, 350], [400, 200], [450, 250], [500, 150], [500, 400]]
      },
      {
        color: "yellow",
        width: 2,
        path: [[150, 180], [200, 180], [250, 180], [300, 180], [350, 180], [400, 180], [450, 180]]
      }
    ]
  },
  {
    id: 4,
    title: "Ocean Waves",
    canvasWidth: 800,
    canvasHeight: 600,
    paths: [
      {
        color: "blue",
        width: 4,
        path: [[100, 300], [200, 250], [300, 350], [400, 200], [500, 300], [600, 250]]
      },
      {
        color: "blue",
        width: 3,
        path: [[150, 350], [250, 300], [350, 400], [450, 250], [550, 350], [650, 300]]
      }
    ]
  },
  {
    id: 5,
    title: "Rainbow",
    canvasWidth: 800,
    canvasHeight: 600,
    paths: [
      {
        color: "red",
        width: 5,
        path: [[100, 300], [200, 250], [300, 200], [400, 150], [500, 200], [600, 250], [700, 300]]
      },
      {
        color: "orange",
        width: 5,
        path: [[100, 320], [200, 270], [300, 220], [400, 170], [500, 220], [600, 270], [700, 320]]
      },
      {
        color: "yellow",
        width: 5,
        path: [[100, 340], [200, 290], [300, 240], [400, 190], [500, 240], [600, 290], [700, 340]]
      },
      {
        color: "green",
        width: 5,
        path: [[100, 360], [200, 310], [300, 260], [400, 210], [500, 260], [600, 310], [700, 360]]
      },
      {
        color: "blue",
        width: 5,
        path: [[100, 380], [200, 330], [300, 280], [400, 230], [500, 280], [600, 330], [700, 380]]
      },
      {
        color: "purple",
        width: 5,
        path: [[100, 400], [200, 350], [300, 300], [400, 250], [500, 300], [600, 350], [700, 400]]
      }
    ]
  },
  {
    id: 6,
    title: "Tree",
    canvasWidth: 800,
    canvasHeight: 600,
    paths: [
      {
        color: "brown",
        width: 4,
        path: [[400, 400], [400, 300]]
      },
      {
        color: "green",
        width: 5,
        path: [[400, 300], [300, 200], [400, 250], [500, 150], [400, 200], [300, 100], [400, 150], [500, 50], [400, 100]]
      }
    ]
  },
  {
    id: 7,
    title: "Butterfly",
    canvasWidth: 800,
    canvasHeight: 600,
    paths: [
      {
        color: "purple",
        width: 3,
        path: [[300, 300], [400, 200], [500, 300], [400, 400], [300, 300]]
      },
      {
        color: "pink",
        width: 2,
        path: [[300, 300], [200, 200], [300, 300], [200, 400], [300, 300]]
      },
      {
        color: "black",
        width: 1,
        path: [[400, 300], [400, 350]]
      }
    ]
  },
  {
    id: 8,
    title: "House",
    canvasWidth: 800,
    canvasHeight: 600,
    paths: [
      {
        color: "brown",
        width: 4,
        path: [[300, 400], [300, 200], [500, 200], [500, 400], [300, 400]]
      },
      {
        color: "red",
        width: 4,
        path: [[300, 200], [400, 100], [500, 200]]
      },
      {
        color: "blue",
        width: 3,
        path: [[350, 300], [450, 300], [450, 350], [350, 350], [350, 300]]
      }
    ]
  },
  {
    id: 9,
    title: "Star",
    canvasWidth: 800,
    canvasHeight: 600,
    paths: [
      {
        color: "yellow",
        width: 3,
        path: [[400, 100], [450, 250], [600, 250], [500, 350], [550, 500], [400, 400], [250, 500], [300, 350], [200, 250], [350, 250], [400, 100]]
      }
    ]
  },
  {
    id: 10,
    title: "Heart",
    canvasWidth: 800,
    canvasHeight: 600,
    paths: [
      {
        color: "red",
        width: 4,
        path: [[400, 300], [300, 200], [200, 300], [300, 400], [400, 300], [500, 400], [600, 300], [500, 200], [400, 300]]
      }
    ]
  }
];

// Function to get random drawings
export const getRandomDrawings = (count) => {
  const shuffled = [...sampleDrawings].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export default sampleDrawings; 