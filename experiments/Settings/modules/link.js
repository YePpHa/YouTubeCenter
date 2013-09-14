ytcenter.modules.link = function(option){
  var elm = document.createElement("div"),
      title = document.createElement("b");
  if (option && option.args && option.args.titleLocale) {
    var __t1 = document.createTextNode(ytcenter.language.getLocale(option.args.titleLocale)),
        __t2 = document.createTextNode(":");
    ytcenter.language.addLocaleElement(__t1, option.args.titleLocale, "@textContent", option.args.replace || {});
    title.appendChild(__t1);
    title.appendChild(__t2);
  } else if (option && option.args && option.args.title) {
    title.textContent = option.args.title + ":";
  }
  var content = document.createElement("div");
  content.style.marginLeft = "20px";
  
  for (var i = 0; i < option.args.links.length; i++) {
    if (i > 0) content.appendChild(document.createElement("br"));
    var __a = document.createElement("a");
    __a.href = option.args.links[i].url;
    __a.textContent = option.args.links[i].text;
    __a.setAttribute("target", "_blank");
    content.appendChild(__a);
  }
  elm.appendChild(title);
  elm.appendChild(content);
  
  return {
    element: elm,
    bind: function(){},
    update: function(){}
  };
};