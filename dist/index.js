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

var configAudio = require('./config-audio');
var Game = require('./game');

/**
 * Create and configure game.
 */

var game = new Game();

game.field.resize();

/**
 * Set volume of audio elements.
 */

configAudio();

}, {"./config-audio":2,"./game":3}],
2: [function(require, module, exports) {

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

}, {}],
3: [function(require, module, exports) {

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

}, {"./launch-session":4,"component/emitter":5,"component/classes":6,"./scoreboard":7,"./healthbar":8,"component/query":9,"./config":10,"./player":11,"./field":12}],
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

      // Show the message
      game.field.message.classList.remove('hide');

      if (game.healthbar.isEmpty()) {
        game.reset();
      }
      else {
        game.nextLevel();
      }

      clearInterval(checkForClear);
    }
  }, 1000);
};

function launchSequence(game) {
  game.launchSession.ballNum ++;

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

}, {"./ball-explosion":13,"component/classes":6,"./ball":14}],
13: [function(require, module, exports) {

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
6: [function(require, module, exports) {
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

}, {"indexof":15,"component-indexof":15}],
15: [function(require, module, exports) {
module.exports = function(arr, obj){
  if (arr.indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
}, {}],
14: [function(require, module, exports) {

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
  this.bankOffset = Math.floor((Math.random() * (this.field.size - 100)) + 50);

  // Position the ball in the bank
  if (this.bankIndex === 0) { // Top
    this.el.style.top = '0px';
    this.el.style.left = this.bankOffset + 'px';

  } else if (this.bankIndex === 1) { // Right
    this.el.style.top = this.bankOffset + 'px';
    this.el.style.left = this.field.size + 'px';

  } else if (this.bankIndex === 2) { // Bottom
    this.el.style.top = this.field.size + 'px';
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
    'right': config.size - 20 - this.balloon.radius,
    'bottom': config.size - 20 - this.balloon.radius,
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

}, {"./balloon":16,"./config":10}],
16: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var config = require('./config');

/**
 * Expose `Balloon`.
 */

module.exports = Balloon;

/**
 * Creates a new instance of `Balloon`.
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

}, {"./config":10}],
10: [function(require, module, exports) {

module.exports = {

  size: 0,          // px, default: 0

  player: {
    diameter: 50,   // px, default: 50
    radius: 25,     // px, default: 25
    maxCharge: 5
  },

  startLevel: 1,
  totalBalls: 10,
  launchRate: 760,
  launchRateBump: 40,     // millisecond decrease per level
  thrust: 1.2,            // No less than 1.0
  thrustBump: 0.1,        // px/sec increase per level
  lifespan: 1000 * 20,    // 1000 * {secs},
  movementFPS: 1000 / 60, // 1000 / {FPS}

  banks: [
    '.bank.top',
    '.bank.right',
    '.bank.bottom',
    '.bank.left'
  ],

  /**
   * Generates a random integer between min & max.
   *
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
7: [function(require, module, exports) {

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

}, {"component/query":9,"./config":10}],
9: [function(require, module, exports) {
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
8: [function(require, module, exports) {

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
11: [function(require, module, exports) {

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

}, {"component/emitter":5,"component/classes":6,"component/events":17,"component/query":9,"./config":10}],
17: [function(require, module, exports) {

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

}, {"event":18,"component-event":18,"delegate":19,"component-delegate":19}],
18: [function(require, module, exports) {
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
19: [function(require, module, exports) {
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

}, {"closest":20,"component-closest":20,"event":18,"component-event":18}],
20: [function(require, module, exports) {
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

}, {"matches-selector":21,"component-matches-selector":21}],
21: [function(require, module, exports) {
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

}, {"query":9,"component-query":9}],
12: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var Emitter = require('component/emitter');
var classes = require('component/classes');
var events = require('component/events');
var query = require('component/query');
var config = require('./config');

/**
 * Expose `Field`.
 */

module.exports = Field;

/**
 * Create a new instance of `Field`.
 *
 * @return {Field}
 * @api public
 */

function Field() {
  this.el = query('#field');
  this.levelNum = config.startLevel;

  this.events = events(this.el, this);
  this.events.bind('mouseenter');
  this.events.bind('mouseleave');
  this.events.bind('mousemove');
  this.events.bind('click');

  this.message = query('.message', this.el);
  this.nextLevMsg = query('.nextLevNum', this.el);
  this.topRow = query('.top-row', this.message);
  this.bottomRow = query('.bottom-row', this.message);

}

/**
 * Mixin `Emitter`.
 */

Emitter(Field.prototype);

/**
 * Size the field to match the available space.
 *
 * @param  {Number} size
 * @return {Field}
 */

Field.prototype.resize = function () {
  this.size = getAvailableSize();
  this.el.style.height = this.size + 'px';
  this.el.style.width = this.size + 'px';
  this.emit('resize', this.size);
  return this;
};

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

Field.prototype.onclick = function () {
  this.emit('click');
};

Field.prototype.bannerText = function (str) {
  this.topRow.innerHTML = str;
  return this;
};

Field.prototype.bannerSubtext = function (str) {
  this.bottomRow.innerHTML = str;
  return this;
};

Field.prototype.scoreSound = function () {
  var audioEl = query('#sfx-beep-' + randomAudio());
  audioEl.play();
};

Field.prototype.missSound = function () {
  var audioEl = query('#sfx-beep-high-' + randomAudio());
  audioEl.play();
};

/**
 * Determines the smaller of the two body dimensions
 * height and width.
 *
 * @return {Number}
 * @api private
 */

function getAvailableSize() {
  var bodyHeight = document.body.clientHeight;
  var bodyWidth = document.body.clientWidth;
  return bodyWidth >= bodyHeight
    ? bodyHeight
    : bodyWidth;
}

/**
 * Gets a random number between 1 and 5.
 *
 * @return {Number}
 */

function randomAudio() {
  return randomBetween(1, 5);
}

/**
 * Returns a random integer between `min` and `max` (inclusive).
 *
 * @param  {Number} min
 * @param  {Number} max
 * @return {Number}
 * @api private
 */

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

}, {"component/emitter":5,"component/classes":6,"component/events":17,"component/query":9,"./config":10}]}, {}, {"1":""})
