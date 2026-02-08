import React from 'react';

const MobileCalendar = ({ dayIndex, dayEvents, today, currentDayIndex, onPrev, onNext }) => {
  const selectedDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + (dayIndex - currentDayIndex));
  const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });

  const currentHour = today.getHours();
  const currentMinute = today.getMinutes();
  const currentTimeInMinutes = currentHour * 60 + currentMinute;
  
  return (
    <div id="mobile-calendar-view">
      <div id="mobile-current-day-header-container">
        <h2 id="mobile-current-day-header">{dayName}</h2>
      </div>
       
      <ul id="mobile-events-list">
        {dayEvents.length > 0 ? (
          dayEvents.map((event, index) => {
            const startTime = String(event.startHour).padStart(2, '0') + ':' + String(event.startMinute).padStart(2, '0');
            const endTime = String(event.endHour).padStart(2, '0') + ':' + String(event.endMinute).padStart(2, '0');
            
            let energyImpact = '';
            if (event.energy > 0) {
                energyImpact = ` (+${event.energy})`;
            } else if (event.energy < 0) {
                energyImpact = ` (${event.energy})`;
            }

            const isActive = dayIndex === currentDayIndex && (currentTimeInMinutes >= (event.startHour * 60 + event.startMinute) && currentTimeInMinutes < (event.endHour * 60 + event.endMinute));

            return (
              <li key={index} className={isActive ? 'current-active-event' : ''}>
                {`${event.title} (${startTime} - ${endTime})${energyImpact}`}
              </li>
            );
          })
        ) : (
          <li>No events scheduled for this day.</li>
        )}
      </ul>

      <div className="mobile-nav">
        <button id="prev-day-btn" className="nav-btn" onClick={onPrev}>&lt;</button>
        <button id="next-day-btn" className="nav-btn" onClick={onNext}>&gt;</button>
      </div>
    </div>
  );
};

export default MobileCalendar;
