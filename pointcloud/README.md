# PointCloudProvider
A provider to load GeoJson from a database and draw pointclouds

It works with pgPointCloud databases, reading vector points as GeoJSON and sending them to the provider.

![alt text](https://github.com/icemagno/cesium-providers/blob/master/pointcloud/screen.jpg?raw=true)

https://youtu.be/OEbfyxOjb7g

```
var url = "http://<YOUR_ENDPOINT>/?l={l}&r={r}&t={t}&b={b}";

var cloudProvider = new MagnoPointCloudProvider({
	debugTiles : false,
	viewer : viewer,
	activationLevel : 17,
	sourceUrl : url,
	featuresPerTile : 2000,
	whenFeaturesAcquired : function( entities ){
		console.log( entities.length + " points received." );
	}
});

viewer.imageryLayers.addImageryProvider( cloudProvider );
```
When L,R,T and B are tile coordinates from Left,Right,Top and Bottom. The provider will calculate the correct corrdinates and replace the variables to call your endpoint wich need to provide Features from that box. 

`featuresPerTile` actualy works as a detail controller because it will gives you a kind of "points per cube". As you go deep in level, the cube (tile) is smaller and density will increase.


This functions will help you to provide the points from your database:

```
CREATE OR REPLACE FUNCTION public.getpoints( xmin double precision, ymin double precision, xmax double precision, ymax double precision, quantos integer)
returns table ( ppp pcpoint ) 
language plpgsql
as $$
begin
  return query 
	WITH
	patches AS (
		SELECT pa FROM congonhas where pa::geometry && ST_MakeEnvelope($1, $2, $3, $4, 4326)
	),
	pa_pts AS (
		SELECT PC_Explode(pa) AS ppp FROM patches 
	)
	select * from pa_pts;
end; $$ 


CREATE OR REPLACE FUNCTION public.getpcloud( quantos integer, xmin double precision, ymin double precision, xmax double precision, ymax double precision)
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
        ST_AsGeoJSON(ST_Transform( ppp::geometry, 4326), 6) :: json as "geometry",
		json_build_object('data', array_to_json( PC_Get(ppp) ) ) as "properties"
        from getpoints(  $2, $3, $4, $5, $1  ) order by random() limit $1
    ) as f
) as fc;	
$func$ LANGUAGE sql STABLE STRICT;
```






