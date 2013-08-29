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