ytcenter.modules.resizeItemList = function(option){
  function wrapItem(item) {
    if (typeof item.getItemElement !== "undefined") return item; // It's already been processed
    var selected = false;
    
    var li = document.createElement("li");
    li.className = "ytcenter-list-item ytcenter-dragdrop-item";
    
    var order = document.createElement("div");
    order.className = "ytcenter-dragdrop-handle";
    
    var content = document.createElement("div");
    content.className = "ytcenter-list-item-content";
    var title = document.createElement("span");
    title.className = "ytcenter-list-item-title";
    
    var subtext = document.createElement("span");
    subtext.className = "ytcenter-list-item-subtext";
    
    content.appendChild(title);
    content.appendChild(subtext);
    
    li.appendChild(order);
    li.appendChild(content);
    
    ytcenter.utils.addEventListener(content, "click", function(){
      if (selected) return;
      selectSizeItem(item.id);
    });
    var out = {
      getId: function(){
        return item.id;
      },
      getData: function(){
        return item;
      },
      getConfig: function(){
        return item.config;
      },
      setConfig: function(conf){
        item.config = conf;
      },
      updateItemElement: function(){
        var dim = ytcenter.utils.calculateDimensions(item.config.width, item.config.height);
        title.textContent = getItemTitle(out);
        subtext.textContent = getItemSubText(out);
      },
      getItemElement: function(){
        return li;
      },
      setSelection: function(_selected){
        selected = _selected;
        if (selected) {
          ytcenter.utils.addClass(li, "ytcenter-list-item-selected");
        } else {
          ytcenter.utils.removeClass(li, "ytcenter-list-item-selected");
        }
      }
    };
    
    out.updateItemElement();
    ytcenter.events.addEvent("ui-refresh", function(){
      out.updateItemElement();
    });
    return out;
  }
  function getItemInfo(item) {
    var __r = {};
    var dim = ytcenter.utils.calculateDimensions(item.getConfig().width, item.getConfig().height);
    if (item.getConfig().width === "" && item.getConfig().height === "") {
      __r.width = "";
      __r.height = "";
    } else {
      if (typeof dim[0] === "number") {
        __r.width = dim[0] + "px";
      } else {
        __r.width = dim[0];
      }
      if (typeof dim[1] === "number") {
        __r.height = dim[1] + "px";
      } else {
        __r.height = dim[1];
      }
    }
    __r.large = item.getConfig().large;
    __r.align = item.getConfig().align;
    __r.scrollToPlayer = item.getConfig().scrollToPlayer;
    __r.scrollToPlayerButton = item.getConfig().scrollToPlayerButton;
    __r.customName = (typeof item.getConfig().customName === "undefined" ? "" : item.getConfig().customName);
    __r.aspectRatioLocked = (typeof item.getConfig().aspectRatioLocked === "undefined" ? false : item.getConfig().aspectRatioLocked);
    return __r;
  }
  function createEditor() {
    function hasUnsavedChanges() {
      if (state === 0) return false;
      if (state === 2) return true;
      if (original.width !== __getWidth()) return true;
      if (original.height !== __getHeight()) return true;
      if (original.large !== largeInput.isSelected()) return true;
      if (original.align !== alignInput.isSelected()) return true;
      if (original.scrollToPlayer !== scrollToPlayerInput.isSelected()) return true;
      if (original.scrollToPlayerButton !== scrollToPlayerButtonInput.isSelected()) return true;
      if (original.customName !== customNameInput.value) return true;
      if (original.aspectRatioLocked !== ratioLocked) return true;
      
      return false;
    }
    var __getWidth = function(){
      if (isNaN(parseInt(widthInput.value))) {
        return widthUnit.getValue();
      } else {
        return parseInt(widthInput.value) + widthUnit.getValue();
      }
    };
    var __getHeight = function(){
      if (isNaN(parseInt(heightInput.value))) {
        return heightUnit.getValue();
      } else {
        return parseInt(heightInput.value) + heightUnit.getValue();
      }
    };
    var __getAspectRatio = function(){
      if (isNaN(parseInt(widthInput.value)) || isNaN(parseInt(heightInput.value)) || widthUnit.getValue() !== "px" || heightUnit.getValue() !== "px") return;
      return parseInt(widthInput.value)/parseInt(heightInput.value);
    };
    var __updateAspectRatio = function(){
      aspectRatio = __getAspectRatio();
    };
    var __setAspectRatioLocked = function(locked){
      ratioLocked = locked;
      if (ratioLocked) {
        ytcenter.utils.addClass(ratioIcon, "ytcenter-resize-chain");
        ytcenter.utils.removeClass(ratioIcon, "ytcenter-resize-unchain");
        aspectRatio = __getAspectRatio();
      } else {
        ytcenter.utils.removeClass(ratioIcon, "ytcenter-resize-chain");
        ytcenter.utils.addClass(ratioIcon, "ytcenter-resize-unchain");
        aspectRatio = undefined;
      }
    };
    var __setAspectVisibility = function(visible){
      if (visible) {
        ytcenter.utils.removeClass(linkBorder, "force-hid");
        ytcenter.utils.removeClass(ratioIcon, "force-hid");
      } else {
        ytcenter.utils.addClass(linkBorder, "force-hid");
        ytcenter.utils.addClass(ratioIcon, "force-hid");
      }
    };
    var saveListener, cancelListener, deleteListener, newSessionCallback;
    var original = {};
    var state = 0;
    var ratioLocked = false;
    var aspectRatio;
    
    var wrp = document.createElement("div");
    wrp.style.visibility = "hidden";
    // Editor Panel
    var customNameWrapper = document.createElement("div");
    customNameWrapper.className = "ytcenter-panel-label";
    var customNameLabel = document.createElement("label");
    customNameLabel.textContent = ytcenter.language.getLocale("EMBED_RESIZEITEMLIST_CUSTOMNAME");
    ytcenter.language.addLocaleElement(customNameLabel, "EMBED_RESIZEITEMLIST_CUSTOMNAME", "@textContent");
    customNameWrapper.appendChild(customNameLabel);
    var customNameInput = ytcenter.gui.createYouTubeTextInput();
    customNameInput.style.width = "210px";
    customNameWrapper.appendChild(customNameInput);
    
    var dimensionWrapper = document.createElement("div");
    var sizeWrapper = document.createElement("div");
    sizeWrapper.style.display = "inline-block";
    
    var widthWrapper = document.createElement("div");
    widthWrapper.className = "ytcenter-panel-label";
    var widthLabel = document.createElement("label");
    widthLabel.textContent = ytcenter.language.getLocale("EMBED_RESIZEITEMLIST_WIDTH");
    ytcenter.language.addLocaleElement(widthLabel, "EMBED_RESIZEITEMLIST_WIDTH", "@textContent");
    widthWrapper.appendChild(widthLabel);
    var widthInput = ytcenter.gui.createYouTubeTextInput();
    widthInput.style.width = "105px";
    widthWrapper.appendChild(widthInput);
    
    ytcenter.utils.addEventListener(widthInput, "change", function(){
      if (widthUnit.getValue() !== "px" || heightUnit.getValue() !== "px") return;
      aspectRatio = __getAspectRatio();
    });
    ytcenter.utils.addEventListener(widthInput, "input", function(){
      if (isNaN(parseInt(widthInput.value))) widthInput.value = "";
      else widthInput.value = parseInt(widthInput.value);
      if (widthUnit.getValue() !== "px" || heightUnit.getValue() !== "px") return;
      if (typeof aspectRatio === "undefined" || !ratioLocked) return;
      if (isNaN(parseInt(widthInput.value))) {
        heightInput.value = "";
      } else if (aspectRatio !== 0) {
        heightInput.value = Math.round(parseInt(widthInput.value)/aspectRatio);
      }
    });
    
    var widthUnit = ytcenter.embeds.select([
      {label: "EMBED_RESIZEITEMLIST_PIXEL", value: "px"},
      {label: "EMBED_RESIZEITEMLIST_PERCENT", value: "%"}
    ]);
    widthUnit.bind(function(){
      if (widthUnit.getValue() !== "px" || heightUnit.getValue() !== "px") {
        __setAspectVisibility(false);
        return;
      }
      __setAspectVisibility(true);
      aspectRatio = __getAspectRatio();
    });
    
    widthWrapper.appendChild(widthUnit.element);
    
    sizeWrapper.appendChild(widthWrapper);
    
    var heightWrapper = document.createElement("div");
    heightWrapper.className = "ytcenter-panel-label";
    var heightLabel = document.createElement("label");
    heightLabel.textContent = ytcenter.language.getLocale("EMBED_RESIZEITEMLIST_HEIGHT");
    ytcenter.language.addLocaleElement(heightLabel, "EMBED_RESIZEITEMLIST_HEIGHT", "@textContent");
    heightWrapper.appendChild(heightLabel);
    var heightInput = ytcenter.gui.createYouTubeTextInput();
    heightInput.style.width = "105px";
    heightWrapper.appendChild(heightInput);
    
    ytcenter.utils.addEventListener(heightInput, "change", function(){
      if (widthUnit.getValue() !== "px" || heightUnit.getValue() !== "px") return;
      aspectRatio = __getAspectRatio();
    });
    ytcenter.utils.addEventListener(heightInput, "input", function(){
      if (isNaN(parseInt(heightInput.value))) heightInput.value = "";
      else heightInput.value = parseInt(heightInput.value);
      if (widthUnit.getValue() !== "px" || heightUnit.getValue() !== "px") return;
      if (typeof aspectRatio === "undefined" || !ratioLocked) return;
      if (isNaN(parseInt(heightInput.value))) {
        widthInput.value = "";
      } else if (aspectRatio !== 0) {
        widthInput.value = Math.round(parseInt(heightInput.value)*aspectRatio);
      }
    });
    
    var heightUnit = ytcenter.embeds.select([
      {label: "EMBED_RESIZEITEMLIST_PIXEL", value: "px"},
      {label: "EMBED_RESIZEITEMLIST_PERCENT", value: "%"}
    ]);
    
    heightUnit.bind(function(){
      if (widthUnit.getValue() !== "px" || heightUnit.getValue() !== "px") {
        __setAspectVisibility(false);
        return;
      }
      __setAspectVisibility(true);
      aspectRatio = __getAspectRatio();
    });
    
    heightWrapper.appendChild(heightUnit.element);
    
    sizeWrapper.appendChild(heightWrapper);
    
    dimensionWrapper.appendChild(sizeWrapper);
    
    var linkBorder = document.createElement("div");
    linkBorder.className = "ytcenter-resize-aspect-bind";
    
    dimensionWrapper.appendChild(linkBorder);
    
    var ratioIcon = document.createElement("div");
    ratioIcon.className = "ytcenter-resize-unchain ytcenter-resize-ratio";
    ratioIcon.style.display = "inline-block";
    ratioIcon.style.marginBottom = "13px";
    ratioIcon.style.marginLeft = "-11px";
    ratioIcon.style.width = "20px";
    ytcenter.utils.addEventListener(ratioIcon, "click", function(e){
      if (widthUnit.getValue() !== "px" || heightUnit.getValue() !== "px") return;
      if (ratioLocked) {
        __setAspectRatioLocked(false);
      } else {
        __setAspectRatioLocked(true);
      }
      if (e && e.preventDefault) {
        e.preventDefault();
      } else {
        window.event.returnValue = false;
      }
      return false;
    });
    
    dimensionWrapper.appendChild(ratioIcon);
    
    var largeWrapper = document.createElement("div");
    largeWrapper.className = "ytcenter-panel-label";
    var largeLabel = document.createElement("label");
    largeLabel.textContent = ytcenter.language.getLocale("EMBED_RESIZEITEMLIST_LARGE");
    ytcenter.language.addLocaleElement(largeLabel, "EMBED_RESIZEITEMLIST_LARGE", "@textContent");
    largeWrapper.appendChild(largeLabel);
    var largeInput = ytcenter.embeds.checkbox();
    largeInput.element.style.background = "#fff";
    largeInput.fixHeight();
    largeWrapper.appendChild(largeInput.element);
    
    var alignWrapper = document.createElement("div");
    alignWrapper.className = "ytcenter-panel-label";
    var alignLabel = document.createElement("label");
    alignLabel.textContent = "Align";
    alignLabel.textContent = ytcenter.language.getLocale("EMBED_RESIZEITEMLIST_ALIGN");
    ytcenter.language.addLocaleElement(alignLabel, "EMBED_RESIZEITEMLIST_ALIGN", "@textContent");
    alignWrapper.appendChild(alignLabel);
    var alignInput = ytcenter.embeds.checkbox();
    alignInput.element.style.background = "#fff";
    alignInput.fixHeight();
    alignWrapper.appendChild(alignInput.element);
    
    var scrollToPlayerWrapper = document.createElement("div");
    scrollToPlayerWrapper.className = "ytcenter-panel-label";
    var scrollToPlayerLabel = document.createElement("label");
    scrollToPlayerLabel.textContent = ytcenter.language.getLocale("EMBED_RESIZEITEMLIST_SCROLLTOPLAYER");
    ytcenter.language.addLocaleElement(scrollToPlayerLabel, "EMBED_RESIZEITEMLIST_SCROLLTOPLAYER", "@textContent");
    scrollToPlayerWrapper.appendChild(scrollToPlayerLabel);
    var scrollToPlayerInput = ytcenter.embeds.checkbox();
    scrollToPlayerInput.element.style.background = "#fff";
    scrollToPlayerInput.fixHeight();
    scrollToPlayerWrapper.appendChild(scrollToPlayerInput.element);
    
    var scrollToPlayerButtonWrapper = document.createElement("div");
    scrollToPlayerButtonWrapper.className = "ytcenter-panel-label";
    var scrollToPlayerButtonLabel = document.createElement("label");
    scrollToPlayerButtonLabel.textContent = ytcenter.language.getLocale("EMBED_RESIZEITEMLIST_SCROLLTOPLAYERBUTTON");
    ytcenter.language.addLocaleElement(scrollToPlayerButtonLabel, "EMBED_RESIZEITEMLIST_SCROLLTOPLAYERBUTTON", "@textContent");
    scrollToPlayerButtonWrapper.appendChild(scrollToPlayerButtonLabel);
    var scrollToPlayerButtonInput = ytcenter.embeds.checkbox();
    scrollToPlayerButtonInput.element.style.background = "#fff";
    scrollToPlayerButtonInput.fixHeight();
    scrollToPlayerButtonWrapper.style.marginBottom = "40px";
    scrollToPlayerButtonWrapper.appendChild(scrollToPlayerButtonInput.element);
    
    var optionsWrapper = document.createElement("div");
    optionsWrapper.className = "clearfix resize-options";
    
    var saveBtn = ytcenter.gui.createYouTubePrimaryButton("", [ytcenter.gui.createYouTubeButtonText("Save")]);
    saveBtn.style.cssFloat = "right";
    saveBtn.style.marginLeft = "10px";
    saveBtn.style.minWidth = "60px";
    ytcenter.utils.addEventListener(saveBtn, "click", function(){
      state = 0;
      wrp.style.visibility = "hidden";
      if (typeof saveListener !== "undefined") saveListener();
      ytcenter.events.performEvent("ui-refresh");
    });
    
    var cancelBtn = ytcenter.gui.createYouTubeDefaultButton("", [ytcenter.gui.createYouTubeButtonText("Cancel")]);
    cancelBtn.style.cssFloat = "right";
    cancelBtn.style.marginLeft = "10px";
    cancelBtn.style.minWidth = "60px";
    ytcenter.utils.addEventListener(cancelBtn, "click", function(){
      if (hasUnsavedChanges()) {
        ytcenter.confirmBox("EMBED_RESIZEITEMLIST_CONFIRM_TITLE", "EMBED_RESIZEITEMLIST_UNSAVED_CONFIRM_MESSAGE", function(accepted){
          if (accepted) {
            state = 0;
            wrp.style.visibility = "hidden";
            if (typeof cancelListener !== "undefined") cancelListener();
            ytcenter.events.performEvent("ui-refresh");
          }
        });
      } else {
        state = 0;
        wrp.style.visibility = "hidden";
        if (typeof cancelListener !== "undefined") cancelListener();
        ytcenter.events.performEvent("ui-refresh");
      }
    });
    
    var deleteBtn = ytcenter.gui.createYouTubeDefaultButton("", [ytcenter.gui.createYouTubeButtonText("Delete")]);
    deleteBtn.style.cssFloat = "left";
    deleteBtn.style.minWidth = "60px";
    ytcenter.utils.addEventListener(deleteBtn, "click", function(){
      ytcenter.confirmBox("EMBED_RESIZEITEMLIST_DELETE_CONFIRM_TITLE", "EMBED_RESIZEITEMLIST_DELETE_CONFIRM_MESSAGE", function(del){
        if (del) {
          state = 0;
          wrp.style.visibility = "hidden";
          if (typeof deleteListener !== "undefined") deleteListener();
          ytcenter.events.performEvent("ui-refresh");
        }
      }, "EMBED_RESIZEITEMLIST_CONFIRM_DELETE");
    });
    
    optionsWrapper.appendChild(deleteBtn);
    optionsWrapper.appendChild(saveBtn);
    optionsWrapper.appendChild(cancelBtn);
    
    
    wrp.appendChild(customNameWrapper);
    wrp.appendChild(dimensionWrapper);
    wrp.appendChild(largeWrapper);
    wrp.appendChild(alignWrapper);
    wrp.appendChild(scrollToPlayerWrapper);
    wrp.appendChild(scrollToPlayerButtonWrapper);
    
    wrp.appendChild(optionsWrapper);
    
    editWrapper.appendChild(wrp);
    
    
    return {
      destroy: function(){
        editWrapper.removeChild(wrp);
      },
      hasUnsavedChanges: hasUnsavedChanges,
      setState: function(s){
        state = s;
      },
      setDeleteButtonVisibility: function(visible) {
        if (visible) {
          deleteBtn.style.visibility = "";
        } else {
          deleteBtn.style.visibility = "hidden";
        }
      },
      setSaveListener: function(callback){
        saveListener = callback;
      },
      setCancelListener: function(callback){
        cancelListener = callback;
      },
      setDeleteListener: function(callback){
        deleteListener = callback;
      },
      updateAspectRatio: function(){
        __updateAspectRatio();
      },
      getAspectRatio: function(){
        return aspectRatio;
      },
      setAspectRatioLocked: function(locked){
        __setAspectRatioLocked(locked);
        original.aspectRatioLocked = ratioLocked;
      },
      isAspectRatioLocked: function(){
        return ratioLocked;
      },
      setWidth: function(width){
        state = 1;
        if (width === "") { // Default
          widthInput.value = "";
          widthUnit.setSelected("px");
          width = "px";
        } else {
          var _val = parseInt(width);
          if (isNaN(_val)) {
            widthInput.value = "";
          } else {
            widthInput.value = _val;
          }
          widthUnit.setSelected((width.indexOf("%") !== -1 ? "%" : "px"));
        }
        original.width = __getWidth();
        if (widthUnit.getValue() !== "px" || heightUnit.getValue() !== "px") {
          __setAspectVisibility(false);
        } else {
          __setAspectVisibility(true);
        }
      },
      getWidth: __getWidth,
      setHeight: function(height){
        state = 1;
        if (height === "") { // Default
          heightInput.value = "";
          heightUnit.setSelected("px");
          height = "px";
        } else {
          var _val = parseInt(height);
          if (isNaN(_val)) {
            heightInput.value = "";
          } else {
            heightInput.value = _val;
          }
          heightUnit.setSelected((height.indexOf("%") !== -1 ? "%" : "px"));
        }
        original.height = __getHeight();
        if (widthUnit.getValue() !== "px" || heightUnit.getValue() !== "px") {
          __setAspectVisibility(false);
        } else {
          __setAspectVisibility(true);
        }
      },
      getHeight: __getHeight,
      setLarge: function(large){
        state = 1;
        largeInput.update(large);
        original.large = largeInput.isSelected();
      },
      getLarge: function(){
        return largeInput.isSelected();
      },
      setAlign: function(align){
        state = 1;
        alignInput.update(align);
        original.align = alignInput.isSelected();
      },
      getAlign: function(){
        return alignInput.isSelected();
      },
      setScrollToPlayer: function(scrollToPlayer){
        state = 1;
        scrollToPlayerInput.update(scrollToPlayer);
        original.scrollToPlayer = scrollToPlayerInput.isSelected();
      },
      getScrollToPlayer: function(){
        return scrollToPlayerInput.isSelected();
      },
      setScrollToPlayerButton: function(scrollToPlayerButton){
        state = 1;
        scrollToPlayerButtonInput.update(scrollToPlayerButton);
        original.scrollToPlayerButton = scrollToPlayerButtonInput.isSelected();
      },
      getScrollToPlayerButton: function(){
        return scrollToPlayerButtonInput.isSelected();
      },
      setCustomName: function(customName){
        if (typeof customName !== "string") customName = "";
        state = 1;
        customNameInput.value = customName;
        original.customName = customName;
      },
      getCustomName: function(){
        return customNameInput.value;
      },
      setVisibility: function(visible) {
        if (visible) {
          wrp.style.visibility = "";
        } else {
          wrp.style.visibility = "hidden";
        }
      },
      newSession: function(){
        if (typeof newSessionCallback !== "undefined") newSessionCallback();
      },
      setSessionListener: function(callback){
        newSessionCallback = callback;
      },
      focusCustomNameField: function(){
        customNameInput.focus();
      },
      focusWidthField: function(){
        widthInput.focus();
      },
      focusHeightField: function(){
        heightInput.focus();
      }
    };
  }
  function getItemTitle(item) {
    var dim = ytcenter.utils.calculateDimensions(item.getConfig().width, item.getConfig().height);
    if (typeof item.getConfig().customName !== "undefined" && item.getConfig().customName !== "") {
      return item.getConfig().customName;
    } else if (isNaN(parseInt(item.getConfig().width)) && isNaN(parseInt(item.getConfig().height))) {
      return (item.getConfig().large ? ytcenter.language.getLocale("SETTINGS_RESIZE_LARGE") : ytcenter.language.getLocale("SETTINGS_RESIZE_SMALL"));
      subtext.textContent = (item.getConfig().align ? ytcenter.language.getLocale("SETTINGS_RESIZE_ALIGN") : ytcenter.language.getLocale("SETTINGS_RESIZE_CENTER"));
    } else {
      return dim[0] + "×" + dim[1];
      subtext.textContent = (item.getConfig().large ? ytcenter.language.getLocale("SETTINGS_RESIZE_LARGE") : ytcenter.language.getLocale("SETTINGS_RESIZE_SMALL")) + " - " + (item.getConfig().align ? ytcenter.language.getLocale("SETTINGS_RESIZE_ALIGN") : ytcenter.language.getLocale("SETTINGS_RESIZE_CENTER"));
    }
  }
  function getItemSubText(item) {
    if (isNaN(parseInt(item.getConfig().width)) && isNaN(parseInt(item.getConfig().height))) {
      return (item.getConfig().align ? ytcenter.language.getLocale("SETTINGS_RESIZE_ALIGN") : ytcenter.language.getLocale("SETTINGS_RESIZE_CENTER")) + (item.getConfig().scrollToPlayer ? " - " + ytcenter.language.getLocale("SETTINGS_RESIZE_SCROLLTOPLAYER") : "");
    } else {
      return (item.getConfig().large ? ytcenter.language.getLocale("SETTINGS_RESIZE_LARGE") : ytcenter.language.getLocale("SETTINGS_RESIZE_SMALL")) + " - " + (item.getConfig().align ? ytcenter.language.getLocale("SETTINGS_RESIZE_ALIGN") : ytcenter.language.getLocale("SETTINGS_RESIZE_CENTER")) + (item.getConfig().scrollToPlayer ? " - " + ytcenter.language.getLocale("SETTINGS_RESIZE_SCROLLTOPLAYER") : "");
    }
  }
  function updateListHeight() {
    try {
      var _h = editWrapper.clientHeight || editWrapper.scrollHeight;
      if (_h > 0) listWrapper.style.height = _h + "px";
    } catch (e) {
      con.error(e);
    }
  }
  function selectSizeItem(id) {
    var bypassConfirm = false;
    if (typeof editor === "undefined") {
      bypassConfirm = true;
      editor = createEditor();
    }
    var overrideData = function(){
      editor.newSession();
      var newItem = false;
      var newItemSaved = false;
      var newItemCancled = false;
      var item;
      if (typeof id === "undefined") {
        newItem = true;
        item = createEmptyItem();
        items.push(item);
        listOl.appendChild(item.getItemElement());
        listOl.scrollTop = listOl.scrollHeight - listOl.clientHeight;
      } else {
        item = getItemById(id);
      }
      markItem(item.getId());
      var inf = getItemInfo(item);
      editor.setCustomName(inf.customName);
      editor.setWidth(inf.width);
      editor.setHeight(inf.height);
      editor.setAspectRatioLocked(inf.aspectRatioLocked);
      editor.setLarge(inf.large);
      editor.setAlign(inf.align);
      editor.setScrollToPlayer(inf.scrollToPlayer);
      editor.setScrollToPlayerButton(inf.scrollToPlayerButton);
      editor.updateAspectRatio();
      
      editor.setSessionListener(function(){
        if (!newItem || newItemSaved || newItemCancled) return;
        
        var sI;
        for (var i = 0; i < items.length; i++) {
          sI = i;
          if (items[i].getId() === item.getId()) break;
        }
        items.splice(sI, 1);
        
        if (typeof item.getItemElement().parentNode !== "undefined") item.getItemElement().parentNode.removeChild(item.getItemElement());
        
        if (typeof saveCallback !== "undefined") saveCallback(getSaveArray());
      });
      
      editor.setSaveListener(function(){
        newItemSaved = true;
        item.setConfig({
          customName: editor.getCustomName(),
          width: editor.getWidth(),
          height: editor.getHeight(),
          large: editor.getLarge(),
          align: editor.getAlign(),
          scrollToPlayer: editor.getScrollToPlayer(),
          scrollToPlayerButton: editor.getScrollToPlayerButton(),
          aspectRatioLocked: editor.isAspectRatioLocked()
        });
        item.updateItemElement();
        unMarkAllItems();
        
        if (typeof saveCallback !== "undefined") saveCallback(getSaveArray());
      });
      editor.setCancelListener(function(){
        if (newItem) {
          newItemCancled = true;
          var sI;
          for (var i = 0; i < items.length; i++) {
            sI = i;
            if (items[i].getId() === item.getId()) break;
          }
          items.splice(sI, 1);
          
          if (item.getItemElement().parentNode) item.getItemElement().parentNode.removeChild(item.getItemElement());
          
          if (typeof saveCallback !== "undefined") saveCallback(getSaveArray());
        }
        unMarkAllItems();
      });
      editor.setDeleteListener(function(){
        try {
          if (newItem) return;
          if (ytcenter.player.isSelectedPlayerSizeById(item.getId())) {
            if (ytcenter.settings["resize-playersizes"][0].id === item.getId()) {
              if (ytcenter.settings["resize-playersizes"].length > 1) {
                ytcenter.player.resize(ytcenter.settings["resize-playersizes"][1]);
              }
            } else {
              ytcenter.player.resize(ytcenter.settings["resize-playersizes"][0]);
            }
          }
          unMarkAllItems();
          if (typeof item.getItemElement().parentNode !== "undefined") item.getItemElement().parentNode.removeChild(item.getItemElement());
          
          var sI;
          for (var i = 0; i < items.length; i++) {
            sI = i;
            if (items[i].getId() === item.getId()) break;
          }
          items.splice(sI, 1);
          
          if (typeof saveCallback !== "undefined") saveCallback(getSaveArray());
        } catch (e) {
          con.error(e);
        }
      });
      editor.setDeleteButtonVisibility(!newItem);
      
      editor.setVisibility(true);
      editor.focusCustomNameField();
      
      if (newItem) editor.setState(2);
    };
    if (editor.hasUnsavedChanges() && !bypassConfirm) {
      ytcenter.confirmBox("EMBED_RESIZEITEMLIST_CONFIRM_TITLE", "EMBED_RESIZEITEMLIST_UNSAVED_CONFIRM_MESSAGE", function(accepted){
        if (accepted) {
          editor.setState(0);
          overrideData();
        }
      });
    } else {
      overrideData();
    }
    updateListHeight();
  }
  function getItemById(id) {
    for (var i = 0; i < items.length; i++) {
      if (items[i].getId() === id) return items[i];
    }
  }
  function unMarkAllItems() {
    for (var i = 0; i < items.length; i++) {
      items[i].setSelection(false);
    }
  }
  function markItem(id) {
    unMarkAllItems();
    getItemById(id).setSelection(true);
  }
  function getSaveArray() {
    var _s = [];
    for (var i = 0; i < items.length; i++) {
      _s.push(items[i].getData());
    }
    return _s;
  }
  function getItemByElement(li) {
    for (var i = 0; i < items.length; i++) {
      if (items.getItemElement() === li) return items[i];
    }
  }
  function createEmptyItem() {
    return wrapItem({
      id: ytcenter.utils.assignId("resize_item_list_"),
      config: {
        customName: "",
        width: "",
        height: "",
        large: true,
        align: false,
        scrollToPlayer: false,
        scrollToPlayerButton: false,
        aspectRatioLocked: false
      }
    });
  }
  function setItems(_items) {
    items = [];
    ytcenter.utils.each(_items, function(i, item){
      items.push(wrapItem(item));
    });
    
    listOl.innerHTML = "";
    ytcenter.utils.each(items, function(i, item){
      listOl.appendChild(item.getItemElement());
    });
  }
  var editor;
  var saveCallback;
  var items = [];
  
  var wrapper = document.createElement("div");
  wrapper.className = "ytcenter-embed ytcenter-resize-panel";
  
  var headerWrapper = document.createElement("div");
  headerWrapper.className = "ytcenter-resize-panel-header";
  
  var addButton = ytcenter.gui.createYouTubeDefaultButton("", [ytcenter.gui.createYouTubeButtonTextLabel("EMBED_RESIZEITEMLIST_ADD_SIZE")]);
  ytcenter.utils.addClass(addButton, "ytcenter-list-header-btn");
  
  ytcenter.utils.addEventListener(addButton, "click", function(){
    selectSizeItem();
  });
  
  headerWrapper.appendChild(addButton);
  
  var contentWrapper = document.createElement("div");
  contentWrapper.className = "ytcenter-resize-panel-content";
  
  var editWrapper = document.createElement("div");
  editWrapper.className = "ytcenter-panel";
  
  var listWrapper = document.createElement("div");
  listWrapper.className = "ytcenter-resize-panel-list";
  
  var listOl = document.createElement("ol");
  listOl.className = "ytcenter-list ytcenter-dragdrop ytcenter-scrollbar ytcenter-scrollbar-hover";
  var dd = ytcenter.dragdrop(listOl);
  dd.addEventListener("onDrop", function(newIndex, oldIndex, item){
    var itm = items[oldIndex];
    items.splice(oldIndex, 1);
    items.splice(newIndex, 0, itm);
    if (typeof saveCallback !== "undefined") saveCallback(getSaveArray());
    ytcenter.events.performEvent("ui-refresh");
  });
  
  listWrapper.appendChild(listOl);
  contentWrapper.appendChild(listWrapper);
  contentWrapper.appendChild(editWrapper);
  wrapper.appendChild(headerWrapper);
  wrapper.appendChild(contentWrapper);
  
  ytcenter.events.addEvent("ui-refresh", function(){
    if (!editor) {
      editor = createEditor();
    }
    updateListHeight();
  });
  
  return {
    element: wrapper, // So the element can be appended to an element.
    bind: function(callback){
      saveCallback = function(arg){
        callback(arg);
        ytcenter.player.resizeUpdater();
      }
    },
    update: function(value){
      setItems(value);
      if (typeof editor !== "undefined") editor.setVisibility(false);
    }
  };
};