import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useState } from 'react';
import '../../styles/intentPieChart.css';

const IntentPieChart = ({ data }) => {
  const [activeSlice, setActiveSlice] = useState(null);

  const COLORS = {
    'Low': { main: '#dbeafe', light: '#bfdbfe', gradient: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)' },
    'Medium': { main: '#93c5fd', light: '#60a5fa', gradient: 'linear-gradient(135deg, #93c5fd 0%, #60a5fa 100%)' },
    'High-Medium': { main: '#3b82f6', light: '#1d4ed8', gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' },
    'High': { main: '#1e40af', light: '#1e3a8a', gradient: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)' }
  };

  const getColor = (status) => COLORS[status]?.main || '#8884d8';

  const renderCustomLabel = (entry) => {
    const RADIAN = Math.PI / 180;
    const radius = 110 * 0.45;
    const x = entry.cx + radius * Math.cos(-entry.midAngle * RADIAN);
    const y = entry.cy + radius * Math.sin(-entry.midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor="middle" 
        dominantBaseline="central"
        fontSize="11"
        fontWeight="700"
        style={{ 
          pointerEvents: 'none',
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
          filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))'
        }}
      >
        {entry.name}
      </text>
    );
  };

  const chartData = data.map(item => ({
    name: item.name,
    value: item.value,
    percentage: item.percentage
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const status = payload[0].name;
      const color = getColor(status);
      return (
        <div className="intent-tooltip" style={{ borderColor: color }}>
          <p className="tooltip-title" style={{ color }}>
            {payload[0].name}
          </p>
          <div className="tooltip-divider" style={{ borderTopColor: `${color}20` }}>
            <p className="tooltip-row">
              Count: <span className="tooltip-value">{payload[0].value}</span>
            </p>
            <p className="tooltip-row">
              Percentage: <span className="tooltip-value" style={{ color }}>{payload[0].payload.percentage}%</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="intent-pie-chart-container">
      <div className="charts-grid">
        {/* Pie Chart Container */}
        <div className="chart-card chart-wrapper">
          <div className="chart-background-glow"></div>
          
          <h3 className="chart-title">
            <span className="chart-title-accent"></span>
            Intent Status Distribution
          </h3>
          
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="45%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  animationDuration={800}
                  animationEasing="ease-out"
                  onMouseEnter={(_, index) => setActiveSlice(index)}
                  onMouseLeave={() => setActiveSlice(null)}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={getColor(entry.name)}
                      className={`pie-slice ${activeSlice !== null && activeSlice !== index ? 'pie-slice-inactive' : 'pie-slice-active'}`}
                      style={{
                        filter: activeSlice !== null && activeSlice !== index ? 'brightness(0.7)' : 'brightness(1)',
                        transition: 'filter 0.3s ease, transform 0.3s ease',
                        cursor: 'pointer',
                        transformOrigin: '50% 50%',
                        transform: activeSlice === index ? 'scale(1.08)' : 'scale(1)'
                      }}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Legend */}
            <div className="chart-legend">
              {chartData.map((item, idx) => (
                <div 
                  key={idx} 
                  className="legend-item"
                  style={{
                    backgroundColor: '#f9fafb'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = `${getColor(item.name)}15`;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div 
                    className="legend-color-dot"
                    style={{
                      backgroundColor: getColor(item.name),
                      boxShadow: `0 2px 8px ${getColor(item.name)}40`
                    }}
                  ></div>
                  <span className="legend-label">
                    {item.name}
                  </span>
                  <span className="legend-percentage" style={{ color: getColor(item.name) }}>
                    {item.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bar Chart Container */}
        <div className="chart-card chart-wrapper">
          <div className="chart-background-glow"></div>

          <h3 className="chart-title">
            <span className="chart-title-accent"></span>
            Company Count by Status
          </h3>

          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 15, right: 15, left: 45, bottom: 35 }}
              >
                <defs>
                  {chartData.map((item, idx) => (
                    <linearGradient key={`grad-${idx}`} id={`gradient-${idx}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COLORS[item.name]?.light || '#8884d8'} />
                      <stop offset="100%" stopColor={getColor(item.name)} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  angle={0}
                  textAnchor="middle"
                  height={60}
                  tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 500 }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={{ stroke: '#e5e7eb' }}
                  interval={0}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 500 }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  gridLine={{ stroke: '#f3f4f6' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#8884d8" radius={[10, 10, 0, 0]} animationDuration={800}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`url(#gradient-${index})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntentPieChart;
