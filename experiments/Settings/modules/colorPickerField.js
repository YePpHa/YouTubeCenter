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