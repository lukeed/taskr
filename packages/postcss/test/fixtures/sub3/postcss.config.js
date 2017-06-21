const autoprefixer = require('autoprefixer');

module.exports = conf => ({
	plugins: conf.plugins.concat(autoprefixer)
});
