
/**
 * Module dependencies.
 */

var Emitter = require('component-emitter');
var classes = require('component-classes');
var events = require('component-events');
var query = require('component-query');
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
