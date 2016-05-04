
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
