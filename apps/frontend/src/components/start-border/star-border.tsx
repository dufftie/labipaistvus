'use client';

import React from "react";
import styles from './star-button.module.scss';

type StarBorderProps<T extends React.ElementType> =
  React.ComponentPropsWithoutRef<T> & {
    as?: T;
    className?: string;
    children?: React.ReactNode;
    color?: string;
    speed?: React.CSSProperties['animationDuration'];
  }

const StarBorder = <T extends React.ElementType = "button">({
  as,
  className = "",
  color = "white",
  speed = "6s",
  children,
  ...rest
}: StarBorderProps<T>) => {
  const Component = as || "button";

  return (
    <div className={`${styles['star-border-container']} ${className}`} {...rest}>
      <div
        className={styles['border-gradient-bottom']}
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animationDuration: speed,
        }}
      ></div>
      <div
        className={styles['border-gradient-top']}
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animationDuration: speed,
        }}
      ></div>
      <div className={styles['inner-content']}>{children}</div>
    </div>
  );
};

export default StarBorder;
