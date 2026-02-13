'use client';

import { DatePicker, Slider } from 'antd';
import Card from '@/src/components/card';
import { useEffect } from 'react';
import dayjs from 'dayjs';
import type { RangePickerProps } from 'antd/es/date-picker';
import { useDateRange } from '@/src/contexts/date-range-context';
import styles from './range-date-select.module.scss';

const { RangePicker } = DatePicker;

const DEFAULT_START_DATE = dayjs('2022-01-01').startOf('day');
const DEFAULT_END_DATE = dayjs().endOf('day');

interface RangeDateSelectProps {
  value: [dayjs.Dayjs, dayjs.Dayjs];
  onChange: (value: [dayjs.Dayjs, dayjs.Dayjs]) => void;
  minDate: dayjs.Dayjs;
  maxDate: dayjs.Dayjs;
}

export const RangeDateSelect = ({ value, onChange, minDate, maxDate }: RangeDateSelectProps) => {
  const handleDateChange: RangePickerProps['onChange'] = dates => {
    if (dates && dates[0] && dates[1]) {
      onChange([dates[0], dates[1]]);
    }
  };

  const handleSliderChange = (value: number) => {
    const startDate = minDate.add(value, 'day');
    const endDate = startDate.add(6, 'day');
    onChange([startDate, endDate]);
  };

  const sliderValue = value[0].diff(minDate, 'day');

  return (
    <div className={styles.select}>
      <div className={styles.content}>
        <div className={styles.datePicker}>
          <DatePicker.RangePicker
            value={value}
            onChange={handleDateChange}
            minDate={minDate}
            maxDate={maxDate}
          />
        </div>
        <div className={styles.slider}>
          <div className={styles.label}>Date Range</div>
          <Slider
            min={0}
            max={maxDate.diff(minDate, 'day') - 6}
            value={sliderValue}
            onChange={handleSliderChange}
          />
          <div className={styles.secondaryRange}>
            {value[0].format('YYYY-MM-DD')} - {value[1].format('YYYY-MM-DD')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function RangeDateSelectCard() {
  const {
    requestDateRange,
    setRequestDateRange,
    setDomainDateRange,
    sliderValue,
    setSliderValue,
  } = useDateRange();

  useEffect(() => {
    // If request date range was changed, reset domain date range to match
    setDomainDateRange([requestDateRange![0], requestDateRange![1]]);
  }, [requestDateRange, setDomainDateRange]);

  const handleDateRangeChange = (dates: RangePickerProps['value']) => {
    setRequestDateRange(dates);
  };

  const handleSliderChange = (value: number[]) => {
    const rangeValue = value;
    setSliderValue([rangeValue[0], rangeValue[1]]);

    const start = requestDateRange![0];
    const end = requestDateRange![1];
    const totalDuration = end!.diff(start, 'day');

    const startDuration = Math.floor((rangeValue[0] / 100) * totalDuration);
    const endDuration = Math.floor((rangeValue[1] / 100) * totalDuration);

    const newStartDate = start!.add(startDuration, 'day');
    const newEndDate = start!.add(endDuration, 'day');

    setDomainDateRange([newStartDate, newEndDate]);
  };

  // Format tooltip to show dates instead of percentages
  const formatTooltip = (value?: number) => {
    if (!value || !requestDateRange || !requestDateRange[0]) return value;

    const start = requestDateRange[0];
    const end = requestDateRange[1];
    const totalDuration = end!.diff(start, 'day');
    const duration = Math.floor((value / 100) * totalDuration);
    const date = start!.add(duration, 'day');

    return date.format('YYYY-MM-DD');
  };

  return (
    <Card className={styles.select}>
      <div className={styles.content}>
        <div className={styles.datePicker}>
          <RangePicker
            picker="month"
            allowClear={false}
            value={requestDateRange}
            onChange={handleDateRangeChange}
            disabledDate={current => {
              return current && (current < DEFAULT_START_DATE || current > DEFAULT_END_DATE);
            }}
            allowEmpty={false}
          />
        </div>

        <div className={styles.slider}>
          <Slider
            range
            value={sliderValue}
            onChange={handleSliderChange}
            min={0}
            max={100}
            step={1}
            tooltip={{ formatter: formatTooltip }}
          />
        </div>
      </div>
    </Card>
  );
} 