require('source-map-support/register')
require('./src/global')

if (!global.gulp)
	global.gulp = require('gulp')

const
	gutil = require('gulp-util'),
	del = require('del'),
	git = require('gulp-git'),
	ts = require('gulp-typescript'),
	merge = require('merge2'),
	babel = require('gulp-babel'),
	mocha = require('gulp-mocha'),
	sourceMaps = require('gulp-sourcemaps'),
	path = require('path'),
	{makeCoreTasks} = require('./src/gulp-project-tasks'),
	{makeToolTasks} = require('./src/gulp-tool-tasks'),
	rootDir = path.resolve(__dirname),
	projectDir = (rootDir === process.cwd()) ?

		// If we are working on typeproject
		rootDir :

		// otherwise we are in node_modules
		path.resolve(__dirname,'../..')

log.info(`Project directory ${projectDir}`)

Object.assign(global, {
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
makeCoreTasks(gulp,rootDir,projectDir)
makeToolTasks(gulp,rootDir,projectDir)
log.info("Made tasks")