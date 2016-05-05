
/**
 * Module dependencies.
 */

var LaunchSession = require('./launch-session');
var Emitter = require('component/emitter');
var classes = require('component/classes');
var Scoreboard = require('./scoreboard');
var Healthbar = require('./healthbar');
var query = require('component/query');
var config = require('./config');
var Player = require('./player');
var Field = require('./field');

/**
 * Expose `Game`.
 */

module.exports = Game;

/**
 * Create a new instance of `Game`.
 *
 * @return {Game}
 * @api public
 */

function Game() {
  this.config = config;

  this.status = 0; // "idle"
  this.setLevel(this.config.startLevel);
  this.baseThrust = this.config.thrust;
  this.baseLaunchRate = this.config.launchRate;

  var player = this.player = new Player();
  var game = this;

  this.field = new Field()
    .on('mouseenter', player.show.bind(player))
    .on('mouseleave', player.hide.bind(player))
    .on('mousemove', function (coords) {
      player.moveTo(coords);
    })
    .on('click', function () {
      if (game.status === 0) {
        game.startLevel();
      }
    })
    .on('resize', function (size) {
      game.config.size = size;
    })
    .bannerText('Level ' + this.level);

  this.scoreboard = new Scoreboard()
    .setLevelNum(this.level);
    // .setTotalBallNum(this.config.totalBalls);
}

/**
 * Mixin `Emitter`.
 */

Emitter(Game.prototype);

/**
 * Set the game's level.
 *
 * @param {Number} num
 */

Game.prototype.setLevel = function (num) {
  this.level = num;
};

Game.prototype.nextLevel = function () {
  // Bump thrust and lauch rate
  this.config.thrust += this.config.thrustBump;
  this.config.thrust = parseFloat(this.config.thrust.toFixed(1));
  this.config.launchRate -= this.config.launchRateBump;

  this.setLevel(this.level + 1);
  this.status = 0; // "idle"
  this.field.bannerText('Level ' + this.level);
  this.field.bannerSubtext('Click anywhere to continue');
};

Game.prototype.reset = function () {
  this.config.thrust = this.baseThrust;
  this.config.launchRate = this.baseLaunchRate;
  this.setLevel(this.config.startLevel);
  this.status = 0; // "idle"
  this.field.bannerText('Game over');
  this.field.bannerSubtext('Click anywhere to try again');
};

Game.prototype.startLevel = function () {
  this.status = 1; // "in progress"

  console.log('speed:', this.config.thrust);
  console.log(' rate:', this.config.launchRate);

  // Prepare the scoreboard
  this.scoreboard.setLevelNum(this.level);
  if (this.level == 1) {
    this.scoreboard.setScore(0);
  }

  // Destroy, create and replenish the healthbar
  var healthEl = query('#healthbar');
  this.healthbar = new Healthbar(healthEl);
  this.healthbar.replenishAll();

  // Hide the message
  classes(this.field.message).add('hide');

  // Display the next level number on the scoreboard
  this.field.nextLevMsg.innerHTML = this.level + 1;

  // Start a launch session
  this.launchSession = new LaunchSession(this);
  this.launchSession.start();
};
