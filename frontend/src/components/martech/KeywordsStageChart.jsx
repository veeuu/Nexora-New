const KeywordsStageChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>No data available</div>;
  }

  // Sort data from lowest to highest
  const sortedData = [...data].sort((a, b) => a.count - b.count);
  
  const maxCount = Math.max(...sortedData.map(item => item.count), 1);
  const minCount = Math.min(...sortedData.map(item => item.count), 0);
  const totalCount = data.reduce((sum, item) => sum + item.count, 0);
  const avgCount = Math.round(totalCount / data.length);
  
  const colors = ['#c7d2fe', '#a5b4fc', '#818cf8', '#6366f1', '#4f46e5'];
  const maxBarWidth = 400; // Maximum width in pixels

  return (
    <div style={{ padding: '24px', backgroundColor: '#ffffff' }}>
      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div style={{ padding: '16px', backgroundColor: '#f0f9ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
          <div style={{ fontSize: '12px', color: '#1e40af', fontWeight: '600', marginBottom: '8px' }}>Total</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>{totalCount}</div>
        </div>
        <div style={{ padding: '16px', backgroundColor: '#f0f9ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
          <div style={{ fontSize: '12px', color: '#1e40af', fontWeight: '600', marginBottom: '8px' }}>Highest</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>{maxCount}</div>
        </div>
        <div style={{ padding: '16px', backgroundColor: '#f0f9ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
          <div style={{ fontSize: '12px', color: '#1e40af', fontWeight: '600', marginBottom: '8px' }}>Stages</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>{data.length}</div>
        </div>
      </div>

      {/* Bar Chart */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {sortedData.map((item, idx) => {
          const percentage = (item.count / maxCount) * 100;
          const barWidth = (percentage / 100) * maxBarWidth;
          const color = colors[idx % colors.length];

          return (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {/* Label */}
              <div style={{ minWidth: '140px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                {item.stage}
              </div>
              
              {/* Bar */}
              <div
                style={{
                  width: `${barWidth}px`,
                  height: '32px',
                  backgroundColor: color,
                  borderRadius: '6px',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
                  minWidth: '50px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                  e.currentTarget.style.transform = 'scaleY(1.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.08)';
                  e.currentTarget.style.transform = 'scaleY(1)';
                }}
              />
              
              {/* Count */}
              <div style={{ minWidth: '45px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                {item.count}
              </div>
            </div>
          );
        })}
      </div>

      {/* Total */}
      <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
        <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>
          Total: <span style={{ color: '#1f2937', fontWeight: '600' }}>{totalCount} products/services</span>
        </div>
      </div>
    </div>
  );
};

export default KeywordsStageChart;
