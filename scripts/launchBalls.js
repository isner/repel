/* global config,player,field,scoreboard */

  // Set field level to default
field.levelNum = config.startLevel;

  // Message shows upcoming level number
field.nextLevMsg.innerHTML = field.levelNum + 1;

  // User clicks to continue
field.self.addEventListener('click', startLevel);

  // Monitor player's overload charges
var checkOverloadId = setInterval(function () {
  if (player.isOverloaded()) {
    clearInterval(checkOverloadId);
    console.log('overload state in script');
  }
}, 1000 / 30);


//------------------------------------------------------

function startLevel() {

  field.levelNum ++;

    // Increase the thrust
  config.thrust += 0.1;
  console.log('config.thrust: ', config.thrust);

    // Increase the launch rate
  config.launchRate -= 20;
  console.log('config.launchRate: ', config.launchRate);

    // Prepare the scoreboard
  scoreboard.setTotalBallNum();
  scoreboard.setLevelNum(field.levelNum);

    // Destroy, create and replenish the healthbar
  healthbar = new Healthbar(healthbarElem);
  healthbar.replenishAll();

    // Hide the message
  field.message.classList.add('hide');

    // Display the next level number on the scoreboard
  field.nextLevMsg.innerHTML = field.levelNum + 1;

    // Unbind the continue 'click' event on the field
  field.self.removeEventListener('click', startLevel);

    // Start a launch session
  launchSession = new LaunchSession();
  launchSession.start(launchSequence);

}

function launchSequence() {

  launchSession.ballNum ++;
  scoreboard.ballNum.innerHTML = launchSession.ballNum;

    // Create a ball
  var ball = new Ball(field);

    // Define an initial movement loop
  ball.initalMovementId = setInterval(function () {

      // Move the ball a bit
    ball.move();

      // If the player is dead
    if (healthbar.isEmpty()) {

      clearTimeout(ball.initalMovementId);
      ball.destroy();
      new BallExplosion(ball);
      launchSession.end();
    }

      // If ball hits any bank before contacting player
    if (ball.isHitBank() &&
        ball.isHitBank() - 1 !== ball.bankIndex) {

      clearTimeout(ball.initalMovementId);
      ball.destroy();
      new BallExplosion(ball);
        // Play sound
      field.missSound();
        // Player loses one health
      healthbar.depleteOne();

    }

      // Ball collides with player
    if (ball.collide(player)) {

      player.self.classList.add('opac80');
      var playerFlash = setTimeout(function () {
        player.self.classList.remove('opac80');
      }, 50);

        // Stop the initial movement loop
      clearInterval(ball.initalMovementId);

      ball.makeSubtle();

        // Find new vector
      var vector = ball.getVector(player);

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
            scoreboard.increaseScore(1);
            // console.log('%c player.isOverloaded(): ', 'background-color: #000; color: #FFF;', player.isOverloaded());
            
            if (!player.isOverloaded()) {
              console.log('charge added');
              player.addCharge(); 
            }
              // Play sound
            field.scoreSound();

            // If ball hits the wrong bank
          } else {

            clearTimeout(ball.redirectedMovementId);
            ball.destroy();
            new BallExplosion(ball);
              // Play sound
            field.missSound();
              // Player loses one health
            healthbar.depleteOne();

          }

        } // ball.isHitBank()

      }, config.movementFPS);

    } // ball.collide(player)

  }, config.movementFPS);

    // The ball has lived too long - destroy it!
  ball.deathId = setTimeout(function () {
    ball.destroy();
  }, ball.lifespan);

    // Ball limit reached - end the lauch session
  if (launchSession.ballNum === config.totalBalls) {
    launchSession.end();
  }

}
