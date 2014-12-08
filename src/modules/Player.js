// TODO Clean this up and split it into multiple files for easy management.
// TODO Create an event manager that can easily be added to a scope.

(function(){
  function inject(func) {
    var script = document.createElement("script");
    var p = document.body || document.head || document.documentElement;
    if (!p) {
      setTimeout(bind(null, inject, func, true), 0);
      return;
    }
    script.setAttribute("type", "text/javascript");
    if (typeof func === "string") {
      func = "function(){" + func + "}";
    }
    script.appendChild(document.createTextNode("(" + func + ")();\n//# sourceURL=YouTubeCenter.js"));
    p.appendChild(script);
    p.removeChild(script);
  }
  
  function main() {
    function construct(constructor, args) {
      function Class() {
        return constructor.apply(this, args);
      }
      Class.prototype = constructor.prototype;
      
      return new Class();
    }
    function isArray(arr) {
      return Object.prototype.toString.call(arr) === "[object Array]";
    }
    function inArray(arr, value) {
      for (var i = 0, len = arr.length; i < len; i++) {
        if (arr[i] === value) {
          return true;
        }
      }
      return false;
    }
    function bindArguments(func) {
      var args = Array.prototype.slice.call(arguments, 1);
      return function(){
        return func.apply(this, args.concat(Array.prototype.slice.call(arguments, 0)));
      };
    }
    
    /**
     * Checking if {@stack} starts with {@needle}
     *
     * @method startsWith
     * @param {String} stack The stack that will be compared.
     * @param {String} needle The part that will be checked if it's in the start of {@stack}.
     * @return {Boolean} Returns true if the {@needle} is in the start of {@stack}.
    **/
    function startsWith(stack, needle) {
      return stack.indexOf(needle) === 0;
    }
    
    /**
     * Checking if {@stack} ends with {@needle}
     *
     * @method startsWith
     * @param {String} stack The stack that will be compared.
     * @param {String} needle The part that will be checked if it's in the end of {@stack}.
     * @return {Boolean} Returns true if the {@needle} is in the end of {@stack}.
    **/
    function endsWith(stack, needle) {
      return stack.indexOf(needle) === stack.length - needle.length;
    }
    
    /**
     * This beauty of a function is used to iterate through an object and match the values
     * to find values in the object that might be obfuscated or just random. So by using
     * patterns to find the values we're not limitted by how the object is structered and
     * the names of the keys.
     *
     * @method traverse
     * @param {Object} parent The parent object where the traverse function will start from.
     * @param {Function} callback The function that will do a match and if it returns true it will stop the traverse.
     * @param {Number} deepLimit A limit set to limit how deep you can go in the object. Useful for infinite loops (we really don't like them).
     * @param {Number} deepCount We need to keep track on how far in {@parent} we are.
     * @return {Boolean} Returns true if {@callback} returns true otherwise returns false.
    **/
    function traverse(parent, callback, deepLimit, deepCount) {
      deepCount = deepCount || 0;
      
      if ((typeof deepLimit === "number" && deepCount > deepLimit) || isArray(parent) || parent instanceof Node) return;
      
      for (var key in parent) {
        if (parent && parent.hasOwnProperty && parent.hasOwnProperty(key)) {
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
    
    function wrapFunction(parent, property, Player, arr, callback) {
      function waitObject(parent, token) {
        var value;
        var loaded = false;
        // We are going to add this here to act as a listener so that we
        // can continue the iteration when it has been written to.
        defineProperty(parent, token, function(aValue){
          value = aValue; // Always set the value as it's supposed to act like a normal property.
          if (!loaded) {
            loaded = true; // We really don't want the iteration function to be called a second time.
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
        
        // We finally got to the end of the iteration and the wrapper is
        // then added for the function.
        defineProperty(parent, tokens[tokens.length - 1], function(value){
          // We really need to have this act as a normal property.
          // Therefore, we simply write to a variable to keep track
          // of the current property value.
          func = value;
        }, function(){
          return function(){
            if (typeof func === "function") {
              var args = Array.prototype.slice.call(arguments, 0);
              
              // We want to create the player wrapper as soon as possible.
              // This includes adding the configuration on creation.
              var playerInstance = construct(Player, args);
              // Publishing the event `onConfig` to listeners that the config
              // has changed.
              player.publish("onConfig", playerInstance, args[1]);
              
              // Call the original `yt.player.Application.create` function.
              // This function will return an instance of the player that
              // can be used. Observations says that it's mostly for the
              // HTML5 player, but it could be useful for the flash player
              // too.
              var html5Instance = func.apply(this, args);
              // Add the HTML5 instance to the player wrapper.
              playerInstance.setHTML5Instance(html5Instance);
              
              // Add the player wrapper to an array where the player wrapper
              // can be retrieved for later use.
              arr.push(playerInstance);
              
              // Return the HTML5 instance to not break anything.
              return html5Instance;
            }
            
            return value;
          };
        });
        
        // We will call the callback function if available
        // when the wrapper has been added.
        // Fun note: was only useful for me when I was
        // debugging this.
        typeof callback === "function" && callback();
      }
      
      // Creating the tokens from property
      var tokens = property.split(".");
      
      // Let's start our iteration
      iterate();
    }
    
    // IE is a special kid. He needs special treatment.
    function isIE() {
      for (var v = 3, el = document.createElement('b'), all = el.all || []; el.innerHTML = '<!--[if gt IE ' + (++v) + ']><i><![endif]-->', all[0];);
      return v > 4 ? v : !!document.documentMode;
    }
    
    // Could just as well use the window variable, but I'm difficult and
    // want the `uw`, because this needs to be integrated into YTC at some
    // point and therefore the integratino will be easier if I keep the
    // same structure.
    var uw = window;
    
    /**
     * Define Property function has been modified to keep
     * a cache of the object and its setter and getters.
     * This is to not make it fail if `defineProperty` is
     * used on an object multiple times.
    **/
    var defineProperty = (function(){
      function setterFunc(obj, key) {
        for (var i = 0, len = setterGetterMap.length; i < len; i++) {
          if (setterGetterMap[i].object === obj && setterGetterMap[i].key === key) {
            return setterGetterMap[i].setter.apply(this, Array.prototype.slice.call(arguments, 2));
          }
        }
      }
      
      function getterFunc(obj, key) {
        for (var i = 0, len = setterGetterMap.length; i < len; i++) {
          if (setterGetterMap[i].object === obj && setterGetterMap[i].key === key) {
            return setterGetterMap[i].getter.apply(this, Array.prototype.slice.call(arguments, 2));
          }
        }
      }
      
      function updateSetterGetter(obj, key, setter, getter) {
        for (var i = 0, len = setterGetterMap.length; i < len; i++) {
          if (setterGetterMap[i].object === obj && setterGetterMap[i].key === key) {
            setterGetterMap[i].setter = setter;
            setterGetterMap[i].getter = getter;
            return false;
          }
        }
        setterGetterMap.push({
          object: obj,
          key: key,
          setter: setter,
          getter: getter
        });
        return true;
      }
      
      function exports(obj, key, setter, getter) {
        if (updateSetterGetter(obj, key, setter, getter)) {
          // Have I told anyone how much I like the bind method?
          if (isIE() || (typeof Object.defineProperty === "function" && !obj.__defineGetter__)) {
            Object.defineProperty(obj, key, {
              get: getterFunc.bind(null, obj, key),
              set: setterFunc.bind(null, obj, key)
            });
          } else {
            obj.__defineGetter__(key, getterFunc.bind(null, obj, key));
            obj.__defineSetter__(key, setterFunc.bind(null, obj, key));
          }
        }
        return obj;
      }
      var setterGetterMap = [];
      
      return exports;
    })();

    var player = (function(){
      /**
       * Player instance helper functions
      **/
      
      /**
       * Traverse the player instance to find the player ID.
       *
       * @static
       * @method findPlayerId
       * @param {Object} instance The player instance.
       * @return {String} The player ID found in the player instance.
      **/
      function findPlayerId(instance) {
        function match(parent, key, value, deep) {
          if (typeof value === "string" && value.indexOf("player_uid_") === 0) {
            id = value;
            return true;
          }
        }
        
        var id = null;
        
        // Let's go search for something in the instance.
        traverse(instance, match, 5);
        
        return id;
      }
      
      var findPlayerIdMethod2 = (function(){
        function findPlayerIdMethod2() {
          // If we haven't been given an ID by
          // any of the other methods we are going
          // to improvise and try getting it from
          // the exposed listeners in the window
          // object.
          // Keeping a cache of the already found
          // IDs to make sure that a player wrapper
          // does not have the same ID as another
          // player wrapper.
          for (var key in uw) {
            var io = key.indexOf("player_uid_");
            if (uw.hasOwnProperty(key) && startsWith(key, "ytPlayer") && io !== -1) {
              var id = key.substring(io);
              if (!inArray(cache, id)) {
                cache.push(id);
                return id;
              }
            }
          }
          return null;
        }
        
        var cache = [];
        
        return findPlayerIdMethod2;
      })();
      
      /**
       * Traverse the player instance to find the API object.
       *
       * @static
       * @method findAPI
       * @param {Object} instance The player instance.
       * @return {Object} The API object.
      **/
      function findAPI(instance) {
        function match(parent, key, value, deep) {
          if (typeof value === "function" && key === "getApiInterface") {
            api = parent;
            return true;
          }
        }
        
        var api = null;
        
        traverse(instance, match, 2);
        
        return api;
      }
      
      function findExposedListeners(id) {
        var prefix = "ytPlayer";
        var listeners = {};
        // We know the ID of the player and therefore we can
        // just check for the prefix and check if the key ends
        // with the ID. If that's the case we have us a listener.
        // That listener is then added to the listener object, which
        // will be returned when we have gone through the window
        // object.
        for (var key in uw) {
          if (uw.hasOwnProperty(key) && startsWith(key, prefix) && endsWith(key, id)) {
            var myKey = key.substring(prefix.length, key.indexOf(id));
            listeners[myKey] = key;
          }
        }
        return listeners;
      }
      
      function addEventListener(type, listener) {
        if (!listeners[type]) listeners[type] = [];
        listeners[type].push(listener);
      }
      
      function removeEventListener(type, listener) {
        if (!listeners[type]) return;
        for (var i = 0, len = listeners[type].length; i < len; i++) {
          if (listeners[type][i] === listener) {
            listeners[type].splice(i, 1);
          }
        }
      }
      
      function publish(type) {
        if (!listeners[type]) return;
        for (var i = 0, len = listeners[type].length; i < len; i++) {
          listeners[type][i].apply(this, Array.prototype.slice.call(arguments, 1));
        }
      }
      
      function getPlayerById(id) {
        var el = document.getElementById(id);
        
        for (var i = 0, len = players.length; i < len; i++) {
          if (players[i].element === el) {
            return players[i];
          }
        }
        return null;
      }
      
      function getPlayerByAPIId(id) {
        for (var i = 0, len = players.length; i < len; i++) {
          if (players[i].id === id) {
            return players[i];
          }
        }
        return null;
      }
      
      // TODO Enhance the compatibility with SPF.
      function spfProcess(e) {
        e = e || window.event;
        var detail = e.detail;
        
        var player = getPlayerById("player-api");
        var part = detail.part;
        if (player && part && part.data && part.data.swfcfg) {
          player.setConfig(part.data.swfcfg);
        }
      }
      
      function spfDone(e) {
        e = e || window.event;
        var detail = e.detail;
        
        var player = getPlayerById("player-api");
        if (player && detail.response) {
          var response = detail.response;
          if (response.type === "multipart") {
            var parts = response.parts;
            for (var i = 0, len = parts.length; i < len; i++) {
              if (parts[i] && parts[i].data && parts[i].data.swfcfg) {
                publish("onReady", player);
                break;
              }
            }
          } else {
            var data = response.data;
            if (data && data.swfcfg) {
              publish("onReady", player);
            }
          }
        }
      }
      
      /**
       * A player wrapper for YouTube's player to handle the communication between
       * YouTube Center and YouTube.
       *
       * @constructor
       * @class Player
      **/
      function Player(element, config) {
        this.id = null;
        this.element = typeof element === "string" ? document.getElementById(element) : element;
        this.api = {};
        this.config = config; // TODO Make config be up-to date with the player's configuration. Need to find some kind of listener that can be attached.
        this.publicListeners = {};
        this.html5Instance = null;
        this.instance = null;
      }
      
      // We need to do something when the player is ready
      // and that is to call every listener attached
      // to the player wrapper. Also the local scope
      // seems to be some kind of player instance
      // that is consistent for both the flash and the
      // HTML5 player. However, this function is not
      // called when not on the `/watch` page.
      // Another method has been found.
      // See: onYouTubePlayerReady
      Player.onReady = function onReady(player) {
        player.setInstance(this);
        
        publish("onReady", player);
      };
      
      Player.prototype.setInstance = function setInstance(instance) {
        function idMatch(parent, key, value, deep) {
          if (typeof value === "string" && value.indexOf("player_uid_") === 0) {
            self.id = value;
            return true;
          }
        }
        function publicListenersMatch(parent, key, value, deep) {
          if (typeof value === "string" && startsWith(value, "ytPlayer") && endsWith(value, self.id)) {
            self.publicListeners = parent;
            return true;
          }
        }
        function apiMatch(parent, key, value, deep) {
          if (key === "getApiInterface" && typeof value === "function") {
            self.api = parent;
            return true;
          }
        }
        var self = this; // let's just expose the local scope.
        
        this.instance = instance;
        
        // There's a chance that YouTube removes the `getId` function
        // and therefore we will fallback on the `traverse` method.
        if (typeof this.instance.getId === "function") {
          this.id = this.instance.getId();
        } else {
          traverse(this.instance, idMatch, 0);
        }
        traverse(this.instance, publicListenersMatch, 1);
        traverse(this.instance, apiMatch, 1);
        
      };
      
      Player.prototype.setHTML5Instance = function setHTML5Instance(instance) {
        // The player instance created by `yt.player.Application.create`.
        this.html5Instance = instance;
        
        this.id = (this.config && this.config.args && this.config.args.playerapiid) || findPlayerId(this.html5Instance) || findPlayerIdMethod2();
        this.api = findAPI(this.html5Instance);
        this.publicListeners = findExposedListeners(this.id);
      };
      
      /**
       * Set the player configuration.
       *
       * @method setConfig
       * @param {Object} config The new player configuration.
      **/
      Player.prototype.setConfig = function setConfig(config) {
        this.config = config;
        publish("onConfig", this, this.config);
        if (!this.instance) {
          this.publicListeners = findExposedListeners(this.id);
          /*var self = this;
          setTimeout(function(){
            self.publicListeners = findExposedListeners(self.id);
          }, 7);*/
        }
      };
      
      /**
       * Link the player configuration to a property.
       *
       * @method linkConfig
       * @param {String} path The property path to where the property is located.
      **/
      Player.prototype.linkConfig = function linkConfig(path) {
        throw "Not implemented yet.";
      };
      
      /**
       * Add an event listener to the player.
       *
       * @method addEventListener
       * @param {String} type A string representing the event type to listen for.
       * @param {Function} listener The object that receives a notification when an event of the specified type occurs.
      **/
      Player.prototype.addEventListener = function addEventListener(type, listener) {
        throw "Not implemented yet.";
      };
      
      /**
       * Remove an existing event listener to the player.
       *
       * @method removeEventListener
       * @param {String} event The event that will trigger the listener.
       * @param {Function} listener The listener that will be called.
      **/
      Player.prototype.removeEventListener = function removeEventListener(event, listener) {
        throw "Not implemented yet.";
      };
      
      /**
       * Set the playback quality of the player.
       *
       * @method setQuality
       * @param {String} quality The preferred quality for playback.
      **/
      Player.prototype.setQuality = function setQuality(quality) {
        throw "Not implemented yet.";
      };
      
      /**
       * Set the player type to either flash or HTML5.
       *
       * @method setType
       * @param {String} type The preferred type of the player.
      **/
      Player.prototype.setType = function setType(type) {
        if (type === "flash") {
          this.config.html5 = false;
          this.config.args.allow_html5_ads = null;
          this.config.args.html5_sdk_version = null;
        } else if (type === "html5") {
          this.config.html5 = true;
          //delete this.config.args.ad3_module;
          this.config.args.allow_html5_ads = 1;
          this.config.args.html5_sdk_version = "3.1";
        }
        
        //this.api && typeof this.api.loadNewVideoConfig === "function" && this.api.loadNewVideoConfig(this.config);
      };
      
      /**
       * Get the player type.
       *
       * @method getType
       * @return {String} Returns the player type.
      **/
      Player.prototype.getType = function getType() {
        if (typeof this.api.getPlayerType === "function") {
          return this.api.getPlayerType();
        } else if (this.instance) {
          for (var key in this.instance) {
            if (this.instance.hasOwnProperty(key)) {
              var value = this.instance[key];
              if (value === "html5" || value === "flash") {
                return value;
              }
            }
          }
        }
        return null;
      };
      
      /**
       * Update the player.
       *
       * @method update
      **/
      Player.prototype.update = function update() {
        this.api.loadVideoByPlayerVars(this.config.args);
      };
      
      // Scope properties
      var players = [];
      var listeners = [];
      
      // If `yt.player.Application.create` is called then it will automatically create a new class and append it to the `players` array.
      wrapFunction(uw, "yt.player.Application.create", Player, players);
      
      // Make sure that it will call a onReady listener
      addEventListener("onConfig", function(player, config){
        config.args.enablejsapi = "1";
        config.args.jsapicallback = bindArguments(Player.onReady, player);
      });
      
      // Add `onYouTubePlayerReady` to window to make sure that the onReady listeners are called.
      uw.onYouTubePlayerReady = function(api){
        if (typeof api === "object") {
          // We need to figure out what player this is.
          if (typeof api.getUpdatedConfigurationData === "function") {
            var config = api.getUpdatedConfigurationData();
            var id = config.args.playerapiid;
            var player = getPlayerByAPIId(id);
            if (player) {
              player.api = api;
              player.publicListeners = findExposedListeners(player.id);
              
              // Publish the onReady event
              publish("onReady", player);
            }
          }
        }
      };
      
      // Make sure that this works with SPF
      document.addEventListener("spfpartprocess", spfProcess, true);
      document.addEventListener("spfprocess", spfProcess, true);
      document.addEventListener("spfdone", spfDone, true);
      
      // Exports
      var exports = {};
      exports.Player = Player;
      exports.players = players;
      exports.getPlayerById = getPlayerById;
      exports.getPlayerByAPIId = getPlayerByAPIId;
      exports.addEventListener = addEventListener;
      exports.removeEventListener = removeEventListener;
      exports.publish = publish;
      return exports;
    })();
    
    // Testing, I love my testing
    player.addEventListener("onConfig", function(player, config){
      player.setType("html5");
      
      config.args.color = "white";
      config.args.theme = "light";
      config.args.ytcenter = "1";
    });
    
    // Well, this part is useful when debugging and testing. As I
    // do not need to use the exposed object as much.
    player.addEventListener("onReady", function(player){
      console.log("My custom onReady listener", player);
    });
    
    uw.ytcenter = player;
  }
  
  inject(main);
})();