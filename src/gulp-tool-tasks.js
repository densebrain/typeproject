require('./global')

module.exports = {
	makeToolTasks(gulp,rootDir,projectDir) {
		gulp.task('config', [], () => {
			const tpConfigFile = typeProjectConfigFile(projectDir)

			if (!fs.existsSync(tpConfigFile))
				throw new Error(`${tpConfigFile} does not exist`)

			const tpConfig = readJSONFileSync(tpConfigFile)
			const pkgConfig = readJSONFileSync(`${projectDir}/package.json`)
			const tsConfig = makeTsConfig(tpConfig, pkgConfig)

			writeJSONFileSync(`${projectDir}/tsconfig.json`, tsConfig)

		})
	}
}