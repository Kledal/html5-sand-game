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

  this.lastY = 5;

  this.gameWidth = 300;
  this.gameHeight = 299;

  this.framesSinceLast = 0;
  this.fps = 0;
  this.fpsStart;

  // Type color
  this.type_color = {};

  this.NONE = 0;
  this.WALL = 1;
  this.SAND = 2;
  this.WATER = 4;

  this.materials = {
    wall: {
      color: [128, 128, 128]
    },
    sand: {
      color: [210, 180, 140]
    },
    water: {
      color: [41, 128, 185]
    }
  };

  // Mouse Data
  this.mouse_tool = this.SAND;
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
    while(y < this.gameHeight) {
      that.grid[x][y] = 0;
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

  var y = this.gameHeight - 1;
  var x = 0;
  while(y > 0) {
    x = 0;
    while(x < this.gameWidth) {
      var s = this.grid[x][y];
      if (s === this.NONE) {
        x++;
        continue;
      }

      if (y == game.gameHeight - 1) {
        x++;
        continue;
      }

      var m = this.get_material(s);
      if (s & this.SAND) {
        // function(x, y, oldx, oldy, type)
        this.move_obj(x, y + 1, x, y, s);
      }

      x++;
    }

    y--;
  }

  // for(var i = 0; i < this.objects.length; i++) {
  //   var obj = this.objects[i];
  //   if (obj.static) {
  //     continue;
  //   }
  //
  //   // Remove check
  //   if (obj.y >= game.gameHeight-1) {
  //     //obj.remove = true;
  //     continue;
  //   }
  //
  //   if (obj.x <= 1 || obj.x == game.gameWidth - 2) {
  //     continue;
  //   }
  //
  //   var old_x = obj.x;
  //   var old_y = obj.y;
  //
  //   var obj_below = game.exists_obj(old_x, old_y + 1);
  //   var obj_left = game.exists_obj(old_x - 1, old_y + 1);
  //   var obj_right = game.exists_obj(old_x + 1, old_y + 1);
  //
  //   if (obj.type == 3) {
  //     var obj_real_left = game.exists_obj(old_x - 1, old_y);
  //     var obj_real_left_left = game.exists_obj(old_x - 2, old_y);
  //     var obj_real_right = game.exists_obj(old_x + 1, old_y);
  //
  //     if (!obj_below) {
  //       obj.y++;
  //     } else if (!obj_left) {
  //       obj.x--;
  //       obj.y++;
  //     } else if (!obj_right) {
  //       obj.x++;
  //       obj.y++;
  //     } else if (obj_left && obj_right) {
  //       if (!obj_real_left) {
  //         obj.x--;
  //       } else if (!obj_real_right) {
  //         obj.x++;
  //       }
  //     }
  //
  //
  //     game.move_obj(obj.x, obj.y, old_x, old_y, obj.type);
  //   }
  //
  //   if (obj.type === 2) {
  //     if (obj_below === false) {
  //       obj.y++;
  //       game.move_obj(obj.x, obj.y, old_x, old_y, obj.type);
  //     } else if (obj_below === true) {
  //       if (obj_left === false) {
  //         obj.y++;
  //         obj.x--;
  //         game.move_obj(obj.x, obj.y, old_x, old_y, obj.type);
  //       } else if (obj_right === false) {
  //         obj.y++;
  //         obj.x++;
  //         game.move_obj(obj.x, obj.y, old_x, old_y, obj.type);
  //       } else {
  //         obj.falling = false;
  //       }
  //
  //     }
  //   }
  //
  //   // if (obj.y >= game.gameHeight) {
  //   //   obj.remove = true;
  //   // }
  //
  //
  //   if (obj.remove) {
  //     game.remove_obj(obj.x, obj.y);
  //   }
  // }

  if (this.framesSinceLast > 100) {
    this.framesSinceLast = 0;
    this.fpsStart = new Date();
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

      var obj = this.get_material(s);
      var color = obj.color;
      game.draw2d.pixel(x, y, color[0], color[1], color[2]);

      x++;
    }
    y++;
  }

  game.draw2d.doneDraw();

  // UI
  this.context.fillStyle = "rgb(0,0,0)";
  game.draw2d.text("Objects: " + this.particles, 0, 24);
  game.draw2d.text("FPS: " + this.fps, 0, 12);

  this.framesSinceLast++;
};


Game.prototype.handle_mouse = function() {
  var game = this;
  if (game.mouseIsDown) {
    var x = game.mouseX;
    var y = game.mouseY;

    if (game.mouse_tool !== this.WALL) {
      x += Math.round(Math.random() * 3);
    }

    if (game.mouse_tool !== this.NONE) {
      var color = this.get_material(game.mouse_tool).color;

      game.add_obj(x, y, game.mouse_tool);
    } else {
      game.remove_obj(x, y);
    }
  }
}

Game.prototype.get_material = function(s) {
  if (s & this.WALL) { return this.materials.wall};
  if (s & this.SAND) { return this.materials.sand};
  if (s & this.WATER) { return this.materials.water};
}

// Helpers

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
  this.grid[x][y] = this.NONE;
  this.particles--;
};


Game.prototype.move_obj = function(x, y, oldx, oldy, type) {
  this.remove_obj(oldx, oldy);
  this.add_obj(x, y, type);
};

Game.prototype.exists_obj = function(x, y) {
  if (this.grid[x][y] === this.NONE) {
    return false;
  } else {
    return true;
  }

};
