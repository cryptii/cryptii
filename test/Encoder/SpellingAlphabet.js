
import { describe } from 'mocha'

import EncoderTester from '../Helper/EncoderTester'
import SpellingAlphabetEncoder from '../../src/Encoder/SpellingAlphabet'

/** @test {SpellingAlphabetEncoder} */
describe('SpellingAlphabetEncoder', () => EncoderTester.test(SpellingAlphabetEncoder, [
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
    settings: { alphabet: 'german' },
    content: 'jörg bäckt quasi zwei haxenfüße vom wildpony',
    expectedResult:
      'Julius Ökonom Richard Gustav (leertaste) Berta Ärger Cäsar Kaufmann ' +
      'Theodor (leertaste) Quelle Ulrich Anton Samuel Ida (leertaste) Zacharias ' +
      'Wilhelm Emil Ida (leertaste) Heinrich Anton Xanthippe Emil Nordpol ' +
      'Friedrich Übermut Eszett Emil (leertaste) Viktor Otto Martha (leertaste) ' +
      'Wilhelm Ida Ludwig Dora Paula Otto Nordpol Ypsilon'
  },
  {
    settings: { alphabet: 'swedish' },
    content: 'yxskaftbud, ge vår wc-zonmö iq-hjälp.',
    expectedResult:
      'Yngve Xerxes Sigurd Kalle Adam Filip Tore Bertil Urban David , ' +
      '(mellanslag) Gustav Erik (mellanslag) Viktor Åke Rudolf (mellanslag) Wilhelm Caesar ' +
      '- Zäta Olof Niklas Martin Östen (mellanslag) Ivar Qvintus - Helge Johan ' +
      'Ärlig Ludvig Petter .'
  }
]))
