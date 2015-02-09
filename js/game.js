"use strict";
function Game() {
  this.canvas;
  this.context;

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

  this.NONE = 0;
  this.WALL = 1;
  this.SAND = 2;
  this.WATER = 4;
  this.LIFE = 8;
  this.FIRE = 16;
  this.BURNING = 32;
  this.LAVA = 64;
  this.RESTING = 128;
  this.OIL = 256;
  this.GASOLINE = 512;

  this.SPRING = (this.WALL | this.WATER);
  this.OIL_WELL = (this.WALL | this.OIL);
  this.LAVA = (this.SAND | this.FIRE);

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

  // Mouse Data
  this.mouse_size = 5;
  this.mouse_tool = this.WATER;
  this.mouseIsDown = false;
  this.mouseX = 0;
  this.mouseY = 0;

  this.init();
}

Game.prototype.init = function() {
  // Load canvas og context;
  this.canvas = document.getElementById('game');
  if (this.canvas.getContext) {

    this.gameWidth = this.canvas.width;
    this.gameHeight = this.canvas.height;

    this.context = this.canvas.getContext('2d');
    this.draw2d = new Draw2D(this.context, this.gameWidth, this.gameHeight);

    this.canvas.addEventListener('mousedown', this.handle_mouse_down.bind(this), false);
    this.canvas.addEventListener('mouseup', this.handle_mouse_up.bind(this), false);
    this.canvas.addEventListener('mousemove', this.handle_mouse_move.bind(this), false);

    var that = this;
    this.fpsStart = new Date();

    this.setup();

    // this.spawners.push(new Spawner(2, 50, 10, 1));
    // this.spawners.push(new Spawner(2, 100, 10, 1));
    // this.spawners.push(new Spawner(3, 150, 10, 1));
    // this.spawners.push(new Spawner(3, 200, 10, 1));
    // this.spawners.push(new Spawner(3, 250, 10, 1));
    // this.spawners.push(new Spawner(3, 300, 10, 1));
    // this.spawners.push(new Spawner(3, 350, 10, 1));
    // this.spawners.push(new Spawner(2, 400, 10, 1));
    // this.spawners.push(new Spawner(2, 450, 10, 1));

    setInterval(function() {
      that.update();
    }, 10);

    var setupDraw = function() {
      that.draw2d.clear();
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
      that.grid[x][y] = this.NONE;
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

  var y = 0;
  var x = 0;
  while(x < this.gameWidth - 1) {
    y = this.gameHeight;
    while(y >= 0) {
      var s = this.grid[x][y];

      if (s === this.NONE || s & this.RESTING) {
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

      if (s & this.SAND) {
        if (!dbc) {
          if (Math.random()<0.8) { this.move_obj(x, y + 1, x, y, s); }
        } else if (dbc && !this.dot(x-1,y + 1)) {
          if (Math.random()<0.5) { this.move_obj(x-1, y + 1, x, y, s); }
        } else if (dbc && !this.dot(x+1,y + 1)) {
          if (Math.random()<0.5) { this.move_obj(x+1, y + 1, x, y, s); }
        }

      }
      // Spring
      if (s & this.WALL && s & this.WATER) {
        this.infect(x, y, this.NONE, this.WATER);
      }
      if (s & this.WALL && s & this.OIL) {
        this.infect(x, y, this.NONE, this.OIL);
      }
      if (s & this.SAND && s & this.FIRE) {
        this.infect(x, y, this.NONE, this.BURNING);
      }

      // if (m.infect) {

        if (s & this.LIFE) {
          this.infect(x, y, this.WATER, this.LIFE, 0.15);
        }

        if (s & this.FIRE || s & this.BURNING) {
          this.infect(x, y, this.LIFE, this.BURNING);
          this.infect(x, y, this.OIL, this.BURNING, 0.08);
          this.infect(x, y, this.GASOLINE, this.BURNING, 0.6);
        }
      // }

      // Turn fire into burning
      if (s == this.FIRE) {
        if(Math.random() > 0.75) this.grid[x][y] |= this.BURNING;
      }

      if (s & this.BURNING) {
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
        } else if (dbc && !this.dot(x-1,y)) {
          if (Math.random()<0.5) { this.move_obj(x-1, y, x, y, s); }
        } else if (dbc && !this.dot(x+1,y)) {
          if (Math.random()<0.5) { this.move_obj(x+1, y, x, y, s); }
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

Game.prototype.draw = function() {
  var game = this;

  var x = 0;
  var y = 0;
  while(y < this.gameHeight) {
    x = 0;
    while(x < this.gameWidth) {
      var s = this.grid[x][y];

      if (s === 0) {
        x++;
        continue;
      }

      var m = this.get_material(s);
      var color = m.color;
      if (s & this.BURNING) {
        if (Math.random() > 0.1) {
          color = (Math.random() > 0.1) ? [m.bColors[0], m.bColors[1], m.bColors[2]] : [m.bColors[3], m.bColors[4], m.bColors[5]];
        }
      }
      game.draw2d.pixel(x, y, color[0], color[1], color[2]);

      x++;
    }
    y++;
  }

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
  var game = this;
  if (game.mouseIsDown) {
    var x = game.mouseX;
    var y = game.mouseY;

    if (game.mouse_tool !== this.WALL) {
      //x += Math.round(Math.random() * 3);
    }

    if (game.mouse_tool !== this.NONE) {

      this.fill_square(x, y, game.mouse_size, game.mouse_size, game.mouse_tool);

    } else {
      game.remove_obj(x, y);
    }
  }
}

Game.prototype.get_material = function(s) {
  if (s & this.NONE) { return this.materials.space};
  if (s & this.WALL && s & this.FIRE) { return this.materials.fire};
  if (s & this.WALL) { return this.materials.wall};
  if (s & this.FIRE) { return this.materials.fire};
  if (s & this.SAND) { return this.materials.sand};
  if (s & this.WATER) { return this.materials.water};
  if (s & this.LIFE) { return this.materials.life};
  if (s & this.BURNING) { return this.materials.burning};
  if (s & this.OIL) { return this.materials.oil};
  if (s & this.GASOLINE) { return this.materials.gasoline};
}

// Helpers

Game.prototype.clear = function() {
  this.setup();
  this.particles = 0;
};

Game.prototype.handle_mouse_up = function(event) {
  this.mouseIsDown = false;
};
Game.prototype.handle_mouse_down = function(event) {
  this.mouseIsDown = true;
};
Game.prototype.get_mouse_pos = function(evt) {
  var rect = this.canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
};
Game.prototype.handle_mouse_move = function(event) {
  var pos = this.get_mouse_pos(event);
  this.mouseX = pos.x;
  this.mouseY = pos.y;
};

Game.prototype.add_obj = function(x, y, type) {
  if (this.grid[x][y] === this.NONE) {
    this.particles++;
  }
  this.grid[x][y] = type;
};

Game.prototype.remove_obj = function(x, y) {
  if (this.grid[x][y] !== this.NONE) {
    this.particles--;
  }
  this.grid[x][y] = this.NONE;
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
    return this.WALL;
  }
  return this.grid[x][y];
};
