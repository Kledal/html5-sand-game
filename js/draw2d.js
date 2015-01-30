"use strict";
function Draw2D(context) {
  this.context = context;
};

Draw2D.prototype.clear = function() {
  this.context.clearRect(0, 0, 300, 300);
};

Draw2D.prototype.text = function(text, x, y) {
  this.context.font = "12px Verdana";
  this.context.fillText(text, x, y);
};

Draw2D.prototype.pixel = function(x, y, r, g, b) {
  this.context.fillStyle = "rgb("+r+","+g+","+b+")";
  this.context.fillRect(x, y, 1, 1);
};
