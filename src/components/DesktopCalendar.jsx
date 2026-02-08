import React from 'react';
import styles from './DesktopCalendar.module.css';

const DesktopCalendar = ({ schedule, today }) => {
  const currentDayIndex = today.getDay();
  let highlightColumnIndex = currentDayIndex === 0 ? 7 : currentDayIndex;

  const currentHour = today.getHours();
  const currentMinute = today.getMinutes();
  const currentTimeInMinutes = currentHour * 60 + currentMinute;

  const hours = Array.from({ length: 17 }, (_, i) => i + 7); // 7am to 11pm (23:00)

  const eventsByTimeAndDay = {};
  schedule.forEach(event => {
    const key = `${event.startHour}-${event.day}`;
    if (!eventsByTimeAndDay[key]) {
      eventsByTimeAndDay[key] = [];
    }
    eventsByTimeAndDay[key].push(event);
  });
  
  return (
    <div className={styles.calendarContainer}>
      <table className={styles.calendar}>
        <thead>
          <tr>
            <th>Time</th>
            <th>Monday</th>
            <th>Tuesday</th>
            <th>Wednesday</th>
            <th>Thursday</th>
            <th>Friday</th>
            <th>Saturday</th>
            <th>Sunday</th>
          </tr>
        </thead>
        <tbody>
          {hours.map(hour => (
            <tr key={hour} data-hour={hour}>
              <td>{String(hour).padStart(2, '0')}:00</td>
              {Array.from({ length: 7 }, (_, dayIndex) => {
                const day = dayIndex + 1;
                const events = eventsByTimeAndDay[`${hour}-${day}`] || (day === 7 ? eventsByTimeAndDay[`${hour}-0`] : undefined) || [];
                const event = events[0]; // Just display the first event in a slot for simplicity

                const isCurrentDay = day === highlightColumnIndex;
                let isActiveEvent = false;

                if (event && isCurrentDay) {
                  const eventStartInMinutes = event.startHour * 60 + event.startMinute;
                  const eventEndInMinutes = event.endHour * 60 + event.endMinute;
                  isActiveEvent = currentTimeInMinutes >= eventStartInMinutes && currentTimeInMinutes < eventEndInMinutes;
                }

                let classNames = [];
                if(isCurrentDay) classNames.push(styles.currentDayColumnCell);
                if(event) classNames.push(styles.eventStart);
                if(isActiveEvent) classNames.push(styles.currentActiveEvent);

                return (
                  <td key={day} className={classNames.join(' ')} data-day={day}>
                    {event ? event.title : ''}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DesktopCalendar;
