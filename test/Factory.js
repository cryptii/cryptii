import assert from 'assert'
import { describe, it } from 'mocha'

import Factory from '../src/Factory.js'

class Cat {
  constructor (name = null, age = null) {
    this.name = name
    this.age = age
  }
}

class Dog {}

/** @test {Factory} */
describe('Factory', () => {
  /** @test {Factory.register} */
  describe('register()', () => {
    it('should register given invokable to given identifier', () => {
      const factory = new Factory()
      factory.register('cat', Cat)
      assert.strictEqual(factory._identifiers[0], 'cat')
      assert.strictEqual(factory._invokables[0], Cat)
      factory.register('dog', Dog)
      assert.strictEqual(factory._identifiers[1], 'dog')
      assert.strictEqual(factory._invokables[1], Dog)
    })
    it('should throw an error if an invokable is registered to an existing identifier', () => {
      const factory = new Factory()
      factory.register('cat', Cat)
      assert.throws(() => { factory.register('cat', Dog) }, Error)
    })
  })
  /** @test {Factory.exists} */
  describe('exists()', () => {
    it('should return wether an identifier exists', () => {
      const factory = new Factory()
      factory.register('cat', Cat)
      assert.strictEqual(factory.exists('cat'), true)
      assert.strictEqual(factory.exists('dog'), false)
    })
  })
  /** @test {Factory.create} */
  describe('create()', () => {
    it('should throw an error if requested identifier does not exist', () => {
      const factory = new Factory()
      assert.throws(() => { factory.create('cat') }, Error)
    })
    it('should create an object using a registered invokable', () => {
      const factory = new Factory()
      factory.register('cat', Cat)
      const cat = factory.create('cat')
      assert.strictEqual(cat instanceof Cat, true)
    })
    it('should inject given args into object constructor', () => {
      const factory = new Factory()
      factory.register('cat', Cat)
      const cat = factory.create('cat', 'Lilo', 7)
      assert.strictEqual(cat instanceof Cat, true)
      assert.strictEqual(cat.name, 'Lilo')
      assert.strictEqual(cat.age, 7)
    })
  })
})
