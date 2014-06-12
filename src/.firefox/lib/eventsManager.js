var {bind, console, callUnsafeJSObject, isWindowClosed} = require("utils");
var listeners = {};

function addEventListener(wrappedContentWindow, event, callback) {
  function unloadListener() {
    wrappedContentWindow.removeEventListener("unload", unloadListener, true);
    if (wrappedContentWindow != null) {
      
      removeEventListener(wrappedContentWindow, event, callback);
      
      wrappedContentWindow = null;
      event = null;
      callback = null;
    }
    unloadListener = null;
  }
  
  if (!listeners || !listeners[event]) listeners[event] = [];
  listeners[event].push({wrappedContentWindow: wrappedContentWindow, callback: callback});
  
  wrappedContentWindow.addEventListener("unload", unloadListener, true);
}

function removeEventListener(wrappedContentWindow, event, callback) {
  if (!listeners || !listeners[event]) return;
  
  for (let i = 0; i < listeners[event].length; i++) {
    if (listeners[event][i].wrappedContentWindow == wrappedContentWindow && listeners[event][i].callback == callback) {
      listeners[event][i].wrappedContentWindow = null;
      listeners[event][i].callback = null;
      listeners[event][i] = null;
      
      listeners[event].splice(i, 1);
      break;
    }
  }
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
        listeners[event].splice(i, 1); i--;
      } else {
        try {
          callUnsafeJSObject(listeners[event][i].wrappedContentWindow, listeners[event][i].callback, rv);
        } catch (e) {
          console.error(e);
        }
      }
    }
  }
}

unload(function(){
  if (listeners) {
    for (let key in listeners) {
      if (listeners.hasOwnProperty(key)) {
        for (let i = 0; i < listeners[key].length; i++) {
          listeners[key][i].wrappedContentWindow = null;
          listeners[key][i].callback = null;
          listeners[key][i] = null;
        }
        listeners[key] = null;
      }
    }
    listeners = null;
  }
});

exports["addEventListener"] = addEventListener;
exports["removeEventListener"] = removeEventListener;
exports["fireEvent"] = fireEvent;