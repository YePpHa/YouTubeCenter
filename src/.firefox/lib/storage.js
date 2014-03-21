var {isWindowClosed} = require("utils");
var {fileAccess} = require("fileaccess");

var listeners = {};
var storage = {};
var cache = {};


storage.callUnsafeJSObject = function(wrappedContentWindow, callback, rv){
  if (isWindowClosed(wrappedContentWindow)) return;
  new XPCNativeWrapper(wrappedContentWindow, "setTimeout").setTimeout(function(){ callback(rv); }, 0);
};

storage.getValue = function(key){
  if (!cache[key]) {
    let data = fileAccess.readFile(key);
    cache[key] = data;
  }
  return cache[key];
};
storage.setValue = function(key, value){
  cache[key] = value;
  
  fileAccess.writeFile(key, value);
  
  if (listeners["storage"] && listeners["storage"].length > 0) {
    var i, rv = {
      __exposedProps__: {
        key: "r",
        value: "r"
      },
      key: key,
      value: value
    };
    
    for (i = 0; i < listeners["storage"].length; i++) {
      try {
        storage.callUnsafeJSObject(listeners["storage"][i].wrappedContentWindow, listeners["storage"][i].callback, rv);
      } catch (e) {
        Components.utils.reportError(e);
      }
    }
  }
};

storage.listValues = function() {
  throw new Error("Not implemented!");
};

storage.exists = function(key) {
  return fileAccess.exists(key);
};

storage.remove = function(key) {
  cache[key] = null;
  fileAccess.removeFile(key);
};

storage.addEventListener = function(wrappedContentWindow, event, callback){
  if (!listeners[event]) listeners[event] = [];
  listeners[event].push({wrappedContentWindow: wrappedContentWindow, callback: callback});
};

storage.removeEventListener = function(wrappedContentWindow, event, callback){
  if (!listeners[event]) return;
  var i;
  for (i = 0; i < listeners[event].length; i++) {
    if (listeners[event][i][0] === wrappedContentWindow && listeners[event][i][1] === callback) {
      listeners[event].splice(i, 1);
      break;
    }
  }
};

exports["storage"] = storage;