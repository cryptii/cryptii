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
      'Julius Ökonom Richard Gustav (Leertaste) Berta Ärger Cäsar Kaufmann ' +
      'Theodor (Leertaste) Quelle Ulrich Anton Samuel Ida (Leertaste) Zacharias ' +
      'Wilhelm Emil Ida (Leertaste) Heinrich Anton Xanthippe Emil Nordpol ' +
      'Friedrich Übermut Eszett Emil (Leertaste) Viktor Otto Martha (Leertaste) ' +
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
  },
  {
    settings: { alphabet: 'russian' },
    content: 'съешь же еще этих мягких французских булок да выпей чаю 123 456 7890.',
    expectedResult:
      'Семён Твёрдый знак Елена Шура Мягкий знак (пробел) Женя Елена (пробел) ' +
      'Елена Щука Елена (пробел) Эхо Татьяна Иван Харитон (пробел) Михаил Яков ' +
      'Григорий Константин Иван Харитон (пробел) Фёдор Роман Анна Николай ' +
      'Цапля Ульяна Зинаида Семён Константин Иван Харитон (пробел) Борис ' +
      'Ульяна Леонид Ольга Константин (пробел) Дмитрий Анна (пробел) Василий ' +
      'Еры Павел Елена Иван краткий (пробел) Человек Анна Юрий (пробел) Один Два Три ' +
      '(пробел) Четыре Пять Шесть (пробел) Семь Восемь Девять Ноль Точка'
  },
  {
    settings: { alphabet: 'russian-unofficial' },
    content: 'съешь же ещё этих мягких французских булок да выпей чаю 123 456 7890.',
    expectedResult:
      'Сергей Твёрдый знак Елена Шура Мягкий знак (пробел) Жук Елена (пробел) Елена ' +
      'Щука Ёлка (пробел) Эмма Тамара Иван Харитон (пробел) Мария Яков Галина Киловатт ' +
      'Иван Харитон (пробел) Фёдор Радио Антон Николай Центр Ульяна Зоя Сергей Киловатт ' +
      'Иван Харитон (пробел) Борис Ульяна Леонид Ольга Киловатт (пробел) Дмитрий Антон ' +
      '(пробел) Василий Игрек Павел Елена Йот (пробел) Человек Антон Юрий (пробел) Один Два ' +
      'Три (пробел) Четыре Пять Шесть (пробел) Семь Восемь Девять Ноль Точка'
  }
]))
