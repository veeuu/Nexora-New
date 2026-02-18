import { useState, useEffect, useRef, useMemo } from 'react';
import { rowMatchesSearch, highlightText, Tooltip, createTooltipHandlers } from '../../utils/tableUtils';
import { getLogoPath, getTechIcon } from '../../utils/logoMap';
import nexoraLogo from '../../assets/nexora-logo.png';
import keywordHeatmap from '../../final_charts/keyword_heatmap (1).png';
import portfolioRadar from '../../final_charts/new_data_portfolio_radar (1).png';
import probabilityDist from '../../final_charts/probability_dist (1).png';
import { FaLinkedin, FaGlobe, FaEye, FaEyeSlash } from 'react-icons/fa';
// import PerformanceMetrics from '../PerformanceMetrics';
import { performanceMonitor } from '../../utils/performanceMonitor';

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
  const [currentPage, setCurrentPage] = useState(1);
  const [modalContent, setModalContent] = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  const [tooltip, setTooltip] = useState({ show: false, text: '', x: 0, y: 0 });
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilterMenu, setActiveFilterMenu] = useState(null);
  const filterRef = useRef(null);
  const techScrollRef = useRef(null);
  const propensityScrollRef = useRef(null);
  const analysisScrollRef = useRef(null);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [revealedRows, setRevealedRows] = useState(new Set());
  const rowsPerPage = 10;

  // Sync scroll across all three columns
  const handleTechScroll = (e) => {
    const scrollTop = e.target.scrollTop;
    if (propensityScrollRef.current) propensityScrollRef.current.scrollTop = scrollTop;
    if (analysisScrollRef.current) analysisScrollRef.current.scrollTop = scrollTop;
  };

  const handlePropensityScroll = (e) => {
    const scrollTop = e.target.scrollTop;
    if (techScrollRef.current) techScrollRef.current.scrollTop = scrollTop;
    if (analysisScrollRef.current) analysisScrollRef.current.scrollTop = scrollTop;
  };

  const handleAnalysisScroll = (e) => {
    const scrollTop = e.target.scrollTop;
    if (techScrollRef.current) techScrollRef.current.scrollTop = scrollTop;
    if (propensityScrollRef.current) propensityScrollRef.current.scrollTop = scrollTop;
  };

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
    setCurrentPage(1); // Reset to first page when filters change
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
        performanceMonitor.reset();
        performanceMonitor.start('total-load');
        
        performanceMonitor.start('api-fetch');
        
        // Fetch metadata and all data with retry logic
        const metadataResponse = await fetch('/api/ntp/metadata');
        await metadataResponse.json();
        
        // Fetch ALL data with retry logic for 503
        let allData = null;
        let retries = 10;
        
        while (!allData && retries > 0) {
          const allDataResponse = await fetch('/api/ntp/all');
          
          if (allDataResponse.status === 503) {
            // Cache building in progress, retry with exponential backoff
            const delay = Math.min(500 * Math.pow(1.5, 10 - retries), 5000);
            await new Promise(resolve => setTimeout(resolve, delay));
            retries--;
          } else if (allDataResponse.ok) {
            allData = await allDataResponse.json();
          } else {
            throw new Error(`HTTP error! status: ${allDataResponse.status}`);
          }
        }
        
        if (!allData) {
          throw new Error('Failed to fetch all data after retries');
        }
        
        performanceMonitor.end('api-fetch');
        
        performanceMonitor.start('parse-json');
        // Metadata already parsed above
        performanceMonitor.end('parse-json');

        performanceMonitor.start('state-update');
        setTableData(allData.data || []);
        
        performanceMonitor.end('state-update');
        performanceMonitor.end('total-load');
        performanceMonitor.logSummary();
      } catch (e) {
        setError(e.message);
        console.error("Failed to fetch NTP data:", e);
        setTableData([]);
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

  const filteredData = useMemo(() => {
    // Check if mandatory filters are applied (both Category and Purchase Prediction)
    const hasCategoryFilter = Array.isArray(filters.category) && filters.category.length > 0;
    const hasPurchasePredictionFilter = Array.isArray(filters.purchasePrediction) && filters.purchasePrediction.length > 0;

    // If mandatory filters are not applied, return empty array
    if (!hasCategoryFilter || !hasPurchasePredictionFilter) {
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

        return filterMatches;
      });
  }, [tableData, filters]);

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
        <h2 style={{ fontSize: '32px', fontWeight: '700' }}>Next Tech Purchase®</h2>
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
                      <span style={{ filter: 'blur(4px)', userSelect: 'none' }}>{option}</span>
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

          {/* Category Filter Button - Always Visible (Mandatory) */}
          {activeFilterMenu !== 'category' && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setActiveFilterMenu('category')}
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
                <span>Category {Array.isArray(filters.category) && filters.category.length > 0 && `(${filters.category.length})`} <span style={{ color: '#ef4444', fontWeight: '600' }}>*</span></span>
              </button>
            </div>
          )}

          {/* Category Filter Chip - Active Menu */}
          {activeFilterMenu === 'category' && (
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
                <span>Category {Array.isArray(filters.category) && filters.category.length > 0 && `(${filters.category.length})`} <span style={{ color: '#ef4444', fontWeight: '600' }}>*</span></span>
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
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {renderTechLogo(option)}
                          {option}
                        </span>
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

      {/* Message for mandatory filters */}
      {((!Array.isArray(filters.purchasePrediction) || filters.purchasePrediction.length === 0) || (!Array.isArray(filters.category) || filters.category.length === 0)) && (
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
              Please select both Category and Purchase Prediction to view data
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
              <th style={{ width: '50px', textAlign: 'center', padding: '12px 8px' }}>
                <input
                  type="checkbox"
                  checked={selectedRows.size > 0 && selectedRows.size === filteredData.length && filteredData.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      const newSelected = new Set();
                      filteredData.forEach((_, index) => newSelected.add(index));
                      setSelectedRows(newSelected);
                    } else {
                      setSelectedRows(new Set());
                    }
                  }}
                  style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                />
              </th>
              <th style={{ width: '70px', textAlign: 'center', padding: '12px 8px', whiteSpace: 'nowrap' }}>Reveal</th>
              <th style={{ width: '130px', padding: '12px 8px', whiteSpace: 'nowrap' }}>Company Name</th>
              <th style={{ width: '110px', padding: '12px 8px', whiteSpace: 'nowrap' }}>Category</th>
              <th style={{ width: '130px', padding: '12px 8px', whiteSpace: 'nowrap' }}>Purchase Prediction</th>
              <th style={{ width: '120px', padding: '12px 8px', whiteSpace: 'nowrap' }}>Technology</th>
              <th style={{ width: '130px', textAlign: 'center', padding: '12px 8px', whiteSpace: 'nowrap' }}>Purchase Propensity (%)</th>
              <th style={{ width: '130px', padding: '12px 8px', whiteSpace: 'nowrap' }}>NTP Analysis</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              // Group data by Category and Purchase Prediction
              const groupedData = {};
              filteredData.forEach(row => {
                const key = `${row.category}|${row.purchasePrediction}`;
                if (!groupedData[key]) {
                  groupedData[key] = {
                    category: row.category,
                    purchasePrediction: row.purchasePrediction,
                    companies: new Map()
                  };
                }
                
                // Group by company name
                if (!groupedData[key].companies.has(row.companyName)) {
                  groupedData[key].companies.set(row.companyName, {
                    companyName: row.companyName,
                    domain: row.domain,
                    linkedinUrl: row.linkedinUrl,
                    technologies: []
                  });
                }
                
                groupedData[key].companies.get(row.companyName).technologies.push({
                  technology: row.technology,
                  purchaseProbability: row.purchaseProbability,
                  ntpAnalysis: row.ntpAnalysis
                });
              });

              // Flatten to get all companies - WITH PAGINATION
              const allCompanies = [];
              Object.values(groupedData).forEach(group => {
                Array.from(group.companies.values()).forEach(company => {
                  allCompanies.push({ ...company, category: group.category, purchasePrediction: group.purchasePrediction });
                });
              });

              // Calculate pagination
              const totalCompanies = allCompanies.length;
              const totalPages = Math.ceil(totalCompanies / rowsPerPage);
              const startIndex = (currentPage - 1) * rowsPerPage;
              const endIndex = Math.min(startIndex + rowsPerPage, totalCompanies);
              const paginatedCompanies = allCompanies.slice(startIndex, endIndex);

              // Show paginated companies
              return paginatedCompanies.map((company, companyIndex) => {
                const actualIndex = startIndex + companyIndex;
                const companyRowSpan = company.technologies.length > 3 ? 1 : company.technologies.length;

                return company.technologies.map((tech, techIndex) => {
                  const isFirstTechRow = techIndex === 0;
                  // Only render rows for first 3 techs, or all if <= 3
                  if (company.technologies.length > 3 && techIndex > 0) {
                    return null;
                  }

                  return (
                    <tr key={`${actualIndex}-${techIndex}`} className={isFirstTechRow ? 'company-separator' : ''}>
                      {/* Checkbox - shown only on first technology row */}
                      {isFirstTechRow && (
                        <td rowSpan={companyRowSpan} style={{ verticalAlign: 'top', textAlign: 'center', width: '50px', padding: '12px 8px' }}>
                          <input
                            type="checkbox"
                            checked={selectedRows.has(actualIndex)}
                            onChange={(e) => {
                              e.stopPropagation();
                              const newSelected = new Set(selectedRows);
                              if (e.target.checked) {
                                newSelected.add(actualIndex);
                              } else {
                                newSelected.delete(actualIndex);
                              }
                              setSelectedRows(newSelected);
                            }}
                            style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                          />
                        </td>
                      )}

                      {/* Reveal Button - shown only on first technology row */}
                      {isFirstTechRow && (
                        <td rowSpan={companyRowSpan} style={{ verticalAlign: 'top', textAlign: 'center', width: '70px', padding: '12px 8px' }}>
                          <button
                            onClick={() => {
                              const rowKey = `${actualIndex}-${company.companyName}`;
                              setRevealedRows(prev => {
                                const newSet = new Set(prev);
                                newSet.add(rowKey);
                                return newSet;
                              });
                            }}
                            disabled={revealedRows.has(`${actualIndex}-${company.companyName}`)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 12px',
                              backgroundColor: revealedRows.has(`${actualIndex}-${company.companyName}`) ? '#e5e7eb' : '#d1fae5',
                              border: revealedRows.has(`${actualIndex}-${company.companyName}`) ? '1px solid #d1d5db' : '1px solid #a7f3d0',
                              borderRadius: '6px',
                              cursor: revealedRows.has(`${actualIndex}-${company.companyName}`) ? 'not-allowed' : 'pointer',
                              fontSize: '13px',
                              fontWeight: '500',
                              color: revealedRows.has(`${actualIndex}-${company.companyName}`) ? '#9ca3af' : '#047857',
                              transition: 'all 0.2s',
                              whiteSpace: 'nowrap',
                              opacity: revealedRows.has(`${companyIndex}-${company.companyName}`) ? 0.6 : 1
                            }}
                            onMouseEnter={(e) => {
                              if (!revealedRows.has(`${companyIndex}-${company.companyName}`)) {
                                e.currentTarget.style.backgroundColor = '#a7f3d0';
                                e.currentTarget.style.borderColor = '#6ee7b7';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!revealedRows.has(`${actualIndex}-${company.companyName}`)) {
                                e.currentTarget.style.backgroundColor = '#d1fae5';
                                e.currentTarget.style.borderColor = '#a7f3d0';
                              }
                            }}
                            title={revealedRows.has(`${actualIndex}-${company.companyName}`) ? 'Company details revealed' : 'Reveal company details'}
                          >
                            {revealedRows.has(`${actualIndex}-${company.companyName}`) ? (
                              <FaEye size={16} />
                            ) : (
                              <FaEyeSlash size={16} />
                            )}
                          </button>
                        </td>
                      )}

                      {/* Company Name - shown only on first technology row */}
                      {isFirstTechRow && (
                        <td rowSpan={companyRowSpan} style={{ verticalAlign: 'top', width: '130px', padding: '12px 8px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {revealedRows.has(`${actualIndex}-${company.companyName}`) ? (
                              <>
                                <div style={{ fontWeight: '600', color: '#1f2937' }}>
                                  {company.companyName}
                                </div>
                                <div style={{ fontSize: '13px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  {company.domain && (
                                    <a
                                      href={`https://${company.domain}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        color: '#6b7280',
                                        textDecoration: 'none',
                                        transition: 'color 0.2s, transform 0.2s',
                                        cursor: 'pointer'
                                      }}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.color = '#3b82f6';
                                        e.currentTarget.style.transform = 'scale(1.2)';
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.color = '#6b7280';
                                        e.currentTarget.style.transform = 'scale(1)';
                                      }}
                                      title={`Visit ${company.domain}`}
                                    >
                                      <FaGlobe size={16} />
                                    </a>
                                  )}
                                  {company.linkedinUrl && (
                                    <a
                                      href={company.linkedinUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        color: '#0077b5',
                                        textDecoration: 'none',
                                        transition: 'opacity 0.2s'
                                      }}
                                      onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                                      onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                                      title="View LinkedIn Profile"
                                    >
                                      <FaLinkedin size={20} />
                                    </a>
                                  )}
                                </div>
                              </>
                            ) : (
                              <>
                                <div style={{ fontWeight: '600', color: '#1f2937', filter: 'blur(8px)', userSelect: 'none', pointerEvents: 'none' }}>
                                  ••••••••••••••••••
                                </div>
                                <div style={{ fontSize: '13px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '8px', filter: 'blur(6px)', userSelect: 'none', pointerEvents: 'none' }}>
                                  ••••••••••
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                      )}

                      {/* Category - shown only on first technology row */}
                      {isFirstTechRow && (
                        <td rowSpan={companyRowSpan} style={{ verticalAlign: 'top', width: '110px', padding: '12px 8px' }}>
                          <span style={{ display: 'flex', alignItems: 'center' }}>
                            {renderTechLogo(company.category)}
                            {company.category}
                          </span>
                        </td>
                      )}

                      {/* Purchase Prediction - shown only on first technology row */}
                      {isFirstTechRow && (
                        <td rowSpan={companyRowSpan} style={{ verticalAlign: 'top', width: '130px', padding: '12px 8px' }}>
                          {company.purchasePrediction}
                        </td>
                      )}

                      {/* Technology */}
                      <td style={{ width: '120px', padding: '12px 8px' }}>
                        {company.technologies.length > 3 ? (
                          <div 
                            ref={techScrollRef}
                            style={{ 
                              display: 'flex', 
                              flexDirection: 'column', 
                              gap: '8px',
                              maxHeight: '96px',
                              overflowY: 'auto',
                              paddingRight: '4px',
                              width: '100%',
                              scrollbarWidth: 'none',
                              msOverflowStyle: 'none'
                            }}
                            className="tech-scroll-container"
                            onScroll={handleTechScroll}
                          >
                            {company.technologies.map((t, idx) => (
                              <span key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                                {renderTechLogo(t.technology)}
                                {t.technology}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                            {renderTechLogo(tech.technology)}
                            {tech.technology}
                          </span>
                        )}
                      </td>

                      {/* Purchase Propensity (%) */}
                      <td style={{ textAlign: 'center', width: '130px', padding: '12px 8px' }}>
                        {company.technologies.length > 3 ? (
                          <div 
                            ref={propensityScrollRef}
                            style={{ 
                              display: 'flex', 
                              flexDirection: 'column', 
                              gap: '8px',
                              maxHeight: '96px',
                              overflowY: 'auto',
                              paddingRight: '4px',
                              width: '100%',
                              scrollbarWidth: 'none',
                              msOverflowStyle: 'none',
                              alignItems: 'center'
                            }}
                            className="tech-scroll-container"
                            onScroll={handlePropensityScroll}
                          >
                            {company.technologies.map((t, idx) => (
                              <span key={idx} style={{ whiteSpace: 'nowrap' }}>
                                {t.purchaseProbability}
                              </span>
                            ))}
                          </div>
                        ) : (
                          tech.purchaseProbability
                        )}
                      </td>

                      {/* NTP Analysis */}
                      <td 
                        onClick={() => company.technologies.length <= 3 && handleAnalysisClick(tech.ntpAnalysis)}
                        style={{ cursor: company.technologies.length <= 3 ? 'pointer' : 'default', color: '#010810ff', textDecoration: company.technologies.length <= 3 ? 'underline' : 'none', width: '130px', padding: '12px 8px' }}
                      >
                        {company.technologies.length > 3 ? (
                          <div 
                            ref={analysisScrollRef}
                            style={{ 
                              display: 'flex', 
                              flexDirection: 'column', 
                              gap: '8px',
                              maxHeight: '96px',
                              overflowY: 'auto',
                              paddingRight: '4px',
                              width: '100%',
                              scrollbarWidth: 'none',
                              msOverflowStyle: 'none'
                            }}
                            className="tech-scroll-container"
                            onScroll={handleAnalysisScroll}
                          >
                            {company.technologies.map((t, idx) => (
                              <span 
                                key={idx} 
                                style={{ whiteSpace: 'nowrap', cursor: 'pointer', textDecoration: 'underline', color: '#010810ff' }}
                                onClick={() => handleAnalysisClick(t.ntpAnalysis)}
                              >
                                {t.ntpAnalysis ? `${t.ntpAnalysis.substring(0, 30)}...` : 'N/A'}
                              </span>
                            ))}
                          </div>
                        ) : (
                          tech.ntpAnalysis ? `${tech.ntpAnalysis.substring(0, 30)}...` : 'N/A'
                        )}
                      </td>
                    </tr>
                  );
                }).filter(row => row !== null);
              });
            })()}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {filteredData.length > 0 && (() => {
        const groupedData = {};
        filteredData.forEach(row => {
          const key = `${row.category}|${row.purchasePrediction}`;
          if (!groupedData[key]) {
            groupedData[key] = { companies: new Map() };
          }
          if (!groupedData[key].companies.has(row.companyName)) {
            groupedData[key].companies.set(row.companyName, true);
          }
        });
        const totalCompanies = Object.values(groupedData).reduce((sum, g) => sum + g.companies.size, 0);
        const totalPages = Math.ceil(totalCompanies / rowsPerPage);
        const startIndex = (currentPage - 1) * rowsPerPage + 1;
        const endIndex = Math.min(currentPage * rowsPerPage, totalCompanies);

        return totalPages > 1 ? (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '20px',
            marginBottom: '20px',
            paddingBottom: '15px',
            borderBottom: '1px solid #e5e7eb'
          }}>
            <div style={{
              fontSize: '14px',
              color: '#1f2937',
              fontWeight: '600'
            }}>
              Page {currentPage} of {totalPages.toLocaleString()}
            </div>

            {/* Pagination Buttons */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px'
            }}>
              {(() => {
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
                    {/* First Page Button */}
                    <button
                      key="first"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      style={{
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        backgroundColor: currentPage === 1 ? '#f3f4f6' : 'white',
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                        fontSize: '16px',
                        color: currentPage === 1 ? '#d1d5db' : '#6b7280',
                        fontWeight: '600',
                        transition: 'all 0.2s',
                        opacity: currentPage === 1 ? 0.5 : 1
                      }}
                      onMouseEnter={(e) => {
                        if (currentPage > 1) {
                          e.target.style.backgroundColor = '#f9fafb';
                          e.target.style.borderColor = '#9ca3af';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (currentPage > 1) {
                          e.target.style.backgroundColor = 'white';
                          e.target.style.borderColor = '#d1d5db';
                        }
                      }}
                      title="First page"
                    >
                      ≪
                    </button>

                    {/* Previous Page Button */}
                    <button
                      key="prev"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      style={{
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        backgroundColor: currentPage === 1 ? '#f3f4f6' : 'white',
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                        fontSize: '16px',
                        color: currentPage === 1 ? '#d1d5db' : '#6b7280',
                        fontWeight: '600',
                        transition: 'all 0.2s',
                        opacity: currentPage === 1 ? 0.5 : 1
                      }}
                      onMouseEnter={(e) => {
                        if (currentPage > 1) {
                          e.target.style.backgroundColor = '#f9fafb';
                          e.target.style.borderColor = '#9ca3af';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (currentPage > 1) {
                          e.target.style.backgroundColor = 'white';
                          e.target.style.borderColor = '#d1d5db';
                        }
                      }}
                      title="Previous page"
                    >
                      ‹
                    </button>

                    {/* Page Numbers */}
                    {startPage > 1 && (
                      <>
                        <button
                          key={1}
                          onClick={() => setCurrentPage(1)}
                          style={{
                            padding: '8px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            backgroundColor: 'white',
                            cursor: 'pointer',
                            fontSize: '14px',
                            color: '#6b7280',
                            fontWeight: '500',
                            minWidth: '40px',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#f9fafb';
                            e.target.style.borderColor = '#9ca3af';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'white';
                            e.target.style.borderColor = '#d1d5db';
                          }}
                        >
                          1
                        </button>
                        {startPage > 2 && <span style={{ color: '#d1d5db', padding: '0 4px' }}>...</span>}
                      </>
                    )}

                    {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(i => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i)}
                        style={{
                          padding: '8px 12px',
                          border: i === currentPage ? '1px solid #3b82f6' : '1px solid #d1d5db',
                          borderRadius: '6px',
                          backgroundColor: i === currentPage ? '#dbeafe' : 'white',
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
                            e.target.style.backgroundColor = '#f9fafb';
                            e.target.style.borderColor = '#9ca3af';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (i !== currentPage) {
                            e.target.style.backgroundColor = 'white';
                            e.target.style.borderColor = '#d1d5db';
                          }
                        }}
                      >
                        {i}
                      </button>
                    ))}

                    {endPage < totalPages && (
                      <>
                        {endPage < totalPages - 1 && <span style={{ color: '#d1d5db', padding: '0 4px' }}>...</span>}
                        <button
                          key={totalPages}
                          onClick={() => setCurrentPage(totalPages)}
                          style={{
                            padding: '8px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            backgroundColor: 'white',
                            cursor: 'pointer',
                            fontSize: '14px',
                            color: '#6b7280',
                            fontWeight: '500',
                            minWidth: '40px',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#f9fafb';
                            e.target.style.borderColor = '#9ca3af';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'white';
                            e.target.style.borderColor = '#d1d5db';
                          }}
                        >
                          {totalPages}
                        </button>
                      </>
                    )}

                    {/* Next Page Button */}
                    <button
                      key="next"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      style={{
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        backgroundColor: currentPage === totalPages ? '#f3f4f6' : 'white',
                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                        fontSize: '16px',
                        color: currentPage === totalPages ? '#d1d5db' : '#6b7280',
                        fontWeight: '600',
                        transition: 'all 0.2s',
                        opacity: currentPage === totalPages ? 0.5 : 1
                      }}
                      onMouseEnter={(e) => {
                        if (currentPage < totalPages) {
                          e.target.style.backgroundColor = '#f9fafb';
                          e.target.style.borderColor = '#9ca3af';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (currentPage < totalPages) {
                          e.target.style.backgroundColor = 'white';
                          e.target.style.borderColor = '#d1d5db';
                        }
                      }}
                      title="Next page"
                    >
                      ›
                    </button>

                    {/* Last Page Button */}
                    <button
                      key="last"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      style={{
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        backgroundColor: currentPage === totalPages ? '#f3f4f6' : 'white',
                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                        fontSize: '16px',
                        color: currentPage === totalPages ? '#d1d5db' : '#6b7280',
                        fontWeight: '600',
                        transition: 'all 0.2s',
                        opacity: currentPage === totalPages ? 0.5 : 1
                      }}
                      onMouseEnter={(e) => {
                        if (currentPage < totalPages) {
                          e.target.style.backgroundColor = '#f9fafb';
                          e.target.style.borderColor = '#9ca3af';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (currentPage < totalPages) {
                          e.target.style.backgroundColor = 'white';
                          e.target.style.borderColor = '#d1d5db';
                        }
                      }}
                      title="Last page"
                    >
                      ≫
                    </button>
                  </>
                );
              })()}
            </div>

            <div style={{
              fontSize: '14px',
              color: '#6b7280',
              fontWeight: '500'
            }}>
              Showing {startIndex}-{endIndex} of {totalCompanies.toLocaleString()} results
            </div>
          </div>
        ) : null;
      })()}

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
              <h2>Next Tech Purchase® Summary - Analytics Overview</h2>
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
        
        th:nth-child(1), td:nth-child(1) { width: 50px !important; white-space: normal; } /* Checkbox */
        th:nth-child(2), td:nth-child(2) { width: 100px !important; white-space: nowrap; } /* Reveal */
        th:nth-child(3), td:nth-child(3) { width: 140px !important; white-space: nowrap; } /* Company Name */
        th:nth-child(4), td:nth-child(4) { width: 100px !important; white-space: nowrap; } /* Category */
        th:nth-child(5), td:nth-child(5) { width: 140px !important; white-space: nowrap; } /* Purchase Prediction */
        th:nth-child(6), td:nth-child(6) { width: 100px !important; white-space: nowrap; } /* Technology */
        th:nth-child(7), td:nth-child(7) { width: 160px !important; white-space: nowrap; } /* Purchase Propensity */
        th:nth-child(8), td:nth-child(8) { width: 140px !important; white-space: nowrap; } /* NTP Analysis */
        
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
      {/* <PerformanceMetrics measurements={measurements} isVisible={true} /> */}
    </div>
  );
};

export default NTP;