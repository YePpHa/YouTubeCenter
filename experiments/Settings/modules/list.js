ytcenter.modules.list = function(option){
  function update(value) {
    var i;
    for (i = 0; i < s.options.length; i++) {
      if (s.options[i].value === value) {
        s.selectedIndex = i;
        break;
      }
    }
  }
  function bind(callback) {
    cCallback = callback;
  }
  var frag = document.createDocumentFragment(),
      elm = document.createElement("span"),
      sc = document.createElement("span"),
      defaultLabel, s = document.createElement("select"),
      list = [], defaultLabelText,
      sc1 = document.createElement("img"),
      sc2 = document.createElement("span"),
      cCallback;
  elm.className = "yt-uix-form-input-select";
  sc.className = "yt-uix-form-input-select-content";
  
  s.className = "yt-uix-form-input-select-element";
  s.style.cursor = "pointer";
  if (typeof option.args.list === "function") {
    list = option.args.list();
  } else {
    list = option.args.list;
  }
  if (option && option.args && option.args.listeners) {
    for (var i = 0; i < option.args.listeners.length; i++) {
      elm.addEventListener(option.args.listeners[i].event, option.args.listeners[i].callback, (option.args.listeners[i].bubble ? option.args.listeners[i].bubble : false));
    }
  }
  if (list && list.length > 0) {
    defaultLabelText = ytcenter.language.getLocale(list[0].label);
    for (var i = 0; i < list.length; i++) {
      var item = document.createElement("option");
      item.value = list[i].value;
      
      if (typeof list[i].label === "function") {
        item.textContent = list[i].label();
      } else if (typeof list[i].label !== "undefined") {
        item.textContent = ytcenter.language.getLocale(list[i].label);
        ytcenter.language.addLocaleElement(item, list[i].label, "@textContent");
      }
      if (list[i].value === ytcenter.settings[option.defaultSetting]) {
        item.selected = true;
        defaultLabelText = item.textContent;
      }
      s.appendChild(item);
    }
    sc1.src = "//s.ytimg.com/yt/img/pixel-vfl3z5WfW.gif";
    sc1.className = "yt-uix-form-input-select-arrow";
    sc.appendChild(sc1);
    sc2.className = "yt-uix-form-input-select-value";
    sc2.textContent = defaultLabelText;
    sc.appendChild(sc2);
    ytcenter.events.addEvent("ui-refresh", function(){
      sc2.textContent = s.options[s.selectedIndex].textContent;
    });
    ytcenter.events.addEvent("language-refresh", function(){
      sc2.textContent = s.options[s.selectedIndex].textContent;
    });
    ytcenter.utils.addEventListener(s, "change", function(){
      if (cCallback) cCallback(s.value);
    }, false);
  }
  elm.appendChild(sc);
  elm.appendChild(s);
  
  frag.appendChild(elm);
  
  return {
    element: frag,
    bind: bind,
    update: update
  };
};