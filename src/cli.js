require('./global')

const
	cmd = require('commander')


cmd
	.version(typeProjectVersion)
	.command('create <name>')
	.description('Create a new typescript project')
	.action(name => {
		require('./create-project')(name)
	})

cmd.parse(process.argv);
