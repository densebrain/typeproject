#!/usr/bin/env node
require('source-map-support').install();
require('babel-register');

var path = require('path')
require(path.resolve(__dirname,'..','src/cli'))