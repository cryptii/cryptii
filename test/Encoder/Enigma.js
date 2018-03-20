
import { describe } from 'mocha'

import EncoderTester from '../Helper/EncoderTester'
import EnigmaEncoder from '../../src/Encoder/Enigma'

/** @test {EnigmaEncoder} */
describe('EnigmaEncoder', () => EncoderTester.test(EnigmaEncoder, [
  {
    settings: {
      rotor1: 'I',
      rotor2: 'II',
      rotor3: 'III',
      position1: 13,
      position2: 3,
      position3: 11,
      reflector: 'UKW-B',
      plugboard: '',
      includeForeignChars: false
    },
    direction: 'encode',
    content: 'the quick brown fox jumps over 13 lazy dogs.',
    expectedResult: 'apzmt ckvko hohmv inhkw rnalk jktsh dem'
  },
  {
    // thank you so much, Mike Koss, for testing this edge case
    // on an actual enigma machine (https://youtu.be/unw7St0azMw)
    settings: {
      rotor1: 'I',
      rotor2: 'II',
      rotor3: 'III',
      position1: 13,
      position2: 5,
      position3: 21,
      reflector: 'UKW-B',
      plugboard: '',
      includeForeignChars: false
    },
    direction: 'encode',
    content: 'aaaaa',
    expectedResult: 'gdxtz'
  },
  {
    settings: {
      rotor1: 'VI',
      rotor2: 'I',
      rotor3: 'III',
      position1: 1,
      position2: 17,
      position3: 12,
      reflector: 'UKW-B',
      plugboard: 'bq cr di ej kw mt os px uz gh',
      includeForeignChars: false
    },
    direction: 'encode',
    content:
      'boot klar x bei j schnoor j etwa zwo siben x nov x sechs nul cbm x' +
      ' proviant bis zwo nul x dez x benoetige glaeser y noch vier klar x' +
      ' stehe marqu bruno bruno zwo funf x lage wie j schaefer j x nnn ww' +
      'w funf y eins funf mb steigend y gute sicht vvv j rasch',
    expectedResult:
      'wgrxm sigyv zmlnn uqgvh ytftd qdyzd ttcgh fgycm ylujp wukxc gdwjc ' +
      'mjkmm tcxxf rvapd deykj ahrjj sqyil ttzfe gggla khejr tqoqk pmapf ' +
      'pdgoq zcqho qttpx apdro fdoul uwbnd fwuvs gwvdy jloob nqoam wjeba ' +
      'eihlb gteph hgpst qdmat ccffw yvhvu x'
  },
  {
    // setting testing rotors and position limits
    settings: {
      rotor1: 'VII',
      rotor2: 'VIII',
      rotor3: 'V',
      position1: 1,
      position2: 13,
      position3: 26,
      reflector: 'UKW-C',
      plugboard: '',
      includeForeignChars: false
    },
    content: 'thequ ickbr ownfo xjump sover lazyd ogs',
    expectedResult: 'aajrl afwxd zskuu qcjrg qiptv qpacp awg'
  }
]))
