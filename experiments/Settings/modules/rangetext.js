ytcenter.modules.rangetext = function(option){
  function update() {
    _text.value = Math.round(range.getValue());
  }
  var range = ytcenter.modules.range(option),
      wrapper = document.createElement("div"),
      bCallback;
  wrapper.style.display = "inline-block";
  wrapper.appendChild(range.element);
  var _text = document.createElement("input");
  _text.setAttribute("type", "text");
  _text.value = Math.round(range.getValue());
  _text.style.width = "45px";
  _text.style.marginLeft = "4px";
  wrapper.appendChild(_text);
  
  range.bind(function(value){
    update();
    if (bCallback) bCallback(value);
  });
  
  _text.addEventListener("input", function(){
    if (this.value === "") this.value = "0";
    this.value = parseInt(this.value);
    if (isNaN(this.value) || this.value === Infinity) this.value = "0";
    range.update(parseInt(this.value));
  }, false);
  
  _text.addEventListener("change", function(){
    if (this.value === '') this.value = "0";
    else this.value = parseInt(this.value);
    
    range.update(parseInt(this.value));
    this.value = range.getValue();
    if (bCallback) bCallback(range.getValue());
  }, false);
  
  return {
    element: wrapper,
    bind: function(callback){
      bCallback = callback;
    },
    update: function(value){
      range.update(value);
      update();
    },
    getValue: function(){
      return range.getValue();
    }
  };
};