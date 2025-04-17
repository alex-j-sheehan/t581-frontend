class User {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.drawing = null;
  }

  setDrawing(drawing) {
    this.drawing = drawing;
  }
}

export default User; 