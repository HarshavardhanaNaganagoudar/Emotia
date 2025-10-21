import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function MoodGraph({ year, onClose }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSentimentData();
  }, [year]);

  const fetchSentimentData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/months/${year}/sentiment`);
      if (!response.ok) throw new Error('Failed to fetch sentiment data');
      const result = await response.json();
      console.log('Sentiment data received:', result.data);
      // Filter out months with no data
      const filteredData = result.data.filter(d => d.hasData);
      
      // Enhanced debugging
      console.log('Filtered data for graph:');
      filteredData.forEach(d => {
        console.log(`${d.month} (${d.fullMonth}): sentiment=${d.sentiment} (type: ${typeof d.sentiment}), pos=${d.positiveCount}, neg=${d.negativeCount}`);
      });
      
      setData(filteredData);
    } catch (error) {
      console.error('Error fetching sentiment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-gray-300 rounded-lg p-3 shadow-lg">
          <p className="font-semibold">{data.fullMonth}</p>
          <p className="text-sm">Sentiment: {data.sentiment?.toFixed(2) ?? 'N/A'}</p>
          <p className="text-sm text-green-600">Positives: {data.positiveCount}</p>
          <p className="text-sm text-red-600">Negatives: {data.negativeCount}</p>
        </div>
      );
    }
    return null;
  };

  // Custom dot component with color based on sentiment
  const renderCustomDot = (props) => {
    const { cx, cy, payload } = props;
    const sentiment = payload.sentiment;
    
    // Determine color based on sentiment value
    let fillColor = '#10b981'; // green for positive
    if (sentiment < -0.05) {
      fillColor = '#ef4444'; // red for negative
    } else if (sentiment >= -0.05 && sentiment <= 0.05) {
      fillColor = '#9ca3af'; // gray for neutral/zero
    }
    
    return (
      <g>
        <circle
          cx={cx}
          cy={cy}
          r={7}
          fill={fillColor}
          stroke="#ffffff"
          strokeWidth={3}
        />
      </g>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Mood Trajectory {year}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-light w-8 h-8 flex items-center justify-center"
          >
            ×
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-orange-500"></div>
            <p className="mt-4 text-gray-600">Loading mood data...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">No mood data available for {year}</p>
            <p className="text-sm mt-2">Analyze some months to see your mood trajectory</p>
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
                  stroke="#666"
                  style={{ fontSize: '14px' }}
                />
                <YAxis 
                  domain={[-1, 1]} 
                  stroke="#666"
                  style={{ fontSize: '14px' }}
                  ticks={[-1, -0.5, 0, 0.5, 1]}
                />
                <Tooltip content={<CustomTooltip />} />
                {/* Draw reference line BEFORE the line so dots appear on top */}
                <ReferenceLine y={0} stroke="#d1d5db" strokeDasharray="3 3" strokeWidth={1} />
                <Line 
                  type="monotone" 
                  dataKey="sentiment" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={renderCustomDot}
                  activeDot={{ r: 9, strokeWidth: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>

            <div className="mt-6 flex justify-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">Positive (&gt; 0.05)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <span className="text-gray-600">Neutral (≈ 0.0)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-gray-600">Negative (&lt; -0.05)</span>
              </div>
            </div>

            {/* Debug Section */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="font-bold text-sm mb-3">🔍 Debug Info:</div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-xs font-mono">
                {data.map((d, i) => (
                  <div key={i} className="bg-white p-2 rounded border border-gray-200">
                    <div className="font-semibold text-gray-700">{d.fullMonth}</div>
                    <div className="mt-1">
                      <span className="text-gray-500">sentiment:</span> <span className="font-bold">{d.sentiment}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">type:</span> {typeof d.sentiment}
                    </div>
                    <div className="text-green-600">positives: {d.positiveCount}</div>
                    <div className="text-red-600">negatives: {d.negativeCount}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}