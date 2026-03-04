import { useState, useEffect, useRef, useMemo } from 'react';
import { rowMatchesSearch, highlightText, Tooltip, createTooltipHandlers } from '../../utils/tableUtils';
import { getLogoPath, getTechIcon } from '../../utils/logoMap';
import loadingGif from '../../assets/Loading GIF - Clients.gif';
import { FaLinkedin, FaGlobe, FaRobot, FaLock, FaUnlock } from 'react-icons/fa';
import ChatBot from '../ChatBot';
import '../../styles/ntp.css';

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
    <div className="ntp-dropdown-wrapper">
      <button
        ref={buttonRef}
        onClick={handleButtonClick}
        className="ntp-dropdown-button"
      >
        <span>{value || 'All'}</span>
        <span className="ntp-dropdown-arrow">▼</span>
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="ntp-dropdown-content"
          style={{
            top: `${dropdownPos.top}px`,
            left: `${dropdownPos.left}px`,
            width: `${dropdownPos.width}px`
          }}
        >
          <div
            onClick={() => {
              onChange('');
              setIsOpen(false);
            }}
            className="ntp-dropdown-item"
            onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
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
              className={`ntp-dropdown-item ${value === option ? 'selected' : ''}`}
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
    <div className="ntp-dropdown-wrapper">
      <button
        ref={buttonRef}
        onClick={handleButtonClick}
        className="ntp-dropdown-button"
      >
        <span className="ntp-dropdown-logo-span">
          {value && renderLogo(value)}
          {value || 'All'}
        </span>
        <span className="ntp-dropdown-arrow">▼</span>
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="ntp-dropdown-content"
          style={{
            top: `${dropdownPos.top}px`,
            left: `${dropdownPos.left}px`,
            width: `${dropdownPos.width}px`
          }}
        >
          <div
            onClick={() => {
              onChange('');
              setIsOpen(false);
            }}
            className="ntp-dropdown-item"
            onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
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
              className={`ntp-dropdown-item ${value === option ? 'selected' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
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
  const [companyNameSearch, setCompanyNameSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [modalContent, setModalContent] = useState(null);
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

  const renderTechLogo = (techName) => {
    if (!techName) return null;
    
    // Check if it's an AI-related term
    const aiTerms = ['rag', 'taradata', 'large language model', 'machine learning', 'artificial intelligence', 'llm', 'generative ai', 'ai', 'deep learning', 'neural network'];
    const techNameLower = techName.toLowerCase();
    const isAITerm = aiTerms.some(term => techNameLower.includes(term));
    
    if (isAITerm) {
      return (
        <FaRobot
          size={16}
          className="ntp-tech-logo-icon ntp-tech-logo-ai"
          title={techName}
        />
      );
    }
    
    const logoPath = getLogoPath(techName);

    if (logoPath) {
      return (
        <img
          src={logoPath}
          alt={techName}
          title={techName}
          className="ntp-tech-logo-img"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      );
    }

    const iconData = getTechIcon(techName);
    if (iconData) {
      const { component: IconComponent, color } = iconData;
      return (
        <IconComponent
          size={16}
          className="ntp-tech-logo-icon"
          style={{ color }}
          title={techName}
        />
      );
    }
    
    return null;
  };

  const handleFilterChange = (filterName, value) => {
    
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
    // Filter to only include revealed companies
    const revealedData = dataToDownload.filter((row, index) => {
      const rowKey = `${index}-${row.companyName}`;
      return revealedRows.has(rowKey);
    });

    if (revealedData.length === 0) {
      alert('No revealed companies to download. Please reveal company details first.');
      return;
    }

    const headers = [
      'companyName', 'domain', 'category', 'technology',
      'purchaseProbability', 'purchasePrediction'
    ];

    const csvContent = [
      headers.join(','),
      ...revealedData.map(row =>
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

        const metadataResponse = await fetch('/api/ntp/metadata');
        await metadataResponse.json();

        let allData = null;
        let retries = 10;
        
        while (!allData && retries > 0) {
          const allDataResponse = await fetch('/api/ntp/all');
          
          if (allDataResponse.status === 503) {
            
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
        
        setTableData(allData.data || []);
      } catch (e) {
        setError(e.message);
        setTableData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
    
    const hasCategoryFilter = Array.isArray(filters.category) && filters.category.length > 0;
    const hasPurchasePredictionFilter = Array.isArray(filters.purchasePrediction) && filters.purchasePrediction.length > 0;

    // Show all data by default (no mandatory filters required)
    return tableData
      .filter(row => {
        // Exclude "Not Detected" records
        if (row.category === 'Not Detected' || row.purchasePrediction === 'Not Detected' || row.purchasePrediction === 'NOT detected') {
          return false;
        }
        
        const filterMatches = Object.keys(filters).every(key => {
          const selectedValues = Array.isArray(filters[key]) ? filters[key] : [];
          if (selectedValues.length === 0) return true; 
          
          const rowValue = String(row[key]).toLowerCase();
          return selectedValues.some(val => String(val).toLowerCase() === rowValue);
        });

        return filterMatches;
      })
      .sort((a, b) => {
        // Sort by purchase probability in descending order (highest first)
        const probA = parseFloat(String(a.purchaseProbability || '0').replace('%', '')) || 0;
        const probB = parseFloat(String(b.purchaseProbability || '0').replace('%', '')) || 0;
        return probB - probA;
      });
  }, [tableData, filters]);

  const handleAnalysisClick = (analysis) => {
    setModalContent(analysis);
  };

  if (loading) {
    return (
      <div className="ntp-loading-container">
        {/* Background Full Page Skeleton (blurred) */}
        <div className="ntp-loading-skeleton">
          {/* Title Skeleton */}
          <div className="ntp-skeleton-title" />

          {/* Filter Bar Skeleton */}
          <div className="ntp-skeleton-filters">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={`filter-${i}`} className="ntp-skeleton-filter-item" />
            ))}
          </div>

          {/* Divider */}
          <div className="ntp-skeleton-divider" />

          {/* Table Header Skeleton */}
          <div className="ntp-skeleton-header">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={`header-${i}`} className="ntp-skeleton-header-cell" />
            ))}
          </div>

          {/* Table Rows Skeleton */}
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(row => (
            <div key={`row-${row}`} className="ntp-skeleton-row">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(col => (
                <div key={`cell-${row}-${col}`} className="ntp-skeleton-cell" />
              ))}
            </div>
          ))}
        </div>

        {/* Centered Loading GIF */}
        <div className="ntp-loading-gif-container">
          <img 
            src={loadingGif} 
            alt="Loading" 
            className="ntp-loading-gif"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="ntp-container">
      {}
      {error && (
        <div className="ntp-error-container">
          <div className="ntp-error-icon">⚠</div>
          <div className="ntp-error-message">
            Error fetching data: {error}. Showing UI with no data.
          </div>
          <button
            onClick={() => setError(null)}
            className="ntp-error-close-btn"
          >
            ✕
          </button>
        </div>
      )}
      
      <div className="header-actions">
        <h2>Next Tech Purchase®</h2>
        <div className="actions-right">
        </div>
      </div>
      
      <div className="ntp-filters-wrapper" ref={filterRef}>
        <div className="ntp-filters-container">
          <div className="ntp-filters-left">
          
          {}
          <div className="ntp-filter-button-wrapper">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="ntp-filter-button"
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

            {}
            {showFilters && (
              <div className="ntp-filter-menu">
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
                    className="ntp-filter-menu-item"
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                  >
                    {filterOption.label}
                    {filterOption.mandatory && (
                      <span className="ntp-filter-required-badge">*</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {}
          {activeFilterMenu !== 'purchasePrediction' && (
            <div className="ntp-filter-button-wrapper">
              <button
                onClick={() => setActiveFilterMenu('purchasePrediction')}
                className="ntp-filter-button"
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f3f4f6';
                  e.target.style.borderColor = '#3b82f6';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'white';
                  e.target.style.borderColor = '#d1d5db';
                }}
              >
                <span>Purchase Prediction {Array.isArray(filters.purchasePrediction) && filters.purchasePrediction.length > 0 && `(${filters.purchasePrediction.length})`} <span className="ntp-filter-required-badge">*</span></span>
              </button>
            </div>
          )}

          {activeFilterMenu === 'companyName' && (
            <div className="ntp-filter-button-wrapper">
              <div className="ntp-filter-active-badge">
                <span>Company Name {Array.isArray(filters.companyName) && filters.companyName.length > 0 && `(${filters.companyName.length})`}</span>
                <button
                  onClick={() => {
                    setActiveFilterMenu(null);
                    setFilters(prev => ({ ...prev, companyName: [] }));
                  }}
                  className="ntp-filter-close-btn"
                >
                  ✕
                </button>
              </div>
              <div className="ntp-filter-dropdown-wrapper">
                {/* Search Bar */}
                <div className="ntp-filter-search-box">
                  <input
                    type="text"
                    placeholder="Search companies..."
                    value={companyNameSearch}
                    onChange={(e) => setCompanyNameSearch(e.target.value)}
                    className="ntp-filter-search-input"
                  />
                </div>
                {getUniqueOptions('companyName')
                  .filter(option => {
                    // Only show companies that have valid NTP data (not "Not Detected")
                    const hasValidData = tableData.some(row => 
                      row.companyName === option && 
                      row.category !== 'Not Detected' && 
                      row.purchasePrediction !== 'Not Detected' && 
                      row.purchasePrediction !== 'NOT detected'
                    );
                    return hasValidData && option.toLowerCase().includes(companyNameSearch.toLowerCase());
                  })
                  .map((option, idx) => {
                  const isSelected = Array.isArray(filters.companyName) && filters.companyName.includes(option);
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        handleFilterChange('companyName', option);
                      }}
                      className={`ntp-filter-option ${isSelected ? 'selected' : ''}`}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = isSelected ? '#dbeafe' : 'white'}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="ntp-filter-option-checkbox"
                      />
                      {option}
                    </div>
                  );
                })}

                {}
                <div className="ntp-filter-footer">
                  <button
                    onClick={() => {
                      setActiveFilterMenu(null);
                    }}
                    className="ntp-filter-save-btn"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}

          {}
          {activeFilterMenu === 'purchasePrediction' && (
            <div className="ntp-filter-button-wrapper">
              <div className="ntp-filter-active-badge selected">
                <span>Purchase Prediction {Array.isArray(filters.purchasePrediction) && filters.purchasePrediction.length > 0 && `(${filters.purchasePrediction.length})`} <span className="ntp-filter-required-badge">*</span></span>
                <button
                  onClick={() => {
                    setActiveFilterMenu(null);
                    setFilters(prev => ({ ...prev, purchasePrediction: [] }));
                  }}
                  className="ntp-filter-close-btn"
                >
                  ✕
                </button>
              </div>
              <div className="ntp-filter-dropdown-wrapper">
                <div
                  onClick={() => {
                    const validOptions = getUniqueOptions('purchasePrediction').filter(option => option !== 'NOT detected');
                    if (Array.isArray(filters.purchasePrediction) && filters.purchasePrediction.length === validOptions.length && validOptions.length > 0) {
                      
                      setFilters(prev => ({ ...prev, purchasePrediction: [] }));
                    } else {
                      
                      setFilters(prev => ({ ...prev, purchasePrediction: validOptions }));
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
                    checked={Array.isArray(filters.purchasePrediction) && filters.purchasePrediction.length === getUniqueOptions('purchasePrediction').filter(option => option !== 'NOT detected').length && getUniqueOptions('purchasePrediction').filter(option => option !== 'NOT detected').length > 0}
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
                {getUniqueOptions('purchasePrediction')
                  .filter(option => option !== 'Not Detected')
                  .sort((a, b) => {
                    const countA = getCompanyCountByPurchasePrediction(a);
                    const countB = getCompanyCountByPurchasePrediction(b);
                    return countB - countA;
                  })
                  .map((option, idx) => {
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

                {}
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

          {}
          {activeFilterMenu !== 'category' && (
            <div className="ntp-filter-button-wrapper">
              <button
                onClick={() => setActiveFilterMenu('category')}
                className="ntp-filter-button"
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f3f4f6';
                  e.target.style.borderColor = '#3b82f6';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'white';
                  e.target.style.borderColor = '#d1d5db';
                }}
              >
                <span>Category {Array.isArray(filters.category) && filters.category.length > 0 && `(${filters.category.length})`} <span className="ntp-filter-required-badge">*</span></span>
              </button>
            </div>
          )}

          {}
          {activeFilterMenu === 'category' && (
            <div className="ntp-filter-button-wrapper">
              <div className="ntp-filter-active-badge selected">
                <span>Category {Array.isArray(filters.category) && filters.category.length > 0 && `(${filters.category.length})`} <span className="ntp-filter-required-badge">*</span></span>
                <button
                  onClick={() => {
                    setActiveFilterMenu(null);
                    setFilters(prev => ({ ...prev, category: [] }));
                  }}
                  className="ntp-filter-close-btn"
                >
                  ✕
                </button>
              </div>
              <div className="ntp-filter-dropdown-wrapper">
                <div
                  onClick={() => {
                    const validOptions = getUniqueOptions('category').filter(option => option !== 'Not Detected');
                    if (Array.isArray(filters.category) && filters.category.length === validOptions.length && validOptions.length > 0) {
                      
                      setFilters(prev => ({ ...prev, category: [] }));
                    } else {
                      
                      setFilters(prev => ({ ...prev, category: validOptions }));
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
                    checked={Array.isArray(filters.category) && filters.category.length === getUniqueOptions('category').filter(option => option !== 'NOT detected').length && getUniqueOptions('category').filter(option => option !== 'NOT detected').length > 0}
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
                {getUniqueOptions('category')
                  .filter(option => option !== 'Not Detected')
                  .sort((a, b) => {
                    const countA = getCompanyCountByCategory(a);
                    const countB = getCompanyCountByCategory(b);
                    return countB - countA;
                  })
                  .map((option, idx) => {
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

                {}
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

          {}
          {activeFilterMenu === 'technology' && (
            <div className="ntp-filter-button-wrapper">
              <div className="ntp-filter-active-badge">
                <span>Technology {Array.isArray(filters.technology) && filters.technology.length > 0 && `(${filters.technology.length})`}</span>
                <button
                  onClick={() => {
                    setActiveFilterMenu(null);
                    setFilters(prev => ({ ...prev, technology: [] }));
                  }}
                  className="ntp-filter-close-btn"
                >
                  ✕
                </button>
              </div>
              <div className="ntp-filter-dropdown-wrapper">
                <div
                  onClick={() => {
                    if (Array.isArray(filters.technology) && filters.technology.length === getUniqueOptions('technology').length && getUniqueOptions('technology').length > 0) {
                      
                      setFilters(prev => ({ ...prev, technology: [] }));
                    } else {
                      
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
                {getUniqueOptions('technology')
                  .sort((a, b) => {
                    const countA = getCompanyCountByTechnology(a);
                    const countB = getCompanyCountByTechnology(b);
                    return countB - countA;
                  })
                  .map((option, idx) => {
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

                {}
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

          {}
          {Array.isArray(filters.companyName) && filters.companyName.length > 0 && activeFilterMenu !== 'companyName' && (
            <div className="ntp-filter-active-badge"
            onClick={() => setActiveFilterMenu('companyName')}
            >
              <span>Company Name: {filters.companyName.length} selected</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFilters(prev => ({ ...prev, companyName: [] }));
                }}
                className="ntp-filter-close-btn"
              >
                ✕
              </button>
            </div>
          )}

          {Array.isArray(filters.technology) && filters.technology.length > 0 && activeFilterMenu !== 'technology' && (
            <div className="ntp-filter-active-badge"
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
                className="ntp-filter-close-btn"
              >
                ✕
              </button>
            </div>
          )}
          </div>
          
          {}
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

      {}
      {/* Table always shows by default, no mandatory filters required */}
      
      <div className="table-container">
        <table>
          <thead className="sticky-header">
            <tr>
              <th className="ntp-table-checkbox-header">
                <input
                  type="checkbox"
                  className="ntp-table-checkbox"
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
                />
              </th>
              <th>Company Name</th>
              <th>Category</th>
              <th>Purchase Prediction</th>
              <th>Technology</th>
              <th>Purchase Propensity (%)</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              
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

              const allCompanies = [];
              Object.values(groupedData).forEach(group => {
                Array.from(group.companies.values()).forEach(company => {
                  allCompanies.push({ ...company, category: group.category, purchasePrediction: group.purchasePrediction });
                });
              });

              const totalCompanies = allCompanies.length;
              const totalPages = Math.ceil(totalCompanies / rowsPerPage);
              const startIndex = (currentPage - 1) * rowsPerPage;
              const endIndex = Math.min(startIndex + rowsPerPage, totalCompanies);
              const paginatedCompanies = allCompanies.slice(startIndex, endIndex);

              return paginatedCompanies.map((company, companyIndex) => {
                const actualIndex = startIndex + companyIndex;
                const companyRowSpan = company.technologies.length > 3 ? 1 : company.technologies.length;

                return company.technologies.map((tech, techIndex) => {
                  const isFirstTechRow = techIndex === 0;
                  
                  if (company.technologies.length > 3 && techIndex > 0) {
                    return null;
                  }

                  return (
                    <tr key={`${actualIndex}-${techIndex}`} className={isFirstTechRow ? 'company-separator' : ''}>
                      {}
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

                      {isFirstTechRow && (
                        <td rowSpan={companyRowSpan}>
                          <div className="ntp-company-cell">
                            <div className="ntp-company-name">
                              {company.companyName}
                            </div>
                            <div className="ntp-company-links">
                              {company.domain && (
                                <a
                                    href={`https://${company.domain}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ntp-company-link"
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
                                    className="ntp-linkedin-link"
                                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                                    title="View LinkedIn Profile"
                                  >
                                    <FaLinkedin size={20} />
                                  </a>
                                )}
                            </div>
                          </div>
                        </td>
                      )}

                      {isFirstTechRow && (
                        <td rowSpan={companyRowSpan}>
                          <span style={{ display: 'flex', alignItems: 'center' }}>
                            {renderTechLogo(company.category)}
                            {company.category}
                          </span>
                        </td>
                      )}

                      {}
                      {isFirstTechRow && (
                        <td rowSpan={companyRowSpan}>
                          {company.purchasePrediction}
                        </td>
                      )}

                      {}
                      <td>
                        {company.technologies.length > 3 ? (
                          <div 
                            ref={techScrollRef}
                            className="ntp-tech-scroll-container"
                            onScroll={handleTechScroll}
                          >
                            {company.technologies.map((t, idx) => (
                              <span key={idx} className="ntp-tech-item">
                                {renderTechLogo(t.technology)}
                                {t.technology}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="ntp-tech-item">
                            {renderTechLogo(tech.technology)}
                            {tech.technology}
                          </span>
                        )}
                      </td>

                      {}
                      <td>
                        {company.technologies.length > 3 ? (
                          <div 
                            ref={propensityScrollRef}
                            className="ntp-tech-scroll-container"
                            onScroll={handlePropensityScroll}
                          >
                            {company.technologies.map((t, idx) => (
                              <span key={idx} className="ntp-propensity-item">
                                {(() => {
                                  const val = String(t.purchaseProbability || '0').replace('%', '');
                                  return `${parseFloat(val).toFixed(2)}%`;
                                })()}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="ntp-propensity-item">
                            {(() => {
                              const val = String(tech.purchaseProbability || '0').replace('%', '');
                              return `${parseFloat(val).toFixed(2)}%`;
                            })()}
                          </span>
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

      {}
      {filteredData.length > 0 && (() => {
        const groupedData = {};
        const uniqueCompanies = new Set();
        
        filteredData.forEach(row => {
          const key = `${row.category}|${row.purchasePrediction}`;
          if (!groupedData[key]) {
            groupedData[key] = { companies: new Map() };
          }
          if (!groupedData[key].companies.has(row.companyName)) {
            groupedData[key].companies.set(row.companyName, true);
          }
          // Add to unique companies set
          uniqueCompanies.add(row.companyName);
        });
        
        const totalCompanies = uniqueCompanies.size;
        const totalPages = Math.ceil(totalCompanies / rowsPerPage);
        const startIndex = (currentPage - 1) * rowsPerPage + 1;
        const endIndex = Math.min(currentPage * rowsPerPage, totalCompanies);

        return totalPages > 1 ? (
          <div className="ntp-pagination-wrapper">
            <div className="ntp-pagination-info">
              Page {currentPage} of {totalPages.toLocaleString()}
            </div>

            {}
            <div className="ntp-pagination-controls">
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
                    {}
                    <button
                      key="first"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="ntp-pagination-button"
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

                    {}
                    <button
                      key="prev"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="ntp-pagination-button"
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

                    {}
                    {startPage > 1 && (
                      <>
                        <button
                          key={1}
                          onClick={() => setCurrentPage(1)}
                          className="ntp-pagination-button"
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
                        {startPage > 2 && <span className="ntp-pagination-ellipsis">...</span>}
                      </>
                    )}

                    {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(i => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i)}
                        className={`ntp-pagination-button ${i === currentPage ? 'active' : ''}`}
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

                    {}
                    <button
                      key="next"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="ntp-pagination-button"
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

                    {}
                    <button
                      key="last"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="ntp-pagination-button"
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

            <div className="ntp-pagination-results">
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

      <ChatBot isAuthenticated={true} revealedRows={revealedRows} tableData={tableData} />
    </div>
  );
};

export default NTP;