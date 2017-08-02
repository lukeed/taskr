'use strict';

const assert = require('assert');
const path = require('path');

const Promise = require('bluebird');
const co = Promise.coroutine;
const SourceMapGenerator = require('source-map').SourceMapGenerator;
const SourceMapConsumer = require('source-map').SourceMapConsumer;
const convertSourceMap = require('convert-source-map');
const detectNewline = require('detect-newline');

const read = require('./utils/read');

const urlRegex = /^(https?|webpack(-[^:]+)?):\/\//;
const unixStylePath = value => value.split(path.sep).join('/');
const isString = value => typeof value === 'string' || value instanceof String;

/**
 * Apply a source map to a taskr file, merging it into any existing sourcemaps
 *
 * @param {object} file
 * @param {object|string} sourceMap
 */
function applySourceMap(file, sourceMap) {
	if (isString(sourceMap)) {
		sourceMap = JSON.parse(sourceMap);
	}
	if (file.sourceMap && isString(file.sourceMap)) {
		file.sourceMap = JSON.parse(sourceMap);
	}

	assert(sourceMap.file, 'Source map is missing file');
	assert(sourceMap.mappings, 'Source map is missing mappings');
	assert(sourceMap.sources, 'Source map is missing sources');

	sourceMap.file = unixStylePath(sourceMap.file);
	sourceMap.sources = sourceMap.sources.map(unixStylePath);

	if (file.sourceMap && file.sourceMap.mappings !== '') {
		const generator = SourceMapGenerator.fromSourceMap(new SourceMapConsumer(sourceMap));
		generator.applySourceMap(new SourceMapConsumer(file.sourceMap));
		file.sourceMap = JSON.parse(generator.toString());
	} else {
		file.sourceMap = sourceMap;
	}
}

function loadInlineSourceMap(file, sources) {
	sources.map = convertSourceMap.fromSource(sources.data);
	if (!sources.map) return;

	sources.map = sources.map.toObject();
	sources.path = file.dir;
	sources.data = convertSourceMap.removeComments(sources.data);
}

const loadExternalSourceMap = co(function * (file, sources) {
	const comment = convertSourceMap.mapFileCommentRegex.exec(sources.data);
	if (!comment) return;

	const mapFile = path.resolve(file.dir, comment[1] || comment[2]);
	const sourceMap = yield read(mapFile, 'utf8');
	sources.map = JSON.parse(sourceMap);
	sources.path = path.dirname(mapFile);
	sources.data = convertSourceMap.removeMapFileComments(sources.data);
});

const fixSourceMap = co(function * (file, sources) {
	const sourceMap = sources.map;
	const sourcePath = sources.path;

	const fixSource = co(function * (source, i) {
		let sourceContent = sourceMap.sourcesContent[i];
		const setContent = content => sourceMap.sourcesContent[i] = content;

		// Explicitly set falsy content to null
		setContent(sourceContent || null);

		if (source.match(urlRegex)) return;

		// Update source path relative to file
		let fullPath = path.resolve(sourcePath, source);
		sourceMap.sources[i] = unixStylePath(path.relative(file.dir, fullPath));

		if (sourceContent) return;

		// Load source content
		if (sourceMap.sourceRoot) {
			if (sourceMap.sourceRoot.match(urlRegex)) return;

			fullPath = path.resolve(sourcePath, sourceMap.sourceRoot, source);
		}

		if (fullPath === path.join(file.dir, file.base)) {
			sourceContent = file.data;
		} else {
			sourceContent = yield read(fullPath, 'utf8');
		}

		setContent(sourceContent);
	});

	yield Promise.all(sourceMap.sources.map(fixSource));

	return sourceMap;
});

/**
 * Load inline or external source map for a taskr file
 *
 * @param {object} file
 * @returns {Promise.<object | undefined>} sourcemap (if found)
 */
const loadSourceMap = co(function * (file) {
	const sources = {
		path: '',
		map: null,
		data: file.data.toString()
	};

	loadInlineSourceMap(file, sources);
	if (!sources.map) {
		yield loadExternalSourceMap(file, sources);
	}
	if (!sources.map) return;

	// Fix source map  and remove map comment from file
	const sourceMap = yield fixSourceMap(file, sources);
	file.data = sources.data;

	return sourceMap;
});

/**
 * Initialize source maps for files, loading existing if specified
 *
 * @param {File[]} files
 * @param {object} [opts]
 * @param {boolean} [opts.load = false]
 */
const initSourceMaps = co(function * (files, opts) {
	opts = opts || {};

	const initSourceMap = co(function * (file) {
		let sourceMap;
		if (opts.load) {
			sourceMap = yield loadSourceMap(file);
		}

		if (!sourceMap) {
			sourceMap = {
				version: 3,
				names: [],
				mappings: '',
				sources: [unixStylePath(file.base)],
				sourcesContent: [file.data.toString()]
			};
		}

		sourceMap.file = unixStylePath(file.base);
		file.sourceMap = sourceMap;
	});

	yield Promise.all(files.map(initSourceMap));
});

/**
 * Write source maps for files, adding them inline or as external files
 *
 * ```js
 * // Add source maps inline as comment in file
 * writeSourceMaps(task)
 *
 * // Add source maps as external files (*.map)
 * writeSourceMaps(task, '.');
 * writeSourceMaps(task, { dest: '.' });
 * ```
 *
 * @param {File[]} files
 * @param {string|object} [opts] destination or opts object
 * @param {string} [opts.dest] destination, relative to file, to write source maps
 */
const writeSourceMaps = co(function * (files, opts) {
	opts = opts || {};
	if (isString(opts)) {
		opts = { dest: opts };
	}

	const writeSourceMap = co(function * (file) {
		const sourceMap = file.sourceMap;
		if (!sourceMap) return;

		sourceMap.file = unixStylePath(file.base);
		sourceMap.sourceRoot = undefined;

		// Load content
		const loadContent = co(function * (source, i) {
			if (sourceMap.sourcesContent[i]) return;

			const sourcePath = path.resolve(file.dir, source);
			sourcemaps.sourcesContent[i] = yield read(sourcePath);
		});

		sourceMap.sourcesContent = sourceMap.sourcesContent || [];
		yield Promise.all(sourceMap.sources.map(loadContent));

		const newline = detectNewline.graceful(file.data.toString() || '');
		const isCss = path.extname(file.base) === 'css';
		const toComment = isCss
			? data => `${newline}/*# ${data} */${newline}`
			: data => `${newline}//# ${data}${newline}`;

		let comment;
		if (opts.dest) {
			const base = `${file.base}.map`;
			const sourceMapPath = path.join(file.dir, opts.dest, base);
			const dir = path.dirname(sourceMapPath);
			const data = JSON.stringify(sourceMap);

			files.push({ base, dir, data });

			const sourceMapUrl = unixStylePath(path.relative(file.dir, sourceMapPath));
			comment = toComment(`sourceMappingURL=${sourceMapUrl}`);
		} else {
			const base64 = Buffer.from(JSON.stringify(sourceMap)).toString('base64');
			comment = toComment(`sourceMappingURL=data:application/json;charset=utf8;base64,${base64}`);
		}

		file.data = Buffer.concat([file.data, Buffer.from(comment)]);
	});

	yield Promise.all(files.map(writeSourceMap));
});

module.exports = exports = function(task) {
	task.plugin('initSourceMaps', { every: false, files: true }, initSourceMaps);
	task.plugin('writeSourceMaps', { every: false, files: true }, writeSourceMaps);
};

exports.applySourceMap = applySourceMap;
exports.loadSourceMap = loadSourceMap;
exports.initSourceMaps = initSourceMaps;
exports.writeSourceMaps = writeSourceMaps;
