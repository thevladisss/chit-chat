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
import "./BaseTextField.css";
import classNames from "classnames";

type Props = HTMLProps<HTMLDivElement> & {
  label: string;
  placeholder?: string;
  name: string;
  value: string;
  immediateFocus?: boolean;
  loading?: boolean;
  size?: "small" | "default" | "large";
  square?: boolean;
  onInput?: (
    e: BaseSyntheticEvent<InputEvent, HTMLInputElement, HTMLInputElement>,
  ) => void;
  onChange?: (e: any) => void; //TODO: Fix typing
};
function BaseTextField({
  className,
  style,
  label,
  placeholder,
  name,
  id,
  value,
  square,
  size = "default",
  loading,

  required,

  immediateFocus,
  onInput,
  onChange,
}: Props): JSX.Element {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const classes = classNames("text-field", className, {
    "text-field--default": size && size === "default",
    "text-field--small": size && size === "small",
    "text-field--large": size && size === "large",
    "text-field--loading": loading,
    "text-field--square": square,
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
      {loading && <span className="spinner" />}
      <label htmlFor={id}>{label}</label>
      <input
        ref={inputRef}
        type="text"
        name={name}
        id={id}
        value={value}
        placeholder={placeholder}
        required={required}
        aria-required={required}
        onInput={onInput}
        onChange={onChange}
        disabled={loading}
      />
    </div>
  );
}

export default BaseTextField;
