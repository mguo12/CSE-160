// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
    'precision mediump float;\n' +
    'attribute vec4 a_Position;\n' +
    'attribute vec2 a_UV;\n' +
    'attribute vec3 a_Normal;\n' +
    'varying vec2 v_UV;\n' +
    'varying vec3 v_Normal;\n' +
    'varying vec4 v_vertPos;\n' +
    'uniform mat4 u_ModelMatrix;\n' +
    'uniform mat4 u_GlobalRotateMatrix;\n' +
    'uniform mat4 u_ViewMatrix;\n' +
    'uniform mat4 u_ProjectionMatrix;\n' +
    'void main() {\n' +
    '  gl_Position = u_ViewMatrix * u_ProjectionMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;\n' +
    '  v_UV = a_UV;\n' +
    '  v_Normal = a_Normal;\n' +
    '  v_vertPos = u_ModelMatrix * a_Position;\n' +
    '}\n';

// Fragment shader program
var FSHADER_SOURCE =
    'precision mediump float;\n' +
    'varying vec2 v_UV;\n' +
    'varying vec3 v_Normal;\n' +
    'uniform vec4 u_FragColor;\n' +
    'uniform sampler2D u_Sampler0;\n' +
    'uniform sampler2D u_Sampler1;\n' +
    'uniform int u_whichTexture;\n' +
    'uniform vec3 u_lightPos;\n' +
    'uniform vec3 u_cameraPos;\n' +
    'varying vec4 v_vertPos;\n' +
    'uniform bool u_lightOn;\n' +
    'void main() {\n' +
    '  if (u_whichTexture == -3) {\n' +
    '    gl_FragColor = vec4((v_Normal + 1.0) / 2.0, 1.0);\n' +
    '  } else if (u_whichTexture == -2) {\n' +
    '    gl_FragColor = u_FragColor;\n' +
    '  } else if (u_whichTexture == -1) {\n' +
    '    gl_FragColor = vec4(v_UV, 1.0, 1.0);\n' +
    '  } else if (u_whichTexture == 0) {\n' +
    '    gl_FragColor = texture2D(u_Sampler0, v_UV);\n' +
    '  } else if (u_whichTexture == 1) {\n' +
    '    gl_FragColor = texture2D(u_Sampler1, v_UV);\n' +
    '  } else if (u_whichTexture == 2){' +
    '    gl_FragColor = vec4(0.0, 1.0, 1.0, 1.0);\n' +
    '  }\n' +
    '\n' +
    '  vec3 lightVector = vec3(v_vertPos) - u_lightPos;\n' +
    '  float r = length(lightVector);\n' +
    '  //if (r < 0.3) {\n' +
    '  //  gl_FragColor = vec4(1, 0, 0, 1);\n' +
    '  //} else if (r < 0.6) {\n' +
    '  //  gl_FragColor = vec4(0, 1, 0, 1);\n' +
    '  //}\n' +
    '\n' +
    '  //gl_FragColor = vec4(vec3(gl_FragColor) / (r * r), 1);\n' +
    '\n' +
    '  vec3 N = normalize(lightVector);\n' +
    '  vec3 L = normalize(v_Normal);\n' +
    '  float nDotL = max(dot(N, L), 0.0);\n' +
    '\n' +
    '  vec3 R = reflect(N, L);\n' +
    '  vec3 E = normalize(u_cameraPos - vec3(v_vertPos));\n' +
    '  float specular = pow(max(dot(E, R), 0.0), 64.0) * 0.8;\n' +
    '  //gl_FragColor = gl_FragColor * nDotL;\n' +
    '  //gl_FragColor.a = 1.0;\n' +
    '\n' +
    '  vec3 diffuse = vec3(gl_FragColor) * nDotL * 0.7;\n' +
    '  vec3 ambient = vec3(gl_FragColor) * 0.2;\n' +
    '  if (u_lightOn) {\n' +
    '    if (u_whichTexture == 0) {\n' +
    '      gl_FragColor = vec4(specular + diffuse + ambient, 1.0);\n' +
    '    } else {\n' +
    '      gl_FragColor = vec4(diffuse + ambient, 1.0);\n' +
    '    }\n' +
    '  }\n' +
    '}\n';

const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// Global Variables
let canvas;
let gl;
let a_Position;
let a_UV;
let a_Normal;
let u_FragColor;
let u_Sampler0;
let u_Sampler1;
let u_whichTexture;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let u_ViewMatrix;
let u_ProjectionMatrix;
let u_lightPos;
let u_cameraPos;

let g_selectedColor = [0.0, 0.0, 0.0, 1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_selectedSegment = 5;
let g_globalAngle = 0;
let g_yellowAngle = 0;
let g_magentaAngle = 0;

let g_magentaAnimation = false;
let g_yellowAnimation = false;
let g_normalOn = false;
let g_lightPos = [0.8, 0.8, 0.8]
let g_lightAnimation = false;
let g_lightOn = false;

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

    a_UV = gl.getAttribLocation(gl.program, 'a_UV');
    if (a_UV < 0) {
        console.log('Failed to get the storage location of a_UV');
        return;
    }

    a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
    if (a_Normal < 0) {
        console.log('Failed to get the storage location of a_Normal');
        return;
    }

    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }

    u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
    if (!u_lightPos) {
        console.log('Failed to get the storage location of u_lightPos');
        return;
    }

    u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
    if (!u_cameraPos) {
        console.log('Failed to get the storage location of u_cameraPos');
        return;
    }

    u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
    if (!u_lightOn) {
        console.log('Failed to get the storage location of u_lightOn');
        return;
    }

    // Get the storage location of u_Size
    /*u_Size = gl.getUniformLocation(gl.program, 'u_Size');
    if (!u_Size) {
        console.log('Failed to get the storage location of u_Size');
        return;
    }*/

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

    u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
    if (!u_ProjectionMatrix) {
        console.log('Failed to get the storage location of u_ProjectionMatrix');
        return;
    }

    u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if (!u_ViewMatrix) {
        console.log('Failed to get the storage location of u_ViewMatrix');
        return;
    }

    u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0')
    if (!u_Sampler0) {
        console.log('Failed to get the storage location of u_Sampler');
        return false;
    }

    u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
    if (!u_whichTexture) {
        console.log('Failed to get the storage location of u_whichTexture');
        return false;
    }

    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

function addActionsFromHtmlUI() {
    //document.getElementById("clean").onclick = function () {g_shapeLists = []; renderAllShapes();};

    /*document.getElementById("square").onclick = function () {g_selectedType = POINT;};
    document.getElementById("triangle").onclick = function () {g_selectedType = TRIANGLE;};
    document.getElementById("circle").onclick = function () {g_selectedType = CIRCLE;};


    document.getElementById("redSlider").addEventListener('mouseup', function () {g_selectedColor[0] = this.value / 100;});
    document.getElementById("greenSlider").addEventListener('mouseup', function () {g_selectedColor[1] = this.value / 100;});
    document.getElementById("blueSlider").addEventListener('mouseup', function () {g_selectedColor[2] = this.value / 100;});*/

    //document.getElementById("segments").addEventListener('mouseup', function () {g_selectedSegment = this.value;});
    document.getElementById("angleSlide").addEventListener('mousemove', function () {g_globalAngle = this.value; renderAllShapes();});
    document.getElementById("yellowSlide").addEventListener('mousemove', function () {g_yellowAngle = this.value; renderAllShapes();});
    document.getElementById("magentaSlide").addEventListener('mousemove', function () {g_magentaAngle = this.value; renderAllShapes();});
    document.getElementById("lightSlideX").addEventListener('mousemove', function (ev) {if (ev.buttons == 1) {g_lightPos[0] = this.value / 100; renderAllShapes();}});
    document.getElementById("lightSlideY").addEventListener('mousemove', function (ev) {if (ev.buttons == 1) {g_lightPos[1] = this.value / 100; renderAllShapes();}});
    document.getElementById("lightSlideZ").addEventListener('mousemove', function (ev) {if (ev.buttons == 1) {g_lightPos[2] = this.value / 100; renderAllShapes();}});

    canvas.onmousemove = function (ev) {if (ev.buttons == 1) {click(ev);}};

    document.getElementById("yellowOff").onclick = function () {g_yellowAnimation = false;};
    document.getElementById("yellowOn").onclick = function () {g_yellowAnimation = true;};
    document.getElementById("magentaOff").onclick = function () {g_magentaAnimation = false;};
    document.getElementById("magentaOn").onclick = function () {g_magentaAnimation = true;};
    document.getElementById("normalOn").onclick = function () {g_normalOn = true;};
    document.getElementById("normalOff").onclick = function () {g_normalOn = false;};
    document.getElementById("lightAnimationOn").onclick = function () {g_lightAnimation = true;};
    document.getElementById("lightAnimationOff").onclick = function () {g_lightAnimation = false;};
    document.getElementById("lightOn").onclick = function () {g_lightOn = true;};
    document.getElementById("lightOff").onclick = function () {g_lightOn = false;};
}

function initTextures() {
    /*var u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0')
    if (!u_Sampler0) {
        console.log('Failed to get the storage location of u_Sampler');
        return false;
    }*/

    var image = new Image();
    if (!image) {
        console.log('Failed to create the image object');
        return false;
    }

    image.onload = function () {sendTextureToGLSL(image);};

    image.src = 'sky.jpg';

    return true;
}

function sendTextureToGLSL(image) {
    var texture = gl.createTexture();
    if (!texture) {
        console.log('Failed to create the texture object');
        return false;
    }

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

    gl.activeTexture(gl.TEXTURE0);

    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

    gl.uniform1i(u_Sampler0, 0);

    //gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
}

function main() {
    setupWebGL();

    connectVariablesToGLSL();

    addActionsFromHtmlUI();

    // Register function (event handler) to be called on a mouse press
    canvas.onmousedown = click;

    canvas.onmousemove = function (ev) {if (ev.buttons === 1) {click(ev);}};

    document.onkeydown = keydown;

    initTextures();

    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);

    //renderAllShapes();
    requestAnimationFrame(tick);
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
    if (g_yellowAnimation) {
        g_yellowAngle = 45 * Math.sin(g_seconds);
    }

    if (g_magentaAnimation) {
        g_magentaAngle = 45 * Math.sin(g_seconds);
    }

    if (g_lightAnimation) {
        g_lightPos[0] = Math.cos(g_seconds) * 0.8;
        g_lightPos[1] = Math.sin(g_seconds) * 0.8;
        g_lightPos[2] = Math.cos(g_seconds) * 0.8;
    }
}

var g_shapeLists = [];

//var g_points = [];  // The array for the position of a mouse press
//var g_colors = [];  // The array to store the color of a point
//var g_sizes = [];

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

function keydown(ev) {
    if (ev.keyCode == 39) {
        g_eye[0] += 0.2;
    } else if (ev.keyCode == 37) {
        g_eye[0] -= 0.2;
    }

    renderAllShapes();
}

//var g_eye = [0,0,-1];
//var g_at = [0,0,0];
//var g_up = [0,1,0]

function renderAllShapes() {
    var startTime = performance.now();

    var projMat = new Matrix4();
    //projMat.setPerspective(90, canvas.width / canvas.height, 0.1, 100);
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

    var viewMat = new Matrix4();
    //viewMat.setLookAt(g_eye[0],g_eye[1],g_eye[2], g_at[0],g_at[1],g_at[2], g_up[0],g_up[1],g_up[2]);
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

    var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);
    gl.uniform3f(u_cameraPos, 0, 1, -1);
    gl.uniform1i(u_lightOn, g_lightOn);

    var light = new Cube();
    light.color = [2, 2, 0, 1];
    light.matrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
    light.matrix.scale(0.05, 0.05, 0.05);
    light.matrix.translate(-0.5, -0.5, -0.5);
    light.render();

    var floor = new Cube();
    floor.color = [0.5, 0.5, 0.5, 1.0];
    if (g_normalOn) {
        floor.textureNum = -3;
    };
    floor.matrix.translate(0, -0.95, 0);
    floor.matrix.rotate(-185, 1, 0, 0);
    floor.matrix.scale(10, 0.5, 10);
    floor.matrix.translate(-0.5, 0, -0.5);
    floor.render();

    var sky = new Cube();
    sky.color = [0.7, 0.7, 0.7, 1.0];
    if (g_normalOn) {
        sky.textureNum = -3;
    };
    sky.matrix.translate(0, 1.45, 0);
    sky.matrix.rotate(-175, 1, 0, 0);
    sky.matrix.scale(10, 0.5, 10);
    sky.matrix.translate(-0.5, 0, -0.5);
    sky.render();

    var side = new Cube();
    side.color = [0.9, 0.9, 0.9, 1.0];
    if (g_normalOn) {
        side.textureNum = -3;
    };
    side.matrix.translate(1.5, 0, 0);
    side.matrix.rotate(-5, 1, 0, 0);
    side.matrix.rotate(-185, 0, 1, 0);
    side.matrix.scale(0.5, 10, 10);
    side.matrix.translate(0, -0.5, -0.5);
    side.render();

    var left = new Cube();
    left.color = [0.9, 0.9, 0.9, 1.0];
    if (g_normalOn) {
        left.textureNum = -3;
    };
    left.matrix.translate(-1, 0, 0);
    left.matrix.rotate(-5, 1, 0, 0);
    left.matrix.rotate(-175, 0, 1, 0);
    left.matrix.scale(0.5, 10, 10);
    left.matrix.translate(0, -0.5, -0.5);
    left.render();

    var back = new Cube();
    back.color = [0.3, 0.3, 0.3, 1.0];
    if (g_normalOn) {
        back.textureNum = -3;
    };
    back.matrix.translate(0, 0, 0.9);
    back.matrix.scale(10, 10, 0.5);
    back.matrix.translate(-0.5, -0.5, 0);
    back.render();

    var body = new Cube();
    body.color = [1.0, 0.0, 0.0, 1.0];
    if (g_normalOn) {
        body.textureNum = -3;
    };
    //body.textureNum = -1;
    body.matrix.translate(-0.25, -0.75, 0);
    body.matrix.rotate(-5, 1, 0, 0);
    body.matrix.scale(0.5, 0.3, 0.5);
    body.render();

    var leftArm = new Cube();
    leftArm.color = [1.0, 1.0, 0.0, 1.0];
    if (g_normalOn) {
        leftArm.textureNum = -3;
    };
    leftArm.matrix.setTranslate(0.0, -0.5, 0.0);
    leftArm.matrix.rotate(-5, 1, 0, 0);
    leftArm.matrix.rotate(-g_yellowAngle, 0, 0, 1);
    var yellowCoordMat = new Matrix4(leftArm.matrix);
    leftArm.matrix.scale(0.25, 0.7, 0.5);
    leftArm.matrix.translate(-0.5, 0, 0);
    leftArm.render();

    var box = new Cube();
    box.color = [1.0, 0.0, 1.0, 1.0];
    if (g_normalOn) {
        box.textureNum = -3;
    };
    //box.textureNum = 0;
    box.matrix = yellowCoordMat;
    box.matrix.translate(0.0, 0.65, 0.0);
    box.matrix.rotate(g_magentaAngle, 0, 0, 1);
    box.matrix.scale(0.3, 0.3, 0.3);
    box.matrix.translate(-0.5, 0.0, -0.0001);
    box.render();

    var sphere = new Sphere();
    if (g_normalOn) {
        sphere.textureNum = -3;
    };
    sphere.matrix.scale(0.3, 0.3, 0.3);
    sphere.matrix.translate(-2, -2, 0);
    sphere.matrix.rotate(180, 1, 0, 0);
    sphere.render();

    var duration = performance.now() - startTime;
    sendTextToHtml("ms: " + Math.floor(duration) + ", fps: " + Math.floor(10000 / duration) / 10, "info");
}

function sendTextToHtml(text, htmlID) {
    var htmlElm = document.getElementById(htmlID);
    if (!htmlElm) {
        console.log('Failed to get ' + htmlID + 'from Html!');
        return;
    }
    htmlElm.innerHTML = text;
}