import React from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend,
  Label
} from 'recharts';
import { FiPieChart } from 'react-icons/fi';

const VersionPieChart = ({ data }) => {
  // Process data to count versions and calculate percentages
  const versionCounts = data.reduce((acc, item) => {
    acc[item.u_version] = (acc[item.u_version] || 0) + 1;
    return acc;
  }, {});

  const totalProducts = data.length;
  const chartData = Object.entries(versionCounts)
    .map(([name, value]) => ({
      name: `v${name}`,
      value,
      percent: (value / totalProducts * 100).toFixed(1)
    }))
    .sort((a, b) => b.value - a.value); // Sort by count descending

  const COLORS = ['#0098C2', '#8DC9DD', '#006B8F', '#5AB4D4', '#003D5A'];
  const RADIAN = Math.PI / 180;

  // Custom label renderer
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <FiPieChart className="text-[#0098C2] text-xl mr-2" />
        </div>
        <div className="text-sm text-gray-500">
          Total: {totalProducts} products
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={90}
              innerRadius={60}
              paddingAngle={2}
              dataKey="value"
              label={renderCustomizedLabel}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                  stroke="#fff"
                  strokeWidth={1}
                />
              ))}
              <Label 
                value="Versions" 
                position="center" 
                style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  fill: '#6b7280'
                }} 
              />
            </Pie>
            <Tooltip 
              content={({ payload }) => {
                if (!payload || !payload.length) return null;
                const data = payload[0].payload;
                return (
                  <div className="bg-white p-3 shadow-md rounded-md border border-gray-200">
                    <p className="font-medium text-gray-900">{data.name}</p>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <div>
                        <p className="text-xs text-gray-500">Products</p>
                        <p className="text-sm font-medium">{data.value}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Percentage</p>
                        <p className="text-sm font-medium">{data.percent}%</p>
                      </div>
                    </div>
                  </div>
                );
              }}
            />
            <Legend 
              layout="horizontal"
              verticalAlign="bottom"
              height={40}
              wrapperStyle={{ paddingTop: 20 }}
              formatter={(value, entry, index) => (
                <span className="text-xs text-gray-600">
                  {value} ({chartData[index]?.percent}%)
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        <p>Shows distribution of product versions across all specifications</p>
      </div>
    </div>
  );
};

export default VersionPieChart;