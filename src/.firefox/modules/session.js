const EXPORTED_SYMBOLS = ["Session"];
Components.utils.import("resource://ytcenter/utils/isWindowClosed.js");
Components.utils.import("resource://ytcenter/utils/bind.js");

function Session() {
  this.data = {};
  this.listeners = {};
}

Session.prototype.callUnsafeJSObject = function(wrappedContentWindow, callback, rv){
  if (isWindowClosed(wrappedContentWindow)) return;
  new XPCNativeWrapper(wrappedContentWindow, "setTimeout").setTimeout(function(){ callback(rv); }, 0);
};

Session.prototype.getValue = function(key){
  return this.data[key];
};
Session.prototype.setValue = function(key, value){
  this.data[key] = value;
  
  if (this.listeners["storage"] && this.listeners["storage"].length > 0) {
    var i, rv = {
      __exposedProps__: {
        key: "r",
        value: "r"
      },
      key: key,
      value: value
    };
    
    for (i = 0; i < this.listeners["storage"].length; i++) {
      try {
        this.callUnsafeJSObject(this.listeners["storage"][i].wrappedContentWindow, this.listeners["storage"][i].callback, rv);
      } catch (e) {
        Components.utils.reportError(e);
      }
    }
  }
};

Session.prototype.listValues = function() {
  var r = [], key;
  for (key in this.data) {
    if (this.data.hasOwnProperty(key)) {
      r.push(key);
    }
  }
  return r;
};

Session.prototype.exists = function(key) {
  return !!this.data[key];
};

Session.prototype.remove = function(key) {
  if (!this.exists(key)) return;
  delete this.data[key];
};

Session.prototype.addEventListener = function(wrappedContentWindow, event, callback){
  if (!this.listeners[event]) this.listeners[event] = [];
  this.listeners[event].push({wrappedContentWindow: wrappedContentWindow, callback: callback});
};

Session.prototype.removeEventListener = function(wrappedContentWindow, event, callback){
  if (!this.listeners[event]) return;
  var i;
  for (i = 0; i < this.listeners[event].length; i++) {
    if (this.listeners[event][i][0] === wrappedContentWindow && this.listeners[event][i][1] === callback) {
      this.listeners[event].splice(i, 1);
      break;
    }
  }
};