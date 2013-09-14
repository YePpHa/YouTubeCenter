ytcenter.modules.multilist = function(option){
  function fixList(_settingData) {
    if (_settingData === "") return "";
    var a = _settingData.split("&"), b = [], c = [], d, i;
    for (i = 0; i < list.length; i++) {
      c.push(list[i].value);
    }
    for (i = 0; i < a.length; i++) {
      if (a[i] !== "") {
        d = decodeURIComponent(a[i]);
        if ($ArrayIndexOf(c, d) !== -1 && $ArrayIndexOf(b, d) === -1) {
          b.push(a[i]);
        }
      }
    }
    return b.join("&");
  }
  function saveItem(value) {
    if (settingData === "") return encodeURIComponent(value);
    var a = settingData.split("&"), i;
    for (i = 0; i < a.length; i++) {
      if (decodeURIComponent(a[i]) === value) return;
    }
    a.push(encodeURIComponent(value));
    return a.join("&");
  }
  function removeItem(value) {
    if (settingData === "") return encodeURIComponent(value);
    var a = settingData.split("&"), b = [], i;
    for (i = 0; i < a.length; i++) {
      if (decodeURIComponent(a[i]) !== value) {
        b.push(a[i]);
      }
    }
    return b.join("&");
  }
  function isEnabled(value) {
    if (settingData === "") return false;
    var a = settingData.split("&"), i;
    for (i = 0; i < a.length; i++) {
      if (decodeURIComponent(a[i]) === value) return true;
    }
    return false;
  }
  function createItem(label, value) {
    var s = document.createElement("label"),
        cb = ytcenter.modules.checkbox(isEnabled(value)),
        text = document.createTextNode(ytcenter.language.getLocale(label));
    ytcenter.language.addLocaleElement(text, label, "@textContent");
    cb.bind(function(checked){
      if (checked) {
        settingData = saveItem(value);
      } else {
        settingData = removeItem(value);
      }
      if (typeof saveCallback === "function") saveCallback(settingData);
    });
    cb.element.style.marginRight = "6px";
    s.appendChild(cb.element);
    s.appendChild(text);
    
    return s;
  }
  function updateList() {
    var d, item;
    settingData = fixList(settingData);
    
    wrapper.innerHTML = "";
    
    for (var i = 0; i < list.length; i++) {
      d = document.createElement("div");
      item = createItem(list[i].label, list[i].value);
      d.appendChild(item);
      wrapper.appendChild(d);
    }
  }
  var list = (option && option.args && option.args.list) || [],
      settingData, wrapper = document.createElement("div"), saveCallback;
  wrapper.style.paddingLeft = "16px";
  settingData = ytcenter.settings[option.defaultSetting];
  console.log(settingData);
  
  updateList();
  
  return {
    element: wrapper,
    update: function(data){
      settingData = data;
      updateList();
    },
    bind: function(a){
      saveCallback = a;
    }
  };
};