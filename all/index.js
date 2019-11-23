kqra = () => {
    myForm.kq.value = eval(myForm.bt.value);
}

outputThongTin = () => {
    let ht = myFormInput.ht.value;
    let dc = myFormInput.dc.value;
    let sdt = myFormInput.sdt.value;
    document.getElementById("ht").innerHTML = `Họ Tên: ${ht}`;
    
    document.getElementById("dc").innerHTML = `Địa Chỉ: ${dc}`;
    
    document.getElementById("sdt").innerHTML = `SĐT: ${sdt}`;
}

// let VSHADER_SOURCE = `void main(){
//                         gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
//                         gl_PointSize = 10.0;
//                     }`;

// let FSHADER_SOURCE = `void main(){
//     gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
// }`;

// function main(){
//     let canvas = document.getElementById("example");
//     let gl = getWebGLContext(canvas);

//     if(!initShaders(gl,VSHADER_SOURCE,FSHADER_SOURCE)){
//         alert("Sai");
//     }
//     let ctx = canvas.getContext('2d');
//     ctx.fillStyle = 'rgba(0,0,255,1.0)';//màu nền
//     ctx.fillRect(10,0,100,100);//2 biến đầu là tọa độ xuất hiện x và y,2 biến sau là kích thước rộng và cao
// }
let canvas = document.getElementById("example");
let gl = canvas.getContext('experimental-webgl');

/* Tạo tọa độ các đỉnh dưới dạng mảng và lưu nó vào buffer object */

//Tạo tọa độ đỉnh[x1,y1,x2,y2....]
let vertices = [-0.9, 0.9, -0.5, -0.5, 0.0, -0.5, 0.5 , 0.5];
// Tạo buffer object
let vertex_buffer = gl.createBuffer();
// bind buffer object với một mảng buffer rỗng
gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);

// Lưu trữ dữ liệu các đỉnh vào buffer.
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

// Unbind buffer
gl.bindBuffer(gl.ARRAY_BUFFER, null);

/* tạo và biên dich shader program */

let vertCode =
        'attribute vec3 coordinates;' +
        'void main(void) {' +
               ' gl_Position = vec4(coordinates, 1.0);' +
               'gl_PointSize = 10.0;'+
            '}';

//Tạo vertex shader object
var vertShader = gl.createShader(gl.VERTEX_SHADER);

//gán vertex shader code cho vertex shader object
gl.shaderSource(vertShader, vertCode);

//biên dịch vertext shader
gl.compileShader(vertShader);

//Tương tự với fragment shader
var fragCode = 'void main(void) {' + 'gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0);' + '}';

var fragShader = gl.createShader(gl.FRAGMENT_SHADER);

gl.shaderSource(fragShader, fragCode);

gl.compileShader(fragShader);

 // Tạo shader program object để lưu trữ shader.
 var shaderProgram = gl.createProgram();

 // gán các shader object cho shasder program
 gl.attachShader(shaderProgram, vertShader);

 gl.attachShader(shaderProgram, fragShader);

 // Liên kết 2 shader
 gl.linkProgram(shaderProgram);

 // Sử dụng shader program
 gl.useProgram(shaderProgram);

 /* Liên kết shader program với buffer object */

 //Bind vertex buffer object
 gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);

 //Lấy attribute location của shader program
 var coord = gl.getAttribLocation(shaderProgram, "coordinates");
 //trả về vị trí của biến thuộc tính,(chương trình,tên) chương trình để vẽ và tên là vị trí để nhận

 gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0);

 gl.enableVertexAttribArray(coord);

 /* Vẽ hình */

 // Set màu cho canvas,màu nền
 gl.clearColor(0, 0, 1, 1.0);

 gl.enable(gl.DEPTH_TEST);

 gl.clear(gl.COLOR_BUFFER_BIT);

 // thiết lập view port 2 thuộc tính đầu là chọn đầu là chọn điểm gốc tọa độ
 gl.viewport(0,0,canvas.width,canvas.height);

 // Vẽ hình yêu cầu ở đây là tam giác
 gl.drawArrays(gl.POINTS, 0, 1);
 //đầu tiên là kiểu vẽ,2 là lấy chỉ số bắt đầu trong mảng các vector,số lượng các điểm sẽ đc kết xuất
