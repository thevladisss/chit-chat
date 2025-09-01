import "./BaseButton.css";
import { HTMLProps, JSX, type PropsWithChildren } from "react";
import classNames from "classnames";

type Props = HTMLProps<HTMLButtonElement> &
  PropsWithChildren<{
    loading?: boolean;
    icon?: JSX.Element;
  }>;
function BaseButton({
  style,
  className,
  type,
  children,
  icon,
  loading,

  onClick,
}: Props): JSX.Element {
  const classes = classNames("base-button", className, {
    loading: loading,
    icon: Boolean(icon),
  });

  return (
    <button
      type={type}
      style={style}
      className={classes}
      disabled={loading}
      onClick={onClick}
    >
      {icon ? icon : children}
    </button>
  );
}

export default BaseButton;
