var VSHADER_SOURCE =
`
	attribute vec3 aVertexPosition;

	attribute vec2 aTextureCoord;
	uniform mat4 u_MvpMatrix;
	uniform mat4 u_ViewMatrix;
	varying vec2 vTextureCoord;

	uniform mat4 u_ModelMatrix;
	uniform mat4 u_NormalMatrix;

	uniform vec3 u_LightColor;
	attribute vec4 a_Normal;
	uniform vec3 u_LightPosition;

	uniform vec3 u_AmbientLight;

	varying vec3 v_Color;
	void main(void) {
		gl_Position = u_ViewMatrix * u_MvpMatrix *  vec4(aVertexPosition, 1.0);

		vTextureCoord = aTextureCoord;
		vec4 color = vec4(1.0, 1.0, 1.0, 1.0);

		vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal));

		vec4 vertexPosition = u_ModelMatrix * vec4(aVertexPosition,1.0);

		vec3 lightDirection = normalize(u_LightPosition - vec3(vertexPosition));

		float nDotL = max(dot(lightDirection, normal), 0.0);

		vec3 diffuse = u_LightColor * color.rgb * nDotL;

		vec3 ambient = u_AmbientLight * color.rgb;

		v_Color = vec3(diffuse + ambient);
	}
`;

var FSHADER_SOURCE =
`
	precision mediump float;

	varying vec2 vTextureCoord;

	uniform sampler2D uColorMapSampler;

	varying vec3 v_Color;
	void main(void) {
		vec3 lightWeighting = v_Color;

		vec4 fragmentColor = texture2D(uColorMapSampler, vec2(vTextureCoord.s, vTextureCoord.t));
		
		gl_FragColor = vec4(fragmentColor.rgb * lightWeighting, fragmentColor.a);
	}
`;

var gl;
var shaderProgram;
var ANGLE_STEP = 45;
var scale_X = 1.0,scale_Y = 1.0,scale_Z=1.0,lookAt_X = 0.0,lookAt_Y = 0.0,lookAt_Z = 1.0;
var count = 0;
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

	document.onkeydown = ev => {
		switch (ev.keyCode) 
		{ 
			case 37: //mui ten trai
				// count = (count+1)%3;
				// console.log(count);
				// if(count == 0){
				// 	lookAt_X = 0.0;
				// 	lookAt_Y = 0.0;
				// 	lookAt_Z = 1.0;
				// }else if(count == 1){
				// 	lookAt_X = 0.0;
				// 	lookAt_Y = 1.0;
				// 	lookAt_Z = 0.0;
				// }else if(count == 2) {
				// 	lookAt_X = 1.0;
				// 	lookAt_Y = 0.0;
				// 	lookAt_Z = 0.0;
				// }
				ANGLE_STEP -= 5;
				break; 
			case 38: //mui ten tren
				scale_X += 0.3;
				scale_Y += 0.3;
				scale_Z += 0.3; 
				break; 
			case 39: //mui ten phai
				// count = (count - 1.0)%3;
				// //count = Math.abs(count);
				// console.log(count);
				// if(count == -0){
				// 	lookAt_X = 0.0;
				// 	lookAt_Y = 0.0;
				// 	lookAt_Z = 1.0;
				// }else if(count == -1){
				// 	lookAt_X = 0.0;
				// 	lookAt_Y = 1.0;
				// 	lookAt_Z = 0.0;
				// }else if(count == -2){
				// 	lookAt_X = 1.0;
				// 	lookAt_Y = 0.0;
				// 	lookAt_Z = 0.0;
				// }
				ANGLE_STEP += 5;
				break; 
			case 40: //mui ten duoi
				scale_X -= 0.3;
				scale_Y -= 0.3;
				scale_Z -= 0.3; 
				break; 
			default: 
				break; 
		} 
	}
  
	//tạo chương trình
	shaderProgram = createProgram(gl, VSHADER_SOURCE, FSHADER_SOURCE);
	//lấy các thuộc tính trong chương trình
	gl.useProgram(shaderProgram);

	shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
	gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

	shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
	gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

	shaderProgram.u_MvpMatrix = gl.getUniformLocation(shaderProgram, "u_MvpMatrix");

	shaderProgram.u_ViewMatrix = gl.getUniformLocation(shaderProgram, "u_ViewMatrix");

	shaderProgram.colorMapSamplerUniform = gl.getUniformLocation(shaderProgram, "uColorMapSampler");
	//lay cac bien thuoc tinh anh sang
	shaderProgram.u_ModelMatrix = gl.getUniformLocation(shaderProgram, 'u_ModelMatrix');
	shaderProgram.u_NormalMatrix = gl.getUniformLocation(shaderProgram, 'u_NormalMatrix');
	shaderProgram.u_LightColor = gl.getUniformLocation(shaderProgram, 'u_LightColor');
	shaderProgram.u_LightPosition = gl.getUniformLocation(shaderProgram, 'u_LightPosition');
	shaderProgram. u_AmbientLight = gl.getUniformLocation(shaderProgram, 'u_AmbientLight');
	
	
	// Set the light color (white)
	gl.uniform3f(shaderProgram.u_LightColor, 0.8, 0.8, 0.8);
	// Set the light direction (in the world coordinate)
	gl.uniform3f(shaderProgram.u_LightPosition, 5.0, 8.0, 7.0);
	// Set the ambient light
	gl.uniform3f(shaderProgram.u_AmbientLight, 0.2, 0.2, 0.2);

	
	gl.uniformMatrix4fv(shaderProgram.u_ModelMatrix, false, modelMatrix.elements);
	  
	initBuffers1();
	initBuffers2();
	initTextures();

	// gl.clearColor(0.0, 0.0, 0.0, 1.0);
	// gl.enable(gl.DEPTH_TEST);

	tick();
}

function handleLoadedTexture(texture) {
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.generateMipmap(gl.TEXTURE_2D);

	gl.bindTexture(gl.TEXTURE_2D, null);
}


var earthColorMapTexture;
var moonColorMapTexture;
// var spaceColorMapTexture
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
//tạo các ma trận đơn vị 1111
var viewMatrix = new Matrix4();
var modelMatrix = new Matrix4();
var mvpMatrix= new Matrix4();
var normalMatrix = new Matrix4();

// Ma trận biến đổi tọa độ
function setMatrixUniforms() {
	viewMatrix.setPerspective(30, gl.viewportWidth / gl.viewportHeight, 1.0, 100.0);
	viewMatrix.lookAt( 1.0 , 0.0, 5.0, 0.0, 0.0,0.0, lookAt_X, lookAt_Y, lookAt_Z);
	mvpMatrix.multiply(modelMatrix);
	// Calculate the matrix to transform the normal based on the model matrix
	normalMatrix.setInverseOf(modelMatrix);
	normalMatrix.transpose();
	// Pass the transformation matrix for normals to u_NormalMatrix
	gl.uniformMatrix4fv(shaderProgram.u_NormalMatrix, false, normalMatrix.elements);

	gl.uniformMatrix4fv(shaderProgram.u_MvpMatrix,false,mvpMatrix.elements);
	gl.uniformMatrix4fv(shaderProgram.u_ViewMatrix,false,viewMatrix.elements);

}

var sphereVertexTextureCoordBuffer1;
var sphereVertexPositionBuffer1;
var sphereVertexIndexBuffer1;
var sphereVertexNormalBuffer1;
function initBuffers1() {
	var latitudeBands = 30;
	var longitudeBands = 30;

	var vertexPositionData = [];
	var normalData = [];
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

			normalData.push(x);
			normalData.push(y);
			normalData.push(z);
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

	sphereVertexNormalBuffer2 = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexNormalBuffer2);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalData), gl.STATIC_DRAW);
	sphereVertexNormalBuffer2.itemSize = 3;
	sphereVertexNormalBuffer2.numItems = normalData.length / 3;

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
	
	if (!initArrayBuffer('a_Normal', new Float32Array(vertexPositionData), gl.FLOAT, 3))  return -1;
}

var sphereVertexTextureCoordBuffer2;
var sphereVertexPositionBuffer2;
var sphereVertexIndexBuffer2;
var sphereVertexNormalBuffer2;
function initBuffers2() {
	var latitudeBands = 30;
	var longitudeBands = 30;


	var vertexPositionData = [];
	var normalData = [];
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
			normalData.push(x);
			normalData.push(y);
			normalData.push(z);
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

	sphereVertexNormalBuffer2 = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexNormalBuffer2);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalData), gl.STATIC_DRAW);
	sphereVertexNormalBuffer2.itemSize = 3;
	sphereVertexNormalBuffer2.numItems = normalData.length / 3;

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

	if (!initArrayBuffer('a_Normal', new Float32Array(vertexPositionData), gl.FLOAT, 3))  return -1;
}
// var vertexTexCoordBuffer;



var currentAngle = 0.0;
var moonaAngle=0.0;

function drawScene1() {

	mvpMatrix.setRotate(currentAngle,0,0,1);
	mvpMatrix.scale(scale_X,scale_Y,scale_Z);
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

	mvpMatrix.setRotate(currentAngle, 0, 0, 1);
	mvpMatrix.scale(scale_X,scale_Y,scale_Z);
	mvpMatrix.translate(1.5, 0.0, 0.0)
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

function initArrayBuffer(attribute, data, type, num) {
	// Create a buffer object
	var buffer = gl.createBuffer();
	if (!buffer) {
	  console.log('Failed to create the buffer object');
	  return false;
	}
	// Write date into the buffer object
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
	// Assign the buffer object to the attribute variable
	shaderProgram.a_attribute = gl.getAttribLocation(shaderProgram, attribute);
	if (shaderProgram.a_attribute < 0) {
	  console.log('Failed to get the storage location of ' + shaderProgram.attribute);
	  return false;
	}
	gl.vertexAttribPointer(shaderProgram.a_attribute, num, type, false, 0, 0);
	// Enable the assignment of the buffer object to the attribute variable
	gl.enableVertexAttribArray(shaderProgram.a_attribute);
  
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
  
	return true;
  }