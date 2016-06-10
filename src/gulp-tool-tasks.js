require('./global')



function getPkgJson() {
	return readJSONFile(`${projectDir}/package.json`)
}

function tsConfigTask() {

	const tpConfigFile = typeProjectConfigFile(projectDir)

	if (!fs.existsSync(tpConfigFile))
		throw new Error(`${tpConfigFile} does not exist`)

	const tpConfig = (tpConfigFile)
	const pkgConfig = getPkgJson()
	const tsConfig = makeTsConfig(tpConfig, pkgConfig)

	writeJSONFile(`${projectDir}/tsconfig.json`, tsConfig)

}

function bumpVersion(){
	const pkg = getPkgJson()
	pkg.version = semver.inc(pkg.version,'patch')
	writeJSONFile(`${projectDir}/package.json`,pkg)
	return pkg.version
}


function releasePrepare() {
	const version = bumpVersion()
	return gulp.src('.')
		.pipe(git.add())
		.pipe(git.commit(`[Release] Release Push ${version}`))
}

function releaseTag(done) {
	const {version} = getPkgJson()
	const msg = `[Release] Release Push ${version}`

	git.tag(`v${version}`,msg,tagErr => {
		if (tagErr) {
			log.error(`Failed to tag ${tagErr}`,tagErr)
			return done(tagErr)
		}

		git.push('origin','master', pushErr => {
			if (pushErr)
				return done(pushErr)

			log.info(`Push completed for ${version}`)
			done()
		})
	})

}


module.exports = function(gulp,rootDir,projectDir) {

	// Make the paths available
	Object.assign(global,{rootDir,projectDir})

	// Create individual config tasks
	gulp.task('ts-config', [], tsConfigTask)

	// Make macro task
	gulp.task('config', ['ts-config'], () => {
		log.info('All configuration completed')
	})


	gulp.task('release-prepare', [],releasePrepare)
	gulp.task('release-tag', ['release-prepare'],releaseTag)

}