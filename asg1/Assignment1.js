// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'uniform float u_Size;\n' +
    'uniform float u_Segment;\n' +
    'void main() {\n' +
    '  gl_Position = a_Position;\n' +
    '  gl_PointSize = u_Size;\n' +
    '}\n';

// Fragment shader program
var FSHADER_SOURCE =
    'precision mediump float;\n' +
    'uniform vec4 u_FragColor;\n' +
    'void main() {\n' +
    '  gl_FragColor = u_FragColor;\n' +
    '}\n';

const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// Global Variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;

let g_selectedColor = [0.0, 0.0, 0.0, 1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_selectedSegment = 5;

function setupWebGL() {
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    //gl = getWebGLContext(canvas);
    gl = canvas.getContext("webgl", {preserveDrawingBuffer: true});
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
}

function connectVariablesToGLSL() {
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    // // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }

    // Get the storage location of u_Size
    u_Size = gl.getUniformLocation(gl.program, 'u_Size');
    if (!u_Size) {
        console.log('Failed to get the storage location of u_Size');
        return;
    }
}

function addActionsFromHtmlUI() {
    document.getElementById("clean").onclick = function () {g_shapeLists = []; renderAllShapes();};

    document.getElementById("square").onclick = function () {g_selectedType = POINT;};
    document.getElementById("triangle").onclick = function () {g_selectedType = TRIANGLE;};
    document.getElementById("circle").onclick = function () {g_selectedType = CIRCLE;};
    document.getElementById("selfPainting").onclick = function () {show();};


    document.getElementById("redSlider").addEventListener('mouseup', function () {g_selectedColor[0] = this.value / 100;});
    document.getElementById("greenSlider").addEventListener('mouseup', function () {g_selectedColor[1] = this.value / 100;});
    document.getElementById("blueSlider").addEventListener('mouseup', function () {g_selectedColor[2] = this.value / 100;});

    document.getElementById("shapeSize").addEventListener('mouseup', function () {g_selectedSize = this.value;});
    document.getElementById("segments").addEventListener('mouseup', function () {g_selectedSegment = this.value;});
}

function main() {
    setupWebGL();

    connectVariablesToGLSL();

    addActionsFromHtmlUI();

    // Register function (event handler) to be called on a mouse press
    canvas.onmousedown = click;

    canvas.onmousemove = function (ev) {if (ev.buttons === 1) {click(ev);}};

    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_shapeLists = [];

//var g_points = [];  // The array for the position of a mouse press
//var g_colors = [];  // The array to store the color of a point
//var g_sizes = [];

function show() {
    g_shapeLists = [];
    renderAllShapes();

    let s = new SelfPainting();

    //g_shapeLists.push(c);
    g_shapeLists.push(s);
    renderAllShapes();
}

function click(ev) {
    let [x, y] = convertCoordinatesEventsToGL(ev);

    let point;

    if (g_selectedType === POINT) {
        point = new Point();
    } else if (g_selectedType === TRIANGLE) {
        point = new Triangle();
    } else {
        point = new Circle();
        point.segments = g_selectedSegment;
    }

    point.position = [x, y];
    point.color = g_selectedColor.slice();
    point.size = g_selectedSize;
    g_shapeLists.push(point);

    // Store the coordinates to g_points array
    //g_points.push([x, y]);

    //g_colors.push(g_selectedColor.slice());

    //g_sizes.push(g_selectedSize);

    //if (x >= 0.0 && y >= 0.0) {      // First quadrant
    //    g_colors.push([1.0, 0.0, 0.0, 1.0]);  // Red
    //} else if (x < 0.0 && y < 0.0) { // Third quadrant
    //    g_colors.push([0.0, 1.0, 0.0, 1.0]);  // Green
    //} else {                         // Others
    //    g_colors.push([1.0, 1.0, 1.0, 1.0]);  // White
    //}

    renderAllShapes();
}

function convertCoordinatesEventsToGL(ev) {
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

    return([x, y]);
}

function renderAllShapes() {
    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);

    var len = g_shapeLists.length;
    for(var i = 0; i < len; i++) {
        g_shapeLists[i].render();
    }
}
