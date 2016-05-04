
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

// Set the initial field size
var dimension = getAvailableDimension();
resizeField(dimension);

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
  game.field.el.style.height = dimension + 'px';
  game.field.el.style.width = dimension + 'px';
  // Update the dimension property of the Field object
  // as well as the config file
  game.field.dimension = game.config.dimension = dimension;
}

/**
 * Configure audio.
 */

require('./config-audio')();
