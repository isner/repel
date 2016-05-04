
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
