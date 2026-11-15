import {
  MorphologicalParsingQuestion,
  PhoneticParsingQuestion,
  SyntacticParsingQuestion,
} from '../types/platform';

export const phoneticParsingQuestions: PhoneticParsingQuestion[] = [
  {
    id: 'parse-phon-1',
    type: 'parsing',
    mode: 'phonetic',
    difficulty: 'base',
    topicTag: 'Фонетический разбор',
    prompt:
      'Вставьте пропущенную букву, укажите количество слогов, разделите слово на слоги и выполните фонетический разбор слова:',
    displayWord: 'ж..лтые',
    missingLetter: 'ё',
    fullWord: 'жёлтые',
    expectedSyllableCount: 3,
    expectedSyllableDivision: 'жёл-ты-е',
    expectedLetterCount: 6,
    expectedSoundCount: 7,
    letterRows: [
      {
        letter: 'ж',
        soundCount: 1,
        sounds: [
          {
            expectedSound: 'ж',
            soundType: 'consonant',
            voicing: 'voiced_paired',
            hardness: 'hard_unpaired',
          },
        ],
      },
      {
        letter: 'ё',
        soundCount: 1,
        sounds: [
          {
            expectedSound: 'о\u0301',
            soundType: 'vowel',
            stress: 'stressed',
          },
        ],
      },
      {
        letter: 'л',
        soundCount: 1,
        sounds: [
          {
            expectedSound: 'л',
            soundType: 'consonant',
            voicing: 'voiced_unpaired',
            hardness: 'hard_paired',
          },
        ],
      },
      {
        letter: 'т',
        soundCount: 1,
        sounds: [
          {
            expectedSound: 'т',
            soundType: 'consonant',
            voicing: 'voiceless_paired',
            hardness: 'hard_paired',
          },
        ],
      },
      {
        letter: 'ы',
        soundCount: 1,
        sounds: [
          {
            expectedSound: 'ы',
            soundType: 'vowel',
            stress: 'unstressed',
          },
        ],
      },
      {
        letter: 'е',
        soundCount: 2,
        sounds: [
          {
            expectedSound: "й'",
            soundType: 'consonant',
            voicing: 'voiced_unpaired',
            hardness: 'soft_unpaired',
          },
          {
            expectedSound: 'э',
            soundType: 'vowel',
            stress: 'unstressed',
          },
        ],
      },
    ],
    ruleTitle: 'Фонетический разбор слова «жёлтые»',
    ruleExplanation:
      'В слове «жёлтые» 6 букв, 7 звуков и 3 слога (жёл-ты-е). Согласный [ж] звонкий парный (ж/ш) и всегда твёрдый (непарный), поэтому «ё» после него даёт один ударный звук [о́]. Буква «е» после гласной «ы» распадается на два звука: согласный [й\'] (звонкий непарный, мягкий непарный) и безударный гласный [э].',
    hint: 'Количество слогов равно числу гласных; буква «е» после гласной даёт 2 звука.',
  },
  {
    id: 'parse-phon-2',
    type: 'parsing',
    mode: 'phonetic',
    difficulty: 'base',
    topicTag: 'Фонетический разбор',
    prompt: 'Выполните полный фонетический разбор слова «маяк»:',
    displayWord: 'маяк',
    fullWord: 'маяк',
    expectedSyllableCount: 2,
    expectedSyllableDivision: 'ма-як',
    expectedLetterCount: 4,
    expectedSoundCount: 5,
    letterRows: [
      {
        letter: 'м',
        soundCount: 1,
        sounds: [
          {
            expectedSound: 'м',
            soundType: 'consonant',
            voicing: 'voiced_unpaired',
            hardness: 'hard_paired',
          },
        ],
      },
      {
        letter: 'а',
        soundCount: 1,
        sounds: [
          {
            expectedSound: 'а',
            soundType: 'vowel',
            stress: 'unstressed',
          },
        ],
      },
      {
        letter: 'я',
        soundCount: 2,
        sounds: [
          {
            expectedSound: "й'",
            soundType: 'consonant',
            voicing: 'voiced_unpaired',
            hardness: 'soft_unpaired',
          },
          {
            expectedSound: 'а\u0301',
            soundType: 'vowel',
            stress: 'stressed',
          },
        ],
      },
      {
        letter: 'к',
        soundCount: 1,
        sounds: [
          {
            expectedSound: 'к',
            soundType: 'consonant',
            voicing: 'voiceless_paired',
            hardness: 'hard_paired',
          },
        ],
      },
    ],
    ruleTitle: 'Фонетический разбор слова «маяк»',
    ruleExplanation:
      'В слове «маяк» 4 буквы, но 5 звуков (2 слога: ма-як): буква «я» после гласной «а» обозначает два звука — согласный звонкий непарный мягкий непарный [й\'] и ударный гласный [а́]. Сонорный [м] — звонкий непарный, твёрдый парный; [к] — глухой парный, твёрдый парный.',
    hint: 'Буква «я» после гласного обозначает два звука: [й\'] и [а́].',
  },
  {
    id: 'parse-phon-3',
    type: 'parsing',
    mode: 'phonetic',
    difficulty: 'base',
    topicTag: 'Фонетический разбор',
    prompt: 'Выполните фонетический разбор слова «день» (с мягким знаком):',
    displayWord: 'день',
    fullWord: 'день',
    expectedSyllableCount: 1,
    expectedSyllableDivision: 'день',
    expectedLetterCount: 4,
    expectedSoundCount: 3,
    letterRows: [
      {
        letter: 'д',
        soundCount: 1,
        sounds: [
          {
            expectedSound: "д'",
            soundType: 'consonant',
            voicing: 'voiced_paired',
            hardness: 'soft_paired',
          },
        ],
      },
      {
        letter: 'е',
        soundCount: 1,
        sounds: [
          {
            expectedSound: 'э\u0301',
            soundType: 'vowel',
            stress: 'stressed',
          },
        ],
      },
      {
        letter: 'н',
        soundCount: 1,
        sounds: [
          {
            expectedSound: "н'",
            soundType: 'consonant',
            voicing: 'voiced_unpaired',
            hardness: 'soft_paired',
          },
        ],
      },
      {
        letter: 'ь',
        soundCount: 0,
        sounds: [],
      },
    ],
    ruleTitle: 'Фонетический разбор слова «день»',
    ruleExplanation:
      'В слове «день» 4 буквы, но 3 звука (1 слог): мягкий знак (ь) звука не обозначает, а лишь указывает на мягкость предшествующего согласного [н\']. Буква «е» смягчает [д\'] и даёт один ударный звук [э́].',
    hint: 'Мягкий знак звука не обозначает — выберите 0 в столбце «Кол-во звуков».',
  },
];

export const morphologicalParsingQuestions: MorphologicalParsingQuestion[] = [
  {
    id: 'parse-morph-1',
    type: 'parsing',
    mode: 'morphological',
    difficulty: 'base',
    topicTag: 'Морфологический разбор',
    subtopic: 'Глаголы',
    prompt: 'Выполните морфологический разбор выделенного в предложении слова:',
    sentence:
      'А ранней весной в ещё бесцветном лесу появится прекрасный подснежник.',
    targetWord: 'появится',
    expectedPos: 'Глагол',
    expectedQuestions: ['что сделает?', 'что сделает'],
    expectedBaseForm: 'появиться',
    expectedFeatures: {
      aspect: 'совершенный',
      reflexivity: ['возвратный', 'невозвратный'],
      conjugation: 'II спряжение',
      tense: 'будущее',
      number: 'единственное',
      person: '3-е лицо',
    },
    expectedSyntacticRole: 'Сказуемое',
    ruleTitle: 'Морфологический разбор глагола «появится»',
    ruleExplanation:
      '«Появится» — глагол (что сделает?), начальная форма «появиться». Постоянные признаки: совершенный вид, возвратный (постфикс -ся), II спряжение. Непостоянные: изъявительное наклонение, будущее время, единственное число, 3-е лицо. В предложении является сказуемым.',
    hint: 'Задайте вопрос с приставкой «с-» (что сделает?), чтобы точно определить вид и время.',
  },
  {
    id: 'parse-morph-2',
    type: 'parsing',
    mode: 'morphological',
    difficulty: 'base',
    topicTag: 'Морфологический разбор',
    subtopic: 'Существительные',
    prompt: 'Выполните морфологический разбор выделенного существительного:',
    sentence: 'Утром над тихим озером поднялся лёгкий туман.',
    targetWord: 'озером',
    expectedPos: 'Существительное',
    expectedQuestions: ['над чем?', 'чем?', 'над чем', 'чем'],
    expectedBaseForm: 'озеро',
    expectedFeatures: {
      animacy: 'неодушевлённое',
      gender: 'средний',
      declension: '2-е склонение',
      case: 'творительный',
      number: 'единственное',
    },
    expectedSyntacticRole: ['Дополнение', 'Обстоятельство'],
    ruleTitle: 'Морфологический разбор существительного «озером»',
    ruleExplanation:
      '«Озером» — имя существительное (поднялся над чем? / где?), начальная форма «озеро». Неодушевлённое, средний род, 2-е склонение (окончание -о в им. п. ед. ч.), употреблено в творительном падеже, единственном числе. В предложении является дополнением (или обстоятельством места).',
    hint: 'Поставьте слово в именительный падеж единственного числа («озеро»), чтобы определить род и склонение.',
  },
  {
    id: 'parse-morph-3',
    type: 'parsing',
    mode: 'morphological',
    difficulty: 'base',
    topicTag: 'Морфологический разбор',
    subtopic: 'Глаголы',
    prompt: 'Выполните морфологический разбор выделенного глагола прошедшего времени:',
    sentence: 'Вчера над тихим прудом пролетела белая цапля.',
    targetWord: 'пролетела',
    expectedPos: 'Глагол',
    expectedQuestions: ['что сделала?', 'что сделала'],
    expectedBaseForm: 'пролететь',
    expectedFeatures: {
      aspect: 'совершенный',
      reflexivity: 'невозвратный',
      conjugation: 'I спряжение',
      tense: 'прошедшее',
      number: 'единственное',
      gender: 'Женский',
    },
    expectedSyntacticRole: 'Сказуемое',
    ruleTitle: 'Морфологический разбор глагола прошедшего времени «пролетела»',
    ruleExplanation:
      '«Пролетела» — глагол (что сделала?), начальная форма «пролететь». Постоянные признаки: совершенный вид, невозвратный, I спряжение. Непостоянные: изъявительное наклонение, прошедшее время, единственное число, женский род (лицо в прошедшем времени не определяется). В предложении — сказуемое.',
    hint: 'У глаголов в прошедшем времени вместо лица определяется род (в ед. ч.).',
  },
  {
    id: 'parse-morph-4',
    type: 'parsing',
    mode: 'morphological',
    difficulty: 'base',
    topicTag: 'Морфологический разбор',
    subtopic: 'Причастия',
    prompt: 'Выполните морфологический разбор выделенного причастия:',
    sentence: 'Ученик положил на стол прочитанную вчера книгу.',
    targetWord: 'прочитанную',
    expectedPos: 'Причастие',
    expectedQuestions: ['какую?', 'какую', 'что сделанную?', 'что сделанную'],
    expectedBaseForm: 'прочитанный',
    expectedFeatures: {
      voice: 'страдательное',
      tense: 'прошедшее',
      aspect: 'совершенный',
      form: 'полная',
      case: 'винительный',
      number: 'единственное',
    },
    expectedSyntacticRole: 'Определение',
    ruleTitle: 'Морфологический разбор причастия «прочитанную»',
    ruleExplanation:
      '«Прочитанную» — страдательное причастие прошедшего времени (книгу какую? — от глагола совершенного вида «прочитать»). Полная форма, винительный падеж, единственное число. В предложении является определением.',
    hint: 'Проверьте суффикс -НН-: предмет испытал действие на себе (книгу прочитали), значит причастие страдательное.',
  },
  {
    id: 'parse-morph-5',
    type: 'parsing',
    mode: 'morphological',
    difficulty: 'base',
    topicTag: 'Морфологический разбор',
    subtopic: 'Наречия',
    prompt: 'Выполните морфологический разбор выделенного наречия:',
    sentence: 'Разведчик осторожно ступил на скрипнувший мостик.',
    targetWord: 'осторожно',
    expectedPos: 'Наречие',
    expectedQuestions: ['как?', 'как', 'каким образом?', 'каким образом'],
    expectedBaseForm: 'осторожно',
    expectedFeatures: {
      category: 'образа действия',
      invariability: 'неизменяемое',
    },
    expectedSyntacticRole: 'Обстоятельство',
    ruleTitle: 'Морфологический разбор наречия «осторожно»',
    ruleExplanation:
      '«Осторожно» — наречие образа действия (ступил как?), неизменяемая часть речи (начальная форма совпадает с исходной). В предложении выполняет роль обстоятельства.',
    hint: 'Задайте вопрос от глагола «ступил» и помните, что наречие не склоняется и не спрягается.',
  },
];

export const syntacticParsingQuestions: SyntacticParsingQuestion[] = [
  {
    id: 'parse-synt-1',
    type: 'parsing',
    mode: 'syntactic',
    difficulty: 'base',
    topicTag: 'Синтаксический разбор',
    prompt:
      'Разберите предложение по членам (нажимайте на слова для смены подчёркивания) и отметьте характеристики предложения:',
    sentence: 'Я собираю в осеннем лесу жёлтые, зелёные, красные листья.',
    tokens: [
      { word: 'Я', expectedRole: 'subject' },
      { word: 'собираю', expectedRole: 'predicate' },
      { word: 'в', expectedRole: 'none' },
      { word: 'осеннем', expectedRole: 'attribute' },
      { word: 'лесу', expectedRole: 'adverbial' },
      { word: 'жёлтые', trailingPunct: ',', expectedRole: 'attribute' },
      { word: 'зелёные', trailingPunct: ',', expectedRole: 'attribute' },
      { word: 'красные', expectedRole: 'attribute' },
      { word: 'листья', trailingPunct: '.', expectedRole: 'object' },
    ],
    expectedCharacteristics: [
      'Повествовательное',
      'Невосклицательное',
      'Простое',
      'Двусоставное',
      'Распространённое',
      'Осложнено однородными членами',
    ],
    ruleTitle: 'Синтаксический разбор простого осложнённого предложения',
    ruleExplanation:
      'Грамматическая основа: «я собираю» (подлежащее + сказуемое). Предлог «в» не является членом предложения и не подчёркивается. Второстепенные члены: «лесу» (где? — обстоятельство), «осеннем» (каком? — определение), «жёлтые, зелёные, красные» (какие? — однородные определения), «листья» (что? — дополнение).',
    hint: 'Сначала выделите основу «я собираю». Помните: предлоги («в») и союзы членами предложения не являются — не подчёркивайте их.',
  },
  {
    id: 'parse-synt-2',
    type: 'parsing',
    mode: 'syntactic',
    difficulty: 'base',
    topicTag: 'Синтаксический разбор',
    prompt:
      'Подчеркните все члены предложения и выберите его характеристики:',
    sentence: 'Тёплый ветер осторожно колышет золотые колосья.',
    tokens: [
      { word: 'Тёплый', expectedRole: 'attribute' },
      { word: 'ветер', expectedRole: 'subject' },
      { word: 'осторожно', expectedRole: 'adverbial' },
      { word: 'колышет', expectedRole: 'predicate' },
      { word: 'золотые', expectedRole: 'attribute' },
      { word: 'колосья', trailingPunct: '.', expectedRole: 'object' },
    ],
    expectedCharacteristics: [
      'Повествовательное',
      'Невосклицательное',
      'Простое',
      'Двусоставное',
      'Распространённое',
    ],
    ruleTitle: 'Синтаксический разбор неосложнённого предложения',
    ruleExplanation:
      'Основа — «ветер колышет» (двусоставное). «Тёплый» и «золотые» — определения; «осторожно» (как?) — обстоятельство образа действия; «колосья» (что?) — прямое дополнение. Однородных членов, обращений и вводных слов нет.',
    hint: 'Проверьте, есть ли в предложении перечисления, обращения или вводные слова.',
  },
  {
    id: 'parse-synt-3',
    type: 'parsing',
    mode: 'syntactic',
    difficulty: 'base',
    topicTag: 'Синтаксический разбор',
    prompt:
      'Разберите предложение по членам (не подчёркивайте предлоги и союзы) и отметьте характеристики:',
    sentence: 'На тихой поляне зреет земляника и поют птицы.',
    tokens: [
      { word: 'На', expectedRole: 'none' },
      { word: 'тихой', expectedRole: 'attribute' },
      { word: 'поляне', expectedRole: 'adverbial' },
      { word: 'зреет', expectedRole: 'predicate' },
      { word: 'земляника', expectedRole: 'subject' },
      { word: 'и', expectedRole: 'none' },
      { word: 'поют', expectedRole: 'predicate' },
      { word: 'птицы', trailingPunct: '.', expectedRole: 'subject' },
    ],
    expectedCharacteristics: [
      'Повествовательное',
      'Невосклицательное',
      'Сложное',
      'Двусоставное',
      'Распространённое',
    ],
    ruleTitle: 'Синтаксический разбор сложносочинённого предложения',
    ruleExplanation:
      'Две грамматические основы: «земляника зреет» и «птицы поют» — предложение сложное (ССП, с общим второстепенным членом «на поляне»). Предлог «на» и союз «и» — служебные части речи, они не являются членами предложения и не подчёркиваются.',
    hint: 'Найдите обе основы и не подчёркивайте предлог «на» и сочинительный союз «и».',
  },
];
