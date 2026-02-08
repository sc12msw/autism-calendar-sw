import { useState, useEffect } from 'react';
import './index.css';
import Header from './components/Header';
import MobileCalendar from './components/MobileCalendar';
import DesktopCalendar from './components/DesktopCalendar';

function App() {
  const [schedule, setSchedule] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showFullCalendar, setShowFullCalendar] = useState(false);
  const [mobileDayIndex, setMobileDayIndex] = useState(new Date().getDay());
  const [currentTime, setCurrentTime] = useState(new Date()); // New state for dynamic time

  // Fetch schedule on mount
  useEffect(() => {
    fetch('/schedule.json')
      .then(response => response.json())
      .then(data => setSchedule(data))
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
  }, []); // Empty dependency array means this runs once on mount and cleans up on unmount
  
  const currentDayIndex = currentTime.getDay(); // Use dynamic currentTime
  const dayEvents = schedule.filter(event => event.day === mobileDayIndex);

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
      <Header today={currentTime} schedule={schedule} />

      {isMobile && (
        <div id="view-toggle-container">
          <button id="toggle-view-btn" onClick={toggleView}>
            {showFullCalendar ? 'View Daily Summary' : 'View Full Calendar'}
          </button>
        </div>
      )}

      {isMobile ? (
        showFullCalendar ? (
          <DesktopCalendar schedule={schedule} today={currentTime} />
        ) : (
          <MobileCalendar 
            dayIndex={mobileDayIndex}
            dayEvents={dayEvents}
            today={currentTime} // Pass dynamic currentTime
            currentDayIndex={currentDayIndex}
            onPrev={handlePrevDay}
            onNext={handleNextDay}
          />
        )
      ) : (
        <DesktopCalendar schedule={schedule} today={currentTime} />
      )}
    </>
  );
}

export default App;
