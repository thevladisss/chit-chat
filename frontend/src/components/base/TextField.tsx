import {
  useState,
  JSX,
  HTMLProps,
  type BaseSyntheticEvent,
  type ChangeEventHandler,
  SyntheticEvent,
  ChangeEvent,
  useRef,
  useEffect,
} from "react";
import "./TextField.css";
import { buildClasses } from "../../utils/classes.ts";

type Props = HTMLProps<HTMLDivElement> & {
  label: string;
  placeholder?: string;
  name: string;
  value: string;
  immediateFocus?: boolean;
  size?: "small" | "default" | "large";
  onInput?: (
    e: BaseSyntheticEvent<InputEvent, HTMLInputElement, HTMLInputElement>,
  ) => void;
  onChange?: (e: any) => void; //TODO: Fix typing
};
function TextField({
  className,
  style,
  label,
  placeholder,
  name,
  id,
  value,
  size = "default",

  required,

  immediateFocus,
  onInput,
  onChange,
}: Props): JSX.Element {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const classes = buildClasses("text-field", className ?? "", {
    "text-field--default": size && size === "default",
    "text-field--small": size && size === "small",
    "text-field--large": size && size === "large",
  });

  const setFocus = () => {
    if (inputRef.current) inputRef.current.focus();
  };

  useEffect(() => {
    if (immediateFocus && inputRef.current instanceof HTMLInputElement) {
      setFocus();
    }
  }, []);

  return (
    <div className={classes} style={style}>
      <label htmlFor={id}>{label}</label>
      <input
        ref={inputRef}
        type="text"
        name={name}
        id={id}
        placeholder={placeholder}
        required={required}
        aria-required={required}
        onInput={onInput}
        onChange={onChange}
      />
    </div>
  );
}

export default TextField;
