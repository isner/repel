
/**
 * Module dependencies.
 */

var BallExplosion = require('./ball-explosion');
var Ball = require('./ball');

/**
 * Expose `LaunchSession`.
 */

module.exports = LaunchSession;

function LaunchSession(game) {
  var startLevel = require('./start-level');
  this.ballNum = 0;

  this.start = function () {
    var sequence = launchSequence.bind(this, game);
    this.self = setInterval(sequence, game.config.launchRate);
  };

  this.end = function () {
    clearInterval(this.self);

    var checkForClear = setInterval(function () {

      // If field is clear of balls
      if (document.querySelectorAll('div.ball-anchor').length < 1) {

        // Show the continue message
        game.field.message.classList.remove('hide');

        // Bind 'click' event to start level
        game.field.self.addEventListener('click', startLevel(game));

        clearInterval(checkForClear);
      }
    }, 1000);
  };
}

function launchSequence(game) {
  game.launchSession.ballNum ++;
  game.scoreboard.ballNum.innerHTML = game.launchSession.ballNum;

  // Create a ball
  var ball = new Ball(game.field);

  // Define an initial movement loop
  ball.initalMovementId = setInterval(function () {

    // Move the ball a bit
    ball.move();

    // If the player is dead
    if (game.healthbar.isEmpty()) {

      clearTimeout(ball.initalMovementId);
      ball.destroy();
      new BallExplosion(ball, game);
      game.launchSession.end();
    }

    // If ball hits any bank before contacting player
    if (ball.isHitBank() &&
        ball.isHitBank() - 1 !== ball.bankIndex) {

      clearTimeout(ball.initalMovementId);
      ball.destroy();
      new BallExplosion(ball, game);
      // Play sound
      game.field.missSound();
      // Player loses one health
      game.healthbar.depleteOne();

    }

    // Ball collides with player
    if (ball.collide(game.player)) {

      game.player.self.classList.add('opac80');
      var playerFlash = setTimeout(function () {
        game.player.self.classList.remove('opac80');
      }, 50);

      // Stop the initial movement loop
      clearInterval(ball.initalMovementId);

      ball.makeSubtle();

      // Find new vector
      var vector = ball.getVector(game.player);

      // Begin a redirected movement loop
      ball.redirectedMovementId = setInterval(function () {

        ball.move(vector);

        // If ball hits any bank
        if (ball.isHitBank()) {

          // If ball hits its goal
          if (ball.isHitGoal(ball.isHitBank())) {

            clearTimeout(ball.redirectedMovementId);
            // Explode the ball
            ball.explode();
            // Destroy the ball
            setTimeout(function () {
              ball.destroy();
            }, 400);
            // Count it!
            game.scoreboard.increaseScore(1);

            // Play sound
            game.field.scoreSound();

          // If ball hits the wrong bank
          } else {

            clearTimeout(ball.redirectedMovementId);
            ball.destroy();
            new BallExplosion(ball, game);
              // Play sound
            game.field.missSound();
              // Player loses one health
            game.healthbar.depleteOne();

          }

        } // ball.isHitBank()

      }, game.config.movementFPS);

    } // ball.collide(player)

  }, game.config.movementFPS);

    // The ball has lived too long - destroy it!
  ball.deathId = setTimeout(function () {
    ball.destroy();
  }, ball.lifespan);

    // Ball limit reached - end the lauch session
  if (game.launchSession.ballNum === game.config.totalBalls) {
    game.launchSession.end();
  }
}
