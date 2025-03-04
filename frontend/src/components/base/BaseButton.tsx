import "./BaseButton.css"
import {HTMLProps, JSX, useState, type PropsWithChildren} from 'react'
import {buildClasses} from "../../utils/classes.ts";

type Props =  HTMLProps<HTMLButtonElement> & PropsWithChildren<{

}>
function BaseButton({
  style,
  className,
  type,
  children
}: Props): JSX.Element {

  const classes = buildClasses('base-button', className ?? "");

  return (
    <button type={type} style={style} className={classes}>
      {children}
    </button>
  )
}


export default BaseButton
