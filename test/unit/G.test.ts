import { describe, expect, it } from 'vitest';

import '../../src/node/utils.node.js';
import { extractMWBDate, extractWTStudyDate } from '../../src/common/date_parser.js';
import { extractSourceEnhanced } from '../../src/common/parsing_rules.js';

const CODE = 'G';

describe(`[${CODE}] rules`, () => {
  const language = meeting_schedules_parser.languages[CODE];

  it('has language locale data', () => {
    expect(language).toBeTruthy();
  });

  describe('source parsing', () => {
    it('parses text without src', () => {
      const result = extractSourceEnhanced('1. Πώς να “Συναγωνιστείτε με Άλογα” (10 λεπτά)', CODE);

      expect(result.fulltitle).toBe('1. Πώς να “Συναγωνιστείτε με Άλογα”');
      expect(result.type).toBe('Πώς να “Συναγωνιστείτε με Άλογα”');
      expect(result.src).toBeUndefined();
      expect(result.time).toBe(10);
    });

    it('parses text with src', () => {
      const result = extractSourceEnhanced(
        '6. Ομιλία (5 λεπτά) lmd παράρτημα Α σημείο 17 —Θέμα: Ο Ιησούς Ήταν ένας Εξαιρετικός Δάσκαλος και οι Συμβουλές του Είναι Πάντα Αποτελεσματικές. (th μελέτη 14)',
        CODE,
      );

      expect(result.fulltitle).toBe('6. Ομιλία');
      expect(result.type).toBe('Ομιλία');
      expect(result.src).toBe(
        'lmd παράρτημα Α σημείο 17 —Θέμα: Ο Ιησούς Ήταν ένας Εξαιρετικός Δάσκαλος και οι Συμβουλές του Είναι Πάντα Αποτελεσματικές. (th μελέτη 14)',
      );
      expect(result.time).toBe(5);
    });
  });

  describe('MWB date parsing', () => {
    it.each([
      ['5-11 ΙΑΝΟΥΑΡΙΟΥ', 2026, '2026/01/05'],
      ['2-8 ΦΕΒΡΟΥΑΡΙΟΥ', 2026, '2026/02/02'],
      ['2-8 ΜΑΡΤΙΟΥ', 2026, '2026/03/02'],
      ['6-12 ΑΠΡΙΛΙΟΥ', 2026, '2026/04/06'],
      ['4-10 ΜΑΪΟΥ', 2026, '2026/05/04'],
      ['1-7 ΙΟΥΝΙΟΥ', 2026, '2026/06/01'],
      ['6-12 ΙΟΥΛΙΟΥ', 2026, '2026/07/06'],
      ['3-9 ΑΥΓΟΥΣΤΟΥ', 2026, '2026/08/03'],
      ['7-13 ΣΕΠΤΕΜΒΡΙΟΥ', 2026, '2026/09/07'],
      ['5-11 ΟΚΤΩΒΡΙΟΥ', 2026, '2026/10/05'],
      ['2-8 ΝΟΕΜΒΡΙΟΥ', 2026, '2026/11/02'],
      ['7-13 ΔΕΚΕΜΒΡΙΟΥ', 2026, '2026/12/07'],
    ])('parses date ranges within month > %s', (src, year, expected) => {
      const result = extractMWBDate(src, year, CODE);
      expect(result).toBe(expected);
    });

    it('throws an error for unknown month', () => {
      const src = '2-8 ΦΕΒΡΟΥΑΡΙΥ';
      expect(() => extractMWBDate(src, 2026, CODE)).toThrowError();
    });
  });

  describe('W date parsing', () => {
    it.each([
      ['5-11 Ιανουαρίου 2026', '2026/01/05'],
      ['2-8 Φεβρουαρίου 2026', '2026/02/02'],
      ['2-8 Μαρτίου 2026', '2026/03/02'],
      ['6-12 Απριλίου 2026', '2026/04/06'],
      ['4-10 Μαΐου 2026', '2026/05/04'],
      ['1-7 Ιουνίου 2026', '2026/06/01'],
      ['6-12 Ιουλίου 2026', '2026/07/06'],
      ['3-9 Αυγούστου 2026', '2026/08/03'],
      ['7-13 Σεπτεμβρίου 2026', '2026/09/07'],
      ['5-11 Οκτωβρίου 2026', '2026/10/05'],
      ['2-8 Νοεμβρίου 2026', '2026/11/02'],
      ['7-13 Δεκεμβρίου 2026', '2026/12/07'],
    ])('parses normal date range > %s', (src, expected) => {
      const result = extractWTStudyDate(src, CODE);
      expect(result).toBe(expected);
    });

    it.each([
      ['29 Ιουνίου–5 Ιουλίου 2026', '2026/06/29'],
      ['29 Δεκεμβρίου 2025–4 Ιανουαρίου 2026', '2025/12/29'],
    ])('parses custom date range > %s', (src, expected) => {
      const result = extractWTStudyDate(src, CODE);
      expect(result).toBe(expected);
    });

    it('throws an error for unknown month', () => {
      const src = '5-11 Οκτωβρου 2026';
      expect(() => extractWTStudyDate(src, CODE)).toThrowError();
    });
  });
});
