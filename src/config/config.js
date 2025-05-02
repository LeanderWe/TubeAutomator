const fs = require('fs');
const path = require('path');

class Config {
    constructor() {
        this.configPath = path.join(process.cwd(), 'config.json');
        this.config = this.loadConfig();
    }

    loadConfig() {
        try {
            if (fs.existsSync(this.configPath)) {
                const configFile = fs.readFileSync(this.configPath, 'utf8');
                return JSON.parse(configFile);
            }
        } catch (error) {
            console.warn('Failed to load config file, using defaults:', error.message);
        }

        return this.getDefaultConfig();
    }

    getDefaultConfig() {
        return {
            server: {
                port: process.env.PORT || 3000,
                host: process.env.HOST || 'localhost'
            },
            downloads: {
                directory: 'downloads',
                maxFileSize: '1GB',
                allowedFormats: ['mp4', 'webm', 'flv'],
                defaultQuality: 'highest'
            },
            processing: {
                outputDirectory: 'processed',
                tempDirectory: 'temp',
                ffmpegPath: 'ffmpeg',
                compressionPresets: {
                    low: { crf: 30, preset: 'fast' },
                    medium: { crf: 25, preset: 'medium' },
                    high: { crf: 20, preset: 'slow' }
                }
            },
            scheduler: {
                maxConcurrentTasks: 3,
                cleanupSchedule: '0 2 * * *',
                retentionDays: 30
            },
            api: {
                rateLimit: {
                    windowMs: 900000,
                    max: 100
                },
                corsEnabled: true
            }
        };
    }

    get(key) {
        return this.getNestedValue(this.config, key);
    }

    set(key, value) {
        this.setNestedValue(this.config, key, value);
        this.saveConfig();
    }

    getNestedValue(obj, key) {
        return key.split('.').reduce((o, k) => o && o[k], obj);
    }

    setNestedValue(obj, key, value) {
        const keys = key.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((o, k) => o[k] = o[k] || {}, obj);
        target[lastKey] = value;
    }

    saveConfig() {
        try {
            fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
        } catch (error) {
            console.error('Failed to save config:', error.message);
        }
    }

    reload() {
        this.config = this.loadConfig();
    }
}

module.exports = new Config();