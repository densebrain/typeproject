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
	const pkg = getPkgJson()
	pkg.version = semver.inc(pkg.version,'patch')
	writeJSONFileSync(`${projectDir}/package.json`,pkg)
}



function releaseTag(done) {
	const pkgConfig = getPkgJson()
	const msg = `[Release] Release Push ${pkgConfig.version}`

	return gulp.src('.')
		.pipe(git.add())
		.pipe(git.commit(msg))
		.on('error',err => {
			log.error(`Failed to commit for release: ${err}`,err)
			return done(err)
		})
		.on('end',err => {
			if (err)
				return done(err)

			git.tag(`v${pkgConfig.version}`,msg,tagErr => {
				if (tagErr) {
					log.error(`Failed to tag ${tagErr}`,tagErr)
					return done(tagErr)
				}

				git.push('origin','master', pushErr => {
					if (pushErr)
						return done(pushErr)

					log.info(`Push completed for ${pkgConfig.version}`)
					done()
				})
			})
		})

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