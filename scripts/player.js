
/**
 * Module dependencies.
 */

var config = require('./config');

/**
 * Expose `Player`.
 */

module.exports = Player;

/**
 * Creates a new instance of `Player`.
 *
 * Requires an element matching '#player'.
 */

function Player() {
  this.self = document.getElementById('player');

  if (!this.self) {
    throw new Error('unable to find `#player`');
  }

  this.center = document.querySelector('#player .center');

  this.diameter = config.player.diameter;
  this.self.style.width =
  this.self.style.height =
    this.diameter + 'px';

  this.radius = this.diameter / 2;
  this.self.style.borderRadius = this.radius + 'px';

  this.position = {};
  this.velocity = {};
  this.charge = 1;

  var player = this;

  this.show = function () {
    player.self.style.display = 'block';
  };

  this.hide = function () {
    player.self.style.display = 'none';
  };

  this.move = function (event) {
    player.self.style.top = (event.clientY - player.radius) + 'px';
    player.self.style.left = (event.clientX - player.radius) + 'px';
    player.position.top = event.clientY;
    player.position.left = event.clientX;
  };

}
