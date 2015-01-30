"use strict";
function Draw2D(canvas) {
  this.canvas = canvas;

  this.gl = getWebGLContext(canvas);

  // setup GLSL program
  var vertexShader = createShaderFromScriptElement(this.gl, "2d-vertex-shader");
  var fragmentShader = createShaderFromScriptElement(this.gl, "2d-fragment-shader");
  this.program = createProgram(this.gl, [vertexShader, fragmentShader]);
  this.gl.useProgram(this.program);

  // look up where the vertex data needs to go.
  this.positionLocation = this.gl.getAttribLocation(this.program, "a_position");

  // lookup uniforms
  this.resolutionLocation = this.gl.getUniformLocation(this.program, "u_resolution");
  this.colorLocation = this.gl.getUniformLocation(this.program, "u_color");

  // set the resolution
  this.gl.uniform2f(this.resolutionLocation, this.canvas.width, this.canvas.height);

  var buffer = this.gl.createBuffer();
  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
  this.gl.enableVertexAttribArray(this.positionLocation);
  this.gl.vertexAttribPointer(this.positionLocation, 2, this.gl.FLOAT, false, 0, 0);


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

};

Draw2D.prototype.setRectangle = function(x, y, width, height) {
  var x1 = x;
  var x2 = x + width;
  var y1 = y;
  var y2 = y + height;
  this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([
     x1, y1,
     x2, y1,
     x1, y2,
     x1, y2,
     x2, y1,
     x2, y2]), this.gl.STATIC_DRAW);
}

Draw2D.prototype.pixel = function(o) {
  this.setRectangle(o.x, o.y, 1, 1);
  
  this.gl.uniform4f(this.colorLocation, o.r/255, o.g/255, o.b/255, 1);
  this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
};
