
import Encoder from '../Encoder'
import StringUtil from '../StringUtil'

const meta = {
  name: 'spelling-alphabet',
  title: 'Spelling alphabet',
  category: 'Alphabets',
  type: 'encoder'
}

const alphabetSpecs = [
  /* eslint-disable no-multi-spaces */
  {
    name: 'nato',
    label: 'NATO/ICAO phonetic alphabet',
    characters: 'abcdefghijklmnopqrstuvwxxyz0123456789.',
    words: [
      'Alfa',     'Bravo',    'Charlie',  'Delta',    'Echo',     'Foxtrot',
      'Golf',     'Hotel',    'India',    'Juliett',  'Kilo',     'Lima',
      'Mike',     'November', 'Oscar',    'Papa',     'Quebec',   'Romeo',
      'Sierra',   'Tango',    'Uniform',  'Victor',   'Whiskey',  'X-ray',
      'Xray',     'Yankee',   'Zulu',     'Zero',     'One',      'Two',
      'Three',    'Four',     'Five',     'Six',      'Seven',    'Eight',
      'Nine',     'Stop'
    ]
  },
  {
    name: 'dutch',
    label: 'Dutch spelling alphabet',
    characters: [
      'a',  'b',  'c',  'd',  'e',  'f',  'g',  'h',  'ij', 'ij', 'i',  'j',
      'j',  'k',  'l',  'l',  'm',  'n',  'o',  'p',  'q',  'q',  'r',  'r',
      's',  't',  'u',  'v',  'w',  'x',  'y',  'z',  '0',  '1',  '2',  '3',
      '4',  '5',  '6',  '7',  '8',  '9'
    ],
    words: [
      'Anton',      'Bernhard',   'Cornelis',   'Dirk',       'Eduard',
      'Ferdinand',  'Gerard',     'Hendrik',    'IJmuiden',   'IJsbrand',
      'Izaak',      'Johan',      'Jacob',      'Karel',      'Lodewijk',
      'Leo',        'Maria',      'Nico',       'Otto',       'Pieter',
      'Quirinius',  'Quinten',    'Richard',    'Rudolf',     'Simon',
      'Theodoor',   'Utrecht',    'Victor',     'Willem',     'Xantippe',
      'Ypsilon',    'Zacharias',  'Nul',        'Een',        'Twee',
      'Drie',       'Vier',       'Vijf',       'Zes',        'Zeven',
      'Acht',       'Negen'
    ]
  },
  {
    name: 'german',
    label: 'German spelling alphabet',
    characters: 'abcdefghijkklmnopqrsstuvwxxyzzäööüüßß0123456789',
    words: [
      'Anton',      'Berta',      'Cäsar',      'Dora',       'Emil',
      'Friedrich',  'Gustav',     'Heinrich',   'Ida',        'Julius',
      'Kaufmann',   'Konrad',     'Ludwig',     'Martha',     'Nordpol',
      'Otto',       'Paula',      'Quelle',     'Richard',    'Samuel',
      'Siegfried',  'Theodor',    'Ulrich',     'Viktor',     'Wilhelm',
      'Xanthippe',  'Xaver',      'Ypsilon',    'Zacharias',  'Zürich',
      'Ärger',      'Ökonom',     'Österreich', 'Übermut',    'Übel',
      'Eszett',     'Scharfes S', 'Null',       'Eins',       'Zwei',
      'Drei',       'Vier',       'Fünf',       'Sechs',      'Sieben',
      'Acht',       'Neun'
    ]
  },
  {
    name: 'swedish',
    label: 'Swedish Armed Forces\' radio alphabet',
    characters: 'abcdefghijklmnopqrstuvwxyzåäö0123456789',
    words: [
      'Adam',       'Bertil',     'Caesar',     'David',      'Erik',
      'Filip',      'Gustav',     'Helge',      'Ivar',       'Johan',
      'Kalle',      'Ludvig',     'Martin',     'Niklas',     'Olof',
      'Petter',     'Qvintus',    'Rudolf',     'Sigurd',     'Tore',
      'Urban',      'Viktor',     'Wilhelm',    'Xerxes',     'Yngve',
      'Zäta',       'Åke',        'Ärlig',      'Östen',      'Nolla',
      'Ett',        'Tvåa',       'Trea',       'Fyra',       'Femma',
      'Sexa',       'Sju',        'Åtta',       'Nia'
    ]
  },
  {
    name: 'russian',
    label: 'Russian spelling alphabet (official, excludes Ё)',
    characters: 'абвгдежзийклмнопрстуфхцчшщъыьэюя0123456789.',
    words: [
      'Анна',       'Борис',        'Василий', 'Григорий',    'Дмитрий',
      'Елена',      'Женя',         'Зинаида', 'Иван',        'Иван краткий',
      'Константин', 'Леонид',       'Михаил',  'Николай',     'Ольга',
      'Павел',      'Роман',        'Семён',   'Татьяна',     'Ульяна',
      'Фёдор',      'Харитон',      'Цапля',   'Человек',     'Шура',
      'Щука',       'Твёрдый знак', 'Еры',     'Мягкий знак', 'Эхо',
      'Юрий',       'Яков',         'Ноль',    'Один',        'Два',
      'Три',        'Четыре',       'Пять',    'Шесть',       'Семь',
      'Восемь',     'Девять',       'Точка'
    ]
  },
  {
    name: 'russian-unofficial',
    label: 'Russian spelling alphabet (unofficial, includes Ё)',
    characters: 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя0123456789.',
    words: [
      'Антон',  'Борис',    'Василий',      'Галина', 'Дмитрий',
      'Елена',  'Ёлка',     'Жук',          'Зоя',    'Иван',
      'Йот',    'Киловатт', 'Леонид',       'Мария',  'Николай',
      'Ольга',  'Павел',    'Радио',        'Сергей', 'Тамара',
      'Ульяна', 'Фёдор',    'Харитон',      'Центр',  'Человек',
      'Шура',   'Щука',     'Твёрдый знак', 'Игрек',  'Мягкий знак',
      'Эмма',   'Юрий',     'Яков',         'Ноль',   'Один',
      'Два',    'Три',      'Четыре',       'Пять',   'Шесть',
      'Семь',   'Восемь',   'Девять',       'Точка'
    ]
  }
  /* eslint-enable no-multi-spaces */
]

const spaceWord = '(space)'

/**
 * Encoder brick translating characters into words of given spelling alphabet.
 */
export default class SpellingAlphabetEncoder extends Encoder {
  /**
   * Returns brick meta.
   * @return {object}
   */
  static getMeta () {
    return meta
  }

  /**
   * Constructor
   */
  constructor () {
    super()
    this._characterMap = {}
    this._wordMap = {}

    this.addSetting({
      name: 'alphabet',
      type: 'enum',
      elements: alphabetSpecs.map(alphabet => alphabet.name),
      labels: alphabetSpecs.map(alphabet => alphabet.label),
      randomizable: false,
      style: 'radio'
    })

    this.buildTranslationMap()
  }

  /**
   * Performs encode or decode on given content.
   * @protected
   * @param {Chain} content
   * @param {boolean} isEncode True for encoding, false for decoding
   * @return {number[]|string|Uint8Array|Chain|Promise} Resulting content
   */
  performTranslate (content, isEncode) {
    // Retrieve content string and normalize its whitespaces
    const string = StringUtil.normalizeWhitespaces(content.getString())

    // Alphabet characters
    const replacementMap = isEncode ? this._characterMap : this._wordMap
    const searchValues = Object.keys(replacementMap).sort((a, b) => b.length - a.length);

    let index = 0
    const resultValues = []

    while (index < string.length) {
      // Find next occurance in string
      const searchValue = searchValues.find(value =>
        string.substr(index, value.length).toLowerCase() === value)

      if (searchValue !== undefined) {
        // Append char (in encode mode) or word (in decode mode) to result
        resultValues.push(replacementMap[searchValue])
        index += searchValue.length
      } else {
        const char = string.substr(index, 1)
        // Omit whitespaces when decoding
        if (isEncode || char !== ' ') {
          // Append foreign character to result
          resultValues.push(char)
        }
        index++
      }
    }

    // String together result
    return resultValues.join(isEncode ? ' ' : '')
  }

  /**
   * Triggered when a setting field has changed.
   * @protected
   * @param {Field} setting Sender setting field
   * @param {mixed} value New field value
   */
  settingValueDidChange (setting, value) {
    switch (setting.getName()) {
      case 'alphabet':
        this.buildTranslationMap()
        break
    }
  }

  /**
   * Builds translation map.
   * @protected
   * @return {SpellingAlphabetEncoder} Fluent interface
   */
  buildTranslationMap () {
    const name = this.getSettingValue('alphabet')
    const spec = alphabetSpecs.find(spec => spec.name === name)
    if (spec === undefined) {
      throw new Error(`Alphabet with name '${name}' is not defined`)
    }

    // Read spec
    const characters =
      typeof spec.characters === 'string'
        ? spec.characters.split('')
        : spec.characters

    const words = spec.words

    // Build encode map
    const characterMap = {}
    characters.forEach((character, index) => {
      if (characterMap[character] === undefined) {
        characterMap[character] = words[index]
      }
    })

    // Build decode map
    const wordMap = {}
    words.forEach((word, index) => {
      word = word.toLowerCase()
      if (wordMap[word] === undefined) {
        wordMap[word] = characters[index]
      }
    })

    // Add space character
    characterMap[' '] = spaceWord
    wordMap[spaceWord] = ' '

    this._characterMap = characterMap
    this._wordMap = wordMap
    return this
  }
}
