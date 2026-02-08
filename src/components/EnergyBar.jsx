import React from 'react';

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
    const eventEndInMinutes = event.endHour * 60 + event.endMinute;
    if (eventEndInMinutes < currentTimeInMinutes) {
        currentEnergy += event.energy;
    }
  });

  currentEnergy = Math.max(0, Math.min(MAX_ENERGY, currentEnergy));
  const energyPercentage = (currentEnergy / MAX_ENERGY) * 100;

  let barColor;
  if (energyPercentage > 60) {
    barColor = '#4ecdc4'; // Healthy - Teal
  } else if (energyPercentage > 30) {
    barColor = '#ffe81f'; // Warning - Yellow
  } else {
    barColor = '#ff69b4'; // Danger - Pink
  }
  
  return (
    <div id="energy-bar-container">
      <span className="energy-label">Daily Energy:</span>
      <div className="energy-bar-background">
        <div id="energy-bar" style={{ width: `${energyPercentage}%`, backgroundColor: barColor }}></div>
      </div>
      <span id="energy-value">{`${currentEnergy}/${MAX_ENERGY}`}</span>
    </div>
  );
};

export default EnergyBar;
