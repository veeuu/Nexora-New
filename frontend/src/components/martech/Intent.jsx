import { useState, useEffect } from 'react';
import { rowMatchesSearch, highlightText, Tooltip, createTooltipHandlers } from '../../utils/tableUtils';

// Generic Custom Dropdown Component (without icons)
const CustomDropdown = ({ value, onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '10px 12px',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          fontSize: '14px',
          fontFamily: 'inherit',
          backgroundColor: 'white',
          cursor: 'pointer',
          transition: 'border-color 0.2s',
          textAlign: 'left',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
      >
        <span>{value || 'All'}</span>
        <span style={{ fontSize: '12px' }}>▼</span>
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: 'white',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            marginTop: '4px',
            maxHeight: '300px',
            overflowY: 'auto',
            zIndex: 1000,
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}
        >
          <div
            onClick={() => {
              onChange('');
              setIsOpen(false);
            }}
            style={{
              padding: '10px 12px',
              cursor: 'pointer',
              backgroundColor: value === '' ? '#f3f4f6' : 'white',
              borderBottom: '1px solid #e5e7eb',
              fontSize: '14px'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
            onMouseLeave={(e) => e.target.style.backgroundColor = value === '' ? '#f3f4f6' : 'white'}
          >
            All
          </div>
          {options.map((option, idx) => (
            <div
              key={idx}
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              style={{
                padding: '10px 12px',
                cursor: 'pointer',
                backgroundColor: value === option ? '#dbeafe' : 'white',
                borderBottom: '1px solid #e5e7eb',
                fontSize: '14px'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
              onMouseLeave={(e) => e.target.style.backgroundColor = value === option ? '#dbeafe' : 'white'}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


const Intent = () => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [tooltip, setTooltip] = useState({ show: false, text: '', x: 0, y: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/intent');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setTableData(data);
      } catch (e) {
        setError(e.message);
        console.error("Failed to fetch Intent data:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const { handleMouseEnter, handleMouseLeave } = createTooltipHandlers(setTooltip);

  const filteredData = tableData
    .filter(row => {
      const searchMatch = !searchTerm || Object.values(row).some(val => String(val).toLowerCase().includes(searchTerm.toLowerCase()));
      const statusMatch = !selectedStatus || row.intentStatus === selectedStatus;
      return searchMatch && statusMatch;
    })
    .sort((a, b) => {
      const aMatches = rowMatchesSearch(a, searchTerm);
      const bMatches = rowMatchesSearch(b, searchTerm);
      if (aMatches && !bMatches) return -1;
      if (!aMatches && bMatches) return 1;
      return 0;
    });

  const getUniqueIntentStatuses = () => {
    if (!tableData) return [];
    const statuses = tableData.map(item => item.intentStatus).filter(status => status && status.trim());
    return [...new Set(statuses)].sort();
  };

  useEffect(() => {
    // Cleanup if needed
  }, []);

  const handleDownloadCSV = () => {
    if (filteredData.length === 0) return;
    const headers = ['companyName', 'intentStatus'];
    const csvContent = [
      headers.join(','),
      ...filteredData.map(row => headers.map(h => `"${String(row[h] ?? '').replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'intent_data.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '600px',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        padding: '40px 20px'
      }}>
        {/* Loading Text */}
        <h3 style={{
          margin: '0 0 10px 0',
          color: '#1f2937',
          fontSize: '18px',
          fontWeight: '600'
        }}>
          Loading Intent Data
        </h3>

        {/* Subtext */}
        <p style={{
          margin: '0 0 30px 0',
          color: '#6b7280',
          fontSize: '14px',
          textAlign: 'center',
          maxWidth: '300px'
        }}>
          Fetching and processing company intent signals...
        </p>

        {/* Progress Dots */}
        <div style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#3b82f6',
            animation: 'bounce 1.4s infinite'
          }} />
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#3b82f6',
            animation: 'bounce 1.4s infinite 0.2s'
          }} />
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#3b82f6',
            animation: 'bounce 1.4s infinite 0.4s'
          }} />
        </div>

        {/* Styles for animations */}
        <style>{`
          @keyframes bounce {
            0%, 80%, 100% {
              opacity: 0.3;
              transform: translateY(0);
            }
            40% {
              opacity: 1;
              transform: translateY(-10px);
            }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return <div>Error fetching data: {error}</div>;
  }

  return (
    <div className="intent-container">
      <div className="header-actions">
        <h2>Intent Data</h2>
        <div className="actions-right" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div className="search-bar">
            <svg className="search-folder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            </svg>
            <input
              type="text"
              placeholder="Search by Company Name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="10" cy="10" r="7"></circle>
              <path d="m20 20-4.5-4.5"></path>
            </svg>
          </div>
          <button className="download-csv-button" onClick={handleDownloadCSV}>
            <svg className="csv-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="12" y1="13" x2="12" y2="17"></line>
              <line x1="8" y1="13" x2="8" y2="17"></line>
              <line x1="16" y1="13" x2="16" y2="17"></line>
            </svg>
            Download CSV
          </button>
        </div>
      </div>

      <div className="section-subtle-divider" />

      {/* Dropdown filter commented out */}
      {/* <div className="filters">
        <div className="filter-group">
          <label>Intent Status (Dropdown)</label>
          <CustomDropdown
            value={selectedStatus}
            onChange={(value) => setSelectedStatus(value)}
            options={getUniqueIntentStatuses()}
          />
        </div>
      </div> */}

      <div className="table-container" style={{ backgroundColor: '#e8eef7' }}>
        <table>
          <thead className="sticky-header">
            <tr>
              <th>Account Name</th>
              <th>Intent Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, idx) => {
              const isHighlighted = rowMatchesSearch(row, searchTerm);
              return (
                <tr key={idx} style={{ backgroundColor: isHighlighted ? '#fefce8' : 'transparent' }}>
                  <td onMouseEnter={(e) => handleMouseEnter(e, row.companyName)} onMouseLeave={handleMouseLeave}>
                    {highlightText(row.companyName, searchTerm)}
                  </td>
                  <td onMouseEnter={(e) => handleMouseEnter(e, row.intentStatus)} onMouseLeave={handleMouseLeave}>
                    {highlightText(row.intentStatus, searchTerm)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Tooltip tooltip={tooltip} />

      <style jsx>{`
        .filters {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
          margin-bottom: 20px;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-width: 150px;
          max-width: 250px;
        }

        .filter-group label {
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        }

        .table-container {
          max-height: 400px;
          overflow-x: auto;
          overflow-y: auto;
          position: relative;
          display: flex;
          justify-content: center;
        }

        .sticky-header {
          position: sticky;
          top: 0;
          background-color: #fff;
          z-index: 10;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        table {
          width: 100%;
          border-collapse: collapse;
          table-layout: auto;
        }

        th, td {
          padding: 12px 15px;
          border-bottom: 1px solid #ddd;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          cursor: default;
          background-color: #f8f9fa;
        }

        th {
          text-align: left;
          background-color: #f8f9fa;
        }

        td {
          text-align: left;
          overflow: hidden;
        }

        th:nth-child(1), td:nth-child(1) { width: 50%; }
        th:nth-child(2), td:nth-child(2) { width: 50%; }

        td { position: relative; }

        td:hover { background-color: #f9fafb; }

        th { font-weight: 600; background-color: #e8eef7 !important; }

        tbody tr:hover { background-color: #f5f5f5; }
      `}</style>
    </div>
  );
};

export default Intent;
