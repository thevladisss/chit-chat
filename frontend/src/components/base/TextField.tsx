import {
  useState,
  JSX,
  HTMLProps,
  type BaseSyntheticEvent,
  type ChangeEventHandler,
  SyntheticEvent,
  ChangeEvent
} from 'react'
import "./TextField.css"
import {buildClasses} from "../../utils/classes.ts";

type Props =  HTMLProps<HTMLDivElement> & {
  label: string;
  placeholder?: string;
  name: string
  value: string
  onInput?: (e: BaseSyntheticEvent<InputEvent, HTMLInputElement, HTMLInputElement>) => void;
  onChange?: (e: any) => void; //TODO: Fix typing
}
function TextField({
  className,
  style,
  label,
  placeholder,
  name,
  id,
  value,
  onInput,
  onChange
}: Props): JSX.Element {

  const classes = buildClasses('text-field', className ?? '')

  return (
    <div className={classes} style={style}>
      <label htmlFor={id}>
        { label }
      </label>
      <input
        type="text"
        name={name}
        id={id}
        placeholder={placeholder}
        onInput={onInput}
        onChange={onChange}
      />
    </div>
  )
}


export default TextField
