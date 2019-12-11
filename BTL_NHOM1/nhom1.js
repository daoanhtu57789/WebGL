var VSHADER_SOURCE =
`
	attribute vec4 a_Position;
	uniform mat4 u_MvpMatrix;
	void main() {
		gl_Position = u_MvpMatrix * a_Position;
	}
`;

var FSHADER_SOURCE =
`
	void main() {
		gl_FragColor = vec4(1.0,0.0,0.0,1.0);
	}
`

function main() {
	// Retrieve <canvas> element
	var canvas = document.getElementById('webgl');
  
	// Get the rendering context for WebGL
	var gl = getWebGLContext(canvas);
	if (!gl) {
	  console.log('Failed to get the rendering context for WebGL');
	  return;
	}
  
	//tạo chương trình
	var normalProgram = createProgram(gl, VSHADER_SOURCE, FSHADER_SOURCE);
	//lấy các thuộc tính trong chương trình
	normalProgram.a_Position = gl.getAttribLocation(normalProgram, 'a_Position');
	normalProgram.u_MvpMatrix = gl.getUniformLocation(normalProgram, 'u_MvpMatrix');

	//kiểm tra xem có lấy được không nếu không báo lỗi
	if (normalProgram.a_Position < 0 || !normalProgram.u_MvpMatrix) 
	{
		console.log('Failed to get the storage location of attribute or uniform variable from normalProgram'); 
		return;
	}
	//hàm vẽ 2 khối cầu
	//vẽ trái đất
	var sphere = initVertexBuffersForSphere(gl);
	//vẽ mặt trăng
	var sphere2 = initVertexBuffersForSphere2(gl);
	//thiết lập nền để vẽ
	gl.clearColor(0, 0, 0, 1);
	gl.enable(gl.DEPTH_TEST);

	
	// Chuẩn bị ma trận chiếu xem cho bản vẽ thông thường
	var viewProjMatrix = new Matrix4();
	//ma trận khung nhìn cách xa vật 45 
	viewProjMatrix.setPerspective(45, canvas.width/canvas.height, 1.0, 100.0);
	//ma trận điểm nhìn:điểm mắt - điểm nhìn - vector đỉnh  
	viewProjMatrix.lookAt(0.0, 7.0, 9.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);

	//tạo góc quay ban đầu
	var currentAngle = 0.0;
  	var tick = function(){
		//cập nhật góc quay
		currentAngle = animate(currentAngle);
		//vẽ màu nền
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.useProgram(normalProgram);
		//hàm vẽ khối cầu
		//vẽ trái đất
		drawSphere(gl, normalProgram, sphere,currentAngle, viewProjMatrix);
		//vẽ mặt trăng
		drawSphere2(gl, normalProgram, sphere2 ,currentAngle, viewProjMatrix);
		//yêu cầu gọi lại hàm tick		
		window.requestAnimationFrame(tick, canvas);
  	};
  	tick();
}

// Ma trận biến đổi tọa độ
var g_modelMatrix = new Matrix4();
var g_mvpMatrix = new Matrix4();

function drawSphere(gl, program, sphere,angle, viewProjMatrix){
	// Đặt tỷ lệ và dịch cho mô hình ma trận và vẽ hình cầu
	g_modelMatrix.setScale(3.0, 3.0, 3.0);
	
	g_modelMatrix.rotate(angle, 0.0, 1.0,0.0);
  
	draw(gl,program, sphere, viewProjMatrix);
}
function drawSphere2(gl, program, sphere,angle, viewProjMatrix) {
	// Đặt tỷ lệ và dịch cho mô hình ma trận và vẽ hình cầu

	g_modelMatrix.setRotate(angle, 0, 1, 0);
	g_modelMatrix.translate(0.0, 0.2, 3.5);

	g_modelMatrix.rotate(angle, 0, 1, 0);

	draw(gl,program, sphere, viewProjMatrix);
}

function draw(gl, program, o, viewProjMatrix) {
	initAttributeVariable(gl, program.a_Position, o.vertexBuffer);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, o.indexBuffer);
	
	// Tính toán ma trận dự án xem mô hình và chuyển nó tới u_MvpMatrix
	g_mvpMatrix.set(viewProjMatrix);
	g_mvpMatrix.multiply(g_modelMatrix);
	//truyền ma trận dịch chuyển vào ma trận trong ngôn ngữ tô bóng
	gl.uniformMatrix4fv(program.u_MvpMatrix, false, g_mvpMatrix.elements);
	//vẽ hình tam giác
	gl.drawElements(gl.TRIANGLES, o.numIndices, gl.UNSIGNED_BYTE, 0);
	//gl.drawArrays(gl.TRIANGLES, o.numIndices, o.numIndices);
}

function initAttributeVariable(gl, a_attribute, buffer) {
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.vertexAttribPointer(a_attribute, buffer.num, buffer.type, false, 0, 0);
	gl.enableVertexAttribArray(a_attribute);
}

function initVertexBuffersForSphere(gl) { // Create a sphere
	var SPHERE_DIV = 15;
  
	var i, ai, si, ci;
	var j, aj, sj, cj;
	var p1, p2;
  
	var vertices = [];
	var indices = [];
  
	// Tạo tọa độ
	for (j = 0; j <= SPHERE_DIV; j++) {
	  aj = j * Math.PI / SPHERE_DIV;
	  sj = Math.sin(aj);
	  cj = Math.cos(aj);
	  for (i = 0; i <= SPHERE_DIV; i++) {
		ai = i * 2 * Math.PI / SPHERE_DIV;
		si = Math.sin(ai);
		ci = Math.cos(ai);
  
		vertices.push(si * sj/2);  // X
		vertices.push(cj/2);       // Y
		vertices.push(ci * sj/2);  // Z
	  }
	}
  
	
	// Tạo chỉ mục
	for (j = 0; j < SPHERE_DIV; j++) {
	  for (i = 0; i < SPHERE_DIV; i++) {
		p1 = j * (SPHERE_DIV+1) + i;
		p2 = p1 + (SPHERE_DIV+1);
  
		indices.push(p1);
		indices.push(p2);
		indices.push(p1 + 1);
  
		indices.push(p1 + 1);
		indices.push(p2);
		indices.push(p2 + 1);
	  }
	}
	// Sử dụng đối tượng Object để trả về nhiều đối tượng bộ đệm với nhau
	var o = new Object(); 
	
	// Ghi thông tin đỉnh vào đối tượng đệm
	o.vertexBuffer = initArrayBufferForLaterUse(gl, new Float32Array(vertices), 3, gl.FLOAT);
	
	o.indexBuffer = initElementArrayBufferForLaterUse(gl, new Uint8Array(indices), gl.UNSIGNED_BYTE);
	if (!o.vertexBuffer || !o.indexBuffer) return null; 
  
	o.numIndices = indices.length;
  
	
	// Hủy liên kết đối tượng bộ đệm
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
   
	return o;
  }
  function initVertexBuffersForSphere2(gl) { // Create a sphere
	  var SPHERE_DIV = 15;
	
	  var i, ai, si, ci;
	  var j, aj, sj, cj;
	  var p1, p2;
	
	  var vertices1 = [];
	  var indices1 = [];
	
	  // Tạo tọa độ
	  for (j = 0; j <= SPHERE_DIV; j++) {
		aj = j * Math.PI / SPHERE_DIV;
		sj = Math.sin(aj);
		cj = Math.cos(aj);
		for (i = 0; i <= SPHERE_DIV; i++) {
		  ai = i * 2 * Math.PI / SPHERE_DIV;
		  si = Math.sin(ai);
		  ci = Math.cos(ai);
	
		  vertices1.push(si * sj/2.5);  // X
		  vertices1.push(cj/2.5);       // Y
		  vertices1.push(ci * sj/2.5);  // Z
		}
	  }
	
	  // // Tạo chỉ mục
	  for (j = 0; j < SPHERE_DIV; j++) {
		for (i = 0; i < SPHERE_DIV; i++) {
		  p1 = j * (SPHERE_DIV+1) + i;
		  p2 = p1 + (SPHERE_DIV+1);
	
		  indices1.push(p1);
		  indices1.push(p2);
		  indices1.push(p1 + 1);
	
		  indices1.push(p1 + 1);
		  indices1.push(p2);
		  indices1.push(p2 + 1);
		}
	  }
	
	// Sử dụng đối tượng Object để trả về nhiều đối tượng bộ đệm với nhau
	var o = new Object(); 
	
	// Ghi thông tin đỉnh vào đối tượng đệm
	o.vertexBuffer = initArrayBufferForLaterUse(gl, new Float32Array(vertices1), 3, gl.FLOAT);
	o.indexBuffer = initElementArrayBufferForLaterUse(gl, new Uint8Array(indices1), gl.UNSIGNED_BYTE);
	if (!o.vertexBuffer|| !o.indexBuffer) return null; 
  
	o.numIndices = indices1.length;
  
	
	// Hủy liên kết đối tượng bộ đệm
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	console.log(o);
	return o;
  
}


function initArrayBufferForLaterUse(gl, data, num, type) {
	
	// Tạo một đối tượng đệm
	var buffer = gl.createBuffer();
	if (!buffer) {
	  console.log('Failed to create the buffer object');
	  return null;
	}
	
	// Ghi ngày vào đối tượng bộ đệm
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  
	// Lưu trữ thông tin cần thiết để gán đối tượng cho biến thuộc tính sau
	buffer.num = num;
	buffer.type = type;
  
	return buffer;
}

function initElementArrayBufferForLaterUse(gl, data, type) {
	// Tạo một đối tượng đệm
	var buffer = gl.createBuffer();
	if (!buffer) {
	  console.log('Failed to create the buffer object');
	  return null;
	}
	// Ghi ngày vào đối tượng bộ đệm
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW);
  
	// Lưu trữ thông tin cần thiết để gán đối tượng cho biến thuộc tính sau
	buffer.type = type;
  
	return buffer;
}

var g_last = Date.now();

function animate(angle){
	var now = Date.now();

	var elapsed = now - g_last;//mili giay
	g_last=now;
	var newAngle = angle + (13 * elapsed) /1000.0;
	return newAngle % 360;
}

