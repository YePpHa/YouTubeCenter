/**
  The MIT License (MIT)

  Copyright (c) 2013 Jeppe Rune Mortensen

  Permission is hereby granted, free of charge, to any person obtaining a copy of
  this software and associated documentation files (the "Software"), to deal in
  the Software without restriction, including without limitation the rights to
  use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
  the Software, and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
  FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
  COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
  IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
// ==UserScript==
// @name            @name@
// @namespace       http://www.facebook.com/YouTubeCenter
// @version         @version@
// @author          Jeppe Rune Mortensen (YePpHa)
// @description     YouTube Center contains all kind of different useful functions which makes your visit on YouTube much more entertaining.
// @icon            https://raw.github.com/YePpHa/YouTubeCenter/master/assets/logo-48x48.png
// @icon64          https://raw.github.com/YePpHa/YouTubeCenter/master/assets/logo-64x64.png
// @domain          userscripts.org
// @domain          youtube.com
// @domain          www.youtube.com
// @domain          gdata.youtube.com
// @domain          apis.google.com
// @match           http://*.youtube.com/*
// @match           https://*.youtube.com/*
// @match           http://userscripts.org/scripts/source/114002.meta.js
// @match           http://s.ytimg.com/yts/jsbin/*
// @match           https://s.ytimg.com/yts/jsbin/*
// @match           https://github.com/YePpHa/YouTubeCenter/blob/master/devbuild.number
// @match           http://apis.google.com/*/widget/render/comments?*
// @match           https://apis.google.com/*/widget/render/comments?*
// @match           http://plus.googleapis.com/*/widget/render/comments?*
// @match           https://plus.googleapis.com/*/widget/render/comments?*
// @include         http://*.youtube.com/*
// @include         https://*.youtube.com/*
// @include         http://apis.google.com/*/widget/render/comments?*
// @include         https://apis.google.com/*/widget/render/comments?*
// @include         http://plus.googleapis.com/*/widget/render/comments?*
// @include         https://plus.googleapis.com/*/widget/render/comments?*
// @exclude         http://apiblog.youtube.com/*
// @exclude         https://apiblog.youtube.com/*
// @grant           GM_getValue
// @grant           GM_setValue
// @grant           GM_xmlhttpRequest
// @grant           GM_addStyle
// @grant           GM_log
// @grant           GM_registerMenuCommand
// @updateURL       @updateURL@
// @downloadURL     @downloadURL@
// @updateVersion   @ant-revision@
// @run-at          document-start
// @priority        9001
// ==/UserScript==

(function(){
  "use strict";
  function inject(func) {
    try {
      var script = document.createElement("script"),
          p = (document.body || document.head || document.documentElement);
      if (!p) {
        return;
      }
      script.setAttribute("type", "text/javascript");
      if (typeof func === "string") {
        func = "function(){" + func + "}";
      }
      script.appendChild(document.createTextNode("(" + func + ")(true, @identifier@, @devbuild@, @devnumber@);\n//# sourceURL=YouTubeCenter.js"));
      p.appendChild(script);
      p.removeChild(script);
    } catch (e) {}
  }
  function injected_saveSettings(id, key, data) {
    var runtimeOrExtension = chrome.runtime && chrome.runtime.sendMessage ? "runtime" : "extension";
    chrome[runtimeOrExtension].sendMessage(JSON.stringify({ "method": "setLocalStorage", "key": key, "data": data }), function(response) {
      if (typeof response === "string") response = JSON.parse(response);
      inject("window.ytcenter.storage.onsaved(" + id + ")");
    });
  }
  function injected_loadSettings(id, key) {
    var runtimeOrExtension = chrome.runtime && chrome.runtime.sendMessage ? "runtime" : "extension";
    chrome[runtimeOrExtension].sendMessage(JSON.stringify({ "method": "getLocalStorage", "key": key }), function(response) {
      if (typeof response === "string") response = JSON.parse(response);
      inject("window.ytcenter.storage.onloaded(" + id + ", " + (response ? (response.data ? (typeof response.data === "string" ? response.data : JSON.stringify(response.data)) : "{}") : {}) + ")");
    });
  }
  function injected_xhr(id, details) {
    var xmlhttp, prop;
    if (typeof GM_xmlhttpRequest !== "undefined") {
      GM_xmlhttpRequest(details);
      return true;
    } else {
      if (typeof XMLHttpRequest !== "undefined") {
        xmlhttp = new XMLHttpRequest();
      } else if (typeof opera !== "undefined" && typeof opera.XMLHttpRequest !== "undefined") {
        xmlhttp = new opera.XMLHttpRequest();
      } else if (typeof uw !== "undefined" && typeof uw.XMLHttpRequest !== "undefined") {
        xmlhttp = new uw.XMLHttpRequest();
      } else {
        inject("window.ytcenter.xhr.onerror(" + id + ", {})");
        return false;
      }
      xmlhttp.onreadystatechange = function(){
        var responseState = {
          responseXML: '',
          responseText: (xmlhttp.readyState === 4 ? xmlhttp.responseText : ''),
          readyState: xmlhttp.readyState,
          responseHeaders: (xmlhttp.readyState === 4 ? xmlhttp.getAllResponseHeaders() : ''),
          status: (xmlhttp.readyState === 4 ? xmlhttp.status : 0),
          statusText: (xmlhttp.readyState === 4 ? xmlhttp.statusText : '')
        };
        inject("window.ytcenter.xhr.onreadystatechange(" + id + ", " + JSON.stringify(responseState) + ")");
        if (xmlhttp.readyState === 4) {
          if (xmlhttp.status >= 200 && xmlhttp.status < 300) {
            inject("window.ytcenter.xhr.onload(" + id + ", " + JSON.stringify(responseState) + ")");
          }
          if (xmlhttp.status < 200 || xmlhttp.status >= 300) {
            inject("window.ytcenter.xhr.onerror(" + id + ", " + JSON.stringify(responseState) + ")");
          }
        }
      };
      try {
        xmlhttp.open(details.method, details.url);
      } catch(e) {
        inject("window.ytcenter.xhr.onerror(" + id + ", {responseXML:'',responseText:'',readyState:4,responseHeaders:'',status:403,statusText:'Forbidden'})");
        return false;
      }
      if (details.headers) {
        for (prop in details.headers) {
          if (details.headers.hasOwnProperty(prop)) {
            xmlhttp.setRequestHeader(prop, details.headers[prop]);
          }
        }
      }
      xmlhttp.send((typeof details.data !== "undefined" ? details.data : null));
      return true;
    }
  }
  
  var main_function = function(injected, identifier, devbuild, devnumber){
    "use strict";
    //console.log("Script was " + (injected ? "injected" : " not injected") + ".");
    /** Injected
     * True, if it's injected into the page to compensate for the missing unsafeWindow variable.
     ** Identifier
     * 0 : UserScript
     * 1 : Chrome
     * 2 : Maxthon
     * 3 : Firefox
     * 4 : Safari
     * 5 : Opera
     **/
    /* UTILS */
    function $SaveData(key, value) {
      if (identifier === 2) {
        window.external.mxGetRuntime().storage.setConfig(key, value);
        return window.external.mxGetRuntime().storage.getConfig(key) === value;
      } else {
        if (ytcenter.storageType === 3) {
          GM_setValue(key, value);
          return GM_getValue(key) === value;
        } else if (ytcenter.storageType === 2) {
          localStorage[key] = value;
          return localStorage[key] === value; // validation
        } else if (ytcenter.storageType === 1) {
          uw.localStorage[key] = value;
          return uw.localStorage[key] === value; // validation
        } else if (ytcenter.storageType === 0) {
          ytcenter.utils.setCookie(key, value, null, "/", 1000*24*60*60*1000);
          return ytcenter.utils.getCookie(name) === value; // validation
        } else {
          con.error("[Storage] Unknown Storage Type!");
          return false;
        }
      }
    }

    function $LoadData(key, def) {
      if (identifier === 2) {
        return window.external.mxGetRuntime().storage.getConfig(key);
      } else {
        if (ytcenter.storageType === 3) {
          var d = GM_getValue(key, null);
          if (d !== null) return d;
        } else if (ytcenter.storageType === 2) {
          if (localStorage[key]) return localStorage[key];
        } else if (ytcenter.storageType === 1) {
          if (uw.localStorage[key]) return uw.localStorage[key];
        } else if (ytcenter.storageType === 0) {
          var d = ytcenter.utils.getCookie(name);
          if (d) return d;
        } else {
          con.error("[Storage] Unknown Storage Type!");
        }
        return def;
      }
    }
    function $UpdateChecker() {
      if (!ytcenter.settings.enableUpdateChecker) return;
      var curr = (new Date().getTime()),
          c = curr - 1000*60*60*parseInt(ytcenter.settings.updateCheckerInterval);
      con.log("Checking for updates in " + ((ytcenter.settings.updateCheckerLastUpdate - c)/1000/60/60) + " hours...");
      if (c >= ytcenter.settings.updateCheckerLastUpdate) {
        con.log("Checking for updates now...");
        ytcenter.settings.updateCheckerLastUpdate = curr;
        ytcenter.saveSettings();
        ytcenter.checkForUpdates();
      }
    }
    
    function $HasAttribute(elm, attr) {
      var i;
      for (i = 0; i < elm.attributes.length; i++) {
        if (elm.attributes[i].name == attr) return true;
      }
      return false;
    }
    
    function $GetOffset(elm) {
      var x = 0,
          y = 0;
      while (elm != null) {
        y += elm.offsetTop;
        x += elm.offsetLeft;
        elm = elm.offsetParent;
      }
      return [x, y];
    }
    
    function $CreateAspectButton() {
      var btn = document.createElement("button");
      btn.className = "yt-uix-button yt-uix-tooltip" + (ytcenter.settings.aspectEnable ? "" : " hid") + (!ytcenter.watch7 ? " yt-uix-button-default" : " yt-uix-button-text");
      btn.setAttribute("title", ytcenter.language.getLocale("BUTTON_ASPECT_TOOLTIP"));
      btn.setAttribute("type", "button");
      btn.setAttribute("role", "button");
      ytcenter.events.addEvent("ui-refresh", function(){
        btn.setAttribute("title", ytcenter.language.getLocale("BUTTON_ASPECT_TOOLTIP"));
        if (ytcenter.settings.aspectEnable) {
          ytcenter.utils.removeClass(btn, "hid");
        } else {
          ytcenter.utils.addClass(btn, "hid");
        }
      });
      
      var btnContent = document.createElement("span");
      btnContent.className = "yt-uix-button-content";
      btnContent.textContent = ytcenter.language.getLocale("BUTTON_ASPECT_TEXT");
      ytcenter.language.addLocaleElement(btnContent, "BUTTON_ASPECT_TEXT", "@textContent");
      
      btn.appendChild(btnContent);
      
      var arrow = document.createElement("img");
      arrow.className = "yt-uix-button-arrow";
      arrow.src = "//s.ytimg.com/yt/img/pixel-vfl3z5WfW.gif";
      arrow.setAttribute("alt", "");
      
      btn.appendChild(arrow);
      
      var groups = {
        'crop': 'BUTTON_ASPECT_CROP',
        'stretch': 'BUTTON_ASPECT_STRETCH'
      };
      
      var groupChoices = {
        '4:3': 'BUTTON_ASPECT_4:3',
        '16:9': 'BUTTON_ASPECT_16:9'
      };
      
      var menu = document.createElement("ul");
      menu.className = "yt-uix-button-menu yt-uix-button-menu-default yt-uix-button-menu-external hid";
      menu.setAttribute("role", "menu");
      menu.setAttribute("aria-haspopup", "true");
      var playerAspectTMP = ytcenter.settings['aspectValue'];
      var item;
      
      item = document.createElement("span");
      if (ytcenter.settings.aspectValue === "none") {
        item.setAttribute("style", "background:#555!important;color:#FFF!important;");
      }
      item.className = "yt-uix-button-menu-item";
      item.setAttribute("onclick", ";return false;");
      item.textContent = ytcenter.language.getLocale("BUTTON_ASPECT_NONE");
      ytcenter.language.addLocaleElement(item, "BUTTON_ASPECT_NONE", "@textContent");
      item.addEventListener("click", function(){
        playerAspectTMP = "none";
        if (ytcenter.settings.aspectSave) {
          ytcenter.settings['aspectValue'] = "none";
        }
        for (var i = 0; i < this.parentNode.parentNode.children.length; i++) {
          if (this.parentNode.parentNode.children[i].children[0] && this.parentNode.parentNode.children[i].children[0].tagName === "SPAN") {
            this.parentNode.parentNode.children[i].children[0].setAttribute("style", "");
          }
        }
        this.setAttribute("style", "background:#555!important;color:#FFF!important;");
        ytcenter.saveSettings();
        ytcenter.player.aspect("none");
      }, false);
      var li = document.createElement("li");
      li.setAttribute("role", "menuitem");
      li.appendChild(item);
      
      menu.appendChild(li);
      
      item = document.createElement("span");
      if (ytcenter.settings.aspectValue === "default") {
        item.setAttribute("style", "background:#555!important;color:#FFF!important;");
      }
      item.className = "yt-uix-button-menu-item";
      item.setAttribute("onclick", ";return false;");
      item.textContent = ytcenter.language.getLocale("BUTTON_ASPECT_DEFAULT");
      
      item.addEventListener("click", function(){
        playerAspectTMP = "default";
        if (ytcenter.settings.aspectSave) {
          ytcenter.settings['aspectValue'] = "default";
        }
        for (var i = 0; i < this.parentNode.parentNode.children.length; i++) {
          if (this.parentNode.parentNode.children[i].children[0] && this.parentNode.parentNode.children[i].children[0].tagName === "SPAN") {
            this.parentNode.parentNode.children[i].children[0].setAttribute("style", "");
          }
        }
        this.setAttribute("style", "background:#555!important;color:#FFF!important;");
        ytcenter.saveSettings();
        ytcenter.player.aspect("default");
      }, false);
      ytcenter.language.addLocaleElement(item, "BUTTON_ASPECT_DEFAULT", "@textContent");
      li = document.createElement("li");
      li.setAttribute("role", "menuitem");
      li.appendChild(item);
      
      menu.appendChild(li);
      
      for (var group in groups) {
        if (groups.hasOwnProperty(group)) {
          item = document.createElement("li");
          item.style.fontWeight = "bold";
          item.style.padding = "6px";
          item.textContent = ytcenter.language.getLocale(groups[group]);
          ytcenter.language.addLocaleElement(item, groups[group], "@textContent");
          menu.appendChild(item);
          for (var child in groupChoices) {
            if (groupChoices.hasOwnProperty(child)) {
              if (child === "4:3" && group === "crop") continue;
              var val = "yt:" + group + "=" + child;
              item = document.createElement("span");
              if (val === ytcenter.settings.aspectValue) {
                item.setAttribute("style", "background:#555!important;color:#FFF!important;");
              }
              item.className = "yt-uix-button-menu-item";
              item.setAttribute("role", "menuitem");
              item.setAttribute("onclick", ";return false;");
              item.textContent = ytcenter.language.getLocale(groupChoices[child]);
              ytcenter.language.addLocaleElement(item, groupChoices[child], "@textContent");
              item.addEventListener("click", (function(val, group, child){
                return function(){
                  var val = "yt:" + group + "=" + child;
                  playerAspectTMP = val;
                  if (ytcenter.settings.aspectSave) {
                    ytcenter.settings['aspectValue'] = val;
                  }
                  for (var i = 0; i < this.parentNode.parentNode.children.length; i++) {
                    if (this.parentNode.parentNode.children[i].children[0] && this.parentNode.parentNode.children[i].children[0].tagName === "SPAN") {
                      this.parentNode.parentNode.children[i].children[0].setAttribute("style", "");
                    }
                  }
                  this.setAttribute("style", "background:#555!important;color:#FFF!important;");
                  ytcenter.saveSettings();
                  ytcenter.player.aspect(val);
                };
              })(val, group, child), false);
              var li = document.createElement("li");
              li.setAttribute("role", "menuitem");
              
              li.appendChild(item);
              menu.appendChild(li);
            }
          }
          if (group === "crop") {
            var val = "yt:" + group + "=24:10";
            item = document.createElement("span");
            if (val === ytcenter.settings.aspectValue) {
              item.setAttribute("style", "background:#555!important;color:#FFF!important;");
            }
            item.className = "yt-uix-button-menu-item";
            item.setAttribute("role", "menuitem");
            item.setAttribute("onclick", ";return false;");
            item.textContent = ytcenter.language.getLocale("BUTTON_ASPECT_24:10");
            ytcenter.language.addLocaleElement(item, "BUTTON_ASPECT_24:10", "@textContent");
            item.addEventListener("click", (function(val, group, child){
              return function(){
                var val = "yt:" + group + "=24:10";
                playerAspectTMP = val;
                if (ytcenter.settings.aspectSave) {
                  ytcenter.settings['aspectValue'] = val;
                }
                for (var i = 0; i < this.parentNode.parentNode.children.length; i++) {
                  if (this.parentNode.parentNode.children[i].children[0] && this.parentNode.parentNode.children[i].children[0].tagName === "SPAN") {
                    this.parentNode.parentNode.children[i].children[0].setAttribute("style", "");
                  }
                }
                this.setAttribute("style", "background:#555!important;color:#FFF!important;");
                ytcenter.saveSettings();
                ytcenter.player.aspect(val);
              };
            })(val, group, child), false);
            var li = document.createElement("li");
            li.setAttribute("role", "menuitem");
            
            li.appendChild(item);
            menu.appendChild(li);
          }
        }
      }
      
      item = document.createElement("div");
      item.style.padding = "7px 9px 0 9px";
      item.style.borderTop = "1px #555 solid";
      var itemLabel = document.createElement("label");
      var label = document.createTextNode(ytcenter.language.getLocale("SETTINGS_ASPECT_REMEMBER"));
      itemLabel.appendChild(label);
      ytcenter.language.addLocaleElement(label, "SETTINGS_ASPECT_REMEMBER", "@textContent");
      
      var itemCheckbox = $CreateCheckbox(ytcenter.settings.aspectSave);
      itemCheckbox.style.marginLeft = "3px";
      
      itemLabel.addEventListener("click", function(){
        ytcenter.settings.aspectSave = !ytcenter.settings.aspectSave;
        if (ytcenter.settings.aspectSave) {
          ytcenter.utils.addClass(itemCheckbox, "checked");
          ytcenter.settings.aspectValue = playerAspectTMP;
        } else {
          ytcenter.utils.removeClass(itemCheckbox, "checked");
        }
        ytcenter.saveSettings();
      }, false);
      
      
      itemLabel.appendChild(itemCheckbox);
      
      item.appendChild(itemLabel);
      
      menu.appendChild(item);
      
      
      btn.appendChild(menu);
      
      ytcenter.placementsystem.registerElement(btn, "@aspectbtn");
    }
    
    function $CreateResizeButton() {
      function getItemTitle(item) {
        var dim = ytcenter.utils.calculateDimensions(item.config.width, item.config.height);
        if (typeof item.config.customName !== "undefined" && item.config.customName !== "") {
          return item.config.customName;
        } else if (isNaN(parseInt(item.config.width)) && isNaN(parseInt(item.config.height))) {
          return (item.config.large ? ytcenter.language.getLocale("SETTINGS_RESIZE_LARGE") : ytcenter.language.getLocale("SETTINGS_RESIZE_SMALL"));
          subtext.textContent = (item.config.align ? ytcenter.language.getLocale("SETTINGS_RESIZE_ALIGN") : ytcenter.language.getLocale("SETTINGS_RESIZE_CENTER"));
        } else {
          return dim[0] + "×" + dim[1];
          subtext.textContent = (item.config.large ? ytcenter.language.getLocale("SETTINGS_RESIZE_LARGE") : ytcenter.language.getLocale("SETTINGS_RESIZE_SMALL")) + " - " + (item.config.align ? ytcenter.language.getLocale("SETTINGS_RESIZE_ALIGN") : ytcenter.language.getLocale("SETTINGS_RESIZE_CENTER"));
        }
      }
      function getItemSubText(item) {
        if (isNaN(parseInt(item.config.width)) && isNaN(parseInt(item.config.height))) {
          return (item.config.align ? ytcenter.language.getLocale("SETTINGS_RESIZE_ALIGN") : ytcenter.language.getLocale("SETTINGS_RESIZE_CENTER")) + (item.config.scrollToPlayer ? " - " + ytcenter.language.getLocale("SETTINGS_RESIZE_SCROLLTOPLAYER") : "");
        } else {
          return (item.config.large ? ytcenter.language.getLocale("SETTINGS_RESIZE_LARGE") : ytcenter.language.getLocale("SETTINGS_RESIZE_SMALL")) + " - " + (item.config.align ? ytcenter.language.getLocale("SETTINGS_RESIZE_ALIGN") : ytcenter.language.getLocale("SETTINGS_RESIZE_CENTER")) + (item.config.scrollToPlayer ? " - " + ytcenter.language.getLocale("SETTINGS_RESIZE_SCROLLTOPLAYER") : "");
        }
      }
      function setValue(id) {
        var item;
        ytcenter.utils.each(ytcenter.settings["resize-playersizes"], function(i, val){
          if (val.id !== ytcenter.player.currentResizeId) return;
          item = val;
          return false;
        });
      }
      function updateItems(items) {
        menu.innerHTML = "";
        var db = [];
        ytcenter.utils.each(items, function(i, item){
          var li = document.createElement("li");
          li.setAttribute("role", "menuitem");
          var span = document.createElement("span");
          db.push(span);
          
          span.className = "yt-uix-button-menu-item" + (ytcenter.player.currentResizeId === item.id ? " ytcenter-resize-dropdown-selected" : "");
          span.style.paddingBottom = "12px";
          
          if (ytcenter.player.currentResizeId === item.id) {
            setValue(ytcenter.player.currentResizeId);
          }
          
          var title = document.createElement("span");
          title.textContent = getItemTitle(item);
          ytcenter.events.addEvent("ui-refresh", function(){
            title.textContent = getItemTitle(item);
          });
          title.style.display = "block";
          title.style.fontWeight = "bold";
          var subtext = document.createElement("span");
          subtext.textContent = getItemSubText(item);
          ytcenter.events.addEvent("ui-refresh", function(){
            subtext.textContent = getItemSubText(item);
          });
          subtext.style.display = "block";
          subtext.style.fontSize = "11px";
          subtext.style.lineHeight = "0px";
          
          ytcenter.utils.addEventListener(li, "click", function(){
            try {
              ytcenter.player.currentResizeId = item.id;
              ytcenter.player.updateResize();
              setValue(ytcenter.player.currentResizeId);
              
              try {
                document.body.click();
              } catch (e) {
                con.error(e);
              }
              
              ytcenter.utils.each(db, function(_i, elm){
                ytcenter.utils.removeClass(elm, "ytcenter-resize-dropdown-selected");
              });
              ytcenter.utils.addClass(span, "ytcenter-resize-dropdown-selected");
            } catch (e) {
              con.error(e);
            }
          });
          
          span.appendChild(title);
          span.appendChild(subtext);
          li.appendChild(span);
          
          menu.appendChild(li);
        });
      }
      var btnLabel = ytcenter.gui.createYouTubeButtonTextLabel("BUTTON_RESIZE_TEXT");
      
      var menu = document.createElement("ul");
      menu.className = "yt-uix-button-menu yt-uix-button-menu-default yt-uix-button-menu-external hid";
      menu.setAttribute("role", "menu");
      
      var arrow = ytcenter.gui.createYouTubeButtonArrow();
      
      var btn = ytcenter.gui.createYouTubeButton("BUTTON_RESIZE_TOOLTIP", [btnLabel, arrow, menu]);
      btn.style.textAlign = "left";
      if (ytcenter.settings.resizeEnable) {
        ytcenter.utils.removeClass(btn, "hid");
      } else {
        ytcenter.utils.addClass(btn, "hid");
      }
      
      updateItems(ytcenter.settings["resize-playersizes"]);
      ytcenter.events.addEvent("settings-update", function(){
        updateItems(ytcenter.settings["resize-playersizes"]);
      });
      ytcenter.player.resizeCallback.push(function(){
        updateItems(ytcenter.settings["resize-playersizes"]);
      });
      
      ytcenter.events.addEvent("ui-refresh", function(){
        if (ytcenter.settings.resizeEnable) {
          ytcenter.utils.removeClass(btn, "hid");
        } else {
          ytcenter.utils.addClass(btn, "hid");
        }
      });
      
      ytcenter.placementsystem.registerElement(btn, "@resizebtn");
    }
    
    function $CreateCheckbox(_checked) {
      var checked = _checked || false;
      var cont = document.createElement("span");
      con.log("Is checked: " + checked + " (" + (checked ? " checked" : "") + ")");
      cont.className = "yt-uix-form-input-checkbox-container" + (checked ? " checked" : "");
      
      var inp = document.createElement("input");
      inp.setAttribute("type", "checkbox");
      inp.className = "yt-uix-form-input-checkbox";
      inp.value = "true";
      if (checked) {
        inp.checked = "checked";
      }
      
      var span = document.createElement("span");
      span.className = "yt-uix-form-input-checkbox-element";
      
      cont.appendChild(inp);
      cont.appendChild(span);
      
      return cont;
    }
    
    function $CreateLightButton() {
      var btn = document.createElement("button");
      ytcenter.events.addEvent("ui-refresh", function(){
        if (ytcenter.settings.lightbulbEnable) {
          ytcenter.utils.removeClass(btn, "hid");
        } else {
          ytcenter.utils.addClass(btn, "hid");
        }
      });
      btn.setAttribute("onclick", ";return false;");
      btn.setAttribute("type", "button");
      btn.setAttribute("role", "button");
      btn.className = "yt-uix-button yt-uix-tooltip" + (ytcenter.settings.lightbulbEnable ? "" : " hid") + (!ytcenter.watch7 ? " yt-uix-button-default" : " yt-uix-button-text");
      btn.title = ytcenter.language.getLocale("LIGHTBULB_TOOLTIP");
      //btn.style.marginLeft = ".5em";
      ytcenter.language.addLocaleElement(btn, "LIGHTBULB_TOOLTIP", "title");
      var s = document.createElement("span");
      s.className = "yt-uix-button-content";
      var icon = document.createElement("img");
      icon.setAttribute("alt", "");
      icon.src = ytcenter.icon.lightbulb;
      s.appendChild(icon);
      btn.appendChild(s);
      
      btn.addEventListener("click", function(){
        ytcenter.player.toggleLights();
      }, false);
      
      ytcenter.placementsystem.registerElement(btn, "@lightbtn");
    }
    function $CreateRepeatButton() {
      var btn = document.createElement("button");
      btn.style.margin = "0 2px 0 0";
      ytcenter.events.addEvent("ui-refresh", function(){
        if (ytcenter.settings.enableRepeat) {
          ytcenter.utils.removeClass(btn, 'hid');
        } else {
          ytcenter.utils.addClass(btn, 'hid');
        }
      });
      btn.title = ytcenter.language.getLocale("BUTTON_REPEAT_TOOLTIP");
      ytcenter.language.addLocaleElement(btn, "BUTTON_REPEAT_TOOLTIP", "title");
      btn.setAttribute("role", "button");
      btn.setAttribute("type", "button");
      btn.setAttribute("onclick", ";return false;");
      btn.className = "yt-uix-button yt-uix-tooltip" + (ytcenter.settings.autoActivateRepeat ? " ytcenter-uix-button-toggled" : " yt-uix-button-text") + (ytcenter.settings.enableRepeat ? "" : " hid");
      btn.addEventListener("click", function(){
        if (ytcenter.doRepeat) {
          ytcenter.utils.removeClass(this, 'ytcenter-uix-button-toggled');
          ytcenter.utils.addClass(this, 'yt-uix-button-text');
          ytcenter.doRepeat = false;
        } else {
          ytcenter.utils.addClass(this, 'ytcenter-uix-button-toggled');
          ytcenter.utils.removeClass(this, 'yt-uix-button-text');
          ytcenter.doRepeat = true;
        }
      }, false);
      if (ytcenter.settings.autoActivateRepeat) {
        ytcenter.doRepeat = true;
      } else {
        ytcenter.doRepeat = false;
      }
      
      var iconw = document.createElement("span");
      iconw.className = "yt-uix-button-icon-wrapper";
      if (!ytcenter.settings.repeatShowIcon) {
        iconw.style.display = "none";
      }
      ytcenter.events.addEvent("ui-refresh", function(){
        if (ytcenter.settings.repeatShowIcon) {
          iconw.style.display = "";
        } else {
          iconw.style.display = "none";
        }
      });
      var icon = document.createElement("img");
      icon.className = "yt-uix-button-icon " + (ytcenter.watch7 ? "ytcenter-repeat-icon" : "yt-uix-button-icon-playlist-bar-autoplay");
      icon.src = "//s.ytimg.com/yt/img/pixel-vfl3z5WfW.gif";
      if (!ytcenter.watch7) {
        icon.style.background = "no-repeat url(//s.ytimg.com/yts/imgbin/www-refresh-vflMaphyY.png) -173px -60px";
        icon.style.width = "20px";
        icon.style.height = "17px";
      }
      /*icon.style.width = "20px";
      icon.style.height = "18px";
      icon.style.background = "no-repeat url(//s.ytimg.com/yt/imgbin/www-master-vfl8ZHa_q.png) -303px -38px";*/
      icon.setAttribute("alt", "");
      iconw.appendChild(icon);
      
      btn.appendChild(iconw);
      
      var t = document.createElement("span");
      t.className = "yt-uix-button-content";
      t.textContent = ytcenter.language.getLocale("BUTTON_REPEAT_TEXT");
      ytcenter.language.addLocaleElement(t, "BUTTON_REPEAT_TEXT", "@textContent");
      
      btn.appendChild(t);
      
      ytcenter.placementsystem.registerElement(btn, "@repeatbtn");
    }
    
    function $DownloadButtonStream() {
      var priority = ['small', 'medium', 'large', 'hd720', 'hd1080', 'hd1440', 'highres'];
      var stream;
      var format = (function(){
        for (var i = 0; i < ytcenter.video.format.length; i++) {
          if (ytcenter.settings.downloadFormat == ytcenter.video.format[i].key) {
            return ytcenter.video.format[i].type;
          }
        }
        return ytcenter.language.getLocale("UNKNOWN");
      })();
      for (var i = 0; i < ytcenter.video.streams.length; i++) {
        if ((stream == null || $ArrayIndexOf(priority, ytcenter.video.streams[i].quality) > $ArrayIndexOf(priority, stream.quality)) && $ArrayIndexOf(priority, ytcenter.video.streams[i].quality) <= $ArrayIndexOf(priority, ytcenter.settings.downloadQuality) && ytcenter.video.streams[i].type && ytcenter.video.streams[i].type.indexOf(format) == 0 && ytcenter.video.streams[i].url) {
          stream = ytcenter.video.streams[i];
        }
      }
      return stream;
    }
    function $CreateDownloadButton() {
      var g = document.createElement("span");
      g.style.margin = "0 2px 0 0";
      ytcenter.events.addEvent("ui-refresh", function(){
        if (ytcenter.settings.enableDownload) {
          ytcenter.utils.removeClass(g, "hid");
          g.style.display = "";
        } else {
          ytcenter.utils.addClass(g, "hid");
          g.style.display = "none";
        }
      });
      g.className = "yt-uix-button-group" + (ytcenter.settings.enableDownload ? "" : " hid");
      if (!ytcenter.settings.enableDownload) {
        g.style.display = "none";
      }
      
      var stream = $DownloadButtonStream();
      
      var btn1a = document.createElement("a");
      if (stream) {
        btn1a.setAttribute("href", ytcenter.video.downloadLink(stream));
        btn1a.setAttribute("download", ytcenter.video.getFilename(stream) + ytcenter.video.getFilenameExtension(stream));
      }
      btn1a.setAttribute("target", "_blank");
      ytcenter.events.addEvent("ui-refresh", function(){
        stream = $DownloadButtonStream();
        if (stream) {
          btn1a.setAttribute("href", ytcenter.video.downloadLink(stream));
          btn1a.setAttribute("download", ytcenter.video.getFilename(stream) + ytcenter.video.getFilenameExtension(stream));
        }
      });
      
      var btn1 = document.createElement("button");
      btn1.className = "start yt-uix-button yt-uix-tooltip" + (!ytcenter.watch7 ? " yt-uix-button-default" : " yt-uix-button-text");
      //btn1.setAttribute("onclick", ";return false;");
      btn1.setAttribute("type", "button");
      btn1.setAttribute("role", "button");
      btn1.addEventListener("click", function(e){
        if (!ytcenter.settings.downloadAsLinks) {
          stream = $DownloadButtonStream();
          if (stream) {
            ytcenter.video.download(stream.itag);
          }
          e.preventDefault();
        }
      }, false);
      
      if (stream != null) {
        var stream_name = {
          highres: ytcenter.language.getLocale("HIGHRES"),
          hd1440: ytcenter.language.getLocale("HD1440"),
          hd1080: ytcenter.language.getLocale("HD1080"),
          hd720: ytcenter.language.getLocale("HD720"),
          large: ytcenter.language.getLocale("LARGE"),
          medium: ytcenter.language.getLocale("MEDIUM"),
          small: ytcenter.language.getLocale("SMALL")
        }[stream.quality];
        btn1.title = ytcenter.utils.replaceTextAsString(ytcenter.language.getLocale("BUTTON_DOWNLOAD_TOOLTIP"), {
          stream_name: stream_name,
          stream_resolution: stream.dimension.split("x")[1] + "p",
          stream_dimension: stream.dimension,
          stream_3d: (stream.stereo3d && stream.stereo3d == 1 ? "&nbsp;3D" : ""),
          stream_type: (function(stream){
            for (var i = 0; i < ytcenter.video.format.length; i++) {
              if (stream.type.indexOf(ytcenter.video.format[i].type) == 0) {
                return ytcenter.language.getLocale(ytcenter.video.format[i].name);
              }
            }
            return ytcenter.language.getLocale("UNKNOWN");
          })(stream)
        });
      } else {
        btn1.title = ytcenter.utils.replaceTextAsString(ytcenter.language.getLocale("BUTTON_DOWNLOAD_TOOLTIP_NONE"), {
          type: (function(){
            for (var i = 0; i < ytcenter.video.format.length; i++) {
              if (ytcenter.settings.downloadFormat == ytcenter.video.format[i].key) {
                return ytcenter.language.getLocale(ytcenter.video.format[i].name);
              }
            }
            return ytcenter.language.getLocale("UNKNOWN");
          })()
        });
      }
      ytcenter.events.addEvent("ui-refresh", function(){
        var stream = $DownloadButtonStream();
        if (stream != null) {
          var stream_name = {
            highres: ytcenter.language.getLocale("HIGHRES"),
            hd1440: ytcenter.language.getLocale("HD1440"),
            hd1080: ytcenter.language.getLocale("HD1080"),
            hd720: ytcenter.language.getLocale("HD720"),
            large: ytcenter.language.getLocale("LARGE"),
            medium: ytcenter.language.getLocale("MEDIUM"),
            small: ytcenter.language.getLocale("SMALL")
          }[stream.quality];
          
          btn1.title = ytcenter.utils.replaceTextAsString(ytcenter.language.getLocale("BUTTON_DOWNLOAD_TOOLTIP"), {
            stream_name: stream_name,
            stream_resolution: stream.dimension.split("x")[1] + "p",
            stream_dimension: stream.dimension,
            stream_3d: (stream.stereo3d && stream.stereo3d == 1 ? " 3D" : ""),
            stream_type: (function(stream){
              for (var i = 0; i < ytcenter.video.format.length; i++) {
                if (stream.type.indexOf(ytcenter.video.format[i].type) == 0) {
                  return ytcenter.language.getLocale(ytcenter.video.format[i].name);
                }
              }
              return ytcenter.language.getLocale("UNKNOWN");
            })(stream)
          });
        } else {
          btn1.title = ytcenter.utils.replaceTextAsString(ytcenter.language.getLocale("BUTTON_DOWNLOAD_TOOLTIP_NONE"), {
            type: (function(){
              for (var i = 0; i < ytcenter.video.format.length; i++) {
                if (ytcenter.settings.downloadFormat == ytcenter.video.format[i].key) {
                  return ytcenter.language.getLocale(ytcenter.video.format[i].name);
                }
              }
              return ytcenter.language.getLocale("UNKNOWN");
            })()
          });
        }
      });
      btn1a.appendChild(btn1);
      var btn1_text = document.createElement("span");
      btn1_text.className = "yt-uix-button-content";
      btn1_text.textContent = ytcenter.language.getLocale("BUTTON_DOWNLOAD_TEXT");
      ytcenter.language.addLocaleElement(btn1_text, "BUTTON_DOWNLOAD_TEXT", "@textContent");
      btn1.appendChild(btn1_text);
      g.appendChild(btn1a);
      var btn2 = document.createElement("button");
      btn2.className = "end yt-uix-button yt-uix-tooltip" + (!ytcenter.watch7 ? " yt-uix-button-default" : " yt-uix-button-text");
      btn2.setAttribute("onclick", ";return false;");
      btn2.setAttribute("type", "button");
      btn2.setAttribute("role", "button");
      btn2.title = ytcenter.language.getLocale("BUTTON_DOWNlOAD2_TOOLTIP");
      ytcenter.language.addLocaleElement(btn2, "BUTTON_DOWNlOAD2_TOOLTIP", "title");
      var img = document.createElement("img");
      img.className = "yt-uix-button-arrow";
      img.src = "//s.ytimg.com/yt/img/pixel-vfl3z5WfW.gif";
      img.setAttribute("alt", "");
      img.style.marginLeft = "0px";
      btn2.appendChild(img);
      
      var stream_groups = (function(){
        var groups = (function(){
          var obj = {};
          for (var i = 0; i < ytcenter.video.format.length; i++) {
            obj[ytcenter.video.format[i].type] = {
              label: ytcenter.video.format[i].name,
              key: ytcenter.video.format[i].key,
              help: ytcenter.video.format[i].help
            };
          }
          return obj;
        })();
        var sorted = {};
        for (var i = 0; i < ytcenter.video.streams.length; i++) {
          if (ytcenter.video.streams[i].type.indexOf("audio/mp4") !== 0 && (ytcenter.video.streams[i].size || ytcenter.video.streams[i].bitrate)) continue;
          if (ytcenter.video.streams[i].type) {
            var f = ytcenter.video.streams[i].type.split(";")[0];
            if (groups.hasOwnProperty(f)) {
              if (!sorted[groups[f].label]) sorted[groups[f].label] = {streams: [], key: groups[f].key, help: groups[f].help};
              sorted[groups[f].label].streams.push(ytcenter.video.streams[i]);
            } else {
              if (!sorted['UNKNOWN']) sorted['UNKNOWN'] = {streams: [], key: "unknown"};
              sorted['UNKNOWN'].streams.push(ytcenter.video.streams[i]);
            }
          } else {
            if (!sorted['UNKNOWN']) sorted['UNKNOWN'] = {streams: [], key: "unknown"};
            sorted['UNKNOWN'].streams.push(ytcenter.video.streams[i]);
          }
        }
        return sorted;
      })();
      
      var menu = document.createElement("ul");
      menu.className = "yt-uix-button-menu yt-uix-button-menu-default yt-uix-button-menu-external hid" + (ytcenter.settings.show3DInDownloadMenu ? "" : " ytcenter-menu-3d-hide");
      menu.setAttribute("role", "menu");
      menu.setAttribute("aria-haspopup", "true");
      ytcenter.events.addEvent("ui-refresh", function(){
        if (ytcenter.settings.show3DInDownloadMenu) {
          ytcenter.utils.removeClass(menu, "ytcenter-menu-3d-hide");
        } else {
          ytcenter.utils.addClass(menu, "ytcenter-menu-3d-hide");
        }
      });
      
      for (var key in stream_groups) {
        if (stream_groups.hasOwnProperty(key)) {
          var title = document.createElement("li");
          title.setAttribute("role", "menuitem");
          title.style.color = "#666";
          title.style.fontSize = "0.9166em";
          title.style.paddingLeft = "9px";
          if (key !== "UNKNOWN") {
            var __t = document.createTextNode(ytcenter.language.getLocale(key));
            title.appendChild(__t);
            ytcenter.language.addLocaleElement(__t, key, "@textContent");
            title.className = "ytcenter-downloadmenu-" + stream_groups[key].key;
            if (stream_groups[key].help) {
              var help = document.createElement("a");
              help.setAttribute("href", stream_groups[key].help);
              help.setAttribute("target", "_blank");
              help.setAttribute("style", "vertical-align: super; font-size: 10px");
              help.appendChild(document.createTextNode('?'));

              var replace = {
                option: {
                  toString: function() { return ytcenter.language.getLocale(key); }
                }
              };
              help.setAttribute("title", ytcenter.utils.replaceTextAsString(ytcenter.language.getLocale("SETTINGS_HELP_ABOUT"), replace));
              ytcenter.language.addLocaleElement(help, "SETTINGS_HELP_ABOUT", "title", replace);
              title.appendChild(help);
            }
          } else {
            title.className = "ytcenter-downloadmenu-unknown";
            title.textContent = ytcenter.language.getLocale("UNKNOWN");
            ytcenter.language.addLocaleElement(title, "UNKNOWN", "@textContent");
          }
          //stream_groups[key] = stream_groups[key].streams; // Just lazy...
          menu.appendChild(title);
          
          for (var i = 0; i < stream_groups[key].streams.length; i++) {
            var is3D = (stream_groups[key].streams[i].stereo3d && stream_groups[key].streams[i].stereo3d == 1 ? true : false);
            var item = document.createElement("a");
            if (!stream_groups[key].streams[i].url) {
              item.style.color = "#A7A7A7";
              item.style.display = "block";
              item.style.margin = "0";
              item.style.padding = "6px 20px";
              item.style.textDecoration = "none";
              item.style.whiteSpace = "nowrap";
              item.style.wordWrap = "normal";
            } else {
              item.className = "yt-uix-button-menu-item";
              item.setAttribute("target", "_blank");
              item.setAttribute("download", ytcenter.video.getFilename(stream_groups[key].streams[i]) + ytcenter.video.getFilenameExtension(stream_groups[key].streams[i]));
              item.href = ytcenter.video.downloadLink(stream_groups[key].streams[i]);
              var downloadStreamListener = (function(_stream){
                return function(e){
                  if (!ytcenter.settings.downloadAsLinks) {
                    ytcenter.video.download(_stream.itag);
                    e.preventDefault();
                  }
                };
              })(stream_groups[key].streams[i]);
              item.addEventListener("click", downloadStreamListener, false);
              ytcenter.events.addEvent("ui-refresh", (function(__stream, item, _downloadStreamListener){
                return function(){
                  item.href = ytcenter.video.downloadLink(__stream);
                  item.setAttribute("download", ytcenter.video.getFilename(__stream) + ytcenter.video.getFilenameExtension(__stream));
                };
              })(stream_groups[key].streams[i], item, downloadStreamListener));
            }
            
            var stream_name = {
              highres: ytcenter.language.getLocale("HIGHRES"),
              hd1440: ytcenter.language.getLocale("HD1440"),
              hd1080: ytcenter.language.getLocale("HD1080"),
              hd720: ytcenter.language.getLocale("HD720"),
              large: ytcenter.language.getLocale("LARGE"),
              medium: ytcenter.language.getLocale("MEDIUM"),
              small: ytcenter.language.getLocale("SMALL")
            }[stream_groups[key].streams[i].quality];
            var _t = document.createElement("table"), _tb = document.createElement("tbody"), _tr = document.createElement("tr"),  _td = document.createElement("td"), _td2 = document.createElement("td");
            _t.style.width = "100%";
            _t.style.border = "0";
            _t.style.margin = "0";
            _t.style.padding = "0";
            
            if (stream_groups[key].streams[i].bitrate) {
              _td.textContent = Math.round(parseInt(stream_groups[key].streams[i].bitrate)/1000) + " Kbps";
            } else {
              _td.textContent = stream_name + ", " + (stream_groups[key].streams[i].dimension ? stream_groups[key].streams[i].dimension.split("x")[1] : "") + "p (" + (stream_groups[key].streams[i].dimension ? stream_groups[key].streams[i].dimension : "") + ")";
              _td2.textContent = (is3D ? "&nbsp;3D" : "");
            }
            
            _tr.appendChild(_td);
            _tr.appendChild(_td2);
            _tb.appendChild(_tr);
            _t.appendChild(_tb);
            
            item.appendChild(_t);
            
            ytcenter.events.addEvent("ui-refresh", (function(stream, _is3D, _td, _td2){
              return function(){
                var stream_name = {
                  highres: ytcenter.language.getLocale("HIGHRES"),
                  hd1440: ytcenter.language.getLocale("HD1440"),
                  hd1080: ytcenter.language.getLocale("HD1080"),
                  hd720: ytcenter.language.getLocale("HD720"),
                  large: ytcenter.language.getLocale("LARGE"),
                  medium: ytcenter.language.getLocale("MEDIUM"),
                  small: ytcenter.language.getLocale("SMALL")
                }[stream.quality];
                if (stream.bitrate) {
                  _td.textContent = Math.round(parseInt(stream.bitrate)/1000) + " Kbps";
                } else {
                  _td.textContent = stream_name + ", " + (stream.dimension ? stream.dimension.split("x")[1] : "") + "p (" + (stream.dimension ? stream.dimension : "") + ")";
                  _td2.textContent = (_is3D ? "&nbsp;3D" : "");
                }
              };
            })(stream_groups[key].streams[i], is3D, _td, _td2));
            var li = document.createElement("li");
            li.className = "ytcenter-downloadmenu-" + (stream_groups[key].key === "UNKNOWN" ? "unknown" : stream_groups[key].key) + (is3D ? " ytcenter-menu-item-3d" : "");
            li.setAttribute("role", "menuitem");
            li.appendChild(item);
            menu.appendChild(li);
          }
        }
      }
      var mp3title = document.createElement("li");
      mp3title.className = (ytcenter.settings.mp3Services == '' ? "hid" : "");
      if (ytcenter.settings.mp3Services === '') {
        mp3title.style.display = "none";
      }
      mp3title.style.color = "#666";
      mp3title.style.fontSize = "0.9166em";
      mp3title.style.paddingLeft = "9px";
      mp3title.textContent = ytcenter.language.getLocale("BUTTON_DOWNLOAD_MENU_MP3SERVICES");
      ytcenter.language.addLocaleElement(mp3title, "BUTTON_DOWNLOAD_MENU_MP3SERVICES", "@textContent");
      ytcenter.events.addEvent("ui-refresh", function(){
        if (ytcenter.settings.mp3Services === '') {
          ytcenter.utils.addClass(mp3title, 'hid');
          mp3title.style.display = "none";
        } else {
          ytcenter.utils.removeClass(mp3title, 'hid');
          mp3title.style.display = "";
        }
      });
      menu.appendChild(mp3title);
      var hasMP3Service = function(value){
        var a = ytcenter.settings.mp3Services.split("&");
        for (var i = 0; i < a.length; i++) {
          if (decodeURIComponent(a[i]) === value) {
            return true;
          }
        }
        return false;
      };
      var removeNonExistentMP3Services = function(){
        var newArr = [];
        var a = ytcenter.settings.mp3Services.split("&");
        for (var i = 0; i < a.length; i++) {
          for (var j = 0; j < ytcenter.mp3services.length; j++) {
            if (ytcenter.mp3services[j].value === decodeURIComponent(a[i])) {
              newArr.push(a[i]);
              break;
            }
          }
        }
        ytcenter.settings.mp3Services = newArr.join("&");
      };
      removeNonExistentMP3Services();
      
      for (var i = 0; i < ytcenter.mp3services.length; i++) {
        var li = document.createElement("li");
        var item = document.createElement("a");
        item.className = "yt-uix-button-menu-item";
        li.setAttribute("role", "menuitem");
        li.className = "ytcenter-downloadmenu-MP3" + (hasMP3Service(ytcenter.mp3services[i].value) ? "" : " hid");
        if (!hasMP3Service(ytcenter.mp3services[i].value)) {
          li.style.display = "none";
        }
        item.setAttribute("href", ytcenter.utils.replaceTextAsString(ytcenter.mp3services[i].value, {
          title: ytcenter.video.title,
          videoid: ytcenter.video.id,
          author: ytcenter.video.author,
          url: loc.href
        }));
        item.setAttribute("target", "_blank");
        var mp3RedirectListener = (function(mp3){
          return function(e){
            if (!ytcenter.settings.downloadAsLinks) {
              ytcenter.redirect(mp3.value, true);
              e.preventDefault();
              return false;
            }
          };
        })(ytcenter.mp3services[i]);
        item.addEventListener("click", mp3RedirectListener, false);
        ytcenter.events.addEvent("ui-refresh", (function(mp3, li){
          return function(){
            var a = ytcenter.settings.mp3Services.split("&");
            var f = false;
            for (var i = 0; i < a.length; i++) {
              if (decodeURIComponent(a[i]) === mp3.value) {
                f = true;
                break;
              }
            }
            if (f) {
              ytcenter.utils.removeClass(li, 'hid');
              li.style.display = "";
            } else {
              ytcenter.utils.addClass(li, 'hid');
              li.style.display = "none";
            }
          };
        })(ytcenter.mp3services[i], li));
        
        item.textContent = ytcenter.language.getLocale(ytcenter.mp3services[i].label);
        ytcenter.language.addLocaleElement(item, ytcenter.mp3services[i].label, "@textContent");
        li.appendChild(item);
        menu.appendChild(li);
      }
      
      
      btn2.appendChild(menu);
      g.appendChild(btn2);
      
      ytcenter.placementsystem.registerElement(g, "@downloadgroup");
    }
    function $CreateSettingsUI() {
      var appbar = document.getElementById("appbar-settings-menu"),
          liSettings = document.createElement("li"),
          spanText = document.createElement("span"),
          textIconContainer = document.createElement("span"),
          textIcon = document.createElement("img"),
          text = null;
      
      if (ytcenter.settings['experimentalFeatureTopGuide'] && appbar) {
        liSettings.setAttribute("id", "ytcenter-settings-toggler");
        liSettings.setAttribute("role", "menuitem");
        liSettings.className = "yt-uix-button-menu-new-section-separator";
        
        spanText.className = "yt-uix-button-menu-item upload-menu-item";
        ytcenter.utils.addEventListener(spanText, "click", function(){
          if (!ytcenter.settingsPanelDialog) ytcenter.settingsPanelDialog = ytcenter.settingsPanel.createDialog();
          ytcenter.settingsPanelDialog.setVisibility(true);
        }, false);
        
        textIconContainer.className = "yt-valign icon-container";
        
        textIcon.className = "upload-menu-account-settings-icon yt-valign-container";
        textIcon.setAttribute("src", "//s.ytimg.com/yts/img/pixel-vfl3z5WfW.gif");
        textIconContainer.appendChild(textIcon);
        
        text = document.createTextNode(ytcenter.language.getLocale("BUTTON_SETTINGS_LABEL"));
        ytcenter.language.addLocaleElement(text, "BUTTON_SETTINGS_LABEL", "@textContent");
        
        spanText.appendChild(textIconContainer);
        spanText.appendChild(text);
        
        liSettings.appendChild(spanText);
        appbar.appendChild(liSettings);
      } else {
        var btn = document.createElement("button");
        btn.id = "masthead-user-button";
        if (document.getElementById("masthead-gaia-photo-expander")) {
          btn.style.marginTop = "3px";
        } else if (document.getElementById("masthead-user-expander")) {
          btn.style.verticalAlign = "middle";
        }
        btn.title = ytcenter.language.getLocale("BUTTON_SETTINGS_TITLE");
        ytcenter.language.addLocaleElement(btn, "BUTTON_SETTINGS_TITLE", "title");
        btn.setAttribute("type", "button");
        btn.setAttribute("role", "button");
        btn.setAttribute("onclick", ";return false;");
        btn.className = "yt-uix-tooltip-reverse yt-uix-button " + (ytcenter.watch7 ? "yt-uix-button-text" : "yt-uix-button-text") + " yt-uix-tooltip";
        var btnt = document.createElement("span");
        btnt.className = "yt-uix-button-icon-wrapper";
        btnt.style.margin = "0px";
        var gearicon = document.createElement("img");
        gearicon.src = ytcenter.icon.gear;
        gearicon.setAttribute("alt", "");
        gearicon.style.marginLeft = "3px";
        
        var ytvt = document.createElement("span");
        ytvt.className = "yt-valign-trick";
        
        btnt.appendChild(gearicon);
        btnt.appendChild(ytvt);
        btn.appendChild(btnt);
        
        var ytuixbc = document.createElement("span");
        ytuixbc.className = "yt-uix-button-content";
        ytuixbc.textContent = "  ";
        
        btn.appendChild(ytuixbc);
        
        btn.addEventListener("click", function(){
          if (!ytcenter.settingsPanelDialog) ytcenter.settingsPanelDialog = ytcenter.settingsPanel.createDialog();
          ytcenter.settingsPanelDialog.setVisibility(true);
        }, false);
        if (document.getElementById("masthead-user")) {
          document.getElementById("masthead-user").appendChild(btn);
        } else if (document.getElementById("yt-masthead-user")) {
          document.getElementById("yt-masthead-user").appendChild(btn);
        } else if (document.getElementById("yt-masthead-signin")) {
          btn.style.margin = "0 10px";
          document.getElementById("yt-masthead-signin").appendChild(btn);
        } else {
          con.error("Settings UI - Couldn't add settings button");
        }
      }
    }
    
    function $CloneArray(arr) {
      var copy = [];
      for (var i = 0; i < arr.length; i++) {
        copy[i] = arr[i];
      }
      return copy;
    }
    
    function $Clone(obj) {
      var copy;
      if (null == obj || typeof obj != "object") {
        return obj;
      }
      if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
      }
      if (obj instanceof Array) {
        copy = [];
        for (var i = 0; i < obj.length; i++) {
          copy[i] = $Clone(obj[i]);
        }
        return copy;
      }
      if (obj instanceof Object) {
        copy = {};
        for (var key in obj) {
          if (obj.hasOwnProperty(key)) {
            copy[key] = $Clone(obj[key]);
          }
        }
        return copy;
      }
      return null;
    }
    
    function $ArrayIndexOf(arr, obj) {
      for (var i = 0; i < arr.length; i++) {
        if (arr[i] === obj) return i;
      }
      return -1;
    }
    
    function $SlideRange(elm, handle, min, max, defaultValue) {
      function mousemove(e){
        if (range.mouse.down) {
          var pos = e.clientX - $AbsoluteOffset(range.elm)[0] - range.handle.offsetWidth/2;
          var max = range.elm.clientWidth - range.handle.offsetWidth;
          if (pos > max) {
            pos = max;
          } else if (pos < 0) {
            pos = 0;
          }
          range.handle.style.left = pos + "px";
          
          for (var i = 0; i < range.listeners.length; i++) {
            if (range.listeners[i].e === 'valuechange') {
              var max = range.elm.clientWidth - range.handle.offsetWidth;
              var a = range.max - range.min;
              range.listeners[i].c(parseFloat(range.handle.style.left)/max*a+range.min);
            }
          }
          e.preventDefault();
        }
      }
      var range = {
        elm: elm,
        handle: handle,
        min: (min ? min : 0),
        max: (max ? max : 100),
        defaultValue: (defaultValue ? defaultValue : min),
        mouse: {
          down: false
        },
        listeners: [],
        width: 240,
        height: 15
      }, throttleFunc = null;
      range.elm.style.marginTop = "-4px";
      range.elm.style.width = range.width + "px";
      range.elm.style.height = range.height + "px";
      range.handle.style.width = range.height + "px";
      range.handle.style.height = range.height + "px";
      
      var returnKit = {
        addEventListener: (function(range){
          return function(event, callback){
            range.listeners.push({
              e: event,
              c: callback
            });
          };
        })(range),
        getValue: (function(range){
          return function(){
            var max = parseInt(range.elm.style.width) - (range.height + 2);
            var a = range.max - range.min;
            return parseFloat(range.handle.style.left)/max*a+range.min || range.defaultValue;
          };
        })(range),
        setValue: (function(range){
          return function(val){
            var max = parseInt(range.elm.style.width) - (range.height + 2);
            var pos = (val - range.min)/(range.max - range.min)*max;
            
            if (pos > max) {
              pos = max;
            } else if (pos < 0) {
              pos = 0;
            }
            range.handle.style.left = pos + "px";
            if (val == 0) {
              return 0;
            } else {
              return returnKit.getValue();
            }
          };
        })(range)
      };
      
      returnKit.setValue(range.defaultValue);
      
      elm.addEventListener("click", function(e){
        var a;
        var pos = e.clientX - $AbsoluteOffset(range.elm)[0] - range.handle.offsetWidth/2;
        var max = range.elm.clientWidth - range.handle.offsetWidth;
        if (pos > max) {
          pos = max;
        } else if (pos < 0) {
          pos = 0;
        }
        range.handle.style.left = pos + "px";
        
        for (var i = 0; i < range.listeners.length; i++) {
          if (range.listeners[i].e === 'valuechange') {
            max = range.elm.clientWidth - range.handle.offsetWidth;
            a = range.max - range.min;
            range.listeners[i].c(parseFloat(range.handle.style.left)/max*a+range.min);
          } else if (range.listeners[i].e === 'change') {
            max = range.elm.clientWidth - range.handle.offsetWidth;
            a = range.max - range.min;
            range.listeners[i].c(parseFloat(range.handle.style.left)/max*a+range.min);
          }
        }
        e.preventDefault();
      }, false);
      ytcenter.utils.addEventListener(elm, "mousedown", function(e){
        range.mouse.down = true;
        throttleFunc = ytcenter.utils.throttle(mousemove, 50);
        ytcenter.utils.addEventListener(document, "mousemove", throttleFunc, false);
        e.preventDefault();
      }, false);
      ytcenter.utils.addEventListener(document, "mouseup", function(e){
        if (range.mouse.down) {
          range.mouse.down = false;
          e.stopPropagation();
          for (var i = 0; i < range.listeners.length; i++) {
            if (range.listeners[i].e === 'change') {
              var max = range.elm.clientWidth - range.handle.offsetWidth;
              var a = range.max - range.min;
              range.listeners[i].c(parseFloat(range.handle.style.left)/max*a+range.min);
            }
          }
          if (throttleFunc) ytcenter.utils.removeEventListener(document, "mousemove", throttleFunc, false);
          e.preventDefault();
        }
      }, false);
      
      return returnKit;
    }
    
    function $DragList(elements, ignore) {
      function mousemove(e) {
        if (!dragging || disabled) return;
        e.preventDefault();
        
        var newX = e.pageX;
        var newY = e.pageY;
        var scrollOffset = ytcenter.utils.getScrollOffset();
        holderElement.style.top = (e.pageY - scrollOffset.top - curRelative[1]) + "px";
        holderElement.style.left = (e.pageX - scrollOffset.left - curRelative[0]) + "px";
        
        var p = lastLegalRegion;
        for (var i = 0; i < allowedRegions.length; i++) {
          var off = $AbsoluteOffset(allowedRegions[i]);
          if (newX >= off[0] && newX <= off[0] + allowedRegions[i].offsetWidth && (newY >= off[1] && newY <= off[1] + allowedRegions[i].offsetHeight)) {
            p = allowedRegions[i];
            break;
          }
        }
        
        var c = p.children;
        var item = null;
        for (var i = 0; i < c.length; i++) {
          if (c[i] == et || c[i] == holderElement || doIgnore(c[i])) continue;
          if (newX <= c[i].offsetWidth/2+$AbsoluteOffset(c[i])[0]) {
            item = c[i];
            break;
          }
        }
        
        var hep = et.parentNode;
        if (lastItem != item || p != lastLegalRegion) {
          hep.removeChild(et);
          if (item == null) {
            p.appendChild(et);
          } else {
            p.insertBefore(et, item);
          }
          if (listeners['move']) {
            for (var i = 0; i < listeners['move'].length; i++) {
              listeners['move'][i](et, holderElement, lastLegalRegion);
            }
          }
        }
        lastItem = item;
        lastLegalRegion = p;
        if (listeners['mousemove']) {
          for (var i = 0; i < listeners['mousemove'].length; i++) {
            listeners['mousemove'][i](et, holderElement, lastLegalRegion);
          }
        }
        
        if (e && e.preventDefault) {
          e.preventDefault();
        } else {
          window.event.returnValue = false;
        }
        return false;
      }
      con.log("$DragList called...");
      var dragging = false;
      var holderElement;
      var secureHeightElement = [];
      var defaultVisibility = "";
      var et;
      var disabled = true;
      var lastLegalRegion;
      var lastItem;
      var allowedRegions = elements;
      var curRelative;
      var disabler;
      var throttleFunc = null;
      
      var listeners = {};
      
      var doIgnore = function(elm) {
        if (elm == null) return true;
        if (ignore != null) {
          for (var i = 0; i < ignore.length; i++) {
            if (elm == ignore[i])
              return true;
          }
        }
        return false;
      };
      
      ytcenter.utils.addEventListener(document, "mousedown", function(e){
        if (disabled || e.button != 0) return;
        var pass = false;
        var reg;
        var etp = e.target;
        while (!pass && etp != null) {
          for (var i = 0; i < allowedRegions.length; i++) {
            if (etp.parentNode == allowedRegions[i]) {
              pass = true;
              reg = allowedRegions[i];
              et = etp;
              break;
            }
          }
          etp = etp.parentNode;
        }
        if (!pass || doIgnore(et)) return;
        e.preventDefault();
        disabler = document.createElement("div");
        disabler.style.position = "fixed";
        disabler.style.top = "0px";
        disabler.style.left = "0px";
        disabler.style.width = "100%";
        disabler.style.height = "100%";
        disabler.style.border = "0px";
        disabler.style.margin = "0px";
        disabler.style.padding = "0px";
        disabler.style.zIndex = "9999998";
        document.body.appendChild(disabler);
        
        dragging = true;
        
        lastLegalRegion = reg;
        
        var os = $AbsoluteOffset(et);
        os[0] = (os[0] - window.pageXOffset);
        os[1] = (os[1] - window.pageYOffset);
        var scrollOffset = ytcenter.utils.getScrollOffset();
        curRelative = [e.pageX - scrollOffset.left - os[0], e.pageY - scrollOffset.top - os[1]];
        holderElement = et.cloneNode(true);
        holderElement.style.position = "fixed";
        holderElement.style.top = os[1] + "px";
        holderElement.style.left = os[0] + "px";
        holderElement.style.zIndex = "9999999";
        var het = holderElement;
        var hetr;
        hetr = function(het){
          het.title = "";
          het.setAttribute("data-button-action", "");
          het.setAttribute("data-tooltip-text", "");
          ytcenter.utils.removeClass(het, "yt-uix-tooltip");
          for (var i = 0; i < het.children.length; i++) {
            hetr(het.children[i]);
          }
        };
        hetr(het);
        
        
        
        defaultVisibility = et.style.visibility || "";
        et.style.visibility = "hidden";
        
        et.parentNode.insertBefore(holderElement, et);
        
        if (listeners['drag']) {
          for (var i = 0; i < listeners['drag'].length; i++) {
            listeners['drag'][i](et, holderElement, lastLegalRegion);
          }
        }
        throttleFunc = ytcenter.utils.throttle(mousemove, 50);
        ytcenter.utils.addEventListener(document, "mousemove", throttleFunc, false);
        
        if (e && e.preventDefault) {
          e.preventDefault();
        } else {
          window.event.returnValue = false;
        }
        return false;
      }, false);
      ytcenter.utils.addEventListener(document, "mouseup", function(e){
        if (!dragging) return;
        e.preventDefault();
        dragging = false;
        
        et.style.visibility = defaultVisibility;
        
        if (holderElement != null && holderElement.parentNode != null) {
          holderElement.parentNode.removeChild(holderElement);
        }
        holderElement = null;
        if (disabler != null && disabler.parentNode != null) {
          disabler.parentNode.removeChild(disabler);
        }
        disabler = null;
        
        if (listeners['drop']) {
          for (var i = 0; i < listeners['drop'].length; i++) {
            listeners['drop'][i](et, lastLegalRegion);
          }
        }
        if (throttleFunc) ytcenter.utils.removeEventListener(document, "mousemove", throttleFunc, false);
        
        if (e && e.preventDefault) {
          e.preventDefault();
        } else {
          window.event.returnValue = false;
        }
        return false;
      }, false);
      return {
        setEnable: function(enable){
          disabled = enable ? false : true;
          return disabled;
        },
        isEnabled: function(){
          return disabled ? false : true;
        },
        addAllowedRegion: function(elm){
          for (var i = 0; i < allowedRegions.length; i++) {
            if (allowedRegions[i] == elm) return;
          }
          allowedRegions.push(elm);
        },
        removeAllowedRegion: function(elm){
          for (var i = 0; i < allowedRegions.length; i++) {
            if (allowedRegions[i] != elm) continue;
            allowedRegions.splice(i, 1);
            break;
          }
        },
        addEventListener: function(event, callback){
          if (!listeners[event]) {
            listeners[event] = [];
          }
          listeners[event].push(callback);
        }
      };
    }
    
    function $AbsoluteOffset(elm) {
      var pos = [elm.offsetLeft || 0, elm.offsetTop || 0];
      if (elm.offsetParent) {
        var ao = $AbsoluteOffset(elm.offsetParent);
        pos[0] += ao[0];
        pos[1] += ao[1];
      }
      
      return pos;
    }
    
    function $XMLHTTPRequest(details) {
      if (injected) {
        if (!window.ytcenter || !window.ytcenter.xhr) {
          //window.ytcenter = ytcenter.unsafe || {};
          window.ytcenter.xhr = window.ytcenter.xhr || {};
          window.ytcenter.xhr.onload = ytcenter.utils.bind(function(id, _args){
            if (ytcenter.callback_db[id].onload)
              ytcenter.callback_db[id].onload(_args);
          }, window.ytcenter.xhr);
          window.ytcenter.xhr.onerror = ytcenter.utils.bind(function(id, _args){
            if (ytcenter.callback_db[id].onerror)
              ytcenter.callback_db[id].onerror(_args);
          }, window.ytcenter.xhr);
          window.ytcenter.xhr.onreadystatechange = ytcenter.utils.bind(function(id, _args){
            if (ytcenter.callback_db[id].onreadystatechange)
              ytcenter.callback_db[id].onreadystatechange(_args);
          }, window.ytcenter.xhr);
        }
        var id = ytcenter.callback_db.push({
          onload: details.onload,
          onerror: details.onerror,
          onreadystatechange: details.onreadystatechange
        }) - 1;
        window.postMessage(JSON.stringify({
          id: id,
          method: "CrossOriginXHR",
          arguments: [details]
        }), "*");
      } else {
        if (identifier === 3) { // Firefox Extension
          var entry = {};
          if (details.onreadystatechange) {
            entry.onreadystatechange = details.onreadystatechange;
            details.onreadystatechange = true;
          } else {
            details.onreadystatechange = false;
          }
          if (details.onload) {
            entry.onload = details.onload;
            details.onload = true;
          } else {
            details.onload = false;
          }
          if (details.onerror) {
            entry.onerror = details.onerror;
            details.onerror = true;
          } else {
            details.onerror = false;
          }
          var id = ytcenter.callback_db.push(entry) - 1;
          self.port.emit("xhr", JSON.stringify({
            id: id,
            details: details
          }));
        } else if (identifier === 4) { // Safari Extension
          var entry = {};
          if (details.onreadystatechange) {
            entry.onreadystatechange = details.onreadystatechange;
            details.onreadystatechange = true;
          } else {
            details.onreadystatechange = false;
          }
          if (details.onload) {
            entry.onload = details.onload;
            details.onload = true;
          } else {
            details.onload = false;
          }
          if (details.onerror) {
            entry.onerror = details.onerror;
            details.onerror = true;
          } else {
            details.onerror = false;
          }
          var id = ytcenter.callback_db.push(entry) - 1;
          safari.self.tab.dispatchMessage("xhr", JSON.stringify({
            id: id,
            details: details
          }));
        } else if (identifier === 5) { // Opera Legacy Extension
          var entry = {};
          if (details.onreadystatechange) {
            entry.onreadystatechange = details.onreadystatechange;
            details.onreadystatechange = true;
          } else {
            details.onreadystatechange = false;
          }
          if (details.onload) {
            entry.onload = details.onload;
            details.onload = true;
          } else {
            details.onload = false;
          }
          if (details.onerror) {
            entry.onerror = details.onerror;
            details.onerror = true;
          } else {
            details.onerror = false;
          }
          var id = ytcenter.callback_db.push(entry) - 1;
          opera.extension.postMessage({
            action: 'xhr',
            id: id,
            details: details
          });
        } else if (identifier === 6) {
          request(details);
        } else if (typeof GM_xmlhttpRequest !== "undefined") {
          GM_xmlhttpRequest(details);
          return true;
        } else {
          var xmlhttp;
          if (typeof XMLHttpRequest !== "undefined") {
            xmlhttp = new XMLHttpRequest();
          } else if (typeof opera !== "undefined" && typeof opera.XMLHttpRequest !== "undefined") {
            xmlhttp = new opera.XMLHttpRequest();
          } else if (typeof uw !== "undefined" && typeof uw.XMLHttpRequest !== "undefined") {
            xmlhttp = new uw.XMLHttpRequest();
          } else {
            if (details["onerror"]) {
              details["onerror"]();
            }
            return false;
          }
          xmlhttp.onreadystatechange = function(){
            var responseState = {
              responseXML:(xmlhttp.readyState == 4 ? xmlhttp.responseXML : ''),
              responseText:(xmlhttp.readyState == 4 ? xmlhttp.responseText : ''),
              readyState:xmlhttp.readyState,
              responseHeaders:(xmlhttp.readyState == 4 ? xmlhttp.getAllResponseHeaders() : ''),
              status:(xmlhttp.readyState == 4 ? xmlhttp.status : 0),
              statusText:(xmlhttp.readyState == 4 ? xmlhttp.statusText : '')
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
            if(details["onerror"]) {
              details["onerror"]({responseXML:'',responseText:'',readyState:4,responseHeaders:'',status:403,statusText:'Forbidden'});
            }
            return false;
          }
          if (details.headers) {
            for (var prop in details.headers) {
              xmlhttp.setRequestHeader(prop, details.headers[prop]);
            }
          }
          xmlhttp.send((typeof(details.data) != 'undefined') ? details.data : null);
          return true
        }
        return false;
      }
    }
    
    function $AddStyle(styles) {
      if(typeof GM_addStyle !== "undefined") {
        GM_addStyle(styles);
      } else {
        var oStyle = document.createElement("style");
        oStyle.setAttribute("type", "text\/css");
        oStyle.appendChild(document.createTextNode(styles));
        if (document && document.head) {
          document.head.appendChild(oStyle);
        } else if (document && document.body) {
          document.body.appendChild(oStyle);
        } else if (document && document.documentElement) {
          document.documentElement.appendChild(oStyle);
        } else if (document) {
          document.appendChild(oStyle);
        } else {
          con.error("Failed to add style!");
        }
      }
    }
    /* END UTILS */
    
    /* Classes */
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
    function PlayerConfig(configSetter, configGetter) {
      defineLockedProperty(this, "config", function(value){
        con.log("[PlayerConfig] Setting config!", value);
        configSetter(value);
      }, function(){
        con.log("[PlayerConfig] Getting config!");
        return configGetter();
      });
    }
    
    var console_debug = devbuild; // Disable this to stop YouTube Center from writing in the console log.
    var _console = [];
    
    var uw, loc, con, ytcenter = {}, yt = {};
    
    uw = (function(){
      var a;
      try {
        a = unsafeWindow === window ? false : unsafeWindow;
      } catch (e) {
      } finally {
        return a || (function(){
          try {
            var e = document.createElement('p');
            e.setAttribute('onclick', 'return window;');
            return e.onclick();
          } catch (e) {
            return window;
          }
        }());
      }
    })();
    
    ytcenter.utils = {};
    ytcenter.utils.ie = (function(){
      for (var v = 3, el = document.createElement('b'), all = el.all || []; el.innerHTML = '<!--[if gt IE ' + (++v) + ']><i><![endif]-->', all[0];);
      return v > 4 ? v : !!document.documentMode;
    }());
    
    
    ytcenter.spfPackages = function(originalPackages){
      function parse(data) {
        if (ytcenter.utils.isArray(data)) {
          var i, type;
          for (i = 0; i < data.length; i++) {
            type = parseType(data[i]);
            addType(type, data[i]);
          }
        } else {
          if (data.type && !multipart) {
            multipart = true;
            parse(data.parts);
          } else {
            addType(parseType(data), data);
          }
        }
      }
      function addType(type, data) {
        var _types = type.split(","), i, index = packages.push(ytcenter.spfData(data)) - 1;
        for (i = 0; i < _types.length; i++) {
          if (!hasType(_types[i])) {
            types.push(_types[i]);
          }
          if (!pointer[_types[i]]) pointer[_types[i]] = [];
          pointer[_types[i]].push(index);
        }
      }
      function parseType(data) {
        var type = [];
        if ((data.swfcfg) ||
            (data.html && data.html.content && data.html.content.indexOf("<script>var ytplayer = ytplayer || {};ytplayer.config = ") !== -1) ||
            (data.html && data.html.player && data.html.player && data.html.player.indexOf("<script>var ytplayer = ytplayer || {};ytplayer.config = ") !== -1) ||
            (data.html && data.html.content && data.html.content.indexOf("data-swf-config=\"") !== -1))
          type.push("player");
        if (data.attr && data.html && data.js)
          type.push("page");
        if (data.css && data.js)
          type.push("header");
          
        if (type.length === 0) {
          con.log("[SPF] Received unknown package!", type, data);
          return "unknown";
        }
        return type.join(",");
      }
      function getPackage(type) {
        if (!pointer[type] || !packages[pointer[type][0]]) return null;
        return packages[pointer[type][0]].getData();
      }
      function getData(type) {
        if (!pointer[type] || !packages[pointer[type][0]]) return null;
        return packages[pointer[type][0]];
      }
      function getAvailableTypes() {
        return types;
      }
      function getOriginalPackages() {
        return originalPackages;
      }
      function getPackages(type) {
        var i, arr = [];
        
        if (type) {
          if (!pointer[type]) return null;
          for (i = 0; i < pointer[type].length; i++) {
            arr.push(packages[pointer[type][i]].getData());
          }
          if (multipart) {
            var _o = ytcenter.utils.clone(originalPackages);
            _o.parts = arr;
            return _o;
          } else {
            return arr;
          }
        } else {
          for (i = 0; i < packages.length; i++) {
            arr.push(packages[i].getData());
          }
          
          if (multipart) {
            var _o = ytcenter.utils.clone(originalPackages);
            _o.parts = arr;
            return _o;
          } else {
            if (arr.length === 1)
              return arr[0];
            return arr;
          }
        }
      }
      function getTitle() {
        var i, title = null;
        for (i = 0; i < packages.length; i++) {
          title = packages[i].getTitle();
          if (title) return title;
        }
        return title;
      }
      function setTitle(title) {
        var i;
        for (i = 0; i < packages.length; i++) {
          if (packages[i].getTitle())
            packages[i].setTitle(title);
        }
      }
      function hasType(type) {
        var i;
        for (i = 0; i < types.length; i++) {
          if (types[i] === type)
            return true;
        }
        return false;
      }
      var types = [], pointer = {} /* { player: [2, 3], page: [3] } */, packages = [], multipart = false;
      
      parse(originalPackages);
      
      return {
        getData: getData,
        getAvailableTypes: getAvailableTypes,
        hasType: hasType,
        getPackages: getPackages,
        getOriginalPackages: getOriginalPackages,
        getTitle: getTitle,
        setTitle: setTitle
      };
    };
    ytcenter.spfData = function(originalPackage){
      function parse(rawData) {
        parsePlayerConfig(rawData);
      }
      
      function parsePlayerConfigType(content) {
        content = content.split("<script>var ytplayer = ytplayer || {};ytplayer.config = ")[1];
        content = content.split(";</script>")[0];
        return JSON.parse(content);
      }
      
      function parsePlayerConfig(d) {
        if (!d) return;
        if (d.swfcfg) {
          playerConfig = d.swfcfg;
        } else if (d.html && d.html.content && d.html.content.indexOf("<script>var ytplayer = ytplayer || {};ytplayer.config = ") !== -1) {
          playerConfig = parsePlayerConfigType(d.html.content);
        } else if (d.html && d.html.player && d.html.player && d.html.player.indexOf("<script>var ytplayer = ytplayer || {};ytplayer.config = ") !== -1) {
          playerConfig = parsePlayerConfigType(d.html.player);
        } else if (d.html && d.html.content && d.html.content.indexOf("data-swf-config=\"") !== -1) {
          var a = d.html.content.split("data-swf-config=\""), i1, i2;
          if (a && a.length > 1) {
            a = a[1];
            if (a.indexOf("\">") !== -1) {
              a = a.split("\">");
              if (a && a.length > 1) {
                a = a[0];
              } else {
                a = null;
              }
            } else {
              a = null;
            }
          } else {
            a = null;
          }
          if (a !== null) {
            playerConfig = JSON.parse(ytcenter.utils.decodeRawTag(a).replace(/&amp;/g, "&").replace(/&quot;/g, "\""));
          }
        }
      }
      
      function injectPlayerConfig(content, config) {
        return ytcenter.utils.replaceContent(content, config, "<script>var ytplayer = ytplayer || {};ytplayer.config = ", ";</script>");
      }
      
      function injectDataPlayerConfig(d, config) {
        if (d.swfcfg) {
          d.swfcfg = config;
        } else if (d.html && d.html.content && d.html.content.indexOf("<script>var ytplayer = ytplayer || {};ytplayer.config = ") !== -1) {
          d.html.content = injectPlayerConfig(d.html.content, config);
        } else if (d.html && d.html.player && d.html.player && d.html.player.indexOf("<script>var ytplayer = ytplayer || {};ytplayer.config = ") !== -1) {
          d.html.player = injectPlayerConfig(d.html.player, config);
        } else if (d.html && d.html.content && d.html.content.indexOf("data-swf-config=\"") !== -1) {
          var i1, i2;
          i1 = d.html.content.indexOf("data-swf-config=\"")
              + "data-swf-config=\"".length;
          i2 = d.html.content.indexOf("data-swf-config=\"")
              + d.html.content.split("data-swf-config=\"")[1].indexOf("\">") + "data-swf-config=\"".length;
          d.html.content = d.html.content.substring(0, i1)
              + ytcenter.utils.encodeRawTag(JSON.stringify(config).replace(/&/g, "&amp;").replace(/"/g, "&quot;"))
              + d.html.content.substring(i2);
        } else {
          con.log("[SPF] Tried to set the player configuration for a package with no player config!");
        }
      }
      
      function setHTML(id, value) {
        if (!data.html) data.html = {};
        data.html[id] = value;
      }
      function getHTML(id) {
        if (!data.html) return null;
        return data.html[id];
      }
      function setAttribute(id, attr, value) {
        try {
          if (!data.attr)
            data.attr = {};
          if (typeof data.attr[id] === "undefined")
            data.attr[id] = {};
        } catch (e) {
          con.error(e);
          var _tmp = {};
          _tmp[id] = {};
          data.attr = _tmp;
        }
        try {
          data.attr[id][attr] = value;
        } catch (e) {
          con.error(e);
        }
      }
      function getAttribute(id, attr) {
        if (!data) return null;
        if (!data.attr || !data.attr[id]) return null;
        return data.attr[id][attr];
      }
      function setCSS(value) {
        data.css = value;
      }
      function getCSS() {
        return data.css;
      }
      function setJS(value) {
        data.js = value;
      }
      function getJS() {
        return data.js;
      }
      function getPlayerConfig() {
        return playerConfig;
      }
      function setPlayerConfig(config) {
        playerConfig = config;
        injectDataPlayerConfig(data, config);
      }
      function hasPlayerConfig() {
        return !!playerConfig;
      }
      function getTitle() {
        return data.title;
      }
      function setTitle(title) {
        data.title = title;
      }
      
      function getData() {
        return data;
      }
      function getOriginalPackage() {
        return originalPackage;
      }
      
      var data = ytcenter.utils.clone(originalPackage),
          playerConfig = null;
      
      parse(data);
      
      return {
        setHTML: setHTML,
        getHTML: getHTML,
        setAttribute: setAttribute,
        getAttribute: getAttribute,
        setCSS: setCSS,
        getCSS: getCSS,
        setJS: setJS,
        getJS: getJS,
        getPlayerConfig: getPlayerConfig,
        setPlayerConfig: setPlayerConfig,
        hasPlayerConfig: hasPlayerConfig,
        getData: getData,
        getOriginalPackage: getOriginalPackage,
        getTitle: getTitle,
        setTitle: setTitle
      };
    };
    
    ytcenter.spf = (function(){
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
            return function(){
              try {
                var args = arguments;
                con.log("[SPF] " + event, args);
                
                args = callListenerCallbacks(event, "before", args) || args;
                con.log(args);
                if (_ytconfig[event]) args = _ytconfig[event].apply(uw, args) || args;
                args = callListenerCallbacks(event, "after", args) || args;
              } catch (e) {
                con.error(e);
              }
            };
          })(events[i]);
          
          defineLockedProperty(this, events[i], (function(event){
            return function(func) { _ytconfig[event] = func; };
          })(events[i]), (function(func){
            return function(){ return func; };
          })(configFunctions[events[i]]));
        }
      }
      function transformArguments(args) {
        var a = ytcenter.utils.toArray(args);
        if (a.length > 1) {
          a[1] = ytcenter.spfPackages(a[1]);
        }
        return a;
      }
      function transformArgumentsBack(args) {
        var a = ytcenter.utils.toArray(args);
        if (a.length > 1 && a[1] && a[1].getPackages) {
          a[1] = a[1].getPackages();
        }
        return a;
      }
      function callListenerCallbacks(event, mode, args) {
        if (!listeners[event]) return; // No attached listeners to the specific event.
        var i;
        
        args = transformArguments(args);
        
        for (i = 0; i < listeners[event].length; i++) {
          if (listeners[event][i].mode !== mode) continue; // Needs to be the exact same mode.
          args = listeners[event][i].callback.apply(null, args) || args;
        }
        
        return transformArgumentsBack(args);
      }
      function isConfigEvent(key) {
        var i;
        for (i = 0; i < events.length; i++) {
          if (events[i] === key) return true;
        }
        return false;
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
      defineLockedProperty(uw, "_spf_state", function(s){
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
      uw.ytspf = new SPFEnabled(uw.ytspf);
      
      return {
        addEventListener: function(event, mode, callback){
          event = "navigate-" + event + "-callback";
          if (mode !== "before" && mode !== "after") throw "Unknown mode: " + mode;
          if (!listeners[event]) listeners[event] = [];
          listeners[event].push({mode: mode, callback: callback});
        },
        removeEventListener: function(event, mode, callback){
          event = "navigate-" + event + "-callback";
          if (mode !== "before" && mode !== "after") throw "Unknown mode: " + mode;
          if (!listeners[event]) return;
          var i;
          for (i = 0; i < listeners[event].length; i++) {
            if (listeners[event][i].mode === mode && listeners[event][i].callback === callback) {
              listeners[event].splice(i, 1);
              return;
            }
          }
        },
        disable: function(){
          enabled = false;
          if (uw.spf && uw.spf.dispose) uw.spf.dispose();
        },
        isEnabled: function(){ return enabled; }
      };
    })();
    loc = (function(){
      try {
        if (typeof location !== "undefined") return location;
        if (typeof window !== "undefined" && typeof window.location !== "undefined") return window.location;
        if (typeof uw !== "undefined" && typeof uw.location !== "undefined") return uw.location;
      } catch (e) {}
    })();
    if (loc.href.indexOf("http://apiblog.youtube.com/") === 0 || loc.href.indexOf("https://apiblog.youtube.com/") === 0) return;
    if (typeof console !== "undefined" && typeof console.log !== "undefined") {
      con = {};
      for (var key in console) {
        if (typeof console[key] === "function") {
          con[key] = (function(key){
            return function(){
              try {
                var args = [];
                var _args = [];
                for (var i = 0; i < arguments.length; i++) {
                  args.push(arguments[i]);
                }
                if (key === "error" && args[0]) {
                  var tmp = {args: args.length === 1 ? args[0] : args, type: "error"};
                  if (args[0].message) {
                    tmp['message'] = args[0].message;
                  }
                  if (args[0].stack) {
                    tmp['stack'] = args[0].stack;
                  }
                  _console.push(tmp);
                  if (tmp['stack']) {
                    _args = [args[0].stack];
                  } else if (tmp['message']) {
                    _args = [args[0].message];
                  } else {
                    _args = args;
                  }
                } else {
                  _args = args;
                  _console.push({args: _args.length === 1 ? _args[0] : _args, type: key});
                }
                if (console_debug && console[key].apply) {
                  return console[key].apply(console, args)
                } else if (console_debug) {
                  return console[key](_args[0]);
                }
              } catch (e) {
                console.error(e);
              }
            };
          })(key);
        }
      }
    } else if (typeof uw.console !== "undefined" && typeof uw.console.log !== "undefined") {
      con = {};
      for (var key in uw.console) {
        if (typeof uw.console[key] === "function") {
          con[key] = (function(key){
            return function(){
              try {
                var args = [];
                var _args = [];
                for (var i = 0; i < arguments.length; i++) {
                  args.push(arguments[i]);
                }
                if (key === "error" && args[0]) {
                  var tmp = {args: args.length === 1 ? args[0] : args, type: "error"};
                  if (args[0].message) {
                    tmp['message'] = args[0].message;
                  }
                  if (args[0].stack) {
                    tmp['stack'] = args[0].stack;
                  }
                  _console.push(tmp);
                  if (tmp['stack']) {
                    _args = [args[0].stack];
                  } else if (tmp['message']) {
                    _args = [args[0].message];
                  } else {
                    _args = args;
                  }
                } else {
                  _args = args;
                  _console.push({args: _args.length === 1 ? _args[0] : _args, type: key});
                }
                if (console_debug && uw.console[key].apply) {
                  return uw.console[key].apply(uw.console, _args);
                } else if (console_debug) {
                  return uw.console[key](_args[0]);
                }
              } catch (e) {
                console.error(e);
              }
            };
          })(key);
        }
      }
    } else {
      con = {};
      for (var key in console) {
        if (typeof console[key] === "function") {
          con[key] = (function(key){
            return function(msg){
              try {
                var args = [];
                var _args = [];
                for (var i = 0; i < arguments.length; i++) {
                  args.push(arguments[i]);
                }
                if (key === "error" && args[0]) {
                  var tmp = {args: args.length === 1 ? args[0] : args, type: "error"};
                  if (args[0].message) {
                    tmp['message'] = args[0].message;
                  }
                  if (args[0].stack) {
                    tmp['stack'] = args[0].stack;
                  }
                  _console.push(tmp);
                  if (tmp['stack']) {
                    _args = [args[0].stack];
                  } else if (tmp['message']) {
                    _args = [args[0].message];
                  } else {
                    _args = args;
                  }
                } else {
                  _args = args;
                  _console.push({args: _args.length === 1 ? _args[0] : _args, type: key});
                }
                if (console_debug && GM_log.apply) {
                  return GM_log.apply(this, _args);
                } else {
                  return GM_log(_args[0]);
                }
              } catch (e) {
                console.error(e);
              }
            };
          })(key);
        }
      }
    }
    con.log("[URL] " + loc.href);
    // https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Function/bind
    if (!Function.prototype.bind) {
      Function.prototype.bind = function (oThis) {
        if (typeof this !== "function") {
          // closest thing possible to the ECMAScript 5 internal IsCallable function
          throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
        }

        var aArgs = Array.prototype.slice.call(arguments, 1), 
            fToBind = this, 
            fNOP = function () {},
            fBound = function () {
              return fToBind.apply(this instanceof fNOP && oThis
                                     ? this
                                     : oThis,
                                   aArgs.concat(Array.prototype.slice.call(arguments)));
            };

        fNOP.prototype = this.prototype;
        fBound.prototype = new fNOP();

        return fBound;
      };
    }
    
    if ((!(new RegExp("^(http(s)?://)(((.*\.)?youtube\.com\/.*)|(dl\.dropbox\.com\/u/13162258/YouTube%20Center/(.*))|(userscripts\.org/scripts/source/114002\.meta\.js))$", "")).test(loc.href)
      && !(new RegExp("http(s)?://apis\.google\.com/.*", "")).test(loc.href)
      && !(new RegExp("http(s)?://plus\.googleapis\.com/.*")).test(loc.href))
      || (new RegExp("http(s)?://apiblog\.youtube\.com/.*", "")).test(loc.href)) {
      con.log(loc.href + " doesn't match!");
      return;
    }
    con.log("In Scope");
    
    ytcenter.actionPanel = (function(){
      function getEventListener(options) {
        if (!options || !uw.yt || !uw.yt.events || !uw.yt.events.listeners_) return null;
        var key, item;
        for (key in uw.yt.events.listeners_) {
          item = uw.yt.events.listeners_[key];
          if (options.element) if (options.element !== item[0]) continue;
          if (options.event) if (options.event !== item[1]) continue;
          return item;
        }
        
        return null;
      }
      function initActionPanel() {
        var secondaryActions = document.getElementById("watch7-secondary-actions"), i;
        for (i = 0; i < secondaryActions.children.length; i++) {
          secondaryActions.children[i].children[0].addEventListener("click", function(){
            enableActionPanel();
            uw.setTimeout(disableActionPanel, 0);
          }, false);
        }
      }
      function enableActionPanel() {
        var secondaryActions = document.getElementById("watch7-secondary-actions"), i;
        for (i = 0; i < secondaryActions.children.length; i++) {
          ytcenter.utils.addClass(secondaryActions.children[i].children[0], "action-panel-trigger");
        }
      }
      function disableActionPanel() {
        var secondaryActions = document.getElementById("watch7-secondary-actions"), i;
        for (i = 0; i < secondaryActions.children.length; i++) {
          ytcenter.utils.removeClass(secondaryActions.children[i].children[0], "action-panel-trigger");
        }
      }
      function listenerDisabler() {
        var h = ytcenter.utils.hasClass(document.getElementById("watch-like"), "yt-uix-button-toggled");
        if (enabled && !h) {
          switchToElm = document.getElementById("watch7-secondary-actions").getElementsByClassName("yt-uix-button-toggled")[0];
          onceLock();
        }
        getEventListener({ event: "click", element: document.getElementById("watch-like") })[3]();
        
        if (ytcenter.settings.likeSwitchToTab !== "none" && !h) {
          uw.setTimeout(function(){
            __r.switchTo(ytcenter.settings.likeSwitchToTab);
          }, 0);
        }
      }
      function onceLock() {
        if (observer) observer.disconnect();
        observer = ytcenter.mutation.observe(switchToElm, { attributes: true }, function(mutations){
          mutations.forEach(function(mutation){
            if (mutation.type === "attributes" && mutation.attributeName === "class") {
              ytcenter.utils.addClass(switchToElm, "yt-uix-button-toggled");
              if (observer) observer.disconnect();
              observer = null;
            }
          });
        });
      }
      var __r = {},
          enabled = true,
          switchToElm = null,
          observer = null;
      
      
      __r.switchTo = function(tab){
        if (tab === "none" || !tab) return;
        var secondaryActions = document.getElementById("watch7-secondary-actions"), i;
        for (i = 0; i < secondaryActions.children.length; i++) {
          if (secondaryActions.children[i].children[0].getAttribute("data-trigger-for") === "action-panel-" + tab) {
            secondaryActions.children[i].children[0].click();
            switchToElm = secondaryActions.children[i].children[0];
            uw.setTimeout(onceLock, 0);
            return;
          }
        }
      };
      __r.setEnabled = function(a){
        if (a) {
          enabled = !!a;
          disableActionPanel();
        } else {
          enabled = !!a;
          enableActionPanel();
        }
      };
      __r.setThreadEnabled = function(){
        enableActionPanel();
        uw.setTimeout(disableActionPanel, 0);
      };
      __r.setup = function(){
        if (ytcenter.getPage() !== "watch") return;
        var a = document.getElementById("watch-like"),
            b = getEventListener({ event: "click", element: a });
        if (!b || !b[3]) {
          uw.setTimeout(__r.setup, 1000);
          return;
        }
        a.removeEventListener("click", b[3], false);
        a.addEventListener("click", listenerDisabler, false);
        
        initActionPanel();
        disableActionPanel();
      };
      return __r;
    })();
    ytcenter.mutation = (function(){
      var __r = {},
          M = null, setup = false,
          db = [],
          disconnects = [];
      __r.getObserver = function(callback){
        var i;
        for (i = 0; i < db.length; i++) {
          if (db[i].callback === callback)
            return db[i].observer;
        }
        return null;
      };
      __r.fallbackObserve = function(target, options, callback){
        function MutationRecord(record) {
          this.addedNodes = record.addedNodes || null;
          this.attributeName = record.attributeName || null;
          this.attributeNamespace = record.attributeNamespace || null;
          this.nextSibling = record.nextSibling || null;
          this.oldValue = record.oldValue || null;
          this.previousSibling = record.previousSibling || null;
          this.removedNodes = record.removedNodes || null;
          this.target = record.target || null;
          this.type = record.type || null;
          this.event = record.event || null;
        }
        function c() {
          if (insertedNodes.length > 0 || removedNodes.length > 0) {
            mutationRecords.push(new MutationRecord({
              addedNodes: insertedNodes,
              removedNodes: removedNodes,
              type: "childList",
              target: target
            }));
          }
          
          if (attributes.length > 0) {
            for (i = 0; i < attributes.length; i++) {
              mutationRecords.push(new MutationRecord({
                attributeName: attributes[i].attributeName,
                attributeNamespace: attributes[i].attributeNamespace,
                oldValue: attributes[i].oldValue,
                type: "attributes",
                target: target
              }));
            }
          }
          
          if (attributes.length > 0) {
            for (i = 0; i < attributes.length; i++) {
              mutationRecords.push(new MutationRecord({
                attributeName: attributes[i].attributeName,
                attributeNamespace: attributes[i].attributeNamespace,
                oldValue: attributes[i].oldValue,
                type: "attributes",
                target: target
              }));
            }
          }
          if (characterDataModified) {
            mutationRecords.push(new MutationRecord({
              oldValue: characterDataModified.oldValue,
              type: "characterData",
              target: target
            }));
          }
          if (characterDataModified) {
            mutationRecords.push(new MutationRecord({
              oldValue: characterDataModified.oldValue,
              type: "characterData",
              target: target
            }));
          }
          if (subtreeModified) {
            mutationRecords.push(new MutationRecord({
              type: "subtree",
              target: target
            }));
          }
          
          callback(mutationRecords);
          insertedNodes = [];
          removedNodes = [];
          mutationRecords = [];
          attributes = [];
          characterDataModified = null;
          subtreeModified = false;
        }
        function DOMNodeInserted(e) {
          insertedNodes.push(e.target);
          throttleFunc();
        }
        function DOMNodeRemoved(e) {
          removedNodes.push(e.target);
          throttleFunc();
        }
        function DOMAttrModified(e) {
          attributes.push({
            attributeName: e.attrName,
            attributeNamespace: e.attrName,
            oldValue: e.prevValue
          });
          throttleFunc();
        }
        function DOMCharacterDataModified(e) {
          characterDataModified = {
            newValue: e.newValue,
            oldValue: e.prevValue
          };
          throttleFunc();
        }
        function DOMSubtreeModified(e) {
          subtreeModified = true;
          throttleFunc();
        }
        
        var buffer = null, i,
            insertedNodes = [],
            removedNodes = [],
            mutationRecords = [],
            attributes = [],
            characterDataModified = null,
            subtreeModified = false,
            throttleFunc = ytcenter.utils.throttle(c, 500);
        
        if (options.childList) {
          ytcenter.utils.addEventListener(target, "DOMNodeInserted", DOMNodeInserted, false);
          ytcenter.utils.addEventListener(target, "DOMNodeRemoved", DOMNodeRemoved, false);
        }
        
        if (options.attributes) {
          ytcenter.utils.addEventListener(target, "DOMAttrModified", DOMAttrModified, false);
        }
        
        if (options.characterData) {
          ytcenter.utils.addEventListener(target, "DOMCharacterDataModified", DOMCharacterDataModified, false);
        }
        
        if (options.subtree) {
          ytcenter.utils.addEventListener(target, "DOMSubtreeModified", DOMSubtreeModified, false);
        }
        return disconnects[disconnects.push({
          DOMNodeInserted: DOMNodeInserted,
          DOMNodeRemoved: DOMNodeRemoved,
          DOMAttrModified: DOMAttrModified,
          DOMCharacterDataModified: DOMCharacterDataModified,
          DOMSubtreeModified: DOMSubtreeModified,
          target: target,
          options: options,
          callback: callback,
          disconnect: function(){
            if (options.childList) {
              ytcenter.utils.removeEventListener(target, "DOMNodeInserted", DOMNodeInserted, false);
              ytcenter.utils.removeEventListener(target, "DOMNodeRemoved", DOMNodeRemoved, false);
            }
            
            if (options.attributes) {
              ytcenter.utils.removeEventListener(target, "DOMAttrModified", DOMAttrModified, false);
            }
            
            if (options.characterData) {
              ytcenter.utils.removeEventListener(target, "DOMCharacterDataModified", DOMCharacterDataModified, false);
            }
            
            if (options.subtree) {
              ytcenter.utils.removeEventListener(target, "DOMSubtreeModified", DOMSubtreeModified, false);
            }
          }
        }) - 1];
      };
      __r.observe = function(target, options, callback){
        if (!target || !options || !callback) return;
        if (!setup) __r.setup();
        
        if (!M) return __r.fallbackObserve(target, options, callback); // fallback if MutationObserver isn't supported
        var observer = __r.getObserver(callback);
        if (!observer) {
          observer = new M(callback);
          db.push({ callback: callback, observer: observer});
        }
        observer.observe(target, options);
        return disconnects[disconnects.push({
          target: target,
          options: options,
          callback: callback,
          disconnect: function(){
            if (observer) observer.disconnect();
          }
        }) - 1];
      };
      __r.disconnect = function(target, callback){
        var i;
        for (i = 0; i < disconnects.length; i++) {
          if (target === disconnects[i].target && callback === disconnects[i].callback) {
            disconnects[i].disconnect();
          }
        }
      };
      __r.setup = function(){
        setup = true;
        M = ytcenter.getMutationObserver();
        ytcenter.unload(function(){
          var i;
          for (i = 0; i < disconnects.length; i++) {
            if (disconnects[i] && disconnects[i].disconnect) disconnects[i].disconnect();
          }
        });
      };
      
      return __r;
    })();
    
    
    con.log("Initializing Functions");
    try {
      ytcenter.embed = {};
      ytcenter.embed._writeEmbed = uw.writeEmbed;
      ytcenter.embed.isYouTubeReady = false;
      ytcenter.embed.isYouTubeCenterReady = false;
      ytcenter.embed.failsafe = false;
      defineLockedProperty(uw, "writeEmbed", function(func){
        con.log("[Embed] writeEmbed has been leaked to YouTube Center.");
        ytcenter.embed._writeEmbed = func;
      }, function(){
        if (ytcenter.embed.failsafe)
          return ytcenter.embed._writeEmbed;
        return function(){
          con.log("[Embed] YouTube has called writeEmbed.");
          ytcenter.embed.isYouTubeReady = true;
          if (ytcenter.embed.writePlayer)
            ytcenter.embed.writePlayer();
        };
      });
      
      ytcenter.embed.callWriteEmbed = function(){
        var reload = false;
        try {
          if (ytcenter.settings.embedWriteEmbedMethod === "standard") { // Async
            ytcenter.embed._writeEmbed();
          } else if (ytcenter.settings.embedWriteEmbedMethod === "test1") { // Async
            uw.yt.player.embed("player", ytcenter.player.getConfig());
          } else if (ytcenter.settings.embedWriteEmbedMethod === "test2") { // Sync
            var data = new uw.yt.player.Application("player", ytcenter.player.getConfig());
            con.log("[callWriteEmbed]", data);
          } else if (ytcenter.settings.embedWriteEmbedMethod === "test3") { // Sync
            uw.yt.player.Application.create("player", ytcenter.player.getConfig());
          } else if (ytcenter.settings.embedWriteEmbedMethod === "standard+reload") { // Async
            ytcenter.embed._writeEmbed();
            reload = true;
          } else if (ytcenter.settings.embedWriteEmbedMethod === "test1+reload") { // Async
            uw.yt.player.embed("player", ytcenter.player.getConfig());
            reload = true;
          } else if (ytcenter.settings.embedWriteEmbedMethod === "test2+reload") { // Sync
            var data = new uw.yt.player.Application("player", ytcenter.player.getConfig());
            con.log("[callWriteEmbed]", data);
            reload = true;
          } else if (ytcenter.settings.embedWriteEmbedMethod === "test3+reload") { // Sync
            uw.yt.player.Application.create("player", ytcenter.player.getConfig());
            reload = true;
          } else if (ytcenter.settings.embedWriteEmbedMethod === "test4") { // Sync
            uw.ytcenter_writeEmbed = ytcenter.embed._writeEmbed;
            ytcenter.inject(function(){
              var c = JSON.parse(JSON.stringify(ytplayer.config));
              yt.config_.PLAYER_CONFIG = c;
              ytcenter_writeEmbed();
            });
          } else if (ytcenter.settings.embedWriteEmbedMethod === "test5") { // Sync
            yt.config_.PLAYER_CONFIG = ytcenter.utils.jsonClone(ytcenter.player.getConfig());
            ytcenter.embed._writeEmbed();
          }
        } catch (e) {
          con.error(e);
        }
        if (reload) {
          // Reload the embedded video if there is no children of the player element after 1.0 seconds.
          uw.setTimeout(function(){
            var p = document.getElementById("player");
            if (!p) return;
            if (p.children.length === 0) {
              loc.reload();
            }
          }, ytcenter.settings.embedWriteEmbedMethodReloadDelay);
        }
      };
      
      ytcenter.embed.writePlayer = function(){
        try {
          if (typeof ytcenter.embed._writeEmbed !== "function") {
            con.log("[Embed] writeEmbed is not yet ready!");
            return;
          }
          con.log("[Embed] Checking if YouTube and YouTube Center are ready...");
          if (!ytcenter.embed.isYouTubeReady || !ytcenter.embed.isYouTubeCenterReady) {
            con.log("[Embed] They're both not ready yet!");
            return;
          }
          /* Settings the player config according to YouTube Center */
          var cfg = ytcenter.player.getConfig();
          if (cfg) uw.yt.config_.PLAYER_CONFIG = cfg;
          
          /* Writing the embedded player */
          con.log("[Embed] Writing the embedded player.");
          ytcenter.embed.callWriteEmbed();
        } catch (e) {
          con.error(e);
          ytcenter.embed.failsafe = true;
          /* Trying to write the player when an error was thrown */
          try {
            con.log("[Embed] Writing the embedded player.");
            ytcenter.embed.callWriteEmbed();
          } catch (e) {
            con.error(e);
          }
        }
      };
      
      ytcenter.embed.load = function(){
        try {
          con.log("[Embed] Loading video data...");
          var url = ytcenter.player.getVideoDataRequest();
          
          con.log("[Embed] Downloading data from " + url);
          ytcenter.utils.xhr({
            method: "GET",
            url: url,
            headers: {
              "Content-Type": "text/plain"
            },
            onload: function(response){
              try {
                if (response.responseText) {
                  con.log("[Embed] Download complete.");
                  var object = {}, tokens = response.responseText.split("&");
                  for (var i = 0; i < tokens.length; i++) {
                    var ss = tokens[i].split("=");
                    object[ss[0]] = decodeURIComponent(ss[1]);
                  }
                  if (object.errorcode) {
                    con.error("[Embed] Error: " + object.errorcode + ": " + object.reason);
                  } else {
                    if (object.dash) ytcenter.player.config.args.dash = object.dash;
                    if (object.dashmpd) ytcenter.player.config.args.dashmpd = object.dashmpd;
                    if (object.adaptive_fmts) ytcenter.player.config.args.adaptive_fmts = object.adaptive_fmts;
                    if (object.fmt_list) ytcenter.player.config.args.fmt_list = object.fmt_list;
                    if (object.url_encoded_fmt_stream_map) ytcenter.player.config.args.url_encoded_fmt_stream_map = object.url_encoded_fmt_stream_map;
                    if (object.url_encoded_fmt_stream_map || object.adaptive_fmts) {
                      ytcenter.video.streams = ytcenter.parseStreams(object);
                    }
                    ytcenter.player.setConfig(ytcenter.player.modifyConfig("embed", ytcenter.player.config));
                  }
                  
                  ytcenter.embed.isYouTubeCenterReady = true;
                  ytcenter.embed.writePlayer();
                } else {
                  con.error("[Embed] Didn't receive any data!");
                  ytcenter.embed.failsafe = true;
                  /* Going to set YouTube Center as ready to make it possible for the user to watch the embedded video if possible. */
                  ytcenter.embed.isYouTubeCenterReady = true;
                  ytcenter.embed.writePlayer();
                }
              } catch (e) {
                con.error(e);
                ytcenter.embed.failsafe = true;
                /* Just to make people happy. */
                ytcenter.embed.isYouTubeCenterReady = true;
                ytcenter.embed.writePlayer();
              }
            },
            onerror: function(){
              con.error("[Embed] Connection failed!");
              ytcenter.embed.failsafe = true;
              /* Going to set YouTube Center as ready to make it possible for the user to watch the embedded video if possible. */
              ytcenter.embed.isYouTubeCenterReady = true;
              ytcenter.embed.writePlayer();
            }
          });
        } catch (e) {
          con.error(e);
          ytcenter.embed.failsafe = true;
          ytcenter.embed.isYouTubeCenterReady = true;
          ytcenter.embed.writePlayer();
        }
      };
    } catch (e) {
      con.error(e);
    }
    
    ytcenter.io = {};
    ytcenter.unsafe = {};
    
    uw.ytcenter = ytcenter.unsafe;
    ytcenter.unsafe.io = ytcenter.io;
    ytcenter.unsafe.spf = {};
    ytcenter.unsafe.storage = {};
    ytcenter.unsafe.storage.onloaded = function(id, data){
      ytcenter.unsafe.storage.onloaded_db[id](data);
    };
    ytcenter.unsafe.storage.onloaded_db = [];
    ytcenter.unsafe.storage.onsaved = function(id){
      ytcenter.unsafe.storage.onsaved_db[id]();
    };
    ytcenter.unsafe.storage.onsaved_db = [];
    
    ytcenter.title = {};
    ytcenter.title.originalTitle = "";
    ytcenter.title.previousTitle = "";
    ytcenter.title.liveTitle = "";
    ytcenter.title.processOriginalTitle = function(a){
      if (ytcenter.player && ytcenter.player.config && ytcenter.player.config.args && ytcenter.player.config.args.title) {
        // Doesn't have a prefix or suffix.
        a = ytcenter.player.config.args.title;
      } else {
        // Can have prefix and suffix.
        a = a.replace(/^\u25b6 /, ""); // Removes the prefix.
        // The suffix is handled in the update process.
      }
      return a;
    };
    ytcenter.title.modified = function(){
      var a = document.getElementsByTagName("title")[0].textContent;
      if (a !== ytcenter.title.previousTitle) {
        if (ytcenter.title.originalTitle === "") {
          ytcenter.title.originalTitle = ytcenter.title.processOriginalTitle(a);
        }
        con.log("[Title Listener] \"" + ytcenter.title.previousTitle + "\" => \"" + a + "\"");
        ytcenter.title.previousTitle = a;
        ytcenter.title.update();
      }
    };
    ytcenter.title._init_count = 0;
    ytcenter.title.init = function(){
      var a = document.getElementsByTagName("title")[0];
      if ((a && a.textContent && a.textContent !== "") || (document && document.title && document.title !== "")) {
        ytcenter.title._init_count = 0;
        if (a && a.textContent && a.textContent !== "") {
          ytcenter.title.originalTitle = ytcenter.title.processOriginalTitle(a.textContent);
        } else {
          ytcenter.title.originalTitle = ytcenter.title.processOriginalTitle(document.title);
        }
        ytcenter.mutation.observe(document.head, { attributes: true, childList: true, characterData: true, subtree: true }, ytcenter.title.modified);
        ytcenter.title.update();
      } else {
        if (ytcenter.title._init_count > 20) {
          ytcenter.title._init_count = 0;
          return;
        }
        con.log("[Title Listener] Waiting for title head...");
        ytcenter.title._init_count++;
        uw.setTimeout(ytcenter.title.init, 500);
      }
    };
    ytcenter.title.update = function(){
      if (ytcenter.title.originalTitle === "") return;
      //var a = document.getElementsByTagName("title")[0];
      if (ytcenter.settings.playerPlayingTitleIndicator && ytcenter.getPage() === "watch") {
        if (ytcenter.player.getAPI && ytcenter.player.getAPI() && ytcenter.player.getAPI().getPlayerState && ytcenter.player.getAPI().getPlayerState() === 1) {
          ytcenter.title.addPlayIcon();
        } else {
          ytcenter.title.removePlayIcon();
        }
      } else {
        ytcenter.title.removePlayIcon();
      }
      if (ytcenter.settings.removeYouTubeTitleSuffix) {
        ytcenter.title.removeSuffix();
      } else {
        ytcenter.title.addSuffix();
      }
      try {
        document.title = ytcenter.title.liveTitle;
      } catch (e) {
        con.error(e); // Opera 12 will throw an error because it seems to be read only.
      }
      //a.textContent = ytcenter.title.liveTitle;
    };
    ytcenter.title.hasSuffix = function(){
      return / - YouTube$/.test(ytcenter.title.liveTitle);
    };
    ytcenter.title.removeSuffix = function(){
      ytcenter.title.liveTitle = ytcenter.title.liveTitle.replace(/ - YouTube$/, "");
    };
    ytcenter.title.addSuffix = function(){
      if (ytcenter.title.hasSuffix()) return;
      ytcenter.title.liveTitle += " - YouTube";
    };
    ytcenter.title.hasPlayIcon = function(){
      return ytcenter.title.liveTitle.indexOf("\u25b6 ") === 0;
    };
    ytcenter.title.removePlayIcon = function(){
      ytcenter.title.liveTitle = ytcenter.title.originalTitle;
    };
    ytcenter.title.addPlayIcon = function(){
      ytcenter.title.liveTitle = "\u25b6 " + ytcenter.title.originalTitle;
    };
    
    ytcenter.inject = function(func){
      try {
        var script = document.createElement("script"),
            p = (document.body || document.head || document.documentElement);
        if (!p) {
          con.error("[Script Inject] document.body, document.head and document.documentElement doesn't exist!");
          return;
        }
        if (typeof func === "string") {
          func = "function(){" + func + "}";
        }
        script.setAttribute("type", "text/javascript");
        script.appendChild(document.createTextNode("(" + func + ")();\n//# sourceURL=YouTubeCenter.js"));
        p.appendChild(script);
        p.removeChild(script);
      } catch (e) {
        con.error(e);
      }
    };
    ytcenter.unload = (function(){
      var unloads = [];
      
      window.addEventListener("unload", function(){
        var i;
        for (i = 0; i < unloads.length; i++) {
          if (typeof unloads[i] === "function") unloads[i]();
          else con.error("[Unload] Couldn't unload!", unloads[i]);
        }
      }, false);
      return function(unload){
        unloads.push(unload);
      };
    })();
    ytcenter.version = "@ant-version@";
    ytcenter.revision = @ant-revision@;
    ytcenter.icon = {};
    ytcenter.page = "none";
    ytcenter.feather = false;
    con.log("Initializing icons");
    ytcenter.icon.gear = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAPCAYAAAFM0aXcAAAACXBIWXMAAAsTAAALEwEAmpwYAAAKT2lDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjanVNnVFPpFj333vRCS4iAlEtvUhUIIFJCi4AUkSYqIQkQSoghodkVUcERRUUEG8igiAOOjoCMFVEsDIoK2AfkIaKOg6OIisr74Xuja9a89+bN/rXXPues852zzwfACAyWSDNRNYAMqUIeEeCDx8TG4eQuQIEKJHAAEAizZCFz/SMBAPh+PDwrIsAHvgABeNMLCADATZvAMByH/w/qQplcAYCEAcB0kThLCIAUAEB6jkKmAEBGAYCdmCZTAKAEAGDLY2LjAFAtAGAnf+bTAICd+Jl7AQBblCEVAaCRACATZYhEAGg7AKzPVopFAFgwABRmS8Q5ANgtADBJV2ZIALC3AMDOEAuyAAgMADBRiIUpAAR7AGDIIyN4AISZABRG8lc88SuuEOcqAAB4mbI8uSQ5RYFbCC1xB1dXLh4ozkkXKxQ2YQJhmkAuwnmZGTKBNA/g88wAAKCRFRHgg/P9eM4Ors7ONo62Dl8t6r8G/yJiYuP+5c+rcEAAAOF0ftH+LC+zGoA7BoBt/qIl7gRoXgugdfeLZrIPQLUAoOnaV/Nw+H48PEWhkLnZ2eXk5NhKxEJbYcpXff5nwl/AV/1s+X48/Pf14L7iJIEyXYFHBPjgwsz0TKUcz5IJhGLc5o9H/LcL//wd0yLESWK5WCoU41EScY5EmozzMqUiiUKSKcUl0v9k4t8s+wM+3zUAsGo+AXuRLahdYwP2SycQWHTA4vcAAPK7b8HUKAgDgGiD4c93/+8//UegJQCAZkmScQAAXkQkLlTKsz/HCAAARKCBKrBBG/TBGCzABhzBBdzBC/xgNoRCJMTCQhBCCmSAHHJgKayCQiiGzbAdKmAv1EAdNMBRaIaTcA4uwlW4Dj1wD/phCJ7BKLyBCQRByAgTYSHaiAFiilgjjggXmYX4IcFIBBKLJCDJiBRRIkuRNUgxUopUIFVIHfI9cgI5h1xGupE7yAAygvyGvEcxlIGyUT3UDLVDuag3GoRGogvQZHQxmo8WoJvQcrQaPYw2oefQq2gP2o8+Q8cwwOgYBzPEbDAuxsNCsTgsCZNjy7EirAyrxhqwVqwDu4n1Y8+xdwQSgUXACTYEd0IgYR5BSFhMWE7YSKggHCQ0EdoJNwkDhFHCJyKTqEu0JroR+cQYYjIxh1hILCPWEo8TLxB7iEPENyQSiUMyJ7mQAkmxpFTSEtJG0m5SI+ksqZs0SBojk8naZGuyBzmULCAryIXkneTD5DPkG+Qh8lsKnWJAcaT4U+IoUspqShnlEOU05QZlmDJBVaOaUt2ooVQRNY9aQq2htlKvUYeoEzR1mjnNgxZJS6WtopXTGmgXaPdpr+h0uhHdlR5Ol9BX0svpR+iX6AP0dwwNhhWDx4hnKBmbGAcYZxl3GK+YTKYZ04sZx1QwNzHrmOeZD5lvVVgqtip8FZHKCpVKlSaVGyovVKmqpqreqgtV81XLVI+pXlN9rkZVM1PjqQnUlqtVqp1Q61MbU2epO6iHqmeob1Q/pH5Z/YkGWcNMw09DpFGgsV/jvMYgC2MZs3gsIWsNq4Z1gTXEJrHN2Xx2KruY/R27iz2qqaE5QzNKM1ezUvOUZj8H45hx+Jx0TgnnKKeX836K3hTvKeIpG6Y0TLkxZVxrqpaXllirSKtRq0frvTau7aedpr1Fu1n7gQ5Bx0onXCdHZ4/OBZ3nU9lT3acKpxZNPTr1ri6qa6UbobtEd79up+6Ynr5egJ5Mb6feeb3n+hx9L/1U/W36p/VHDFgGswwkBtsMzhg8xTVxbzwdL8fb8VFDXcNAQ6VhlWGX4YSRudE8o9VGjUYPjGnGXOMk423GbcajJgYmISZLTepN7ppSTbmmKaY7TDtMx83MzaLN1pk1mz0x1zLnm+eb15vft2BaeFostqi2uGVJsuRaplnutrxuhVo5WaVYVVpds0atna0l1rutu6cRp7lOk06rntZnw7Dxtsm2qbcZsOXYBtuutm22fWFnYhdnt8Wuw+6TvZN9un2N/T0HDYfZDqsdWh1+c7RyFDpWOt6azpzuP33F9JbpL2dYzxDP2DPjthPLKcRpnVOb00dnF2e5c4PziIuJS4LLLpc+Lpsbxt3IveRKdPVxXeF60vWdm7Obwu2o26/uNu5p7ofcn8w0nymeWTNz0MPIQ+BR5dE/C5+VMGvfrH5PQ0+BZ7XnIy9jL5FXrdewt6V3qvdh7xc+9j5yn+M+4zw33jLeWV/MN8C3yLfLT8Nvnl+F30N/I/9k/3r/0QCngCUBZwOJgUGBWwL7+Hp8Ib+OPzrbZfay2e1BjKC5QRVBj4KtguXBrSFoyOyQrSH355jOkc5pDoVQfujW0Adh5mGLw34MJ4WHhVeGP45wiFga0TGXNXfR3ENz30T6RJZE3ptnMU85ry1KNSo+qi5qPNo3ujS6P8YuZlnM1VidWElsSxw5LiquNm5svt/87fOH4p3iC+N7F5gvyF1weaHOwvSFpxapLhIsOpZATIhOOJTwQRAqqBaMJfITdyWOCnnCHcJnIi/RNtGI2ENcKh5O8kgqTXqS7JG8NXkkxTOlLOW5hCepkLxMDUzdmzqeFpp2IG0yPTq9MYOSkZBxQqohTZO2Z+pn5mZ2y6xlhbL+xW6Lty8elQfJa7OQrAVZLQq2QqboVFoo1yoHsmdlV2a/zYnKOZarnivN7cyzytuQN5zvn//tEsIS4ZK2pYZLVy0dWOa9rGo5sjxxedsK4xUFK4ZWBqw8uIq2Km3VT6vtV5eufr0mek1rgV7ByoLBtQFr6wtVCuWFfevc1+1dT1gvWd+1YfqGnRs+FYmKrhTbF5cVf9go3HjlG4dvyr+Z3JS0qavEuWTPZtJm6ebeLZ5bDpaql+aXDm4N2dq0Dd9WtO319kXbL5fNKNu7g7ZDuaO/PLi8ZafJzs07P1SkVPRU+lQ27tLdtWHX+G7R7ht7vPY07NXbW7z3/T7JvttVAVVN1WbVZftJ+7P3P66Jqun4lvttXa1ObXHtxwPSA/0HIw6217nU1R3SPVRSj9Yr60cOxx++/p3vdy0NNg1VjZzG4iNwRHnk6fcJ3/ceDTradox7rOEH0x92HWcdL2pCmvKaRptTmvtbYlu6T8w+0dbq3nr8R9sfD5w0PFl5SvNUyWna6YLTk2fyz4ydlZ19fi753GDborZ752PO32oPb++6EHTh0kX/i+c7vDvOXPK4dPKy2+UTV7hXmq86X23qdOo8/pPTT8e7nLuarrlca7nuer21e2b36RueN87d9L158Rb/1tWeOT3dvfN6b/fF9/XfFt1+cif9zsu72Xcn7q28T7xf9EDtQdlD3YfVP1v+3Njv3H9qwHeg89HcR/cGhYPP/pH1jw9DBY+Zj8uGDYbrnjg+OTniP3L96fynQ89kzyaeF/6i/suuFxYvfvjV69fO0ZjRoZfyl5O/bXyl/erA6xmv28bCxh6+yXgzMV70VvvtwXfcdx3vo98PT+R8IH8o/2j5sfVT0Kf7kxmTk/8EA5jz/GMzLdsAAAAgY0hSTQAAeiUAAICDAAD5/wAAgOkAAHUwAADqYAAAOpgAABdvkl/FRgAAAkFJREFUeNpi+v//P8OqVatcmVavXt3JwMDwGAAAAP//Yvr//z/D////GZhWr179f/Xq1RMBAAAA//9igqr5D8WKTAwQ0MPAwPCEgYGhBwAAAP//TMtBEUBQAAXA9ZsII8IrIIQOBHF5EdwU42TGffcT+/8e2No+MLAmmaDtMnC3PTEnuV4AAAD//zTOQRGCUAAG4YWrCbxSwQzYYDt452AGHCKQ4H9gAYNwcsabMeDyKLD7nY01SZfkn2ROMiV5n80euABf9VoFA3ArpYyt+gEe9bEDW6Uu6rMFUH8VcgdeaqMOAAcZZIiDMBQE0cdv0jQhQREMGDRB9B5Ihssguc2OhHsg4ACoKhQgSIPAbDGsG7GZee/HHhFVRByHPPRPbJ+BGbCxPU5HdQHewBrosvMFXCX1BTgAVQ4ZAXdgZftWgB3/9wRcJC3T8jaRpulgX2zXwAKY51cDXICmSOqTrQNOwEdSK+nxZZJ8VSIKoyD+24uw3CAIYhAEBZNdbK6r0ShM9AH2abRpNwhnwEfQVaPYDQZBk4KIZTX4p8wut33nMMw3Z2a6d/aqqp93W1WvSfm4gxlUVTvzIfYOgF/gy/ZzrF6KjJHtx+i9Bu5st9MeIOkGWAO+o38VuAJOgTdgPUQXwCYwB9DYHof1CegHdChpT9JI0gpwm/0BMAE+bY8bSUNgPil9BHRm+9L2ie0XYDv7+5jXkzScNv4HOAcWMr8Du6nccn5+SB//4tHs5gmwBeyEdRE46hDtS9pIhk084n8AVJscCePQvIsAAAAASUVORK5CYII=";
    ytcenter.icon.lightbulb = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAPCAYAAAA71pVKAAAACXBIWXMAAAsTAAALEwEAmpwYAAAKT2lDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjanVNnVFPpFj333vRCS4iAlEtvUhUIIFJCi4AUkSYqIQkQSoghodkVUcERRUUEG8igiAOOjoCMFVEsDIoK2AfkIaKOg6OIisr74Xuja9a89+bN/rXXPues852zzwfACAyWSDNRNYAMqUIeEeCDx8TG4eQuQIEKJHAAEAizZCFz/SMBAPh+PDwrIsAHvgABeNMLCADATZvAMByH/w/qQplcAYCEAcB0kThLCIAUAEB6jkKmAEBGAYCdmCZTAKAEAGDLY2LjAFAtAGAnf+bTAICd+Jl7AQBblCEVAaCRACATZYhEAGg7AKzPVopFAFgwABRmS8Q5ANgtADBJV2ZIALC3AMDOEAuyAAgMADBRiIUpAAR7AGDIIyN4AISZABRG8lc88SuuEOcqAAB4mbI8uSQ5RYFbCC1xB1dXLh4ozkkXKxQ2YQJhmkAuwnmZGTKBNA/g88wAAKCRFRHgg/P9eM4Ors7ONo62Dl8t6r8G/yJiYuP+5c+rcEAAAOF0ftH+LC+zGoA7BoBt/qIl7gRoXgugdfeLZrIPQLUAoOnaV/Nw+H48PEWhkLnZ2eXk5NhKxEJbYcpXff5nwl/AV/1s+X48/Pf14L7iJIEyXYFHBPjgwsz0TKUcz5IJhGLc5o9H/LcL//wd0yLESWK5WCoU41EScY5EmozzMqUiiUKSKcUl0v9k4t8s+wM+3zUAsGo+AXuRLahdYwP2SycQWHTA4vcAAPK7b8HUKAgDgGiD4c93/+8//UegJQCAZkmScQAAXkQkLlTKsz/HCAAARKCBKrBBG/TBGCzABhzBBdzBC/xgNoRCJMTCQhBCCmSAHHJgKayCQiiGzbAdKmAv1EAdNMBRaIaTcA4uwlW4Dj1wD/phCJ7BKLyBCQRByAgTYSHaiAFiilgjjggXmYX4IcFIBBKLJCDJiBRRIkuRNUgxUopUIFVIHfI9cgI5h1xGupE7yAAygvyGvEcxlIGyUT3UDLVDuag3GoRGogvQZHQxmo8WoJvQcrQaPYw2oefQq2gP2o8+Q8cwwOgYBzPEbDAuxsNCsTgsCZNjy7EirAyrxhqwVqwDu4n1Y8+xdwQSgUXACTYEd0IgYR5BSFhMWE7YSKggHCQ0EdoJNwkDhFHCJyKTqEu0JroR+cQYYjIxh1hILCPWEo8TLxB7iEPENyQSiUMyJ7mQAkmxpFTSEtJG0m5SI+ksqZs0SBojk8naZGuyBzmULCAryIXkneTD5DPkG+Qh8lsKnWJAcaT4U+IoUspqShnlEOU05QZlmDJBVaOaUt2ooVQRNY9aQq2htlKvUYeoEzR1mjnNgxZJS6WtopXTGmgXaPdpr+h0uhHdlR5Ol9BX0svpR+iX6AP0dwwNhhWDx4hnKBmbGAcYZxl3GK+YTKYZ04sZx1QwNzHrmOeZD5lvVVgqtip8FZHKCpVKlSaVGyovVKmqpqreqgtV81XLVI+pXlN9rkZVM1PjqQnUlqtVqp1Q61MbU2epO6iHqmeob1Q/pH5Z/YkGWcNMw09DpFGgsV/jvMYgC2MZs3gsIWsNq4Z1gTXEJrHN2Xx2KruY/R27iz2qqaE5QzNKM1ezUvOUZj8H45hx+Jx0TgnnKKeX836K3hTvKeIpG6Y0TLkxZVxrqpaXllirSKtRq0frvTau7aedpr1Fu1n7gQ5Bx0onXCdHZ4/OBZ3nU9lT3acKpxZNPTr1ri6qa6UbobtEd79up+6Ynr5egJ5Mb6feeb3n+hx9L/1U/W36p/VHDFgGswwkBtsMzhg8xTVxbzwdL8fb8VFDXcNAQ6VhlWGX4YSRudE8o9VGjUYPjGnGXOMk423GbcajJgYmISZLTepN7ppSTbmmKaY7TDtMx83MzaLN1pk1mz0x1zLnm+eb15vft2BaeFostqi2uGVJsuRaplnutrxuhVo5WaVYVVpds0atna0l1rutu6cRp7lOk06rntZnw7Dxtsm2qbcZsOXYBtuutm22fWFnYhdnt8Wuw+6TvZN9un2N/T0HDYfZDqsdWh1+c7RyFDpWOt6azpzuP33F9JbpL2dYzxDP2DPjthPLKcRpnVOb00dnF2e5c4PziIuJS4LLLpc+Lpsbxt3IveRKdPVxXeF60vWdm7Obwu2o26/uNu5p7ofcn8w0nymeWTNz0MPIQ+BR5dE/C5+VMGvfrH5PQ0+BZ7XnIy9jL5FXrdewt6V3qvdh7xc+9j5yn+M+4zw33jLeWV/MN8C3yLfLT8Nvnl+F30N/I/9k/3r/0QCngCUBZwOJgUGBWwL7+Hp8Ib+OPzrbZfay2e1BjKC5QRVBj4KtguXBrSFoyOyQrSH355jOkc5pDoVQfujW0Adh5mGLw34MJ4WHhVeGP45wiFga0TGXNXfR3ENz30T6RJZE3ptnMU85ry1KNSo+qi5qPNo3ujS6P8YuZlnM1VidWElsSxw5LiquNm5svt/87fOH4p3iC+N7F5gvyF1weaHOwvSFpxapLhIsOpZATIhOOJTwQRAqqBaMJfITdyWOCnnCHcJnIi/RNtGI2ENcKh5O8kgqTXqS7JG8NXkkxTOlLOW5hCepkLxMDUzdmzqeFpp2IG0yPTq9MYOSkZBxQqohTZO2Z+pn5mZ2y6xlhbL+xW6Lty8elQfJa7OQrAVZLQq2QqboVFoo1yoHsmdlV2a/zYnKOZarnivN7cyzytuQN5zvn//tEsIS4ZK2pYZLVy0dWOa9rGo5sjxxedsK4xUFK4ZWBqw8uIq2Km3VT6vtV5eufr0mek1rgV7ByoLBtQFr6wtVCuWFfevc1+1dT1gvWd+1YfqGnRs+FYmKrhTbF5cVf9go3HjlG4dvyr+Z3JS0qavEuWTPZtJm6ebeLZ5bDpaql+aXDm4N2dq0Dd9WtO319kXbL5fNKNu7g7ZDuaO/PLi8ZafJzs07P1SkVPRU+lQ27tLdtWHX+G7R7ht7vPY07NXbW7z3/T7JvttVAVVN1WbVZftJ+7P3P66Jqun4lvttXa1ObXHtxwPSA/0HIw6217nU1R3SPVRSj9Yr60cOxx++/p3vdy0NNg1VjZzG4iNwRHnk6fcJ3/ceDTradox7rOEH0x92HWcdL2pCmvKaRptTmvtbYlu6T8w+0dbq3nr8R9sfD5w0PFl5SvNUyWna6YLTk2fyz4ydlZ19fi753GDborZ752PO32oPb++6EHTh0kX/i+c7vDvOXPK4dPKy2+UTV7hXmq86X23qdOo8/pPTT8e7nLuarrlca7nuer21e2b36RueN87d9L158Rb/1tWeOT3dvfN6b/fF9/XfFt1+cif9zsu72Xcn7q28T7xf9EDtQdlD3YfVP1v+3Njv3H9qwHeg89HcR/cGhYPP/pH1jw9DBY+Zj8uGDYbrnjg+OTniP3L96fynQ89kzyaeF/6i/suuFxYvfvjV69fO0ZjRoZfyl5O/bXyl/erA6xmv28bCxh6+yXgzMV70VvvtwXfcdx3vo98PT+R8IH8o/2j5sfVT0Kf7kxmTk/8EA5jz/GMzLdsAAAAgY0hSTQAAeiUAAICDAAD5/wAAgOkAAHUwAADqYAAAOpgAABdvkl/FRgAAANRJREFUeNqU0rFKBDEUheFvdSpRVmx8EF9EJJXWlj6KCoKCouD2F3wMm+220E6xs1YEZXVsgsTRzLCnSe495+cmJKO2bZVKKTU4wD428YxLnETEvMw2/mqC3aLewCG2sFcGR+XklNI2btS1ExE//lLX1K9ffhceD8DjPng6AE/74AleKuArrqtwRDzhvAJfZL86Ga7w1em1+a31whFxj1mnPYuIu0E46zav805t6IfBMdby8ZdxtAj8jlV8ZvhjEbjBOt6wUsvV7vyI07w/w8N/oe8BAO3xNxGbpir1AAAAAElFTkSuQmCC";
    ytcenter.icon.smallThumbsUpWhite = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAALCAYAAACprHcmAAAACXBIWXMAAAsTAAALEwEAmpwYAAAKT2lDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjanVNnVFPpFj333vRCS4iAlEtvUhUIIFJCi4AUkSYqIQkQSoghodkVUcERRUUEG8igiAOOjoCMFVEsDIoK2AfkIaKOg6OIisr74Xuja9a89+bN/rXXPues852zzwfACAyWSDNRNYAMqUIeEeCDx8TG4eQuQIEKJHAAEAizZCFz/SMBAPh+PDwrIsAHvgABeNMLCADATZvAMByH/w/qQplcAYCEAcB0kThLCIAUAEB6jkKmAEBGAYCdmCZTAKAEAGDLY2LjAFAtAGAnf+bTAICd+Jl7AQBblCEVAaCRACATZYhEAGg7AKzPVopFAFgwABRmS8Q5ANgtADBJV2ZIALC3AMDOEAuyAAgMADBRiIUpAAR7AGDIIyN4AISZABRG8lc88SuuEOcqAAB4mbI8uSQ5RYFbCC1xB1dXLh4ozkkXKxQ2YQJhmkAuwnmZGTKBNA/g88wAAKCRFRHgg/P9eM4Ors7ONo62Dl8t6r8G/yJiYuP+5c+rcEAAAOF0ftH+LC+zGoA7BoBt/qIl7gRoXgugdfeLZrIPQLUAoOnaV/Nw+H48PEWhkLnZ2eXk5NhKxEJbYcpXff5nwl/AV/1s+X48/Pf14L7iJIEyXYFHBPjgwsz0TKUcz5IJhGLc5o9H/LcL//wd0yLESWK5WCoU41EScY5EmozzMqUiiUKSKcUl0v9k4t8s+wM+3zUAsGo+AXuRLahdYwP2SycQWHTA4vcAAPK7b8HUKAgDgGiD4c93/+8//UegJQCAZkmScQAAXkQkLlTKsz/HCAAARKCBKrBBG/TBGCzABhzBBdzBC/xgNoRCJMTCQhBCCmSAHHJgKayCQiiGzbAdKmAv1EAdNMBRaIaTcA4uwlW4Dj1wD/phCJ7BKLyBCQRByAgTYSHaiAFiilgjjggXmYX4IcFIBBKLJCDJiBRRIkuRNUgxUopUIFVIHfI9cgI5h1xGupE7yAAygvyGvEcxlIGyUT3UDLVDuag3GoRGogvQZHQxmo8WoJvQcrQaPYw2oefQq2gP2o8+Q8cwwOgYBzPEbDAuxsNCsTgsCZNjy7EirAyrxhqwVqwDu4n1Y8+xdwQSgUXACTYEd0IgYR5BSFhMWE7YSKggHCQ0EdoJNwkDhFHCJyKTqEu0JroR+cQYYjIxh1hILCPWEo8TLxB7iEPENyQSiUMyJ7mQAkmxpFTSEtJG0m5SI+ksqZs0SBojk8naZGuyBzmULCAryIXkneTD5DPkG+Qh8lsKnWJAcaT4U+IoUspqShnlEOU05QZlmDJBVaOaUt2ooVQRNY9aQq2htlKvUYeoEzR1mjnNgxZJS6WtopXTGmgXaPdpr+h0uhHdlR5Ol9BX0svpR+iX6AP0dwwNhhWDx4hnKBmbGAcYZxl3GK+YTKYZ04sZx1QwNzHrmOeZD5lvVVgqtip8FZHKCpVKlSaVGyovVKmqpqreqgtV81XLVI+pXlN9rkZVM1PjqQnUlqtVqp1Q61MbU2epO6iHqmeob1Q/pH5Z/YkGWcNMw09DpFGgsV/jvMYgC2MZs3gsIWsNq4Z1gTXEJrHN2Xx2KruY/R27iz2qqaE5QzNKM1ezUvOUZj8H45hx+Jx0TgnnKKeX836K3hTvKeIpG6Y0TLkxZVxrqpaXllirSKtRq0frvTau7aedpr1Fu1n7gQ5Bx0onXCdHZ4/OBZ3nU9lT3acKpxZNPTr1ri6qa6UbobtEd79up+6Ynr5egJ5Mb6feeb3n+hx9L/1U/W36p/VHDFgGswwkBtsMzhg8xTVxbzwdL8fb8VFDXcNAQ6VhlWGX4YSRudE8o9VGjUYPjGnGXOMk423GbcajJgYmISZLTepN7ppSTbmmKaY7TDtMx83MzaLN1pk1mz0x1zLnm+eb15vft2BaeFostqi2uGVJsuRaplnutrxuhVo5WaVYVVpds0atna0l1rutu6cRp7lOk06rntZnw7Dxtsm2qbcZsOXYBtuutm22fWFnYhdnt8Wuw+6TvZN9un2N/T0HDYfZDqsdWh1+c7RyFDpWOt6azpzuP33F9JbpL2dYzxDP2DPjthPLKcRpnVOb00dnF2e5c4PziIuJS4LLLpc+Lpsbxt3IveRKdPVxXeF60vWdm7Obwu2o26/uNu5p7ofcn8w0nymeWTNz0MPIQ+BR5dE/C5+VMGvfrH5PQ0+BZ7XnIy9jL5FXrdewt6V3qvdh7xc+9j5yn+M+4zw33jLeWV/MN8C3yLfLT8Nvnl+F30N/I/9k/3r/0QCngCUBZwOJgUGBWwL7+Hp8Ib+OPzrbZfay2e1BjKC5QRVBj4KtguXBrSFoyOyQrSH355jOkc5pDoVQfujW0Adh5mGLw34MJ4WHhVeGP45wiFga0TGXNXfR3ENz30T6RJZE3ptnMU85ry1KNSo+qi5qPNo3ujS6P8YuZlnM1VidWElsSxw5LiquNm5svt/87fOH4p3iC+N7F5gvyF1weaHOwvSFpxapLhIsOpZATIhOOJTwQRAqqBaMJfITdyWOCnnCHcJnIi/RNtGI2ENcKh5O8kgqTXqS7JG8NXkkxTOlLOW5hCepkLxMDUzdmzqeFpp2IG0yPTq9MYOSkZBxQqohTZO2Z+pn5mZ2y6xlhbL+xW6Lty8elQfJa7OQrAVZLQq2QqboVFoo1yoHsmdlV2a/zYnKOZarnivN7cyzytuQN5zvn//tEsIS4ZK2pYZLVy0dWOa9rGo5sjxxedsK4xUFK4ZWBqw8uIq2Km3VT6vtV5eufr0mek1rgV7ByoLBtQFr6wtVCuWFfevc1+1dT1gvWd+1YfqGnRs+FYmKrhTbF5cVf9go3HjlG4dvyr+Z3JS0qavEuWTPZtJm6ebeLZ5bDpaql+aXDm4N2dq0Dd9WtO319kXbL5fNKNu7g7ZDuaO/PLi8ZafJzs07P1SkVPRU+lQ27tLdtWHX+G7R7ht7vPY07NXbW7z3/T7JvttVAVVN1WbVZftJ+7P3P66Jqun4lvttXa1ObXHtxwPSA/0HIw6217nU1R3SPVRSj9Yr60cOxx++/p3vdy0NNg1VjZzG4iNwRHnk6fcJ3/ceDTradox7rOEH0x92HWcdL2pCmvKaRptTmvtbYlu6T8w+0dbq3nr8R9sfD5w0PFl5SvNUyWna6YLTk2fyz4ydlZ19fi753GDborZ752PO32oPb++6EHTh0kX/i+c7vDvOXPK4dPKy2+UTV7hXmq86X23qdOo8/pPTT8e7nLuarrlca7nuer21e2b36RueN87d9L158Rb/1tWeOT3dvfN6b/fF9/XfFt1+cif9zsu72Xcn7q28T7xf9EDtQdlD3YfVP1v+3Njv3H9qwHeg89HcR/cGhYPP/pH1jw9DBY+Zj8uGDYbrnjg+OTniP3L96fynQ89kzyaeF/6i/suuFxYvfvjV69fO0ZjRoZfyl5O/bXyl/erA6xmv28bCxh6+yXgzMV70VvvtwXfcdx3vo98PT+R8IH8o/2j5sfVT0Kf7kxmTk/8EA5jz/GMzLdsAAAAgY0hSTQAAeiUAAICDAAD5/wAAgOkAAHUwAADqYAAAOpgAABdvkl/FRgAAAI9JREFUeNqU0CGKAgEYhuHPYQ6gZY/hOSx6A9kL2BU8g2ewGCw2k8ET7EbBus0gGEUMj8FZGJFhZx/4y8+bvg7SoEiyS3JNMkySoOmmnn5+f03hGLcqPjTFH9h49VmPF1higLN3F3xhFNyxxcwfiiRl2jkVaW/9n3hVJNm3CI9JvoMSPXTRx6Sar77MHHkMAHka79HuaqejAAAAAElFTkSuQmCC";
    ytcenter.icon.smallThumbsDownWhite = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAALCAYAAACprHcmAAAACXBIWXMAAAsTAAALEwEAmpwYAAAKT2lDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjanVNnVFPpFj333vRCS4iAlEtvUhUIIFJCi4AUkSYqIQkQSoghodkVUcERRUUEG8igiAOOjoCMFVEsDIoK2AfkIaKOg6OIisr74Xuja9a89+bN/rXXPues852zzwfACAyWSDNRNYAMqUIeEeCDx8TG4eQuQIEKJHAAEAizZCFz/SMBAPh+PDwrIsAHvgABeNMLCADATZvAMByH/w/qQplcAYCEAcB0kThLCIAUAEB6jkKmAEBGAYCdmCZTAKAEAGDLY2LjAFAtAGAnf+bTAICd+Jl7AQBblCEVAaCRACATZYhEAGg7AKzPVopFAFgwABRmS8Q5ANgtADBJV2ZIALC3AMDOEAuyAAgMADBRiIUpAAR7AGDIIyN4AISZABRG8lc88SuuEOcqAAB4mbI8uSQ5RYFbCC1xB1dXLh4ozkkXKxQ2YQJhmkAuwnmZGTKBNA/g88wAAKCRFRHgg/P9eM4Ors7ONo62Dl8t6r8G/yJiYuP+5c+rcEAAAOF0ftH+LC+zGoA7BoBt/qIl7gRoXgugdfeLZrIPQLUAoOnaV/Nw+H48PEWhkLnZ2eXk5NhKxEJbYcpXff5nwl/AV/1s+X48/Pf14L7iJIEyXYFHBPjgwsz0TKUcz5IJhGLc5o9H/LcL//wd0yLESWK5WCoU41EScY5EmozzMqUiiUKSKcUl0v9k4t8s+wM+3zUAsGo+AXuRLahdYwP2SycQWHTA4vcAAPK7b8HUKAgDgGiD4c93/+8//UegJQCAZkmScQAAXkQkLlTKsz/HCAAARKCBKrBBG/TBGCzABhzBBdzBC/xgNoRCJMTCQhBCCmSAHHJgKayCQiiGzbAdKmAv1EAdNMBRaIaTcA4uwlW4Dj1wD/phCJ7BKLyBCQRByAgTYSHaiAFiilgjjggXmYX4IcFIBBKLJCDJiBRRIkuRNUgxUopUIFVIHfI9cgI5h1xGupE7yAAygvyGvEcxlIGyUT3UDLVDuag3GoRGogvQZHQxmo8WoJvQcrQaPYw2oefQq2gP2o8+Q8cwwOgYBzPEbDAuxsNCsTgsCZNjy7EirAyrxhqwVqwDu4n1Y8+xdwQSgUXACTYEd0IgYR5BSFhMWE7YSKggHCQ0EdoJNwkDhFHCJyKTqEu0JroR+cQYYjIxh1hILCPWEo8TLxB7iEPENyQSiUMyJ7mQAkmxpFTSEtJG0m5SI+ksqZs0SBojk8naZGuyBzmULCAryIXkneTD5DPkG+Qh8lsKnWJAcaT4U+IoUspqShnlEOU05QZlmDJBVaOaUt2ooVQRNY9aQq2htlKvUYeoEzR1mjnNgxZJS6WtopXTGmgXaPdpr+h0uhHdlR5Ol9BX0svpR+iX6AP0dwwNhhWDx4hnKBmbGAcYZxl3GK+YTKYZ04sZx1QwNzHrmOeZD5lvVVgqtip8FZHKCpVKlSaVGyovVKmqpqreqgtV81XLVI+pXlN9rkZVM1PjqQnUlqtVqp1Q61MbU2epO6iHqmeob1Q/pH5Z/YkGWcNMw09DpFGgsV/jvMYgC2MZs3gsIWsNq4Z1gTXEJrHN2Xx2KruY/R27iz2qqaE5QzNKM1ezUvOUZj8H45hx+Jx0TgnnKKeX836K3hTvKeIpG6Y0TLkxZVxrqpaXllirSKtRq0frvTau7aedpr1Fu1n7gQ5Bx0onXCdHZ4/OBZ3nU9lT3acKpxZNPTr1ri6qa6UbobtEd79up+6Ynr5egJ5Mb6feeb3n+hx9L/1U/W36p/VHDFgGswwkBtsMzhg8xTVxbzwdL8fb8VFDXcNAQ6VhlWGX4YSRudE8o9VGjUYPjGnGXOMk423GbcajJgYmISZLTepN7ppSTbmmKaY7TDtMx83MzaLN1pk1mz0x1zLnm+eb15vft2BaeFostqi2uGVJsuRaplnutrxuhVo5WaVYVVpds0atna0l1rutu6cRp7lOk06rntZnw7Dxtsm2qbcZsOXYBtuutm22fWFnYhdnt8Wuw+6TvZN9un2N/T0HDYfZDqsdWh1+c7RyFDpWOt6azpzuP33F9JbpL2dYzxDP2DPjthPLKcRpnVOb00dnF2e5c4PziIuJS4LLLpc+Lpsbxt3IveRKdPVxXeF60vWdm7Obwu2o26/uNu5p7ofcn8w0nymeWTNz0MPIQ+BR5dE/C5+VMGvfrH5PQ0+BZ7XnIy9jL5FXrdewt6V3qvdh7xc+9j5yn+M+4zw33jLeWV/MN8C3yLfLT8Nvnl+F30N/I/9k/3r/0QCngCUBZwOJgUGBWwL7+Hp8Ib+OPzrbZfay2e1BjKC5QRVBj4KtguXBrSFoyOyQrSH355jOkc5pDoVQfujW0Adh5mGLw34MJ4WHhVeGP45wiFga0TGXNXfR3ENz30T6RJZE3ptnMU85ry1KNSo+qi5qPNo3ujS6P8YuZlnM1VidWElsSxw5LiquNm5svt/87fOH4p3iC+N7F5gvyF1weaHOwvSFpxapLhIsOpZATIhOOJTwQRAqqBaMJfITdyWOCnnCHcJnIi/RNtGI2ENcKh5O8kgqTXqS7JG8NXkkxTOlLOW5hCepkLxMDUzdmzqeFpp2IG0yPTq9MYOSkZBxQqohTZO2Z+pn5mZ2y6xlhbL+xW6Lty8elQfJa7OQrAVZLQq2QqboVFoo1yoHsmdlV2a/zYnKOZarnivN7cyzytuQN5zvn//tEsIS4ZK2pYZLVy0dWOa9rGo5sjxxedsK4xUFK4ZWBqw8uIq2Km3VT6vtV5eufr0mek1rgV7ByoLBtQFr6wtVCuWFfevc1+1dT1gvWd+1YfqGnRs+FYmKrhTbF5cVf9go3HjlG4dvyr+Z3JS0qavEuWTPZtJm6ebeLZ5bDpaql+aXDm4N2dq0Dd9WtO319kXbL5fNKNu7g7ZDuaO/PLi8ZafJzs07P1SkVPRU+lQ27tLdtWHX+G7R7ht7vPY07NXbW7z3/T7JvttVAVVN1WbVZftJ+7P3P66Jqun4lvttXa1ObXHtxwPSA/0HIw6217nU1R3SPVRSj9Yr60cOxx++/p3vdy0NNg1VjZzG4iNwRHnk6fcJ3/ceDTradox7rOEH0x92HWcdL2pCmvKaRptTmvtbYlu6T8w+0dbq3nr8R9sfD5w0PFl5SvNUyWna6YLTk2fyz4ydlZ19fi753GDborZ752PO32oPb++6EHTh0kX/i+c7vDvOXPK4dPKy2+UTV7hXmq86X23qdOo8/pPTT8e7nLuarrlca7nuer21e2b36RueN87d9L158Rb/1tWeOT3dvfN6b/fF9/XfFt1+cif9zsu72Xcn7q28T7xf9EDtQdlD3YfVP1v+3Njv3H9qwHeg89HcR/cGhYPP/pH1jw9DBY+Zj8uGDYbrnjg+OTniP3L96fynQ89kzyaeF/6i/suuFxYvfvjV69fO0ZjRoZfyl5O/bXyl/erA6xmv28bCxh6+yXgzMV70VvvtwXfcdx3vo98PT+R8IH8o/2j5sfVT0Kf7kxmTk/8EA5jz/GMzLdsAAAAgY0hSTQAAeiUAAICDAAD5/wAAgOkAAHUwAADqYAAAOpgAABdvkl/FRgAAAJdJREFUeNqU0TEOQVEQQNHrRfM7GrEElUarUmi1CmIDehG7sI9fWYdEI+pfI9FKxNU88SQv8t12TjMzqKgbP13UUl2qfbWlttVmQwU4AT3yrYEhUARg8AOmjQIwo2YBmP6DuzXtIwATYA/cMuAKHIAzsCWeDnXhd6XaSeak+BjRXZ2nKIeriFc5qPJ+CsAOKIAx8Mxt+BoAwoajXC/DwUQAAAAASUVORK5CYII=";
    ytcenter.css = {
      general: "@styles-general@",
      resize: "@styles-resize@",
      topbar: "@styles-topbar@",
      flags: "@styles-flags@",
      html5player: "@styles-html5player@",
      gridSubscriptions: "@styles-grid-subscriptions@",
      images: "@styles-images@",
      dialog: "@styles-dialog@",
      scrollbar: "@styles-scrollbar@",
      list: "@styles-list@",
      confirmbox: "@styles-confirmbox@",
      panel: "@styles-panel@",
      resizePanel: "@styles-resize-panel@",
      modules: "@styles-modules@",
      settings: "@styles-settings@",
      centering: "@styles-centering@",
      embed: "@styles-embed@",
      player: "@styles-player@",
      darkside: "@styles-darkside@"
    };
    ytcenter.topScrollPlayer = (function(){
      function scroll(e) {
        if (!enabled) return;
        var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        var pa = document.getElementById("player-api") || document.getElementById("player-api-legacy"),
            p = document.getElementById("player") || document.getElementById("player-api"),
            api = ytcenter.player.getAPI(),
            scrollUpExit = ytcenter.settings.topScrollPlayerScrollUpToExit;
        if (document.getElementById("player")) {
          document.getElementById("player").style.position = "";
        }
        if (activated) {
          if ((scrollTop > 0 && !scrollUpExit) || (scrollTop === 0 && scrollUpExit)) {
            if (ytcenter.settings.topScrollPlayerTimesToExit > count) {
              __r.bumpCount();
              count++;
              ytcenter.utils.scrollTop(scrollUpExit ? 1 : 0);
              //window.scroll(0, (scrollUpExit ? 1 : 0));
            } else {
              ytcenter.utils.scrollTop(1);
              //window.scroll(0, 1);
              pa.style.top = "";
              p.style.height = "";
              ytcenter.utils.removeClass(document.body, "ytcenter-scrolled-inverse");
              ytcenter.utils.removeClass(document.body, "ytcenter-scrolled-top");
              ytcenter.utils.removeClass(document.body, "ytcenter-scrolled-top-noscrollbar");
              ytcenter.utils.addClass(document.body, "ytcenter-scrolled-top-static");
              uw.setTimeout(function(){
                ytcenter.utils.removeClass(document.body, "ytcenter-scrolled-top-static");
                ytcenter.utils.removeClass(document.body, "ytcenter-scrolled-top-disable-animation");
              }, 500);
              activated = false;
              count = 0;
              __r.stopTimer();
            }
          } else if (scrollUpExit) {
            ytcenter.utils.scrollTop(1);
            //window.scroll(0, 1);
          }
        } else {
          if (scrollTop === 0) {
            if (ytcenter.settings.topScrollPlayerTimesToEnter > count) {
              __r.bumpCount();
              count++;
              ytcenter.utils.scrollTop(1)
              //window.scroll(0, 1);
            } else {
              if (ytcenter.settings.topScrollPlayerEnabledOnlyVideoPlaying && (!api || !api.getPlayerState || api.getPlayerState() !== 1)) {
                ytcenter.utils.scrollTop(1);
                //window.scroll(0, 1);
                return;
              }
              ytcenter.utils.scrollTop(scrollUpExit ? 1 : 0);
              //window.scroll(0, (scrollUpExit ? 1 : 0));
              p.style.height = pa.style.height;
              if (!ytcenter.settings.topScrollPlayerAnimation)
                ytcenter.utils.addClass(document.body, "ytcenter-scrolled-top-disable-animation");
              ytcenter.utils.addClass(document.body, "ytcenter-scrolled-top-player-pre");
              if (scrollUpExit) ytcenter.utils.addClass(document.body, "ytcenter-scrolled-inverse");
              uw.setTimeout(function(){
                ytcenter.utils.addClass(document.body, "ytcenter-scrolled-top");
                if (ytcenter.settings.topScrollPlayerHideScrollbar) {
                  ytcenter.utils.addClass(document.body, "ytcenter-scrolled-top-noscrollbar");
                } else {
                  ytcenter.utils.removeClass(document.body, "ytcenter-scrolled-top-noscrollbar");
                }
                ytcenter.utils.removeClass(document.body, "ytcenter-scrolled-top-player-pre");
              }, 0);
              activated = true;
              count = 0;
              __r.stopTimer();
            }
          } else if (scrollTop === 1 && ytcenter.settings.topScrollPlayerCountIncreaseBefore) {
            __r.bumpCount();
            count++;
          }
        }
      }
      var __r = {},
          count = 0,
          activated,
          enabled = null,
          elm = null,
          timer = null,
          buffer = null,
          throttleTimer = 50,
          throttleFunc = null,
          prev = null;
      
      __r.setEnabled = function(a){
        var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        enabled = a;
        if (enabled && ytcenter.getPage() !== "watch") enabled = false;
        if (throttleFunc) ytcenter.utils.removeEventListener(window, "scroll", throttleFunc, false);
        throttleFunc = null;
        if (!enabled) {
          if (elm && elm.parentNode) elm.parentNode.removeChild(elm);
          ytcenter.utils.removeClass(document.body, "ytcenter-scrolled-top");
          ytcenter.utils.removeClass(document.body, "ytcenter-scrolled-inverse");
          ytcenter.utils.removeClass(document.body, "ytcenter-scrolled-top-noscrollbar");
          ytcenter.utils.removeClass(document.body, "ytcenter-scrolled-top-player-pre");
          ytcenter.utils.removeClass(document.body, "ytcenter-scrolled-top-disable-animation");
        } else {
          throttleFunc = ytcenter.utils.throttle(scroll, throttleTimer);
          ytcenter.utils.addEventListener(window, "scroll", throttleFunc, false);
          if (elm) {
            if (!elm.parentNode) {
              document.body.insertBefore(elm, document.body.children[0]);
            }
          } else {
            elm = document.createElement("div");
            elm.className = "ytcenter-scrolled-top-element";
            document.body.insertBefore(elm, document.body.children[0]);
          }
          if (scrollTop === 0) ytcenter.utils.scrollTop(1);
          //if (scrollTop === 0) window.scroll(0, 1);
        }
      };
      __r.bumpCount = function(){
        uw.clearTimeout(timer);
        timer = uw.setTimeout(function(){
          count = 0;
        }, ytcenter.settings.topScrollPlayerBumpTimer);
      };
      __r.stopTimer = function(){
        uw.clearTimeout(timer);
      };
      __r.setup = function(){
        if (!elm || elm.parentNode !== document.body) {
          if (elm && elm.parentNode) elm.parentNode.removeChild(elm);
          elm = document.createElement("div");
          elm.className = "ytcenter-scrolled-top-element";
          if (ytcenter.settings.topScrollPlayerEnabled) document.body.insertBefore(elm, document.body.children[0]);
        }
        enabled = ytcenter.settings.topScrollPlayerEnabled;
        activated = ytcenter.settings.topScrollPlayerActivated;
        if (throttleFunc) ytcenter.utils.removeEventListener(window, "scroll", throttleFunc, false);
        if (enabled) {
          if (ytcenter.settings.topScrollPlayerEnabled && ytcenter.getPage() === "watch") {
            if (activated) {
              if (!ytcenter.settings.topScrollPlayerAnimation)
                ytcenter.utils.addClass(document.body, "ytcenter-scrolled-top-disable-animation");
              if (ytcenter.settings.topScrollPlayerScrollUpToExit) ytcenter.utils.addClass(document.body, "ytcenter-scrolled-inverse");
              ytcenter.utils.addClass(document.body, "ytcenter-scrolled-top");
              if (ytcenter.settings.topScrollPlayerHideScrollbar) {
                ytcenter.utils.addClass(document.body, "ytcenter-scrolled-top-noscrollbar");
              } else {
                ytcenter.utils.removeClass(document.body, "ytcenter-scrolled-top-noscrollbar");
              }
              ytcenter.utils.scrollTop(ytcenter.settings.topScrollPlayerScrollUpToExit ? 1 : 0);
              //window.scroll(0, (ytcenter.settings.topScrollPlayerScrollUpToExit ? 1 : 0));
            } else {
              ytcenter.utils.removeClass(document.body, "ytcenter-scrolled-top");
              ytcenter.utils.removeClass(document.body, "ytcenter-scrolled-top-noscrollbar");
              ytcenter.utils.removeClass(document.body, "ytcenter-scrolled-top-disable-animation");
              ytcenter.utils.scrollTop(1);
              //window.scroll(0, 1);
            }
            throttleFunc = ytcenter.utils.throttle(scroll, throttleTimer);
            ytcenter.utils.addEventListener(window, "scroll", throttleFunc, false);
          }
          if (document.getElementById("player")) {
            document.getElementById("player").style.position = "";
          }
        }
        __r.setEnabled(ytcenter.settings.topScrollPlayerEnabled);
        ytcenter.events.addEvent("settings-update", function(){
          __r.setEnabled(ytcenter.settings.topScrollPlayerEnabled);
          if (enabled) {
            if (document.getElementById("player")) {
              document.getElementById("player").style.position = "";
            }
          }
        });
        ytcenter.events.addEvent("resize-update", function(){
          __r.setEnabled(ytcenter.settings.topScrollPlayerEnabled);
          if (enabled) {
            if (document.getElementById("player")) {
              document.getElementById("player").style.position = "";
            }
          }
        });
      };
      
      return __r;
    })();
    ytcenter.flags = {
      /* Country Code : CSS Class */
      "ad": "ytcenter-flag-ad",
      "ae": "ytcenter-flag-ae",
      "af": "ytcenter-flag-af",
      "ag": "ytcenter-flag-ag",
      "ai": "ytcenter-flag-ai",
      "al": "ytcenter-flag-al",
      "am": "ytcenter-flag-am",
      "an": "ytcenter-flag-an",
      "ao": "ytcenter-flag-ao",
      "aq": "ytcenter-flag-aq",
      "ar": "ytcenter-flag-ar",
      "as": "ytcenter-flag-as",
      "at": "ytcenter-flag-at",
      "au": "ytcenter-flag-au",
      "aw": "ytcenter-flag-aw",
      "ax": "ytcenter-flag-ax",
      "az": "ytcenter-flag-az",
      "ba": "ytcenter-flag-ba",
      "bb": "ytcenter-flag-bb",
      "bd": "ytcenter-flag-bd",
      "be": "ytcenter-flag-be",
      "bf": "ytcenter-flag-bf",
      "bg": "ytcenter-flag-bg",
      "bh": "ytcenter-flag-bh",
      "bi": "ytcenter-flag-bi",
      "bj": "ytcenter-flag-bj",
      "bm": "ytcenter-flag-bm",
      "bn": "ytcenter-flag-bn",
      "bo": "ytcenter-flag-bo",
      "br": "ytcenter-flag-br",
      "bs": "ytcenter-flag-bs",
      "bt": "ytcenter-flag-bt",
      "bv": "ytcenter-flag-bv",
      "bw": "ytcenter-flag-bw",
      "by": "ytcenter-flag-by",
      "bz": "ytcenter-flag-bz",
      "ca": "ytcenter-flag-ca",
      "catalonia": "ytcenter-flag-catalonia",
      "cc": "ytcenter-flag-cc",
      "cd": "ytcenter-flag-cd",
      "cf": "ytcenter-flag-cf",
      "cg": "ytcenter-flag-cg",
      "ch": "ytcenter-flag-ch",
      "ci": "ytcenter-flag-ci",
      "ck": "ytcenter-flag-ck",
      "cl": "ytcenter-flag-cl",
      "cm": "ytcenter-flag-cm",
      "cn": "ytcenter-flag-cn",
      "co": "ytcenter-flag-co",
      "cr": "ytcenter-flag-cr",
      "cs": "ytcenter-flag-cs",
      "cu": "ytcenter-flag-cu",
      "cv": "ytcenter-flag-cv",
      "cx": "ytcenter-flag-cx",
      "cy": "ytcenter-flag-cy",
      "cz": "ytcenter-flag-cz",
      "de": "ytcenter-flag-de",
      "dj": "ytcenter-flag-dj",
      "dk": "ytcenter-flag-dk",
      "dm": "ytcenter-flag-dm",
      "do": "ytcenter-flag-do",
      "dz": "ytcenter-flag-dz",
      "ec": "ytcenter-flag-ec",
      "ee": "ytcenter-flag-ee",
      "eg": "ytcenter-flag-eg",
      "eh": "ytcenter-flag-eh",
      "england": "ytcenter-flag-england",
      "er": "ytcenter-flag-er",
      "es": "ytcenter-flag-es",
      "et": "ytcenter-flag-et",
      "europeanunion": "ytcenter-flag-europeanunion",
      "fam": "ytcenter-flag-fam",
      "fi": "ytcenter-flag-fi",
      "fj": "ytcenter-flag-fj",
      "fk": "ytcenter-flag-fk",
      "fm": "ytcenter-flag-fm",
      "fo": "ytcenter-flag-fo",
      "fr": "ytcenter-flag-fr",
      "ga": "ytcenter-flag-ga",
      "gb": "ytcenter-flag-gb",
      "gd": "ytcenter-flag-gd",
      "ge": "ytcenter-flag-ge",
      "gf": "ytcenter-flag-gf",
      "gh": "ytcenter-flag-gh",
      "gi": "ytcenter-flag-gi",
      "gl": "ytcenter-flag-gl",
      "gm": "ytcenter-flag-gm",
      "gn": "ytcenter-flag-gn",
      "gp": "ytcenter-flag-gp",
      "gq": "ytcenter-flag-gq",
      "gr": "ytcenter-flag-gr",
      "gs": "ytcenter-flag-gs",
      "gt": "ytcenter-flag-gt",
      "gu": "ytcenter-flag-gu",
      "gw": "ytcenter-flag-gw",
      "gy": "ytcenter-flag-gy",
      "hk": "ytcenter-flag-hk",
      "hm": "ytcenter-flag-hm",
      "hn": "ytcenter-flag-hn",
      "hr": "ytcenter-flag-hr",
      "ht": "ytcenter-flag-ht",
      "hu": "ytcenter-flag-hu",
      "id": "ytcenter-flag-id",
      "ie": "ytcenter-flag-ie",
      "il": "ytcenter-flag-il",
      "in": "ytcenter-flag-in",
      "io": "ytcenter-flag-io",
      "iq": "ytcenter-flag-iq",
      "ir": "ytcenter-flag-ir",
      "is": "ytcenter-flag-is",
      "it": "ytcenter-flag-it",
      "jm": "ytcenter-flag-jm",
      "jo": "ytcenter-flag-jo",
      "jp": "ytcenter-flag-jp",
      "ke": "ytcenter-flag-ke",
      "kg": "ytcenter-flag-kg",
      "kh": "ytcenter-flag-kh",
      "ki": "ytcenter-flag-ki",
      "km": "ytcenter-flag-km",
      "kn": "ytcenter-flag-kn",
      "kp": "ytcenter-flag-kp",
      "kr": "ytcenter-flag-kr",
      "kw": "ytcenter-flag-kw",
      "ky": "ytcenter-flag-ky",
      "kz": "ytcenter-flag-kz",
      "la": "ytcenter-flag-la",
      "lb": "ytcenter-flag-lb",
      "lc": "ytcenter-flag-lc",
      "li": "ytcenter-flag-li",
      "lk": "ytcenter-flag-lk",
      "lr": "ytcenter-flag-lr",
      "ls": "ytcenter-flag-ls",
      "lt": "ytcenter-flag-lt",
      "lu": "ytcenter-flag-lu",
      "lv": "ytcenter-flag-lv",
      "ly": "ytcenter-flag-ly",
      "ma": "ytcenter-flag-ma",
      "mc": "ytcenter-flag-mc",
      "md": "ytcenter-flag-md",
      "me": "ytcenter-flag-me",
      "mg": "ytcenter-flag-mg",
      "mh": "ytcenter-flag-mh",
      "mk": "ytcenter-flag-mk",
      "ml": "ytcenter-flag-ml",
      "mm": "ytcenter-flag-mm",
      "mn": "ytcenter-flag-mn",
      "mo": "ytcenter-flag-mo",
      "mp": "ytcenter-flag-mp",
      "mq": "ytcenter-flag-mq",
      "mr": "ytcenter-flag-mr",
      "ms": "ytcenter-flag-ms",
      "mt": "ytcenter-flag-mt",
      "mu": "ytcenter-flag-mu",
      "mv": "ytcenter-flag-mv",
      "mw": "ytcenter-flag-mw",
      "mx": "ytcenter-flag-mx",
      "my": "ytcenter-flag-my",
      "mz": "ytcenter-flag-mz",
      "na": "ytcenter-flag-na",
      "nc": "ytcenter-flag-nc",
      "ne": "ytcenter-flag-ne",
      "nf": "ytcenter-flag-nf",
      "ng": "ytcenter-flag-ng",
      "ni": "ytcenter-flag-ni",
      "nl": "ytcenter-flag-nl",
      "no": "ytcenter-flag-no",
      "np": "ytcenter-flag-np",
      "nr": "ytcenter-flag-nr",
      "nu": "ytcenter-flag-nu",
      "nz": "ytcenter-flag-nz",
      "om": "ytcenter-flag-om",
      "pa": "ytcenter-flag-pa",
      "pe": "ytcenter-flag-pe",
      "pf": "ytcenter-flag-pf",
      "pg": "ytcenter-flag-pg",
      "ph": "ytcenter-flag-ph",
      "pk": "ytcenter-flag-pk",
      "pl": "ytcenter-flag-pl",
      "pm": "ytcenter-flag-pm",
      "pn": "ytcenter-flag-pn",
      "pr": "ytcenter-flag-pr",
      "ps": "ytcenter-flag-ps",
      "pt": "ytcenter-flag-pt",
      "pw": "ytcenter-flag-pw",
      "py": "ytcenter-flag-py",
      "qa": "ytcenter-flag-qa",
      "re": "ytcenter-flag-re",
      "ro": "ytcenter-flag-ro",
      "rs": "ytcenter-flag-rs",
      "ru": "ytcenter-flag-ru",
      "rw": "ytcenter-flag-rw",
      "sa": "ytcenter-flag-sa",
      "sb": "ytcenter-flag-sb",
      "sc": "ytcenter-flag-sc",
      "scotland": "ytcenter-flag-scotland",
      "sd": "ytcenter-flag-sd",
      "se": "ytcenter-flag-se",
      "sg": "ytcenter-flag-sg",
      "sh": "ytcenter-flag-sh",
      "si": "ytcenter-flag-si",
      "sj": "ytcenter-flag-sj",
      "sk": "ytcenter-flag-sk",
      "sl": "ytcenter-flag-sl",
      "sm": "ytcenter-flag-sm",
      "sn": "ytcenter-flag-sn",
      "so": "ytcenter-flag-so",
      "sr": "ytcenter-flag-sr",
      "st": "ytcenter-flag-st",
      "sv": "ytcenter-flag-sv",
      "sy": "ytcenter-flag-sy",
      "sz": "ytcenter-flag-sz",
      "tc": "ytcenter-flag-tc",
      "td": "ytcenter-flag-td",
      "tf": "ytcenter-flag-tf",
      "tg": "ytcenter-flag-tg",
      "th": "ytcenter-flag-th",
      "tj": "ytcenter-flag-tj",
      "tk": "ytcenter-flag-tk",
      "tl": "ytcenter-flag-tl",
      "tm": "ytcenter-flag-tm",
      "tn": "ytcenter-flag-tn",
      "to": "ytcenter-flag-to",
      "tr": "ytcenter-flag-tr",
      "tt": "ytcenter-flag-tt",
      "tv": "ytcenter-flag-tv",
      "tw": "ytcenter-flag-tw",
      "tz": "ytcenter-flag-tz",
      "ua": "ytcenter-flag-ua",
      "ug": "ytcenter-flag-ug",
      "um": "ytcenter-flag-um",
      "us": "ytcenter-flag-us",
      "uy": "ytcenter-flag-uy",
      "uz": "ytcenter-flag-uz",
      "va": "ytcenter-flag-va",
      "vc": "ytcenter-flag-vc",
      "ve": "ytcenter-flag-ve",
      "vg": "ytcenter-flag-vg",
      "vi": "ytcenter-flag-vi",
      "vn": "ytcenter-flag-vn",
      "vu": "ytcenter-flag-vu",
      "wales": "ytcenter-flag-wales",
      "wf": "ytcenter-flag-wf",
      "ws": "ytcenter-flag-ws",
      "ye": "ytcenter-flag-ye",
      "yt": "ytcenter-flag-yt",
      "za": "ytcenter-flag-za",
      "zm": "ytcenter-flag-zm",
      "zw": "ytcenter-flag-zw"
    };
    ytcenter.videoHistory = (function(){
      var __r = {};
      __r.watchedVideos = [];
      __r.loadWatchedVideosFromYouTubePage = function(){
        var a = document.getElementsByClassName("watched"), i, b;
        for (i = 0; i < a.length; i++) {
          if (a[i].tagName === "A") {
            b = ytcenter.utils.getVideoIdFromLink(a[i].getAttribute("href"));
            if (b && !ytcenter.utils.inArray(__r.watchedVideos, b)) __r.watchedVideos.push(b);
          }
        }
      };
      __r.isVideoWatched = function(id){
        if (ytcenter.utils.inArray(ytcenter.settings.notwatchedVideos, id)) return false;
        if (ytcenter.utils.inArray(ytcenter.settings.watchedVideos, id) || ytcenter.utils.inArray(__r.watchedVideos, id)) return true;
        return false;
      };
      __r.removeVideo = function(id){
        var i = ytcenter.utils.inArrayIndex(ytcenter.settings.watchedVideos, id);
        if (i !== -1) {
          ytcenter.settings.watchedVideos.splice(i, 1);
        }
        if (!ytcenter.utils.inArray(ytcenter.settings.notwatchedVideos, id)) {
          if (ytcenter.settings.notwatchedVideosLimit < ytcenter.settings.notwatchedVideos.length) {
            ytcenter.settings.notwatchedVideos.splice(0, ytcenter.settings.notwatchedVideos.length - ytcenter.settings.notwatchedVideosLimit);
          }
          ytcenter.settings.notwatchedVideos.push(id);
        }
        ytcenter.saveSettings();
      };
      __r.addVideo = function(id){
        var i = ytcenter.utils.inArrayIndex(ytcenter.settings.notwatchedVideos, id);
        if (i !== -1) {
          ytcenter.settings.notwatchedVideos.splice(i, 1);
        }
        if (!ytcenter.utils.inArray(ytcenter.settings.watchedVideos, id)) {
          if (ytcenter.settings.watchedVideosLimit < ytcenter.settings.watchedVideos.length) {
            ytcenter.settings.watchedVideos.splice(0, ytcenter.settings.watchedVideos.length - ytcenter.settings.watchedVideosLimit);
          }
          ytcenter.settings.watchedVideos.push(id);
        }
        ytcenter.saveSettings();
      };
      
      return __r;
    })();
    ytcenter.subtitles = (function(){
      /**
        ytcenter.subtitles.getLanguageList(VIDEO_ID, function(doc){
          var l = ytcenter.subtitles.parseLanguageList(doc)[0], // Just selecting the first subtitle in the list.
              filename;
          if (typeof l.name === "string" && l.name !== "") filename = "[" + l.languageCode + "]" + l.name; // Generating filename
          else filename = l.languageCode; // Using language code as filename
          ytcenter.subtitles.getSubtitleLanguage(VIDEO_ID, l.name, l.languageCode, null, function(cc){ // Getting the selected subtitle
            cc = ytcenter.subtitles.parseSubtitle(cc); // Parsing the selected subtitle to JSON.
            ytcenter.subtitles.saveSubtitle(cc, "srt", filename); // Downloading the subtitle as srt with generated filename.
          });
        });
       **/
      var a = {};
      
      a.saveSubtitle = function(cc, type, filename){
        if (typeof type !== "string") type = "srt";
        var blob;
        if (type === "srt") {
          blob = new ytcenter.unsafe.io.Blob([ytcenter.subtitles.convertToSRT(cc)], { "type": "application/octet-stream" });
          ytcenter.unsafe.io.saveAs(blob, filename + ".srt");
        } else if (type === "cc") {
          
        } else {
          throw new Error("[Subtitles saveSubtitle] Invalid type (" + type + ")!");
        }
      };
      
      a.parseLanguageList = function(doc){
        if (!doc.children || doc.children.length <= 0 || doc.children[0].tagName !== "transcript_list") throw new Error("[Subtitles] Invalid language list!");
        var tl = doc.children[0].children,
            i, a = [];
        for (i = 0; i < tl.length; i++) {
          a.push({
            type: tl[i].tagName,
            languageCode: tl[i].getAttribute("lang_code") || "",
            displayedLanguageName: tl[i].getAttribute("lang_translated") || "",
            name: tl[i].getAttribute("name") || "",
            kind: tl[i].getAttribute("kind") || "",
            id: tl[i].getAttribute("id") || "",
            isDefault: tl[i].getAttribute("lang_default") || false,
            isTranslateable: tl[i].getAttribute("cantran") || false,
            formatList: (tl[i].getAttribute("formats") || "").split(",")
          });
        }
        return a;
      };
      
      a.parseSubtitle = function(doc){
        if (!doc.children || doc.children.length <= 0 || doc.children[0].tagName !== "transcript") throw new Error("[Subtitles] Invalid transcript (" + doc.children[0].tagName + ")!");
        var tl = doc.children[0].children,
            i, a = [], start, dur;
        for (i = 0; i < tl.length; i++) {
          if (tl[i].tagName === "text") {
            start = parseFloat(tl[i].getAttribute("start"));
            dur = parseFloat(tl[i].getAttribute("dur"));
            a.push({
              start: start,
              dur: dur,
              end: start + dur,
              text: ytcenter.utils.unescapeHTML(tl[i].textContent)
            });
          } else {
            con.warn("[Subtitles parseSubtitle] Invalid tag name (" + tl[i].tagName + ")!");
          }
        }
        return a;
      };
      a.convertToSRT = function(cc){
        var srt = "", i;
        
        for (i = 0; i < cc.length; i++) {
          srt += (i + 1) + "\r\n"
                + ytcenter.utils.srtTimeFormat(cc[i].start) + " --> " + ytcenter.utils.srtTimeFormat(cc[i].end) + "\r\n"
                + cc[i].text + "\r\n"
                + "\r\n";
        }
        
        return srt;
      };
      
      a.getLanguageList = function(videoId, callback, error){
        $XMLHTTPRequest({
          url: "http://video.google.com/timedtext?type=list&v=" + encodeURIComponent(videoId),
          method: "GET",
          onload: function(response){
            var doc = ytcenter.utils.parseXML(response.responseText);
            if (callback) callback(doc);
          },
          onerror: function(){
            con.error("[Subtitles] Couldn't load subtitle list for video (" + videoId + ")");
            if (error) error();
          }
        });
      };
      a.getTranslatedLanguageList = function(videoId, callback, error){
        $XMLHTTPRequest({
          url: "http://video.google.com/timedtext?type=list&tlangs=1&v=" + encodeURIComponent(videoId),
          method: "GET",
          onload: function(response){
            var doc = ytcenter.utils.parseXML(response.responseText);
            if (callback) callback(doc);
          },
          onerror: function(){
            con.error("[Subtitles] Couldn't load subtitle list for video (" + videoId + ")");
            if (error) error();
          }
        });
      };
      a.getSubtitleLanguage = function(videoId, langName, langCode, translateLang, callback, error){
        $XMLHTTPRequest({
          url: "http://video.google.com/timedtext?type=track&v=" + encodeURIComponent(videoId)
               + (langName ? "&name=" + encodeURIComponent(langName) : "")
               + (langCode ? "&lang=" + encodeURIComponent(langCode) : "")
               + (translateLang ? "&tlang=" + encodeURIComponent(translateLang) : ""),
          method: "GET",
          onload: function(response){
            var doc = ytcenter.utils.parseXML(response.responseText);
            if (callback) callback(doc);
          },
          onerror: function(){
            con.error("[Subtitles] Couldn't load subtitle list for video (" + videoId + ")");
            if (error) error();
          }
        });
      };
      
      return a;
    })();
    ytcenter.commentsPlus = (function(){
      var __r = {}, comments = [], observer = null;
      
      ytcenter.unload(function(){
        if (observer) {
          observer.disconnect();
        }
      });
      __r.filters = {};
      __r.filters.repeat = function(condition, obj){
        return (new RegExp("(.)\\1{" + parseInt(condition.amount, 10) + ",}")).test(obj.contentElement.textContent);
      };
      __r.filters.biggerThan = function(condition, obj){
        var len = obj.contentElement.textContent.length;
        if (len < parseInt(condition.length, 10))
          return true;
        return false;
      };
      __r.filters.smallerThan = function(condition, obj){
        var len = obj.contentElement.textContent.length;
        if (len > parseInt(condition.length, 10))
          return true;
        return false;
      };
      __r.filters.equals = function(condition, obj){
        var len = obj.contentElement.textContent.length;
        if (len === parseInt(condition.length, 10))
          return true;
        return false;
      };
      __r.filters.text = function(condition, obj){
        var regex = new RegExp(ytcenter.utils.replaceTextToText(condition.regex, {
          "${username}": ytcenter.utils.escapeRegExp(obj.username),
          "${textContent}": ytcenter.utils.escapeRegExp(obj.textContent),
          "${isReply}": ytcenter.utils.escapeRegExp(obj.isReply ? "1" : "0")
        }));
        return regex.test(obj.contentElement.textContent);
      };
      __r.filters.links = function(condition, obj){
        var regex, regexString = ytcenter.utils.replaceTextToText(condition.regex, {
              "${username}": ytcenter.utils.escapeRegExp(obj.username),
              "${textContent}": ytcenter.utils.escapeRegExp(obj.textContent),
              "${isReply}": ytcenter.utils.escapeRegExp(obj.isReply ? "1" : "0")
            }), attr = condition.attr || "href", links = obj.contentElement.getElementsByTagName("a"), i;
        for (i = 0; i < links.length; i++) {
          regex = new RegExp(ytcenter.utils.replaceTextToText(regexString, { "${linkContent}": links[i].textContent }));
          if (ytcenter.utils.hasClass(links[i], "ot-anchor") && regex.test(links[i][attr]))
            return true;
        }
        return false;
      };
      __r.filters.profilelinks = function(condition, obj){
        var regex, regexString = ytcenter.utils.replaceTextToText(condition.regex, {
              "${username}": ytcenter.utils.escapeRegExp(obj.username),
              "${textContent}": ytcenter.utils.escapeRegExp(obj.textContent),
              "${isReply}": ytcenter.utils.escapeRegExp(obj.isReply ? "1" : "0")
            }), attr = condition.attr || "href",
            links = obj.contentElement.getElementsByTagName("a"), i;
        for (i = 0; i < links.length; i++) {
          regex = new RegExp(ytcenter.utils.replaceTextToText(regexString, { "${linkContent}": links[i].textContent }));
          if (ytcenter.utils.hasClass(links[i], "proflink") && regex.test(links[i][attr]))
            return true;
        }
        return false;
      };
      __r.filters.hashlinks = function(condition, obj){
        var regex, regexString = ytcenter.utils.replaceTextToText(condition.regex, {
              "${username}": ytcenter.utils.escapeRegExp(obj.username),
              "${textContent}": ytcenter.utils.escapeRegExp(obj.textContent),
              "${isReply}": ytcenter.utils.escapeRegExp(obj.isReply ? "1" : "0")
            }), attr = condition.attr || "href",
            links = obj.contentElement.getElementsByTagName("a"), i;
        for (i = 0; i < links.length; i++) {
          regex = new RegExp(ytcenter.utils.replaceTextToText(regexString, { "${linkContent}": links[i].textContent }));
          if (ytcenter.utils.hasClass(links[i], "ot-hashtag") && regex.test(links[i][attr]))
            return true;
        }
        return false;
      };
      __r.filters.username = function(condition, obj){
        var regex = new RegExp(ytcenter.utils.replaceTextToText(condition.regex, {
              "${username}": ytcenter.utils.escapeRegExp(obj.username),
              "${textContent}": ytcenter.utils.escapeRegExp(obj.textContent),
              "${isReply}": ytcenter.utils.escapeRegExp(obj.isReply ? "1" : "0")
            })), img = obj.wrapper.getElementsByTagName("img")[0];
        if (regex.test(img.getAttribute("title")))
          return true;
        return false;
      };
      
      __r.testFilters = function(list, obj){
        var i;
        for (i = 0; i < list.length; i++) {
          if (list[i].type in __r.filters) {
            if (__r.filters[list[i].type](list[i], obj))
              return true;
          }
        }
        return false;
      };
      __r.__commentInfoIdNext = 0;
      __r.getCommentObjectByWrapper = function(wrapper){
        var i;
        for (i = 0; i < __r.comments.length; i++) {
          if (__r.comments[i].wrapper === wrapper) return __r.comments[i];
        }
        return null;
      };
      __r.getCommentObject = function(contentElement){
        var commentInfo = {}, tmp;
        commentInfo.id = __r.__commentInfoIdNext;
        __r.__commentInfoIdNext += 1;
        
        commentInfo.inDOM = true;
        commentInfo.contentElement = contentElement;
        commentInfo.textContent = contentElement.textContent;
        commentInfo.shared = commentInfo.textContent === "";
        commentInfo.children = ytcenter.utils.toArray(contentElement.childNodes); // We don't want the array to change
        
        commentInfo.isReply = contentElement.parentNode.className.indexOf("Pm") === -1;
        
        if (commentInfo.isReply) {
          commentInfo.wrapper = contentElement.parentNode.parentNode.parentNode;
          commentInfo.parentId = __r.getCommentObjectByWrapper(commentInfo.wrapper.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.firstChild).id;
        } else {
          commentInfo.wrapper = contentElement.parentNode.parentNode.parentNode.parentNode.parentNode;
          commentInfo.parentId = -1;
        }
        
        commentInfo.username = commentInfo.wrapper.getElementsByTagName("img")[0].getAttribute("title");
        commentInfo.profileRedirectURL = commentInfo.wrapper.getElementsByTagName("img")[0].parentNode.href;
        
        if (commentInfo.profileRedirectURL.indexOf("youtube.com/profile_redirector/") !== -1) {
          commentInfo.profileRedirectId = commentInfo.profileRedirectURL.split("youtube.com/profile_redirector/")[1];
          commentInfo.channelRedirectId = null;
        } else if (commentInfo.profileRedirectURL.indexOf("youtube.com/channel/") !== -1) {
          commentInfo.channelRedirectId = commentInfo.profileRedirectURL.split("youtube.com/channel/")[1];
          commentInfo.profileRedirectId = null;
        } else if (commentInfo.profileRedirectURL.indexOf("youtube.com/user/") !== -1) {
          commentInfo.channelRedirectId = commentInfo.profileRedirectURL.split("youtube.com/user/")[1];
          commentInfo.profileRedirectId = null;
        } else {
          commentInfo.profileRedirectId = null;
          commentInfo.channelRedirectId = null;
        }
        
        if (commentInfo.isReply) {
          commentInfo.headerElement = commentInfo.wrapper.getElementsByClassName("fR")[0];
        } else {
          commentInfo.headerElement = commentInfo.wrapper.getElementsByClassName("Mpa")[0];
        }
        
        if (commentInfo.isReply) {
          commentInfo.headerUserDataElement = commentInfo.wrapper.getElementsByClassName("fR")[0];
        } else {
          commentInfo.headerUserDataElement = commentInfo.wrapper.getElementsByClassName("Mpa")[0].parentNode;
        }
        
        if (commentInfo.isReply) {
          commentInfo.viaGooglePlus = commentInfo.headerElement.children.length === 3 ? false : true;
        } else {
          commentInfo.viaGooglePlus = commentInfo.headerElement.children.length === 1 ? false : true;
        }
        
        commentInfo.country = ytcenter.cache.getItem("profile_country", commentInfo.profileRedirectId || commentInfo.channelRedirectId);
        
        if (commentInfo.country) commentInfo.country = commentInfo.country.data;
        else commentInfo.country = null;
        
        return commentInfo;
      };
      __r.comments = [];
      __r.commentLoaded = function(contentElement){
        var i;
        for (i = 0; i < __r.comments.length; i++) {
          if (__r.comments[i].contentElement === contentElement)
            return true;
        }
        return false;
      };
      __r.loadComments = function(){
        var a = document.getElementsByClassName("Ct"), i;
        for (i = 0; i < a.length; i++) {
          if (ytcenter.utils.hasClass(a[i], "ytcenter-comments-loaded") || __r.commentLoaded(a[i])) continue;
          __r.comments.push(__r.getCommentObject(a[i]));
        }
      };
      __r.filter = function(){
        var i, obj, blockedElement;
        for (i = 0; i < __r.comments.length; i++) {
          if (ytcenter.utils.hasClass(__r.comments[i].contentElement, "ytcenter-comments-loaded")) continue;
          __r.comments[i].contentElement.className += " ytcenter-comments-loaded";
          obj = __r.comments[i];
          
          if (__r.testFilters(ytcenter.settings.commentsPlusWhitelist, obj))
            continue;
          
          /* Blacklist */
          if (__r.testFilters(ytcenter.settings.commentsPlusBlacklist, obj)) {
            blockedElement = document.createElement("div");
            
            blockedElement.textContent = "Comment Blocked by YouTube Center!"; // This is only temporary
            /*blockedElement.addEventListener("click", (function(obj, blockedElement, wrap){
              function blockedElementListener(){
                ytcenter.utils.removeClass(wrap, "ytcenter-comments-blocked");
                blockedElement.parentNode.removeChild(blockedElement);
                blockedElement.removeEventListener("click", blockedElementListener, false);
              }
              return blockedElementListener;
            })(obj, blockedElement, obj.contentElement.parentNode.parentNode), false);*/
            obj.contentElement.parentNode.parentNode.className += " ytcenter-comments-blocked";
            obj.contentElement.parentNode.parentNode.insertBefore(blockedElement, obj.contentElement.parentNode);
            if (obj.wrapper) {
              obj.wrapper.lastChild.style.display = "none";
            }
          }
        }
      };
      __r.commentDuplicates = function(){
        var i, j, duplicates, msg;
        for (i = 0; i < __r.comments.length; i++) {
          if (typeof __r.comments[i].duplicateId === "number" || !__r.comments[i].inDOM) continue;
          if (!ytcenter.utils.contains(document, __r.comments[i].wrapper)) {
            __r.comments[i].inDOM = false;
            continue;
          }
          duplicates = 0;
          for (j = 0; j < __r.comments.length; j++) {
            if (i === j || __r.comments[j].duplicateId === "number" || __r.comments[j].duplicates || !__r.comments[j].inDOM) continue;
            if (!ytcenter.utils.contains(document, __r.comments[j].wrapper)) {
              __r.comments[j].inDOM = false;
              continue;
            }
            if (__r.comments[i].username === __r.comments[j].username
             && __r.comments[i].textContent === __r.comments[j].textContent) {
              duplicates += 1;
              __r.comments[j].duplicateId = i;
              __r.comments[j].wrapper.style.display = "none";
            }
          }
          if (duplicates > 0) {
            __r.comments[i].duplicates = duplicates;
          }
        }
      };
      __r.completeFlag = function(comment, country){
        var countryContainer = document.createElement("span"),
            metadata = comment.headerUserDataElement,
            countryName = ytcenter.language.getLocale("COUNTRY_ISO3166-1_CODES_" + country.toUpperCase());
        countryContainer.className = "country";
        if (ytcenter.settings.commentCountryShowFlag && ytcenter.flags[country.toLowerCase()]) {
          var img = document.createElement("img");
          img.src = "//s.ytimg.com/yt/img/pixel-vfl3z5WfW.gif";
          img.className = ytcenter.flags[country.toLowerCase()];
          if (ytcenter.settings.commentCountryUseNames) {
            img.setAttribute("alt", countryName || country);
            img.setAttribute("title", countryName || country);
            ytcenter.events.addEvent("language-refresh", function(){
              var _countryName = ytcenter.language.getLocale("COUNTRY_ISO3166-1_CODES_" + country.toUpperCase());
              img.setAttribute("alt", _countryName || country);
              img.setAttribute("title", _countryName || country);
            });
          } else {
            img.setAttribute("alt", country);
            img.setAttribute("title", country);
          }
          countryContainer.appendChild(img);
        } else {
          if (ytcenter.settings.commentCountryUseNames) {
            countryContainer.textContent = countryName || country;
            ytcenter.events.addEvent("language-refresh", function(){
              var _countryName = ytcenter.language.getLocale("COUNTRY_ISO3166-1_CODES_" + country.toUpperCase());
              countryContainer.textContent = _countryName || country;
            });
          } else {
            countryContainer.textContent = country;
          }
        }
        
        if (ytcenter.settings.commentCountryPosition === "before_username") {
          countryContainer.style.marginRight = "10px";
          metadata.insertBefore(countryContainer, metadata.children[0]);
        } else if (ytcenter.settings.commentCountryPosition === "after_username") {
          if (!comment.isReply) {
            countryContainer.style.marginLeft = "10px";
          } else {
            countryContainer.style.marginRight = "8px";
          }
          metadata.insertBefore(countryContainer, metadata.children[1]);
        } else if (ytcenter.settings.commentCountryPosition === "last") {
          countryContainer.style.marginLeft = "10px";
          if (!comment.isReply) {
            if (metadata.children.length > 2) {
              metadata.insertBefore(countryContainer, metadata.children[2]);
            } else {
              metadata.appendChild(countryContainer);
            }
          } else {
            if (metadata.children.length > 3) {
              metadata.insertBefore(countryContainer, metadata.children[3]);
            } else {
              metadata.appendChild(countryContainer);
            }
          }
        }
      };
      __r.handleFlagWorker = function(comment){
        ytcenter.jobs.createWorker(comment.profileRedirectId || comment.channelRedirectId, function(args){
          try {
            if (comment.profileRedirectId) {
              ytcenter.getGooglePlusUserData(comment.profileRedirectId, function(data){
                if (data && data.entry && data.entry.yt$location && data.entry.yt$location.$t) {
                  comment.country = data.entry.yt$location.$t;
                } else {
                  con.error("[Comment Country] Unknown Location", data);
                }
                args.complete(comment.country || null);
              });
            } else if (comment.channelRedirectId) {
              ytcenter.getUserData(comment.channelRedirectId, function(data){
                if (data && data.entry && data.entry.yt$location && data.entry.yt$location.$t) {
                  comment.country = data.entry.yt$location.$t;
                } else {
                  con.error("[Comment Country] Unknown Location", data);
                }
                args.complete(comment.country || null);
              });
            }
          } catch (e) {
            con.error(e);
            args.complete(null);
          }          
        }, function(data){
          if (!data) return;
          if (comment.profileRedirectId || comment.channelRedirectId) {
            ytcenter.cache.putItem("profile_country", comment.profileRedirectId || comment.channelRedirectId, data, 2678400000 /* 31 days */);
          }
          
          comment.country = data;
          __r.completeFlag(comment, data);
        });
      };
      __r.handleFlag = function(comment){
        if (comment.flagAdded) return;
        comment.flagAdded = true;
        if (comment.country) {
          __r.completeFlag(comment, comment.country);
        } else {
          if (ytcenter.settings.commentCountryLazyLoad) {
            ytcenter.domEvents.addEvent(comment.wrapper, "enterview", function(){
              __r.handleFlagWorker(comment);
            }, true);
          } else {
            __r.handleFlagWorker(comment);
          }
        }
      };
      __r.addFlags = function(){
        if (!ytcenter.settings.commentCountryEnabled) return;
        ytcenter.cache.putCategory("profile_country", ytcenter.settings.commentCacheSize);
        var i;
        for (i = 0; i < __r.comments.length; i++) {
          __r.handleFlag(__r.comments[i]);
        }
      };
      
      __r.update = function(){
        if (!ytcenter.settings.commentCountryEnabled) return;
        
        __r.loadComments();
        /*__r.filter();
        __r.commentDuplicates();*/
        __r.addFlags();
      };
      __r.setupObserver = function(){
        try {
          observer = ytcenter.mutation.observe(document.body, { childList: true, subtree: true }, function(){
            con.log("[Comment Observer] Mutation Observed!");
            __r.update();
          });
        } catch (e) {
          con.error(e);
        }
      };
      __r.dispose = function(){
        if (observer) {
          observer.disconnect();
          observer = null;
        }
      };
      __r.setup = function(){
        ytcenter.domEvents.setup();
        
        __r.update();
        
        document.body.className += " ytcenter-comments-plus";
        
        ytcenter.events.addEvent("resize-update", function(){
          __r.update();
        });
        __r.setupObserver();
        
      };
      
      return __r;
    })();
    ytcenter.uploaderFlag = (function(){
      function init() {
        if (!ytcenter.settings.uploaderCountryEnabled) return;
        
        ytcenter.cache.putCategory("profile_country", ytcenter.settings.commentCacheSize);
        
        var userHeader = document.getElementById("watch7-user-header"),
            user = userHeader.getElementsByTagName("a")[1],
            id = user.getAttribute("data-ytid");
        
        var country = ytcenter.cache.getItem("profile_country", id);
        if (country) {
          addFlag(country.data);
        } else {
          work(id);
        }
      }
      function work(id) {
        ytcenter.jobs.createWorker(id, function(args){
          try {
            ytcenter.getUserData(id, function(data){
              var country = null;
              if (data && data.entry && data.entry.yt$location && data.entry.yt$location.$t) {
                country = data.entry.yt$location.$t;
              } else {
                con.error("[Comment Country] Unknown Location", data);
              }
              args.complete(country);
            });
          } catch (e) {
            con.error(e);
            args.complete(null);
          }          
        }, function(data){
          if (!data) return;
          if (id) {
            ytcenter.cache.putItem("profile_country", id, data, 2678400000 /* 31 days */);
          }
          addFlag(data);
        });
      }
      function addFlag(country) {
        var userHeader = document.getElementById("watch7-user-header"),
            separator = userHeader.children[2],
            user = userHeader.getElementsByTagName("a")[1],
            linebreak = userHeader.getElementsByTagName("br")[0],
            countryContainer = document.createElement("span"),
            countryName = ytcenter.language.getLocale("COUNTRY_ISO3166-1_CODES_" + country.toUpperCase());
        countryContainer.className = "country";
        if (ytcenter.settings.uploaderCountryShowFlag && ytcenter.flags[country.toLowerCase()]) {
          var img = document.createElement("img");
          img.src = "//s.ytimg.com/yt/img/pixel-vfl3z5WfW.gif";
          img.className = ytcenter.flags[country.toLowerCase()];
          if (ytcenter.settings.uploaderCountryUseNames) {
            img.setAttribute("alt", countryName || country);
            img.setAttribute("title", countryName || country);
            ytcenter.events.addEvent("language-refresh", function(){
              var _countryName = ytcenter.language.getLocale("COUNTRY_ISO3166-1_CODES_" + country.toUpperCase());
              img.setAttribute("alt", _countryName || country);
              img.setAttribute("title", _countryName || country);
            });
          } else {
            img.setAttribute("alt", country);
            img.setAttribute("title", country);
          }
          countryContainer.appendChild(img);
        } else {
          if (ytcenter.settings.uploaderCountryUseNames) {
            countryContainer.textContent = countryName || country;
            ytcenter.events.addEvent("language-refresh", function(){
              var _countryName = ytcenter.language.getLocale("COUNTRY_ISO3166-1_CODES_" + country.toUpperCase());
              countryContainer.textContent = _countryName || country;
            });
          } else {
            countryContainer.textContent = country;
          }
        }
        
        countryContainer.style.verticalAlign = "middle";
        
        
        if (ytcenter.settings.uploaderCountryPosition === "before_username") {
          countryContainer.style.marginLeft = "10px";
          user.style.marginLeft = "5px";
          userHeader.insertBefore(countryContainer, user);
        } else if (ytcenter.settings.uploaderCountryPosition === "after_username") {
          countryContainer.style.marginLeft = "5px";
          userHeader.insertBefore(countryContainer, separator);
        } else if (ytcenter.settings.uploaderCountryPosition === "last") {
          countryContainer.style.marginLeft = "5px";
          userHeader.insertBefore(countryContainer, linebreak);
        }
      }
      
      return {
        init: init
      };
    })();
    ytcenter.jobs = (function(){
      var __r = {}, workers = {}, pendingWorkers = [], workingWorkers = [], completedWorkers = [], _max_workers = 5;
      
      /*  id        the id of the worker.
          action    the action function, which will do the job.
          complete  the function which will be called when the job is finished.
        ***
        This creates a new worker, which will execute a job.
        If a worker with the same id is created it will just execute the complete function instead with the previous data.
      */
      __r.createWorker = function(id, action, complete){
        if (id in workers) {
          if (workers[id].completed) {
            workers[id].complete(workers[id].data);
          } else {
            workers[id].completeActions.push(complete);
          }
        } else {
          workers[id] = {
            completeActions: [ complete ],
            run: function(){ action(workers[id].args); },
            args: {
              complete: function(data){
                con.log("[Worker] Job completed (" + id + ")");
                var i;
                for (i = 0; i < workingWorkers.length; i++) {
                  if (workingWorkers[i] === id) {
                    completedWorkers.push(workingWorkers.splice(i, 1)[0]);
                    break;
                  }
                }
                
                workers[id].completed = true;
                workers[id].data = data;
                var i;
                for (i = 0; i < workers[id].completeActions.length; i++) {
                  workers[id].completeActions[i](data);
                }
                
                __r.run();
              },
              remove: ytcenter.utils.once(function(){ delete workers[id]; })
            },
            completed: false
          };
          pendingWorkers.push(id);
          
          __r.run();
        }
      };
      
      __r.run = function(){
        var id;
        while (workingWorkers.length < _max_workers && pendingWorkers.length > 0) {
          id = pendingWorkers.splice(0, 1)[0];
          workingWorkers.push(id);
          con.log("[Worker] Executing new job (" + id + ")");
          workers[id].run();
        }
      };
      
      __r.getPendingWorkers = function(){
        return pendingWorkers;
      };
      
      __r.getWorkingWorkers = function(){
        return workingWorkers;
      };
      __r.getCompletedWorkers = function(){
        return completedWorkers;
      };
      
      return __r;
    })();
    ytcenter.cache = (function(){
      var __r = {};
      
      __r.putCategory = function(id, size){
        if (!ytcenter.settings.cache) ytcenter.settings.cache = {};
        if (ytcenter.settings.cache[id]) {
          ytcenter.settings.cache[id].size = size;
        } else {
          ytcenter.settings.cache[id] = { size: size, items: [] };
        }
        
        ytcenter.saveSettings();
      };
      
      __r.getCategory = function(id){
        if (!ytcenter.settings.cache) ytcenter.settings.cache = {};
        return ytcenter.settings.cache[id] || null;
      };
      
      __r.getItem = function(catId, id){
        if (!ytcenter.settings.cache) ytcenter.settings.cache = {};
        __r.checkCache();
        
        var cat = __r.getCategory(catId), i;
        if (!cat) return false;
        for (i = 0; i < cat.items.length; i++) {
          if (cat.items[i].i === id)
            return { id: cat.items[i].i, categoryId: catId, data: cat.items[i].d, expires: cat.items[i].e, lastUpdated: cat.items[i].l, index: i };
        }
        return null;
      };
      
      /**
       * catId : the unique id of the category the item is in.
       * id : the unique id of the item.
       * data : the data of the item.
       * expires : the milliseconds after the last update date. If the sum of expires and the lastUpdate is less than the date the item will be removed.
       */
      __r.putItem = function(catId, id, data, expires){
        if (!ytcenter.settings.cache) ytcenter.settings.cache = {};
        __r.checkCache();
        
        var cat = __r.getCategory(catId), item;
        if (!cat) throw "[Cache] Category " + catId + " doesn't exist!";
        item = __r.getItem(catId, id);
        if (item) {
          cat.items[item.index].d = data;
          cat.items[item.index].e = expires;
          cat.items[item.index].l = +new Date;
        } else {
          item = { i: id, d: data, e: expires, l: +new Date };
          if (cat.items.length >= cat.size) cat.items.shift();
          cat.items.push(item);
        }
        
        ytcenter.saveSettings();
      };
      
      /* Find expired items and removes them. */
      __r.checkCache = function(){
        if (!ytcenter.settings.cache) return;
        var key, i, now = +new Date, save = false;
        
        for (key in ytcenter.settings.cache) {
          if (ytcenter.settings.cache.hasOwnProperty(key)) {
            for (i = 0; i < ytcenter.settings.cache[key].items.length; i++) {
              if (ytcenter.settings.cache[key].items[i].l + ytcenter.settings.cache[key].items[i].e < now) {
                save = true;
                ytcenter.settings.cache[key].items.splice(i, 1);
                i--;
              }
            }
          }
        }
        ytcenter.saveSettings();
      };
      
      return __r;
    })();
    ytcenter.comments = (function(){
      function getComments(channel) {
        if (typeof channel !== "boolean") channel = false;
        
        var a = document.getElementsByClassName("comment"),
            data = [], i, cacheData, d, sort = {}, tmp = [];
        if (channel) {
          a = document.getElementsByClassName("comment-moderation-container");
          for (i = 0; i < a.length; i++) {
            if (!a[i].getElementsByClassName("feed-author-bubble")[0].href) continue;
            d = {
              element: a[i],
              userId: a[i].getElementsByClassName("feed-author-bubble")[0].href.split("/")[a[i].getElementsByClassName("feed-author-bubble")[0].href.split("/").length-1]
            };
            data.push(d);
          }
        } else {
          for (i = 0; i < a.length; i++) {
            if (!a[i].getAttribute("data-author-id")) continue;
            d = {
              element: a[i],
              userId: a[i].getAttribute("data-author-id")
            };
            data.push(d);
          }
        }
        d = null;
        for (i = 0; i < data.length; i++) {
          if (!sort[data[i].userId]) {
            sort[data[i].userId] = {elements: []};
            tmp.push(data[i].userId);
          }
          sort[data[i].userId].elements.push(data[i].element);
          if (!sort[data[i].userId].country) {
            cacheData = getDataCacheById(data[i].userId);
            if (cacheData) {
              if (cacheData.country) sort[data[i].userId].country = cacheData.country;
            }
          }
        }
        data = [];
        for (i = 0; i < tmp.length; i++) {
          d = sort[tmp[i]];
          d.id = tmp[i];
          d.plus = false;
          data.push(d);
        }
        
        return data;
      }
      function addMetadata(comment, channel) {
        if (typeof channel !== "boolean") channel = false;
        var i, metadata, countryMetadata;
        if (isInCache(comment)) {
          updateItemInCache(comment);
        } else {
          addNewDataToCache(comment);
        }
        for (i = 0; i < comment.elements.length; i++) {
          if (channel) {
            metadata = comment.elements[i].getElementsByClassName("feed-item-actions-line")[0];
            countryMetadata = document.createElement("span");
            countryMetadata.className = "country";
            countryMetadata.style.marginLeft = "4px";
            if (ytcenter.settings.commentCountryShowFlag && ytcenter.flags[comment.country.toLowerCase()]) {
              var img = document.createElement("img");
              img.src = "//s.ytimg.com/yt/img/pixel-vfl3z5WfW.gif";
              img.className = ytcenter.flags[comment.country.toLowerCase()];
              img.setAttribute("alt", comment.country);
              img.setAttribute("title", comment.country);
              countryMetadata.appendChild(img);
            } else {
              countryMetadata.style.color = "#999";
              countryMetadata.textContent = comment.country;
            }
          } else {
            metadata = comment.elements[i].getElementsByClassName("metadata")[0];
            countryMetadata = document.createElement("span");
            countryMetadata.className = "country";
            countryMetadata.style.marginRight = "3px";
            if (ytcenter.settings.commentCountryShowFlag && ytcenter.flags[comment.country.toLowerCase()]) {
              var img = document.createElement("img");
              img.src = "//s.ytimg.com/yt/img/pixel-vfl3z5WfW.gif";
              img.className = ytcenter.flags[comment.country.toLowerCase()];
              img.setAttribute("alt", comment.country);
              img.setAttribute("title", comment.country);
              countryMetadata.appendChild(img);
            } else {
              countryMetadata.textContent = comment.country;
            }
          }
          if (ytcenter.settings.commentCountryPosition === "before_username") {
            metadata.insertBefore(countryMetadata, metadata.children[0]);
          } else if (ytcenter.settings.commentCountryPosition === "after_username") {
            metadata.insertBefore(countryMetadata, metadata.children[1]);
          } else if (ytcenter.settings.commentCountryPosition === "last") {
            metadata.appendChild(countryMetadata);
          }
        }
      }
      function processItem(comment, channel) {
        if (typeof channel !== "boolean") channel = false;
        var i;
        if (comment.country) {
          addMetadata(comment, channel);
        } else {
          var country;
          for (i = 0; i < comments.length; i++) {
            if (comments[i].id === comment.id && comments[i].country) {
              comment.country = comments[i].country;
              break;
            }
          }
          if (comment.country) {
            addMetadata(comment, channel);
          } else {
            if (comment.plus) {
              ytcenter.getGooglePlusUserData(comment.id, function(data){
                if (data && data.entry && data.entry.yt$location && data.entry.yt$location.$t) {
                  comment.country = data.entry.yt$location.$t;
                  addMetadata(comment, channel);
                } else {
                  con.error("[Comment Country] Unknown Location", data);
                }
              });
            } else {
              ytcenter.getUserData(comment.id, function(data){
                if (data && data.entry && data.entry.yt$location && data.entry.yt$location.$t) {
                  comment.country = data.entry.yt$location.$t;
                  addMetadata(comment, channel);
                } else {
                  con.error("[Comment Country] Unknown Location", data);
                }
              });
            }
          }
        }
      }
      function compareDifference(newData, oldData) {
        var i, j, k, found, f, data = [], e, country;
        for (i = 0; i < newData.length; i++) {
          found = false;
          for (j = 0; j < oldData.length; j++) {
            if (newData[i].id === oldData[j].id) {
              found = oldData[j].elements;
              country = oldData[j].country;
              break;
            }
          }
          if (found) {
            e = [];
            for (j = 0; j < newData[i].elements.length; j++) {
              f = false;
              for (k = 0; k < found.length; k++) {
                if (found[k] === newData[i].elements[j]) {
                  f = true;
                  break;
                }
              }
              if (!f) {
                e.push(newData[i].elements[j]);
              }
            }
            if (e.length > 0) {
              newData[i].elements = e;
              if (country)
                newData[i].country = country;
              data.push(newData[i]);
            }
          } else {
            data.push(newData[i]);
          }
        }
        e = [];
        for (i = 0; i < data.length; i++) {
          e = [];
          for (j = 0; j < data[i].elements.length; j++) {
            if (!elementInUse(data[i].elements[j])) {
              e.push(data[i].elements[j]);
            }
          }
          data.elements = e;
        }
        
        return data;
      }
      function elementInUse(element) {
        var i, j;
        for (i = 0; i < comments.length; i++) {
          for (j = 0; j < comments[i].elements.length; j++) {
            if (comments[i].elements[j] === element)
              return true;
          }
        }
        return false;
      }
      function mergeCommentData(data) {
        var i, j;
        for (i = 0; i < comments.length; i++) {
          if (data.id === comments[i].id) {
            for (j = 0; j < data.elements.length; j++) {
              if (!elementInUse(data.elements[j]))
                comments[i].elements.push(data.elements[j]);
            }
            if (!comments[i].country && data.country) comments[i].country = data.country;
            return;
          }
        }
        comments.push(data);
      }
      function updateItemInCache(data) {
        var index = getDataCacheIndex(data);
        if (data.country && !ytcenter.settings.commentCountryData[index].country) {
          ytcenter.settings.commentCountryData[index].country = data.country;
        }
        ytcenter.saveSettings(false, true);
      }
      function updateReuse(data) {
        var index = getDataCacheIndex(data);
        if (index === -1) return;
        ytcenter.settings.commentCountryData[index].reused++;
        if (ytcenter.settings.commentCountryData[index].reused > 10)
          ytcenter.settings.commentCountryData[index].reused = 10;
        ytcenter.saveSettings(false, true);
      }
      function getDataCacheById(id) {
        var i;
        for (i = 0; i < ytcenter.settings.commentCountryData.length; i++) {
          if (id === ytcenter.settings.commentCountryData[i].id) return ytcenter.settings.commentCountryData[i];
        }
        return null;
      }
      function getDataCacheIndex(data) {
        var i;
        for (i = 0; i < ytcenter.settings.commentCountryData.length; i++) {
          if (data.id === ytcenter.settings.commentCountryData[i].id) return i;
        }
        return -1;
      }
      function isInCache(data) {
        return getDataCacheIndex(data) !== -1;
      }
      function addNewDataToCache(data) {
        if (isInCache(data)) return;
        var nData = {};
        while (ytcenter.settings.commentCountryData.length >= ytcenter.settings.commentCacheSize) removeOldestFromCache();
        nData.id = data.id;
        nData.plus = data.plus || false;
        nData.reused = 0;
        nData.date = ytcenter.utils.now();
        if (data.country) nData.country = data.country;
        
        ytcenter.settings.commentCountryData.push(nData);
        
        ytcenter.saveSettings(false, true);
      }
      function calculateCacheLife(data) {
        return 1000*60*60*24*7 + (1000*60*60*24*2)*(data.reused ? data.reused : 0);
      }
      function removeOldestFromCache() {
        if (ytcenter.settings.commentCountryData.length === 0) return;
        var i, now = ytcenter.utils.now(), life, lifeRemaining, oldest = ytcenter.settings.commentCountryData[0], j = 0;
        for (i = 1; i < ytcenter.settings.commentCountryData.length; i++) {
          life = calculateCacheLife(ytcenter.settings.commentCountryData[i]);
          lifeRemaining = (ytcenter.settings.commentCountryData[i].date + life) - now;
          if (lifeRemaining < (oldest.date + calculateCacheLife(oldest)) - now) {
            oldest = ytcenter.settings.commentCountryData[i];
            j = i;
          }
        }
        ytcenter.settings.commentCountryData.splice(j, 1);
      }
      function cacheChecker() {
        if (ytcenter.settings.commentCountryData.length === 0) return;
        var i, now = ytcenter.utils.now(), life, nData = [];
        
        for (i = 0; i < ytcenter.settings.commentCountryData.length; i++) {
          life = calculateCacheLife(ytcenter.settings.commentCountryData[i]);
          if (now < ytcenter.settings.commentCountryData[i].date + life) {
            if (ytcenter.settings.commentCountryData[i].reused < 10) ytcenter.settings.commentCountryData[i].reused++;
            nData.push(ytcenter.settings.commentCountryData[i]);
          }
        }
        ytcenter.settings.commentCountryData = nData;
        ytcenter.saveSettings(false, true);
      }
      
      var __r = {}, comments = [], observer = null, observer2 = null, observer3 = null;
      
      ytcenter.unload(function(){
        if (observer) {
          observer.disconnect();
        }
        if (observer2) {
          observer2.disconnect();
        }
        if (observer3) {
          observer3.disconnect();
        }
      });
      __r.update = function(a){
        if (typeof a !== "boolean") a = false;
        var c = compareDifference(getComments(a), comments), i;
        for (i = 0; i < c.length; i++) {
          mergeCommentData(c[i]);
          updateReuse(c[i]);
          processItem(c[i], a);
        }
      };
      __r.setupObserver = function(){
        try {
          if (document.getElementById("watch-discussion")) {
            observer = ytcenter.mutation.observe(document.getElementById("watch-discussion"), { childList: true }, function(){
              __r.update();
              if (document.getElementById("comments-view")) {
                observer2 = ytcenter.mutation.observe(document.getElementById("comments-view"), { childList: true, subtree: true }, function(){
                  __r.update();
                });
              }
            });
          }
          if (document.getElementById("channel-discussion")) {
            observer3 = ytcenter.mutation.observe(document.getElementById("channel-discussion"), { childList: true }, function(){
              __r.update(true);
            });
          }
        } catch (e) {
          con.error(e);
        }
      };
      __r.dispose = function(){
        if (observer) {
          observer.disconnect();
          observer = null;
        }
        if (observer2) {
          observer2.disconnect();
          observer2 = null;
        }
        if (observer3) {
          observer3.disconnect();
          observer3 = null;
        }
      };
      __r.setup = function(){
        if (ytcenter.settings.commentCountryEnabled) {
          try {
            var i;
            cacheChecker();
            if (document.getElementById("channel-discussion")) {
              comments = getComments(true);
              for (i = 0; i < comments.length; i++) {
                updateReuse(comments[i]);
                processItem(comments[i], true);
              }
            } else {
              comments = getComments();
              for (i = 0; i < comments.length; i++) {
                updateReuse(comments[i]);
                processItem(comments[i]);
              }
            }
            __r.setupObserver();
          } catch (e) {
            con.error(e);
          }
        } else {
          cacheChecker();
        }
      };
      
      return __r;
    })();
    ytcenter.getUserData = function(userId, callback){
      $XMLHTTPRequest({
        url: "https://gdata.youtube.com/feeds/api/users/" + userId + "?alt=json",
        method: "GET",
        onload: function(r){
          var data = null;
          try {
            data = JSON.parse(r.responseText);
          } catch (e) {
            con.error(e);
          }
          callback(data);
        },
        onerror: function(){
          callback(null);
        }
      });
    };
    ytcenter.getGooglePlusUserData = function(oId, callback){
      var userId = null;
      $XMLHTTPRequest({
        url: "http://www.youtube.com/profile_redirector/" + oId,
        method: "GET",
        onload: function(r){
          if (r.finalUrl.indexOf("youtube.com/channel/") !== -1) {
            userId = r.finalUrl.split("youtube.com/channel/");
            if (userId && userId[1])
              ytcenter.getUserData(userId[1], callback);
          } else if (r.finalUrl.indexOf("youtube.com/user/") !== -1) {
            userId = r.finalUrl.split("youtube.com/user/");
            if (userId && userId[1])
              ytcenter.getUserData(userId[1], callback);
          } else {
            con.error("[Comments getGooglePlusUserData] Final URL: " + r.finalUrl);
            callback(null);
          }
        }
      });
    };
    ytcenter.getPage = function(url){
      url = url || loc.href;
      var pathname = (url && url.split("youtube.com")[1]) || loc.pathname;
      if (!!url.match(/^http(s)?:\/\/(www\.)?youtube\.com\/watch\?/)) {
        ytcenter.page = "watch";
        return "watch";
      } else if (!!url.match(/^http(s)?:\/\/((apis\.google\.com)|(plus\.googleapis\.com))\/([0-9a-zA-Z-_\/]+)\/widget\/render\/comments\?/)) {
        ytcenter.page = "comments";
        return "comments";
      } else if (!!url.match(/^http(s)?:\/\/(www\.)?youtube\.com\//) && (loc.pathname === "/" || loc.pathname === "/feed/what_to_watch")) {
        ytcenter.page = "feed_what_to_watch";
        return "feed_what_to_watch";
      } else if (!!url.match(/^http(s)?:\/\/(www\.)?youtube\.com\/embed\//) || !!url.match(/^http(s)?:\/\/(www\.)?youtube\.com\/watch_popup\?\//)) {
        ytcenter.page = "embed";
        return "embed";
      } else if ( document &&
                  document.body &&
                  document.body.innerHTML.indexOf("data-swf-config") !== -1 &&
                  document.body.innerHTML.indexOf("movie_player") !== -1 &&
                  document.body.innerHTML.indexOf("youtube.com/v/") !== -1 &&
                  document.body.innerHTML.indexOf("flashvars=") !== -1) {
        ytcenter.page = "channel";
        return "channel";
      } else if (document.getElementById("page") && ytcenter.utils.hasClass(document.getElementById("page"), "channel")) {
        ytcenter.page = "channel";
        return "channel";
      } else if (!!url.match(/^http(s)?:\/\/(www\.)?youtube\.com\//)) {
        if (loc.pathname === "/results") {
          ytcenter.page = "search";
          return "search";
        } else {
          ytcenter.page = "other";
          return "other";
        }
      }
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
            }, {
              event: "stopInterval",
              called: false,
              callbacks: []
            }
          ],
          preTester,
          preTesterInterval = 75;
      __r.call = function(event){
        for (i = 0; i < events.length; i++) {
          if (events[i].event === event) {
            con.log("[PageReadinessListener] Calling => " + events[i].event);
            for (j = 0; j < events[i].callbacks.length; j++) {
              events[i].callbacks[j]();
            }
          }
        }
      };
      __r.addEventListener = function(event, callback){
        var i;
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
        
        for (i = 0; i < events.length; i++) {
          if (events[i].called) continue;
          if (events[i].test && !events[i].test()) break;
          events[i].called = true;
          
          if (events[i].event === "stopInterval") {
            con.log("[PageReadinessListener] Stopping interval");
            uw.clearInterval(preTester);
          } else if (events[i].event === "startInterval") {
            con.log("[PageReadinessListener] Starting interval");
            uw.clearInterval(preTester); // Just to make sure that only one instance is running.
            preTester = uw.setInterval(function(){
              __r.update();
            }, preTesterInterval);
          } else {
            //try {
              con.log("[PageReadinessListener] At event => " + events[i].event);
              events[i].called = true;
              for (j = 0; j < events[i].callbacks.length; j++) {
                events[i].callbacks[j]();
              }
            /*} catch (e) {
              con.error("[PageReadinessListener] " + events[i].event);
              con.error(e);
            }*/
          }
        }
      };
      __r.setup = function(){
        ytcenter.utils.addEventListener(document, "readystatechange", __r.update, false);
        ytcenter.utils.addEventListener(document, "DOMContentLoaded", __r.update, false);
        preTester = uw.setInterval(function(){
          __r.update();
        }, preTesterInterval);
        
        __r.update();
      };
      return __r;
    })();
    ytcenter.thumbnail = (function(){
      function getPlaylistVideoThumbs() {
        var pt = document.getElementById("watch7-playlist-tray"),
            pt2 = document.getElementById("guide"),
            pt3 = document.getElementById("watch-appbar-playlist"),
            a = [], b, i;
        if (pt) {
          b = pt.getElementsByClassName("video-thumb");
          for (i = 0; i < b.length; i++) {
            a.push(b[i]);
          }
        }
        if (pt2) {
          b = pt2.getElementsByClassName("video-thumb");
          for (i = 0; i < b.length; i++) {
            a.push(b[i]);
          }
        }
        if (pt3) {
          b = pt3.getElementsByClassName("video-thumb");
          for (i = 0; i < b.length; i++) {
            a.push(b[i]);
          }
        }
        return a;
      }
      function getVideoThumbs() {
        var linkRegex = /v=([a-zA-Z0-9-_]+)/,
            linkRegex2 = /index=([0-9]+)/,
            linkRegex3 = /video_ids=([0-9a-zA-Z-_%]+)/,
            vt = document.getElementsByClassName("video-thumb"),
            videos = [],
            i, j, id, videoElement, cacheData, data, index, rgx, wrapper,
            playlistVideoThumbs = getPlaylistVideoThumbs(), maxIterations = 10, a;
        for (i = 0; i < vt.length; i++) {
          if (ytcenter.utils.inArray(playlistVideoThumbs, vt[i])) continue;
          videoElement = vt[i].parentNode;
          data = null;
          cacheData = null;
          if (videoElement.tagName === "A") {
            wrapper = videoElement;
          } else if (videoElement.parentNode.tagName === "A") {
            wrapper = videoElement.parentNode;
          } else {
            wrapper = null;
          }
          if (wrapper) {
            if (wrapper.href.match(linkRegex)) {
              rgx = linkRegex.exec(wrapper.href);
              if (rgx && rgx[1]) id = rgx[1];
              else continue;
              cacheData = getDataCacheById(id);
              data = {id: id, content: videoElement, wrapper: wrapper, videoThumb: vt[i]};
              if (cacheData) {
                if (cacheData.stream) data.stream = cacheData.stream;
                if (cacheData.likes) data.likes = cacheData.likes;
                if (cacheData.dislikes) data.dislikes = cacheData.dislikes;
              }
            } else if (wrapper.href.match(linkRegex3)) {
              rgx = linkRegex2.exec(wrapper.href);
              if (rgx && rgx[1]) index = parseInt(rgx[1]);
              else index = 0;
              rgx = linkRegex3.exec(wrapper.href);
              if (rgx && rgx[1]) id = rgx[1];
              else continue;
              if (id.split("%2C").length > 0 && id.split("%2C")[index]) id = id.split("%2C")[index];
              else continue;
              cacheData = getDataCacheById(id);
              data = {id: id, content: videoElement, wrapper: wrapper, videoThumb: vt[i]};
              if (cacheData) {
                if (cacheData.stream) data.stream = cacheData.stream;
                if (cacheData.likes) data.likes = cacheData.likes;
                if (cacheData.dislikes) data.dislikes = cacheData.dislikes;
              }
            }
            if (data) {
              a = wrapper;
              for (j = 0; j < maxIterations; j++) {
                a = a.parentNode;
                if (!a) break; // At the top of the tree
                if (a.tagName === "LI") { // We found it guys. Great job.
                  data.itemWrapper = a;
                  break;
                }
              }
              videos.push(data);
            }
          }
        }
        return videos;
      }
      function loadVideoConfig(item, callback) {
        if (item.stream && item.storyboard) {
          callback(item.stream, item.storyboard);
        } else {
          //var spflink = Math.round(Math.random()) === 1 ? true : false;
          var spflink = /*ytcenter.spf.isEnabled()*/true;
          //var spflink = true;
          
          $XMLHTTPRequest({
            url: "http://www.youtube.com/watch?v=" + item.id + (spflink ? "&spf=navigate" : ""),
            method: "GET",
            onload: function(r){
              var cfg, errorType = "unknown";
              try {
                try {
                  if (spflink) {
                    var packages = ytcenter.spfPackages(JSON.parse(r.responseText)),
                        player = packages.getData("player");
                    cfg = player.getPlayerConfig();
                    con.log(cfg);
                  } else {
                    cfg = r.responseText.split("<script>var ytplayer = ytplayer || {};ytplayer.config = ")[1].split(";</script>")[0];
                    cfg = JSON.parse(cfg);
                  }
                } catch (e) {
                  con.error(e);
                  if (r.responseText.indexOf("flashvars=\"") !== -1) {
                    var a = r.responseText.split("flashvars=\"")[1].split("\"")[0].replace(/&amp;/g, "&").replace(/&quot;/g, "\"").split("&"),
                        i, b;
                    cfg = {args: {}};
                    for (i = 0; i < a.length; i++) {
                      b = a[i].split("=");
                      cfg.args[decodeURIComponent(b[0])] = decodeURIComponent(b[1]);
                    }
                  } else if (r.responseText.indexOf("new yt.player.Application('p', {") !== -1) {
                    cfg = {};
                    cfg.args = r.responseText.split("new yt.player.Application('p', ")[1].split(");var fbetatoken")[0];
                    cfg.args = JSON.parse(cfg.args);
                  }
                }
                item.stream = ytcenter.player.getBestStream(ytcenter.parseStreams(cfg.args), (ytcenter.settings.videoThumbnailQualitySeparated ? (ytcenter.settings.dashPlayback ? 1 : 0) : -1));
                if (!item.stream) {
                  if (cfg && cfg.args && cfg.args.ypc_module && cfg.args.ypc_vid) {
                    item.stream = {
                      quality: "ondemand"
                    };
                  }
                }
                if (cfg && cfg.args) {
                  item.storyboard = cfg.args.storyboard_spec || cfg.args.live_storyboard_spec;
                }
                try {
                  delete item.stream.fallback_host;
                  delete item.stream.sig;
                  delete item.stream.flashVersion;
                  delete item.stream.url;
                } catch (e) {
                  con.error(e);
                }
                try {
                  if (isInCache(item)) {
                    updateItemInCache(item);
                  } else {
                    addNewDataToCache(item);
                  }
                } catch (e) {
                  con.error(e);
                }
                callback(item.stream, item.storyboard);
              } catch (e) {
                var msg = "";
                if (e === "unavailable") {
                  msg = "Video Unavailable!";
                } else {
                  if (r.responseText.indexOf("Too many") !== -1) {
                    msg = "Too many requests!";
                  } else {
                    msg = "Error!";
                    con.error(e);
                    con.error(cfg);
                    try {
                      con.error(JSON.parse(r.responseText));
                    } catch (e) {
                      con.error(r.responseText);
                    }
                  }
                }
                con.error("[VideoThumbnail Quality] IO Error => " + msg);
                callback("error", null, msg);
              }
            },
            onerror: function(){
              var msg = "Connection failed!";
              con.error("[VideoThumbnail Quality] IO Error => " + msg);
              callback("error", null, msg);
            }
          });
        }
      }
      function loadVideoData(item, callback) {
        if (item.likes && item.dislikes) {
          callback(item.likes, item.dislikes);
        } else {
          $XMLHTTPRequest({
            url: "https://gdata.youtube.com/feeds/api/videos/" + item.id + "?v=2&alt=json",
            method: "GET",
            onload: function(r){
              try {
                if (!r.responseText) throw "unavailable";
                var videoData = JSON.parse(r.responseText).entry,
                    ratings = videoData.yt$rating;
                item.likes = parseInt(ratings ? ratings.numLikes : 0);
                item.dislikes = parseInt(ratings ? ratings.numDislikes : 0);
                if (isInCache(item)) {
                  updateItemInCache(item);
                } else {
                  addNewDataToCache(item);
                }
                callback(item.likes, item.dislikes);
              } catch (e) {
                var msg = "";
                if (e === "unavailable") {
                  msg = "Unavailable!";
                } else {
                  if (r.responseText.indexOf("<errors xmlns='http://schemas.google.com/g/2005'><error><domain>GData</domain>") === 0) {
                    msg = "Error!";
                    if (r.responseText.indexOf("<internalReason>") !== -1 && r.responseText.indexOf("</internalReason>") !== -1) {
                      msg = ytcenter.utils.unescapeXML(r.responseText.split("<internalReason>")[1].split("</internalReason>")[0]) + "!";
                    }
                  } else if (r.responseText.indexOf("<code>too_many_recent_calls</code>") !== -1 && r.responseText.indexOf("<domain>yt:quota</domain>") !== -1) {
                    msg = "Too many requests!";
                  } else {
                    msg = "Error!";
                    con.error(e);
                    try {
                      con.error(JSON.parse(r.responseText));
                    } catch (e) {
                      con.error(r.responseText);
                    }
                  }
                }
                con.error("[VideoThumbnail Ratings] IO Error => " + msg);
                callback("error", msg);
              }
            },
            onerror: function(){
              var msg = "Connection failed!";
              con.error("[VideoThumbnail Quality] IO Error => " + msg);
              callback("error", msg);
            }
          });
        }
      }
      function appendRatingBar(item, likes, dislikes) {
        try {
          var total = likes + dislikes,
              sparkBars = document.createElement("div"),
              sparkBarLikes = document.createElement("div"),
              sparkBarDislikes = document.createElement("div"),
              barLength;
          sparkBars.className = "video-extras-sparkbars"
                              + (ytcenter.settings.videoThumbnailRatingsBarVisible === "show_hover" ? " ytcenter-video-thumb-show-hover" : "")
                              + (ytcenter.settings.videoThumbnailRatingsBarVisible === "hide_hover" ? " ytcenter-video-thumb-hide-hover" : "");
          sparkBars.style.height = ytcenter.settings.videoThumbnailRatingsBarHeight + "px";
          if (!ytcenter.utils.hasClass(item.videoThumb, "yt-thumb-fluid") && item.videoThumb.className.match(/yt-thumb-[0-9]+/)) {
            barLength = /yt-thumb-([0-9]+)/.exec(item.videoThumb.className)[1] + "px";
          } else if (item.videoThumb.style.width && parseInt(item.videoThumb.style.width) > 0) {
            barLength = item.videoThumb.style.width;
          } else {
            barLength = "100%";
          }
          sparkBarLikes.className = "video-extras-sparkbar-likes";
          sparkBarLikes.style.background = ytcenter.settings.videoThumbnailRatingsBarLikesColor;
          sparkBarLikes.style.height = ytcenter.settings.videoThumbnailRatingsBarHeight + "px";
          
          sparkBarDislikes.className = "video-extras-sparkbar-dislikes";
          sparkBarDislikes.style.height = ytcenter.settings.videoThumbnailRatingsBarHeight + "px";
          if (likes === "error") {
            sparkBarDislikes.style.background = "#BF3EFF";
            total = 1;
            likes = 0;
            dislikes = 1;
          } else if (total > 0) {
            sparkBarDislikes.style.background = ytcenter.settings.videoThumbnailRatingsBarDislikesColor;
          } else {
            dislikes = 1;
            total = 1;
          }
          
          sparkBars.appendChild(sparkBarLikes);
          sparkBars.appendChild(sparkBarDislikes);
          
          sparkBars.style.position = "absolute";
          switch (ytcenter.settings.videoThumbnailRatingsBarPosition) {
            case "top":
              sparkBars.style.top = "0px";
              sparkBars.style.left = "0px";
              
              sparkBarLikes.style.width = (likes/total*100) + "%";
              sparkBarDislikes.style.width = (dislikes/total*100) + "%";
              sparkBars.style.width = barLength;
              break;
            case "bottom":
              sparkBars.style.bottom = "0px";
              sparkBars.style.left = "0px";
              
              sparkBarLikes.style.width = (likes/total*100) + "%";
              sparkBarDislikes.style.width = (dislikes/total*100) + "%";
              sparkBars.style.width = barLength;
              break;
            case "left":
              sparkBars.style.top = "0px";
              sparkBars.style.left = "0px";
              
              sparkBarLikes.style.height = (likes/total*100) + "%";
              sparkBarDislikes.style.height = (dislikes/total*100) + "%";
              sparkBarLikes.style.width = "2px";
              sparkBarDislikes.style.width = "2px";
              sparkBarLikes.style.cssFloat = "none";
              sparkBarDislikes.style.cssFloat = "none";
              sparkBars.style.height = "100%";
              break;
            case "right":
              sparkBars.style.top = "0px";
              sparkBars.style.right = "0px";
              
              sparkBarLikes.style.height = (likes/total*100) + "%";
              sparkBarDislikes.style.height = (dislikes/total*100) + "%";
              sparkBarLikes.style.width = "2px";
              sparkBarDislikes.style.width = "2px";
              sparkBarLikes.style.cssFloat = "none";
              sparkBarDislikes.style.cssFloat = "none";
              sparkBars.style.height = "100%";
              break;
          }
          item.content.appendChild(sparkBars);
        } catch (e) {
          con.error("[Id=" + item.id + "] Likes: " + likes + ", " + dislikes);
          con.error(e);
        }
      }
      function appendRatingCount(item, likes, dislikes) {
        try {
          var numLikesDislikes = document.createElement("span"),
              likesCount = document.createElement("span"),
              dislikesCount = document.createElement("span"),
              likeIcon = document.createElement("img"),
              dislikeIcon = document.createElement("img");
          numLikesDislikes.className = "video-extras-likes-dislikes"
                                     + (ytcenter.settings.videoThumbnailRatingsCountVisible === "show_hover" ? " ytcenter-video-thumb-show-hover" : "")
                                     + (ytcenter.settings.videoThumbnailRatingsCountVisible === "hide_hover" ? " ytcenter-video-thumb-hide-hover" : "")
                                     + " ytcenter-thumbnail-ratingcount";
          numLikesDislikes.style.background = "#000";
          numLikesDislikes.style.opacity = "0.75";
          numLikesDislikes.style.filter = "alpha(opacity=75)";
          numLikesDislikes.style.padding = "0 4px";
          numLikesDislikes.style.lineHeight = "14px";
          numLikesDislikes.style.fontWeight = "bold";
          numLikesDislikes.style.zoom = "1";
          if (likes === "error") {
            numLikesDislikes.style.color = "#fff";
            numLikesDislikes.style.verticalAlign = "middle";
            numLikesDislikes.style.fontSize = "11px";
            numLikesDislikes.appendChild(document.createTextNode(dislikes));
          } else {
            likesCount.className = "likes-count";
            likesCount.style.marginRight = "4px";
            likesCount.style.color = "#fff";
            likesCount.style.verticalAlign = "middle";
            likesCount.style.fontSize = "11px";
            likesCount.textContent = ytcenter.utils.number1000Formating(likes);
            dislikesCount.className = "dislikes-count";
            dislikesCount.style.color = "#fff";
            dislikesCount.style.verticalAlign = "middle";
            dislikesCount.style.fontSize = "11px";
            dislikesCount.textContent = ytcenter.utils.number1000Formating(dislikes);
            
            if (ytcenter.utils.hasClass(item.videoThumb, "yt-thumb-120") || ytcenter.utils.hasClass(item.videoThumb, "yt-thumb-106")) {
              likesCount.style.fontSize = "11px";
              dislikesCount.style.fontSize = "11px";
            }
            
            likeIcon.className = ""; // icon-watch-stats-like
            likeIcon.setAttribute("alt", "Like");
            likeIcon.src = ytcenter.icon.smallThumbsUpWhite;
            likeIcon.style.position = "relative";
            likeIcon.style.marginRight = "2px";
            likeIcon.style.marginTop = "4px";
            likeIcon.style.top = "-2px";
            likeIcon.style.verticalAlign = "middle";
            dislikeIcon.className = ""; // icon-watch-stats-dislike
            dislikeIcon.setAttribute("alt", "Dislike");
            dislikeIcon.src = ytcenter.icon.smallThumbsDownWhite;
            dislikeIcon.style.position = "relative";
            dislikeIcon.style.marginRight = "2px";
            dislikeIcon.style.marginTop = "4px";
            dislikeIcon.style.top = "-2px";
            dislikeIcon.style.verticalAlign = "middle";
          
            numLikesDislikes.appendChild(likeIcon);
            numLikesDislikes.appendChild(likesCount);
            numLikesDislikes.appendChild(dislikeIcon);
            numLikesDislikes.appendChild(dislikesCount);
          }
          
          numLikesDislikes.style.position = "absolute";
          item.content.className += " ytcenter-thumbnail-ratingcount-pos-" + ytcenter.settings.videoThumbnailRatingsCountPosition;
          item.content.appendChild(numLikesDislikes);
        } catch (e) {
          con.error("[Id=" + item.id + "] Likes: " + likes + ", " + dislikes);
          con.error(e);
        }
      }
      function appendAnimatedThumbnail(item, storyboard, errorMessage){
        function mouseover() {
          function moi() {
            if (level) {
              a.src = "//s.ytimg.com/yts/img/pixel-vfl3z5WfW.gif";
              a.parentNode.style.backgroundColor = "#000";
              
              if (frame >= level.frames) frame = 0;
              rect = level.getRect(frame, box);
              a.style.width = rect.width + "px";
              a.style.height = rect.height + "px";
              a.style.backgroundSize = rect.imageWidth + "px " + rect.imageHeight + "px";
              a.style.backgroundImage = "URL(" + level.getURL(frame) + ")";
              a.style.backgroundPosition = -rect.x + "px " + -rect.y + "px";
            } else {
              if (frame > 3) frame = 1;
              if (frame < 1) frame = 1;
              a.src = urlTemplate.replace("$N", frame);
            }
            if (ytcenter.settings.videoThumbnailAnimationShuffle) {
              if (level) {
                frame = Math.round(Math.random()*(level.frames - 1));
              } else {
                frame = Math.round(Math.random()*2) + 1;
              }
            } else {
              frame++;
            }
          }
          timer2 = uw.setTimeout(function(){
            if (level) {
              timer = uw.setInterval(moi, ytcenter.settings.videoThumbnailAnimationInterval);
            } else {
              urlTemplate = originalImage.replace(/\/(mq)?default\.jpg$/, "/$N.jpg");
              timer = uw.setInterval(moi, ytcenter.settings.videoThumbnailAnimationFallbackInterval);
            }
            moi();
          }, ytcenter.settings.videoThumbnailAnimationDelay);
        }
        function mouseout() {
          uw.clearInterval(timer);
          uw.clearTimeout(timer2);
          a.src = originalImage;
          a.style.backgroundSize = "";
          a.style.backgroundImage = "";
          a.style.backgroundPosition = "";
          a.style.width = "";
          a.style.height = "";
          a.parentNode.style.backgroundColor = "";
          frame = 0;
        }
        try {
          var a = item.wrapper.getElementsByTagName("img")[0],
              b = ytcenter.player.parseThumbnailStream(storyboard || ""),
              originalImage = a.getAttribute("data-thumb") || a.src,
              timer, timer2, frame = 0, level, i, urlTemplate,
              box = { width: a.offsetWidth, height: 0 }, rect;
          if (b.levels.length > 0) {
            for (i = 0; i < b.levels.length; i++) {
              if (!level) level = b.levels[i];
              else if (b.levels[i].width > level.width)
                level = b.levels[i];
            }
          }
          if (item.mouseover) {
            mouseover();
          } else {
            mouseout();
          }
          ytcenter.utils.addEventListener(item.wrapper, "mouseover", mouseover, false);
          ytcenter.utils.addEventListener(item.wrapper, "mouseout", mouseout, false);
        } catch (e) {
          con.error(e);
        }
      }
      function appendQuality(item, stream, errorMessage) {
        var tableQuality = {
              "error": errorMessage,
              "auto": errorMessage,
              "ondemand": "OnDemand",
              "tiny": "144p",
              "small": "240p",
              "medium": "360p",
              "large": "480p",
              "hd720": "720p",
              "hd1080": "1080p",
              "hd1440": "1440p",
              "highres": "1080p+"
            },
            tableBackground = {
              "error": "#b00",
              "auto": "#b00",
              "ondemand": "#aaa",
              "tiny": "#7e587e",
              "small": "#aaa",
              "medium": "#0aa",
              "large": "#00f",
              "hd720": "#0a0",
              "hd1080": "#f00",
              "hd1440": "#000",
              "highres": "#000"
            },
            tableColor = {
              "error": "#fff",
              "auto": "#fff",
              "ondemand": "#fff",
              "tiny": "#fff",
              "small": "#fff",
              "medium": "#fff",
              "large": "#fff",
              "hd720": "#fff",
              "hd1080": "#fff",
              "hd1440": "#fff",
              "highres": "#fff"
            },
            text, background, color, wrapper = document.createElement("span");
        if (stream === "error") {
          text = tableQuality[stream];
          background = tableBackground[stream];
          color = tableColor[stream];
        } else if (stream && stream.quality === "ondemand") {
          text = tableQuality[stream.quality];
          background = tableBackground[stream.quality];
          color = tableColor[stream.quality];
        } else if (stream && stream.quality) {
          text = stream.dimension.split("x")[1] + "p";
          background = tableBackground[stream.quality];
          color = tableColor[stream.quality];
        } else if (stream && stream.size) {
          var quality = ytcenter.player.convertDimensionToQuality(stream.size);
          text = stream.size.split("x")[1] + "p";
          background = tableBackground[quality];
          color = tableColor[quality];
        }
            
        wrapper.className = (ytcenter.settings.videoThumbnailQualityVisible === "show_hover" ? " ytcenter-video-thumb-show-hover" : "")
                          + (ytcenter.settings.videoThumbnailQualityVisible === "hide_hover" ? " ytcenter-video-thumb-hide-hover" : "")
                          + " ytcenter-thumbnail-quality";
        wrapper.textContent = text;
        item.content.className += " ytcenter-thumbnail-quality-pos-" + ytcenter.settings.videoThumbnailQualityPosition;
        
        wrapper.style.background = background;
        wrapper.style.color = color;
        
        item.content.appendChild(wrapper);
      }
      function updateWatchedClass(item) {
        var watched = ytcenter.utils.hasClass(item.content, "watched"),
            am, li, s;
        if (item.itemWrapper && watched) {
          ytcenter.utils.addClass(item.itemWrapper, "ytcenter-video-watched-wrapper"); // For hiding the item
        } else if (item.itemWrapper) {
          ytcenter.utils.removeClass(item.itemWrapper, "ytcenter-video-watched-wrapper"); // For hiding the item
        }
        if (loc.pathname === "/feed/subscriptions" && !item.actionMenu) {
          item.actionMenu = item.content.parentNode.parentNode.parentNode.parentNode.nextElementSibling;
          if (item.actionMenu) {
            am = item.actionMenu.getElementsByTagName("ul")[0];
            li = document.createElement("li");
            li.setAttribute("role", "menuitem");
            s = document.createElement("span");
            s.className = "dismiss-menu-choice yt-uix-button-menu-item";
            s.setAttribute("onclick", ";return false;");
            if (ytcenter.videoHistory.isVideoWatched(item.id)) {
              s.textContent = ytcenter.language.getLocale("VIDEOWATCHED_REMOVE");
            } else {
              s.textContent = ytcenter.language.getLocale("VIDEOWATCHED_ADD");
            }
            ytcenter.utils.addEventListener(li, "click", function(){
              if (ytcenter.videoHistory.isVideoWatched(item.id)) {
                ytcenter.videoHistory.removeVideo(item.id);
                s.textContent = ytcenter.language.getLocale("VIDEOWATCHED_ADD");
              } else {
                ytcenter.videoHistory.addVideo(item.id);
                s.textContent = ytcenter.language.getLocale("VIDEOWATCHED_REMOVE");
              }
              updateWatchedMessage(item);
            }, false);
            
            li.appendChild(s);
            am.insertBefore(li, am.children[0]);
            ytcenter.events.addEvent("language-refresh", function(){
              if (ytcenter.videoHistory.isVideoWatched(item.id)) {
                s.textContent = ytcenter.language.getLocale("VIDEOWATCHED_REMOVE");
              } else {
                s.textContent = ytcenter.language.getLocale("VIDEOWATCHED_ADD");
              }
            });
          }
        }
      }
      
      function updateWatchedMessage(item) {
        var ivw = ytcenter.videoHistory.isVideoWatched(item.id),
            watchedElement;
        if (ivw) {
          watchedElement = document.createElement("div");
          if (item.content.getElementsByClassName("watched-message").length === 0
              && item.content.getElementsByClassName("watched-badge").length === 0) {
            //watchedElement.className = "watched-message";
            watchedElement.className = "watched-badge";
            watchedElement.textContent = ytcenter.language.getLocale("SETTINGS_WATCHED");
            ytcenter.language.addLocaleElement(watchedElement, "SETTINGS_WATCHED", "@textContent");
            item.content.insertBefore(watchedElement, item.content.children[0]);
          }
          ytcenter.utils.addClass(item.content, "watched");
        } else {
          ytcenter.utils.removeClass(item.content, "watched");
          if (item.itemWrapper) ytcenter.utils.removeClass(item.itemWrapper, "ytcenter-video-watched-wrapper");
        }
      }
      function subscriptionGrid(item) {
        var username = item.content.parentNode.parentNode.parentNode.parentNode.getElementsByClassName("yt-user-name")[0],
            metadata = item.content.parentNode.parentNode.getElementsByClassName("yt-lockup-meta")[0],
            actionMenu = item.content.parentNode.parentNode.parentNode.parentNode.nextElementSibling,
            usernameWrapper = document.createElement("div"), i, am, li, s,
            primaryCol = document.getElementsByClassName("branded-page-v2-primary-col");
        if (!metadata.parentNode.getElementsByClassName("ytcenter-grid-subscriptions-username") || metadata.parentNode.getElementsByClassName("ytcenter-grid-subscriptions-username").length === 0) {
          if (primaryCol && primaryCol.length > 0 && primaryCol[0]) {
            primaryCol[0].style.overflow = "visible";
            ytcenter.utils.addClass(primaryCol[0], "clearfix");
            primaryCol[0].getElementsByClassName("feed-header")[0].style.height = "32px";
          }
          usernameWrapper.appendChild(ytcenter.utils.replaceText(ytcenter.language.getLocale("SUBSCRIPTIONSGRID_BY_USERNAME"), {"{username}": username}));
          usernameWrapper.className = "ytcenter-grid-subscriptions-username";
          metadata.parentNode.insertBefore(usernameWrapper, metadata);
          
          ytcenter.events.addEvent("language-refresh", function(){
            usernameWrapper.innerHTML = "";
            usernameWrapper.appendChild(ytcenter.utils.replaceText(ytcenter.language.getLocale("SUBSCRIPTIONSGRID_BY_USERNAME"), {"{username}": username}));
          });
        }
      }
      function processItemHeavyLoad(item) {
        if (!ytcenter.settings.videoThumbnailQualityBar && !ytcenter.settings.videoThumbnailAnimationEnabled) return;
        if (ytcenter.settings.videoThumbnailQualityDownloadAt === "scroll_into_view") {
          ytcenter.domEvents.addEvent(item.wrapper, "enterview", function(){
            loadVideoConfig(item, function(stream, storyboard, errorMessage){
              if (ytcenter.settings.videoThumbnailQualityBar)
                appendQuality(item, stream, errorMessage);
              if (ytcenter.settings.videoThumbnailAnimationEnabled)
                appendAnimatedThumbnail(item, storyboard, errorMessage);
            });
          }, true);
        } else if (ytcenter.settings.videoThumbnailQualityDownloadAt === "hover_thumbnail") {
          ytcenter.utils.addEventListener(item.wrapper, "mouseover", (function(){
            var added = false;
            return function(){
              if (added) return;
              added = true;
              loadVideoConfig(item, function(stream, storyboard, errorMessage){
                if (ytcenter.settings.videoThumbnailQualityBar)
                  appendQuality(item, stream, errorMessage);
                if (ytcenter.settings.videoThumbnailAnimationEnabled)
                  appendAnimatedThumbnail(item, storyboard, errorMessage);
              });
            };
          })(), false);
        } else {
          loadVideoConfig(item, function(stream, storyboard, errorMessage){
            if (ytcenter.settings.videoThumbnailQualityBar)
              appendQuality(item, stream, errorMessage);
            if (ytcenter.settings.videoThumbnailAnimationEnabled) {
              ytcenter.utils.addEventListener(item.wrapper, "mouseover", (function(){
                var added = false;
                return function(){
                  if (added) return;
                  added = true;
                  appendAnimatedThumbnail(item, storyboard, errorMessage);
                };
              })(), false);
            }
          });
        }
      }
      function processItem(item) {
        if (!ytcenter.settings.videoThumbnailRatingsCount && !ytcenter.settings.videoThumbnailRatingsBar) return;
        if (ytcenter.settings.videoThumbnailRatingsBarDownloadAt === "hover_thumbnail" && ytcenter.settings.videoThumbnailRatingsCountDownloadAt === "hover_thumbnail") {
          ytcenter.utils.addEventListener(item.wrapper, "mouseover", (function(){
            var added = false;
            return function(){
              if (added) return;
              added = true;
              loadVideoData(item, function(likes, dislikes){
                if (ytcenter.settings.videoThumbnailRatingsCount) {
                  appendRatingCount(item, likes, dislikes);
                }
                if (ytcenter.settings.videoThumbnailRatingsBar) {
                  appendRatingBar(item, likes, dislikes);
                }
              });
            };
          })(), false);
        } else {
          if (ytcenter.settings.videoThumbnailRatingsBarDownloadAt === "page_start" || ytcenter.settings.videoThumbnailRatingsCountDownloadAt === "page_start") {
            loadVideoData(item, function(likes, dislikes){
              if (ytcenter.settings.videoThumbnailRatingsCount) {
                appendRatingCount(item, likes, dislikes);
              }
              if (ytcenter.settings.videoThumbnailRatingsBar) {
                appendRatingBar(item, likes, dislikes);
              }
            });
          } else {
            if (ytcenter.settings.videoThumbnailRatingsBarDownloadAt === "scroll_into_view" && ytcenter.settings.videoThumbnailRatingsBar) {
              ytcenter.domEvents.addEvent(item.wrapper, "enterview", function(){
                loadVideoData(item, function(likes, dislikes){
                  appendRatingBar(item, likes, dislikes);
                });
              }, true);
            } else if (ytcenter.settings.videoThumbnailRatingsBarDownloadAt === "hover_thumbnail" && ytcenter.settings.videoThumbnailRatingsBar) {
              ytcenter.utils.addEventListener(item.wrapper, "mouseover", (function(){
                var added = false;
                return function(){
                  if (added) return;
                  added = true;
                  loadVideoData(item, function(likes, dislikes){
                    appendRatingBar(item, likes, dislikes);
                  });
                };
              })(), false);
            } else if (ytcenter.settings.videoThumbnailRatingsBar) {
              loadVideoData(item, function(likes, dislikes){
                appendRatingBar(item, likes, dislikes);
              });
            }
            if (ytcenter.settings.videoThumbnailRatingsCountDownloadAt === "scroll_into_view" && ytcenter.settings.videoThumbnailRatingsCount) {
              ytcenter.domEvents.addEvent(item.wrapper, "enterview", function(){
                loadVideoData(item, function(likes, dislikes){
                  appendRatingCount(item, likes, dislikes);
                });
              }, true);
            } else if (ytcenter.settings.videoThumbnailRatingsCountDownloadAt === "hover_thumbnail" && ytcenter.settings.videoThumbnailRatingsCount) {
              ytcenter.utils.addEventListener(item.wrapper, "mouseover", (function(){
                var added = false;
                return function(){
                  if (added) return;
                  added = true;
                  loadVideoData(item, function(likes, dislikes){
                    appendRatingCount(item, likes, dislikes);
                  });
                };
              })(), false);
            } else if (ytcenter.settings.videoThumbnailRatingsCount) {
              loadVideoData(item, function(likes, dislikes){
                appendRatingCount(item, likes, dislikes);
              });
            }
          }
        }
      }
      function compareDifference(newData, oldData) {
        var i, j, a, b = [];
        for (i = 0; i < newData.length; i++) {
          a = false;
          for (j = 0; j < oldData.length; j++) {
            if (oldData[j].wrapper === newData[i].wrapper) {
              a = true;
              break;
            }
          }
          if (!a) {
            b.push(newData[i]);
          }
        }
        return b;
      }
      function updateItemInCache(data) {
        var index = getDataCacheIndex(data);
        if (data.stream && !ytcenter.settings.videoThumbnailData[index].stream) {
          ytcenter.settings.videoThumbnailData[index].stream = data.stream;
        }
        if (data.storyboard && !ytcenter.settings.videoThumbnailData[index].storyboard) {
          ytcenter.settings.videoThumbnailData[index].storyboard = data.storyboard;
        }
        if (data.likes && data.dislikes && !ytcenter.settings.videoThumbnailData[index].likes && !ytcenter.settings.videoThumbnailData[index].dislikes) {
          ytcenter.settings.videoThumbnailData[index].likes = data.likes;
          ytcenter.settings.videoThumbnailData[index].dislikes = data.dislikes;
        }
        ytcenter.saveSettings(false, true);
      }
      function updateReuse(data) {
        var index = getDataCacheIndex(data);
        if (index === -1) return;
        ytcenter.settings.videoThumbnailData[index].reused++;
        if (ytcenter.settings.videoThumbnailData[index].reused > 5)
          ytcenter.settings.videoThumbnailData[index].reused = 5;
        ytcenter.saveSettings(false, true);
      }
      function getDataCacheById(id) {
        var i;
        for (i = 0; i < ytcenter.settings.videoThumbnailData.length; i++) {
          if (id === ytcenter.settings.videoThumbnailData[i].id) return ytcenter.settings.videoThumbnailData[i];
        }
        return null;
      }
      function getDataCacheIndex(data) {
        var i;
        for (i = 0; i < ytcenter.settings.videoThumbnailData.length; i++) {
          if (data.id === ytcenter.settings.videoThumbnailData[i].id) return i;
        }
        return -1;
      }
      function isInCache(data) {
        return getDataCacheIndex(data) !== -1;
      }
      function addNewDataToCache(data) {
        if (isInCache(data)) return;
        var nData = {};
        while (ytcenter.settings.videoThumbnailData.length >= ytcenter.settings.videoThumbnailCacheSize) removeOldestFromCache();
        nData.id = data.id;
        nData.reused = 0;
        nData.date = ytcenter.utils.now();
        if (data.stream) nData.stream = data.stream;
        if (data.storyboard) nData.storyboard = data.storyboard;
        if (data.likes) nData.likes = data.likes;
        if (data.dislikes) nData.dislikes = data.dislikes;
        
        ytcenter.settings.videoThumbnailData.push(nData);
        
        ytcenter.saveSettings(false, true);
      }
      function calculateCacheLife(data) {
        return 1000*60*10 + (1000*60*5)*(data.reused ? data.reused : 0);
      }
      function removeOldestFromCache() {
        if (ytcenter.settings.videoThumbnailData.length === 0) return;
        var i, now = ytcenter.utils.now(), life, lifeRemaining, oldest = ytcenter.settings.videoThumbnailData[0], j = 0;
        for (i = 1; i < ytcenter.settings.videoThumbnailData.length; i++) {
          life = calculateCacheLife(ytcenter.settings.videoThumbnailData[i]);
          lifeRemaining = (ytcenter.settings.videoThumbnailData[i].date + life) - now;
          if (lifeRemaining < (oldest.date + calculateCacheLife(oldest)) - now) {
            oldest = ytcenter.settings.videoThumbnailData[i];
            j = i;
          }
        }
        ytcenter.settings.videoThumbnailData.splice(j, 1);
      }
      function cacheChecker() {
        if (ytcenter.settings.videoThumbnailData.length === 0) return;
        var i, now = ytcenter.utils.now(), life, nData = [];
        
        for (i = 0; i < ytcenter.settings.videoThumbnailData.length; i++) {
          life = calculateCacheLife(ytcenter.settings.videoThumbnailData[i]);
          if (now < ytcenter.settings.videoThumbnailData[i].date + life) {
            if (ytcenter.settings.videoThumbnailData[i].reused < 5) ytcenter.settings.videoThumbnailData[i].reused++;
            nData.push(ytcenter.settings.videoThumbnailData[i]);
          }
        }
        ytcenter.settings.videoThumbnailData = nData;
        ytcenter.saveSettings(false, true);
      }
      var __r = {}, videoThumbs, observer = null, observer2 = null;
      __r.update = function(){
        ytcenter.videoHistory.loadWatchedVideosFromYouTubePage();
        
        var vt = compareDifference(getVideoThumbs(), videoThumbs), i;
        for (i = 0; i < vt.length; i++) {
          ytcenter.utils.addEventListener(vt[i].wrapper, "mouseover", (function(item){
            return function(){ item.mouseover = true; };
          })(vt[i]), false);
          ytcenter.utils.addEventListener(vt[i].wrapper, "mouseout", (function(item){
            return function(){ item.mouseover = false; };
          })(vt[i]), false);
          videoThumbs.push(vt[i]);
          updateReuse(vt[i]);
          processItem(vt[i]);
          processItemHeavyLoad(vt[i]);
          if (loc.pathname === "/feed/subscriptions" && ytcenter.settings.gridSubscriptionsPage) {
            subscriptionGrid(vt[i]);
          }
          if (loc.pathname === "/" || loc.pathname === "/results" || loc.pathname.indexOf("/feed/") === 0) {
            updateWatchedClass(vt[i]);
          }
          if ((loc.pathname === "/" || loc.pathname === "/results" || loc.pathname.indexOf("/feed/") === 0) && ytcenter.settings.watchedVideosIndicator) {
            updateWatchedMessage(vt[i]);
          }
        }
      };
      __r.setupObserver = function(){
        /* Targets:
         ** #watch-related
         ** #feed
         */
        
        if (document.getElementById("content")) {
          observer = ytcenter.mutation.observe(document.getElementById("content"), { childList: true, subtree: true }, function(){
            __r.update();
            if (ytcenter.settings.commentCountryEnabled) ytcenter.comments.update();
          });
        }
        if (document.getElementById("guide")) {
          observer2 = ytcenter.mutation.observe(document.getElementById("guide"), { childList: true, subtree: true }, function(){
            __r.update();
          });
        }
      };
      __r.dispose = function(){
        if (observer) {
          observer.disconnect();
          observer = null;
        }
        if (observer2) {
          observer2.disconnect();
          observer2 = null;
        }
      };
      ytcenter.unload(__r.dispose);
      __r.setup = function(){
        try {
          var i;
          cacheChecker();
          ytcenter.videoHistory.loadWatchedVideosFromYouTubePage();
          videoThumbs = getVideoThumbs();
          for (i = 0; i < videoThumbs.length; i++) {
            ytcenter.utils.addEventListener(videoThumbs[i].wrapper, "mouseover", (function(item){
              return function(){ item.mouseover = true; };
            })(videoThumbs[i]), false);
            ytcenter.utils.addEventListener(videoThumbs[i].wrapper, "mouseout", (function(item){
              return function(){ item.mouseover = false; };
            })(videoThumbs[i]), false);
            updateReuse(videoThumbs[i]);
            processItem(videoThumbs[i]);
            processItemHeavyLoad(videoThumbs[i]);
            if (loc.pathname === "/feed/subscriptions" && ytcenter.settings.gridSubscriptionsPage) {
              subscriptionGrid(videoThumbs[i]);
            }
            if (loc.pathname === "/" || loc.pathname === "/results" || loc.pathname.indexOf("/feed/") === 0) {
              updateWatchedClass(videoThumbs[i]);
            }
            if ((loc.pathname === "/" || loc.pathname === "/results" || loc.pathname.indexOf("/feed/") === 0) && ytcenter.settings.watchedVideosIndicator) {
              updateWatchedMessage(videoThumbs[i]);
            }
          }
          __r.setupObserver();
        } catch (e) {
          con.error(e);
        }
      };
      
      return __r;
    })();
    
    ytcenter.getDebug = function(){
      var debugText = "{}", dbg = {}, a;
      try {
        dbg.htmlelements = {};
        if (document.body)
          dbg.htmlelements.body = {className: document.body.className};
        dbg.injected = injected;
        dbg.identifier = @identifier@;
        dbg.devbuild = devbuild; // variable is true if this a developer build
        dbg.devnumber = devnumber; // developer build number. Only really needed for the developer build.
        dbg.storageType = ytcenter.storageType;
        dbg.feather = ytcenter.feather;
        dbg.cookies = {};
        dbg.cookies["VISITOR_INFO1_LIVE"] = ytcenter.utils.getCookie("VISITOR_INFO1_LIVE");
        dbg.location = {
          hash: loc.hash,
          host: loc.host,
          hostname: loc.hostname,
          href: loc.href,
          origin: loc.origin,
          pathname: loc.pathname,
          port: loc.port,
          protocol: loc.protocol,
          search: loc.search
        };
        dbg.navigator = {
          userAgent: uw.navigator.userAgent,
          vendor: uw.navigator.vendor,
          vendorSub: uw.navigator.vendorSub,
          platform: uw.navigator.platform
        };
        //dbg._settings = ytcenter._settings;
        dbg.settings = {};
        for (a in ytcenter.settings) {
          if (ytcenter.settings.hasOwnProperty(a)) {
            if (ytcenter.settings.debug_settings_playersize && a === "resize-playersizes") continue;
            if (ytcenter.settings.debug_settings_buttonPlacement && (a === "buttonPlacement" || a === "buttonPlacementWatch7")) continue;
            if (ytcenter.settings.debug_settings_videoThumbnailData && a === "videoThumbnailData") continue;
            if (ytcenter.settings.debug_settings_commentCountryData && a === "commentCountryData") continue;
            if (ytcenter.settings.debug_settings_watchedVideos && a === "watchedVideos") continue;
            if (ytcenter.settings.debug_settings_notwatchedVideos && a === "notwatchedVideos") continue;
            dbg.settings[a] = ytcenter.settings[a];
          }
        }
        
        dbg.settings = ytcenter.settings;
        dbg.ytcenter = {};
        dbg.ytcenter.video = ytcenter.video;
        dbg.ytcenter.signatureDecipher = ytcenter.utils._signatureDecipher;
        dbg.ytcenter._signatureDecipher = ytcenter.utils.__signatureDecipher;
        dbg.ytcenter.player = {};
        dbg.ytcenter.player.flashvars = "";
        try {
          dbg.ytcenter.player.flashvars = document.getElementById("movie_player").getAttribute("flashvars");
        } catch (e) {
          dbg.ytcenter.player.flashvars = e;
        }
        dbg.ytcenter.player.config = ytcenter.player.config;
        try {
          dbg.ytcenter.player.apiinterface = ytcenter.player.getReference().api.getApiInterface();
        } catch (e) {
          dbg.ytcenter.player.apiinterface = {};
        }
        if (typeof dbg.ytcenter.player.reference !== "undefined") {
          dbg.ytcenter.player.reference = true;
        } else {
          dbg.ytcenter.player.reference = false;
        }
        
        try {
          var tests = ["getAvailablePlaybackRates", "getAvailableQualityLevels", "getCurrentTime", "getDebugText", "getDuration", "getPlaybackQuality", "getPlaybackRate", "getPlayerState", "getPlayerType", "getVolume", "isMuted", "isReady"];
          dbg.player_test = {};
          for (var i = 0; i < tests.length; i++) {
            if (ytcenter.player.getReference().api[tests[i]])
              dbg.player_test[tests[i]] = ytcenter.player.getReference().api[tests[i]]();
          }
        } catch (e) {
          dbg.player_test_error = e;
        }
        
        dbg.console = _console;
        
        debugText = JSON.stringify(dbg);
      } catch (e) {
        con.error(e);
        con.log("[Debug Text]", dbg);
        debugText = e.message;
      }
      return debugText;
    };
    ytcenter.alert = function(type, message, closeable){
      var __r = {},
          types = {
            "error": "yt-alert-error",
            "warning": "yt-alert-warning",
            "info": "yt-alert-info"
          },
          wrapper = document.createElement("div"),
          icon = document.createElement("div"),
          iconImg = document.createElement("img"),
          content = document.createElement("div"),
          contentVerticalTrick = document.createElement("span"),
          contentMessage = document.createElement("div");
      closeable = typeof closeable === "boolean" ? closeable : true;
      wrapper.className = "yt-alert yt-alert-default " + types[type];
      
      icon.className = "yt-alert-icon";
      iconImg.src = "//s.ytimg.com/yt/img/pixel-vfl3z5WfW.gif";
      iconImg.className = "icon master-sprite";
      
      icon.appendChild(iconImg);
      wrapper.appendChild(icon);
      
      if (closeable) {
        var buttons = document.createElement("div"),
            closeButton = document.createElement("button"),
            closeButtonText = document.createElement("span");
        buttons.className = "yt-alert-buttons";
        closeButton.setAttribute("type", "button");
        closeButton.setAttribute("role", "button");
        closeButton.setAttribute("onclick", ";return false;");
        closeButton.className = "close yt-uix-close yt-uix-button yt-uix-button-close";
        closeButton.addEventListener("click", function(){
          __r.setVisibility(false);
        });
        
        closeButtonText.className = "yt-uix-button-content";
        closeButtonText.textContent = "Close ";
        closeButton.appendChild(closeButtonText);
        buttons.appendChild(closeButton);
        wrapper.appendChild(buttons);
      }
      
      content.className = "yt-alert-content";
      
      contentVerticalTrick.className = "yt-alert-vertical-trick";
      
      contentMessage.className = "yt-alert-message";
      
      if (typeof message === "string") {
        contentMessage.textContent = message;
      } else {
        contentMessage.appendChild(message);
      }
      
      
      content.appendChild(contentVerticalTrick);
      content.appendChild(contentMessage);
      wrapper.appendChild(content);
      
      __r.setVisibility = function(visible){
        if (visible) {
          if (wrapper.parentNode) wrapper.parentNode.removeChild(wrapper);
          document.getElementById("alerts").appendChild(wrapper);
        } else {
          if (wrapper.parentNode) wrapper.parentNode.removeChild(wrapper);
        }
      };
      
      return __r;
    };
    ytcenter.message = (function(){
      var __r = {};
      
      __r.listen = function(win, origin, token, callback){
        ytcenter.utils.addEventListener(win || uw, "message", function(e){
          if (origin && e.origin !== origin) return;
          if (!e || !e.data || e.data.indexOf(token) !== 0) return; // Checking if the token is correct
          
          var data = JSON.parse(e.data.substring(token.length));
          //con.log("[Message:" + loc.href + "] Listen@" + token, data);
          callback(data);
        }, false);
      };
      
      __r.broadcast = function(win, origin, token, data){
        //con.log("[Message:" + loc.href + "] Sent@" + token, data);
        win.postMessage(token + JSON.stringify(data), origin);
      };
      return __r;
    })();
    ytcenter.domEvents = (function(){
      function onViewUpdate() {
        if (uw.self !== uw.top && !offset && !windowDim)
          return;
        onEnterViewUpdate();
        onExitViewUpdate();
        
        var i, elms = document.getElementsByTagName("iframe"), scrollOffset = null, elmOffset = null, data;
        for (i = 0; i < elms.length; i++) {
          if (elms[i] && elms[i].src && (elms[i].src.indexOf("http://apis.google.com/") === 0 || elms[i].src.indexOf("https://apis.google.com/") === 0 || elms[i].src.indexOf("http://plus.googleapis.com") === 0 || elms[i].src.indexOf("https://plus.googleapis.com") === 0) && elms[i].src.indexOf("/widget/render/comments?") !== -1) {
            scrollOffset = ytcenter.utils.getBoundingClientRect(elms[i]);
            data = { scrollOffset: scrollOffset, windowDim: windowDim || {width: window.innerWidth || document.documentElement.clientWidth, height: window.innerHeight || document.documentElement.clientHeight } };
            ytcenter.message.broadcast(
              elms[i].contentWindow,
              elms[i].src,
              "$_scroll",
              data
            );
          }
        }
      }
      function onEnterViewUpdate() {
        if (!db["enterview"]) return;
        var trash = [], i = 0, a;
        while (i < db["enterview"].length) {
          if (processEnterViewUpdate(db["enterview"][i])) {
            if (db["enterview"][i].once) {
              db["enterview"].splice(i, 1);
              i -= 1;
            }
          }
          i += 1;
        }
      }
      function onExitViewUpdate() {
        if (!db["exitview"]) return;
        var trash = [], i = 0, a;
        while (i < db["exitview"].length) {
          if (processExitViewUpdate(db["exitview"][i])) {
            if (db["exitview"][i].once) {
              db["exitview"].splice(i, 1);
              i -= 1;
            }
          }
          i += 1;
        }
      }
      function processEnterViewUpdate(item) {
        var inView = ytcenter.utils.isElementPartlyInView(item.element, offset, windowDim);
        if (!inView) {
          item.inview = false;
          return false;
        }
        if (!("inview" in item)) item.inview = false;
        if (item.inview) return false;
        item.inview = true;
        item.callback.apply(item.element, []);
        return true;
      }
      function processExitViewUpdate(item) {
        var inView = ytcenter.utils.isElementPartlyInView(item.element, offset, windowDim);
        if (inView) {
          item.inview = true;
          return false;
        }
        if (!("inview" in item)) {
          item.inview = inView;
          return false;
        }
        if (item.inview && !inView) {
          item.callback.apply(item.element, []);
        }
        item.inview = inView;
        return true;
      }
      var __r = {}, db = {}, _buffer = null, onViewUpdateBuffer = null, offset = null, windowDim = null;
      
      __r.update = function(){
        onViewUpdate();
      };
      __r.addEvent = function(elm, event, callback, once){
        if (!elm) return;
        if (!db[event]) db[event] = [];
        db[event].push({
          element: elm,
          callback: callback,
          once: once || false
        });
      };
      
      __r.ready = function(){
        if (uw.self === uw.top) return;
        if ((loc.href.indexOf("apis.google.com/u/") !== -1 || loc.href.indexOf("plus.googleapis.com") !== -1) && loc.href.indexOf("/widget/render/comments?") !== -1) {
          ytcenter.message.broadcast(
            uw.parent,
            document.referrer,
            "$_ready",
            {}
          );
        }
      };
      
      __r.setup = function(){
        if (onViewUpdateBuffer) {
          ytcenter.utils.removeEventListener(window, "scroll", onViewUpdateBuffer, false);
          ytcenter.utils.removeEventListener(window, "resize", onViewUpdateBuffer, false);
        } else {
          if ((loc.href.indexOf("apis.google.com/u/") !== -1 || loc.href.indexOf("plus.googleapis.com") !== -1) && loc.href.indexOf("/widget/render/comments?") !== -1) {
            ytcenter.message.listen(uw, null, "$_scroll", function(data){
              offset = data.scrollOffset;
              windowDim = data.windowDim;
            });
          }
          if (ytcenter.getPage() === "watch") {
            ytcenter.message.listen(uw, null, "$_ready", function(data){
              onViewUpdate();
            });
          }
        }
        onViewUpdateBuffer = ytcenter.utils.throttle(onViewUpdate, 500);
        
        ytcenter.utils.addEventListener(window, "scroll", onViewUpdateBuffer, false);
        ytcenter.utils.addEventListener(window, "resize", onViewUpdateBuffer, false);
        ytcenter.events.addEvent("ui-refresh", onViewUpdateBuffer);
        uw.setInterval(onViewUpdateBuffer, 7500); // Todo attach this to an event instead.
        onViewUpdate();
      };
      
      return __r;
    })();
    
    ytcenter.events = (function(){
      var db = {},
          __r = {};
      __r.addEvent = function(event, callback){
        if (!db.hasOwnProperty(event)) db[event] = [];
        db[event].push(callback);
      };
      __r.performEvent = function(event){
        if (!db.hasOwnProperty(event)) return;
        var staticArguments = Array.prototype.splice.call(arguments, 1, arguments.length);
        con.log("performEvent: " + event, staticArguments, arguments);
        for (var i = 0; i < db[event].length; i++) {
          try {
            db[event][i].apply(null, staticArguments);
          } catch (e) {
            con.error(e);
          }
        }
      };
      
      return __r;
    })();
    ytcenter._dialogVisible = null;
    ytcenter.dialog = function(titleLabel, content, actions, alignment){
      var __r = {}, ___parent_dialog = null, bgOverlay, root, base, fg, fgContent, footer, eventListeners = {}, actionButtons = {}, _visible = false;
      alignment = alignment || "center";
      
      bgOverlay = ytcenter.dialogOverlay();
      root = document.createElement("div");
      root.className = "ytcenter-dialog";
      base = document.createElement("div");
      base.className = "ytcenter-dialog-base";
      
      fg = document.createElement("div");
      fg.className = "ytcenter-dialog-fg";
      fgContent = document.createElement("div");
      fgContent.className = "ytcenter-dialog-fg-content ytcenter-dialog-show-content";
      fg.appendChild(fgContent);
      
      
      if (alignment === "center") {
        var align = document.createElement("span");
        align.className = "ytcenter-dialog-align";
        base.appendChild(align);
      } else {
        fg.style.margin = "13px 0";
      }
      
      base.appendChild(fg);
      root.appendChild(base);
      
      if (typeof titleLabel === "string" && titleLabel !== "") {
        var header = document.createElement("div");
        header.className = "ytcenter-dialog-header";
        var title = document.createElement("h2");
        title.className = "ytcenter-dialog-title";
        title.textContent = ytcenter.language.getLocale(titleLabel);
        ytcenter.language.addLocaleElement(title, titleLabel, "@textContent");
        
        header.appendChild(title);
        fgContent.appendChild(header);
      } else {
        var header = document.createElement("div");
        header.style.margin = "0 -20px 20px";
        fgContent.appendChild(header);
      }
      if (typeof content !== "undefined") {
        var cnt = document.createElement("div");
        cnt.className = "ytcenter-dialog-content";
        cnt.appendChild(content);
        fgContent.appendChild(cnt);
      }
      footer = document.createElement("div");
      footer.className = "ytcenter-dialog-footer";
      fgContent.appendChild(footer);
      if (typeof actions !== "undefined") {
        /* Array
         *   Object
         *     label: "",
         *     primary: false, # Should be the primary button.
         *     callback: Function
         */
        for (var i = 0; i < actions.length; i++) {
          var btn = document.createElement("button");
          btn.setAttribute("type", "button");
          btn.setAttribute("role", "button");
          btn.setAttribute("onclick", ";return false;");
          btn.className = "yt-uix-button " + (actions[i].primary ? "yt-uix-button-primary" : "yt-uix-button-default");
          if (typeof actions[i].callback === "function") {
            btn.addEventListener("click", actions[i].callback, false);
          }
          var btnContent = document.createElement("span");
          btnContent.className = "yt-uix-button-content";
          btnContent.textContent = ytcenter.language.getLocale(actions[i].label);
          ytcenter.language.addLocaleElement(btnContent, actions[i].label, "@textContent");
          
          btn.appendChild(btnContent);
          footer.appendChild(btn);
          
          if (actions[i].name) actionButtons[actions[i].name] = btn;
        }
      } else { // Default
        var closeBtn = document.createElement("button");
        closeBtn.setAttribute("type", "button");
        closeBtn.setAttribute("role", "button");
        closeBtn.setAttribute("onclick", ";return false;");
        closeBtn.className = "yt-uix-button yt-uix-button-default";
        
        closeBtn.addEventListener("click", function(){
          __r.setVisibility(false);
        }, false);
        
        var closeContent = document.createElement("span");
        closeContent.className = "yt-uix-button-content";
        closeContent.textContent = ytcenter.language.getLocale("DIALOG_CLOSE");
        ytcenter.language.addLocaleElement(closeContent, "DIALOG_CLOSE", "@textContent");
        
        closeBtn.appendChild(closeContent);
        footer.appendChild(closeBtn);
        actionButtons['close'] = btn;
      }
      __r.getActionButton = function(name){
        return actionButtons[name];
      };
      __r.addEventListener = function(eventName, func){
        if (!eventListeners.hasOwnProperty(eventName)) eventListeners[eventName] = [];
        eventListeners[eventName].push(func);
        return eventListeners[eventName].length - 1;
      };
      __r.removeEventListener = function(eventName, index){
        if (!eventListeners.hasOwnProperty(eventName)) return;
        if (index < 0 && index >= eventListeners[eventName].length) return;
        eventListeners[eventName].splice(index, 1);
      };
      __r.setWidth = function(width){
        fg.style.width = width;
      };
      __r.getBase = function(){
        return base;
      };
      __r.getContent = function(){
        return cnt;
      };
      __r.getFooter = function(){
        return footer;
      };
      __r.getHeader = function(){
        return header;
      };
      __r.setPureVisibility = function(visible){
        if (visible) {
          if (!root.parentNode) document.body.appendChild(root);
          else {
            root.parentNode.removeChild(root);
            document.body.appendChild(root);
          }
          if (!bgOverlay.parentNode) document.body.appendChild(bgOverlay);
          else {
            bgOverlay.parentNode.removeChild(bgOverlay);
            document.body.appendChild(bgOverlay);
          }
          if (document.getElementById("player-api-legacy") || document.getElementById("player-api")) (document.getElementById("player-api-legacy") || document.getElementById("player-api")).style.visibility = "hidden";
        } else {
          if (root.parentNode) root.parentNode.removeChild(root);
          if (bgOverlay.parentNode) bgOverlay.parentNode.removeChild(bgOverlay);
          if ((document.getElementById("player-api-legacy") || document.getElementById("player-api")) && !___parent_dialog) (document.getElementById("player-api-legacy") || document.getElementById("player-api")).style.visibility = "";
        }
      };
      __r.setFocus = function(focus){
        if (!base) {
          con.error("[Dialog.setFocus] base element was not found!");
          return;
        }
        if (focus) {
          base.style.zIndex = "";
        } else {
          base.style.zIndex = "1998";
        }
      };
      __r.setVisibility = function(visible){
        if (_visible === visible) return;
        _visible = visible;
        if (eventListeners["visibility"]) {
          for (var i = 0; i < eventListeners["visibility"].length; i++) {
            eventListeners["visibility"][i](visible);
          }
        }
        if (visible) {
          if (document.body) ytcenter.utils.addClass(document.body, "ytcenter-dialog-active");
          ___parent_dialog = ytcenter._dialogVisible;
          if (___parent_dialog) {
            ___parent_dialog.setFocus(false);
          }
          __r.setPureVisibility(true);
          
          ytcenter._dialogVisible = __r;
        } else {
          __r.setPureVisibility(false);
          
          if (___parent_dialog) {
            ___parent_dialog.setFocus(true);
            ytcenter._dialogVisible = ___parent_dialog;
          } else {
            ytcenter._dialogVisible = null;
            if (document.body) ytcenter.utils.removeClass(document.body, "ytcenter-dialog-active");
          }
        }
      };
      return __r;
    };
    ytcenter.dialogOverlay = function(){
      var bg = document.createElement("div");
      bg.id = "ytcenter-dialog-bg";
      bg.className = "ytcenter-dialog-bg";
      bg.style.height = Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight) + "px";
      bg.style.position = "absolute";
      return bg;
    };
    ytcenter.confirmBox = function(titleLabel, messageLabel, onConfirm, confirmLabel){ // Only being used for the resizeitemlist
      confirmLabel = confirmLabel || "EMBED_RESIZEITEMLIST_CONFIRM_DISCARD";
      var msgElm = document.createElement("h3");
      msgElm.style.fontWeight = "normal";
      msgElm.textContent = ytcenter.language.getLocale(messageLabel);
      ytcenter.language.addLocaleElement(msgElm, messageLabel, "@textContent");
      
      var dialog = ytcenter.dialog(titleLabel, msgElm, [
        {
          label: "CONFIRM_CANCEL",
          primary: false,
          callback: function(){
            try {
              onConfirm(false);
              dialog.setVisibility(false);
            } catch (e) {
              con.error(e);
            }
          }
        }, {
          label: confirmLabel,
          primary: true,
          callback: function(){
            try {
              onConfirm(true);
              dialog.setVisibility(false);
            } catch (e) {
              con.error(e);
            }
          }
        }
      ]);
      dialog.setVisibility(true);
    };
    ytcenter.welcome = (function(){
      function update() {
        return ytcenter.utils.replaceText(ytcenter.language.getLocale("WELCOME_CONTENT"),
          {
            "{lb}": function(){
              return document.createElement("br");
            },
            "{sectionbreak}": function(){
              var c = document.createElement("div");
              c.style.marginTop = "40px";
              return c;
            },
            "{img1}": img1,
            "{wiki-url}": wikilink,
            "{donate}": donatelink
          }
        );
      }
      var a = {}, dialog, b = document.createElement("div"),
          img1 = document.createElement("div"), img1src = document.createElement("img"), wikilink = document.createElement("a"), donatelink = document.createElement("a");
      img1.className = "ytcenter-image-welcome-settings-repeater";
      img1src.className = "ytcenter-image-welcome-settings clearfix";
      img1src.style.cssFloat = "right";
      img1src.style.backgroundPosition = "right";
      img1src.style.width = "100%";
      img1src.src = "//s.ytimg.com/yts/img/pixel-vfl3z5WfW.gif";
      img1.appendChild(img1src);
      wikilink.href = "https://github.com/YePpHa/YouTubeCenter/wiki";
      wikilink.setAttribute("target", "_blank");
      donatelink.href = "https://github.com/YePpHa/YouTubeCenter/wiki/Donate";
      donatelink.setAttribute("target", "_blank");
      a.createDialog = function(){
        if (dialog) return;
        donatelink.textContent = ytcenter.language.getLocale("WELCOME_CONTENT_DONATE");
        ytcenter.language.addLocaleElement(donatelink, "WELCOME_CONTENT_DONATE", "@textContent");
        wikilink.textContent = ytcenter.language.getLocale("WELCOME_CONTENT_WIKI");
        ytcenter.language.addLocaleElement(wikilink, "WELCOME_CONTENT_WIKI", "@textContent");
        ytcenter.events.addEvent("language-refresh", function(){
          b.innerHTML = "";
          b.appendChild(update());
        });
        b.appendChild(update());
        dialog = ytcenter.dialog("WELCOME_TITLE", b, [
          {
            label: "DIALOG_CLOSE",
            primary: false,
            callback: function(){
              try {
                a.setLaunchStatus(true);
                a.setVisibility(false);
              } catch (e) {
                con.error(e);
              }
            }
          }, {
            label: "WELCOME_CONFIRM_SETTINGS",
            primary: true,
            callback: function(){
              try {
                a.setLaunchStatus(true);
                a.setVisibility(false);
                if (!ytcenter.settingsPanelDialog) ytcenter.settingsPanelDialog = ytcenter.settingsPanel.createDialog();
                ytcenter.settingsPanelDialog.setVisibility(true);
              } catch (e) {
                con.error(e);
              }
            }
          }
        ]);
        dialog.setWidth("530px");
      };
      
      a.setLaunchStatus = function(launch){
        ytcenter.settings['welcome_launched'] = launch;
        ytcenter.saveSettings();
      };
      a.hasBeenLaunched = function(){
        return ytcenter.settings['welcome_launched'] ? true : false;
      };
      a.setVisibility = function(visible){
        a.createDialog();
        
        if (visible) {
          ytcenter.utils.addClass(document.body, "player-disable");
        } else {
          ytcenter.utils.removeClass(document.body, "player-disable");
        }
        dialog.setVisibility(visible);
      };
      
      return a;
    })();
    ytcenter.dragdrop = function(list){
      function mousemove(e) {
        if (!dragging) return;
        var t = ytcenter.utils.toParent(e.target, "ytcenter-dragdrop-item");
        if (t === draggingElement || t === document.body || typeof t === "undefined") return;
        
        var offset = ytcenter.utils.getOffset(e.target, t);
        var top = (typeof e.offsetY === "undefined" ? e.layerY : e.offsetY) + offset.top;
        
        if (top > t.clientHeight/2) {
          if (t.nextSibling === draggingElement) return;
          ytcenter.utils.insertAfter(draggingElement, t);
        } else {
          if (t.previousSibling === draggingElement) return;
          t.parentNode.insertBefore(draggingElement, t);
        }
        
        ytcenter.utils.each(listeners.onDragging, function(i, callback){
          callback(getItemIndex(draggingElement) /* Current Index */, draggingIndex, draggingElement);
        });
        
        if (e && e.preventDefault) {
          e.preventDefault();
        } else {
          window.event.returnValue = false;
        }
        return false;
      }
      function getItemIndex(item) {
        for (var i = 0; i < list.children.length; i++) {
          if (list.children[i] === item) return i;
        }
        return -1;
      }
      var dragging = false;
      var draggingElement;
      var draggingIndex;
      var offset;
      var listeners = {
        onDrag: [],
        onDragging: [],
        onDrop: []
      };
      var throttleFunc = null;
      
      
      ytcenter.utils.addClass(list, "ytcenter-dragdrop-notdragging");
      
      ytcenter.utils.addEventListener(list, "mousedown", function(e){
        if (!ytcenter.utils.hasClass(e.target, "ytcenter-dragdrop-handle")) return;
        if (!ytcenter.utils.hasChild(list, e.target)) return;
        draggingElement = ytcenter.utils.toParent(e.target, "ytcenter-dragdrop-item");
        if (typeof draggingElement === "undefined") return;
        
        dragging = true;
        
        ytcenter.utils.addClass(draggingElement, "ytcenter-dragdrop-dragging");
        ytcenter.utils.addClass(list, "ytcenter-dragdrop-indragging");
        ytcenter.utils.removeClass(list, "ytcenter-dragdrop-notdragging");
        
        draggingIndex = getItemIndex(draggingElement);
        
        ytcenter.utils.each(listeners.onDrag, function(i, callback){
          callback(draggingIndex, draggingElement);
        });
        throttleFunc = ytcenter.utils.throttle(mousemove, 50);
        ytcenter.utils.addEventListener(document, "mousemove", throttleFunc, false);
        
        if (e && e.preventDefault) {
          e.preventDefault();
        } else {
          window.event.returnValue = false;
        }
        return false;
      });
      ytcenter.utils.addEventListener(document, "mouseup", function(e){
        if (!dragging) return;
        
        dragging = false;
        
        ytcenter.utils.removeClass(draggingElement, "ytcenter-dragdrop-dragging");
        ytcenter.utils.removeClass(list, "ytcenter-dragdrop-indragging");
        ytcenter.utils.addClass(list, "ytcenter-dragdrop-notdragging");
        
        ytcenter.utils.each(listeners.onDrop, function(i, callback){
          callback(getItemIndex(draggingElement) /* Drop Index */, draggingIndex, draggingElement);
        });
        
        if (throttleFunc) ytcenter.utils.removeEventListener(document, "mousemove", throttleFunc);
        
        if (e && e.preventDefault) {
          e.preventDefault();
        } else {
          window.event.returnValue = false;
        }
        return false;
      });
      
      return {
        addEventListener: function(event, callback){
          if (typeof listeners[event] === "undefined") listeners[event] = [];
          listeners[event].push(callback);
        }
      };
    };
    ytcenter.style = {};
    ytcenter.style.update = function(){
      var containerWidth = 985,
          guideWidth = 175,
          guideOffset = 10,
          contentWidth = 640,
          sidebarOffset = 0;
      
      var pageWidth = containerWidth + 2*(guideWidth + guideOffset),
          sidebarWidth = containerWidth - contentWidth - sidebarOffset;
      
      // @media and screen (max-width: ...){...}
      
    };
    ytcenter.listeners = (function(){
      var __r = {};
      
      __r.addEvent = function(elm, event, callback, useCapture){
        if (elm.addEventListener) {
          elm.addEventListener(event, callback, useCapture || false);
        } else if (elm.attachEvent) {
          elm.attachEvent("on" + event, callback);
        }
      };
      
      return __r;
    })();
    ytcenter.gui = {};
    ytcenter.gui.icons = {};
    ytcenter.gui.icons.cog = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAPCAYAAAFM0aXcAAAACXBIWXMAAAsTAAALEwEAmpwYAAAKT2lDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjanVNnVFPpFj333vRCS4iAlEtvUhUIIFJCi4AUkSYqIQkQSoghodkVUcERRUUEG8igiAOOjoCMFVEsDIoK2AfkIaKOg6OIisr74Xuja9a89+bN/rXXPues852zzwfACAyWSDNRNYAMqUIeEeCDx8TG4eQuQIEKJHAAEAizZCFz/SMBAPh+PDwrIsAHvgABeNMLCADATZvAMByH/w/qQplcAYCEAcB0kThLCIAUAEB6jkKmAEBGAYCdmCZTAKAEAGDLY2LjAFAtAGAnf+bTAICd+Jl7AQBblCEVAaCRACATZYhEAGg7AKzPVopFAFgwABRmS8Q5ANgtADBJV2ZIALC3AMDOEAuyAAgMADBRiIUpAAR7AGDIIyN4AISZABRG8lc88SuuEOcqAAB4mbI8uSQ5RYFbCC1xB1dXLh4ozkkXKxQ2YQJhmkAuwnmZGTKBNA/g88wAAKCRFRHgg/P9eM4Ors7ONo62Dl8t6r8G/yJiYuP+5c+rcEAAAOF0ftH+LC+zGoA7BoBt/qIl7gRoXgugdfeLZrIPQLUAoOnaV/Nw+H48PEWhkLnZ2eXk5NhKxEJbYcpXff5nwl/AV/1s+X48/Pf14L7iJIEyXYFHBPjgwsz0TKUcz5IJhGLc5o9H/LcL//wd0yLESWK5WCoU41EScY5EmozzMqUiiUKSKcUl0v9k4t8s+wM+3zUAsGo+AXuRLahdYwP2SycQWHTA4vcAAPK7b8HUKAgDgGiD4c93/+8//UegJQCAZkmScQAAXkQkLlTKsz/HCAAARKCBKrBBG/TBGCzABhzBBdzBC/xgNoRCJMTCQhBCCmSAHHJgKayCQiiGzbAdKmAv1EAdNMBRaIaTcA4uwlW4Dj1wD/phCJ7BKLyBCQRByAgTYSHaiAFiilgjjggXmYX4IcFIBBKLJCDJiBRRIkuRNUgxUopUIFVIHfI9cgI5h1xGupE7yAAygvyGvEcxlIGyUT3UDLVDuag3GoRGogvQZHQxmo8WoJvQcrQaPYw2oefQq2gP2o8+Q8cwwOgYBzPEbDAuxsNCsTgsCZNjy7EirAyrxhqwVqwDu4n1Y8+xdwQSgUXACTYEd0IgYR5BSFhMWE7YSKggHCQ0EdoJNwkDhFHCJyKTqEu0JroR+cQYYjIxh1hILCPWEo8TLxB7iEPENyQSiUMyJ7mQAkmxpFTSEtJG0m5SI+ksqZs0SBojk8naZGuyBzmULCAryIXkneTD5DPkG+Qh8lsKnWJAcaT4U+IoUspqShnlEOU05QZlmDJBVaOaUt2ooVQRNY9aQq2htlKvUYeoEzR1mjnNgxZJS6WtopXTGmgXaPdpr+h0uhHdlR5Ol9BX0svpR+iX6AP0dwwNhhWDx4hnKBmbGAcYZxl3GK+YTKYZ04sZx1QwNzHrmOeZD5lvVVgqtip8FZHKCpVKlSaVGyovVKmqpqreqgtV81XLVI+pXlN9rkZVM1PjqQnUlqtVqp1Q61MbU2epO6iHqmeob1Q/pH5Z/YkGWcNMw09DpFGgsV/jvMYgC2MZs3gsIWsNq4Z1gTXEJrHN2Xx2KruY/R27iz2qqaE5QzNKM1ezUvOUZj8H45hx+Jx0TgnnKKeX836K3hTvKeIpG6Y0TLkxZVxrqpaXllirSKtRq0frvTau7aedpr1Fu1n7gQ5Bx0onXCdHZ4/OBZ3nU9lT3acKpxZNPTr1ri6qa6UbobtEd79up+6Ynr5egJ5Mb6feeb3n+hx9L/1U/W36p/VHDFgGswwkBtsMzhg8xTVxbzwdL8fb8VFDXcNAQ6VhlWGX4YSRudE8o9VGjUYPjGnGXOMk423GbcajJgYmISZLTepN7ppSTbmmKaY7TDtMx83MzaLN1pk1mz0x1zLnm+eb15vft2BaeFostqi2uGVJsuRaplnutrxuhVo5WaVYVVpds0atna0l1rutu6cRp7lOk06rntZnw7Dxtsm2qbcZsOXYBtuutm22fWFnYhdnt8Wuw+6TvZN9un2N/T0HDYfZDqsdWh1+c7RyFDpWOt6azpzuP33F9JbpL2dYzxDP2DPjthPLKcRpnVOb00dnF2e5c4PziIuJS4LLLpc+Lpsbxt3IveRKdPVxXeF60vWdm7Obwu2o26/uNu5p7ofcn8w0nymeWTNz0MPIQ+BR5dE/C5+VMGvfrH5PQ0+BZ7XnIy9jL5FXrdewt6V3qvdh7xc+9j5yn+M+4zw33jLeWV/MN8C3yLfLT8Nvnl+F30N/I/9k/3r/0QCngCUBZwOJgUGBWwL7+Hp8Ib+OPzrbZfay2e1BjKC5QRVBj4KtguXBrSFoyOyQrSH355jOkc5pDoVQfujW0Adh5mGLw34MJ4WHhVeGP45wiFga0TGXNXfR3ENz30T6RJZE3ptnMU85ry1KNSo+qi5qPNo3ujS6P8YuZlnM1VidWElsSxw5LiquNm5svt/87fOH4p3iC+N7F5gvyF1weaHOwvSFpxapLhIsOpZATIhOOJTwQRAqqBaMJfITdyWOCnnCHcJnIi/RNtGI2ENcKh5O8kgqTXqS7JG8NXkkxTOlLOW5hCepkLxMDUzdmzqeFpp2IG0yPTq9MYOSkZBxQqohTZO2Z+pn5mZ2y6xlhbL+xW6Lty8elQfJa7OQrAVZLQq2QqboVFoo1yoHsmdlV2a/zYnKOZarnivN7cyzytuQN5zvn//tEsIS4ZK2pYZLVy0dWOa9rGo5sjxxedsK4xUFK4ZWBqw8uIq2Km3VT6vtV5eufr0mek1rgV7ByoLBtQFr6wtVCuWFfevc1+1dT1gvWd+1YfqGnRs+FYmKrhTbF5cVf9go3HjlG4dvyr+Z3JS0qavEuWTPZtJm6ebeLZ5bDpaql+aXDm4N2dq0Dd9WtO319kXbL5fNKNu7g7ZDuaO/PLi8ZafJzs07P1SkVPRU+lQ27tLdtWHX+G7R7ht7vPY07NXbW7z3/T7JvttVAVVN1WbVZftJ+7P3P66Jqun4lvttXa1ObXHtxwPSA/0HIw6217nU1R3SPVRSj9Yr60cOxx++/p3vdy0NNg1VjZzG4iNwRHnk6fcJ3/ceDTradox7rOEH0x92HWcdL2pCmvKaRptTmvtbYlu6T8w+0dbq3nr8R9sfD5w0PFl5SvNUyWna6YLTk2fyz4ydlZ19fi753GDborZ752PO32oPb++6EHTh0kX/i+c7vDvOXPK4dPKy2+UTV7hXmq86X23qdOo8/pPTT8e7nLuarrlca7nuer21e2b36RueN87d9L158Rb/1tWeOT3dvfN6b/fF9/XfFt1+cif9zsu72Xcn7q28T7xf9EDtQdlD3YfVP1v+3Njv3H9qwHeg89HcR/cGhYPP/pH1jw9DBY+Zj8uGDYbrnjg+OTniP3L96fynQ89kzyaeF/6i/suuFxYvfvjV69fO0ZjRoZfyl5O/bXyl/erA6xmv28bCxh6+yXgzMV70VvvtwXfcdx3vo98PT+R8IH8o/2j5sfVT0Kf7kxmTk/8EA5jz/GMzLdsAAAAgY0hSTQAAeiUAAICDAAD5/wAAgOkAAHUwAADqYAAAOpgAABdvkl/FRgAAAkFJREFUeNpi+v//P8OqVatcmVavXt3JwMDwGAAAAP//Yvr//z/D////GZhWr179f/Xq1RMBAAAA//9igqr5D8WKTAwQ0MPAwPCEgYGhBwAAAP//TMtBEUBQAAXA9ZsII8IrIIQOBHF5EdwU42TGffcT+/8e2No+MLAmmaDtMnC3PTEnuV4AAAD//zTOQRGCUAAG4YWrCbxSwQzYYDt452AGHCKQ4H9gAYNwcsabMeDyKLD7nY01SZfkn2ROMiV5n80euABf9VoFA3ArpYyt+gEe9bEDW6Uu6rMFUH8VcgdeaqMOAAcZZIiDMBQE0cdv0jQhQREMGDRB9B5Ihssguc2OhHsg4ACoKhQgSIPAbDGsG7GZee/HHhFVRByHPPRPbJ+BGbCxPU5HdQHewBrosvMFXCX1BTgAVQ4ZAXdgZftWgB3/9wRcJC3T8jaRpulgX2zXwAKY51cDXICmSOqTrQNOwEdSK+nxZZJ8VSIKoyD+24uw3CAIYhAEBZNdbK6r0ShM9AH2abRpNwhnwEfQVaPYDQZBk4KIZTX4p8wut33nMMw3Z2a6d/aqqp93W1WvSfm4gxlUVTvzIfYOgF/gy/ZzrF6KjJHtx+i9Bu5st9MeIOkGWAO+o38VuAJOgTdgPUQXwCYwB9DYHof1CegHdChpT9JI0gpwm/0BMAE+bY8bSUNgPil9BHRm+9L2ie0XYDv7+5jXkzScNv4HOAcWMr8Du6nccn5+SB//4tHs5gmwBeyEdRE46hDtS9pIhk084n8AVJscCePQvIsAAAAASUVORK5CYII=";
    ytcenter.gui.createMiddleAlignHack = function(content){
      var e = document.createElement("div"),
          a = document.createElement("span");
      a.className = "yt-dialog-align";
      content.style.verticalAlign = "middle";
      content.style.display = "inline-block";
      
      e.appendChild(a);
      e.appendChild(content);
      return e;
    };
    ytcenter.gui.createYouTubeButtonIcon = function(src){
      var wrapper = document.createElement("span");
      wrapper.className = "yt-uix-button-icon-wrapper";
      
      var img = document.createElement("img");
      img.src = src;
      img.alt = "";
      img.style.marginLeft = "3px";
      
      wrapper.appendChild(img);
      return wrapper;
    };
    ytcenter.gui.createYouTubeButtonArrow = function(){
      var img = document.createElement("img");
      img.className = "yt-uix-button-arrow";
      img.src = "//s.ytimg.com/yts/img/pixel-vfl3z5WfW.gif";
      img.alt = "";
      
      return img;
    };
    ytcenter.gui.createYouTubeTextInput = function(){
      var elm = document.createElement("input");
      elm.setAttribute("type", "text");
      elm.className = "yt-uix-form-input-text";
      
      return elm;
    };
    ytcenter.gui.createYouTubeCheckBox = function(selected){
      if (typeof selected === "undefined") selected = false;
      var cw = document.createElement("span");
      cw.className = "yt-uix-form-input-checkbox-container" + (selected ? " checked" : "");
      cw.style.height = "auto";
      var checkbox = document.createElement("input");
      checkbox.setAttribute("type", "checkbox");
      checkbox.setAttribute("value", "true");
      checkbox.className = "yt-uix-form-input-checkbox";
      if (selected) checkbox.checked = true;
      var elm = document.createElement("span");
      elm.className = "yt-uix-form-input-checkbox-element";
      cw.appendChild(checkbox);
      cw.appendChild(elm);
      
      return cw;
    };
    ytcenter.gui.createYouTubeButtonText = function(text){
      var wrapper = document.createElement("span");
      wrapper.className = "yt-uix-button-content";
      
      wrapper.textContent = text;
      return wrapper;
    };
    ytcenter.gui.createYouTubeButtonTextLabel = function(label){
      var wrapper = document.createElement("span");
      wrapper.className = "yt-uix-button-content";
      wrapper.textContent = ytcenter.language.getLocale(label);
      ytcenter.language.addLocaleElement(wrapper, label, "@textContent");
      
      return wrapper;
    };
    ytcenter.gui.createYouTubeButton = function(title, content, styles){
      var btn = document.createElement("button");
      if (typeof title === "string" && title !== "") {
        btn.setAttribute("title", ytcenter.language.getLocale(title));
        ytcenter.language.addLocaleElement(btn, title, "title");
      }
      btn.setAttribute("role", "button");
      btn.setAttribute("type", "button");
      btn.setAttribute("onclick", ";return false;");
      btn.className = "yt-uix-tooltip-reverse yt-uix-button yt-uix-button-text yt-uix-tooltip";
      
      if (typeof styles !== "undefined") {
        for (var key in styles) {
          if (styles.hasOwnProperty(key)) {
            btn.style[key] = styles[key];
          }
        }
      }
      
      for (var i = 0; i < content.length; i++) {
        btn.appendChild(content[i]);
      }
      return btn;
    };
    ytcenter.gui.createYouTubeDefaultButton = function(title, content, styles){
      var btn = document.createElement("button");
      if (title !== "") {
        btn.setAttribute("title", ytcenter.language.getLocale(title));
        ytcenter.language.addLocaleElement(btn, title, "title");
      }
      btn.setAttribute("role", "button");
      btn.setAttribute("type", "button");
      btn.setAttribute("onclick", ";return false;");
      btn.className = "yt-uix-button yt-uix-button-default yt-uix-tooltip";
      
      if (typeof styles !== "undefined") {
        for (var key in styles) {
          if (styles.hasOwnProperty(key)) {
            btn.style[key] = styles[key];
          }
        }
      }
      
      for (var i = 0; i < content.length; i++) {
        btn.appendChild(content[i]);
      }
      return btn;
    };
    ytcenter.gui.createYouTubePrimaryButton = function(title, content, styles){
      var btn = document.createElement("button");
      if (title !== "") {
        btn.setAttribute("title", ytcenter.language.getLocale(title));
        ytcenter.language.addLocaleElement(btn, title, "title");
      }
      btn.setAttribute("role", "button");
      btn.setAttribute("type", "button");
      btn.setAttribute("onclick", ";return false;");
      btn.setAttribute("class", "yt-uix-tooltip-reverse yt-uix-button yt-uix-button-primary yt-uix-tooltip");
      
      if (typeof styles !== "undefined") {
        for (var key in styles) {
          if (styles.hasOwnProperty(key)) {
            btn.style[key] = styles[key];
          }
        }
      }
      
      for (var i = 0; i < content.length; i++) {
        btn.appendChild(content[i]);
      }
      return btn;
    };
    ytcenter.gui.createYouTubeButtonGroup = function(buttons){
      // <span style="margin: 0px 4px 0px 0px;" class="yt-uix-button-group yt-uix-tooltip-reverse"> start end
      var wrapper = document.createElement("span");
      wrapper.className = "yt-uix-button-group";
      
      for (var i = 0; i < buttons.length; i++) {
        if (i == 0) {
          ytcenter.utils.addClass(buttons[i], "start");
        } else {
          ytcenter.utils.removeClass(buttons[i], "start");
        }
        if (i === buttons.length-1) {
          ytcenter.utils.addClass(buttons[i], "end");
        } else {
          ytcenter.utils.removeClass(buttons[i], "end");
        }
        wrapper.appendChild(buttons[i]);
      }
      
      return wrapper;
    };
    ytcenter.gui.createYouTubeGuideHelpBoxAfter = function(){
      var after = document.createElement("div");
      after.className = "after";
      
      return after;
    };
    ytcenter.gui.createMask = function(zIndex){
      zIndex = zIndex || "4";
      var iframe = document.createElement("iframe");
      iframe.setAttribute("frameborder", "0");
      iframe.setAttribute("src", "");
      iframe.style.position = "absolute";
      iframe.style.top = "0px";
      iframe.style.left = "0px";
      iframe.style.width = "100%";
      iframe.style.height = "100%";
      iframe.style.overflow = "hidden";
      iframe.style.zIndex = zIndex;
      
      return iframe;
    };
    ytcenter.listeners = (function(){
      var __r = {};
      
      __r.addEvent = function(elm, event, callback, useCapture){
        if (elm.addEventListener) {
          elm.addEventListener(event, callback, useCapture || false);
        } else if (elm.attachEvent) {
          elm.attachEvent("on" + event, callback);
        }
      };
      
      return __r;
    })();
    ytcenter.modules = {};
    ytcenter.modules.aboutText = function(option){
      var elm = document.createElement("div"),
          content1 = document.createElement("div");
      content1.textContent = ytcenter.language.getLocale("SETTINGS_ABOUT_COPYRIGHTS");
      elm.appendChild(content1);
      elm.appendChild(document.createElement("br"));
      elm.appendChild(ytcenter.utils.replaceText(ytcenter.language.getLocale("SETTINGS_ABOUT_TEXT"), {
        "{email}": function(){
          var a = document.createElement("a");
          a.href = "mailto:jepperm@gmail.com";
          a.textContent = "jepperm@gmail.com";
          return a;
        },
        "{lb}": function(){
          return document.createElement("br");
        }
      }));
      
      ytcenter.events.addEvent("language-refresh", function(){
        elm.innerHTML = "";
        content1 = document.createElement("div");
        content1.textContent = ytcenter.language.getLocale("SETTINGS_ABOUT_COPYRIGHTS");
        elm.appendChild(content1);
        elm.appendChild(document.createElement("br"));
        elm.appendChild(ytcenter.utils.replaceText(ytcenter.language.getLocale("SETTINGS_ABOUT_TEXT"), {
          "{email}": function(){
            var a = document.createElement("a");
            a.href = "mailto:jepperm@gmail.com";
            a.textContent = "jepperm@gmail.com";
            return a;
          },
          "{lb}": function(){
            return document.createElement("br");
          }
        }));
      });
      
      return {
        element: elm,
        bind: function(){},
        update: function(){}
      };
    };
    ytcenter.modules.bool = function(option){
      function update(checked) {
        checkboxInput.checked = checked;
        if (checked) {
          ytcenter.utils.addClass(checkboxOuter, "checked");
        } else {
          ytcenter.utils.removeClass(checkboxOuter, "checked");
        }
      }
      function bind(callback) {
        boundCallback = callback;
      }
      var boundCallback = null,
          frag = document.createDocumentFragment(),
          checkboxOuter = document.createElement("span"),
          checkboxInput = document.createElement("input"),
          checkboxOverlay = document.createElement("span"),
          checked = ytcenter.settings[option.defaultSetting];
      if (typeof checked !== "boolean") checked = false; // Just to make sure it's a boolean!
      checkboxOuter.className = "yt-uix-form-input-checkbox-container" + (checked ? " checked" : "");
      checkboxInput.className = "yt-uix-form-input-checkbox";
      checkboxOverlay.className = "yt-uix-form-input-checkbox-element";
      checkboxInput.checked = checked;
      checkboxInput.setAttribute("type", "checkbox");
      checkboxInput.setAttribute("value", checked);
      checkboxOuter.appendChild(checkboxInput);
      checkboxOuter.appendChild(checkboxOverlay);
      ytcenter.utils.addEventListener(checkboxOuter, "click", function(){
        checked = !checked;
        if (checked) {
          ytcenter.utils.addClass(checkboxOuter, "checked");
          checkboxInput.checked = true;
        } else {
          ytcenter.utils.removeClass(checkboxOuter, "checked");
          checkboxInput.checked = false;
        }
        checkboxInput.setAttribute("value", checked);
        
        if (boundCallback) boundCallback(checked);
        if (option && option.args && option.args.listeners) {
          for (var i = 0; i < option.args.listeners.length; i++) {
            if (option.args.listeners[i].event === "click") option.args.listeners[i].callback.apply(this, arguments);
          }
        }
      }, false);
      
      frag.appendChild(checkboxOuter);
      
      return {
        element: frag,
        bind: bind,
        update: update
      };
    };
    ytcenter.modules.button = function(option){
      var elm = document.createElement("button");
      elm.setAttribute("type", "button");
      elm.setAttribute("role", "button");
      elm.setAttribute("onclick", ";return false;");
      elm.className = "yt-uix-button yt-uix-button-default";
      var c = document.createElement("span");
      c.className = "yt-uix-button-content";
      if (option && option.args && option.args.text) {
        c.textContent = ytcenter.language.getLocale(option.args.text);
        ytcenter.language.addLocaleElement(c, option.args.text, "@textContent");
      }
      if (option && option.args && option.args.listeners) {
        for (var j = 0; j < option.args.listeners.length; j++) {
          elm.addEventListener(option.args.listeners[j].event, option.args.listeners[j].callback, (option.args.listeners[j].bubble ? option.args.listeners[j].bubble : false));
        }
      }
      if (option && option.args && option.args.style) {
        for (var key in option.args.style) {
          if (option.args.style.hasOwnProperty(key)) {
            elm.style[key] = option.args.style[key];
          }
        }
      }
      elm.appendChild(c);
      return {
        element: elm,
        bind: function(){},
        update: function(){},
        addEventListener: function(event, callback, bubble){
          elm.addEventListener(event, callback, bubble);
        },
        removeEventListener: function(event, callback, bubble){
          elm.removeEventListener(event, callback, bubble);
        }
      };
    };
    ytcenter.modules.checkbox = function(selected){
      selected = selected || false;
      var wrapper = document.createElement("span");
      wrapper.className = "ytcenter-embed";
      
      var cw = document.createElement("span");
      cw.className = "yt-uix-form-input-checkbox-container" + (selected ? " checked" : "");
      var checkbox = document.createElement("input");
      checkbox.setAttribute("type", "checkbox");
      checkbox.setAttribute("value", "true");
      checkbox.className = "yt-uix-form-input-checkbox";
      if (selected) checkbox.checked = true;
      var elm = document.createElement("span");
      elm.className = "yt-uix-form-input-checkbox-element";
      cw.appendChild(checkbox);
      cw.appendChild(elm);
      
      wrapper.appendChild(cw);
      
      return {
        element: wrapper, // So the element can be appended to an element.
        bind: function(callback){
          ytcenter.utils.addEventListener(checkbox, "change", function(){
            callback(ytcenter.utils.hasClass(cw, "checked"));
          }, false);
        },
        update: function(value){
          if (value === true) {
            ytcenter.utils.addClass(cw, "checked");
            checkbox.checked = true;
          } else {
            ytcenter.utils.removeClass(cw, "checked");
            checkbox.checked = false;
          }
        },
        fixHeight: function(){
          cw.style.height = "auto";
        },
        isSelected: function(){
          return checkbox.checked;
        }
      };
    };
    ytcenter.modules.colorpicker = function(option){
      function update() {
        wrapper.style.background = ytcenter.utils.colorToHex(red, green, blue);
        currentColor.style.background = ytcenter.utils.colorToHex(red, green, blue);
        redRange.update(red);
        greenRange.update(green);
        blueRange.update(blue);
        htmlColor.update(ytcenter.utils.colorToHex(red, green, blue));
      }
      function updateHueRange() {
        if (Math.max(red, green, blue) !== Math.min(red, green, blue)) {
          hueRange.update(hsv.hue);
        }
      }
     function updateColorField() {
        if (Math.max(red, green, blue) !== Math.min(red, green, blue)) {
          hsv = ytcenter.utils.getHSV(red, green, blue);
          hueRangeField.update(hsv.hue, hsv.saturation, hsv.value);
        } else {
          var __hsv = ytcenter.utils.getHSV(red, green, blue);
          if (hsv.value > hsv.saturation) {
            hsv.saturation = __hsv.saturation;
          } else if (hsv.value < hsv.saturation) {
            hsv.value = __hsv.value;
          } else {
            hsv.saturation = __hsv.saturation;
            hsv.value = __hsv.value;
          }
          hueRangeField.update(hsv.hue, hsv.saturation, hsv.value);
        }
      }
      var red = 0, green = 0, blue = 0, sessionHex = "#000000", hsv = ytcenter.utils.getHSV(red, green, blue), _hue = hsv.hue, bCallback,
          wrapper = document.createElement("span"),
          redRange = ytcenter.modules.range({
            args: {
              value: red,
              min: 0,
              max: 255
            }
          }), greenRange = ytcenter.modules.range({
            args: {
              value: green,
              min: 0,
              max: 255
            }
          }), blueRange = ytcenter.modules.range({
            args: {
              value: blue,
              min: 0,
              max: 255
            }
          }),
          rWrapper = document.createElement("div"),
          rText = ytcenter.modules.label({label: "COLORPICKER_COLOR_RED"}),
          gWrapper = document.createElement("div"),
          gText = ytcenter.modules.label({label: "COLORPICKER_COLOR_GREEN"}),
          bWrapper = document.createElement("div"),
          bText = ytcenter.modules.label({label: "COLORPICKER_COLOR_BLUE"}),
          hueWrapper = document.createElement("div"), 
          hueRangeField = ytcenter.modules.colorPickerField(),
          rgb, hueRangeHandle = document.createElement("div"),
          hueRangeHandleRight = document.createElement("div"),
          hueRange = ytcenter.modules.range({
            args: {
              value: hsv.hue,
              min: 0,
              max: 360,
              method: "vertical",
              handle: hueRangeHandle,
              offset: 7
            }
          }), d1, d2, d3, d4, d5, d6,
          hWrapper = document.createElement("div"),
          htmlColorLabel = ytcenter.utils.wrapModule(ytcenter.modules.label({label: "COLORPICKER_COLOR_HTMLCODE"})),
          htmlColor = ytcenter.modules.textfield(),
          currentColor = document.createElement("span"),
          rgbWrapper = document.createElement("div"),
          cpWrapper = document.createElement("div"),
          dialog;
      wrapper.className += " ytcenter-modules-colorpicker";
      redRange.bind(function(value){
        red = value;
        update();
        updateHueRange();
        updateColorField();
      });
      greenRange.bind(function(value){
        green = value;
        update();
        updateHueRange();
        updateColorField();
      });
      blueRange.bind(function(value){
        blue = value;
        update();
        updateHueRange();
        updateColorField();
      });
      
      rWrapper.appendChild(rText.element);
      rWrapper.appendChild(redRange.element);
      gWrapper.appendChild(gText.element);
      gWrapper.appendChild(greenRange.element);
      bWrapper.appendChild(bText.element);
      bWrapper.appendChild(blueRange.element);
      
      hueWrapper.className += " ytcenter-modules-colorpicker-huewrapper";
      hueRangeField.bind(function(saturation, value){
        hsv.saturation = saturation;
        hsv.value = value;
        rgb = ytcenter.utils.getRGB(hsv.hue, hsv.saturation, hsv.value);
        red = rgb.red;
        green = rgb.green;
        blue = rgb.blue;
        update();
      });
      hueRangeField.element.className += " ytcenter-modules-colorpickerfield-hue";
      hueRangeHandle.className += " ytcenter-modules-range-handle";
      hueRangeHandleRight.className += " ytcenter-modules-range-handle-right";
      hueRangeHandle.appendChild(hueRangeHandleRight);
      
      
      hueRange.element.className += " ytcenter-modules-huerange ytcenter-modules-hue";
      d1 = document.createElement("div");
      d1.className = "ie-1";
      d2 = document.createElement("div");
      d2.className = "ie-2";
      d3 = document.createElement("div");
      d3.className = "ie-3";
      d4 = document.createElement("div");
      d4.className = "ie-4";
      d5 = document.createElement("div");
      d5.className = "ie-5";
      d6 = document.createElement("div");
      d6.className = "ie-6";
      hueRange.element.appendChild(d1);
      hueRange.element.appendChild(d2);
      hueRange.element.appendChild(d3);
      hueRange.element.appendChild(d4);
      hueRange.element.appendChild(d5);
      hueRange.element.appendChild(d6);
      hueRange.bind(function(value){
        hsv.hue = value;
        rgb = ytcenter.utils.getRGB(hsv.hue, hsv.saturation, hsv.value);
        red = rgb.red;
        green = rgb.green;
        blue = rgb.blue;
        update();
        updateColorField();
      });
      hWrapper.className += " ytcenter-modules-hwrapper";
      htmlColorLabel.className += " ytcenter-modules-htmlcolorlabel";
      htmlColor.bind(function(value){
        rgb = ytcenter.utils.hexToColor(value);
        red = rgb.red;
        green = rgb.green;
        blue = rgb.blue;
        
        hsv = ytcenter.utils.getHSV(red, green, blue);
        
        update();
        updateHueRange();
        updateColorField();
      });
      htmlColor.element.className += " ytcenter-modules-htmlcolor";
      
      currentColor.className += " ytcenter-modules-currentcolor";
      currentColor.style.background = sessionHex;
      
      htmlColor.element.appendChild(currentColor);
      
      hWrapper.appendChild(htmlColorLabel);
      hWrapper.appendChild(htmlColor.element);
      
      rgbWrapper.className += " ytcenter-modules-rgbwrapper";
      rgbWrapper.appendChild(rWrapper);
      rgbWrapper.appendChild(gWrapper);
      rgbWrapper.appendChild(bWrapper);
      
      rgbWrapper.appendChild(hWrapper);
      
      if (option && option.args && option.args.presetColors && option.args.presetColors.length > 0) {
        var presets = document.createElement("div"),
            presetsLabel = ytcenter.utils.wrapModule(ytcenter.modules.label({label: "COLORPICKER_PRESETS"})),
            i, color;
        presets.className = "ytcenter-colorpicker-presets clearfix";
        presetsLabel.className = "ytcenter-colorpicker-presets-label";
        
        presets.appendChild(presetsLabel);
        
        for (i = 0; i < option.args.presetColors.length; i++) {
          color = document.createElement("div");
          color.className = "ytcenter-colorpicker-presets-color";
          color.style.background = option.args.presetColors[i];
          ytcenter.utils.addEventListener(color, "click", (function(bgcolor){
            return function(){
              rgb = ytcenter.utils.hexToColor(bgcolor);
              red = rgb.red;
              green = rgb.green;
              blue = rgb.blue;
              
              hsv = ytcenter.utils.getHSV(red, green, blue);
              
              update();
              updateHueRange();
              updateColorField();
            };
          })(option.args.presetColors[i]), false);
          presets.appendChild(color);
        }
        
        rgbWrapper.appendChild(presets);
      }
      
      hueWrapper.appendChild(hueRangeField.element);
      hueWrapper.appendChild(hueRange.element);
      
      cpWrapper.className += " ytcenter-modules-cpwrapper";
      cpWrapper.appendChild(hueWrapper);
      cpWrapper.appendChild(rgbWrapper);
      
      dialog = ytcenter.dialog("COLORPICKER_TITLE", cpWrapper, [
        {
          label: "COLORPICKER_CANCEL",
          primary: false,
          callback: function(){
            rgb = ytcenter.utils.hexToColor(sessionHex);
            red = rgb.red;
            green = rgb.green;
            blue = rgb.blue;
            update();
            updateHueRange();
            updateColorField();
            ytcenter.events.performEvent("ui-refresh");
            
            dialog.setVisibility(false);
          }
        }, {
          label: "COLORPICKER_SAVE",
          primary: true,
          callback: function(){
            ytcenter.events.performEvent("ui-refresh");
            sessionHex = ytcenter.utils.colorToHex(red, green, blue);
            if (bCallback) bCallback(sessionHex);
            dialog.setVisibility(false);
          }
        }
      ]);
      
      ytcenter.utils.addEventListener(wrapper, "click", function(){
        dialog.setVisibility(true);
        ytcenter.events.performEvent("ui-refresh");
        ytcenter.events.performEvent("settings-update");
        update();
      });
      
      update();
      updateHueRange();
      updateColorField();
      
      return {
        element: wrapper,
        bind: function(callback){
          bCallback = callback;
        },
        update: function(value){
          sessionHex = value;
          rgb = ytcenter.utils.hexToColor(sessionHex);
          red = rgb.red;
          green = rgb.green;
          blue = rgb.blue;
          update();
          updateHueRange();
          updateColorField();
          //ytcenter.events.performEvent("ui-refresh");
        }
      };
    };
    ytcenter.modules.colorPickerField = function(option){
      function update() {
        var x = sat/100*wrapper.clientWidth,
            y = (100 - val)/100*wrapper.clientHeight;
        handler.style.top = Math.round(y - handler.offsetHeight/2) + "px";
        handler.style.left = Math.round(x - handler.offsetWidth/2) + "px";
      }
      function updateBackground() {
        wrapper.style.background = ytcenter.utils.hsvToHex(hue, 100, 100);
      }
      function eventToValue(e) {
        var offset = ytcenter.utils.getOffset(wrapper),
            scrollOffset = ytcenter.utils.getScrollOffset(),
            x = Math.max(0, Math.min(e.pageX - offset.left - scrollOffset.left, wrapper.clientWidth)),
            y = e.pageY - offset.top - scrollOffset.top;
        
        if (y < 0) y = 0;
        if (y > wrapper.clientHeight) y = wrapper.clientHeight;
        
        sat = x/wrapper.clientWidth*100;
        val = 100 - y/wrapper.clientHeight*100;
      }
      function mousemove(e) {
        if (!mousedown) return;
        eventToValue(e);
        update();
        if (bCallback) bCallback(sat, val);
        
        if (e && e.preventDefault) {
          e.preventDefault();
        } else {
          window.event.returnValue = false;
        }
        return false;
      }
      var bCallback,
          hue = (option && option.args && option.args.hue) || 0,
          sat = (option && option.args && option.args.sat) || 0,
          val = (option && option.args && option.args.val) || 0,
          wrapper = document.createElement("div"),
          _sat = document.createElement("div"),
          _value = document.createElement("div"),
          handler = document.createElement("div"),
          mousedown = false, throttleFunc = null;
      
      wrapper.style.background = ytcenter.utils.hsvToHex(hue, 100, 100);
      wrapper.style.position = "relative"; // CLASS!!
      wrapper.style.overflow = "hidden"; // CLASS!!
      
      _sat.className = "ytcenter-modules-colorpicker-saturation";
      
      _value.className = "ytcenter-modules-colorpicker-value";
      _sat.appendChild(_value);
      
      wrapper.appendChild(_sat);
      
      handler.className = "ytcenter-modules-colorpicker-handler";
      
      wrapper.appendChild(handler);
      
      ytcenter.utils.addEventListener(wrapper, "mousedown", function(e){
        if (mousedown) return;
        mousedown = true;
        
        eventToValue(e);
        update();
        if (bCallback) bCallback(sat, val);
        
        throttleFunc = ytcenter.utils.throttle(mousemove, 50);
        ytcenter.utils.addEventListener(document, "mousemove", throttleFunc, false);
        if (e && e.preventDefault) {
          e.preventDefault();
        } else {
          window.event.returnValue = false;
        }
        return false;
      });
      ytcenter.utils.addEventListener(document, "mouseup", function(e){
        if (!mousedown) return;
        mousedown = false;
        if (throttleFunc) ytcenter.utils.removeEventListener(document, "mousemove", throttleFunc, false);
        if (e && e.preventDefault) {
          e.preventDefault();
        } else {
          window.event.returnValue = false;
        }
        return false;
      });
      /*throttleFunc = ytcenter.utils.throttle(mousemove, 50);
      ytcenter.utils.addEventListener(document, "mousemove", throttleFunc, false);*/
      ytcenter.events.addEvent("settings-update", function(){
        update();
        updateBackground();
      });
      update();
      updateBackground();
      
      return {
        element: wrapper,
        bind: function(callback){
          bCallback = callback;
        },
        update: function(h, s, v){
          hue = h;
          sat = s;
          val = v;
          update();
          updateBackground();
        }
      };
    };
    ytcenter.modules.defaultplayersizedropdown = function(option){
      function getItemTitle(item) {
        try {
          var dim = ytcenter.utils.calculateDimensions(item.config.width, item.config.height);
          if (typeof item.config.customName !== "undefined" && item.config.customName !== "") {
            return item.config.customName;
          } else if (isNaN(parseInt(item.config.width)) && isNaN(parseInt(item.config.height))) {
            return (item.config.large ? ytcenter.language.getLocale("SETTINGS_RESIZE_LARGE") : ytcenter.language.getLocale("SETTINGS_RESIZE_SMALL"));
            //subtext.textContent = (item.config.align ? ytcenter.language.getLocale("SETTINGS_RESIZE_ALIGN") : ytcenter.language.getLocale("SETTINGS_RESIZE_CENTER"));
          } else {
            return dim[0] + "×" + dim[1];
            //subtext.textContent = (item.config.large ? ytcenter.language.getLocale("SETTINGS_RESIZE_LARGE") : ytcenter.language.getLocale("SETTINGS_RESIZE_SMALL")) + " - " + (item.config.align ? ytcenter.language.getLocale("SETTINGS_RESIZE_ALIGN") : ytcenter.language.getLocale("SETTINGS_RESIZE_CENTER"));
          }
        } catch (e) {
          con.error(e);
        }
      }
      function getItemSubText(item) {
        try{
        if (isNaN(parseInt(item.config.width)) && isNaN(parseInt(item.config.height))) {
          return (item.config.align ? ytcenter.language.getLocale("SETTINGS_RESIZE_ALIGN") : ytcenter.language.getLocale("SETTINGS_RESIZE_CENTER")) + (item.config.scrollToPlayer ? " - " + ytcenter.language.getLocale("SETTINGS_RESIZE_SCROLLTOPLAYER") : "");
        } else {
          return (item.config.large ? ytcenter.language.getLocale("SETTINGS_RESIZE_LARGE") : ytcenter.language.getLocale("SETTINGS_RESIZE_SMALL")) + " - " + (item.config.align ? ytcenter.language.getLocale("SETTINGS_RESIZE_ALIGN") : ytcenter.language.getLocale("SETTINGS_RESIZE_CENTER")) + (item.config.scrollToPlayer ? " - " + ytcenter.language.getLocale("SETTINGS_RESIZE_SCROLLTOPLAYER") : "");
        }
        }catch(e){con.error(e)}
      }
      function setValue(id) {
        selectedId = id;
        if (selectedId === "default") {
          btnLabel.textContent = ytcenter.language.getLocale("SETTINGS_RESIZE_DEFAULTPLAYERSIZE_DEFAULT");
        } else {
          var item;
          ytcenter.utils.each(items, function(i, val){
            if (val.id !== selectedId) return;
            item = val;
            return false;
          });
          btnLabel.textContent = getItemTitle(item);
        }
      }
      function defaultItem(db) {
        if (typeof selectedId === "undefined") setValue("default");
        
        if ("default" === selectedId) {
          setValue("default");
        }
        var li = document.createElement("li");
        li.setAttribute("role", "menuitem");
        var span = document.createElement("span");
        db.push(span);
        
        span.className = "yt-uix-button-menu-item" + ("default" === selectedId ? " ytcenter-resize-dropdown-selected" : "");
        var title = document.createElement("span");
        title.textContent = ytcenter.language.getLocale("SETTINGS_RESIZE_DEFAULTPLAYERSIZE_DEFAULT");
        ytcenter.language.addLocaleElement(title, "SETTINGS_RESIZE_DEFAULTPLAYERSIZE_DEFAULT", "@textContent");
        title.style.display = "block";
        
        ytcenter.utils.addEventListener(li, "click", function(){
          if ("default" === selectedId) return;
          setValue("default");
          ytcenter.utils.each(db, function(_i, elm){
            ytcenter.utils.removeClass(elm, "ytcenter-resize-dropdown-selected");
          });
          ytcenter.utils.addClass(span, "ytcenter-resize-dropdown-selected");
          
          if (saveCallback) saveCallback("default");
          
          try {
            document.body.click();
          } catch (e) {
            con.error(e);
          }
        });
        
        span.appendChild(title);
        li.appendChild(span);
        
        menu.appendChild(li);
      }
      function updateItems(_items) {
        items = _items;
        menu.innerHTML = ""; // Clearing it
        var db = [];
        
        defaultItem(db);
        ytcenter.utils.each(items, function(i, item){
          if (typeof selectedId === "undefined") setValue(item.id);
          
          if (item.id === selectedId) {
            setValue(item.id);
          }
          var li = document.createElement("li");
          li.setAttribute("role", "menuitem");
          var span = document.createElement("span");
          db.push(span);
          
          span.className = "yt-uix-button-menu-item" + (item.id === selectedId ? " ytcenter-resize-dropdown-selected" : "");
          span.style.paddingBottom = "12px";
          var title = document.createElement("span");
          title.textContent = getItemTitle(item);
          title.style.display = "block";
          title.style.fontWeight = "bold";
          var subtext = document.createElement("span");
          subtext.textContent = getItemSubText(item);
          subtext.style.display = "block";
          subtext.style.fontSize = "11px";
          subtext.style.lineHeight = "0px";
          
          ytcenter.utils.addEventListener(li, "click", function(){
            if (item.id === selectedId) return;
            setValue(item.id);
            ytcenter.utils.each(db, function(_i, elm){
              ytcenter.utils.removeClass(elm, "ytcenter-resize-dropdown-selected");
            });
            ytcenter.utils.addClass(span, "ytcenter-resize-dropdown-selected");
            
            if (saveCallback) saveCallback(item.id);
            
            try {
              document.body.click();
            } catch (e) {
              con.error(e);
            }
          });
          
          span.appendChild(title);
          span.appendChild(subtext);
          li.appendChild(span);
          
          menu.appendChild(li);
        });
      }
      var saveCallback, selectedId = ytcenter.settings[option.defaultSetting], items,
          wrapper = document.createElement("div"),
          btnLabel = ytcenter.gui.createYouTubeButtonText("Player Sizes..."),
          menu = document.createElement("ul"),
          arrow = ytcenter.gui.createYouTubeButtonArrow(),
          btn = ytcenter.gui.createYouTubeDefaultButton("", [btnLabel, arrow, menu]);
      wrapper.style.display = "inline-block";
      btnLabel.style.display = "inline-block";
      btnLabel.style.width = "100%";
      
      menu.className = "yt-uix-button-menu yt-uix-button-menu-default yt-uix-button-menu-external hid";
      menu.setAttribute("role", "menu");
      arrow.style.marginLeft = "-10px";
      
      btn.style.width = "175px";
      btn.style.textAlign = "left";
      
      wrapper.appendChild(btn);
      
      if (option.parent) {
        option.parent.addEventListener("click", function(){
          selectedId = ytcenter.settings[option.defaultSetting];
          var opt = ytcenter.settings[option.args.bind],
              found = false, i;
          for (i = 0; i < opt.length; i++) {
            if (opt[i].id === selectedId) found = true;
          }
          if (!found && selectedId !== "default") {
            selectedId = opt[0].id;
            if (saveCallback) saveCallback(selectedId);
          }
          updateItems(opt);
        });
      }
      
      return {
        element: wrapper, // So the element can be appended to an element.
        bind: function(callback){
          saveCallback = callback;
        },
        update: function(v){
          selectedId = v;
          var opt = ytcenter.settings[option.args.bind],
              found = false, i;
          for (i = 0; i < opt.length; i++) {
            if (opt[i].id === selectedId) found = true;
          }
          if (!found && selectedId !== "default") {
            selectedId = opt[0].id;
            if (saveCallback) saveCallback(selectedId);
          }
          updateItems(opt);
        }
      };
    };
    ytcenter.modules.element = function(option){
      var elm = document.createElement(option && option.args && option.args.tagname);
      if (option && option.args && option.args.style) {
        for (var key in option.args.style) {
          if (option.args.style.hasOwnProperty(key)) {
            elm.style[key] = option.args.style[key];
          }
        }
      }
      if (option && option.args && option.args.className) {
        elm.className += " " + option.args.className;
      }
      if (option && option.args && option.args.text) {
        elm.textContent = option.args.text;
      }
      if (option && option.args && option.args.html) {
        con.error("[Settings Recipe] Element attribute HTML not allowed!");
      }
      if (option && option.args && option.args.load) {
        tab.addEventListener("click", function(){
          option.args.load.apply(null, [elm]);
        });
      }
      if (option && option.args && option.args.listeners) {
        for (var i = 0; i < option.args.listeners.length; i++) {
          elm.addEventListener(option.args.listeners[i].event, option.args.listeners[i].callback, (option.args.listeners[i].bubble ? option.args.listeners[i].bubble : false));
        }
      }
      
      return {
        element: elm,
        bind: function(){},
        update: function(){}
      };
    };
    ytcenter.modules.importexport = function(){
      var textLabel = ytcenter.gui.createYouTubeButtonTextLabel("SETTINGS_IMEX_TITLE"),
          content = document.createElement("div"),
          VALIDATOR_STRING = "YTCSettings=>",
          dropZone = document.createElement("div"),
          dropZoneContent = document.createElement("div"),
          filechooser = document.createElement("input"),
          settingsPool = document.createElement("textarea"),
          dialog = ytcenter.dialog("SETTINGS_IMEX_TITLE", content, [
            {
              label: "SETTINGS_IMEX_CANCEL",
              primary: false,
              callback: function(){
                dialog.setVisibility(false);
              }
            }, {
              name: "save",
              label: "SETTINGS_IMEX_SAVE",
              primary: true,
              callback: function(){
                if (!saveEnabled) return;
                ytcenter.settings = JSON.parse(settingsPool.value);
                ytcenter.saveSettings();
                loc.reload();
              }
            }
          ]),
          status,
          loadingText = document.createElement("div"),
          messageText = document.createElement("div"),
          messageTimer,
          dropZoneEnabled = true,
          saveEnabled = true,
          pushMessage = function(message, color, timer){
            //dropZoneEnabled = false;
            messageText.textContent = message;
            messageText.style.display = "inline-block";
            if (typeof color === "string") messageText.style.color = color;
            else messageText.style.color = "";
            
            status.style.display = "";
            dropZoneContent.style.visibility = "hidden";
            uw.clearTimeout(messageTimer);
            if (typeof timer === "number") {
              messageTimer = uw.setTimeout(function(){
                removeMessage();
              }, timer);
            }
          },
          removeMessage = function(){
            status.style.display = "none";
            dropZoneContent.style.visibility = "";
            
            messageText.style.display = "none";
            messageText.textContent = "";
            //dropZoneEnabled = true;
            uw.clearTimeout(messageTimer);
          },
          validateFileAndLoad = function(file){
            dropZone.style.border = "2px dashed rgb(187, 187, 187)";
            pushMessage(ytcenter.language.getLocale("SETTINGS_IMEX_VALIDATE"));
            
            var reader = new FileReader();
            reader.onerror = function(e){
              switch (e.target.error.code) {
                case e.target.error.NOT_FOUND_ERR:
                  pushMessage(ytcenter.language.getLocale("SETTINGS_IMEX_IMPORT_ERROR_NOT_FOUND"), "#ff0000", 10000);
                  break;
                case e.target.error.NOT_READABLE_ERR:
                  pushMessage(ytcenter.language.getLocale("SETTINGS_IMEX_IMPORT_ERROR_NOT_READABLE"), "#ff0000", 10000);
                  break;
                case e.target.error.ABORT_ERR:
                  pushMessage(ytcenter.language.getLocale("SETTINGS_IMEX_IMPORT_ERROR_ABORT"), "#ff0000", 10000);
                  break;
                default:
                  pushMessage(ytcenter.language.getLocale("SETTINGS_IMEX_IMPORT_ERROR_UNKNOWN"), "#ff0000", 10000);
                  break;
              }
            };
            reader.onabort = function(){
              pushMessage(ytcenter.language.getLocale("SETTINGS_IMEX_IMPORT_ERROR_ABORT"), "#ff0000", 10000);
            };
            reader.onload = function(e){
              if (e.target.result === VALIDATOR_STRING) {
                readFile(file);
              } else {
                pushMessage(ytcenter.language.getLocale("SETTINGS_IMEX_VALIDATE_ERROR_NOT_VALID"), "#ff0000", 3500);
                
              }
            };
            
            reader.readAsText(file.slice(0, VALIDATOR_STRING.length));
          },
          readFile = function(file){
            pushMessage(ytcenter.language.getLocale("SETTINGS_IMEX_LOADING"));
            
            var reader = new FileReader();
            reader.onerror = function(e){
              switch (e.target.error.code) {
                case e.target.error.NOT_FOUND_ERR:
                  pushMessage(ytcenter.language.getLocale("SETTINGS_IMEX_IMPORT_ERROR_NOT_FOUND"), "#ff0000", 10000);
                  break;
                case e.target.error.NOT_READABLE_ERR:
                  pushMessage(ytcenter.language.getLocale("SETTINGS_IMEX_IMPORT_ERROR_NOT_READABLE"), "#ff0000", 10000);
                  break;
                case e.target.error.ABORT_ERR:
                  pushMessage(ytcenter.language.getLocale("SETTINGS_IMEX_IMPORT_ERROR_ABORT"), "#ff0000", 10000);
                  break;
                default:
                  pushMessage(ytcenter.language.getLocale("SETTINGS_IMEX_IMPORT_ERROR_UNKNOWN"), "#ff0000", 10000);
                  break;
              }
            };
            reader.onabort = function(){
              pushMessage(ytcenter.language.getLocale("SETTINGS_IMEX_IMPORT_ERROR_ABORT"), "#ff0000", 10000);
            };
            reader.onload = function(e){
              settingsPool.value = e.target.result;
              pushMessage(ytcenter.language.getLocale("SETTINGS_IMEX_IMPORT_MESSAGE"), "", 10000);
            };
            
            reader.readAsText(file.slice(VALIDATOR_STRING.length));
          },
          exportFileButtonLabel = ytcenter.gui.createYouTubeButtonTextLabel("SETTINGS_IMEX_EXPORT_AS_FILE"),
          exportFileButton = ytcenter.gui.createYouTubeDefaultButton("", [exportFileButtonLabel]),
          statusContainer = document.createElement("div");
      var elm = ytcenter.gui.createYouTubeDefaultButton("", [textLabel]);
      
      // Message Text
      messageText.style.fontWeight = "bold";
      messageText.style.fontSize = "16px";
      messageText.style.textAlign = "center";
      messageText.style.width = "100%";
      messageText.style.display = "none";
      
      status = ytcenter.gui.createMiddleAlignHack(messageText);
      status.style.position = "absolute";
      status.style.top = "0px";
      status.style.left = "0px";
      status.style.width = "100%";
      status.style.height = "100%";
      status.style.display = "none";
      
      filechooser.setAttribute("type", "file");
      ytcenter.utils.addEventListener(elm, "click", function(){
        dialog.setVisibility(true);
      }, false);
      var __f = function(e){
        validateFileAndLoad(e.target.files[0]);
        
        var newNode = document.createElement("input");
        newNode.setAttribute("type", "file");
        ytcenter.utils.addEventListener(newNode, "change", __f, false);
        filechooser.parentNode.replaceChild(newNode, filechooser);
        filechooser = newNode;
      };
      ytcenter.utils.addEventListener(filechooser, "change", __f, false);
      
      ytcenter.utils.addEventListener(dropZone, "drop", function(e){
        e.stopPropagation();
        e.preventDefault();
        
        validateFileAndLoad(e.dataTransfer.files[0]);
      }, false);
      
      ytcenter.utils.addEventListener(dropZone, "dragover", function(e){
        if (!dropZoneEnabled) return;
        e.stopPropagation();
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
        dropZone.style.border = "2px dashed rgb(130, 130, 130)";
      }, false);
      ytcenter.utils.addEventListener(dropZone, "dragleave", function(e){
        if (!dropZoneEnabled) return;
        dropZone.style.border = "2px dashed rgb(187, 187, 187)";
        e.dataTransfer.dropEffect = "none";
      }, false);
      ytcenter.utils.addEventListener(dropZone, "dragend", function(e){
        if (!dropZoneEnabled) return;
        dropZone.style.border = "2px dashed rgb(187, 187, 187)";
        e.dataTransfer.dropEffect = "none";
      }, false);
      var text1 = document.createElement("span");
      text1.style.fontWeight = "bold";
      text1.style.fontSize = "16px";
      text1.textContent = ytcenter.language.getLocale("SETTINGS_IMEX_DROPFILEHERE");
      ytcenter.language.addLocaleElement(text1, "SETTINGS_IMEX_DROPFILEHERE", "@textContent");
      dropZoneContent.appendChild(text1);
      dropZoneContent.appendChild(document.createElement("br"));
      var text2 = document.createTextNode(ytcenter.language.getLocale("SETTINGS_IMEX_OR"));
      ytcenter.language.addLocaleElement(text2, "SETTINGS_IMEX_OR", "@textContent");
      dropZoneContent.appendChild(text2);
      dropZoneContent.appendChild(document.createTextNode(" "));
      dropZoneContent.appendChild(filechooser);
      
      dropZone.style.position = "relative";
      dropZone.style.border = "2px dashed rgb(187, 187, 187)";
      dropZone.style.borderRadius = "4px";
      dropZone.style.color = "rgb(110, 110, 110)";
      dropZone.style.padding = "20px 0";
      dropZone.style.width = "100%";
      dropZone.style.marginBottom = "10px";
      dropZone.style.textAlign = "center";
      settingsPool.style.width = "100%";
      settingsPool.style.height = "120px";
      
      dropZoneContent.style.margin = "0 auto";
      dropZoneContent.style.display = "inline-block";
      dropZoneContent.style.textAlign = "left";
      
      dropZone.appendChild(dropZoneContent);
      dropZone.appendChild(status);
      content.appendChild(dropZone);
      content.appendChild(settingsPool);
      
      dialog.setWidth("490px");
      
      var settingsPoolChecker = function(){
        try {
          JSON.parse(settingsPool.value);
          dialog.getActionButton("save").disabled = false;
          settingsPool.style.background = "";
          saveEnabled = true;
        } catch (e) {
          dialog.getActionButton("save").disabled  = true;
          settingsPool.style.background = "#FFAAAA";
          saveEnabled = false;
        }
      };
      
      ytcenter.utils.addEventListener(settingsPool, "input", settingsPoolChecker, false);
      ytcenter.utils.addEventListener(settingsPool, "keyup", settingsPoolChecker, false);
      ytcenter.utils.addEventListener(settingsPool, "paste", settingsPoolChecker, false);
      ytcenter.utils.addEventListener(settingsPool, "change", settingsPoolChecker, false);
      
      dialog.addEventListener("visibility", function(visible){
        if (visible) settingsPool.value = JSON.stringify(ytcenter.settings);
        else settingsPool.value = "";
      });
      
      ytcenter.utils.addEventListener(exportFileButton, "click", function(){
        try {
          var blob = new ytcenter.unsafe.io.Blob([VALIDATOR_STRING + settingsPool.value], { "type": "application/octet-stream" });
          ytcenter.unsafe.io.saveAs(blob, "ytcenter-settings.ytcs");
        } catch (e) {
          con.error(e);
        }
      }, false);
      
      content.appendChild(exportFileButton);
      
      return {
        element: elm,
        bind: function(){},
        update: function(){}
      };
    };
    ytcenter.modules.label = function(option){
      var frag = document.createDocumentFragment(),
          text = document.createTextNode(ytcenter.language.getLocale(option.label));
      frag.appendChild(text);
      ytcenter.language.addLocaleElement(text, option.label, "@textContent");
      
      return {
        element: frag, // So the element can be appended to an element.
        bind: function(){},
        update: function(){}
      };
    };
    ytcenter.modules.line = function(){
      var frag = document.createDocumentFragment(),
          hr = document.createElement("hr");
      hr.className = "yt-horizontal-rule";
      frag.appendChild(hr);
      return {
        element: frag,
        bind: function(){},
        update: function(){}
      };
    };
    ytcenter.modules.link = function(option){
      var elm = document.createElement("div"),
          title = document.createElement("b");
      if (option && option.args && option.args.titleLocale) {
        var __t1 = document.createTextNode(ytcenter.language.getLocale(option.args.titleLocale)),
            __t2 = document.createTextNode(":");
        ytcenter.language.addLocaleElement(__t1, option.args.titleLocale, "@textContent", option.args.replace || {});
        title.appendChild(__t1);
        title.appendChild(__t2);
      } else if (option && option.args && option.args.title) {
        title.textContent = option.args.title + ":";
      }
      var content = document.createElement("div");
      content.style.marginLeft = "20px";
      
      for (var i = 0; i < option.args.links.length; i++) {
        if (i > 0) content.appendChild(document.createElement("br"));
        var __a = document.createElement("a");
        __a.href = option.args.links[i].url;
        __a.textContent = option.args.links[i].text;
        __a.setAttribute("target", "_blank");
        content.appendChild(__a);
      }
      elm.appendChild(title);
      elm.appendChild(content);
      
      return {
        element: elm,
        bind: function(){},
        update: function(){}
      };
    };
    ytcenter.modules.list = function(option){
      function update(value) {
        var i;
        for (i = 0; i < s.options.length; i++) {
          if (s.options[i].value === value) {
            s.selectedIndex = i;
            break;
          }
        }
      }
      function bind(callback) {
        cCallback = callback;
      }
      var frag = document.createDocumentFragment(),
          elm = document.createElement("span"),
          sc = document.createElement("span"),
          defaultLabel, s = document.createElement("select"),
          list = [], defaultLabelText,
          sc1 = document.createElement("img"),
          sc2 = document.createElement("span"),
          cCallback;
      elm.className = "yt-uix-form-input-select";
      sc.className = "yt-uix-form-input-select-content";
      
      s.className = "yt-uix-form-input-select-element";
      s.style.cursor = "pointer";
      if (typeof option.args.list === "function") {
        list = option.args.list();
      } else {
        list = option.args.list;
      }
      if (list && list.length > 0) {
        defaultLabelText = ytcenter.language.getLocale(list[0].label);
        for (var i = 0; i < list.length; i++) {
          var item = document.createElement("option");
          item.value = list[i].value;
          
          if (typeof list[i].label === "function") {
            item.textContent = list[i].label();
          } else if (typeof list[i].label !== "undefined") {
            item.textContent = ytcenter.language.getLocale(list[i].label);
            ytcenter.language.addLocaleElement(item, list[i].label, "@textContent");
          }
          if (list[i].value === ytcenter.settings[option.defaultSetting]) {
            item.selected = true;
            defaultLabelText = item.textContent;
          }
          s.appendChild(item);
        }
        sc1.src = "//s.ytimg.com/yt/img/pixel-vfl3z5WfW.gif";
        sc1.className = "yt-uix-form-input-select-arrow";
        sc.appendChild(sc1);
        sc2.className = "yt-uix-form-input-select-value";
        sc2.textContent = defaultLabelText;
        sc.appendChild(sc2);
        ytcenter.events.addEvent("language-refresh", function(){
          sc2.textContent = s.options[s.selectedIndex].textContent;
        });
        ytcenter.utils.addEventListener(s, "change", function(){
          if (cCallback) cCallback(s.value);
          if (option && option.args && option.args.listeners) {
            for (var i = 0; i < option.args.listeners.length; i++) {
              if (option.args.listeners[i].event === "update") {
                option.args.listeners[i].callback();
              } else {
                con.error("[Module:List] Unknown event " + option.args.listeners[i].event);
              }
            }
          }
        }, false);
      }
      elm.appendChild(sc);
      elm.appendChild(s);
      
      frag.appendChild(elm);
      
      return {
        element: frag,
        bind: bind,
        update: update
      };
    };
    ytcenter.modules.multilist = function(option){
      function fixList(_settingData) {
        if (_settingData === "") return "";
        var a = _settingData.split("&"), b = [], c = [], d, i;
        for (i = 0; i < list.length; i++) {
          c.push(list[i].value);
        }
        for (i = 0; i < a.length; i++) {
          if (a[i] !== "") {
            d = decodeURIComponent(a[i]);
            if ($ArrayIndexOf(c, d) !== -1 && $ArrayIndexOf(b, d) === -1) {
              b.push(a[i]);
            }
          }
        }
        return b.join("&");
      }
      function saveItem(value) {
        if (settingData === "") return encodeURIComponent(value);
        var a = settingData.split("&"), i;
        for (i = 0; i < a.length; i++) {
          if (decodeURIComponent(a[i]) === value) return;
        }
        a.push(encodeURIComponent(value));
        return a.join("&");
      }
      function removeItem(value) {
        if (settingData === "") return encodeURIComponent(value);
        var a = settingData.split("&"), b = [], i;
        for (i = 0; i < a.length; i++) {
          if (decodeURIComponent(a[i]) !== value) {
            b.push(a[i]);
          }
        }
        return b.join("&");
      }
      function isEnabled(value) {
        if (settingData === "") return false;
        var a = settingData.split("&"), i;
        for (i = 0; i < a.length; i++) {
          if (decodeURIComponent(a[i]) === value) return true;
        }
        return false;
      }
      function createItem(label, value) {
        var s = document.createElement("label"),
            cb = ytcenter.modules.checkbox(isEnabled(value)),
            text = document.createTextNode(ytcenter.language.getLocale(label));
        ytcenter.language.addLocaleElement(text, label, "@textContent");
        cb.bind(function(checked){
          if (checked) {
            settingData = saveItem(value);
          } else {
            settingData = removeItem(value);
          }
          if (typeof saveCallback === "function") saveCallback(settingData);
          callbackListeners();
        });
        cb.element.style.marginRight = "6px";
        s.appendChild(cb.element);
        s.appendChild(text);
        
        return s;
      }
      function updateList() {
        var d, item;
        settingData = fixList(settingData);
        
        wrapper.innerHTML = "";
        
        for (var i = 0; i < list.length; i++) {
          d = document.createElement("div");
          item = createItem(list[i].label, list[i].value);
          d.appendChild(item);
          wrapper.appendChild(d);
        }
      }
      function callbackListeners() {
        var i;
        if (option.args.listeners && option.args.listeners) {
          for (i = 0; i < option.args.listeners.length; i++) {
            if (option.args.listeners[i].event === "click") {
              option.args.listeners[i].callback();
            }
          }
        }
      }
      var list = (option && option.args && option.args.list) || [],
          settingData, wrapper = document.createElement("div"), saveCallback;
      wrapper.style.paddingLeft = "16px";
      settingData = ytcenter.settings[option.defaultSetting];
      
      updateList();
      
      return {
        element: wrapper,
        update: function(data){
          settingData = data;
          updateList();
        },
        bind: function(a){
          saveCallback = a;
        }
      };
    };
    ytcenter.modules.newline = function(option){
      var elm = document.createElement("br");
      if (option && option.args && option.args.style) {
        for (var key in option.args.style) {
          if (option.args.style.hasOwnProperty(key)) {
            elm.style[key] = option.args.style[key];
          }
        }
      }
      return {
        element: elm,
        bind: function(){},
        update: function(){}
      };
    };
    ytcenter.modules.placement = function(args){
      function createListItem(content) {
        var a = document.createElement("li");
        a.className = "ytcenter-module-placement-item";
        a.textContent = content;
        return a;
      }
      var template = [
        {
          "type": "block",
          "id": "player",
          "prepend": true,
          "insert": false,
          "append": false,
          "content": "Player"
        }, {
          "type": "interactive",
          "id": "watch7-headline",
          "prepend": true,
          "insert": true,
          "append": false
        }, {
          "type": "interactive",
          "id": "watch7-sentiment-actions",
          "prepend": true,
          "insert": true,
          "append": false
        }
      ],
      predefinedElements = [
        {
          "parent": "watch7-sentiment-actions",
          "id": "watch-like-dislike-buttons",
          "content": "Like/Dislike"
        }, {
          "parent": "watch7-headline",
          "id": "watch-headline-title",
          "content": "TITLE"
        }
      ];
      var elm = document.createElement("div"), i, j, a, b, c;
      
      for (i = 0; i < template.length; i++) {
        a = document.createElement("ol");
        if (template[i].type === "interactive") {
          a.className = "ytcenter-moduel-placement-interactive";
        } else if (template[i].type === "block") {
          a.className = "ytcenter-moduel-placement-block";
        } else if (template[i].type === "hidden") {
          a.className = "ytcenter-moduel-placement-hidden";
        }
        if (template[i].content) a.textContent = template[i].content;
        if (template[i].prepend) {
          b = document.createElement("ol");
          b.className = "ytcenter-moduel-placement-empty";
          b.textContent = "+";
          elm.appendChild(b);
        }
        if (template[i].insert) {
          for (j = 0; j < predefinedElements.length; j++) {
            if (predefinedElements[j].parent === template[i].id) {
              c = createListItem(predefinedElements[j].content);
              a.appendChild(c);
            }
          }
        }
        elm.appendChild(a);
        if (template[i].append) {
          b = document.createElement("ol");
          b.className = "ytcenter-moduel-placement-empty";
          b.textContent = "+";
          elm.appendChild(b);
        }
      }
      
      return {
        element: elm,
        update: function(){},
        bind: function(){}
      };
    };
    ytcenter.modules.range = function(option){
      function setValue(val) {
        if (val === options.value) return;
        if (options.step !== 0) {
          var diff = val%options.step;
          if (diff >= options.step/2 && (options.step-diff)+val <= options.max) {
            options.value = (options.step-diff)+val;
          } else {
            options.value = val - diff;
          }
        } else {
          options.value = val;
        }
        update();
        if (options.value > options.max) {
          setValue(options.max);
          return;
        }
        if (options.value < options.min) {
          setValue(options.min);
          return;
        }
      };
      function update() {
        if (options.method === "vertical") {
          handle.style.top = ((options.value - options.min)/(options.max - options.min)*(wrapper.clientHeight - handle.offsetHeight)) + "px";
        } else {
          handle.style.left = ((options.value - options.min)/(options.max - options.min)*(wrapper.clientWidth - handle.offsetWidth)) + "px";
        }
      }
      function eventToValue(e) {
        var offset = ytcenter.utils.getOffset(wrapper),
            scrollOffset = ytcenter.utils.getScrollOffset(),
            v, l;
        if (options.method === "vertical") {
          offset.top += options.offset;
          v = e.pageY - scrollOffset.top - offset.top;
          l = v + parseInt(options.height)/2 - 3;
          if (l < 0) l = 0;
          if (l > wrapper.clientHeight - handle.clientHeight) l = wrapper.clientHeight - handle.clientHeight;
          
          setValue(l/(wrapper.clientHeight - handle.clientHeight)*(options.max - options.min) + options.min);
        } else {
          offset.left += options.offset;
          v = e.pageX - scrollOffset.left - offset.left;
          l = v - parseInt(options.height)/2;
          if (l < 0) l = 0;
          if (l > wrapper.clientWidth - handle.clientWidth) l = wrapper.clientWidth - handle.clientWidth;
          
          setValue(l/(wrapper.clientWidth - handle.clientWidth)*(options.max - options.min) + options.min);
        }
        update();
      }
      function mousemove(e){
        if (!mousedown) return;
        eventToValue(e);
        if (bCallback) bCallback(options.value);
        
        if (e && e.preventDefault) {
          e.preventDefault();
        } else {
          window.event.returnValue = false;
        }
        return false;
      }
      var options = ytcenter.utils.mergeObjects({
                      value: 0,
                      min: 0,
                      max: 100,
                      step: 1,
                      width: "225px",
                      height: "14px",
                      method: "horizontal", // horizontal, vertical
                      handle: null,
                      offset: 0
                    }, option.args),
          handle, mousedown = false, bCallback,
          wrapper = document.createElement("span"),
          throttleFunc = null;
      
      wrapper.className = "ytcenter-modules-range";
      if (options.method === "vertical") {
        wrapper.style.width = options.height;
        wrapper.style.height = options.width;
      } else {
        wrapper.style.width = options.width;
        wrapper.style.height = options.height;
      }
      if (options.handle) {
        handle = options.handle;
      } else {
        handle = document.createElement("div");
        handle.className = "ytcenter-modules-range-handle";
        handle.style.width = (parseInt(options.height)) + "px";
        handle.style.height = parseInt(options.height) + "px";
      }
      
      wrapper.appendChild(handle);
      
      if (option.parent) {
        option.parent.addEventListener("click", function(){
          setValue(options.value);
          update();
        });
      }
      setValue(options.value);
      update();
      
      ytcenter.utils.addEventListener(wrapper, "mousedown", function(e){
        if (mousedown) return;
        mousedown = true;
        
        eventToValue(e);
        if (bCallback) bCallback(options.value);
        
        throttleFunc = ytcenter.utils.throttle(mousemove, 50);
        ytcenter.utils.addEventListener(document, "mousemove", throttleFunc, false);
        
        if (e && e.preventDefault) {
          e.preventDefault();
        } else {
          window.event.returnValue = false;
        }
        return false;
      });
      ytcenter.utils.addEventListener(document, "mouseup", function(e){
        if (!mousedown) return;
        mousedown = false;
        if (throttleFunc) ytcenter.utils.removeEventListener(document, "mousemove", throttleFunc, false);
        if (e && e.preventDefault) {
          e.preventDefault();
        } else {
          window.event.returnValue = false;
        }
        return false;
      });
      return {
        element: wrapper,
        bind: function(callback){
          bCallback = callback;
        },
        update: function(value){
          setValue(value);
          update();
        },
        getValue: function(){
          return options.value;
        }
      };
    };
    ytcenter.modules.rangetext = function(option){
      function getValue(text) {
        if (prefixSuffixActive) {
          if (option.args.prefix && option.args.prefix !== "") {
            if (text.indexOf(option.args.prefix) === 0)
              text = text.substring(option.args.prefix.length);
          }
          if (option.args.suffix && option.args.suffix !== "") {
            if (text.indexOf(option.args.suffix) === text.length - option.args.suffix.length)
              text = text.substring(0, text.length - option.args.suffix.length);
          }
        }
        text = parseInt(text, 10);
        if (isNaN(text) || text === Infinity) text = 0;
        return text;
      }
      function update() {
        _text.value = (option.args.prefix ? option.args.prefix : "") + Math.round(range.getValue()) + (option.args.suffix ? option.args.suffix : "");
        prefixSuffixActive = true;
      }
      var range = ytcenter.modules.range(option),
          wrapper = document.createElement("div"),
          bCallback, prefixSuffixActive = true;
      wrapper.style.display = "inline-block";
      wrapper.appendChild(range.element);
      var _text = document.createElement("input");
      _text.setAttribute("type", "text");
      _text.value = Math.round(range.getValue());
      _text.className = "ytcenter-modules-rangetext";
      wrapper.appendChild(_text);
      
      range.bind(function(value){
        update();
        if (bCallback) bCallback(value);
      });
      if (option.parent) {
        option.parent.addEventListener("click", function(){
          update();
        });
      }
      
      _text.addEventListener("focus", function(){
        var val = getValue(this.value);
        
        range.update(val);
        
        var sel = ytcenter.utils.getCaretPosition(this);
        this.value = val;
        prefixSuffixActive = false;
        ytcenter.utils.setCaretPosition(this, sel);
        
        this.setSelectionRange();
      }, false);
      
      _text.addEventListener("blur", function(){
        var val = getValue(this.value);
        range.update(val);
        val = range.getValue();
        if (bCallback) bCallback(val);
        
        update();
      }, false);
      
      _text.addEventListener("input", function(){
        var val = getValue(this.value);
        
        range.update(val);
      }, false);
      
      _text.addEventListener("change", function(){
        var val = getValue(this.value);
        
        range.update(val);
        val = range.getValue();
        if (bCallback) bCallback(val);
        
        update();
      }, false);
      
      return {
        element: wrapper,
        bind: function(callback){
          var a = null,
              b = false,
              c = null;
          bCallback = function(value){
            c = value;
            if (b) {
              return;
            }
            b = true;
            uw.clearTimeout(a);
            a = uw.setTimeout(function(){
              callback(c);
              b = false;
            }, 500);
          };
        },
        update: function(value){
          range.update(value);
          update();
        },
        getValue: function(){
          return range.getValue();
        }
      };
    };
    ytcenter.modules.resizedropdown = function(option){
      function getItemTitle(item) {
        var dim = ytcenter.utils.calculateDimensions(item.config.width, item.config.height);
        if (typeof item.config.customName !== "undefined" && item.config.customName !== "") {
          return item.config.customName;
        } else if (isNaN(parseInt(item.config.width)) && isNaN(parseInt(item.config.height))) {
          return (item.config.large ? ytcenter.language.getLocale("SETTINGS_RESIZE_LARGE") : ytcenter.language.getLocale("SETTINGS_RESIZE_SMALL"));
          subtext.textContent = (item.config.align ? ytcenter.language.getLocale("SETTINGS_RESIZE_ALIGN") : ytcenter.language.getLocale("SETTINGS_RESIZE_CENTER"));
        } else {
          return dim[0] + "×" + dim[1];
          subtext.textContent = (item.config.large ? ytcenter.language.getLocale("SETTINGS_RESIZE_LARGE") : ytcenter.language.getLocale("SETTINGS_RESIZE_SMALL")) + " - " + (item.config.align ? ytcenter.language.getLocale("SETTINGS_RESIZE_ALIGN") : ytcenter.language.getLocale("SETTINGS_RESIZE_CENTER"));
        }
      }
      function getItemSubText(item) {
        if (isNaN(parseInt(item.config.width)) && isNaN(parseInt(item.config.height))) {
          return (item.config.align ? ytcenter.language.getLocale("SETTINGS_RESIZE_ALIGN") : ytcenter.language.getLocale("SETTINGS_RESIZE_CENTER")) + (item.config.scrollToPlayer ? " - " + ytcenter.language.getLocale("SETTINGS_RESIZE_SCROLLTOPLAYER") : "");
        } else {
          return (item.config.large ? ytcenter.language.getLocale("SETTINGS_RESIZE_LARGE") : ytcenter.language.getLocale("SETTINGS_RESIZE_SMALL")) + " - " + (item.config.align ? ytcenter.language.getLocale("SETTINGS_RESIZE_ALIGN") : ytcenter.language.getLocale("SETTINGS_RESIZE_CENTER")) + (item.config.scrollToPlayer ? " - " + ytcenter.language.getLocale("SETTINGS_RESIZE_SCROLLTOPLAYER") : "");
        }
      }
      function setValue(id) {
        selectedId = id;
        var item;
        ytcenter.utils.each(items, function(i, val){
          if (val.id !== selectedId) return;
          item = val;
          return false;
        });
        btnLabel.textContent = getItemTitle(item);
      }
      function updateItems(_items) {
        items = _items;
        menu.innerHTML = ""; // Clearing it
        var db = [];
        ytcenter.utils.each(items, function(i, item){
          if (typeof selectedId === "undefined") setValue(item.id);
          
          if (item.id === selectedId) {
            setValue(item.id);
          }
          var li = document.createElement("li");
          li.setAttribute("role", "menuitem");
          var span = document.createElement("span");
          db.push(span);
          
          span.className = "yt-uix-button-menu-item" + (item.id === selectedId ? " ytcenter-resize-dropdown-selected" : "");
          span.style.paddingBottom = "12px";
          var title = document.createElement("span");
          title.textContent = getItemTitle(item);
          title.style.display = "block";
          title.style.fontWeight = "bold";
          var subtext = document.createElement("span");
          subtext.textContent = getItemSubText(item);
          subtext.style.display = "block";
          subtext.style.fontSize = "11px";
          subtext.style.lineHeight = "0px";
          
          ytcenter.utils.addEventListener(li, "click", function(){
            if (item.id === selectedId) return;
            setValue(item.id);
            ytcenter.utils.each(db, function(_i, elm){
              ytcenter.utils.removeClass(elm, "ytcenter-resize-dropdown-selected");
            });
            ytcenter.utils.addClass(span, "ytcenter-resize-dropdown-selected");
            
            if (saveCallback) saveCallback(item.id);
            
            try {
              document.body.click();
            } catch (e) {
              con.error(e);
            }
          });
          
          span.appendChild(title);
          span.appendChild(subtext);
          li.appendChild(span);
          
          menu.appendChild(li);
        });
      }
      var saveCallback;
      var selectedId;
      var items;
      
      var wrapper = document.createElement("div");
      wrapper.className = "ytcenter-embed";
      
      var btnLabel = ytcenter.gui.createYouTubeButtonText("Player Sizes...");
      btnLabel.style.display = "inline-block";
      btnLabel.style.width = "100%";
      
      var menu = document.createElement("ul");
      menu.className = "yt-uix-button-menu yt-uix-button-menu-default yt-uix-button-menu-external hid";
      menu.setAttribute("role", "menu");
      
      var arrow = ytcenter.gui.createYouTubeButtonArrow();
      arrow.style.marginLeft = "-10px";
      
      var btn = ytcenter.gui.createYouTubeDefaultButton("", [btnLabel, arrow, menu]);
      btn.style.width = "175px";
      btn.style.textAlign = "left";
      
      wrapper.appendChild(btn);
      
      updateItems(ytcenter.settings[option.defaultSetting]);
      if (option.parent) {
        option.parent.addEventListener("click", function(){
          var opt = ytcenter.settings[option.defaultSetting];
          var found = false;
          for (var i = 0; i < opt.length; i++) {
            if (opt[i].id === selectedId) found = true;
          }
          if (!found) {
            selectedId = opt[0].id;
            if (saveCallback) saveCallback(selectedId);
          }
          updateItems(opt);
        });
      }
      
      return {
        element: wrapper, // So the element can be appended to an element.
        bind: function(callback){
          saveCallback = callback;
        },
        update: function(v){
          selectedId = v;
          updateItems(items);
        }
      };
    };
    ytcenter.modules.resizeItemList = function(option){
      function wrapItem(item) {
        if (typeof item.getItemElement !== "undefined") return item; // It's already been processed
        var selected = false;
        
        var li = document.createElement("li");
        li.className = "ytcenter-list-item ytcenter-dragdrop-item";
        
        var order = document.createElement("div");
        order.className = "ytcenter-dragdrop-handle";
        
        var content = document.createElement("div");
        content.className = "ytcenter-list-item-content";
        var title = document.createElement("span");
        title.className = "ytcenter-list-item-title";
        
        var subtext = document.createElement("span");
        subtext.className = "ytcenter-list-item-subtext";
        
        content.appendChild(title);
        content.appendChild(subtext);
        
        li.appendChild(order);
        li.appendChild(content);
        
        ytcenter.utils.addEventListener(content, "click", function(){
          if (selected) return;
          selectSizeItem(item.id);
        });
        var out = {
          getId: function(){
            return item.id;
          },
          getData: function(){
            return item;
          },
          getConfig: function(){
            return item.config;
          },
          setConfig: function(conf){
            item.config = conf;
          },
          updateItemElement: function(){
            var dim = ytcenter.utils.calculateDimensions(item.config.width, item.config.height);
            title.textContent = getItemTitle(out);
            subtext.textContent = getItemSubText(out);
          },
          getItemElement: function(){
            return li;
          },
          select: function(){
            if (selected) return;
            selectSizeItem(item.id);
          },
          setSelection: function(_selected){
            selected = _selected;
            if (selected) {
              ytcenter.utils.addClass(li, "ytcenter-list-item-selected");
            } else {
              ytcenter.utils.removeClass(li, "ytcenter-list-item-selected");
            }
          }
        };
        
        out.updateItemElement();
        ytcenter.events.addEvent("ui-refresh", function(){
          out.updateItemElement();
        });
        return out;
      }
      function getItemInfo(item) {
        var __r = {};
        var dim = ytcenter.utils.calculateDimensions(item.getConfig().width, item.getConfig().height);
        if (item.getConfig().width === "" && item.getConfig().height === "") {
          __r.width = "";
          __r.height = "";
        } else {
          if (typeof dim[0] === "number" && !isNaN(parseInt(item.getConfig().width))) {
            __r.width = dim[0] + "px";
          } else if (!isNaN(parseInt(item.getConfig().width))) {
            __r.width = dim[0];
          } else {
            __r.width = "";
          }
          if (typeof dim[1] === "number" && !isNaN(parseInt(item.getConfig().height))) {
            __r.height = dim[1] + "px";
          } else if (!isNaN(parseInt(item.getConfig().height))) {
            __r.height = dim[1];
          } else {
            __r.height = "";
          }
        }
        __r.large = item.getConfig().large;
        __r.align = item.getConfig().align;
        __r.scrollToPlayer = item.getConfig().scrollToPlayer;
        __r.scrollToPlayerButton = item.getConfig().scrollToPlayerButton;
        __r.customName = (typeof item.getConfig().customName === "undefined" ? "" : item.getConfig().customName);
        __r.aspectRatioLocked = (typeof item.getConfig().aspectRatioLocked === "undefined" ? false : item.getConfig().aspectRatioLocked);
        return __r;
      }
      function createEditor() {
        function hasUnsavedChanges() {
          if (state === 0) return false;
          if (state === 2) return true;
          if (original.width !== __getWidth()) return true;
          if (original.height !== __getHeight()) return true;
          if (original.large !== largeInput.isSelected()) return true;
          if (original.align !== alignInput.isSelected()) return true;
          if (original.scrollToPlayer !== scrollToPlayerInput.isSelected()) return true;
          if (original.scrollToPlayerButton !== scrollToPlayerButtonInput.isSelected()) return true;
          if (original.customName !== customNameInput.value) return true;
          if (original.aspectRatioLocked !== ratioLocked) return true;
          
          return false;
        }
        var __getWidth = function(){
          if (isNaN(parseInt(widthInput.value))) {
            return widthUnit.getValue();
          } else {
            return parseInt(widthInput.value) + widthUnit.getValue();
          }
        };
        var __getHeight = function(){
          if (isNaN(parseInt(heightInput.value))) {
            return heightUnit.getValue();
          } else {
            return parseInt(heightInput.value) + heightUnit.getValue();
          }
        };
        var __getAspectRatio = function(){
          if (isNaN(parseInt(widthInput.value)) || isNaN(parseInt(heightInput.value)) || widthUnit.getValue() !== "px" || heightUnit.getValue() !== "px") return;
          return parseInt(widthInput.value)/parseInt(heightInput.value);
        };
        var __updateAspectRatio = function(){
          aspectRatio = __getAspectRatio();
        };
        var __setAspectRatioLocked = function(locked){
          ratioLocked = locked;
          if (ratioLocked) {
            ytcenter.utils.addClass(ratioIcon, "ytcenter-resize-chain");
            ytcenter.utils.removeClass(ratioIcon, "ytcenter-resize-unchain");
            aspectRatio = __getAspectRatio();
          } else {
            ytcenter.utils.removeClass(ratioIcon, "ytcenter-resize-chain");
            ytcenter.utils.addClass(ratioIcon, "ytcenter-resize-unchain");
            aspectRatio = undefined;
          }
        };
        var __setAspectVisibility = function(visible){
          if (visible) {
            ytcenter.utils.removeClass(linkBorder, "force-hid");
            ytcenter.utils.removeClass(ratioIcon, "force-hid");
          } else {
            ytcenter.utils.addClass(linkBorder, "force-hid");
            ytcenter.utils.addClass(ratioIcon, "force-hid");
          }
        };
        var saveListener, cancelListener, deleteListener, newSessionCallback;
        var original = {};
        var state = 0;
        var ratioLocked = false;
        var aspectRatio;
        
        var wrp = document.createElement("div");
        wrp.style.visibility = "hidden";
        // Editor Panel
        var customNameWrapper = document.createElement("div");
        customNameWrapper.className = "ytcenter-panel-label";
        var customNameLabel = document.createElement("label");
        customNameLabel.textContent = ytcenter.language.getLocale("EMBED_RESIZEITEMLIST_CUSTOMNAME");
        ytcenter.language.addLocaleElement(customNameLabel, "EMBED_RESIZEITEMLIST_CUSTOMNAME", "@textContent");
        customNameWrapper.appendChild(customNameLabel);
        var customNameInput = ytcenter.gui.createYouTubeTextInput();
        customNameInput.style.width = "210px";
        customNameWrapper.appendChild(customNameInput);
        
        var dimensionWrapper = document.createElement("div");
        var sizeWrapper = document.createElement("div");
        sizeWrapper.style.display = "inline-block";
        
        var widthWrapper = document.createElement("div");
        widthWrapper.className = "ytcenter-panel-label";
        var widthLabel = document.createElement("label");
        widthLabel.textContent = ytcenter.language.getLocale("EMBED_RESIZEITEMLIST_WIDTH");
        ytcenter.language.addLocaleElement(widthLabel, "EMBED_RESIZEITEMLIST_WIDTH", "@textContent");
        widthWrapper.appendChild(widthLabel);
        var widthInput = ytcenter.gui.createYouTubeTextInput();
        widthInput.style.width = "105px";
        widthWrapper.appendChild(widthInput);
        
        ytcenter.utils.addEventListener(widthInput, "change", function(){
          if (widthUnit.getValue() !== "px" || heightUnit.getValue() !== "px") return;
          aspectRatio = __getAspectRatio();
        });
        ytcenter.utils.addEventListener(widthInput, "input", function(){
          if (isNaN(parseInt(widthInput.value))) widthInput.value = "";
          else widthInput.value = parseInt(widthInput.value);
          if (widthUnit.getValue() !== "px" || heightUnit.getValue() !== "px") return;
          if (typeof aspectRatio === "undefined" || !ratioLocked) return;
          if (isNaN(parseInt(widthInput.value))) {
            heightInput.value = "";
          } else if (aspectRatio !== 0) {
            heightInput.value = Math.round(parseInt(widthInput.value)/aspectRatio);
          }
        });
        
        var widthUnit = ytcenter.modules.select({args: {list: [
          {label: "EMBED_RESIZEITEMLIST_PIXEL", value: "px"},
          {label: "EMBED_RESIZEITEMLIST_PERCENT", value: "%"}
        ]}});
        
        widthUnit.bind(function(){
          if (widthUnit.getValue() !== "px" || heightUnit.getValue() !== "px") {
            __setAspectVisibility(false);
            return;
          }
          __setAspectVisibility(true);
          aspectRatio = __getAspectRatio();
        });
        
        widthWrapper.appendChild(widthUnit.element);
        
        sizeWrapper.appendChild(widthWrapper);
        
        var heightWrapper = document.createElement("div");
        heightWrapper.className = "ytcenter-panel-label";
        var heightLabel = document.createElement("label");
        heightLabel.textContent = ytcenter.language.getLocale("EMBED_RESIZEITEMLIST_HEIGHT");
        ytcenter.language.addLocaleElement(heightLabel, "EMBED_RESIZEITEMLIST_HEIGHT", "@textContent");
        heightWrapper.appendChild(heightLabel);
        var heightInput = ytcenter.gui.createYouTubeTextInput();
        heightInput.style.width = "105px";
        heightWrapper.appendChild(heightInput);
        
        ytcenter.utils.addEventListener(heightInput, "change", function(){
          if (widthUnit.getValue() !== "px" || heightUnit.getValue() !== "px") return;
          aspectRatio = __getAspectRatio();
        });
        ytcenter.utils.addEventListener(heightInput, "input", function(){
          if (isNaN(parseInt(heightInput.value))) heightInput.value = "";
          else heightInput.value = parseInt(heightInput.value);
          if (widthUnit.getValue() !== "px" || heightUnit.getValue() !== "px") return;
          if (typeof aspectRatio === "undefined" || !ratioLocked) return;
          if (isNaN(parseInt(heightInput.value))) {
            widthInput.value = "";
          } else if (aspectRatio !== 0) {
            widthInput.value = Math.round(parseInt(heightInput.value)*aspectRatio);
          }
        });
        
        var heightUnit = ytcenter.modules.select({args: {list: [
          {label: "EMBED_RESIZEITEMLIST_PIXEL", value: "px"},
          {label: "EMBED_RESIZEITEMLIST_PERCENT", value: "%"}
        ]}});
        
        heightUnit.bind(function(){
          if (widthUnit.getValue() !== "px" || heightUnit.getValue() !== "px") {
            __setAspectVisibility(false);
            return;
          }
          __setAspectVisibility(true);
          aspectRatio = __getAspectRatio();
        });
        
        heightWrapper.appendChild(heightUnit.element);
        
        sizeWrapper.appendChild(heightWrapper);
        
        dimensionWrapper.appendChild(sizeWrapper);
        
        var linkBorder = document.createElement("div");
        linkBorder.className = "ytcenter-resize-aspect-bind";
        
        dimensionWrapper.appendChild(linkBorder);
        
        var ratioIcon = document.createElement("div");
        ratioIcon.className = "ytcenter-resize-unchain ytcenter-resize-ratio";
        ratioIcon.style.display = "inline-block";
        ratioIcon.style.marginBottom = "13px";
        ratioIcon.style.marginLeft = "-11px";
        ratioIcon.style.width = "20px";
        ytcenter.utils.addEventListener(ratioIcon, "click", function(e){
          if (widthUnit.getValue() !== "px" || heightUnit.getValue() !== "px") return;
          if (ratioLocked) {
            __setAspectRatioLocked(false);
          } else {
            __setAspectRatioLocked(true);
          }
          if (e && e.preventDefault) {
            e.preventDefault();
          } else {
            window.event.returnValue = false;
          }
          return false;
        });
        
        dimensionWrapper.appendChild(ratioIcon);
        
        var largeWrapper = document.createElement("div");
        largeWrapper.className = "ytcenter-panel-label";
        var largeLabel = document.createElement("label");
        largeLabel.textContent = ytcenter.language.getLocale("EMBED_RESIZEITEMLIST_LARGE");
        ytcenter.language.addLocaleElement(largeLabel, "EMBED_RESIZEITEMLIST_LARGE", "@textContent");
        largeWrapper.appendChild(largeLabel);
        var largeInput = ytcenter.modules.checkbox();
        largeInput.element.style.background = "#fff";
        largeInput.fixHeight();
        largeWrapper.appendChild(largeInput.element);
        
        var alignWrapper = document.createElement("div");
        alignWrapper.className = "ytcenter-panel-label";
        var alignLabel = document.createElement("label");
        alignLabel.textContent = "Align";
        alignLabel.textContent = ytcenter.language.getLocale("EMBED_RESIZEITEMLIST_ALIGN");
        ytcenter.language.addLocaleElement(alignLabel, "EMBED_RESIZEITEMLIST_ALIGN", "@textContent");
        alignWrapper.appendChild(alignLabel);
        var alignInput = ytcenter.modules.checkbox();
        alignInput.element.style.background = "#fff";
        alignInput.fixHeight();
        alignWrapper.appendChild(alignInput.element);
        
        var scrollToPlayerWrapper = document.createElement("div");
        scrollToPlayerWrapper.className = "ytcenter-panel-label";
        var scrollToPlayerLabel = document.createElement("label");
        scrollToPlayerLabel.textContent = ytcenter.language.getLocale("EMBED_RESIZEITEMLIST_SCROLLTOPLAYER");
        ytcenter.language.addLocaleElement(scrollToPlayerLabel, "EMBED_RESIZEITEMLIST_SCROLLTOPLAYER", "@textContent");
        scrollToPlayerWrapper.appendChild(scrollToPlayerLabel);
        var scrollToPlayerInput = ytcenter.modules.checkbox();
        scrollToPlayerInput.element.style.background = "#fff";
        scrollToPlayerInput.fixHeight();
        scrollToPlayerWrapper.appendChild(scrollToPlayerInput.element);
        
        var scrollToPlayerButtonWrapper = document.createElement("div");
        scrollToPlayerButtonWrapper.className = "ytcenter-panel-label";
        var scrollToPlayerButtonLabel = document.createElement("label");
        scrollToPlayerButtonLabel.textContent = ytcenter.language.getLocale("EMBED_RESIZEITEMLIST_SCROLLTOPLAYERBUTTON");
        ytcenter.language.addLocaleElement(scrollToPlayerButtonLabel, "EMBED_RESIZEITEMLIST_SCROLLTOPLAYERBUTTON", "@textContent");
        scrollToPlayerButtonWrapper.appendChild(scrollToPlayerButtonLabel);
        var scrollToPlayerButtonInput = ytcenter.modules.checkbox();
        scrollToPlayerButtonInput.element.style.background = "#fff";
        scrollToPlayerButtonInput.fixHeight();
        scrollToPlayerButtonWrapper.appendChild(scrollToPlayerButtonInput.element);
        
        var optionsWrapper = document.createElement("div");
        optionsWrapper.className = "clearfix resize-options";
        
        var saveBtn = ytcenter.gui.createYouTubePrimaryButton("", [ytcenter.gui.createYouTubeButtonTextLabel("SETTINGS_PLAYERSIZE_SAVE")]);
        saveBtn.style.cssFloat = "right";
        saveBtn.style.marginLeft = "10px";
        saveBtn.style.minWidth = "60px";
        ytcenter.utils.addEventListener(saveBtn, "click", function(){
          state = 0;
          wrp.style.visibility = "hidden";
          if (typeof saveListener !== "undefined") saveListener();
          ytcenter.events.performEvent("ui-refresh");
        });
        
        var cancelBtn = ytcenter.gui.createYouTubeDefaultButton("", [ytcenter.gui.createYouTubeButtonTextLabel("SETTINGS_PLAYERSIZE_CANCEL")]);
        cancelBtn.style.cssFloat = "right";
        cancelBtn.style.marginLeft = "10px";
        cancelBtn.style.minWidth = "60px";
        ytcenter.utils.addEventListener(cancelBtn, "click", function(){
          if (hasUnsavedChanges()) {
            ytcenter.confirmBox("EMBED_RESIZEITEMLIST_CONFIRM_TITLE", "EMBED_RESIZEITEMLIST_UNSAVED_CONFIRM_MESSAGE", function(accepted){
              if (accepted) {
                state = 0;
                wrp.style.visibility = "hidden";
                if (typeof cancelListener !== "undefined") cancelListener();
                ytcenter.events.performEvent("ui-refresh");
              }
            });
          } else {
            state = 0;
            wrp.style.visibility = "hidden";
            if (typeof cancelListener !== "undefined") cancelListener();
            ytcenter.events.performEvent("ui-refresh");
          }
        });
        
        var deleteBtn = ytcenter.gui.createYouTubeDefaultButton("", [ytcenter.gui.createYouTubeButtonTextLabel("SETTINGS_PLAYERSIZE_DELETE")]);
        deleteBtn.style.cssFloat = "left";
        deleteBtn.style.minWidth = "60px";
        ytcenter.utils.addEventListener(deleteBtn, "click", function(){
          ytcenter.confirmBox("EMBED_RESIZEITEMLIST_DELETE_CONFIRM_TITLE", "EMBED_RESIZEITEMLIST_DELETE_CONFIRM_MESSAGE", function(del){
            if (del) {
              state = 0;
              wrp.style.visibility = "hidden";
              if (typeof deleteListener !== "undefined") deleteListener();
              ytcenter.events.performEvent("ui-refresh");
            }
          }, "EMBED_RESIZEITEMLIST_CONFIRM_DELETE");
        });
        
        optionsWrapper.appendChild(deleteBtn);
        optionsWrapper.appendChild(saveBtn);
        optionsWrapper.appendChild(cancelBtn);
        
        
        wrp.appendChild(customNameWrapper);
        wrp.appendChild(dimensionWrapper);
        wrp.appendChild(largeWrapper);
        wrp.appendChild(alignWrapper);
        wrp.appendChild(scrollToPlayerWrapper);
        wrp.appendChild(scrollToPlayerButtonWrapper);
        
        wrp.appendChild(optionsWrapper);
        
        editWrapper.appendChild(wrp);
        
        
        return {
          destroy: function(){
            editWrapper.removeChild(wrp);
          },
          hasUnsavedChanges: hasUnsavedChanges,
          setState: function(s){
            state = s;
          },
          setDeleteButtonVisibility: function(visible) {
            if (visible) {
              deleteBtn.style.visibility = "";
            } else {
              deleteBtn.style.visibility = "hidden";
            }
          },
          setSaveListener: function(callback){
            saveListener = callback;
          },
          setCancelListener: function(callback){
            cancelListener = callback;
          },
          setDeleteListener: function(callback){
            deleteListener = callback;
          },
          updateAspectRatio: function(){
            __updateAspectRatio();
          },
          getAspectRatio: function(){
            return aspectRatio;
          },
          setAspectRatioLocked: function(locked){
            __setAspectRatioLocked(locked);
            original.aspectRatioLocked = ratioLocked;
          },
          isAspectRatioLocked: function(){
            return ratioLocked;
          },
          setWidth: function(width){
            state = 1;
            if (width === "") { // Default
              widthInput.value = "";
              widthUnit.setSelected("px");
              width = "px";
            } else {
              var _val = parseInt(width);
              if (isNaN(_val)) {
                widthInput.value = "";
              } else {
                widthInput.value = _val;
              }
              widthUnit.setSelected((width.indexOf("%") !== -1 ? "%" : "px"));
            }
            original.width = __getWidth();
            if (widthUnit.getValue() !== "px" || heightUnit.getValue() !== "px") {
              __setAspectVisibility(false);
            } else {
              __setAspectVisibility(true);
            }
          },
          getWidth: __getWidth,
          setHeight: function(height){
            state = 1;
            if (height === "") { // Default
              heightInput.value = "";
              heightUnit.setSelected("px");
              height = "px";
            } else {
              var _val = parseInt(height);
              if (isNaN(_val)) {
                heightInput.value = "";
              } else {
                heightInput.value = _val;
              }
              heightUnit.setSelected((height.indexOf("%") !== -1 ? "%" : "px"));
            }
            original.height = __getHeight();
            if (widthUnit.getValue() !== "px" || heightUnit.getValue() !== "px") {
              __setAspectVisibility(false);
            } else {
              __setAspectVisibility(true);
            }
          },
          getHeight: __getHeight,
          setLarge: function(large){
            state = 1;
            largeInput.update(large);
            original.large = largeInput.isSelected();
          },
          getLarge: function(){
            return largeInput.isSelected();
          },
          setAlign: function(align){
            state = 1;
            alignInput.update(align);
            original.align = alignInput.isSelected();
          },
          getAlign: function(){
            return alignInput.isSelected();
          },
          setScrollToPlayer: function(scrollToPlayer){
            state = 1;
            scrollToPlayerInput.update(scrollToPlayer);
            original.scrollToPlayer = scrollToPlayerInput.isSelected();
          },
          getScrollToPlayer: function(){
            return scrollToPlayerInput.isSelected();
          },
          setScrollToPlayerButton: function(scrollToPlayerButton){
            state = 1;
            scrollToPlayerButtonInput.update(scrollToPlayerButton);
            original.scrollToPlayerButton = scrollToPlayerButtonInput.isSelected();
          },
          getScrollToPlayerButton: function(){
            return scrollToPlayerButtonInput.isSelected();
          },
          setCustomName: function(customName){
            if (typeof customName !== "string") customName = "";
            state = 1;
            customNameInput.value = customName;
            original.customName = customName;
          },
          getCustomName: function(){
            return customNameInput.value;
          },
          setVisibility: function(visible) {
            if (visible) {
              wrp.style.visibility = "";
            } else {
              wrp.style.visibility = "hidden";
            }
          },
          newSession: function(){
            if (typeof newSessionCallback !== "undefined") newSessionCallback();
          },
          setSessionListener: function(callback){
            newSessionCallback = callback;
          },
          focusCustomNameField: function(){
            customNameInput.focus();
          },
          focusWidthField: function(){
            widthInput.focus();
          },
          focusHeightField: function(){
            heightInput.focus();
          }
        };
      }
      function getItemTitle(item) {
        var dim = ytcenter.utils.calculateDimensions(item.getConfig().width, item.getConfig().height);
        if (typeof item.getConfig().customName !== "undefined" && item.getConfig().customName !== "") {
          return item.getConfig().customName;
        } else if (isNaN(parseInt(item.getConfig().width)) && isNaN(parseInt(item.getConfig().height))) {
          return (item.getConfig().large ? ytcenter.language.getLocale("SETTINGS_RESIZE_LARGE") : ytcenter.language.getLocale("SETTINGS_RESIZE_SMALL"));
          subtext.textContent = (item.getConfig().align ? ytcenter.language.getLocale("SETTINGS_RESIZE_ALIGN") : ytcenter.language.getLocale("SETTINGS_RESIZE_CENTER"));
        } else {
          return dim[0] + "×" + dim[1];
          subtext.textContent = (item.getConfig().large ? ytcenter.language.getLocale("SETTINGS_RESIZE_LARGE") : ytcenter.language.getLocale("SETTINGS_RESIZE_SMALL")) + " - " + (item.getConfig().align ? ytcenter.language.getLocale("SETTINGS_RESIZE_ALIGN") : ytcenter.language.getLocale("SETTINGS_RESIZE_CENTER"));
        }
      }
      function getItemSubText(item) {
        if (isNaN(parseInt(item.getConfig().width)) && isNaN(parseInt(item.getConfig().height))) {
          return (item.getConfig().align ? ytcenter.language.getLocale("SETTINGS_RESIZE_ALIGN") : ytcenter.language.getLocale("SETTINGS_RESIZE_CENTER")) + (item.getConfig().scrollToPlayer ? " - " + ytcenter.language.getLocale("SETTINGS_RESIZE_SCROLLTOPLAYER") : "");
        } else {
          return (item.getConfig().large ? ytcenter.language.getLocale("SETTINGS_RESIZE_LARGE") : ytcenter.language.getLocale("SETTINGS_RESIZE_SMALL")) + " - " + (item.getConfig().align ? ytcenter.language.getLocale("SETTINGS_RESIZE_ALIGN") : ytcenter.language.getLocale("SETTINGS_RESIZE_CENTER")) + (item.getConfig().scrollToPlayer ? " - " + ytcenter.language.getLocale("SETTINGS_RESIZE_SCROLLTOPLAYER") : "");
        }
      }
      function updateListHeight() {
        var _h = editWrapper.clientHeight || editWrapper.scrollHeight;
        if (_h > 0) listWrapper.style.height = _h + "px";
      }
      function selectSizeItem(id) {
        var bypassConfirm = false;
        if (typeof editor === "undefined") {
          bypassConfirm = true;
          editor = createEditor();
        }
        var overrideData = function(){
          editor.newSession();
          var newItem = false;
          var newItemSaved = false;
          var newItemCancled = false;
          var item;
          if (typeof id === "undefined") {
            newItem = true;
            item = createEmptyItem();
            items.push(item);
            listOl.appendChild(item.getItemElement());
            listOl.scrollTop = listOl.scrollHeight - listOl.clientHeight;
          } else {
            item = getItemById(id);
          }
          markItem(item.getId());
          var inf = getItemInfo(item);
          editor.setCustomName(inf.customName);
          editor.setWidth(inf.width);
          editor.setHeight(inf.height);
          editor.setAspectRatioLocked(inf.aspectRatioLocked);
          editor.setLarge(inf.large);
          editor.setAlign(inf.align);
          editor.setScrollToPlayer(inf.scrollToPlayer);
          editor.setScrollToPlayerButton(inf.scrollToPlayerButton);
          editor.updateAspectRatio();
          
          editor.setSessionListener(function(){
            if (!newItem || newItemSaved || newItemCancled) return;
            
            var sI;
            for (var i = 0; i < items.length; i++) {
              sI = i;
              if (items[i].getId() === item.getId()) break;
            }
            items.splice(sI, 1);
            
            if (typeof item.getItemElement().parentNode !== "undefined") item.getItemElement().parentNode.removeChild(item.getItemElement());
            
            if (typeof saveCallback !== "undefined") saveCallback(getSaveArray());
          });
          
          editor.setSaveListener(function(){
            newItemSaved = true;
            item.setConfig({
              customName: editor.getCustomName(),
              width: editor.getWidth(),
              height: editor.getHeight(),
              large: editor.getLarge(),
              align: editor.getAlign(),
              scrollToPlayer: editor.getScrollToPlayer(),
              scrollToPlayerButton: editor.getScrollToPlayerButton(),
              aspectRatioLocked: editor.isAspectRatioLocked()
            });
            item.updateItemElement();
            unMarkAllItems();
            
            if (typeof saveCallback !== "undefined") saveCallback(getSaveArray());
          });
          editor.setCancelListener(function(){
            if (newItem) {
              newItemCancled = true;
              var sI;
              for (var i = 0; i < items.length; i++) {
                sI = i;
                if (items[i].getId() === item.getId()) break;
              }
              items.splice(sI, 1);
              
              if (item.getItemElement().parentNode) item.getItemElement().parentNode.removeChild(item.getItemElement());
              
              if (typeof saveCallback !== "undefined") saveCallback(getSaveArray());
            }
            unMarkAllItems();
          });
          editor.setDeleteListener(function(){
            try {
              if (newItem) return;
              if (ytcenter.player.isSelectedPlayerSizeById(item.getId())) {
                if (ytcenter.settings["resize-playersizes"][0].id === item.getId()) {
                  if (ytcenter.settings["resize-playersizes"].length > 1) {
                    ytcenter.player.resize(ytcenter.settings["resize-playersizes"][1]);
                  }
                } else {
                  ytcenter.player.resize(ytcenter.settings["resize-playersizes"][0]);
                }
              }
              unMarkAllItems();
              if (typeof item.getItemElement().parentNode !== "undefined") item.getItemElement().parentNode.removeChild(item.getItemElement());
              
              var sI;
              for (var i = 0; i < items.length; i++) {
                sI = i;
                if (items[i].getId() === item.getId()) break;
              }
              items.splice(sI, 1);
              
              if (typeof saveCallback !== "undefined") saveCallback(getSaveArray());
            } catch (e) {
              con.error(e);
            }
          });
          editor.setDeleteButtonVisibility(!newItem);
          
          editor.setVisibility(true);
          editor.focusCustomNameField();
          
          if (newItem) editor.setState(2);
        };
        if (editor.hasUnsavedChanges() && !bypassConfirm) {
          ytcenter.confirmBox("EMBED_RESIZEITEMLIST_CONFIRM_TITLE", "EMBED_RESIZEITEMLIST_UNSAVED_CONFIRM_MESSAGE", function(accepted){
            if (accepted) {
              editor.setState(0);
              overrideData();
            }
          });
        } else {
          overrideData();
        }
        updateListHeight();
      }
      function getItemById(id) {
        for (var i = 0; i < items.length; i++) {
          if (items[i].getId() === id) return items[i];
        }
      }
      function unMarkAllItems() {
        for (var i = 0; i < items.length; i++) {
          items[i].setSelection(false);
        }
      }
      function markItem(id) {
        unMarkAllItems();
        getItemById(id).setSelection(true);
      }
      function getSaveArray() {
        var _s = [];
        for (var i = 0; i < items.length; i++) {
          _s.push(items[i].getData());
        }
        return _s;
      }
      function getItemByElement(li) {
        for (var i = 0; i < items.length; i++) {
          if (items.getItemElement() === li) return items[i];
        }
      }
      function createEmptyItem() {
        return wrapItem({
          id: ytcenter.utils.assignId("resize_item_list_"),
          config: {
            customName: "",
            width: "",
            height: "",
            large: true,
            align: false,
            scrollToPlayer: false,
            scrollToPlayerButton: false,
            aspectRatioLocked: false
          }
        });
      }
      function setItems(_items) {
        items = [];
        ytcenter.utils.each(_items, function(i, item){
          items.push(wrapItem(item));
        });
        
        listOl.innerHTML = "";
        ytcenter.utils.each(items, function(i, item){
          var a = item.getItemElement();
          listOl.appendChild(a);
        });
      }
      var editor;
      var saveCallback;
      var items = [];
      var lastValue = ytcenter.settings[option.defaultSetting];
      
      var wrapper = document.createElement("div");
      wrapper.className = "ytcenter-embed ytcenter-resize-panel";
      
      var headerWrapper = document.createElement("div");
      headerWrapper.className = "ytcenter-resize-panel-header";
      
      var addButton = ytcenter.gui.createYouTubeDefaultButton("", [ytcenter.gui.createYouTubeButtonTextLabel("EMBED_RESIZEITEMLIST_ADD_SIZE")]);
      ytcenter.utils.addClass(addButton, "ytcenter-list-header-btn");
      
      ytcenter.utils.addEventListener(addButton, "click", function(){
        selectSizeItem();
      });
      
      headerWrapper.appendChild(addButton);
      
      var contentWrapper = document.createElement("div");
      contentWrapper.className = "ytcenter-resize-panel-content";
      
      var positionerEditWrapper = document.createElement("div");
      positionerEditWrapper.className = "ytcenter-resize-panel-right";
      var editWrapper = document.createElement("div");
      editWrapper.className = "ytcenter-panel";
      
      positionerEditWrapper.appendChild(editWrapper);
      
      var listWrapper = document.createElement("div");
      listWrapper.className = "ytcenter-resize-panel-list";
      
      var listOl = document.createElement("ol");
      listOl.className = "ytcenter-list ytcenter-dragdrop ytcenter-scrollbar ytcenter-scrollbar-hover";
      var dd = ytcenter.dragdrop(listOl);
      dd.addEventListener("onDrop", function(newIndex, oldIndex, item){
        var itm = items[oldIndex];
        items.splice(oldIndex, 1);
        items.splice(newIndex, 0, itm);
        if (saveCallback) saveCallback(getSaveArray());
        //ytcenter.events.performEvent("ui-refresh");
      });
      
      listWrapper.appendChild(listOl);
      contentWrapper.appendChild(listWrapper);
      contentWrapper.appendChild(positionerEditWrapper);
      wrapper.appendChild(headerWrapper);
      wrapper.appendChild(contentWrapper);
      
      if (option.parent) {
        option.parent.addEventListener("click", function(){
          if (!editor) {
            editor = createEditor();
          }
          updateListHeight();
        });
      }
      setItems(lastValue);
      return {
        element: wrapper, // So the element can be appended to an element.
        bind: function(callback){
          saveCallback = function(arg){
            if (callback) callback(arg);
            ytcenter.player.resizeUpdater();
          }
        },
        update: function(value){
          if (value === lastValue) return;
          lastValue = value;
          setItems(value);
          if (typeof editor !== "undefined") editor.setVisibility(false);
        }
      };
    };
    ytcenter.modules.select = function(option){
      function updateList() {
        select.innerHTML = "";
        ytcenter.utils.each(list, function(i, item){
          var o = document.createElement("option");
          o.setAttribute("value", i);
          if (typeof item.label !== "undefined") {
            o.textContent = ytcenter.language.getLocale(item.label);
            ytcenter.language.addLocaleElement(o, item.label, "@textContent");
          } else if (typeof item.text !== "undefined") {
            o.textContent = item.text;
          } else {
            o.textContent = "undefined";
          }
          if (selectedValue === item.value) {
            o.setAttribute("selected", "selected");
            selectedText.textContent = o.textContent;
          }
          
          select.appendChild(o);
        });
      }
      var list = (option && option.args && option.args.list) || [],
          selectedValue, saveCallback,
          wrapper = document.createElement("span"),
          selectedContentWrapper = document.createElement("span"),
          selectedArrow = document.createElement("img"),
          selectedText = document.createElement("span"),
          select = document.createElement("select");
      wrapper.className = "ytcenter-embed yt-uix-form-input-select";
      wrapper.style.marginBottom = "2px";
      wrapper.style.height = "27px";
      
      selectedContentWrapper.className = "yt-uix-form-input-select-content";
      selectedArrow.setAttribute("src", "//s.ytimg.com/yt/img/pixel-vfl3z5WfW.gif");
      selectedArrow.className = "yt-uix-form-input-select-arrow";
      selectedText.className = "yt-uix-form-input-select-value";
      
      selectedContentWrapper.appendChild(selectedArrow);
      selectedContentWrapper.appendChild(selectedText);
      
      select.className = "yt-uix-form-input-select-element";
      select.style.cursor = "pointer";
      select.style.height = "27px";
      
      updateList();
      ytcenter.utils.addEventListener(select, "change", function(e){
        selectedText.textContent = select.options[select.selectedIndex].textContent;
        if (saveCallback) saveCallback(list[select.selectedIndex].value);
      });
      
      wrapper.appendChild(selectedContentWrapper);
      wrapper.appendChild(select);
      
      return {
        element: wrapper,
        bind: function(callback){
          saveCallback = callback;
        },
        setSelected: function(value){
          selectedValue = value;
          for (var i = 0; i < list.length; i++) {
            if (list[i].value === value) {
              select.selectedIndex = i;
              break;
            }
          }
          if (select.options.length > 0) selectedText.textContent = select.options[select.selectedIndex].textContent;
        },
        update: function(value){
          selectedValue = value;
          for (var i = 0; i < list.length; i++) {
            if (list[i].value === value) {
              select.selectedIndex = i;
              break;
            }
          }
          if (select.options.length > 0) selectedText.textContent = select.options[select.selectedIndex].textContent;
        },
        updateList: function(_list){
          list = _list;
          updateList();
        },
        getValue: function(){
          return list[select.selectedIndex].value;
        }
      };
    };
    ytcenter.modules.textarea = function(option){
      var elm = document.createElement('textarea'), i, key;
      elm.className = "yt-uix-form-textarea";
      if (option && option.args && option.args.className) {
        elm.className += " " + option.args.className;
      }
      if (option && option.args && option.args.styles) {
        for (key in option.args.styles) {
          if (option.args.styles.hasOwnProperty(key)) {
            elm.style.setProperty(key, option.args.styles[key]);
          }
        }
      }
      if (option && option.args && option.args.text) {
        elm.textContent = option.args.text;
      }
      if (option && option.args && option.args.attributes) {
        for (key in option.args.attributes) {
          if (option.args.attributes.hasOwnProperty(key)) {
            elm.setAttribute(key, option.args.attributes[key]);
          }
        }
      }
      if (option && option.args && option.args.listeners) {
        for (i = 0; i < option.args.listeners.length; i++) {
          elm.addEventListener(option.args.listeners[i].event, option.args.listeners[i].callback, (option.args.listeners[i].bubble ? option.args.listeners[i].bubble : false));
        }
      }
      
      return {
        element: elm,
        bind: function(){},
        update: function(){},
        setText: function(txt){
          elm.textContent = txt;
        },
        selectAll: function(){
          elm.focus();
          elm.select();
        }
      };
    };
    ytcenter.modules.textContent = function(option){
      var elm = document.createElement("div");
      if (option && option.args && option.args.styles) {
        for (var key in option.args.styles) {
          if (option.args.styles.hasOwnProperty(key)) {
            elm.style[key] = option.args.styles[key];
          }
        }
      }
      if (option && option.args && option.args.text) {
        if (option && option.args && option.args.replace) {
          elm.appendChild(ytcenter.utils.replaceText(option.args.text, option.args.replace));
        } else {
          elm.textContent = option.args.text;
        }
      }
      if (option && option.args && option.args.textlocale) {
        if (option && option.args && option.args.replace) {
          elm.appendChild(ytcenter.utils.replaceText(ytcenter.language.getLocale(option.args.textlocale), option.args.replace));
        } else {
          elm.textContent = ytcenter.language.getLocale(option.args.textlocale);
        }
        ytcenter.events.addEvent("language-refresh", function(){
          elm.innerHTML = "";
          if (option && option.args && option.args.replace) {
            elm.appendChild(ytcenter.utils.replaceText(ytcenter.language.getLocale(option.args.textlocale), option.args.replace));
          } else {
            elm.textContent = ytcenter.language.getLocale(option.args.textlocale);
          }
        });
      }
      if (option && option.args && option.args.listeners) {
        for (var i = 0; i < option.args.listeners.length; i++) {
          elm.addEventListener(option.args.listeners[i].event, option.args.listeners[i].callback, (option.args.listeners[i].bubble ? option.args.listeners[i].bubble : false));
        }
      }
      if (option && option.args && option.args.styles) {
        for (var key in option.args.styles) {
          if (option.args.styles.hasOwnProperty(key)) {
            elm.style[key] = option.args.styles[key];
          }
        }
      }
      return {
        element: elm,
        bind: function(){},
        update: function(){}
      };
    };
    ytcenter.modules.textfield = function(option){
      function update(text) {
        input.value = text;
      }
      function bind(callback) {
        ytcenter.utils.addEventListener(input, "change", function(){
          callback(input.value);
        }, false);
      }
      var frag = document.createDocumentFragment(),
          input = document.createElement("input");
      input.setAttribute("type", "text");
      input.className = "yt-uix-form-input-text";
      input.value = option && ytcenter.settings[option.defaultSetting];
      if (option && option.style) {
        for (var key in option.style) {
          if (option.style.hasOwnProperty(key)) {
            elm.style[key] = option.style[key];
          }
        }
      }
      frag.appendChild(input);
      return {
        element: frag,
        bind: bind,
        update: update
      };
    };
    ytcenter.modules.translators = function(option){
      option = typeof option !== "undefined" ? option : false;
      var elm = document.createElement("div");
      
      var translators = document.createElement("div"),
          table = document.createElement("table"),
          thead = document.createElement("thead"),
          tbody = document.createElement("tbody"),
          tr, td;
      table.className = "ytcenter-settings-table";
      tr = document.createElement("tr");
      td = document.createElement("td");
      td.textContent = ytcenter.language.getLocale("TRANSLATOR_LANGUAGE");
      ytcenter.language.addLocaleElement(td, "TRANSLATOR_LANGUAGE", "@textContent");
      tr.appendChild(td);
      
      td = document.createElement("td");
      td.textContent = ytcenter.language.getLocale("TRANSLATOR_ENGLISH");
      ytcenter.language.addLocaleElement(td, "TRANSLATOR_ENGLISH", "@textContent");
      tr.appendChild(td);
      
      td = document.createElement("td");
      td.textContent = ytcenter.language.getLocale("TRANSLATOR_CONTRIBUTORS");
      ytcenter.language.addLocaleElement(td, "TRANSLATOR_CONTRIBUTORS", "@textContent");
      tr.appendChild(td);
      
      thead.appendChild(tr);
      
      table.appendChild(thead);
      table.appendChild(tbody);
      ytcenter.utils.each(option.args.translators, function(key, value){
        if (value.length > 0) {
          tr = document.createElement("tr");
          td = document.createElement("td");
          td.textContent = ytcenter.language.getLocale("LANGUAGE", key);
          tr.appendChild(td);
          td = document.createElement("td");
          td.textContent = ytcenter.language.getLocale("LANGUAGE_ENGLISH", key);
          tr.appendChild(td);
          td = document.createElement("td");

          for (var i = 0; i < value.length; i++) {
            if (i > 0) td.appendChild(document.createTextNode(" & "));
            var el;
            if (value[i].url) {
              el = document.createElement("a");
              el.href = value[i].url;
              el.textContent = value[i].name;
              el.setAttribute("target", "_blank");
            } else {
              el = document.createTextNode(value[i].name);
            }
            td.appendChild(el);
          }
          tr.appendChild(td);
          tbody.appendChild(tr);
        }
      });
      translators.appendChild(table);
      elm.appendChild(translators);
      
      return {
        element: elm,
        bind: function(){},
        update: function(){}
      };
    };
    
    ytcenter._intercomOnPlayer = false;
    /*! intercom.js | https://github.com/diy/intercom.js | Apache License (v2) */
    ytcenter.Intercom = (function(){
      
      // --- lib/events.js ---
      
      var EventEmitter = function() {};
      
      EventEmitter.createInterface = function(space) {
        var methods = {};
        
        methods.on = function(name, fn) {
          if (typeof this[space] === 'undefined') {
            this[space] = {};
          }
          if (!this[space].hasOwnProperty(name)) {
            this[space][name] = [];
          }
          this[space][name].push(fn);
        };
        
        methods.off = function(name, fn) {
          if (typeof this[space] === 'undefined') return;
          if (this[space].hasOwnProperty(name)) {
            util.removeItem(fn, this[space][name]);
          }
        };
        
        methods.trigger = function(name) {
          if (typeof this[space] !== 'undefined' && this[space].hasOwnProperty(name)) {
            var args = Array.prototype.slice.call(arguments, 1);
            for (var i = 0; i < this[space][name].length; i++) {
              this[space][name][i].apply(this[space][name][i], args);
            }
          }
        };
        
        return methods;
      };
      
      var pvt = EventEmitter.createInterface('_handlers');
      EventEmitter.prototype._on = pvt.on;
      EventEmitter.prototype._off = pvt.off;
      EventEmitter.prototype._trigger = pvt.trigger;
      
      var pub = EventEmitter.createInterface('handlers');
      EventEmitter.prototype.on = function() {
        pub.on.apply(this, arguments);
        Array.prototype.unshift.call(arguments, 'on');
        this._trigger.apply(this, arguments);
      };
      EventEmitter.prototype.off = pub.off;
      EventEmitter.prototype.trigger = pub.trigger;
      
      // --- lib/localstorage.js ---
      var localStorage;
      if (identifier === 6) {
        localStorage = {
          getItem: session_getValue.bind(this),
          setItem: session_setValue.bind(this),
          removeItem: session_remove.bind(this)
        };
      } else {
        try {
          localStorage = uw.localStorage;
          if (typeof localStorage === 'undefined') {
            localStorage = {
              getItem    : function() {},
              setItem    : function() {},
              removeItem : function() {}
            };
          }
        } catch (e) {
          con.error(e);
          localStorage = {
            getItem    : function() {},
            setItem    : function() {},
            removeItem : function() {}
          };
        }
      }
      
      // --- lib/util.js ---
      
      var util = {};
      
      util.guid = (function() {
        var S4 = function() {
          return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        };
        return function() {
          return S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4();
        };
      })();
      
      util.throttle = function(delay, fn) {
        var last = 0;
        return function() {
          var now = (new Date()).getTime();
          if (now - last > delay) {
            last = now;
            try {
              fn.apply(this, arguments);
            } catch (e) {
              con.error(e);
            }
          }
        };
      };
      
      util.extend = function(a, b) {
        if (typeof a === 'undefined' || !a) { a = {}; }
        if (typeof b === 'object') {
          for (var key in b) {
            if (b.hasOwnProperty(key)) {
              a[key] = b[key];
            }
          }
        }
        return a;
      };
      
      util.removeItem = function(item, array) {
        for (var i = array.length - 1; i >= 0; i--) {
          if (array[i] === item) {
            array.splice(i, 1);
          }
        }
        return array;
      };
      
      // --- lib/intercom.js ---
      
      /**
      * A cross-window broadcast service built on top
      * of the HTML5 localStorage API. The interface
      * mimic socket.io in design.
      *
      * @author Brian Reavis <brian@thirdroute.com>
      * @constructor
      */
      
      var Intercom = function() {
        var self = this;
        var now = (new Date()).getTime();
      
        this.origin         = util.guid();
        this.lastMessage    = now;
        this.bindings       = [];
        this.receivedIDs    = {};
        this.previousValues = {};
      
        var storageHandler = function() {
          var args = arguments;
          if (identifier === 6) args = [arguments[0]];
          self._onStorageEvent.apply(self, args);
        };
        if (identifier === 6) {
          session_addEventListener("storage", storageHandler);
          ytcenter.unload(function(){
            session_removeEventListener("storage", storageHandler);
          });
        } else if (window.attachEvent) {
          document.attachEvent('onstorage', storageHandler);
          ytcenter.unload(function(){
            document.detachEvent("storage", storageHandler);
          });
        } else {
          window.addEventListener('storage', storageHandler, false);
          ytcenter.unload(function(){
            window.removeEventListener("storage", storageHandler, false);
          });
        }
      };
      
      Intercom.prototype._transaction = function(fn) {
        var TIMEOUT   = 1000;
        var WAIT      = 20;
      
        var self      = this;
        var executed  = false;
        var listening = false;
        var waitTimer = null;
      
        var lock = function() {
          if (executed) return;
      
          var now = (new Date()).getTime();
          var activeLock = parseInt(localStorage.getItem(INDEX_LOCK) || 0);
          if (activeLock && now - activeLock < TIMEOUT) {
            if (!listening) {
              self._on('storage', lock);
              listening = true;
            }
            waitTimer = window.setTimeout(lock, WAIT);
            return;
          }
          executed = true;
          localStorage.setItem(INDEX_LOCK, now);
      
          fn();
          unlock();
        };
      
        var unlock = function() {
          if (listening) { self._off('storage', lock); }
          if (waitTimer) { window.clearTimeout(waitTimer); }
          localStorage.removeItem(INDEX_LOCK);
        };
      
        lock();
      };
      
      Intercom.prototype._cleanup_emit = util.throttle(100, function() {
        var self = this;
      
        this._transaction(function() {
          var now = (new Date()).getTime();
          var threshold = now - THRESHOLD_TTL_EMIT;
          var changed = 0;
      
          var messages = JSON.parse(localStorage.getItem(INDEX_EMIT) || '[]');
          for (var i = messages.length - 1; i >= 0; i--) {
            if (messages[i].timestamp < threshold) {
              messages.splice(i, 1);
              changed++;
            }
          }
          if (changed > 0) {
            localStorage.setItem(INDEX_EMIT, JSON.stringify(messages));
          }
        });
      });
      
      Intercom.prototype._cleanup_once = util.throttle(100, function() {
        var self = this;
      
        this._transaction(function() {
          var timestamp, ttl, key;
          var table   = JSON.parse(localStorage.getItem(INDEX_ONCE) || '{}');
          var now     = (new Date()).getTime();
          var changed = 0;
      
          for (key in table) {
            if (self._once_expired(key, table)) {
              delete table[key];
              changed++;
            }
          }
      
          if (changed > 0) {
            localStorage.setItem(INDEX_ONCE, JSON.stringify(table));
          }
        });
      });
      
      Intercom.prototype._once_expired = function(key, table) {
        if (!table) return true;
        if (!table.hasOwnProperty(key)) return true;
        if (typeof table[key] !== 'object') return true;
        var ttl = table[key].ttl || THRESHOLD_TTL_ONCE;
        var now = (new Date()).getTime();
        var timestamp = table[key].timestamp;
        return timestamp < now - ttl;
      };
      
      Intercom.prototype._localStorageChanged = function(event, field) {
        if (event && event.key) {
          return event.key === field;
        }
      
        var currentValue = localStorage.getItem(field);
        if (currentValue === this.previousValues[field]) {
          return false;
        }
        this.previousValues[field] = currentValue;
        return true;
      };
      
      Intercom.prototype._onStorageEvent = function(event) {
        event = event || window.event;
        var self = this;
      
        if (this._localStorageChanged(event, INDEX_EMIT)) {
          this._transaction(function() {
            var now = (new Date()).getTime();
            var data = localStorage.getItem(INDEX_EMIT);
            var messages = JSON.parse(data || '[]');
            for (var i = 0; i < messages.length; i++) {
              if (messages[i].origin === self.origin) continue;
              if (messages[i].timestamp < self.lastMessage) continue;
              if (messages[i].id) {
                if (self.receivedIDs.hasOwnProperty(messages[i].id)) continue;
                self.receivedIDs[messages[i].id] = true;
              }
              self.trigger(messages[i].name, messages[i].payload);
            }
            self.lastMessage = now;
          });
        }
      
        this._trigger('storage', event);
      };
      
      Intercom.prototype._emit = function(name, message, id) {
        id = (typeof id === 'string' || typeof id === 'number') ? String(id) : null;
        if (id && id.length) {
          if (this.receivedIDs.hasOwnProperty(id)) return;
          this.receivedIDs[id] = true;
        }
      
        var packet = {
          id        : id,
          name      : name,
          origin    : this.origin,
          timestamp : (new Date()).getTime(),
          payload   : message
        };
      
        var self = this;
        this._transaction(function() {
          var data = localStorage.getItem(INDEX_EMIT) || '[]';
          var delimiter = (data === '[]') ? '' : ',';
          data = [data.substring(0, data.length - 1), delimiter, JSON.stringify(packet), ']'].join('');
          localStorage.setItem(INDEX_EMIT, data);
          self.trigger(name, message);
      
          window.setTimeout(function() { self._cleanup_emit(); }, 50);
        });
      };
      
      Intercom.prototype.bind = function(object, options) {
        for (var i = 0; i < Intercom.bindings.length; i++) {
          var binding = Intercom.bindings[i].factory(object, options || null, this);
          if (binding) { this.bindings.push(binding); }
        }
      };
      
      Intercom.prototype.emit = function(name, message) {
        this._emit.apply(this, arguments);
        this._trigger('emit', name, message);
      };
      
      Intercom.prototype.once = function(key, fn, ttl) {
        if (!Intercom.supported) return;
      
        var self = this;
        this._transaction(function() {
          var data = JSON.parse(localStorage.getItem(INDEX_ONCE) || '{}');
          if (!self._once_expired(key, data)) return;
      
          data[key] = {};
          data[key].timestamp = (new Date()).getTime();
          if (typeof ttl === 'number') {
            data[key].ttl = ttl * 1000;
          }
      
          localStorage.setItem(INDEX_ONCE, JSON.stringify(data));
          fn();
      
          window.setTimeout(function() { self._cleanup_once(); }, 50);
        });
      };
      
      util.extend(Intercom.prototype, EventEmitter.prototype);
      
      Intercom.bindings = [];
      Intercom.supported = (typeof localStorage !== 'undefined');
      
      var INDEX_EMIT = 'intercom';
      var INDEX_ONCE = 'intercom_once';
      var INDEX_LOCK = 'intercom_lock';
      
      var THRESHOLD_TTL_EMIT = 50000;
      var THRESHOLD_TTL_ONCE = 1000 * 3600;
      
      Intercom.destroy = function() {
        localStorage.removeItem(INDEX_LOCK);
        localStorage.removeItem(INDEX_EMIT);
        localStorage.removeItem(INDEX_ONCE);
      };
      
      Intercom.getInstance = (function() {
        var intercom = null;
        return function() {
          if (!intercom) {
            intercom = new Intercom();
          }
          return intercom;
        };
      })();
      
      // --- lib/bindings/socket.js ---
      
      /**
      * Socket.io binding for intercom.js.
      *
      * - When a message is received on the socket, it's emitted on intercom.
      * - When a message is emitted via intercom, it's sent over the socket.
      *
      * @author Brian Reavis <brian@thirdroute.com>
      */
      
      var SocketBinding = function(socket, options, intercom) {
        options = util.extend({
          id      : null,
          send    : true,
          receive : true
        }, options);
        
        if (options.receive) {
          var watchedEvents = [];
          var onEventAdded = function(name, fn) {
            if (watchedEvents.indexOf(name) === -1) {
              watchedEvents.push(name);
              socket.on(name, function(data) {
                var id = (typeof options.id === 'function') ? options.id(name, data) : null;
                var emit = (typeof options.receive === 'function') ? options.receive(name, data) : true;
                if (emit || typeof emit !== 'boolean') {
                  intercom._emit(name, data, id);
                }
              });
            }
          };
      
          for (var name in intercom.handlers) {
            for (var i = 0; i < intercom.handlers[name].length; i++) {
              onEventAdded(name, intercom.handlers[name][i]);
            }
          }
        
          intercom._on('on', onEventAdded);
        }
        
        if (options.send) {
          intercom._on('emit', function(name, message) {
            var emit = (typeof options.send === 'function') ? options.send(name, message) : true;
            if (emit || typeof emit !== 'boolean') {
              socket.emit(name, message);
            }
          });
        }
      };
      
      SocketBinding.factory = function(object, options, intercom) {
        if (typeof object.socket === 'undefined') { return false };
        return new SocketBinding(object, options, intercom);
      };
      
      Intercom.bindings.push(SocketBinding);
      return Intercom;
    })();
    ytcenter.experiments = {};
    ytcenter.experiments.isTopGuide = function(){
      if (ytcenter.utils.hasClass(document.body, "site-as-giant-card") || ytcenter.utils.hasClass(document.body, "guide-pinning-enabled"))
        return true;
      return ytcenter.utils.hasClass(document.body, "exp-top-guide") && !ytcenter.utils.hasClass(document.body, "ytg-old-clearfix");
    };
    ytcenter.experiments.isFixedTopbar = function(){
      return ytcenter.utils.hasClass(document.body, "exp-fixed-masthead");
    };
    
    // @utils
    ytcenter.utils.cleanObject = function(obj){
      try {
        if (obj instanceof Object && typeof obj["__exposedProps__"] !== "undefined") delete obj["__exposedProps__"];
      } catch (e) {
        con.error(e);
      }
      var key;
      for (key in obj) {
        if (!obj.hasOwnProperty(key)) {
          delete obj[key];
        } else {
          if (key === "__exposedProps__") {
            delete obj[key];
          } else if (obj[key] instanceof Object) {
            obj[key] = ytcenter.utils.cleanObject(obj[key]);
          }
        }
      }
      return obj;
    };
    
    ytcenter.utils.setCaretPosition = function(el, pos){
      if (pos < 0) pos = 0;
      if (pos > el.value.length) pos = el.value.length;
      
      if (typeof el.selectionStart === "number") {
        el.selectionStart = pos;
        el.selectionEnd = pos;
      } else if (document.selection) {
        el.focus();
        
        var sel = document.selection.createRange();
        sel.moveStart("character", pos);
        sel.moveEnd("character", 0);
        sel.select();
      }
    };
    ytcenter.utils.getCaretPosition = function(el){
      var pos = 0;
      if (typeof el.selectionStart === "number") {
        pos = el.selectionStart;
      } else if (document.selection) {
        el.focus();
        
        var sel = document.selection.createRange();
        sel.moveStart("character", -el.value.length);
        pos = sel.text.length;
      }
      
      return pos;
    };
    
    ytcenter.utils.prefixText = function(text, prefixChar, preferedLength){
      var t = ("" + text);
      if (t.length < preferedLength) {
        var i;
        for (i = 0; i < preferedLength - t.length; i++) {
          t = prefixChar + t;
        }
      }
      return t;
    };
    
    ytcenter.utils.replaceContent = function(content, data, start, end) {
      var a = content.indexOf(start)
          b = content.indexOf(end);
      return content.substring(0, a + start.length) + JSON.stringify(data) + content.substring(b);
    }
    
    /* Code taken from https://code.google.com/p/doctype-mirror/wiki/ArticleNodeContains */
    ytcenter.utils.contains = function(parent, descendant){
      // W3C DOM Level 3
      if (typeof parent.compareDocumentPosition != 'undefined') {
        return parent == descendant || Boolean(parent.compareDocumentPosition(descendant) & 16);
      }

      // W3C DOM Level 1
      while (descendant && parent != descendant) {
        descendant = descendant.parentNode;
      }
      return descendant == parent;
    };
    ytcenter.utils.toArray = function(list){
      var arr = [], i, len = list.length;
      for (i = 0; i < len; i++) {
        arr.push(list[i]);
      }
      return arr;
    };
    ytcenter.utils.scrollTop = function(scrollTop){
      if (!document) return null;
      if (typeof scrollTop === "number") {
        window.scroll(0, scrollTop);
        /*if (document.body && typeof document.body.scrollTop === "number") {
          document.body.scrollTop = scrollTop;
        } else {
          document.documentElement.scrollTop = scrollTop;
        }*/
      }
      if (document.body && typeof document.body.scrollTop === "number") {
        return document.body.scrollTop;
      } else {
        return document.documentElement.scrollTop;
      }
    };
    ytcenter.utils.isParent = function(parent, child){
      var a = parent.getElementsByTagName(child.tagName), i;
      for (i = 0; i < a.length; i++) {
        if (a[i] === child) return;
      }
      return false;
    };
    
    /* The util function "throttle" and "once" has been taken from Underscore.
     * **************************
     * http://underscorejs.org
     * (c) 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
     * Underscore may be freely distributed under the MIT license.
     */
    ytcenter.utils.throttle = function(func, delay, options){
      function timeout() {
        previous = options.leading === false ? 0 : new Date;
        timer = null;
        result = func.apply(context, args);
      }
      var context, args, result, timer = null, previous = 0;
      options = options || {};
      return function(){
        var now = new Date, dt;
        
        context = this;
        args = arguments;
        
        if (!previous && options.leading === false) previous = now;
        dt = delay - (now - previous);
        
        if (dt <= 0) {
          uw.clearTimeout(timer);
          timer = null;
          previous = now;
          result = func.apply(context, args);
        } else if (!timer && options.trailing !== false) {
          timer = uw.setTimeout(timeout, dt);
        }
        return result;
      };
    };
    ytcenter.utils.once = function(func) {
      var ran = false, memo;
      return function() {
        if (ran) return memo;
        ran = true;
        memo = func.apply(this, arguments);
        func = null;
        return memo;
      };
    };
    
    ytcenter.utils.isContainerOverflowed = function(a){ // Possible going to use this one
      // AKA Is the container bigger on the inside than the outside?
      return {
        x: a.scrollWidth > a.clientWidth,
        y: a.scrollHeight > a.clientHeight
      };
    };
    ytcenter.utils.isScrollable = function(a){
      var b = ytcenter.utils.getOverflow(a);
      if (!b.x && !b.y) return false;
      return {
        x: b.x && a.scrollWidth > a.clientWidth,
        y: b.y && a.scrollHeight > a.clientHeight
      };
    };
    ytcenter.utils.getOverflow = function(a){
      var b = ytcenter.utils.getComputedStyles(a),
          c = {
            auto: true,
            scroll: true,
            visible: false,
            hidden: false
          };
      return { x: c[b.overflowX.toLowerCase()], y: c[b.overflowY.toLowerCase()] };
    };
    ytcenter.utils.getComputedStyles = function(a){
      if (!a) return {};
      if (document && document.defaultView && document.defaultView.getComputedStyle)
        return document.defaultView.getComputedStyle(a, null);
      return a.currentStyle;
    };
    ytcenter.utils.getComputedStyle = function(a, b) {
      return ytcenter.utils.getComputedStyles(a)[b];
    };
    ytcenter.utils.getBoundingClientRect = function(a) {
      var b;
      if (!a) return null;
      try {
        b = a.getBoundingClientRect();
        b = {
          left: b.left,
          top: b.top,
          right: b.right,
          bottom: b.bottom
        };
      } catch (c) {
        return {
          left: 0,
          top: 0,
          right: 0,
          bottom: 0
        }
      }
      if (a.ownerDocument.body) {
        a = a.ownerDocument;
        b.left -= a.documentElement.clientLeft + a.body.clientLeft;
        b.top -= a.documentElement.clientTop + a.body.clientTop;
      }
      return b;
    };
    ytcenter.utils.getDimension = function(elm){
      if (!elm) return { width: 0, height: 0 };
      return { width: elm.offsetWidth, height: elm.offsetHeight };
    };
    ytcenter.utils.isElementPartlyInView = function(elm, offset, winDim){
      var box = ytcenter.utils.getBoundingClientRect(elm) || { left: 0, top: 0, right: 0, bottom: 0 },
          dim = ytcenter.utils.getDimension(elm), a = elm, b, c, d;
      offset = offset || { top: 0, left: 0 };
      
      winDim = winDim || {width: window.innerWidth || document.documentElement.clientWidth, height: window.innerHeight || document.documentElement.clientHeight };
      
      return (box.top + offset.top >= 0 - dim.height
           && box.left + offset.left >= 0 - dim.width
           && box.bottom + offset.top <= winDim.height + dim.height
           && box.right + offset.left <= winDim.width + dim.width);
    };
    ytcenter.utils.isElementInView = function(elm){ // TODO Implement scrollable elements support.
      if (ytcenter.utils.getComputedStyle(elm, "display").toLowerCase() === "none")
        return false;
      var box = ytcenter.utils.getBoundingClientRect(elm) || { left: 0, top: 0, right: 0, bottom: 0 }, a = elm, b, c;
      while (!!(a = a.parentNode) && a !== document.body) {
        if (ytcenter.utils.getComputedStyle(a, "display").toLowerCase() === "none")
          return false;
        b = ytcenter.utils.isContainerOverflowed(a);
        if (b.x || b.y) {
          c = ytcenter.utils.getBoundingClientRect(a) || { left: 0, top: 0, right: 0, bottom: 0 };
          c.top = c.top - box.top + a.scrollTop;
          c.left = c.left - box.left + a.scrollLeft;
          c.bottom = c.bottom - box.bottom + a.scrollTop;
          c.right = c.right - box.right + a.scrollLeft;
          if (!(c.top >= 0 && c.left >= 0 && c.bottom <= a.clientHeight && c.right <= a.clientWidth))
            return false;
          // We now know that the element is visible in the parent and therefore we can just check if the parent is visible ~magic.
          return ytcenter.utils.isElementInView(a);
        }
      };
      return (box.top >= 0
           && box.left >= 0
           && box.bottom <= (window.innerHeight || document.documentElement.clientHeight)
           && box.right <= (window.innerWidth || document.documentElement.clientWidth));
    };
    ytcenter.utils.getVideoIdFromLink = function(url){
      var videoIdRegex = /v=([a-zA-Z0-9-_]+)/,
          indexRegex = /index=([0-9]+)/,
          videoIdsRegex = /video_ids=([0-9a-zA-Z-_%]+)/,
          i = 0, a;
      if (url.match(videoIdRegex)) {
        a = videoIdRegex.exec(url);
        if (a && a[1]) return a[1];
      } else if (url.match(videoIdsRegex)) {
        a = indexRegex.exec(url);
        if (a && a[1]) {
          i = parseInt(a[1]);
        }
        
        a = videoIdsRegex.exec(url);
        if (a && a[1] && a[1].split("%2C").length > 0 && a[1].split("%2C")[i]) {
          return a[1].split("%2C")[i];
        }
      }
      
      return null;
    };
    ytcenter.utils.replaceTextAsString = function(text, rep) {
      if (!text) return text;
      var tmp = "";
      var startB = false;
      var func = "";
      var tmpName = "";
      var tmpFunc = "";
      var inFunc = false;
      for (var i = 0; i < text.length; i++) {
        if (text.charAt(i) == "{" && !startB && !inFunc) {
          startB = true;
        } else if (text.charAt(i) == "}" && startB) {
          var t = tmpName;
          for (var key in rep) {
            if (rep.hasOwnProperty(key)) {
              if (key === tmpName) {
                tmpName = "";
                t = rep[key];
                break;
              }
            }
          }
          tmp += t;
          startB = false;
        } else if (startB) {
          if (tmpName == "" && text.charAt(i) == "!") {
            tmp += "{";
            startB = false;
          } else {
            tmpName += text.charAt(i);
          }
        } else {
          tmp += text.charAt(i);
        }
      }
      return tmp;
    };
    ytcenter.utils.replaceTextToText = function(text, replacer){
      var regex, arr = [], tmp = "";
      text = text || "";
      for (key in replacer) {
        if (replacer.hasOwnProperty(key)) {
          arr.push(ytcenter.utils.escapeRegExp(key));
        }
      }
      regex = new RegExp(arr.join("|") + "|.", "g");
      text.replace(regex, function(matched){
        if (replacer[matched]) {
          if (typeof replacer[matched] === "function") {
            var a = replacer[matched]();
            if (typeof a === "string") {
              tmp += a;
            } else {
              con.error("[TextReplace] Unknown type of replacer!");
            }
          } else if (typeof replacer[matched] === "string") {
            tmp += replacer[matched];
          } else {
            con.error("[TextReplace] Unknown type of replacer!");
          }
        } else {
          tmp += matched;
        }
      });
      
      return tmp;
    };
    ytcenter.utils.guid = function(){
      function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
      }
      return S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
    };
    ytcenter.utils.srtTimeFormat = function(totalSeconds){
      var sec_num = Math.floor(totalSeconds),
          hours = Math.floor(sec_num / 3600),
          minutes = Math.floor((sec_num - (hours * 3600)) / 60),
          seconds = sec_num - (hours * 3600) - (minutes * 60),
          milliseconds = Math.round((totalSeconds - sec_num)*100);
      if (hours < 10) hours = "0" + hours;
      if (minutes < 10) minutes = "0" + minutes;
      if (seconds < 10) seconds = "0" + seconds;
      if (milliseconds < 100) milliseconds = "0" + milliseconds;
      if (milliseconds < 10) milliseconds = "0" + milliseconds;
      return hours + ":" + minutes + ":" + seconds + "," + milliseconds;
    };
    ytcenter.utils.parseXML = function(rawxml){
      var doc;
      if (uw.DOMParser) {
        var parser = new uw.DOMParser();
        doc = parser.parseFromString(rawxml, "text/xml");
      } else if (uw.ActiveXObject) {
        doc = new uw.ActiveXObject("Microsoft.XMLDOM");
        doc.async = false;
        doc.loadXML(rawxml);
      } else {
        throw new Error("[XMLParser] Cannot parse XML!");
      }
      return doc;
    };
    ytcenter.utils.getURL = function(url){
      var a = document.createElement("a");
      a.href = url;
      return a;
    };
    ytcenter.utils.wrapModule = function(module, tagname){
      var a = document.createElement(tagname || "span");
      a.appendChild(module.element);
      return a;
    };
    ytcenter.utils.getStorageType = function(){
      try {
        if (identifier === 6) {
          con.log("[Storage] Using Firefox's storage option!");
          return 8;
        } else if (identifier === 1 && injected) {
          con.log("[Storage] Using Chrome's storage option!");
          return 7;
        } else if (identifier === 2) {
          con.log("[Storage] Using Maxthon's storage option!");
          return 6;
        } else if (identifier === 3) {
          con.log("[Storage] Using Firefox Legacy's storage option!");
          return 5;
        } else if (identifier === 5) {
          con.log("[Storage] Using Opera's storage option!");
          return 4;
        } else if (typeof GM_getValue !== "undefined" && (typeof GM_getValue.toString === "undefined" || GM_getValue.toString().indexOf("not supported") === -1)) {
          con.log("[Storage] Using Greasemonkey's storage option!");
          return 3;
        } else if (typeof localStorage !== "undefined") {
          con.log("[Storage] Using localStorage's storage option!");
          return 2;
        } else if (typeof uw.localStorage !== "undefined") {
          con.log("[Storage] Using unsafeWindow localStorage's storage option!");
          return 1;
        } else if (typeof document.cookie !== "undefined") {
          con.log("[Storage] Using cookie's storage option!");
          return 0;
        } else {
          con.error("[Storage] Unknown Storage!");
          return -1;
        }
      } catch (e) {
        con.error(e);
        return -1;
      }
    };
    ytcenter.storageType = ytcenter.utils.getStorageType();
    ytcenter.utils.transformToArray = function(domArray){
      var a = [], i;
      for (i = 0; i < domArray.length; i++) {
        a.push(domArray[i]);
      }
      return a;
    };
    ytcenter.utils.decodeHTML = function(a){
      return a.replace(/&([^;]+);/g, function(a, c){
        switch (c) {
          case "amp":
            return "&";
          case "lt":
            return "<";
          case "gt":
            return ">";
          case "quot":
            return '"';
          default:
            if ("#" == c.charAt(0)) {
              var d = Number("0" + c.substr(1));
              if (!isNaN(d)) return String.fromCharCode(d)
            }
            return a
        }
      })
    };
    ytcenter.utils.decode = function(a){
      var b = {
        "&amp;": "&",
        "&lt;": "<",
        "&gt;": ">",
        "&quot;": '"'
      }, c = window.document.createElement("div");
      return a.replace(/&([^;\s<&]+);?/g, function(a, e){
        var g = b[a];
        if (g) return g;
        if ("#" == e.charAt(0)) {
          var h = Number("0" + e.substr(1));
          (0, window.isNaN)(h) || (g = String.fromCharCode(h))
        }
        g || (c.innerHTML = a + " ", g = c.firstChild.nodeValue.slice(0, -1));
        return b[a] = g
      })
    };
    ytcenter.utils.encodeRawTag = function(text){
      var a = document.createElement("a"),
          b = document.createElement("div");
      a.setAttribute("class", text);
      b.appendChild(a);
      return b.innerHTML.substring("<a class=\"".length, b.innerHTML.length - "\"></a>".length);
    };
    ytcenter.utils.decodeRawTag = function(text){
      var a = document.createElement("div");
      a.innerHTML = "<a class=\"" + text + "\"></a>";
      return a.firstChild.getAttribute("class");
    };
    ytcenter.utils.setterGetterClassCompatible = function(){
      try {
        var a_getter = false, a_setter = false, a_instance, a_confirm = "WORKS";
        a_instance = defineLockedProperty({}, "test", function(value){a_setter = value === a_confirm}, function(){a_getter = true;return a_confirm;});
        if (a_confirm === a_instance.test) {
          a_instance.test = a_confirm;
          if (a_getter && a_setter)
            return true;
        }
      } catch (e) {
        con.error(e);
        return false;
      }
      return false;
    };
    ytcenter.utils.isNode = function(a){
      if (typeof Node === "object") {
        return a instanceof Node;
      } else if (a && typeof a === "object" && typeof a.nodeType === "number" && typeof a.nodeName === "string") {
        return true;
      }
      return false;
    };
    ytcenter.utils.escapeRegExp = function(str) {
      return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    };
    
    ytcenter.utils.replaceTextAsString = function(text, rep) {
      if (!text) return text;
      var tmp = "";
      var startB = false;
      var func = "";
      var tmpName = "";
      var tmpFunc = "";
      var inFunc = false;
      for (var i = 0; i < text.length; i++) {
        if (text.charAt(i) == "{" && !startB && !inFunc) {
          startB = true;
        } else if (text.charAt(i) == "}" && startB) {
          var t = tmpName;
          for (var key in rep) {
            if (rep.hasOwnProperty(key)) {
              if (key === tmpName) {
                tmpName = "";
                t = rep[key];
                break;
              }
            }
          }
          tmp += t;
          startB = false;
        } else if (startB) {
          if (tmpName == "" && text.charAt(i) == "!") {
            tmp += "{";
            startB = false;
          } else {
            tmpName += text.charAt(i);
          }
        } else {
          tmp += text.charAt(i);
        }
      }
      return tmp;
    };
    /** This will replace strings in a text with other strings or HTML elements.
     * replacer :  {
     *                "__REPLACEDSTRING__": document.createElement("div"),
     *                "{REPLACESTRING}": "ANOTHER STRING"
     *             }
     */
    ytcenter.utils.replaceText = function(text, replacer){
      var frag = document.createDocumentFragment(),
          regex, arr = [], tmp = "";
      for (key in replacer) {
        if (replacer.hasOwnProperty(key)) {
          arr.push(ytcenter.utils.escapeRegExp(key));
        }
      }
      regex = new RegExp(arr.join("|") + "|.", "g");
      text.replace(regex, function(matched){
        if (replacer[matched]) {
          if (tmp !== "") {
            frag.appendChild(document.createTextNode(tmp));
            tmp = "";
          }
          if (typeof replacer[matched] === "function") {
            var a = replacer[matched]();
            if (typeof a === "string") {
              frag.appendChild(document.createTextNode(a));
            } else if (ytcenter.utils.isNode(a)) {
              frag.appendChild(a);
            } else {
              con.error("[TextReplace] Unknown type of replacer!");
            }
          } else if (typeof replacer[matched] === "string") {
            frag.appendChild(document.createTextNode(replacer[matched]));
          } else if (ytcenter.utils.isNode(replacer[matched])) {
            frag.appendChild(replacer[matched]);
          } else {
            con.error("[TextReplace] Unknown type of replacer!");
          }
        } else {
          tmp += matched;
        }
      });
      if (tmp !== "") {
        frag.appendChild(document.createTextNode(tmp));
        tmp = "";
      }
      
      return frag;
    };
    ytcenter.utils._escape_html_entities = [
      ["&nbsp;", "&iexcl;", "&cent;", "&pound;", "&curren;", "&yen;", "&brvbar;", "&sect;", "&uml;", "&copy;", "&ordf;", "&laquo;", "&not;", "&shy;", "&reg;", "&macr;", "&deg;", "&plusmn;", "&sup2;", "&sup3;", "&acute;", "&micro;", "&para;", "&middot;", "&cedil;", "&sup1;", "&ordm;", "&raquo;", "&frac14;", "&frac12;", "&frac34;", "&iquest;", "&Agrave;", "&Aacute;", "&Acirc;", "&Atilde;", "&Auml;", "&Aring;", "&AElig;", "&Ccedil;", "&Egrave;", "&Eacute;", "&Ecirc;", "&Euml;", "&Igrave;", "&Iacute;", "&Icirc;", "&Iuml;", "&ETH;", "&Ntilde;", "&Ograve;", "&Oacute;", "&Ocirc;", "&Otilde;", "&Ouml;", "&times;", "&Oslash;", "&Ugrave;", "&Uacute;", "&Ucirc;", "&Uuml;", "&Yacute;", "&THORN;", "&szlig;", "&agrave;", "&aacute;", "&acirc;", "&atilde;", "&auml;", "&aring;", "&aelig;", "&ccedil;", "&egrave;", "&eacute;", "&ecirc;", "&euml;", "&igrave;", "&iacute;", "&icirc;", "&iuml;", "&eth;", "&ntilde;", "&ograve;", "&oacute;", "&ocirc;", "&otilde;", "&ouml;", "&divide;", "&oslash;", "&ugrave;", "&uacute;", "&ucirc;", "&uuml;", "&yacute;", "&thorn;", "&yuml;", "&quot;", "&amp;", "&lt;", "&gt;", "&OElig;", "&oelig;", "&Scaron;", "&scaron;", "&Yuml;", "&circ;", "&tilde;", "&ensp;", "&emsp;", "&thinsp;", "&zwnj;", "&zwj;", "&lrm;", "&rlm;", "&ndash;", "&mdash;", "&lsquo;", "&rsquo;", "&sbquo;", "&ldquo;", "&rdquo;", "&bdquo;", "&dagger;", "&Dagger;", "&permil;", "&lsaquo;", "&rsaquo;", "&euro;", "&fnof;", "&Alpha;", "&Beta;", "&Gamma;", "&Delta;", "&Epsilon;", "&Zeta;", "&Eta;", "&Theta;", "&Iota;", "&Kappa;", "&Lambda;", "&Mu;", "&Nu;", "&Xi;", "&Omicron;", "&Pi;", "&Rho;", "&Sigma;", "&Tau;", "&Upsilon;", "&Phi;", "&Chi;", "&Psi;", "&Omega;", "&alpha;", "&beta;", "&gamma;", "&delta;", "&epsilon;", "&zeta;", "&eta;", "&theta;", "&iota;", "&kappa;", "&lambda;", "&mu;", "&nu;", "&xi;", "&omicron;", "&pi;", "&rho;", "&sigmaf;", "&sigma;", "&tau;", "&upsilon;", "&phi;", "&chi;", "&psi;", "&omega;", "&thetasym;", "&upsih;", "&piv;", "&bull;", "&hellip;", "&prime;", "&Prime;", "&oline;", "&frasl;", "&weierp;", "&image;", "&real;", "&trade;", "&alefsym;", "&larr;", "&uarr;", "&rarr;", "&darr;", "&harr;", "&crarr;", "&lArr;", "&uArr;", "&rArr;", "&dArr;", "&hArr;", "&forall;", "&part;", "&exist;", "&empty;", "&nabla;", "&isin;", "&notin;", "&ni;", "&prod;", "&sum;", "&minus;", "&lowast;", "&radic;", "&prop;", "&infin;", "&ang;", "&and;", "&or;", "&cap;", "&cup;", "&int;", "&there4;", "&sim;", "&cong;", "&asymp;", "&ne;", "&equiv;", "&le;", "&ge;", "&sub;", "&sup;", "&nsub;", "&sube;", "&supe;", "&oplus;", "&otimes;", "&perp;", "&sdot;", "&lceil;", "&rceil;", "&lfloor;", "&rfloor;", "&lang;", "&rang;", "&loz;", "&spades;", "&clubs;", "&hearts;", "&diams;"],
      ["&#160;", "&#161;", "&#162;", "&#163;", "&#164;", "&#165;", "&#166;", "&#167;", "&#168;", "&#169;", "&#170;", "&#171;", "&#172;", "&#173;", "&#174;", "&#175;", "&#176;", "&#177;", "&#178;", "&#179;", "&#180;", "&#181;", "&#182;", "&#183;", "&#184;", "&#185;", "&#186;", "&#187;", "&#188;", "&#189;", "&#190;", "&#191;", "&#192;", "&#193;", "&#194;", "&#195;", "&#196;", "&#197;", "&#198;", "&#199;", "&#200;", "&#201;", "&#202;", "&#203;", "&#204;", "&#205;", "&#206;", "&#207;", "&#208;", "&#209;", "&#210;", "&#211;", "&#212;", "&#213;", "&#214;", "&#215;", "&#216;", "&#217;", "&#218;", "&#219;", "&#220;", "&#221;", "&#222;", "&#223;", "&#224;", "&#225;", "&#226;", "&#227;", "&#228;", "&#229;", "&#230;", "&#231;", "&#232;", "&#233;", "&#234;", "&#235;", "&#236;", "&#237;", "&#238;", "&#239;", "&#240;", "&#241;", "&#242;", "&#243;", "&#244;", "&#245;", "&#246;", "&#247;", "&#248;", "&#249;", "&#250;", "&#251;", "&#252;", "&#253;", "&#254;", "&#255;", "&#34;", "&#38;", "&#60;", "&#62;", "&#338;", "&#339;", "&#352;", "&#353;", "&#376;", "&#710;", "&#732;", "&#8194;", "&#8195;", "&#8201;", "&#8204;", "&#8205;", "&#8206;", "&#8207;", "&#8211;", "&#8212;", "&#8216;", "&#8217;", "&#8218;", "&#8220;", "&#8221;", "&#8222;", "&#8224;", "&#8225;", "&#8240;", "&#8249;", "&#8250;", "&#8364;", "&#402;", "&#913;", "&#914;", "&#915;", "&#916;", "&#917;", "&#918;", "&#919;", "&#920;", "&#921;", "&#922;", "&#923;", "&#924;", "&#925;", "&#926;", "&#927;", "&#928;", "&#929;", "&#931;", "&#932;", "&#933;", "&#934;", "&#935;", "&#936;", "&#937;", "&#945;", "&#946;", "&#947;", "&#948;", "&#949;", "&#950;", "&#951;", "&#952;", "&#953;", "&#954;", "&#955;", "&#956;", "&#957;", "&#958;", "&#959;", "&#960;", "&#961;", "&#962;", "&#963;", "&#964;", "&#965;", "&#966;", "&#967;", "&#968;", "&#969;", "&#977;", "&#978;", "&#982;", "&#8226;", "&#8230;", "&#8242;", "&#8243;", "&#8254;", "&#8260;", "&#8472;", "&#8465;", "&#8476;", "&#8482;", "&#8501;", "&#8592;", "&#8593;", "&#8594;", "&#8595;", "&#8596;", "&#8629;", "&#8656;", "&#8657;", "&#8658;", "&#8659;", "&#8660;", "&#8704;", "&#8706;", "&#8707;", "&#8709;", "&#8711;", "&#8712;", "&#8713;", "&#8715;", "&#8719;", "&#8721;", "&#8722;", "&#8727;", "&#8730;", "&#8733;", "&#8734;", "&#8736;", "&#8743;", "&#8744;", "&#8745;", "&#8746;", "&#8747;", "&#8756;", "&#8764;", "&#8773;", "&#8776;", "&#8800;", "&#8801;", "&#8804;", "&#8805;", "&#8834;", "&#8835;", "&#8836;", "&#8838;", "&#8839;", "&#8853;", "&#8855;", "&#8869;", "&#8901;", "&#8968;", "&#8969;", "&#8970;", "&#8971;", "&#9001;", "&#9002;", "&#9674;", "&#9824;", "&#9827;", "&#9829;", "&#9830;"]
    ];
    ytcenter.utils.escapeXML = function(str){
      return ytcenter.utils.replaceArray(str, ["<", ">", "&", "\"", "'"], ["&lt;", "&gt;", "&amp;", "&quot;", "&apos;"]);
    };
    ytcenter.utils.unescapeXML = function(str){
      return ytcenter.utils.replaceArray(str, ["&lt;", "&gt;", "&amp;", "&quot;", "&apos;"], ["<", ">", "&", "\"", "'"]);
    };
    ytcenter.utils.escapeHTML = function(str){
      if (str === "") return "";
      var i, a = "";
      for (i = 0; i < str.length; i++) {
        switch (str[i]) {
          case "<":
            a += "&lt;";
            break;
          case ">":
            a += "&gt;";
            break;
          case "&":
            a += "&amp;";
            break;
          case "\"":
            a += "&quot;";
            break;
          case "'":
            a += "&apos;";
            break;
          default:
            if (str[i] < " " || str[i] > "~")
              a += "&#" + (str.charCodeAt(i)) + ";";
            else
              a += str[i];
            break;
        }
        if (str[i] === "<") {
          a += "&lt;";
        }
      }
      return a;
    };
    ytcenter.utils.unescapeHTML = function(str){
      if (typeof str !== "string" || str === "") return "";
      str = ytcenter.utils.replaceArray(str, ytcenter.utils._escape_html_entities[0], ytcenter.utils._escape_html_entities[1]);
      var i, a = str.match(/&#[0-9]{1,5};/g), b, c;
      if (!a) return str;
      for (i = 0; i < a.length; i++) {
        b = a[i];
        c = b.substring(2, b.length - 1);
        if (c > -32769 && c < 65536) {
          str = str.replace(b, String.fromCharCode(c));
        } else {
          str = str.replace(b, "");
        }
      }
      return str;
    };
    ytcenter.utils.replaceArray = function(str, find, replace){
      var i;
      if (find.length !== replace.length) throw "The find & replace array doesn't have the same length!";
      for (i = 0; i < find.length; i++) {
        str = str.replace(new RegExp(find[i], "g"), replace[i]);
      }
      return str;
    };
    ytcenter.utils.number1000Formating = function(num){
      var i, j = 0, r = [], tmp = "";
      num = num + "";
      for (i = num.length - 1; i >= 0; i--) {
        tmp = num[i] + tmp;
        if (tmp.length === 3) {
          r.unshift(tmp);
          tmp = "";
        }
      }
      if (tmp !== "") r.unshift(tmp);
      return r.join(",");
    };
    ytcenter.utils.xhr = function(details){
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
          statusText: (xmlhttp.readyState == 4 ? xmlhttp.statusText : '')
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
    };
    ytcenter.utils.getScrollOffset = function(){
      var top = Math.max(document.body.scrollTop, document.documentElement.scrollTop);
      var left = Math.max(document.body.scrollLeft, document.documentElement.scrollLeft);
      return {top:top,left:left};
    };
    ytcenter.utils.addEventListener = (function(){
      var listeners = [];
      ytcenter.unload(function(){
        var i;
        for (i = 0; i < listeners.length; i++) {
          if (listeners[i].elm.removeEventListener) {
            listeners[i].elm.removeEventListener(listeners[i].event, listeners[i].callback, listeners[i].useCapture);
          }
        }
        listeners = [];
      });
      ytcenter.utils.removeEventListener = function(elm, event, callback, useCapture){
        var i;
        if (elm.removeEventListener) {
          elm.removeEventListener(event, callback, useCapture || false);
        }
        for (i = 0; i < listeners.length; i++) {
          if (listeners[i].elm === elm && listeners[i].event === event && listeners[i].callback === callback && listeners[i].useCapture === useCapture) {
            listeners.splice(i, 1);
            break;
          }
        }
      };
      return function(elm, event, callback, useCapture){
        listeners.push({elm: elm, event: event, callback: callback, useCapture: useCapture});
        if (elm.addEventListener) {
          elm.addEventListener(event, callback, useCapture || false);
        } else if (elm.attachEvent) {
          elm.attachEvent("on" + event, callback);
        }
      };
    })();
    ytcenter.utils.getRGB = function(h, s, v){
      h = h/360 * 6;
      s = s/100;
      v = v/100;

      var i = Math.floor(h),
          f = h - i,
          p = v * (1 - s),
          q = v * (1 - f * s),
          t = v * (1 - (1 - f) * s),
          mod = i % 6,
          r = [v, q, p, p, t, v][mod],
          g = [t, v, v, q, p, p][mod],
          b = [p, p, t, v, v, q][mod];

      return {red: r * 255, green: g * 255, blue: b * 255};
    };
    ytcenter.utils.getHSV = function(r, g, b) {
      var max = Math.max(r, g, b), min = Math.min(r, g, b);
      var h, s, v = max;

      var d = max - min;
      s = max === 0 ? 0 : d / max;

      if (max == min) {
        h = 0;
      } else {
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
      }
      return {hue: h*360, saturation: s*100, value: v/255*100};
    };
    ytcenter.utils.hsvToHex = function(hue, sat, val){
      var rgb = ytcenter.utils.getRGB(hue, sat, val);
      return ytcenter.utils.colorToHex(rgb.red, rgb.green, rgb.blue);
    };
    ytcenter.utils.colorToHex = function(red, green, blue){
      red = Math.round(red);
      green = Math.round(green);
      blue = Math.round(blue);
      if (red > 255) red = 255;
      if (red < 0) red = 0;
      if (green > 255) green = 255;
      if (green < 0) green = 0;
      if (blue > 255) blue = 255;
      if (blue < 0) blue = 0;
      var r = red.toString(16);
      if (r.length === 1) r = "0" + r;
      var g = green.toString(16);
      if (g.length === 1) g = "0" + g;
      var b = blue.toString(16);
      if (b.length === 1) b = "0" + b;
      r = r.toUpperCase();
      g = g.toUpperCase();
      b = b.toUpperCase();
      return "#" + r + g + b;
    };
    ytcenter.utils.hexToColor = function(hex){
      if (hex.indexOf("#") === 0) hex = hex.substring(1);
      var r,g,b;
      if (hex.length === 6) {
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
      } else if (hex.length === 3) {
        r = parseInt(hex.substring(0, 1) + hex.substring(0, 1), 16);
        g = parseInt(hex.substring(1, 2) + hex.substring(1, 2), 16);
        b = parseInt(hex.substring(2, 3) + hex.substring(2, 3), 16);
      } else {
        r = 0;
        g = 0;
        b = 0;
      }
      return {red: r, green: g, blue: b};
    };
    ytcenter.utils.setKeyword = function(keywords, key, value){
      var a = keywords.split(",");
      for (var i = 0; i < a.length; i++) {
        if (a[i].split("=")[0] === "key") {
          if (typeof value === "string") {
            a[i] = key + "=" + value;
          } else {
            a[i] = key;
          }
          return a.join(",");
        }
      }
      if (typeof value === "string") {
        a.push(key + "=" + value);
      } else {
        a.push(key);
      }
      return a.join(",");
    };
    ytcenter.utils.updateSignatureDecipher = function(){
      var js = (loc.href.indexOf("https") === 0 ? "https:" : "http:") + ytcenter.player.config.assets.js,
          regex = /function [a-zA-Z$0-9]+\(a\){a=a\.split\(""\);(.*?)return a\.join\(""\)}/g,
          regex2 = /function [a-zA-Z$0-9]+\(a\){a=a\.split\(""\);(((a=([a-zA-Z$0-9]+)\(a,([0-9]+)\);)|(a=a\.slice\([0-9]+\);)|(a=a\.reverse\(\);)|(var b=a\[0\];a\[0\]=a\[[0-9]+%a\.length\];a\[[0-9]+\]=b;)))*return a\.join\(""\)}/g;
        con.log("[updateSignatureDecipher] Contacting " + js);
        $XMLHTTPRequest({
          method: "GET",
          url: js,
          onload: function(response) {
            var a,i,b,v;
            
            con.log("[updateSignatureDecipher] Retrieved response...");
            con.log("[updateSignatureDecipher] Testing regex 1: " + !!response.responseText.match(regex));
            con.log("[updateSignatureDecipher] Testing regex 2: " + !!response.responseText.match(regex2));
            
            if (response.responseText.match(regex2)) {
              con.log("[updateSignatureDecipher] Using regex 1");
              a = regex2.exec(response.responseText)[0].split("{")[1].split("}")[0].split(";");
              ytcenter.settings['signatureDecipher'] = []; // Clearing signatureDecipher
              for (i = 1; i < a.length-1; i++) {
                b = a[i];
                if (b.indexOf("a.slice") !== -1) { // Slice
                  con.log("Slice/Clone (" + b + ")");
                  v = b.split("(")[1].split(")")[0];
                  con.log("=> " + v);
                  ytcenter.settings['signatureDecipher'].push({func: "slice", value: parseInt(v)});
                } else if (b.indexOf("a.reverse") !== -1) { // Reverse
                  con.log("Reverse (" + b + ")");
                  ytcenter.settings['signatureDecipher'].push({func: "reverse", value: null});
                } else if ((a[i] + ";" + a[i+1] + ";" + a[i+2]).indexOf("var b=a[0];a[0]=a[") !== -1){ // swapHeadAndPosition
                  con.log("swapHeadAndPosition (" + (a[i] + ";" + a[i+1] + ";" + a[i+2]) + ")");
                  v = (a[i] + ";" + a[i+1] + ";" + a[i+2]).split("var b=a[0];a[0]=a[")[1].split("%")[0];
                  con.log("=> " + v);
                  ytcenter.settings['signatureDecipher'].push({func: "swapHeadAndPosition", value: parseInt(v)});
                  i = i+2;
                } else { // swapHeadAndPosition (maybe it's deprecated by YouTube)
                  con.log("swapHeadAndPosition (" + b + ")");
                  v = b.split("(a,")[1].split(")")[0];
                  con.log("=> " + v);
                  ytcenter.settings['signatureDecipher'].push({func: "swapHeadAndPosition", value: parseInt(v)});
                }
              }
            } else if (response.responseText.match(regex)) {
              con.log("[updateSignatureDecipher] Using regex 2");
              a = regex.exec(response.responseText)[1];
              ytcenter.settings['signatureDecipher'] = []; // Clearing signatureDecoder
              ytcenter.settings['signatureDecipher'].push({func: "code", value: a});
            } else {
              con.error("[updateSignatureDecipher] Couldn't retrieve the signatureDecipher!");
            }
            ytcenter.events.performEvent("ui-refresh");
            ytcenter.saveSettings();
          },
          onerror: function() {
            con.error("[SignatureDecipher] Couldn't download data!");
          }
        });
    };
    ytcenter.utils.signatureDecipher = function(signatureCipher, decipherRecipe){
      function swapHeadAndPosition(array, position) {
        var head = array[0];
        var other = array[position % array.length];
        array[0] = other;
        array[position] = head;
        return array;
      }
      if (!signatureCipher) return "";
      var cipherArray = signatureCipher.split(""), i;
      decipherRecipe = decipherRecipe || ytcenter.settings['signatureDecipher'];
      
      for (i = 0; i < decipherRecipe.length; i++) {
        if (decipherRecipe[i].func === "code") {
          cipherArray = new Function("a", decipherRecipe[i].value + "return a.join(\"\")")(cipherArray);
        } else if (decipherRecipe[i].func === "swapHeadAndPosition") {
          cipherArray = swapHeadAndPosition(cipherArray, decipherRecipe[i].value);
        } else if (decipherRecipe[i].func === "slice") {
          cipherArray = cipherArray.slice(decipherRecipe[i].value);
        } else if (decipherRecipe[i].func === "reverse") {
          cipherArray = cipherArray.reverse();
        }
      }
      if (!ytcenter.utils.isArray(cipherArray)) return signatureCipher;
      return cipherArray.join("");
    };
    ytcenter.utils.crypt_h = void 0;
    ytcenter.utils.crypt_l = !0;
    ytcenter.utils.crypt_p = !1;
    ytcenter.utils.crypt_Ej = ytcenter.utils.crypt_h;
    ytcenter.utils.crypt = function(){
      try {
        var a;
        try {
          if (ytcenter.utils.crypt_Ej == ytcenter.utils.crypt_h && (ytcenter.utils.crypt_Ej = ytcenter.utils.crypt_p, window.crypto && window.crypto.wx)) {
            try {
                a = new Uint8Array(1), window.crypto.wx(a), ytcenter.utils.crypt_Ej = ytcenter.utils.crypt_l
            } catch (b) {
            }
          }
        } catch (e) {
          con.error(e);
        }
        if (ytcenter.utils.crypt_Ej) {
            a = Array(16);
            var c = new Uint8Array(16);
            window.crypto.getRandomValues(c);
            for (var d = 0; d < a.length; d++)
                a[d] = c[d]
        } else {
            a = Array(16);
            for (c = 0; 16 > c; c++) {
                for (var d = ytcenter.utils.now(), f = 0; f < d % 23; f++)
                    a[c] = Math.random();
                a[c] = Math.floor(64 * Math.random())
            }
        }
        c = [];
        for (d = 0; d < a.length; d++)
            c.push("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_"[a[d] & 63]);
        return c.join("");
      } catch (e) {
        con.error(e);
      }
    };
    ytcenter.utils.calculateDimensions = function(width, height, player_ratio){
      player_ratio = player_ratio || 16/9;
      var calcWidth, calcHeight;
      var widthType, heightType;
      if (width.indexOf("%") !== -1 && width.match(/%$/)) {
        widthType = "%";
      } else {
        widthType = "px";
      }
      if (height.indexOf("%") !== -1 && height.match(/%$/)) {
        heightType = "%";
      } else {
        heightType = "px";
      }
      
      if (widthType === "px") {
        calcWidth = parseInt(width);
      } else {
        calcWidth = width;
      }
      if (heightType === "px") {
        calcHeight = parseInt(height);
      } else {
        calcHeight = height;
      }
      if (widthType === "px" && heightType === "px") {
        if (!isNaN(parseInt(width)) && isNaN(parseInt(height))) {
          calcHeight = Math.round(calcWidth/player_ratio);
        } else if (isNaN(parseInt(width)) && !isNaN(parseInt(height))) {
          calcWidth = Math.round(calcHeight*player_ratio);
        }
      }
      return [calcWidth, calcHeight];
    };
    ytcenter.utils.bind = function(a, b){
      return a.call.apply(a.bind, arguments);
    };
    ytcenter.utils.query = function(key){
      if (ytcenter.location.search.indexOf("?") === 0) {
        var a = ytcenter.location.search.substring(1).split("&");
        for (var i = 0; i < a.length; i++) {
          if (decodeURIComponent(a[i].split("=")[0]) === key) {
            return decodeURIComponent(a[i].split("=")[1]);
          }
        }
      }
    };
    ytcenter.utils.now = Date.now || function () {
      return +new Date;
    };
    ytcenter.utils.setCookie = function(name, value, domain, path, expires){
      domain = domain ? ";domain=" + domain : "";
      path = path ? ";path=" + path : "";
      expires = 0 > expires ? "" : 0 == expires ? ";expires=" + (new Date(1970, 1, 1)).toUTCString() : ";expires=" + (new Date(ytcenter.utils.now() + 1E3 * expires)).toUTCString();
      
      document.cookie = name + "=" + value + domain + path + expires;
    };
    ytcenter.utils.getCookie = function(key){
      return ytcenter.utils.getCookies()[key];
    };
    ytcenter.utils.getCookies = function(){
      function trimLeft(obj){
        return obj.replace(/^\s+/, "");
      }
      function trimRight(obj){
        return obj.replace(/\s+$/, "");
      }
      function map(obj, callback, thisArg) {
        for (var i = 0, n = obj.length, a = []; i < n; i++) {
            if (i in obj) a[i] = callback.call(thisArg, obj[i]);
        }
        return a;
      }
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
              var name = $0,
                  value = $1.charAt(0) === '"'
                            ? $1.substr(1, -1).replace(/\\(.)/g, "$1")
                            : $1;
              cookies[name] = value;
          });
      }
      return cookies;
    };
    ytcenter.utils.assignId = (function(){
      var ___count = -1;
      return function(prefix) {
        ___count++;
        var timestamp = (new Date()).getTime();
        return (prefix ? prefix : "") + ___count + (timestamp);
      };
    })();
    ytcenter.utils.inArrayIndex = function(a, v){
      for (var i = 0; i < a.length; i++) {
        if (a[i] === v) return i;
      }
      return -1;
    };
    ytcenter.utils.inArray = function(a, v){
      for (var i = 0; i < a.length; i++) {
        if (a[i] === v) return true;
      }
      return false;
    };
    ytcenter.utils.decodeURIArguments = function(uri){
      var a = {};
      ytcenter.utils.each(uri.split("&"), function(i, item){
        var key = decodeURIComponent(item.split("=")[0]);
        var value = decodeURIComponent(item.split("=")[1]);
        a[key] = value;
      });
      return a;
    };
    ytcenter.utils.call = function(func, args){
      var a = "";
      ytcenter.utils.each(args, function(i){
        if (i > 0) a += ", ";
        a += "b[" + i + "]";
      });
      return new Function("a", "return a(" + a + ")")(func);
    };
    ytcenter.utils.randomString = function(str, len) {
      var buff = "";
      for (var i = 0; i < len; i++) {
        buff += str[Math.floor(Math.random()*len)];
      }
      
      return buff;
    };
    ytcenter.utils.insertAfter = function(elm, after){
      if (typeof after.parentNode === "undefined") return;
      
      if (typeof elm.parentNode !== "undefined") elm.parentNode.removeChild(elm);
      if (after.parentNode.lastChild === after) {
        after.parentNode.appendChild(elm);
      } else {
        after.parentNode.insertBefore(elm, after.nextSibling);
      }
    };
    ytcenter.utils.hasChild = function(parent, elm){
      var c = parent.children;
      
      for (var i = 0; i < c.length; i++) {
        if (c[i] === elm) return true;
        if (ytcenter.utils.hasChild(c[i], elm)) return true;
      }
      
      return false;
    };
    ytcenter.utils.toParent = function(elm, className){
      while (elm !== document.body && typeof elm !== "undefined") {
        if (ytcenter.utils.hasClass(elm, className)) return elm;
        elm = elm.parentNode;
      }
    };
    ytcenter.utils.isArray = function(arr){
      return Object.prototype.toString.call(arr) === "[object Array]";
    };
    ytcenter.utils.each = function(obj, callback){
      if (ytcenter.utils.isArray(obj)) {
        for (var i = 0; i < obj.length; i++) {
          if (callback(i, obj[i]) === true) break;
        }
      } else {
        for (var key in obj) {
          if (obj.hasOwnProperty(key)) {
            if (callback(key, obj[key]) === true) break;
          }
        }
      }
    };
    ytcenter.utils.mergeArrays = function(){
      if (arguments.length <= 0) return [];
      if (arguments.length === 1) return arguments[0];
      var arr = [], i, j;
      for (i = 0; i < arguments.length; i++) {
        if (typeof arguments[i] === "undefined") continue;
        for (j = 0; j < arguments[i].length; j++) {
          arr.push(arguments[i][j]);
        }
      }
      return arr;
    }
    ytcenter.utils.mergeObjects = function(){
      if (arguments.length <= 0) return {};
      if (arguments.length === 1) return arguments[0];
      var _o = arguments[0];
      for (var i = 1; i < arguments.length; i++) {
        if (typeof arguments[i] === "undefined") continue;
        ytcenter.utils.each(arguments[i], function(key, value){
          var type = Object.prototype.toString.call(value);
          if (_o[key] && (type === "[object Array]" || type === "[object Object]")) {
            _o[key] = ytcenter.utils.mergeObjects(_o[key], value);
          } else {
            _o[key] = value;
          }
        });
      }
      return _o;
    };
    ytcenter.utils.cleanClasses = function(elm){
      if (typeof elm === "undefined" || typeof elm.className === "undefined") return;
      var classNames = elm.className.split(" "),
          i, _new = [];
      for (i = 0; i < classNames.length; i++) {
        if (classNames[i] !== "" && !ytcenter.utils.inArray(_new, classNames[i])) {
          _new.push(classNames[i]);
        }
      }
      elm.className = _new.join(" ");
    };
    ytcenter.utils.hasClass = function(elm, className){
      if (typeof elm === "undefined" || typeof elm.className === "undefined") return;
      var classNames = elm.className.split(" "),
          i;
      for (i = 0; i < classNames.length; i++) {
        if (classNames[i] === className) return true;
      }
      return false;
    };
    ytcenter.utils.toggleClass = function(elm, className){
      if (typeof elm === "undefined" || typeof elm.className === "undefined") return;
      if (ytcenter.utils.hasClass(elm, className)) {
        ytcenter.utils.removeClass(elm, className);
      } else {
        ytcenter.utils.addClass(elm, className);
      }
    };
    ytcenter.utils.addClass = function(elm, className){
      if (typeof elm === "undefined" || typeof elm.className === "undefined") return;
      var classNames = elm.className.split(" "),
          addClassNames = className.split(" "),
          _new = [],
          i, j, found;
      for (i = 0; i < addClassNames.length; i++) {
        found = false;
        for (j = 0; j < classNames.length; j++) {
          if (addClassNames[i] === classNames[j]) {
            found = true;
            break;
          }
        }
        if (!found) {
          _new.push(addClassNames[i]);
        }
      }
      elm.className += " " + _new.join(" ");
      ytcenter.utils.cleanClasses(elm);
    };
    ytcenter.utils.removeClass = function(elm, className){
      if (typeof elm === "undefined" || typeof elm.className === "undefined") return;
      var classNames = elm.className.split(" "),
          remClassNames = className.split(" "),
          _new = [],
          i, j, found;
      for (var i = 0; i < classNames.length; i++) {
        if (classNames[i] === "") continue;
        found = false;
        for (j = 0; j < remClassNames.length; j++) {
          if (classNames[i] === remClassNames[j]) {
            found = true;
            break;
          }
        }
        if (!found) {
          _new.push(classNames[i]);
        }
      }
      elm.className = _new.join(" ");
    };
    ytcenter.utils.getOffset = function(elm, toElement){
      var _x = 0;
      var _y = 0;
      while(elm && elm !== toElement && !isNaN(elm.offsetLeft) && !isNaN(elm.offsetTop)) {
        _x += elm.offsetLeft - elm.scrollLeft;
        _y += elm.offsetTop - elm.scrollTop;
        elm = elm.offsetParent;
      }
      return { top: _y, left: _x };
    };
    ytcenter.utils.getOffScreenX = function(elm, border){
      border = border || 0;
      if (ytcenter.utils.getOffset(elm).left - border < 0) {
        return ytcenter.utils.getOffset(elm).left + border;
      } else if (ytcenter.utils.getOffset(elm).left + elm.offsetWidth + border > window.innerWidth) {
        return ytcenter.utils.getOffset(elm).left + elm.offsetWidth + border - window.innerWidth;
      } else {
        return 0;
      }
    };
    ytcenter.utils.getOffScreenY = function(elm, border){
      border = border || 0;
      if (ytcenter.utils.getOffset(elm).top + border < 0) {
        return ytcenter.utils.getOffset(elm).top - border;
      } else if (ytcenter.utils.getOffset(elm).top + elm.offsetWidth > window.innerWidth - border) {
        return ytcenter.utils.getOffset(elm).top + elm.offsetWidth + border - window.innerWidth;
      } else {
        return 0;
      }
    };
    ytcenter.utils.addCSS = function(styles){
      if (typeof GM_addStyle !== "undefined") {
        GM_addStyle(styles);
      } else {
        var oStyle = document.createElement("style");
        oStyle.setAttribute("type", "text\/css");
        oStyle.appendChild(document.createTextNode(styles));
        if (document && document.head) {
          document.head.appendChild(oStyle);
        } else if (document) {
          document.appendChild(oStyle);
        } else {
          con.error("[Add Style] Couldn't find document!");
        }
      }
    };
    ytcenter.utils.createElement = function(tagname, options){
      options = options || {};
      var elm = document.createElement(tagname);
      ytcenter.utils.each(options, function(key, value){
        if (key === "style" && typeof value === "object") {
          ytcenter.utils.each(value, function(_key, _value){
            elm.style[_key] = _value;
          });
        } else if (key === "listeners" && typeof value === "object") {
          ytcenter.utils.each(value, function(_key, _value){
            if (ytcenter.utils.isArray(_value)) {
              ytcenter.utils.each(_value, function(i, __value){
                ytcenter.utils.addEventListener(elm, _key, __value, false);
              });
            } else {
              ytcenter.utils.addEventListener(elm, _key, _value, false);
            }
          });
        } else {
          elm.setAttribute(key, value);
        }
      });
      
      return elm;
    };
    ytcenter.utils.inArray = function(arr, value){
      var i;
      for (i = 0; i < arr.length; i++) {
        if (arr[i] === value) return true;
      }
      return false;
    };
    ytcenter.utils.objectKeys = function(obj){
      if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
        con.error("ytcenter.utils.objectKeys called on non-object");
      }
      var result = [], key, i;
      for (key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          result.push(key);
        }
      }
      
      if (!({toString: null}).propertyIsEnumerable('toString')) {
        var dontEnums = [
          'toString',
          'toLocaleString',
          'valueOf',
          'hasOwnProperty',
          'isPrototypeOf',
          'propertyIsEnumerable',
          'constructor'
        ],
        dontEnumsLength = dontEnums.length;
        for (i = 0; i < dontEnumsLength; i++) {
          if (Object.prototype.hasOwnProperty.call(obj, dontEnums[i])) {
            result.push(dontEnums[i]);
          }
        }
      }
      return result;
    };
    ytcenter.utils.extend = function(what, wit) {
      var extObj, witKeys = Object.keys(wit);
      
      extObj = ytcenter.utils.objectKeys(what).length ? ytcenter.utils.clone(what) : {};
      
      witKeys.forEach(function(key) {
        Object.defineProperty(extObj, key, Object.getOwnPropertyDescriptor(wit, key));
      });
      
      return extObj;
    }
    ytcenter.utils.jsonClone = function(obj){
      return JSON.parse(JSON.stringify(obj));
    };
    ytcenter.utils.clone = function(obj){
      return ytcenter.utils.extend({}, obj);
    };
    ytcenter.getMutationObserver = function(){
      var a;
      try {
        a = MutationObserver || uw.MutationObserver || WebKitMutationObserver || uw.WebKitMutationObserver || MozMutationObserver || uw.MozMutationObserver;
      } catch (e) {
        try {
          a = uw.MutationObserver || WebKitMutationObserver || uw.WebKitMutationObserver || MozMutationObserver || uw.MozMutationObserver;
        } catch (e) {
          try {
            a = WebKitMutationObserver || uw.WebKitMutationObserver || MozMutationObserver || uw.MozMutationObserver;
          } catch (e) {
            try {
              a = uw.WebKitMutationObserver || MozMutationObserver || uw.MozMutationObserver;
            } catch (e) {
              try {
                a = MozMutationObserver || uw.MozMutationObserver;
              } catch (e) {
                a = uw.MozMutationObserver;
              }
            }
          }
        }
      }
      return a;
    };
    ytcenter.guide = {
      element: null,
      observer: null,
      hidden: false,
      top: null,
      left: null,
      update: function() {
        if (ytcenter.settings['experimentalFeatureTopGuide']) return;
        var guideContainer = document.getElementById("guide-container");
        if (guideContainer) {
          if (loc.pathname === "/watch") {
            if (!ytcenter.guide.hidden) {
              ytcenter.utils.removeClass(guideContainer, "hid");
              if (ytcenter.guide.top !== null) {
                guideContainer.style.setProperty("top", ytcenter.guide.top + "px", "important");
              } else {
                guideContainer.style.setProperty("top", "");
              }
              if (ytcenter.guide.left !== null) {
                guideContainer.style.setProperty("left", ytcenter.guide.left + "px", "important");
              } else {
                guideContainer.style.setProperty("left", "");
              }
            } else {
              ytcenter.utils.addClass(guideContainer, "hid");
            }
          } else {
            ytcenter.utils.removeClass(guideContainer, "hid");
            guideContainer.style.setProperty("left", "");
            guideContainer.style.setProperty("top", "");
          }
        }
      },
      checkMutations: function(mutations) {
        mutations.forEach(function(mutation) {
          var addedNodes = mutation.addedNodes,
              addedNode;
          for (var i = 0; i < addedNodes.length; i++) {
            addedNode = addedNodes[i];
            if (addedNode.id === "guide-container") {
              ytcenter.guide.update();
              break;
            }
          }
        });
      },
      setup: function() {
        if (ytcenter.settings['experimentalFeatureTopGuide']) return;
        if (ytcenter.guide.element === null || ytcenter.guide.element.id !== "guide") {
          ytcenter.guide.element = document.getElementById("guide");
          ytcenter.guide.update();
        }
        if (ytcenter.guide.observer) {
          ytcenter.guide.observer.disconnect();
          ytcenter.guide.observer = null;
        }
        if (ytcenter.guide.element) {
          ytcenter.guide.observer = ytcenter.mutation.observe(ytcenter.guide.element, { childList: true }, ytcenter.guide.checkMutations);
        }
      }
    };
    con.log("Initializing Placement System");
    ytcenter.placementsystem = (function(){
      function setParentData(elm, parent) {
        var new_sandbox,
            applyParentData;
        new_sandbox = (function(){
          for (var i = 0; i < sandboxes.length; i++) {
            if (sandboxes[i].id == parent) {
              return sandboxes[i];
            }
          }
          return null;
        })();
        applyParentData = function(e){
          var nElm = [];
          var oElm = [];
          for (var i = 0; i < old_sandboxes.length; i++) {
            if (old_sandboxes[i][0] == e) {
              oElm = old_sandboxes[i][1];
            }
          }
          
          for (var i = 0; i < oElm.length; i++) {
            if (oElm[i].style) {
              for (var key in oElm[i].style) {
                if (oElm[i].style.hasOwnProperty(key)) {
                  e.style[key] = "";
                }
              }
            }
            if (oElm[i].classNames) {
              for (var j = 0; j < oElm[i].classNames.length; j++) {
                ytcenter.utils.removeClass(e, oElm[i].classNames[j]);
              }
            }
          }
          
          for (var i = 0; i < new_sandbox.elements.length; i++) {
            if (new_sandbox.elements[i].tagname.toLowerCase() === e.nodeName.toLowerCase()) {
              if (!new_sandbox.elements[i].condition || (new_sandbox.elements[i].condition && new_sandbox.elements[i].condition(elm, e, parent))) {
                nElm.push(new_sandbox.elements[i]);
              }
            }
          }
          for (var i = 0; i < nElm.length; i++) {
            if (nElm[i].style) {
              for (var key in nElm[i].style) {
                if (nElm[i].style.hasOwnProperty(key)) {
                  e.style[key] = nElm[i].style[key];
                }
              }
            }
            if (nElm[i].classNames) {
              for (var j = 0; j < nElm[i].classNames.length; j++) {
                ytcenter.utils.addClass(e, nElm[i].classNames[j]);
              }
            }
          }
          var found = false;
          for (var i = 0; i < old_sandboxes.length; i++) {
            if (old_sandboxes[i][0] == e) {
              old_sandboxes[i][1] = nElm;
              found = true;
              break;
            }
          }
          if (!found) {
            old_sandboxes.push([e, nElm]);
          }
          
          for (var i = 0; i < e.children.length; i++) {
            applyParentData(e.children[i]);
          }
        };
        applyParentData(elm);
      }
      function buttonInSettings(sig){
        var bp = settings;
        for (var key in bp) {
          if (bp.hasOwnProperty(key)) {
            for (var i = 0; i < bp[key].length; i++) {
              if (sig === bp[key][i]) {
                return true;
              }
            }
          }
        }
        return false;
      }
      function updateList() {
        var bp = settings;
        for (var key in bp) {
          if (bp.hasOwnProperty(key)) {
            for (var i = 0; i < bp[key].length; i++) {
              if (!buttonInSettings(bp[key][i])) {
                if (!settings[key]) {
                  settings[key] = [];
                }
                settings[key].push(bp[key][i]);
              }
            }
          }
        }
        ytcenter.saveSettings();
      }
      function putItem(a) {
        var i;
        for (i = 0; i < database.length; i++) {
          if (a[1] === database[i][1] && a !== database[i]) {
            if (database[i][0] && database[i][0].parentNode) database[i][0].parentNode.removeChild(database[i][0]);
            database[i] = a;
            return;
          }
        }
        database.push(a);
      }
      var database = [],
          __api,
          sandboxes = [],
          old_sandboxes = [],
          settings, setting = "buttonPlacementWatch7";
      var rd = {
        init: function(whitelist, blacklist){
          try {
            settings = ytcenter.settings[setting];
            updateList();
            
            sandboxes = whitelist;
            var wl = [],
                bl = [];
            for (var i = 0; i < whitelist.length; i++) {
              wl.push(document.getElementById(whitelist[i].id));
            }
            for (var i = 0; i < blacklist.length; i++) {
              bl.push(document.getElementById(blacklist[i]));
            }
            __api = $DragList(wl, bl);
            __api.addEventListener("drop", ytcenter.placementsystem.drop);
            __api.addEventListener("move", ytcenter.placementsystem.move);
          } catch (e) {
            con.error(e);
          }
        },
        toggleEnable: function(){
          if (__api) {
            __api.setEnable(!__api.isEnabled());
            return __api.isEnabled();
          } else {
            con.error("API for draglist hasn't been initialized!");
          }
          return false;
        },
        registerElement: function(elm, query){
          con.log("Regisering Element to PlacementSystem: " + query);
          putItem([elm, query, [], false]);
        },
        registerNativeElements: function(){
          var bp = settings;
          for (var key in bp) {
            if (bp.hasOwnProperty(key)) {
              for (var i = 0; i < bp[key].length; i++) {
                if (bp[key][i].indexOf("@") == 0) continue;
                var ar = bp[key][i].split("&@&");
                try {
                  var e = document.evaluate(ar[1], document.getElementById(ar[0]), null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                  putItem([e, bp[key][i], [], true]);
                } catch (e) {
                  con.log("Couldn't find and register element: " + bp[key][i]);
                }
              }
            }
          }
        },
        db: database,
        getElement: function(query){
          for (var i = 0; i < database.length; i++) {
            if (database[i][1] === query) {
              return database[i][0];
            }
          }
          return null;
        },
        arrangeElements: function(){
          var bp = settings;
          for (var key in bp) {
            if (bp.hasOwnProperty(key)) {
              if (!document.getElementById(key)) continue;
              for (var i = 0; i < bp[key].length; i++) {
                var elm = ytcenter.placementsystem.getElement(bp[key][i]);
                if (elm != null) {
                  if (elm.parentNode) {
                    setParentData(elm, elm.parentNode.id);
                    elm.parentNode.removeChild(elm);
                    document.getElementById(key).appendChild(elm);
                    setParentData(elm, key);
                  } else {
                    setParentData(elm, key);
                    document.getElementById(key).appendChild(elm);
                  }
                  document.getElementById(key).appendChild(elm);
                }
              }
            }
          }
          for (var i = 0; i < database.length; i++) {
            if (!database[i][0] || !database[i][0].parentNode) continue;
            setParentData(database[i][0], database[i][0].parentNode.id);
          }
        },
        drop: function(elm){
          try {
            var _s = ytcenter.utils.jsonClone(settings);
            var new_parent = elm.parentNode.id;
            var new_next_sibling = elm.nextElementSibling;
            var query = (function(){
              for (var i = 0; i < database.length; i++) {
                if (database[i][0] == elm) {
                  return database[i][1];
                }
              }
              return null;
            })();
            var old_parent = null;
            var old_index = null;
            for (var key in _s) {
              if (_s.hasOwnProperty(key)) {
                var quit = false;
                for (var i = 0; i < _s[key].length; i++) {
                  if (query == _s[key][i]) {
                    old_index = i;
                    old_parent = key;
                    quit = true;
                    break;
                  }
                }
                if (quit) break;
              }
            }
            for (var i = 0; i < database.length; i++) {
              if (database[i][0] == null) continue;
              setParentData(database[i][0], database[i][0].parentNode.id);
            }
            _s[old_parent].splice(old_index, 1);
            if (new_next_sibling == null) {
              _s[new_parent].push(query);
            } else {
              var new_next_sibling_query = (function(){
                for (var i = 0; i < database.length; i++) {
                  if (new_next_sibling == database[i][0]) {
                    return database[i][1];
                  }
                }
              })();
              for (var i = 0; i < _s[new_parent].length; i++) {
                if (_s[new_parent][i] == new_next_sibling_query) {
                  _s[new_parent].splice(i, 0, query);
                  break;
                }
              }
            }
            settings = _s;
            ytcenter.settings[setting] = _s;
            
            ytcenter.saveSettings();
          } catch (e) {
            con.error(e);
          }
        },
        move: function(){
          for (var i = 0; i < database.length; i++) {
            if (database[i][0] == null) continue;
            setParentData(database[i][0], database[i][0].parentNode.id);
          }
        },
        clear: function(){
          /*database = [];
          rd.db = database;*/
          for (var i = 0; i < database.length; i++) {
            if (database[i][3]) {
              var id = database[i][1].split("&@&")[0];
              if (document.getElementById(id)) {
                document.getElementById(id).appendChild(database[i][0]);
              } else {
                con.warn("[PlacementSystem Clear] Couldn't re-add the element to parent " + id);
              }
            } else if (database[i][0] && database[i][0].parentNode) {
              database[i][0].parentNode.removeChild(database[i][0]);
            }
          }
          if (ytcenter.placementsystem.ytcd && ytcenter.placementsystem.ytcd.parentNode)
            ytcenter.placementsystem.ytcd.parentNode.removeChild(ytcenter.placementsystem.ytcd);
        }
      };
      return rd;
    })();
    con.log("Initializing database");
    ytcenter.language = (function(){
      function __setElementText(lang, elm, name, type, replace) {
        if (type.indexOf("@") === 0) {
          elm[type.substring(1)] = ytcenter.utils.replaceTextAsString(lang[name], replace);
        } else {
          elm.setAttribute(type, ytcenter.utils.replaceTextAsString(lang[name], replace));
        }
      }
      var db = [];
      var currentLang = {};
      
      var __r = {};
      /**
       * Adds an element to the database which will then be updated when the update function is called.
       * @elm The element which will get the update.
       * @name The locale name which will be used to update the text.
       * @type The type of how the element will be manipulated. If there's an @ followed by textContent it will update the textContent or else it's an argument.
       */
      __r.addLocaleElement = function(elm, name, type, replace) {
        replace = replace || {};
        db.push([elm, name, type, replace]);
      };
      
      __r.getLanguage = function(language){
        return ytcenter.languages[language];
      };
      /**
       * Gets the locale for the specific locale name.
       */
      __r.getLocale = function(name, language){
        if (typeof language !== "string")
          return currentLang[name];
        else
          return __r.getLanguage(language)[name];
      };
      /**
       * Updates all elements added to the database with the given language.
       * @lang The array with the specific language data.
       */
      __r.update = function(lang, doNotRecurse){
        lang = lang || ytcenter.settings.language;
        if (lang === "auto") {
          if (uw.yt && uw.yt.getConfig && uw.yt.getConfig("PAGE_NAME")) {
            if (uw.yt.config_.FEEDBACK_LOCALE_LANGUAGE && ytcenter.languages.hasOwnProperty(uw.yt.config_.FEEDBACK_LOCALE_LANGUAGE)) {
              lang = uw.yt.config_.FEEDBACK_LOCALE_LANGUAGE;
            } else if (uw.yt.config_.SANDBAR_LOCALE && ytcenter.languages.hasOwnProperty(uw.yt.config_.SANDBAR_LOCALE)) {
              lang = uw.yt.config_.SANDBAR_LOCALE;
            } else if (uw.yt.config_.HL_LOCALE && ytcenter.languages.hasOwnProperty(uw.yt.config_.HL_LOCALE)) {
              lang = uw.yt.config_.HL_LOCALE;
            } else {
              lang = "en";
            }
          } else {
            lang = "en";
            if (!doNotRecurse) {
              con.log("Language set to " + lang + " because it could not be auto-detected yet");
              var languageUpdateCounter = 0;
              var languageUpdateInterval = uw.setInterval((function(){
                if (uw.yt && uw.yt.getConfig && uw.yt.getConfig("PAGE_NAME")) {
                  uw.clearInterval(languageUpdateInterval);
                  ytcenter.language.update("auto", true);
                } else if (++languageUpdateCounter >= 100) {
                  uw.clearInterval(languageUpdateInterval);
                  con.log("YouTube configuration data is inaccessible; giving up on language auto-detection.");
                }
              }).bind(this), 500);
            } else {
              con.log("Language set to " + lang + " because auto-detection failed unexpectedly");
            }
          }
        }
        currentLang = ytcenter.languages[lang];
        for (var i = 0; i < db.length; i++) {
          __setElementText(currentLang, db[i][0], db[i][1], db[i][2], db[i][3]);
        }
        ytcenter.events.performEvent("language-refresh");
        //ytcenter.events.performEvent("settings-update");
      };
      
      return __r;
    })();
    ytcenter.languages = @ant-database-language@;
    con.log("default settings initializing");
    ytcenter._settings = {
      headlineTitleExpanded: false,
      videoThumbnailQualitySeparated: true,
      embedWriteEmbedMethodReloadDelay: 1000,
      embedWriteEmbedMethod: "test5", // "standard", "test1", "test2", "test3", "standard+reload", "test1+reload", "test2+reload", "test3+reload", "test4", "test5"
      fixHTML5Annotations: false,
      saveErrorStatusTimeout: 5000,
      saveStatusTimeout: 2000,
      flexWidthOnChannelPage: true,
      playerDarkSideBGRetro: false,
      playerDarkSideBGColor: "#1b1b1b",
      playerDarkSideBG: false,
      useSecureProtocol: true,
      videoThumbnailRatingsBarHeight: 2,
      sparkbarHeight: 2,
      sparkbarLikesColor: "#590",
      sparkbarDislikesColor: "#ccc",
      commentsPlusLinkRedirectConfirm: true,
      commentsPlusScrollToCommentAtCollapse: true,
      commentsPlusRemoveLinks: false,
      commentsPlusBlacklist: [
        { type: "equals", length: 1 },
        { type: "repeat", amount: 9 },
        { type: "profilelinks", regex: "${username}", attr: "textContent" },
        { type: "hashlinks", regex: "fixyoutube", attr: "textContent" }
      ],
      commentsPlusWhitelist: [],
      likeSwitchToTab: "none", // none, details, share, addto, stats
      endOfVideoAutoSwitchToTab: "none", // none, details, share, addto, stats
      //enableYouTubeAutoSwitchToShareTab: false,
      topScrollPlayerEnabled: false,
      topScrollPlayerActivated: false,
      topScrollPlayerTimesToEnter: 1,
      topScrollPlayerTimesToExit: 0,
      topScrollPlayerCountIncreaseBefore: true,
      topScrollPlayerHideScrollbar: false,
      topScrollPlayerBumpTimer: 2000,
      topScrollPlayerAnimation: true,
      topScrollPlayerEnabledOnlyVideoPlaying: true,
      topScrollPlayerScrollUpToExit: false,
      
      debug_settings_playersize: false,
      debug_settings_buttonPlacement: false,
      debug_settings_videoThumbnailData: false,
      debug_settings_commentCountryData: false,
      debug_settings_watchedVideos: false,
      debug_settings_notwatchedVideos: false,
      debug_playervars: false,
      debug_spf_args: false,
      
      signatureDecipher: [],
      embed_defaultAutoplay: true,
      hideTicker: true,
      enableEndscreenAutoplay: false,
      removeYouTubeTitleSuffix: true,
      playerPlayingTitleIndicator: false,
      playerOnlyOneInstancePlaying: true,
      videoThumbnailAnimationEnabled: true,
      videoThumbnailAnimationShuffle: false,
      videoThumbnailAnimationDelay: 1000,
      videoThumbnailAnimationInterval: 700,
      videoThumbnailAnimationFallbackInterval: 2000,
      forcePlayerType: "default", // default, flash, html5
      embed_forcePlayerType: "default", // default, flash, html5
      settingsDialogMode: true,
      ytExperimentFixedTopbar: false,
      ytspf: false,
      videoThumbnailCacheSize: 500,
      commentCacheSize: 500,
      watchedVideosIndicator: true,
      hideWatchedVideos: false,
      watchedVideos: [],
      notwatchedVideos: [],
      watchedVideosLimit: 10000, // Hope this isn't too big.
      notwatchedVideosLimit: 10000, // Hope this isn't too big.
      gridSubscriptionsPage: true,
      compatibilityCheckerForChromeDisable: false,
      removeRelatedVideosEndscreen: false,
      enableResize: true,
      guideMode: "default", // [default, always_open, always_closed]
      ytExperimentalLayotTopbarStatic: false,
      
      uploaderCountryEnabled: true,
      uploaderCountryShowFlag: true,
      uploaderCountryUseNames: true,
      uploaderCountryPosition: "after_username", // ["before_username", "after_username", "last"]
      
      commentCountryData: [],
      commentCountryEnabled: false,
      commentCountryShowFlag: true,
      commentCountryUseNames: true,
      commentCountryLazyLoad: true,
      commentCountryPosition: "after_username", // ["before_username", "after_username", "last"]
      
      videoThumbnailData: [],
      videoThumbnailQualityBar: true,
      videoThumbnailQualityPosition: "topleft",
      videoThumbnailQualityDownloadAt: "hover_thumbnail",
      videoThumbnailQualityVisible: "always",
      videoThumbnailRatingsBar: true,
      videoThumbnailRatingsBarPosition: "bottom",
      videoThumbnailRatingsBarDownloadAt: "scroll_into_view",
      videoThumbnailRatingsBarVisible: "always",
      videoThumbnailRatingsBarLikesColor: "#590",
      videoThumbnailRatingsBarDislikesColor: "#f00",
      videoThumbnailRatingsCount: true,
      videoThumbnailRatingsCountPosition: "bottomleft",
      videoThumbnailRatingsCountDownloadAt: "scroll_into_view",
      videoThumbnailRatingsCountVisible: "show_hover",
      videoThumbnailWatchLaterPosition: "bottomright",
      videoThumbnailWatchLaterVisible: "show_hover",
      videoThumbnailTimeCodePosition: "bottomright",
      videoThumbnailTimeCodeVisible: "hide_hover",
      dashPlayback: true,
      embed_dashPlayback: true,
      channel_dashPlayback: true,
      experimentalFeatureTopGuide: false,
      language: 'auto',
      filename: '{title}',
      fixfilename: false,
      flexWidthOnPage: true,
      enableAutoVideoQuality: true,
      autoVideoQuality: 'hd720',
      removeAdvertisements: true,
      preventAutoPlay: false,
      preventAutoBuffer: false,
      preventTabAutoPlay: false,
      preventTabAutoBuffer: false,
      preventTabPlaylistAutoPlay: false,
      preventTabPlaylistAutoBuffer: false,
      preventPlaylistAutoPlay: false,
      preventPlaylistAutoBuffer: false,
      scrollToPlayer: true,
      expandDescription: false,
      enableAnnotations: true,
      //enableCaptions: true, // %
      enableShortcuts: true,
      autohide: '2',
      enableVolume: false,
      volume: 100,
      mute: false,
      enableDownload: true,
      downloadQuality: 'highres',
      downloadFormat: 'mp4',
      downloadAsLinks: true,
      show3DInDownloadMenu: false,
      enableRepeat: true,
      repeatSave: false,
      autoActivateRepeat: false,
      mp3Services: '',
      lightbulbEnable: true,
      lightbulbBackgroundColor: '#000000',
      lightbulbBackgroundOpaque: 95,
      lightbulbClickThrough: false,
      lightbulbAutoOff: false,
      flashWMode: 'none', // none, window, direct, opaque, transparent, gpu
      playerTheme: 'dark', // dark, light
      playerColor: 'red', // red, white
      enableUpdateChecker: true,
      updateCheckerInterval: "0",
      updateCheckerLastUpdate: 0,
      buttonPlacementWatch7: {
        'watch7-ytcenter-buttons': ['@downloadgroup', '@repeatbtn', '@lightbtn', '@resizebtn', '@aspectbtn'],
        'watch7-sentiment-actions': ['watch7-sentiment-actions&@&//*[@id="watch-like-dislike-buttons"]']
      },
      channel_enableAutoVideoQuality: true,
      channel_autoVideoQuality: 'medium',
      channel_autohide: '2',
      channel_playerTheme: 'dark',
      channel_playerColor: 'red',
      channel_flashWMode: 'none',
      channel_enableAnnotations: true,
      channel_preventAutoPlay: false,
      channel_preventAutoBuffer: true,
      channel_enableVolume: false,
      channel_volume: 100,
      channel_mute: false,
      channel_experimentalFlashMode: 'clone',
      channel_experimentalHTML5Mode: 'none',
      embed_enabled: true,
      embed_enableAutoVideoQuality: true,
      embed_autoVideoQuality: 'medium',
      embed_autohide: '2',
      embed_playerTheme: 'dark',
      embed_playerColor: 'red',
      embed_flashWMode: 'none',
      embed_enableAnnotations: true,
      embed_preventAutoPlay: false,
      embed_preventAutoBuffer: true,
      embed_enableVolume: false,
      embed_volume: 100,
      embed_mute: false,
      resizeEnable: true,
      resizeSave: false,
      aspectEnable: true,
      aspectSave: false,
      aspectValue: 'default',
      repeatShowIcon: true,
      watch7playerguidehide: false,
      watch7playerguidealwayshide: false,
      watch7centerpage: true,
      removeBrandingBanner: true,
      removeBrandingBackground: true,
      removeBrandingWatermark: true,
      fixGuideNotVisible: false,
      hideFeedbackButton: false,
      bgcolor: "default",
      embed_bgcolor: "default",
      channel_bgcolor: "default",
      player_wide: false,
      "resize-default-playersize": 'default',
      "resize-small-button": "default_fit_to_content",
      "resize-large-button": "default_720",
      playerSizeAspect: "default", // default, 4:3, 16:9, 16:10, 24:10
      "resize-playersizes": [
        {
          id: "default_small",
          config: {
            width: "",
            height: "",
            large: false,
            align: true,
            scrollToPlayer: false,
            scrollToPlayerButton: false
          }
        }, {
          id: "default_large",
          config: {
            width: "",
            height: "",
            large: true,
            align: true,
            scrollToPlayer: false,
            scrollToPlayerButton: false
          }
        }, {
          id: "default_fit_to_content",
          config: {
            customName: "Fit to Content",
            width: "985px",
            height: "",
            large: true,
            align: true,
            scrollToPlayer: false,
            scrollToPlayerButton: false,
          }
        }, {
          id: "default_collapse_player",
          config: {
            customName: "Collapse The Player",
            width: "640px",
            height: "0px",
            large: false,
            align: true,
            scrollToPlayer: false,
            scrollToPlayerButton: false,
          }
        }, {
          id: "default_720",
          config: {
            customName: "720p",
            width: "1280px",
            height: "",
            large: true,
            align: false,
            scrollToPlayer: false,
            scrollToPlayerButton: false
          }
        }, {
          id: "default_1080",
          config: {
            customName: "1080p",
            width: "1920px",
            height: "",
            large: true,
            align: false,
            scrollToPlayer: false,
            scrollToPlayerButton: false
          }
        }, {
          id: "default_70_percent",
          config: {
            customName: "70%",
            width: "70%",
            height: "",
            large: true,
            align: false,
            scrollToPlayer: false,
            scrollToPlayerButton: false
          }
        }, {
          id: "default_80_percent",
          config: {
            customName: "80%",
            width: "80%",
            height: "",
            large: true,
            align: false,
            scrollToPlayer: false,
            scrollToPlayerButton: false
          }
        }, {
          id: "default_90_percent",
          config: {
            customName: "90%",
            width: "90%",
            height: "",
            large: true,
            align: false,
            scrollToPlayer: false,
            scrollToPlayerButton: false
          }
        }, {
          id: "default_100_percent",
          config: {
            customName: "Fill",
            width: "100%",
            height: "100%",
            large: true,
            align: false,
            scrollToPlayer: true,
            scrollToPlayerButton: true
          }
        }
      ]
    };
    con.log("Making clone of default settings");
    ytcenter.settings = $Clone(ytcenter._settings);
    ytcenter.doRepeat = false;
    ytcenter.html5 = false;
    ytcenter.html5flash = false;
    ytcenter.watch7 = true;
    ytcenter.redirect = function(url, newWindow){
      con.log("Redirecting" + (newWindow ? " in new window" : "") + " to " + url);
      if (typeof newWindow != "undefined") {
        window.open(ytcenter.utils.replaceTextAsString(url, {
          title: ytcenter.video.title,
          videoid: ytcenter.video.id,
          author: ytcenter.video.author,
          url: loc.href
        }));
      } else {
        loc.href = ytcenter.utils.replaceTextAsString(url, {
          title: ytcenter.video.title,
          videoid: ytcenter.video.id,
          author: ytcenter.video.author,
          url: loc.href
        });
      }
    };
    con.log("redirect initialized");
    ytcenter.discardElement = (function(){
      var g = document.createElement('div');
      g.style.display = 'none';
      document.addEventListener("DOMContentLoaded", (function(g){
        return function(){
          document.body.appendChild(g);
        };
      })(g), true);
      return (function(g){
        return function(element){
          con.log("Discarding element");
          if (!element) return;
          if (element.parentNode) {
            element.parentNode.removeChild(element);
          }
          g.appendChild(element);
          g.innerHTML = "";
        };
      })(g);
    })();
    con.log("discardElement initialized");
    ytcenter.callback_db = [];
    if (identifier === 3) { // Firefox Extension
      self.port.on("xhr onreadystatechange", function(data){
        var data = JSON.parse(data);
        if (ytcenter.callback_db[data.id].onreadystatechange)
          ytcenter.callback_db[data.id].onreadystatechange({responseText: data.responseText});
      });
      self.port.on("xhr onload", function(data){
        var data = JSON.parse(data);
        if (ytcenter.callback_db[data.id].onload)
          ytcenter.callback_db[data.id].onload({responseText: data.responseText});
      });
      self.port.on("xhr onerror", function(data){
        var data = JSON.parse(data);
        if (ytcenter.callback_db[data.id].onerror)
          ytcenter.callback_db[data.id].onerror({responseText: data.responseText});
      });
      self.port.on("load callback", function(data){
        data = JSON.parse(data);
        ytcenter.callback_db[data.id](data.storage);
      });
      self.port.on("save callback", function(data){
        data = JSON.parse(data);
        ytcenter.callback_db[data.id]();
      });
    } else if (identifier === 4) { // Safari Extension
      safari.self.addEventListener("message", function(e){
        var data = JSON.parse(e.message);
        if (e.name === "xhr onreadystatechange") {
          if (ytcenter.callback_db[data.id].onreadystatechange)
            ytcenter.callback_db[data.id].onreadystatechange(data.response);
        } else if (e.name === "xhr onload") {
          if (ytcenter.callback_db[data.id].onload)
            ytcenter.callback_db[data.id].onload(data.response);
        } else if (e.name === "xhr onerror") {
          if (ytcenter.callback_db[data.id].onerror)
            ytcenter.callback_db[data.id].onerror(data.response);
        } else if (e.name === "load callback") {
          ytcenter.callback_db[data.id](data.response);
        } else if (e.name === "save callback") {
          ytcenter.callback_db[data.id]();
        }
      }, false);
    } else if (identifier === 5) { // Opera Legacy Extnesion
      opera.extension.onmessage = function(e){
        if (e.data.action === "xhr onreadystatechange") {
          if (ytcenter.callback_db[e.data.id].onreadystatechange)
            ytcenter.callback_db[e.data.id].onreadystatechange(e.data.response);
        } else if (e.data.action === "xhr onload") {
          if (ytcenter.callback_db[e.data.id].onload)
            ytcenter.callback_db[e.data.id].onload(e.data.response);
        } else if (e.data.action === "xhr onerror") {
          if (ytcenter.callback_db[e.data.id].onerror)
            ytcenter.callback_db[e.data.id].onerror(e.data.response);
        } else if (e.data.action === "load callback") {
          ytcenter.callback_db[e.data.id](e.data.storage);
        } else if (e.data.action === "save callback") {
          ytcenter.callback_db[e.data.id]();
        }
      };
    }
    ytcenter.storageName = "YouTubeCenterSettings";
    ytcenter.loadSettings = function(callback){
      try {
        if (identifier === 1 && injected) {
          ytcenter.unsafe.storage.onloaded_db.push(function(storage){
            if (typeof storage === "string")
              storage = JSON.parse(storage);
            for (var key in storage) {
              if (storage.hasOwnProperty(key)) {
                ytcenter.settings[key] = storage[key];
              }
            }
            if (callback) callback();
          });
          uw.postMessage(JSON.stringify({
            id: ytcenter.unsafe.storage.onloaded_db.length - 1,
            method: "loadSettings",
            arguments: [ytcenter.storageName]
          }), "*");
        } else if (identifier === 3) {
          var id = ytcenter.callback_db.push(function(storage){
            if (typeof storage === "string")
              storage = JSON.parse(storage);
            for (var key in storage) {
              if (storage.hasOwnProperty(key)) {
                ytcenter.settings[key] = storage[key];
              }
            }
            if (callback) callback();
          }) - 1;
          self.port.emit("load", JSON.stringify({id: id, name: ytcenter.storageName}));
        } else if (identifier === 4) {
          var id = ytcenter.callback_db.push(function(storage){
            if (typeof storage === "string")
              storage = JSON.parse(storage);
            for (var key in storage) {
              if (storage.hasOwnProperty(key)) {
                ytcenter.settings[key] = storage[key];
              }
            }
            if (callback) callback();
          }) - 1;
          safari.self.tab.dispatchMessage("load", JSON.stringify({
            id: id,
            name: ytcenter.storageName
          }));
        } else if (identifier === 5) {
          var id = ytcenter.callback_db.push(function(storage){
            if (typeof storage === "string")
              storage = JSON.parse(storage);
            for (var key in storage) {
              if (storage.hasOwnProperty(key)) {
                ytcenter.settings[key] = storage[key];
              }
            }
            if (callback) callback();
          }) - 1;
          opera.extension.postMessage({
            action: 'load',
            id: id,
            name: ytcenter.storageName
          });
        } else if (identifier === 6) {
          con.log("Loading storage_getValue");
          var data = storage_getValue(ytcenter.storageName) || "{}";
          if (data && data !== null) {
            try {
              var loaded = JSON.parse(data);
              for (var key in loaded) {
                if (loaded.hasOwnProperty(key)) {
                  ytcenter.settings[key] = loaded[key];
                }
              }
            } catch (e) {
              con.error(e);
            }
          }
          if (callback) callback();
        } else {
          var data = $LoadData(ytcenter.storageName, "{}");
          try {
            var loaded = JSON.parse(data);
            for (var key in loaded) {
              if (loaded.hasOwnProperty(key)) {
                ytcenter.settings[key] = loaded[key];
              }
            }
          } catch (e) {
            con.error(e);
          }
          if (callback) callback();
        }
      } catch (e) {
        con.error(e);
      }
    };
    con.log("[Init] Loading Settings.");
    ytcenter.__settingsLoaded = false;
    ytcenter.loadSettings(function(){
      ytcenter.__settingsLoaded = true;
      if ((ytcenter.getPage() === "embed" && ytcenter.settings.embed_enabled) || ytcenter.getPage() !== "embed") {
        var intercom = ytcenter.Intercom.getInstance();
        intercom.on("settings", function(data){
          if (data.origin === intercom.origin) return;
          if (data.action === "loadSettings") {
            con.log("[Intercom] Received order to loadSettings!");
            var _player_wide = ytcenter.settings.player_wide, // We don't want this to be updated.
                _experimentalFeatureTopGuide = ytcenter.settings.experimentalFeatureTopGuide; // We don't want this to be updated.
            ytcenter.loadSettings(function(){
              // Restores the settings we don't want changed
              ytcenter.settings.player_wide = _player_wide;
              ytcenter.settings.experimentalFeatureTopGuide = _experimentalFeatureTopGuide;
              
              ytcenter.events.performEvent("settings-update");
              ytcenter.language.update();
              ytcenter.title.update();
              ytcenter.classManagement.applyClasses();
            });
          }
        });
      }
    });
    con.log("Save Settings initializing");
    ytcenter.saveSettings_timeout_obj = null;
    ytcenter.saveSettings_timeout = 300;
    ytcenter.saveSettings_intercomTimeout = null;
    ytcenter.saveSettings = function(async, timeout, _callback){
      var callback = function(){
        uw.clearTimeout(ytcenter.saveSettings_intercomTimeout);
        ytcenter.events.performEvent("save-complete");
        ytcenter.saveSettings_intercomTimeout = uw.setTimeout(function(){
          if ((ytcenter.getPage() === "embed" && ytcenter.settings.embed_enabled) || ytcenter.getPage() !== "embed") {
            con.log("[SaveSettings] Ordering other tabs to load the new settings.");
            var intercom = ytcenter.Intercom.getInstance();
            intercom.emit("settings", {
              action: "loadSettings",
              origin: intercom.origin
            });
          }
        }, 500);
        if (_callback) _callback();
      };
      if (typeof async !== "boolean") async = false;
      if (typeof timeout !== "boolean") timeout = false;
      var __ss = function(){
        con.log("[Storage] Saving Settings");
        if (identifier === 1 && injected) {
          ytcenter.unsafe.storage.onsaved_db.push(function(){
            con.log("Saved Settings!");
            callback();
          });
          uw.postMessage(JSON.stringify({
            id: ytcenter.unsafe.storage.onsaved_db.length - 1,
            method: "saveSettings",
            arguments: [ytcenter.storageName, JSON.stringify(ytcenter.settings)]
          }), "*");
        } else if (identifier === 3) {
          var id = ytcenter.callback_db.push(function(){
            callback();
          }) - 1;
          self.port.emit("save", JSON.stringify({id: id, name: ytcenter.storageName, value: ytcenter.settings}));
        } else if (identifier === 4) {
          var id = ytcenter.callback_db.push(function(){
            callback();
          }) - 1;
          safari.self.tab.dispatchMessage("save", JSON.stringify({
            id: id,
            name: ytcenter.storageName,
            value: ytcenter.settings
          }));
        } else if (identifier === 5) {
          var id = ytcenter.callback_db.push(function(){
            callback();
          }) - 1;
          opera.extension.postMessage({
            action: 'save',
            id: id,
            name: ytcenter.storageName,
            value: JSON.stringify(ytcenter.settings)
          });
        } else if (identifier === 6) {
          storage_setValue(ytcenter.storageName, JSON.stringify(ytcenter.settings));
          callback();
        } else {
          if (async) {
            uw.postMessage("YouTubeCenter" + JSON.stringify({
              type: "saveSettings"
            }), (loc.href.indexOf("http://") === 0 ? "http://www.youtube.com" : "https://www.youtube.com"));
          } else {
            if (!$SaveData(ytcenter.storageName, JSON.stringify(ytcenter.settings))) {
              con.error("[Settings] Couldn't save settings.");
            }
            callback();
          }
        }
      };
      try {
        ytcenter.events.performEvent("save");
        uw.clearTimeout(ytcenter.saveSettings_timeout_obj);
        if (timeout) {
          ytcenter.saveSettings_timeout_obj = uw.setTimeout(function(){
            __ss();
          }, ytcenter.saveSettings_timeout);
        } else {
          __ss();
        }
      } catch (e) {
        con.error(e);
        ytcenter.events.performEvent("save-error");
      }
    };
    con.log("Check for updates initializing");
    ytcenter.checkForUpdatesDev = (function(){
      var updElement;
      return function(success, error, disabled){
        // We check if this build is a dev build.
        if (!devbuild) {
          con.log("[Update] This is not a dev build!");
          return;
        } else {
          con.log("Checking for updates...");
          if (typeof error == "undefined") {
            error = function(){};
          }
          $XMLHTTPRequest({
            method: "GET",
            url: "https://raw.github.com/YePpHa/YouTubeCenter/master/devbuild.number",
            headers: {
              "Content-Type": "text/plain"
            },
            onload: (function(success){
              return function(response){
                con.log("Got Update Response");
                var buildnumber = -1;
                if (response && response.responseText) {
                  buildnumber = parseInt(/build\.number=([0-9]+)/m.exec(response.responseText)[1], 10);
                  con.log("[Update] Current dev build #" + buildnumber + ". Your build number #" + devnumber);
                } else {
                  con.log("Couldn't parse the build number");
                }
                if (buildnumber > devnumber) {
                  con.log("New update available");
                  if (typeof updElement != "undefined") {
                    ytcenter.discardElement(updElement);
                  }
                  updElement = document.createElement("div");
                  updElement.className = "yt-alert yt-alert-default yt-alert-warn";
                  updElement.style.margin = "0 auto";
                  var ic = document.createElement("div");
                  ic.className = "yt-alert-icon";
                  var icon = document.createElement("img");
                  icon.src = "//s.ytimg.com/yt/img/pixel-vfl3z5WfW.gif";
                  icon.className = "icon master-sprite";
                  icon.setAttribute("alt", "Alert icon");
                  ic.appendChild(icon);
                  updElement.appendChild(ic);
                  var c = document.createElement("div");
                  c.className = "yt-alert-buttons";
                  var cbtn = document.createElement("button");
                  cbtn.setAttribute("type", "button");
                  cbtn.setAttribute("role", "button");
                  cbtn.setAttribute("onclick", ";return false;");
                  cbtn.className = "close yt-uix-close yt-uix-button yt-uix-button-close";
                  cbtn.addEventListener("click", (function(updElement){
                    return function(){
                      ytcenter.utils.addClass(updElement, 'hid');
                    };
                  })(updElement));
                  
                  var cbtnt = document.createElement("span");
                  cbtnt.className = "yt-uix-button-content";
                  cbtnt.textContent = "Close ";
                  cbtn.appendChild(cbtnt);
                  c.appendChild(cbtn);
                  updElement.appendChild(c);
                  
                  var cn = document.createElement("div");
                  cn.className = "yt-alert-content";
                  
                  var cnt = document.createElement("span");
                  cnt.className = "yt-alert-vertical-trick";
                  
                  var cnme = document.createElement("div");
                  cnme.className = "yt-alert-message";
                  var f1 = ytcenter.utils.replaceText(ytcenter.language.getLocale("UPDATER_DEV_NEWBUILD"),
                    {
                      "{lb}": function(){ return document.createElement("br"); },
                      "{url}": function(){
                        var a = document.createElement("a");
                        a.href = "https://github.com/YePpHa/YouTubeCenter/wiki/Developer-Version";
                        a.setAttribute("target", "_blank");
                        a.appendChild(ytcenter.utils.replaceText(ytcenter.language.getLocale("DEV_BUILD"), { "{n}": document.createTextNode(buildnumber) }));
                        return a;
                      }
                    }
                  );
                  ytcenter.events.addEvent("language-refresh", function(){
                    f1 = ytcenter.utils.replaceText(ytcenter.language.getLocale("UPDATER_DEV_NEWBUILD"),
                      {
                        "{lb}": function(){ return document.createElement("br"); },
                        "{url}": function(){
                          var a = document.createElement("a");
                          a.href = "https://github.com/YePpHa/YouTubeCenter/wiki/Developer-Version";
                          a.setAttribute("target", "_blank");
                          a.appendChild(ytcenter.utils.replaceText(ytcenter.language.getLocale("DEV_BUILD"), { "{n}": document.createTextNode(buildnumber) }));
                          return a;
                        }
                      }
                    );
                    cnme.innerHTML = "";
                    cnme.appendChild(f1);
                  });
                  cnme.appendChild(f1);
                  
                  cn.appendChild(cnt);
                  cn.appendChild(cnme);
                  updElement.appendChild(cn);
                  
                  document.getElementById("alerts").appendChild(updElement);
                } else {
                  con.log("No new updates available");
                }
                if (success) {
                  con.log("Calling update callback");
                  success(response);
                }
              };
            })(success),
            onerror: error
          });
        }
      };
    })();
    ytcenter.checkForUpdates = (function(){
      var updElement;
      return function(success, error, disabled){
        if (devbuild) {
          con.log("[Update] This is a dev build.");
          ytcenter.checkForUpdatesDev(success, error, disabled); // This is only called when it's a developer build.
          return;
        }
        // If it's the Chrome/Opera addon and the browser is Opera, or if it's the Firefox addon it will not check for updates!
        if ((@identifier@ === 1 && (uw.navigator.userAgent.indexOf("Opera") !== -1 || uw.navigator.userAgent.indexOf("OPR/") !== -1)) || @identifier@ === 6) {
          con.log("[UpdateChecker] UpdateChecker has been disabled!");
          if (typeof disabled == "function")
            disabled();
        } else {
          con.log("Checking for updates...");
          if (typeof error == "undefined") {
            error = function(){};
          }
          $XMLHTTPRequest({
            method: "GET",
            url: "http://userscripts.org/scripts/source/114002.meta.js",
            headers: {
              "Content-Type": "text/plain"
            },
            onload: (function(success){
              return function(response){
                con.log("Got Update Response");
                var rev = -1,
                    ver = "-1"
                if (response && response.responseText) {
                  rev =  parseInt(/^\/\/ @updateVersion\s+([0-9]+)$/m.exec(response.responseText)[1], 10);
                  ver = /^\/\/ @version\s+([a-zA-Z0-9.,-_]+)$/m.exec(response.responseText)[1];
                } else {
                  con.log("Couldn't parse revision and version from the update page.");
                }
                if (rev > ytcenter.revision) {
                  con.log("New update available");
                  if (typeof updElement != "undefined") {
                    ytcenter.discardElement(updElement);
                  }
                  updElement = document.createElement("div");
                  updElement.className = "yt-alert yt-alert-default yt-alert-warn";
                  updElement.style.margin = "0 auto";
                  var ic = document.createElement("div");
                  ic.className = "yt-alert-icon";
                  var icon = document.createElement("img");
                  icon.src = "//s.ytimg.com/yt/img/pixel-vfl3z5WfW.gif";
                  icon.className = "icon master-sprite";
                  icon.setAttribute("alt", "Alert icon");
                  ic.appendChild(icon);
                  updElement.appendChild(ic);
                  var c = document.createElement("div");
                  c.className = "yt-alert-buttons";
                  var cbtn = document.createElement("button");
                  cbtn.setAttribute("type", "button");
                  cbtn.setAttribute("role", "button");
                  cbtn.setAttribute("onclick", ";return false;");
                  cbtn.className = "close yt-uix-close yt-uix-button yt-uix-button-close";
                  cbtn.addEventListener("click", (function(updElement){
                    return function(){
                      ytcenter.utils.addClass(updElement, 'hid');
                    };
                  })(updElement));
                  
                  var cbtnt = document.createElement("span");
                  cbtnt.className = "yt-uix-button-content";
                  cbtnt.textContent = "Close ";
                  cbtn.appendChild(cbtnt);
                  c.appendChild(cbtn);
                  updElement.appendChild(c);
                  
                  var cn = document.createElement("div");
                  cn.className = "yt-alert-content";
                  
                  var cnt = document.createElement("span");
                  cnt.className = "yt-alert-vertical-trick";
                  
                  var cnme = document.createElement("div");
                  cnme.className = "yt-alert-message";
                  var f1 = document.createTextNode(ytcenter.language.getLocale("UPDATE_NOTICE"));
                  ytcenter.language.addLocaleElement(f1, "UPDATE_NOTICE", "@textContent", {});
                  var f2 = document.createElement("br");
                  var f3 = document.createTextNode(ytcenter.language.getLocale("UPDATE_INSTALL"));
                  ytcenter.language.addLocaleElement(f3, "UPDATE_INSTALL", "@textContent", {});
                  var f4 = document.createTextNode(" ");
                  var f5 = document.createElement("a");
                  if (@identifier@ === 0) {
                    f5.href = "http://userscripts.org/scripts/source/114002.user.js";
                  } else if (@identifier@ === 1) {
                    f5.href = "https://dl.dropboxusercontent.com/u/13162258/YouTube%20Center/YouTubeCenter.crx";
                  } else if (@identifier@ === 2) {
                    f5.href = "https://dl.dropboxusercontent.com/u/13162258/YouTube%20Center/YouTubeCenter.mxaddon";
                  } else if (@identifier@ === 3) {
                    f5.href = "https://dl.dropboxusercontent.com/u/13162258/YouTube%20Center/YouTubeCenter.xpi";
                  } else if (@identifier@ === 4) {
                    f5.href = "https://dl.dropboxusercontent.com/u/13162258/YouTube%20Center/YouTubeCenter.safariextz";
                  } else if (@identifier@ === 5) {
                    f5.href = "https://dl.dropboxusercontent.com/u/13162258/YouTube%20Center/YouTubeCenter.oex";
                  }
                  f5.setAttribute("target", "_blank");
                  f5.textContent = "YouTube Center v" + ver;
                  var f6 = document.createTextNode(" ");
                  var f7 = document.createTextNode(ytcenter.language.getLocale("UPDATE_OR"));
                  ytcenter.language.addLocaleElement(f7, "UPDATE_OR", "@textContent", {});
                  var f8 = document.createTextNode(" ");
                  var f9 = document.createElement("a");
                  f9.setAttribute("target", "_blank");
                  if (@identifier@ === 6) {
                    f9.href = "https://addons.mozilla.org/en-us/firefox/addon/youtube-center/";
                    f9.textContent = "addons.mozilla.org";
                  } else {
                    f9.href = "http://userscripts.org/scripts/show/114002";
                    f9.textContent = "userscripts.org";
                  }
                  
                  cnme.appendChild(f1);
                  cnme.appendChild(f2);
                  cnme.appendChild(f3);
                  cnme.appendChild(f4);
                  cnme.appendChild(f5);
                  cnme.appendChild(f6);
                  cnme.appendChild(f7);
                  cnme.appendChild(f8);
                  cnme.appendChild(f9);
                  
                  cn.appendChild(cnt);
                  cn.appendChild(cnme);
                  updElement.appendChild(cn);
                  
                  document.getElementById("alerts").appendChild(updElement);
                } else {
                  con.log("No new updates available");
                }
                if (success) {
                  con.log("Calling update callback");
                  success(response);
                }
              };
            })(success),
            onerror: error
          });
        }
      };
    })();
    con.log("Adding mp3services to database");
    ytcenter.mp3services = [
      {
        label: 'SETTINGS_MP3SERVICES_VIDEO2MP3',
        value: 'http://www.video2mp3.net/index.php?url=http%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D{videoid}&hq=0'
      }, {
        label: 'SETTINGS_MP3SERVICES_VIDEO2MP3_HQ',
        value: 'http://www.video2mp3.net/index.php?url=http%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D{videoid}&hq=1'
      }, {
        label: 'SETTINGS_MP3SERVICES_YOUTUBEINMP3_64',
        value: 'http://www.youtubeinmp3.com/download.php?youtubeURL=http%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D{videoid}&quality=64&submit=Download+MP3'
      }, {
        label: 'SETTINGS_MP3SERVICES_YOUTUBEINMP3_128',
        value: 'http://www.youtubeinmp3.com/download.php?youtubeURL=http%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D{videoid}&quality=128&submit=Download+MP3'
      }, {
        label: 'SETTINGS_MP3SERVICES_YOUTUBEINMP3_320',
        value: 'http://www.youtubeinmp3.com/download.php?youtubeURL=http%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D{videoid}&quality=320&submit=Download+MP3'
      }, {
        label: 'SETTINGS_MP3SERVICES_HDDOWNLOADER_128',
        value: 'http://www.hddownloader.com/index.php?act=do&url=http%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D{videoid}&dldtype=128&outFormat=mp3'
      }, {
        label: 'SETTINGS_MP3SERVICES_HDDOWNLOADER_192',
        value: 'http://www.hddownloader.com/index.php?act=do&url=http%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D{videoid}&dldtype=192&outFormat=mp3'
      }, {
        label: 'SETTINGS_MP3SERVICES_HDDOWNLOADER_256',
        value: 'http://www.hddownloader.com/index.php?act=do&url=http%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D{videoid}&dldtype=256&outFormat=mp3'
      }, {
        label: 'SETTINGS_MP3SERVICES_YOUTUBEMP3PRO',
        value: 'http://www.youtubemp3pro.com/#{videoid}'
      }, {
        label: 'SETTINGS_MP3SERVICES_YOUTUBEMP3',
        value: 'http://www.youtube-mp3.org/#v={videoid}'
      }, {
        label: 'SETTINGS_MP3SERVICES_SNIPMP3',
        value: 'http://snipmp3.com/?url=http%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D{videoid}'
      }
    ];
    con.log("Initializing settings ui");
    ytcenter.settingsPanel = (function(){
      var a = {}, categories = [], subcategories = [], options = [];
      
      a.createCategory = function(label){
        var id = categories.length;
        categories.push({
          id: id,
          label: label,
          enabled: true,
          visible: true,
          subcategories: []
        });
        return a.getCategory(id);
      };
      a.createSubCategory = function(label){
        var id = subcategories.length;
        subcategories.push({
          id: id,
          label: label,
          enabled: true,
          visible: true,
          options: [],
          listeners: {}
        });
        return a.getSubCategory(id);
      };
      a.createOption = function(defaultSetting, module, label, args, help){
        var id = options.length;
        options.push({
          id: id,
          label: label,
          args: args,
          defaultSetting: defaultSetting,
          module: module,
          help: help,
          enabled: true,
          visible: true,
          styles: {},
          moduleStyles: {},
          listeners: {}
        });
        return a.getOption(id);
      };
      a.getCategory = function(id){
        if (categories.length <= id || id < 0) throw new Error("[Settings Category] Category with specified id doesn't exist (" + id + ")!");
        var cat = categories[id];
        return {
          getId: function(){
            return id;
          },
          setVisibility: function(visible){
            if (cat.visible === visible) return;
            cat.visible = visible;
            if (cat._visible) cat._visible(visible);
          },
          setEnabled: function(enabled){
            cat.enabled = enabled;
          },
          addSubCategory: function(subcategory){
            cat.subcategories.push(subcategories[subcategory.getId()]);
          },
          select: function(){
            if (cat.select) cat.select();
          }
        };
      };
      a.getSubCategory = function(id){
        if (subcategories.length <= id || id < 0) throw new Error("[Settings SubCategory] Category with specified id doesn't exist (" + id + ")!");
        var subcat = subcategories[id];
        return {
          getId: function(){
            return id;
          },
          setVisibility: function(visible){
            if (subcat.visible === visible) return;
            subcat.visible = visible;
            if (subcat._visible) subcat._visible(visible);
          },
          setEnabled: function(enabled){
            subcat.enabled = enabled;
          },
          addOption: function(option){
            subcat.options.push(options[option.getId()]);
          },
          select: function(){
            if (subcat.select) subcat.select();
          },
          addEventListener: function(event, callback){
            if (!subcat.listeners[event]) subcat.listeners[event] = [];
            subcat.listeners[event].push(callback);
          }
        };
      };
      a.getOption = function(id){
        if (options.length <= id || id < 0) throw new Error("[Settings Options] Option with specified id doesn't exist (" + id + ")!");
        var option = options[id];
        return {
          getId: function(){
            return id;
          },
          getLabel: function(){
            return option.label;
          },
          getDefaultSetting: function(){
            return option.defaultSetting;
          },
          getModule: function(){
            return option.module;
          },
          getHelp: function(){
            return option.help;
          },
          setVisibility: function(visible){
            if (option.visible === visible) return;
            option.visible = visible;
            if (option._visible) option._visible(visible);
          },
          setEnabled: function(enabled){
            option.enabled = enabled;
          },
          setStyle: function(key, value){
            option.styles[key] = value;
          },
          getStyle: function(key){
            return option.styles[key];
          },
          setModuleStyle: function(key, value){
            option.moduleStyles[key] = value;
          },
          getModuleStyle: function(key){
            return option.moduleStyles[key];
          },
          addModuleEventListener: function(event, callback, bubble){
            if (!option.moduleListeners) option.moduleListeners = [];
            option.moduleListeners.push([event, callback, bubble]);
          },
          removeModuleEventListener: function(event, callback, bubble){
            throw new Error("Not implemented!");
          },
          addEventListener: function(event, callback, bubble){
            if (!option.listeners) option.listeners = {};
            if (!option.listeners[event]) option.listeners[event] = [];
            option.listeners[event].push(callback);
          },
          removeEventListener: function(event, callback, bubble){
            if (!option.listeners) return;
            if (!option.listeners[event]) return;
            var i;
            for (i = 0; i < option.listeners[event].length; i++) {
              if (option.listeners[event][i] === callback) {
                option.listeners[event].splice(i, 1);
                return;
              }
            }
          },
          getLiveModule: function(){
            return option.liveModule;
          }
        };
      };
      a.createOptionsForLayout = function(subcat){
        var frag = document.createDocumentFragment();
        
        subcat.options.forEach(function(option){
          var optionWrapper = document.createElement("div"),
              label, module, moduleContainer, labelText, help, replaceHelp, i;
          optionWrapper.className = "ytcenter-settings-subcat-option" + (option.visible ? "" : " hid");
          option._visible = function(visible){
            if (visible) {
              ytcenter.utils.removeClass(optionWrapper, "hid");
            } else {
              ytcenter.utils.addClass(optionWrapper, "hid");
            }
          };
          if (option.label && option.label !== "") {
            labelText = document.createTextNode(ytcenter.language.getLocale(option.label));
            ytcenter.language.addLocaleElement(labelText, option.label, "@textContent");
            
            if (option.styles) {
              ytcenter.utils.each(option.styles, function(key, value){
                optionWrapper.style.setProperty(key, value);
              });
            }
            
            label = document.createElement("span");
            label.className = "ytcenter-settings-option-label";
            label.appendChild(labelText);
            
            if (option.help && option.help !== "") {
              help = document.createElement("a");
              help.className = "ytcenter-settings-help";
              help.setAttribute("target", "_blank");
              help.setAttribute("href", option.help);
              help.appendChild(document.createTextNode('?'));
              replaceHelp = { "{option}": function() { return ytcenter.language.getLocale(option.label); } };
              help.setAttribute("title", ytcenter.utils.replaceTextToText(ytcenter.language.getLocale("SETTINGS_HELP_ABOUT"), replaceHelp));
              ytcenter.language.addLocaleElement(help, "SETTINGS_HELP_ABOUT", "title", replaceHelp);
              label.appendChild(help);
            }
            
            optionWrapper.appendChild(label);
          }
          if (option.defaultSetting && !(option.defaultSetting in ytcenter._settings)) {
            con.warn("[SettingsPanel] An option was registered, which doesn't have a default option (" + option.defaultSetting + ").");
          }
          if (!option.module) {
            
          } else {
            if (!ytcenter.modules[option.module])
              throw new Error("[Settings createOptionsForLayout] Option (" + option.id + ", " + option.label + ", " + option.module + ") are using an non existing module!");

            moduleContainer = document.createElement("div");
            moduleContainer.className = "ytcenter-module-container";
            if (!option.label || option.label === "") {
              moduleContainer.style.width = "100%";
            }
            if (option.moduleStyles) {
              ytcenter.utils.each(option.moduleStyles, function(key, value){
                moduleContainer.style.setProperty(key, value);
              });
            }
            option.parent = a.getSubCategory(subcat.id);
            module = ytcenter.modules[option.module](option);
            option.liveModule = module;
            moduleContainer.appendChild(module.element);
            
            module.bind(function(value){
              if (typeof option.defaultSetting !== "undefined" && typeof ytcenter.settings[option.defaultSetting] !== "undefined") {
                ytcenter.settings[option.defaultSetting] = value;
                ytcenter.saveSettings();
              }
              
              //ytcenter.events.performEvent("ui-refresh");
              
              if (option.listeners && option.listeners["update"]) {
                for (i = 0; i < option.listeners["update"].length; i++) {
                  option.listeners["update"][i](value);
                }
              }
              ytcenter.events.performEvent("settings-update", option.id);
            });
            ytcenter.events.addEvent("settings-update", function(id){
              if (id !== option.id && option.defaultSetting && ytcenter.settings[option.defaultSetting]) {
                module.update(ytcenter.settings[option.defaultSetting]);
              }
            });
            if (option.defaultSetting && ytcenter.settings[option.defaultSetting]) {
              module.update(ytcenter.settings[option.defaultSetting]);
            }
            
            if (option.moduleListeners) {
              if (module.addEventListener) {
                for (i = 0; i < option.moduleListeners.length; i++) {
                  module.addEventListener(option.moduleListeners[i][0], option.moduleListeners[i][1], option.moduleListeners[i][2]);
                }
              } else {
                throw new Error(option.module + " do not support listeners!");
              }
            }
            
            optionWrapper.appendChild(moduleContainer);
          }
          frag.appendChild(optionWrapper);
        });
        
        return frag;
      };
      a.createLayout = function(){
        var frag = document.createDocumentFragment(),
            categoryList = document.createElement("ul"),
            subcatList = [],
            sSelectedList = [],
            leftPanel = document.createElement("div"), rightPanel = document.createElement("div"),
            rightPanelContent = document.createElement("div"),
            productVersion = document.createElement("div"),
            subcatTop = document.createElement("div"), subcatContent = document.createElement("div"),
            panelWrapper = document.createElement("div"),
            categoryHide = false;
        subcatTop.className = "ytcenter-settings-subcat-header-wrapper";
        subcatContent.className = "ytcenter-settings-subcat-content-wrapper";
        leftPanel.className = "ytcenter-settings-panel-left clearfix";
        rightPanel.className = "ytcenter-settings-panel-right clearfix";
        
        productVersion.className = "ytcenter-settings-version";
        if (devbuild) {
          ytcenter.events.addEvent("language-refresh", function(){
            productVersion.innerHTML = "";
            productVersion.appendChild(ytcenter.utils.replaceText(ytcenter.language.getLocale("DEV_BUILD"), { "{n}": document.createTextNode(devnumber) }));
          });
          productVersion.appendChild(ytcenter.utils.replaceText(ytcenter.language.getLocale("DEV_BUILD"), { "{n}": document.createTextNode(devnumber) }));
        } else {
          productVersion.textContent = "YouTube Center v" + ytcenter.version;
        }
        
        categoryList.className = "ytcenter-settings-category-list";
        categories.forEach(function(category){
          var li = document.createElement("li"),
              acat = document.createElement("a"),
              valign = document.createElement("span"),
              text = document.createElement("span"),
              subcatLinkList = [],
              subcatContentList = [],
              topheader = document.createElement("div"),
              topheaderList = document.createElement("ul"),
              categoryContent = document.createElement("div"),
              hideContent = false;
          if (li && !category.visible) li.className = "hid";
          sSelectedList.push(acat);
          acat.href = ";return false;";
          acat.className = "ytcenter-settings-category-item yt-valign" + (categoryHide || !category.visible ? "" : " ytcenter-selected");
          
          ytcenter.utils.addEventListener(acat, "click", function(e){
            category.select();
            if (category.subcategories.length > 0 && category.subcategories[0] && category.subcategories[0].select) category.subcategories[0].select();
            
            //ytcenter.events.performEvent("ui-refresh");
            
            e.preventDefault();
            e.stopPropagation();
            return false;
          }, false);
          valign.className = "yt-valign-container";
          
          text.textContent = ytcenter.language.getLocale(category.label);
          ytcenter.language.addLocaleElement(text, category.label, "@textContent");
          
          valign.appendChild(text);
          acat.appendChild(valign);
          li.appendChild(acat);
          categoryList.appendChild(li);
          
          topheaderList.className = "ytcenter-settings-subcat-header clearfix";
          category.subcategories.forEach(function(subcat){
            var content = document.createElement("div"),
                liItem = document.createElement("li"),
                liItemLink = document.createElement("a"),
                itemTextContent = document.createElement("span");
            content.className = "ytcenter-settings-subcat-content" + (hideContent ? " hid" : "");
            liItem.className = "clearfix";
            liItemLink.className = "yt-uix-button ytcenter-settings-subcat-header-item" + (hideContent ? "" : " ytcenter-selected");
            itemTextContent.className = "ytcenter-settings-subcat-header-item-content";
            itemTextContent.textContent = ytcenter.language.getLocale(subcat.label);
            ytcenter.language.addLocaleElement(itemTextContent, subcat.label, "@textContent");
            
            content.appendChild(a.createOptionsForLayout(subcat));
            
            liItemLink.appendChild(itemTextContent);
            liItem.appendChild(liItemLink);
            topheaderList.appendChild(liItem);
            
            ytcenter.utils.addEventListener(liItemLink, "click", function(e){
              subcat.select();
              //ytcenter.events.performEvent("ui-refresh");
              
              e.preventDefault();
              e.stopPropagation();
              return false;
            }, false);
            subcatLinkList.push(liItemLink);
            subcatContentList.push(content);
            subcat.select = function(){
              if (!subcat.visible) return;
              subcatLinkList.forEach(function(item){
                ytcenter.utils.removeClass(item, "ytcenter-selected");
              });
              subcatContentList.forEach(function(item){
                ytcenter.utils.addClass(item, "hid");
              });
              ytcenter.utils.removeClass(content, "hid");
              ytcenter.utils.addClass(liItemLink, "ytcenter-selected");
              
              if (subcat.listeners.click) {
                subcat.listeners.click.forEach(function(callback){
                  callback();
                });
              }
            };
            subcat._visible = function(visible){
              if (visible) {
                try {
                  category.subcategories.forEach(function(subcat2){
                    if (subcat2.visible && subcat2 !== subcat) {
                      throw "SelectedException";
                    }
                  });
                  if (subcat.select) subcat.select();
                } catch (e) {
                  if (e !== "SelectedException") throw e;
                }
                ytcenter.utils.removeClass(liItem, "hid");
              } else {
                ytcenter.utils.addClass(liItem, "hid");
                ytcenter.utils.addClass(content, "hid");
                
                if (ytcenter.utils.hasClass(liItemLink, "ytcenter-selected")) {
                  try {
                    category.subcategories.forEach(function(subcat2){
                      if (subcat2.visible && subcat2.select) {
                        if (subcat2.select()) throw "SelectedException";
                      }
                    });
                  } catch (e) {
                    if (e !== "SelectedException") throw e;
                  }
                }
                ytcenter.utils.removeClass(liItemLink, "ytcenter-selected");
              }
            };
            
            categoryContent.appendChild(content);
            hideContent = true;
          });
          topheader.appendChild(topheaderList);
          
          topheader.className = (categoryHide || !category.visible ? "hid" : "");
          categoryContent.className = (categoryHide || !category.visible ? "hid" : "");
          
          subcatList.push(topheader);
          subcatList.push(categoryContent);
          subcatTop.appendChild(topheader);
          subcatContent.appendChild(categoryContent);
          
          category.select = function(){
            if (!category.visible) return false;
            sSelectedList.forEach(function(item){
              ytcenter.utils.removeClass(item, "ytcenter-selected");
            });
            subcatList.forEach(function(item){
              ytcenter.utils.addClass(item, "hid");
            });
            ytcenter.utils.addClass(acat, "ytcenter-selected");
            ytcenter.utils.removeClass(topheader, "hid");
            ytcenter.utils.removeClass(categoryContent, "hid");
            return true;
          };
          category._visible = function(visible){
            if (visible) {
              ytcenter.utils.removeClass(li, "hid");
            } else {
              ytcenter.utils.addClass(li, "hid");
              ytcenter.utils.addClass(topheader, "hid");
              ytcenter.utils.addClass(categoryContent, "hid");
              if (ytcenter.utils.hasClass(acat, "ytcenter-selected")) {
                try {
                  categories.forEach(function(category2){
                    if (category2.visible && category2.select) {
                      if (category2.select()) throw "SelectedException";
                    }
                  });
                } catch (e) {
                  if (e !== "SelectedException") throw e;
                }
              }
              ytcenter.utils.removeClass(acat, "ytcenter-selected");
            }
          };
          if (category.visible) categoryHide = true;
        });
        
        leftPanel.appendChild(categoryList);
        leftPanel.appendChild(productVersion);
        
        rightPanelContent.appendChild(subcatTop);
        rightPanelContent.appendChild(subcatContent);
        
        var statusbar = document.createElement("div");
        statusbar.className = "ytcenter-settings-subcat-statusbar-wrapper";
        statusbar.textContent = "";
        (function(){
          var savedTimeout = null,
              mode = 0;
          
          ytcenter.events.addEvent("language-refresh", function(){
            if (mode === 0) {
              statusbar.textContent = ytcenter.language.getLocale("STATUSBAR_SETTINGS_SAVING");
            } else if (mode === 1) {
              statusbar.textContent = ytcenter.language.getLocale("STATUSBAR_SETTINGS_SAVED");
            } else if (mode === -1) {
              statusbar.textContent = ytcenter.language.getLocale("STATUSBAR_SETTINGS_ERROR");
            }
          });
          
          ytcenter.events.addEvent("save", function(){
            if (savedTimeout) {
              uw.clearTimeout(savedTimeout);
              savedTimeout = null;
            }
            mode = 0;
            statusbar.textContent = ytcenter.language.getLocale("STATUSBAR_SETTINGS_SAVING");
            ytcenter.utils.addClass(statusbar, "visible");
          });
          ytcenter.events.addEvent("save-complete", function(){
            mode = 1;
            statusbar.textContent = ytcenter.language.getLocale("STATUSBAR_SETTINGS_SAVED");
            
            if (savedTimeout) {
              uw.clearTimeout(savedTimeout);
              savedTimeout = null;
            }
            savedTimeout = uw.setTimeout(function(){
              ytcenter.utils.removeClass(statusbar, "visible");
              savedTimeout = null;
            }, ytcenter.settings.saveStatusTimeout);
          });
          ytcenter.events.addEvent("save-error", function(){
            mode = -1;
            statusbar.textContent = ytcenter.language.getLocale("STATUSBAR_SETTINGS_ERROR");
            
            if (savedTimeout) {
              uw.clearTimeout(savedTimeout);
              savedTimeout = null;
            }
            savedTimeout = uw.setTimeout(function(){
              ytcenter.utils.removeClass(statusbar, "visible");
              savedTimeout = null;
            }, ytcenter.settings.saveErrorStatusTimeout);
          });
        })();
        
        rightPanelContent.appendChild(statusbar);
        
        
        rightPanel.appendChild(rightPanelContent);
        
        rightPanelContent.className = "ytcenter-settings-panel-right-content";
        panelWrapper.className = "ytcenter-settings-content";
        
        panelWrapper.appendChild(leftPanel);
        panelWrapper.appendChild(rightPanel);
        
        frag.appendChild(panelWrapper);
        
        return frag;
      };
      
      a.createDialog = function(){
        var dialog = ytcenter.dialog("SETTINGS_TITLE", a.createLayout(), [], "top"),
            closeButton = document.createElement("div"),
            closeIcon = document.createElement("img");
        closeIcon.className = "close";
        closeIcon.setAttribute("src", "//s.ytimg.com/yts/img/pixel-vfl3z5WfW.gif");
        closeButton.style.position = "absolute";
        closeButton.style.top = "0";
        closeButton.style.right = "0";
        closeButton.style.margin = "0";
        closeButton.className = "yt-alert";
        closeButton.appendChild(closeIcon);
        ytcenter.utils.addEventListener(closeButton, "click", function(){
          dialog.setVisibility(false);
        }, false);
        dialog.getHeader().appendChild(closeButton);
        dialog.getHeader().style.margin = "0 -20px 0px";
        dialog.getBase().style.overflowY = "scroll";
        dialog.getFooter().style.display = "none";
        dialog.getContent().className += " clearfix";
        return dialog;
      };
      return a;
    })();
    (function(){
      var cat, subcat, option;

      /* Category:General */
      cat = ytcenter.settingsPanel.createCategory("SETTINGS_TAB_GENERAL");
        subcat = ytcenter.settingsPanel.createSubCategory("SETTINGS_TAB_GENERAL"); cat.addSubCategory(subcat);
          option = ytcenter.settingsPanel.createOption(
            "language", // defaultSetting
            "list", // Module
            "SETTINGS_LANGUAGE", // label
            { // Args
              "list": function(){
                var a = [];
                a.push({
                  "label": "LANGUAGE_AUTO",
                  "value": "auto"
                });
                for (var key in ytcenter.languages) {
                  if (ytcenter.languages.hasOwnProperty(key)) {
                    a.push({
                      "value": key,
                      "label": (function(k){
                        return function(){
                          return ytcenter.languages[k].LANGUAGE;
                        };
                      })(key)
                    });
                  }
                }
                return a;
              },
              "listeners": [
                {
                  "event": "update",
                  "callback": function(){
                    ytcenter.language.update();
                  }
                }
              ]
            },
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#multiple-languages" // help
          );
          subcat.addOption(option);

          option = ytcenter.settingsPanel.createOption(
            "useSecureProtocol", // defaultSetting
            "bool", // module
            "SETTINGS_USESECUREPROTOCOL_LABEL", // label
            null, // args
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#use-secure-protocol" // help
          );
          subcat.addOption(option);

          option = ytcenter.settingsPanel.createOption(
            "removeAdvertisements", // defaultSetting
            "bool", // module
            "SETTINGS_REMOVEADVERTISEMENTS_LABEL", // label
            null, // args
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#remove-advertisements" // help
          );
          subcat.addOption(option);

          option = ytcenter.settingsPanel.createOption(
            "ytspf", // defaultSetting
            "bool", // module
            "SETTINGS_YTSPF", // label
            null, // args
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#spf" // help
          );
          subcat.addOption(option);

          option = ytcenter.settingsPanel.createOption(
            "expandDescription", // defaultSetting
            "bool", // module
            "SETTINGS_AUTOEXPANDDESCRIPTION_LABEL"
          );
          subcat.addOption(option);

          option = ytcenter.settingsPanel.createOption(
            "headlineTitleExpanded", // defaultSetting
            "bool", // module
            "SETTINGS_AUTOEXPANDTITLE_LABEL"
          );
          subcat.addOption(option);

          option = ytcenter.settingsPanel.createOption(
            null, // defaultSetting
            "line"
          );
          subcat.addOption(option);

          option = ytcenter.settingsPanel.createOption(
            "removeYouTubeTitleSuffix", // defaultSetting
            "bool", // module
            "SETTINGS_TITLE_REMOVE_YOUTUBE_SUFFIX", // label
            {
              "listeners": [
                {
                  "event": "click",
                  "callback": function(){
                    ytcenter.title.update();
                  }
                }
              ]
            },
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#remove-youtube-title-suffix"
          );
          subcat.addOption(option);

          option = ytcenter.settingsPanel.createOption(
            "playerPlayingTitleIndicator", // defaultSetting
            "bool", // module
            "SETTINGS_PLAYER_PLAYING_INDICATOR", // label
            {
              "listeners": [
                {
                  "event": "click",
                  "callback": function(){
                    ytcenter.title.update();
                  }
                }
              ]
            },
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#show-player-playing-icon-in-title"
          );
          subcat.addOption(option);

          option = ytcenter.settingsPanel.createOption(
            "playerOnlyOneInstancePlaying", // defaultSetting
            "bool", // module
            "SETTINGS_PLAYER_ONLY_ONE_INSTANCE_PLAYING",
            null,
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#only-one-player-instance-playing"
          );
          subcat.addOption(option);

          option = ytcenter.settingsPanel.createOption(
            null, // defaultSetting
            "line"
          );
          subcat.addOption(option);

          option = ytcenter.settingsPanel.createOption(
            null, // defaultSetting
            "importexport"
          );
          subcat.addOption(option);

          option = ytcenter.settingsPanel.createOption(
            null, // defaultSetting
            "button",
            null,
            {
              "text": "SETTINGS_RESETSETTINGS_LABEL",
              "listeners": [
                {
                  "event": "click",
                  "callback": function(){
                    var msgElm = document.createElement("h3");
                    msgElm.style.fontWeight = "normal";
                    msgElm.textContent = ytcenter.language.getLocale("SETTINGS_RESETSETTINGS_TEXT");
                    ytcenter.language.addLocaleElement(msgElm, "SETTINGS_RESETSETTINGS_TEXT", "@textContent");
                    
                    var dialog = ytcenter.dialog("SETTINGS_RESETSETTINGS_LABEL", msgElm, [
                      {
                        label: "CONFIRM_CANCEL",
                        primary: false,
                        callback: function(){
                          dialog.setVisibility(false);
                        }
                      }, {
                        label: "CONFIRM_RESET",
                        primary: true,
                        callback: function(){
                          ytcenter.settings = ytcenter._settings;
                          ytcenter.saveSettings(false, false);
                          uw.setTimeout(function(){
                            loc.reload();
                            dialog.setVisibility(false);
                          }, 500);
                        }
                      }
                    ]);
                    dialog.setVisibility(true);
                  }
                }
              ]
            }
          );
          subcat.addOption(option);
          
        subcat = ytcenter.settingsPanel.createSubCategory("SETTINGS_SUBCAT_WATCHEDVIDEOS"); cat.addSubCategory(subcat);
          option = ytcenter.settingsPanel.createOption(
            "watchedVideosIndicator", // defaultSetting
            "bool", // module
            "SETTINGS_WATCHEDVIDEOS_INDICATOR",
            null,
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#watched-videos"
          );
          subcat.addOption(option);
          option = ytcenter.settingsPanel.createOption(
            "hideWatchedVideos", // defaultSetting
            "bool", // module
            "SETTINGS_HIDEWATCHEDVIDEOS",
            {
              "listeners": [
                {
                  "event": "click",
                  "callback": function(){
                    ytcenter.classManagement.applyClasses();
                  }
                }
              ]
            },
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#hide-watched-videos"
          );
          subcat.addOption(option);
          option = ytcenter.settingsPanel.createOption(
            null, // defaultSetting
            "button", // module
            null,
            {
              "text": "SETTINGS_WATCHEDVIDEOS_CLEAN_VIDEO_HISTORY",
              "listeners": [
                {
                  "event": "click",
                  "callback": function(){
                    var msgElm = document.createElement("h3");
                    msgElm.style.fontWeight = "normal";
                    msgElm.textContent = ytcenter.language.getLocale("SETTINGS_WATCHEDVIDEOS_CLEAN_VIDEO_HISTORY_CONTENT");
                    ytcenter.language.addLocaleElement(msgElm, "SETTINGS_WATCHEDVIDEOS_CLEAN_VIDEO_HISTORY_CONTENT", "@textContent");
                    
                    var dialog = ytcenter.dialog("SETTINGS_WATCHEDVIDEOS_CLEAN_VIDEO_HISTORY", msgElm, [
                      {
                        label: "CONFIRM_CANCEL",
                        primary: false,
                        callback: function(){
                          dialog.setVisibility(false);
                        }
                      }, {
                        label: "CONFIRM_CLEAN",
                        primary: true,
                        callback: function(){
                          ytcenter.settings.watchedVideos = [];
                          ytcenter.settings.notwatchedVideos = [];
                          ytcenter.saveSettings(null, null, function(){
                            loc.reload();
                            dialog.setVisibility(false);
                          });
                        }
                      }
                    ]);
                    dialog.setVisibility(true);
                  }
                }
              ]
            }
          );
          subcat.addOption(option);
          

        subcat = ytcenter.settingsPanel.createSubCategory("SETTINGS_SUBCAT_LAYOUT"); cat.addSubCategory(subcat);
          option = ytcenter.settingsPanel.createOption(
            "watch7centerpage", // defaultSetting
            "bool", // module
            "SETTINGS_WATCH7_CENTERPAGE", // label
            { // args
              "listeners": [
                {
                  "event": "click",
                  "callback": function(){
                    ytcenter.events.performEvent("ui-refresh");
                    ytcenter.classManagement.applyClasses();
                  }
                }
              ]
            },
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#centering-page" // help
          );
          if (ytcenter.settings['experimentalFeatureTopGuide']) {
            option.setVisibility(false);
          }
          ytcenter.events.addEvent("ui-refresh", function(){
            if (ytcenter.settings['experimentalFeatureTopGuide']) {
              this.setVisibility(false);
            } else {
              this.setVisibility(true);
            }
          }.bind(option));
          subcat.addOption(option);
          option = ytcenter.settingsPanel.createOption(
            "flexWidthOnPage", // defaultSetting
            "bool", // module
            "SETTINGS_FLEXWIDTHONPAGE_LABEL", // label
            { // args
              "listeners": [
                {
                  "event": "click",
                  "callback": function(){
                    ytcenter.classManagement.applyClasses();
                  }
                }
              ]
            },
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#flex-width-on-page" // help
          );
          subcat.addOption(option);
          option = ytcenter.settingsPanel.createOption(
            "flexWidthOnChannelPage", // defaultSetting
            "bool", // module
            "SETTINGS_FLEXWIDTHONCHANNELPAGE_LABEL", // label
            { // args
              "listeners": [
                {
                  "event": "click",
                  "callback": function(){
                    ytcenter.classManagement.applyClasses();
                  }
                }
              ]
            },
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#flex-width-on-page" // help
          );
          subcat.addOption(option);

          option = ytcenter.settingsPanel.createOption(
            "ytExperimentalLayotTopbarStatic", // defaultSetting
            "bool", // module
            "SETTINGS_YTEXPERIMENTALLAYOUT_TOPBAR_STATIC", // label
            { // args
              "listeners": [
                {
                  "event": "click",
                  "callback": function(){
                    if (ytcenter.settings.ytExperimentalLayotTopbarStatic) {
                      ytcenter.utils.addClass(document.body, "ytcenter-exp-topbar-static");
                    } else {
                      ytcenter.utils.removeClass(document.body, "ytcenter-exp-topbar-static");
                    }
                  }
                }
              ]
            },
            "set-experimental-topbar-to-static" // help
          );
          if (!ytcenter.settings['experimentalFeatureTopGuide']) {
            option.setVisibility(false);
          }
          ytcenter.events.addEvent("ui-refresh", function(){
            if (!ytcenter.settings['experimentalFeatureTopGuide']) {
              this.setVisibility(false);
            } else {
              this.setVisibility(true);
            }
          }.bind(option));
          subcat.addOption(option);
          
          option = ytcenter.settingsPanel.createOption(
            "gridSubscriptionsPage", // defaultSetting
            "bool", // module
            "SETTINGS_GRIDSUBSCRIPTIONS", // label
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#country-for-comments" // help
          );
          option.addEventListener("update", function(newValue){
            ytcenter.classManagement.applyClasses();
          });
          subcat.addOption(option);
          
          option = ytcenter.settingsPanel.createOption(
            "hideTicker", // defaultSetting
            "bool", // module
            "SETTINGS_HIDE_TICKER",
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#hide-ticker"
          );
          option.addEventListener("update", function(newValue){
            ytcenter.classManagement.applyClasses();
          });
          subcat.addOption(option);

      /* Category:Player */
      cat = ytcenter.settingsPanel.createCategory("SETTINGS_CAT_PLAYER");
        subcat = ytcenter.settingsPanel.createSubCategory("SETTINGS_TAB_GENERAL"); cat.addSubCategory(subcat);
          option = ytcenter.settingsPanel.createOption(
            "removeRelatedVideosEndscreen", // defaultSetting
            "bool", // module
            "SETTINGS_REMOVE_RELATED_VIDEOS_ENDSCREEN", // label
            {
              "listeners": [
                {
                  "event": "click",
                  "callback": function(){
                    ytcenter.events.performEvent("ui-refresh");
                  }
                }
              ]
            },
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#remove-endscreen"
          );
          subcat.addOption(option);
          option = ytcenter.settingsPanel.createOption(
            "enableEndscreenAutoplay", // defaultSetting
            "bool", // module
            "SETTINGS_ENDSCREEN_AUTOPLAY"
          );
          subcat.addOption(option);
          option = ytcenter.settingsPanel.createOption(
            "likeSwitchToTab",
            "list",
            "SETTINGS_SWITCHTOTAB_LIKE",
            {
              "list": [
                { "value": "none", "label": "SETTINGS_SWITCHTOTAB_NONE" },
                { "value": "details", "label": "SETTINGS_SWITCHTOTAB_DETAILS" },
                { "value": "share", "label": "SETTINGS_SWITCHTOTAB_SHARE" },
                { "value": "addto", "label": "SETTINGS_SWITCHTOTAB_ADDTO" },
                { "value": "stats", "label": "SETTINGS_SWITCHTOTAB_STATS" }
              ]
            }
          );
          subcat.addOption(option);
          option = ytcenter.settingsPanel.createOption(
            "endOfVideoAutoSwitchToTab",
            "list",
            "SETTINGS_SWITCHTOTAB_ENDOFVIDEO",
            {
              "list": [
                { "value": "none", "label": "SETTINGS_SWITCHTOTAB_NONE" },
                { "value": "details", "label": "SETTINGS_SWITCHTOTAB_DETAILS" },
                { "value": "share", "label": "SETTINGS_SWITCHTOTAB_SHARE" },
                { "value": "addto", "label": "SETTINGS_SWITCHTOTAB_ADDTO" },
                { "value": "stats", "label": "SETTINGS_SWITCHTOTAB_STATS" }
              ]
            }
          );
          subcat.addOption(option);
          option = ytcenter.settingsPanel.createOption(
            "dashPlayback", // defaultSetting
            "bool", // module
            "SETTINGS_DASHPLAYBACK",
            null,
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#dash-playback"
          );
          subcat.addOption(option);
          option = ytcenter.settingsPanel.createOption(
            "forcePlayerType", // defaultSetting
            "list", // module
            "SETTINGS_FORCEPLAYERTYPE",
            {
              "list": [
                { "value": "default", "label": "SETTINGS_FORCEPLAYERTYPE_DEFAULT" },
                { "value": "flash", "label": "SETTINGS_FORCEPLAYERTYPE_FLASH" },
                { "value": "html5", "label": "SETTINGS_FORCEPLAYERTYPE_HTML5" }
              ]
            },
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#dash-playback"
          );
          subcat.addOption(option);
          option = ytcenter.settingsPanel.createOption(
            "autohide", // defaultSetting
            "list", // module
            "SETTINGS_AUTOHIDECONTROLBAR_LABEL",
            {
              "list": [
                {
                  "value": "0",
                  "label": "SETTINGS_AUTOHIDECONTROLBAR_LIST_NONE"
                }, {
                  "value": "1",
                  "label": "SETTINGS_AUTOHIDECONTROLBAR_LIST_BOTH"
                }, {
                  "value": "2",
                  "label": "SETTINGS_AUTOHIDECONTROLBAR_LIST_PROGRESSBAR"
                }, {
                  "value": "3",
                  "label": "SETTINGS_AUTOHIDECONTROLBAR_LIST_CONTROLBAR"
                }
              ],
              "listeners" : [
                {
                  "event": "update",
                  "callback": function(){
                    if (ytcenter.page === "watch") {
                      ytcenter.player.setAutoHide(ytcenter.settings.autohide);
                    }
                  }
                }
              ]
            },
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#auto-hide-bar"
          );
          subcat.addOption(option);
          option = ytcenter.settingsPanel.createOption(
            "playerTheme", // defaultSetting
            "list", // module
            "SETTINGS_PLAYERTHEME_LABEL",
            {
              "list": [
                {
                  "value": "dark",
                  "label": "SETTINGS_PLAYERTHEME_DARK"
                }, {
                  "value": "light",
                  "label": "SETTINGS_PLAYERTHEME_LIGHT"
                }
              ],
              "listeners" : [
                {
                  "event": "update",
                  "callback": function(){
                    if (ytcenter.page === "watch") {
                      ytcenter.player.setTheme(ytcenter.settings.playerTheme);
                    }
                  }
                }
              ]
            },
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#player-theme"
          );
          subcat.addOption(option);
          option = ytcenter.settingsPanel.createOption(
            "playerColor", // defaultSetting
            "list", // module
            "SETTINGS_PLAYERCOLOR_LABEL",
            {
              "list": [
                {
                  "value": "red",
                  "label": "SETTINGS_PLAYERCOLOR_RED"
                }, {
                  "value": "white",
                  "label": "SETTINGS_PLAYERCOLOR_WHITE"
                }
              ],
              "listeners" : [
                {
                  "event": "update",
                  "callback": function(){
                    if (ytcenter.page === "watch") {
                      ytcenter.player.setProgressColor(ytcenter.settings.playerColor);
                    }
                  }
                }
              ]
            },
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#player-color"
          );
          subcat.addOption(option);
          option = ytcenter.settingsPanel.createOption(
            "flashWMode", // defaultSetting
            "list", // module
            "SETTINGS_WMODE_LABEL",
            {
              "list": [
                {
                  "value": "none",
                  "label": "SETTINGS_WMODE_NONE"
                }, {
                  "value": "window",
                  "label": "SETTINGS_WMODE_WINDOW"
                }, {
                  "value": "direct",
                  "label": "SETTINGS_WMODE_DIRECT"
                }, {
                  "value": "opaque",
                  "label": "SETTINGS_WMODE_OPAQUE"
                }, {
                  "value": "transparent",
                  "label": "SETTINGS_WMODE_TRANSPARENT"
                }, {
                  "value": "gpu",
                  "label": "SETTINGS_WMODE_GPU"
                }
              ]
            },
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#flash-wmode"
          );
          subcat.addOption(option);
          option = ytcenter.settingsPanel.createOption(
            "enableAnnotations", // defaultSetting
            "bool", // module
            "SETTINGS_ENABLEANNOTATIONS_LABEL",
            null,
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#annotations"
          );
          subcat.addOption(option);
          option = ytcenter.settingsPanel.createOption(
            "scrollToPlayer", // defaultSetting
            "bool", // module
            "SETTINGS_SCROLLTOPLAYER_LABEL",
            null,
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#scroll-to-player"
          );
          subcat.addOption(option);
          option = ytcenter.settingsPanel.createOption(
            null, // defaultSetting
            "line"
          );
          subcat.addOption(option);
          option = ytcenter.settingsPanel.createOption(
            "removeBrandingBanner", // defaultSetting
            "bool", // module
            "SETTINGS_BRANDING_BANNER_REMOVE", // label
            {
              "listeners": [
                {
                  "event": "click",
                  "callback": function(){
                    ytcenter.events.performEvent("ui-refresh");
                  }
                }
              ]
            },
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Remove_Branding_BannerBackgroundWatermark"
          );
          subcat.addOption(option);
          option = ytcenter.settingsPanel.createOption(
            "removeBrandingBackground", // defaultSetting
            "bool", // module
            "SETTINGS_BRANDING_BACKGROUND_REMOVE", // label
            {
              "listeners": [
                {
                  "event": "click",
                  "callback": function(){
                    ytcenter.events.performEvent("ui-refresh");
                  }
                }
              ]
            },
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Remove_Branding_BannerBackgroundWatermark"
          );
          subcat.addOption(option);
          option = ytcenter.settingsPanel.createOption(
            "removeBrandingWatermark", // defaultSetting
            "bool", // module
            "SETTINGS_BRANDING_WATERMARK_REMOVE", // label
            {
              "listeners": [
                {
                  "event": "click",
                  "callback": function(){
                    ytcenter.events.performEvent("ui-refresh");
                  }
                }
              ]
            },
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Remove_Branding_BannerBackgroundWatermark"
          );
          subcat.addOption(option);
          
          // Will only be visible in the developer build.
          if (@devbuild@) {
            option = ytcenter.settingsPanel.createOption(
              null, // defaultSetting
              "line"
            );
            subcat.addOption(option);
            
            option = ytcenter.settingsPanel.createOption(
              "fixHTML5Annotations", // defaultSetting
              "bool", // module
              "SETTINGS_HTML_ANNOTATION_FIX"
            );
            subcat.addOption(option);
          }
        
        subcat = ytcenter.settingsPanel.createSubCategory("SETTINGS_SUBCAT_AUTOPLAY"); cat.addSubCategory(subcat);
          option = ytcenter.settingsPanel.createOption(
            "preventAutoPlay", // defaultSetting
            "bool", // module
            "SETTINGS_PREVENTAUTOPLAY_LABEL", // label
            null,
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#prevent-auto-play"
          );
          subcat.addOption(option);
          option = ytcenter.settingsPanel.createOption(
            "preventAutoBuffer", // defaultSetting
            "bool", // module
            "SETTINGS_PREVENTAUTOBUFFERING_LABEL", // label
            null,
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#prevent-auto-buffering"
          );
          subcat.addOption(option);
          option = ytcenter.settingsPanel.createOption(
            null, // defaultSetting
            "newline"
          );
          subcat.addOption(option);
          option = ytcenter.settingsPanel.createOption(
            "preventPlaylistAutoPlay", // defaultSetting
            "bool", // module
            "SETTINGS_PLAYLIST_PREVENT_AUTOPLAY", // label
            null,
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#prevent-playlist-auto-play"
          );
          subcat.addOption(option);
          option = ytcenter.settingsPanel.createOption(
            "preventPlaylistAutoBuffer", // defaultSetting
            "bool", // module
            "SETTINGS_PLAYLIST_PREVENT_AUTOBUFFERING", // label
            null,
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#prevent-playlist-auto-buffering"
          );
          subcat.addOption(option);
          option = ytcenter.settingsPanel.createOption(
            null, // defaultSetting
            "newline"
          );
          subcat.addOption(option);
          option = ytcenter.settingsPanel.createOption(
            "preventTabAutoPlay", // defaultSetting
            "bool", // module
            "SETTINGS_PREVENTTABAUTOPLAY_LABEL",
            null,
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#prevent-tab-auto-play"
          );
          subcat.addOption(option);
          option = ytcenter.settingsPanel.createOption(
            "preventTabAutoBuffer", // defaultSetting
            "bool", // module
            "SETTINGS_PREVENTTABAUTOBUFFERING_LABEL",
            null,
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#prevent-tab-auto-buffering"
          );
          subcat.addOption(option);
          option = ytcenter.settingsPanel.createOption(
            null, // defaultSetting
            "newline"
          );
          subcat.addOption(option);
          option = ytcenter.settingsPanel.createOption(
            "preventTabPlaylistAutoPlay", // defaultSetting
            "bool", // module
            "SETTINGS_PREVENTTABPLAYLISTAUTOPLAY_LABEL",
            null,
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#prevent-tab-playlist-auto-play"
          );
          subcat.addOption(option);
          option = ytcenter.settingsPanel.createOption(
            "preventTabPlaylistAutoBuffer", // defaultSetting
            "bool", // module
            "SETTINGS_PREVENTTABPLAYLISTAUTOBUFFERING_LABEL",
            null,
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#prevent-tab-playlist-auto-buffering"
          );
          subcat.addOption(option);
        subcat = ytcenter.settingsPanel.createSubCategory("SETTINGS_SUBCAT_RESOLUTION"); cat.addSubCategory(subcat);
          option = ytcenter.settingsPanel.createOption(
            "enableAutoVideoQuality", // defaultSetting
            "bool", // module
            "SETTINGS_ENABLEAUTORESOLUTION_LABEL",
            null,
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#auto-resolution"
          );
          subcat.addOption(option);
          option = ytcenter.settingsPanel.createOption(
            "autoVideoQuality", // defaultSetting
            "list", // module
            "SETTINGS_AUTORESOLUTION_LABEL",
            {
              "list": [
                {
                  "value": "highres",
                  "label": "SETTINGS_HIGHRES"
                }, {
                  "value": "hd1440",
                  "label": "SETTINGS_HD1440"
                }, {
                  "value": "hd1080",
                  "label": "SETTINGS_HD1080"
                }, {
                  "value": "hd720",
                  "label": "SETTINGS_HD720"
                }, {
                  "value": "large",
                  "label": "SETTINGS_LARGE"
                }, {
                  "value": "medium",
                  "label": "SETTINGS_MEDIUM"
                }, {
                  "value": "small",
                  "label": "SETTINGS_SMALL"
                }, {
                  "value": "tiny",
                  "label": "SETTINGS_TINY"
                }
              ]
            }
          );
          subcat.addOption(option);
          

        subcat = ytcenter.settingsPanel.createSubCategory("SETTINGS_SUBCAT_PLAYERSIZE"); cat.addSubCategory(subcat);
          option = ytcenter.settingsPanel.createOption(
            "enableResize", // defaultSetting
            "bool", // module
            "SETTINGS_RESIZE_FEATURE_ENABLE"
          );
          subcat.addOption(option);
          option = ytcenter.settingsPanel.createOption(
            "resize-default-playersize", // defaultSetting
            "defaultplayersizedropdown", // module
            "SETTINGS_RESIZE_DEFAULT",
            {
              "bind": "resize-playersizes"
            },
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#default-resize-button"
          );
          subcat.addOption(option);
          option = ytcenter.settingsPanel.createOption(
            "resize-small-button", // defaultSetting
            "defaultplayersizedropdown", // module
            "SETTINGS_RESIZE_SMALL_BUTTON",
            {
              "bind": "resize-playersizes"
            },
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#small-resize-button"
          );
          subcat.addOption(option);
          option = ytcenter.settingsPanel.createOption(
            "resize-large-button", // defaultSetting
            "defaultplayersizedropdown", // module
            "SETTINGS_RESIZE_LARGE_BUTTON",
            {
              "bind": "resize-playersizes"
            },
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#large-resize-button"
          );
          subcat.addOption(option);
          option = ytcenter.settingsPanel.createOption(
            "playerSizeAspect", // defaultSetting
            "list", // module
            "SETTINGS_RESIZE_ASPECT_LABEL",
            {
              "list": [
                {
                  "value": "default",
                  "label": "SETTINGS_RESIZE_ASPECT_DEFAULT"
                }, {
                  "value": "4:3",
                  "label": "SETTINGS_RESIZE_ASPECT_4:3"
                }, {
                  "value": "16:9",
                  "label": "SETTINGS_RESIZE_ASPECT_16:9"
                }, {
                  "value": "16:10",
                  "label": "SETTINGS_RESIZE_ASPECT_16:10"
                }, {
                  "value": "24:10",
                  "label": "SETTINGS_RESIZE_ASPECT_24:10"
                }
              ],
              "listeners": [
                {
                  "event": "update",
                  "callback": function(){
                    ytcenter.player.setRatio(ytcenter.player.calculateRatio(ytcenter.player.getConfig().args.dash === "1" && ytcenter.player.getConfig().args.adaptive_fmts));
                  }
                }
              ]
            },
            null
          );
          subcat.addOption(option);
          option = ytcenter.settingsPanel.createOption(
            null, // defaultSetting
            null, // module
            "SETTINGS_RESIZE_LIST",
            null,
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#player-size-editor"
          );
          subcat.addOption(option);
          option = ytcenter.settingsPanel.createOption(
            "resize-playersizes", // defaultSetting
            "resizeItemList" // module
          );
          subcat.addOption(option);

        subcat = ytcenter.settingsPanel.createSubCategory("SETTINGS_SUBCAT_VOLUME"); cat.addSubCategory(subcat);
          option = ytcenter.settingsPanel.createOption(
            "enableVolume", // defaultSetting
            "bool", // module
            "SETTINGS_VOLUME_ENABLE",
            null,
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#volume-control"
          );
          subcat.addOption(option);
          option = ytcenter.settingsPanel.createOption(
            "volume", // defaultSetting
            "rangetext", // module
            "SETTINGS_VOLUME_LABEL",
            {
              "min": 0,
              "max": 100,
              "suffix": "%"
            }
          );
          subcat.addOption(option);
          option = ytcenter.settingsPanel.createOption(
            "mute", // defaultSetting
            "bool", // module
            "SETTINGS_MUTE_LABEL"
          );
          subcat.addOption(option);
        
        subcat = ytcenter.settingsPanel.createSubCategory("SETTINGS_SUBCAT_SHORTCUTS"); cat.addSubCategory(subcat);
          option = ytcenter.settingsPanel.createOption(
            "enableShortcuts", // defaultSetting
            "bool", // module
            "SETTINGS_ENABLESHORTCUTS_LABEL" // label
          );
          subcat.addOption(option);
          
        subcat = ytcenter.settingsPanel.createSubCategory("SETTINGS_SUBCAT_TOPSCROLLPLAYER"); cat.addSubCategory(subcat);
          option = ytcenter.settingsPanel.createOption(
            "topScrollPlayerEnabled", // defaultSetting
            "bool", // module
            "SETTINGS_TOPSCROLLPLAYER_ENABLED",
            null,
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#fullscreen-top-player"
          );
          subcat.addOption(option);
          
          option = ytcenter.settingsPanel.createOption(
            "topScrollPlayerActivated", // defaultSetting
            "bool", // module
            "SETTINGS_TOPSCROLLPLAYER_ACTIVATED",
            null,
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#activated-by-default"
          );
          subcat.addOption(option);
          
          option = ytcenter.settingsPanel.createOption(
            "topScrollPlayerEnabledOnlyVideoPlaying", // defaultSetting
            "bool", // module
            "SETTINGS_TOPSCROLLPLAYER_ONLYVIDEOPLAYING",
            null,
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#only-when-video-is-playing"
          );
          subcat.addOption(option);
          
          option = ytcenter.settingsPanel.createOption(
            "topScrollPlayerScrollUpToExit", // defaultSetting
            "bool", // module
            "SETTINGS_TOPSCROLLPLAYER_SCROLLUPEXIT",
            null,
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#scroll-up-to-exit-mode"
          );
          subcat.addOption(option);
          
          option = ytcenter.settingsPanel.createOption(
            "topScrollPlayerAnimation", // defaultSetting
            "bool", // module
            "SETTINGS_TOPSCROLLPLAYER_ANIMATION",
            null,
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#enable-animations"
          );
          subcat.addOption(option);
          
          /*option = ytcenter.settingsPanel.createOption(
            "topScrollPlayerHideScrollbar", // defaultSetting
            "bool", // module
            "SETTINGS_TOPSCROLLPLAYER_HIDESCROLLBAR",
            null,
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#hide-scrollbar"
          );
          subcat.addOption(option);*/
          
          option = ytcenter.settingsPanel.createOption(
            "topScrollPlayerCountIncreaseBefore", // defaultSetting
            "bool", // module
            "SETTINGS_TOPSCROLLPLAYER_COUNTINCREASEBEFORE",
            null,
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#increase-counter-by-scrolling-to-the-top-of-the-page"
          );
          subcat.addOption(option);
          
          option = ytcenter.settingsPanel.createOption(
            "topScrollPlayerTimesToEnter", // defaultSetting
            "rangetext", // module
            "SETTINGS_TOPSCROLLPLAYER_TIMESTOENTER", // label
            {
              "min": 0,
              "max": 20
            },
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#amount-to-enter"
          );
          subcat.addOption(option);
          
          option = ytcenter.settingsPanel.createOption(
            "topScrollPlayerTimesToExit", // defaultSetting
            "rangetext", // module
            "SETTINGS_TOPSCROLLPLAYER_TIMESTOEXIT", // label
            {
              "min": 0,
              "max": 20
            },
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#amount-to-exit"
          );
          subcat.addOption(option);
          
          option = ytcenter.settingsPanel.createOption(
            "topScrollPlayerBumpTimer", // defaultSetting
            "rangetext", // module
            "SETTINGS_TOPSCROLLPLAYER_BUMPTIMER", // label
            {
              "min": 0,
              "max": 10000
            },
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#counter-reset-after"
          );
          subcat.addOption(option);

      /* Category:External Players */
      cat = ytcenter.settingsPanel.createCategory("SETTINGS_CAT_EXTERNAL_PLAYERS");
        subcat = ytcenter.settingsPanel.createSubCategory("SETTINGS_SUBCAT_EMBED"); cat.addSubCategory(subcat);
          option = ytcenter.settingsPanel.createOption(
            "embed_enabled",
            "bool",
            "SETTINGS_EMBEDS_ENABLE"
          );
          subcat.addOption(option);
          
          // embedWriteEmbedMethod
          option = ytcenter.settingsPanel.createOption(
            "embedWriteEmbedMethod",
            "list",
            "SETTINGS_EMBEDS_WRITEMETHOD",
            {
              "list": [
                {
                  "value": "standard",
                  "label": "SETTINGS_EMBEDS_WRITEMETHOD_STANDARD"
                }, {
                  "value": "test1",
                  "label": "SETTINGS_EMBEDS_WRITEMETHOD_TEST1"
                }, {
                  "value": "test2",
                  "label": "SETTINGS_EMBEDS_WRITEMETHOD_TEST2"
                }, {
                  "value": "test3",
                  "label": "SETTINGS_EMBEDS_WRITEMETHOD_TEST3"
                }, {
                  "value": "standard+reload",
                  "label": "SETTINGS_EMBEDS_WRITEMETHOD_STANDARDRELOAD"
                }, {
                  "value": "test1+reload",
                  "label": "SETTINGS_EMBEDS_WRITEMETHOD_TEST1RELOAD"
                }, {
                  "value": "test2+reload",
                  "label": "SETTINGS_EMBEDS_WRITEMETHOD_TEST2RELOAD"
                }, {
                  "value": "test3+reload",
                  "label": "SETTINGS_EMBEDS_WRITEMETHOD_TEST3RELOAD"
                }, {
                  "value": "test4",
                  "label": "SETTINGS_EMBEDS_WRITEMETHOD_TEST4"
                }, {
                  "value": "test5",
                  "label": "SETTINGS_EMBEDS_WRITEMETHOD_TEST5"
                }
              ]
            }
          );
          subcat.addOption(option);
          option = ytcenter.settingsPanel.createOption(
            "embedWriteEmbedMethodReloadDelay",
            "rangetext",
            "SETTINGS_EMBEDS_WRITEMETHOD_RELOADDELAY",
            {
              "min": 0,
              "max": 10000,
              "suffix": " ms"
            }
          );
          ytcenter.events.addEvent("settings-update", (function(opt){
            return function(){ opt.setVisibility(ytcenter.settings.embedWriteEmbedMethod.indexOf("+reload") !== -1); };
          })(option));
          subcat.addOption(option);
          
          option = ytcenter.settingsPanel.createOption(
            null,
            "line"
          );
          subcat.addOption(option);
          
          option = ytcenter.settingsPanel.createOption(
            "embed_dashPlayback",
            "bool",
            "SETTINGS_DASHPLAYBACK",
            null,
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#dash-playback"
          );
          subcat.addOption(option);
          
          option = ytcenter.settingsPanel.createOption(
            "embed_forcePlayerType",
            "list",
            "SETTINGS_FORCEPLAYERTYPE",
            {
              "list": [
                { "value": "default", "label": "SETTINGS_FORCEPLAYERTYPE_DEFAULT" },
                { "value": "flash", "label": "SETTINGS_FORCEPLAYERTYPE_FLASH" },
                { "value": "html5", "label": "SETTINGS_FORCEPLAYERTYPE_HTML5" }
              ]
            }
          );
          subcat.addOption(option);
          
          option = ytcenter.settingsPanel.createOption(
            "embed_autohide",
            "list",
            "SETTINGS_AUTOHIDECONTROLBAR_LABEL",
            {
              "list": [
                {
                  "value": "0",
                  "label": "SETTINGS_AUTOHIDECONTROLBAR_LIST_NONE"
                }, {
                  "value": "1",
                  "label": "SETTINGS_AUTOHIDECONTROLBAR_LIST_BOTH"
                }, {
                  "value": "2",
                  "label": "SETTINGS_AUTOHIDECONTROLBAR_LIST_PROGRESSBAR"
                }, {
                  "value": "3",
                  "label": "SETTINGS_AUTOHIDECONTROLBAR_LIST_CONTROLBAR"
                }
              ],
              "listeners" : [
                {
                  "event": "update",
                  "callback": function(){
                    if (ytcenter.getPage() === "embed") {
                      ytcenter.player.setAutoHide(ytcenter.settings.embed_autohide);
                    }
                  }
                }
              ]
            }
          );
          subcat.addOption(option);
          
          option = ytcenter.settingsPanel.createOption(
            "embed_playerTheme",
            "list",
            "SETTINGS_PLAYERTHEME_LABEL",
            {
              "list": [
                {
                  "value": "dark",
                  "label": "SETTINGS_PLAYERTHEME_DARK"
                }, {
                  "value": "light",
                  "label": "SETTINGS_PLAYERTHEME_LIGHT"
                }
              ],
              "listeners" : [
                {
                  "event": "update",
                  "callback": function(){
                    if (ytcenter.getPage() === "embed") {
                      ytcenter.player.setTheme(ytcenter.settings.embed_playerTheme);
                    }
                  }
                }
              ]
            }
          );
          subcat.addOption(option);
          
          option = ytcenter.settingsPanel.createOption(
            "embed_playerColor",
            "list",
            "SETTINGS_PLAYERCOLOR_LABEL",
            {
              "list": [
                {
                  "value": "red",
                  "label": "SETTINGS_PLAYERCOLOR_RED"
                }, {
                  "value": "white",
                  "label": "SETTINGS_PLAYERCOLOR_WHITE"
                }
              ],
              "listeners" : [
                {
                  "event": "update",
                  "callback": function(){
                    if (ytcenter.getPage() === "embed") {
                      ytcenter.player.setProgressColor(ytcenter.settings.embed_playerColor);
                    }
                  }
                }
              ]
            }
          );
          subcat.addOption(option);
          
          option = ytcenter.settingsPanel.createOption(
            "embed_flashWMode",
            "list",
            "SETTINGS_WMODE_LABEL",
            {
              "list": [
                {
                  "value": "none",
                  "label": "SETTINGS_WMODE_NONE"
                }, {
                  "value": "window",
                  "label": "SETTINGS_WMODE_WINDOW"
                }, {
                  "value": "direct",
                  "label": "SETTINGS_WMODE_DIRECT"
                }, {
                  "value": "opaque",
                  "label": "SETTINGS_WMODE_OPAQUE"
                }, {
                  "value": "transparent",
                  "label": "SETTINGS_WMODE_TRANSPARENT"
                }, {
                  "value": "gpu",
                  "label": "SETTINGS_WMODE_GPU"
                }
              ]
            }
          );
          subcat.addOption(option);
          
          option = ytcenter.settingsPanel.createOption(
            "embed_enableAnnotations",
            "bool",
            "SETTINGS_ENABLEANNOTATIONS_LABEL"
          );
          subcat.addOption(option);
          
          option = ytcenter.settingsPanel.createOption(
            null,
            "line"
          );
          subcat.addOption(option);
          
          option = ytcenter.settingsPanel.createOption(
            "embed_enableAutoVideoQuality",
            "bool",
            "SETTINGS_ENABLEAUTORESOLUTION_LABEL"
          );
          subcat.addOption(option);
          
          option = ytcenter.settingsPanel.createOption(
            "embed_autoVideoQuality",
            "list",
            "SETTINGS_AUTORESOLUTION_LABEL",
            {
              "list": [
                {
                  "value": "highres",
                  "label": "SETTINGS_HIGHRES"
                }, {
                  "value": "hd1440",
                  "label": "SETTINGS_HD1440"
                }, {
                  "value": "hd1080",
                  "label": "SETTINGS_HD1080"
                }, {
                  "value": "hd720",
                  "label": "SETTINGS_HD720"
                }, {
                  "value": "large",
                  "label": "SETTINGS_LARGE"
                }, {
                  "value": "medium",
                  "label": "SETTINGS_MEDIUM"
                }, {
                  "value": "small",
                  "label": "SETTINGS_SMALL"
                }, {
                  "value": "tiny",
                  "label": "SETTINGS_TINY"
                }
              ]
            }
          );
          subcat.addOption(option);
          
          option = ytcenter.settingsPanel.createOption(
            null,
            "line"
          );
          subcat.addOption(option);
          
          option = ytcenter.settingsPanel.createOption(
            "embed_defaultAutoplay",
            "bool",
            "SETTINGS_DEFAULT_AUTOPLAY"
          );
          subcat.addOption(option);
          
          option = ytcenter.settingsPanel.createOption(
            "embed_preventAutoPlay",
            "bool",
            "SETTINGS_PREVENTAUTOPLAY_LABEL"
          );
          option.setVisibility(!ytcenter.settings.embed_defaultAutoplay);
          ytcenter.events.addEvent("settings-update", (function(opt){
            return function(){ opt.setVisibility(!ytcenter.settings.embed_defaultAutoplay); };
          })(option));
          subcat.addOption(option);
          
          option = ytcenter.settingsPanel.createOption(
            "embed_preventAutoBuffer",
            "bool",
            "SETTINGS_PREVENTAUTOBUFFERING_LABEL"
          );
          option.setVisibility(!ytcenter.settings.embed_defaultAutoplay);
          ytcenter.events.addEvent("settings-update", (function(opt){
            return function(){ opt.setVisibility(!ytcenter.settings.embed_defaultAutoplay); };
          })(option));
          subcat.addOption(option);
          
          option = ytcenter.settingsPanel.createOption(
            null,
            "line"
          );
          subcat.addOption(option);
          
          option = ytcenter.settingsPanel.createOption(
            "embed_enableVolume",
            "bool",
            "SETTINGS_VOLUME_ENABLE"
          );
          subcat.addOption(option);
          
          option = ytcenter.settingsPanel.createOption(
            "embed_volume",
            "rangetext",
            "SETTINGS_VOLUME_LABEL",
            {
              "min": 0,
              "max": 100,
              "suffix": "%"
            }
          );
          subcat.addOption(option);
          
          option = ytcenter.settingsPanel.createOption(
            "embed_mute",
            "bool",
            "SETTINGS_MUTE_LABEL"
          );
          subcat.addOption(option);
        subcat = ytcenter.settingsPanel.createSubCategory("SETTINGS_SUBCAT_CHANNEL"); cat.addSubCategory(subcat);
          option = ytcenter.settingsPanel.createOption(
            "embed_dashPlayback",
            "bool",
            "SETTINGS_DASHPLAYBACK",
            null,
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#dash-playback"
          );
          subcat.addOption(option);
          
          option = ytcenter.settingsPanel.createOption(
            "channel_autohide",
            "list",
            "SETTINGS_AUTOHIDECONTROLBAR_LABEL",
            {
              "list": [
                {
                  "value": "0",
                  "label": "SETTINGS_AUTOHIDECONTROLBAR_LIST_NONE"
                }, {
                  "value": "1",
                  "label": "SETTINGS_AUTOHIDECONTROLBAR_LIST_BOTH"
                }, {
                  "value": "2",
                  "label": "SETTINGS_AUTOHIDECONTROLBAR_LIST_PROGRESSBAR"
                }, {
                  "value": "3",
                  "label": "SETTINGS_AUTOHIDECONTROLBAR_LIST_CONTROLBAR"
                }
              ],
              "listeners" : [
                {
                  "event": "update",
                  "callback": function(){
                    if (ytcenter.getPage() === "embed") {
                      ytcenter.player.setAutoHide(ytcenter.settings.channel_autohide);
                    }
                  }
                }
              ]
            }
          );
          subcat.addOption(option);
          
          option = ytcenter.settingsPanel.createOption(
            "channel_playerTheme",
            "list",
            "SETTINGS_PLAYERTHEME_LABEL",
            {
              "list": [
                {
                  "value": "dark",
                  "label": "SETTINGS_PLAYERTHEME_DARK"
                }, {
                  "value": "light",
                  "label": "SETTINGS_PLAYERTHEME_LIGHT"
                }
              ],
              "listeners" : [
                {
                  "event": "update",
                  "callback": function(){
                    if (ytcenter.getPage() === "embed") {
                      ytcenter.player.setTheme(ytcenter.settings.channel_playerTheme);
                    }
                  }
                }
              ]
            }
          );
          subcat.addOption(option);
          
          option = ytcenter.settingsPanel.createOption(
            "channel_playerColor",
            "list",
            "SETTINGS_PLAYERCOLOR_LABEL",
            {
              "list": [
                {
                  "value": "red",
                  "label": "SETTINGS_PLAYERCOLOR_RED"
                }, {
                  "value": "white",
                  "label": "SETTINGS_PLAYERCOLOR_WHITE"
                }
              ],
              "listeners" : [
                {
                  "event": "update",
                  "callback": function(){
                    if (ytcenter.getPage() === "embed") {
                      ytcenter.player.setProgressColor(ytcenter.settings.channel_playerColor);
                    }
                  }
                }
              ]
            }
          );
          subcat.addOption(option);
          
          option = ytcenter.settingsPanel.createOption(
            "channel_flashWMode",
            "list",
            "SETTINGS_WMODE_LABEL",
            {
              "list": [
                {
                  "value": "none",
                  "label": "SETTINGS_WMODE_NONE"
                }, {
                  "value": "window",
                  "label": "SETTINGS_WMODE_WINDOW"
                }, {
                  "value": "direct",
                  "label": "SETTINGS_WMODE_DIRECT"
                }, {
                  "value": "opaque",
                  "label": "SETTINGS_WMODE_OPAQUE"
                }, {
                  "value": "transparent",
                  "label": "SETTINGS_WMODE_TRANSPARENT"
                }, {
                  "value": "gpu",
                  "label": "SETTINGS_WMODE_GPU"
                }
              ]
            }
          );
          subcat.addOption(option);
          
          option = ytcenter.settingsPanel.createOption(
            "channel_enableAnnotations",
            "bool",
            "SETTINGS_ENABLEANNOTATIONS_LABEL"
          );
          subcat.addOption(option);
          
          option = ytcenter.settingsPanel.createOption(
            null,
            "line"
          );
          subcat.addOption(option);
          
          option = ytcenter.settingsPanel.createOption(
            "channel_enableAutoVideoQuality",
            "bool",
            "SETTINGS_ENABLEAUTORESOLUTION_LABEL"
          );
          subcat.addOption(option);
          
          option = ytcenter.settingsPanel.createOption(
            "channel_autoVideoQuality",
            "list",
            "SETTINGS_AUTORESOLUTION_LABEL",
            {
              "list": [
                {
                  "value": "highres",
                  "label": "SETTINGS_HIGHRES"
                }, {
                  "value": "hd1440",
                  "label": "SETTINGS_HD1440"
                }, {
                  "value": "hd1080",
                  "label": "SETTINGS_HD1080"
                }, {
                  "value": "hd720",
                  "label": "SETTINGS_HD720"
                }, {
                  "value": "large",
                  "label": "SETTINGS_LARGE"
                }, {
                  "value": "medium",
                  "label": "SETTINGS_MEDIUM"
                }, {
                  "value": "small",
                  "label": "SETTINGS_SMALL"
                }, {
                  "value": "tiny",
                  "label": "SETTINGS_TINY"
                }
              ]
            }
          );
          subcat.addOption(option);
          
          option = ytcenter.settingsPanel.createOption(
            null,
            "line"
          );
          subcat.addOption(option);
          
          option = ytcenter.settingsPanel.createOption(
            "channel_preventAutoPlay",
            "bool",
            "SETTINGS_PREVENTAUTOPLAY_LABEL"
          );
          subcat.addOption(option);
          
          option = ytcenter.settingsPanel.createOption(
            "channel_preventAutoBuffer",
            "bool",
            "SETTINGS_PREVENTAUTOBUFFERING_LABEL"
          );
          subcat.addOption(option);
          
          option = ytcenter.settingsPanel.createOption(
            null,
            "line"
          );
          subcat.addOption(option);
          
          option = ytcenter.settingsPanel.createOption(
            "channel_enableVolume",
            "bool",
            "SETTINGS_VOLUME_ENABLE"
          );
          subcat.addOption(option);
          
          option = ytcenter.settingsPanel.createOption(
            "channel_volume",
            "rangetext",
            "SETTINGS_VOLUME_LABEL",
            {
              "min": 0,
              "max": 100,
              "suffix": "%"
            }
          );
          subcat.addOption(option);
          
          option = ytcenter.settingsPanel.createOption(
            "channel_mute",
            "bool",
            "SETTINGS_MUTE_LABEL"
          );
          subcat.addOption(option);

      /* Category:Download */
      cat = ytcenter.settingsPanel.createCategory("SETTINGS_CAT_DOWNLOAD");
        subcat = ytcenter.settingsPanel.createSubCategory("SETTINGS_TAB_GENERAL"); cat.addSubCategory(subcat);
          option = ytcenter.settingsPanel.createOption(
            "downloadQuality",
            "list",
            "SETTINGS_DOWNLOADQUALITY_LABEL",
            {
              "list": [
                {
                  "value": "highres",
                  "label": "SETTINGS_HIGHRES"
                }, {
                  "value": "hd1440",
                  "label": "SETTINGS_HD1440"
                }, {
                  "value": "hd1080",
                  "label": "SETTINGS_HD1080"
                }, {
                  "value": "hd720",
                  "label": "SETTINGS_HD720"
                }, {
                  "value": "large",
                  "label": "SETTINGS_LARGE"
                }, {
                  "value": "medium",
                  "label": "SETTINGS_MEDIUM"
                }, {
                  "value": "small",
                  "label": "SETTINGS_SMALL"
                }
              ],
              "listeners": [
                {
                  "event": "update",
                  "callback": function(){
                    ytcenter.events.performEvent("ui-refresh");
                  }
                }
              ]
            },
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#quality-1"
          );
          subcat.addOption(option);
          option = ytcenter.settingsPanel.createOption(
            "downloadFormat",
            "list",
            "SETTINGS_DOWNLOADFORMAT_LABEL",
            {
              "list": [
                {
                  "value": "mp4",
                  "label": "SETTINGS_DOWNLOADFORMAT_LIST_MP4"
                }, {
                  "value": "webm",
                  "label": "SETTINGS_DOWNLOADFORMAT_LIST_WEBM"
                }, {
                  "value": "flv",
                  "label": "SETTINGS_DOWNLOADFORMAT_LIST_FLV"
                }, {
                  "value": "3gp",
                  "label": "SETTINGS_DOWNLOADFORMAT_LIST_3GP"
                }
              ],
              "listeners": [
                {
                  "event": "update",
                  "callback": function(){
                    ytcenter.events.performEvent("ui-refresh");
                  }
                }
              ]
            },
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#format"
          );
          subcat.addOption(option);
          option = ytcenter.settingsPanel.createOption(
            "downloadAsLinks",
            "bool",
            "SETTINGS_DOWNLOADASLINKS_LABEL",
            {
              "listeners": [
                {
                  "event": "click",
                  "callback": function(){
                    ytcenter.events.performEvent("ui-refresh");
                  }
                }
              ]
            },
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#download-as-links"
          );
          subcat.addOption(option);
          option = ytcenter.settingsPanel.createOption(
            "show3DInDownloadMenu",
            "bool",
            "SETTINGS_SHOW3DINDOWNLOADMENU_LABEL",
            {
              "listeners": [
                {
                  "event": "click",
                  "callback": function(){
                    ytcenter.events.performEvent("ui-refresh");
                  }
                }
              ]
            },
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#show-3d-in-download-menu"
          );
          subcat.addOption(option);
          option = ytcenter.settingsPanel.createOption(
            "filename",
            "textfield",
            "SETTINGS_FILENAME_LABEL",
            {
              "listeners": [
                {
                  "event": "change",
                  "callback": function(){
                    ytcenter.events.performEvent("ui-refresh");
                  }
                }
              ]
            },
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#filename"
          );
          subcat.addOption(option);
          option = ytcenter.settingsPanel.createOption(
            "fixfilename",
            "bool",
            "SETTINGS_FIXDOWNLOADFILENAME_LABEL",
            {
              "listeners": [
                {
                  "event": "click",
                  "callback": function(){
                    ytcenter.events.performEvent("ui-refresh");
                  }
                }
              ]
            },
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#remove-non-alphanumeric-characters"
          );
          subcat.addOption(option);
        subcat = ytcenter.settingsPanel.createSubCategory("SETTINGS_SUBCAT_MP3SERVICES"); cat.addSubCategory(subcat);
          option = ytcenter.settingsPanel.createOption(
            "mp3Services",
            "multilist",
            "SETTINGS_MP3SERVICES_LABEL",
            {
              "list": ytcenter.mp3services,
              "listeners": [
                {
                  "event": "update",
                  "callback": function(){
                    ytcenter.events.performEvent("ui-refresh");
                  }
                }
              ]
            },
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#mp3-services"
          );
          option.setModuleStyle("display", "block");
          subcat.addOption(option);

      /* Category:Repeat */
      cat = ytcenter.settingsPanel.createCategory("SETTINGS_CAT_REPEAT");
        subcat = ytcenter.settingsPanel.createSubCategory("SETTINGS_TAB_GENERAL"); cat.addSubCategory(subcat);
          option = ytcenter.settingsPanel.createOption(
            "autoActivateRepeat",
            "bool",
            "SETTINGS_AUTOACTIVATEREPEAT_LABEL",
            null,
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#auto-activate-repeat"
          );
          subcat.addOption(option);
          option = ytcenter.settingsPanel.createOption(
            "repeatShowIcon",
            "bool",
            "SETTINGS_REPEAT_SHOW_ICON",
            {
              "listeners": [
                {
                  "event": "click",
                  "callback": function(){
                    ytcenter.events.performEvent("ui-refresh");
                  }
                }
              ]
            },
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#show-icon"
          );
          subcat.addOption(option);


      /* Category:UI */
      cat = ytcenter.settingsPanel.createCategory("SETTINGS_CAT_UI");
        subcat = ytcenter.settingsPanel.createSubCategory("SETTINGS_TAB_GENERAL"); cat.addSubCategory(subcat);
          option = ytcenter.settingsPanel.createOption(
            "guideMode",
            "list",
            "SETTINGS_GUIDEMODE",
            {
              "list": [
                {
                  "value": "default",
                  "label": "SETTINGS_GUIDEMODE_DEFAULT"
                }, {
                  "value": "always_open",
                  "label": "SETTINGS_GUIDEMODE_ALWAYS_OPEN"
                }, {
                  "value": "always_closed",
                  "label": "SETTINGS_GUIDEMODE_ALWAYS_CLOSED"
                }
              ]
            },
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#guide-mode"
          );
          subcat.addOption(option);
          option = ytcenter.settingsPanel.createOption(
            "watch7playerguidealwayshide",
            "bool",
            "SETTINGS_GUIDE_ALWAYS_HIDE",
            {
              "listeners": [
                {
                  "event": "click",
                  "callback": function(){
                    ytcenter.guide.hidden = ytcenter.settings.watch7playerguidealwayshide;
                    ytcenter.guide.update();
                    ytcenter.player._updateResize();
                    ytcenter.classManagement.applyClasses();
                  }
                }
              ]
            },
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#guide-mode"
          );
          subcat.addOption(option);
          option = ytcenter.settingsPanel.createOption(
            "watch7playerguidehide",
            "bool",
            "SETTINGS_WATCH7_PLAYER_GUIDE_HIDE",
            {
              "listeners": [
                {
                  "event": "click",
                  "callback": function(){
                    ytcenter.player._updateResize();
                  }
                }
              ]
            }
          );
          subcat.addOption(option);
          option = ytcenter.settingsPanel.createOption(
            "playerDarkSideBG",
            "bool",
            "SETTINGS_PLAYER_DARK_SIDE",
            {
              "listeners": [
                {
                  "event": "click",
                  "callback": function(){
                    ytcenter.classManagement.applyClasses();
                  }
                }
              ]
            }
          );
          subcat.addOption(option);
          option = ytcenter.settingsPanel.createOption(
            "playerDarkSideBGColor",
            "colorpicker",
            "SETTINGS_PLAYER_DARK_SIDE_COLOR",
            {
              "presetColors": ["#1b1b1b", "#444444"],
              "listeners": [
                {
                  "event": "click",
                  "callback": function(){
                    ytcenter.classManagement.applyClasses();
                  }
                }
              ]
            }
          );
          option.addEventListener("update", function(){
            ytcenter.classManagement.applyClasses();
          });
          subcat.addOption(option);
          
          option = ytcenter.settingsPanel.createOption(
            null,
            "line",
            null
          );
          subcat.addOption(option);
          
          option = ytcenter.settingsPanel.createOption(
            "uploaderCountryEnabled", // defaultSetting
            "bool", // module
            "SETTINGS_UPLOADER_COUNTRY_FLAG_ENABLE"
          );
          subcat.addOption(option);

          option = ytcenter.settingsPanel.createOption(
            "uploaderCountryShowFlag", // defaultSetting
            "bool", // module
            "SETTINGS_UPLOADER_COUNTRY_FLAG_SHOW_FLAG" // label
          );
          subcat.addOption(option);
          
          option = ytcenter.settingsPanel.createOption(
            "uploaderCountryUseNames", // defaultSetting
            "bool", // module
            "SETTINGS_UPLOADER_COUNTRY_FLAG_USE_NAME" // label
          );
          subcat.addOption(option);
          
          option = ytcenter.settingsPanel.createOption(
            "uploaderCountryPosition", // defaultSetting
            "list", // module
            "SETTINGS_UPLOADER_COUNTRY_FLAG_POSITION", // label
            {
              "list": [
                {
                  "value": "before_username",
                  "label": "SETTINGS_UPLOADER_COUNTRY_FLAG_POSITION_BEFORE_USERNAME"
                }, {
                  "value": "after_username",
                  "label": "SETTINGS_UPLOADER_COUNTRY_FLAG_POSITION_AFTER_USERNAME"
                }, {
                  "value": "last",
                  "label": "SETTINGS_UPLOADER_COUNTRY_FLAG_POSITION_LAST"
                }
              ]
            }
          );
          subcat.addOption(option);
          
        subcat = ytcenter.settingsPanel.createSubCategory("SETTINGS_SUBCAT_RATINGBAR"); cat.addSubCategory(subcat);
          option = ytcenter.settingsPanel.createOption(
            "sparkbarLikesColor", // defaultSetting
            "colorpicker", // module
            "SETTINGS_SPARKBAR_LIKES_COLOR",
            {
              "presetColors": ["#590", "#ccc", "#f00", "#2793e6", "#ff8f00"]
            }
          );
          option.addEventListener("update", function(){
            var wvi = document.getElementById("watch7-views-info"),
                sl = document.getElementsByClassName("video-extras-sparkbar-likes");
            if (sl && sl.length > 0 && sl[0]) {
              sl[0].style.background = ytcenter.settings.sparkbarLikesColor;
            }
          });
          subcat.addOption(option);
        
          option = ytcenter.settingsPanel.createOption(
            "sparkbarDislikesColor", // defaultSetting
            "colorpicker", // module
            "SETTINGS_SPARKBAR_DISLIKES_COLOR",
            {
              "presetColors": ["#590", "#ccc", "#f00", "#2793e6", "#ff8f00"]
            }
          );
          option.addEventListener("update", function(){
            var wvi = document.getElementById("watch7-views-info"),
                sd = document.getElementsByClassName("video-extras-sparkbar-dislikes");
            if (sd && sd.length > 0 && sd[0]) {
              sd[0].style.background = ytcenter.settings.sparkbarDislikesColor;
            }
          });
          subcat.addOption(option);
          
          option = ytcenter.settingsPanel.createOption(
            "sparkbarHeight", // defaultSetting
            "rangetext", // module
            "SETTINGS_SPARKBAR_HEIGHT", // label
            {
              "min": 1,
              "max": 100,
              "suffix": "px"
            }
          );
          option.addEventListener("update", function(){
            var wvi = document.getElementById("watch7-views-info"),
                sl = document.getElementsByClassName("video-extras-sparkbar-likes"),
                sd = document.getElementsByClassName("video-extras-sparkbar-dislikes");
            if (sl && sd && sl.length > 0 && sd.length > 0 && sl[0] && sd[0]) {
              sl[0].style.height = ytcenter.settings.sparkbarHeight + "px";
              sd[0].style.height = ytcenter.settings.sparkbarHeight + "px";
              sd[0].parentNode.style.height = ytcenter.settings.sparkbarHeight + "px";
            }
          });
          subcat.addOption(option);
          
          
        subcat = ytcenter.settingsPanel.createSubCategory("SETTINGS_SUBCAT_PLACEMENT"); cat.addSubCategory(subcat);
          option = ytcenter.settingsPanel.createOption(
            "enableDownload",
            "bool",
            "SETTINGS_ENABLEDOWNLOAD_LABEL",
            {
              "listeners": [
                {
                  "event": "click",
                  "callback": function(){
                    ytcenter.events.performEvent("ui-refresh");
                  }
                }
              ]
            },
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#placement"
          );
          subcat.addOption(option);
          option = ytcenter.settingsPanel.createOption(
            "enableRepeat",
            "bool",
            "SETTINGS_ENABLEREPEAT_LABEL",
            {
              "listeners": [
                {
                  "event": "click",
                  "callback": function(){
                    ytcenter.events.performEvent("ui-refresh");
                  }
                }
              ]
            },
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#placement"
          );
          subcat.addOption(option);
          option = ytcenter.settingsPanel.createOption(
            "lightbulbEnable",
            "bool",
            "SETTINGS_LIGHTBULB_ENABLE",
            {
              "listeners": [
                {
                  "event": "click",
                  "callback": function(){
                    ytcenter.events.performEvent("ui-refresh");
                  }
                }
              ]
            },
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#placement"
          );
          subcat.addOption(option);
          option = ytcenter.settingsPanel.createOption(
            "resizeEnable",
            "bool",
            "SETTINGS_RESIZE_ENABLE",
            {
              "listeners": [
                {
                  "event": "click",
                  "callback": function(){
                    ytcenter.events.performEvent("ui-refresh");
                  }
                }
              ]
            },
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#placement"
          );
          subcat.addOption(option);
          option = ytcenter.settingsPanel.createOption(
            "aspectEnable",
            "bool",
            "SETTINGS_ASPECT_ENABLE",
            {
              "listeners": [
                {
                  "event": "click",
                  "callback": function(){
                    ytcenter.events.performEvent("ui-refresh");
                  }
                }
              ]
            },
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#placement"
          );
          subcat.addOption(option);
          
          option = ytcenter.settingsPanel.createOption(
            null,
            "newline"
          );
          option.setVisibility(ytcenter.getPage() === "watch");
          ytcenter.events.addEvent("ui-refresh", function(){
            this.setVisibility(ytcenter.getPage() === "watch");
          }.bind(option));
          subcat.addOption(option);
          
          option = ytcenter.settingsPanel.createOption(
            null,
            "button",
            null,
            {
              "text": "SETTINGS_PLACEMENTSYSTEM_MOVEELEMENTS_LABEL"
            }
          );
          option.addModuleEventListener("click", function(){
            if (ytcenter.placementsystem.toggleEnable()) {
              ytcenter.utils.addClass(this, "yt-uix-button-toggled");
              ytcenter.utils.addClass(document.body, "ytcenter-placementsystem-activated");
              ytcenter.settingsPanelDialog.setVisibility(false);
            } else {
              ytcenter.utils.removeClass(this, "yt-uix-button-toggled");
              ytcenter.utils.removeClass(document.body, "ytcenter-placementsystem-activated");
            }
          });
          option.setVisibility(ytcenter.getPage() === "watch");
          ytcenter.events.addEvent("ui-refresh", function(){
            this.setVisibility(ytcenter.getPage() === "watch");
          }.bind(option));
          subcat.addOption(option);
          
          option = ytcenter.settingsPanel.createOption(
            null,
            "textContent",
            null,
            {
              "textlocale": "SETTINGS_PLACEMENTSYSTEM_MOVEELEMENTS_INSTRUCTIONS",
              "styles": {
                "margin-left": "20px"
              }
            }
          );
          option.setVisibility(ytcenter.getPage() === "watch");
          ytcenter.events.addEvent("ui-refresh", function(){
            this.setVisibility(ytcenter.getPage() === "watch");
          }.bind(option));
          subcat.addOption(option);

        subcat = ytcenter.settingsPanel.createSubCategory("SETTINGS_SUBCAT_LIGHTSOFF"); cat.addSubCategory(subcat);
          option = ytcenter.settingsPanel.createOption(
            "lightbulbAutoOff", // defaultSetting
            "bool", // module
            "SETTINGS_LIGHTBULB_AUTO", // label
            null,
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#lights-off"
          );
          subcat.addOption(option);
          option = ytcenter.settingsPanel.createOption(
            "lightbulbClickThrough", // defaultSetting
            "bool", // module
            "SETTINGS_LIGHTBULB_CLICK_THROUGH", // label
            null,
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#click-through"
          );
          option.addEventListener("update", function(){
            ytcenter.tmp.lightoffwarning();
          });
          subcat.addOption(option);
          option = ytcenter.settingsPanel.createOption(
            "lightbulbBackgroundColor", // defaultSetting
            "colorpicker", // module
            "SETTINGS_LIGHTBULB_COLOR",
            {
              "presetColors": ["#000", "#fff", "#590", "#ccc", "#f00", "#2793e6", "#ff8f00"]
            }
          );
          subcat.addOption(option);
          option = ytcenter.settingsPanel.createOption(
            "lightbulbBackgroundOpaque", // defaultSetting
            "rangetext", // module
            "SETTINGS_LIGHTBULB_TRANSPARENCY",
            {
              "min": 0,
              "max": 100,
              "suffix": "%"
            }
          );
          subcat.addOption(option);
          
          (function(opt){
            option = ytcenter.settingsPanel.createOption(
              null, // defaultSetting
              "textContent", // module
              null,
              {
                "textlocale": "SETTINGS_LIGHTBULB_WARNING",
                "styles": {
                  "color": "#ff0000"
                }
              }
            );
            if (ytcenter.settings.lightbulbBackgroundOpaque > 90 && ytcenter.settings.lightbulbClickThrough) {
              option.setVisibility(true);
            } else {
              option.setVisibility(false);
            }
            opt.addEventListener("update", (function(o){
              ytcenter.tmp = ytcenter.tmp || {};
              ytcenter.tmp.lightoffwarning = function(){
                if (ytcenter.settings.lightbulbBackgroundOpaque > 90 && ytcenter.settings.lightbulbClickThrough) {
                  o.setVisibility(true);
                } else {
                  o.setVisibility(false);
                }
              };
              return ytcenter.tmp.lightoffwarning;
            })(option), false);
            subcat.addOption(option);
          })(option);
        
        subcat = ytcenter.settingsPanel.createSubCategory("SETTINGS_SUBCAT_VIDEO_THUMBNAIL"); cat.addSubCategory(subcat);
          // Animation
          option = ytcenter.settingsPanel.createOption(
            null, // defaultSetting
            "textContent", // module
            "SETTINGS_THUMBNAIL_ANIMATION", // label
            null,
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#animated-thumbnails"
          );
          option.setStyle("font-weight", "bold");
          subcat.addOption(option);
          
          option = ytcenter.settingsPanel.createOption(
            "videoThumbnailAnimationEnabled", // defaultSetting
            "bool", // module
            "SETTINGS_THUMBNAIL_ANIMATION_ENABLE" // label
          );
          option.setStyle("margin-left", "12px");
          subcat.addOption(option);
          
          option = ytcenter.settingsPanel.createOption(
            "videoThumbnailAnimationShuffle", // defaultSetting
            "bool", // module
            "SETTINGS_THUMBNAIL_ANIMATION_SHUFFLE", // label
            null,
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#shuffle"
          );
          option.setStyle("margin-left", "12px");
          subcat.addOption(option);
          
          option = ytcenter.settingsPanel.createOption(
            "videoThumbnailAnimationDelay", // defaultSetting
            "rangetext", // module
            "SETTINGS_THUMBNAIL_ANIMATION_DELAY", // label
            {
              "min": 250,
              "max": 5250,
              "suffix": " ms"
            },
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#delay"
          );
          option.setStyle("margin-left", "12px");
          subcat.addOption(option);
          
          option = ytcenter.settingsPanel.createOption(
            "videoThumbnailAnimationInterval", // defaultSetting
            "rangetext", // module
            "SETTINGS_THUMBNAIL_ANIMATION_INTERVAL", // label
            {
              "min": 0,
              "max": 5000,
              "suffix": " ms"
            },
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#interval"
          );
          option.setStyle("margin-left", "12px");
          subcat.addOption(option);
          
          option = ytcenter.settingsPanel.createOption(
            "videoThumbnailAnimationFallbackInterval", // defaultSetting
            "rangetext", // module
            "SETTINGS_THUMBNAIL_ANIMATION_FALLBACK_INTERVAL", // label
            {
              "min": 0,
              "max": 5000,
              "suffix": " ms"
            },
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#fallback-interval"
          );
          option.setStyle("margin-left", "12px");
          subcat.addOption(option);
          
          // Quality
          option = ytcenter.settingsPanel.createOption(
            null, // defaultSetting
            "textContent", // module
            "SETTINGS_THUMBVIDEO_QUALITY", // label
            null, // args
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#quality" // help
          );
          option.setStyle("font-weight", "bold");
          subcat.addOption(option);

          option = ytcenter.settingsPanel.createOption(
            "videoThumbnailQualityBar", // defaultSetting
            "bool", // module
            "SETTINGS_THUMBVIDEO_QUALITY_ENABLE" // label
          );
          option.setStyle("margin-left", "12px");
          subcat.addOption(option);

          option = ytcenter.settingsPanel.createOption(
            "videoThumbnailQualitySeparated", // defaultSetting
            "bool", // module
            "SETTINGS_THUMBVIDEO_QUALITY_DASHNONDASHSEPARATED" // label
          );
          option.setStyle("margin-left", "12px");
          subcat.addOption(option);

          option = ytcenter.settingsPanel.createOption(
            "videoThumbnailQualityPosition", // defaultSetting
            "list", // module
            "SETTINGS_THUMBVIDEO_POSITION", // label
            { // args
              "list": [
                {
                  "value": "topleft",
                  "label": "SETTINGS_THUMBVIDEO_POSITION_TOPLEFT"
                }, {
                  "value": "topright",
                  "label": "SETTINGS_THUMBVIDEO_POSITION_TOPRIGHT"
                }, {
                  "value": "bottomleft",
                  "label": "SETTINGS_THUMBVIDEO_POSITION_BOTTOMLEFT"
                }, {
                  "value": "bottomright",
                  "label": "SETTINGS_THUMBVIDEO_POSITION_BOTTOMRIGHT"
                }
              ],
              "listeners": [
                {
                  "event": "update",
                  "callback": function(){
                    ytcenter.events.performEvent("ui-refresh");
                  }
                }
              ]
            }
          );
          option.setStyle("margin-left", "12px");
          subcat.addOption(option);

          option = ytcenter.settingsPanel.createOption(
            "videoThumbnailQualityDownloadAt", // defaultSetting
            "list", // module
            "SETTINGS_THUMBVIDEO_DOWNLOAD", // label
            { // args
              "list": [
                {
                  "value": "page_start",
                  "label": "SETTINGS_THUMBVIDEO_DOWNLOAD_ONSTART"
                }, {
                  "value": "scroll_into_view",
                  "label": "SETTINGS_THUMBVIDEO_DOWNLOAD_INVIEW"
                }, {
                  "value": "hover_thumbnail",
                  "label": "SETTINGS_THUMBVIDEO_DOWNLOAD_ONHOVER"
                }
              ],
              "listeners": [
                {
                  "event": "update",
                  "callback": function(){
                    ytcenter.events.performEvent("ui-refresh");
                  }
                }
              ]
            }
          );
          option.setStyle("margin-left", "12px");
          subcat.addOption(option);

          option = ytcenter.settingsPanel.createOption(
            "videoThumbnailQualityVisible", // defaultSetting
            "list", // module
            "SETTINGS_THUMBVIDEO_VISIBLE", // label
            { // args
              "list": [
                {
                  "value": "always",
                  "label": "SETTINGS_THUMBVIDEO_ALWAYSVISIBLE"
                }, {
                  "value": "show_hover",
                  "label": "SETTINGS_THUMBVIDEO_SHOWONHOVER"
                }, {
                  "value": "hide_hover",
                  "label": "SETTINGS_THUMBVIDEO_HIDEONHOVER"
                }
              ],
              "listeners": [
                {
                  "event": "update",
                  "callback": function(){
                    ytcenter.events.performEvent("ui-refresh");
                  }
                }
              ]
            }
          );
          option.setStyle("margin-left", "12px");
          subcat.addOption(option);

          // Rating bar
          option = ytcenter.settingsPanel.createOption(
            null, // defaultSetting
            "textContent", // module
            "SETTINGS_THUMBVIDEO_RATING_BAR", // label
            null, // args
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#rating-bar" // help
          );
          option.setStyle("font-weight", "bold");
          subcat.addOption(option);

          option = ytcenter.settingsPanel.createOption(
            "videoThumbnailRatingsBar", // defaultSetting
            "bool", // module
            "SETTINGS_THUMBVIDEO_RATING_BAR_ENABLE" // label
          );
          option.setStyle("margin-left", "12px");
          subcat.addOption(option);

          option = ytcenter.settingsPanel.createOption(
            "videoThumbnailRatingsBarPosition", // defaultSetting
            "list", // module
            "SETTINGS_THUMBVIDEO_POSITION", // label
            { // args
              "list": [
                {
                  "value": "top",
                  "label": "SETTINGS_THUMBVIDEO_POSITION_TOP"
                }, {
                  "value": "bottom",
                  "label": "SETTINGS_THUMBVIDEO_POSITION_BOTTOM"
                }, {
                  "value": "left",
                  "label": "SETTINGS_THUMBVIDEO_POSITION_LEFT"
                }, {
                  "value": "right",
                  "label": "SETTINGS_THUMBVIDEO_POSITION_RIGHT"
                }
              ],
              "listeners": [
                {
                  "event": "update",
                  "callback": function(){
                    ytcenter.events.performEvent("ui-refresh");
                  }
                }
              ]
            }
          );
          option.setStyle("margin-left", "12px");
          subcat.addOption(option);

          option = ytcenter.settingsPanel.createOption(
            "videoThumbnailRatingsBarDownloadAt", // defaultSetting
            "list", // module
            "SETTINGS_THUMBVIDEO_DOWNLOAD", // label
            { // args
              "list": [
                {
                  "value": "page_start",
                  "label": "SETTINGS_THUMBVIDEO_DOWNLOAD_ONSTART"
                }, {
                  "value": "scroll_into_view",
                  "label": "SETTINGS_THUMBVIDEO_DOWNLOAD_INVIEW"
                }, {
                  "value": "hover_thumbnail",
                  "label": "SETTINGS_THUMBVIDEO_DOWNLOAD_ONHOVER"
                }
              ],
              "listeners": [
                {
                  "event": "update",
                  "callback": function(){
                    ytcenter.events.performEvent("ui-refresh");
                  }
                }
              ]
            }
          );
          option.setStyle("margin-left", "12px");
          subcat.addOption(option);

          option = ytcenter.settingsPanel.createOption(
            "videoThumbnailRatingsBarVisible", // defaultSetting
            "list", // module
            "SETTINGS_THUMBVIDEO_VISIBLE", // label
            { // args
              "list": [
                {
                  "value": "always",
                  "label": "SETTINGS_THUMBVIDEO_ALWAYSVISIBLE"
                }, {
                  "value": "show_hover",
                  "label": "SETTINGS_THUMBVIDEO_SHOWONHOVER"
                }, {
                  "value": "hide_hover",
                  "label": "SETTINGS_THUMBVIDEO_HIDEONHOVER"
                }
              ],
              "listeners": [
                {
                  "event": "update",
                  "callback": function(){
                    ytcenter.events.performEvent("ui-refresh");
                  }
                }
              ]
            }
          );
          option.setStyle("margin-left", "12px");
          subcat.addOption(option);
          
          option = ytcenter.settingsPanel.createOption(
            "videoThumbnailRatingsBarLikesColor", // defaultSetting
            "colorpicker", // module
            "SETTINGS_THUMBNAIL_SPARKBAR_LIKES_COLOR",
            {
              "presetColors": ["#590", "#ccc", "#f00", "#2793e6", "#ff8f00"]
            }
          );
          option.setStyle("margin-left", "12px");
          subcat.addOption(option);
          
          option = ytcenter.settingsPanel.createOption(
            "videoThumbnailRatingsBarDislikesColor", // defaultSetting
            "colorpicker", // module
            "SETTINGS_THUMBNAIL_SPARKBAR_DISLIKES_COLOR",
            {
              "presetColors": ["#590", "#ccc", "#f00", "#2793e6", "#ff8f00"]
            }
          );
          option.setStyle("margin-left", "12px");
          subcat.addOption(option);
          
          option = ytcenter.settingsPanel.createOption(
            "videoThumbnailRatingsBarHeight", // defaultSetting
            "rangetext", // module
            "SETTINGS_SPARKBAR_HEIGHT", // label
            {
              "min": 1,
              "max": 100,
              "suffix": "px"
            }
          );
          option.setStyle("margin-left", "12px");
          
          subcat.addOption(option);

          // Rating count
          option = ytcenter.settingsPanel.createOption(
            null, // defaultSetting
            "textContent", // module
            "SETTINGS_THUMBVIDEO_RATING_COUNT", // label
            null, // args
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#rating-count" // help
          );
          option.setStyle("font-weight", "bold");
          subcat.addOption(option);

          option = ytcenter.settingsPanel.createOption(
            "videoThumbnailRatingsCount", // defaultSetting
            "bool", // module
            "SETTINGS_THUMBVIDEO_RATING_COUNT_ENABLE" // label
          );
          option.setStyle("margin-left", "12px");
          subcat.addOption(option);

          option = ytcenter.settingsPanel.createOption(
            "videoThumbnailRatingsCountPosition", // defaultSetting
            "list", // module
            "SETTINGS_THUMBVIDEO_POSITION", // label
            { // args
              "list": [
                {
                  "value": "topleft",
                  "label": "SETTINGS_THUMBVIDEO_POSITION_TOPLEFT"
                }, {
                  "value": "topright",
                  "label": "SETTINGS_THUMBVIDEO_POSITION_TOPRIGHT"
                }, {
                  "value": "bottomleft",
                  "label": "SETTINGS_THUMBVIDEO_POSITION_BOTTOMLEFT"
                }, {
                  "value": "bottomright",
                  "label": "SETTINGS_THUMBVIDEO_POSITION_BOTTOMRIGHT"
                }
              ],
              "listeners": [
                {
                  "event": "update",
                  "callback": function(){
                    ytcenter.events.performEvent("ui-refresh");
                  }
                }
              ]
            }
          );
          option.setStyle("margin-left", "12px");
          subcat.addOption(option);

          option = ytcenter.settingsPanel.createOption(
            "videoThumbnailRatingsCountDownloadAt", // defaultSetting
            "list", // module
            "SETTINGS_THUMBVIDEO_DOWNLOAD", // label
            { // args
              "list": [
                {
                  "value": "page_start",
                  "label": "SETTINGS_THUMBVIDEO_DOWNLOAD_ONSTART"
                }, {
                  "value": "scroll_into_view",
                  "label": "SETTINGS_THUMBVIDEO_DOWNLOAD_INVIEW"
                }, {
                  "value": "hover_thumbnail",
                  "label": "SETTINGS_THUMBVIDEO_DOWNLOAD_ONHOVER"
                }
              ],
              "listeners": [
                {
                  "event": "update",
                  "callback": function(){
                    ytcenter.events.performEvent("ui-refresh");
                  }
                }
              ]
            }
          );
          option.setStyle("margin-left", "12px");
          subcat.addOption(option);

          option = ytcenter.settingsPanel.createOption(
            "videoThumbnailRatingsCountVisible", // defaultSetting
            "list", // module
            "SETTINGS_THUMBVIDEO_VISIBLE", // label
            { // args
              "list": [
                {
                  "value": "always",
                  "label": "SETTINGS_THUMBVIDEO_ALWAYSVISIBLE"
                }, {
                  "value": "show_hover",
                  "label": "SETTINGS_THUMBVIDEO_SHOWONHOVER"
                }, {
                  "value": "hide_hover",
                  "label": "SETTINGS_THUMBVIDEO_HIDEONHOVER"
                }
              ],
              "listeners": [
                {
                  "event": "update",
                  "callback": function(){
                    ytcenter.events.performEvent("ui-refresh");
                  }
                }
              ]
            }
          );
          option.setStyle("margin-left", "12px");
          subcat.addOption(option);

          // Watch later button
          option = ytcenter.settingsPanel.createOption(
            null, // defaultSetting
            "textContent", // module
            "SETTINGS_THUMBVIDEO_WATCH_LATER" // label
          );
          option.setStyle("font-weight", "bold");
          subcat.addOption(option);

          option = ytcenter.settingsPanel.createOption(
            "videoThumbnailWatchLaterPosition", // defaultSetting
            "list", // module
            "SETTINGS_THUMBVIDEO_POSITION", // label
            {
              "list": [
                {
                  "value": "topleft",
                  "label": "SETTINGS_THUMBVIDEO_POSITION_TOPLEFT"
                }, {
                  "value": "topright",
                  "label": "SETTINGS_THUMBVIDEO_POSITION_TOPRIGHT"
                }, {
                  "value": "bottomleft",
                  "label": "SETTINGS_THUMBVIDEO_POSITION_BOTTOMLEFT"
                }, {
                  "value": "bottomright",
                  "label": "SETTINGS_THUMBVIDEO_POSITION_BOTTOMRIGHT"
                }
              ],
              "listeners": [
                {
                  "event": "update",
                  "callback": function(){
                    ytcenter.events.performEvent("ui-refresh");
                  }
                }
              ]
            }
          );
          option.setStyle("margin-left", "12px");
          subcat.addOption(option);
          option = ytcenter.settingsPanel.createOption(
            "videoThumbnailWatchLaterVisible", // defaultSetting
            "list", // module
            "SETTINGS_THUMBVIDEO_VISIBLE", // label
            { // args
              "list": [
                {
                  "value": "always",
                  "label": "SETTINGS_THUMBVIDEO_ALWAYSVISIBLE"
                }, {
                  "value": "show_hover",
                  "label": "SETTINGS_THUMBVIDEO_SHOWONHOVER"
                }, {
                  "value": "hide_hover",
                  "label": "SETTINGS_THUMBVIDEO_HIDEONHOVER"
                }, {
                  "value": "never",
                  "label": "SETTINGS_THUMBVIDEO_NEVER"
                }
              ],
              "listeners": [
                {
                  "event": "update",
                  "callback": function(){
                    ytcenter.events.performEvent("ui-refresh");
                  }
                }
              ]
            }
          );
          option.setStyle("margin-left", "12px");
          subcat.addOption(option);

          // Time code
          option = ytcenter.settingsPanel.createOption(
            null, // defaultSetting
            "textContent", // module
            "SETTINGS_THUMBVIDEO_TIME_CODE" // label
          );
          option.setStyle("font-weight", "bold");
          subcat.addOption(option);

          option = ytcenter.settingsPanel.createOption(
            "videoThumbnailTimeCodePosition", // defaultSetting
            "list", // module
            "SETTINGS_THUMBVIDEO_POSITION", // label
            { // args
              "list": [
                {
                  "value": "topleft",
                  "label": "SETTINGS_THUMBVIDEO_POSITION_TOPLEFT"
                }, {
                  "value": "topright",
                  "label": "SETTINGS_THUMBVIDEO_POSITION_TOPRIGHT"
                }, {
                  "value": "bottomleft",
                  "label": "SETTINGS_THUMBVIDEO_POSITION_BOTTOMLEFT"
                }, {
                  "value": "bottomright",
                  "label": "SETTINGS_THUMBVIDEO_POSITION_BOTTOMRIGHT"
                }
              ],
              "listeners": [
                {
                  "event": "update",
                  "callback": function(){
                    ytcenter.events.performEvent("ui-refresh");
                  }
                }
              ]
            }
          );
          option.setStyle("margin-left", "12px");
          subcat.addOption(option);

          option = ytcenter.settingsPanel.createOption(
            "videoThumbnailTimeCodeVisible", // defaultSetting
            "list", // module
            "SETTINGS_THUMBVIDEO_VISIBLE", // label
            { // args
              "list": [
                {
                  "value": "always",
                  "label": "SETTINGS_THUMBVIDEO_ALWAYSVISIBLE"
                }, {
                  "value": "show_hover",
                  "label": "SETTINGS_THUMBVIDEO_SHOWONHOVER"
                }, {
                  "value": "hide_hover",
                  "label": "SETTINGS_THUMBVIDEO_HIDEONHOVER"
                }, {
                  "value": "never",
                  "label": "SETTINGS_THUMBVIDEO_NEVER"
                }
              ],
              "listeners": [
                {
                  "event": "update",
                  "callback": function(){
                    ytcenter.events.performEvent("ui-refresh");
                  }
                }
              ]
            }
          );
          option.setStyle("margin-left", "12px");
          subcat.addOption(option);

        subcat = ytcenter.settingsPanel.createSubCategory("SETTINGS_SUBCAT_COMMENTS"); cat.addSubCategory(subcat);
          option = ytcenter.settingsPanel.createOption(
            "commentCountryEnabled", // defaultSetting
            "bool", // module
            "SETTINGS_COMMENTS_COUNTRY_ENABLE", // label
            null,
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#country-for-comments" // help
          );
          subcat.addOption(option);

          option = ytcenter.settingsPanel.createOption(
            "commentCountryShowFlag", // defaultSetting
            "bool", // module
            "SETTINGS_COMMENTS_COUNTRY_SHOW_FLAG" // label
          );
          subcat.addOption(option);
          
          option = ytcenter.settingsPanel.createOption(
            "commentCountryUseNames", // defaultSetting
            "bool", // module
            "SETTINGS_COMMENTS_COUNTRY_USE_NAME" // label
          );
          subcat.addOption(option);
          
          option = ytcenter.settingsPanel.createOption(
            "commentCountryLazyLoad", // defaultSetting
            "bool", // module
            "SETTINGS_COMMENTS_COUNTRY_LAZY_LOAD" // label
          );
          subcat.addOption(option);
          
          

          option = ytcenter.settingsPanel.createOption(
            "commentCountryPosition", // defaultSetting
            "list", // module
            "SETTINGS_COMMENTS_COUNTRY_POSITION", // label
            {
              "list": [
                {
                  "value": "before_username",
                  "label": "SETTINGS_COMMENTS_COUNTRY_POSITION_BEFORE_USERNAME"
                }, {
                  "value": "after_username",
                  "label": "SETTINGS_COMMENTS_COUNTRY_POSITION_AFTER_USERNAME"
                }, {
                  "value": "last",
                  "label": "SETTINGS_COMMENTS_COUNTRY_POSITION_LAST"
                }
              ]
            }
          );
          subcat.addOption(option);

        /* Not needed as of now
        subcat = ytcenter.settingsPanel.createSubCategory("Subscriptions"); cat.addSubCategory(subcat);
        */  

      /* Category:Update */
      cat = ytcenter.settingsPanel.createCategory("SETTINGS_CAT_UPDATE");
        if (!devbuild) {
          if ((@identifier@ === 1 && (uw.navigator.userAgent.indexOf("Opera") !== -1 || uw.navigator.userAgent.indexOf("OPR/") !== -1)) || @identifier@ === 6) {
            cat.setVisibility(false);
          }
          ytcenter.events.addEvent("ui-refresh", function(){
            if ((@identifier@ === 1 && (uw.navigator.userAgent.indexOf("Opera") !== -1 || uw.navigator.userAgent.indexOf("OPR/") !== -1)) || @identifier@ === 6) {
              this.setVisibility(false);
            } else {
              this.setVisibility(true);
            }
          }.bind(cat));
        }
        subcat = ytcenter.settingsPanel.createSubCategory("SETTINGS_TAB_GENERAL"); cat.addSubCategory(subcat);
          option = ytcenter.settingsPanel.createOption(
            "enableUpdateChecker",
            "bool",
            "SETTINGS_UPDATE_ENABLE",
            null,
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#enable-update-checker"
          );
          subcat.addOption(option);
          
          option = ytcenter.settingsPanel.createOption(
            "updateCheckerInterval",
            "list",
            "SETTINGS_UPDATE_INTERVAL",
            {
              "list": [
                {
                  "value": "0",
                  "label": "SETTINGS_UPDATE_INTERVAL_ALWAYS"
                }, {
                  "value": "1",
                  "label": "SETTINGS_UPDATE_INTERVAL_EVERYHOUR"
                }, {
                  "value": "2",
                  "label": "SETTINGS_UPDATE_INTERVAL_EVERY2HOUR"
                }, {
                  "value": "12",
                  "label": "SETTINGS_UPDATE_INTERVAL_EVERY12HOUR"
                }, {
                  "value": "24",
                  "label": "SETTINGS_UPDATE_INTERVAL_EVERYDAY"
                }, {
                  "value": "48",
                  "label": "SETTINGS_UPDATE_INTERVAL_EVERY2DAY"
                }, {
                  "value": "168",
                  "label": "SETTINGS_UPDATE_INTERVAL_EVERYWEEK"
                }, {
                  "value": "336",
                  "label": "SETTINGS_UPDATE_INTERVAL_EVERY2WEEK"
                }, {
                  "value": "720",
                  "label": "SETTINGS_UPDATE_INTERVAL_EVERYMONTH"
                }
              ]
            },
            "https://github.com/YePpHa/YouTubeCenter/wiki/Features#update-interval"
          );
          subcat.addOption(option);
          
          option = ytcenter.settingsPanel.createOption(
            null,
            "button",
            null,
            {
              "text": "SETTINGS_UPDATE_CHECKFORNEWUPDATES",
              "listeners": [
                {
                  "event": "click",
                  "callback": function(){
                    this.textContent = ytcenter.language.getLocale("SETTINGS_UPDATE_CHECKINGFORNEWUPDATES");
                    this.disabled = true;
                    ytcenter.checkForUpdates((function(self){
                      return function(){
                        self.textContent = ytcenter.language.getLocale("SETTINGS_UPDATE_CHECKFORNEWUPDATESSUCCESS");
                        self.disabled = false;
                      };
                    })(this), (function(self){
                      return function(){
                        self.textContent = ytcenter.language.getLocale("SETTINGS_UPDATE_CHECKINGFORNEWUPDATESERROR");
                        self.disabled = false;
                      };
                    })(this), (function(self){
                      return function(){
                        self.textContent = ytcenter.language.getLocale("SETTINGS_UPDATE_CHECKINGFORNEWUPDATESDISABLED");
                        self.disabled = true;
                      };
                    })(this));
                  }
                }
              ]
            }
          );
          subcat.addOption(option);

        /* DISABLED until implemented
        subcat = ytcenter.settingsPanel.createSubCategory("Channel"); cat.addSubCategory(subcat);
        */

      /* Category:Debug */
      cat = ytcenter.settingsPanel.createCategory("SETTINGS_CAT_DEBUG");
        subcat = ytcenter.settingsPanel.createSubCategory("SETTINGS_SUBCAT_LOG"); cat.addSubCategory(subcat);
          option = ytcenter.settingsPanel.createOption(
            null, // defaultSetting
            "textarea",
            null,
            {
              "styles": {
                "width": "100%",
                "height": "130px",
                "background-color": "#fff",
                "border": "1px solid #ccc"
              }
            }
          );
          subcat.addOption(option);
          subcat.addEventListener("click", function(){
            var a = this;
            con.log("[Debug] Loading debug log...");
            a.getLiveModule().setText(ytcenter.language.getLocale("SETTINGS_DEBUG_LOADING"));
            uw.setTimeout(function(){
              a.getLiveModule().setText(ytcenter.getDebug());
              a.getLiveModule().selectAll();
            }, 100);
          }.bind(option));
          
          option = ytcenter.settingsPanel.createOption(
            null, // defaultSetting
            "button",
            null,
            {
              "text": "SETTINGS_DEBUG_CREATEPASTE",
              "listeners": [
                {
                  "event": "click",
                  "callback": function() {
                    var content = document.createElement("div"), text, pasteUrl,
                        data = [
                          "api_dev_key=@pastebin-api-key@",
                          "api_option=paste",
                          "api_paste_private=1", // unlisted
                          "api_paste_expire_date=1M", // 1 month
                          "api_paste_format=javascript",
                          "api_paste_name=" + encodeURIComponent("YouTube Center ".concat(ytcenter.version, "-", ytcenter.revision, " Debug Info")),
                          "api_paste_code=" + encodeURIComponent(ytcenter.getDebug())
                        ].join('&');

                    text = document.createElement("p");
                    text.appendChild(document.createTextNode(ytcenter.language.getLocale("PASTEBIN_TEXT")));
                    text.setAttribute("style", "margin-bottom: 10px");

                    content.appendChild(text);

                    pasteUrl = document.createElement("input");
                    pasteUrl.setAttribute("type", "text");
                    pasteUrl.setAttribute("class", "yt-uix-form-input-text");
                    pasteUrl.setAttribute("value", ytcenter.language.getLocale("PASTEBIN_LOADING"));
                    pasteUrl.setAttribute("readonly", "readonly");
                    pasteUrl.addEventListener("focus", function() { this.select(); }, false);

                    content.appendChild(pasteUrl);

                    ytcenter.dialog("PASTEBIN_TITLE", content).setVisibility(true);

                    $XMLHTTPRequest({
                      method: "POST",
                      url: "http://pastebin.com/api/api_post.php",
                      headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                      },
                      data: data,
                      contentType: "application/x-www-form-urlencoded", // Firefox Addon
                      content: data, // Firefox Addon
                      onload: function(response) {
                        pasteUrl.value = response.responseText;
                      }
                    });
                  }
                }
              ]
            }
          );
          subcat.addOption(option);

        //subcat = ytcenter.settingsPanel.createSubCategory("Options"); cat.addSubCategory(subcat);


      /* Category:Share DISABLED until I implement it*/
      /*cat = ytcenter.settingsPanel.createCategory("Share");
        subcat = ytcenter.settingsPanel.createSubCategory("Share"); cat.addSubCategory(subcat);
      */

      /* Category:Donate */
      cat = ytcenter.settingsPanel.createCategory("SETTINGS_CAT_DONATE");
        subcat = ytcenter.settingsPanel.createSubCategory("SETTINGS_SUBCAT_DONATE"); cat.addSubCategory(subcat);
          option = ytcenter.settingsPanel.createOption(
            null, // defaultSetting
            "textContent", // module
            null, // label
            {
              "textlocale": "SETTINGS_DONATE_TEXT",
              "replace": {
                "{wiki-donate}": function(){
                  var a = document.createElement("a");
                  a.setAttribute("target", "_blank");
                  a.setAttribute("href", "https://github.com/YePpHa/YouTubeCenter/wiki/Donate");
                  a.textContent = ytcenter.language.getLocale("SETTINGS_DONATE_WIKI");
                  ytcenter.language.addLocaleElement(a, "SETTINGS_DONATE_WIKI", "@textContent");
                  return a;
                }
              }
            }
          );
          subcat.addOption(option);

        subcat = ytcenter.settingsPanel.createSubCategory("SETTINGS_SUBCAT_PAYPAL"); cat.addSubCategory(subcat);
          option = ytcenter.settingsPanel.createOption(
            null, // defaultSetting
            "textContent", // module
            null, // label
            {
              "textlocale": "SETTINGS_DONATE_PAYPAL_TEXT2",
              "replace": {
                "{page-link}": function(){
                  var a = document.createElement("a");
                  a.setAttribute("target", "_blank");
                  a.setAttribute("href", "https://dl.dropboxusercontent.com/u/13162258/YouTube%20Center/support/PayPal.html");
                  a.textContent = ytcenter.language.getLocale("SETTINGS_DONATE_PAYPAL_LINK2");
                  ytcenter.language.addLocaleElement(a, "SETTINGS_DONATE_PAYPAL_LINK2", "@textContent");
                  return a;
                }
              }
            }
          );
          subcat.addOption(option);


      /* Category:About */
      cat = ytcenter.settingsPanel.createCategory("SETTINGS_CAT_ABOUT");
        subcat = ytcenter.settingsPanel.createSubCategory("SETTINGS_SUBCAT_ABOUT"); cat.addSubCategory(subcat);
          option = ytcenter.settingsPanel.createOption(
            null, // defaultSetting
            "aboutText", // module
            null // label
          );
          subcat.addOption(option);
          option = ytcenter.settingsPanel.createOption(
            null, // defaultSetting
            "link", // module
            null, // label
            {
              "titleLocale": "SETTINGS_ABOUT_LINKS",
              "links": [
                {text: "Wiki", url: "https://github.com/YePpHa/YouTubeCenter/wiki"},
                {text: "Userscript", url: "http://userscripts.org/scripts/show/114002"},
                {text: "Facebook", url: "https://www.facebook.com/YouTubeCenter"},
                {text: "Google+", url: "https://plus.google.com/111275247987213661483/posts"},
                {text: "Firefox", url: "https://addons.mozilla.org/en-us/firefox/addon/youtube-center/"},
                {text: "Opera", url: "https://addons.opera.com/en/extensions/details/youtube-center/"},
                {text: "Maxthon", url: "http://extension.maxthon.com/detail/index.php?view_id=1201"},
                {text: "Github", url: "https://github.com/YePpHa/YouTubeCenter/"}
              ]
            }
          );
          subcat.addOption(option);

        subcat = ytcenter.settingsPanel.createSubCategory("SETTINGS_SUBCAT_TRANSLATORS"); cat.addSubCategory(subcat);
          option = ytcenter.settingsPanel.createOption(
            null, // defaultSetting
            "translators", // module
            null, // label
            { // args
              "translators": {
                "ar-bh": [
                  { name: "alihill381" }
                ],
                "ca": [
                  { name: "Joan Alemany" },
                  { name: "Raül Cambeiro" }
                ],
                "cs": [
                  { name: "Petr Vostřel", url: "http://petr.vostrel.cz/" }
                ],
                "da": [
                  { name: "Jeppe Rune Mortensen", url: "https://github.com/YePpHa/YouTubeCenter/wiki" }
                ],
                "de": [
                  { name: "Simon Artmann" },
                  { name: "Sven \"Hidden\" W" }
                ],
                "en": [],
                "es": [
                  { name: "Roxz" }
                ],
                "fa-IR": [],
                "fr": [
                  { name: "ThePoivron", url: "http://www.twitter.com/ThePoivron" }
                ],
                "he": [
                  { name: "baryoni" }
                ],
                "hu": [
                  { name: "Eugenox" },
                  { name: "Mateus" }
                ],
                "it": [
                  { name: "Pietro De Nicolao" }
                ],
                "ja": [
                  { name: "Lightning-Natto" }
                ],
                "ko": [
                  { name: "Hyeongi Min", url: "https://www.facebook.com/MxAiNM" },
                  { name: "U Bless", url: "http://userscripts.org/users/ubless" }
                ],
                "nb-NO": [
                  { name: "master3395" },
                  { name: "Mathias Solheim", url: "http://mathias.ocdevelopment.net/" }
                ],
                "nl": [
                  { name: "Marijn Roes" }
                ],
                "pl": [
                  { name: "Piotr" },
                  { name: "kasper93" }
                ],
                "pt-BR": [
                  { name: "Thiago R. M. Pereira" },
                  { name: "José Junior" },
                  { name: "Igor Rückert" }
                ],
                "pt-PT": [
                  { name: "Rafael Damasceno", url: "http://userscripts.org/users/264457" }
                ],
                "ro": [
                  { name: "BlueMe", url: "http://www.itinerary.ro/" }
                ],
                "ru": [
                  { name: "KDASOFT", url: "http://kdasoft.narod.ru/" }
                ],
                "sk": [
                  { name: "ja1som" }
                ],
                "sv-SE": [
                  { name: "Christian Eriksson" }
                ],
                "tr": [
                  { name: "Ismail Aksu" }
                ],
                "UA": [
                  { name: "SPIDER-T1" },
                  { name: "Petro Lomaka", url: "https://plus.google.com/103266219992558963899/" }
                ],
                "vi": [
                  { name: "Tuấn Phạm" }
                ],
                "zh-CN": [
                  { name: "雅丶涵", url: "http://www.baidu.com/p/%E9%9B%85%E4%B8%B6%E6%B6%B5" },
                  { name: "MatrixGT" }
                ],
                "zh-TW": [
                  { name: "泰熊" }
                ]
              }
            }
          );
          subcat.addOption(option);
    })();
    
    ytcenter.video = {};
    ytcenter.video.format = [
      {
        type: 'video/mp4',
        name: 'SETTINGS_DOWNLOADFORMAT_LIST_MP4',
        key: 'mp4'
      }, {
        type: 'video/webm',
        name: 'SETTINGS_DOWNLOADFORMAT_LIST_WEBM',
        key: 'webm'
      }, {
        type: 'video/x-flv',
        name: 'SETTINGS_DOWNLOADFORMAT_LIST_FLV',
        key: 'flv'
      }, {
        type: 'video/3gpp',
        name: 'SETTINGS_DOWNLOADFORMAT_LIST_3GP',
        key: '3gp'
      }, {
        type: 'audio/mp4',
        name: 'SETTINGS_DOWNLOADFORMAT_LIST_AUDIO',
        key: 'm4a',
        help: 'https://github.com/YePpHa/YouTubeCenter/wiki/Download:Audio'
      }
    ];
    ytcenter.video.resolutions = {
      'tiny': '144p',
      'small': '240p',
      'medium': '360p',
      'large': '480p',
      'hd720': '720p',
      'hd1080': '1080p',
      'hd1440': '1440p',
      'highres': 'Original'
    };
    ytcenter.video.id = "";
    ytcenter.video.title = "";
    ytcenter.video.author = "";
    ytcenter.video.channelname = "";
    ytcenter.video._channel = {};
    con.log("Download initializing");
    ytcenter.video.mimetypes = [
      { mimetype: "video/webm", extension: ".webm" },
      { mimetype: "video/x-flv", extension: ".flv" },
      { mimetype: "video/mp4", extension: ".mp4" },
      { mimetype: "video/3gpp", extension: ".3gp" },
      { mimetype: "audio/mp4", extension: ".m4a" },
      { mimetype: "audio/mp4", extension: ".m4a" }
    ];
    ytcenter.video.getFilenameExtension = function(stream){
      if (!stream || !stream.type || stream.type.indexOf(";") === -1) return "";
      var mt = stream.type.split(";")[0], i;
      for (i = 0; i < ytcenter.video.mimetypes.length; i++) {
        if (ytcenter.video.mimetypes[i].mimetype === mt)
          return ytcenter.video.mimetypes[i].extension;
      }
      return "";
    };
    ytcenter.video.getFilename = function(stream){
      if (stream == null) return "";
      var duration = 0;
      var pubtimestamp = 0, pubsecs = 0, pubmins = 0, pubhours = 0, pubdays = 0, pubmonth = 0, pubyear = 0;
      var nowtimestamp = 0, nowsecs = 0, nowmins = 0, nowhours = 0, nowdays = 0, nowmonth = 0, nowyear = 0;
      var durmin = 0;
      var dursec = 0;
      try {
        duration = ytcenter.player.getConfig().args.length_seconds;
        durmin = Math.floor(duration/60);
        dursec = duration - durmin*60;
      } catch (e) {
        duration = 0;
        durmin = 0;
        dursec = 0;
      }
      try {
        pubtimestamp = Math.floor(ytcenter.video.published.getTime()/1000);
        pubsecs = ytcenter.video.published.getSeconds();
        pubmins = ytcenter.video.published.getMinutes();
        pubhours = ytcenter.video.published.getHours();
        pubdays = ytcenter.video.published.getDate();
        pubmonth = ytcenter.video.published.getMonth() + 1;
        pubyear = ytcenter.video.published.getFullYear();
      } catch (e) {
        pubtimestamp = 0;
        pubsecs = 0;
        pubmins = 0;
        pubhours = 0;
        pubdays = 0;
        pubmonth = 0;
        pubyear = 0;
      }
      try {
        var now = new Date();
        nowtimestamp = Math.floor(now.getTime()/1000);
        nowsecs = now.getSeconds();
        nowmins = now.getMinutes();
        nowhours = now.getHours();
        nowdays = now.getDate();
        nowmonth = now.getMonth() + 1;
        nowyear = now.getFullYear();
      } catch (e) {
        con.error(e);
        nowtimestamp = 0;
        nowsecs = 0;
        nowmins = 0;
        nowhours = 0;
        nowdays = 0;
        nowmonth = 0;
        nowyear = 0;
      }
      var filename = ytcenter.utils.replaceTextAsString(ytcenter.settings.filename, {
        title: ytcenter.video.title,
        videoid: ytcenter.video.id,
        author: ytcenter.video.author,
        channelname: ytcenter.video.channelname,
        resolution: (ytcenter.video.resolutions.hasOwnProperty(stream.quality) ? ytcenter.video.resolutions[stream.quality] : ''),
        itag: stream.itag,
        dimension: (stream.dimension ? stream.dimension : stream.size),
        bitrate: stream.bitrate,
        width: (stream.dimension ? stream.dimension.split("x")[0] : (stream.size ? stream.size.split("x")[0] : 0)),
        height: (stream.dimension ? stream.dimension.split("x")[1] : (stream.size ? stream.size.split("x")[1] : 0)),
        format: (function(){
          for (var i = 0; i < ytcenter.video.format.length; i++) {
            if (stream.type.indexOf(ytcenter.video.format[i].type) == 0) {
              return ytcenter.language.getLocale(ytcenter.video.format[i].name);
            }
          }
          return "";
        })(),
        quality: stream.quality,
        type: stream.type,
        dur: duration,
        durmins: ytcenter.utils.prefixText(durmin, "0", 2),
        dursecs: ytcenter.utils.prefixText(dursec, "0", 2),
        nowtimestamp: nowtimestamp,
        nowsecs: ytcenter.utils.prefixText(nowsecs, "0", 2),
        nowmins: ytcenter.utils.prefixText(nowmins, "0", 2),
        nowhours: ytcenter.utils.prefixText(nowhours, "0", 2),
        nowdays: ytcenter.utils.prefixText(nowdays, "0", 2),
        nowmonth: ytcenter.utils.prefixText(nowmonth, "0", 2),
        nowyear: nowyear,
        pubtimestamp: pubtimestamp,
        pubsecs: ytcenter.utils.prefixText(pubsecs, "0", 2),
        pubmins: ytcenter.utils.prefixText(pubmins, "0", 2),
        pubhours: ytcenter.utils.prefixText(pubhours, "0", 2),
        pubdays: ytcenter.utils.prefixText(pubdays, "0", 2),
        pubmonth: ytcenter.utils.prefixText(pubmonth, "0", 2),
        pubyear: pubyear
      });
      // Removing illegal characters for filename for OS
      if (uw.navigator.appVersion.toLowerCase().indexOf("win") != -1) {
        filename = filename.replace(new RegExp('[\\\\/:|]+', 'g'), "-");
        filename = filename.replace(new RegExp('["*?<>]+', 'g'), "_");
      } else if (uw.navigator.appVersion.toLowerCase().indexOf("mac") != -1) {
        filename = filename.replace(new RegExp('^\\.'), "_");
        filename = filename.replace(":", "-");
      } else if (uw.navigator.appVersion.toLowerCase().indexOf("linux") != -1) {
        filename = filename.replace(new RegExp('[/\0]+', 'g'), "-");
      }
      
      if (ytcenter.settings.fixfilename) {
        var tmp = "";
        for (var i = 0; i < filename.length; i++) {
          if (filename.charAt(i).match(/[0-9a-zA-Z ]/i)) {
            tmp += filename.charAt(i);
          }
        }
        filename = tmp;
      }
      return filename;
    };
    ytcenter.video.filename = function(stream){
      if (stream == null) return "";
      return stream.url + "&title=" + encodeURIComponent(ytcenter.video.getFilename(stream));
    };
    ytcenter.video.downloadLink = function(stream){
      try {
        return ytcenter.video.filename(stream) + "&cpn=" + encodeURIComponent(ytcenter.utils.crypt()) + (stream.s || stream.sig ? "&signature=" + encodeURIComponent(stream.sig || ytcenter.utils.signatureDecipher(stream.s)) : "");
      } catch (e) {
        con.error(e);
        return stream.url + (stream.sig || stream.s ? "&signature=" + encodeURIComponent(stream.sig || ytcenter.utils.signatureDecipher(stream.s)) : "");
      }
    };
    ytcenter.video.download = (function(){
      var _download_iframe = null;
      return function(itag){
        con.log("Downloading format " + itag + "...");
        var stream = null;
        for (var i = 0; i < ytcenter.video.streams.length; i++) {
          if (ytcenter.video.streams[i].itag === itag && typeof ytcenter.video.streams[i].url != "undefined") {
            stream = ytcenter.video.streams[i];
            break;
          }
        }
        if (stream) {
          if (!_download_iframe) { // Initalize iframe if it doesn't exist
            _download_iframe = document.createElement("iframe");
            _download_iframe.style.position = "absolute";
            _download_iframe.style.top = "-1000px";
            _download_iframe.style.left = "-1000px";
            _download_iframe.style.width = "1px";
            _download_iframe.style.height = "1px";
            document.body.appendChild(_download_iframe);
          }
          _download_iframe.setAttribute("src", ytcenter.video.downloadLink(stream));
        } else {
          con.log("Format (" + itag + ") not found and therefore couldn't start downloading");
          throw "Stream (" + itag + ") not found!";
        }
      };
    })();
    ytcenter.video.streams = [];
    
    ytcenter.site = {};
    ytcenter.site.removeAdvertisement = function(cfg){
      cfg = cfg || ytcenter.player.getConfig();
      var _ads = [
        "supported_without_ads",
        "ad3_module",
        "adsense_video_doc_id",
        "allowed_ads",
        "baseUrl",
        "cafe_experiment_id",
        "afv_inslate_ad_tag",
        "advideo",
        "ad_device",
        "ad_channel_code_instream",
        "ad_channel_code_overlay",
        "ad_eurl",
        "ad_flags",
        "ad_host",
        "ad_host_tier",
        "ad_logging_flag",
        "ad_preroll",
        "ad_slots",
        "ad_tag",
        "ad_video_pub_id",
        "aftv",
        "afv",
        "afv_ad_tag",
        "afv_instream_max",
        "afv_ad_tag_restricted_to_instream",
        "afv_video_min_cpm",
        "dynamic_allocation_ad_tag",
        "pyv_ad_channels",
        "max_dynamic_allocation_ad_tag_length",
        "midroll_freqcap",
        "invideo",
        "instream",
        "pyv_in_related_cafe_experiment_id"
      ];
      for (var i = 0; i < _ads.length; i++) {
        try {
          delete cfg.args[_ads[i]];
        } catch (e) {
          con.error(e);
        }
      }
      try {
        if (cfg.args.csi_page_type) {
          con.log("Chaning csi_page_type from " + cfg.args.csi_page_type + " to watch, watch7");
          if (ytcenter.watch7) {
            if (ytcenter.html5) {
              cfg.args.csi_page_type = "watch, watch7_html5";
            } else {
              cfg.args.csi_page_type = "watch, watch7";
            }
          } else {
            cfg.args.csi_page_type = "watch";
          }
        }
      } catch (e) {
        con.error(e);
      }
      try {
        if (document.getElementById("watch-channel-brand-div")) {
          ytcenter.discardElement(document.getElementById("watch-channel-brand-div"));
        }
      } catch (e) {
        con.error(e);
      }
      return cfg;
    };
    ytcenter.user = {};
    ytcenter.user.callChannelFeed = function(username, callback){
      $XMLHTTPRequest({
        method: "GET",
        url: 'https://gdata.youtube.com/feeds/api/channels?q=' + escape("\"" + username + "\"") + '&start-index=1&max-results=1&v=2&alt=json',
        headers: {
          "Content-Type": "text/plain"
        },
        onload: function(response){
          if (response.responseText) {
            var j = JSON.parse(response.responseText);
            if (j.feed && j.feed.entry && j.feed.entry.length > 0) {
              callback.apply(j.feed.entry[0]);
            }
          }
        }
      });
    };
    
    ytcenter.player = {};
    ytcenter.player.darkside = function(){
      if (ytcenter.getPage() === "watch" && ytcenter.player.getCurrentPlayerSize().large) {
        if (ytcenter.settings.playerDarkSideBG) {
          if (document.getElementById("player") && !ytcenter.settings.playerDarkSideBGRetro) {
            document.getElementById("player").style.backgroundColor = ytcenter.settings.playerDarkSideBGColor;
          }
          if (document.getElementById("playlist-tray")) {
            document.getElementById("playlist-tray").style.top = "-" + ytcenter.player.getCurrentPlayerSize().playerHeight + "px";
          }
          return true;
        }
      }
      if (document.getElementById("player")) {
        document.getElementById("player").style.backgroundColor = "";
      }
      if (document.getElementById("playlist-tray")) {
        document.getElementById("playlist-tray").style.top = "";
      }
      return false;
    };
    ytcenter.player.network = {};
    ytcenter.player.network.pause = function(){
      con.log("[Network] Player -> pause");
      var intercom = ytcenter.Intercom.getInstance();
      intercom.emit("player", {
        action: "pause",
        origin: intercom.origin
      });
    };
    ytcenter.player.setPlaybackQuality = function(preferredQuality){
      function recall(vq){
        if (vq === 1) {
          ytcenter.player.listeners.removeEventListener("onStateChange", recall);
          ytcenter.player.setPlaybackQuality(preferredQuality);
        }
      }
      var api = ytcenter.player.getAPI(),
          config = ytcenter.player.getConfig();
      if (config && config.args) {
        config.args.vq = preferredQuality;
      }
      if (!api) {
        ytcenter.player.listeners.addEventListener("onStateChange", recall);
      } else {
        /*if (api.getPlaybackQuality() === preferredQuality && preferredQuality !== "small") api.setPlaybackQuality("small");
        else if (api.getPlaybackQuality() === preferredQuality && preferredQuality !== "medium") api.setPlaybackQuality("medium");*/
        api.setPlaybackQuality(preferredQuality);
      }
    };
    ytcenter.player.config = {};
    ytcenter.player.cpn = ytcenter.utils.crypt();
    ytcenter.player.getVideoDataRequest = function(){
      /* Making sure that the require configuration is available */
      if (uw.yt && uw.yt.config_ && uw.yt.config_.PLAYER_CONFIG)
        ytcenter.player.config = uw.yt.config_.PLAYER_CONFIG;
      if (!ytcenter.player.config || !ytcenter.player.config.args)
        ytcenter.player.config = ytcenter.player.getRawPlayerConfig();
      var emvid = loc.pathname.match(/\/embed\/([0-9a-zA-Z_-]+)/);
      if (emvid && emvid.length > 1 && emvid[1]) emvid = emvid[1];
      /* Creating URL */
      var a = {
        html5: (ytcenter.player.config && ytcenter.player.config.html5 ? "1" : "0"),
        video_id: ytcenter.player.config && ytcenter.player.config.args && ytcenter.player.config.args.video_id || emvid,
        cpn: ytcenter.player.cpn,
        eurl: loc.href,
        ps: null,
        el: "embedded",
        hl: (ytcenter.player.config && ytcenter.player.config.args && ytcenter.player.config.args.hl ? ytcenter.player.config.args.hl : null),
        sts: 15973,
        c: "web",
        cver: (ytcenter.player.config.html5 ? "html5" : "flash")
      }, b = [], k;
      if (ytcenter.player.config && ytcenter.player.config.args && ytcenter.player.config.args.list) {
        a.list = ytcenter.player.config.args.list;
      }
      if (ytcenter.player.config && ytcenter.player.config.args && ytcenter.player.config.args.cr) {
        a.cr = ytcenter.player.config.args.cr;
      }
      if (ytcenter.player.config && ytcenter.player.config.args && ytcenter.player.config.args.access_token) {
        a.access_token = ytcenter.player.config.args.access_token;
      }
      if (ytcenter.player.config && ytcenter.player.config.args && ytcenter.player.config.args.adformat) {
        a.adformat = ytcenter.player.config.args.adformat;
      }
      if (ytcenter.player.config && ytcenter.player.config.args && ytcenter.player.config.args.iv_load_policy) {
        a.iv_load_policy = ytcenter.player.config.args.iv_load_policy;
      }
      if (ytcenter.player.config && ytcenter.player.config.args && ytcenter.player.config.args.autoplay) {
        a.autoplay = ytcenter.player.config.args.autoplay;
      }
      if (ytcenter.player.config && ytcenter.player.config.args && ytcenter.player.config.args.mdx) {
        a.mdx = ytcenter.player.config.args.mdx;
      }
      if (ytcenter.player.config && ytcenter.player.config.args && ytcenter.player.config.args.utpsa) {
        a.utpsa = ytcenter.player.config.args.utpsa;
      }
      if (ytcenter.player.config && ytcenter.player.config.args && ytcenter.player.config.args.is_fling) {
        a.is_fling = ytcenter.player.config.args.is_fling;
      }
      if (window.clientWidth) {
        a.width = window.clientWidth;
      }
      if (window.clientHeight) {
        a.width = window.clientHeight;
      }
      if (ytcenter.player.config && ytcenter.player.config.args && ytcenter.player.config.args.ypc_preview) {
        a.ypc_preview = ytcenter.player.config.args.ypc_preview;
      }
      if (ytcenter.player.config && ytcenter.player.config.args && ytcenter.player.config.args.splay) {
        a.splay = ytcenter.player.config.args.splay;
      }
      if (ytcenter.player.config && ytcenter.player.config.args && ytcenter.player.config.args.content_v) {
        a.content_v = ytcenter.player.config.args.content_v;
      }
      if (ytcenter.player.config && ytcenter.player.config.args && ytcenter.player.config.args.livemonitor) {
        a.livemonitor = ytcenter.player.config.args.livemonitor;
      }
      if (ytcenter.player.config && ytcenter.player.config.args && ytcenter.player.config.args.authuser) {
        a.authuser = ytcenter.player.config.args.authuser;
      }
      if (ytcenter.player.config && ytcenter.player.config.args && ytcenter.player.config.args.pageid) {
        a.pageid = ytcenter.player.config.args.pageid;
      }
      
      for (k in a) {
        if (a.hasOwnProperty(k)) {
          if (a[k] !== null) {
            b.push(encodeURIComponent(k) + "=" + encodeURIComponent(a[k]));
          }
        }
      }
      
      return "/get_video_info?" + b.join("&");
    };
    ytcenter.player.isLiveStream = function(){
      return (ytcenter.player.config && ytcenter.player.config.args && ytcenter.player.config.args.live_playback === 1);
    };
    ytcenter.player.isOnDemandStream = function(){
      return (ytcenter.player.config && ytcenter.player.config.args && ytcenter.player.config.args.ypc_module && ytcenter.player.config.args.ypc_vid);
    };
    ytcenter.player.getRawPlayerConfig = function(){
      function loadMethod1() {
        try {
          var a = document.body.innerHTML;
          a = a.split("<script>var ytplayer = ytplayer || {};ytplayer.config = ");
          if (!a || !a[1]) return null;
          a = a[1];
          a = a.split(";</script>");
          if (!a || !a[0]) return null;
          a = a[0];
          a = JSON.parse(a);
          return a;
        } catch (e) {
          con.error(e);
          return null;
        }
      }
      function loadMethod2() {
        var a;
        try {
          a = document.body.innerHTML;
          a = a.split("'PLAYER_CONFIG': ");
          if (!a || !a[1]) return null;
          a = a[1];
          a = a.split(");");
          if (!a || !a[0]) return null;
          a = a[0];
          a = JSON.parse(a);
          return a;
        } catch (e) {
          con.error(e, a);
          return null;
        }
      }
      
      var _a = null;
      if (!_a && uw.yt && uw.yt.config_ && uw.yt.config_.PLAYER_CONFIG)
        _a = uw.yt.config_.PLAYER_CONFIG;
      if (!_a && document && document.body && document.body.innerHTML && document.body.innerHTML.indexOf("<script>var ytplayer = ytplayer || {};ytplayer.config = ") !== -1)
        _a = loadMethod1();
      if (!_a && document && document.body && document.body.innerHTML && document.body.innerHTML.indexOf("'PLAYER_CONFIG': ") !== -1)
        _a = loadMethod2();
      if (_a) return _a;
      
      return {};
    };
    ytcenter.player.parseRVS = function(rvs){
      var a = [], b = rvs.split(","), c, d, e, i, j;
      for (i = 0; i < b.length; i++) {
        c = {};
        d = b[i].split("&");
        for (j = 0; j < d.length; j++) {
          e = d[j].split("=");
          c[unescape(e[0])] = unescape(e[1]);
        }
        a.push(c);
      }
      return a;
    };
    ytcenter.player.stringifyRVS = function(rvs){
      var sb = "", i, key, j;
      for (i = 0; i < rvs.length; i++) {
        if (i > 0) sb += ",";
        j = 0;
        for (key in rvs[i]) {
          if (rvs[i].hasOwnProperty(key)) {
            if (j > 0) sb += "&";
            sb += escape(key) + "=" + escape(rvs[i][key]);
            j++;
          }
        }
      }
      return sb;
    };
    ytcenter.player.shortcuts = function(){
      con.log("Adding player shortcuts to document");
      document.addEventListener("keydown", function(e){
        e = e || window.event;
        if (ytcenter.settings.enableShortcuts && ytcenter.getPage() === "watch" && !e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
          if (document.activeElement.tagName.toLowerCase() === "input" || document.activeElement.tagName.toLowerCase() === "textarea" || document.activeElement.tagName.toLowerCase() === "object" || document.activeElement.tagName.toLowerCase() === "embed" || document.activeElement.tagName.toLowerCase() === "button") return;
          if (document.activeElement.id === "movie_player" && ytcenter.utils.hasClass(document.activeElement, "html5-video-player")) return;
          if (ytcenter.utils.isParent(document.getElementById("movie_player"), document.activeElement)) return;
          var player = ytcenter.player.getAPI();
          switch (e.keyCode) {
            case 32: // Space
              if (player.getPlayerState() == 1) {
                player.pauseVideo();
              } else {
                player.playVideo();
              }
              break;
            case 37: // Left Arrow
              player.seekTo(player.getCurrentTime()-5, true);
              break;
            case 39: // Right Arrow
              player.seekTo(player.getCurrentTime()+5, true);
              break;
            case 35: // End
              player.seekTo(player.getDuration(), true);
              break;
            case 36: // Home
              player.seekTo(0, true);
              break;
            case 48: // 0
              player.seekTo(0, true);
              break;
            case 49: // 1
              player.seekTo(0.1*player.getDuration(), true);
              break;
            case 50: // 2
              player.seekTo(0.2*player.getDuration(), true);
              break;
            case 51: // 3
              player.seekTo(0.3*player.getDuration(), true);
              break;
            case 52: // 4
              player.seekTo(0.4*player.getDuration(), true);
              break;
            case 53: // 5
              player.seekTo(0.5*player.getDuration(), true);
              break;
            case 54: // 6
              player.seekTo(0.6*player.getDuration(), true);
              break;
            case 55: // 7
              player.seekTo(0.7*player.getDuration(), true);
              break;
            case 56: // 8
              player.seekTo(0.8*player.getDuration(), true);
              break;
            case 57: // 9
              player.seekTo(0.9*player.getDuration(), true);
              break;
            default:
              return;
          }
          e.preventDefault();
        }
      }, false);
    };
    ytcenter.player.config = ytcenter.player.config || {}; // Never set this variable directly!
    ytcenter.player.setConfig = function(value){
      try {
        /*if (ytcenter.getPage() === "watch") {
          if (!value && value !== null) throw "ytcenter.player.config was trying to be set to nothing!";
          if (!value.args) throw "ytcenter.player.config was trying to be set to something with no args";
          if (!value.args.adaptive_fmts && !value.args.url_encoded_fmt_stream_map && !value.args.live_playback) throw "ytcenter.player.config was trying to be set with no video data!";
        }*/
        ytcenter.player.config = ytcenter.utils.cleanObject(value);
      } catch (e) {
        con.error(value);
        con.error(e);
      }
    };
    //ytcenter.player.___config = ytcenter.player.config || {};
    /*ytcenter.player.__defineGetter__("config", function(){
      return ytcenter.player.___config;
    });
    ytcenter.player.__defineSetter__("config", function(value){
      function a() {
        var i = 0;
        ytcenter.utils.each(value, function(){
          i++;
        });
        return i;
      }
      try {
        if (!value) throw "ytcenter.player.config was trying to be set to nothing!";
        if (a() < 10) throw "ytcenter.player.config was trying to be set to an object with a size smaller than 10!";
        if (!value.args) throw "ytcenter.player.config was trying to be set to something with no args";
        if (!value.args.adaptive_fmts && !value.args.url_encoded_fmt_stream_map) throw "ytcenter.player.config was trying to be set with no video data!";
        ytcenter.player.___config = value;
      } catch (e) {
        con.error(value);
        con.error(e);
      }
    });*/
    ytcenter.player.updateConfig = function(page, config){
      con.log("[Config Update]", config);
      if (!config || !config.args) return;
      var api = ytcenter.player.getAPI();
      con.log("[Config Update] Updating as page " + page);
      if (page === "watch") {
        ytcenter.player.updateResize();
        
        if (ytcenter.settings.enableAutoVideoQuality) {
          if (api.getPlaybackQuality && api.getPlaybackQuality() !== config.args.vq || config.args.vq === "auto") {
            con.log("getPlaybackQuality = " + config.args.vq);
            if (config.args.vq === "auto") {
              config.args.vq = ytcenter.settings.autoVideoQuality;
            }
            con.log("[Player Update] Quality => " + config.args.vq);
            api.setPlaybackQuality(config.args.vq);
          }
        }
        
        if (api.getVolume && api.getVolume() !== ytcenter.settings.volume && ytcenter.settings.enableVolume) {
          if (ytcenter.settings.volume < 0) {
            ytcenter.settings.volume = 0;
          } else if (ytcenter.settings.volume > 100) {
            ytcenter.settings.volume = 100;
          }
          api.setVolume(ytcenter.settings.volume);
        }
        if (ytcenter.settings.mute && api.isMuted && !api.isMuted()) {
          api.mute();
        } else if (!ytcenter.settings.mute && api.isMuted && api.isMuted()) {
          api.unMute();
        }
        
        ytcenter.playlist = false;
        try {
          if (document.getElementById("watch7-playlist-data") || loc.search.indexOf("list=") !== -1) {
            ytcenter.playlist = true;
          }
        } catch (e) {
          con.error(e);
        }
        
        // Prevent Auto Play/Buffering
        if (document && document.hasFocus && typeof document.hasFocus === "function" && !document.hasFocus() && ((!ytcenter.playlist && (ytcenter.settings.preventTabAutoBuffer || ytcenter.settings.preventTabAutoPlay)) || (ytcenter.playlist && (ytcenter.settings.preventTabPlaylistAutoBuffer || ytcenter.settings.preventTabPlaylistAutoPlay)))) {
          if (ytcenter.playlist) {
            if (ytcenter.settings.preventTabPlaylistAutoBuffer) {
              if (ytcenter.html5) {
                api.mute();
                var cl =  function(state){
                  if (state === 1) {
                    ytcenter.player.listeners.removeEventListener("onStateChange", cl);
                    api.stopVideo();
                    !ytcenter.settings.mute && api.isMuted && api.unMute();
                  }
                };
                ytcenter.player.listeners.addEventListener("onStateChange", cl);
              }
            } else if (ytcenter.settings.preventTabPlaylistAutoPlay) {
              api.mute();
              api.playVideo();
              api.pauseVideo();
              !ytcenter.settings.mute && api.isMuted && api.unMute();
            }
          } else {
            if (ytcenter.settings.preventTabAutoBuffer) {
              if (ytcenter.html5) {
                api.mute();
                var cl =  function(state){
                  if (state === 1) {
                    ytcenter.player.listeners.removeEventListener("onStateChange", cl);
                    api.stopVideo();
                    !ytcenter.settings.mute && api.isMuted && api.unMute();
                  }
                };
                ytcenter.player.listeners.addEventListener("onStateChange", cl);
              }
            } else if (ytcenter.settings.preventTabAutoPlay) {
              api.mute();
              api.playVideo();
              api.pauseVideo();
              !ytcenter.settings.mute && api.isMuted && api.unMute();
            }
          }
        } else {
          if (ytcenter.playlist) {
            if (ytcenter.settings.preventPlaylistAutoBuffer) {
              if (ytcenter.html5) {
                api.mute();
                var cl =  function(state){
                  if (state === 1) {
                    ytcenter.player.listeners.removeEventListener("onStateChange", cl);
                    api.stopVideo();
                    !ytcenter.settings.mute && api.isMuted && api.unMute();
                  }
                };
                ytcenter.player.listeners.addEventListener("onStateChange", cl);
              }
            } else if (ytcenter.settings.preventPlaylistAutoPlay) {
              api.mute();
              api.playVideo();
              api.pauseVideo();
              !ytcenter.settings.mute && api.isMuted && api.unMute();
            }
          } else {
            if (ytcenter.settings.preventAutoBuffer) {
              if (ytcenter.html5) {
                api.mute();
                var cl =  function(state){
                  if (state === 1) {
                    ytcenter.player.listeners.removeEventListener("onStateChange", cl);
                    api.stopVideo();
                    !ytcenter.settings.mute && api.isMuted && api.unMute();
                  }
                };
                ytcenter.player.listeners.addEventListener("onStateChange", cl);
              }
            } else if (ytcenter.settings.preventAutoPlay) {
              api.mute();
              api.playVideo();
              api.pauseVideo();
              !ytcenter.settings.mute && api.isMuted && api.unMute();
            }
          }
        }
      } else if (page === "channel") {
        if (ytcenter.settings.channel_enableVolume) {
          if (ytcenter.settings.channel_volume < 0) {
            ytcenter.settings.channel_volume = 0;
          } else if (ytcenter.settings.channel_volume > 100) {
            ytcenter.settings.channel_volume = 100;
          }
          if (api.setVolume) {
            api.setVolume(ytcenter.settings.channel_volume);
          }
        }
        if (ytcenter.settings.channel_mute && api.mute) {
          api.mute();
        } else if (!ytcenter.settings.channel_mute && api.unMute) {
          api.unMute();
        }
        
        if (ytcenter.settings.channel_preventAutoBuffer) {
          //api.stopVideo();
        } else if (ytcenter.settings.channel_preventAutoPlay) {
          api.playVideo();
          api.pauseVideo();
        } else {
          api.playVideo();
        }
        
        if (api.getPlaybackQuality() !== config.args.vq) {
          if (config.args.vq === "auto") {
            config.args.vq = ytcenter.settings.channel_autoVideoQuality;
          }
          con.log("[Player Update] Quality => " + config.args.vq);
          api.setPlaybackQuality(config.args.vq);
        }
      } else if (page === "embed") {
        if (ytcenter.settings.embed_enableVolume) {
          if (ytcenter.settings.embed_volume < 0) {
            ytcenter.settings.embed_volume = 0;
          } else if (ytcenter.settings.embed_volume > 100) {
            ytcenter.settings.embed_volume = 100;
          }
          if (api.setVolume) {
            api.setVolume(ytcenter.settings.embed_volume);
          }
        }
        try {
          if (ytcenter.settings.embed_mute) {
            api.mute();
          } else if (!ytcenter.settings.embed_mute) {
            api.unMute();
          }
        } catch (e) {
          con.error(e);
        }
        if (!ytcenter.settings.embed_defaultAutoplay) {
          if (ytcenter.settings.embed_preventAutoBuffer) {
            var played = false;
            ytcenter.player.listeners.addEventListener("onStateChange", function(s){
              if (s !== 1 || played) return;
              played = true;
              if (api.getPlaybackQuality() !== ytcenter.settings.embed_autoVideoQuality) {
                if (config.args.vq === "auto") {
                  config.args.vq = ytcenter.settings.embed_autoVideoQuality;
                }
                con.log("Setting playback quality from " + api.getPlaybackQuality() + " to " + ytcenter.settings.embed_autoVideoQuality);
                ytcenter.player.setPlaybackQuality(config.args.vq);
              }
            });
          } else if (ytcenter.settings.embed_preventAutoPlay) {
            api.playVideo();
            api.pauseVideo();
            uw.setTimeout(function(){
              if (api.getPlaybackQuality() !== ytcenter.settings.embed_autoVideoQuality) {
                if (config.args.vq === "auto") {
                  config.args.vq = ytcenter.settings.embed_autoVideoQuality;
                }
                con.log("Setting playback quality from " + api.getPlaybackQuality() + " to " + ytcenter.settings.embed_autoVideoQuality);
                ytcenter.player.setPlaybackQuality(config.args.vq);
              }
            }, 600);
          } else {
            ytcenter.player.listeners.addEventListener("onStateChange", function(s){
              if (s !== 1 || played) return;
              played = true;
              if (api.getPlaybackQuality() !== ytcenter.settings.embed_autoVideoQuality) {
                if (config.args.vq === "auto") {
                  config.args.vq = ytcenter.settings.embed_autoVideoQuality;
                }
                con.log("Setting playback quality from " + api.getPlaybackQuality() + " to " + ytcenter.settings.embed_autoVideoQuality);
                ytcenter.player.setPlaybackQuality(config.args.vq);
              }
            });
            api.playVideo();
          }
        } else if (loc.search.indexOf("ytcenter-autoplay=1") !== -1) {
          ytcenter.player.listeners.addEventListener("onStateChange", function(s){
            if (s !== 1 || played) return;
            played = true;
            if (api.getPlaybackQuality() !== ytcenter.settings.embed_autoVideoQuality) {
              if (config.args.vq === "auto") {
                config.args.vq = ytcenter.settings.embed_autoVideoQuality;
              }
              con.log("Setting playback quality from " + api.getPlaybackQuality() + " to " + ytcenter.settings.embed_autoVideoQuality);
              ytcenter.player.setPlaybackQuality(config.args.vq);
            }
          });
          api.playVideo();
        }
        
        if (api.getPlaybackQuality() !== ytcenter.settings.embed_autoVideoQuality) {
          if (config.args.vq === "auto") {
            config.args.vq = ytcenter.settings.embed_autoVideoQuality;
          }
          con.log("Setting playback quality from " + api.getPlaybackQuality() + " to " + ytcenter.settings.embed_autoVideoQuality);
          ytcenter.player.setPlaybackQuality(config.args.vq);
        }
      }
    };
    ytcenter.player.calculateRatio = function(dash, predefinedAspect){
      var i, a;
      /*predefinedAspect = predefinedAspect || ytcenter.settings['aspectValue'];
      // Checking if the ratio is predefined
      if (predefinedAspect && predefinedAspect.indexOf("=") !== -1) {
        a = predefinedAspect.split("=")[1];
        if (a.indexOf(":") !== -1) {
          a = a.split(":");
          a = parseInt(a[0])/parseInt(a[1]);
          if (!isNaN(a)) return a;
        }
      }*/
      predefinedAspect = predefinedAspect || ytcenter.settings['playerSizeAspect'];
      // Checking if the ratio is predefined
      if (predefinedAspect && predefinedAspect !== "default") {
        a = predefinedAspect;
        if (a.indexOf(":") !== -1) {
          a = a.split(":");
          a = parseInt(a[0])/parseInt(a[1]);
          if (!isNaN(a)) return a;
        }
      }
      
      // Calculating the aspect ratio...
      if (dash) {
        for (i = 0; i < ytcenter.video.streams.length; i++) {
          if (ytcenter.video.streams[i].size) {
            a = ytcenter.video.streams[i].size.split("x");
            break;
          }
        }
      } else {
        for (i = 0; i < ytcenter.video.streams.length; i++) {
          if (ytcenter.video.streams[i].dimension) {
            a = ytcenter.video.streams[i].dimension.split("x");
            break;
          }
        }
      }
      if (a) {
        a = parseInt(a[0])/parseInt(a[1]);
        if (isNaN(a)) return 16/9;
        return a;
      } else {
        return 16/9;
      }
    };
    ytcenter.player.modifyConfig = function(page, config){
      if (page !== "watch" && page !== "embed" && page !== "channel") return config;
      if (loc.href.indexOf(".youtube.com/embed/") !== -1 && !ytcenter.settings.embed_enabled) return config;
      if (!config) config = {};
      if (!config.args) config.args = {};
      con.log("[Player modifyConfig] => " + page);
      
      if (config && config.args && ((config.args.url_encoded_fmt_stream_map && config.args.fmt_list) || config.args.adaptive_fmts)) {
        var streams = ytcenter.parseStreams(config.args);
        ytcenter.video.streams = streams;
        try {
          if (ytcenter.video && ytcenter.video.streams && ytcenter.video.streams[0] && ytcenter.video.streams[0].s) {
            ytcenter.utils.updateSignatureDecipher(); // Only Updating the signature decoder when it's needed!
          }
        } catch (e) {
          con.error("[updateSignatureDecipher] Error,", e);
        }
        ytcenter.unsafe.video = {};
        ytcenter.unsafe.video.streams = ytcenter.video.streams;
        
        ytcenter.video.id = config.args.video_id;
        ytcenter.video.title = config.args.title;
      }
      config.args.ytcenter = 1;
      config.args.enablejsapi = 1;
      config.args.jsapicallback = "ytcenter.player.onReady";
      
      
      if (ytcenter.getPage() === "watch") {
        if (ytcenter.settings.forcePlayerType === "flash" && !ytcenter.player.isLiveStream() && !ytcenter.player.isOnDemandStream()) {
          config.html5 = false;
          config.disable = { html5: 1 };
          ytcenter.player.setPlayerType("flash");
        } else if (ytcenter.settings.forcePlayerType === "html5" && !ytcenter.player.isLiveStream() && !ytcenter.player.isOnDemandStream()) {
          config.html5 = true;
          delete config.args.ad3_module;
          config.args.allow_html5_ads = 1;
          config.args.html5_sdk_version = "3.1";
          config.disable = { flash: 1 };
          ytcenter.player.setPlayerType("html5");
        }
      } else if (ytcenter.getPage() === "embed") {
        if (ytcenter.settings.embed_forcePlayerType === "flash" && !ytcenter.player.isLiveStream() && !ytcenter.player.isOnDemandStream()) {
          config.html5 = false;
          config.args.html5_sdk_version = "0";
          config.disable = { html5: 1 };
          ytcenter.player.setPlayerType("flash");
        } else if (ytcenter.settings.embed_forcePlayerType === "html5" && !ytcenter.player.isLiveStream() && !ytcenter.player.isOnDemandStream()) {
          config.html5 = true;
          delete config.args.ad3_module;
          config.args.allow_html5_ads = 1;
          config.args.html5_sdk_version = "3.1";
          config.disable = { flash: 1 };
          ytcenter.player.setPlayerType("html5");
        }
      }
      
      if (config.html5) ytcenter.html5 = true;
      else ytcenter.html5 = false;
      con.log("[Player Type] " + (ytcenter.html5 ? "HTML5" : "Flash"));
      
      if (ytcenter.settings.removeRelatedVideosEndscreen) {
        delete config.args.endscreen_module;
        delete config.args.rvs;
      }
      
      if (ytcenter.settings.enableResize)
        config.args.player_wide = ytcenter.settings.player_wide ? "1" : "0";
      
      if (page === "watch") {
        var ___callback = function(response){
          try {
            var txt = response.responseText;
            if (txt) {
              txt = txt.split("<published>");
              if (txt && txt.length > 1) {
                txt = txt[1].split("</published>");
                if (txt && txt.length > 0) {
                  txt = txt[0];
                  ytcenter.video.published = new Date(txt);
                }
              }
            }
          } catch (e) {
            con.error(e);
          }
          //ytcenter.events.performEvent("ui-refresh");
        };
        $XMLHTTPRequest({
          method: "GET",
          url: "https://gdata.youtube.com/feeds/api/videos/" + config.args.video_id + "?v=2",
          headers: {
            "Content-Type": "text/plain"
          },
          onerror: ___callback,
          onload: ___callback
        });
        if (ytcenter.settings.dashPlayback && config.args.adaptive_fmts) {
          config.args.dash = "1";
        } else {
          config.args.dash = "0";
          config.args.dashmpd = "";
          if (!ytcenter.settings.enableAutoVideoQuality) { // Evil hack
            config.args.vq = ytcenter.player.getQuality("large", streams);
          }
        }
        if (ytcenter.settings.enableAutoVideoQuality) {
          var vq = ytcenter.player.getQuality(ytcenter.settings.autoVideoQuality, streams, (config.args.dash === "1" && config.args.adaptive_fmts ? true : false));
          con.log("[Player Quality] => " + ytcenter.settings.autoVideoQuality + " => " + vq);
          config.args.vq = vq;
        }
        if (config.args.dash === "1" && config.args.adaptive_fmts) {
          ytcenter.player.setRatio(ytcenter.player.calculateRatio(true));
        } else {
          ytcenter.player.setRatio(ytcenter.player.calculateRatio(false));
        }
        if (ytcenter.settings.removeAdvertisements) {
          config = ytcenter.site.removeAdvertisement(config);
        }
        if (ytcenter.settings.removeBrandingWatermark) {
          delete config.args.watermark;
          delete config.args.interstitial;
        }
        if (ytcenter.settings.aspectValue !== "none" && ytcenter.settings.aspectValue !== "default" && ytcenter.settings.aspectValue.indexOf("yt:") === 0) {
          con.log("Chaning aspect to " + ytcenter.settings.aspectValue);
          config.args.keywords = ytcenter.settings.aspectValue;
        } else if (ytcenter.settings.aspectValue !== "default") {
          con.log("Chaning aspect to none");
          config.args.keywords = "";
        } else {
          con.log("Keeping the aspect");
        }
        if (ytcenter.settings.forcePlayerType === "flash") {
          config.html5 = false;
        } else if (ytcenter.settings.forcePlayerType === "html5" && !ytcenter.player.isLiveStream() && !ytcenter.player.isOnDemandStream()) {
          config.html5 = true;
          delete config.args.ad3_module;
        }
        if (ytcenter.settings.enableAnnotations) {
          config.args.iv_load_policy = 1;
        } else {
          config.args.iv_load_policy = 3;
        }
        if (typeof ytcenter.settings.autohide != "undefined") {
          config.args.autohide = ytcenter.settings.autohide;
        }

        if (ytcenter.settings.bgcolor === "none") {
          config.args.keywords = ytcenter.utils.setKeyword(config.args.keywords, "yt:bgcolor", "#000000");
        } else if (ytcenter.settings.bgcolor !== "default" && ytcenter.settings.bgcolor.indexOf("#") === 0) {
          config.args.keywords = ytcenter.utils.setKeyword(config.args.keywords, "yt:bgcolor", ytcenter.settings.bgcolor);
        }
        ytcenter.playlist = false;
        try {
          if (document.getElementById("watch7-playlist-data") || loc.search.indexOf("list=") !== -1) {
            ytcenter.playlist = true;
          }
        } catch (e) {
          con.error(e);
        }
        con.log("[Playlist] " + (ytcenter.playlist ? "Enabled" : "Disabled"));
        if (document && document.hasFocus && typeof document.hasFocus === "function" && !document.hasFocus() && ((!ytcenter.playlist && (ytcenter.settings.preventTabAutoBuffer || ytcenter.settings.preventTabAutoPlay)) || (ytcenter.playlist && (ytcenter.settings.preventTabPlaylistAutoBuffer || ytcenter.settings.preventTabPlaylistAutoPlay)))) {
          config.args.autoplay = "0";
        } else {
          if (ytcenter.playlist) {
            if (ytcenter.settings.preventPlaylistAutoBuffer || ytcenter.settings.preventPlaylistAutoPlay) {
              config.args.autoplay = "0";
            } else {
              config.args.autoplay = "1";
            }
          } else {
            if (ytcenter.settings.preventAutoBuffer || ytcenter.settings.preventAutoPlay) {
              config.args.autoplay = "0";
            } else {
              config.args.autoplay = "1";
            }
          }
        }
        config.args.theme = ytcenter.settings.playerTheme;
        config.args.color = ytcenter.settings.playerColor;
        
        ytcenter.player.setTheme(ytcenter.settings.playerTheme);
        ytcenter.player.setProgressColor(ytcenter.settings.playerColor);
        ytcenter.player.setAutoHide(ytcenter.settings.autohide);
        
        if (config.args.rvs) {
          var rvs = ytcenter.player.parseRVS(config.args.rvs), i;
          if (ytcenter.settings.enableEndscreenAutoplay && ytcenter.settings.removeRelatedVideosEndscreen) {
            if (rvs.length > 0) {
              rvs[0].endscreen_autoplay = 1;
              for (i = 1; i < rvs.length; i++) {
                if (typeof rvs[i].endscreen_autoplay !== "undefined") {
                  delete rvs[i].endscreen_autoplay;
                }
              }
            }
            config.args.rvs = ytcenter.player.stringifyRVS(rvs);
          } else {
            if (rvs.length > 0) {
              for (i = 0; i < rvs.length; i++) {
                if (typeof rvs[i].endscreen_autoplay !== "undefined") {
                  delete rvs[i].endscreen_autoplay;
                }
              }
            }
            config.args.rvs = ytcenter.player.stringifyRVS(rvs);
          }
        }
      } else if (page === "embed") {
        if (ytcenter.settings.embed_forcePlayerType === "flash") {
          config.html5 = false;
        } else if (ytcenter.settings.embed_forcePlayerType === "html5" && !ytcenter.player.isLiveStream() && !ytcenter.player.isOnDemandStream()) {
          config.html5 = true;
          delete config.args.ad3_module;
        }
        if (ytcenter.settings.removeAdvertisements) {
          config = ytcenter.site.removeAdvertisement(config);
        }
        
        if (ytcenter.settings.embed_dashPlayback) {
          config.args.dash = "1";
        } else {
          config.args.dash = "0";
          config.args.dashmpd = "";
        }
        
        if (ytcenter.settings.embed_enableAutoVideoQuality) {
          config.args.vq = ytcenter.player.getQuality(ytcenter.settings.embed_autoVideoQuality, streams, (config.args.dash === "1" && config.args.adaptive_fmts ? true : false));
        }
        if (!ytcenter.settings.embed_enableAnnotations) {
          config.args.iv_load_policy = 3;
        } else {
          config.args.iv_load_policy = 1;
        }
        if (typeof ytcenter.settings.embed_autohide !== "undefined") {
          config.args.autohide = ytcenter.settings.embed_autohide;
        }
        if (!ytcenter.settings.embed_defaultAutoplay) config.args.autoplay = "0";
        
        config.args.theme = ytcenter.settings.embed_playerTheme;
        config.args.color = ytcenter.settings.embed_playerColor;
        
        ytcenter.player.setTheme(ytcenter.settings.playerTheme);
        ytcenter.player.setProgressColor(ytcenter.settings.playerColor);
        ytcenter.player.setAutoHide(ytcenter.settings.embed_autohide);
        
        if (ytcenter.settings.embed_bgcolor === "none") {
          config.args.keywords = ytcenter.utils.setKeyword(config.args.keywords, "yt:bgcolor", "");
        } else if (ytcenter.settings.embed_bgcolor !== "default" && ytcenter.settings.embed_bgcolor.indexOf("#") === 0) {
          config.args.keywords = ytcenter.utils.setKeyword(config.args.keywords, "yt:bgcolor", ytcenter.settings.embed_bgcolor);
        }
      } else if (page === "channel") {
        if (ytcenter.settings.channel_dashPlayback) {
          config.args.dash = "1";
        } else {
          config.args.dash = "0";
          config.args.dashmpd = "";
        }
        
        if (ytcenter.settings.channel_enableAutoVideoQuality) {
          config.args.vq = ytcenter.player.getQuality(ytcenter.settings.channel_autoVideoQuality, streams, (config.args.dash === "1" && config.args.adaptive_fmts ? true : false));
        }
        
        if (ytcenter.settings.removeAdvertisements) {
          config = ytcenter.site.removeAdvertisement(config);
        }
        if (!ytcenter.settings.channel_enableAnnotations) {
          config.args.iv_load_policy = 3;
        } else {
          config.args.iv_load_policy = 1;
        }
        if (typeof ytcenter.settings.channel_autohide != "undefined") {
          config.args.autohide = ytcenter.settings.channel_autohide;
        }
        
        /*if (ytcenter.settings.embed_defaultAutoplay) {
          if (loc.search.indexOf("ytcenter-autoplay=1") !== -1) {
            config.args.autoplay = "1";
          } else {
            config.args.autoplay = "0";
          }
        } else {
          config.args.autoplay = (ytcenter.settings.embed_preventAutoBuffer ? "0" : "1");
        }*/
        config.args.autoplay = "0";
        
        config.args.theme = ytcenter.settings.channel_playerTheme;
        config.args.color = ytcenter.settings.channel_playerColor;
        
        ytcenter.player.setTheme(ytcenter.settings.playerTheme);
        ytcenter.player.setProgressColor(ytcenter.settings.playerColor);
        ytcenter.player.setAutoHide(ytcenter.settings.channel_autohide);
        
        config.args.enablejsapi = "1";
        
        if (ytcenter.settings.channel_bgcolor === "none") {
          config.args.keywords = ytcenter.utils.setKeyword(config.args.keywords, "yt:bgcolor", "#000000");
        } else if (ytcenter.settings.channel_bgcolor !== "default" && ytcenter.settings.channel_bgcolor.indexOf("#") === 0) {
          config.args.keywords = ytcenter.utils.setKeyword(config.args.keywords, "yt:bgcolor", ytcenter.settings.channel_bgcolor);
        }
        
        if (document.getElementById("upsell-video")) {
          var swf_config = JSON.parse(document.getElementById("upsell-video").getAttribute("data-swf-config").replace(/&amp;/g, "&").replace(/&quot;/g, "\""));
          swf_config.args = config.args;
          config = swf_config;
          document.getElementById("upsell-video").setAttribute("data-swf-config", JSON.stringify(config).replace(/&/g, "&amp;").replace(/"/g, "&quot;"));
        }
      }
      
      return config;
    };
    ytcenter.player.getAPI = function(){
      if (loc.pathname.indexOf("/embed/") === 0 && uw.yt && uw.yt.player && uw.yt.player.getPlayerByElement) {
        return uw.yt.player.getPlayerByElement(document.getElementById("player"));
      }
      return ytcenter.player.__getAPI; // Note: Never use yt.palyer.embed function to fetch the API. Just catch the API through onYouTubePlayerReady.
    };
    ytcenter.player.setPlayerSize = function(center){
      ytcenter.settings.player_wide = (center ? true : false);
      ytcenter.utils.setCookie("wide", (center ? "1" : "0"), null, "/", 3600*60*24*30);
      ytcenter.saveSettings();
    };
    ytcenter.player.toggleLights = function(){
      if (ytcenter.player.isLightOff) {
        ytcenter.player.turnLightOn();
      } else {
        ytcenter.player.turnLightOff();
      }
    };
    ytcenter.player.turnLightOn = function(){};
    ytcenter.player.isLightOff = false;
    ytcenter.player.turnLightOff = (function(){
      var lightElement;
      return function(){
        if (!lightElement) {
          lightElement = document.createElement("div");
          lightElement.className = "ytcenter-lights-off-overlay hid";
          lightElement.style.background = ytcenter.settings.lightbulbBackgroundColor;
          lightElement.style.opacity = ytcenter.settings.lightbulbBackgroundOpaque/100;
          lightElement.style.filter = "alpha(opacity=" + ytcenter.settings.lightbulbBackgroundOpaque + ")";
          lightElement.addEventListener("click", function(){
            if (!ytcenter.settings["lightbulbClickThrough"]) ytcenter.player.turnLightOn();
          }, false);
          ytcenter.player.turnLightOn = function(){
            ytcenter.utils.addClass(lightElement, "hid");
            ytcenter.utils.removeClass(document.body, "ytcenter-lights-off");
            ytcenter.player.isLightOff = false;
          };
          document.body.appendChild(lightElement);
        }
        // Updating background color and opacity.
        lightElement.style.background = ytcenter.settings.lightbulbBackgroundColor;
        lightElement.style.opacity = ytcenter.settings.lightbulbBackgroundOpaque/100;
        lightElement.style.filter = "alpha(opacity=" + ytcenter.settings.lightbulbBackgroundOpaque + ")";
        
        ytcenter.utils.addClass(document.body, "ytcenter-lights-off");
        ytcenter.utils.removeClass(lightElement, "hid");
        ytcenter.player.isLightOff = true;
      };
    })();
    ytcenter.player.checkHTML5Support = function(){
      var v = document.createElement("video");
      if (v && !v.canPlayType) {
        return false;
      }
      
      var mp4 = v.canPlayType('video/mp4; codecs="avc1.42001E, mp4a.40.2"');
      var webm = v.canPlayType('video/webm; codecs="vp8.0, vorbis"');

      var found = false;
      for (var i = 0; i < ytcenter.video.streams.length; i++) {
        if (mp4 && ytcenter.video.streams[i].type.indexOf("video/mp4;") === 0) {
          found = true;
          break;
        } else if (webm && ytcenter.video.streams[i].type.indexOf("video/webm;") === 0) {
          found = true;
          break;
        }
      }
      return found;
    };
    ytcenter.player.setYTConfig = function(config){
      if (uw.yt && uw.yt.setConfig) uw.yt.setConfig(config);
    };
    ytcenter.player.getYTConfig = function(config){
      uw.yt.getConfig(config);
    };
    ytcenter.player.getConfig = function(){
      ytcenter.player.config = ytcenter.utils.cleanObject(ytcenter.player.config);
      return ytcenter.player.config;
    };
    ytcenter.player.getPlayerId = (function(){
      function verify() {
        var n = -1;
        ytcenter.utils.each(uw, function(key, value){
          if (key.indexOf("ytPlayer") !== 0) return; //  || key.indexOf(("player" + i), key.length - ("player" + i).length) !== -1
          var __n = key.substr(key.lastIndexOf("player") + "player".length);
          if (!/^\d+$/.test(__n)) return;
          var _n = parseInt(__n);
          if (_n > n)
            n = _n;
        });
        if (n > -1) verified = n;
      }
      var verified = 1;
      return function(){
        verify();
        return "player" + verified;
      };
    })();
    ytcenter.player.getReference = (function(){
      return function(playerid){
        ytcenter.player.reference = ytcenter.player.reference || {};
        if (playerid) {
          ytcenter.player.reference.playerId = playerid;
        }
        //ytcenter.player.reference.api = ytcenter.player.getAPI();
        if (ytcenter.page === "embed") {
          ytcenter.referenceMethod = "embed";
          if (document.getElementById("video-player")) {
            ytcenter.player.reference.target = document.getElementById("video-player");
          } else if (!ytcenter.html5 && document.getElementsByTagName("embed").length > 0) {
            ytcenter.player.reference.target = document.getElementsByTagName("embed")[0];
          }
          
          ytcenter.player.reference.config = ytcenter.player.getConfig();
        } else if (ytcenter.page === "channel") {
          ytcenter.referenceMethod = "channel";
          if (document.getElementById("movie_player")) {
            ytcenter.player.reference.target = document.getElementById("movie_player");
          } else if (!ytcenter.html5 && document.getElementsByTagName("embed").length > 0) {
            ytcenter.player.reference.target = document.getElementsByTagName("embed")[0];
          }
          ytcenter.player.reference.config = ytcenter.player.getConfig();
        } else {
          if (uw && uw.yt && uw.yt.config_ && uw.yt.config_.PLAYER_REFERENCE) {
            ytcenter.referenceMethod = "PLAYER REFERENCE";
            ytcenter.player.reference.api = uw.yt.config_.PLAYER_REFERENCE;
            ytcenter.player.reference.target = document.getElementById("movie_player") || document.getElementById("embed")[0];
            ytcenter.player.reference.onReadyCalled = true;
          } else if (document.getElementById("movie_player") || document.getElementsByTagName("embed").length > 0) {
            ytcenter.referenceMethod = "binding";
            ytcenter.player.reference.target = document.getElementById("movie_player") || document.getElementById("embed")[0];
            ytcenter.player.reference.onReadyCalled = true;
          }
          
          ytcenter.player.reference.html5 = ytcenter.html5;
        }
        return ytcenter.player.reference;
      };
    })();
    ytcenter.player.listeners = (function(){
      var maxIteration = 100,
          __r = {},
          events = {
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
      
      
      __r.addEventListener = function(event, listener){
        if (!(event in events)) return;
        __r.removeEventListener(event, listener);
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
      __r.getMasterWindowListener = function(a){
        return function(){
          var args = [], i;
          for (i = 0; i < arguments.length; i++) {
            args.push(arguments[i]);
          }
          args.push("ytcenter-override");
          con.log("[Player Listener] Override => " + a + " =>", args);
          events[a].masterListener.apply(null, args);
        };
      };
      __r.getMasterListener = function(a){
        return function(){
          if (events[a].override && arguments.length > 0 && arguments[arguments.length - 1] !== "ytcenter-override") {
            return;
          }
          con.log("[Player Listener] => " + a, arguments);
          var i, w = {
            getOriginalListener: function(){
              return function(){
                __r.originalListeners[a].apply(null, arguments);
              };
            }
          }, b = __r.setupOverride();
          if (events[a].override) {
            if (0 < arguments.length && arguments[arguments.length - 1] === "ytcenter-override") {
              for (i = 0; i < events[a].listeners.length; i++) {
                events[a].listeners[i].apply(w, arguments);
              }
            } else {
              con.error("[Player Listener] " + a + " => An override can't be called from YouTube!");
            }
          } else {
            for (i = 0; i < events[a].listeners.length; i++) {
              events[a].listeners[i].apply(w, arguments);
            }
          }
        };
      };
      __r.setupOverride = function(){
        if (!__r.initialized) return [];
        var a = [], b, event, i;
        for (event in __r.replacedListeners) {
          if (__r.replacedListeners.hasOwnProperty(event)) {
            b = event.replace(/player[0-9]+$/, "").replace(/^ytPlayer/, "");
            if (uw[event] !== events[b].masterWindowListener && uw[event] !== events[b].masterListener) {
              con.log("[Player Listener] YouTube Center injected listeners not present!");
              uw[event] = events[b].masterWindowListener;
              a.push(b);
            }
          }
        }
        return a;
      };
      __r.setupListeners = function(){
        var i, event;
        for (event in events) {
          if (events.hasOwnProperty(event)) {
            if (!events[event].masterListener)
              events[event].masterListener = __r.getMasterListener(event);
            if (!events[event].masterWindowListener)
              events[event].masterWindowListener = __r.getMasterWindowListener(event);
          }
        }
      };
      __r.initialized = false;
      __r.replacedListeners = {};
      __r.originalListeners = {};
      __r.playerNumber = 1;
      __r.setup = function(){ // Should only be called in onReady
        if (__r.initialized) {
          __r.setupOverride();
          return;
        }
        __r.initialized = true;
        var api = ytcenter.player.getAPI(),
            override = false,
            event,
            i, usEvent;
        con.log("[Player Listener] Setting up environment");
        __r.setupListeners();
        for (event in events) {
          if (events.hasOwnProperty(event)) {
            if (events[event].override) override = true;
            api.addEventListener(event, events[event].masterListener);
          }
        }
        ytcenter.unsafe.listeners = {};
        if (override) {
          api.addEventListener("onReady", function(){
            i = __r.getNewestPlayerId();
            for (event in events) {
              if (events.hasOwnProperty(event) && events[event].override) {
                usEvent = uw["ytPlayer" + event + "player" + i];
                if (usEvent && usEvent !== events[event].masterWindowListener && usEvent !== events[event].masterListener) {
                  con.log("masterWindowListener", usEvent);
                  __r.replacedListeners["ytPlayer" + event + "player" + i] = usEvent;
                  ytcenter.unsafe.listeners[event] = (function(fullEventName){
                    return function(){
                      try {
                        return __r.replacedListeners[fullEventName].apply(null, arguments);
                      } catch(e) {
                        
                      }
                    };
                  })("ytPlayer" + event + "player" + i);
                  __r.originalListeners[event] = uw["ytPlayer" + event + "player" + i];
                  uw["ytPlayer" + event + "player" + i] = events[event].masterWindowListener;
                }
              }
            }
          });
        }
      };
      __r.getNewestPlayerId = function(){
        var id = 1, a;
        ytcenter.utils.each(uw, function(key, value){
          if (key.indexOf("ytPlayer") !== -1) {
            a = parseInt(key.match(/player([0-9]+)$/)[1]);
            if (a > id)
              id = a;
          }
        });
        return id;
      };
      __r.dispose = function(){
        if (!__r.initialized) return;
        __r.initialized = false;
        var event,
            api = ytcenter.player.getAPI(), a;
        for (event in events) {
          if (events.hasOwnProperty(event)) {
            api.removeEventListener(event, events[event].masterListener);
          }
        }
        var id = __r.getNewestPlayerId(), _n, a;
        ytcenter.utils.each(uw, function(key, value){
          if (key.indexOf("ytPlayer") !== -1) {
            _n = parseInt(key.match(/player([0-9]+)$/)[1]);
            if (_n < id) {
              uw[key] = null;
            } else {
              a = event.replace(/player[0-9]+$/, "").replace(/^ytPlayer/, "");
              if (uw[event] === events[a].masterListener) {
                uw[event] = __r.replacedListeners[event];
              }
            }
          }
        });
      };
      return __r;
    })();
    ytcenter.player.setAutoHide = function(autohide){
      if (!ytcenter.html5) return;
      con.log("[HTML5 Player] Setting autohide to " + autohide);
      var target = ytcenter.player.getReference().target;
      if (target) {
        if (autohide === "0") {
          ytcenter.utils.addClass(target, "autohide-off");
          ytcenter.utils.removeClass(target, "autohide-on autohide-fade autohide-auto");
        } else if (autohide === "1") {
          ytcenter.utils.addClass(target, "autohide-on");
          ytcenter.utils.removeClass(target, "autohide-off autohide-fade autohide-auto");
        } else if (autohide === "2") {
          ytcenter.utils.addClass(target, "autohide-fade");
          ytcenter.utils.removeClass(target, "autohide-on autohide-off autohide-auto");
        } else if (autohide === "3") {
          ytcenter.utils.addClass(target, "autohide-auto");
          ytcenter.utils.removeClass(target, "autohide-on autohide-fade autohide-off");
        }
        ytcenter.events.performEvent("resize-update");
      }
    };
    ytcenter.player.setTheme = function(theme){
      if (!ytcenter.html5) return;
      con.log("[HTML5 Player] Setting player theme to " + theme);
      var light = "light-theme",
          dark = "dark-theme",
          target = ytcenter.player.getReference().target;
      if (target) {
        if (theme === "dark") {
          ytcenter.utils.removeClass(target, light);
          ytcenter.utils.addClass(target, dark);
        } else if (theme === "light") {
          ytcenter.utils.removeClass(target, dark);
          ytcenter.utils.addClass(target, light);
        }
      }
    };
    ytcenter.player.setProgressColor = function(color){
      if (!ytcenter.html5) return;
      con.log("[HTML5 Player] Setting player progress color to " + color);
      var white = "white",
          red = "red",
          els = document.getElementsByClassName("html5-progress-bar"), i;
      for (i = 0; i < els.length; i++) {
        if (color === "red") {
          ytcenter.utils.removeClass(els[i], white);
          ytcenter.utils.addClass(els[i], red);
        } else if (color === "white") {
          ytcenter.utils.removeClass(els[i], red);
          ytcenter.utils.addClass(els[i], white);
        }
      }
      ytcenter.classManagement.applyClasses();
    };
    ytcenter.player.aspect = function(option){
      var config = ytcenter.player.getConfig();
      config.args.keywords = option;
      con.log("Keywords changed to " + config.args.keywords);
      var api = ytcenter.player.getAPI();
      var muted = api.isMuted();
      var volume = api.getVolume();
      var rate = api.getPlaybackRate();
      var quality = api.getPlaybackQuality();
      var time = api.getCurrentTime();
      var state = api.getPlayerState();
      var dur = api.getDuration();
      if (state === 0) {
        time = dur + 60;
      }
      var __c = function(s){
        if (s !== 1) return;
        ytcenter.player.listeners.removeEventListener("onStateChange", __c);
        con.log("Setting player option to last player");
        if (state === -1) {
          api.stopVideo();
        } else if (state === 2) {
          api.pauseVideo();
          api.seekTo(time);
        } else {
          api.seekTo(time);
        }
        
        api.setVolume(volume);
        if (muted) {
          api.mute(muted);
        }
        api.setPlaybackRate(rate);
        api.setPlaybackQuality(quality);
        
        con.log("Made a live refresh");
      };
      ytcenter.player.listeners.addEventListener("onStateChange", __c);
      api.loadVideoByPlayerVars(ytcenter.player.getConfig().args);
      
      if (config.args.dash === "1" && config.args.adaptive_fmts) {
        ytcenter.player.setRatio(ytcenter.player.calculateRatio(true, option));
      } else {
        ytcenter.player.setRatio(ytcenter.player.calculateRatio(false, option));
      }
      ytcenter.player.resizeUpdater();
    };
    ytcenter.player.currentResizeId;
    ytcenter.player.resizeCallback = [];
    ytcenter.player.updateResize = (function(){
      var scrollToPlayerButtonArrow, scrollToPlayerButton = null;
      var getSizeById = function(id) {
        var sizes = ytcenter.settings["resize-playersizes"];
        for (var i = 0; i < sizes.length; i++) {
          if (id === sizes[i].id) {
            return sizes[i];
          }
        }
        return {
          id: "default",
          config: {
            align: true,
            height: "",
            large: false,
            scrollToPlayer: false,
            scrollToPlayerButton: false,
            width: ""
          }
        };
      }
      var updatescrollToPlayerButtonPosition = function(){
        if (!ytcenter.settings.enableResize) return;
        if (ytcenter.settings['experimentalFeatureTopGuide']) {
          if (document.getElementById("appbar-menu") && !scrollToPlayerButton.parentNode)
            document.getElementById("appbar-menu").insertBefore(scrollToPlayerButton, document.getElementById("appbar-menu").children[0]);
        } else if (ytcenter.settings['ytExperimentFixedTopbar']) {
          if (document.getElementById("yt-masthead-container") && !scrollToPlayerButton.parentNode)
            document.getElementById("yt-masthead-container").appendChild(scrollToPlayerButton);
        } else {
          if ((document.getElementById("player-legacy") || document.getElementById("player")) && !scrollToPlayerButton.parentNode)
            (document.getElementById("player-legacy") || document.getElementById("player")).appendChild(scrollToPlayerButton);
          if (scrollToPlayerButton && (document.getElementById("player-api-legacy") || document.getElementById("player-api")))
            scrollToPlayerButton.style.right = "10px";
          scrollToPlayerButton.style.top = (document.getElementById("watch7-playlist-data") ? "-13" : "-28") + "px";
        }
      };
      var updatescrollToPlayerButtonVisibility = function(){
        if (!ytcenter.settings.enableResize) {
          scrollToPlayerButton.style.display = "none";
          return;
        }
        try {
          if (ytcenter.settings['experimentalFeatureTopGuide']) {
            scrollToPlayerButton.style.bottom = "";
            scrollToPlayerButton.style.right = "";
            scrollToPlayerButton.style.position = "";
          } else if (ytcenter.settings['ytExperimentFixedTopbar']) {
            scrollToPlayerButton.style.bottom = "0px";
            scrollToPlayerButton.style.right = "0px";
          } else {
            scrollToPlayerButton.style.borderBottom = "0px";
            scrollToPlayerButton.style.top = (document.getElementById("watch7-playlist-data") ? "-13" : "-28") + "px";
          }
          if (ytcenter.settings['experimentalFeatureTopGuide']) {
            if (document.getElementById("appbar-menu") && !scrollToPlayerButton.parentNode)
              document.getElementById("appbar-menu").insertBefore(scrollToPlayerButton, document.getElementById("appbar-menu").children[0]);
            var _s = getSizeById(ytcenter.player.currentResizeId);
            if (_s.config.scrollToPlayerButton) {
              scrollToPlayerButton.style.display = "";
            } else {
              scrollToPlayerButton.style.display = "none";
            }
          } else if (ytcenter.settings['ytExperimentFixedTopbar']) {
            if (document.getElementById("yt-masthead-container") && !scrollToPlayerButton.parentNode)
              document.getElementById("yt-masthead-container").appendChild(scrollToPlayerButton);
            var _s = getSizeById(ytcenter.player.currentResizeId);
            if (_s.config.scrollToPlayerButton) {
              scrollToPlayerButton.style.display = "block";
            } else {
              scrollToPlayerButton.style.display = "none";
            }
          } else {
            if ((document.getElementById("player-legacy") || document.getElementById("player")) && !scrollToPlayerButton.parentNode)
              (document.getElementById("player-legacy") || document.getElementById("player")).appendChild(scrollToPlayerButton);
            var _s = getSizeById(ytcenter.player.currentResizeId);
            if (_s.config.scrollToPlayerButton) {
              scrollToPlayerButton.style.display = "block";
            } else {
              scrollToPlayerButton.style.display = "none";
            }
          }
        } catch (e) {
          con.error(e);
        }
      };
      ytcenter.player.updateResize_updatePosition = updatescrollToPlayerButtonPosition;
      ytcenter.player.updateResize_updateVisibility = updatescrollToPlayerButtonVisibility;
      
      scrollToPlayerButtonArrow = document.createElement("img");
      scrollToPlayerButtonArrow.className = "yt-uix-button-arrow";
      scrollToPlayerButtonArrow.src = "//s.ytimg.com/yt/img/pixel-vfl3z5WfW.gif";
      scrollToPlayerButtonArrow.alt = "";
      scrollToPlayerButtonArrow.setAttribute("alt", "");
      scrollToPlayerButtonArrow.style.marginLeft = "0";
      scrollToPlayerButtonArrow.style.display = "inline-block";
      scrollToPlayerButton = ytcenter.gui.createYouTubeDefaultButton("SCROLL_TOOLTIP", [scrollToPlayerButtonArrow]);
      if (ytcenter.settings.experimentalFeatureTopGuide) {
        scrollToPlayerButton.className = "yt-uix-button yt-uix-button-appbar yt-uix-button-size-default yt-uix-button-empty yt-uix-tooltip";
      }
      scrollToPlayerButton.style.display = "block";
      scrollToPlayerButton.style.position = "absolute";
      scrollToPlayerButton.addEventListener("click", function(){
        if (!ytcenter.settings.enableResize) return;
        if ((ytcenter.settings['experimentalFeatureTopGuide'] || ytcenter.settings['ytExperimentFixedTopbar']) && !ytcenter.settings.ytExperimentalLayotTopbarStatic) {
          var posY = 0,
              scrollElm = (document.getElementById("player-api-legacy") || document.getElementById("player-api")),
              t = ytcenter.utils.getOffset((document.getElementById("player-api-legacy") || document.getElementById("player-api"))).top,
              mp = document.getElementById("masthead-positioner");
          while (scrollElm != null) {
            posY += scrollElm.offsetTop;
            scrollElm = scrollElm.offsetParent;
          }
          window.scrollTo(0, posY - mp.offsetHeight + (ytcenter.settings['experimentalFeatureTopGuide'] ? (document.getElementById("yt-masthead-container").offsetHeight + 2) : 0));
          if (ytcenter.settings['experimentalFeatureTopGuide']) {
            uw.setTimeout(function(){
              document.getElementById("masthead-positioner").style.top = -(document.getElementById("yt-masthead-container").offsetHeight + 1) + "px";
              ytcenter.player._mastheadHeightListenerUpdate && ytcenter.player._mastheadHeightListenerUpdate();
            }, 750);
          }
        } else {
          (document.getElementById("player-api-legacy") || document.getElementById("player-api")).scrollIntoView();
        }
      }, false);
      
      return function(){
        if (!ytcenter.settings.enableResize) return;
        var _s = getSizeById(ytcenter.player.currentResizeId);
        ytcenter.player.resize(_s);
        if (_s.config.scrollToPlayer && ytcenter.getPage() === "watch" && ((ytcenter.settings.topScrollPlayerEnabled && !ytcenter.settings.topScrollPlayerActivated) || !ytcenter.settings.topScrollPlayerEnabled)) {
          if ((ytcenter.settings['experimentalFeatureTopGuide'] || ytcenter.settings['ytExperimentFixedTopbar']) && !ytcenter.settings.ytExperimentalLayotTopbarStatic) {
            var posY = 0,
                scrollElm = (document.getElementById("player-api-legacy") || document.getElementById("player-api")),
                mp = document.getElementById("masthead-positioner");
            while (scrollElm != null) {
              posY += scrollElm.offsetTop;
              scrollElm = scrollElm.offsetParent;
            }
            window.scrollTo(0, posY - mp.offsetHeight + (ytcenter.settings['experimentalFeatureTopGuide'] ? (document.getElementById("yt-masthead-container").offsetHeight + 2) : 0));
            if (ytcenter.settings['experimentalFeatureTopGuide']) {
              uw.setTimeout(function(){
                document.getElementById("masthead-positioner").style.top = -(document.getElementById("yt-masthead-container").offsetHeight + 1) + "px";
                ytcenter.player._mastheadHeightListenerUpdate && ytcenter.player._mastheadHeightListenerUpdate();
              }, 750);
            }
          } else {
            (document.getElementById("player-api-legacy") || document.getElementById("player-api")).scrollIntoView();
          }
        }
        
        updatescrollToPlayerButtonVisibility();
        updatescrollToPlayerButtonPosition();
      };
    })();
    ytcenter.player.isPlayerAligned = function(){
      function getSizeById(id) {
        var sizes = ytcenter.settings["resize-playersizes"];
        for (var i = 0; i < sizes.length; i++) {
          if (id === sizes[i].id) {
            return sizes[i];
          }
        }
        return {
          id: "default",
          config: {
            align: true,
            height: "",
            large: false,
            scrollToPlayer: false,
            scrollToPlayerButton: false,
            width: ""
          }
        };
      }
      if (ytcenter.settings["resize-default-playersize"] === "default") {
        ytcenter.player.currentResizeId = (ytcenter.settings.player_wide ? ytcenter.settings["resize-large-button"] : ytcenter.settings["resize-small-button"]);
      } else {
        ytcenter.player.currentResizeId = ytcenter.settings['resize-default-playersize'];
      }
      var playerSize = getSizeById(ytcenter.player.currentResizeId);
      return playerSize.config.align;
    };
    ytcenter.player.getPlayerSize = function(id){
      for (var i = 0; i < ytcenter.settings["resize-playersizes"].length; i++) {
        if (ytcenter.settings["resize-playersizes"][i].id === id)
          return ytcenter.settings["resize-playersizes"][i];
      }
      // default
      return {
        id: "default",
        config: {
          align: true,
          height: "",
          large: false,
          scrollToPlayer: false,
          scrollToPlayerButton: false,
          width: ""
        }
      };
    };
    ytcenter.player.resize = (function(){
      var lastResizeId;
      ytcenter.player.resizeUpdater = function(){
        if (!ytcenter.settings.enableResize) return;
        ytcenter.player.resize(ytcenter.player.getPlayerSize(lastResizeId));
        ytcenter.player.updateResize_updateVisibility();
        ytcenter.player.updateResize_updatePosition();
      };
      ytcenter.player.isSelectedPlayerSizeById = function(id){
        if (!ytcenter.settings.enableResize) return;
        try {
          if (lastResizeId === id)
            return true;
        } catch (e) {}
        return false;
      };
      var __r_timeout;
      return function(item){
        if (!ytcenter.settings.enableResize) return;
        try {
          if (typeof item !== "undefined") lastResizeId = item.id;
          if (typeof lastResizeId === "undefined") return;
          uw.clearTimeout(__r_timeout);
          ytcenter.player._resize(item.config.width, item.config.height, item.config.large, item.config.align);
          ytcenter.player.updateResize_updateVisibility();
          ytcenter.player.updateResize_updatePosition();
          ytcenter.utils.each(ytcenter.player.resizeCallback, function(i, func){
            func();
          });
        } catch (e) {
          con.error(e);
        }
      };
    })();
    ytcenter.player.ratio = 16/9;
    ytcenter.player.setRatio = function(ratio){
      con.log("[Player Ratio] Player ratio set to " + ratio);
      ytcenter.player.ratio = ratio;
    };
    ytcenter.player._resize = (function(){
      var _width = "";
      var _height = "";
      var _large = true;
      var _align = true;
      var _playlist_toggled = false;
      var _playerHeight = 0;
      
      var player_ratio = 16/9;
      var playerBarHeight = 30;
      var playerBarHeightNone = 0;
      var playerBarHeightProgress = 3;
      var playerBarHeightBoth = 35;
      var maxInsidePlayerWidth = 985; // Is 1003px for the experimental design
      
      ytcenter.player._mastheadHeightListener = function(){
        return;
        if (document.getElementById("masthead-positioner-height-offset") && document.getElementById("masthead-positioner") && ytcenter.settings['experimentalFeatureTopGuide']) {
          ytcenter.player._mastheadHeightListenerUpdate = function(){
            top = positioner.style.top ? parseInt(positioner.style.top) : 0;
            update();
          };
          ytcenter.player._mastheadHeightListener = null;
        }
      };
      
      ytcenter.player._updateResize = function(){
        if (!ytcenter.settings.enableResize) return;
        ytcenter.player._resize(_width, _height, _large, _align);
        ytcenter.player.updateResize_updateVisibility();
        ytcenter.player.updateResize_updatePosition();
      };
      ytcenter.player.getCurrentPlayerSize = function(){
        return {
          width: _width,
          height: _height,
          large: _large,
          align: _align,
          playerHeight: _playerHeight
        };
      };
      ytcenter.events.addEvent("ui-refresh", function(){
        if (!ytcenter.settings.enableResize) return;
        ytcenter.player._resize(_width, _height, _large, _align);
      });
      ytcenter.events.addEvent("resize-update", function(){
        if (!ytcenter.settings.enableResize) return;
        ytcenter.player._resize(_width, _height, _large, _align);
      });
      window.addEventListener("resize", (function(){
        var timer = null;
        return function(){
          if (!ytcenter.settings.enableResize) return;
          if (timer !== null) uw.clearTimeout(timer);
          timer = uw.setTimeout(function(){
            ytcenter.events.performEvent("resize-update");
          }, 100);
        };
      })(), false);
      return function(width, height, large, align){
        if (!ytcenter.settings.enableResize) return;
        if (ytcenter.getPage() !== "watch") return;
        
        if (ytcenter.settings['experimentalFeatureTopGuide']) {
          maxInsidePlayerWidth = 1003;
          ytcenter.player._mastheadHeightListener && ytcenter.player._mastheadHeightListener();
        }
        
        width = width || "";
        height = height || "";
        if (typeof large !== "boolean") large = false;
        if (typeof align !== "boolean") align = false;
        _width = width;
        _height = height;
        _large = large;
        _align = align;
        
        if (ytcenter.player.darkside()) {
          ytcenter.utils.addClass(document.body, "ytcenter-player-darkside-bg");
        } else {
          ytcenter.utils.removeClass(document.body, "ytcenter-player-darkside-bg");
        }
        
        // Class Assignment
        var wc = document.getElementById("watch7-container");
        if (wc) {
          if (large) {
            ytcenter.utils.addClass(wc, "watch-wide");
          } else {
            ytcenter.utils.removeClass(wc, "watch-wide");
          }
        }
        var p = (document.getElementById("player-legacy") || document.getElementById("player"));
        if (p) {
          if (large) {
            ytcenter.utils.addClass(p, "watch-medium");
            if (!_playlist_toggled) {
              ytcenter.utils.addClass(p, "watch-playlist-collapsed");
            }
          } else {
            ytcenter.utils.removeClass(p, "watch-medium");
            if (ytcenter.utils.hasClass(p, "watch-playlist-collapsed")) {
              _playlist_toggled = false;
            } else {
              _playlist_toggled = true;
            }
            ytcenter.utils.removeClass(p, "watch-playlist-collapsed");
          }
        }
        if (align) {
          ytcenter.utils.addClass(document.body, "ytcenter-resize-aligned");
          ytcenter.utils.removeClass(document.body, "ytcenter-resize-disaligned");
        } else {
          ytcenter.utils.removeClass(document.body, "ytcenter-resize-aligned");
          ytcenter.utils.addClass(document.body, "ytcenter-resize-disaligned");
        }
        
        // Settings the sizes for small and large. If width and height is undefined
        if (isNaN(parseInt(width)) && isNaN(parseInt(height))) {
          if (large) {
            width = "854px";
            height = "";
          } else {
            width = "640px";
            height = "";
          }
        }
        
        var pbh = 0;
        var _pbh = 0;
        var pbh_changed = false;
        if (ytcenter.html5) {
          if (ytcenter.settings.autohide === "0") {
            pbh = playerBarHeightBoth;
            _pbh = playerBarHeightBoth;
          } else if (ytcenter.settings.autohide === "1") {
            pbh = playerBarHeightNone;
            _pbh = playerBarHeightNone;
          } else if (ytcenter.settings.autohide === "2") {
            pbh = playerBarHeight;
            _pbh = playerBarHeight;
          } else if (ytcenter.settings.autohide === "3") {
            pbh = playerBarHeightProgress;
            _pbh = playerBarHeightProgress;
          }
        } else if (ytcenter.player.config && ytcenter.player.config.args) {
          if (ytcenter.player.config.args.autohide === "0") {
            pbh = playerBarHeightBoth;
            _pbh = playerBarHeightBoth;
          } else if (ytcenter.player.config.args.autohide === "1") {
            pbh = playerBarHeightNone;
            _pbh = playerBarHeightNone;
          } else if (ytcenter.player.config.args.autohide === "2") {
            pbh = playerBarHeight;
            _pbh = playerBarHeight;
          } else if (ytcenter.player.config.args.autohide === "3") {
            pbh = playerBarHeightProgress;
            _pbh = playerBarHeightProgress;
          }
        }
        
        var clientWidth = document.documentElement.clientWidth || window.innerWidth || document.body.clientWidth;
        var clientHeight = document.documentElement.clientHeight || window.innerHeight || document.body.clientHeight;
        
        var calcWidth, calcHeight,
            calcedWidth = false, calcedHeight = false;
        if (width.match(/%$/) && width.length > 1) {
          calcWidth = parseInt(width)/100*clientWidth;
        } else if (width.length > 1) {
          calcWidth = parseInt(width);
        }
        if (height.match(/%$/) && height.length > 1) {
          var mp = document.getElementById("masthead-positioner-height-offset");
          calcHeight = parseInt(height)/100*clientHeight;
          if (mp && (ytcenter.settings['experimentalFeatureTopGuide'] || ytcenter.settings['ytExperimentFixedTopbar']) && !ytcenter.settings.ytExperimentalLayotTopbarStatic) {
            calcHeight -= (mp.offsetHeight || mp.clientHeight) - (ytcenter.settings['ytExperimentFixedTopbar'] ? 1 : (document.getElementById("yt-masthead-container").offsetHeight + 1));
          }
          pbh = 0;
          pbh_changed = true;
        } else if (height.length > 1) {
          calcHeight = parseInt(height);
        }
        if (!isNaN(calcWidth) && isNaN(calcHeight) && !calcedHeight) {
          calcedHeight = true;
          if (ytcenter.player.ratio !== 0) calcHeight = Math.round(calcWidth/ytcenter.player.ratio);
          else calcHeight = calcWidth;
        } else if (isNaN(calcWidth) && !isNaN(calcHeight) && !calcedWidth) {
          calcedWidth = true;
          if (height.indexOf("%") !== -1 && height.match(/%$/) && height !== "%") {
            calcWidth = Math.round((calcHeight - _pbh)*ytcenter.player.ratio);
          } else {
            calcWidth = Math.round(calcHeight*ytcenter.player.ratio);
          }
        }
        
        if (isNaN(calcWidth)) calcWidth = 0;
        if (isNaN(calcHeight)) calcHeight = 0;
        
        // Player Dimension
        var player = document.getElementById("player-legacy") || document.getElementById("player"),
            playerAPI = document.getElementById("player-api-legacy") || document.getElementById("player-api"),
            content = document.getElementById("watch7-main-container"),
            contentMain = document.getElementById("watch7-main"),
            playlist = document.getElementById("watch7-playlist-tray-container"),
            playerWidth = Math.round(calcWidth),
            playerHeight = Math.round(calcHeight + pbh),
            playlist_el = document.getElementById("playlist-legacy") || document.getElementById("playlist");
        
        ytcenter.player.fixAnnotations.setPreferredDimension(calcWidth, calcHeight);
        ytcenter.player.fixAnnotations.forceUpdate();
        
        if (player && player.className && player.className.indexOf("watch-multicamera") !== -1 && !ytcenter.html5) {
          playerHeight = playerHeight + 80;
        }
        
        if (playlist_el) {
          playlist_el.style.width = (large ? (align && playerWidth < maxInsidePlayerWidth ? maxInsidePlayerWidth : playerWidth) : maxInsidePlayerWidth) + "px";
        }
        if (player) {
          player.style.position = "";
          player.style.left = "";
          player.style.marginBottom = "";
          if (ytcenter.settings['experimentalFeatureTopGuide']) {
            player.style.width = (large ? playerWidth : maxInsidePlayerWidth) + "px";
            if (large && align && playerWidth < maxInsidePlayerWidth) {
              player.style.setProperty("position", "relative", "important");
              player.style.setProperty("left", (-(maxInsidePlayerWidth - playerWidth)/2) + "px", "important");
            }
            if (large) {
              player.style.setProperty("margin-bottom", "28px", "important");
            }
          } else {
            player.style.setProperty("margin-bottom", "", "");
            player.style.width = (large ? (align && playerWidth < maxInsidePlayerWidth ? maxInsidePlayerWidth : playerWidth) : maxInsidePlayerWidth) + "px";
          }
          
          if (playerAPI) {
            playerAPI.style.width = playerWidth + "px";
            playerAPI.style.height = playerHeight + "px";
            _playerHeight = playerHeight;
          }
          if (!ytcenter.settings['experimentalFeatureTopGuide'] && content) {
            content.style.width = maxInsidePlayerWidth + "px";
          }
        }
        
        // Sidebar
        if (document.getElementById("watch7-sidebar")) {
          if (!large && !document.getElementById("watch7-playlist-data")) {
            var mt = calcHeight + pbh + (document.getElementById("watch7-creator-bar") ? 48 : 0);
            if (ytcenter.utils.hasClass(document.getElementById("watch7-container"), "watch-branded-banner") && !ytcenter.settings.removeBrandingBanner)
              mt += 70;
            document.getElementById("watch7-sidebar").style.marginTop = "-" + mt + "px";
          } else {
            document.getElementById("watch7-sidebar").style.marginTop = "";
          }
        }
        
        // Content
        if (!ytcenter.settings['experimentalFeatureTopGuide']) {
          if (ytcenter.settings.watch7centerpage && contentMain) {
            if (clientWidth < calcWidth) {
              var __w = Math.floor(clientWidth/2 - maxInsidePlayerWidth/2);
              if (__w < 180) __w = 180;
              if (clientWidth > 1165 && __w > 180) {
                contentMain.style.setProperty("margin-left", __w + "px", "important");
                if (document.getElementById("watch7-main-container"))
                  document.getElementById("watch7-main-container").style.margin = "0";
              } else {
                contentMain.style.setProperty("margin-left", "", "important");
              
                if (document.getElementById("watch7-main-container"))
                  document.getElementById("watch7-main-container").style.margin = "";
              }
              contentMain.style.setProperty("margin-right", "", "important");
              
              ytcenter.utils.removeClass(document.body, "ytcenter-content-margin");
            } else if (!align) {
              ytcenter.utils.addClass(document.body, "ytcenter-content-margin");
              contentMain.style.setProperty("margin-left", "", "important");
              if (document.getElementById("watch7-main-container"))
                document.getElementById("watch7-main-container").style.margin = "";
            } else {
              ytcenter.utils.removeClass(document.body, "ytcenter-content-margin");
              contentMain.style.setProperty("margin-left", "", "important");
              if (document.getElementById("watch7-main-container"))
                document.getElementById("watch7-main-container").style.margin = "";
            }
          } else {
            ytcenter.utils.removeClass(document.body, "ytcenter-content-margin");
            if (contentMain) contentMain.style.setProperty("margin-left", "", "important");
            if (document.getElementById("watch7-main-container"))
              document.getElementById("watch7-main-container").style.margin = "";
          }
        }
        // Playlist
        if (playlist) {
          var playlistElement = document.getElementById("watch7-playlist-data"),
              playlistBar,
              __playlistWidth = Math.round(calcWidth),
              __playlistRealWidth = __playlistWidth*0.5;
          if (__playlistRealWidth < 275) __playlistRealWidth = 275;
          else if (__playlistRealWidth > 400) __playlistRealWidth = 400;
          playlist.style.width = (large ? __playlistRealWidth + "px" : "auto");
          playlist.style.height = Math.round(calcHeight - (large ? (playerBarHeight - pbh) - 3 : -pbh)) + "px";
          
          if (playlistElement) playlistBar = playlistElement.children[0];
          
          if (playlistBar && playlistBar.children[0] && playlistBar.children[1]) {
            playlistBar.style.width = (large ? __playlistWidth : maxInsidePlayerWidth) + "px";
            playlistBar.children[0].style.width = ((large ? __playlistWidth - __playlistRealWidth : __playlistWidth)) + "px";
            playlistBar.children[1].style.width = (large ? "auto" : (maxInsidePlayerWidth - __playlistWidth) + "px");
          }
        
        
          if (document.getElementById("playlist-tray") || document.getElementById("playlist-tray-legacy")) {
            (document.getElementById("playlist-tray") || document.getElementById("playlist-tray-legacy")).style.width = (large ? __playlistWidth : maxInsidePlayerWidth) + "px";
          }
          
          playlist.style.right = "0";
          playlist.style.left = "auto";
        }
        
        var creatorBar = document.getElementById("watch7-creator-bar");
        if (creatorBar && !ytcenter.settings['experimentalFeatureTopGuide']) {
          creatorBar.style.width = Math.round(calcWidth - 40) + "px";
        }
        
        if (!ytcenter.settings['experimentalFeatureTopGuide']) {
          // Guide
          if (!align) {
            if (document.getElementById("guide-container")) {
              var gct = playerHeight;
              if (document.getElementById("watch7-playlist-data")) {
                gct += 35;
              }
              if (document.getElementById("watch7-creator-bar")) {
                gct += 48;
              }
              ytcenter.guide.top = gct;
            }
          } else {
            ytcenter.guide.top = null;
          }
          if (ytcenter.settings.watch7playerguidehide && !align) {
            ytcenter.guide.hidden = true;
          } else if (!ytcenter.settings.watch7playerguidealwayshide && ytcenter.settings.watch7playerguidehide && align) {
            ytcenter.guide.hidden = false;
          } else if (!ytcenter.settings.watch7playerguidealwayshide && !ytcenter.settings.watch7playerguidehide) {
            ytcenter.guide.hidden = false;
          }
        }
        
        // Guide + Main Center
        if (!ytcenter.settings['experimentalFeatureTopGuide']) {
          if (!align && ytcenter.settings.watch7centerpage) {
            var cl = clientWidth/2 - maxInsidePlayerWidth/2;
            var clg = cl - 180;
            if (cl < 190) cl = 190;
            if (clg < 10) clg = 10;
            if (clientWidth <= 1165) {
              cl = 0;
              clg = 10;
            }
            ytcenter.guide.left = clg;
            if (document.getElementById("page-container")) {
              if (clientWidth <= 1325) {
                document.getElementById("page-container").style.width = "100%";
              } else {
                document.getElementById("page-container").style.width = "";
              }
            }
          } else {
            ytcenter.guide.left = null;
            if (document.getElementById("page-container"))
              document.getElementById("page-container").style.width = "";
          }
          ytcenter.guide.update();
        }
        
        // Player
        var wp = document.getElementById("player-api-legacy") || document.getElementById("player-api");
        if (wp) {
          if (width !== "" || height !== "") {
            wp.style.width = Math.round(calcWidth) + "px";
            wp.style.height = Math.round(calcHeight + pbh + (player.className.indexOf("watch-multicamera") !== -1 && !ytcenter.html5 ? 80 : 0)) + "px";
            _playerHeight = Math.round(calcHeight + pbh + (player.className.indexOf("watch-multicamera") !== -1 && !ytcenter.html5 ? 80 : 0));
          } else {
            wp.style.width = "";
            wp.style.height = "";
            document.getElementById("playlist-tray").style.top = "";
          }
          if (calcWidth > maxInsidePlayerWidth) {
            wp.style.margin = "";
            if (align) {
              wp.style.marginLeft = "";
            } else {
              var wvOffset = $GetOffset(player);
              var mLeft = Math.round(-(calcWidth - maxInsidePlayerWidth)/2);
              if (-mLeft > wvOffset[0]) mLeft = -wvOffset[0];
              wp.style.marginLeft = mLeft + "px";
            }
          } else {
            wp.style.marginLeft = "";
            if (align) {
              wp.style.margin = "";
            } else {
              wp.style.margin = "0 auto";
            }
          }
        
          if (width === "100%") {
            wp.style.setProperty("margin-left", "0px", "important");
            wp.style.setProperty("margin-right", "0px", "important");
          } else {
            wp.style.marginLeft = "";
            wp.style.marginRight = "";
          }
        }
        
        if (ytcenter.settings['experimentalFeatureTopGuide']) {
          var playlistElement = document.getElementById("watch7-playlist-data"),
              playlistBar;
          if (playlistElement) playlistBar = playlistElement.children[0];
          if (playlistBar && playlistBar.children[0] && playlistBar.children[1]) {
            playlistBar.style.width = (large ? __playlistWidth : maxInsidePlayerWidth) + "px";
            playlistBar.children[0].style.width = ((large ? __playlistWidth - __playlistRealWidth : __playlistWidth)) + "px";
            playlistBar.children[1].style.width = (large ? "auto" : (maxInsidePlayerWidth - __playlistWidth) + "px");
            
            var playlistTrayContainer = document.getElementById("watch7-playlist-tray-container");
            if (playlistTrayContainer) {
              var __h = Math.round(calcHeight - (large ? (playerBarHeight - pbh) - 3 : -pbh));
              playlistTrayContainer.style.height = __h + "px";
              var playlistTray = document.getElementById("watch7-playlist-tray");
              if (playlistTray) {
                playlistTray.style.height = Math.round(__h - (large ? 0 : 27)) + "px";
              }
              playlistTrayContainer.style.width = (large ? __playlistRealWidth : maxInsidePlayerWidth - __playlistWidth) + "px";
              
              if (large) {
                playlistTrayContainer.style.left = (large ? __playlistWidth - __playlistRealWidth : __playlistWidth) + "px";
              } else {
                playlistTrayContainer.style.left = "";
              }
              
              var playlistTrayPositioning = document.getElementById("watch7-playlist-tray-positioning");
              if (playlistTrayPositioning) {
                playlistTrayPositioning.style.width = __playlistWidth + "px";
                if (align) {
                  playlistTrayPositioning.style.margin = "";
                } else {
                  playlistTrayPositioning.style.margin = "0 auto";
                }
              }
            }
          }
          
          var p = document.getElementById("player-legacy") || document.getElementById("player");
          if (p) {
            if (calcWidth > maxInsidePlayerWidth) {
              p.style.margin = "";
              if (align) {
                p.style.marginLeft = "";
              } else {
                var ml = Math.round(-(calcWidth - maxInsidePlayerWidth)/2);
                if (document.getElementById("watch7-container")) {
                  var off = ytcenter.utils.getOffset(document.getElementById("watch7-container"));
                  if (-ml > off.left) ml = -off.left;
                }
                p.style.marginLeft = ml + "px";
              }
            } else {
              p.style.marginLeft = "";
              if (align) {
                p.style.margin = "";
              } else {
                p.style.margin = "0 auto";
              }
            }
          }
        }
      };
    })();
    ytcenter.player.fixAnnotations = (function(){
      function getOriginalVideoDimension() {
        var videoContentElement, dim = [854, 480];
        
        videoContentElement = document.getElementsByClassName("html5-video-content");
        if (!videoContentElement || !videoContentElement[0]) return dim;
        
        if (videoContentElement[0].style.width)
          dim[0] = parseInt(videoContentElement[0].style.width, 10);
        if (videoContentElement[0].style.height)
          dim[1] = parseInt(videoContentElement[0].style.height, 10);
        return dim;
      }
      function getCurrentVideoDimension() {
        return [pWidth, pHeight];
      }
      function fixAnnotation(annotation, dim, cDim) {
        var top = 0, left = 0, wid = 0, hei = 0, fs = 0;
        if (ytcenter.utils.inArray(anns, annotation)) return;
        
        if (annotation.style.top)
          top = parseFloat(annotation.style.top, 10);
        if (annotation.style.left)
          left = parseFloat(annotation.style.left, 10);
        if (annotation.style.width)
          wid = parseFloat(annotation.style.width, 10);
        if (annotation.style.height)
          hei = parseFloat(annotation.style.height, 10);
        if (annotation.style.fontSize)
          fs = parseFloat(annotation.style.fontSize, 10);
        if (annotation.style.left)
          annotation.style.left = ((left/dim[0])*cDim[0]) + "px";
        if (annotation.style.top)
          annotation.style.top = ((top/dim[1])*cDim[1]) + "px";
        if (annotation.style.width)
          annotation.style.width = ((wid/dim[0])*cDim[0]) + "px";
        if (annotation.style.height)
          annotation.style.height = ((hei/dim[1])*cDim[1]) + "px";
        if (annotation.style.fontSize)
          annotation.style.fontSize = ((fs/dim[1])*cDim[1]) + "px";
          
        anns.push(annotation);
        
        if (annotation.tagName.toLowerCase() === "svg" && annotation.style.width && annotation.style.height) {
          annotation.setAttribute("viewBox", "0 0 " + wid + " " + hei);
        }
        
        var mc = (function(ann, annLeft, annTop, annWidth, annHeight){
          var _top, _left, _width, _height;
          
          _top = top;
          _left = left;
          _width = wid;
          _height = hei;
          
          return function(force){
            if (!ann) return;
            
            var currentDim = getCurrentVideoDimension(),
                al = (annLeft*currentDim[0]) + "px",
                at = (annTop*currentDim[1]) + "px",
                aw = (annWidth*currentDim[0]) + "px",
                ah = (annHeight*currentDim[1]) + "px";
            
            if (annotation.style.top && annotation.style.top !== at)
              _top = parseFloat(annotation.style.top, 10);
            if (annotation.style.left && annotation.style.left !== al)
              _left = parseFloat(annotation.style.left, 10);
            if (annotation.style.width && annotation.style.width !== aw)
              _width = parseFloat(annotation.style.width, 10);
            if (annotation.style.height && annotation.style.height !== ah)
              _height = parseFloat(annotation.style.height, 10);
            
            if (left !== _left) {
              annLeft = _left/dim[0];
              left = _left;
            }
            if (top !== _top) {
              annTop = _top/dim[1];
              top = _top;
            }
            if (wid !== _width) {
              annWidth = _width/dim[0];
              wid = _width;
            }
            if (hei !== _height) {
              annHeight = _height/dim[1];
              hei = _height;
            }
            
            al = (annLeft*currentDim[0]) + "px";
            at = (annTop*currentDim[1]) + "px";
            aw = (annWidth*currentDim[0]) + "px";
            ah = (annHeight*currentDim[1]) + "px";
            
            if (annotation.style.left && (al !== ann.style.left || force))
              ann.style.left = al;
            if (annotation.style.top && (at !== ann.style.top || force))
              ann.style.top = at;
            if (annotation.style.width && (aw !== ann.style.width || force))
              ann.style.width = aw;
            if (annotation.style.height && (ah !== ann.style.height || force))
              ann.style.height = ah;
          };
        })(annotation, (left/dim[0]), (top/dim[1]), (wid/dim[0]), (hei/dim[1]));
        updaters.push(mc);
        ytcenter.mutation.observe(annotation, { attributes: true }, (function(mcc){return function(){ mcc(false); }})(mc));
      }
      function fixAnnotations() {
        var annotationContainer = document.getElementsByClassName("video-annotations"), i, j, k, annotations = null, annotation = null,
            dim = getOriginalVideoDimension(), cDim = getCurrentVideoDimension();
        for (i = 0; i < annotationContainer.length; i++) {
          annotations = annotationContainer[i].children;
          for (j = 0; j < annotations.length; j++) {
            annotation = annotations[j];
            
            fixAnnotation(annotation, dim, cDim);
            for (k = 0; k < annotation.children.length; k++) {
              fixAnnotation(annotation.children[k], dim, cDim);
            }
          }
        }
      }
      function setup() {
        if (!ytcenter.settings.fixHTML5Annotations) return;
        
        if (observer) {
          observer.disconnect();
          observer = null;
        }
        // Used to fix the added annotations.
        observer = ytcenter.mutation.observe(document.getElementById("player"), { childList: true, subtree: true }, ytcenter.utils.throttle(function(){
          fixAnnotations();
        }, 500));
        fixAnnotations();
      }
      var observer = null, anns = [], pWidth = 854, pHeight = 480, updaters = [];
      ytcenter.events.addEvent("ui-refresh", function(){
        if (!ytcenter.html5) return;
        
        if (observer) {
          observer.disconnect();
          observer = null;
        }
        // Used to fix the added annotations.
        observer = ytcenter.mutation.observe(document.getElementById("player"), { childList: true, subtree: true }, function(){
          fixAnnotations();
        });
        
        fixAnnotations();
      });
      
      return {
        setup: setup,
        checkForNewAnnotations: fixAnnotations,
        setPreferredDimension: function(width, height){
          pWidth = width;
          pHeight = height;
        },
        forceUpdate: function(){
          var i;
          for (i = 0; i < updaters.length; i++) {
            updaters[i](true);
          }
        },
        update: function(){
          var i;
          for (i = 0; i < updaters.length; i++) {
            updaters[i](false);
          }
        }
      };
    })();
    ytcenter.player.getBestStream = function(streams, dash){
      var i, stream = null, vqIndex = ytcenter.player.qualities.length - 1, _vq, _vqIndex;
      for (i = 0; i < streams.length; i++) {
        if ((dash === 1 && !streams[i].dash) || (dash === 0 && streams[i].dash)) continue;
        if (streams[i].dash && streams[i].size) {
          _vq = ytcenter.player.convertDimensionToQuality(streams[i].size);
        } else if (!streams[i].dash && streams[i].quality) {
          _vq = streams[i].quality;
        }
        _vqIndex = $ArrayIndexOf(ytcenter.player.qualities, _vq);
        if (_vqIndex < vqIndex) {
          stream = streams[i];
          vqIndex = _vqIndex;
        }
      }
      if (!stream && dash !== -1)
        return ytcenter.player.getBestStream(streams, -1);
      return stream;
    };
    ytcenter.player.getHighestStreamQuality = function(streams, dash){
      var i, stream = streams[0], stream_dim, tmp_dim;
      if (!stream) return null;
      if (stream.dimension && stream.dimension.indexOf("x") !== -1) {
        stream_dim = stream.dimension.split("x");
        stream_dim[0] = parseInt(stream_dim[0], 10);
        stream_dim[1] = parseInt(stream_dim[1], 10);
      } else if (stream.size && stream.size.indexOf("x") !== -1) {
        stream_dim = stream.size.split("x");
        stream_dim[0] = parseInt(stream_dim[0], 10);
        stream_dim[1] = parseInt(stream_dim[1], 10);
      } else {
        stream_dim = [0, 0];
      }
      
      for (i = 1; i < streams.length; i++) {
        if (!streams[i].dimension && !streams[i].size) continue;
        if (dash === 0) {
          if (stream.dash) {
            stream = streams[i];
            continue;
          }
          if (streams[i].dash) continue;
        } else if (dash === 1) {
          if (!stream.dash) {
            stream = streams[i];
            continue;
          }
          if (!streams[i].dash) continue;
        }
        
        if (streams[i].dimension && streams[i].dimension.indexOf("x") !== -1) {
          tmp_dim = streams[i].dimension.split("x");
          tmp_dim[0] = parseInt(tmp_dim[0]);
          tmp_dim[1] = parseInt(tmp_dim[1]);
          if (stream_dim[1] < tmp_dim[1]) {
            stream_dim = tmp_dim;
            stream = streams[i];
          }
        } else if (streams[i].size && streams[i].size.indexOf("x") !== -1) {
          tmp_dim = streams[i].size.split("x");
          tmp_dim[0] = parseInt(tmp_dim[0]);
          tmp_dim[1] = parseInt(tmp_dim[1]);
          if (stream_dim[1] < tmp_dim[1]) {
            stream_dim = tmp_dim;
            stream = streams[i];
          }
        }
      }
      return stream;
    };
    ytcenter.player.getQualityByDimension = function(width, height) {
      if (height > 1728 || width > 3072) {
        return "highres";
      }
      if (height > 1152 || width > 2048) {
        return "hd1440";
      }
      if (height > 720 || width > 1280) {
        return "hd1080";
      }
      if (height > 480 || width > 854) {
        return "hd720";
      }
      if (height > 360 || width > 640) {
        return "large";
      }
      if (height > 240 || width > 427) {
        return "medium";
      }
      if (height > 144 || width > 256) {
        return "small";
      }
      return "tiny";
    }
    ytcenter.player.convertDimensionToQuality = function(size){
      if (!size) return "auto";
      size = size.split("x");
      return ytcenter.player.getQualityByDimension(size[0], size[1]);
    };
    ytcenter.player.qualities = ["highres", "hd1440", "hd1080", "hd720", "large", "medium", "small", "tiny", "auto"];
    /*ytcenter.player.convertDimensionToQuality = function(size){
      if (!size) return "auto";
      var tabel = {
            auto: [0, 0],
            tiny: [256, 144],
            light: [426, 240],
            small: [426, 240],
            medium: [640, 360],
            large: [854, 480],
            hd720: [1280, 720],
            hd1080: [1920, 1080],
            hd1440: [2560, 1440],
            highres: [3840, 2160]
          },
          i, tabelEntry, width, height;
      
      size = size.split("x");
      width = size[0];
      height = size[1];
      
      for (i = 0; i < ytcenter.player.qualities.length; i++) {
        tabelEntry = tabel[ytcenter.player.qualities[i]];
        if (width > tabelEntry[0] && height >= tabelEntry[1] || width >= tabelEntry[0] && height > tabelEntry[1]) {
          return ytcenter.player.qualities[i - 1];
        }
      }
      return "auto";
    };*/
    ytcenter.player.getQuality = function(vq, streams, dash){
      con.log("[getQuality] Prefered quality: " + vq + "; DASH: " + dash + "; HTML5: " + ytcenter.html5 + "; Streams: ", streams);
      var _vq = "auto", priority = ['auto', 'tiny', 'small', 'medium', 'large', 'hd720', 'hd1080', 'hd1440', 'highres'],
          a = document.createElement("video"), cpt = a && a.canPlayType,
          currentIndex = 0, quality, qualityIndex, preferedIndex;
      if (typeof streams === "undefined") return _vq;
      if (typeof dash === "undefined") {
        if (ytcenter.getPage() === "watch") {
          dash = ytcenter.settings.dashPlayback;
        } else if (ytcenter.getPage() === "embed") {
          dash = ytcenter.settings.embed_dashPlayback;
        } else if (ytcenter.getPage() === "channel") {
          dash = ytcenter.settings.channel_dashPlayback;
        }
      }
      
      if (ytcenter.html5 && !cpt) {
        con.log("[getQuality] The HTML5 player is not supported by this browser!");
        return _vq;
      }
      
      for (var i = 0; i < streams.length; i++) {
        if (!streams[i]) continue; // This stream doesn't exist...
        if (ytcenter.html5 && !a.canPlayType(streams[i].type.split(";")[0]).replace(/no/, '')) continue; // Browser doesn't support this format
        if (dash && (!streams[i].dash || !streams[i].size)) continue;
        if (!dash && streams[i].dash) continue;
        if (dash) {
          quality = ytcenter.player.convertDimensionToQuality(streams[i].size);
        } else {
          quality = streams[i].quality;
        }
        qualityIndex = $ArrayIndexOf(priority, quality);
        preferedIndex = $ArrayIndexOf(priority, vq);
            
        if (qualityIndex <= preferedIndex && qualityIndex > currentIndex) {
          _vq = quality;
          currentIndex = qualityIndex;
        }
      }
      
      con.log("[getQuality] => " + _vq);
      
      return _vq;
    };
    ytcenter.player.parseThumbnailStream = function(specs){
      var parts = specs.split("|"),
          baseURL = parts[0],
          levels = [], i, a, b;
      for (i = 1; i < parts.length; i++) {
        a = parts[i].split("#");
        b = {
          width: parseInt(a[0]),
          height: parseInt(a[1]),
          frames: parseInt(a[2]),
          columns: parseInt(a[3]),
          rows: parseInt(a[4]),
          interval: parseInt(a[5]),
          urlPattern: a[6],
          signature: a[7]
        };
        b.numMosaics = Math.ceil(b.frames / (b.rows * b.columns));
        b.getMosaic = (function(c){
          return function(frame){
            return Math.floor(frame/(c.rows*c.columns));
          };
        })(b);
        b.getRect = (function(c){
          return function(frame, maxDim){
            if (frame < 0 || (c.frames && frame >= c.frames))
              return null;
            var scale = 1,
                a = frame % (c.rows * c.columns),
                _x, x, _y, y, width = c.width - 2, height = c.height, iw, ih;
            if (maxDim && width > 0 && height > 0) {
              if (maxDim.width > 0 && maxDim.height > 0)
                scale = Math.min(maxDim.width/width, maxDim.height/height);
              else if (maxDim.width === 0)
                scale = maxDim.height/height;
              else if (maxDim.height === 0)
                scale = maxDim.width/width;
            }
            _x = (c.width * (a % c.columns));
            x = _x*scale;
            _y = (c.height * Math.floor(a / c.rows));
            y = _y*scale;
            width = width*scale,
            height = height*scale,
            iw = c.width*c.columns*scale
            ih = c.height*c.rows*scale;
            return {
              x: Math.round(x),
              y: Math.round(y),
              _x: Math.round(_x),
              _y: Math.round(_y),
              width: Math.round(width),
              height: Math.round(height),
              imageWidth: Math.round(iw),
              imageHeight: Math.round(ih)
            };
          };
        })(b);
        b.getURL = (function(c, index){
          return function(frame){
            return baseURL.replace("$L", index).replace("$N", c.urlPattern).replace("$M", c.getMosaic(frame)) + "?sigh=" + c.signature;
          };
        })(b, i - 1);
        levels.push(b);
      }
      return {
        baseURL: baseURL,
        levels: levels
      };
    };
    ytcenter.player._original_update = undefined;
    ytcenter.player._appliedBefore = false;
    ytcenter.player._onPlayerLoadedBefore = false;
    ytcenter.player.setPlayerType = function(type){
      if (type !== "html5" && type !== "flash") {
        con.error("[Player setPlayerType] Invalid type: " + type);
        return;
      }
      if (ytcenter.player.isLiveStream()) {
        con.log("[Player setPlayerType] Is disabled on live streams!");
        return;
      }
      if (ytcenter.player.isOnDemandStream()) {
        con.log("[Player setPlayerType] Is disabled on live streams!");
        return;
      }
      var api = ytcenter.player.getAPI();
      if (api) {
        if (api.getPlayerType() === type) {
          con.log("[Player setPlayerType] Type is already " + type + "!");
          return;
        }
        con.log("[Player setPlayerType] Setting player type from " + api.getPlayerType() + " to " + type);
        
        api.writePlayer(type);
      } else {
        var called = false;
        var cb = function(api){
          if (!api || called) return;
          called = true;
          if (type === "flash") ytcenter.player.disableHTML5Tick();
          if (api.getPlayerType() === type) {
            con.log("[Player setPlayerType] Type is already " + type + "!");
            return;
          }
          con.log("[Player setPlayerType] Setting player type from " + api.getPlayerType() + " to " + type);
          
          api.writePlayer(type);
        };
        con.log("[Player setPlayerType] API isn't ready!");
        if (type === "flash") ytcenter.player.disableHTML5();
        //ytcenter.utils.addClass(document.body, "ytcenter-disable-html5");
        ytcenter.player.listeners.addEventListener("onReady", cb);
      }
    };
    ytcenter.player.disableHTML5Tick = function(){
      if (ytcenter.player.disableHTML5_timeout) {
        uw.clearTimeout(ytcenter.player.disableHTML5_timeout);
        ytcenter.player.disableHTML5_timeout = null;
      }
      ytcenter.utils.removeClass(document.body, "ytcenter-disable-html5");
    };
    ytcenter.player.disableHTML5_timeout = null;
    ytcenter.player.disableHTML5 = function(){
      var a = document.getElementsByClassName("video-stream");
      if (a.length > 0 && a[0])
        //a[0].pause(); // Slower aproach, but will not throw errors (we want the faster method).
        a[0].src = ""; // this can cause YouTube to throw errors, but we're doing it anyway.
      ytcenter.utils.addClass(document.body, "ytcenter-disable-html5");
      
      if (ytcenter.player.disableHTML5_timeout) {
        uw.clearTimeout(ytcenter.player.disableHTML5_timeout);
        ytcenter.player.disableHTML5_timeout = null;
      }
      ytcenter.player.disableHTML5_timeout = uw.setTimeout(function(){
        ytcenter.utils.removeClass(document.body, "ytcenter-disable-html5");
      }, 2000);
    };
    ytcenter.player.updateFlashvars = function(player, config){
      if (!config || !config.args || !player) return;
      var flashvars = "", key;
      for (key in config.args) {
        if (config.args.hasOwnProperty(key) && key !== "__exposedProps__") {
          if (flashvars !== "") flashvars += "&";
          flashvars += encodeURIComponent(key) + "=" + encodeURIComponent(config.args[key]);
        }
      }
      player.setAttribute("flashvars", flashvars);
    };
    ytcenter.player.update = function(config){
      if (ytcenter.getPage() === "watch" && !config.args.url_encoded_fmt_stream_map && !config.args.adaptive_fmts && config.args.live_playback !== 1) {
        config = ytcenter.player.modifyConfig("watch", ytcenter.player.getRawPlayerConfig());
        ytcenter.player.setConfig(config);
      }
      /*if (!config.args.url_encoded_fmt_stream_map && !config.args.adaptive_fmts && config.args.live_playback !== 1) {
        con.error("[Player update] Not enough data to refresh the player!");
        return;
      }*/
      if (config.html5) return;
      try {
        var player = document.getElementById("movie_player") || document.getElementById("player1"), clone;
        con.log("[Player Update] Checking if player exist!");
        if (player && player.tagName.toLowerCase() === "embed") {
          ytcenter.player.updateFlashvars(player, config);
          
          if (ytcenter.getPage() === "watch") {
            if (ytcenter.settings.flashWMode !== "none") {
              player.setAttribute("wmode", ytcenter.settings.flashWMode);
            }
          } else if (ytcenter.getPage() === "embed") {
            if (ytcenter.settings.embed_flashWMode !== "none") {
              player.setAttribute("wmode", ytcenter.settings.embed_flashWMode);
            }
          } else if (ytcenter.getPage() === "channel") {
            if (ytcenter.settings.channel_flashWMode !== "none") {
              player.setAttribute("wmode", ytcenter.settings.channel_flashWMode);
            }
          }
          
          clone = player.cloneNode(true);
          clone.style.display = "";
          player.style.display = "none";
          player.src = "";
          player.parentNode.replaceChild(clone, player);
          player = clone;
          con.log("[Player Update] Player has been cloned and replaced!");
        } else {
          var observer = ytcenter.mutation.observe(document.getElementById("player"), { childList: true }, function(){
            observer.disconnect();
            observer = null;
            ytcenter.player.update(config);
          });
        }
      } catch (e) {
        con.error(e);
      }
    };
    ytcenter.parseStreams = function(playerConfig){
      if (playerConfig.url_encoded_fmt_stream_map === "") return [];
      var parser1 = function(f){
        var a, r = [];
        try {
          var a = f.split(",");
          for (var i = 0; i < a.length; i++) {
            var b = a[i].split("/");
            var itag = b.shift();
            var dimension = b.shift();
            var minMajorFlashVersion = b.shift();
            var minMinorFlashVersion = b.shift();
            var revisionVersion = b.shift();
            r.push({
              itag: itag,
              dimension: dimension,
              flashVersion: {
                minMajor: minMajorFlashVersion,
                minMinor: minMinorFlashVersion,
                revision: revisionVersion
              }
            });
          }
        } catch (e) {
          con.error("[parseStreams] Error =>");
          con.error(e);
        }
        return r;
      };
      var parser2 = function(u){
        var a, b = [];
        try {
          a = u.split(",");
          for (var i = 0; i < a.length; i++) {
            var c = {};
            var d = a[i].split("&");
            for (var j = 0; j < d.length; j++) {
              var e = d[j].split("=");
              c[e[0]] = unescape(e[1]);
              if (e[0] === "type") c[e[0]] = c[e[0]].replace(/\+/g, " ");
              //if (e[0] === "url") c[e[0]] = c[e[0]].replace(/^(http:)|(https:)/g, "");
            }
            b.push(c);
          }
        } catch (e) {
          con.error("[parseStreams] Error =>");
          con.error(e);
        }
        return b;
      };
      var parser3 = function(u){
        if (!u) return [];
        var a = u.split(",");
        var b = [];
        for (var i = 0; i < a.length; i++) {
          var c = {};
          var d = a[i].split("&");
          for (var j = 0; j < d.length; j++) {
            var e = d[j].split("=");
            c[e[0]] = unescape(e[1]);
            if (e[0] === "type") c[e[0]] = c[e[0]].replace(/\+/g, " ");
          }
          b.push(c);
        }
        return b;
      };
      var fmt = parser1(playerConfig.fmt_list);
      var streams = parser2(playerConfig.url_encoded_fmt_stream_map);
      var adaptive_fmts = parser3(playerConfig.adaptive_fmts);
      var a = [], i;
      for (i = 0; i < streams.length; i++) {
        var fl = null;
        for (var j = 0; j < fmt.length; j++) {
          if (streams[i].itag !== fmt[j].itag) continue;
          fl = fmt[j];
          break;
        }
        streams[i].dash = false;
        if (fl == null) {
          a.push(streams[i]);
        } else {
          var coll = streams[i];
          coll.dimension = fl.dimension;
          coll.flashVersion = fl.flashVersion;
          a.push(coll);
        }
      }
      for (i = 0; i < adaptive_fmts.length; i++) {
        adaptive_fmts[i].dash = true;
        a.push(adaptive_fmts[i]);
      }
      
      return a;
    };
    ytcenter.classManagement = {};
    ytcenter.classManagement.applyClassesExceptElement = function(el, url){
      if (ytcenter.page === "embed") return;
      if (url) url = ytcenter.utils.getURL(url);
      else url = loc;
      var i;
      for (i = 0; i < ytcenter.classManagement.db.length; i++) {
        if (ytcenter.classManagement.db[i].element() && ytcenter.classManagement.db[i].element() !== el) {
          if (ytcenter.classManagement.db[i].condition(url))
            ytcenter.utils.addClass(ytcenter.classManagement.db[i].element(), ytcenter.classManagement.db[i].className);
          else
            ytcenter.utils.removeClass(ytcenter.classManagement.db[i].element(), ytcenter.classManagement.db[i].className);
        } else if (!ytcenter.classManagement.db[i].element()) {
          con.warn("[Element Class Management] Element does not exist!", ytcenter.classManagement.db[i]);
        }
      }
    };
    ytcenter.classManagement.applyClassesForElement = function(el, url){
      if (ytcenter.page === "embed") return;
      if (url) url = ytcenter.utils.getURL(url);
      else url = loc;
      var i;
      for (i = 0; i < ytcenter.classManagement.db.length; i++) {
        if (ytcenter.classManagement.db[i].element() === el) {
          if (ytcenter.classManagement.db[i].condition(url))
            ytcenter.utils.addClass(ytcenter.classManagement.db[i].element(), ytcenter.classManagement.db[i].className);
          else
            ytcenter.utils.removeClass(ytcenter.classManagement.db[i].element(), ytcenter.classManagement.db[i].className);
        } else if (!ytcenter.classManagement.db[i].element()) {
          con.warn("[Element Class Management] Element does not exist!", ytcenter.classManagement.db[i]);
        }
      }
    };
    ytcenter.classManagement.applyClasses = function(url){
      if (ytcenter.page === "embed") return;
      if (url) url = ytcenter.utils.getURL(url);
      else url = loc;
      var i;
      for (i = 0; i < ytcenter.classManagement.db.length; i++) {
        if (ytcenter.classManagement.db[i].element()) {
          if (ytcenter.classManagement.db[i].condition(url))
            ytcenter.utils.addClass(ytcenter.classManagement.db[i].element(), ytcenter.classManagement.db[i].className);
          else
            ytcenter.utils.removeClass(ytcenter.classManagement.db[i].element(), ytcenter.classManagement.db[i].className);
        } else {
          con.warn("[Element Class Management] Element does not exist!", ytcenter.classManagement.db[i]);
        }
      }
    };
    ytcenter.classManagement.getClassesForElementById = function(id, url){
      if (ytcenter.page === "embed") return;
      if (url) url = ytcenter.utils.getURL(url);
      else url = loc;
      var i, a = [];
      for (i = 0; i < ytcenter.classManagement.db.length; i++) {
        if (ytcenter.classManagement.db[i].element()) {
          if (ytcenter.classManagement.db[i].element().getAttribute("id") === id
              && ytcenter.classManagement.db[i].condition(url))
            a.push(ytcenter.classManagement.db[i].className);
        } else {
          con.warn("[Element Class Management] Element does not exist!", ytcenter.classManagement.db[i]);
        }
      }
      return a.join(" ");
    };
    ytcenter.classManagement.getClassesForElementByTagName = function(tagname, url){
      if (ytcenter.page === "embed") return;
      if (url) url = ytcenter.utils.getURL(url);
      else url = loc;
      var i, a = [];
      for (i = 0; i < ytcenter.classManagement.db.length; i++) {
        if (ytcenter.classManagement.db[i].element()) {
          if (ytcenter.classManagement.db[i].element().tagName === tagname
              && ytcenter.classManagement.db[i].condition(url))
            a.push(ytcenter.classManagement.db[i].className);
        } else {
          con.warn("[Element Class Management] Element does not exist!", ytcenter.classManagement.db[i]);
        }
      }
      return a.join(" ");
    };
    ytcenter.classManagement.db = [
      {element: function(){return document.getElementById("player");}, className: "", condition: function(loc){
        if (ytcenter.settings.removeBrandingBackground) {
          var p = document.getElementById("player");
          p.style.backgroundImage = "";
          p.style.backgroundColor = "";
        }
        return false;
      }},
      {element: function(){return document.getElementById("masthead-subnav");}, className: "", condition: function(loc){
        if (ytcenter.settings.watch7centerpage) {
          document.getElementById("masthead-subnav").style.setProperty("margin-left", "auto", "important");
        } else {
          document.getElementById("masthead-subnav").style.setProperty("margin-left", "", "");
        }
        return false;
      }},
      {element: function(){return document.getElementById("watch7-creator-bar");}, className: "clearfix", condition: function(loc){return false;}},
      {element: function(){return document.getElementById("page");}, className: "", condition: function(loc){
        if (ytcenter.settings.watch7centerpage)
          document.getElementById("page").style.setProperty("margin", "0 auto", "important");
        else
          document.getElementById("page").style.setProperty("margin", "", "");
        return false;
      }},
      {element: function(){return document.getElementById("page");}, className: "", condition: function(loc){
        if (ytcenter.settings["watch7centerpage"] && !ytcenter.settings.experimentalFeatureTopGuide) {
          document.getElementById("page").style.setProperty("padding-left", "0", "important");
        } else {
          document.getElementById("page").style.setProperty("padding-left", "");
        }
      }},
      {element: function(){return document.body;}, className: "white", condition: function(loc){
        var p = ytcenter.getPage();
        if (p === "watch") {
          return ytcenter.html5 && ytcenter.settings.playerColor === "white";
        } else if (p === "embed") {
          return ytcenter.html5 && ytcenter.settings.embed_playerColor === "white";
        } else if (p === "channel") {
          return ytcenter.html5 && ytcenter.settings.channel_playerColor === "white";
        }
        return false;
      }},
      {element: function(){return document.body;}, className: "ytcenter-player-darkside-bg", condition: function(loc){
        return ytcenter.player.darkside();
      }},
      {element: function(){return document.body;}, className: "ytcenter-player-darkside-bg-retro", condition: function(loc){return (ytcenter.getPage() === "watch" && ytcenter.player.getCurrentPlayerSize().large && ytcenter.settings.playerDarkSideBG && ytcenter.settings.playerDarkSideBGRetro);}},
      {element: function(){return document.body;}, className: "ytcenter-thumbnail-watchlater-pos-topleft", condition: function(loc){return ytcenter.settings.videoThumbnailWatchLaterPosition === "topleft";}},
      {element: function(){return document.body;}, className: "ytcenter-thumbnail-watchlater-pos-topright", condition: function(loc){return ytcenter.settings.videoThumbnailWatchLaterPosition === "topright";}},
      {element: function(){return document.body;}, className: "ytcenter-thumbnail-watchlater-pos-bottomleft", condition: function(loc){return ytcenter.settings.videoThumbnailWatchLaterPosition === "bottomleft";}},
      {element: function(){return document.body;}, className: "ytcenter-thumbnail-watchlater-pos-bottomright", condition: function(loc){return ytcenter.settings.videoThumbnailWatchLaterPosition === "bottomright";}},
      {element: function(){return document.body;}, className: "ytcenter-thumbnail-watchlater-visible-always", condition: function(loc){return ytcenter.settings.videoThumbnailWatchLaterVisible === "always";}},
      {element: function(){return document.body;}, className: "ytcenter-thumbnail-watchlater-visible-show_hover", condition: function(loc){return ytcenter.settings.videoThumbnailWatchLaterVisible === "show_hover";}},
      {element: function(){return document.body;}, className: "ytcenter-thumbnail-watchlater-visible-hide_hover", condition: function(loc){return ytcenter.settings.videoThumbnailWatchLaterVisible === "hide_hover";}},
      {element: function(){return document.body;}, className: "ytcenter-thumbnail-watchlater-visible-never", condition: function(loc){return ytcenter.settings.videoThumbnailWatchLaterVisible === "never";}},
      {element: function(){return document.body;}, className: "ytcenter-thumbnail-timecode-pos-topleft", condition: function(loc){return ytcenter.settings.videoThumbnailTimeCodePosition === "topleft";}},
      {element: function(){return document.body;}, className: "ytcenter-thumbnail-timecode-pos-topright", condition: function(loc){return ytcenter.settings.videoThumbnailTimeCodePosition === "topright";}},
      {element: function(){return document.body;}, className: "ytcenter-thumbnail-timecode-pos-bottomleft", condition: function(loc){return ytcenter.settings.videoThumbnailTimeCodePosition === "bottomleft";}},
      {element: function(){return document.body;}, className: "ytcenter-thumbnail-timecode-pos-bottomright", condition: function(loc){return ytcenter.settings.videoThumbnailTimeCodePosition === "bottomright";}},
      {element: function(){return document.body;}, className: "ytcenter-thumbnail-timecode-visible-always", condition: function(loc){return ytcenter.settings.videoThumbnailTimeCodeVisible === "always";}},
      {element: function(){return document.body;}, className: "ytcenter-thumbnail-timecode-visible-show_hover", condition: function(loc){return ytcenter.settings.videoThumbnailTimeCodeVisible === "show_hover";}},
      {element: function(){return document.body;}, className: "ytcenter-thumbnail-timecode-visible-hide_hover", condition: function(loc){return ytcenter.settings.videoThumbnailTimeCodeVisible === "hide_hover";}},
      {element: function(){return document.body;}, className: "ytcenter-thumbnail-timecode-visible-never", condition: function(loc){return ytcenter.settings.videoThumbnailTimeCodeVisible === "never";}},
      {element: function(){return document.body;}, className: "ytcenter-ticker-hidden", condition: function(loc){return ytcenter.settings["hideTicker"];}},
      {element: function(){return document.body;}, className: "ytcenter-guide-hidden", condition: function(loc){return loc.pathname === "/watch" && ytcenter.settings["watch7playerguidealwayshide"] && !ytcenter.settings['experimentalFeatureTopGuide'];}},
      {element: function(){return document.body;}, className: "ytcenter-guide-visible", condition: function(loc){return loc.pathname === "/watch" && !ytcenter.settings["watch7playerguidealwayshide"] && !ytcenter.settings['experimentalFeatureTopGuide'];}},
      {element: function(){return document.body;}, className: "ytcenter-disable-endscreen", condition: function(loc){return loc.pathname === "/watch" && ytcenter.settings["removeRelatedVideosEndscreen"];}},
      {element: function(){return document.body;}, className: "ytcenter-lights-off-click-through", condition: function(loc){return ytcenter.settings["lightbulbClickThrough"];}},
      {element: function(){return document.body;}, className: "site-left-aligned", condition: function(loc){return !ytcenter.settings['experimentalFeatureTopGuide'];}},
      {element: function(){return document.body;}, className: "site-center-aligned", condition: function(loc){return ytcenter.settings['experimentalFeatureTopGuide'];}},
      {element: function(){return document.body;}, className: "ytcenter-hide-watched-videos", condition: function(loc){return ytcenter.settings.gridSubscriptionsPage && ytcenter.settings.hideWatchedVideos;}},
      {element: function(){return document.body;}, className: "ytcenter-grid-subscriptions", condition: function(loc){return loc.pathname === "/feed/subscriptions" && ytcenter.settings.gridSubscriptionsPage;}},
      {element: function(){return document.getElementById("page");}, className: "no-flex", condition: function(loc){return !ytcenter.settings.flexWidthOnPage && loc.pathname !== "/watch";}},
      {element: function(){return document.body;}, className: "ytcenter-lights-off", condition: function(loc){return ytcenter.player.isLightOff;}},
      {element: function(){return document.getElementById("watch-description");}, className: "yt-uix-expander-collapsed", condition: function(loc){return !ytcenter.settings.expandDescription;}},
      {element: function(){return document.getElementById("watch7-headline");}, className: "yt-uix-expander-collapsed", condition: function(loc){return !ytcenter.settings.headlineTitleExpanded;}},
      {element: function(){return document.getElementById("watch-video-extra");}, className: "hid", condition: function(loc){return ytcenter.settings.removeAdvertisements;}},
      {element: function(){return document.body;}, className: "flex-width-enabled", condition: function(loc){var p = ytcenter.getPage();return (ytcenter.settings.flexWidthOnPage && loc.pathname !== "/watch" && p !== "channel") || (ytcenter.settings.flexWidthOnChannelPage && p === "channel")}},
      {element: function(){return document.body;}, className: "ytcenter-branding-remove-banner", condition: function(loc){return ytcenter.settings.removeBrandingBanner;}},
      {element: function(){return document.body;}, className: "ytcenter-branding-remove-background", condition: function(loc){return ytcenter.settings.removeBrandingBackground;}},
      {element: function(){return document.body;}, className: "ytcenter-site-notcenter", condition: function(loc){return !ytcenter.settings.watch7centerpage && !ytcenter.settings['experimentalFeatureTopGuide'];}},
      {element: function(){return document.body;}, className: "ytcenter-site-center", condition: function(loc){return ytcenter.settings.watch7centerpage && !ytcenter.settings['experimentalFeatureTopGuide'];}},
      {element: function(){return document.body;}, className: "ytcenter-exp-topbar-static", condition: function(loc){return ytcenter.settings.ytExperimentalLayotTopbarStatic;}},
      {element: function(){return document.body;}, className: "ytcenter-remove-ads-page", condition: function(loc){return ytcenter.settings.removeAdvertisements;}},
      {element: function(){return document.body;}, className: "ytcenter-site-not-watch", condition: function(loc){return loc.pathname !== "/watch";}},
      {element: function(){return document.body;}, className: "ytcenter-site-search", condition: function(loc){return loc.pathname === "/results";}},
      {element: function(){return document.body;}, className: "ytcenter-site-watch", condition: function(loc){return loc.pathname === "/watch";}},
      {element: function(){return document.body;}, className: "ytcenter-resize-aligned", condition: function(loc){return loc.pathname === "/watch" && ytcenter.settings.enableResize && ytcenter.player.isPlayerAligned();}},
      {element: function(){return document.body;}, className: "ytcenter-resize-disaligned", condition: function(loc){return loc.pathname === "/watch" && ytcenter.settings.enableResize && !ytcenter.player.isPlayerAligned();}},
      {element: function(){return document.body;}, className: "ytcenter-non-resize", condition: function(loc){return loc.pathname === "/watch" && !ytcenter.settings.enableResize;}}
    ];
    ytcenter.intelligentFeed = (function(){
      var __r = {}, observer, config = { attributes: true }, feed;
      ytcenter.unload(function(){
        if (observer) {
          observer.disconnect();
          observer = null;
        }
      });
      __r.getFeeds = function(){
        return document.getElementsByClassName("feed-item-main");
      };
      __r.getItems = function(feed){
        return feed.getElementsByClassName("yt-uix-shelfslider-item");
      };
      __r.getShelfWrappers = function(feed){
        return feed.getElementsByClassName("shelf-wrapper");
      };
      __r.getShelves = function(feed){
        return feed.getElementsByClassName("yt-uix-shelfslider-list");
      };
      __r.getFeedCollapsedContainer = function(feed){
        return feed.getElementsByClassName("feed-item-collapsed-container");
      };
      __r.getCollapsedItems = function(feed){
        return feed.getElementsByClassName("feed-item-collapsed-items");
      };
      __r.getShowMoreButton = function(feed){
        var a = feed.getElementsByClassName("feed-item-expander-button");
        if (a && a.length > 0 && a[0])
          return a[0];
        return null;
      };
      __r.setup = function(){
        __r.dispose();
        con.log("[Intelligent Feeds] Setting up!");
        var shelf, items, i, j, shelfWrappers, collapsedItem, feedCollapsedContainer, showMoreButton;
        feed = __r.getFeeds();
        for (i = 0; i < feed.length; i++) {
          items = __r.getItems(feed[i]);
          shelf = __r.getShelves(feed[i]);
          shelfWrappers = __r.getShelfWrappers(feed[i]);
          collapsedItem = __r.getCollapsedItems(feed[i]);
          feedCollapsedContainer = __r.getFeedCollapsedContainer(feed[i]);
          showMoreButton = __r.getShowMoreButton(feed[i]);
          
          if (items && items.length > 0
              && shelf && shelf.length > 0 && shelf[0]
              && shelfWrappers && shelfWrappers.length > 0
              && feedCollapsedContainer && feedCollapsedContainer.length > 0 && feedCollapsedContainer[0]) {
            ytcenter.utils.addClass(feed[i], "ytcenter-intelligentfeed ytcenter-intelligentfeed-minimized");
            con.log("[Intelligent Feeds] There are " + items.length + " items and " + shelf.length + " shelves!");
            
            shelf = shelf[0];
            for (j = 0; j < items.length; j++) {
              shelf.appendChild(items[j]);
            }
            if (showMoreButton) {
              showMoreButton.setAttribute("data-original-textContent", showMoreButton.textContent);
              showMoreButton.textContent = showMoreButton.textContent.replace(/( [0-9]+)|([0-9]+ )|([0-9]+)/, "");
            }
            
            observer = ytcenter.mutation.observe(feedCollapsedContainer[0], config, function(mutations){
              mutations.forEach(function(mutation){
                if (mutation.type === "attributes" && mutation.attributeName === "class") {
                  if (ytcenter.utils.hasClass(mutation.target, "expanded")) {
                    ytcenter.utils.removeClass(mutation.target.parentNode.parentNode, "ytcenter-intelligentfeed-minimized");
                  } else if (ytcenter.utils.hasClass(mutation.target, "collapsed")) {
                    ytcenter.utils.addClass(mutation.target.parentNode.parentNode, "ytcenter-intelligentfeed-minimized");
                  }
                }
              });
            });
          }
        }
      };
      __r.dispose = function(){
        if (observer) observer.disconnect();
        observer = null;
        if (feed) {
          var shelves, items, i, j, k, frag, _items, showMoreButton;
          for (i = 0; i < feed.length; i++) {
            if (ytcenter.utils.hasClass(feed[i], "ytcenter-intelligentfeed")) {
              shelves = __r.getShelves(feed[i]);
              items = __r.getItems(feed[i]);
              showMoreButton = __r.getShowMoreButton(feed[i]);
              frag = [];
              _items = [];
              
              con.log("[Intelligent Feeds] Reordering " + items.length + " items to " + shelves.length + " shelves!");
              
              for (j = 0; j < items.length; j++) {
                var n = Math.floor(j/(items.length/shelves.length));
                if (!_items[n]) _items[n] = [];
                _items[n].push(items[j]);
              }
              
              for (j = 0; j < _items.length; j++) {
                for (k = 0; k < _items[j].length; k++) {
                  shelves[j].appendChild(_items[j][k]);
                }
              }
              if (showMoreButton) {
                showMoreButton.textContent = showMoreButton.getAttribute("data-original-textContent");
                showMoreButton.removeAttribute("data-original-textContent");
              }
              ytcenter.utils.removeClass(feed[i], "ytcenter-intelligentfeed ytcenter-intelligentfeed-minimized");
            }
          }
        }
      };
      return __r;
    })();
    ytcenter.guideMode = (function(){
      function clickListener() {
        clicked = true;
      }
      function updateGuide() {
        if (ytcenter.getPage() !== "watch") return;
        if (ytcenter.settings.guideMode === "always_open") {
          ytcenter.utils.removeClass(document.getElementById("guide-main"), "collapsed");
          document.getElementById("guide-main").children[1].style.display = "block";
          document.getElementById("guide-main").children[1].style.height = "auto";
        } else if (ytcenter.settings.guideMode === "always_closed") {
          ytcenter.utils.addClass(document.getElementById("guide-main"), "collapsed");
          document.getElementById("guide-main").children[1].style.display = "none";
          document.getElementById("guide-main").children[1].style.height = "auto";
        }
      }
      var timer, observer, observer2, clicked = false, main_guide, guide_container, guideToggle,
          config = { attributes: true, attributeOldValue: true },
          confi2 = { childList: true, subtree: true };
      ytcenter.unload(function(){
        if (observer) {
          observer.disconnect();
          observer = null;
        }
        if (observer2) {
          observer2.disconnect();
          observer2 = null;
        }
      });
      return {
        setup: function(){
          con.log("[Guide] Configurating the state updater!");
          if (observer) {
            observer.disconnect();
            observer = null;
          }
          if (observer2) {
            observer2.disconnect();
            observer2 = null;
          }
          guideToggle = document.getElementsByClassName("guide-module-toggle")[0];
          if (guideToggle)
            ytcenter.utils.removeEventListener(guideToggle, "click", clickListener, false);
          if (ytcenter.settings.guideMode !== "default") {
            if (document.getElementById("guide")) {
              observer2 = ytcenter.mutation.observe(document.getElementById("guide"), confi2, function(mutations){
                mutations.forEach(function(mutation){
                  if (ytcenter.utils.inArray(mutation.removedNodes, guide_container)) {
                    con.log("[Guide] Main Guide has been removed");
                    main_guide = document.getElementById("guide-main");
                    guide_container = document.getElementById("guide-container");
                    if (main_guide) {
                      if (observer) observer.disconnect();
                      observer = ytcenter.mutation.observe(main_guide, config, function(mutations){
                        mutations.forEach(function(mutation){
                          if (mutation.type === "attributes" && mutation.attributeName === "class" && ((mutation.oldValue.indexOf("collapsed") !== -1) !== (mutation.target.className.indexOf("collapsed") !== -1))) {
                            con.log("[Guide] Mutations...", mutation.oldValue.indexOf("collapsed") !== -1, mutation.target.className.indexOf("collapsed") !== -1, ytcenter.settings.guideMode);
                            if (mutation.oldValue.indexOf("collapsed") === -1 && ytcenter.settings.guideMode === "always_closed") return;
                            if (mutation.oldValue.indexOf("collapsed") !== -1 && ytcenter.settings.guideMode === "always_open") return;
                            con.log("[Guide] Updating State!");
                            
                            uw.clearTimeout(timer);
                            
                            if (clicked) {
                              clicked = false;
                              return;
                            }
                            
                            timer = uw.setTimeout(function(){
                              updateGuide();
                            }, 500);
                          }
                        });
                      });
                    }
                    if (guideToggle)
                      ytcenter.utils.removeEventListener(guideToggle, "click", clickListener, false);
                    guideToggle = document.getElementsByClassName("guide-module-toggle")[0];
                    if (guideToggle)
                      ytcenter.utils.addEventListener(guideToggle, "click", clickListener, false);
                    if (clicked) {
                      clicked = false;
                      return;
                    }
                    updateGuide();
                  } else {
                    con.log("[Guide] Main Guide is still intact");
                  }
                });
              });
            }
            main_guide = document.getElementById("guide-main");
            guide_container = document.getElementById("guide-container");
            if (main_guide) {
              ytcenter.mutation.observe(main_guide, config, function(mutations){
                mutations.forEach(function(mutation){
                  if (mutation.type === "attributes" && mutation.attributeName === "class" && ((mutation.oldValue.indexOf("collapsed") !== -1) !== (mutation.target.className.indexOf("collapsed") !== -1))) {
                    con.log("[Guide] Mutations...", mutation.oldValue.indexOf("collapsed") !== -1, mutation.target.className.indexOf("collapsed") !== -1, ytcenter.settings.guideMode);
                    if (mutation.oldValue.indexOf("collapsed") === -1 && ytcenter.settings.guideMode === "always_closed") return;
                    if (mutation.oldValue.indexOf("collapsed") !== -1 && ytcenter.settings.guideMode === "always_open") return;
                    con.log("[Guide] Updating State!");
                    
                    uw.clearTimeout(timer);
                    
                    if (clicked) {
                      clicked = false;
                      return;
                    }
                    
                    timer = uw.setTimeout(function(){
                      updateGuide();
                    }, 500);
                  }
                });
              });
            }
            if (guideToggle)
              ytcenter.utils.addEventListener(guideToggle, "click", clickListener, false);
          }
          updateGuide();
        }
      };
    })();
    ytcenter.events.addEvent("ui-refresh", function(){
      if (ytcenter.settings.removeBrandingBanner) {
        ytcenter.utils.addClass(document.body, "ytcenter-branding-remove-banner");
      } else {
        ytcenter.utils.removeClass(document.body, "ytcenter-branding-remove-banner");
      }
      if (ytcenter.settings.removeBrandingBackground) {
        ytcenter.utils.addClass(document.body, "ytcenter-branding-remove-background");
      } else {
        ytcenter.utils.removeClass(document.body, "ytcenter-branding-remove-background");
      }
      ytcenter.classManagement.applyClasses();
    });
    var extensionCompatibilityChecker = function(){
      if (injected && @identifier@ === 0 && !ytcenter.settings.compatibilityCheckerForChromeDisable) {
        var alert,
            content = document.createElement("div"),
            p1 = document.createTextNode(ytcenter.language.getLocale("ALERT_ERROR_COMPATIBILITY_ISSUE_CHROME_TEXT1")),
            p2 = document.createElement("br"),
            p3 = document.createTextNode(ytcenter.language.getLocale("ALERT_ERROR_COMPATIBILITY_ISSUE_CHROME_TEXT2")),
            p4 = document.createTextNode(" "),
            p5 = document.createElement("a"),
            p6 = document.createTextNode(ytcenter.language.getLocale("ALERT_ERROR_COMPATIBILITY_ISSUE_CHROME_DOT")),
            p7 = document.createElement("br"),
            p8 = document.createTextNode(ytcenter.language.getLocale("ALERT_ERROR_COMPATIBILITY_ISSUE_CHROME_MOREINFO1")),
            p9 = document.createTextNode(" "),
            p10 = document.createElement("a"),
            p11 = document.createTextNode(ytcenter.language.getLocale("ALERT_ERROR_COMPATIBILITY_ISSUE_CHROME_DOT")),
            p12 = document.createElement("br"),
            p13 = document.createElement("a");
        
        
        p5.textContent = ytcenter.language.getLocale("ALERT_ERROR_COMPATIBILITY_ISSUE_CHROME_TEXT3");
        p5.href = "https://github.com/YePpHa/YouTubeCenter/wiki#wiki-Chrome__Opera_15_Extension";
        p5.setAttribute("target", "_blank");
        
        p10.textContent = ytcenter.language.getLocale("ALERT_ERROR_COMPATIBILITY_ISSUE_CHROME_MOREINFO2");
        p10.href = "https://github.com/YePpHa/YouTubeCenter/wiki/Chrome:CompatibilityError";
        p10.setAttribute("target", "_blank");
        
        p13.textContent = ytcenter.language.getLocale("ALERT_ERROR_COMPATIBILITY_ISSUE_CHROME_DONT_SHOW_AGAIN");
        p13.href = "#";
        p13.style.cssFloat = "right";
        
        ytcenter.utils.addEventListener(p13, "click", function(e){
          e.preventDefault();
          e.stopPropagation();
          
          alert.setVisibility(false);
          
          ytcenter.settings.compatibilityCheckerForChromeDisable = true;
          ytcenter.saveSettings();
          
          return false;
        }, false);
        
        ytcenter.language.addLocaleElement(p1, "ALERT_ERROR_COMPATIBILITY_ISSUE_CHROME_TEXT1", "@textContent");
        ytcenter.language.addLocaleElement(p3, "ALERT_ERROR_COMPATIBILITY_ISSUE_CHROME_TEXT2", "@textContent");
        ytcenter.language.addLocaleElement(p5, "ALERT_ERROR_COMPATIBILITY_ISSUE_CHROME_TEXT3", "@textContent");
        ytcenter.language.addLocaleElement(p6, "ALERT_ERROR_COMPATIBILITY_ISSUE_CHROME_DOT", "@textContent");
        ytcenter.language.addLocaleElement(p8, "ALERT_ERROR_COMPATIBILITY_ISSUE_CHROME_MOREINFO1", "@textContent");
        ytcenter.language.addLocaleElement(p10, "ALERT_ERROR_COMPATIBILITY_ISSUE_CHROME_MOREINFO2", "@textContent");
        ytcenter.language.addLocaleElement(p11, "ALERT_ERROR_COMPATIBILITY_ISSUE_CHROME_DOT", "@textContent");
        ytcenter.language.addLocaleElement(p13, "ALERT_ERROR_COMPATIBILITY_ISSUE_CHROME_DONT_SHOW_AGAIN", "@textContent");
        
        content.appendChild(p1);
        content.appendChild(p2);
        content.appendChild(p3);
        content.appendChild(p4);
        content.appendChild(p5);
        content.appendChild(p6);
        content.appendChild(p7);
        content.appendChild(p8);
        content.appendChild(p9);
        content.appendChild(p10);
        content.appendChild(p11);
        content.appendChild(p12);
        content.appendChild(p13);
        
        alert = ytcenter.alert("error", content, false);
        alert.setVisibility(true);
      }
    };
    var initPlacement = function(){
      con.log("Initializing the Placement System (Watch7).");
      // buttonPlacementWatch7
      var ytcd = document.createElement("div");
      ytcd.id = "watch7-ytcenter-buttons";
      ytcenter.placementsystem.ytcd = ytcd;
      document.getElementById("watch7-sentiment-actions").parentNode.insertBefore(ytcd, document.getElementById("watch7-sentiment-actions"));
      
      ytcenter.placementsystem.init([
        {
          id: 'watch7-sentiment-actions',
          elements: [
            {
              tagname: 'button',
              condition: function(elm, e){
                return ytcenter.utils.hasClass(e, "yt-uix-button") && elm == e;
              },
              style: {
                margin: '0px 2px 0px 0px'
              },
              classNames: ['yt-uix-tooltip-reverse']
            }, {
              tagname: 'span',
              condition: function(elm, e){
                return ytcenter.utils.hasClass(e, "yt-uix-button-group") && elm == e;
              },
              style: {
                margin: '0px 4px 0px 0px'
              },
              classNames: ['yt-uix-tooltip-reverse']
            }, {
              tagname: 'button',
              classNames: ['yt-uix-tooltip-reverse']
            }
          ]
        }, {
          id: 'watch7-ytcenter-buttons',
          elements: [
            {
              tagname: 'button',
              condition: function(elm, e){
                return ytcenter.utils.hasClass(e, "yt-uix-button") && elm == e;
              },
              style: {
                margin: '0px 2px 0px 0px'
              },
              classNames: ['yt-uix-tooltip-reverse']
            }, {
              tagname: 'span',
              condition: function(elm, e){
                return ytcenter.utils.hasClass(e, "yt-uix-button-group") && elm == e;
              },
              style: {
                margin: '0px 4px 0px 0px'
              },
              classNames: ['yt-uix-tooltip-reverse']
            }, {
              tagname: 'button',
              classNames: ['yt-uix-tooltip-reverse']
            }
          ]
        }
      ], []);
      ytcenter.placementsystem.registerNativeElements();
      ytcenter.placementsystem.arrangeElements();
    };
    (function(){
      // Hijacks the ytplayer global variable.
      try {
        if (uw.ytplayer && uw.ytplayer.config) {
          con.log("[PlayerConfig Hijacker] Loading player configurations...");
          ytcenter.player.setConfig(ytcenter.utils.mergeObjects(uw.ytplayer.config || {}, ytcenter.player.config || {}));
        }
        if (uw.ytplayer && uw.ytplayer.config && uw.ytplayer.config.loaded) {
          ytcenter.player.setConfig(ytcenter.player.modifyConfig(ytcenter.getPage(), uw.ytplayer.config));
          ytcenter.player.disablePlayerUpdate = false;
        } else if (uw.yt && uw.yt.config_ && uw.yt.config_.PLAYER_CONFIG && uw.yt.config_.PLAYER_CONFIG.loaded) {
          ytcenter.player.setConfig(ytcenter.player.modifyConfig(ytcenter.getPage(), uw.yt.config_.PLAYER_CONFIG));
          ytcenter.player.disablePlayerUpdate = false;
        }
        if (uw.ytplayer && uw.ytplayer.config && uw.ytplayer.config.args) {
          ytcenter.player.setConfig(ytcenter.player.modifyConfig(ytcenter.getPage(), uw.ytplayer.config));
          ytcenter.player.disablePlayerUpdate = false;
        } else if (uw.yt && uw.yt.config_ && uw.yt.config_.PLAYER_CONFIG && uw.yt.config_.PLAYER_CONFIG.args) {
          ytcenter.player.setConfig(ytcenter.player.modifyConfig(ytcenter.getPage(), uw.yt.config_.PLAYER_CONFIG));
          ytcenter.player.disablePlayerUpdate = false;
        }
        if (ytcenter.utils.setterGetterClassCompatible()) {
          con.log("[PlayerConfig Hijacker] Using Class Setter Getter Method");
          ytcenter.player.disablePlayerUpdate = false;
          uw.ytplayer = new PlayerConfig(function(config){
            if (config) {
              ytcenter.player.setConfig(ytcenter.player.modifyConfig(ytcenter.getPage(), config));
              if (ytcenter.player.config.html5) ytcenter.player.disablePlayerUpdate = true;
            } else {
              ytcenter.player.setConfig(config);
            }
          }, function(){
            if (!ytcenter.player.config || !ytcenter.player.config.args)
              ytcenter.player.setConfig(ytcenter.player.modifyConfig(ytcenter.getPage(), ytcenter.player.getRawPlayerConfig()));
            if (!ytcenter.player.config.args) ytcenter.player.config.args = {};
            if (!ytcenter.player.config.args.url_encoded_fmt_stream_map && !ytcenter.player.config.args.adaptive_fmts && !ytcenter.player.isLiveStream() && !ytcenter.player.isOnDemandStream())
              ytcenter.player.setConfig(ytcenter.player.modifyConfig(ytcenter.getPage(), ytcenter.player.getRawPlayerConfig()));
            return ytcenter.player.config;
          });
        }/* else if (ytcenter.utils.setterGetterObjectCompatible()) {
          con.log("[PlayerConfig Hijacker] Using Object Setter Getter Method");
          uw.ytplayer = {
            get config() {
              return ytcenter.player.config;
            },
            set config(config) {
              if (config) {
                ytcenter.player.setConfig(ytcenter.player.modifyConfig(ytcenter.getPage(), config));
                if (ytcenter.player.config.html5) ytcenter.player.disablePlayerUpdate = true;
              } else {
                ytcenter.player.setConfig(config);
              }
            }
          };
        }*/ else {
          con.log("[PlayerConfig Hijacker] Setter Getter Method not suppoted!");
          if (uw.ytplayer && uw.ytplayer.config) {
            ytcenter.player.setConfig(ytcenter.player.modifyConfig(ytcenter.getPage(), uw.ytplayer.config));
          } else if (uw.yt && uw.yt.config_ && uw.yt.config_.PLAYER_CONFIG) {
            ytcenter.player.setConfig(ytcenter.player.modifyConfig(ytcenter.getPage(), uw.yt.config_.PLAYER_CONFIG));
          }
          ytcenter.player.disablePlayerUpdate = false;
        }
      } catch (e) {
        con.error(e);
        if (uw && uw.ytplayer && uw.ytplayer.config)
          ytcenter.player.setConfig(ytcenter.player.modifyConfig(ytcenter.getPage(), uw.ytplayer.config));
        else if (uw.yt && uw.yt.config_ && uw.yt.config_.PLAYER_CONFIG)
          ytcenter.player.setConfig(ytcenter.player.modifyConfig(ytcenter.getPage(), uw.yt.config_.PLAYER_CONFIG));
        ytcenter.player.disablePlayerUpdate = false;
      }
      ytcenter.pageReadinessListener.waitfor = function(){
        return ytcenter.__settingsLoaded;
      };
      
      ytcenter.pageReadinessListener.addEventListener("headerInitialized", function(){
        if (ytcenter.settings.useSecureProtocol) {
          if (loc.href.indexOf("http://") === 0) {
            loc.href = loc.href.replace(/^http/, "https");
            return;
          }
        }
        var page = ytcenter.getPage();
        if (page === "embed" || !ytcenter.settings.ytspf) ytcenter.spf.disable();
        
        // Settings made public
        ytcenter.unsafe.injected = injected;
        ytcenter.unsafe.settings = ytcenter.unsafe.settings || {};
        ytcenter.unsafe.getDebug = ytcenter.utils.bind(function(){
          return ytcenter.getDebug();
        }, ytcenter.unsafe);
        ytcenter.unsafe.updateSignatureDecipher = ytcenter.utils.bind(function(){
          uw.postMessage("YouTubeCenter" + JSON.stringify({
            type: "updateSignatureDecipher"
          }), (loc.href.indexOf("http://") === 0 ? "http://www.youtube.com" : "https://www.youtube.com"));
        }, ytcenter.unsafe);
        ytcenter.unsafe.settings.setOption = ytcenter.utils.bind(function(key, value){
          ytcenter.settings[key] = value;
          ytcenter.events.performEvent("settings-update");
          uw.postMessage("YouTubeCenter" + JSON.stringify({
            type: "saveSettings"
          }), (loc.href.indexOf("http://") === 0 ? "http://www.youtube.com" : "https://www.youtube.com"));
        }, ytcenter.unsafe.settings);
        ytcenter.unsafe.settings.getOption = ytcenter.utils.bind(function(key){
          return ytcenter.settings[key];
        }, ytcenter.unsafe.settings);
        ytcenter.unsafe.settings.getOptions = ytcenter.utils.bind(function(){
          return ytcenter.settings;
        }, ytcenter.unsafe.settings);
        ytcenter.unsafe.settings.removeOption = ytcenter.utils.bind(function(key){
          delete ytcenter.settings[key];
          ytcenter.events.performEvent("settings-update");
          uw.postMessage("YouTubeCenter" + JSON.stringify({
            type: "saveSettings"
          }), (loc.href.indexOf("http://") === 0 ? "http://www.youtube.com" : "https://www.youtube.com"));
        }, ytcenter.unsafe.settings);
        ytcenter.unsafe.settings.listOptions = ytcenter.utils.bind(function(){
          var keys = [];
          for (var key in ytcenter.settings) {
            if (ytcenter.settings.hasOwnProperty(key)) keys.push(key);
          }
          return keys;
        }, ytcenter.unsafe.settings);
        ytcenter.unsafe.settings.reload = ytcenter.utils.bind(function(){
          uw.postMessage("YouTubeCenter" + JSON.stringify({
            type: "loadSettings"
          }), (loc.href.indexOf("http://") === 0 ? "http://www.youtube.com" : "https://www.youtube.com"));
        }, ytcenter.unsafe.settings);
        
        con.log("Settings loaded.");
        ytcenter.language.update();
        
        /* We don't want to add everything. So only the neccessary stuff is added. */
        if (page === "comments") {
          $AddStyle(ytcenter.css.flags);
          return;
        }
        if (page === "embed" && !ytcenter.settings.embed_enabled) {
          ytcenter.writeEmbed();
          return;
        }
        if (page === "embed" && ytcenter.utils.inArray(loc.search.substring(1).split("&"), "autoplay=1")) {
          loc.search = loc.search.replace("autoplay=1", "ytcenter-autoplay=1");
        }
        
        uw.addEventListener("message", function(e){
          if (e.origin !== "http://www.youtube.com" && e.origin !== "https://www.youtube.com")
            return;
          if (e.data.indexOf("YouTubeCenter") !== 0)
            return;
          var d = JSON.parse(e.data.substring(13));
          if (d.type === "saveSettings") {
            ytcenter.saveSettings();
          } else if (d.type === "loadSettings") {
            ytcenter.loadSettings();
          } else if (d.type === "updateSignatureDecipher") {
            ytcenter.utils.updateSignatureDecipher();
          }
          if (typeof d.callback === "function") {
            var n = d.callback.split("."), a = uw, i;
            for (i = 0; o < n.length; i++) {
              a = a[n[i]];
            }
            a();
          }
        }, false);
        
        try {
          var links = document.head.getElementsByTagName("link");
          if (links[0] && links[0].className === "www-feather")
            ytcenter.feather = true;
        } catch (e) {
          con.error(e);
        }
        
        if (ytcenter.getPage() !== "embed") {
          $AddStyle(ytcenter.css.general);
          $AddStyle(ytcenter.css.flags);
          $AddStyle(ytcenter.css.html5player);
          $AddStyle(ytcenter.css.gridSubscriptions);
          $AddStyle(ytcenter.css.images);
          $AddStyle(ytcenter.css.dialog);
          $AddStyle(ytcenter.css.scrollbar);
          $AddStyle(ytcenter.css.list);
          $AddStyle(ytcenter.css.confirmbox);
          $AddStyle(ytcenter.css.panel);
          $AddStyle(ytcenter.css.resizePanel);
          $AddStyle(ytcenter.css.modules);
          $AddStyle(ytcenter.css.settings);
          $AddStyle(ytcenter.css.centering);
          
          if (ytcenter.settings['experimentalFeatureTopGuide'] || ytcenter.settings['ytExperimentFixedTopbar']) {
            $AddStyle(ytcenter.css.topbar);
          }
          if (!ytcenter.settings['experimentalFeatureTopGuide'] && ytcenter.settings.enableResize) {
            $AddStyle(ytcenter.css.resize);
          }
          
          $AddStyle(ytcenter.css.player);
          
          $AddStyle(ytcenter.css.darkside);
          
          try {
            ytcenter.unsafe.openSettings = ytcenter.utils.bind(function(){
              if (!ytcenter.settingsPanelDialog) ytcenter.settingsPanelDialog = ytcenter.settingsPanel.createDialog();
              ytcenter.settingsPanelDialog.setVisibility(true);
            });
            if (typeof GM_registerMenuCommand === "function") {
              GM_registerMenuCommand(ytcenter.language.getLocale("BUTTON_SETTINGS_LABEL"), ytcenter.unsafe.openSettings);
            }
          } catch (e) {
            con.error(e);
          }
          
        } else {
          $AddStyle(ytcenter.css.embed);
        }
        
        /*****START OF SAVEAS AND BLOB IMPLEMENTATION*****/
        /* Blob.js
         * A Blob implementation.
         * 2013-06-20
         * 
         * By Eli Grey, http://eligrey.com
         * By Devin Samarin, https://github.com/eboyjr
         * License: X11/MIT
         *   See LICENSE.md
         */
        /*http://purl.eligrey.com/github/Blob.js/blob/master/Blob.js*/
        /* FileSaver.js
         * A saveAs() FileSaver implementation.
         * 2013-01-23
         *
         * By Eli Grey, http://eligrey.com
         * License: X11/MIT
         *   See LICENSE.md
         */
        /*http://purl.eligrey.com/github/FileSaver.js/blob/master/FileSaver.js*/
        
        /* The reason this is obfuscated is because IE crashes when using IE7Pro to run YouTube Center.
         * I think that it has something to do with the javascript parser IE7Pro are using.
         * The source code of the injected obfuscated part can be found on:
         * https://github.com/YePpHa/YouTubeCenter/tree/master/obfuscated/io.js
         * ------
         * Tool used: http://www.jsobfuscate.com/index.php
         * Encoding: Normal
         * Fast Decode: enabled
         * Special Characters disabled
         * ---
         * Result replaced \\ with \\\\ and " with \".
         */
        ytcenter.inject("eval(function(p,a,c,k,e,d){e=function(c){return(c<a?'':e(parseInt(c/a)))+((c=c%a)>35?String.fromCharCode(c+29):c.toString(36))};if(!''.replace(/^/,String)){while(c--){d[e(c)]=k[c]||e(c)}k=[function(e){return d[e]}];e=function(){return'\\\\w+'};c=1};while(c--){if(k[c]){p=p.replace(new RegExp('\\\\b'+e(c)+'\\\\b','g'),k[c])}}return p}('v=v||{};v.R=v.R||{};(4(I,v){o{v.R.B=B}q(e){}8(J B!==\"4\"||J k===\"2c\")8(J B===\"4\"&&J K!==\"2c\")I.k=K;j v.R.B=(4(6){\"1W 2l\";d Z=(4(){d a=t;o{a=6.Z||6.2d||6.1A||6.17}q(e){o{a=6.2d||6.1A||6.17}q(e){o{a=6.1A||6.17}q(e){o{a=6.17}q(e){}}}}f a})()||(4(6){d 1l=4(P){f 2P.S.1r.T(P).2Q(/^\\\\[P\\\\s(.*)\\\\]$/)[1]},1n=4 Z(){g.7=[]},A=4(7,c,w){g.7=7;g.1F=7.p;g.c=c;g.w=w},1f=1n.S,19=A.S,1d=6.1d,1s=4(c){g.1I=g[g.l=c]},1v=(\"2m 2V 22 2n 2W \"+\"31 30 2Z\").1M(\" \"),1h=1v.p,H=6.k||6.K||6,1k=H.11,1i=H.1u,k=H,1a=6.1a,1b=6.1b,1z=6.1z,Y=6.Y;A.2b=19.2b=14;1C(1h--){1s.S[1v[1h]]=1h+1}8(!H.11){k=6.k={}}k.11=4(b){d c=b.c,N;8(c===Q){c=\"2q/2z-2t\"}8(b 1c A){N=\"7:\"+c;8(b.w===\"1g\"){f N+\";1g,\"+b.7}j 8(b.w===\"2h\"){f N+\",\"+2i(b.7)}8(1a){f N+\";1g,\"+1a(b.7)}j{f N+\",\"+2o(b.7)}}j 8(1k){f 1k.T(H,b)}};k.1u=4(1m){8(1m.2D(0,5)!==\"7:\"&&1i){1i.T(H,1m)}};1f.1X=4(7){d E=g.7;8(Y&&(7 1c 1z||7 1c Y)){d 1q=\"\",1o=C Y(7),i=0,29=1o.p;20(;i<29;i++){1q+=2H.2M(1o[i])}E.x(1q)}j 8(1l(7)===\"B\"||1l(7)===\"2K\"){8(1d){d 2g=C 1d;E.x(2g.32(7))}j{2r C 1s(\"2n\")}}j 8(7 1c A){8(7.w===\"1g\"&&1b){E.x(1b(7.7))}j 8(7.w===\"2h\"){E.x(2i(7.7))}j 8(7.w===\"21\"){E.x(7.7)}}j{8(J 7!==\"2u\"){7+=\"\"}E.x(3r(2o(7)))}};1f.1U=4(c){8(!1w.p){c=Q}f C A(g.7.3i(\"\"),c,\"21\")};1f.1r=4(){f\"[P Z]\"};19.L=4(1Y,1T,c){d 1t=1w.p;8(1t<3){c=Q}f C A(g.7.L(1Y,1t>1?1T:g.7.p),c,g.w)};19.1r=4(){f\"[P B]\"};f 1n}(6));f 4(12,1x){d c=1x?(1x.c||\"\"):\"\";d 1y=C Z();8(12){20(d i=0,23=12.p;i<23;i++){1y.1X(12[i])}}f 1y.1U(c)}}(I));v.R.13=(I&&I.13)||(18&&18.1V&&18.1V.2B(18))||(4(6){\"1W 2l\";d 1B=6.3n,1p=4(){d a;o{a=6.k||6.K||6}q(e){o{a=6.k||6.K||6}q(e){o{a=6.K||6}q(e){o{a=6}q(e){}}}}f a},k=1p(),10=1B.3m(\"3k://3a.2I.3d/3e/3h\",\"a\"),2w=!6.3g&&\"V\"3b 10,1Q=4(2s){d n=1B.34(\"36\");n.37(\"1Q\",14,t,6,0,0,0,0,0,t,t,t,t,0,Q);2s.38(n)},16=6.3j,1E=6.3s||16||6.3p,2x=4(F){(6.3q||6.3l)(4(){2r F},0)},15=\"2q/2z-2t\",1H=0,M=[],2e=4(){d i=M.p;1C(i--){d r=M[i];8(J r===\"2u\"){k.1u(r)}j{r.26()}}M.p=0},1e=4(9,U,n){U=[].33(U);d i=U.p;1C(i--){d 1j=9[\"1L\"+U[i]];8(J 1j===\"4\"){o{1j.T(9,n||9)}q(F){2x(F)}}}},1G=4(b,l){d 9=g,c=b.c,1O=t,m,W,1P=4(){d m=1p().11(b);M.x(m);f m},1S=4(){1e(9,\"1Z 25 1K 24\".1M(\" \"))},y=4(){8(1O||!m){m=1P(b)}8(W){W.2p.1N=m}j{2O.2X(m,\"2S\")}9.u=9.G;1S()},z=4(2v){f 4(){8(9.u!==9.G){f 2v.2T(g,1w)}}},1R={2k:14,3c:t},L;9.u=9.2f;8(!l){l=\"V\"}8(2w){m=1P(b);10.1N=m;10.V=l;1Q(10);9.u=9.G;1S();f}8(6.2G&&c&&c!==15){L=b.L||b.2L;b=L.T(b,0,b.1F,15);1O=14}8(16&&l!==\"V\"){l+=\".V\"}8(c===15||16){W=6}8(!1E){y();f}1H+=b.1F;1E(6.2J,1H,z(4(2y){2y.2U.2N(\"3o\",1R,z(4(1J){d 1D=4(){1J.2j(l,1R,z(4(r){r.39(z(4(D){D.2a=4(n){W.2p.1N=r.3f();M.x(r);9.u=9.G;1e(9,\"24\",n)};D.27=4(){d X=D.X;8(X.1I!==X.22){y()}};\"1Z 25 1K O\".1M(\" \").35(4(n){D[\"1L\"+n]=9[\"1L\"+n]});D.1K(b);9.O=4(){D.O();9.u=9.G};9.u=9.28}),y)}),y)};1J.2j(l,{2k:t},z(4(r){r.26();1D()}),z(4(F){8(F.1I===F.2m){1D()}j{y()}}))}),y)}),y)},h=1G.S,13=4(b,l){f C 1G(b,l)};h.O=4(){d 9=g;9.u=9.G;1e(9,\"O\")};h.u=h.2f=0;h.28=1;h.G=2;h.X=h.2A=h.2C=h.2F=h.2E=h.27=h.2a=Q;6.2Y(\"2R\",2e,t);f 13}(I))})(I,v);',62,215,'||||function||view|data|if|filesaver||blob|type|var||return|this|FS_proto||else|URL|name|object_url|event|try|length|catch|file||false|readyState|ytcenter|encoding|push|fs_error|abortable|FakeBlob|Blob|new|writer|bb|ex|DONE|real_URL|self|typeof|webkitURL|slice|deletion_queue|data_URI_header|abort|object|null|io|prototype|call|event_types|download|target_view|error|Uint8Array|BlobBuilder|save_link|createObjectURL|blobParts|saveAs|true|force_saveable_type|webkit_req_fs|MSBlobBuilder|navigator|FB_proto|btoa|atob|instanceof|FileReaderSync|dispatch|FBB_proto|base64|file_ex_code|real_revoke_object_URL|listener|real_create_object_URL|get_class|object_URL|FakeBlobBuilder|buf|get_URL|str|toString|FileException|args|revokeObjectURL|file_ex_codes|arguments|options|builder|ArrayBuffer|MozBlobBuilder|doc|while|save|req_fs|size|FileSaver|fs_min_size|code|dir|write|on|split|href|blob_changed|get_object_url|click|create_if_not_found|dispatch_all|end|getBlob|msSaveOrOpenBlob|use|append|start|writestart|for|raw|ABORT_ERR|len|writeend|progress|remove|onerror|WRITING|buf_len|onwriteend|fake|undefined|WebKitBlobBuilder|process_deletion_queue|INIT|fr|URI|decodeURIComponent|getFile|create|strict|NOT_FOUND_ERR|NOT_READABLE_ERR|encodeURIComponent|location|application|throw|node|stream|string|func|can_use_save_link|throw_outside|fs|octet|onwritestart|bind|onprogress|substring|onabort|onwrite|chrome|String|w3|TEMPORARY|File|webkitSlice|fromCharCode|getDirectory|window|Object|match|unload|_blank|apply|root|SECURITY_ERR|ENCODING_ERR|open|addEventListener|SYNTAX_ERR|INVALID_STATE_ERR|NO_MODIFICATION_ALLOWED_ERR|readAsBinaryString|concat|createEvent|forEach|MouseEvents|initMouseEvent|dispatchEvent|createWriter|www|in|exclusive|org|1999|toURL|externalHost|xhtml|join|webkitRequestFileSystem|http|setTimeout|createElementNS|document|saved|mozRequestFileSystem|setImmediate|unescape|requestFileSystem'.split('|'),0,{}))");
        /*****END OF SAVEAS AND BLOB IMPLEMENTATION*****/
      });
      ytcenter.pageReadinessListener.addEventListener("bodyInitialized", function(){
        var page = ytcenter.getPage();
        if (page === "comments") return; // We don't need to do anything here.
        if (page === "embed" && !ytcenter.settings.embed_enabled) return;
        ytcenter.classManagement.applyClassesForElement(document.body);
        
        if (loc.href.indexOf(".youtube.com/embed/") === -1) {
          if (!ytcenter.welcome.hasBeenLaunched())
            ytcenter.welcome.setVisibility(true);
        }
        if (loc.pathname !== "/watch")
          ytcenter.player.turnLightOn();
        else if (ytcenter.settings.lightbulbAutoOff)
          ytcenter.player.turnLightOff();
        ytcenter.player.shortcuts();
        
        if (document.getElementById("page")
         && ytcenter.utils.hasClass(document.getElementById("page"), "channel")
         && document.getElementById("content")
         && document.getElementById("content").children.length > 0
         && ytcenter.utils.hasClass(document.getElementById("content").children[0], "branded-page-v2-container")
         && ytcenter.utils.hasClass(document.getElementById("content").children[0], "branded-page-v2-flex-width")) {
          document.body.className += " ytcenter-channelv2";
        }
      });
      ytcenter.pageReadinessListener.addEventListener("bodyInteractive", function(){
        var page = ytcenter.getPage();
        if (page === "embed" && !ytcenter.settings.embed_enabled) return;
        /* Only need to handle the Google+ comments */
        if (page === "comments") {
          ytcenter.commentsPlus.setup();
          return;
        }
        
        // Checking if the correct settings were applied and if not correct them and forcing a refresh of the page.
        ytcenter.unsafe.subtitles = ytcenter.subtitles;
        if (page !== "embed") {
          ytcenter.title.init();
          ytcenter.topScrollPlayer.setup();
          ytcenter.topScrollPlayer.setEnabled(ytcenter.getPage() === "watch" && ytcenter.settings.topScrollPlayerEnabled);
          if (ytcenter.settings['experimentalFeatureTopGuide']) {
            if (!ytcenter.experiments.isTopGuide()) {
              ytcenter.settings['experimentalFeatureTopGuide'] = false;
              // default_fit_to_content [985, 554]
              var ftc = ytcenter.player.getPlayerSize("default_fit_to_content"),
                  s = ytcenter.player.getPlayerSize("default_small"),
                  l = ytcenter.player.getPlayerSize("default_large");
              if (ftc && ftc.config) {
                if (ftc.config.width === "1003px" && ftc.config.height === "") {
                  ftc.config.width = "985px";
                } else if (ftc.config.width === "1003px" && ftc.config.height === "564px") {
                  ftc.config.width = "985px";
                  ftc.config.height = "554px";
                }
              }
              if (s && s.config && !s.config.large) {
                s.config.align = true;
              }
              if (l && l.config && l.config.large) {
                l.config.align = true;
              }
              ytcenter.saveSettings(false, false);
              loc.reload();
            }
          } else {
            if (ytcenter.experiments.isTopGuide()) {
              ytcenter.settings['experimentalFeatureTopGuide'] = true;
              // default_fit_to_content [1003, 564]
              var ftc = ytcenter.player.getPlayerSize("default_fit_to_content"),
                  s = ytcenter.player.getPlayerSize("default_small"),
                  l = ytcenter.player.getPlayerSize("default_large");
              if (ftc && ftc.config) {
                if (ftc.config.width === "985px" && ftc.config.height === "") {
                  ftc.config.width = "1003px";
                } else if (ftc.config.width === "985px" && ftc.config.height === "554px") {
                  ftc.config.width = "1003px";
                  ftc.config.height = "564px";
                }
              }
              if (s && s.config && !s.config.large) {
                s.config.align = false;
              }
              if (l && l.config && l.config.large) {
                l.config.align = false;
              }
              ytcenter.saveSettings(false, false);
              loc.reload();
            }
          }
          if (ytcenter.settings['ytExperimentFixedTopbar']) {
            if (!ytcenter.experiments.isFixedTopbar()) {
              ytcenter.settings['ytExperimentFixedTopbar'] = false;
              ytcenter.saveSettings(false, false);
              loc.reload();
            }
          } else {
            if (ytcenter.experiments.isFixedTopbar()) {
              ytcenter.settings['ytExperimentFixedTopbar'] = true;
              ytcenter.saveSettings(false, false);
              loc.reload();
            }
          }
        }
        
        yt = uw.yt;
        ytcenter.player.onYouTubePlayerReady = function(api){
          /* Running other onYouTubePlayerReady callbacks */
          if (ytcenter.onYouTubePlayerReady) {
            var i;
            for (i = 0; i < ytcenter.onYouTubePlayerReady.length; i++) {
              ytcenter.onYouTubePlayerReady[i].apply(uw, arguments);
            }
            ytcenter.onYouTubePlayerReady = [];
          }
          
          ytcenter.classManagement.applyClassesForElement();
          con.log("[onYouTubePlayerReady]", arguments);
          if (typeof api !== "string") {
            ytcenter.player.__getAPI = api;
            ytcenter.html5 = (api.getPlayerType() === "html5" && !ytcenter.player.isLiveStream() && !ytcenter.player.isOnDemandStream());
            ytcenter.player.listeners.dispose();
            ytcenter.player.listeners.setup();
            
            if (ytcenter.getPage() === "channel") {
              if (ytcenter.player.config && ytcenter.player.config.args) {
                ytcenter.player.updateConfig(ytcenter.getPage(), ytcenter.player.config);
              } else {
                if (ytcenter.player.config === null) ytcenter.player.config = {};
                ytcenter.player.config.updateConfig = true;
              }
            } else {
              if (ytcenter.getPage() === "watch") {
                /*if (ytcenter.settings.forcePlayerType === "flash" && api.getPlayerType() !== "flash" && !ytcenter.player.isLiveStream() && !ytcenter.player.isOnDemandStream()) {
                  ytcenter.player.setPlayerType("flash");
                  return;
                } else if (ytcenter.settings.forcePlayerType === "html5" && api.getPlayerType() !== "html5" && !ytcenter.player.isLiveStream() && !ytcenter.player.isOnDemandStream()) {
                  ytcenter.player.setPlayerType("html5");
                  return;
                }*/
                ytcenter.placementsystem.clear();
                
                $CreateDownloadButton();
                $CreateRepeatButton();
                $CreateLightButton();
                $CreateAspectButton();
                $CreateResizeButton();
                
                initPlacement();
              } else if (ytcenter.getPage() === "embed") {
                var lis = function(state){
                  if (state === -1) return;
                  ytcenter.player.updateConfig(ytcenter.getPage(), ytcenter.player.config);
                  if (state === 1 || state === 2 || state === 3) ytcenter.player.listeners.removeEventListener("onStateChange", lis);
                };
                ytcenter.player.listeners.addEventListener("onStateChange", lis);
                ytcenter.player.updateConfig(ytcenter.getPage(), ytcenter.player.config);
                /*if (ytcenter.settings.embed_forcePlayerType === "flash" && api.getPlayerType() !== "flash" && !ytcenter.player.isLiveStream() && !ytcenter.player.isOnDemandStream()) {
                  ytcenter.player.setPlayerType("flash");
                  return;
                } else if (ytcenter.settings.embed_forcePlayerType === "html5" && api.getPlayerType() !== "html5" && !ytcenter.player.isLiveStream() && !ytcenter.player.isOnDemandStream()) {
                  ytcenter.player.setPlayerType("html5");
                  return;
                }*/
              }
              if (!ytcenter._intercomOnPlayer) {
                ytcenter._intercomOnPlayer = true;
                ytcenter.Intercom.getInstance().on("player", function(data){
                  if (data.origin === ytcenter.Intercom.getInstance().origin) return;
                  var api = ytcenter.player.getAPI();
                  if (!api) {
                    con.log("[Intercom] Player API not ready!");
                    return;
                  }
                  con.log("[Intercom] Player Action: " + data.action);
                  if (data.action === "pause") {
                    api.pauseVideo();
                  } else if (data.action === "play") {
                    api.playVideo();
                  } else if (data.action === "stop") {
                    api.stopVideo();
                  }
                });
              }
              con.log("[onYouTubePlayerReady] => updateConfig");
              ytcenter.player.updateConfig(ytcenter.getPage(), ytcenter.player.config);
              ytcenter.classManagement.applyClasses();
            }
          }
        };
        ytcenter.unsafe.player = ytcenter.unsafe.player || {};
        ytcenter.unsafe.player.onReady = ytcenter.utils.bind(ytcenter.player.onYouTubePlayerReady, ytcenter.unsafe);
        ytcenter.unsafe.player.parseThumbnailStream = ytcenter.player.parseThumbnailStream;
        ytcenter.unsafe.player.showMeMyThumbnailStream = function(index){
          var a = ytcenter.player.parseThumbnailStream(ytcenter.player.config.args.storyboard_spec),
              b = a.levels[(typeof index === "number" && index > 0 && index < a.levels.length ? index : a.levels.length) - 1],
              elm = document.createElement("div"),
              pic = document.createElement("div"),
              box = {width: 1280, height: 720},
              rect = b.getRect(0, box),
              i = 0;
          pic.style.width = rect.width + "px";
          pic.style.height = rect.height + "px";
          
          pic.style.backgroundImage = "URL(" + b.getURL(0) + ")";
          pic.style.backgroundSize = rect.imageWidth + "px " + rect.imageHeight + "px";
          pic.style.backgroundPosition = rect.x + "px " + -rect.y + "px";
          document.body.addEventListener("keyup", function(e){
            if (e.keyCode === 37) {
              i--;
            } else if (e.keyCode === 39) {
              i++;
            }
            if (b.frames <= i) i = 0;
            if (i < 0) i = b.frames - 1;
            rect = b.getRect(i, box);
            pic.style.backgroundImage = "URL(" + b.getURL(i) + ")";
            pic.style.backgroundPosition = -rect.x + "px " + -rect.y + "px";
          }, false);
          
          elm.appendChild(pic);
          ytcenter.dialog(null, elm).setVisibility(true);
        };
        if (typeof uw.onYouTubePlayerReady === "function") {
          if (!ytcenter.onYouTubePlayerReady) ytcenter.onYouTubePlayerReady = [];
          ytcenter.onYouTubePlayerReady.push(uw.onYouTubePlayerReady);
        }
        defineLockedProperty(uw, "onYouTubePlayerReady", function(func){
          con.log("[onYouTubePlayerReady] Something is trying to set onYouTubePlayerReady to something else.");
          if (typeof func !== "function") return;
          if (!ytcenter.onYouTubePlayerReady) ytcenter.onYouTubePlayerReady = [];
          ytcenter.onYouTubePlayerReady.push(func);
        }, function(){
          return ytcenter.player.onYouTubePlayerReady;
        });
        //uw.onYouTubePlayerReady = ytcenter.player.onYouTubePlayerReady;
        
        /* bodyInteractive should only be used for the UI, use the other listeners for player configuration */
        ytcenter.player.listeners.addEventListener("onReady", function(){
          var api, state = null;
          if (ytcenter.player.getAPI) api = ytcenter.player.getAPI();
          if (api && api.getPlayerState) state = ytcenter.player.getAPI().getPlayerState();
          if (state === 1 && ytcenter.settings.playerOnlyOneInstancePlaying) {
            if ((ytcenter.getPage() === "embed" && ytcenter.settings.embed_enabled) || ytcenter.getPage() !== "embed") {
              ytcenter.player.network.pause();
            }
          }
        });
        ytcenter.player.listeners.addEventListener("onStateChange", function(state){
          if (state === 1 && ytcenter.settings.playerOnlyOneInstancePlaying) {
            if ((ytcenter.getPage() === "embed" && ytcenter.settings.embed_enabled) || ytcenter.getPage() !== "embed") {
              ytcenter.player.network.pause();
            }
          }
        });
        
        if (page === "embed") {
          /* I've moved ytcenter.embed.load to be executed when the page has completely loaded */
          //@embed
          return;
        }
        
        // UI
        ytcenter.classManagement.applyClassesExceptElement(document.body);
        
        $CreateSettingsUI();
        $UpdateChecker();
        extensionCompatibilityChecker();
        try {
          ytcenter.player.fixAnnotations.setup();
          ytcenter.thumbnail.setup();
          ytcenter.comments.setup();
          ytcenter.domEvents.setup();
        } catch (e) {
          con.error(e);
        }
        
        if (page === "feed_what_to_watch") {
          ytcenter.intelligentFeed.setup();
        }
        
        if (ytcenter.settings["resize-default-playersize"] === "default") {
          ytcenter.player.currentResizeId = (ytcenter.settings.player_wide ? ytcenter.settings["resize-large-button"] : ytcenter.settings["resize-small-button"]);
          ytcenter.player.updateResize();
        } else {
          ytcenter.player.currentResizeId = ytcenter.settings['resize-default-playersize'];
          ytcenter.player.updateResize();
        }
        
        var id, config;
        if (page === "watch") {
          ytcenter.uploaderFlag.init();
          
          ytcenter.page = "watch";
          try {
            ytcenter.guide.hidden = ytcenter.settings.watch7playerguidealwayshide;
            ytcenter.guide.setup();
          } catch (e) {
            con.error(e);
          }
          
          var wvi = document.getElementById("watch7-views-info"),
              sl = document.getElementsByClassName("video-extras-sparkbar-likes"),
              sd = document.getElementsByClassName("video-extras-sparkbar-dislikes");
          if (sl && sd && sl.length > 0 && sd.length > 0 && sl[0] && sd[0]) {
            sl[0].style.background = ytcenter.settings.sparkbarLikesColor;
            sl[0].style.height = ytcenter.settings.sparkbarHeight + "px";
            sd[0].style.background = ytcenter.settings.sparkbarDislikesColor;
            sd[0].style.height = ytcenter.settings.sparkbarHeight + "px";
            
            sd[0].parentNode.style.height = ytcenter.settings.sparkbarHeight + "px";
          }
          
          ytcenter.playlist = false;
          try {
            if (document.getElementById("watch7-playlist-data") || loc.search.indexOf("list=") !== -1) {
              ytcenter.playlist = true;
            }
          } catch (e) {
            con.error(e);
          }
          try {
            ytcenter.video.author = (document.getElementById("watch7-user-header").getElementsByClassName("yt-user-name")[0].textContent || document.getElementsByClassName("yt-user-name")[0].textContent);
            ytcenter.user.callChannelFeed(ytcenter.video.author, function(){
              ytcenter.video._channel = this;
              ytcenter.video.channelname = this.title['$t'];
            });
          } catch (e) {
            con.error(e);
          }
          
          if (ytcenter.page === "watch") {
            if (((ytcenter.settings.topScrollPlayerEnabled && !ytcenter.settings.topScrollPlayerActivated) || !ytcenter.settings.topScrollPlayerEnabled) && ytcenter.settings.scrollToPlayer && ((!ytcenter.settings.experimentalFeatureTopGuide && !ytcenter.settings.ytExperimentFixedTopbar) || ((ytcenter.settings.experimentalFeatureTopGuide || ytcenter.settings.ytExperimentFixedTopbar) && ytcenter.settings.ytExperimentalLayotTopbarStatic))) {
              if (document.getElementById("watch-headline-container") || document.getElementById("page-container"))
                (document.getElementById("watch-headline-container") || document.getElementById("page-container")).scrollIntoView(true);
            }
          }
        } else if (page === "channel") {
          ytcenter.page = "channel";
          if (document.body.innerHTML.indexOf("data-video-id=\"") !== -1) {
            id = document.body.innerHTML.match(/data-video-id=\"(.*?)\"/)[1];
          } else if (document.body.innerHTML.indexOf("/v/") !== -1) {
            id = document.body.innerHTML.match(/\/v\/([0-9a-zA-Z_-]+)/)[1];
          } else if (document.body.innerHTML.indexOf("\/v\/") !== -1) {
            id = document.body.innerHTML.match(/\\\/v\\\/([0-9a-zA-Z_-]+)/)[1];
          }
          if (id) {
            var url = "/get_video_info?html5=0&cver=html5&dash=" + (ytcenter.settings.channel_dashPlayback ? "1" : "0") + "&video_id=" + id + "&eurl=" + encodeURIComponent(loc.href);
            con.log("Contacting: " + url);
            ytcenter.utils.xhr({
              method: "GET",
              url: url,
              headers: {
                "Content-Type": "text/plain"
              },
              onload: function(response){
                try {
                  if (response.responseText) {
                    var o = {};
                    var s = response.responseText.split("&");
                    for (var i = 0; i < s.length; i++) {
                      var ss = s[i].split("=");
                      o[ss[0]] = decodeURIComponent(ss[1]);
                    }
                    ytcenter.player.setConfig(ytcenter.player.modifyConfig(ytcenter.getPage(), {args: o}));
                    config = ytcenter.player.config;
                    ytcenter.player.update(config);
                    
                    if (ytcenter.player.config.updateConfig) {
                      ytcenter.player.updateConfig(ytcenter.getPage(), ytcenter.player.config);
                    }
                  }
                } catch (e) {
                  con.error(response.responseText);
                  con.error(e);
                }
              },
              onerror: function(){
                ytcenter.video.streams = [];
              }
            });
          }
        } else if (page === "search") {
          ytcenter.page = "search";
        } else {
          ytcenter.page = "normal";
        }
        ytcenter.player.listeners.addEventListener("onAdStart", function(type){
          if (type === "PREROLL") {
            if (ytcenter.getPage() === "watch") {
              if (ytcenter.playlist) {
                if (ytcenter.settings.preventPlaylistAutoPlay) {
                  ytcenter.player.getAPI().mute();
                  ytcenter.player.getAPI().pauseVideo();
                  !ytcenter.settings.mute && ytcenter.player.getAPI().isMuted && ytcenter.player.getAPI().unMute();
                }
              } else {
                if (ytcenter.settings.preventAutoPlay) {
                  ytcenter.player.getAPI().mute();
                  ytcenter.player.getAPI().pauseVideo();
                  !ytcenter.settings.mute && ytcenter.player.getAPI().isMuted && ytcenter.player.getAPI().unMute();
                }
              }
            } else if (ytcenter.getPage() === "channel") {
              if (ytcenter.settings.channel_preventAutoPlay) {
                ytcenter.player.getAPI().mute();
                ytcenter.player.getAPI().pauseVideo();
                !ytcenter.settings.channel_mute && ytcenter.player.getAPI().isMuted && ytcenter.player.getAPI().unMute();
              }
            } else if (ytcenter.getPage() === "embed") {
              if (ytcenter.settings.embed_preventAutoPlay) {
                ytcenter.player.getAPI().mute();
                ytcenter.player.getAPI().pauseVideo();
                !ytcenter.settings.embed_mute && ytcenter.player.getAPI().isMuted && ytcenter.player.getAPI().unMute();
              }
            }
          }
        });
        ytcenter.player.listeners.addEventListener("onReady", function(){
          var api, state;
          if (ytcenter.player.getAPI) api = ytcenter.player.getAPI();
          if (api && api.getPlayerState) state = ytcenter.player.getAPI().getPlayerState();
          if (state === 1) {
            ytcenter.title.addPlayIcon();
          } else {
            ytcenter.title.removePlayIcon();
          }
          ytcenter.title.update();
        });
        
        var tmpFixRepeatAtEnd = false;
        ytcenter.player.listeners.addEventListener("onStateChange", function(state, b){
          if (state === 1) {
            ytcenter.title.addPlayIcon();
          } else {
            ytcenter.title.removePlayIcon();
          }
          ytcenter.title.update();
          
          if (ytcenter.doRepeat && ytcenter.settings.enableRepeat && state === 0) {
            if (ytcenter.settings.tempFixRepeat) {
              ytcenter.player.getAPI().stopVideo();
            }
            ytcenter.player.getAPI().playVideo();
          }
          if (ytcenter.settings.endOfVideoAutoSwitchToTab !== "none") {
            ytcenter.actionPanel.switchTo(ytcenter.settings.endOfVideoAutoSwitchToTab);
          }
        });
        ytcenter.player.listeners.setOverride("SIZE_CLICKED", true);
        ytcenter.player.listeners.addEventListener("SIZE_CLICKED", function(large){
          function getSizeById(id) {
            var sizes = ytcenter.settings["resize-playersizes"];
            for (var i = 0; i < sizes.length; i++) {
              if (id === sizes[i].id) {
                return sizes[i];
              }
            }
            return {
              id: "default",
              config: {
                align: true,
                height: "",
                large: false,
                scrollToPlayer: false,
                scrollToPlayerButton: false,
                width: ""
              }
            };
          }
          if (ytcenter.settings.enableResize) {
            con.log("[Player Resize] Setting to " + (large ? "large" : "small") + "!");
            if (large) {
              ytcenter.player.setPlayerSize(true);
              
              ytcenter.player.currentResizeId = ytcenter.settings['resize-large-button'];
              ytcenter.player.updateResize();
            } else {
              ytcenter.player.setPlayerSize(false);
              
              ytcenter.player.currentResizeId = ytcenter.settings['resize-small-button'];
              ytcenter.player.updateResize();
            }
            
            //ytcenter.events.performEvent("ui-refresh");
          } else {
            this.getOriginalListener()(large);
          }
        });
        
        /*if (ytcenter.feather) {
          var flashvars = document.getElementById("movie_player").getAttribute("flashvars").split("&"),
              args, i;
          for (i = 0; i < flashvars.length; i++) {
            args[decodeURIComponent(flashvars.split("=")[0])] = decodeURIComponent(flashvars.split("=")[0]);
            ytcenter.player.setConfig({args: args});
          }
        }*/
        
        if (page === "watch") {
          //ytcenter.player.setYTConfig({ "SHARE_ON_VIDEO_END": ytcenter.settings.enableYouTubeAutoSwitchToShareTab });
          ytcenter.player.setYTConfig({ "SHARE_ON_VIDEO_END": false });
          if (uw.ytplayer && uw.ytplayer.config) {
            ytcenter.player.setConfig(uw.ytplayer.config);
            config = ytcenter.player.modifyConfig(ytcenter.getPage(), ytcenter.player.config);
          
            ytcenter.player.update(ytcenter.player.config);
          }
          ytcenter.videoHistory.addVideo(config.args.video_id);
          
          ytcenter.placementsystem.clear();
          
          $CreateDownloadButton();
          $CreateRepeatButton();
          $CreateLightButton();
          $CreateAspectButton();
          $CreateResizeButton();
          
          initPlacement();
        }
        
        if (loc.hash === "#ytcenter.settings.open") {
          loc.hash = "#!";
          ytcenter.unsafe.openSettings();
        }
      });
      ytcenter.pageReadinessListener.addEventListener("bodyComplete", function(){
        var page = ytcenter.getPage();
        if (page === "embed" && !ytcenter.settings.embed_enabled) return;
        if (page === "comments") {
          ytcenter.domEvents.ready();
        }
        if (page === "embed") {
          ytcenter.embed.load();
        } else {
          ytcenter.guideMode.setup();
          ytcenter.actionPanel.setup();
        }
      });
      
      ytcenter.spf.addEventListener("requested", "before", function(url){
        ytcenter.spf.unsafeProcessedRun = false;
        if (!ytcenter.settings.ytspf) {
          loc.href = url;
          throw new Error("SPF is disabled!");
        }
      });
      ytcenter.spf.addEventListener("received", "after", function(url, data){
        ytcenter.title.originalTitle = data.getTitle() || ytcenter.title.originalTitle;
        ytcenter.title.update();
      });
      ytcenter.spf.addEventListener("part-processed", "before", function(url, data){
        var d = null;
        if (data.hasType("player"))
          d = data.getData("player");
        
        if (d && d.hasPlayerConfig()) {
          d.setPlayerConfig(ytcenter.player.modifyConfig(ytcenter.getPage(url), d.getPlayerConfig()));
          ytcenter.player.config = d.getPlayerConfig();
        }
        return [url, data]
      });
      ytcenter.spf.addEventListener("part-received", "before", function(url, data){
        ytcenter.unsafe.spf.url = url;
        ytcenter.unsafe.spf.data = data;
        
        ytcenter.title.originalTitle = data.getTitle() || ytcenter.title.originalTitle;
        ytcenter.title.update();
        
        var d = null;
        if (data.hasType("player"))
          d = data.getData("player");
          
        if (d && d.hasPlayerConfig()) {
          d.setPlayerConfig(ytcenter.player.modifyConfig(ytcenter.getPage(url), d.getPlayerConfig()));
          ytcenter.player.config = d.getPlayerConfig();
        }
        
        if (data.hasType("page")) {
          d = data.getData("page");
          
          if (ytcenter.settings.experimentalFeatureTopGuide && url.indexOf("youtube.com/watch?") !== -1) {
            var cc = d.getAttribute("content", "class");
            if (!cc) cc = "";
            d.setAttribute("content", "class", cc + " yt-card");
          }
          
          var bodyClasses = d.getAttribute("body", "class");
          if (!bodyClasses) bodyClasses = "";
          
          bodyClasses = ytcenter.classManagement.getClassesForElementByTagName("body", url) + " " + bodyClasses;
          
          d.setAttribute("body", "class", bodyClasses);
          
          var js = d.getJS();
          if (!js) js = "";
          d.setJS(js + "<script>ytcenter.spf.processed();</script>");
        }
        
        return [url, data];
      });
      
      ytcenter.spf.addEventListener("received", "before", function(url, data){
        ytcenter.unsafe.spf.url = url;
        ytcenter.unsafe.spf.data = data;
        var d = null;
        
        if (data.hasType("player"))
          d = data.getData("player");
        if (d && d.hasPlayerConfig()) {
          d.setPlayerConfig(ytcenter.player.modifyConfig(ytcenter.getPage(url), d.getPlayerConfig()));
          ytcenter.player.config = d.getPlayerConfig();
        }
        
        if (data.hasType("page")) {
          d = data.getData("page");
          
          if (ytcenter.settings.experimentalFeatureTopGuide && url.indexOf("youtube.com/watch?") !== -1) {
            var cc = d.getAttribute("content", "class");
            if (!cc) cc = "";
            d.setAttribute("content", "class", cc + " yt-card");
          }
          
          var bodyClasses = d.getAttribute("body", "class");
          if (!bodyClasses) bodyClasses = "";
          
          bodyClasses = ytcenter.classManagement.getClassesForElementByTagName("body", url) + " " + bodyClasses;
          
          d.setAttribute("body", "class", bodyClasses);
          
          var js = d.getJS();
          if (!js) js = "";
          d.setJS(js + "<script>ytcenter.spf.processed();</script>");
        }
        
        return [url, data];
      });
      
      ytcenter.unsafe.spf.processed = function(url, data){
        if (ytcenter.spf.unsafeProcessedRun) return;
        ytcenter.spf.unsafeProcessedRun = true;
        var d = null,
            config, a, i;
        url = ytcenter.utils.getURL(url || ytcenter.unsafe.spf.url || loc.href) || loc;
        
        
        if (data.hasType("player"))
          d = data.getData("player");
        
        if (d && d.hasPlayerConfig()) {
          config = d.getPlayerConfig();
          ytcenter.player.config = config;
        } else {
          config = ytcenter.player.config;
        }
        
        ytcenter.classManagement.applyClasses(url.href);
        
        if (config) {
          try {
            ytcenter.player.updateConfig(url.href, ytcenter.player.modifyConfig(ytcenter.getPage(url.href), config));
            ytcenter.videoHistory.addVideo(config.args.video_id);
          } catch (e) {
            con.error(e);
          }
        }
        ytcenter.placementsystem.clear();
        ytcenter.topScrollPlayer.setEnabled(ytcenter.getPage() === "watch" && ytcenter.settings.topScrollPlayerEnabled);
        if (url.pathname !== "/watch") {
          if (ytcenter.getPage(url.href) === "feed_what_to_watch") {
            ytcenter.intelligentFeed.setup();
          }
          ytcenter.player.turnLightOn();
        } else {
          if (ytcenter.settings.lightbulbAutoOff)
            ytcenter.player.turnLightOff();
          ytcenter.guideMode.setup();
          //ytcenter.player.setYTConfig({"SHARE_ON_VIDEO_END": ytcenter.settings.enableYouTubeAutoSwitchToShareTab});
          ytcenter.player.setYTConfig({ "SHARE_ON_VIDEO_END": false });
          if (ytcenter.settings["resize-default-playersize"] === "default") {
            ytcenter.player.currentResizeId = (ytcenter.settings.player_wide ? ytcenter.settings["resize-large-button"] : ytcenter.settings["resize-small-button"]);
            ytcenter.player.updateResize();
          } else {
            ytcenter.player.currentResizeId = ytcenter.settings['resize-default-playersize'];
            ytcenter.player.updateResize();
          }
          try {
            ytcenter.guide.hidden = ytcenter.settings.watch7playerguidealwayshide;
            ytcenter.guide.setup();
          } catch (e) {
            con.error(e);
          }
          if (ytcenter.settings.autoActivateRepeat) {
            ytcenter.doRepeat = true;
          } else {
            ytcenter.doRepeat = false;
          }
          
          $CreateDownloadButton();
          $CreateRepeatButton();
          $CreateLightButton();
          $CreateAspectButton();
          $CreateResizeButton();
          
          initPlacement();
          
          ytcenter.uploaderFlag.init();
          
          var wvi = document.getElementById("watch7-views-info"),
              sl = document.getElementsByClassName("video-extras-sparkbar-likes"),
              sd = document.getElementsByClassName("video-extras-sparkbar-dislikes");
          if (sl && sd && sl.length > 0 && sd.length > 0 && sl[0] && sd[0]) {
            sl[0].style.background = ytcenter.settings.sparkbarLikesColor;
            sl[0].style.height = ytcenter.settings.sparkbarHeight + "px";
            sd[0].style.background = ytcenter.settings.sparkbarDislikesColor;
            sd[0].style.height = ytcenter.settings.sparkbarHeight + "px";
            
            sd[0].parentNode.style.height = ytcenter.settings.sparkbarHeight + "px";
          }
          
          if (ytcenter.page === "watch") {
            if (((ytcenter.settings.topScrollPlayerEnabled && !ytcenter.settings.topScrollPlayerActivated) || !ytcenter.settings.topScrollPlayerEnabled) && ytcenter.settings.scrollToPlayer && (!ytcenter.settings.experimentalFeatureTopGuide || (ytcenter.settings.experimentalFeatureTopGuide && ytcenter.settings.ytExperimentalLayotTopbarStatic))) {
              (document.getElementById("watch-headline-container") || document.getElementById("page-container")).scrollIntoView(true);
            }
          }
          ytcenter.playlist = false;
          try {
            if (document.getElementById("watch7-playlist-data") || url.search.indexOf("list=") !== -1) {
              ytcenter.playlist = true;
            }
          } catch (e) {
            con.error(e);
          }
          try {
            ytcenter.video.author = (document.getElementById("watch7-user-header").getElementsByClassName("yt-user-name")[0].textContent || document.getElementsByClassName("yt-user-name")[0].textContent);
            ytcenter.user.callChannelFeed(ytcenter.video.author, function(){
              ytcenter.video._channel = this;
              ytcenter.video.channelname = this.title['$t'];
            });
          } catch (e) {
            con.error(e);
          }
          
          ytcenter.comments.setup();
          ytcenter.actionPanel.setup();
        }
        /* Removing leftover tooltips */
        a = ytcenter.utils.transformToArray(document.getElementsByClassName("yt-uix-tooltip-tip"));
        for (i = 0; i < a.length; i++) {
          if (a[i] && a[i].parentNode === document.body) {
            con.log("[Tooltip Cleanup] Removed tooltip with id #" + a[i].id.replace("yt-uix-tooltip", ""));
            document.body.removeChild(a[i]);
          }
        }
        
        return [url, data];
      };
      ytcenter.spf.addEventListener("processed", "before", function(url, data){
        var d = null, config;
        url = ytcenter.utils.getURL(url || ytcenter.unsafe.spf.url || loc.href) || loc;
        
        if (data.hasType("player"))
          d = data.getData("player");
        
        if (d && d.hasPlayerConfig()) {
          d.setPlayerConfig(ytcenter.player.modifyConfig(ytcenter.getPage(url.href), d.getPlayerConfig()));
        }
        return [url, data];
      });
      ytcenter.spf.addEventListener("processed", "after", ytcenter.unsafe.spf.processed);
      
      ytcenter.pageReadinessListener.setup();
      
      try {
        ytcenter.unload(function(){
          if (ytcenter.guide.observer) {
            ytcenter.guide.observer.disconnect();
          }
        });
      } catch (e) {
        con.error(e);
      }
    })();
    con.log("At Scope End");
  };
  if (window && window.navigator && window.navigator.userAgent && window.navigator.userAgent.indexOf('Chrome') > -1 && @identifier@ !== 2) {
    try {
      var __uw = (function(){
        var a;
        try {
          a = unsafeWindow === window ? false : unsafeWindow;
        } catch (e) {
        } finally {
          return a || window;
        }
      })();
      if (__uw === window) {
        window.addEventListener("message", function(e){
          if (!e.data || e.data.indexOf("{") !== 0) return;
          var d = JSON.parse(e.data);
          if (d.method === "CrossOriginXHR") {
            injected_xhr(d.id, d.arguments[0]); // id, details
          } else if (d.method === "saveSettings") {
            injected_saveSettings(d.id, d.arguments[0], d.arguments[1]); // id, key, data
          } else if (d.method === "loadSettings") {
            injected_loadSettings(d.id, d.arguments[0]); // id, key
          }
        }, false);
        
        inject(main_function);
      } else {
        //try {
          main_function(false, @identifier@, @devbuild@, @devnumber@);
        /*} catch (e) {
        }*/
      }
    } catch (e) {
      window.addEventListener("message", function(e){
        var d = JSON.parse(e.data);
        if (d.method === "CrossOriginXHR") {
          injected_xhr(d.id, d.arguments[0]); // id, details
        } else if (d.method === "saveSettings") {
          injected_saveSettings(d.id, d.arguments[0], d.arguments[1]); // id, key, data
        } else if (d.method === "loadSettings") {
          injected_loadSettings(d.id, d.arguments[0]); // id, key
        }
      }, false);
      
      inject(main_function);
    }
  } else {
    //try {
      main_function(false, @identifier@, @devbuild@, @devnumber@);
    //} catch (e) {
      //console.error(e);
    //}
  }
})();
