import postgres from "postgres";

async function wipe() {
  const sql = postgres("postgresql://postgres:Wawaandava2!@192.168.0.137:5432/hashfund");
  
  console.log("Wiping database...");
  
  try {
    // Truncate all tables in the public schema
    await sql.unsafe(`
      TRUNCATE TABLE mints CASCADE;
      TRUNCATE TABLE "boundingCurve" CASCADE;
      TRUNCATE TABLE swaps CASCADE;
      TRUNCATE TABLE "userPositions" CASCADE;
      TRUNCATE TABLE users CASCADE;
    `);
    console.log("Database wiped successfully.");
  } catch (err) {
    console.error("Failed to wipe database:", err);
  } finally {
    await sql.end();
  }
}

wipe();
