
import React, { useRef, useEffect, useCallback } from 'react'
import Viewable from '../Viewable'

export default function InputText(props: any): any {
  // Reference to the textarea element
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  let className = 'input-text'
  let value = props.value || ''

  const multiline = props.multiline === true
  if (!multiline) {
    // Remove newlines from value
    value = value.replace(/\r?\n|\r/g, '')
  } else {
    // Add multiline modifier
    className += ' input-text--multiline'
  }

  if (props.monospaceFont !== false) {
    className += ' input-text--monospace'
  }

  // Function defining how to autoresize the textarea
  const autoresizeTextarea = useCallback(() => {
    if (textareaRef.current !== null) {
      // Autoresize textarea
      const $textarea = textareaRef.current
      $textarea.style.height = ''
      $textarea.style.height = `${$textarea.scrollHeight}px`
    }
  }, [])

  // Autoresize if value changes
  useEffect(autoresizeTextarea, [value, multiline])

  // Autoresize on window resize (the field dimensions might change)
  useEffect(() => {
    if (multiline) {
      window.addEventListener('resize', autoresizeTextarea)
      return () => {
        // TODO: Test if this works
        window.removeEventListener('resize', autoresizeTextarea)
      }
    }
  }, [multiline])

  return (
    <div className={className}>
      {props.markedValue && (
        <div className="input-text__overlay">
          <Viewable instance={props.markedValue} />
        </div>
      )}
      <textarea
        className="input-text__textarea"
        ref={textareaRef}
        value={value}
        placeholder={props.placeholder}
        onChange={event => {
          // Remove newline characters
          let value = event.target.value
          if (!multiline) {
            value = value.replace(/\r?\n|\r/g, '')
          }
          props.onChange(value, event)
        }}
        onKeyDown={event => {
          // Disable new line key in non-multiline field
          if (event.keyCode === 13 && !multiline) {
            event.preventDefault()
          }
        }}
        spellCheck={false}
        rows={1} />
    </div>
  )
}
