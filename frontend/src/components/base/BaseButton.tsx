import "./BaseButton.css";
import { HTMLProps, JSX, useState, type PropsWithChildren } from "react";
import classNames from "classnames";

type Props = HTMLProps<HTMLButtonElement> &
  PropsWithChildren<{
    loading?: boolean;
  }>;
function BaseButton({
  style,
  className,
  type,
  children,
  loading,
}: Props): JSX.Element {
  const classes = classNames("base-button", className, {
    loading: loading,
  });

  return (
    <button type={type} style={style} className={classes}>
      {children}
    </button>
  );
}

export default BaseButton;
