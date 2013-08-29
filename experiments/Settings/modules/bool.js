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