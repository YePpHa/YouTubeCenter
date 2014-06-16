(function(){
  // Get the YouTube listener for the passed event.
  function getYouTubeListener(event) {
    var ytEvent = "ytPlayer" + event + "player" + playerId;
    return ytListeners[ytEvent];
  }
  
  // The latest player id registered in the global window.
  function getNewestPlayerId() {
    var id = 1, i;
    ytcenter.utils.each(uw, function(key, value){
      if (key.indexOf("ytPlayer") !== -1) {
        i = parseInt(key.match(/player([0-9]+)$/)[1]);
        if (i > id) {
          id = i;
        }
      }
    });
    return id;
  }
  
  function ytListenerContainerSetter(event, func) {
    var ytEvent = "ytPlayer" + event + "player" + playerId;
    ytListeners[ytEvent] = func;
  }
  function ytListenerContainerGetter(event, func) {
    return ytcenter.utils.funcBind(null, callListener, event, 1);
  }
  
  /* Origin argument
   * If origin is equal to 0 then the origin is directly from the player (only YouTube Center's listeners get executed if override is false).
   * If origin is equal to 1 then the origin is from the global listeners (both YouTube's and YouTube Center's listeners get executed).
   */
  function callListener(event, origin) {
    function generateThisObject() {
      return {
        getOriginalListener: ytcenter.utils.funcBind(null, getYouTubeListener, event)
      };
    }
    
    var ytEvent = "ytPlayer" + event + "player" + playerId;
    var args = Array.prototype.slice.call(arguments, 2);
    var returnVal = null;
    
    if (enabled && origin === 0 && (!events.hasOwnProperty(event) || (events.hasOwnProperty(event) && !events[event].override))) {
      /* Override is false and the origin is from the player; call the YouTube Center listeners */
      if (events.hasOwnProperty(event)) {
        for (var i = 0, len = events[event].listeners.length; i < len; i++) {
          returnVal = events[event].listeners[i].apply(null, args);
        }
      }
    } else if (enabled && origin === 1) {
      if (events.hasOwnProperty(event) && events[event].override) {
        /* Override is true and the origin is from the global window; call the YouTube Center listeners */
        for (var i = 0, len = events[event].listeners.length; i < len; i++) {
          events[event].listeners[i].apply(generateThisObject(), args);
        }
        con.log("[Player Listener] Event " + event + " was called with", args);
      } else if (ytListeners[ytEvent]) {
        if (apiNotAvailable) {
          /* API is not available therefore call YouTube Center listeners as YouTube listener is called  */
          for (var i = 0, len = events[event].listeners.length; i < len; i++) {
            returnVal = events[event].listeners[i].apply(null, args);
          }
        }
        
        /* Override is false and the origin is from the global window; call the YouTube listener */
        returnVal = ytListeners[ytEvent].apply(uw, args);
        
        con.log("[Player Listener] Event " + event + " was called with", args);
      }
    } else if (!enabled) {
      /* Everything is disabled; call the YouTube listener */
      returnVal = ytListeners[ytEvent].apply(uw, args);
    }
    return returnVal;
  }
  
  function addPlayerListener() {
    var api = ytcenter.player.getAPI();
    var event;
    
    if (api && api.addEventListener) {
      apiNotAvailable = false;
      for (event in events) {
        if (events.hasOwnProperty(event)) {
          playerListener[event] = ytcenter.utils.funcBind(null, callListener, event, 0);
          api.addEventListener(event, playerListener[event]);
        }
      }
    } else {
      apiNotAvailable = true;
      con.error("[Player Listener] Player API is not available!");
    }
  }
  
  function setupGlobalListeners() {
    if (globalListenersInitialized) return; // Make sure that this function is only called once.
    globalListenersInitialized = true;
    for (var event in events) {
      if (events.hasOwnProperty(event)) {
        var ytEvent = "ytPlayer" + event + "player" + playerId;
        if (uw[ytEvent]) {
          ytListeners[ytEvent] = uw[ytEvent];
        }
        defineLockedProperty(uw, ytEvent,
          ytcenter.utils.funcBind(null, ytListenerContainerSetter, event),
          ytcenter.utils.funcBind(null, ytListenerContainerGetter, event)
        );
      }
    }
  }
  
  function setup() {
    if (enabled) return;
    con.log("[Player Listener] Has begun the setup...");
    var api = ytcenter.player.getAPI();
    playerId = getNewestPlayerId();
    
    enabled = true; // Indicate that the it's active.

    // Add the listeners normally to the player
    addPlayerListener();
    
    // Replace the global listeners with custom listeners in case the override property is set to true
    setupGlobalListeners();
  }
  
  function addEventListener(event, listener) {
    if (!events.hasOwnProperty(event)) return;
    
    removeEventListener(event, listener); // Make sure that there is only one instance of the listener registered.
    events[event].listeners.push(listener);
  }
      
  function removeEventListener(event, listener) {
    if (!events.hasOwnProperty(event)) return;
    for (var i = 0, len = events[event].listeners.length; i < len; i++) {
      if (events[event].listeners[i] === listener) {
        return events[event].listeners.splice(i, 1);
      }
    }
  }
  
  function setOverride(event, override) {
    if (!events.hasOwnProperty(event)) return;
    events[event].override = !!override;
  }
  
  function unloadPlayerListeners() {
    var api = ytcenter.player.getAPI();
    var event;
    
    if (api && api.removeEventListener) {
      for (event in events) {
        if (events.hasOwnProperty(event)) {
          api.removeEventListener(event, playerListener[event]);
          delete playerListener[event];
        }
      }
    } else {
      con.error("[Player Listener] Player API is not available!");
    }
  }
  
  function unload() {
    unloadPlayerListeners();
    enabled = false;
    apiNotAvailable = true;
  }
  
  var playerId = 1;
  var ytListeners = {};
  var playerListener = {}; // Reference for unload
  var enabled = false;
  var globalListenersInitialized = false;
  var apiNotAvailable = true;
  
  var events = {
    "onApiChange": {
      override: false,
      listeners: []
    },
    "onCueRangeEnter": {
      override: false,
      listeners: []
    },
    "onCueRangeExit": {
      override: false,
      listeners: []
    },
    "onError": {
      override: false,
      listeners: []
    },
    "onNavigate": {
      override: false,
      listeners: []
    },
    "onPlaybackQualityChange": {
      override: false,
      listeners: []
    },
    "onStateChange": {
      override: false,
      listeners: []
    },
    "onTabOrderChange": {
      override: false,
      listeners: []
    },
    "onVolumeChange": {
      override: false,
      listeners: []
    },
    "onAdStart": {
      override: false,
      listeners: []
    },
    "onReady": {
      override: false,
      listeners: []
    },
    "RATE_SENTIMENT": {
      override: false,
      listeners: []
    },
    "SHARE_CLICKED": {
      override: false,
      listeners: []
    },
    "SIZE_CLICKED": {
      override: false,
      listeners: []
    },
    "WATCH_LATER": {
      override: false,
      listeners: []
    },
    "AdvertiserVideoView": {
      override: false,
      listeners: []
    },
    "captionschanged": {
      override: false,
      listeners: []
    },
    "onRemoteReceiverSelected": {
      override: false,
      listeners: []
    }
  };
  
  
  return {
    addEventListener: addEventListener,
    removeEventListener: removeEventListener,
    setOverride: setOverride,
    setup: setup,
    dispose: unload
  };
})();