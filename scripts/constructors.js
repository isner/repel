
/**
 * Module dependencies.
 */

var config = require('./config');
var PLAYER = config.player;
var field = require('./prepare-game').field;

/**
 * Expose constructors.
 */

module.exports = {
  Healthbar: Healthbar,
  Ball: Ball,
  Balloon: Balloon,
  BallExplosion: BallExplosion,
};

function Healthbar(element) {

  this.self = element;
  this.globes = document.querySelectorAll('#healthbar .globe');

  this.replenishAll = function () {
    var len = this.globes.length;
    for (var i = 0; i < len; i++) {
      this.globes[i].classList.remove('empty');
      this.globes[i].classList.add('full');
    }
  };

  this.depleteOne = function () {
    var len = this.globes.length;
    for (var i = len - 1; i >= 0; i--) {
      if (this.globes[i].className.indexOf('full') > -1) {
        this.globes[i].classList.remove('full');
        this.globes[i].classList.add('empty');
        break;
      }
    }
  };

  this.isEmpty = function () {
    var globeCount = this.globes.length;
    var emptyCount = document.querySelectorAll('#healthbar .globe.empty').length;
    return globeCount === emptyCount;
  };

}

function Ball(field) {

  this.self = document.createElement('div');
  this.self.classList.add('ball-anchor');

  this.lifespan = config.lifespan;
  this.position = {};

    // Pick a random bank
  this.bankIndex = Math.floor(Math.random() * 4); // 0-3
  this.bank = document.querySelector(config.banks[this.bankIndex]);

   // Pick a bank offest distance
  this.bankOffset = Math.floor((Math.random() * (field.dimension - 100)) + 50);

    // Position the ball in the bank
  if (this.bankIndex === 0) { // Top
    this.self.style.top = '0px';
    this.self.style.left = this.bankOffset + 'px';

  } else if (this.bankIndex === 1) { // Right
    this.self.style.top = this.bankOffset + 'px';
    this.self.style.left = field.dimension + 'px';

  } else if (this.bankIndex === 2) { // Bottom
    this.self.style.top = field.dimension + 'px';
    this.self.style.left = this.bankOffset + 'px';

  } else if (this.bankIndex === 3) { // Left
    this.self.style.top = this.bankOffset + 'px';
    this.self.style.left = '0px';

  }

     // Insert ball into the field
  field.self.appendChild(this.self);

    // Create a new balloon
  this.balloon = new Balloon(this);

  /**
   * Moves the ball.
   * @param {Array} vector
   * - The x and y values to move the ball per unit of time.
   *   Values are according to a web-document's cartesian system
   *   (positive x equals down, positive y equals right).
   */
  this.move = function (vector) {

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

  this.getVector = function (player) {

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

  this.makeSubtle = function () {
    this.balloon.self.classList.add('subtle');
  };

  this.explode = function () {
    this.balloon.self.classList.add('explode');
  };

  this.fadeOut = function () {
    this.balloon.self.classList.add('fadeOut');
  };

  this.destroy = function () {

      // Remove the ball's HTMLElement
    field.self.removeChild(this.self);
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
  this.collide = function (player) {

    if (!player) {
      throw new Error('.collide(player): parameter missing');
    }

      // Determine collision distance, based on balloon size
    var collDist = PLAYER.radius + this.balloon.radius;

      // Determine the current distance between
      // the centers of the player and ball
    var currDist = Math.sqrt(Math.pow(this.position.left - player.position.left, 2) + Math.pow(this.position.top - player.position.top, 2));

      // Return boolean
    return currDist <= collDist;

  };

  this.isHitBank = function () {

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

  this.isHitGoal = function (hitBankIndex) {
    return this.bankIndex === hitBankIndex - 1;
  };

}

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

function BallExplosion(ball) {

  this.element = document.createElement('div');
  this.element.classList.add('explosion');
  this.radius = ball.balloon.radius;

  field.self.appendChild(this.element);

  this.element.style.top = ball.position.top - this.radius + 'px';
  this.element.style.left = ball.position.left - this.radius + 'px';
  this.element.style.height = ball.balloon.size + 'px';
  this.element.style.width = ball.balloon.size + 'px';
  this.element.style.borderRadius = ball.balloon.radius + 'px';

  var that = this;
  this.destroy = function () {
    field.self.removeChild(that.element);
  };

  setTimeout(this.destroy, 400);

}