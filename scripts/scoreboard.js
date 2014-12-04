
/**
 * Module dependencies.
 */

var config = require('./config');

/**
 * Expose `Scoreboard`.
 */

module.exports = Scoreboard;

function Scoreboard(element) {
  this.self = element;
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
