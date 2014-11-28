var {getHiddenWindow} = require("utils");

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

module.metadata = {
  "stability": "experimental"
};

const { Ci } = require("chrome");
const XUL = 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul';

function eventTarget(frame) {
  return getDocShell(frame).chromeEventHandler;
}
exports.eventTarget = eventTarget;

function getDocShell(frame) {
  let { frameLoader } = frame.QueryInterface(Ci.nsIFrameLoaderOwner);
  return frameLoader && frameLoader.docShell;
}
exports.getDocShell = getDocShell;

/**
 * Creates a XUL `browser` element in a privileged document.
 * @params {nsIDOMDocument} document
 * @params {String} options.type
 *    By default is 'content' for possible values see:
 *    https://developer.mozilla.org/en/XUL/iframe#a-browser.type
 * @params {String} options.uri
 *    URI of the document to be loaded into created frame.
 * @params {Boolean} options.remote
 *    If `true` separate process will be used for this frame, also in such
 *    case all the following options are ignored.
 * @params {Boolean} options.allowAuth
 *    Whether to allow auth dialogs. Defaults to `false`.
 * @params {Boolean} options.allowJavascript
 *    Whether to allow Javascript execution. Defaults to `false`.
 * @params {Boolean} options.allowPlugins
 *    Whether to allow plugin execution. Defaults to `false`.
 */
function create(target, options) {
  target = target instanceof Ci.nsIDOMDocument ? target.documentElement :
           target instanceof Ci.nsIDOMWindow ? target.document.documentElement :
           target;
  options = options || {};
  let remote = options.remote || false;
  let namespaceURI = options.namespaceURI || XUL;
  let isXUL = namespaceURI === XUL;
  let nodeName = isXUL && options.browser ? 'browser' : 'iframe';
  let document = target.ownerDocument;

  let frame = document.createElementNS(namespaceURI, nodeName);
  // Type="content" is mandatory to enable stuff here:
  // http://mxr.mozilla.org/mozilla-central/source/content/base/src/nsFrameLoader.cpp#1776
  frame.setAttribute('type', options.type || 'content');
  frame.setAttribute('src', options.uri || 'about:blank');

  target.appendChild(frame);

  // Load in separate process if `options.remote` is `true`.
  // http://mxr.mozilla.org/mozilla-central/source/content/base/src/nsFrameLoader.cpp#1347
  if (remote) {
    if (isXUL) {
      // We remove XBL binding to avoid execution of code that is not going to
      // work because browser has no docShell attribute in remote mode
      // (for example)
      frame.setAttribute('style', '-moz-binding: none;');
      frame.setAttribute('remote', 'true');
    }
    else {
      frame.QueryInterface(Ci.nsIMozBrowserFrame);
      frame.createRemoteFrameLoader(null);
    }
  }



  // If browser is remote it won't have a `docShell`.
  if (!remote) {
    let docShell = getDocShell(frame);
    docShell.allowAuth = options.allowAuth || false;
    docShell.allowJavascript = options.allowJavascript || false;
    docShell.allowPlugins = options.allowPlugins || false;

    // Control whether the document can move/resize the window. Requires
    // recently added platform capability, so we test to avoid exceptions
    // in cases where capability is not present yet.
    if ("allowWindowControl" in docShell && "allowWindowControl" in options)
      docShell.allowWindowControl = !!options.allowWindowControl;
  }

  return frame;
}
exports.create = create;

function swapFrameLoaders(from, to)
  from.QueryInterface(Ci.nsIFrameLoaderOwner).swapFrameLoaders(to)
exports.swapFrameLoaders = swapFrameLoaders;


let hiddenWindow = getHiddenWindow();

// Once Bug 565388 is fixed and shipped we'll be able to make invisible,
// permanent docShells. Meanwhile we create hidden top level window and
// use it's docShell.
let frame = makeFrame(hiddenWindow.document, {
  nodeName: "iframe",
  namespaceURI: "http://www.w3.org/1999/xhtml",
  allowJavascript: true,
  allowPlugins: true
})
let docShell = getDocShell(frame);
let eventTarget = docShell.chromeEventHandler;

// We need to grant docShell system principals in order to load XUL document
// from data URI into it.
docShell.createAboutBlankContentViewer(Cc["@mozilla.org/systemprincipal;1"].
                     createInstance(Ci.nsIPrincipal));

// Get a reference to the DOM window of the given docShell and load
// such document into that would allow us to create XUL iframes, that
// are necessary for hidden frames etc..
let window = docShell.contentViewer.DOMDocument.defaultView;
window.location = "data:application/vnd.mozilla.xul+xml;charset=utf-8,<window/>";

// Create a promise that is delivered once add-on window is interactive,
// used by add-on runner to defer add-on loading until window is ready.
let { promise, resolve } = defer();
eventTarget.addEventListener("DOMContentLoaded", function handler(event) {
  eventTarget.removeEventListener("DOMContentLoaded", handler, false);
  resolve();
}, false);



exports.ready = promise;
exports.window = window;

// Still close window on unload to claim memory back early.
unload(function() {
  window.close()
  frame.parentNode.removeChild(frame);
});
