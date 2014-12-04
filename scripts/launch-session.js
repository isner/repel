
/**
 * Module dependencies.
 */

var config = require('./config');
var field = require('./prepare-game').field;

/**
 * Expose `LaunchSession`.
 */

module.exports = LaunchSession;

function LaunchSession() {
  this.ballNum = 0;

  this.start = function (launchSequence) {
    this.self = setInterval(launchSequence, config.launchRate);
  };

  this.end = function () {
    clearInterval(this.self);

    var checkForClear = setInterval(function () {
        // If field is clear of balls
      if (document.querySelectorAll('div.ball-anchor').length < 1) {
          // Show the continue message
        field.message.classList.remove('hide');
          // Bind 'click' event to start level
        field.self.addEventListener('click', config.startLevel);
        clearInterval(checkForClear);
      }
    }, 1000);

  };
}
