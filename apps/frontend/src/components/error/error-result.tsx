import { Result } from 'antd';

export interface ErrorResultProps {
  status: '404' | 'error';
  title: string;
  subTitle: string;
}

export default function ErrorResult({ status, title, subTitle }: ErrorResultProps) {
  return <Result status={status} title={title} subTitle={subTitle} />;
}
