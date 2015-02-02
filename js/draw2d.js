"use strict";
function Draw2D(canvas) {
  this.canvas = canvas;

  this.gl = getWebGLContext(canvas);

  // setup GLSL program
  var vertexShader = createShaderFromScriptElement(this.gl, "2d-vertex-shader");
  var fragmentShader = createShaderFromScriptElement(this.gl, "2d-fragment-shader");
  this.program = createProgram(this.gl, [vertexShader, fragmentShader]);
  this.gl.useProgram(this.program);

  this.modelViewProjectionMatrix = null;
  this.uModelViewProjectionMatrix = this.gl.getUniformLocation(this.program, 'modelViewProjectionMatrix');

  var buffer = this.gl.createBuffer();

  // look up where the vertex data needs to go.
  this.positionAttribute = this.gl.getAttribLocation(this.program, "position");
  this.colorAttribute = this.gl.getAttribLocation(this.program, "aColor");
  this.gl.enableVertexAttribArray(this.positionAttribute);
  this.gl.enableVertexAttribArray(this.colorAttribute);


  this.projectionMatrix = this.makeProjectionMatrix(300, 300);
  this.modelViewMatrix = [];

  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
  this.loadIdentity();

  this.mvpMatrix = this.matrixMultiply(this.modelViewMatrix, this.projectionMatrix);
  this.gl.uniformMatrix3fv(this.uModelViewProjectionMatrix, false, this.mvpMatrix);

  this.gl.vertexAttribPointer(this.positionAttribute, 2, this.gl.FLOAT, false, 12, 0);
  this.gl.vertexAttribPointer(this.colorAttribute, 1, this.gl.FLOAT, false, 12, 8);


  this.ready = this.gl;
};

Draw2D.prototype.clear = function() {
  // this.context.clearRect(0, 0, 300, 300);
};

Draw2D.prototype.text = function(text, x, y) {
  this.context.font = "12px Verdana";
  this.context.fillText(text, x, y);
};

Draw2D.prototype.beginDraw = function() {
  // Create a buffer.
  return;
};

Draw2D.prototype.drawObjects = function(objects, count) {
  var vertexArray = new Float32Array(count * 3 * 6);

  this.gl.clear(this.gl.COLOR_BUFFER_BIT);

  var num_objs = 0;
  for(var x = 0; x < objects.length; x++) {
    for(var y = 0; y < objects[x].length; y++) {
      var obj = objects[x][y];
      if (obj == '0')
        continue;

      var offset = num_objs * 3 * 6;
      var color = [0, 0, 0];

      for(var i = 0;i<18;i+=3) {
        var new_x = ( i == 3 || i == 12 || i == 15 ) ? x+1 : x;
        var new_y = ( i == 7 || i == 10 || i == 16 ) ? y+1 : y;
        vertexArray[offset + i] = new_x;
        vertexArray[offset + i + 1] = new_y;
        vertexArray[offset + i + 2] = this.packColor(color);
      }

      num_objs++;
    }
  }

  this.gl.bufferData(this.gl.ARRAY_BUFFER, vertexArray, this.gl.STATIC_DRAW);
  this.gl.drawArrays(this.gl.TRIANGLES, 0, num_objs * 6);

};

Draw2D.prototype.packColor = function(color) {
    return color[0] + color[1] * 256 + color[2] * 256 * 256;
}

Draw2D.prototype.makeProjectionMatrix = function(width, height) {
    return [
        2 / width, 0,          0,
        0,        -2 / height, 0,
       -1,         1,          1
    ];
}

Draw2D.prototype.loadIdentity = function() {
    this.modelViewMatrix = [
            1, 0, 0,
            0, 1, 0,
            0, 0, 1
        ];
};

// Yeah I did steal this one. How did you know?
Draw2D.prototype.matrixMultiply = function(a, b) {
  var a00 = a[0*3+0];
  var a01 = a[0*3+1];
  var a02 = a[0*3+2];
  var a10 = a[1*3+0];
  var a11 = a[1*3+1];
  var a12 = a[1*3+2];
  var a20 = a[2*3+0];
  var a21 = a[2*3+1];
  var a22 = a[2*3+2];
  var b00 = b[0*3+0];
  var b01 = b[0*3+1];
  var b02 = b[0*3+2];
  var b10 = b[1*3+0];
  var b11 = b[1*3+1];
  var b12 = b[1*3+2];
  var b20 = b[2*3+0];
  var b21 = b[2*3+1];
  var b22 = b[2*3+2];
  return [a00 * b00 + a01 * b10 + a02 * b20,
          a00 * b01 + a01 * b11 + a02 * b21,
          a00 * b02 + a01 * b12 + a02 * b22,
          a10 * b00 + a11 * b10 + a12 * b20,
          a10 * b01 + a11 * b11 + a12 * b21,
          a10 * b02 + a11 * b12 + a12 * b22,
          a20 * b00 + a21 * b10 + a22 * b20,
          a20 * b01 + a21 * b11 + a22 * b21,
          a20 * b02 + a21 * b12 + a22 * b22];
}
