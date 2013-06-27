// ==UserScript==
// @name            YouTube Center
// @version         2.0.0
// @author          Jeppe Rune Mortensen (YePpHa)
// @description     YouTube Center contains all kind of different useful functions which makes your visit on YouTube much more entertaining.
// @match           http://*.youtube.com/*
// @match           https://*.youtube.com/*
// @match           http://ytcenter.runerne.dk/*
// @match           https://ytcenter.runerne.dk/*
// @updateVersion   200
// @run-at          document-start
// ==/UserScript==
if(window.navigator.vendor.match(/Google/)) {
  var div = document.createElement("div");
  div.setAttribute("onclick", "return window;");
  unsafeWindow = div.onclick();
};
(function(unsafeWindow){
  if(typeof GM_xmlhttpRequest === "undefined") {
    GM_xmlhttpRequest = function(details) {
      details.method = details.method.toUpperCase() || "GET";
      if(!details.url) {
        throw("GM_xmlhttpRequest requires an URL.");
        return;
      }
      var oXhr, aAjaxes = [];
      if(typeof ActiveXObject !== "undefined") {
        var oCls = ActiveXObject;
        aAjaxes[aAjaxes.length] = {cls:oCls, arg:"Microsoft.XMLHTTP"};
        aAjaxes[aAjaxes.length] = {cls:oCls, arg:"Msxml2.XMLHTTP"};
        aAjaxes[aAjaxes.length] = {cls:oCls, arg:"Msxml2.XMLHTTP.3.0"};
      }
      if(typeof XMLHttpRequest !== "undefined")
         aAjaxes[aAjaxes.length] = {cls:XMLHttpRequest, arg:undefined};
      for(var i=aAjaxes.length; i--; )
        try{
          oXhr = new aAjaxes[i].cls(aAjaxes[i].arg);
          if(oXhr) break;
        } catch(e) {}
      if(oXhr) {
        if("onreadystatechange" in details)
          oXhr.onreadystatechange = function() { details.onreadystatechange(oXhr) };
        if("onload" in details)
          oXhr.onload = function() { details.onload(oXhr) };
        if("onerror" in details)
          oXhr.onerror = function() { details.onerror(oXhr) };
        oXhr.open(details.method, details.url, true);
        if("headers" in details)
          for(var header in details.headers)
            oXhr.setRequestHeader(header, details.headers[header]);
        if("data" in details)
          oXhr.send(details.data);
        else
          oXhr.send();
      } else
        throw("This Browser is not supported, please upgrade.")
    }
  }
  if(typeof GM_addStyle === "undefined") {
    function GM_addStyle(styles) {
      var oStyle = document.createElement("style");
      oStyle.setAttribute("type", "text\/css");
      oStyle.appendChild(document.createTextNode(styles));
      document.getElementsByTagName("head")[0].appendChild(oStyle);
    }
  }
  if (!this.GM_getValue || (this.GM_getValue.toString && this.GM_getValue.toString().indexOf("not supported")>-1)) {
    if (localStorage) {
      this.GM_getValue = function(key, def) {
        return localStorage[key] || def;
      };
      this.GM_setValue = function(key, value) {
        return localStorage[key] = value;
      };
      this.GM_deleteValue = function(key) {
        return delete localStorage[key];
      };
    } else if (this.GM_getValue) {
      delete this.GM_getValue;
      delete this.GM_setValue;
      delete this.GM_deleteValue;
    }
  }
  if (!this.console) {
    this.console = unsafeWindow.console;
  }
  var locale;
  var yt = {};
  var ytcenter = {};
  ytcenter.version = "2.0.0";
  ytcenter.url = location.href;
  ytcenter.icons = {};
  ytcenter.icons.loading = "data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==";
  ytcenter.video = {};
  ytcenter.locale = {};
  ytcenter.player = {};
  ytcenter.player.html5 = false;
  ytcenter.player.reference = null;
  ytcenter.player.update = function(callback){
    if (callback && ({}).toString.call(callback) == '[object Function]') {
      unsafeWindow['ytcentercallback'] = (function(callback, unsafeWindow){
        return function(a){
          unsafeWindow['ytPlayerOnYouTubePlayerReady'](a);
          callback(a);
        };
      })(callback, unsafeWindow);
      yt.playerConfig.args.jsapicallback = "ytcentercallback";
    } else {
      yt.playerConfig.args.jsapicallback = "ytPlayerOnYouTubePlayerReady";
    }
    if (ytcenter.player.html5) { // HTML5 Player
      var v = document.getElementsByTagName("video")[0];
      if (v) {
        v.addEventListener('play', function(){ // Assure that there's isn't another audio playing.
          this.pause();
          this.src = "";
        }, false);
        yt.www.watch.player.updateConfig(yt.playerConfig);
        var player = yt.player.embed('watch-player', yt.playerConfig);
        yt.setConfig({'PLAYER_REFERENCE': player});
        ytcenter.player.reference = player;
      } else {
        document.addEventListener("DOMNodeInserted", function(e){
          if (e.target.nodeName == "VIDEO") {
            this.removeEventListener('DOMNodeInserted', arguments.callee, false);
            e.target.addEventListener("loadedmetadata", function(){
              this.pause();
              yt.www.watch.player.updateConfig(yt.playerConfig);
              var player = yt.player.embed('watch-player', yt.playerConfig);
              yt.setConfig({'PLAYER_REFERENCE': player});
              ytcenter.player.reference = player;
            }, false);
          }
        }, false);
      }
    } else { // Flash Player
      var forceUpdate = yt.www.watch.player.updateConfig(yt.playerConfig);
      var player = yt.player.update('watch-player', yt.playerConfig, true, unsafeWindow.gYouTubePlayerReady);
      yt.setConfig({'PLAYER_REFERENCE': player});
      ytcenter.player.reference = player;
    }
  };
  ytcenter.plugins = [];
  ytcenter.video.fmtstreammap = [];
  ytcenter.settings = {
    firstLaunch: true,
    autoUpdate: true,
    lastUpdated: -1,
    updateInterval: 0, // Hours, if 0 update every visit.
    language: 'en'
  };
  ytcenter.templates = {
    element: {tagname: 'div'},
    button: {
      tagname: 'button',
      attributes: {
        type: 'button',
        onclick: ';return false;',
        role: 'button'
      },
      classNames: ['yt-uix-tooltip-reverse', 'yt-uix-button', 'yt-uix-button-default', 'yt-uix-tooltip']
    },
    buttongroup: {
      tagname: 'span',
      classNames: ['yt-uix-button-group'],
      firstChild: {
        classNames: ['start']
      },
      lastChild: {
        classNames: ['end']
      }
    },
    text: {tagname: '#text'}
  };
  ytcenter.locale['en'] = {
    'plugin_install_title_installing': 'Installing %s',
    'plugin_install_title_notfound': '%s was not found!',
    'plugin_install_title_alreadyinstalled': '%s is already installed!'
  };
  
  function loadSettings() {
    var STORAGE_SETTINGS_KEY = "ytcenter_settings";
    var STORAGE_PLUGINS_KEY = "ytcenter_plugins";
    var s,p;
    if (GM_getValue && GM_setValue) {
      s = GM_getValue(STORAGE_SETTINGS_KEY, "{}");
      p = GM_getValue(STORAGE_PLUGINS_KEY, "[]");
    } else {
      s = readCookie(STORAGE_SETTINGS_KEY, "{}");
      p = readCookie(STORAGE_PLUGINS_KEY, "[]");
    }
    var parse = function (key, value) {
      if (value && typeof value === 'object') {
        if (value.type && value.type === 'function') {
          return eval('(' + value.value + ')');
        }
      }
      return value;
    };
    ytcenter.settings = mergeObjects(ytcenter.settings, JSON.parse(s, parse));
    var _plugins = JSON.parse(p, parse);
    for (var i = 0; i < _plugins.length; i++) {
      for (var j = 0; j < ytcenter.plugins.length; j++) {
        if (_plugins[i].id == ytcenter.plugins[j].id) {
          ytcenter.plugins.splice(j, 1);
          break;
        }
      }
    }
    ytcenter.plugins = ytcenter.plugins.concat(_plugins);
    locale = ytcenter.locale[ytcenter.settings.language];
  }
  
  function saveSettings() {
    var STORAGE_SETTINGS_KEY = "ytcenter_settings";
    var STORAGE_PLUGINS_KEY = "ytcenter_plugins";
    var rep = function(key, value){
      if (typeof value === 'number' && !isFinite(value)) {
        return String(value);
      } else if (typeof value === 'function') {
        return {type: 'function', value: value.toString()};
      }
      return value;
    };
    var val = JSON.stringify(ytcenter.settings, rep);
    var val2 = JSON.stringify(ytcenter.plugins, rep);
    if (GM_getValue && GM_setValue) {
      GM_setValue(STORAGE_SETTINGS_KEY, val);
      GM_setValue(STORAGE_PLUGINS_KEY, val2);
    } else {
      createCookie(STORAGE_SETTINGS_KEY, val, 3600);
      createCookie(STORAGE_PLUGINS_KEY, val2, 3600);
    }
  }
  
  function decodeFMTStreamMap(smap) {
    var formats = [];
    var _formats = smap.split(",");
    for (var i = 0; i < _formats.length; i++) {
      var args = {};
      var _args = _formats[i].split("&");
      for (var j = 0; j < _args.length; j++) {
        var k = _args[j].split("=");
        args[k[0]] = unescape(k[1]);
      }
      formats.push(args);
    }
    return formats;
  }
  
  function parseFMTList(fmtlist) {
    var formats = {};
    var _formats = fmtlist.split(",");
    for (var i = 0; i < _formats.length; i++) {
      var s = _formats[i].split("/");
      var fmt = s[0];
      var d = s[1].split("x");
      var dimension = {width: d[0], height: d[1]};
      var unknowns = [];
      for (var j = 2; j < s.length; j++) {
        unknowns.push(s[j]);
      }
      formats[fmt] = {dimension: dimension, unknowns: unknowns};
    }
    return formats;
  }
  
  function mergeStreams(streamMap, fmtList) {
    var formats = [];
    for (var i = 0; i < streamMap.length; i++) {
      var f = streamMap[i];
      var l = fmtList[f.itag];
      f.dimension = l.dimension;
      f.unknowns = l.unknowns;
      formats.push(f);
    }
    return formats;
  }
  
  function initYouTubeCenterVariables() {
    yt = unsafeWindow.yt;
    if (!document.getElementById("movie_player")) ytcenter.html5 = true;
    ytcenter.video.fmtstreammap = mergeStreams(decodeFMTStreamMap(yt.playerConfig.args.url_encoded_fmt_stream_map), parseFMTList(yt.playerConfig.args.fmt_list));
  }
  
  function initYouTubeCenter() {
    ytcenter.player.update(function(){
      for (var i = 0; i < ytcenter.plugins.length; i++) {
        if (!ytcenter.plugins[i].enabled) continue;
        if (ytcenter.plugins[i].requirements && !hasPluginRequirements(ytcenter.plugins[i].requirements)) {
          ytcenter.plugins[i].enabled = false;
          continue;
        }
        (function(yt, ytcenter, plugin, unsafeWindow){
          try {
            if (plugin.playerloaded) {
              plugin.playerloaded();
            }
          } catch (e) {
            console.log(plugin.name + ": An error occured in playerloaded()");
            console.log(e);
          }
        })(yt, ytcenter, ytcenter.plugins[i], unsafeWindow);
      }
    });
  }
  function hasPluginRequirements(req) {
    for (var i = 0; i < ytcenter.plugins.length; i++) {
      var f = false;
      for (var j = 0; j < req.length; j++) {
        if (req[j] === ytcenter.plugins[i].name && ytcenter.plugins[i].enabled) {
          f = true;
          break;
        }
      }
      if (!f) {
        return false;
      }
    }
    return true;
  }
  function initPluginGUI() {
    for (var i = 0; i < ytcenter.plugins.length; i++) {
      if (!ytcenter.plugins[i].enabled) continue;
      if (ytcenter.plugins[i].requirements && !hasPluginRequirements(ytcenter.plugins[i].requirements)) {
        ytcenter.plugins[i].enabled = false;
        continue;
      }
      console.log("Rendering Plugin: " + ytcenter.plugins[i].name);
      for (var j = 0; j < ytcenter.plugins[i].placements.length; j++) {
        var place = ytcenter.plugins[i].placements[j];
        var target = document.querySelector(place.target);
        
        var elm = place.element.split(".");
        if (elm.length == 1) {
          elm = $createPluginElement(ytcenter.plugins[i], getElementInPlugin(ytcenter.plugins[i], elm[0]));
        } else if (elm.length == 2) {
          elm = $createPluginElement(getInstalledPlugin(elm[0]), getElementInPlugin(getInstalledPlugin(elm[0]), elm[1]));
        } else {
          throw "Element in ytcenter.plugins[].element is invalid.";
        }
        
        if (!place.method || place.method === 'append') {
          target.appendChild(elm);
        } else if (place.method === 'prepend') {
          if (target.children.length > 0) {
            target.insertBefore(elm, target.firstChild);
          } else {
            target.appendChild(elm);
          }
        } else if (place.method === 'insertBefore') {
          target.parentNode.insertBefore(elm, target);
        } else if (place.method === 'insertAfter') {
          if (target.parentNode.lastChild == target) {
            target.parentNode.appendChild(elm);
          } else {
            target.parentNode.insertBefore(elm, target.nextSibling);
          }
        } else {
          throw "Unknown method(" + place.method + ") in ytcenter.plugins[].placements[].method";
        }
      }
    }
  }
  
  function getInstalledPlugin(name) {
    for (var i = 0; i < ytcenter.plugins.length; i++) {
      if (ytcenter.plugins[i].name === name) return ytcenter.plugins[i];
    }
    throw "The plugin: \"" + name + "\" is not installed.";
  }
  
  function getElementInPlugin(plugin, name) {
    for (var i = 0; i < plugin.elements.length; i++) {
      if (plugin.elements[i].name == name) {
        return plugin.elements[i];
      }
    }
    throw "Element: " + name + ", was not found in plugin: " + plugin.name + ".";
  }
  
  function $createPluginElement(plugin, pluginElement) {
    var e = getElementInPlugin(plugin, pluginElement.name);
    var t = null;
    var t_plugin = plugin.name;
    if (!e.template) {
      t = ytcenter.templates['element'];
    } else if (!ytcenter.templates[e.template]) {
      var s = e.template.split(".");
      if (s.length == 1) {
        var _e = getElementInPlugin(plugin, s[0]);
        t = _e;
      } else if (s.length == 2) {
        t_plugin = getInstalledPlugin(s[0]);
        t = getElementInPlugin(t_plugin, s[1]);
      } else {
        throw "Unknown template in " + plugin.name + "." + e.name;
      }
    } else {
      t = ytcenter.templates[e.template];
    }
    var element;
    if (t.tagname && !e.tagname && t.tagname === '#text') {
      element = document.createTextNode("");
    } else if (e.tagname && e.tagname === '#text') {
      element = document.createTextNode("");
    } else {
      element = document.createElement(e.tagname || t.tagname);
    }
    $addElementInformations(element, t, t_plugin);
    $addElementInformations(element, e, plugin);
    if (e.loaded) {
      e.loaded(element, pluginElement, plugin, t, t_plugin);
    } else if (t.loaded) {
      t.loaded(element, pluginElement, plugin, t, t_plugin);
    }
    return element;
  }
  
  function $addElementInformations(element, e, plugin) {
    if (e.children) {
      for (var i = 0; i < e.children.length; i++) {
        if (e.children[i] instanceof Node) {
          element.appendChild(e.children[i]);
        } else {
          var s = e.children[i].split(".");
          if (s.length == 1) {
            element.appendChild($createPluginElement(plugin, getElementInPlugin(plugin, s[0])));
          } else if (s.length == 2) {
            element.appendChild($createPluginElement(plugin, getElementInPlugin(getInstalledPlugin(s[0]), s[1])));
          } else {
            throw "Invalid name";
          }
        }
      }
    }
    if (e.classNames) {
      for (var i = 0; i < e.classNames.length; i++) {
        $addClass(element, e.classNames[i]);
      }
    }
    if (e.style) {
      for (var key in e.style) {
        if (e.style.hasOwnProperty(key)) {
          element.style[key] = e.style[key];
        }
      }
    }
    if (e.attributes) {
      for (var key in e.attributes) {
        if (e.attributes.hasOwnProperty(key)) {
          element.setAttribute(key, e.attributes[key]);
        }
      }
    }
    if (e.events) {
      for (var key in e.events) {
        if (e.events.hasOwnProperty(key)) {
          $addEvent(e.events[key]);
        }
      }
    }
    if (e.properties) {
      for (var key in e.properties) {
        if (e.properties.hasOwnProperty(key)) {
          element[key] = e.properties[key];
        }
      }
    }
    if (e.firstChild && element.children.length > 0) {
      $addElementInformations(element.firstChild, e.firstChild, plugin);
    }
  }
  
  function initPluginPreload() {
    for (var i = 0; i < ytcenter.plugins.length; i++) {
      if (ytcenter.plugins[i].enabled) {
        if (ytcenter.plugins[i].requirements && !hasPluginRequirements(ytcenter.plugins[i].requirements)) {
          ytcenter.plugins[i].enabled = false;
          continue;
        }
        (function(yt, ytcenter, plugin, unsafeWindow){
          try {
            if (plugin.preload) {
              plugin.preload();
            }
          } catch (e) {
            console.log(plugin.name + ": An error occured in preload()");
            console.log(e);
          }
        })(yt, ytcenter, ytcenter.plugins[i], unsafeWindow);
      }
    }
  }
  function initPluginLoaded() {
    for (var i = 0; i < ytcenter.plugins.length; i++) {
      if (ytcenter.plugins[i].enabled) {
        if (ytcenter.plugins[i].requirements && !hasPluginRequirements(ytcenter.plugins[i].requirements)) {
          ytcenter.plugins[i].enabled = false;
          continue;
        }
        (function(yt, ytcenter, plugin, unsafeWindow){
          try {
            if (plugin.loaded) {
              plugin.loaded();
            }
          } catch (e) {
            console.log(plugin.name + ": An error occured in loaded()");
            console.log(e);
          }
        })(yt, ytcenter, ytcenter.plugins[i], unsafeWindow);
      }
    }
  }
  function initPluginPreplugin() {
    for (var i = 0; i < ytcenter.plugins.length; i++) {
      if (ytcenter.plugins[i].enabled) {
        if (ytcenter.plugins[i].requirements && !hasPluginRequirements(ytcenter.plugins[i].requirements)) {
          ytcenter.plugins[i].enabled = false;
          continue;
        }
        (function(yt, ytcenter, plugin, unsafeWindow){
          try {
            if (plugin.preplugin) {
              plugin.preplugin();
            }
          } catch (e) {
            console.log(plugin.name + ": An error occured in preplugin()");
            console.log(e);
          }
        })(yt, ytcenter, ytcenter.plugins[i], unsafeWindow);
      }
    }
  }
  function initPluginPluginLoaded() {
    for (var i = 0; i < ytcenter.plugins.length; i++) {
      if (ytcenter.plugins[i].enabled) {
        if (ytcenter.plugins[i].requirements && !hasPluginRequirements(ytcenter.plugins[i].requirements)) {
          ytcenter.plugins[i].enabled = false;
          continue;
        }
        (function(yt, ytcenter, plugin, unsafeWindow){
          try {
            if (plugin.pluginloaded) {
              plugin.pluginloaded();
            }
          } catch (e) {
            console.log(plugin.name + ": An error occured in pluginloaded()");
            console.log(e);
          }
        })(yt, ytcenter, ytcenter.plugins[i], unsafeWindow);
      }
    }
  }
  function createCookie(name, value, days) {
    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + (days*24*60*60*1000));
      var expires = "; expires="+date.toGMTString();
    } else {
      var expires = "";
    }
    document.cookie = name + "=" + value + expires + "; path=/";
  }

  function readCookie(name, def) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ')
        c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) == 0)
        return c.substring(nameEQ.length, c.length);
    }
    return (def ? def : undefined);
  }

  function eraseCookie(name) {
    createCookie(name, "", -1);
  }

  function mergeObjects(obj1, obj2) {
    var obj3 = {};
    for (var key in obj1) {
      if (obj1.hasOwnProperty(key)) {
        obj3[key] = obj1[key];
      }
    }
    for (var key in obj2) {
      if (obj2.hasOwnProperty(key)) {
        obj3[key] = obj2[key];
      }
    }
    return obj3;
  }
  
  function $addClass(element, className) {
    var classes = element.className.split(" ");
    for (var i = 0; i < classes.length; i++) {
      if (classes === className) return;
    }
    classes.push(className);
    element.className = classes.join(" ");
  }
  
  function $addEvent(element, event) {
    if (element.addEventListener) {
      element.addEventListener(event.event, event.callback, event.useCapture || false);
    } else if (element.attachEvent) {
      element.attachEvent('on' + event.event, event.callback);
    } else {
      throw "Couldn't add event listener, please upgrade your browser!";
    }
  }
  function isInIframe() {
    if (unsafeWindow.parent) {
      return (location != parent.location);
    } else {
      return false;
    }
    return (location != parent.location) ? true : false;
  }
  if (location.href.match(/^http(?:s)?:\/\/(?:.*?).youtube.com\/#ytcenter-plugin-install-(.*?)-(.*?)$/)) {
    var loc = location.href.match(/^http(?:s)?:\/\/(?:.*?).youtube.com\/#ytcenter-plugin-install-(.*?)-(.*?)$/);
    var id = unescape(loc[1]);
    var name = unescape(loc[2]);
    loadSettings();
    document.addEventListener("DOMContentLoaded", (function(id, name){return function(){
      var width = 460;
      var height = 230;
      document.body.innerHTML = "";
      document.body.style.textAlign = "center";
      document.body.style.verticalAlign = "middle";
      var main = document.createElement("div");
      main.className = "yt-rounded";
      main.style.background = "#FFFFFF";
      main.style.display = "inline-block";
      main.style.width = width + "px";
      main.style.height = height + "px";
      main.style.position = "absolute";
      main.style.top = "50%";
      main.style.left = "50%";
      main.style.marginTop = (-height/2) + "px";
      main.style.marginLeft = (-width/2) + "px";
      var container = document.createElement("div");
      container.style.textAlign = "center";
      var title = document.createElement("h3");
      var loading = document.createElement("img");
      loading.src = ytcenter.icons.loading;
      title.appendChild(document.createTextNode(locale['plugin_install_title_installing'].replace("%s", name)));
      container.appendChild(title);
      container.appendChild(loading);
      main.appendChild(container);
      document.body.appendChild(main);
      GM_xmlhttpRequest({
        url: 'http://ytcenter.runerne.dk/getplugin.php?id=' + escape(id),
        method: 'GET',
        onload: (function(id, name, main, container, title, loading){
          return function(response){
            console.log(response);
            if (response.responseText === '-1') {
              loading.style.display = "none";
              title.textContent = locale['plugin_install_title_notfound'].replace("%s", name);
              return;
            } else {
              var data = eval('(' + response.responseText + ')');
              for (var i = 0; i < ytcenter.plugins.length; i++) {
                if (ytcenter.plugins[i].id == data.id) {
                  if (ytcenter.plugins[i].version != data.version) {
                    delete ytcenter.plugins[i];
                  } else {
                    loading.style.display = "none";
                    title.textContent = locale['plugin_install_title_alreadyinstalled'].replace("%s", name);
                    return;
                  }
                  break;
                }
              }
              ytcenter.plugins.push(data);
              saveSettings();
            }
            unsafeWindow.close();
          }
        })(id, name, main, container, title, loading)
      });
    }})(id, name), true);
  } else if (location.href.match(/^http(?:s)?:\/\/(?:.*?).youtube.com\/watch(?:.*?)/)) {
      document.addEventListener("DOMContentLoaded", function(){
        loadSettings();
        
        initYouTubeCenterVariables();
        
        initPluginPreload();
        initYouTubeCenter();
        initPluginLoaded();
        initPluginPreplugin();
        initPluginGUI();
        initPluginPluginLoaded();
        
        saveSettings();
        
        console.log(yt);
        console.log(ytcenter);
      }, true);
  } else if (location.href.match(/^http(s)?:\/\/ytcenter.runerne.dk\/plugins.php/)) {
    document.addEventListener("DOMContentLoaded", function(){
      var btns = document.getElementsByTagName("ytinstall");
      for (var i = 0; i < btns.length; i++) {
        var id = btns[i].getAttribute("ytcenter-id");
        var name = btns[i].getAttribute("ytcenter-name");
        var ins = document.createElement("button");
        ins.textContent = "Install";
        $addEvent(ins, {
          event: 'click',
          callback: (function(id, name){
            return function(){
              var width = 490;
              var height = 250;
              var left = screen.width/2-width/2;
              var top = screen.height/2-height/2;
              var popup = unsafeWindow.open("http://www.youtube.com/#ytcenter-plugin-install-" + escape(id) + "-" + escape(name), "Plugin " + name, "resizable=0,scrollbars=1,height=" + height + ",width=" + width + ",top=" + top + ",left = " + left);
            }
          })(id, name),
        });
        btns[i].parentNode.replaceChild(ins, btns[i]);
      }
    }, true);
  }
})(unsafeWindow);