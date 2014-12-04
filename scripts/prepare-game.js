
/**
 * Module dependencies.
 */

var config = require('./config');
var Scoreboard = require('./scoreboard');
var Player = require('./player');
var Field = require('./field');

/**
 * Define game entities.
 */

var fieldElem = document.getElementById('field');
var field = exports.field = new Field(fieldElem);

var scoreboardElem = document.getElementById('scoreboard');
exports.scoreboard = new Scoreboard(scoreboardElem);

exports.healthbarElem = document.getElementById('healthbar');

var playerElem = document.getElementById('player');
var player = exports.player = new Player(playerElem);

// Set volume of auio elements
document.getElementById('sfx-beep-1').volume = 0.2;
document.getElementById('sfx-beep-2').volume = 0.2;
document.getElementById('sfx-beep-3').volume = 0.2;
document.getElementById('sfx-beep-4').volume = 0.2;
document.getElementById('sfx-beep-5').volume = 0.2;
document.getElementById('sfx-beep-high-1').volume = 0.2;
document.getElementById('sfx-beep-high-2').volume = 0.2;
document.getElementById('sfx-beep-high-3').volume = 0.2;
document.getElementById('sfx-beep-high-4').volume = 0.2;
document.getElementById('sfx-beep-high-5').volume = 0.2;

// Set the initial field size
var dimension = getAvailableDimension();
resizeField(dimension);

// Show the player cursor on 'field.mouseenter'
field.self.addEventListener('mouseenter', player.show);

// Hide the player cursor on 'field.mouseleave'
field.self.addEventListener('mouseleave', player.hide);

// Move the player cursor on 'field.mousemove'
field.self.addEventListener('mousemove', player.move);

/**
 * Determine the smaller of the two body dimensions
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
 * Adjust the size of the playing field.
 *
 * @param {Number} dimension
 * @api private
 */

function resizeField(dimension) {
  field.self.style.height = dimension + 'px';
  field.self.style.width = dimension + 'px';
  // Update the dimension property of the Field object
  // as well as the config file
  field.dimension = config.dimension = dimension;
}
