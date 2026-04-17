UPDATE mints SET supply = (supply::numeric / 10000)::numeric WHERE symbol ILIKE 'faggot' OR symbol ILIKE 'testy';
UPDATE "boundingCurve" SET 
    initial_supply = (initial_supply::numeric / 10000)::numeric,
    virtual_token_balance = (virtual_token_balance::numeric / 10000)::numeric
WHERE mint IN (SELECT id FROM mints WHERE symbol ILIKE 'faggot' OR symbol ILIKE 'testy');
