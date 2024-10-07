// magic initialization constants
const IA = 0x67452301
const IB = 0xefcdab89
const IC = 0x98badcfe
const ID = 0x10325476

// transform function constants
const S11 = 7
const S12 = 12
const S13 = 17
const S14 = 22
const S21 = 5
const S22 = 9
const S23 = 14
const S24 = 20
const S31 = 4
const S32 = 11
const S33 = 16
const S34 = 23
const S41 = 6
const S42 = 10
const S43 = 15
const S44 = 21

/**
 * Function for creating a MD5 message digest for given bytes.
 * @see https://tools.ietf.org/html/rfc1321
 * @see http://www.myersdaily.org/joseph/javascript/md5-text.html
 * @param {Uint8Array} bytes Bytes to be encoded
 * @return {Uint8Array} Md5 message digest
 */
export default function md5 (bytes) {
  // make array mutable
  bytes = Array.from(bytes)

  // track number of bytes before preprocessing
  const b = bytes.length

  // RFC 1321 3.1: Step 1. Append Padding Bits

  // append a single "1" bit to the message
  // it's okay to add a whole byte, because it gets padded anyway
  bytes.push(0b10000000)

  // "0" bits are appended so that the length in bits of the padded message
  // becomes congruent to 448 (56 bytes), modulo 512 (64 bytes)
  while (bytes.length % 64 !== 56) {
    bytes.push(0x00)
  }

  // RFC 1321 3.2 Step 2. Append Length

  // append the low-order 64 bits of b modulo 2^64 to bytes
  // these bits are appended as two 32-bit words, appended low-order word first
  let shift
  for (let i = 0; i < 8; i++) {
    if (i === 0) {
      // multiply bytes by 8 (left shift by 3 bits)
      bytes.push((b & 0b11111) << 3)
    } else {
      // limit right shift to 31 bits
      shift = i * 8 - 3
      bytes.push(shift < 32 ? (b >> shift) & 0xff : 0)
    }
  }

  // let m denote the words of the resulting message
  const n = bytes.length / 4
  const m = new Array(n)

  for (let i = 0; i < n; i++) {
    // each consecutive group of four bytes is interpreted as a word with the
    // low-order (least significant) byte given first
    m[i] =
      (bytes[i * 4 + 3] << 24) +
      (bytes[i * 4 + 2] << 16) +
      (bytes[i * 4 + 1] << 8) +
      bytes[i * 4]
  }

  // RFC 1321 3.3: Step 3. Initialize MD Buffer

  // load magic initialization constants A, B, C & D
  const context = [IA, IB, IC, ID]

  // RFC 1321 3.4 Step 4. Process Message in 16-Word Blocks
  for (let i = 0; i < n; i += 16) {
    md5Transform(context, m.slice(i, i + 16))
  }

  // RFC 1321 3.5 Step 5. Output

  // the message digest produced as output is A, B, C, D. That is, we begin with
  // the low-order byte of A, and end with the high-order byte of D.
  const result = new Array(16)
  for (let i = 0, j = 0; j < 16; i++, j += 4) {
    result[j] = (context[i] & 0xff)
    result[j + 1] = ((context[i] >> 8) & 0xff)
    result[j + 2] = ((context[i] >> 16) & 0xff)
    result[j + 3] = ((context[i] >> 24) & 0xff)
  }

  return new Uint8Array(result)
}

function md5Transform (context, block) {
  let [a, b, c, d] = context

  /* eslint-disable no-multi-spaces */

  // round 1
  a = ff(a, b, c, d, block[0],  S11, 0xd76aa478)
  d = ff(d, a, b, c, block[1],  S12, 0xe8c7b756)
  c = ff(c, d, a, b, block[2],  S13, 0x242070db)
  b = ff(b, c, d, a, block[3],  S14, 0xc1bdceee)
  a = ff(a, b, c, d, block[4],  S11, 0xf57c0faf)
  d = ff(d, a, b, c, block[5],  S12, 0x4787c62a)
  c = ff(c, d, a, b, block[6],  S13, 0xa8304613)
  b = ff(b, c, d, a, block[7],  S14, 0xfd469501)
  a = ff(a, b, c, d, block[8],  S11, 0x698098d8)
  d = ff(d, a, b, c, block[9],  S12, 0x8b44f7af)
  c = ff(c, d, a, b, block[10], S13, 0xffff5bb1)
  b = ff(b, c, d, a, block[11], S14, 0x895cd7be)
  a = ff(a, b, c, d, block[12], S11, 0x6b901122)
  d = ff(d, a, b, c, block[13], S12, 0xfd987193)
  c = ff(c, d, a, b, block[14], S13, 0xa679438e)
  b = ff(b, c, d, a, block[15], S14, 0x49b40821)

  // round 2
  a = gg(a, b, c, d, block[1],  S21, 0xf61e2562)
  d = gg(d, a, b, c, block[6],  S22, 0xc040b340)
  c = gg(c, d, a, b, block[11], S23, 0x265e5a51)
  b = gg(b, c, d, a, block[0],  S24, 0xe9b6c7aa)
  a = gg(a, b, c, d, block[5],  S21, 0xd62f105d)
  d = gg(d, a, b, c, block[10], S22, 0x02441453)
  c = gg(c, d, a, b, block[15], S23, 0xd8a1e681)
  b = gg(b, c, d, a, block[4],  S24, 0xe7d3fbc8)
  a = gg(a, b, c, d, block[9],  S21, 0x21e1cde6)
  d = gg(d, a, b, c, block[14], S22, 0xc33707d6)
  c = gg(c, d, a, b, block[3],  S23, 0xf4d50d87)
  b = gg(b, c, d, a, block[8],  S24, 0x455a14ed)
  a = gg(a, b, c, d, block[13], S21, 0xa9e3e905)
  d = gg(d, a, b, c, block[2],  S22, 0xfcefa3f8)
  c = gg(c, d, a, b, block[7],  S23, 0x676f02d9)
  b = gg(b, c, d, a, block[12], S24, 0x8d2a4c8a)

  // round 3
  a = hh(a, b, c, d, block[5],  S31, 0xfffa3942)
  d = hh(d, a, b, c, block[8],  S32, 0x8771f681)
  c = hh(c, d, a, b, block[11], S33, 0x6d9d6122)
  b = hh(b, c, d, a, block[14], S34, 0xfde5380c)
  a = hh(a, b, c, d, block[1],  S31, 0xa4beea44)
  d = hh(d, a, b, c, block[4],  S32, 0x4bdecfa9)
  c = hh(c, d, a, b, block[7],  S33, 0xf6bb4b60)
  b = hh(b, c, d, a, block[10], S34, 0xbebfbc70)
  a = hh(a, b, c, d, block[13], S31, 0x289b7ec6)
  d = hh(d, a, b, c, block[0],  S32, 0xeaa127fa)
  c = hh(c, d, a, b, block[3],  S33, 0xd4ef3085)
  b = hh(b, c, d, a, block[6],  S34, 0x04881d05)
  a = hh(a, b, c, d, block[9],  S31, 0xd9d4d039)
  d = hh(d, a, b, c, block[12], S32, 0xe6db99e5)
  c = hh(c, d, a, b, block[15], S33, 0x1fa27cf8)
  b = hh(b, c, d, a, block[2],  S34, 0xc4ac5665)

  // round 4
  a = ii(a, b, c, d, block[0],  S41, 0xf4292244)
  d = ii(d, a, b, c, block[7],  S42, 0x432aff97)
  c = ii(c, d, a, b, block[14], S43, 0xab9423a7)
  b = ii(b, c, d, a, block[5],  S44, 0xfc93a039)
  a = ii(a, b, c, d, block[12], S41, 0x655b59c3)
  d = ii(d, a, b, c, block[3],  S42, 0x8f0ccc92)
  c = ii(c, d, a, b, block[10], S43, 0xffeff47d)
  b = ii(b, c, d, a, block[1],  S44, 0x85845dd1)
  a = ii(a, b, c, d, block[8],  S41, 0x6fa87e4f)
  d = ii(d, a, b, c, block[15], S42, 0xfe2ce6e0)
  c = ii(c, d, a, b, block[6],  S43, 0xa3014314)
  b = ii(b, c, d, a, block[13], S44, 0x4e0811a1)
  a = ii(a, b, c, d, block[4],  S41, 0xf7537e82)
  d = ii(d, a, b, c, block[11], S42, 0xbd3af235)
  c = ii(c, d, a, b, block[2],  S43, 0x2ad7d2bb)
  b = ii(b, c, d, a, block[9],  S44, 0xeb86d391)

  /* eslint-enable no-multi-spaces */

  // increment each of the four registers by the value it had before this block
  // was started
  context[0] = add32(a, context[0])
  context[1] = add32(b, context[1])
  context[2] = add32(c, context[2])
  context[3] = add32(d, context[3])
}

function add32 (a, b) {
  return (a + b) & 0xffffffff
}

function cmn (q, a, b, x, s, t) {
  a = add32(add32(a, q), add32(x, t))
  return add32((a << s) | (a >>> (32 - s)), b)
}

function ff (a, b, c, d, x, s, t) {
  return cmn((b & c) | ((~b) & d), a, b, x, s, t)
}

function gg (a, b, c, d, x, s, t) {
  return cmn((b & d) | (c & (~d)), a, b, x, s, t)
}

function hh (a, b, c, d, x, s, t) {
  return cmn(b ^ c ^ d, a, b, x, s, t)
}

function ii (a, b, c, d, x, s, t) {
  return cmn(c ^ (b | (~d)), a, b, x, s, t)
}
