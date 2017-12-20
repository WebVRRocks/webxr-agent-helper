export default class Utils {
  /**
   * Light polyfill for `Promise.race`. Returns a Promise that resolves when the first Promise provided resolves.
   *
   * @param {Array<Promise>} Promises to race.
   */
  promiseRace (promises) {
    if (Promise.race) {
      return Promise.race(promises);
    }

    return new Promise((resolve, reject) => {
      for (let i = 0; i < promises.length; i++) {
        promises[i].then(resolve, reject);
      }
    });
  }
}
