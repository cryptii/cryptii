
import Encoder from '../Encoder'
import StringUtil from '../StringUtil'

const meta = {
  name: 'spelling-alphabet',
  title: 'Spelling alphabet',
  category: 'Alphabets',
  type: 'encoder'
}

const defaultAlphabetSpecs = [
  /* eslint-disable no-multi-spaces */
  {
    name: 'nato',
    label: 'NATO/ICAO phonetic alphabet',
    mappings: [
      {
        character: 'a',
        word: 'Alfa'
      },
      {
        character: 'b',
        word: 'Bravo'
      },
      {
        character: 'c',
        word: 'Charlie'
      },
      {
        character: 'd',
        word: 'Delta'
      },
      {
        character: 'e',
        word: 'Echo'
      },
      {
        character: 'f',
        word: 'Foxtrot'
      },
      {
        character: 'g',
        word: 'Golf'
      },
      {
        character: 'h',
        word: 'Hotel'
      },
      {
        character: 'i',
        word: 'India'
      },
      {
        character: 'j',
        word: 'Juliett'
      },
      {
        character: 'k',
        word: 'Kilo'
      },
      {
        character: 'l',
        word: 'Lima'
      },
      {
        character: 'm',
        word: 'Mike'
      },
      {
        character: 'n',
        word: 'November'
      },
      {
        character: 'o',
        word: 'Oscar'
      },
      {
        character: 'p',
        word: 'Papa'
      },
      {
        character: 'q',
        word: 'Quebec'
      },
      {
        character: 'r',
        word: 'Romeo'
      },
      {
        character: 's',
        word: 'Sierra'
      },
      {
        character: 't',
        word: 'Tango'
      },
      {
        character: 'u',
        word: 'Uniform'
      },
      {
        character: 'v',
        word: 'Victor'
      },
      {
        character: 'w',
        word: 'Whiskey'
      },
      {
        character: 'x',
        word: ['X-ray', 'Xray']
      },
      {
        character: 'y',
        word: 'Yankee'
      },
      {
        character: 'z',
        word: 'Zulu'
      },
      {
        character: '0',
        word: 'Zero'
      },
      {
        character: '1',
        word: 'One'
      },
      {
        character: '2',
        word: 'Two'
      },
      {
        character: '3',
        word: 'Three'
      },
      {
        character: '4',
        word: 'Four'
      },
      {
        character: '5',
        word: 'Five'
      },
      {
        character: '6',
        word: 'Six'
      },
      {
        character: '7',
        word: 'Seven'
      },
      {
        character: '8',
        word: 'Eight'
      },
      {
        character: '9',
        word: 'Nine'
      },
      {
        character: '.',
        word: 'Stop'
      }
    ],
    spaceWord: '(space)'
  },
  {
    name: 'dutch',
    label: 'Dutch spelling alphabet',
    mappings: [
      {
        character: 'a',
        word: 'Anton'
      },
      {
        character: 'b',
        word: 'Bernhard'
      },
      {
        character: 'c',
        word: 'Cornelis'
      },
      {
        character: 'd',
        word: 'Dirk'
      },
      {
        character: 'e',
        word: 'Eduard'
      },
      {
        character: 'f',
        word: 'Ferdinand'
      },
      {
        character: 'g',
        word: 'Gerard'
      },
      {
        character: 'h',
        word: 'Hendrik'
      },
      {
        character: 'ij',
        word: ['IJmuiden', 'IJsbrand']
      },
      {
        character: 'i',
        word: 'Izaak'
      },
      {
        character: 'j',
        word: ['Johan', 'Jacob']
      },
      {
        character: 'k',
        word: 'Karel'
      },
      {
        character: 'l',
        word: ['Lodewijk', 'Leo']
      },
      {
        character: 'm',
        word: 'Maria'
      },
      {
        character: 'n',
        word: 'Nico'
      },
      {
        character: 'o',
        word: 'Otto'
      },
      {
        character: 'p',
        word: 'Pieter'
      },
      {
        character: 'q',
        word: ['Quirinius', 'Quinten']
      },
      {
        character: 'r',
        word: ['Richard', 'Rudolf']
      },
      {
        character: 's',
        word: 'Simon'
      },
      {
        character: 't',
        word: 'Theodoor'
      },
      {
        character: 'u',
        word: 'Utrecht'
      },
      {
        character: 'v',
        word: 'Victor'
      },
      {
        character: 'w',
        word: 'Willem'
      },
      {
        character: 'x',
        word: 'Xantippe'
      },
      {
        character: 'y',
        word: 'Ypsilon'
      },
      {
        character: 'z',
        word: 'Zacharias'
      },
      {
        character: '0',
        word: 'Nul'
      },
      {
        character: '1',
        word: 'Een'
      },
      {
        character: '2',
        word: 'Twee'
      },
      {
        character: '3',
        word: 'Drie'
      },
      {
        character: '4',
        word: 'Vier'
      },
      {
        character: '5',
        word: 'Vijf'
      },
      {
        character: '6',
        word: 'Zes'
      },
      {
        character: '7',
        word: 'Zeven'
      },
      {
        character: '8',
        word: 'Acht'
      },
      {
        character: '9',
        word: 'Negen'
      },
    ],
    spaceWord: '(spatiebalk)'
  },
  {
    name: 'german',
    label: 'German spelling alphabet',
    mappings: [
      {
        character: 'a',
        word: 'Anton'
      },
      {
        character: 'b',
        word: 'Berta'
      },
      {
        character: 'c',
        word: 'Cäsar'
      },
      {
        character: 'd',
        word: 'Dora'
      },
      {
        character: 'e',
        word: 'Emil'
      },
      {
        character: 'f',
        word: 'Friedrich'
      },
      {
        character: 'g',
        word: 'Gustav'
      },
      {
        character: 'h',
        word: 'Heinrich'
      },
      {
        character: 'i',
        word: 'Ida'
      },
      {
        character: 'j',
        word: 'Julius'
      },
      {
        character: 'k',
        word: ['Kaufmann', 'Konrad']
      },
      {
        character: 'l',
        word: 'Ludwig'
      },
      {
        character: 'm',
        word: 'Martha'
      },
      {
        character: 'n',
        word: 'Nordpol'
      },
      {
        character: 'o',
        word: 'Otto'
      },
      {
        character: 'p',
        word: 'Paula'
      },
      {
        character: 'q',
        word: 'Quelle'
      },
      {
        character: 'r',
        word: 'Richard'
      },
      {
        character: 's',
        word: ['Samuel', 'Siegfried']
      },
      {
        character: 't',
        word: 'Theodor'
      },
      {
        character: 'u',
        word: 'Ulrich'
      },
      {
        character: 'v',
        word: 'Viktor'
      },
      {
        character: 'w',
        word: 'Wilhelm'
      },
      {
        character: 'x',
        word: ['Xanthippe', 'Xaver']
      },
      {
        character: 'y',
        word: 'Ypsilon'
      },
      {
        character: 'z',
        word: ['Zacharias', 'Zürich']
      },
      {
        character: 'ä',
        word: 'Ärger'
      },
      {
        character: 'ö',
        word: ['Ökonom', 'Österreich']
      },
      {
        character: 'ü',
        word: ['Übermut', 'Übel']
      },
      {
        character: 'ß',
        word: ['Eszett', 'Scharfes S']
      },
      {
        character: '0',
        word: 'Null'
      },
      {
        character: '1',
        word: 'Eins'
      },
      {
        character: '2',
        word: 'Zwei'
      },
      {
        character: '3',
        word: 'Drei'
      },
      {
        character: '4',
        word: 'Vier'
      },
      {
        character: '5',
        word: 'Fünf'
      },
      {
        character: '6',
        word: 'Sechs'
      },
      {
        character: '7',
        word: 'Sieben'
      },
      {
        character: '8',
        word: 'Acht'
      },
      {
        character: '9',
        word: 'Neun'
      },
    ],
    spaceWord: '(Leertaste)'
  },
  {
    name: 'swedish',
    label: 'Swedish Armed Forces\' radio alphabet',
    mappings: [
      {
        character: 'a',
        word: 'Adam'
      },
      {
        character: 'b',
        word: 'Bertil'
      },
      {
        character: 'c',
        word: 'Caesar'
      },
      {
        character: 'd',
        word: 'David'
      },
      {
        character: 'e',
        word: 'Erik'
      },
      {
        character: 'f',
        word: 'Filip'
      },
      {
        character: 'g',
        word: 'Gustav'
      },
      {
        character: 'h',
        word: 'Helge'
      },
      {
        character: 'i',
        word: 'Ivar'
      },
      {
        character: 'j',
        word: 'Johan'
      },
      {
        character: 'k',
        word: 'Kalle'
      },
      {
        character: 'l',
        word: 'Ludvig'
      },
      {
        character: 'm',
        word: 'Martin'
      },
      {
        character: 'n',
        word: 'Niklas'
      },
      {
        character: 'o',
        word: 'Olof'
      },
      {
        character: 'p',
        word: 'Petter'
      },
      {
        character: 'q',
        word: 'Qvintus'
      },
      {
        character: 'r',
        word: 'Rudolf'
      },
      {
        character: 's',
        word: 'Sigurd'
      },
      {
        character: 't',
        word: 'Tore'
      },
      {
        character: 'u',
        word: 'Urban'
      },
      {
        character: 'v',
        word: 'Viktor'
      },
      {
        character: 'w',
        word: 'Wilhelm'
      },
      {
        character: 'x',
        word: 'Xerxes'
      },
      {
        character: 'y',
        word: 'Yngve'
      },
      {
        character: 'z',
        word: 'Zäta'
      },
      {
        character: 'å',
        word: 'Åke'
      },
      {
        character: 'ä',
        word: 'Ärlig'
      },
      {
        character: 'ö',
        word: 'Östen'
      },
      {
        character: '0',
        word: 'Nolla'
      },
      {
        character: '1',
        word: 'Ett'
      },
      {
        character: '2',
        word: 'Tvåa'
      },
      {
        character: '3',
        word: 'Trea'
      },
      {
        character: '4',
        word: 'Fyra'
      },
      {
        character: '5',
        word: 'Femma'
      },
      {
        character: '6',
        word: 'Sexa'
      },
      {
        character: '7',
        word: 'Sju'
      },
      {
        character: '8',
        word: 'Åtta'
      },
      {
        character: '9',
        word: 'Nia'
      }
    ],
    spaceWord: '(mellanslag)'
  },
  {
    name: 'russian',
    label: 'Russian spelling alphabet',
    mappings: [
      {
        character: 'а',
        word: ['Анна', 'Антон']
      },
      {
        character: 'б',
        word: 'Борис'
      },
      {
        character: 'в',
        word: 'Василий'
      },
      {
        character: 'г',
        word: ['Григорий', 'Галина']
      },
      {
        character: 'д',
        word: 'Дмитрий'
      },
      {
        character: 'е',
        word: 'Елена'
      },
      {
        character: 'ё',
        word: 'Ёлка'
      },
      {
        character: 'ж',
        word: ['Женя', 'Жук']
      },
      {
        character: 'з',
        word: ['Зинаида', 'Зоя']
      },
      {
        character: 'и',
        word: 'Иван'
      },
      {
        character: 'й',
        word: ['Иван краткий', 'Йот']
      },
      {
        character: 'к',
        word: ['Константин', 'Киловатт']
      },
      {
        character: 'л',
        word: 'Леонид'
      },
      {
        character: 'м',
        word: ['Михаил', 'Мария']
      },
      {
        character: 'н',
        word: 'Николай'
      },
      {
        character: 'о',
        word: 'Ольга'
      },
      {
        character: 'п',
        word: 'Павел'
      },
      {
        character: 'р',
        word: ['Роман', 'Радио']
      },
      {
        character: 'с',
        word: ['Семён', 'Сергей']
      },
      {
        character: 'т',
        word: ['Татьяна', 'Тамара']
      },
      {
        character: 'у',
        word: 'Ульяна'
      },
      {
        character: 'ф',
        word: 'Фёдор'
      },
      {
        character: 'х',
        word: 'Харитон'
      },
      {
        character: 'ц',
        word: ['Цапля', 'Центр']
      },
      {
        character: 'ч',
        word: 'Человек'
      },
      {
        character: 'ш',
        word: 'Шура'
      },
      {
        character: 'щ',
        word: 'Щука'
      },
      {
        character: 'ъ',
        word: 'Твёрдый знак'
      },
      {
        character: 'ы',
        word: ['Еры', 'Игрек']
      },
      {
        character: 'ь',
        word: 'Мягкий знак'
      },
      {
        character: 'э',
        word: ['Эхо', 'Эмма']
      },
      {
        character: 'ю',
        word: 'Юрий'
      },
      {
        character: 'я',
        word: 'Яков'
      },
      {
        character: '0',
        word: 'Ноль'
      },
      {
        character: '1',
        word: 'Один'
      },
      {
        character: '2',
        word: 'Два'
      },
      {
        character: '3',
        word: 'Три'
      },
      {
        character: '4',
        word: 'Четыре'
      },
      {
        character: '5',
        word: 'Пять'
      },
      {
        character: '6',
        word: 'Шесть'
      },
      {
        character: '7',
        word: 'Семь'
      },
      {
        character: '8',
        word: 'Восемь'
      },
      {
        character: '9',
        word: 'Девять'
      },
      {
        character: '.',
        word: 'Точка'
      }
    ],
    spaceWord: '(пробел)'
  }
  /* eslint-enable no-multi-spaces */
]

const defaultSpaceWord = '(space)'

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
  constructor (alphabetSpecs = defaultAlphabetSpecs) {
    super()
    this._alphabetSpecs = alphabetSpecs
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
        string.substr(index, value.length).toLowerCase() === value.toLowerCase())

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
    const spec = this._alphabetSpecs.find(spec => spec.name === name)
    if (spec === undefined) {
      throw new Error(`Alphabet with name '${name}' is not defined`)
    }

    // Build encode/decode maps
    const characterMap = {};
    const wordMap = {}

    spec.mappings.forEach((mapping) => {
      const characters = Array.isArray(mapping.character) ? mapping.character : [mapping.character]
      const words = Array.isArray(mapping.word) ? mapping.word : [mapping.word]

      characters.forEach((character) => {
        if (characterMap[character] !== undefined) {
          throw new Error(`Alphabet with name '${name}' has multiple mappings with character '${character}'`)
        }
        characterMap[character] = words[0]
      })

      words.forEach((word) => {
        if (wordMap[word] !== undefined) {
          throw new Error(`Alphabet with name '${name}' has multiple mappings with word '${word}'`)
        }
        wordMap[word] = characters[0]
      })
    })

    const spaceWord = spec.spaceWord || defaultSpaceWord

    // Add space character
    characterMap[' '] = spaceWord
    wordMap[spaceWord] = ' '

    this._characterMap = characterMap
    this._wordMap = wordMap
    return this
  }
}
