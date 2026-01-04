import * as path from 'path';
import { readFile } from 'fs/promises';
import initSqlJs from 'sql.js';

import CH from '../locales/cmn-Hant/text.json' with { type: 'json' };
import CHS from '../locales/ch-CHS/text.json' with { type: 'json' };
import CR from '../locales/ht-HT/text.json' with { type: 'json' };
import E from '../locales/en/text.json' with { type: 'json' };
import ELI from '../locales/en-LR/text.json' with { type: 'json' };
import F from '../locales/fr-FR/text.json' with { type: 'json' };
import FI from '../locales/fi-FI/text.json' with { type: 'json' };
import G from '../locales/el-GR/text.json' with { type: 'json' };
import H from '../locales/hu-HU/text.json' with { type: 'json' };
import HI from '../locales/hi-IN/text.json' with { type: 'json' };
import I from '../locales/it-IT/text.json' with { type: 'json' };
import IL from '../locales/ilo-PH/text.json' with { type: 'json' };
import J from '../locales/ja-JP/text.json' with { type: 'json' };
import K from '../locales/uk-UA/text.json' with { type: 'json' };
import KO from '../locales/ko-KR/text.json' with { type: 'json' };
import LSB from '../locales/pt-LSB/text.json' with { type: 'json' };
import LSE from '../locales/es-LSE/text.json' with { type: 'json' };
import M from '../locales/ro-RO/text.json' with { type: 'json' };
import MG from '../locales/mg-MG/text.json' with { type: 'json' };
import ML from '../locales/ms-MY/text.json' with { type: 'json' };
import O from '../locales/nl-NL/text.json' with { type: 'json' };
import P from '../locales/pl-PL/text.json' with { type: 'json' };
import PGW from '../locales/wes-PGW/text.json' with { type: 'json' };
import S from '../locales/es-ES/text.json' with { type: 'json' };
import ST from '../locales/et-EE/text.json' with { type: 'json' };
import SV from '../locales/sl-SI/text.json' with { type: 'json' };
import SW from '../locales/sw-KE/text.json' with { type: 'json' };
import T from '../locales/pt-POR/text.json' with { type: 'json' };
import TG from '../locales/tl-PH/text.json' with { type: 'json' };
import TH from '../locales/ty-PF/text.json' with { type: 'json' };
import TK from '../locales/tr-TR/text.json' with { type: 'json' };
import TND from '../locales/mg-TND/text.json' with { type: 'json' };
import TNK from '../locales/mg-TNK/text.json' with { type: 'json' };
import TPO from '../locales/pt-TPO/text.json' with { type: 'json' };
import TTM from '../locales/mg-TTM/text.json' with { type: 'json' };
import TW from '../locales/tw-TW/text.json' with { type: 'json' };
import U from '../locales/ru-RU/text.json' with { type: 'json' };
import VT from '../locales/vi-VN/text.json' with { type: 'json' };
import VZ from '../locales/mg-VZ/text.json' with { type: 'json' };
import X from '../locales/de-DE/text.json' with { type: 'json' };
import YW from '../locales/rw-RW/text.json' with { type: 'json' };
import Z from '../locales/sv-SE/text.json' with { type: 'json' };

declare global {
  var meeting_schedules_parser: any;
}

global.meeting_schedules_parser = {
  languages: {
    CH,
    CHS,
    CR,
    E,
    ELI,
    F,
    FI,
    G,
    H,
    HI,
    I,
    IL,
    J,
    K,
    KO,
    LSB,
    LSE,
    M,
    MG,
    ML,
    O,
    P,
    PGW,
    S,
    ST,
    SV,
    SW,
    T,
    TG,
    TH,
    TK,
    TND,
    TNK,
    TPO,
    TTM,
    TW,
    U,
    VT,
    VZ,
    X,
    YW,
    Z,
  },
  path: path,
  readFile: readFile,
  loadSQL: async () => await initSqlJs(),
};
