const FileUtils = require('../src/utils/fileUtils');
const fs = require('fs');
const path = require('path');

describe('FileUtils', () => {
    const testDir = path.join(__dirname, 'test-files');
    const testFile = path.join(testDir, 'test.txt');

    beforeAll(() => {
        if (!fs.existsSync(testDir)) {
            fs.mkdirSync(testDir, { recursive: true });
        }
        fs.writeFileSync(testFile, 'test content');
    });

    afterAll(() => {
        if (fs.existsSync(testFile)) {
            fs.unlinkSync(testFile);
        }
        if (fs.existsSync(testDir)) {
            fs.rmdirSync(testDir);
        }
    });

    test('formatFileSize should format bytes correctly', () => {
        expect(FileUtils.formatFileSize(0)).toBe('0 Bytes');
        expect(FileUtils.formatFileSize(1024)).toBe('1 KB');
        expect(FileUtils.formatFileSize(1048576)).toBe('1 MB');
        expect(FileUtils.formatFileSize(1073741824)).toBe('1 GB');
    });

    test('getFileStats should return file stats', () => {
        const stats = FileUtils.getFileStats(testFile);
        expect(stats).not.toBeNull();
        expect(stats.isFile).toBe(true);
        expect(stats.size).toContain('Bytes');
    });

    test('getFileStats should return null for non-existent file', () => {
        const stats = FileUtils.getFileStats('non-existent.txt');
        expect(stats).toBeNull();
    });

    test('listFiles should return file list', () => {
        const files = FileUtils.listFiles(testDir);
        expect(files).toContain('test.txt');
    });

    test('listFiles should filter by extension', () => {
        const txtFiles = FileUtils.listFiles(testDir, '.txt');
        expect(txtFiles).toContain('test.txt');

        const jsFiles = FileUtils.listFiles(testDir, '.js');
        expect(jsFiles).not.toContain('test.txt');
    });

    test('ensureDirectory should create directory if not exists', () => {
        const newDir = path.join(testDir, 'new-dir');
        FileUtils.ensureDirectory(newDir);
        expect(fs.existsSync(newDir)).toBe(true);

        fs.rmdirSync(newDir);
    });
});