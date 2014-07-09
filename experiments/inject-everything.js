  // Utils
  function bind(scope, func) {
    var args = Array.prototype.slice.call(arguments, 2);
    return function(){
      return func.apply(scope, args.concat(Array.prototype.slice.call(arguments)))
    };
  }

  function map(obj, callback, thisArg) {
    for (var i = 0, n = obj.length, a = []; i < n; i++) {
      if (i in obj) a[i] = callback.call(thisArg, obj[i]);
    }
    return a;
  }

  function trimLeft(obj){
    return obj.replace(/^\s+/, "");
  }
  function trimRight(obj){
    return obj.replace(/\s+$/, "");
  }

  function setCookie(name, value, domain, path, expires) {
    domain = domain ? ";domain=" + encodeURIComponent(domain) : "";
    path = path ? ";path=" + encodeURIComponent(path) : "";
    expires = 0 > expires ? "" : 0 == expires ? ";expires=" + (new Date(1970, 1, 1)).toUTCString() : ";expires=" + (new Date(now() + 1E3 * expires)).toUTCString();
    
    document.cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value) + domain + path + expires;
  }

  function getCookie(key) {
    return getCookies()[key];
  }

  function getCookies() {
    var c = document.cookie, v = 0, cookies = {};
    if (document.cookie.match(/^\s*\$Version=(?:"1"|1);\s*(.*)/)) {
      c = RegExp.$1;
      v = 1;
    }
    if (v === 0) {
      map(c.split(/[,;]/), function(cookie) {
        var parts = cookie.split(/=/, 2),
            name = decodeURIComponent(trimLeft(parts[0])),
            value = parts.length > 1 ? decodeURIComponent(trimRight(parts[1])) : null;
        cookies[name] = value;
      });
    } else {
      map(c.match(/(?:^|\s+)([!#$%&'*+\-.0-9A-Z^`a-z|~]+)=([!#$%&'*+\-.0-9A-Z^`a-z|~]*|"(?:[\x20-\x7E\x80\xFF]|\\[\x00-\x7F])*")(?=\s*[,;]|$)/g), function($0, $1) {
        var name = $0, value = $1.charAt(0) === '"' ? $1.substr(1, -1).replace(/\\(.)/g, "$1") : $1;
        cookies[name] = value;
      });
    }
    return cookies;
  }

  var now = Date.now || function () {
    return +new Date;
  };

  // Support
  var support = (function(){
    function localStorageTest() {
      var mod = "support.test";
      try {
        localStorage.setItem(mod, mod);
        localStorage.removeItem(mod);
        return true;
      } catch (e) {
        return false;
      }
    }
    
    return {
      localStorage: localStorageTest(),
      Greasemonkey: (typeof GM_setValue !== "undefined" && (typeof GM_setValue.toString === "undefined" || GM_setValue.toString().indexOf("not supported") === -1))
    };
  })();

  // Chrome API
  function chrome_save(id, key, data) {
    if (typeof data !== "string") data = JSON.stringify(data);
    
    var runtimeOrExtension = chrome.runtime && chrome.runtime.sendMessage ? "runtime" : "extension";
    if (chrome[runtimeOrExtension]) {
      chrome[runtimeOrExtension].sendMessage(JSON.stringify({ "method": "setLocalStorage", "key": key, "data": data }), function() {
        callUnsafeWindow(id);
      });
    } else {
      console.error("Chrome extension API is not present!");
      defaultSave(id, key, data);
    }
  }

  function chrome_load(id, key) {
    var runtimeOrExtension = chrome.runtime && chrome.runtime.sendMessage ? "runtime" : "extension";
    if (chrome[runtimeOrExtension]) {
      chrome[runtimeOrExtension].sendMessage(JSON.stringify({ "method": "getLocalStorage", "key": key }), function(response) {
        if (typeof response === "string") response = JSON.parse(response);
        callUnsafeWindow(id, response.data);
      });
    } else {
      console.error("Chrome extension API is not present!");
      defaultLoad(id, key);
    }
  }

  // Safari API
  function safariMessageListener(e) {
    if (!e || !e.message) return; // Checking if data is present
    if (typeof e.message !== "string") return; // Checking if the object is a string.
    if (!e.message.indexOf || e.message.indexOf("{") !== 0) return;
    
    var d = JSON.parse(e.message);
    if (d.level !== "safe") {
      return;
    }
    
    if (e.name === "call") {
      callUnsafeWindow.apply(null, [d.id].concat(d.arguments));
    }
  }
  
  // Opera API
  function operaMessageListener(e) {
    if (!e || !e.data) return; // Checking if data is present
    if (typeof e.data !== "string") return; // Checking if the object is a string.
    if (!e.data.indexOf || e.data.indexOf("{") !== 0) return;
    
    var d = JSON.parse(e.data);
    if (d.level !== "safe") {
      return;
    }
    
    callUnsafeWindow.apply(null, [d.id].concat(d.arguments));
  }
  
  // Firefox API
  function onFirefoxEvent() {
    console.log("onFirefoxEvent fired!");
    callUnsafeWindow.apply(null, arguments);
  }

  // General
  function callUnsafeWindow(id) {
    if (typeof id === "number" || typeof id === "string") {
      window.postMessage(JSON.stringify({ level: "safe", id: id, arguments: Array.prototype.slice.call(arguments, 1) }), "*");
    }
  }

  function messageListener(e) {
    if (!e || !e.data) return; // Checking if data is present
    if (typeof e.data !== "string") return; // Checking if the object is a string.
    if (!e.data.indexOf || e.data.indexOf("{") !== 0) return;
    
    var d = JSON.parse(e.data);
    if (d.level !== "unsafe") {
      return;
    }
    
    if (@identifier@ === 4) { // Safari
      safari.self.tab.dispatchMessage("call", e.data); // Redirect message to the extension
    } else if (@identifier@ === 5) { // Opera
      opera.extension.postMessage(e.data); // Redirect message to the extension
    } else {
      handleMethods(d.method, d);
    }
  }

  function handleMethods(method, data) {
    switch (method) {
      case "xhr":
        xhr(data.id, data.arguments[0]);
        break;
      case "save":
        save(data.id, data.arguments[0], data.arguments[1]);
        break;
      case "load":
        load(data.id, data.arguments[0]);
        break;
      case "firefox_addWindowListener":
        addWindowListener(bind(null, callUnsafeWindow, data.id));
        break;
      case "firefox_windowLinkerFireRegisteredEvent":
        windowLinkerFireRegisteredEvent.apply(null, data.arguments);
        break;
      default:
        console.error("Unknown method: " + method + ", with data: " + data);
    }
  }

  function xhr(id, details) {
    createCallableDetails(details);
    if (@identifier@ === 6) { // Firefox
      request(details);
    } else if (support.Greasemonkey) {
      GM_xmlhttpRequest(details);
    } else {
      var xmlhttp;
      if (typeof XMLHttpRequest != "undefined") {
        xmlhttp = new XMLHttpRequest();
      } else if (typeof opera != "undefined" && typeof opera.XMLHttpRequest != "undefined") {
        xmlhttp = new opera.XMLHttpRequest();
      } else if (typeof uw != "undefined" && typeof uw.XMLHttpRequest != "undefined") {
        xmlhttp = new uw.XMLHttpRequest();
      } else {
        details["onerror"](responseState);
      }
      xmlhttp.onreadystatechange = function(){
        var responseState = {
          responseXML: '',
          responseText: (xmlhttp.readyState == 4 ? xmlhttp.responseText : ''),
          readyState: xmlhttp.readyState,
          responseHeaders: (xmlhttp.readyState == 4 ? xmlhttp.getAllResponseHeaders() : ''),
          status: (xmlhttp.readyState == 4 ? xmlhttp.status : 0),
          statusText: (xmlhttp.readyState == 4 ? xmlhttp.statusText : ''),
          finalUrl: (xmlhttp.readyState == 4 ? xmlhttp.finalUrl : '')
        };
        if (details["onreadystatechange"]) {
          details["onreadystatechange"](responseState);
        }
        if (xmlhttp.readyState == 4) {
          if (details["onload"] && xmlhttp.status >= 200 && xmlhttp.status < 300) {
            details["onload"](responseState);
          }
          if (details["onerror"] && (xmlhttp.status < 200 || xmlhttp.status >= 300)) {
            details["onerror"](responseState);
          }
        }
      };
      try {
        xmlhttp.open(details.method, details.url);
      } catch(e) {
        details["onerror"]();
      }
      if (details.headers) {
        for (var prop in details.headers) {
          xmlhttp.setRequestHeader(prop, details.headers[prop]);
        }
      }
      xmlhttp.send((typeof(details.data) !== 'undefined') ? details.data : null);
    }
  }

  function createCallableDetails(details) {
    var callback = ["abort", "error", "load", "progress", "readystatechange", "timeout"];
    for (var i = 0, len = callback.length; i < len; i++) {
      if (typeof details["on" + callback[i]] === "number") {
        details["on" + callback[i]] = bind(null, callUnsafeWindow, details["on" + callback[i]]);
      }
    }
  }

  function save(id, key, data) {
    if (typeof data !== "string") data = JSON.stringify(data);
    if (@identifier@ === 1) {
      chrome_save(id, key, data);
    } else if (@identifier@ === 2) {
      callUnsafeWindow(id, window.external.mxGetRuntime().storage.setConfig(key, data));
    } else if (@identifier@ === 6) {
      callUnsafeWindow(id, storage_setValue(key, data));
    } else {
      defaultSave(id, key, data);
    }
  }
  
  function defaultSave(id, key, data) {
    if (support.Greasemonkey) {
      callUnsafeWindow(id, GM_setValue(key, data));
    } else if (support.localStorage) {
      callUnsafeWindow(id, localStorage.setItem(key, data));
    } else {
      callUnsafeWindow(id, setCookie(key, data, null, "/", 86400000000));
    }
  }

  function load(id, key) {
    if (@identifier@ === 1) {
      chrome_load(id, key);
    } else if (@identifier@ === 2) {
      callUnsafeWindow(id, window.external.mxGetRuntime().storage.getConfig(key) || "{}");
    } else if (@identifier@ === 6) {
      callUnsafeWindow(id, storage_getValue(key));
    } else {
      defaultLoad(id, key);
    }
  }
  
  function defaultLoad(id, key) {
    if (support.Greasemonkey) {
      callUnsafeWindow(id, GM_getValue(key));
    } else if (support.localStorage) {
      callUnsafeWindow(id, localStorage.getItem(key));
    } else {
      callUnsafeWindow(id, getCookie(key));
    }
  }

  window.addEventListener("message", messageListener, false);

  if (@identifier@ === 4) { // Safari
    safari.self.addEventListener("message", safariMessageListener, false);
  } else if (@identifier@ === 5) { // Opera
    opera.extension.onmessage = operaMessageListener;
  }

  inject(main_function);