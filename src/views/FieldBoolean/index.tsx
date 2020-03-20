
import React from 'react'
import Field from '../Field'
import InputSwitch from '../InputSwitch'

export default function FieldBoolean(props: any): any {
  return (
    <Field {...props}>
      <InputSwitch
        trueLabel={props.trueLabel}
        falseLabel={props.falseLabel}
        value={props.value}
        onChange={props.onChange} />
    </Field>
  )
}
