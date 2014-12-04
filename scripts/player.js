
/**
 * Module dependencies.
 */

var config = require('./config');

/**
 * Expose `Player`.
 */

module.exports = Player;

function Player(element) {
  this.self = element;
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

  this.addCharge = function () {

      // Increment the charge
    this.charge = parseInt(this.center.innerHTML, 10) + 1;

      // If charge is sufficient, trigger overload!
    if (this.charge === config.player.maxCharge) {
      this.triggerOverload();
    }

  };

  this.isOverloaded = function () {

      // Before testing, update the charge count
    this.center.innerHTML = this.charge;

    // console.log('%c this.charge: ', 'background-color: #000; color: #FFF;', this.charge);


      // Test the charge count
    return this.self.classList.contains('overload');

  };

  this.triggerOverload = function () {

    this.self.classList.add('overload');
    var that = this;
    var overloadDurationId = setInterval(function () {
      if (that.charge === 0) {
        clearInterval(overloadDurationId);
        that.self.classList.remove('overload');
        return;
      }
      that.charge -= 1;
      player.center.innerHTML = that.charge;
    }, 1000 / 1);
  };

}
