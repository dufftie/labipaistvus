import { Radio } from 'antd';
import partiesList from '@/lib/dictionaries/partiesList';
import styles from './party-select.module.scss';

interface PartySelectProps {
  value?: string;
  onChange?: (value: string) => void;
}

export default function PartySelect({ value, onChange }: PartySelectProps) {
  return (
    <Radio.Group
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      rootClassName={styles.select}
      size='large'
    >
      {partiesList.map((party) => (
        <Radio.Button key={party.value} value={party.value}>
          {party.label}
        </Radio.Button>
      ))}
    </Radio.Group>
  );
}
