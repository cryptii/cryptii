
import Encoder from '../Encoder'
import StringUtil from '../StringUtil'

const meta = {
  name: 'spelling-alphabet',
  title: 'Spelling alphabet',
  category: 'Alphabets',
  type: 'encoder'
}

const defaultAlphabetSpecs = [
  /* eslint-disable no-multi-spaces */
  {
    name: 'nato',
    label: 'NATO/ICAO phonetic alphabet',
    variants: [
      {
        name: 'icao2008',
        label: 'Latest - NATO/ICAO, 2008 - Present',
        description: '2008 – present ICAO\nNATO phonetic alphabet\nInternational Radiotelephony Spelling Alphabet\nICAO phonetic alphabet\nITU phonetic alphabet and figure code',
      },
      {
        name: 'icao1959',
        label: 'NATO/ICAO, 1959, Geneva',
        description: '1959 (Geneva) administrative radio conference\nNATO phonetic alphabet\nInternational Radiotelephony Spelling Alphabet\nICAO phonetic alphabet\nITU phonetic alphabet and figure code'
      },
      {
        name: 'icao1956',
        label: 'NATO/ICAO, 1956, Final',
        description: '1956 ICAO final\nNATO phonetic alphabet\nInternational Radiotelephony Spelling Alphabet\nICAO phonetic alphabet\nITU phonetic alphabet and figure code'
      },
      {
        name: 'icao1951',
        label: 'NATO/ICAO, 1951',
        description: '1951 ICAO\nNATO phonetic alphabet\nInternational Radiotelephony Spelling Alphabet\nICAO phonetic alphabet\nITU phonetic alphabet and figure code'
      },
      {
        name: 'icao1949',
        label: 'NATO/ICAO, 1949',
        description: '1949 ICAO\nNATO phonetic alphabet\nInternational Radiotelephony Spelling Alphabet\nICAO phonetic alphabet\nITU phonetic alphabet and figure code'
      },
      {
        name: 'icao1947',
        label: 'NATO/ICAO, 1947, IATA Proposal',
        description: '1947 IATA proposal to ICAO\nNATO phonetic alphabet\nInternational Radiotelephony Spelling Alphabet\nICAO phonetic alphabet\nITU phonetic alphabet and figure code'
      },
      {
        name: 'icao1947lac',
        label: 'NATO/ICAO, 1947, Latin America/Caribbean',
        description: '1947 ICAO Latin America/Caribbean\nNATO phonetic alphabet\nInternational Radiotelephony Spelling Alphabet\nICAO phonetic alphabet\nITU phonetic alphabet and figure code'
      },
      {
        name: 'icao1947arrl',
        label: 'NATO/ICAO, 1947, ARRL',
        description: '1947 ICAO (adopted exactly from ARRL)\nNATO phonetic alphabet\nInternational Radiotelephony Spelling Alphabet\nICAO phonetic alphabet\nITU phonetic alphabet and figure code'
      },
      {
        name: 'icao1947usuk1943',
        label: 'NATO/ICAO, 1947, 1943 US-UK',
        description: '1947 ICAO (same as 1943 US-UK)\nNATO phonetic alphabet\nInternational Radiotelephony Spelling Alphabet\nICAO phonetic alphabet\nITU phonetic alphabet and figure code'
      },
      {
        name: 'icao1947ac',
        label: 'NATO/ICAO, 1947, Atlantic City',
        description: '1947 (Atlantic City) International Radio Conference\nNATO phonetic alphabet\nInternational Radiotelephony Spelling Alphabet\nICAO phonetic alphabet\nITU phonetic alphabet and figure code'
      },
      {
        name: 'icao1946',
        label: 'NATO/ICAO, 1946, Communications Division, Joint Army/Navy',
        description: '1946 ICAO Second Session of the Communications Division (same as Joint Army/Navy)\nNATO phonetic alphabet\nInternational Radiotelephony Spelling Alphabet\nICAO phonetic alphabet\nITU phonetic alphabet and figure code'
      },
      {
        name: 'icao1938',
        label: 'NATO/ICAO, 1938, Cairo',
        description: '1938 (Cairo) International Radiocommunication Conference\nNATO phonetic alphabet\nInternational Radiotelephony Spelling Alphabet\nICAO phonetic alphabet\nITU phonetic alphabet and figure code'
      },
      {
        name: 'icao1932',
        label: 'NATO/ICAO, 1932, CCIR/ICAN',
        description: '1932 General Radiocommunication and Additional Regulations (CCIR/ICAN)\nNATO phonetic alphabet\nInternational Radiotelephony Spelling Alphabet\nICAO phonetic alphabet\nITU phonetic alphabet and figure code'
      },
      {
        name: 'icao1927',
        label: 'NATO/ICAO, 1927, Washington, CCIR',
        description: '1927 (Washington, D.C.) International Radiotelegraph Convention (CCIR)\nNATO phonetic alphabet\nInternational Radiotelephony Spelling Alphabet\nICAO phonetic alphabet\nITU phonetic alphabet and figure code'
      },
      {
        name: 'icao1920',
        label: 'NATO/ICAO, 1920, UECU',
        description: '1920 UECU\nNATO phonetic alphabet\nInternational Radiotelephony Spelling Alphabet\nICAO phonetic alphabet\nITU phonetic alphabet and figure code'
      },
      {
        name: 'ia1956',
        label: 'International aviation, 1956 - Present',
        description: '1956 – present ICAO\nInternational aviation\nNATO phonetic alphabet\nInternational Radiotelephony Spelling Alphabet\nICAO phonetic alphabet\nITU phonetic alphabet and figure code'
      },
      {
        name: 'ia1951',
        label: 'International aviation, 1951',
        description: '1951 ICAO\nInternational aviation\nNATO phonetic alphabet\nInternational Radiotelephony Spelling Alphabet\nICAO phonetic alphabet\nITU phonetic alphabet and figure code'
      },
      {
        name: 'ia1949',
        label: 'International aviation, 1949',
        description: '1949 ICAO\nInternational aviation\nNATO phonetic alphabet\nInternational Radiotelephony Spelling Alphabet\nICAO phonetic alphabet\nITU phonetic alphabet and figure code'
      },
      {
        name: 'ia1947',
        label: 'International aviation, 1947, IATA Proposal',
        description: '1947 IATA proposal to ICAO\nInternational aviation\nNATO phonetic alphabet\nInternational Radiotelephony Spelling Alphabet\nICAO phonetic alphabet\nITU phonetic alphabet and figure code'
      },
      {
        name: 'ia1947lac',
        label: 'International aviation, 1947, Latin America/Caribbean',
        description: '1947 ICAO Latin America/Caribbean\nInternational aviation\nNATO phonetic alphabet\nInternational Radiotelephony Spelling Alphabet\nICAO phonetic alphabet\nITU phonetic alphabet and figure code'
      },
      {
        name: 'ia1947arrl',
        label: 'International aviation, 1947, ARRL',
        description: '1947 ICAO (adopted exactly from ARRL)\nInternational aviation\nNATO phonetic alphabet\nInternational Radiotelephony Spelling Alphabet\nICAO phonetic alphabet\nITU phonetic alphabet and figure code'
      },
      {
        name: 'ia1947usuk1943',
        label: 'International aviation, 1947, 1943 US/UK',
        description: '1947 ICAO (same as 1943 US-UK)\nInternational aviation\nNATO phonetic alphabet\nInternational Radiotelephony Spelling Alphabet\nICAO phonetic alphabet\nITU phonetic alphabet and figure code'
      },
      {
        name: 'ia1946',
        label: 'International aviation, 1946, Communications Division, Joint Army/Navy',
        description: '1946 ICAO Second Session of the Communications Division (same as Joint Army/Navy)\nInternational aviation\nNATO phonetic alphabet\nInternational Radiotelephony Spelling Alphabet\nICAO phonetic alphabet\nITU phonetic alphabet and figure code'
      },
      {
        name: 'ia1932',
        label: 'International aviation, 1932',
        description: '1932 General Radiocommunication and Additional Regulations (CCIR/ICAN)\nInternational aviation\nNATO phonetic alphabet\nInternational Radiotelephony Spelling Alphabet\nICAO phonetic alphabet\nITU phonetic alphabet and figure code'
      },
      {
        name: 'imms2000',
        label: 'International maritime mobile service, 2000 - Present, IMO SMCP',
        description: '2000 – present IMO SMCP\nInternational maritime mobile service\nNATO phonetic alphabet\nInternational Radiotelephony Spelling Alphabet\nICAO phonetic alphabet\nITU phonetic alphabet and figure code'
      },
      {
        name: 'imms1967',
        label: 'International maritime mobile service, 1967, WARC',
        description: '1967 WARC\nInternational maritime mobile service\nNATO phonetic alphabet\nInternational Radiotelephony Spelling Alphabet\nICAO phonetic alphabet\nITU phonetic alphabet and figure code'
      },
      {
        name: 'imms1965',
        label: 'International maritime mobile service, 1965 - Present, WRC-03',
        description: '1965 – present (WRC-03) IMO\nNATO phonetic alphabet\nInternational Radiotelephony Spelling Alphabet\nICAO phonetic alphabet\nITU phonetic alphabet and figure code'
      },
      {
        name: 'imms1932',
        label: 'International maritime mobile service, 1932 - 1965, IMO',
        description: '1932 - 1965 IMO\nNATO phonetic alphabet\nInternational Radiotelephony Spelling Alphabet\nICAO phonetic alphabet\nITU phonetic alphabet and figure code'
      },
      {
        name: 'deltaairlines',
        label: 'Delta Air Lines Airports',
        description: 'Airports that have a majority of Delta Air Lines flights\nInternational Radiotelephony Spelling Alphabet\nICAO phonetic alphabet\nITU phonetic alphabet and figure code'
      }
    ],
    mappings: [
      {
        character: ' ',
        word: '(space)'
      },
      {
        character: 'a',
        word: 'Alfa',
        override: [
          {
            word: 'Argentine',
            variant: 'icao1920'
      },
      {
            word: 'Amsterdam',
            variant: [
              'icao1927',
              'icao1932',
              'icao1938',
              'icao1947ac',
              'ia1932',
              'imms1932'
            ]
          },
          {
            word: 'Able',
            variant: [
              'icao1946',
              'icao1947usuk1943',
              'ia1946',
              'ia1947usuk1943'
            ]
          },
          {
            word: 'Adam',
            variant: [
              'icao1947arrl',
              'ia1947arrl'
            ]
          },
          {
            word: 'Ana',
            variant: [
              'icao1947lac',
              'ia1947lac'
            ]
          },
          {
            word: 'Alpha',
            variant: [
              'icao1947',
              'ia1947'
            ]
          }
        ]
      },
      {
        character: 'b',
        word: 'Bravo',
        override: [
          {
            word: 'Brussels',
            variant: 'icao1920'
      },
      {
            word: 'Baltimore',
            variant: [
              'icao1927',
              'icao1932',
              'icao1938',
              'icao1947ac',
              'ia1932',
              'imms1932'
            ]
          },
          {
            word: 'Baker',
            variant: [
              'icao1946',
              'icao1947usuk1943',
              'icao1947arrl',
              'ia1946',
              'ia1947usuk1943',
              'ia1947arrl'
            ]
          },
          {
            word: 'Brazil',
            variant: [
              'icao1947lac',
              'ia1947lac'
            ]
          },
          {
            word: 'Beta',
            variant: [
              'icao1947',
              'icao1949',
              'ia1947',
              'ia1949'
            ]
          }
        ]
      },
      {
        character: 'c',
        word: 'Charlie',
        override: [
          {
            word: 'Canada',
            variant: [
              'icao1920',
              'icao1927'
            ]
      },
      {
            word: 'Casablanca',
            variant: [
              'icao1932',
              'icao1938',
              'icao1947ac',
              'ia1932',
              'imms1932'
            ]
          },
          {
            word: 'Coco',
            variant: [
              'icao1947lac',
              'ia1947lac'
            ]
          },
          {
            word: 'Coca',
            variant: [
              'icao1949',
              'icao1951',
              'ia1949',
              'ia1951'
            ]
          }
        ]
      },
      {
        character: 'd',
        word: [
          'Delta',
          'Dixie'
        ],
        override: [
          {
            word: 'Damascus',
            variant: 'icao1920'
      },
      {
            word: 'Denmark',
            variant: 'icao1927'
          },
          {
            word: 'Danemark',
            variant: [
              'icao1932',
              'icao1938',
              'icao1947ac',
              'ia1932',
              'imms1932'
            ]
          },
          {
            word: 'Dog',
            variant: [
              'icao1946',
              'icao1947usuk1943',
              'ia1946',
              'ia1947usuk1943'
            ]
          },
          {
            word: 'David',
            variant: [
              'icao1947arrl',
              'ia1947arrl'
            ]
          },
          {
            word: 'Dado',
            variant: [
              'icao1947lac',
              'ia1947lac'
            ]
          },
          {
            word: 'Data',
            variant: 'deltaairlines'
          }
        ]
      },
      {
        character: 'e',
        word: 'Echo',
        override: [
          {
            word: 'Ecuador',
            variant: 'icao1920'
      },
      {
            word: 'Eddystone',
            variant: 'icao1927'
          },
          {
            word: 'Edison',
            variant: [
              'icao1932',
              'icao1938',
              'icao1947ac',
              'ia1932',
              'imms1932'
            ]
          },
          {
            word: 'Easy',
            variant: [
              'icao1946',
              'icao1947usuk1943',
              'ia1946',
              'ia1947usuk1943'
            ]
          },
          {
            word: 'Edward',
            variant: [
              'icao1947arrl',
              'icao1947',
              'ia1947arrl',
              'ia1947'
            ]
          },
          {
            word: 'Elsa',
            variant: [
              'icao1947lac',
              'ia1947lac'
            ]
          }
        ]
      },
      {
        character: 'f',
        word: 'Foxtrot',
        override: [
          {
            word: 'France',
            variant: 'icao1920'
      },
      {
            word: 'Francisco',
            variant: 'icao1927'
          },
          {
            word: 'Florida',
            variant: [
              'icao1932',
              'icao1938',
              'icao1947ac',
              'ia1932',
              'imms1932'
            ]
          },
          {
            word: 'Fox',
            variant: [
              'icao1946',
              'icao1947usuk1943',
              'icao1947',
              'ia1946',
              'ia1947usuk1943',
              'ia1947'
            ]
          },
          {
            word: 'Freddie',
            variant: [
              'icao1947arrl',
              'ia1947arrl'
            ]
          },
          {
            word: 'Fiesta',
            variant: [
              'icao1947lac',
              'ia1947lac'
            ]
          }
        ]
      },
      {
        character: 'g',
        word: 'Golf',
        override: [
          {
            word: 'Greece',
            variant: 'icao1920'
      },
      {
            word: 'Gibraltar',
            variant: 'icao1927'
          },
          {
            word: 'Gallipoli',
            variant: [
              'icao1932',
              'icao1938',
              'icao1947ac',
              'ia1932',
              'imms1932'
            ]
          },
          {
            word: 'George',
            variant: [
              'icao1946',
              'icao1947usuk1943',
              'icao1947arrl',
              'ia1946',
              'ia1947usuk1943',
              'ia1947arrl'
            ]
          },
          {
            word: 'Gato',
            variant: [
              'icao1947lac',
              'ia1947lac'
            ]
          },
          {
            word: 'Gramma',
            variant: [
              'icao1947',
              'ia1947'
            ]
          },
          {
            word: 'Gold',
            variant: [
              'icao1951',
              'ia1951'
            ]
          }
        ]
      },
      {
        character: 'h',
        word: 'Hotel',
        override: [
          {
            word: 'Hanover',
            variant: [
              'icao1920',
              'icao1927'
            ]
      },
      {
            word: 'Havana',
            variant: [
              'icao1932',
              'icao1938',
              'icao1947ac',
              'icao1947',
              'ia1932',
              'ia1947',
              'imms1932'
            ]
          },
          {
            word: 'How',
            variant: [
              'icao1946',
              'icao1947usuk1943',
              'ia1946',
              'ia1947usuk1943'
            ]
          },
          {
            word: 'Harry',
            variant: [
              'icao1947arrl',
              'ia1947arrl'
            ]
          },
          {
            word: 'Hombre',
            variant: [
              'icao1947lac',
              'ia1947lac'
            ]
          }
        ]
      },
      {
        character: 'i',
        word: 'India',
        override: [
          {
            word: 'Italy',
            variant: [
              'icao1920',
              'icao1927',
              'icao1947',
              'ia1947'
            ]
      },
      {
            word: 'Italia',
            variant: [
              'icao1932',
              'icao1938',
              'icao1947ac',
              'ia1932',
              'imms1932'
            ]
          },
          {
            word: 'Item',
            variant: [
              'icao1946',
              'icao1947usuk1943',
              'ia1946',
              'ia1947usuk1943'
            ]
          },
          {
            word: 'Ida',
            variant: [
              'icao1947arrl',
              'ia1947arrl'
            ]
          }
        ]
      },
      {
        character: 'j',
        word: 'Juliett',
        override: [
          {
            word: 'Japan',
            variant: 'icao1920'
      },
      {
            word: 'Jerusalem',
            variant: [
              'icao1927',
              'icao1947ac',
              'ia1932'
            ]
          },
          {
            word: 'Jérusalem',
            variant: [
              'icao1932',
              'icao1938',
              'imms1932'
            ]
          },
          {
            word: 'Jig',
            variant: [
              'icao1946',
              'icao1947usuk1943',
              'ia1946',
              'ia1947usuk1943'
            ]
          },
          {
            word: 'John',
            variant: [
              'icao1947arrl',
              'ia1947arrl'
            ]
          },
          {
            word: 'Julio',
            variant: [
              'icao1947lac',
              'ia1947lac'
            ]
          },
          {
            word: 'Jupiter',
            variant: [
              'icao1947',
              'ia1947'
            ]
          },
          {
            word: 'Julietta',
            variant: [
              'icao1949',
              'ia1949'
            ]
          },
          {
            word: 'Juliet',
            variant: 'imms2000'
          }
        ]
      },
      {
        character: 'k',
        word: 'Kilo',
        override: [
          {
            word: 'Khartoum',
            variant: 'icao1920'
      },
      {
            word: 'Kimberley',
            variant: 'icao1927'
          },
          {
            word: 'Kilogramme',
            variant: [
              'icao1932',
              'icao1938',
              'icao1947ac',
              'ia1932',
              'imms1932'
            ]
          },
          {
            word: 'King',
            variant: [
              'icao1946',
              'icao1947usuk1943',
              'icao1947arrl',
              'ia1946',
              'ia1947usuk1943',
              'ia1947arrl'
            ]
          }
        ]
      },
      {
        character: 'l',
        word: 'Lima',
        override: [
          {
            word: 'Liverpool',
            variant: [
              'icao1927',
              'icao1932',
              'icao1938',
              'icao1947ac',
              'ia1932',
              'imms1932'
            ]
      },
      {
            word: 'Love',
            variant: [
              'icao1946',
              'icao1947usuk1943',
              'ia1946',
              'ia1947usuk1943'
            ]
          },
          {
            word: 'Lewis',
            variant: [
              'icao1947arrl',
              'ia1947arrl'
            ]
          },
          {
            word: 'Luis',
            variant: [
              'icao1947lac',
              'ia1947lac'
            ]
          },
          {
            word: 'Liter',
            variant: [
              'icao1947',
              'ia1947'
            ]
          }
        ]
      },
      {
        character: 'm',
        word: 'Mike',
        override: [
          {
            word: 'Madrid',
            variant: 'icao1920'
      },
      {
            word: 'Madagascar',
            variant: [
              'icao1927',
              'icao1932',
              'icao1938',
              'icao1947ac',
              'ia1932',
              'imms1932'
            ]
          },
          {
            word: 'Mary',
            variant: [
              'icao1947arrl',
              'ia1947arrl'
            ]
          },
          {
            word: 'Mama',
            variant: [
              'icao1947lac',
              'ia1947lac'
            ]
          },
          {
            word: 'Maestro',
            variant: [
              'icao1947',
              'ia1947'
            ]
          },
          {
            word: 'Metro',
            variant: [
              'icao1949',
              'icao1951',
              'ia1949',
              'ia1951'
            ]
          }
        ]
      },
      {
        character: 'n',
        word: [
          'November',
          'Nickel'
        ],
        override: [
          {
            word: 'Nancy',
            variant: [
              'icao1920',
              'icao1947arrl',
              'ia1947arrl'
            ]
      },
      {
            word: 'Neufchatel',
            variant: 'icao1927'
          },
          {
            word: 'New york',
            variant: [
              'icao1932',
              'icao1947ac',
              'ia1932'
            ]
          },
          {
            word: 'New-york',
            variant: [
              'icao1938',
              'imms1932'
            ]
          },
          {
            word: 'Nan',
            variant: [
              'icao1946',
              'icao1947usuk1943',
              'ia1946',
              'ia1947usuk1943'
            ]
          },
          {
            word: 'Norma',
            variant: [
              'icao1947lac',
              'icao1947',
              'ia1947lac',
              'ia1947'
            ]
          },
          {
            word: 'Nectar',
            variant: [
              'icao1949',
              'icao1951',
              'ia1949',
              'ia1951'
            ]
          }
        ]
      },
      {
        character: 'o',
        word: 'Oscar',
        override: [
          {
            word: 'Ostend',
            variant: 'icao1920'
          },
          {
            word: 'Ontario',
            variant: 'icao1927'
          },
          {
            word: 'Oslo',
            variant: [
              'icao1932',
              'icao1938',
              'icao1947ac',
              'ia1932',
              'imms1932'
            ]
          },
          {
            word: 'Oboe',
            variant: [
              'icao1946',
              'icao1947usuk1943',
              'ia1946',
              'ia1947usuk1943'
            ]
          },
          {
            word: 'Otto',
            variant: [
              'icao1947arrl',
              'ia1947arrl'
            ]
          },
          {
            word: 'Opera',
            variant: [
              'icao1947lac',
              'icao1947',
              'ia1947lac',
              'ia1947'
            ]
          }
        ]
      },
      {
        character: 'p',
        word: 'Papa',
        override: [
          {
            word: 'Paris',
            variant: [
              'icao1920',
              'icao1932',
              'icao1938',
              'icao1947ac',
              'ia1932',
              'imms1932'
            ]
          },
          {
            word: 'Portugal',
            variant: 'icao1927'
          },
          {
            word: 'Peter',
            variant: [
              'icao1946',
              'icao1947usuk1943',
              'icao1947arrl',
              'ia1946',
              'ia1947usuk1943',
              'ia1947arrl'
            ]
          },
          {
            word: 'Peru',
            variant: [
              'icao1947lac',
              'icao1947',
              'ia1947lac',
              'ia1947'
            ]
          },
          {
            word: 'Polka',
            variant: [
              'icao1949',
              'ia1949'
            ]
          }
        ]
      },
      {
        character: 'q',
        word: 'Quebec',
        override: [
          {
            word: 'Québec',
            variant: [
              'icao1932',
              'icao1938',
              'ia1932',
              'imms1932'
            ]
          },
          {
            word: 'Queen',
            variant: [
              'icao1946',
              'icao1947usuk1943',
              'icao1947arrl',
              'ia1946',
              'ia1947usuk1943',
              'ia1947arrl'
            ]
          }
        ]
      },
      {
        character: 'r',
        word: 'Romeo',
        override: [
          {
            word: 'Rome',
            variant: 'icao1920'
          },
          {
            word: 'Rivoli',
            variant: 'icao1927'
          },
          {
            word: 'Roma',
            variant: [
              'icao1932',
              'icao1938',
              'icao1947ac',
              'ia1932',
              'imms1932'
            ]
          },
          {
            word: 'Roger',
            variant: [
              'icao1946',
              'icao1947usuk1943',
              'icao1947',
              'ia1946',
              'ia1947usuk1943',
              'ia1947'
            ]
          },
          {
            word: 'Robert',
            variant: [
              'icao1947arrl',
              'ia1947arrl'
            ]
          },
          {
            word: 'Rosa',
            variant: [
              'icao1947lac',
              'ia1947lac'
            ]
          }
        ]
      },
      {
        character: 's',
        word: [
          'Sierra'
        ],
        override: [
          {
            word: 'Sardinia',
            variant: 'icao1920'
          },
          {
            word: 'Santiago',
            variant: [
              'icao1927',
              'icao1932',
              'icao1938',
              'icao1947ac',
              'ia1932',
              'imms1932'
            ]
          },
          {
            word: 'Sail',
            variant: [
              'icao1946',
              'ia1946'
            ]
          },
          {
            word: 'Sugar',
            variant: [
              'icao1947usuk1943',
              'ia1947usuk1943'
            ]
          },
          {
            word: 'Susan',
            variant: [
              'icao1947arrl',
              'ia1947arrl'
            ]
          },
          {
            word: 'Sara',
            variant: [
              'icao1947lac',
              'ia1947lac'
            ]
          },
          {
            word: 'Santa',
            variant: [
              'icao1947',
              'ia1947'
            ]
          }
        ]
      },
      {
        character: 't',
        word: 'Tango',
        override: [
          {
            word: 'Tokio',
            variant: [
              'icao1920',
              'icao1927'
            ]
          },
          {
            word: 'Tripoli',
            variant: [
              'icao1932',
              'icao1938',
              'icao1947ac',
              'ia1932',
              'imms1932'
            ]
          },
          {
            word: 'Tare',
            variant: [
              'icao1946',
              'icao1947usuk1943',
              'ia1946',
              'ia1947usuk1943'
            ]
          },
          {
            word: 'Thomas',
            variant: [
              'icao1947arrl',
              'icao1947',
              'ia1947arrl',
              'ia1947'
            ]
          },
          {
            word: 'Tomas',
            variant: [
              'icao1947lac',
              'ia1947lac'
            ]
          }
        ]
      },
      {
        character: 'u',
        word: 'Uniform',
        override: [
          {
            word: 'Uruguay',
            variant: [
              'icao1920',
              'icao1927',
              'icao1947lac',
              'ia1947lac'
            ]
          },
          {
            word: 'Upsala',
            variant: [
              'icao1932',
              'icao1938',
              'icao1947ac',
              'ia1932',
              'imms1932'
            ]
          },
          {
            word: 'Uncle',
            variant: [
              'icao1946',
              'icao1947usuk1943',
              'ia1946',
              'ia1947usuk1943'
            ]
          },
          {
            word: 'Union',
            variant: [
              'icao1947arrl',
              'icao1949',
              'icao1951',
              'ia1947arrl',
              'ia1949',
              'ia1951'
            ]
          },
          {
            word: 'Ursula',
            variant: [
              'icao1947',
              'ia1947'
            ]
          }
        ]
      },
      {
        character: 'v',
        word: 'Victor',
        override: [
          {
            word: 'Victoria',
            variant: [
              'icao1920',
              'icao1927'
            ]
          },
          {
            word: 'Valencia',
            variant: [
              'icao1932',
              'icao1938',
              'icao1947ac',
              'ia1932',
              'imms1932'
            ]
          }
        ]
      },
      {
        character: 'w',
        word: 'Whiskey',
        override: [
          {
            word: 'Washington',
            variant: [
              'icao1920',
              'icao1927',
              'icao1932',
              'icao1938',
              'icao1947ac',
              'ia1932',
              'imms1932'
            ]
          },
          {
            word: 'William',
            variant: [
              'icao1946',
              'icao1947usuk1943',
              'icao1947arrl',
              'ia1946',
              'ia1947usuk1943',
              'ia1947arrl'
            ]
          },
          {
            word: 'Whisky',
            variant: [
              'ia1956',
              'imms1965',
              'imms1967',
              'imms2000'
            ]
          }
        ]
      },
      {
        character: 'x',
        word: 'X-ray',
        override: [
          {
            word: 'Xaintrie',
            variant: 'icao1920'
          },
          {
            word: 'Xantippe',
            variant: 'icao1927'
          },
          {
            word: 'Xanthippe',
            variant: [
              'icao1932',
              'icao1938',
              'icao1947ac',
              'ia1932',
              'imms1932'
            ]
          },
          {
            word: 'Xray',
            variant: [
              'icao1947usuk1943',
              'ia1947usuk1943'
            ]
          },
          {
            word: 'Equis',
            variant: [
              'icao1947lac',
              'ia1947lac'
            ]
          },
          {
            word: 'Extra',
            variant: [
              'icao1951',
              'ia1951'
            ]
          }
        ]
      },
      {
        character: 'y',
        word: 'Yankee',
        override: [
          {
            word: 'Yokohama',
            variant: [
              'icao1920',
              'icao1927',
              'icao1932',
              'icao1938',
              'icao1947ac',
              'ia1932',
              'imms1932'
            ]
          },
          {
            word: 'Yoke',
            variant: [
              'icao1946',
              'icao1947usuk1943',
              'ia1946',
              'ia1947usuk1943'
            ]
          },
          {
            word: 'Young',
            variant: [
              'icao1947arrl',
              'ia1947arrl'
            ]
          },
          {
            word: 'Yolanda',
            variant: [
              'icao1947lac',
              'ia1947lac'
            ]
          },
          {
            word: 'York',
            variant: [
              'icao1947',
              'ia1947'
            ]
          },
          {
            word: 'Yankey',
            variant: [
              'icao1949',
              'ia1949'
            ]
          }
        ]
      },
      {
        character: 'z',
        word: 'Zulu',
        override: [
          {
            word: 'Zanzibar',
            variant: 'icao1920'
          },
          {
            word: 'Zululand',
            variant: 'icao1927'
          },
          {
            word: 'Zürich',
            variant: [
              'icao1932',
              'ia1932'
            ]
          },
          {
            word: 'Zurich',
            variant: [
              'icao1938',
              'icao1947ac',
              'imms1932'
            ]
          },
          {
            word: 'Zebra',
            variant: [
              'icao1946',
              'icao1947usuk1943',
              'icao1947arrl',
              'icao1949',
              'ia1946',
              'ia1947usuk1943',
              'ia1947arrl',
              'ia1949'
            ]
          },
          {
            word: 'Zeta',
            variant: [
              'icao1947lac',
              'ia1947lac'
            ]
          }
        ]
      },
      {
        character: '0',
        word: 'Zero',
        override: [
          {
            word: 'Zeero',
            variant: [
              'imms1965',
              'imms2000'
            ]
          },
          {
            word: 'Nadazero',
            variant: 'imms1967'
          }
        ]
      },
      {
        character: '1',
        word: 'One',
        override: [
          {
            word: 'Wun',
            variant: [
              'icao1947usuk1943',
              'icao2008',
              'ia1947usuk1943',
              'imms1965',
              'imms2000'
            ]
          },
          {
            word: 'Unaone',
            variant: 'imms1967'
          }
        ]
      },
      {
        character: '2',
        word: 'Two',
        override: [
          {
            word: 'Too',
            variant: [
              'icao1947usuk1943',
              'icao2008',
              'ia1947usuk1943',
              'imms1965',
              'imms2000'
            ]
          },
          {
            word: 'Bissotwo',
            variant: 'imms1967'
          }
        ]
      },
      {
        character: '3',
        word: 'Three',
        override: [
          {
            word: 'Thuh-ree',
            variant: [
              'icao1947usuk1943',
              'ia1947usuk1943'
            ]
          },
          {
            word: 'Tree',
            variant: [
              'icao2008',
              'imms1965',
              'imms2000'
            ]
          },
          {
            word: 'Terrathree',
            variant: 'imms1967'
          }
        ]
      },
      {
        character: '4',
        word: 'Four',
        override: [
          {
            word: 'Fo-wer',
            variant: [
              'icao1947usuk1943',
              'ia1947usuk1943'
            ]
          },
          {
            word: 'Fower',
            variant: [
              'icao2008',
              'imms1965',
              'imms2000'
            ]
          },
          {
            word: 'Kartefour',
            variant: 'imms1967'
          }
        ]
      },
      {
        character: '5',
        word: 'Five',
        override: [
          {
            word: 'Fi-yiv',
            variant: [
              'icao1947usuk1943',
              'ia1947usuk1943'
            ]
          },
          {
            word: 'Fife',
            variant: [
              'icao2008',
              'imms1965',
              'imms2000'
            ]
          },
          {
            word: 'Pantafive',
            variant: 'imms1967'
          }
        ]
      },
      {
        character: '6',
        word: 'Six',
        override: {
          word: 'Soxisix',
          variant: 'imms1967'
        }
      },
      {
        character: '7',
        word: 'Seven',
        override: {
          word: 'Setteseven',
          variant: 'imms1967'
        }
      },
      {
        character: '8',
        word: 'Eight',
        override: [
          {
            word: 'Ate',
            variant: [
              'icao1947usuk1943',
              'ia1947usuk1943'
            ]
          },
          {
            word: 'Ait',
            variant: [
              'imms1965',
              'imms2000'
            ]
          },
          {
            word: 'Oktoeight',
            variant: 'imms1967'
          }
        ]
      },
      {
        character: '9',
        word: 'Nine',
        override: [
          {
            word: 'Niner',
            variant: [
              'icao1947usuk1943',
              'icao2008',
              'ia1947usuk1943',
              'ia1956',
              'imms1965',
              'imms2000'
            ]
          },
          {
            word: 'Novenine',
            variant: 'imms1967'
          }
        ]
      },
      {
        character: '-',
        word: [
          'Dash',
          'Hyphen'
        ]
      },
      {
        character: '.',
        word: [
          'Period',
          'Decimal point',
          'Point'
        ],
        override: [
          {
            word: 'Full stop',
            variant: [
              'icao1938',
              'icao1947ac',
              'icao1959',
              'imms1932'
            ]
          },
          {
            word: 'Stop',
            variant: 'imms1967'
          }
        ]
      },
      {
        character: ',',
        word: 'Comma'
      },
      {
        character: '/',
        word: 'Fraction bar'
      }
    ]
  },
  {
    name: 'dutch',
    label: 'Dutch spelling alphabet',
    mappings: [
      {
        character: ' ',
        word: '(spatiebalk)'
      },
      {
        character: 'a',
        word: 'Anton'
      },
      {
        character: 'b',
        word: 'Bernhard'
      },
      {
        character: 'c',
        word: 'Cornelis'
      },
      {
        character: 'd',
        word: 'Dirk'
      },
      {
        character: 'e',
        word: 'Eduard'
      },
      {
        character: 'f',
        word: 'Ferdinand'
      },
      {
        character: 'g',
        word: 'Gerard'
      },
      {
        character: 'h',
        word: 'Hendrik'
      },
      {
        character: 'ij',
        word: ['IJmuiden', 'IJsbrand']
      },
      {
        character: 'i',
        word: 'Izaak'
      },
      {
        character: 'j',
        word: ['Johan', 'Jacob']
      },
      {
        character: 'k',
        word: 'Karel'
      },
      {
        character: 'l',
        word: ['Lodewijk', 'Leo']
      },
      {
        character: 'm',
        word: 'Maria'
      },
      {
        character: 'n',
        word: 'Nico'
      },
      {
        character: 'o',
        word: 'Otto'
      },
      {
        character: 'p',
        word: 'Pieter'
      },
      {
        character: 'q',
        word: ['Quirinius', 'Quinten']
      },
      {
        character: 'r',
        word: ['Richard', 'Rudolf']
      },
      {
        character: 's',
        word: 'Simon'
      },
      {
        character: 't',
        word: 'Theodoor'
      },
      {
        character: 'u',
        word: 'Utrecht'
      },
      {
        character: 'v',
        word: 'Victor'
      },
      {
        character: 'w',
        word: 'Willem'
      },
      {
        character: 'x',
        word: 'Xantippe'
      },
      {
        character: 'y',
        word: 'Ypsilon'
      },
      {
        character: 'z',
        word: 'Zacharias'
      },
      {
        character: '0',
        word: 'Nul'
      },
      {
        character: '1',
        word: 'Een'
      },
      {
        character: '2',
        word: 'Twee'
      },
      {
        character: '3',
        word: 'Drie'
      },
      {
        character: '4',
        word: 'Vier'
      },
      {
        character: '5',
        word: 'Vijf'
      },
      {
        character: '6',
        word: 'Zes'
      },
      {
        character: '7',
        word: 'Zeven'
      },
      {
        character: '8',
        word: 'Acht'
      },
      {
        character: '9',
        word: 'Negen'
      },
    ]
  },
  {
    name: 'german',
    label: 'German spelling alphabet',
    mappings: [
      {
        character: ' ',
        word: '(Leertaste)'
      },
      {
        character: 'a',
        word: 'Anton'
      },
      {
        character: 'b',
        word: 'Berta'
      },
      {
        character: 'c',
        word: 'Cäsar'
      },
      {
        character: 'd',
        word: 'Dora'
      },
      {
        character: 'e',
        word: 'Emil'
      },
      {
        character: 'f',
        word: 'Friedrich'
      },
      {
        character: 'g',
        word: 'Gustav'
      },
      {
        character: 'h',
        word: 'Heinrich'
      },
      {
        character: 'i',
        word: 'Ida'
      },
      {
        character: 'j',
        word: 'Julius'
      },
      {
        character: 'k',
        word: ['Kaufmann', 'Konrad']
      },
      {
        character: 'l',
        word: 'Ludwig'
      },
      {
        character: 'm',
        word: 'Martha'
      },
      {
        character: 'n',
        word: 'Nordpol'
      },
      {
        character: 'o',
        word: 'Otto'
      },
      {
        character: 'p',
        word: 'Paula'
      },
      {
        character: 'q',
        word: 'Quelle'
      },
      {
        character: 'r',
        word: 'Richard'
      },
      {
        character: 's',
        word: ['Samuel', 'Siegfried']
      },
      {
        character: 't',
        word: 'Theodor'
      },
      {
        character: 'u',
        word: 'Ulrich'
      },
      {
        character: 'v',
        word: 'Viktor'
      },
      {
        character: 'w',
        word: 'Wilhelm'
      },
      {
        character: 'x',
        word: ['Xanthippe', 'Xaver']
      },
      {
        character: 'y',
        word: 'Ypsilon'
      },
      {
        character: 'z',
        word: ['Zacharias', 'Zürich']
      },
      {
        character: 'ä',
        word: 'Ärger'
      },
      {
        character: 'ö',
        word: ['Ökonom', 'Österreich']
      },
      {
        character: 'ü',
        word: ['Übermut', 'Übel']
      },
      {
        character: 'ß',
        word: ['Eszett', 'Scharfes S']
      },
      {
        character: '0',
        word: 'Null'
      },
      {
        character: '1',
        word: 'Eins'
      },
      {
        character: '2',
        word: 'Zwei'
      },
      {
        character: '3',
        word: 'Drei'
      },
      {
        character: '4',
        word: 'Vier'
      },
      {
        character: '5',
        word: 'Fünf'
      },
      {
        character: '6',
        word: 'Sechs'
      },
      {
        character: '7',
        word: 'Sieben'
      },
      {
        character: '8',
        word: 'Acht'
      },
      {
        character: '9',
        word: 'Neun'
      },
    ]
  },
  {
    name: 'swedish',
    label: 'Swedish Armed Forces\' radio alphabet',
    mappings: [
      {
        character: ' ',
        word: '(mellanslag)'
      },
      {
        character: 'a',
        word: 'Adam'
      },
      {
        character: 'b',
        word: 'Bertil'
      },
      {
        character: 'c',
        word: 'Caesar'
      },
      {
        character: 'd',
        word: 'David'
      },
      {
        character: 'e',
        word: 'Erik'
      },
      {
        character: 'f',
        word: 'Filip'
      },
      {
        character: 'g',
        word: 'Gustav'
      },
      {
        character: 'h',
        word: 'Helge'
      },
      {
        character: 'i',
        word: 'Ivar'
      },
      {
        character: 'j',
        word: 'Johan'
      },
      {
        character: 'k',
        word: 'Kalle'
      },
      {
        character: 'l',
        word: 'Ludvig'
      },
      {
        character: 'm',
        word: 'Martin'
      },
      {
        character: 'n',
        word: 'Niklas'
      },
      {
        character: 'o',
        word: 'Olof'
      },
      {
        character: 'p',
        word: 'Petter'
      },
      {
        character: 'q',
        word: 'Qvintus'
      },
      {
        character: 'r',
        word: 'Rudolf'
      },
      {
        character: 's',
        word: 'Sigurd'
      },
      {
        character: 't',
        word: 'Tore'
      },
      {
        character: 'u',
        word: 'Urban'
      },
      {
        character: 'v',
        word: 'Viktor'
      },
      {
        character: 'w',
        word: 'Wilhelm'
      },
      {
        character: 'x',
        word: 'Xerxes'
      },
      {
        character: 'y',
        word: 'Yngve'
      },
      {
        character: 'z',
        word: 'Zäta'
      },
      {
        character: 'å',
        word: 'Åke'
      },
      {
        character: 'ä',
        word: 'Ärlig'
      },
      {
        character: 'ö',
        word: 'Östen'
      },
      {
        character: '0',
        word: 'Nolla'
      },
      {
        character: '1',
        word: 'Ett'
      },
      {
        character: '2',
        word: 'Tvåa'
      },
      {
        character: '3',
        word: 'Trea'
      },
      {
        character: '4',
        word: 'Fyra'
      },
      {
        character: '5',
        word: 'Femma'
      },
      {
        character: '6',
        word: 'Sexa'
      },
      {
        character: '7',
        word: 'Sju'
      },
      {
        character: '8',
        word: 'Åtta'
      },
      {
        character: '9',
        word: 'Nia'
      }
    ]
  },
  {
    name: 'russian',
    label: 'Russian spelling alphabet',
    mappings: [
      {
        character: ' ',
        word: '(пробел)'
      },
      {
        character: 'а',
        word: ['Анна', 'Антон']
      },
      {
        character: 'б',
        word: 'Борис'
      },
      {
        character: 'в',
        word: 'Василий'
      },
      {
        character: 'г',
        word: ['Григорий', 'Галина']
      },
      {
        character: 'д',
        word: 'Дмитрий'
      },
      {
        character: 'е',
        word: 'Елена'
      },
      {
        character: 'ё',
        word: 'Ёлка'
      },
      {
        character: 'ж',
        word: ['Женя', 'Жук']
      },
      {
        character: 'з',
        word: ['Зинаида', 'Зоя']
      },
      {
        character: 'и',
        word: 'Иван'
      },
      {
        character: 'й',
        word: ['Иван краткий', 'Йот']
      },
      {
        character: 'к',
        word: ['Константин', 'Киловатт']
      },
      {
        character: 'л',
        word: 'Леонид'
      },
      {
        character: 'м',
        word: ['Михаил', 'Мария']
      },
      {
        character: 'н',
        word: 'Николай'
      },
      {
        character: 'о',
        word: 'Ольга'
      },
      {
        character: 'п',
        word: 'Павел'
      },
      {
        character: 'р',
        word: ['Роман', 'Радио']
      },
      {
        character: 'с',
        word: ['Семён', 'Сергей']
      },
      {
        character: 'т',
        word: ['Татьяна', 'Тамара']
      },
      {
        character: 'у',
        word: 'Ульяна'
      },
      {
        character: 'ф',
        word: 'Фёдор'
      },
      {
        character: 'х',
        word: 'Харитон'
      },
      {
        character: 'ц',
        word: ['Цапля', 'Центр']
      },
      {
        character: 'ч',
        word: 'Человек'
      },
      {
        character: 'ш',
        word: 'Шура'
      },
      {
        character: 'щ',
        word: 'Щука'
      },
      {
        character: 'ъ',
        word: 'Твёрдый знак'
      },
      {
        character: 'ы',
        word: ['Еры', 'Игрек']
      },
      {
        character: 'ь',
        word: 'Мягкий знак'
      },
      {
        character: 'э',
        word: ['Эхо', 'Эмма']
      },
      {
        character: 'ю',
        word: 'Юрий'
      },
      {
        character: 'я',
        word: 'Яков'
      },
      {
        character: '0',
        word: 'Ноль'
      },
      {
        character: '1',
        word: 'Один'
      },
      {
        character: '2',
        word: 'Два'
      },
      {
        character: '3',
        word: 'Три'
      },
      {
        character: '4',
        word: 'Четыре'
      },
      {
        character: '5',
        word: 'Пять'
      },
      {
        character: '6',
        word: 'Шесть'
      },
      {
        character: '7',
        word: 'Семь'
      },
      {
        character: '8',
        word: 'Восемь'
      },
      {
        character: '9',
        word: 'Девять'
      },
      {
        character: '.',
        word: 'Точка'
      }
    ]
  }
  /* eslint-enable no-multi-spaces */
]

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
  static getMeta () {
    return meta
  }

  /**
   * Constructor
   */
  constructor (alphabetSpecs = defaultAlphabetSpecs) {
    super()
    this._alphabetSpecs = alphabetSpecs
    this._characterMap = {}
    this._wordMap = {}

    this.addSetting({
      name: 'alphabet',
      type: 'enum',
      elements: alphabetSpecs.map(alphabet => alphabet.name),
      labels: alphabetSpecs.map(alphabet => alphabet.label),
      randomizable: false,
      style: 'radio'
    })

    this.addSetting({
      name: 'variant',
      type: 'enum',
      elements: [ '' ],
      labels: [ '' ],
      randomizable: false
    })

    this.buildTranslationMap()
  }

  /**
   * Performs encode or decode on given content.
   * @protected
   * @param {Chain} content
   * @param {boolean} isEncode True for encoding, false for decoding
   * @return {number[]|string|Uint8Array|Chain|Promise} Resulting content
   */
  performTranslate (content, isEncode) {
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
    const name = this.getSettingValue('alphabet')
    const spec = this._alphabetSpecs.find(spec => spec.name === name)
    if (spec === undefined) {
      throw new Error(`Alphabet with name '${name}' is not defined`)
    }

    const variantSetting = this.getSetting('variant')
    const variants = spec.variants || [{
      name: '',
      value: ''
    }]

    variantSetting.setElements(variants.map(v => v.name), variants.map(v => v.label), variants.map(v => v.description), false)

    // Build encode/decode maps
    const characterMap = {};
    const wordMap = {}

    this._variantOverridesMap = {}

    for (let mapping of spec.mappings) {
      const characters = wrapInArray(mapping.character)
      const words = wrapInArray(mapping.word)
      const overrides = wrapInArray(mapping.override)

      for (let override of overrides) {
        const overrideWords = wrapInArray(override.word)
        const variants = wrapInArray(override.variant)
        const overrideWord = overrideWords[0]
        words.push(...overrideWords)

        for (let variant of variants) {
          if (this._variantOverridesMap[variant] === undefined) {
            this._variantOverridesMap[variant] = []
          }

          for (let variantOverride of this._variantOverridesMap[variant]) {
            const duplicatedCharacter = variantOverride.characters.find(character => characters.includes(character))
            if (duplicatedCharacter) {
              throw new Error(`Alphabet with name '${name}' has conflicting mappings for variant '${variant}' with duplicated character '${duplicatedCharacter}'`)
            }

            if (variantOverride.word === overrideWord) {
              throw new Error(`Alphabet with name '${name}' has conflicting mappings for variant '${variant}' with duplicated word '${duplicatedCharacter}'`)
            }
          }
          
          this._variantOverridesMap[variant].push({
            characters: characters,
            word: overrideWord
          })
        }
      }

      for (let character of characters) {
        if (characterMap[character] !== undefined) {
          throw new Error(`Alphabet with name '${name}' has multiple mappings with character '${character}'`)
        }
        characterMap[character] = words[0]
      }

      for (let word of words) {
        if (wordMap[word] !== undefined) {
          throw new Error(`Alphabet with name '${name}' has multiple mappings with word '${word}'`)
        }
        wordMap[word] = characters[0]
      }
    }

    if (characterMap[' '] === undefined) {
      characterMap[' '] = defaultSpaceWord
      wordMap[defaultSpaceWord] = ' '
    }

    this._characterMap = characterMap
    this._wordMap = wordMap

    this._characterMapNoOverrides = {}
    this._wordMapNoOverrides = {}
    Object.assign(this._characterMapNoOverrides, this._characterMap)
    Object.assign(this._wordMapNoOverrides, this._wordMap)

    variantSetting.setValue(variants[0].name)

    return this
  }

  _applyVariantOverrides () {
    Object.assign(this._characterMap, this._characterMapNoOverrides)
    Object.assign(this._wordMap, this._wordMapNoOverrides)
    const variant = this.getSettingValue('variant')
    let variantOverrides = this._variantOverridesMap[variant]
    if (variantOverrides) {
      for (let variantOverride of variantOverrides) {
        for (let character of variantOverride.characters) {
          this._characterMap[character] = variantOverride.word
        }
        this._wordMap[variantOverride.word] = variantOverride.characters[0]
      }
    }
  }
}
