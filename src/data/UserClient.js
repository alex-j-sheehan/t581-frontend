import User from './User';
import { getRandomDrawings } from './sampleDrawings';

// Import avatar SVGs directly
import avatar1 from '../../public/imgs/llg_avatar_1.svg';
import avatar2 from '../../public/imgs/llg_avatar_2.svg';
import avatar3 from '../../public/imgs/llg_avatar_3.svg';
import avatar4 from '../../public/imgs/llg_avatar_4.svg';
import avatar5 from '../../public/imgs/llg_avatar_5.svg';
import avatar6 from '../../public/imgs/llg_avatar_6.svg';
import avatar7 from '../../public/imgs/llg_avatar_7.svg';
import avatar8 from '../../public/imgs/llg_avatar_8.svg';

class UserClient {
  constructor() {
    this.users = [];
    this.currentUser = null;
    this.currentJudge = null;
    this.avatars = [
      avatar1,
      avatar2,
      avatar3,
      avatar4,
      avatar5,
      avatar6,
      avatar7,
      avatar8
    ];
  }

  // Mock function to generate random users
  generateRandomUsers() {
    const numUsers = Math.floor(Math.random() * 4) + 4; // Random number between 4-7
    const mockNames = ['Alice', 'Bob', 'Charlie', 'David', 'Eve', 'Frank', 'Grace'];
    
    this.users = [];
    for (let i = 0; i < numUsers; i++) {
      const user = new User(i, mockNames[i]);
      // Assign an avatar based on user ID to ensure consistency
      const avatarIndex = i % this.avatars.length;
      user.setAvatar(this.avatars[avatarIndex]);
      this.users.push(user);
    }
    return this.users;
  }

  setCurrentUser(user) {
    this.currentUser = user;
    // If the current user doesn't have an avatar, assign one
    if (user && !user.avatar) {
      // Find an unused avatar or use the first one if all are taken
      const usedAvatars = this.users.map(u => u.avatar);
      const availableAvatar = this.avatars.find(a => !usedAvatars.includes(a)) || this.avatars[0];
      user.setAvatar(availableAvatar);
    }
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
    console.log("Random judge selection: Math.random() < 0.5 =", isCurrentUserJudge);
    
    if (isCurrentUserJudge && this.currentUser) {
      this.currentUser.setJudge(true);
      this.currentJudge = this.currentUser;
      console.log("Current user is judge:", this.currentUser.name);
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
        console.log("Fallback: Current user is judge:", this.currentUser.name);
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
    // Clear current judge
    this.currentJudge = null;
    
    // Save the current user's avatar before resetting
    const currentUserAvatar = this.currentUser?.avatar;
    
    // Create a new current user with the same name but preserve their avatar
    if (this.currentUser) {
      const userName = this.currentUser.name;
      this.currentUser = new User(0, userName);
      this.currentUser.setAvatar(currentUserAvatar);
    }
    
    // Generate new random users
    this.generateRandomUsers();
    return this.users;
  }
}

export default new UserClient(); // Export a singleton instance 