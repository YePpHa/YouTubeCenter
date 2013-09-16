const EXPORTED_SYMBOLS = ["Storage"];
Components.utils.import("resource://ytcenter/storage_file.js");

function Storage() {
  this.file = new StorageFile();
}

Storage.prototype.getValue = function(key){
  return this.file.readFile(key);
};
Storage.prototype.setValue = function(key, value){
  this.file.writeFile(key, value);
};

Storage.prototype.listValues = function() {
  throw new Error("Not implemented!");
};

Storage.prototype.exists = function(key) {
  return this.file.exists(key);
};

Storage.prototype.remove = function(key) {
  throw new Error("Not implemented!");
};