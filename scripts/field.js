
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
