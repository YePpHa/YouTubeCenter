ytcenter.modules.aboutText = function(option){
  var elm = document.createElement("div");
  
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
  
  elm.appendChild(content1);
  elm.appendChild(document.createElement("br"));
  elm.appendChild(content2);
  elm.appendChild(contact);
  
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
    ytcenter.utils.addEventListener(checkboxInput, "change", function(){
      callback(checkboxInput.checked);
    }, false);
  }
  var frag = document.createDocumentFragment(),
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
  if (option && option.args && option.args.listeners) {
    for (var i = 0; i < option.args.listeners.length; i++) {
      checkboxInput.addEventListener(option.args.listeners[i].event, option.args.listeners[i].callback, (option.args.listeners[i].bubble ? option.args.listeners[i].bubble : false));
    }
  }
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
  var saveCallback, selectedId, items,
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
  
  updateItems(ytcenter.settings[option.args.bind]);
  ytcenter.events.addEvent("ui-refresh", function(){
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
    var bb = new ytcenter.io.BlobBuilder();
    bb.append(VALIDATOR_STRING + settingsPool.value);
    ytcenter.io.saveAs(bb.getBlob("text/plain"), "ytcenter-settings.ytcs");
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
  if (option && option.args && option.args.listeners) {
    for (var i = 0; i < option.args.listeners.length; i++) {
      elm.addEventListener(option.args.listeners[i].event, option.args.listeners[i].callback, (option.args.listeners[i].bubble ? option.args.listeners[i].bubble : false));
    }
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
    ytcenter.events.addEvent("ui-refresh", function(){
      sc2.textContent = s.options[s.selectedIndex].textContent;
    });
    ytcenter.events.addEvent("language-refresh", function(){
      sc2.textContent = s.options[s.selectedIndex].textContent;
    });
    ytcenter.utils.addEventListener(s, "change", function(){
      if (cCallback) cCallback(s.value);
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
  var list = (option && option.args && option.args.list) || [],
      settingData, wrapper = document.createElement("div"), saveCallback;
  wrapper.style.paddingLeft = "16px";
  settingData = ytcenter.settings[option.defaultSetting];
  console.log(settingData);
  
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
ytcenter.modules.rangetext = function(option){
  function update() {
    _text.value = Math.round(range.getValue());
  }
  var range = ytcenter.modules.range(option),
      wrapper = document.createElement("div"),
      bCallback;
  wrapper.style.display = "inline-block";
  wrapper.appendChild(range.element);
  var _text = document.createElement("input");
  _text.setAttribute("type", "text");
  _text.value = Math.round(range.getValue());
  _text.style.width = "45px";
  _text.style.marginLeft = "4px";
  wrapper.appendChild(_text);
  
  range.bind(function(value){
    update();
    if (bCallback) bCallback(value);
  });
  
  _text.addEventListener("input", function(){
    if (this.value === "") this.value = "0";
    this.value = parseInt(this.value);
    if (isNaN(this.value) || this.value === Infinity) this.value = "0";
    range.update(parseInt(this.value));
  }, false);
  
  _text.addEventListener("change", function(){
    if (this.value === '') this.value = "0";
    else this.value = parseInt(this.value);
    
    range.update(parseInt(this.value));
    this.value = range.getValue();
    if (bCallback) bCallback(range.getValue());
  }, false);
  
  return {
    element: wrapper,
    bind: function(callback){
      bCallback = callback;
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
  ytcenter.events.addEvent("ui-refresh", function(){
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
    if (typeof saveCallback !== "undefined") saveCallback(getSaveArray());
    ytcenter.events.performEvent("ui-refresh");
  });
  
  listWrapper.appendChild(listOl);
  contentWrapper.appendChild(listWrapper);
  contentWrapper.appendChild(positionerEditWrapper);
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
    }
  };
};
ytcenter.modules.textContent = function(option){
  var elm = document.createElement("div");
  if (option && option.args && option.args.style) {
    for (var key in option.args.style) {
      if (option.args.style.hasOwnProperty(key)) {
        elm.style[key] = option.args.style[key];
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
    
    ytcenter.language.addLocaleElement(elm, option.args.textlocale, "@textContent", option.args.replace || {});
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