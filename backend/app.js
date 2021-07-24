const express = require('express');

const app = express();

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
   return res.send("API works...");
});

app.listen(PORT, () => {
    console.log(`Server is running http://localhost:${PORT}`);
});