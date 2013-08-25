var EXPORTED_SYMBOLS = ['XHR'];

Components.utils.import("resource://ytcenter/utils/isWindowClosed.js");

function XHR(wrappedContentWin, chromeWindow) {
  this.wrappedContentWin = wrappedContentWin;
  this.chromeWindow = chromeWindow;
}

XHR.prototype.contentStartRequest = function(details) {
  var req = new this.chromeWindow.XMLHttpRequest();
  this.chromeStartRequest(details, req);

  var rv = {
    abort: function () { return req.abort(); }
  };
  if (!!details.synchronous) {
    rv.finalUrl = req.finalUrl;
    rv.readyState = req.readyState;
    rv.responseHeaders = req.getAllResponseHeaders();
    rv.responseText = req.responseText;
    rv.status = req.status;
    rv.statusText = req.statusText;
  }
  return rv;
};

XHR.prototype.chromeStartRequest = function(details, req) {
  this.setupRequestEvent(this.wrappedContentWin, req, "abort", details);
  this.setupRequestEvent(this.wrappedContentWin, req, "error", details);
  this.setupRequestEvent(this.wrappedContentWin, req, "load", details);
  this.setupRequestEvent(this.wrappedContentWin, req, "progress", details);
  this.setupRequestEvent(this.wrappedContentWin, req, "readystatechange", details);
  this.setupRequestEvent(this.wrappedContentWin, req, "timeout", details);
  if (details.upload) {
    this.setupRequestEvent(this.wrappedContentWin, req.upload, "abort", details);
    this.setupRequestEvent(this.wrappedContentWin, req.upload, "error", details);
    this.setupRequestEvent(this.wrappedContentWin, req.upload, "load", details);
    this.setupRequestEvent(this.wrappedContentWin, req.upload, "progress", details);
  }

  req.mozBackgroundRequest = !!details.mozBackgroundRequest;

  req.open(details.method, details.url, !details.synchronous, "", "");

  if (details.overrideMimeType) {
    req.overrideMimeType(details.overrideMimeType);
  }
  if (details.timeout) {
    req.timeout = details.timeout;
  }
  if (details.headers) {
    var headers = details.headers;
    for (var prop in headers) {
      if (Object.prototype.hasOwnProperty.call(headers, prop)) {
        req.setRequestHeader(prop, headers[prop]);
      }
    }
  }

  var body = details.data ? details.data : null;
  if (details.binary) {
    req.sendAsBinary(body);
  } else {
    req.send(body);
  }
};

XHR.prototype.setupRequestEvent = function(wrappedContentWin, req, event, details) {
  if (!details["on" + event]) return;

  req.addEventListener(event, function(evt) {
    var responseState = {
      context: details.context || null,
      responseText: req.responseText,
      readyState: req.readyState,
      responseHeaders: null,
      status: null,
      statusText: null,
      finalUrl: null
    };

    switch (event) {
      case "progress":
        responseState.lengthComputable = evt.lengthComputable;
        responseState.loaded = evt.loaded;
        responseState.total = evt.total;
        break;
      case "error":
        break;
      default:
        if (4 != req.readyState) break;
        responseState.responseHeaders = req.getAllResponseHeaders();
        responseState.status = req.status;
        responseState.statusText = req.statusText;
        responseState.finalUrl = req.channel.URI.spec;
        break;
    }

    if (isWindowClosed(wrappedContentWin)) {
      return;
    }
    
    wrappedContentWin.setTimeout(function(){ details["on" + event](responseState); }, 0);
  }, false);
};
