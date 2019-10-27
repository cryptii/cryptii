
import Encoder from '../Encoder'
import StringUtil from '../StringUtil'
import ResourceLoader from '../ResourceLoader'

const meta = {
  name: 'spelling-alphabet',
  title: 'Spelling alphabet',
  category: 'Alphabets',
  type: 'encoder'
}

const defaultSpaceWord = '(space)'

const wrapInArray = obj => obj === undefined || obj === null ? [] :
  Array.isArray(obj) ? [...obj] : [obj]

/**
 * Encoder brick translating characters into words of given spelling alphabet.
 */
export default class SpellingAlphabetEncoder extends Encoder {
  /**
   * Returns brick meta.
   * @return {object}
   */
  static getMeta() {
    return meta
  }

  constructor (alphabetSpecs) {
    super()
    this._alphabetSpecs = alphabetSpecs
  }

  async initAsync() {
    await super.initAsync()

    if (this._alphabetSpecs === undefined) {
      this._alphabetSpecs = await ResourceLoader.loadJson('SpellingAlphabets.json')
    }

    this._characterMap = {}
    this._wordMap = {}

    await this.addSetting({
      name: 'alphabet',
      type: 'enum',
      elements: this._alphabetSpecs.map(alphabet => alphabet.name),
      labels: this._alphabetSpecs.map(alphabet => alphabet.label),
      randomizable: false,
      style: 'radio'
    })

    await this.addSetting({
      name: 'variant',
      type: 'enum',
      elements: [''],
      labels: [''],
      randomizable: false
    })

    const defaultAlphabet = this._alphabetSpecs.find(alphabet => alphabet.isDefault === true)

    if (defaultAlphabet !== undefined) {
      this.setSettingValue('alphabet', defaultAlphabet.name)
    } else {
      this.buildTranslationMap()
    }

    return this
  }

  /**
   * Performs encode or decode on given content.
   * @protected
   * @param {Chain} content
   * @param {boolean} isEncode True for encoding, false for decoding
   * @return {number[]|string|Uint8Array|Chain|Promise} Resulting content
   */
  performTranslate(content, isEncode) {
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
      case 'variant':
        this._applyVariantOverrides()
        break;
    }
  }

  /**
   * Builds translation map.
   * @protected
   * @return {SpellingAlphabetEncoder} Fluent interface
   */
  buildTranslationMap () {
    const spec = this._getAlphabetSpec()

    const variantSetting = this.getSetting('variant')
    const universalVariant = {
      name: 'universal',
      label: 'Universal',
      description: 'Uses the most commonly used word for encoding\nCombines all known words for decoding.'
    }
    const variants = [universalVariant, ...(spec.variants || [])]

    variantSetting.setElements(variants.map(v => v.name), variants.map(v => v.label), variants.map(v => v.description), false)
    variantSetting.setValue('universal')
    this._applyVariantOverrides()

    return this
  }

  _getAlphabetSpec() {
      const alphabetName = this.getSettingValue('alphabet');
      const spec = this._alphabetSpecs.find(spec => spec.name === alphabetName);
      if (spec === undefined) {
        throw new Error(`Alphabet with name '${alphabetName}' is not defined`);
      }
      return spec;
  }

  _applyVariantOverrides () {
    const spec = this._getAlphabetSpec()
    const alphabetName = this.getSettingValue('alphabet');
    const variantName = this.getSettingValue('variant');
    const characterMap = {};
    const wordMap = {}

    for (let mapping of spec.mappings) {
      const characters = wrapInArray(mapping.character)
      let words = wrapInArray(mapping.word)
      const overrides = wrapInArray(mapping.override)

      const processVariant = currentVariantName => {
        let primaryWord = undefined
        let secondaryWords = []

        for (let override of overrides) {
          if (variantName == 'universal' && override.skipInUniversalEncoder) {
            continue
          }
          const overrideWords = wrapInArray(override.word)
          const variants = wrapInArray(override.variant).filter(v => v === currentVariantName || v.name === currentVariantName)
          if (variants.length > 1) {
            throw new Error(`Alphabet with name '${alphabetName}' has override with word '${overrideWords[0]}' where variant '${currentVariantName}' specified more than once`);
          }
          const variant = variants[0]
          if (!variant) {
            continue
          }
          const isPrimary = typeof variant === 'string' || variant.primary === true
          if (isPrimary) {
            if (primaryWord === undefined) {
              primaryWord = overrideWords[0] || null
              secondaryWords.push(...overrideWords.slice(1))
            } else {
              throw new Error(`Alphabet with name '${alphabetName}' has multiple primary words for variant '${currentVariantName}'. Some of them: '${primaryWord}', '${overrideWords[0]}'`);
            }
          } else {
            secondaryWords.push(...overrideWords)
          }
        }

        return [primaryWord, secondaryWords]
      }

      if (variantName === 'universal') {
        for (let currentVariantName of wrapInArray(spec.variants).map(v => v.name)) {
          let [primaryWord, secondaryWords] = processVariant(currentVariantName)
          if (primaryWord !== undefined && primaryWord !== null) {
            words.push(primaryWord)
          }
          words.push(...secondaryWords)
        }
      }
      else {
        let [primaryWord, secondaryWords] = processVariant(variantName)
        if (primaryWord === null) {
          words = []
        } else if (primaryWord !== undefined) {
          words = [primaryWord]
        }
        words.push(...secondaryWords)
      }

      if (characters.length > 0 && words.length > 0) {
        for (let character of characters) {
          if (characterMap[character] !== undefined && characterMap[character] !== words[0]) {
            throw new Error(`Alphabet with name '${alphabetName}' has multiple mappings with character '${character}'`)
          }
          characterMap[character] = words[0]
        }

        for (let word of words) {
          if (wordMap[word] !== undefined && wordMap[word] !== characters[0]) {
            throw new Error(`Alphabet with name '${alphabetName}' has multiple mappings with word '${word}'`)
          }
          wordMap[word] = characters[0]
        }
      }
    }

    if (characterMap[' '] === undefined) {
      characterMap[' '] = defaultSpaceWord
      wordMap[defaultSpaceWord] = ' '
    }

    this._characterMap = characterMap
    this._wordMap = wordMap
  }
}
