const express = require('express')
const app = express()
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { dbConnect } = require('./utils/db');

require('dotenv').config();

app.use(cors({
    origin: ['http://localhost:3000'],
    credentials: true
}));

app.use(bodyParser.json());

app.use(cookieParser());

app.use('/api', require('./routes/authRoutes'));
app.use('/api', require('./routes/dashboard/categoryRoutes'));
app.use('/api', require('./routes/dashboard/productRoutes'));
app.use('/api', require('./routes/dashboard/sellerRoutes'));

app.get('/', (req, res) => res.send('Hello from SkyPearl E-commerce server!'))
const port = process.env.PORT
dbConnect()
app.listen(port, () => console.log(`server is running on port ${port}!`))