CREATE OR REPLACE FUNCTION public.first_agg (anyelement, anyelement)
  RETURNS anyelement
  LANGUAGE sql IMMUTABLE STRICT PARALLEL SAFE AS
'SELECT $1';

CREATE AGGREGATE public.first(anyelement) (
  SFUNC = public.first_agg
, STYPE = anyelement
, PARALLEL = safe
);


CREATE OR REPLACE FUNCTION public.last_agg (anyelement, anyelement)
  RETURNS anyelement
  LANGUAGE sql IMMUTABLE STRICT PARALLEL SAFE AS
'SELECT $2';

CREATE AGGREGATE public.last(anyelement) (
  SFUNC = public.last_agg
, STYPE = anyelement
, PARALLEL = safe
);
