
var globesSelector = '.globe';

module.exports = Healthbar;

function Healthbar(element) {
  this.self = element;
  this.globes = document.querySelectorAll(globesSelector, this.self);
}

Healthbar.prototype.replenishAll = function () {
  var len = this.globes.length;
  for (var i = 0; i < len; i++) {
    this.globes[i].classList.remove('empty');
    this.globes[i].classList.add('full');
  }
};

Healthbar.prototype.depleteOne = function () {
  var len = this.globes.length;
  for (var i = len - 1; i >= 0; i--) {
    if (this.globes[i].className.indexOf('full') > -1) {
      this.globes[i].classList.remove('full');
      this.globes[i].classList.add('empty');
      break;
    }
  }
};

Healthbar.prototype.isEmpty = function () {
  var globeCount = this.globes.length;
  var emptyCount = document.querySelectorAll('#healthbar .globe.empty').length;
  return globeCount === emptyCount;
};
