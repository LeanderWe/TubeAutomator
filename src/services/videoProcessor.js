const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

class VideoProcessor {
    constructor() {
        this.outputDir = path.join(process.cwd(), 'processed');
        this.ensureOutputDir();
    }

    ensureOutputDir() {
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }
    }

    async convertVideo(inputPath, outputFormat = 'mp4', quality = 'medium') {
        const filename = path.basename(inputPath, path.extname(inputPath));
        const outputPath = path.join(this.outputDir, `${filename}_converted.${outputFormat}`);

        return new Promise((resolve, reject) => {
            let command = ffmpeg(inputPath);

            switch (quality) {
                case 'high':
                    command = command.videoBitrate('2000k');
                    break;
                case 'low':
                    command = command.videoBitrate('500k');
                    break;
                default:
                    command = command.videoBitrate('1000k');
            }

            command
                .output(outputPath)
                .on('end', () => {
                    resolve({
                        success: true,
                        outputPath,
                        filename: path.basename(outputPath)
                    });
                })
                .on('error', (err) => {
                    reject(new Error(`Conversion failed: ${err.message}`));
                })
                .run();
        });
    }

    async generateThumbnail(inputPath, timeOffset = '00:00:05') {
        const filename = path.basename(inputPath, path.extname(inputPath));
        const outputPath = path.join(this.outputDir, `${filename}_thumb.jpg`);

        return new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .seekInput(timeOffset)
                .frames(1)
                .output(outputPath)
                .on('end', () => {
                    resolve({
                        success: true,
                        thumbnailPath: outputPath,
                        filename: path.basename(outputPath)
                    });
                })
                .on('error', (err) => {
                    reject(new Error(`Thumbnail generation failed: ${err.message}`));
                })
                .run();
        });
    }

    async getVideoMetadata(inputPath) {
        return new Promise((resolve, reject) => {
            ffmpeg.ffprobe(inputPath, (err, metadata) => {
                if (err) {
                    reject(new Error(`Failed to read metadata: ${err.message}`));
                    return;
                }

                const videoStream = metadata.streams.find(stream => stream.codec_type === 'video');
                const audioStream = metadata.streams.find(stream => stream.codec_type === 'audio');

                resolve({
                    duration: metadata.format.duration,
                    size: metadata.format.size,
                    bitrate: metadata.format.bit_rate,
                    video: videoStream ? {
                        codec: videoStream.codec_name,
                        width: videoStream.width,
                        height: videoStream.height,
                        fps: eval(videoStream.r_frame_rate)
                    } : null,
                    audio: audioStream ? {
                        codec: audioStream.codec_name,
                        channels: audioStream.channels,
                        sampleRate: audioStream.sample_rate
                    } : null
                });
            });
        });
    }

    async compressVideo(inputPath, compressionLevel = 'medium') {
        const filename = path.basename(inputPath, path.extname(inputPath));
        const outputPath = path.join(this.outputDir, `${filename}_compressed.mp4`);

        const compressionSettings = {
            'low': { crf: 30, preset: 'fast' },
            'medium': { crf: 25, preset: 'medium' },
            'high': { crf: 20, preset: 'slow' }
        };

        const settings = compressionSettings[compressionLevel] || compressionSettings.medium;

        return new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .videoCodec('libx264')
                .audioCodec('aac')
                .addOption('-crf', settings.crf)
                .addOption('-preset', settings.preset)
                .output(outputPath)
                .on('progress', (progress) => {
                    console.log(`Compression progress: ${progress.percent}%`);
                })
                .on('end', () => {
                    resolve({
                        success: true,
                        outputPath,
                        filename: path.basename(outputPath)
                    });
                })
                .on('error', (err) => {
                    reject(new Error(`Compression failed: ${err.message}`));
                })
                .run();
        });
    }
}

module.exports = VideoProcessor;