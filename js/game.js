"use strict";
function Game() {
  this.canvas;
  this.context;

  this.draw2d;

  this.obj_coords = [[]];
  this.objects = [];
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

  // Mouse Data
  this.mouse_tool = '2';
  this.mouseIsDown = false;
  this.mouseX = 0;
  this.mouseY = 0;

  this.init();
}

Game.prototype.init = function() {
  //Load colors
  this.type_color['2'] = {r: 210, g: 180, b: 140};
  this.type_color['1'] = {r: 128, g: 128, b: 128};
  // Load canvas og context;
  this.canvas = document.getElementById('game');
  if (this.canvas.getContext) {
    this.context = this.canvas.getContext('2d');
    this.draw2d = new Draw2D(this.context);

    this.canvas.addEventListener('mousedown', this.handle_mouse_down.bind(this), false);
    this.canvas.addEventListener('mouseup', this.handle_mouse_up.bind(this), false);
    this.canvas.addEventListener('mousemove', this.handle_mouse_move.bind(this), false);

    var that = this;
    this.fpsStart = new Date();

    this.spawners.push(new Spawner('2', 50, 10, 1));
    this.spawners.push(new Spawner('2', 100, 10, 1));
    this.spawners.push(new Spawner('2', 150, 10, 1));

    setInterval(function() {
      that.update();
    }, 10);

    setInterval(function() {
      that.draw2d.clear();
      that.draw();
    }, 0);

  }
};

Game.prototype.update = function() {
  var game = this;

  var diff = new Date() - this.fpsStart;
  this.fps = Math.round(this.framesSinceLast / (diff / 1000));

  this.handle_mouse();

  if (this.spawners_on) {
    _.each(this.spawners, function(spawner) {
      spawner.update(game);
    });
  }

  _.each(this.objects, function(obj) {

    if (obj.static) {
      return;
    }

    var old_x = obj.x;
    var old_y = obj.y;

    var obj_below = game.exists_obj(old_x, old_y + 1);
    var obj_left = game.exists_obj(old_x - 1, old_y + 1);
    var obj_right = game.exists_obj(old_x + 1, old_y + 1);

    if (!obj.falling && (obj_below && obj_left && obj_right)) {
      return;
    }

    if (obj_below === false) {
      obj.y++;
      game.move_obj(obj.x, obj.y, old_x, old_y, obj.type);
    } else if (obj_below === true) {
      if (obj_left === false) {
        obj.y++;
        obj.x--;
        game.move_obj(obj.x, obj.y, old_x, old_y, obj.type);
      } else if (obj_right === false) {
        obj.y++;
        obj.x++;
        game.move_obj(obj.x, obj.y, old_x, old_y, obj.type);
      } else {
        obj.falling = false;
      }

    }
  });

  // Remove objects that are not moving.
  this.objects = _.reject(this.objects, function(obj) {
    var that = obj;
    var bool = (obj.y >= game.gameHeight)  || obj.remove;

    if (bool) {
      game.remove_obj(obj.x, obj.y);
    }

    return bool;
  });

  this.framesSinceLast = 0;
  this.fpsStart = new Date();
};

Game.prototype.draw = function() {
  var game = this;

  // UI
  this.context.fillStyle = "rgb(0,0,0)";
  game.draw2d.text("Objects: " + this.objects.length, 0, 24);
  game.draw2d.text("FPS: " + this.fps, 0, 12);

  _.each(this.objects, function(obj) {
    game.draw2d.pixel(obj.x, obj.y, obj.r, obj.g, obj.b);
  });

  this.framesSinceLast++;
};

Game.prototype.handle_mouse = function() {
  var game = this;
  if (game.mouseIsDown) {
    var x = game.mouseX;
    var y = game.mouseY;

    if (game.mouse_tool === '2') {
      x += Math.round(Math.random() * 3);
    }

    if (game.mouse_tool !== '0') {
      var color = game.type_color[game.mouse_tool];
      var obj = {
        x: x,
        y: y,
        falling: true,
        static: game.mouse_tool === '1' ? true : false,
        remove: false,
        type: game.mouse_tool,
        r: color.r, g: color.g, b: color.b};
        //210,180,140

      game.remove_gameobj(x, y);
      game.add_obj(x, y, game.mouse_tool);
      game.objects.push(obj);
    } else {
      game.remove_gameobj(x, y);
      game.remove_obj(x, y);
    }
  }
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
  if (this.obj_coords[x] === undefined) {
    this.obj_coords[x] = [];
  }

  this.obj_coords[x][y] = type;
};

Game.prototype.remove_obj = function(x, y) {
  if (this.obj_coords[x] === undefined) {
    return;
  }

  if (this.obj_coords[x][y] === undefined) {
    return;
  }

  this.obj_coords[x][y] = '0';
};

Game.prototype.remove_gameobj = function(x, y) {
  this.objects = _.reject(this.objects, function(obj) {
    return obj.x === x && obj.y === y;
  });
};

Game.prototype.move_obj = function(x, y, oldx, oldy, type) {
  this.remove_obj(oldx, oldy);
  this.add_obj(x, y, type);
};

Game.prototype.exists_obj = function(x, y) {
  if (this.obj_coords[x] === undefined) {
    return false;
  }
  if (this.obj_coords[x][y] === undefined) {
    return false;
  }
  if (this.obj_coords[x][y] === '0') {
    return false;
  } else {
    return true;
  }

};
