Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");

const ioService = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
const scriptableInputStream = Components.classes["@mozilla.org/scriptableinputstream;1"].getService(Components.interfaces.nsIScriptableInputStream);
const unicodeConverter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Components.interfaces.nsIScriptableUnicodeConverter);

function createSandbox(contentWindow) {
  var sandbox = new Components.utils.Sandbox(contentWindow, {
    "sandboxName": "YouTube Center",
    "sandboxPrototype": contentWindow,
    "wantXrays": true
  });
  sandbox.unsafeWindow = contentWindow.wrappedJSObject;
  
  return sandbox;
}

function loadContent(file) {
  var channel, is, script;
  unicodeConverter.charset = "UTF-8";
  channel = ioService.newChannelFromURI(urlToURI(file));
  try {
    is = channel.open();
  } catch (e) {
    return;
  }
  scriptableInputStream.init(is);
  script = scriptableInputStream.read(is.available());
  scriptableInputStream.close();
  is.close();
  try {
    return unicodeConverter.ConvertToUnicode(script);
  } catch (e) {
    throw e;
    return script;
  }
}

function createChromeWindow(win) {
  return aContentWin
      .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
      .getInterface(Components.interfaces.nsIWebNavigation)
      .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
      .rootTreeItem
      .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
      .getInterface(Components.interfaces.nsIDOMWindow)
      .QueryInterface(Components.interfaces.nsIDOMChromeWindow);
}

function runYouTubeCenter(url, contentWindow) {
  var sandbox = createSandbox(contentWindow),
      fileURL = "resource://ytcenter-data/ytcenter.js",
      script = loadContent(fileURL);
  try {
    Components.utils.evalInSandbox(script, sandbox, "ECMAv5", fileURL, 1);
  } catch (e) {
    throw e;
  }
}

function checkURLScheme(url) {
  var scheme = ioService.extractScheme(url);
  if (scheme === "http" || scheme === "https") return true;
  return false;
}

function checkURL(url) {
  if (!checkURLScheme(url))
    return false;
  var uri = urlToURI(url);
  if (!/^(http|https):\/\/(.*?)\.youtube\.com\//.test(url) && !/^(http|https):\/\/(.*?)\.youtube\.com$/.test(url))
    return false;
  return true;
}

function urlToURI(url, base) {
  var baseURI;
  if (typeof base === "string") {
    baseURI = urlToURI(base);
  } else if (base) {
    baseURI = base;
  }
  try {
    return ioService.newURI(url, null, baseUri);
  } catch (e) {
    throw e;
    return null;
  }
}

function service() {
  this.filename = Components.stack.filename;
  this.wrappedJSObject = this;
}
service.prototype.shouldLoad = function(a, b, c, d, e, f){
  return Ci.nsIContentPolicy.ACCEPT;
};
service.prototype.shouldProcess = function(a, b, c, d, e, f) {
  return Ci.nsIContentPolicy.ACCEPT;
};

service.prototype.observe = function(doc, method, data){
  var contentWin,
      url;
  if (method !== "document-element-inserted") return;
  contentWin = doc && doc.defaultView;
  if (!doc || !doc.location || !contentWin) return;
  url = contentWin.document.location.href;
  
  if (!checkURL(url))
    return;
  
  runYouTubeCenter(url, contentWin);
};

var NSGetFactory = XPCOMUtils.generateNSGetFactory([service]);