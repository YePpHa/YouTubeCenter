ytcenter.modules.translators = function(option){
  option = typeof option !== "undefined" ? option : false;
  var elm = document.createElement("div");
  
  var translators = document.createElement("div");
  ytcenter.utils.each(option.args.translators, function(key, value){
    if (value.length > 0) {
      var entry = document.createElement("div");
      entry.appendChild(document.createTextNode(ytcenter.language.getLocale("LANGUAGE", key) + " (" + ytcenter.language.getLocale("LANGUAGE_ENGLISH", key) + ") - "));
      for (var i = 0; i < value.length; i++) {
        if (i > 0) entry.appendChild(document.createTextNode(" & "));
        var el;
        if (value[i].url) {
          el = document.createElement("a");
          el.href = value[i].url;
          el.textContent = value[i].name;
          el.setAttribute("target", "_blank");
        } else {
          el = document.createTextNode(value[i].name);
        }
        entry.appendChild(el);
      }
      translators.appendChild(entry);
    }
  });
  elm.appendChild(translators);
  
  return {
    element: elm,
    bind: function(){},
    update: function(){}
  };
};