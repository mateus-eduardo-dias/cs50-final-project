import { Pool } from "pg"
import env from "./env.js"

const pool = new Pool({'connectionString': env.DB_CONNSTR})

console.log("Database on")

export default pool