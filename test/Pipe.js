
import assert from 'assert'
import { describe, it } from 'mocha'

import Pipe from '../src/Pipe'
import TextViewer from '../src/Viewer/Text'
import AffineCipherEncoder from '../src/Encoder/AffineCipher'
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
      // pipe bricks
      const pipeBricks = pipe.getBricks()
      assert.strictEqual(pipeBricks.length, 3)
      assert.strictEqual(pipeBricks[0] instanceof TextViewer, true)
      assert.strictEqual(pipeBricks[1] instanceof AffineCipherEncoder, true)
      assert.strictEqual(pipeBricks[2] instanceof TextViewer, true)
      // brick settings
      assert.strictEqual(
        pipeBricks[1].getSettingValue('a'),
        examplePipeData.bricks[1].settings.a)
      assert.strictEqual(
        pipeBricks[1].getSettingValue('b'),
        examplePipeData.bricks[1].settings.b)
      // content applied to the pipe
      assert.strictEqual(
        pipe.getContent(examplePipeData.contentBucket, false).getString(),
        examplePipeData.content)
      // view should only be created lazily
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
    it('should replace a brick without changing the translation direction', async () => {
      const pipe = Pipe.extract({
        bricks: [
          { name: 'text' },
          { name: 'affine-cipher', settings: { a: 7, b: 7 } },
          { name: 'text' }
        ],
        content: 'kej prlvz owbfu qbm srnid byjw 13 ghat cbxd.',
        contentBucket: 1
      })
      let result = await pipe.getContent(0)
      assert.strictEqual(result.getString(), 'the quick brown fox jumps over 13 lazy dogs.')
      pipe.spliceBricks(1, 1, 'vigenere-cipher')
      result = await pipe.getContent(0)
      assert.strictEqual(pipe.getBricks()[1] instanceof VigenereCipherEncoder, true)
      assert.strictEqual(result.getString(), 'inl aydnx xymmm izv ucuav zhlh 13 nzsr ldik.')
    })
  })
})
