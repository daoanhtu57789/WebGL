//tạo vị trí bằng ngôn ngữ tô bóng
//uniform để truyền đồng nhất tất cả vào các điểm ảnh
let VSHADER_SOURCE = 
`
    uniform vec4 u_Translation;
    uniform float u_CosB,u_SinB;
    attribute vec4 a_Position;
    void main(){
        gl_Position.x = (a_Position.x + u_Translation.x) * u_CosB - (a_Position.y + u_Translation.y) * u_SinB;
        gl_Position.y = (a_Position.x + u_Translation.x) * u_SinB + (a_Position.y + u_Translation.y) * u_CosB;
        gl_Position.z =  a_Position.z + u_Translation.z;
        gl_Position.w = 1.0;
    }
`;
//tạo màu bằng ngôn ngữ tô bóng
let FSHADER_SOURCE = 
`
    void main(){
        gl_FragColor = vec4(1.0,1.0,0.0,1.0);
    }
`;
let Tx = 0.5,Ty = 0.5,Tz = 0.0;


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

    let cosB = Math.cos(3.14/2);
    let sinB = Math.sin(3.14/2);

    let u_Translation = gl.getUniformLocation(gl.program,'u_Translation');
    
    let u_CosB = gl.getUniformLocation(gl.program,'u_CosB');
    
    let u_SinB = gl.getUniformLocation(gl.program,'u_SinB');
    if(!u_Translation){
        console.log("Lỗi u_Translation");
        return;
    }

    gl.uniform4f(u_Translation,0.5,0.5,0.5,0.0);
    gl.uniform1f(u_SinB,sinB);
    gl.uniform1f(u_CosB,cosB);

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
