import { initializeSchema, seedDefaultAdminUser } from "../utils/turso";

async function main() {
  await initializeSchema();
  await seedDefaultAdminUser();
  console.log("Database initialized and default admin user ensured.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
