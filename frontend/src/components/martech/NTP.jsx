import { useState, useEffect, useRef } from 'react';
import { rowMatchesSearch, highlightText, Tooltip, createTooltipHandlers } from '../../utils/tableUtils';
import { getLogoPath, getTechIcon } from '../../utils/logoMap';

// Generic Custom Dropdown Component (without icons)
const CustomDropdown = ({ value, onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && 
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleButtonClick = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
    setIsOpen(!isOpen);
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <button
        ref={buttonRef}
        onClick={handleButtonClick}
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
      >
        <span>{value || 'All'}</span>
        <span style={{ fontSize: '12px' }}>▼</span>
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          style={{
            position: 'fixed',
            top: `${dropdownPos.top}px`,
            left: `${dropdownPos.left}px`,
            width: `${dropdownPos.width}px`,
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

// Custom Dropdown Component with Logos/Icons for Technology/Category
const CustomTechDropdown = ({ value, onChange, options, renderLogo }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && 
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleButtonClick = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
    setIsOpen(!isOpen);
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <button
        ref={buttonRef}
        onClick={handleButtonClick}
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
          gap: '8px',
          justifyContent: 'space-between'
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {value && renderLogo(value)}
          {value || 'All'}
        </span>
        <span style={{ fontSize: '12px' }}>▼</span>
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          style={{
            position: 'fixed',
            top: `${dropdownPos.top}px`,
            left: `${dropdownPos.left}px`,
            width: `${dropdownPos.width}px`,
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
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
              onMouseLeave={(e) => e.target.style.backgroundColor = value === option ? '#dbeafe' : 'white'}
            >
              {renderLogo(option)}
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const NTP = () => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    companyName: '',
    technology: '',
    purchasePrediction: '',
    category: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [modalContent, setModalContent] = useState(null);
  const [tooltip, setTooltip] = useState({ show: false, text: '', x: 0, y: 0 });

  // Render logo image or colored icon for technology
  const renderTechLogo = (techName) => {
    if (!techName) return null;
    
    const logoPath = getLogoPath(techName);
    
    // If logo exists, use it
    if (logoPath) {
      return (
        <img
          src={logoPath}
          alt={techName}
          title={techName}
          style={{
            width: '20px',
            height: '20px',
            marginRight: '6px',
            display: 'inline-block',
            verticalAlign: 'middle',
            objectFit: 'contain'
          }}
          onError={(e) => {
            // Fallback if image fails to load
            e.target.style.display = 'none';
          }}
        />
      );
    }
    
    // Otherwise use colored icon
    const iconData = getTechIcon(techName);
    if (iconData) {
      const { component: IconComponent, color } = iconData;
      return (
        <IconComponent
          size={16}
          style={{
            marginRight: '6px',
            display: 'inline-block',
            verticalAlign: 'middle',
            color: color,
            opacity: 0.85,
            filter: 'drop-shadow(0 0 0.5px rgba(0,0,0,0.1))'
          }}
          title={techName}
        />
      );
    }
    
    return null;
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const handleDownloadCSV = (dataToDownload) => {
    if (dataToDownload.length === 0) return;

    const headers = [
      'companyName', 'domain', 'category', 'technology',
      'purchaseProbability', 'purchasePrediction', 'ntpAnalysis'
    ];

    const csvContent = [
      headers.join(','),
      ...dataToDownload.map(row =>
        headers.map(header => `"${String(row[header] ?? '').replace(/"/g, '""')}"`).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'ntp_data.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/ntp');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setTableData(data);
      } catch (e) {
        setError(e.message);
        console.error("Failed to fetch NTP data:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getUniqueOptions = (key) => {
    if (!tableData) return [];
    const allValues = tableData.map(item => item[key]);
    return [...new Set(allValues)].sort();
  };

  const { handleMouseEnter, handleMouseLeave } = createTooltipHandlers(setTooltip);

  const filteredData = tableData
    .filter(row => {
      // Check if any filter is active
      const hasActiveFilters = Object.values(filters).some(val => val !== '');
      
      // If no filters are active, show all data
      if (!hasActiveFilters) {
        return !searchTerm || Object.values(row).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      // Apply active filters
      const filterMatches = Object.keys(filters).every(key => {
        if (!filters[key]) return true; // Skip empty filters
        const rowKey = key === 'companyName' ? 'companyName' : key;
        return String(row[rowKey]).toLowerCase() === String(filters[key]).toLowerCase();
      });

      const searchMatches = !searchTerm || Object.values(row).some(value =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      );

      return filterMatches && searchMatches;
    })
    .sort((a, b) => {
      const aMatches = rowMatchesSearch(a, searchTerm);
      const bMatches = rowMatchesSearch(b, searchTerm);
      if (aMatches && !bMatches) return -1;
      if (!aMatches && bMatches) return 1;
      return 0;
    });

  const handleAnalysisClick = (analysis) => {
    setModalContent(analysis);
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
          Loading NTP Data
        </h3>

        {/* Subtext */}
        <p style={{
          margin: '0 0 30px 0',
          color: '#6b7280',
          fontSize: '14px',
          textAlign: 'center',
          maxWidth: '300px'
        }}>
          Fetching and processing technology purchase predictions...
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
    <div className="ntp-container">
      <div className="header-actions">
        <h2>NTP®</h2>
        <div className="actions-right">
          <div className="search-bar">
            <svg className="search-folder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            </svg>
            <input 
              type="text" 
              placeholder="Search companies..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="10" cy="10" r="7"></circle>
              <path d="m20 20-4.5-4.5"></path>
            </svg>
          </div>
          <button className="download-csv-button" onClick={() => handleDownloadCSV(filteredData)}>
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
      
      <div className="filters">
        <div className="filter-group">
          <label>Company Name</label>
          <CustomDropdown
            value={filters.companyName}
            onChange={(value) => handleFilterChange('companyName', value)}
            options={getUniqueOptions('companyName')}
          />
        </div>
        
        <div className="filter-group">
          <label>Purchase Prediction</label>
          <CustomDropdown
            value={filters.purchasePrediction}
            onChange={(value) => handleFilterChange('purchasePrediction', value)}
            options={getUniqueOptions('purchasePrediction')}
          />
        </div>
        
        <div className="filter-group">
          <label>Category</label>
          <CustomTechDropdown
            value={filters.category}
            onChange={(value) => handleFilterChange('category', value)}
            options={getUniqueOptions('category')}
            renderLogo={renderTechLogo}
          />
        </div>

        <div className="filter-group">
          <label>Technology</label>
          <CustomTechDropdown
            value={filters.technology}
            onChange={(value) => handleFilterChange('technology', value)}
            options={getUniqueOptions('technology')}
            renderLogo={renderTechLogo}
          />
        </div>

      </div>
      
      <div className="table-container">
        <table>
          <thead className="sticky-header">
            <tr>
              <th>Company Name</th>
              <th>Category</th>
              <th>Technology</th>
              <th>Purchase Propensity (%)</th>
              <th>Purchase Prediction</th>
              <th>NTP Analysis</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, index) => {
              const isHighlighted = rowMatchesSearch(row, searchTerm);
              return (
                <tr key={index} style={{ backgroundColor: isHighlighted ? '#fefce8' : 'transparent' }}>
                  <td onMouseEnter={(e) => handleMouseEnter(e, row.companyName)} onMouseLeave={handleMouseLeave}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ fontWeight: '600', color: '#1f2937' }}>
                        {highlightText(row.companyName, searchTerm)}
                      </div>
                      <div style={{ fontSize: '13px', color: '#6b7280' }}>
                        {highlightText(row.domain, searchTerm)}
                      </div>
                    </div>
                  </td>
                  <td onMouseEnter={(e) => handleMouseEnter(e, row.category)} onMouseLeave={handleMouseLeave}>
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                      {renderTechLogo(row.category)}
                      {highlightText(row.category, searchTerm)}
                    </span>
                  </td>
                  <td onMouseEnter={(e) => handleMouseEnter(e, row.technology)} onMouseLeave={handleMouseLeave}>
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                      {renderTechLogo(row.technology)}
                      {highlightText(row.technology, searchTerm)}
                    </span>
                  </td>
                  <td onMouseEnter={(e) => handleMouseEnter(e, row.purchaseProbability)} onMouseLeave={handleMouseLeave}>
                    {highlightText(row.purchaseProbability, searchTerm)}
                  </td>
                  <td onMouseEnter={(e) => handleMouseEnter(e, row.purchasePrediction)} onMouseLeave={handleMouseLeave}>
                    {highlightText(row.purchasePrediction, searchTerm)}
                  </td>
                  <td 
                    onClick={() => handleAnalysisClick(row.ntpAnalysis)}
                    style={{ cursor: 'pointer', color: '#010810ff', textDecoration: 'underline' }}
                  >
                    {row.ntpAnalysis ? highlightText(`${row.ntpAnalysis.substring(0, 30)}...`, searchTerm) : 'N/A'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Tooltip tooltip={tooltip} />

      {modalContent && (
        <div className="modal-overlay" onClick={() => setModalContent(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>NTP Analysis</h3>
            <p>{modalContent}</p>
            <button onClick={() => setModalContent(null)}>Close</button>
          </div>
        </div>
      )}
      <style>{`
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
          padding: 10px 8px;
          text-align: left;
          border-bottom: 1px solid #ddd;
          overflow: hidden;
          text-overflow: ellipsis;
          cursor: default;
        }
        
        th:nth-child(1), td:nth-child(1) { width: 24%; white-space: normal; }
        th:nth-child(2), td:nth-child(2) { width: 15%; white-space: nowrap; }
        th:nth-child(3), td:nth-child(3) { width: 15%; white-space: nowrap; }
        th:nth-child(4), td:nth-child(4) { width: 15%; white-space: nowrap; }
        th:nth-child(5), td:nth-child(5) { width: 15%; white-space: nowrap; }
        th:nth-child(6), td:nth-child(6) { width: 16%; white-space: nowrap; }
        
        td { position: relative; }
        td:hover { background-color: #f9fafb; }
        
        th {
          background-color: #f8f9fa;
          font-weight: 600;
        }
        
        tr:hover {
          background-color: #f5f5f5;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          padding: 20px;
          border-radius: 8px;
          max-width: 500px;
          width: 90%;
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }

        .modal-content h3 {
          margin-top: 0;
        }

        .modal-content p {
          white-space: pre-wrap; /* Allows text to wrap inside the modal */
          word-break: break-word;
        }

        .modal-content button {
          margin-top: 15px;
          padding: 8px 16px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .modal-content button:hover {
          background-color: #0056b3;
        }
      `}</style>
    </div>
  );
};

export default NTP;
