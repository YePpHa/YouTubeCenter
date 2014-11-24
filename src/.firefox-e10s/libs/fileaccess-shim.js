function shim(method) {
  let args = Array.prototype.slice.call(arguments, 1);
  return framescript.sendSyncMessage("fileaccess-shim", {
    method: method,
    args: args
  })[0];
}

exports["exists"] = shim.bind(null, "exists");
exports["writeFile"] = shim.bind(null, "writeFile");
exports["readFile"] = shim.bind(null, "readFile");
exports["removeFile"] = shim.bind(null, "removeFile");