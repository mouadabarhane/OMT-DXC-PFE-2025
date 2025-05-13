import React from 'react';
import { format, parseISO, isWithinInterval } from 'date-fns';

const ProductOfferingsCalendar = ({ data }) => {
  // Get current month and year
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Get days in month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Generate calendar days
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const date = new Date(currentYear, currentMonth, day);
    
    // Find products active on this day
    const activeProducts = data.filter(product => {
      const startDate = parseISO(product.u_valid_from);
      const endDate = parseISO(product.u_valid_to);
      return isWithinInterval(date, { start: startDate, end: endDate });
    });

    return {
      day,
      date,
      activeProducts
    };
  });

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        {format(currentDate, 'MMMM yyyy')} Product Calendar
      </h2>
      
      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
        
        {calendarDays.map(({ day, date, activeProducts }) => {
          const isToday = date.toDateString() === new Date().toDateString();
          
          return (
            <div 
              key={day} 
              className={`border p-1 min-h-16 ${isToday ? 'bg-blue-50 border-blue-200' : 'border-gray-100'}`}
            >
              <div className="text-right text-sm mb-1">{day}</div>
              {activeProducts.length > 0 && (
                <div className="text-xs space-y-1">
                  {activeProducts.slice(0, 2).map(product => (
                    <div 
                      key={product.sys_id} 
                      className="bg-green-100 text-green-800 px-1 py-0.5 rounded truncate"
                      title={product.u_name}
                    >
                      {product.u_name}
                    </div>
                  ))}
                  {activeProducts.length > 2 && (
                    <div className="text-gray-500 text-xs">
                      +{activeProducts.length - 2} more
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductOfferingsCalendar;