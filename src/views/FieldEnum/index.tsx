
import React from 'react'
import Field from '../Field'
import InputSelect from '../InputSelect'

export default function FieldEnum(props: any): any {
  // TODO: Radio button appeareance
  return (
    <Field {...props}>
      <InputSelect
        values={props.labels.map((label: string, index: number) => index)}
        labels={props.labels}
        value={props.index}
        onChange={props.onChange} />
    </Field>
  )
}
