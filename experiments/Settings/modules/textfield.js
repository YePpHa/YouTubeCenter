ytcenter.modules.textfield = function(option){
  function update(text) {
    input.value = text;
  }
  function bind(callback) {
    ytcenter.utils.addEventListener(input, "change", function(){
      callback(input.value);
    }, false);
  }
  var frag = document.createDocumentFragment(),
      input = document.createElement("input");
  input.setAttribute("type", "text");
  input.className = "yt-uix-form-input-text";
  input.value = option && ytcenter.settings[option.defaultSetting];
  if (option && option.style) {
    for (var key in option.style) {
      if (option.style.hasOwnProperty(key)) {
        elm.style[key] = option.style[key];
      }
    }
  }
  frag.appendChild(input);
  return {
    element: frag,
    bind: bind,
    update: update
  };
};