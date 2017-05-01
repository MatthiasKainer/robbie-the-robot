#!/usr/bin/env node

const spawn = require("child_process").spawn;
const child = spawn("tsc -p . && mocha /test/**/*.ts");