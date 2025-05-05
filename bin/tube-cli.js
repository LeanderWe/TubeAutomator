#!/usr/bin/env node

const { Command } = require('commander');
const DownloadService = require('../src/services/downloadService');
const VideoProcessor = require('../src/services/videoProcessor');
const TaskScheduler = require('../src/services/taskScheduler');
const FileUtils = require('../src/utils/fileUtils');
const logger = require('../src/utils/logger');
const config = require('../src/config/config');

const program = new Command();
const downloadService = new DownloadService();
const videoProcessor = new VideoProcessor();
const taskScheduler = new TaskScheduler();

program
    .name('tube-automator')
    .description('YouTube video automation CLI')
    .version('1.0.0');

program
    .command('download <url>')
    .description('Download a video from YouTube')
    .option('-q, --quality <quality>', 'video quality', 'highest')
    .action(async (url, options) => {
        try {
            logger.info('Starting download', { url, quality: options.quality });
            const result = await downloadService.downloadVideo(url, options.quality);
            console.log(`✅ Downloaded: ${result.filename}`);
            logger.info('Download completed', { filename: result.filename });
        } catch (error) {
            console.error(`❌ Download failed: ${error.message}`);
            logger.error('Download failed', { url, error: error.message });
        }
    });

program
    .command('info <url>')
    .description('Get video information')
    .action(async (url) => {
        try {
            const info = await downloadService.getVideoInfo(url);
            console.log('\n📺 Video Information:');
            console.log(`Title: ${info.title}`);
            console.log(`Author: ${info.author}`);
            console.log(`Duration: ${Math.floor(info.duration / 60)}:${(info.duration % 60).toString().padStart(2, '0')}`);
            console.log(`Views: ${info.viewCount?.toLocaleString() || 'N/A'}`);
        } catch (error) {
            console.error(`❌ Failed to get info: ${error.message}`);
            logger.error('Info retrieval failed', { url, error: error.message });
        }
    });

program
    .command('process <filename>')
    .description('Process a downloaded video')
    .option('-o, --operation <op>', 'operation type (convert|compress|thumbnail)', 'convert')
    .option('-f, --format <format>', 'output format for conversion', 'mp4')
    .option('-l, --level <level>', 'compression level (low|medium|high)', 'medium')
    .action(async (filename, options) => {
        try {
            const inputPath = `./downloads/${filename}`;
            let result;

            switch (options.operation) {
                case 'convert':
                    result = await videoProcessor.convertVideo(inputPath, options.format);
                    break;
                case 'compress':
                    result = await videoProcessor.compressVideo(inputPath, options.level);
                    break;
                case 'thumbnail':
                    result = await videoProcessor.generateThumbnail(inputPath);
                    break;
                default:
                    throw new Error('Invalid operation');
            }

            console.log(`✅ Processing completed: ${result.filename}`);
        } catch (error) {
            console.error(`❌ Processing failed: ${error.message}`);
            logger.error('Processing failed', { filename, error: error.message });
        }
    });

program
    .command('list')
    .description('List downloaded files')
    .action(() => {
        const files = FileUtils.listFiles('./downloads', '.mp4');
        if (files.length === 0) {
            console.log('No downloaded files found.');
            return;
        }

        console.log('\n📁 Downloaded Files:');
        files.forEach(file => {
            const stats = FileUtils.getFileStats(`./downloads/${file}`);
            console.log(`  ${file} (${stats?.size || 'Unknown size'})`);
        });
    });

program
    .command('schedule <url> <cron>')
    .description('Schedule a download task')
    .option('-q, --quality <quality>', 'video quality', 'highest')
    .action(async (url, cronPattern, options) => {
        try {
            const taskId = taskScheduler.scheduleDownload(url, cronPattern, { quality: options.quality });
            taskScheduler.startTask(taskId);
            console.log(`✅ Task scheduled with ID: ${taskId}`);
            console.log(`Schedule: ${cronPattern}`);
            logger.info('Task scheduled', { taskId, url, schedule: cronPattern });
        } catch (error) {
            console.error(`❌ Scheduling failed: ${error.message}`);
            logger.error('Scheduling failed', { url, error: error.message });
        }
    });

program
    .command('tasks')
    .description('List scheduled tasks')
    .action(() => {
        const tasks = taskScheduler.getAllTasks();
        if (tasks.length === 0) {
            console.log('No scheduled tasks found.');
            return;
        }

        console.log('\n⏰ Scheduled Tasks:');
        tasks.forEach(task => {
            console.log(`  ID: ${task.id} | Status: ${task.status} | Schedule: ${task.schedule}`);
            console.log(`     URL: ${task.url}`);
            console.log('');
        });
    });

program.parse();