import styles from './MobileCalendar.module.css';
import PropTypes from 'prop-types';

const MobileCalendar = ({ dayIndex, dayEvents, today, currentDayIndex, onPrev, onNext, dailyEnergyTotals, MAX_DAILY_ENERGY }) => {
  const selectedDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + (dayIndex - currentDayIndex));
  const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });

  const currentHour = today.getHours();
  const currentMinute = today.getMinutes();
  const currentTimeInMinutes = currentHour * 60 + currentMinute;
  
  const cumulativeEnergy = dailyEnergyTotals[dayIndex] || 0;

  return (
    <div className={styles.mobileCalendarView}>
      <div className={styles.mobileCurrentDayHeaderContainer}>
        <h2 className={styles.mobileCurrentDayHeader}>{dayName}</h2>
        <div className={`${styles.dailyEnergyTotalMobile} ${styles.starJediFont}`}>
          {`${cumulativeEnergy}/${MAX_DAILY_ENERGY}`}
        </div>
      </div>
       
      <ul className={styles.mobileEventsList}>
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
              <li key={index} className={isActive ? styles.currentActiveEvent : ''}>
                {`${event.title} (${startTime} - ${endTime})${energyImpact}`}
              </li>
            );
          })
        ) : (
          <li>No events scheduled for this day.</li>
        )}
      </ul>

      <div className={styles.mobileNav}>
        <button id="prev-day-btn" className={styles.navBtn} onClick={onPrev}>&lt;</button>
        <button id="next-day-btn" className={styles.navBtn} onClick={onNext}>&gt;</button>
      </div>
    </div>
  );
};

MobileCalendar.propTypes = {
  dayIndex: PropTypes.number.isRequired,
  dayEvents: PropTypes.array.isRequired,
  today: PropTypes.instanceOf(Date).isRequired,
  currentDayIndex: PropTypes.number.isRequired,
  onPrev: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  dailyEnergyTotals: PropTypes.object.isRequired,
  MAX_DAILY_ENERGY: PropTypes.number.isRequired,
};

export default MobileCalendar;
