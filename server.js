const express = require('express');
const fs = require('fs');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('.'));

// API للحصول على الأسئلة
app.get('/api/questions', (req, res) => {
    fs.readFile('questions.json', 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Error reading questions');
            return;
        }
        res.json(JSON.parse(data));
    });
});

// API لحفظ الأسئلة
app.post('/api/questions', (req, res) => {
    fs.writeFile('questions.json', JSON.stringify(req.body, null, 2), (err) => {
        if (err) {
            res.status(500).send('Error saving questions');
            return;
        }
        res.send('Questions saved successfully');
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});