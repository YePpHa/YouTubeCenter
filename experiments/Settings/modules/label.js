ytcenter.modules.label = function(option){
  var frag = document.createDocumentFragment(),
      text = document.createTextNode(ytcenter.language.getLocale(option.label));
  frag.appendChild(text);
  ytcenter.language.addLocaleElement(text, option.label, "@textContent");
  
  return {
    element: frag, // So the element can be appended to an element.
    bind: function(){},
    update: function(){}
  };
};