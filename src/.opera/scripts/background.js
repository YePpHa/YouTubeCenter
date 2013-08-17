function xhr(details) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function(){
    var responseState = {
      responseXML:(xmlhttp.readyState == 4 ? xmlhttp.responseXML : ''),
      responseText:(xmlhttp.readyState == 4 ? xmlhttp.responseText : ''),
      readyState:xmlhttp.readyState,
      responseHeaders:(xmlhttp.readyState == 4 ? xmlhttp.getAllResponseHeaders() : ''),
      status:(xmlhttp.readyState == 4 ? xmlhttp.status : 0),
      statusText:(xmlhttp.readyState == 4 ? xmlhttp.statusText : '')
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

opera.extension.onmessage = function(e) {
  if (e.data.action === "xhr") {
    var id = e.data.id,
        details = e.data.details;
    if (details.onreadystatechange) {
      details.onreadystatechange = function(response){
        e.source.postMessage({
          action: 'xhr onreadystatechange',
          id: id,
          response: response
        });
      };
    }
    if (details.onload) {
      details.onload = function(response){
        e.source.postMessage({
          action: 'xhr onload',
          id: id,
          response: response
        });
      };
    }
    if (details.onerror) {
      details.onerror = function(response){
        e.source.postMessage({
          action: 'xhr onerror',
          id: id,
          response: response
        });
      };
    }
    xhr(details);
  } else if (e.data.action === "save") {
    widget.preferences.setItem(e.data.name, e.data.value);
  } else if (e.data.action === "load") {
    console.log("[Opera] Load Storage => " + e.data.name);
    var s = widget.preferences.getItem(e.data.name);
    if (!s) s = "{}";
    e.source.postMessage({
      action: 'load callback',
      id: e.data.id,
      storage: s
    });
  } else {
    console.error("[Opera background.js] Unknown action (" + e.data.action + ")");
  }
};