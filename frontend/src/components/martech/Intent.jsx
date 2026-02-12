import { useState, useEffect, useRef } from 'react';
import { rowMatchesSearch, highlightText, Tooltip, createTooltipHandlers } from '../../utils/tableUtils';
import nexoraLogo from '../../assets/nexora-logo.png';

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
  const [filters, setFilters] = useState({
    accountName: [],
    intentStatus: []
  });
  const [tooltip, setTooltip] = useState({ show: false, text: '', x: 0, y: 0 });
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilterMenu, setActiveFilterMenu] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 9;
  const filterRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/intent');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setTableData(data);
      } catch (e) {
        setError(e.message);
        console.error("Failed to fetch Intent data:", e);
        setTableData([]); // Set empty data on error
      } finally {
        // Add 2-second delay before hiding loading screen
        setTimeout(() => {
          setLoading(false);
        }, 2000);
      }
    };

    fetchData();
  }, []);

  const { handleMouseEnter, handleMouseLeave } = createTooltipHandlers(setTooltip);

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => {
      const currentValues = prev[filterName];
      if (currentValues.includes(value)) {
        // Remove if already selected
        return { ...prev, [filterName]: currentValues.filter(v => v !== value) };
      } else {
        // Add if not selected
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

  // Helper function to count accounts by intent status
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

  const hasMandatoryFilters = filters.intentStatus.length > 0;

  const filteredData = tableData
    .filter(row => {
      // Intent Status is mandatory
      if (filters.intentStatus.length === 0) {
        return false;
      }

      // Check if Intent Status matches any selected status
      if (!filters.intentStatus.some(status => String(row.intentStatus).toLowerCase() === String(status).toLowerCase())) {
        return false;
      }

      // Apply optional Account Name filter (if any selected, must match one)
      if (filters.accountName.length > 0 && !filters.accountName.some(name => String(row.companyName).toLowerCase() === String(name).toLowerCase())) {
        return false;
      }

      // Apply search term
      const searchMatches = !searchTerm || Object.values(row).some(value =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      );

      return searchMatches;
    })
    .sort((a, b) => {
      const aMatches = rowMatchesSearch(a, searchTerm);
      const bMatches = rowMatchesSearch(b, searchTerm);
      if (aMatches && !bMatches) return -1;
      if (!aMatches && bMatches) return 1;
      return 0;
    });

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

  // Handle click outside to close filter dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setActiveFilterMenu(null);
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
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '800px',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        padding: '40px 20px'
      }}>
        {/* Nexora Logo */}
        <img src={nexoraLogo} alt="Nexora Logo" style={{width: '250px', height: 'auto', marginBottom: '30px', objectFit: 'contain'}} />

        {/* Loading Text */}
        <h3 style={{
          margin: '0 0 10px 0',
          color: '#1f2937',
          fontSize: '18px',
          fontWeight: '600'
        }}>
          
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

  return (
    <div className="intent-container">
      {/* Error Banner */}
      {error && (
        <div style={{
          backgroundColor: '#fee2e2',
          border: '1px solid #fca5a5',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            fontSize: '18px',
            color: '#dc2626',
            flexShrink: 0
          }}>
            ⚠
          </div>
          <div style={{
            fontSize: '14px',
            color: '#991b1b',
            fontWeight: '500'
          }}>
            Error fetching data: {error}. Showing UI with no data.
          </div>
          <button
            onClick={() => setError(null)}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '18px',
              color: '#991b1b',
              padding: '0',
              lineHeight: '1'
            }}
          >
            ✕
          </button>
        </div>
      )}
      
      <div className="header-actions">
        <h2 style={{ fontSize: '32px', fontWeight: '700' }}>Intent Data</h2>
        <div className="actions-right" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginLeft: 'auto' }}>
          {/* <div className="search-bar">
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
          </div> */}
        </div>
      </div>

      <div className="section-subtle-divider" />

      <div style={{ marginBottom: '20px' }} ref={filterRef}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Filter Button */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                padding: '8px 14px',
                backgroundColor: 'white',
                color: '#3b82f6',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#f3f4f6';
                e.target.style.borderColor = '#3b82f6';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'white';
                e.target.style.borderColor = '#d1d5db';
              }}
            >
              <span>+ Filter</span>
            </button>

            {/* Filter Menu Dropdown */}
            {showFilters && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: '8px',
                  backgroundColor: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  zIndex: 1000,
                  minWidth: '200px'
                }}
              >
                {[
                  { label: 'Company Name', key: 'accountName', mandatory: false }
                ].map((filterOption) => (
                  <div
                    key={filterOption.key}
                    onClick={() => {
                      setActiveFilterMenu(filterOption.key);
                      setShowFilters(false);
                    }}
                    style={{
                      padding: '12px 16px',
                      cursor: 'pointer',
                      borderBottom: '1px solid #e5e7eb',
                      fontSize: '14px',
                      color: '#1f2937',
                      transition: 'background-color 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                  >
                    {filterOption.label}
                    {filterOption.mandatory && (
                      <span style={{ color: '#ef4444', fontWeight: '600', fontSize: '16px' }}>*</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Intent Status Filter - Always Visible (Mandatory) */}
          {activeFilterMenu !== 'intentStatus' && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setActiveFilterMenu('intentStatus')}
                style={{
                  padding: '8px 14px',
                  backgroundColor: 'white',
                  color: '#3b82f6',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f3f4f6';
                  e.target.style.borderColor = '#3b82f6';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'white';
                  e.target.style.borderColor = '#d1d5db';
                }}
              >
                <span>Intent Status {Array.isArray(filters.intentStatus) && filters.intentStatus.length > 0 && `(${filters.intentStatus.length})`} <span style={{ color: '#ef4444', fontWeight: '600' }}>*</span></span>
              </button>
            </div>
          )}

          {/* Account Name Filter Chip */}
          {activeFilterMenu === 'accountName' && (
            <div style={{ position: 'relative' }}>
              <div style={{
                backgroundColor: '#f0f9ff',
                border: '1px solid #bfdbfe',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#1e40af'
              }}>
                <span>Company Name {Array.isArray(filters.accountName) && filters.accountName.length > 0 && `(${filters.accountName.length})`}</span>
                <button
                  onClick={() => {
                    setActiveFilterMenu(null);
                    setFilters(prev => ({ ...prev, accountName: [] }));
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '16px',
                    padding: '0',
                    color: '#1e40af',
                    lineHeight: '1'
                  }}
                >
                  ✕
                </button>
              </div>
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: '8px',
                backgroundColor: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                zIndex: 1000,
                minWidth: '250px',
                maxHeight: '300px',
                overflowY: 'auto'
              }}>
                <div
                  onClick={() => {
                    if (Array.isArray(filters.accountName) && filters.accountName.length === getUniqueOptions('companyName').length && getUniqueOptions('companyName').length > 0) {
                      // If all are selected, deselect all
                      setFilters(prev => ({ ...prev, accountName: [] }));
                    } else {
                      // Otherwise select all
                      setFilters(prev => ({ ...prev, accountName: getUniqueOptions('companyName') }));
                    }
                  }}
                  style={{
                    padding: '10px 12px',
                    cursor: 'pointer',
                    backgroundColor: 'white',
                    borderBottom: '1px solid #e5e7eb',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                >
                  <input
                    type="checkbox"
                    checked={Array.isArray(filters.accountName) && filters.accountName.length === getUniqueOptions('companyName').length && getUniqueOptions('companyName').length > 0}
                    onChange={() => {}}
                    style={{
                      width: '16px',
                      height: '16px',
                      cursor: 'pointer',
                      accentColor: '#3b82f6'
                    }}
                  />
                  All
                </div>
                {getUniqueOptions('companyName').map((option, idx) => {
                  const isSelected = Array.isArray(filters.accountName) && filters.accountName.includes(option);
                  return (
                    <div
                      key={idx}
                      onClick={() => handleFilterChange('accountName', option)}
                      style={{
                        padding: '10px 12px',
                        cursor: 'pointer',
                        backgroundColor: isSelected ? '#dbeafe' : 'white',
                        borderBottom: '1px solid #e5e7eb',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = isSelected ? '#dbeafe' : 'white'}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        style={{
                          width: '16px',
                          height: '16px',
                          cursor: 'pointer',
                          accentColor: '#3b82f6'
                        }}
                      />
                      {option}
                    </div>
                  );
                })}

                {/* Save Button */}
                <div style={{
                  padding: '12px',
                  borderTop: '1px solid #e5e7eb',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '8px',
                  backgroundColor: '#f9fafb',
                  position: 'sticky',
                  bottom: 0
                }}>
                  <button
                    onClick={() => {
                      setActiveFilterMenu(null);
                    }}
                    style={{
                      padding: '6px 16px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '500',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Intent Status Filter Chip */}
          {activeFilterMenu === 'intentStatus' && (
            <div style={{ position: 'relative' }}>
              <div style={{
                backgroundColor: '#dbeafe',
                border: '1px solid #93c5fd',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#1e40af'
              }}>
                <span>Intent Status {Array.isArray(filters.intentStatus) && filters.intentStatus.length > 0 && `(${filters.intentStatus.length})`} <span style={{ color: '#ef4444', fontWeight: '600' }}>*</span></span>
                <button
                  onClick={() => {
                    setActiveFilterMenu(null);
                    setFilters(prev => ({ ...prev, intentStatus: [] }));
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '16px',
                    padding: '0',
                    color: '#1e40af',
                    lineHeight: '1'
                  }}
                >
                  ✕
                </button>
              </div>
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: '8px',
                backgroundColor: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                zIndex: 1000,
                minWidth: '250px',
                maxHeight: '300px',
                overflowY: 'auto'
              }}>
                <div
                  onClick={() => {
                    if (Array.isArray(filters.intentStatus) && filters.intentStatus.length === getUniqueOptions('intentStatus').length && getUniqueOptions('intentStatus').length > 0) {
                      // If all are selected, deselect all
                      setFilters(prev => ({ ...prev, intentStatus: [] }));
                    } else {
                      // Otherwise select all
                      setFilters(prev => ({ ...prev, intentStatus: getUniqueOptions('intentStatus') }));
                    }
                  }}
                  style={{
                    padding: '10px 12px',
                    cursor: 'pointer',
                    backgroundColor: 'white',
                    borderBottom: '1px solid #e5e7eb',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                >
                  <input
                    type="checkbox"
                    checked={Array.isArray(filters.intentStatus) && filters.intentStatus.length === getUniqueOptions('intentStatus').length && getUniqueOptions('intentStatus').length > 0}
                    onChange={() => {}}
                    style={{
                      width: '16px',
                      height: '16px',
                      cursor: 'pointer',
                      accentColor: '#3b82f6'
                    }}
                  />
                  All
                </div>
                {getUniqueOptions('intentStatus').map((option, idx) => {
                  const isSelected = Array.isArray(filters.intentStatus) && filters.intentStatus.includes(option);
                  return (
                    <div
                      key={idx}
                      onClick={() => handleFilterChange('intentStatus', option)}
                      style={{
                        padding: '10px 12px',
                        cursor: 'pointer',
                        backgroundColor: isSelected ? '#dbeafe' : 'white',
                        borderBottom: '1px solid #e5e7eb',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        justifyContent: 'space-between'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = isSelected ? '#dbeafe' : 'white'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          style={{
                            width: '16px',
                            height: '16px',
                            cursor: 'pointer',
                            accentColor: '#3b82f6'
                          }}
                        />
                        {option}
                      </div>
                      <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
                        {getAccountCountByIntentStatus(option)}
                      </span>
                    </div>
                  );
                })}

                {/* Save Button */}
                <div style={{
                  padding: '12px',
                  borderTop: '1px solid #e5e7eb',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '8px',
                  backgroundColor: '#f9fafb',
                  position: 'sticky',
                  bottom: 0
                }}>
                  <button
                    onClick={() => {
                      setActiveFilterMenu(null);
                    }}
                    style={{
                      padding: '6px 16px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '500',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Display saved filter tags */}
          {filters.accountName.length > 0 && activeFilterMenu !== 'accountName' && (
            <div style={{
              backgroundColor: '#f0f9ff',
              border: '1px solid #bfdbfe',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#1e40af',
              cursor: 'pointer'
            }}
            onClick={() => setActiveFilterMenu('accountName')}
            >
              <span>Company Name: {filters.accountName.length} selected</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFilters(prev => ({ ...prev, accountName: [] }));
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px',
                  padding: '0',
                  color: '#1e40af',
                  lineHeight: '1'
                }}
              >
                ✕
              </button>
            </div>
          )}

          {/* Download CSV Button - Show in filter row only when warning message is hidden */}
          {filters.intentStatus.length > 0 && (
            <button className="download-csv-button" onClick={handleDownloadCSV} style={{ flexShrink: 0 }}>
              <svg className="csv-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="12" y1="13" x2="12" y2="17"></line>
                <line x1="8" y1="13" x2="8" y2="17"></line>
                <line x1="16" y1="13" x2="16" y2="17"></line>
              </svg>
              Download CSV
            </button>
          )}
        </div>
      </div>

      {/* Message for mandatory filter */}
      {filters.intentStatus.length === 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '20px',
          marginTop: '24px',
          justifyContent: 'space-between'
        }}>
          <div style={{
            backgroundColor: '#fef3c7',
            border: '1px solid #fcd34d',
            borderRadius: '8px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            maxWidth: 'fit-content'
          }}>
            <div style={{
              fontSize: '18px',
              color: '#d97706',
              flexShrink: 0
            }}>
              ⓘ
            </div>
            <div style={{
              fontSize: '13px',
              color: '#92400e',
              fontWeight: '500'
            }}>
              Please select an Intent Status to view data
            </div>
          </div>
          <button className="download-csv-button" onClick={handleDownloadCSV} style={{ flexShrink: 0 }}>
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
      )}

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

      <div className="table-container" style={{ backgroundColor: '#e8eef7', marginTop: '24px' }}>
        <table>
          <thead className="sticky-header">
            <tr>
              <th>Company Name</th>
              <th>Intent Status</th>
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
              });
            })()}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {filteredData.length > rowsPerPage && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
          marginTop: '20px',
          marginBottom: '20px'
        }}>
          {(() => {
            const totalPages = Math.ceil(filteredData.length / rowsPerPage);
            const pages = [];
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
                <button
                  key="prev"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  style={{
                    padding: '8px 12px',
                    border: 'none',
                    borderRadius: '6px',
                    backgroundColor: currentPage === 1 ? '#f3f4f6' : '#f9fafb',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    fontSize: '16px',
                    color: currentPage === 1 ? '#d1d5db' : '#6b7280',
                    fontWeight: '600',
                    transition: 'all 0.2s',
                    opacity: currentPage === 1 ? 0.5 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (currentPage > 1) {
                      e.target.style.backgroundColor = '#e5e7eb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentPage > 1) {
                      e.target.style.backgroundColor = '#f9fafb';
                    }
                  }}
                >
                  ← Prev
                </button>

                {startPage > 1 && (
                  <>
                    <button
                      key={1}
                      onClick={() => setCurrentPage(1)}
                      style={{
                        padding: '8px 14px',
                        border: 'none',
                        borderRadius: '8px',
                        backgroundColor: '#f3f4f6',
                        cursor: 'pointer',
                        fontSize: '14px',
                        color: '#6b7280',
                        fontWeight: '500',
                        minWidth: '40px',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#e5e7eb'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                    >
                      1
                    </button>
                    {startPage > 2 && <span style={{ color: '#d1d5db' }}>...</span>}
                  </>
                )}

                {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(i => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    style={{
                      padding: '8px 14px',
                      border: 'none',
                      borderRadius: '8px',
                      backgroundColor: i === currentPage ? '#dbeafe' : '#f3f4f6',
                      cursor: 'pointer',
                      fontSize: '14px',
                      color: i === currentPage ? '#1e40af' : '#6b7280',
                      fontWeight: i === currentPage ? '600' : '500',
                      minWidth: '40px',
                      transition: 'all 0.2s',
                      boxShadow: i === currentPage ? '0 2px 4px rgba(30, 64, 175, 0.2)' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (i !== currentPage) {
                        e.target.style.backgroundColor = '#e5e7eb';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (i !== currentPage) {
                        e.target.style.backgroundColor = '#f3f4f6';
                      }
                    }}
                  >
                    {i}
                  </button>
                ))}

                {endPage < totalPages && (
                  <>
                    {endPage < totalPages - 1 && <span style={{ color: '#d1d5db' }}>...</span>}
                    <button
                      key={totalPages}
                      onClick={() => setCurrentPage(totalPages)}
                      style={{
                        padding: '8px 14px',
                        border: 'none',
                        borderRadius: '8px',
                        backgroundColor: '#f3f4f6',
                        cursor: 'pointer',
                        fontSize: '14px',
                        color: '#6b7280',
                        fontWeight: '500',
                        minWidth: '40px',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#e5e7eb'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                    >
                      {totalPages}
                    </button>
                  </>
                )}

                <button
                  key="next"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '8px 12px',
                    border: 'none',
                    borderRadius: '6px',
                    backgroundColor: currentPage === totalPages ? '#f3f4f6' : '#f9fafb',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    fontSize: '16px',
                    color: currentPage === totalPages ? '#d1d5db' : '#6b7280',
                    fontWeight: '600',
                    transition: 'all 0.2s',
                    opacity: currentPage === totalPages ? 0.5 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (currentPage < totalPages) {
                      e.target.style.backgroundColor = '#e5e7eb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentPage < totalPages) {
                      e.target.style.backgroundColor = '#f9fafb';
                    }
                  }}
                >
                  Next →
                </button>
              </>
            );
          })()}
        </div>
      )}
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
          max-height: 550px;
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