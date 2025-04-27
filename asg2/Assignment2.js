// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'uniform mat4 u_ModelMatrix;\n' +
    'uniform mat4 u_GlobalRotateMatrix;\n' +
    'void main() {\n' +
    '' +
    '  gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;\n' +
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
let u_ModelMatrix;
let u_GlobalRotateMatrix;

let g_selectedColor = [0.0, 0.0, 0.0, 1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_selectedSegment = 5;
let g_globalAngle = 0;
let g_bodyInandOutAngle = 0;
let g_LLP1LRAngle = 0;
let g_LLP2IOAngle = 0;
let g_RLP1LRAngle = 0;
let g_RLP2IOAngle = 0;
let g_leftFootAngle = 0;
let g_rightFootAngle = 0;
let g_headAngle = 0;
let g_leftArmAngle = 0;
let g_rightArmAngle = 0;

let g_headAnimation = false;
let g_bodyAnimation = false;
let g_leftArmAnimation = false;
let g_rightArmAnimation = false;
let g_LLP1Animation = false;
let g_LLP2Animation = false;
let g_leftFootAnimation = false;
let g_RLP1Animation = false;
let g_RLP2Animation = false;
let g_rightFootAnimation = false;

let g_poke = false;

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

    gl.enable(gl.DEPTH_TEST);
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

    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
        console.log('Failed to get the storage location of u_ModelMatrix');
        return;
    }

    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if (!u_GlobalRotateMatrix) {
        console.log('Failed to get the storage location of u_GlobalRotateMatrix');
        return;
    }

    // Get the storage location of u_Size
    /* u_Size = gl.getUniformLocation(gl.program, 'u_Size');
    if (!u_Size) {
        console.log('Failed to get the storage location of u_Size');
        return;
    } */

    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

function addActionsFromHtmlUI() {
    const button = document.getElementById("poke");
    button.addEventListener('click', function(event) {
        if (event.shiftKey) {
            g_poke = true;
        } else {
            g_poke = false;
        }
    });
    document.getElementById("unpoke").onclick = function () {g_poke = false;};
    document.getElementById("headOff").onclick = function () {g_headAnimation = false;};
    document.getElementById("headOn").onclick = function () {g_headAnimation = true;};
    document.getElementById("bodyOff").onclick = function () {g_bodyAnimation = false;};
    document.getElementById("bodyOn").onclick = function () {g_bodyAnimation = true;};
    document.getElementById("leftArmOff").onclick = function () {g_leftArmAnimation = false;};
    document.getElementById("leftArmOn").onclick = function () {g_leftArmAnimation = true;};
    document.getElementById("rightArmOff").onclick = function () {g_rightArmAnimation = false;};
    document.getElementById("rightArmOn").onclick = function () {g_rightArmAnimation = true;};

    document.getElementById("LLP1Off").onclick = function () {g_LLP1Animation = false;};
    document.getElementById("LLP1On").onclick = function () {g_LLP1Animation = true;};

    document.getElementById("LLP2Off").onclick = function () {g_LLP2Animation = false;};
    document.getElementById("LLP2On").onclick = function () {g_LLP2Animation = true;};

    document.getElementById("leftFootOff").onclick = function () {g_leftFootAnimation = false;};
    document.getElementById("leftFootOn").onclick = function () {g_leftFootAnimation = true;};

    document.getElementById("RLP1Off").onclick = function () {g_RLP1Animation = false;};
    document.getElementById("RLP1On").onclick = function () {g_RLP1Animation = true;};
    document.getElementById("RLP2Off").onclick = function () {g_RLP2Animation = false;};
    document.getElementById("RLP2On").onclick = function () {g_RLP2Animation = true;};
    document.getElementById("rightFootOff").onclick = function () {g_rightFootAnimation = false;};
    document.getElementById("rightFootOn").onclick = function () {g_rightFootAnimation = true;};
    //document.getElementById("clean").onclick = function () {g_shapeLists = []; renderAllShapes();};

    /* document.getElementById("square").onclick = function () {g_selectedType = POINT;};
    document.getElementById("triangle").onclick = function () {g_selectedType = TRIANGLE;};
    document.getElementById("circle").onclick = function () {g_selectedType = CIRCLE;};


    document.getElementById("redSlider").addEventListener('mouseup', function () {g_selectedColor[0] = this.value / 100;});
    document.getElementById("greenSlider").addEventListener('mouseup', function () {g_selectedColor[1] = this.value / 100;});
    document.getElementById("blueSlider").addEventListener('mouseup', function () {g_selectedColor[2] = this.value / 100;});

    document.getElementById("shapeSize").addEventListener('mouseup', function () {g_selectedSize = this.value;});
    document.getElementById("segments").addEventListener('mouseup', function () {g_selectedSegment = this.value;}); */

    //document.getElementById("angleSlide").addEventListener('mouseup', function () {g_globalAngle = this.value; renderAllShapes();});
    document.getElementById("leftArmSlide").addEventListener('mousemove', function () {g_leftArmAngle = this.value; renderAllShapes();});
    document.getElementById("rightArmSlide").addEventListener('mousemove', function () {g_rightArmAngle = this.value; renderAllShapes();});
    document.getElementById("angleSlide").addEventListener('mousemove', function () {g_globalAngle = this.value; renderAllShapes();});
    document.getElementById("headSlide").addEventListener('mousemove', function () {g_headAngle = this.value; renderAllShapes();});
    document.getElementById("bodyInandOutSlide").addEventListener('mousemove', function () {g_bodyInandOutAngle = this.value; renderAllShapes();});
    document.getElementById("LLP2IOSlide").addEventListener('mousemove', function () {g_LLP2IOAngle = this.value; renderAllShapes();});
    document.getElementById("LLP1LRSlide").addEventListener('mousemove', function () {g_LLP1LRAngle = this.value; renderAllShapes();});
    document.getElementById("RLP2IOSlide").addEventListener('mousemove', function () {g_RLP2IOAngle = this.value; renderAllShapes();});
    document.getElementById("RLP1LRSlide").addEventListener('mousemove', function () {g_RLP1LRAngle = this.value; renderAllShapes();});
    document.getElementById("leftFootSlide").addEventListener('mousemove', function () {g_leftFootAngle = this.value; renderAllShapes();});
    document.getElementById("rightFootSlide").addEventListener('mousemove', function () {g_rightFootAngle = this.value; renderAllShapes();});
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

    requestAnimationFrame(tick);
}

function show() {

    gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_startTime = performance.now() / 1000;
var g_seconds = performance.now() / 1000 - g_startTime;

function tick() {
    g_seconds = performance.now() / 1000 - g_startTime;
    //console.log(performance.now());
    updateAnimationAngles();

    renderAllShapes();

    requestAnimationFrame(tick);
}

function updateAnimationAngles() {
    if (g_bodyAnimation) {
        g_bodyInandOutAngle = 45 * Math.sin(g_seconds);
    }

    if (g_headAnimation) {
        g_headAngle = 45 * Math.sin(2 * g_seconds);
    }
    
    if (g_leftArmAnimation) {
        g_leftArmAngle = 45 * Math.sin(g_seconds);
    }

    if (g_rightArmAnimation) {
        g_rightArmAngle = 45 * Math.sin(g_seconds);
    }
    
    if (g_LLP1Animation) {
        g_LLP1LRAngle = 45 * Math.sin(g_seconds);
    }

    if (g_LLP2Animation) {
        g_LLP2IOAngle = 45 * Math.sin(g_seconds);
    }

    if (g_leftFootAnimation) {
        g_leftFootAngle = 45 * Math.sin(g_seconds);
    }

    if (g_RLP1Animation) {
        g_RLP1LRAngle = 45 * Math.sin(g_seconds);
    }

    if (g_RLP2Animation) {
        g_RLP2IOAngle = 45 * Math.sin(g_seconds);
    }

    if (g_rightFootAnimation) {
        g_rightFootAngle = 45 * Math.sin(g_seconds);
    }
}

var g_shapeLists = [];

//var g_points = [];  // The array for the position of a mouse press
//var g_colors = [];  // The array to store the color of a point
//var g_sizes = [];

/* function show() {
    g_shapeLists = [];
    renderAllShapes();

    let s = new SelfPainting();

    //g_shapeLists.push(c);
    g_shapeLists.push(s);
    renderAllShapes();
} */

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
    var startTime = performance.now();

    var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clear(gl.COLOR_BUFFER_BIT);

    /* var len = g_shapeLists.length;
    for(var i = 0; i < len; i++) {
        g_shapeLists[i].render();
    } */

    if (g_poke) {
        var poke1 = new Cube([1.0, 0.0, 0.0, 1.0]);
        poke1.matrix.translate(0, 0, -0.25);
        poke1.matrix.scale(0.5, 0.8, 0.1)
        poke1.matrix.rotate(90, 1, 0, 0);
        poke1.matrix.rotate(45 * Math.sin(g_seconds), 1, 0, 0);
        poke1.render();

        var poke2 = new Cube([1.0, 1.0, 0.0, 1.0]);
        poke2.matrix.translate(-0.8, -0.5, 0.7);
        poke2.matrix.scale(0.2, 0.9, 0.1)
        poke2.matrix.rotate(76, 0, 1, 0);
        poke2.matrix.rotate(45 * Math.sin(2 * g_seconds), 0, 1, 0);
        poke2.render();

        var poke3 = new Cube([0.0, 1.0, 1.0, 1.0]);
        poke3.matrix.translate(-0.1, 0.5, 0.3);
        poke3.matrix.scale(0.6, 0.1, 0.9)
        poke3.matrix.rotate(45, 0, 1, 1);
        poke3.matrix.rotate(45 * Math.sin(3 * g_seconds), 0, 0, 1);
        poke3.render();
    } else {
        var body = new Cylinder();
        body.color = [1.0, 1.0, 1.0, 1.0];
        body.matrix.translate(0, 0, -0.25);
        body.matrix.rotate(90, 1, 0, 0);
        body.matrix.rotate(g_bodyInandOutAngle, 1, 0, 0);
        body.matrix.scale(0.5, 0.5, 0.5);
        var bodyCoordMatLLP1 = new Matrix4(body.matrix);
        var bodyCoordMatRLP1 = new Matrix4(body.matrix);
        var bodyCoordMatHead = new Matrix4(body.matrix);
        var bodyCoordMatLA = new Matrix4(body.matrix);
        var bodyCoordMatRA = new Matrix4(body.matrix);
        body.render();

        var leftArm = new Cylinder();
        leftArm.matrix = bodyCoordMatRA;
        leftArm.color = [0.9, 0.9, 0.9, 1.0];
        leftArm.matrix.translate(0, 0, 0.3);
        leftArm.matrix.rotate(135, 0, 1, 0);
        leftArm.matrix.rotate(g_leftArmAngle, 1, 0, 0);
        leftArm.matrix.scale(0.5, 0.5, 1);
        leftArm.render();

        var rightArm = new Cylinder();
        rightArm.matrix = bodyCoordMatLA;
        rightArm.color = [0.9, 0.9, 0.9, 1.0];
        rightArm.matrix.translate(0, 0, 0.3);
        rightArm.matrix.rotate(-135, 0, 1, 0);
        rightArm.matrix.rotate(g_rightArmAngle, 1, 0, 0);
        rightArm.matrix.scale(0.5, 0.5, 1);
        rightArm.render();

        var head = new Cube([0.7, 0.7, 0.7, 1.0]);
        head.matrix = bodyCoordMatHead;
        //head.color = [0.7, 0.7, 0.7, 1.0];
        head.matrix.scale(0.4, 0.4, 0.4);
        head.matrix.translate(-0.5, -0.5, -1);
        head.matrix.rotate(g_headAngle, 1, 1, 1);
        head.render();


        var leftLegPart1 = new Cylinder();
        leftLegPart1.matrix = bodyCoordMatLLP1;
        leftLegPart1.color = [0.7, 0.7, 0.7, 1.0];
        leftLegPart1.matrix.translate(0, 0, 0.95);
        leftLegPart1.matrix.rotate(45, 0, 1, 0);
        leftLegPart1.matrix.rotate(g_LLP1LRAngle, 1, 1, 1);
        var leftLegPart1CoordMat = new Matrix4(leftLegPart1.matrix)
        leftLegPart1.matrix.scale(0.5, 0.5, 0.5);
        leftLegPart1.render();

        var leftLegPart2 = new Cylinder();
        leftLegPart2.matrix = leftLegPart1CoordMat;
        leftLegPart2.color = [0.7, 0.7, 0.7, 1.0];
        leftLegPart2.matrix.translate(0, 0, 0.45);
        leftLegPart2.matrix.rotate(45, 0, 1, 0);
        leftLegPart2.matrix.rotate(g_LLP2IOAngle, 1, 0, 1);
        var leftLegPart2CoordMat = new Matrix4(leftLegPart2.matrix)
        leftLegPart2.matrix.scale(0.5, 0.5, 0.5);
        leftLegPart2.render();

        var leftFoot = new Cube();
        leftFoot.matrix = leftLegPart2CoordMat;
        leftFoot.color = [1.0, 1.0, 0.0, 1.0];
        leftFoot.matrix.translate(0.1, 0.1, 0.45)
        leftFoot.matrix.rotate(180, 0, 0, 1);
        leftFoot.matrix.rotate(g_leftFootAngle, 0, 0, 1);
        leftFoot.matrix.scale(0.2, 0.4, 0.2);
        leftFoot.render();

        var rightLegPart1 = new Cylinder();
        rightLegPart1.matrix = bodyCoordMatRLP1;
        rightLegPart1.color = [0.7, 0.7, 0.7, 1.0];
        rightLegPart1.matrix.translate(0, 0, 0.95);
        rightLegPart1.matrix.rotate(-45, 0, 1, 0);
        rightLegPart1.matrix.rotate(g_RLP1LRAngle, 0, 1, 0);
        var rightLegPart1CoordMat = new Matrix4(rightLegPart1.matrix);
        rightLegPart1.matrix.scale(0.5, 0.5, 0.5);
        rightLegPart1.render();

        var rightLegPart2 = new Cylinder();
        rightLegPart2.matrix = rightLegPart1CoordMat;
        rightLegPart2.color = [0.7, 0.7, 0.7, 1.0];
        rightLegPart2.matrix.translate(0, 0, 0.45);
        rightLegPart2.matrix.rotate(-45, 0, 1, 0);
        rightLegPart2.matrix.rotate(g_RLP2IOAngle, 1, 0, 0);
        var rightLegPart2CoordMat = new Matrix4(rightLegPart2.matrix)
        rightLegPart2.matrix.scale(0.5, 0.5, 0.5);
        rightLegPart2.render();

        var rightFoot = new Cube();
        rightFoot.matrix = rightLegPart2CoordMat;
        rightFoot.color = [1.0, 1.0, 0.0, 1.0];
        rightFoot.matrix.translate(0.1, 0.1, 0.45)
        rightFoot.matrix.rotate(180, 0, 0, 1);
        rightFoot.matrix.rotate(g_rightFootAngle, 0, 0, 1);
        rightFoot.matrix.scale(0.2, 0.4, 0.2);
        rightFoot.render();
    }

    /*var body = new Cylinder();
    body.color = [1.0, 1.0, 1.0, 1.0];
    body.matrix.translate(0, 0, -0.25);
    body.matrix.rotate(90, 1, 0, 0);
    body.matrix.rotate(g_bodyInandOutAngle, 1, 0, 0);
    body.matrix.scale(0.5, 0.5, 0.5);
    var bodyCoordMatLLP1 = new Matrix4(body.matrix);
    var bodyCoordMatRLP1 = new Matrix4(body.matrix);
    var bodyCoordMatHead = new  Matrix4(body.matrix);
    var bodyCoordMatLA = new Matrix4(body.matrix);
    var bodyCoordMatRA = new Matrix4(body.matrix);
    body.render();

    var leftArm = new Cylinder();
    leftArm.matrix = bodyCoordMatRA;
    leftArm.color = [0.9, 0.9, 0.9, 1.0];
    leftArm.matrix.translate(0, 0, 0.3);
    leftArm.matrix.rotate(135, 0, 1, 0);
    leftArm.matrix.rotate(g_leftArmAngle, 1, 0, 0);
    leftArm.matrix.scale(0.5, 0.5, 1);
    leftArm.render();

    var rightArm = new Cylinder();
    rightArm.matrix = bodyCoordMatLA;
    rightArm.color = [0.9, 0.9, 0.9, 1.0];
    rightArm.matrix.translate(0, 0, 0.3);
    rightArm.matrix.rotate(-135, 0, 1, 0);
    rightArm.matrix.rotate(g_rightArmAngle, 1, 0, 0);
    rightArm.matrix.scale(0.5, 0.5, 1);
    rightArm.render();

    var head = new Cube([0.7, 0.7, 0.7, 1.0]);
    head.matrix = bodyCoordMatHead;
    //head.color = [0.7, 0.7, 0.7, 1.0];
    head.matrix.scale(0.4, 0.4, 0.4);
    head.matrix.translate(-0.5, -0.5, -1);
    head.matrix.rotate(g_headAngle, 1, 1, 1);
    head.render();

    
    var leftLegPart1 = new Cylinder();
    leftLegPart1.matrix = bodyCoordMatLLP1;
    leftLegPart1.color = [0.7, 0.7, 0.7, 1.0];
    leftLegPart1.matrix.translate(0, 0, 0.95);
    leftLegPart1.matrix.rotate(45, 0, 1, 0);
    leftLegPart1.matrix.rotate(g_LLP1LRAngle, 1, 1, 1);
    var leftLegPart1CoordMat = new Matrix4(leftLegPart1.matrix)
    leftLegPart1.matrix.scale(0.5, 0.5, 0.5);
    leftLegPart1.render();

    var leftLegPart2 = new Cylinder();
    leftLegPart2.matrix = leftLegPart1CoordMat;
    leftLegPart2.color = [0.7, 0.7, 0.7, 1.0];
    leftLegPart2.matrix.translate(0, 0, 0.45);
    leftLegPart2.matrix.rotate(45, 0, 1, 0);
    leftLegPart2.matrix.rotate(g_LLP2IOAngle, 1, 0, 1);
    var leftLegPart2CoordMat = new Matrix4(leftLegPart2.matrix)
    leftLegPart2.matrix.scale(0.5, 0.5, 0.5);
    leftLegPart2.render();

    var leftFoot = new Cube();
    leftFoot.matrix = leftLegPart2CoordMat;
    leftFoot.color = [1.0, 1.0, 0.0, 1.0];
    leftFoot.matrix.translate(0.1, 0.1, 0.45)
    leftFoot.matrix.rotate(180, 0, 0, 1);
    leftFoot.matrix.rotate(g_leftFootAngle, 0, 0, 1);
    leftFoot.matrix.scale(0.2, 0.4, 0.2);
    leftFoot.render();
    
    var rightLegPart1 = new Cylinder();
    rightLegPart1.matrix = bodyCoordMatRLP1;
    rightLegPart1.color = [0.7, 0.7, 0.7, 1.0];
    rightLegPart1.matrix.translate(0, 0, 0.95);
    rightLegPart1.matrix.rotate(-45, 0, 1, 0);
    rightLegPart1.matrix.rotate(g_RLP1LRAngle, 0, 1, 0);
    var rightLegPart1CoordMat = new Matrix4(rightLegPart1.matrix);
    rightLegPart1.matrix.scale(0.5, 0.5, 0.5);
    rightLegPart1.render();
    
    var rightLegPart2 = new Cylinder();
    rightLegPart2.matrix = rightLegPart1CoordMat;
    rightLegPart2.color = [0.7, 0.7, 0.7, 1.0];
    rightLegPart2.matrix.translate(0, 0, 0.45);
    rightLegPart2.matrix.rotate(-45, 0, 1, 0);
    rightLegPart2.matrix.rotate(g_RLP2IOAngle, 1, 0, 0);
    var rightLegPart2CoordMat = new Matrix4(rightLegPart2.matrix)
    rightLegPart2.matrix.scale(0.5, 0.5, 0.5);
    rightLegPart2.render();

    var rightFoot = new Cube();
    rightFoot.matrix = rightLegPart2CoordMat;
    rightFoot.color = [1.0, 1.0, 0.0, 1.0];
    rightFoot.matrix.translate(0.1, 0.1, 0.45)
    rightFoot.matrix.rotate(180, 0, 0, 1);
    rightFoot.matrix.rotate(g_rightFootAngle, 0, 0, 1);
    rightFoot.matrix.scale(0.2, 0.4, 0.2);
    rightFoot.render();*/

    /*var body = new Cube();
    body.color = [1.0, 0.0, 0.0, 1.0];
    body.matrix.translate(-0.25, -0.75, 0.0);
    body.matrix.rotate(-5, 1, 0, 0)
    body.matrix.scale(0.5, 0.3, 0.5);
    body.render();

    var leftArm = new Cube();
    leftArm.color = [1.0, 1.0, 0.0, 1.0];
    leftArm.matrix.translate(0.0, -0.5, 0.0);
    leftArm.matrix.rotate(-5, 1, 0, 0);
    leftArm.matrix.rotate(-g_yellowAngle, 0, 0, 1);
    var yellowCoordMat = new Matrix4(leftArm.matrix);
    leftArm.matrix.scale(0.25, 0.7, 0.5);
    leftArm.matrix.translate(-0.5, 0, 0);
    leftArm.render();

    var box = new Cube();
    box.color = [1.0, 0.0, 1.0, 1.0];
    box.matrix = yellowCoordMat;
    box.matrix.translate(-0.1, 0.7, 0.0, 0.0);
    box.matrix.rotate(g_pinkAngle, 1, 0, 0);
    box.matrix.scale(0.2, 0.4, 0.2);
    box.render();*/

    var duration = performance.now() - startTime;
    sendTextToHtml("ms: " + Math.floor(duration) + ", fps: " + Math.floor(10000 / duration) / 10, "info")
}

function sendTextToHtml(text, htmlID) {
    var htmlElm = document.getElementById(htmlID);
    if (!htmlElm) {
        console.log('Failed to get ' + htmlID + 'from Html!');
        return;
    }
    htmlElm.innerHTML = text;
}
