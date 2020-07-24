# BuildingsProvider
A provider to load GeoJson from a database and draw 3D polygons 

```
var url = "http://<YOUR_ENDPOINT>/?l={l}&r={r}&t={t}&b={b}";

var buildingsProvider = new MagnoBuildingsProvider({
  debugTiles : false,
  viewer : viewer,
  activationLevel : 17,
  sourceUrl : url,
  featuresPerTile : 200,
  whenFeaturesAcquired : function( entities ){
    console.log( entities.length + " buildings received." );
  }
});

viewer.imageryLayers.addImageryProvider( buildingsProvider );
```

You can check the expected format in the attached json file but it is basicaly an OSM polygon and the height attribute. You can send other attributes if you want but you MUST send height (as string or real)




