
require('shelljs/global')
config.fatal = true

const
	path = require('path'),
	fs = require('fs'),
	inquirer = require('inquirer')


const {
	readJSONFileSync,
	writeJSONFileSync
} = require('./helpers')


/**
 * Creates a new project definition and
 * all required assets, finally update
 * etc/projects.json
 *
 * @param name
 */
module.exports = function(projectName) {
	const questions = [
		{
			type: 'input',
			name: 'name',
			default: projectName,
			message: 'New package name? i.e. my-cool-project - if you get the ref - hi five!',
			validate(newName) {
				return (/[A-Za-z0-9_-]/.test(newName)) ?
					true :
					"Name must be alphanumeric, -_ are acceptable"
			}
		},
		{
			type: 'list',
			name: 'type',
			message: 'Is the runtime node or browser',
			choices: ['node', 'browser']
		},
		{
			type: 'input',
			message: 'A quick - hopefully glib description',
			name: 'description'
		}
	]


	function makePackageJson(name, description) {
		return JSON.stringify({
			name,
			description: description || '',
			version: '0.0.1',
			main: "dist/index.js",
			typings: "dist/index.d.ts",
			scripts: {
				prepublish: "gulp config",
				test: "gulp test",
				compile: "gulp compile"
			},
			dependencies: {},
			devDependencies: {
				"typeproject": typeProjectVersion
			}
		}, null, 4)
	}


	function makeTypingsJson(name) {
		return JSON.stringify({
			name,
			version: false,
			dependencies: {},
			ambientDependencies: {
				"node": "registry:dt/node#6.0.0+20160514165920"
			},
			ambientDevDependencies: {
				"chai": "registry:dt/chai#3.4.0+20160317120654",
				"mocha": "registry:dt/mocha#2.2.5+20160317120654"
			},
			devDependencies: {
				"chai": "registry:npm/chai#3.5.0+20160415060238",
				"sinon": "registry:npm/sinon#1.16.0+20160427193336"
			}
		}, null, 4)
	}


	function makeProject(answers) {

		const {name,type,description} = answers

		const
			tpDir = path.resolve(__dirname,'..'),
			processDir = process.cwd(),
			baseDir = path.resolve(processDir, name)

		log.info(`Creating project ${name} @ ${baseDir}`)
		if (fs.existsSync(baseDir))
			throw new Error(`Package directory already exists ${baseDir}`)


		mkdir('-p', `${baseDir}/src/test`)
		mkdir('-p', `${baseDir}/typings`)

		// Update the projects.json
		const projectConfig = {
			name,type,description
		}

		const tpConfigFile = typeProjectConfigFile(baseDir)

		log.info(`Writing config to ${tpConfigFile}`)
		writeJSONFileSync(tpConfigFile, projectConfig)

		echo(`# ${name} Module (${name})\n\nReadme goes here`).to(`${baseDir}/README.md`)
		echo(`/// <reference path="./browser.d.ts"/>`).to(`${baseDir}/typings/index.d.ts`)
		echo(`// ${name}\n\nexport {\n\n}`).to(`${baseDir}/src/index.ts`)

		// Create config files
		echo(makeTypingsJson(name)).to(`${baseDir}/typings.json`)
		echo(makePackageJson(name,description)).to(`${baseDir}/package.json`)
		echo(makeTsConfig(projectConfig,require(`${baseDir}/package.json`)))

		// Now create the gulpfile
		echo(`require('typeproject/gulpfile.babel')\n\nconst {gulp} = global\n\n//Add tasks, etc below`).to(`${baseDir}/gulpfile.babel.js`)


		// Copy all the other bits
		log.info('Copying common files')
		cp('-f',[
			`${tpDir}/.babelrc`,
			`${tpDir}/.eslintrc`,
			`${tpDir}/.gitignore`,
			`${tpDir}/wallaby.js`,
			`${tpDir}/tslint.json`,
		],baseDir)

		cd(baseDir)
		exec('npm install')


	}

	inquirer
		.prompt(questions)
		.then((answers) => {
			// Now create a new package with the answers
			makeProject(answers)
		})



}