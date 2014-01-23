const EXPORTED_SYMBOLS = ["Storage"];
Components.utils.import("resource://ytcenter/modules/storage_file.js");
Components.utils.import("resource://ytcenter/modules/utils/isWindowClosed.js");
Components.utils.import("resource://ytcenter/modules/utils/bind.js");

function Storage() {
  this.file = new StorageFile();
  this.listeners = {};
}

Storage.prototype.callUnsafeJSObject = function(wrappedContentWindow, callback, rv){
  if (isWindowClosed(wrappedContentWindow)) return;
  new XPCNativeWrapper(wrappedContentWindow, "setTimeout").setTimeout(function(){ callback(rv); }, 0);
};

Storage.prototype.getValue = function(key){
  return this.file.readFile(key);
};
Storage.prototype.setValue = function(key, value){
  this.file.writeFile(key, value);
  
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

Storage.prototype.listValues = function() {
  throw new Error("Not implemented!");
};

Storage.prototype.exists = function(key) {
  return this.file.exists(key);
};

Storage.prototype.remove = function(key) {
  this.file.removeFile(key);
};

Storage.prototype.addEventListener = function(wrappedContentWindow, event, callback){
  if (!this.listeners[event]) this.listeners[event] = [];
  this.listeners[event].push({wrappedContentWindow: wrappedContentWindow, callback: callback});
};

Storage.prototype.removeEventListener = function(wrappedContentWindow, event, callback){
  if (!this.listeners[event]) return;
  var i;
  for (i = 0; i < this.listeners[event].length; i++) {
    if (this.listeners[event][i][0] === wrappedContentWindow && this.listeners[event][i][1] === callback) {
      this.listeners[event].splice(i, 1);
      break;
    }
  }
};