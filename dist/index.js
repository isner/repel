(function outer(modules, cache, entries){

  /**
   * Global
   */

  var global = (function(){ return this; })();

  /**
   * Require `name`.
   *
   * @param {String} name
   * @param {Boolean} jumped
   * @api public
   */

  function require(name, jumped){
    if (cache[name]) return cache[name].exports;
    if (modules[name]) return call(name, require);
    throw new Error('cannot find module "' + name + '"');
  }

  /**
   * Call module `id` and cache it.
   *
   * @param {Number} id
   * @param {Function} require
   * @return {Function}
   * @api private
   */

  function call(id, require){
    var m = cache[id] = { exports: {} };
    var mod = modules[id];
    var name = mod[2];
    var fn = mod[0];

    fn.call(m.exports, function(req){
      var dep = modules[id][1][req];
      return require(dep ? dep : req);
    }, m, m.exports, outer, modules, cache, entries);

    // expose as `name`.
    if (name) cache[name] = cache[id];

    return cache[id].exports;
  }

  /**
   * Require all entries exposing them on global if needed.
   */

  for (var id in entries) {
    if (entries[id]) {
      global[entries[id]] = require(id);
    } else {
      require(id);
    }
  }

  /**
   * Duo flag.
   */

  require.duo = true;

  /**
   * Expose cache.
   */

  require.cache = cache;

  /**
   * Expose modules
   */

  require.modules = modules;

  /**
   * Return newest require.
   */

   return require;
})({
1: [function(require, module, exports) {

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
game.field.self.addEventListener('click', startLevel(game));

}, {"./start-level":2,"./prepare-game":3}],
2: [function(require, module, exports) {

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
  return function () {
    game.field.levelNum ++;

    // Increase the thrust
    game.config.thrust += 0.1;
    console.log('config.thrust: ', game.config.thrust);

    // Increase the launch rate
    game.config.launchRate -= 20;
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
    game.field.self.removeEventListener('click');

    // Start a launch session
    game.launchSession = new LaunchSession(game);
    game.launchSession.start();
  };
}

}, {"./launch-session":4,"./healthbar":5}],
4: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var BallExplosion = require('./ball-explosion');
var Ball = require('./ball');

/**
 * Expose `LaunchSession`.
 */

module.exports = LaunchSession;

function LaunchSession(game) {
  var startLevel = require('./start-level');
  this.ballNum = 0;

  this.start = function () {
    var sequence = launchSequence.bind(this, game);
    this.self = setInterval(sequence, game.config.launchRate);
  };

  this.end = function () {
    clearInterval(this.self);

    var checkForClear = setInterval(function () {

      // If field is clear of balls
      if (document.querySelectorAll('div.ball-anchor').length < 1) {

        // Show the continue message
        game.field.message.classList.remove('hide');

        // Bind 'click' event to start level
        game.field.self.addEventListener('click', startLevel(game));

        clearInterval(checkForClear);
      }
    }, 1000);
  };
}

function launchSequence(game) {
  game.launchSession.ballNum ++;
  game.scoreboard.ballNum.innerHTML = game.launchSession.ballNum;

  // Create a ball
  var ball = new Ball(game.field);

  // Define an initial movement loop
  ball.initalMovementId = setInterval(function () {

    // Move the ball a bit
    ball.move();

    // If the player is dead
    if (game.healthbar.isEmpty()) {

      clearTimeout(ball.initalMovementId);
      ball.destroy();
      new BallExplosion(ball, game);
      game.launchSession.end();
    }

    // If ball hits any bank before contacting player
    if (ball.isHitBank() &&
        ball.isHitBank() - 1 !== ball.bankIndex) {

      clearTimeout(ball.initalMovementId);
      ball.destroy();
      new BallExplosion(ball, game);
      // Play sound
      game.field.missSound();
      // Player loses one health
      game.healthbar.depleteOne();

    }

    // Ball collides with player
    if (ball.collide(game.player)) {

      game.player.self.classList.add('opac80');
      var playerFlash = setTimeout(function () {
        game.player.self.classList.remove('opac80');
      }, 50);

      // Stop the initial movement loop
      clearInterval(ball.initalMovementId);

      ball.makeSubtle();

      // Find new vector
      var vector = ball.getVector(game.player);

      // Begin a redirected movement loop
      ball.redirectedMovementId = setInterval(function () {

        ball.move(vector);

        // If ball hits any bank
        if (ball.isHitBank()) {

          // If ball hits its goal
          if (ball.isHitGoal(ball.isHitBank())) {

            clearTimeout(ball.redirectedMovementId);
            // Explode the ball
            ball.explode();
            // Destroy the ball
            setTimeout(function () {
              ball.destroy();
            }, 400);
            // Count it!
            game.scoreboard.increaseScore(1);

            // Play sound
            game.field.scoreSound();

          // If ball hits the wrong bank
          } else {

            clearTimeout(ball.redirectedMovementId);
            ball.destroy();
            new BallExplosion(ball, game);
              // Play sound
            game.field.missSound();
              // Player loses one health
            game.healthbar.depleteOne();

          }

        } // ball.isHitBank()

      }, game.config.movementFPS);

    } // ball.collide(player)

  }, game.config.movementFPS);

    // The ball has lived too long - destroy it!
  ball.deathId = setTimeout(function () {
    ball.destroy();
  }, ball.lifespan);

    // Ball limit reached - end the lauch session
  if (game.launchSession.ballNum === game.config.totalBalls) {
    game.launchSession.end();
  }
}

}, {"./ball-explosion":6,"./ball":7,"./start-level":2}],
6: [function(require, module, exports) {

/**
 * Expose `BallExplosion`.
 */

module.exports = BallExplosion;

/**
 * Creates a new instance of `BallExplosion`.
 *
 * @param {Ball} ball
 * @param {Game} game
 */

function BallExplosion(ball, game) {
  this.element = document.createElement('div');
  this.element.classList.add('explosion');
  this.radius = ball.balloon.radius;

  game.field.self.appendChild(this.element);

  this.element.style.top = ball.position.top - this.radius + 'px';
  this.element.style.left = ball.position.left - this.radius + 'px';
  this.element.style.height = ball.balloon.size + 'px';
  this.element.style.width = ball.balloon.size + 'px';
  this.element.style.borderRadius = ball.balloon.radius + 'px';

  var that = this;
  this.destroy = function () {
    game.field.self.removeChild(that.element);
  };

  setTimeout(this.destroy, 400);

}

}, {}],
7: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var Balloon = require('./balloon');
var config = require('./config');

/**
 * Expose `Ball`.
 */

module.exports = Ball;

/**
 * Creates a new `Ball`.
 *
 * @param {Field} field
 */

function Ball(field) {
  this.self = document.createElement('div');
  this.self.classList.add('ball-anchor');

  this.lifespan = config.lifespan;
  this.position = {};
  this.field = field;

  // Pick a random bank
  this.bankIndex = Math.floor(Math.random() * 4); // 0-3
  this.bank = document.querySelector(config.banks[this.bankIndex]);

  // Pick a bank offest distance
  this.bankOffset = Math.floor((Math.random() * (this.field.dimension - 100)) + 50);

  // Position the ball in the bank
  if (this.bankIndex === 0) { // Top
    this.self.style.top = '0px';
    this.self.style.left = this.bankOffset + 'px';

  } else if (this.bankIndex === 1) { // Right
    this.self.style.top = this.bankOffset + 'px';
    this.self.style.left = this.field.dimension + 'px';

  } else if (this.bankIndex === 2) { // Bottom
    this.self.style.top = this.field.dimension + 'px';
    this.self.style.left = this.bankOffset + 'px';

  } else if (this.bankIndex === 3) { // Left
    this.self.style.top = this.bankOffset + 'px';
    this.self.style.left = '0px';

  }

  // Insert ball into the field
  this.field.self.appendChild(this.self);

  // Create a new balloon
  this.balloon = new Balloon(this);

}

/**
 * Moves the ball.
 * @param {Array} vector
 * - The x and y values to move the ball per unit of time.
 *   Values are according to a web-document's cartesian system
 *   (positive x equals down, positive y equals right).
 */

Ball.prototype.move = function (vector) {
  var defaultVectors = [
    [0, config.thrust],
    [-config.thrust, 0],
    [0, -config.thrust],
    [config.thrust, 0]
  ];

  // Use supplied vector param, if supplied
  // Otherwise use default vector
  vector = vector ? vector : defaultVectors[this.bankIndex];

  this.self.style.left = (this.position.left + vector[0]) + 'px';
  this.self.style.top = (this.position.top + vector[1]) + 'px';
  this.position.left = parseFloat(this.self.style.left);
  this.position.top = parseFloat(this.self.style.top);

};

Ball.prototype.getVector = function (player) {
  // Relative position of ball to player
  var x = this.position.left - player.position.left;
  var y = this.position.top - player.position.top;
  // Angle in radians
  var theta = Math.atan2(-y, x);
  // Ensure non-negative value (necessary?)
  if (theta < 0) { theta += 2 * Math.PI; }
  // Convert radians to degrees
  var angle = theta * (180 / Math.PI);
  // Find new vector
  var vecX = Math.cos(angle * Math.PI / 180) * config.thrust;
  var vecY = -Math.sin(angle * Math.PI / 180) * config.thrust;

  var vector = [vecX, vecY];
  return vector;

};

Ball.prototype.makeSubtle = function () {
  this.balloon.self.classList.add('subtle');
};

Ball.prototype.explode = function () {
  this.balloon.self.classList.add('explode');
};

Ball.prototype.fadeOut = function () {
  this.balloon.self.classList.add('fadeOut');
};

Ball.prototype.destroy = function () {
  // Remove the ball's HTMLElement
  this.field.self.removeChild(this.self);
  // Clear the ball's movement intervalId
  clearInterval(this.initialMovementId);
  // Clear the ball's redirected movement intervalId
  clearInterval(this.redirectedMovementId);
  // Clear the ball's death timeoutId
  clearTimeout(this.deathId);
  // Delete the object
  delete this;

};

/**
 * Detects collision between this ball and the player.
 * @param  {Object}  player - The player object.
 * @return {Boolean}        - Answers: did collision occur?
 */

Ball.prototype.collide = function (player) {
  if (!player) {
    throw new Error('Ball#collide: missing `player` argument');
  }
  // Determine collision distance, based on balloon size
  var collDist = player.radius + this.balloon.radius;

  // Determine the current distance between
  // the centers of the player and ball
  var currDist = Math.sqrt(Math.pow(this.position.left - player.position.left, 2) + Math.pow(this.position.top - player.position.top, 2));

  // Return boolean
  return currDist <= collDist;

};

Ball.prototype.isHitBank = function () {
  var bankPositions = {
    'top': 20 + this.balloon.radius,
    'right': config.dimension - 20 - this.balloon.radius,
    'bottom': config.dimension - 20 - this.balloon.radius,
    'left': 20 + this.balloon.radius
  };

  if (this.position.top < bankPositions.top) {
    return 1;
  } else if (this.position.top > bankPositions.bottom) {
    return 3;
  } else if (this.position.left < bankPositions.left) {
    return 4;
  } else if (this.position.left > bankPositions.right) {
    return 2;
  } else {
    return null;
  }

};

Ball.prototype.isHitGoal = function (hitBankIndex) {
  return this.bankIndex === hitBankIndex - 1;
};

}, {"./balloon":8,"./config":9}],
8: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var config = require('./config');

/**
 * Expose `Balloon`.
 */

module.exports = Balloon;

/**
 * Creates a new instance of `Ball`.
 *
 * @param {Ball} ball
 */

function Balloon(ball) {
  this.self = document.createElement('div');
  this.self.classList.add('balloon');

  // Insert the skin into the ball
  ball.self.appendChild(this.self);

  // Color the ball to match its bank
  this.self.classList.add('bank' + ball.bankIndex);

  // Size the new ball, between 18 and 32 pixels
  // TODO should be only an even pixel size
  this.size = Math.floor(config.randomNum(18, 33));
  this.radius = this.size / 2;

  this.self.style.height = this.size + 'px';
  this.self.style.width = this.size + 'px';
  this.self.style.borderRadius = (this.size / 2) + 'px';
  this.self.style.top = -(this.size / 2) + 'px';
  this.self.style.left = -(this.size / 2) + 'px';

}

}, {"./config":9}],
9: [function(require, module, exports) {

module.exports = {

  dimension: 0,     // px, default: 0

  player: {
    diameter: 50,   // px, default: 50
    radius: 25,     // px, default: 25
    maxCharge: 5
  },

  /**
   * Test mode.
   */

  launchRate: 800,
  totalBalls: 3,

  /**
   * Melissa mode.
   */

  // launchRate: 400,
  // totalBalls: 50,

  lifespan: 1000 * 20,    // 1000 * {secs},
  movementFPS: 1000 / 60, // 1000 / {FPS}
  thrust: 1.1,            // No less than 1.0
  startLevel: 0,

  banks: [
    '.bank.top',
    '.bank.right',
    '.bank.bottom',
    '.bank.left'
  ],

  /**
   * Generates a random integer between min & max.
   * @param   {Number}  min  Lowest desired result.
   * @param   {Number}  max  Highest desired result.
   * @return  {Number}       The random result.
   */
  randomNum: function (min, max) {
    return Math.random() * (max - min) + min;
  }

};

}, {}],
5: [function(require, module, exports) {

var globesSelector = '.globe';

module.exports = Healthbar;

function Healthbar(element) {
  this.self = element;
  this.globes = document.querySelectorAll(globesSelector, this.self);
}

Healthbar.prototype.replenishAll = function () {
  var len = this.globes.length;
  for (var i = 0; i < len; i++) {
    this.globes[i].classList.remove('empty');
    this.globes[i].classList.add('full');
  }
};

Healthbar.prototype.depleteOne = function () {
  var len = this.globes.length;
  for (var i = len - 1; i >= 0; i--) {
    if (this.globes[i].className.indexOf('full') > -1) {
      this.globes[i].classList.remove('full');
      this.globes[i].classList.add('empty');
      break;
    }
  }
};

Healthbar.prototype.isEmpty = function () {
  var globeCount = this.globes.length;
  var emptyCount = document.querySelectorAll('#healthbar .globe.empty').length;
  return globeCount === emptyCount;
};

}, {}],
3: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var Game = require('./game');

/**
 * Create `Game#` singleton.
 */

var game = new Game();

/**
 * Expose `Game#`.
 */

module.exports = game;

/**
 * Set volume of audio elements.
 */

[
  'sfx-beep-1',
  'sfx-beep-2',
  'sfx-beep-3',
  'sfx-beep-4',
  'sfx-beep-5',
  'sfx-beep-high-1',
  'sfx-beep-high-2',
  'sfx-beep-high-3',
  'sfx-beep-high-4',
  'sfx-beep-high-5',
]
.forEach(function (selector) {
  var el = document.getElementById(selector);
  if (el) el.volume = 0.2;
});

// Set the initial field size
var dimension = getAvailableDimension();
resizeField(dimension);

// Show the player cursor on 'field.mouseenter'
game.field.self.addEventListener('mouseenter', game.player.show);

// Hide the player cursor on 'field.mouseleave'
game.field.self.addEventListener('mouseleave', game.player.hide);

// Move the player cursor on 'field.mousemove'
game.field.self.addEventListener('mousemove', game.player.move);

/**
 * Determines the smaller of the two body dimensions
 * height and width.
 *
 * @return {Number}
 * @api private
 */

function getAvailableDimension() {
  var bodyHeight = document.body.clientHeight;
  var bodyWidth = document.body.clientWidth;
  return bodyWidth >= bodyHeight
    ? bodyHeight
    : bodyWidth;
}

/**
 * Adjusts the size of the playing field.
 *
 * TODO Move to ./field.js
 *
 * @param {Number} dimension
 * @api private
 */

function resizeField(dimension) {
  game.field.self.style.height = dimension + 'px';
  game.field.self.style.width = dimension + 'px';
  // Update the dimension property of the Field object
  // as well as the config file
  game.field.dimension = game.config.dimension = dimension;
}

}, {"./game":10}],
10: [function(require, module, exports) {

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

}, {"./scoreboard":11,"./player":12,"./field":13,"./config":9}],
11: [function(require, module, exports) {

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

}, {"./config":9}],
12: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var config = require('./config');

/**
 * Expose `Player`.
 */

module.exports = Player;

/**
 * Creates a new instance of `Player`.
 *
 * Requires an element matching '#player'.
 */

function Player() {
  this.self = document.getElementById('player');

  if (!this.self) {
    throw new Error('unable to find `#player`');
  }

  this.center = document.querySelector('#player .center');

  this.diameter = config.player.diameter;
  this.self.style.width =
  this.self.style.height =
    this.diameter + 'px';

  this.radius = this.diameter / 2;
  this.self.style.borderRadius = this.radius + 'px';

  this.position = {};
  this.velocity = {};
  this.charge = 1;

  var player = this;

  this.show = function () {
    player.self.style.display = 'block';
  };

  this.hide = function () {
    player.self.style.display = 'none';
  };

  this.move = function (event) {
    player.self.style.top = (event.clientY - player.radius) + 'px';
    player.self.style.left = (event.clientX - player.radius) + 'px';
    player.position.top = event.clientY;
    player.position.left = event.clientX;
  };

}

}, {"./config":9}],
13: [function(require, module, exports) {

/**
 * Expose `Field`.
 */

module.exports = Field;

/**
 * Create a new instance of `Field`.
 *
 * Requires an element matching '#field'.
 */

function Field() {
  this.self = document.getElementById('field');
  this.levelNum = null;

  if (!this.self) {
    throw new Error('unable to find `#field`');
  }

  // User message
  this.message = document.querySelector('div.message');
  this.nextLevMsg = document.querySelector('span.nextLevNum');

  // Score sound
  this.scoreSoundVal = 1;
  this.scoreSound = function () {
    var audio = document.getElementById('sfx-beep-' + this.scoreSoundVal);

    audio.play();

    this.scoreSoundVal = this.scoreSoundVal < 5
      ? this.scoreSoundVal + 1
      : 1;

  };

  // Miss sound
  this.missSoundVal = 1;
  this.missSound = function () {
    var audio = document.getElementById('sfx-beep-high-' + this.missSoundVal);

    audio.play();

    this.missSoundVal = this.missSoundVal < 5
      ? this.missSoundVal + 1
      : 1;

  };

}

}, {}]}, {}, {"1":""})
