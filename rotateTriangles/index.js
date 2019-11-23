//tạo vị trí bằng ngôn ngữ tô bóng
let VSHADER_SOURCE = 
`
    attribute vec4 a_Position;
    uniform float u_CosB,u_SinB;
    void main(){
        gl_Position.x = a_Position.x * u_CosB - a_Position.y * u_SinB;
        gl_Position.y = a_Position.x * u_SinB + a_Position.y * u_CosB;
        gl_Position.z = a_Position.z;
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

var ANGLE = 0.0;
let kt = true;
function main(){
    
    //lấy đối tượng canvas thông qua Id
    let canvas = document.getElementById("webgl");
    
    canvas.onclick = () =>{
        kt = !kt;    
        if(true){
            var timerId = setInterval(() => {
                ANGLE = ANGLE % 360 + 10;
                if(kt){
                    clearInterval(timerId);
                }
                console.log(ANGLE,kt);
                main();
            }, 100);
        }
        //console.log(ANGLE,kt);
    }

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


    let radian = Math.PI * ANGLE / 180.0; //chuyển đổi độ sang radian
    //lấy giá trị của các góc
    let cosB = Math.cos(radian);
    let sinB = Math.sin(radian);
    //ánh xạ dữ liệu của biến trong javascript với ngôn ngữ tô bóng
    let u_CosB = gl.getUniformLocation(gl.program,'u_CosB');
    let u_SinB = gl.getUniformLocation(gl.program,'u_SinB');
    //truyền dữ liệu vào biến javascipt để ánh xạ
    gl.uniform1f(u_CosB,cosB);
    gl.uniform1f(u_SinB,sinB);
    //thiết lập màu nền cho canvas
    gl.clearColor(0.0,0.0,0.0,1.0);

    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.TRIANGLES,0,n);
}

function initVertexBuffers(gl){
    let vertices = new Float32Array([
        0.0,0.5,-0.5,-0.5,0.5,-0.5
    ]);
    let n = vertices.length / 2;

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
