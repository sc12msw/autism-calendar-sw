import React from 'react';
import EnergyBar from './EnergyBar';

const TodaySummary = ({ events, today }) => {
  const currentHour = today.getHours();
  const currentMinute = today.getMinutes();
  const currentTimeInMinutes = currentHour * 60 + currentMinute;
  
  return (
    <ul id="today-events-list">
      {events.length > 0 ? (
        events.map((event, index) => {
          const eventStartInMinutes = event.startHour * 60 + event.startMinute;
          const eventEndInMinutes = event.endHour * 60 + event.endMinute;
          const isActive = currentTimeInMinutes >= eventStartInMinutes && currentTimeInMinutes < eventEndInMinutes;
          
          return (
            <li key={index} className={isActive ? 'current-active-event' : ''}>
              {`${event.title} (${String(event.startHour).padStart(2, '0')}:${String(event.startMinute).padStart(2, '0')} - ${String(event.endHour).padStart(2, '0')}:${String(event.endMinute).padStart(2, '0')})`}
            </li>
          );
        })
      ) : (
        <li>No events scheduled for today.</li>
      )}
    </ul>
  );
};


const Header = ({ today, schedule }) => {
  const currentDayIndex = today.getDay();
  const todaysEvents = schedule.filter(event => event.day === currentDayIndex).sort((a, b) => (a.startHour * 60 + a.startMinute) - (b.startHour * 60 + b.startMinute));

  return (
    <>
      <h1>Nar Shaddaa Calendar</h1>
      <div id="current-day-display">
        <div id="current-day-header">
          <span id="current-day">{today.toLocaleDateString('en-US', { weekday: 'long' })}</span>
          <span id="current-date">{today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
        <TodaySummary events={todaysEvents} today={today} />
        <EnergyBar dayIndex={currentDayIndex} dayEvents={todaysEvents} today={today} currentDayIndex={currentDayIndex} />
      </div>
    </>
  );
};

export default Header;
