import User from './User';
import { getRandomDrawings } from './sampleDrawings';

class UserClient {
  constructor() {
    this.users = [];
    this.currentUser = null;
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
}

export default new UserClient(); // Export a singleton instance 