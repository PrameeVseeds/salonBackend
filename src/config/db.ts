import mysql from "mysql2/promise";

const DEFAULT_DB_PORT = 3306;
const DEFAULT_CONNECTION_LIMIT = 10;

const {DB_HOST,DB_PORT,DB_USER,DB_PASSWORD,DB_NAME,} = process.env;

if (!DB_HOST ||!DB_USER || !DB_NAME || DB_PASSWORD === undefined) {
  throw new Error(
    "Database configuration is incomplete. Please check your .env file."
  );
}

export const pool = mysql.createPool({
  host: DB_HOST,
  port: Number(DB_PORT) || DEFAULT_DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: DEFAULT_CONNECTION_LIMIT,
  queueLimit: 0,
});

export async function testDatabaseConnection(): Promise<void> {
  let connection: mysql.PoolConnection | undefined;

  try {
    connection = await pool.getConnection();

    await connection.ping();

    console.log("Database connected successfully!");
  } catch (error) {
    console.error("Failed to connect to database.");

    if (error instanceof Error) {
      console.error(error.message);
    }

    throw error;
  } finally {
    connection?.release();
  }
}

console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_NAME:", process.env.DB_NAME);
console.log("DB_PASSWORD length:", process.env.DB_PASSWORD?.length);