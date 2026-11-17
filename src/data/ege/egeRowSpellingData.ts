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
          { template: 'п..лисадник', expectedLetter: 'а' },
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
      'Верные ряды — 12. 1) блЕснуть (нет -а-), вЕрховье (верх), вЕстибюль (словарное) — везде Е. 2) загОрелый (безудар. -гор-), прикОснуться (нет -а-), рОсток (исключение) — везде О. 3) прорАстать, плОвчиха, пАлисадник. 4) замЕреть, блИстать, стЕлить. 5) гОризонт, кАсательная, поклОниться.',
    hint: 'Вспомните чередующиеся корни (-блест-/-блист-, -гар-/-гор-, -кас-/-кос-, -раст-/-рос-), исключения и словарные слова.',
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
    {
    id: 'ege-9-row-base-8',
    type: 'ege_row_spelling',
    difficulty: 'base',
    kimTaskNumber: 9,
    topicTag: 'ЕГЭ · Задание 9',
    prompt: OFFICIAL_ROW_INSTRUCTION,
    rows: [
      {
        rowNumber: 1,
        words: [
          { template: 'ц..вилизация', expectedLetter: 'и' },
          { template: 'ц..клический', expectedLetter: 'и' },
          { template: 'ц..линдр', expectedLetter: 'и' },
        ],
      },
      {
        rowNumber: 2,
        words: [
          { template: 'з..рница', expectedLetter: 'а' },
          { template: 'пол..скать (бельё)', expectedLetter: 'о' },
          { template: 'г..рмоничный', expectedLetter: 'а' },
        ],
      },
      {
        rowNumber: 3,
        words: [
          { template: 'поч..татель (таланта)', expectedLetter: 'и' },
          { template: 'обж..гаться', expectedLetter: 'и' },
          { template: 'прож..вать (по адресу)', expectedLetter: 'и' },
        ],
      },
      {
        rowNumber: 4,
        words: [
          { template: 'об..зательно', expectedLetter: 'я' },
          { template: 'неув..дающая (красота)', expectedLetter: 'я' },
          { template: 'посв..тить (в рыцари)', expectedLetter: 'я' },
        ],
      },
      {
        rowNumber: 5,
        words: [
          { template: 'разм..наться', expectedLetter: 'и' },
          { template: 'с..дина (в волосах)', expectedLetter: 'е' },
          { template: 'с..мптомы', expectedLetter: 'и' },
        ],
      },
    ],
    correctRows: Array.of(1, 3, 4),
    ruleTitle: 'Правописание гласных в корне (Задание 9 ЕГЭ)',
    ruleExplanation:
      'Верные ряды — 134. 1) цИвилизация, цИклический, цИлиндр (в корне после Ц пишем И) — везде И. 2) зАрница (безудар. -зар-), полОскать бельё (поло́щет), гАрмоничный (гармо́ния). 3) почИтатель (-чит-/-чет-, есть -а-), обжИгаться (-жиг-/-жег-, есть -а-), прожИвать (жить) — везде И. 4) обЯзательно (обя́зан), неувЯдающая (вя́нет), посвЯтить (свя́то) — везде Я. 5) размИнаться (-мин-/-мя-, есть -а-), сЕдина (сед), сИмптомы (словарное).',
    hint: 'Вспомните правило И после Ц в корне (1-й ряд) и проверьте чередования -чит-/-чет-, -жиг-/-жег- в 3-м ряду.',
  },
  {
    id: 'ege-9-row-base-9',
    type: 'ege_row_spelling',
    difficulty: 'base',
    kimTaskNumber: 9,
    topicTag: 'ЕГЭ · Задание 9',
    prompt: OFFICIAL_ROW_INSTRUCTION,
    rows: [
      {
        rowNumber: 1,
        words: [
          { template: 'загром..ждать', expectedLetter: 'о' },
          { template: '(предвыборная) к..мпания', expectedLetter: 'а' },
          { template: 'т..мительный', expectedLetter: 'о' },
        ],
      },
      {
        rowNumber: 2,
        words: [
          { template: 'ог..рчение', expectedLetter: 'о' },
          { template: 'к..рзина', expectedLetter: 'о' },
          { template: 'водор..сли', expectedLetter: 'о' },
        ],
      },
      {
        rowNumber: 3,
        words: [
          { template: 'д..ревья', expectedLetter: 'е' },
          { template: 'сб..режения', expectedLetter: 'е' },
          { template: 'бл..стящий', expectedLetter: 'е' },
        ],
      },
      {
        rowNumber: 4,
        words: [
          { template: 'обр..мление', expectedLetter: 'а' },
          { template: 'симп..тичный', expectedLetter: 'а' },
          { template: 'р..внина', expectedLetter: 'а' },
        ],
      },
      {
        rowNumber: 5,
        words: [
          { template: 'проч..тать (книгу)', expectedLetter: 'и' },
          { template: 'ч..стота (измерение радиоволн)', expectedLetter: 'а' },
          { template: 'сж..мать (в кулак)', expectedLetter: 'и' },
        ],
      },
    ],
    correctRows: Array.of(2, 3, 4),
    ruleTitle: 'Правописание гласных в корне (Задание 9 ЕГЭ)',
    ruleExplanation:
      'Верные ряды — 234. 1) загромОждать (громо́здкий), кАмпания (мероприятие — словарное), тОмительный (то́мный). 2) огОрчение (го́рько), кОрзина (словарное), водорОсли (корень -рос-) — везде О. 3) дЕревья (де́рево), сбЕрежения (берёг), блЕстящий (-блест-/-блист-, нет -а-) — везде Е. 4) обрАмление (ра́мка), симпАтичный (симпа́тия), рАвнина (исключение в -равн-/-ровн-) — везде А. 5) прочИтать (-чит-/-чет-, есть -а-), чАстота радиоволн (ча́стый), сжИмать (-жим-/-жа-, есть -а-).',
    hint: 'Запомните слова-исключения «водорОсли» и «рАвнина», а также различайте кАмпанию (мероприятие) и кОмпанию (друзей).',
  },
  {
    id: 'ege-9-row-base-10',
    type: 'ege_row_spelling',
    difficulty: 'base',
    kimTaskNumber: 9,
    topicTag: 'ЕГЭ · Задание 9',
    prompt: OFFICIAL_ROW_INSTRUCTION,
    rows: [
      {
        rowNumber: 1,
        words: [
          { template: 'к..мпания (друзей)', expectedLetter: 'о' },
          { template: 'п..лисадник', expectedLetter: 'а' },
          { template: '(семена дали) р..сток', expectedLetter: 'о' },
        ],
      },
      {
        rowNumber: 2,
        words: [
          { template: 'ум..лять (о помощи)', expectedLetter: 'о' },
          { template: 'п..радокс', expectedLetter: 'а' },
          { template: 'к..сательная', expectedLetter: 'а' },
        ],
      },
      {
        rowNumber: 3,
        words: [
          { template: 'упр..щение', expectedLetter: 'о' },
          { template: '(получить) благосл..вение', expectedLetter: 'о' },
          { template: 'распол..жение', expectedLetter: 'о' },
        ],
      },
      {
        rowNumber: 4,
        words: [
          { template: 'пок..яние', expectedLetter: 'а' },
          { template: 'насл..ждение', expectedLetter: 'а' },
          { template: 'с..тирический', expectedLetter: 'а' },
        ],
      },
      {
        rowNumber: 5,
        words: [
          { template: 'бл..стать (на сцене)', expectedLetter: 'и' },
          { template: 'напом..нать', expectedLetter: 'и' },
          { template: 'расст..лать', expectedLetter: 'и' },
        ],
      },
    ],
    correctRows: Array.of(3, 4, 5),
    ruleTitle: 'Правописание гласных в корне (Задание 9 ЕГЭ)',
    ruleExplanation:
      'Верные ряды — 345. 1) кОмпания друзей (словарное), пАлисадник (словарное), рОсток (исключение). 2) умОлять о помощи (мо́лит), пАрадокс (словарное), кАсательная (-кас-/-кос-, есть -а-). 3) упрОщение (про́ще), благослОвение (сло́во), располОжение (корень -лож-) — везде О. 4) покАяние (ка́яться), наслАждение (сла́дость), сАтирический (сати́ра) — везде А. 5) блИстать (-блист-/-блест-, есть -а-), напомИнать (-мин-/-мя-, есть -а-), расстИлать (-стил-/-стел-, есть -а-) — везде И.',
    hint: 'В 5-м ряду во всех трёх словах есть суффикс -а- после чередующегося корня.',
  },
  {
    id: 'ege-9-row-base-11',
    type: 'ege_row_spelling',
    difficulty: 'base',
    kimTaskNumber: 9,
    topicTag: 'ЕГЭ · Задание 9',
    prompt: OFFICIAL_ROW_INSTRUCTION,
    rows: [
      {
        rowNumber: 1,
        words: [
          { template: 'упл..тнять', expectedLetter: 'о' },
          { template: '(лесные) за́р..сли', expectedLetter: 'о' },
          { template: 'укр..титель', expectedLetter: 'о' },
        ],
      },
      {
        rowNumber: 2,
        words: [
          { template: 'об..яние', expectedLetter: 'а' },
          { template: 'сокр..щение', expectedLetter: 'а' },
          { template: 'приск..кать', expectedLetter: 'а' },
        ],
      },
      {
        rowNumber: 3,
        words: [
          { template: 'подр..стковый', expectedLetter: 'о' },
          { template: 'пок..рать', expectedLetter: 'а' },
          { template: 'кр..мешная (тьма)', expectedLetter: 'о' },
        ],
      },
      {
        rowNumber: 4,
        words: [
          { template: 'апп..тит', expectedLetter: 'е' },
          { template: 'сер..ал', expectedLetter: 'и' },
          { template: 'нач..нающий', expectedLetter: 'и' },
        ],
      },
      {
        rowNumber: 5,
        words: [
          { template: 'соц..альный', expectedLetter: 'и' },
          { template: 'ц..гане', expectedLetter: 'ы' },
          { template: 'ц..клон', expectedLetter: 'и' },
        ],
      },
    ],
    correctRows: Array.of(1, 2),
    ruleTitle: 'Правописание гласных в корне (Задание 9 ЕГЭ)',
    ruleExplanation:
      'Верные ряды — 12. 1) уплОтнять (пло́тный), за́рОсли (корень -рос-), укрОтитель (кро́ткий) — везде О. 2) обАяние (словарное), сокрАщение (кра́ткий), прискАкать (-скак-/-скоч-, перед К пишем А) — везде А. 3) подрОстковый (от исключения ро́сток), покАрать (ка́ра), крОмешная (словарное). 4) аппЕтит (словарное), серИал (се́рия), начИнающий (-чин-/-ча-, есть -а-). 5) соцИальный (И после Ц), цЫгане (слово-исключение), цИклон (И после Ц).',
    hint: 'Вспомните исключения: «подрОстковый» (от «рОсток») и «цЫгане» (цыган на цыпочках цыплёнку цыкнул цыц).',
  },
  {
    id: 'ege-9-row-base-12',
    type: 'ege_row_spelling',
    difficulty: 'base',
    kimTaskNumber: 9,
    topicTag: 'ЕГЭ · Задание 9',
    prompt: OFFICIAL_ROW_INSTRUCTION,
    rows: [
      {
        rowNumber: 1,
        words: [
          { template: 'изд..лека', expectedLetter: 'а' },
          { template: 'укр..щать', expectedLetter: 'о' },
          { template: 'пок..рать (врага)', expectedLetter: 'а' },
        ],
      },
      {
        rowNumber: 2,
        words: [
          { template: 'оз..рение', expectedLetter: 'а' },
          { template: 'к..рдинальный', expectedLetter: 'а' },
          { template: 'осн..щение', expectedLetter: 'а' },
        ],
      },
      {
        rowNumber: 3,
        words: [
          { template: 'соб..рательный (образ)', expectedLetter: 'и' },
          { template: 'в..негрет', expectedLetter: 'и' },
          { template: 'объед..няющий', expectedLetter: 'и' },
        ],
      },
      {
        rowNumber: 4,
        words: [
          { template: '(затягивает) тр..сина', expectedLetter: 'я' },
          { template: 'недос..гаемый', expectedLetter: 'я' },
          { template: 'просв..щение', expectedLetter: 'е' },
        ],
      },
      {
        rowNumber: 5,
        words: [
          { template: 'выск..чка', expectedLetter: 'о' },
{ template: 'р..стовщик', expectedLetter: 'о' },
{ template: 'пл..вец', expectedLetter: 'о' },
],
},
],
correctRows: Array.of(2, 3, 5),
ruleTitle: 'Правописание гласных в корне (Задание 9 ЕГЭ)',
ruleExplanation:
'Верные ряды — 235. 1) издАлека (даль), укрОщать (кро́ткий), покАрать (ка́ра). 2) озАрение (безудар. -зар-), кАрдинальный (словарное), оснАщение (осна́стка) — везде А. 3) собИрательный (-бир-/-бер-, есть -а-), вИнегрет (словарное), объедИняющий (еди́ный) — везде И. 4) трЯсина (тря́ска), недосЯгаемый (прися́га), просвЕщение (свет). 5) выскОчка (исключение в -скак-/-скоч-), рОстовщик (исключение в -раст-/-рос-), плОвец (исключение в -плав-/-плов-) — везде О.',
hint: 'В 5-м ряду собраны сразу три знаменитых слова-исключения из чередующихся корней.',
},
{
id: 'ege-9-row-base-13',
type: 'ege_row_spelling',
difficulty: 'base',
kimTaskNumber: 9,
topicTag: 'ЕГЭ · Задание 9',
prompt: OFFICIAL_ROW_INSTRUCTION,
rows: [
{
rowNumber: 1,
words: [
{ template: 'тр..вожиться', expectedLetter: 'е' },
{ template: 'дер..вяшка', expectedLetter: 'е' },
{ template: 'осл..пительный', expectedLetter: 'е' },
],
},
{
rowNumber: 2,
words: [
{ template: 'л..петать', expectedLetter: 'е' },
{ template: 'выб..рать', expectedLetter: 'и' },
{ template: 'д..монстрировать', expectedLetter: 'е' },
],
},
{
rowNumber: 3,
words: [
{ template: 'осн..щение', expectedLetter: 'а' },
{ template: 'т..лант', expectedLetter: 'а' },
{ template: 'г..лерея', expectedLetter: 'а' },
],
},
{
rowNumber: 4,
words: [
{ template: 'т..ржественный', expectedLetter: 'о' },
{ template: 'впл..тную', expectedLetter: 'о' },
{ template: 'н..велла', expectedLetter: 'о' },
],
},
{
rowNumber: 5,
words: [
{ template: 'изд..лека', expectedLetter: 'а' },
{ template: 'ди..пазон', expectedLetter: 'а' },
{ template: 'заг..рать', expectedLetter: 'о' },
],
},
],
correctRows: Array.of(1, 3, 4),
ruleTitle: 'Правописание гласных в корне (Задание 9 ЕГЭ)',
ruleExplanation:
'Верные ряды — 134. 1) трЕвожиться (словарное), дерЕвяшка (дере́вья), ослЕпительный (слеп) — везде Е. 2) лЕпетать (ле́пет), выбИрать (-бир-/-бер-, есть -а-), дЕмонстрировать (словарное). 3) оснАщение (осна́стка), тАлант (словарное), гАлерея (словарное) — везде А. 4) тОржественный (словарное), вплОтную (пло́тно), нОвелла (словарное) — везде О. 5) издАлека (даль), диАпазон (словарное), загОрать (безудар. -гор-).',
hint: 'Проверьте словарные слова «гАлерея», «нОвелла», «диАпазон» и безударный чередующийся корень -гар-/-гор-.',
},
{
id: 'ege-9-row-base-14',
type: 'ege_row_spelling',
difficulty: 'base',
kimTaskNumber: 9,
topicTag: 'ЕГЭ · Задание 9',
prompt: OFFICIAL_ROW_INSTRUCTION,
rows: [
{
rowNumber: 1,
words: [
{ template: 'покл..ниться', expectedLetter: 'о' },
{ template: 'иск..зить (факты)', expectedLetter: 'а' },
{ template: 'г..ристая (местность)', expectedLetter: 'о' },
],
},
{
rowNumber: 2,
words: [
{ template: 'отн..мать', expectedLetter: 'и' },
{ template: 'забл..стал (серебром)', expectedLetter: 'и' },
{ template: 'см..риться', expectedLetter: 'и' },
],
},
{
rowNumber: 3,
words: [
{ template: 'ч..рный', expectedLetter: 'ё' },
{ template: 'щ..лка (в двери)', expectedLetter: 'ё' },
{ template: 'ож..г (руку)', expectedLetter: 'ё' },
],
},
{
rowNumber: 4,
words: [
{ template: 'д..ржать (кроликов)', expectedLetter: 'е' },
{ template: 'т..рпеть (боль)', expectedLetter: 'е' },
{ template: 'мер..диан', expectedLetter: 'и' },
],
},
{
rowNumber: 5,
words: [
{ template: 'ж..кей', expectedLetter: 'о' },
{ template: 'мор..торий', expectedLetter: 'а' },
{ template: 'дикор..стущий', expectedLetter: 'а' },
],
},
],
correctRows: Array.of(2, 3),
ruleTitle: 'Правописание гласных в корне (Задание 9 ЕГЭ)',
ruleExplanation:
'Верные ряды — 23. 1) поклОниться (безудар. -клан-/-клон-), искАзить (словарное), гОристая (го́ры). 2) отнИмать (-ним-/-ня-, есть -а-), заблИстал (-блист-/-блест-, есть -а-), смИриться (мир) — везде И. 3) чЁрный (чернеть), щЁлка (щель), ожЁг руку (глагол, ср. ожёг — жёг) — везде Ё. 4) дЕржать (де́ржит), тЕрпеть (те́рпит), мерИдиан (словарное). 5) жОкей (заимств. словарное), морАторий (словарное), дикорАстущий (корень -раст-).',
hint: 'В 3-м ряду слово «ожЁг» выступает как глагол («ожёг руку»), поэтому пишется с Ё (в отличие от существительного «ожог руки»).',
},
{
id: 'ege-9-row-base-15',
type: 'ege_row_spelling',
difficulty: 'base',
kimTaskNumber: 9,
topicTag: 'ЕГЭ · Задание 9',
prompt: OFFICIAL_ROW_INSTRUCTION,
rows: [
{
rowNumber: 1,
words: [
{ template: 'энциклоп..дист', expectedLetter: 'е' },
{ template: 'прив..легия', expectedLetter: 'и' },
{ template: 'разв..вать (воображение)', expectedLetter: 'и' },
],
},
{
rowNumber: 2,
words: [
{ template: 'конфл..ктующий', expectedLetter: 'и' },
{ template: 'перекл..каться', expectedLetter: 'и' },
{ template: 'вест..бюль', expectedLetter: 'и' },
],
},
{
rowNumber: 3,
words: [
{ template: 'прож..рливый', expectedLetter: 'о' },
{ template: 'ш..рты', expectedLetter: 'о' },
{ template: 'ж..луди', expectedLetter: 'ё' },
],
},
{
rowNumber: 4,
words: [
{ template: 'тв..рец', expectedLetter: 'о' },
{ template: 'в..рсистый', expectedLetter: 'о' },
{ template: 'обр..млённый', expectedLetter: 'а' },
],
},
{
rowNumber: 5,
words: [
{ template: 'фант..стический', expectedLetter: 'а' },
{ template: 'тр..диционный', expectedLetter: 'а' },
{ template: 'подр..сти', expectedLetter: 'а' },
],
},
],
correctRows: Array.of(2, 5),
ruleTitle: 'Правописание гласных в корне (Задание 9 ЕГЭ)',
ruleExplanation:
'Верные ряды — 25. 1) энциклопЕдист (энциклопе́дия), привИлегия (словарное), развИвать воображение (разви́тие). 2) конфлИктующий (конфли́кт), переклИкаться (клич), вестИбюль (словарное) — везде И. 3) прожОрливый (исключение после шипящих), шОрты (заимств. словарное), жЁлуди (желудёвый). 4) твОрец (безудар. -твар-/-твор-), вОрсистый (ворс), обрАмлённый (ра́мка). 5) фантАстический (фанта́стика), трАдиционный (тради́ция), подрАсти (корень -раст-) — везде А.',
hint: 'В 3-м ряду к слову «жЁлуди» подбирается проверочное «желудёвый», а «прожОрливый» и «шОрты» пишутся через О.',
},
{
id: 'ege-9-row-base-16',
type: 'ege_row_spelling',
difficulty: 'base',
kimTaskNumber: 9,
topicTag: 'ЕГЭ · Задание 9',
prompt: OFFICIAL_ROW_INSTRUCTION,
rows: [
{
rowNumber: 1,
words: [
{ template: 'сотв..рить (чудо)', expectedLetter: 'о' },
{ template: 'покл..ниться', expectedLetter: 'о' },
{ template: 'г..ризонт', expectedLetter: 'о' },
],
},
{
rowNumber: 2,
words: [
{ template: 'соб..раться', expectedLetter: 'и' },
{ template: 'пож..мать (руку)', expectedLetter: 'и' },
{ template: 'зап..рать (на ключ)', expectedLetter: 'и' },
],
},
{
rowNumber: 3,
words: [
{ template: 'д..лёкий', expectedLetter: 'а' },
{ template: 'прогл..тить', expectedLetter: 'о' },
{ template: 'насл..ждение', expectedLetter: 'а' },
],
},
{
rowNumber: 4,
words: [
{ template: 'просв..щение (народа)', expectedLetter: 'е' },
{ template: 'ед..нение (людей)', expectedLetter: 'и' },
{ template: 'пом..риться (с другом)', expectedLetter: 'и' },
],
},
{
rowNumber: 5,
words: [
{ template: 'зам..реть (от восторга)', expectedLetter: 'е' },
{ template: 'прим..рять (пальто)', expectedLetter: 'е' },
{ template: 'разв..вается (флаг)', expectedLetter: 'е' },
],
},
],
correctRows: Array.of(1, 2, 5),
ruleTitle: 'Правописание гласных в корне (Задание 9 ЕГЭ)',
ruleExplanation:
'Верные ряды — 125. 1) сотвОрить (безудар. -твар-/-твор-), поклОниться (безудар. -клан-/-клон-), гОризонт (словарное) — везде О. 2) собИраться (-бир-/-бер-, есть -а-), пожИмать (-жим-/-жа-, есть -а-), запИрать (-пир-/-пер-, есть -а-) — везде И. 3) дАлёкий (даль), проглОтить (гло́тка), наслАждение (сла́дость). 4) просвЕщение (свет), едИнение (еди́ный), помИриться с другом (мир). 5) замЕреть (-мир-/-мер-, нет -а-), примЕрять пальто (приме́рка), развЕвается флаг (ве́ять) — везде Е.',
hint: 'В 5-м ряду различайте омофоны по контексту: примЕрять пальто (приме́рка) и развЕвается флаг (ве́ет).',
},
{
id: 'ege-9-row-base-17',
type: 'ege_row_spelling',
difficulty: 'base',
kimTaskNumber: 9,
topicTag: 'ЕГЭ · Задание 9',
prompt: OFFICIAL_ROW_INSTRUCTION,
rows: [
{
rowNumber: 1,
words: [
{ template: 'отск..чить', expectedLetter: 'о' },
{ template: '(на) з..ре', expectedLetter: 'а' },
{ template: 'пан..рама', expectedLetter: 'о' },
],
},
{
rowNumber: 2,
words: [
{ template: 'разг..релся (спор)', expectedLetter: 'о' },
{ template: 'сокр..венные (мечты)', expectedLetter: 'о' },
{ template: 'затв..рить (окно)', expectedLetter: 'о' },
],
},
{
rowNumber: 3,
words: [
{ template: 'сж..г (дотла)', expectedLetter: 'ё' },
{ template: 'трущ..ба', expectedLetter: 'о' },
{ template: 'пощ..чина', expectedLetter: 'ё' },
],
},
{
rowNumber: 4,
words: [
{ template: 'выт..реть (руки)', expectedLetter: 'е' },
{ template: 'благоч..стивый', expectedLetter: 'е' },
{ template: 'в..лосипед', expectedLetter: 'е' },
],
},
{
rowNumber: 5,
words: [
{ template: 'прив..дение (примера)', expectedLetter: 'е' },
{ template: 'выч..тание', expectedLetter: 'и' },
{ template: 'вин..грет', expectedLetter: 'е' },
],
},
],
correctRows: Array.of(2, 4),
ruleTitle: 'Правописание гласных в корне (Задание 9 ЕГЭ)',
ruleExplanation:
'Верные ряды — 24. 1) отскОчить (-скак-/-скоч-, перед Ч пишем О), на зАре (безудар. -зар-), панОрама (словарное). 2) разгОрелся (безудар. -гор-), сокрОвенные (словарное), затвОрить окно (безудар. -твар-/-твор-) — везде О. 3) сжЁг (глагол, ср. сжечь), трущОба (исключение после шипящих), пощЁчина (щека). 4) вытЕреть (-тир-/-тер-, нет -а-), благочЕстивый (честь), вЕлосипед (словарное) — везде Е. 5) привЕдение примера (привёл), вычИтание (-чит-/-чет-, есть -а-), винЕгрет (словарное).',
hint: 'В 3-м ряду слово-исключение «трущОба» пишется через О, а в 5-м — словарное «винЕгрет» пишется с Е.',
},
{
id: 'ege-9-row-base-18',
type: 'ege_row_spelling',
difficulty: 'base',
kimTaskNumber: 9,
topicTag: 'ЕГЭ · Задание 9',
prompt: OFFICIAL_ROW_INSTRUCTION,
rows: [
{
rowNumber: 1,
words: [
{ template: 'ед..номышленники', expectedLetter: 'и' },
{ template: 'зап..вала (в хоре)', expectedLetter: 'е' },
{ template: 'оф..церский', expectedLetter: 'и' },
],
},
{
rowNumber: 2,
words: [
{ template: 'х..отичный', expectedLetter: 'а' },
{ template: 'возр..ждение', expectedLetter: 'о' },
{ template: 'возр..зить', expectedLetter: 'а' },
],
},
{
rowNumber: 3,
words: [
{ template: 'песс..мистический', expectedLetter: 'и' },
{ template: 'невн..мательный', expectedLetter: 'и' },
{ template: 'тр..нироваться', expectedLetter: 'е' },
],
},
{
rowNumber: 4,
words: [
{ template: 'см..гчить (тон)', expectedLetter: 'я' },
{ template: 'разр..дить (обстановку)', expectedLetter: 'я' },
{ template: 'снар..жение', expectedLetter: 'я' },
],
},
{
rowNumber: 5,
words: [
{ template: 'пл..вец', expectedLetter: 'о' },
{ template: 'тр..стник', expectedLetter: 'о' },
{ template: 'умн..жение', expectedLetter: 'о' },
],
},
],
correctRows: Array.of(4, 5),
ruleTitle: 'Правописание гласных в корне (Задание 9 ЕГЭ)',
ruleExplanation:
'Верные ряды — 45. 1) едИномышленники (еди́ный), запЕвала в хоре (петь), офИцерский (словарное). 2) хАотичный (ха́ос), возрОждение (род), возрАзить (словарное). 3) пессИмистический (пессими́зм), невнИмательный (-ним-/-ня-, есть -а-), трЕнироваться (тре́нер). 4) смЯгчить (мя́гкий), разрЯдить обстановку (разря́дка), снарЯжение (снаря́д) — везде Я. 5) плОвец (исключение в -плав-/-плов-), трОстник (трость), умнОжение (мно́жить) — везде О.',
hint: 'Вспомните различение омофонов по контексту: «запЕвала в хоре» (петь) и «разрЯдить обстановку» (разря́дка).',
},
{
id: 'ege-9-row-base-19',
type: 'ege_row_spelling',
difficulty: 'base',
kimTaskNumber: 9,
topicTag: 'ЕГЭ · Задание 9',
prompt: OFFICIAL_ROW_INSTRUCTION,
rows: [
{
rowNumber: 1,
words: [
{ template: 'прор..дить (всходы)', expectedLetter: 'е' },
{ template: 'р..цензент', expectedLetter: 'е' },
{ template: 'интелл..ктуальный', expectedLetter: 'е' },
],
},
{
rowNumber: 2,
words: [
{ template: 'зак..ренелый', expectedLetter: 'о' },
{ template: 'восп..лительный (процесс)', expectedLetter: 'а' },
{ template: 'гр..мадных (размеров)', expectedLetter: 'о' },
],
},
{
rowNumber: 3,
words: [
{ template: 'акк..мпанировать', expectedLetter: 'о' },
{ template: 'ан..логичный', expectedLetter: 'а' },
{ template: 'пол..гаться (на чьё-то мнение)', expectedLetter: 'а' },
],
},
{
rowNumber: 4,
words: [
{ template: 'в..новатый', expectedLetter: 'и' },
{ template: 'пол..нявшая (от стирки вещь)', expectedLetter: 'и' },
{ template: 'заст..лать (пол ковром)', expectedLetter: 'и' },
],
},
{
rowNumber: 5,
words: [
{ template: 'раст..рать (в порошок)', expectedLetter: 'и' },
{ template: 'б..рёзовый', expectedLetter: 'е' },
{ template: 'скр..пят (ворота)', expectedLetter: 'и' },
],
},
],
correctRows: Array.of(1, 4),
ruleTitle: 'Правописание гласных в корне (Задание 9 ЕГЭ)',
ruleExplanation:
'Верные ряды — 14. 1) прорЕдить всходы (ре́дкий), рЕцензент (реце́нзия), интеллЕктуальный (интелле́кт) — везде Е. 2) закОренелый (ко́рень), воспАлительный (словарное), грОмадных (огро́мный). 3) аккОмпанировать (словарное), анАлогичный (ана́лог), полАгаться (-лаг-/-лож-, есть -а-). 4) вИноватый (неви́нный), полИнявшая (ли́нька), застИлать (-стил-/-стел-, есть -а-) — везде И. 5) растИрать (-тир-/-тер-, есть -а-), бЕрёзовый (словарное), скрИпят ворота (скрип).',
hint: 'В 1-м ряду «прорЕдить всходы» проверяется словом «ре́дкий» (сделать реже), а в 4-м — работает суффикс -а- в корне -стил-/-стел-.',
},
{
id: 'ege-9-row-base-20',
type: 'ege_row_spelling',
difficulty: 'base',
kimTaskNumber: 9,
topicTag: 'ЕГЭ · Задание 9',
prompt: OFFICIAL_ROW_INSTRUCTION,
rows: [
{
rowNumber: 1,
words: [
{ template: 'разж..гание (костра)', expectedLetter: 'и' },
{ template: 'ф..гурировать', expectedLetter: 'и' },
{ template: 'ут..шение', expectedLetter: 'е' },
],
},
{
rowNumber: 2,
words: [
{ template: 'в..щественные (доказательства)', expectedLetter: 'е' },
{ template: 'осл..плённый', expectedLetter: 'е' },
{ template: 'сув..ренитет', expectedLetter: 'е' },
],
},
{
rowNumber: 3,
words: [
{ template: 'нагром..здить', expectedLetter: 'о' },
{ template: 'к..нкурент', expectedLetter: 'о' },
{ template: 'ст..рониться', expectedLetter: 'о' },
],
},
{
rowNumber: 4,
words: [
{ template: 'обр..зность', expectedLetter: 'а' },
{ template: 'либер..лизм', expectedLetter: 'а' },
{ template: 'м..кнуть (хлеб в соль)', expectedLetter: 'а' },
],
},
{
rowNumber: 5,
words: [
{ template: 'мот..вировать', expectedLetter: 'и' },
{ template: 'ист..на', expectedLetter: 'и' },
{ template: 'экспр..ссивный', expectedLetter: 'е' },
],
},
],
correctRows: Array.of(2, 3, 4),
ruleTitle: 'Правописание гласных в корне (Задание 9 ЕГЭ)',
ruleExplanation:
'Верные ряды — 234. 1) разжИгание (-жиг-/-жег-, есть -а-), фИгурировать (словарное), утЕшение (те́шить). 2) вЕщественные (ве́щи), ослЕплённый (слеп), сувЕренитет (словарное) — везде Е. 3) нагромОздить (громо́здкий), кОнкурент (ко́нкурс), стОрониться (сто́роны) — везде О. 4) обрАзность (о́браз), либерАлизм (либера́л), мАкнуть (-мак-/-мок-, значение «погружать в жидкость или сыпучую массу») — везде А. 5) мотИвировать (моти́в), истИна (словарное), экспрЕссивный (экспре́ссия).',
hint: 'В 4-м ряду вспомните чередование -мак-/-мок-: «мАкнуть» пишется через А (погрузить во что-либо).',
},
{
id: 'ege-9-row-base-21',
type: 'ege_row_spelling',
difficulty: 'base',
kimTaskNumber: 9,
topicTag: 'ЕГЭ · Задание 9',
prompt: OFFICIAL_ROW_INSTRUCTION,
rows: [
{
rowNumber: 1,
words: [
{ template: 'к..снулся', expectedLetter: 'о' },
{ template: 'возл..жение (венков)', expectedLetter: 'о' },
{ template: 'акв..рельные (краски)', expectedLetter: 'а' },
],
},
{
rowNumber: 2,
words: [
{ template: 'грам..тный', expectedLetter: 'о' },
{ template: 'г..рделивый', expectedLetter: 'о' },
{ template: 'оск..рбление', expectedLetter: 'о' },
],
},
{
rowNumber: 3,
words: [
{ template: 'отб..рает', expectedLetter: 'и' },
{ template: 'зан..мательный', expectedLetter: 'и' },
{ template: 'оз..раться (по сторонам)', expectedLetter: 'и' },
],
},
{
rowNumber: 4,
words: [
{ template: 'ск..птический', expectedLetter: 'е' },
{ template: 'щ..бетать', expectedLetter: 'е' },
{ template: 'г..потеза', expectedLetter: 'и' },
],
},
{
rowNumber: 5,
words: [
{ template: 'л..гичный', expectedLetter: 'о' },
{ template: 'притв..риться (спящим)', expectedLetter: 'о' },
{ template: 'преод..леть', expectedLetter: 'о' },
],
},
],
correctRows: Array.of(2, 3, 5),
ruleTitle: 'Правописание гласных в корне (Задание 9 ЕГЭ)',
ruleExplanation:
'Верные ряды — 235. 1) кОснулся (-кас-/-кос-, нет -а-), возлОжение (корень -лож-), аквАрельные (аква́риум). 2) грамОтный (словарное), гОрделивый (го́рдый), оскОрбление (скорбь) — везде О. 3) отбИрает (-бир-/-бер-, есть -а-), занИмательный (-ним-/-ня-, есть -а-), озИраться (ози́рать, зоркий) — везде И. 4) скЕптический (ске́птик), щЕбетать (ще́бет), гИпотеза (словарное). 5) лОгичный (ло́гика), притвОриться (безудар. -твар-/-твор-), преодОлеть (до́ля) — везде О.',
hint: 'В 3-м ряду слово «озИраться» (оглядываться по сторонам) пишется через И (ср. «взирать»).',
},
{
id: 'ege-9-row-base-22',
type: 'ege_row_spelling',
difficulty: 'base',
kimTaskNumber: 9,
topicTag: 'ЕГЭ · Задание 9',
prompt: OFFICIAL_ROW_INSTRUCTION,
rows: [
{
rowNumber: 1,
words: [
{ template: 'выр..внять (дыхание)', expectedLetter: 'о' },
{ template: 'непром..каемый', expectedLetter: 'о' },
{ template: 'к..манда', expectedLetter: 'о' },
],
},
{
rowNumber: 2,
words: [
{ template: 'отв..рить (картофель)', expectedLetter: 'а' },
{ template: 'обог..щение', expectedLetter: 'а' },
{ template: 'изл..гать (мысли)', expectedLetter: 'а' },
],
},
{
rowNumber: 3,
words: [
{ template: 'выт..реть (пыль)', expectedLetter: 'е' },
{ template: '(трава покрыта) ин..ем', expectedLetter: 'е' },
{ template: '(флаги) разв..ваются (на ветру)', expectedLetter: 'е' },
],
},
{
rowNumber: 4,
words: [
{ template: 'подн..мать (тяжести)', expectedLetter: 'и' },
{ template: 'инж..нер', expectedLetter: 'е' },
{ template: 'п..тербургский', expectedLetter: 'е' },
],
},
{
rowNumber: 5,
words: [
{ template: 'ц..ганский', expectedLetter: 'ы' },
{ template: 'панц..рь', expectedLetter: 'и' },
{ template: 'ц..плёнок', expectedLetter: 'ы' },
],
},
],
correctRows: Array.of(1, 2, 3),
ruleTitle: 'Правописание гласных в корне (Задание 9 ЕГЭ)',
ruleExplanation:
'Верные ряды — 123. 1) вырОвнять дыхание (-равн-/-ровн-, значение «сделать ровным, гладким»), непромОкаемый (-мак-/-мок-, пропускающий/не пропускающий влагу), кОманда (словарное) — везде О. 2) отвАрить картофель (ва́рит), обогАщение (бога́тый), излАгать (-лаг-/-лож-, есть -а-) — везде А. 3) вытЕреть (-тир-/-тер-, нет -а-), инЕем (словарное «иней»), развЕваются на ветру (ве́ять) — везде Е. 4) поднИмать (-ним-/-ня-, есть -а-), инжЕнер (словарное), пЕтербургский (словарное). 5) цЫганский (исключение), панцИрь (И после Ц в корне), цЫплёнок (исключение).',
hint: 'В 1-м ряду «вырОвнять дыхание» (сделать ровным) и «непромОкаемый» (не пропускающий влагу) пишутся через О.',
},
{
id: 'ege-9-row-base-23',
type: 'ege_row_spelling',
difficulty: 'base',
kimTaskNumber: 9,
topicTag: 'ЕГЭ · Задание 9',
prompt: OFFICIAL_ROW_INSTRUCTION,
rows: [
{
rowNumber: 1,
words: [
{ template: 'разб..гатеть', expectedLetter: 'о' },
{ template: '(молодая) пор..сль (кустов)', expectedLetter: 'о' },
{ template: 'провозгл..шать', expectedLetter: 'а' },
],
},
{
rowNumber: 2,
words: [
{ template: 'поч..тать (старших)', expectedLetter: 'и' },
{ template: 'зап..вать (водой)', expectedLetter: 'и' },
{ template: 'усм..рённый', expectedLetter: 'и' },
],
},
{
rowNumber: 3,
words: [
{ template: 'рац..ональный', expectedLetter: 'и' },
{ template: 'ц..ганский', expectedLetter: 'ы' },
{ template: 'ц..трусовые (плоды)', expectedLetter: 'и' },
],
},
{
rowNumber: 4,
words: [
{ template: 'выт..реть (стол)', expectedLetter: 'е' },
{ template: 'выв..ска (на двери)', expectedLetter: 'е' },
{ template: 'ош..ломлённый', expectedLetter: 'е' },
],
},
{
rowNumber: 5,
words: [
{ template: 'б..ллетень', expectedLetter: 'ю' },
{ template: 'параш..т', expectedLetter: 'ю' },
{ template: '(члены) ж..ри', expectedLetter: 'ю' },
],
},
],
correctRows: Array.of(2, 4, 5),
ruleTitle: 'Правописание гласных в корне (Задание 9 ЕГЭ)',
ruleExplanation:
'Верные ряды — 245. 1) разбОгатеть (бога́тый), порОсль (корень -рос-), провозглАшать (глас). 2) почИтать старших (-чит-/-чет-, есть -а-), запИвать водой (пить), усмИрённый (сми́рный) — везде И. 3) рацИональный (И после Ц), цЫганский (исключение), цИтрусовые (И после Ц). 4) вытЕреть (-тир-/-тер-, нет -а-), вывЕска (ве́шать), ошЕломлённый (словарное) — везде Е. 5) бЮллетень, парашЮт, жЮри (заимствованные слова-исключения с Ю после Л и шипящих) — везде Ю.',
hint: 'В 5-м ряду собраны заимствованные слова-исключения, которые пишутся с буквой Ю: «бЮллетень», «парашЮт», «жЮри».',
},
{
id: 'ege-9-row-base-24',
type: 'ege_row_spelling',
difficulty: 'base',
kimTaskNumber: 9,
topicTag: 'ЕГЭ · Задание 9',
prompt: OFFICIAL_ROW_INSTRUCTION,
rows: [
{
rowNumber: 1,
words: [
{ template: 'сп..ртакиада', expectedLetter: 'а' },
{ template: 'прил..скать', expectedLetter: 'а' },
{ template: '(по) к..сательной', expectedLetter: 'а' },
],
},
{
rowNumber: 2,
words: [
{ template: 'кап..шон', expectedLetter: 'ю' },
{ template: 'ж..ри', expectedLetter: 'ю' },
{ template: 'брош..ровать', expectedLetter: 'ю' },
],
},
{
rowNumber: 3,
words: [
{ template: 'верм..шель', expectedLetter: 'и' },
{ template: 'экстр..мальный', expectedLetter: 'е' },
{ template: 'бл..стательный (успех)', expectedLetter: 'и' },
],
},
{
rowNumber: 4,
words: [
{ template: 'м..нталитет', expectedLetter: 'е' },
{ template: 'ч..столюбивый', expectedLetter: 'е' },
{ template: 'выб..решь (тему)', expectedLetter: 'е' },
],
},
{
rowNumber: 5,
words: [
{ template: 'игн..рировать', expectedLetter: 'о' },
{ template: 'симп..тичный', expectedLetter: 'а' },
{ template: 'заг..релый', expectedLetter: 'о' },
],
},
],
correctRows: Array.of(1, 2, 4),
ruleTitle: 'Правописание гласных в корне (Задание 9 ЕГЭ)',
ruleExplanation:
'Верные ряды — 124. 1) спАртакиада (Спарта́к), прилАскать (ла́ска), по кАсательной (-кас-/-кос-, есть -а-) — везде А. 2) капЮшон, жЮри, брошЮровать (исключения с Ю после шипящих) — везде Ю. 3) вермИшель (словарное), экстрЕмальный (экстре́мум), блИстательный (-блист-/-блест-, есть -а-). 4) мЕнталитет (словарное), чЕстолюбивый (честь), выбЕрешь (-бир-/-бер-, нет -а-) — везде Е. 5) игнОрировать (словарное), симпАтичный (симпа́тия), загОрелый (безудар. -гор-).',
hint: 'В 3-м ряду проверьте слово «экстрЕмальный» (от «экстре́мум» — пишется Е, а не И).',
},
{
id: 'ege-9-row-base-25',
type: 'ege_row_spelling',
difficulty: 'base',
kimTaskNumber: 9,
topicTag: 'ЕГЭ · Задание 9',
prompt: OFFICIAL_ROW_INSTRUCTION,
rows: [
{
rowNumber: 1,
words: [
{ template: 'дир..жёр', expectedLetter: 'и' },
{ template: 'сп..шите (текст)', expectedLetter: 'и' },
{ template: 'выд..рать (страницу)', expectedLetter: 'и' },
],
},
{
rowNumber: 2,
words: [
{ template: 'п..лисадник', expectedLetter: 'а' },
{ template: 'ч..стота (пульса)', expectedLetter: 'а' },
{ template: 'оз..рение', expectedLetter: 'а' },
],
},
{
rowNumber: 3,
words: [
{ template: 'об..няние', expectedLetter: 'о' },
{ template: 'укр..щать (хищника)', expectedLetter: 'о' },
{ template: 'пл..вцы', expectedLetter: 'о' },
],
},
{
rowNumber: 4,
words: [
{ template: 'панц..рь', expectedLetter: 'и' },
{ template: 'ц..ганский', expectedLetter: 'ы' },
{ template: 'ц..клон', expectedLetter: 'и' },
],
},
{
rowNumber: 5,
words: [
{ template: 'инж..нер', expectedLetter: 'е' },
{ template: 'поч..татель (таланта)', expectedLetter: 'и' },
{ template: 'прим..рять (вещи)', expectedLetter: 'е' },
],
},
],
correctRows: Array.of(1, 2, 3),
ruleTitle: 'Правописание гласных в корне (Задание 9 ЕГЭ)',
ruleExplanation:
'Верные ряды — 123. 1) дирИжёр (словарное), спИшите текст (пи́шет), выдИрать (-дир-/-дер-, есть -а-) — везде И. 2) пАлисадник (словарное), чАстота пульса (ча́стый), озАрение (безудар. -зар-) — везде А. 3) обОняние (словарное), укрОщать (кро́ткий), плОвцы (исключение в -плав-/-плов-) — везде О. 4) панцИрь (И после Ц), цЫганский (исключение), цИклон (И после Ц). 5) инжЕнер (словарное), почИтатель (-чит-/-чет-, есть -а-), примЕрять вещи (приме́рка).',
hint: 'В 3-м ряду различайте словарные слова «обОняние» (через О) и «обАяние» (через А).',
},
{
id: 'ege-9-row-base-26',
type: 'ege_row_spelling',
difficulty: 'base',
kimTaskNumber: 9,
topicTag: 'ЕГЭ · Задание 9',
prompt: OFFICIAL_ROW_INSTRUCTION,
rows: [
{
rowNumber: 1,
words: [
{ template: 'аб..туриент', expectedLetter: 'и' },
{ template: 'соб..рательный (образ)', expectedLetter: 'и' },
{ template: 'словосоч..тание', expectedLetter: 'е' },
],
},
{
rowNumber: 2,
words: [
{ template: 'к..нонада', expectedLetter: 'а' },
{ template: 'предл..жение', expectedLetter: 'о' },
{ template: 'пром..чить (ноги)', expectedLetter: 'о' },
],
},
{
rowNumber: 3,
words: [
{ template: 'кор..фей', expectedLetter: 'и' },
{ template: 'ц..стерна', expectedLetter: 'и' },
{ template: 'ун..чтожить', expectedLetter: 'и' },
],
},
{
rowNumber: 4,
words: [
{ template: 'щ..лкнуть (пальцами)', expectedLetter: 'ё' },
{ template: 'ж..луди', expectedLetter: 'ё' },
{ template: '(ровный) ш..в', expectedLetter: 'о' },
],
},
{
rowNumber: 5,
words: [
{ template: 'м..раторий', expectedLetter: 'о' },
{ template: 'метаф..ра', expectedLetter: 'о' },
{ template: 'парад..ксальный', expectedLetter: 'о' },
],
},
],
correctRows: Array.of(3, 5),
ruleTitle: 'Правописание гласных в корне (Задание 9 ЕГЭ)',
ruleExplanation:
'Верные ряды — 35. 1) абИтуриент (словарное), собИрательный (-бир-/-бер-, есть -а-), словосочЕтание (исключение в -чит-/-чет-). 2) кАнонада (словарное), предлОжение (корень -лож-), промОчить ноги (-мак-/-мок-, пропустить влагу). 3) корИфей (словарное), цИстерна (И после Ц в корне), унИчтожить (словарное) — везде И. 4) щЁлкнуть (щелчок), жЁлуди (желудёвый), ровный шОв (исключение после шипящих). 5) мОраторий (словарное), метафОра (словарное), парадОксальный (парадо́кс) — везде О.',
hint: 'Вспомните слова-исключения «словосочЕтание» (в 1-м ряду) и «шОв» (в 4-м ряду).',
},
{
id: 'ege-9-row-base-27',
type: 'ege_row_spelling',
difficulty: 'base',
kimTaskNumber: 9,
topicTag: 'ЕГЭ · Задание 9',
prompt: OFFICIAL_ROW_INSTRUCTION,
rows: [
{
rowNumber: 1,
words: [
{ template: 'ув..дание (листьев)', expectedLetter: 'я' },
{ template: 'тр..сина', expectedLetter: 'я' },
{ template: 'ос..зание (ощущение)', expectedLetter: 'я' },
],
},
{
rowNumber: 2,
words: [
{ template: 'ст..пендия', expectedLetter: 'и' },
{ template: '(походить на) прив..дение', expectedLetter: 'и' },
{ template: 'нач..нать', expectedLetter: 'и' },
],
},
{
rowNumber: 3,
words: [
{ template: 'пол..мичный', expectedLetter: 'е' },
{ template: 'пон..мание', expectedLetter: 'и' },
{ template: 'присм..рить (зверя)', expectedLetter: 'и' },
],
},
{
rowNumber: 4,
words: [
{ template: '(местные) ст..рожилы', expectedLetter: 'а' },
{ template: 'иск..са', expectedLetter: 'о' },
{ template: 'оп..лчение', expectedLetter: 'о' },
],
},
{
rowNumber: 5,
words: [
{ template: 'ц..вилизация', expectedLetter: 'и' },
{ template: 'ц..ганский', expectedLetter: 'ы' },
{ template: 'ц..тата', expectedLetter: 'и' },
],
},
],
correctRows: Array.of(1, 2),
ruleTitle: 'Правописание гласных в корне (Задание 9 ЕГЭ)',
ruleExplanation:
'Верные ряды — 12. 1) увЯдание (вя́нет), трЯсина (тря́ска), осЯзание (словарное) — везде Я. 2) стИпендия (словарное), привИдение (ви́деть), начИнать (-чин-/-ча-, есть -а-) — везде И. 3) полЕмичный (поле́мика), понИмание (-ним-/-ня-, есть -а-), присмИрить зверя (сми́рный). 4) стАрожилы (ста́рый житель), искОса (ко́со), опОлчение (полк). 5) цИвилизация (И после Ц), цЫганский (исключение), цИтата (И после Ц).',
hint: 'В 4-м ряду слово «стАрожилы» (давние жители) проверяется словом «ста́рый», а «привИдение» (во 2-м ряду) — словом «ви́деть».',
  },
  {
    id: 'ege-9-row-base-28',
    type: 'ege_row_spelling',
    difficulty: 'base',
    kimTaskNumber: 9,
    topicTag: 'ЕГЭ · Задание 9',
    prompt: OFFICIAL_ROW_INSTRUCTION,
    rows: [
      {
        rowNumber: 1,
        words: [
          { template: 'зад..ржать', expectedLetter: 'е' },
          { template: '(электрическое) осв..щение', expectedLetter: 'е' },
          { template: 'сож..ление', expectedLetter: 'а' },
        ],
      },
      {
        rowNumber: 2,
        words: [
          { template: 'р..скошный', expectedLetter: 'о' },
          { template: 'пл..вчиха', expectedLetter: 'о' },
          { template: 'г..ремыка', expectedLetter: 'о' },
        ],
      },
      {
        rowNumber: 3,
        words: [
          { template: 'р..систый', expectedLetter: 'о' },
          { template: 'выр..внять (стены)', expectedLetter: 'о' },
          { template: 'п..лисадник', expectedLetter: 'а' },
        ],
      },
      {
        rowNumber: 4,
        words: [
          { template: 'пон..мать', expectedLetter: 'и' },
          { template: 'ум..рать (на родине)', expectedLetter: 'и' },
          { template: 'ст..лист', expectedLetter: 'и' },
        ],
      },
      {
        rowNumber: 5,
        words: [
          { template: 'поб..дить', expectedLetter: 'е' },
          { template: 'пом..риться (с другом)', expectedLetter: 'и' },
          { template: 'ш..ренга', expectedLetter: 'е' },
        ],
      },
    ],
    correctRows: Array.of(2, 4),
    ruleTitle: 'Правописание гласных в корне (Задание 9 ЕГЭ)',
    ruleExplanation:
      'Верные ряды — 24. 1) задЕржать (де́ржит), освЕщение (свет), сожАление (жа́лость). 2) рОскошный (ро́скошь), плОвчиха (исключение в -плав-/-плов-), гОремыка (безудар. -гор-) — везде О. 3) рОсистый (ро́сы), вырОвнять стены (-равн-/-ровн-, сделать ровными), пАлисадник (словарное). 4) понИмать (-ним-/-ня-, есть -а-), умИрать (-мир-/-мер-, есть -а-), стИлист (стиль) — везде И. 5) побЕдить (побе́да), помИриться (мир), шЕренга (словарное).',
    hint: 'В 2-м ряду вспомните исключение «плОвчиха» и безударный корень -гор- в слове «гОремыка».',
  },
  {
    id: 'ege-9-row-base-29',
    type: 'ege_row_spelling',
    difficulty: 'base',
    kimTaskNumber: 9,
    topicTag: 'ЕГЭ · Задание 9',
    prompt: OFFICIAL_ROW_INSTRUCTION,
    rows: [
      {
        rowNumber: 1,
        words: [
          { template: 'ур..вновесить', expectedLetter: 'а' },
          { template: 'з..рница', expectedLetter: 'а' },
          { template: '(по) к..сательной', expectedLetter: 'а' },
        ],
      },
      {
        rowNumber: 2,
        words: [
          { template: 'прит..реться', expectedLetter: 'е' },
          { template: 'ут..шение', expectedLetter: 'е' },
          { template: 'увл..кательный', expectedLetter: 'е' },
        ],
      },
      {
        rowNumber: 3,
        words: [
          { template: 'налогообл..жение', expectedLetter: 'о' },
          { template: 'возг..рание', expectedLetter: 'о' },
          { template: 'тр..фарет', expectedLetter: 'а' },
        ],
      },
      {
        rowNumber: 4,
        words: [
          { template: 'ун..верситет', expectedLetter: 'и' },
          { template: 'зан..мательный', expectedLetter: 'и' },
          { template: 'ум..лительно', expectedLetter: 'и' },
        ],
      },
      {
        rowNumber: 5,
        words: [
          { template: 'скр..пач', expectedLetter: 'и' },
          { template: 'заст..лить', expectedLetter: 'е' },
          { template: 'сат..рический', expectedLetter: 'и' },
        ],
      },
    ],
    correctRows: Array.of(1, 2, 4),
    ruleTitle: 'Правописание гласных в корне (Задание 9 ЕГЭ)',
    ruleExplanation:
      'Верные ряды — 124. 1) урАвновесить (-равн-/-ровн-, сделать равным), зАрница (безудар. -зар-), по кАсательной (-кас-/-кос-, есть -а-) — везде А. 2) притЕреться (-тир-/-тер-, нет -а-), утЕшение (те́шить), увлЕкательный (увлёкся) — везде Е. 3) налогооблОжение (корень -лож-), возгОрание (безудар. -гор-), трАфарет (словарное). 4) унИверситет (словарное), занИмательный (-ним-/-ня-, есть -а-), умИлительно (ми́лый) — везде И. 5) скрИпач (скрип), застЕлить (-стил-/-стел-, нет -а-), сатИрический (сати́ра).',
    hint: 'В 5-м ряду в слове «застЕлить» нет суффикса -а-, поэтому в корне пишется буква Е.',
  },
  {
    id: 'ege-9-row-base-30',
    type: 'ege_row_spelling',
    difficulty: 'base',
    kimTaskNumber: 9,
    topicTag: 'ЕГЭ · Задание 9',
    prompt: OFFICIAL_ROW_INSTRUCTION,
    rows: [
      {
        rowNumber: 1,
        words: [
          { template: 'б..речь', expectedLetter: 'е' },
          { template: 'увл..каться', expectedLetter: 'е' },
          { template: 'ц..нтральный', expectedLetter: 'е' },
        ],
      },
      {
        rowNumber: 2,
        words: [
          { template: 'раз..бщённый', expectedLetter: 'о' },
          { template: 'распол..гаться', expectedLetter: 'а' },
          { template: 'г..лактика', expectedLetter: 'а' },
        ],
      },
      {
        rowNumber: 3,
        words: [
          { template: 'экз..менатор', expectedLetter: 'а' },
          { template: 'заг..дать', expectedLetter: 'а' },
          { template: 'р..скошный', expectedLetter: 'о' },
        ],
      },
      {
        rowNumber: 4,
        words: [
          { template: 'оч..щение', expectedLetter: 'и' },
          { template: 'осв..жительный', expectedLetter: 'е' },
          { template: 'непост..жимый', expectedLetter: 'и' },
        ],
      },
      {
        rowNumber: 5,
        words: [
          { template: 'напр..вление', expectedLetter: 'а' },
          { template: 'вл..делец', expectedLetter: 'а' },
          { template: 'уст..ревший', expectedLetter: 'а' },
        ],
      },
    ],
    correctRows: Array.of(1, 5),
    ruleTitle: 'Правописание гласных в корне (Задание 9 ЕГЭ)',
    ruleExplanation:
      'Верные ряды — 15. 1) бЕречь (берёг), увлЕкаться (увлёкся), цЕнтральный (центр) — везде Е. 2) разОбщённый (о́бщий), располАгаться (-лаг-/-лож-, есть -а-), гАлактика (словарное). 3) экзАменатор (экза́мен), загАдать (зага́дка), рОскошный (ро́скошь). 4) очИщение (чи́стый), освЕжительный (све́жий), непостИжимый (пости́гнуть). 5) напрАвление (напра́вить), влАделец (власть), устАревший (ста́рый) — везде А.',
    hint: 'Подберите проверочные слова в 5-м ряду: «напра́вить», «власть», «ста́рый».',
  },
  {
    id: 'ege-9-row-base-31',
    type: 'ege_row_spelling',
    difficulty: 'base',
    kimTaskNumber: 9,
    topicTag: 'ЕГЭ · Задание 9',
    prompt: OFFICIAL_ROW_INSTRUCTION,
    rows: [
      {
        rowNumber: 1,
        words: [
          { template: 'оф..цер', expectedLetter: 'и' },
          { template: 'поч..татель', expectedLetter: 'и' },
          { template: 'прокл..нать', expectedLetter: 'и' },
        ],
      },
      {
        rowNumber: 2,
        words: [
          { template: 'аб..немент', expectedLetter: 'о' },
          { template: 'к..нфорка', expectedLetter: 'о' },
          { template: 'предпол..гать', expectedLetter: 'а' },
        ],
      },
      {
        rowNumber: 3,
        words: [
          { template: 'зам..реть (от восторга)', expectedLetter: 'е' },
          { template: 'бл..стеть', expectedLetter: 'е' },
          { template: 'б..реговой (патруль)', expectedLetter: 'е' },
        ],
      },
      {
        rowNumber: 4,
        words: [
          { template: 'п..риод', expectedLetter: 'е' },
          { template: 'скр..петь (на морозе)', expectedLetter: 'и' },
          { template: '(ударился) оз..мь', expectedLetter: 'е' },
        ],
      },
      {
        rowNumber: 5,
        words: [
          { template: 'бахр..ма', expectedLetter: 'о' },
          { template: 'оз..рённый', expectedLetter: 'а' },
          { template: 'нак..лить (докрасна)', expectedLetter: 'а' },
        ],
      },
    ],
    correctRows: Array.of(1, 3),
    ruleTitle: 'Правописание гласных в корне (Задание 9 ЕГЭ)',
    ruleExplanation:
      'Верные ряды — 13. 1) офИцер (словарное), почИтатель (-чит-/-чет-, есть -а-), проклИнать (-клин-/-кля-, есть -а-) — везде И. 2) абОнемент (словарное), кОнфорка (словарное), предполАгать (-лаг-/-лож-, есть -а-). 3) замЕреть (-мир-/-мер-, нет -а-), блЕстеть (-блест-/-блист-, нет -а-), бЕреговой (бе́рег) — везде Е. 4) пЕриод (словарное), скрИпеть (скрип), о́зЕмь (зе́мли). 5) бахрОма (словарное), озАрённый (безудар. -зар-), накАлить (нака́л).',
    hint: 'В 1-м ряду в словах «почИтатель» и «проклИнать» работает правило чередования с суффиксом -а-.',
  },
  {
    id: 'ege-9-row-base-32',
    type: 'ege_row_spelling',
    difficulty: 'base',
    kimTaskNumber: 9,
    topicTag: 'ЕГЭ · Задание 9',
    prompt: OFFICIAL_ROW_INSTRUCTION,
    rows: [
      {
        rowNumber: 1,
        words: [
          { template: 'обж..ра', expectedLetter: 'о' },
          { template: 'бесш..вные (соединения)', expectedLetter: 'о' },
          { template: 'ж..нглёр', expectedLetter: 'о' },
        ],
      },
      {
        rowNumber: 2,
        words: [
          { template: 'ск..сить (траву)', expectedLetter: 'о' },
          { template: 'г..ризонт', expectedLetter: 'о' },
          { template: 'обм..кнуть (в воду)', expectedLetter: 'а' },
        ],
      },
      {
        rowNumber: 3,
        words: [
          { template: 'л..гичность', expectedLetter: 'о' },
          { template: 'сп..койный', expectedLetter: 'о' },
          { template: 'оз..рной (ветерок)', expectedLetter: 'о' },
        ],
      },
      {
        rowNumber: 4,
        words: [
          { template: 'акв..марин', expectedLetter: 'а' },
          { template: 'м..жор', expectedLetter: 'а' },
          { template: 'к..тастрофа', expectedLetter: 'а' },
        ],
      },
      {
        rowNumber: 5,
        words: [
          { template: 'сж..гать', expectedLetter: 'и' },
          { template: 'разв..вается (на ветру)', expectedLetter: 'е' },
          { template: 'усм..рять (хищника)', expectedLetter: 'и' },
        ],
      },
    ],
    correctRows: Array.of(1, 3, 4),
    ruleTitle: 'Правописание гласных в корне (Задание 9 ЕГЭ)',
    ruleExplanation:
      'Верные ряды — 134. 1) обжОра (исключение), бесшОвные (шов — исключение), жОнглёр (заимств. словарное) — везде О. 2) скОсить (ко́сит), гОризонт (словарное), обмАкнуть в воду (-мак-/-мок-, погружать в жидкость). 3) лОгичность (ло́гика), спОкойный (словарное), озОрной (зо́рька) — везде О. 4) аквАмарин (аква́риум), мАжор (словарное), кАтастрофа (словарное) — везде А. 5) сжИгать (-жиг-/-жег-, есть -а-), развЕвается на ветру (ве́ять), усмИрять (сми́рный).',
    hint: 'В 1-м ряду все три слова после шипящих пишутся с буквой О («обжОра», «бесшОвные», «жОнглёр»).',
  },
  {
    id: 'ege-9-row-base-33',
    type: 'ege_row_spelling',
    difficulty: 'base',
    kimTaskNumber: 9,
    topicTag: 'ЕГЭ · Задание 9',
    prompt: OFFICIAL_ROW_INSTRUCTION,
    rows: [
      {
        rowNumber: 1,
        words: [
          { template: 'соб..рать', expectedLetter: 'и' },
          { template: 'г..роический', expectedLetter: 'е' },
          { template: 'тр..вога', expectedLetter: 'е' },
        ],
      },
      {
        rowNumber: 2,
        words: [
          { template: 'происх..дить', expectedLetter: 'о' },
          { template: 'к..смонавт', expectedLetter: 'о' },
          { template: 'прик..сновение', expectedLetter: 'о' },
        ],
      },
      {
        rowNumber: 3,
        words: [
          { template: 'укр..пление', expectedLetter: 'е' },
          { template: 'соч..тание', expectedLetter: 'е' },
          { template: 'в..теранский', expectedLetter: 'е' },
        ],
      },
      {
        rowNumber: 4,
        words: [
          { template: 'изв..ниться', expectedLetter: 'и' },
          { template: 'вп..чатление', expectedLetter: 'е' },
          { template: 'в..ртуальный', expectedLetter: 'и' },
        ],
      },
      {
        rowNumber: 5,
        words: [
          { template: 'пл..вчиха', expectedLetter: 'о' },
          { template: 'утр..мбовать', expectedLetter: 'а' },
          { template: 'р..стение', expectedLetter: 'а' },
        ],
      },
    ],
    correctRows: Array.of(2, 3),
    ruleTitle: 'Правописание гласных в корне (Задание 9 ЕГЭ)',
    ruleExplanation:
      'Верные ряды — 23. 1) собИрать (-бир-/-бер-, есть -а-), гЕроический (геро́й), трЕвога (словарное). 2) происхОдить (происхо́дит), кОсмонавт (ко́смос), прикОсновение (-кас-/-кос-, нет -а-) — везде О. 3) укрЕпление (кре́пкий), сочЕтание (исключение в -чит-/-чет-), вЕтеранский (словарное) — везде Е. 4) извИниться (пови́нный), впЕчатление (словарное), вИртуальный (словарное). 5) плОвчиха (исключение), утрАмбовать (тра́мбовка), рАстение (корень -раст-).',
    hint: 'В 3-м ряду вспомните слово-исключение «сочЕтание», которое пишется с буквой Е, несмотря на суффикс -а-.',
  },
  {
    id: 'ege-9-row-base-34',
    type: 'ege_row_spelling',
    difficulty: 'base',
    kimTaskNumber: 9,
    topicTag: 'ЕГЭ · Задание 9',
    prompt: OFFICIAL_ROW_INSTRUCTION,
    rows: [
      {
        rowNumber: 1,
        words: [
          { template: 'разм..шать', expectedLetter: 'е' },
          { template: 'зап..реть', expectedLetter: 'е' },
          { template: 'инт..ллигент', expectedLetter: 'е' },
        ],
      },
      {
        rowNumber: 2,
        words: [
          { template: 'зап..тевать', expectedLetter: 'о' },
          { template: 'к..ллекция', expectedLetter: 'о' },
          { template: 'р..стовщик', expectedLetter: 'о' },
        ],
      },
      {
        rowNumber: 3,
        words: [
          { template: 'кл..ссический', expectedLetter: 'а' },
          { template: 'пл..вец', expectedLetter: 'о' },
          { template: 'во..бражать', expectedLetter: 'о' },
        ],
      },
      {
        rowNumber: 4,
        words: [
          { template: 'в..негрет', expectedLetter: 'и' },
          { template: 'разв..вать (способности)', expectedLetter: 'и' },
          { template: 'св..ла (ребёнка по лестнице)', expectedLetter: 'е' },
        ],
      },
      {
        rowNumber: 5,
        words: [
          { template: 'к..мпания (друзей)', expectedLetter: 'о' },
          { template: 'непром..каемый (плащ)', expectedLetter: 'о' },
          { template: 'в..кзал', expectedLetter: 'о' },
        ],
      },
    ],
    correctRows: Array.of(1, 2, 5),
    ruleTitle: 'Правописание гласных в корне (Задание 9 ЕГЭ)',
    ruleExplanation:
      'Верные ряды — 125. 1) размЕшать (разме́шивать), запЕреть (-пир-/-пер-, нет -а-), интЕллигент (словарное) — везде Е. 2) запОтевать (пот), кОллекция (словарное), рОстовщик (исключение в -раст-/-рос-) — везде О. 3) клАссический (кла́ссика), плОвец (исключение), воОбражать (о́браз). 4) вИнегрет (словарное), развИвать способности (разви́тие), свЕла по лестнице (свёл). 5) кОмпания друзей (словарное), непромОкаемый плащ (-мак-/-мок-, не пропускающий влагу), вОкзал (словарное) — везде О.',
    hint: 'В 5-м ряду различайте «кОмпанию» (группу друзей — через О) и «кАмпанию» (мероприятие — через А).',
  },
  {
    id: 'ege-9-row-base-35',
    type: 'ege_row_spelling',
    difficulty: 'base',
    kimTaskNumber: 9,
    topicTag: 'ЕГЭ · Задание 9',
    prompt: OFFICIAL_ROW_INSTRUCTION,
    rows: [
      {
        rowNumber: 1,
        words: [
          { template: 'выгл..деть', expectedLetter: 'я' },
          { template: 'разр..дить (атмосферу в коллективе)', expectedLetter: 'я' },
          { template: 'м..теж', expectedLetter: 'я' },
        ],
      },
      {
        rowNumber: 2,
        words: [
          { template: 'р..весник', expectedLetter: 'о' },
          { template: 'нав..ждение', expectedLetter: 'а' },
          { template: 'анн..тация', expectedLetter: 'о' },
        ],
      },
      {
        rowNumber: 3,
        words: [
          { template: 'заб..рать', expectedLetter: 'и' },
          { template: 'ч..столюбие', expectedLetter: 'е' },
          { template: 'в..рмишель', expectedLetter: 'и' },
        ],
      },
      {
        rowNumber: 4,
        words: [
          { template: 'д..мократ', expectedLetter: 'е' },
          { template: 'ун..кальный', expectedLetter: 'и' },
          { template: 'зап..реть (дверь)', expectedLetter: 'е' },
        ],
      },
      {
        rowNumber: 5,
        words: [
          { template: 'оп..здать', expectedLetter: 'о' },
          { template: 'прик..снуться', expectedLetter: 'о' },
          { template: 'к..лдун', expectedLetter: 'о' },
        ],
      },
    ],
    correctRows: Array.of(1, 5),
    ruleTitle: 'Правописание гласных в корне (Задание 9 ЕГЭ)',
    ruleExplanation:
      'Верные ряды — 15. 1) выглЯдеть (взгляд), разрЯдить атмосферу (разря́дка), мЯтеж (словарное) — везде Я. 2) рОвесник (исключение в -равн-/-ровн-), навАждение (словарное), аннОтация (словарное). 3) забИрать (-бир-/-бер-, есть -а-), чЕстолюбие (честь), вЕрмишель (словарное). 4) дЕмократ (словарное), унИкальный (у́никум), запЕреть дверь (-пир-/-пер-, нет -а-). 5) опОздать (по́здно), прикОснуться (-кас-/-кос-, нет -а-), кОлдун (словарное) — везде О.',
    hint: 'В 1-м ряду «разрЯдить атмосферу» означает «снять напряжение» (проверочное слово — «разря́дка», пишется Я).',
  },
  {
    id: 'ege-9-row-base-36',
    type: 'ege_row_spelling',
    difficulty: 'base',
    kimTaskNumber: 9,
    topicTag: 'ЕГЭ · Задание 9',
    prompt: OFFICIAL_ROW_INSTRUCTION,
    rows: [
      {
        rowNumber: 1,
        words: [
          { template: 'пл..нительный', expectedLetter: 'е' },
          { template: 'отб..рает', expectedLetter: 'и' },
          { template: 'м..нералы', expectedLetter: 'и' },
        ],
      },
      {
        rowNumber: 2,
        words: [
          { template: 'г..рделиво', expectedLetter: 'о' },
          { template: 'неук..снительно', expectedLetter: 'о' },
          { template: 'к..лыхать', expectedLetter: 'о' },
        ],
      },
      {
        rowNumber: 3,
        words: [
          { template: 'укр..щать (тигра)', expectedLetter: 'о' },
          { template: 'пл..вучий', expectedLetter: 'а' },
          { template: 'г..зон', expectedLetter: 'а' },
        ],
      },
      {
        rowNumber: 4,
        words: [
          { template: 'осл..пительно', expectedLetter: 'е' },
          { template: 'прив..дение (в исполнение)', expectedLetter: 'е' },
          { template: 'б..рёзовый', expectedLetter: 'е' },
        ],
      },
      {
        rowNumber: 5,
        words: [
          { template: 'выр..сла', expectedLetter: 'о' },
          { template: 'претв..рить', expectedLetter: 'о' },
{ template: 'игн..рировать', expectedLetter: 'о' },
],
},
],
correctRows: Array.of(2, 4, 5),
ruleTitle: 'Правописание гласных в корне (Задание 9 ЕГЭ)',
ruleExplanation:
'Верные ряды — 245. 1) плЕнительный (плен), отбИрает (-бир-/-бер-, есть -а-), мИнералы (словарное). 2) гОрделиво (го́рдый), неукОснительно (-кас-/-кос-, нет -а-), кОлыхать (колы́шет) — везде О. 3) укрОщать тигра (кро́ткий), плАвучий (безудар. -плав-), гАзон (словарное). 4) ослЕпительно (слеп), привЕдение в исполнение (привёл), бЕрёзовый (словарное) — везде Е. 5) вырОсла (корень -рос-), претвОрить (безудар. -твар-/-твор-), игнОрировать (словарное) — везде О.',
hint: 'В 4-м ряду обратите внимание на контекст: «привЕдение в исполнение» проверяется глаголом «привёл».',
},
{
id: 'ege-9-row-base-37',
type: 'ege_row_spelling',
difficulty: 'base',
kimTaskNumber: 9,
topicTag: 'ЕГЭ · Задание 9',
prompt: OFFICIAL_ROW_INSTRUCTION,
rows: [
{
rowNumber: 1,
words: [
{ template: 'р..птать', expectedLetter: 'о' },
{ template: 'заг..релый', expectedLetter: 'о' },
{ template: 'выр..зительный', expectedLetter: 'а' },
],
},
{
rowNumber: 2,
words: [
{ template: 'прин..мать', expectedLetter: 'и' },
{ template: 'разв..вать (воображение)', expectedLetter: 'и' },
{ template: 'кор..фей', expectedLetter: 'и' },
],
},
{
rowNumber: 3,
words: [
{ template: 'посв..щать (учителю)', expectedLetter: 'я' },
{ template: 'разр..дить (посевы)', expectedLetter: 'е' },
{ template: 'прот..рать (полы)', expectedLetter: 'и' },
],
},
{
rowNumber: 4,
words: [
{ template: '(всю ночь) ст..рожил', expectedLetter: 'о' },
{ template: 'р..внина', expectedLetter: 'а' },
{ template: 'гр..мадный', expectedLetter: 'о' },
],
},
{
rowNumber: 5,
words: [
{ template: 'зам..реть (от восторга)', expectedLetter: 'е' },
{ template: 'соч..таться', expectedLetter: 'е' },
{ template: 'в..нтилятор', expectedLetter: 'е' },
],
},
],
correctRows: Array.of(2, 5),
ruleTitle: 'Правописание гласных в корне (Задание 9 ЕГЭ)',
ruleExplanation:
'Верные ряды — 25. 1) рОптать (ро́пот), загОрелый (безудар. -гор-), вырАзительный (словарное). 2) принИмать (-ним-/-ня-, есть -а-), развИвать воображение (разви́тие), корИфей (словарное) — везде И. 3) посвЯщать учителю (свя́то), разрЕдить посевы (ре́дкий), протИрать (-тир-/-тер-, есть -а-). 4) стОрожил всю ночь (сто́рож), рАвнина (исключение в -равн-/-ровн-), грОмадный (огро́мный). 5) замЕреть (-мир-/-мер-, нет -а-), сочЕтаться (исключение), вЕнтилятор (словарное) — везде Е.',
hint: 'В 4-м ряду слово «стОрожил» в значении «охранял всю ночь» проверяется словом «сто́рож» (пишется О).',
},
{
id: 'ege-9-row-base-38',
type: 'ege_row_spelling',
difficulty: 'base',
kimTaskNumber: 9,
topicTag: 'ЕГЭ · Задание 9',
prompt: OFFICIAL_ROW_INSTRUCTION,
rows: [
{
rowNumber: 1,
words: [
{ template: 'зап..рать (на замок)', expectedLetter: 'и' },
{ template: 'д..кларация', expectedLetter: 'е' },
{ template: 'велос..педный', expectedLetter: 'и' },
],
},
{
rowNumber: 2,
words: [
{ template: 'р..внинный', expectedLetter: 'а' },
{ template: 'прод..лжение', expectedLetter: 'о' },
{ template: 'г..рячий', expectedLetter: 'о' },
],
},
{
rowNumber: 3,
words: [
{ template: 'р..птать', expectedLetter: 'о' },
{ template: 'пок..сившийся (забор)', expectedLetter: 'о' },
{ template: 'н..велла', expectedLetter: 'о' },
],
},
{
rowNumber: 4,
words: [
{ template: 'объед..нять', expectedLetter: 'и' },
{ template: 'в..стибюль', expectedLetter: 'е' },
{ template: 'л..леять', expectedLetter: 'е' },
],
},
{
rowNumber: 5,
words: [
{ template: 'отв..рить (картофель)', expectedLetter: 'а' },
{ template: '(пролетела) к..сатка', expectedLetter: 'а' },
{ template: 'пол..скать (ребёнка)', expectedLetter: 'а' },
],
},
],
correctRows: Array.of(3, 5),
ruleTitle: 'Правописание гласных в корне (Задание 9 ЕГЭ)',
ruleExplanation:
'Верные ряды — 35. 1) запИрать (-пир-/-пер-, есть -а-), дЕкларация (словарное), велосИпедный (словарное). 2) рАвнинный (от исключения равни́на), продОлжение (продо́лжить), гОрячий (словарное). 3) рОптать (ро́пот), покОсившийся забор (ко́со), нОвелла (словарное) — везде О. 4) объедИнять (еди́ный), вЕстибюль (словарное), лЕлеять (словарное). 5) отвАрить картофель (ва́рит), кАсатка (ласточка — от «каса́ться», ср. коса́тка — кит), полАскать ребёнка (ла́ска) — везде А.',
hint: 'В 5-м ряду обратите внимание на омофоны: «кАсатка» (птица ласточка, пишется с А) и «полАскать ребёнка» (от слова «ла́ска»).',
},
{
id: 'ege-9-row-base-39',
type: 'ege_row_spelling',
difficulty: 'base',
kimTaskNumber: 9,
topicTag: 'ЕГЭ · Задание 9',
prompt: OFFICIAL_ROW_INSTRUCTION,
rows: [
{
rowNumber: 1,
words: [
{ template: 'дел..катес', expectedLetter: 'и' },
{ template: 'соч..тать', expectedLetter: 'е' },
{ template: 'гал..рея', expectedLetter: 'е' },
],
},
{
rowNumber: 2,
words: [
{ template: 'нам..чить', expectedLetter: 'о' },
{ template: 'пор..вну', expectedLetter: 'о' },
{ template: 'н..секомые', expectedLetter: 'а' },
],
},
{
rowNumber: 3,
words: [
{ template: 'огр..ждать', expectedLetter: 'а' },
{ template: 'г..рмония', expectedLetter: 'а' },
{ template: 'р..сток', expectedLetter: 'о' },
],
},
{
rowNumber: 4,
words: [
{ template: 'ув..дать (от жары)', expectedLetter: 'я' },
{ template: 'неисс..каемый', expectedLetter: 'я' },
{ template: 'напр..жение', expectedLetter: 'я' },
],
},
{
rowNumber: 5,
words: [
{ template: 'п..лезный', expectedLetter: 'о' },
{ template: '(костюм) на выр..ст', expectedLetter: 'о' },
{ template: 'г..рмон', expectedLetter: 'о' },
],
},
],
correctRows: Array.of(4, 5),
ruleTitle: 'Правописание гласных в корне (Задание 9 ЕГЭ)',
ruleExplanation:
'Верные ряды — 45. 1) делИкатес (словарное), сочЕтать (исключение), галЕрея (словарное). 2) намОчить (-мак-/-мок-, пропустить влагу), порОвну (исключение в -равн-/-ровн-), нАсекомые (словарное). 3) огрАждать (огра́да), гАрмония (словарное), рОсток (исключение). 4) увЯдать от жары (вя́нет), неиссЯкаемый (исся́кнуть), напрЯжение (напря́чь) — везде Я. 5) пОлезный (по́льза), на вырОст (исключение в -раст-/-рос-), гОрмон (словарное) — везде О.',
hint: 'В 5-м ряду запомните слово-исключение из чередующихся корней -раст-/-рос-: «на вырОст» (пишется О).',
},
{
id: 'ege-9-row-base-40',
type: 'ege_row_spelling',
difficulty: 'base',
kimTaskNumber: 9,
topicTag: 'ЕГЭ · Задание 9',
prompt: OFFICIAL_ROW_INSTRUCTION,
rows: [
{
rowNumber: 1,
words: [
{ template: 'зап..рать (на замок)', expectedLetter: 'и' },
{ template: 'тр..петать', expectedLetter: 'е' },
{ template: 'ум..рла (вера)', expectedLetter: 'е' },
],
},
{
rowNumber: 2,
words: [
{ template: 'сотв..рить', expectedLetter: 'о' },
{ template: 'вопл..тить', expectedLetter: 'о' },
{ template: 'оз..рной (ребёнок)', expectedLetter: 'о' },
],
},
{
rowNumber: 3,
words: [
{ template: 'оз..рять', expectedLetter: 'а' },
{ template: '(костюм) на выр..ст', expectedLetter: 'о' },
{ template: 'выр..щенный', expectedLetter: 'а' },
],
},
{
rowNumber: 4,
words: [
{ template: 'заб..рать', expectedLetter: 'и' },
{ template: 'подм..тать (пол)', expectedLetter: 'е' },
{ template: 'вол..йбол', expectedLetter: 'е' },
],
},
{
rowNumber: 5,
words: [
{ template: '(разделить) пор..вну', expectedLetter: 'о' },
{ template: 'ар..матный', expectedLetter: 'о' },
{ template: 'Р..стов', expectedLetter: 'о' },
],
},
],
correctRows: Array.of(2, 5),
ruleTitle: 'Правописание гласных в корне (Задание 9 ЕГЭ)',
ruleExplanation:
'Верные ряды — 25. 1) запИрать (-пир-/-пер-, есть -а-), трЕпетать (тре́пет), умЕрла (-мир-/-мер-, нет -а-). 2) сотвОрить (безудар. -твар-/-твор-), воплОтить (плоть), озОрной (зо́рька) — везде О. 3) озАрять (безудар. -зар-), на вырОст (исключение), вырАщенный (корень -ращ-). 4) забИрать (-бир-/-бер-, есть -а-), подмЕтать (подмёл), волЕйбол (словарное). 5) порОвну (исключение), арОматный (словарное), РОстов (исключение в -раст-/-рос-) — везде О.',
hint: 'В 5-м ряду сразу два исключения из правил чередующихся корней: «порОвну» и «РОстов».',
},
{
id: 'ege-9-row-base-41',
type: 'ege_row_spelling',
difficulty: 'base',
kimTaskNumber: 9,
topicTag: 'ЕГЭ · Задание 9',
prompt: OFFICIAL_ROW_INSTRUCTION,
rows: [
{
rowNumber: 1,
words: [
{ template: 'неув..дающая (красота)', expectedLetter: 'я' },
{ template: '(век) Просв..щения', expectedLetter: 'е' },
{ template: 'кол..бание', expectedLetter: 'е' },
],
},
{
rowNumber: 2,
words: [
{ template: 'др..бить', expectedLetter: 'о' },
{ template: 'г..рделивый', expectedLetter: 'о' },
{ template: 'к..ричневый', expectedLetter: 'о' },
],
},
{
rowNumber: 3,
words: [
{ template: 'пр..стиж', expectedLetter: 'е' },
{ template: 'ч..столюбивый', expectedLetter: 'е' },
{ template: 'выч..тание', expectedLetter: 'и' },
],
},
{
rowNumber: 4,
words: [
{ template: 'л..гичный', expectedLetter: 'о' },
{ template: 'укр..щать (тигра)', expectedLetter: 'о' },
{ template: 'мгн..вение', expectedLetter: 'о' },
],
},
{
rowNumber: 5,
words: [
{ template: 'нач..нать', expectedLetter: 'и' },
{ template: 'бл..стательный', expectedLetter: 'и' },
{ template: 'ист..нный', expectedLetter: 'и' },
],
},
],
correctRows: Array.of(2, 4, 5),
ruleTitle: 'Правописание гласных в корне (Задание 9 ЕГЭ)',
ruleExplanation:
'Верные ряды — 245. 1) неувЯдающая (вя́нет), ПросвЕщения (свет), колЕбание (коле́блется). 2) дрОбить (дробь), гОрделивый (го́рдый), кОричневый (словарное) — везде О. 3) прЕстиж (словарное), чЕстолюбивый (честь), вычИтание (-чит-/-чет-, есть -а-). 4) лОгичный (ло́гика), укрОщать (кро́ткий), мгнОвение (словарное) — везде О. 5) начИнать (-чин-/-ча-, есть -а-), блИстательный (-блист-/-блест-, есть -а-), истИнный (словарное «и́стина») — везде И.',
hint: 'Проверьте словарные слова «кОричневый», «мгнОвение» и «истИнный».',
},
{
id: 'ege-9-row-base-42',
type: 'ege_row_spelling',
difficulty: 'base',
kimTaskNumber: 9,
topicTag: 'ЕГЭ · Задание 9',
prompt: OFFICIAL_ROW_INSTRUCTION,
rows: [
{
rowNumber: 1,
words: [
{ template: 'объ..вление', expectedLetter: 'я' },
{ template: 'выт..сненный (из толпы)', expectedLetter: 'е' },
{ template: 'п..ссимизм', expectedLetter: 'е' },
],
},
{
rowNumber: 2,
words: [
{ template: 'оп..реться', expectedLetter: 'е' },
{ template: '(жизнь их) св..ла', expectedLetter: 'е' },
{ template: 'приж..мать', expectedLetter: 'и' },
],
},
{
rowNumber: 3,
words: [
{ template: 'з..рница', expectedLetter: 'а' },
{ template: 'сл..гаемые (успеха)', expectedLetter: 'а' },
{ template: 'обн..жённый (лес)', expectedLetter: 'а' },
],
},
{
rowNumber: 4,
words: [
{ template: 'в..шнёвый', expectedLetter: 'и' },
{ template: 'посв..щение (в рыцари)', expectedLetter: 'я' },
{ template: '(белый) ин..й', expectedLetter: 'е' },
],
},
{
rowNumber: 5,
words: [
{ template: 'задр..жать', expectedLetter: 'о' },
{ template: 'Р..стислав', expectedLetter: 'о' },
{ template: 'к..лоссальный', expectedLetter: 'о' },
],
},
],
correctRows: Array.of(3, 5),
ruleTitle: 'Правописание гласных в корне (Задание 9 ЕГЭ)',
ruleExplanation:
'Верные ряды — 35. 1) объЯвление (я́вка), вытЕсненный (те́сно), пЕссимизм (словарное). 2) опЕреться (-пир-/-пер-, нет -а-), свЕла (свёл), прижИмать (-жим-/-жа-, есть -а-). 3) зАрница (безудар. -зар-), слАгаемые (-лаг-/-лож-, есть -а-), обнАжённый (наг) — везде А. 4) вИшнёвый (ви́шня), посвЯщение (свя́то), и́нЕй (словарное). 5) задрОжать (дрожь), РОстислав (исключение в -раст-/-рос-), кОлоссальный (словарное) — везде О.',
hint: 'В 5-м ряду вспомните имя-исключение «РОстислав» (пишется с О перед СТ).',
},
{
id: 'ege-9-row-base-43',
type: 'ege_row_spelling',
difficulty: 'base',
kimTaskNumber: 9,
topicTag: 'ЕГЭ · Задание 9',
prompt: OFFICIAL_ROW_INSTRUCTION,
rows: [
{
rowNumber: 1,
words: [
{ template: 'п..рашют', expectedLetter: 'а' },
{ template: '(посевная) к..мпания', expectedLetter: 'а' },
{ template: 'в..кцина', expectedLetter: 'а' },
],
},
{
rowNumber: 2,
words: [
{ template: 'с..мптом', expectedLetter: 'и' },
{ template: 'прид..раться', expectedLetter: 'и' },
{ template: 'соц..альный', expectedLetter: 'и' },
],
},
{
rowNumber: 3,
words: [
{ template: 'п..лемичный', expectedLetter: 'о' },
{ template: 'покл..ниться', expectedLetter: 'о' },
{ template: 'пр..вительство', expectedLetter: 'а' },
],
},
{
rowNumber: 4,
words: [
{ template: 'р..внобедренный (треугольник)', expectedLetter: 'а' },
{ template: 'об..яние', expectedLetter: 'а' },
{ template: 'прил..гать (усилия)', expectedLetter: 'а' },
],
},
{
rowNumber: 5,
words: [
{ template: 'г..потеза', expectedLetter: 'и' },
{ template: 'пал..садник', expectedLetter: 'и' },
{ template: 'инт..нсивный', expectedLetter: 'е' },
],
},
],
correctRows: Array.of(1, 2, 4),
ruleTitle: 'Правописание гласных в корне (Задание 9 ЕГЭ)',
ruleExplanation:
'Верные ряды — 124. 1) пАрашют (словарное), посевная кАмпания (мероприятие — через А), вАкцина (словарное) — везде А. 2) сИмптом (словарное), придИраться (-дир-/-дер-, есть -а-), соцИальный (И после Ц) — везде И. 3) пОлемичный (словарное), поклОниться (безудар. -клан-/-клон-), прАвительство (пра́вить). 4) рАвнобедренный (-равн-/-ровн-, равные бёдра), обАяние (словарное), прилАгать (-лаг-/-лож-, есть -а-) — везде А. 5) гИпотеза (словарное), палИсадник (словарное), интЕнсивный (инте́нс).',
hint: 'В 1-м ряду «посевная кАмпания» (мероприятие) пишется с А, а в 4-м — «рАвнобедренный» (равные стороны) тоже с А.',
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
        correctRows: Array.of(1, 3),
    ruleTitle: 'Правописание приставок (Задание 10 ЕГЭ · Хард)',
    ruleExplanation:
      'Верные ряды — 13. 1) прИстыдить, непрИступная (крепость), беспрИмерный — везде И. 2) отЫскать, постИндустриальный, заИнтересовать. 3) сниСхождение, иСколесить, раСценки — везде С перед глухими согласными. 4) непредсказуемый (пред-), отблеск (от-), подточить (под-). 5) нерассказанный (рас-), подоспел (подо-), наилучший (наи-).',
    hint: 'Обратите внимание на неизменяемые приставки (пред-, от-, под-, рас-, подо-, наи-) и правило И/Ы после приставок.',
  },
  {
    id: 'ege-10-row-base-2',
    type: 'ege_row_spelling',
    difficulty: 'base',
    kimTaskNumber: 10,
    topicTag: 'ЕГЭ · Задание 10',
    prompt: 'Укажите варианты ответов, в которых во всех словах одного ряда пропущена одна и та же буква. Запишите номера ответов.',
    rows: [
      {
        rowNumber: 1,
        words: [
          { template: 'сверх..дея', expectedLetter: 'и' },
          { template: 'под..скать', expectedLetter: 'ы' },
          { template: 'из..мать', expectedLetter: 'ы' },
        ],
      },
      {
        rowNumber: 2,
        words: [
          { template: 'пр..брежный', expectedLetter: 'и' },
          { template: 'пр..мудрый', expectedLetter: 'е' },
          { template: 'пр..ступить (к делу)', expectedLetter: 'и' },
        ],
      },
      {
        rowNumber: 3,
        words: [
          { template: 'меж..гровой', expectedLetter: 'и' },
          { template: 'мед..нститут', expectedLetter: 'и' },
          { template: 'дез..нформация', expectedLetter: 'и' },
        ],
      },
      {
        rowNumber: 4,
        words: [
          { template: 'бе..болезненно', expectedLetter: 'з' },
          { template: 'и..бавиться', expectedLetter: 'з' },
          { template: 'ра..жечь (костёр)', expectedLetter: 'з' },
        ],
      },
      {
        rowNumber: 5,
        words: [
          { template: 'вз..ерошить (волосы)', expectedLetter: 'ъ' },
          { template: 'неот..емлемая (часть)', expectedLetter: 'ъ' },
          { template: 'с..естной', expectedLetter: 'ъ' },
        ],
      },
    ],
    correctRows: [3, 4, 5],
    ruleTitle: 'Правописание приставок (Задание 10 ЕГЭ)',
    ruleExplanation: 'Верные ряды — 3, 4, 5. 3) межИгровой (после меж- буква И не меняется на Ы), медИнститут (после гласной), дезИнформация (после иноязычной приставки дез-). 4) беЗболезненно, иЗбавиться, раЗжечь (перед звонкими пишутся приставки на звонкие), 5) взЪерошить, неотЪемлемая, сЪестной (разделительный Ъ после приставок на согласную перед Е, Ё, Ю, Я). Ряд 1: сверхИдея (И), подЫскать (Ы), изЫмать (Ы). Ряд 2: прИбрежный (И), прЕмудрый (Е), прИступить (И). Ряд 4: беЗболезненно (З), иЗбавиться (З), раСжечь (С).',
    hint: 'Проверьте правило И/Ы после приставок (исключения для иноязычных приставок и меж-, сверх-), значения приставок ПРЕ-/ПРИ-, правило разделительного Ъ и правило приставок на -З/-С.'
  },
  {
    id: 'ege-10-row-base-3',
    type: 'ege_row_spelling',
    difficulty: 'base',
    kimTaskNumber: 10,
    topicTag: 'ЕГЭ · Задание 10',
    prompt: 'Укажите варианты ответов, в которых во всех словах одного ряда пропущена одна и та же буква. Запишите номера ответов.',
    rows: [
      {
        rowNumber: 1,
        words: [
          { template: 'от..бравший', expectedLetter: 'о' },
          { template: 'под..двинуть', expectedLetter: 'о' },
          { template: 'нед..работанный', expectedLetter: 'о' },
        ],
      },
      {
        rowNumber: 2,
        words: [
          { template: 'в..юга', expectedLetter: 'ь' },
          { template: 'в..ехать', expectedLetter: 'ъ' },
          { template: 'под..езд', expectedLetter: 'ъ' },
        ],
      },
      {
        rowNumber: 3,
        words: [
          { template: 'и..пуганный', expectedLetter: 'с' },
          { template: 'не..гибаемый', expectedLetter: 'с' },
          { template: 'бе..характерный', expectedLetter: 'с' },
        ],
      },
      {
        rowNumber: 4,
        words: [
          { template: 'беспр..станный', expectedLetter: 'е' },
          { template: '(камень) пр..ткновения', expectedLetter: 'е' },
          { template: 'пр..мудрость', expectedLetter: 'е' },
        ],
      },
      {
        rowNumber: 5,
        words: [
          { template: 'пред..юльский', expectedLetter: 'ы' },
          { template: 'без..скусный', expectedLetter: 'ы' },
          { template: 'меж..здательский', expectedLetter: 'и' },
        ],
      },
    ],
    correctRows: [1, 3, 4],
    ruleTitle: 'Правописание приставок (Задание 10 ЕГЭ)',
    ruleExplanation: 'Верные ряды — 1, 3, 4. 1) отОбравший, подОдвинуть, недОработанный - неизменяемые приставки, 3) иСпуганный, неСгибаемый, беСхарактерный. 4) беспрЕстанный, прЕткновения, прЕмудрость (приставка ПРЕ- в значении «очень» или близка к «пере-»). Ряд 1: Отобрать, подОдвинуть, недОработанный (приставки ОТ-, ПОДО-, НЕДО-). Ряд 3: иСпуганный, неСгибаемый, беСхарактерный (приставки на -С перед глухими). Ряд 5: предЪюльский (Ъ), безЫскусный (Ы), межИздательский (И).',
    hint: 'Обратите внимание на разделительный Ъ, значения приставок ПРЕ-/ПРИ-, а также на правило И/Ы после приставок.'
  },
  {
    id: 'ege-10-row-base-4',
    type: 'ege_row_spelling',
    difficulty: 'base',
    kimTaskNumber: 10,
    topicTag: 'ЕГЭ · Задание 10',
    prompt: 'Укажите варианты ответов, в которых во всех словах одного ряда пропущена одна и та же буква. Запишите номера ответов.',
    rows: [
      {
        rowNumber: 1,
        words: [
          { template: 'пре..полагать', expectedLetter: 'д' },
          { template: 'на..рёберный', expectedLetter: 'д' },
          { template: 'по..палить', expectedLetter: 'д' },
        ],
      },
      {
        rowNumber: 2,
        words: [
          { template: 'и..траченный', expectedLetter: 'с' },
          { template: 'ра..чищенный', expectedLetter: 'с' },
          { template: 'бе..хозный', expectedLetter: 'с' },
        ],
      },
      {
        rowNumber: 3,
        words: [
          { template: 'пр..ображённый', expectedLetter: 'е' },
          { template: 'пр..неприятный', expectedLetter: 'е' },
          { template: 'пр..града', expectedLetter: 'е' },
        ],
      },
      {
        rowNumber: 4,
        words: [
          { template: 'пост..ндустриальный', expectedLetter: 'и' },
          { template: 'из..сканность', expectedLetter: 'ы' },
          { template: 'под..тоженный', expectedLetter: 'ы' },
        ],
      },
      {
        rowNumber: 5,
        words: [
          { template: 'с..ёмщик', expectedLetter: 'ъ' },
          { template: 'суб..ект', expectedLetter: 'ъ' },
          { template: 'конс..ерж', expectedLetter: 'ь' },
        ],
      },
    ],
    correctRows: [1, 2, 3],
    ruleTitle: 'Правописание приставок (Задание 10 ЕГЭ)',
    ruleExplanation: 'Верные ряды — 1, 2, 3. 1) преДполагать, наДреберный, поДпалить, 2) иСтраченный, раСчищенный, беСхозный (приставки на -С перед глухими согласными). 3) прЕображённый (близко к «пере-»), прЕнеприятный (значение «очень»), прЕграда (близко к «пере-»). Ряд 1: преДполагать (пред-), наДрёберный (над-), поДпалить (под-). Ряд 4: постИндустриальный (иноязычная приставка), изЫсканность (Ы), подЫтоженный (Ы). Ряд 5: сЪёмщик (Ъ), субЪект (Ъ), консЬерж (Ь).',
    hint: 'Проверьте правописание приставок ПРЕ-/ПРИ-, приставок на -З/-С, а также разделительных Ъ и Ь.'
  },
  {
    id: 'ege-10-row-base-5',
    type: 'ege_row_spelling',
    difficulty: 'base',
    kimTaskNumber: 10,
    topicTag: 'ЕГЭ · Задание 10',
    prompt: 'Укажите варианты ответов, в которых во всех словах одного ряда пропущена одна и та же буква. Запишите номера ответов.',
    rows: [
      {
        rowNumber: 1,
        words: [
          { template: 'сверх..зящный', expectedLetter: 'и' },
          { template: 'под..тожить', expectedLetter: 'ы' },
          { template: 'вз..мание (штрафа)', expectedLetter: 'и' },
        ],
      },
      {
        rowNumber: 2,
        words: [
          { template: 'с..язвить', expectedLetter: 'ъ' },
          { template: 'об..яснение', expectedLetter: 'ъ' },
          { template: 'трёх..язычный', expectedLetter: 'ъ' },
        ],
      },
      {
        rowNumber: 3,
        words: [
          { template: 'непр..одолимый', expectedLetter: 'е' },
          { template: 'пр..даваться (мечтам)', expectedLetter: 'е' },
          { template: 'пр..успевающий', expectedLetter: 'е' },
        ],
      },
      {
        rowNumber: 4,
        words: [
          { template: 'бе..шовный', expectedLetter: 'с' },
          { template: 'во..противиться', expectedLetter: 'с' },
          { template: 'не..балансированный', expectedLetter: 'с' },
        ],
      },
      {
        rowNumber: 5,
        words: [
          { template: 'пр..отцы', expectedLetter: 'а' },
          { template: 'пр..редить', expectedLetter: 'о' },
          { template: 'пр..дедушка', expectedLetter: 'а' },
        ],
      },
    ],
    correctRows: [2, 3, 4],
    ruleTitle: 'Правописание приставок (Задание 10 ЕГЭ)',
    ruleExplanation: 'Верные ряды — 2, 4. 2) сЪязвить, обЪяснение, трёхЪязычный (разделительный Ъ после приставок на согласную перед Е, Ё, Ю, Я). 3) непрЕодолимый (=пере), предаваться (=отдаваться), преуспевающий (=быть очень успешным), 4) беСшовный, воСпротивиться, неСбалансированный (приставки на -С перед глухими согласными). Ряд 1: сверхИзящный (И), подЫтожить (Ы), взЫмание (Ы). Ряд 3: непрЕодолимый (Е), прЕдаваться (Е), прЕуспевающий (Е). Ряд 5: прАотцы (пра-), прОредить (про-), прАдедушка (пра-).',
    hint: 'Обратите внимание на приставки ПРЕ-/ПРИ-, правило И/Ы после приставок, а также приставки ПРА-/ПРО-.'
  },
  {
    id: 'ege-10-row-base-6',
    type: 'ege_row_spelling',
    difficulty: 'base',
    kimTaskNumber: 10,
    topicTag: 'ЕГЭ · Задание 10',
    prompt: 'Укажите варианты ответов, в которых во всех словах одного ряда пропущена одна и та же буква. Запишите номера ответов.',
    rows: [
      {
        rowNumber: 1,
        words: [
          { template: 'ра..чётливый', expectedLetter: 'с' },
          { template: 'бе..принципный', expectedLetter: 'с' },
          { template: 'чере..чур', expectedLetter: 'с' },
        ],
      },
      {
        rowNumber: 2,
        words: [
          { template: 'р..спорядок', expectedLetter: 'а' },
          { template: 'п..никли (цветы без воды)', expectedLetter: 'о' },
          { template: 'пор..ссуждать', expectedLetter: 'а' },
        ],
      },
      {
        rowNumber: 3,
        words: [
          { template: 'об..ект', expectedLetter: 'ъ' },
          { template: 'из..ездить (всю землю)', expectedLetter: 'ъ' },
          { template: 'сош..ют (костюм)', expectedLetter: 'ь' },
        ],
      },
      {
        rowNumber: 4,
        words: [
          { template: 'пр..интересный', expectedLetter: 'е' },
          { template: 'пр..ступник', expectedLetter: 'е' },
          { template: 'пр..кратить', expectedLetter: 'е' },
        ],
      },
      {
        rowNumber: 5,
        words: [
          { template: 'без..сходность', expectedLetter: 'ы' },
          { template: 'супер..гра', expectedLetter: 'и' },
          { template: 'раз..скать', expectedLetter: 'ы' },
        ],
      },
    ],
    correctRows: [1, 4],
    ruleTitle: 'Правописание приставок (Задание 10 ЕГЭ)',
    ruleExplanation: 'Верные ряды — 1, 4. 1) раСчётливый, беСпринципный, череСчур (приставки на -С перед глухими согласными). 4) прЕинтересный (значение «очень»), прЕступник (близко к «пере-»), прЕкратить (близко к «пере-»). Ряд 2: рАспорядок (рос- без ударения), пОникли (по-), порАссуждать (рас- без ударения). Ряд 3: обЪект (Ъ), изЪездить (Ъ), сошЬют (Ь). Ряд 5: безЫсходность (Ы), суперИгра (иноязычная приставка), разЫскать (Ы).',
    hint: 'Вспомните правила написания приставок на -З/-С, значения приставок ПРЕ-/ПРИ-, а также правописание разделительных Ъ и Ь.'
  }
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
    {
    id: 'ege-11-row-base-3',
    type: 'ege_row_spelling',
    difficulty: 'base',
    kimTaskNumber: 11,
    topicTag: 'ЕГЭ · Задание 11',
    prompt: OFFICIAL_ROW_INSTRUCTION,
    rows: [
      {
        rowNumber: 1,
        words: [
          { template: 'передёрг..вая', expectedLetter: 'и' },
          { template: 'обессил..ть (врага)', expectedLetter: 'и' },
        ],
      },
      {
        rowNumber: 2,
        words: [
          { template: 'ветр..ная (мельница)', expectedLetter: 'я' },
          { template: 'плат..ной (шкаф)', expectedLetter: 'я' },
        ],
      },
      {
        rowNumber: 3,
        words: [
          { template: 'матрос..кий', expectedLetter: 'к' },
          { template: 'француз..кий', expectedLetter: 'к' },
        ],
      },
      {
        rowNumber: 4,
        words: [
          { template: 'собач..нка', expectedLetter: 'о' },
          { template: '(нам) хорош..', expectedLetter: 'о' },
        ],
      },
      {
        rowNumber: 5,
        words: [
          { template: 'разнос..ик', expectedLetter: 'ч' },
          { template: 'бан..ик (работник бани)', expectedLetter: 'щ' },
        ],
      },
    ],
    correctRows: Array.of(1, 2, 3, 4),
    ruleTitle: 'Суффиксы разных частей речи (Задание 11 ЕГЭ)',
    ruleExplanation:
      'Верные ряды — 1234. 1) передёргИвая (передёргиваю), обессилИть врага (переходный глагол: лишить сил кого-то) — везде И. 2) ветрЯная мельница (исключение с суффиксом -ян-), платЯной шкаф (-ян-) — везде Я. 3) матросСкий (основа на -с + -ск-), французСкий (основа на -з + -ск-) — везде К. 4) собачОнка (сущ., под ударением после шипящего О), хорошО (наречие, под ударением после шипящего О) — везде О. 5) разносЧик (после С пишем -чик-), банЩик (после Н пишем -щик-).',
    hint: 'Вспомните переходность глаголов на -еть/-ить («обессилИть кого-то» — И), правило суффиксов -к-/-ск- и разницу между -чик- (после д, т, з, с, ж) и -щик-.',
  },
  {
    id: 'ege-11-row-base-4',
    type: 'ege_row_spelling',
    difficulty: 'base',
    kimTaskNumber: 11,
    topicTag: 'ЕГЭ · Задание 11',
    prompt: OFFICIAL_ROW_INSTRUCTION,
    rows: [
      {
        rowNumber: 1,
        words: [
          { template: 'шеств..вать (по улице)', expectedLetter: 'о' },
          { template: 'опазд..вать', expectedLetter: 'ы' },
        ],
      },
      {
        rowNumber: 2,
        words: [
          { template: 'глин..ный (кувшин)', expectedLetter: 'я' },
          { template: 'ветр..ный (день)', expectedLetter: 'е' },
        ],
      },
      {
        rowNumber: 3,
        words: [
          { template: 'ускор..ли (темп)', expectedLetter: 'и' },
          { template: 'бел..зна', expectedLetter: 'и' },
        ],
      },
      {
        rowNumber: 4,
        words: [
          { template: 'вежл..вый', expectedLetter: 'и' },
          { template: '(наш) кормил..ц', expectedLetter: 'е' },
        ],
      },
      {
        rowNumber: 5,
        words: [
          { template: 'миндал..вый', expectedLetter: 'е' },
          { template: 'продл..вать', expectedLetter: 'е' },
        ],
      },
    ],
    correctRows: Array.of(3, 5),
    ruleTitle: 'Суффиксы разных частей речи (Задание 11 ЕГЭ)',
    ruleExplanation:
      'Верные ряды — 35. 1) шествОвать (шествую), опаздЫвать (опаздываю). 2) глинЯный (-ян-), ветрЕный (исключение). 3) ускорИли (перед -л- сохраняется гласная инфинитива ускорИть), белИзна (неизменяемый суффикс -изн-) — везде И. 4) вежлИвый (-лив-), кормилЕц (сущ. муж. рода с беглой гласной: кормильца). 5) миндалЕвый (безудар. -ев-), продлЕвать (ударный -ва- выпадает: продлИть — исключение с Е) — везде Е.',
    hint: 'В 5-м ряду глагол «продлЕвать» относится к словам с ударным суффиксом -ва- (проверяем без -ва-: продлИть, но в «продлевать» пишется Е).',
  },
  {
    id: 'ege-11-row-base-5',
    type: 'ege_row_spelling',
    difficulty: 'base',
    kimTaskNumber: 11,
    topicTag: 'ЕГЭ · Задание 11',
    prompt: OFFICIAL_ROW_INSTRUCTION,
    rows: [
      {
        rowNumber: 1,
        words: [
          { template: 'раздва..ваться', expectedLetter: 'и' },
          { template: 'дымч..тый', expectedLetter: 'а' },
        ],
      },
      {
        rowNumber: 2,
        words: [
          { template: 'ливн..вый', expectedLetter: 'е' },
          { template: 'овлад..вать', expectedLetter: 'е' },
        ],
      },
      {
        rowNumber: 3,
        words: [
          { template: 'застенч..вый', expectedLetter: 'и' },
          { template: 'застр..вать', expectedLetter: 'е' },
        ],
      },
      {
        rowNumber: 4,
        words: [
          { template: 'недоум..вая', expectedLetter: 'е' },
          { template: 'вермишел..вый', expectedLetter: 'е' },
        ],
      },
      {
        rowNumber: 5,
        words: [
          { template: '(говяжья) туш..нка', expectedLetter: 'ё' },
          { template: 'напряж..нный', expectedLetter: 'ё' },
        ],
      },
    ],
    correctRows: Array.of(2, 4, 5),
    ruleTitle: 'Суффиксы разных частей речи (Задание 11 ЕГЭ)',
    ruleExplanation:
      'Верные ряды — 245. 1) раздваИваться (раздваиваюсь), дымчАтый (-чат-). 2) ливнЕвый (безудар. -ев-), овладЕвать (ударный -ва-, овладЕть) — везде Е. 3) застенчИвый (-чив-), застрЕвать (слово-исключение с ударным -ва-). 4) недоумЕвая (недоумеваю), вермишелЕвый (безудар. -ев-) — везде Е. 5) тушЁнка (отглагольное сущ., пишем Ё), напряжЁнный (причастие, после шипящих в суффиксе пишем Ё) — везде Ё.',
    hint: 'В 5-м ряду оба слова образованы от глаголов («тушить», «напрячь»), поэтому после шипящих в суффиксах пишется Ё.',
  },
  {
    id: 'ege-11-row-base-6',
    type: 'ege_row_spelling',
    difficulty: 'base',
    kimTaskNumber: 11,
    topicTag: 'ЕГЭ · Задание 11',
    prompt: OFFICIAL_ROW_INSTRUCTION,
    rows: [
      {
        rowNumber: 1,
        words: [
          { template: 'студенч..ство', expectedLetter: 'е' },
          { template: 'масл..нистое (вещество)', expectedLetter: 'я' },
        ],
      },
      {
        rowNumber: 2,
        words: [
          { template: 'недооцен..вать', expectedLetter: 'и' },
          { template: 'опрометч..во', expectedLetter: 'и' },
        ],
      },
      {
        rowNumber: 3,
        words: [
          { template: 'привередл..вый', expectedLetter: 'и' },
          { template: 'затверд..вающий', expectedLetter: 'е' },
        ],
      },
      {
        rowNumber: 4,
        words: [
          { template: 'навед..ваться', expectedLetter: 'ы' },
          { template: 'собесед..вание', expectedLetter: 'о' },
        ],
      },
      {
        rowNumber: 5,
        words: [
          { template: 'дымч..тый', expectedLetter: 'а' },
          { template: 'издавн..', expectedLetter: 'а' },
        ],
      },
    ],
    correctRows: Array.of(2, 5),
    ruleTitle: 'Суффиксы разных частей речи (Задание 11 ЕГЭ)',
    ruleExplanation:
      'Верные ряды — 25. 1) студенчЕство (суффикс -еств-), маслЯнистое (от «маслЯный» — пропитанное маслом). 2) недооценИвать (недооцениваю), опрометчИво (от «опрометчИвый» с суффиксом -чив-) — везде И. 3) привередлИвый (-лив-), затвердЕвающий (затвердЕть). 4) наведЫваться (наведываюсь), собеседОвание (от «собеседОвать» — собеседую). 5) дымчАтый (-чат-), издавнА (приставка из- + окно → из окнА) — везде А.',
    hint: 'В 1-м ряду различайте «маслЯнистый» (содержащий масло — Я) и «маслЕный» (намазанный маслом — Е).',
  },
  {
    id: 'ege-11-row-base-7',
    type: 'ege_row_spelling',
    difficulty: 'base',
    kimTaskNumber: 11,
    topicTag: 'ЕГЭ · Задание 11',
    prompt: OFFICIAL_ROW_INSTRUCTION,
    rows: [
      {
        rowNumber: 1,
        words: [
          { template: 'хитр..цы', expectedLetter: 'е' },
          { template: 'завистл..вый', expectedLetter: 'и' },
        ],
      },
      {
        rowNumber: 2,
        words: [
          { template: 'серебр..ный', expectedLetter: 'я' },
          { template: 'раста..ли', expectedLetter: 'я' },
        ],
      },
      {
        rowNumber: 3,
        words: [
          { template: 'реч..вой (этикет)', expectedLetter: 'е' },
          { template: 'расстра..ваться', expectedLetter: 'и' },
        ],
      },
      {
        rowNumber: 4,
        words: [
          { template: 'проветр..вать', expectedLetter: 'и' },
          { template: 'влюбч..вость', expectedLetter: 'и' },
        ],
      },
      {
        rowNumber: 5,
        words: [
          { template: 'развед..вательный', expectedLetter: 'ы' },
          { template: '(прийти) засветл..', expectedLetter: 'о' },
        ],
      },
    ],
    correctRows: Array.of(2, 4),
    ruleTitle: 'Суффиксы разных частей речи (Задание 11 ЕГЭ)',
    ruleExplanation:
      'Верные ряды — 24. 1) хитрЕцы (сущ. муж. рода с беглой гласной: хитреца), завистлИвый (-лив-). 2) серебрЯный (-ян-), растаЯли (перед -л- сохраняется гласная инфинитива растаЯть) — везде Я. 3) речЕвой (безудар. -ев-), расстраИваться (расстраиваюсь). 4) проветрИвать (проветриваю), влюбчИвость (от «влюбчИвый» с суффиксом -чив-) — везде И. 5) разведЫвательный (от «разведЫвать» — разведываю), засветлО (приставка за- + окно → за окнО).',
    hint: 'В 2-м ряду глагол «растаЯли» проверяется по инфинитиву «растаЯть», а в 5-м наречие «засветлО» проверяется правилом окна («за окнО»).',
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
