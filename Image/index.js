//tạo vị trí bằng ngôn ngữ tô bóng
let VSHADER_SOURCE = 
`
    attribute vec4 a_Position;
    attribute vec2 a_TexCoord;
    varying vec2 v_TexCoord;
    void main(){
        gl_Position = a_Position;
        v_TexCoord = a_TexCoord;
    }
`;
//tạo màu bằng ngôn ngữ tô bóng
let FSHADER_SOURCE = 
`
    precision mediump float;
    varying vec2 v_TexCoord;
    uniform sampler2D u_Sampler;
    void main(){
        gl_FragColor = texture2D(u_Sampler,v_TexCoord) ;
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
    gl.clearColor(1.0,1.0,1.0,1.0);

    gl.clear(gl.COLOR_BUFFER_BIT);

    if(!initTextures(gl,n)){
        console.log("Lỗi khởi tạo")
        return;
    }
}

function initVertexBuffers(gl){
    //tọa độ của hình vuông và tọa độ của ảnh ở 2 tọa độ khác nhau nên cần chuyển đổi
    let verticesTexCoords = new Float32Array([
        -0.5,0.5,0.0,1.0,//tọa độ hình vuông là -0.5,0.5 tương ứng tọa độ ảnh là 0.0,1.0
        -0.5,-0.5,0.0,0.0,
        0.5,0.5,1.0,1.0,
        0.5,-0.5,1.0,0.0
    ]);
    let n = 4;

    //tạo bộ đệm đối tượng
    let vertexTexCoordBuffer = gl.createBuffer();
    if(!vertexTexCoordBuffer){
        console.log("Đối tượng vertexTexCoordBuffer đã tạo sai!");
        return -1;
    }

    //gắn bộ đệm với target
    gl.bindBuffer(gl.ARRAY_BUFFER,vertexTexCoordBuffer);

    //ghi dữ liệu vào bộ đệm đối tượng
    gl.bufferData(gl.ARRAY_BUFFER,verticesTexCoords,gl.STATIC_DRAW);

    var FSIZE = verticesTexCoords.BYTES_PER_ELEMENT;

    //lấy giá trị position
    let a_Position = gl.getAttribLocation(gl.program,'a_Position');

    gl.vertexAttribPointer(a_Position,2,gl.FLOAT,false,FSIZE * 4,0);
    gl.enableVertexAttribArray(a_Position);

    
    let a_TexCoord = gl.getAttribLocation(gl.program,'a_TexCoord');

    gl.vertexAttribPointer(a_TexCoord,2,gl.FLOAT,false,FSIZE * 4,FSIZE * 2);
    gl.enableVertexAttribArray(a_TexCoord);

    return n;
}

function initTextures(gl,n){
    //tạo một đối tượng kết cấu
    var texture = gl.createTexture();
    if(!texture){
        console.log("Error texture");
        return;
    }
    //lấy vị trí lưu trữ của u_Sampler
    var u_Sampler = gl.getUniformLocation(gl.program,'u_Sampler');
    if(!u_Sampler){
        console.log("Error u_Sampler");
        return;
    }

    //tạo một đối tượng ảnh
    var image = new Image();
    if(!image){
        console.log("Error image");
        return;
    }

    image.onload = function(){
        loadTexture(gl,n,texture,u_Sampler,image);
    }

    //thông báo trình duyệt tải ảnh

    image.src = '../sky.jpg';

    return true;
}

function loadTexture(gl,n,texture,u_Sampler,image){
    //đảo ngược trục y của ảnh
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,1);
    //kích hoạt kết cấu đơn vị 0
    gl.activeTexture(gl.TEXTURE0);
    //gắn đối tượng kết cấu với target
    gl.bindTexture(gl.TEXTURE_2D,texture);

    //thiết lập các biến kết cấu
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
    //thiết lập ảnh kết cấu
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,image);
    
    //thiết lập kết cấu đơn vị 0 vào mẫu
    gl.uniform1i(u_Sampler,0);

    gl.drawArrays(gl.TRIANGLE_STRIP,0,n);

}
