Components.utils.import("resource://ytcenter/modules/PolicyImplementation.js");
Components.utils.import("resource://ytcenter/modules/Sandbox.js");

let sandbox = new Sandbox(
  [
    /^http(s)?:\/\/(((.*?)\.youtube\.com\/)|youtube\.com\/)/,
    /^http(s)?:\/\/((apis\.google\.com)|(plus\.googleapis\.com))\/([0-9a-zA-Z-_\/]+)\/widget\/render\/comments\?/
  ]
);
let policy = new PolicyImplementation(
  "chrome://ytcenter/content/YouTubeCenter.user.js",
  sandbox.loadScript.bind(sandbox)
);
policy.init();