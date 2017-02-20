#!/usr/bin/env node

var spawn = require('child_process').spawn;
var child = spawn('tsc -p . && mocha /test/**/*.ts');