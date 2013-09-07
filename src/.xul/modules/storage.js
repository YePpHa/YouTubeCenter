const EXPORTED_SYMBOLS = ["Storage"];

function Storage() {
  this.pref = Components.classes["@mozilla.org/preferences-service;1"]
              .getService(Components.interfaces.nsIPrefService)
              .getBranch("extensions.ytcenter.storage");
}

Storage.prototype.MIN_INT_32 = -0x80000000;
Storage.prototype.MAX_INT_32 = 0x7FFFFFFF;
Storage.prototype.nsISupportsString = Components.interfaces.nsISupportsString;

Storage.prototype.getValue = function(key){
  var t = this.pref.getPrefType(key);
  if (t == this.pref.PREF_INVALID)
    return null;
  try {
    switch (t) {
      case this.pref.PREF_STRING:
        return this.pref.getComplexValue(key, this.nsISupportsString).data;
      case this.pref.PREF_BOOL:
        return this.pref.getBoolPref(key);
      case this.pref.PREF_INT:
        return this.pref.getIntPref(key);
    }
  } catch (e) {}
  return null;
};
Storage.prototype.setValue = function(key, value){
  var t = typeof value,
      a = false;
  switch (t) {
    case "string":
    case "boolean":
      a = true;
      break;
    case "number":
      if (value % 1 == 0 &&
          value >= this.MIN_INT_32 &&
          value <= this.MAX_INT_32) {
        a = true;
      }
      break;
  }
  if (!a) throw new Error("Unsupported value type!");
  if (this.exists(key) && t != typeof this.getValue(key)) {
    this.remove(key);
  }
  
  switch (t) {
    case "string":
      var str = Components.classes["@mozilla.org/supports-string;1"].createInstance(this.nsISupportsString);
      str.data = value;
      this.pref.setComplexValue(key, this.nsISupportsString, str);
      break;
    case "boolean":
      this.pref.setBoolPref(key, value);
      break;
    case "number":
      this.pref.setIntPref(key, Math.floor(value));
      break;
  }
};

Storage.prototype.listValues = function() {
  return this.pref.getChildList("", {});
};

Storage.prototype.exists = function(key) {
  return (this.pref.getPrefType(key) ? true : false);
};

Storage.prototype.remove = function(key) {
  this.pref.deleteBranch(key);
};