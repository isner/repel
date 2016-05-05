
/**
 * Module dependencies.
 */

var configAudio = require('./config-audio');
var Game = require('./game');

/**
 * Create and configure game.
 */

var game = new Game();

game.field.resize();

/**
 * Set volume of audio elements.
 */

configAudio();
