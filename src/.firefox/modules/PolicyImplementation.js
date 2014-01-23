var EXPORTED_SYMBOLS = ['PolicyImplementation'];
const Cc = Components.classes,
      Ci = Components.interfaces,
      Cu = Components.utils;

Cu.import("resource://ytcenter/modules/utils/runAsync.js");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://gre/modules/Services.jsm");

function PolicyImplementation(scriptUrl, sandbox) {
  this.sandbox = sandbox;
  this.classDescription = "YouTube Center Policy Implementation";
  this.classID = Components.ID("{338b51a4-0709-4971-ac89-18e82be90a93}");
  this.contractID = "@ytcenter/ytcenter-policy-service;1";
  this.xpcom_categories = ["app-startup", "content-policy"];
  this.scriptUrl = scriptUrl;
  this.startupHasRun = false;
  
  this._shutdown = null;
}
PolicyImplementation.prototype.init = function(){
  let registrar = Components.manager.QueryInterface(Ci.nsIComponentRegistrar);
  registrar.registerFactory(this.classID, this.classDescription, this.contractID, this);
  
  let catMan = Cc['@mozilla.org/categorymanager;1'].getService(Ci.nsICategoryManager);
  for each (let category in this.xpcom_categories)
    catMan.addCategoryEntry(category, this.contractID, this.contractID, false, true);

  Services.obs.addObserver(this, "app-startup", true);
  Services.obs.addObserver(this, "profile-after-change", true);
  Services.obs.addObserver(this, "document-element-inserted", true);
  Services.obs.addObserver(this, "xpcom-category-entry-removed", true);
  Services.obs.addObserver(this, "xpcom-category-cleared", true);
  this._shutdown = function(){
    Services.obs.removeObserver(this, "app-startup");
    Services.obs.removeObserver(this, "profile-after-change");
    Services.obs.removeObserver(this, "document-element-inserted");
    Services.obs.removeObserver(this, "xpcom-category-entry-removed");
    Services.obs.removeObserver(this, "xpcom-category-cleared");

    let catMan = Cc['@mozilla.org/categorymanager;1'].getService(Ci.nsICategoryManager);
    for each (let category in this.xpcom_categories)
      catMan.deleteCategoryEntry(category, this.contractID, false);
    
    Services.tm.currentThread.dispatch(function(){
      registrar.unregisterFactory(this.classID, this);
    }.bind(this), Ci.nsIEventTarget.DISPATCH_NORMAL);
  };
};
PolicyImplementation.prototype.shutdown = function(){
  if (this._shutdown !== null) {
    this._shutdown();
  }
};

PolicyImplementation.prototype.QueryInterface = XPCOMUtils.generateQI([Ci.nsIObserver, Ci.nsISupports, Ci.nsISupportsWeakReference, Ci.gmIGreasemonkeyService, Ci.nsIWindowMediatorListener, Ci.nsIContentPolicy]);
PolicyImplementation.prototype.shouldLoad = function(contentType, contentLocation, requestOrigin, node, mimeTypeGuess, extra) {
  return Ci.nsIContentPolicy.ACCEPT;
};
PolicyImplementation.prototype.shouldProcess = function(contentType, contentLocation, requestOrigin, insecNode, mimeType, extra) {
  return Ci.nsIContentPolicy.ACCEPT;
};
PolicyImplementation.prototype.startup = function() {
  if (this.startupHasRun) return;
  this.startupHasRun = true;
  Services.obs.addObserver(this, "document-element-inserted", false);
};

PolicyImplementation.prototype.observe = function(subject, topic, data, additional) {
  switch (topic) {
    case "app-startup":
    case "profile-after-change":
      this.startup();
      break;
    case "document-element-inserted":
      var doc = subject;
      var win = doc && doc.defaultView;
      if (!doc || !doc.location || !win) break;
      this.sandbox(this.scriptUrl, win, doc);
      break;
    case "xpcom-category-entry-removed":
    case "xpcom-category-cleared": {
      let category = data;
      if (this.xpcom_categories.indexOf(category) < 0)
        return;
      if (topic == "xpcom-category-entry-removed" && subject instanceof Ci.nsISupportsCString && subject.data != this.contractID)
        return;
      // Our category entry was removed, make sure to add it back
      let catMan = categoryManager;
      catMan.addCategoryEntry(category, this.contractID, this.contractID, false, true);
      break;
    }
  }
};
PolicyImplementation.prototype.createInstance = function(outer, iid) {
  if (outer)
    throw Cr.NS_ERROR_NO_AGGREGATION;
  return this.QueryInterface(iid);
};
