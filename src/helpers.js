const fs = require('fs')

function readJSONFileSync(filename) {
	return JSON.parse(fs.readFileSync(filename,'utf-8'))
}

function writeJSONFileSync(filename,json) {
	if (typeof json !== 'string')
		json = JSON.stringify(json,null,4)

	fs.writeFileSync(filename,json)
}

module.exports = {
	readJSONFileSync,
	writeJSONFileSync
}
