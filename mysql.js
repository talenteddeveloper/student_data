const mysql = require("mysql");

// Connect to database and create pool for multiple requests
const db = mysql.createPool({
    connectionLimit: 10,
    connectTimeout: 60 * 60 * 1000,
    acquireTimeout: 60 * 60 * 1000,
    timeout: 60 * 60 * 1000,
    host: process.env.DATABASE_HUST,
    port: process.env.DATABASE_PORT,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE,
    multipleStatements: true
});

module.exports = db;
