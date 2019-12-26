var VSHADER_SOURCE =
`
	attribute vec3 aVertexPosition; //toa do diem

	attribute vec2 aTextureCoord; //Toa do ket cau truyen vao
	uniform mat4 u_MvpMatrix;  //Ma tran dich chuyen
	uniform mat4 u_ViewMatrix; //Ma tran dinh huong quan sat 
	uniform mat4 u_ProjMatrix; //Ma tran pham vi quan sat
	varying vec2 vTextureCoord; //Toa do ket cau truyen sang FSHADER_SOURCE


	uniform vec3 u_LightColor; //Mau anh sang
	attribute vec4 a_Normal;
	uniform vec3 u_LightDirection; //Toa do thuc chuan hoa

	uniform vec3 u_AmbientLight;  //Mau anh sang xung quanh

	varying vec3 v_Color;  //gia tri de truyen sang cho FSHADER
	void main(void) {
		gl_Position = u_ProjMatrix * u_ViewMatrix * u_MvpMatrix *  vec4(aVertexPosition, 1.0);

		vTextureCoord = aTextureCoord;
		//Thiet lap mau anh sang
		vec4 color = vec4(1.0, 1.0, 1.0, 1.0);
		//Tao do dai phap tuyen 1.0
		vec3 normal = normalize(vec3(a_Normal));

		//Chuan hoa
		vec3 lightDirection = normalize(u_LightDirection);

		//Tich vo huong cua anh sang va huong be mat
		float nDotL = max(dot(lightDirection, normal), 0.0);

		//Mau do phan chieu khuech tan
		vec3 diffuse = u_LightColor * color.rgb * nDotL;

		//Mau cua anh sang xung quanh
		vec3 ambient = u_AmbientLight * color.rgb;

		//Truyen mau sang FSHADER_SOURCE
		v_Color = vec3(diffuse + ambient);
	}
`;

var FSHADER_SOURCE =
`
	precision mediump float;
	//Lay du lieu cua toa do ket cau
	varying vec2 vTextureCoord;

	//Bien de truy cap ket cau gan voi gl.TEXTURE_2D
	uniform sampler2D uColorMapSampler;

	varying vec3 v_Color;
	void main(void) {

		vec4 fragmentColor = texture2D(uColorMapSampler, vec2(vTextureCoord.s, vTextureCoord.t));
		
		//Truy xuat mau cua anh ket cau
		gl_FragColor = vec4(fragmentColor.rgb * v_Color, fragmentColor.a);
	}
`;
//Tao ca bien toan cuc
var gl;
var shaderProgram;
var ANGLE_STEP = 45;
var scale_X = 0.5,scale_Y = 0.5,scale_Z=0.5;
function main() {
	// Retrieve <canvas> element
	var canvas = document.getElementById('webgl');

	//Nhận bối cảnh kết xuất cho WebGL
	gl = getWebGLContext(canvas);

	//Lay chieu dai va chieu rong cua canvas
	gl.viewportWidth = canvas.width;
	gl.viewportHeight = canvas.height;
	
	//Kiemt tra xem nhan duoc ko
	if (!gl) {
	  console.log('Failed to get the rendering context for WebGL');
	  return;
	}
	//Su kien ban phim
	document.onkeydown = ev => {
		switch (ev.keyCode) 
		{ 
			case 37: //mui ten trai
				
				ANGLE_STEP -= 5;
				break; 
			case 38: //mui ten tren
				scale_X += 0.2;
				scale_Y += 0.2;
				scale_Z += 0.2; 
				break; 
			case 39: //mui ten phai
				
				ANGLE_STEP += 5;
				break; 
			case 40: //mui ten duoi
				scale_X -= 0.2;
				scale_Y -= 0.2;
				scale_Z -= 0.2; 
				break; 
			default: 
				break; 
		} 
	}

	//Su kien chuot
	 canvas.onmousedown = function (ev) {  mouseDrag(ev, canvas); };
	canvas.onmousemove = function (ev) {  mouseDrag(ev, canvas); };
	document.onmouseup = function (ev) {  mouseDrag(ev, canvas); };
  
	//tạo chương trình
	shaderProgram = createProgram(gl, VSHADER_SOURCE, FSHADER_SOURCE);
	//Su dung chuong trinh
	gl.useProgram(shaderProgram);
	
	//lấy các thuộc tính trong chương trình
	shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
	gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

	shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
	gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);
	//Lay cac bien dong nhat
	shaderProgram.u_MvpMatrix = gl.getUniformLocation(shaderProgram, "u_MvpMatrix");

	shaderProgram.u_ViewMatrix = gl.getUniformLocation(shaderProgram, "u_ViewMatrix");

	shaderProgram.u_ProjMatrix = gl.getUniformLocation(shaderProgram, "u_ProjMatrix");

	shaderProgram.colorMapSamplerUniform = gl.getUniformLocation(shaderProgram, "uColorMapSampler");
	//lay cac dong nhat cua anh sang
	shaderProgram.u_LightColor = gl.getUniformLocation(shaderProgram, 'u_LightColor');
	shaderProgram.u_LightDirection = gl.getUniformLocation(shaderProgram, 'u_LightDirection');
	shaderProgram. u_AmbientLight = gl.getUniformLocation(shaderProgram, 'u_AmbientLight');
	
	
	
	  
	initBuffers1();
	initBuffers2();
	initTextures();

	// gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.enable(gl.DEPTH_TEST);

	tick();
}

//Ham xu ly ket cau
function handleLoadedTexture(texture) {
	//Dao nguoc truc y cua anh
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	
	//Gan doi tuong ket cau voi target
	gl.bindTexture(gl.TEXTURE_2D, texture);

	//Thiet lap anh ket cau
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
	
	//Thiet lap cac bien ket cau
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.generateMipmap(gl.TEXTURE_2D);
}


var earthColorMapTexture;
var moonColorMapTexture;

//Tao cac doi tuong anh ban dau
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
var projMatrix = new Matrix4();
var viewMatrix = new Matrix4();
var mvpMatrix= new Matrix4();

//Ham thiet lap va truyen ma trận biến đổi tọa độ
function setMatrixUniforms() {
	//Ma tran diem nhin
	viewMatrix.setLookAt(D * Math.cos(a) * Math.cos(b),
      D * Math.cos(b),
	  D * Math.cos(a) * Math.sin(b), 0.0, 0.0, 0.0, 0, 0, 1); // var VIEW_REDUIS = 2
	//Ma tran khoi quan sat
	projMatrix.setPerspective(30, gl.viewportWidth / gl.viewportHeight, 1.0, 100.0);
	//truyen du lieu
	gl.uniformMatrix4fv(shaderProgram.u_ProjMatrix,false,projMatrix.elements);
	gl.uniformMatrix4fv(shaderProgram.u_MvpMatrix,false,mvpMatrix.elements);
	gl.uniformMatrix4fv(shaderProgram.u_ViewMatrix,false,viewMatrix.elements);

}

var sphereVertexPositionBuffer1;
var sphereVertexIndexBuffer1;
var sphereVertexNormalBuffer1;
//Ham khoi tao bo dem du lieu cua trai dat
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

	//Truyen du lieu cua ket cau
	sphereVertexTextureCoordBuffer1 = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexTextureCoordBuffer1);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordData), gl.STATIC_DRAW);
	sphereVertexTextureCoordBuffer1.itemSize = 2;
	sphereVertexTextureCoordBuffer1.numItems = textureCoordData.length / 2;

	//Truyen du lieu diem
	sphereVertexPositionBuffer1 = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexPositionBuffer1);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositionData), gl.STATIC_DRAW);
	sphereVertexPositionBuffer1.itemSize = 3;
	sphereVertexPositionBuffer1.numItems = vertexPositionData.length / 3;

	//Truyen du lieu cho chi so bo dem doi tuong
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

//Ham khoi tao bo dem du lieu cua mat trang
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

	//Truyen du lieu cua ket cau
	sphereVertexTextureCoordBuffer2 = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexTextureCoordBuffer2);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordData), gl.STATIC_DRAW);
	sphereVertexTextureCoordBuffer2.itemSize = 2;
	sphereVertexTextureCoordBuffer2.numItems = textureCoordData.length / 2;

	//Truyen du lieu diem
	sphereVertexPositionBuffer2 = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexPositionBuffer2);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositionData), gl.STATIC_DRAW);
	sphereVertexPositionBuffer2.itemSize = 3;
	sphereVertexPositionBuffer2.numItems = vertexPositionData.length / 3;

	//Truyen du lieu cho chi so bo dem doi tuong
	sphereVertexIndexBuffer2 = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereVertexIndexBuffer2);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), gl.STREAM_DRAW);
	sphereVertexIndexBuffer2.itemSize = 1;
	sphereVertexIndexBuffer2.numItems = indexData.length;

	if (!initArrayBuffer('a_Normal', new Float32Array(vertexPositionData), gl.FLOAT, 3))  return -1;
}

var currentAngle = 0.0;
var moonaAngle=0.0;

//Ham ve trai dat
function drawScene1() {
	//Xu ly ma tran di chuyen cua trai dat
	mvpMatrix.setRotate(currentAngle,0,0,1);
	mvpMatrix.scale(scale_X,scale_Y,scale_Z);

	//Kich hoa ket cau don vi 0
	gl.activeTexture(gl.TEXTURE0);

	//Gan doi tuong ket cau voi trai dat
	gl.bindTexture(gl.TEXTURE_2D, earthColorMapTexture);

	gl.uniform1i(shaderProgram.colorMapSamplerUniform, 0);

	//Gan bo dem vao cac bien
	gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexPositionBuffer1);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, sphereVertexPositionBuffer1.itemSize, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexTextureCoordBuffer1);
	gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, sphereVertexTextureCoordBuffer1.itemSize, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereVertexIndexBuffer1);
	//Goi ham thiet lap va bien doi toa do
	setMatrixUniforms();
	gl.drawElements(gl.TRIANGLES, sphereVertexIndexBuffer1.numItems, gl.UNSIGNED_SHORT, 0);
}

//Ham ve mat trang
function drawScene2() {

	//Xu ly ma tran di chuyen cua mat trang
	mvpMatrix.setRotate(currentAngle, 0, 0, 1);
	mvpMatrix.scale(scale_X,scale_Y,scale_Z);
	mvpMatrix.translate(1.5, 0.0, 0.0)

	//Kich hoa ket cau don vi 1
	gl.activeTexture(gl.TEXTURE1);

	//Gan doi tuong ket cau voi mat trang
	gl.bindTexture(gl.TEXTURE_2D, moonColorMapTexture);

	gl.uniform1i(shaderProgram.colorMapSamplerUniform, 1);

	//Gan bo dem vao cac bien	
	gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexPositionBuffer2);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, sphereVertexPositionBuffer2.itemSize, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexTextureCoordBuffer2);
	gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, sphereVertexTextureCoordBuffer2.itemSize, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereVertexIndexBuffer2);

	//Goi ham thiet lap va bien doi toa do
	setMatrixUniforms();
	gl.drawElements(gl.TRIANGLES, sphereVertexIndexBuffer2.numItems, gl.UNSIGNED_SHORT, 0);
}


var lastTime = Date.now();

//Ham cap nhat goc quay
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
	var speed = document.getElementById('speed');

	speed.innerHTML = 'Tốc Độ : ' +ANGLE_STEP + '/s';

	var scale = document.getElementById('scale');

	scale.innerHTML = 'Kích Thước : x' + scale_X;

	var lookat = document.getElementById('lookat');

	lookat.innerHTML = `Tọa độ điểm nhìn : ${Math.round(D * Math.cos(a) * Math.cos(b))},
		${Math.round(D * Math.cos(b))},
		${Math.round(D * Math.cos(a) * Math.sin(b))}`;
	
	var colorR = document.getElementById('colorR');
	var colorG = document.getElementById('colorG');
	var colorB = document.getElementById('colorB');
	var directionX = document.getElementById('directionX');
	var directionY = document.getElementById('directionY');
	var directionZ = document.getElementById('directionZ');
	var ambientR = document.getElementById('ambientR');
	var ambientG = document.getElementById('ambientG');
	var ambientB = document.getElementById('ambientB');
	console.log(colorR.value);

	// Thiet lap light color (white)
	gl.uniform3f(shaderProgram.u_LightColor, colorR.value, colorG.value, colorB.value);
	// Đặt hướng ánh sáng (trong tọa độ thế giới)
	gl.uniform3f(shaderProgram.u_LightDirection, directionX.value, directionY.value, directionZ.value);
	// Đặt ánh sáng xung quanh
	gl.uniform3f(shaderProgram.u_AmbientLight, ambientR.value, ambientG.value, ambientB.value);
}


function initArrayBuffer(attribute, data, type, num) {
	// Tạo một đối tượng đệm
	var buffer = gl.createBuffer();
	if (!buffer) {
	  console.log('Failed to create the buffer object');
	  return false;
	}

	// Viết ngày vào đối tượng đệm
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

	//Gán đối tượng đệm cho biến thuộc tính
	shaderProgram.a_attribute = gl.getAttribLocation(shaderProgram, attribute);

	if (shaderProgram.a_attribute < 0) {
	  console.log('Failed to get the storage location of ' + shaderProgram.attribute);
	  return false;
	}
	gl.vertexAttribPointer(shaderProgram.a_attribute, num, type, false, 0, 0);
	// Cho phép gán đối tượng đệm cho biến thuộc tính
	gl.enableVertexAttribArray(shaderProgram.a_attribute);
  
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
  
	return true;
}

var g_isDragging = false;

var a = 30.0 * Math.PI / 360;
var b = 0.0;

var D=2;
var x_origin = 0.0;
var b_origin = 0.0;
var y_origin = 0.0;
var a_origin = 0.0;

//Ham xu ly cac su kien chuot
function mouseDrag(ev, canvas) {
	var x = ev.clientX;
	var y = ev.clientY;
	var rect = ev.target.getBoundingClientRect(ev, canvas);

	x = ((x - rect.left) - (canvas.height / 2)) / (canvas.height / 2);
	y = ((canvas.width / 2) - (y - rect.top)) / (canvas.width / 2);

	switch (ev.type) {
		case 'mousedown':
		g_isDragging = true;
		x_origin = x;
		b_origin = b;
		y_origin = y;
		a_origin = a;
		break;
		case 'mouseup':
		g_isDragging = false;
		break;
		case 'mousemove':
		if (g_isDragging == true) {
			a = a_origin + (y - y_origin) * -1.5;
			b = b_origin - (x - x_origin) * -1.5;
		}
		break;
		case 'wheel':
		if (ev.wheelDelta < 0)
			D += 2;
		else
			D = ((D - 2) > 0) ? (D - 2) : 2;
		break;
	}
}
