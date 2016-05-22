const winston = require('winston')

const
	path = require('path'),
	rootDir = path.resolve(__dirname,'..'),
	packageConfig = require(`${rootDir}/package.json`),
	{version} = packageConfig

const logger = new (winston.Logger)({
	transports: [
		new (winston.transports.Console)({
			level: 'debug',
			colorize: true
		})
	]
})

logger.cli()

const
	gulp = require('gulp'),
	gutil = require('gulp-util'),
	del = require('del'),
	git = require('gulp-git'),
	ts = require('gulp-typescript'),
	glob = require('glob'),
	merge = require('merge2'),
	babel = require('gulp-babel'),
	mocha = require('gulp-mocha'),
	sourceMaps = require('gulp-sourcemaps'),
	helpers = require('./helpers'),
	fs = require('fs')


Object.assign(global,{
	log: logger,
	gulp,
	gutil,
	del,
	git,
	ts,
	glob,
	merge,
	babel,
	mocha,
	sourceMaps,
	fs,
	path,

	typeProjectVersion: version,

	// Path to typeproject file
	typeProjectConfigFile(rootDir) {
		return path.resolve(rootDir,'.typeproject')
	},

	// Create a TSConfig Object
	makeTsConfig: require('./make-tsconfig')
},require('./helpers'))


process.on('uncaughtException', function (err) {
	log.error(err.message,err);
});