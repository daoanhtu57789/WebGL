//tạo vị trí bằng ngôn ngữ tô bóng
let VSHADER_SOURCE = 
`
    attribute vec4 a_Position;
    void main(){
        gl_Position = a_Position;
    }
`;
//tạo màu bằng ngôn ngữ tô bóng
let FSHADER_SOURCE = 
`
    void main(){
        gl_FragColor = vec4(1.0,1.0,0.0,1.0);
    }
`;

function main(){
    //lấy đối tượng canvas thông qua Id
    let canvas = document.getElementById("webgl");

    //lấy ngữ cảnh dựng hình cho webGl
    var gl = getWebGLContext(canvas);

    //khởi tạo các shader
    if(!initShaders(gl,VSHADER_SOURCE,FSHADER_SOURCE)){
        console.log("Lỗi khởi tạo các shader");
        return;
    }

    //thiết lập vị trí các đỉnh
    let n = initVertexBuffers(gl);


    //thiết lập màu nền cho canvas
    gl.clearColor(0.0,0.0,0.0,1.0);

    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.TRIANGLES,0,n);
}

function initVertexBuffers(gl){
    let vertices = new Float32Array([
        0.0,0.5,-0.5,-0.5,0.5,-0.5
    ]);
    let n = 3;

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

    gl.vertexAttribPointer(a_Position,2,gl.FLOAT,false,0,0);

    gl.enableVertexAttribArray(a_Position);

    return n;
}
