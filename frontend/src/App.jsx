import { useState, useEffect } from 'react';
import YearView from './components/YearView';
import MonthView from './components/MonthView';

export default function App() {
  const [currentView, setCurrentView] = useState('year');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [currentYear, setCurrentYear] = useState(2025);
  const [monthsData, setMonthsData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch year status when year changes
  useEffect(() => {
    fetchYearStatus(currentYear);
  }, [currentYear]);

  const fetchYearStatus = async (year) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/months/${year}/status`);
      if (!response.ok) throw new Error('Failed to fetch year status');
      const data = await response.json();
      setMonthsData(data.months);
    } catch (error) {
      console.error('Error fetching year status:', error);
      // Fallback to default data
      const months = ['January', 'February', 'March', 'April', 'May', 'June',
                     'July', 'August', 'September', 'October', 'November', 'December'];
      setMonthsData(months.map(month => ({ month, hasEntries: false, entryCount: 0 })));
    } finally {
      setLoading(false);
    }
  };

  const handleMonthClick = (month) => {
    setSelectedMonth(month);
    setCurrentView('month');
  };

  const handleBack = () => {
    setCurrentView('year');
    // Refresh year status when coming back
    fetchYearStatus(currentYear);
  };

  const handleYearChange = (newYear) => {
    setCurrentYear(newYear);
  };

  return (
    <div className="font-sans">
      {currentView === 'year' ? (
        <YearView 
          year={currentYear} 
          monthsData={monthsData}
          loading={loading}
          onMonthClick={handleMonthClick}
          onYearChange={handleYearChange}
        />
      ) : (
        <MonthView 
          month={selectedMonth} 
          year={currentYear} 
          onBack={handleBack} 
        />
      )}
    </div>
  );
}