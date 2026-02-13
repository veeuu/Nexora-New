import { useState, useEffect } from 'react';

/**
 * Performance Metrics Display Component
 * Shows latency breakdown for different stages of data loading
 */
const PerformanceMetrics = ({ measurements, isVisible = false }) => {
  const [expanded, setExpanded] = useState(false);

  if (!measurements || Object.keys(measurements).length === 0) {
    return null;
  }

  // Calculate total time
  const total = Object.values(measurements).reduce((sum, val) => sum + val, 0);

  // Sort measurements by duration (longest first)
  const sortedMeasurements = Object.entries(measurements)
    .sort(([, a], [, b]) => b - a)
    .map(([label, duration]) => ({
      label,
      duration: duration.toFixed(2),
      percentage: ((duration / total) * 100).toFixed(1)
    }));

  // Determine color based on total time
  const getStatusColor = () => {
    if (total < 1000) return '#10b981'; // Green - fast
    if (total < 3000) return '#f59e0b'; // Amber - moderate
    return '#ef4444'; // Red - slow
  };

  const getStatusLabel = () => {
    if (total < 1000) return 'Fast';
    if (total < 3000) return 'Moderate';
    return 'Slow';
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: 'white',
        border: `2px solid ${getStatusColor()}`,
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        zIndex: 9999,
        fontFamily: 'monospace',
        fontSize: '12px',
        maxWidth: '400px',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          backgroundColor: getStatusColor(),
          color: 'white',
          padding: '12px 16px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontWeight: '600',
          userSelect: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>⏱️ Performance Metrics</span>
          <span style={{
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '11px'
          }}>
            {getStatusLabel()}
          </span>
        </div>
        <span style={{ fontSize: '16px' }}>
          {expanded ? '▼' : '▶'}
        </span>
      </div>

      {/* Content */}
      {expanded && (
        <div style={{ padding: '16px', backgroundColor: '#f9fafb' }}>
          {/* Total Time */}
          <div style={{
            marginBottom: '12px',
            padding: '8px 12px',
            backgroundColor: 'white',
            borderRadius: '4px',
            border: `1px solid ${getStatusColor()}`,
            fontWeight: '600',
            color: getStatusColor()
          }}>
            Total Load Time: {total.toFixed(2)}ms
          </div>

          {/* Breakdown */}
          <div style={{ marginBottom: '8px', fontWeight: '600', color: '#1f2937' }}>
            Breakdown:
          </div>

          {sortedMeasurements.map((item, idx) => (
            <div
              key={idx}
              style={{
                marginBottom: '8px',
                padding: '8px 12px',
                backgroundColor: 'white',
                borderRadius: '4px',
                border: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ color: '#1f2937', fontWeight: '500', marginBottom: '4px' }}>
                  {item.label}
                </div>
                <div style={{
                  width: '100%',
                  height: '4px',
                  backgroundColor: '#e5e7eb',
                  borderRadius: '2px',
                  overflow: 'hidden'
                }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${item.percentage}%`,
                      backgroundColor: getStatusColor(),
                      transition: 'width 0.3s ease'
                    }}
                  />
                </div>
              </div>
              <div style={{
                marginLeft: '12px',
                textAlign: 'right',
                whiteSpace: 'nowrap',
                color: '#6b7280'
              }}>
                <div style={{ fontWeight: '600', color: '#1f2937' }}>
                  {item.duration}ms
                </div>
                <div style={{ fontSize: '11px' }}>
                  {item.percentage}%
                </div>
              </div>
            </div>
          ))}

          {/* Tips */}
          <div style={{
            marginTop: '12px',
            padding: '8px 12px',
            backgroundColor: '#f0f9ff',
            borderRadius: '4px',
            border: '1px solid #bfdbfe',
            fontSize: '11px',
            color: '#1e40af',
            lineHeight: '1.4'
          }}>
            <strong>💡 Tips:</strong>
            <ul style={{ margin: '4px 0 0 0', paddingLeft: '16px' }}>
              <li>Look for the slowest stage to identify bottlenecks</li>
              <li>API calls typically take the longest</li>
              <li>Rendering should be under 100ms</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceMetrics;
