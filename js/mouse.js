"use strict";
function Mouse(canvas) {
  this.x = 0;
  this.y = 0;
  this.is_down = false;
  this.size = 5;
  this.tool = SAND;
  this.canvas = canvas;

  this.canvas.addEventListener('mousedown', this.handle_mouse_down.bind(this), false);
  this.canvas.addEventListener('mouseup', this.handle_mouse_up.bind(this), false);
  this.canvas.addEventListener('mousemove', this.handle_mouse_move.bind(this), false);
};

Mouse.prototype.handle_mouse_up = function(event) {
  this.is_down = false;
};
Mouse.prototype.handle_mouse_down = function(event) {
  this.is_down = true;
};
Mouse.prototype.get_mouse_pos = function(evt) {
  var rect = this.canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
};
Mouse.prototype.handle_mouse_move = function(event) {
  var pos = this.get_mouse_pos(event);
  this.x = pos.x;
  this.y = pos.y;
};
