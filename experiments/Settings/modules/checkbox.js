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