var {console, callUnsafeJSObject, isWindowClosed} = require("utils");
var listeners = {};

function unloadWindow(wrappedContentWindow) {
  for (let key in listeners) {
    if (listeners.hasOwnProperty(key)) {
      for (let i = 0; i < listeners[key].length; i++) {
        if (listeners[key][i].wrappedContentWindow === wrappedContentWindow) {
          listeners[key].splice(i, 1);
          i--;
        }
      }
    }
  }
}

function addEventListener(wrappedContentWindow, event, callback) {
  /*if (!listeners || !listeners[event]) listeners[event] = [];
  listeners[event].push({ wrappedContentWindow: wrappedContentWindow, callback: callback });*/
}

function removeEventListener(wrappedContentWindow, event, callback) {
  /*if (!listeners || !listeners[event]) return;
  
  for (let i = 0; i < listeners[event].length; i++) {
    if (listeners[event][i].wrappedContentWindow == wrappedContentWindow && listeners[event][i].callback == callback) {
      listeners[event].splice(i, 1);
      i--;
    }
  }*/
}

function fireEvent(event, key, value) {
  if (listeners && listeners[event] && listeners[event].length > 0) {
    let rv = {
      __exposedProps__: {
        key: "r",
        value: "r"
      },
      key: key,
      value: value
    };
    
    for (let i = 0; i < listeners[event].length; i++) {
      if (isWindowClosed(listeners[event][i].wrappedContentWindow)) {
        listeners[event].splice(i, 1);
        i--;
      } else {
        try {
          callUnsafeJSObject(listeners[event][i].wrappedContentWindow, listeners[event][i].callback, rv);
        } catch (e) {
          Cu.reportError(e);
        }
      }
    }
  }
}

unload(function(){ listeners = null; });

exports["addEventListener"] = addEventListener;
exports["removeEventListener"] = removeEventListener;
exports["fireEvent"] = fireEvent;
exports["unloadWindow"] = unloadWindow;