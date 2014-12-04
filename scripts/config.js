
module.exports = {

  dimension: 0, // px, default: 0

  player: {
    diameter: 50, // px, default: 50
    radius: 25, // px, default: 25
    maxCharge: 5
  },

    // Test mode
  launchRate: 1500,
  totalBalls: 15,

    // Melissa mode
  // launchRate: 400,
  // totalBalls: 50,

  lifespan: 1000 * 20,    // 1000 * {secs},
  movementFPS: 1000 / 60, // 1000 / {FPS}
  thrust: 1.1,            // No less than 1.0
  startLevel: 0,

  banks: [
    '.bank.top',
    '.bank.right',
    '.bank.bottom',
    '.bank.left'
  ],

  /**
   * Generates a random integer between min & max.
   * @param   {Integer}  min  Lowest desired result.
   * @param   {Integer}  max  Highest desired result.
   * @return  {Integer}       The random result.
   */
  randomNum: function (min, max) {
    return Math.random() * (max - min) + min;
  }

};
