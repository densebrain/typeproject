require('./global')


/**
 * Get package JSON object
 *
 * @returns {*}
 */
function getPkgJson() {
	return readJSONFileSync(`${projectDir}/package.json`)
}

/**
 * Increment the package
 * JSON version
 *
 * @returns {*}
 */
function bumpVersion(){
	const pkg = getPkgJson()
	pkg.version = semver.inc(pkg.version,'patch')
	writeJSONFileSync(`${projectDir}/package.json`,pkg)
	return pkg.version
}


/**
 * Prepare for release my bumping version
 * and committing all unchanged files
 *
 * @returns {*}
 */
function releasePrepare() {
	const version = bumpVersion()
	return gulp.src('.')
		.pipe(git.add())
		.pipe(git.commit(`[Release] Release Push ${version}`))

	//	`${releaseDir}/${projectName}-${nextMinorVersion}.tar.gz`
	 // gulp.src(releaseFiles)
		// .pipe(ghRelease({
		// 	tag: `v${nextMinorVersion}`,
		// 	name: `TypeStore Release ${nextMinorVersion}`,
		// 	draft:false,
		// 	prerelease:false,
		// 	manifest:basePackageJson
		// }))

}

/**
 * Create release tag
 *
 * @param done
 */
function releaseTag(done) {
	const {version} = getPkgJson()
	const msg = `[Release] Release Push ${version}`

	git.tag(`v${version}`,msg,tagErr => {
		if (tagErr) {
			log.error(`Failed to tag ${tagErr}`,tagErr)
			return done(tagErr)
		}

		git.push('origin','master', {args: '--tags'}, pushErr => {
			if (pushErr)
				return done(pushErr)

			log.info(`Push completed for ${version}`)
			done()
		})
	})

}


/**
 * Publish packages to NPM
 *
 * @param project
 */
function publish(project) {
	if (releaseFiles.length < 1)
		throw new Error('No releases were created')

	const baseUrl = "https://github.com/densebrain/${{/releases/download"
	const releaseUrl = `${baseUrl}/v${nextMinorVersion}/${project.name}-${nextMinorVersion}.tar.gz`

	log.info(`Publishing ${project.name}@ ${nextMinorVersion} from ${releaseUrl}`)
	if (exec(`npm publish ${releaseUrl}`).code !== 0) {
		throw new Error(`Failed to publish ${project.name}`)
	}
}


/**
 * Export the creation functionality
 * @type {{makeReleaseTasks: (function(*, *, *))}}
 */
module.exports = (gulp,rootDir,projectDir) => {
	// Make the paths available
	Object.assign(global,{rootDir,projectDir})

	gulp.task('release-prepare', [],releasePrepare)
	gulp.task('release-tag', ['release-prepare'],releaseTag)

}