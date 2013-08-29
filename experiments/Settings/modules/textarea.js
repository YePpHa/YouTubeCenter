ytcenter.modules.textarea = function(option){
  var elm = document.createElement('textarea');
  elm.className = "yt-uix-form-textarea";
  if (option && option.args && option.args.className) {
    elm.className += " " + option.args.className;
  }
  if (option && option.args && option.args.style) {
    for (var key in option.args.style) {
      if (option.args.style.hasOwnProperty(key)) {
        elm.style[key] = option.args.style[key];
      }
    }
  }
  if (option && option.args && option.args.text) {
    elm.textContent = option.args.text;
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