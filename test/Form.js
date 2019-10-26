
import assert from 'assert'
import { describe, it } from 'mocha'

import FieldFactory from '../src/Factory/Field'
import Form from '../src/Form'

function getExampleFieldSpecs () {
  const fieldSpecs = [
    {
      name: 'includeForeignChars',
      type: 'boolean',
      label: 'Foreign Chars',
      value: false,
      trueLabel: 'Include',
      falseLabel: 'Ignore',
      randomizable: false
    },
    {
      name: 'invisible',
      type: 'enum',
      value: '?',
      elements: ['?', '!'],
      visible: false,
      priority: -10
    },
    {
      name: 'model',
      type: 'enum',
      value: 'I',
      elements: ['I'],
      randomizable: false,
      priority: 100
    }
  ]
  for (let i = 1; i <= 3; i++) {
    fieldSpecs.push({
      name: `rotor${i}`,
      label: `Rotor ${i}`,
      type: 'enum',
      value: 'I',
      elements: ['I', 'II', 'III', 'IV', 'V']
    })
    fieldSpecs.push({
      name: `position${i}`,
      label: `Position ${i}`,
      type: 'number',
      value: 1,
      integer: true,
      min: 1,
      max: 27
    })
  }
  return fieldSpecs
}

/** @test {Form} */
describe('Form', () => {
  /** @test {Form.constructor} */
  describe('initAsync()', () => {
    it('should create a empty form', async () => {
      const form = await new Form().initAsync()
      assert.strictEqual(form.getFields().length, 0)
    })
    it('should create a form with given field specs and field factory', async () => {
      const fieldSpecs = getExampleFieldSpecs()
      const fieldFactory = new FieldFactory()
      const form = await new Form(fieldSpecs, fieldFactory).initAsync()
      assert.strictEqual(form.getFieldFactory(), fieldFactory)
      assert.strictEqual(form.getFields().length, fieldSpecs.length)
    })
  })
  /** @test {Form.addFields} */
  describe('addFields()', () => {
    it('should add given field specs to the form and order fields by priority', async () => {
      const form = await new Form([], new FieldFactory()).initAsync()
      await form.addFields(getExampleFieldSpecs())
      const fields = form.getFields()
      const expectedNameOrder = [
        'model',
        'includeForeignChars',
        'invisible',
        'rotor1',
        'position1',
        'rotor2',
        'position2',
        'rotor3',
        'position3'
      ]
      const expectedPriorities = [100, 0, -10, -11, -12, -13, -14, -15, -16]
      assert.strictEqual(fields.length, expectedNameOrder.length)
      for (let i = 0; i < fields.length; i++) {
        assert.strictEqual(fields[i].getName(), expectedNameOrder[i])
        assert.strictEqual(fields[i].getPriority(), expectedPriorities[i])
      }
    })
  })
  /** @test {Form.getFields} */
  describe('getFields()', () => {
    it('should return a shallow copy of the containing fields', async () => {
      const form = await new Form(getExampleFieldSpecs(), new FieldFactory()).initAsync()
      // Expect strictly the same array elements
      assert.deepStrictEqual(form.getFields(), form.getFields())
      // Expect a shallow copy of the array
      assert.notStrictEqual(form.getFields(), form.getFields())
    })
  })
  /** @test {Form.getInvalidFields} */
  describe('getInvalidFields()', () => {
    it('should return containing fields that are currently invalid', async () => {
      const form = await new Form(getExampleFieldSpecs(), new FieldFactory()).initAsync()
      const modelField = form.getFields()[0]
      // Apply an invalid value to the model field
      modelField.setValue('M3')
      assert.deepStrictEqual(form.getInvalidFields(), [modelField])
    })
  })
  /** @test {Form.getVisibleFields} */
  describe('getVisibleFields()', () => {
    it('should return containing fields that are currently visible', async () => {
      const form = await new Form(getExampleFieldSpecs(), new FieldFactory()).initAsync()
      const visibleFields = form.getFields().filter(field => field.isVisible())
      assert.deepStrictEqual(form.getVisibleFields(), visibleFields)
    })
  })
  /** @test {Form.getField} */
  describe('getField()', () => {
    it('should return a single field instance by given name', async () => {
      const form = await new Form(getExampleFieldSpecs(), new FieldFactory()).initAsync()
      assert.strictEqual(form.getField('model'), form.getFields()[0])
    })
    it('should return null if field name is not assigned to a field', async () => {
      const form = await new Form(getExampleFieldSpecs(), new FieldFactory()).initAsync()
      assert.strictEqual(form.getField('unknown'), null)
    })
  })
  /** @test {Form.getFieldValue} */
  describe('getFieldValue()', () => {
    it('should return the value of any containing field', async () => {
      const form = await new Form(getExampleFieldSpecs(), new FieldFactory()).initAsync()
      const fields = form.getFields()
      for (let i = 0; i < fields.length; i++) {
        const fieldName = fields[i].getName()
        assert.strictEqual(fields[i].getValue(), form.getFieldValue(fieldName))
      }
    })
    it('should throw an exception when the field name is not assigned', async () => {
      const form = await new Form(getExampleFieldSpecs(), new FieldFactory()).initAsync()
      assert.throws(() => {
        form.getFieldValue('unknown')
      }, /^Error: There is no field assigned to the name 'unknown'\./)
    })
  })
  /** @test {Form.setFieldValue} */
  describe('setFieldValue()', () => {
    it('should set the value on any containing field', async () => {
      const form = await new Form(getExampleFieldSpecs(), new FieldFactory()).initAsync()
      form.setFieldValue('position1', 7)
      assert.strictEqual(form.getFieldValue('position1'), 7)
    })
    it('should throw an exception when the field name is not assigned', async () => {
      const form = await new Form(getExampleFieldSpecs(), new FieldFactory()).initAsync()
      assert.throws(() => {
        form.setFieldValue('unknown', 'foo')
      }, /^Error: There is no field assigned to the name 'unknown'\./)
    })
  })
  /** @test {Form.getFieldValues} */
  describe('getFieldValues()', () => {
    it('should return current named values of visible fields', async () => {
      const form = await new Form(getExampleFieldSpecs(), new FieldFactory()).initAsync()
      form.setFieldValue('position1', 7)
      const namedValues = form.getFieldValues()
      const expectedNamedValues = {
        model: 'I',
        includeForeignChars: false,
        rotor1: 'I',
        position1: 7,
        rotor2: 'I',
        position2: 1,
        rotor3: 'I',
        position3: 1
      }
      // Expect specific key-value pairs and key order
      assert.deepStrictEqual(namedValues, expectedNamedValues)
      assert.deepStrictEqual(Object.keys(namedValues), Object.keys(expectedNamedValues))
    })
  })
  /** @test {Form.setFieldValues} */
  describe('setFieldValues()', () => {
    it('should set given named values on any containing fields', async () => {
      const form = await new Form(getExampleFieldSpecs(), new FieldFactory()).initAsync()
      form.setFieldValues({
        position3: 7,
        rotor2: 'III',
        invisible: '!'
      })
      const namedValues = form.getFieldValues()
      const expectedNamedValues = {
        model: 'I',
        includeForeignChars: false,
        rotor1: 'I',
        position1: 1,
        rotor2: 'III',
        position2: 1,
        rotor3: 'I',
        position3: 7
      }
      // Expect specific key-value pairs and key order
      assert.deepStrictEqual(namedValues, expectedNamedValues)
      assert.strictEqual(form.getFieldValue('invisible'), '!')
      assert.deepStrictEqual(Object.keys(namedValues), Object.keys(expectedNamedValues))
    })
    it('should throw an exception when one of the field names is not assigned', async () => {
      const form = await new Form(getExampleFieldSpecs(), new FieldFactory()).initAsync()
      assert.throws(() => {
        form.setFieldValues({
          position3: 7,
          rotor2: 'III',
          unknown: 'foo',
          invisible: '!'
        })
      }, /^Error: There is no field assigned to the name 'unknown'\./)
    })
  })
  /** @test {Form.getFieldFactory} */
  describe('getFieldFactory()', () => {
    it('should return the field factory previously set', async () => {
      const fieldFactory = new FieldFactory()
      const form = await new Form().initAsync()
      form.setFieldFactory(fieldFactory)
      assert.strictEqual(form.getFieldFactory(), fieldFactory)
    })
    it('should lazily retrieve the shared field factory instance', async () => {
      const form = await new Form().initAsync()
      assert.strictEqual(form.getFieldFactory(), FieldFactory.getInstance())
    })
  })
  /** @test {Form.isValid} */
  describe('isValid()', () => {
    it('should return true when all containing fields are valid', async () => {
      const form = await new Form(getExampleFieldSpecs(), new FieldFactory()).initAsync()
      assert.strictEqual(form.isValid(), true)
      // Apply invalid value on model field
      form.setFieldValue('model', 'M3')
      assert.strictEqual(form.isValid(), false)
    })
  })
  /** @test {Form.randomize} */
  describe('randomize()', () => {
    it('should randomize containing fields that are visible and randomizable', async () => {
      const form = await new Form(getExampleFieldSpecs(), new FieldFactory()).initAsync()
      form.randomize()
    })
  })
})
