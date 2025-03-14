/*
Install Node.js from nodejs.org.
Create a new directory for your project and navigate to it in your terminal.
Run npm init -y to create a package.json file.
Install dependencies:
    npm install express.
    npm install csv-writer
    npm install body-parser
Run the server
    node server.js
Open your browser.
Go to http://localhost:3000.
*/

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const app = express();
const port = 3000;

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (your HTML form)
app.use(express.static(path.join(__dirname, 'public')));

// Set up CSV writer
const csvFilePath = path.join(__dirname, 'form-data.csv');
const csvWriter = createCsvWriter({
    path: csvFilePath,
    header: [
        { id: 'location', title: 'Location' },
        { id: 'datetime', title: 'Date and Time' },
        { id: 'question1', title: 'Question 1' },
        { id: 'question2', title: 'Question 2' },
    ],
    append: true, // Append new rows to the CSV file
});

// Handle form submission
app.post('/submit', (req, res) => {
    const formData = req.body;
    console.log(formData);
    // Save the form data to a database or file here
    // Write form data to CSV
    csvWriter.writeRecords([formData])
        .then(() => {
            console.log('Form data saved to CSV.');
            res.send('Form data received and saved.');
        })
        .catch(error => {
            console.error('Error writing to CSV:', error);
            res.status(500).send('Error saving form data.');
        });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
