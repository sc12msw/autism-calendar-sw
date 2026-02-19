import EnergyBar from './EnergyBar';
import styles from './Header.module.css';
import PropTypes from 'prop-types';

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

TodaySummary.propTypes = {
  events: PropTypes.array.isRequired,
  today: PropTypes.instanceOf(Date).isRequired,
};


const Header = ({ today, schedule, weeklyEnergyTotal, MAX_WEEKLY_ENERGY }) => {
  const currentDayIndex = today.getDay();
  const todaysEvents = schedule.filter(event => event.day === currentDayIndex).sort((a, b) => (a.startHour * 60 + a.startMinute) - (b.startHour * 60 + b.startMinute));

  return (
    <>
      <div className={styles.weeklyTotalContainer}>
        <span className={styles.weeklyTotalLabel}>Weekly Energy:</span>
        <span className={`${styles.weeklyTotalValue} ${styles.starJediFont}`}>
          {`${weeklyEnergyTotal}/${MAX_WEEKLY_ENERGY}`}
        </span>
      </div>
 
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

Header.propTypes = {
  today: PropTypes.instanceOf(Date).isRequired,
  schedule: PropTypes.array.isRequired,
  weeklyEnergyTotal: PropTypes.number.isRequired,
  MAX_WEEKLY_ENERGY: PropTypes.number.isRequired,
};

export default Header;
