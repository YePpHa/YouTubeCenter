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
// @match           http://dl.dropbox.com/u/13162258/YouTube%20Center/*
// @match           https://dl.dropbox.com/u/13162258/YouTube%20Center/*
// @match           http://userscripts.org/scripts/source/114002.meta.js
// @match           http://s.ytimg.com/yts/jsbin/*
// @match           https://s.ytimg.com/yts/jsbin/*
// @include         http://*.youtube.com/*
// @include         https://*.youtube.com/*
// @include         http://dl.dropbox.com/u/13162258/YouTube%20Center/*
// @include         https://dl.dropbox.com/u/13162258/YouTube%20Center/*
// @exclude         http://apiblog.youtube.com/*
// @exclude         https://apiblog.youtube.com/*
// @downloadURL     http://userscripts.org/scripts/source/114002.user.js
// @updateURL       http://userscripts.org/scripts/source/114002.meta.js
// @updateVersion   @ant-revision@
// @run-at          document-start
// @priority        9001
// ==/UserScript==

(function(){
  function _inject(func) {
    try {
      var script = document.createElement("script");
      script.setAttribute("type", "text/javascript");
      if (typeof func === "string") func = "function(){" + func + "}";
      script.appendChild(document.createTextNode("(" + func + ")();\n//@ sourceURL=YouTubeCenter.js"));
      var __p = (document.body || document.head || document.documentElement);
      __p.appendChild(script);
      __p.removeChild(script);
    } catch (e) {}
  }
  function _xhr(id, details) {
    if (typeof GM_xmlhttpRequest !== "undefined") {
      GM_xmlhttpRequest(details);
      return true;
    } else {
      var xmlhttp;
      if (typeof XMLHttpRequest != "undefined") {
        xmlhttp = new XMLHttpRequest();
      } else if (typeof opera != "undefined" && typeof opera.XMLHttpRequest != "undefined") {
        xmlhttp = new opera.XMLHttpRequest();
      } else if (typeof uw != "undefined" && typeof uw.XMLHttpRequest != "undefined") {
        xmlhttp = new uw.XMLHttpRequest();
      } else {
        _inject("window.ytcenter.xhr.onerror(" + d.id + ", {})");
        return false;
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
        _inject("window.ytcenter.xhr.onreadystatechange(" + id + ", " + JSON.stringify(responseState) + ")");
        if (xmlhttp.readyState == 4) {
          if (xmlhttp.status >= 200 && xmlhttp.status < 300) {
            _inject("window.ytcenter.xhr.onload(" + id + ", " + JSON.stringify(responseState) + ")");
          }
          if (xmlhttp.status < 200 || xmlhttp.status >= 300) {
            _inject("window.ytcenter.xhr.onerror(" + id + ", " + JSON.stringify(responseState) + ")");
          }
        }
      };
      try {
        xmlhttp.open(details.method, details.url);
      } catch(e) {
        _inject("window.ytcenter.xhr.onerror(" + id + ", {responseXML:'',responseText:'',readyState:4,responseHeaders:'',status:403,statusText:'Forbidden'})");
        return false;
      }
      if (details.headers) {
        for (var prop in details.headers) {
          xmlhttp.setRequestHeader(prop, details.headers[prop]);
        }
      }
      xmlhttp.send((typeof(details.data) !== 'undefined') ? details.data : null);
      return true
    }
    return false;
  }
  
  var ___main_function = function(injected){
    "use strict"
    if (typeof injected === "undefined") injected = true;
    
    /* UTILS */
    function $SaveData(key, value) {
      try {
        if (typeof GM_getValue !== "undefined" && (typeof GM_getValue.toString === "undefined" || GM_getValue.toString().indexOf("not supported") === -1)) {
          con.log("Saving " + key + " using GM_setValue");
          GM_setValue(key, value);
          if (GM_getValue(key, null) === value) return true; // validation
        }
      } catch (e) {
        con.error(e);
      }
      try {
        if (typeof localStorage !== "undefined") {
          con.log("Saving " + key + " using localStorage");
          localStorage[key] = value;
          if (localStorage[key] === value) return true; // validation
        }
      } catch (e) {
        con.error(e);
      }
      try {
        if (typeof uw.localStorage !== "undefined") {
          con.log("Saving " + key + " using uw.localStorage");
          uw.localStorage[key] = value;
          if (uw.localStorage[key] === value) return true; // validation
        }
      } catch (e) {
        con.error(e);
      }
      try {
        if (typeof document.cookie !== "undefined") {
          con.log("Saving " + key + " using document.cookie");
          ytcenter.utils.setCookie(key, value, null, "/", 1000*24*60*60*1000);
          if (ytcenter.utils.getCookie(name) === value) return true; // validation
        }
      } catch (e) {
        con.error(e);
      }
      con.error("Couldn't save data!");
      return false;
    }

    function $LoadData(key, def) {
      try {
        if (typeof GM_getValue !== "undefined" && (typeof GM_getValue.toString === "undefined" || GM_getValue.toString().indexOf("not supported") === -1)) {
          con.log("Loading " + key + " using GM_getValue");
          var d = GM_getValue(key, null);
          if (d !== null) return d;
        }
      } catch (e) {
        con.error(e);
      }
      try {
        if (typeof localStorage != "undefined") {
          con.log("Loading " + key + " using localStorage");
          if (localStorage[key]) return localStorage[key];
        }
      } catch (e) {
        con.error(e);
      }
      try {
        if (typeof uw.localStorage != "undefined") {
          con.log("Loading " + key + " using uw.localStorage");
          if (uw.localStorage[key]) return uw.localStorage[key];
        }
      } catch (e) {
        con.error(e);
      }
      try {
        if (typeof document.cookie != "undefined") {
          con.log("Loading " + key + " using document.cookie");
          var d = ytcenter.utils.getCookie(name);
          if (d) return d;
        }
      } catch (e) {
        con.error(e);
      }
      con.error("Couldn't load data!");
      return def;
    }
    function $UpdateChecker() {
      if (!ytcenter.settings.enableUpdateChecker) return;
      var curr = (new Date().getTime());
      var c = curr - 1000*60*60*parseInt(ytcenter.settings.updateCheckerInterval);
      con.log("Checking for updates in " + ((ytcenter.settings.updateCheckerLastUpdate - c)/1000/60/60) + " hours...");
      if (c >= ytcenter.settings.updateCheckerLastUpdate) {
        con.log("Checking for updates now...");
        ytcenter.settings.updateCheckerLastUpdate = curr;
        ytcenter.saveSettings();
        ytcenter.checkForUpdates();
      }
    }
    
    function $HasAttribute(elm, attr) {
      for (var i = 0; i < elm.attributes.length; i++) {
        if (elm.attributes[i].name == attr) return true;
      }
      return false;
    }
    
    function $GetOffset(elm) {
      var x = 0;
      var y = 0;
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
      btn.setAttribute("title", ytcenter.locale.BUTTON_ASPECT_TOOLTIP);
      btn.setAttribute("type", "button");
      btn.setAttribute("role", "button");
      ytcenter.database.codeRegister(btn, function(){
        this.setAttribute("title", ytcenter.locale.BUTTON_ASPECT_TOOLTIP);
        if (ytcenter.settings.aspectEnable) {
          $RemoveCSS(this, "hid");
        } else {
          $AddCSS(this, "hid");
        }
      });
      
      var btnContent = document.createElement("span");
      btnContent.className = "yt-uix-button-content";
      btnContent.textContent = ytcenter.locale.BUTTON_ASPECT_TEXT;
      ytcenter.database.register(btnContent, 'BUTTON_ASPECT_TEXT', 'text');
      
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
      item.textContent = ytcenter.locale['BUTTON_ASPECT_NONE'];
      ytcenter.database.register(item, 'BUTTON_ASPECT_NONE', 'text');
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
      ytcenter.database.register(item, 'BUTTON_ASPECT_NONE', '@text');
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
      item.textContent = ytcenter.locale['BUTTON_ASPECT_DEFAULT'];
      
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
      ytcenter.database.register(item, 'BUTTON_ASPECT_DEFAULT', '@text');
      li = document.createElement("li");
      li.setAttribute("role", "menuitem");
      li.appendChild(item);
      
      menu.appendChild(li);
      
      for (var group in groups) {
        if (groups.hasOwnProperty(group)) {
          item = document.createElement("li");
          item.style.fontWeight = "bold";
          item.style.padding = "6px";
          item.textContent = ytcenter.locale[groups[group]];
          ytcenter.database.register(item, groups[group], 'text');
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
              item.textContent = ytcenter.locale[groupChoices[child]];
              ytcenter.database.register(item, groupChoices[child], 'text');
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
            item.textContent = ytcenter.locale["BUTTON_ASPECT_24:10"];
            ytcenter.database.register(item, "BUTTON_ASPECT_24:10", 'text');
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
      var label = document.createTextNode(ytcenter.locale.SETTINGS_ASPECT_REMEMBER);
      itemLabel.appendChild(label);
      ytcenter.database.register(label, 'SETTINGS_ASPECT_REMEMBER', 'text');
      
      var itemCheckbox = $CreateCheckbox(ytcenter.settings.aspectSave);
      itemCheckbox.style.marginLeft = "3px";
      
      itemLabel.addEventListener("click", function(){
        ytcenter.settings.aspectSave = !ytcenter.settings.aspectSave;
        if (ytcenter.settings.aspectSave) {
          $AddCSS(itemCheckbox, "checked");
          ytcenter.settings.aspectValue = playerAspectTMP;
        } else {
          $RemoveCSS(itemCheckbox, "checked");
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
          return (item.config.large ? ytcenter.locale['SETTINGS_RESIZE_LARGE'] : ytcenter.locale['SETTINGS_RESIZE_SMALL']);
          subtext.textContent = (item.config.align ? ytcenter.locale['SETTINGS_RESIZE_ALIGN'] : ytcenter.locale['SETTINGS_RESIZE_CENTER']);
        } else {
          return dim[0] + "×" + dim[1];
          subtext.textContent = (item.config.large ? ytcenter.locale['SETTINGS_RESIZE_LARGE'] : ytcenter.locale['SETTINGS_RESIZE_SMALL']) + " - " + (item.config.align ? ytcenter.locale['SETTINGS_RESIZE_ALIGN'] : ytcenter.locale['SETTINGS_RESIZE_CENTER']);
        }
      }
      function getItemSubText(item) {
        if (isNaN(parseInt(item.config.width)) && isNaN(parseInt(item.config.height))) {
          return (item.config.align ? ytcenter.locale['SETTINGS_RESIZE_ALIGN'] : ytcenter.locale['SETTINGS_RESIZE_CENTER']) + (item.config.scrollToPlayer ? " - " + ytcenter.locale['SETTINGS_RESIZE_SCROLLTOPLAYER'] : "");
        } else {
          return (item.config.large ? ytcenter.locale['SETTINGS_RESIZE_LARGE'] : ytcenter.locale['SETTINGS_RESIZE_SMALL']) + " - " + (item.config.align ? ytcenter.locale['SETTINGS_RESIZE_ALIGN'] : ytcenter.locale['SETTINGS_RESIZE_CENTER']) + (item.config.scrollToPlayer ? " - " + ytcenter.locale['SETTINGS_RESIZE_SCROLLTOPLAYER'] : "");
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
          
          if (ytcenter.player.currentResizeId === item.id) {
            setValue(ytcenter.player.currentResizeId);
          }
          
          var title = document.createElement("span");
          title.textContent = getItemTitle(item);
          ytcenter.database.codeRegister(title, function(){
            title.textContent = getItemTitle(item);
          });
          title.style.display = "block";
          var subtext = document.createElement("span");
          subtext.textContent = getItemSubText(item);
          ytcenter.database.codeRegister(subtext, function(){
            subtext.textContent = getItemSubText(item);
          });
          subtext.style.display = "block";
          
          ytcenter.listeners.addEvent(li, "click", function(){
            try {
              ytcenter.player.currentResizeId = item.id;
              ytcenter.player.updateResize();
              setValue(ytcenter.player.currentResizeId);
              
              document.body.click();
              
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
        $RemoveCSS(btn, "hid");
      } else {
        $AddCSS(btn, "hid");
      }
      
      updateItems(ytcenter.settings["resize-playersizes"]);
      ytcenter.database.codeRegister(btn, function(){
        updateItems(ytcenter.settings["resize-playersizes"]);
      });
      ytcenter.player.resizeCallback.push(function(){
        updateItems(ytcenter.settings["resize-playersizes"]);
      });
      
      ytcenter.database.codeRegister(null, function(){
        if (ytcenter.settings.resizeEnable) {
          $RemoveCSS(btn, "hid");
        } else {
          $AddCSS(btn, "hid");
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
      ytcenter.database.codeRegister(btn, function(){
        if (ytcenter.settings.lightbulbEnable) {
          $RemoveCSS(this, "hid");
        } else {
          $AddCSS(this, "hid");
        }
      });
      btn.setAttribute("onclick", ";return false;");
      btn.setAttribute("type", "button");
      btn.setAttribute("role", "button");
      btn.className = "yt-uix-button yt-uix-tooltip" + (ytcenter.settings.lightbulbEnable ? "" : " hid") + (!ytcenter.watch7 ? " yt-uix-button-default" : " yt-uix-button-text");
      btn.title = ytcenter.locale['LIGHTBULB_TOOLTIP'];
      //btn.style.marginLeft = ".5em";
      ytcenter.database.register(btn, 'LIGHTBULB_TOOLTIP', '@title');
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
      ytcenter.database.codeRegister(btn, function(){
        if (ytcenter.settings.enableRepeat) {
          $RemoveCSS(this, 'hid');
        } else {
          $AddCSS(this, 'hid');
        }
      });
      btn.title = ytcenter.locale['BUTTON_REPEAT_TOOLTIP'];
      ytcenter.database.register(btn, 'BUTTON_REPEAT_TOOLTIP', '@title');
      btn.setAttribute("role", "button");
      btn.setAttribute("type", "button");
      btn.setAttribute("onclick", ";return false;");
      btn.className = "yt-uix-button yt-uix-tooltip" + (!ytcenter.watch7 ? " yt-uix-button-default" : " yt-uix-button-text") + (ytcenter.settings.autoActivateRepeat ? " ytcenter-uix-button-toggled" : "") + (ytcenter.settings.enableRepeat ? "" : " hid");
      btn.addEventListener("click", function(){
        if (ytcenter.watch7) {
          if (ytcenter.doRepeat) {
            $RemoveCSS(this, 'ytcenter-uix-button-toggled');
            $AddCSS(this, 'yt-uix-button-text');
            ytcenter.doRepeat = false;
          } else {
            $AddCSS(this, 'ytcenter-uix-button-toggled');
            $RemoveCSS(this, 'yt-uix-button-text');
            ytcenter.doRepeat = true;
          }
        } else {
          if (ytcenter.doRepeat) {
            $RemoveCSS(this, 'yt-uix-button-toggled');
            ytcenter.doRepeat = false;
          } else {
            $AddCSS(this, 'yt-uix-button-toggled');
            ytcenter.doRepeat = true;
          }
        }
      }, false);
      if (ytcenter.settings.autoActivateRepeat) {
        ytcenter.doRepeat = true;
      }
      
      var iconw = document.createElement("span");
      iconw.className = "yt-uix-button-icon-wrapper" + (!ytcenter.settings.repeatShowIcon ? " hid" : "");
      ytcenter.database.codeRegister(iconw, function(){
        if (ytcenter.settings.repeatShowIcon) {
          $RemoveCSS(this, 'hid');
        } else {
          $AddCSS(this, 'hid');
        }
      });
      var icon = document.createElement("img");
      icon.className = "yt-uix-button-icon " + (ytcenter.watch7 ? "ytcenter-repat-icon" : "yt-uix-button-icon-playlist-bar-autoplay");
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
      t.textContent = ytcenter.locale['BUTTON_REPEAT_TEXT'];
      ytcenter.database.register(t, 'BUTTON_REPEAT_TEXT', 'text');
      
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
        return ytcenter.locale['UNKNOWN'];
      })();
      for (var i = 0; i < ytcenter.video.stream.length; i++) {
        if ((stream == null || $ArrayIndexOf(priority, ytcenter.video.stream[i].quality) > $ArrayIndexOf(priority, stream.quality)) && $ArrayIndexOf(priority, ytcenter.video.stream[i].quality) <= $ArrayIndexOf(priority, ytcenter.settings.downloadQuality) && ytcenter.video.stream[i].type && ytcenter.video.stream[i].type.indexOf(format) == 0 && ytcenter.video.stream[i].url) {
          stream = ytcenter.video.stream[i];
        }
      }
      return stream;
    }
    function $CreateDownloadButton() {
      var g = document.createElement("span");
      g.style.margin = "0 2px 0 0";
      ytcenter.database.codeRegister(g, function(){
        if (ytcenter.settings.enableDownload) {
          $RemoveCSS(this, "hid");
          this.style.display = "";
        } else {
          $AddCSS(this, "hid");
          this.style.display = "none";
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
      ytcenter.database.codeRegister(btn1a, function(){
        stream = $DownloadButtonStream();
        if (stream) {
          btn1a.href = ytcenter.video.downloadLink(stream);
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
          highres: ytcenter.locale['HIGHRES'],
          hd1080: ytcenter.locale['HD1080'],
          hd720: ytcenter.locale['HD720'],
          large: ytcenter.locale['LARGE'],
          medium: ytcenter.locale['MEDIUM'],
          small: ytcenter.locale['SMALL']
        }[stream.quality];
        btn1.title = $TextReplacer(ytcenter.locale['BUTTON_DOWNLOAD_TOOLTIP'], {
          stream_name: stream_name,
          stream_resolution: stream.dimension.split("x")[1] + "p",
          stream_dimension: stream.dimension,
          stream_3d: (stream.stereo3d && stream.stereo3d == 1 ? "&nbsp;3D" : ""),
          stream_type: (function(stream){
            for (var i = 0; i < ytcenter.video.format.length; i++) {
              if (stream.type.indexOf(ytcenter.video.format[i].type) == 0) {
                return ytcenter.locale[ytcenter.video.format[i].name];
              }
            }
            return ytcenter.locale['UNKNOWN'];
          })(stream)
        });
      } else {
        btn1.title = $TextReplacer(ytcenter.locale['BUTTON_DOWNLOAD_TOOLTIP_NONE'], {
          type: (function(){
            for (var i = 0; i < ytcenter.video.format.length; i++) {
              if (ytcenter.settings.downloadFormat == ytcenter.video.format[i].key) {
                return ytcenter.locale[ytcenter.video.format[i].name];
              }
            }
            return ytcenter.locale['UNKNOWN'];
          })()
        });
      }
      ytcenter.database.codeRegister(btn1, function(){
        var stream = $DownloadButtonStream();
        if (stream != null) {
          var stream_name = {
            highres: ytcenter.locale['HIGHRES'],
            hd1080: ytcenter.locale['HD1080'],
            hd720: ytcenter.locale['HD720'],
            large: ytcenter.locale['LARGE'],
            medium: ytcenter.locale['MEDIUM'],
            small: ytcenter.locale['SMALL']
          }[stream.quality];
          
          this.title = $TextReplacer(ytcenter.locale['BUTTON_DOWNLOAD_TOOLTIP'], {
            stream_name: stream_name,
            stream_resolution: stream.dimension.split("x")[1] + "p",
            stream_dimension: stream.dimension,
            stream_3d: (stream.stereo3d && stream.stereo3d == 1 ? " 3D" : ""),
            stream_type: (function(stream){
              for (var i = 0; i < ytcenter.video.format.length; i++) {
                if (stream.type.indexOf(ytcenter.video.format[i].type) == 0) {
                  return ytcenter.locale[ytcenter.video.format[i].name];
                }
              }
              return ytcenter.locale['UNKNOWN'];
            })(stream)
          });
        } else {
          this.title = $TextReplacer(ytcenter.locale['BUTTON_DOWNLOAD_TOOLTIP_NONE'], {
            type: (function(){
              for (var i = 0; i < ytcenter.video.format.length; i++) {
                if (ytcenter.settings.downloadFormat == ytcenter.video.format[i].key) {
                  return ytcenter.locale[ytcenter.video.format[i].name];
                }
              }
              return ytcenter.locale['UNKNOWN'];
            })()
          });
        }
      });
      btn1a.appendChild(btn1);
      var btn1_text = document.createElement("span");
      btn1_text.className = "yt-uix-button-content";
      btn1_text.textContent = ytcenter.locale['BUTTON_DOWNLOAD_TEXT'];
      ytcenter.database.register(btn1_text, 'BUTTON_DOWNLOAD_TEXT', 'text');
      btn1.appendChild(btn1_text);
      g.appendChild(btn1a);
      var btn2 = document.createElement("button");
      btn2.className = "end yt-uix-button yt-uix-tooltip" + (!ytcenter.watch7 ? " yt-uix-button-default" : " yt-uix-button-text");
      btn2.setAttribute("onclick", ";return false;");
      btn2.setAttribute("type", "button");
      btn2.setAttribute("role", "button");
      btn2.title = ytcenter.locale['BUTTON_DOWNlOAD2_TOOLTIP'];
      ytcenter.database.register(btn2, 'BUTTON_DOWNlOAD2_TOOLTIP', '@title');
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
            obj[ytcenter.video.format[i].type] = ytcenter.locale[ytcenter.video.format[i].name];
          }
          return obj;
        })();
        var sorted = {};
        for (var i = 0; i < ytcenter.video.stream.length; i++) {
          if (ytcenter.video.stream[i].type) {
            var f = ytcenter.video.stream[i].type.split(";")[0];
            if (groups.hasOwnProperty(f)) {
              if (!sorted[groups[f]]) sorted[groups[f]] = [];
              sorted[groups[f]].push(ytcenter.video.stream[i]);
            } else {
              if (!sorted['UNKNOWN']) sorted['UNKNOWN'] = [];
              sorted['UNKNOWN'].push(ytcenter.video.stream[i]);
            }
          } else {
            if (!sorted['UNKNOWN']) sorted['UNKNOWN'] = [];
            sorted['UNKNOWN'].push(ytcenter.video.stream[i]);
          }
        }
        return sorted;
      })();
      
      var menu = document.createElement("ul");
      menu.className = "yt-uix-button-menu yt-uix-button-menu-default yt-uix-button-menu-external hid" + (ytcenter.settings.show3DInDownloadMenu ? "" : " ytcenter-menu-3d-hide");
      menu.setAttribute("role", "menu");
      menu.setAttribute("aria-haspopup", "true");
      ytcenter.database.codeRegister(menu, function(){
        if (ytcenter.settings.show3DInDownloadMenu) {
          $RemoveCSS(this, "ytcenter-menu-3d-hide");
        } else {
          $AddCSS(this, "ytcenter-menu-3d-hide");
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
            title.textContent = key;
            title.className = "ytcenter-downloadmenu-" + key;
          } else {
            title.className = "ytcenter-downloadmenu-unknown";
            title.textContent = ytcenter.locale['UNKNOWN'];
            ytcenter.database.register(title, ytcenter.locale['UNKNOWN'], 'text');
          }
          
          menu.appendChild(title);
          
          for (var i = 0; i < stream_groups[key].length; i++) {
            var is3D = (stream_groups[key][i].stereo3d && stream_groups[key][i].stereo3d == 1 ? true : false);
            var item = document.createElement("a");
            if (!stream_groups[key][i].url) {
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
              item.href = ytcenter.video.downloadLink(stream_groups[key][i]);
              var downloadStreamListener = (function(_stream){
                return function(e){
                  if (!ytcenter.settings.downloadAsLinks) {
                    ytcenter.video.download(_stream.itag);
                    e.preventDefault();
                  }
                };
              })(stream_groups[key][i]);
              item.addEventListener("click", downloadStreamListener, false);
              ytcenter.database.codeRegister(item, (function(__stream, item, _downloadStreamListener){
                return function(){
                  item.href = ytcenter.video.downloadLink(__stream);
                };
              })(stream_groups[key][i], item, downloadStreamListener));
            }
            
            var stream_name = {
              highres: ytcenter.locale['HIGHRES'],
              hd1080: ytcenter.locale['HD1080'],
              hd720: ytcenter.locale['HD720'],
              large: ytcenter.locale['LARGE'],
              medium: ytcenter.locale['MEDIUM'],
              small: ytcenter.locale['SMALL']
            }[stream_groups[key][i].quality];
            
            item.innerHTML = $TextReplacer(ytcenter.locale['BUTTON_DOWNLOAD_MENU_ITEM_TEXT'], {
              stream_name: stream_name,
              stream_resolution: (stream_groups[key][i].dimension ? stream_groups[key][i].dimension.split("x")[1] : "") + "p",
              stream_dimension: (stream_groups[key][i].dimension ? stream_groups[key][i].dimension : ""),
              stream_3d: (is3D ? "&nbsp;3D" : "")
            });
            ytcenter.database.codeRegister(item, (function(stream, is3D){
              return function(){
                var stream_name = {
                  highres: ytcenter.locale['HIGHRES'],
                  hd1080: ytcenter.locale['HD1080'],
                  hd720: ytcenter.locale['HD720'],
                  large: ytcenter.locale['LARGE'],
                  medium: ytcenter.locale['MEDIUM'],
                  small: ytcenter.locale['SMALL']
                }[stream.quality];
                this.innerHTML = $TextReplacer(ytcenter.locale['BUTTON_DOWNLOAD_MENU_ITEM_TEXT'], {
                  stream_name: stream_name,
                  stream_resolution: stream.dimension.split("x")[1] + "p",
                  stream_dimension: stream.dimension,
                  stream_3d: (is3D ? "&nbsp;3D" : "")
                });
              };
            })(stream_groups[key][i], is3D));
            var li = document.createElement("li");
            li.className = "ytcenter-downloadmenu-" + (key === "UNKNOWN" ? "unknown" : key) + (is3D ? " ytcenter-menu-item-3d" : "");
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
      mp3title.textContent = ytcenter.locale['BUTTON_DOWNLOAD_MENU_MP3SERVICES'];
      ytcenter.database.register(mp3title, 'BUTTON_DOWNLOAD_MENU_MP3SERVICES', 'text');
      ytcenter.database.codeRegister(mp3title, function(){
        if (ytcenter.settings.mp3Services === '') {
          $AddCSS(this, 'hid');
          this.style.display = "none";
        } else {
          $RemoveCSS(this, 'hid');
          this.style.display = "";
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
        item.setAttribute("href", $TextReplacer(ytcenter.mp3services[i].value, {
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
        
        ytcenter.database.codeRegister(li, (function(mp3, li){
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
              $RemoveCSS(li, 'hid');
              li.style.display = "";
            } else {
              $AddCSS(li, 'hid');
              li.style.display = "none";
            }
          };
        })(ytcenter.mp3services[i], li));
        
        item.textContent = ytcenter.locale[ytcenter.mp3services[i].label];
        ytcenter.database.register(item, ytcenter.mp3services[i].label, 'text');
        li.appendChild(item);
        menu.appendChild(li);
      }
      
      
      btn2.appendChild(menu);
      g.appendChild(btn2);
      
      ytcenter.placementsystem.registerElement(g, "@downloadgroup");
    }
    function $CreateSettingsUI() {
      var container = document.createElement("div");
      container.id = "ytcenter-settings";
      var root = document.createElement("div");
      root.setAttribute("style", "background:#ededed;padding-top: 7px;border-bottom: 1px solid #e6e6e6;margin-bottom: 10px;");
      
      var header = document.createElement("div");
      if (ytcenter.watch7) {
        header.setAttribute("style", "padding:10px 35px 0;font-size:18px;font-weight:bold");
      } else {
        header.setAttribute("style", "width:945px;margin:0 auto;padding:10px 35px 0;font-size:18px;font-weight:bold");
      }
      header.textContent = ytcenter.locale['SETTINGS_TITLE'];
      header.className = "ytcenter-settings-title";
      var tabsContainer = document.createElement("div");
      tabsContainer.className = "ytcenter-settings-header";
      if (ytcenter.watch7) {
        tabsContainer.setAttribute("style", "padding: 0px 50px;");
      } else {
        tabsContainer.setAttribute("style", "width:945px;margin:0 auto;padding: 0px 50px;");
      }
      container.className = "hid";
      container.setAttribute("style", "position:relative;width:100%;background:#ffffff;" + (ytcenter.watch7 ? "border-bottom:1px solid #dbdbdb;" : ""));
      var content = document.createElement("div");
      if (!ytcenter.watch7) {
        content.style.width = "945px";
        content.style.margin = "0 auto";
      }
      root.appendChild(header);
      root.appendChild(tabsContainer);
      container.appendChild(root);
      container.appendChild(content);
      if (!ytcenter.watch7) {
        var hr = document.createElement("div");
        hr.setAttribute("style", "margin: 20px 0!important");
        hr.className = "yt-horizontal-rule";
        //hr.style.zIndex = "0";
        var hr1 = document.createElement("div");
        hr1.className = "first";
        var hr2 = document.createElement("div");
        hr2.className = "second";
        var hr3 = document.createElement("div");
        hr3.className = "third";
        hr.appendChild(hr1);
        hr.appendChild(hr2);
        hr.appendChild(hr3);
        container.appendChild(hr);
      }
      
      var tabs = document.createElement("ul");
      tabs.className = "clearfix"/* + (!ytcenter.watch7 ? " yt-uix-button-group" : "")*/;
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
          //tab.className = "yt-uix-button yt-uix-button-epic-nav-item" + (first && ytcenter.watch7 ? " selected" : (first ? " yt-uix-button-toggled" : "")) + (!ytcenter.watch7 ? " yt-uix-button yt-uix-button-default" + (first ? " start" : "") : "");
          tab.className = "yt-uix-button yt-uix-button-epic-nav-item" + (first ? " selected" : "");
          tab.setAttribute("role", "button");
          //if (ytcenter.watch7) {
            tab.style.marginLeft = "3px";
            tab.style.paddingLeft = ".9em";
            tab.style.paddingRight = ".9em";
            li.style.marginLeft = "13px";
          //}
          var bc = document.createElement("span");
          bc.className = "yt-uix-button-content";
          bc.textContent = ytcenter.locale[key];
          ytcenter.database.register(bc, key, 'text', {});
          tab.appendChild(bc);
          tab.addEventListener("click", (function(tabs, tc, tabgroups){
            return function(){
              for (var i = 0; i < tabs.children.length; i++) {
                //if (ytcenter.watch7) {
                  $RemoveCSS(tabs.children[i].firstChild, "selected");
                /*} else {
                  $RemoveCSS(tabs.children[i].firstChild,  "yt-uix-button-toggled");
                }*/
              }
              for (var i = 0; i < tabgroups.children.length; i++) {
                $AddCSS(tabgroups.children[i], "hid");
              }
              //if (ytcenter.watch7) {
                $AddCSS(this, "selected");
              /*} else {
                $AddCSS(this, "yt-uix-button-toggled");
              }*/
              $RemoveCSS(tc, "hid");
              ytcenter.database.applyLanguage(ytcenter.locale);
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
      } else {
        con.error("Settings UI - Couldn't find element to append");
      }
      
      var btn = document.createElement("button");
      btn.id = "masthead-user-button";
      /*btn.style.padding = "0 5px 0 2px";
      btn.style.height = "33px";*/
      if (document.getElementById("masthead-gaia-photo-expander")) {
        btn.style.marginTop = "3px";
      } else if (document.getElementById("masthead-user-expander")) {
        btn.style.verticalAlign = "middle";
      }
      btn.title = ytcenter.locale['BUTTON_SETTINGS_TITLE'];
      ytcenter.database.register(btn, 'BUTTON_SETTINGS_TITLE', '@title');
      btn.setAttribute("type", "button");
      btn.setAttribute("role", "button");
      btn.setAttribute("onclick", ";return false;");
      btn.className = "yt-uix-tooltip-reverse yt-uix-button " + (ytcenter.watch7 ? "yt-uix-button-text" : "yt-uix-button-text") + " yt-uix-tooltip";
      var btnt = document.createElement("span");
      btnt.className = "yt-uix-button-icon-wrapper";
      /*btnt.textContent = ytcenter.locale['BUTTON_SETTINGS_CONTENT'];
      ytcenter.database.register(btnt, 'BUTTON_SETTINGS_CONTENT', 'text');*/
      /*var arrowicon = document.createElement("span");
      arrowicon.className = "yt-uix-expander-arrow";
      arrowicon.style.marginLeft = "2px";
      btnt.appendChild(arrowicon);*/
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
      
      btn.addEventListener("click", (function(c){
        var toggled = false;
        return function(){
          con.log("Settings Button -> " + toggled);
          if (toggled) {
            $AddCSS(c, "hid");
            toggled = false;
          } else {
            $RemoveCSS(c, "hid");
            toggled = true;
          }
          ytcenter.refreshHomepage();
        };
      })(container), false);
      var msthdsr = document.getElementById("masthead-user") || document.getElementById("yt-masthead-user") || document.getElementById("yt-masthead-signin");
      if (msthdsr) {
        if (document.getElementById("yt-masthead-signin")) {
          btn.style.marginLeft = "10px";
        }
        msthdsr.appendChild(btn);
      } else {
        con.error("Settings UI - Couldn't add settings button");
      }
    }
    
    function $CreateSettingElement(tab, recipe) {
      var wrapper = document.createElement("div");
      wrapper.style.padding = "4px 0";
      if (recipe.label) {
        var label = document.createElement("span");
        label.style.display = "inline-block";
        label.style.width = "178px";
        label.style.color = "#555";
        var ltext = document.createTextNode(ytcenter.locale[recipe.label]);
        label.appendChild(ltext);
        ytcenter.database.register(ltext, recipe.label, 'text', {});
        
        if (recipe.tooltip) {
          var tooltip = document.createElement("p");
          tooltip.style.color = "#9E9E9E";
          tooltip.style.fontSize = "11px";
          tooltip.style.width = "170px";
          tooltip.textContent = ytcenter.locale[recipe.tooltip];
          ytcenter.database.register(tooltip, recipe.tooltip, 'text', {});
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
            var defaultLabelText = ytcenter.locale[recipe.list[0].label];
            for (var i = 0; i < recipe.list.length; i++) {
              var item = document.createElement("option");
              item.value = recipe.list[i].value;
              
              if (recipe.list[i].label) {
                item.textContent = ytcenter.locale[recipe.list[i].label];
                ytcenter.database.register(item, recipe.list[i].label, 'text', {});
              } else if (recipe.list[i].variable) {
                item.textContent = eval(recipe.list[i].variable);
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
            ytcenter.database.codeRegister(sc2, (function(s){
              return function(){
                this.textContent = s.options[s.selectedIndex].textContent;
              };
            })(s));
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
            elm.innerHTML = recipe.html;
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
            elm.innerHTML = recipe.html;
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
          if (recipe.style) {
            for (var key in recipe.style) {
              if (recipe.style.hasOwnProperty(key)) {
                elm.style[key] = recipe.style[key];
              }
            }
          }
          if (recipe.html) {
            if (recipe.replace) {
              elm.innerHTML = $TextReplacer(recipe.html, recipe.replace);
            } else {
              elm.innerHTML = recipe.html;
            }
            
            elm.innerHTML = recipe.html;
          }
          if (recipe.htmllocale) {
            if (recipe.replace) {
              elm.innerHTML = $TextReplacer(ytcenter.locale[recipe.htmllocale], recipe.replace);
            } else {
              elm.innerHTML = ytcenter.locale[recipe.htmllocale];
            }
            
            ytcenter.database.register(elm, recipe.htmllocale, 'html', recipe.replace || {});
          }
          if (recipe.listeners) {
            for (var i = 0; i < recipe.listeners.length; i++) {
              elm.addEventListener(recipe.listeners[i].event, recipe.listeners[i].callback, (recipe.listeners[i].bubble ? recipe.listeners[i].bubble : false));
            }
          }
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
              status_elm.value = Math.ceil(newvalue - 0.5);
            };
          })(_text));
          
          _slide.addEventListener("change", (function(status_elm, recipe){
            return function(newvalue){
              status_elm.value = Math.ceil(newvalue - 0.5);
              ytcenter.settings[recipe.defaultSetting] = status_elm.value;
              ytcenter.saveSettings();
            };
          })(_text, recipe));
          
          _text.addEventListener("input", (function(_slide){
            return function(){
              if (this.value === '') this.value = "0";
              this.value = Math.ceil(_slide.setValue(this.value) - 0.5);
            };
          })(_slide), false);
          _text.addEventListener("change", (function(_slide, recipe){
            return function(){
              if (this.value === '') this.value = "0";
              this.value = Math.ceil(_slide.setValue(this.value) - 0.5);
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
            c.textContent = ytcenter.locale[recipe.text];
            ytcenter.database.register(c, recipe.text, "text");
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
      }
      if (elm) {
        elm.style.verticalAlign = "top";
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
    
    function $AddCSS(elm, css) {
      if (!elm) return;
      var a = elm.className.split(" ");
      if ($ArrayIndexOf(a, css) != -1) return;
      a.push(css);
      elm.className = a.join(" ");
    }
    
    function $RemoveCSS(elm, css) {
      if (!elm) return false;
      var a = elm.className.split(" ");
      var na = [];
      for (var i = 0; i < a.length; i++) {
        if (a[i] === css) continue;
        na.push(a[i]);
      }
      elm.className = na.join(" ");
      return true;
    }
    
    function $HasCSS(elm, css) {
      return $ArrayIndexOf(elm.className.split(" "), css) !== -1;
    }
    
    function $ArrayIndexOf(arr, obj) {
      for (var i = 0; i < arr.length; i++) {
        if (arr[i] === obj) return i;
      }
      return -1;
    }
    
    function $TextReplacer(text, rep) {
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
        curRelative = [e.pageX - document.body.scrollLeft - os[0], e.pageY - document.body.scrollTop - os[1]];
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
          $RemoveCSS(het, "yt-uix-tooltip");
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
        
        holderElement.style.top = (e.pageY - document.body.scrollTop - curRelative[1]) + "px";
        holderElement.style.left = (e.pageX - document.body.scrollLeft - curRelative[0]) + "px";
        
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
        if (typeof GM_xmlhttpRequest != "undefined") {
          GM_xmlhttpRequest(details);
          return true;
        } else {
          var xmlhttp;
          if (typeof XMLHttpRequest != "undefined") {
            xmlhttp = new XMLHttpRequest();
          } else if (typeof opera != "undefined" && typeof opera.XMLHttpRequest != "undefined") {
            xmlhttp = new opera.XMLHttpRequest();
          } else if (typeof uw != "undefined" && typeof uw.XMLHttpRequest != "undefined") {
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
    
    var console_debug = true; // Disable this to stop YouTube Center from writing in the console log.
    var _console = {};
    
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
                if (!_console.hasOwnProperty(key)) {
                  _console[key] = [];
                }
                var args = [];
                var _args = [];
                for (var i = 0; i < arguments.length; i++) {
                  args.push(arguments[i]);
                }
                if (key === "error" && args[0]) {
                  var tmp = {args: args};
                  if (args[0].message) {
                    tmp['message'] = args[0].message;
                  }
                  if (args[0].stack) {
                    tmp['stack'] = args[0].stack;
                  }
                  _console[key].push(tmp);
                  if (tmp['stack']) {
                    _args = [args[0].stack];
                  } else if (tmp['message']) {
                    _args = [args[0].message];
                  } else {
                    _args = args;
                  }
                } else {
                  _args = args;
                  _console[key].push(_args);
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
                if (!_console.hasOwnProperty(key)) {
                  _console[key] = [];
                }
                var args = [];
                var _args = [];
                for (var i = 0; i < arguments.length; i++) {
                  args.push(arguments[i]);
                }
                if (key === "error" && args[0]) {
                  var tmp = {args: args};
                  if (args[0].message) {
                    tmp['message'] = args[0].message;
                  }
                  if (args[0].stack) {
                    tmp['stack'] = args[0].stack;
                  }
                  _console[key].push(tmp);
                  if (tmp['stack']) {
                    _args = [args[0].stack];
                  } else if (tmp['message']) {
                    _args = [args[0].message];
                  } else {
                    _args = args;
                  }
                } else {
                  _args = args;
                  _console[key].push(_args);
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
                if (!_console.hasOwnProperty(key)) {
                  _console[key] = [];
                }
                var args = [];
                var _args = [];
                for (var i = 0; i < arguments.length; i++) {
                  args.push(arguments[i]);
                }
                if (key === "error" && args[0]) {
                  var tmp = {args: args};
                  if (args[0].message) {
                    tmp['message'] = args[0].message;
                  }
                  if (args[0].stack) {
                    tmp['stack'] = args[0].stack;
                  }
                  _console[key].push(tmp);
                  if (tmp['stack']) {
                    _args = [args[0].stack];
                  } else if (tmp['message']) {
                    _args = [args[0].message];
                  } else {
                    _args = args;
                  }
                } else {
                  _args = args;
                  _console[key].push(_args);
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
    
    var yt, ytcenter = {}, self = this;
    ytcenter.version = "@ant-version@";
    ytcenter.revision = @ant-revision@;
    ytcenter.icon = {};
    ytcenter.page = "none";
    con.log("Initializing icons");
    ytcenter.icon.gear = "data:image/png;base64,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";
    ytcenter.icon.lightbulb = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAPCAYAAAA71pVKAAAACXBIWXMAAAsTAAALEwEAmpwYAAAKT2lDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjanVNnVFPpFj333vRCS4iAlEtvUhUIIFJCi4AUkSYqIQkQSoghodkVUcERRUUEG8igiAOOjoCMFVEsDIoK2AfkIaKOg6OIisr74Xuja9a89+bN/rXXPues852zzwfACAyWSDNRNYAMqUIeEeCDx8TG4eQuQIEKJHAAEAizZCFz/SMBAPh+PDwrIsAHvgABeNMLCADATZvAMByH/w/qQplcAYCEAcB0kThLCIAUAEB6jkKmAEBGAYCdmCZTAKAEAGDLY2LjAFAtAGAnf+bTAICd+Jl7AQBblCEVAaCRACATZYhEAGg7AKzPVopFAFgwABRmS8Q5ANgtADBJV2ZIALC3AMDOEAuyAAgMADBRiIUpAAR7AGDIIyN4AISZABRG8lc88SuuEOcqAAB4mbI8uSQ5RYFbCC1xB1dXLh4ozkkXKxQ2YQJhmkAuwnmZGTKBNA/g88wAAKCRFRHgg/P9eM4Ors7ONo62Dl8t6r8G/yJiYuP+5c+rcEAAAOF0ftH+LC+zGoA7BoBt/qIl7gRoXgugdfeLZrIPQLUAoOnaV/Nw+H48PEWhkLnZ2eXk5NhKxEJbYcpXff5nwl/AV/1s+X48/Pf14L7iJIEyXYFHBPjgwsz0TKUcz5IJhGLc5o9H/LcL//wd0yLESWK5WCoU41EScY5EmozzMqUiiUKSKcUl0v9k4t8s+wM+3zUAsGo+AXuRLahdYwP2SycQWHTA4vcAAPK7b8HUKAgDgGiD4c93/+8//UegJQCAZkmScQAAXkQkLlTKsz/HCAAARKCBKrBBG/TBGCzABhzBBdzBC/xgNoRCJMTCQhBCCmSAHHJgKayCQiiGzbAdKmAv1EAdNMBRaIaTcA4uwlW4Dj1wD/phCJ7BKLyBCQRByAgTYSHaiAFiilgjjggXmYX4IcFIBBKLJCDJiBRRIkuRNUgxUopUIFVIHfI9cgI5h1xGupE7yAAygvyGvEcxlIGyUT3UDLVDuag3GoRGogvQZHQxmo8WoJvQcrQaPYw2oefQq2gP2o8+Q8cwwOgYBzPEbDAuxsNCsTgsCZNjy7EirAyrxhqwVqwDu4n1Y8+xdwQSgUXACTYEd0IgYR5BSFhMWE7YSKggHCQ0EdoJNwkDhFHCJyKTqEu0JroR+cQYYjIxh1hILCPWEo8TLxB7iEPENyQSiUMyJ7mQAkmxpFTSEtJG0m5SI+ksqZs0SBojk8naZGuyBzmULCAryIXkneTD5DPkG+Qh8lsKnWJAcaT4U+IoUspqShnlEOU05QZlmDJBVaOaUt2ooVQRNY9aQq2htlKvUYeoEzR1mjnNgxZJS6WtopXTGmgXaPdpr+h0uhHdlR5Ol9BX0svpR+iX6AP0dwwNhhWDx4hnKBmbGAcYZxl3GK+YTKYZ04sZx1QwNzHrmOeZD5lvVVgqtip8FZHKCpVKlSaVGyovVKmqpqreqgtV81XLVI+pXlN9rkZVM1PjqQnUlqtVqp1Q61MbU2epO6iHqmeob1Q/pH5Z/YkGWcNMw09DpFGgsV/jvMYgC2MZs3gsIWsNq4Z1gTXEJrHN2Xx2KruY/R27iz2qqaE5QzNKM1ezUvOUZj8H45hx+Jx0TgnnKKeX836K3hTvKeIpG6Y0TLkxZVxrqpaXllirSKtRq0frvTau7aedpr1Fu1n7gQ5Bx0onXCdHZ4/OBZ3nU9lT3acKpxZNPTr1ri6qa6UbobtEd79up+6Ynr5egJ5Mb6feeb3n+hx9L/1U/W36p/VHDFgGswwkBtsMzhg8xTVxbzwdL8fb8VFDXcNAQ6VhlWGX4YSRudE8o9VGjUYPjGnGXOMk423GbcajJgYmISZLTepN7ppSTbmmKaY7TDtMx83MzaLN1pk1mz0x1zLnm+eb15vft2BaeFostqi2uGVJsuRaplnutrxuhVo5WaVYVVpds0atna0l1rutu6cRp7lOk06rntZnw7Dxtsm2qbcZsOXYBtuutm22fWFnYhdnt8Wuw+6TvZN9un2N/T0HDYfZDqsdWh1+c7RyFDpWOt6azpzuP33F9JbpL2dYzxDP2DPjthPLKcRpnVOb00dnF2e5c4PziIuJS4LLLpc+Lpsbxt3IveRKdPVxXeF60vWdm7Obwu2o26/uNu5p7ofcn8w0nymeWTNz0MPIQ+BR5dE/C5+VMGvfrH5PQ0+BZ7XnIy9jL5FXrdewt6V3qvdh7xc+9j5yn+M+4zw33jLeWV/MN8C3yLfLT8Nvnl+F30N/I/9k/3r/0QCngCUBZwOJgUGBWwL7+Hp8Ib+OPzrbZfay2e1BjKC5QRVBj4KtguXBrSFoyOyQrSH355jOkc5pDoVQfujW0Adh5mGLw34MJ4WHhVeGP45wiFga0TGXNXfR3ENz30T6RJZE3ptnMU85ry1KNSo+qi5qPNo3ujS6P8YuZlnM1VidWElsSxw5LiquNm5svt/87fOH4p3iC+N7F5gvyF1weaHOwvSFpxapLhIsOpZATIhOOJTwQRAqqBaMJfITdyWOCnnCHcJnIi/RNtGI2ENcKh5O8kgqTXqS7JG8NXkkxTOlLOW5hCepkLxMDUzdmzqeFpp2IG0yPTq9MYOSkZBxQqohTZO2Z+pn5mZ2y6xlhbL+xW6Lty8elQfJa7OQrAVZLQq2QqboVFoo1yoHsmdlV2a/zYnKOZarnivN7cyzytuQN5zvn//tEsIS4ZK2pYZLVy0dWOa9rGo5sjxxedsK4xUFK4ZWBqw8uIq2Km3VT6vtV5eufr0mek1rgV7ByoLBtQFr6wtVCuWFfevc1+1dT1gvWd+1YfqGnRs+FYmKrhTbF5cVf9go3HjlG4dvyr+Z3JS0qavEuWTPZtJm6ebeLZ5bDpaql+aXDm4N2dq0Dd9WtO319kXbL5fNKNu7g7ZDuaO/PLi8ZafJzs07P1SkVPRU+lQ27tLdtWHX+G7R7ht7vPY07NXbW7z3/T7JvttVAVVN1WbVZftJ+7P3P66Jqun4lvttXa1ObXHtxwPSA/0HIw6217nU1R3SPVRSj9Yr60cOxx++/p3vdy0NNg1VjZzG4iNwRHnk6fcJ3/ceDTradox7rOEH0x92HWcdL2pCmvKaRptTmvtbYlu6T8w+0dbq3nr8R9sfD5w0PFl5SvNUyWna6YLTk2fyz4ydlZ19fi753GDborZ752PO32oPb++6EHTh0kX/i+c7vDvOXPK4dPKy2+UTV7hXmq86X23qdOo8/pPTT8e7nLuarrlca7nuer21e2b36RueN87d9L158Rb/1tWeOT3dvfN6b/fF9/XfFt1+cif9zsu72Xcn7q28T7xf9EDtQdlD3YfVP1v+3Njv3H9qwHeg89HcR/cGhYPP/pH1jw9DBY+Zj8uGDYbrnjg+OTniP3L96fynQ89kzyaeF/6i/suuFxYvfvjV69fO0ZjRoZfyl5O/bXyl/erA6xmv28bCxh6+yXgzMV70VvvtwXfcdx3vo98PT+R8IH8o/2j5sfVT0Kf7kxmTk/8EA5jz/GMzLdsAAAAgY0hSTQAAeiUAAICDAAD5/wAAgOkAAHUwAADqYAAAOpgAABdvkl/FRgAAANRJREFUeNqU0rFKBDEUheFvdSpRVmx8EF9EJJXWlj6KCoKCouD2F3wMm+220E6xs1YEZXVsgsTRzLCnSe495+cmJKO2bZVKKTU4wD428YxLnETEvMw2/mqC3aLewCG2sFcGR+XklNI2btS1ExE//lLX1K9ffhceD8DjPng6AE/74AleKuArrqtwRDzhvAJfZL86Ga7w1em1+a31whFxj1mnPYuIu0E46zav805t6IfBMdby8ZdxtAj8jlV8ZvhjEbjBOt6wUsvV7vyI07w/w8N/oe8BAO3xNxGbpir1AAAAAElFTkSuQmCC";
    con.log("Initializing refresh function");
    ytcenter.refreshHomepage = function() {
      // Doing nothing for the moment!
    };
    ytcenter.dialog = function(titleLabel, content, actions){
      var __r = {};
      var bgOverlay = ytcenter.dialogOverlay();
      var root = document.createElement("div");
      root.className = "yt-dialog";
      var base = document.createElement("div");
      base.className = "yt-dialog-base";
      
      var align = document.createElement("span");
      align.className = "yt-dialog-align";
      
      var fg = document.createElement("div");
      fg.className = "yt-dialog-fg";
      var fgContent = document.createElement("div");
      fgContent.className = "yt-dialog-fg-content yt-dialog-show-content";
      fg.appendChild(fgContent);
      
      
      base.appendChild(align);
      base.appendChild(fg);
      root.appendChild(base);
      
      if (typeof titleLabel === "string" && titleLabel !== "") {
        var header = document.createElement("div");
        header.className = "yt-dialog-header";
        var title = document.createElement("h2");
        title.className = "yt-dialog-title";
        title.textContent = ytcenter.locale[titleLabel];
        ytcenter.database.register(title, titleLabel, "text");
        
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
      var footer = document.createElement("div");
      footer.className = "yt-dialog-footer";
      fgContent.appendChild(footer);
      if (typeof actions !== "undefined") {
        /*  {
         *    label: "",
         *    primary: false,
         *    callback: function(){}
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
          btnContent.textContent = ytcenter.locale[actions[i].label];
          ytcenter.database.register(btnContent, actions[i].label, "text");
          
          btn.appendChild(btnContent);
          footer.appendChild(btn);
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
        closeContent.textContent = ytcenter.locale["DIALOG_CLOSE"];
        ytcenter.database.register(closeContent, "DIALOG_CLOSE", "text");
        
        closeBtn.appendChild(closeContent);
        footer.appendChild(closeBtn);
      }
      __r.setVisibility = function(visible){
        if (visible) {
          if (!root.parentNode) document.body.appendChild(root);
          if (!bgOverlay.parentNode) document.body.appendChild(bgOverlay);
          if (document.getElementById("player-api")) document.getElementById("player-api").style.visibility = "hidden";
        } else {
          if (root.parentNode === document.body) document.body.removeChild(root);
          if (bgOverlay.parentNode === document.body) document.body.removeChild(bgOverlay);
          if (document.getElementById("player-api")) document.getElementById("player-api").style.visibility = "";
        }
      };
      return __r;
    };
    ytcenter.dialogOverlay = function(){
      var bg = document.createElement("div");
      bg.id = "yt-dialog-bg";
      bg.className = "yt-dialog-bg";
      bg.style.height = Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight) + "px";
      bg.style.position = "absolute";
      return bg;
    };
    ytcenter.confirmBox = function(titleLabel, messageLabel, onConfirm, confirmLabel){ // Only being used for the resizeitemlist
      confirmLabel = confirmLabel || "EMBED_RESIZEITEMLIST_CONFIRM_DISCARD";
      var msgElm = document.createElement("h3");
      msgElm.style.fontWeight = "normal";
      msgElm.textContent = ytcenter.locale[messageLabel];
      ytcenter.database.register(msgElm, messageLabel, "text");
      
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
      
      ytcenter.listeners.addEvent(list, "mousedown", function(e){
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
      ytcenter.listeners.addEvent(document, "mousemove", function(e){
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
      ytcenter.listeners.addEvent(document, "mouseup", function(e){
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
      var containerWidth = 945,
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
    ytcenter.gui.icons.cog = "data:image/png;base64,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";
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
      wrapper.textContent = ytcenter.locale[label];
      ytcenter.database.register(wrapper, label, 'text');
      
      return wrapper;
    };
    ytcenter.gui.createYouTubeButton = function(title, content, styles){
      var btn = document.createElement("button");
      if (title !== "") {
        btn.setAttribute("title", ytcenter.locale[title]);
        ytcenter.database.register(btn, title, '@title');
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
        if (ytcenter.locale) {
          btn.setAttribute("title", ytcenter.locale[title]);
        }
        ytcenter.database.register(btn, title, '@title');
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
        btn.setAttribute("title", ytcenter.locale[title]);
        ytcenter.database.register(btn, title, '@title');
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
        var x = Math.max(0, Math.min(e.pageX - offset.left - document.body.scrollLeft, wrapper.clientWidth));
        
        var v = e.pageY - offset.top - document.body.scrollTop;
        var y = v + handler.clientHeight;
        if (y < 0) y = 0;
        if (y > wrapper.clientHeight) y = wrapper.clientHeight;
        
        sat = x/wrapper.clientWidth*100;
        val = 100 - y/wrapper.clientHeight*100;
      };
      
      ytcenter.listeners.addEvent(wrapper, "mousedown", function(e){
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
      ytcenter.listeners.addEvent(document, "mouseup", function(e){
        if (!mousedown) return;
        mousedown = false;
        if (e && e.preventDefault) {
          e.preventDefault();
        } else {
          window.event.returnValue = false;
        }
        return false;
      });
      ytcenter.listeners.addEvent(document, "mousemove", function(e){
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
      var sessionHex = "#000000";
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
      var rText = ytcenter.embeds.label("SETTINGS_THEATRE_COLOR_RED");
      rWrapper.appendChild(rText.element);
      rWrapper.appendChild(redRange.element);
      var gWrapper = document.createElement("div");
      var gText = ytcenter.embeds.label("SETTINGS_THEATRE_COLOR_GREEN");
      gWrapper.appendChild(gText.element);
      gWrapper.appendChild(greenRange.element);
      var bWrapper = document.createElement("div");
      var bText = ytcenter.embeds.label("SETTINGS_THEATRE_COLOR_BLUE");
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
        handle: hueRangeHandle
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
      
      var htmlColorLabel = ytcenter.embeds.label("SETTINGS_THEATRE_COLOR_HTMLCOLOR");
      htmlColorLabel.element.style.width = "127px";
      
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
      
      hWrapper.appendChild(htmlColorLabel.element);
      hWrapper.appendChild(htmlColor.element);
      
      var saveWrapper = document.createElement("div");
      saveWrapper.style.position = "absolute";
      saveWrapper.style.bottom = "0px";
      saveWrapper.style.right = "0px";
      
      var saveBtn = ytcenter.ui.createYouTubeDefaultButton("", [ytcenter.ui.createYouTubeButtonTextLabel("PLUGINS_COLORPICKER_SAVE")]);
      ytcenter.listeners.addEvent(saveBtn, "click", function(){
        ytcenter.utils.addClass(ghbox, "hid");
        ytcenter.events.performEvent("ui-refresh");
        sessionHex = ytcenter.utils.colorToHex(red, green, blue);
        if (bCallback) bCallback(sessionHex);
      }, false);
      saveWrapper.appendChild(saveBtn);
      
      var cancelBtn = ytcenter.ui.createYouTubeDefaultButton("", [ytcenter.ui.createYouTubeButtonTextLabel("PLUGINS_COLORPICKER_CANCEL")], {marginLeft: "6px"});
      ytcenter.listeners.addEvent(cancelBtn, "click", function(){
        var rgb = ytcenter.utils.hexToColor(sessionHex);
        red = rgb.red;
        green = rgb.green;
        blue = rgb.blue;
        
        update();
        updateHueRange();
        updateColorField();
        
        ytcenter.utils.addClass(ghbox, "hid");
        ytcenter.events.performEvent("ui-refresh");
      }, false);
      saveWrapper.appendChild(cancelBtn);
      
      
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
      rgbWrapper.appendChild(saveWrapper);
      
      hueWrapper.appendChild(hueRangeField.element);
      hueWrapper.appendChild(hueRange.element);
      
      var cpWrapper = document.createElement("div");
      cpWrapper.style.width = "475px";
      cpWrapper.style.position = "relative";
      cpWrapper.style.zIndex = "4";
      cpWrapper.appendChild(hueWrapper);
      cpWrapper.appendChild(rgbWrapper);
      
      var ghbox = ytcenter.ui.createYouTubeGuideHelpBox([ytcenter.ui.createYouTubeGuideHelpBoxAfter(), cpWrapper]);
      var g = ytcenter.ui.createYouTubeGuideHelpBoxGroup(wrapper, ghbox);
      ytcenter.utils.addClass(ghbox, "hid");
      
      ytcenter.listeners.addEvent(wrapper, "click", function(){
        ytcenter.utils.removeClass(ghbox, "hid");
        ytcenter.events.performEvent("ui-refresh");
        update();
      });
      
      update();
      updateHueRange();
      updateColorField();
      
      return {
        element: g,
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
        handle: null
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
          handle.style.top = ((options.value - options.min)/(options.max - options.min)*(wrapper.clientHeight)) + "px";
        } else {
          handle.style.left = ((options.value - options.min)/(options.max - options.min)*(wrapper.clientWidth - handle.offsetWidth)) + "px";
        }
      };
      
      var eventToValue = function(e){
        var offset = ytcenter.utils.getOffset(wrapper);
        if (options.method === "vertical") {
          var v = e.pageY - document.body.scrollTop - offset.top;
          var l = v + parseInt(options.height)/2 - 3;
          if (l < 0) l = 0;
          if (l > wrapper.clientHeight - handle.clientHeight) l = wrapper.clientHeight - handle.clientHeight;
          
          setValue(l/(wrapper.clientHeight - handle.clientHeight)*(options.max - options.min) + options.min);
        } else {
          var v = e.pageX - document.body.scrollLeft - offset.left;
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
      
      ytcenter.listeners.addEvent(wrapper, "mousedown", function(e){
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
      ytcenter.listeners.addEvent(document, "mouseup", function(e){
        if (!mousedown) return;
        mousedown = false;
        if (e && e.preventDefault) {
          e.preventDefault();
        } else {
          window.event.returnValue = false;
        }
        return false;
      });
      ytcenter.listeners.addEvent(document, "mousemove", function(e){
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
            text = document.createTextNode(ytcenter.locale[label]);
        ytcenter.database.register(text, label, 'text');
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
          return (item.config.large ? ytcenter.locale['SETTINGS_RESIZE_LARGE'] : ytcenter.locale['SETTINGS_RESIZE_SMALL']);
          //subtext.textContent = (item.config.align ? ytcenter.locale['SETTINGS_RESIZE_ALIGN'] : ytcenter.locale['SETTINGS_RESIZE_CENTER']);
        } else {
          return dim[0] + "×" + dim[1];
          //subtext.textContent = (item.config.large ? ytcenter.locale['SETTINGS_RESIZE_LARGE'] : ytcenter.locale['SETTINGS_RESIZE_SMALL']) + " - " + (item.config.align ? ytcenter.locale['SETTINGS_RESIZE_ALIGN'] : ytcenter.locale['SETTINGS_RESIZE_CENTER']);
        }
        }catch(e){con.error(e)}
      }
      function getItemSubText(item) {
        try{
        if (isNaN(parseInt(item.config.width)) && isNaN(parseInt(item.config.height))) {
          return (item.config.align ? ytcenter.locale['SETTINGS_RESIZE_ALIGN'] : ytcenter.locale['SETTINGS_RESIZE_CENTER']) + (item.config.scrollToPlayer ? " - " + ytcenter.locale['SETTINGS_RESIZE_SCROLLTOPLAYER'] : "");
        } else {
          return (item.config.large ? ytcenter.locale['SETTINGS_RESIZE_LARGE'] : ytcenter.locale['SETTINGS_RESIZE_SMALL']) + " - " + (item.config.align ? ytcenter.locale['SETTINGS_RESIZE_ALIGN'] : ytcenter.locale['SETTINGS_RESIZE_CENTER']) + (item.config.scrollToPlayer ? " - " + ytcenter.locale['SETTINGS_RESIZE_SCROLLTOPLAYER'] : "");
        }
        }catch(e){con.error(e)}
      }
      function setValue(id) {
        selectedId = id;
        if (selectedId === "default") {
          btnLabel.textContent = ytcenter.locale["SETTINGS_RESIZE_DEFAULTPLAYERSIZE_DEFAULT"];
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
        title.textContent = ytcenter.locale["SETTINGS_RESIZE_DEFAULTPLAYERSIZE_DEFAULT"];
        ytcenter.database.register(title, "SETTINGS_RESIZE_DEFAULTPLAYERSIZE_DEFAULT", "text");
        title.style.display = "block";
        
        ytcenter.listeners.addEvent(li, "click", function(){
          if ("default" === selectedId) return;
          setValue("default");
          ytcenter.utils.each(db, function(_i, elm){
            ytcenter.utils.removeClass(elm, "ytcenter-resize-dropdown-selected");
          });
          ytcenter.utils.addClass(span, "ytcenter-resize-dropdown-selected");
          
          if (saveCallback) saveCallback("default");
          
          document.body.click();
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
          var title = document.createElement("span");
          title.textContent = getItemTitle(item);
          title.style.display = "block";
          var subtext = document.createElement("span");
          subtext.textContent = getItemSubText(item);
          subtext.style.display = "block";
          
          ytcenter.listeners.addEvent(li, "click", function(){
            if (item.id === selectedId) return;
            setValue(item.id);
            ytcenter.utils.each(db, function(_i, elm){
              ytcenter.utils.removeClass(elm, "ytcenter-resize-dropdown-selected");
            });
            ytcenter.utils.addClass(span, "ytcenter-resize-dropdown-selected");
            
            if (saveCallback) saveCallback(item.id);
            
            document.body.click();
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
      ytcenter.database.codeRegister(wrapper, function(){
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
          return (item.config.large ? ytcenter.locale['SETTINGS_RESIZE_LARGE'] : ytcenter.locale['SETTINGS_RESIZE_SMALL']);
          subtext.textContent = (item.config.align ? ytcenter.locale['SETTINGS_RESIZE_ALIGN'] : ytcenter.locale['SETTINGS_RESIZE_CENTER']);
        } else {
          return dim[0] + "×" + dim[1];
          subtext.textContent = (item.config.large ? ytcenter.locale['SETTINGS_RESIZE_LARGE'] : ytcenter.locale['SETTINGS_RESIZE_SMALL']) + " - " + (item.config.align ? ytcenter.locale['SETTINGS_RESIZE_ALIGN'] : ytcenter.locale['SETTINGS_RESIZE_CENTER']);
        }
      }
      function getItemSubText(item) {
        if (isNaN(parseInt(item.config.width)) && isNaN(parseInt(item.config.height))) {
          return (item.config.align ? ytcenter.locale['SETTINGS_RESIZE_ALIGN'] : ytcenter.locale['SETTINGS_RESIZE_CENTER']) + (item.config.scrollToPlayer ? " - " + ytcenter.locale['SETTINGS_RESIZE_SCROLLTOPLAYER'] : "");
        } else {
          return (item.config.large ? ytcenter.locale['SETTINGS_RESIZE_LARGE'] : ytcenter.locale['SETTINGS_RESIZE_SMALL']) + " - " + (item.config.align ? ytcenter.locale['SETTINGS_RESIZE_ALIGN'] : ytcenter.locale['SETTINGS_RESIZE_CENTER']) + (item.config.scrollToPlayer ? " - " + ytcenter.locale['SETTINGS_RESIZE_SCROLLTOPLAYER'] : "");
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
          var title = document.createElement("span");
          title.textContent = getItemTitle(item);
          title.style.display = "block";
          var subtext = document.createElement("span");
          subtext.textContent = getItemSubText(item);
          subtext.style.display = "block";
          
          ytcenter.listeners.addEvent(li, "click", function(){
            if (item.id === selectedId) return;
            setValue(item.id);
            ytcenter.utils.each(db, function(_i, elm){
              ytcenter.utils.removeClass(elm, "ytcenter-resize-dropdown-selected");
            });
            ytcenter.utils.addClass(span, "ytcenter-resize-dropdown-selected");
            
            if (saveCallback) saveCallback(item.id);
            
            document.body.click();
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
      ytcenter.database.codeRegister(wrapper, function(){
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
          ytcenter.listeners.addEvent(checkbox, "change", function(){
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
            o.textContent = ytcenter.locale[item.label];
            ytcenter.database.register(o, item.label, "text");
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
      ytcenter.listeners.addEvent(select, "change", function(e){
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
        
        ytcenter.listeners.addEvent(content, "click", function(){
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
        ytcenter.database.codeRegister(out, function(){
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
        customNameLabel.textContent = ytcenter.locale['EMBED_RESIZEITEMLIST_CUSTOMNAME'];
        ytcenter.database.register(customNameLabel, "EMBED_RESIZEITEMLIST_CUSTOMNAME", "@text");
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
        widthLabel.textContent = ytcenter.locale['EMBED_RESIZEITEMLIST_WIDTH'];
        ytcenter.database.register(widthLabel, "EMBED_RESIZEITEMLIST_WIDTH", "@text");
        widthWrapper.appendChild(widthLabel);
        var widthInput = ytcenter.gui.createYouTubeTextInput();
        widthInput.style.width = "105px";
        widthWrapper.appendChild(widthInput);
        
        ytcenter.listeners.addEvent(widthInput, "change", function(){
          if (widthUnit.getValue() !== "px" || heightUnit.getValue() !== "px") return;
          aspectRatio = __getAspectRatio();
        });
        ytcenter.listeners.addEvent(widthInput, "input", function(){
          if (isNaN(parseInt(widthInput.value))) widthInput.value = "";
          else widthInput.value = parseInt(widthInput.value);
          if (widthUnit.getValue() !== "px" || heightUnit.getValue() !== "px") return;
          if (typeof aspectRatio === "undefined" || !ratioLocked) return;
          if (isNaN(parseInt(widthInput.value))) {
            heightInput.value = "";
          } else if (aspectRatio !== 0) {
            heightInput.value = Math.ceil(parseInt(widthInput.value)/aspectRatio);
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
        heightLabel.textContent = ytcenter.locale['EMBED_RESIZEITEMLIST_HEIGHT'];
        ytcenter.database.register(heightLabel, "EMBED_RESIZEITEMLIST_HEIGHT", "@text");
        heightWrapper.appendChild(heightLabel);
        var heightInput = ytcenter.gui.createYouTubeTextInput();
        heightInput.style.width = "105px";
        heightWrapper.appendChild(heightInput);
        
        ytcenter.listeners.addEvent(heightInput, "change", function(){
          if (widthUnit.getValue() !== "px" || heightUnit.getValue() !== "px") return;
          aspectRatio = __getAspectRatio();
        });
        ytcenter.listeners.addEvent(heightInput, "input", function(){
          if (isNaN(parseInt(heightInput.value))) heightInput.value = "";
          else heightInput.value = parseInt(heightInput.value);
          if (widthUnit.getValue() !== "px" || heightUnit.getValue() !== "px") return;
          if (typeof aspectRatio === "undefined" || !ratioLocked) return;
          if (isNaN(parseInt(heightInput.value))) {
            widthInput.value = "";
          } else if (aspectRatio !== 0) {
            widthInput.value = Math.ceil(parseInt(heightInput.value)*aspectRatio);
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
        ytcenter.listeners.addEvent(ratioIcon, "click", function(e){
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
        largeLabel.textContent = ytcenter.locale['EMBED_RESIZEITEMLIST_LARGE'];
        ytcenter.database.register(largeLabel, "EMBED_RESIZEITEMLIST_LARGE", "@text");
        largeWrapper.appendChild(largeLabel);
        var largeInput = ytcenter.embeds.checkbox();
        largeInput.element.style.background = "#fff";
        largeInput.fixHeight();
        largeWrapper.appendChild(largeInput.element);
        
        var alignWrapper = document.createElement("div");
        alignWrapper.className = "ytcenter-panel-label";
        var alignLabel = document.createElement("label");
        alignLabel.textContent = "Align";
        alignLabel.textContent = ytcenter.locale['EMBED_RESIZEITEMLIST_ALIGN'];
        ytcenter.database.register(alignLabel, "EMBED_RESIZEITEMLIST_ALIGN", "@text");
        alignWrapper.appendChild(alignLabel);
        var alignInput = ytcenter.embeds.checkbox();
        alignInput.element.style.background = "#fff";
        alignInput.fixHeight();
        alignWrapper.appendChild(alignInput.element);
        
        var scrollToPlayerWrapper = document.createElement("div");
        scrollToPlayerWrapper.className = "ytcenter-panel-label";
        var scrollToPlayerLabel = document.createElement("label");
        scrollToPlayerLabel.textContent = ytcenter.locale['EMBED_RESIZEITEMLIST_SCROLLTOPLAYER'];
        ytcenter.database.register(scrollToPlayerLabel, "EMBED_RESIZEITEMLIST_SCROLLTOPLAYER", "@text");
        scrollToPlayerWrapper.appendChild(scrollToPlayerLabel);
        var scrollToPlayerInput = ytcenter.embeds.checkbox();
        scrollToPlayerInput.element.style.background = "#fff";
        scrollToPlayerInput.fixHeight();
        scrollToPlayerWrapper.appendChild(scrollToPlayerInput.element);
        
        var scrollToPlayerButtonWrapper = document.createElement("div");
        scrollToPlayerButtonWrapper.className = "ytcenter-panel-label";
        var scrollToPlayerButtonLabel = document.createElement("label");
        scrollToPlayerButtonLabel.textContent = ytcenter.locale['EMBED_RESIZEITEMLIST_SCROLLTOPLAYERBUTTON'];
        ytcenter.database.register(scrollToPlayerButtonLabel, "EMBED_RESIZEITEMLIST_SCROLLTOPLAYERBUTTON", "@text");
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
        ytcenter.listeners.addEvent(saveBtn, "click", function(){
          state = 0;
          wrp.style.visibility = "hidden";
          if (typeof saveListener !== "undefined") saveListener();
        });
        
        var cancelBtn = ytcenter.gui.createYouTubeDefaultButton("", [ytcenter.gui.createYouTubeButtonText("Cancel")]);
        cancelBtn.style.cssFloat = "right";
        cancelBtn.style.marginLeft = "10px";
        cancelBtn.style.minWidth = "60px";
        ytcenter.listeners.addEvent(cancelBtn, "click", function(){
          if (hasUnsavedChanges()) {
            ytcenter.confirmBox("EMBED_RESIZEITEMLIST_CONFIRM_TITLE", "EMBED_RESIZEITEMLIST_UNSAVED_CONFIRM_MESSAGE", function(accepted){
              if (accepted) {
                state = 0;
                wrp.style.visibility = "hidden";
                if (typeof cancelListener !== "undefined") cancelListener();
              }
            });
          } else {
            state = 0;
            wrp.style.visibility = "hidden";
            if (typeof cancelListener !== "undefined") cancelListener();
          }
        });
        
        var deleteBtn = ytcenter.gui.createYouTubeDefaultButton("", [ytcenter.gui.createYouTubeButtonText("Delete")]);
        deleteBtn.style.cssFloat = "left";
        deleteBtn.style.minWidth = "60px";
        ytcenter.listeners.addEvent(deleteBtn, "click", function(){
          ytcenter.confirmBox("EMBED_RESIZEITEMLIST_DELETE_CONFIRM_TITLE", "EMBED_RESIZEITEMLIST_DELETE_CONFIRM_MESSAGE", function(del){
            if (del) {
              state = 0;
              wrp.style.visibility = "hidden";
              if (typeof deleteListener !== "undefined") deleteListener();
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
          return (item.getConfig().large ? ytcenter.locale['SETTINGS_RESIZE_LARGE'] : ytcenter.locale['SETTINGS_RESIZE_SMALL']);
          subtext.textContent = (item.getConfig().align ? ytcenter.locale['SETTINGS_RESIZE_ALIGN'] : ytcenter.locale['SETTINGS_RESIZE_CENTER']);
        } else {
          return dim[0] + "×" + dim[1];
          subtext.textContent = (item.getConfig().large ? ytcenter.locale['SETTINGS_RESIZE_LARGE'] : ytcenter.locale['SETTINGS_RESIZE_SMALL']) + " - " + (item.getConfig().align ? ytcenter.locale['SETTINGS_RESIZE_ALIGN'] : ytcenter.locale['SETTINGS_RESIZE_CENTER']);
        }
      }
      function getItemSubText(item) {
        if (isNaN(parseInt(item.getConfig().width)) && isNaN(parseInt(item.getConfig().height))) {
          return (item.getConfig().align ? ytcenter.locale['SETTINGS_RESIZE_ALIGN'] : ytcenter.locale['SETTINGS_RESIZE_CENTER']) + (item.getConfig().scrollToPlayer ? " - " + ytcenter.locale['SETTINGS_RESIZE_SCROLLTOPLAYER'] : "");
        } else {
          return (item.getConfig().large ? ytcenter.locale['SETTINGS_RESIZE_LARGE'] : ytcenter.locale['SETTINGS_RESIZE_SMALL']) + " - " + (item.getConfig().align ? ytcenter.locale['SETTINGS_RESIZE_ALIGN'] : ytcenter.locale['SETTINGS_RESIZE_CENTER']) + (item.getConfig().scrollToPlayer ? " - " + ytcenter.locale['SETTINGS_RESIZE_SCROLLTOPLAYER'] : "");
        }
      }
      function updateListHeight() {
        try {
          var _h = editWrapper.clientHeight || editWrapper.scrollHeight;
          listWrapper.style.height = _h + "px";
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
      
      ytcenter.listeners.addEvent(addButton, "click", function(){
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
      });
      
      listWrapper.appendChild(listOl);
      contentWrapper.appendChild(listWrapper);
      contentWrapper.appendChild(editWrapper);
      wrapper.appendChild(headerWrapper);
      wrapper.appendChild(contentWrapper);
      
      ytcenter.database.codeRegister(null, function(){
        //var rm = false;
        if (!editor) {
          editor = createEditor();
          //rm = true;
        }
        //editor.setVisibility(true);
        updateListHeight();
        //editor.setVisibility(false);
        /*if (rm) {
          editor.destroy();
          editor = undefined;
        }*/
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
    ytcenter.utils = {};
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
    ytcenter.utils.signatureDecipher = function(signatureCipher){
      function swapHeadAndPosition(array, position) {
        var head = array[0];
        var other = array[position % array.length];
        array[0] = other;
        array[position] = head;
        return array;
      }
      
      var cipherArray = signatureCipher.split("");
      cipherArray = cipherArray.reverse(); // _loc2_=reverse_1588(_loc2_);
      cipherArray = cipherArray.slice(3); // _loc2_=clone_1588(_loc2_,3);
      cipherArray = swapHeadAndPosition(cipherArray, 19); // _loc2_=swap_1588(_loc2_,19);
      cipherArray = cipherArray.reverse(); // _loc2_=reverse_1588(_loc2_);
      cipherArray = cipherArray.slice(2); // _loc2_=clone_1588(_loc2_,2);
      
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
          calcHeight = Math.ceil(calcWidth/player_ratio);
        } else if (isNaN(parseInt(width)) && !isNaN(parseInt(height))) {
          calcWidth = Math.ceil(calcHeight*player_ratio);
        }
      }
      return [calcWidth, calcHeight];
    }
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
    ytcenter.utils.getCookie = function(name){
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
      if (name) return cookies[name];
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
    ytcenter.utils.hasClass = function(elm, className){
      var classNames = elm.className.split(" ");
      for (var i = 0; i < classNames.length; i++) {
        if (classNames[i] === className) return true;
      }
      return false;
    };
    ytcenter.utils.toggleClass = function(elm, className){
      if (ytcenter.utils.hasClass(elm, className)) {
        ytcenter.utils.removeClass(elm, className);
      } else {
        ytcenter.utils.addClass(elm, className);
      }
    };
    ytcenter.utils.addClass = function(elm, className){
      if (typeof elm === "undefined") return;
      var classNames = elm.className.split(" ");
      var _new = [];
      for (var i = 0; i < classNames.length; i++) {
        if (classNames[i] === className || classNames[i] === "") continue; // Already present.
        _new.push(classNames[i]);
      }
      _new.push(className);
      elm.className = _new.join(" ");
    };
    ytcenter.utils.removeClass = function(elm, className){
      if (typeof elm === "undefined") return;
      var classNames = elm.className.split(" ");
      var _new = [];
      for (var i = 0; i < classNames.length; i++) {
        if (classNames[i] === className || classNames[i] === "") continue; // Already present or empty.
        _new.push(classNames[i]);
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
                ytcenter.listeners.addEvent(elm, _key, __value, false);
              });
            } else {
              ytcenter.listeners.addEvent(elm, _key, _value, false);
            }
          });
        } else {
          elm.setAttribute(key, value);
        }
      });
      
      return elm;
    };
    ytcenter.utils.inArray = function(arr, value){
      for (var i = 0; i < arr.length; i++) {
        if (arr[i] === value) return true;
      }
      return false;
    };
    ytcenter.inject = function(func){
      var script = document.createElement("script");
      script.setAttribute("type", "text/javascript");
      script.appendChild(document.createTextNode('('+ func +')();'));
      var __p = (document.body || document.head || document.documentElement);
      __p.appendChild(script);
      __p.removeChild(script);
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
      return undefined;
    };
    /*ytcenter.fixGuideNotVisible = function(fix) {
      if (document.getElementById("page-container") && fix) {
        document.getElementById("page-container").style.position = "relative";
        document.getElementById("page-container").style.left = "160px";
      } else if (document.getElementById("page-container") && !fix) {
        document.getElementById("page-container").style.position = "static";
        document.getElementById("page-container").style.left = "";
      }
    };*/
    ytcenter.hideFeedbackButton = function(hide){
      if (document.getElementById("yt-hitchhiker-feedback") && hide) {
        document.getElementById("yt-hitchhiker-feedback").style.display = "none";
      } else if (document.getElementById("yt-hitchhiker-feedback") && !hide) {
        document.getElementById("yt-hitchhiker-feedback").style.display = "";
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
                $RemoveCSS(e, oElm[i].classNames[j]);
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
                $AddCSS(e, nElm[i].classNames[j]);
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
            if (ytcenter.watch7) {
              settings = ytcenter.settings.buttonPlacementWatch7;
            } else {
              settings = ytcenter.settings.buttonPlacement
            }
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
        }
      };
      return rd;
    })();
    con.log("Initializing database");
    ytcenter.database = (function(){
      var elements = [];
      var codeElements = [];
      
      var r = {};
      r.register = function(elm, locale, type, replaceDictionary){
        elements.push({
          element: elm,
          locale: locale,
          type: (type ? type : "text"),
          replaceDictionary: (replaceDictionary ? replaceDictionary : {})
        });
      };
      r.codeRegister = function(elm, code){
        codeElements.push({
          element: elm,
          code: code
        });
      };
      r.applyLanguage = function(lang){
        con.log("Calling Database/Applying Language");
        for (var i = 0; i < elements.length; i++) {
          var l = $TextReplacer(lang[elements[i].locale], elements[i].replaceDictionary);
          var t = elements[i].type;
          var e = elements[i].element;
          if (t === "html") {
            e.innerHTML = l;
          } else if (t === "text") {
            e.textContent = l;
          } else if (t[0] == "@") { // Arguments
            e.setAttribute(t.substring(1), l);
          } else {
            throw "Unknown Type for element!";
          }
        }
        for (var i = 0; i < codeElements.length; i++) {
          codeElements[i].code.apply(codeElements[i].element, []);
        }
      };
      return r;
    })();
    ytcenter.language = @ant-database-language@;
    con.log("Applied language database");
    ytcenter.updateLanguage = function(){
      con.log("Updating Language...");
      if (ytcenter.settings.language == 'auto' && yt && yt.config_) {
        if (yt.config_.FEEDBACK_LOCALE_LANGUAGE && ytcenter.language.hasOwnProperty(yt.config_.FEEDBACK_LOCALE_LANGUAGE)) {
          ytcenter.locale = ytcenter.language[yt.config_.FEEDBACK_LOCALE_LANGUAGE];
        } else if (yt.config_.SANDBAR_LOCALE && ytcenter.language.hasOwnProperty(yt.config_.SANDBAR_LOCALE)) {
          ytcenter.locale = ytcenter.language[yt.config_.SANDBAR_LOCALE];
        } else if (yt.config_.HL_LOCALE && ytcenter.language.hasOwnProperty(yt.config_.HL_LOCALE)) {
          ytcenter.locale = ytcenter.language[yt.config_.HL_LOCALE];
        } else {
          ytcenter.locale = ytcenter.language['en'];
        }
      } else if (ytcenter.settings.language == 'auto') {
        ytcenter.locale = ytcenter.language['en'];
      } else {
        if (ytcenter.language.hasOwnProperty(ytcenter.settings.language)) {
          ytcenter.locale = ytcenter.language[ytcenter.settings.language];
        } else {
          ytcenter.locale = ytcenter.language['en'];
        }
      }
      con.log("Language set to " + ytcenter.locale.LANGUAGE);
    };
    con.log("ytcenter.updateLanguage initialized");
    ytcenter.doRepeat = false;
    ytcenter.html5 = false;
    ytcenter.html5flash = false;
    ytcenter.watch7 = false;
    ytcenter.redirect = function(url, newWindow){
      con.log("Redirecting" + (newWindow ? " in new window" : "") + " to " + url);
      if (typeof newWindow != "undefined") {
        window.open($TextReplacer(url, {
          title: ytcenter.video.title,
          videoid: ytcenter.video.id,
          author: ytcenter.video.author,
          url: loc.href
        }));
      } else {
        loc.href = $TextReplacer(url, {
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
    ytcenter.storageName = "ytcenter_v1.3_settings";
    ytcenter.loadSettings = function(){
      con.log("Loading settings");
      try {
        var loaded = JSON.parse($LoadData(ytcenter.storageName, "{}"));
        for (var key in loaded) {
          if (loaded.hasOwnProperty(key)) {
            ytcenter.settings[key] = loaded[key];
          }
        }
      } catch (e) {
        con.error(e);
      }
    };
    con.log("Save Settings initializing");
    ytcenter.saveSettings = function(async){
      try {
        if (typeof async !== "boolean") async = false;
        con.log("Saving settings");
        if (async) {
          uw.postMessage("YouTubeCenter" + JSON.stringify({
            type: "saveSettings"
          }), "http://www.youtube.com");
        } else {
          if (!$SaveData(ytcenter.storageName, JSON.stringify(ytcenter.settings))) {
            //
          }
        }
      } catch (e) {
        con.error(e);
      }
    };
    con.log("Check for updates initializing");
    ytcenter.checkForUpdates = (function(){
      var updElement;
      return function(success, error){
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
                    $AddCSS(updElement, 'hid');
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
                cnme.innerHTML = $TextReplacer(ytcenter.locale['UPDATE_HTML'], {
                  scripturl: 'http://userscripts.org/scripts/source/114002.user.js',
                  version: ver,
                  siteurl: 'http://userscripts.org/scripts/show/114002',
                  site: 'userscripts.org'
                });
                
                ytcenter.database.codeRegister(cnme, function(){
                  this.innerHTML = $TextReplacer(ytcenter.locale['UPDATE_HTML'], {
                    scripturl: 'http://userscripts.org/scripts/source/114002.user.js',
                    version: ver,
                    siteurl: 'http://userscripts.org/scripts/show/114002',
                    site: 'userscripts.org'
                  });
                });
                
                cn.appendChild(cnt);
                cn.appendChild(cnme);
                updElement.appendChild(cn);
                
                document.getElementById("alerts").appendChild(updElement);
                
                ytcenter.refreshHomepage();
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
      };
    })();
    con.log("default settings initializing");
    ytcenter._settings = {
      language: 'auto',
      filename: '{title}',
      fixfilename: false,
      enableAutoVideoQuality: true,
      autoVideoQuality: 'medium',
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
      downloadAsLinks: false,
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
      resizeEnable: false,
      resizeSave: false,
      aspectEnable: false,
      aspectSave: false,
      aspectValue: 'default',
      repeatShowIcon: true,
      watch7playeralign: true,
      watch7playerguidehide: false,
      watch7playerguidealwayshide: false,
      watch7centerpage: true,
      lightbulbAutoOff: false,
      removeBrandingBanner: false,
      removeBrandingBackground: false,
      removeBrandingWatermark: false,
      fixGuideNotVisible: false,
      hideFeedbackButton: false,
      bgcolor: "default",
      embed_bgcolor: "default",
      channel_bgcolor: "default",
      player_wide: false,
      "resize-default-playersize": 'default',
      "resize-small-button": "default_small",
      "resize-large-button": "default_large",
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
          id: ytcenter.utils.assignId("default_"),
          config: {
            customName: "Fit to Content",
            width: "945px",
            height: "",
            large: true,
            align: true,
            scrollToPlayer: false,
            scrollToPlayerButton: false,
          }
        }, {
          id: ytcenter.utils.assignId("default_"),
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
          id: ytcenter.utils.assignId("default_"),
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
          id: ytcenter.utils.assignId("default_"),
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
          id: ytcenter.utils.assignId("default_"),
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
          id: ytcenter.utils.assignId("default_"),
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
          id: ytcenter.utils.assignId("default_"),
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
          id: ytcenter.utils.assignId("default_"),
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
            for (var key in ytcenter.language) {
              if (ytcenter.language.hasOwnProperty(key)) {
                a.push({
                  "value": key,
                  "variable": "ytcenter.language[\"" + key + "\"].LANGUAGE"
                });
              }
            }
            return a;
          },
          "listeners": [
            {
              "event": "change",
              "callback": function(){
                ytcenter.updateLanguage();
                ytcenter.database.applyLanguage(ytcenter.locale);
              }
            }
          ],
          "defaultSetting": "language"
        }, {
          "label": "SETTINGS_WATCH7_CENTERPAGE",
          "type": "bool",
          "defaultSetting": "watch7centerpage",
          "listeners": [
            {
              "event": "click",
              "callback": function(){
                if (ytcenter.watch7) {
                  if (ytcenter.settings.watch7centerpage) {
                    ytcenter.site.setPageAlignment("center");
                  } else {
                    ytcenter.site.setPageAlignment("left");
                  }
                }
                ytcenter.database.applyLanguage(ytcenter.locale);
              }
            }
          ]
        }/*, {
          "label": "SETTINGS_FIXGUIDENOTVISIBLE_LABEL",
          "type": "bool",
          "defaultSetting": "fixGuideNotVisible",
          "listeners": [
            {
              "event": "click",
              "callback": function(){
                ytcenter.fixGuideNotVisible(ytcenter.settings.fixGuideNotVisible);
              }
            }
          ]
        }*//*, {
          "label": "SETTINGS_REMOVEFEEDBACK_LABEL",
          "type": "bool",
          "defaultSetting": "hideFeedbackButton",
          "listeners": [
            {
              "event": "click",
              "callback": function(){
                ytcenter.hideFeedbackButton(ytcenter.settings.hideFeedbackButton);
              }
            }
          ]
        }*/, {
          "label": "SETTINGS_REMOVEADVERTISEMENTS_LABEL",
          "type": "bool",
          "defaultSetting": "removeAdvertisements"
        }, {
          "label": "SETTINGS_AUTOEXPANDDESCRIPTION_LABEL",
          "type": "bool",
          "defaultSetting": "expandDescription"
        }, {
          "label": "SETTINGS_ENABLESHORTCUTS_LABEL",
          "type": "bool",
          "defaultSetting": "enableShortcuts"
        }, {
          "text": "SETTINGS_RESETSETTINGS_LABEL",
          "type": "button",
          "listeners": [
            {
              "event": "click",
              "callback": function(){
                var msgElm = document.createElement("h3");
                msgElm.style.fontWeight = "normal";
                msgElm.textContent = ytcenter.locale["SETTINGS_RESETSETTINGS_TEXT"];
                ytcenter.database.register(msgElm, "SETTINGS_RESETSETTINGS_TEXT", "text");
                
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
        }
      ],
      "SETTINGS_TAB_WATCH": [
        {
          "label": "SETTINGS_WATCH7_PLAYER_ALIGN",
          "type": "bool",
          "listeners": [
            {
              "event": "click",
              "callback": function(){
                ytcenter.player.center(ytcenter.settings.watch7playeralign);
                ytcenter.database.applyLanguage(ytcenter.locale);
              }
            }
          ],
          "defaultSetting": "watch7playeralign"
        }, {
          "label": "SETTINGS_GUIDE_ALWAYS_HIDE",
          "type": "bool",
          "listeners": [
            {
              "event": "click",
              "callback": function(){
                if (ytcenter.settings.watch7playerguidealwayshide) {
                  $AddCSS(document.getElementById("guide-container"), "hid");
                } else {
                  $RemoveCSS(document.getElementById("guide-container"), "hid");
                }
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
          "defaultSetting": "autohide"
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
          ]
        }, {
          "label": "SETTINGS_PLAYERBGCOLOR_LABEL",
          "type": "bgcolorlist",
          "defaultSetting": "bgcolor"
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
          "defaultSetting": "flashWMode"
        }, {
          "label": "SETTINGS_ENABLEANNOTATIONS_LABEL",
          "type": "bool",
          "defaultSetting": "enableAnnotations"
        }, {
          "label": "SETTINGS_SCROLLTOPLAYER_LABEL",
          "type": "bool",
          "defaultSetting": "scrollToPlayer"
        }, {
          "type": "html",
          "html": "<hr class=\"yt-horizontal-rule\" style=\"z-index:0;\" />"
        }, {
          "label": "SETTINGS_ENABLEAUTORESOLUTION_LABEL",
          "type": "bool",
          "defaultSetting": "enableAutoVideoQuality"
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
          "type": "html",
          "html": "<hr class=\"yt-horizontal-rule\" style=\"z-index:0;\" />"
        }, {
          "label": "SETTINGS_BRANDING_BANNER_REMOVE",
          "type": "bool",
          "listeners": [
            {
              "event": "click",
              "callback": function(){
                ytcenter.database.applyLanguage(ytcenter.locale);
              }
            }
          ],
          "defaultSetting": "removeBrandingBanner"
        }, {
          "label": "SETTINGS_BRANDING_BACKGROUND_REMOVE",
          "type": "bool",
          "listeners": [
            {
              "event": "click",
              "callback": function(){
                ytcenter.database.applyLanguage(ytcenter.locale);
              }
            }
          ],
          "defaultSetting": "removeBrandingBackground"
        }, {
          "label": "SETTINGS_BRANDING_WATERMARK_REMOVE",
          "type": "bool",
          "listeners": [
            {
              "event": "click",
              "callback": function(){
                ytcenter.database.applyLanguage(ytcenter.locale);
              }
            }
          ],
          "defaultSetting": "removeBrandingWatermark"
        }, {
          "type": "html",
          "html": "<hr class=\"yt-horizontal-rule\" style=\"z-index:0;\" />"
        }, {
          "label": "SETTINGS_PREVENTAUTOPLAY_LABEL",
          "type": "bool",
          "defaultSetting": "preventAutoPlay"
        }, {
          "label": "SETTINGS_PREVENTAUTOBUFFERING_LABEL",
          "type": "bool",
          "defaultSetting": "preventAutoBuffer"
        }, {
          "type": "html",
          "html": "<hr class=\"yt-horizontal-rule\" style=\"z-index:0;\" />"
        }, {
          "label": "SETTINGS_PLAYLIST_PREVENT_AUTOPLAY",
          "type": "bool",
          "defaultSetting": "preventPlaylistAutoPlay"
        }, {
          "label": "SETTINGS_PLAYLIST_PREVENT_AUTOBUFFERING",
          "type": "bool",
          "defaultSetting": "preventPlaylistAutoBuffer"
        /*}, {
          "label": "SETTINGS_PREVENTTABAUTOPLAY_LABEL",
          "type": "bool",
          "defaultSetting": "preventTabAutoPlay"
        }, {
          "label": "SETTINGS_PREVENTTABAUTOBUFFERING_LABEL",
          "type": "bool",
          "defaultSetting": "preventTabAutoBuffer"*/
        }, {
          "type": "html",
          "html": "<hr class=\"yt-horizontal-rule\" style=\"z-index:0;\" />"
        }, {
          "label": "SETTINGS_VOLUME_ENABLE",
          "type": "bool",
          "defaultSetting": "enableVolume"
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
          "type": "html",
          "html": "<hr class=\"yt-horizontal-rule\" style=\"z-index:0;\" />"
        }, {
          "label": "SETTINGS_LIGHTBULB_AUTO",
          "type": "bool",
          "defaultSetting": "lightbulbAutoOff"
        }, {
          "label": "SETTINGS_LIGHTBULB_COLOR",
          "type": "text", // Temporary until created color picker
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
          "defaultSetting": "channel_autohide"
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
          "type": "html",
          "html": "<hr class=\"yt-horizontal-rule\" style=\"z-index:0;\" />"
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
          "type": "html",
          "html": "<hr class=\"yt-horizontal-rule\" style=\"z-index:0;\" />"
        }, {
          "label": "SETTINGS_PREVENTAUTOPLAY_LABEL",
          "type": "bool",
          "defaultSetting": "channel_preventAutoPlay"
        }, {
          "label": "SETTINGS_PREVENTAUTOBUFFERING_LABEL",
          "type": "bool",
          "defaultSetting": "channel_preventAutoBuffer"
        }, {
          "type": "html",
          "html": "<hr class=\"yt-horizontal-rule\" style=\"z-index:0;\" />"
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
          "type": "html",
          "html": "<hr class=\"yt-horizontal-rule\" style=\"z-index:0;\" />"
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
          "type": "html",
          "html": "<hr class=\"yt-horizontal-rule\" style=\"z-index:0;\" />"
        }, {
          "label": "SETTINGS_PREVENTAUTOPLAY_LABEL",
          "type": "bool",
          "defaultSetting": "embed_preventAutoPlay"
        }, {
          "label": "SETTINGS_PREVENTAUTOBUFFERING_LABEL",
          "type": "bool",
          "defaultSetting": "embed_preventAutoBuffer"
        }, {
          "type": "html",
          "html": "<hr class=\"yt-horizontal-rule\" style=\"z-index:0;\" />"
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
      "SETTINGS_TAB_PLACEMENT": [
        {
          "label": "SETTINGS_ENABLEDOWNLOAD_LABEL",
          "type": "bool",
          "listeners": [
            {
              "event": "click",
              "callback": function(){
                ytcenter.database.applyLanguage(ytcenter.locale);
              }
            }
          ],
          "defaultSetting": "enableDownload"
        }, {
          "label": "SETTINGS_ENABLEREPEAT_LABEL",
          "type": "bool",
          "listeners": [
            {
              "event": "click",
              "callback": function(){
                ytcenter.database.applyLanguage(ytcenter.locale);
              }
            }
          ],
          "defaultSetting": "enableRepeat"
        }, {
          "label": "SETTINGS_LIGHTBULB_ENABLE",
          "type": "bool",
          "listeners": [
            {
              "event": "click",
              "callback": function(){
                ytcenter.database.applyLanguage(ytcenter.locale);
              }
            }
          ],
          "defaultSetting": "lightbulbEnable"
        }, {
          "label": "SETTINGS_RESIZE_ENABLE",
          "type": "bool",
          "listeners": [
            {
              "event": "click",
              "callback": function(){
                ytcenter.database.applyLanguage(ytcenter.locale);
              }
            }
          ],
          "defaultSetting": "resizeEnable"
        }, {
          "label": "SETTINGS_ASPECT_ENABLE",
          "type": "bool",
          "listeners": [
            {
              "event": "click",
              "callback": function(){
                ytcenter.database.applyLanguage(ytcenter.locale);
              }
            }
          ],
          "defaultSetting": "aspectEnable"
        }, {
          "type": "html",
          "html": "<br />",
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
                    $AddCSS(this, "ytcenter-uix-button-toggled");
                  } else {
                    $RemoveCSS(this, "ytcenter-uix-button-toggled");
                  }
                } catch (e) {
                  con.error(e);
                }
              }
            }
          ]
        }, {
          "type": "html",
          "htmllocale": "SETTINGS_PLACEMENTSYSTEM_MOVEELEMENTS_INSTRUCTIONS",
          "style": {
            "marginLeft": "20px",
            "display": (loc.href.match(/^(http|https)\:\/\/(.*?)\.youtube\.com\/watch\?/) ? "block" : "none")
          }
        }
      ],
      "SETTINGS_TAB_RESIZE": [
        {
          "label": "SETTINGS_RESIZE_DEFAULT",
          "type": "defaultplayersizedropdown",
          "bind": "resize-playersizes",
          "defaultSetting": "resize-default-playersize"
        }, {
          "label": "SETTINGS_RESIZE_SMALL_BUTTON",
          "type": "resizedropdown",
          "bind": "resize-playersizes",
          "defaultSetting": "resize-small-button"
        }, {
          "label": "SETTINGS_RESIZE_LARGE_BUTTON",
          "type": "resizedropdown",
          "bind": "resize-playersizes",
          "defaultSetting": "resize-large-button"
        }, {
          "label": "SETTINGS_RESIZE_LIST"
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
                ytcenter.database.applyLanguage(ytcenter.locale);
              }
            }
          ],
          "defaultSetting": "downloadQuality"
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
                ytcenter.database.applyLanguage(ytcenter.locale);
              }
            }
          ],
          "defaultSetting": "downloadFormat"
        }, {
          "label": "SETTINGS_DOWNLOADASLINKS_LABEL",
          "type": "bool",
          "listeners": [
            {
              "event": "click",
              "callback": function(){
                ytcenter.database.applyLanguage(ytcenter.locale);
              }
            }
          ],
          "defaultSetting": "downloadAsLinks"
        }, {
          "label": "SETTINGS_SHOW3DINDOWNLOADMENU_LABEL",
          "type": "bool",
          "listeners": [
            {
              "event": "click",
              "callback": function(){
                ytcenter.database.applyLanguage(ytcenter.locale);
              }
            }
          ],
          "defaultSetting": "show3DInDownloadMenu"
        }, {
          "label": "SETTINGS_FILENAME_LABEL",
          "type": "text",
          "listeners": [
            {
              "event": "change",
              "callback": function(){
                ytcenter.database.applyLanguage(ytcenter.locale);
              }
            }
          ],
          "defaultSetting": "filename"
        }, {
          "label": "SETTINGS_FIXDOWNLOADFILENAME_LABEL",
          "type": "bool",
          "listeners": [
            {
              "event": "click",
              "callback": function(){
                ytcenter.database.applyLanguage(ytcenter.locale);
              }
            }
          ],
          "defaultSetting": "fixfilename"
        }, {
          "label": "SETTINGS_MP3SERVICES_LABEL",
          "type": "multi",
          "multi": ytcenter.mp3services,
          "listeners": [
            {
              "event": "click",
              "callback": function(){
                ytcenter.database.applyLanguage(ytcenter.locale);
              }
            }
          ],
          "defaultSetting": "mp3Services"
        }
      ],
      "SETTINGS_TAB_REPEAT": [
        {
          "label": "SETTINGS_AUTOACTIVATEREPEAT_LABEL",
          "type": "bool",
          "defaultSetting": "autoActivateRepeat"
        }, {
          "label": "SETTINGS_REPEAT_SHOW_ICON",
          "type": "bool",
          "listeners": [
            {
              "event": "click",
              "callback": function(){
                ytcenter.database.applyLanguage(ytcenter.locale);
              }
            }
          ],
          "defaultSetting": "repeatShowIcon"
        }
      ],
      "SETTINGS_TAB_UPDATE": [
        {
          "label": "SETTINGS_UPDATE_ENABLE",
          "type": "bool",
          "defaultSetting": "enableUpdateChecker"
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
          "defaultSetting": "updateCheckerInterval"
        }, {
          "type": "button",
          "text": "SETTINGS_UPDATE_CHECKFORNEWUPDATES",
          "listeners": [
            {
              "event": "click",
              "callback": function(){
                this.textContent = ytcenter.locale["SETTINGS_UPDATE_CHECKINGFORNEWUPDATES"];
                this.disabled = true;
                ytcenter.checkForUpdates((function(self){
                  return function(){
                    uw.textContent = ytcenter.locale["SETTINGS_UPDATE_CHECKFORNEWUPDATESSUCCESS"];
                    uw.disabled = false;
                  };
                })(this), (function(self){
                  return function(){
                    uw.textContent = ytcenter.locale["SETTINGS_UPDATE_CHECKINGFORNEWUPDATESERROR"];
                    uw.disabled = false;
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
            "width": "945px",
            "height": "270px"
          },
          "load": function(){
            con.log("Loading debug text...");
            this.textContent = (function(){
              var debugText = "{}";
              var dbg = {};
              try {
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
                dbg.ytcenter.player = {};
                dbg.ytcenter.player.config = ytcenter.player.getReference().config;
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
                
                dbg.console = _console;
                
                debugText = JSON.stringify(dbg);
              } catch (e) {
                con.error(e);
                debugText = e.message;
              }
              return debugText;
            })();
          }
        }
      ],
      "SETTINGS_TAB_ABOUT": [
        {
          "type": "html",
          "htmllocale": "SETTINGS_ABOUT_HTML",
          "replace": {
            "version": ytcenter.version
          }
        }, {
          "type": "html",
          "htmllocale": "SETTINGS_ABOUT_LINKS_HTML", // {userscript}
          "replace": {
            "links": "<div style=\"margin-left:20px;\"><a href=\"http://userscripts.org/scripts/show/114002\" target=\"_blank\">Userscript</a><br /><a href=\"https://www.facebook.com/YouTubeCenter\" target=\"_blank\">Facebook</a><br /><a href=\"https://plus.google.com/111275247987213661483/posts\" target=\"_blank\">Google+</a><br /><a href=\"https://addons.opera.com/en/extensions/details/youtube-center/\" target=\"_blank\">Opera</a><br /><a href=\"http://extension.maxthon.com/detail/index.php?view_id=1201\" target=\"_blank\">Maxthon</a></div>"
          }
        }, {
          "type": "html",
          "htmllocale": "SETTINGS_ABOUT_TRANSLATORS_HTML",
          "replace": {
            "translators": "<div style=\"margin-left:20px;\">Arabic (Bahrain) - alihill381<br />Danish - Jeppe Rune Mortensen (YePpHa)<br />French - <a href=\"http://www.twitter.com/ThePoivron\">ThePoivron</a><br />German - Simon Artmann & Sven \"Hidden\" W<br />Hebrew (Israel) - baryoni<br />Italian - Pietro De Nicolao<br />Russian - <a href=\"http://kdasoft.narod.ru\" target=\"_blank\">KDASOFT</a><br />Spanish - Roxz<br />Turkish - Ismail Aksu<br />Hungarian - Eugenox & Mateus<br />Portuguese - <a href=\"http://userscripts.org/users/264457\" target=\"_blank\">Rafael Damasceno</a><br />Portuguese (Brazil) - Thiago R. M. Pereira<br />Simplified Chinese - 小酷 and MatrixGT<br />Romanian - <a href=\"http://www.itinerary.ro/\" target=\"_blank\">BlueMe</a><br />Polish - Piotr<br />Slovak - ja1som<br />Traditional Chinese - 泰熊<br />Ukrainian - SPIDER-T1<br />Japanese - Lightning-Natto<br />Swedish - Christian Eriksson<br />Catalan - Joan Alemany & Raül Cambeiro</div>"
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
      var filename = $TextReplacer(ytcenter.settings.filename, {
        title: ytcenter.video.title,
        videoid: ytcenter.video.id,
        author: ytcenter.video.author,
        channelname: ytcenter.video.channelname,
        resolution: (ytcenter.video.resolutions.hasOwnProperty(stream.quality) ? ytcenter.video.resolutions[stream.quality] : ''),
        itag: stream.itag,
        dimension: stream.dimension,
        width: stream.dimension.split("x")[0],
        height: stream.dimension.split("x")[1],
        format: (function(){
          for (var i = 0; i < ytcenter.video.format.length; i++) {
            if (stream.type.indexOf(ytcenter.video.format[i].type) == 0) {
              return ytcenter.locale[ytcenter.video.format[i].name];
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
        return ytcenter.video.filename(stream) + "&cpn=" + encodeURIComponent(ytcenter.utils.crypt()) +"&signature=" + encodeURIComponent(stream.sig || ytcenter.utils.signatureDecipher(stream.s));
      } catch (e) {
        con.error(e);
        return stream.url + "&signature=" + encodeURIComponent(stream.sig || ytcenter.utils.signatureDecipher(stream.s));
      }
    };
    ytcenter.video.download = (function(){
      var _download_iframe = null;
      return function(itag){
        con.log("Downloading format " + itag + "...");
        var stream = null;
        for (var i = 0; i < ytcenter.video.stream.length; i++) {
          if (ytcenter.video.stream[i].itag === itag && typeof ytcenter.video.stream[i].url != "undefined") {
            stream = ytcenter.video.stream[i];
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
    ytcenter.video.stream = [];
    
    ytcenter.site = {};
    ytcenter.site.removeAdvertisement = function(){
      var cfg = ytcenter.player.getConfig();
      var _ads = ['supported_without_ads', 'ad3_module', 'adsense_video_doc_id', 'allowed_ads', 'baseUrl', 'cafe_experiment_id', 'afv_inslate_ad_tag', 'advideo', 'ad_device', 'ad_channel_code_instream', 'ad_channel_code_overlay', 'ad_eurl', 'ad_flags', 'ad_host', 'ad_host_tier', 'ad_logging_flag', 'ad_preroll', 'ad_slots', 'ad_tag', 'ad_video_pub_id', 'aftv', 'afv', 'afv_ad_tag', 'afv_instream_max'];
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
    };
    ytcenter.site.setPageAlignment = function(alignment) {
      if (!document.body) return;
      if (alignment === "center") {
        $AddCSS(document.body, "ytcenter-site-center");
        if (document.getElementById("masthead-subnav")) {
          document.getElementById("masthead-subnav").style.setProperty("margin-left", "auto", "important");
          document.getElementById("masthead-subnav").style.setProperty("margin-right", "auto", "important");
        }
        if (document.getElementById("page")) {
          document.getElementById("page").style.setProperty("margin-left", "auto", "important");
          document.getElementById("page").style.setProperty("margin-right", "auto", "important");
        }
      } else if (alignment === "left") {
        $RemoveCSS(document.body, "ytcenter-site-center");
        if (document.getElementById("masthead-subnav")) {
          document.getElementById("masthead-subnav").style.marginLeft = "";
          document.getElementById("masthead-subnav").style.marginRight = "";
        }
        if (document.getElementById("page")) {
          document.getElementById("page").style.marginLeft = "";
          document.getElementById("page").style.marginRight = "";
        }
      }
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
    ytcenter.player.getAPI = function(){
      var list = [], api = {};
      try {
        var el = document.getElementById("movie_player") || document.getElementById("video-player");
        if (!el) {
          if (!ytcenter.html5 && document.getElementsByTagName("embed").length > 0) {
            el = document.getElementsByTagName("embed")[0];
          }
        }
        if (el) {
          list = el.getApiInterface();
          for (var i = 0; i < list.length; i++) {
            api[list[i]] = ytcenter.utils.bind(el[list[i]], el);
          }
        }
      } catch (e) {
        if (uw && uw.yt && uw.yt.config_ && uw.yt.config_.PLAYER_REFERENCE) {
          uw.ytcenter = uw.ytcenter || {};
          uw.ytcenter.player = uw.ytcenter.player || {};
          uw.ytcenter.player.api = uw.yt.config_.PLAYER_REFERENCE;
          return uw.yt.config_.PLAYER_REFERENCE;
        }
      }
      uw.ytcenter = uw.ytcenter || {};
      uw.ytcenter.player = uw.ytcenter.player || {};
      uw.ytcenter.player.api = api;
      return api;
    };
    ytcenter.player.setPlayerSize = function(center){
      ytcenter.settings.player_wide = (center ? true : false);
      ytcenter.utils.setCookie("wide", (center ? "1" : "0"), null, "/", 3600*60*24*30);
      ytcenter.saveSettings();
    };
    ytcenter.player.center = function(center){
      if (!document.body) return;
      if (center) {
        $AddCSS(document.body, "ytcenter-player-center");
      } else {
        $RemoveCSS(document.body, "ytcenter-player-center");
      }
    };
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
            $AddCSS(lightElement, "hid");
            $RemoveCSS(document.body, "ytcenter-lights-off");
          }, false);
          document.body.appendChild(lightElement);
        }
        // Updating background color and opacity.
        lightElement.style.background = ytcenter.settings.lightbulbBackgroundColor;
        lightElement.style.opacity = ytcenter.settings.lightbulbBackgroundOpaque/100;
        lightElement.style.filter = "alpha(opacity=" + ytcenter.settings.lightbulbBackgroundOpaque + ")";
        
        $AddCSS(document.body, "ytcenter-lights-off");
        $RemoveCSS(lightElement, "hid");
      };
    })();
    ytcenter.player.stopVideo = function(){
      var __break = false;
      ytcenter.player.getReference().listener.addEventListener("onStateChange", function(state){
        if (__break) return;
        if (state === -1) {
          __break = true;
        } else if (!__break) {
          ytcenter.player.getReference().api.stopVideo();
        }
      });
      ytcenter.player.getReference().api.stopVideo();
    };
    ytcenter.player.pauseVideo = function(){
      var __break = false;
      ytcenter.player.getReference().listener.addEventListener("onStateChange", function(state){
        if (__break) return;
        if (state === 2) {
          __break = true;
          if (ytcenter.html5 && ytcenter.player.getReference().api.getPlayerState() !== 2) {
            ytcenter.player.pauseVideo();
          }  else if (!ytcenter.html5) {
            var ___break = false;
            ytcenter.player.getReference().listener.addEventListener("onStateChange", function(state){
              if (___break) return;
              if (state === 3) {
                ___break = true;
                ytcenter.player.pauseVideo();
              }
            });
          }
        } else if (!__break) {
          ytcenter.player.getReference().api.pauseVideo();
        }
      });
      ytcenter.player.getReference().api.pauseVideo();
    };
    ytcenter.player.checkHTML5Support = function(){
      var v = document.createElement("video");
      if (v && !v.canPlayType) {
        return false;
      }
      
      var mp4 = v.canPlayType('video/mp4; codecs="avc1.42001E, mp4a.40.2"');
      var webm = v.canPlayType('video/webm; codecs="vp8.0, vorbis"');

      var found = false;
      for (var i = 0; i < ytcenter.video.stream.length; i++) {
        if (mp4 && ytcenter.video.stream[i].type.indexOf("video/mp4;") === 0) {
          found = true;
          break;
        } else if (webm && ytcenter.video.stream[i].type.indexOf("video/webm;") === 0) {
          found = true;
          break;
        }
      }
      return found;
    };
    ytcenter.player.getConfig = function(){
      if (ytcenter.player._config) return ytcenter.player._config;
      
      if (typeof uw !== "undefined") {
        if (typeof uw.ytplayer !== "undefined" && typeof uw.ytplayer.config !== "undefined") {
          return uw.ytplayer.config;
        }
        if (typeof uw.yt !== "undefined" && typeof uw.yt.playerConfig !== "undefined") {
          return uw.yt.playerConfig;
        }
        if (typeof uw.yt !== "undefined" && typeof uw.yt.config_ !== "undefined" && typeof uw.yt.config_.PLAYER_CONFIG !== "undefined") {
          return uw.yt.config_.PLAYER_CONFIG;
        }
      }
      if (typeof ytcenter.player._config === "undefined") {
        if (typeof document.body !== "undefined") {
          if (document.body.innerHTML.indexOf("<script>var ytplayer = ytplayer || {};ytplayer.config = ") !== -1) {
            ytcenter.player._config = JSON.parse(document.body.innerHTML.split("<script>var ytplayer = ytplayer || {};ytplayer.config = ")[1].split(";</script>")[0]);
          } else if (document.getElementById("movie_player")) {
            ytcenter.player._config = {};
            var __args = document.getElementById("movie_player").getAttribute("flashvars").split("&");
            for (var i = 0; i < __args.length; i++) {
              var _s = __args[i].split("=");
              ytcenter.player._config[decodeURIComponent(_s[0])] = decodeURIComponent(_s[1]);
            }
          }
        }
      }
      return ytcenter.player._config;
    };
    ytcenter.player.getReference = (function(){
      var listeners = {};
      var ytListenerNames = [
        'onApiChange',
        'onCueRangeEnter',
        'onError',
        'onNavigate',
        'onPlaybackQualityChange',
        'onStateChange',
        'onTabOrderChange',
        'onVolumeChange',
        'onAdStart',
        'RATE_SENTIMENT',
        'SHARE_CLICKED',
        'SIZE_CLICKED',
        'WATCH_LATER',
        'AdvertiserVideoView',
        'captionschanged'
      ];
      var init = function(){
        ytcenter.player.getReference();
        ytcenter.unsafe = ytcenter.unsafe || {};
        ytcenter.unsafe.ytplayer = ytcenter.unsafe.ytplayer || {};
        for (var i = 0; i < ytListenerNames.length; i++) {
          try {
            var pid = (ytcenter.player.getReference().playerId ? ytcenter.player.getReference().playerId : "player1");
            if (uw['ytPlayer' + ytListenerNames[i] + pid] && !ytcenter.html5flash) {
              con.log("listeners -> " + ytListenerNames[i] + " -> Variable");
              ytcenter.unsafe.ytplayer['ytPlayer' + ytListenerNames[i] + pid] = ytcenter.utils.bind(uw['ytPlayer' + ytListenerNames[i] + pid], ytcenter.unsafe.ytplayer);
              uw['ytPlayer' + ytListenerNames[i] + pid] = ytcenter.utils.bind(ytcenter.unsafe.ytplayer[ytListenerNames[i]], ytcenter.unsafe.ytplayer);
            } else {
              if (ytcenter.player.reference.api.nativeAddEventListener && !ytcenter.player.reference.api.addEventListener) {
                con.log("listeners -> " + ytListenerNames[i] + " -> API Function -> nativeAddEventListener");
                ytcenter.player.reference.api.nativeAddEventListener(ytListenerNames[i], "ytcenter." + ytListenerNames[i]);
              } else {
                con.log("listeners -> " + ytListenerNames[i] + " -> API Function -> addEventListener");
                ytcenter.player.reference.api.addEventListener(ytListenerNames[i], "ytcenter." + ytListenerNames[i]);
              }
            }
          } catch (e) {
            con.error(e);
          }
        }
      };
      var add = function(event, callback) {
        if (listeners.hasOwnProperty(event)) {
          listeners[event].push(callback);
          return listeners[event].length-1;
        } else {
          throw "The event: " + event + ", was not found!";
        }
      };
      var rem = function(event, id) {
        if (listeners.hasOwnProperty(event)) {
          if (id < listeners[event].length) {
            listeners[event][id] = null;
          } else {
            throw "The listener with id: " + id + ", was not found!";
          }
        } else {
          throw "The event: " + event + ", was not found!";
        }
      };
      var clear = function() {
        for (var key in listeners) {
          if (listeners.hasOwnProperty(key)) {
            listeners[key] = [];
          }
        }
      };
      
      for (var i = 0; i < ytListenerNames.length; i++) {
        listeners[ytListenerNames[i]] = [];
      }
      
      for (var i = 0; i < ytListenerNames.length; i++) {
        ytcenter.unsafe.ytplayer = ytcenter.unsafe.ytplayer || {};
        ytcenter.unsafe.ytplayer[ytListenerNames[i]] = ytcenter.utils.bind((function(listenerName){
          return function(arg1){
            var pid = (ytcenter.player.getReference().playerId ? ytcenter.player.getReference().playerId : "player1");
            con.log("Player callback -> " + listenerName + " (" + arg1 + ")");
            var original = true;
            for (var i = 0; i < listeners[listenerName].length; i++) {
              try {
                if (typeof listeners[listenerName][i] !== "function") continue;
                if (listeners[listenerName][i].apply) {
                  if (listeners[listenerName][i].apply(ytcenter.player.reference.api, arguments) === false) original = false;
                } else {
                  if (listeners[listenerName][i](arg1) === false) original = false;
                }
              } catch (e) {
                con.error(e);
              }
            }
            if (original) {
              try {
                if (typeof ytcenter.unsafe.ytplayer['ytPlayer' + listenerName + pid] === 'function' && ytcenter.unsafe.ytplayer['ytPlayer' + listenerName + pid].apply) {
                  ytcenter.unsafe.ytplayer['ytPlayer' + listenerName + pid].apply(uw, arguments);
                } else if (ytcenter.unsafe.ytplayer['ytPlayer' + listenerName + pid] && typeof ytcenter.unsafe.ytplayer['ytPlayer' + listenerName + pid] === 'function') {
                  ytcenter.unsafe.ytplayer['ytPlayer' + listenerName + pid](arg1);
                }
              } catch (e) {
                con.error(e);
                try {
                  ytcenter.unsafe.ytplayer['ytPlayer' + listenerName + pid]();
                } catch (e) {}
              }
            }
          };
        })(ytListenerNames[i]), ytcenter.unsafe.ytplayer);
      }
      
      return function(playerid){
        ytcenter.player.reference = ytcenter.player.reference || {};
        if (playerid) {
          ytcenter.player.reference.playerId = playerid;
        }
        ytcenter.player.reference.api = ytcenter.player.getAPI();
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
          } else {
            con.error("Couldn't obtain api!");
          }
          
          ytcenter.player.reference.html5 = ytcenter.html5;
        }
        ytcenter.player.reference.listener = {
          addEventListener: add,
          removeEventListener: rem,
          clear: clear,
          init: init
        };
        return ytcenter.player.reference;
      };
    })();
    ytcenter.player.setTheme = function(theme){
      con.log("Setting player theme to " + theme);
      var light = "light-theme";
      var dark = "dark-theme";
      if (ytcenter.html5) {
        if (theme === "dark") {
          $RemoveCSS(ytcenter.player.getReference().target, light);
          $AddCSS(ytcenter.player.getReference().target, dark);
        } else if (theme === "light") {
          $RemoveCSS(ytcenter.player.getReference().target, dark);
          $AddCSS(ytcenter.player.getReference().target, light);
        }
      }
    };
    ytcenter.player.setProgressColor = function(color){
      con.log("Setting player progress color to " + color);
      var white = "white";
      var red = "red";
      if (ytcenter.html5) {
        if (color === "red") {
          $RemoveCSS(document.getElementsByClassName("html5-play-progress")[0], white);
          $AddCSS(document.getElementsByClassName("html5-play-progress")[0], red);
        } else if (color === "white") {
          $RemoveCSS(document.getElementsByClassName("html5-play-progress")[0], red);
          $AddCSS(document.getElementsByClassName("html5-play-progress")[0], white);
        }
      }
    };
    ytcenter.player.fixHTML5 = function(){
      if (ytcenter.player.getReference().api.getApiInterface) {
        var ref = ytcenter.player.getReference();
        var vid = ref.target.getElementsByTagName("video")[0];
        var apiInterface = ref.api.getApiInterface();
        for (var i = 0; i < apiInterface.length; i++) {
          if (!vid[apiInterface[i]]) {
            vid[apiInterface[i]] = ref.api[apiInterface[i]];
          }
        }
      }
    };
    ytcenter.player.aspect = function(option){
      ytcenter.player.getConfig().args.keywords = option;
      con.log("Keywords changed to " + ytcenter.player.getConfig().args.keywords);
      var pl = ytcenter.player.getReference().api;
      var muted = pl.isMuted();
      var volume = pl.getVolume();
      var rate = pl.getPlaybackRate();
      var quality = pl.getPlaybackQuality();
      var time = pl.getCurrentTime();
      var state = pl.getPlayerState();
      var dur = pl.getDuration();
      if (state === 0) {
        time = dur + 60;
      }
      
      var il = ytcenter.player.getReference().listener.addEventListener("onStateChange", function(s){
        if (ytcenter.html5) {
          ytcenter.player.fixHTML5();
        }
        if (s !== 1) return;
        ytcenter.player.getReference().listener.removeEventListener("onStateChange", il);
        con.log("Setting player option to last player");
        if (state === -1) {
          pl.stopVideo();
        } else if (state === 2) {
          pl.pauseVideo();
          pl.seekTo(time);
        } else {
          pl.seekTo(time);
        }
        
        pl.setVolume(volume);
        if (muted) {
          pl.mute(muted);
        }
        pl.setPlaybackRate(rate);
        pl.setPlaybackQuality(quality);
        
        con.log("Made a live refresh");
      });
      
      ytcenter.player.getReference().api.loadVideoByPlayerVars(ytcenter.player.getConfig().args);
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
        if (document.getElementById("player") && !scrollToPlayerButton.parentNode) document.getElementById("player").appendChild(scrollToPlayerButton);
        if (scrollToPlayerButton && document.getElementById("player-api"))
          scrollToPlayerButton.style.left = (document.getElementById("player-api").offsetLeft + parseInt(document.getElementById("player-api").style.width) - 40) + "px";
        scrollToPlayerButton.style.top = (document.getElementById("watch7-playlist-data") ? "-13" : "-28") + "px";
      };
      var updatescrollToPlayerButtonVisibility = function(){
        try {
          if (document.getElementById("player") && !scrollToPlayerButton.parentNode) document.getElementById("player").appendChild(scrollToPlayerButton);
          var _s = getSizeById(ytcenter.player.currentResizeId);
          if (_s.config.scrollToPlayerButton) {
            scrollToPlayerButton.style.display = "block";
          } else {
            scrollToPlayerButton.style.display = "none";
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
      scrollToPlayerButton.style.borderBottom = "0px";
      scrollToPlayerButton.style.position = "absolute";
      scrollToPlayerButton.style.top = (document.getElementById("watch7-playlist-data") ? "-13" : "-28") + "px";
      scrollToPlayerButton.style.display = "block";
      scrollToPlayerButton.addEventListener("click", function(){
        document.getElementById("player-api").scrollIntoView();
      }, false);
      
      return function(){
        var _s = getSizeById(ytcenter.player.currentResizeId);
        ytcenter.player.resize(_s);
        if (_s.config.scrollToPlayer) {
          document.getElementById("player-api").scrollIntoView();
        }
        
        updatescrollToPlayerButtonVisibility();
        updatescrollToPlayerButtonPosition();
      };
    })();
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
        ytcenter.player.resize(getItemById(lastResizeId));
        ytcenter.player.updateResize_updateVisibility();
        ytcenter.player.updateResize_updatePosition();
      };
      ytcenter.player.isSelectedPlayerSizeById = function(id){
        try {
          if (lastResizeId === id)
            return true;
        } catch (e) {}
        return false;
      };
      var __r_timeout;
      return function(item){
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
      var maxInsidePlayerWidth = 945;
      
      ytcenter.player._updateResize = function(){
        ytcenter.player._resize(_width, _height, _large, _align);
        ytcenter.player.updateResize_updateVisibility();
        ytcenter.player.updateResize_updatePosition();
      };
      window.addEventListener("resize", (function(){
        var timer = null;
        return function(){
          if (timer !== null) uw.clearTimeout(timer);
          timer = uw.setTimeout(function(){
            ytcenter.player._resize(_width, _height, _large, _align);
          }, 100);
        };
      })(), false);
      return function(width, height, large, align){
        if (ytcenter.page !== "watch") return;
        width = width || "";
        height = height || "";
        if (typeof large === "undefined") large = false;
        if (typeof align === "undefined") align = false;
        _width = width;
        _height = height;
        _large = large;
        _align = align;
        
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
          pbh = playerBarHeight;
          _pbh = playerBarHeight;
        } else {
          if (ytcenter.player.getConfig().args.autohide == "0") {
            pbh = playerBarHeightBoth;
            _pbh = playerBarHeightBoth;
          } else if (ytcenter.player.getConfig().args.autohide == "1") {
            pbh = playerBarHeightNone;
            _pbh = playerBarHeightNone;
          } else if (ytcenter.player.getConfig().args.autohide == "2") {
            pbh = playerBarHeight;
            _pbh = playerBarHeight;
          } else if (ytcenter.player.getConfig().args.autohide == "3") {
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
          calcHeight = parseInt(height)/100*clientHeight;
          pbh = 0;
          pbh_changed = true;
        } else if (height.length > 1) {
          calcHeight = parseInt(height);
        }
        if (!isNaN(calcWidth) && isNaN(calcHeight) && !calcedHeight) {
          calcedHeight = true;
          if (player_ratio !== 0) calcHeight = Math.floor(calcWidth/player_ratio);
          else calcHeight = calcWidth;
        } else if (isNaN(calcWidth) && !isNaN(calcHeight) && !calcedWidth) {
          calcedWidth = true;
          if (height.indexOf("%") !== -1 && height.match(/%$/) && height !== "%") {
            calcWidth = Math.floor((calcHeight - _pbh)*player_ratio);
          } else {
            calcWidth = Math.floor(calcHeight*player_ratio);
          }
        }
        
        if (isNaN(calcWidth)) calcWidth = 0;
        if (isNaN(calcHeight)) calcHeight = 0;
        
        // Sidebar
        if (document.getElementById("watch7-sidebar")) {
          if (!large && !document.getElementById("watch7-playlist-data")) {
            document.getElementById("watch7-sidebar").style.marginTop = "-" +
              (calcHeight + pbh + (document.getElementById("watch7-creator-bar") ? 48 : 0) +
              (document.getElementById("watch7-branded-banner") && !ytcenter.settings.removeBrandingBanner ? 70 : 0)) + "px";
          } else {
            document.getElementById("watch7-sidebar").style.marginTop = "";
          }
        }
        
        // Large
        var wc = document.getElementById("watch7-container");
        if (wc) {
          if (large) {
            $AddCSS(wc, "watch-wide");
          } else {
            $RemoveCSS(wc, "watch-wide");
          }
        }
        var p = document.getElementById("player");
        if (p) {
          if (large) {
            $AddCSS(p, "watch-medium");
            if (!_playlist_toggled) {
              $AddCSS(p, "watch-playlist-collapsed");
            }
          } else {
            $RemoveCSS(p, "watch-medium");
            if ($HasCSS(p, "watch-playlist-collapsed")) {
              _playlist_toggled = false;
            } else {
              _playlist_toggled = true;
            }
            $RemoveCSS(p, "watch-playlist-collapsed");
          }
        }
        
        // Guide
        if (!align) {
          if (document.getElementById("guide-container")) {
            var gct = calcHeight + pbh;
            if (document.getElementById("watch7-playlist-data")) {
              gct += 35;
            }
            if (document.getElementById("watch7-creator-bar")) {
              gct += 48;
            }
            document.getElementById("guide-container").style.setProperty("top", gct + "px", "important");
          } else {
            con.log("Moving the guide below player failed!");
          }
        } else {
          if (document.getElementById("guide-container")) {
            document.getElementById("guide-container").style.top = "";
          }
        }
        if (ytcenter.settings.watch7playerguidehide && !align) {
          $AddCSS(document.getElementById("guide-container"), "hid");
        } else if (!ytcenter.settings.watch7playerguidealwayshide && ytcenter.settings.watch7playerguidehide && align) {
          $RemoveCSS(document.getElementById("guide-container"), "hid");
        } else if (!ytcenter.settings.watch7playerguidealwayshide && !ytcenter.settings.watch7playerguidehide) {
          $RemoveCSS(document.getElementById("guide-container"), "hid");
        }
        
        // Guide + Main Center
        if (!align) {
          //var _pw = document.getElementById("watch7-main-container").offsetWidth;
          var cl = clientWidth/2 - 945/2;
          var clg = cl - 180;
          if (cl < 190) cl = 190;
          if (clg < 10) clg = 10;
          if (clientWidth <= 1165) {
            cl = 0;
            clg = 10;
          }
          document.getElementById("watch7-main").style.setProperty("left", cl + "px", "important");
          document.getElementById("guide-container").style.setProperty("left", clg + "px", "important");

          if (clientWidth <= 1325) {
            document.getElementById("page-container").style.width = "100%";
          } else {
            document.getElementById("page-container").style.width = "";
          }
          
          $AddCSS(document.body, "ytcenter-resize-main");
        } else {
          document.getElementById("watch7-main").style.left = "";
          document.getElementById("guide-container").style.left = "";
          document.getElementById("page-container").style.width = "";
          $RemoveCSS(document.body, "ytcenter-resize-main");
        }
        
        // Player
        var wp = document.getElementById("player-api");
        if (wp) {
          if (width !== "" || height !== "") {
            wp.style.width = Math.ceil(calcWidth) + "px";
            wp.style.height = Math.ceil(calcHeight + pbh) + "px";
          } else {
            wp.style.width = "";
            wp.style.height = "";
          }
          if (calcWidth > maxInsidePlayerWidth) {
            wp.style.margin = "";
            if (align) {
              wp.style.marginLeft = "";
            } else {
              var wvOffset = $GetOffset(document.getElementById("player"));
              var mLeft = Math.ceil(-(calcWidth - maxInsidePlayerWidth)/2);
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
        
        // Creator Bar
        var creatorBar = document.getElementById("watch7-creator-bar");
        if (creatorBar) {
          if (width !== "" || height !== "") {
            creatorBar.style.width = Math.ceil(calcWidth - 40) + "px";
          } else {
            creatorBar.style.width = "";
          }
          if (calcWidth > maxInsidePlayerWidth) {
            creatorBar.style.margin = "";
            if (align) {
              creatorBar.style.marginLeft = "";
            } else {
              creatorBar.style.marginLeft = "";
            }
          } else {
            creatorBar.style.marginLeft = "";
            if (align) {
              creatorBar.style.margin = "";
            } else if (ytcenter.settings.watch7playeralign) {
              creatorBar.style.margin = "0 auto";
            }
          }
        }
        
        // Playlist
        var playlistElement = document.getElementById("watch7-playlist-data"),
            playlistBar;
        if (playlistElement) playlistBar = playlistElement.children[0];
        
        if (playlistBar) {
          var __w = Math.ceil(calcWidth), __ra = __w*0.35;
          if (__ra < 275) __ra = 275;
          else if (__ra > 400) __ra = 400;
          playlistBar.style.width = __w + "px";
          playlistBar.children[0].style.width = ((large ? __w - __ra : __w)) + "px";
          playlistBar.children[1].style.width = (large ? "auto" : (945 - __w) + "px");
          
          if (calcWidth > maxInsidePlayerWidth) {
            playlistBar.style.margin = "";
            if (align) {
              playlistBar.style.marginLeft = "";
            } else {
              playlistBar.style.marginLeft = Math.ceil(-(calcWidth - maxInsidePlayerWidth)/2) + "px";
            }
          } else {
            playlistBar.style.marginLeft = "";
            if (align) {
              playlistBar.style.margin = "";
            } else {
              playlistBar.style.margin = "0 auto";
            }
          }
        }
        if (playlistElement && (width !== "" || height !== "")) {
          playlistElement.style.width = Math.ceil((large ? calcWidth : calcWidth + 305)) + "px";
        } else if (playlistElement) {
          playlistElement.style.width = "";
        }
        var playlistTrayContainer = document.getElementById("watch7-playlist-tray-container");
        if (playlistTrayContainer) {
          var __h = Math.ceil(calcHeight - (large ? (playerBarHeight - pbh) - 3 : -pbh));
          playlistTrayContainer.style.height = __h + "px";
          var playlistTray = document.getElementById("watch7-playlist-tray");
          if (playlistTray) {
            playlistTray.style.height = Math.ceil(__h - (large ? 0 : 27)) + "px";
          }
        }
        
        // Resize Aligned
        if (align) {
          $AddCSS(document.body, "ytcenter-resize-aligned");
          $RemoveCSS(document.body, "ytcenter-resize-disaligned");
        } else {
          $RemoveCSS(document.body, "ytcenter-resize-aligned");
          $AddCSS(document.body, "ytcenter-resize-disaligned");
        }
      };
    })();
    ytcenter.player.setQuality = function(vq){
      var pc = ytcenter.player.getConfig();
      if (typeof ytcenter.video.stream === "undefined") return false;
      con.log("Getting Highest Available Quality With \"" + vq + "\" As Highest Quality");
      var priority = ['auto', 'small', 'medium', 'large', 'hd720', 'hd1080', 'highres'];
      if (ytcenter.html5) {
        var a = document.createElement("video");
        if (a && a.canPlayType) {
          pc.args.vq = "auto";
          for (var i = 0; i < ytcenter.video.stream.length; i++) {
            if ($ArrayIndexOf(priority, ytcenter.video.stream[i].quality) <= $ArrayIndexOf(priority, vq) && $ArrayIndexOf(priority, ytcenter.video.stream[i].quality) > $ArrayIndexOf(priority, pc.args.vq) && a.canPlayType(ytcenter.video.stream[i].type.split(";")[0]).replace(/no/, '')) {
              pc.args.vq = ytcenter.video.stream[i].quality;
            }
          }
        }
      } else {
        for (var i = 0; i < ytcenter.video.stream.length; i++) {
          if ($ArrayIndexOf(priority, ytcenter.video.stream[i].quality) <= $ArrayIndexOf(priority, vq) && $ArrayIndexOf(priority, ytcenter.video.stream[i].quality) > $ArrayIndexOf(priority, pc.args.vq)) {
            pc.args.vq = ytcenter.video.stream[i].quality;
          }
        }
      }
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
    ytcenter.player.apiReady = function(){
      try {
        ytcenter.player.getReference().api.getPlayerState();
        return true;
      } catch (e) {}
      return false;
    };
    ytcenter.player.update = function(onplayerloaded){
      var pc = ytcenter.player.getConfig();
      con.log("Update Called");
      if (pc.args.jsapicallback && pc.args.enablejsapi === "1") {
        ytcenter.player.jsapicallback = pc.args.jsapicallback;
      }
      
      pc.args.enablejsapi = "1";
      
      var onplayerloadedCalled = false;
      
      pc.args.jsapicallback = "ytcenter.ytplayer.onPlayerLoaded";
      uw.ytcenter = uw.ytcenter || {};
      uw.ytcenter.ytplayer = uw.ytcenter.ytplayer || {};
      uw.ytcenter.ytplayer.onPlayerLoaded = ytcenter.utils.bind(function(playerid){
        if (!playerid) playerid = "player1";
        onplayerloadedCalled = true;
        try {
          con.log("YouTube Player Ready (" + playerid + ")");
          try {
            if (ytcenter.player.jsapicallback) {
              con.log("Calling YouTube Player OnLoaded API");
              if (uw[ytcenter.player.jsapicallback]) {
                uw[ytcenter.player.jsapicallback].apply(uw, arguments);
              } else if (typeof ytcenter.player.jsapicallback === "function") {
                ytcenter.player.jsapicallback();
              }
            }
          } catch (e) {
            con.error(e);
          }
          
          con.log("Calling onReady callback");
          var o_ = function(){
            if (ytcenter.player.getReference().api && ytcenter.player.getReference().api.getApiInterface) {
              try {
                con.log("Initliazing player listeners");
                ytcenter.player.getReference(playerid).listener.init();
              } catch (e) {
                con.error(e);
              }
              
              onplayerloaded.apply(ytcenter.player.getReference().api, [playerid, ytcenter.player.getReference(), ytcenter.player.getReference().listener]); // YouTube Center's additional callback
            } else {
              con.log("Couldn't get api interface");
              
              uw.setTimeout(function(){
                o_();
              }, 1000);
            }
          };
          o_();
        } catch (e) {
          con.error(e);
        }
      }, uw.ytcenter);

      // Updating player
      //ytcenter.player.getReference().listener.clear();
      if (ytcenter.player.apiReady() && ytcenter.html5) {
        con.log("Updating player by loadVideoByPlayerVars");
        ytcenter.player.getReference().api.loadVideoByPlayerVars(ytcenter.player.getConfig().args);
        ytcenter.player.getReference().listener.init();
        
        onplayerloaded.apply(ytcenter.player.getReference().api, [ytcenter.player.getReference().playerId, ytcenter.player.getReference(), ytcenter.player.getReference().listener]);
      } else {
        if (ytcenter.page === "embed" || ytcenter.page === "channel") {
          con.log("Updating embed or channel player");
          if (ytcenter.html5) {
            ytcenter.player.jsapicallback = null;
            uw.ytcenter.ytplayer.onPlayerLoaded();
          } else {
            var __waiting = function(){
              if (ytcenter.player.getReference().target) {
                if (ytcenter.player.getReference().api && ytcenter.player.getReference().api.getApiInterface) {
                  ytcenter.player.jsapicallback = null;
                  uw.ytcenter.ytplayer.onPlayerLoaded();
                } else {
                  var flashvars = "",
                      player = ytcenter.player.getReference().target;
                  for (var key in pc.args) {
                    if (pc.args.hasOwnProperty(key)) {
                      if (flashvars !== "") flashvars += "&";
                      flashvars += encodeURIComponent(key) + "=" + encodeURIComponent(pc.args[key]);
                    }
                  }
                  
                  player.setAttribute("flashvars", flashvars);
                  if (ytcenter.page === "channel") {
                    if (ytcenter.settings.channel_flashWMode !== "none") {
                      player.setAttribute("wmode", ytcenter.settings.channel_flashWMode);
                    }
                  } else if (ytcenter.page === "embed") {
                    if (ytcenter.settings.embed_flashWMode !== "none") {
                      player.setAttribute("wmode", ytcenter.settings.embed_flashWMode);
                    }
                  }
                  
                  con.log("Cloning YouTube Flash Player");
                  var clone = player.cloneNode(true);
                  try {
                    player.stopVideo();
                  } catch (e) {}
                  player.style.display = "none";
                  player.src = "";
                  player.parentNode.replaceChild(clone, player);
                  player = clone;
                  
                }
              } else {
                uw.setTimeout(function(){
                  __waiting();
                }, 50);
              }
            }
            __waiting();
          }
        } else if (ytcenter.page === "watch") {
          if (ytcenter.html5) {
            con.log("HTML5 Player not initialized yet.");
            if (ytcenter.player.apiReady()) {
              con.log("Uses loadVideoByPlayerVars to refresh player!");
              ytcenter.player.getReference().api.loadVideoByPlayerVars(ytcenter.player.getConfig().args);
              ytcenter.player.getReference().listener.init();
              
              onplayerloaded.apply(ytcenter.player.getReference().api, [ytcenter.player.getReference().playerId, ytcenter.player.getReference(), ytcenter.player.getReference().listener]);
            } else {
              var __i = uw.setInterval(function(){
                if (onplayerloadedCalled) uw.clearInterval(__i);
                if (!onplayerloadedCalled && ytcenter.player.apiReady()) {
                  uw.clearInterval(__i);
                  ytcenter.player.getReference().api.loadVideoByPlayerVars(ytcenter.player.getConfig().args);
                  ytcenter.player.getReference().listener.init();
                  onplayerloaded.apply(ytcenter.player.getReference().api, [ytcenter.player.getReference().playerId, ytcenter.player.getReference(), ytcenter.player.getReference().listener]);
                }
                pc.args.jsapicallback = "ytcenter.ytplayer.onPlayerLoaded";
              }, 50);
            }
          } else {
            con.log("YouTube Flash Player Detected");
            var flashvars = "";
            for (var key in pc.args) {
              if (pc.args.hasOwnProperty(key)) {
                if (flashvars !== "") flashvars += "&";
                flashvars += encodeURIComponent(key) + "=" + encodeURIComponent(pc.args[key]);
              }
            }
            var up = function(player){
              player.setAttribute("flashvars", flashvars);
              if (ytcenter.settings.flashWMode !== "none") {
                player.setAttribute("wmode", ytcenter.settings.flashWMode);
              }
              
              con.log("Cloning YouTube Flash Player");
              var clone = player.cloneNode(true);
              try {
                player.stopVideo();
              } catch (e) {}
              player.style.display = "none";
              player.src = "";
              player.parentNode.replaceChild(clone, player);
              player = clone;
                  
              var __test = function(){
                if (onplayerloadedCalled) return;
                if (!player.parentNode) {
                  con.log("Flash player is disabled. Using HTML5 instead!");
                  var __i = uw.setInterval(function(){
                    if (onplayerloadedCalled) uw.clearInterval(__i);
                    if (!onplayerloadedCalled && ytcenter.player.apiReady()) {
                      uw.clearInterval(__i);
                      ytcenter.player.getReference().api.loadVideoByPlayerVars(ytcenter.player.getConfig().args);
                      ytcenter.player.getReference().listener.init();
                      onplayerloaded.apply(ytcenter.player.getReference().api, [ytcenter.player.getReference().playerId, ytcenter.player.getReference(), ytcenter.player.getReference().listener]);
                    }
                    pc.args.jsapicallback = "ytcenter.ytplayer.onPlayerLoaded";
                  }, 50);
                } else {
                  uw.setTimeout(function(){
                    __test();
                  }, 50);
                }
              };
              __test();
            };
            var tmo = function(){
              var mp = document.getElementById("movie_player") || document.getElementById("movie_player-flash") || document.getElementById("movie_player-html5-flash");
              if (mp) {
                up(mp);
              } else {
                uw.setTimeout(function(){
                  tmo();
                }, 10);
              }
            };
            tmo();
          }
        }
      }
    };
    ytcenter.parseStream = function(playerConfig){
      if (playerConfig.url_encoded_fmt_stream_map === "") return [];
      var parser1 = function(f){
        var a = f.split(",");
        var r = [];
        for (var i = 0; i < a.length; i++) {
          var b = a[i].split("/");
          var itag = b.shift();
          var dimension = b.shift();
          r.push({
            itag: itag,
            dimension: dimension,
            unknown: b
          });
        }
        return r;
      };
      var parser2 = function(u){
        var a = u.split(",");
        var b = [];
        for (var i = 0; i < a.length; i++) {
          var c = {};
          var d = a[i].split("&");
          for (var j = 0; j < d.length; j++) {
            var e = d[j].split("=");
            c[e[0]] = unescape(e[1]);
          }
          b.push(c);
        }
        return b;
      };
      var fmt = parser1(playerConfig.fmt_list);
      var stream = parser2(playerConfig.url_encoded_fmt_stream_map);
      var a = [];
      for (var i = 0; i < stream.length; i++) {
        var fl = null;
        for (var j = 0; j < fmt.length; j++) {
          if (stream[i].itag !== fmt[j].itag) continue;
          fl = fmt[j];
          break;
        }
        if (fl == null) {
          a.push(stream[i]);
        } else {
          var coll = stream[i];
          coll.dimension = fl.dimension;
          coll.unknown = fl.unknown;
          a.push(coll);
        }
      }
      return a;
    };
    uw['ytcenter'] = ytcenter.unsafe;
    var ytchannelfeatureinit = function(){
      con.log("Featured Channel Video");
      yt = uw.yt;
      ytcenter.page = "channel";
      var playerConfig = ytcenter.player.getConfig();
      
      ytcenter.hideFeedbackButton(ytcenter.settings.hideFeedbackButton);
      try {
        var channel_onload = function(){
          ytcenter.video.stream = ytcenter.parseStream(playerConfig.args);
          ytcenter.video.id = playerConfig.args.video_id;
          ytcenter.video.title = playerConfig.args.title;
          ytcenter.video.author = playerConfig.args.author;
          
          if (playerConfig.html5) ytcenter.html5 = true;
          
          if (ytcenter.settings.channel_enableAutoVideoQuality) {
            if (!ytcenter.player.setQuality(ytcenter.settings.channel_autoVideoQuality)) {
              ytcenter.html5 = false;
              ytcenter.html5flash = true;
              ytcenter.player.setQuality(ytcenter.settings.channel_autoVideoQuality)
            }
          }
          
          if (ytcenter.settings.removeAdvertisements) {
            ytcenter.site.removeAdvertisement();
          }
          if (!ytcenter.settings.channel_enableAnnotations) {
            playerConfig.args.iv_load_policy = 3;
          } else {
            playerConfig.args.iv_load_policy = 1;
          }
          if (typeof ytcenter.settings.channel_autohide != "undefined") {
            playerConfig.args.autohide = ytcenter.settings.channel_autohide;
          }
          
          playerConfig.args.autoplay = "0";
          
          playerConfig.args.theme = ytcenter.settings.channel_playerTheme;
          playerConfig.args.color = ytcenter.settings.channel_playerColor;
          playerConfig.args.enablejsapi = "1";
          
          if (ytcenter.settings.channel_bgcolor === "none") {
            playerConfig.args.keywords = ytcenter.utils.setKeyword(playerConfig.args.keywords, "yt:bgcolor", "#000000");
          } else if (ytcenter.settings.channel_bgcolor !== "default" && ytcenter.settings.channel_bgcolor.indexOf("#") === 0) {
            playerConfig.args.keywords = ytcenter.utils.setKeyword(playerConfig.args.keywords, "yt:bgcolor", ytcenter.settings.channel_bgcolor);
          }

          con.log("Updating YouTube Player");
          ytcenter.player.update(function(playerid, player, listener){
            con.log("YouTube Player Loaded");
            ytcenter.player.setTheme(ytcenter.settings.channel_playerTheme);
            ytcenter.player.setProgressColor(ytcenter.settings.channel_playerColor);
            if (ytcenter.settings.channel_enableVolume) {
              if (ytcenter.settings.channel_volume < 0) {
                ytcenter.settings.channel_volume = 0;
              } else if (ytcenter.settings.channel_volume > 100) {
                ytcenter.settings.channel_volume = 100;
              }
              if (ytcenter.player.getReference().api.setVolume) {
                ytcenter.player.getReference().api.setVolume(ytcenter.settings.channel_volume);
              }
            }
            if (ytcenter.settings.channel_mute && ytcenter.player.getReference().api.mute) {
              ytcenter.player.getReference().api.mute();
            } else if (!ytcenter.settings.channel_mute && ytcenter.player.getReference().api.unMute) {
              ytcenter.player.getReference().api.unMute();
            }
            
            if (ytcenter.settings.channel_preventAutoBuffer) {
              ytcenter.player.getReference().api.stopVideo();
            } else if (ytcenter.settings.channel_preventAutoPlay) {
              ytcenter.player.getReference().api.playVideo();
              ytcenter.player.getReference().api.pauseVideo();
            } else {
              ytcenter.player.getReference().api.playVideo();
            }
            
            if (ytcenter.player.getReference().api.getPlaybackQuality() != playerConfig.args.vq) {
              con.log("Setting playback quality from " + ytcenter.player.getReference().api.getPlaybackQuality() + " to " + playerConfig.args.vq);
              ytcenter.player.getReference().api.setPlaybackQuality(playerConfig.args.vq);
            }
          });
        };
        if (ytcenter.player.getConfig().args.url_encoded_fmt_stream_map !== "") {
          con.log("Found url_encoded_fmt_stream_map; Calling channel_onload()");
          channel_onload();
        } else {
          $XMLHTTPRequest({
            method: "GET",
            url: '/get_video_info?video_id=' + ytcenter.player.getConfig().args.video_id,
            headers: {
              "Content-Type": "text/plain"
            },
            onload: function(response){
              var o = {};
              var s = response.responseText.split("&");
              for (var i = 0; i < s.length; i++) {
                var ss = s[i].split("=");
                o[ss[0]] = decodeURIComponent(ss[1]);
              }
              ytcenter.video.stream = ytcenter.parseStream(o);
              channel_onload();
            },
            onerror: function(){
              ytcenter.video.stream = [];
              channel_onload();
            }
          });
        }
      } catch (e) {
        con.error(e);
      }
    };
    var ytwatchinit = function(){
      yt = uw.yt;
      ytcenter.page = "watch";
      
      if (typeof ytcenter.player.getConfig() === "undefined") {
        con.error("ytcenter.player.getConfig() is undefined!");
        return;
      }
      try {
        if (ytcenter.settings.watch7playerguidealwayshide) {
          $AddCSS(document.getElementById("guide-container"), "hid");
        } else {
          $RemoveCSS(document.getElementById("guide-container"), "hid");
        }
      } catch (e) {
        con.error(e);
      }
      
      if (ytcenter.player.getConfig().html5) ytcenter.html5 = true;
      con.log("YouTube Player is " + (ytcenter.html5 ? "HTML5" : "Flash"));
      ytcenter.video.stream = ytcenter.parseStream(ytcenter.player.getConfig().args);
      
      ytcenter.unsafe.video = {};
      ytcenter.unsafe.video.stream = ytcenter.video.stream;
      
      ytcenter.playlist = false;
      try {
        if (document.getElementById("watch7-playlist-container") || uw.location.search.indexOf("list=") !== -1) {
          ytcenter.playlist = true;
        }
      } catch (e) {
        con.error(e);
      }
      
      ytcenter.video.id = ytcenter.player.getConfig().args.video_id;
      ytcenter.video.title = ytcenter.player.getConfig().args.title;
      try {
        ytcenter.video.author = (document.getElementById("watch7-user-header").getElementsByClassName("yt-user-name")[0].textContent || document.getElementsByClassName("yt-user-name")[0].textContent);
        ytcenter.user.callChannelFeed(ytcenter.video.author, function(){
          ytcenter.video._channel = this;
          ytcenter.video.channelname = this.title['$t'];
        });
      } catch (e) {
        con.error(e);
      }
      
      //ytcenter.fixGuideNotVisible(ytcenter.settings.fixGuideNotVisible);
      ytcenter.hideFeedbackButton(ytcenter.settings.hideFeedbackButton);
      
      
      if (ytcenter.settings["resize-default-playersize"] === "default") {
        ytcenter.player.currentResizeId = (ytcenter.settings.player_wide ? ytcenter.settings["resize-large-button"] : ytcenter.settings["resize-small-button"]);
        ytcenter.player.updateResize();
      } else {
        ytcenter.player.currentResizeId = ytcenter.settings['resize-default-playersize'];
        ytcenter.player.updateResize();
      }
      ytcenter.player.getReference().listener.addEventListener("SIZE_CLICKED", function(widescreen){
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
        if (widescreen) {
          ytcenter.player.setPlayerSize(true);
          
          ytcenter.player.currentResizeId = ytcenter.settings['resize-large-button'];
          ytcenter.player.updateResize();
        } else {
          ytcenter.player.setPlayerSize(false);
          
          ytcenter.player.currentResizeId = ytcenter.settings['resize-small-button'];
          ytcenter.player.updateResize();
        }
        
        ytcenter.database.applyLanguage(ytcenter.locale);
        document.body.click();
        return false;
      });
      
      if (ytcenter.settings.aspectValue !== "none" && ytcenter.settings.aspectValue !== "default" && ytcenter.settings.aspectValue.indexOf("yt:") === 0) {
        con.log("Chaning aspect to " + ytcenter.settings.aspectValue);
        ytcenter.player.getConfig().args.keywords = ytcenter.settings.aspectValue;
      } else if (ytcenter.settings.aspectValue !== "default"){
        con.log("Chaning aspect to none");
        ytcenter.player.getConfig().args.keywords = "";
      } else {
        con.log("Keeping the aspect");
      }
      
      if (ytcenter.settings.enableAutoVideoQuality) {
        if (!ytcenter.player.setQuality(ytcenter.settings.autoVideoQuality)) {
          con.log("HTML5 Not Supported, Switching to Flash");
          ytcenter.html5 = false;
          ytcenter.html5flash = true;
          ytcenter.player.setQuality(ytcenter.settings.autoVideoQuality);
        }
      }
      if (ytcenter.settings.removeAdvertisements) {
        ytcenter.site.removeAdvertisement();
      }
      if (ytcenter.settings.removeBrandingWatermark) {
        delete ytcenter.player.getConfig().args.watermark;
      }
      if (ytcenter.settings.enableAnnotations) {
        ytcenter.player.getConfig().args.iv_load_policy = 1;
      } else {
        ytcenter.player.getConfig().args.iv_load_policy = 3;
      }
      if (typeof ytcenter.settings.autohide != "undefined") {
        ytcenter.player.getConfig().args.autohide = ytcenter.settings.autohide;
      }
      
      if (ytcenter.settings.removeBrandingBanner) {
        $AddCSS(document.body, "ytcenter-branding-remove-banner");
      }
      if (ytcenter.settings.removeBrandingBackground) {
        $AddCSS(document.body, "ytcenter-branding-remove-background");
      }
      
      ytcenter.player.getConfig().args.player_wide = ytcenter.settings.player_wide ? "1" : "0";
      ytcenter.database.codeRegister(this, function(){
        if (ytcenter.settings.removeBrandingBanner) {
          $AddCSS(document.body, "ytcenter-branding-remove-banner");
        } else {
          $RemoveCSS(document.body, "ytcenter-branding-remove-banner");
        }
        if (ytcenter.settings.removeBrandingBackground) {
          $AddCSS(document.body, "ytcenter-branding-remove-background");
        } else {
          $RemoveCSS(document.body, "ytcenter-branding-remove-background");
        }
      });
      
      if (ytcenter.settings.bgcolor === "none") {
        ytcenter.player.getConfig().args.keywords = ytcenter.utils.setKeyword(ytcenter.player.getConfig().args.keywords, "yt:bgcolor", "#000000");
      } else if (ytcenter.settings.bgcolor !== "default" && ytcenter.settings.bgcolor.indexOf("#") === 0) {
        ytcenter.player.getConfig().args.keywords = ytcenter.utils.setKeyword(ytcenter.player.getConfig().args.keywords, "yt:bgcolor", ytcenter.settings.bgcolor);
      }
      
      if (ytcenter.playlist) {
        if (ytcenter.settings.preventPlaylistAutoBuffer || ytcenter.settings.preventPlaylistAutoPlay) {
          ytcenter.player.getConfig().args.autoplay = "0";
        } else {
          ytcenter.player.getConfig().args.autoplay = "1";
        }
      } else {
        if (ytcenter.settings.preventAutoBuffer || ytcenter.settings.preventAutoPlay) {
          ytcenter.player.getConfig().args.autoplay = "0";
        } else {
          ytcenter.player.getConfig().args.autoplay = "1";
        }
      }
      
      ytcenter.player.getConfig().args.theme = ytcenter.settings.playerTheme;
      ytcenter.player.getConfig().args.color = ytcenter.settings.playerColor;
      ytcenter.player.getConfig().args.enablejsapi = "1";
      
      var watchVideo = document.getElementById("player");
      if (watchVideo) {
        watchVideo.style.overflow = "visible";
      }
      
      con.log("Adding player shortcuts to document");
      document.addEventListener("keydown", function(e){
        e = e || window.event;
        if (ytcenter.settings.enableShortcuts && !e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
          if (document.activeElement.tagName.toLowerCase() === "input" || document.activeElement.tagName.toLowerCase() === "textarea" || document.activeElement.tagName.toLowerCase() === "object" || document.activeElement.tagName.toLowerCase() === "embed" || document.activeElement.tagName.toLowerCase() === "button") return;
          var player = ytcenter.player.getReference().api;
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
      
      if (ytcenter.settings.lightbulbAutoOff) {
        ytcenter.player.turnLightOff();
      }
      
      con.log("Updating YouTube Player");
      ytcenter.player.update(function(playerid, player, listener){
        con.log("YouTube Player Loaded");
        
        ytcenter.player.updateResize();
        
        ytcenter.player.setTheme(ytcenter.settings.playerTheme);
        ytcenter.player.setProgressColor(ytcenter.settings.playerColor);
        
        if (this.getPlaybackQuality() != ytcenter.player.getConfig().args.vq) {
          con.log("Setting playback quality from " + this.getPlaybackQuality() + " to " + ytcenter.player.getConfig().args.vq);
          this.setPlaybackQuality(ytcenter.player.getConfig().args.vq);
        }
        
        if (ytcenter.player.getReference().api.getVolume && ytcenter.player.getReference().api.getVolume() != ytcenter.settings.volume && ytcenter.settings.enableVolume) {
          if (ytcenter.settings.volume < 0) {
            ytcenter.settings.volume = 0;
          } else if (ytcenter.settings.volume > 100) {
            ytcenter.settings.volume = 100;
          }
          ytcenter.player.getReference().api.setVolume(ytcenter.settings.volume);
        }
        if (ytcenter.settings.mute && ytcenter.player.getReference().api.isMuted && !ytcenter.player.getReference().api.isMuted()) {
          ytcenter.player.getReference().api.mute();
        } else if (!ytcenter.settings.mute && ytcenter.player.getReference().api.isMuted && ytcenter.player.getReference().api.isMuted()) {
          ytcenter.player.getReference().api.unMute();
        }
        if (ytcenter.playlist) {
          if (ytcenter.settings.preventPlaylistAutoBuffer) {
            ytcenter.player.getReference().api.stopVideo();
          } else if (ytcenter.settings.preventPlaylistAutoPlay) {
            ytcenter.player.getReference().api.playVideo();
            ytcenter.player.getReference().api.pauseVideo();
            if (ytcenter.player.getReference().api.getPlayerState() === -1) {
              var ___done = false;
              ytcenter.player.getReference().listener.addEventListener("onStateChange", function(state){
                if (___done) return;
                if (state !== -1) {
                  ytcenter.player.getReference().api.playVideo();
                  ytcenter.player.getReference().api.pauseVideo();
                  ___done = true;
                }
              });
            }
          }
        } else {
          if (ytcenter.settings.preventAutoBuffer) {
            ytcenter.player.getReference().api.stopVideo();
          } else if (ytcenter.settings.preventAutoPlay) {
            ytcenter.player.getReference().api.playVideo();
            ytcenter.player.getReference().api.pauseVideo();
            if (ytcenter.player.getReference().api.getPlayerState() === -1) {
              var ___done = false;
              ytcenter.player.getReference().listener.addEventListener("onStateChange", function(state){
                if (___done) return;
                if (state !== -1) {
                  ytcenter.player.getReference().api.playVideo();
                  ytcenter.player.getReference().api.pauseVideo();
                  ___done = true;
                }
              });
            }
          }
        }
        ytcenter.player.getReference().listener.addEventListener("onStateChange", function(state){
          if (ytcenter.doRepeat && ytcenter.settings.enableRepeat && state === 0) {
            ytcenter.player.getReference().api.playVideo();
          }
        });
      });

      if (ytcenter.settings.scrollToPlayer) {
        (document.getElementById("watch-headline-container") || document.getElementById("page-container")).scrollIntoView(true);
      }
      if (ytcenter.settings.expandDescription) {
        $RemoveCSS(document.getElementById("watch-description"), "yt-uix-expander-collapsed");
      }
      if (ytcenter.settings.removeAdvertisements) {
        var vextra = document.getElementById("watch-video-extra");
        if (vextra) {
          $AddCSS(vextra, "hid");
        }
        var vcontent = document.getElementById("content");
        if (vcontent) {
          vcontent.setAttribute("style", "background:!important;");
        }
      }
      var ___callback = function(response){
        try {
          var txt = response.responseText;
          txt = txt.split("<published>")[1].split("</published>")[0];
          ytcenter.video.published = new Date(txt);
          ytcenter.database.applyLanguage(ytcenter.locale);
        } catch (e) {
          con.error(e);
        }
      };
      $XMLHTTPRequest({
        method: "GET",
        url: "https://gdata.youtube.com/feeds/api/videos/" + ytcenter.video.id + "?v=2",
        headers: {
          "Content-Type": "text/plain"
        },
        onerror: ___callback,
        onload: ___callback
      });
      $CreateDownloadButton();
      $CreateRepeatButton();
      $CreateLightButton();
      $CreateAspectButton();
      $CreateResizeButton();
      
      con.log("Placement System Init");
      if (!ytcenter.watch7) {
        ytcenter.placementsystem.init([
          {
            id: 'watch-actions',
            elements: [
              {
                tagname: 'button',
                condition: function(elm, e){
                  return $HasCSS(e, "yt-uix-button") && elm == e;
                },
                style: {
                  margin: '0px 2px 0px 0px'
                },
                classNames: []
              }, {
                tagname: 'span',
                condition: function(elm, e){
                  return $HasCSS(e, "yt-uix-button-group") && elm == e;
                },
                style: {
                  margin: '0px 4px 0px 0px'
                },
                classNames: []
              }, {
                tagname: 'button',
                classNames: ['yt-uix-tooltip-reverse']
              }
            ]
          }, {
            id: 'watch-headline-user-info',
            elements: [
              {
                tagname: 'button',
                condition: function(elm, e, parent) {
                  return elm == e && elm.previousElementSibling != null;
                },
                style: {
                  marginLeft: '5px'
                },
                classNames: []
              }, {
                tagname: 'button',
                condition: function(elm, e, parent) {
                  return elm == e && elm.previousElementSibling == null;
                },
                style: {
                  marginLeft: '0'
                },
                classNames: []
              }, {
                tagname: 'span',
                condition: function(elm, e, parent) {
                  return elm == e && elm.previousElementSibling != null;
                },
                style: {
                  marginLeft: '5px'
                },
                classNames: []
              }
            ]
          }, {
            id: 'watch-headline-title',
            elements: []
          }
        ], ["watch-actions-right"]);
      } else {
        con.log("Initializing the Placement System (Watch7).");
        // buttonPlacementWatch7
        var ytcd = document.createElement("div");
        ytcd.id = "watch7-ytcenter-buttons";
        
        document.getElementById("watch7-sentiment-actions").parentNode.insertBefore(ytcd, document.getElementById("watch7-sentiment-actions"));
        
        ytcenter.placementsystem.init([
          {
            id: 'watch7-sentiment-actions',
            elements: [
              {
                tagname: 'button',
                condition: function(elm, e){
                  return $HasCSS(e, "yt-uix-button") && elm == e;
                },
                style: {
                  margin: '0px 2px 0px 0px'
                },
                classNames: ['yt-uix-tooltip-reverse']
              }, {
                tagname: 'span',
                condition: function(elm, e){
                  return $HasCSS(e, "yt-uix-button-group") && elm == e;
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
                  return $HasCSS(e, "yt-uix-button") && elm == e;
                },
                style: {
                  margin: '0px 2px 0px 0px'
                },
                classNames: ['yt-uix-tooltip-reverse']
              }, {
                tagname: 'span',
                condition: function(elm, e){
                  return $HasCSS(e, "yt-uix-button-group") && elm == e;
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
      }
      con.log("Registering Native Elements");
      ytcenter.placementsystem.registerNativeElements();
      con.log("Arranging Elements");
      ytcenter.placementsystem.arrangeElements();
      $UpdateChecker();
    };
    var ytembedinit = function(){
      yt = uw.yt;
      ytcenter.page = "embed";
      var playerConfig = ytcenter.player.getConfig();
      //return;
      if (playerConfig.html5) ytcenter.html5 = true;
      
      var embed_onload = function(){
        ytcenter.video.id = playerConfig.args.video_id;
        ytcenter.video.title = playerConfig.args.title;
        ytcenter.video.author = playerConfig.args.author;
        
        ytcenter.player.setTheme(ytcenter.settings.embed_playerTheme);
        ytcenter.player.setProgressColor(ytcenter.settings.embed_playerColor);

        if (ytcenter.settings.embed_enableAutoVideoQuality) {
          if (!ytcenter.player.setQuality(ytcenter.settings.embed_autoVideoQuality)) {
            ytcenter.html5 = false;
            ytcenter.html5flash = true;
            ytcenter.player.setQuality(ytcenter.settings.embed_autoVideoQuality);
          }
        }
        if (ytcenter.settings.removeAdvertisements) {
          ytcenter.site.removeAdvertisement();
        }
        if (!ytcenter.settings.embed_enableAnnotations) {
          playerConfig.args.iv_load_policy = 3;
        } else {
          playerConfig.args.iv_load_policy = 1;
        }
        if (typeof ytcenter.settings.embed_autohide !== "undefined") {
          playerConfig.args.autohide = ytcenter.settings.embed_autohide;
        }
        playerConfig.args.autoplay = "0";
        playerConfig.args.theme = ytcenter.settings.embed_playerTheme;
        playerConfig.args.color = ytcenter.settings.embed_playerColor;
        
        if (ytcenter.settings.embed_bgcolor === "none") {
          playerConfig.args.keywords = ytcenter.utils.setKeyword(playerConfig.args.keywords, "yt:bgcolor", "");
        } else if (ytcenter.settings.embed_bgcolor !== "default" && ytcenter.settings.embed_bgcolor.indexOf("#") === 0) {
          playerConfig.args.keywords = ytcenter.utils.setKeyword(playerConfig.args.keywords, "yt:bgcolor", ytcenter.settings.embed_bgcolor);
        }

        con.log("Updating YouTube Player");
        ytcenter.player.update(function(playerid, player, listener){
          con.log("YouTube Player Loaded");
          if (ytcenter.settings.embed_enableVolume) {
            if (ytcenter.settings.embed_volume < 0) {
              ytcenter.settings.embed_volume = 0;
            } else if (ytcenter.settings.embed_volume > 100) {
              ytcenter.settings.embed_volume = 100;
            }
            if (ytcenter.player.getReference().api.setVolume) {
              ytcenter.player.getReference().api.setVolume(ytcenter.settings.embed_volume);
            }
          }
          try {
            if (ytcenter.settings.embed_mute) {
              ytcenter.player.getReference().api.mute();
            } else if (!ytcenter.settings.embed_mute) {
              ytcenter.player.getReference().api.unMute();
            }
          } catch (e) {
            con.error(e);
          }
          
          if (ytcenter.settings.embed_preventAutoBuffer) {
            ytcenter.player.getReference().api.stopVideo();
          } else if (ytcenter.settings.embed_preventAutoPlay) {
            ytcenter.player.getReference().api.playVideo();
            ytcenter.player.getReference().api.pauseVideo();
          } else {
            ytcenter.player.getReference().api.playVideo();
          }
          
          if (ytcenter.player.getReference().api.getPlaybackQuality() !== ytcenter.settings.embed_autoVideoQuality) {
            con.log("Setting playback quality from " + ytcenter.player.getReference().api.getPlaybackQuality() + " to " + ytcenter.settings.embed_autoVideoQuality);
            ytcenter.player.getReference().api.setPlaybackQuality(ytcenter.settings.embed_autoVideoQuality);
          }
        });
      };
      $XMLHTTPRequest({
        method: "GET",
        url: '/get_video_info?video_id=' + ytcenter.player.getConfig().args.video_id,
        headers: {
          "Content-Type": "text/plain"
        },
        onload: function(response){
          if (response.responseText) {
            var o = {};
            var s = response.responseText.split("&");
            for (var i = 0; i < s.length; i++) {
              var ss = s[i].split("=");
              o[ss[0]] = decodeURIComponent(ss[1]);
            }
            ytcenter.video.stream = ytcenter.parseStream(o);
            embed_onload();
          }
        },
        onerror: function(){
          ytcenter.video.stream = [];
          embed_onload();
        }
      });
    };
    var dclcaller = function(){
      if (document.getElementById("watch7-main") || document.getElementById("guide") || document.getElementById("yt-hitchhiker-feedback")) ytcenter.watch7 = true;
      $CreateSettingsUI();
      $UpdateChecker();
      
      if (document.getElementById("page")
       && $HasCSS(document.getElementById("page"), "channel")
       && document.getElementById("content")
       && document.getElementById("content").children.length > 0
       && $HasCSS(document.getElementById("content").children[0], "branded-page-v2-container")
       && $HasCSS(document.getElementById("content").children[0], "branded-page-v2-flex-width")) {
        document.body.className += " ytcenter-channelv2";
      }
      
      try {
        if (loc.href.indexOf(".youtube.com/watch?") !== -1) {
          con.log("YouTube Watch Page Detected");
          if (uw.ytplayer && uw.ytplayer.config && !document.getElementById("watch7-player-age-gate-content")) {
            ytwatchinit();
          } else {
            if (!document.getElementById("watch7-player-age-gate-content")) {
              var __ytinterval = uw.setInterval(function(){
                if (uw.ytplayer && uw.ytplayer.config) {
                  uw.clearInterval(__ytinterval);
                  ytwatchinit();
                }
              }, 50);
            }
          }
        } else if (loc.href.indexOf(".youtube.com/user/") !== -1 ||
                  (document.body.innerHTML.indexOf("data-swf-config=\"{") !== -1 && document.body.innerHTML.indexOf("&quot;el&quot;: &quot;profilepage&quot;") !== -1) ||
                  (ytcenter.player.getConfig() && ytcenter.player.getConfig().args.el === "profilepage")) {
          con.log("YouTube Channel Featured Page Detected");
          if (typeof ytcenter.player.getConfig() !== "undefined") {
            ytchannelfeatureinit();
          } else {
            var __ytinterval = uw.setInterval(function(){
              if (typeof ytcenter.player.getConfig() !== "undefined") {
                uw.clearInterval(__ytinterval);
                ytchannelfeatureinit();
              }
            }, 50);
          }
        } else if (loc.href.indexOf(".youtube.com/embed/") !== -1) {
          con.log("YouTube Embed Page Detected");
          if (typeof ytcenter.player.getConfig() !== "undefined") {
            ytembedinit();
          } else {
            var __ytinterval = uw.setInterval(function(){
              if (typeof ytcenter.player.getConfig() !== "undefined") {
                uw.clearInterval(__ytinterval);
                ytembedinit();
              }
            }, 50);
          }
        } else if (loc.href.indexOf(".youtube.com/") !== -1) {
          if (loc.pathname === "/results") {
            ytcenter.page = "search";
          } else {
            ytcenter.page = "normal";
          }
          con.log("YouTube Page Detected");
          yt = uw.yt;
          ytcenter.hideFeedbackButton(ytcenter.settings.hideFeedbackButton);
        }
      } catch (e) {
        con.error(e);
      }
    };
    (function(){
      var __fastLoaded = false,
          __bodyLoaded = false,
          __called = false;
      
      var __fastLoad = function(){
        con.log("Loading Settings");
        ytcenter.loadSettings();
        ytcenter.updateLanguage();
        
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
        uw.ytcenter.settings = uw.ytcenter.settings || {};
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
        
        // Adding Styles
        $AddStyle("@media screen and (min-width:1236px){.ytcenter-resize-aligned.site-left-aligned.guide-enabled #player, .ytcenter-resize-aligned.site-left-aligned.guide-enabled #watch7-main-container{padding-left:190px!important}.ytcenter-resize-disaligned.site-left-aligned.guide-enabled #player, .ytcenter-resize-disaligned.site-left-aligned.guide-enabled #watch7-main-container{padding-left:0!important}}");
        $AddStyle("body.ytcenter-branding-remove-banner #page.watch #guide-container.branded{top:0!important}body.ytcenter-branding-remove-background #guide-container.branded{background: none repeat scroll 0% 0% transparent!important}");
        $AddStyle("#watch7-content{clear:both}.ytcenter-resize-main.ytcenter-player-center #watch7-creator-bar{margin:0 auto}");
        $AddStyle("@media screen and (max-width:1165px){.ytcenter-resize-main.guide-expanded #watch7-main-container{padding-left:190px!important}.ytcenter-resize-main.guide-collapsed #watch7-main-container{padding-left:58px!important}}@media screen and (min-width:1166px){.ytcenter-resize-main #watch7-main-container{padding-left:0!important}}");
        $AddStyle(".ytcenter-embed{display:inline-block;vertical-align:top;}.video-list-item>a{width:100%}");
        $AddStyle(".ytcenter-settings-content{color:rgb(85, 85, 85)}");
        // Ads
        $AddStyle(".ytcenter-remove-ads-page .ad-div,.ytcenter-remove-ads-page .mastad,.ytcenter-remove-ads-page .masthead-ad-control,.ytcenter-remove-ads-page .masthead-ad-control-lihp,.ytcenter-remove-ads-page #watch-channel-brand-div,.ytcenter-remove-ads-page .watch-pyv-vid,.ytcenter-remove-ads-page #feed-pyv-container,.ytcenter-remove-ads-page #premium-yva,.ytcenter-remove-ads-page .branded-page-v2-top-row{display:none!important}");
        // Page Center
        $AddStyle(".ytcenter-site-center #sb-wrapper{width:1003px!important}.ytcenter-site-center #sb-wrapper #sb-container{right:-14px!important}");
        /* Channel v2 width fix */$AddStyle("body.ytcenter-channelv2 #yt-masthead,body.ytcenter-channelv2 #page-container > #page.channel{width:auto!important;min-width:1003px;max-width:1422px}body.ytcenter-channelv2 #page.channel > #guide + #content{width:auto!important}");
        $AddStyle(".ytcenter-site-center .ytcenter-settings-content,.ytcenter-site-center .ytcenter-settings-title,.ytcenter-site-center .ytcenter-settings-header{margin:0 auto;width:1103px;}");
        $AddStyle(".ytcenter-site-center #page-container > #page{margin:0 auto!important}.ytcenter-site-center #masthead-subnav > ul{width:1003px;margin:0 auto!important}.ytcenter-site-center #page.channel.page-default{width:100%!important}.ytcenter-site-center #content-container #baseDiv,.ytcenter-site-center #masthead-subnav{margin-left:auto!important;margin-right:auto!important}.ytcenter-site-center #footer-container #footer{width:1003px!important;margin-left:auto!important;margin-right:auto!important}.ytcenter-site-center #yt-masthead-container #yt-masthead,.ytcenter-site-center #header,.ytcenter-site-center #alerts{width:1003px;margin:0 auto!important}.ytcenter-site-search.ytcenter-site-center.exp-new-site-width #guide+#content{width:823px!important}.ytcenter-site-search.ytcenter-site-center.exp-new-site-width #page{width:1003px!important}.ytcenter-site-center #page,.ytcenter-site-center #yt-masthead,.ytcenter-site-center #ad_creative_1,.ytcenter-site-center #footer,.ytcenter-site-center #masthead_child_div,.ytcenter-site-center #masthead-expanded-lists-container,.ytcenter-site-center #baseDiv,.ytcenter-site-center.no-sidebar #alerts,.ytcenter-site-center.no-sidebar #ticker .ytg-wide,.ytcenter-site-center.no-sidebar #masthead-subnav{-moz-transition:none!important;-ms-transition:none!important;-o-transition:none!important;-webkit-transition:none!important;transition:none!important}.flex-width-enabled.ytcenter-site-center #yt-masthead{width:auto!important;max-width:1422px!important;min-width:1003px!important}.flex-width-enabled.ytcenter-site-center #page,body.flex-width-enabled.ytcenter-site-center #guide+#content{max-width:1422px!important;min-width:1003px!important;width:auto!important}.ytcenter-site-watch #page-container{display:table!important}.ytcenter-site-watch.ytcenter-site-center #content,.site-left-aligned.ytcenter-site-center #page.watch #guide-container, .site-left-aligned.ytcenter-site-center .watch7-playlist, .site-left-aligned.ytcenter-site-center #player, .site-left-aligned.ytcenter-site-center #watch7-main-container{-moz-transition:margin-left 0s ease-in-out;-ms-transition:margin-left 0s ease-in-out;-o-transition:margin-left 0s ease-in-out;-webkit-transition:margin-left 0s ease-in-out;transition:margin-left 0s ease-in-out}.ytcenter-site-watch.ytcenter-site-center #page-container{margin:0 auto!important}.ytcenter-site-watch.ytcenter-site-center #guide-container{left:10px!important}.ytcenter-site-watch.ytcenter-site-center #watch7-video,.ytcenter-site-watch.ytcenter-site-center #watch7-main{left:0;width:945px}.ytcenter-site-watch.ytcenter-site-center.sidebar-collapsed.ytcenter-resize-disaligned #page{width:100%!important}.ytcenter-site-watch.ytcenter-site-center.sidebar-collapsed #page{width:901px!important}.ytcenter-site-watch.ytcenter-site-center.sidebar-collapsed #watch7-video,.ytcenter-site-watch.ytcenter-site-center.sidebar-collapsed #watch7-main{left:0!important;width:808px!important}.ytcenter-site-watch.ytcenter-site-center.sidebar-expanded #watch7-sidebar{padding:0 0 10px 0px!important;width:300px!important}.ytcenter-site-watch.ytcenter-site-center.sidebar-expanded .watch-wide #watch7-sidebar,.ytcenter-site-watch.ytcenter-site-center .watch-playlist #watch7-sidebar,.ytcenter-site-watch.ytcenter-site-center.sidebar-collapsed .watch-playlist #watch7-sidebar,.ytcenter-site-watch.ytcenter-site-center .watch-branded #watch7-sidebar{padding-top:15px!important}.ytcenter-site-watch.ytcenter-site-center.sidebar-collapsed #watch7-sidebar{padding:0 0 10px 0!important;width:168px!important}.ytcenter-site-watch.ytcenter-site-center.sidebar-collapsed .watch-wide #watch7-sidebar{padding-top:15px!important}.ytcenter-site-watch.ytcenter-site-center #player,.ytcenter-site-watch.ytcenter-site-center #watch7-main-container{padding-left:190px}.ytcenter-site-watch.ytcenter-site-center .watch7-playlist{padding-left:0px}@media screen and (min-width:1345px){.ytcenter-site-watch.ytcenter-site-center.ytcenter-resize-aligned #page{width:1325px}}@media screen and (max-width:1345px){.ytcenter-site-watch.ytcenter-site-center #page{width:1033px}.ytcenter-site-watch.ytcenter-site-center #page-container{margin:0!important}.ytcenter-site-watch.ytcenter-site-center.ytcenter-resize-disaligned #page-container{margin:0 auto!important}}@media screen and (max-width:1165px){.ytcenter-site-watch.ytcenter-site-center.guide-collapsed.sidebar-expanded.ytcenter-resize-disaligned #page{width:100%!important}.ytcenter-site-watch.ytcenter-site-center.guide-collapsed.sidebar-expanded #page{width:1003px!important}.ytcenter-site-watch.ytcenter-site-center.guide-collapsed.ytcenter-resize-disaligned #player,.ytcenter-site-watch.ytcenter-site-center.guide-collapsed.ytcenter-resize-disaligned .watch7-playlist{padding-left:0!important}.ytcenter-site-watch.ytcenter-site-center.guide-collapsed #player,.ytcenter-site-watch.ytcenter-site-center.guide-collapsed #watch7-main-container,.ytcenter-site-watch.ytcenter-site-center.guide-collapsed .watch7-playlist{padding-left:58px!important}}.ytcenter-resize-disaligned #page,.ytcenter-resize-disaligned #watch7-video{width:100%!important}.ytcenter-resize-disaligned .watch7-playlist-bar{margin-left:0!important}.ytcenter-resize-disaligned .watch7-playlist-data{padding-left:0!important;margin:0 auto!important}.ytcenter-resize-disaligned #player,.ytcenter-resize-disaligned #watch7-playlist-data{padding-left:0!important}.ytcenter-resize-disaligned #watch7-player{margin-left:auto!important;margin-right:auto!important}");
        $AddStyle(".video-list .video-list-item .yt-uix-button-subscription-container{left:73px!important;}.video-list .video-list-item a.related-channel{padding:0!important;}");
        
        // Player Center
        $AddStyle(".ytcenter-resize-main #page-container{width:100%!important;}.ytcenter-resize-main #watch7-main-container{padding:0!important;}.ytcenter-resize-main.ytcenter-player-center #player-api,.ytcenter-resize-main.ytcenter-player-center #watch7-playlist-data{margin:0 auto!important;}");
        $AddStyle(".ytcenter-resize-disaligned #page-container{width:100%}.ytcenter-resize-disaligned #player-api{margin:0 auto}");
        
        $AddStyle(".ytcenter-scrollbar{overflow:hidden}.ytcenter-scrollbar:hover{overflow:auto}.ytcenter-scrollbar::-webkit-scrollbar{height:16px;overflow:visible;width:16px}.ytcenter-scrollbar::-webkit-scrollbar-thumb{background-color:rgba(0,0,0,.2);background-clip:padding-box;border:solid transparent;border-width:1px 1px 1px 6px;min-height:28px;padding:100px 0 0;box-shadow:inset 1px 1px 0 rgba(0,0,0,.1),inset 0 -1px 0 rgba(0,0,0,.07)}.ytcenter-scrollbar::-webkit-scrollbar-thumb:hover{background-color:rgba(0,0,0,.4);box-shadow:inset 1px 1px 1px rgba(0,0,0,.25)}.ytcenter-scrollbar::-webkit-scrollbar-thumb:active{background-color:rgba(0,0,0,0.5);box-shadow:inset 1px 1px 3px rgba(0,0,0,0.35)}.ytcenter-scrollbar::-webkit-scrollbar-corner{background:transparent}.ytcenter-scrollbar::-webkit-scrollbar-button{height:0;width:0}.ytcenter-scrollbar::-webkit-scrollbar-track{background-clip:padding-box;border:solid transparent;border-width:0 0 0 4px}.ytcenter-scrollbar::-webkit-scrollbar-track:horizontal{border-width:4px 0 0}.ytcenter-scrollbar::-webkit-scrollbar-track:hover{background-color:rgba(0,0,0,.05);box-shadow:inset 1px 0 0 rgba(0,0,0,.1)}.ytcenter-scrollbar::-webkit-scrollbar-track:horizontal:hover{box-shadow:inset 0 1px 0 rgba(0,0,0,.1)}.ytcenter-scrollbar::-webkit-scrollbar-track:active{background-color:rgba(0,0,0,.05);box-shadow:inset 1px 0 0 rgba(0,0,0,.14),inset -1px 0 0 rgba(0,0,0,.07)}.ytcenter-scrollbar::-webkit-scrollbar-track:horizontal:active{box-shadow:inset 0 1px 0 rgba(0,0,0,.14),inset 0 -1px 0 rgba(0,0,0,.07)}.ytcenter-list{background:#fbfbfb;width:100%;height:100%}.ytcenter-list.ytcenter-dragdrop-indragging,.ytcenter-list.ytcenter-dragdrop-indragging *{cursor:move!important}.ytcenter-list-item:first-of-type{border-top-color:transparent}.ytcenter-list-item{position:relative;clear:both;margin:0;border-top:1px solid #fff;border-bottom:1px solid #e3e3e3;font-size:13px;width:100%;height:40px}.ytcenter-list-item .ytcenter-dragdrop-handle{width:20px;height:40px;cursor:move;position:absolute;left:0}.ytcenter-list-item.ytcenter-dragdrop-dragging{background:#f2f2f2}.ytcenter-list-item.ytcenter-dragdrop-dragging li{background:0}.ytcenter-list-item.ytcenter-dragdrop-dragging .ytcenter-dragdrop-handle{background:url(//s.ytimg.com/yts/img/playlist/drag-drop-indicator-vflv1iR5Z.png) 10px 15px no-repeat}.ytcenter-list.ytcenter-dragdrop-notdragging .ytcenter-list-item:hover .ytcenter-dragdrop-handle{background:url(//s.ytimg.com/yts/img/playlist/drag-drop-indicator-vflv1iR5Z.png) 10px 15px no-repeat}.ytcenter-list-item .ytcenter-list-item-content{padding:8px 13px 0 20px}.ytcenter-list:hover .ytcenter-list-item{width:auto}.ytcenter-list-item .ytcenter-list-item-title{color:#000;font-weight:bold;font-size:13px}.ytcenter-list-item .ytcenter-list-item-subtext{display:block;font-size:11px;color:#777;line-height:1.4em;height:1.4em}.ytcenter-list-item-title,.ytcenter-list-item-subtext{text-overflow:ellipsis;-o-text-overflow:ellipsis;word-wrap:normal;white-space:nowrap;overflow:hidden}.ytcenter-list-item.ytcenter-list-item-selected{border-color:#e6e6e6;background:#e6e6e6!important}.ytcenter-list.ytcenter-dragdrop-notdragging .ytcenter-list-item:hover{background:#f2f2f2;cursor:pointer}.ytcenter-list-header-btn{min-width:172px!important;height:100%!important;border:0!important;border-radius:0!important;background:#fff!important;border-right:1px solid #eee!important;color:#000!important;text-shadow:0 0 0!important;overflow:hidden!important;position:relative!important}.ytcenter-list-header-btn:hover{background:0;border:0;padding-top:1px}.ytcenter-list-header-btn:hover:before{position:absolute;top:0;left:0;right:0;bottom:0;height:200px;content:' ';-moz-box-shadow:inset 0 0 5px #bbb;-ms-box-shadow:inset 0 0 5px #bbb;-webkit-box-shadow:inset 0 0 5px #bbb;box-shadow:inset 0 0 5px #bbb;background:transparent}.ytcenter-confirmbox{position:fixed;top:0;left:0;width:100%;height:100%;z-index:9999}.ytcenter-confirmbox .ytcenter-confirmbox-mask{opacity:.95;filter:alpha(opacity=95);background:#000}.ytcenter-confirmbox .ytcenter-confirmbox-floater{float:left;height:50%;margin-bottom:-59px}.ytcenter-confirmbox .ytcenter-confirmbox-box{width:350px;height:90px;position:relative;background:#fff;z-index:10000;padding:14px;clear:both;margin:0 auto;border:1px solid #bbb;-moz-box-shadow:0 0 5px #bbb;-ms-box-shadow:0 0 5px #bbb;-webkit-box-shadow:0 0 5px #bbb;box-shadow:0 0 5px #bbb}.ytcenter-confirmbox .ytcenter-confirmbox-message{height:100%}.ytcenter-confirmbox .ytcenter-confirmbox-controls{margin-top:-28px}.ytcenter-panel{border-left:1px solid #eee;display:inline-block;width:773px;position:relative}.ytcenter-panel-label:first-of-type{padding-top:16px}.ytcenter-panel-label{padding:8px;color:#000;font-size:13px}.ytcenter-panel-label label{padding-right:8px;width:100px;display:inline-block}.ytcenter-settings-content>div{padding-left:25px}.ytcenter-resize-panel{border:1px solid #eee;border-bottom:0;border-left:0;width:945px;margin-top:5px}.ytcenter-resize-panel-header{width:100%;height:34px;border-left:1px solid #eee}.ytcenter-resize-panel-content{border-bottom:1px solid #eee;position:relative;overflow:hidden}.ytcenter-resize-panel-content:before{position:absolute;top:0;right:0;width:774px;height:1000%;content:' ';-moz-box-shadow:inset 0 0 5px #bbb;-ms-box-shadow:inset 0 0 5px #bbb;-webkit-box-shadow:inset 0 0 5px #bbb;box-shadow:inset 0 0 5px #bbb;background:transparent}.ytcenter-resize-panel-list{width:170px;height:301px;display:inline-block;float:left;border-top:1px solid #eee;border-left:1px solid #eee}.ytcenter-resize-dropdown-selected{background:#555!important;color:#fff!important}.ytcenter-resize-aspect-bind{display:inline-block;width:5px;height:52px;border-top:2px solid #aaa;border-right:2px solid #aaa;border-bottom:2px solid #aaa}.ytcenter-resize-chain{width:7px;height:30px;background:url(data:image/png;base64,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) no-repeat;background-color:#fff;background-position:center}.ytcenter-resize-unchain{width:7px;height:30px;background:url(data:image/png;base64,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) no-repeat;background-color:#fff;background-position:center}.ytcenter-resize-ratio{cursor:pointer}.force-hid{display:none!important}.ytcenter-placment-section{border:1px solid #e6e6e6;border-top-width:0;border-bottom-width:0;padding:0 18px}");
        
        // Playlist fixed
        $AddStyle(".watch-playlist-collapsed #watch7-playlist-tray-container{height:0px!important;}");
        $AddStyle("#playlist{margin-right:0px!important;}");
        $AddStyle(".watch7-playlist-bar{width:100%!important;}");
        
        // YouTube Center Settings
        $AddStyle(".ytcenter-settings-content{padding-left:35px;}");
        
        $AddStyle(".resize-options{width: 335px;padding:0 10px;position:absolute;bottom:5px;}");
        $AddStyle(".ytcenter-site-center #yt-masthead, #footer-hh {width: 1003px!important}");
        $AddStyle(".ytcenter-settings-header .yt-uix-button-epic-nav-item {border: none;padding: 0 3px 3px 3px;cursor: pointer;} .ytcenter-settings-header a.yt-uix-button.yt-uix-button-epic-nav-item, .ytcenter-settings-header button.yt-uix-button-epic-nav-item, .ytcenter-settings-header .epic-nav-item, .ytcenter-settings-header .epic-nav-item-heading {border: none;padding: 0 3px 3px 3px;cursor: pointer;background: none;color: #9c9c9c;font-size: 11px;font-weight: bold;height: 29px;line-height: 29px;-moz-box-sizing: content-box;-ms-box-sizing: content-box;-webkit-box-sizing: content-box;box-sizing: content-box;-moz-border-radius: 0;-webkit-border-radius: 0;border-radius: 0;} .ytcenter-settings-header .yt-uix-button-epic-nav-item.selected {border-bottom: 3px solid;border-color: #b00;padding-bottom: 0;color: #333;} .ytcenter-settings-header a.yt-uix-button-epic-nav-item:hover, .ytcenter-settings-header a.yt-uix-button-epic-nav-item.selected, .ytcenter-settings-header button.yt-uix-button-epic-nav-item:hover, .ytcenter-settings-header button.yt-uix-button-epic-nav-item.selected, .ytcenter-settings-header .epic-nav-item:hover, .ytcenter-settings-header .epic-nav-item.selected, .ytcenter-settings-header .epic-nav-item-heading {height: 29px;line-height: 29px;vertical-align: bottom;color: #333;border-bottom: 3px solid;border-color: #b00;padding-bottom: 0;display: inline-block;}")
        $AddStyle(".ytcenter-lights-off #watch7-video, .ytcenter-lights-off #player-api{z-index:5!important;}");
        $AddStyle(".ytcenter-branding-remove-background #player {background:none!important;}");
        $AddStyle(".ytcenter-branding-remove-banner #watch7-sidebar {margin-top: -390px} .ytcenter-branding-remove-banner .watch-playlist #watch7-sidebar {margin-top: 0px!important}");
        $AddStyle(".ytcenter-branding-remove-banner #watch7-branded-banner,.ytcenter-branding-remove-banner #player-branded-banner {display:none!important;}");
        $AddStyle(".ytcenter-repat-icon{background: no-repeat url(//s.ytimg.com/yts/imgbin/www-hitchhiker-vflMCg1ne.png) -19px -25px;width: 30px;height: 18px;}");
        $AddStyle("#watch7-action-buttons .yt-uix-button-content{color: #555;text-shadow: 0 1px 0 #fff;}");
        $AddStyle(".ytcenter-uix-button-toggled{border-color:#c6c6c6;background-color:#e9e9e9;-moz-box-shadow: inset 0 1px 1px rgba(0,0,0,.20);-ms-box-shadow: inset 0 1px 1px rgba(0,0,0,.20);-webkit-box-shadow: inset 0 1px 1px rgba(0,0,0,.20);box-shadow: inset 0 1px 1px rgba(0,0,0,.20);filter: progid:DXImageTransform.Microsoft.Gradient(GradientType=0,StartColorStr=#fff8f8f8,EndColorStr=#ffeeeeee);background-image: -moz-linear-gradient(top,#f8f8f8 0,#eee 100%);background-image: -ms-linear-gradient(top,#f8f8f8 0,#eee 100%);background-image: -o-linear-gradient(top,#f8f8f8 0,#eee 100%);background-image: -webkit-gradient(linear,left top,left bottom,color-stop(0,#f8f8f8),color-stop(100%,#eee));background-image: -webkit-linear-gradient(top,#f8f8f8 0,#eee 100%);background-image: linear-gradient(to bottom,#f8f8f8 0,#eee 100%);}");
        $AddStyle(".ytcenter-align{padding:0!important};");
        $AddStyle(".ytcenter-align > #watch7-video {margin: 0 auto!important}");
        $AddStyle(".ytcenter-fill,.ytcenter-fill #player-api{width:100%!important;height:100%!important}");
        $AddStyle("ul.ytcenter-menu-3d-hide li.ytcenter-menu-item-3d {display:none}");
        $AddStyle(".ytcenter-range{display:inline-block;cursor:default;position:relative;border:1px solid;outline:0;white-space:nowrap;word-wrap:normal;vertical-align:middle;-moz-border-radius:2px;-webkit-border-radius:2px;border-radius:2px;border-color:#CCC #CCC #AAA;background:white;padding:0;margin:0;-webkit-touch-callout:none;-webkit-user-select:none;-khtml-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;}.ytcenter-range a.ytcenter-range-handle{position:absolute;top:-1px;left:0px;outline:none;margin-left:-.5em;cursor:default;padding:0;margin:0;-webkit-touch-callout:none;-webkit-user-select:none;-khtml-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;}");
        
        
        if (document && document.body && !__bodyLoaded) {
          __bodyLoaded = true;
          __bodyLoad();
        }
      };
      var __bodyLoad = function(){
        ytcenter.site.setPageAlignment((ytcenter.settings.watch7centerpage ? "center" : "left"));
        ytcenter.player.center((ytcenter.settings.watch7playeralign ? true : false));
        
        if (ytcenter.settings.removeAdvertisements) {
          document.body.className += " ytcenter-remove-ads-page";
        }
        
        if (loc.href.indexOf(".youtube.com/watch?") !== -1) {
          if (ytcenter.settings["resize-default-playersize"] === "default") {
            ytcenter.player.currentResizeId = (ytcenter.settings.player_wide ? ytcenter.settings["resize-large-button"] : ytcenter.settings["resize-small-button"]);
            ytcenter.player.updateResize();
          } else {
            ytcenter.player.currentResizeId = ytcenter.settings['resize-default-playersize'];
            ytcenter.player.updateResize();
          }
        }
        if (loc.pathname === "/results") {
          $AddCSS(document.body, "ytcenter-site-search");
        } else if (loc.pathname === "/watch") {
          $AddCSS(document.body, "ytcenter-site-watch");
          $AddCSS(document.body, "ytcenter-resize-aligned");
        } else {
          con.log("Pathname not indexed (" + loc.pathname + ")");
        }
        
        if ((document.readyState === "interactive" || document.readyState === "complete") && __fastLoaded && !__called) {
          __called = true;
          dclcaller();
        }
      };
      if (document && document.getElementsByTagName && document.getElementsByTagName("head")[0]) {
        __fastLoaded = true;
        __fastLoad();
      } else {
        var __fastLoadedInterval = uw.setInterval(function(){
          if (document && document.getElementsByTagName && document.getElementsByTagName("head")[0] && !__fastLoaded) {
            __fastLoaded = true;
            __fastLoad();
            uw.clearInterval(__fastLoadedInterval);
          } else if (__fastLoaded) {
            uw.clearInterval(__fastLoadedInterval);
          }
        }, 50);
        document.addEventListener("readystatechange", function(){
          if (__fastLoaded) return;
          if (document && document.getElementsByTagName && document.getElementsByTagName("head")[0]) {
            __fastLoaded = true;
            __fastLoad();
          }
        }, false);
      }
      if (document && document.body && __fastLoaded && !__bodyLoaded) {
        __bodyLoaded = true;
        __bodyLoad();
      } else if (!__bodyLoaded) {
        var __bodyLoadedInterval = uw.setInterval(function(){
          if (!__fastLoaded) return;
          if (document && document.body && !__bodyLoaded) {
            __bodyLoaded = true;
            __bodyLoad();
            uw.clearInterval(__bodyLoadedInterval);
          } else if (__bodyLoaded) {
            uw.clearInterval(__bodyLoadedInterval);
          }
        }, 50);
        document.addEventListener("readystatechange", function(){
          if (!__fastLoaded || __bodyLoaded) return;
          if (document && document.body) {
            __bodyLoaded = true;
            __bodyLoad();
          }
        }, false);
      }
      if ((document.readyState === "interactive" || document.readyState === "complete") && __fastLoaded && !__called) {
        __called = true;
        dclcaller();
      } else if (!__called) {
        var __mainLoadedInterval = uw.setInterval(function(){
          if (!__fastLoaded) return;
          if ((document.readyState === "interactive" || document.readyState === "complete") && !__called) {
            __called = true;
            dclcaller();
            uw.clearInterval(__bodyLoadedInterval);
          } else if (__called) {
            uw.clearInterval(__bodyLoadedInterval);
          }
        }, 50);
        document.addEventListener("readystatechange", function(){
          if (__called) return;
          if ((document.readyState === "interactive" || document.readyState === "complete") && __fastLoaded && document.body.innerHTML) {
            __called = true;
            dclcaller();
          }
        }, false);
      }
    })();
    if (loc && loc.href && loc.href.match && loc.href.match(/^(http|https):\/\/dl\.dropbox\.com\/u\/13162258\/YouTube%20Center\/install/)) {
      con.log("Detected Install Page");
      uw['ytcenter'] = {
        installed: true,
        version: ytcenter.version,
        revision: ytcenter.revision
      };
    }
    con.log("At Scope End");
  };
  if (window && window.navigator && window.navigator.userAgent && window.navigator.userAgent.indexOf('Chrome') > -1) {
    window.addEventListener("message", function(e){
      try {
        var d = JSON.parse(e.data);
        if (d.method === "CrossOriginXHR") {
          _xhr(d.id, d.arguments[0]);
        }
      } catch (e) {}
    }, false);
    
    _inject(___main_function);
  } else {
    ___main_function(false);
  }
})();