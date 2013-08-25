const EXPORTED_SYMBOLS = ['storage'];

var Cc = Components.classes,
    Ci = Components.interfaces,
    Cu = Components.utils;
    
// Flags passed when opening a file.  See nsprpub/pr/include/prio.h.
const OPEN_FLAGS = {
  RDONLY: parseInt("0x01"),
  WRONLY: parseInt("0x02"),
  CREATE_FILE: parseInt("0x08"),
  APPEND: parseInt("0x10"),
  TRUNCATE: parseInt("0x20"),
  EXCL: parseInt("0x80")
};
const BUFFER_BYTE_LEN = 0x8000;
const PR_UINT32_MAX = 0xffffffff;
const DEFAULT_CHARSET = "UTF-8";

function Storage(filename) {
  this.filename = filename;
}

Storage.prototype.getFile = function(){
  var file = Cc['@mozilla.org/file/local;1']
             .createInstance(Ci.nsILocalFile);
  file.initWithPath(this.filename);
  return file;
};

Storage.prototype.read = function(){
  var file = this.getFile();
  if (file.exists()) {
    var stream = Components.classes['@mozilla.org/network/file-output-stream;1'].createInstance(Ci.nsIFileOutputStream),
        openFlags = OPEN_FLAGS.WRONLY |
                    OPEN_FLAGS.CREATE_FILE |
                    OPEN_FLAGS.TRUNCATE;
    var permFlags = parseInt("0644", 8);
    stream.init(file, OPEN_FLAGS.RDONLY, 0, 0);
    
    return 
  } else {
    throw new Error("[Storage] File does not exist: " + this.filename);
  }
};

function checkCharset(charset) {
  return typeof(charset) === "string" ? charset : DEFAULT_CHARSET;
}

function TextReader(is, charset) {
  charset = checkCharset(charset);
  
  let stream = Cc["@mozilla.org/intl/converter-input-stream;1"].
               createInstance(Ci.nsIConverterInputStream);
  stream.init(is, charset, BUFFER_BYTE_LEN,
              Ci.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER);
}

// This manages the lifetime of stream, a TextReader or TextWriter.  It defines
// closed and close() on stream and registers an unload listener that closes
// rawStream if it's still opened.  It also provides ensureOpened(), which
// throws an exception if the stream is closed.
function StreamManager(stream, rawStream) {
  const self = this;
  this.rawStream = rawStream;
  this.opened = true;

  /**
   * True iff the stream is closed.
   */
  stream.__defineGetter__("closed", function stream_closed() {
    return !self.opened;
  });

  /**
   * Closes both the stream and its backing stream.  If the stream is already
   * closed, an exception is thrown.  For TextWriters, this first flushes the
   * backing stream's buffer.
   */
  stream.close = function stream_close() {
    self.ensureOpened();
    self.unload();
  };

  require("../system/unload").ensure(this);
}

StreamManager.prototype = {
  ensureOpened: function StreamManager_ensureOpened() {
    if (!this.opened)
      throw new Error("The stream is closed and cannot be used.");
  },
  unload: function StreamManager_unload() {
    // TextWriter.writeAsync() causes rawStream to close and therefore sets
    // opened to false, so check that we're still opened.
    if (this.opened) {
      // Calling close() on both an nsIUnicharInputStream and
      // nsIBufferedOutputStream closes their backing streams.  It also forces
      // nsIOutputStreams to flush first.
      this.rawStream.close();
      this.opened = false;
    }
  }
};