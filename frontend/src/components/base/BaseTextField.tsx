import {
  JSX,
  HTMLProps,
  type BaseSyntheticEvent,
  ChangeEvent,
  useRef,
  useEffect,
} from "react";
import "./BaseTextField.css";
import classNames from "classnames";

type Props = HTMLProps<HTMLDivElement> & {
  label?: string;
  placeholder?: string;
  name: string;
  value: string;
  immediateFocus?: boolean;
  loading?: boolean;
  size?: Size;
  square?: boolean;
  onInput?: (
    e: BaseSyntheticEvent<InputEvent, HTMLInputElement, HTMLInputElement>
  ) => void;
  onChange?: (
    e: BaseSyntheticEvent<ChangeEvent, HTMLInputElement, HTMLInputElement>
  ) => void;
  onFocus?: (
    e: BaseSyntheticEvent<FocusEvent, HTMLInputElement, HTMLInputElement>
  ) => void;
  onBlur?: (
    e: BaseSyntheticEvent<FocusEvent, HTMLInputElement, HTMLInputElement>
  ) => void;
};

type Size = "small" | "default" | "large";

function BaseTextField({
  className,
  style,
  label,
  placeholder,
  name,
  id,
  value,
  square,
  size = "default" as Size,
  loading,
  required,
  immediateFocus,

  onBlur,
  onFocus,
  onInput,
  onChange,
}: Props): JSX.Element {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const classes = classNames("text-field", className, {
    small: size && size === "small",
    large: size && size === "large",
    loading: loading,
    square: square,
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
      {label && <label htmlFor={id}>{label}</label>}
      <input
        ref={inputRef}
        type="text"
        name={name}
        id={id}
        value={value}
        placeholder={placeholder}
        required={required}
        aria-required={required}
        disabled={loading}
        onInput={onInput}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
      />
    </div>
  );
}

export default BaseTextField;
