const winston = require('winston');
const path = require('path');
const config = require('../config/config');

class Logger {
    constructor() {
        this.logDir = path.join(process.cwd(), 'logs');
        this.ensureLogDir();
        this.logger = this.createLogger();
    }

    ensureLogDir() {
        const fs = require('fs');
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    createLogger() {
        const logFormat = winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.errors({ stack: true }),
            winston.format.json()
        );

        const consoleFormat = winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.printf(({ timestamp, level, message, stack }) => {
                return `${timestamp} [${level}]: ${stack || message}`;
            })
        );

        return winston.createLogger({
            level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
            format: logFormat,
            transports: [
                new winston.transports.Console({
                    format: consoleFormat
                }),
                new winston.transports.File({
                    filename: path.join(this.logDir, 'error.log'),
                    level: 'error',
                    maxsize: 5242880,
                    maxFiles: 3
                }),
                new winston.transports.File({
                    filename: path.join(this.logDir, 'combined.log'),
                    maxsize: 5242880,
                    maxFiles: 5
                })
            ]
        });
    }

    info(message, meta = {}) {
        this.logger.info(message, meta);
    }

    error(message, meta = {}) {
        this.logger.error(message, meta);
    }

    warn(message, meta = {}) {
        this.logger.warn(message, meta);
    }

    debug(message, meta = {}) {
        this.logger.debug(message, meta);
    }

    http(req, res, next) {
        const start = Date.now();

        res.on('finish', () => {
            const duration = Date.now() - start;
            this.logger.info('HTTP Request', {
                method: req.method,
                url: req.url,
                status: res.statusCode,
                duration: `${duration}ms`,
                userAgent: req.get('User-Agent'),
                ip: req.ip || req.connection.remoteAddress
            });
        });

        next();
    }
}

module.exports = new Logger();