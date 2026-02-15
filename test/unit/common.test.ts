import { describe, expect, it } from 'vitest';

import '../../src/node/utils.node.js';
import { extractMWBDate, extractWTStudyDate } from '../../src/common/date_parser.js';
import { extractSourceEnhanced } from '../../src/common/parsing_rules.js';

describe(`common rules`, () => {
  it('parses date with year explicitely set', () => {
    const src = 'May 4-10';
    const result = extractWTStudyDate(src, 'E', 2026);
    expect(result).toBe('2026/05/04');
  });

  it('parses date with year and month explicitely set', () => {
    const src = 'January 4-10';
    const result = extractWTStudyDate(src, 'E', 2026, 11);
    expect(result).toBe('2027/01/04');
  });
});
