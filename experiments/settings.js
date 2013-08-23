/*** module settings.js
 * This will replace the old settings when it's finished.
 * The settings will be put into a dialog as the experimental dialog is at the moment.
 * ********************************************************************************************
 * The settings will include categories and from the categories to subcategories, where the subcateogories will contain the options.
 * It will be possible for YouTube Center to hide or disable specific categories/subcategories/options if needed.
 * ********************************************************************************************
 * The categories will be placed to the left side as the guide is on YouTube. The categories will use the same red design as the guide.
 * The subcategories will be the same as the categories in the old settings.
 * The options will be much more customizeable, where you will be able to add modules.
 ***/
/** Option  It should be easy to add new options.
 * The option will contain a label if the label is specified otherwise it will not be added.
 * The "defaultSetting" will be available as it currently is.
 * The "args" will be added, which will be a way to pass more arguments to the module (if needed or required).
 * The "type" will be replaced with "module", which will be a function with the prefix "ytcenter.modules.*".
 * The "help" will still be present in this version.
 * Everything is optional except for the type, which is needed to add the option to the settings.
 **/
/** Module  Handles the option like what happens when I click on that checkbox or input some text in a textfield...
 * When the module (function) is called. It need to have the following arguments passed:
 ** defaultSetting  Needs the defaultSetting to set the default settings.
 * The module needs to return an object with:
 ** element An element, which will be added to the settings.
 ** bind  A function, where a callback function is passed. When an update which requires YouTube Center to save settings this callback function is called.
 ** update  A function, which will be called whenever a value needs to be changed in the module. In an instance where the settings has changed and the module needs to update with the changes.
 **/


/* Settings up fake YouTube Center enviorment */
var ytcenter = {};
ytcenter.version = "2.0";
ytcenter.events = {};
ytcenter.events.performEvent = function(){};
ytcenter.events.addEvent = function(){};
ytcenter.utils = {};
ytcenter.utils.getScrollOffset = function(){
  var top = Math.max(document.body.scrollTop, document.documentElement.scrollTop),
      left = Math.max(document.body.scrollLeft, document.documentElement.scrollLeft);
  return {top:top,left:left};
};
ytcenter.utils.getOffset = function(elm, toElement){
  var _x = 0, _y = 0;
  while(elm && elm !== toElement && !isNaN(elm.offsetLeft) && !isNaN(elm.offsetTop)) {
    _x += elm.offsetLeft - elm.scrollLeft;
    _y += elm.offsetTop - elm.scrollTop;
    elm = elm.offsetParent;
  }
  return { top: _y, left: _x };
};
ytcenter.utils.wrapModule = function(module, tagname){
  var a = document.createElement(tagname || "span");
  a.appendChild(module.element);
  return a;
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
ytcenter.utils.replaceTextToText = function(text, replacer){
  var regex, arr = [], tmp = "";
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
ytcenter.utils.addEventListener = (function(){
  var listeners = [];
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

ytcenter.language = {};
ytcenter.language.db = {
  COLORPICKER_COLOR_RED: "Red",
  COLORPICKER_COLOR_GREEN: "Green",
  COLORPICKER_COLOR_BLUE: "Blue",
  COLORPICKER_COLOR_HTMLCODE: "HTML Code",
  COLORPICKER_CANCEL: "Cancel",
  COLORPICKER_SAVE: "Save",
  COLORPICKER_TITLE: "Color Picker",
  SETTINGS_HELP_ABOUT: "Help about {option}."
};
ytcenter.language.getLocale = function(lang){
  return ytcenter.language.db[lang] || lang;
};
ytcenter.language.addLocaleElement = function(){}; // Just a tmp

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


/******************************* END OF YOUTUBE CENTER PLACEHOLDERS *******************************/



/***** Module part *****/
ytcenter.modules = {};
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
      ytcenter.events.performEvent("ui-refresh");
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
  var bCallback,
      hue = (option && option.args && option.args.hue) || 0,
      sat = (option && option.args && option.args.sat) || 0,
      val = (option && option.args && option.args.val) || 0,
      wrapper = document.createElement("div"),
      _sat = document.createElement("div"),
      _value = document.createElement("div"),
      handler = document.createElement("div"),
      mousedown
  
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
      wrapper = document.createElement("span");
  
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
      if (list[i].value === option.defaultSetting) {
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
    ytcenter.events.addEvent("ui-refresh", function(){
      sc2.textContent = s.options[s.selectedIndex].textContent;
    });
    ytcenter.utils.addEventListener(s, "change", function(){
      sc2.textContent = s.options[s.selectedIndex].textContent;
      if (cCallback)
        cCallback(s.value);
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
  input.value = option && option.defaultSetting;
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
    ytcenter.utils.addEventListener(checkboxInput, "change", function(){
      callback(checkboxInput.checked);
    }, false);
  }
  var frag = document.createDocumentFragment(),
      checkboxOuter = document.createElement("span"),
      checkboxInput = document.createElement("input"),
      checkboxOverlay = document.createElement("span"),
      checked = option.defaultSetting;
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
    } else {
      ytcenter.utils.removeClass(checkboxOuter, "checked");
    }
    checkboxInput.setAttribute("value", checked);
  }, false);
  
  frag.appendChild(checkboxOuter);
  
  return {
    element: frag,
    bind: bind,
    update: update
  };
};

/**** Settings part ****/
ytcenter.settings = (function(){
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
      options: []
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
      visible: true
    });
    return a.getOption(id);
  };
  a.getCategory = function(id){
    if (categories.length <= id || id < 0) throw new Error("[Settings Category] Category with specified id doesn't exist!");
    var cat = categories[id];
    return {
      getId: function(){
        return id;
      },
      setVisibility: function(visible){
        cat.visible = visible;
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
    if (subcategories.length <= id || id < 0) throw new Error("[Settings SubCategory] Category with specified id doesn't exist!");
    var subcat = subcategories[id];
    return {
      getId: function(){
        return id;
      },
      setVisibility: function(visible){
        subcat.visible = visible;
      },
      setEnabled: function(enabled){
        subcat.enabled = enabled;
      },
      addOption: function(option){
        subcat.options.push(options[option.getId()]);
      },
      select: function(){
        if (cat.select) cat.select();
      }
    };
  };
  a.getOption = function(id){
    if (options.length <= id || id < 0) throw new Error("[Settings Options] Option with specified id doesn't exist!");
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
        option.visible = visible;
      },
      setEnabled: function(enabled){
        option.enabled = enabled;
      }
    };
  };
  a.createOptionsForLayout = function(subcat){
    var frag = document.createDocumentFragment();
    
    subcat.options.forEach(function(option){
      var optionWrapper = document.createElement("div"),
          label, module, moduleContainer, labelText, help, replaceHelp;
      if (option.label && option.label !== "") {
        labelText = document.createTextNode(ytcenter.language.getLocale(option.label));
        ytcenter.language.addLocaleElement(labelText, option.label, "@textContent");
        
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
      if (!option.module)
        throw new Error("[Settings createOptionsForLayout] Option (" + option.id + ", " + option.label + ") doesn't have module!");
      if (!ytcenter.modules[option.module])
        throw new Error("[Settings createOptionsForLayout] Option (" + option.id + ", " + option.label + ", " + option.module + ") are using an non existing module!");

      moduleContainer = document.createElement("span");
      module = ytcenter.modules[option.module](option);
      moduleContainer.appendChild(module.element);
      
      module.bind(function(value){
        console.log("[Placeholder] Saves " + option.defaultSetting + " with value: " + value);
      });
      
      optionWrapper.appendChild(moduleContainer);
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
    productVersion.textContent = "YouTube Center v" + ytcenter.version;
    
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
      sSelectedList.push(acat);
      acat.href = ";return false;";
      acat.className = "ytcenter-settings-category-item yt-valign" + (categoryHide ? "" : " ytcenter-selected");
      
      ytcenter.utils.addEventListener(acat, "click", function(e){
        category.select();
        
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
          
          e.preventDefault();
          e.stopPropagation();
          return false;
        }, false);
        subcatLinkList.push(liItemLink);
        subcatContentList.push(content);
        subcat.select = function(){
          subcatLinkList.forEach(function(item){
            ytcenter.utils.removeClass(item, "ytcenter-selected");
          });
          subcatContentList.forEach(function(item){
            ytcenter.utils.addClass(item, "hid");
          });
          ytcenter.utils.removeClass(content, "hid");
          ytcenter.utils.addClass(liItemLink, "ytcenter-selected");
        };
        
        categoryContent.appendChild(content);
        hideContent = true;
      });
      topheader.appendChild(topheaderList);
      
      topheader.className = (categoryHide ? "hid" : "");
      categoryContent.className = (categoryHide ? "hid" : "");
      
      subcatList.push(topheader);
      subcatList.push(categoryContent);
      subcatTop.appendChild(topheader);
      subcatContent.appendChild(categoryContent);
      
      category.select = function(){
        sSelectedList.forEach(function(item){
          ytcenter.utils.removeClass(item, "ytcenter-selected");
        });
        subcatList.forEach(function(item){
          ytcenter.utils.addClass(item, "hid");
        });
        ytcenter.utils.addClass(acat, "ytcenter-selected");
        ytcenter.utils.removeClass(topheader, "hid");
        ytcenter.utils.removeClass(categoryContent, "hid");
      };
      categoryHide = true;
    });
    
    leftPanel.appendChild(categoryList);
    leftPanel.appendChild(productVersion);
    
    rightPanelContent.appendChild(subcatTop);
    rightPanelContent.appendChild(subcatContent);
    
    rightPanel.appendChild(rightPanelContent);
    
    rightPanelContent.className = "ytcenter-settings-panel-right-content";
    panelWrapper.className = "ytcenter-settings-content";
    
    panelWrapper.appendChild(leftPanel);
    panelWrapper.appendChild(rightPanel);
    
    frag.appendChild(panelWrapper);
    
    return frag;
  };
  
  a.createDialog = function(){
    var dialog = ytcenter.dialog("YouTube Center Settings", a.createLayout(), [], "top"),
        closeButton = document.createElement("div"),
        closeIcon = document.createElement("img");
    closeIcon.className = "close";
    closeIcon.setAttribute("src", "http://s.ytimg.com/yts/img/pixel-vfl3z5WfW.gif");
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

// Creating Categories
var general = ytcenter.settings.createCategory("General"),
    player = ytcenter.settings.createCategory("Player"),
    ui = ytcenter.settings.createCategory("UI"),
    update = ytcenter.settings.createCategory("Update"),
    debug = ytcenter.settings.createCategory("Debug"),
    about = ytcenter.settings.createCategory("About");

// Creating Subcategories
var general_subcat1 = ytcenter.settings.createSubCategory("General"),
    general_subcat2 = ytcenter.settings.createSubCategory("Experiments"),
    player_watch = ytcenter.settings.createSubCategory("Watch"),
    player_channel = ytcenter.settings.createSubCategory("Channel"),
    player_embed = ytcenter.settings.createSubCategory("Embed"),
    ui_videothumbnail = ytcenter.settings.createSubCategory("Video Thumbnail"),
    ui_comments = ytcenter.settings.createSubCategory("Comments"),
    ui_subscriptions = ytcenter.settings.createSubCategory("Subscriptions"),
    update_general = ytcenter.settings.createSubCategory("General"),
    update_channel = ytcenter.settings.createSubCategory("Channel"),
    debug_log = ytcenter.settings.createSubCategory("Log"),
    debug_options = ytcenter.settings.createSubCategory("Options"),
    about_about = ytcenter.settings.createSubCategory("About"),
    about_share = ytcenter.settings.createSubCategory("Share"),
    about_donate = ytcenter.settings.createSubCategory("Donate");

// Linking categories with subcategories
general.addSubCategory(general_subcat1);
general.addSubCategory(general_subcat2);

player.addSubCategory(player_watch);
player.addSubCategory(player_channel);
player.addSubCategory(player_embed);

ui.addSubCategory(ui_videothumbnail);
ui.addSubCategory(ui_comments);
ui.addSubCategory(ui_subscriptions);

update.addSubCategory(update_general);
update.addSubCategory(update_channel);

debug.addSubCategory(debug_log);
debug.addSubCategory(debug_options);

about.addSubCategory(about_about);
about.addSubCategory(about_share);
about.addSubCategory(about_donate);

// Creating options
// ytcenter.settings.createOption ( defaultSetting, module, label, args, help )

var option_test = ytcenter.settings.createOption("TEST_SETTING", "bool", "Testing this", null, "http://www.google.com/");
var option_test2 = ytcenter.settings.createOption("This is a direct link to...", "textfield", "This is a textfield!!", null, "http://www.youtube.com/");
var option_test3 = ytcenter.settings.createOption(null, "line");
var option_test4 = ytcenter.settings.createOption("42", "list", "A simple label", {
  list: [
    {
      value: "not-1",
      label: "Item #1"
    }, {
      value: "POKEMON",
      label: "DOPE"
    }, {
      value: "42",
      label: function(){ return 6*7; }
    }
  ]
});
var option_test5 = ytcenter.settings.createOption(33, "list", "A simple label v2", {
  list: function(){
    var b = [], i;
    for (i = 0; i < 42; i++) {
      b.push({label: i*Math.sqrt(2), value: i});
    }
    return b;
  }
});

var option_test6 = ytcenter.settings.createOption("#e3e3e3", "colorpicker", "ColorPicker!!");


// Linking options to subcategories
general_subcat1.addOption(option_test);
general_subcat1.addOption(option_test2);
general_subcat1.addOption(option_test3);
general_subcat1.addOption(option_test4);
general_subcat1.addOption(option_test5);
general_subcat1.addOption(option_test6);

/*// Creating settings element
var dialog = ytcenter.settings.createDialog();

// Displaying the settings
dialog.setVisibility(true);*/