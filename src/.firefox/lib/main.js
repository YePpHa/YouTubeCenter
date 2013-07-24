const data = require("self").data;
const Request = require("request").Request;
const PageMod = require("page-mod").PageMod;

var xhr = function(details){
  try {
    var req = Request(details);
    if (details.method === "POST") {
      req.post();
    } else if (details.method === "PUT") {
      req.put();
    } else {
      req.get();
    }
  } catch (e) {
    details.onerror();
  }
};
var workers = [];
var page = PageMod({
  include: "*",
  contentScriptWhen: "start",
  contentScriptFile: data.url("YouTubeCenter.user.js")/*,
  onAttach: function(worker){
    workers.push(worker);
    worker.on("detach", function() {
      var index = workers.indexOf(worker);
      if (index >= 0) workers.splice(index, 1);
    });
    *//*worker.port.on("xhr", function(details){
      try {
        if (details.onload) {
          details.onComplete = function(response){
            worker.port.emit("xhr_onload", JSON.stringify({id: details.__id, text: response.text}));
          };
        }
        if (details.onerror) {
          details.onerror = function(response){
            worker.port.emit("xhr_onerror", JSON.stringify({id: details.__id, text: response.text}));
          };
        }
        if (details.onreadystatechange) {
          details.onreadystatechange = function(response){
            worker.port.emit("xhr_onreadystatechange", JSON.stringify({id: details.__id, text: response.text}));
          };
        }
        xhr(details);
      }
      console.log(details);
    });*//*
  }*/
});

