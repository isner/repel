
var audioSelectors = [
  'sfx-beep-1',
  'sfx-beep-2',
  'sfx-beep-3',
  'sfx-beep-4',
  'sfx-beep-5',
  'sfx-beep-high-1',
  'sfx-beep-high-2',
  'sfx-beep-high-3',
  'sfx-beep-high-4',
  'sfx-beep-high-5',
];

module.exports = configAudio;

function configAudio() {
  audioSelectors.forEach(function (selector) {
    var el = document.getElementById(selector);
    el.volume = 0.2;
  });
}
