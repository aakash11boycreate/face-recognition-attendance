const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json({ limit: '10mb' })); // To handle base64 image data
app.use(express.static('public')); // Serve static files from the 'public' folder

// Endpoint to save image
app.post('/save-image', (req, res) => {
    const { label, image } = req.body;

    // Create labeled folder if it doesn't exist
    const labelDir = path.join(__dirname, 'public/labeled_images', label);
    if (!fs.existsSync(labelDir)) {
        fs.mkdirSync(labelDir, { recursive: true });
    }

    // Save the image
    const base64Data = image.replace(/^data:image\/jpeg;base64,/, '');
    const filePath = path.join(labelDir, `${Date.now()}.jpg`);
    fs.writeFileSync(filePath, base64Data, 'base64');

    res.json({ success: true });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
