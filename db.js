import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

let pool;

if (process.env.DATABASE_URL) {
  // If DATABASE_URL is available (i.e., on Heroku), use it for connection
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // Required for Heroku PostgreSQL
  });
} else {
  // If DATABASE_URL is not available (i.e., on local machine), use environment variables
  pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
  });
}

export default pool;
