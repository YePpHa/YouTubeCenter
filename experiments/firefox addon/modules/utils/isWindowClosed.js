const EXPORTED_SYMBOLS = ['isWindowClosed'];

var Cu = Components.utils;

function isWindowClosed(aWin) {
  try {
    if (Cu.isDeadWrapper && Cu.isDeadWrapper(aWin)) {
      return true;
    }
    
    try {
      if (aWin.closed) return true;
    } catch (e) {
      return true;
    }
  } catch (e) {
    Cu.reportError(e);
    return true;
  }
  return false;
}
