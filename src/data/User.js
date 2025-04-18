class User {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.drawing = null;
    this.isJudge = false;
  }

  setDrawing(drawing) {
    this.drawing = drawing;
  }

  setJudge(isJudge) {
    this.isJudge = isJudge;
  }
}

export default User; 