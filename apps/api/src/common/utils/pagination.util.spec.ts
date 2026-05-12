import { parsePageTake } from './pagination.util';

describe('parsePageTake', () => {
  it('uses defaults when params are omitted', () => {
    expect(parsePageTake()).toEqual({ page: 0, take: 20 });
  });

  it('floors decimal page and take values', () => {
    expect(parsePageTake('2.9', '15.7')).toEqual({ page: 2, take: 15 });
  });

  it('falls back for negative and invalid values', () => {
    expect(parsePageTake('-1', 'abc')).toEqual({ page: 0, take: 20 });
    expect(parsePageTake('bad', '0')).toEqual({ page: 0, take: 20 });
  });

  it('clamps take to the configured max', () => {
    expect(parsePageTake('1', '500')).toEqual({ page: 1, take: 100 });
    expect(parsePageTake('1', '75', { defaultTake: 10, maxTake: 50 })).toEqual({
      page: 1,
      take: 50,
    });
  });

  it('uses custom default take when provided', () => {
    expect(parsePageTake(undefined, undefined, { defaultTake: 12 })).toEqual({
      page: 0,
      take: 12,
    });
  });
});
