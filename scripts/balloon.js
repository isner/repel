
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
