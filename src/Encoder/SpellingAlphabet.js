
import Chain from '../Chain'
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
  }
  /* eslint-enable no-multi-spaces */
]

const spaceWord = '(space)'

/**
 * Encoder Brick translating characters into words of given spelling alphabet.
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

    this.registerSetting({
      name: 'alphabet',
      type: 'enum',
      options: {
        elements: alphabetSpecs.map(alphabet => alphabet.name),
        labels: alphabetSpecs.map(alphabet => alphabet.label)
      }
    })

    this.buildTranslationMap()
  }

  /**
   * Performs encode or decode on given content.
   * @protected
   * @param {Chain} content
   * @param {boolean} isEncode True for encoding, false for decoding
   * @return {Chain|Promise} Resulting content
   */
  performTranslate (content, isEncode) {
    // retrieve content string and normalize its whitespaces
    let string = StringUtil.normalizeWhitespaces(content.getString())

    // alphabet characters
    let replacementMap = isEncode ? this._characterMap : this._wordMap
    let searchValues = Object.keys(replacementMap)

    let index = 0
    let resultValues = []

    while (index < string.length) {
      // find next occurance in string
      let searchValue = searchValues.find(char =>
        string.substr(index, char.length).toLowerCase() === char)

      if (searchValue !== undefined) {
        // append word to result
        resultValues.push(replacementMap[searchValue])
        index += searchValue.length
      } else {
        let char = string.substr(index, 1)
        // omit whitespaces when decoding
        if (isEncode || char !== ' ') {
          // append foreign character to result
          resultValues.push(char)
        }
        index++
      }
    }

    // string together result
    let result = resultValues.join(isEncode ? ' ' : '')
    return Chain.wrap(result)
  }

  /**
   * Triggered when a setting value has changed.
   * @protected
   * @param {Setting} setting
   * @param {mixed} value Setting value
   * @return {Encoder} Fluent interface
   */
  settingValueDidChange (setting, value) {
    switch (setting.getName()) {
      case 'alphabet':
        this.buildTranslationMap()
        break
    }
    return super.settingValueDidChange(setting, value)
  }

  /**
   * Builds translation map.
   * @protected
   * @return {SpellingAlphabetEncoder} Fluent interface
   */
  buildTranslationMap () {
    let name = this.getSettingValue('alphabet')
    let spec = alphabetSpecs.find(spec => spec.name === name)
    if (spec === undefined) {
      throw new Error(`Alphabet with name '${name}' is not defined`)
    }

    // read spec
    let characters =
      typeof spec.characters === 'string'
      ? spec.characters.split('')
      : spec.characters

    let words = spec.words

    // build encode map
    let characterMap = {}
    characters.forEach((character, index) => {
      if (characterMap[character] === undefined) {
        characterMap[character] = words[index]
      }
    })

    // build decode map
    let wordMap = {}
    words.forEach((word, index) => {
      word = word.toLowerCase()
      if (wordMap[word] === undefined) {
        wordMap[word] = characters[index]
      }
    })

    // add space character
    characterMap[' '] = spaceWord
    wordMap[spaceWord] = ' '

    this._characterMap = characterMap
    this._wordMap = wordMap
    return this
  }
}
