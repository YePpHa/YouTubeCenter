const EXPORTED_SYMBOLS = ['bind'];

function bind(obj, method) {
  if (!obj[method])
    throw new Error("...");
  method = obj[method];
  
  var sargs = Array.prototype.splice.call(arguments, 2, arguments.length);
  return function() {
    var args = Array.prototype.slice.call(sargs);
    Array.prototype.push.apply(args, arguments);
    return method.apply(obj, args);
  };
}