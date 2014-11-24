Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://gre/modules/Services.jsm");

var DESCRIPTION = "YouTube Center Startup Service";
var CONTRACTID = "@ytcenter/ytcenter-startup-service;1";
var CLASSID = Components.ID("{338b51a4-0709-4971-ac89-18e82be90a93}");

var startupRun = false;

function startup(aService) {
  if (startupRun) return;
  startupRun = true;

  var messageManager = Cc["@mozilla.org/globalmessagemanager;1"].getService(Ci.nsIMessageListenerManager);
  messageManager.loadFrameScript("resource://ytcenter/libs/framescript.js", true);
}

function StartupService() { }

StartupService.prototype.init = function(){
  let registrar = Components.manager.QueryInterface(Ci.nsIComponentRegistrar);
  registrar.registerFactory(this.classID, this.classDescription, this.contractID, this);
  
  let catMan = Cc['@mozilla.org/categorymanager;1'].getService(Ci.nsICategoryManager);
  for each (let category in this.xpcom_categories)
    catMan.addCategoryEntry(category, this.contractID, this.contractID, false, true);

  Services.obs.addObserver(this, "document-element-inserted", true);
  Services.obs.addObserver(this, "xpcom-category-entry-removed", true);
  Services.obs.addObserver(this, "xpcom-category-cleared", true);
};
StartupService.prototype.unload = function(){
  let registrar = Components.manager.QueryInterface(Ci.nsIComponentRegistrar);
  
  var observerService = Services.obs;
  
  Services.obs.removeObserver(this, "document-element-inserted");
  Services.obs.removeObserver(this, "xpcom-category-entry-removed");
  Services.obs.removeObserver(this, "xpcom-category-cleared");

  let catMan = Cc["@mozilla.org/categorymanager;1"].getService(Ci.nsICategoryManager);
  for each (let category in this.xpcom_categories)
    catMan.deleteCategoryEntry(category, this.contractID, false);
  
  Services.tm.currentThread.dispatch(function(){
    registrar.unregisterFactory(this.classID, this);
  }.bind(this), Ci.nsIEventTarget.DISPATCH_NORMAL);
};

StartupService.prototype.classDescription = DESCRIPTION;
StartupService.prototype.classID = CLASSID;
StartupService.prototype.contractID = CONTRACTID;
StartupService.prototype.QueryInterface = XPCOMUtils.generateQI([
  Ci.nsIObserver,
  Ci.nsISupports,
  Ci.nsISupportsWeakReference,
  Ci.nsIWindowMediatorListener,
  Ci.nsIContentPolicy
]);
StartupService.prototype.xpcom_categories = ["content-policy"];
StartupService.prototype.shouldLoad = function(contentType, contentLocation, requestOrigin, node, mimeTypeGuess, extra) {
  return Ci.nsIContentPolicy.ACCEPT;
};
StartupService.prototype.shouldProcess = function(contentType, contentLocation, requestOrigin, insecNode, mimeType, extra) {
  return Ci.nsIContentPolicy.ACCEPT;
};

StartupService.prototype.observe = function(subject, topic, data, additional) {
  switch (topic) {
    case "document-element-inserted":
      startup(this);
      break;
    case "xpcom-category-entry-removed":
    case "xpcom-category-cleared": {
      let category = data;
      if (this.xpcom_categories.indexOf(category) < 0)
        return;
      if (topic == "xpcom-category-entry-removed" && subject instanceof Ci.nsISupportsCString && subject.data != this.contractID)
        return;
      let catMan = Cc["@mozilla.org/categorymanager;1"].getService(Ci.nsICategoryManager);;
      catMan.addCategoryEntry(category, this.contractID, this.contractID, false, true);
      break;
    }
  }
};
StartupService.prototype.createInstance = function(outer, id) {
  if (outer)
    throw Cr.NS_ERROR_NO_AGGREGATION;
  return this.QueryInterface(id);
};

exports["StartupService"] = StartupService;
exports["startup"] = startup;