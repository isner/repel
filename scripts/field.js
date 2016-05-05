
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
