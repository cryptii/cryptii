import { describe, it } from 'mocha'
import assert from 'assert'

import EncoderTester from '../Helper/EncoderTester'
import SpellingAlphabetEncoder from '../../src/Encoder/SpellingAlphabet'

/** @test {SpellingAlphabetEncoder} */
describe('SpellingAlphabetEncoder', () => {
  EncoderTester.test(SpellingAlphabetEncoder, [
    {
      settings: { alphabet: 'nato' },
      content: 'the quick brown fox jumps over 13 lazy dogs.',
      expectedResult:
        'Tango Hotel Echo (space) Quebec Uniform India Charlie Kilo (space) ' +
        'Bravo Romeo Oscar Whiskey November (space) Foxtrot Oscar X-ray ' +
        '(space) Juliett Uniform Mike Papa Sierra (space) Oscar Victor Echo ' +
        'Romeo (space) One Three (space) Lima Alfa Zulu Yankee (space) Delta ' +
        'Oscar Golf Sierra Stop'
    },
    {
      settings: { alphabet: 'nato' },
      content: 'X-Ray Xray',
      expectedResult: 'xx',
      direction: 'decode'
    },
    {
      settings: { alphabet: 'dutch' },
      content: 'typisch kaf bij zo exquis gevormde juwelen',
      expectedResult:
        'Theodoor Ypsilon Pieter Izaak Simon Cornelis Hendrik (spatiebalk) Karel ' +
        'Anton Ferdinand (spatiebalk) Bernhard IJmuiden (spatiebalk) Zacharias Otto ' +
        '(spatiebalk) Eduard Xantippe Quirinius Utrecht Izaak Simon (spatiebalk) Gerard ' +
        'Eduard Victor Otto Richard Maria Dirk Eduard (spatiebalk) Johan Utrecht ' +
        'Willem Eduard Lodewijk Eduard Nico'
    },
    {
      settings: { alphabet: 'dutch' },
      content:
        'IJmuiden IJsbrand (spatiebalk) Johan Jacob (spatiebalk) Lodewijk Leo (spatiebalk) ' +
        'Quirinius Quinten (spatiebalk) Richard Rudolf',
      expectedResult: 'ijij jj ll qq rr',
      direction: 'decode'
    },
    {
      settings: { alphabet: 'german' },
      content: 'jörg bäckt quasi zwei haxenfüße vom wildpony',
      expectedResult:
        'Julius Ökonom Richard Gustav (Leertaste) Berta Ärger Cäsar Kaufmann ' +
        'Theodor (Leertaste) Quelle Ulrich Anton Samuel Ida (Leertaste) Zacharias ' +
        'Wilhelm Emil Ida (Leertaste) Heinrich Anton Xanthippe Emil Nordpol ' +
        'Friedrich Übermut Eszett Emil (Leertaste) Viktor Otto Martha (Leertaste) ' +
        'Wilhelm Ida Ludwig Dora Paula Otto Nordpol Ypsilon'
    },
    {
      settings: { alphabet: 'german' },
      content:
        'Kaufmann Konrad (Leertaste) Samuel Siegfried (Leertaste) Xanthippe Xaver ' +
        '(Leertaste) Zacharias Zürich (Leertaste) Ökonom Österreich (Leertaste) ' +
        'Übermut Übel (Leertaste) Eszett Scharfes S',
      expectedResult: 'kk ss xx zz öö üü ßß',
      direction: 'decode'
    },
    {
      settings: { alphabet: 'swedish' },
      content: 'yxskaftbud, ge vår wc-zonmö iq-hjälp.',
      expectedResult:
        'Yngve Xerxes Sigurd Kalle Adam Filip Tore Bertil Urban David , ' +
        '(mellanslag) Gustav Erik (mellanslag) Viktor Åke Rudolf (mellanslag) Wilhelm Caesar ' +
        '- Zäta Olof Niklas Martin Östen (mellanslag) Ivar Qvintus - Helge Johan ' +
        'Ärlig Ludvig Petter .'
    },
    {
      settings: { alphabet: 'russian' },
      content: 'съешь же ещё этих мягких французских булок да выпей чаю 123 456 7890.',
      expectedResult:
        'Семён Твёрдый знак Елена Шура Мягкий знак (пробел) Женя Елена (пробел) ' +
        'Елена Щука Ёлка (пробел) Эхо Татьяна Иван Харитон (пробел) Михаил Яков ' +
        'Григорий Константин Иван Харитон (пробел) Фёдор Роман Анна Николай ' +
        'Цапля Ульяна Зинаида Семён Константин Иван Харитон (пробел) Борис ' +
        'Ульяна Леонид Ольга Константин (пробел) Дмитрий Анна (пробел) Василий ' +
        'Еры Павел Елена Иван краткий (пробел) Человек Анна Юрий (пробел) Один Два Три ' +
        '(пробел) Четыре Пять Шесть (пробел) Семь Восемь Девять Ноль Точка'
    },
    {
      settings: { alphabet: 'russian' },
      content:
        'Анна Антон (пробел) Григорий Галина (пробел) Женя Жук (пробел) Зинаида Зоя ' +
        '(пробел) Иван краткий Йот (пробел) Константин Киловатт (пробел) Михаил Мария ' +
        '(пробел) Роман Радио (пробел) Семён Сергей (пробел) Татьяна Тамара (пробел) ' +
        'Цапля Центр (пробел) Еры Игрек (пробел) Эхо Эмма',
      expectedResult: 'аа гг жж зз йй кк мм рр сс тт цц ыы ээ',
      direction: 'decode'
    }
  ])

  it('should fail on selection of the alphabet with duplicated characters', () => {
    const alphabetSpecs = [
      {
        name: 'GoodAlphabet',
        mappings: [
          {
            character: 'b',
            word: 'Word1'
          },
          {
            character: 'g',
            word: 'Word2'
          }
        ]
      },
      {
        name: 'BadAlphabet',
        mappings: [
          {
            character: 'b',
            word: 'Word1'
          },
          {
            character: 'b',
            word: 'Word2'
          }
        ]
      }
    ]

    const encoder = new SpellingAlphabetEncoder(alphabetSpecs)
    assert.throws(() => encoder.setSettingValue('alphabet', 'BadAlphabet'), error =>
      error.message.includes('\'BadAlphabet\'') && error.message.includes('\'b\'')
    )
  })

  it('should fail on selection of the alphabet with duplicated words', () => {
    const alphabetSpecs = [
      {
        name: 'GoodAlphabet',
        mappings: [
          {
            character: 'x',
            word: 'BadWord'
          },
          {
            character: 'y',
            word: 'GoodWord'
          }
        ]
      },
      {
        name: 'BadAlphabet',
        mappings: [
          {
            character: 'x',
            word: 'BadWord'
          },
          {
            character: 'y',
            word: 'BadWord'
          }
        ]
      }
    ]

    const encoder = new SpellingAlphabetEncoder(alphabetSpecs)
    assert.throws(() => encoder.setSettingValue('alphabet', 'BadAlphabet'), error =>
      error.message.includes('\'BadAlphabet\'') && error.message.includes('\'BadWord\'')
    )
  })
})
