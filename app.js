require('dotenv').config();
const express = require('express');
const { swaggerUi, swaggerDocs } = require('./docs/swagger');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const accountRoutes = require('./routes/accountRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.use('/docs-api', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use('/api/auth', authRoutes);
app.use('/api', userRoutes);
app.use('/api', accountRoutes);
app.use('/api', transactionRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ error: 'Terjadi kesalahan pada server!' });
});

module.exports = app;
