
import React from 'react'
import Field from '../Field'
import InputText from '../InputText'

export default function FieldText(props: any): any {
  return (
    <Field {...props}>
      <InputText
        value={props.value}
        onChange={props.onChange}
        markedValue={props.markedValue} />
    </Field>
  )
}
