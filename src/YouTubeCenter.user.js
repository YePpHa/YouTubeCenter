// ==UserScript==
// @name            YouTube Center
// @namespace       http://www.facebook.com/YouTubeCenter
// @version         @ant-version@
// @author          Jeppe Rune Mortensen (YePpHa)
// @description     YouTube Center contains all kind of different useful functions which makes your visit on YouTube much more entertaining.
// @icon            https://dl.dropboxusercontent.com/u/13162258/YouTube%20Center/icons/logo-48x48.png
// @icon64          https://dl.dropboxusercontent.com/u/13162258/YouTube%20Center/icons/logo-64x64.png
// @domain          userscripts.org
// @domain          youtube.com
// @domain          www.youtube.com
// @domain          gdata.youtube.com
// @match           http://*.youtube.com/*
// @match           https://*.youtube.com/*
// @match           http://userscripts.org/scripts/source/114002.meta.js
// @match           http://s.ytimg.com/yts/jsbin/*
// @match           https://s.ytimg.com/yts/jsbin/*
// @include         http://*.youtube.com/*
// @include         https://*.youtube.com/*
// @exclude         http://apiblog.youtube.com/*
// @exclude         https://apiblog.youtube.com/*
// @grant           GM_getValue
// @grant           GM_setValue
// @grant           GM_xmlhttpRequest
// @grant           GM_addStyle
// @grant           GM_log
// @updateURL       http://userscripts.org/scripts/source/114002.meta.js
// @downloadURL     http://userscripts.org/scripts/source/114002.user.js
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
      script.appendChild(document.createTextNode("(" + func + ")(true, @identifier@);\n//# sourceURL=YouTubeCenter.js"));
      p.appendChild(script);
      p.removeChild(script);
    } catch (e) {}
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
  
  var main_function = function(injected, identifier){
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
        return true;
      } else {
        if (ytcenter.storageType === 3) {
          GM_setValue(key, value);
          if (GM_getValue(key, null) === value) return true;
        } else if (ytcenter.storageType === 2) {
          localStorage[key] = value;
          if (localStorage[key] === value) return true; // validation
        } else if (ytcenter.storageType === 1) {
          uw.localStorage[key] = value;
          if (uw.localStorage[key] === value) return true; // validation
        } else if (ytcenter.storageType === 0) {
          ytcenter.utils.setCookie(key, value, null, "/", 1000*24*60*60*1000);
          if (ytcenter.utils.getCookie(name) === value) return true; // validation
        } else {
          con.error("[Storage] Unknown Storage Type!");
        }
        return false;
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
      ytcenter.events.addEvent("ui-refresh", function(){
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
        ytcenter.player.turnLightOff();
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
      var priority = ['small', 'medium', 'large', 'hd720', 'hd1080', 'highres'];
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
      }
      btn1a.setAttribute("target", "_blank");
      ytcenter.events.addEvent("ui-refresh", function(){
        stream = $DownloadButtonStream();
        if (stream) {
          btn1a.setAttribute("href", ytcenter.video.downloadLink(stream));
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
                };
              })(stream_groups[key].streams[i], item, downloadStreamListener));
            }
            
            var stream_name = {
              highres: ytcenter.language.getLocale("HIGHRES"),
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
      var isExpDialog = ytcenter.settings['experimentalFeatureTopGuide'] || ytcenter.settings['ytExperimentFixedTopbar'] || ytcenter.settings['settingsDialogMode'];
      var container = document.createElement("div");
      container.id = "ytcenter-settings";
      var root = document.createElement("div");
      root.setAttribute("style", (isExpDialog ? "margin: -15px -20px 0;" : "background:#ededed;margin-bottom: 10px;") + "padding-top: 7px;border-bottom: 1px solid #e6e6e6;");
      
      if (!isExpDialog) {
        var header = document.createElement("div");
        header.setAttribute("style", "padding:10px 35px 0;font-size:18px;font-weight:bold");
        header.textContent = ytcenter.language.getLocale("SETTINGS_TITLE");
        header.className = "ytcenter-settings-title";
        root.appendChild(header);
      }
      var tabsContainer = document.createElement("div");
      tabsContainer.className = "ytcenter-settings-header";
      if (!ytcenter.settings['experimentalFeatureTopGuide'] && !ytcenter.settings['ytExperimentFixedTopbar'] && !ytcenter.settings['settingsDialogMode']) {
        tabsContainer.setAttribute("style", "padding: 0px 50px;");
      }
      container.className = "hid" + (isExpDialog ? " ytcenter-exp-settings-dialog" : "");
      container.setAttribute("style", "position:relative;width:" + (isExpDialog ? "975px" : "100%") + ";background:#ffffff;" + (isExpDialog ? "" : "border-bottom:1px solid #dbdbdb;"));
      var content = document.createElement("div");
      if (isExpDialog) {
        content.style.marginTop = "10px";
      }
      root.appendChild(tabsContainer);
      container.appendChild(root);
      container.appendChild(content);
      
      var tabs = document.createElement("ul");
      tabs.className = "clearfix";
      tabsContainer.appendChild(tabs);
      var tabgroups = document.createElement("div");
      tabgroups.className = "ytcenter-settings-content";
      content.appendChild(tabgroups);
      
      var first = true;
      var last;
      for (var key in ytcenter.ui.settings) {
        if (ytcenter.ui.settings.hasOwnProperty(key)) {
          var tc = document.createElement("div");
          if (!first) {
            tc.className = "hid";
          }
          var li = document.createElement("li");
          li.style.cssFloat = "left";
          var tab = document.createElement("a");
          last = tab;
          tab.setAttribute("onclick", ";return false;");
          tab.className = "yt-uix-button yt-uix-button-epic-nav-item" + (first ? " selected" : "");
          tab.setAttribute("role", "button");
          tab.style.marginLeft = "3px";
          tab.style.paddingLeft = ".9em";
          tab.style.paddingRight = ".9em";
          li.style.marginLeft = "13px";
          var bc = document.createElement("span");
          bc.className = "yt-uix-button-content";
          bc.textContent = ytcenter.language.getLocale(key);
          ytcenter.language.addLocaleElement(bc, key, "@textContent");
          tab.appendChild(bc);
          tab.addEventListener("click", (function(tabs, tc, tabgroups){
            return function(){
              for (var i = 0; i < tabs.children.length; i++) {
                ytcenter.utils.removeClass(tabs.children[i].firstChild, "selected");
              }
              for (var i = 0; i < tabgroups.children.length; i++) {
                ytcenter.utils.addClass(tabgroups.children[i], "hid");
              }
              ytcenter.utils.addClass(this, "selected");
              ytcenter.utils.removeClass(tc, "hid");
              ytcenter.events.performEvent("ui-refresh");
            };
          })(tabs, tc, tabgroups), false);
          li.appendChild(tab);
          tabs.appendChild(li);
          for (var i = 0; i < ytcenter.ui.settings[key].length; i++) {
            tc.appendChild($CreateSettingElement(tab, ytcenter.ui.settings[key][i]));
          }
          tabgroups.appendChild(tc);
          if (first) {
            first = false;
          }
        }
      }
      if (document.getElementById("masthead-user-display")) {
        document.getElementById("masthead-user-display").style.display = "inline";
      }
      if (document.getElementById("masthead-user-expander")) {
        document.getElementById("masthead-user-expander").style.verticalAlign = "middle";
      }
      if (isExpDialog) {
        var appbar = document.getElementById("appbar-settings-menu"),
            liSettings = document.createElement("li"),
            spanText = document.createElement("span"),
            textIcon = document.createElement("img"),
            text = document.createTextNode("YouTube Center Settings");
        liSettings.setAttribute("id", "ytcenter-settings-toggler");
        liSettings.setAttribute("role", "menuitem");
        
        spanText.className = "yt-uix-button-menu-item upload-menu-link";
        var dialog = ytcenter.dialog("SETTINGS_TITLE", container, [], "top"),
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
        ytcenter.settingsControlVisibility = function(visible){
          dialog.setVisibility(visible);
        };
        dialog.getHeader().appendChild(closeButton);
        dialog.getHeader().style.margin = "0 -20px -10px";
        dialog.getHeader().style.borderBottom = "0";
        dialog.getBase().style.overflowY = "scroll";
        dialog.getFooter().style.display = "none";
        ytcenter.utils.removeClass(container, "hid");
        if (ytcenter.settings['experimentalFeatureTopGuide']) {
          ytcenter.utils.addEventListener(spanText, "click", function(){
            dialog.setVisibility(true);
          }, false);
          
          textIcon.className = "upload-menu-account-settings";
          textIcon.setAttribute("src", "//s.ytimg.com/yts/img/pixel-vfl3z5WfW.gif");
          
          spanText.appendChild(textIcon);
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
            dialog.setVisibility(true);
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
      } else {
        if (document.getElementById("yt-masthead-container")) {
          var masthead = document.getElementById("yt-masthead-container").nextElementSibling.nextElementSibling;
          var p = masthead.parentNode || document.getElementById("body-container") || document.body;
          if (masthead) {
            p.insertBefore(container, masthead);
          } else {
            p.appendChild(container);
          }
        } else if (document.getElementById("header")) {
          document.getElementById("header").appendChild(container);
        } else if (document.getElementById("alerts")) {
          document.getElementById("alerts").parentNode.insertBefore(container, document.getElementById("alerts").nextElementSibling);
        }else {
          con.error("Settings UI - Couldn't find element to append");
        }
      
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
        ytcenter.settingsControlVisibility = function(visible){
          if (!visible) {
            ytcenter.utils.addClass(container, "hid");
          } else {
            ytcenter.utils.removeClass(container, "hid");
          }
        };
        btn.addEventListener("click", function(){
          if (!ytcenter.utils.hasClass(container, "hid")) {
            ytcenter.utils.addClass(container, "hid");
          } else {
            ytcenter.utils.removeClass(container, "hid");
          }
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
    
    function $CreateSettingElement(tab, recipe) {
      var wrapper = document.createElement("div");
      wrapper.style.padding = "4px 0";
      if (recipe.label) {
        var label = document.createElement("span");
        label.style.display = "inline-block";
        label.style.width = "260px";
        label.style.color = "#555";
        var ltext = document.createTextNode(ytcenter.language.getLocale(recipe.label));
        label.appendChild(ltext);
        ytcenter.language.addLocaleElement(ltext, recipe.label, "@textContent");
        
        if (recipe.help) {
          var help = document.createElement("a");
          help.setAttribute("href", recipe.help);
          help.setAttribute("target", "_blank");
          help.setAttribute("style", "vertical-align: super; font-size: 10px");
          help.appendChild(document.createTextNode('?'));

          var replace = {
            option: {
              toString: function() { return ytcenter.language.getLocale(recipe.label); }
            }
          };
          help.setAttribute("title", ytcenter.utils.replaceTextAsString(ytcenter.language.getLocale("SETTINGS_HELP_ABOUT"), replace));
          ytcenter.language.addLocaleElement(help, "SETTINGS_HELP_ABOUT", "title", replace);

          label.appendChild(help);
        }
        
        if (recipe.tooltip) {
          var tooltip = document.createElement("p");
          tooltip.style.color = "#9E9E9E";
          tooltip.style.fontSize = "11px";
          tooltip.style.width = "170px";
          tooltip.textContent = ytcenter.language.getLocale(recipe.tooltip);
          ytcenter.language.addLocaleElement(tooltip, recipe.tooltip, "@textContent");
          label.appendChild(tooltip);
        }
        
        wrapper.appendChild(label);
      }
      var elm = null;
      switch (recipe.type) {
        case 'bool':
          var ds = false;
          if (recipe.defaultSetting) {
            var ds = ytcenter.settings[recipe.defaultSetting];
          }
          elm = document.createElement("span");
          if (recipe.style) {
            for (var key in recipe.style) {
              if (recipe.style.hasOwnProperty(key)) {
                wrapper.style[key] = recipe.style[key];
              }
            }
          }
          elm.className = "yt-uix-form-input-checkbox-container" + (ds ? " checked" : "");
          var cb = document.createElement("input");
          cb.setAttribute("type", "checkbox");
          cb.className = "yt-uix-form-input-checkbox";
          if (ds) {
            cb.checked = "checked";
          }
          cb.value = "true";
          cb.addEventListener('click', (function(defaultSetting){
            return function(){
              if (defaultSetting) {
                ytcenter.settings[defaultSetting] = (this.checked ? true : false);
                ytcenter.saveSettings();
              }
            };
          })(recipe.defaultSetting), false);
          if (recipe.listeners) {
            for (var i = 0; i < recipe.listeners.length; i++) {
              cb.addEventListener(recipe.listeners[i].event, recipe.listeners[i].callback, (recipe.listeners[i].bubble ? recipe.listeners[i].bubble : false));
            }
          }
          elm.appendChild(cb);
          var cbe = document.createElement("span");
          cbe.className = "yt-uix-form-input-checkbox-element";
          elm.appendChild(cbe);
          break;
        case 'text':
          var ds = "";
          if (recipe.defaultSetting) {
            var ds = ytcenter.settings[recipe.defaultSetting];
          }
          elm = document.createElement("input");
          if (recipe.style) {
            for (var key in recipe.style) {
              if (recipe.style.hasOwnProperty(key)) {
                elm.style[key] = recipe.style[key];
              }
            }
          }
          elm.value = ds;
          elm.setAttribute("type", "text");
          elm.className = "yt-uix-form-input-text";
          elm.addEventListener("change", (function(defaultSetting){
            return function(){
              ytcenter.settings[defaultSetting] = this.value;
              ytcenter.saveSettings();
            };
          })(recipe.defaultSetting), false);
          if (recipe.listeners) {
            for (var i = 0; i < recipe.listeners.length; i++) {
              elm.addEventListener(recipe.listeners[i].event, recipe.listeners[i].callback, (recipe.listeners[i].bubble ? recipe.listeners[i].bubble : false));
            }
          }
          break;
        case 'list':
          elm = document.createElement("span");
          elm.className = "yt-uix-form-input-select";
          var sc = document.createElement("span");
          sc.className = "yt-uix-form-input-select-content";
          
          var defaultLabel;
          var s = document.createElement("select");
          s.className = "yt-uix-form-input-select-element";
          s.style.cursor = "pointer";
          if (recipe.advlist) {
            recipe.list = recipe.advlist();
          }
          if (recipe.list) {
            var defaultLabelText = ytcenter.language.getLocale(recipe.list[0].label);
            for (var i = 0; i < recipe.list.length; i++) {
              var item = document.createElement("option");
              item.value = recipe.list[i].value;
              
              if (recipe.list[i].label) {
                item.textContent = ytcenter.language.getLocale(recipe.list[i].label);
                ytcenter.language.addLocaleElement(item, recipe.list[i].label, "@textContent");
              } else if (recipe.list[i].variable) {
                item.textContent = recipe.list[i].variable();
              }
              if (recipe.list[i].value === ytcenter.settings[recipe.defaultSetting]) {
                item.selected = true;
                defaultLabelText = item.textContent;
              }
              s.appendChild(item);
            }
            var sc1 = document.createElement("img");
            sc1.src = "//s.ytimg.com/yt/img/pixel-vfl3z5WfW.gif";
            sc1.className = "yt-uix-form-input-select-arrow";
            sc.appendChild(sc1);
            var sc2 = document.createElement("span");
            sc2.className = "yt-uix-form-input-select-value";
            sc2.textContent = defaultLabelText;
            sc.appendChild(sc2);
            ytcenter.events.addEvent("ui-refresh", (function(__sc2, s){
              return function(){
                __sc2.textContent = s.options[s.selectedIndex].textContent;
              };
            })(sc2, s));
          }
          if (recipe.style) {
            for (var key in recipe.style) {
              if (recipe.style.hasOwnProperty(key)) {
                wrapper.style[key] = recipe.style[key];
              }
            }
          }
          s.addEventListener('change', (function(defaultSetting){
            return function(){
              ytcenter.settings[defaultSetting] = this.value;
              ytcenter.saveSettings();
            };
          })(recipe.defaultSetting), false);
          if (recipe.listeners) {
            for (var i = 0; i < recipe.listeners.length; i++) {
              s.addEventListener(recipe.listeners[i].event, recipe.listeners[i].callback, (recipe.listeners[i].bubble ? recipe.listeners[i].bubble : false));
            }
          }
          elm.appendChild(sc);
          elm.appendChild(s);
          break;
        case 'colorpicker':
          var _il = ytcenter.embeds.colorPicker();
          _il.bind((function(ds){
            return function(val){
              ytcenter.settings[ds] = val;
              ytcenter.saveSettings();
            };
          })(recipe.defaultSetting));
          _il.update(ytcenter.settings[recipe.defaultSetting]);
          elm = _il.element;
          break;
        case 'bgcolorlist':
          var _il = ytcenter.embeds.bgcolorlist();
          _il.bind((function(ds){
            return function(val){
              ytcenter.settings[ds] = val;
              ytcenter.saveSettings();
            };
          })(recipe.defaultSetting));
          _il.update(ytcenter.settings[recipe.defaultSetting]);
          elm = _il.element;
          break;
        case 'element':
          elm = document.createElement(recipe.tagname);
          if (recipe.style) {
            for (var key in recipe.style) {
              if (recipe.style.hasOwnProperty(key)) {
                elm.style[key] = recipe.style[key];
              }
            }
          }
          if (recipe.className) {
            elm.className += " " + recipe.className;
          }
          if (recipe.text) {
            elm.textContent = recipe.text;
          }
          if (recipe.html) {
            con.error("[Settings Recipe] Element attribute HTML not allowed!");
          }
          if (recipe.load) {
            tab.addEventListener("click", (function(elm, load){
              return function(){
                load.apply(elm, []);
              };
            })(elm, recipe.load), false);
          }
          if (recipe.listeners) {
            for (var i = 0; i < recipe.listeners.length; i++) {
              elm.addEventListener(recipe.listeners[i].event, recipe.listeners[i].callback, (recipe.listeners[i].bubble ? recipe.listeners[i].bubble : false));
            }
          }
          break;
        case 'textarea':
          elm = document.createElement('textarea');
          elm.className = "yt-uix-form-textarea";
          if (recipe.className) {
            elm.className += " " + recipe.className;
          }
          if (recipe.style) {
            for (var key in recipe.style) {
              if (recipe.style.hasOwnProperty(key)) {
                elm.style[key] = recipe.style[key];
              }
            }
          }
          if (recipe.text) {
            elm.textContent = recipe.text;
          }
          if (recipe.html) {
            con.error("[Settings Recipe] Textarea doesn't allow the HTML attribute!");
          }
          if (recipe.load) {
            tab.addEventListener("click", (function(elm, load){
              return function(){
                load.apply(elm, []);
              };
            })(elm, recipe.load), false);
          }
          if (recipe.listeners) {
            for (var i = 0; i < recipe.listeners.length; i++) {
              elm.addEventListener(recipe.listeners[i].event, recipe.listeners[i].callback, (recipe.listeners[i].bubble ? recipe.listeners[i].bubble : false));
            }
          }
          break;
        case 'html':
          elm = document.createElement("div");
          con.error("[Settings Recipe] Illegal type => HTML");
          break;
        case 'multi':
          var multilist = ytcenter.embeds.multilist(recipe.multi);
          multilist.bind((function(r){
            return function(val){
              ytcenter.settings[r.defaultSetting] = val;
              ytcenter.saveSettings();
              
              if (r.listeners) {
                for (var i = 0; i < r.listeners.length; i++) {
                  r.listeners[i].callback(val);
                }
              }
            };
          })(recipe));
          multilist.update(ytcenter.settings[recipe.defaultSetting]);
          
          elm = multilist.element;
          if (recipe.style) {
            for (var key in recipe.style) {
              if (recipe.style.hasOwnProperty(key)) {
                elm.style[key] = recipe.style[key];
              }
            }
          }
          break;
        case 'range':
          elm = document.createElement("div");
          elm.style.display = "inline";
          if (recipe.style) {
            for (var key in recipe.style) {
              if (recipe.style.hasOwnProperty(key)) {
                elm.style[key] = recipe.style[key];
              }
            }
          }
          
          var slide = document.createElement("span");
          slide.className = "ytcenter-range";
          slide.setAttribute("style", "display:inline-block;cursor:default;position:relative;border:1px solid;outline:0;white-space:nowrap;word-wrap:normal;vertical-align:middle;-moz-border-radius:2px;-webkit-border-radius:2px;border-radius:2px;border-color:#CCC #CCC #AAA;background:white;padding:0;margin:0;-webkit-touch-callout:none;-webkit-user-select:none;-khtml-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;");
          var handle = document.createElement("a");
          slide.appendChild(handle);
          handle.className = "yt-uix-button yt-uix-button-default ytcenter-range-handle";
          handle.setAttribute("style", "position:absolute;top:-1px;left:0px;outline:none;margin-left:-.5em;cursor:default;padding:0;margin:0;-webkit-touch-callout:none;-webkit-user-select:none;-khtml-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;");
          
          elm.appendChild(slide);
          
          var _text = document.createElement("input");
          _text.setAttribute("type", "text");
          _text.value = ytcenter.settings[recipe.defaultSetting];
          _text.style.width = "25px";
          _text.style.marginLeft = "4px";
          
          elm.appendChild(_text);
          
          var _slide = $SlideRange(slide, handle, recipe.minRange, recipe.maxRange, ytcenter.settings[recipe.defaultSetting]);
          
          _slide.addEventListener("valuechange", (function(status_elm){
            return function(newvalue){
              status_elm.value = Math.round(newvalue);
            };
          })(_text));
          
          _slide.addEventListener("change", (function(status_elm, recipe){
            return function(newvalue){
              status_elm.value = Math.round(newvalue);
              ytcenter.settings[recipe.defaultSetting] = status_elm.value;
              ytcenter.saveSettings();
            };
          })(_text, recipe));
          
          _text.addEventListener("input", (function(_slide){
            return function(){
              if (this.value === '') this.value = "0";
              this.value = Math.round(_slide.setValue(this.value));
            };
          })(_slide), false);
          _text.addEventListener("change", (function(_slide, recipe){
            return function(){
              if (this.value === '') this.value = "0";
              this.value = Math.round(_slide.setValue(this.value));
              ytcenter.settings[recipe.defaultSetting] = this.value;
              ytcenter.saveSettings(true);
            };
          })(_slide, recipe), false);
          break;
        case 'button':
          elm = document.createElement("button");
          elm.setAttribute("type", "button");
          elm.setAttribute("role", "button");
          elm.setAttribute("onclick", ";return false;");
          elm.className = "yt-uix-button yt-uix-button-default";
          var c = document.createElement("span");
          c.className = "yt-uix-button-content";
          if (recipe.text) {
            c.textContent = ytcenter.language.getLocale(recipe.text);
            ytcenter.language.addLocaleElement(c, recipe.text, "@textContent");
          }
          if (recipe.listeners) {
            for (var j = 0; j < recipe.listeners.length; j++) {
              elm.addEventListener(recipe.listeners[j].event, recipe.listeners[j].callback, (recipe.listeners[j].bubble ? recipe.listeners[j].bubble : false));
            }
          }
          if (recipe.style) {
            for (var key in recipe.style) {
              if (recipe.style.hasOwnProperty(key)) {
                elm.style[key] = recipe.style[key];
              }
            }
          }
          elm.appendChild(c);
          break;
        case 'resizedropdown':
          var _rdd = ytcenter.embeds.resizedropdown(recipe.bind);
          _rdd.bind((function(ds){
            return function(val){
              ytcenter.settings[ds] = val;
              ytcenter.saveSettings();
            };
          })(recipe.defaultSetting));
          _rdd.update(ytcenter.settings[recipe.defaultSetting]);
          elm = _rdd.element;
          break;
        case 'defaultplayersizedropdown':
          var _rdd = ytcenter.embeds.defaultplayersizedropdown(recipe.bind);
          _rdd.bind((function(ds){
            return function(val){
              ytcenter.settings[ds] = val;
              ytcenter.saveSettings();
            };
          })(recipe.defaultSetting));
          _rdd.update(ytcenter.settings[recipe.defaultSetting]);
          elm = _rdd.element;
          break;
        case 'resizeItemList':
          var _il = ytcenter.embeds.resizeItemList();
          _il.bind((function(ds){
            return function(val){
              ytcenter.settings[ds] = val;
              ytcenter.saveSettings();
            };
          })(recipe.defaultSetting));
          _il.update(ytcenter.settings[recipe.defaultSetting]);
          elm = _il.element;
          break;
        case "horizontalRule":
          elm = document.createElement("hr");
          elm.className = "yt-horizontal-rule";
          elm.style.zIndex = "0";
          if (recipe.style) {
            for (var key in recipe.style) {
              if (recipe.style.hasOwnProperty(key)) {
                elm.style[key] = recipe.style[key];
              }
            }
          }
          if (recipe.listeners) {
            for (var i = 0; i < recipe.listeners.length; i++) {
              elm.addEventListener(recipe.listeners[i].event, recipe.listeners[i].callback, (recipe.listeners[i].bubble ? recipe.listeners[i].bubble : false));
            }
          }
          break;
        case "newline":
          elm = document.createElement("br");
          if (recipe.style) {
            for (var key in recipe.style) {
              if (recipe.style.hasOwnProperty(key)) {
                elm.style[key] = recipe.style[key];
              }
            }
          }
          if (recipe.listeners) {
            for (var i = 0; i < recipe.listeners.length; i++) {
              elm.addEventListener(recipe.listeners[i].event, recipe.listeners[i].callback, (recipe.listeners[i].bubble ? recipe.listeners[i].bubble : false));
            }
          }
          break;
        case "textContent":
          elm = document.createElement("div");
          if (recipe.style) {
            for (var key in recipe.style) {
              if (recipe.style.hasOwnProperty(key)) {
                elm.style[key] = recipe.style[key];
              }
            }
          }
          if (recipe.text) {
            if (recipe.replace) {
              elm.textContent = ytcenter.utils.replaceTextAsString(recipe.text, recipe.replace);
            } else {
              elm.textContent = recipe.text;
            }
          }
          if (recipe.textlocale) {
            if (recipe.replace) {
              elm.textContent = ytcenter.utils.replaceTextAsString(ytcenter.language.getLocale(recipe.textlocale), recipe.replace);
            } else {
              elm.textContent = ytcenter.language.getLocale(recipe.textlocale);
            }
            
            ytcenter.language.addLocaleElement(elm, recipe.textlocale, "@textContent", recipe.replace || {});
          }
          if (recipe.listeners) {
            for (var i = 0; i < recipe.listeners.length; i++) {
              elm.addEventListener(recipe.listeners[i].event, recipe.listeners[i].callback, (recipe.listeners[i].bubble ? recipe.listeners[i].bubble : false));
            }
          }
          if (recipe.style) {
            for (var key in recipe.style) {
              if (recipe.style.hasOwnProperty(key)) {
                elm.style[key] = recipe.style[key];
              }
            }
          }
          break;
        case "link":
          elm = document.createElement("div");
          var title = document.createElement("b");
          if (recipe.titleLocale) {
            var __t1 = document.createTextNode(ytcenter.language.getLocale(recipe.titleLocale)),
                __t2 = document.createTextNode(":");
            ytcenter.language.addLocaleElement(__t1, recipe.titleLocale, "@textContent", recipe.replace || {});
            title.appendChild(__t1);
            title.appendChild(__t2);
          } else if (recipe.title) {
            title.textContent = recipe.title + ":";
          }
          var content = document.createElement("div");
          content.style.marginLeft = "20px";
          
          for (var i = 0; i < recipe.links.length; i++) {
            if (i > 0) content.appendChild(document.createElement("br"));
            var __a = document.createElement("a");
            __a.href = recipe.links[i].url;
            __a.textContent = recipe.links[i].text;
            __a.setAttribute("target", "_blank");
            content.appendChild(__a);
          }
          elm.appendChild(title);
          elm.appendChild(content);
          break;
        case "aboutText":
          elm = document.createElement("div");
          
          var title = document.createElement("h2");
          title.textContent = "YouTube Center v" + ytcenter.version;
          
          var content1 = document.createElement("div");
          content1.textContent = ytcenter.language.getLocale("SETTINGS_ABOUT_COPYRIGHTS");
          ytcenter.language.addLocaleElement(content1, "SETTINGS_ABOUT_COPYRIGHTS", "@textContent", {});
          
          var content2 = document.createElement("div");
          content2.textContent = ytcenter.language.getLocale("SETTINGS_ABOUT_CONTACTSINFO");
          ytcenter.language.addLocaleElement(content2, "SETTINGS_ABOUT_CONTACTSINFO", "@textContent", {});
          
          var contact = document.createElement("div"),
              contactText = document.createTextNode(ytcenter.language.getLocale("SETTINGS_ABOUT_EMAIL")),
              contactTextEnd = document.createTextNode(":"),
              contactLink = document.createElement("a");
          ytcenter.language.addLocaleElement(contactText, "SETTINGS_ABOUT_EMAIL", "@textContent", {});
          
          contactLink.href = "mailto:jepperm@gmail.com";
          contactLink.textContent = "jepperm@gmail.com";
          
          contact.appendChild(contactText);
          contact.appendChild(contactTextEnd);
          contact.appendChild(contactLink);
          
          elm.appendChild(title);
          elm.appendChild(content1);
          elm.appendChild(document.createElement("br"));
          elm.appendChild(content2);
          elm.appendChild(contact);
          break;
        case "translators":
          elm = document.createElement("div");
          var title = document.createElement("b"),
              titleText,
              titleTextEnd = document.createTextNode(":");
          if (recipe.titleLocale) {
            titleText = document.createTextNode(ytcenter.language.getLocale(recipe.titleLocale));
            ytcenter.language.addLocaleElement(titleText, recipe.titleLocale, "@textContent", {});
          } else if (recipe.title) {
            titleText = document.createTextNode(recipe.title);
          } else {
            titleText = document.createTextNode("");
          }
          
          title.appendChild(titleText);
          title.appendChild(titleTextEnd);
          
          var translators = document.createElement("div");
          translators.style.marginLeft = "20px";
          ytcenter.utils.each(recipe.translators, function(key, value){
            if (value.length > 0) {
              var entry = document.createElement("div");
              entry.appendChild(document.createTextNode(ytcenter.language.getLocale("LANGUAGE", key) + " (" + ytcenter.language.getLocale("LANGUAGE_ENGLISH", key) + ") - "));
              for (var i = 0; i < value.length; i++) {
                if (i > 0) entry.appendChild(document.createTextNode(" & "));
                var el;
                if (value[i].url) {
                  el = document.createElement("a");
                  el.href = value[i].url;
                  el.textContent = value[i].name;
                  el.setAttribute("target", "_blank");
                } else {
                  el = document.createTextNode(value[i].name);
                }
                entry.appendChild(el);
              }
              translators.appendChild(entry);
            }
          });
          elm.appendChild(title);
          elm.appendChild(translators);
          break;
        case "import/export settings":
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
          elm = ytcenter.gui.createYouTubeDefaultButton("", [textLabel]);
          
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
              var blob = new uw.ytcenter.io.Blob([VALIDATOR_STRING + settingsPool.value], { "type": "application/octet-stream" });
              uw.ytcenter.io.saveAs(blob, "ytcenter-settings.ytcs");
            } catch (e) {
              con.error(e);
            }
          }, false);
          
          content.appendChild(exportFileButton);
          
          break;
      }
      if (elm) {
        wrapper.appendChild(elm);
      }
      return wrapper;
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
      };
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
      elm.addEventListener("mousedown", function(e){
        range.mouse.down = true;
        e.preventDefault();
      }, false);
      document.addEventListener("mousemove", function(e){
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
      }, false);
      document.addEventListener("mouseup", function(e){
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
          e.preventDefault();
        }
      }, false);
      
      return returnKit;
    }
    
    function $DragList(elements, ignore) {
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
      
      document.addEventListener("mousedown", function(e){
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
      }, false);
      document.addEventListener("mouseup", function(e){
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
      }, false);
      document.addEventListener("mousemove", function(e){
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
    var __rootCall_db = [];
    var __rootCall_index = 0;
    
    if (identifier === 3) { // Firefox Extension
      self.port.on("xhr onreadystatechange", function(data){
        var data = JSON.parse(data);
        __rootCall_db[data.id].onreadystatechange({responseText: data.responseText});
      });
      self.port.on("xhr onload", function(data){
        var data = JSON.parse(data);
        __rootCall_db[data.id].onload({responseText: data.responseText});
      });
      self.port.on("xhr onerror", function(data){
        var data = JSON.parse(data);
        __rootCall_db[data.id].onerror({responseText: data.responseText});
      });
    } else if (identifier === 4) { // Safari Extension
      safari.self.addEventListener("message", function(e){
        var data = JSON.parse(e.message);
        if (e.name === "xhr onreadystatechange") {
          __rootCall_db[data.id].onreadystatechange(data.response);
        } else if (e.name === "xhr onload") {
          __rootCall_db[data.id].onload(data.response);
        } else if (e.name === "xhr onerror") {
          __rootCall_db[data.id].onerror(data.response);
        }
      }, false);
    } else if (identifier === 5) { // Opera Legacy Extnesion
      opera.extension.onmessage = function(e){
        if (e.data.action === "xhr onreadystatechange") {
          __rootCall_db[e.data.id].onreadystatechange(e.data.response);
        } else if (e.data.action === "xhr onload") {
          __rootCall_db[e.data.id].onload(e.data.response);
        } else if (e.data.action === "xhr onerror") {
          __rootCall_db[e.data.id].onerror(e.data.response);
        } else if (e.data.action === "load callback") {
          ytcenter.storage_db[e.data.id](e.data.storage);
        }
      };
    }
    
    function $XMLHTTPRequest(details) {
      if (injected) {
        if (!window.ytcenter || !window.ytcenter.xhr) {
          window.ytcenter = uw.ytcenter || {};
          window.ytcenter.xhr = window.ytcenter.xhr || {};
          window.ytcenter.xhr.onload = ytcenter.utils.bind(function(id, _args){
            var __item;
            for (var i = 0; i < __rootCall_db.length; i++) {
              if (__rootCall_db[i].id === id) {
                __item = __rootCall_db[i];
                break;
              }
            }
            if (__item.onload) {
              __item.onload(_args);
            }
          }, window.ytcenter.xhr);
          window.ytcenter.xhr.onerror = ytcenter.utils.bind(function(id, _args){
            var __item;
            for (var i = 0; i < __rootCall_db.length; i++) {
              if (__rootCall_db[i].id === id) {
                __item = __rootCall_db[i];
                break;
              }
            }
            if (__item.onerror) {
              __item.onerror(_args);
            }
          }, window.ytcenter.xhr);
          window.ytcenter.xhr.onreadystatechange = ytcenter.utils.bind(function(id, _args){
            var __item;
            for (var i = 0; i < __rootCall_db.length; i++) {
              if (__rootCall_db[i].id === id) {
                __item = __rootCall_db[i];
                break;
              }
            }
            if (__item.onreadystatechange) {
              __item.onreadystatechange(_args);
            }
          }, window.ytcenter.xhr);
        }
        __rootCall_index += 1;
        var id = __rootCall_index;
        __rootCall_db.push({
          id: id,
          onload: details.onload,
          onerror: details.onerror,
          onreadystatechange: details.onreadystatechange
        });
        window.postMessage(JSON.stringify({
          id: id,
          method: "CrossOriginXHR",
          arguments: [details]
        }), "*");
      } else {
        if (identifier === 3) { // Firefox Extension
          var id = __rootCall_db.length,
              entry = {};
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
          __rootCall_db.push(entry);
          self.port.emit("xhr", JSON.stringify({
            id: id,
            details: details
          }));
        } else if (identifier === 4) { // Safari Extension
          var id = __rootCall_db.length,
              entry = {};
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
          __rootCall_db.push(entry);
          safari.self.tab.dispatchMessage("xhr", JSON.stringify({
            id: id,
            details: details
          }));
        } else if (identifier === 5) { // Maxthon Extension
          var id = __rootCall_db.length,
              entry = {};
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
          __rootCall_db.push(entry);
          opera.extension.postMessage({
            action: 'xhr',
            id: id,
            details: details
          });
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
        if (document && document.getElementsByTagName("head")[0]) {
          document.getElementsByTagName("head")[0].appendChild(oStyle);
        } else {
          con.error("Failed to add style!");
        }
      }
    }
    /* END UTILS */
    
    /* Classes */
    function PlayerConfig(configSetter, configGetter) {
      this.__defineGetter__("config", function(){
        con.log("[PlayerConfig] Getting config!");
        return configGetter();
      });
      this.__defineSetter__("config", function(value){
        con.log("[PlayerConfig] Setting config!", value);
        configSetter(value);
      });
    }
    function SPF() {
      this.__defineGetter__("enabled", function(){return true;});
      this.__defineSetter__("enabled", function(value){});
    }
    function SPFConfigWrapper(current, config) {
      var i, __self = this;
      current.config = config;
      
      ytcenter.utils.each(config, function(key, value){
        if (key !== "config")
          __self[key] = value;
      });
      
      this._config = config;
      
      this.__defineGetter__("config", function(){return this._config;});
      this.__defineSetter__("config", function(cfg){
        ytcenter.utils.each(cfg, function(key, value){
          config[key] = value;
        });
      });
    }
    function SPFConfig(spf, config) {
      var i, __self = this;
      ytcenter.utils.each(config, function(key, value){
        __self[key] = value;
      });
      for (i = 0; i < spf.length; i++) {
        this.__defineGetter__(spf[i].key, (function(a){return function(){return a.callback;};})(spf[i]));
        this.__defineSetter__(spf[i].key, (function(a){return function(value){return a.update(value);};})(spf[i]));
      }
    }
    
    var console_debug = true; // Disable this to stop YouTube Center from writing in the console log.
    var _console = [];
    
    var uw, loc, con;
    
    uw = (function(){
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
    uw.ytspf = uw.ytspf || new SPF();
    if (uw.ytspf.enabled === false) uw.ytspf.enabled = true;
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
                  return console[key].apply(console, _args)
                } else if (console_debug) {
                  return console[key](_args[0]);
                }
              } catch (e) {
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
              }
            };
          })(key);
        }
      }
    }
    
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
    
    if (!(new RegExp("^(http(s)?://)(((.*\.)?youtube\.com\/.*)|(dl\.dropbox\.com\/u/13162258/YouTube%20Center/(.*))|(userscripts\.org/scripts/source/114002\.meta\.js))$", "")).test(loc.href) || (new RegExp("http(s)?://apiblog\.youtube.com/.*", "")).test(loc.href)) {
      con.log(loc.href + " doesn't match!");
      return;
    }
    con.log("In Scope");
    
    
    con.log("Initializing Functions");
    
    var yt, ytcenter = {};
    ytcenter.inject = function(func){
      try {
        var script = document.createElement("script"),
            p = (document.body || document.head || document.documentElement);
        if (!p) {
          con.error("[Script Inject] document.body, document.head and document.documentElement doesn't exist!");
          return;
        }
        script.setAttribute("type", "text/javascript");
        script.appendChild(document.createTextNode(func));
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
    ytcenter._tmp_embed = {loaded: false, onReady: false};
    ytcenter.feather = false;
    con.log("Initializing icons");
    ytcenter.icon.gear = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAPCAYAAAFM0aXcAAAACXBIWXMAAAsTAAALEwEAmpwYAAAKT2lDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjanVNnVFPpFj333vRCS4iAlEtvUhUIIFJCi4AUkSYqIQkQSoghodkVUcERRUUEG8igiAOOjoCMFVEsDIoK2AfkIaKOg6OIisr74Xuja9a89+bN/rXXPues852zzwfACAyWSDNRNYAMqUIeEeCDx8TG4eQuQIEKJHAAEAizZCFz/SMBAPh+PDwrIsAHvgABeNMLCADATZvAMByH/w/qQplcAYCEAcB0kThLCIAUAEB6jkKmAEBGAYCdmCZTAKAEAGDLY2LjAFAtAGAnf+bTAICd+Jl7AQBblCEVAaCRACATZYhEAGg7AKzPVopFAFgwABRmS8Q5ANgtADBJV2ZIALC3AMDOEAuyAAgMADBRiIUpAAR7AGDIIyN4AISZABRG8lc88SuuEOcqAAB4mbI8uSQ5RYFbCC1xB1dXLh4ozkkXKxQ2YQJhmkAuwnmZGTKBNA/g88wAAKCRFRHgg/P9eM4Ors7ONo62Dl8t6r8G/yJiYuP+5c+rcEAAAOF0ftH+LC+zGoA7BoBt/qIl7gRoXgugdfeLZrIPQLUAoOnaV/Nw+H48PEWhkLnZ2eXk5NhKxEJbYcpXff5nwl/AV/1s+X48/Pf14L7iJIEyXYFHBPjgwsz0TKUcz5IJhGLc5o9H/LcL//wd0yLESWK5WCoU41EScY5EmozzMqUiiUKSKcUl0v9k4t8s+wM+3zUAsGo+AXuRLahdYwP2SycQWHTA4vcAAPK7b8HUKAgDgGiD4c93/+8//UegJQCAZkmScQAAXkQkLlTKsz/HCAAARKCBKrBBG/TBGCzABhzBBdzBC/xgNoRCJMTCQhBCCmSAHHJgKayCQiiGzbAdKmAv1EAdNMBRaIaTcA4uwlW4Dj1wD/phCJ7BKLyBCQRByAgTYSHaiAFiilgjjggXmYX4IcFIBBKLJCDJiBRRIkuRNUgxUopUIFVIHfI9cgI5h1xGupE7yAAygvyGvEcxlIGyUT3UDLVDuag3GoRGogvQZHQxmo8WoJvQcrQaPYw2oefQq2gP2o8+Q8cwwOgYBzPEbDAuxsNCsTgsCZNjy7EirAyrxhqwVqwDu4n1Y8+xdwQSgUXACTYEd0IgYR5BSFhMWE7YSKggHCQ0EdoJNwkDhFHCJyKTqEu0JroR+cQYYjIxh1hILCPWEo8TLxB7iEPENyQSiUMyJ7mQAkmxpFTSEtJG0m5SI+ksqZs0SBojk8naZGuyBzmULCAryIXkneTD5DPkG+Qh8lsKnWJAcaT4U+IoUspqShnlEOU05QZlmDJBVaOaUt2ooVQRNY9aQq2htlKvUYeoEzR1mjnNgxZJS6WtopXTGmgXaPdpr+h0uhHdlR5Ol9BX0svpR+iX6AP0dwwNhhWDx4hnKBmbGAcYZxl3GK+YTKYZ04sZx1QwNzHrmOeZD5lvVVgqtip8FZHKCpVKlSaVGyovVKmqpqreqgtV81XLVI+pXlN9rkZVM1PjqQnUlqtVqp1Q61MbU2epO6iHqmeob1Q/pH5Z/YkGWcNMw09DpFGgsV/jvMYgC2MZs3gsIWsNq4Z1gTXEJrHN2Xx2KruY/R27iz2qqaE5QzNKM1ezUvOUZj8H45hx+Jx0TgnnKKeX836K3hTvKeIpG6Y0TLkxZVxrqpaXllirSKtRq0frvTau7aedpr1Fu1n7gQ5Bx0onXCdHZ4/OBZ3nU9lT3acKpxZNPTr1ri6qa6UbobtEd79up+6Ynr5egJ5Mb6feeb3n+hx9L/1U/W36p/VHDFgGswwkBtsMzhg8xTVxbzwdL8fb8VFDXcNAQ6VhlWGX4YSRudE8o9VGjUYPjGnGXOMk423GbcajJgYmISZLTepN7ppSTbmmKaY7TDtMx83MzaLN1pk1mz0x1zLnm+eb15vft2BaeFostqi2uGVJsuRaplnutrxuhVo5WaVYVVpds0atna0l1rutu6cRp7lOk06rntZnw7Dxtsm2qbcZsOXYBtuutm22fWFnYhdnt8Wuw+6TvZN9un2N/T0HDYfZDqsdWh1+c7RyFDpWOt6azpzuP33F9JbpL2dYzxDP2DPjthPLKcRpnVOb00dnF2e5c4PziIuJS4LLLpc+Lpsbxt3IveRKdPVxXeF60vWdm7Obwu2o26/uNu5p7ofcn8w0nymeWTNz0MPIQ+BR5dE/C5+VMGvfrH5PQ0+BZ7XnIy9jL5FXrdewt6V3qvdh7xc+9j5yn+M+4zw33jLeWV/MN8C3yLfLT8Nvnl+F30N/I/9k/3r/0QCngCUBZwOJgUGBWwL7+Hp8Ib+OPzrbZfay2e1BjKC5QRVBj4KtguXBrSFoyOyQrSH355jOkc5pDoVQfujW0Adh5mGLw34MJ4WHhVeGP45wiFga0TGXNXfR3ENz30T6RJZE3ptnMU85ry1KNSo+qi5qPNo3ujS6P8YuZlnM1VidWElsSxw5LiquNm5svt/87fOH4p3iC+N7F5gvyF1weaHOwvSFpxapLhIsOpZATIhOOJTwQRAqqBaMJfITdyWOCnnCHcJnIi/RNtGI2ENcKh5O8kgqTXqS7JG8NXkkxTOlLOW5hCepkLxMDUzdmzqeFpp2IG0yPTq9MYOSkZBxQqohTZO2Z+pn5mZ2y6xlhbL+xW6Lty8elQfJa7OQrAVZLQq2QqboVFoo1yoHsmdlV2a/zYnKOZarnivN7cyzytuQN5zvn//tEsIS4ZK2pYZLVy0dWOa9rGo5sjxxedsK4xUFK4ZWBqw8uIq2Km3VT6vtV5eufr0mek1rgV7ByoLBtQFr6wtVCuWFfevc1+1dT1gvWd+1YfqGnRs+FYmKrhTbF5cVf9go3HjlG4dvyr+Z3JS0qavEuWTPZtJm6ebeLZ5bDpaql+aXDm4N2dq0Dd9WtO319kXbL5fNKNu7g7ZDuaO/PLi8ZafJzs07P1SkVPRU+lQ27tLdtWHX+G7R7ht7vPY07NXbW7z3/T7JvttVAVVN1WbVZftJ+7P3P66Jqun4lvttXa1ObXHtxwPSA/0HIw6217nU1R3SPVRSj9Yr60cOxx++/p3vdy0NNg1VjZzG4iNwRHnk6fcJ3/ceDTradox7rOEH0x92HWcdL2pCmvKaRptTmvtbYlu6T8w+0dbq3nr8R9sfD5w0PFl5SvNUyWna6YLTk2fyz4ydlZ19fi753GDborZ752PO32oPb++6EHTh0kX/i+c7vDvOXPK4dPKy2+UTV7hXmq86X23qdOo8/pPTT8e7nLuarrlca7nuer21e2b36RueN87d9L158Rb/1tWeOT3dvfN6b/fF9/XfFt1+cif9zsu72Xcn7q28T7xf9EDtQdlD3YfVP1v+3Njv3H9qwHeg89HcR/cGhYPP/pH1jw9DBY+Zj8uGDYbrnjg+OTniP3L96fynQ89kzyaeF/6i/suuFxYvfvjV69fO0ZjRoZfyl5O/bXyl/erA6xmv28bCxh6+yXgzMV70VvvtwXfcdx3vo98PT+R8IH8o/2j5sfVT0Kf7kxmTk/8EA5jz/GMzLdsAAAAgY0hSTQAAeiUAAICDAAD5/wAAgOkAAHUwAADqYAAAOpgAABdvkl/FRgAAAkFJREFUeNpi+v//P8OqVatcmVavXt3JwMDwGAAAAP//Yvr//z/D////GZhWr179f/Xq1RMBAAAA//9igqr5D8WKTAwQ0MPAwPCEgYGhBwAAAP//TMtBEUBQAAXA9ZsII8IrIIQOBHF5EdwU42TGffcT+/8e2No+MLAmmaDtMnC3PTEnuV4AAAD//zTOQRGCUAAG4YWrCbxSwQzYYDt452AGHCKQ4H9gAYNwcsabMeDyKLD7nY01SZfkn2ROMiV5n80euABf9VoFA3ArpYyt+gEe9bEDW6Uu6rMFUH8VcgdeaqMOAAcZZIiDMBQE0cdv0jQhQREMGDRB9B5Ihssguc2OhHsg4ACoKhQgSIPAbDGsG7GZee/HHhFVRByHPPRPbJ+BGbCxPU5HdQHewBrosvMFXCX1BTgAVQ4ZAXdgZftWgB3/9wRcJC3T8jaRpulgX2zXwAKY51cDXICmSOqTrQNOwEdSK+nxZZJ8VSIKoyD+24uw3CAIYhAEBZNdbK6r0ShM9AH2abRpNwhnwEfQVaPYDQZBk4KIZTX4p8wut33nMMw3Z2a6d/aqqp93W1WvSfm4gxlUVTvzIfYOgF/gy/ZzrF6KjJHtx+i9Bu5st9MeIOkGWAO+o38VuAJOgTdgPUQXwCYwB9DYHof1CegHdChpT9JI0gpwm/0BMAE+bY8bSUNgPil9BHRm+9L2ie0XYDv7+5jXkzScNv4HOAcWMr8Du6nccn5+SB//4tHs5gmwBeyEdRE46hDtS9pIhk084n8AVJscCePQvIsAAAAASUVORK5CYII=";
    ytcenter.icon.lightbulb = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAPCAYAAAA71pVKAAAACXBIWXMAAAsTAAALEwEAmpwYAAAKT2lDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjanVNnVFPpFj333vRCS4iAlEtvUhUIIFJCi4AUkSYqIQkQSoghodkVUcERRUUEG8igiAOOjoCMFVEsDIoK2AfkIaKOg6OIisr74Xuja9a89+bN/rXXPues852zzwfACAyWSDNRNYAMqUIeEeCDx8TG4eQuQIEKJHAAEAizZCFz/SMBAPh+PDwrIsAHvgABeNMLCADATZvAMByH/w/qQplcAYCEAcB0kThLCIAUAEB6jkKmAEBGAYCdmCZTAKAEAGDLY2LjAFAtAGAnf+bTAICd+Jl7AQBblCEVAaCRACATZYhEAGg7AKzPVopFAFgwABRmS8Q5ANgtADBJV2ZIALC3AMDOEAuyAAgMADBRiIUpAAR7AGDIIyN4AISZABRG8lc88SuuEOcqAAB4mbI8uSQ5RYFbCC1xB1dXLh4ozkkXKxQ2YQJhmkAuwnmZGTKBNA/g88wAAKCRFRHgg/P9eM4Ors7ONo62Dl8t6r8G/yJiYuP+5c+rcEAAAOF0ftH+LC+zGoA7BoBt/qIl7gRoXgugdfeLZrIPQLUAoOnaV/Nw+H48PEWhkLnZ2eXk5NhKxEJbYcpXff5nwl/AV/1s+X48/Pf14L7iJIEyXYFHBPjgwsz0TKUcz5IJhGLc5o9H/LcL//wd0yLESWK5WCoU41EScY5EmozzMqUiiUKSKcUl0v9k4t8s+wM+3zUAsGo+AXuRLahdYwP2SycQWHTA4vcAAPK7b8HUKAgDgGiD4c93/+8//UegJQCAZkmScQAAXkQkLlTKsz/HCAAARKCBKrBBG/TBGCzABhzBBdzBC/xgNoRCJMTCQhBCCmSAHHJgKayCQiiGzbAdKmAv1EAdNMBRaIaTcA4uwlW4Dj1wD/phCJ7BKLyBCQRByAgTYSHaiAFiilgjjggXmYX4IcFIBBKLJCDJiBRRIkuRNUgxUopUIFVIHfI9cgI5h1xGupE7yAAygvyGvEcxlIGyUT3UDLVDuag3GoRGogvQZHQxmo8WoJvQcrQaPYw2oefQq2gP2o8+Q8cwwOgYBzPEbDAuxsNCsTgsCZNjy7EirAyrxhqwVqwDu4n1Y8+xdwQSgUXACTYEd0IgYR5BSFhMWE7YSKggHCQ0EdoJNwkDhFHCJyKTqEu0JroR+cQYYjIxh1hILCPWEo8TLxB7iEPENyQSiUMyJ7mQAkmxpFTSEtJG0m5SI+ksqZs0SBojk8naZGuyBzmULCAryIXkneTD5DPkG+Qh8lsKnWJAcaT4U+IoUspqShnlEOU05QZlmDJBVaOaUt2ooVQRNY9aQq2htlKvUYeoEzR1mjnNgxZJS6WtopXTGmgXaPdpr+h0uhHdlR5Ol9BX0svpR+iX6AP0dwwNhhWDx4hnKBmbGAcYZxl3GK+YTKYZ04sZx1QwNzHrmOeZD5lvVVgqtip8FZHKCpVKlSaVGyovVKmqpqreqgtV81XLVI+pXlN9rkZVM1PjqQnUlqtVqp1Q61MbU2epO6iHqmeob1Q/pH5Z/YkGWcNMw09DpFGgsV/jvMYgC2MZs3gsIWsNq4Z1gTXEJrHN2Xx2KruY/R27iz2qqaE5QzNKM1ezUvOUZj8H45hx+Jx0TgnnKKeX836K3hTvKeIpG6Y0TLkxZVxrqpaXllirSKtRq0frvTau7aedpr1Fu1n7gQ5Bx0onXCdHZ4/OBZ3nU9lT3acKpxZNPTr1ri6qa6UbobtEd79up+6Ynr5egJ5Mb6feeb3n+hx9L/1U/W36p/VHDFgGswwkBtsMzhg8xTVxbzwdL8fb8VFDXcNAQ6VhlWGX4YSRudE8o9VGjUYPjGnGXOMk423GbcajJgYmISZLTepN7ppSTbmmKaY7TDtMx83MzaLN1pk1mz0x1zLnm+eb15vft2BaeFostqi2uGVJsuRaplnutrxuhVo5WaVYVVpds0atna0l1rutu6cRp7lOk06rntZnw7Dxtsm2qbcZsOXYBtuutm22fWFnYhdnt8Wuw+6TvZN9un2N/T0HDYfZDqsdWh1+c7RyFDpWOt6azpzuP33F9JbpL2dYzxDP2DPjthPLKcRpnVOb00dnF2e5c4PziIuJS4LLLpc+Lpsbxt3IveRKdPVxXeF60vWdm7Obwu2o26/uNu5p7ofcn8w0nymeWTNz0MPIQ+BR5dE/C5+VMGvfrH5PQ0+BZ7XnIy9jL5FXrdewt6V3qvdh7xc+9j5yn+M+4zw33jLeWV/MN8C3yLfLT8Nvnl+F30N/I/9k/3r/0QCngCUBZwOJgUGBWwL7+Hp8Ib+OPzrbZfay2e1BjKC5QRVBj4KtguXBrSFoyOyQrSH355jOkc5pDoVQfujW0Adh5mGLw34MJ4WHhVeGP45wiFga0TGXNXfR3ENz30T6RJZE3ptnMU85ry1KNSo+qi5qPNo3ujS6P8YuZlnM1VidWElsSxw5LiquNm5svt/87fOH4p3iC+N7F5gvyF1weaHOwvSFpxapLhIsOpZATIhOOJTwQRAqqBaMJfITdyWOCnnCHcJnIi/RNtGI2ENcKh5O8kgqTXqS7JG8NXkkxTOlLOW5hCepkLxMDUzdmzqeFpp2IG0yPTq9MYOSkZBxQqohTZO2Z+pn5mZ2y6xlhbL+xW6Lty8elQfJa7OQrAVZLQq2QqboVFoo1yoHsmdlV2a/zYnKOZarnivN7cyzytuQN5zvn//tEsIS4ZK2pYZLVy0dWOa9rGo5sjxxedsK4xUFK4ZWBqw8uIq2Km3VT6vtV5eufr0mek1rgV7ByoLBtQFr6wtVCuWFfevc1+1dT1gvWd+1YfqGnRs+FYmKrhTbF5cVf9go3HjlG4dvyr+Z3JS0qavEuWTPZtJm6ebeLZ5bDpaql+aXDm4N2dq0Dd9WtO319kXbL5fNKNu7g7ZDuaO/PLi8ZafJzs07P1SkVPRU+lQ27tLdtWHX+G7R7ht7vPY07NXbW7z3/T7JvttVAVVN1WbVZftJ+7P3P66Jqun4lvttXa1ObXHtxwPSA/0HIw6217nU1R3SPVRSj9Yr60cOxx++/p3vdy0NNg1VjZzG4iNwRHnk6fcJ3/ceDTradox7rOEH0x92HWcdL2pCmvKaRptTmvtbYlu6T8w+0dbq3nr8R9sfD5w0PFl5SvNUyWna6YLTk2fyz4ydlZ19fi753GDborZ752PO32oPb++6EHTh0kX/i+c7vDvOXPK4dPKy2+UTV7hXmq86X23qdOo8/pPTT8e7nLuarrlca7nuer21e2b36RueN87d9L158Rb/1tWeOT3dvfN6b/fF9/XfFt1+cif9zsu72Xcn7q28T7xf9EDtQdlD3YfVP1v+3Njv3H9qwHeg89HcR/cGhYPP/pH1jw9DBY+Zj8uGDYbrnjg+OTniP3L96fynQ89kzyaeF/6i/suuFxYvfvjV69fO0ZjRoZfyl5O/bXyl/erA6xmv28bCxh6+yXgzMV70VvvtwXfcdx3vo98PT+R8IH8o/2j5sfVT0Kf7kxmTk/8EA5jz/GMzLdsAAAAgY0hSTQAAeiUAAICDAAD5/wAAgOkAAHUwAADqYAAAOpgAABdvkl/FRgAAANRJREFUeNqU0rFKBDEUheFvdSpRVmx8EF9EJJXWlj6KCoKCouD2F3wMm+220E6xs1YEZXVsgsTRzLCnSe495+cmJKO2bZVKKTU4wD428YxLnETEvMw2/mqC3aLewCG2sFcGR+XklNI2btS1ExE//lLX1K9ffhceD8DjPng6AE/74AleKuArrqtwRDzhvAJfZL86Ga7w1em1+a31whFxj1mnPYuIu0E46zav805t6IfBMdby8ZdxtAj8jlV8ZvhjEbjBOt6wUsvV7vyI07w/w8N/oe8BAO3xNxGbpir1AAAAAElFTkSuQmCC";
    ytcenter.icon.smallThumbsUpWhite = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAALCAYAAACprHcmAAAACXBIWXMAAAsTAAALEwEAmpwYAAAKT2lDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjanVNnVFPpFj333vRCS4iAlEtvUhUIIFJCi4AUkSYqIQkQSoghodkVUcERRUUEG8igiAOOjoCMFVEsDIoK2AfkIaKOg6OIisr74Xuja9a89+bN/rXXPues852zzwfACAyWSDNRNYAMqUIeEeCDx8TG4eQuQIEKJHAAEAizZCFz/SMBAPh+PDwrIsAHvgABeNMLCADATZvAMByH/w/qQplcAYCEAcB0kThLCIAUAEB6jkKmAEBGAYCdmCZTAKAEAGDLY2LjAFAtAGAnf+bTAICd+Jl7AQBblCEVAaCRACATZYhEAGg7AKzPVopFAFgwABRmS8Q5ANgtADBJV2ZIALC3AMDOEAuyAAgMADBRiIUpAAR7AGDIIyN4AISZABRG8lc88SuuEOcqAAB4mbI8uSQ5RYFbCC1xB1dXLh4ozkkXKxQ2YQJhmkAuwnmZGTKBNA/g88wAAKCRFRHgg/P9eM4Ors7ONo62Dl8t6r8G/yJiYuP+5c+rcEAAAOF0ftH+LC+zGoA7BoBt/qIl7gRoXgugdfeLZrIPQLUAoOnaV/Nw+H48PEWhkLnZ2eXk5NhKxEJbYcpXff5nwl/AV/1s+X48/Pf14L7iJIEyXYFHBPjgwsz0TKUcz5IJhGLc5o9H/LcL//wd0yLESWK5WCoU41EScY5EmozzMqUiiUKSKcUl0v9k4t8s+wM+3zUAsGo+AXuRLahdYwP2SycQWHTA4vcAAPK7b8HUKAgDgGiD4c93/+8//UegJQCAZkmScQAAXkQkLlTKsz/HCAAARKCBKrBBG/TBGCzABhzBBdzBC/xgNoRCJMTCQhBCCmSAHHJgKayCQiiGzbAdKmAv1EAdNMBRaIaTcA4uwlW4Dj1wD/phCJ7BKLyBCQRByAgTYSHaiAFiilgjjggXmYX4IcFIBBKLJCDJiBRRIkuRNUgxUopUIFVIHfI9cgI5h1xGupE7yAAygvyGvEcxlIGyUT3UDLVDuag3GoRGogvQZHQxmo8WoJvQcrQaPYw2oefQq2gP2o8+Q8cwwOgYBzPEbDAuxsNCsTgsCZNjy7EirAyrxhqwVqwDu4n1Y8+xdwQSgUXACTYEd0IgYR5BSFhMWE7YSKggHCQ0EdoJNwkDhFHCJyKTqEu0JroR+cQYYjIxh1hILCPWEo8TLxB7iEPENyQSiUMyJ7mQAkmxpFTSEtJG0m5SI+ksqZs0SBojk8naZGuyBzmULCAryIXkneTD5DPkG+Qh8lsKnWJAcaT4U+IoUspqShnlEOU05QZlmDJBVaOaUt2ooVQRNY9aQq2htlKvUYeoEzR1mjnNgxZJS6WtopXTGmgXaPdpr+h0uhHdlR5Ol9BX0svpR+iX6AP0dwwNhhWDx4hnKBmbGAcYZxl3GK+YTKYZ04sZx1QwNzHrmOeZD5lvVVgqtip8FZHKCpVKlSaVGyovVKmqpqreqgtV81XLVI+pXlN9rkZVM1PjqQnUlqtVqp1Q61MbU2epO6iHqmeob1Q/pH5Z/YkGWcNMw09DpFGgsV/jvMYgC2MZs3gsIWsNq4Z1gTXEJrHN2Xx2KruY/R27iz2qqaE5QzNKM1ezUvOUZj8H45hx+Jx0TgnnKKeX836K3hTvKeIpG6Y0TLkxZVxrqpaXllirSKtRq0frvTau7aedpr1Fu1n7gQ5Bx0onXCdHZ4/OBZ3nU9lT3acKpxZNPTr1ri6qa6UbobtEd79up+6Ynr5egJ5Mb6feeb3n+hx9L/1U/W36p/VHDFgGswwkBtsMzhg8xTVxbzwdL8fb8VFDXcNAQ6VhlWGX4YSRudE8o9VGjUYPjGnGXOMk423GbcajJgYmISZLTepN7ppSTbmmKaY7TDtMx83MzaLN1pk1mz0x1zLnm+eb15vft2BaeFostqi2uGVJsuRaplnutrxuhVo5WaVYVVpds0atna0l1rutu6cRp7lOk06rntZnw7Dxtsm2qbcZsOXYBtuutm22fWFnYhdnt8Wuw+6TvZN9un2N/T0HDYfZDqsdWh1+c7RyFDpWOt6azpzuP33F9JbpL2dYzxDP2DPjthPLKcRpnVOb00dnF2e5c4PziIuJS4LLLpc+Lpsbxt3IveRKdPVxXeF60vWdm7Obwu2o26/uNu5p7ofcn8w0nymeWTNz0MPIQ+BR5dE/C5+VMGvfrH5PQ0+BZ7XnIy9jL5FXrdewt6V3qvdh7xc+9j5yn+M+4zw33jLeWV/MN8C3yLfLT8Nvnl+F30N/I/9k/3r/0QCngCUBZwOJgUGBWwL7+Hp8Ib+OPzrbZfay2e1BjKC5QRVBj4KtguXBrSFoyOyQrSH355jOkc5pDoVQfujW0Adh5mGLw34MJ4WHhVeGP45wiFga0TGXNXfR3ENz30T6RJZE3ptnMU85ry1KNSo+qi5qPNo3ujS6P8YuZlnM1VidWElsSxw5LiquNm5svt/87fOH4p3iC+N7F5gvyF1weaHOwvSFpxapLhIsOpZATIhOOJTwQRAqqBaMJfITdyWOCnnCHcJnIi/RNtGI2ENcKh5O8kgqTXqS7JG8NXkkxTOlLOW5hCepkLxMDUzdmzqeFpp2IG0yPTq9MYOSkZBxQqohTZO2Z+pn5mZ2y6xlhbL+xW6Lty8elQfJa7OQrAVZLQq2QqboVFoo1yoHsmdlV2a/zYnKOZarnivN7cyzytuQN5zvn//tEsIS4ZK2pYZLVy0dWOa9rGo5sjxxedsK4xUFK4ZWBqw8uIq2Km3VT6vtV5eufr0mek1rgV7ByoLBtQFr6wtVCuWFfevc1+1dT1gvWd+1YfqGnRs+FYmKrhTbF5cVf9go3HjlG4dvyr+Z3JS0qavEuWTPZtJm6ebeLZ5bDpaql+aXDm4N2dq0Dd9WtO319kXbL5fNKNu7g7ZDuaO/PLi8ZafJzs07P1SkVPRU+lQ27tLdtWHX+G7R7ht7vPY07NXbW7z3/T7JvttVAVVN1WbVZftJ+7P3P66Jqun4lvttXa1ObXHtxwPSA/0HIw6217nU1R3SPVRSj9Yr60cOxx++/p3vdy0NNg1VjZzG4iNwRHnk6fcJ3/ceDTradox7rOEH0x92HWcdL2pCmvKaRptTmvtbYlu6T8w+0dbq3nr8R9sfD5w0PFl5SvNUyWna6YLTk2fyz4ydlZ19fi753GDborZ752PO32oPb++6EHTh0kX/i+c7vDvOXPK4dPKy2+UTV7hXmq86X23qdOo8/pPTT8e7nLuarrlca7nuer21e2b36RueN87d9L158Rb/1tWeOT3dvfN6b/fF9/XfFt1+cif9zsu72Xcn7q28T7xf9EDtQdlD3YfVP1v+3Njv3H9qwHeg89HcR/cGhYPP/pH1jw9DBY+Zj8uGDYbrnjg+OTniP3L96fynQ89kzyaeF/6i/suuFxYvfvjV69fO0ZjRoZfyl5O/bXyl/erA6xmv28bCxh6+yXgzMV70VvvtwXfcdx3vo98PT+R8IH8o/2j5sfVT0Kf7kxmTk/8EA5jz/GMzLdsAAAAgY0hSTQAAeiUAAICDAAD5/wAAgOkAAHUwAADqYAAAOpgAABdvkl/FRgAAAI9JREFUeNqU0CGKAgEYhuHPYQ6gZY/hOSx6A9kL2BU8g2ewGCw2k8ET7EbBus0gGEUMj8FZGJFhZx/4y8+bvg7SoEiyS3JNMkySoOmmnn5+f03hGLcqPjTFH9h49VmPF1higLN3F3xhFNyxxcwfiiRl2jkVaW/9n3hVJNm3CI9JvoMSPXTRx6Sar77MHHkMAHka79HuaqejAAAAAElFTkSuQmCC";
    ytcenter.icon.smallThumbsDownWhite = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAALCAYAAACprHcmAAAACXBIWXMAAAsTAAALEwEAmpwYAAAKT2lDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjanVNnVFPpFj333vRCS4iAlEtvUhUIIFJCi4AUkSYqIQkQSoghodkVUcERRUUEG8igiAOOjoCMFVEsDIoK2AfkIaKOg6OIisr74Xuja9a89+bN/rXXPues852zzwfACAyWSDNRNYAMqUIeEeCDx8TG4eQuQIEKJHAAEAizZCFz/SMBAPh+PDwrIsAHvgABeNMLCADATZvAMByH/w/qQplcAYCEAcB0kThLCIAUAEB6jkKmAEBGAYCdmCZTAKAEAGDLY2LjAFAtAGAnf+bTAICd+Jl7AQBblCEVAaCRACATZYhEAGg7AKzPVopFAFgwABRmS8Q5ANgtADBJV2ZIALC3AMDOEAuyAAgMADBRiIUpAAR7AGDIIyN4AISZABRG8lc88SuuEOcqAAB4mbI8uSQ5RYFbCC1xB1dXLh4ozkkXKxQ2YQJhmkAuwnmZGTKBNA/g88wAAKCRFRHgg/P9eM4Ors7ONo62Dl8t6r8G/yJiYuP+5c+rcEAAAOF0ftH+LC+zGoA7BoBt/qIl7gRoXgugdfeLZrIPQLUAoOnaV/Nw+H48PEWhkLnZ2eXk5NhKxEJbYcpXff5nwl/AV/1s+X48/Pf14L7iJIEyXYFHBPjgwsz0TKUcz5IJhGLc5o9H/LcL//wd0yLESWK5WCoU41EScY5EmozzMqUiiUKSKcUl0v9k4t8s+wM+3zUAsGo+AXuRLahdYwP2SycQWHTA4vcAAPK7b8HUKAgDgGiD4c93/+8//UegJQCAZkmScQAAXkQkLlTKsz/HCAAARKCBKrBBG/TBGCzABhzBBdzBC/xgNoRCJMTCQhBCCmSAHHJgKayCQiiGzbAdKmAv1EAdNMBRaIaTcA4uwlW4Dj1wD/phCJ7BKLyBCQRByAgTYSHaiAFiilgjjggXmYX4IcFIBBKLJCDJiBRRIkuRNUgxUopUIFVIHfI9cgI5h1xGupE7yAAygvyGvEcxlIGyUT3UDLVDuag3GoRGogvQZHQxmo8WoJvQcrQaPYw2oefQq2gP2o8+Q8cwwOgYBzPEbDAuxsNCsTgsCZNjy7EirAyrxhqwVqwDu4n1Y8+xdwQSgUXACTYEd0IgYR5BSFhMWE7YSKggHCQ0EdoJNwkDhFHCJyKTqEu0JroR+cQYYjIxh1hILCPWEo8TLxB7iEPENyQSiUMyJ7mQAkmxpFTSEtJG0m5SI+ksqZs0SBojk8naZGuyBzmULCAryIXkneTD5DPkG+Qh8lsKnWJAcaT4U+IoUspqShnlEOU05QZlmDJBVaOaUt2ooVQRNY9aQq2htlKvUYeoEzR1mjnNgxZJS6WtopXTGmgXaPdpr+h0uhHdlR5Ol9BX0svpR+iX6AP0dwwNhhWDx4hnKBmbGAcYZxl3GK+YTKYZ04sZx1QwNzHrmOeZD5lvVVgqtip8FZHKCpVKlSaVGyovVKmqpqreqgtV81XLVI+pXlN9rkZVM1PjqQnUlqtVqp1Q61MbU2epO6iHqmeob1Q/pH5Z/YkGWcNMw09DpFGgsV/jvMYgC2MZs3gsIWsNq4Z1gTXEJrHN2Xx2KruY/R27iz2qqaE5QzNKM1ezUvOUZj8H45hx+Jx0TgnnKKeX836K3hTvKeIpG6Y0TLkxZVxrqpaXllirSKtRq0frvTau7aedpr1Fu1n7gQ5Bx0onXCdHZ4/OBZ3nU9lT3acKpxZNPTr1ri6qa6UbobtEd79up+6Ynr5egJ5Mb6feeb3n+hx9L/1U/W36p/VHDFgGswwkBtsMzhg8xTVxbzwdL8fb8VFDXcNAQ6VhlWGX4YSRudE8o9VGjUYPjGnGXOMk423GbcajJgYmISZLTepN7ppSTbmmKaY7TDtMx83MzaLN1pk1mz0x1zLnm+eb15vft2BaeFostqi2uGVJsuRaplnutrxuhVo5WaVYVVpds0atna0l1rutu6cRp7lOk06rntZnw7Dxtsm2qbcZsOXYBtuutm22fWFnYhdnt8Wuw+6TvZN9un2N/T0HDYfZDqsdWh1+c7RyFDpWOt6azpzuP33F9JbpL2dYzxDP2DPjthPLKcRpnVOb00dnF2e5c4PziIuJS4LLLpc+Lpsbxt3IveRKdPVxXeF60vWdm7Obwu2o26/uNu5p7ofcn8w0nymeWTNz0MPIQ+BR5dE/C5+VMGvfrH5PQ0+BZ7XnIy9jL5FXrdewt6V3qvdh7xc+9j5yn+M+4zw33jLeWV/MN8C3yLfLT8Nvnl+F30N/I/9k/3r/0QCngCUBZwOJgUGBWwL7+Hp8Ib+OPzrbZfay2e1BjKC5QRVBj4KtguXBrSFoyOyQrSH355jOkc5pDoVQfujW0Adh5mGLw34MJ4WHhVeGP45wiFga0TGXNXfR3ENz30T6RJZE3ptnMU85ry1KNSo+qi5qPNo3ujS6P8YuZlnM1VidWElsSxw5LiquNm5svt/87fOH4p3iC+N7F5gvyF1weaHOwvSFpxapLhIsOpZATIhOOJTwQRAqqBaMJfITdyWOCnnCHcJnIi/RNtGI2ENcKh5O8kgqTXqS7JG8NXkkxTOlLOW5hCepkLxMDUzdmzqeFpp2IG0yPTq9MYOSkZBxQqohTZO2Z+pn5mZ2y6xlhbL+xW6Lty8elQfJa7OQrAVZLQq2QqboVFoo1yoHsmdlV2a/zYnKOZarnivN7cyzytuQN5zvn//tEsIS4ZK2pYZLVy0dWOa9rGo5sjxxedsK4xUFK4ZWBqw8uIq2Km3VT6vtV5eufr0mek1rgV7ByoLBtQFr6wtVCuWFfevc1+1dT1gvWd+1YfqGnRs+FYmKrhTbF5cVf9go3HjlG4dvyr+Z3JS0qavEuWTPZtJm6ebeLZ5bDpaql+aXDm4N2dq0Dd9WtO319kXbL5fNKNu7g7ZDuaO/PLi8ZafJzs07P1SkVPRU+lQ27tLdtWHX+G7R7ht7vPY07NXbW7z3/T7JvttVAVVN1WbVZftJ+7P3P66Jqun4lvttXa1ObXHtxwPSA/0HIw6217nU1R3SPVRSj9Yr60cOxx++/p3vdy0NNg1VjZzG4iNwRHnk6fcJ3/ceDTradox7rOEH0x92HWcdL2pCmvKaRptTmvtbYlu6T8w+0dbq3nr8R9sfD5w0PFl5SvNUyWna6YLTk2fyz4ydlZ19fi753GDborZ752PO32oPb++6EHTh0kX/i+c7vDvOXPK4dPKy2+UTV7hXmq86X23qdOo8/pPTT8e7nLuarrlca7nuer21e2b36RueN87d9L158Rb/1tWeOT3dvfN6b/fF9/XfFt1+cif9zsu72Xcn7q28T7xf9EDtQdlD3YfVP1v+3Njv3H9qwHeg89HcR/cGhYPP/pH1jw9DBY+Zj8uGDYbrnjg+OTniP3L96fynQ89kzyaeF/6i/suuFxYvfvjV69fO0ZjRoZfyl5O/bXyl/erA6xmv28bCxh6+yXgzMV70VvvtwXfcdx3vo98PT+R8IH8o/2j5sfVT0Kf7kxmTk/8EA5jz/GMzLdsAAAAgY0hSTQAAeiUAAICDAAD5/wAAgOkAAHUwAADqYAAAOpgAABdvkl/FRgAAAJdJREFUeNqU0TEOQVEQQNHrRfM7GrEElUarUmi1CmIDehG7sI9fWYdEI+pfI9FKxNU88SQv8t12TjMzqKgbP13UUl2qfbWlttVmQwU4AT3yrYEhUARg8AOmjQIwo2YBmP6DuzXtIwATYA/cMuAKHIAzsCWeDnXhd6XaSeak+BjRXZ2nKIeriFc5qPJ+CsAOKIAx8Mxt+BoAwoajXC/DwUQAAAAASUVORK5CYII=";
    ytcenter.refreshHomepage = function() {
      // Doing nothing for the moment!
    };
    ytcenter.css = {
      general: "@styles-general@",
      normal: "@styles-normal@",
      topbar: "@styles-topbar@",
      flags: "@styles-flags@",
      html5player: "@styles-html5player@",
      gridSubscriptions: "@styles-grid-subscriptions@",
      images: "@styles-images@"
    };
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
      __r.isVideoWatched = function(id){
        var i;
        for (i = 0; i < ytcenter.settings.watchedVideos.length; i++) {
          if (ytcenter.settings.watchedVideos[i] === id) {
            return true;
          }
        }
        return false;
      };
      __r.removeVideo = function(id){
        var i;
        for (i = 0; i < ytcenter.settings.watchedVideos.length; i++) {
          if (ytcenter.settings.watchedVideos[i] === id) {
            ytcenter.settings.watchedVideos.splice(i, 1);
            ytcenter.saveSettings();
            break;
          }
        }
      };
      __r.addVideo = function(id){
        if (__r.isVideoWatched(id)) return;
        if (ytcenter.settings.watchedVideosLimit < ytcenter.settings.watchedVideos.length) {
          ytcenter.settings.watchedVideos.splice(0, ytcenter.settings.watchedVideos.length - ytcenter.settings.watchedVideosLimit);
        }
        ytcenter.settings.watchedVideos.push(id);
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
            cacheData = getDataCacheById(a[i].getAttribute("data-author-id"));
            if (cacheData) {
              if (cacheData.country) sort[data[i].userId].country = cacheData.country;
            }
          }
        }
        data = [];
        for (i = 0; i < tmp.length; i++) {
          d = sort[tmp[i]];
          d.id = tmp[i];
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
          var MutObs = ytcenter.getMutationObserver();
          if (MutObs) {
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
            observer = new MutObs(function(){
              __r.update();
              if (document.getElementById("comments-view")) {
                observer2.observe(document.getElementById("comments-view"), { childList: true, subtree: true });
              }
            });
            observer2 = new MutObs(__r.update);
            observer3 = new MutObs(function(){
              __r.update(true);
            });
            if (document.getElementById("watch-discussion"))
              observer.observe(document.getElementById("watch-discussion"), { childList: true });
            if (document.getElementById("channel-discussion")) {
              observer3.observe(document.getElementById("channel-discussion"), { childList: true });
            }
          } else {
            if (document.getElementById("watch-discussion")) {
              ytcenter.utils.addEventListener(document.getElementById("watch-discussion"), "DOMNodeInserted", function(){
                __r.update();
              }, false);
            }
            if (document.getElementById("channel-discussion")) {
              ytcenter.utils.addEventListener(document.getElementById("channel-discussion"), "DOMNodeInserted", function(){
                __r.update(true);
              }, false);
            }
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
          callback((JSON && JSON.parse ? JSON.parse(r.responseText) : eval("(" + r.reponseText + ")")));
        }
      });
    };
    ytcenter.getPage = function(url){
      url = url || loc.href;
      var pathname = (url && url.split("youtube.com")[1]) || loc.pathname;
      if (url.indexOf(".youtube.com/watch?") !== -1) {
        ytcenter.page = "watch";
        return "watch";
      } else if (url.indexOf("youtube.com/") !== -1 && (loc.pathname === "/" || loc.pathname === "/feed/what_to_watch")) {
        ytcenter.page = "feed_what_to_watch";
        return "feed_what_to_watch";
      } else if (url.indexOf(".youtube.com/embed/") !== -1) {
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
      } else if (url.indexOf(".youtube.com/") !== -1) {
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
              event: "stopInterval",
              called: false
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
            try {
              con.log("[PageReadinessListener] At event => " + events[i].event);
              events[i].called = true;
              for (j = 0; j < events[i].callbacks.length; j++) {
                events[i].callbacks[j]();
              }
            } catch (e) {
              con.error("[PageReadinessListener] " + events[i].event);
              con.error(e);
            }
          }
        }
      };
      __r.setup = function(){
        ytcenter.utils.addEventListener(document, "readystatechange", __r.update, false);
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
            thumbs;
        if (pt) {
          return pt.getElementsByClassName("video-thumb");
        }
        return [];
      }
      function getVideoThumbs() {
        var linkRegex = /v=([a-zA-Z0-9-_]+)/,
            vt = document.getElementsByClassName("video-thumb"),
            videos = [],
            i, id, videoElement, cacheData, data;
        for (i = 0; i < vt.length; i++) {
          if (ytcenter.utils.inArray(playlistVideoThumbs, vt[i])) continue;
          videoElement = vt[i].parentNode;
          data = null;
          cacheData = null;
          if (videoElement.tagName === "A") {
            if (videoElement.href.match(linkRegex)) {
              id = linkRegex.exec(videoElement.href)[1];
              cacheData = getDataCacheById(id);
              data = {id: id, content: videoElement, wrapper: videoElement, videoThumb: vt[i]};
              if (cacheData) {
                if (cacheData.stream) data.stream = cacheData.stream;
                if (cacheData.likes) data.likes = cacheData.likes;
                if (cacheData.dislikes) data.dislikes = cacheData.dislikes;
              }
            }
          } else if (videoElement.parentNode.tagName === "A") {
            if (videoElement.parentNode.href.match(linkRegex)) {
              id = linkRegex.exec(videoElement.parentNode.href)[1];
              cacheData = getDataCacheById(id);
              data = {id: id, content: videoElement, wrapper: videoElement.parentNode, videoThumb: vt[i]};
              if (cacheData) {
                if (cacheData.stream) data.stream = cacheData.stream;
                if (cacheData.likes) data.likes = cacheData.likes;
                if (cacheData.dislikes) data.dislikes = cacheData.dislikes;
              }
            }
          }
          if (data) videos.push(data);
        }
        return videos;
      }
      function loadVideoConfig(item, callback) {
        if (item.stream) {
          callback(item.stream);
        } else {
          //var spflink = Math.round(Math.random()) === 1 ? true : false;
          var spflink = ytcenter.spf.isEnabled();
          //var spflink = true;
          
          $XMLHTTPRequest({
            url: "http://www.youtube.com/watch?v=" + item.id + (spflink ? "&spf=navigate" : ""),
            method: "GET",
            onload: function(r){
              try {
                var cfg, errorType = "unknown";
                try {
                  if (spflink) {
                    try {
                      cfg = JSON.parse(r.responseText);
                    } catch (e) {
                      cfg = eval("(" + r.responseText + ")");
                    }
                    if (cfg.swfcfg) {
                      cfg = cfg.swfcfg;
                    } else if (typeof cfg.html["player-unavailable"] === "string" && cfg.html["player-unavailable"] !== "" && cfg.html["player-unavailable"].indexOf("<div") !== -1) {
                      throw "unavailable";
                    } else {
                      try {
                        cfg = JSON.parse(r.responseText);
                      } catch (e) {
                        cfg = eval("(" + r.responseText + ")");
                      }
                      if (cfg && cfg.html && cfg.html.content && cfg.html.content.indexOf("<script>var ytplayer = ytplayer || {};ytplayer.config = ") !== -1) {
                        cfg = cfg.html.content.split("<script>var ytplayer = ytplayer || {};ytplayer.config = ")[1];
                        cfg = cfg.split(";</script>")[0];
                        try {
                          cfg = JSON.parse(cfg);
                        } catch (e) {
                          cfg = eval("(" + cfg + ")");
                        }
                      } else if (cfg && cfg.html && cfg.html.player && cfg.html.player.indexOf("<script>var ytplayer = ytplayer || {};ytplayer.config = ") !== -1) {
                        cfg = cfg.html.player.split("<script>var ytplayer = ytplayer || {};ytplayer.config = ")[1];
                        cfg = cfg.split(";</script>")[0];
                        try {
                          cfg = JSON.parse(cfg);
                        } catch (e) {
                          cfg = eval("(" + cfg + ")");
                        }
                      } else {
                        throw "unknown";
                      }
                    }
                  } else {
                    cfg = r.responseText.split("<script>var ytplayer = ytplayer || {};ytplayer.config = ")[1].split(";</script>")[0];
                    try {
                      cfg = JSON.parse(cfg);
                    } catch (e) {
                      cfg = eval("(" + cfg + ")");
                    }
                  }
                } catch (e) {
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
                    try {
                      cfg.args = JSON.parse(cfg.args);
                    } catch (e) {
                      cfg.args = eval("(" + cfg.args + ")");
                    }
                  }
                }
                item.stream = ytcenter.player.getHighestStreamQuality(ytcenter.parseStreams(cfg.args));
                try {
                  delete item.stream.fallback_host;
                  delete item.stream.sig;
                  delete item.stream.flashVersion;
                  delete item.stream.url;
                } catch (e) {
                  con.error(e);
                }
                //item.hq = ytcenter.player.getClosestQuality("highres", ytcenter.parseStreams(cfg.args));
                try {
                  if (isInCache(item)) {
                    updateItemInCache(item);
                  } else {
                    addNewDataToCache(item);
                  }
                } catch (e) {
                  con.error(e);
                }
                callback(item.stream);
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
                    try {
                      con.error(JSON.parse(r.responseText));
                    } catch (e) {
                      try {
                        con.error(eval("(" + r.responseText + ")"));
                      } catch (e) {
                        con.error(r.responseText);
                      }
                    }
                  }
                }
                con.error("[VideoThumbnail Quality] IO Error => " + msg);
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
                      try {
                        con.error(eval("(" + r.responseText + ")"));
                      } catch (e) {
                        con.error(r.responseText);
                      }
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
          if (!ytcenter.utils.hasClass(item.videoThumb, "yt-thumb-fluid") && item.videoThumb.className.match(/yt-thumb-[0-9]+/)) {
            barLength = /yt-thumb-([0-9]+)/.exec(item.videoThumb.className)[1] + "px";
          } else if (item.videoThumb.style.width && parseInt(item.videoThumb.style.width) > 0) {
            barLength = item.videoThumb.style.width;
          } else {
            barLength = "100%";
          }
          sparkBarLikes.className = "video-extras-sparkbar-likes";
          sparkBarDislikes.className = "video-extras-sparkbar-dislikes";
          if (likes === "error") {
            sparkBarDislikes.style.background = "#BF3EFF";
            total = 1;
            likes = 0;
            dislikes = 1;
          } else if (total > 0) {
            sparkBarDislikes.style.background = "#f00";
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
      function appendQuality(item, stream, errorMessage) {
        var tableQuality = {
              "error": errorMessage,
              "auto": errorMessage,
              "tiny": "144p",
              "small": "240p",
              "medium": "360p",
              "large": "480p",
              "hd720": "720p",
              "hd1080": "1080p",
              "highres": "1080p+"
            },
            tableBackground = {
              "error": "#b00",
              "auto": "#b00",
              "tiny": "#7e587e",
              "small": "#aaa",
              "medium": "#0aa",
              "large": "#00f",
              "hd720": "#0a0",
              "hd1080": "#f00",
              "highres": "#000"
            },
            tableColor = {
              "error": "#fff",
              "auto": "#fff",
              "tiny": "#fff",
              "small": "#fff",
              "medium": "#fff",
              "large": "#fff",
              "hd720": "#fff",
              "hd1080": "#fff",
              "highres": "#fff"
            },
            text, background, color, wrapper = document.createElement("span");
        if (stream === "error") {
          text = tableQuality[stream];
          background = tableBackground[stream];
          color = tableColor[stream];
        } else if (stream && stream.quality) {
          text = stream.dimension.split("x")[1] + "p";
          background = tableBackground[stream.quality];
          color = tableColor[stream.quality];
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
      function applyWatchLaterSettings(item) {
        ytcenter.utils.addClass(item.wrapper, "ytcenter-thumbnail-watchlater-pos-" + ytcenter.settings.videoThumbnailWatchLaterPosition);
        ytcenter.utils.addClass(item.wrapper, "ytcenter-thumbnail-watchlater-visible-" + ytcenter.settings.videoThumbnailWatchLaterVisible);
      }
      function applyTimeCodeSettings(item) {
        ytcenter.utils.addClass(item.wrapper, "ytcenter-thumbnail-timecode-pos-" + ytcenter.settings.videoThumbnailTimeCodePosition);
        ytcenter.utils.addClass(item.wrapper, "ytcenter-thumbnail-timecode-visible-" + ytcenter.settings.videoThumbnailTimeCodeVisible);
      }
      function applyWatchedMessage(item) {
        var ivw = ytcenter.videoHistory.isVideoWatched(item.id),
            hc = ytcenter.utils.hasClass(item.content, "watched"), a, i, b, watchedElement;
        if (ivw) {
          watchedElement = document.createElement("div");
          if (item.content.getElementsByClassName("watched-message").length === 0) {
            watchedElement.className = "watched-message";
            watchedElement.textContent = ytcenter.language.getLocale("SETTINGS_WATCHED");
            ytcenter.language.addLocaleElement(watchedElement, "SETTINGS_WATCHED", "@textContent");
            item.content.insertBefore(watchedElement, item.content.children[0]);
          }
          ytcenter.utils.addClass(item.content, "watched");
          /*a = item.content;
          for (i = 0; i < 10; i++) {
            a = a.parentNode;
            if (a.tagName === "LI" || !a) {
              b = a;
              break;
            }
          }
          if (b) ytcenter.utils.addClass(b, "ytcenter-video-watched-wrapper");*/
        } else if (!ivw && hc) {
          //a = item.content;
          ytcenter.utils.removeClass(item.content, "watched");
          /*for (i = 0; i < 10; i++) {
            a = a.parentNode;
            if (a.tagName === "LI" || !a) {
              b = a;
              break;
            }
          }
          if (b) ytcenter.utils.removeClass(b, "ytcenter-video-watched-wrapper");*/
        }
      }
      function subscriptionGrid(item) {
        var username = item.content.parentNode.parentNode.parentNode.parentNode.getElementsByClassName("yt-user-name")[0],
            metadata = item.content.parentNode.parentNode.getElementsByClassName("yt-lockup-meta")[0],
            actionMenu = item.content.parentNode.parentNode.parentNode.parentNode.nextElementSibling,
            usernameWrapper = document.createElement("div"), i, am, li, s;
        if (!metadata.parentNode.getElementsByClassName("ytcenter-grid-subscriptions-username") || metadata.parentNode.getElementsByClassName("ytcenter-grid-subscriptions-username").length === 0) {
          usernameWrapper.appendChild(ytcenter.utils.replaceText(ytcenter.language.getLocale("SUBSCRIPTIONSGRID_BY_USERNAME"), {"{username}": username}));
          usernameWrapper.className = "ytcenter-grid-subscriptions-username";
          metadata.parentNode.insertBefore(usernameWrapper, metadata);
          
          if (ytcenter.settings.watchedVideosIndicator) {
            am = actionMenu.getElementsByTagName("ul")[0];
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
              applyWatchedMessage(item);
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
          
          ytcenter.events.addEvent("language-refresh", function(){
            usernameWrapper.innerHTML = "";
            usernameWrapper.appendChild(ytcenter.utils.replaceText(ytcenter.language.getLocale("SUBSCRIPTIONSGRID_BY_USERNAME"), {"{username}": username}));
          });
        }
      }
      function processItemHeavyLoad(item) {
        if (!ytcenter.settings.videoThumbnailQualityBar) return;
        if (ytcenter.settings.videoThumbnailQualityDownloadAt === "hover_thumbnail") {
          ytcenter.utils.addEventListener(item.wrapper, "mouseover", (function(){
            var added = false;
            return function(){
              if (added) return;
              added = true;
              loadVideoConfig(item, function(stream, errorMessage){
                appendQuality(item, stream, errorMessage);
              });
            };
          })(), false);
        } else {
          loadVideoConfig(item, function(stream, errorMessage){
            appendQuality(item, stream, errorMessage);
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
          if (ytcenter.settings.videoThumbnailRatingsBarDownloadAt === "page_start" && ytcenter.settings.videoThumbnailRatingsCountDownloadAt !== "page_start") {
            loadVideoData(item, function(likes, dislikes){
              if (ytcenter.settings.videoThumbnailRatingsCount) {
                appendRatingCount(item, likes, dislikes);
              }
              if (ytcenter.settings.videoThumbnailRatingsBar) {
                appendRatingBar(item, likes, dislikes);
              }
            });
          } else {
            if (ytcenter.settings.videoThumbnailRatingsBarDownloadAt === "hover_thumbnail" && ytcenter.settings.videoThumbnailRatingsBar) {
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
            if (ytcenter.settings.videoThumbnailRatingsCountDownloadAt === "hover_thumbnail" && ytcenter.settings.videoThumbnailRatingsCount) {
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
      var __r = {}, observer, videoThumbs, playlistVideoThumbs;
      __r.update = function(){
        var vt = compareDifference(getVideoThumbs(), videoThumbs), i;
        for (i = 0; i < vt.length; i++) {
          videoThumbs.push(vt[i]);
          updateReuse(vt[i]);
          processItem(vt[i]);
          processItemHeavyLoad(vt[i]);
          applyWatchLaterSettings(vt[i]);
          applyTimeCodeSettings(vt[i]);
          if (loc.pathname === "/feed/subscriptions" && ytcenter.settings.gridSubscriptionsPage) {
            subscriptionGrid(vt[i]);
          }
          if ((loc.pathname === "/" || loc.pathname === "/results" || loc.pathname.indexOf("/feed/") === 0) && ytcenter.settings.watchedVideosIndicator) {
            applyWatchedMessage(vt[i]);
          }
        }
      };
      __r.setupObserver = function(){
        /* Targets:
         ** #watch-related
         ** #feed
         */
        
        var MutObs = ytcenter.getMutationObserver();
        if (MutObs) {
          observer = new MutObs(function(mutations){
            __r.update();
          });
          if (!observer) return;
          var config = { childList: true, subtree: true };
          if (document.getElementById("content"))
            observer.observe(document.getElementById("content"), config);
        } else {
          if (document.getElementById("content")) {
            ytcenter.utils.addEventListener(document.getElementById("content"), "DOMNodeInserted", function(){
              __r.update();
              ytcenter.comments.update();
            }, false);
          }
        }
      };
      __r.dispose = function(){
        if (observer) {
          observer.disconnect();
          observer = null;
        }
      };
      ytcenter.unload(__r.dispose);
      __r.setup = function(){
        try {
          var i;
          cacheChecker();
          playlistVideoThumbs = getPlaylistVideoThumbs();
          videoThumbs = getVideoThumbs();
          for (i = 0; i < videoThumbs.length; i++) {
            updateReuse(videoThumbs[i]);
            processItem(videoThumbs[i]);
            processItemHeavyLoad(videoThumbs[i]);
            applyWatchLaterSettings(videoThumbs[i]);
            applyTimeCodeSettings(videoThumbs[i]);
            if (loc.pathname === "/feed/subscriptions" && ytcenter.settings.gridSubscriptionsPage) {
              subscriptionGrid(videoThumbs[i]);
            }
            if ((loc.pathname === "/" || loc.pathname === "/results" || loc.pathname.indexOf("/feed/") === 0) && ytcenter.settings.watchedVideosIndicator) {
              applyWatchedMessage(videoThumbs[i]);
            }
          }
          __r.setupObserver();
        } catch (e) {
          con.error(e);
        }
      };
      
      return __r;
    })();
    
    uw.ytcenter = uw.ytcenter || {};
    uw.ytcenter.io = uw.ytcenter.io || {};
    ytcenter.io = uw.ytcenter.io;
    
    ytcenter.debug = function(){
      var debugText = "{}";
      var dbg = {};
      try {
        dbg.htmlelements = {};
        if (document.body)
          dbg.htmlelements.body = {className: document.body.className};
        dbg.injected = injected;
        dbg.identifier = @identifier@;
        dbg.storageType = ytcenter.storageType;
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
        dbg._settings = ytcenter._settings;
        dbg.settings = ytcenter.settings;
        dbg.ytcenter = {};
        dbg.ytcenter.video = ytcenter.video;
        dbg.ytcenter.signatureDecipher = ytcenter.utils._signatureDecipher;
        dbg.ytcenter._signatureDecipher = ytcenter.utils.__signatureDecipher;
        dbg.ytcenter.player = {};
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
        "begin-response": [],
        "dispose": [],
        "init": [],
        "load": [],
        "navigate": [],
        "prefetch": [],
        "process": []
      },
      loadListeners = [],
      events = ["error", "processed", "received", "requested", "script-loading", "begin-response"],
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
        con.log("[SPF] Checking if SPF is ready...");
        if (typeof uw._spf_state !== "object") {
          con.log("[SPF] Failed... _spf_state object is not initialized yet!");
          return false;
        }
        if (typeof uw._spf_state.config !== "object") {
          con.log("[SPF] Failed... _spf_state.config object is not initialized yet!");
          return false;
        }
        for (i = 0; i < eventsSPF.length; i++) {
          if (typeof uw.spf[eventsSPF[i]] !== "function") {
            con.log("[SPF] Failed... " + eventsSPF[i] + " has not been created yet!");
            return false;
          }
        }
        con.log("[SPF] SPF is ready for manipulation!");
        return true;
      };
      _obj.inject = function(){ // Should only be called once every instance (page reload).
        if (!_obj.isEnabled() || injected) return; // Should not inject when SPF is not enabled!
        injected = true;
        var ytspf = uw._spf_state,
            spf = uw.spf,
            obj_name,
            func;
        con.log("[SPF] Injecting ability to add event listeners to SPF.");
        for (var i = 0; i < eventsSPF.length; i++) {
          if (typeof originalCallbacks[eventsSPF[i]] !== "function") originalCallbacks[eventsSPF[i]] = spf[eventsSPF[i]];
          func = (function(event){
            return function(){
              var args = arguments;
              
              var r,j;
              con.log("[SPF] spf => " + event);
              con.log(args);
              
              try {
                for (j = 0; j < listeners[event].length; j++) {
                  args = listeners[event][j].apply(null, args) || args;
                }
              } catch (e) {
                con.error(e);
              }
              
              if (typeof originalCallbacks[event] === "function") {
                r = originalCallbacks[event].apply(null, args);
              } else {
                con.error("[SPF] Wasn't able to call the original callback!");
              }
              return r;
            };
          })(eventsSPF[i]);
          spf[eventsSPF[i]] = func;
        }
        var _spf = [];
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
              con.log("[SPF] _spf_state => " + event);
              con.log(args);
              
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
              return r;
            };
          })(events[i]);
          _spf.push({
            key: obj_name,
            callback: func,
            update: (function(event){
              return function(a){
                originalCallbacks[event] = a;
              };
            })(events[i])
          });
          ytspf.config[obj_name] = func;
          uw.ytspf.config[obj_name] = func;
        }
        ytspf = new SPFConfigWrapper(ytspf, new SPFConfig(_spf, ytspf.config));
        uw.__defineGetter__("_spf_state", function(){return ytspf;});
        uw.__defineSetter__("_spf_state", function(value){
          ytcenter.utils.each(value, function(key, value){
            ytspf[key] = value;
          });
        });
      };
      
      return _obj;
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
        for (var i = 0; i < db[event].length; i++) {
          try {
            db[event][i]();
          } catch (e) {
            con.error(e);
          }
        }
      };
      
      return __r;
    })();
    ytcenter._dialogVisible = null;
    ytcenter.dialog = function(titleLabel, content, actions, alignment){
      var __r = {}, ___parent_dialog = null, bgOverlay, root, base, fg, fgContent, footer, eventListeners = {}, actionButtons = {};
      alignment = alignment || "center";
      
      bgOverlay = ytcenter.dialogOverlay();
      root = document.createElement("div");
      root.className = "yt-dialog";
      base = document.createElement("div");
      base.className = "yt-dialog-base";
      
      fg = document.createElement("div");
      fg.className = "yt-dialog-fg";
      fgContent = document.createElement("div");
      fgContent.className = "yt-dialog-fg-content yt-dialog-show-content";
      fg.appendChild(fgContent);
      
      
      if (alignment === "center") {
        var align = document.createElement("span");
        align.className = "yt-dialog-align";
        base.appendChild(align);
      } else {
        fg.style.margin = "13px 0";
      }
      
      base.appendChild(fg);
      root.appendChild(base);
      
      if (typeof titleLabel === "string" && titleLabel !== "") {
        var header = document.createElement("div");
        header.className = "yt-dialog-header";
        var title = document.createElement("h2");
        title.className = "yt-dialog-title";
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
        cnt.className = "yt-dialog-content";
        cnt.appendChild(content);
        fgContent.appendChild(cnt);
      }
      footer = document.createElement("div");
      footer.className = "yt-dialog-footer";
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
        if (eventListeners["visibility"]) {
          for (var i = 0; i < eventListeners["visibility"].length; i++) {
            eventListeners["visibility"][i](visible);
          }
        }
        if (visible) {
          if (document.body) ytcenter.utils.addClass(document.body, "yt-dialog-active");
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
            if (document.body) ytcenter.utils.removeClass(document.body, "yt-dialog-active");
          }
        }
      };
      return __r;
    };
    ytcenter.dialogOverlay = function(){
      var bg = document.createElement("div");
      bg.id = "yt-dialog-bg";
      bg.className = "yt-dialog-bg";
      bg.style.height = "100%";
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
    ytcenter.settingsPanel = (function(){
      var a = {};
      
      a.setVisibility = function(visible){
        
      };
      
      return a;
    });
    ytcenter.welcome = (function(){
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
        wikilink.textContent = ytcenter.language.getLocale("WELCOME_CONTENT_WIKI");
        b.appendChild(ytcenter.utils.replaceText(
            "YouTube Center have many new features just waiting for you to try out. YouTube Center has by default set the settings, but to get the full experience of YouTube Center you will have to configurate the settings to your own need.{lb}{lb}"
          + "To access the YouTube Center settings you only have to click on the button as shown in the picture below (marked with a red glow).{lb}{lb}"
          + "{img1}{lb}{lb}"
          + "If you want to know more about YouTube Center visit the {wiki-url} for more information.{sectionbreak}"
          + "If you appreciate my work I would be grateful if you would {donate}.",
          {
            "{lb}": function(){
              return document.createElement("br");
            },
            "{sectionbreak}": function(){
              var c = document.createElement("div");
              c.style.marginTop = "76px";
              return c;
            },
            "{img1}": img1,
            "{wiki-url}": wikilink,
            "{donate}": donatelink
          }
        ));
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
                ytcenter.settingsControlVisibility(true);
                ytcenter.settingsPanel.setVisibility(true);
              } catch (e) {
                con.error(e);
              }
            }
          }
        ]);
        dialog.setWidth("630px");
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
        
        if (e && e.preventDefault) {
          e.preventDefault();
        } else {
          window.event.returnValue = false;
        }
        return false;
      });
      ytcenter.utils.addEventListener(document, "mousemove", function(e){
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
    ytcenter.events = (function(){
      var db = [];
      
      var __r = {};
      /**
       * Adds a callback to an event.
       * @event The event which callback will be called upon.
       * @callback The function which will be called upon a specific event.
       * @return The index of the new entry.
       */
      __r.addEvent = function(event, callback){
        return db.push([event, callback])-1;
      };
      /**
       * Performs an event which will call all callbacks which is linked to this specific event.
       * @event The event which callback will be called upon.
       */
      __r.performEvent = function(event){
        for (var i = 0; i < db.length; i++) {
          if (db[i][0] === event) {
            db[i][1]();
          }
        }
      };
      
      return __r;
    })();
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
    ytcenter.embeds = {};
    ytcenter.embeds.textInputField = function(){
      var wrapper = document.createElement("span"),
          elm = ytcenter.gui.createYouTubeTextInput();
      wrapper.appendChild(elm);
      wrapper.className = "ytcenter-embed";
      return {
        element: wrapper, // So the element can be appended to an element.
        bind: function(callback){
          ytcenter.utils.addEventListener(elm, "change", function(){
            callback(elm.value);
          }, false);
        },
        update: function(value){
          elm.value = value;
        }
      };
    };
    ytcenter.embeds.sortList = function(){
      // Sortable list as in Resize -> Player Sizes
    };
    ytcenter.embeds.colorPickerField = function(hue, sat, val){
      var bCallback;
      
      hue = hue || 0;
      sat = sat || 0;
      val = val || 0;
      
      var wrapper = document.createElement("div");
      wrapper.style.background = ytcenter.utils.hsvToHex(hue, 100, 100);
      wrapper.style.position = "relative";
      wrapper.style.overflow = "hidden";
      
      var _sat = document.createElement("div");
      _sat.className = "ytcenter-colorpicker-saturation";
      
      var _value = document.createElement("div");
      _value.className = "ytcenter-colorpicker-value";
      _sat.appendChild(_value);
      
      wrapper.appendChild(_sat);
      
      var handler = document.createElement("div");
      handler.className = "ytcenter-colorpicker-handler";
      
      wrapper.appendChild(handler);
      
      var mousedown = false;
      
      var update = function(){
        var x = sat/100*wrapper.clientWidth;
        var y = (100 - val)/100*wrapper.clientHeight;
        //var y = val*wrapper.clientHeight/100 - wrapper.clientHeight;
        
        handler.style.top = Math.round(y - handler.offsetHeight/2) + "px";
        handler.style.left = Math.round(x - handler.offsetWidth/2) + "px";
      };
      var updateBackground = function(){
        wrapper.style.background = ytcenter.utils.hsvToHex(hue, 100, 100);
      };
      
      var eventToValue = function(e){
        var offset = ytcenter.utils.getOffset(wrapper);
        var scrollOffset = ytcenter.utils.getScrollOffset();
        var x = Math.max(0, Math.min(e.pageX - offset.left - scrollOffset.left, wrapper.clientWidth));
        var y = e.pageY - offset.top - scrollOffset.top;
        
        if (y < 0) y = 0;
        if (y > wrapper.clientHeight) y = wrapper.clientHeight;
        
        sat = x/wrapper.clientWidth*100;
        val = 100 - y/wrapper.clientHeight*100;
      };
      
      ytcenter.utils.addEventListener(wrapper, "mousedown", function(e){
        if (mousedown) return;
        mousedown = true;
        
        eventToValue(e);
        update();
        if (bCallback) bCallback(sat, val);
        
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
        if (e && e.preventDefault) {
          e.preventDefault();
        } else {
          window.event.returnValue = false;
        }
        return false;
      });
      ytcenter.utils.addEventListener(document, "mousemove", function(e){
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
      });
      ytcenter.events.addEvent("ui-refresh", function(){
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
    ytcenter.embeds.colorPicker = function(){
      var update = function(){
        wrapper.style.background = ytcenter.utils.colorToHex(red, green, blue);
        currentColor.style.background = ytcenter.utils.colorToHex(red, green, blue);
        redRange.update(red);
        greenRange.update(green);
        blueRange.update(blue);
        htmlColor.update(ytcenter.utils.colorToHex(red, green, blue));
      };
      var updateHueRange = function(){
        if (Math.max(red, green, blue) !== Math.min(red, green, blue)) {
          hueRange.update(hsv.hue);
        }
      };
      var updateColorField = function(){
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
      };
      
      var red = 0;
      var green = 0;
      var blue = 0;
      var sessionHex = "#000000"; // default is black
      var hsv = ytcenter.utils.getHSV(red, green, blue);
      var _hue = hsv.hue;
      
      var bCallback;
      
      var wrapper = document.createElement("span");
      wrapper.className = "ytcenter-colorpicker";
      
      var redRange = ytcenter.embeds.range({
        value: red,
        min: 0,
        max: 255
      });
      redRange.bind(function(value){
        red = value;
        update();
        updateHueRange();
        updateColorField();
      });
      var greenRange = ytcenter.embeds.range({
        value: green,
        min: 0,
        max: 255
      });
      greenRange.bind(function(value){
        green = value;
        update();
        updateHueRange();
        updateColorField();
      });
      var blueRange = ytcenter.embeds.range({
        value: blue,
        min: 0,
        max: 255
      });
      blueRange.bind(function(value){
        blue = value;
        update();
        updateHueRange();
        updateColorField();
      });
      
      var rWrapper = document.createElement("div");
      var rText = ytcenter.embeds.label("COLORPICKER_COLOR_RED");
      rWrapper.appendChild(rText.element);
      rWrapper.appendChild(redRange.element);
      var gWrapper = document.createElement("div");
      var gText = ytcenter.embeds.label("COLORPICKER_COLOR_GREEN");
      gWrapper.appendChild(gText.element);
      gWrapper.appendChild(greenRange.element);
      var bWrapper = document.createElement("div");
      var bText = ytcenter.embeds.label("COLORPICKER_COLOR_BLUE");
      bWrapper.appendChild(bText.element);
      bWrapper.appendChild(blueRange.element);
      
      var hueWrapper = document.createElement("div");
      hueWrapper.style.width = "250px";
      hueWrapper.style.height = "225px";
      hueWrapper.style.display = "inline-block";
      
      var hueRangeField = ytcenter.embeds.colorPickerField();
      hueRangeField.bind(function(saturation, value){
        hsv.saturation = saturation;
        hsv.value = value;
        var rgb = ytcenter.utils.getRGB(hsv.hue, hsv.saturation, hsv.value);
        red = rgb.red;
        green = rgb.green;
        blue = rgb.blue;
        update();
      });
      hueRangeField.element.style.width = "225px";
      hueRangeField.element.style.height = "225px";
      hueRangeField.element.style.display = "inline-block";
      hueRangeField.element.style.border = "0";
      
      var hueRangeHandle = document.createElement("div");
      hueRangeHandle.className = "ytcenter-range-handle";
      /*var hueRangeHandleLeft = document.createElement("div");
      hueRangeHandleLeft.className = "ytcenter-range-handle-left";*/
      var hueRangeHandleRight = document.createElement("div");
      hueRangeHandleRight.className = "ytcenter-range-handle-right";
      //hueRangeHandle.appendChild(hueRangeHandleLeft);
      hueRangeHandle.appendChild(hueRangeHandleRight);
      
      var hueRange = ytcenter.embeds.range({
        value: hsv.hue,
        min: 0,
        max: 360,
        method: "vertical",
        handle: hueRangeHandle,
        offset: 7
      });
      hueRange.element.style.display = "inline-block";
      hueRange.element.style.border = "0";
      ytcenter.utils.addClass(hueRange.element, "ytcenter-hue");
      var d1 = document.createElement("div");
      d1.className = "ie-1";
      var d2 = document.createElement("div");
      d2.className = "ie-2";
      var d3 = document.createElement("div");
      d3.className = "ie-3";
      var d4 = document.createElement("div");
      d4.className = "ie-4";
      var d5 = document.createElement("div");
      d5.className = "ie-5";
      var d6 = document.createElement("div");
      d6.className = "ie-6";
      hueRange.element.appendChild(d1);
      hueRange.element.appendChild(d2);
      hueRange.element.appendChild(d3);
      hueRange.element.appendChild(d4);
      hueRange.element.appendChild(d5);
      hueRange.element.appendChild(d6);
      hueRange.bind(function(value){
        hsv.hue = value;
        var rgb = ytcenter.utils.getRGB(hsv.hue, hsv.saturation, hsv.value);
        red = rgb.red;
        green = rgb.green;
        blue = rgb.blue;
        update();
        updateColorField();
      });
      
      var hWrapper = document.createElement("div");
      hWrapper.style.marginTop = "10px";
      
      var htmlColorLabel = ytcenter.embeds.label("COLORPICKER_COLOR_HTMLCODE");
      htmlColorLabel.element.style.width = "127px";
      htmlColorLabel.element.style.verticalAlign = "middle";
      
      var htmlColor = ytcenter.embeds.textInputField();
      htmlColor.bind(function(value){
        var rgb = ytcenter.utils.hexToColor(value);
        red = rgb.red;
        green = rgb.green;
        blue = rgb.blue;
        
        hsv = ytcenter.utils.getHSV(red, green, blue);
        
        update();
        updateHueRange();
        updateColorField();
      });
      htmlColor.element.children[0].style.width = "80px";
      
      var currentColor = document.createElement("span");
      currentColor.style.display = "inline-block";
      currentColor.style.cssFloat = "left";
      currentColor.style.width = "20px";
      currentColor.style.height = "29px";
      currentColor.style.background = sessionHex;
      
      htmlColor.element.appendChild(currentColor);
      
      hWrapper.appendChild(htmlColorLabel.element);
      hWrapper.appendChild(htmlColor.element);
      
      var rgbWrapper = document.createElement("div");
      rgbWrapper.style.display = "inline-block";
      rgbWrapper.style.verticalAlign = "top";
      rgbWrapper.style.width = "225px";
      rgbWrapper.style.height = "225px";
      rgbWrapper.style.position = "relative";
      rgbWrapper.appendChild(rWrapper);
      rgbWrapper.appendChild(gWrapper);
      rgbWrapper.appendChild(bWrapper);
      
      rgbWrapper.appendChild(hWrapper);
      
      hueWrapper.appendChild(hueRangeField.element);
      hueWrapper.appendChild(hueRange.element);
      
      var cpWrapper = document.createElement("div");
      cpWrapper.style.width = "475px";
      cpWrapper.style.position = "relative";
      cpWrapper.style.zIndex = "4";
      cpWrapper.appendChild(hueWrapper);
      cpWrapper.appendChild(rgbWrapper);
      
      var dialog = ytcenter.dialog("COLORPICKER_TITLE", cpWrapper, [
        {
          label: "COLORPICKER_CANCEL",
          primary: false,
          callback: function(){
            var rgb = ytcenter.utils.hexToColor(sessionHex);
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
      ]); // titleLabel, content, actions
      
      ytcenter.utils.addEventListener(wrapper, "click", function(){
        dialog.setVisibility(true);
        ytcenter.events.performEvent("ui-refresh");
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
          var rgb = ytcenter.utils.hexToColor(sessionHex);
          red = rgb.red;
          green = rgb.green;
          blue = rgb.blue;
          update();
          updateHueRange();
          updateColorField();
          ytcenter.events.performEvent("ui-refresh");
        }
      };
    };
    ytcenter.embeds.range = function(options){
      options = ytcenter.utils.mergeObjects({
        value: 0,
        min: 0,
        max: 100,
        step: 1,
        width: "225px",
        height: "14px",
        method: "horizontal", // horizontal, vertical
        handle: null,
        offset: 0
      }, options);
      
      var handle;
      
      var wrapper = document.createElement("span");
      wrapper.className = "ytcenter-range";
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
        handle.className = "ytcenter-range-handle";
        handle.style.width = (parseInt(options.height)) + "px";
        handle.style.height = parseInt(options.height) + "px";
      }
      
      wrapper.appendChild(handle);
      
      
      var mousedown = false;
      var bCallback;
      var setValue = function(val){
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
      var update = function(){
        if (options.method === "vertical") {
          handle.style.top = ((options.value - options.min)/(options.max - options.min)*(wrapper.clientHeight - handle.offsetHeight)) + "px";
        } else {
          handle.style.left = ((options.value - options.min)/(options.max - options.min)*(wrapper.clientWidth - handle.offsetWidth)) + "px";
        }
      };
      
      var eventToValue = function(e){
        var offset = ytcenter.utils.getOffset(wrapper);
        var scrollOffset = ytcenter.utils.getScrollOffset();
        if (options.method === "vertical") {
          offset.top += options.offset;
          var v = e.pageY - scrollOffset.top - offset.top;
          var l = v + parseInt(options.height)/2 - 3;
          if (l < 0) l = 0;
          if (l > wrapper.clientHeight - handle.clientHeight) l = wrapper.clientHeight - handle.clientHeight;
          
          setValue(l/(wrapper.clientHeight - handle.clientHeight)*(options.max - options.min) + options.min);
        } else {
          offset.left += options.offset;
          var v = e.pageX - scrollOffset.left - offset.left;
          var l = v - parseInt(options.height)/2;
          if (l < 0) l = 0;
          if (l > wrapper.clientWidth - handle.clientWidth) l = wrapper.clientWidth - handle.clientWidth;
          
          setValue(l/(wrapper.clientWidth - handle.clientWidth)*(options.max - options.min) + options.min);
        }
        update();
      };
      
      ytcenter.events.addEvent("ui-refresh", function(){
        setValue(options.value);
        update();
      });
      setValue(options.value);
      update();
      
      ytcenter.utils.addEventListener(wrapper, "mousedown", function(e){
        if (mousedown) return;
        mousedown = true;
        
        eventToValue(e);
        if (bCallback) bCallback(options.value);
        
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
        if (e && e.preventDefault) {
          e.preventDefault();
        } else {
          window.event.returnValue = false;
        }
        return false;
      });
      ytcenter.utils.addEventListener(document, "mousemove", function(e){
        if (!mousedown) return;
        eventToValue(e);
        if (bCallback) bCallback(options.value);
        
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
    ytcenter.embeds.label = function(localeName){
      var wrapper = document.createElement("span");
      wrapper.className = "ytcenter-embed ytcenter-label";
      wrapper.textContent = ytcenter.language.getLocale(localeName);
      
      ytcenter.language.addLocaleElement(wrapper, localeName, "@textContent");
      
      return {
        element: wrapper, // So the element can be appended to an element.
        bind: function(){},
        update: function(){}
      };
    };
    ytcenter.embeds.multilist = function(list){
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
            cb = ytcenter.embeds.checkbox(isEnabled(value)),
            text = document.createTextNode(ytcenter.language.getLocale(label));
        ytcenter.language.addLocaleElement(text, label, "@textContent");
        cb.bind(function(checked){
          if (checked) {
            settingData = saveItem(value);
          } else {
            settingData = removeItem(value);
          }
          if (typeof saveCallback === "function") saveCallback(settingData);
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
      var settingData, wrapper = document.createElement("div"), saveCallback;
      wrapper.style.paddingLeft = "16px";
      
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
    ytcenter.embeds.bgcolorlist = function(){
      var saveCallback, sName;
      
      var wrapper = document.createElement("span");
      
      
      return {
        element: wrapper,
        update: function(settingName){
          sName = settingName;
        },
        bind: function(cb){
          saveCallback = cb;
        }
      };
    };
    ytcenter.embeds.defaultplayersizedropdown = function(option){
      function getItemTitle(item) {
        try{
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
        }catch(e){con.error(e)}
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
      
      updateItems(ytcenter.settings[option]);
      ytcenter.events.addEvent("ui-refresh", function(){
        var opt = ytcenter.settings[option];
        var found = false;
        for (var i = 0; i < opt.length; i++) {
          if (opt[i].id === selectedId) found = true;
        }
        if (!found && selectedId !== "default") {
          selectedId = opt[0].id;
          if (saveCallback) saveCallback(selectedId);
        }
        updateItems(opt);
      });
      
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
    ytcenter.embeds.resizedropdown = function(option){
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
      
      updateItems(ytcenter.settings[option]);
      ytcenter.events.addEvent("ui-refresh", function(){
        var opt = ytcenter.settings[option];
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
    ytcenter.embeds.checkbox = function(selected){
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
    ytcenter.embeds.select = function(list){
      var selectedValue, saveCallback;
      
      var updateList = function(){
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
      };
      
      var wrapper = document.createElement("span");
      wrapper.className = "ytcenter-embed yt-uix-form-input-select";
      wrapper.style.marginBottom = "2px";
      wrapper.style.height = "27px";
      
      var selectedContentWrapper = document.createElement("span");
      selectedContentWrapper.className = "yt-uix-form-input-select-content";
      var selectedArrow = document.createElement("img");
      selectedArrow.setAttribute("src", "//s.ytimg.com/yt/img/pixel-vfl3z5WfW.gif");
      selectedArrow.className = "yt-uix-form-input-select-arrow";
      var selectedText = document.createElement("span");
      selectedText.className = "yt-uix-form-input-select-value";
      
      selectedContentWrapper.appendChild(selectedArrow);
      selectedContentWrapper.appendChild(selectedText);
      
      var select = document.createElement("select");
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
          selectedText.textContent = select.options[select.selectedIndex].textContent;
        },
        update: function(value){
          selectedValue = value;
          for (var i = 0; i < list.length; i++) {
            if (list[i].value === value) {
              select.selectedIndex = i;
              break;
            }
          }
          selectedText.textContent = select.options[select.selectedIndex].textContent;
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
    ytcenter.embeds.resizeItemList = function(){
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
          if (typeof dim[0] === "number") {
            __r.width = dim[0] + "px";
          } else {
            __r.width = dim[0];
          }
          if (typeof dim[1] === "number") {
            __r.height = dim[1] + "px";
          } else {
            __r.height = dim[1];
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
        
        var widthUnit = ytcenter.embeds.select([
          {label: "EMBED_RESIZEITEMLIST_PIXEL", value: "px"},
          {label: "EMBED_RESIZEITEMLIST_PERCENT", value: "%"}
        ]);
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
        
        var heightUnit = ytcenter.embeds.select([
          {label: "EMBED_RESIZEITEMLIST_PIXEL", value: "px"},
          {label: "EMBED_RESIZEITEMLIST_PERCENT", value: "%"}
        ]);
        
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
        var largeInput = ytcenter.embeds.checkbox();
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
        var alignInput = ytcenter.embeds.checkbox();
        alignInput.element.style.background = "#fff";
        alignInput.fixHeight();
        alignWrapper.appendChild(alignInput.element);
        
        var scrollToPlayerWrapper = document.createElement("div");
        scrollToPlayerWrapper.className = "ytcenter-panel-label";
        var scrollToPlayerLabel = document.createElement("label");
        scrollToPlayerLabel.textContent = ytcenter.language.getLocale("EMBED_RESIZEITEMLIST_SCROLLTOPLAYER");
        ytcenter.language.addLocaleElement(scrollToPlayerLabel, "EMBED_RESIZEITEMLIST_SCROLLTOPLAYER", "@textContent");
        scrollToPlayerWrapper.appendChild(scrollToPlayerLabel);
        var scrollToPlayerInput = ytcenter.embeds.checkbox();
        scrollToPlayerInput.element.style.background = "#fff";
        scrollToPlayerInput.fixHeight();
        scrollToPlayerWrapper.appendChild(scrollToPlayerInput.element);
        
        var scrollToPlayerButtonWrapper = document.createElement("div");
        scrollToPlayerButtonWrapper.className = "ytcenter-panel-label";
        var scrollToPlayerButtonLabel = document.createElement("label");
        scrollToPlayerButtonLabel.textContent = ytcenter.language.getLocale("EMBED_RESIZEITEMLIST_SCROLLTOPLAYERBUTTON");
        ytcenter.language.addLocaleElement(scrollToPlayerButtonLabel, "EMBED_RESIZEITEMLIST_SCROLLTOPLAYERBUTTON", "@textContent");
        scrollToPlayerButtonWrapper.appendChild(scrollToPlayerButtonLabel);
        var scrollToPlayerButtonInput = ytcenter.embeds.checkbox();
        scrollToPlayerButtonInput.element.style.background = "#fff";
        scrollToPlayerButtonInput.fixHeight();
        scrollToPlayerButtonWrapper.style.marginBottom = "40px";
        scrollToPlayerButtonWrapper.appendChild(scrollToPlayerButtonInput.element);
        
        var optionsWrapper = document.createElement("div");
        optionsWrapper.className = "clearfix resize-options";
        
        var saveBtn = ytcenter.gui.createYouTubePrimaryButton("", [ytcenter.gui.createYouTubeButtonText("Save")]);
        saveBtn.style.cssFloat = "right";
        saveBtn.style.marginLeft = "10px";
        saveBtn.style.minWidth = "60px";
        ytcenter.utils.addEventListener(saveBtn, "click", function(){
          state = 0;
          wrp.style.visibility = "hidden";
          if (typeof saveListener !== "undefined") saveListener();
          ytcenter.events.performEvent("ui-refresh");
        });
        
        var cancelBtn = ytcenter.gui.createYouTubeDefaultButton("", [ytcenter.gui.createYouTubeButtonText("Cancel")]);
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
        
        var deleteBtn = ytcenter.gui.createYouTubeDefaultButton("", [ytcenter.gui.createYouTubeButtonText("Delete")]);
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
        try {
          var _h = editWrapper.clientHeight || editWrapper.scrollHeight;
          if (_h > 0) listWrapper.style.height = _h + "px";
        } catch (e) {
          con.error(e);
        }
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
          listOl.appendChild(item.getItemElement());
        });
      }
      var editor;
      var saveCallback;
      var items = [];
      
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
      
      var editWrapper = document.createElement("div");
      editWrapper.className = "ytcenter-panel";
      
      var listWrapper = document.createElement("div");
      listWrapper.className = "ytcenter-resize-panel-list";
      
      var listOl = document.createElement("ol");
      listOl.className = "ytcenter-list ytcenter-dragdrop ytcenter-scrollbar ytcenter-scrollbar-hover";
      var dd = ytcenter.dragdrop(listOl);
      dd.addEventListener("onDrop", function(newIndex, oldIndex, item){
        var itm = items[oldIndex];
        items.splice(oldIndex, 1);
        items.splice(newIndex, 0, itm);
        if (typeof saveCallback !== "undefined") saveCallback(getSaveArray());
        ytcenter.events.performEvent("ui-refresh");
      });
      
      listWrapper.appendChild(listOl);
      contentWrapper.appendChild(listWrapper);
      contentWrapper.appendChild(editWrapper);
      wrapper.appendChild(headerWrapper);
      wrapper.appendChild(contentWrapper);
      
      ytcenter.events.addEvent("ui-refresh", function(){
        if (!editor) {
          editor = createEditor();
        }
        updateListHeight();
      });
      
      return {
        element: wrapper, // So the element can be appended to an element.
        bind: function(callback){
          saveCallback = function(arg){
            callback(arg);
            ytcenter.player.resizeUpdater();
          }
        },
        update: function(value){
          setItems(value);
          if (typeof editor !== "undefined") editor.setVisibility(false);
        }
      };
    }
    ytcenter.experiments = {};
    ytcenter.experiments.isTopGuide = function(){
      return ytcenter.utils.hasClass(document.body, "exp-top-guide") && !ytcenter.utils.hasClass(document.body, "ytg-old-clearfix");
    };
    ytcenter.experiments.isFixedTopbar = function(){
      return ytcenter.utils.hasClass(document.body, "exp-fixed-masthead");
    };
    ytcenter.utils = {};
    ytcenter.utils.url = function(url){
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
      if (identifier === 2) {
        con.log("[Storage] Using Maxthon's storage option!");
        return 6;
      } else if (identifier === 3) {
        con.log("[Storage] Using Firefox's storage option!");
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
    };
    ytcenter.storageType = ytcenter.utils.getStorageType();
    ytcenter.utils.setterGetterClassCompatible = function(){
      function A() {
        this.__defineGetter__("test", function(){
          a_getter = true;
          return a_confirm;
        });
        this.__defineSetter__("test", function(value){
          a_setter = value === a_confirm;
        });
      }
      try {
        var a_getter = false, a_setter = false, a_instance, a_confirm = "WORKS";
        a_instance = new A();
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
    ytcenter.utils.setterGetterObjectCompatible = function(){
      try {
        var a = {
          get test() {
            a_getter = true;
            return a_confirm;
          },
          set config(value) {
            a_setter = value === a_confirm;
          }
        }, a_getter = false, a_setter = false, a_confirm = "WORKS";
        if (a_confirm === a.test) {
          a.test = a_confirm;
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
    ytcenter.utils.escapeXML = function(str){
      return ytcenter.utils.replaceArray(str, ["<", ">", "&", "\"", "'"], ["&lt;", "&gt;", "&amp;", "&quot;", "&apos;"]);
    };
    ytcenter.utils.unescapeXML = function(str){
      return ytcenter.utils.replaceArray(str, ["&lt;", "&gt;", "&amp;", "&quot;", "&apos;"], ["<", ">", "&", "\"", "'"]);
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
    ytcenter.utils.__signatureDecipher = [ // Just a fallback, if the signature decode detector fails.
      {func: "slice", value: 3},
      {func: "reverse", value: null},
      {func: "swapHeadAndPosition", value: 63},
      {func: "slice", value: 2},
      {func: "reverse", value: null},
      {func: "slice", value: 1}
    ];
    ytcenter.utils._signatureDecipher = ytcenter.utils.__signatureDecipher;
    ytcenter.utils.updateSignatureDecipher = function(){
      var js = ytcenter.player.config.assets.js,
          regex = /function [a-zA-Z$0-9]+\(a\){a=a\.split\(""\);(.*?)return a\.join\(""\)}/g,
          regex2 = /function [a-zA-Z$0-9]+\(a\){a=a\.split\(""\);(((a=([a-zA-Z$0-9]+)\(a,([0-9]+)\);)|(a=a\.slice\([0-9]+\);)|(a=a\.reverse\(\);)|(var b=a\[0\];a\[0\]=a\[[0-9]+%a\.length\];a\[[0-9]+\]=b;)))*return a\.join\(""\)}/g;
        con.log("[updateSignatureDecipher] Contacting " + js);
        $XMLHTTPRequest({
          method: "GET",
          url: js,
          onload: function(response) {
            var a,i,b,v;
            
            if (response.responseText.match(regex2)) {
              con.log("[updateSignatureDecipher] First regex");
              a = regex2.exec(response.responseText)[0].split("{")[1].split("}")[0].split(";");
              ytcenter.utils._signatureDecipher = []; // Clearing signatureDecipher
              for (i = 1; i < a.length-1; i++) {
                b = a[i];
                if (b.indexOf("a.slice") !== -1) { // Slice
                  con.log("Slice/Clone (" + b + ")");
                  v = b.split("(")[1].split(")")[0];
                  con.log("=> " + v);
                  ytcenter.utils._signatureDecipher.push({func: "slice", value: parseInt(v)});
                } else if (b.indexOf("a.reverse") !== -1) { // Reverse
                  con.log("Reverse (" + b + ")");
                  ytcenter.utils._signatureDecipher.push({func: "reverse", value: null});
                } else if ((a[i] + ";" + a[i+1] + ";" + a[i+2]).indexOf("var b=a[0];a[0]=a[") !== -1){ // swapHeadAndPosition
                  con.log("swapHeadAndPosition (" + (a[i] + ";" + a[i+1] + ";" + a[i+2]) + ")");
                  v = (a[i] + ";" + a[i+1] + ";" + a[i+2]).split("var b=a[0];a[0]=a[")[1].split("%")[0];
                  con.log("=> " + v);
                  ytcenter.utils._signatureDecipher.push({func: "swapHeadAndPosition", value: parseInt(v)});
                  i = i+2;
                } else { // swapHeadAndPosition (maybe it's deprecated by YouTube)
                  con.log("swapHeadAndPosition (" + b + ")");
                  v = b.split("(a,")[1].split(")")[0];
                  con.log("=> " + v);
                  ytcenter.utils._signatureDecipher.push({func: "swapHeadAndPosition", value: parseInt(v)});
                }
              }
            } else {
              con.log("[updateSignatureDecipher] Second regex");
              a = regex.exec(response.responseText)[1];
              ytcenter.utils._signatureDecipher = []; // Clearing signatureDecoder
              ytcenter.utils._signatureDecipher.push({func: "code", value: a});
            }
            if (ytcenter.utils.__signatureDecipher !== ytcenter.utils._signatureDecipher) {
              con.log("[SignatureDecipher] YouTube updated their signatureDecipher!");
            }
            if (uw.ytcenter) {
              uw.ytcenter.signatureDecoder = ytcenter.utils._signatureDecipher;
            }
            ytcenter.events.performEvent("ui-refresh");
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
      decipherRecipe = decipherRecipe || ytcenter.utils._signatureDecipher;
      
      for (i = 0; i < ytcenter.utils._signatureDecipher.length; i++) {
        if (ytcenter.utils._signatureDecipher[i].func === "code") {
          cipherArray = new Function("a", ytcenter.utils._signatureDecipher[i].value + "return a.join(\"\")")(cipherArray);
          if (!ytcenter.utils.isArray(cipherArray) && decipherRecipe !== ytcenter.utils.__signatureDecipher) {
            return ytcenter.utils.signatureDecipher(signatureCipher, ytcenter.utils.__signatureDecipher);
          }
        } else if (ytcenter.utils._signatureDecipher[i].func === "swapHeadAndPosition") {
          cipherArray = swapHeadAndPosition(cipherArray, ytcenter.utils._signatureDecipher[i].value);
        } else if (ytcenter.utils._signatureDecipher[i].func === "slice") {
          cipherArray = cipherArray.slice(ytcenter.utils._signatureDecipher[i].value);
        } else if (ytcenter.utils._signatureDecipher[i].func === "reverse") {
          cipherArray = cipherArray.reverse();
        }
      }
      
      return cipherArray.join("")
    };
    ytcenter.utils.crypt_h = void 0;
    ytcenter.utils.crypt_l = !0;
    ytcenter.utils.crypt_p = !1;
    ytcenter.utils.crypt_Ej = ytcenter.utils.crypt_h;
    ytcenter.utils.crypt = function(){
      var a;
      if (ytcenter.utils.crypt_Ej == ytcenter.utils.crypt_h && (ytcenter.utils.crypt_Ej = ytcenter.utils.crypt_p, window.crypto && window.crypto.wx))
          try {
              a = new Uint8Array(1), window.crypto.wx(a), ytcenter.utils.crypt_Ej = ytcenter.utils.crypt_l
          } catch (b) {
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
      return c.join("")
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
    ytcenter.utils.mergeObjects = function(){
      var _o = {};
      for (var i = 0; i < arguments.length; i++) {
        if (typeof arguments[i] === "undefined") continue;
        ytcenter.utils.each(arguments[i], function(key, value){
          _o[key] = value;
        });
      }
      return _o;
    };
    ytcenter.utils.cleanClasses = function(elm){
      if (typeof elm === "undefined") return;
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
      if (typeof elm === "undefined") return;
      var classNames = elm.className.split(" "),
          i;
      for (i = 0; i < classNames.length; i++) {
        if (classNames[i] === className) return true;
      }
      return false;
    };
    ytcenter.utils.toggleClass = function(elm, className){
      if (typeof elm === "undefined") return;
      if (ytcenter.utils.hasClass(elm, className)) {
        ytcenter.utils.removeClass(elm, className);
      } else {
        ytcenter.utils.addClass(elm, className);
      }
    };
    ytcenter.utils.addClass = function(elm, className){
      if (typeof elm === "undefined") return;
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
      if (typeof elm === "undefined") return;
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
      if(typeof GM_addStyle !== "undefined") {
        GM_addStyle(styles);
      } else {
        var oStyle = document.createElement("style");
        oStyle.setAttribute("type", "text\/css");
        oStyle.appendChild(document.createTextNode(styles));
        if (document && document.getElementsByTagName("head")[0]) {
          document.getElementsByTagName("head")[0].appendChild(oStyle);
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
    ytcenter.clone = function(obj){
      if (null == obj || "object" != typeof obj) return obj;

      // Handle Date
      if (obj instanceof Date) {
        var copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
      }

      // Handle Array
      if (obj instanceof Array) {
        var copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
          copy[i] = ytcenter.clone(obj[i]);
        }
        return copy;
      }

      // Handle Object
      if (obj instanceof Object) {
        var copy = {};
        for (var attr in obj) {
          if (obj.hasOwnProperty(attr)) copy[attr] = ytcenter.clone(obj[attr]);
        }
        return copy;
      }
      if (obj.toString)
        return obj.toString();
      return;
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
        var guideContainer = document.getElementById("guide-container");
        if (guideContainer) {
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
        }
      },
      checkMutations: function(mutations) {
        mutations.forEach(function(mutation) {
          var addedNodes = mutation.addedNodes;
          for (var index = 0; index < addedNodes.length; ++index) {
            var addedNode = addedNodes[index];
            if (addedNode.id === "guide-container") {
              ytcenter.guide.update();
              break;
            }
          }
        });
      },
      setup: function() {
        if (ytcenter.guide.element === null || ytcenter.guide.element.id !== "guide") {
          ytcenter.guide.element = document.getElementById("guide");
          ytcenter.guide.observer = null;
          ytcenter.guide.update();
        }
        if (!ytcenter.guide.observer) {
          var MutObs = ytcenter.getMutationObserver();
          ytcenter.guide.observer = new MutObs(ytcenter.guide.checkMutations);
        }
        ytcenter.guide.observer.observe(ytcenter.guide.element, { childList: true });
      }
    };
    con.log("Initializing Placement System");
    ytcenter.placementsystem = (function(){
      var database = [];
      var __api;
      var sandboxes = [];
      var old_sandboxes = [];
      var settings;
      var setParentData = function(elm, parent){
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
      };
      var buttonInSettings = function(sig){
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
      };
      var updateList = function(){
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
      };
      var rd = {
        init: function(whitelist, blacklist){
          try {
            settings = ytcenter.settings.buttonPlacementWatch7;
            
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
          for (var i = 0; i < database.length; i++) {
            if (database[i][1] === query) {
              database[i] = [elm, query, []];
              return;
            }
          }
          database.push([elm, query, []]);
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
                  database.push([e, bp[key][i], []]);
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
          var new_parent = elm.parentNode.id;
          var new_next_sibling = elm.nextElementSibling;
          var query = (function(){
            for (var i = 0; i < database.length; i++) {
              if (database[i][0] == elm) {
                return database[i][1];
              }
            }
          })();
          var old_parent;
          var old_index;
          for (var key in settings) {
            if (settings.hasOwnProperty(key)) {
              var quit = false;
              for (var i = 0; i < settings[key].length; i++) {
                if (query == settings[key][i]) {
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
          settings[old_parent].splice(old_index, 1);
          if (new_next_sibling == null) {
            settings[new_parent].push(query);
          } else {
            var new_next_sibling_query = (function(){
              for (var i = 0; i < database.length; i++) {
                if (new_next_sibling == database[i][0]) {
                  return database[i][1];
                }
              }
            })();
            for (var i = 0; i < settings[new_parent].length; i++) {
              if (settings[new_parent][i] == new_next_sibling_query) {
                settings[new_parent].splice(i, 0, query);
                break;
              }
            }
          }
          
          ytcenter.saveSettings();
        },
        move: function(){
          for (var i = 0; i < database.length; i++) {
            if (database[i][0] == null) continue;
            setParentData(database[i][0], database[i][0].parentNode.id);
          }
        },
        clear: function(){
          database = [];
          rd.db = database;
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
      };
      
      return __r;
    })();
    ytcenter.languages = @ant-database-language@;
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
    ytcenter.storage_db = [];
    if (identifier === 3) {
      self.port.on("load callback", function(data){
        data = JSON.parse(data);
        ytcenter.storage_db[data.id](data.storage);
      });
    }
    ytcenter.storageName = "ytcenter_v1.3_settings";
    ytcenter.loadSettings = function(callback){
      try {
        if (identifier === 3) {
          var id = ytcenter.storage_db.length;
          ytcenter.storage_db.push(function(storage){
            con.log("Storage =>");
            con.log(storage);
            if (typeof storage === "string")
              storage = JSON.parse(storage);
            for (var key in storage) {
              if (storage.hasOwnProperty(key)) {
                ytcenter.settings[key] = storage[key];
              }
            }
            if (callback) callback();
          });
          self.port.emit("load", JSON.stringify({id: id, name: ytcenter.storageName}));
        } else if (identifier === 5) {
          var id = ytcenter.storage_db.length;
          ytcenter.storage_db.push(function(storage){
            if (typeof storage === "string")
              storage = JSON.parse(storage);
            for (var key in storage) {
              if (storage.hasOwnProperty(key)) {
                ytcenter.settings[key] = storage[key];
              }
            }
            if (callback) callback();
          });
          opera.extension.postMessage({
            action: 'load',
            id: id,
            name: ytcenter.storageName
          });
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
    con.log("Save Settings initializing");
    ytcenter.saveSettings_timeout_obj;
    ytcenter.saveSettings_timeout = 300;
    ytcenter.saveSettings = function(async, timeout){
      if (typeof timeout === "undefined") timeout = false;
      var __ss = function(){
        con.log("[Storage] Saving Settings");
        if (identifier === 3) {
          self.port.emit("save", JSON.stringify({name: ytcenter.storageName, value: ytcenter.settings}));
        } else if (identifier === 5) {
          opera.extension.postMessage({
            action: 'save',
            name: ytcenter.storageName,
            value: JSON.stringify(ytcenter.settings)
          });
        } else {
          if (typeof async !== "boolean") async = false;
          if (async) {
            uw.postMessage("YouTubeCenter" + JSON.stringify({
              type: "saveSettings"
            }), "http://www.youtube.com");
          } else {
            if (!$SaveData(ytcenter.storageName, JSON.stringify(ytcenter.settings))) {
              con.error("[Settings] Couldn't save settings.");
            }
          }
        }
      };
      try {
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
      }
    };
    con.log("Check for updates initializing");
    ytcenter.checkForUpdates = (function(){
      var updElement;
      return function(success, error){
        // If it's the Chrome/Opera addon and the browser is Opera, or if it's the Firefox addon it will not check for updates!
        if ((@identifier@ === 1 && (uw.navigator.userAgent.indexOf("Opera") !== -1 || uw.navigator.userAgent.indexOf("OPR/") !== -1)) || @identifier@ === 3) {
          con.log("[UpdateChecker] UpdateChecker has been disabled!");
          if (typeof error == "function")
            error();
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
                  if (@identifier@ === 3) {
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
    con.log("default settings initializing");
    ytcenter._settings = {
      settingsDialogMode: true,
      ytExperimentFixedTopbar: false,
      ytspf: true,
      videoThumbnailCacheSize: 75,
      commentCacheSize: 150,
      watchedVideosIndicator: true,
      hideWatchedVideos: false,
      watchedVideos: [],
      watchedVideosLimit: 10000, // Hope this isn't too big.
      gridSubscriptionsPage: true,
      compatibilityCheckerForChromeDisable: false,
      removeRelatedVideosEndscreen: false,
      enableResize: true,
      guideMode: "default", // [default, always_open, always_closed]
      enableYouTubeAutoSwitchToShareTab: false,
      ytExperimentalLayotTopbarStatic: false,
      commentCountryData: [],
      commentCountryEnabled: false,
      commentCountryShowFlag: true,
      commentCountryPosition: "after_username", // ["before_username", "after_username", "last"]
      videoThumbnailData: [],
      videoThumbnailQualityBar: true,
      videoThumbnailQualityPosition: "topleft",
      videoThumbnailQualityDownloadAt: "hover_thumbnail",
      videoThumbnailQualityVisible: "always",
      videoThumbnailRatingsBar: true,
      videoThumbnailRatingsBarPosition: "bottom",
      videoThumbnailRatingsBarDownloadAt: "page_start",
      videoThumbnailRatingsBarVisible: "always",
      videoThumbnailRatingsCount: true,
      videoThumbnailRatingsCountPosition: "bottomleft",
      videoThumbnailRatingsCountDownloadAt: "page_start",
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
      preventPlaylistAutoPlay: false,
      preventPlaylistAutoBuffer: false,
      scrollToPlayer: true,
      expandDescription: false,
      enableAnnotations: false,
      //enableCaptions: true, // %
      enableShortcuts: true,
      autohide: '2',
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
      experimentalFlashMode: 'clone',
      experimentalHTML5Mode: 'none',
      lightbulbEnable: true,
      lightbulbBackgroundColor: '#000000',
      lightbulbBackgroundOpaque: 95,
      flashWMode: 'none', // none, window, direct, opaque, transparent, gpu
      playerTheme: 'dark', // dark, light
      playerColor: 'red', // red, white
      enableUpdateChecker: true,
      updateCheckerInterval: "0",
      updateCheckerLastUpdate: 0,
      enableVolume: true,
      buttonPlacement: {
        'watch-headline-title': ['watch-headline-title&@&//*[@id="eow-title"]'],
        'watch-headline-user-info': ['watch-headline-user-info&@&//*[@id="watch-userbanner"]', 'watch-headline-user-info&@&//*[@id="watch-headline-user-info"]/div', 'watch-headline-user-info&@&//*[@id="watch-headline-user-info"]/span', 'watch-headline-user-info&@&//*[@id="watch-mfu-button"]', '@lightbtn'],
        'watch-actions': ['watch-actions&@&//*[@id="watch-like-unlike"]', 'watch-actions&@&//*[@id="watch-actions"]/button[1]', 'watch-actions&@&//*[@id="watch-share"]', 'watch-actions&@&//*[@id="watch-flag"]', 'watch-actions&@&//*[@id="watch-transcript"]', '@downloadgroup', '@repeatbtn', '@resizebtn', '@aspectbtn']
      },
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
      channel_enableAnnotations: false,
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
      embed_enableAnnotations: false,
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
      lightbulbAutoOff: false,
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
            height: "720px",
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
            height: "1080px",
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
            height: "70%",
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
            height: "80%",
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
            height: "90%",
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
    con.log("Adding mp3services to database");
    ytcenter.mp3services = [
      {
        label: 'SETTINGS_MP3SERVICES_VIDEO2MP3',
        value: 'http://www.video2mp3.net/index.php?url=http%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D{videoid}&hq=0'
      }, {
        label: 'SETTINGS_MP3SERVICES_VIDEO2MP3_HQ',
        value: 'http://www.video2mp3.net/index.php?url=http%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D{videoid}&hq=1'
      }, {
        label: 'SETTINGS_MP3SERVICES_YOUTUBEINAUDIO_64',
        value: 'http://www.youtubeinaudio.com/download.php?youtubeURL=http%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D{videoid}&quality=64&submit=Download+MP3'
      }, {
        label: 'SETTINGS_MP3SERVICES_YOUTUBEINAUDIO_128',
        value: 'http://www.youtubeinaudio.com/download.php?youtubeURL=http%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D{videoid}&quality=128&submit=Download+MP3'
      }, {
        label: 'SETTINGS_MP3SERVICES_YOUTUBEINAUDIO_320',
        value: 'http://www.youtubeinaudio.com/download.php?youtubeURL=http%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D{videoid}&quality=320&submit=Download+MP3'
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
    ytcenter.ui = {};
    try {
    ytcenter.ui.settings = {
      "SETTINGS_TAB_GENERAL": [
        {
          "label": "SETTINGS_LANGUAGE",
          "type": "list",
          "advlist": function(){
            var a = [];
            a.push({
              "label": "LANGUAGE_AUTO",
              "value": "auto"
            });
            for (var key in ytcenter.languages) {
              if (ytcenter.languages.hasOwnProperty(key)) {
                a.push({
                  "value": key,
                  "variable": (function(k){
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
              "event": "change",
              "callback": function(){
                ytcenter.language.update();
              }
            }
          ],
          "defaultSetting": "language",
          "help": "https://github.com/YePpHa/YouTubeCenter/wiki/Features#multiple-languages"
        }, {
          "label": "SETTINGS_DIALOG_MODE",
          "type": "bool",
          "defaultSetting": "settingsDialogMode",
          "help": "https://github.com/YePpHa/YouTubeCenter/wiki/Features#settings-dialog-mode"
        }, {
          "label": "SETTINGS_WATCH7_CENTERPAGE",
          "type": "bool",
          "defaultSetting": "watch7centerpage",
          "listeners": [
            {
              "event": "click",
              "callback": function(){
                ytcenter.events.performEvent("ui-refresh");
                ytcenter.classManagement.applyClasses();
              }
            }
          ],
          "help": "https://github.com/YePpHa/YouTubeCenter/wiki/Features#centering-page"
        }, {
          "label": "SETTINGS_REMOVEADVERTISEMENTS_LABEL",
          "type": "bool",
          "defaultSetting": "removeAdvertisements",
          "help": "https://github.com/YePpHa/YouTubeCenter/wiki/Features#remove-advertisements"
        }, {
          "label": "SETTINGS_AUTOEXPANDDESCRIPTION_LABEL",
          "type": "bool",
          "defaultSetting": "expandDescription"
        }, {
          "label": "SETTINGS_ENABLESHORTCUTS_LABEL",
          "type": "bool",
          "defaultSetting": "enableShortcuts"
        }, {
          "label": "SETTINGS_FLEXWIDTHONPAGE_LABEL",
          "type": "bool",
          "defaultSetting": "flexWidthOnPage",
          "listeners": [
            {
              "event": "click",
              "callback": function(){
                ytcenter.classManagement.applyClasses();
              }
            }
          ],
          "help": "https://github.com/YePpHa/YouTubeCenter/wiki/Features#flex-width-on-page"
        }, {
          "label": "SETTINGS_YTSPF",
          "type": "bool",
          "defaultSetting": "ytspf",
          "help": "https://github.com/YePpHa/YouTubeCenter/wiki/Features#spf"
        }, {
          "label": "SETTINGS_YTEXPERIMENTALLAYOUT_TOPBAR_STATIC",
          "type": "bool",
          "defaultSetting": "ytExperimentalLayotTopbarStatic",
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
          ],
          "help": "https://github.com/YePpHa/YouTubeCenter/wiki/Features#set-experimental-topbar-to-static"
        }, {
          "label": "SETTINGS_GRIDSUBSCRIPTIONS",
          "type": "bool",
          "listeners": [
            {
              "event": "click",
              "callback": function(){
                ytcenter.classManagement.applyClasses();
              }
            }
          ],
          "defaultSetting": "gridSubscriptionsPage"
        }, {
          "type": "horizontalRule"
        }, {
          "label": "SETTINGS_WATCHEDVIDEOS_INDICATOR",
          "type": "bool",
          "defaultSetting": "watchedVideosIndicator"
        }, {
          "label": "SETTINGS_HIDEWATCHEDVIDEOS",
          "type": "bool",
          "listeners": [
            {
              "event": "click",
              "callback": function(){
                ytcenter.classManagement.applyClasses();
              }
            }
          ],
          "defaultSetting": "hideWatchedVideos"
        }, {
          "text": "SETTINGS_WATCHEDVIDEOS_CLEAN_VIDEO_HISTORY",
          "type": "button",
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
                      ytcenter.saveSettings();
                      loc.reload();
                      dialog.setVisibility(false);
                    }
                  }
                ]);
                dialog.setVisibility(true);
              }
            }
          ]
        }, {
          "type": "horizontalRule"
        }, {
          "label": "SETTINGS_COMMENTS_COUNTRY_ENABLE",
          "type": "bool",
          "defaultSetting": "commentCountryEnabled",
          "help": "https://github.com/YePpHa/YouTubeCenter/wiki/Features#country-for-comments"
        }, {
          "label": "SETTINGS_COMMENTS_COUNTRY_SHOW_FLAG",
          "type": "bool",
          "defaultSetting": "commentCountryShowFlag"
        }, {
          "label": "SETTINGS_COMMENTS_COUNTRY_POSITION",
          "type": "list",
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
          ],
          "defaultSetting": "commentCountryPosition"
        }, {
          "type": "import/export settings"
        }, {
          "text": "SETTINGS_RESETSETTINGS_LABEL",
          "type": "button",
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
                      loc.reload();
                      dialog.setVisibility(false);
                    }
                  }
                ]);
                dialog.setVisibility(true);
              }
            }
          ]
        }
      ],
      "SETTINGS_TAB_WATCH": [
        {
          "label": "SETTINGS_REMOVE_RELATED_VIDEOS_ENDSCREEN",
          "type": "bool",
          "defaultSetting": "removeRelatedVideosEndscreen",
          "help": "https://github.com/YePpHa/YouTubeCenter/wiki/Features#remove-endscreen"
        }, {
          "label": "SETTINGS_AUTO_SWITCH_TO_SHARE_TAB",
          "type": "bool",
          "listeners": [
            {
              "event": "change",
              "callback": function(){
                ytcenter.player.setYTConfig({"SHARE_ON_VIDEO_END": ytcenter.settings.enableYouTubeAutoSwitchToShareTab});
              }
            }
          ],
          "defaultSetting": "enableYouTubeAutoSwitchToShareTab",
          "help": "https://github.com/YePpHa/YouTubeCenter/wiki/Features#switch-to-share-tab-at-end-of-video"
        }, {
          "label": "SETTINGS_GUIDEMODE",
          "type": "list",
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
          ],
          "defaultSetting": "guideMode",
          "help": "https://github.com/YePpHa/YouTubeCenter/wiki/Features#guide-mode"
        }, {
          "label": "SETTINGS_GUIDE_ALWAYS_HIDE",
          "type": "bool",
          "listeners": [
            {
              "event": "click",
              "callback": function(){
                ytcenter.guide.hidden = ytcenter.settings.watch7playerguidealwayshide;
                ytcenter.guide.update();
                ytcenter.player._updateResize();
              }
            }
          ],
          "defaultSetting": "watch7playerguidealwayshide"
        }, {
          "label": "SETTINGS_WATCH7_PLAYER_GUIDE_HIDE",
          "type": "bool",
          "listeners": [
            {
              "event": "click",
              "callback": function(){
                ytcenter.player._updateResize();
              }
            }
          ],
          "defaultSetting": "watch7playerguidehide"
        }, {
          "label": "SETTINGS_DASHPLAYBACK",
          "type": "bool",
          "defaultSetting": "dashPlayback",
          "help": "https://github.com/YePpHa/YouTubeCenter/wiki/Features#dash-playback"
        }, {
          "label": "SETTINGS_AUTOHIDECONTROLBAR_LABEL",
          "type": "list",
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
              "event": "change",
              "callback": function(){
                if (ytcenter.page === "watch") {
                  ytcenter.player.setAutoHide(ytcenter.settings.autohide);
                }
              }
            }
          ],
          "defaultSetting": "autohide",
          "help": "https://github.com/YePpHa/YouTubeCenter/wiki/Features#auto-hide-bar"
        }, {
          "label": "SETTINGS_PLAYERTHEME_LABEL",
          "type": "list",
          "list": [
            {
              "value": "dark",
              "label": "SETTINGS_PLAYERTHEME_DARK"
            }, {
              "value": "light",
              "label": "SETTINGS_PLAYERTHEME_LIGHT"
            }
          ],
          "defaultSetting": "playerTheme",
          "listeners": [
            {
              "event": "change",
              "callback": function(){
                if (ytcenter.page === "watch") {
                  ytcenter.player.setTheme(ytcenter.settings.playerTheme);
                }
              }
            }
          ],
          "help": "https://github.com/YePpHa/YouTubeCenter/wiki/Features#player-theme"
        }, {
          "label": "SETTINGS_PLAYERCOLOR_LABEL",
          "type": "list",
          "list": [
            {
              "value": "red",
              "label": "SETTINGS_PLAYERCOLOR_RED"
            }, {
              "value": "white",
              "label": "SETTINGS_PLAYERCOLOR_WHITE"
            }
          ],
          "defaultSetting": "playerColor",
          "listeners": [
            {
              "event": "change",
              "callback": function(){
                if (ytcenter.page === "watch") {
                  ytcenter.player.setProgressColor(ytcenter.settings.playerColor);
                }
              }
            }
          ],
          "help": "https://github.com/YePpHa/YouTubeCenter/wiki/Features#player-color"
        }/*, {
"label": "SETTINGS_PLAYERBGCOLOR_LABEL",
"type": "bgcolorlist",
"defaultSetting": "bgcolor"
}*/, {
          "label": "SETTINGS_WMODE_LABEL",
          "type": "list",
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
          ],
          "defaultSetting": "flashWMode",
          "help": "https://github.com/YePpHa/YouTubeCenter/wiki/Features#flash-wmode"
        }, {
          "label": "SETTINGS_ENABLEANNOTATIONS_LABEL",
          "type": "bool",
          "defaultSetting": "enableAnnotations",
          "help": "https://github.com/YePpHa/YouTubeCenter/wiki/Features#annotations"
        }, {
          "label": "SETTINGS_SCROLLTOPLAYER_LABEL",
          "type": "bool",
          "defaultSetting": "scrollToPlayer",
          "help": "https://github.com/YePpHa/YouTubeCenter/wiki/Features#scroll-to-player"
        }, {
          "type": "horizontalRule"
        }, {
          "label": "SETTINGS_ENABLEAUTORESOLUTION_LABEL",
          "type": "bool",
          "defaultSetting": "enableAutoVideoQuality",
          "help": "https://github.com/YePpHa/YouTubeCenter/wiki/Features#auto-resolution"
        }, {
          "label": "SETTINGS_AUTORESOLUTION_LABEL",
          "type": "list",
          "list": [
            {
              "value": "highres",
              "label": "SETTINGS_HIGHRES"
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
          "defaultSetting": "autoVideoQuality"
        }, {
          "type": "horizontalRule"
        }, {
          "label": "SETTINGS_BRANDING_BANNER_REMOVE",
          "type": "bool",
          "listeners": [
            {
              "event": "click",
              "callback": function(){
                ytcenter.events.performEvent("ui-refresh");
              }
            }
          ],
          "defaultSetting": "removeBrandingBanner",
          "help": "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Remove_Branding_BannerBackgroundWatermark"
        }, {
          "label": "SETTINGS_BRANDING_BACKGROUND_REMOVE",
          "type": "bool",
          "listeners": [
            {
              "event": "click",
              "callback": function(){
                ytcenter.events.performEvent("ui-refresh");
              }
            }
          ],
          "defaultSetting": "removeBrandingBackground",
          "help": "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Remove_Branding_BannerBackgroundWatermark"
        }, {
          "label": "SETTINGS_BRANDING_WATERMARK_REMOVE",
          "type": "bool",
          "listeners": [
            {
              "event": "click",
              "callback": function(){
                ytcenter.events.performEvent("ui-refresh");
              }
            }
          ],
          "defaultSetting": "removeBrandingWatermark",
          "help": "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Remove_Branding_BannerBackgroundWatermark"
        }, {
          "type": "horizontalRule"
        }, {
          "label": "SETTINGS_PREVENTAUTOPLAY_LABEL",
          "type": "bool",
          "defaultSetting": "preventAutoPlay",
          "help": "https://github.com/YePpHa/YouTubeCenter/wiki/Features#prevent-auto-play"
        }, {
          "label": "SETTINGS_PREVENTAUTOBUFFERING_LABEL",
          "type": "bool",
          "defaultSetting": "preventAutoBuffer",
          "help": "https://github.com/YePpHa/YouTubeCenter/wiki/Features#prevent-auto-buffering"
        }, {
          "type": "horizontalRule"
        }, {
          "label": "SETTINGS_PLAYLIST_PREVENT_AUTOPLAY",
          "type": "bool",
          "defaultSetting": "preventPlaylistAutoPlay",
          "help": "https://github.com/YePpHa/YouTubeCenter/wiki/Features#prevent-playlist-auto-play"
        }, {
          "label": "SETTINGS_PLAYLIST_PREVENT_AUTOBUFFERING",
          "type": "bool",
          "defaultSetting": "preventPlaylistAutoBuffer",
          "help": "https://github.com/YePpHa/YouTubeCenter/wiki/Features#prevent-playlist-auto-buffering"
        /*}, {
"label": "SETTINGS_PREVENTTABAUTOPLAY_LABEL",
"type": "bool",
"defaultSetting": "preventTabAutoPlay"
}, {
"label": "SETTINGS_PREVENTTABAUTOBUFFERING_LABEL",
"type": "bool",
"defaultSetting": "preventTabAutoBuffer"*/
        }, {
          "type": "horizontalRule"
        }, {
          "label": "SETTINGS_VOLUME_ENABLE",
          "type": "bool",
          "defaultSetting": "enableVolume",
          "help": "https://github.com/YePpHa/YouTubeCenter/wiki/Features#volume-control"
        }, {
          "label": "SETTINGS_VOLUME_LABEL",
          "type": "range",
          "minRange": 0,
          "maxRange": 100,
          "defaultSetting": "volume"
        }, {
          "label": "SETTINGS_MUTE_LABEL",
          "type": "bool",
          "defaultSetting": "mute"
        }, {
          "type": "horizontalRule"
        }, {
          "label": "SETTINGS_LIGHTBULB_AUTO",
          "type": "bool",
          "defaultSetting": "lightbulbAutoOff",
          "help": "https://github.com/YePpHa/YouTubeCenter/wiki/Features#lights-off"
        }, {
          "label": "SETTINGS_LIGHTBULB_COLOR",
          "type": "colorpicker",
          "defaultSetting": "lightbulbBackgroundColor"
        }, {
          "label": "SETTINGS_LIGHTBULB_TRANSPARENCY",
          "type": "range",
          "minRange": 0,
          "maxRange": 100,
          "defaultSetting": "lightbulbBackgroundOpaque"
        }
      ],
      "SETTINGS_TAB_CHANNEL": [
        {
          "label": "SETTINGS_AUTOHIDECONTROLBAR_LABEL",
          "type": "list",
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
              "event": "change",
              "callback": function(){
                if (ytcenter.page === "channel") {
                  ytcenter.player.setAutoHide(ytcenter.settings.channel_autohide);
                }
              }
            }
          ],
          "defaultSetting": "channel_autohide"
        }, {
          "label": "SETTINGS_DASHPLAYBACK",
          "type": "bool",
          "defaultSetting": "channel_dashPlayback",
          "help": "https://github.com/YePpHa/YouTubeCenter/wiki/Features#dash-playback"
        }, {
          "label": "SETTINGS_PLAYERTHEME_LABEL",
          "type": "list",
          "list": [
            {
              "value": "dark",
              "label": "SETTINGS_PLAYERTHEME_DARK"
            }, {
              "value": "light",
              "label": "SETTINGS_PLAYERTHEME_LIGHT"
            }
          ],
          "defaultSetting": "channel_playerTheme",
          "listeners": [
            {
              "event": "change",
              "callback": function(){
                if (ytcenter.page === "channel") {
                  ytcenter.player.setTheme(ytcenter.settings.channel_playerTheme);
                }
              }
            }
          ]
        }, {
          "label": "SETTINGS_PLAYERCOLOR_LABEL",
          "type": "list",
          "list": [
            {
              "value": "red",
              "label": "SETTINGS_PLAYERCOLOR_RED"
            }, {
              "value": "white",
              "label": "SETTINGS_PLAYERCOLOR_WHITE"
            }
          ],
          "defaultSetting": "channel_playerColor",
          "listeners": [
            {
              "event": "change",
              "callback": function(){
                if (ytcenter.page === "channel") {
                  ytcenter.player.setProgressColor(ytcenter.settings.channel_playerColor);
                }
              }
            }
          ]
        }, {
          "label": "SETTINGS_WMODE_LABEL",
          "type": "list",
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
          ],
          "defaultSetting": "channel_flashWMode"
        }, {
          "label": "SETTINGS_ENABLEANNOTATIONS_LABEL",
          "type": "bool",
          "defaultSetting": "channel_enableAnnotations"
        }, {
          "type": "horizontalRule"
        }, {
          "label": "SETTINGS_ENABLEAUTORESOLUTION_LABEL",
          "type": "bool",
          "defaultSetting": "channel_enableAutoVideoQuality"
        }, {
          "label": "SETTINGS_AUTORESOLUTION_LABEL",
          "type": "list",
          "list": [
            {
              "value": "highres",
              "label": "SETTINGS_HIGHRES"
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
          "defaultSetting": "channel_autoVideoQuality"
        }, {
          "type": "horizontalRule"
        }, {
          "label": "SETTINGS_PREVENTAUTOPLAY_LABEL",
          "type": "bool",
          "defaultSetting": "channel_preventAutoPlay"
        }, {
          "label": "SETTINGS_PREVENTAUTOBUFFERING_LABEL",
          "type": "bool",
          "defaultSetting": "channel_preventAutoBuffer"
        }, {
          "type": "horizontalRule"
        }, {
          "label": "SETTINGS_VOLUME_ENABLE",
          "type": "bool",
          "defaultSetting": "channel_enableVolume"
        }, {
          "label": "SETTINGS_VOLUME_LABEL",
          "type": "range",
          "minRange": 0,
          "maxRange": 100,
          "defaultSetting": "channel_volume"
        }, {
          "label": "SETTINGS_MUTE_LABEL",
          "type": "bool",
          "defaultSetting": "channel_mute"
        }
      ],
      "SETTINGS_TAB_EMBED": [
        {
          "label": "SETTINGS_EMBEDS_ENABLE",
          "type": "bool",
          "defaultSetting": "embed_enabled"
        }, {
          "label": "SETTINGS_DASHPLAYBACK",
          "type": "bool",
          "defaultSetting": "embed_dashPlayback",
          "help": "https://github.com/YePpHa/YouTubeCenter/wiki/Features#dash-playback"
        }, {
          "label": "SETTINGS_AUTOHIDECONTROLBAR_LABEL",
          "type": "list",
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
              "event": "change",
              "callback": function(){
                if (ytcenter.page === "embed") {
                  ytcenter.player.setAutoHide(ytcenter.settings.embed_autohide);
                }
              }
            }
          ],
          "defaultSetting": "embed_autohide"
        }, {
          "label": "SETTINGS_PLAYERTHEME_LABEL",
          "type": "list",
          "list": [
            {
              "value": "dark",
              "label": "SETTINGS_PLAYERTHEME_DARK"
            }, {
              "value": "light",
              "label": "SETTINGS_PLAYERTHEME_LIGHT"
            }
          ],
          "defaultSetting": "embed_playerTheme",
          "listeners": [
            {
              "event": "change",
              "callback": function(){
                if (ytcenter.page === "embed") {
                  ytcenter.player.setTheme(ytcenter.settings.embed_playerTheme);
                }
              }
            }
          ]
        }, {
          "label": "SETTINGS_PLAYERCOLOR_LABEL",
          "type": "list",
          "list": [
            {
              "value": "red",
              "label": "SETTINGS_PLAYERCOLOR_RED"
            }, {
              "value": "white",
              "label": "SETTINGS_PLAYERCOLOR_WHITE"
            }
          ],
          "defaultSetting": "embed_playerColor",
          "listeners": [
            {
              "event": "change",
              "callback": function(){
                if (ytcenter.page === "channel") {
                  ytcenter.player.setProgressColor(ytcenter.settings.embed_playerColor);
                }
              }
            }
          ]
        }, {
          "label": "SETTINGS_WMODE_LABEL",
          "type": "list",
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
          ],
          "defaultSetting": "embed_flashWMode"
        }, {
          "label": "SETTINGS_ENABLEANNOTATIONS_LABEL",
          "type": "bool",
          "defaultSetting": "embed_enableAnnotations"
        }, {
          "type": "horizontalRule"
        }, {
          "label": "SETTINGS_ENABLEAUTORESOLUTION_LABEL",
          "type": "bool",
          "defaultSetting": "embed_enableAutoVideoQuality"
        }, {
          "label": "SETTINGS_AUTORESOLUTION_LABEL",
          "type": "list",
          "list": [
            {
              "value": "highres",
              "label": "SETTINGS_HIGHRES"
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
          "defaultSetting": "embed_autoVideoQuality"
        }, {
          "type": "horizontalRule"
        }, {
          "label": "SETTINGS_PREVENTAUTOPLAY_LABEL",
          "type": "bool",
          "defaultSetting": "embed_preventAutoPlay"
        }, {
          "label": "SETTINGS_PREVENTAUTOBUFFERING_LABEL",
          "type": "bool",
          "defaultSetting": "embed_preventAutoBuffer"
        }, {
          "type": "horizontalRule"
        }, {
          "label": "SETTINGS_VOLUME_ENABLE",
          "type": "bool",
          "defaultSetting": "embed_enableVolume"
        }, {
          "label": "SETTINGS_VOLUME_LABEL",
          "type": "range",
          "minRange": 0,
          "maxRange": 100,
          "defaultSetting": "embed_volume"
        }, {
          "label": "SETTINGS_MUTE_LABEL",
          "type": "bool",
          "defaultSetting": "embed_mute"
        }
      ],
      "SETTINGS_TAB_VIDEOTHUMBNAIL": [
        {
          "type": "textContent",
          "textlocale": "SETTINGS_THUMBVIDEO_QUALITY",
          "style": {
            "fontWeight": "bold"
          }
        }, {
          "label": "SETTINGS_THUMBVIDEO_QUALITY_ENABLE",
          "type": "bool",
          "defaultSetting": "videoThumbnailQualityBar",
          "style": {
            "marginLeft": "12px"
          },
          "help": "https://github.com/YePpHa/YouTubeCenter/wiki/Features#quality"
        }, {
          "label": "SETTINGS_THUMBVIDEO_POSITION",
          "type": "list",
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
          "defaultSetting": "videoThumbnailQualityPosition",
          "style": {
            "marginLeft": "12px"
          }
        }, {
          "label": "SETTINGS_THUMBVIDEO_DOWNLOAD",
          "type": "list",
          "list": [
            {
              "value": "page_start",
              "label": "SETTINGS_THUMBVIDEO_DOWNLOAD_ONSTART"
            }, {
              "value": "hover_thumbnail",
              "label": "SETTINGS_THUMBVIDEO_DOWNLOAD_ONHOVER"
            }
          ],
          "defaultSetting": "videoThumbnailQualityDownloadAt",
          "style": {
            "marginLeft": "12px"
          }
        }, {
          "label": "SETTINGS_THUMBVIDEO_VISIBLE",
          "type": "list",
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
          "defaultSetting": "videoThumbnailQualityVisible",
          "style": {
            "marginLeft": "12px"
          }
        }, {
          "type": "textContent",
          "textlocale": "SETTINGS_THUMBVIDEO_RATING_BAR",
          "style": {
            "fontWeight": "bold"
          }
        }, {
          "label": "SETTINGS_THUMBVIDEO_RATING_BAR_ENABLE",
          "type": "bool",
          "defaultSetting": "videoThumbnailRatingsBar",
          "style": {
            "marginLeft": "12px"
          },
          "help": "https://github.com/YePpHa/YouTubeCenter/wiki/Features#rating-bar"
        }, {
          "label": "SETTINGS_THUMBVIDEO_POSITION",
          "type": "list",
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
          "defaultSetting": "videoThumbnailRatingsBarPosition",
          "style": {
            "marginLeft": "12px"
          }
        }, {
          "label": "SETTINGS_THUMBVIDEO_DOWNLOAD",
          "type": "list",
          "list": [
            {
              "value": "page_start",
              "label": "SETTINGS_THUMBVIDEO_DOWNLOAD_ONSTART"
            }, {
              "value": "hover_thumbnail",
              "label": "SETTINGS_THUMBVIDEO_DOWNLOAD_ONHOVER"
            }
          ],
          "defaultSetting": "videoThumbnailRatingsBarDownloadAt",
          "style": {
            "marginLeft": "12px"
          }
        }, {
          "label": "SETTINGS_THUMBVIDEO_VISIBLE",
          "type": "list",
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
          "defaultSetting": "videoThumbnailRatingsBarVisible",
          "style": {
            "marginLeft": "12px"
          }
        }, {
          "type": "textContent",
          "textlocale": "SETTINGS_THUMBVIDEO_RATING_COUNT",
          "style": {
            "fontWeight": "bold"
          }
        }, {
          "label": "SETTINGS_THUMBVIDEO_RATING_COUNT_ENABLE",
          "type": "bool",
          "defaultSetting": "videoThumbnailRatingsCount",
          "style": {
            "marginLeft": "12px"
          },
          "help": "https://github.com/YePpHa/YouTubeCenter/wiki/Features#rating-count"
        }, {
          "label": "SETTINGS_THUMBVIDEO_POSITION",
          "type": "list",
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
          "defaultSetting": "videoThumbnailRatingsCountPosition",
          "style": {
            "marginLeft": "12px"
          }
        }, {
          "label": "SETTINGS_THUMBVIDEO_DOWNLOAD",
          "type": "list",
          "list": [
            {
              "value": "page_start",
              "label": "SETTINGS_THUMBVIDEO_DOWNLOAD_ONSTART"
            }, {
              "value": "hover_thumbnail",
              "label": "SETTINGS_THUMBVIDEO_DOWNLOAD_ONHOVER"
            }
          ],
          "defaultSetting": "videoThumbnailRatingsCountDownloadAt",
          "style": {
            "marginLeft": "12px"
          }
        }, {
          "label": "SETTINGS_THUMBVIDEO_VISIBLE",
          "type": "list",
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
          "defaultSetting": "videoThumbnailRatingsCountVisible",
          "style": {
            "marginLeft": "12px"
          }
        }, {
          "type": "textContent",
          "textlocale": "SETTINGS_THUMBVIDEO_WATCH_LATER",
          "style": {
            "fontWeight": "bold"
          }
        }, {
          "label": "SETTINGS_THUMBVIDEO_POSITION",
          "type": "list",
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
          "defaultSetting": "videoThumbnailWatchLaterPosition",
          "style": {
            "marginLeft": "12px"
          }
        }, {
          "label": "SETTINGS_THUMBVIDEO_VISIBLE",
          "type": "list",
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
          "defaultSetting": "videoThumbnailWatchLaterVisible",
          "style": {
            "marginLeft": "12px"
          }
        }, {
          "type": "textContent",
          "textlocale": "SETTINGS_THUMBVIDEO_TIME_CODE",
          "style": {
            "fontWeight": "bold"
          }
        }, {
          "label": "SETTINGS_THUMBVIDEO_POSITION",
          "type": "list",
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
          "defaultSetting": "videoThumbnailTimeCodePosition",
          "style": {
            "marginLeft": "12px"
          }
        }, {
          "label": "SETTINGS_THUMBVIDEO_VISIBLE",
          "type": "list",
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
          "defaultSetting": "videoThumbnailTimeCodeVisible",
          "style": {
            "marginLeft": "12px"
          }
        }
      ],
      "SETTINGS_TAB_PLACEMENT": [
        {
          "label": "SETTINGS_ENABLEDOWNLOAD_LABEL",
          "type": "bool",
          "listeners": [
            {
              "event": "click",
              "callback": function(){
                ytcenter.events.performEvent("ui-refresh");
              }
            }
          ],
          "defaultSetting": "enableDownload",
          "help": "https://github.com/YePpHa/YouTubeCenter/wiki/Features#placement"
        }, {
          "label": "SETTINGS_ENABLEREPEAT_LABEL",
          "type": "bool",
          "listeners": [
            {
              "event": "click",
              "callback": function(){
                ytcenter.events.performEvent("ui-refresh");
              }
            }
          ],
          "defaultSetting": "enableRepeat",
          "help": "https://github.com/YePpHa/YouTubeCenter/wiki/Features#placement"
        }, {
          "label": "SETTINGS_LIGHTBULB_ENABLE",
          "type": "bool",
          "listeners": [
            {
              "event": "click",
              "callback": function(){
                ytcenter.events.performEvent("ui-refresh");
              }
            }
          ],
          "defaultSetting": "lightbulbEnable",
          "help": "https://github.com/YePpHa/YouTubeCenter/wiki/Features#placement"
        }, {
          "label": "SETTINGS_RESIZE_ENABLE",
          "type": "bool",
          "listeners": [
            {
              "event": "click",
              "callback": function(){
                ytcenter.events.performEvent("ui-refresh");
              }
            }
          ],
          "defaultSetting": "resizeEnable",
          "help": "https://github.com/YePpHa/YouTubeCenter/wiki/Features#placement"
        }, {
          "label": "SETTINGS_ASPECT_ENABLE",
          "type": "bool",
          "listeners": [
            {
              "event": "click",
              "callback": function(){
                ytcenter.events.performEvent("ui-refresh");
              }
            }
          ],
          "defaultSetting": "aspectEnable",
          "help": "https://github.com/YePpHa/YouTubeCenter/wiki/Features#placement"
        }, {
          "type": "newline",
          "style": {
            "display": (loc.href.match(/^(http|https)\:\/\/(.*?)\.youtube\.com\/watch\?/) ? "block" : "none")
          }
        }, {
          "text": "SETTINGS_PLACEMENTSYSTEM_MOVEELEMENTS_LABEL",
          "style": {
            "display": (loc.href.match(/^(http|https)\:\/\/(.*?)\.youtube\.com\/watch\?/) ? "block" : "none")
          },
          "type": "button",
          "listeners": [
            {
              "event": "click",
              "callback": function(){
                try {
                  if (ytcenter.placementsystem.toggleEnable()) {
                    ytcenter.utils.addClass(this, "yt-uix-button-toggled");
                  } else {
                    ytcenter.utils.removeClass(this, "yt-uix-button-toggled");
                  }
                } catch (e) {
                  con.error(e);
                }
              }
            }
          ]
        }, {
          "type": "textContent",
          "textlocale": "SETTINGS_PLACEMENTSYSTEM_MOVEELEMENTS_INSTRUCTIONS",
          "style": {
            "marginLeft": "20px",
            "display": (loc.href.match(/^(http|https)\:\/\/(.*?)\.youtube\.com\/watch\?/) ? "block" : "none")
          }
        }
      ],
      "SETTINGS_TAB_RESIZE": [
        {
          "label": "SETTINGS_RESIZE_FEATURE_ENABLE",
          "type": "bool",
          "defaultSetting": "enableResize"
        }, {
          "label": "SETTINGS_RESIZE_DEFAULT",
          "type": "defaultplayersizedropdown",
          "bind": "resize-playersizes",
          "defaultSetting": "resize-default-playersize",
          "help": "https://github.com/YePpHa/YouTubeCenter/wiki/Features#default-player-size"
        }, {
          "label": "SETTINGS_RESIZE_SMALL_BUTTON",
          "type": "resizedropdown",
          "bind": "resize-playersizes",
          "defaultSetting": "resize-small-button",
          "help": "https://github.com/YePpHa/YouTubeCenter/wiki/Features#small-resize-button"
        }, {
          "label": "SETTINGS_RESIZE_LARGE_BUTTON",
          "type": "resizedropdown",
          "bind": "resize-playersizes",
          "defaultSetting": "resize-large-button",
          "help": "https://github.com/YePpHa/YouTubeCenter/wiki/Features#large-resize-button"
        }, {
          "label": "SETTINGS_RESIZE_LIST",
          "help": "https://github.com/YePpHa/YouTubeCenter/wiki/Features#player-size-editor"
        }, {
          "type": "resizeItemList",
          "defaultSetting": "resize-playersizes"
        }
      ],
      "SETTINGS_TAB_DOWNLOAD": [
        {
          "label": "SETTINGS_DOWNLOADQUALITY_LABEL",
          "type": "list",
          "list": [
            {
              "value": "highres",
              "label": "SETTINGS_HIGHRES"
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
              "event": "change",
              "callback": function(){
                ytcenter.events.performEvent("ui-refresh");
              }
            }
          ],
          "defaultSetting": "downloadQuality",
          "help": "https://github.com/YePpHa/YouTubeCenter/wiki/Features#quality-1"
        }, {
          "label": "SETTINGS_DOWNLOADFORMAT_LABEL",
          "type": "list",
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
              "event": "change",
              "callback": function(){
                ytcenter.events.performEvent("ui-refresh");
              }
            }
          ],
          "defaultSetting": "downloadFormat",
          "help": "https://github.com/YePpHa/YouTubeCenter/wiki/Features#format"
        }, {
          "label": "SETTINGS_DOWNLOADASLINKS_LABEL",
          "type": "bool",
          "listeners": [
            {
              "event": "click",
              "callback": function(){
                ytcenter.events.performEvent("ui-refresh");
              }
            }
          ],
          "defaultSetting": "downloadAsLinks",
          "help": "https://github.com/YePpHa/YouTubeCenter/wiki/Features#download-as-links"
        }, {
          "label": "SETTINGS_SHOW3DINDOWNLOADMENU_LABEL",
          "type": "bool",
          "listeners": [
            {
              "event": "click",
              "callback": function(){
                ytcenter.events.performEvent("ui-refresh");
              }
            }
          ],
          "defaultSetting": "show3DInDownloadMenu",
          "help": "https://github.com/YePpHa/YouTubeCenter/wiki/Features#show-3d-in-download-menu"
        }, {
          "label": "SETTINGS_FILENAME_LABEL",
          "type": "text",
          "listeners": [
            {
              "event": "change",
              "callback": function(){
                ytcenter.events.performEvent("ui-refresh");
              }
            }
          ],
          "defaultSetting": "filename",
          "help": "https://github.com/YePpHa/YouTubeCenter/wiki/Features#filename"
        }, {
          "label": "SETTINGS_FIXDOWNLOADFILENAME_LABEL",
          "type": "bool",
          "listeners": [
            {
              "event": "click",
              "callback": function(){
                ytcenter.events.performEvent("ui-refresh");
              }
            }
          ],
          "defaultSetting": "fixfilename",
          "help": "https://github.com/YePpHa/YouTubeCenter/wiki/Features#remove-non-alphanumeric-characters"
        }, {
          "label": "SETTINGS_MP3SERVICES_LABEL",
          "type": "multi",
          "multi": ytcenter.mp3services,
          "listeners": [
            {
              "event": "click",
              "callback": function(){
                ytcenter.events.performEvent("ui-refresh");
              }
            }
          ],
          "defaultSetting": "mp3Services",
          "help": "https://github.com/YePpHa/YouTubeCenter/wiki/Features#mp3-services"
        }
      ],
      "SETTINGS_TAB_REPEAT": [
        {
          "label": "SETTINGS_AUTOACTIVATEREPEAT_LABEL",
          "type": "bool",
          "defaultSetting": "autoActivateRepeat",
          "help": "https://github.com/YePpHa/YouTubeCenter/wiki/Features#auto-activate-repeat"
        }, {
          "label": "SETTINGS_REPEAT_SHOW_ICON",
          "type": "bool",
          "listeners": [
            {
              "event": "click",
              "callback": function(){
                ytcenter.events.performEvent("ui-refresh");
              }
            }
          ],
          "defaultSetting": "repeatShowIcon",
          "help": "https://github.com/YePpHa/YouTubeCenter/wiki/Features#show-icon"
        }
      ],
      "SETTINGS_TAB_UPDATE": [
        {
          "label": "SETTINGS_UPDATE_ENABLE",
          "type": "bool",
          "defaultSetting": "enableUpdateChecker",
          "help": "https://github.com/YePpHa/YouTubeCenter/wiki/Features#enable-update-checker"
        }, {
          "label": "SETTINGS_UPDATE_INTERVAL",
          "type": "list",
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
          ],
          "defaultSetting": "updateCheckerInterval",
          "help": "https://github.com/YePpHa/YouTubeCenter/wiki/Features#update-interval"
        }, {
          "type": "button",
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
                })(this));
              }
            }
          ]
        }
      ],
      "SETTINGS_TAB_DEBUG": [
        {
          "type": "textarea",
          "style": {
            "width": "985px",
            "height": "270px"
          },
          "load": function(){
            con.log("Loading debug text...");
            this.textContent = (function(){
              return ytcenter.debug();
            })();
          }
        }, {
          "type": "button",
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
                      "api_paste_code=" + encodeURIComponent(ytcenter.debug())
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
      ],
      "SETTINGS_TAB_ABOUT": [
        {
          "type": "aboutText"
        }, {
          "type": "link",
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
        }, {
          "type": "translators",
          "titleLocale": "SETTINGS_ABOUT_TRANSLATORS",
          "translators": {
            "ar-bh": [
              {name: "alihill381"}
            ],
            "ca": [
              {name: "Joan Alemany"},
              {name: "Raül Cambeiro"}
            ],
            "da": [],
            "de": [
              {name: "Simon Artmann"},
              {name: "Sven \"Hidden\" W"}
            ],
            "en": [],
            "es": [
              {name: "Roxz"}
            ],
            "fa-IR": [],
            "fr": [
              {name: "ThePoivron", url: "http://www.twitter.com/ThePoivron"}
            ],
            "he": [
              {name: "baryoni"}
            ],
            "hu": [
              {name: "Eugenox"},
              {name: "Mateus"}
            ],
            "it": [
              {name: "Pietro De Nicolao"}
            ],
            "jp": [
              {name: "Lightning-Natto"}
            ],
            "nl": [],
            "pl": [
              {name: "Piotr"},
              {name: "kasper93"}
            ],
            "pt-BR": [
              {name: "Thiago R. M. Pereira"},
              {name: "José Junior"}
            ],
            "pt-PT": [
              {name: "Rafael Damasceno", url: "http://userscripts.org/users/264457"}
            ],
            "ro": [
              {name: "BlueMe", url: "http://www.itinerary.ro/"}
            ],
            "ru": [
              {name: "KDASOFT", url: "http://kdasoft.narod.ru/"}
            ],
            "sk": [
              {name: "ja1som"}
            ],
            "sv-SE": [
              {name: "Christian Eriksson"}
            ],
            "tr": [
              {name: "Ismail Aksu"}
            ],
            "UA": [
              {name: "SPIDER-T1"}
            ],
            "vi": [
              {name: "Tuấn Phạm"}
            ],
            "zh-CN": [
              {name: "小酷"},
              {name: "MatrixGT"}
            ],
            "zh-TW": [
              {name: "泰熊"}
            ]
          }
        }
      ]
    };
    } catch (e) {
      con.error(e);
    }
    con.log("Settings UI Inititialized");
    ytcenter.unsafe = {};
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
      'small': '240p',
      'medium': '360p',
      'large': '480p',
      'hd720': '720p',
      'hd1080': '1080p',
      'highres': 'Original'
    };
    ytcenter.video.id = "";
    ytcenter.video.title = "";
    ytcenter.video.author = "";
    ytcenter.video.channelname = "";
    ytcenter.video._channel = {};
    con.log("Download initializing");
    
    ytcenter.video.filename = function(stream){
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
        durmins: durmin,
        dursecs: dursec,
        nowtimestamp: nowtimestamp,
        nowsecs: nowsecs,
        nowmins: nowmins,
        nowhours: nowhours,
        nowdays: nowdays,
        nowmonth: nowmonth,
        nowyear: nowyear,
        pubtimestamp: pubtimestamp,
        pubsecs: pubsecs,
        pubmins: pubmins,
        pubhours: pubhours,
        pubdays: pubdays,
        pubmonth: pubmonth,
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
      return stream.url + "&title=" + encodeURIComponent(filename);
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
        "afv_video_min_cpm"
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
          con.log("Chaning csi_page_type from " + cfg.args.csi_page_type + " to watch7");
          if (ytcenter.watch7) {
            if (ytcenter.html5) {
              cfg.args.csi_page_type = "watch7_html5";
            } else {
              cfg.args.csi_page_type = "watch7";
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
    ytcenter.player.shortcuts = function(){
      con.log("Adding player shortcuts to document");
      document.addEventListener("keydown", function(e){
        e = e || window.event;
        if (ytcenter.settings.enableShortcuts && ytcenter.getPage() === "watch" && !e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
          if (document.activeElement.tagName.toLowerCase() === "input" || document.activeElement.tagName.toLowerCase() === "textarea" || document.activeElement.tagName.toLowerCase() === "object" || document.activeElement.tagName.toLowerCase() === "embed" || document.activeElement.tagName.toLowerCase() === "button") return;
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
              player.seekTo(player.getCurrentTime()-10, true);
              break;
            case 39: // Right Arrow
              player.seekTo(player.getCurrentTime()+10, true);
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
    ytcenter.player.config = ytcenter.player.config || {}; // Only used if YouTube's configs can't be accessed.
    ytcenter.player.updateConfig = function(page, config){
      if (ytcenter._tmp_embed && page === "embed") {
        if (ytcenter._tmp_embed.fmt_list)
          config.args.fmt_list = ytcenter._tmp_embed.fmt_list;
        if (ytcenter._tmp_embed.url_encoded_fmt_stream_map)
          config.args.url_encoded_fmt_stream_map = ytcenter._tmp_embed.url_encoded_fmt_stream_map;
      }
      var api = ytcenter.player.getAPI();
      con.log("[Config Update] Updating as page " + page);
      if (page === "watch") {
        ytcenter.player.updateResize();
        
        if (ytcenter.settings.enableAutoVideoQuality) {
          if (api.getPlaybackQuality() !== config.args.vq) {
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
        if (ytcenter.playlist) {
          if (ytcenter.settings.preventPlaylistAutoBuffer) {
            //api.stopVideo();
          } else if (ytcenter.settings.preventPlaylistAutoPlay) {
            api.mute();
            api.playVideo();
            api.pauseVideo();
            !ytcenter.settings.mute && api.isMuted && api.unMute();
          }
        } else {
          if (ytcenter.settings.preventAutoBuffer) {
            //api.stopVideo();
          } else if (ytcenter.settings.preventAutoPlay) {
            api.mute();
            api.playVideo();
            api.pauseVideo();
            !ytcenter.settings.mute && api.isMuted && api.unMute();
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
        
        if (api.getPlaybackQuality() != config.args.vq) {
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
        
        if (ytcenter.settings.embed_preventAutoBuffer) {
          api.stopVideo();
          var played = false;
          ytcenter.player.listeners.addEventListener("onStateChange", function(s){
            if (s !== 1 || played) return;
            played = true;
            if (api.getPlaybackQuality() !== ytcenter.settings.embed_autoVideoQuality) {
              con.log("Setting playback quality from " + api.getPlaybackQuality() + " to " + ytcenter.settings.embed_autoVideoQuality);
              api.setPlaybackQuality(ytcenter.settings.embed_autoVideoQuality);
            }
          });
        } else if (ytcenter.settings.embed_preventAutoPlay) {
          api.playVideo();
          api.pauseVideo();
          uw.setTimeout(function(){
            if (api.getPlaybackQuality() !== ytcenter.settings.embed_autoVideoQuality) {
              con.log("Setting playback quality from " + api.getPlaybackQuality() + " to " + ytcenter.settings.embed_autoVideoQuality);
              api.setPlaybackQuality(ytcenter.settings.embed_autoVideoQuality);
            }
          }, 600);
        } else {
          ytcenter.player.listeners.addEventListener("onStateChange", function(s){
            if (s !== 1 || played) return;
            played = true;
            if (api.getPlaybackQuality() !== ytcenter.settings.embed_autoVideoQuality) {
              con.log("Setting playback quality from " + api.getPlaybackQuality() + " to " + ytcenter.settings.embed_autoVideoQuality);
              api.setPlaybackQuality(ytcenter.settings.embed_autoVideoQuality);
            }
          });
          api.playVideo();
        }
        
        if (api.getPlaybackQuality() !== ytcenter.settings.embed_autoVideoQuality) {
          con.log("Setting playback quality from " + api.getPlaybackQuality() + " to " + ytcenter.settings.embed_autoVideoQuality);
          api.setPlaybackQuality(ytcenter.settings.embed_autoVideoQuality);
        }
      }
    };
    ytcenter.player.modifyConfig = function(page, config){
      if (page !== "watch" && page !== "embed" && page !== "channel") return;
      con.log("[Player modifyConfig] => " + page);
      if (ytcenter._tmp_embed && page === "embed") {
        if (ytcenter._tmp_embed.fmt_list)
          config.args.fmt_list = ytcenter._tmp_embed.fmt_list;
        if (ytcenter._tmp_embed.url_encoded_fmt_stream_map)
          config.args.url_encoded_fmt_stream_map = ytcenter._tmp_embed.url_encoded_fmt_stream_map;
      }
      if (config && config.args && config.args.url_encoded_fmt_stream_map && config.args.fmt_list) {
        var streams = ytcenter.parseStreams(config.args);
        ytcenter.video.streams = streams;
        try {
          if (ytcenter.video.streams[0] && ytcenter.video.streams[0].s) {
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
      
      if (config.html5) ytcenter.html5 = true;
      else ytcenter.html5 = false;
      con.log("[Player Type] " + (ytcenter.html5 ? "HTML5" : "Flash"));
      
      if (ytcenter.settings.removeRelatedVideosEndscreen)
        delete config.args.endscreen_module;
      
      if (ytcenter.settings.enableResize)
        config.args.player_wide = ytcenter.settings.player_wide ? "1" : "0";
      
      if (page === "watch") {
        if (config.args.url_encoded_fmt_stream_map) {
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
            ytcenter.events.performEvent("ui-refresh");
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
          if (ytcenter.settings.enableAutoVideoQuality) {
            var vq = ytcenter.player.getQuality(ytcenter.settings.autoVideoQuality, streams);
            con.log("[Player Quality] => " + ytcenter.settings.autoVideoQuality + " => " + vq);
            config.args.vq = vq;
          }
          if (ytcenter.settings.removeAdvertisements) {
            config = ytcenter.site.removeAdvertisement(config);
          }
          if (ytcenter.settings.removeBrandingWatermark) {
            delete config.args.watermark;
            delete config.args.interstitial;
          }
        }
        if (ytcenter.settings.aspectValue !== "none" && ytcenter.settings.aspectValue !== "default" && ytcenter.settings.aspectValue.indexOf("yt:") === 0) {
          con.log("Chaning aspect to " + ytcenter.settings.aspectValue);
          config.args.keywords = ytcenter.settings.aspectValue;
        } else if (ytcenter.settings.aspectValue !== "default"){
          con.log("Chaning aspect to none");
          config.args.keywords = "";
        } else {
          con.log("Keeping the aspect");
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
        if (ytcenter.settings.dashPlayback) {
          config.args.dash = "1";
        } else {
          config.args.dash = "0";
          config.args.dashmpd = "";
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
        config.args.theme = ytcenter.settings.playerTheme;
        config.args.color = ytcenter.settings.playerColor;
        
        ytcenter.player.setTheme(ytcenter.settings.playerTheme);
        ytcenter.player.setProgressColor(ytcenter.settings.playerColor);
        ytcenter.player.setAutoHide(ytcenter.settings.autohide);
      } else if (page === "embed") {
        if (ytcenter.settings.embed_enableAutoVideoQuality) {
          config.args.vq = ytcenter.player.getQuality(ytcenter.settings.embed_autoVideoQuality, streams);
        }
        if (config.args.url_encoded_fmt_stream_map) {
          if (ytcenter.settings.embed_enableAutoVideoQuality) {
            config.args.vq = ytcenter.player.getQuality(ytcenter.settings.embed_autoVideoQuality, streams);
          }
          if (ytcenter.settings.removeAdvertisements) {
            config = ytcenter.site.removeAdvertisement(config);
          }
        }
        if (!ytcenter.settings.embed_enableAnnotations) {
          config.args.iv_load_policy = 3;
        } else {
          config.args.iv_load_policy = 1;
        }
        if (typeof ytcenter.settings.embed_autohide !== "undefined") {
          config.args.autohide = ytcenter.settings.embed_autohide;
        }
        config.args.autoplay = "0";
        
        config.args.theme = ytcenter.settings.embed_playerTheme;
        config.args.color = ytcenter.settings.embed_playerColor;
        
        ytcenter.player.setTheme(ytcenter.settings.playerTheme);
        ytcenter.player.setProgressColor(ytcenter.settings.playerColor);
        ytcenter.player.setAutoHide(ytcenter.settings.embed_autohide);
        
        if (ytcenter.settings.embed_dashPlayback) {
          config.args.dash = "1";
        } else {
          config.args.dash = "0";
          config.args.dashmpd = "";
        }
        
        if (ytcenter.settings.embed_bgcolor === "none") {
          config.args.keywords = ytcenter.utils.setKeyword(config.args.keywords, "yt:bgcolor", "");
        } else if (ytcenter.settings.embed_bgcolor !== "default" && ytcenter.settings.embed_bgcolor.indexOf("#") === 0) {
          config.args.keywords = ytcenter.utils.setKeyword(config.args.keywords, "yt:bgcolor", ytcenter.settings.embed_bgcolor);
        }
      } else if (page === "channel") {
        if (config.args.url_encoded_fmt_stream_map) {
          if (ytcenter.settings.channel_enableAutoVideoQuality) {
            config.args.vq = ytcenter.player.getQuality(ytcenter.settings.channel_autoVideoQuality, streams);
          }
        }
        
        if (ytcenter.settings.channel_dashPlayback) {
          config.args.dash = "1";
        } else {
          config.args.dash = "0";
          config.args.dashmpd = "";
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
      return ytcenter.player.__getAPI; // Note: Never use yt.palyer.embed function to fetch the API. Just catch the API through onYouTubePlayerReady.
    };
    ytcenter.player.setPlayerSize = function(center){
      ytcenter.settings.player_wide = (center ? true : false);
      ytcenter.utils.setCookie("wide", (center ? "1" : "0"), null, "/", 3600*60*24*30);
      ytcenter.saveSettings();
    };
    ytcenter.player.turnLightOn = function(){};
    ytcenter.player.isLightOn = false;
    ytcenter.player.turnLightOff = (function(){
      var lightElement;
      return function(){
        if (!lightElement) {
          lightElement = document.createElement("div");
          lightElement.style.position = "fixed";
          lightElement.style.top = "0";
          lightElement.style.left = "0";
          lightElement.style.width = "100%";
          lightElement.style.height = "100%";
          lightElement.style.background = ytcenter.settings.lightbulbBackgroundColor;
          lightElement.style.opacity = ytcenter.settings.lightbulbBackgroundOpaque/100;
          lightElement.style.filter = "alpha(opacity=" + ytcenter.settings.lightbulbBackgroundOpaque + ")";
          lightElement.style.zIndex = "3";
          lightElement.className = "hid";
          lightElement.addEventListener("click", function(){
            ytcenter.utils.addClass(lightElement, "hid");
            ytcenter.utils.removeClass(document.body, "ytcenter-lights-off");
            ytcenter.player.isLightOn = false;
          }, false);
          ytcenter.player.turnLightOn = function(){
            ytcenter.utils.addClass(lightElement, "hid");
            ytcenter.utils.removeClass(document.body, "ytcenter-lights-off");
            ytcenter.player.isLightOn = false;
          };
          document.body.appendChild(lightElement);
        }
        // Updating background color and opacity.
        lightElement.style.background = ytcenter.settings.lightbulbBackgroundColor;
        lightElement.style.opacity = ytcenter.settings.lightbulbBackgroundOpaque/100;
        lightElement.style.filter = "alpha(opacity=" + ytcenter.settings.lightbulbBackgroundOpaque + ")";
        
        ytcenter.utils.addClass(document.body, "ytcenter-lights-off");
        ytcenter.utils.removeClass(lightElement, "hid");
        ytcenter.player.isLightOn = true;
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
    ytcenter.player.setConfig = function(config){
      ytcenter.player._config = config;
    };
    ytcenter.player.setYTConfig = function(config){
      uw.yt.setConfig(config);
    };
    ytcenter.player.getYTConfig = function(config){
      uw.yt.getConfig(config);
    };
    ytcenter.player.getConfig = function(){
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
            if (uw[event] !== events[b].masterWindowListener) {
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
            events[event].masterListener = __r.getMasterListener(event);
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
            i;
        con.log("[Player Listener] Setting up enviorment");
        __r.setupListeners();
        for (event in events) {
          if (events.hasOwnProperty(event)) {
            if (events[event].override) override = true;
            api.addEventListener(event, events[event].masterListener);
          }
        }
        if (override) {
          api.addEventListener("onReady", function(){
            i = __r.getNewestPlayerId();
            for (event in events) {
              if (events.hasOwnProperty(event) && events[event].override) {
                if (uw["ytPlayer" + event + "player" + i] && uw["ytPlayer" + event + "player" + i] !== events[event].masterWindowListener) {
                  __r.replacedListeners["ytPlayer" + event + "player" + i] = uw["ytPlayer" + event + "player" + i];
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
    };
    ytcenter.player.aspect = function(option){
      ytcenter.player.getConfig().args.keywords = option;
      con.log("Keywords changed to " + ytcenter.player.getConfig().args.keywords);
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
      
      var il = ytcenter.player.listeners.addEventListener("onStateChange", function(s){
        if (s !== 1) return;
        ytcenter.player.listeners.removeEventListener("onStateChange", il);
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
      });
      
      api.loadVideoByPlayerVars(ytcenter.player.getConfig().args);
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
      scrollToPlayerButton = ytcenter.gui.createYouTubeDefaultButton("SCROLL_TOOLTIP", [scrollToPlayerButtonArrow]);
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
        if (_s.config.scrollToPlayer) {
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
      return playerSize.align;
    };
    ytcenter.player.resize = (function(){
      function getItemById(id) {
        for (var i = 0; i < ytcenter.settings["resize-playersizes"].length; i++) {
          if (ytcenter.settings["resize-playersizes"][i].id === id) return ytcenter.settings["resize-playersizes"][i];
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
      var lastResizeId;
      ytcenter.player.resizeUpdater = function(){
        if (!ytcenter.settings.enableResize) return;
        ytcenter.player.resize(getItemById(lastResizeId));
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
    ytcenter.player._resize = (function(){
      var _width = "";
      var _height = "";
      var _large = true;
      var _align = true;
      var _playlist_toggled = false;
      
      var player_ratio = 16/9;
      var playerBarHeight = 30;
      var playerBarHeightNone = 0;
      var playerBarHeightProgress = 3;
      var playerBarHeightBoth = 35;
      var maxInsidePlayerWidth = 985; // Is 1003px for the experimental design
      
      ytcenter.player._mastheadHeightListener = function(){
        return;
        if (document.getElementById("masthead-positioner-height-offset") && document.getElementById("masthead-positioner") && ytcenter.settings['experimentalFeatureTopGuide']) {
          /*var posOffset = document.getElementById("masthead-positioner-height-offset"),
              positioner = document.getElementById("masthead-positioner"),
              height,
              top,
              update = function(){
                height = posOffset.offsetHeight || posOffset.clientHeight;
                document.getElementById("appbar-guide-menu").style.top = ((height - 1) + top) + "px";
              },
              MutObs = ytcenter.getMutationObserver(),
              observer = new MutObs(function(mutations){
                mutations.forEach(function(mutation){
                  if (mutation.type === "attributes" && mutation.attributeName === "style") {
                    top = positioner.style.top ? parseInt(positioner.style.top) : 0;
                    update();
                    ytcenter.events.performEvent("resize-update");
                  }
                });
              });
          observer.observe(posOffset, { attributes: true });
          ytcenter.unload(function(){
            if (observer) {
              observer.disconnect();
              observer = null;
            }
          });*/
          /*window.addEventListener("scroll", (function(){
            var lastTop = -1,
                running = false;
            return function(){
              if (running && lastTop === top) return;
              running = true;
              uw.setTimeout(function(){
                top = positioner.style.top ? parseInt(positioner.style.top) : 0;
                update();
                running = false;
              }, 50);
            };
          })(), false);*/
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
            height = "480px";
          } else {
            width = "640px";
            height = "360px";
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
          if (player_ratio !== 0) calcHeight = Math.round(calcWidth/player_ratio);
          else calcHeight = calcWidth;
        } else if (isNaN(calcWidth) && !isNaN(calcHeight) && !calcedWidth) {
          calcedWidth = true;
          if (height.indexOf("%") !== -1 && height.match(/%$/) && height !== "%") {
            calcWidth = Math.round((calcHeight - _pbh)*player_ratio);
          } else {
            calcWidth = Math.round(calcHeight*player_ratio);
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
        if (playlist_el) {
          playlist_el.style.width = (large ? playerWidth : maxInsidePlayerWidth) + "px";
        }
        if (player) {
          player.style.width = (large ? (align ? maxInsidePlayerWidth : playerWidth) : maxInsidePlayerWidth) + "px";
          /*player.style.height = (playerHeight + (document.getElementById("watch7-playlist-data") ? 34 : 0)) + "px";*/
          
          if (playerAPI) {
            playerAPI.style.width = playerWidth + "px";
            playerAPI.style.height = playerHeight + "px";
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
          if (ytcenter.settings.watch7centerpage) {
            if (clientWidth < calcWidth && contentMain) {
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
        if (creatorBar) {
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
            wp.style.height = Math.round(calcHeight + pbh) + "px";
          } else {
            wp.style.width = "";
            wp.style.height = "";
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
    ytcenter.player.getHighestStreamQuality = function(streams){
      var i, stream = streams[0], stream_dim, tmp_dim;
      if (stream.dimension && stream.dimension.indexOf("x") !== -1) {
        stream_dim = stream.dimension.split("x");
        stream_dim[0] = parseInt(stream_dim[0]);
        stream_dim[1] = parseInt(stream_dim[1]);
      } else {
        stream_dim = [0,0];
      }
      
      for (i = 1; i < streams.length; i++) {
        if (!streams[i].dimension) continue;
        if (streams[i].dimension.indexOf("x") !== -1) {
          tmp_dim = streams[i].dimension.split("x");
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
    ytcenter.player.getClosestQuality = function(vq, streams){
      var priority = ['auto', 'small', 'medium', 'large', 'hd720', 'hd1080', 'highres'],
          a = "auto";
      for (var i = 0; i < streams.length; i++) {
        if (!streams[i]) continue;
        if ($ArrayIndexOf(priority, streams[i].quality) <= $ArrayIndexOf(priority, vq) && $ArrayIndexOf(priority, streams[i].quality) > $ArrayIndexOf(priority, a)) {
          a = streams[i].quality;
        }
      }
      return a;
    };
    ytcenter.player.getQuality = function(vq, streams){
      var _vq = "auto";
      if (typeof streams === "undefined") return _vq;
      
      var priority = ['auto', 'small', 'medium', 'large', 'hd720', 'hd1080', 'highres'];
      
      if (ytcenter.html5) {
        var a = document.createElement("video");
        if (a && a.canPlayType) {
          _vq = "auto";
          for (var i = 0; i < streams.length; i++) {
            if (!streams[i]) continue;
            if ($ArrayIndexOf(priority, streams[i].quality) <= $ArrayIndexOf(priority, vq) && $ArrayIndexOf(priority, streams[i].quality) > $ArrayIndexOf(priority, _vq) && a.canPlayType(streams[i].type.split(";")[0]).replace(/no/, '')) {
              _vq = streams[i].quality;
            }
          }
        }
      } else {
        for (var i = 0; i < streams.length; i++) {
          if (!streams[i]) continue;
          if ($ArrayIndexOf(priority, streams[i].quality) <= $ArrayIndexOf(priority, vq) && $ArrayIndexOf(priority, streams[i].quality) > $ArrayIndexOf(priority, _vq)) {
            _vq = streams[i].quality;
          }
        }
      }
      return _vq;
    };
    ytcenter.player.setQuality = function(vq, config){
      var pc = ytcenter.player.getConfig();
      var streams = ytcenter.video.streams;
      if (typeof streams === "undefined") return false;
      con.log("Getting Highest Available Quality With \"" + vq + "\" As Highest Quality");
      var priority = ['auto', 'small', 'medium', 'large', 'hd720', 'hd1080', 'highres'];
      pc.args.vq = ytcenter.player.getQuality(vq, streams);
      con.log("Setting Video Quality to " + pc.args.vq);
      if (typeof ytcenter.player.getReference() !== "undefined" && ytcenter.player.getReference().onReadyCalled && ytcenter.player.getReference().api && ytcenter.player.getReference().api.setPlaybackQuality) {
        con.log("Setting PlaybackQuality to " + pc.args.vq);
        ytcenter.player.getReference().api.setPlaybackQuality(pc.args.vq);
      }
      if (ytcenter.html5 && pc.args.vq === "auto") {
        //return false;
        return true;
      } else {
        return true;
      }
    };
    ytcenter.player._original_update = undefined;
    ytcenter.player._appliedBefore = false;
    ytcenter.player._onPlayerLoadedBefore = false;
    ytcenter.player.setPlayerType = function(type){
      if (type !== "html5" && type !== "flash") {
        con.error("[Player setPlayerType] Invalid type: " + type);
        return;
      }
      ytcenter.player.getAPI().writePlayer(type);
    };
    ytcenter.player.updateFlashvars = function(player, config){
      var flashvars = "", key;
      for (key in config.args) {
        if (config.args.hasOwnProperty(key)) {
          if (flashvars !== "") flashvars += "&";
          flashvars += encodeURIComponent(key) + "=" + encodeURIComponent(config.args[key]);
        }
      }
      player.setAttribute("flashvars", flashvars);
    };
    ytcenter.player.update = function(config){
      try {
        var player = document.getElementById("movie_player") || document.getElementById("player1"),
            clone;
        con.log("[Player Update] Checking if player exists!");
        if (player && player.tagName === "EMBED") {
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
        a.push(adaptive_fmts[i]);
      }
      
      return a;
    };
    ytcenter.classManagement = {};
    ytcenter.classManagement.applyClassesExceptElement = function(el, url){
      if (url) url = ytcenter.utils.url(url);
      else url = loc;
      var i;
      for (i = 0; i < ytcenter.classManagement.db.length; i++) {
        if (ytcenter.classManagement.db[i].element() && ytcenter.classManagement.db[i].element() !== el) {
          if (ytcenter.classManagement.db[i].condition(url))
            ytcenter.classManagement.db[i].element().className += " " + ytcenter.classManagement.db[i].className;
          else
            ytcenter.utils.removeClass(ytcenter.classManagement.db[i].element(), ytcenter.classManagement.db[i].className);
        } else if (!ytcenter.classManagement.db[i].element()) {
          con.error("[Element Class Management] Element does not exists!", ytcenter.classManagement.db[i]);
        }
      }
    };
    ytcenter.classManagement.applyClassesForElement = function(el, url){
      if (url) url = ytcenter.utils.url(url);
      else url = loc;
      var i;
      for (i = 0; i < ytcenter.classManagement.db.length; i++) {
        if (ytcenter.classManagement.db[i].element() === el) {
          if (ytcenter.classManagement.db[i].condition(url))
            ytcenter.classManagement.db[i].element().className += " " + ytcenter.classManagement.db[i].className;
          else
            ytcenter.utils.removeClass(ytcenter.classManagement.db[i].element(), ytcenter.classManagement.db[i].className);
        } else if (!ytcenter.classManagement.db[i].element()) {
          con.error("[Element Class Management] Element does not exists!", ytcenter.classManagement.db[i]);
        }
      }
    };
    ytcenter.classManagement.applyClasses = function(url){
      if (url) url = ytcenter.utils.url(url);
      else url = loc;
      var i;
      for (i = 0; i < ytcenter.classManagement.db.length; i++) {
        if (ytcenter.classManagement.db[i].element()) {
          if (ytcenter.classManagement.db[i].condition(url))
            ytcenter.classManagement.db[i].element().className += " " + ytcenter.classManagement.db[i].className;
          else
            ytcenter.utils.removeClass(ytcenter.classManagement.db[i].element(), ytcenter.classManagement.db[i].className);
        } else {
          con.error("[Element Class Management] Element does not exists!", ytcenter.classManagement.db[i]);
        }
      }
    };
    ytcenter.classManagement.getClassesForElementById = function(id, url){
      if (url) url = ytcenter.utils.url(url);
      else url = loc;
      var i, a = [];
      for (i = 0; i < ytcenter.classManagement.db.length; i++) {
        if (ytcenter.classManagement.db[i].element()) {
          if (ytcenter.classManagement.db[i].element().getAttribute("id") === id
              && ytcenter.classManagement.db[i].condition(url))
            a.push(ytcenter.classManagement.db[i].className);
        } else {
          con.error("[Element Class Management] Element does not exists!", ytcenter.classManagement.db[i]);
        }
      }
      return a.join(" ");
    };
    ytcenter.classManagement.getClassesForElementByTagName = function(tagname, url){
      if (url) url = ytcenter.utils.url(url);
      else url = loc;
      var i, a = [];
      for (i = 0; i < ytcenter.classManagement.db.length; i++) {
        if (ytcenter.classManagement.db[i].element()) {
          if (ytcenter.classManagement.db[i].element().tagName === tagname
              && ytcenter.classManagement.db[i].condition(url))
            a.push(ytcenter.classManagement.db[i].className);
        } else {
          con.error("[Element Class Management] Element does not exists!", ytcenter.classManagement.db[i]);
        }
      }
      return a.join(" ");
    };
    ytcenter.classManagement.db = [
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
          document.getElementById("page").style.setProperty("margin", "0 auto", "!important");
        else
          document.getElementById("page").style.setProperty("margin", "");
        return false;
      }},
      {element: function(){return document.body;}, className: "site-left-aligned", condition: function(loc){return !ytcenter.settings['experimentalFeatureTopGuide'];}},
      {element: function(){return document.body;}, className: "site-center-aligned", condition: function(loc){return ytcenter.settings['experimentalFeatureTopGuide'];}},
      {element: function(){return document.body;}, className: "ytcenter-hide-watched-videos", condition: function(loc){return ytcenter.settings.gridSubscriptionsPage && ytcenter.settings.hideWatchedVideos;}},
      {element: function(){return document.body;}, className: "ytcenter-grid-subscriptions", condition: function(loc){return loc.pathname === "/feed/subscriptions" && ytcenter.settings.gridSubscriptionsPage;}},
      {element: function(){return document.getElementById("page");}, className: "no-flex", condition: function(loc){return !ytcenter.settings.flexWidthOnPage && loc.pathname !== "/watch";}},
      {element: function(){return document.body;}, className: "ytcenter-lights-off", condition: function(loc){return ytcenter.player.isLightOn;}},
      {element: function(){return document.getElementById("watch-description");}, className: "yt-uix-expander-collapsed", condition: function(loc){return !ytcenter.settings.expandDescription;}},
      {element: function(){return document.getElementById("watch-video-extra");}, className: "hid", condition: function(loc){return ytcenter.settings.removeAdvertisements;}},
      {element: function(){return document.body;}, className: "flex-width-enabled", condition: function(loc){return (ytcenter.settings.flexWidthOnPage && loc.pathname !== "/watch") || ytcenter.getPage() === "channel" || loc.pathname.indexOf("/user/") === 0;}},
      {element: function(){return document.body;}, className: "ytcenter-branding-remove-banner", condition: function(loc){return ytcenter.settings.removeBrandingBanner;}},
      {element: function(){return document.body;}, className: "ytcenter-branding-remove-background", condition: function(loc){return ytcenter.settings.removeBrandingBackground;}},
      {element: function(){return document.body;}, className: "ytcenter-site-center", condition: function(loc){return ytcenter.settings.watch7centerpage;}},
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
      var __r = {}, observer, config = { attributes: true }, MutObs = ytcenter.getMutationObserver(), feed;
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
            
            if (MutObs) {
              observer = new MutObs(function(mutations){
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
              observer.observe(feedCollapsedContainer[0], config);
            }
          }
        }
      };
      __r.dispose = function(){
        if (MutObs) {
          if (observer) observer.disconnect();
          observer = null;
        }
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
      var timer, observer, observer2, clicked = false, main_guide, guide_container, guideToggle, MutObs = ytcenter.getMutationObserver(),
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
      return function(){
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
        
        observer2 = new MutObs(function(mutations){
          mutations.forEach(function(mutation){
            if (ytcenter.utils.inArray(mutation.removedNodes, guide_container)) {
              con.log("[Guide] Main Guide has been removed");
              main_guide = document.getElementById("guide-main");
              guide_container = document.getElementById("guide-container");
              if (main_guide) {
                observer.disconnect();
                observer.observe(main_guide, config);
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
        observer = new MutObs(function(mutations){
          mutations.forEach(function(mutation){
            if (mutation.type === "attributes" && mutation.attributeName === "class") {
              con.log("[Guide] Mutations...", mutation.oldValue.indexOf("collapsed") !== -1, ytcenter.settings.guideMode);
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
        if (observer && ytcenter.settings.guideMode !== "default") {
          if (document.getElementById("guide"))
            observer2.observe(document.getElementById("guide"), confi2);
          main_guide = document.getElementById("guide-main");
          guide_container = document.getElementById("guide-container");
          if (main_guide)
            observer.observe(main_guide, config);
          if (guideToggle)
            ytcenter.utils.addEventListener(guideToggle, "click", clickListener, false);
        }
        updateGuide();
      };
    })();
    uw['ytcenter'] = ytcenter.unsafe;
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
      
      var __settingsLoaded = false;
      try {
        if (uw.ytplayer && uw.ytplayer.config && uw.ytplayer.config.loaded) {
          ytcenter.player.config = uw.ytplayer.config;
          ytcenter.player.disablePlayerUpdate = false;
        } else {
          if (uw.ytplayer && uw.ytplayer.config && uw.ytplayer.config.args)
            ytcenter.player.config = ytcenter.player.modifyConfig(ytcenter.getPage(), uw.ytplayer.config);
          if (ytcenter.utils.setterGetterClassCompatible()) {
            con.log("[PlayerConfig Hijacker] Using Class Setter Getter Method");
            uw.ytplayer = new PlayerConfig(function(config){
              if (config) {
                ytcenter.player.config = ytcenter.player.modifyConfig(ytcenter.getPage(), config);
                if (ytcenter.player.config.html5) ytcenter.player.disablePlayerUpdate = true;
              } else {
                ytcenter.player.config = config;
              }
            }, function(){
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
                  ytcenter.player.config = ytcenter.player.modifyConfig(ytcenter.getPage(), config);
                  if (ytcenter.player.config.html5) ytcenter.player.disablePlayerUpdate = true;
                } else {
                  ytcenter.player.config = config;
                }
              }
            };
          }*/ else {
            con.log("[PlayerConfig Hijacker] Setter Getter Method not suppoted!");
            ytcenter.player.config = uw.ytplayer.config;
            ytcenter.player.disablePlayerUpdate = false;
          }
        }
      } catch (e) {
        con.error(e);
        if (uw && uw.ytplayer && uw.ytplayer.config)
          ytcenter.player.config = uw.ytplayer.config;
        ytcenter.player.disablePlayerUpdate = false;
      }
      ytcenter.pageReadinessListener.waitfor = function(){
        return __settingsLoaded;
      };
      
      ytcenter.loadSettings(function(){
        __settingsLoaded = true;
        ytcenter.player.config = ytcenter.player.modifyConfig(ytcenter.getPage(), ytcenter.player.config);
      });
      
      ytcenter.pageReadinessListener.addEventListener("headerInitialized", function(){
        con.log("Loading Settings");
        if (loc.href.indexOf(".youtube.com/embed/") !== -1 && !ytcenter.settings.embed_enabled) {
          return;
        }
        ytcenter.language.update();
        
        uw.addEventListener("message", function(e){
          if (e.origin !== "http://www.youtube.com")
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
        
        // Settings made public
        uw.ytcenter = uw.ytcenter || {};
        uw.ytcenter.injected = injected;
        uw.ytcenter.settings = uw.ytcenter.settings || {};
        uw.ytcenter.getDebug = ytcenter.utils.bind(function(){
          return ytcenter.debug();
        }, uw.ytcenter);
        uw.ytcenter.updateSignatureDecipher = ytcenter.utils.bind(function(){
          uw.postMessage("YouTubeCenter" + JSON.stringify({
            type: "updateSignatureDecipher"
          }), "http://www.youtube.com");
        }, uw.ytcenter);
        uw.ytcenter.settings.setOption = ytcenter.utils.bind(function(key, value){
          ytcenter.settings[key] = value;
          uw.postMessage("YouTubeCenter" + JSON.stringify({
            type: "saveSettings"
          }), "http://www.youtube.com");
        }, uw.ytcenter.settings);
        uw.ytcenter.settings.getOption = ytcenter.utils.bind(function(key){
          return ytcenter.settings[key];
        }, uw.ytcenter.settings);
        uw.ytcenter.settings.getOptions = ytcenter.utils.bind(function(){
          return ytcenter.settings;
        }, uw.ytcenter.settings);
        uw.ytcenter.settings.removeOption = ytcenter.utils.bind(function(key){
          delete ytcenter.settings[key];
          uw.postMessage("YouTubeCenter" + JSON.stringify({
            type: "saveSettings"
          }), "http://www.youtube.com");
        }, uw.ytcenter.settings);
        uw.ytcenter.settings.listOptions = ytcenter.utils.bind(function(){
          var keys = [];
          for (var key in ytcenter.settings) {
            if (ytcenter.settings.hasOwnProperty(key)) keys.push(key);
          }
          return keys;
        }, uw.ytcenter.settings);
        uw.ytcenter.settings.reload = ytcenter.utils.bind(function(){
          uw.postMessage("YouTubeCenter" + JSON.stringify({
            type: "loadSettings"
          }), "http://www.youtube.com");
        }, uw.ytcenter.settings);
        try {
          var links = document.head.getElementsByTagName("link");
          if (links[0] && links[0].className === "www-feather")
            ytcenter.feather = true;
        } catch (e) {
          con.error(e);
        }
        $AddStyle(ytcenter.css.general);
        $AddStyle(ytcenter.css.flags);
        $AddStyle(ytcenter.css.html5player);
        $AddStyle(ytcenter.css.gridSubscriptions);
        $AddStyle(ytcenter.css.images);
        
        if (ytcenter.settings['experimentalFeatureTopGuide'] || ytcenter.settings['ytExperimentFixedTopbar']) {
          $AddStyle(ytcenter.css.topbar);
        }
        if (!ytcenter.settings['experimentalFeatureTopGuide']) {
          $AddStyle(ytcenter.css.normal);
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
         */
        ytcenter.inject("eval(function(p,a,c,k,e,d){e=function(c){return(c<a?'':e(parseInt(c/a)))+((c=c%a)>35?String.fromCharCode(c+29):c.toString(36))};if(!''.replace(/^/,String)){while(c--){d[e(c)]=k[c]||e(c)}k=[function(e){return d[e]}];e=function(){return'\\\\w+'};c=1};while(c--){if(k[c]){p=p.replace(new RegExp('\\\\b'+e(c)+'\\\\b','g'),k[c])}}return p}('v=v||{};v.R=v.R||{};(4(I,v){o{v.R.B=B}q(e){}8(J B!==\"4\"||J k===\"2c\")8(J B===\"4\"&&J K!==\"2c\")I.k=K;j v.R.B=(4(6){\"1W 2l\";d Z=(4(){d a=t;o{a=6.Z||6.2d||6.1A||6.17}q(e){o{a=6.2d||6.1A||6.17}q(e){o{a=6.1A||6.17}q(e){o{a=6.17}q(e){}}}}f a})()||(4(6){d 1l=4(P){f 2P.S.1r.T(P).2Q(/^\\\\[P\\\\s(.*)\\\\]$/)[1]},1n=4 Z(){g.7=[]},A=4(7,c,w){g.7=7;g.1F=7.p;g.c=c;g.w=w},1f=1n.S,19=A.S,1d=6.1d,1s=4(c){g.1I=g[g.l=c]},1v=(\"2m 2V 22 2n 2W \"+\"31 30 2Z\").1M(\" \"),1h=1v.p,H=6.k||6.K||6,1k=H.11,1i=H.1u,k=H,1a=6.1a,1b=6.1b,1z=6.1z,Y=6.Y;A.2b=19.2b=14;1C(1h--){1s.S[1v[1h]]=1h+1}8(!H.11){k=6.k={}}k.11=4(b){d c=b.c,N;8(c===Q){c=\"2q/2z-2t\"}8(b 1c A){N=\"7:\"+c;8(b.w===\"1g\"){f N+\";1g,\"+b.7}j 8(b.w===\"2h\"){f N+\",\"+2i(b.7)}8(1a){f N+\";1g,\"+1a(b.7)}j{f N+\",\"+2o(b.7)}}j 8(1k){f 1k.T(H,b)}};k.1u=4(1m){8(1m.2D(0,5)!==\"7:\"&&1i){1i.T(H,1m)}};1f.1X=4(7){d E=g.7;8(Y&&(7 1c 1z||7 1c Y)){d 1q=\"\",1o=C Y(7),i=0,29=1o.p;20(;i<29;i++){1q+=2H.2M(1o[i])}E.x(1q)}j 8(1l(7)===\"B\"||1l(7)===\"2K\"){8(1d){d 2g=C 1d;E.x(2g.32(7))}j{2r C 1s(\"2n\")}}j 8(7 1c A){8(7.w===\"1g\"&&1b){E.x(1b(7.7))}j 8(7.w===\"2h\"){E.x(2i(7.7))}j 8(7.w===\"21\"){E.x(7.7)}}j{8(J 7!==\"2u\"){7+=\"\"}E.x(3r(2o(7)))}};1f.1U=4(c){8(!1w.p){c=Q}f C A(g.7.3i(\"\"),c,\"21\")};1f.1r=4(){f\"[P Z]\"};19.L=4(1Y,1T,c){d 1t=1w.p;8(1t<3){c=Q}f C A(g.7.L(1Y,1t>1?1T:g.7.p),c,g.w)};19.1r=4(){f\"[P B]\"};f 1n}(6));f 4(12,1x){d c=1x?(1x.c||\"\"):\"\";d 1y=C Z();8(12){20(d i=0,23=12.p;i<23;i++){1y.1X(12[i])}}f 1y.1U(c)}}(I));v.R.13=(I&&I.13)||(18&&18.1V&&18.1V.2B(18))||(4(6){\"1W 2l\";d 1B=6.3n,1p=4(){d a;o{a=6.k||6.K||6}q(e){o{a=6.k||6.K||6}q(e){o{a=6.K||6}q(e){o{a=6}q(e){}}}}f a},k=1p(),10=1B.3m(\"3k://3a.2I.3d/3e/3h\",\"a\"),2w=!6.3g&&\"V\"3b 10,1Q=4(2s){d n=1B.34(\"36\");n.37(\"1Q\",14,t,6,0,0,0,0,0,t,t,t,t,0,Q);2s.38(n)},16=6.3j,1E=6.3s||16||6.3p,2x=4(F){(6.3q||6.3l)(4(){2r F},0)},15=\"2q/2z-2t\",1H=0,M=[],2e=4(){d i=M.p;1C(i--){d r=M[i];8(J r===\"2u\"){k.1u(r)}j{r.26()}}M.p=0},1e=4(9,U,n){U=[].33(U);d i=U.p;1C(i--){d 1j=9[\"1L\"+U[i]];8(J 1j===\"4\"){o{1j.T(9,n||9)}q(F){2x(F)}}}},1G=4(b,l){d 9=g,c=b.c,1O=t,m,W,1P=4(){d m=1p().11(b);M.x(m);f m},1S=4(){1e(9,\"1Z 25 1K 24\".1M(\" \"))},y=4(){8(1O||!m){m=1P(b)}8(W){W.2p.1N=m}j{2O.2X(m,\"2S\")}9.u=9.G;1S()},z=4(2v){f 4(){8(9.u!==9.G){f 2v.2T(g,1w)}}},1R={2k:14,3c:t},L;9.u=9.2f;8(!l){l=\"V\"}8(2w){m=1P(b);10.1N=m;10.V=l;1Q(10);9.u=9.G;1S();f}8(6.2G&&c&&c!==15){L=b.L||b.2L;b=L.T(b,0,b.1F,15);1O=14}8(16&&l!==\"V\"){l+=\".V\"}8(c===15||16){W=6}8(!1E){y();f}1H+=b.1F;1E(6.2J,1H,z(4(2y){2y.2U.2N(\"3o\",1R,z(4(1J){d 1D=4(){1J.2j(l,1R,z(4(r){r.39(z(4(D){D.2a=4(n){W.2p.1N=r.3f();M.x(r);9.u=9.G;1e(9,\"24\",n)};D.27=4(){d X=D.X;8(X.1I!==X.22){y()}};\"1Z 25 1K O\".1M(\" \").35(4(n){D[\"1L\"+n]=9[\"1L\"+n]});D.1K(b);9.O=4(){D.O();9.u=9.G};9.u=9.28}),y)}),y)};1J.2j(l,{2k:t},z(4(r){r.26();1D()}),z(4(F){8(F.1I===F.2m){1D()}j{y()}}))}),y)}),y)},h=1G.S,13=4(b,l){f C 1G(b,l)};h.O=4(){d 9=g;9.u=9.G;1e(9,\"O\")};h.u=h.2f=0;h.28=1;h.G=2;h.X=h.2A=h.2C=h.2F=h.2E=h.27=h.2a=Q;6.2Y(\"2R\",2e,t);f 13}(I))})(I,v);',62,215,'||||function||view|data|if|filesaver||blob|type|var||return|this|FS_proto||else|URL|name|object_url|event|try|length|catch|file||false|readyState|ytcenter|encoding|push|fs_error|abortable|FakeBlob|Blob|new|writer|bb|ex|DONE|real_URL|self|typeof|webkitURL|slice|deletion_queue|data_URI_header|abort|object|null|io|prototype|call|event_types|download|target_view|error|Uint8Array|BlobBuilder|save_link|createObjectURL|blobParts|saveAs|true|force_saveable_type|webkit_req_fs|MSBlobBuilder|navigator|FB_proto|btoa|atob|instanceof|FileReaderSync|dispatch|FBB_proto|base64|file_ex_code|real_revoke_object_URL|listener|real_create_object_URL|get_class|object_URL|FakeBlobBuilder|buf|get_URL|str|toString|FileException|args|revokeObjectURL|file_ex_codes|arguments|options|builder|ArrayBuffer|MozBlobBuilder|doc|while|save|req_fs|size|FileSaver|fs_min_size|code|dir|write|on|split|href|blob_changed|get_object_url|click|create_if_not_found|dispatch_all|end|getBlob|msSaveOrOpenBlob|use|append|start|writestart|for|raw|ABORT_ERR|len|writeend|progress|remove|onerror|WRITING|buf_len|onwriteend|fake|undefined|WebKitBlobBuilder|process_deletion_queue|INIT|fr|URI|decodeURIComponent|getFile|create|strict|NOT_FOUND_ERR|NOT_READABLE_ERR|encodeURIComponent|location|application|throw|node|stream|string|func|can_use_save_link|throw_outside|fs|octet|onwritestart|bind|onprogress|substring|onabort|onwrite|chrome|String|w3|TEMPORARY|File|webkitSlice|fromCharCode|getDirectory|window|Object|match|unload|_blank|apply|root|SECURITY_ERR|ENCODING_ERR|open|addEventListener|SYNTAX_ERR|INVALID_STATE_ERR|NO_MODIFICATION_ALLOWED_ERR|readAsBinaryString|concat|createEvent|forEach|MouseEvents|initMouseEvent|dispatchEvent|createWriter|www|in|exclusive|org|1999|toURL|externalHost|xhtml|join|webkitRequestFileSystem|http|setTimeout|createElementNS|document|saved|mozRequestFileSystem|setImmediate|unescape|requestFileSystem'.split('|'),0,{}))");
        /*****END OF SAVEAS AND BLOB IMPLEMENTATION*****/
      });
      ytcenter.pageReadinessListener.addEventListener("bodyInitialized", function(){
        /* ytplayer is initialized! */
        if (loc.href.indexOf(".youtube.com/embed/") !== -1 && !ytcenter.settings.embed_enabled) {
          return;
        }
        ytcenter.classManagement.applyClassesForElement(document.body);
        
        try {
          if (!ytcenter.welcome.hasBeenLaunched())
            ytcenter.welcome.setVisibility(true);
        } catch (e) {
          con.error(e);
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
        
        // Checking if the correct settings were applied and if not correct them and forcing a refresh of the page.
        if (ytcenter.settings['experimentalFeatureTopGuide']) {
          if (!ytcenter.experiments.isTopGuide()) {
            ytcenter.settings['experimentalFeatureTopGuide'] = false;
            ytcenter.saveSettings(false, false);
            loc.reload();
          }
        } else {
          if (ytcenter.experiments.isTopGuide()) {
            ytcenter.settings['experimentalFeatureTopGuide'] = true;
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
        
        yt = uw.yt;
        ytcenter.player.onYouTubePlayerReady = function(api){
          ytcenter.classManagement.applyClassesForElement();
          con.log("[onYouTubePlayerReady]", arguments);
          if (typeof api !== "string") {
            ytcenter.player.__getAPI = api;
            ytcenter.player.listeners.dispose();
            ytcenter.player.listeners.setup();
            
            if (ytcenter.getPage() === "channel") {
              if (ytcenter.player.config.args) {
                ytcenter.player.updateConfig(ytcenter.getPage(), ytcenter.player.config);
              } else {
                ytcenter.player.config.updateConfig = true;
              }
            } else {
              if (ytcenter.getPage() === "watch") {
                ytcenter.placementsystem.clear();
                
                $CreateDownloadButton();
                $CreateRepeatButton();
                $CreateLightButton();
                $CreateAspectButton();
                $CreateResizeButton();
                
                initPlacement();
              }
              con.log("[onYouTubePlayerReady] => updateConfig");
              ytcenter.player.updateConfig(ytcenter.getPage(), ytcenter.player.config);
            }
          }
        };
        uw.ytcenter = uw.ytcenter || {};
        uw.ytcenter.player = uw.ytcenter.player || {};
        uw.ytcenter.player.onReady = ytcenter.utils.bind(ytcenter.player.onYouTubePlayerReady, uw.ytcenter);
        uw.onYouTubePlayerReady = ytcenter.player.onYouTubePlayerReady;
        
        /* bodyInteractive should only be used for the UI, use the other listeners for player configuration */
        if (page === "embed") {
          (document.getElementById("player-legacy") || document.getElementById("player")).style.display = "none";
          if (uw.yt && uw.yt.config_ && uw.yt.config_.PLAYER_CONFIG) {
            ytcenter.player.config = ytcenter.player.modifyConfig(ytcenter.getPage(), uw.yt.config_.PLAYER_CONFIG);
          }
          ytcenter._tmp_embed._callback = function(){
            ytcenter.player.config = ytcenter.player.modifyConfig(ytcenter.getPage(), ytcenter.player.config);
            ytcenter.player.update(ytcenter.player.config);
            
            (document.getElementById("player-legacy") || document.getElementById("player")).style.display = "";
          };
          if (ytcenter._tmp_embed.loaded) {
            ytcenter._tmp_embed._callback();
          } else {
            ytcenter._tmp_embed.callback = ytcenter._tmp_embed._callback;
          }
          return;
        }
        
        // UI
        ytcenter.classManagement.applyClassesExceptElement(document.body);
        
        $CreateSettingsUI();
        $UpdateChecker();
        extensionCompatibilityChecker();
        try {
          ytcenter.thumbnail.setup();
          ytcenter.comments.setup();
        } catch (e) {
          con.error(e);
        }
        
        // SPF Injector
        var _spf_timer = function(){
          if (ytcenter.spf.isEnabled()) {
            if (ytcenter.spf.isReadyToInject() && !ytcenter.spf.isInjected()) {
              ytcenter.spf.inject();
            } else if (!ytcenter.spf.isReadyToInject() && !ytcenter.spf.isInjected() && document.readyState !== "complete") {
              uw.setTimeout(_spf_timer, 1000);
            }
          }
        };
        _spf_timer();
        
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
          ytcenter.page = "watch";
          try {
            ytcenter.guide.hidden = ytcenter.settings.watch7playerguidealwayshide;
            ytcenter.guide.setup();
          } catch (e) {
            con.error(e);
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

          if (ytcenter.settings.scrollToPlayer && ((!ytcenter.settings.experimentalFeatureTopGuide && !ytcenter.settings.ytExperimentFixedTopbar) || ((ytcenter.settings.experimentalFeatureTopGuide || ytcenter.settings.ytExperimentFixedTopbar) && ytcenter.settings.ytExperimentalLayotTopbarStatic))) {
            if (document.getElementById("watch-headline-container") || document.getElementById("page-container"))
              (document.getElementById("watch-headline-container") || document.getElementById("page-container")).scrollIntoView(true);
          }
        } else if (page === "channel") {
          ytcenter.page = "channel";
          if (document.body.innerHTML.indexOf("data-video-id=\"" !== -1)) {
            id = document.body.innerHTML.match(/data-video-id=\"(.*?)\"/)[1];
          } else if (document.body.innerHTML.indexOf("/v/") !== -1) {
            id = document.body.innerHTML.match(/\/v\/([0-9a-zA-Z_-]+)/)[1];
          } else if (document.body.innerHTML.indexOf("\/v\/" !== -1)) {
            id = document.body.innerHTML.match(/\\\/v\\\/([0-9a-zA-Z_-]+)/)[1];
          }
          con.log("Contacting: /get_video_info?video_id=" + id);
          ytcenter.utils.xhr({
            method: "GET",
            url: '/get_video_info?video_id=' + id,
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
                  ytcenter.player.config = ytcenter.player.modifyConfig(ytcenter.getPage(), {args: o});
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
        } else if (page === "search") {
          ytcenter.page = "search";
        } else {
          ytcenter.page = "normal";
        }
        ytcenter.player.listeners.addEventListener("onStateChange", function(state, b){
          if (ytcenter.doRepeat && ytcenter.settings.enableRepeat && state === 0) {
            ytcenter.player.getAPI().playVideo();
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
            
            ytcenter.events.performEvent("ui-refresh");
          } else {
            this.getOriginalListener()(large);
          }
        });
        
        if (ytcenter.feather) {
          var flashvars = document.getElementById("movie_player").getAttribute("flashvars").split("&"),
              args, i;
          for (i = 0; i < flashvars.length; i++) {
            args[decodeURIComponent(flashvars.split("=")[0])] = decodeURIComponent(flashvars.split("=")[0]);
            ytcenter.player.config = {args: args};
          }
        }
        
        if (page === "watch") {
          ytcenter.player.setYTConfig({"SHARE_ON_VIDEO_END": ytcenter.settings.enableYouTubeAutoSwitchToShareTab});
          if (uw.ytplayer && uw.ytplayer.config) {
            ytcenter.player.config = uw.ytplayer.config;
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
      });
      ytcenter.pageReadinessListener.addEventListener("bodyComplete", function(){
        ytcenter.guideMode();
      });
      ytcenter.spf.addEventListener("requested-before", function(){
        if (!ytcenter.settings.ytspf) throw new Error("SPF is disabled!");
      });
      uw.ytcenter = uw.ytcenter || {};
      uw.ytcenter.spf = uw.ytcenter.spf || {};
      ytcenter.spf.addEventListener("received-before", function(url, data){
        uw.ytcenter.spf.url = url;
        uw.ytcenter.spf.data = data;
        if (data.swfcfg && data.swfcfg.args) {
          data.swfcfg = ytcenter.player.modifyConfig(ytcenter.getPage(), data.swfcfg);
        } else if (data.html && data.html.content && data.html.content.indexOf("<script>var ytplayer = ytplayer || {};ytplayer.config = ") !== -1) {
          var a, i1, i2, content, tmp, tmp2, swfcfg;
          try {
            a = data.html.content.split("<script>var ytplayer = ytplayer || {};ytplayer.config = ")[1];
            a = a.split(";</script>")[0];
            try {
              swfcfg = JSON.parse(a);
            } catch (e) {
              swfcfg = eval("(" + a + ")");
            }
            swfcfg = ytcenter.player.modifyConfig(ytcenter.getPage(), swfcfg);
            content = data.html.content;
            i1 = content.indexOf("<script>var ytplayer = ytplayer || {};ytplayer.config = ");
            i2 = content.indexOf(";</script>");
            data.html.content = content.substring(0, i1 + "<script>var ytplayer = ytplayer || {};ytplayer.config = ".length) + JSON.stringify(swfcfg) + content.substring(i2);
          } catch (e) {
            con.error(e);
          }
        } else if (data.html && data.html.player && data.html.player.indexOf("<script>var ytplayer = ytplayer || {};ytplayer.config = ") !== -1) {
          var a, i1, i2, content, tmp, tmp2, swfcfg;
          try {
            a = data.html.player.split("<script>var ytplayer = ytplayer || {};ytplayer.config = ")[1];
            a = a.split(";</script>")[0];
            try {
              swfcfg = JSON.parse(a);
            } catch (e) {
              swfcfg = eval("(" + a + ")");
            }
            swfcfg = ytcenter.player.modifyConfig(ytcenter.getPage(), swfcfg);
            content = data.html.player;
            i1 = content.indexOf("<script>var ytplayer = ytplayer || {};ytplayer.config = ");
            i2 = content.indexOf(";</script>");
            data.html.player = content.substring(0, i1 + "<script>var ytplayer = ytplayer || {};ytplayer.config = ".length) + JSON.stringify(swfcfg) + content.substring(i2);
          } catch (e) {
            con.error(e);
          }
        }
        if (data.html && data.html.player && data.html.player.indexOf("var swf = \"") !== -1) {
          var a = data.html.player.split("type=\\\"application\\\/x-shockwave-flash\\\""),
              wmode = "";
          if (ytcenter.getPage(url) === "watch") {
            if (ytcenter.settings.flashWMode !== "none") {
             wmode = ytcenter.settings.flashWMode;
            }
          } else if (ytcenter.getPage(url) === "embed") {
            if (ytcenter.settings.embed_flashWMode !== "none") {
              wmode = ytcenter.settings.embed_flashWMode;
            }
          } else if (ytcenter.getPage(url) === "channel") {
            if (ytcenter.settings.channel_flashWMode !== "none") {
              wmode = ytcenter.settings.channel_flashWMode;
            }
          }
          a[0] += (wmode !== "" ? " wmode=\\\"" + wmode + "\\\" " : "");
          data.html.player = a.join("type=\\\"application\\\/x-shockwave-flash\\\"");
        }
        if (data.js) {
          data.js += "<script>ytcenter.spf.processed();</script>";
        }
        if (data.attr && data.attr.body && data.attr.body["class"]) {
          data.attr.body["class"] = ytcenter.classManagement.getClassesForElementByTagName("body", url) + " " + data.attr.body["class"];
        }
        return [url, data];
      });
      ytcenter.spf.__doUpdateConfig = false;
      uw.ytcenter.spf.processed = function(data){
        var url = ytcenter.utils.url(uw.ytcenter.spf.url);
        data = data || uw.ytcenter.spf.data;
        ytcenter.classManagement.applyClasses(uw.ytcenter.spf.url);
        
        if (data.swfcfg) {
          try {
            ytcenter.player.updateConfig(ytcenter.getPage(uw.ytcenter.spf.url), data.swfcfg);
          } catch (e) {
            con.error(e);
          }
          ytcenter.videoHistory.addVideo(data.swfcfg.args.video_id);
        }
        ytcenter.placementsystem.clear();
        if (url.pathname !== "/watch") {
          if (ytcenter.getPage(uw.ytcenter.spf.url) === "feed_what_to_watch") {
            ytcenter.intelligentFeed.setup();
          }
          ytcenter.player.turnLightOn();
        } else {
          if (ytcenter.settings.lightbulbAutoOff)
            ytcenter.player.turnLightOff();
          ytcenter.guideMode();
          ytcenter.player.setYTConfig({"SHARE_ON_VIDEO_END": ytcenter.settings.enableYouTubeAutoSwitchToShareTab});
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
          
          $CreateDownloadButton();
          $CreateRepeatButton();
          $CreateLightButton();
          $CreateAspectButton();
          $CreateResizeButton();
          
          initPlacement();
          
          if (ytcenter.settings.scrollToPlayer && (!ytcenter.settings.experimentalFeatureTopGuide || (ytcenter.settings.experimentalFeatureTopGuide && ytcenter.settings.ytExperimentalLayotTopbarStatic))) {
            (document.getElementById("watch-headline-container") || document.getElementById("page-container")).scrollIntoView(true);
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
        }
        return [data];
      };
      ytcenter.spf.addEventListener("processed", uw.ytcenter.spf.processed);
      
      if (ytcenter.getPage() === "embed") {
        var id = url.pathname.match(/\/embed\/([0-9a-zA-Z_-]+)/)[1];
        con.log("[Embed] Contacting: /get_video_info?video_id=" + id);
        ytcenter.utils.xhr({
          method: "GET",
          url: '/get_video_info?video_id=' + id,
          headers: {
            "Content-Type": "text/plain"
          },
          onload: function(response){
            if (response.responseText) {
              con.log("[Embed] Video data loaded!");
              var o = {};
              var s = response.responseText.split("&");
              for (var i = 0; i < s.length; i++) {
                var ss = s[i].split("=");
                o[ss[0]] = decodeURIComponent(ss[1]);
              }
              ytcenter._tmp_embed.loaded = true;
              ytcenter._tmp_embed.fmt_list = o.fmt_list;
              ytcenter._tmp_embed.dash = o.dash;
              ytcenter._tmp_embed.dashmpd = o.dashmpd;
              ytcenter._tmp_embed.url_encoded_fmt_stream_map = o.url_encoded_fmt_stream_map;
              if (o.url_encoded_fmt_stream_map) {
                ytcenter.video.streams = ytcenter.parseStreams(o);
                ytcenter.player.config.args.fmt_list = o.fmt_list;
                ytcenter.player.config.args.url_encoded_fmt_stream_map = o.url_encoded_fmt_stream_map;
              }
              if (ytcenter._tmp_embed.callback) {
                ytcenter._tmp_embed.callback();
              }
            } else {
              con.error("[Embed] Couldn't load video data!");
              (document.getElementById("player-legacy") || document.getElementById("player")).style.display = "";
            }
          },
          onerror: function(){
            con.error("[Embed] Couldn't load video data!");
            ytcenter.video.streams = [];
            ytcenter._tmp_embed.loaded = true;
            if (ytcenter._tmp_embed.callback) {
              ytcenter._tmp_embed.callback();
            }
          }
        });
      }
      
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
          try {
            var d = JSON.parse(e.data);
            if (d.method === "CrossOriginXHR") {
              injected_xhr(d.id, d.arguments[0]);
            }
          } catch (e) {}
        }, false);
        
        inject(main_function);
      } else {
        try {
          main_function(false, @identifier@);
        } catch (e) {
        }
      }
    } catch (e) {
      window.addEventListener("message", function(e){
        try {
          var d = JSON.parse(e.data);
          if (d.method === "CrossOriginXHR") {
            injected_xhr(d.id, d.arguments[0]);
          }
        } catch (e) {}
      }, false);
      
      inject(main_function);
    }
  } else {
    main_function(false, @identifier@);
  }
})();
