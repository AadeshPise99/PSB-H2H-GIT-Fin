const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');
const psbRoutes = require('./routes/psb.routes');

// Debug: Log if .env is loaded correctly
console.log('Environment loaded:', {
    API_BASE_URL: process.env.API_BASE_URL ? '✓ Set' : '✗ Missing',
    MYSQL_HOST: process.env.MYSQL_HOST ? '✓ Set' : '✗ Missing',
    MONGO_URI: process.env.MONGO_URI ? '✓ Set' : '✗ Missing',
    SFTP_HOST: process.env.SFTP_HOST ? '✓ Set' : '✗ Missing'
});

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api', psbRoutes);

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'Backend is running' });
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

module.exports = app;
