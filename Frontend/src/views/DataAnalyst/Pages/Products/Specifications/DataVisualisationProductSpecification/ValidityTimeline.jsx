import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine,
  Label,
  ReferenceArea
} from 'recharts';
import { FiCalendar, FiClock, FiAlertTriangle } from 'react-icons/fi';

const ValidityTimeline = ({ data }) => {
  const currentDate = new Date().getTime();
  const chartData = data.map(item => ({
    name: item.u_name.length > 15 ? `${item.u_name.substring(0, 15)}...` : item.u_name,
    fullName: item.u_name,
    validFrom: new Date(item.u_valid_from).getTime(),
    validTo: new Date(item.u_valid_to).getTime(),
    duration: (new Date(item.u_valid_to) - new Date(item.u_valid_from)) / (1000 * 60 * 60 * 24),
    isActive: new Date(item.u_valid_to) > new Date(),
    isExpiringSoon: new Date(item.u_valid_to) > new Date() && 
                  (new Date(item.u_valid_to) - new Date()) < (30 * 24 * 60 * 60 * 1000) // Expiring in <30 days
  })).sort((a, b) => b.validFrom - a.validFrom);

  // Find the earliest and latest dates for the reference area
  const minDate = Math.min(...chartData.map(d => d.validFrom));
  const maxDate = Math.max(...chartData.map(d => d.validTo));

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
      <div className="h-[477px] relative">
                  
    
<div className="flex items-center">
  <FiCalendar className="text-[#0098C2] text-xl mr-2" />
</div>
        <ResponsiveContainer width="100%" height="90%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 20, right: 5, left: 5, bottom: 5 }}
            barGap={5}
            barCategoryGap={15}
          >
            <ReferenceArea 
              x1={minDate} 
              x2={maxDate} 
              fill="#f8fafc" 
              stroke="#e2e8f0"
              strokeWidth={1}
              strokeDasharray="3 3"
            />
            
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#e2e8f0"
              horizontal={true}
              vertical={true}
            />
            
            <XAxis 
              type="number" 
              domain={[minDate - 2592000000, maxDate + 2592000000]}
              tickFormatter={(unixTime) => new Date(unixTime).toLocaleDateString()}
              tick={{ fill: '#6b7280', fontSize: 12 }}
              axisLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
              tickMargin={10}
            >
              <Label 
                value="Validity Period" 
                position="insideBottom" 
                offset={-20} 
                style={{ 
                  fill: '#4b5563',
                  fontSize: 12,
                  fontWeight: 500
                }}
              />
            </XAxis>
            
            <YAxis 
              dataKey="name" 
              type="category" 
              width={160}
              tick={{ fill: '#374151', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            
            {/* Current Date Reference Line */}
            <ReferenceLine 
              x={currentDate} 
              stroke="#ef4444" 
              strokeWidth={2}
              strokeDasharray="3 3"
            >
              <Label 
                value="Today" 
                position="insideTopRight" 
                fill="#ef4444" 
                fontSize={12}
                fontWeight="bold"
              />
            </ReferenceLine>
            
            {/* Expiring Soon Warning Zone */}
            <ReferenceArea 
              x1={currentDate} 
              x2={currentDate + (30 * 24 * 60 * 60 * 1000)} 
              fill="#fef3c7" 
              fillOpacity={0.3}
              stroke="transparent"
              label={{
                value: 'Expires Soon',
                position: 'insideTopLeft',
                fill: '#d97706',
                fontSize: 10
              }}
            />
            
            <Tooltip 
              content={({ payload }) => {
                if (!payload || payload.length === 0) return null;
                const fromDate = new Date(payload[0].payload.validFrom);
                const toDate = new Date(payload[0].payload.validTo);
                const isActive = payload[0].payload.isActive;
                const isExpiringSoon = payload[0].payload.isExpiringSoon;
                
                return (
                  <div className="bg-white p-3 shadow-lg rounded-md border border-gray-200">
                    <p className="font-medium text-gray-900 mb-2">{payload[0].payload.fullName}</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-500">Start Date</p>
                        <p className="text-sm">{fromDate.toLocaleDateString()}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-500">End Date</p>
                        <p className="text-sm">{toDate.toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500">Status:</span>
                        <span className={`text-xs font-medium ${
                          !isActive ? 'text-red-600' : 
                          isExpiringSoon ? 'text-amber-600' : 'text-green-600'
                        }`}>
                          {!isActive ? 'Expired' : isExpiringSoon ? 'Expiring Soon' : 'Active'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs font-medium text-gray-500">Duration:</span>
                        <span className="text-xs font-medium text-gray-700">
                          {payload[0].payload.duration.toFixed(0)} days
                        </span>
                      </div>
                      {isExpiringSoon && (
                        <div className="flex items-start mt-2 text-amber-600">
                          <FiAlertTriangle className="flex-shrink-0 mt-0.5 mr-1" size={12} />
                          <span className="text-xs">Expires in {Math.ceil((toDate - new Date()) / (1000 * 60 * 60 * 24))} days</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }}
            />
            

            <Bar 
              dataKey="validFrom" 
              fill="#0098C2" 
              name="Valid From"
              radius={[0, 4, 4, 0]}
              animationDuration={1500}
            />
            
            <Bar 
              dataKey="validTo" 
              fill="#8DC9DD" 
              name="Valid To"
              radius={[0, 4, 4, 0]}
              animationDuration={1500}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex justify-between items-center mt-4 text-xs text-gray-600">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-[#0098C2] rounded-sm mr-2"></div>
          <span className="font-medium">Valid From</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-[#8DC9DD] rounded-sm mr-2"></div>
          <span className="font-medium">Valid To</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 border-2 border-[#ef4444] rounded-sm mr-2"></div>
          <span className="font-medium">Current Date</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-amber-100 border border-amber-300 rounded-sm mr-2"></div>
          <span className="font-medium">Expiring Soon</span>
        </div>
      </div>
    </div>
  );
};

export default ValidityTimeline;