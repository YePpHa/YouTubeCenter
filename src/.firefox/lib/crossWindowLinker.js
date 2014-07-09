var {callUnsafeJSObject, isWindowClosed} = require("utils");

function addWindowListener(window, handler) {
  handlers.push({
    window: window,
    handler: handler
  });
}

function removeWindowListeners(window) {
  for (let i = 0; i < handlers.length; i++) {
    if (handlers[i].window == window) {
      handlers.splice(i, 1);
      i--;
    }
  }
}

function fireEvent(window, event, obj) {
  for (let i = 0; i < handlers.length; i++) {
    if (isWindowClosed(handlers[i].window)) {
      handlers.splice(i, 1);
      i--;
    } else {
      if (handlers[i].window != window) {
        try {
          callUnsafeJSObject(handlers[i].window, handlers[i].handler, event, obj);
        } catch (e) {
          Cu.reportError(e);
        }
      }
    }
  }
}

var handlers = [];

unload(function(){ handlers = null; });

exports["addWindowListener"] = addWindowListener;
exports["removeWindowListeners"] = removeWindowListeners;
exports["fireEvent"] = fireEvent;