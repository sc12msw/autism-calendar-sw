import React from 'react';
import EnergyBar from './EnergyBar';
import styles from './Header.module.css';

const TodaySummary = ({ events, today }) => {
  const currentHour = today.getHours();
  const currentMinute = today.getMinutes();
  const currentTimeInMinutes = currentHour * 60 + currentMinute;
  
  return (
    <ul className={styles.todayEventsList}>
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
 
      <div className={styles.currentDayDisplay}>
        <div className={styles.currentDayHeader}>
          <span className={styles.currentDay}>{today.toLocaleDateString('en-US', { weekday: 'long' })}</span>
          <span className={styles.currentDate}>{today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
        <TodaySummary events={todaysEvents} today={today} />
        
      </div>
      <div className={styles.energyContainer}>      
        <EnergyBar dayIndex={currentDayIndex} dayEvents={todaysEvents} today={today} currentDayIndex={currentDayIndex} />
        </div>
    </>
  );
};

export default Header;
