
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
