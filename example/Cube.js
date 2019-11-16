// #region SHADER PROGRAMS
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Normal;\n' +
  'attribute vec2 a_TexCoord;\n' +

  'uniform mat4 u_MvpMatrix;\n' +
  'uniform mat4 u_ModelMatrix;\n' +
  'uniform mat4 u_NormalMatrix;\n' +

  'varying vec3 v_Position;\n' +
  'varying vec3 v_Normal;\n' +
  'varying vec2 v_TexCoord;\n' +

  'void main() {\n' +
  '  gl_Position = u_MvpMatrix * a_Position;\n' +

  '  v_Position = vec3(u_ModelMatrix * a_Position);\n' +

  '  v_TexCoord = a_TexCoord;\n' +

  '  v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' + // tinh tich vo huong cua huong anh sang va huong be mat
  '}\n';

var FSHADER_SOURCE =
  '#define PI 3.141592654;\n' +
  'precision mediump float;\n' +

  'uniform sampler2D u_Sampler;\n' +// texture
  'uniform vec4 u_LightDirection;\n' + // Light direction (in the world coordinate, normalized)
  'uniform vec3 u_LightPosition;\n' +
  'uniform vec3 u_LightColor;\n' + // Light color
  'uniform float u_Intensity;\n' + // Cuong do sang
  'uniform vec3 u_AmbientLight;\n' + // Ambient light color

  'varying vec3 v_Position;\n' +
  'varying vec3 v_Normal;\n' +
  'varying vec2 v_TexCoord;\n' +

  'void main() {\n' +
  '  vec3 lightDirection = normalize(u_LightPosition - v_Position) * (1.0 - u_LightDirection[3]) +' +
  '                        normalize(vec3(u_LightDirection)) * u_LightDirection[3];\n' +

  '  float nDotL = 1.0 * max(dot(v_Normal, lightDirection), 0.0);\n' +
  '  vec4 texColor = texture2D(u_Sampler, v_TexCoord);\n' +

  '  float d = distance(u_LightPosition, v_Position);\n' +
  '  float S = 1.0 * pow(d, 1.0) * PI;\n' +
  '  float I = u_Intensity / (u_Intensity * u_LightDirection[3] +' +
  '                           S * (1.0 - u_LightDirection[3]));\n' +

  '  vec3 diffuse =  u_LightColor * texColor.rgb * nDotL * I;\n' +
  '  vec3 ambient =  u_AmbientLight * texColor.rgb;\n' +

  '  gl_FragColor = vec4(diffuse + ambient, texColor.a);\n' +
  '}\n';

// #endregion

function main() {
  var canvas = document.getElementById('MyCanvas');

  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context');
    return;
  }
  // !initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)
  var texProgram = createProgram(gl, VSHADER_SOURCE, FSHADER_SOURCE);
  if (!texProgram) {
    console.log('Failed to intialize shaders.');
    return;
  }

  texProgram.a_Position = gl.getAttribLocation(texProgram, 'a_Position');
  texProgram.a_Normal = gl.getAttribLocation(texProgram, 'a_Normal');
  texProgram.a_TexCoord = gl.getAttribLocation(texProgram, 'a_TexCoord');

  texProgram.u_MvpMatrix = gl.getUniformLocation(texProgram, 'u_MvpMatrix');
  texProgram.u_ModelMatrix = gl.getUniformLocation(texProgram, 'u_ModelMatrix');
  texProgram.u_NormalMatrix = gl.getUniformLocation(texProgram, 'u_NormalMatrix');
  texProgram.u_Sampler = gl.getUniformLocation(texProgram, 'u_Sampler');

  texProgram.u_LightDirection = gl.getUniformLocation(texProgram, 'u_LightDirection')
  texProgram.u_LightPosition = gl.getUniformLocation(texProgram, 'u_LightPosition')
  texProgram.u_LightColor = gl.getUniformLocation(texProgram, 'u_LightColor')
  texProgram.u_Intensity = gl.getUniformLocation(texProgram, 'u_Intensity')
  texProgram.u_AmbientLight = gl.getUniformLocation(texProgram, 'u_AmbientLight')

  if (texProgram.a_Position < 0 || texProgram.a_Normal < 0 || texProgram.a_TexCoord < 0 ||
    !texProgram.u_MvpMatrix || !texProgram.u_ModelMatrix || !texProgram.u_NormalMatrix ||
    !texProgram.u_Sampler || !texProgram.u_LightDirection || !texProgram.u_LightPosition ||
    !texProgram.u_LightColor || !texProgram.u_Intensity || !texProgram.u_AmbientLight) {
    console.log('Failed to get the storage location of attribute or uniform variable');
    // return;
  }

  var cube = initVertexBuffers(gl);
  console.log(cube)
  if (!cube) {
    console.log('Failed to set the vertex information');
    return;
  }

  var texture = initTextures(gl, texProgram);
  if (!texture) {
    console.log('Failed to intialize the texture.');
    return;
  }

  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0, 0, 0, 1);

  var ProjMatrix = new Matrix4();
  ProjMatrix.setPerspective(30.0, canvas.width / canvas.height, 1.0, 100.0);

  document.onkeydown = function (ev) { keydown(ev); };

  canvas.onmousedown = function (ev) { mouseDrag(ev, canvas) };
  canvas.onmousemove = function (ev) { mouseDrag(ev, canvas) }
  document.onmouseup = function (ev) { mouseDrag(ev, canvas) }
  canvas.onwheel = function (ev) { mouseDrag(ev, canvas) }

  var currentAngle = 0.0
  var tick = function () {
    currentAngle = animate(currentAngle)

    var viewProjMatrix = new Matrix4()
    viewProjMatrix.set(ProjMatrix)
    viewProjMatrix.lookAt(
      D * Math.cos(a) * Math.cos(b),
      D * Math.sin(a),
      D * Math.cos(a) * Math.sin(b),
      0.0, 0.0, 0.0,
      0.0, 1.0, 0.0)
    viewProjMatrix.multiply(g_modelMatrix)

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    drawTexCube(gl, texProgram, cube, texture, currentAngle, viewProjMatrix)

    requestAnimationFrame(tick)
  }
  g_angle_step = 0
  tick()
  // drawTexCube(gl, texProgram, cube, texture, 0.0, currentAngle, viewProjMatrix);
}

var g_modelMatrix = new Matrix4()
// g_modelMatrix.translate(5,5,5)

function initVertexBuffers(gl) {
  // Create a cube
  //    v6----- v5
  //   /|      /|
  //  v1------v0|
  //  | |     | |
  //  | |v7---|-|v4
  //  |/      |/
  //  v2------v3

  var vertices = new Float32Array([   // Toa do cac dinh
    1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0,    // v0-v1-v2-v3 front
    1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0,    // v0-v3-v4-v5 right
    1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0,    // v0-v5-v6-v1 up
    -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0,    // v1-v6-v7-v2 left
    -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,    // v7-v4-v3-v2 down
    1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0     // v4-v7-v6-v5 back
  ]);

  var normals = new Float32Array([   // Vec to phap tuyen ung voi cac mat
    0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,     // v0-v1-v2-v3 front
    1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,     // v0-v3-v4-v5 right
    0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,     // v0-v5-v6-v1 up
    -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,     // v1-v6-v7-v2 left
    0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0,     // v7-v4-v3-v2 down
    0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0      // v4-v7-v6-v5 back
  ]);

  var texCoords = new Float32Array([   // Toa do cua he Toa do ket cau
    1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,    // v0-v1-v2-v3 front
    0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0,    // v0-v3-v4-v5 right
    1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0,    // v0-v5-v6-v1 up
    1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,    // v1-v6-v7-v2 left
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,    // v7-v4-v3-v2 down
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0     // v4-v7-v6-v5 back
  ]);

  var indices = new Uint8Array([        // Chi so cua cac dinh
    0, 1, 2, 0, 2, 3,    // front
    4, 5, 6, 4, 6, 7,    // right
    8, 9, 10, 8, 10, 11,    // up
    12, 13, 14, 12, 14, 15,    // left
    16, 17, 18, 16, 18, 19,    // down
    20, 21, 22, 20, 22, 23     // back
  ]);

  var o = new Object(); // Utilize Object to to return multiple buffer objects together

  // Write vertex information to buffer object
  o.vertexBuffer = initArrayBufferForLaterUse(gl, vertices, 3, gl.FLOAT);
  o.normalBuffer = initArrayBufferForLaterUse(gl, normals, 3, gl.FLOAT);
  o.texCoordBuffer = initArrayBufferForLaterUse(gl, texCoords, 2, gl.FLOAT);
  o.indexBuffer = initElementArrayBufferForLaterUse(gl, indices, gl.UNSIGNED_BYTE);
  if (!o.vertexBuffer || !o.normalBuffer || !o.texCoordBuffer || !o.indexBuffer) return null;

  o.numIndices = indices.length;

  // Unbind the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  return o;
}

// #region EVENTS HANDLING FUNCTIONS ###

const PI = 3.141592654;
var g_isDragging = false

var a = 30.0 * PI / 180;
var b = 0.0;
var D = 25;

var x_origin = 0.0;
var b_origin = 0.0;
var y_origin = 0.0;
var a_origin = 0.0;

function mouseDrag(ev, canvas) {
  var x = ev.clientX
  var y = ev.clientY
  var rect = ev.target.getBoundingClientRect()

  x = ((x - rect.left) - (canvas.height / 2)) / (canvas.height / 2)
  y = ((canvas.width / 2) - (y - rect.top)) / (canvas.width / 2)

  // console.log('in mouseDrag(): x = ' + x + ' y = ' + y);
  switch (ev.type) {
    case 'mousedown':
      g_isDragging = true
      x_origin = x
      b_origin = b
      y_origin = y
      a_origin = a
      break
    case 'mouseup':
      g_isDragging = false
      break
    case 'mousemove':
      if (g_isDragging == true) {
        a = a_origin + (y - y_origin) * -1.5
        b = b_origin - (x - x_origin) * -1.5
        standardize()
      }
      break
    case 'wheel':
      if (ev.wheelDelta < 0)
        D += 1
      else
        D = ((D - 1) > 0) ? (D - 1) : 1
      break
    default:
      console.log('in mouseDrag(): Unknown mouse event')
  }
  // console.log(ev)
}

function keydown(ev) {
  console.log('in keydown(): ev.keyCode = ' + ev.keyCode)
  var n = 0.1 // change value
  switch (ev.keyCode) {
    case 37: // left arrow
      b += n
      break
    case 38: // up arrow
      a += n
      break
    case 39: // right arrow
      b -= n
      break
    case 40: // down arrow
      a -= n
      break
    case 32: // spacebar
      if (g_angle_step == 0)
        g_angle_step = 45
      else g_angle_step = 0
      break
    case 49:
      g_lightSource[0] += n
      break
    case 50:
      g_lightSource[0] -= n
      break
    case 51:
      g_lightSource[1] += n
      break
    case 52:
      g_lightSource[1] -= n
      break
    case 53:
      g_lightSource[2] += n
      break
    case 54:
      g_lightSource[2] -= n
      break
    case 192:
      g_lightSource[3] = 1.0 - g_lightSource[3]
      break
    case 81:
      g_intensity += n * 5
      break
    case 87:
      g_intensity -= n * 5
      break
    default:
      console.log('in keydown(): Unknown key event')
  }
  // console.log(ev)
  standardize()
}

function standardize() {
  // a %= PI / 2
  if (a > PI / 2) {
    a = PI / 2 - 0.1
  }
  if (a < -PI / 2) {
    a = -PI / 2 + 0.1
  }
  b %= PI * 2
}

// #endregion

// #region ANIMATE FUNCTIONS ###

var g_last = Date.now()
var g_angle_step = 30.0
function animate(angle) {
  var now = Date.now()
  var elapsed = now - g_last //miliSeconds 
  g_last = now
  var newAngle = angle + (g_angle_step * elapsed) / 1000.0
  return newAngle % 360
}

// #endregion

// #region TEXTURE FUNCTIONS ###

function initTextures(gl, program) {
  var texture = gl.createTexture();   // Create a texture object
  if (!texture) {
    console.log('Failed to create the texture object');
    return null;
  }

  var image = new Image();  // Create the image object
  if (!image) {
    console.log('Failed to create the image object');
    return null;
  }
  // Register the event handler to be called on loading an image
  image.onload = function () {
    // Write the image data to texture object
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);  // Flip the image Y coordinate
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    // Pass the texure unit 0 to u_Sampler
    gl.useProgram(program);
    gl.uniform1i(program.u_Sampler, 0);

    gl.bindTexture(gl.TEXTURE_2D, null); // Unbind texture
  };
  // Tell the browser to load an image
  //image.src = '../examples/resources/sky.jpg';
  console.log(image);
  image.src = '../sky.jpg';

  return texture;
}

function drawTexCube(gl, program, o, texture, x, angle, viewProjMatrix) {
  gl.useProgram(program);   // Tell that this program object is used

  // Assign the buffer objects and enable the assignment
  initAttributeVariable(gl, program.a_Position, o.vertexBuffer);  // Vertex coordinates
  initAttributeVariable(gl, program.a_Normal, o.normalBuffer);    // Normal
  initAttributeVariable(gl, program.a_TexCoord, o.texCoordBuffer);// Texture coordinates
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, o.indexBuffer); // Bind indices

  // Bind texture object to texture unit 0
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);

  drawCube(gl, program, o, x, angle, viewProjMatrix); // Draw
}

// Coordinate transformation matrix
function drawCube(gl, program, o, angle, viewProjMatrix) {
  var modelMatrix = new Matrix4();
  var mvpMatrix = new Matrix4();
  var normalMatrix = new Matrix4();
  // Calculate a model matrix
  modelMatrix.setTranslate(0.0, 0.0, 0.0);
  modelMatrix.rotate(angle, 0.0, 1.0, 0.0);

  gl.uniformMatrix4fv(program.u_ModelMatrix, false, modelMatrix.elements);

  // Calculate transformation matrix for normals and pass it to u_NormalMatrix
  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(program.u_NormalMatrix, false, normalMatrix.elements);

  // Calculate model view projection matrix and pass it to u_MvpMatrix
  mvpMatrix.set(viewProjMatrix);
  mvpMatrix.multiply(modelMatrix);
  gl.uniformMatrix4fv(program.u_MvpMatrix, false, mvpMatrix.elements);

  setupLighting(gl, program)
  gl.drawElements(gl.TRIANGLES, o.numIndices, o.indexBuffer.type, 0);   // Draw
}

// #endregion

// #region LIGHTING FUNCTIONS ###

var g_lightSource = [2.0, 2.0, 0.0, 0.0] // g_lightSource[3] == 0 ? enable direction light : enable point light
var g_lightColor = [0.9, 0.9, 0.9]
var g_intensity = 20.0
var g_ambientLight = [0.15, 0.15, 0.15]
function setupLighting(gl, program) {
  gl.uniform4fv(program.u_LightDirection, g_lightSource);
  gl.uniform3f(program.u_LightPosition, g_lightSource[0], g_lightSource[1], g_lightSource[2]);
  gl.uniform3fv(program.u_LightColor, g_lightColor);
  gl.uniform1f(program.u_Intensity, g_intensity);
  gl.uniform3fv(program.u_AmbientLight, g_ambientLight);
}

// #endregion

// #region HELPER FUNCTIONS ###

function initAttributeVariable(gl, a_attribute, buffer) {
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(a_attribute, buffer.num, buffer.type, false, 0, 0);
  gl.enableVertexAttribArray(a_attribute);
}

function initArrayBufferForLaterUse(gl, data, num, type) {
  var buffer = gl.createBuffer();   // Create a buffer object
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return null;
  }
  // Write date into the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

  // Keep the information necessary to assign to the attribute variable later
  buffer.num = num;
  buffer.type = type;

  return buffer;
}

function initElementArrayBufferForLaterUse(gl, data, type) {
  var buffer = gl.createBuffer();　  // Create a buffer object
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return null;
  }
  // Write date into the buffer object
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW);

  buffer.type = type;

  return buffer;
}

// #endregion