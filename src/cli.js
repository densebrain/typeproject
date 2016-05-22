require('./global')

const cmd = require('commander')

console.log(`
                       _
              . -  ' '   '  ' -.
           . '       _,._       ' .
         ,'        ;'    ";        ',
         |'         ',_ ,-'        .|
         | '.          '         .  |
         |   ' ,             . '    |
         |   |   ' - . _ . -|       |
         |               '. |       |
         |   |             '.       |
         |                   '.     |
         |   |                .,    |
         |                    . ,   |
         |   |               .  '   |
         |                  .   '   |
         |   |            .    '    |
         !.              '    '    .'
           '.|           '   ,   .
             ' ,        '   ,. '
                 ' - . ,  .-
                      ,  .
                     , .    :F_P:
                    , .
                    ,'
`)



// Create commands
cmd
	.version(typeProjectVersion)
	.command('create <name>')
	.description('Create a new typescript project')
	.action(name => {
		require('./create-project')(name)
	})
	.parse(process.argv);

// Help if nothing specified
if (!process.argv.slice(2).length) {
	cmd.outputHelp()
}
