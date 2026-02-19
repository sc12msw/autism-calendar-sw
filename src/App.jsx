import { useState, useEffect } from 'react';
import './index.css';
import Header from './components/Header';
import MobileCalendar from './components/MobileCalendar';
import DesktopCalendar from './components/DesktopCalendar';
import { calculateEnergyTotals } from './utils/energyCalculations'; // Import the utility function

function App() {
  const [schedule, setSchedule] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showFullCalendar, setShowFullCalendar] = useState(false);
  const [mobileDayIndex, setMobileDayIndex] = useState(new Date().getDay());
  const [currentTime, setCurrentTime] = useState(new Date());

  const MAX_DAILY_ENERGY = 12;
  const MAX_WEEKLY_ENERGY = MAX_DAILY_ENERGY * 7; // 12 spoons * 7 days

  const [dailyEnergyTotals, setDailyEnergyTotals] = useState({}); // Stores cumulative energy at end of each day
  const [weeklyEnergyTotal, setWeeklyEnergyTotal] = useState(MAX_WEEKLY_ENERGY); // Total cumulative energy at the end of the week

  // Fetch schedule on mount and calculate cumulative energy
  useEffect(() => {
    fetch('/schedule.json')
      .then(response => response.json())
      .then(data => {
        const rawSchedule = data;
        const expandedSchedule = [];

        rawSchedule.forEach(event => {
          if (event['repeat-weekday'] && event['repeat-weekend']) {
            // Repeat every day (Sunday=0 to Saturday=6)
            for (let day = 0; day <= 6; day++) {
              expandedSchedule.push({ ...event, day: day });
            }
          } else if (event['repeat-weekday']) {
            // Repeat Monday to Friday
            for (let day = 1; day <= 5; day++) { // Monday=1 to Friday=5
              expandedSchedule.push({ ...event, day: day });
            }
          } else if (event['repeat-weekend']) {
            // Repeat Saturday and Sunday
            expandedSchedule.push({ ...event, day: 0 }); // Sunday
            expandedSchedule.push({ ...event, day: 6 }); // Saturday
          } else {
            // Non-repeating event, add as-is (must have a 'day' property)
            if ('day' in event) {
                expandedSchedule.push(event);
            } else {
                console.warn("Event missing 'day' or repeat rule, skipping:", event);
            }
          }
        });

        // Sort the expanded schedule by day and then by start time
        expandedSchedule.sort((a, b) => {
            if (a.day !== b.day) return a.day - b.day;
            return (a.startHour * 60 + a.startMinute) - (b.startHour * 60 + b.startMinute);
        });

        setSchedule(expandedSchedule);

        // Use the utility function to calculate energy totals
        const { dailyEnergyTotals: calculatedDailyTotals, weeklyEnergyTotal: calculatedWeeklyTotal } = calculateEnergyTotals(expandedSchedule, MAX_DAILY_ENERGY);
        
        setDailyEnergyTotals(calculatedDailyTotals);
        setWeeklyEnergyTotal(calculatedWeeklyTotal);

      })
      .catch(error => console.error('Error fetching schedule:', error));
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update currentTime every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60 * 1000); // Update every minute
    return () => clearInterval(timer);
  }, []);
  
  const currentDayIndex = currentTime.getDay();
  // Filter for the mobile view's specific day
  const mobileViewDayEvents = schedule.filter(event => event.day === mobileDayIndex);

  const handlePrevDay = () => {
    setMobileDayIndex(prevIndex => (prevIndex - 1 + 7) % 7);
  };

  const handleNextDay = () => {
    setMobileDayIndex(prevIndex => (prevIndex + 1) % 7);
  };
  
  const toggleView = () => {
    setShowFullCalendar(prevState => !prevState);
  };

  return (
    <>
      <Header today={currentTime} schedule={schedule} weeklyEnergyTotal={weeklyEnergyTotal} MAX_WEEKLY_ENERGY={MAX_WEEKLY_ENERGY} />

      {isMobile && (
        <div id="view-toggle-container">
          <button id="toggle-view-btn" onClick={toggleView}>
            {showFullCalendar ? 'View Daily Summary' : 'View Full Calendar'}
          </button>
        </div>
      )}

      {isMobile ? (
        showFullCalendar ? (
          <DesktopCalendar schedule={schedule} today={currentTime} dailyEnergyTotals={dailyEnergyTotals} MAX_DAILY_ENERGY={MAX_DAILY_ENERGY} />
        ) : (
          <MobileCalendar 
            dayIndex={mobileDayIndex}
            dayEvents={mobileViewDayEvents}
            today={currentTime}
            currentDayIndex={currentDayIndex}
            onPrev={handlePrevDay}
            onNext={handleNextDay}
            dailyEnergyTotals={dailyEnergyTotals}
            MAX_DAILY_ENERGY={MAX_DAILY_ENERGY}
          />
        )
      ) : (
        <DesktopCalendar schedule={schedule} today={currentTime} dailyEnergyTotals={dailyEnergyTotals} MAX_DAILY_ENERGY={MAX_DAILY_ENERGY} />
      )}
    </>
  );
}

export default App;