var {console} = require("utils");

function isWindowClosed(aWin) {
  try {
    if (Cu.isDeadWrapper && Cu.isDeadWrapper(aWin)) {
      return true;
    }
    
    try {
      if (aWin.closed) return true;
    } catch (e) {
      return true;
    }
  } catch (e) {
    Cu.reportError(e);
    return true;
  }
  return false;
}

function callUnsafeJSObject(wrappedContentWin, eventCallback) {
  if (isWindowClosed(wrappedContentWin)) return; /* The window is closed and therefore it should not be called! */
  
  let args = Array.prototype.slice.call(arguments, 2);
  new XPCNativeWrapper(wrappedContentWin, "setTimeout()").setTimeout(function(){ eventCallback.apply(null, args) }, 0);
}

function on(wrappedContentWin, func) {
  unloadCallbacks.push([ wrappedContentWin, func, false ]);
}

function onProxy(wrappedContentWin, func) {
  func = Cu.waiveXrays(func);
  
  unloadCallbacks.push([ wrappedContentWin, func[0], true ]);
}

function detach(wrappedContentWin) {
  for (let i = 0, len = unloadListener.length; i < len; i++) {
    if (unloadListener[i][0] === wrappedContentWin) {
      unloadListener[i][0].removeEventListener("unload", unloadListener[i][1], false);
      unloadListener.splice(i, 1);
      i--; len--;
    }
  }
  
  for (let i = 0, len = unloadCallbacks.length; i < len; i++) {
    if (unloadCallbacks[i][0] === wrappedContentWin) {
      if (unloadCallbacks[i][2]) {
        callUnsafeJSObject(unloadCallbacks[i][0], unloadCallbacks[i][1]);
      } else {
        unloadCallbacks[i][1]();
      }
      unloadCallbacks.splice(i, 1);
      i--; len--;
    }
  }
}

function detachAll() {
  for (let i = 0, len = unloadCallbacks.length; i < len; i++) {
    if (unloadCallbacks[i][2]) {
      callUnsafeJSObject(unloadCallbacks[i][0], unloadCallbacks[i][1]);
    } else {
      unloadCallbacks[i][1]();
    }
  }
  
  for (let i = 0, len = unloadListener.length; i < len; i++) {
    unloadListener[i][0].removeEventListener("unload", unloadListener[i][1], false);
  }
  
  unloadCallbacks = null;
  unloadListener = null;
}

function init(wrappedContentWin) {
  let detachBind = detach.bind(wrappedContentWin);
  unloadListener.push([wrappedContentWin, detachBind]);
  
  wrappedContentWin.addEventListener("unload", detachBind, false);
}

unload(detachAll);

var unloadCallbacks = [];
var unloadListener = [];

exports["init"] = init;
exports["on"] = on;
exports["onProxy"] = onProxy;
exports["detach"] = detach;