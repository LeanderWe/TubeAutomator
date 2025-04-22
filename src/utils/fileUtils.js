const fs = require('fs');
const path = require('path');

class FileUtils {
    static formatFileSize(bytes) {
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Bytes';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }

    static getFileStats(filepath) {
        try {
            const stats = fs.statSync(filepath);
            return {
                size: this.formatFileSize(stats.size),
                created: stats.birthtime,
                modified: stats.mtime,
                isFile: stats.isFile(),
                isDirectory: stats.isDirectory()
            };
        } catch (error) {
            return null;
        }
    }

    static deleteFile(filepath) {
        try {
            fs.unlinkSync(filepath);
            return true;
        } catch (error) {
            return false;
        }
    }

    static listFiles(directory, extension = null) {
        try {
            const files = fs.readdirSync(directory);
            if (extension) {
                return files.filter(file => file.endsWith(extension));
            }
            return files;
        } catch (error) {
            return [];
        }
    }

    static ensureDirectory(dirPath) {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    }
}

module.exports = FileUtils;