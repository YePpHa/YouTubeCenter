var {callUnsafeJSObject, isWindowClosed} = require("utils");

function sendRequest(wrappedContentWin, sandbox, details) {
  let req = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Ci.nsIXMLHttpRequest);
  let addEventReq = addEventListener.bind(this, wrappedContentWin, req);
  
  details = Cu.waiveXrays(details);
  
  addEventReq("abort", details);
  addEventReq("error", details);
  addEventReq("load", details);
  addEventReq("progress", details);
  addEventReq("readystatechange", details);
  addEventReq("timeout", details);
  if (details.upload) {
    let addEventReqUpload = addEventListener.bind(this, wrappedContentWin, req.upload);
    addEventReqUpload("abort", details);
    addEventReqUpload("error", details);
    addEventReqUpload("load", details);
    addEventReqUpload("progress", details);
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
    let headers = details.headers;
    for (let prop in headers) {
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
  
  var exposedVariable = {
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
    exposedVariable.finalUrl = req.finalUrl;
    exposedVariable.readyState = req.readyState;
    exposedVariable.responseHeaders = req.getAllResponseHeaders();
    exposedVariable.responseText = req.responseText;
    exposedVariable.status = req.status;
    exposedVariable.statusText = req.statusText;
  }
  return exposedVariable;
}

function addEventListener(wrappedContentWin, req, event, details){
  function eventListener(evt) {
    // If details isn't available then cancel this.
    if (typeof details === "undefined") return;
    
    var responseState = {
      __exposedProps__: {
        context: "r",
        finalUrl: "r",
        lengthComputable: "r",
        loaded: "r",
        readyState: "r",
        response: "r",
        responseHeaders: "r",
        responseText: "r",
        status: "r",
        statusText: "r",
        total: "r"
      },
      context: details.context || null,
      response: req.response,
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
    
    if (isWindowClosed(wrappedContentWin)) return; /* The window is closed and therefore it should not be called! */
    
    var eventCallback = details["on" + event];
    
    new XPCNativeWrapper(wrappedContentWin, "setTimeout()")
        .setTimeout(function(){ eventCallback.call(details, responseState) }, 0);
  }
  
  if (typeof details === "undefined") return;
  if (typeof details["on" + event] !== "number" && typeof details["on" + event] !== "function") return;
  
  req.addEventListener(event, eventListener, false);
}

exports["sendRequest"] = sendRequest;