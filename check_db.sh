#!/bin/bash
echo "SELECT address, name, symbol FROM mint WHERE name ILIKE '%Testing%';" > /tmp/check_mint.sql
psql postgresql://postgres:Wawaandava2!@10.255.255.254:5432/hashfund -f /tmp/check_mint.sql
