const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.send('TubeAutomator - YouTube Video Automation Tool');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});