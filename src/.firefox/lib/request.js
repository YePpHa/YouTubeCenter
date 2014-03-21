var {bind, isWindowClosed} = require("utils");

function Request(wrappedContentWin, chromeWindow) {
  this.wrappedContentWin = wrappedContentWin;
  this.chromeWindow = chromeWindow;
}

Request.prototype.sendRequest = function(details){
  var req = new this.chromeWindow.XMLHttpRequest(),
      ael = bind(this, "addEventListener", this.wrappedContentWin);
  
  ael(req, "abort", details);
  ael(req, "error", details);
  ael(req, "load", details);
  ael(req, "progress", details);
  ael(req, "readystatechange", details);
  ael(req, "timeout", details);
  if (details.upload) {
    ael(req.upload, "abort", details);
    ael(req.upload, "error", details);
    ael(req.upload, "load", details);
    ael(req.upload, "progress", details);
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
  
  var rv = {
    __exposedProps__: {
      finalUrl: "r",
      readyState: "r",
      responseHeaders: "r",
      responseText: "r",
      status: "r",
      statusText: "r",
      abort: "r"
    },
    abort: function(){
      return req.abort();
    }
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

Request.prototype.addEventListener = function(wrappedContentWin, req, event, details){
  if (!details["on" + event]) return;
  
  req.addEventListener(event, function(evt){
    var responseState = {
      __exposedProps__: {
          context: "r",
          finalUrl: "r",
          lengthComputable: "r",
          loaded: "r",
          readyState: "r",
          responseHeaders: "r",
          responseText: "r",
          status: "r",
          statusText: "r",
          total: "r"
          },
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
        if (req.readyState !== 4) break;
        responseState.responseHeaders = req.getAllResponseHeaders();
        responseState.status = req.status;
        responseState.statusText = req.statusText;
        responseState.finalUrl = req.channel.URI.spec;
        break;
    }

    if (isWindowClosed(wrappedContentWin)) {
      return;
    }
    
    new XPCNativeWrapper(wrappedContentWin, "setTimeout").setTimeout(function(){
      details["on" + event](responseState);
    }, 0);
  }, false);
};

exports["Request"] = Request;