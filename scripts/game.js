
/**
 * Module dependencies.
 */

var Scoreboard = require('./scoreboard');
var Player = require('./player');
var Field = require('./field');

module.exports = Game;

function Game() {
  this.config = require('./config');
  this.field = new Field();
  this.player = new Player();
  this.scoreboard = new Scoreboard();
}
