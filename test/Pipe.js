
import assert from 'assert'
import { describe, it } from 'mocha'

import Pipe from '../src/Pipe'
import TextViewer from '../src/Viewer/Text'
import AffineCipherEncoder from '../src/Encoder/AffineCipher'

const examplePipeData = {
  bricks: [
    { name: 'text' },
    { name: 'affine-cipher', settings: { a: 7, b: 7 } },
    { name: 'text' }
  ],
  content: 'The quick brown fox jumps over 13 lazy dogs.',
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
        pipe.getContent(examplePipeData.contentBucket).getString(),
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
})
