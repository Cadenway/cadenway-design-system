import { ɵextensionOf, ɵformatFileSize, ɵformatFileSizeIn } from './files';

describe('ɵformatFileSize', () => {
  it('writes French binary units, whole up to kilobytes and with one decimal beyond', () => {
    expect(ɵformatFileSize(-1)).toBe('0 o');
    expect(ɵformatFileSize(512)).toBe('512 o');
    expect(ɵformatFileSize(312 * 1024)).toBe('312 Ko');
    expect(ɵformatFileSize(2.4 * 1024 * 1024)).toBe('2,4 Mo');
    expect(ɵformatFileSize(52_428_800)).toBe('50 Mo');
  });
});

describe('ɵformatFileSizeIn', () => {
  it('writes the French units in any French locale', () => {
    expect(ɵformatFileSizeIn(2.4 * 1024 * 1024, 'fr-FR')).toBe('2,4 Mo');
    expect(ɵformatFileSizeIn(312 * 1024, 'fr-CA')).toBe('312 Ko');
  });

  it('writes byte units and the number conventions of another locale', () => {
    expect(ɵformatFileSizeIn(-1, 'en-US')).toBe('0 B');
    expect(ɵformatFileSizeIn(312 * 1024, 'en-US')).toBe('312 KB');
    expect(ɵformatFileSizeIn(2.4 * 1024 * 1024, 'en-US')).toBe('2.4 MB');
    expect(ɵformatFileSizeIn(2.4 * 1024 * 1024 * 1024, 'de-DE')).toBe('2,4 GB');
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
