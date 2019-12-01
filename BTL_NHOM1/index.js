//tạo vị trí bằng ngôn ngữ tô bóng
let VSHADER_SOURCE = `
    attribute vec4 a_Position;
    uniform mat4 u_ModelMatrix;
    void main(){
        gl_Position = u_ModelMatrix * a_Position;
    }
`;
//tạo màu bằng ngôn ngữ tô bóng
let FSHADER_SOURCE = `
    void main(){
        gl_FragColor = vec4(1.0,1.0,0.0,1.0);
    }
`;

function main() {
  //lấy đối tượng canvas thông qua Id
  let canvas = document.getElementById("webgl");

  //lấy ngữ cảnh dựng hình cho webGl
  var gl = getWebGLContext(canvas);

  //khởi tạo các shader
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log("Lỗi khởi tạo các shader");
    return;
  }

  //thiết lập vị trí các đỉnh
  for (let i = 0; i <= 91; i++) {
    let n = initVertexBuffers(gl);
    let modelMatrix = new Matrix4();
    modelMatrix.setRotate(i,0,1,0);
    let u_ModelMatrix = gl.getUniformLocation(gl.program,'u_ModelMatrix');
    gl.uniformMatrix4fv(u_ModelMatrix,false,modelMatrix.elements);
    //thiết lập màu nền cho canvas
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.TRIANGLE_FAN, 0, n);
  }
}

function initVertexBuffers(gl) {
    var g_points = [0.0, 0.0];
  for (let i = 0; i <= 360; i += 2) {
    let theta = (i * Math.PI) / 180.0;
    g_points.push(0.5 * Math.cos(theta));
    g_points.push(0.5 * Math.sin(theta));
  }
  let vertices = new Float32Array(g_points);
  let n = g_points.length / 2;

  //tạo bộ đệm đối tượng
  let vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log("Đối tượng vertexBuffer đã tạo sai!");
    return -1;
  }

  //gắn bộ đệm với target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  //ghi dữ liệu vào bộ đệm đối tượng
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  //lấy giá trị position
  let a_Position = gl.getAttribLocation(gl.program, "a_Position");

  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

  gl.enableVertexAttribArray(a_Position);

  return n;
}
