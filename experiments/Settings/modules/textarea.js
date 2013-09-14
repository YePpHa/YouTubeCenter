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