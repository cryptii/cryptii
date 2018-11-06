
import assert from 'assert'
import { describe, it } from 'mocha'

import AffineCipherEncoder from '../src/Encoder/AffineCipher'
import AtbashEncoder from '../src/Encoder/Atbash'
import Pipe from '../src/Pipe'
import ROT13Encoder from '../src/Encoder/ROT13'
import TextViewer from '../src/Viewer/Text'
import VigenereCipherEncoder from '../src/Encoder/VigenereCipher'

const examplePipeData = {
  bricks: [
    { name: 'text' },
    { name: 'affine-cipher', settings: { a: 7, b: 7 } },
    { name: 'text' }
  ],
  content: 'the quick brown fox jumps over 13 lazy dogs.',
  contentBucket: 0
}

/** @test {Pipe} */
describe('Pipe', () => {
  /** @test {Pipe.extract} */
  describe('extract()', () => {
    it('should extract pipe from structured data', () => {
      const pipe = Pipe.extract(examplePipeData)
      // Pipe bricks
      const pipeBricks = pipe.getBricks()
      assert.strictEqual(pipeBricks.length, 3)
      assert.strictEqual(pipeBricks[0] instanceof TextViewer, true)
      assert.strictEqual(pipeBricks[1] instanceof AffineCipherEncoder, true)
      assert.strictEqual(pipeBricks[2] instanceof TextViewer, true)
      // Brick settings
      assert.strictEqual(
        pipeBricks[1].getSettingValue('a'),
        examplePipeData.bricks[1].settings.a)
      assert.strictEqual(
        pipeBricks[1].getSettingValue('b'),
        examplePipeData.bricks[1].settings.b)
      // Content applied to the pipe
      assert.strictEqual(
        pipe.getContent(examplePipeData.contentBucket, false).getString(),
        examplePipeData.content)
      // View should only be created lazily
      assert.strictEqual(pipe.hasView(), false)
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
      const pipe = Pipe.extract(examplePipeData)
      const viewer = new TextViewer()
      pipe.addBrick(viewer)
      assert.strictEqual(pipe.getBricks()[3], viewer)
    })
  })
  /** @test {Pipe.removeBrick} */
  describe('removeBrick()', () => {
    it('should remove first brick from a pipe', () => {
      const pipe = Pipe.extract(examplePipeData)
      pipe.removeBrick(0)
      const pipeBricks = pipe.getBricks()
      assert.strictEqual(pipeBricks.length, 2)
      assert.strictEqual(pipeBricks[0] instanceof AffineCipherEncoder, true)
      assert.strictEqual(pipeBricks[1] instanceof TextViewer, true)
      assert.strictEqual(pipe.hasView(), false)
    })
    it('should remove middle brick from a pipe', () => {
      const pipe = Pipe.extract(examplePipeData)
      pipe.removeBrick(1)
      const pipeBricks = pipe.getBricks()
      assert.strictEqual(pipeBricks.length, 2)
      assert.strictEqual(pipeBricks[0] instanceof TextViewer, true)
      assert.strictEqual(pipeBricks[1] instanceof TextViewer, true)
    })
    it('should remove last brick from a pipe', () => {
      const pipe = Pipe.extract(examplePipeData)
      pipe.removeBrick(2)
      const pipeBricks = pipe.getBricks()
      assert.strictEqual(pipeBricks.length, 2)
      assert.strictEqual(pipeBricks[0] instanceof TextViewer, true)
      assert.strictEqual(pipeBricks[1] instanceof AffineCipherEncoder, true)
    })
  })
  /** @test {Pipe.spliceBricks} */
  describe('spliceBricks()', () => {
    it('should return removed bricks', () => {
      const pipe = Pipe.extract(examplePipeData)
      const removingBrick = pipe.getBricks()[1]
      const removedBricks = pipe.spliceBricks(1, 1)
      assert.strictEqual(removedBricks[0], removingBrick)
    })
    it('should replace a single encoder whilst maintaining result and direction (case 1 & 2)', async () => {
      const pipe = Pipe.extract({
        bricks: [
          { name: 'text' },
          { name: 'affine-cipher', settings: { a: 7, b: 7 } },
          { name: 'text' }
        ],
        content: 'kej prlvz owbfu qbm srnid byjw 13 ghat cbxd.',
        contentBucket: 1
      })
      // Let content propagate backward
      const a = await pipe.getContent(0)
      assert.strictEqual(a.getString(), 'the quick brown fox jumps over 13 lazy dogs.')
      // Replace encoder, the first bucket should update
      pipe.spliceBricks(1, 1, 'vigenere-cipher')
      assert.strictEqual(pipe.getBricks()[1] instanceof VigenereCipherEncoder, true)
      const b = await pipe.getContent(0)
      assert.strictEqual(b.getString(), 'inl aydnx xymmm izv ucuav zhlh 13 nzsr ldik.')
      // Change translation direction by changing the first bucket
      pipe.setContent('uryyb jbeyq', 0)
      const c = await pipe.getContent(1)
      assert.strictEqual(c.getString(), 'wiwnu rjgpo')
      // Replace encoder, the second bucket should update
      pipe.spliceBricks(1, 1, 'rot13')
      assert.strictEqual(pipe.getBricks()[1] instanceof ROT13Encoder, true)
      const d = await pipe.getContent(1)
      assert.strictEqual(d.getString(), 'hello world')
    })
    it('should replace the second encoder whilst maintaining result and direction (case 1 & 2)', async () => {
      const pipe = Pipe.extract({
        bricks: [
          { name: 'text' },
          { name: 'affine-cipher', settings: { a: 7, b: 7 } },
          { name: 'rot13' },
          { name: 'text' }
        ],
        content: 'the quick brown fox jumps over 13 lazy dogs',
        contentBucket: 0
      })
      // Let content propagate forward through both encoders
      const a = await pipe.getContent(2)
      assert.strictEqual(a.getString(), 'xrw ceyim bjosh doz feavq olwj 13 tung pokq')
      // Replace second encoder, the last bucket should update
      pipe.spliceBricks(2, 1, 'atbash')
      assert.strictEqual(pipe.getBricks()[2] instanceof AtbashEncoder, true)
      const b = await pipe.getContent(2)
      assert.strictEqual(b.getString(), 'pvq kioea ldyuf jyn himrw ybqd 13 tszg xycw')
      // Change translation direction by changing the last bucket
      pipe.setContent('rwtto sojtp', 2)
      const c = await pipe.getContent(0)
      assert.strictEqual(c.getString(), 'pslli aiflt')
      // Replace second encoder, the first bucket should update
      pipe.spliceBricks(2, 1, 'rot13')
      assert.strictEqual(pipe.getBricks()[2] instanceof ROT13Encoder, true)
      const d = await pipe.getContent(0)
      assert.strictEqual(d.getString(), 'hello world')
    })
    it('should select the first bucket when replacing both encoders (case 3)', async () => {
      const pipe = Pipe.extract({
        bricks: [
          { name: 'text' },
          { name: 'affine-cipher', settings: { a: 7, b: 7 } },
          { name: 'text' },
          { name: 'rot13' },
          { name: 'text' }
        ],
        content: 'hello world',
        contentBucket: 1
      })
      // Let content propagate in both directions
      const a = await pipe.getContent(0)
      assert.strictEqual(a.getString(), 'ahiib rbuis')
      const b = await pipe.getContent(2)
      assert.strictEqual(b.getString(), 'uryyb jbeyq')
      // Replace both encoders, only the last bucket should update
      pipe.spliceBricks(0, 2, 'rot13', 'atbash')
      const c = await pipe.getContent(0)
      assert.strictEqual(c.getString(), 'ahiib rbuis')
      const d = await pipe.getContent(2)
      assert.strictEqual(d.getString(), 'mfeel vlseu')
    })
    it('should keep propagation from last bucket when replacing the first encoder by two new ones (case 4)', async () => {
      const pipe = Pipe.extract({
        bricks: [
          { name: 'text' },
          { name: 'atbash' },
          { name: 'text' },
          { name: 'rot13' },
          { name: 'text' }
        ],
        content: 'jvjah ewtcb',
        contentBucket: 2
      })
      // Let content propagate backwards
      const a = await pipe.getContent(0)
      assert.strictEqual(a.getString(), 'drdmf iqtkl')
      // Replace first encoder by two new ones, the first bucket should update
      pipe.spliceBricks(1, 1, 'rot13', 'vigenere-cipher')
      const b = await pipe.getContent(3)
      assert.strictEqual(b.getString(), 'jvjah ewtcb')
      const c = await pipe.getContent(0)
      assert.strictEqual(c.getString(), 'hello world')
    })
  })
})
