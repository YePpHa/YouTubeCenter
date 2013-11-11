var DESCRIPTION = "YouTubeCenterService",
    CONTRACTID = "@ytcenter/ytcenter-service;1",
    CLASSID = Components.ID("{dc8e2fcd-e5a7-4ff2-aac6-9949399bc54c}"),
    
    Cc = Components.classes,
    Ci = Components.interfaces,
    Cu = Components.utils,
    startupHasRun = false;

Cu.import("resource://ytcenter/third-party/getChromeWinForContentWin.js");
Cu.import("resource://ytcenter/request.js");
Cu.import("resource://ytcenter/storage2.js");
Cu.import("resource://ytcenter/session.js");
Cu.import("resource://ytcenter/utils/bind.js");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://gre/modules/Services.jsm");

var sandbox_storage = new Storage(),
    session_storage = new Session();

function createSandbox(wrappedContentWin, chromeWin) {
  var sandbox = new Components.utils.Sandbox(
    wrappedContentWin, {
      "sandboxName": "YouTube Center",
      "sandboxPrototype": wrappedContentWin,
      "wantXrays": true,
    }
  );
  sandbox.unsafeWindow = wrappedContentWin.wrappedJSObject;
  sandbox.request = bind(new Request(wrappedContentWin, chromeWin), "sendRequest");
  
  sandbox.storage_setValue = bind(sandbox_storage, "setValue");
  sandbox.storage_getValue = bind(sandbox_storage, "getValue");
  sandbox.storage_listValues = bind(sandbox_storage, "listValues");
  sandbox.storage_exists = bind(sandbox_storage, "exists");
  sandbox.storage_remove = bind(sandbox_storage, "remove");
  sandbox.storage_addEventListener = bind(sandbox_storage, "addEventListener", wrappedContentWin);
  sandbox.storage_removeEventListener = bind(sandbox_storage, "removeEventListener", wrappedContentWin);
  
  sandbox.session_setValue = bind(session_storage, "setValue");
  sandbox.session_getValue = bind(session_storage, "getValue");
  sandbox.session_listValues = bind(session_storage, "listValues");
  sandbox.session_exists = bind(session_storage, "exists");
  sandbox.session_remove = bind(session_storage, "remove");
  sandbox.session_addEventListener = bind(session_storage, "addEventListener", wrappedContentWin);
  sandbox.session_removeEventListener = bind(session_storage, "removeEventListener", wrappedContentWin);
  
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
  if (/^http(s)?:\/\/apis.google\.com\//.test(url + "/"))
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

service.prototype.runYouTubeCenter = function(wrappedContentWin){
  var sandbox = createSandbox(wrappedContentWin, getChromeWinForContentWin(wrappedContentWin));
  Services.scriptloader.loadSubScript("chrome://ytcenter/content/YouTubeCenter.user.js", sandbox, "UTF-8");
};

var NSGetFactory = XPCOMUtils.generateNSGetFactory([service]);