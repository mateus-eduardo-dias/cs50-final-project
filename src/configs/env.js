import dotenv from "dotenv"
dotenv.config()

export default {
    DB_CONNSTR: process.env.DB_CONNSTR,
    REFTKN_KEY: process.env.REFTKN_KEY, // Refresh Token Key
    JWT_KEY: process.env.JWT_KEY, // Json Web Token Key
}