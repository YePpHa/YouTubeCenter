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