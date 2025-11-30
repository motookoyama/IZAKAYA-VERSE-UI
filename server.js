import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
