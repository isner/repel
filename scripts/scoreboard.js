
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
 * Requires an element matching '#scoreboard'.
 */

function Scoreboard() {
  this.el = document.getElementById('scoreboard');
  this.ballNum = query('span.ballNum');
  this.ballTot = query('span.ballTot');
  this.levelNum = query('span.levNum');
  this.score = query('span.score');

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
