const express = require('express');

require('dotenv/config');

const app = express();

const API_URL = process.env.API_URL || 'http://127.0.0.1';
const API_PREFIX = process.env.API_PREFIX || '/api/v1';
const PORT = process.env.PORT || 3000;

app.get(`${API_PREFIX}/`, (req, res) => {
   return res.send("API works...");
});

app.listen(PORT, () => {
    console.log(`Server is running ${API_URL}:${PORT}`);
});