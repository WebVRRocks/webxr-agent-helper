const fs = require('fs');
const execSync = require('child_process').execSync;
const join = require('path').join;

const semver = require('semver');

const release = process.argv[2] || 'patch';
const metaPath = join(__dirname, '..', 'package.json');

// Bump the package version.
const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));

const newVersion = semver.inc(meta.version, release);

meta.version = newVersion;

console.log(`Bumping ${release} version to ${newVersion} …`);
fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));

// Build with the latest version.
console.log('Building latest …');
execSync('npm run build');

// Commit all changes to Git.
console.log('Committing changes …');
execSync('git add .');
execSync(`git commit -m ${newVersion}`);

// Create a new Git tag for this version.
console.log(`Creating v${newVersion} git tag …`);
execSync(`git tag -a v${newVersion} -m "v${newVersion}"`);

// Publish the version to npm.
console.log('Publishing to npm …');
execSync(`npm publish`);

// We do not automatically run `git push --tags` because we could be working from a fork
// (i.e., the `origin` remote is not the name of the upstream remote).
console.log('All done! Be sure to push changes to GitHub with `git push --tags` …');
