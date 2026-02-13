'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList, Cell } from 'recharts';
import BaseGraph from '@/src/components/graphs/base-graph';
import useIsMobile from '@/src/lib/hooks/isMobile';
import { useDateRange } from '@/src/contexts/date-range-context';

interface SimpleBarChartProps {
  media_id: string;
}

const buildUrl = ({
  media_id,
  startDate,
  endDate,
}: {
  media_id: string;
  startDate: string;
  endDate: string;
}) => {
  const params = new URLSearchParams();
  if (media_id) params.append('media_id', media_id);
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);

  return `sentiments/summary/?${params.toString()}`;
};

// Color interpolation function
const interpolateColor = (value: number, totalValues: number) => {
  // Convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const negativeColor = hexToRgb('#EA5753')!;
  const neutralColor = hexToRgb('#D9D9D9')!;
  const positiveColor = hexToRgb('#8FCC7E')!;

  // Calculate percentage position
  const percentage = (value / (totalValues - 1)) * 100;

  // Interpolate between colors based on percentage position
  if (percentage <= 40) {
    // Interpolate between negative and neutral (0% to 40%)
    const t = percentage / 40;
    return `rgb(${
      Math.round(negativeColor.r + (neutralColor.r - negativeColor.r) * t)
    }, ${
      Math.round(negativeColor.g + (neutralColor.g - negativeColor.g) * t)
    }, ${
      Math.round(negativeColor.b + (neutralColor.b - negativeColor.b) * t)
    })`;
  } else if (percentage >= 60) {
    // Interpolate between neutral and positive (60% to 100%)
    const t = (percentage - 60) / 40;
    return `rgb(${
      Math.round(neutralColor.r + (positiveColor.r - neutralColor.r) * t)
    }, ${
      Math.round(neutralColor.g + (positiveColor.g - neutralColor.g) * t)
    }, ${
      Math.round(neutralColor.b + (positiveColor.b - neutralColor.b) * t)
    })`;
  } else {
    // Use neutral color for the middle range (40% to 60%)
    return '#D9D9D9';
  }
};

const SimpleBarChart = ({ media_id }: SimpleBarChartProps) => {
  const isMobile = useIsMobile();
  const { formattedRequestDateRange } = useDateRange();
  const [startDate, endDate] = formattedRequestDateRange;
  const fetchUrl = buildUrl({ media_id, startDate, endDate });

  // Process the data for bar chart
  const processData = (data: any) => {
    // Create an array with all possible values from 0 to 10
    const allValues = Array.from({ length: 11 }, (_, i) => i.toString());
    
    // Map the data to include all values, defaulting to 0 for missing ones
    return allValues.map(key => ({
      key,
      value: Number(data[key] || 0)
    }));
  };

  return (
    <BaseGraph fetchUrl={fetchUrl} processData={processData}>
      {(data) => {
        return (
          <BarChart
            data={data}
            layout={isMobile ? 'vertical' : 'horizontal'}
            className="simple-bar-chart__wrapper"
          >
            <CartesianGrid strokeDasharray="3 3" vertical={isMobile} horizontal={!isMobile} />

            <Bar
              dataKey="value"
              fill="#EBEBEB"
              minPointSize={30}
              opacity={0.8}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={interpolateColor(index, data.length)} />
              ))}
              <LabelList
                dataKey="value"
                position="insideTop"
                offset={10}
                style={{
                  fill: '#000000',
                  fontSize: 12,
                  fontWeight: 'bold',
                }}
              />
            </Bar>

            {isMobile ? (
              <YAxis
                dataKey="key"
                type="category"
                axisLine={false}
                tickLine={false}
                width={80}
                fontSize={10}
                textAnchor='end'
                orientation='right'
                mirror
              />
            ) : (
              <XAxis
                dataKey="key"
                axisLine={false}
                tickLine={false}
                interval={0}
                fontSize={10}
                domain={[0, 10]}
              />
            )}

            {isMobile ? (
              <XAxis
                type="number"
                axisLine={false}
                tickLine={false}
                tickCount={6}
                fontSize={10}
                domain={[0, 10]}
              />
            ) : (
              <YAxis
                type="number"
                axisLine={false}
                tickLine={false}
                width={30}
                fontSize={10}
                domain={[0, 10]}
                scale='linear'
              />
            )}
          </BarChart>
        );
      }}
    </BaseGraph>
  );
};

export default SimpleBarChart; 