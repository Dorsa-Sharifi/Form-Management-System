import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface Props {
  data: Record<string, any>[];
  chartType: 'bar' | 'pie';
  groupBy: string[];    
  target: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF6699',
                '#FFB3E6', '#FF6666', '#FFCC99', '#66B3FF', '#99FF99',
                '#FFCC00', '#FF9900', '#CC99FF', '#FF3399', '#66CCFF',
                '#FF9933', '#CCFF33', '#33CCFF', '#33CC99', '#FFCC33'];

const ChartRenderer: React.FC<Props> = ({ data, chartType}) => {
  
  const keyField = data.length > 0 ? Object.keys(data[0])[0] : '';
  const target = data.length > 0 ? Object.keys(data[0])[1] : '';
  if (chartType === 'bar') {
    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
          <XAxis dataKey={keyField} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey={target} name={target}>
            {data.map((_, idx) => (
              <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (chartType === 'pie') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey={target}
            nameKey={keyField}
            outerRadius="60%"
            label
          >
            {data.map((_, idx) => (
              <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  return null;
};

export default ChartRenderer;
