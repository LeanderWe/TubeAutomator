const ytdl = require('ytdl-core');
const fs = require('fs');
const path = require('path');

class DownloadService {
    constructor() {
        this.downloadDir = path.join(process.cwd(), 'downloads');
        this.ensureDownloadDir();
    }

    ensureDownloadDir() {
        if (!fs.existsSync(this.downloadDir)) {
            fs.mkdirSync(this.downloadDir, { recursive: true });
        }
    }

    async getVideoInfo(url) {
        try {
            const info = await ytdl.getInfo(url);
            return {
                title: info.videoDetails.title,
                duration: info.videoDetails.lengthSeconds,
                author: info.videoDetails.author.name,
                viewCount: info.videoDetails.viewCount,
                uploadDate: info.videoDetails.uploadDate
            };
        } catch (error) {
            throw new Error('Failed to fetch video info');
        }
    }

    async downloadVideo(url, quality = 'highest') {
        try {
            const info = await ytdl.getInfo(url);
            const title = this.sanitizeFilename(info.videoDetails.title);
            const filename = `${title}.mp4`;
            const filepath = path.join(this.downloadDir, filename);

            return new Promise((resolve, reject) => {
                const stream = ytdl(url, { quality });
                const writeStream = fs.createWriteStream(filepath);

                stream.pipe(writeStream);

                writeStream.on('finish', () => {
                    resolve({ filepath, filename, title });
                });

                writeStream.on('error', (error) => {
                    reject(error);
                });
            });
        } catch (error) {
            throw new Error('Download failed');
        }
    }

    sanitizeFilename(filename) {
        return filename.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    }
}

module.exports = DownloadService;