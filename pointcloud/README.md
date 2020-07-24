# PointCloudProvider
A provider to load GeoJson from a database and draw pointclouds

![alt text](https://github.com/icemagno/cesium-providers/blob/master/buildingsprovider/screen.jpg?raw=true)


```
var url = "http://<YOUR_ENDPOINT>/?l={l}&r={r}&t={t}&b={b}";

var cloudProvider = new MagnoPointCloudProvider({
	debugTiles : false,
	viewer : viewer,
	activationLevel : 17,
	sourceUrl : url,
	featuresPerTile : 200,
	whenFeaturesAcquired : function( entities ){
		console.log( entities.length + " points received." );
	}
});

viewer.imageryLayers.addImageryProvider( cloudProvider );
```
When L,R,T and B are tile coordinates from Left,Right,Top and Bottom. The provider will calculate the correct corrdinates and replace the variables to call your endpoint wich need to provide Features from that box. 


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

You can use this query as example to take your polygons directly from OSM database:

```
CREATE OR REPLACE FUNCTION public.getbuildings( quantos integer, xmin double precision, ymin double precision, xmax double precision, ymax double precision)
RETURNS json as
$func$   
select row_to_json(fc)
from (
    select
        'FeatureCollection' as "type",
        array_to_json(array_agg(f)) as "features"
    from (
        select
            'Feature' as "type",
            ST_AsGeoJSON(ST_Transform(way, 4326), 6) :: json as "geometry",
            (
                select json_strip_nulls(row_to_json(t))
                from (
                    select
                        osm_id,
                        alt as height
                ) t
            ) as "properties"
        from planet_osm_polygon
        where public.planet_osm_polygon.way && ST_MakeEnvelope($2, $3, $4, $5, 4326)
        limit $1
    ) as f
) as fc;
$func$ LANGUAGE sql STABLE STRICT;
```




