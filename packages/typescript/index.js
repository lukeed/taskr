'use strict';

const ts = require('typescript');
const extname = require('path').extname;

module.exports = function (task) {
  task.plugin('typescript', { every:true }, function * (file, options) {
    options = options || {};
    const opts = { fileName:file.base };

    // "steal" transpiler options from `options`
    if (options.moduleName) {
      opts.moduleName = options.moduleName;
    }

    if (options.renamedDependencies) {
      opts.renamedDependencies = options.renamedDependencies;
    }

    // everything else is `compilerOptions`
    opts.compilerOptions = options.compilerOptions || options;

    // modify extension
    const ext = new RegExp(extname(file.base).replace('.', '\\.') + '$', 'i');
    file.base = file.base.replace(ext, '.js');

    // compile output
    const result = ts.transpileModule(file.data.toString(), opts);

    if (opts.compilerOptions.sourceMap && result.sourceMapText) {
      // add sourcemap to `files` array
      this._.files.push({
        dir: file.dir,
        base: `${file.base}.map`,
        data: new Buffer(JSON.stringify(result.sourceMapText))
      });
    }

    // update file's data
    file.data = new Buffer(result.outputText);
  });
}
