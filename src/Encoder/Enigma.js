
import ArrayUtil from '../ArrayUtil'
import Chain from '../Chain'
import Encoder from '../Encoder'
import MathUtil from '../MathUtil'

const meta = {
  name: 'enigma',
  title: 'Enigma',
  category: 'Cipher machines',
  type: 'encoder'
}

const models = [
  {
    name: 'I',
    label: 'Enigma I'
  },
  {
    name: 'M3',
    label: 'Enigma M3'
  },
  {
    name: 'M4',
    label: 'Enigma M4'
  }
]

const rotors = [
  {
    name: 'I',
    label: 'I',
    type: 'rotor',
    models: ['I', 'M3', 'M4'],
    wiring: 'ekmflgdqvzntowyhxuspaibrcj',
    notches: 'q'
  },
  {
    name: 'II',
    label: 'II',
    type: 'rotor',
    models: ['I', 'M3', 'M4'],
    wiring: 'ajdksiruxblhwtmcqgznpyfvoe',
    notches: 'e'
  },
  {
    name: 'III',
    label: 'III',
    type: 'rotor',
    models: ['I', 'M3', 'M4'],
    wiring: 'bdfhjlcprtxvznyeiwgakmusqo',
    notches: 'v'
  },
  {
    name: 'IV',
    label: 'IV',
    type: 'rotor',
    models: ['I', 'M3', 'M4'],
    wiring: 'esovpzjayquirhxlnftgkdcmwb',
    notches: 'j'
  },
  {
    name: 'V',
    label: 'V',
    type: 'rotor',
    models: ['I', 'M3', 'M4'],
    wiring: 'vzbrgityupsdnhlxawmjqofeck',
    notches: 'z'
  },
  {
    name: 'VI',
    label: 'VI',
    type: 'rotor',
    models: ['I', 'M3', 'M4'],
    wiring: 'jpgvoumfyqbenhzrdkasxlictw',
    notches: 'zm'
  },
  {
    name: 'VII',
    label: 'VII',
    type: 'rotor',
    models: ['I', 'M3', 'M4'],
    wiring: 'nzjhgrcxmyswboufaivlpekqdt',
    notches: 'zm'
  },
  {
    name: 'VIII',
    label: 'VIII',
    type: 'rotor',
    models: ['I', 'M3', 'M4'],
    wiring: 'fkqhtlxocbjspdzramewniuygv',
    notches: 'zm'
  },
  {
    name: 'UKW-A',
    label: 'UKW A (1930-1937)',
    type: 'reflector',
    wiring: 'ejmzalyxvbwfcrquontspikhgd',
    notches: null
  },
  {
    name: 'UKW-B',
    label: 'UKW B (1937-1945)',
    type: 'reflector',
    wiring: 'yruhqsldpxngokmiebfzcwvjat',
    notches: null
  },
  {
    name: 'UKW-C',
    label: 'UKW C (1940-1941)',
    type: 'reflector',
    wiring: 'fvpjiaoyedrzxwgctkuqsbnmhl',
    notches: null
  }
]

// model and rotor map get created lazily
let modelMap = null
let rotorMap = null

/**
 * Encoder Brick for Enigma I, M3, M4 encoding and decoding.
 */
export default class EnigmaEncoder extends Encoder {
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

    // collect rotor names and labels
    let rotorNames = []
    let rotorLabels = []

    rotors
      .filter(rotor => rotor.type === 'rotor')
      .forEach(rotor => {
        rotorNames.push(rotor.name)
        rotorLabels.push(rotor.label)
      })

    // collect reflector names and labels
    let reflectorNames = []
    let reflectorLabels = []

    rotors
      .filter(rotor => rotor.type === 'reflector')
      .forEach(rotor => {
        reflectorNames.push(rotor.name)
        reflectorLabels.push(rotor.label)
      })

    this.registerSetting([
      {
        name: 'model',
        type: 'enum',
        options: {
          elements: models.map(model => model.name),
          labels: models.map(model => model.label)
        }
      },
      {
        name: 'rotor1',
        label: 'Rotor 1',
        type: 'enum',
        width: 4,
        value: 'VI',
        options: {
          elements: rotorNames,
          labels: rotorLabels
        }
      },
      {
        name: 'rotor2',
        label: 'Rotor 2',
        type: 'enum',
        width: 4,
        value: 'I',
        options: {
          elements: rotorNames,
          labels: rotorLabels
        }
      },
      {
        name: 'rotor3',
        label: 'Rotor 3',
        type: 'enum',
        width: 4,
        value: 'III',
        options: {
          elements: rotorNames,
          labels: rotorLabels
        }
      },
      {
        name: 'position1',
        label: 'Position 1',
        type: 'number',
        width: 4,
        value: 1,
        options: {
          integer: true,
          min: 1,
          max: 26
        }
      },
      {
        name: 'position2',
        label: 'Position 2',
        type: 'number',
        width: 4,
        value: 17,
        options: {
          integer: true,
          min: 1,
          max: 26
        }
      },
      {
        name: 'position3',
        label: 'Position 3',
        type: 'number',
        width: 4,
        value: 12,
        options: {
          integer: true,
          min: 1,
          max: 26
        }
      },
      {
        name: 'reflector',
        type: 'enum',
        value: 'UKW-B',
        options: {
          elements: reflectorNames,
          labels: reflectorLabels
        }
      },
      {
        name: 'plugboard',
        type: 'text',
        value: 'bq cr di ej kw mt os px uz gh',
        validateValue: this.validatePlugboardValue.bind(this),
        filterValue: value => new Chain(value.getString().trim().toLowerCase())
      },
      {
        name: 'includeForeignChars',
        type: 'boolean',
        label: 'Foreign Chars',
        value: false,
        options: {
          trueLabel: 'Include',
          falseLabel: 'Ignore'
        }
      }
    ])
  }

  /**
   * Performs encode or decode on given content.
   * @protected
   * @param {Chain} content
   * @param {boolean} isEncode True for encoding, false for decoding
   * @return {Chain}
   */
  performTranslate (content, isEncode) {
    let includeForeignChars = this.getSettingValue('includeForeignChars')

    // retrieve selected rotors
    let rotors = [
      EnigmaEncoder.findRotor(this.getSettingValue('rotor1')),
      EnigmaEncoder.findRotor(this.getSettingValue('rotor2')),
      EnigmaEncoder.findRotor(this.getSettingValue('rotor3'))
    ]

    // retrieve initial rotor positions
    let positions = [
      this.getSettingValue('position1') - 1,
      this.getSettingValue('position2') - 1,
      this.getSettingValue('position3') - 1
    ]

    // retrieve reflector
    let reflector = EnigmaEncoder.findRotor(this.getSettingValue('reflector'))

    // compose plugboard wiring
    let plugboard = this.getSettingValue('plugboard')
    let plugboardWiring = this.composePlugboardWiring(plugboard.toString())

    // go through each content code point
    let encodedCodePoints = content.getCodePoints().map((codePoint, index) => {
      let charIndex = null

      if (codePoint >= 65 && codePoint <= 90) {
        // read uppercase character
        charIndex = codePoint - 65
      } else if (codePoint >= 97 && codePoint <= 122) {
        // read lowercase character
        charIndex = codePoint - 97
      }

      if (charIndex === null) {
        // this is a foreign character
        return includeForeignChars ? codePoint : false
      }

      // is middle rotor at notch
      if (this.rotorAtNotch(rotors[1], positions[1])) {
        // shift both middle and left rotor
        positions[0]++
        positions[1]++

        // is right rotor at notch
      } else if (this.rotorAtNotch(rotors[2], positions[2])) {
        // shift middle rotor
        positions[1]++
      }

      // shift right rotor at every turn
      positions[2]++

      // wire character through rotors
      charIndex = this.rotorMapChar(plugboardWiring, 0, charIndex, false)
      charIndex = this.rotorMapChar(rotors[2], positions[2], charIndex, false)
      charIndex = this.rotorMapChar(rotors[1], positions[1], charIndex, false)
      charIndex = this.rotorMapChar(rotors[0], positions[0], charIndex, false)
      charIndex = this.rotorMapChar(reflector, 0, charIndex, false)
      charIndex = this.rotorMapChar(rotors[0], positions[0], charIndex, true)
      charIndex = this.rotorMapChar(rotors[1], positions[1], charIndex, true)
      charIndex = this.rotorMapChar(rotors[2], positions[2], charIndex, true)
      charIndex = this.rotorMapChar(plugboardWiring, 0, charIndex, true)

      // translate char index back to code point and return it
      return charIndex + 97
    })

    if (!includeForeignChars) {
      let codePoints = []

      encodedCodePoints.forEach(codePoint => {
        // filter foreign characters
        if (codePoint === false) {
          return
        }

        // append a space after each 5 character pair
        if ((codePoints.length + 1) % 6 === 0) {
          codePoints.push(32)
        }

        // append code point
        codePoints.push(codePoint)
      })

      encodedCodePoints = codePoints
    }

    return Chain.wrap(encodedCodePoints)
  }

  /**
   * Checks if given rotor has a notch at given position.
   * @protected
   * @param {object} rotor Rotor entry
   * @param {number} position Rotor position
   * @return {boolean} True, if rotor has a notch at given position.
   */
  rotorAtNotch (rotor, position) {
    let positionChar = String.fromCharCode(97 + MathUtil.mod(position, 26))
    return rotor.notches.indexOf(positionChar) !== -1
  }

  /**
   * Wires character index (0-25) through given rotor at given position.
   * @protected
   * @param {object|string} rotorOrWiring Rotor entry or wiring
   * @param {number} position Rotor position
   * @param {number} charIndex Character index (0-25)
   * @param {boolean} isReverse Wether to wire backwards.
   * @return {number} Mapped character index (0-25)
   */
  rotorMapChar (rotorOrWiring, position, charIndex, isReverse) {
    let wiring = typeof rotorOrWiring === 'string'
      ? rotorOrWiring
      : rotorOrWiring.wiring

    charIndex = MathUtil.mod(charIndex + position, 26)
    charIndex = !isReverse
      ? wiring.charCodeAt(charIndex) - 97
      : wiring.indexOf(String.fromCharCode(97 + charIndex))
    charIndex = MathUtil.mod(charIndex - position, 26)
    return charIndex
  }

  /**
   * Validates plugboard setting value.
   * @param {mixed} rawValue
   * @param {Setting} setting
   * @return {boolean} Returns true, if value is valid.
   */
  validatePlugboardValue (rawValue, setting) {
    // filter raw value
    let plugboard = setting.filterValue(rawValue).getString()

    // empty plugboard is valid
    if (plugboard === '') {
      return true
    }

    // check format (ab cd ef)
    if (plugboard.match(/^([a-z]{2}\s)*([a-z]{2})$/) === null) {
      return {
        key: 'enigmaPlugboardInvalidFormat',
        message:
          `Invalid plugboard format: pairs of letters to be swapped ` +
          `expected (e.g. 'ab cd ef')`
      }
    }

    // check if character pairs are unique
    if (!ArrayUtil.isUnique(plugboard.replace(/\s/g, '').split(''))) {
      return {
        key: 'enigmaPlugboardPairsNotUnique',
        message: `Pairs of letters to be swapped need to be unique`
      }
    }

    return true
  }

  /**
   * Creates plugboard wiring from plugboard setting value.
   * @param {string} plugboard
   * @return {object} Rotor entry
   */
  composePlugboardWiring (plugboard) {
    let wiring = 'abcdefghijklmnopqrstuvwxyz'.split('')
    plugboard.split(' ').forEach(pair => {
      wiring[pair.charCodeAt(0) - 97] = pair[1]
      wiring[pair.charCodeAt(1) - 97] = pair[0]
    })
    return wiring.join('')
  }

  /**
   * Finds model entry by given name.
   * @protected
   * @param {string} name Model name
   * @return {object|null} Returns model entry or null if not found.
   */
  static findModel (name) {
    if (modelMap === null) {
      modelMap = {}
      models.forEach(model => {
        modelMap[model.name] = model
      })
    }
    return modelMap[name] || null
  }

  /**
   * Finds rotor entry by given name.
   * @protected
   * @param {string} name Rotor name
   * @return {object|null} Returns rotor entry or null if not found.
   */
  static findRotor (name) {
    if (rotorMap === null) {
      rotorMap = {}
      rotors.forEach(rotor => {
        rotorMap[rotor.name] = rotor
      })
    }
    return rotorMap[name] || null
  }
}
