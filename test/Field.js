import assert from 'assert'
import { describe, it } from 'mocha'

import Field from '../src/Field.js'
import Chain from '../src/Chain.js'

/** @test {Field} */
describe('Field', () => {
  /** @test {Field.constructor} */
  describe('constructor()', () => {
    it('should create a generic field with given name and using default specs', () => {
      const field = new Field('fieldName')
      assert.strictEqual(field.getName(), 'fieldName')
      assert.strictEqual(field.getValue(), null)
      assert.strictEqual(field.getDelegate(), null)
      assert.strictEqual(field.getLabel(), 'Field Name')
      assert.strictEqual(field.isVisible(), true)
      assert.strictEqual(field.getPriority(), 0)
      assert.strictEqual(field.getWidth(), 12)
      assert.strictEqual(field.isValid(), true)
      assert.strictEqual(field.getMessage(), null)
      assert.strictEqual(field.getMessageKey(), null)
      assert.strictEqual(field.isRandomizable(), true)
      assert.strictEqual(field.hasView(), false)
    })
    it('should create a generic field with given name and specs', () => {
      const delegate = {}
      const field = new Field('fieldName', {
        value: 'test',
        delegate,
        label: 'Hello World',
        visible: false,
        priority: 7,
        width: 6,
        randomizable: false
      })
      assert.strictEqual(field.getName(), 'fieldName')
      assert.strictEqual(field.getValue(), 'test')
      assert.strictEqual(field.getDelegate(), delegate)
      assert.strictEqual(field.getLabel(), 'Hello World')
      assert.strictEqual(field.isVisible(), false)
      assert.strictEqual(field.getPriority(), 7)
      assert.strictEqual(field.getWidth(), 6)
      assert.strictEqual(field.isValid(), true)
      assert.strictEqual(field.getMessage(), null)
      assert.strictEqual(field.getMessageKey(), null)
      assert.strictEqual(field.isRandomizable(), false)
      assert.strictEqual(field.hasView(), false)
    })
  })
  /** @test {Field.setVisible} */
  describe('setVisible()', () => {
    it('should update the field visibility and call the delegate', () => {
      let layoutRequest = false
      const delegate = { fieldNeedsLayout: () => { layoutRequest = true } }
      const field = new Field('field', { delegate })
      field.setVisible(false)
      assert.strictEqual(field.isVisible(), false)
      assert.strictEqual(layoutRequest, true)
    })
  })
  /** @test {Field.setPriority} */
  describe('setPriority()', () => {
    it('should update the field priority and call the delegate', () => {
      let layoutRequest = false
      let priorityChange = false
      const delegate = {
        fieldNeedsLayout: () => { layoutRequest = true },
        fieldPriorityDidChange: () => { priorityChange = true }
      }
      const field = new Field('field', { delegate })
      field.setPriority(7)
      assert.strictEqual(field.getPriority(), 7)
      assert.strictEqual(layoutRequest, true)
      assert.strictEqual(priorityChange, true)
    })
  })
  /** @test {Field.setWidth} */
  describe('setWidth()', () => {
    it('should update the field width and call the delegate', () => {
      let layoutRequest = false
      const delegate = { fieldNeedsLayout: () => { layoutRequest = true } }
      const field = new Field('field', { delegate })
      field.setWidth(6)
      assert.strictEqual(field.getWidth(), 6)
      assert.strictEqual(layoutRequest, true)
    })
  })
  /** @test {Field.setDelegate} */
  describe('setDelegate()', () => {
    it('should update the field delegate', () => {
      const delegate = {}
      const field = new Field('field')
      field.setDelegate(delegate)
      assert.strictEqual(field.getDelegate(), delegate)
    })
  })
  /** @test {Field.setValue} */
  describe('setValue()', () => {
    it('should not call the delegate if the value is not changing', () => {
      let valueChange = false
      const delegate = { fieldValueDidChange: () => { valueChange = true } }
      const field = new Field('field', { delegate, value: 7 })
      field.setValue(7)
      assert.strictEqual(field.getValue(), 7)
      assert.strictEqual(valueChange, false)
    })
    it('should not call the delegate if the Chain value is not changing', () => {
      let valueChange = false
      const delegate = { fieldValueDidChange: () => { valueChange = true } }
      const field = new Field('field', { delegate, value: new Chain('foo') })
      field.setValue(new Chain('foo'))
      assert.strictEqual(field.getValue().isEqualTo(new Chain('foo')), true)
      assert.strictEqual(valueChange, false)
    })
    it('should update the value and call the delegate', () => {
      let valueChange = false
      const delegate = { fieldValueDidChange: () => { valueChange = true } }
      const field = new Field('field', { delegate, value: 4 })
      field.setValue(7)
      assert.strictEqual(field.getValue(), 7)
      assert.strictEqual(valueChange, true)
    })
    it('should validate and filter given value', () => {
      let valueValidate = false
      let valueFilter = false
      const field = new Field('field', {
        validateValue: rawValue => {
          valueValidate = true
          return true
        },
        filterValue: rawValue => {
          valueFilter = true
          return rawValue + 1
        },
        value: 4
      })
      field.setValue(7)
      assert.strictEqual(field.getValue(), 8)
      assert.strictEqual(valueValidate, true)
      assert.strictEqual(valueFilter, true)
    })
    it('should not filter or call the delegate when receiving an invalid value', () => {
      let valueChange = false
      let valueFilter = false
      const delegate = { fieldValueDidChange: () => { valueChange = true } }
      const field = new Field('field', {
        delegate,
        validateValue: rawValue => ({
          message: 'Message content',
          key: 'messageId'
        }),
        filterValue: rawValue => {
          valueFilter = true
          return rawValue + 1
        },
        value: 4
      })
      field.setValue(7)
      assert.strictEqual(field.getValue(), 7)
      assert.strictEqual(field.getMessage(), 'Message content')
      assert.strictEqual(field.getMessageKey(), 'messageId')
      assert.strictEqual(valueFilter, false)
      assert.strictEqual(valueChange, false)
    })
  })
  /** @test {Field.randomize} */
  describe('randomize()', () => {
    it('should call the randomize function', () => {
      let randomizeValueCalls = 0
      const field = new Field('field', {
        value: 4,
        randomizeValue: () => {
          randomizeValueCalls++
          return 7
        }
      })
      assert.strictEqual(field.randomizeValue(), 7)
      assert.strictEqual(field.getValue(), 4)
      field.randomize()
      assert.strictEqual(field.getValue(), 7)
      assert.strictEqual(randomizeValueCalls, 2)
    })
  })
  /** @test {Field.serializeValue} */
  describe('serializeValue()', () => {
    it('should serialize boolean values', () => {
      const value = true
      const field = new Field('field', { value })
      assert.strictEqual(field.serializeValue(), value)
    })
    it('should serialize string values', () => {
      const value = 'Hello World'
      const field = new Field('field', { value })
      assert.strictEqual(field.serializeValue(), value)
    })
    it('should serialize number values', () => {
      const value = 7
      const field = new Field('field', { value })
      assert.strictEqual(field.serializeValue(), value)
    })
    it('should throw when serializing object values', () => {
      const value = { foo: 'bar' }
      const field = new Field('field', { value })
      assert.throws(() => { field.serializeValue() }, Error)
    })
  })
})
