
import assert from 'assert'
import { describe, it } from 'mocha'

import EnvUtil from '../src/EnvUtil'

/** @test {EnvUtil} */
describe('EnvUtil', () => {
  /** @test {EnvUtil.matchVersion} */
  describe('matchVersion()', () => {
    it('should not match 1.2.3 < 1.2.3', () => {
      assert.strictEqual(EnvUtil.matchVersion('1.2.3', '<', '1.2.3'), false)
    })
    it('should match 1.2.3 <= 1.2.3', () => {
      assert.strictEqual(EnvUtil.matchVersion('1.2.3', '<=', '1.2.3'), true)
    })
    it('should match 1.2.3 = 1.2.3', () => {
      assert.strictEqual(EnvUtil.matchVersion('1.2.3', '=', '1.2.3'), true)
    })
    it('should match 1.2.3 >= 1.2.3', () => {
      assert.strictEqual(EnvUtil.matchVersion('1.2.3', '>=', '1.2.3'), true)
    })
    it('should not match 1.2.3 > 1.2.3', () => {
      assert.strictEqual(EnvUtil.matchVersion('1.2.3', '>', '1.2.3'), false)
    })
    it('should match 1.2.2 < 1.2.3', () => {
      assert.strictEqual(EnvUtil.matchVersion('1.2.2', '<', '1.2.3'), true)
    })
    it('should match 1.2.2 <= 1.2.3', () => {
      assert.strictEqual(EnvUtil.matchVersion('1.2.2', '<=', '1.2.3'), true)
    })
    it('should not match 1.2.2 = 1.2.3', () => {
      assert.strictEqual(EnvUtil.matchVersion('1.2.2', '=', '1.2.3'), false)
    })
    it('should not match 1.2.2 >= 1.2.3', () => {
      assert.strictEqual(EnvUtil.matchVersion('1.2.2', '>=', '1.2.3'), false)
    })
    it('should not match 1.2.2 > 1.2.3', () => {
      assert.strictEqual(EnvUtil.matchVersion('1.2.2', '>', '1.2.3'), false)
    })
    it('should not match 1.2.3 < 1.2', () => {
      assert.strictEqual(EnvUtil.matchVersion('1.2.3', '<', '1.2'), false)
    })
    it('should not match 1.2.3 <= 1.2', () => {
      assert.strictEqual(EnvUtil.matchVersion('1.2.3', '<=', '1.2'), false)
    })
    it('should not match 1.2.3 = 1.2', () => {
      assert.strictEqual(EnvUtil.matchVersion('1.2.3', '=', '1.2'), false)
    })
    it('should match 1.2.3 >= 1.2', () => {
      assert.strictEqual(EnvUtil.matchVersion('1.2.3', '>=', '1.2'), true)
    })
    it('should match 1.2.3 > 1.2', () => {
      assert.strictEqual(EnvUtil.matchVersion('1.2.3', '>', '1.2'), true)
    })
  })
})
