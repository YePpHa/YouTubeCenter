ytcenter.modules.importexport = function(){
  var textLabel = ytcenter.gui.createYouTubeButtonTextLabel("SETTINGS_IMEX_TITLE"),
      content = document.createElement("div"),
      VALIDATOR_STRING = "YTCSettings=>",
      dropZone = document.createElement("div"),
      dropZoneContent = document.createElement("div"),
      filechooser = document.createElement("input"),
      settingsPool = document.createElement("textarea"),
      dialog = ytcenter.dialog("SETTINGS_IMEX_TITLE", content, [
        {
          label: "SETTINGS_IMEX_CANCEL",
          primary: false,
          callback: function(){
            dialog.setVisibility(false);
          }
        }, {
          name: "save",
          label: "SETTINGS_IMEX_SAVE",
          primary: true,
          callback: function(){
            if (!saveEnabled) return;
            ytcenter.settings = JSON.parse(settingsPool.value);
            ytcenter.saveSettings();
            loc.reload();
          }
        }
      ]),
      status,
      loadingText = document.createElement("div"),
      messageText = document.createElement("div"),
      messageTimer,
      dropZoneEnabled = true,
      saveEnabled = true,
      pushMessage = function(message, color, timer){
        //dropZoneEnabled = false;
        messageText.textContent = message;
        messageText.style.display = "inline-block";
        if (typeof color === "string") messageText.style.color = color;
        else messageText.style.color = "";
        
        status.style.display = "";
        dropZoneContent.style.visibility = "hidden";
        uw.clearTimeout(messageTimer);
        if (typeof timer === "number") {
          messageTimer = uw.setTimeout(function(){
            removeMessage();
          }, timer);
        }
      },
      removeMessage = function(){
        status.style.display = "none";
        dropZoneContent.style.visibility = "";
        
        messageText.style.display = "none";
        messageText.textContent = "";
        //dropZoneEnabled = true;
        uw.clearTimeout(messageTimer);
      },
      validateFileAndLoad = function(file){
        dropZone.style.border = "2px dashed rgb(187, 187, 187)";
        pushMessage(ytcenter.language.getLocale("SETTINGS_IMEX_VALIDATE"));
        
        var reader = new FileReader();
        reader.onerror = function(e){
          switch (e.target.error.code) {
            case e.target.error.NOT_FOUND_ERR:
              pushMessage(ytcenter.language.getLocale("SETTINGS_IMEX_IMPORT_ERROR_NOT_FOUND"), "#ff0000", 10000);
              break;
            case e.target.error.NOT_READABLE_ERR:
              pushMessage(ytcenter.language.getLocale("SETTINGS_IMEX_IMPORT_ERROR_NOT_READABLE"), "#ff0000", 10000);
              break;
            case e.target.error.ABORT_ERR:
              pushMessage(ytcenter.language.getLocale("SETTINGS_IMEX_IMPORT_ERROR_ABORT"), "#ff0000", 10000);
              break;
            default:
              pushMessage(ytcenter.language.getLocale("SETTINGS_IMEX_IMPORT_ERROR_UNKNOWN"), "#ff0000", 10000);
              break;
          }
        };
        reader.onabort = function(){
          pushMessage(ytcenter.language.getLocale("SETTINGS_IMEX_IMPORT_ERROR_ABORT"), "#ff0000", 10000);
        };
        reader.onload = function(e){
          if (e.target.result === VALIDATOR_STRING) {
            readFile(file);
          } else {
            pushMessage(ytcenter.language.getLocale("SETTINGS_IMEX_VALIDATE_ERROR_NOT_VALID"), "#ff0000", 3500);
            
          }
        };
        
        reader.readAsText(file.slice(0, VALIDATOR_STRING.length));
      },
      readFile = function(file){
        pushMessage(ytcenter.language.getLocale("SETTINGS_IMEX_LOADING"));
        
        var reader = new FileReader();
        reader.onerror = function(e){
          switch (e.target.error.code) {
            case e.target.error.NOT_FOUND_ERR:
              pushMessage(ytcenter.language.getLocale("SETTINGS_IMEX_IMPORT_ERROR_NOT_FOUND"), "#ff0000", 10000);
              break;
            case e.target.error.NOT_READABLE_ERR:
              pushMessage(ytcenter.language.getLocale("SETTINGS_IMEX_IMPORT_ERROR_NOT_READABLE"), "#ff0000", 10000);
              break;
            case e.target.error.ABORT_ERR:
              pushMessage(ytcenter.language.getLocale("SETTINGS_IMEX_IMPORT_ERROR_ABORT"), "#ff0000", 10000);
              break;
            default:
              pushMessage(ytcenter.language.getLocale("SETTINGS_IMEX_IMPORT_ERROR_UNKNOWN"), "#ff0000", 10000);
              break;
          }
        };
        reader.onabort = function(){
          pushMessage(ytcenter.language.getLocale("SETTINGS_IMEX_IMPORT_ERROR_ABORT"), "#ff0000", 10000);
        };
        reader.onload = function(e){
          settingsPool.value = e.target.result;
          pushMessage(ytcenter.language.getLocale("SETTINGS_IMEX_IMPORT_MESSAGE"), "", 10000);
        };
        
        reader.readAsText(file.slice(VALIDATOR_STRING.length));
      },
      exportFileButtonLabel = ytcenter.gui.createYouTubeButtonTextLabel("SETTINGS_IMEX_EXPORT_AS_FILE"),
      exportFileButton = ytcenter.gui.createYouTubeDefaultButton("", [exportFileButtonLabel]),
      statusContainer = document.createElement("div");
  var elm = ytcenter.gui.createYouTubeDefaultButton("", [textLabel]);
  
  // Message Text
  messageText.style.fontWeight = "bold";
  messageText.style.fontSize = "16px";
  messageText.style.textAlign = "center";
  messageText.style.width = "100%";
  messageText.style.display = "none";
  
  status = ytcenter.gui.createMiddleAlignHack(messageText);
  status.style.position = "absolute";
  status.style.top = "0px";
  status.style.left = "0px";
  status.style.width = "100%";
  status.style.height = "100%";
  status.style.display = "none";
  
  filechooser.setAttribute("type", "file");
  ytcenter.utils.addEventListener(elm, "click", function(){
    dialog.setVisibility(true);
  }, false);
  var __f = function(e){
    validateFileAndLoad(e.target.files[0]);
    
    var newNode = document.createElement("input");
    newNode.setAttribute("type", "file");
    ytcenter.utils.addEventListener(newNode, "change", __f, false);
    filechooser.parentNode.replaceChild(newNode, filechooser);
    filechooser = newNode;
  };
  ytcenter.utils.addEventListener(filechooser, "change", __f, false);
  
  ytcenter.utils.addEventListener(dropZone, "drop", function(e){
    e.stopPropagation();
    e.preventDefault();
    
    validateFileAndLoad(e.dataTransfer.files[0]);
  }, false);
  
  ytcenter.utils.addEventListener(dropZone, "dragover", function(e){
    if (!dropZoneEnabled) return;
    e.stopPropagation();
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    dropZone.style.border = "2px dashed rgb(130, 130, 130)";
  }, false);
  ytcenter.utils.addEventListener(dropZone, "dragleave", function(e){
    if (!dropZoneEnabled) return;
    dropZone.style.border = "2px dashed rgb(187, 187, 187)";
    e.dataTransfer.dropEffect = "none";
  }, false);
  ytcenter.utils.addEventListener(dropZone, "dragend", function(e){
    if (!dropZoneEnabled) return;
    dropZone.style.border = "2px dashed rgb(187, 187, 187)";
    e.dataTransfer.dropEffect = "none";
  }, false);
  var text1 = document.createElement("span");
  text1.style.fontWeight = "bold";
  text1.style.fontSize = "16px";
  text1.textContent = ytcenter.language.getLocale("SETTINGS_IMEX_DROPFILEHERE");
  ytcenter.language.addLocaleElement(text1, "SETTINGS_IMEX_DROPFILEHERE", "@textContent");
  dropZoneContent.appendChild(text1);
  dropZoneContent.appendChild(document.createElement("br"));
  var text2 = document.createTextNode(ytcenter.language.getLocale("SETTINGS_IMEX_OR"));
  ytcenter.language.addLocaleElement(text2, "SETTINGS_IMEX_OR", "@textContent");
  dropZoneContent.appendChild(text2);
  dropZoneContent.appendChild(document.createTextNode(" "));
  dropZoneContent.appendChild(filechooser);
  
  dropZone.style.position = "relative";
  dropZone.style.border = "2px dashed rgb(187, 187, 187)";
  dropZone.style.borderRadius = "4px";
  dropZone.style.color = "rgb(110, 110, 110)";
  dropZone.style.padding = "20px 0";
  dropZone.style.width = "100%";
  dropZone.style.marginBottom = "10px";
  dropZone.style.textAlign = "center";
  settingsPool.style.width = "100%";
  settingsPool.style.height = "120px";
  
  dropZoneContent.style.margin = "0 auto";
  dropZoneContent.style.display = "inline-block";
  dropZoneContent.style.textAlign = "left";
  
  dropZone.appendChild(dropZoneContent);
  dropZone.appendChild(status);
  content.appendChild(dropZone);
  content.appendChild(settingsPool);
  
  dialog.setWidth("490px");
  
  var settingsPoolChecker = function(){
    try {
      JSON.parse(settingsPool.value);
      dialog.getActionButton("save").disabled = false;
      settingsPool.style.background = "";
      saveEnabled = true;
    } catch (e) {
      dialog.getActionButton("save").disabled  = true;
      settingsPool.style.background = "#FFAAAA";
      saveEnabled = false;
    }
  };
  
  ytcenter.utils.addEventListener(settingsPool, "input", settingsPoolChecker, false);
  ytcenter.utils.addEventListener(settingsPool, "keyup", settingsPoolChecker, false);
  ytcenter.utils.addEventListener(settingsPool, "paste", settingsPoolChecker, false);
  ytcenter.utils.addEventListener(settingsPool, "change", settingsPoolChecker, false);
  
  dialog.addEventListener("visibility", function(visible){
    if (visible) settingsPool.value = JSON.stringify(ytcenter.settings);
    else settingsPool.value = "";
  });
  
  ytcenter.utils.addEventListener(exportFileButton, "click", function(){
    var bb = new ytcenter.io.BlobBuilder();
    bb.append(VALIDATOR_STRING + settingsPool.value);
    ytcenter.io.saveAs(bb.getBlob("text/plain"), "ytcenter-settings.ytcs");
  }, false);
  
  content.appendChild(exportFileButton);
  
  return {
    element: elm,
    bind: function(){},
    update: function(){}
  };
};