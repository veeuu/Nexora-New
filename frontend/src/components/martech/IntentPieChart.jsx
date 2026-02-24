import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useState } from 'react';

const IntentPieChart = ({ data }) => {
  const [activeSlice, setActiveSlice] = useState(null);

  const COLORS = {
    'Low': { main: '#7c3aed', light: '#a78bfa', gradient: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)' },
    'Medium': { main: '#f59e0b', light: '#fbbf24', gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)' },
    'High-Medium': { main: '#3b82f6', light: '#60a5fa', gradient: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)' },
    'High': { main: '#ec4899', light: '#f472b6', gradient: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)' }
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
        <div style={{
          backgroundColor: 'white',
          padding: '14px 18px',
          border: `2px solid ${color}`,
          borderRadius: '10px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
          backdropFilter: 'blur(8px)',
          animation: 'slideIn 0.2s ease-out'
        }}>
          <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '700', color: color }}>
            {payload[0].name}
          </p>
          <div style={{ borderTop: `1px solid ${color}20`, paddingTop: '8px' }}>
            <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#6b7280' }}>
              Count: <span style={{ fontWeight: '700', color: '#1f2937', fontSize: '13px' }}>{payload[0].value}</span>
            </p>
            <p style={{ margin: '0', fontSize: '12px', color: '#6b7280' }}>
              Percentage: <span style={{ fontWeight: '700', color: color, fontSize: '13px' }}>{payload[0].payload.percentage}%</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', padding: '0' }}>
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .chart-card {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '28px', 
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Pie Chart Container */}
        <div className="chart-card" style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          padding: '20px',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-50%',
            right: '-50%',
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
            borderRadius: '50%',
            pointerEvents: 'none'
          }}></div>
          
          <h3 style={{
            margin: '0',
            fontSize: '17px',
            fontWeight: '700',
            color: '#1f2937',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            position: 'relative',
            zIndex: 1
          }}>
            <span style={{
              width: '5px',
              height: '20px',
              background: 'linear-gradient(180deg, #3b82f6 0%, #1e40af 100%)',
              borderRadius: '3px',
              boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
            }}></span>
            Intent Status Distribution
          </h3>
          
          <div style={{ height: '320px', width: '100%', position: 'relative', zIndex: 1 }}>
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
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '16px',
              flexWrap: 'wrap',
              marginTop: '10px',
              paddingTop: '10px',
              borderTop: '2px solid #e5e7eb'
            }}>
              {chartData.map((item, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '13px',
                  color: '#6b7280',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  backgroundColor: '#f9fafb',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
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
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: getColor(item.name),
                    boxShadow: `0 2px 8px ${getColor(item.name)}40`
                  }}></div>
                  <span style={{ fontWeight: '600', color: '#1f2937' }}>
                    {item.name}
                  </span>
                  <span style={{ fontWeight: '700', color: getColor(item.name), marginLeft: '4px' }}>
                    {item.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bar Chart Container */}
        <div className="chart-card" style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          padding: '20px',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-50%',
            right: '-50%',
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
            borderRadius: '50%',
            pointerEvents: 'none'
          }}></div>

          <h3 style={{
            margin: '0',
            fontSize: '17px',
            fontWeight: '700',
            color: '#1f2937',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            position: 'relative',
            zIndex: 1
          }}>
            <span style={{
              width: '5px',
              height: '20px',
              background: 'linear-gradient(180deg, #3b82f6 0%, #1e40af 100%)',
              borderRadius: '3px',
              boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
            }}></span>
            Company Count by Status
          </h3>

          <div style={{ height: '320px', width: '100%', position: 'relative', zIndex: 1 }}>
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
