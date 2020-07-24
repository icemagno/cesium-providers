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
```
{
  "features": [
    {
      "geometry": {
        "coordinates": [
          [
            [
              -43.208993,
              -22.909676
            ],
            [
              -43.208888,
              -22.909805
            ],
            [
              -43.208823,
              -22.909761
            ],
            [
              -43.208856,
              -22.909717
            ],
            [
              -43.208893,
              -22.909669
            ],
            [
              -43.208923,
              -22.909631
            ],
            [
              -43.208948,
              -22.909647
            ],
            [
              -43.208993,
              -22.909676
            ]
          ]
        ],
        "type": "Polygon"
      },
      "type": "Feature",
      "properties": {
        "osm_id": 434833218,
        "height": 5.1999898
      }
    }
  ]
}
```


