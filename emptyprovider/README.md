# EmptyProvider
Provider for just a canvas

This provider uses a callback function `requestImage` to draw a tile canvas. You can draw anything you want into the passed canvas and send it back in the return.

```
var magnoProvider = new MagnoEmptyProvider({
  debugTiles : true,
  requestImage : requestTileImage,
});
var imageryLayer = viewer.imageryLayers.addImageryProvider( magnoProvider );
```

Some tile creation examples:

1) Draw a single image:
```
const image = document.getElementById('myImage');
function requestTileImage( x, y, level, request, bbox, canvas ){
   	canvas.getContext('2d').drawImage(image, 5, 5);
    return canvas;
}
```
2) Draw something:

```
function requestTileImage( x, y, level, request, bbox, canvas ){
	var context = canvas.getContext('2d');
    var cssColor = this._color.toCssColorString();
    context.strokeStyle = cssColor;
    context.lineWidth = 1;
    context.strokeRect(1, 1, 255, 255);

    var labelLevel = level;
    var labelLon = bbox.neCorner.lat + "," + bbox.neCorner.lon;
    var labelLat = bbox.swCorner.lat + "," + bbox.swCorner.lon;

    context.textAlign = 'center';
    context.fillStyle = '#FFFFFF';
    if (level > 10) {
        context.font = 'bold 16px Arial';
        context.fillText(labelLevel, 124, 100);
        context.fillText(labelLon, 124, 124);
        context.fillText(labelLat, 124, 148);
    } else {
        context.font = 'bold 25px Arial';
        context.fillText(labelLevel, 124, 94);
        context.fillText(labelLon, 124, 124);
        context.fillText(labelLat, 124, 154);
    }

    return canvas;
}
```






