
/**
 * Module dependencies.
 */

var LaunchSession = require('./launch-session');
var Healthbar = require('./healthbar');

module.exports = startLevel;

/**
 * Generates a startLevel function for a given `Game#`.
 *
 * @param  {Game} game
 */

function startLevel(game) {
  function start() {
    game.field.levelNum ++;

    // Increase the thrust
    game.config.thrust += 0.1;
    console.log('config.thrust: ', game.config.thrust);

    // Increase the launch rate
    game.config.launchRate -= 40;
    console.log('config.launchRate: ', game.config.launchRate);

    // Prepare the scoreboard
    game.scoreboard.setTotalBallNum();
    game.scoreboard.setLevelNum(game.field.levelNum);

    // Destroy, create and replenish the healthbar
    var healthEl = document.getElementById('healthbar');
    game.healthbar = new Healthbar(healthEl);
    game.healthbar.replenishAll();

    // Hide the message
    game.field.message.classList.add('hide');

    // Display the next level number on the scoreboard
    game.field.nextLevMsg.innerHTML = game.field.levelNum + 1;

    // Unbind the continue 'click' event on the field
    game.field.el.removeEventListener('click', start);

    // Start a launch session
    game.launchSession = new LaunchSession(game);
    game.launchSession.start();
  }
  return start;

}
