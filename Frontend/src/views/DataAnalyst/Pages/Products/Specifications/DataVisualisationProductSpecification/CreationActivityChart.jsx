import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine,
  Label,
  Area,
  AreaChart
} from 'recharts';
import { FiActivity, FiTrendingUp } from 'react-icons/fi';

const CreationActivityChart = ({ data }) => {
  // Process data to count creations by date
  const activityData = data.reduce((acc, item) => {
    const date = item.sys_created_on.split(' ')[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  // Convert to array and sort by date
  const chartData = Object.entries(activityData)
    .map(([date, count]) => ({ 
      date, 
      count,
      formattedDate: new Date(date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // Calculate 7-day moving average
  const movingAverageData = chartData.map((point, index, array) => {
    const start = Math.max(0, index - 6);
    const subset = array.slice(start, index + 1);
    const sum = subset.reduce((acc, curr) => acc + curr.count, 0);
    return {
      ...point,
      average: sum / subset.length
    };
  });

  // Find peak creation day
  const peakDay = chartData.reduce((max, day) => 
    day.count > max.count ? day : max, chartData[0]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <FiActivity className="text-[#0098C2] text-xl mr-2" />
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <FiTrendingUp className="mr-1" />
          <span>Total: {data.length} products</span>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={movingAverageData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0098C2" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#0098C2" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorAverage" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8DC9DD" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8DC9DD" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#f0f0f0"
              vertical={false}
            />
            
            <XAxis 
              dataKey="formattedDate"
              tick={{ fill: '#6b7280', fontSize: 12 }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickMargin={10}
            >
              <Label 
                value="Creation Date" 
                position="insideBottom" 
                offset={-10} 
                style={{ 
                  fill: '#6b7280',
                  fontSize: 12,
                  fontWeight: 500
                }} 
              />
            </XAxis>
            
            <YAxis 
              tick={{ fill: '#6b7280', fontSize: 12 }}
              axisLine={{ stroke: '#e5e7eb' }}
            >
              <Label 
                angle={-90}
                value="Products Created" 
                position="insideLeft" 
                offset={10}
                style={{ 
                  fill: '#6b7280',
                  fontSize: 12,
                  fontWeight: 500
                }} 
              />
            </YAxis>
            
            {peakDay && (
              <ReferenceLine 
                x={peakDay.formattedDate}
                stroke="#ef4444"
                strokeDasharray="3 3"
                label={{
                  value: `Peak: ${peakDay.count}`, 
                  position: 'top', 
                  fill: '#ef4444',
                  fontSize: 12
                }}
              />
            )}
            
            <Tooltip 
              content={({ payload}) => {
                if (!payload || !payload.length) return null;
                const dailyCount = payload[0].payload.count;
                const weeklyAvg = payload[0].payload.average;
                
                return (
                  <div className="bg-white p-3 shadow-lg rounded-md border border-gray-200">
                    <p className="font-medium text-gray-900 mb-2">
                      {new Date(payload[0].payload.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-500">Daily</p>
                        <p className="text-sm font-medium text-[#0098C2]">
                          {dailyCount} product{dailyCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-500">7-day Avg</p>
                        <p className="text-sm font-medium text-[#8DC9DD]">
                          {weeklyAvg.toFixed(1)} product{weeklyAvg !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              }}
            />
            
            <Legend 
              verticalAlign="top"
              height={40}
              wrapperStyle={{ paddingBottom: 10 }}
              formatter={(value) => (
                <span className="text-gray-600 text-sm font-medium">{value}</span>
              )}
            />
            
            <Area
              type="monotone"
              dataKey="count"
              stroke="#0098C2"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorCount)"
              name="Daily Creations"
              activeDot={{ 
                r: 6, 
                stroke: '#fff',
                strokeWidth: 2,
                fill: '#0098C2'
              }}
            />
            
            <Line
              type="monotone"
              dataKey="average"
              stroke="#8DC9DD"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="7-Day Average"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 text-xs text-gray-500 text-center">
        <p>Shows daily product creation activity with 7-day moving average</p>
      </div>
    </div>
  );
};

export default CreationActivityChart;