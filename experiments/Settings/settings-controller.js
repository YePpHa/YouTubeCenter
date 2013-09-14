var cat, subcat, option;

/* Category:General */
cat = ytcenter.settingsPanel.createCategory("General");
  subcat = ytcenter.settingsPanel.createSubCategory("General"); cat.addSubCategory(subcat);
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
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
      "removeAdvertisements", // defaultSetting
      "bool", // module
      "SETTINGS_REMOVEADVERTISEMENTS_LABEL", // label
      null, // args
      "https://github.com/YePpHa/YouTubeCenter/wiki/Features#remove-advertisements" // help
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
      "ytspf", // defaultSetting
      "bool", // module
      "SETTINGS_YTSPF", // label
      null, // args
      "https://github.com/YePpHa/YouTubeCenter/wiki/Features#spf" // help
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
      "expandDescription", // defaultSetting
      "bool", // module
      "SETTINGS_AUTOEXPANDDESCRIPTION_LABEL"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
      null, // defaultSetting
      "line"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
      "removeYouTubeTitleSuffix", // defaultSetting
      "bool", // module
      "SETTINGS_TITLE_REMOVE_YOUTUBE_SUFFIX", // label
      {
        "listeners": [
          {
            "event": "click",
            "callback": function(){
              ytcenter.title.update();
            }
          }
        ]
      }
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
      "playerPlayingTitleIndicator", // defaultSetting
      "bool", // module
      "SETTINGS_PLAYER_PLAYING_INDICATOR", // label
      {
        "listeners": [
          {
            "event": "click",
            "callback": function(){
              ytcenter.title.update();
            }
          }
        ]
      }
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
      "playerOnlyOneInstancePlaying", // defaultSetting
      "bool", // module
      "SETTINGS_PLAYER_ONLY_ONE_INSTANCE_PLAYING"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
      null, // defaultSetting
      "line"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
      null, // defaultSetting
      "importexport"
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
      null, // defaultSetting
      "button",
      null,
      {
        "text": "SETTINGS_RESETSETTINGS_LABEL",
        "listeners": [
          {
            "event": "click",
            "callback": function(){
              var msgElm = document.createElement("h3");
              msgElm.style.fontWeight = "normal";
              msgElm.textContent = ytcenter.language.getLocale("SETTINGS_RESETSETTINGS_TEXT");
              ytcenter.language.addLocaleElement(msgElm, "SETTINGS_RESETSETTINGS_TEXT", "@textContent");
              
              var dialog = ytcenter.dialog("SETTINGS_RESETSETTINGS_LABEL", msgElm, [
                {
                  label: "CONFIRM_CANCEL",
                  primary: false,
                  callback: function(){
                    dialog.setVisibility(false);
                  }
                }, {
                  label: "CONFIRM_RESET",
                  primary: true,
                  callback: function(){
                    ytcenter.settings = ytcenter._settings;
                    ytcenter.saveSettings(false, false);
                    uw.setTimeout(function(){
                      loc.reload();
                      dialog.setVisibility(false);
                    }, 500);
                  }
                }
              ]);
              dialog.setVisibility(true);
            }
          }
        ]
      }
    );
    subcat.addOption(option);
    
  subcat = ytcenter.settingsPanel.createSubCategory("Watched Videos"); cat.addSubCategory(subcat);
    option = ytcenter.settingsPanel.createOption(
      "watchedVideosIndicator", // defaultSetting
      "bool", // module
      "SETTINGS_WATCHEDVIDEOS_INDICATOR",
      null,
      "https://github.com/YePpHa/YouTubeCenter/wiki/Features#watched-videos"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
      "hideWatchedVideos", // defaultSetting
      "bool", // module
      "SETTINGS_HIDEWATCHEDVIDEOS",
      {
        "listeners": [
          {
            "event": "click",
            "callback": function(){
              ytcenter.classManagement.applyClasses();
            }
          }
        ]
      },
      "https://github.com/YePpHa/YouTubeCenter/wiki/Features#hide-watched-videos"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
      null, // defaultSetting
      "button", // module
      null,
      {
        "text": "SETTINGS_WATCHEDVIDEOS_CLEAN_VIDEO_HISTORY",
        "listeners": [
          {
            "event": "click",
            "callback": function(){
              var msgElm = document.createElement("h3");
              msgElm.style.fontWeight = "normal";
              msgElm.textContent = ytcenter.language.getLocale("SETTINGS_WATCHEDVIDEOS_CLEAN_VIDEO_HISTORY_CONTENT");
              ytcenter.language.addLocaleElement(msgElm, "SETTINGS_WATCHEDVIDEOS_CLEAN_VIDEO_HISTORY_CONTENT", "@textContent");
              
              var dialog = ytcenter.dialog("SETTINGS_WATCHEDVIDEOS_CLEAN_VIDEO_HISTORY", msgElm, [
                {
                  label: "CONFIRM_CANCEL",
                  primary: false,
                  callback: function(){
                    dialog.setVisibility(false);
                  }
                }, {
                  label: "CONFIRM_CLEAN",
                  primary: true,
                  callback: function(){
                    ytcenter.settings.watchedVideos = [];
                    ytcenter.saveSettings(null, null, function(){
                      loc.reload();
                      dialog.setVisibility(false);
                    });
                  }
                }
              ]);
              dialog.setVisibility(true);
            }
          }
        ]
      }
    );
    subcat.addOption(option);
    

  subcat = ytcenter.settingsPanel.createSubCategory("Layout"); cat.addSubCategory(subcat);
    option = ytcenter.settingsPanel.createOption(
      "watch7centerpage", // defaultSetting
      "bool", // module
      "SETTINGS_WATCH7_CENTERPAGE", // label
      { // args
        "listeners": [
          {
            "event": "click",
            "callback": function(){
              ytcenter.events.performEvent("ui-refresh");
              ytcenter.classManagement.applyClasses();
            }
          }
        ]
      },
      "https://github.com/YePpHa/YouTubeCenter/wiki/Features#centering-page" // help
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
      "flexWidthOnPage", // defaultSetting
      "bool", // module
      "SETTINGS_FLEXWIDTHONPAGE_LABEL", // label
      { // args
        "listeners": [
          {
            "event": "click",
            "callback": function(){
              ytcenter.classManagement.applyClasses();
            }
          }
        ]
      },
      "https://github.com/YePpHa/YouTubeCenter/wiki/Features#flex-width-on-page" // help
    );
    subcat.addOption(option);

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
    subcat.addOption(option);
    
    option = ytcenter.settingsPanel.createOption(
      "gridSubscriptionsPage", // defaultSetting
      "bool", // module
      "SETTINGS_GRIDSUBSCRIPTIONS", // label
      "https://github.com/YePpHa/YouTubeCenter/wiki/Features#country-for-comments" // help
    );
    option.addEventListener("update", function(newValue){
      ytcenter.classManagement.applyClasses();
    });
    subcat.addOption(option);

/* Category:Player */
cat = ytcenter.settingsPanel.createCategory("Player");
  subcat = ytcenter.settingsPanel.createSubCategory("General"); cat.addSubCategory(subcat);
    option = ytcenter.settingsPanel.createOption(
      "removeRelatedVideosEndscreen", // defaultSetting
      "bool", // module
      "SETTINGS_REMOVE_RELATED_VIDEOS_ENDSCREEN", // label
      {
        "listeners": [
          {
            "event": "click",
            "callback": function(){
              ytcenter.events.performEvent("ui-refresh");
            }
          }
        ]
      },
      "https://github.com/YePpHa/YouTubeCenter/wiki/Features#remove-endscreen"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
      "enableEndscreenAutoplay", // defaultSetting
      "bool", // module
      "SETTINGS_ENDSCREEN_AUTOPLAY"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
      "enableYouTubeAutoSwitchToShareTab", // defaultSetting
      "bool", // module
      "SETTINGS_AUTO_SWITCH_TO_SHARE_TAB",
      {
        "listeners": [
          {
            "event": "change",
            "callback": function(){
              ytcenter.player.setYTConfig({"SHARE_ON_VIDEO_END": ytcenter.settings.enableYouTubeAutoSwitchToShareTab});
            }
          }
        ]
      },
      "https://github.com/YePpHa/YouTubeCenter/wiki/Features#switch-to-share-tab-at-end-of-video"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
      "dashPlayback", // defaultSetting
      "bool", // module
      "SETTINGS_DASHPLAYBACK",
      null,
      "https://github.com/YePpHa/YouTubeCenter/wiki/Features#dash-playback"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
      "forcePlayerType", // defaultSetting
      "list", // module
      "SETTINGS_FORCEPLAYERTYPE",
      {
        "list": [
          { "value": "default", "label": "SETTINGS_FORCEPLAYERTYPE_DEFAULT" },
          { "value": "flash", "label": "SETTINGS_FORCEPLAYERTYPE_FLASH" },
          { "value": "html5", "label": "SETTINGS_FORCEPLAYERTYPE_HTML5" }
        ]
      },
      "https://github.com/YePpHa/YouTubeCenter/wiki/Features#dash-playback"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
      "autohide", // defaultSetting
      "list", // module
      "SETTINGS_AUTOHIDECONTROLBAR_LABEL",
      {
        "list": [
          {
            "value": "0",
            "label": "SETTINGS_AUTOHIDECONTROLBAR_LIST_NONE"
          }, {
            "value": "1",
            "label": "SETTINGS_AUTOHIDECONTROLBAR_LIST_BOTH"
          }, {
            "value": "2",
            "label": "SETTINGS_AUTOHIDECONTROLBAR_LIST_PROGRESSBAR"
          }, {
            "value": "3",
            "label": "SETTINGS_AUTOHIDECONTROLBAR_LIST_CONTROLBAR"
          }
        ],
        "listeners" : [
          {
            "event": "change",
            "callback": function(){
              if (ytcenter.page === "watch") {
                ytcenter.player.setAutoHide(ytcenter.settings.autohide);
              }
            }
          }
        ]
      },
      "https://github.com/YePpHa/YouTubeCenter/wiki/Features#auto-hide-bar"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
      "playerTheme", // defaultSetting
      "list", // module
      "SETTINGS_PLAYERTHEME_LABEL",
      {
        "list": [
          {
            "value": "dark",
            "label": "SETTINGS_PLAYERTHEME_DARK"
          }, {
            "value": "light",
            "label": "SETTINGS_PLAYERTHEME_LIGHT"
          }
        ],
        "listeners" : [
          {
            "event": "change",
            "callback": function(){
              if (ytcenter.page === "watch") {
                ytcenter.player.setTheme(ytcenter.settings.playerTheme);
              }
            }
          }
        ]
      },
      "https://github.com/YePpHa/YouTubeCenter/wiki/Features#player-theme"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
      "playerColor", // defaultSetting
      "list", // module
      "SETTINGS_PLAYERCOLOR_LABEL",
      {
        "list": [
          {
            "value": "red",
            "label": "SETTINGS_PLAYERCOLOR_RED"
          }, {
            "value": "white",
            "label": "SETTINGS_PLAYERCOLOR_WHITE"
          }
        ],
        "listeners" : [
          {
            "event": "change",
            "callback": function(){
              if (ytcenter.page === "watch") {
                ytcenter.player.setProgressColor(ytcenter.settings.playerColor);
              }
            }
          }
        ]
      },
      "https://github.com/YePpHa/YouTubeCenter/wiki/Features#player-color"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
      "flashWMode", // defaultSetting
      "list", // module
      "SETTINGS_WMODE_LABEL",
      {
        "list": [
          {
            "value": "none",
            "label": "SETTINGS_WMODE_NONE"
          }, {
            "value": "window",
            "label": "SETTINGS_WMODE_WINDOW"
          }, {
            "value": "direct",
            "label": "SETTINGS_WMODE_DIRECT"
          }, {
            "value": "opaque",
            "label": "SETTINGS_WMODE_OPAQUE"
          }, {
            "value": "transparent",
            "label": "SETTINGS_WMODE_TRANSPARENT"
          }, {
            "value": "gpu",
            "label": "SETTINGS_WMODE_GPU"
          }
        ]
      },
      "https://github.com/YePpHa/YouTubeCenter/wiki/Features#flash-wmode"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
      "enableAnnotations", // defaultSetting
      "bool", // module
      "SETTINGS_ENABLEANNOTATIONS_LABEL",
      null,
      "https://github.com/YePpHa/YouTubeCenter/wiki/Features#annotations"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
      "scrollToPlayer", // defaultSetting
      "bool", // module
      "SETTINGS_SCROLLTOPLAYER_LABEL",
      null,
      "https://github.com/YePpHa/YouTubeCenter/wiki/Features#scroll-to-player"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
      null, // defaultSetting
      "line"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
      "removeBrandingBanner", // defaultSetting
      "bool", // module
      "SETTINGS_BRANDING_BANNER_REMOVE", // label
      {
        "listeners": [
          {
            "event": "click",
            "callback": function(){
              ytcenter.events.performEvent("ui-refresh");
            }
          }
        ]
      },
      "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Remove_Branding_BannerBackgroundWatermark"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
      "removeBrandingBackground", // defaultSetting
      "bool", // module
      "SETTINGS_BRANDING_BACKGROUND_REMOVE", // label
      {
        "listeners": [
          {
            "event": "click",
            "callback": function(){
              ytcenter.events.performEvent("ui-refresh");
            }
          }
        ]
      },
      "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Remove_Branding_BannerBackgroundWatermark"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
      "removeBrandingWatermark", // defaultSetting
      "bool", // module
      "SETTINGS_BRANDING_WATERMARK_REMOVE", // label
      {
        "listeners": [
          {
            "event": "click",
            "callback": function(){
              ytcenter.events.performEvent("ui-refresh");
            }
          }
        ]
      },
      "https://github.com/YePpHa/YouTubeCenter/wiki/Features#wiki-Remove_Branding_BannerBackgroundWatermark"
    );
    subcat.addOption(option);
  
  subcat = ytcenter.settingsPanel.createSubCategory("Auto Play"); cat.addSubCategory(subcat);
    option = ytcenter.settingsPanel.createOption(
      "preventAutoPlay", // defaultSetting
      "bool", // module
      "SETTINGS_PREVENTAUTOPLAY_LABEL", // label
      null,
      "https://github.com/YePpHa/YouTubeCenter/wiki/Features#prevent-auto-play"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
      "preventAutoBuffer", // defaultSetting
      "bool", // module
      "SETTINGS_PREVENTAUTOBUFFERING_LABEL", // label
      null,
      "https://github.com/YePpHa/YouTubeCenter/wiki/Features#prevent-auto-buffering"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
      null, // defaultSetting
      "newline"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
      "preventPlaylistAutoPlay", // defaultSetting
      "bool", // module
      "SETTINGS_PLAYLIST_PREVENT_AUTOPLAY", // label
      null,
      "https://github.com/YePpHa/YouTubeCenter/wiki/Features#prevent-playlist-auto-play"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
      "preventPlaylistAutoBuffer", // defaultSetting
      "bool", // module
      "SETTINGS_PLAYLIST_PREVENT_AUTOBUFFERING", // label
      null,
      "https://github.com/YePpHa/YouTubeCenter/wiki/Features#prevent-playlist-auto-buffering"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
      null, // defaultSetting
      "newline"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
      "preventTabAutoPlay", // defaultSetting
      "bool", // module
      "SETTINGS_PREVENTTABAUTOPLAY_LABEL"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
      "preventTabAutoBuffer", // defaultSetting
      "bool", // module
      "SETTINGS_PREVENTTABAUTOBUFFERING_LABEL"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
      null, // defaultSetting
      "newline"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
      "preventTabPlaylistAutoPlay", // defaultSetting
      "bool", // module
      "SETTINGS_PREVENTTABPLAYLISTAUTOPLAY_LABEL"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
      "preventTabPlaylistAutoBuffer", // defaultSetting
      "bool", // module
      "SETTINGS_PREVENTTABPLAYLISTAUTOBUFFERING_LABEL"
    );
    subcat.addOption(option);
  subcat = ytcenter.settingsPanel.createSubCategory("Resolution"); cat.addSubCategory(subcat);
    option = ytcenter.settingsPanel.createOption(
      "enableAutoVideoQuality", // defaultSetting
      "bool", // module
      "SETTINGS_ENABLEAUTORESOLUTION_LABEL",
      null,
      "https://github.com/YePpHa/YouTubeCenter/wiki/Features#auto-resolution"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
      "autoVideoQuality", // defaultSetting
      "list", // module
      "SETTINGS_AUTORESOLUTION_LABEL",
      {
        "list": [
          {
            "value": "highres",
            "label": "SETTINGS_HIGHRES"
          }, {
            "value": "hd1080",
            "label": "SETTINGS_HD1080"
          }, {
            "value": "hd720",
            "label": "SETTINGS_HD720"
          }, {
            "value": "large",
            "label": "SETTINGS_LARGE"
          }, {
            "value": "medium",
            "label": "SETTINGS_MEDIUM"
          }, {
            "value": "small",
            "label": "SETTINGS_SMALL"
          }, {
            "value": "tiny",
            "label": "SETTINGS_TINY"
          }
        ]
      }
    );
    subcat.addOption(option);
    

  subcat = ytcenter.settingsPanel.createSubCategory("Player Size"); cat.addSubCategory(subcat);
    option = ytcenter.settingsPanel.createOption(
      "enableResize", // defaultSetting
      "bool", // module
      "SETTINGS_RESIZE_FEATURE_ENABLE"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
      "resize-default-playersize", // defaultSetting
      "defaultplayersizedropdown", // module
      "SETTINGS_RESIZE_DEFAULT",
      {
        "bind": "resize-playersizes"
      },
      "https://github.com/YePpHa/YouTubeCenter/wiki/Features#default-resize-button"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
      "resize-small-playersize", // defaultSetting
      "defaultplayersizedropdown", // module
      "SETTINGS_RESIZE_SMALL_BUTTON",
      {
        "bind": "resize-playersizes"
      },
      "https://github.com/YePpHa/YouTubeCenter/wiki/Features#small-resize-button"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
      "resize-large-playersize", // defaultSetting
      "defaultplayersizedropdown", // module
      "SETTINGS_RESIZE_LARGE_BUTTON",
      {
        "bind": "resize-playersizes"
      },
      "https://github.com/YePpHa/YouTubeCenter/wiki/Features#large-resize-button"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
      null, // defaultSetting
      null, // module
      "SETTINGS_RESIZE_LIST",
      null,
      "https://github.com/YePpHa/YouTubeCenter/wiki/Features#player-size-editor"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
      "resize-playersizes", // defaultSetting
      "resizeItemList" // module
    );
    subcat.addOption(option);

  subcat = ytcenter.settingsPanel.createSubCategory("Volume"); cat.addSubCategory(subcat);
    option = ytcenter.settingsPanel.createOption(
      "enableVolume", // defaultSetting
      "bool", // module
      "SETTINGS_VOLUME_ENABLE",
      null,
      "https://github.com/YePpHa/YouTubeCenter/wiki/Features#volume-control"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
      "volume", // defaultSetting
      "rangetext", // module
      "SETTINGS_VOLUME_LABEL",
      {
        "min": 0,
        "max": 100
      }
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
      "mute", // defaultSetting
      "bool", // module
      "SETTINGS_MUTE_LABEL"
    );
    subcat.addOption(option);
  
  subcat = ytcenter.settingsPanel.createSubCategory("Shortcuts"); cat.addSubCategory(subcat);
    option = ytcenter.settingsPanel.createOption(
      "enableShortcuts", // defaultSetting
      "bool", // module
      "SETTINGS_ENABLESHORTCUTS_LABEL" // label
    );
    subcat.addOption(option);

/* Category:External Players */
cat = ytcenter.settingsPanel.createCategory("External Players");
  subcat = ytcenter.settingsPanel.createSubCategory("Embed"); cat.addSubCategory(subcat);
    option = ytcenter.settingsPanel.createOption(
      "embed_enabled",
      "bool",
      "SETTINGS_EMBEDS_ENABLE"
    );
    subcat.addOption(option);
    
    option = ytcenter.settingsPanel.createOption(
      "embed_dashPlayback",
      "bool",
      "SETTINGS_DASHPLAYBACK",
      null,
      "https://github.com/YePpHa/YouTubeCenter/wiki/Features#dash-playback"
    );
    subcat.addOption(option);
    
    option = ytcenter.settingsPanel.createOption(
      "embed_forcePlayerType",
      "list",
      "SETTINGS_FORCEPLAYERTYPE",
      {
        "list": [
          { "value": "default", "label": "SETTINGS_FORCEPLAYERTYPE_DEFAULT" },
          { "value": "flash", "label": "SETTINGS_FORCEPLAYERTYPE_FLASH" },
          { "value": "html5", "label": "SETTINGS_FORCEPLAYERTYPE_HTML5" }
        ]
      }
    );
    subcat.addOption(option);
    
    option = ytcenter.settingsPanel.createOption(
      "embed_autohide",
      "list",
      "SETTINGS_AUTOHIDECONTROLBAR_LABEL",
      {
        "list": [
          {
            "value": "0",
            "label": "SETTINGS_AUTOHIDECONTROLBAR_LIST_NONE"
          }, {
            "value": "1",
            "label": "SETTINGS_AUTOHIDECONTROLBAR_LIST_BOTH"
          }, {
            "value": "2",
            "label": "SETTINGS_AUTOHIDECONTROLBAR_LIST_PROGRESSBAR"
          }, {
            "value": "3",
            "label": "SETTINGS_AUTOHIDECONTROLBAR_LIST_CONTROLBAR"
          }
        ],
        "listeners" : [
          {
            "event": "change",
            "callback": function(){
              if (ytcenter.getPage() === "embed") {
                ytcenter.player.setAutoHide(ytcenter.settings.embed_autohide);
              }
            }
          }
        ]
      }
    );
    subcat.addOption(option);
    
    option = ytcenter.settingsPanel.createOption(
      "embed_playerTheme",
      "list",
      "SETTINGS_PLAYERTHEME_LABEL",
      {
        "list": [
          {
            "value": "dark",
            "label": "SETTINGS_PLAYERTHEME_DARK"
          }, {
            "value": "light",
            "label": "SETTINGS_PLAYERTHEME_LIGHT"
          }
        ],
        "listeners" : [
          {
            "event": "change",
            "callback": function(){
              if (ytcenter.getPage() === "embed") {
                ytcenter.player.setTheme(ytcenter.settings.embed_playerTheme);
              }
            }
          }
        ]
      }
    );
    subcat.addOption(option);
    
    option = ytcenter.settingsPanel.createOption(
      "embed_playerColor",
      "list",
      "SETTINGS_PLAYERCOLOR_LABEL",
      {
        "list": [
          {
            "value": "red",
            "label": "SETTINGS_PLAYERCOLOR_RED"
          }, {
            "value": "white",
            "label": "SETTINGS_PLAYERCOLOR_WHITE"
          }
        ],
        "listeners" : [
          {
            "event": "change",
            "callback": function(){
              if (ytcenter.getPage() === "embed") {
                ytcenter.player.setProgressColor(ytcenter.settings.embed_playerColor);
              }
            }
          }
        ]
      }
    );
    subcat.addOption(option);
    
    option = ytcenter.settingsPanel.createOption(
      "embed_flashWMode",
      "list",
      "SETTINGS_WMODE_LABEL",
      {
        "list": [
          {
            "value": "none",
            "label": "SETTINGS_WMODE_NONE"
          }, {
            "value": "window",
            "label": "SETTINGS_WMODE_WINDOW"
          }, {
            "value": "direct",
            "label": "SETTINGS_WMODE_DIRECT"
          }, {
            "value": "opaque",
            "label": "SETTINGS_WMODE_OPAQUE"
          }, {
            "value": "transparent",
            "label": "SETTINGS_WMODE_TRANSPARENT"
          }, {
            "value": "gpu",
            "label": "SETTINGS_WMODE_GPU"
          }
        ]
      }
    );
    subcat.addOption(option);
    
    option = ytcenter.settingsPanel.createOption(
      "embed_enableAnnotations",
      "bool",
      "SETTINGS_ENABLEANNOTATIONS_LABEL"
    );
    subcat.addOption(option);
    
    option = ytcenter.settingsPanel.createOption(
      null,
      "line"
    );
    subcat.addOption(option);
    
    option = ytcenter.settingsPanel.createOption(
      "embed_enableAutoVideoQuality",
      "bool",
      "SETTINGS_ENABLEAUTORESOLUTION_LABEL"
    );
    subcat.addOption(option);
    
    option = ytcenter.settingsPanel.createOption(
      "embed_autoVideoQuality",
      "list",
      "SETTINGS_AUTORESOLUTION_LABEL",
      {
        "list": [
          {
            "value": "highres",
            "label": "SETTINGS_HIGHRES"
          }, {
            "value": "hd1080",
            "label": "SETTINGS_HD1080"
          }, {
            "value": "hd720",
            "label": "SETTINGS_HD720"
          }, {
            "value": "large",
            "label": "SETTINGS_LARGE"
          }, {
            "value": "medium",
            "label": "SETTINGS_MEDIUM"
          }, {
            "value": "small",
            "label": "SETTINGS_SMALL"
          }, {
            "value": "tiny",
            "label": "SETTINGS_TINY"
          }
        ]
      }
    );
    subcat.addOption(option);
    
    option = ytcenter.settingsPanel.createOption(
      null,
      "line"
    );
    subcat.addOption(option);
    
    option = ytcenter.settingsPanel.createOption(
      "embed_preventAutoPlay",
      "bool",
      "SETTINGS_PREVENTAUTOPLAY_LABEL"
    );
    subcat.addOption(option);
    
    option = ytcenter.settingsPanel.createOption(
      "embed_preventAutoBuffer",
      "bool",
      "SETTINGS_PREVENTAUTOBUFFERING_LABEL"
    );
    subcat.addOption(option);
    
    option = ytcenter.settingsPanel.createOption(
      null,
      "line"
    );
    subcat.addOption(option);
    
    option = ytcenter.settingsPanel.createOption(
      "embed_enableVolume",
      "bool",
      "SETTINGS_VOLUME_ENABLE"
    );
    subcat.addOption(option);
    
    option = ytcenter.settingsPanel.createOption(
      "embed_volume",
      "rangetext",
      "SETTINGS_VOLUME_LABEL",
      {
        "min": 0,
        "max": 100
      }
    );
    subcat.addOption(option);
    
    option = ytcenter.settingsPanel.createOption(
      "embed_mute",
      "bool",
      "SETTINGS_MUTE_LABEL"
    );
    subcat.addOption(option);
  subcat = ytcenter.settingsPanel.createSubCategory("Channel"); cat.addSubCategory(subcat);
    option = ytcenter.settingsPanel.createOption(
      "embed_dashPlayback",
      "bool",
      "SETTINGS_DASHPLAYBACK",
      null,
      "https://github.com/YePpHa/YouTubeCenter/wiki/Features#dash-playback"
    );
    subcat.addOption(option);
    
    option = ytcenter.settingsPanel.createOption(
      "channel_autohide",
      "list",
      "SETTINGS_AUTOHIDECONTROLBAR_LABEL",
      {
        "list": [
          {
            "value": "0",
            "label": "SETTINGS_AUTOHIDECONTROLBAR_LIST_NONE"
          }, {
            "value": "1",
            "label": "SETTINGS_AUTOHIDECONTROLBAR_LIST_BOTH"
          }, {
            "value": "2",
            "label": "SETTINGS_AUTOHIDECONTROLBAR_LIST_PROGRESSBAR"
          }, {
            "value": "3",
            "label": "SETTINGS_AUTOHIDECONTROLBAR_LIST_CONTROLBAR"
          }
        ],
        "listeners" : [
          {
            "event": "change",
            "callback": function(){
              if (ytcenter.getPage() === "embed") {
                ytcenter.player.setAutoHide(ytcenter.settings.channel_autohide);
              }
            }
          }
        ]
      }
    );
    subcat.addOption(option);
    
    option = ytcenter.settingsPanel.createOption(
      "channel_playerTheme",
      "list",
      "SETTINGS_PLAYERTHEME_LABEL",
      {
        "list": [
          {
            "value": "dark",
            "label": "SETTINGS_PLAYERTHEME_DARK"
          }, {
            "value": "light",
            "label": "SETTINGS_PLAYERTHEME_LIGHT"
          }
        ],
        "listeners" : [
          {
            "event": "change",
            "callback": function(){
              if (ytcenter.getPage() === "embed") {
                ytcenter.player.setTheme(ytcenter.settings.channel_playerTheme);
              }
            }
          }
        ]
      }
    );
    subcat.addOption(option);
    
    option = ytcenter.settingsPanel.createOption(
      "channel_playerColor",
      "list",
      "SETTINGS_PLAYERCOLOR_LABEL",
      {
        "list": [
          {
            "value": "red",
            "label": "SETTINGS_PLAYERCOLOR_RED"
          }, {
            "value": "white",
            "label": "SETTINGS_PLAYERCOLOR_WHITE"
          }
        ],
        "listeners" : [
          {
            "event": "change",
            "callback": function(){
              if (ytcenter.getPage() === "embed") {
                ytcenter.player.setProgressColor(ytcenter.settings.channel_playerColor);
              }
            }
          }
        ]
      }
    );
    subcat.addOption(option);
    
    option = ytcenter.settingsPanel.createOption(
      "channel_flashWMode",
      "list",
      "SETTINGS_WMODE_LABEL",
      {
        "list": [
          {
            "value": "none",
            "label": "SETTINGS_WMODE_NONE"
          }, {
            "value": "window",
            "label": "SETTINGS_WMODE_WINDOW"
          }, {
            "value": "direct",
            "label": "SETTINGS_WMODE_DIRECT"
          }, {
            "value": "opaque",
            "label": "SETTINGS_WMODE_OPAQUE"
          }, {
            "value": "transparent",
            "label": "SETTINGS_WMODE_TRANSPARENT"
          }, {
            "value": "gpu",
            "label": "SETTINGS_WMODE_GPU"
          }
        ]
      }
    );
    subcat.addOption(option);
    
    option = ytcenter.settingsPanel.createOption(
      "channel_enableAnnotations",
      "bool",
      "SETTINGS_ENABLEANNOTATIONS_LABEL"
    );
    subcat.addOption(option);
    
    option = ytcenter.settingsPanel.createOption(
      null,
      "line"
    );
    subcat.addOption(option);
    
    option = ytcenter.settingsPanel.createOption(
      "channel_enableAutoVideoQuality",
      "bool",
      "SETTINGS_ENABLEAUTORESOLUTION_LABEL"
    );
    subcat.addOption(option);
    
    option = ytcenter.settingsPanel.createOption(
      "channel_autoVideoQuality",
      "list",
      "SETTINGS_AUTORESOLUTION_LABEL",
      {
        "list": [
          {
            "value": "highres",
            "label": "SETTINGS_HIGHRES"
          }, {
            "value": "hd1080",
            "label": "SETTINGS_HD1080"
          }, {
            "value": "hd720",
            "label": "SETTINGS_HD720"
          }, {
            "value": "large",
            "label": "SETTINGS_LARGE"
          }, {
            "value": "medium",
            "label": "SETTINGS_MEDIUM"
          }, {
            "value": "small",
            "label": "SETTINGS_SMALL"
          }, {
            "value": "tiny",
            "label": "SETTINGS_TINY"
          }
        ]
      }
    );
    subcat.addOption(option);
    
    option = ytcenter.settingsPanel.createOption(
      null,
      "line"
    );
    subcat.addOption(option);
    
    option = ytcenter.settingsPanel.createOption(
      "channel_preventAutoPlay",
      "bool",
      "SETTINGS_PREVENTAUTOPLAY_LABEL"
    );
    subcat.addOption(option);
    
    option = ytcenter.settingsPanel.createOption(
      "channel_preventAutoBuffer",
      "bool",
      "SETTINGS_PREVENTAUTOBUFFERING_LABEL"
    );
    subcat.addOption(option);
    
    option = ytcenter.settingsPanel.createOption(
      null,
      "line"
    );
    subcat.addOption(option);
    
    option = ytcenter.settingsPanel.createOption(
      "channel_enableVolume",
      "bool",
      "SETTINGS_VOLUME_ENABLE"
    );
    subcat.addOption(option);
    
    option = ytcenter.settingsPanel.createOption(
      "channel_volume",
      "rangetext",
      "SETTINGS_VOLUME_LABEL",
      {
        "min": 0,
        "max": 100
      }
    );
    subcat.addOption(option);
    
    option = ytcenter.settingsPanel.createOption(
      "channel_mute",
      "bool",
      "SETTINGS_MUTE_LABEL"
    );
    subcat.addOption(option);

/* Category:Download */
cat = ytcenter.settingsPanel.createCategory("Download");
  subcat = ytcenter.settingsPanel.createSubCategory("General"); cat.addSubCategory(subcat);
    option = ytcenter.settingsPanel.createOption(
      "downloadQuality",
      "list",
      "SETTINGS_DOWNLOADQUALITY_LABEL",
      {
        "list": [
          {
            "value": "highres",
            "label": "SETTINGS_HIGHRES"
          }, {
            "value": "hd1080",
            "label": "SETTINGS_HD1080"
          }, {
            "value": "hd720",
            "label": "SETTINGS_HD720"
          }, {
            "value": "large",
            "label": "SETTINGS_LARGE"
          }, {
            "value": "medium",
            "label": "SETTINGS_MEDIUM"
          }, {
            "value": "small",
            "label": "SETTINGS_SMALL"
          }
        ],
        "listeners": [
          {
            "event": "change",
            "callback": function(){
              ytcenter.events.performEvent("ui-refresh");
            }
          }
        ]
      },
      "https://github.com/YePpHa/YouTubeCenter/wiki/Features#quality-1"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
      "downloadFormat",
      "list",
      "SETTINGS_DOWNLOADFORMAT_LABEL",
      {
        "list": [
          {
            "value": "mp4",
            "label": "SETTINGS_DOWNLOADFORMAT_LIST_MP4"
          }, {
            "value": "webm",
            "label": "SETTINGS_DOWNLOADFORMAT_LIST_WEBM"
          }, {
            "value": "flv",
            "label": "SETTINGS_DOWNLOADFORMAT_LIST_FLV"
          }, {
            "value": "3gp",
            "label": "SETTINGS_DOWNLOADFORMAT_LIST_3GP"
          }
        ],
        "listeners": [
          {
            "event": "change",
            "callback": function(){
              ytcenter.events.performEvent("ui-refresh");
            }
          }
        ]
      },
      "https://github.com/YePpHa/YouTubeCenter/wiki/Features#format"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
      "downloadAsLinks",
      "bool",
      "SETTINGS_DOWNLOADASLINKS_LABEL",
      {
        "listeners": [
          {
            "event": "click",
            "callback": function(){
              ytcenter.events.performEvent("ui-refresh");
            }
          }
        ]
      },
      "https://github.com/YePpHa/YouTubeCenter/wiki/Features#download-as-links"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
      "show3DInDownloadMenu",
      "bool",
      "SETTINGS_SHOW3DINDOWNLOADMENU_LABEL",
      {
        "listeners": [
          {
            "event": "click",
            "callback": function(){
              ytcenter.events.performEvent("ui-refresh");
            }
          }
        ]
      },
      "https://github.com/YePpHa/YouTubeCenter/wiki/Features#show-3d-in-download-menu"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
      "filename",
      "textfield",
      "SETTINGS_FILENAME_LABEL",
      {
        "listeners": [
          {
            "event": "change",
            "callback": function(){
              ytcenter.events.performEvent("ui-refresh");
            }
          }
        ]
      },
      "https://github.com/YePpHa/YouTubeCenter/wiki/Features#filename"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
      "fixfilename",
      "bool",
      "SETTINGS_FIXDOWNLOADFILENAME_LABEL",
      {
        "listeners": [
          {
            "event": "click",
            "callback": function(){
              ytcenter.events.performEvent("ui-refresh");
            }
          }
        ]
      },
      "https://github.com/YePpHa/YouTubeCenter/wiki/Features#remove-non-alphanumeric-characters"
    );
    subcat.addOption(option);
  subcat = ytcenter.settingsPanel.createSubCategory("MP3 Services"); cat.addSubCategory(subcat);
    option = ytcenter.settingsPanel.createOption(
      "mp3Services",
      "multilist",
      "SETTINGS_MP3SERVICES_LABEL",
      {
        "list": ytcenter.mp3services,
        "listeners": [
          {
            "event": "click",
            "callback": function(){
              ytcenter.events.performEvent("ui-refresh");
            }
          }
        ]
      },
      "https://github.com/YePpHa/YouTubeCenter/wiki/Features#mp3-services"
    );
    subcat.addOption(option);

/* Category:Repeat */
cat = ytcenter.settingsPanel.createCategory("Repeat");
  subcat = ytcenter.settingsPanel.createSubCategory("General"); cat.addSubCategory(subcat);
    option = ytcenter.settingsPanel.createOption(
      "autoActivateRepeat",
      "bool",
      "SETTINGS_AUTOACTIVATEREPEAT_LABEL",
      null,
      "https://github.com/YePpHa/YouTubeCenter/wiki/Features#auto-activate-repeat"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
      "repeatShowIcon",
      "bool",
      "SETTINGS_REPEAT_SHOW_ICON",
      {
        "listeners": [
          {
            "event": "click",
            "callback": function(){
              ytcenter.events.performEvent("ui-refresh");
            }
          }
        ]
      },
      "https://github.com/YePpHa/YouTubeCenter/wiki/Features#show-icon"
    );
    subcat.addOption(option);


/* Category:UI */
cat = ytcenter.settingsPanel.createCategory("UI");
  subcat = ytcenter.settingsPanel.createSubCategory("General"); cat.addSubCategory(subcat);
    option = ytcenter.settingsPanel.createOption(
      "guideMode",
      "list",
      "SETTINGS_GUIDEMODE",
      {
        "list": [
          {
            "value": "default",
            "label": "SETTINGS_GUIDEMODE_DEFAULT"
          }, {
            "value": "always_open",
            "label": "SETTINGS_GUIDEMODE_ALWAYS_OPEN"
          }, {
            "value": "always_closed",
            "label": "SETTINGS_GUIDEMODE_ALWAYS_CLOSED"
          }
        ]
      },
      "https://github.com/YePpHa/YouTubeCenter/wiki/Features#guide-mode"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
      "watch7playerguidealwayshide",
      "bool",
      "SETTINGS_GUIDE_ALWAYS_HIDE",
      {
        "listeners": [
          {
            "event": "click",
            "callback": function(){
              ytcenter.guide.hidden = ytcenter.settings.watch7playerguidealwayshide;
              ytcenter.guide.update();
              ytcenter.player._updateResize();
              ytcenter.classManagement.applyClasses();
            }
          }
        ]
      },
      "https://github.com/YePpHa/YouTubeCenter/wiki/Features#guide-mode"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
      "watch7playerguidehide",
      "bool",
      "SETTINGS_WATCH7_PLAYER_GUIDE_HIDE",
      {
        "listeners": [
          {
            "event": "click",
            "callback": function(){
              ytcenter.player._updateResize();
            }
          }
        ]
      }
    );
    subcat.addOption(option);
  subcat = ytcenter.settingsPanel.createSubCategory("Placement"); cat.addSubCategory(subcat);
    option = ytcenter.settingsPanel.createOption(
      "enableDownload",
      "bool",
      "SETTINGS_ENABLEDOWNLOAD_LABEL",
      {
        "listeners": [
          {
            "event": "click",
            "callback": function(){
              ytcenter.events.performEvent("ui-refresh");
            }
          }
        ]
      },
      "https://github.com/YePpHa/YouTubeCenter/wiki/Features#placement"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
      "enableRepeat",
      "bool",
      "SETTINGS_ENABLEREPEAT_LABEL",
      {
        "listeners": [
          {
            "event": "click",
            "callback": function(){
              ytcenter.events.performEvent("ui-refresh");
            }
          }
        ]
      },
      "https://github.com/YePpHa/YouTubeCenter/wiki/Features#placement"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
      "lightbulbEnable",
      "bool",
      "SETTINGS_LIGHTBULB_ENABLE",
      {
        "listeners": [
          {
            "event": "click",
            "callback": function(){
              ytcenter.events.performEvent("ui-refresh");
            }
          }
        ]
      },
      "https://github.com/YePpHa/YouTubeCenter/wiki/Features#placement"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
      "resizeEnable",
      "bool",
      "SETTINGS_RESIZE_ENABLE",
      {
        "listeners": [
          {
            "event": "click",
            "callback": function(){
              ytcenter.events.performEvent("ui-refresh");
            }
          }
        ]
      },
      "https://github.com/YePpHa/YouTubeCenter/wiki/Features#placement"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
      "aspectEnable",
      "bool",
      "SETTINGS_ASPECT_ENABLE",
      {
        "listeners": [
          {
            "event": "click",
            "callback": function(){
              ytcenter.events.performEvent("ui-refresh");
            }
          }
        ]
      },
      "https://github.com/YePpHa/YouTubeCenter/wiki/Features#placement"
    );
    subcat.addOption(option);
    
    option = ytcenter.settingsPanel.createOption(
      null,
      "newline"
    );
    option.setVisibility(ytcenter.getPage() === "watch");
    ytcenter.events.addEvent("ui-refresh", function(){
      this.setVisibility(ytcenter.getPage() === "watch");
    }.bind(option));
    subcat.addOption(option);
    
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
    option.setVisibility(ytcenter.getPage() === "watch");
    ytcenter.events.addEvent("ui-refresh", function(){
      this.setVisibility(ytcenter.getPage() === "watch");
    }.bind(option));
    subcat.addOption(option);
    
    option = ytcenter.settingsPanel.createOption(
      null,
      "textContent",
      null,
      {
        "textlocale": "SETTINGS_PLACEMENTSYSTEM_MOVEELEMENTS_INSTRUCTIONS",
        "styles": {
          "margin-left": "20px"
        }
      }
    );
    option.setVisibility(ytcenter.getPage() === "watch");
    ytcenter.events.addEvent("ui-refresh", function(){
      this.setVisibility(ytcenter.getPage() === "watch");
    }.bind(option));
    subcat.addOption(option);

  subcat = ytcenter.settingsPanel.createSubCategory("Lights Off"); cat.addSubCategory(subcat);
    option = ytcenter.settingsPanel.createOption(
      "lightbulbAutoOff", // defaultSetting
      "bool", // module
      "SETTINGS_LIGHTBULB_AUTO", // label
      null,
      "https://github.com/YePpHa/YouTubeCenter/wiki/Features#lights-off"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
      "lightbulbClickThrough", // defaultSetting
      "bool", // module
      "SETTINGS_LIGHTBULB_CLICK_THROUGH", // label
      null,
      "https://github.com/YePpHa/YouTubeCenter/wiki/Features#click-through"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
      "lightbulbBackgroundColor", // defaultSetting
      "colorpicker", // module
      "SETTINGS_LIGHTBULB_COLOR"
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
      "lightbulbBackgroundOpaque", // defaultSetting
      "rangetext", // module
      "SETTINGS_LIGHTBULB_TRANSPARENCY",
      {
        "min": 0,
        "max": 100
      }
    );
    subcat.addOption(option);
  
  subcat = ytcenter.settingsPanel.createSubCategory("Video Thumbnail"); cat.addSubCategory(subcat);
    option = ytcenter.settingsPanel.createOption(
      null, // defaultSetting
      "textContent", // module
      "SETTINGS_THUMBNAIL_ANIMATION" // label
    );
    option.setStyle("font-weight", "bold");
    subcat.addOption(option);
    
    option = ytcenter.settingsPanel.createOption(
      "videoThumbnailAnimationEnabled", // defaultSetting
      "bool", // module
      "SETTINGS_THUMBNAIL_ANIMATION_ENABLE" // label
    );
    option.setStyle("margin-left", "12px");
    subcat.addOption(option);
    
    option = ytcenter.settingsPanel.createOption(
      "videoThumbnailAnimationShuffle", // defaultSetting
      "bool", // module
      "SETTINGS_THUMBNAIL_ANIMATION_SHUFFLE" // label
    );
    option.setStyle("margin-left", "12px");
    subcat.addOption(option);
    
    option = ytcenter.settingsPanel.createOption(
      "videoThumbnailAnimationDelay", // defaultSetting
      "rangetext", // module
      "SETTINGS_THUMBNAIL_ANIMATION_DELAY", // label
      {
        "min": 250,
        "max": 5250
      }
    );
    option.setStyle("margin-left", "12px");
    subcat.addOption(option);
    
    option = ytcenter.settingsPanel.createOption(
      "videoThumbnailAnimationInterval", // defaultSetting
      "rangetext", // module
      "SETTINGS_THUMBNAIL_ANIMATION_INTERVAL", // label
      {
        "min": 0,
        "max": 5000
      }
    );
    option.setStyle("margin-left", "12px");
    subcat.addOption(option);
    
    option = ytcenter.settingsPanel.createOption(
      "videoThumbnailAnimationFallbackInterval", // defaultSetting
      "rangetext", // module
      "SETTINGS_THUMBNAIL_ANIMATION_FALLBACK_INTERVAL", // label
      {
        "min": 0,
        "max": 5000
      }
    );
    option.setStyle("margin-left", "12px");
    subcat.addOption(option);
    
    
    option = ytcenter.settingsPanel.createOption(
      null, // defaultSetting
      "textContent", // module
      "SETTINGS_THUMBVIDEO_QUALITY", // label
      null, // args
      "https://github.com/YePpHa/YouTubeCenter/wiki/Features#quality" // help
    );
    option.setStyle("font-weight", "bold");
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
      "videoThumbnailQualityBar", // defaultSetting
      "bool", // module
      "SETTINGS_THUMBVIDEO_QUALITY_ENABLE" // label
    );
    option.setStyle("margin-left", "12px");
    subcat.addOption(option);

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
    subcat.addOption(option);

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
    subcat.addOption(option);

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
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
      null, // defaultSetting
      "textContent", // module
      "SETTINGS_THUMBVIDEO_RATING_BAR", // label
      null, // args
      "https://github.com/YePpHa/YouTubeCenter/wiki/Features#rating-bar" // help
    );
    option.setStyle("font-weight", "bold");
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
      "videoThumbnailRatingsBar", // defaultSetting
      "bool", // module
      "SETTINGS_THUMBVIDEO_RATING_BAR_ENABLE" // label
    );
    option.setStyle("margin-left", "12px");
    subcat.addOption(option);

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
    subcat.addOption(option);

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
    subcat.addOption(option);

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
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
      null, // defaultSetting
      "textContent", // module
      "SETTINGS_THUMBVIDEO_RATING_COUNT", // label
      null, // args
      "https://github.com/YePpHa/YouTubeCenter/wiki/Features#rating-count" // help
    );
    option.setStyle("font-weight", "bold");
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
      "videoThumbnailRatingsCount", // defaultSetting
      "bool", // module
      "SETTINGS_THUMBVIDEO_QUALITY_ENABLE" // label
    );
    option.setStyle("margin-left", "12px");
    subcat.addOption(option);

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
    subcat.addOption(option);

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
    subcat.addOption(option);

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
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
      null, // defaultSetting
      "textContent", // module
      "SETTINGS_THUMBVIDEO_WATCH_LATER" // label
    );
    option.setStyle("font-weight", "bold");
    subcat.addOption(option);

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
    subcat.addOption(option);
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
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
      null, // defaultSetting
      "textContent", // module
      "SETTINGS_THUMBVIDEO_TIME_CODE" // label
    );
    option.setStyle("font-weight", "bold");
    subcat.addOption(option);

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
    subcat.addOption(option);

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
    subcat.addOption(option);

  subcat = ytcenter.settingsPanel.createSubCategory("Comments"); cat.addSubCategory(subcat);
    option = ytcenter.settingsPanel.createOption(
      "commentCountryEnabled", // defaultSetting
      "bool", // module
      "SETTINGS_COMMENTS_COUNTRY_ENABLE", // label
      null,
      "https://github.com/YePpHa/YouTubeCenter/wiki/Features#country-for-comments" // help
    );
    subcat.addOption(option);

    option = ytcenter.settingsPanel.createOption(
      "commentCountryShowFlag", // defaultSetting
      "bool", // module
      "SETTINGS_COMMENTS_COUNTRY_SHOW_FLAG" // label
    );
    subcat.addOption(option);

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
    subcat.addOption(option);

  /* Not neede as of now
  subcat = ytcenter.settingsPanel.createSubCategory("Subscriptions"); cat.addSubCategory(subcat);
  */  

/* Category:Update */
cat = ytcenter.settingsPanel.createCategory("Update");
  if ((identifier === 1 && (uw.navigator.userAgent.indexOf("Opera") !== -1 || uw.navigator.userAgent.indexOf("OPR/") !== -1)) || identifier === 6) {
    cat.setVisibility(false);
  }
  ytcenter.events.addEvent("ui-refresh", function(){
    if ((identifier === 1 && (uw.navigator.userAgent.indexOf("Opera") !== -1 || uw.navigator.userAgent.indexOf("OPR/") !== -1)) || identifier === 6) {
      this.setVisibility(false);
    } else {
      this.setVisibility(true);
    }
  }.bind(cat));
  subcat = ytcenter.settingsPanel.createSubCategory("General"); cat.addSubCategory(subcat);
    option = ytcenter.settingsPanel.createOption(
      "enableUpdateChecker",
      "bool",
      "SETTINGS_UPDATE_ENABLE",
      null,
      "https://github.com/YePpHa/YouTubeCenter/wiki/Features#enable-update-checker"
    );
    subcat.addOption(option);
    
    option = ytcenter.settingsPanel.createOption(
      "updateCheckerInterval",
      "list",
      "SETTINGS_UPDATE_INTERVAL",
      {
        "list": [
          {
            "value": "0",
            "label": "SETTINGS_UPDATE_INTERVAL_ALWAYS"
          }, {
            "value": "1",
            "label": "SETTINGS_UPDATE_INTERVAL_EVERYHOUR"
          }, {
            "value": "2",
            "label": "SETTINGS_UPDATE_INTERVAL_EVERY2HOUR"
          }, {
            "value": "12",
            "label": "SETTINGS_UPDATE_INTERVAL_EVERY12HOUR"
          }, {
            "value": "24",
            "label": "SETTINGS_UPDATE_INTERVAL_EVERYDAY"
          }, {
            "value": "48",
            "label": "SETTINGS_UPDATE_INTERVAL_EVERY2DAY"
          }, {
            "value": "168",
            "label": "SETTINGS_UPDATE_INTERVAL_EVERYWEEK"
          }, {
            "value": "336",
            "label": "SETTINGS_UPDATE_INTERVAL_EVERY2WEEK"
          }, {
            "value": "720",
            "label": "SETTINGS_UPDATE_INTERVAL_EVERYMONTH"
          }
        ]
      },
      "https://github.com/YePpHa/YouTubeCenter/wiki/Features#update-interval"
    );
    subcat.addOption(option);
    
    option = ytcenter.settingsPanel.createOption(
      null,
      "button",
      null,
      {
        "text": "SETTINGS_UPDATE_CHECKFORNEWUPDATES",
        "listeners": [
          {
            "event": "click",
            "callback": function(){
              this.textContent = ytcenter.language.getLocale("SETTINGS_UPDATE_CHECKINGFORNEWUPDATES");
              this.disabled = true;
              ytcenter.checkForUpdates((function(self){
                return function(){
                  self.textContent = ytcenter.language.getLocale("SETTINGS_UPDATE_CHECKFORNEWUPDATESSUCCESS");
                  self.disabled = false;
                };
              })(this), (function(self){
                return function(){
                  self.textContent = ytcenter.language.getLocale("SETTINGS_UPDATE_CHECKINGFORNEWUPDATESERROR");
                  self.disabled = false;
                };
              })(this), (function(self){
                return function(){
                  self.textContent = ytcenter.language.getLocale("SETTINGS_UPDATE_CHECKINGFORNEWUPDATESDISABLED");
                  self.disabled = true;
                };
              })(this));
            }
          }
        ]
      }
    );
    subcat.addOption(option);

  /* DISABLED until implemented
  subcat = ytcenter.settingsPanel.createSubCategory("Channel"); cat.addSubCategory(subcat);
  */

/* Category:Debug */
cat = ytcenter.settingsPanel.createCategory("Debug");
  subcat = ytcenter.settingsPanel.createSubCategory("Log"); cat.addSubCategory(subcat);
    option = ytcenter.settingsPanel.createOption(
      null, // defaultSetting
      "textarea",
      null,
      {
        "styles": {
          "width": "100%",
          "height": "130px",
          "background-color": "#fff",
          "border-color": "#ccc"
        },
        "attributes": {
          "disabled": "true"
        }
      }
    );
    subcat.addOption(option);
    subcat.addEventListener("click", function(){
      var a = this;
      con.log("[Debug] Loading debug log...");
      a.setText = ytcenter.language.getLocale("SETTINGS_DEBUG_LOADING");
      uw.setTimeout(function(){
        a.getLiveModule().setText(ytcenter.getDebug());
      }, 0); // async
    }.bind(option));
    
    option = ytcenter.settingsPanel.createOption(
      null, // defaultSetting
      "button",
      null,
      {
        "text": "SETTINGS_DEBUG_CREATEPASTE",
        "listeners": [
          {
            "event": "click",
            "callback": function() {
              var content = document.createElement("div"), text, pasteUrl,
                  data = [
                    "api_dev_key=@pastebin-api-key@",
                    "api_option=paste",
                    "api_paste_private=1", // unlisted
                    "api_paste_expire_date=1M", // 1 month
                    "api_paste_format=javascript",
                    "api_paste_name=" + encodeURIComponent("YouTube Center ".concat(ytcenter.version, "-", ytcenter.revision, " Debug Info")),
                    "api_paste_code=" + encodeURIComponent(ytcenter.getDebug())
                  ].join('&');

              text = document.createElement("p");
              text.appendChild(document.createTextNode(ytcenter.language.getLocale("PASTEBIN_TEXT")));
              text.setAttribute("style", "margin-bottom: 10px");

              content.appendChild(text);

              pasteUrl = document.createElement("input");
              pasteUrl.setAttribute("type", "text");
              pasteUrl.setAttribute("class", "yt-uix-form-input-text");
              pasteUrl.setAttribute("value", ytcenter.language.getLocale("PASTEBIN_LOADING"));
              pasteUrl.setAttribute("readonly", "readonly");
              pasteUrl.addEventListener("focus", function() { this.select(); }, false);

              content.appendChild(pasteUrl);

              ytcenter.dialog("PASTEBIN_TITLE", content).setVisibility(true);

              $XMLHTTPRequest({
                method: "POST",
                url: "http://pastebin.com/api/api_post.php",
                headers: {
                  "Content-Type": "application/x-www-form-urlencoded"
                },
                data: data,
                contentType: "application/x-www-form-urlencoded", // Firefox Addon
                content: data, // Firefox Addon
                onload: function(response) {
                  pasteUrl.value = response.responseText;
                }
              });
            }
          }
        ]
      }
    );
    subcat.addOption(option);

  //subcat = ytcenter.settingsPanel.createSubCategory("Options"); cat.addSubCategory(subcat);


/* Category:Share DISABLED until I implement it*/
/*cat = ytcenter.settingsPanel.createCategory("Share");
  subcat = ytcenter.settingsPanel.createSubCategory("Share"); cat.addSubCategory(subcat);
*/

/* Category:Donate */
cat = ytcenter.settingsPanel.createCategory("Donate");
  subcat = ytcenter.settingsPanel.createSubCategory("Donate"); cat.addSubCategory(subcat);
    option = ytcenter.settingsPanel.createOption(
      null, // defaultSetting
      "textContent", // module
      null, // label
      {
        "textlocale": "SETTINGS_DONATE_TEXT",
        "replace": {
          "{wiki-donate}": function(){
            var a = document.createElement("a");
            a.setAttribute("target", "_blank");
            a.setAttribute("href", "https://github.com/YePpHa/YouTubeCenter/wiki/Donate");
            a.textContent = ytcenter.language.getLocale("SETTINGS_DONATE_WIKI");
            ytcenter.language.addLocaleElement(a, "SETTINGS_DONATE_WIKI", "@textContent");
            return a;
          }
        }
      }
    );
    subcat.addOption(option);

  subcat = ytcenter.settingsPanel.createSubCategory("PayPal"); cat.addSubCategory(subcat);
    option = ytcenter.settingsPanel.createOption(
      null, // defaultSetting
      "textContent", // module
      null, // label
      {
        "textlocale": "SETTINGS_DONATE_PAYPAL_TEXT",
        "replace": {
          "{paypal-link}": function(){
            var a = document.createElement("a");
            a.setAttribute("target", "_blank");
            a.setAttribute("href", "https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=WBCAMLGT5T9J6&lc=DK&item_name=YouTube%20Center&item_number=ytcenter&currency_code=EUR&bn=PP%2dDonationsBF%3abtn_donate_SM%2egif%3aNonHosted");
            a.textContent = ytcenter.language.getLocale("SETTINGS_DONATE_PAYPAL_LINK");
            ytcenter.language.addLocaleElement(a, "SETTINGS_DONATE_PAYPAL_LINK", "@textContent");
            return a;
          }
        }
      }
    );
    subcat.addOption(option);


/* Category:About */
cat = ytcenter.settingsPanel.createCategory("About");
  subcat = ytcenter.settingsPanel.createSubCategory("About"); cat.addSubCategory(subcat);
    option = ytcenter.settingsPanel.createOption(
      null, // defaultSetting
      "aboutText", // module
      null // label
    );
    subcat.addOption(option);
    option = ytcenter.settingsPanel.createOption(
      null, // defaultSetting
      "link", // module
      null, // label
      {
        "titleLocale": "SETTINGS_ABOUT_LINKS",
        "links": [
          {text: "Wiki", url: "https://github.com/YePpHa/YouTubeCenter/wiki"},
          {text: "Userscript", url: "http://userscripts.org/scripts/show/114002"},
          {text: "Facebook", url: "https://www.facebook.com/YouTubeCenter"},
          {text: "Google+", url: "https://plus.google.com/111275247987213661483/posts"},
          {text: "Firefox", url: "https://addons.mozilla.org/en-us/firefox/addon/youtube-center/"},
          {text: "Opera", url: "https://addons.opera.com/en/extensions/details/youtube-center/"},
          {text: "Maxthon", url: "http://extension.maxthon.com/detail/index.php?view_id=1201"},
          {text: "Github", url: "https://github.com/YePpHa/YouTubeCenter/"}
        ]
      }
    );
    subcat.addOption(option);

  subcat = ytcenter.settingsPanel.createSubCategory("Translators"); cat.addSubCategory(subcat);
    option = ytcenter.settingsPanel.createOption(
      null, // defaultSetting
      "translators", // module
      null, // label
      { // args
        "translators": {
          "ar-bh": [
            { name: "alihill381" }
          ],
          "ca": [
            { name: "Joan Alemany" },
            { name: "Raül Cambeiro" }
          ],
          "da": [],
          "de": [
            { name: "Simon Artmann" },
            { name: "Sven \"Hidden\" W" }
          ],
          "en": [],
          "es": [
            { name: "Roxz" }
          ],
          "fa-IR": [],
          "fr": [
            { name: "ThePoivron", url: "http://www.twitter.com/ThePoivron" }
          ],
          "he": [
            { name: "baryoni" }
          ],
          "hu": [
            { name: "Eugenox" },
            { name: "Mateus" }
          ],
          "it": [
            { name: "Pietro De Nicolao" }
          ],
          "jp": [
            { name: "Lightning-Natto" }
          ],
          "ko": [
            { name: "Hyeongi Min", url: "https://www.facebook.com/MxAiNM" },
            { name: "U Bless", url: "http://userscripts.org/users/ubless" }
          ],
          "nl": [
            { name: "Marijn Roes" }
          ],
          "pl": [
            { name: "Piotr" },
            { name: "kasper93" }
          ],
          "pt-BR": [
            { name: "Thiago R. M. Pereira" },
            { name: "José Junior" },
            { name: "Igor Rückert" }
          ],
          "pt-PT": [
            { name: "Rafael Damasceno", url: "http://userscripts.org/users/264457" }
          ],
          "ro": [
            { name: "BlueMe", url: "http://www.itinerary.ro/" }
          ],
          "ru": [
            { name: "KDASOFT", url: "http://kdasoft.narod.ru/" }
          ],
          "sk": [
            { name: "ja1som" }
          ],
          "sv-SE": [
            { name: "Christian Eriksson" }
          ],
          "tr": [
            { name: "Ismail Aksu" }
          ],
          "UA": [
            { name: "SPIDER-T1" }
          ],
          "vi": [
            { name: "Tuấn Phạm" }
          ],
          "zh-CN": [
            { name: "雅丶涵", url: "http://www.baidu.com/p/%E9%9B%85%E4%B8%B6%E6%B6%B5" },
            { name: "MatrixGT" }
          ],
          "zh-TW": [
            { name: "泰熊" }
          ]
        }
      }
    );
    subcat.addOption(option);
