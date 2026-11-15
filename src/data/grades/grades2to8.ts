import { PunctuationInputQuestion, TaskModule } from '../../types/platform';
import {
  morphologicalParsingQuestions,
  phoneticParsingQuestions,
  syntacticParsingQuestions,
} from '../parsingData';
import { textClozeQuestions } from '../textClozeData';

export const grades2to8Modules: TaskModule[] = [
  {
    id: 'g-orthography',
    title: 'Орфография',
    subtitle: 'Безударные гласные, парные согласные и корни с чередованием',
    engineType: 'fill_letter',
    sessionSize: 5,
    questions: [
      {
        id: 'g-orth-1',
        type: 'fill_letter',
        difficulty: 'base',
        topicTag: 'Орфография',
        subtopic: 'Приставки и корни',
        sentence: 'На лесной опушке мы увидели хрупкий п..дснежник.',
        targetWord: 'п..дснежник',
        options: ['а', 'о'],
        correctAnswer: 'о',
        ruleTitle: 'Неизменяемая приставка ПОД-',
        ruleExplanation:
          'Приставка под- всегда пишется с буквой О независимо от произношения (подснежник, подписать).',
        hint: 'Приставки «пад-» в русском языке не существует.',
      },
      {
        id: 'g-orth-2',
        type: 'fill_letter',
        difficulty: 'base',
        topicTag: 'Орфография',
        subtopic: 'Приставки и корни',
        sentence: 'Утром на траве бл..стели крупные капли росы.',
        targetWord: 'бл..стели',
        options: ['е', 'и'],
        correctAnswer: 'е',
        ruleTitle: 'Корни с чередованием БЛЕСТ- / БЛИСТ-',
        ruleExplanation:
          'В корне -блест-/-блист- пишется буква И, если после корня стоит суффикс -А-. Здесь суффикса -А- нет, пишем Е.',
        hint: 'Проверьте наличие суффикса -А- после корня.',
      },
      {
        id: 'g-orth-3',
        type: 'fill_letter',
        difficulty: 'hard',
        topicTag: 'Орфография',
        subtopic: 'Суффиксы',
        sentence: 'Юный исслед..ватель внимательно изучал старую карту.',
        targetWord: 'исслед..ватель',
        options: ['ы', 'а', 'о'],
        correctAnswer: 'о',
        ruleTitle: 'Суффиксы глаголов и существительных -ОВА- / -ЕВА-',
        ruleExplanation:
          'Слово «исследователь» образовано от глагола «исследовать» (я исследую -> суффикс -ова- сохраняется).',
        hint: 'Поставьте исходный глагол в форму 1-го лица единственного числа: «я исследую».',
      },
    ],
  },
  {
    id: 'g-punctuation',
    title: 'Пунктуация',
    subtitle: 'Знаки препинания при однородных членах и в сложных предложениях',
    engineType: 'single_choice',
    sessionSize: 5,
    questions: [
      {
        id: 'g-punct-1',
        type: 'single_choice',
        difficulty: 'base',
        topicTag: 'Пунктуация',
        prompt: 'В каком предложении нужна запятая перед союзом И?',
        options: [
          'Гроза прошла и воздух сразу стал свежим.',
          'Мы собрали грибы и ягоды в большую корзину.',
          'Ветер шумел в верхушках сосен и елей.',
          'Брат быстро прочитал книгу и отдал её другу.',
        ],
        correctAnswer: 0,
        ruleTitle: 'Запятая в сложносочинённом предложении',
        ruleExplanation:
          'Предложение «Гроза прошла, и воздух сразу стал свежим» состоит из двух грамматических основ («гроза прошла» и «воздух стал свежим»), поэтому перед союзом И ставится запятая.',
        hint: 'Найдите грамматические основы в каждом предложении.',
      },
      {
        id: 'g-punct-2',
        type: 'single_choice',
        difficulty: 'base',
        topicTag: 'Пунктуация',
        prompt: 'Укажите предложение с правильной расстановкой знаков препинания при однородных членах:',
        options: [
          'В саду росли яблоки, груши, и сливы.',
          'Туристы взяли с собой палатку, котелок и фонарик.',
          'Дождь то утихал то начинался с новой силой.',
          'На небе показались не только тучи но и первые звёзды.',
        ],
        correctAnswer: 1,
        ruleTitle: 'Однородные члены с одиночным союзом И',
        ruleExplanation:
          'При одиночном союзе И между последними однородными членами запятая не ставится: «палатку, котелок и фонарик».',
        hint: 'Перед одиночным союзом И, соединяющим однородные члены, запятая не нужна.',
      },
    ],
  },
  {
    id: 'g-phonetics',
    title: 'Фонетика',
    subtitle: 'Звуко-буквенный разбор, слоги, ударные и безударные гласные, звонкость и мягкость',
    engineType: 'parsing',
    sessionSize: 3,
    questions: phoneticParsingQuestions,
  },
  {
    id: 'g-morphology',
    title: 'Морфология',
    subtitle: 'Морфологический разбор частей речи: вопрос, начальная форма, постоянные и непостоянные признаки',
    engineType: 'parsing',
    sessionSize: 3,
    questions: morphologicalParsingQuestions,
  },
  {
    id: 'g-syntax',
    title: 'Синтаксис',
    subtitle: 'Синтаксический разбор предложения: подчёркивание членов и полная характеристика',
    engineType: 'parsing',
    sessionSize: 3,
    questions: syntacticParsingQuestions,
  },
  {
    id: 'g-lexicon',
    title: 'Лексика',
    subtitle: 'Синонимы, антонимы, омонимы и прямое/переносное значение',
    engineType: 'single_choice',
    sessionSize: 5,
    questions: [
      {
        id: 'g-lex-1',
        type: 'single_choice',
        difficulty: 'base',
        topicTag: 'Лексика',
        prompt: 'В каком словосочетании прилагательное употреблено в переносном значении?',
        options: ['золотое сердце', 'золотое кольцо', 'холодная вода', 'тяжёлый чемодан'],
        correctAnswer: 0,
        ruleTitle: 'Прямое и переносное значение слова',
        ruleExplanation:
          '«Золотое сердце» — переносное значение (добрый, отзывчивый человек), а «золотое кольцо» — прямое (сделанное из золота).',
        hint: 'Найдите выражение, которое не связано с физическим материалом или температурой.',
      },
      {
        id: 'g-lex-2',
        type: 'single_choice',
        difficulty: 'base',
        topicTag: 'Лексика',
        prompt: 'Подберите антоним к слову «щедрый»:',
        options: ['скупой', 'богатый', 'честный', 'открытый'],
        correctAnswer: 0,
        ruleTitle: 'Антонимы',
        ruleExplanation:
          'Антонимы — слова с противоположным лексическим значением: щедрый — скупой.',
        hint: 'Ищите слово с противоположным смыслом.',
      },
    ],
  },
  {
    id: 'g-text-work',
    title: 'Работа с текстом',
    subtitle: 'Тема, основная мысль, типы речи и средства связи предложений',
    engineType: 'single_choice',
    sessionSize: 5,
    questions: [
      {
        id: 'g-text-1',
        type: 'single_choice',
        difficulty: 'base',
        topicTag: 'Работа с текстом',
        contextText:
          'Весной лес просыпается. Снег быстро тает под тёплыми лучами солнца. На ветках берёз набухают почки, а из тёплых краёв возвращаются перелётные птицы.',
        prompt: 'Какой тип речи представлен в этом отрывке?',
        options: ['Повествование', 'Рассуждение', 'Описание', 'Повествование с элементами описания'],
        correctAnswer: 2,
        ruleTitle: 'Типы речи: повествование',
        ruleExplanation:
          'В тексте описывается картина весеннего леса. Последовательных действий нет.',
        hint: 'Обратите внимание на цепочку глаголов действия.',
      },
      {
        id: 'g-text-2',
        type: 'single_choice',
        difficulty: 'base',
        topicTag: 'Работа с текстом',
        prompt: 'Какой тип текста отвечает на вопрос «Почему это происходит?» и содержит тезис, аргументы и вывод?',
        options: ['Рассуждение', 'Описание', 'Повествование', 'Аннотация'],
        correctAnswer: 0,
        ruleTitle: 'Композиция текста-рассуждения',
        ruleExplanation:
          'Рассуждение строится по схеме: тезис (основная мысль) -> доказательства/аргументы -> вывод.',
        hint: 'Вспомните три главных элемента доказательного текста.',
      },
    ],
  },
];

const grades5to6PunctuationQuestions: PunctuationInputQuestion[] = [
  {
    id: 'g56-punct-1',
    type: 'punctuation_input',
    difficulty: 'base',
    topicTag: 'Пунктуация · 5–6 кл.',
    subtopic: 'Прямая речь',
    prompt: 'Расставьте знаки препинания в предложении с прямой речью:',
    sentenceTemplate:
      'Тренер уверенно сказал команде[_] «Сегодня мы отработаем новую тактику».',
    expectedMarks: [':'],
    ruleTitle: 'Двоеточие при прямой речи после слов автора',
    ruleExplanation:
      'Если слова автора стоят перед прямой речью («Тренер уверенно сказал команде:»), после них перед кавычками ставится двоеточие.',
    hint: 'Найдите границу между словами автора и прямой речью.',
  },
  {
    id: 'g56-punct-2',
    type: 'punctuation_input',
    difficulty: 'base',
    topicTag: 'Пунктуация · 5–6 кл.',
    subtopic: 'ССП и однородные члены',
    prompt:
      'Определите, где между частями предложения нужна запятая, а где она не ставится:',
    sentenceTemplate:
      'Осенний ветер сорвал сухие листья[_] и закружил их над тропинкой[_] а вдалеке уже слышались раскаты грома.',
    expectedMarks: ['', ','],
    ruleTitle: 'Однородные сказуемые и сложносочинённое предложение',
    ruleExplanation:
      '(1) Запятая не нужна: одиночный союз «и» соединяет однородные сказуемые «сорвал и закружил». (2) Перед противительным союзом «а» между двумя грамматическими основами («ветер сорвал и закружил» и «слышались раскаты») ставится запятая.',
    hint: 'Выделите маркером подлежащие и сказуемые, чтобы отличить однородные члены от новой основы.',
  },
  {
    id: 'g56-punct-3',
    type: 'punctuation_input',
    difficulty: 'base',
    topicTag: 'Пунктуация · 5–6 кл.',
    subtopic: 'Однородные члены',
    prompt:
      'Расставьте знаки препинания в предложении с обобщающим словом и однородными членами:',
    sentenceTemplate:
      'В корзине лежали разные лесные дары[_] сладкая земляника[_] душистая малина и крепкие боровики.',
    expectedMarks: [':', ','],
    ruleTitle: 'Обобщающее слово перед однородными членами',
    ruleExplanation:
      '(1) После обобщающего слова («лесные дары») перед перечислением однородных членов ставится двоеточие. (2) Однородные члены «земляника, малина», не соединённые союзом, разделяются запятой.',
    hint: 'Найдите обобщающее слово, после которого начинается перечисление.',
  },
];

const grades7to8PunctuationQuestions: PunctuationInputQuestion[] = [
  {
    id: 'g78-punct-1',
    type: 'punctuation_input',
    difficulty: 'base',
    topicTag: 'Пунктуация · 7–8 кл.',
    subtopic: 'Причастный оборот',
    prompt: 'Расставьте запятые при причастном обороте (используйте маркер для границ оборота):',
    sentenceTemplate:
      'Тропинка[_] петлявшая между старыми соснами[_] вывела туристов к тихому озеру.',
    expectedMarks: [',', ','],
    ruleTitle: 'Обособление причастного оборота после определяемого слова',
    ruleExplanation:
      'Причастный оборот «петлявшая между старыми соснами» стоит после определяемого существительного «тропинка», поэтому выделяется запятыми с обеих сторон.',
    hint: 'Подчеркните основу «тропинка вывела» и отметьте границы причастного оборота.',
  },
  {
    id: 'g78-punct-2',
    type: 'punctuation_input',
    difficulty: 'base',
    topicTag: 'Пунктуация · 7–8 кл.',
    subtopic: 'Деепричастный оборот',
    prompt: 'Выделите знаками препинания деепричастный оборот:',
    sentenceTemplate:
      'Восходящее солнце[_] осветив верхушки высоких берёз[_] быстро согрело утренний воздух.',
    expectedMarks: [',', ','],
    ruleTitle: 'Обособление деепричастного оборота',
    ruleExplanation:
      'Деепричастный оборот «осветив верхушки высоких берёз» обособляется запятыми независимо от его места в предложении.',
    hint: 'Найдите деепричастие (что сделав?) и зависимые от него слова.',
  },
  {
    id: 'g78-punct-3',
    type: 'punctuation_input',
    difficulty: 'base',
    topicTag: 'Пунктуация · 7–8 кл.',
    subtopic: 'Вводные слова',
    prompt: 'Расставьте знаки препинания при вводном сочетании:',
    sentenceTemplate:
      'Наша команда[_] к счастью[_] успела вернуться в лагерь до начала сильного ливня.',
    expectedMarks: [',', ','],
    ruleTitle: 'Выделение вводных слов и сочетаний',
    ruleExplanation:
      'Вводное сочетание «к счастью» выражает отношение говорящего к сообщению, не является членом предложения и выделяется запятыми с двух сторон.',
    hint: 'Отметьте вводную конструкцию маркером и проверьте, можно ли опустить её без потери смысла.',
  },
];

const grades5to8OrthographyQuestions = [
  ...grades2to8Modules[0].questions,
  {
    id: 'g-orth-part-1',
    type: 'fill_letter' as const,
    difficulty: 'base' as const,
    topicTag: 'Орфография',
    subtopic: 'Причастия',
    sentence: 'Над озером поднимался густой, медленно та..щий в лучах туман.',
    targetWord: 'та..щий',
    options: ['я', 'ю'],
    correctAnswer: 'ю',
    ruleTitle: 'Суффикс действительного причастия настоящего времени',
    ruleExplanation:
      'Глагол «таять» относится к I спряжению, поэтому в действительном причастии настоящего времени пишется суффикс -ЮЩ- («тающий»).',
    hint: 'Определите спряжение исходного глагола «таять».',
  },
  {
    id: 'g-orth-part-2',
    type: 'fill_letter' as const,
    difficulty: 'base' as const,
    topicTag: 'Орфография',
    subtopic: 'Причастия',
    sentence: 'Мы внимательно рассмотрели развеш..нные по стенам акварели.',
    targetWord: 'развеш..нные',
    options: ['а', 'е'],
    correctAnswer: 'а',
    ruleTitle: 'Гласная перед НН в страдательном причастии',
    ruleExplanation:
      '«Развешанные» образовано от глагола «развешать» (в значении «повесить картины»): буква А инфинитива сохраняется перед -НН-. (Ср. «развесить» -> «развешенные» — о весе).',
    hint: 'Сравните глаголы «развешать» (картины) и «развесить» (товар на весах).',
  },
  {
    id: 'g-orth-deep-1',
    type: 'fill_letter' as const,
    difficulty: 'base' as const,
    topicTag: 'Орфография',
    subtopic: 'Деепричастия',
    sentence: 'Услыш..в далёкий гудок теплохода, ребята поспешили к пристани.',
    targetWord: 'услыш..в',
    options: ['и', 'а', 'е'],
    correctAnswer: 'а',
    ruleTitle: 'Гласная перед суффиксом -В- в деепричастии',
    ruleExplanation:
      'Перед суффиксами -В-, -ВШИ- деепричастий сохраняется та же гласная, что и перед -ТЬ в инфинитиве: услышать -> услышав.',
    hint: 'Вспомните гласную в инфинитиве «услышать».',
  },
  {
    id: 'g-orth-deep-2',
    type: 'fill_letter' as const,
    difficulty: 'base' as const,
    topicTag: 'Орфография',
    subtopic: 'Деепричастия',
    sentence: 'Мастер работал сосредоточенно, (..)жалея ни сил, ни времени.',
    targetWord: '(..)жалея',
    options: ['не ', 'не'],
    correctAnswer: 'не ',
    ruleTitle: 'Правописание НЕ с деепричастиями',
    ruleExplanation:
      'НЕ с деепричастиями пишется раздельно, кроме слов, которые не употребляются без НЕ («недоумевая», «негодуя»). «Жалея» без НЕ употребляется — пишем раздельно.',
    hint: 'Проверьте, существует ли деепричастие «жалея» без НЕ.',
  },
  {
    id: 'g-orth-adv-1',
    type: 'fill_letter' as const,
    difficulty: 'base' as const,
    topicTag: 'Орфография',
    subtopic: 'Наречия',
    sentence: 'За окном стало темно и по-осеннему свеж.. .',
    targetWord: 'свеж..',
    options: ['е', 'о'],
    correctAnswer: 'о',
    ruleTitle: 'Гласные О и Е после шипящих на конце наречий',
    ruleExplanation:
      'На конце наречий после шипящих под ударением пишется О («свежо́», «горячо́»), без ударения — Е («неуклю́же»).',
    hint: 'Поставьте ударение в наречии: ударный слог или безударный?',
  },
  {
    id: 'g-orth-adv-2',
    type: 'fill_letter' as const,
    difficulty: 'base' as const,
    topicTag: 'Орфография',
    subtopic: 'Наречия',
    sentence: 'Старая тропинка свернула влево, а новая уходила направ.. .',
    targetWord: 'направ..',
    options: ['о', 'а'],
    correctAnswer: 'о',
    ruleTitle: 'Суффиксы -О и -А на конце наречий',
    ruleExplanation:
      'В наречиях с приставками В-, НА-, ЗА- на конце пишется суффикс -О («влево», «направо», «засветло»). Суффикс -А пишется после приставок ИЗ-, ДО-, С-.',
    hint: 'Используйте правило «окна»: на окнО -> направО.',
  },
  {
    id: 'g-orth-prep-1',
    type: 'fill_letter' as const,
    difficulty: 'base' as const,
    topicTag: 'Орфография',
    subtopic: 'Предлоги',
    sentence: 'В течени.. всего лета путешественники вели путевой дневник.',
    targetWord: 'в течени..',
    options: ['и', 'е'],
    correctAnswer: 'е',
    ruleTitle: 'Производный предлог В ТЕЧЕНИЕ',
    ruleExplanation:
      'Производный предлог «в течение» обозначает промежуток времени и всегда пишется с буквой Е на конце (в отличие от существительного «в течении реки»).',
    hint: 'Если речь идёт о времени («как долго?»), это предлог.',
  },
  {
    id: 'g-orth-prep-2',
    type: 'fill_letter' as const,
    difficulty: 'base' as const,
    topicTag: 'Орфография',
    subtopic: 'Предлоги',
    sentence: 'Вследстви.. сильного снегопада движение по перевалу закрыли.',
    targetWord: 'вследстви..',
    options: ['и', 'е'],
    correctAnswer: 'е',
    ruleTitle: 'Производный предлог ВСЛЕДСТВИЕ',
    ruleExplanation:
      'Производный предлог «вследствие» (= из-за) пишется слитно и с буквой Е на конце.',
    hint: 'Попробуйте заменить слово предлогом «из-за».',
  },
  {
    id: 'g-orth-conj-1',
    type: 'fill_letter' as const,
    difficulty: 'base' as const,
    topicTag: 'Орфография',
    subtopic: 'Союзы',
    sentence: 'Брат увлекается астрономией, я (..)же интересуюсь космосом.',
    targetWord: 'так(..)же',
    options: ['_', ' '],
    correctAnswer: '_',
    ruleTitle: 'Союз ТАКЖЕ (слитное написание)',
    ruleExplanation:
      'Союз «также» (= и, тоже) пишется слитно («я также интересуюсь» = «и я интересуюсь»). Выберите слитный вариант («_» без пробела).',
    hint: 'Попробуйте заменить на «тоже» или «и».',
  },
  {
    id: 'g-orth-conj-2',
    type: 'fill_letter' as const,
    difficulty: 'base' as const,
    topicTag: 'Орфография',
    subtopic: 'Союзы',
    sentence: 'Вечером похолодало, з(..)то небо полностью очистилось от туч.',
    targetWord: 'з(..)то',
    options: ['о', 'а'],
    correctAnswer: 'а',
    ruleTitle: 'Противительный союз ЗАТО',
    ruleExplanation:
      'Союз «зато» (= но, однако) всегда пишется с приставкой ЗА- (с буквой А) и слитно.',
    hint: 'Приставки «зо-» не существует.',
  },
];

function buildGrades5to8Modules(
  punctuationQuestions: PunctuationInputQuestion[],
  punctuationSubtitle: string
): TaskModule[] {
  return grades2to8Modules.map((mod) => {
    if (mod.id === 'g-orthography') {
      return {
        ...mod,
        subtitle:
          'Орфограммы разных частей речи: причастия, деепричастия, наречия, предлоги, союзы и корни',
        questions: grades5to8OrthographyQuestions,
      };
    }
    if (mod.id === 'g-punctuation') {
      return {
        ...mod,
        subtitle: punctuationSubtitle,
        engineType: 'punctuation_input',
        sessionSize: 5,
        questions: punctuationQuestions,
      };
    }
    if (mod.id === 'g-text-work') {
      return {
        id: 'g-text-work',
        title: 'Работа с текстом',
        subtitle:
          'Комплексный диктант: вставка букв, выбор слитного/раздельного написания и пунктуация',
        engineType: 'text_cloze',
        sessionSize: 3,
        questions: textClozeQuestions.slice(0, 2),
      };
    }
    return mod;
  });
}

export const grades5to6Modules: TaskModule[] = buildGrades5to8Modules(
  grades5to6PunctuationQuestions,
  'Прямая речь, однородные члены и сложное предложение с интерактивным синтаксическим маркером'
);

export const grades7to8Modules: TaskModule[] = buildGrades5to8Modules(
  grades7to8PunctuationQuestions,
  'Причастные и деепричастные обороты, вводные слова с интерактивным синтаксическим маркером'
);

export const grades5to8Modules: TaskModule[] = grades5to6Modules;
