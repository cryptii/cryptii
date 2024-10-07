import assert from 'assert'
import { describe, it } from 'mocha'

import AffineCipherEncoder from '../src/Encoder/AffineCipher.js'
import AlphabeticalSubstitutionEncoder from '../src/Encoder/AlphabeticalSubstitution.js'
import BrickFactory from '../src/Factory/Brick.js'
import Pipe from '../src/Pipe.js'
import ROT13Encoder from '../src/Encoder/ROT13.js'
import TextViewer from '../src/Viewer/Text.js'
import VigenereCipherEncoder from '../src/Encoder/VigenereCipher.js'

const examplePipeData = {
  items: [
    { name: 'text' },
    { name: 'affine-cipher', settings: { a: 7, b: 7 } },
    { name: 'text' }
  ],
  content: {
    data: 'the quick brown fox jumps over 13 lazy dogs.'
  }
}

const atbashBrick = {
  name: 'alphabetical-substitution',
  plaintextAlphabet: 'abcdefghijklmnopqrstuvwxyz',
  ciphertextAlphabet: 'zyxwvutsrqponmlkjihgfedcba'
}

/** @test {Pipe} */
describe('Pipe', () => {
  /** @test {Pipe.extract} */
  describe('extract()', () => {
    it('should extract pipe from structured data', () => {
      const factory = new BrickFactory()
      const pipe = Pipe.extract(examplePipeData, factory)
      // Pipe bricks
      const pipeBricks = pipe.getBricks()
      assert.strictEqual(pipeBricks.length, 3)
      assert.strictEqual(pipeBricks[0] instanceof TextViewer, true)
      assert.strictEqual(pipeBricks[1] instanceof AffineCipherEncoder, true)
      assert.strictEqual(pipeBricks[2] instanceof TextViewer, true)
      // Brick settings
      assert.strictEqual(pipeBricks[1].getSettingValue('a'), 7)
      assert.strictEqual(pipeBricks[1].getSettingValue('b'), 7)
      // Content applied to the pipe
      assert.strictEqual(
        pipe.getContent(0, false).getString(),
        'the quick brown fox jumps over 13 lazy dogs.')
      // View should only be created lazily
      assert.strictEqual(pipe.hasView(), false)
    })
  })
  /** @test {Pipe.getBricks} */
  describe('getBricks()', () => {
    it('should return a shallow copy of the containing bricks', () => {
      const pipe = Pipe.extract(examplePipeData, new BrickFactory())
      // Expect strictly the same array elements
      assert.deepStrictEqual(pipe.getBricks(), pipe.getBricks())
      // Expect a shallow copy of the array
      assert.notStrictEqual(pipe.getBricks(), pipe.getBricks())
    })
  })
  /** @test {Pipe.addBrick} */
  describe('addBrick()', () => {
    it('should add first brick to an empty pipe', () => {
      const pipe = new Pipe()
      const viewer = new TextViewer()
      pipe.addBrick(viewer)
      assert.strictEqual(pipe.getBricks()[0], viewer)
      assert.strictEqual(pipe.hasView(), false)
    })
    it('should add brick to the end of a pipe', () => {
      const factory = new BrickFactory()
      const pipe = Pipe.extract(examplePipeData, factory)
      const viewer = new TextViewer()
      pipe.addBrick(viewer)
      assert.strictEqual(pipe.getBricks()[3], viewer)
    })
  })
  /** @test {Pipe.removeBrick} */
  describe('removeBrick()', () => {
    it('should remove first brick from a pipe', () => {
      const factory = new BrickFactory()
      const pipe = Pipe.extract(examplePipeData, factory)
      pipe.removeBrick(0)
      const pipeBricks = pipe.getBricks()
      assert.strictEqual(pipeBricks.length, 2)
      assert.strictEqual(pipeBricks[0] instanceof AffineCipherEncoder, true)
      assert.strictEqual(pipeBricks[1] instanceof TextViewer, true)
      assert.strictEqual(pipe.hasView(), false)
    })
    it('should remove middle brick from a pipe', () => {
      const factory = new BrickFactory()
      const pipe = Pipe.extract(examplePipeData, factory)
      pipe.removeBrick(1)
      const pipeBricks = pipe.getBricks()
      assert.strictEqual(pipeBricks.length, 2)
      assert.strictEqual(pipeBricks[0] instanceof TextViewer, true)
      assert.strictEqual(pipeBricks[1] instanceof TextViewer, true)
    })
    it('should remove last brick from a pipe', () => {
      const factory = new BrickFactory()
      const pipe = Pipe.extract(examplePipeData, factory)
      pipe.removeBrick(2)
      const pipeBricks = pipe.getBricks()
      assert.strictEqual(pipeBricks.length, 2)
      assert.strictEqual(pipeBricks[0] instanceof TextViewer, true)
      assert.strictEqual(pipeBricks[1] instanceof AffineCipherEncoder, true)
    })
  })
  /** @test {Pipe.replaceBrick} */
  describe('replaceBrick()', () => {
    it('should replace a single encoder whilst maintaining result and direction (case 1 & 2)', async () => {
      const factory = new BrickFactory()
      const pipe = Pipe.extract({
        items: [
          { name: 'text' },
          { name: 'affine-cipher', settings: { a: 7, b: 7 } },
          { name: 'text' }
        ],
        content: {
          data: 'kej prlvz owbfu qbm srnid byjw 13 ghat cbxd.',
          // Content bucket 1
          index: 2
        }
      }, factory)
      // Let content propagate backward
      const a = await pipe.getContent(0)
      assert.strictEqual(a.getString(), 'the quick brown fox jumps over 13 lazy dogs.')
      // Replace encoder, the first bucket should update
      pipe.replaceBrick(pipe.getBrick(1), { name: 'vigenere-cipher' })
      assert.strictEqual(pipe.getBricks()[1] instanceof VigenereCipherEncoder, true)
      const b = await pipe.getContent(0)
      assert.strictEqual(b.getString(), 'inl aydnx xymmm izv ucuav zhlh 13 nzsr ldik.')
      // Change translation direction by changing the first bucket
      pipe.setContent('uryyb jbeyq', 0)
      const c = await pipe.getContent(1)
      assert.strictEqual(c.getString(), 'wiwnu rjgpo')
      // Replace encoder, the second bucket should update
      pipe.replaceBrick(pipe.getBrick(1), { name: 'rot13' })
      assert.strictEqual(pipe.getBricks()[1] instanceof ROT13Encoder, true)
      const d = await pipe.getContent(1)
      assert.strictEqual(d.getString(), 'hello world')
    })
  })
  /** @test {Pipe.spliceBricks} */
  describe('spliceBricks()', () => {
    it('should return removed bricks', () => {
      const factory = new BrickFactory()
      const pipe = Pipe.extract(examplePipeData, factory)
      const removingBrick = pipe.getBricks()[1]
      const removedBricks = pipe.spliceBricks(1, 1)
      assert.strictEqual(removedBricks[0], removingBrick)
    })
    it('should replace the second encoder whilst maintaining result and direction (case 1 & 2)', async () => {
      const factory = new BrickFactory()
      const pipe = Pipe.extract({
        items: [
          { name: 'text' },
          { name: 'affine-cipher', settings: { a: 7, b: 7 } },
          { name: 'rot13' },
          { name: 'text' }
        ],
        content: {
          data: 'the quick brown fox jumps over 13 lazy dogs'
        }
      }, factory)
      // Let content propagate forward through both encoders
      const a = await pipe.getContent(2)
      assert.strictEqual(a.getString(), 'xrw ceyim bjosh doz feavq olwj 13 tung pokq')
      // Replace second encoder, the last bucket should update
      pipe.spliceBricks(2, 1, [atbashBrick])
      assert.strictEqual(pipe.getBricks()[2] instanceof AlphabeticalSubstitutionEncoder, true)
      const b = await pipe.getContent(2)
      assert.strictEqual(b.getString(), 'pvq kioea ldyuf jyn himrw ybqd 13 tszg xycw')
      // Change translation direction by changing the last bucket
      pipe.setContent('rwtto sojtp', 2)
      const c = await pipe.getContent(0)
      assert.strictEqual(c.getString(), 'pslli aiflt')
      // Replace second encoder, the first bucket should update
      pipe.spliceBricks(2, 1, [{ name: 'rot13' }])
      assert.strictEqual(pipe.getBricks()[2] instanceof ROT13Encoder, true)
      const d = await pipe.getContent(0)
      assert.strictEqual(d.getString(), 'hello world')
    })
    it('should select the first bucket when replacing both encoders (case 3)', async () => {
      const factory = new BrickFactory()
      const pipe = Pipe.extract({
        items: [
          { name: 'text' },
          { name: 'affine-cipher', settings: { a: 7, b: 7 } },
          { name: 'text' },
          { name: 'rot13' },
          { name: 'text' }
        ],
        content: {
          data: 'hello world',
          // Content bucket 1
          index: 2
        }
      }, factory)
      // Let content propagate in both directions
      const a = await pipe.getContent(0)
      assert.strictEqual(a.getString(), 'ahiib rbuis')
      const b = await pipe.getContent(2)
      assert.strictEqual(b.getString(), 'uryyb jbeyq')
      // Replace both encoders, only the last bucket should update
      pipe.spliceBricks(1, 3, [{ name: 'rot13' }, { name: 'text' }, atbashBrick])
      const c = await pipe.getContent(0)
      assert.strictEqual(c.getString(), 'ahiib rbuis')
      const d = await pipe.getContent(2)
      assert.strictEqual(d.getString(), 'mfeel vlseu')
    })
    it('should keep propagation from last bucket when replacing the first encoder by two new ones (case 4)', async () => {
      const factory = new BrickFactory()
      const pipe = Pipe.extract({
        items: [
          { name: 'text' },
          atbashBrick,
          { name: 'text' },
          { name: 'rot13' },
          { name: 'text' }
        ],
        content: {
          data: 'jvjah ewtcb',
          // Content bucket 2
          index: 4
        }
      }, factory)
      // Let content propagate backwards
      const a = await pipe.getContent(0)
      assert.strictEqual(a.getString(), 'drdmf iqtkl')
      // Replace first encoder by two new ones, the first bucket should update
      pipe.spliceBricks(1, 1, [{ name: 'rot13' }, { name: 'text' }, { name: 'vigenere-cipher' }])
      const b = await pipe.getContent(3)
      assert.strictEqual(b.getString(), 'jvjah ewtcb')
      const c = await pipe.getContent(0)
      assert.strictEqual(c.getString(), 'hello world')
    })
    it('should keep propagation from last bucket when replacing the two first encoders by a single new one (case 4)', async () => {
      const factory = new BrickFactory()
      const pipe = Pipe.extract({
        items: [
          { name: 'text' },
          { name: 'rot13' },
          { name: 'text' },
          { name: 'vigenere-cipher' },
          { name: 'text' },
          { name: 'rot13' },
          { name: 'text' }
        ],
        content: {
          data: 'jvjah ewtcb',
          // Content bucket 3
          index: 6
        }
      }, factory)
      // Let content propagate backwards
      const a = await pipe.getContent(0)
      assert.strictEqual(a.getString(), 'hello world')
      // Replace first two encoders by a single new one
      pipe.spliceBricks(1, 3, [atbashBrick])
      const b = await pipe.getContent(2)
      assert.strictEqual(b.getString(), 'jvjah ewtcb')
      const c = await pipe.getContent(0)
      assert.strictEqual(c.getString(), 'drdmf iqtkl')
    })
  })
})
