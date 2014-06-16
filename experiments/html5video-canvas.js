(function(){
  function HTML5PlayerGlow(video, container) {
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.video = video;
    
    this.container = container || this.video;
    
    this.color = null;
    this.pixelInterval = 100000; /* Iterate every nth pixel instead of every single pixel */
    this.interval = 0;
    this.transition = 0;
    
    this.playing = false;
    this.boundAnimation = this.animation.bind(this);
    
    /* Add the play listener to the video */
    this.video.addEventListener("play", this.playListener, false);
    
    /* Call the play listener if the video was already playing when the listener got attached */
    this.playListener();
  }
  
  HTML5PlayerGlow.prototype.playListener = function(){
    if (this.playing || this.paused ||this.ended) {
    } else {
      this.playing = true;
      if (this.interval > 0) {
        setTimeout(this.animation.bind(this, Date.now()), this.interval);
      } else {
        requestAnimationFrame(this.boundAnimation);
      }
    }
  };
  
  HTML5PlayerGlow.prototype.animation = function(now){
    /* We don't need to calculate the color when the video is paused */
    if (this.video.paused) {
      this.lastDate = null;
      this.playing = false;
      return;
    }
    
    /* Clear the color buffer when the video has ended */
    if (this.video.ended) {
      this.lastDate = null;
      this.color = null;
      this.playing = false;
      return;
    }
    
    if (!this.lastDate) this.lastDate = now;
    
    /* Resize the canvas to the video */
    this.width = this.canvas.width = this.video.clientWidth;
    this.height = this.canvas.height = this.video.clientWidth;
    
    /* Write video data to canvas */
    this.ctx.drawImage(this.video, 0, 0, this.width, this.height);
    
    /* Loop through every pixel */
    var imageData = this.ctx.getImageData(0, 0, this.width, this.height);
    var length = imageData.data.length;
    
    var i = - 4;
    var count = 0;
    var r = 0, g = 0, b = 0;
    while ((i += this.pixelInterval * 4) < length) {
      count++;
      r += imageData.data[i];
      g += imageData.data[i + 1];
      b += imageData.data[i + 2];
    }
    
    /* We are dividing by a variable that could be 0 */
    if (count > 0) {
      /* Average the color */
      r = Math.floor(r/count);
      g = Math.floor(g/count);
      b = Math.floor(b/count);
    }
    
    if (this.color && this.transition > 0) {
      /* Delta time */
      var dt = (now - this.lastDate)/this.transition;
      this.lastDate = now;
      
      /* Transition from color to another */
      this.color.r = this.color.r + (r - this.color.r)*dt;
      this.color.g = this.color.g + (g - this.color.g)*dt;
      this.color.b = this.color.b + (b - this.color.b)*dt;
    } else {
      this.color = { r: r, g: g, b: b };
    }
    /* Make sure that the rgb color doesn't go under 0 or over 255 */
    if (this.color.r < 0) this.color.r = 0;
    if (this.color.r > 255) this.color.r = 255;
    
    if (this.color.g < 0) this.color.g = 0;
    if (this.color.g > 255) this.color.g = 255;
    
    if (this.color.b < 0) this.color.b = 0;
    if (this.color.b > 255) this.color.b = 255;
    
    /* Apply the new rgb values to the glow */
    this.applyGlow();
    
    /* We really want to run this again to change the color of the glow for the next frame */
    if (this.transition > 0) {
      setTimeout(this.animation.bind(this, Date.now()), this.interval);
    } else {
      requestAnimationFrame(this.boundAnimation);
    }
  };
  
  HTML5PlayerGlow.prototype.applyGlow = function(){
    var value = "0px 0px 15px 5px rgba(" + Math.floor(this.color.r) + ", " + Math.floor(this.color.g) + ", " + Math.floor(this.color.b) + ", .75)";
    this.container.style.setProperty("-webkit-box-shadow", value);
    this.container.style.setProperty("-moz-box-shadow", value);
    this.container.style.setProperty("box-shadow", value);
  };
  window.HTML5PlayerGlow = HTML5PlayerGlow;
})();
var myMagic = new HTML5PlayerGlow(document.getElementsByTagName("video")[0], document.getElementById("player-api"));