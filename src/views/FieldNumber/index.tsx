
import React from 'react'
import Field from '../Field'
import InputNumber from '../InputNumber'

export default function FieldNumber(props: any): any {
  return (
    <Field {...props}>
      <InputNumber
        value={props.value}
        onChange={props.onChange}
        onStepDownClick={props.onStepDownClick}
        onStepUpClick={props.onStepUpClick} />
    </Field>
  )
}
