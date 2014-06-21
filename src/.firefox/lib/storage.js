var fileAccess = require("fileaccess");

var cache = {}, event = "storage";

function getValue(key){
  if (!cache[key]) {
    let data = fileAccess.readFile(key);
    cache[key] = data;
  }
  return cache[key];
};
function setValue(key, value){
  cache[key] = value;
  
  fileAccess.writeFile(key, value);
}

function listValues() {
  throw new Error("Not implemented!");
}

function exists(key) {
  return fileAccess.exists(key);
}

function remove(key) {
  delete cache[key];
  fileAccess.removeFile(key);
}

unload(function(){ cache = null; event = null; });

exports["getValue"] = getValue;
exports["setValue"] = setValue;
exports["listValues"] = listValues;
exports["exists"] = exists;
exports["remove"] = remove;