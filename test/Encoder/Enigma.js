
import { describe } from 'mocha'

import EncoderTester from '../Helper/EncoderTester'
import EnigmaEncoder from '../../src/Encoder/Enigma'

/** @test {EnigmaEncoder} */
describe('EnigmaEncoder', () => EncoderTester.test(EnigmaEncoder, [
  {
    settings: {
      model: 'I',
      rotor1: 'I',
      rotor2: 'II',
      rotor3: 'III',
      position1: 13,
      position2: 3,
      position3: 11,
      reflector: 'UKW-B',
      includeForeignChars: false
    },
    direction: 'encode',
    content: 'the quick brown fox jumps over 13 lazy dogs.',
    expectedResult: 'apzmt ckvko hohmv inhkw rnalk jktsh dem'
  },
  {
    // Thank you so much, Mike Koss, for testing this edge case
    // on an actual enigma machine (https://youtu.be/unw7St0azMw)
    settings: {
      model: 'M3',
      rotor1: 'I',
      rotor2: 'II',
      rotor3: 'III',
      position1: 13,
      position2: 5,
      position3: 21,
      reflector: 'UKW-B',
      includeForeignChars: false
    },
    direction: 'encode',
    content: 'aaaaa',
    expectedResult: 'gdxtz'
  },
  {
    settings: {
      model: 'M3',
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
      model: 'M3',
      rotor1: 'VII',
      rotor2: 'VIII',
      rotor3: 'V',
      position1: 1,
      position2: 13,
      position3: 26,
      reflector: 'UKW-C',
      includeForeignChars: false
    },
    content: 'thequ ickbr ownfo xjump sover lazyd ogs',
    expectedResult: 'aajrl afwxd zskuu qcjrg qiptv qpacp awg'
  },
  {
    // Example mentioned in a Wikipedia article
    // https://de.wikipedia.org/w/index.php?title=Enigma-M4&oldid=176856055#Authentischer_Funkspruch
    settings: {
      model: 'M4',
      rotor1: 'beta',
      rotor2: 'II',
      rotor3: 'IV',
      rotor4: 'I',
      position1: 22,
      position2: 10,
      position3: 14,
      position4: 1,
      ring1: 1,
      ring2: 1,
      ring3: 1,
      ring4: 22,
      reflector: 'UKW-B-thin',
      plugboard: 'at bl df gj hm nw op qy rz vx'
    },
    content:
      'vonv onjl ooks jfff ttte inse insd reiz woyy eins neun inha ltxx beia ' +
      'ngri ffun terw asse rged ruec ktyw abos xlet zter gegn erst andn ulac ' +
      'htdr einu luhr marq uant onjo tane unac htse chsd reiy zwoz wonu lgra ' +
      'dyac htsm ysto ssen achx eins vier mbfa ellt ynnn nnno oovi erys icht ' +
      'eins null',
    expectedResult:
      'nczw vusx pnym imhz xmqx sfwx wlkj ahsh nmco obak uqpm kcsm hkse inju ' +
      'sblk iosx ckub hmll xcsj usrr dvko hulx wccb gvli yxeo ahxr hkkf vdre ' +
      'wezl xoba fgyu jquk grtv ukam eurb veks uhhv xyha bcjw makl fklm yfvn ' +
      'rizr vvrt kofd anjm olbg flle oprg tflv rhow opbe kvwm uqfm pwpa rmfh ' +
      'agkx iibg'
  },
  {
    // Message P1030700
    // Missing characters have been replaced by 'x' chars
    // https://enigma.hoerenberg.com/index.php?cat=The%20U534%20messages&page=P1030700
    settings: {
      model: 'M4',
      rotor1: 'gamma',
      rotor2: 'IV',
      rotor3: 'III',
      rotor4: 'VIII',
      position1: 22,
      position2: 13,
      position3: 7,
      position4: 3,
      ring1: 1,
      ring2: 1,
      ring3: 3,
      ring4: 21,
      reflector: 'UKW-B-thin',
      plugboard: 'ch ej nv ou ty lg sz pk di qb'
    },
    content:
      'qbhe wtdf eqit kuwf quhl iqqg vygr sdoh dcob fmdh xsko fpao drsv bere ' +
      'iqzv edax shoh biym ciiz skgn dlnf kfvl wwhz xzgq xwss pwls oqxe ance ' +
      'ljyj cetz tlst twmt obwx ufqx xcen xqqx xcbx xxaw xoho ypdn luxm gozf ' +
      'zbfl oxjn sstl phxj dyss bnbo zlvp xjba tnnj dlck kbzn rstk pmpn vsre ' +
      'tkoi ztvs dbsy pzeb sjlo dsjg cxfj venz tqtf i',
    expectedResult:
      'komx bdmx uuub oote yfxd xuuu ausb ilvu nyyz wose chsx uuuf lott xvvv ' +
      'uuur wodr eise chsv ierk krem askk mitu uvzw odre ifuv fyew hsyu uuzw ' +
      'odre ifun fzwo yuuf zwln reit bnfp oebt byua vzwo zrzi funf nyan yuur ' +
      'ofdd eeis efhs nulf uuzg wrdq eise chsd reiu nduu uzwo drei sech sfun ' +
      'fein scec hsuh rwar nemu onde ausn acze iglh l'
  }
]))
