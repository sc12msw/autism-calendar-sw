import styles from './DesktopCalendar.module.css';
import PropTypes from 'prop-types';

const DesktopCalendar = ({ schedule, today, dailyEnergyTotals, MAX_DAILY_ENERGY }) => {
  const currentDayIndex = today.getDay(); // 0 (Sunday) to 6 (Saturday)
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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
            <th className={styles.timeHeader}>Time</th>
            {daysOfWeek.map((dayName, index) => {
              const cumulativeEnergy = dailyEnergyTotals[index] || 0;
              const isCurrentDayHeader = index === currentDayIndex ? styles.currentDayColumnHeader : '';
              return (
                <th key={dayName} className={`${isCurrentDayHeader} ${styles.dayHeaderWithEnergy}`}>
                  <div className={styles.dayName}>{dayName}</div>
                  <div className={`${styles.dailyEnergyTotal} ${styles.starJediFont}`}>
                    {`${cumulativeEnergy}/${MAX_DAILY_ENERGY}`}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {hours.map(hour => (
            <tr key={hour} data-hour={hour}>
              <td>{String(hour).padStart(2, '0')}:00</td>
              {daysOfWeek.map((dayName, dayIndex) => { // Use dayIndex 0-6 here
                const events = eventsByTimeAndDay[`${hour}-${dayIndex}`] || [];
                const event = events[0]; // Just display the first event in a slot for simplicity

                const isCurrentDay = dayIndex === currentDayIndex;
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
                  <td key={dayIndex} className={classNames.join(' ')} data-day={dayIndex}>
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

DesktopCalendar.propTypes = {
  schedule: PropTypes.array.isRequired,
  today: PropTypes.instanceOf(Date).isRequired,
  dailyEnergyTotals: PropTypes.object.isRequired,
  MAX_DAILY_ENERGY: PropTypes.number.isRequired,
};

export default DesktopCalendar;
