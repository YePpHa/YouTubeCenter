function xhr(details) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function(){
    var responseState = {
      responseXML: (xmlhttp.readyState == 4 ? xmlhttp.responseXML : ''),
      responseText: (xmlhttp.readyState == 4 ? xmlhttp.responseText : ''),
      readyState: xmlhttp.readyState,
      responseHeaders: (xmlhttp.readyState == 4 ? xmlhttp.getAllResponseHeaders() : ''),
      status: (xmlhttp.readyState == 4 ? xmlhttp.status : 0),
      statusText: (xmlhttp.readyState == 4 ? xmlhttp.statusText : ''),
      finalUrl: (xmlhttp.readyState == 4 ? xmlhttp.finalUrl : '')
    };
    if (details["onreadystatechange"]) {
      details["onreadystatechange"](responseState);
    }
    if (xmlhttp.readyState == 4) {
      if (details["onload"] && xmlhttp.status >= 200 && xmlhttp.status < 300) {
        details["onload"](responseState);
      }
      if (details["onerror"] && (xmlhttp.status < 200 || xmlhttp.status >= 300)) {
        details["onerror"](responseState);
      }
    }
  };
  try {
    xmlhttp.open(details.method, details.url);
  } catch(e) {
    if(details["onerror"]) {
      details["onerror"]({responseXML:'',responseText:'',readyState:4,responseHeaders:'',status:403,statusText:'Forbidden'});
    }
    return false;
  }
  if (details.headers) {
    for (var prop in details.headers) {
      xmlhttp.setRequestHeader(prop, details.headers[prop]);
    }
  }
  xmlhttp.send((typeof(details.data) != 'undefined') ? details.data : null);
  return true;
}

function getXHRCaller(e, action, id){
  return function(response){ sendMessage(e, { id: id, arguments: [response] }); };
}

function handleXHR(e, details) {
  if (details.onreadystatechange) {
    details.onreadystatechange = getXHRCaller(e, "xhr onreadystatechange", details.onreadystatechange);
  }
  if (details.onload) {
    details.onload = getXHRCaller(e, "xhr onload", details.onload);
  }
  if (details.onerror) {
    details.onerror = getXHRCaller(e, "xhr onerror", details.onerror);
  }
  xhr(details);
}

function save(e, id, key, value) {
  widget.preferences.setItem(key, JSON.stringify(value));
  sendMessage(e, {
    id: id,
    arguments: []
  });
}

function load(e, id, key) {
  var value = JSON.parse(widget.preferences.getItem(key) || "{}");
  
  sendMessage(e, {
    id: id,
    arguments: [value]
  });
}

function sendMessage(e, msg) {
  msg.level = "safe";
  e.source.postMessage(JSON.stringify(msg));
}

opera.extension.onmessage = function(e) {
  if (!e || !e.data) return; // Checking if data is present
  if (typeof e.data !== "string") return; // Checking if the object is a string.
  if (!e.data.indexOf || e.data.indexOf("{") !== 0) return;
  
  var d = JSON.parse(e.data);
  
  if (d.method === "xhr") {
    handleXHR(e, d.arguments[0]); // event, details
  } else if (d.method === "save") {
    save(e, d.id, d.arguments[0], d.arguments[1]); // event, id, key, data
  } else if (d.method === "load") {
    load(e, d.id, d.arguments[0]); // event, id, key
  }
};