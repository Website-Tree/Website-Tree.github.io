const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Initialize the app
const app = express();
const port = 3000;

// Set up the storage configuration for Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir); // Save to the uploads folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Create a unique filename
  }
});

// File type validation function (only allow .z64, .n64, .gba)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.z64', '.n64', '.gba'];
  const fileExt = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(fileExt)) {
    cb(null, true); // Accept the file
  } else {
    cb(new Error('Invalid file type. Only .z64, .n64, and .gba are allowed.'));
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

// Serve the HTML file (Frontend)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle file upload
app.post('/upload', upload.single('romFile'), (req, res) => {
  if (!req.file) {
    return res.json({ success: false, error: 'No file uploaded' });
  }

  const fileUrl = `http://localhost:${port}/uploads/${req.file.filename}`;
  res.json({ success: true, fileUrl: fileUrl });
});

// Serve the uploaded files
app.use('/uploads', express.static('uploads'));

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
