require('source-map-support/register')

const path = require('path')
const fs = require('fs')

const SourceMapModes = {
	SourceMap: 1,
	InlineSourceMap: 2
}


module.exports = {
	SourceMapModes,
	makeCoreTasks(gulp,rootPath,projectDir,sourceMapMode = SourceMapModes.InlineSourceMap) {

		const basePath = projectDir,
			distPath = path.resolve(basePath, 'dist'),
			typingsPath = path.resolve(basePath, 'typings'),
			srcPath = path.resolve(basePath, 'src'),
			srcPaths = [
				`${typingsPath}/browser.d.ts`,
				`${typingsPath}/index.d.ts`,
				`${srcPath}/**/*.ts`
			]

		/**
		 * Create compile task
		 */
		gulp.task('compile', [], () => {
			const tsProject = ts.createProject(`${basePath}/tsconfig.json`, {
				typescript: require('typescript')
			})

			const tsResult = gulp
				.src(srcPaths)
				.pipe(sourceMaps.init())
				.pipe(ts(tsProject))


			/**
			 * Source map options
			 * basically just the source root
			 *
			 * @type {{sourceRoot: *, includeContent: boolean}}
			 */
			const sourcemapOpts = {
				sourceRoot: srcPath,
				includeContent: false
			}


			/**
			 * Create the source map handler based on the
			 * source map mode provided
			 */
			const sourceMapHandler = (sourceMapMode === SourceMapModes.SourceMap) ?
				// External source maps
				sourceMaps.write('.', sourcemapOpts) :
				// Inline source maps
				sourceMaps.write(sourcemapOpts)

			/**
			 * Merge all the resulting outputs
			 */
			return merge([
				tsResult.dts.pipe(gulp.dest(distPath)),
				tsResult.js
					.pipe(babel())
					.pipe(sourceMapHandler)
					.pipe(gulp.dest(distPath))
			])

		})


		function makeWatchTask(test = false) {
			return (done) => {
				const tasks = ['compile']
				if (test)
					tasks.push('test')

				const watcher = gulp.watch(srcPaths, tasks)

				watcher.on('change', event => {
					gutil.log("Files Changed: ", event.path)
				})

				watcher.on('error', event => {
					gutil.log(`Received watcher error`, event)
				})
			}
		}

		gulp.task('compile-watch', ['compile'], makeWatchTask())


		/**
		 * Create a test task
		 *
		 * @returns {function()}
		 */
		function makeMochaTask() {
			return () => {



				// Pick a reporter
				const reporter = (process.env.CIRCLE) ?
					'mocha-junit-reporter' :
					'spec'

				return gulp.src('dist/**/*.spec.js')
					.pipe(mocha({
						reporter,
						require: [
							"source-map-support/register",

							// Setup test environment
							'./dist/test/test-setup',

							// Require the core package
							'./dist/Globals'
						]
					}))

			}
		}

		/**
		 * Create 'test-all'
		 */
		gulp.task('test', ['compile'], makeMochaTask())
		gulp.task('tdd', ['compile', 'test'], makeWatchTask(true))
	}
}