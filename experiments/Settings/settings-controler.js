// Creating Categories
var general = ytcenter.settingsPanel.createCategory("SETTINGS_CAT_GENERAL"),
    player = ytcenter.settingsPanel.createCategory("SETTINGS_CAT_PLAYER"),
    ui = ytcenter.settingsPanel.createCategory("SETTINGS_CAT_UI"),
    update = ytcenter.settingsPanel.createCategory("SETTINGS_CAT_UPDATE"),
    debug = ytcenter.settingsPanel.createCategory("SETTINGS_CAT_DEBUG"),
    about = ytcenter.settingsPanel.createCategory("SETTINGS_CAT_ABOUT");

// Creating Subcategories
var general_subcat1 = ytcenter.settingsPanel.createSubCategory("SETTINGS_CAT_GENERAL"),
    general_subcat2 = ytcenter.settingsPanel.createSubCategory("SETTINGS_CAT_EXPERIMENTS"),
    player_watch = ytcenter.settingsPanel.createSubCategory("SETTINGS_CAT_WATCH"),
    player_channel = ytcenter.settingsPanel.createSubCategory("SETTINGS_CAT_CHANNEL"),
    player_embed = ytcenter.settingsPanel.createSubCategory("SETTINGS_CAT_EMBED"),
    ui_placements = ytcenter.settingsPanel.createSubCategory("SETTINGS_TAB_PLACEMENT")
    ui_videothumbnail = ytcenter.settingsPanel.createSubCategory("SETTINGS_CAT_VIDEOTHUMBNAIL"),
    ui_comments = ytcenter.settingsPanel.createSubCategory("SETTINGS_CAT_COMMENTS"),
    ui_subscriptions = ytcenter.settingsPanel.createSubCategory("SETTINGS_CAT_SUBSCRIPTIONS"),
    update_general = ytcenter.settingsPanel.createSubCategory("SETTINGS_CAT_GENERAL"),
    update_channel = ytcenter.settingsPanel.createSubCategory("SETTINGS_CAT_CHANNEL"),
    debug_log = ytcenter.settingsPanel.createSubCategory("SETTINGS_CAT_LOG"),
    debug_options = ytcenter.settingsPanel.createSubCategory("SETTINGS_CAT_OPTIONS"),
    about_about = ytcenter.settingsPanel.createSubCategory("SETTINGS_CAT_ABOUT"),
    about_translators = ytcenter.settingsPanel.createSubCategory("SETTINGS_CAT_TRANSLATORS"),
    about_share = ytcenter.settingsPanel.createSubCategory("SETTINGS_CAT_SHARE"),
    about_donate = ytcenter.settingsPanel.createSubCategory("SETTINGS_CAT_DONATE");

// Linking categories with subcategories
general.addSubCategory(general_subcat1);
general.addSubCategory(general_subcat2);

player.addSubCategory(player_watch);
player.addSubCategory(player_channel);
player.addSubCategory(player_embed);

ui.addSubCategory(ui_placements);
ui.addSubCategory(ui_videothumbnail);
ui.addSubCategory(ui_comments);
ui.addSubCategory(ui_subscriptions);

update.addSubCategory(update_general);
update.addSubCategory(update_channel);

debug.addSubCategory(debug_log);
debug.addSubCategory(debug_options);

about.addSubCategory(about_about);
about.addSubCategory(about_translators);
about.addSubCategory(about_share);
about.addSubCategory(about_donate);

// Creating options
// ytcenter.settingsPanel.createOption ( defaultSetting, module, label, args, help )
var option;

/* General:General */
option = ytcenter.settingsPanel.createOption(
  "language", // defaultSetting
  "list", // Module
  "SETTINGS_LANGUAGE", // label
  { // Args
    "list": function(){
      var a = [];
      a.push({
        "label": "LANGUAGE_AUTO",
        "value": "auto"
      });
      for (var key in ytcenter.languages) {
        if (ytcenter.languages.hasOwnProperty(key)) {
          a.push({
            "value": key,
            "label": (function(k){
              return function(){
                return ytcenter.languages[k].LANGUAGE;
              };
            })(key)
          });
        }
      }
      return a;
    },
    "listeners": [
      {
        "event": "change",
        "callback": function(){
          ytcenter.language.update();
        }
      }
    ]
  },
  "https://github.com/YePpHa/YouTubeCenter/wiki/Features#multiple-languages" // help
);
general_subcat1.addOption(option);


option = ytcenter.settingsPanel.createOption(
  "removeAdvertisements", // defaultSetting
  "bool", // module
  "SETTINGS_REMOVEADVERTISEMENTS_LABEL", // label
  null, // args
  "https://github.com/YePpHa/YouTubeCenter/wiki/Features#remove-advertisements" // help
);
general_subcat1.addOption(option);

option = ytcenter.settingsPanel.createOption(
  "enableShortcuts", // defaultSetting
  "bool", // module
  "SETTINGS_ENABLESHORTCUTS_LABEL" // label
);
general_subcat1.addOption(option);

option = ytcenter.settingsPanel.createOption(
  "ytspf", // defaultSetting
  "bool", // module
  "SETTINGS_YTSPF", // label
  null, // args
  "https://github.com/YePpHa/YouTubeCenter/wiki/Features#spf" // help
);
general_subcat1.addOption(option);

option = ytcenter.settingsPanel.createOption(
  "ytExperimentalLayotTopbarStatic", // defaultSetting
  "bool", // module
  "SETTINGS_YTEXPERIMENTALLAYOUT_TOPBAR_STATIC", // label
  { // args
    "listeners": [
      {
        "event": "click",
        "callback": function(){
          if (ytcenter.settings.ytExperimentalLayotTopbarStatic) {
            ytcenter.utils.addClass(document.body, "ytcenter-exp-topbar-static");
          } else {
            ytcenter.utils.removeClass(document.body, "ytcenter-exp-topbar-static");
          }
        }
      }
    ]
  },
  "set-experimental-topbar-to-static" // help
);
general_subcat1.addOption(option);

/* General:Experiments */

/* Player:Watch */

/* Player:Channel */

/* Player:Embed */

/* UI:Page */

/* UI:Placement */
/*option = ytcenter.settingsPanel.createOption(
  null,
  "placement",
  null
);*/
option = ytcenter.settingsPanel.createOption(
  null,
  "button",
  null,
  {
    "text": "SETTINGS_PLACEMENTSYSTEM_MOVEELEMENTS_LABEL"
  }
);
option.addModuleEventListener("click", function(){
  if (ytcenter.placementsystem.toggleEnable()) {
    ytcenter.utils.addClass(this, "yt-uix-button-toggled");
    ytcenter.utils.addClass(document.body, "ytcenter-placementsystem-activated");
    ytcenter.settingsPanelInstance.setVisibility(false);
  } else {
    ytcenter.utils.removeClass(this, "yt-uix-button-toggled");
    ytcenter.utils.removeClass(document.body, "ytcenter-placementsystem-activated");
  }
});
ui_placements.addOption(option);

/* UI:Video Thumbnail */
option = ytcenter.settingsPanel.createOption(
  null, // defaultSetting
  "textContent", // module
  "SETTINGS_THUMBVIDEO_QUALITY", // label
  null, // args
  "https://github.com/YePpHa/YouTubeCenter/wiki/Features#quality" // help
);
option.setStyle("font-weight", "bold");
ui_videothumbnail.addOption(option);

option = ytcenter.settingsPanel.createOption(
  "videoThumbnailQualityBar", // defaultSetting
  "bool", // module
  "SETTINGS_THUMBVIDEO_QUALITY_ENABLE" // label
);
option.setStyle("margin-left", "12px");
ui_videothumbnail.addOption(option);

option = ytcenter.settingsPanel.createOption(
  "videoThumbnailQualityPosition", // defaultSetting
  "list", // module
  "SETTINGS_THUMBVIDEO_POSITION", // label
  { // args
    "list": [
      {
        "value": "topleft",
        "label": "SETTINGS_THUMBVIDEO_POSITION_TOPLEFT"
      }, {
        "value": "topright",
        "label": "SETTINGS_THUMBVIDEO_POSITION_TOPRIGHT"
      }, {
        "value": "bottomleft",
        "label": "SETTINGS_THUMBVIDEO_POSITION_BOTTOMLEFT"
      }, {
        "value": "bottomright",
        "label": "SETTINGS_THUMBVIDEO_POSITION_BOTTOMRIGHT"
      }
    ]
  }
);
option.setStyle("margin-left", "12px");
ui_videothumbnail.addOption(option);

option = ytcenter.settingsPanel.createOption(
  "videoThumbnailQualityDownloadAt", // defaultSetting
  "list", // module
  "SETTINGS_THUMBVIDEO_DOWNLOAD", // label
  { // args
    "list": [
      {
        "value": "page_start",
        "label": "SETTINGS_THUMBVIDEO_DOWNLOAD_ONSTART"
      }, {
        "value": "hover_thumbnail",
        "label": "SETTINGS_THUMBVIDEO_DOWNLOAD_ONHOVER"
      }
    ]
  }
);
option.setStyle("margin-left", "12px");
ui_videothumbnail.addOption(option);

option = ytcenter.settingsPanel.createOption(
  "videoThumbnailQualityVisible", // defaultSetting
  "list", // module
  "SETTINGS_THUMBVIDEO_VISIBLE", // label
  { // args
    "list": [
      {
        "value": "always",
        "label": "SETTINGS_THUMBVIDEO_ALWAYSVISIBLE"
      }, {
        "value": "show_hover",
        "label": "SETTINGS_THUMBVIDEO_SHOWONHOVER"
      }, {
        "value": "hide_hover",
        "label": "SETTINGS_THUMBVIDEO_HIDEONHOVER"
      }
    ]
  }
);
option.setStyle("margin-left", "12px");
ui_videothumbnail.addOption(option);

option = ytcenter.settingsPanel.createOption(
  null, // defaultSetting
  "textContent", // module
  "SETTINGS_THUMBVIDEO_RATING_BAR", // label
  null, // args
  "https://github.com/YePpHa/YouTubeCenter/wiki/Features#rating-bar" // help
);
option.setStyle("font-weight", "bold");
ui_videothumbnail.addOption(option);

option = ytcenter.settingsPanel.createOption(
  "videoThumbnailRatingsBar", // defaultSetting
  "bool", // module
  "SETTINGS_THUMBVIDEO_RATING_BAR_ENABLE" // label
);
option.setStyle("margin-left", "12px");
ui_videothumbnail.addOption(option);

option = ytcenter.settingsPanel.createOption(
  "videoThumbnailRatingsBarPosition", // defaultSetting
  "list", // module
  "SETTINGS_THUMBVIDEO_POSITION", // label
  { // args
    "list": [
      {
        "value": "top",
        "label": "SETTINGS_THUMBVIDEO_POSITION_TOP"
      }, {
        "value": "bottom",
        "label": "SETTINGS_THUMBVIDEO_POSITION_BOTTOM"
      }, {
        "value": "left",
        "label": "SETTINGS_THUMBVIDEO_POSITION_LEFT"
      }, {
        "value": "right",
        "label": "SETTINGS_THUMBVIDEO_POSITION_RIGHT"
      }
    ]
  }
);
option.setStyle("margin-left", "12px");
ui_videothumbnail.addOption(option);

option = ytcenter.settingsPanel.createOption(
  "videoThumbnailRatingsBarDownloadAt", // defaultSetting
  "list", // module
  "SETTINGS_THUMBVIDEO_DOWNLOAD", // label
  { // args
    "list": [
      {
        "value": "page_start",
        "label": "SETTINGS_THUMBVIDEO_DOWNLOAD_ONSTART"
      }, {
        "value": "hover_thumbnail",
        "label": "SETTINGS_THUMBVIDEO_DOWNLOAD_ONHOVER"
      }
    ]
  }
);
option.setStyle("margin-left", "12px");
ui_videothumbnail.addOption(option);

option = ytcenter.settingsPanel.createOption(
  "videoThumbnailRatingsBarVisible", // defaultSetting
  "list", // module
  "SETTINGS_THUMBVIDEO_VISIBLE", // label
  { // args
    "list": [
      {
        "value": "always",
        "label": "SETTINGS_THUMBVIDEO_ALWAYSVISIBLE"
      }, {
        "value": "show_hover",
        "label": "SETTINGS_THUMBVIDEO_SHOWONHOVER"
      }, {
        "value": "hide_hover",
        "label": "SETTINGS_THUMBVIDEO_HIDEONHOVER"
      }
    ]
  }
);
option.setStyle("margin-left", "12px");
ui_videothumbnail.addOption(option);

option = ytcenter.settingsPanel.createOption(
  null, // defaultSetting
  "textContent", // module
  "SETTINGS_THUMBVIDEO_RATING_COUNT", // label
  null, // args
  "https://github.com/YePpHa/YouTubeCenter/wiki/Features#rating-count" // help
);
option.setStyle("font-weight", "bold");
ui_videothumbnail.addOption(option);

option = ytcenter.settingsPanel.createOption(
  "videoThumbnailRatingsCount", // defaultSetting
  "bool", // module
  "SETTINGS_THUMBVIDEO_QUALITY_ENABLE" // label
);
option.setStyle("margin-left", "12px");
ui_videothumbnail.addOption(option);

option = ytcenter.settingsPanel.createOption(
  "videoThumbnailRatingsCountPosition", // defaultSetting
  "list", // module
  "SETTINGS_THUMBVIDEO_POSITION", // label
  { // args
    "list": [
      {
        "value": "topleft",
        "label": "SETTINGS_THUMBVIDEO_POSITION_TOPLEFT"
      }, {
        "value": "topright",
        "label": "SETTINGS_THUMBVIDEO_POSITION_TOPRIGHT"
      }, {
        "value": "bottomleft",
        "label": "SETTINGS_THUMBVIDEO_POSITION_BOTTOMLEFT"
      }, {
        "value": "bottomright",
        "label": "SETTINGS_THUMBVIDEO_POSITION_BOTTOMRIGHT"
      }
    ]
  }
);
option.setStyle("margin-left", "12px");
ui_videothumbnail.addOption(option);

option = ytcenter.settingsPanel.createOption(
  "videoThumbnailRatingsCountDownloadAt", // defaultSetting
  "list", // module
  "SETTINGS_THUMBVIDEO_DOWNLOAD", // label
  { // args
    "list": [
      {
        "value": "page_start",
        "label": "SETTINGS_THUMBVIDEO_DOWNLOAD_ONSTART"
      }, {
        "value": "hover_thumbnail",
        "label": "SETTINGS_THUMBVIDEO_DOWNLOAD_ONHOVER"
      }
    ]
  }
);
option.setStyle("margin-left", "12px");
ui_videothumbnail.addOption(option);

option = ytcenter.settingsPanel.createOption(
  "videoThumbnailRatingsCountVisible", // defaultSetting
  "list", // module
  "SETTINGS_THUMBVIDEO_VISIBLE", // label
  { // args
    "list": [
      {
        "value": "always",
        "label": "SETTINGS_THUMBVIDEO_ALWAYSVISIBLE"
      }, {
        "value": "show_hover",
        "label": "SETTINGS_THUMBVIDEO_SHOWONHOVER"
      }, {
        "value": "hide_hover",
        "label": "SETTINGS_THUMBVIDEO_HIDEONHOVER"
      }
    ]
  }
);
option.setStyle("margin-left", "12px");
ui_videothumbnail.addOption(option);

option = ytcenter.settingsPanel.createOption(
  null, // defaultSetting
  "textContent", // module
  "SETTINGS_THUMBVIDEO_WATCH_LATER" // label
);
option.setStyle("font-weight", "bold");
ui_videothumbnail.addOption(option);

option = ytcenter.settingsPanel.createOption(
  "videoThumbnailWatchLaterPosition", // defaultSetting
  "list", // module
  "SETTINGS_THUMBVIDEO_POSITION", // label
  {
    "list": [
      {
        "value": "topleft",
        "label": "SETTINGS_THUMBVIDEO_POSITION_TOPLEFT"
      }, {
        "value": "topright",
        "label": "SETTINGS_THUMBVIDEO_POSITION_TOPRIGHT"
      }, {
        "value": "bottomleft",
        "label": "SETTINGS_THUMBVIDEO_POSITION_BOTTOMLEFT"
      }, {
        "value": "bottomright",
        "label": "SETTINGS_THUMBVIDEO_POSITION_BOTTOMRIGHT"
      }
    ]
  }
);
option.setStyle("margin-left", "12px");
ui_videothumbnail.addOption(option);
option = ytcenter.settingsPanel.createOption(
  "videoThumbnailWatchLaterVisible", // defaultSetting
  "list", // module
  "SETTINGS_THUMBVIDEO_VISIBLE", // label
  { // args
    "list": [
      {
        "value": "always",
        "label": "SETTINGS_THUMBVIDEO_ALWAYSVISIBLE"
      }, {
        "value": "show_hover",
        "label": "SETTINGS_THUMBVIDEO_SHOWONHOVER"
      }, {
        "value": "hide_hover",
        "label": "SETTINGS_THUMBVIDEO_HIDEONHOVER"
      }, {
        "value": "never",
        "label": "SETTINGS_THUMBVIDEO_NEVER"
      }
    ]
  }
);
option.setStyle("margin-left", "12px");
ui_videothumbnail.addOption(option);

option = ytcenter.settingsPanel.createOption(
  null, // defaultSetting
  "textContent", // module
  "SETTINGS_THUMBVIDEO_TIME_CODE" // label
);
option.setStyle("font-weight", "bold");
ui_videothumbnail.addOption(option);

option = ytcenter.settingsPanel.createOption(
  "videoThumbnailTimeCodePosition", // defaultSetting
  "list", // module
  "SETTINGS_THUMBVIDEO_POSITION", // label
  { // args
    "list": [
      {
        "value": "topleft",
        "label": "SETTINGS_THUMBVIDEO_POSITION_TOPLEFT"
      }, {
        "value": "topright",
        "label": "SETTINGS_THUMBVIDEO_POSITION_TOPRIGHT"
      }, {
        "value": "bottomleft",
        "label": "SETTINGS_THUMBVIDEO_POSITION_BOTTOMLEFT"
      }, {
        "value": "bottomright",
        "label": "SETTINGS_THUMBVIDEO_POSITION_BOTTOMRIGHT"
      }
    ]
  }
);
option.setStyle("margin-left", "12px");
ui_videothumbnail.addOption(option);

option = ytcenter.settingsPanel.createOption(
  "videoThumbnailTimeCodeVisible", // defaultSetting
  "list", // module
  "SETTINGS_THUMBVIDEO_VISIBLE", // label
  { // args
    "list": [
      {
        "value": "always",
        "label": "SETTINGS_THUMBVIDEO_ALWAYSVISIBLE"
      }, {
        "value": "show_hover",
        "label": "SETTINGS_THUMBVIDEO_SHOWONHOVER"
      }, {
        "value": "hide_hover",
        "label": "SETTINGS_THUMBVIDEO_HIDEONHOVER"
      }, {
        "value": "never",
        "label": "SETTINGS_THUMBVIDEO_NEVER"
      }
    ]
  }
);
option.setStyle("margin-left", "12px");
ui_videothumbnail.addOption(option);

/* UI:Comments */
option = ytcenter.settingsPanel.createOption(
  "commentCountryEnabled", // defaultSetting
  "bool", // module
  "SETTINGS_COMMENTS_COUNTRY_ENABLE", // label
  null,
  "https://github.com/YePpHa/YouTubeCenter/wiki/Features#country-for-comments" // help
);
ui_comments.addOption(option);

option = ytcenter.settingsPanel.createOption(
  "commentCountryShowFlag", // defaultSetting
  "bool", // module
  "SETTINGS_COMMENTS_COUNTRY_SHOW_FLAG" // label
);
ui_comments.addOption(option);

option = ytcenter.settingsPanel.createOption(
  "commentCountryPosition", // defaultSetting
  "list", // module
  "SETTINGS_COMMENTS_COUNTRY_POSITION", // label
  {
    "list": [
      {
        "value": "before_username",
        "label": "SETTINGS_COMMENTS_COUNTRY_POSITION_BEFORE_USERNAME"
      }, {
        "value": "after_username",
        "label": "SETTINGS_COMMENTS_COUNTRY_POSITION_AFTER_USERNAME"
      }, {
        "value": "last",
        "label": "SETTINGS_COMMENTS_COUNTRY_POSITION_LAST"
      }
    ]
  }
);
ui_comments.addOption(option);

/* UI:Subscriptions */
option = ytcenter.settingsPanel.createOption(
  "gridSubscriptionsPage", // defaultSetting
  "bool", // module
  "SETTINGS_GRIDSUBSCRIPTIONS", // label
  "https://github.com/YePpHa/YouTubeCenter/wiki/Features#country-for-comments" // help
);
option.addEventListener("update", function(newValue){
  ytcenter.classManagement.applyClasses();
});
ui_subscriptions.addOption(option);

/* UI:Placement */

/* Update:Update */

/* Update:Channel */

/* Debug:Log */

/* Debug:Options */

/* About:About */
option = ytcenter.settingsPanel.createOption(
  null, // defaultSetting
  "aboutText", // module
  null // label
);
about_about.addOption(option);

/* About:Translators */
option = ytcenter.settingsPanel.createOption(
  null, // defaultSetting
  "translators", // module
  null, // label
  { // args
    "translators": {
      "ar-bh": [
        {name: "alihill381"}
      ],
      "ca": [
        {name: "Joan Alemany"},
        {name: "Raül Cambeiro"}
      ],
      "da": [],
      "de": [
        {name: "Simon Artmann"},
        {name: "Sven \"Hidden\" W"}
      ],
      "en": [],
      "es": [
        {name: "Roxz"}
      ],
      "fa-IR": [],
      "fr": [
        {name: "ThePoivron", url: "http://www.twitter.com/ThePoivron"}
      ],
      "he": [
        {name: "baryoni"}
      ],
      "hu": [
        {name: "Eugenox"},
        {name: "Mateus"}
      ],
      "it": [
        {name: "Pietro De Nicolao"}
      ],
      "jp": [
        {name: "Lightning-Natto"}
      ],
      "nl": [],
      "pl": [
        {name: "Piotr"},
        {name: "kasper93"}
      ],
      "pt-BR": [
        {name: "Thiago R. M. Pereira"},
        {name: "José Junior"}
      ],
      "pt-PT": [
        {name: "Rafael Damasceno", url: "http://userscripts.org/users/264457"}
      ],
      "ro": [
        {name: "BlueMe", url: "http://www.itinerary.ro/"}
      ],
      "ru": [
        {name: "KDASOFT", url: "http://kdasoft.narod.ru/"}
      ],
      "sk": [
        {name: "ja1som"}
      ],
      "sv-SE": [
        {name: "Christian Eriksson"}
      ],
      "tr": [
        {name: "Ismail Aksu"}
      ],
      "UA": [
        {name: "SPIDER-T1"}
      ],
      "vi": [
        {name: "Tuấn Phạm"}
      ],
      "zh-CN": [
        {name: "小酷"},
        {name: "MatrixGT"}
      ],
      "zh-TW": [
        {name: "泰熊"}
      ]
    }
  }
);
about_translators.addOption(option);

/* About:Share */

/* About:Donate */
