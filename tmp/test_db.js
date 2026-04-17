const { Client } = require('pg');

const connectionString = "postgresql://postgres:Wawaandava2!@172.30.96.1:5432/hashfund";

async function test() {
  const client = new Client({
    connectionString: connectionString,
  });
  try {
    await client.connect();
    console.log("SUCCESS: Connected to database.");
    const res = await client.query('SELECT current_database()');
    console.log("Current Database:", res.rows[0].current_database);
    await client.end();
  } catch (err) {
    console.error("FAILURE: Could not connect to database.", err.message);
    process.exit(1);
  }
}

test();
