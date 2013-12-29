function defineLockedProperty(obj, key, setter, getter) {
  if (ytcenter.utils.ie) {
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

var ytcenter = {};
ytcenter.utils = {};
ytcenter.utils.bind = function(a, b){
  return a.call.apply(a.bind, arguments);
};
ytcenter.utils.ie = (function(){
  for (var v = 3, el = document.createElement('b'), all = el.all || []; el.innerHTML = '<!--[if gt IE ' + (++v) + ']><i><![endif]-->', all[0];);
  return v > 4 ? v : !!document.documentMode;
})();

(function(){
  function SPFEnabled(objects) {
    defineLockedProperty(this, "enabled", function(value){ }, function(){
      return enabled;
    });
    for (key in objects) {
      if (key === "enabled") continue;
      if (objects.hasOwnProperty(key)) {
        this[key] = objects[key];
      }
    }
  }
  function SPFState() {
    defineLockedProperty(this, "config", function(cfg){
      var key;
      for (key in cfg) {
        if (cfg.hasOwnProperty(key)) {
          config[key] = cfg[key];
        }
      }
    }, function(){
      return config;
    });
  }
  function SPFConfig() {
    var i;
    for (i = 0; i < events.length; i++) {
      configFunctions[events[i]] = (function(event){
        return ytcenter.utils.bind(function(){
          console.log("[SPF:" + event + "]", arguments);
          console.log("[SPF:" + event + "] Calling before listeners...");
          callListenerCallbacks(event, "before", arguments);
          console.log("[SPF:" + event + "] Calling original function...");
          if (_ytconfig[event]) _ytconfig[event].apply(null, arguments);
          console.log("[SPF:" + event + "] Calling after listeners...");
          callListenerCallbacks(event, "after", arguments);
        });
      })(events[i]);
      
      defineLockedProperty(this, events[i], (function(event){
        return function(func) { _ytconfig[event] = func; };
      })(events[i]), (function(func){
        console.log(func);
        return function(){ return func; };
      })(configFunctions[events[i]]));
    }
  }
  function callListenerCallbacks(event, mode, args) {
    if (!listeners[event]) return; // No attached listeners to the specific event.
    var i;
    
    for (i = 0; listeners[event].length; i++) {
      if (listeners[event][i].mode !== mode) continue; // Needs to be the exact same mode.
      listeners[event][i].callback.apply(null, args);
    }
  }
  function isConfigEvent(key) {
    var i;
    for (i = 0; i < events.length; i++) {
      if (events[i] === key) return true;
    }
    return false;
  }
  function disable() {
    enabled = false;
    if (unsafeWindow.spf && unsafeWindow.spf.dispose)
      unsafeWindow.spf.dispose();
  }
  
  var enabled = true, events = [
        "navigate-error-callback",
        "navigate-part-processed-callback",
        "navigate-part-received-callback",
        "navigate-processed-callback",
        "navigate-received-callback",
        "navigate-requested-callback"
      ], configFunctions = {}, listeners = {}, _ytconfig = {}, config = new SPFConfig(), state = new SPFState();
  
  // Locking "_spf_state".
  defineLockedProperty(unsafeWindow, "_spf_state", function(s){
    var key;
    for (key in s) {
      if (s.hasOwnProperty(key)) {
        state[key] = s[key];
      }
    }
  }, function(){
    return state;
  });
  
  // Making sure that SPF is enabled.
  unsafeWindow.ytspf = new SPFEnabled(unsafeWindow.ytspf);
})();