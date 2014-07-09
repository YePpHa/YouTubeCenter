var {callUnsafeJSObject} = require("utils");

function sendRequest(wrappedContentWin, chromeWin, sandbox, details) {
  let req = new chromeWin.XMLHttpRequest();
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
  if (typeof details["on" + event] !== "number" && typeof details["on" + event] !== "function") return;
  
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
    callUnsafeJSObject(wrappedContentWin, details["on" + event], responseState);
  }, false);
}

exports["sendRequest"] = sendRequest;