const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const app = express();

// middleware
app.use(bodyParser.json());
app.use(morgan('tiny'));

require('dotenv/config');


const API_URL = process.env.API_URL || 'http://127.0.0.1';
const API_PREFIX = process.env.API_PREFIX || '/api/v1';
const PORT = process.env.PORT || 3000;

app.get(`${API_PREFIX}/products`, (req, res) => {
    const product = {
        id: 1,
        name: 'hair dresser',
        image: 'some_url'
    };
   return res.send(product);
});

app.listen(PORT, () => {
    console.log(`Server is running ${API_URL}:${PORT}`);
});