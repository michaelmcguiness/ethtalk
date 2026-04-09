// No seeding needed — the forum is a single feed with optional tags.
// Tags (PROTOCOL, DEFI, L2S, DEV, GENERAL) are defined as an enum in the schema.

async function main() {
  console.log("No seed data needed for single-feed forum.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
