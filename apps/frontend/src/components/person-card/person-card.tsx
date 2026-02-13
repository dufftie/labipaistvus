import React from 'react';
import styles from './person-card.module.scss';

interface PersonCardProps {
  image: string;
  name: string;
  email: string;
  roles: string;
  note: string;
}

const PersonCard: React.FC<PersonCardProps> = ({ image, name, email, roles, note }) => (
  <div className={styles.card}>
    <img src={image} alt={name} className={styles.image} />
    <div className={styles.email}>{email}</div>
    <div className={styles.name}>{name}</div>
    <div className={styles.roles}>{roles}</div>
    <div className={styles.note}>{note}</div>
  </div>
);

export default PersonCard;
