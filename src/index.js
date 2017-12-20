import EventHandlerBase from './lib/EventHandlerBase.js';
import { promiseRace } from './lib/Utils.js';

/**
 * `XRAgent` implements the functionality as a polyfill.
 * Code below will check for `navigator.xrAgent`, and, if it doesn't exist, will install this polyfill, so you can safely
 * include this script on any page.
 */
class XRAgent extends EventHandlerBase {
  constructor (device = null, mirrorCanvas = null) {
    super();

    this.device = device;
    this.mirrorCanvas = mirrorCanvas;

    this.usesAframe = false;
    this.usesThreeJs = false;
    this.aframeScene = null;
    this.mirrorCanvas = null;

    if (!this.device && ('navigator' in self) && typeof navigator.getVRDisplays === 'function') {
      navigator.getVRDisplays().then(devices => {
        for (let device of devices) {
          if (!device || !device.capabilities || !device.capabilities.canPresent) {
            continue;
          }
          // this.device = new HeadMountedDisplay(this, this._sharedRealities[0], device);
          this.device = device;
          this.dispatchEvent('devicechange', {device: device});
          return;
        }
      });
    }

    if (!this.mirrorCanvas && ('window' in self) && window.document) {
      const getScene = resolve => {
        const aframeSceneEl = document.querySelector('a-scene');
        const mirrorCanvasEl = aframeSceneEl.canvas || document.querySelector('canvas');
        if (aframeSceneEl) {
          return resolve({
            usesAframe: true,
            usesThreeJs: true,
            aframeScene: aframeSceneEl,
            mirrorCanvas: mirrorCanvasEl
          });
        }
        if (mirrorCanvasEl) {
          if (('THREE' in window) || ('WEBVR' in window)) {
            return resolve({
              usesAframe: false,
              usesThreeJs: true,
              mirrorCanvas: mirrorCanvasEl
            });
          } else {
            return resolve({
              usesAframe: null,
              usesThreeJs: null,
              mirrorCanvas: mirrorCanvasEl
            });
          }
        }
      };

      if (!this.outputContext) {
        promiseRace([
          new Promise(resolve => getScene(resolve)),
          new Promise(resolve => {
            document.addEventListener('DOMContentLoaded', () => {
              getScene(resolve);
            });
          }),
          new Promise(resolve => {
            document.addEventListener('load', () => {
              getScene(resolve);
            });
          })
        ]).then(scene => {
          this.usesAframe = scene.usesAframe;
          this.usesThreeJs = scene.usesThreeJs;
          this.aframeScene = scene.aframeScene;
          this.mirrorCanvas = scene.mirrorCanvas;
        });
      }
    }

    window.addEventListener('vrdisplaypresentchange', evt => {
      const device = evt.device || evt.display;
      const state = evt.state || (device.isPresenting ? 'presenting' : 'ready');
      if (!device || !state) {
        return;
      }
      this.device = device;
      this.dispatchEvent('devicechange', {
        state
      });
    });

    window.addEventListener('vrdisplayactivate', evt => {
      const device = evt.device || evt.display;
      const state = evt.state || 'activated';
      if (!device || !state) {
        return;
      }
      this.device = device;
      this.dispatchEvent('devicechange', {
        state
      });
    });

    window.addEventListener('vrdisplaydeactivate', evt => {
      const device = evt.device || evt.display;
      const state = evt.state || 'deactivated';
      if (!device || !state) {
        return;
      }
      this.device = device;
      this.dispatchEvent('devicechange', {
        state
      });
    });

    window.addEventListener('vrdisplayconnect', evt => {
      const device = evt.device || evt.display;
      const state = evt.state || 'connected';
      if (!device || !state) {
        return;
      }
      this.device = device;
      this.dispatchEvent('devicechange', {
        state
      });
    });

    window.addEventListener('vrdisplaydisconnect', evt => {
      const device = evt.device || evt.display;
      const state = evt.state || 'disconnected';
      if (!device || !state) {
        return;
      }
      this.device = null;
      this.dispatchEvent('devicechange', {
        state
      });
    });

    window.addEventListener('vrdisplaypointerrestricted', evt => {
      const device = evt.device || evt.display;
      const state = evt.state || 'pointerrestricted';
      if (!device || !state) {
        return;
      }
      this.device = device;
      this.dispatchEvent('devicechange', {
        state
      });
    });

    window.addEventListener('vrdisplaypointerunrestricted', evt => {
      const device = evt.device || evt.display;
      const state = evt.state || 'pointerunrestricted';
      if (!device || !state) {
        return;
      }
      this.device = device;
      this.dispatchEvent('devicechange', {
        state
      });
    });
  }

  requestDevice () {
    return Promise.resolve(this.device);
  }

  ondevicechange () {
    const args = Array.prototype.slice.call(arguments, 0);
    return this.addEventListener.apply(this, ['devicechange'].concat(args));
  }

  enter () {
    if (this.usesAframe) {
      return this.aframeScene.enterVR();
    }
    if (!this.mirrorCanvas) {
      return Promise.reject(new Error('Failed to enter XR (missing `<canvas>`)'));
    }
    return Promise((resolve, reject) => {
      if (display.isPresenting) {
        return Promise.resolve(true);
      }
      return display.requestPresent([
        {
          source: this.mirrorCanvas
        }
      ]);
    });
  }

  exit () {
    if (this.usesAframe) {
      return this.aframeScene.exitVR();
    }
    if (!this.mirrorCanvas) {
      return Promise.reject(new Error('Failed to exit XR (missing `<canvas>`)'));
    }
    return Promise((resolve, reject) => {
      if (!display.isPresenting) {
        return Promise.resolve(true);
      }
      return display.exitPresent();
    });
  }

  // TODO: Add method for `pause` (blur).

  // TODO: Add method for `resume` (focus)
}

// const xrAgent = new XRAgent();
//
// if (typeof navigator.xrAgent === 'undefined') {
//   navigator.xrAgent = xrAgent;
// }

export default (function () {
  return new XRAgent();
});
