-- Comprehensive Data Consistency Correction Script
-- This script fixes the 10,000x scaling error for known buggy tokens

-- 1. Correct the 'faggot' token (ID: B8LEBFjryfsmTEmB3wqcQCb3Sxm191BHVk9wjqDB1ELK)
-- Supply: 1.08B * 10^6 = 1,080,000,000,000,000
UPDATE mints SET supply = '1080000000000000' WHERE id = 'B8LEBFjryfsmTEmB3wqcQCb3Sxm191BHVk9wjqDB1ELK';
UPDATE "boundingCurve" SET 
    initial_supply = '864000000000000',
    virtual_token_balance = '1082352941176470'
WHERE mint = 'B8LEBFjryfsmTEmB3wqcQCb3Sxm191BHVk9wjqDB1ELK';

-- 2. Correct the 'testy' token (ID: BRou4VFQb9BUap45eHNrksJk69suKjQoAcVKMdVeaA3F)
-- If the total supply should be 1 Billion tokens with 6 decimals = 1,000,000,000,000,000
UPDATE mints SET supply = '1000000000000000' WHERE id = 'BRou4VFQb9BUap45eHNrksJk69suKjQoAcVKMdVeaA3F';
UPDATE "boundingCurve" SET 
    initial_supply = '800000000000000',
    virtual_token_balance = (virtual_token_balance::numeric / 10000)::numeric
WHERE mint = 'BRou4VFQb9BUap45eHNrksJk69suKjQoAcVKMdVeaA3F' AND virtual_token_balance::numeric > 1000000000000000;
