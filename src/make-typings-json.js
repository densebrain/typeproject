module.exports = function(name,oldTypings) {
	let typings = {
		name,
			version: false,
		dependencies: {},
		ambientDependencies: {
			"node": "registry:dt/node#6.0.0+20160514165920"
		},
		ambientDevDependencies: {
			"chai": "registry:dt/chai#3.4.0+20160317120654",
				"mocha": "registry:dt/mocha#2.2.5+20160317120654"
		},
		devDependencies: {
			"chai": "registry:npm/chai#3.5.0+20160415060238",
				"sinon": "registry:npm/sinon#1.16.0+20160427193336"
		}
	}

	if (oldTypings) {
		typings = _.merge(oldTypings, typings)
	}

	return typings
}