#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const shell = require('shelljs');

if (!shell.which('curl')) {
  shell.echo('Sorry, this script requires `curl`');
  shell.exit(1);
}

let examples = {
  aframe: {
    dir: path.join(__dirname, '..'),
    pkg: require('../package.json'),
    version: 'latest'
  }
};

examples.aframe.vendorDir = path.join(examples.aframe.dir, 'vendor');
examples.aframe.vendorDirAframeJs = path.join(examples.aframe.vendorDir, 'aframe', 'js');

try {
  examples.aframe.version = examples.aframe.pkg.vendorDependencies.aframe || examples.aframe.pkg.dependencies.aframe;
} catch (err) {
}

shell.rm('-rf', examples.aframe.vendorDir);
shell.mkdir('-p', examples.aframe.vendorDirAframeJs);
shell.echo(`curl https://unpkg.com/aframe@${examples.aframe.version}/dist/aframe-master.js > ${examples.aframe.vendorDirAframeJs}/.`);
shell.exec(`curl https://unpkg.com/aframe@${examples.aframe.version}/dist/aframe-master.js.map > ${examples.aframe.vendorDirAframeJs}/.`);
