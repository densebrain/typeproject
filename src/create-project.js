
require('shelljs/global')
config.fatal = true



const
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
			dependencies: {
				"reflect-metadata": "^0.1.3",
				"source-map-support": "^0.4.0"
			},
			devDependencies: {
				//"typeproject": typeProjectVersion,
				"typeproject": 'densebrain/typeproject',
				"babel-core": "^6.9.0",
				"babel-preset-es2015": "^6.9.0",
				"babel-preset-stage-0": "^6.5.0",
				"babel-register": "^6.9.0",
				"chai": "^3.5.0",
				"del": "^2.2.0",
				"glob": "^7.0.3",
				"gulp": "^3.9.1",
				"gulp-babel": "^6.1.2",
				"gulp-debug": "^2.1.2",
				"gulp-git": "^1.7.1",
				"gulp-mocha": "^2.2.0",
				"gulp-sourcemaps": "^1.6.0",
				"gulp-typescript": "^2.13.4",
				"gulp-util": "^3.0.7",
				"merge2": "^1.0.2",
				"mocha": "^2.4.5",
				"mocha-junit-reporter": "^1.11.1",
				"run-sequence": "^1.2.0",
				"semver": "^5.1.0",
				"sinon": "^1.17.4",
				"typescript": "^1.9.0-dev.20160519-1.0"
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


		// Copy common bits
		mkdir('-p', baseDir)
		log.info('Copying common files')
		cp('-rf',[
			`${tpDir}/.idea`,
			`${tpDir}/.babelrc`,
			`${tpDir}/.eslintrc`,
			`${tpDir}/.gitignore`,
			`${tpDir}/wallaby.js`,
			`${tpDir}/tslint.json`,
			`${tpDir}/typings`
		],baseDir)
		cp('-rf',`${tpDir}/src-template`,`${baseDir}/src`)

		// Update the projects.json
		const projectConfig = {
			name,type,description
		}

		const tpConfigFile = typeProjectConfigFile(baseDir)

		log.info(`Writing config to ${tpConfigFile}`)
		writeJSONFileSync(tpConfigFile, projectConfig)

		ShellString(`# ${name} Module (${name})\n\nReadme goes here`).to(`${baseDir}/README.md`)
		ShellString(`/// <reference path="./browser.d.ts"/>`).to(`${baseDir}/typings/index.d.ts`)
		
		
		
		
		// Create config files
		ShellString(makeTypingsJson(name))
			.to(`${baseDir}/typings.json`)
		ShellString(makePackageJson(name,description))
			.to(`${baseDir}/package.json`)
		ShellString(makeTsConfig(projectConfig,require(`${baseDir}/package.json`)))
			.to(`${baseDir}/tsconfig.json`)

		// Now create the gulpfile
		ShellString(`
		require('typeproject/gulpfile.babel')
		const gulp = require('gulp')
		
		//Add tasks, etc below
		`).to(`${baseDir}/gulpfile.babel.js`)


		



		cd(baseDir)
		mv(`${baseDir}/.idea/typeproject.iml`,`${baseDir}/.idea/${name}.iml`)
		sed('-i','typeproject',name,`${baseDir}/.idea/modules.xml`)
		rm(`${baseDir}/.idea/workspace.xml`)
		exec('git init')
		exec('npm install')


	}

	inquirer
		.prompt(questions)
		.then((answers) => {
			// Now create a new package with the answers
			makeProject(answers)
		})
		.catch(err => {
			log.error(err)
		})



}