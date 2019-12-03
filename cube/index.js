//tạo vị trí bằng ngôn ngữ tô bóng
let VSHADER_SOURCE = 
`
    attribute vec4 a_Position;
    uniform mat4 u_modelMatrix;
    void main(){
        gl_Position = u_modelMatrix * a_Position;
    }
`;
//tạo màu bằng ngôn ngữ tô bóng
let FSHADER_SOURCE = 
`
    void main(){
        gl_FragColor = vec4(1.0,1.0,0.0,1.0);
    }
`;

var ANGLE = 45;
function main(){
    
    //lấy đối tượng canvas thông qua Id
    let canvas = document.getElementById("webgl");
    

    //lấy ngữ cảnh dựng hình cho webGl
    let gl = getWebGLContext(canvas);



    //khởi tạo các shader
    if(!initShaders(gl,VSHADER_SOURCE,FSHADER_SOURCE)){
        console.log("Lỗi khởi tạo các shader");
        return;
    }

    //thiết lập vị trí các đỉnh
    let n = initVertexBuffers(gl);

    //truyền dũ liệu vào trong tam giác

    var modelMatrix = new Matrix4();

    modelMatrix.rotate(ANGLE,1,1,1);

    let u_modelMatrix = gl.getUniformLocation(gl.program,'u_modelMatrix');

    gl.uniformMatrix4fv(u_modelMatrix,false,modelMatrix.elements);

    //thiết lập màu nền cho canvas
    gl.clearColor(0.0,0.0,0.0,1.0);

    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.LINE_STRIP,0,n);
}

function initVertexBuffers(gl){
    let vertices = new Float32Array([
        -0.5,0.5,0.5,
        -0.5,0.5,-0.5,
        0.5,0.5,-0.5,
        0.5,0.5,0.5,
        -0.5,0.5,0.5,
        -0.5,-0.5,0.5,
        -0.5,-0.5,-0.5,
        -0.5,0.5,-0.5,
        -0.5,-0.5,-0.5,
        0.5,-0.5,-0.5,
        0.5,0.5,-0.5,
        0.5,-0.5,-0.5,
        0.5,-0.5,0.5,
        0.5,0.5,0.5,
        0.5,-0.5,0.5,
        -0.5,-0.5,0.5,
    ]);
    let n = 16;

    //tạo bộ đệm đối tượng
    let vertexBuffer = gl.createBuffer();
    if(!vertexBuffer){
        console.log("Đối tượng vertexBuffer đã tạo sai!");
        return -1;
    }

    //gắn bộ đệm với target
    gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);

    //ghi dữ liệu vào bộ đệm đối tượng
    gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STATIC_DRAW);

    //lấy giá trị position
    let a_Position = gl.getAttribLocation(gl.program,'a_Position');

    gl.vertexAttribPointer(a_Position,3,gl.FLOAT,false,0,0);

    gl.enableVertexAttribArray(a_Position);

    return n;
}
