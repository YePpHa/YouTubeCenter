ytcenter.modules.defaultplayersizedropdown = function(option){
  function getItemTitle(item) {
    try {
      var dim = ytcenter.utils.calculateDimensions(item.config.width, item.config.height);
      if (typeof item.config.customName !== "undefined" && item.config.customName !== "") {
        return item.config.customName;
      } else if (isNaN(parseInt(item.config.width)) && isNaN(parseInt(item.config.height))) {
        return (item.config.large ? ytcenter.language.getLocale("SETTINGS_RESIZE_LARGE") : ytcenter.language.getLocale("SETTINGS_RESIZE_SMALL"));
        //subtext.textContent = (item.config.align ? ytcenter.language.getLocale("SETTINGS_RESIZE_ALIGN") : ytcenter.language.getLocale("SETTINGS_RESIZE_CENTER"));
      } else {
        return dim[0] + "×" + dim[1];
        //subtext.textContent = (item.config.large ? ytcenter.language.getLocale("SETTINGS_RESIZE_LARGE") : ytcenter.language.getLocale("SETTINGS_RESIZE_SMALL")) + " - " + (item.config.align ? ytcenter.language.getLocale("SETTINGS_RESIZE_ALIGN") : ytcenter.language.getLocale("SETTINGS_RESIZE_CENTER"));
      }
    } catch (e) {
      con.error(e);
    }
  }
  function getItemSubText(item) {
    try{
    if (isNaN(parseInt(item.config.width)) && isNaN(parseInt(item.config.height))) {
      return (item.config.align ? ytcenter.language.getLocale("SETTINGS_RESIZE_ALIGN") : ytcenter.language.getLocale("SETTINGS_RESIZE_CENTER")) + (item.config.scrollToPlayer ? " - " + ytcenter.language.getLocale("SETTINGS_RESIZE_SCROLLTOPLAYER") : "");
    } else {
      return (item.config.large ? ytcenter.language.getLocale("SETTINGS_RESIZE_LARGE") : ytcenter.language.getLocale("SETTINGS_RESIZE_SMALL")) + " - " + (item.config.align ? ytcenter.language.getLocale("SETTINGS_RESIZE_ALIGN") : ytcenter.language.getLocale("SETTINGS_RESIZE_CENTER")) + (item.config.scrollToPlayer ? " - " + ytcenter.language.getLocale("SETTINGS_RESIZE_SCROLLTOPLAYER") : "");
    }
    }catch(e){con.error(e)}
  }
  function setValue(id) {
    selectedId = id;
    if (selectedId === "default") {
      btnLabel.textContent = ytcenter.language.getLocale("SETTINGS_RESIZE_DEFAULTPLAYERSIZE_DEFAULT");
    } else {
      var item;
      ytcenter.utils.each(items, function(i, val){
        if (val.id !== selectedId) return;
        item = val;
        return false;
      });
      btnLabel.textContent = getItemTitle(item);
    }
  }
  function defaultItem(db) {
    if (typeof selectedId === "undefined") setValue("default");
    
    if ("default" === selectedId) {
      setValue("default");
    }
    var li = document.createElement("li");
    li.setAttribute("role", "menuitem");
    var span = document.createElement("span");
    db.push(span);
    
    span.className = "yt-uix-button-menu-item" + ("default" === selectedId ? " ytcenter-resize-dropdown-selected" : "");
    var title = document.createElement("span");
    title.textContent = ytcenter.language.getLocale("SETTINGS_RESIZE_DEFAULTPLAYERSIZE_DEFAULT");
    ytcenter.language.addLocaleElement(title, "SETTINGS_RESIZE_DEFAULTPLAYERSIZE_DEFAULT", "@textContent");
    title.style.display = "block";
    
    ytcenter.utils.addEventListener(li, "click", function(){
      if ("default" === selectedId) return;
      setValue("default");
      ytcenter.utils.each(db, function(_i, elm){
        ytcenter.utils.removeClass(elm, "ytcenter-resize-dropdown-selected");
      });
      ytcenter.utils.addClass(span, "ytcenter-resize-dropdown-selected");
      
      if (saveCallback) saveCallback("default");
      
      try {
        document.body.click();
      } catch (e) {
        con.error(e);
      }
    });
    
    span.appendChild(title);
    li.appendChild(span);
    
    menu.appendChild(li);
  }
  function updateItems(_items) {
    items = _items;
    menu.innerHTML = ""; // Clearing it
    var db = [];
    
    defaultItem(db);
    ytcenter.utils.each(items, function(i, item){
      if (typeof selectedId === "undefined") setValue(item.id);
      
      if (item.id === selectedId) {
        setValue(item.id);
      }
      var li = document.createElement("li");
      li.setAttribute("role", "menuitem");
      var span = document.createElement("span");
      db.push(span);
      
      span.className = "yt-uix-button-menu-item" + (item.id === selectedId ? " ytcenter-resize-dropdown-selected" : "");
      span.style.paddingBottom = "12px";
      var title = document.createElement("span");
      title.textContent = getItemTitle(item);
      title.style.display = "block";
      title.style.fontWeight = "bold";
      var subtext = document.createElement("span");
      subtext.textContent = getItemSubText(item);
      subtext.style.display = "block";
      subtext.style.fontSize = "11px";
      subtext.style.lineHeight = "0px";
      
      ytcenter.utils.addEventListener(li, "click", function(){
        if (item.id === selectedId) return;
        setValue(item.id);
        ytcenter.utils.each(db, function(_i, elm){
          ytcenter.utils.removeClass(elm, "ytcenter-resize-dropdown-selected");
        });
        ytcenter.utils.addClass(span, "ytcenter-resize-dropdown-selected");
        
        if (saveCallback) saveCallback(item.id);
        
        try {
          document.body.click();
        } catch (e) {
          con.error(e);
        }
      });
      
      span.appendChild(title);
      span.appendChild(subtext);
      li.appendChild(span);
      
      menu.appendChild(li);
    });
  }
  var saveCallback, selectedId, items,
      wrapper = document.createElement("div"),
      btnLabel = ytcenter.gui.createYouTubeButtonText("Player Sizes..."),
      menu = document.createElement("ul"),
      arrow = ytcenter.gui.createYouTubeButtonArrow(),
      btn = ytcenter.gui.createYouTubeDefaultButton("", [btnLabel, arrow, menu]);
  wrapper.style.display = "inline-block";
  btnLabel.style.display = "inline-block";
  btnLabel.style.width = "100%";
  
  menu.className = "yt-uix-button-menu yt-uix-button-menu-default yt-uix-button-menu-external hid";
  menu.setAttribute("role", "menu");
  arrow.style.marginLeft = "-10px";
  
  btn.style.width = "175px";
  btn.style.textAlign = "left";
  
  wrapper.appendChild(btn);
  
  updateItems(ytcenter.settings[option.args.bind]);
  ytcenter.events.addEvent("ui-refresh", function(){
    var opt = ytcenter.settings[option.args.bind],
        found = false, i;
    for (i = 0; i < opt.length; i++) {
      if (opt[i].id === selectedId) found = true;
    }
    if (!found && selectedId !== "default") {
      selectedId = opt[0].id;
      if (saveCallback) saveCallback(selectedId);
    }
    updateItems(opt);
  });
  
  return {
    element: wrapper, // So the element can be appended to an element.
    bind: function(callback){
      saveCallback = callback;
    },
    update: function(v){
      selectedId = v;
      updateItems(items);
    }
  };
};