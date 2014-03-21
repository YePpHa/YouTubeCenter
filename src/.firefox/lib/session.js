var {bind, isWindowClosed} = require("utils");

var session = {},
  data = {},
  listeners = {};

session.callUnsafeJSObject = function(wrappedContentWindow, callback, rv) {
  new XPCNativeWrapper(wrappedContentWindow, "setTimeout").setTimeout(function(){ callback(rv); }, 0);
};

session.getValue = function(key){
  return data[key];
};
session.setValue = function(key, value){
  data[key] = value;
  
  if (listeners["storage"] && listeners["storage"].length > 0) {
    var rv = {
      __exposedProps__: {
        key: "r",
        value: "r"
      },
      key: key,
      value: value
    };
    
    for (let i = 0; i < listeners["storage"].length; i++) {
      if (isWindowClosed(listeners["storage"][i].wrappedContentWindow)) {
        listeners["storage"].splice(i, 1); i--;
      } else {
        try {
          session.callUnsafeJSObject(listeners["storage"][i].wrappedContentWindow, listeners["storage"][i].callback, rv);
        } catch (e) {
          Components.utils.reportError(e);
        }
      }
    }
  }
};

session.listValues = function() {
  var r = [], key;
  for (key in data) {
    if (data.hasOwnProperty(key)) {
      r.push(key);
    }
  }
  return r;
};

session.exists = function(key) {
  return !!data[key];
};

session.remove = function(key) {
  if (!session.exists(key)) return;
  delete data[key];
};

session.addEventListener = function(wrappedContentWindow, event, callback){
  if (!listeners[event]) listeners[event] = [];
  listeners[event].push({wrappedContentWindow: wrappedContentWindow, callback: callback});
};

session.removeEventListener = function(wrappedContentWindow, event, callback){
  if (!listeners[event]) return;
  for (let i = 0; i < listeners[event].length; i++) {
    if (listeners[event][i][0] === wrappedContentWindow && listeners[event][i][1] === callback) {
      listeners[event].splice(i, 1);
      break;
    }
  }
};

session.detachWindowSession = function(wrappedContentWindow) {
  for (let key in listeners) {
    if (listeners.hasOwnProperty(key)) {
      for (let i = 0; i < listeners[key].length; i++) {
        if (listeners[key][i][0] === wrappedContentWindow) {
          listeners[event].splice(i, 1); i--;
        }
      }
    }
  }
};

exports["session"] = session;