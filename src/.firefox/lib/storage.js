var {isWindowClosed} = require("utils");
var {fileAccess} = require("fileaccess");
var {addEventListener, removeEventListener, fireEvent} = require("eventsManager");

var storage = {}, cache = {}, prefix = "storage";

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
  
  fireEvent(prefix + ":storage", key, value);
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
  addEventListener(wrappedContentWindow, prefix + ":" + event, callback);
};

storage.removeEventListener = function(wrappedContentWindow, event, callback){
  removeEventListener(wrappedContentWindow, prefix + ":" + event, callback);
};

unload(function(){ cache = null; prefix = null; });

exports["storage"] = storage;