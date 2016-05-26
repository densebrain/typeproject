
/**
 * @global log
 * @global typeProjectVersion
 * @global fs
 * @global glob
 * @global _
 * @global typeProjectConfigFile
 * @global path
 * @external path
 */

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
 * @param projectName
 * @return {*}
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

		//noinspection JSUnresolvedVariable
		const pkg = require('./make-package-json')(name,description)
		return JSON.stringify(pkg, null, 4)
	}


	function makeTypingsJson(name) {
		const typings = require('./make-typings-json')(name)
		return JSON.stringify(typings, null, 4)
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
			`${tpDir}/wallaby.js`,
			`${tpDir}/tslint.json`,
			`${tpDir}/typings`
		],baseDir)
		cp('-rf',`${tpDir}/template/*`,`${baseDir}/`)
		mv(`${baseDir}/gitignore`,`${baseDir}/.gitignore`)

		// Update the projects.json
		const projectConfig = {
			name,type,description
		}

		//noinspection JSUnresolvedFunction
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
		//noinspection JSUnresolvedFunction
		ShellString(makeTsConfig(projectConfig,require(`${baseDir}/package.json`)))
			.to(`${baseDir}/tsconfig.json`)

		// Now create the gulpfile
		//ShellString().to(`${baseDir}/gulpfile.babel.js`)






		cd(baseDir)
		mv(`${baseDir}/.idea/typeproject.iml`,`${baseDir}/.idea/${name}.iml`)
		sed('-i','typeproject',name,`${baseDir}/.idea/modules.xml`)
		//rm(`${baseDir}/.idea/workspace.xml`)
		exec('git init')
		exec('npm install')
		exec('npm test')


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