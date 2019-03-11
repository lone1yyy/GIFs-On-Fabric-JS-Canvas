 var gif_frames = 0;

 var progressWrapper = document.getElementById('progressWrapper');
 var progressText = document.getElementById('progressText');
 var view = document.getElementById('view');
 var drop = document.getElementById('drop');
 var canvas_sprite = new fabric.Canvas();

 document.getElementById('import-gif').addEventListener("change", function(e) {
     var file = e.target.files[0];

     if (/gif$/.test(file.type)) {
         progress('Loadging...');
         loadBuffer(file, function(buf) {
             var gif;
             progress('Parsing...');
             gif = new Gif();
             gif.onparse = function() {
                 progress('Please wait...');
                 setTimeout(function() {
                     buildImage(gif);
                     progress();
                 }, 20);
             };
             gif.onerror = function(e) {
                 progress();
                 alert(e);
             };
             gif.onprogress = function(e) {
                 progress('Parsing...' + ((100 * e.loaded / e.total) | 0) + '%');
             };
             gif.parse(buf);
         }, function(e) {
             alert(e);
         }, function(e) {
             progress('Loading...' + ((100 * e.loaded / e.total) | 0) + '%');
         });
     } else {
         alert('"' + file.name + '" not GIF');
     }
 });

 function progress(msg) {
     if (msg) {
         progressWrapper.style.display = 'block';
         progressText.textContent = msg;
     } else {
         progressWrapper.style.display = 'none';
     }
 }

 function loadBuffer(file, onload, onerror, onprogress) {
     var fr;
     fr = new FileReader();
     fr.onload = function() {
         onload(this.result);
     };
     fr.onerror = function() {
         if (onerror) {
             onerror(this.error);
         }
     };
     fr.onprogress = function(e) {
         if (onprogress) {
             onprogress(e);
         }
     };
     fr.readAsArrayBuffer(file);
 }


 function buildImage(gif){
     var canvas_frame, context, frames;
     canvas_sprite.clear();
     canvas_frame = document.createElement('canvas');
     canvas_frame.width = gif.header.width;
     canvas_frame.height = gif.header.height;
     canvas_frame.title = 'w=' + canvas_frame.width + ' h=' + canvas_frame.height;
     context = canvas_frame.getContext('2d');
     frames = gif.createFrameImages(context, true, false);
     gif_frames = frames.length;

     frames.forEach(function(frame, i) {
         var canvas_frame;
         canvas_frame = document.createElement('canvas');
         canvas_frame.width = frame.image.width;
         canvas_frame.height = frame.image.height;
         canvas_frame.getContext('2d').putImageData(frame.image, 0, 0);

         if (frames.length > 1) {
             img = new fabric.Image.fromURL(canvas_frame.toDataURL(), function(img) {
                 img.set('selectable', false);
                 img.left = img.getWidth() * i;
                 width = img.getWidth() * i + 1;
                 canvas_sprite.setHeight(img.getHeight());
                 canvas_sprite.setWidth(img.getWidth() * (i + 1));
                 canvas_sprite.add(img);
                 canvas_sprite.renderAll();
                 if (i == frames.length - 1) {
                     var img =  canvas_sprite.toDataURL('png');
                     buildView(img,canvas_frame.width,canvas_frame.height)
                 }
             });
         } else {
             alert("Invalid GIF");
         }
     });
 }

 function buildView(img,width,height) {
    var canvas = new fabric.Canvas('merge');
    canvas.setBackgroundColor('lightgreen');
    canvas.setWidth(5000)
    canvas.setHeight(5000)

    fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center';
    fabric.Object.prototype.transparentCorners = false;

    var ratio = window.devicePixelRatio;
    var imgData = {
        spriteWidth: width * ratio,
        spriteHeight: height * ratio,
        spriteIndex: 0,
        frameTime: 150,
    }

    fabric.Sprite.fromURL(img, createSprite(),imgData);

    function createSprite() {
    return function(sprite) {
      sprite.set({
        left: 500,
        top: 250,
      });
      canvas.add(sprite);
      setTimeout(function() {
        sprite.set('dirty', true);
        sprite.play();
      }, fabric.util.getRandomInt(1, 10) * 100);
    };
    }

    (function render() {
    canvas.renderAll();
    fabric.util.requestAnimFrame(render);
    })();


 }