var DESCRIPTION = "YouTubeCenterService",
    CONTRACTID = "@ytcenter/ytcenter-service;1",
    CLASSID = Components.ID("{dc8e2fcd-e5a7-4ff2-aac6-9949399bc54c}"),
    
    Cc = Components.classes,
    Ci = Components.interfaces,
    Cu = Components.utils,
    maxJSVersion = "ECMAv5",
    startupHasRun = false;
Cu.import("resource://ytcenter/third-party/getChromeWinForContentWin.js");
Cu.import("resource://ytcenter/utils/xmlhttprequest.js");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://gre/modules/Services.jsm");

function createSandbox(contentWindow) {
  var sandbox = new Components.utils.Sandbox(contentWindow, {
    'sandboxPrototype': contentWindow,
    'wantXrays': true,
  });
  sandbox.unsafeWindow = contentWindow.wrappedJSObject;
  return sandbox;
}
function contentLoad(e) {
  e.target.defaultView.removeEventListener('DOMContentLoaded', contentLoad, true);
  e.target.defaultView.removeEventListener('load', contentLoad, true);
}
function startup(s) {
  if (startupHasRun) return;
  startupHasRun = true;

  var observerService = Components.classes['@mozilla.org/observer-service;1']
     .getService(Components.interfaces.nsIObserverService);
  observerService.addObserver(s, 'document-element-inserted', false);
}

function isRunnable(url) {
  if (/^http(s)?:\/\/(((.*?)\.youtube\.com\/)|youtube\.com\/)/.test(url + "/"))
    return true;
  return false;
}

function service() {
  this.contentLoad = contentLoad;
  this.filename = Components.stack.filename;
  this.wrappedJSObject = this;
}

/* CONSTANTS */
service.prototype.classDescription = DESCRIPTION;
service.prototype.classID = CLASSID;
service.prototype.contractID = CONTRACTID;
service.prototype._xpcom_categories = [{
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
service.prototype.QueryInterface = XPCOMUtils.generateQI([
  Ci.nsIObserver,
  Ci.nsISupports,
  Ci.nsISupportsWeakReference,
  Ci.gmIGreasemonkeyService,
  Ci.nsIWindowMediatorListener,
  Ci.nsIContentPolicy
]);

service.prototype.shouldLoad = function(ct, cl, org, ctx, mt, ext) {
  return Ci.nsIContentPolicy.ACCEPT;
}

service.prototype.shouldProcess = function(ct, cl, org, ctx, mt, ext) {
  return Ci.nsIContentPolicy.ACCEPT;
};

service.prototype.observe = function(aSubject, aTopic, aData) {
  switch (aTopic) {
    case 'app-startup':
    case 'profile-after-change':
      startup(this);
      break;
    case 'document-element-inserted':
      var doc = aSubject;
      var win = doc && doc.defaultView;
      if (!doc || !doc.location || !win) break;
      if (isRunnable(doc.location.href)) {
        this.runYouTubeCenter(win);
      }
      break;
  }
};

service.prototype.runYouTubeCenter = function(wrappedContentWindow){
  var sandbox = createSandbox(wrappedContentWindow);
  Services.scriptloader.loadSubScript("chrome://ytcenter/content/YouTubeCenter.user.js", sandbox, "UTF-8");
};

var NSGetFactory = XPCOMUtils.generateNSGetFactory([service]);