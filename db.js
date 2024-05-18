import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "blog",
  password: "ZzAa00$$",
  port: 5432,
});

export default pool;

//first in branch
