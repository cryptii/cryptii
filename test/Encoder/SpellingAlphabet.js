
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
      'Theodoor Ypsilon Pieter Izaak Simon Cornelis Hendrik (space) Karel ' +
      'Anton Ferdinand (space) Bernhard IJmuiden (space) Zacharias Otto ' +
      '(space) Eduard Xantippe Quirinius Utrecht Izaak Simon (space) Gerard ' +
      'Eduard Victor Otto Richard Maria Dirk Eduard (space) Johan Utrecht ' +
      'Willem Eduard Lodewijk Eduard Nico'
  },
  {
    settings: { alphabet: 'german' },
    content: 'jörg bäckt quasi zwei haxenfüße vom wildpony',
    expectedResult:
      'Julius Ökonom Richard Gustav (space) Berta Ärger Cäsar Kaufmann ' +
      'Theodor (space) Quelle Ulrich Anton Samuel Ida (space) Zacharias ' +
      'Wilhelm Emil Ida (space) Heinrich Anton Xanthippe Emil Nordpol ' +
      'Friedrich Übermut Eszett Emil (space) Viktor Otto Martha (space) ' +
      'Wilhelm Ida Ludwig Dora Paula Otto Nordpol Ypsilon'
  },
  {
    settings: { alphabet: 'swedish' },
    content: 'yxskaftbud, ge vår wc-zonmö iq-hjälp.',
    expectedResult:
      'Yngve Xerxes Sigurd Kalle Adam Filip Tore Bertil Urban David , ' +
      '(space) Gustav Erik (space) Viktor Åke Rudolf (space) Wilhelm Caesar ' +
      '- Zäta Olof Niklas Martin Östen (space) Ivar Qvintus - Helge Johan ' +
      'Ärlig Ludvig Petter .'
  }
]))
