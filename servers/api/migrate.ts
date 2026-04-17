import postgres from "postgres";
import fs from "fs";

const sql = postgres("postgresql://postgres:Wawaandava2!@172.30.96.1:5432/hashfund");

async function main() {
  const query = fs.readFileSync("./migrate.sql", "utf8");
  console.log("Applying migration...");
  await sql.unsafe(query);
  console.log("Migration applied successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
