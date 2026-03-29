import { useState, useEffect } from 'react';
import { ResponsiveContainer, Tooltip, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Cell } from 'recharts';
import { journalApi } from '../../api';

// Mood colors map
const MOOD_COLORS = {
  HAPPY: '#34D399',  // accent-green
  CALM: '#38BDF8',   // accent-blue
  ANXIOUS: '#F59E0B',// accent-amber
  SAD: '#475569',    // text-muted
  ANGRY: '#EF4444',  // accent-red
  NONE: '#1A2235',   // bg-card (empty)
};

const getDaysInMonth = (year, month) => {
  return new Date(year, month, 0).getDate();
};

export const MoodHeatmap = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1-12

  useEffect(() => {
    const fetchHeatmap = async () => {
      try {
        setLoading(true);
        const res = await journalApi.getHeatmap({ year, month });
        const heatmapRaw = res.heatmap || {};
        
        const days = getDaysInMonth(year, month);
        const chartData = [];
        
        // Organize into a 7x5 or 7x6 grid for calendar view
        let weekRow = 0;
        
        // Find day of week for 1st of month (0 = Sun, 1 = Mon)
        const firstDay = new Date(year, month - 1, 1).getDay();
        
        let currentCol = firstDay;
        
        for (let i = 1; i <= days; i++) {
          const mood = heatmapRaw[i] || 'NONE';
          chartData.push({
            day: i,
            x: currentCol, // Day of week (0-6)
            y: weekRow,    // Week of month
            z: 1,          // Size value
            mood,
          });
          
          currentCol++;
          if (currentCol > 6) {
            currentCol = 0;
            weekRow++;
          }
        }
        
        // Reverse Y axis to draw top-down implicitly
        const maxRow = weekRow;
        chartData.forEach(d => { d.y = maxRow - d.y; });
        
        setData(chartData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHeatmap();
  }, [year, month]);

  if (loading) return <div className="h-48 w-full animate-pulse bg-bg-surface rounded-xl" />;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-bg-elevated border border-border p-2 rounded-lg shadow-xl text-xs font-medium">
          <p className="text-text-primary mb-1">Day {data.day}</p>
          <p style={{ color: MOOD_COLORS[data.mood] }}>{data.mood === 'NONE' ? 'No Entry' : data.mood}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-56 pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart
          margin={{ top: 10, right: 10, bottom: 10, left: -20 }}
        >
          <XAxis 
            type="number" 
            dataKey="x" 
            domain={[0, 6]} 
            tickFormatter={(val) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][val]} 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: 600 }}
          />
          <YAxis 
            type="number" 
            dataKey="y" 
            domain={[0, 5]} 
            axisLine={false} 
            tickLine={false} 
            tick={false} 
          />
          <ZAxis type="number" dataKey="z" range={[300, 300]} />
          <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: 'var(--border)' }} />
          <Scatter data={data} shape="square">
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={MOOD_COLORS[entry.mood]} 
                radius={8}
                style={{ 
                  filter: entry.mood !== 'NONE' ? `drop-shadow(0 0 6px ${MOOD_COLORS[entry.mood]}40)` : 'none',
                  transition: 'all 0.3s ease'
                }}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};
