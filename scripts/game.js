
/**
 * Module dependencies.
 */

var Scoreboard = require('./scoreboard');
var Player = require('./player');
var Field = require('./field');

module.exports = Game;

function Game() {
  this.config = require('./config');

  var player = this.player = new Player();

  var field = this.field = new Field()
  .on('mouseenter', player.show.bind(player))
  .on('mouseleave', player.hide.bind(player))
  .on('mousemove', function (coords) {
    player.moveTo(coords);
  });

  this.scoreboard = new Scoreboard();
}
