

module.exports = function(tpConfig,pkgConfig) {
	const excludedTyping = tpConfig.type === 'node' ?
		'browser' : 'main' +
	''
	return {
		"compilerOptions": {
		"target": "es6",
			"module": "commonjs",
			"moduleResolution": "node",
			"declaration": true,
			"emitDecoratorMetadata": true,
			"experimentalDecorators": true,
			"preserveConstEnums": true,
			"allowSyntheticDefaultImports": true,
			"sourceMap": true,
			"inlineSourceMap": true,
			"baseUrl": "./",
			"outDir": "dist",
			"paths": {
				[pkgConfig.name]: ["./src/index"],
				[`${pkgConfig.name}/*`]: ["./src/*"]
			}
		},
		"exclude": [
			"node_modules",
			`typings/${excludedTyping}.d.ts`,
			`typings/${excludedTyping}`,
			"dist"
		]
	}
}