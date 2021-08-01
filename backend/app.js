const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');

require('dotenv/config');
const app = express();

// env
const PORT = process.env.PORT || 3005;
const HOST = process.env.HOST || 'http://localhost';
const MONGO_URL = process.env.MONGO_URL;
const DB_NAME = process.env.DB_NAME;
const API = process.env.API_PREFIX || '/api/v1';

// routes
const categoriesRoutes = require('./routes/categories');
const productsRoutes = require('./routes/products');
const usersRoutes = require('./routes/users');
const ordersRoutes = require('./routes/orders');

// middlewares
const { authJwt } = require('./middleware/auth');
const { errorHandler } = require('./middleware/error');

app.use(express.json());
app.use(morgan('tiny'));
app.use(authJwt());
app.use('/public/uploads', express.static(__dirname + '/public/uploads'));
app.use(errorHandler);

// cors
app.use(cors());
app.options('*', cors())

// routes middlewares
app.use(`${API}/products`, productsRoutes);
app.use(`${API}/categories`, categoriesRoutes);
app.use(`${API}/users`, usersRoutes);
app.use(`${API}/orders`, ordersRoutes);

mongoose.connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: DB_NAME
}).then(() => {
    console.log('DB Connection is ready...')

    app.listen(PORT, () => {
        console.log(`Server is running ${HOST}:${PORT}`);
    });
}).catch(err => {
    console.log(err);
});
