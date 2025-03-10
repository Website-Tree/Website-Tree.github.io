const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static('.')); // Serve static files from the current directory

app.post('/upload', upload.single('rom'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const filePath = path.join(__dirname, 'uploads', req.file.filename);
    const newFilePath = path.join(__dirname, 'uploads', req.file.originalname);

    fs.rename(filePath, newFilePath, (err) => {
        if (err) {
            return res.status(500).send('Error saving file.');
        }
        res.send(`File uploaded successfully. <a href="/play.html?rom=${req.file.originalname}">Play Game</a>`);
    });
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
