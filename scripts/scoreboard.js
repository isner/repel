
/**
 * Module dependencies.
 */

var query = require('component/query');
var config = require('./config');

/**
 * Expose `Scoreboard`.
 */

module.exports = Scoreboard;

/**
 * Create a new instance of `Scoreboard`.
 *
 * @return {Scoreboard}
 * @api public
 */

function Scoreboard() {
  this.el = document.getElementById('scoreboard');
  this.ballTot = query('span.ballTot');
  this.levelNum = query('span.levNum');
  this.score = query('span.score');

}

Scoreboard.prototype.setTotalBallNum = function () {
  this.ballTot.innerHTML = config.totalBalls;
  return this;
};

Scoreboard.prototype.setLevelNum = function (levelNum) {
  this.levelNum.innerHTML = levelNum;
  return this;
};

Scoreboard.prototype.increaseScore = function (by) {
  this.score.innerHTML = parseInt(this.score.innerHTML, 10) + by;
  return this;
};

/**
 * Sets the score to a given `num`.
 *
 * @param {Number} num
 * @api public
 */

Scoreboard.prototype.setScore = function (num) {
  this.score.innerHTML = num;
  return this;
};
