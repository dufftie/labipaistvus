import classNames from 'classnames';
import Hint from '../hint';
import styles from './card.module.scss';

interface CardProps {
  label?: string;
  children: JSX.Element;
  primary?: boolean;
  borderless?: boolean;
  hint?: string;
  className?: string;
}

export default function Card({ label, children, primary, borderless, hint, className }: CardProps) {
  return (
    <div className={classNames(styles.card, className, {
      [styles.primary]: primary,
      [styles.borderless]: borderless,
    })}>
      <div className={styles.header}>
        {label && <div className={styles.label}>{label}</div>}
        {hint && <Hint content={hint} />}
      </div>
      {children}
    </div>
  );
}
