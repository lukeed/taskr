'use strict';

const p = require('path');
const sass = require('node-sass');

module.exports = function (task, utils) {
  const render = utils.promisify(sass.render);

  // requires that `source()` is specifying MAIN files directly!
  task.plugin('sass', {}, function * (file, opts) {
    // ensure `opts.file` & not `opts.data`
    opts = Object.assign({}, opts, { file:p.format(file), data:null });

    // option checks for `sourceMap`
    if (opts.sourceMap && typeof opts.sourceMap === 'boolean' && !opts.outFile) {
      return this.emit('plugin_error', {
        plugin: '@taskr/sass',
        message: 'You must specify an `outFile` if using a `boolean` value for `sourceMap`.'
      });
    }

    // update extn to 'css'
    file.base = file.base.replace(/(s[a|c]ss)/i, 'css');

    const data = yield render(opts);

    // update the file's data
    file.data = data.css;

    // if has `map` & needed opts
    if (data.map) {
      const o = p.parse(opts.outFile || opts.sourceMap);
      // create new `file` entry
      this._.files.push({
        dir: o.dir,
        base: o.base,
        data: data.map
      });
    }
  });
};
