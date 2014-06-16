function freeze(parent, freezeObject) {
  function wait(_parent, _freezeObject) {
    var args = _freezeObject.split(".");
    var _object = undefined;
    defineLockedProperty(_parent, args[0], function(val){
      args.splice(0, 1);
      freeze(val, args.join("."));
      _object = val;
    }, function(){
      return _object;
    });
  }
  
  var args = freezeObject.split(".");
  var at = parent;
  for (var i = 0, len = args.length - 1; i < len; i++) {
    console.log(parent, freezeObject, i, at, args[i]);
    if (typeof at[args[i]] === "object") {
      at = at[args[i]];
    } else {
      args.splice(0, i);
      wait(at, args.join("."));
      return;
    }
  }
  
  var defObject = undefined;
  defineLockedProperty(at, args[args.length - 1], function(val){
    if (typeof defObject === "undefined") {
      defObject = val;
    }
  }, function(){
    return defObject;
  });
}

function defineLockedProperty(obj, key, setter, getter) {
  if (typeof obj !== "object") obj = {};
  if (typeof Object.defineProperty === "function") {
    Object.defineProperty(obj, key, {
      get: getter,
      set: setter
    });
    return obj;
  } else {
    obj.__defineGetter__(key, getter);
    obj.__defineSetter__(key, setter);
    return obj;
  }
}