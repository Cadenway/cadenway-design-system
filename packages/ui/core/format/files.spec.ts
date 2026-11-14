import { ɵextensionOf, ɵformatFileSize } from './files';

describe('ɵformatFileSize', () => {
  it('writes French binary units, whole up to kilobytes and with one decimal beyond', () => {
    expect(ɵformatFileSize(-1)).toBe('0 o');
    expect(ɵformatFileSize(512)).toBe('512 o');
    expect(ɵformatFileSize(312 * 1024)).toBe('312 Ko');
    expect(ɵformatFileSize(2.4 * 1024 * 1024)).toBe('2,4 Mo');
    expect(ɵformatFileSize(52_428_800)).toBe('50 Mo');
  });
});

describe('ɵextensionOf', () => {
  it('reads the lower-case extension, empty without one', () => {
    expect(ɵextensionOf('Rapport.PDF')).toBe('pdf');
    expect(ɵextensionOf('archive.tar.gz')).toBe('gz');
    expect(ɵextensionOf('README')).toBe('');
    expect(ɵextensionOf('.env')).toBe('');
  });
});
