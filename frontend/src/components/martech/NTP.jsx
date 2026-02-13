import { useState, useEffect, useRef } from 'react';
import { rowMatchesSearch, highlightText, Tooltip, createTooltipHandlers } from '../../utils/tableUtils';
import { getLogoPath, getTechIcon } from '../../utils/logoMap';
import nexoraLogo from '../../assets/nexora-logo.png';
import keywordHeatmap from '../../final_charts/keyword_heatmap (1).png';
import portfolioRadar from '../../final_charts/new_data_portfolio_radar (1).png';
import probabilityDist from '../../final_charts/probability_dist (1).png';

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
    companyName: [],
    technology: [],
    purchasePrediction: [],
    category: []
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [modalContent, setModalContent] = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  const [tooltip, setTooltip] = useState({ show: false, text: '', x: 0, y: 0 });
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilterMenu, setActiveFilterMenu] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 7;
  const filterRef = useRef(null);

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
    // For all filters, toggle the value in the array
    setFilters(prev => {
      const currentValues = Array.isArray(prev[filterName]) ? prev[filterName] : [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      return { ...prev, [filterName]: newValues };
    });
    setCurrentPage(1);
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
        setError(null);
        const response = await fetch('/api/ntp');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setTableData(data);
      } catch (e) {
        setError(e.message);
        console.error("Failed to fetch NTP data:", e);
        setTableData([]); // Set empty data on error
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  const getUniqueOptions = (key) => {
    if (!tableData) return [];
    const allValues = tableData.map(item => item[key]);
    return [...new Set(allValues)].sort();
  };

  // Helper function to count companies by category
  const getCompanyCountByCategory = (category) => {
    if (!tableData) return 0;
    const uniqueCompanies = new Set();
    tableData.forEach(row => {
      if (row.category === category) {
        uniqueCompanies.add(row.companyName);
      }
    });
    return uniqueCompanies.size;
  };

  // Helper function to count companies by technology
  const getCompanyCountByTechnology = (technology) => {
    if (!tableData) return 0;
    const uniqueCompanies = new Set();
    tableData.forEach(row => {
      if (row.technology === technology) {
        uniqueCompanies.add(row.companyName);
      }
    });
    return uniqueCompanies.size;
  };

  // Helper function to count companies by purchase prediction
  const getCompanyCountByPurchasePrediction = (prediction) => {
    if (!tableData) return 0;
    const uniqueCompanies = new Set();
    tableData.forEach(row => {
      if (row.purchasePrediction === prediction) {
        uniqueCompanies.add(row.companyName);
      }
    });
    return uniqueCompanies.size;
  };

  const { handleMouseEnter, handleMouseLeave } = createTooltipHandlers(setTooltip);

  const filteredData = (() => {
    // Check if mandatory Purchase Prediction filter is applied
    const hasMandatoryFilter = Array.isArray(filters.purchasePrediction) && filters.purchasePrediction.length > 0;

    // If mandatory filter is not applied, return empty array
    if (!hasMandatoryFilter) {
      return [];
    }

    return tableData
      .filter(row => {
        // Apply all filters with OR logic within each filter type
        const filterMatches = Object.keys(filters).every(key => {
          const selectedValues = Array.isArray(filters[key]) ? filters[key] : [];
          if (selectedValues.length === 0) return true; // No filter applied for this key
          
          const rowValue = String(row[key]).toLowerCase();
          return selectedValues.some(val => String(val).toLowerCase() === rowValue);
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
  })();

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
        minHeight: '800px',
        backgroundColor: '#ffffffff',
        borderRadius: '8px',
        padding: '40px 20px'
      }}>
        {/* Nexora Logo */}
        <img 
          src={nexoraLogo} 
          alt="Nexora" 
          style={{
            width: '250px',
            height: 'auto',
            marginBottom: '30px',
            opacity: 0.9
          }}
        />

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

  return (
    <div className="ntp-container">
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
        <h2 style={{ fontSize: '32px', fontWeight: '700' }}>NTP®</h2>
        <div className="actions-right" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '15px' }}>
          {/* <div className="search-bar">
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
          </div> */}
          <button className="view-summary-button" onClick={() => setShowSummary(true)}>
            <svg className="summary-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            View Summary
          </button>
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
                  { label: 'Company Name', key: 'companyName', mandatory: false },
                  { label: 'Category', key: 'category', mandatory: false },
                  { label: 'Technology', key: 'technology', mandatory: false }
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

          {/* Purchase Prediction Filter - Always Visible (Mandatory) */}
          {activeFilterMenu !== 'purchasePrediction' && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setActiveFilterMenu('purchasePrediction')}
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
                <span>Purchase Prediction {Array.isArray(filters.purchasePrediction) && filters.purchasePrediction.length > 0 && `(${filters.purchasePrediction.length})`} <span style={{ color: '#ef4444', fontWeight: '600' }}>*</span></span>
              </button>
            </div>
          )}

          {/* Company Name Filter Chip */}
          {activeFilterMenu === 'companyName' && (
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
                <span>Company Name {Array.isArray(filters.companyName) && filters.companyName.length > 0 && `(${filters.companyName.length})`}</span>
                <button
                  onClick={() => {
                    setActiveFilterMenu(null);
                    setFilters(prev => ({ ...prev, companyName: [] }));
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
                    if (Array.isArray(filters.companyName) && filters.companyName.length === getUniqueOptions('companyName').length && getUniqueOptions('companyName').length > 0) {
                      // If all are selected, deselect all
                      setFilters(prev => ({ ...prev, companyName: [] }));
                    } else {
                      // Otherwise select all
                      setFilters(prev => ({ ...prev, companyName: getUniqueOptions('companyName') }));
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
                    checked={Array.isArray(filters.companyName) && filters.companyName.length === getUniqueOptions('companyName').length && getUniqueOptions('companyName').length > 0}
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
                  const isSelected = Array.isArray(filters.companyName) && filters.companyName.includes(option);
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        handleFilterChange('companyName', option);
                      }}
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

          {/* Purchase Prediction Filter Chip */}
          {activeFilterMenu === 'purchasePrediction' && (
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
                <span>Purchase Prediction {Array.isArray(filters.purchasePrediction) && filters.purchasePrediction.length > 0 && `(${filters.purchasePrediction.length})`} <span style={{ color: '#ef4444', fontWeight: '600' }}>*</span></span>
                <button
                  onClick={() => {
                    setActiveFilterMenu(null);
                    setFilters(prev => ({ ...prev, purchasePrediction: [] }));
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
                    if (Array.isArray(filters.purchasePrediction) && filters.purchasePrediction.length === getUniqueOptions('purchasePrediction').length && getUniqueOptions('purchasePrediction').length > 0) {
                      // If all are selected, deselect all
                      setFilters(prev => ({ ...prev, purchasePrediction: [] }));
                    } else {
                      // Otherwise select all
                      setFilters(prev => ({ ...prev, purchasePrediction: getUniqueOptions('purchasePrediction') }));
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
                    checked={Array.isArray(filters.purchasePrediction) && filters.purchasePrediction.length === getUniqueOptions('purchasePrediction').length && getUniqueOptions('purchasePrediction').length > 0}
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
                {getUniqueOptions('purchasePrediction').map((option, idx) => {
                  const isSelected = Array.isArray(filters.purchasePrediction) && filters.purchasePrediction.includes(option);
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        handleFilterChange('purchasePrediction', option);
                      }}
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
                        {getCompanyCountByPurchasePrediction(option)}
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

          {/* Category Filter Chip */}
          {activeFilterMenu === 'category' && (
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
                <span>Category {Array.isArray(filters.category) && filters.category.length > 0 && `(${filters.category.length})`}</span>
                <button
                  onClick={() => {
                    setActiveFilterMenu(null);
                    setFilters(prev => ({ ...prev, category: [] }));
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
                    if (Array.isArray(filters.category) && filters.category.length === getUniqueOptions('category').length && getUniqueOptions('category').length > 0) {
                      // If all are selected, deselect all
                      setFilters(prev => ({ ...prev, category: [] }));
                    } else {
                      // Otherwise select all
                      setFilters(prev => ({ ...prev, category: getUniqueOptions('category') }));
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
                    checked={Array.isArray(filters.category) && filters.category.length === getUniqueOptions('category').length && getUniqueOptions('category').length > 0}
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
                {getUniqueOptions('category').map((option, idx) => {
                  const isSelected = Array.isArray(filters.category) && filters.category.includes(option);
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        handleFilterChange('category', option);
                      }}
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
                        {renderTechLogo(option)}
                        {option}
                      </div>
                      <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
                        {getCompanyCountByCategory(option)}
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

          {/* Technology Filter Chip */}
          {activeFilterMenu === 'technology' && (
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
                <span>Technology {Array.isArray(filters.technology) && filters.technology.length > 0 && `(${filters.technology.length})`}</span>
                <button
                  onClick={() => {
                    setActiveFilterMenu(null);
                    setFilters(prev => ({ ...prev, technology: [] }));
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
                    if (Array.isArray(filters.technology) && filters.technology.length === getUniqueOptions('technology').length && getUniqueOptions('technology').length > 0) {
                      // If all are selected, deselect all
                      setFilters(prev => ({ ...prev, technology: [] }));
                    } else {
                      // Otherwise select all
                      setFilters(prev => ({ ...prev, technology: getUniqueOptions('technology') }));
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
                    checked={Array.isArray(filters.technology) && filters.technology.length === getUniqueOptions('technology').length && getUniqueOptions('technology').length > 0}
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
                {getUniqueOptions('technology').map((option, idx) => {
                  const isSelected = Array.isArray(filters.technology) && filters.technology.includes(option);
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        handleFilterChange('technology', option);
                      }}
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
                        {renderTechLogo(option)}
                        {option}
                      </div>
                      <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
                        {getCompanyCountByTechnology(option)}
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
          {Array.isArray(filters.companyName) && filters.companyName.length > 0 && activeFilterMenu !== 'companyName' && (
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
            onClick={() => setActiveFilterMenu('companyName')}
            >
              <span>Company Name: {filters.companyName.length} selected</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFilters(prev => ({ ...prev, companyName: [] }));
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



          {Array.isArray(filters.category) && filters.category.length > 0 && activeFilterMenu !== 'category' && (
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
            onClick={() => setActiveFilterMenu('category')}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                Category: {filters.category.length} selected
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFilters(prev => ({ ...prev, category: [] }));
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

          {Array.isArray(filters.technology) && filters.technology.length > 0 && activeFilterMenu !== 'technology' && (
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
            onClick={() => setActiveFilterMenu('technology')}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                Technology: {filters.technology.length} selected
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFilters(prev => ({ ...prev, technology: [] }));
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
          </div>
          
          {/* Download CSV Button - Show in filter row only when warning message is hidden */}
          {Array.isArray(filters.purchasePrediction) && filters.purchasePrediction.length > 0 && (
            <button className="download-csv-button" onClick={() => handleDownloadCSV(filteredData)} style={{ flexShrink: 0 }}>
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
      {(!Array.isArray(filters.purchasePrediction) || filters.purchasePrediction.length === 0) && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '20px',
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
              Please select a Purchase Prediction to view data
            </div>
          </div>
          <button className="download-csv-button" onClick={() => handleDownloadCSV(filteredData)} style={{ flexShrink: 0 }}>
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
            {(() => {
              const totalPages = Math.ceil(filteredData.length / rowsPerPage);
              const startIndex = (currentPage - 1) * rowsPerPage;
              const endIndex = startIndex + rowsPerPage;
              const paginatedData = filteredData.slice(startIndex, endIndex);

              return paginatedData.map((row, index) => {
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

      {showSummary && (
        <div className="modal-overlay" onClick={() => setShowSummary(false)}>
          <div className="summary-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="summary-modal-header">
              <h2>NTP Summary - Analytics Overview</h2>
              <button 
                className="close-button"
                onClick={() => setShowSummary(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6b7280',
                  padding: '0',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>
            <div className="summary-charts-grid">
              <div className="chart-item">
                <h3>Keyword Heatmap</h3>
                <img src={keywordHeatmap} alt="Keyword Heatmap" />
              </div>
              <div className="chart-item">
                <h3>Portfolio Radar</h3>
                <img src={portfolioRadar} alt="Portfolio Radar" />
              </div>
              <div className="chart-item">
                <h3>Probability Distribution</h3>
                <img src={probabilityDist} alt="Probability Distribution" />
              </div>
            </div>
          </div>
        </div>
      )}
      <style>{`
        .table-container {
          max-height: 550px;
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
          padding: 12px 16px;
          text-align: left;
          border-bottom: 1px solid #ddd;
          overflow: hidden;
          text-overflow: ellipsis;
          cursor: default;
          vertical-align: middle;
        }
        
        th:nth-child(1), td:nth-child(1) { width: 16.66%; white-space: normal; }
        th:nth-child(2), td:nth-child(2) { width: 16.66%; white-space: nowrap; }
        th:nth-child(3), td:nth-child(3) { width: 16.66%; white-space: nowrap; }
        th:nth-child(4), td:nth-child(4) { width: 16.66%; white-space: nowrap; }
        th:nth-child(5), td:nth-child(5) { width: 16.66%; white-space: nowrap; }
        th:nth-child(6), td:nth-child(6) { width: 16.66%; white-space: nowrap; }
        
        td { position: relative; }
        td:hover { background-color: #f9fafb; }
        
        th {
          background-color: #f8f9fa;
          font-weight: 600;
          font-size: 14px;
          color: #1f2937;
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
          white-space: pre-wrap;
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

        .summary-modal-content {
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          max-width: 1200px;
          width: 95%;
          max-height: 90vh;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }

        .summary-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          border-bottom: 1px solid #e5e7eb;
          flex-shrink: 0;
        }

        .summary-modal-header h2 {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          color: #1f2937;
        }

        .summary-charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
          gap: 24px;
          padding: 24px;
          overflow-y: auto;
        }

        .chart-item {
          display: flex;
          flex-direction: column;
          gap: 12px;
          background: #f9fafb;
          padding: 16px;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .chart-item h3 {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
        }

        .chart-item img {
          width: 100%;
          height: auto;
          border-radius: 6px;
          background: white;
          border: 1px solid #d1d5db;
        }

        @media (max-width: 1024px) {
          .summary-charts-grid {
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          }
        }

        @media (max-width: 768px) {
          .summary-charts-grid {
            grid-template-columns: 1fr;
            gap: 16px;
            padding: 16px;
          }

          .summary-modal-header {
            padding: 16px;
          }

          .summary-modal-header h2 {
            font-size: 18px;
          }

          th, td {
            padding: 10px 12px;
            font-size: 12px;
          }

          th:nth-child(1), td:nth-child(1) { width: 16.66%; }
          th:nth-child(2), td:nth-child(2) { width: 16.66%; }
          th:nth-child(3), td:nth-child(3) { width: 16.66%; }
          th:nth-child(4), td:nth-child(4) { width: 16.66%; }
          th:nth-child(5), td:nth-child(5) { width: 16.66%; }
          th:nth-child(6), td:nth-child(6) { width: 16.66%; }
        }

        @media (max-width: 480px) {
          .summary-charts-grid {
            grid-template-columns: 1fr;
            gap: 12px;
            padding: 12px;
          }

          .summary-modal-header {
            padding: 12px;
          }

          .summary-modal-header h2 {
            font-size: 16px;
          }

          th, td {
            padding: 8px 10px;
            font-size: 11px;
          }

          th:nth-child(1), td:nth-child(1) { width: 16.66%; }
          th:nth-child(2), td:nth-child(2) { width: 16.66%; }
          th:nth-child(3), td:nth-child(3) { width: 16.66%; }
          th:nth-child(4), td:nth-child(4) { width: 16.66%; }
          th:nth-child(5), td:nth-child(5) { width: 16.66%; }
          th:nth-child(6), td:nth-child(6) { width: 16.66%; }
        }
      `}</style>
    </div>
  );
};

export default NTP;