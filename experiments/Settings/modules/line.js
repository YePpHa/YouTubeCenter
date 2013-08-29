ytcenter.modules.line = function(){
  var frag = document.createDocumentFragment(),
      hr = document.createElement("hr");
  hr.className = "yt-horizontal-rule";
  frag.appendChild(hr);
  return {
    element: frag,
    bind: function(){},
    update: function(){}
  };
};