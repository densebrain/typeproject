require('source-map-support/register')
require('./src/global')

if (!global.gulp)
	global.gulp = require('gulp')

const
	semver = require('semver'),
	gutil = require('gulp-util'),
	del = require('del'),
	git = require('gulp-git'),
	ts = require('gulp-typescript'),
	merge = require('merge2'),
	babel = require('gulp-babel'),
	mocha = require('gulp-mocha'),
	sourceMaps = require('gulp-sourcemaps'),
	path = require('path'),
	makeCoreTasks = require('./src/gulp-project-tasks'),
	makeReleaseTasks = require('./src/gulp-release-tasks'),
	makeToolTasks = require('./src/gulp-tool-tasks'),
	rootDir = path.resolve(__dirname)

const isTypeProject = (rootDir === process.cwd()),
	projectDir = isTypeProject ?

		// If we are working on typeproject
		rootDir :

		// otherwise we are in node_modules
		process.cwd()//path.resolve(__dirname,'../..')

log.info(`Project directory ${projectDir}`)

Object.assign(global, {
	semver,
	gutil,
	del,
	git,
	ts,
	merge,
	babel,
	mocha,
	sourceMaps
})


log.info("Making tasks")

if (!isTypeProject) {
	makeCoreTasks(gulp, rootDir, projectDir)
	makeToolTasks(gulp, rootDir, projectDir)
} else {
	gulp.task('test', [], () => {
		gutil.log('TypeProject tests => none yet')
	})
}

makeReleaseTasks(gulp,rootDir,projectDir)

log.info("Made tasks")