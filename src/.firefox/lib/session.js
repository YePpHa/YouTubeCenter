var {bind, isWindowClosed} = require("utils");
var {addEventListener, removeEventListener, fireEvent} = require("eventsManager");

var session = {}, data = {}, prefix = "session";

session.getValue = function(key){
  return data[key];
};
session.setValue = function(key, value){
  data[key] = value;
  fireEvent(prefix + ":storage", key, value);
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

session.clear = function() {
  data = {};
};

session.addEventListener = function(wrappedContentWindow, event, callback){
  addEventListener(wrappedContentWindow, prefix + ":" + event, callback);
};

session.removeEventListener = function(wrappedContentWindow, event, callback){
  removeEventListener(wrappedContentWindow, prefix + ":" + event, callback);
  session.clear();
};

unload(function(){ data = null; prefix = null; });

exports["session"] = session;