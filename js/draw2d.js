"use strict";
function Draw2D(context, width, height) {
  this.width = width;
  this.height = height;
  this.context = context;
  this.imgData = this.context.createImageData(width, height);
  this.pixData  = this.imgData.data;
};

Draw2D.prototype.clear = function() {
  //this.context.clearRect(0, 0, 300, 300);
  var i = 0;
  for(i; i < this.imgData.data.length; i++) {
    this.imgData.data[i+3] = 0;
  }
};

Draw2D.prototype.text = function(text, x, y) {
  this.context.font = "12px Verdana";
  this.context.fillText(text, x, y);
};

Draw2D.prototype.doneDraw = function() {
  this.context.putImageData( this.imgData, 0, 0 );
};

Draw2D.prototype.pixel = function(x, y, r, g, b) {
  // this.context.fillStyle = "rgb("+r+","+g+","+b+")";
  // this.context.fillRect(x, y, 1, 1);

  /*
  0,0 == i = 0
  300,300 = i = 300*300
  */

  var i = x*4+y*(this.height*4);

  this.pixData[i] = r; 	// red
  this.pixData[i+1] = g; 	// green
  this.pixData[i+2] = b; 	// blue
  this.pixData[i+3] = 255; 	// blue
  //
  // this.context.putImageData( this.imgData, x, y );

  // alpha
  // var pixels  = imgData.data;
  // for (var i = 0, n = pixels.length; i < n; i += 4) {
  //     var grayscale = pixels[i  ] * .3 + pixels[i+1] * .59 + pixels[i+2] * .11;
  //     pixels[i  ] = grayscale; 	// red
  //     pixels[i+1] = grayscale; 	// green
  //     pixels[i+2] = grayscale; 	// blue
  //     // alpha
  // }

};
