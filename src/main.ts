import {vec3, vec4} from 'gl-matrix';
const Stats = require('stats-js');
import * as DAT from 'dat.gui';
import Icosphere from './geometry/Icosphere';
import Square from './geometry/Square';
import Cube from './geometry/Cube';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import type Drawable from './rendering/gl/Drawable';

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  geometry: "cube - custom",
  'color1': [31, 115, 210, 1],
  tesselations: 5,
  numCells: 3,
  foamSpeed: 2.5,
  foamRoughness: 0.3
};

let icosphere: Icosphere;
let square: Square;
let cube: Cube;
let prevTesselations: number = 5;

function loadScene() {
  icosphere = new Icosphere(vec3.fromValues(0, 0, 0), 1, controls.tesselations);
  icosphere.create();
  square = new Square(vec3.fromValues(0, 0, 0));
  square.create();
  cube = new Cube();
  cube.create();
}

function setupControls() {
  const gui = new DAT.GUI();
  gui.width = 320;

  gui.add(controls, "geometry", ["icosphere", "square", "cube - regular", "cube - custom"]);
  gui.addColor(controls, 'color1');
  gui.add(controls, "numCells", 1, 10).step(1);
  gui.add(controls, "foamSpeed", 1, 10).step(0.1);
  gui.add(controls, "foamRoughness", 0.0, 1.0, 0.1);
  gui.add(controls, 'tesselations', 0, 8).step(1);
}

function main() {
  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  // Add controls to the gui
  setupControls();

  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  // Initial call to load scene
  loadScene();

  const camera = new Camera(vec3.fromValues(0, 0, 5), vec3.fromValues(0, 0, 0));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.2, 0.2, 0.2, 1);
  gl.enable(gl.DEPTH_TEST);

  const lambertProg = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/lambert-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/lambert-frag.glsl')),
  ]);

  const cubeProg = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/cube.vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/cube.frag.glsl')),
  ]);

  let time = 0;

  // This function will be called every frame
  function tick() {
    camera.update();
    stats.begin();
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();

    if(controls.tesselations != prevTesselations)
    {
      prevTesselations = controls.tesselations;
      icosphere = new Icosphere(vec3.fromValues(0, 0, 0), 1, prevTesselations);
      icosphere.create();
    }

    const geometryColor = vec4.fromValues(
      controls.color1[0] / 255,
      controls.color1[1] / 255,
      controls.color1[2] / 255,
      controls.color1[3]
    );

    let shaderProgram = lambertProg;
    if (controls.geometry === "cube - custom") {
      shaderProgram = cubeProg;
      shaderProgram.setNumCells(controls.numCells);
      shaderProgram.setFoamSpeed(controls.foamSpeed);
      shaderProgram.setFoamRoughness(controls.foamRoughness);
    }
    shaderProgram.setGeometryColor(geometryColor);
    shaderProgram.setTime(time);
    
    let geometry: Drawable = cube;
    if (controls.geometry === "icosphere") geometry = icosphere;
    if (controls.geometry === "square") geometry = square;
    renderer.render(camera, shaderProgram, [geometry]);

    stats.end();
    time += 1;

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();

  // Start the render loop
  tick();
}

main();
