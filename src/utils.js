
function callLimiter(func, delay) {
  let thId = null;
  let lastArgs = null;
  return (...args) => {
    lastArgs = args;
    if (thId == null) {
      thId = setTimeout(() => {
        func(...lastArgs);
        thId = null;
      }, delay);
    }
  }
}

const utils = {
  callLimiter,
};

export default utils;