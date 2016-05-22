require('source-map-support/register')
require('./src/global')


const
	gulp = require('gulp'),
	path = require('path'),
	{makeCoreTasks} = require('./src/gulp-project-tasks'),
	{makeToolTasks} = require('./src/gulp-tool-tasks'),
	rootDir = path.resolve(__dirname),
	projectDir = (rootDir === process.cwd()) ?

		// If we are working on typeproject
		rootDir :

		// otherwise we are in node_modules
		path.resolve(__dirname,'../..')

log.info("Making tasks")
makeCoreTasks(gulp,rootDir,projectDir)
makeToolTasks(gulp,rootDir,projectDir)
log.info("Made tasks")