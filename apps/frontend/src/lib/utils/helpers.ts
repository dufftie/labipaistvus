import dayjs from 'dayjs';

export const formatDate = (date: string, format: string = 'DD.MM.YYYY, HH:mm:ss') => {
  if (!date) return null;
  return dayjs(date).format(format);
};
