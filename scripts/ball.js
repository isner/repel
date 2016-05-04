
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
