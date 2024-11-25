const express = require('express');
const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();
require('./bot/bot'); // This will load and start the bot

const app = express();
app.use(express.json());

// const db = mysql.createConnection({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
// });

// db.connect(err => {
//     if (err) throw err;
//     console.log('MySQL connected...');
// });

app.listen(5000, () => {
    console.log('Server running on port 5000');
});
