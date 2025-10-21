import { useState, useEffect } from 'react';

export default function MonthView({ month, year, onBack }) {
  const [positives, setPositives] = useState([]);
  const [negatives, setNegatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch month summary from backend
  const fetchMonthSummary = async () => {
    setLoading(true);
    setError(null);
    
    console.log('Fetching summary for:', { month, year, yearType: typeof year });
    
    try {
      const url = `http://localhost:5000/api/months/${year}/${month}/summary`;
      console.log('Fetching URL:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Received data:', data);
      
      setPositives(data.positives || []);
      setNegatives(data.negatives || []);
    } catch (err) {
      setError('Failed to load summary. Make sure Ollama is running and backend is started.');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (month && year) {
      fetchMonthSummary();
    }
  }, [month, year]);

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-5xl font-bold">{month} {year}</h1>
          <button
            onClick={onBack}
            className="px-6 py-2 border-2 border-black rounded-full hover:bg-gray-100 transition-colors"
          >
            Back
          </button>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-orange-500"></div>
            <p className="mt-4 text-gray-600">Analyzing entries with AI...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Positives Section */}
            <div className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">Positives</h2>
              <div className="bg-gray-200 rounded-lg p-6 min-h-32">
                {positives.length > 0 ? (
                  <ul className="space-y-2">
                    {positives.map((item, idx) => (
                      <li key={idx} className="text-lg">• {item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No positive highlights found</p>
                )}
              </div>
            </div>

            {/* Negatives Section */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">Negatives</h2>
              <div className="bg-gray-200 rounded-lg p-6 min-h-32">
                {negatives.length > 0 ? (
                  <ul className="space-y-2">
                    {negatives.map((item, idx) => (
                      <li key={idx} className="text-lg">• {item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No negative highlights found</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}