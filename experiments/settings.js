/*** module settings.js
 * This will replace the old settings when it's finished.
 * The settings will be put into a dialog as the experimental dialog is at the moment.
 * ********************************************************************************************
 * The settings will include categories and from the categories to subcategories, where the subcateogories will contain the options.
 * It will be possible for YouTube Center to hide or disable specific categories/subcategories/options if needed.
 * ********************************************************************************************
 * The categories will be placed to the left side as the guide is on YouTube. The categories will use the same red design as the guide.
 * The subcategories will be the same as the categories in the old settings.
 * The options will be much more customizeable, where you will be able to add modules.
 ***/
/** Option  It should be easy to add new options.
 * The option will contain a label if the label is specified otherwise it will not be added.
 * The "defaultSetting" will be available as it currently is.
 * The "args" will be added, which will be a way to pass more arguments to the module (if needed or required).
 * The "type" will be replaced with "module", which will be a function with the prefix "ytcenter.modules.*".
 * The "help" will still be present in this version.
 * Everything is optional except for the type, which is needed to add the option to the settings.
 **/
/** Module  Handles the option like what happens when I click on that checkbox or input some text in a textfield...
 * When the module (function) is called. It need to have the following arguments passed:
 ** defaultSetting  Needs the defaultSetting to set the default settings.
 * The module needs to return an object with:
 ** element An element, which will be added to the settings.
 ** bind  A function, where a callback function is passed. When an update which requires YouTube Center to save settings this callback function is called.
 ** update  A function, which will be called whenever a value needs to be changed in the module. In an instance where the settings has changed and the module needs to update with the changes.
 **/


/* Settings up fake YouTube Center enviorment */
var uw = window,
    ytcenter = {};
ytcenter.version = "2.0";
ytcenter.settings = {};
ytcenter.events = {};
ytcenter.events.performEvent = function(){};
ytcenter.events.addEvent = function(){};
ytcenter.io = {};
/* BlobBuilder.js
 * A BlobBuilder implementation.
 * 2012-04-21
 *
 * By Eli Grey, http://eligrey.com
 * License: X11/MIT
 * See LICENSE.md
 */
/*! @source http://purl.eligrey.com/github/BlobBuilder.js/blob/master/BlobBuilder.js */
ytcenter.io.FakeBlobBuilder = function(){return (function() {
  "use strict";
  var get_class = function(object) {
    return Object.prototype.toString.call(object).match(/^\[object\s(.*)\]$/)[1];
  },
  FakeBlobBuilder = function(){
    this.data = [];
  },
  FakeBlob = function(data, type, encoding) {
    this.data = data;
    this.size = data.length;
    this.type = type;
    this.encoding = encoding;
  },
  FBB_proto = FakeBlobBuilder.prototype,
  FB_proto = FakeBlob.prototype,
  FileReaderSync = uw.FileReaderSync,
  FileException = function(type) {
    this.code = this[this.name = type];
  },
  file_ex_codes = (
    "NOT_FOUND_ERR SECURITY_ERR ABORT_ERR NOT_READABLE_ERR ENCODING_ERR "
    + "NO_MODIFICATION_ALLOWED_ERR INVALID_STATE_ERR SYNTAX_ERR"
  ).split(" "),
  file_ex_code = file_ex_codes.length,
  
  real_URL = (function(){
    var a;
    try {
      a = URL || uw.URL || webkitURL || uw.webkitURL || uw;
    } catch (e) {
      try {
        a = uw.URL || webkitURL || uw.webkitURL || uw;
      } catch (e) {
        try {
          a = webkitURL || uw.webkitURL || uw;
        } catch (e) {
          try {
            a = uw.webkitURL || uw;
          } catch (e) {
            a = uw;
          }
        }
      }
    }
    if (uw.navigator && uw.navigator.getUserMedia) {
      if (!a) a = {};
      if (!a.createObjectURL) a.createObjectURL = function(obj){return obj;}
      if (!a.revokeObjectURL) a.revokeObjectURL = function(){};
    }
    return a;
  })(),
  real_create_object_URL = real_URL.createObjectURL,
  real_revoke_object_URL = real_URL.revokeObjectURL,
  URL = real_URL,
  btoa = uw.btoa,
  atob = uw.atob,
  can_apply_typed_arrays = false,
  can_apply_typed_arrays_test = function(pass) {
    can_apply_typed_arrays = !pass;
  },
  ArrayBuffer = uw.ArrayBuffer,
  Uint8Array = uw.Uint8Array;
  FakeBlobBuilder.fake = FB_proto.fake = true;
  while (file_ex_code--) {
    FileException.prototype[file_ex_codes[file_ex_code]] = file_ex_code + 1;
  }
  try {
    if (Uint8Array) {
      can_apply_typed_arrays_test.apply(0, new Uint8Array(1));
    }
  } catch (ex) {}
  if (!real_URL.createObjectURL) {
    URL = {};
  }
  URL.createObjectURL = function(blob) {
    var type = blob.type,
        data_URI_header;
    if (type === null) {
      type = "application/octet-stream";
    }
    if (blob instanceof FakeBlob) {
      data_URI_header = "data:" + type;
      if (blob.encoding === "base64") {
        return data_URI_header + ";base64," + blob.data;
      } else if (blob.encoding === "URI") {
        return data_URI_header + "," + decodeURIComponent(blob.data);
      }
      if (btoa) {
        try {
          return data_URI_header + ";base64," + btoa(blob.data);
        } catch (e) {
          return data_URI_header + "," + encodeURIComponent(blob.data);
        }
      } else {
        return data_URI_header + "," + encodeURIComponent(blob.data);
      }
    } else if (real_create_object_URL) {
      return real_create_object_URL.call(real_URL, blob);
    }
  };
  URL.revokeObjectURL = function(object_URL) {
    if (object_URL.substring(0, 5) !== "data:" && real_revoke_object_URL) {
      real_revoke_object_URL.call(real_URL, object_URL);
    }
  };
  FBB_proto.append = function(data/*, endings*/) {
    var bb = this.data;
    // decode data to a binary string
    if (Uint8Array && data instanceof ArrayBuffer) {
      if (can_apply_typed_arrays) {
        bb.push(String.fromCharCode.apply(String, new Uint8Array(data)));
      } else {
        var str = "",
            buf = new Uint8Array(data),
            i = 0,
            buf_len = buf.length;
        for (; i < buf_len; i++) {
          str += String.fromCharCode(buf[i]);
        }
      }
    } else if (get_class(data) === "Blob" || get_class(data) === "File") {
      if (FileReaderSync) {
        var fr = new FileReaderSync;
        bb.push(fr.readAsBinaryString(data));
      } else {
        // async FileReader won't work as BlobBuilder is sync
        throw new FileException("NOT_READABLE_ERR");
      }
    } else if (data instanceof FakeBlob) {
      if (data.encoding === "base64" && atob) {
        bb.push(atob(data.data));
      } else if (data.encoding === "URI") {
        bb.push(decodeURIComponent(data.data));
      } else if (data.encoding === "raw") {
        bb.push(data.data);
      }
    } else {
      if (typeof data !== "string") {
        data += ""; // convert unsupported types to strings
      }
      // decode UTF-16 to binary string
      bb.push(unescape(encodeURIComponent(data)));
    }
  };
  FBB_proto.getBlob = function(type) {
    if (!arguments.length) {
      type = null;
    }
    return new FakeBlob(this.data.join(""), type, "raw");
  };
  FBB_proto.toString = function() {
    return "[object BlobBuilder]";
  };
  FB_proto.slice = function(start, end, type) {
    var args = arguments.length;
    if (args < 3) {
      type = null;
    }
    return new FakeBlob(
      this.data.slice(start, args > 1 ? end : this.data.length),
      type,
      this.encoding
    );
  };
  FB_proto.toString = function() {
    return "[object Blob]";
  };
  return FakeBlobBuilder;
}());};
ytcenter.io.BlobBuilder = (function(){
  var a;
  try {
    a = BlobBuilder || uw.WebKitBlobBuilder || uw.MozBlobBuilder || uw.MSBlobBuilder;
  } catch (e) {
    try {
      a = uw.WebKitBlobBuilder || uw.MozBlobBuilder || uw.MSBlobBuilder;
    } catch (e) {
      try {
        a = uw.MozBlobBuilder || uw.MSBlobBuilder;;
      } catch (e) {
        a = uw.MSBlobBuilder;
      }
    }
  }
  if (typeof a === "undefined") a = ytcenter.io.FakeBlobBuilder();
  return a;
})();

/* FileSaver.js
 * A saveAs() FileSaver implementation.
 * 2013-01-23
 *
 * By Eli Grey, http://eligrey.com
 * License: X11/MIT
 * See LICENSE.md
 */
/*! @source http://purl.eligrey.com/github/FileSaver.js/blob/master/FileSaver.js */
ytcenter.io.fakeSaveAs = function(){return (function() {
  "use strict";
  // only get URL when necessary in case BlobBuilder.js hasn't overridden it yet
  var get_URL = function() {
        return (function(){
          var a;
          try {
            a = URL || uw.URL || webkitURL || uw.webkitURL || uw;
          } catch (e) {
            try {
              a = uw.URL || webkitURL || uw.webkitURL || uw;
            } catch (e) {
              try {
                a = webkitURL || uw.webkitURL || uw;
              } catch (e) {
                try {
                  a = uw.webkitURL || uw;
                } catch (e) {
                  a = uw;
                }
              }
            }
          }
          
          if (uw.navigator && uw.navigator.getUserMedia) {
            if (!a) a = {};
            if (!a.createObjectURL) a.createObjectURL = function(obj){return obj;}
            if (!a.revokeObjectURL) a.revokeObjectURL = function(){};
          }
          return a;
        })();
      },
      URL = (function(){
        var a;
        try {
          a = URL || uw.URL || webkitURL || uw.webkitURL || uw;
        } catch (e) {
          try {
            a = uw.URL || webkitURL || uw.webkitURL || uw;
          } catch (e) {
            try {
              a = webkitURL || uw.webkitURL || uw;
            } catch (e) {
              try {
                a = uw.webkitURL || uw;
              } catch (e) {
                a = uw;
              }
            }
          }
        }
        if (uw.navigator && uw.navigator.getUserMedia) {
          if (!a) a = {};
          if (!a.createObjectURL) a.createObjectURL = function(obj){return obj;}
          if (!a.revokeObjectURL) a.revokeObjectURL = function(){};
        }
        return a;
      })(),
      save_link = document.createElementNS("http://www.w3.org/1999/xhtml", "a"),
      can_use_save_link =  !uw.externalHost && "download" in save_link,
      click = function(node) {
        var event = document.createEvent("MouseEvents");
        event.initMouseEvent(
          "click", true, false, uw, 0, 0, 0, 0, 0,
          false, false, false, false, 0, null
        );
        node.dispatchEvent(event);
      },
      webkit_req_fs = uw.webkitRequestFileSystem,
      req_fs = uw.requestFileSystem || webkit_req_fs || uw.mozRequestFileSystem,
      throw_outside = function (ex) {
        (uw.setImmediate || uw.setTimeout)(function() {
          throw ex;
        }, 0);
      },
      force_saveable_type = "application/octet-stream",
      fs_min_size = 0,
      deletion_queue = [],
      process_deletion_queue = function() {
        var i = deletion_queue.length;
        while (i--) {
          var file = deletion_queue[i];
          if (typeof file === "string") { // file is an object URL
            URL.revokeObjectURL(file);
          } else { // file is a File
            file.remove();
          }
        }
        deletion_queue.length = 0; // clear queue
      },
      dispatch = function(filesaver, event_types, event) {
        event_types = [].concat(event_types);
        var i = event_types.length;
        while (i--) {
          var listener = filesaver["on" + event_types[i]];
          if (typeof listener === "function") {
            try {
              listener.call(filesaver, event || filesaver);
            } catch (ex) {
              throw_outside(ex);
            }
          }
        }
      },
      FileSaver = function(blob, name) {
        // First try a.download, then web filesystem, then object URLs
        var filesaver = this,
            type = blob.type,
            blob_changed = false,
            object_url,
            target_view,
            get_object_url = function() {
              var object_url = get_URL().createObjectURL(blob);
              deletion_queue.push(object_url);
              return object_url;
            },
            dispatch_all = function() {
              dispatch(filesaver, "writestart progress write writeend".split(" "));
            },
            // on any filesys errors revert to saving with object URLs
            fs_error = function() {
              // don't create more object URLs than needed
              if (blob_changed || !object_url) {
                object_url = get_object_url(blob);
              }
              if (target_view) {
                target_view.location.href = object_url;
              } else {
                            window.open(object_url, "_blank");
                        }
              filesaver.readyState = filesaver.DONE;
              dispatch_all();
            },
            abortable = function(func) {
              return function() {
                if (filesaver.readyState !== filesaver.DONE) {
                  return func.apply(this, arguments);
                }
              };
            },
            create_if_not_found = {create: true, exclusive: false},
            slice;
        filesaver.readyState = filesaver.INIT;
        if (!name) {
          name = "download";
        }
        if (can_use_save_link) {
          object_url = get_object_url(blob);
          save_link.href = object_url;
          save_link.download = name;
          click(save_link);
          filesaver.readyState = filesaver.DONE;
          dispatch_all();
          return;
        }
        // Object and web filesystem URLs have a problem saving in Google Chrome when
        // viewed in a tab, so I force save with application/octet-stream
        // http://code.google.com/p/chromium/issues/detail?id=91158
        if (uw.chrome && type && type !== force_saveable_type) {
          slice = blob.slice || blob.webkitSlice;
          blob = slice.call(blob, 0, blob.size, force_saveable_type);
          blob_changed = true;
        }
        // Since I can't be sure that the guessed media type will trigger a download
        // in WebKit, I append .download to the filename.
        // https://bugs.webkit.org/show_bug.cgi?id=65440
        if (webkit_req_fs && name !== "download") {
          name += ".download";
        }
        if (type === force_saveable_type || webkit_req_fs) {
          target_view = uw;
        }
        if (!req_fs) {
          fs_error();
          return;
        }
        fs_min_size += blob.size;
        req_fs(uw.TEMPORARY, fs_min_size, abortable(function(fs) {
          fs.root.getDirectory("saved", create_if_not_found, abortable(function(dir) {
            var save = function() {
              dir.getFile(name, create_if_not_found, abortable(function(file) {
                file.createWriter(abortable(function(writer) {
                  writer.onwriteend = function(event) {
                    target_view.location.href = file.toURL();
                    deletion_queue.push(file);
                    filesaver.readyState = filesaver.DONE;
                    dispatch(filesaver, "writeend", event);
                  };
                  writer.onerror = function() {
                    var error = writer.error;
                    if (error.code !== error.ABORT_ERR) {
                      fs_error();
                    }
                  };
                  "writestart progress write abort".split(" ").forEach(function(event) {
                    writer["on" + event] = filesaver["on" + event];
                  });
                  writer.write(blob);
                  filesaver.abort = function() {
                    writer.abort();
                    filesaver.readyState = filesaver.DONE;
                  };
                  filesaver.readyState = filesaver.WRITING;
                }), fs_error);
              }), fs_error);
            };
            dir.getFile(name, {create: false}, abortable(function(file) {
              // delete file if it already exists
              file.remove();
              save();
            }), abortable(function(ex) {
              if (ex.code === ex.NOT_FOUND_ERR) {
                save();
              } else {
                fs_error();
              }
            }));
          }), fs_error);
        }), fs_error);
      },
      FS_proto = FileSaver.prototype,
      saveAs = function(blob, name) {
        return new FileSaver(blob, name);
      };
  FS_proto.abort = function() {
    var filesaver = this;
    filesaver.readyState = filesaver.DONE;
    dispatch(filesaver, "abort");
  };
  FS_proto.readyState = FS_proto.INIT = 0;
  FS_proto.WRITING = 1;
  FS_proto.DONE = 2;

  FS_proto.error =
  FS_proto.onwritestart =
  FS_proto.onprogress =
  FS_proto.onwrite =
  FS_proto.onabort =
  FS_proto.onerror =
  FS_proto.onwriteend =
    null;

  window.addEventListener("unload", process_deletion_queue, false);
  return saveAs;
}(self));};
ytcenter.io.saveAs = (function(){
  var a;
  try {
    a = saveAs || (navigator.msSaveBlob && navigator.msSaveBlob.bind(navigator));
  } catch (e) {
    try {
      a = (navigator.msSaveBlob && navigator.msSaveBlob.bind(navigator));
    } catch (e) {}
  }
  if (typeof a === "undefined") a = ytcenter.io.fakeSaveAs();
  return a;
})();
ytcenter.gui = {};
ytcenter.gui.icons = {};
ytcenter.gui.icons.cog = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAPCAYAAAFM0aXcAAAACXBIWXMAAAsTAAALEwEAmpwYAAAKT2lDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjanVNnVFPpFj333vRCS4iAlEtvUhUIIFJCi4AUkSYqIQkQSoghodkVUcERRUUEG8igiAOOjoCMFVEsDIoK2AfkIaKOg6OIisr74Xuja9a89+bN/rXXPues852zzwfACAyWSDNRNYAMqUIeEeCDx8TG4eQuQIEKJHAAEAizZCFz/SMBAPh+PDwrIsAHvgABeNMLCADATZvAMByH/w/qQplcAYCEAcB0kThLCIAUAEB6jkKmAEBGAYCdmCZTAKAEAGDLY2LjAFAtAGAnf+bTAICd+Jl7AQBblCEVAaCRACATZYhEAGg7AKzPVopFAFgwABRmS8Q5ANgtADBJV2ZIALC3AMDOEAuyAAgMADBRiIUpAAR7AGDIIyN4AISZABRG8lc88SuuEOcqAAB4mbI8uSQ5RYFbCC1xB1dXLh4ozkkXKxQ2YQJhmkAuwnmZGTKBNA/g88wAAKCRFRHgg/P9eM4Ors7ONo62Dl8t6r8G/yJiYuP+5c+rcEAAAOF0ftH+LC+zGoA7BoBt/qIl7gRoXgugdfeLZrIPQLUAoOnaV/Nw+H48PEWhkLnZ2eXk5NhKxEJbYcpXff5nwl/AV/1s+X48/Pf14L7iJIEyXYFHBPjgwsz0TKUcz5IJhGLc5o9H/LcL//wd0yLESWK5WCoU41EScY5EmozzMqUiiUKSKcUl0v9k4t8s+wM+3zUAsGo+AXuRLahdYwP2SycQWHTA4vcAAPK7b8HUKAgDgGiD4c93/+8//UegJQCAZkmScQAAXkQkLlTKsz/HCAAARKCBKrBBG/TBGCzABhzBBdzBC/xgNoRCJMTCQhBCCmSAHHJgKayCQiiGzbAdKmAv1EAdNMBRaIaTcA4uwlW4Dj1wD/phCJ7BKLyBCQRByAgTYSHaiAFiilgjjggXmYX4IcFIBBKLJCDJiBRRIkuRNUgxUopUIFVIHfI9cgI5h1xGupE7yAAygvyGvEcxlIGyUT3UDLVDuag3GoRGogvQZHQxmo8WoJvQcrQaPYw2oefQq2gP2o8+Q8cwwOgYBzPEbDAuxsNCsTgsCZNjy7EirAyrxhqwVqwDu4n1Y8+xdwQSgUXACTYEd0IgYR5BSFhMWE7YSKggHCQ0EdoJNwkDhFHCJyKTqEu0JroR+cQYYjIxh1hILCPWEo8TLxB7iEPENyQSiUMyJ7mQAkmxpFTSEtJG0m5SI+ksqZs0SBojk8naZGuyBzmULCAryIXkneTD5DPkG+Qh8lsKnWJAcaT4U+IoUspqShnlEOU05QZlmDJBVaOaUt2ooVQRNY9aQq2htlKvUYeoEzR1mjnNgxZJS6WtopXTGmgXaPdpr+h0uhHdlR5Ol9BX0svpR+iX6AP0dwwNhhWDx4hnKBmbGAcYZxl3GK+YTKYZ04sZx1QwNzHrmOeZD5lvVVgqtip8FZHKCpVKlSaVGyovVKmqpqreqgtV81XLVI+pXlN9rkZVM1PjqQnUlqtVqp1Q61MbU2epO6iHqmeob1Q/pH5Z/YkGWcNMw09DpFGgsV/jvMYgC2MZs3gsIWsNq4Z1gTXEJrHN2Xx2KruY/R27iz2qqaE5QzNKM1ezUvOUZj8H45hx+Jx0TgnnKKeX836K3hTvKeIpG6Y0TLkxZVxrqpaXllirSKtRq0frvTau7aedpr1Fu1n7gQ5Bx0onXCdHZ4/OBZ3nU9lT3acKpxZNPTr1ri6qa6UbobtEd79up+6Ynr5egJ5Mb6feeb3n+hx9L/1U/W36p/VHDFgGswwkBtsMzhg8xTVxbzwdL8fb8VFDXcNAQ6VhlWGX4YSRudE8o9VGjUYPjGnGXOMk423GbcajJgYmISZLTepN7ppSTbmmKaY7TDtMx83MzaLN1pk1mz0x1zLnm+eb15vft2BaeFostqi2uGVJsuRaplnutrxuhVo5WaVYVVpds0atna0l1rutu6cRp7lOk06rntZnw7Dxtsm2qbcZsOXYBtuutm22fWFnYhdnt8Wuw+6TvZN9un2N/T0HDYfZDqsdWh1+c7RyFDpWOt6azpzuP33F9JbpL2dYzxDP2DPjthPLKcRpnVOb00dnF2e5c4PziIuJS4LLLpc+Lpsbxt3IveRKdPVxXeF60vWdm7Obwu2o26/uNu5p7ofcn8w0nymeWTNz0MPIQ+BR5dE/C5+VMGvfrH5PQ0+BZ7XnIy9jL5FXrdewt6V3qvdh7xc+9j5yn+M+4zw33jLeWV/MN8C3yLfLT8Nvnl+F30N/I/9k/3r/0QCngCUBZwOJgUGBWwL7+Hp8Ib+OPzrbZfay2e1BjKC5QRVBj4KtguXBrSFoyOyQrSH355jOkc5pDoVQfujW0Adh5mGLw34MJ4WHhVeGP45wiFga0TGXNXfR3ENz30T6RJZE3ptnMU85ry1KNSo+qi5qPNo3ujS6P8YuZlnM1VidWElsSxw5LiquNm5svt/87fOH4p3iC+N7F5gvyF1weaHOwvSFpxapLhIsOpZATIhOOJTwQRAqqBaMJfITdyWOCnnCHcJnIi/RNtGI2ENcKh5O8kgqTXqS7JG8NXkkxTOlLOW5hCepkLxMDUzdmzqeFpp2IG0yPTq9MYOSkZBxQqohTZO2Z+pn5mZ2y6xlhbL+xW6Lty8elQfJa7OQrAVZLQq2QqboVFoo1yoHsmdlV2a/zYnKOZarnivN7cyzytuQN5zvn//tEsIS4ZK2pYZLVy0dWOa9rGo5sjxxedsK4xUFK4ZWBqw8uIq2Km3VT6vtV5eufr0mek1rgV7ByoLBtQFr6wtVCuWFfevc1+1dT1gvWd+1YfqGnRs+FYmKrhTbF5cVf9go3HjlG4dvyr+Z3JS0qavEuWTPZtJm6ebeLZ5bDpaql+aXDm4N2dq0Dd9WtO319kXbL5fNKNu7g7ZDuaO/PLi8ZafJzs07P1SkVPRU+lQ27tLdtWHX+G7R7ht7vPY07NXbW7z3/T7JvttVAVVN1WbVZftJ+7P3P66Jqun4lvttXa1ObXHtxwPSA/0HIw6217nU1R3SPVRSj9Yr60cOxx++/p3vdy0NNg1VjZzG4iNwRHnk6fcJ3/ceDTradox7rOEH0x92HWcdL2pCmvKaRptTmvtbYlu6T8w+0dbq3nr8R9sfD5w0PFl5SvNUyWna6YLTk2fyz4ydlZ19fi753GDborZ752PO32oPb++6EHTh0kX/i+c7vDvOXPK4dPKy2+UTV7hXmq86X23qdOo8/pPTT8e7nLuarrlca7nuer21e2b36RueN87d9L158Rb/1tWeOT3dvfN6b/fF9/XfFt1+cif9zsu72Xcn7q28T7xf9EDtQdlD3YfVP1v+3Njv3H9qwHeg89HcR/cGhYPP/pH1jw9DBY+Zj8uGDYbrnjg+OTniP3L96fynQ89kzyaeF/6i/suuFxYvfvjV69fO0ZjRoZfyl5O/bXyl/erA6xmv28bCxh6+yXgzMV70VvvtwXfcdx3vo98PT+R8IH8o/2j5sfVT0Kf7kxmTk/8EA5jz/GMzLdsAAAAgY0hSTQAAeiUAAICDAAD5/wAAgOkAAHUwAADqYAAAOpgAABdvkl/FRgAAAkFJREFUeNpi+v//P8OqVatcmVavXt3JwMDwGAAAAP//Yvr//z/D////GZhWr179f/Xq1RMBAAAA//9igqr5D8WKTAwQ0MPAwPCEgYGhBwAAAP//TMtBEUBQAAXA9ZsII8IrIIQOBHF5EdwU42TGffcT+/8e2No+MLAmmaDtMnC3PTEnuV4AAAD//zTOQRGCUAAG4YWrCbxSwQzYYDt452AGHCKQ4H9gAYNwcsabMeDyKLD7nY01SZfkn2ROMiV5n80euABf9VoFA3ArpYyt+gEe9bEDW6Uu6rMFUH8VcgdeaqMOAAcZZIiDMBQE0cdv0jQhQREMGDRB9B5Ihssguc2OhHsg4ACoKhQgSIPAbDGsG7GZee/HHhFVRByHPPRPbJ+BGbCxPU5HdQHewBrosvMFXCX1BTgAVQ4ZAXdgZftWgB3/9wRcJC3T8jaRpulgX2zXwAKY51cDXICmSOqTrQNOwEdSK+nxZZJ8VSIKoyD+24uw3CAIYhAEBZNdbK6r0ShM9AH2abRpNwhnwEfQVaPYDQZBk4KIZTX4p8wut33nMMw3Z2a6d/aqqp93W1WvSfm4gxlUVTvzIfYOgF/gy/ZzrF6KjJHtx+i9Bu5st9MeIOkGWAO+o38VuAJOgTdgPUQXwCYwB9DYHof1CegHdChpT9JI0gpwm/0BMAE+bY8bSUNgPil9BHRm+9L2ie0XYDv7+5jXkzScNv4HOAcWMr8Du6nccn5+SB//4tHs5gmwBeyEdRE46hDtS9pIhk084n8AVJscCePQvIsAAAAASUVORK5CYII=";
ytcenter.gui.createMiddleAlignHack = function(content){
  var e = document.createElement("div"),
      a = document.createElement("span");
  a.className = "yt-dialog-align";
  content.style.verticalAlign = "middle";
  content.style.display = "inline-block";
  
  e.appendChild(a);
  e.appendChild(content);
  return e;
};
ytcenter.gui.createYouTubeButtonIcon = function(src){
  var wrapper = document.createElement("span");
  wrapper.className = "yt-uix-button-icon-wrapper";
  
  var img = document.createElement("img");
  img.src = src;
  img.alt = "";
  img.style.marginLeft = "3px";
  
  wrapper.appendChild(img);
  return wrapper;
};
ytcenter.gui.createYouTubeButtonArrow = function(){
  var img = document.createElement("img");
  img.className = "yt-uix-button-arrow";
  img.src = "//s.ytimg.com/yts/img/pixel-vfl3z5WfW.gif";
  img.alt = "";
  
  return img;
};
ytcenter.gui.createYouTubeTextInput = function(){
  var elm = document.createElement("input");
  elm.setAttribute("type", "text");
  elm.className = "yt-uix-form-input-text";
  
  return elm;
};
ytcenter.gui.createYouTubeCheckBox = function(selected){
  if (typeof selected === "undefined") selected = false;
  var cw = document.createElement("span");
  cw.className = "yt-uix-form-input-checkbox-container" + (selected ? " checked" : "");
  cw.style.height = "auto";
  var checkbox = document.createElement("input");
  checkbox.setAttribute("type", "checkbox");
  checkbox.setAttribute("value", "true");
  checkbox.className = "yt-uix-form-input-checkbox";
  if (selected) checkbox.checked = true;
  var elm = document.createElement("span");
  elm.className = "yt-uix-form-input-checkbox-element";
  cw.appendChild(checkbox);
  cw.appendChild(elm);
  
  return cw;
};
ytcenter.gui.createYouTubeButtonText = function(text){
  var wrapper = document.createElement("span");
  wrapper.className = "yt-uix-button-content";
  
  wrapper.textContent = text;
  return wrapper;
};
ytcenter.gui.createYouTubeButtonTextLabel = function(label){
  var wrapper = document.createElement("span");
  wrapper.className = "yt-uix-button-content";
  wrapper.textContent = ytcenter.language.getLocale(label);
  ytcenter.language.addLocaleElement(wrapper, label, "@textContent");
  
  return wrapper;
};
ytcenter.gui.createYouTubeButton = function(title, content, styles){
  var btn = document.createElement("button");
  if (typeof title === "string" && title !== "") {
    btn.setAttribute("title", ytcenter.language.getLocale(title));
    ytcenter.language.addLocaleElement(btn, title, "title");
  }
  btn.setAttribute("role", "button");
  btn.setAttribute("type", "button");
  btn.setAttribute("onclick", ";return false;");
  btn.className = "yt-uix-tooltip-reverse yt-uix-button yt-uix-button-text yt-uix-tooltip";
  
  if (typeof styles !== "undefined") {
    for (var key in styles) {
      if (styles.hasOwnProperty(key)) {
        btn.style[key] = styles[key];
      }
    }
  }
  
  for (var i = 0; i < content.length; i++) {
    btn.appendChild(content[i]);
  }
  return btn;
};
ytcenter.gui.createYouTubeDefaultButton = function(title, content, styles){
  var btn = document.createElement("button");
  if (title !== "") {
    btn.setAttribute("title", ytcenter.language.getLocale(title));
    ytcenter.language.addLocaleElement(btn, title, "title");
  }
  btn.setAttribute("role", "button");
  btn.setAttribute("type", "button");
  btn.setAttribute("onclick", ";return false;");
  btn.className = "yt-uix-button yt-uix-button-default yt-uix-tooltip";
  
  if (typeof styles !== "undefined") {
    for (var key in styles) {
      if (styles.hasOwnProperty(key)) {
        btn.style[key] = styles[key];
      }
    }
  }
  
  for (var i = 0; i < content.length; i++) {
    btn.appendChild(content[i]);
  }
  return btn;
};
ytcenter.gui.createYouTubePrimaryButton = function(title, content, styles){
  var btn = document.createElement("button");
  if (title !== "") {
    btn.setAttribute("title", ytcenter.language.getLocale(title));
    ytcenter.language.addLocaleElement(btn, title, "title");
  }
  btn.setAttribute("role", "button");
  btn.setAttribute("type", "button");
  btn.setAttribute("onclick", ";return false;");
  btn.setAttribute("class", "yt-uix-tooltip-reverse yt-uix-button yt-uix-button-primary yt-uix-tooltip");
  
  if (typeof styles !== "undefined") {
    for (var key in styles) {
      if (styles.hasOwnProperty(key)) {
        btn.style[key] = styles[key];
      }
    }
  }
  
  for (var i = 0; i < content.length; i++) {
    btn.appendChild(content[i]);
  }
  return btn;
};
ytcenter.gui.createYouTubeButtonGroup = function(buttons){
  // <span style="margin: 0px 4px 0px 0px;" class="yt-uix-button-group yt-uix-tooltip-reverse"> start end
  var wrapper = document.createElement("span");
  wrapper.className = "yt-uix-button-group";
  
  for (var i = 0; i < buttons.length; i++) {
    if (i == 0) {
      ytcenter.utils.addClass(buttons[i], "start");
    } else {
      ytcenter.utils.removeClass(buttons[i], "start");
    }
    if (i === buttons.length-1) {
      ytcenter.utils.addClass(buttons[i], "end");
    } else {
      ytcenter.utils.removeClass(buttons[i], "end");
    }
    wrapper.appendChild(buttons[i]);
  }
  
  return wrapper;
};
ytcenter.gui.createYouTubeGuideHelpBoxAfter = function(){
  var after = document.createElement("div");
  after.className = "after";
  
  return after;
};
ytcenter.gui.createMask = function(zIndex){
  zIndex = zIndex || "4";
  var iframe = document.createElement("iframe");
  iframe.setAttribute("frameborder", "0");
  iframe.setAttribute("src", "");
  iframe.style.position = "absolute";
  iframe.style.top = "0px";
  iframe.style.left = "0px";
  iframe.style.width = "100%";
  iframe.style.height = "100%";
  iframe.style.overflow = "hidden";
  iframe.style.zIndex = zIndex;
  
  return iframe;
};
ytcenter.utils = {};
ytcenter.utils.getScrollOffset = function(){
  var top = Math.max(document.body.scrollTop, document.documentElement.scrollTop),
      left = Math.max(document.body.scrollLeft, document.documentElement.scrollLeft);
  return {top:top,left:left};
};
ytcenter.utils.getOffset = function(elm, toElement){
  var _x = 0, _y = 0;
  while(elm && elm !== toElement && !isNaN(elm.offsetLeft) && !isNaN(elm.offsetTop)) {
    _x += elm.offsetLeft - elm.scrollLeft;
    _y += elm.offsetTop - elm.scrollTop;
    elm = elm.offsetParent;
  }
  return { top: _y, left: _x };
};
ytcenter.utils.wrapModule = function(module, tagname){
  var a = document.createElement(tagname || "span");
  a.appendChild(module.element);
  return a;
};
ytcenter.utils.isArray = function(arr){
  return Object.prototype.toString.call(arr) === "[object Array]";
};
ytcenter.utils.each = function(obj, callback){
  if (ytcenter.utils.isArray(obj)) {
    for (var i = 0; i < obj.length; i++) {
      if (callback(i, obj[i]) === true) break;
    }
  } else {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (callback(key, obj[key]) === true) break;
      }
    }
  }
};
ytcenter.utils.mergeObjects = function(){
  var _o = {};
  for (var i = 0; i < arguments.length; i++) {
    if (typeof arguments[i] === "undefined") continue;
    ytcenter.utils.each(arguments[i], function(key, value){
      _o[key] = value;
    });
  }
  return _o;
};
ytcenter.utils.getRGB = function(h, s, v){
  h = h/360 * 6;
  s = s/100;
  v = v/100;

  var i = Math.floor(h),
      f = h - i,
      p = v * (1 - s),
      q = v * (1 - f * s),
      t = v * (1 - (1 - f) * s),
      mod = i % 6,
      r = [v, q, p, p, t, v][mod],
      g = [t, v, v, q, p, p][mod],
      b = [p, p, t, v, v, q][mod];

  return {red: r * 255, green: g * 255, blue: b * 255};
};
ytcenter.utils.getHSV = function(r, g, b) {
  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var h, s, v = max;

  var d = max - min;
  s = max === 0 ? 0 : d / max;

  if (max == min) {
    h = 0;
  } else {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return {hue: h*360, saturation: s*100, value: v/255*100};
};
ytcenter.utils.hsvToHex = function(hue, sat, val){
  var rgb = ytcenter.utils.getRGB(hue, sat, val);
  return ytcenter.utils.colorToHex(rgb.red, rgb.green, rgb.blue);
};
ytcenter.utils.colorToHex = function(red, green, blue){
  red = Math.round(red);
  green = Math.round(green);
  blue = Math.round(blue);
  if (red > 255) red = 255;
  if (red < 0) red = 0;
  if (green > 255) green = 255;
  if (green < 0) green = 0;
  if (blue > 255) blue = 255;
  if (blue < 0) blue = 0;
  var r = red.toString(16);
  if (r.length === 1) r = "0" + r;
  var g = green.toString(16);
  if (g.length === 1) g = "0" + g;
  var b = blue.toString(16);
  if (b.length === 1) b = "0" + b;
  r = r.toUpperCase();
  g = g.toUpperCase();
  b = b.toUpperCase();
  return "#" + r + g + b;
};
ytcenter.utils.hexToColor = function(hex){
  if (hex.indexOf("#") === 0) hex = hex.substring(1);
  var r,g,b;
  if (hex.length === 6) {
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  } else if (hex.length === 3) {
    r = parseInt(hex.substring(0, 1) + hex.substring(0, 1), 16);
    g = parseInt(hex.substring(1, 2) + hex.substring(1, 2), 16);
    b = parseInt(hex.substring(2, 3) + hex.substring(2, 3), 16);
  } else {
    r = 0;
    g = 0;
    b = 0;
  }
  return {red: r, green: g, blue: b};
};
ytcenter.utils.isNode = function(a){
  if (typeof Node === "object") {
    return a instanceof Node;
  } else if (a && typeof a === "object" && typeof a.nodeType === "number" && typeof a.nodeName === "string") {
    return true;
  }
  return false;
};
ytcenter.utils.escapeRegExp = function(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
};
ytcenter.utils.replaceTextToText = function(text, replacer){
  var regex, arr = [], tmp = "";
  for (key in replacer) {
    if (replacer.hasOwnProperty(key)) {
      arr.push(ytcenter.utils.escapeRegExp(key));
    }
  }
  regex = new RegExp(arr.join("|") + "|.", "g");
  text.replace(regex, function(matched){
    if (replacer[matched]) {
      if (typeof replacer[matched] === "function") {
        var a = replacer[matched]();
        if (typeof a === "string") {
          tmp += a;
        } else {
          con.error("[TextReplace] Unknown type of replacer!");
        }
      } else if (typeof replacer[matched] === "string") {
        tmp += replacer[matched];
      } else {
        con.error("[TextReplace] Unknown type of replacer!");
      }
    } else {
      tmp += matched;
    }
  });
  
  return tmp;
};

ytcenter.utils.replaceText = function(text, replacer){
  var frag = document.createDocumentFragment(),
      regex, arr = [], tmp = "";
  for (key in replacer) {
    if (replacer.hasOwnProperty(key)) {
      arr.push(ytcenter.utils.escapeRegExp(key));
    }
  }
  regex = new RegExp(arr.join("|") + "|.", "g");
  text.replace(regex, function(matched){
    if (replacer[matched]) {
      if (tmp !== "") {
        frag.appendChild(document.createTextNode(tmp));
        tmp = "";
      }
      if (typeof replacer[matched] === "function") {
        var a = replacer[matched]();
        if (typeof a === "string") {
          frag.appendChild(document.createTextNode(a));
        } else if (ytcenter.utils.isNode(a)) {
          frag.appendChild(a);
        } else {
          con.error("[TextReplace] Unknown type of replacer!");
        }
      } else if (typeof replacer[matched] === "string") {
        frag.appendChild(document.createTextNode(replacer[matched]));
      } else if (ytcenter.utils.isNode(replacer[matched])) {
        frag.appendChild(replacer[matched]);
      } else {
        con.error("[TextReplace] Unknown type of replacer!");
      }
    } else {
      tmp += matched;
    }
  });
  if (tmp !== "") {
    frag.appendChild(document.createTextNode(tmp));
    tmp = "";
  }
  
  return frag;
};
ytcenter.utils.inArrayIndex = function(a, v){
  for (var i = 0; i < a.length; i++) {
    if (a[i] === v) return i;
  }
  return -1;
};
ytcenter.utils.inArray = function(a, v){
  for (var i = 0; i < a.length; i++) {
    if (a[i] === v) return true;
  }
  return false;
};
ytcenter.utils.cleanClasses = function(elm){
  if (typeof elm === "undefined") return;
  var classNames = elm.className.split(" "),
      i, _new = [];
  for (i = 0; i < classNames.length; i++) {
    if (classNames[i] !== "" && !ytcenter.utils.inArray(_new, classNames[i])) {
      _new.push(classNames[i]);
    }
  }
  elm.className = _new.join(" ");
};
ytcenter.utils.hasClass = function(elm, className){
  if (typeof elm === "undefined") return;
  var classNames = elm.className.split(" "),
      i;
  for (i = 0; i < classNames.length; i++) {
    if (classNames[i] === className) return true;
  }
  return false;
};
ytcenter.utils.toggleClass = function(elm, className){
  if (typeof elm === "undefined") return;
  if (ytcenter.utils.hasClass(elm, className)) {
    ytcenter.utils.removeClass(elm, className);
  } else {
    ytcenter.utils.addClass(elm, className);
  }
};
ytcenter.utils.addClass = function(elm, className){
  if (typeof elm === "undefined") return;
  var classNames = elm.className.split(" "),
      addClassNames = className.split(" "),
      _new = [],
      i, j, found;
  for (i = 0; i < addClassNames.length; i++) {
    found = false;
    for (j = 0; j < classNames.length; j++) {
      if (addClassNames[i] === classNames[j]) {
        found = true;
        break;
      }
    }
    if (!found) {
      _new.push(addClassNames[i]);
    }
  }
  elm.className += " " + _new.join(" ");
  ytcenter.utils.cleanClasses(elm);
};
ytcenter.utils.removeClass = function(elm, className){
  if (typeof elm === "undefined") return;
  var classNames = elm.className.split(" "),
      remClassNames = className.split(" "),
      _new = [],
      i, j, found;
  for (var i = 0; i < classNames.length; i++) {
    if (classNames[i] === "") continue;
    found = false;
    for (j = 0; j < remClassNames.length; j++) {
      if (classNames[i] === remClassNames[j]) {
        found = true;
        break;
      }
    }
    if (!found) {
      _new.push(classNames[i]);
    }
  }
  elm.className = _new.join(" ");
};
ytcenter.utils.addEventListener = (function(){
  var listeners = [];
  ytcenter.utils.removeEventListener = function(elm, event, callback, useCapture){
    var i;
    if (elm.removeEventListener) {
      elm.removeEventListener(event, callback, useCapture || false);
    }
    for (i = 0; i < listeners.length; i++) {
      if (listeners[i].elm === elm && listeners[i].event === event && listeners[i].callback === callback && listeners[i].useCapture === useCapture) {
        listeners.splice(i, 1);
        break;
      }
    }
  };
  return function(elm, event, callback, useCapture){
    listeners.push({elm: elm, event: event, callback: callback, useCapture: useCapture});
    if (elm.addEventListener) {
      elm.addEventListener(event, callback, useCapture || false);
    } else if (elm.attachEvent) {
      elm.attachEvent("on" + event, callback);
    }
  };
})();

ytcenter.language = {};
ytcenter.language.db = {
  COLORPICKER_COLOR_RED: "Red",
  COLORPICKER_COLOR_GREEN: "Green",
  COLORPICKER_COLOR_BLUE: "Blue",
  COLORPICKER_COLOR_HTMLCODE: "HTML Code",
  COLORPICKER_CANCEL: "Cancel",
  COLORPICKER_SAVE: "Save",
  COLORPICKER_TITLE: "Color Picker",
  SETTINGS_HELP_ABOUT: "Help about {option}."
};
ytcenter.language.getLocale = function(lang){
  return ytcenter.language.db[lang] || lang;
};
ytcenter.language.addLocaleElement = function(){}; // Just a tmp

ytcenter.dialog = function(titleLabel, content, actions, alignment){
  var __r = {}, ___parent_dialog = null, bgOverlay, root, base, fg, fgContent, footer, eventListeners = {}, actionButtons = {};
  alignment = alignment || "center";
  
  bgOverlay = ytcenter.dialogOverlay();
  root = document.createElement("div");
  root.className = "yt-dialog";
  base = document.createElement("div");
  base.className = "yt-dialog-base";
  
  fg = document.createElement("div");
  fg.className = "yt-dialog-fg";
  fgContent = document.createElement("div");
  fgContent.className = "yt-dialog-fg-content yt-dialog-show-content";
  fg.appendChild(fgContent);
  
  
  if (alignment === "center") {
    var align = document.createElement("span");
    align.className = "yt-dialog-align";
    base.appendChild(align);
  } else {
    fg.style.margin = "13px 0";
  }
  
  base.appendChild(fg);
  root.appendChild(base);
  
  if (typeof titleLabel === "string" && titleLabel !== "") {
    var header = document.createElement("div");
    header.className = "yt-dialog-header";
    var title = document.createElement("h2");
    title.className = "yt-dialog-title";
    title.textContent = ytcenter.language.getLocale(titleLabel);
    
    header.appendChild(title);
    fgContent.appendChild(header);
  } else {
    var header = document.createElement("div");
    header.style.margin = "0 -20px 20px";
    fgContent.appendChild(header);
  }
  if (typeof content !== "undefined") {
    var cnt = document.createElement("div");
    cnt.className = "yt-dialog-content";
    cnt.appendChild(content);
    fgContent.appendChild(cnt);
  }
  footer = document.createElement("div");
  footer.className = "yt-dialog-footer";
  fgContent.appendChild(footer);
  if (typeof actions !== "undefined") {
    /* Array
     *   Object
     *     label: "",
     *     primary: false, # Should be the primary button.
     *     callback: Function
     */
    for (var i = 0; i < actions.length; i++) {
      var btn = document.createElement("button");
      btn.setAttribute("type", "button");
      btn.setAttribute("role", "button");
      btn.setAttribute("onclick", ";return false;");
      btn.className = "yt-uix-button " + (actions[i].primary ? "yt-uix-button-primary" : "yt-uix-button-default");
      if (typeof actions[i].callback === "function") {
        btn.addEventListener("click", actions[i].callback, false);
      }
      var btnContent = document.createElement("span");
      btnContent.className = "yt-uix-button-content";
      btnContent.textContent = ytcenter.language.getLocale(actions[i].label);
      
      btn.appendChild(btnContent);
      footer.appendChild(btn);
      
      if (actions[i].name) actionButtons[actions[i].name] = btn;
    }
  } else { // Default
    var closeBtn = document.createElement("button");
    closeBtn.setAttribute("type", "button");
    closeBtn.setAttribute("role", "button");
    closeBtn.setAttribute("onclick", ";return false;");
    closeBtn.className = "yt-uix-button yt-uix-button-default";
    
    closeBtn.addEventListener("click", function(){
      __r.setVisibility(false);
    }, false);
    
    var closeContent = document.createElement("span");
    closeContent.className = "yt-uix-button-content";
    closeContent.textContent = ytcenter.language.getLocale("DIALOG_CLOSE");
    
    closeBtn.appendChild(closeContent);
    footer.appendChild(closeBtn);
    actionButtons['close'] = btn;
  }
  __r.getActionButton = function(name){
    return actionButtons[name];
  };
  __r.addEventListener = function(eventName, func){
    if (!eventListeners.hasOwnProperty(eventName)) eventListeners[eventName] = [];
    eventListeners[eventName].push(func);
    return eventListeners[eventName].length - 1;
  };
  __r.removeEventListener = function(eventName, index){
    if (!eventListeners.hasOwnProperty(eventName)) return;
    if (index < 0 && index >= eventListeners[eventName].length) return;
    eventListeners[eventName].splice(index, 1);
  };
  __r.setWidth = function(width){
    fg.style.width = width;
  };
  __r.getBase = function(){
    return base;
  };
  __r.getContent = function(){
    return cnt;
  };
  __r.getFooter = function(){
    return footer;
  };
  __r.getHeader = function(){
    return header;
  };
  __r.setPureVisibility = function(visible){
    if (visible) {
      if (!root.parentNode) document.body.appendChild(root);
      else {
        root.parentNode.removeChild(root);
        document.body.appendChild(root);
      }
      if (!bgOverlay.parentNode) document.body.appendChild(bgOverlay);
      else {
        bgOverlay.parentNode.removeChild(bgOverlay);
        document.body.appendChild(bgOverlay);
      }
      if (document.getElementById("player-api-legacy") || document.getElementById("player-api")) (document.getElementById("player-api-legacy") || document.getElementById("player-api")).style.visibility = "hidden";
    } else {
      if (root.parentNode) root.parentNode.removeChild(root);
      if (bgOverlay.parentNode) bgOverlay.parentNode.removeChild(bgOverlay);
      if ((document.getElementById("player-api-legacy") || document.getElementById("player-api")) && !___parent_dialog) (document.getElementById("player-api-legacy") || document.getElementById("player-api")).style.visibility = "";
    }
  };
  __r.setFocus = function(focus){
    if (!base) {
      con.error("[Dialog.setFocus] base element was not found!");
      return;
    }
    if (focus) {
      base.style.zIndex = "";
    } else {
      base.style.zIndex = "1998";
    }
  };
  __r.setVisibility = function(visible){
    if (eventListeners["visibility"]) {
      for (var i = 0; i < eventListeners["visibility"].length; i++) {
        eventListeners["visibility"][i](visible);
      }
    }
    if (visible) {
      if (document.body) ytcenter.utils.addClass(document.body, "yt-dialog-active");
      ___parent_dialog = ytcenter._dialogVisible;
      if (___parent_dialog) {
        ___parent_dialog.setFocus(false);
      }
      __r.setPureVisibility(true);
      
      ytcenter._dialogVisible = __r;
    } else {
      __r.setPureVisibility(false);
      
      if (___parent_dialog) {
        ___parent_dialog.setFocus(true);
        ytcenter._dialogVisible = ___parent_dialog;
      } else {
        ytcenter._dialogVisible = null;
        if (document.body) ytcenter.utils.removeClass(document.body, "yt-dialog-active");
      }
    }
  };
  return __r;
};
ytcenter.dialogOverlay = function(){
  var bg = document.createElement("div");
  bg.id = "yt-dialog-bg";
  bg.className = "yt-dialog-bg";
  bg.style.height = "100%";
  bg.style.position = "absolute";
  return bg;
};


/******************************* END OF YOUTUBE CENTER PLACEHOLDERS *******************************/



/***** Module part *****/
ytcenter.modules = {};
ytcenter.modules.importexport = function(){
  var textLabel = ytcenter.gui.createYouTubeButtonTextLabel("SETTINGS_IMEX_TITLE"),
      content = document.createElement("div"),
      VALIDATOR_STRING = "YTCSettings=>",
      dropZone = document.createElement("div"),
      dropZoneContent = document.createElement("div"),
      filechooser = document.createElement("input"),
      settingsPool = document.createElement("textarea"),
      dialog = ytcenter.dialog("SETTINGS_IMEX_TITLE", content, [
        {
          label: "SETTINGS_IMEX_CANCEL",
          primary: false,
          callback: function(){
            dialog.setVisibility(false);
          }
        }, {
          name: "save",
          label: "SETTINGS_IMEX_SAVE",
          primary: true,
          callback: function(){
            if (!saveEnabled) return;
            ytcenter.settings = JSON.parse(settingsPool.value);
            ytcenter.saveSettings();
            loc.reload();
          }
        }
      ]),
      status,
      loadingText = document.createElement("div"),
      messageText = document.createElement("div"),
      messageTimer,
      dropZoneEnabled = true,
      saveEnabled = true,
      pushMessage = function(message, color, timer){
        //dropZoneEnabled = false;
        messageText.textContent = message;
        messageText.style.display = "inline-block";
        if (typeof color === "string") messageText.style.color = color;
        else messageText.style.color = "";
        
        status.style.display = "";
        dropZoneContent.style.visibility = "hidden";
        uw.clearTimeout(messageTimer);
        if (typeof timer === "number") {
          messageTimer = uw.setTimeout(function(){
            removeMessage();
          }, timer);
        }
      },
      removeMessage = function(){
        status.style.display = "none";
        dropZoneContent.style.visibility = "";
        
        messageText.style.display = "none";
        messageText.textContent = "";
        //dropZoneEnabled = true;
        uw.clearTimeout(messageTimer);
      },
      validateFileAndLoad = function(file){
        dropZone.style.border = "2px dashed rgb(187, 187, 187)";
        pushMessage(ytcenter.language.getLocale("SETTINGS_IMEX_VALIDATE"));
        
        var reader = new FileReader();
        reader.onerror = function(e){
          switch (e.target.error.code) {
            case e.target.error.NOT_FOUND_ERR:
              pushMessage(ytcenter.language.getLocale("SETTINGS_IMEX_IMPORT_ERROR_NOT_FOUND"), "#ff0000", 10000);
              break;
            case e.target.error.NOT_READABLE_ERR:
              pushMessage(ytcenter.language.getLocale("SETTINGS_IMEX_IMPORT_ERROR_NOT_READABLE"), "#ff0000", 10000);
              break;
            case e.target.error.ABORT_ERR:
              pushMessage(ytcenter.language.getLocale("SETTINGS_IMEX_IMPORT_ERROR_ABORT"), "#ff0000", 10000);
              break;
            default:
              pushMessage(ytcenter.language.getLocale("SETTINGS_IMEX_IMPORT_ERROR_UNKNOWN"), "#ff0000", 10000);
              break;
          }
        };
        reader.onabort = function(){
          pushMessage(ytcenter.language.getLocale("SETTINGS_IMEX_IMPORT_ERROR_ABORT"), "#ff0000", 10000);
        };
        reader.onload = function(e){
          if (e.target.result === VALIDATOR_STRING) {
            readFile(file);
          } else {
            pushMessage(ytcenter.language.getLocale("SETTINGS_IMEX_VALIDATE_ERROR_NOT_VALID"), "#ff0000", 3500);
            
          }
        };
        
        reader.readAsText(file.slice(0, VALIDATOR_STRING.length));
      },
      readFile = function(file){
        pushMessage(ytcenter.language.getLocale("SETTINGS_IMEX_LOADING"));
        
        var reader = new FileReader();
        reader.onerror = function(e){
          switch (e.target.error.code) {
            case e.target.error.NOT_FOUND_ERR:
              pushMessage(ytcenter.language.getLocale("SETTINGS_IMEX_IMPORT_ERROR_NOT_FOUND"), "#ff0000", 10000);
              break;
            case e.target.error.NOT_READABLE_ERR:
              pushMessage(ytcenter.language.getLocale("SETTINGS_IMEX_IMPORT_ERROR_NOT_READABLE"), "#ff0000", 10000);
              break;
            case e.target.error.ABORT_ERR:
              pushMessage(ytcenter.language.getLocale("SETTINGS_IMEX_IMPORT_ERROR_ABORT"), "#ff0000", 10000);
              break;
            default:
              pushMessage(ytcenter.language.getLocale("SETTINGS_IMEX_IMPORT_ERROR_UNKNOWN"), "#ff0000", 10000);
              break;
          }
        };
        reader.onabort = function(){
          pushMessage(ytcenter.language.getLocale("SETTINGS_IMEX_IMPORT_ERROR_ABORT"), "#ff0000", 10000);
        };
        reader.onload = function(e){
          settingsPool.value = e.target.result;
          pushMessage(ytcenter.language.getLocale("SETTINGS_IMEX_IMPORT_MESSAGE"), "", 10000);
        };
        
        reader.readAsText(file.slice(VALIDATOR_STRING.length));
      },
      exportFileButtonLabel = ytcenter.gui.createYouTubeButtonTextLabel("SETTINGS_IMEX_EXPORT_AS_FILE"),
      exportFileButton = ytcenter.gui.createYouTubeDefaultButton("", [exportFileButtonLabel]),
      statusContainer = document.createElement("div");
  var elm = ytcenter.gui.createYouTubeDefaultButton("", [textLabel]);
  
  // Message Text
  messageText.style.fontWeight = "bold";
  messageText.style.fontSize = "16px";
  messageText.style.textAlign = "center";
  messageText.style.width = "100%";
  messageText.style.display = "none";
  
  status = ytcenter.gui.createMiddleAlignHack(messageText);
  status.style.position = "absolute";
  status.style.top = "0px";
  status.style.left = "0px";
  status.style.width = "100%";
  status.style.height = "100%";
  status.style.display = "none";
  
  filechooser.setAttribute("type", "file");
  ytcenter.utils.addEventListener(elm, "click", function(){
    dialog.setVisibility(true);
  }, false);
  var __f = function(e){
    validateFileAndLoad(e.target.files[0]);
    
    var newNode = document.createElement("input");
    newNode.setAttribute("type", "file");
    ytcenter.utils.addEventListener(newNode, "change", __f, false);
    filechooser.parentNode.replaceChild(newNode, filechooser);
    filechooser = newNode;
  };
  ytcenter.utils.addEventListener(filechooser, "change", __f, false);
  
  ytcenter.utils.addEventListener(dropZone, "drop", function(e){
    e.stopPropagation();
    e.preventDefault();
    
    validateFileAndLoad(e.dataTransfer.files[0]);
  }, false);
  
  ytcenter.utils.addEventListener(dropZone, "dragover", function(e){
    if (!dropZoneEnabled) return;
    e.stopPropagation();
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    dropZone.style.border = "2px dashed rgb(130, 130, 130)";
  }, false);
  ytcenter.utils.addEventListener(dropZone, "dragleave", function(e){
    if (!dropZoneEnabled) return;
    dropZone.style.border = "2px dashed rgb(187, 187, 187)";
    e.dataTransfer.dropEffect = "none";
  }, false);
  ytcenter.utils.addEventListener(dropZone, "dragend", function(e){
    if (!dropZoneEnabled) return;
    dropZone.style.border = "2px dashed rgb(187, 187, 187)";
    e.dataTransfer.dropEffect = "none";
  }, false);
  var text1 = document.createElement("span");
  text1.style.fontWeight = "bold";
  text1.style.fontSize = "16px";
  text1.textContent = ytcenter.language.getLocale("SETTINGS_IMEX_DROPFILEHERE");
  ytcenter.language.addLocaleElement(text1, "SETTINGS_IMEX_DROPFILEHERE", "@textContent");
  dropZoneContent.appendChild(text1);
  dropZoneContent.appendChild(document.createElement("br"));
  var text2 = document.createTextNode(ytcenter.language.getLocale("SETTINGS_IMEX_OR"));
  ytcenter.language.addLocaleElement(text2, "SETTINGS_IMEX_OR", "@textContent");
  dropZoneContent.appendChild(text2);
  dropZoneContent.appendChild(document.createTextNode(" "));
  dropZoneContent.appendChild(filechooser);
  
  dropZone.style.position = "relative";
  dropZone.style.border = "2px dashed rgb(187, 187, 187)";
  dropZone.style.borderRadius = "4px";
  dropZone.style.color = "rgb(110, 110, 110)";
  dropZone.style.padding = "20px 0";
  dropZone.style.width = "100%";
  dropZone.style.marginBottom = "10px";
  dropZone.style.textAlign = "center";
  settingsPool.style.width = "100%";
  settingsPool.style.height = "120px";
  
  dropZoneContent.style.margin = "0 auto";
  dropZoneContent.style.display = "inline-block";
  dropZoneContent.style.textAlign = "left";
  
  dropZone.appendChild(dropZoneContent);
  dropZone.appendChild(status);
  content.appendChild(dropZone);
  content.appendChild(settingsPool);
  
  dialog.setWidth("490px");
  
  var settingsPoolChecker = function(){
    try {
      JSON.parse(settingsPool.value);
      dialog.getActionButton("save").disabled = false;
      settingsPool.style.background = "";
      saveEnabled = true;
    } catch (e) {
      dialog.getActionButton("save").disabled  = true;
      settingsPool.style.background = "#FFAAAA";
      saveEnabled = false;
    }
  };
  
  ytcenter.utils.addEventListener(settingsPool, "input", settingsPoolChecker, false);
  ytcenter.utils.addEventListener(settingsPool, "keyup", settingsPoolChecker, false);
  ytcenter.utils.addEventListener(settingsPool, "paste", settingsPoolChecker, false);
  ytcenter.utils.addEventListener(settingsPool, "change", settingsPoolChecker, false);
  
  dialog.addEventListener("visibility", function(visible){
    if (visible) settingsPool.value = JSON.stringify(ytcenter.settings);
    else settingsPool.value = "";
  });
  
  ytcenter.utils.addEventListener(exportFileButton, "click", function(){
    var bb = new ytcenter.io.BlobBuilder();
    bb.append(VALIDATOR_STRING + settingsPool.value);
    ytcenter.io.saveAs(bb.getBlob("text/plain"), "ytcenter-settings.ytcs");
  }, false);
  
  content.appendChild(exportFileButton);
  
  return {
    element: elm,
    bind: function(){},
    update: function(){}
  };
};
ytcenter.modules.translators = function(option){
  option = typeof option !== "undefined" ? option : false;
  var elm = document.createElement("div");
  
  var translators = document.createElement("div");
  ytcenter.utils.each(option.args.translators, function(key, value){
    if (value.length > 0) {
      var entry = document.createElement("div");
      entry.appendChild(document.createTextNode(ytcenter.language.getLocale("LANGUAGE", key) + " (" + ytcenter.language.getLocale("LANGUAGE_ENGLISH", key) + ") - "));
      for (var i = 0; i < value.length; i++) {
        if (i > 0) entry.appendChild(document.createTextNode(" & "));
        var el;
        if (value[i].url) {
          el = document.createElement("a");
          el.href = value[i].url;
          el.textContent = value[i].name;
          el.setAttribute("target", "_blank");
        } else {
          el = document.createTextNode(value[i].name);
        }
        entry.appendChild(el);
      }
      translators.appendChild(entry);
    }
  });
  elm.appendChild(translators);
  
  return {
    element: elm,
    bind: function(){},
    update: function(){}
  };
};
ytcenter.modules.aboutText = function(option){
  var elm = document.createElement("div");
  
  var content1 = document.createElement("div");
  content1.textContent = ytcenter.language.getLocale("SETTINGS_ABOUT_COPYRIGHTS");
  ytcenter.language.addLocaleElement(content1, "SETTINGS_ABOUT_COPYRIGHTS", "@textContent", {});
  
  var content2 = document.createElement("div");
  content2.textContent = ytcenter.language.getLocale("SETTINGS_ABOUT_CONTACTSINFO");
  ytcenter.language.addLocaleElement(content2, "SETTINGS_ABOUT_CONTACTSINFO", "@textContent", {});
  
  var contact = document.createElement("div"),
      contactText = document.createTextNode(ytcenter.language.getLocale("SETTINGS_ABOUT_EMAIL")),
      contactTextEnd = document.createTextNode(":"),
      contactLink = document.createElement("a");
  ytcenter.language.addLocaleElement(contactText, "SETTINGS_ABOUT_EMAIL", "@textContent", {});
  
  contactLink.href = "mailto:jepperm@gmail.com";
  contactLink.textContent = "jepperm@gmail.com";
  
  contact.appendChild(contactText);
  contact.appendChild(contactTextEnd);
  contact.appendChild(contactLink);
  
  elm.appendChild(content1);
  elm.appendChild(document.createElement("br"));
  elm.appendChild(content2);
  elm.appendChild(contact);
  
  return {
    element: elm,
    bind: function(){},
    update: function(){}
  };
};
ytcenter.modules.link = function(){
  var elm = document.createElement("div"),
      title = document.createElement("b");
  if (option && option.args && option.args.titleLocale) {
    var __t1 = document.createTextNode(ytcenter.language.getLocale(option.args.titleLocale)),
        __t2 = document.createTextNode(":");
    ytcenter.language.addLocaleElement(__t1, option.args.titleLocale, "@textContent", option.args.replace || {});
    title.appendChild(__t1);
    title.appendChild(__t2);
  } else if (option && option.args && option.args.title) {
    title.textContent = option.args.title + ":";
  }
  var content = document.createElement("div");
  content.style.marginLeft = "20px";
  
  for (var i = 0; i < option.args.links.length; i++) {
    if (i > 0) content.appendChild(document.createElement("br"));
    var __a = document.createElement("a");
    __a.href = option.args.links[i].url;
    __a.textContent = option.args.links[i].text;
    __a.setAttribute("target", "_blank");
    content.appendChild(__a);
  }
  elm.appendChild(title);
  elm.appendChild(content);
  
  return {
    element: elm,
    bind: function(){},
    update: function(){}
  };
};
ytcenter.modules.textContent = function(option){
  var elm = document.createElement("div");
  if (option && option.args && option.args.style) {
    for (var key in option.args.style) {
      if (option.args.style.hasOwnProperty(key)) {
        elm.style[key] = option.args.style[key];
      }
    }
  }
  if (option && option.args && option.args.text) {
    if (option && option.args && option.args.replace) {
      elm.textContent = ytcenter.utils.replaceTextAsString(option.args.text, option.args.replace);
    } else {
      elm.textContent = option.args.text;
    }
  }
  if (option && option.args && option.args.textlocale) {
    if (option && option.args && option.args.replace) {
      elm.textContent = ytcenter.utils.replaceTextAsString(ytcenter.language.getLocale(option.args.textlocale), option.args.replace);
    } else {
      elm.textContent = ytcenter.language.getLocale(option.args.textlocale);
    }
    
    ytcenter.language.addLocaleElement(elm, option.args.textlocale, "@textContent", option.args.replace || {});
  }
  if (option && option.args && option.args.listeners) {
    for (var i = 0; i < option.args.listeners.length; i++) {
      elm.addEventListener(option.args.listeners[i].event, option.args.listeners[i].callback, (option.args.listeners[i].bubble ? option.args.listeners[i].bubble : false));
    }
  }
  if (option && option.args && option.args.style) {
    for (var key in option.args.style) {
      if (option.args.style.hasOwnProperty(key)) {
        elm.style[key] = option.args.style[key];
      }
    }
  }
  return {
    element: elm,
    bind: function(){},
    update: function(){}
  };
};
ytcenter.modules.newline = function(option){
  var elm = document.createElement("br");
  if (option && option.args && option.args.style) {
    for (var key in option.args.style) {
      if (option.args.style.hasOwnProperty(key)) {
        elm.style[key] = option.args.style[key];
      }
    }
  }
  return {
    element: elm,
    bind: function(){},
    update: function(){}
  };
};
ytcenter.modules.button = function(option){
  var elm = document.createElement("button");
  elm.setAttribute("type", "button");
  elm.setAttribute("role", "button");
  elm.setAttribute("onclick", ";return false;");
  elm.className = "yt-uix-button yt-uix-button-default";
  var c = document.createElement("span");
  c.className = "yt-uix-button-content";
  if (option && option.args && option.args.text) {
    c.textContent = ytcenter.language.getLocale(option.args.text);
    ytcenter.language.addLocaleElement(c, option.args.text, "@textContent");
  }
  if (option && option.args && option.args.listeners) {
    for (var j = 0; j < option.args.listeners.length; j++) {
      elm.addEventListener(option.args.listeners[j].event, option.args.listeners[j].callback, (option.args.listeners[j].bubble ? option.args.listeners[j].bubble : false));
    }
  }
  if (option && option.args && option.args.style) {
    for (var key in option.args.style) {
      if (option.args.style.hasOwnProperty(key)) {
        elm.style[key] = option.args.style[key];
      }
    }
  }
  elm.appendChild(c);
  return {
    element: elm,
    bind: function(){},
    update: function(){}
  };
};
ytcenter.modules.textarea = function(option){
  var elm = document.createElement('textarea');
  elm.className = "yt-uix-form-textarea";
  if (option && option.args && option.args.className) {
    elm.className += " " + option.args.className;
  }
  if (option && option.args && option.args.style) {
    for (var key in option.args.style) {
      if (option.args.style.hasOwnProperty(key)) {
        elm.style[key] = option.args.style[key];
      }
    }
  }
  if (option && option.args && option.args.text) {
    elm.textContent = option.args.text;
  }
  if (option && option.args && option.args.load) {
    tab.addEventListener("click", function(){
      option.args.load.apply(null, [elm]);
    });
  }
  if (option && option.args && option.args.listeners) {
    for (var i = 0; i < option.args.listeners.length; i++) {
      elm.addEventListener(option.args.listeners[i].event, option.args.listeners[i].callback, (option.args.listeners[i].bubble ? option.args.listeners[i].bubble : false));
    }
  }
  
  return {
    element: elm,
    bind: function(){},
    update: function(){}
  };
};
ytcenter.modules.element = function(option){
  var elm = document.createElement(option && option.args && option.args.tagname);
  if (option && option.args && option.args.style) {
    for (var key in option.args.style) {
      if (option.args.style.hasOwnProperty(key)) {
        elm.style[key] = option.args.style[key];
      }
    }
  }
  if (option && option.args && option.args.className) {
    elm.className += " " + option.args.className;
  }
  if (option && option.args && option.args.text) {
    elm.textContent = option.args.text;
  }
  if (option && option.args && option.args.html) {
    con.error("[Settings Recipe] Element attribute HTML not allowed!");
  }
  if (option && option.args && option.args.load) {
    tab.addEventListener("click", function(){
      option.args.load.apply(null, [elm]);
    });
  }
  if (option && option.args && option.args.listeners) {
    for (var i = 0; i < option.args.listeners.length; i++) {
      elm.addEventListener(option.args.listeners[i].event, option.args.listeners[i].callback, (option.args.listeners[i].bubble ? option.args.listeners[i].bubble : false));
    }
  }
  
  return {
    element: elm,
    bind: function(){},
    update: function(){}
  };
};
ytcenter.modules.multilist = function(option){
  function fixList(_settingData) {
    if (_settingData === "") return "";
    var a = _settingData.split("&"), b = [], c = [], d, i;
    for (i = 0; i < list.length; i++) {
      c.push(list[i].value);
    }
    for (i = 0; i < a.length; i++) {
      if (a[i] !== "") {
        d = decodeURIComponent(a[i]);
        if ($ArrayIndexOf(c, d) !== -1 && $ArrayIndexOf(b, d) === -1) {
          b.push(a[i]);
        }
      }
    }
    return b.join("&");
  }
  function saveItem(value) {
    if (settingData === "") return encodeURIComponent(value);
    var a = settingData.split("&"), i;
    for (i = 0; i < a.length; i++) {
      if (decodeURIComponent(a[i]) === value) return;
    }
    a.push(encodeURIComponent(value));
    return a.join("&");
  }
  function removeItem(value) {
    if (settingData === "") return encodeURIComponent(value);
    var a = settingData.split("&"), b = [], i;
    for (i = 0; i < a.length; i++) {
      if (decodeURIComponent(a[i]) !== value) {
        b.push(a[i]);
      }
    }
    return b.join("&");
  }
  function isEnabled(value) {
    if (settingData === "") return false;
    var a = settingData.split("&"), i;
    for (i = 0; i < a.length; i++) {
      if (decodeURIComponent(a[i]) === value) return true;
    }
    return false;
  }
  function createItem(label, value) {
    var s = document.createElement("label"),
        cb = ytcenter.embeds.checkbox(isEnabled(value)),
        text = document.createTextNode(ytcenter.language.getLocale(label));
    ytcenter.language.addLocaleElement(text, label, "@textContent");
    cb.bind(function(checked){
      if (checked) {
        settingData = saveItem(value);
      } else {
        settingData = removeItem(value);
      }
      if (typeof saveCallback === "function") saveCallback(settingData);
    });
    cb.element.style.marginRight = "6px";
    s.appendChild(cb.element);
    s.appendChild(text);
    
    return s;
  }
  function updateList() {
    var d, item;
    settingData = fixList(settingData);
    
    wrapper.innerHTML = "";
    
    for (var i = 0; i < list.length; i++) {
      d = document.createElement("div");
      item = createItem(list[i].label, list[i].value);
      d.appendChild(item);
      wrapper.appendChild(d);
    }
  }
  var list = (option && option.args && option.args.list) || [],
      settingData, wrapper = document.createElement("div"), saveCallback;
  wrapper.style.paddingLeft = "16px";
  
  return {
    element: wrapper,
    update: function(data){
      settingData = data;
      updateList();
    },
    bind: function(a){
      saveCallback = a;
    }
  };
};
ytcenter.modules.resizedropdown = function(option){
  function getItemTitle(item) {
    var dim = ytcenter.utils.calculateDimensions(item.config.width, item.config.height);
    if (typeof item.config.customName !== "undefined" && item.config.customName !== "") {
      return item.config.customName;
    } else if (isNaN(parseInt(item.config.width)) && isNaN(parseInt(item.config.height))) {
      return (item.config.large ? ytcenter.language.getLocale("SETTINGS_RESIZE_LARGE") : ytcenter.language.getLocale("SETTINGS_RESIZE_SMALL"));
      subtext.textContent = (item.config.align ? ytcenter.language.getLocale("SETTINGS_RESIZE_ALIGN") : ytcenter.language.getLocale("SETTINGS_RESIZE_CENTER"));
    } else {
      return dim[0] + "×" + dim[1];
      subtext.textContent = (item.config.large ? ytcenter.language.getLocale("SETTINGS_RESIZE_LARGE") : ytcenter.language.getLocale("SETTINGS_RESIZE_SMALL")) + " - " + (item.config.align ? ytcenter.language.getLocale("SETTINGS_RESIZE_ALIGN") : ytcenter.language.getLocale("SETTINGS_RESIZE_CENTER"));
    }
  }
  function getItemSubText(item) {
    if (isNaN(parseInt(item.config.width)) && isNaN(parseInt(item.config.height))) {
      return (item.config.align ? ytcenter.language.getLocale("SETTINGS_RESIZE_ALIGN") : ytcenter.language.getLocale("SETTINGS_RESIZE_CENTER")) + (item.config.scrollToPlayer ? " - " + ytcenter.language.getLocale("SETTINGS_RESIZE_SCROLLTOPLAYER") : "");
    } else {
      return (item.config.large ? ytcenter.language.getLocale("SETTINGS_RESIZE_LARGE") : ytcenter.language.getLocale("SETTINGS_RESIZE_SMALL")) + " - " + (item.config.align ? ytcenter.language.getLocale("SETTINGS_RESIZE_ALIGN") : ytcenter.language.getLocale("SETTINGS_RESIZE_CENTER")) + (item.config.scrollToPlayer ? " - " + ytcenter.language.getLocale("SETTINGS_RESIZE_SCROLLTOPLAYER") : "");
    }
  }
  function setValue(id) {
    selectedId = id;
    var item;
    ytcenter.utils.each(items, function(i, val){
      if (val.id !== selectedId) return;
      item = val;
      return false;
    });
    btnLabel.textContent = getItemTitle(item);
  }
  function updateItems(_items) {
    items = _items;
    menu.innerHTML = ""; // Clearing it
    var db = [];
    ytcenter.utils.each(items, function(i, item){
      if (typeof selectedId === "undefined") setValue(item.id);
      
      if (item.id === selectedId) {
        setValue(item.id);
      }
      var li = document.createElement("li");
      li.setAttribute("role", "menuitem");
      var span = document.createElement("span");
      db.push(span);
      
      span.className = "yt-uix-button-menu-item" + (item.id === selectedId ? " ytcenter-resize-dropdown-selected" : "");
      span.style.paddingBottom = "12px";
      var title = document.createElement("span");
      title.textContent = getItemTitle(item);
      title.style.display = "block";
      title.style.fontWeight = "bold";
      var subtext = document.createElement("span");
      subtext.textContent = getItemSubText(item);
      subtext.style.display = "block";
      subtext.style.fontSize = "11px";
      subtext.style.lineHeight = "0px";
      
      ytcenter.utils.addEventListener(li, "click", function(){
        if (item.id === selectedId) return;
        setValue(item.id);
        ytcenter.utils.each(db, function(_i, elm){
          ytcenter.utils.removeClass(elm, "ytcenter-resize-dropdown-selected");
        });
        ytcenter.utils.addClass(span, "ytcenter-resize-dropdown-selected");
        
        if (saveCallback) saveCallback(item.id);
        
        try {
          document.body.click();
        } catch (e) {
          con.error(e);
        }
      });
      
      span.appendChild(title);
      span.appendChild(subtext);
      li.appendChild(span);
      
      menu.appendChild(li);
    });
  }
  var saveCallback;
  var selectedId;
  var items;
  
  var wrapper = document.createElement("div");
  wrapper.className = "ytcenter-embed";
  
  var btnLabel = ytcenter.gui.createYouTubeButtonText("Player Sizes...");
  btnLabel.style.display = "inline-block";
  btnLabel.style.width = "100%";
  
  var menu = document.createElement("ul");
  menu.className = "yt-uix-button-menu yt-uix-button-menu-default yt-uix-button-menu-external hid";
  menu.setAttribute("role", "menu");
  
  var arrow = ytcenter.gui.createYouTubeButtonArrow();
  arrow.style.marginLeft = "-10px";
  
  var btn = ytcenter.gui.createYouTubeDefaultButton("", [btnLabel, arrow, menu]);
  btn.style.width = "175px";
  btn.style.textAlign = "left";
  
  wrapper.appendChild(btn);
  
  updateItems(ytcenter.settings[option.defaultSetting]);
  ytcenter.events.addEvent("ui-refresh", function(){
    var opt = ytcenter.settings[option.defaultSetting];
    var found = false;
    for (var i = 0; i < opt.length; i++) {
      if (opt[i].id === selectedId) found = true;
    }
    if (!found) {
      selectedId = opt[0].id;
      if (saveCallback) saveCallback(selectedId);
    }
    updateItems(opt);
  });
  
  return {
    element: wrapper, // So the element can be appended to an element.
    bind: function(callback){
      saveCallback = callback;
    },
    update: function(v){
      selectedId = v;
      updateItems(items);
    }
  };
};
ytcenter.modules.defaultplayersizedropdown = function(option){
  function getItemTitle(item) {
    try{
    var dim = ytcenter.utils.calculateDimensions(item.config.width, item.config.height);
    if (typeof item.config.customName !== "undefined" && item.config.customName !== "") {
      return item.config.customName;
    } else if (isNaN(parseInt(item.config.width)) && isNaN(parseInt(item.config.height))) {
      return (item.config.large ? ytcenter.language.getLocale("SETTINGS_RESIZE_LARGE") : ytcenter.language.getLocale("SETTINGS_RESIZE_SMALL"));
      //subtext.textContent = (item.config.align ? ytcenter.language.getLocale("SETTINGS_RESIZE_ALIGN") : ytcenter.language.getLocale("SETTINGS_RESIZE_CENTER"));
    } else {
      return dim[0] + "×" + dim[1];
      //subtext.textContent = (item.config.large ? ytcenter.language.getLocale("SETTINGS_RESIZE_LARGE") : ytcenter.language.getLocale("SETTINGS_RESIZE_SMALL")) + " - " + (item.config.align ? ytcenter.language.getLocale("SETTINGS_RESIZE_ALIGN") : ytcenter.language.getLocale("SETTINGS_RESIZE_CENTER"));
    }
    }catch(e){con.error(e)}
  }
  function getItemSubText(item) {
    try{
    if (isNaN(parseInt(item.config.width)) && isNaN(parseInt(item.config.height))) {
      return (item.config.align ? ytcenter.language.getLocale("SETTINGS_RESIZE_ALIGN") : ytcenter.language.getLocale("SETTINGS_RESIZE_CENTER")) + (item.config.scrollToPlayer ? " - " + ytcenter.language.getLocale("SETTINGS_RESIZE_SCROLLTOPLAYER") : "");
    } else {
      return (item.config.large ? ytcenter.language.getLocale("SETTINGS_RESIZE_LARGE") : ytcenter.language.getLocale("SETTINGS_RESIZE_SMALL")) + " - " + (item.config.align ? ytcenter.language.getLocale("SETTINGS_RESIZE_ALIGN") : ytcenter.language.getLocale("SETTINGS_RESIZE_CENTER")) + (item.config.scrollToPlayer ? " - " + ytcenter.language.getLocale("SETTINGS_RESIZE_SCROLLTOPLAYER") : "");
    }
    }catch(e){con.error(e)}
  }
  function setValue(id) {
    selectedId = id;
    if (selectedId === "default") {
      btnLabel.textContent = ytcenter.language.getLocale("SETTINGS_RESIZE_DEFAULTPLAYERSIZE_DEFAULT");
    } else {
      var item;
      ytcenter.utils.each(items, function(i, val){
        if (val.id !== selectedId) return;
        item = val;
        return false;
      });
      btnLabel.textContent = getItemTitle(item);
    }
  }
  function defaultItem(db) {
    if (typeof selectedId === "undefined") setValue("default");
    
    if ("default" === selectedId) {
      setValue("default");
    }
    var li = document.createElement("li");
    li.setAttribute("role", "menuitem");
    var span = document.createElement("span");
    db.push(span);
    
    span.className = "yt-uix-button-menu-item" + ("default" === selectedId ? " ytcenter-resize-dropdown-selected" : "");
    var title = document.createElement("span");
    title.textContent = ytcenter.language.getLocale("SETTINGS_RESIZE_DEFAULTPLAYERSIZE_DEFAULT");
    ytcenter.language.addLocaleElement(title, "SETTINGS_RESIZE_DEFAULTPLAYERSIZE_DEFAULT", "@textContent");
    title.style.display = "block";
    
    ytcenter.utils.addEventListener(li, "click", function(){
      if ("default" === selectedId) return;
      setValue("default");
      ytcenter.utils.each(db, function(_i, elm){
        ytcenter.utils.removeClass(elm, "ytcenter-resize-dropdown-selected");
      });
      ytcenter.utils.addClass(span, "ytcenter-resize-dropdown-selected");
      
      if (saveCallback) saveCallback("default");
      
      try {
        document.body.click();
      } catch (e) {
        con.error(e);
      }
    });
    
    span.appendChild(title);
    li.appendChild(span);
    
    menu.appendChild(li);
  }
  function updateItems(_items) {
    items = _items;
    menu.innerHTML = ""; // Clearing it
    var db = [];
    
    defaultItem(db);
    ytcenter.utils.each(items, function(i, item){
      if (typeof selectedId === "undefined") setValue(item.id);
      
      if (item.id === selectedId) {
        setValue(item.id);
      }
      var li = document.createElement("li");
      li.setAttribute("role", "menuitem");
      var span = document.createElement("span");
      db.push(span);
      
      span.className = "yt-uix-button-menu-item" + (item.id === selectedId ? " ytcenter-resize-dropdown-selected" : "");
      span.style.paddingBottom = "12px";
      var title = document.createElement("span");
      title.textContent = getItemTitle(item);
      title.style.display = "block";
      title.style.fontWeight = "bold";
      var subtext = document.createElement("span");
      subtext.textContent = getItemSubText(item);
      subtext.style.display = "block";
      subtext.style.fontSize = "11px";
      subtext.style.lineHeight = "0px";
      
      ytcenter.utils.addEventListener(li, "click", function(){
        if (item.id === selectedId) return;
        setValue(item.id);
        ytcenter.utils.each(db, function(_i, elm){
          ytcenter.utils.removeClass(elm, "ytcenter-resize-dropdown-selected");
        });
        ytcenter.utils.addClass(span, "ytcenter-resize-dropdown-selected");
        
        if (saveCallback) saveCallback(item.id);
        
        try {
          document.body.click();
        } catch (e) {
          con.error(e);
        }
      });
      
      span.appendChild(title);
      span.appendChild(subtext);
      li.appendChild(span);
      
      menu.appendChild(li);
    });
  }
  var saveCallback, selectedId, items,
      wrapper = document.createElement("div"),
      btnLabel = ytcenter.gui.createYouTubeButtonText("Player Sizes..."),
      menu = document.createElement("ul"),
      arrow = ytcenter.gui.createYouTubeButtonArrow(),
      btn = ytcenter.gui.createYouTubeDefaultButton("", [btnLabel, arrow, menu]);
  wrapper.className = "ytcenter-embed";
  btnLabel.style.display = "inline-block";
  btnLabel.style.width = "100%";
  
  menu.className = "yt-uix-button-menu yt-uix-button-menu-default yt-uix-button-menu-external hid";
  menu.setAttribute("role", "menu");
  arrow.style.marginLeft = "-10px";
  
  btn.style.width = "175px";
  btn.style.textAlign = "left";
  
  wrapper.appendChild(btn);
  
  updateItems(ytcenter.settings[option.defaultSetting]);
  ytcenter.events.addEvent("ui-refresh", function(){
    var opt = ytcenter.settings[option.defaultSetting];
    var found = false;
    for (var i = 0; i < opt.length; i++) {
      if (opt[i].id === selectedId) found = true;
    }
    if (!found && selectedId !== "default") {
      selectedId = opt[0].id;
      if (saveCallback) saveCallback(selectedId);
    }
    updateItems(opt);
  });
  
  return {
    element: wrapper, // So the element can be appended to an element.
    bind: function(callback){
      saveCallback = callback;
    },
    update: function(v){
      selectedId = v;
      updateItems(items);
    }
  };
};
ytcenter.modules.select = function(option){
  function updateList() {
    select.innerHTML = "";
    ytcenter.utils.each(list, function(i, item){
      var o = document.createElement("option");
      o.setAttribute("value", i);
      if (typeof item.label !== "undefined") {
        o.textContent = ytcenter.language.getLocale(item.label);
        ytcenter.language.addLocaleElement(o, item.label, "@textContent");
      } else if (typeof item.text !== "undefined") {
        o.textContent = item.text;
      } else {
        o.textContent = "undefined";
      }
      if (selectedValue === item.value) {
        o.setAttribute("selected", "selected");
        selectedText.textContent = o.textContent;
      }
      
      select.appendChild(o);
    });
  }
  var list = (option && option.args && option.args.list) || [],
      selectedValue, saveCallback,
      wrapper = document.createElement("span"),
      selectedContentWrapper = document.createElement("span"),
      selectedArrow = document.createElement("img"),
      selectedText = document.createElement("span"),
      select = document.createElement("select");
  wrapper.className = "ytcenter-embed yt-uix-form-input-select";
  wrapper.style.marginBottom = "2px";
  wrapper.style.height = "27px";
  
  selectedContentWrapper.className = "yt-uix-form-input-select-content";
  selectedArrow.setAttribute("src", "//s.ytimg.com/yt/img/pixel-vfl3z5WfW.gif");
  selectedArrow.className = "yt-uix-form-input-select-arrow";
  selectedText.className = "yt-uix-form-input-select-value";
  
  selectedContentWrapper.appendChild(selectedArrow);
  selectedContentWrapper.appendChild(selectedText);
  
  select.className = "yt-uix-form-input-select-element";
  select.style.cursor = "pointer";
  select.style.height = "27px";
  
  updateList();
  ytcenter.utils.addEventListener(select, "change", function(e){
    selectedText.textContent = select.options[select.selectedIndex].textContent;
    if (saveCallback) saveCallback(list[select.selectedIndex].value);
  });
  
  wrapper.appendChild(selectedContentWrapper);
  wrapper.appendChild(select);
  
  return {
    element: wrapper,
    bind: function(callback){
      saveCallback = callback;
    },
    setSelected: function(value){
      selectedValue = value;
      for (var i = 0; i < list.length; i++) {
        if (list[i].value === value) {
          select.selectedIndex = i;
          break;
        }
      }
      selectedText.textContent = select.options[select.selectedIndex].textContent;
    },
    update: function(value){
      selectedValue = value;
      for (var i = 0; i < list.length; i++) {
        if (list[i].value === value) {
          select.selectedIndex = i;
          break;
        }
      }
      selectedText.textContent = select.options[select.selectedIndex].textContent;
    },
    updateList: function(_list){
      list = _list;
      updateList();
    },
    getValue: function(){
      return list[select.selectedIndex].value;
    }
  };
};
ytcenter.modules.resizeItemList = function(option){
  function wrapItem(item) {
    if (typeof item.getItemElement !== "undefined") return item; // It's already been processed
    var selected = false;
    
    var li = document.createElement("li");
    li.className = "ytcenter-list-item ytcenter-dragdrop-item";
    
    var order = document.createElement("div");
    order.className = "ytcenter-dragdrop-handle";
    
    var content = document.createElement("div");
    content.className = "ytcenter-list-item-content";
    var title = document.createElement("span");
    title.className = "ytcenter-list-item-title";
    
    var subtext = document.createElement("span");
    subtext.className = "ytcenter-list-item-subtext";
    
    content.appendChild(title);
    content.appendChild(subtext);
    
    li.appendChild(order);
    li.appendChild(content);
    
    ytcenter.utils.addEventListener(content, "click", function(){
      if (selected) return;
      selectSizeItem(item.id);
    });
    var out = {
      getId: function(){
        return item.id;
      },
      getData: function(){
        return item;
      },
      getConfig: function(){
        return item.config;
      },
      setConfig: function(conf){
        item.config = conf;
      },
      updateItemElement: function(){
        var dim = ytcenter.utils.calculateDimensions(item.config.width, item.config.height);
        title.textContent = getItemTitle(out);
        subtext.textContent = getItemSubText(out);
      },
      getItemElement: function(){
        return li;
      },
      setSelection: function(_selected){
        selected = _selected;
        if (selected) {
          ytcenter.utils.addClass(li, "ytcenter-list-item-selected");
        } else {
          ytcenter.utils.removeClass(li, "ytcenter-list-item-selected");
        }
      }
    };
    
    out.updateItemElement();
    ytcenter.events.addEvent("ui-refresh", function(){
      out.updateItemElement();
    });
    return out;
  }
  function getItemInfo(item) {
    var __r = {};
    var dim = ytcenter.utils.calculateDimensions(item.getConfig().width, item.getConfig().height);
    if (item.getConfig().width === "" && item.getConfig().height === "") {
      __r.width = "";
      __r.height = "";
    } else {
      if (typeof dim[0] === "number") {
        __r.width = dim[0] + "px";
      } else {
        __r.width = dim[0];
      }
      if (typeof dim[1] === "number") {
        __r.height = dim[1] + "px";
      } else {
        __r.height = dim[1];
      }
    }
    __r.large = item.getConfig().large;
    __r.align = item.getConfig().align;
    __r.scrollToPlayer = item.getConfig().scrollToPlayer;
    __r.scrollToPlayerButton = item.getConfig().scrollToPlayerButton;
    __r.customName = (typeof item.getConfig().customName === "undefined" ? "" : item.getConfig().customName);
    __r.aspectRatioLocked = (typeof item.getConfig().aspectRatioLocked === "undefined" ? false : item.getConfig().aspectRatioLocked);
    return __r;
  }
  function createEditor() {
    function hasUnsavedChanges() {
      if (state === 0) return false;
      if (state === 2) return true;
      if (original.width !== __getWidth()) return true;
      if (original.height !== __getHeight()) return true;
      if (original.large !== largeInput.isSelected()) return true;
      if (original.align !== alignInput.isSelected()) return true;
      if (original.scrollToPlayer !== scrollToPlayerInput.isSelected()) return true;
      if (original.scrollToPlayerButton !== scrollToPlayerButtonInput.isSelected()) return true;
      if (original.customName !== customNameInput.value) return true;
      if (original.aspectRatioLocked !== ratioLocked) return true;
      
      return false;
    }
    var __getWidth = function(){
      if (isNaN(parseInt(widthInput.value))) {
        return widthUnit.getValue();
      } else {
        return parseInt(widthInput.value) + widthUnit.getValue();
      }
    };
    var __getHeight = function(){
      if (isNaN(parseInt(heightInput.value))) {
        return heightUnit.getValue();
      } else {
        return parseInt(heightInput.value) + heightUnit.getValue();
      }
    };
    var __getAspectRatio = function(){
      if (isNaN(parseInt(widthInput.value)) || isNaN(parseInt(heightInput.value)) || widthUnit.getValue() !== "px" || heightUnit.getValue() !== "px") return;
      return parseInt(widthInput.value)/parseInt(heightInput.value);
    };
    var __updateAspectRatio = function(){
      aspectRatio = __getAspectRatio();
    };
    var __setAspectRatioLocked = function(locked){
      ratioLocked = locked;
      if (ratioLocked) {
        ytcenter.utils.addClass(ratioIcon, "ytcenter-resize-chain");
        ytcenter.utils.removeClass(ratioIcon, "ytcenter-resize-unchain");
        aspectRatio = __getAspectRatio();
      } else {
        ytcenter.utils.removeClass(ratioIcon, "ytcenter-resize-chain");
        ytcenter.utils.addClass(ratioIcon, "ytcenter-resize-unchain");
        aspectRatio = undefined;
      }
    };
    var __setAspectVisibility = function(visible){
      if (visible) {
        ytcenter.utils.removeClass(linkBorder, "force-hid");
        ytcenter.utils.removeClass(ratioIcon, "force-hid");
      } else {
        ytcenter.utils.addClass(linkBorder, "force-hid");
        ytcenter.utils.addClass(ratioIcon, "force-hid");
      }
    };
    var saveListener, cancelListener, deleteListener, newSessionCallback;
    var original = {};
    var state = 0;
    var ratioLocked = false;
    var aspectRatio;
    
    var wrp = document.createElement("div");
    wrp.style.visibility = "hidden";
    // Editor Panel
    var customNameWrapper = document.createElement("div");
    customNameWrapper.className = "ytcenter-panel-label";
    var customNameLabel = document.createElement("label");
    customNameLabel.textContent = ytcenter.language.getLocale("EMBED_RESIZEITEMLIST_CUSTOMNAME");
    ytcenter.language.addLocaleElement(customNameLabel, "EMBED_RESIZEITEMLIST_CUSTOMNAME", "@textContent");
    customNameWrapper.appendChild(customNameLabel);
    var customNameInput = ytcenter.gui.createYouTubeTextInput();
    customNameInput.style.width = "210px";
    customNameWrapper.appendChild(customNameInput);
    
    var dimensionWrapper = document.createElement("div");
    var sizeWrapper = document.createElement("div");
    sizeWrapper.style.display = "inline-block";
    
    var widthWrapper = document.createElement("div");
    widthWrapper.className = "ytcenter-panel-label";
    var widthLabel = document.createElement("label");
    widthLabel.textContent = ytcenter.language.getLocale("EMBED_RESIZEITEMLIST_WIDTH");
    ytcenter.language.addLocaleElement(widthLabel, "EMBED_RESIZEITEMLIST_WIDTH", "@textContent");
    widthWrapper.appendChild(widthLabel);
    var widthInput = ytcenter.gui.createYouTubeTextInput();
    widthInput.style.width = "105px";
    widthWrapper.appendChild(widthInput);
    
    ytcenter.utils.addEventListener(widthInput, "change", function(){
      if (widthUnit.getValue() !== "px" || heightUnit.getValue() !== "px") return;
      aspectRatio = __getAspectRatio();
    });
    ytcenter.utils.addEventListener(widthInput, "input", function(){
      if (isNaN(parseInt(widthInput.value))) widthInput.value = "";
      else widthInput.value = parseInt(widthInput.value);
      if (widthUnit.getValue() !== "px" || heightUnit.getValue() !== "px") return;
      if (typeof aspectRatio === "undefined" || !ratioLocked) return;
      if (isNaN(parseInt(widthInput.value))) {
        heightInput.value = "";
      } else if (aspectRatio !== 0) {
        heightInput.value = Math.round(parseInt(widthInput.value)/aspectRatio);
      }
    });
    
    var widthUnit = ytcenter.embeds.select([
      {label: "EMBED_RESIZEITEMLIST_PIXEL", value: "px"},
      {label: "EMBED_RESIZEITEMLIST_PERCENT", value: "%"}
    ]);
    widthUnit.bind(function(){
      if (widthUnit.getValue() !== "px" || heightUnit.getValue() !== "px") {
        __setAspectVisibility(false);
        return;
      }
      __setAspectVisibility(true);
      aspectRatio = __getAspectRatio();
    });
    
    widthWrapper.appendChild(widthUnit.element);
    
    sizeWrapper.appendChild(widthWrapper);
    
    var heightWrapper = document.createElement("div");
    heightWrapper.className = "ytcenter-panel-label";
    var heightLabel = document.createElement("label");
    heightLabel.textContent = ytcenter.language.getLocale("EMBED_RESIZEITEMLIST_HEIGHT");
    ytcenter.language.addLocaleElement(heightLabel, "EMBED_RESIZEITEMLIST_HEIGHT", "@textContent");
    heightWrapper.appendChild(heightLabel);
    var heightInput = ytcenter.gui.createYouTubeTextInput();
    heightInput.style.width = "105px";
    heightWrapper.appendChild(heightInput);
    
    ytcenter.utils.addEventListener(heightInput, "change", function(){
      if (widthUnit.getValue() !== "px" || heightUnit.getValue() !== "px") return;
      aspectRatio = __getAspectRatio();
    });
    ytcenter.utils.addEventListener(heightInput, "input", function(){
      if (isNaN(parseInt(heightInput.value))) heightInput.value = "";
      else heightInput.value = parseInt(heightInput.value);
      if (widthUnit.getValue() !== "px" || heightUnit.getValue() !== "px") return;
      if (typeof aspectRatio === "undefined" || !ratioLocked) return;
      if (isNaN(parseInt(heightInput.value))) {
        widthInput.value = "";
      } else if (aspectRatio !== 0) {
        widthInput.value = Math.round(parseInt(heightInput.value)*aspectRatio);
      }
    });
    
    var heightUnit = ytcenter.embeds.select([
      {label: "EMBED_RESIZEITEMLIST_PIXEL", value: "px"},
      {label: "EMBED_RESIZEITEMLIST_PERCENT", value: "%"}
    ]);
    
    heightUnit.bind(function(){
      if (widthUnit.getValue() !== "px" || heightUnit.getValue() !== "px") {
        __setAspectVisibility(false);
        return;
      }
      __setAspectVisibility(true);
      aspectRatio = __getAspectRatio();
    });
    
    heightWrapper.appendChild(heightUnit.element);
    
    sizeWrapper.appendChild(heightWrapper);
    
    dimensionWrapper.appendChild(sizeWrapper);
    
    var linkBorder = document.createElement("div");
    linkBorder.className = "ytcenter-resize-aspect-bind";
    
    dimensionWrapper.appendChild(linkBorder);
    
    var ratioIcon = document.createElement("div");
    ratioIcon.className = "ytcenter-resize-unchain ytcenter-resize-ratio";
    ratioIcon.style.display = "inline-block";
    ratioIcon.style.marginBottom = "13px";
    ratioIcon.style.marginLeft = "-11px";
    ratioIcon.style.width = "20px";
    ytcenter.utils.addEventListener(ratioIcon, "click", function(e){
      if (widthUnit.getValue() !== "px" || heightUnit.getValue() !== "px") return;
      if (ratioLocked) {
        __setAspectRatioLocked(false);
      } else {
        __setAspectRatioLocked(true);
      }
      if (e && e.preventDefault) {
        e.preventDefault();
      } else {
        window.event.returnValue = false;
      }
      return false;
    });
    
    dimensionWrapper.appendChild(ratioIcon);
    
    var largeWrapper = document.createElement("div");
    largeWrapper.className = "ytcenter-panel-label";
    var largeLabel = document.createElement("label");
    largeLabel.textContent = ytcenter.language.getLocale("EMBED_RESIZEITEMLIST_LARGE");
    ytcenter.language.addLocaleElement(largeLabel, "EMBED_RESIZEITEMLIST_LARGE", "@textContent");
    largeWrapper.appendChild(largeLabel);
    var largeInput = ytcenter.embeds.checkbox();
    largeInput.element.style.background = "#fff";
    largeInput.fixHeight();
    largeWrapper.appendChild(largeInput.element);
    
    var alignWrapper = document.createElement("div");
    alignWrapper.className = "ytcenter-panel-label";
    var alignLabel = document.createElement("label");
    alignLabel.textContent = "Align";
    alignLabel.textContent = ytcenter.language.getLocale("EMBED_RESIZEITEMLIST_ALIGN");
    ytcenter.language.addLocaleElement(alignLabel, "EMBED_RESIZEITEMLIST_ALIGN", "@textContent");
    alignWrapper.appendChild(alignLabel);
    var alignInput = ytcenter.embeds.checkbox();
    alignInput.element.style.background = "#fff";
    alignInput.fixHeight();
    alignWrapper.appendChild(alignInput.element);
    
    var scrollToPlayerWrapper = document.createElement("div");
    scrollToPlayerWrapper.className = "ytcenter-panel-label";
    var scrollToPlayerLabel = document.createElement("label");
    scrollToPlayerLabel.textContent = ytcenter.language.getLocale("EMBED_RESIZEITEMLIST_SCROLLTOPLAYER");
    ytcenter.language.addLocaleElement(scrollToPlayerLabel, "EMBED_RESIZEITEMLIST_SCROLLTOPLAYER", "@textContent");
    scrollToPlayerWrapper.appendChild(scrollToPlayerLabel);
    var scrollToPlayerInput = ytcenter.embeds.checkbox();
    scrollToPlayerInput.element.style.background = "#fff";
    scrollToPlayerInput.fixHeight();
    scrollToPlayerWrapper.appendChild(scrollToPlayerInput.element);
    
    var scrollToPlayerButtonWrapper = document.createElement("div");
    scrollToPlayerButtonWrapper.className = "ytcenter-panel-label";
    var scrollToPlayerButtonLabel = document.createElement("label");
    scrollToPlayerButtonLabel.textContent = ytcenter.language.getLocale("EMBED_RESIZEITEMLIST_SCROLLTOPLAYERBUTTON");
    ytcenter.language.addLocaleElement(scrollToPlayerButtonLabel, "EMBED_RESIZEITEMLIST_SCROLLTOPLAYERBUTTON", "@textContent");
    scrollToPlayerButtonWrapper.appendChild(scrollToPlayerButtonLabel);
    var scrollToPlayerButtonInput = ytcenter.embeds.checkbox();
    scrollToPlayerButtonInput.element.style.background = "#fff";
    scrollToPlayerButtonInput.fixHeight();
    scrollToPlayerButtonWrapper.style.marginBottom = "40px";
    scrollToPlayerButtonWrapper.appendChild(scrollToPlayerButtonInput.element);
    
    var optionsWrapper = document.createElement("div");
    optionsWrapper.className = "clearfix resize-options";
    
    var saveBtn = ytcenter.gui.createYouTubePrimaryButton("", [ytcenter.gui.createYouTubeButtonText("Save")]);
    saveBtn.style.cssFloat = "right";
    saveBtn.style.marginLeft = "10px";
    saveBtn.style.minWidth = "60px";
    ytcenter.utils.addEventListener(saveBtn, "click", function(){
      state = 0;
      wrp.style.visibility = "hidden";
      if (typeof saveListener !== "undefined") saveListener();
      ytcenter.events.performEvent("ui-refresh");
    });
    
    var cancelBtn = ytcenter.gui.createYouTubeDefaultButton("", [ytcenter.gui.createYouTubeButtonText("Cancel")]);
    cancelBtn.style.cssFloat = "right";
    cancelBtn.style.marginLeft = "10px";
    cancelBtn.style.minWidth = "60px";
    ytcenter.utils.addEventListener(cancelBtn, "click", function(){
      if (hasUnsavedChanges()) {
        ytcenter.confirmBox("EMBED_RESIZEITEMLIST_CONFIRM_TITLE", "EMBED_RESIZEITEMLIST_UNSAVED_CONFIRM_MESSAGE", function(accepted){
          if (accepted) {
            state = 0;
            wrp.style.visibility = "hidden";
            if (typeof cancelListener !== "undefined") cancelListener();
            ytcenter.events.performEvent("ui-refresh");
          }
        });
      } else {
        state = 0;
        wrp.style.visibility = "hidden";
        if (typeof cancelListener !== "undefined") cancelListener();
        ytcenter.events.performEvent("ui-refresh");
      }
    });
    
    var deleteBtn = ytcenter.gui.createYouTubeDefaultButton("", [ytcenter.gui.createYouTubeButtonText("Delete")]);
    deleteBtn.style.cssFloat = "left";
    deleteBtn.style.minWidth = "60px";
    ytcenter.utils.addEventListener(deleteBtn, "click", function(){
      ytcenter.confirmBox("EMBED_RESIZEITEMLIST_DELETE_CONFIRM_TITLE", "EMBED_RESIZEITEMLIST_DELETE_CONFIRM_MESSAGE", function(del){
        if (del) {
          state = 0;
          wrp.style.visibility = "hidden";
          if (typeof deleteListener !== "undefined") deleteListener();
          ytcenter.events.performEvent("ui-refresh");
        }
      }, "EMBED_RESIZEITEMLIST_CONFIRM_DELETE");
    });
    
    optionsWrapper.appendChild(deleteBtn);
    optionsWrapper.appendChild(saveBtn);
    optionsWrapper.appendChild(cancelBtn);
    
    
    wrp.appendChild(customNameWrapper);
    wrp.appendChild(dimensionWrapper);
    wrp.appendChild(largeWrapper);
    wrp.appendChild(alignWrapper);
    wrp.appendChild(scrollToPlayerWrapper);
    wrp.appendChild(scrollToPlayerButtonWrapper);
    
    wrp.appendChild(optionsWrapper);
    
    editWrapper.appendChild(wrp);
    
    
    return {
      destroy: function(){
        editWrapper.removeChild(wrp);
      },
      hasUnsavedChanges: hasUnsavedChanges,
      setState: function(s){
        state = s;
      },
      setDeleteButtonVisibility: function(visible) {
        if (visible) {
          deleteBtn.style.visibility = "";
        } else {
          deleteBtn.style.visibility = "hidden";
        }
      },
      setSaveListener: function(callback){
        saveListener = callback;
      },
      setCancelListener: function(callback){
        cancelListener = callback;
      },
      setDeleteListener: function(callback){
        deleteListener = callback;
      },
      updateAspectRatio: function(){
        __updateAspectRatio();
      },
      getAspectRatio: function(){
        return aspectRatio;
      },
      setAspectRatioLocked: function(locked){
        __setAspectRatioLocked(locked);
        original.aspectRatioLocked = ratioLocked;
      },
      isAspectRatioLocked: function(){
        return ratioLocked;
      },
      setWidth: function(width){
        state = 1;
        if (width === "") { // Default
          widthInput.value = "";
          widthUnit.setSelected("px");
          width = "px";
        } else {
          var _val = parseInt(width);
          if (isNaN(_val)) {
            widthInput.value = "";
          } else {
            widthInput.value = _val;
          }
          widthUnit.setSelected((width.indexOf("%") !== -1 ? "%" : "px"));
        }
        original.width = __getWidth();
        if (widthUnit.getValue() !== "px" || heightUnit.getValue() !== "px") {
          __setAspectVisibility(false);
        } else {
          __setAspectVisibility(true);
        }
      },
      getWidth: __getWidth,
      setHeight: function(height){
        state = 1;
        if (height === "") { // Default
          heightInput.value = "";
          heightUnit.setSelected("px");
          height = "px";
        } else {
          var _val = parseInt(height);
          if (isNaN(_val)) {
            heightInput.value = "";
          } else {
            heightInput.value = _val;
          }
          heightUnit.setSelected((height.indexOf("%") !== -1 ? "%" : "px"));
        }
        original.height = __getHeight();
        if (widthUnit.getValue() !== "px" || heightUnit.getValue() !== "px") {
          __setAspectVisibility(false);
        } else {
          __setAspectVisibility(true);
        }
      },
      getHeight: __getHeight,
      setLarge: function(large){
        state = 1;
        largeInput.update(large);
        original.large = largeInput.isSelected();
      },
      getLarge: function(){
        return largeInput.isSelected();
      },
      setAlign: function(align){
        state = 1;
        alignInput.update(align);
        original.align = alignInput.isSelected();
      },
      getAlign: function(){
        return alignInput.isSelected();
      },
      setScrollToPlayer: function(scrollToPlayer){
        state = 1;
        scrollToPlayerInput.update(scrollToPlayer);
        original.scrollToPlayer = scrollToPlayerInput.isSelected();
      },
      getScrollToPlayer: function(){
        return scrollToPlayerInput.isSelected();
      },
      setScrollToPlayerButton: function(scrollToPlayerButton){
        state = 1;
        scrollToPlayerButtonInput.update(scrollToPlayerButton);
        original.scrollToPlayerButton = scrollToPlayerButtonInput.isSelected();
      },
      getScrollToPlayerButton: function(){
        return scrollToPlayerButtonInput.isSelected();
      },
      setCustomName: function(customName){
        if (typeof customName !== "string") customName = "";
        state = 1;
        customNameInput.value = customName;
        original.customName = customName;
      },
      getCustomName: function(){
        return customNameInput.value;
      },
      setVisibility: function(visible) {
        if (visible) {
          wrp.style.visibility = "";
        } else {
          wrp.style.visibility = "hidden";
        }
      },
      newSession: function(){
        if (typeof newSessionCallback !== "undefined") newSessionCallback();
      },
      setSessionListener: function(callback){
        newSessionCallback = callback;
      },
      focusCustomNameField: function(){
        customNameInput.focus();
      },
      focusWidthField: function(){
        widthInput.focus();
      },
      focusHeightField: function(){
        heightInput.focus();
      }
    };
  }
  function getItemTitle(item) {
    var dim = ytcenter.utils.calculateDimensions(item.getConfig().width, item.getConfig().height);
    if (typeof item.getConfig().customName !== "undefined" && item.getConfig().customName !== "") {
      return item.getConfig().customName;
    } else if (isNaN(parseInt(item.getConfig().width)) && isNaN(parseInt(item.getConfig().height))) {
      return (item.getConfig().large ? ytcenter.language.getLocale("SETTINGS_RESIZE_LARGE") : ytcenter.language.getLocale("SETTINGS_RESIZE_SMALL"));
      subtext.textContent = (item.getConfig().align ? ytcenter.language.getLocale("SETTINGS_RESIZE_ALIGN") : ytcenter.language.getLocale("SETTINGS_RESIZE_CENTER"));
    } else {
      return dim[0] + "×" + dim[1];
      subtext.textContent = (item.getConfig().large ? ytcenter.language.getLocale("SETTINGS_RESIZE_LARGE") : ytcenter.language.getLocale("SETTINGS_RESIZE_SMALL")) + " - " + (item.getConfig().align ? ytcenter.language.getLocale("SETTINGS_RESIZE_ALIGN") : ytcenter.language.getLocale("SETTINGS_RESIZE_CENTER"));
    }
  }
  function getItemSubText(item) {
    if (isNaN(parseInt(item.getConfig().width)) && isNaN(parseInt(item.getConfig().height))) {
      return (item.getConfig().align ? ytcenter.language.getLocale("SETTINGS_RESIZE_ALIGN") : ytcenter.language.getLocale("SETTINGS_RESIZE_CENTER")) + (item.getConfig().scrollToPlayer ? " - " + ytcenter.language.getLocale("SETTINGS_RESIZE_SCROLLTOPLAYER") : "");
    } else {
      return (item.getConfig().large ? ytcenter.language.getLocale("SETTINGS_RESIZE_LARGE") : ytcenter.language.getLocale("SETTINGS_RESIZE_SMALL")) + " - " + (item.getConfig().align ? ytcenter.language.getLocale("SETTINGS_RESIZE_ALIGN") : ytcenter.language.getLocale("SETTINGS_RESIZE_CENTER")) + (item.getConfig().scrollToPlayer ? " - " + ytcenter.language.getLocale("SETTINGS_RESIZE_SCROLLTOPLAYER") : "");
    }
  }
  function updateListHeight() {
    try {
      var _h = editWrapper.clientHeight || editWrapper.scrollHeight;
      if (_h > 0) listWrapper.style.height = _h + "px";
    } catch (e) {
      con.error(e);
    }
  }
  function selectSizeItem(id) {
    var bypassConfirm = false;
    if (typeof editor === "undefined") {
      bypassConfirm = true;
      editor = createEditor();
    }
    var overrideData = function(){
      editor.newSession();
      var newItem = false;
      var newItemSaved = false;
      var newItemCancled = false;
      var item;
      if (typeof id === "undefined") {
        newItem = true;
        item = createEmptyItem();
        items.push(item);
        listOl.appendChild(item.getItemElement());
        listOl.scrollTop = listOl.scrollHeight - listOl.clientHeight;
      } else {
        item = getItemById(id);
      }
      markItem(item.getId());
      var inf = getItemInfo(item);
      editor.setCustomName(inf.customName);
      editor.setWidth(inf.width);
      editor.setHeight(inf.height);
      editor.setAspectRatioLocked(inf.aspectRatioLocked);
      editor.setLarge(inf.large);
      editor.setAlign(inf.align);
      editor.setScrollToPlayer(inf.scrollToPlayer);
      editor.setScrollToPlayerButton(inf.scrollToPlayerButton);
      editor.updateAspectRatio();
      
      editor.setSessionListener(function(){
        if (!newItem || newItemSaved || newItemCancled) return;
        
        var sI;
        for (var i = 0; i < items.length; i++) {
          sI = i;
          if (items[i].getId() === item.getId()) break;
        }
        items.splice(sI, 1);
        
        if (typeof item.getItemElement().parentNode !== "undefined") item.getItemElement().parentNode.removeChild(item.getItemElement());
        
        if (typeof saveCallback !== "undefined") saveCallback(getSaveArray());
      });
      
      editor.setSaveListener(function(){
        newItemSaved = true;
        item.setConfig({
          customName: editor.getCustomName(),
          width: editor.getWidth(),
          height: editor.getHeight(),
          large: editor.getLarge(),
          align: editor.getAlign(),
          scrollToPlayer: editor.getScrollToPlayer(),
          scrollToPlayerButton: editor.getScrollToPlayerButton(),
          aspectRatioLocked: editor.isAspectRatioLocked()
        });
        item.updateItemElement();
        unMarkAllItems();
        
        if (typeof saveCallback !== "undefined") saveCallback(getSaveArray());
      });
      editor.setCancelListener(function(){
        if (newItem) {
          newItemCancled = true;
          var sI;
          for (var i = 0; i < items.length; i++) {
            sI = i;
            if (items[i].getId() === item.getId()) break;
          }
          items.splice(sI, 1);
          
          if (item.getItemElement().parentNode) item.getItemElement().parentNode.removeChild(item.getItemElement());
          
          if (typeof saveCallback !== "undefined") saveCallback(getSaveArray());
        }
        unMarkAllItems();
      });
      editor.setDeleteListener(function(){
        try {
          if (newItem) return;
          if (ytcenter.player.isSelectedPlayerSizeById(item.getId())) {
            if (ytcenter.settings["resize-playersizes"][0].id === item.getId()) {
              if (ytcenter.settings["resize-playersizes"].length > 1) {
                ytcenter.player.resize(ytcenter.settings["resize-playersizes"][1]);
              }
            } else {
              ytcenter.player.resize(ytcenter.settings["resize-playersizes"][0]);
            }
          }
          unMarkAllItems();
          if (typeof item.getItemElement().parentNode !== "undefined") item.getItemElement().parentNode.removeChild(item.getItemElement());
          
          var sI;
          for (var i = 0; i < items.length; i++) {
            sI = i;
            if (items[i].getId() === item.getId()) break;
          }
          items.splice(sI, 1);
          
          if (typeof saveCallback !== "undefined") saveCallback(getSaveArray());
        } catch (e) {
          con.error(e);
        }
      });
      editor.setDeleteButtonVisibility(!newItem);
      
      editor.setVisibility(true);
      editor.focusCustomNameField();
      
      if (newItem) editor.setState(2);
    };
    if (editor.hasUnsavedChanges() && !bypassConfirm) {
      ytcenter.confirmBox("EMBED_RESIZEITEMLIST_CONFIRM_TITLE", "EMBED_RESIZEITEMLIST_UNSAVED_CONFIRM_MESSAGE", function(accepted){
        if (accepted) {
          editor.setState(0);
          overrideData();
        }
      });
    } else {
      overrideData();
    }
    updateListHeight();
  }
  function getItemById(id) {
    for (var i = 0; i < items.length; i++) {
      if (items[i].getId() === id) return items[i];
    }
  }
  function unMarkAllItems() {
    for (var i = 0; i < items.length; i++) {
      items[i].setSelection(false);
    }
  }
  function markItem(id) {
    unMarkAllItems();
    getItemById(id).setSelection(true);
  }
  function getSaveArray() {
    var _s = [];
    for (var i = 0; i < items.length; i++) {
      _s.push(items[i].getData());
    }
    return _s;
  }
  function getItemByElement(li) {
    for (var i = 0; i < items.length; i++) {
      if (items.getItemElement() === li) return items[i];
    }
  }
  function createEmptyItem() {
    return wrapItem({
      id: ytcenter.utils.assignId("resize_item_list_"),
      config: {
        customName: "",
        width: "",
        height: "",
        large: true,
        align: false,
        scrollToPlayer: false,
        scrollToPlayerButton: false,
        aspectRatioLocked: false
      }
    });
  }
  function setItems(_items) {
    items = [];
    ytcenter.utils.each(_items, function(i, item){
      items.push(wrapItem(item));
    });
    
    listOl.innerHTML = "";
    ytcenter.utils.each(items, function(i, item){
      listOl.appendChild(item.getItemElement());
    });
  }
  var editor;
  var saveCallback;
  var items = [];
  
  var wrapper = document.createElement("div");
  wrapper.className = "ytcenter-embed ytcenter-resize-panel";
  
  var headerWrapper = document.createElement("div");
  headerWrapper.className = "ytcenter-resize-panel-header";
  
  var addButton = ytcenter.gui.createYouTubeDefaultButton("", [ytcenter.gui.createYouTubeButtonTextLabel("EMBED_RESIZEITEMLIST_ADD_SIZE")]);
  ytcenter.utils.addClass(addButton, "ytcenter-list-header-btn");
  
  ytcenter.utils.addEventListener(addButton, "click", function(){
    selectSizeItem();
  });
  
  headerWrapper.appendChild(addButton);
  
  var contentWrapper = document.createElement("div");
  contentWrapper.className = "ytcenter-resize-panel-content";
  
  var editWrapper = document.createElement("div");
  editWrapper.className = "ytcenter-panel";
  
  var listWrapper = document.createElement("div");
  listWrapper.className = "ytcenter-resize-panel-list";
  
  var listOl = document.createElement("ol");
  listOl.className = "ytcenter-list ytcenter-dragdrop ytcenter-scrollbar ytcenter-scrollbar-hover";
  var dd = ytcenter.dragdrop(listOl);
  dd.addEventListener("onDrop", function(newIndex, oldIndex, item){
    var itm = items[oldIndex];
    items.splice(oldIndex, 1);
    items.splice(newIndex, 0, itm);
    if (typeof saveCallback !== "undefined") saveCallback(getSaveArray());
    ytcenter.events.performEvent("ui-refresh");
  });
  
  listWrapper.appendChild(listOl);
  contentWrapper.appendChild(listWrapper);
  contentWrapper.appendChild(editWrapper);
  wrapper.appendChild(headerWrapper);
  wrapper.appendChild(contentWrapper);
  
  ytcenter.events.addEvent("ui-refresh", function(){
    if (!editor) {
      editor = createEditor();
    }
    updateListHeight();
  });
  
  return {
    element: wrapper, // So the element can be appended to an element.
    bind: function(callback){
      saveCallback = function(arg){
        callback(arg);
        ytcenter.player.resizeUpdater();
      }
    },
    update: function(value){
      setItems(value);
      if (typeof editor !== "undefined") editor.setVisibility(false);
    }
  };
}
ytcenter.modules.colorpicker = function(option){
  function update() {
    wrapper.style.background = ytcenter.utils.colorToHex(red, green, blue);
    currentColor.style.background = ytcenter.utils.colorToHex(red, green, blue);
    redRange.update(red);
    greenRange.update(green);
    blueRange.update(blue);
    htmlColor.update(ytcenter.utils.colorToHex(red, green, blue));
  }
  function updateHueRange() {
    if (Math.max(red, green, blue) !== Math.min(red, green, blue)) {
      hueRange.update(hsv.hue);
    }
  }
 function updateColorField() {
    if (Math.max(red, green, blue) !== Math.min(red, green, blue)) {
      hsv = ytcenter.utils.getHSV(red, green, blue);
      hueRangeField.update(hsv.hue, hsv.saturation, hsv.value);
    } else {
      var __hsv = ytcenter.utils.getHSV(red, green, blue);
      if (hsv.value > hsv.saturation) {
        hsv.saturation = __hsv.saturation;
      } else if (hsv.value < hsv.saturation) {
        hsv.value = __hsv.value;
      } else {
        hsv.saturation = __hsv.saturation;
        hsv.value = __hsv.value;
      }
      hueRangeField.update(hsv.hue, hsv.saturation, hsv.value);
    }
  }
  var red = 0, green = 0, blue = 0, sessionHex = "#000000", hsv = ytcenter.utils.getHSV(red, green, blue), _hue = hsv.hue, bCallback,
      wrapper = document.createElement("span"),
      redRange = ytcenter.modules.range({
        args: {
          value: red,
          min: 0,
          max: 255
        }
      }), greenRange = ytcenter.modules.range({
        args: {
          value: green,
          min: 0,
          max: 255
        }
      }), blueRange = ytcenter.modules.range({
        args: {
          value: blue,
          min: 0,
          max: 255
        }
      }),
      rWrapper = document.createElement("div"),
      rText = ytcenter.modules.label({label: "COLORPICKER_COLOR_RED"}),
      gWrapper = document.createElement("div"),
      gText = ytcenter.modules.label({label: "COLORPICKER_COLOR_GREEN"}),
      bWrapper = document.createElement("div"),
      bText = ytcenter.modules.label({label: "COLORPICKER_COLOR_BLUE"}),
      hueWrapper = document.createElement("div"), 
      hueRangeField = ytcenter.modules.colorPickerField(),
      rgb, hueRangeHandle = document.createElement("div"),
      hueRangeHandleRight = document.createElement("div"),
      hueRange = ytcenter.modules.range({
        args: {
          value: hsv.hue,
          min: 0,
          max: 360,
          method: "vertical",
          handle: hueRangeHandle,
          offset: 7
        }
      }), d1, d2, d3, d4, d5, d6,
      hWrapper = document.createElement("div"),
      htmlColorLabel = ytcenter.utils.wrapModule(ytcenter.modules.label({label: "COLORPICKER_COLOR_HTMLCODE"})),
      htmlColor = ytcenter.modules.textfield(),
      currentColor = document.createElement("span"),
      rgbWrapper = document.createElement("div"),
      cpWrapper = document.createElement("div"),
      dialog;
  wrapper.className += " ytcenter-modules-colorpicker";
  redRange.bind(function(value){
    red = value;
    update();
    updateHueRange();
    updateColorField();
  });
  greenRange.bind(function(value){
    green = value;
    update();
    updateHueRange();
    updateColorField();
  });
  blueRange.bind(function(value){
    blue = value;
    update();
    updateHueRange();
    updateColorField();
  });
  
  rWrapper.appendChild(rText.element);
  rWrapper.appendChild(redRange.element);
  gWrapper.appendChild(gText.element);
  gWrapper.appendChild(greenRange.element);
  bWrapper.appendChild(bText.element);
  bWrapper.appendChild(blueRange.element);
  
  hueWrapper.className += " ytcenter-modules-colorpicker-huewrapper";
  hueRangeField.bind(function(saturation, value){
    hsv.saturation = saturation;
    hsv.value = value;
    rgb = ytcenter.utils.getRGB(hsv.hue, hsv.saturation, hsv.value);
    red = rgb.red;
    green = rgb.green;
    blue = rgb.blue;
    update();
  });
  hueRangeField.element.className += " ytcenter-modules-colorpickerfield-hue";
  hueRangeHandle.className += " ytcenter-modules-range-handle";
  hueRangeHandleRight.className += " ytcenter-modules-range-handle-right";
  hueRangeHandle.appendChild(hueRangeHandleRight);
  
  
  hueRange.element.className += " ytcenter-modules-huerange ytcenter-modules-hue";
  d1 = document.createElement("div");
  d1.className = "ie-1";
  d2 = document.createElement("div");
  d2.className = "ie-2";
  d3 = document.createElement("div");
  d3.className = "ie-3";
  d4 = document.createElement("div");
  d4.className = "ie-4";
  d5 = document.createElement("div");
  d5.className = "ie-5";
  d6 = document.createElement("div");
  d6.className = "ie-6";
  hueRange.element.appendChild(d1);
  hueRange.element.appendChild(d2);
  hueRange.element.appendChild(d3);
  hueRange.element.appendChild(d4);
  hueRange.element.appendChild(d5);
  hueRange.element.appendChild(d6);
  hueRange.bind(function(value){
    hsv.hue = value;
    rgb = ytcenter.utils.getRGB(hsv.hue, hsv.saturation, hsv.value);
    red = rgb.red;
    green = rgb.green;
    blue = rgb.blue;
    update();
    updateColorField();
  });
  hWrapper.className += " ytcenter-modules-hwrapper";
  htmlColorLabel.className += " ytcenter-modules-htmlcolorlabel";
  htmlColor.bind(function(value){
    rgb = ytcenter.utils.hexToColor(value);
    red = rgb.red;
    green = rgb.green;
    blue = rgb.blue;
    
    hsv = ytcenter.utils.getHSV(red, green, blue);
    
    update();
    updateHueRange();
    updateColorField();
  });
  htmlColor.element.className += " ytcenter-modules-htmlcolor";
  
  currentColor.className += " ytcenter-modules-currentcolor";
  currentColor.style.background = sessionHex;
  
  htmlColor.element.appendChild(currentColor);
  
  hWrapper.appendChild(htmlColorLabel);
  hWrapper.appendChild(htmlColor.element);
  
  
  rgbWrapper.className += " ytcenter-modules-rgbwrapper";
  rgbWrapper.appendChild(rWrapper);
  rgbWrapper.appendChild(gWrapper);
  rgbWrapper.appendChild(bWrapper);
  
  rgbWrapper.appendChild(hWrapper);
  
  hueWrapper.appendChild(hueRangeField.element);
  hueWrapper.appendChild(hueRange.element);
  
  cpWrapper.className += " ytcenter-modules-cpwrapper";
  cpWrapper.appendChild(hueWrapper);
  cpWrapper.appendChild(rgbWrapper);
  
  dialog = ytcenter.dialog("COLORPICKER_TITLE", cpWrapper, [
    {
      label: "COLORPICKER_CANCEL",
      primary: false,
      callback: function(){
        rgb = ytcenter.utils.hexToColor(sessionHex);
        red = rgb.red;
        green = rgb.green;
        blue = rgb.blue;
        update();
        updateHueRange();
        updateColorField();
        ytcenter.events.performEvent("ui-refresh");
        
        dialog.setVisibility(false);
      }
    }, {
      label: "COLORPICKER_SAVE",
      primary: true,
      callback: function(){
        ytcenter.events.performEvent("ui-refresh");
        sessionHex = ytcenter.utils.colorToHex(red, green, blue);
        if (bCallback) bCallback(sessionHex);
        dialog.setVisibility(false);
      }
    }
  ]);
  
  ytcenter.utils.addEventListener(wrapper, "click", function(){
    dialog.setVisibility(true);
    ytcenter.events.performEvent("ui-refresh");
    update();
  });
  
  update();
  updateHueRange();
  updateColorField();
  
  return {
    element: wrapper,
    bind: function(callback){
      bCallback = callback;
    },
    update: function(value){
      sessionHex = value;
      rgb = ytcenter.utils.hexToColor(sessionHex);
      red = rgb.red;
      green = rgb.green;
      blue = rgb.blue;
      update();
      updateHueRange();
      updateColorField();
      ytcenter.events.performEvent("ui-refresh");
    }
  };
};
ytcenter.modules.colorPickerField = function(option){
  function update() {
    var x = sat/100*wrapper.clientWidth,
        y = (100 - val)/100*wrapper.clientHeight;
    handler.style.top = Math.round(y - handler.offsetHeight/2) + "px";
    handler.style.left = Math.round(x - handler.offsetWidth/2) + "px";
  }
  function updateBackground() {
    wrapper.style.background = ytcenter.utils.hsvToHex(hue, 100, 100);
  }
  function eventToValue(e) {
    var offset = ytcenter.utils.getOffset(wrapper),
        scrollOffset = ytcenter.utils.getScrollOffset(),
        x = Math.max(0, Math.min(e.pageX - offset.left - scrollOffset.left, wrapper.clientWidth)),
        y = e.pageY - offset.top - scrollOffset.top;
    
    if (y < 0) y = 0;
    if (y > wrapper.clientHeight) y = wrapper.clientHeight;
    
    sat = x/wrapper.clientWidth*100;
    val = 100 - y/wrapper.clientHeight*100;
  }
  var bCallback,
      hue = (option && option.args && option.args.hue) || 0,
      sat = (option && option.args && option.args.sat) || 0,
      val = (option && option.args && option.args.val) || 0,
      wrapper = document.createElement("div"),
      _sat = document.createElement("div"),
      _value = document.createElement("div"),
      handler = document.createElement("div"),
      mousedown
  
  wrapper.style.background = ytcenter.utils.hsvToHex(hue, 100, 100);
  wrapper.style.position = "relative"; // CLASS!!
  wrapper.style.overflow = "hidden"; // CLASS!!
  
  _sat.className = "ytcenter-modules-colorpicker-saturation";
  
  _value.className = "ytcenter-modules-colorpicker-value";
  _sat.appendChild(_value);
  
  wrapper.appendChild(_sat);
  
  handler.className = "ytcenter-modules-colorpicker-handler";
  
  wrapper.appendChild(handler);
  
  ytcenter.utils.addEventListener(wrapper, "mousedown", function(e){
    if (mousedown) return;
    mousedown = true;
    
    eventToValue(e);
    update();
    if (bCallback) bCallback(sat, val);
    
    if (e && e.preventDefault) {
      e.preventDefault();
    } else {
      window.event.returnValue = false;
    }
    return false;
  });
  ytcenter.utils.addEventListener(document, "mouseup", function(e){
    if (!mousedown) return;
    mousedown = false;
    if (e && e.preventDefault) {
      e.preventDefault();
    } else {
      window.event.returnValue = false;
    }
    return false;
  });
  ytcenter.utils.addEventListener(document, "mousemove", function(e){
    if (!mousedown) return;
    eventToValue(e);
    update();
    if (bCallback) bCallback(sat, val);
    
    if (e && e.preventDefault) {
      e.preventDefault();
    } else {
      window.event.returnValue = false;
    }
    return false;
  });
  ytcenter.events.addEvent("ui-refresh", function(){
    update();
    updateBackground();
  });
  update();
  updateBackground();
  
  return {
    element: wrapper,
    bind: function(callback){
      bCallback = callback;
    },
    update: function(h, s, v){
      hue = h;
      sat = s;
      val = v;
      update();
      updateBackground();
    }
  };
};
ytcenter.modules.range = function(option){
  function setValue(val) {
    if (val === options.value) return;
    if (options.step !== 0) {
      var diff = val%options.step;
      if (diff >= options.step/2 && (options.step-diff)+val <= options.max) {
        options.value = (options.step-diff)+val;
      } else {
        options.value = val - diff;
      }
    } else {
      options.value = val;
    }
    update();
    if (options.value > options.max) {
      setValue(options.max);
      return;
    }
    if (options.value < options.min) {
      setValue(options.min);
      return;
    }
  };
  function update() {
    if (options.method === "vertical") {
      handle.style.top = ((options.value - options.min)/(options.max - options.min)*(wrapper.clientHeight - handle.offsetHeight)) + "px";
    } else {
      handle.style.left = ((options.value - options.min)/(options.max - options.min)*(wrapper.clientWidth - handle.offsetWidth)) + "px";
    }
  }
  function eventToValue(e) {
    var offset = ytcenter.utils.getOffset(wrapper),
        scrollOffset = ytcenter.utils.getScrollOffset(),
        v, l;
    if (options.method === "vertical") {
      offset.top += options.offset;
      v = e.pageY - scrollOffset.top - offset.top;
      l = v + parseInt(options.height)/2 - 3;
      if (l < 0) l = 0;
      if (l > wrapper.clientHeight - handle.clientHeight) l = wrapper.clientHeight - handle.clientHeight;
      
      setValue(l/(wrapper.clientHeight - handle.clientHeight)*(options.max - options.min) + options.min);
    } else {
      offset.left += options.offset;
      v = e.pageX - scrollOffset.left - offset.left;
      l = v - parseInt(options.height)/2;
      if (l < 0) l = 0;
      if (l > wrapper.clientWidth - handle.clientWidth) l = wrapper.clientWidth - handle.clientWidth;
      
      setValue(l/(wrapper.clientWidth - handle.clientWidth)*(options.max - options.min) + options.min);
    }
    update();
  }
  var options = ytcenter.utils.mergeObjects({
                  value: 0,
                  min: 0,
                  max: 100,
                  step: 1,
                  width: "225px",
                  height: "14px",
                  method: "horizontal", // horizontal, vertical
                  handle: null,
                  offset: 0
                }, option.args),
      handle, mousedown = false, bCallback,
      wrapper = document.createElement("span");
  
  wrapper.className = "ytcenter-modules-range";
  if (options.method === "vertical") {
    wrapper.style.width = options.height;
    wrapper.style.height = options.width;
  } else {
    wrapper.style.width = options.width;
    wrapper.style.height = options.height;
  }
  if (options.handle) {
    handle = options.handle;
  } else {
    handle = document.createElement("div");
    handle.className = "ytcenter-modules-range-handle";
    handle.style.width = (parseInt(options.height)) + "px";
    handle.style.height = parseInt(options.height) + "px";
  }
  
  wrapper.appendChild(handle);
  
  ytcenter.events.addEvent("ui-refresh", function(){
    setValue(options.value);
    update();
  });
  setValue(options.value);
  update();
  
  ytcenter.utils.addEventListener(wrapper, "mousedown", function(e){
    if (mousedown) return;
    mousedown = true;
    
    eventToValue(e);
    if (bCallback) bCallback(options.value);
    
    if (e && e.preventDefault) {
      e.preventDefault();
    } else {
      window.event.returnValue = false;
    }
    return false;
  });
  ytcenter.utils.addEventListener(document, "mouseup", function(e){
    if (!mousedown) return;
    mousedown = false;
    if (e && e.preventDefault) {
      e.preventDefault();
    } else {
      window.event.returnValue = false;
    }
    return false;
  });
  ytcenter.utils.addEventListener(document, "mousemove", function(e){
    if (!mousedown) return;
    eventToValue(e);
    if (bCallback) bCallback(options.value);
    
    if (e && e.preventDefault) {
      e.preventDefault();
    } else {
      window.event.returnValue = false;
    }
    return false;
  });
  return {
    element: wrapper,
    bind: function(callback){
      bCallback = callback;
    },
    update: function(value){
      setValue(value);
      update();
    },
    getValue: function(){
      return options.value;
    }
  };
};
ytcenter.modules.label = function(option){
  var frag = document.createDocumentFragment(),
      text = document.createTextNode(ytcenter.language.getLocale(option.label));
  frag.appendChild(text);
  ytcenter.language.addLocaleElement(text, option.label, "@textContent");
  
  return {
    element: frag, // So the element can be appended to an element.
    bind: function(){},
    update: function(){}
  };
};
ytcenter.modules.list = function(option){
  function update(value) {
    var i;
    for (i = 0; i < s.options.length; i++) {
      if (s.options[i].value === value) {
        s.selectedIndex = i;
        break;
      }
    }
  }
  function bind(callback) {
    cCallback = callback;
  }
  var frag = document.createDocumentFragment(),
      elm = document.createElement("span"),
      sc = document.createElement("span"),
      defaultLabel, s = document.createElement("select"),
      list = [], defaultLabelText,
      sc1 = document.createElement("img"),
      sc2 = document.createElement("span"),
      cCallback;
  elm.className = "yt-uix-form-input-select";
  sc.className = "yt-uix-form-input-select-content";
  
  s.className = "yt-uix-form-input-select-element";
  s.style.cursor = "pointer";
  if (typeof option.args.list === "function") {
    list = option.args.list();
  } else {
    list = option.args.list;
  }
  if (list && list.length > 0) {
    defaultLabelText = ytcenter.language.getLocale(list[0].label);
    for (var i = 0; i < list.length; i++) {
      var item = document.createElement("option");
      item.value = list[i].value;
      
      if (typeof list[i].label === "function") {
        item.textContent = list[i].label();
      } else if (typeof list[i].label !== "undefined") {
        item.textContent = ytcenter.language.getLocale(list[i].label);
        ytcenter.language.addLocaleElement(item, list[i].label, "@textContent");
      }
      if (list[i].value === ytcenter.settings[option.defaultSetting]) {
        item.selected = true;
        defaultLabelText = item.textContent;
      }
      s.appendChild(item);
    }
    sc1.src = "//s.ytimg.com/yt/img/pixel-vfl3z5WfW.gif";
    sc1.className = "yt-uix-form-input-select-arrow";
    sc.appendChild(sc1);
    sc2.className = "yt-uix-form-input-select-value";
    sc2.textContent = defaultLabelText;
    sc.appendChild(sc2);
    ytcenter.events.addEvent("ui-refresh", function(){
      sc2.textContent = s.options[s.selectedIndex].textContent;
    });
    ytcenter.utils.addEventListener(s, "change", function(){
      sc2.textContent = s.options[s.selectedIndex].textContent;
      if (cCallback)
        cCallback(s.value);
    }, false);
  }
  elm.appendChild(sc);
  elm.appendChild(s);
  
  frag.appendChild(elm);
  
  return {
    element: frag,
    bind: bind,
    update: update
  };
};
ytcenter.modules.textfield = function(option){
  function update(text) {
    input.value = text;
  }
  function bind(callback) {
    ytcenter.utils.addEventListener(input, "change", function(){
      callback(input.value);
    }, false);
  }
  var frag = document.createDocumentFragment(),
      input = document.createElement("input");
  input.setAttribute("type", "text");
  input.className = "yt-uix-form-input-text";
  input.value = option && ytcenter.settings[option.defaultSetting];
  if (option && option.style) {
    for (var key in option.style) {
      if (option.style.hasOwnProperty(key)) {
        elm.style[key] = option.style[key];
      }
    }
  }
  frag.appendChild(input);
  return {
    element: frag,
    bind: bind,
    update: update
  };
};
ytcenter.modules.line = function(){
  var frag = document.createDocumentFragment(),
      hr = document.createElement("hr");
  hr.className = "yt-horizontal-rule";
  frag.appendChild(hr);
  return {
    element: frag,
    bind: function(){},
    update: function(){}
  };
};
ytcenter.modules.bool = function(option){
  function update(checked) {
    checkboxInput.checked = checked;
    if (checked) {
      ytcenter.utils.addClass(checkboxOuter, "checked");
    } else {
      ytcenter.utils.removeClass(checkboxOuter, "checked");
    }
  }
  function bind(callback) {
    ytcenter.utils.addEventListener(checkboxInput, "change", function(){
      callback(checkboxInput.checked);
    }, false);
  }
  var frag = document.createDocumentFragment(),
      checkboxOuter = document.createElement("span"),
      checkboxInput = document.createElement("input"),
      checkboxOverlay = document.createElement("span"),
      checked = ytcenter.settings[option.defaultSetting];
  if (typeof checked !== "boolean") checked = false; // Just to make sure it's a boolean!
  checkboxOuter.className = "yt-uix-form-input-checkbox-container" + (checked ? " checked" : "");
  checkboxInput.className = "yt-uix-form-input-checkbox";
  checkboxOverlay.className = "yt-uix-form-input-checkbox-element";
  checkboxInput.checked = checked;
  checkboxInput.setAttribute("type", "checkbox");
  checkboxInput.setAttribute("value", checked);
  checkboxOuter.appendChild(checkboxInput);
  checkboxOuter.appendChild(checkboxOverlay);
  
  ytcenter.utils.addEventListener(checkboxOuter, "click", function(){
    checked = !checked;
    if (checked) {
      ytcenter.utils.addClass(checkboxOuter, "checked");
    } else {
      ytcenter.utils.removeClass(checkboxOuter, "checked");
    }
    checkboxInput.setAttribute("value", checked);
  }, false);
  
  frag.appendChild(checkboxOuter);
  
  return {
    element: frag,
    bind: bind,
    update: update
  };
};

/**** Settings part ****/
ytcenter.settingsPanel = (function(){
  var a = {}, categories = [], subcategories = [], options = [];
  
  a.createCategory = function(label){
    var id = categories.length;
    categories.push({
      id: id,
      label: label,
      enabled: true,
      visible: true,
      subcategories: []
    });
    return a.getCategory(id);
  };
  a.createSubCategory = function(label){
    var id = subcategories.length;
    subcategories.push({
      id: id,
      label: label,
      enabled: true,
      visible: true,
      options: []
    });
    return a.getSubCategory(id);
  };
  a.createOption = function(defaultSetting, module, label, args, help){
    var id = options.length;
    options.push({
      id: id,
      label: label,
      args: args,
      defaultSetting: defaultSetting,
      module: module,
      help: help,
      enabled: true,
      visible: true
    });
    return a.getOption(id);
  };
  a.getCategory = function(id){
    if (categories.length <= id || id < 0) throw new Error("[Settings Category] Category with specified id doesn't exist!");
    var cat = categories[id];
    return {
      getId: function(){
        return id;
      },
      setVisibility: function(visible){
        cat.visible = visible;
      },
      setEnabled: function(enabled){
        cat.enabled = enabled;
      },
      addSubCategory: function(subcategory){
        cat.subcategories.push(subcategories[subcategory.getId()]);
      },
      select: function(){
        if (cat.select) cat.select();
      }
    };
  };
  a.getSubCategory = function(id){
    if (subcategories.length <= id || id < 0) throw new Error("[Settings SubCategory] Category with specified id doesn't exist!");
    var subcat = subcategories[id];
    return {
      getId: function(){
        return id;
      },
      setVisibility: function(visible){
        subcat.visible = visible;
      },
      setEnabled: function(enabled){
        subcat.enabled = enabled;
      },
      addOption: function(option){
        subcat.options.push(options[option.getId()]);
      },
      select: function(){
        if (cat.select) cat.select();
      }
    };
  };
  a.getOption = function(id){
    if (options.length <= id || id < 0) throw new Error("[Settings Options] Option with specified id doesn't exist!");
    var option = options[id];
    return {
      getId: function(){
        return id;
      },
      getLabel: function(){
        return option.label;
      },
      getDefaultSetting: function(){
        return option.defaultSetting;
      },
      getModule: function(){
        return option.module;
      },
      getHelp: function(){
        return option.help;
      },
      setVisibility: function(visible){
        option.visible = visible;
      },
      setEnabled: function(enabled){
        option.enabled = enabled;
      }
    };
  };
  a.createOptionsForLayout = function(subcat){
    var frag = document.createDocumentFragment();
    
    subcat.options.forEach(function(option){
      var optionWrapper = document.createElement("div"),
          label, module, moduleContainer, labelText, help, replaceHelp;
      if (option.label && option.label !== "") {
        labelText = document.createTextNode(ytcenter.language.getLocale(option.label));
        ytcenter.language.addLocaleElement(labelText, option.label, "@textContent");
        
        label = document.createElement("span");
        label.className = "ytcenter-settings-option-label";
        label.appendChild(labelText);
        
        if (option.help && option.help !== "") {
          help = document.createElement("a");
          help.className = "ytcenter-settings-help";
          help.setAttribute("target", "_blank");
          help.setAttribute("href", option.help);
          help.appendChild(document.createTextNode('?'));
          replaceHelp = { "{option}": function() { return ytcenter.language.getLocale(option.label); } };
          help.setAttribute("title", ytcenter.utils.replaceTextToText(ytcenter.language.getLocale("SETTINGS_HELP_ABOUT"), replaceHelp));
          ytcenter.language.addLocaleElement(help, "SETTINGS_HELP_ABOUT", "title", replaceHelp);
          label.appendChild(help);
        }
        
        optionWrapper.appendChild(label);
      }
      if (!option.module)
        throw new Error("[Settings createOptionsForLayout] Option (" + option.id + ", " + option.label + ") doesn't have module!");
      if (!ytcenter.modules[option.module])
        throw new Error("[Settings createOptionsForLayout] Option (" + option.id + ", " + option.label + ", " + option.module + ") are using an non existing module!");

      moduleContainer = document.createElement("span");
      module = ytcenter.modules[option.module](option);
      moduleContainer.appendChild(module.element);
      
      module.bind(function(value){
        console.log("[Placeholder] Saves " + option.defaultSetting + " with value: " + value);
      });
      
      optionWrapper.appendChild(moduleContainer);
      frag.appendChild(optionWrapper);
    });
    
    return frag;
  };
  a.createLayout = function(){
    var frag = document.createDocumentFragment(),
        categoryList = document.createElement("ul"),
        subcatList = [],
        sSelectedList = [],
        leftPanel = document.createElement("div"), rightPanel = document.createElement("div"),
        rightPanelContent = document.createElement("div"),
        productVersion = document.createElement("div"),
        subcatTop = document.createElement("div"), subcatContent = document.createElement("div"),
        panelWrapper = document.createElement("div"),
        categoryHide = false;
    subcatTop.className = "ytcenter-settings-subcat-header-wrapper";
    subcatContent.className = "ytcenter-settings-subcat-content-wrapper";
    leftPanel.className = "ytcenter-settings-panel-left clearfix";
    rightPanel.className = "ytcenter-settings-panel-right clearfix";
    
    productVersion.className = "ytcenter-settings-version";
    productVersion.textContent = "YouTube Center v" + ytcenter.version;
    
    categoryList.className = "ytcenter-settings-category-list";
    categories.forEach(function(category){
      var li = document.createElement("li"),
          acat = document.createElement("a"),
          valign = document.createElement("span"),
          text = document.createElement("span"),
          subcatLinkList = [],
          subcatContentList = [],
          topheader = document.createElement("div"),
          topheaderList = document.createElement("ul"),
          categoryContent = document.createElement("div"),
          hideContent = false;
      sSelectedList.push(acat);
      acat.href = ";return false;";
      acat.className = "ytcenter-settings-category-item yt-valign" + (categoryHide ? "" : " ytcenter-selected");
      
      ytcenter.utils.addEventListener(acat, "click", function(e){
        category.select();
        
        e.preventDefault();
        e.stopPropagation();
        return false;
      }, false);
      valign.className = "yt-valign-container";
      
      text.textContent = ytcenter.language.getLocale(category.label);
      ytcenter.language.addLocaleElement(text, category.label, "@textContent");
      
      valign.appendChild(text);
      acat.appendChild(valign);
      li.appendChild(acat);
      categoryList.appendChild(li);
      
      topheaderList.className = "ytcenter-settings-subcat-header clearfix";
      category.subcategories.forEach(function(subcat){
        var content = document.createElement("div"),
            liItem = document.createElement("li"),
            liItemLink = document.createElement("a"),
            itemTextContent = document.createElement("span");
        content.className = "ytcenter-settings-subcat-content" + (hideContent ? " hid" : "");
        liItem.className = "clearfix";
        liItemLink.className = "yt-uix-button ytcenter-settings-subcat-header-item" + (hideContent ? "" : " ytcenter-selected");
        itemTextContent.className = "ytcenter-settings-subcat-header-item-content";
        itemTextContent.textContent = ytcenter.language.getLocale(subcat.label);
        ytcenter.language.addLocaleElement(itemTextContent, subcat.label, "@textContent");
        
        content.appendChild(a.createOptionsForLayout(subcat));
        
        liItemLink.appendChild(itemTextContent);
        liItem.appendChild(liItemLink);
        topheaderList.appendChild(liItem);
        
        ytcenter.utils.addEventListener(liItemLink, "click", function(e){
          subcat.select();
          
          e.preventDefault();
          e.stopPropagation();
          return false;
        }, false);
        subcatLinkList.push(liItemLink);
        subcatContentList.push(content);
        subcat.select = function(){
          subcatLinkList.forEach(function(item){
            ytcenter.utils.removeClass(item, "ytcenter-selected");
          });
          subcatContentList.forEach(function(item){
            ytcenter.utils.addClass(item, "hid");
          });
          ytcenter.utils.removeClass(content, "hid");
          ytcenter.utils.addClass(liItemLink, "ytcenter-selected");
        };
        
        categoryContent.appendChild(content);
        hideContent = true;
      });
      topheader.appendChild(topheaderList);
      
      topheader.className = (categoryHide ? "hid" : "");
      categoryContent.className = (categoryHide ? "hid" : "");
      
      subcatList.push(topheader);
      subcatList.push(categoryContent);
      subcatTop.appendChild(topheader);
      subcatContent.appendChild(categoryContent);
      
      category.select = function(){
        sSelectedList.forEach(function(item){
          ytcenter.utils.removeClass(item, "ytcenter-selected");
        });
        subcatList.forEach(function(item){
          ytcenter.utils.addClass(item, "hid");
        });
        ytcenter.utils.addClass(acat, "ytcenter-selected");
        ytcenter.utils.removeClass(topheader, "hid");
        ytcenter.utils.removeClass(categoryContent, "hid");
      };
      categoryHide = true;
    });
    
    leftPanel.appendChild(categoryList);
    leftPanel.appendChild(productVersion);
    
    rightPanelContent.appendChild(subcatTop);
    rightPanelContent.appendChild(subcatContent);
    
    rightPanel.appendChild(rightPanelContent);
    
    rightPanelContent.className = "ytcenter-settings-panel-right-content";
    panelWrapper.className = "ytcenter-settings-content";
    
    panelWrapper.appendChild(leftPanel);
    panelWrapper.appendChild(rightPanel);
    
    frag.appendChild(panelWrapper);
    
    return frag;
  };
  
  a.createDialog = function(){
    var dialog = ytcenter.dialog("YouTube Center Settings", a.createLayout(), [], "top"),
        closeButton = document.createElement("div"),
        closeIcon = document.createElement("img");
    closeIcon.className = "close";
    closeIcon.setAttribute("src", "http://s.ytimg.com/yts/img/pixel-vfl3z5WfW.gif");
    closeButton.style.position = "absolute";
    closeButton.style.top = "0";
    closeButton.style.right = "0";
    closeButton.style.margin = "0";
    closeButton.className = "yt-alert";
    closeButton.appendChild(closeIcon);
    ytcenter.utils.addEventListener(closeButton, "click", function(){
      dialog.setVisibility(false);
    }, false);
    dialog.getHeader().appendChild(closeButton);
    dialog.getHeader().style.margin = "0 -20px 0px";
    dialog.getBase().style.overflowY = "scroll";
    dialog.getFooter().style.display = "none";
    dialog.getContent().className += " clearfix";
    return dialog;
  };
  return a;
})();

// Creating Categories
var general = ytcenter.settingsPanel.createCategory("General"),
    player = ytcenter.settingsPanel.createCategory("Player"),
    ui = ytcenter.settingsPanel.createCategory("UI"),
    update = ytcenter.settingsPanel.createCategory("Update"),
    debug = ytcenter.settingsPanel.createCategory("Debug"),
    about = ytcenter.settingsPanel.createCategory("About");

// Creating Subcategories
var general_subcat1 = ytcenter.settingsPanel.createSubCategory("General"),
    general_subcat2 = ytcenter.settingsPanel.createSubCategory("Experiments"),
    player_watch = ytcenter.settingsPanel.createSubCategory("Watch"),
    player_channel = ytcenter.settingsPanel.createSubCategory("Channel"),
    player_embed = ytcenter.settingsPanel.createSubCategory("Embed"),
    ui_videothumbnail = ytcenter.settingsPanel.createSubCategory("Video Thumbnail"),
    ui_comments = ytcenter.settingsPanel.createSubCategory("Comments"),
    ui_subscriptions = ytcenter.settingsPanel.createSubCategory("Subscriptions"),
    update_general = ytcenter.settingsPanel.createSubCategory("General"),
    update_channel = ytcenter.settingsPanel.createSubCategory("Channel"),
    debug_log = ytcenter.settingsPanel.createSubCategory("Log"),
    debug_options = ytcenter.settingsPanel.createSubCategory("Options"),
    about_about = ytcenter.settingsPanel.createSubCategory("About"),
    about_translators = ytcenter.settingsPanel.createSubCategory("Translators"),
    about_share = ytcenter.settingsPanel.createSubCategory("Share"),
    about_donate = ytcenter.settingsPanel.createSubCategory("Donate");

// Linking categories with subcategories
general.addSubCategory(general_subcat1);
general.addSubCategory(general_subcat2);

player.addSubCategory(player_watch);
player.addSubCategory(player_channel);
player.addSubCategory(player_embed);

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

var option_test = ytcenter.settingsPanel.createOption("TEST_SETTING", "bool", "Testing this", null, "http://www.google.com/");
var option_test2 = ytcenter.settingsPanel.createOption("This is a direct link to...", "textfield", "This is a textfield!!", null, "http://www.youtube.com/");
var option_test3 = ytcenter.settingsPanel.createOption(null, "line");
var option_test4 = ytcenter.settingsPanel.createOption("42", "list", "A simple label", {
  list: [
    {
      value: "not-1",
      label: "Item #1"
    }, {
      value: "POKEMON",
      label: "DOPE"
    }, {
      value: "42",
      label: function(){ return 6*7; }
    }
  ]
});
var option_test5 = ytcenter.settingsPanel.createOption(33, "list", "A simple label v2", {
  list: function(){
    var b = [], i;
    for (i = 0; i < 42; i++) {
      b.push({label: i*Math.sqrt(2), value: i});
    }
    return b;
  }
});

var option_test6 = ytcenter.settingsPanel.createOption("#e3e3e3", "colorpicker", "ColorPicker!!");

var option_about = ytcenter.settingsPanel.createOption("", "aboutText", "");
var option_translators = ytcenter.settingsPanel.createOption("", "translators", "", {
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
});


// Linking options to subcategories
general_subcat1.addOption(option_test);
general_subcat1.addOption(option_test2);
general_subcat1.addOption(option_test3);
general_subcat1.addOption(option_test4);
general_subcat1.addOption(option_test5);
general_subcat1.addOption(option_test6);

about_about.addOption(option_about);
about_translators.addOption(option_translators);

/*// Creating settingsPanel element
var dialog = ytcenter.settingsPanel.createDialog();

// Displaying the settingsPanel
dialog.setVisibility(true);*/