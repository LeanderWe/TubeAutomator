const config = require('../src/config/config');

describe('Config', () => {
    test('should load default configuration', () => {
        expect(config.get('server.port')).toBeDefined();
        expect(config.get('downloads.directory')).toBe('downloads');
        expect(config.get('processing.outputDirectory')).toBe('processed');
    });

    test('should get nested configuration values', () => {
        expect(config.get('downloads.defaultQuality')).toBe('highest');
        expect(config.get('api.corsEnabled')).toBe(true);
    });

    test('should handle invalid keys gracefully', () => {
        expect(config.get('invalid.key')).toBeUndefined();
        expect(config.get('server.invalid')).toBeUndefined();
    });

    test('should set and get configuration values', () => {
        config.set('test.value', 'test123');
        expect(config.get('test.value')).toBe('test123');
    });
});