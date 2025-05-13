export function BarChart({ data, xField, yField, color }) {
    // This is a placeholder - replace with your actual chart implementation
    return (
      <div className="w-full h-full flex items-end space-x-2">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div 
              className="w-full rounded-t"
              style={{
                height: `${(item[yField] / Math.max(...data.map(d => d[yField]))) * 100}%`,
                backgroundColor: color
              }}
            ></div>
            <div className="text-xs text-gray-500 mt-1">{item[xField]}</div>
          </div>
        ))}
      </div>
    );
  }
  
  export function PieChart({ data, nameField, valueField, colors }) {
    // This is a placeholder - replace with your actual chart implementation
    const total = data.reduce((sum, item) => sum + item[valueField], 0);
    
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="relative w-48 h-48 rounded-full">
          {data.map((item, index) => {
            const percent = (item[valueField] / total) * 100;
            const rotation = data.slice(0, index).reduce((sum, d) => sum + (d[valueField] / total) * 360, 0);
            
            return (
              <div
                key={index}
                className="absolute inset-0"
                style={{
                  clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos(rotation * Math.PI / 180)}% ${50 + 50 * Math.sin(rotation * Math.PI / 180)}%, ${50 + 50 * Math.cos((rotation + percent * 3.6) * Math.PI / 180)}% ${50 + 50 * Math.sin((rotation + percent * 3.6) * Math.PI / 180)}%)`,
                  backgroundColor: colors[index % colors.length]
                }}
              ></div>
            );
          })}
        </div>
        <div className="ml-8">
          {data.map((item, index) => (
            <div key={index} className="flex items-center mb-2">
              <div 
                className="w-4 h-4 rounded-full mr-2"
                style={{ backgroundColor: colors[index % colors.length] }}
              ></div>
              <span className="text-sm">
                {item[nameField]}: {item[valueField]} ({(item[valueField] / total * 100).toFixed(1)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  export function LineChart({ data, xField, yField, color }) {
    // This is a placeholder - replace with your actual chart implementation
    const maxValue = Math.max(...data.map(d => d[yField]));
    
    return (
      <div className="w-full h-full flex flex-col">
        <div className="flex-1 flex items-end space-x-1">
          {data.map((item, index) => (
            <div 
              key={index}
              className="flex-1 flex flex-col items-center"
              style={{ height: '100%' }}
            >
              <div 
                className="w-full rounded-t"
                style={{
                  height: `${(item[yField] / maxValue) * 100}%`,
                  backgroundColor: color
                }}
              ></div>
            </div>
          ))}
        </div>
        <div className="flex">
          {data.map((item, index) => (
            <div key={index} className="flex-1 text-center text-xs text-gray-500">
              {item[xField]}
            </div>
          ))}
        </div>
      </div>
    );
  }