class User {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.drawing = null;
    this.isJudge = false;
    this.avatar = null; // Path to the user's avatar image
  }

  setDrawing(drawing) {
    this.drawing = drawing;
  }

  setJudge(isJudge) {
    this.isJudge = isJudge;
  }

  setAvatar(avatarPath) {
    this.avatar = avatarPath;
  }
}

export default User; 