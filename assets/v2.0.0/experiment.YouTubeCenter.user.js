// ==UserScript==
// @name            YouTube Center
// @version         2.0.0
// @author          Jeppe Rune Mortensen (YePpHa)
// @description     YouTube Center contains all kind of different useful functions which makes your visit on YouTube much more entertaining.
// @match           http://*.youtube.com/*
// @match           https://*.youtube.com/*
// @updateVersion   200
// @run-at          document-start
// ==/UserScript==

/* Google Chrome UnsafeWindow */
if(window.navigator.vendor.match(/Google/)) {
  var div = document.createElement("div");
  div.setAttribute("onclick", "return window;");
  unsafeWindow = div.onclick();
};
/* GreaseKit friendly */
if(typeof GM_xmlhttpRequest === "undefined") {
	GM_xmlhttpRequest = function(/* object */ details) {
		details.method = details.method.toUpperCase() || "GET";
		if(!details.url) {
			throw("GM_xmlhttpRequest requires an URL.");
			return;
		}
		// build XMLHttpRequest object
		var oXhr, aAjaxes = [];
		if(typeof ActiveXObject !== "undefined") {
			var oCls = ActiveXObject;
			aAjaxes[aAjaxes.length] = {cls:oCls, arg:"Microsoft.XMLHTTP"};
			aAjaxes[aAjaxes.length] = {cls:oCls, arg:"Msxml2.XMLHTTP"};
			aAjaxes[aAjaxes.length] = {cls:oCls, arg:"Msxml2.XMLHTTP.3.0"};
		}
		if(typeof XMLHttpRequest !== "undefined")
			 aAjaxes[aAjaxes.length] = {cls:XMLHttpRequest, arg:undefined};
		for(var i=aAjaxes.length; i--; )
			try{
				oXhr = new aAjaxes[i].cls(aAjaxes[i].arg);
				if(oXhr) break;
			} catch(e) {}
		if(oXhr) {
			if("onreadystatechange" in details)
				oXhr.onreadystatechange = function() { details.onreadystatechange(oXhr) };
			if("onload" in details)
				oXhr.onload = function() { details.onload(oXhr) };
			if("onerror" in details)
				oXhr.onerror = function() { details.onerror(oXhr) };
			oXhr.open(details.method, details.url, true);
			if("headers" in details)
				for(var header in details.headers)
					oXhr.setRequestHeader(header, details.headers[header]);
			if("data" in details)
				oXhr.send(details.data);
			else
				oXhr.send();
		} else
			throw("This Browser is not supported, please upgrade.")
	}
}
if(typeof GM_addStyle === "undefined") {
	function GM_addStyle(/* String */ styles) {
		var oStyle = document.createElement("style");
		oStyle.setAttribute("type", "text\/css");
		oStyle.appendChild(document.createTextNode(styles));
		document.getElementsByTagName("head")[0].appendChild(oStyle);
	}
}
if(typeof GM_log === "undefined") {
	function GM_log(log) {
		if(console)
			console.log(log);
		else
			alert(log);
	}
}
/* END GreaseKit friendly */
var ytcenter = {};
ytcenter.version = "2.0.0";
ytcenter.video = {};
ytcenter.location = location.href;
ytcenter.locale = {};

ytcenter.locale.en = {};

ytcenter.video.type = {
  'FLV': 'video/x-flv',
  'MP4': 'video/mp4',
  'WebM': 'video/webm'
};
ytcenter.video.qualityImportance = ['small', 'medium', 'large', 'hd720', 'hd1080', 'highres'];
ytcenter.video.quality = {
  'small': {
    'name': 'Low Definition',
    'resolution': '240p'
  },
  'medium': {
    'name': 'Standard Definition',
    'resolution': '360p'
  },
  'large': {
    'name': 'Enhanced Definition',
    'resolution': '480p'
  },
  'hd720': {
    'name': 'High Definition',
    'resolution': '720p'
  },
  'hd1080': {
    'name': 'Full High Definition',
    'resolution': '1080p'
  },
  'highres': {
    'name': 'Original Definition',
    'resolution': 'Original'
  }
};
ytcenter.video.format = {};
ytcenter.video.streamInfo = {};
ytcenter.video.html5 = {};
ytcenter.video.html5.playable = [];
ytcenter.video.download = function(itag){
  if (!ytcenter.video.downloadFrame) {
    ytcenter.video.downloadFrame = document.createElement("iframe");
    ytcenter.video.downloadFrame.style.position = "absolute";
    ytcenter.video.downloadFrame.style.top = "-100px";
    ytcenter.video.downloadFrame.style.left = "-100px";
    ytcenter.video.downloadFrame.style.width = "1px";
    ytcenter.video.downloadFrame.style.height = "1px";
    ytcenter.video.downloadFrame.style.border = "0";
    ytcenter.video.downloadFrame.style.margin = "0";
    ytcenter.video.downloadFrame.style.padding = "0";
    document.body.appendChild(ytcenter.video.downloadFrame);
  }
  for (var i = 0; i < ytcenter.video.streamInfo.length; i++) {
    if (ytcenter.video.streamInfo[i].itag == itag) {
      if (ytcenter.video.title) {
        ytcenter.video.downloadFrame.setAttribute("src", ytcenter.video.streamInfo[i].url + "&title=" + encodeURLFile(ytcenter.video.title));
        return;
      } else {
        ytcenter.video.downloadFrame.setAttribute("src", ytcenter.video.streamInfo[i].url);
        return;
      }
    }
  }
  throw("Error in YouTube Center, couldn't find itag and therefore download couldn't be started!");
};

ytcenter.settings = mergeObjects({
  firstLaunch: true,
  theme: 'default',
  autoUpdateCheck: true,
  updateInterval: 86400, // Seconds
  lastUpdated: -1,
  autoQuality: 'large',
  language: 'en',
  volume: 100
}, loadSettings());
ytcenter.installedthemes = {
  'default': {
    elements: {
      'ytcentercontainer': {
        type: 'element',
        tagname: 'div',
        children: [ // names of elements
          'ytcentercontainerleft', 'ytcentercontainerright', 'clear'
        ],
        style: {
          'paddingBottom': '10px'
        }
      },
      'ytcentercontainerleft': {
        type: 'element',
        tagname: 'div',
        style: {
          'float': 'left'
        },
        children: ['test']
      },
      'ytcentercontainerright': {
        type: 'element',
        tagname: 'div',
        style: {
          'float': 'right'
        },
        children: ['repeatbuttongroup', 'downloadbuttongroup']
      },
      'clear': {
        type: 'element',
        tagname: 'div',
        style: {
          'clear': 'both'
        }
      },
      'test': {
        type: 'button', // div,button,buttongroup,menu,icon
        title: 'TEST_TOOLTIP', // Value of name of locale
        children: ['locale:TEST']
      },
      'downloadbuttongroup': {
        type: 'buttongroup',
        children: ['downloadfirstbutton', 'downloadlastbutton']
      },
      'downloadfirstbutton': {
        type: 'button',
        title: 'BUTTON_TOOLTIP_DOWNLOAD',
        children: ['locale:BUTTON_DOWNLOAD'],
        onclick: 'theme.functions.downloadPreferedFormat();' // eval
      },
      'downloadlastbutton': {
        type: 'button',
        title: 'BUTTON_TOOLTIP_DOWNLOADMENU',
        children: ['element:arrowdown', 'element:downloadmenu']
      },
      'repeatbuttongroup': {
        type: 'buttongroup',
        children: ['repeatrange', 'timerange', 'repeatbutton']
      },
      'repeatbutton': {
        type: 'button',
        title: 'BUTTON_TOOLTIP_REPEAT',
        children: ['element:repeaticon', 'locale:BUTTON_REPEAT'],
        toggleable: true,
        ontoggle: 'theme.functions.togglerepeat'
      },
      'repeatrange': {
        type: 'button',
        children: ['element:arrowleft'],
        onclick: 'theme.functions.showtimerange(this, e);',
        style: {
          overflow: 'none',
          width: '10px',
          position: 'relative',
          left: '21px'
        }
      },
      'timerangecontent': {
        type: 'element',
        tagname: 'span',
        children: ['timerange-input', 'timerange-sep', 'timerange-input'],
        className: 'yt-uix-button-content'
      },
      'timerange': {
        type: 'element',
        tagname: 'button',
        children: ['timerangecontent'],
        className: 'ytcenter_theme_expandrepeat yt-uix-button yt-uix-button-default',
        style: {
          visibility: 'hidden',
          width: '1px',
          paddingRight: '10px'
        }
      },
      'timerange-input': {
        type: 'element',
        tagname: 'input',
        attributes: {
          type: 'text'
        },
        style: {
          width: '40px'
        }
      },
      'timerange-sep': {
        type: 'element',
        tagname: 'span',
        attributes: {
          textContent: ' - '
        }
      },
      'arrowleft': {
        type: 'element',
        tagname: 'span',
        style: {
          position: 'absolute',
          left: '6px',
          top: '8px'
        },
        attributes: {
          textContent: '<'
        }
      },
      'arrowdown': {
        type: 'element',
        tagname: 'img',
        attributes: {
          src: '//s.ytimg.com/yt/img/pixel-vfl3z5WfW.gif'
        },
        style: {
          width: '0',
          height: '0',
          border: '1px solid transparent',
          borderWidth: '4px 4px 0',
          borderTopColor: '#555',
          marginTop: '-3px'
        }
      },
      'repeaticon': {
        type: 'element',
        tagname: 'img',
        attributes: {
          src: '//s.ytimg.com/yt/img/pixel-vfl3z5WfW.gif',
          alt: ''
        },
        style: {
          width: '20px',
          height: '18px',
          background: 'no-repeat url(//s.ytimg.com/yt/imgbin/www-master-vfl8ZHa_q.png) -303px -38px'
        },
        className: 'yt-uix-button-icon quimby_search_image'
      },
      'downloadmenu': {
        type: 'menu',
        children: ['function:buildDownloadMenuItems']
      }
    },
    placements: [
      {
        element: 'ytcentercontainer', // value is element name to be added
        method: 'insertBefore', // append, prepend, insertBefore, insertAfter
        target: '#watch-actions', // target is which element to append/prepend/insertBefore/insertAfter element to (#id, .class, tagname...)
      }
    ],
    locale: {
      'en': {
        'TEST': 'Test',
        'TEST_TOOLTIP': 'This is a test button',
        'BUTTON_DOWNLOAD': 'Download',
        'BUTTON_TOOLTIP_DOWNLOAD': 'Download <%ytcenter.video.quality[theme.functions.getPreferedFormat().quality].name%>, <%ytcenter.video.quality[theme.functions.getPreferedFormat().quality].resolution%> (<%theme.functions.getPreferedFormat().dimension%>) MP4',
        'BUTTON_TOOLTIP_DOWNLOADMENU': 'Show Format List',
        'BUTTON_TOOLTIP_REPEAT': 'Toggle Repeat',
        'BUTTON_REPEAT': 'Repeat',
        'BUTTON_TOOLTIP_REPEAT_OPTIONS': 'Repeat Options'
      }
    },
    settings: {
      preferedDownloadFormat: 'video/mp4',
      preferedDownloadResolution: 'highres'
    },
    functions: {
      downloadPreferedFormat: function(){
        var selected = 0;
        var importance = 0;
        for (var i = 0; i < ytcenter.video.format[theme.settings.preferedDownloadFormat].length; i++) {
          if (getQualityImportance(ytcenter.video.format[theme.settings.preferedDownloadFormat][i].quality) > importance) {
            importance = getQualityImportance(ytcenter.video.format[theme.settings.preferedDownloadFormat][i].quality);
            selected = i;
          }
        }
        ytcenter.video.download(ytcenter.video.format[theme.settings.preferedDownloadFormat][selected].itag);
      },
      getPreferedFormat: function(){
        var selected = 0;
        var importance = 0;
        for (var i = 0; i < ytcenter.video.format[theme.settings.preferedDownloadFormat].length; i++) {
          if (getQualityImportance(ytcenter.video.format[theme.settings.preferedDownloadFormat][i].quality) > importance) {
            importance = getQualityImportance(ytcenter.video.format[theme.settings.preferedDownloadFormat][i].quality);
            selected = i;
          }
        }
        return ytcenter.video.format[theme.settings.preferedDownloadFormat][selected];
      },
      buildDownloadMenuItems: function(){
        var elements = [];
        for (var key in ytcenter.video.format) {
          if (ytcenter.video.format.hasOwnProperty(key)) {
            var header = document.createElement("span");
            header.onclick = ";return false;";
            header.innerHTML = "<b>" + getFormatType(key) + "</b>";
            header.style.color = "#666";
            header.style.fontSize = "0.9166em";
            header.style.paddingLeft = "9px";
            elements.push(header);
          }
          for (var i = 0; i < ytcenter.video.format[key].length; i++) {
            var item = document.createElement("span");
            item.textContent = ytcenter.video.quality[ytcenter.video.format[key][i].quality].name + ", " + ytcenter.video.quality[ytcenter.video.format[key][i].quality].resolution + " (" + ytcenter.video.format[key][i].dimension + ")";
            item.className = "yt-uix-button-menu-item";
            item.setAttribute("data-itag", ytcenter.video.format[key][i].itag);
            item.addEventListener('click', function(){
              ytcenter.video.download(parseInt(this.getAttribute("data-itag")));
            }, false);
            elements.push(item);
          }
        }
        return elements;
      },
      togglerepeat: function(repeat){
        if (repeat) {
          theme.session.repeat = true;
        } else {
          theme.session.repeat = false;
        }
      },
      showtimerange: function(btn, e){
        if (!e) var e = window.event;
        if (e.target.nodeName == "INPUT") return;
        if (!theme.session.toggletimerange) {
          theme.session.toggletimerange = true;
          console.log("Show");
          btn.childNodes[0].textContent = ">";
          btn.nextElementSibling.style.visibility = "visible";
          btn.nextElementSibling.style.width = "139px";
        } else {
          theme.session.toggletimerange = false;
          console.log("Hide");
          btn.childNodes[0].textContent = "<";
          btn.nextElementSibling.style.visibility = "hidden";
          btn.nextElementSibling.style.width = "1px";
        }
      }
    },
    session: {
      repeat: false,
      repeatStartAt: 0,
      repeatEndAt: -1,
      toggletimerange: false
    },
    preload: function(){
      GM_addStyle(".ytcenter_theme_expandrepeat{-webkit-transition:all .2s linear;-moz-transition:all .2s linear;-o-transition:all .2s linear;-ms-transition:all .2s linear;transition:all .2s linear;}");
      unsafeWindow.setInterval(function(){
        var player = yt.getConfig('PLAYER_REFERENCE');
        /*if (player.getDuration) {
          var btn = document.getElementsByClassName("ytcenter_theme_expandrepeat")[0];
          var dur = player.getDuration();
          if (btn.childNodes[1].childNodes[0].value == "") {
            btn.childNodes[1].childNodes[0].value = "00:00";
            btn.childNodes[1].childNodes[2].value = (Math.floor(dur/60) < 10 ? "0" + Math.floor(dur/60) : Math.floor(dur/60)) + ":" + (parseInt((dur/60 - Math.floor(dur/60))*60) < 10 ? "0" + parseInt((dur/60 - Math.floor(dur/60))*60) : parseInt((dur/60 - Math.floor(dur/60))*60));
          }
        }*/
        if (player.playVideo) {
          if (theme.session.repeat) {
            if (theme.session.repeatEndAt == -1) {
              if (player.getPlayerState() == 0) {
                player.seekTo(theme.session.repeatStartAt, true);
                player.playVideo();
              }
            } else {
              if (player.getCurrentTime() >= theme.session.repeatEndAt) {
                player.seekTo(theme.session.repeatStartAt, true);
                player.playVideo();
              }
            }
          }
        }
      }, 50);
    }
  }
};
ytcenter.html5 = false;
var theme = ytcenter.installedthemes[ytcenter.settings.theme];
var yt = {};

if (location.href.match(/http(?:s)?:\/\/(?:.*?).youtube.com\/watch(?:.*?)/)) {
  document.addEventListener("DOMContentLoaded", function(){
    yt = unsafeWindow.yt; // Loading yt
    var movie = document.getElementById("movie_player");
    if (!movie) ytcenter.html5 = true;
    initYouTubePlayerArguments();
    initUI();
    if (theme.preload) {
      theme.preload();
    }
    if (movie) {
      initFlash();
    } else {
      initHTML5();
    }
    console.log(ytcenter);
  }, true);
}

function initUI() {
  var theme = ytcenter.installedthemes[ytcenter.settings.theme];
  var placements = theme.placements;
  
  for (var i = 0; i < placements.length; i++) {
    var elm = createUIElement(theme, placements[i].element);
    var parent = document.querySelector(placements[i].target);
    if (placements[i].method === "append") {
      parent.appendChild(elm);
    } else if (placements[i].method === "prepend") {
      parent.insertBefore(elm, parent.childNodes[0]);
    } else if (placements[i].method === "insertBefore") {
      parent.parentNode.insertBefore(elm, parent);
    } else if (placements[i].method === "insertAfter") {
      if (parent.nextSibling) {
        parent.parentNode.insertBefore(elm, parent.nextSibling);
      } else {
        parent.parentNode.appendChild(elm);
      }
    } else {
      throw("Error found in theme, unknown placement method: " + placements[i].method);
    }
  }
}

function getQualityImportance(quality) {
  for (var i = 0; i < ytcenter.video.qualityImportance.length; i++) {
    if (ytcenter.video.qualityImportance == quality)
      return i;
  }
}

function parseLocale(str) {
  return str.replace(/<%(.*?)%>/g, function(match, contents, offset, s){
    return eval(contents);
  });
}

function getFormatType(format) {
  for (var key in ytcenter.video.type) {
    if (ytcenter.video.type.hasOwnProperty(key)) {
      if (ytcenter.video.type[key] == format)
        return key;
    }
  }
  return "Unknown";
}

function parseThemeString(string) {
  if (string.indexOf("locale:") == 0) {
    return parseLocale(theme.locale[ytcenter.settings.language][string.substring(7)]);
  } else if (string.indexOf("element:") == 0) {
    return createUIElement(theme, string.substring(8));
  } else if (string.indexOf("function:") == 0) {
    return theme.functions[string.substring(9)]();
  } else {
    throw("Error found in theme, unknown theme string: " + string);
  }
}

function createUIElement(theme, elementName) {
  var elm = theme.elements[elementName];
  if (elm.type === "button") {
    var btn = document.createElement("button");
    btn.onclick = ";return false;";
    if (elm.title) {
      btn.title = parseLocale(theme.locale[ytcenter.settings.language][elm.title]);
    }
    if (elm.onclick) {
      btn.addEventListener('click', eval("(function(){return function(e){" + elm.onclick + "}})()"), false);
    }
    if (elm.toggleable) {
      if (elm.ontoggle) {
        btn.addEventListener('click', eval("(function(){return function(){if($HasClass(this,'yt-uix-button-toggled')){" + elm.ontoggle + "(false);$RemoveClass(this,'yt-uix-button-toggled');}else{" + elm.ontoggle + "(true);$AddClass(this,'yt-uix-button-toggled');}}})()"), false);
      } else {
        btn.addEventListener('click', function(){
          if ($HasClass(this, 'yt-uix-button-toggled')) {
            $RemoveClass(this, 'yt-uix-button-toggled');
          } else {
            $AddClass(this, 'yt-uix-button-toggled');
          }
        }, false);
      }
    }
    btn.className = "yt-uix-tooltip-reverse yt-uix-button yt-uix-button-default yt-uix-tooltip" + (elm.className ? " " + elm.className : "");
    btn.type = "button";
    if (elm.children) {
      for (var i = 0; i < elm.children.length; i++) {
        if (elm.children[i].indexOf("locale:") == 0) {
          var l = document.createElement("span");
          l.className = "yt-uix-button-content";
          l.textContent = parseLocale(theme.locale[ytcenter.settings.language][elm.children[i].substring(7)]);
          btn.appendChild(l);
        } else if (elm.children[i].indexOf("element:") == 0) {
          btn.appendChild(createUIElement(theme, elm.children[i].substring(8)));
        } else {
          throw("Error found in theme, unknown child of element: " + elementName);
        }
      }
    }
    if (elm.style) {
      for (var key in elm.style) {
        if (elm.style.hasOwnProperty(key)) {
          btn.style[key] = elm.style[key];
        }
      }
    }
    return btn;
  } else if (elm.type === "buttongroup") {
    var btngroup = document.createElement("span");
    btngroup.className = "yt-uix-button-group";
    for (var i = 0; i < elm.children.length; i++) {
      btngroup.appendChild(createUIElement(theme, elm.children[i]));
    }
    btngroup.children[0].className += " start";
    btngroup.children[btngroup.children.length-1].className += " end";
    return btngroup;
  } else if (elm.type === "menu") {
    var menu = document.createElement("div");
    menu.className = "yt-uix-button-menu hid";
    if (elm.children) {
      for (var i = 0; i < elm.children.length; i++) {
        var e = parseThemeString(elm.children[i]);
        if (e instanceof Array) {
          for (var j = 0; j < e.length; j++) {
            menu.appendChild(e[j]);
          }
        } else if (e instanceof Node) {
          menu.appendChild(e);
        } else {
          throw("Error found in theme, unknown child of element: " + elementName);
        }
      }
    }
    return menu;
  } else if (elm.type === "element") {
    var element = document.createElement(elm.tagname);
    if (elm.children) {
      for (var i = 0; i < elm.children.length; i++) {
        element.appendChild(createUIElement(theme, elm.children[i]));
      }
    }
    if (elm.attributes) {
      for (var key in elm.attributes) {
        if (elm.attributes.hasOwnProperty(key)) {
          element[key] = elm.attributes[key];
        }
      }
    }
    if (elm.style) {
      for (var key in elm.style) {
        if (elm.style.hasOwnProperty(key)) {
          element.style[key] = elm.style[key];
        }
      }
    }
    if (elm.className) {
      element.className = elm.className;
    }
    return element;
  } else {
    throw("Error found in theme, unknown element type: " + elm.type);
  }
}

function initYouTubePlayerArguments() {
  ytcenter.video.streamInfo = parseStreamInformation();
  ytcenter.video.format = sortStreamInformationByType();
  var meta = document.getElementsByTagName("meta");
  for (var i = 0; i < meta.length; i++) {
    if (meta[i].getAttribute("name") == "title") {
      ytcenter.video.title = meta[i].getAttribute("content");
      break;
    }
  }
  
  if (ytcenter.html5) {
    var a = document.createElement("video");
    if (a && a.canPlayType) {
      if (a.canPlayType(ytcenter.video.type.MP4)) ytcenter.video.html5.playable.push("MP4");
      if (a.canPlayType(ytcenter.video.type.WebM)) ytcenter.video.html5.playable.push("WebM");
    }
    for (var i = 0; i < ytcenter.video.html5.playable.length; i++) {
      
    }
  } else {
    yt.playerConfig.args.vq = ytcenter.settings.autoQuality;
  }
}

function initFlash() {
  var forceUpdate = yt.www.watch.player.updateConfig(yt.playerConfig);
  var player = yt.player.update('watch-player', yt.playerConfig, true, unsafeWindow.gYouTubePlayerReady);
  yt.setConfig({'PLAYER_REFERENCE': player});
  unsafeWindow.yt.setConfig({'PLAYER_REFERENCE': player});
}

function initHTML5() {
  document.addEventListener("DOMNodeInserted", function(e){
    if (e.target.nodeName == "VIDEO") {
      this.removeEventListener('DOMNodeInserted', arguments.callee, false);
      e.target.addEventListener("loadedmetadata", function(){
        this.pause();
        yt.www.watch.player.updateConfig(yt.playerConfig);
        var youTubePlayer = yt.player.embed('watch-player', yt.playerConfig);
        yt.setConfig({'PLAYER_REFERENCE': youTubePlayer});
      }, false);
    }
  }, false);
}

function encodeURLFile(str) {
  return encodeURIComponent(stripCharacters(str, {'\\': '-', '/': '-', ':': '-', '*': '_', '"': '_', '?': '_', '<': '_', '>': '_', '|': '-'}));
}
function stripCharacters(txt, chars) {
  var tmp = "";
  for (var i = 0; i < txt.length; i++) {
    var b = true;
    for (var key in chars) {
      if (txt[i] == key) {
        tmp += chars[key];
        b = false;
      }
    }
    if (b) tmp += txt[i];
  }
  
  return tmp;
}

function parseFMTList(list) {
  var parts = list.split(",");
  var collection = [];
  for (var i = 0; i < parts.length; i++) {
    var a = parts[i].split("/");
    collection.push({
      itag: a[0],
      dimension: a[1]
    });
  }
  return collection;
}

function parseStreamMap(list) {
  var parts = list.split(",");
  var collection = [];
  for (var i = 0; i < parts.length; i++) {
    var coll = {};
    var args = parts[i].split("&");
    for (var j = 0; j < args.length; j++) {
      var keys = args[j].split("=");
      coll[keys[0]] = unescape(keys[1]);
    }
    if (coll.type.match(/[0-9a-zA-Z]+\/[0-9a-zA-Z]+;\+(.*)/)) {
      var tmp = coll.type.split(";");
      var ff = tmp[0];
      var fe = "";
      if (tmp.length > 2) {
        var t = "";
        for (var j = 1; j < tmp.length; j++) {
          t += tmp[j];
        }
        fe = t;
      } else {
        fe = tmp[1];
      }
      coll.type = {
        format: ff,
        extra: fe
      };
    } else {
      coll.type = {
        format: coll.type,
        extra: ""
      };
    }
    collection.push(coll);
  }
  return collection;
}

function parseStreamInformation() {
  var fmtList = parseFMTList(yt.playerConfig.args.fmt_list);
  var streamList = parseStreamMap(yt.playerConfig.args.url_encoded_fmt_stream_map);
  var collection = [];
  for (var i = 0; i < streamList.length; i++) {
    var fl = null;
    for (var j = 0; j < fmtList.length; j++) {
      if (streamList[i].itag != fmtList[j].itag) continue;
      fl = fmtList[j];
      break;
    }
    if (fl == null) {
      collection.push(streamList[i]);
    } else {
      var coll = streamList[i];
      coll.dimension = fl.dimension;
      collection.push(coll);
    }
  }
  return collection;
}
function sortStreamInformationByType() {
  var collection = {};
  for (var i = 0; i < ytcenter.video.streamInfo.length; i++) {
    if (!collection[ytcenter.video.streamInfo[i].type.format]) {
      collection[ytcenter.video.streamInfo[i].type.format] = [];
    }
    collection[ytcenter.video.streamInfo[i].type.format].push(ytcenter.video.streamInfo[i]);
  }
  return collection;
}

/* Utils */
function $(id) {
  return document.getElementById(id);
}

function hasValue(arr, value) {
  for (var i = 0; i < arr.length; i++) {
    if (arr[i] == value) {
      return true;
    }
  }
  return false;
}

function $AddClass(elm, className) {
  var classes = elm.className.split(" ");
  for (var i = 0; i < classes.length; i++) {
    if (classes[i] == className) return;
  }
  classes.push(className);
  elm.className = classes.join(" ");
}

function $RemoveClass(elm, className) {
  var classes = elm.className.split(" ");
  for (var i = 0; i < classes.length; i++) {
    if (classes[i] != className) continue;
    classes.splice(i, 1);
  }
  elm.className = classes.join(" ");
}

function $HasClass(elm, className) {
  var a = elm.className.split(" ");
  for (var i = 0; i < a.length; i++) {
    if (a[i] == className) return true;
  }
  return false;
}

function createCookie(name, value, days) {
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + (days*24*60*60*1000));
    var expires = "; expires="+date.toGMTString();
  } else {
    var expires = "";
  }
  document.cookie = name + "=" + value + expires + "; path=/";
}

function readCookie(name, def) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for(var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ')
      c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0)
      return c.substring(nameEQ.length, c.length);
  }
  return (def ? def : undefined);
}

function eraseCookie(name) {
  createCookie(name, "", -1);
}

function mergeObjects(obj1, obj2) {
  var obj3 = {};
  for (var key in obj1) {
    if (obj1.hasOwnProperty(key)) {
      obj3[key] = obj1[key];
    }
  }
  for (var key in obj2) {
    if (obj2.hasOwnProperty(key)) {
      obj3[key] = obj2[key];
    }
  }
  return obj3;
}

function loadSettings() {
  var storage_key = "ytcenterv2_settings";
  if (localStorage) {
    return JSON.parse(localStorage.getItem(storage_key));
  } else if (GM_getValue && GM_setValue) {
    return JSON.parse(GM_getValue(storage_key, "{}"));
  } else {
    return JSON.parse(readCookie(storage_key, "{}"));
  }
}

function saveSettings() {
  var storage_key = "ytcenterv2_settings";
  if (localStorage) {
    localStorage.setItem(storage_key, JSON.stringify(ytcenter.settings));
  } else if (GM_getValue && GM_setValue) {
    GM_setValue(storage_key, JSON.stringify(ytcenter.settings));
  } else {
    createCookie(storage_key, JSON.stringify(ytcenter.settings), 360);
  }
}

function inject(source) {
  if ('function' == typeof source) {
    source = '(' + source + ')();'
  }
  var script = document.createElement('script');
  script.setAttribute("type", "application/javascript");
  script.textContent = source;
  document.body.appendChild(script);
  document.body.removeChild(script);
}