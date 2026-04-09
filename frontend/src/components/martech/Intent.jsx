import apiFetch from '../../utils/apiFetch';
import { useState, useEffect, useRef } from 'react';
import { rowMatchesSearch, highlightText, Tooltip, createTooltipHandlers } from '../../utils/tableUtils';
import loadingGif from '../../assets/Data Loading GIF - Without Starhub.gif';
import IntentPieChart from './IntentPieChart';
import { FaLock, FaUnlock } from 'react-icons/fa';
import '../../styles/intent.css';

const IntentStatusVisualizer = ({ status }) => {
  const getStatusConfig = (status) => {
    const statusLower = String(status || '').toLowerCase().trim();
    
    // Greenfield: flat line in blue
    if (statusLower === 'greenfield' || statusLower === 'green field account') {
      return {
        type: 'line',
        color: '#3b82f6',
        bgColor: '#eff6ff',
        label: 'Greenfield'
      };
    } else if (statusLower === 'high') {
      return {
        type: 'bars',
        bars: 4,
        color: '#10b981',
        bgColor: '#ecfdf5',
        label: 'High'
      };
    } else if (statusLower === 'high-medium') {
      return {
        type: 'bars',
        bars: 3,
        color: '#34d399',
        bgColor: '#ecfdf5',
        label: 'High-Medium'
      };
    } else if (statusLower === 'medium') {
      return {
        type: 'bars',
        bars: 2,
        color: '#fbbf24',
        bgColor: '#fffbeb',
        label: 'Medium'
      };
    } else if (statusLower === 'low') {
      return {
        type: 'bars',
        bars: 1,
        color: '#f87171',
        bgColor: '#fef2f2',
        label: 'Low'
      };
    }
    
    return {
      type: 'bars',
      bars: 0,
      color: '#d1d5db',
      bgColor: '#f9fafb',
      label: 'Unknown'
    };
  };

  const config = getStatusConfig(status);

  return (
    <div
      className="status-visualizer"
      title={config.label}
    >
      {config.type === 'line' ? (
        <div
          className="status-visualizer-line"
          style={{
            backgroundColor: config.color,
            boxShadow: `0 2px 4px ${config.color}40`
          }}
        />
      ) : (
        [1, 2, 3, 4, 5].map((bar) => (
          <div
            key={bar}
            className="status-bar"
            style={{
              height: bar <= config.bars ? `${6 + bar * 4}px` : '4px',
              backgroundColor: bar <= config.bars ? config.color : '#e5e7eb',
              boxShadow: bar <= config.bars ? `0 2px 4px ${config.color}40` : 'none'
            }}
          />
        ))
      )}
    </div>
  );
};

const CustomDropdown = ({ value, onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="custom-dropdown-container">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="custom-dropdown-button"
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
      >
        <span>{value || 'All'}</span>
        <span className="custom-dropdown-arrow">▼</span>
      </button>

      {isOpen && (
        <div className="custom-dropdown-menu">
          <div
            onClick={() => {
              onChange('');
              setIsOpen(false);
            }}
            className={`custom-dropdown-item ${value === '' ? 'selected' : ''}`}
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
              className={`custom-dropdown-item ${value === option ? 'selected' : ''}`}
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
  const [filters, setFilters] = useState({
    accountName: [],
    intentStatus: []
  });
  const [tooltip, setTooltip] = useState({ show: false, text: '', x: 0, y: 0 });
  const [showFilters, setShowFilters] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [activeFilterMenu, setActiveFilterMenu] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [revealedRows, setRevealedRows] = useState(new Set());
  const [companySearchTerm, setCompanySearchTerm] = useState('');
  const rowsPerPage = 10;
  const filterRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiFetch('/api/intent');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setTableData(data);
      } catch (e) {
        setError(e.message);

        setTableData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const { handleMouseEnter, handleMouseLeave } = createTooltipHandlers(setTooltip);

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => {
      const currentValues = prev[filterName];
      if (currentValues.includes(value)) {

        return { ...prev, [filterName]: currentValues.filter(v => v !== value) };
      } else {

        return { ...prev, [filterName]: [...currentValues, value] };
      }
    });
    setCurrentPage(1);
  };

  const getUniqueOptions = (key) => {
    if (!tableData) return [];
    const allValues = tableData.map(item => item[key]);
    return [...new Set(allValues)].filter(v => v && v.trim()).sort();
  };

const getAccountCountByIntentStatus = (intentStatus) => {
    if (!tableData) return 0;
    const uniqueAccounts = new Set();
    tableData.forEach(row => {
      if (String(row.intentStatus).toLowerCase() === String(intentStatus).toLowerCase()) {
        uniqueAccounts.add(row.companyName);
      }
    });
    return uniqueAccounts.size;
  };

  const getPieChartData = () => {
    if (!tableData || tableData.length === 0) return [];
    
    const statusCounts = {};
    tableData.forEach(row => {
      // Only count rows with valid intent status (not null, undefined, or empty)
      if (row.intentStatus && String(row.intentStatus).trim()) {
        const status = String(row.intentStatus).trim();
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      }
    });

    const total = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);
    
    return Object.entries(statusCounts).map(([name, value]) => ({
      name,
      value,
      percentage: ((value / total) * 100).toFixed(1)
    }));
  };

  const hasMandatoryFilters = filters.intentStatus.length > 0;

  const filteredData = tableData
    .filter(row => {

      // Show all data by default (no mandatory filters required)
      if (filters.intentStatus.length > 0 && !filters.intentStatus.some(status => String(row.intentStatus).toLowerCase() === String(status).toLowerCase())) {
        return false;
      }

      if (filters.accountName.length > 0 && !filters.accountName.some(name => String(row.companyName).toLowerCase() === String(name).toLowerCase())) {
        return false;
      }

      const searchMatches = !searchTerm || Object.values(row).some(value =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      );

      return searchMatches;
    })
    .sort((a, b) => {
      // First priority: Sort by Intent Status (High > Medium > Low)
      const intentStatusOrder = { 'high': 0, 'medium': 1, 'low': 2 };
      const aStatus = String(a.intentStatus || '').toLowerCase();
      const bStatus = String(b.intentStatus || '').toLowerCase();
      const aOrder = intentStatusOrder[aStatus] !== undefined ? intentStatusOrder[aStatus] : 3;
      const bOrder = intentStatusOrder[bStatus] !== undefined ? intentStatusOrder[bStatus] : 3;
      
      if (aOrder !== bOrder) {
        return aOrder - bOrder;
      }

      // Secondary priority: Search term matches
      const aMatches = rowMatchesSearch(a, searchTerm);
      const bMatches = rowMatchesSearch(b, searchTerm);
      if (aMatches && !bMatches) return -1;
      if (!aMatches && bMatches) return 1;
      return 0;
    });

  useEffect(() => {

  }, []);

  const handleDownloadCSV = () => {
    let dataToDownload = selectedRows.size > 0 
      ? filteredData.filter((_, index) => selectedRows.has(index))
      : filteredData;

    // Filter to only include revealed companies
    dataToDownload = dataToDownload.filter((row) => {
      // Find the actual index in filteredData to create the correct rowKey
      const actualIndex = filteredData.indexOf(row);
      const rowKey = `${actualIndex}-${row.companyName}`;
      return revealedRows.has(rowKey);
    });

    if (dataToDownload.length === 0) {
      alert('No revealed companies to download. Please reveal company details first.');
      return;
    }

    const headers = ['companyName', 'intentStatus'];
    const csvContent = [
      headers.join(','),
      ...dataToDownload.map(row => headers.map(h => `"${String(row[h] ?? '').replace(/"/g, '""')}"`).join(','))
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

useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setActiveFilterMenu(null);
        setCompanySearchTerm('');
        setShowFilters(false);
      }
    };

    if (activeFilterMenu || showFilters) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [activeFilterMenu, showFilters]);

  if (loading) {
    return (
      <div className="loading-container">
        {/* Background Full Page Skeleton (blurred) */}
        <div className="loading-skeleton-bg">
          {/* Title Skeleton */}
          <div className="skeleton-title" />

          {/* Filter Bar Skeleton */}
          <div className="skeleton-filter-bar">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={`filter-${i}`} className="skeleton-filter-item" />
            ))}
          </div>

          {/* Divider */}
          <div className="skeleton-divider" />

          {/* Table Header Skeleton */}
          <div className="skeleton-table-header">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={`header-${i}`} className="skeleton-header-cell" />
            ))}
          </div>

          {/* Table Rows Skeleton */}
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(row => (
            <div key={`row-${row}`} className={`skeleton-table-row ${row % 2 === 0 ? 'even' : 'odd'}`}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(col => (
                <div key={`cell-${row}-${col}`} className="skeleton-cell" />
              ))}
            </div>
          ))}
        </div>

        {/* Centered Loading GIF */}
        <div className="loading-gif-container">
          <img 
            src={loadingGif} 
            alt="Loading" 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="intent-container">
      {showSummary && (
        <div className="modal-overlay" onClick={() => setShowSummary(false)}>
          <div className="summary-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="summary-modal-header">
              <h2>Intent Data Summary - Analytics Overview</h2>
              <button
                className="close-button"
                onClick={() => setShowSummary(false)}
              >
                ✕
              </button>
            </div>
            <div className="summary-charts-grid">
              <div className="chart-item">
                {/* <h3 style={{ textAlign: 'center', marginBottom: '16px' }}>Intent Status Percentage Breakdown</h3> */}
                <IntentPieChart data={getPieChartData()} />
              </div>
            </div>
          </div>
        </div>
      )}
      {}
      {error && (
        <div className="error-message">
          <div className="error-icon">⚠</div>
          <div className="error-text">
            Error fetching data: {error}. Showing UI with no data.
          </div>
          <button
            onClick={() => setError(null)}
            className="error-close-btn"
          >
            ✕
          </button>
        </div>
      )}

      <div className="header-actions-fixed">
        <h2>Intent</h2>
        <div className="actions-right">
        </div>
      </div>

      <div style={{ marginBottom: '20px' }} ref={filterRef}>
        <div className="filter-controls-container">
          <div className="filter-controls-left">
          {}
          <div className="filter-dropdown-wrapper-relative">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="filter-button"
            >
              <span>+ Filter</span>
            </button>

            {}
            {showFilters && (
              <div className="filter-menu">
                {[
                  { label: 'Company Name', key: 'accountName', mandatory: false }
                ].map((filterOption) => (
                  <div
                    key={filterOption.key}
                    onClick={() => {
                      setActiveFilterMenu(filterOption.key);
                      setShowFilters(false);
                    }}
                    className="filter-menu-item"
                  >
                    {filterOption.label}
                    {filterOption.mandatory && (
                      <span className="filter-menu-item mandatory-indicator">*</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {}
          {activeFilterMenu !== 'intentStatus' && (
            <div className="intent-status-filter-button">
              <button
                onClick={() => setActiveFilterMenu('intentStatus')}
                className="filter-button"
              >
                <span>Intent Status <span style={{ color: '#ef4444', fontWeight: '600' }}>*</span></span>
              </button>
            </div>
          )}

          {}
          {activeFilterMenu === 'accountName' && (
            <div className="filter-dropdown-wrapper">
              <div className="filter-dropdown-label">
                <span>Company Name</span>
                <button
                  onClick={() => {
                    setActiveFilterMenu(null);
                    setCompanySearchTerm('');
                    setFilters(prev => ({ ...prev, accountName: [] }));
                  }}
                  className="filter-close-button"
                >
                  ✕
                </button>
              </div>
              <div className="filter-dropdown-content">
                <div className="filter-dropdown-search">
                  <input
                    type="text"
                    placeholder="Search companies..."
                    value={companySearchTerm}
                    onChange={(e) => setCompanySearchTerm(e.target.value)}
                    className="company-search-input"
                  />
                </div>
                <div
                  onClick={() => {
                    if (Array.isArray(filters.accountName) && filters.accountName.length === getUniqueOptions('companyName').length && getUniqueOptions('companyName').length > 0) {

                      setFilters(prev => ({ ...prev, accountName: [] }));
                    } else {

                      setFilters(prev => ({ ...prev, accountName: getUniqueOptions('companyName') }));
                    }
                  }}
                  className="filter-option"
                >
                  <input
                    type="checkbox"
                    checked={Array.isArray(filters.accountName) && filters.accountName.length === getUniqueOptions('companyName').length && getUniqueOptions('companyName').length > 0}
                    onChange={() => {}}
                    className="filter-option-checkbox"
                  />
                  All
                </div>
                {getUniqueOptions('companyName')
                  .filter(company => company.toLowerCase().includes(companySearchTerm.toLowerCase()))
                  .map((option, idx) => {
                  const isSelected = Array.isArray(filters.accountName) && filters.accountName.includes(option);
                  return (
                    <div
                      key={idx}
                      onClick={() => handleFilterChange('accountName', option)}
                      className={`filter-option ${isSelected ? 'selected' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="filter-option-checkbox"
                      />
                      <span style={{ color: '#1f2937' }}>{option}</span>
                    </div>
                  );
                })}

                {getUniqueOptions('companyName').filter(company => company.toLowerCase().includes(companySearchTerm.toLowerCase())).length === 0 && getUniqueOptions('companyName').length > 0 && (
                  <div className="no-companies-found">
                    No companies found
                  </div>
                )}

                {}
                <div className="filter-dropdown-footer">
                  <button
                    onClick={() => {
                      setActiveFilterMenu(null);
                    }}
                    className="filter-save-button"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}

          {}
          {activeFilterMenu === 'intentStatus' && (
            <div className="filter-dropdown-wrapper">
              <div className="filter-dropdown-label active">
                <span>Intent Status <span style={{ color: '#ef4444', fontWeight: '600' }}>*</span></span>
                <button
                  onClick={() => {
                    setActiveFilterMenu(null);
                    setFilters(prev => ({ ...prev, intentStatus: [] }));
                  }}
                  className="filter-close-button"
                >
                  ✕
                </button>
              </div>
              <div className="filter-dropdown-content">
                <div
                  onClick={() => {
                    if (Array.isArray(filters.intentStatus) && filters.intentStatus.length === getUniqueOptions('intentStatus').length && getUniqueOptions('intentStatus').length > 0) {

                      setFilters(prev => ({ ...prev, intentStatus: [] }));
                    } else {

                      setFilters(prev => ({ ...prev, intentStatus: getUniqueOptions('intentStatus') }));
                    }
                  }}
                  className="filter-option"
                >
                  <input
                    type="checkbox"
                    checked={Array.isArray(filters.intentStatus) && filters.intentStatus.length === getUniqueOptions('intentStatus').length && getUniqueOptions('intentStatus').length > 0}
                    onChange={() => {}}
                    className="filter-option-checkbox"
                  />
                  All
                </div>
                {getUniqueOptions('intentStatus')
                  .sort((a, b) => {
                    const countA = getAccountCountByIntentStatus(a);
                    const countB = getAccountCountByIntentStatus(b);
                    return countB - countA;
                  })
                  .map((option, idx) => {
                  const isSelected = Array.isArray(filters.intentStatus) && filters.intentStatus.includes(option);
                  return (
                    <div
                      key={idx}
                      onClick={() => handleFilterChange('intentStatus', option)}
                      className={`filter-option ${isSelected ? 'selected' : ''}`}
                      style={{ justifyContent: 'space-between' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="filter-option-checkbox"
                        />
                        {option}
                      </div>
                      <span className="filter-option-count">
                        {getAccountCountByIntentStatus(option)}
                      </span>
                    </div>
                  );
                })}

                {}
                <div className="filter-dropdown-footer">
                  <button
                    onClick={() => {
                      setActiveFilterMenu(null);
                    }}
                    className="filter-save-button"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}

          {}
          {filters.accountName.length > 0 && activeFilterMenu !== 'accountName' && (
            <div className="filter-badge" onClick={() => setActiveFilterMenu('accountName')}>
              <span>Company Name: {filters.accountName.length} selected</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFilters(prev => ({ ...prev, accountName: [] }));
                }}
                className="filter-close-button"
              >
                ✕
              </button>
            </div>
          )}

          <div className="filter-controls-right">
            <button className="download-csv-button download-csv-button-wrapper" onClick={handleDownloadCSV}>
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
      </div>

      {}
      {/* Table always shows by default, no mandatory filter required */}

      <div className="table-container" style={{ maxHeight: '600px', height: '600px' }}>
        <table>
          <thead className="sticky-header">
            <tr>
              <th style={{ width: '40px', textAlign: 'center' }}>
                <input
                  type="checkbox"
                  checked={(() => {
                    const startIndex = (currentPage - 1) * rowsPerPage;
                    const endIndex = startIndex + rowsPerPage;
                    const currentPageRows = filteredData.slice(startIndex, endIndex);
                    return currentPageRows.length > 0 && currentPageRows.every((_, idx) => selectedRows.has(startIndex + idx));
                  })()}
                  onChange={(e) => {
                    const startIndex = (currentPage - 1) * rowsPerPage;
                    const endIndex = startIndex + rowsPerPage;
                    const currentPageRows = filteredData.slice(startIndex, endIndex);
                    
                    if (e.target.checked) {
                      const newSelected = new Set(selectedRows);
                      currentPageRows.forEach((_, idx) => newSelected.add(startIndex + idx));
                      setSelectedRows(newSelected);
                    } else {
                      const newSelected = new Set(selectedRows);
                      currentPageRows.forEach((_, idx) => newSelected.delete(startIndex + idx));
                      setSelectedRows(newSelected);
                    }
                  }}
                  style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                />
              </th>
              <th style={{ textAlign: 'center', padding: '12px 8px', width: '120px' }}>
                <button
                  onClick={() => {
                    if (selectedRows.size === 0) {
                      alert('Please select at least one company to reveal');
                      return;
                    }
                    setRevealedRows(prev => {
                      const newSet = new Set(prev);
                      
                      selectedRows.forEach(rowIndex => {
                        const rowData = filteredData[rowIndex];
                        if (rowData) {
                          const rowKey = `${rowIndex}-${rowData.companyName}`;
                          newSet.add(rowKey);
                        }
                      });
                      return newSet;
                    });
                  }}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: selectedRows.size > 0 ? '#3b82f6' : '#d1d5db',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: selectedRows.size > 0 ? 'pointer' : 'not-allowed',
                    fontSize: '13px',
                    fontWeight: '600',
                    transition: 'all 0.2s',
                    opacity: selectedRows.size > 0 ? 1 : 0.6
                  }}
                  onMouseEnter={(e) => {
                    if (selectedRows.size > 0) {
                      e.currentTarget.style.backgroundColor = '#1d4ed8';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedRows.size > 0) {
                      e.currentTarget.style.backgroundColor = '#3b82f6';
                    }
                  }}
                  title={selectedRows.size > 0 ? `Reveal ${selectedRows.size} selected companies` : 'Select companies to reveal'}
                >
                  Unlock
                </button>
              </th>
              <th>Company Name</th>
              <th>Intent Status</th>
              <th>Intent Level</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              const totalPages = Math.ceil(filteredData.length / rowsPerPage);
              const startIndex = (currentPage - 1) * rowsPerPage;
              const endIndex = startIndex + rowsPerPage;
              const paginatedData = filteredData.slice(startIndex, endIndex);

              return paginatedData.map((row, idx) => {
                const isHighlighted = rowMatchesSearch(row, searchTerm);
                const actualIndex = startIndex + idx;
                const rowKey = `${actualIndex}-${row.companyName}`;
                const isRevealed = revealedRows.has(rowKey);
                return (
                  <tr key={idx} className={isHighlighted ? 'table-row-highlighted' : 'table-row-normal'}>
                    <td style={{ width: '40px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={selectedRows.has(actualIndex)}
                        onChange={(e) => {
                          const newSet = new Set(selectedRows);
                          if (e.target.checked) {
                            newSet.add(actualIndex);
                          } else {
                            newSet.delete(actualIndex);
                          }
                          setSelectedRows(newSet);
                        }}
                        style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                      />
                    </td>
                    <td style={{ textAlign: 'center', width: '80px' }}>
                      <button
                        onClick={() => {
                          setRevealedRows(prev => {
                            const newSet = new Set(prev);
                            newSet.add(rowKey);
                            return newSet;
                          });
                        }}
                        className={`reveal-button ${isRevealed ? 'reveal-button-unlocked' : 'reveal-button-locked'}`}
                        onMouseEnter={(e) => {
                          if (!isRevealed) {
                            e.currentTarget.style.backgroundColor = '#f3f4f6';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isRevealed) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }
                        }}
                        title={isRevealed ? 'Company details revealed' : 'Reveal company details'}
                      >
                        {isRevealed ? (
                          <FaUnlock size={16} style={{ color: '#9ca3af' }} title="Company details revealed" />
                        ) : (
                          <FaLock size={16} style={{ color: '#1f2937' }} title="Click to reveal company details" />
                        )}
                      </button>
                    </td>
                    <td onMouseEnter={(e) => isRevealed && handleMouseEnter(e, row.companyName)} onMouseLeave={handleMouseLeave}>
                      {isRevealed ? (
                        <div className="company-name-revealed">
                          {row.companyName}
                        </div>
                      ) : (
                        <div className="company-name-blurred">
                          <FaLock size={14} style={{ color: '#6b7280', filter: 'blur(0px)' }} />
                          <span>••••••••••••••••••</span>
                        </div>
                      )}
                    </td>
                    <td onMouseEnter={(e) => handleMouseEnter(e, row.intentStatus)} onMouseLeave={handleMouseLeave}>
                      {highlightText(row.intentStatus, searchTerm)}
                    </td>
                    <td className="table-cell-center">
                      <IntentStatusVisualizer status={row.intentStatus} />
                    </td>
                  </tr>
                );
              });
            })()}
          </tbody>
        </table>
      </div>

      {}
      {filteredData.length > rowsPerPage && (
      <div className="pagination-container">
          <div className="pagination-info">
              Page {currentPage} of {Math.ceil(filteredData.length / rowsPerPage).toLocaleString()}
          </div>

          {}
          <div className="pagination-controls">
              {(() => {
                  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
                  const maxPagesToShow = 5;
                  let startPage = 1;
                  let endPage = Math.min(maxPagesToShow, totalPages);

                  if (currentPage > maxPagesToShow) {
                      startPage = currentPage - Math.floor(maxPagesToShow / 2);
                      endPage = startPage + maxPagesToShow - 1;

                      if (endPage > totalPages) {
                          endPage = totalPages;
                          startPage = Math.max(1, endPage - maxPagesToShow + 1);
                      }
                  }

                  return (
                      <>
                          {}
                          <button
                              key="first"
                              onClick={() => setCurrentPage(1)}
                              disabled={currentPage === 1}
                              className={`pagination-button ${currentPage === 1 ? 'disabled' : ''}`}
                              title="First page"
                          >
                              &laquo;
                              </button>

                          {}
                          <button
                              key="prev"
                              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                              disabled={currentPage === 1}
                              className={`pagination-button ${currentPage === 1 ? 'disabled' : ''}`}
                              title="Previous page"
                          >
                              &lsaquo;
                              </button>

                          {}
                          {startPage > 1 && (
                              <>
                                  <button
                                      key={1}
                                      onClick={() => setCurrentPage(1)}
                                      className="pagination-button"
                                  >
                                      1
                                  </button>
                                  {startPage > 2 && <span className="pagination-ellipsis">...</span>}
                              </>
                          )}

                          {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(i => (
                              <button
                                  key={i}
                                  onClick={() => setCurrentPage(i)}
                                  className={`pagination-button ${i === currentPage ? 'active' : ''}`}
                              >
                                  {i}
                              </button>
                          ))}

                          {endPage < totalPages && (
                              <>
                                  {endPage < totalPages - 1 && <span className="pagination-ellipsis">...</span>}
                                  <button
                                      key={totalPages}
                                      onClick={() => setCurrentPage(totalPages)}
                                      className="pagination-button"
                                  >
                                      {totalPages}
                                  </button>
                              </>
                          )}

                          {}
                          <button
                              key="next"
                              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                              disabled={currentPage === totalPages}
                              className={`pagination-button ${currentPage === totalPages ? 'disabled' : ''}`}
                              title="Next page"
                          >
                              &rsaquo;
                              </button>

                          {}
                          <button
                              key="last"
                              onClick={() => setCurrentPage(totalPages)}
                              disabled={currentPage === totalPages}
                              className={`pagination-button ${currentPage === totalPages ? 'disabled' : ''}`}
                              title="Last page"
                          >
                              &raquo;
                              </button>
                      </>
                  );
              })()}
          </div>

          <div style={{ minWidth: '120px' }} />
      </div>
      )}
      </div>

      <Tooltip tooltip={tooltip} />

    </div>
  );
};

export default Intent;