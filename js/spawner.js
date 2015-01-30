function Spawner(type, x, y, random) {
  this.type = type;
  this.base_x = x;
  this.base_y = y;
  this.random = random;
}

Spawner.prototype.update = function(game) {
  var x = this.base_x;
  var y = this.base_y;

  if (this.random) {
    x += Math.round(Math.random() * 3);
  }

  var color = game.type_color[this.type];
  var obj = {
    x: x,
    y: y,
    falling: true,
    remove: false,
    type: this.type,
    r: color.r, g: color.g, b: color.b};
    //210,180,140

  game.add_obj(x, y, this.type);
  game.objects.push(obj);
}
