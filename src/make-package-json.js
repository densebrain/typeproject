
require('./global')

module.exports = function(name, description, oldPkg = null) {
	//noinspection JSUnresolvedVariable
	let newPkg = {
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
			"typeproject": typeProjectVersion,
			//"typeproject": 'densebrain/typeproject',
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
	}


	// If there was an old pkg provided, then deep merge new
	// over old to keep deps
	if (oldPkg) {
		log.info('Merging new into old')
		newPkg = _.merge(oldPkg,newPkg)
	}

	return newPkg


}

