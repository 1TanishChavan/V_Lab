import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./../../src/models/schema";
import "dotenv/config";

// --- THIS IS THE FIX ---

// 1. Get all your variables
const {
    MYSQL_HOST,
    MYSQL_USER,
    MYSQL_PASSWORD,
    MYSQL_DATABASE,
    MYSQL_PORT,
} = process.env;

// 2. Validate them at runtime
if (
    !MYSQL_HOST ||
    !MYSQL_USER ||
    !MYSQL_PASSWORD ||
    !MYSQL_DATABASE ||
    !MYSQL_PORT
) {
    throw new Error("One or more required environment variables are missing");
}

// 3. Handle the port (it needs to be a number)
const port = parseInt(MYSQL_PORT, 10);
if (isNaN(port)) {
    throw new Error("Invalid MYSQL_PORT: Must be a number.");
}

// --- End of Fix ---

// Now, all variables are guaranteed to be strings (or a number for port)
export const poolConnection = mysql.createPool({
    host: MYSQL_HOST,
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    database: MYSQL_DATABASE,
    port: port, // Use the validated, parsed port

    connectionLimit: 1,
    // ssl: {
    //     rejectUnauthorized: true,
    // },
});

// @ts-ignore
export const db = drizzle(poolConnection, { schema, mode: "default" });