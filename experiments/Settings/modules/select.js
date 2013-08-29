ytcenter.modules.select = function(option){
  function updateList() {
    select.innerHTML = "";
    ytcenter.utils.each(list, function(i, item){
      var o = document.createElement("option");
      o.setAttribute("value", i);
      if (typeof item.label !== "undefined") {
        o.textContent = ytcenter.language.getLocale(item.label);
        ytcenter.language.addLocaleElement(o, item.label, "@textContent");
      } else if (typeof item.text !== "undefined") {
        o.textContent = item.text;
      } else {
        o.textContent = "undefined";
      }
      if (selectedValue === item.value) {
        o.setAttribute("selected", "selected");
        selectedText.textContent = o.textContent;
      }
      
      select.appendChild(o);
    });
  }
  var list = (option && option.args && option.args.list) || [],
      selectedValue, saveCallback,
      wrapper = document.createElement("span"),
      selectedContentWrapper = document.createElement("span"),
      selectedArrow = document.createElement("img"),
      selectedText = document.createElement("span"),
      select = document.createElement("select");
  wrapper.className = "ytcenter-embed yt-uix-form-input-select";
  wrapper.style.marginBottom = "2px";
  wrapper.style.height = "27px";
  
  selectedContentWrapper.className = "yt-uix-form-input-select-content";
  selectedArrow.setAttribute("src", "//s.ytimg.com/yt/img/pixel-vfl3z5WfW.gif");
  selectedArrow.className = "yt-uix-form-input-select-arrow";
  selectedText.className = "yt-uix-form-input-select-value";
  
  selectedContentWrapper.appendChild(selectedArrow);
  selectedContentWrapper.appendChild(selectedText);
  
  select.className = "yt-uix-form-input-select-element";
  select.style.cursor = "pointer";
  select.style.height = "27px";
  
  updateList();
  ytcenter.utils.addEventListener(select, "change", function(e){
    selectedText.textContent = select.options[select.selectedIndex].textContent;
    if (saveCallback) saveCallback(list[select.selectedIndex].value);
  });
  
  wrapper.appendChild(selectedContentWrapper);
  wrapper.appendChild(select);
  
  return {
    element: wrapper,
    bind: function(callback){
      saveCallback = callback;
    },
    setSelected: function(value){
      selectedValue = value;
      for (var i = 0; i < list.length; i++) {
        if (list[i].value === value) {
          select.selectedIndex = i;
          break;
        }
      }
      selectedText.textContent = select.options[select.selectedIndex].textContent;
    },
    update: function(value){
      selectedValue = value;
      for (var i = 0; i < list.length; i++) {
        if (list[i].value === value) {
          select.selectedIndex = i;
          break;
        }
      }
      selectedText.textContent = select.options[select.selectedIndex].textContent;
    },
    updateList: function(_list){
      list = _list;
      updateList();
    },
    getValue: function(){
      return list[select.selectedIndex].value;
    }
  };
};