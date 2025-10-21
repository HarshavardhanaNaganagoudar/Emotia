import { useState, useEffect } from 'react';
import MoodGraph from './MoodGraph';

export default function YearView({ year, monthsData, loading, onMonthClick, onYearChange }) {
  const [yearValue, setYearValue] = useState(year);
  const [showGraph, setShowGraph] = useState(false);
  const [sentimentData, setSentimentData] = useState({});

  // Fetch sentiment data when year changes
  useEffect(() => {
    if (yearValue) {
      fetchSentimentData(yearValue);
    }
  }, [yearValue]);

  const fetchSentimentData = async (year) => {
    try {
      const response = await fetch(`http://localhost:5000/api/months/${year}/sentiment`);
      if (!response.ok) return;
      const result = await response.json();
      
      // Convert array to object for easy lookup
      const sentimentMap = {};
      result.data.forEach(d => {
        if (d.hasData) {
          sentimentMap[d.fullMonth] = d.sentiment;
        }
      });
      setSentimentData(sentimentMap);
    } catch (error) {
      console.error('Error fetching sentiment data:', error);
    }
  };

  const handleYearChange = (e) => {
    const newYear = parseInt(e.target.value);
    setYearValue(newYear);
    if (onYearChange) {
      onYearChange(newYear);
    }
  };

  const getMonthAbbr = (monthName) => {
    return monthName.substring(0, 3);
  };

  // Get color based on sentiment score (-1 to +1)
  const getMonthColor = (monthData) => {
    // If no entries, return gray
    if (!monthData.hasEntries) {
      return 'bg-gray-300';
    }

    // Get sentiment score for this month
    const sentiment = sentimentData[monthData.month];
    
    // If sentiment not yet loaded or not available, use neutral color
    if (sentiment === undefined || sentiment === null) {
      return 'bg-blue-400';
    }

    // Map sentiment (-1 to +1) to color
    // Negative: shades of red
    // Neutral: shades of yellow/amber
    // Positive: shades of green
    
    if (sentiment <= -0.6) {
      return 'bg-red-600';      // Deep negative
    } else if (sentiment <= -0.3) {
      return 'bg-red-500';      // Negative
    } else if (sentiment <= -0.1) {
      return 'bg-orange-400';   // Slightly negative
    } else if (sentiment <= 0.1) {
      return 'bg-amber-400';    // Neutral
    } else if (sentiment <= 0.3) {
      return 'bg-lime-400';     // Slightly positive
    } else if (sentiment <= 0.6) {
      return 'bg-emerald-500';  // Positive
    } else {
      return 'bg-green-600';    // Very positive
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
      {/* Mood Graph Button - Top Right */}
      <button
        onClick={() => setShowGraph(true)}
        className="absolute top-8 right-8 flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors text-sm"
        title="View mood trajectory"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
        <span>Mood Graph</span>
      </button>

      <h1 className="text-6xl font-bold mb-16">{yearValue}</h1>
      
      <div className="w-full max-w-xl mb-16">
        <input
          type="range"
          min="2020"
          max="2030"
          value={yearValue}
          onChange={handleYearChange}
          className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-orange-500"
        />
      </div>

      {loading ? (
        <div className="text-gray-400 text-sm">Loading...</div>
      ) : (
        <div className="flex gap-3 items-end">
          {monthsData.map((monthData, index) => {
            const sentiment = sentimentData[monthData.month];
            return (
              <div key={index} className="flex flex-col items-center gap-2">
                <button
                  onClick={() => onMonthClick(monthData.month)}
                  className={`${getMonthColor(monthData)} w-10 h-20 rounded-sm hover:opacity-80 transition-all cursor-pointer ${
                    !monthData.hasEntries ? 'opacity-40' : ''
                  }`}
                  title={`${monthData.month} - ${monthData.entryCount} ${monthData.entryCount === 1 ? 'entry' : 'entries'}${
                    sentiment !== undefined && sentiment !== null ? ` - Sentiment: ${sentiment.toFixed(2)}` : ''
                  }`}
                />
                <span className="text-xs text-gray-600 font-medium">
                  {getMonthAbbr(monthData.month)}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Color Legend */}
      <div className="mt-12 flex flex-wrap justify-center gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gray-300 rounded-sm"></div>
          <span>No data</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-600 rounded-sm"></div>
          <span>Very negative</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-orange-400 rounded-sm"></div>
          <span>Negative</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-amber-400 rounded-sm"></div>
          <span>Neutral</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-lime-400 rounded-sm"></div>
          <span>Positive</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-600 rounded-sm"></div>
          <span>Very positive</span>
        </div>
      </div>

      {/* Mood Graph Modal */}
      {showGraph && (
        <MoodGraph year={yearValue} onClose={() => setShowGraph(false)} />
      )}
    </div>
  );
}