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
game.field.el.addEventListener('click', startLevel(game));

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

}, {"./launch-session":4,"./healthbar":5}],
4: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var BallExplosion = require('./ball-explosion');
var classes = require('component/classes');
var Ball = require('./ball');

/**
 * Expose `LaunchSession`.
 */

module.exports = LaunchSession;

function LaunchSession(game) {
  this.game = game;
  this.startLevel = require('./start-level');
  this.ballNum = 0;
}

LaunchSession.prototype.start = function () {
  var sequence = launchSequence.bind(this, this.game);
  this.self = setInterval(sequence, this.game.config.launchRate);
};

LaunchSession.prototype.end = function () {
  var self = this;
  var game = this.game;

  clearInterval(this.self);

  var checkForClear = setInterval(function () {

    // If field is clear of balls
    if (document.querySelectorAll('div.ball-anchor').length < 1) {

      // Show the continue message
      game.field.message.classList.remove('hide');

      if (game.healthbar.isEmpty()) {
        // Game over
        game.field.topRow.innerHTML = 'Game over';
        game.field.bottomRow.innerHTML = 'Refresh the page to try again';
      }
      else {
        // Bind 'click' event to start level
        game.field.el.addEventListener('click', self.startLevel(game));
      }

      clearInterval(checkForClear);
    }
  }, 1000);
};

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

      classes(game.player.el).add('opac80');
      var playerFlash = setTimeout(function () {
        classes(game.player.el).remove('opac80');
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

}, {"./ball-explosion":6,"component/classes":7,"./ball":8,"./start-level":2}],
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

  game.field.el.appendChild(this.element);

  this.element.style.top = ball.position.top - this.radius + 'px';
  this.element.style.left = ball.position.left - this.radius + 'px';
  this.element.style.height = ball.balloon.size + 'px';
  this.element.style.width = ball.balloon.size + 'px';
  this.element.style.borderRadius = ball.balloon.radius + 'px';

  var that = this;
  this.destroy = function () {
    game.field.el.removeChild(that.element);
  };

  setTimeout(this.destroy, 400);

}

}, {}],
7: [function(require, module, exports) {
/**
 * Module dependencies.
 */

try {
  var index = require('indexof');
} catch (err) {
  var index = require('component-indexof');
}

/**
 * Whitespace regexp.
 */

var re = /\s+/;

/**
 * toString reference.
 */

var toString = Object.prototype.toString;

/**
 * Wrap `el` in a `ClassList`.
 *
 * @param {Element} el
 * @return {ClassList}
 * @api public
 */

module.exports = function(el){
  return new ClassList(el);
};

/**
 * Initialize a new ClassList for `el`.
 *
 * @param {Element} el
 * @api private
 */

function ClassList(el) {
  if (!el || !el.nodeType) {
    throw new Error('A DOM element reference is required');
  }
  this.el = el;
  this.list = el.classList;
}

/**
 * Add class `name` if not already present.
 *
 * @param {String} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.add = function(name){
  // classList
  if (this.list) {
    this.list.add(name);
    return this;
  }

  // fallback
  var arr = this.array();
  var i = index(arr, name);
  if (!~i) arr.push(name);
  this.el.className = arr.join(' ');
  return this;
};

/**
 * Remove class `name` when present, or
 * pass a regular expression to remove
 * any which match.
 *
 * @param {String|RegExp} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.remove = function(name){
  if ('[object RegExp]' == toString.call(name)) {
    return this.removeMatching(name);
  }

  // classList
  if (this.list) {
    this.list.remove(name);
    return this;
  }

  // fallback
  var arr = this.array();
  var i = index(arr, name);
  if (~i) arr.splice(i, 1);
  this.el.className = arr.join(' ');
  return this;
};

/**
 * Remove all classes matching `re`.
 *
 * @param {RegExp} re
 * @return {ClassList}
 * @api private
 */

ClassList.prototype.removeMatching = function(re){
  var arr = this.array();
  for (var i = 0; i < arr.length; i++) {
    if (re.test(arr[i])) {
      this.remove(arr[i]);
    }
  }
  return this;
};

/**
 * Toggle class `name`, can force state via `force`.
 *
 * For browsers that support classList, but do not support `force` yet,
 * the mistake will be detected and corrected.
 *
 * @param {String} name
 * @param {Boolean} force
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.toggle = function(name, force){
  // classList
  if (this.list) {
    if ("undefined" !== typeof force) {
      if (force !== this.list.toggle(name, force)) {
        this.list.toggle(name); // toggle again to correct
      }
    } else {
      this.list.toggle(name);
    }
    return this;
  }

  // fallback
  if ("undefined" !== typeof force) {
    if (!force) {
      this.remove(name);
    } else {
      this.add(name);
    }
  } else {
    if (this.has(name)) {
      this.remove(name);
    } else {
      this.add(name);
    }
  }

  return this;
};

/**
 * Return an array of classes.
 *
 * @return {Array}
 * @api public
 */

ClassList.prototype.array = function(){
  var className = this.el.getAttribute('class') || '';
  var str = className.replace(/^\s+|\s+$/g, '');
  var arr = str.split(re);
  if ('' === arr[0]) arr.shift();
  return arr;
};

/**
 * Check if class `name` is present.
 *
 * @param {String} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.has =
ClassList.prototype.contains = function(name){
  return this.list
    ? this.list.contains(name)
    : !! ~index(this.array(), name);
};

}, {"indexof":9,"component-indexof":9}],
9: [function(require, module, exports) {
module.exports = function(arr, obj){
  if (arr.indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
}, {}],
8: [function(require, module, exports) {

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
  this.el = document.createElement('div');
  this.el.classList.add('ball-anchor');

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
    this.el.style.top = '0px';
    this.el.style.left = this.bankOffset + 'px';

  } else if (this.bankIndex === 1) { // Right
    this.el.style.top = this.bankOffset + 'px';
    this.el.style.left = this.field.dimension + 'px';

  } else if (this.bankIndex === 2) { // Bottom
    this.el.style.top = this.field.dimension + 'px';
    this.el.style.left = this.bankOffset + 'px';

  } else if (this.bankIndex === 3) { // Left
    this.el.style.top = this.bankOffset + 'px';
    this.el.style.left = '0px';

  }

  // Insert ball into the field
  this.field.el.appendChild(this.el);

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

  this.el.style.left = (this.position.left + vector[0]) + 'px';
  this.el.style.top = (this.position.top + vector[1]) + 'px';
  this.position.left = parseFloat(this.el.style.left);
  this.position.top = parseFloat(this.el.style.top);

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
  this.balloon.el.classList.add('subtle');
};

Ball.prototype.explode = function () {
  this.balloon.el.classList.add('explode');
};

Ball.prototype.fadeOut = function () {
  this.balloon.el.classList.add('fadeOut');
};

Ball.prototype.destroy = function () {
  // Remove the ball's HTMLElement
  this.field.el.removeChild(this.el);
  // Clear the ball's movement intervalId
  clearInterval(this.initialMovementId);
  // Clear the ball's redirected movement intervalId
  clearInterval(this.redirectedMovementId);
  // Clear the ball's death timeoutId
  clearTimeout(this.deathId);
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

}, {"./balloon":10,"./config":11}],
10: [function(require, module, exports) {

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
  this.el = document.createElement('div');
  this.el.classList.add('balloon');

  // Insert the skin into the ball
  ball.el.appendChild(this.el);

  // Color the ball to match its bank
  this.el.classList.add('bank' + ball.bankIndex);

  // Size the new ball, between 18 and 32 pixels
  // TODO should be only an even pixel size
  this.size = Math.floor(config.randomNum(18, 33));
  this.radius = this.size / 2;

  this.el.style.height = this.size + 'px';
  this.el.style.width = this.size + 'px';
  this.el.style.borderRadius = (this.size / 2) + 'px';
  this.el.style.top = -(this.size / 2) + 'px';
  this.el.style.left = -(this.size / 2) + 'px';

}

}, {"./config":11}],
11: [function(require, module, exports) {

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
  totalBalls: 10,

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
  this.el = element;
  this.globes = document.querySelectorAll(globesSelector, this.el);
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

// Set the initial field size
var dimension = getAvailableDimension();
resizeField(dimension);

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
  game.field.el.style.height = dimension + 'px';
  game.field.el.style.width = dimension + 'px';
  // Update the dimension property of the Field object
  // as well as the config file
  game.field.dimension = game.config.dimension = dimension;
}

/**
 * Configure audio.
 */

require('./config-audio')();

}, {"./game":12,"./config-audio":13}],
12: [function(require, module, exports) {

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

}, {"./scoreboard":14,"./player":15,"./field":16,"./config":11}],
14: [function(require, module, exports) {

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

}, {"component/query":17,"./config":11}],
17: [function(require, module, exports) {
function one(selector, el) {
  return el.querySelector(selector);
}

exports = module.exports = function(selector, el){
  el = el || document;
  return one(selector, el);
};

exports.all = function(selector, el){
  el = el || document;
  return el.querySelectorAll(selector);
};

exports.engine = function(obj){
  if (!obj.one) throw new Error('.one callback required');
  if (!obj.all) throw new Error('.all callback required');
  one = obj.one;
  exports.all = obj.all;
  return exports;
};

}, {}],
15: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var Emitter = require('component/emitter');
var classes = require('component/classes');
var events = require('component/events');
var query = require('component/query');
var config = require('./config');

var HIDDEN_CLASS = 'hidden';

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
  this.el = query('#player');
  this.center = query('.center', this.el);

  this.diameter = config.player.diameter;
  this.radius = this.diameter / 2;

  this.el.style.width = this.diameter + 'px';
  this.el.style.height = this.diameter + 'px';
  this.el.style.borderRadius = this.radius + 'px';

  this.position = {};
  this.velocity = {};
}

/**
 * Mixin `Emitter`.
 */

Emitter(Player.prototype);

Player.prototype.show = function () {
  classes(this.el).remove(HIDDEN_CLASS);
};

Player.prototype.hide = function () {
  classes(this.el).add(HIDDEN_CLASS);
};

Player.prototype.moveTo = function (coords) {
  this.el.style.top = (coords.y - this.radius).toString() + 'px';
  this.position.top = coords.y;
  this.el.style.left = (coords.x - this.radius).toString() + 'px';
  this.position.left = coords.x;
};

}, {"component/emitter":18,"component/classes":7,"component/events":19,"component/query":17,"./config":11}],
18: [function(require, module, exports) {

/**
 * Expose `Emitter`.
 */

if (typeof module !== 'undefined') {
  module.exports = Emitter;
}

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  function on() {
    this.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks['$' + event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks['$' + event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks['$' + event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks['$' + event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

}, {}],
19: [function(require, module, exports) {

/**
 * Module dependencies.
 */

try {
  var events = require('event');
} catch(err) {
  var events = require('component-event');
}

try {
  var delegate = require('delegate');
} catch(err) {
  var delegate = require('component-delegate');
}

/**
 * Expose `Events`.
 */

module.exports = Events;

/**
 * Initialize an `Events` with the given
 * `el` object which events will be bound to,
 * and the `obj` which will receive method calls.
 *
 * @param {Object} el
 * @param {Object} obj
 * @api public
 */

function Events(el, obj) {
  if (!(this instanceof Events)) return new Events(el, obj);
  if (!el) throw new Error('element required');
  if (!obj) throw new Error('object required');
  this.el = el;
  this.obj = obj;
  this._events = {};
}

/**
 * Subscription helper.
 */

Events.prototype.sub = function(event, method, cb){
  this._events[event] = this._events[event] || {};
  this._events[event][method] = cb;
};

/**
 * Bind to `event` with optional `method` name.
 * When `method` is undefined it becomes `event`
 * with the "on" prefix.
 *
 * Examples:
 *
 *  Direct event handling:
 *
 *    events.bind('click') // implies "onclick"
 *    events.bind('click', 'remove')
 *    events.bind('click', 'sort', 'asc')
 *
 *  Delegated event handling:
 *
 *    events.bind('click li > a')
 *    events.bind('click li > a', 'remove')
 *    events.bind('click a.sort-ascending', 'sort', 'asc')
 *    events.bind('click a.sort-descending', 'sort', 'desc')
 *
 * @param {String} event
 * @param {String|function} [method]
 * @return {Function} callback
 * @api public
 */

Events.prototype.bind = function(event, method){
  var e = parse(event);
  var el = this.el;
  var obj = this.obj;
  var name = e.name;
  var method = method || 'on' + name;
  var args = [].slice.call(arguments, 2);

  // callback
  function cb(){
    var a = [].slice.call(arguments).concat(args);
    obj[method].apply(obj, a);
  }

  // bind
  if (e.selector) {
    cb = delegate.bind(el, e.selector, name, cb);
  } else {
    events.bind(el, name, cb);
  }

  // subscription for unbinding
  this.sub(name, method, cb);

  return cb;
};

/**
 * Unbind a single binding, all bindings for `event`,
 * or all bindings within the manager.
 *
 * Examples:
 *
 *  Unbind direct handlers:
 *
 *     events.unbind('click', 'remove')
 *     events.unbind('click')
 *     events.unbind()
 *
 * Unbind delegate handlers:
 *
 *     events.unbind('click', 'remove')
 *     events.unbind('click')
 *     events.unbind()
 *
 * @param {String|Function} [event]
 * @param {String|Function} [method]
 * @api public
 */

Events.prototype.unbind = function(event, method){
  if (0 == arguments.length) return this.unbindAll();
  if (1 == arguments.length) return this.unbindAllOf(event);

  // no bindings for this event
  var bindings = this._events[event];
  if (!bindings) return;

  // no bindings for this method
  var cb = bindings[method];
  if (!cb) return;

  events.unbind(this.el, event, cb);
};

/**
 * Unbind all events.
 *
 * @api private
 */

Events.prototype.unbindAll = function(){
  for (var event in this._events) {
    this.unbindAllOf(event);
  }
};

/**
 * Unbind all events for `event`.
 *
 * @param {String} event
 * @api private
 */

Events.prototype.unbindAllOf = function(event){
  var bindings = this._events[event];
  if (!bindings) return;

  for (var method in bindings) {
    this.unbind(event, method);
  }
};

/**
 * Parse `event`.
 *
 * @param {String} event
 * @return {Object}
 * @api private
 */

function parse(event) {
  var parts = event.split(/ +/);
  return {
    name: parts.shift(),
    selector: parts.join(' ')
  }
}

}, {"event":20,"component-event":20,"delegate":21,"component-delegate":21}],
20: [function(require, module, exports) {
var bind = window.addEventListener ? 'addEventListener' : 'attachEvent',
    unbind = window.removeEventListener ? 'removeEventListener' : 'detachEvent',
    prefix = bind !== 'addEventListener' ? 'on' : '';

/**
 * Bind `el` event `type` to `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.bind = function(el, type, fn, capture){
  el[bind](prefix + type, fn, capture || false);
  return fn;
};

/**
 * Unbind `el` event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.unbind = function(el, type, fn, capture){
  el[unbind](prefix + type, fn, capture || false);
  return fn;
};
}, {}],
21: [function(require, module, exports) {
/**
 * Module dependencies.
 */

try {
  var closest = require('closest');
} catch(err) {
  var closest = require('component-closest');
}

try {
  var event = require('event');
} catch(err) {
  var event = require('component-event');
}

/**
 * Delegate event `type` to `selector`
 * and invoke `fn(e)`. A callback function
 * is returned which may be passed to `.unbind()`.
 *
 * @param {Element} el
 * @param {String} selector
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.bind = function(el, selector, type, fn, capture){
  return event.bind(el, type, function(e){
    var target = e.target || e.srcElement;
    e.delegateTarget = closest(target, selector, true, el);
    if (e.delegateTarget) fn.call(el, e);
  }, capture);
};

/**
 * Unbind event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @api public
 */

exports.unbind = function(el, type, fn, capture){
  event.unbind(el, type, fn, capture);
};

}, {"closest":22,"component-closest":22,"event":20,"component-event":20}],
22: [function(require, module, exports) {
/**
 * Module Dependencies
 */

try {
  var matches = require('matches-selector')
} catch (err) {
  var matches = require('component-matches-selector')
}

/**
 * Export `closest`
 */

module.exports = closest

/**
 * Closest
 *
 * @param {Element} el
 * @param {String} selector
 * @param {Element} scope (optional)
 */

function closest (el, selector, scope) {
  scope = scope || document.documentElement;

  // walk up the dom
  while (el && el !== scope) {
    if (matches(el, selector)) return el;
    el = el.parentNode;
  }

  // check scope for match
  return matches(el, selector) ? el : null;
}

}, {"matches-selector":23,"component-matches-selector":23}],
23: [function(require, module, exports) {
/**
 * Module dependencies.
 */

try {
  var query = require('query');
} catch (err) {
  var query = require('component-query');
}

/**
 * Element prototype.
 */

var proto = Element.prototype;

/**
 * Vendor function.
 */

var vendor = proto.matches
  || proto.webkitMatchesSelector
  || proto.mozMatchesSelector
  || proto.msMatchesSelector
  || proto.oMatchesSelector;

/**
 * Expose `match()`.
 */

module.exports = match;

/**
 * Match `el` to `selector`.
 *
 * @param {Element} el
 * @param {String} selector
 * @return {Boolean}
 * @api public
 */

function match(el, selector) {
  if (!el || el.nodeType !== 1) return false;
  if (vendor) return vendor.call(el, selector);
  var nodes = query.all(selector, el.parentNode);
  for (var i = 0; i < nodes.length; ++i) {
    if (nodes[i] == el) return true;
  }
  return false;
}

}, {"query":17,"component-query":17}],
16: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var Emitter = require('component/emitter');
var classes = require('component/classes');
var events = require('component/events');
var query = require('component/query');

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
  this.el = query('#field');
  this.levelNum = null;

  this.events = events(this.el, this);
  this.events.bind('mouseenter');
  this.events.bind('mouseleave');
  this.events.bind('mousemove');

  // User message
  this.message = document.querySelector('div.message');
  this.nextLevMsg = document.querySelector('span.nextLevNum');
  this.topRow = this.message.querySelector('.top-row');
  this.bottomRow = this.message.querySelector('.bottom-row');

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

/**
 * Mixin `Emitter`.
 */

Emitter(Field.prototype);

Field.prototype.onmouseenter = function () {
  this.emit('mouseenter');
};

Field.prototype.onmouseleave = function () {
  this.emit('mouseleave');
};

Field.prototype.onmousemove = function (e) {
  var field = this;
  field.emit('mousemove', {
    x: e.pageX - field.el.offsetLeft,
    y: e.pageY - field.el.offsetTop
  });
};

}, {"component/emitter":18,"component/classes":7,"component/events":19,"component/query":17}],
13: [function(require, module, exports) {

var audioSelectors = [
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
];

module.exports = configAudio;

function configAudio() {
  audioSelectors.forEach(function (selector) {
    var el = document.getElementById(selector);
    el.volume = 0.2;
  });
}

}, {}]}, {}, {"1":""})
