
  // Define major entities
var fieldElem = document.getElementById('field'),
    field = new Field(fieldElem);

var scoreboardElem = document.getElementById('scoreboard'),
    scoreboard = new Scoreboard(scoreboardElem);

var healthbarElem = document.getElementById('healthbar');

var playerElem = document.getElementById('player'),
    player = new Player(playerElem);

  // Set volume of auio elements
document.getElementById('sfx-beep-1').volume = 0.2;
document.getElementById('sfx-beep-2').volume = 0.2;
document.getElementById('sfx-beep-3').volume = 0.2;
document.getElementById('sfx-beep-4').volume = 0.2;
document.getElementById('sfx-beep-5').volume = 0.2;
document.getElementById('sfx-beep-high-1').volume = 0.2;
document.getElementById('sfx-beep-high-2').volume = 0.2;
document.getElementById('sfx-beep-high-3').volume = 0.2;
document.getElementById('sfx-beep-high-4').volume = 0.2;
document.getElementById('sfx-beep-high-5').volume = 0.2;

  // Set the initial field size
var dimension = getAvailableDimension();
resizeField(dimension);

  // Adjust the field size on 'window.resize'
  // Note: Unnecessary with fixed field size
// window.addEventListener('resize', function () {
//   dimension = getAvailableDimension();
//   resizeField(dimension);
// });

  // Show the player cursor on 'field.mouseenter'
field.self.addEventListener('mouseenter', player.show);

  // Hide the player cursor on 'field.mouseleave'
field.self.addEventListener('mouseleave', player.hide);

  // Move the player cursor on 'field.mousemove'
field.self.addEventListener('mousemove', player.move);

/**
 * Determine the dimensions of the document.body
 * @return  {Integer}  The smaller of the height & width dimensions.
 */
function getAvailableDimension() {
  var bodyHeight = document.body.clientHeight;
  var bodyWidth = document.body.clientWidth;
  var dimension = bodyWidth >= bodyHeight
      ? bodyHeight
      : bodyWidth;
  return dimension;
}

/**
 * Adjust the size of the playing field.
 * @param   {Integer}  dimension  
 *          The smallest available dimension to be used
 *          as the height AND width of the playing field.
 */
function resizeField(dimension) {
  field.self.style.height = dimension + 'px';
  field.self.style.width = dimension + 'px';
    // Update the dimension property of the Field object
    // as well as the config file
  field.dimension = config.dimension = dimension;
}