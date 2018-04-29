
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
    label: 'Enigma I (Army, Air Force)',
    characterGroupSize: 5,
    slots: [
      { type: 'rotor' },
      { type: 'rotor' },
      { type: 'rotor' }
    ]
  },
  {
    name: 'M3',
    label: 'Enigma M3 (Army, Navy)',
    characterGroupSize: 5,
    slots: [
      { type: 'rotor' },
      { type: 'rotor' },
      { type: 'rotor' }
    ]
  },
  {
    name: 'M4',
    label: 'Enigma M4 "Shark" (Submarines)',
    characterGroupSize: 4,
    slots: [
      { type: 'rotor-thin' },
      { type: 'rotor' },
      { type: 'rotor' },
      { type: 'rotor' }
    ]
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
    models: ['M3', 'M4'],
    wiring: 'jpgvoumfyqbenhzrdkasxlictw',
    notches: 'zm'
  },
  {
    name: 'VII',
    label: 'VII',
    type: 'rotor',
    models: ['M3', 'M4'],
    wiring: 'nzjhgrcxmyswboufaivlpekqdt',
    notches: 'zm'
  },
  {
    name: 'VIII',
    label: 'VIII',
    type: 'rotor',
    models: ['M3', 'M4'],
    wiring: 'fkqhtlxocbjspdzramewniuygv',
    notches: 'zm'
  },
  {
    name: 'beta',
    label: 'Beta',
    type: 'rotor-thin',
    models: ['M4'],
    wiring: 'leyjvcnixwpbqmdrtakzgfuhos',
    rotating: false
  },
  {
    name: 'gamma',
    label: 'Gamma',
    type: 'rotor-thin',
    models: ['M4'],
    wiring: 'fsokanuerhmbtiycwlqpzxvgjd',
    rotating: false
  },
  {
    name: 'UKW-A',
    label: 'UKW A',
    type: 'reflector',
    models: ['I'],
    wiring: 'ejmzalyxvbwfcrquontspikhgd'
  },
  {
    name: 'UKW-B',
    label: 'UKW B',
    type: 'reflector',
    models: ['I', 'M3'],
    wiring: 'yruhqsldpxngokmiebfzcwvjat'
  },
  {
    name: 'UKW-C',
    label: 'UKW C',
    type: 'reflector',
    models: ['I', 'M3'],
    wiring: 'fvpjiaoyedrzxwgctkuqsbnmhl'
  },
  {
    name: 'UKW-B-thin',
    label: 'UKW B thin',
    type: 'reflector',
    models: ['M4'],
    wiring: 'enkqauywjicopblmdxzvfthrgs'
  },
  {
    name: 'UKW-C-thin',
    label: 'UKW C thin',
    type: 'reflector',
    models: ['M4'],
    wiring: 'rdobjntkvehmlfcwzaxgyipsuq'
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

    // retrieve default model with its rotors
    const model = EnigmaEncoder.findModel('M3')
    const rotors = EnigmaEncoder.filterRotors(model.name, 'rotor')
    const rotorNames = rotors.map(rotor => rotor.name)
    const rotorLabels = rotors.map(rotor => rotor.label)
    const reflectors = EnigmaEncoder.filterRotors(model.name, 'reflector')

    // model setting
    this.registerSetting({
      name: 'model',
      type: 'enum',
      value: model.name,
      priority: 1000,
      options: {
        elements: models.map(model => model.name),
        labels: models.map(model => model.label)
      }
    })

    // register settings for each possible slot
    for (let i = 0; i < EnigmaEncoder.getMaxSlotCount(); i++) {
      // rotor setting
      this.registerSetting({
        name: `rotor${i + 1}`,
        label: `Rotor ${i + 1}`,
        type: 'enum',
        value: rotorNames[0],
        options: {
          elements: rotorNames,
          labels: rotorLabels
        }
      })

      // position setting
      this.registerSetting({
        name: `position${i + 1}`,
        label: `Position ${i + 1}`,
        type: 'number',
        value: 1,
        options: {
          integer: true,
          min: 1,
          max: 27
        }
      })
    }

    // reflector setting
    this.registerSetting({
      name: 'reflector',
      type: 'enum',
      value: reflectors[0].name,
      options: {
        elements: reflectors.map(reflector => reflector.name),
        labels: reflectors.map(reflector => reflector.label)
      }
    })

    // plugboard setting
    this.registerSetting({
      name: 'plugboard',
      type: 'text',
      value: '',
      validateValue: this.validatePlugboardValue.bind(this),
      filterValue: value => new Chain(value.getString().trim().toLowerCase())
    })

    // foreign char setting
    this.registerSetting({
      name: 'includeForeignChars',
      type: 'boolean',
      label: 'Foreign Chars',
      value: false,
      options: {
        trueLabel: 'Include',
        falseLabel: 'Ignore'
      }
    })

    // apply options and layout for given model
    this.applyModel(model.name)
  }

  /**
   * Triggered when a setting value has changed.
   * @param {Setting} setting
   * @param {mixed} value Setting value
   */
  settingValueDidChange (setting, value) {
    super.settingValueDidChange(setting, value)
    if (setting.getName() === 'model') {
      this.applyModel(value)
    }
  }

  /**
   * Applies options and layout for given model.
   * @param {string} modelName Model name
   * @return {EnigmaEncoder} Fluent interface
   */
  applyModel (modelName) {
    const model = EnigmaEncoder.findModel(modelName)
    const maxSlotCount = EnigmaEncoder.getMaxSlotCount()

    // use horizontal layout if there are no more than 3 slots in use
    const horizontalLayout = model.slots.length <= 3

    // update setting options and layout for each slot
    for (let i = 0; i < maxSlotCount; i++) {
      const slot = i < model.slots.length ? model.slots[i] : null
      const rotorSetting = this.getSetting(`rotor${i + 1}`)
      const positionSetting = this.getSetting(`position${i + 1}`)

      // hide or show slot settings depending on model
      rotorSetting.setVisible(slot !== null)
      positionSetting.setVisible(slot !== null)

      if (slot !== null) {
        // configure and layout rotor setting
        const rotors = EnigmaEncoder.filterRotors(modelName, slot.type)

        rotorSetting
          .setElements(
            rotors.map(rotor => rotor.name),
            rotors.map(rotor => rotor.label),
            null, false)
          .setWidth(horizontalLayout ? 4 : 6)
          .setPriority(horizontalLayout
            ? maxSlotCount * 2 - i
            : (maxSlotCount - i) * 10 + 1)

        // apply slot default if current value is not available for this model
        if (rotorSetting.validateValue(rotorSetting.getValue()) !== true) {
          rotorSetting.setValue(rotors[0].name)
        }

        // layout position setting
        positionSetting
          .setWidth(horizontalLayout ? 4 : 6)
          .setPriority(horizontalLayout
            ? maxSlotCount - i
            : (maxSlotCount - i) * 10)
      }
    }

    // update reflector setting options
    const reflectors = EnigmaEncoder.filterRotors(modelName, 'reflector')
    const reflectorSetting = this.getSetting('reflector')

    reflectorSetting.setElements(
      reflectors.map(reflector => reflector.name),
      reflectors.map(reflector => reflector.label),
      null, false)

    // apply first rotor if current one is not available for this model
    if (reflectorSetting.validateValue(reflectorSetting.getValue()) !== true) {
      reflectorSetting.setValue(reflectors[0].name)
    }
  }

  /**
   * Performs encode or decode on given content.
   * @protected
   * @param {Chain} content
   * @param {boolean} isEncode True for encoding, false for decoding
   * @return {Chain}
   */
  performTranslate (content, isEncode) {
    const includeForeignChars = this.getSettingValue('includeForeignChars')
    const model = EnigmaEncoder.findModel(this.getSettingValue('model'))
    let i = 0

    // collect selected rotors and positions
    let rotors = []
    let positions = []
    for (i = 0; i < model.slots.length; i++) {
      rotors.push(EnigmaEncoder.findRotor(
        this.getSettingValue(`rotor${i + 1}`)))
      positions.push(this.getSettingValue(`position${i + 1}`) - 1)
    }

    // retrieve reflector
    const reflector = EnigmaEncoder.findRotor(this.getSettingValue('reflector'))

    // compose plugboard wiring
    const plugboard = this.getSettingValue('plugboard')
    const plugboardWiring = this.composePlugboardWiring(plugboard.toString())

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

      // shift rotor
      let rotorShifted = false
      i = 0

      while (!rotorShifted && ++i < rotors.length) {
        // check for notches
        if (this.rotorAtNotch(rotors[i], positions[i])) {
          // shift current rotor, if it is not the last one
          if (i !== rotors.length - 1) {
            positions[i]++
          }
          // shift rotor on its left
          if (rotors[i - 1].rotating !== false) {
            positions[i - 1]++
          }
          // set shifted flag
          rotorShifted = true
        }
      }

      // shift last rotor at every turn
      positions[positions.length - 1]++

      // wire characters through the plugboard
      charIndex = this.rotorMapChar(plugboardWiring, 0, charIndex, false)

      // through the rotors (from right to left)
      for (i = rotors.length - 1; i >= 0; i--) {
        charIndex = this.rotorMapChar(rotors[i], positions[i], charIndex, false)
      }

      // through the reflector
      charIndex = this.rotorMapChar(reflector, 0, charIndex, false)

      // through the rotors, again (from left to right)
      for (i = 0; i < rotors.length; i++) {
        charIndex = this.rotorMapChar(rotors[i], positions[i], charIndex, true)
      }

      // through the plugboard (inverted)
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

        // append a space after each character group
        if ((codePoints.length + 1) % (model.characterGroupSize + 1) === 0) {
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
    if (rotor.notches === undefined) {
      return false
    }
    const positionChar = String.fromCharCode(97 + MathUtil.mod(position, 26))
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
    const wiring = typeof rotorOrWiring === 'string'
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
    const plugboard = setting.filterValue(rawValue).getString()

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
    const wiring = 'abcdefghijklmnopqrstuvwxyz'.split('')
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
   * @return {?object} Returns model entry or null if not found.
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
   * Returns the max slot count for all available models.
   * @return {number} Max slot count
   */
  static getMaxSlotCount () {
    return models.reduce((max, model) => Math.max(max, model.slots.length), 0)
  }

  /**
   * Finds rotor entry by given name.
   * @protected
   * @param {string} name Rotor name
   * @return {?object} Returns rotor entry or null if not found.
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

  /**
   * Filters rotors by model and type.
   * @param {string} modelName Model name
   * @param {string} [type='rotor'] Rotor type
   * @return {object[]} Array of rotors
   */
  static filterRotors (modelName, type = 'rotor') {
    return rotors
      .filter(rotor =>
        rotor.type === type &&
        rotor.models.indexOf(modelName) !== -1)
  }
}
