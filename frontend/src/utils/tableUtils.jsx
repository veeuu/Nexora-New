// Shared utility functions for table components

// Helper function to check if a row matches search term
export const rowMatchesSearch = (row, searchTerm) => {
  if (!searchTerm) return false;
  return Object.values(row).some(value =>
    String(value).toLowerCase().includes(searchTerm.toLowerCase())
  );
};

// Helper function to highlight matching text
export const highlightText = (text, search) => {
  if (!search || !text) return text;
  const textStr = String(text);
  const searchLower = search.toLowerCase();
  const textLower = textStr.toLowerCase();
  const index = textLower.indexOf(searchLower);
  
  if (index === -1) return textStr;
  
  const before = textStr.substring(0, index);
  const match = textStr.substring(index, index + search.length);
  const after = textStr.substring(index + search.length);
  
  return (
    <>
      {before}
      <span style={{ backgroundColor: '#fef08a', fontWeight: '600', padding: '2px 4px', borderRadius: '2px' }}>
        {match}
      </span>
      {after}
    </>
  );
};

// Tooltip component
export const Tooltip = ({ tooltip }) => {
  if (!tooltip.show) return null;
  
  return (
    <div
      style={{
        position: 'fixed',
        left: `${tooltip.x}px`,
        top: `${tooltip.y}px`,
        backgroundColor: 'white',
        color: '#1f2937',
        padding: '8px 12px',
        borderRadius: '6px',
        fontSize: '13px',
        fontWeight: '500',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        border: '1px solid #e5e7eb',
        zIndex: 1000,
        pointerEvents: 'none',
        maxWidth: '300px',
        wordWrap: 'break-word',
        whiteSpace: 'normal',
        lineHeight: '1.4'
      }}
    >
      {tooltip.text}
      <div
        style={{
          position: 'absolute',
          top: '-5px',
          right: '20px',
          width: 0,
          height: 0,
          borderLeft: '5px solid transparent',
          borderRight: '5px solid transparent',
          borderBottom: '5px solid white'
        }}
      />
    </div>
  );
};

// Tooltip handlers
export const createTooltipHandlers = (setTooltip) => ({
  handleMouseEnter: (e, text) => {
    const rect = e.target.getBoundingClientRect();
    setTooltip({
      show: true,
      text: text,
      x: rect.right - 20,
      y: rect.bottom + 10
    });
  },
  handleMouseLeave: () => {
    setTooltip({ show: false, text: '', x: 0, y: 0 });
  }
});

// Common table styles
export const tableStyles = `
  .table-container {
    max-height: 400px;
    overflow-x: auto;
    overflow-y: auto;
    position: relative;
  }
  
  .sticky-header {
    position: sticky;
    top: 0;
    background-color: #fff;
    z-index: 10;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .sticky-header th {
    position: sticky;
    top: 0;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
  }
  
  th, td {
    padding: 12px 15px;
    text-align: left;
    border-bottom: 1px solid #ddd;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: default;
  }
  
  td {
    position: relative;
  }
  
  td:hover {
    background-color: #f9fafb;
  }
  
  th {
    background-color: #f8f9fa;
    font-weight: 600;
  }
  
  tr:hover {
    background-color: #f5f5f5;
  }
`;
