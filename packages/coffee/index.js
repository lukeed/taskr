'use strict';

const extname = require('path').extname;
const compile = require('coffee-script').compile;

module.exports = function (task) {
  task.plugin('coffee', { every:true }, function * (file, opts) {
    opts = opts || {};

    // modify extension
    const ext = extname(file.base);
    file.base = file.base.replace(new RegExp(ext, 'i'), '.js');

    // compile output
    const out = compile(file.data.toString(), opts);

    if (opts.sourceMap && out.sourceMap) {
      const map = `${file.base}.map`;
      // add sourceMapping to file contents
      out.js += `//# sourceMappingURL=${map}`;
      // add sourcemap to `files` array
      this._.files.push({
        base: map,
        dir: file.dir,
        data: new Buffer(out.v3SourceMap) // <-- already stringified
      });
    }

    // update file's data
    file.data = new Buffer(out.js || out);
  });
}
