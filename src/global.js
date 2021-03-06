require('shelljs/global')
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
	glob = require('glob'),
	helpers = require('./helpers'),
	fs = require('fs'),
	_ = require('lodash')

_.assign(global,{
	log: logger,
	glob,
	fs,
	path,
	_,
	typeProjectVersion: version,

	// Path to typeproject file
	typeProjectConfigFile(rootDir) {
		return path.resolve(rootDir,'.typeproject')
	},

	// Create a TSConfig Object
	makeTsConfig: require('./make-tsconfig-json')
},require('./helpers'))


// process.on('uncaughtException', function (err) {
// 	log.error(err.message,err);
// });