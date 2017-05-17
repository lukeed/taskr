declare namespace fly {
		export interface Instance {
			/**
			 * Start a Task by its name; may also pass initial values.
			 * Can return anything the Task is designed to.
			 */
			start(task: string, options?: object),

			/**
			 * Run a group of tasks simultaneously. Cascading is disabled
			 */
			parallel(tasks: Array<string>, options?: object): IterableIterator<any>,

			/**
			 * Run a group of tasks sequentially. Cascading is enabled
			 */
			serial(tasks: Array<string>, options?: object): IterableIterator<any>
		}

		export interface Utils {
			/**
			 * Print to console with timestamp and alert coloring
			 */
			alert(): void,

			/**
			 * Alias for `Bluebird.coroutine`.
			 */
			coroutine(generator: GeneratorFunction),

			/**
			 * Print to console with timestamp and error coloring.
			 */
			error(): void,

			/**
			 * Get all filepaths that match the glob pattern constraints.
			 */
			expand(globs: string | Array<string>, options: object)

			/**
			 * Find a complete filepath from a given path, or optional directory.
			 * @param {string} filename The file to file, may also be a complete filepath.
			 * @param {string} dir The directory to look within. Will be prepended to the filename value.
			 */
			find(filename: string, dir: string)

			/**
			 * Print to console with timestamp and normal coloring.
			 */
			log(): void

			/**
			 * Alias for `Bluebird.promisify`.
			 */
			promisify(fn: Function): Function

			/**
			 * Get a file's contents. Ignores directory paths.
			 * @param {string} filepath The full filepath to read.
			 * @param {object} options Additional options, passed to `fs.readFile`.
			 */
			read(filepath: string, options: object): IterableIterator<string |null | BufferSource>

			/**
			 * Parse and prettify an Error's stack.
			 */
			trace(stack: string): string

			/**
			 * Write given data to a filepath. Will create directories as needed.
			 */
			write(filepath: string, data: any , options: object)
		}

		type PluginOptions = {
			// pass
		}

		type InnerState = {
			/**
			 * The Task's active files.
			 * Each object contains a dir and base key from its pathObject and
			 * maintains the file's Buffer contents as a data key.
			 */
			files: Array<any>

			/**
			 * The Task's glob patterns, from task.source(). Used to populate `task._.files`.
			 */
			globs: Array<any>

			/**
			 * The Task's last-known (aka, outdated) set of glob patterns. Used only for `fly-watch`.
			 */
			prevs: Array<any>
		}

		export interface Task extends Instance {
			/**
			 * The directory wherein flyfile.js resides,
			 * now considered the root. Also accessible within plugins
			 */
			root: string

			/**
			 * The Task's internal state, populated by task.source().
			 * Also accessible within plugins.
			 */
			_: InnerState

			/**
			 * A collection of utility helpers to make life easy.
			 */
			$: Utils

			/**
			 * @param {string|Array<string>} globs Any valid glob pattern or array of patterns.
			 * @param {object} options Additional options, passed directly to `node-glob`.
			 */
			source(globs: Array<string> | string, options?: object)

			/**
			 * @param {Array<string>|string} dirs The destination folder(s).
			 * @param {object} options? Additional options, passed directly to fs.writeFile.
			 */
			target(dirs: Array<string> | string, options?: object)

			/**
			 * Perform an inline plugin.
			 * @param {Object} options pass plugins options
			 * @param {Function} plugin plugin generator function
			 */
			run(options: object, plugin: () => Iterator<any>)
		}
}
