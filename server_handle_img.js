const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

app.post('/submit', upload.single('imageUpload'), (req, res) => {
    const formData = req.body;
    const file = req.file;

    console.log('Form data:', formData);
    console.log('Uploaded file:', file);

    // Save form data and file information as needed

    res.send('Form submitted successfully!');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
