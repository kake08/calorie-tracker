// Local stand-in for Postgres during development: an embedded PGlite database served on
// localhost so the app connects to it exactly as it would to Neon. Data lives in .pglite/.
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";

const port = Number(process.env.LOCAL_DB_PORT || 5433);
const db = await PGlite.create("./.pglite");
const server = new PGLiteSocketServer({ db, port, host: "127.0.0.1", maxConnections: 10 });
await server.start();
console.log(`Local database ready: postgresql://postgres:postgres@127.0.0.1:${port}/postgres`);

async function stop() {
  await server.stop();
  await db.close();
  process.exit(0);
}
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
