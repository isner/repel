
/**
 * Module dependencies.
 */

var stylus = require('stylus');
var jade = require('jade');
var path = require('path');
var fs = require('fs');

/**
 * Render jade.
 *
 * Uses a single file as entry point.
 */

var jadeFile = 'views/index.jade';

var html = jade.renderFile(jadeFile, {
  filename: jadeFile,
  pretty: true,
});

fs.writeFile('index.html', html, function (err) {
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

fs.readdir(stylesDir, function (err, files) {
  files.forEach(function (file) {
    if (path.extname(file) == '.styl') {
      fs.readFile(path.join(stylesDir, file), 'utf-8', function (err, data) {
        if (err) throw err;
        stylus.render(data, {
          filename: file
        }, function (err, css) {
          if (err) throw err;
          var dest = path.join(stylesDir, path.basename(file, '.styl')) + '.css';
          fs.writeFile(dest, css, function (err) {
            if (err) throw err;
          });
        });
      });
    }
  });
});
