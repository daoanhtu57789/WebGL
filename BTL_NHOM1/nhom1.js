var VSHADER_SOURCE =
`
	attribute vec3 aVertexPosition;

	attribute vec2 aTextureCoord;

	uniform mat4 uMVMatrix;
	uniform mat4 uPMatrix;

	varying vec2 vTextureCoord;


	void main(void) {
		gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
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

function main() {
	// Retrieve <canvas> element
	var canvas = document.getElementById('webgl');
  
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

	shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
	
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

function initTextures() {
	earthColorMapTexture = gl.createTexture();
	earthColorMapTexture.image = new Image();
	earthColorMapTexture.image.onload = function () {
		handleLoadedTexture(earthColorMapTexture)
	}
	earthColorMapTexture.image.src = "earth.jpg";
}

var mvMatrix = mat4.create();

var pMatrix = mat4.create();


// Ma trận biến đổi tọa độ
function setMatrixUniforms() {
	gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
	gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);

}

function degToRad(degrees) {
	return degrees * Math.PI / 180;
}
var sphereVertexTextureCoordBuffer1;
var sphereVertexPositionBuffer1;
var sphereVertexIndexBuffer1;

function initBuffers1() {
	var latitudeBands = 30;
	var longitudeBands = 30;
	var radius = 13;

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
			vertexPositionData.push(radius * x / 2.5);
			vertexPositionData.push(radius * y / 2.5);
			vertexPositionData.push(radius * z / 2.5);
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
	var radius = 13;

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
			vertexPositionData.push(radius * x / 4.5 - 30);
			vertexPositionData.push(radius * y / 4.5 );
			vertexPositionData.push(radius * z / 4.5);
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



var earthAngle = 180;

function drawScene1() {
	

	mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);

	mat4.identity(mvMatrix);

	mat4.translate(mvMatrix, [0, 0, -40]);
	mat4.rotate(mvMatrix, degToRad(23.4), [1, 0, -1]);
	mat4.rotate(mvMatrix, degToRad(earthAngle), [0, 1, 0]);

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
	// gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	// gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);

	mat4.identity(mvMatrix);

	mat4.translate(mvMatrix, [0, 0, -40]);
	mat4.rotate(mvMatrix, degToRad(23.4), [1, 0, -1]);
	mat4.rotate(mvMatrix, degToRad(earthAngle), [0, 1, 0]);

	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, earthColorMapTexture);
	gl.uniform1i(shaderProgram.colorMapSamplerUniform, 0);


	gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexPositionBuffer2);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, sphereVertexPositionBuffer2.itemSize, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexTextureCoordBuffer2);
	gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, sphereVertexTextureCoordBuffer2.itemSize, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereVertexIndexBuffer2);
	setMatrixUniforms();
	gl.drawElements(gl.TRIANGLES, sphereVertexIndexBuffer2.numItems, gl.UNSIGNED_SHORT, 0);
}


var lastTime = 0;

function animate() {
	var timeNow = new Date().getTime();
	if (lastTime != 0) {
		var elapsed = timeNow - lastTime;

		earthAngle += 0.05 * elapsed;
	}
	lastTime = timeNow;
}

function tick() {
	window.requestAnimationFrame(tick);
	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	drawScene1();
	drawScene2();
	animate();
}

