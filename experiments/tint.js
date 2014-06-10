(function(){
  function tintImage(url, rgba, callback) {
    function onerror() {
      throw "Couldn't load image!";
    }
    function onload() {
      canvas.width = img.width;
      canvas.height = img.height;
      
      ctx.clearRect(0, 0, img.width, img.height);
      ctx.drawImage(img, 0, 0, img.width, img.height);
      
      var imageData = ctx.getImageData(0, 0, img.width, img.height);
      var idx, i, pixel;
      for (i = (img.width * img.height); i >= 0; --i) {
        idx = i << 2;
        pixel = {r: imageData.data[idx], g: imageData.data[idx + 1], b: imageData.data[idx + 2]};
        
        imageData.data[idx] = (rgba.a * rgba.r + (1 - rgba.a) * pixel.r);
        imageData.data[idx + 1] = (rgba.a * rgba.g + (1 - rgba.a) * pixel.g);
        imageData.data[idx + 2] = (rgba.a * rgba.b + (1 - rgba.a) * pixel.b);
      }
      ctx.putImageData(imageData, 0, 0);
      
      callback(canvas);
    }
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");
    
    var img = new Image();
    img.src = url;
    img.onload = onload;
    img.onerror = onerror;
  }
})();