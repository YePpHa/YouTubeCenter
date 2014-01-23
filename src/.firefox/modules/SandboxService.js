var EXPORTED_SYMBOLS = ['getSandboxService'],
    DESCRIPTION = "YouTubeCenterService",
    CONTRACTID = "@ytcenter/ytcenter-service;1",
    CLASSID = Components.ID("{dc8e2fcd-e5a7-4ff2-aac6-9949399bc54c}");

const Cc = Components.classes,
      Ci = Components.interfaces,
      Cu = Components.utils;

Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://gre/modules/Services.jsm");

function getSandboxService() {
  function SandboxService() {
    this.filename = Components.stack.filename;
    this.wrappedJSObject = this;
  }
  
  this.classId = CLASSID;
  this.classDescription = DESCRIPTION;
  this.contractID = CONTRACTID;

  /* CONSTANTS */
  SandboxService.prototype.classDescription = DESCRIPTION;
  SandboxService.prototype.classID = CLASSID;
  SandboxService.prototype.contractID = CONTRACTID;
  SandboxService.prototype._xpcom_categories = [{
    category: "app-startup",
    entry: DESCRIPTION,
    value: CONTRACTID,
    service: true
  },{
    category: "content-policy",
    entry: CONTRACTID,
    value: CONTRACTID,
    service: true
  }];
  SandboxService.prototype.QueryInterface = XPCOMUtils.generateQI([
    Ci.nsIObserver,
    Ci.nsISupports,
    Ci.nsISupportsWeakReference,
    Ci.gmIGreasemonkeyService,
    Ci.nsIWindowMediatorListener,
    Ci.nsIContentPolicy
  ]);

  /* Required Functions */
  SandboxService.prototype.shouldLoad = function(ct, cl, org, ctx, mt, ext) {
    return Ci.nsIContentPolicy.ACCEPT;
  }

  SandboxService.prototype.shouldProcess = function(ct, cl, org, ctx, mt, ext) {
    return Ci.nsIContentPolicy.ACCEPT;
  };
  
  return SandboxService;
}