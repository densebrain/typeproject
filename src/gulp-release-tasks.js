require('./global')

const mkdirp = require('mkdirp')
const ghRelease = require('gulp-github-release')
const tar = require('gulp-tar')
const gzip = require('gulp-gzip')
const rename = require('gulp-rename')
const assert = require('assert')



function getReleaseFiles(projectName,version) {
	const releasesDir = `${projectDir}/target/releases`
	//gutil.log(`Using releases dir ${releasesDir}`)
	mkdirp.sync(releasesDir)

	const releaseTarFile = `${releasesDir}/${projectName}-${version}.tar`
	const releaseFile = `${releaseTarFile}.gz`

	return {
		releaseTarFile,
		releaseFile
	}
}

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
function releaseCommit() {
	const {version} = getPkgJson()

	const releasesDir = `${projectDir}/target/releases`
	gutil.log(`Using releases dir ${releasesDir}`)
	mkdirp.sync(releasesDir)

	return gulp.src('.')
		.pipe(git.add())
		.pipe(git.commit(`[Release] Release Push ${version}`))

}

function releaseArchive() {
	const {name:projectName} = getPkgJson()
	const version = bumpVersion()

	const {releaseTarFile,releaseFile} = getReleaseFiles(projectName,version)

	gutil.log(`Building release ${releaseFile}`)

	const releaseSrcs = [
		`**/*.*`,
		`!node_modules/**/*.*`,
		`!.idea/**/*.*`,
		`!target/**/*.*`,
	]

	const releaseTarFileRelative = path.relative(projectDir,releaseTarFile)
	gutil.log(`Using tar file = ${releaseTarFileRelative}`)

	return gulp.src(releaseSrcs,{base:projectDir})
		.pipe(rename((path) => path.dirname = projectName + '/' + path.dirname))
		.pipe(tar(releaseTarFileRelative))
		.pipe(gzip())
		.pipe(gulp.dest('.'))
}

/**
 * Create release tag
 */
function release() {
	const
		pkgJson = getPkgJson(),
		{version,name:projectName} = pkgJson,
		msg = `[Release] Release Push ${version}`

	const {releaseFile} = getReleaseFiles(projectName,version)

	return gulp.src([releaseFile])
		.pipe(ghRelease({
			tag: `v${version}`,
			name: `${projectName} Release ${version}`,
			notes: msg,
			draft:false,
			prerelease:false,
			manifest:pkgJson
		}))
	//
	// const targetPackageJsonFile = `${targetDir}/package.json`
	//
	//
	// git.tag(`v${version}`,msg,tagErr => {
	// 	if (tagErr) {
	// 		log.error(`Failed to tag ${tagErr}`,tagErr)
	// 		return done(tagErr)
	// 	}
	//
	// 	git.push('origin','master', {args: '--tags'}, pushErr => {
	// 		if (pushErr)
	// 			return done(pushErr)
	//
	// 		log.info(`Push completed for ${version}`)
	//
	// 		done()
	// 	})
	// })

}


/**
 * Publish packages to NPM
 *
 * @param project
 */
function publish() {
	const
		pkgJson = getPkgJson(),
		{
			version,
			name:projectName,
			repository:{
				type:repoType,
				url:gitRepoUrl
			}
		} = pkgJson,
		msg = `[Release] Release Push ${version}`

	assert(repoType === 'git' && gitRepoUrl.indexOf('github.com') > -1,'Repo config in package.json must be of type git and have a repo at github')
	//const {releaseFile} = getReleaseFiles(projectName,version)


	//const baseUrl = `https://github.com/densebrain/${}/releases/download`

	//const baseUrl = gitRepoUrl.re
	const baseUrl = 'https://github.com' + gitRepoUrl.split('github.com').pop().replace(/\.git$/,'') + '/releases/download'
	gutil.log(`Release base url ${baseUrl}`)

	const releaseUrl = `${baseUrl}/v${version}/${projectName}-${version}.tar.gz`
	gutil.log(`Release url ${releaseUrl}`)

	gutil.log(`Publishing ${projectName}@ ${version} from ${releaseUrl}`)

	const regExec = exec(`npm get registry`)
	if (regExec.code !== 0) {
		throw new Error(`Failed to publish ${projectName}`)
	}

	const reg = regExec.stdout

	try {
		exec(`npm set registry https://registry.npmjs.org/`)
		if (exec(`npm publish ${releaseUrl}`).code !== 0) {
			throw new Error(`Failed to publish ${projectName}`)
		}
	} finally {
		gutil.log(`Resetting to your local npm reg ${reg}`)
		exec(`npm set registry ${reg}`)
	}

}


/**
 * Export the creation functionality
 * @type {{makeReleaseTasks: (function(*, *, *))}}
 */
module.exports = (gulp,rootDir,projectDir) => {
	// Make the paths available
	Object.assign(global,{rootDir,projectDir})


	gulp.task('release-archive',['test'],releaseArchive)
	gulp.task('release-commit', ['release-archive'],releaseCommit)
	gulp.task('release', ['release-commit'],release)
	gulp.task('publish', ['release'],publish)

}