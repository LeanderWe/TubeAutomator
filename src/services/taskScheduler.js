const cron = require('node-cron');
const DownloadService = require('./downloadService');
const FileUtils = require('../utils/fileUtils');

class TaskScheduler {
    constructor() {
        this.downloadService = new DownloadService();
        this.tasks = new Map();
        this.taskCounter = 0;
    }

    scheduleDownload(url, schedule, options = {}) {
        const taskId = ++this.taskCounter;

        if (!cron.validate(schedule)) {
            throw new Error('Invalid cron schedule format');
        }

        const task = cron.schedule(schedule, async () => {
            try {
                console.log(`Running scheduled download task ${taskId} for: ${url}`);
                await this.downloadService.downloadVideo(url, options.quality);
                console.log(`Task ${taskId} completed successfully`);
            } catch (error) {
                console.error(`Task ${taskId} failed:`, error.message);
            }
        }, {
            scheduled: false
        });

        this.tasks.set(taskId, {
            id: taskId,
            url,
            schedule,
            options,
            task,
            status: 'stopped',
            created: new Date(),
            lastRun: null
        });

        return taskId;
    }

    startTask(taskId) {
        const taskInfo = this.tasks.get(taskId);
        if (!taskInfo) {
            throw new Error('Task not found');
        }

        taskInfo.task.start();
        taskInfo.status = 'running';
        return true;
    }

    stopTask(taskId) {
        const taskInfo = this.tasks.get(taskId);
        if (!taskInfo) {
            throw new Error('Task not found');
        }

        taskInfo.task.stop();
        taskInfo.status = 'stopped';
        return true;
    }

    deleteTask(taskId) {
        const taskInfo = this.tasks.get(taskId);
        if (!taskInfo) {
            throw new Error('Task not found');
        }

        taskInfo.task.destroy();
        this.tasks.delete(taskId);
        return true;
    }

    getAllTasks() {
        const taskList = [];
        for (const [id, taskInfo] of this.tasks) {
            taskList.push({
                id: taskInfo.id,
                url: taskInfo.url,
                schedule: taskInfo.schedule,
                status: taskInfo.status,
                created: taskInfo.created,
                lastRun: taskInfo.lastRun,
                options: taskInfo.options
            });
        }
        return taskList;
    }

    getTaskStatus(taskId) {
        const taskInfo = this.tasks.get(taskId);
        if (!taskInfo) {
            throw new Error('Task not found');
        }

        return {
            id: taskInfo.id,
            url: taskInfo.url,
            schedule: taskInfo.schedule,
            status: taskInfo.status,
            created: taskInfo.created,
            lastRun: taskInfo.lastRun
        };
    }

    scheduleCleanup(schedule = '0 2 * * *') {
        return cron.schedule(schedule, () => {
            console.log('Running cleanup task...');
            this.cleanupOldFiles();
        });
    }

    cleanupOldFiles(daysOld = 30) {
        const files = FileUtils.listFiles('./downloads');
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);

        let deletedCount = 0;
        files.forEach(file => {
            const stats = FileUtils.getFileStats(`./downloads/${file}`);
            if (stats && stats.created < cutoffDate) {
                if (FileUtils.deleteFile(`./downloads/${file}`)) {
                    deletedCount++;
                }
            }
        });

        console.log(`Cleanup completed. Deleted ${deletedCount} old files.`);
        return deletedCount;
    }
}

module.exports = TaskScheduler;