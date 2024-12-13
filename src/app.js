const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const userRoutes = require('./routes/userRoute');


dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

app.get('/', (req, res) => {
    res.send('Authentication System is Running');
});

module.exports = app;
