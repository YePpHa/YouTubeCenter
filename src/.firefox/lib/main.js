exports.main = function() {
  var data = require("self").data;
  require("page-mod").PageMod({
    include: "*",
    contentScriptWhen: "start",
    contentScriptFile: data.url("YouTubeCenter.user.js")
  });
};
