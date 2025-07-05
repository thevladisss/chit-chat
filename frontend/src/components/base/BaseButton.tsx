import "./BaseButton.css";
import { HTMLProps, JSX, useState, type PropsWithChildren } from "react";
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
}: Props): JSX.Element {
  const classes = classNames("base-button", className, {
    loading: loading,
    icon: Boolean(icon),
  });

  return (
    <button type={type} style={style} className={classes} disabled={loading}>
      {icon ? icon : children}
    </button>
  );
}

export default BaseButton;
