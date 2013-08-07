(function(){
  var uw = (function(){
    var a;
    try {
      a = unsafeWindow === window ? false : unsafeWindow;
    } finally {
      return a || (function(){
        var e = document.createElement('p');
        e.setAttribute('onclick', 'return window;');
        return e.onclick();
      }());
    }
  })();
  
  var ytcenter = ytcenter || {};
  ytcenter.utils = ytcenter.utils || {};
  ytcenter.utils.addStyle = function(styles){
    if(typeof GM_addStyle !== "undefined") {
      GM_addStyle(styles);
    } else {
      var s = document.createElement("style");
      s.setAttribute("type", "text\/css");
      s.appendChild(document.createTextNode(styles));
      if (document && document.getElementsByTagName("head")[0]) {
        document.getElementsByTagName("head")[0].appendChild(s);
      } else {
        con.error("Failed to add style!");
      }
    }
  };
  ytcenter.utils.bind = function(a, b){
    return a.call.apply(a.bind, arguments);
  };
  ytcenter.utils.addEventListener = function(elm, event, callback, useCapture){
    if (elm.addEventListener) {
      elm.addEventListener(event, callback, useCapture || false);
    } else if (elm.attachEvent) {
      elm.attachEvent("on" + event, callback);
    }
  };
  ytcenter.utils.removeEventListener = function(elm, event, callback, useCapture){
    if (elm.removeEventListener) {
      elm.removeEventListener(event, callback, useCapture || false);
    }
  };
  ytcenter.player = ytcenter.player || {};
  ytcenter.player.getPlayerElement = function(){
    var el = document.getElementById("movie_player") || document.getElementById("video-player") || document.getElementById("player").firstChild;
    if (!el) {
      if (document.getElementsByTagName("embed").length > 0) {
        el = document.getElementsByTagName("embed")[0];
      }
    }
    return el;
  };
  ytcenter.player.config = {};
  ytcenter.player.getConfig = function(){
    ytcenter.player.config = uw.ytplayer.config
    
    return ytcenter.player.config;
  };
  ytcenter.player.getAPI = function(){
    return uw.yt.player.embed("player-api", uw.ytplayer.config);
  };
  
  ytcenter.pageReadinessListener = (function(){
    var __r = {},
        events = [
          {
            event: "headerInitialized",
            test: function(){
              if (document && document.getElementsByTagName && document.getElementsByTagName("head")[0])
                return true;
              return false;
            },
            called: false,
            callbacks: []
          }, {
            event: "bodyInitialized",
            test: function(){
              if (document && document.body && document.body.className !== "")
                return true;
              return false;
            },
            called: false,
            callbacks: []
          }, {
            event: "stopInterval"
          }, {
            event: "bodyInteractive", test: function(){
              if (document.readyState === "interactive" || document.readyState === "complete")
                return true;
              return false;
            },
            called: false,
            callbacks: []
          }, {
            event: "bodyComplete", test: function(){
              if (document.readyState === "complete")
                return true;
              return false;
            },
            called: false,
            callbacks: []
          }
        ],
        customEvents = [
          {
            event: "onPlayerConfig",
            test: function(){
              if (uw.ytplayer && uw.ytplayer.config) {
                return true;
              }
              return false;
            },
            called: false,
            callbacks: []
          }, {
            event: "onYouTubeEnvironmentReady",
            test: function(){
              if (typeof uw.ytplayer !== "undefined" && typeof uw.ytplayer.config !== "undefined" && typeof uw.yt !== "undefined" && typeof uw.yt.player !== "undefined" && typeof uw.yt.player.embed === "function")
                return true;
              return false;
            },
            called: false,
            callbacks: []
          }
        ],
        customEventsDone = 0,
        preTester,
        preTesterInterval = 50,
        forceStop = false;
    __r.addEventListener = function(event, callback){
      var i;
      for (i = 0; i < customEvents.length; i++) {
        if (customEvents[i].event === event) {
          if (!customEvents[i].callbacks) customEvents[i].callbacks = [];
          customEvents[i].callbacks.push(callback);
          return;
        }
      }
      for (i = 0; i < events.length; i++) {
        if (events[i].event === event) {
          if (!events[i].callbacks) events[i].callbacks = [];
          events[i].callbacks.push(callback);
          return;
        }
      }
    };
    __r.update = function(){
      var i, j;
      if (ytcenter.pageReadinessListener.waitfor) {
        if (!ytcenter.pageReadinessListener.waitfor()) return;
      }
      
      for (i = 0; i < customEvents.length; i++) {
        if (customEvents[i].called) continue;
        if (!customEvents[i].test()) continue;
        console.log("[PageReadinessListener] At event => " + customEvents[i].event);
        customEvents[i].called = true;
        for (j = 0; j < customEvents[i].callbacks.length; j++) {
          customEvents[i].callbacks[j]();
        }
        customEventsDone++;
      }
      
      if (forceStop && customEventsDone === customEvents.length) {
        forceStop = false;
        console.log("[PageReadinessListener] Stopping interval");
        uw.clearInterval(preTester);
      }
      
      for (i = 0; i < events.length; i++) {
        if (events[i].event === "stopInterval") {
          if (customEventsDone === customEvents.length) {
            console.log("[PageReadinessListener] Stopping interval");
            uw.clearInterval(preTester);
          } else {
            forceStop = true;
          }
        } else if (events[i].event === "startInterval") {
          console.log("[PageReadinessListener] Starting interval");
          uw.clearInterval(preTester); // Just to make sure that only one instance is running.
          preTester = uw.setInterval(function(){
            __r.update();
          }, preTesterInterval);
        } else {
          if (events[i].called) continue;
          if (!events[i].test()) break;
          console.log("[PageReadinessListener] At event => " + events[i].event);
          events[i].called = true;
          for (j = 0; j < events[i].callbacks.length; j++) {
            events[i].callbacks[j]();
          }
        }
      }
    };
    __r.setup = function(){
      ytcenter.utils.addEventListener(document, "readystatechange", function(){
        __r.update();
      }, false);
      
      preTester = uw.setInterval(function(){
        __r.update();
      }, preTesterInterval);
      
      __r.update();
    };
    return __r;
  })();
  ytcenter.player.listeners = (function(){
    var __r = {},
        events = {
          "onApiChange": {
            override: false,
            listeners: []
          },
          "onCueRangeEnter": {
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
    
    
    __r.addEventListener = function(event, listener){
      if (!(event in events)) return;
      events[event].listeners.push(listener);
    };
    
    __r.removeEventListener = function(event, listener){
      if (!(event in events)) return;
      var i;
      for (i = 0; i < events[event].listeners.length; i++) {
        if (events[event].listeners[i] === listener) {
          events[event].listeners.splice(i, 1);
          return;
        }
      }
    };
    
    /**
     * Will override the YouTube listener for the specific event.
     * NOTE: This is not possible for every event.
     **/
    __r.setOverride = function(event, override){
      if (!(event in events)) return;
      events[event].override = override;
    };
    __r.getMasterListener = function(a){
      return function(){
        console.log("[Player Listener] => " + a);
        var i;
        for (i = 0; i < events[a].listeners.length; i++) {
          events[a].listeners[i].apply(null, arguments);
        }
      };
    };
    __r.setupListeners = function(){
      var i, event;
      for (event in events) {
        if (events.hasOwnProperty(event)) {
          events[event].masterListener = __r.getMasterListener(event);
        }
      }
    };
    
    __r.setup = function(){ // Should only be called in onReady
      var api = ytcenter.player.getAPI(),
          override = false;
      console.log("[Player Listener] Setting up enviorment");
      __r.setupListeners();
      for (event in events) {
        if (events.hasOwnProperty(event)) {
          api.addEventListener(event, events[event].masterListener);
          if (events[event].override) override = true;
        }
      }
      if (override) {
        api.addEventListener("onReady", function(){
          var player = "player1";
          for (event in events) {
            if (events.hasOwnProperty(event)) {
              if (uw["ytPlayer" + event + player]) {
                uw["ytPlayer" + event + player] = events[event].masterListener;
              }
            }
          }
        });
      }
    };
    
    return __r;
  })();
  ytcenter.spf = (function(){
    var _obj = {},
    listeners = {
      "error": [],
      "error-before": [],
      "processed": [],
      "processed-before": [],
      "received": [],
      "received-before": [],
      "requested": [],
      "requested-before": [],
      "script-loading": [],
      "script-loading-before": [],
      "dispose": [],
      "init": [],
      "load": [],
      "navigate": [],
      "prefetch": [],
      "process": []
    },
    loadListeners = [],
    events = ["error", "processed", "received", "requested", "script-loading"],
    eventsSPF = ["dispose", "init", "load", "navigate", "prefetch", "process"],
    injected = false,
    originalCallbacks = {};
    
    _obj.addEventListener = function(event, callback){
      if (!listeners.hasOwnProperty(event)) return;
      listeners[event].push(callback);
    };
    _obj.isInjected = function(){
      return injected ? true : false;
    };
    _obj.isEnabled = function(){
      return uw && uw.ytspf && uw.ytspf.enabled ? true : false;
    };
    _obj.isReadyToInject = function(){
      var obj_name, i;
      console.log("[SPF] Checking if SPF is ready...");
      if (typeof uw._spf_state !== "object") {
        console.log("[SPF] Failed... _spf_state object is not initialized yet!");
        return false;
      }
      if (typeof uw._spf_state.config !== "object") {
        console.log("[SPF] Failed... _spf_state.config object is not initialized yet!");
        return false;
      }
      for (i = 0; i < events.length; i++) {
        if (events[i].indexOf("-") !== -1) {
          obj_name = events[i] + "-callback";
        } else {
          obj_name = "navigate-" + events[i] + "-callback";
        }
        if (typeof uw._spf_state.config[obj_name] !== "function") {
          console.log("[SPF] Failed... " + obj_name + " has not been created yet!");
          return false;
        }
      }
      for (i = 0; i < eventsSPF.length; i++) {
        if (typeof uw.spf[eventsSPF[i]] !== "function") {
          console.log("[SPF] Failed... " + eventsSPF[i] + " has not been created yet!");
          return false;
        }
      }
      console.log("[SPF] SPF is ready for manipulation!");
      return true;
    };
    _obj.inject = function(){ // Should only be called once every instance (page reload).
      if (!_obj.isEnabled() || injected) return; // Should not inject when SPF is not enabled!
      injected = true;
      var ytspf = uw._spf_state,
          spf = uw.spf,
          obj_name,
          func;
      console.log("[SPF] Injecting ability to add event listeners to SPF.");
      for (var i = 0; i < eventsSPF.length; i++) {
        if (typeof originalCallbacks[eventsSPF[i]] !== "function") originalCallbacks[eventsSPF[i]] = spf[eventsSPF[i]];
        func = (function(event){
          return function(){
            var args = arguments;
            
            var r,j;
            console.log("[SPF] spf => " + event);
            console.log(args);
            
            for (j = 0; j < listeners[event].length; j++) {
              args = listeners[event][j].apply(null, args) || args;
            }
            
            if (typeof originalCallbacks[event] === "function") {
              r = originalCallbacks[event].apply(uw, args);
            } else {
              console.error("[SPF] Wasn't able to call the original callback!");
            }
            console.log(r);
            return r;
          };
        })(eventsSPF[i]);
        spf[eventsSPF[i]] = func;
      }
      for (var i = 0; i < events.length; i++) {
        if (events[i].indexOf("-") !== -1) {
          obj_name = events[i] + "-callback";
        } else {
          obj_name = "navigate-" + events[i] + "-callback";
        }
        if (typeof originalCallbacks[events[i]] !== "function") originalCallbacks[events[i]] = ytspf.config[obj_name];
        func = (function(event){
          return function(){
            var args = arguments;
            
            var r,j;
            console.log("[SPF] _spf_state => " + event);
            console.log(args);
            
            for (j = 0; j < listeners[event + "-before"].length; j++) {
              args = listeners[event + "-before"][j].apply(null, args) || args;
            }
            
            if (typeof originalCallbacks[event] === "function") {
              r = originalCallbacks[event].apply(uw, args);
            } else {
              console.error("[SPF] Wasn't able to call the original callback!");
            }
            
            for (j = 0; j < listeners[event].length; j++) {
              listeners[event][j].apply(null, arguments);
            }
            console.log(r);
            return r;
          };
        })(events[i]);
        
        ytspf.config[obj_name] = func;
        uw.ytspf.config[obj_name] = func;
      }
    };
    
    return _obj;
  })();
  var _ads = [
    'supported_without_ads',
    'ad3_module',
    'adsense_video_doc_id',
    'allowed_ads',
    'baseUrl',
    'cafe_experiment_id',
    'afv_inslate_ad_tag',
    'advideo',
    'ad_device',
    'ad_channel_code_instream',
    'ad_channel_code_overlay',
    'ad_eurl',
    'ad_flags',
    'ad_host',
    'ad_host_tier',
    'ad_logging_flag',
    'ad_preroll',
    'ad_slots',
    'ad_tag',
    'ad_video_pub_id',
    'aftv',
    'afv',
    'afv_ad_tag',
    'afv_instream_max',
    'afv_ad_tag_restricted_to_instream'
  ];
  ytcenter.spf.addEventListener("received-before", function(url, data){
    if (!data.swfcfg) return;
    try {
      var cfg = data.swfcfg;
      cfg = ytcenter.player.modifyConfig(cfg);
      
      return [url, data];
    } catch (e) {
      console.error(e);
    }
  });
  
  ytcenter.player.modifyConfig = function(cfg){
    cfg.args.ytcenter = 1;
    for (var i = 0; i < _ads.length; i++) {
      delete cfg.args[_ads[i]];
    }
    if (cfg.args.csi_page_type) {
      console.log("Chaning csi_page_type from " + cfg.args.csi_page_type + " to watch7");
      cfg.args.csi_page_type = "watch";
    }
    
    return cfg;
  };
  ytcenter.player.setupPlayer = function(){
    var api = ytcenter.player.getAPI();
    api.setPlaybackQuality("hd720");
  };
  
  ytcenter.spf.addEventListener("processed", function(data){
    if (!data.swfcfg) return;
    ytcenter.player.setupPlayer();
  });
  ytcenter.pageReadinessListener.addEventListener("headerInitialized", function(){
    //ytcenter.utils.addStyle("#movie_player {display:none}");
  });
  ytcenter.pageReadinessListener.addEventListener("onPlayerConfig", function(){
    var flashvars = "",
        player = document.getElementById("movie_player"), clone,
        config = uw.ytplayer.config;
    config = ytcenter.player.modifyConfig(config);
    uw.ytplayer.config = config;
    
    if (player) {
      player.style.display = "none";
      for (var key in config.args) {
        if (config.args.hasOwnProperty(key)) {
          if (flashvars !== "") flashvars += "&";
          flashvars += encodeURIComponent(key) + "=" + encodeURIComponent(config.args[key]);
        }
      }
      
      player.setAttribute("flashvars", flashvars);
      clone = player.cloneNode(true);
      clone.style.display = "";
      player.src = "";
      player.parentNode.replaceChild(clone, player);
      player = clone;
    }
  });
  
  ytcenter.pageReadinessListener.addEventListener("onYouTubeEnvironmentReady", function(){
    if (ytcenter.spf.isEnabled()) {
      if (!ytcenter.spf.isInjected()) {
        ytcenter.spf.inject();
      }
    }
    var api = ytcenter.player.getAPI();
    
    ytcenter.player.listeners.setOverride("SIZE_CLICKED", true);
    ytcenter.player.listeners.addEventListener("SIZE_CLICKED", function(size){
      console.log("[SIZEEE] " + (size ? "LARGO" : "SMALLO"));
    });
    
    api.addEventListener("onReady", function(){
      ytcenter.player.listeners.setup();
      ytcenter.player.setupPlayer();
    });
  });
  ytcenter.pageReadinessListener.setup();
})();