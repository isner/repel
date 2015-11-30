
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
  this.self = document.getElementById('field');
  this.levelNum = null;

  if (!this.self) {
    throw new Error('unable to find `#field`');
  }

  // User message
  this.message = document.querySelector('div.message');
  this.nextLevMsg = document.querySelector('span.nextLevNum');

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
