function isArray(arr) {
  return Object.prototype.toString.call(arr) === "[object Array]";
}

function traverse(parent, callback, deepLimit, deepCount) {
  deepCount = deepCount || 0;
  
  if ((typeof deepLimit === "number" && deepCount > deepLimit) || isArray(parent) || parent instanceof Node) return;
  
  for (var key in parent) {
    if (parent.hasOwnProperty(key)) {
      if (typeof parent[key] === "object") {
        if (traverse(parent[key], callback, deepLimit, (deepCount + 1))) {
          return true;
        }
      } else {
        if (callback(parent, key, parent[key], deepCount)) {
          return true;
        }
      }
    }
  }
  
  return false;
}

function createConstructorLink(parent, property, aClass, arr) {
  function wrapper(instance) {
    var player = new Player(instance);
    arr.push(player);
  }
  
  wrapFunction(parent, property, wrapper);
}

function defineLockedProperty(obj, key, setter, getter) {
  if (typeof obj !== "object") obj = {};

  if (isIE() || (typeof Object.defineProperty === "function" && !obj.__defineGetter__)) {
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

function wrapFunction(parent, property, wrapperFunc, callback) {
  function waitObject(parent, token) {
    var value;
    var loaded = false;
    defineLockedProperty(parent, token, function(aValue){
      value = aValue; // Always set the value as it's supposed to act like a normal property.
      if (!loaded) {
        loaded = true;
        iterate(); // Let's start the iteration again.
      }
    }, function(){
      return value;
    });
  }
  
  function iterate() {
    var token;
    // Make sure that at least one item is in the tokens array.
    while (tokens.length > 1 && (token = tokens.shift())) {
      // If the next token doesn't exists as a property then attach a `getter and setter` and wait for it to be written to.
      if (!parent[token]) {
        waitObject(parent, token);
        tokens = [token].concat(tokens); // We attach the token at the start of the array because we removed it in while.
        return; // I will return one day...
      }
      parent = parent[token];
    }
    // We got to the end and we will then add the wrapper.
    addWrapper();
  }
  
  function addWrapper() {
    var func = parent[tokens[0]];
    defineLockedProperty(parent, tokens[tokens.length - 1], function(value){
      func = value;
    }, function(){
      return function(){
        if (typeof func === "function") {
          var args = Array.prototype.slice.call(arguments, 0);
          var value = func.apply(this, args);
          wrapperFunc.apply(this, [value].concat(args));
        }
        
        return value;
      };
    });
    
    typeof callback === "function" && callback();
  }
  
  // Creating the tokens from property
  var tokens = property.split(".");
  
  // Let's start our iteration
  iterate();
}

function isIE() {
  for (var v = 3, el = document.createElement('b'), all = el.all || []; el.innerHTML = '<!--[if gt IE ' + (++v) + ']><i><![endif]-->', all[0];);
  return v > 4 ? v : !!document.documentMode;
}