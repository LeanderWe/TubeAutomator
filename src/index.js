const express = require('express');
const DownloadService = require('./services/downloadService');
const VideoProcessor = require('./services/videoProcessor');
const FileUtils = require('./utils/fileUtils');
const app = express();
const PORT = process.env.PORT || 3000;

const downloadService = new DownloadService();
const videoProcessor = new VideoProcessor();

app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile('index.html', { root: './public' });
});

app.post('/video/info', async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        const info = await downloadService.getVideoInfo(url);
        res.json(info);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/video/download', async (req, res) => {
    const { url, quality = 'highest' } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        const result = await downloadService.downloadVideo(url, quality);
        const stats = FileUtils.getFileStats(result.filepath);
        res.json({
            ...result,
            fileSize: stats ? stats.size : 'Unknown'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/files', (req, res) => {
    const files = FileUtils.listFiles('./downloads', '.mp4');
    const fileList = files.map(file => {
        const stats = FileUtils.getFileStats(`./downloads/${file}`);
        return {
            name: file,
            ...stats
        };
    });
    res.json(fileList);
});

app.post('/video/process', async (req, res) => {
    const { filename, operation, options = {} } = req.body;

    if (!filename || !operation) {
        return res.status(400).json({ error: 'Filename and operation are required' });
    }

    const inputPath = `./downloads/${filename}`;

    try {
        let result;
        switch (operation) {
            case 'convert':
                result = await videoProcessor.convertVideo(inputPath, options.format, options.quality);
                break;
            case 'compress':
                result = await videoProcessor.compressVideo(inputPath, options.level);
                break;
            case 'thumbnail':
                result = await videoProcessor.generateThumbnail(inputPath, options.timeOffset);
                break;
            case 'metadata':
                result = await videoProcessor.getVideoMetadata(inputPath);
                break;
            default:
                return res.status(400).json({ error: 'Invalid operation' });
        }
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/processed', (req, res) => {
    const files = FileUtils.listFiles('./processed');
    const fileList = files.map(file => {
        const stats = FileUtils.getFileStats(`./processed/${file}`);
        return {
            name: file,
            ...stats
        };
    });
    res.json(fileList);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});