
-- http://sisgeodef.defesa.mil.br/radar?l=-50.625&r=-45&t=5.625&b=0&count=200

CREATE OR REPLACE FUNCTION public.getsipamradar( quantos integer, xmin double precision, ymin double precision, xmax double precision, ymax double precision)
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
            ST_AsGeoJSON(ST_Transform( the_geom::geometry, 4326), 10) :: json as "geometry",
            (  select json_strip_nulls(row_to_json(t)) from ( select "id" ) t  ) as "properties"
        from sipam_grade_sbbe
        where public.sipam_grade_sbbe.the_geom::geometry && ST_MakeEnvelope($2, $3, $4, $5, 4326)
        limit $1
    ) as f
) as fc;
$func$ LANGUAGE sql STABLE STRICT;