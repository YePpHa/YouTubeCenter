var EXPORTED_SYMBOLS = ['SandboxListener'],
    startupHasRun = false;

const Cc = Components.classes,
      Ci = Components.interfaces,
      Cu = Components.utils;

Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://gre/modules/Services.jsm");

function SandboxListener(url, sandbox) {
  function serviceStartup(service) {
    if (startupHasRun) return;
    startupHasRun = true;

    var observerService = Cc['@mozilla.org/observer-service;1'].getService(Ci.nsIObserverService);
    observerService.addObserver(service, 'document-element-inserted', false);
  }
  this.service = createSandboxService();
  
  this.service.prototype.observe = function(aSubject, aTopic, aData) {
    switch (aTopic) {
      case 'app-startup':
      case 'profile-after-change':
        serviceStartup(this);
        break;
      case 'document-element-inserted':
        var doc = aSubject;
        var win = doc && doc.defaultView;
        if (!doc || !doc.location || !win) break;
        
        sandbox(url, win, doc);
        
        break;
    }
  };
}

SandboxListener.prototype.startup = function(){
  let registrar = Components.manager.QueryInterface(Ci.nsIComponentRegistrar);
  registrar.registerFactory(this.classID, this.classDescription, this.contractID, this);


};

SandboxListener.prototype.shutdown = function(){
  var NSGetFactory = XPCOMUtils.generateNSGetFactory([this.service]);
};
