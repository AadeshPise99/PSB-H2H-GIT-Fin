require('dotenv').config();
const express = require('express');
const cors = require('cors');
const psbRoutes = require('./routes/psb.routes');

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
