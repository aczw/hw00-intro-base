import { gl } from "../globals";
import Drawable from "../rendering/gl/Drawable";

class Cube extends Drawable {
  indices: Uint32Array;
  positions: Float32Array;
  normals: Float32Array;

  constructor() {
    super();
  }

  create(): void {
    this.indices = new Uint32Array([
      // Top (+y) face
      0, 1, 2,
      0, 2, 3,
      // Front (+z) face
      4, 5, 6,
      4, 6, 7,
      // Left (-x) face
      8, 9, 10,
      8, 10, 11,
      // Back (-z) face
      12, 13, 14,
      12, 14, 15,
      // Right (+x) face
      16, 17, 18,
      16, 18, 19,
      // Bottom (-y) face
      20, 21, 22,
      20, 22, 23
    ]);
    this.positions = new Float32Array([
      // Top (+y) face
      1, 1, 1, 1,
      1, 1, -1, 1,
      -1, 1, -1, 1,
      -1, 1, 1, 1,
      // Front (+z) face
      1, -1, 1, 1,
      1, 1, 1, 1,
      -1, 1, 1, 1,
      -1, -1, 1, 1,
      // Left (-x) face
      -1, -1, 1, 1,
      -1, 1, 1, 1,
      -1, 1, -1, 1,
      -1, -1, -1, 1,
      // Back (-z) face
      1, -1, -1, 1,
      1, 1, -1, 1,
      -1, 1, -1, 1,
      -1, -1, -1, 1,
      // Right (+x) face
      1, -1, 1, 1,
      1, 1, 1, 1,
      1, 1, -1, 1,
      1, -1, -1, 1,
      // Bottom (-y) face
      1, -1, 1, 1,
      1, -1, -1, 1,
      -1, -1, -1, 1,
      -1, -1, 1, 1,
    ]);
    this.normals = new Float32Array([
      // Top (+y) face
      0, 1, 0, 0,
      0, 1, 0, 0,
      0, 1, 0, 0,
      0, 1, 0, 0,
      // Front (+z) face
      0, 0, 1, 0,
      0, 0, 1, 0,
      0, 0, 1, 0,
      0, 0, 1, 0,
      // Left (-x) face
      -1, 0, 0, 0,
      -1, 0, 0, 0,
      -1, 0, 0, 0,
      -1, 0, 0, 0,
      // Back (-z) face
      0, 0, -1, 0,
      0, 0, -1, 0,
      0, 0, -1, 0,
      0, 0, -1, 0,
      // Right (+x) face
      1, 0, 0, 0,
      1, 0, 0, 0,
      1, 0, 0, 0,
      1, 0, 0, 0,
      // Bottom (-y) face
      0, -1, 0, 0,
      0, -1, 0, 0,
      0, -1, 0, 0,
      0, -1, 0, 0,
    ]);

    this.generateIdx();
    this.generatePos();
    this.generateNor();

    this.count = this.indices.length;

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
    gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufNor);
    gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.STATIC_DRAW);

    console.log("Created sphere!")
  }
}

export default Cube;