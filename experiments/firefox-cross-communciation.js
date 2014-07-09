(function(){
  /* Fire an event to the other tabs for Firefox */
  function fireEventFirefox() {
    windowLinkerFireRegisteredEvent.apply(null, arguments); /* Firefox addon function */
  }
  
  function fireEventLocalStorage() {
    if (!guid) guid = ytcenter.utils.guid();
    
    var locked = parseInt(uw.localStorage.getItem(STORAGE_LOCK) || 0);
    var now = ytcenter.utils.now();
    var args = Array.prototype.slice.call(arguments, 0);
    
    if (locked && now - locked < STORAGE_TIMEOUT) {
      uw.setTimeout(ytcenter.utils.funcBind.apply(ytcenter.utils, [null, fireEventLocalStorage].concat(args)), STORAGE_WAIT);
    } else {
      hasLock = true;
      uw.localStorage.setItem(STORAGE_LOCK, now);
      uw.localStorage.setItem(STORAGE_KEY, JSON.stringify({
        origin: guid,
        args: args
      }));
    }
  }
  
  /* The standard event handler, which every handler will call at the end. */
  function eventFired(event) {
    if (!listeners[event]) return;
    var args = Array.prototype.slice.call(arguments, 1);
    
    for (var i = 0, len = listeners[event].length; i < len; i++) {
      listeners[event][i].apply(null, args);
    }
  }
  
  /* Event handler for the localStorage */
  function eventFiredStorage(e) {
    e = e || uw.event;
    
    if (e.key === STORAGE_KEY) {
      var data = JSON.parse(e.newValue || "{}");
      if (data.origin !== guid) {
        eventFired.apply(null, data.args);
      } else if (hasLock) {
        hasLock = false;
        uw.setTimeout(clean, 20)
      }
    }
  }
  
  function clean() {
    uw.localStorage.removeItem(STORAGE_LOCK);
    uw.localStorage.removeItem(STORAGE_KEY);
  }
  
  /* Add an event listener to get information from other tabs */
  function addEventListener(event, callback) {
    if (!listeners[event]) listeners[event] = [];
    listeners[event].push(callback);
  }
  
  /* Remove the added event listener */
  function removeEventListener(event, callback) {
    if (!listeners[event]) return;
    for (var i = 0, len = listeners[event].length; i < len; i++) {
      listeners[event].splice(i, 1);
      break;
    }
  }
  /* Init the event handlers */
  function init() {
    if (typeof addWindowListener === "function") {
      addWindowListener(eventFired); /* Firefox addon function */
    } else if (ytcenter.supported.localStorage) {
      ytcenter.utils.addEventListener(uw, "storage", eventFiredStorage, false); /* Attach the handler to the storage event */
    }
  }
  
  function getExportsFirefox() {
    return {
      addEventListener: addEventListener,
      removeEventListener: removeEventListener,
      fireEvent: fireEventFirefox
    };
  }
  
  function getExportsLocalStorage() {
    return {
      addEventListener: addEventListener,
      removeEventListener: removeEventListener,
      fireEvent: fireEventLocalStorage
    };
  }
  
  function getExportsPlaceholder() {
    function empty() { }
    return {
      addEventListener: empty,
      removeEventListener: empty,
      fireEvent: empty
    };
  }
  
  function getExports() {
    if (typeof addWindowListener === "function") {
      return getExportsFirefox();
    } else if (ytcenter.supported.localStorage) {
      return getExportsLocalStorage();
    } else {
      return getExportsPlaceholder();
    }
  }
  var listeners = {};
  var guid = null;
  
  var hasLock = false;
  
  var STORAGE_KEY = "CMS-YTC";
  var STORAGE_LOCK = "CMS-YTC-LOCK";
  var STORAGE_EXPIRED = 3600000;
  var STORAGE_WAIT = 50;
  var STORAGE_TIMEOUT = 1000;
  
  init();
  return getExports();
})();