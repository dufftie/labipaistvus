import { QuestionCircleOutlined } from '@ant-design/icons';
import { Popover } from 'antd';
import React from 'react';
import { PopoverProps } from 'antd/lib';
import styles from './hint.module.scss';

export default function Hint(props: PopoverProps) {
  return (
    <Popover className={styles.hint} classNames={{ root: styles.hint }} trigger="click" {...props}>
      <QuestionCircleOutlined />
    </Popover>
  );
}
