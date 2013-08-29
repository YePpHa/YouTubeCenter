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
      elm.textContent = ytcenter.utils.replaceTextAsString(option.args.text, option.args.replace);
    } else {
      elm.textContent = option.args.text;
    }
  }
  if (option && option.args && option.args.textlocale) {
    if (option && option.args && option.args.replace) {
      elm.textContent = ytcenter.utils.replaceTextAsString(ytcenter.language.getLocale(option.args.textlocale), option.args.replace);
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