// ==UserScript==
// @name            YouTube Center Developer Build
// @namespace       http://www.facebook.com/YouTubeCenter
// @version         361
// @author          Jeppe Rune Mortensen (YePpHa)
// @description     YouTube Center contains all kind of different useful functions which makes your visit on YouTube much more entertaining.
// @icon            https://raw.github.com/YePpHa/YouTubeCenter/master/assets/logo-48x48.png
// @icon64          https://raw.github.com/YePpHa/YouTubeCenter/master/assets/logo-64x64.png
// @domain          userscripts.org
// @domain          youtube.com
// @domain          www.youtube.com
// @domain          gdata.youtube.com
// @domain          apis.google.com
// @match           http://*.youtube.com/*
// @match           https://*.youtube.com/*
// @match           http://userscripts.org/scripts/source/114002.meta.js
// @match           http://s.ytimg.com/yts/jsbin/*
// @match           https://s.ytimg.com/yts/jsbin/*
// @match           https://github.com/YePpHa/YouTubeCenter/blob/master/devbuild.number
// @match           http://apis.google.com/*/widget/render/comments?*
// @match           https://apis.google.com/*/widget/render/comments?*
// @match           http://plus.googleapis.com/*/widget/render/comments?*
// @match           https://plus.googleapis.com/*/widget/render/comments?*
// @include         http://*.youtube.com/*
// @include         https://*.youtube.com/*
// @include         http://apis.google.com/*/widget/render/comments?*
// @include         https://apis.google.com/*/widget/render/comments?*
// @include         http://plus.googleapis.com/*/widget/render/comments?*
// @include         https://plus.googleapis.com/*/widget/render/comments?*
// @exclude         http://apiblog.youtube.com/*
// @exclude         https://apiblog.youtube.com/*
// @exclude         http://*.youtube.com/subscribe_embed?*
// @exclude         https://*.youtube.com/subscribe_embed?*
// @grant           GM_getValue
// @grant           GM_setValue
// @grant           GM_xmlhttpRequest
// @grant           GM_addStyle
// @grant           GM_log
// @grant           GM_registerMenuCommand
// @updateURL       https://github.com/YePpHa/YouTubeCenter/raw/master/dist/YouTubeCenter.meta.js
// @downloadURL     https://github.com/YePpHa/YouTubeCenter/raw/master/dist/YouTubeCenter.user.js
// @updateVersion   151
// @run-at          document-start
// @priority        9001
// ==/UserScript==