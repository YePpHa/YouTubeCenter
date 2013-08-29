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