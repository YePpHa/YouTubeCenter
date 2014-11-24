var {bind, console, isWindowClosed} = require("utils");

function callbackHandler(callback, unloadFunc, win) {
  if (isWindowClosed(win)) return;
  try {
    callback.apply(null, arguments);
  } catch (e) {
    Cu.reportError(e);
  }
  callUnload(unloadFunc[0]);
}

function addEventListener(win, event, callback, capture) {
  let unloadFuncArray = [];
  let func = bind(this, callbackHandler, callback, unloadFuncArray, win);
  let unloadFunc = bind(win, win.removeEventListener, event, func, capture || false); // Preparing unload function
  unloadFuncArray.push(unloadFunc);
  
  /* Attaching event listener to window */
  win.addEventListener(event, func, capture || false);
  
  unloadListeners.push(unloadFunc);
}

function callUnload(unloadFunc) {
  for (let i = 0, len = unloadListeners.length; i < len; i++) {
    if (unloadFunc === unloadListeners[i]) {
      unloadListeners.splice(i, 1);
      i--; len--;
    }
  }
  unloadFunc();
}

function unloadAll() {
  for (let i = 0; i < unloadListeners.length; i++) {
    unloadListeners[i]();
  }
  unloadListeners = null;
}

var unloadListeners = [];

unload(unloadAll);

exports["addEventListener"] = addEventListener;