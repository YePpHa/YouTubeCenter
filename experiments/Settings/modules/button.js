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