import styles from './EnergyBar.module.css';
import PropTypes from 'prop-types';

const EnergyBar = ({ dayIndex, dayEvents, today, currentDayIndex }) => {
  if (dayIndex !== currentDayIndex) {
    return null; // Only show energy bar for the current day
  }

  const MAX_ENERGY = 12;
  let currentEnergy = MAX_ENERGY;
  const currentHour = today.getHours();
  const currentMinute = today.getMinutes();
  const currentTimeInMinutes = currentHour * 60 + currentMinute;

  dayEvents.forEach(event => {
    const eventStartInMinutes = event.startHour * 60 + event.startMinute;
    if (eventStartInMinutes <= currentTimeInMinutes) {
        currentEnergy += event.energy;
    }
  });

  // Remove upper cap for currentEnergy, keep lower cap at 0
  currentEnergy = Math.max(0, currentEnergy);

  let displayValue = `${currentEnergy}/${MAX_ENERGY}`;
  let barWidth = `${(currentEnergy / MAX_ENERGY) * 100}%`;
  let barColor;
  let textColor;

  if (currentEnergy > MAX_ENERGY) {
    barColor = 'red'; // Over max color
    textColor = 'red';
    displayValue = `OVER! ${currentEnergy}/${MAX_ENERGY}`; // Message
    barWidth = '100%'; // Cap visual width at 100%
  } else if (currentEnergy > (MAX_ENERGY * 0.6)) { // Healthy - Teal
    barColor = '#4ecdc4'; 
    textColor = '#4ecdc4';
  } else if (currentEnergy > (MAX_ENERGY * 0.3)) { // Warning - Yellow
    barColor = '#ffe81f';
    textColor = '#ffe81f';
  } else { // Danger - Pink
    barColor = '#ff69b4';
    textColor = '#ff69b4';
  }
  
  return (
    <div className={styles.energyBarContainer}>
      <span className={styles.energyLabel}>Daily Energy:</span>
      <div className={styles.energyBarBackground}>
        <div className={styles.energyBar} style={{ width: barWidth, backgroundColor: barColor }}></div>
      </div>
      <span className={styles.energyValue} style={{ color: textColor }}>{displayValue}</span>
    </div>
  );
};

EnergyBar.propTypes = {
  dayIndex: PropTypes.number.isRequired,
  dayEvents: PropTypes.array.isRequired,
  today: PropTypes.instanceOf(Date).isRequired,
  currentDayIndex: PropTypes.number.isRequired,
};

export default EnergyBar;
