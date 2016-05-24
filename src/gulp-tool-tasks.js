require('./global')



function getPkgJson() {
	return readJSONFileSync(`${projectDir}/package.json`)
}

function tsConfigTask() {

	const tpConfigFile = typeProjectConfigFile(projectDir)

	if (!fs.existsSync(tpConfigFile))
		throw new Error(`${tpConfigFile} does not exist`)

	const tpConfig = (tpConfigFile)
	const pkgConfig = getPkgJson()
	const tsConfig = makeTsConfig(tpConfig, pkgConfig)

	writeJSONFileSync(`${projectDir}/tsconfig.json`, tsConfig)

}

function bumpVersion(){
	const bump = require('gulp-bump')
	
	return gulp.src(`${projectDir}/package.json`)
		.pipe(bump({type:'minor'}))
		.pipe(gulp.dest(projectDir));
}



function releaseTag() {
	const pkgConfig = getPkgJson()
	const msg = `[Release] Release Push ${pkgConfig.version}`

	gulp.src('.')
		.pipe(git.add())
		.pipe(git.commit(msg))
		.pipe(git.tag(`v${pkgConfig.version}`,msg))
		.pipe(git.push('origin','master'))

}


module.exports = {

	makeToolTasks(gulp,rootDir,projectDir) {

		// Make the paths available
		Object.assign(global,{rootDir,projectDir})

		// Create individual config tasks
		gulp.task('ts-config', [], tsConfigTask)

		// Make macro task
		gulp.task('config', ['ts-config'], () => {
			log.info('All configuration completed')
		})

		gulp.task('bump-version', [],bumpVersion)
		gulp.task('release-tag', ['bump-version'],releaseTag)
	}
}