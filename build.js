
/**
 * Module dependencies.
 */

var toJs = require('html-to-js');
var stylus = require('stylus');
var jade = require('jade');
var path = require('path');
var Duo = require('duo');
var fs = require('fs');

var buildDir = 'build';

/**
 * Build js.
 */

Duo(__dirname)
.entry('scripts/index.js')
.write(function (err) {
  if (err) throw err;

  /**
   * Render jade into `index.html`.
   * Convert `index.html` into `index.js`.
   */

  var jadeFile = 'views/index.jade';

  var html = jade.renderFile(jadeFile, {
    filename: jadeFile,
    pretty: true,
  });

  var htmlOut = path.join(buildDir, 'index.html');
  var jsOut = path.join(buildDir, 'index.js');

  fs.writeFile(htmlOut, html, function (err) {
    if (err) throw err;
  });

  fs.writeFile(jsOut, toJs(html), function (err) {
    if (err) throw err;
  });

  /**
   * Render stylus.
   *
   * Handles only a single level deep in the
   * designated style-containing directory.
   * If a more complex directory structure
   * becomes necessary for styles, use a
   * recursive directory scan.
   */

  var stylesDir = 'styles';

  fs.mkdirSync(path.join(buildDir, stylesDir));

  fs.readdir(stylesDir, function (err, files) {
    files.forEach(function (file) {
      if (path.extname(file) == '.styl') {
        fs.readFile(path.join(stylesDir, file), 'utf-8', function (err, data) {
          if (err) throw err;
          var opts = { filename: file };
          stylus.render(data, opts, function (err, css) {
            if (err) throw err;
            var output = path.join('build', stylesDir, path.basename(file, '.styl')) + '.css';
            fs.writeFile(output, css, function (err) {
              if (err) throw err;
            });
          });
        });
      }
    });
  });

});
