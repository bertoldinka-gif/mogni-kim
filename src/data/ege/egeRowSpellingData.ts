import { EgeRowSpellingQuestion } from '../../types/platform';

const OFFICIAL_ROW_INSTRUCTION =
  'Укажите варианты ответов, в которых во всех словах одного ряда пропущена одна и та же буква. Запишите номера ответов.';

/**
 * EGE Task 9 — Правописание корней (Base + Hard 5-row blocks)
 */
export const ege9RowQuestions: EgeRowSpellingQuestion[] = [
  {
    id: 'ege-9-row-base-1',
    type: 'ege_row_spelling',
    difficulty: 'base',
    kimTaskNumber: 9,
    topicTag: 'ЕГЭ · Задание 9',
    prompt: OFFICIAL_ROW_INSTRUCTION,
    rows: [
      {
        rowNumber: 1,
        words: [
          { template: 'бл..снуть', expectedLetter: 'е' },
          { template: 'в..рховье', expectedLetter: 'е' },
          { template: 'в..стибюль', expectedLetter: 'е' },
        ],
      },
      {
        rowNumber: 2,
        words: [
          { template: 'заг..релый', expectedLetter: 'о' },
          { template: 'прик..снуться', expectedLetter: 'о' },
          { template: 'р..сток', expectedLetter: 'о' },
        ],
      },
      {
        rowNumber: 3,
        words: [
          { template: 'прор..стать', expectedLetter: 'а' },
          { template: 'пл..вчиха', expectedLetter: 'о' },
          { template: 'изб..рать', expectedLetter: 'и' },
        ],
      },
      {
        rowNumber: 4,
        words: [
          { template: 'зам..реть', expectedLetter: 'е' },
          { template: 'бл..стать', expectedLetter: 'и' },
          { template: 'ст..лить', expectedLetter: 'е' },
        ],
      },
      {
        rowNumber: 5,
        words: [
          { template: 'г..ризонт', expectedLetter: 'о' },
          { template: 'к..сательная', expectedLetter: 'а' },
          { template: 'покл..ниться', expectedLetter: 'о' },
        ],
      },
    ],
    correctRows: [1, 2],
    ruleTitle: 'Правописание гласных в корне (Задание 9 ЕГЭ)',
    ruleExplanation:
      'Верные ряды — 12. 1) блЕснуть (нет -а-), вЕрховье (верх), вЕстибюль (словарное) — везде Е. 2) загОрелый (безудар. -гор-), прикОснуться (нет -а-), рОсток (исключение) — везде О. 3) прорАстать, плОвчиха, избИрать. 4) замЕреть, блИстать, стЕлить. 5) гОризонт, кАсательная, поклОниться.',
    hint: 'Вспомните чередующиеся корни (-блест-/-блист-, -гар-/-гор-, -кас-/-кос-, -раст-/-рос-) и исключения.',
  },
  {
    id: 'ege-9-row-base-2',
    type: 'ege_row_spelling',
    difficulty: 'base',
    kimTaskNumber: 9,
    topicTag: 'ЕГЭ · Задание 9',
    prompt: OFFICIAL_ROW_INSTRUCTION,
    rows: [
      {
        rowNumber: 1,
        words: [
          { template: 'выж..гание', expectedLetter: 'и' },
          { template: 'прид..рётся', expectedLetter: 'е' },
          { template: 'соб..ратель', expectedLetter: 'и' },
        ],
      },
      {
        rowNumber: 2,
        words: [
          { template: 'предл..гать', expectedLetter: 'а' },
          { template: 'оз..рение', expectedLetter: 'а' },
          { template: 'р..внина', expectedLetter: 'а' },
        ],
      },
      {
        rowNumber: 3,
        words: [
          { template: 'зам..рать', expectedLetter: 'и' },
          { template: 'расст..латься', expectedLetter: 'и' },
          { template: 'б..рюзовый', expectedLetter: 'и' },
        ],
      },
      {
        rowNumber: 4,
        words: [
          { template: 'выг..рать', expectedLetter: 'о' },
          { template: 'прил..жение', expectedLetter: 'о' },
          { template: 'р..стовщик', expectedLetter: 'о' },
        ],
      },
      {
        rowNumber: 5,
        words: [
          { template: 'погл..щать', expectedLetter: 'о' },
          { template: 'утв..рь', expectedLetter: 'а' },
          { template: 'оп..раться', expectedLetter: 'и' },
        ],
      },
    ],
    correctRows: [2, 3, 4],
    ruleTitle: 'Чередующиеся, проверяемые и словарные корни',
    ruleExplanation:
      'Верные ряды — 234. 2) предлАгать (-лаг-), озАрение (безудар. -зар-), рАвнина (исключение) — везде А. 3) замИрать, расстИлаться (перед -а-), бИрюзовый (словарное) — везде И. 4) выгОрать, прилОжение (-лож-), рОстовщик (исключение) — везде О.',
    hint: 'Проверьте суффикс -А- после корней -мир-/-мер-, -стил-/-стел- и исключения из -равн-/-ровн- и -раст-/-рос-.',
  },
  {
    id: 'ege-9-row-hard-1',
    type: 'ege_row_spelling',
    difficulty: 'hard',
    kimTaskNumber: 9,
    topicTag: 'ЕГЭ · Задание 9',
    prompt: OFFICIAL_ROW_INSTRUCTION,
    rows: [
      {
        rowNumber: 1,
        words: [
          { template: 'приж..гать', expectedLetter: 'и' },
          { template: 'уп..раться', expectedLetter: 'и' },
          { template: 'бл..стательный', expectedLetter: 'и' },
        ],
      },
      {
        rowNumber: 2,
        words: [
          { template: 'соч..тать', expectedLetter: 'е' },
          { template: 'инт..ллигентный', expectedLetter: 'е' },
          { template: 'зам..реть', expectedLetter: 'е' },
        ],
      },
      {
        rowNumber: 3,
        words: [
          { template: 'з..рница', expectedLetter: 'а' },
          { template: 'ск..чок', expectedLetter: 'о' },
          { template: 'пл..вец', expectedLetter: 'о' },
        ],
      },
      {
        rowNumber: 4,
        words: [
          { template: 'тв..рец', expectedLetter: 'о' },
          { template: 'скл..нение', expectedLetter: 'о' },
          { template: 'приг..реть', expectedLetter: 'о' },
        ],
      },
      {
        rowNumber: 5,
        words: [
          { template: 'насл..ждение', expectedLetter: 'а' },
          { template: 'вопл..щение', expectedLetter: 'о' },
          { template: 'тр..петать', expectedLetter: 'е' },
        ],
      },
    ],
    correctRows: [1, 2, 4],
    ruleTitle: 'Трудные чередования и словарные корни (Хард)',
    ruleExplanation:
      'Верные ряды — 124. 1) прижИгать, упИраться, блИстательный — везде И (суффикс -а-). 2) сочЕтать (исключение из -чет-/-чит-), интЕллигентный (словар.), замЕреть — везде Е. 4) твОрец, склОнение, пригОреть (безударное положение в -твор-, -клон-, -гор-) — везде О.',
    hint: 'Обратите внимание на исключение «сочетать» и безударные корни -твор-/-клон-/-гор-.',
  },
  {
    id: 'ege-9-row-hard-2',
    type: 'ege_row_spelling',
    difficulty: 'hard',
    kimTaskNumber: 9,
    topicTag: 'ЕГЭ · Задание 9',
    prompt: OFFICIAL_ROW_INSTRUCTION,
    rows: [
      {
        rowNumber: 1,
        words: [
          { template: 'к..лорит', expectedLetter: 'о' },
          { template: 'п..лисадник', expectedLetter: 'а' },
          { template: 'б..гровый', expectedLetter: 'а' },
        ],
      },
      {
        rowNumber: 2,
        words: [
          { template: 'сув..ренитет', expectedLetter: 'е' },
          { template: 'п..риод', expectedLetter: 'е' },
          { template: 'в..теран', expectedLetter: 'е' },
        ],
      },
      {
        rowNumber: 3,
        words: [
          { template: 'отр..слевой', expectedLetter: 'а' },
          { template: 'к..сание', expectedLetter: 'а' },
          { template: 'выр..щенный', expectedLetter: 'а' },
        ],
      },
      {
        rowNumber: 4,
        words: [
          { template: 'неприк..сновенный', expectedLetter: 'о' },
          { template: 'пог..сить', expectedLetter: 'а' },
          { template: 'б..дон', expectedLetter: 'и' },
        ],
      },
      {
        rowNumber: 5,
        words: [
          { template: 'д..ликатес', expectedLetter: 'е' },
          { template: 'д..фицит', expectedLetter: 'и' },
          { template: 'п..ссимизм', expectedLetter: 'е' },
        ],
      },
    ],
    correctRows: [2, 3],
    ruleTitle: 'Словарные и омонимичные корни (Хард)',
    ruleExplanation:
      'Верные ряды — 23. 2) сувЕренитет, пЕриод, вЕтеран — везде словарная Е. 3) отрАслевой (исключение от «отрасль»), кАсание (-кас- перед -а-), вырАщенный (-ращ-) — везде А.',
    hint: 'Проверьте словарные заимствования во 2-м ряду и исключение «отраслевой» в 3-м.',
  },
];

/**
 * EGE Task 10 — Правописание приставок (Base + Hard 5-row blocks, 3 words per row)
 */
export const ege10RowQuestions: EgeRowSpellingQuestion[] = [
  {
    id: 'ege-10-row-base-1',
    type: 'ege_row_spelling',
    difficulty: 'base',
    kimTaskNumber: 10,
    topicTag: 'ЕГЭ · Задание 10',
    prompt: OFFICIAL_ROW_INSTRUCTION,
    rows: [
      {
        rowNumber: 1,
        words: [
          { template: 'пр..стыдить', expectedLetter: 'и' },
          { template: 'непр..ступная (крепость)', expectedLetter: 'и' },
          { template: 'беспр..мерный', expectedLetter: 'и' },
        ],
      },
      {
        rowNumber: 2,
        words: [
          { template: 'от..скать', expectedLetter: 'ы' },
          { template: 'пост..ндустриальный', expectedLetter: 'и' },
          { template: 'за..нтересовать', expectedLetter: 'и' },
        ],
      },
      {
        rowNumber: 3,
        words: [
          { template: 'сни..хождение', expectedLetter: 'с' },
          { template: 'и..колесить', expectedLetter: 'с' },
          { template: 'ра..ценки', expectedLetter: 'с' },
        ],
      },
      {
        rowNumber: 4,
        words: [
          { template: 'непре..сказуемый', expectedLetter: 'д' },
          { template: 'о..блеск', expectedLetter: 'т' },
          { template: 'по..точить', expectedLetter: 'д' },
        ],
      },
      {
        rowNumber: 5,
        words: [
          { template: 'нер..ссказанный', expectedLetter: 'а' },
          { template: 'под..спел', expectedLetter: 'о' },
          { template: 'н..илучший', expectedLetter: 'а' },
        ],
      },
    ],
    correctRows: [1, 3],
    ruleTitle: 'Правописание приставок (Задание 10 ЕГЭ)',
    ruleExplanation:
      'Верные ряды — 13. 1) прИстыдить (доведение действия до результата), непрИступная крепость (нельзя приступить), беспрИмерный (словарное) — везде И. 2) отЫскать (после русской приставки на согл.), постИндустриальный (после иноязычной приставки пост-), заИнтересовать (после гласной). 3) сниСхождение, иСколесить, раСценки (приставки на -з/-с перед глухими х, к, ц) — везде С. 4) непредсказуемый (пред-), отблеск (от-), подточить (под-). 5) нерассказанный (рас-), подоспел (подо-), наилучший (наи-).',
    hint: 'Проверьте значения приставок ПРЕ-/ПРИ-, правило И/Ы после приставок на согласную (исключение для иноязычных приставок пост-, сверх-, меж-) и глухость/звонкость согласного после приставок на -З/-С.',
  },
  {
    id: 'ege-10-row-hard-1',
    type: 'ege_row_spelling',
    difficulty: 'hard',
    kimTaskNumber: 10,
    topicTag: 'ЕГЭ · Задание 10',
    prompt: OFFICIAL_ROW_INSTRUCTION,
    rows: [
      {
        rowNumber: 1,
        words: [
          { template: 'пр..стыдить', expectedLetter: 'и' },
          { template: 'непр..ступная (крепость)', expectedLetter: 'и' },
          { template: 'беспр..мерный', expectedLetter: 'и' },
        ],
      },
      {
        rowNumber: 2,
        words: [
          { template: 'от..скать', expectedLetter: 'ы' },
          { template: 'пост..ндустриальный', expectedLetter: 'и' },
          { template: 'за..нтересовать', expectedLetter: 'и' },
        ],
      },
      {
        rowNumber: 3,
        words: [
          { template: 'сни..хождение', expectedLetter: 'с' },
          { template: 'и..колесить', expectedLetter: 'с' },
          { template: 'ра..ценки', expectedLetter: 'с' },
        ],
      },
      {
        rowNumber: 4,
        words: [
          { template: 'непре..сказуемый', expectedLetter: 'д' },
          { template: 'о..блеск', expectedLetter: 'т' },
          { template: 'по..точить', expectedLetter: 'д' },
        ],
      },
      {
        rowNumber: 5,
        words: [
          { template: 'нер..ссказанный', expectedLetter: 'а' },
          { template: 'под..спел', expectedLetter: 'о' },
          { template: 'н..илучший', expectedLetter: 'а' },
        ],
      },
    ],
    correctRows: [1, 3],
    ruleTitle: 'Правописание приставок (Задание 10 ЕГЭ · Хард)',
    ruleExplanation:
      'Верные ряды — 13. 1) прИстыдить, непрИступная (крепость), беспрИмерный — везде И. 2) отЫскать, постИндустриальный, заИнтересовать. 3) сниСхождение, иСколесить, раСценки — везде С перед глухими согласными. 4) непредсказуемый (пред-), отблеск (от-), подточить (под-). 5) нерассказанный (рас-), подоспел (подо-), наилучший (наи-).',
    hint: 'Обратите внимание на неизменяемые приставки (пред-, от-, под-, рас-, подо-, наи-) и правило И/Ы после приставок.',
  },
];

/**
 * EGE Task 11 — Правописание суффиксов (Base + Hard 5-row blocks, 2 words per row)
 */
export const ege11RowQuestions: EgeRowSpellingQuestion[] = [
  {
    id: 'ege-11-row-base-1',
    type: 'ege_row_spelling',
    difficulty: 'base',
    kimTaskNumber: 11,
    topicTag: 'ЕГЭ · Задание 11',
    prompt: OFFICIAL_ROW_INSTRUCTION,
    rows: [
      {
        rowNumber: 1,
        words: [
          { template: 'камыш..вый', expectedLetter: 'о' },
          { template: 'парч..вый', expectedLetter: 'о' },
        ],
      },
      {
        rowNumber: 2,
        words: [
          { template: 'ключ..к', expectedLetter: 'и' },
          { template: 'рассматр..вать', expectedLetter: 'и' },
        ],
      },
      {
        rowNumber: 3,
        words: [
          { template: 'замоч..к', expectedLetter: 'е' },
          { template: 'милост..вый', expectedLetter: 'и' },
        ],
      },
      {
        rowNumber: 4,
        words: [
          { template: 'бесед..вать', expectedLetter: 'о' },
          { template: 'ноч..вать', expectedLetter: 'е' },
        ],
      },
      {
        rowNumber: 5,
        words: [
          { template: 'издавн..', expectedLetter: 'а' },
          { template: 'влев..', expectedLetter: 'о' },
        ],
      },
    ],
    correctRows: [1, 2],
    ruleTitle: 'Суффиксы существительных, прилагательных, глаголов и наречий',
    ruleExplanation:
      'Верные ряды — 12. 1) камышОвый, парчОвый (под ударением после шипящего О) — везде О. 2) ключИк (ключИка — И сохраняется), рассматрИвать (рассматриваю) — везде И. 3) замочЕк, милостИвый. 4) беседОвать, ночЕвать. 5) издавнА, влевО.',
    hint: 'В глаголах на -ова-/-ева- и -ыва-/-ива- поставьте форму 1-го лица ед. ч. («я что делаю?»).',
  },
  {
    id: 'ege-11-row-base-2',
    type: 'ege_row_spelling',
    difficulty: 'base',
    kimTaskNumber: 11,
    topicTag: 'ЕГЭ · Задание 11',
    prompt: OFFICIAL_ROW_INSTRUCTION,
    rows: [
      {
        rowNumber: 1,
        words: [
          { template: 'горош..к', expectedLetter: 'е' },
          { template: 'карандаш..к', expectedLetter: 'и' },
        ],
      },
      {
        rowNumber: 2,
        words: [
          { template: 'сирен..вый', expectedLetter: 'е' },
          { template: 'рул..вой', expectedLetter: 'е' },
        ],
      },
      {
        rowNumber: 3,
        words: [
          { template: 'приветл..вый', expectedLetter: 'и' },
          { template: 'улыбч..вый', expectedLetter: 'и' },
        ],
      },
      {
        rowNumber: 4,
        words: [
          { template: 'опазд..вать', expectedLetter: 'ы' },
          { template: 'завед..вать', expectedLetter: 'о' },
        ],
      },
      {
        rowNumber: 5,
        words: [
          { template: 'вправ..', expectedLetter: 'о' },
          { template: 'занов..', expectedLetter: 'о' },
        ],
      },
    ],
    correctRows: [2, 3, 5],
    ruleTitle: 'Суффиксы -ЛИВ-/-ЧИВ-, -ЕВ-/-ОВ- и гласные на конце наречий',
    ruleExplanation:
      'Верные ряды — 235. 2) сиренЕвый, рулЕвой (безударный -ев-) — везде Е. 3) приветлИвый, улыбчИвый (неизменяемые суффиксы -лив-/-чив-) — везде И. 5) вправО, зановО (наречия с приставками в-, за-) — везде О.',
    hint: 'Вспомните «правило окна» для наречий с приставками в-, на-, за- и суффиксы -лив-/-чив-.',
  },
  {
    id: 'ege-11-row-hard-1',
    type: 'ege_row_spelling',
    difficulty: 'hard',
    kimTaskNumber: 11,
    topicTag: 'ЕГЭ · Задание 11',
    prompt: OFFICIAL_ROW_INSTRUCTION,
    rows: [
      {
        rowNumber: 1,
        words: [
          { template: 'гуттаперч..вый', expectedLetter: 'е' },
          { template: 'обид..вшись', expectedLetter: 'е' },
        ],
      },
      {
        rowNumber: 2,
        words: [
          { template: 'неж..нка', expectedLetter: 'и' },
          { template: 'нищ..нка', expectedLetter: 'е' },
        ],
      },
      {
        rowNumber: 3,
        words: [
          { template: 'наста..вать', expectedLetter: 'и' },
          { template: 'выздоравл..вать', expectedLetter: 'и' },
        ],
      },
      {
        rowNumber: 4,
        words: [
          { template: 'отц..вский', expectedLetter: 'о' },
          { template: 'лиц..вой', expectedLetter: 'е' },
        ],
      },
      {
        rowNumber: 5,
        words: [
          { template: 'сначал..', expectedLetter: 'а' },
          { template: 'набел..', expectedLetter: 'о' },
        ],
      },
    ],
    correctRows: [1, 3],
    ruleTitle: 'Трудные суффиксы -ИНК-/-ЕНК-, -ЕВ- и глагольные основы (Хард)',
    ruleExplanation:
      'Верные ряды — 13. 1) гуттаперчЕвый (безудар. -ев-), обидЕвшись (от обидЕться) — везде Е. 3) настаИвать (настаИваю), выздоравлИвать (выздоравлИваю) — везде И. 2) нежИнка, нищЕнка. 4) отцОвский, лицЕвой. 5) сначалА, набелО.',
    hint: 'В «нищенка» основа «нищ-», поэтому суффикс -енк-, а в «обидевшись» сохраняется гласная инфинитива «обидеть».',
  },
  {
    id: 'ege-11-row-hard-2',
    type: 'ege_row_spelling',
    difficulty: 'hard',
    kimTaskNumber: 11,
    topicTag: 'ЕГЭ · Задание 11',
    prompt: OFFICIAL_ROW_INSTRUCTION,
    rows: [
      {
        rowNumber: 1,
        words: [
          { template: 'застр..вать', expectedLetter: 'е' },
          { template: 'причудл..вый', expectedLetter: 'и' },
        ],
      },
      {
        rowNumber: 2,
        words: [
          { template: 'затм..вать', expectedLetter: 'е' },
          { template: 'увещ..вать', expectedLetter: 'е' },
        ],
      },
      {
        rowNumber: 3,
        words: [
          { template: 'проповед..вать', expectedLetter: 'о' },
          { template: 'завед..вать', expectedLetter: 'о' },
        ],
      },
      {
        rowNumber: 4,
        words: [
          { template: 'фланел..вый', expectedLetter: 'е' },
          { template: 'солом..нка', expectedLetter: 'и' },
        ],
      },
      {
        rowNumber: 5,
        words: [
          { template: 'досыт..', expectedLetter: 'а' },
          { template: 'докрасн..', expectedLetter: 'а' },
        ],
      },
    ],
    correctRows: [2, 3, 5],
    ruleTitle: 'Глаголы с ударным суффиксом -ВА- и исключения (Хард)',
    ruleExplanation:
      'Верные ряды — 235. 2) затмЕвать, увещЕвать (исключения с ударным -ва-, пишется Е) — везде Е. 3) проповедОвать (проповедую), заведОвать (заведую) — везде О. 5) досытА, докраснА (приставка до- -> суффикс -а-) — везде А.',
    hint: 'Запомните слова-ловушки: «затмевать», «застревать», «увещевать», «намереваться».',
  },
];

/**
 * EGE Task 12 — Личные окончания глаголов и суффиксы причастий (Base + Hard, 2 words per row)
 */
export const ege12RowQuestions: EgeRowSpellingQuestion[] = [
  {
    id: 'ege-12-row-base-1',
    type: 'ege_row_spelling',
    difficulty: 'base',
    kimTaskNumber: 12,
    topicTag: 'ЕГЭ · Задание 12',
    prompt: OFFICIAL_ROW_INSTRUCTION,
    rows: [
      {
        rowNumber: 1,
        words: [
          { template: '(они) бор..тся', expectedLetter: 'ю' },
          { template: 'та..щий', expectedLetter: 'ю' },
        ],
      },
      {
        rowNumber: 2,
        words: [
          { template: '(он) держ..т', expectedLetter: 'и' },
          { template: 'вид..мый', expectedLetter: 'и' },
        ],
      },
      {
        rowNumber: 3,
        words: [
          { template: 'колыш..щийся', expectedLetter: 'у' },
          { template: 'дыш..щий', expectedLetter: 'а' },
        ],
      },
      {
        rowNumber: 4,
        words: [
          { template: 'увид..нный', expectedLetter: 'е' },
          { template: 'гон..мый', expectedLetter: 'и' },
        ],
      },
      {
        rowNumber: 5,
        words: [
          { template: '(они) слыш..т', expectedLetter: 'а' },
          { template: '(они) стро..т', expectedLetter: 'я' },
        ],
      },
    ],
    correctRows: [1, 2],
    ruleTitle: 'Спряжение глаголов и суффиксы причастий (Задание 12 ЕГЭ)',
    ruleExplanation:
      'Верные ряды — 12. 1) борЮтся (бороться, I спр.), таЮщий (таять, I спр.) — везде Ю. 2) держИт (держать, II спр. искл.), видИмый (видеть, II спр. искл.) — везде И. 3) колышУщийся, дышАщий. 4) увидЕнный, гонИмый. 5) слышАт, строЯт.',
    hint: 'Определите инфинитив каждого глагола и проверьте глаголы-исключения II спряжения.',
  },
  {
    id: 'ege-12-row-base-2',
    type: 'ege_row_spelling',
    difficulty: 'base',
    kimTaskNumber: 12,
    topicTag: 'ЕГЭ · Задание 12',
    prompt: OFFICIAL_ROW_INSTRUCTION,
    rows: [
      {
        rowNumber: 1,
        words: [
          { template: '(он) стел..т', expectedLetter: 'е' },
          { template: '(он) дыш..т', expectedLetter: 'и' },
        ],
      },
      {
        rowNumber: 2,
        words: [
          { template: '(они) дыш..т', expectedLetter: 'а' },
          { template: 'слыш..щий', expectedLetter: 'а' },
        ],
      },
      {
        rowNumber: 3,
        words: [
          { template: 'завис..вший', expectedLetter: 'е' },
          { template: 'обиж..нный', expectedLetter: 'е' },
        ],
      },
      {
        rowNumber: 4,
        words: [
          { template: 'ла..щий', expectedLetter: 'ю' },
          { template: 'вер..щий', expectedLetter: 'я' },
        ],
      },
      {
        rowNumber: 5,
        words: [
          { template: '(они) крас..т', expectedLetter: 'я' },
          { template: 'стро..щий', expectedLetter: 'я' },
        ],
      },
    ],
    correctRows: [2, 3, 5],
    ruleTitle: 'Причастия настоящего и прошедшего времени (База)',
    ruleExplanation:
      'Верные ряды — 235. 2) дышАт, слышАщий (II спр. искл., после шипящего А) — везде А. 3) зависЕвший (от зависЕть), обижЕнный (от обидЕть) — везде Е. 5) красЯт, строЯщий (II спр.) — везде Я.',
    hint: 'В причастиях прошедшего времени (-вш-, -нн-) смотрим на инфинитив, а не на спряжение.',
  },
  {
    id: 'ege-12-row-hard-1',
    type: 'ege_row_spelling',
    difficulty: 'hard',
    kimTaskNumber: 12,
    topicTag: 'ЕГЭ · Задание 12',
    prompt: OFFICIAL_ROW_INSTRUCTION,
    rows: [
      {
        rowNumber: 1,
        words: [
          { template: '(вы) вынес..те', expectedLetter: 'е' },
          { template: 'ненавид..вший', expectedLetter: 'е' },
        ],
      },
      {
        rowNumber: 2,
        words: [
          { template: 'леле..щий', expectedLetter: 'ю' },
          { template: 'брезж..щий', expectedLetter: 'у' },
        ],
      },
      {
        rowNumber: 3,
        words: [
          { template: '(он) высп..тся', expectedLetter: 'и' },
          { template: 'движ..мый', expectedLetter: 'и' },
        ],
      },
      {
        rowNumber: 4,
        words: [
          { template: '(нефть) выкач..нная', expectedLetter: 'а' },
          { template: 'посе..нный', expectedLetter: 'я' },
        ],
      },
      {
        rowNumber: 5,
        words: [
          { template: 'ка..щийся', expectedLetter: 'ю' },
          { template: 'множ..щий', expectedLetter: 'а' },
        ],
      },
    ],
    correctRows: [1, 3],
    ruleTitle: 'Ударная приставка ВЫ- и слова-исключения (Хард)',
    ruleExplanation:
      'Верные ряды — 13. 1) вынесЕте (без вы- -> несёте, I спр.), ненавидЕвший (от ненавидЕть) — везде Е. 3) выспИтся (без вы- -> спИтся, II спр.), движИмый (от устар. движити, II спр. искл.) — везде И.',
    hint: 'В глаголах с ударной приставкой ВЫ- отбросьте её и проверьте личное окончание под ударением.',
  },
  {
    id: 'ege-12-row-hard-2',
    type: 'ege_row_spelling',
    difficulty: 'hard',
    kimTaskNumber: 12,
    topicTag: 'ЕГЭ · Задание 12',
    prompt: OFFICIAL_ROW_INSTRUCTION,
    rows: [
      {
        rowNumber: 1,
        words: [
          { template: '(они) мел..т', expectedLetter: 'ю' },
          { template: 'ве..щий', expectedLetter: 'ю' },
        ],
      },
      {
        rowNumber: 2,
        words: [
          { template: '(они) стел..т', expectedLetter: 'ю' },
          { template: '(они) зижд..тся', expectedLetter: 'у' },
        ],
      },
      {
        rowNumber: 3,
        words: [
          { template: '(вы) выгляд..те', expectedLetter: 'и' },
          { template: 'невид..мый', expectedLetter: 'и' },
        ],
      },
      {
        rowNumber: 4,
        words: [
          { template: '(они) гон..тся', expectedLetter: 'я' },
          { template: 'та..вший', expectedLetter: 'я' },
        ],
      },
      {
        rowNumber: 5,
        words: [
          { template: '(он) бре..тся', expectedLetter: 'е' },
          { template: '(он) завис..т', expectedLetter: 'и' },
        ],
      },
    ],
    correctRows: [1, 3, 4],
    ruleTitle: 'Глаголы на -ЯТЬ, -ОТЬ и разноспрягаемые случаи (Хард)',
    ruleExplanation:
      'Верные ряды — 134. 1) мелЮт (молоть, I спр.), веЮщий (веять, I спр.) — везде Ю. 3) выглядИте (выглядеть -> глядИте, II спр.), невидИмый (видеть, II спр. искл.) — везде И. 4) гонЯтся (гнать, II спр. искл.), таЯвший (таЯть) — везде Я.',
    hint: 'Проверьте инфинитив для «таЯвший» и отбросьте «вы-» в слове «выгляд..те».',
  },
];
