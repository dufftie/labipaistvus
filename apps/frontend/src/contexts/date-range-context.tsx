'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import dayjs from 'dayjs';
import type { RangePickerProps } from 'antd/es/date-picker';

const DEFAULT_START_DATE = dayjs('2022-01-01').startOf('day');
const DEFAULT_END_DATE = dayjs().endOf('day');

interface DateRangeContextType {
  requestDateRange: RangePickerProps['value'];
  setRequestDateRange: React.Dispatch<React.SetStateAction<RangePickerProps['value']>>;
  domainDateRange: RangePickerProps['value'];
  setDomainDateRange: React.Dispatch<React.SetStateAction<RangePickerProps['value']>>;
  sliderValue: [number, number];
  setSliderValue: React.Dispatch<React.SetStateAction<[number, number]>>;
  formattedRequestDateRange: string[];
  formattedDomainDateRange: string[];
}

const DateRangeContext = createContext<DateRangeContextType | undefined>(undefined);

export const useDateRange = () => {
  const context = useContext(DateRangeContext);
  if (context === undefined) {
    throw new Error('useDateRange must be used within a DateRangeProvider');
  }
  return context;
};

interface DateRangeProviderProps {
  children: ReactNode;
}

export const DateRangeProvider = ({ children }: DateRangeProviderProps) => {
  const [requestDateRange, setRequestDateRange] = useState<RangePickerProps['value']>([DEFAULT_START_DATE, DEFAULT_END_DATE]);
  const [domainDateRange, setDomainDateRange] = useState<RangePickerProps['value']>(requestDateRange);
  const [sliderValue, setSliderValue] = useState<[number, number]>([0, 100]);

  // Format date ranges for API calls with fallbacks to ensure they're always strings
  const formattedRequestDateRange: string[] = [
    requestDateRange?.[0]?.format('YYYY-MM-DD') || dayjs().subtract(2, 'year').format('YYYY-MM-DD'),
    requestDateRange?.[1]?.format('YYYY-MM-DD') || dayjs().format('YYYY-MM-DD'),
  ];

  const formattedDomainDateRange: string[] = [
    domainDateRange?.[0]?.format('YYYY-MM-DD') || formattedRequestDateRange[0],
    domainDateRange?.[1]?.format('YYYY-MM-DD') || formattedRequestDateRange[1],
  ];

  const value = {
    requestDateRange,
    setRequestDateRange,
    domainDateRange,
    setDomainDateRange,
    sliderValue,
    setSliderValue,
    formattedRequestDateRange,
    formattedDomainDateRange,
  };

  return (
    <DateRangeContext.Provider value={value}>
      {children}
    </DateRangeContext.Provider>
  );
}; 