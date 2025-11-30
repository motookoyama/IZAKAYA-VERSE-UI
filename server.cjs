const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 1398;

// Serve static files from the 'docs' directory
app.use(express.static(path.join(__dirname, 'docs')));

// Handle SPA routing: return index.html for all non-static requests
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'docs', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`IZAKAYA verse running on port ${PORT}`);
});
