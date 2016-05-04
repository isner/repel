
/**
 * Module dependencies.
 */

var startLevel = require('./start-level');

var game = require('./prepare-game');

// Set field level to default
game.field.levelNum = game.config.startLevel;

// Message shows upcoming level number
game.field.nextLevMsg.innerHTML = game.field.levelNum + 1;

// User clicks to continue
game.field.el.addEventListener('click', startLevel(game));
