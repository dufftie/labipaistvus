import styles from './support-button.module.scss';
import StarBorder from '@/components/start-border';

export default function SupportButton() {
  return (
    <a href="/support">
      <StarBorder as="button" color="var(--color-red)" speed="5s" className={styles.button}>
        Support
      </StarBorder>
    </a>
  );
}
