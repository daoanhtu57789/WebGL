var VSHADER_SOURCE =
`
	attribute vec3 aVertexPosition;

	attribute vec2 aTextureCoord;

	uniform mat4 u_ModelMatrix;
	uniform mat4 u_ViewMatrix;

	varying vec2 vTextureCoord;

	void main(void) {
		gl_Position =u_ViewMatrix * u_ModelMatrix *  vec4(aVertexPosition, 1.0);
		vTextureCoord = aTextureCoord;
	}
`;

var FSHADER_SOURCE =
`
	precision mediump float;

	varying vec2 vTextureCoord;

	uniform sampler2D uColorMapSampler;


	void main(void) {
		vec3 lightWeighting = vec3(1.0, 1.0, 1.0);

		vec4 fragmentColor = texture2D(uColorMapSampler, vec2(vTextureCoord.s, vTextureCoord.t));
		
		gl_FragColor = vec4(fragmentColor.rgb * lightWeighting, fragmentColor.a);
	}
`;

var gl;
var shaderProgram;
var ANGLE_STEP = 45;
var g_eyeX = 0.0 ,g_eyeY = 0.0 ,g_eyeZ = 0.5;
function main() {
	// Retrieve <canvas> element
	var canvas = document.getElementById('webgl');
	document.onkeydown = ev => {
		console.log(ev.keyCode);
		switch(ev.keyCode){
			
			case 37:
				if(-0.5>g_eyeX && g_eyeX > -1.0){
					g_eyeX -=0.05;
					break;
				}
				g_eyeX = 0.0;
				break;
			case 38:
				if(0.5<g_eyeY<1.0){
					g_eyeY +=0.05;
					break;
				}
				g_eyeY = 0.0;
				break;
			case 39:
				if(0.5<g_eyeX<1.0){
					g_eyeX +=0.05;
					break;
				}
				g_eyeX = 0.0;
				break;
			case 40:
				if(-1 < g_eyeY && g_eyeY< -0.5){
					g_eyeY -=0.05;
					break;
				}
				g_eyeY = 0.0;
				break;
			default:
				break;
		}
	}
	// Get the rendering context for WebGL
	gl = getWebGLContext(canvas);
	gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
	if (!gl) {
	  console.log('Failed to get the rendering context for WebGL');
	  return;
	}
  
	//tạo chương trình
	shaderProgram = createProgram(gl, VSHADER_SOURCE, FSHADER_SOURCE);
	//lấy các thuộc tính trong chương trình
	gl.useProgram(shaderProgram);

	shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
	gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

	shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
	gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

	shaderProgram.u_ModelMatrix = gl.getUniformLocation(shaderProgram, "u_ModelMatrix");

	shaderProgram.u_ViewMatrix = gl.getUniformLocation(shaderProgram, "u_ViewMatrix");

	shaderProgram.colorMapSamplerUniform = gl.getUniformLocation(shaderProgram, "uColorMapSampler");

	
	initBuffers1();
	initBuffers2();
	initTextures();

	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.enable(gl.DEPTH_TEST);

	tick();
}

function handleLoadedTexture(texture) {
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
	gl.generateMipmap(gl.TEXTURE_2D);

	gl.bindTexture(gl.TEXTURE_2D, null);
}


var earthColorMapTexture;
var moonColorMapTexture;
function initTextures() {
	earthColorMapTexture = gl.createTexture();
	earthColorMapTexture.image = new Image();
	earthColorMapTexture.image.onload = function () {
		handleLoadedTexture(earthColorMapTexture)
	}
	earthColorMapTexture.image.src = "earth.jpg";

	moonColorMapTexture = gl.createTexture();
        moonColorMapTexture.image = new Image();
        moonColorMapTexture.image.onload = function () {
            handleLoadedTexture(moonColorMapTexture)
        }

    moonColorMapTexture.image.src = "moon.gif";
}

var viewMatrix = new Matrix4();

var modelMatrix= new Matrix4();

// Ma trận biến đổi tọa độ
function setMatrixUniforms() {
	viewMatrix.setLookAt(g_eyeX,g_eyeY,g_eyeZ,0,0,0,0,1,0);
	
	gl.uniformMatrix4fv(shaderProgram.u_ModelMatrix,false,modelMatrix.elements);
	gl.uniformMatrix4fv(shaderProgram.u_ViewMatrix,false,viewMatrix.elements);

}

var sphereVertexTextureCoordBuffer1;
var sphereVertexPositionBuffer1;
var sphereVertexIndexBuffer1;

function initBuffers1() {
	var latitudeBands = 30;
	var longitudeBands = 30;

	var vertexPositionData = [];

	var textureCoordData = [];
	for (var latNumber=0; latNumber <= latitudeBands; latNumber++) {
		var theta = latNumber * Math.PI / latitudeBands;
		var sinTheta = Math.sin(theta);
		var cosTheta = Math.cos(theta);

		for (var longNumber=0; longNumber <= longitudeBands; longNumber++) {
			var phi = longNumber * 2 * Math.PI / longitudeBands;
			var sinPhi = Math.sin(phi);
			var cosPhi = Math.cos(phi);

			var x = cosPhi * sinTheta;
			var y = cosTheta;
			var z = sinPhi * sinTheta;
			var u = 1 - (longNumber / longitudeBands);
			var v = 1 - (latNumber / latitudeBands);

			
			textureCoordData.push(u);
			textureCoordData.push(v);
			vertexPositionData.push(x /4);
			vertexPositionData.push(y /4);
			vertexPositionData.push(z /4);
		}
	}

	var indexData = [];
	for (var latNumber=0; latNumber < latitudeBands; latNumber++) {
		for (var longNumber=0; longNumber < longitudeBands; longNumber++) {
			var first = (latNumber * (longitudeBands + 1)) + longNumber;
			var second = first + longitudeBands + 1;
			indexData.push(first);
			indexData.push(second);
			indexData.push(first + 1);

			indexData.push(second);
			indexData.push(second + 1);
			indexData.push(first + 1);
		}
	}

	sphereVertexTextureCoordBuffer1 = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexTextureCoordBuffer1);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordData), gl.STATIC_DRAW);
	sphereVertexTextureCoordBuffer1.itemSize = 2;
	sphereVertexTextureCoordBuffer1.numItems = textureCoordData.length / 2;

	sphereVertexPositionBuffer1 = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexPositionBuffer1);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositionData), gl.STATIC_DRAW);
	sphereVertexPositionBuffer1.itemSize = 3;
	sphereVertexPositionBuffer1.numItems = vertexPositionData.length / 3;

	sphereVertexIndexBuffer1 = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereVertexIndexBuffer1);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), gl.STREAM_DRAW);
	sphereVertexIndexBuffer1.itemSize = 1;
	sphereVertexIndexBuffer1.numItems = indexData.length;
}

var sphereVertexTextureCoordBuffer2;
var sphereVertexPositionBuffer2;
var sphereVertexIndexBuffer2;

function initBuffers2() {
	var latitudeBands = 30;
	var longitudeBands = 30;


	var vertexPositionData = [];

	var textureCoordData = [];
	for (var latNumber=0; latNumber <= latitudeBands; latNumber++) {
		var theta = latNumber * Math.PI / latitudeBands;
		var sinTheta = Math.sin(theta);
		var cosTheta = Math.cos(theta);

		for (var longNumber=0; longNumber <= longitudeBands; longNumber++) {
			var phi = longNumber * 2 * Math.PI / longitudeBands;
			var sinPhi = Math.sin(phi);
			var cosPhi = Math.cos(phi);

			var x = cosPhi * sinTheta;
			var y = cosTheta;
			var z = sinPhi * sinTheta;
			var u = 1 - (longNumber / longitudeBands);
			var v = 1 - (latNumber / latitudeBands);

			
			textureCoordData.push(u);
			textureCoordData.push(v);
			vertexPositionData.push(x / 8 );
			vertexPositionData.push(y / 8 );
			vertexPositionData.push(z / 8);
		}
	}

	var indexData = [];
	for (var latNumber=0; latNumber < latitudeBands; latNumber++) {
		for (var longNumber=0; longNumber < longitudeBands; longNumber++) {
			var first = (latNumber * (longitudeBands + 1)) + longNumber;
			var second = first + longitudeBands + 1;
			indexData.push(first);
			indexData.push(second);
			indexData.push(first + 1);

			indexData.push(second);
			indexData.push(second + 1);
			indexData.push(first + 1);
		}
	}

	sphereVertexTextureCoordBuffer2 = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexTextureCoordBuffer2);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordData), gl.STATIC_DRAW);
	sphereVertexTextureCoordBuffer2.itemSize = 2;
	sphereVertexTextureCoordBuffer2.numItems = textureCoordData.length / 2;

	sphereVertexPositionBuffer2 = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexPositionBuffer2);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositionData), gl.STATIC_DRAW);
	sphereVertexPositionBuffer2.itemSize = 3;
	sphereVertexPositionBuffer2.numItems = vertexPositionData.length / 3;

	sphereVertexIndexBuffer2 = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereVertexIndexBuffer2);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), gl.STREAM_DRAW);
	sphereVertexIndexBuffer2.itemSize = 1;
	sphereVertexIndexBuffer2.numItems = indexData.length;
}




var currentAngle = 0.0;

function drawScene1() {
	
	modelMatrix.setRotate(currentAngle,0,0,1);
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, earthColorMapTexture);
	gl.uniform1i(shaderProgram.colorMapSamplerUniform, 0);


	gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexPositionBuffer1);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, sphereVertexPositionBuffer1.itemSize, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexTextureCoordBuffer1);
	gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, sphereVertexTextureCoordBuffer1.itemSize, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereVertexIndexBuffer1);
	setMatrixUniforms();
	gl.drawElements(gl.TRIANGLES, sphereVertexIndexBuffer1.numItems, gl.UNSIGNED_SHORT, 0);
}

function drawScene2() {
	modelMatrix.rotate(currentAngle,0,0,1);
	modelMatrix.translate(0.8,0,0);
	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D, moonColorMapTexture);
	gl.uniform1i(shaderProgram.colorMapSamplerUniform, 1);


	gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexPositionBuffer2);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, sphereVertexPositionBuffer2.itemSize, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexTextureCoordBuffer2);
	gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, sphereVertexTextureCoordBuffer2.itemSize, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereVertexIndexBuffer2);
	setMatrixUniforms();
	gl.drawElements(gl.TRIANGLES, sphereVertexIndexBuffer2.numItems, gl.UNSIGNED_SHORT, 0);
}


var lastTime = Date.now();

function animate(angle) {
	var timeNow = Date.now();
	var elapsed = timeNow - lastTime;
	lastTime = timeNow;
	var newAngle = angle +(ANGLE_STEP * elapsed)/1000.0;
	return newAngle%360;
}

function tick() {
	window.requestAnimationFrame(tick);
	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	drawScene1();
	drawScene2();
	currentAngle = animate(currentAngle);
}

