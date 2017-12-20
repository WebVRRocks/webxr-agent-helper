// This is the entry point if requiring/importing via Node, or a build tool that uses the `main` entry point
// in the the `package.json` (e.g., Browserify, Webpack). If running in Node with a mocked `window` available,
// globalize its members if needed. Otherwise, just continue to `./main.js`.
if (typeof global !== 'undefined' && global.window) {
  global.document = global.window.document;
  global.navigator = global.window.navigator;
}

import xrAgent from './index.js';

export default xrAgent;
