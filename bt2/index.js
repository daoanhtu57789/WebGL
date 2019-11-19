var VSHADER_SOURCE =
  // attribute variable
  `attribute vec4 a_Position;
    attribute float a_Size;  
    void main() {
        gl_Position = a_Position;
        gl_PointSize = a_Size;
    }`;

// Fragment shader program
var FSHADER_SOURCE =
`
    precision mediump float;
    uniform vec4 u_color;
    void main() {   
        gl_FragColor = u_color; 
    }
`;

function main() {
    // Retrieve <canvas> element
    var canvas = document.getElementById("webgl");

    // Get the rendering context for WebGL
    var gl = getWebGLContext(canvas);

    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log("Failed to intialize shaders.");
        return;
    }

    // Get the storage location of a_Position
    var a_Position = gl.getAttribLocation(gl.program, "a_Position");
    if (a_Position < 0) {
        console.log("Failed to get the storage location of a_Position");
        return;
    }

    var a_Size = gl.getAttribLocation(gl.program, "a_Size");
    if (a_Size < 0) {
        console.log("Failed to get the storage location of a_Position");
        return;
    }


    var u_color = gl.getUniformLocation(gl.program, "u_color");
    if (u_color < 0) {
        console.log("Failed to get the storage location of a_Position");
        return;
    }
    canvas.onmousedown = function(ev){
        click(ev,gl,canvas,a_Position,a_Size,u_color);
    }

    // Pass vertex position to attribute variable
    // gl.vertexAttrib3f(a_Position, -1.0, 0.0, 0.0);
    // gl.vertexAttrib1f(a_Size, 20.0);

    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Draw
//    gl.drawArrays(gl.POINTS, 0, 1);
}

let g_points = []; //mảng lưu các điểm
//hàm xử lý sự kiện khi click
function click(ev,gl,canvas,a_Position,a_Size,u_color){
    let x = ev.clientX ; //tọa độ x của trỏ chuột gốc là ở góc trên trái màn hình
    let y = ev.clientY ; //tọa độ y của trỏ chuột
    let rect = ev.target.getBoundingClientRect();
    console.log(x);
    console.log(y);
    x = ((x-rect.left) - canvas.height/2)/(canvas.height/2);
    y = (canvas.width/2-(y-rect.top))/(canvas.width/2);
    console.log(x);
    console.log(y);
    g_points.push(x);
    g_points.push(y);
    
    gl.clear(gl.COLOR_BUFFER_BIT);

    for(let i = 0;i<g_points.length;i += 2 ){
        gl.vertexAttrib3f(a_Position, g_points[i],g_points[i+1],0.0);
        gl.vertexAttrib1f(a_Size, 20.0);
        gl.uniform4f(u_color,1.0,1.0,0.0,1.0);
        gl.drawArrays(gl.POINTS,0,1);
    }
}