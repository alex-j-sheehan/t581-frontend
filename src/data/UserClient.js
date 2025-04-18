import User from './User';
import { getRandomDrawings } from './sampleDrawings';

class UserClient {
  constructor() {
    this.users = [];
    this.currentUser = null;
    this.currentJudge = null;
  }

  // Mock function to generate random users
  generateRandomUsers() {
    const numUsers = Math.floor(Math.random() * 4) + 4; // Random number between 4-7
    const mockNames = ['Alice', 'Bob', 'Charlie', 'David', 'Eve', 'Frank', 'Grace'];
    
    this.users = [];
    for (let i = 0; i < numUsers; i++) {
      this.users.push(new User(i, mockNames[i]));
    }
    return this.users;
  }

  setCurrentUser(user) {
    this.currentUser = user;
  }

  getCurrentUser() {
    return this.currentUser;
  }

  getAllUsers() {
    return this.users;
  }

  // Get the current judge
  getCurrentJudge() {
    return this.currentJudge;
  }

  // Select a random judge (50/50 chance for current user)
  selectRandomJudge() {
    // Reset all users to not be judge
    this.users.forEach(user => user.setJudge(false));
    if (this.currentUser) {
      this.currentUser.setJudge(false);
    }
    
    // 50/50 chance for current user to be judge
    const isCurrentUserJudge = Math.random() < 0.2;
    
    if (isCurrentUserJudge && this.currentUser) {
      this.currentUser.setJudge(true);
      this.currentJudge = this.currentUser;
      console.log("Current user is judge");
    } else {
      // Select a random mock user as judge
      const mockUsers = this.users.filter(user => user !== this.currentUser);
      if (mockUsers.length > 0) {
        const randomIndex = Math.floor(Math.random() * mockUsers.length);
        mockUsers[randomIndex].setJudge(true);
        this.currentJudge = mockUsers[randomIndex];
        console.log("Mock user is judge:", this.currentJudge.name);
      } else {
        // Fallback if no mock users
        this.currentUser.setJudge(true);
        this.currentJudge = this.currentUser;
        console.log("Fallback: Current user is judge");
      }
    }
    
    return this.currentJudge;
  }

  // Assign a drawing to a user
  assignDrawingToUser(userId, drawing) {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.setDrawing(drawing);
    }
  }

  // Generate mock drawings for all users except current user
  generateMockDrawings() {
    // Get random drawings for each user
    const randomDrawings = getRandomDrawings(this.users.length);
    
    this.users.forEach((user, index) => {
      if (user.id !== this.currentUser?.id) {
        // Use a sample drawing but update the title to show who drew it
        const mockDrawing = {
          ...randomDrawings[index],
          title: `${user.name}'s painting`,
          id: Math.random() // Ensure unique ID
        };
        user.setDrawing(mockDrawing);
      }
    });
  }

  // Mock function to simulate fetching users from a server
  async fetchUsers() {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    this.generateRandomUsers();
    this.generateMockDrawings();
    return this.users;
  }
  
  // Reset all users' state for a new game
  resetAllUsers() {
    // Clear current users
    this.users = [];
    // Clear current user
    this.currentUser = null;
    // Clear current judge
    this.currentJudge = null;
    // Generate new random users
    this.generateRandomUsers();
    return this.users;
  }
}

export default new UserClient(); // Export a singleton instance 