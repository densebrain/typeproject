require('source-map-support/register')
require('./src/global')

const 
	path = require('path'),
	{makeCoreTasks} = require('./src/gulp-project-tasks'),
	{makeToolTasks} = require('./src/gulp-tool-tasks'),
	rootDir = path.resolve(__dirname)

makeCoreTasks(rootDir)
makeToolTasks(rootDir)
