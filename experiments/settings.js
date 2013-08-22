/*** module: settings.js
 * This will replace the old settings when it's finished.
 * The settings will be put into a dialog as the experimental dialog is at the moment.
 * ********************************************************************************************
 * The settings will include categories and from the categories to subcategories, where the subcateogories will contain the options.
 * It will be possible for YouTube Center to hide or disable specific categories/subcategories/options if needed.
 * ********************************************************************************************
 * The categories will be placed to the left side as the guide is on YouTube. The categories will use the same red design as the guide.
 * The subcategories will be the same as the categories in the old settings.
 * The options will be much more customizeable, where you will be able to add modules (This part is still not been planned 100% yet).
 ***/

/* Settings up fake YouTube Center enviorment */
var ytcenter = {};
ytcenter.utils = {};
ytcenter.utils.inArrayIndex = function(a, v){
  for (var i = 0; i < a.length; i++) {
    if (a[i] === v) return i;
  }
  return -1;
};
ytcenter.utils.inArray = function(a, v){
  for (var i = 0; i < a.length; i++) {
    if (a[i] === v) return true;
  }
  return false;
};
ytcenter.utils.cleanClasses = function(elm){
  if (typeof elm === "undefined") return;
  var classNames = elm.className.split(" "),
      i, _new = [];
  for (i = 0; i < classNames.length; i++) {
    if (classNames[i] !== "" && !ytcenter.utils.inArray(_new, classNames[i])) {
      _new.push(classNames[i]);
    }
  }
  elm.className = _new.join(" ");
};
ytcenter.utils.hasClass = function(elm, className){
  if (typeof elm === "undefined") return;
  var classNames = elm.className.split(" "),
      i;
  for (i = 0; i < classNames.length; i++) {
    if (classNames[i] === className) return true;
  }
  return false;
};
ytcenter.utils.toggleClass = function(elm, className){
  if (typeof elm === "undefined") return;
  if (ytcenter.utils.hasClass(elm, className)) {
    ytcenter.utils.removeClass(elm, className);
  } else {
    ytcenter.utils.addClass(elm, className);
  }
};
ytcenter.utils.addClass = function(elm, className){
  if (typeof elm === "undefined") return;
  var classNames = elm.className.split(" "),
      addClassNames = className.split(" "),
      _new = [],
      i, j, found;
  for (i = 0; i < addClassNames.length; i++) {
    found = false;
    for (j = 0; j < classNames.length; j++) {
      if (addClassNames[i] === classNames[j]) {
        found = true;
        break;
      }
    }
    if (!found) {
      _new.push(addClassNames[i]);
    }
  }
  elm.className += " " + _new.join(" ");
  ytcenter.utils.cleanClasses(elm);
};
ytcenter.utils.removeClass = function(elm, className){
  if (typeof elm === "undefined") return;
  var classNames = elm.className.split(" "),
      remClassNames = className.split(" "),
      _new = [],
      i, j, found;
  for (var i = 0; i < classNames.length; i++) {
    if (classNames[i] === "") continue;
    found = false;
    for (j = 0; j < remClassNames.length; j++) {
      if (classNames[i] === remClassNames[j]) {
        found = true;
        break;
      }
    }
    if (!found) {
      _new.push(classNames[i]);
    }
  }
  elm.className = _new.join(" ");
};
ytcenter.utils.addEventListener = (function(){
  var listeners = [];
  ytcenter.utils.removeEventListener = function(elm, event, callback, useCapture){
    var i;
    if (elm.removeEventListener) {
      elm.removeEventListener(event, callback, useCapture || false);
    }
    for (i = 0; i < listeners.length; i++) {
      if (listeners[i].elm === elm && listeners[i].event === event && listeners[i].callback === callback && listeners[i].useCapture === useCapture) {
        listeners.splice(i, 1);
        break;
      }
    }
  };
  return function(elm, event, callback, useCapture){
    listeners.push({elm: elm, event: event, callback: callback, useCapture: useCapture});
    if (elm.addEventListener) {
      elm.addEventListener(event, callback, useCapture || false);
    } else if (elm.attachEvent) {
      elm.attachEvent("on" + event, callback);
    }
  };
})();

ytcenter.language = {};
ytcenter.language.getLocale = function(lang){return lang;};
ytcenter.language.addLocaleElement = function(){}; // Just a tmp

ytcenter.dialog = function(titleLabel, content, actions, alignment){
  var __r = {}, ___parent_dialog = null, bgOverlay, root, base, fg, fgContent, footer, eventListeners = {}, actionButtons = {};
  alignment = alignment || "center";
  
  bgOverlay = ytcenter.dialogOverlay();
  root = document.createElement("div");
  root.className = "yt-dialog";
  base = document.createElement("div");
  base.className = "yt-dialog-base";
  
  fg = document.createElement("div");
  fg.className = "yt-dialog-fg";
  fgContent = document.createElement("div");
  fgContent.className = "yt-dialog-fg-content yt-dialog-show-content";
  fg.appendChild(fgContent);
  
  
  if (alignment === "center") {
    var align = document.createElement("span");
    align.className = "yt-dialog-align";
    base.appendChild(align);
  } else {
    fg.style.margin = "13px 0";
  }
  
  base.appendChild(fg);
  root.appendChild(base);
  
  if (typeof titleLabel === "string" && titleLabel !== "") {
    var header = document.createElement("div");
    header.className = "yt-dialog-header";
    var title = document.createElement("h2");
    title.className = "yt-dialog-title";
    title.textContent = ytcenter.language.getLocale(titleLabel);
    
    header.appendChild(title);
    fgContent.appendChild(header);
  } else {
    var header = document.createElement("div");
    header.style.margin = "0 -20px 20px";
    fgContent.appendChild(header);
  }
  if (typeof content !== "undefined") {
    var cnt = document.createElement("div");
    cnt.className = "yt-dialog-content";
    cnt.appendChild(content);
    fgContent.appendChild(cnt);
  }
  footer = document.createElement("div");
  footer.className = "yt-dialog-footer";
  fgContent.appendChild(footer);
  if (typeof actions !== "undefined") {
    /* Array
     *   Object
     *     label: "",
     *     primary: false, # Should be the primary button.
     *     callback: Function
     */
    for (var i = 0; i < actions.length; i++) {
      var btn = document.createElement("button");
      btn.setAttribute("type", "button");
      btn.setAttribute("role", "button");
      btn.setAttribute("onclick", ";return false;");
      btn.className = "yt-uix-button " + (actions[i].primary ? "yt-uix-button-primary" : "yt-uix-button-default");
      if (typeof actions[i].callback === "function") {
        btn.addEventListener("click", actions[i].callback, false);
      }
      var btnContent = document.createElement("span");
      btnContent.className = "yt-uix-button-content";
      btnContent.textContent = ytcenter.language.getLocale(actions[i].label);
      
      btn.appendChild(btnContent);
      footer.appendChild(btn);
      
      if (actions[i].name) actionButtons[actions[i].name] = btn;
    }
  } else { // Default
    var closeBtn = document.createElement("button");
    closeBtn.setAttribute("type", "button");
    closeBtn.setAttribute("role", "button");
    closeBtn.setAttribute("onclick", ";return false;");
    closeBtn.className = "yt-uix-button yt-uix-button-default";
    
    closeBtn.addEventListener("click", function(){
      __r.setVisibility(false);
    }, false);
    
    var closeContent = document.createElement("span");
    closeContent.className = "yt-uix-button-content";
    closeContent.textContent = ytcenter.language.getLocale("DIALOG_CLOSE");
    
    closeBtn.appendChild(closeContent);
    footer.appendChild(closeBtn);
    actionButtons['close'] = btn;
  }
  __r.getActionButton = function(name){
    return actionButtons[name];
  };
  __r.addEventListener = function(eventName, func){
    if (!eventListeners.hasOwnProperty(eventName)) eventListeners[eventName] = [];
    eventListeners[eventName].push(func);
    return eventListeners[eventName].length - 1;
  };
  __r.removeEventListener = function(eventName, index){
    if (!eventListeners.hasOwnProperty(eventName)) return;
    if (index < 0 && index >= eventListeners[eventName].length) return;
    eventListeners[eventName].splice(index, 1);
  };
  __r.setWidth = function(width){
    fg.style.width = width;
  };
  __r.getBase = function(){
    return base;
  };
  __r.getFooter = function(){
    return footer;
  };
  __r.getHeader = function(){
    return header;
  };
  __r.setPureVisibility = function(visible){
    if (visible) {
      if (!root.parentNode) document.body.appendChild(root);
      else {
        root.parentNode.removeChild(root);
        document.body.appendChild(root);
      }
      if (!bgOverlay.parentNode) document.body.appendChild(bgOverlay);
      else {
        bgOverlay.parentNode.removeChild(bgOverlay);
        document.body.appendChild(bgOverlay);
      }
      if (document.getElementById("player-api-legacy") || document.getElementById("player-api")) (document.getElementById("player-api-legacy") || document.getElementById("player-api")).style.visibility = "hidden";
    } else {
      if (root.parentNode) root.parentNode.removeChild(root);
      if (bgOverlay.parentNode) bgOverlay.parentNode.removeChild(bgOverlay);
      if ((document.getElementById("player-api-legacy") || document.getElementById("player-api")) && !___parent_dialog) (document.getElementById("player-api-legacy") || document.getElementById("player-api")).style.visibility = "";
    }
  };
  __r.setFocus = function(focus){
    if (!base) {
      con.error("[Dialog.setFocus] base element was not found!");
      return;
    }
    if (focus) {
      base.style.zIndex = "";
    } else {
      base.style.zIndex = "1998";
    }
  };
  __r.setVisibility = function(visible){
    if (eventListeners["visibility"]) {
      for (var i = 0; i < eventListeners["visibility"].length; i++) {
        eventListeners["visibility"][i](visible);
      }
    }
    if (visible) {
      if (document.body) ytcenter.utils.addClass(document.body, "yt-dialog-active");
      ___parent_dialog = ytcenter._dialogVisible;
      if (___parent_dialog) {
        ___parent_dialog.setFocus(false);
      }
      __r.setPureVisibility(true);
      
      ytcenter._dialogVisible = __r;
    } else {
      __r.setPureVisibility(false);
      
      if (___parent_dialog) {
        ___parent_dialog.setFocus(true);
        ytcenter._dialogVisible = ___parent_dialog;
      } else {
        ytcenter._dialogVisible = null;
        if (document.body) ytcenter.utils.removeClass(document.body, "yt-dialog-active");
      }
    }
  };
  return __r;
};
ytcenter.dialogOverlay = function(){
  var bg = document.createElement("div");
  bg.id = "yt-dialog-bg";
  bg.className = "yt-dialog-bg";
  bg.style.height = "100%";
  bg.style.position = "absolute";
  return bg;
};



/**** Settings part ****/
ytcenter.settings = (function(){
  var a = {}, categories = [], subcategories = [], options = [];
  
  a.createCategory = function(label){
    var id = categories.length;
    categories.push({
      id: id,
      label: label,
      enabled: true,
      visible: true,
      subcategories: []
    });
    return a.getCategory(id);
  };
  a.createSubCategory = function(label){
    var id = subcategories.length;
    subcategories.push({
      id: id,
      label: label,
      enabled: true,
      visible: true,
      options: []
    });
    return a.getSubCategory(id);
  };
  a.createOption = function(){
    
  };
  a.getCategory = function(id){
    if (categories.length <= id || id < 0) throw new Error("[Settings Category] Category with specified id doesn't exist!");
    var cat = categories[id];
    return {
      getId: function(){
        return id;
      },
      setVisibility: function(visible){
        cat.visible = visible;
      },
      setEnabled: function(enabled){
        cat.enabled = enabled;
      },
      addSubCategory: function(subcategory){
        cat.subcategories.push(subcategories[subcategory.getId()]);
      },
      select: function(){
        if (cat.select) cat.select();
      }
    };
  };
  a.getSubCategory = function(id){
    if (subcategories.length <= id || id < 0) throw new Error("[Settings SubCategory] Category with specified id doesn't exist!");
    var subcat = subcategories[id];
    return {
      getId: function(){
        return id;
      },
      setVisibility: function(visible){
        subcat.visible = visible;
      },
      setEnabled: function(enabled){
        subcat.enabled = enabled;
      },
      addOption: function(option){
        subcat.options.push(option);
      },
      select: function(){
        if (cat.select) cat.select();
      }
    };
  };
  a.getOption = function(id){
    throw new Error("[Settings getOption] Not implemented!");
  };
  
  a.createLayout = function(){
    var frag = document.createDocumentFragment(),
        categoryList = document.createElement("ul"),
        subcatList = [],
        sSelectedList = [],
        leftPanel = document.createElement("div"), rightPanel = document.createElement("div"),
        subcatTop = document.createElement("div"), subcatContent = document.createElement("div"),
        categoryHide = false;
    subcatTop.className = "ytcenter-settings-subcat-header-wrapper";
    subcatContent.className = "ytcenter-settings-subcat-content-wrapper";
    leftPanel.className = "ytcenter-settings-panel-left";
    rightPanel.className = "ytcenter-settings-panel-right";
    
    categoryList.className = "ytcenter-settings-category-list";
    categories.forEach(function(category){
      var li = document.createElement("li"),
          acat = document.createElement("a"),
          valign = document.createElement("span"),
          text = document.createElement("span"),
          subcatLinkList = [],
          subcatContentList = [],
          topheader = document.createElement("div"),
          topheaderList = document.createElement("ul"),
          categoryContent = document.createElement("div"),
          hideContent = false;
      sSelectedList.push(acat);
      acat.href = ";return false;";
      acat.className = "ytcenter-settings-category-item yt-valign" + (categoryHide ? "" : " ytcenter-selected");
      
      ytcenter.utils.addEventListener(acat, "click", function(e){
        category.select();
        
        e.preventDefault();
        e.stopPropagation();
        return false;
      }, false);
      valign.className = "yt-valign-container";
      
      text.textContent = ytcenter.language.getLocale(category.label);
      ytcenter.language.addLocaleElement(text, category.label, "@textContent");
      
      valign.appendChild(text);
      acat.appendChild(valign);
      li.appendChild(acat);
      categoryList.appendChild(li);
      
      topheaderList.className = "ytcenter-settings-subcat-header clearfix";
      category.subcategories.forEach(function(subcat){
        var content = document.createElement("div"),
            liItem = document.createElement("li"),
            liItemLink = document.createElement("a"),
            itemTextContent = document.createElement("span");
        content.className = "ytcenter-settings-subcat-content" + (hideContent ? " hid" : "");
        liItem.className = "clearfix";
        liItemLink.className = "yt-uix-button ytcenter-settings-subcat-header-item" + (hideContent ? "" : " ytcenter-selected");
        itemTextContent.className = "ytcenter-settings-subcat-header-item-content";
        itemTextContent.textContent = ytcenter.language.getLocale(subcat.label);
        ytcenter.language.addLocaleElement(itemTextContent, subcat.label, "@textContent");
        
        content.textContent = category.id + "=>" + subcat.id;
        
        liItemLink.appendChild(itemTextContent);
        liItem.appendChild(liItemLink);
        topheaderList.appendChild(liItem);
        
        ytcenter.utils.addEventListener(liItemLink, "click", function(e){
          subcat.select();
          
          e.preventDefault();
          e.stopPropagation();
          return false;
        }, false);
        subcatLinkList.push(liItemLink);
        subcatContentList.push(content);
        subcat.select = function(){
          subcatLinkList.forEach(function(item){
            ytcenter.utils.removeClass(item, "ytcenter-selected");
          });
          subcatContentList.forEach(function(item){
            ytcenter.utils.addClass(item, "hid");
          });
          ytcenter.utils.removeClass(content, "hid");
          ytcenter.utils.addClass(liItemLink, "ytcenter-selected");
        };
        
        categoryContent.appendChild(content);
        hideContent = true;
      });
      topheader.appendChild(topheaderList);
      
      topheader.className = (categoryHide ? "hid" : "");
      categoryContent.className = (categoryHide ? "hid" : "");
      
      subcatList.push(topheader);
      subcatList.push(categoryContent);
      subcatTop.appendChild(topheader);
      subcatContent.appendChild(categoryContent);
      
      category.select = function(){
        sSelectedList.forEach(function(item){
          ytcenter.utils.removeClass(item, "ytcenter-selected");
        });
        subcatList.forEach(function(item){
          ytcenter.utils.addClass(item, "hid");
        });
        ytcenter.utils.addClass(acat, "ytcenter-selected");
        ytcenter.utils.removeClass(topheader, "hid");
        ytcenter.utils.removeClass(categoryContent, "hid");
      };
      categoryHide = true;
    });
    
    leftPanel.appendChild(categoryList);
    
    rightPanel.appendChild(subcatTop);
    rightPanel.appendChild(subcatContent);
    
    frag.appendChild(leftPanel);
    frag.appendChild(rightPanel);
    
    return frag;
  };
  
  a.createDialog = function(){
    var dialog = ytcenter.dialog("YouTube Center Settings", a.createLayout(), [], "top"),
        closeButton = document.createElement("div"),
        closeIcon = document.createElement("img");
    closeIcon.className = "close";
    closeIcon.setAttribute("src", "//s.ytimg.com/yts/img/pixel-vfl3z5WfW.gif");
    closeButton.style.position = "absolute";
    closeButton.style.top = "0";
    closeButton.style.right = "0";
    closeButton.style.margin = "0";
    closeButton.className = "yt-alert";
    closeButton.appendChild(closeIcon);
    ytcenter.utils.addEventListener(closeButton, "click", function(){
      dialog.setVisibility(false);
    }, false);
    dialog.getHeader().appendChild(closeButton);
    dialog.getHeader().style.margin = "0 -20px 0px";
    dialog.getBase().style.overflowY = "scroll";
    dialog.getFooter().style.display = "none";
    return dialog;
  };
  return a;
})();

// Creating Categories
var general = ytcenter.settings.createCategory("General"),
    player = ytcenter.settings.createCategory("Player"),
    ui = ytcenter.settings.createCategory("UI"),
    update = ytcenter.settings.createCategory("Update"),
    debug = ytcenter.settings.createCategory("Debug"),
    about = ytcenter.settings.createCategory("About");

// Creating Subcategories
var general_subcat1 = ytcenter.settings.createSubCategory("Alpha"),
    general_subcat2 = ytcenter.settings.createSubCategory("Beta"),
    player_watch = ytcenter.settings.createSubCategory("Watch"),
    player_channel = ytcenter.settings.createSubCategory("Channel"),
    player_embed = ytcenter.settings.createSubCategory("Embed"),
    ui_videothumbnail = ytcenter.settings.createSubCategory("Video Thumbnail"),
    ui_comments = ytcenter.settings.createSubCategory("Comments"),
    ui_subscriptions = ytcenter.settings.createSubCategory("Subscriptions"),
    update_general = ytcenter.settings.createSubCategory("General"),
    update_channel = ytcenter.settings.createSubCategory("Channel"),
    debug_log = ytcenter.settings.createSubCategory("Log"),
    debug_options = ytcenter.settings.createSubCategory("Options"),
    about_about = ytcenter.settings.createSubCategory("About"),
    about_share = ytcenter.settings.createSubCategory("Share"),
    about_donate = ytcenter.settings.createSubCategory("Donate");

// Linking categories with subcategories
general.addSubCategory(general_subcat1);
general.addSubCategory(general_subcat2);

player.addSubCategory(player_watch);
player.addSubCategory(player_channel);
player.addSubCategory(player_embed);

ui.addSubCategory(ui_videothumbnail);
ui.addSubCategory(ui_comments);
ui.addSubCategory(ui_subscriptions);

update.addSubCategory(update_general);
update.addSubCategory(update_channel);

debug.addSubCategory(debug_log);
debug.addSubCategory(debug_options);

about.addSubCategory(about_about);
about.addSubCategory(about_share);
about.addSubCategory(about_donate);

// Creating options
//...

// Linking options to subcategories
//...

/*// Creating settings element
var dialog = ytcenter.settings.createDialog();

// Displaying the settings
dialog.setVisibility(true);*/