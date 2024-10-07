import { describe } from 'mocha'

import EncoderTester from '../Helper/EncoderTester'
import EnigmaEncoder from '../../src/Encoder/Enigma'

const plaintext =
  'boot klar x bei j schnoor j etwa zwo siben x nov x sechs nul cbm x' +
  ' proviant bis zwo nul x dez x benoetige glaeser y noch vier klar x' +
  ' stehe marqu bruno bruno zwo funf x lage wie j schaefer j x nnn ww' +
  'w funf y eins funf mb steigend y gute sicht vvv j rasch'

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
  },
  {
    // Wheel-turnover mechanism edge case (GitHub issue #100)
    settings: {
      model: 'M4',
      rotor1: 'beta',
      rotor2: 'I',
      rotor3: 'III',
      rotor4: 'I',
      position1: 1,
      position2: 17,
      position3: 12,
      position4: 2,
      ring1: 1,
      ring2: 3,
      ring3: 5,
      ring4: 2,
      reflector: 'UKW-B-thin',
      plugboard: 'bq cr di ej kw mt os px uz gh'
    },
    content:
      'inte llig ence poin tsto atta ckon thee astw allo fthe cast leat dawn',
    expectedResult:
      'odli oqsa pdtb ttnu eokz jbqz whly ndmm bvnd lanx tvrn ylvq mjko vrev'
  },
  {
    settings: {
      model: 'D',
      rotor1: 'III-D',
      rotor2: 'II-D',
      rotor3: 'I-D',
      positionReflector: 7,
      position1: 1,
      position2: 17,
      position3: 12,
      ringReflector: 4,
      ring1: 2,
      ring2: 3,
      ring3: 4,
      includeForeignChars: false
    },
    direction: 'encode',
    content: plaintext,
    expectedResult:
      'naddr epxco cfqvk vtibm zabnh qyapp vlsyv cgqtu rzfri uhzwc ftcrg ' +
      'typgq bepkv valrn smdnr pahuk gehpp xgihu phtov pglog cekly bjarh ' +
      'zcfyh xhgkj fxnmg ogtik wnfzj wjtuu kdptz qzfhh qjyku mywwf eijun ' +
      'wkdmq phzci kwded agcsf msdzz eqpog z'
  },
  {
    settings: {
      model: 'KS',
      rotor1: 'I-KS',
      rotor2: 'III-KS',
      rotor3: 'II-KS',
      positionReflector: 7,
      position1: 1,
      position2: 6,
      position3: 1,
      ringReflector: 25,
      ring1: 13,
      ring2: 20,
      ring3: 9,
      includeForeignChars: false
    },
    direction: 'encode',
    content: plaintext,
    expectedResult:
      'cpyxo ejays krqnd stlik ehsol eqglw pvjah tltks iahvd gktbc unxnn ' +
      'ihfkl edhxa fmcpx kypmd uxajr vsrqz lyipd kdzrk tsezp oivyp pjtnu ' +
      'dpkkk uzopl pvets pbfxh nhlgv whbzp nmohm sbbyf hmleb yembt djope ' +
      'eugin rtvns hwuof jzcne exoyo vcsqq m'
  },
  {
    settings: {
      model: 'KR',
      rotor1: 'II-KR',
      rotor2: 'III-KR',
      rotor3: 'I-KR',
      positionReflector: 10,
      position1: 22,
      position2: 18,
      position3: 16,
      ringReflector: 16,
      ring1: 8,
      ring2: 22,
      ring3: 21,
      includeForeignChars: false
    },
    direction: 'encode',
    content: plaintext,
    expectedResult:
      'cncno zbgcj tqmpw exdtm lkpxf abyib lbpmx bewro kdpqk xgqog oqjpo ' +
      'gxoxs onyka yoepk jqmso fseve cvjml ubsae gljaa dpeuw vfbbg yoprs ' +
      'xrvhx luuvz iydns kdlcm omfkn chlnh bqtvp frfqr gdmvq fhbzs gaxlw ' +
      'tjyzo jvasq wghhm rtqae ouxgl whuqr c'
  },
  {
    settings: {
      model: 'T',
      rotor1: 'V-T',
      rotor2: 'VII-T',
      rotor3: 'II-T',
      positionReflector: 14,
      position1: 22,
      position2: 25,
      position3: 15,
      ringReflector: 1,
      ring1: 8,
      ring2: 25,
      ring3: 25,
      includeForeignChars: false
    },
    direction: 'encode',
    content: plaintext,
    expectedResult:
      'ipppb cnkhd xezbe kzhjw zaysd jldlq jwmey theau pqaix pxuhq dorzu ' +
      'uyepp xnuyo vskmr dczuo usgxo plfki wiwvc xwpqx gtfqp nzafp xfeta ' +
      'obmma eemjc skaxj zdvjb euzyb cnpji nxtap gqisc qthhw zfkrf lddbl ' +
      'qnpgy rxobd jcbre uteuf mxfek wlcgq m'
  },
  {
    settings: {
      model: 'N',
      rotor1: 'II-N',
      rotor2: 'III-N',
      rotor3: 'I-N',
      position1: 7,
      position2: 18,
      position3: 17,
      ring1: 3,
      ring2: 5,
      ring3: 21,
      includeForeignChars: false
    },
    direction: 'encode',
    content: plaintext,
    expectedResult:
      'lxjyl vugix wxrfq ydfae yqhto dttxv mbglk vohmb uqffh iepve bpfly ' +
      'gqduq ygujc oxuoc eynjt jwlzh tpjxu khhnx zhwcl gphui izwfu wsuzp ' +
      'ollmh wrsll edwka letaa rtmfv uzxyg degtc huitb hgezb krpti xjeqt ' +
      'bdcnl caydc psqrs nnyms xaepc gxldy x'
  },
  {
    settings: {
      model: 'Z',
      rotor1: 'II-Z',
      rotor2: 'III-Z',
      rotor3: 'I-Z',
      positionReflector: 14,
      position1: 7,
      position2: 18,
      position3: 17,
      ringReflector: 1,
      ring1: 3,
      ring2: 5,
      ring3: 21,
      includeForeignChars: false
    },
    direction: 'encode',
    content: plaintext,
    expectedResult:
      'cssfs pfigp nczhl oznbo ckyqj yrmlh ulcfy amsjx hibgs wgiby xgcqb ' +
      'mmssv cujkx svvvb hrotj eplxl qssmb usneo mgeff aptjb utari wbols ' +
      'tiowi jgxps usosf ugvbs qiqqc olihq wrkgt ghkqk yrone chqti pqcig ' +
      'enrvn knajx bzwss jgepi auspi iwjxf b'
  },
  {
    settings: {
      model: 'G111',
      rotor1: 'II-G111',
      rotor2: 'V-G111',
      rotor3: 'I-G111',
      positionReflector: 14,
      position1: 7,
      position2: 18,
      position3: 17,
      ringReflector: 1,
      ring1: 3,
      ring2: 5,
      ring3: 21,
      includeForeignChars: false
    },
    direction: 'encode',
    content: plaintext,
    expectedResult:
      'rjucc xxsud uvzbr ivbef btplu omcxw mxoig lqywb isigt dkoqo lzjtc ' +
      'zfihl mqjyy qjrrz vgahh gllot jcviq wcquj bdrpc jsxhc spdaf dlxfq ' +
      'rfhpv ofeix jxtfm gnore bvjmb hamge pylrd hlaix hrmgy rokvp zabvx ' +
      'dbxut qcglm mtvzt vhjap aedwy zmttm l'
  },
  {
    settings: {
      model: 'G312',
      rotor1: 'II-G312',
      rotor2: 'III-G312',
      rotor3: 'I-G312',
      positionReflector: 14,
      position1: 7,
      position2: 18,
      position3: 17,
      ringReflector: 1,
      ring1: 3,
      ring2: 5,
      ring3: 21,
      includeForeignChars: false
    },
    direction: 'encode',
    content: plaintext,
    expectedResult:
      'utxpn hnade ffwwb lvwbh znszd eocte yokzm viiaa tynod efuys slwke ' +
      'pqrav nbepu hyspa evhxq kydob qqqsd briie iqxhs mmchl sigan ngerd ' +
      'ggwga yratn dqoez wmbif psnki hkobb uokef ubfiv lkyzy vhlkw cmbmz ' +
      'gldug wnovd cbakz zlkrd qxfzw dmzix t'
  },
  {
    settings: {
      model: 'G260',
      rotor1: 'II-G260',
      rotor2: 'III-G260',
      rotor3: 'I-G260',
      positionReflector: 14,
      position1: 7,
      position2: 18,
      position3: 17,
      ringReflector: 1,
      ring1: 3,
      ring2: 5,
      ring3: 21,
      includeForeignChars: false
    },
    direction: 'encode',
    content: plaintext,
    expectedResult:
      'plire qoovl koejf jdlrx huwlb sjbzs rzulk usozv zxmpi cdcfm qjwun ' +
      'fuarh ijqll izgho qsgcv arzvw gxznt niwjw cuzsh tfcqj fnlxy vheqs ' +
      'mijws kpgzd ybuck inhoh avzlq egugm ivqem nhzwu lpafq rympp yirax ' +
      'qxpwv dxtmf swbdo oslti sejrn xuhpk q'
  }
]))
