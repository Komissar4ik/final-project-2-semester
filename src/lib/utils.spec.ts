import { cn, formatCount, formatRelativeTime } from './utils';

describe('utils', () => {
  describe('cn', () => {
    it('merges conflicting Tailwind classes', () => {
      expect(cn('px-2 text-sm', 'px-4')).toBe('text-sm px-4');
    });
  });

  describe('formatCount', () => {
    it.each([
      [999, '999'],
      [1_250, '1.3K'],
      [2_500_000, '2.5M'],
    ])('formats %i as %s', (value, expected) => {
      expect(formatCount(value)).toBe(expected);
    });
  });

  describe('formatRelativeTime', () => {
    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date('2026-05-18T12:00:00.000Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it.each([
      ['2026-05-18T11:59:40.000Z', 'just now'],
      ['2026-05-18T11:45:00.000Z', '15m ago'],
      ['2026-05-18T09:00:00.000Z', '3h ago'],
      ['2026-05-16T12:00:00.000Z', '2d ago'],
    ])('formats %s as %s', (value, expected) => {
      expect(formatRelativeTime(value)).toBe(expected);
    });
  });
});
