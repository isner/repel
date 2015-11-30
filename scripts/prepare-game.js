
/**
 * Module dependencies.
 */

var Game = require('./game');

/**
 * Create `Game#` singleton.
 */

var game = new Game();

/**
 * Expose `Game#`.
 */

module.exports = game;

/**
 * Set volume of audio elements.
 */

[
  'sfx-beep-1',
  'sfx-beep-2',
  'sfx-beep-3',
  'sfx-beep-4',
  'sfx-beep-5',
  'sfx-beep-high-1',
  'sfx-beep-high-2',
  'sfx-beep-high-3',
  'sfx-beep-high-4',
  'sfx-beep-high-5',
]
.forEach(function (selector) {
  var el = document.getElementById(selector);
  if (el) el.volume = 0.2;
});

// Set the initial field size
var dimension = getAvailableDimension();
resizeField(dimension);

// Show the player cursor on 'field.mouseenter'
game.field.self.addEventListener('mouseenter', game.player.show);

// Hide the player cursor on 'field.mouseleave'
game.field.self.addEventListener('mouseleave', game.player.hide);

// Move the player cursor on 'field.mousemove'
game.field.self.addEventListener('mousemove', game.player.move);

/**
 * Determines the smaller of the two body dimensions
 * height and width.
 *
 * @return {Number}
 * @api private
 */

function getAvailableDimension() {
  var bodyHeight = document.body.clientHeight;
  var bodyWidth = document.body.clientWidth;
  return bodyWidth >= bodyHeight
    ? bodyHeight
    : bodyWidth;
}

/**
 * Adjusts the size of the playing field.
 *
 * TODO Move to ./field.js
 *
 * @param {Number} dimension
 * @api private
 */

function resizeField(dimension) {
  game.field.self.style.height = dimension + 'px';
  game.field.self.style.width = dimension + 'px';
  // Update the dimension property of the Field object
  // as well as the config file
  game.field.dimension = game.config.dimension = dimension;
}
