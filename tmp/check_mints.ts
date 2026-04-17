import postgres from "postgres";

async function check() {
  const sql = postgres(process.env.DATABASE_URL!);
  const mints = await sql`SELECT COUNT(*) FROM mints`;
  console.log("Mints in DB:", mints[0].count);
  process.exit(0);
}

check();
