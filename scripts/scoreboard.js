
/**
 * Module dependencies.
 */

var config = require('./config');

/**
 * Expose `Scoreboard`.
 */

module.exports = Scoreboard;

/**
 * Create a new instance of `Scoreboard`.
 *
 * Requires an element matching '#scoreboard'.
 */

function Scoreboard() {
  this.self = document.getElementById('scoreboard');

  if (!this.self) {
    throw new Error('unable to find `#scoreboard`');
  }

  this.ballNum = document.querySelector('span.ballNum');
  this.ballTot = document.querySelector('span.ballTot');
  this.levelNum = document.querySelector('span.levNum');
  this.score = document.querySelector('span.score');

  this.setTotalBallNum = function () {
    this.ballTot.innerHTML = '&nbsp;of&nbsp;' + config.totalBalls;
  };

  this.setLevelNum = function (levelNum) {
    this.levelNum.innerHTML = levelNum;
  };

  this.increaseScore = function (by) {
    this.score.innerHTML = parseInt(this.score.innerHTML, 10) + by;
  };

}
