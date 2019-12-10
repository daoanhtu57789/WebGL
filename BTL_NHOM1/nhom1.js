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
  
	// Initialize shaders
	if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
	  console.log('Failed to intialize shaders.');
	  return;
	}
  
	// Set the vertex coordinates, the color and the normal
	var n = initVertexBuffers(gl);
	if (n < 0) {
	  console.log('Failed to set the vertex information');
	  return;
	}

	gl.clearColor(0, 0, 0, 1);
	gl.enable(gl.DEPTH_TEST);
	 
	var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');

	if (!u_MvpMatrix) { 
		console.log('Failed to get the storage location');
		return;
	}

	var mvpMatrix = new Matrix4(); 

	gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

	var currentAngle = 0.0;
  	var tick = function(){
		//cập nhật góc quay
		currentAngle = animate(currentAngle);
		draw(gl,n,currentAngle,mvpMatrix,u_MvpMatrix);
		requestAnimationFrame(tick);
  	};
  	tick();

}


function draw(gl,n,currentAngle,mvpMatrix,u_MvpMatrix){
	mvpMatrix.setLookAt(0, 0, 20, 0, 0, 0, 1, 5, 0);
	mvpMatrix.setRotate(currentAngle,0.0,0.0,1.0);
	mvpMatrix.translate(0.85,0.0,0.0);
  
	gl.uniformMatrix4fv(u_MvpMatrix,false,mvpMatrix.elements);
  
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
	// Draw the cube(Note that the 3rd argument is the gl.UNSIGNED_SHORT)
	gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_SHORT, 0);
  
}

var g_last = Date.now();

function animate(angle){
	var now = Date.now();

	var elapsed = now - g_last;//mili giay
	g_last=now;
	var newAngle = angle + (13 * elapsed) /1000.0;
	return newAngle % 360;
}

function initVertexBuffers(gl) { // Create a sphere
	var SPHERE_DIV = 19;
  
	var i, ai, si, ci;
	var j, aj, sj, cj;
	var p1, p2;
  
	let positions = [];
	var indices = [];
  
	// Generate coordinates
	for (j = 0; j <= SPHERE_DIV; j++) {
		aj = j * Math.PI / SPHERE_DIV;
		sj = Math.sin(aj);
		cj = Math.cos(aj);
		for (i = 0; i <= SPHERE_DIV; i++) {
			ai = i * 2 * Math.PI / SPHERE_DIV;
			si = Math.sin(ai);
			ci = Math.cos(ai);
	
			positions.push(si * sj/ 10);  // X
			positions.push(cj /10 );       // Y
			positions.push(ci * sj / 10);  // Z

	  }
	}
	console.log(positions);
	// positions.push(positions[positions.length-3]);  // X
	// positions.push(positions[positions.length-2]);
	// positions.push(positions[positions.length-1]);

	for (j = 0; j <= SPHERE_DIV; j++) {
		aj = j * Math.PI / SPHERE_DIV;
		sj = Math.sin(aj);
		cj = Math.cos(aj);
		for (i = 0; i <= SPHERE_DIV; i++) {
			ai = i * 2 * Math.PI / SPHERE_DIV;
			si = Math.sin(ai);
			ci = Math.cos(ai);
	
			positions.push(si * sj / 4 - 0.85);  // X
			positions.push(cj / 4);       // Y
			positions.push(ci * sj / 4);  // Z
	  }
	}


  
	// Generate indices
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
	// Write the vertex property to buffers (coordinates and normals)
	// Same data can be used for vertex and normal
	// In order to make it intelligible, another buffer is prepared separately
	if (!initArrayBuffer(gl, 'a_Position', new Float32Array(positions), gl.FLOAT, 3)) return -1;
	//if (!initArrayBuffer(gl, 'a_Normal', new Float32Array(positions), gl.FLOAT, 3))  return -1;
	
	// Unbind the buffer object
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
  
	// Write the indices to the buffer object
	var indexBuffer = gl.createBuffer();
	if (!indexBuffer) {
		console.log('Failed to create the buffer object');
		return -1;
	}
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

	return indices.length;
  }

function initArrayBuffer(gl, attribute, data, type, num) {
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
	var a_attribute = gl.getAttribLocation(gl.program, attribute);
	if (a_attribute < 0) {
		console.log('Failed to get the storage location of ' + attribute);
		return false;
	}
	//let FSIZE = data.BYTES_PER_ELEMENT;
	gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);

	// Enable the assignment of the buffer object to the attribute variable
	gl.enableVertexAttribArray(a_attribute);
	
	// gl.vertexAttribPointer(a_attribute, num, type, false, FSIZE*6, FSIZE*3);

	// // Enable the assignment of the buffer object to the attribute variable
	// gl.enableVertexAttribArray(a_attribute);
  
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
  
	return true;
  }
