"use strict";

/*
 Elements
*/
var NONE = 0;
var WALL = 1;
var SAND = 2;
var WATER = 4;
var LIFE = 8;
var FIRE = 16;
var BURNING = 32;
var LAVA = 64;
var RESTING = 128;
var OIL = 256;
var GASOLINE = 512;
var SPRING = (WALL | WATER);
var OIL_WELL = (WALL | OIL);
var LAVA = (SAND | FIRE);

function Game() {
  this.canvas;
  this.context;

  this.mouse;
  this.draw2d;

  this.grid = [[]];
  this.particles = 0;
  // this.objects = [];
  this.spawners = [];
  this.spawners_on = true;

  this.framesSinceLast = 0;
  this.fps = 0;
  this.fpsStart;

  // Type color
  this.type_color = {};

  this.materials = {
    space: {
      density: 0
    },
    wall: {
      color: [128, 128, 128]
    },
    sand: {
      color: [210, 180, 140],
      density: 15
    },
    water: {
      color: [52, 152, 219],
      liquid: true,
      density: 5
    },
    life: {
      color: [46, 204, 113],
      bColors: [230, 126, 34, 192, 57, 43],
      infect: true
    },
    fire: {
      color: [231, 76, 60],
      bColors: [230, 126, 34, 192, 57, 43],
      infect: true
    },
    burning: {
      color: [230, 126, 34],
      bColors: [230, 126, 34, 192, 57, 43],
      infect: true
    },
    oil: {
      color: [139, 97, 42],
      liquid: true,
      density: 4
    },
    gasoline: {
      color: [236, 240, 241],
      liquid: true,
      density: 3
    }
  };

  this.init();
}

Game.prototype.init = function() {
  // Load canvas og context;
  this.canvas = document.getElementById('game');
  if (this.canvas.getContext) {

    this.gameWidth = this.canvas.width;
    this.gameHeight = this.canvas.height;

    this.context = this.canvas.getContext('2d');
    this.mouse = new Mouse(this.canvas);
    this.draw2d = new Draw2D(this.context, this.gameWidth, this.gameHeight);

    var that = this;
    this.fpsStart = new Date();

    this.setup();

    setInterval(function() {
      that.update();
    }, 10);

    var setupDraw = function() {
      that.draw();
      window.requestAnimationFrame(setupDraw);
    };

    window.requestAnimationFrame(setupDraw);
  }
};

Game.prototype.setup = function() {
  this.grid = new Array(this.gameWidth);
  var x = 0;
  var y = 0;
  var that = this;
  while (x < this.gameWidth) {
    that.grid[x] = new Array(that.gameHeight);
    y = 0;
    while(y < this.gameHeight + 1) {
      that.grid[x][y] = NONE;
      y++;
    }
    x++;
  }
};

Game.prototype.update = function() {
  var game = this;

  var diff = new Date() - this.fpsStart;
  this.fps = Math.round(this.framesSinceLast / (diff / 1000));

  this.handle_mouse();

  if (this.spawners_on) {
    for(var i = 0;i<this.spawners.length;i++) {
      this.spawners[i].update(game);
    }
  }

  //this.draw2d.clear();

  var y = 0;
  var x = 0;
  while(x < this.gameWidth - 1) {
    y = this.gameHeight;
    while(y >= 0) {
      this.draw2d.pixel(x, y, 0, 0, 0);
      var s = this.grid[x][y];

      if (s === NONE || s & RESTING) {
        y--;
        continue;
      }

      if (y == 0 || y == this.gameHeight) {
        if (y == 0 ) this.remove_obj(x, y);
        y--;
        continue;
      }


      var dbc = this.dot(x, y + 1),
          m = this.get_material(s);
      var color = m.color;

      if (s & BURNING) {
        if (Math.random() > 0.1) {
          color = (Math.random() > 0.1) ? [m.bColors[0], m.bColors[1], m.bColors[2]] : [m.bColors[3], m.bColors[4], m.bColors[5]];
        }
      }
      this.draw2d.pixel(x, y, color[0], color[1], color[2]);

      if (s & SAND) {
        if (!dbc) {
          if (Math.random()<0.8) { this.move_obj(x, y + 1, x, y, s); }
        } else if (dbc && !this.dot(x-1,y + 1)) {
          if (Math.random()<0.5) { this.move_obj(x-1, y + 1, x, y, s); }
        } else if (dbc && !this.dot(x+1,y + 1)) {
          if (Math.random()<0.5) { this.move_obj(x+1, y + 1, x, y, s); }
        }

      }
      // Spring
      if (s & WALL && s & WATER) {
        this.infect(x, y, NONE, WATER);
      }
      if (s & WALL && s & OIL) {
        this.infect(x, y, NONE, OIL);
      }
      if (s & SAND && s & FIRE) {
        this.infect(x, y, NONE, BURNING);
      }

      // if (m.infect) {

        if (s & WATER) {
          if(Math.random() > 0.2) this.get_infected(x, y, LIFE, LIFE);
        }
        // if (s & LIFE) {
        //   this.infect(x, y, WATER, LIFE, 0.15);
        // }

        if (s & FIRE || s & BURNING) {
          this.infect(x, y, LIFE, BURNING);
          this.infect(x, y, OIL, BURNING, 0.08);
          this.infect(x, y, GASOLINE, BURNING, 0.6);
        }
      // }

      // Turn fire into burning
      if (s == FIRE) {
        if(Math.random() > 0.75) this.grid[x][y] |= BURNING;
      }

      if (s & BURNING) {
        var newY = y;
        if(!this.dot(x, y-1)) {
          if (Math.random()<0.4) {
            newY--;
            this.move_obj(x, newY, x, y, s);
          }
        }

        if(Math.random() > 0.98) {
          this.remove_obj(x, newY);
        }
      }


      if (m.liquid) {
        if (!dbc) {
          if (Math.random()<0.8) { this.move_obj(x, y + 1, x, y, s); }
        } else if (dbc && Math.random()>0.1 && !this.dot(x-1,y)) {
          this.move_obj(x-1, y, x, y, s);
        } else if (dbc && Math.random()>0.2 && !this.dot(x+1,y)) {
          this.move_obj(x+1, y, x, y, s);
        }
      }

      var um = this.get_material(this.grid[x][y-1]);
      if (um !== undefined) {
        if(typeof um.density !== 'undefined' && typeof m.density !== 'undefined') {
            if(m.density < um.density) {
                if(Math.random() < 0.7) {
                  this.swap(x, y - 1, x, y);
                }
            }
        }
      }

      y--;
    }

    x++;
  }

  if (this.framesSinceLast > 100) {
    this.framesSinceLast = 0;
    this.fpsStart = new Date();
  }
};

Game.prototype.infect = function(x, y, react, infect, speed) {
  speed = speed || 0.1;

  var coords = [ [x, y-1], [x, y+1], [x+1,y], [x-1,y], [x-1, y-1], [x-1, y+1], [x+1, y-1], [x+1, y+1] ];
  var i = 0;
  while(i<coords.length) {
    var x = coords[i][0];
    var y = coords[i][1];

    if (this.dot(x, y) == react) {
      if (Math.random()<speed) { this.grid[x][y] = infect; }
    }

    i++;
  }
};

Game.prototype.get_infected = function(x, y, search, replace, speed) {
  speed = speed || 0.1;

  var coords = [ [x, y-1], [x, y+1], [x+1,y], [x-1,y]/*, [x-1, y-1], [x-1, y+1], [x+1, y-1], [x+1, y+1] */ ];
  var i = 0;

  var oldX = x,
      oldY = y;
  while(i<coords.length) {
    if (this.dot(coords[i][0], coords[i][1]) == search) {
      if (Math.random()<speed) { this.grid[oldX][oldY] = replace; }
      return;
    }

    i++;
  }
};

Game.prototype.draw = function() {
  var game = this;

  game.draw2d.doneDraw();

  // UI
  this.context.fillStyle = "rgb(255,255,255)";
  game.draw2d.text("Objects: " + this.particles, 0, 24);
  game.draw2d.text("FPS: " + this.fps, 0, 12);

  this.framesSinceLast++;
};

Game.prototype.fill_square = function(x, y, w, h, s) {
  for(var xx = x; xx < x + w; xx++) {
    for(var yy = y; yy < y + h; yy++) {
      this.add_obj(xx, yy, s);
    }
  }
};


Game.prototype.handle_mouse = function() {
  if (this.mouse.is_down) {
    if (this.mouse.tool !== NONE) {
      this.fill_square(this.mouse.x, this.mouse.y, this.mouse.size, this.mouse.size, this.mouse.tool);
    } else {
      this.remove_obj(this.mouse.x, this.mouse.y);
    }
  }
}

Game.prototype.get_material = function(s) {
  if (s & NONE) { return this.materials.space};
  if (s & WALL && s & FIRE) { return this.materials.fire};
  if (s & WALL) { return this.materials.wall};
  if (s & FIRE) { return this.materials.fire};
  if (s & SAND) { return this.materials.sand};
  if (s & WATER) { return this.materials.water};
  if (s & LIFE) { return this.materials.life};
  if (s & BURNING) { return this.materials.burning};
  if (s & OIL) { return this.materials.oil};
  if (s & GASOLINE) { return this.materials.gasoline};
}

// Helpers

Game.prototype.clear = function() {
  this.setup();
  this.particles = 0;
};

Game.prototype.add_obj = function(x, y, type) {
  if (this.grid[x][y] === NONE) {
    this.particles++;
  }
  this.grid[x][y] = type;
};

Game.prototype.remove_obj = function(x, y) {
  if (this.grid[x][y] !== NONE) {
    this.particles--;
  }
  this.grid[x][y] = NONE;
};

Game.prototype.swap = function(x, y, oldx, oldy) {
  var temp = this.grid[x][y];
  var temp1 = this.grid[oldx][oldy];
  this.grid[x][y] = temp1;
  this.grid[oldx][oldy] = temp;
}

Game.prototype.move_obj = function(x, y, oldx, oldy, type) {
  this.remove_obj(oldx, oldy);
  this.add_obj(x, y, type);

  //this.wakeSurrounds(x, y);
};

Game.prototype.dot = function(x, y) {
  if (x < 0 || x > this.gameWidth || y < 0 || y > this.gameHeight) {
    return WALL;
  }
  return this.grid[x][y];
};
