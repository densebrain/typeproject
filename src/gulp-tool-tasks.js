require('./global')

module.exports = {
	makeToolTasks(rootDir) {
		gulp.task('config', [], () => {
			const tpConfigFile = typeProjectConfigFile(rootDir)

			if (!fs.existsSync(tpConfigFile))
				throw new Error(`${tpConfigFile} does not exist`)

			const tpConfig = readJSONFileSync(tpConfigFile)
			const pkgConfig = readJSONFileSync(`${rootDir}/package.json`)
			const tsConfig = makeTsConfig(tpConfig, pkgConfig)

			writeJSONFileSync(`${rootDir}/tsconfig.json`, tsConfig)

		})
	}
}