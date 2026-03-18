import { useState, useEffect, useRef, useMemo } from 'react';
import { rowMatchesSearch, highlightText, Tooltip, createTooltipHandlers } from '../../utils/tableUtils';
import { getLogoPath, getTechIcon } from '../../utils/logoMap';
import loadingGif from '../../assets/Loading GIF - Clients.gif';
import { FaLinkedin, FaGlobe, FaRobot, FaLock, FaUnlock, FaCopy } from 'react-icons/fa';
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
  const [metadata, setMetadata] = useState({
    categories: [],
    technologies: [],
    predictions: [],
    companies: [],
    totalRecords: 0
  });
  const [summary, setSummary] = useState({
    categories: [],
    technologies: [],
    predictions: [],
    companies: [],
    totalRecords: 0
  });
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
  const [copiedCompany, setCopiedCompany] = useState(null);
  const [chatbotOpen, setChatbotOpen] = useState(true);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const rowsPerPage = 100;

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

  // Track when chatbot is closed for the first time
  useEffect(() => {
    if (!chatbotOpen && isFirstLoad) {
      setIsFirstLoad(false);
    }
  }, [chatbotOpen, isFirstLoad]);

  const renderTechLogo = (techName) => {
    if (!techName) return null;
    
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

  const handleDownloadCSV = async () => {
    try {
      const revealedRowKeys = new Set();
      filteredData.forEach((row, index) => {
        const rowKey = `${index}-${row.companyName}`;
        if (revealedRows.has(rowKey)) {
          const key = `${row.companyName}|${row.category}|${row.technology}|${row.purchasePrediction}`;
          revealedRowKeys.add(key);
        }
      });

      if (revealedRowKeys.size === 0) {
        alert('No revealed companies to download. Please reveal company details first.');
        return;
      }

      const queryParams = new URLSearchParams();
      if (filters.companyName.length > 0) {
        filters.companyName.forEach(name => queryParams.append('companyName', name));
      }
      if (filters.technology.length > 0) {
        filters.technology.forEach(tech => queryParams.append('technology', tech));
      }
      if (filters.purchasePrediction.length > 0) {
        filters.purchasePrediction.forEach(pred => queryParams.append('prediction', pred));
      }
      if (filters.category.length > 0) {
        filters.category.forEach(cat => queryParams.append('category', cat));
      }

      const response = await fetch(`/api/ntp/export?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to export ntp');
      }
      const text = await response.text();

      const rows = text
        .split('\n')
        .filter(Boolean)
        .map(line => {
          try {
            return JSON.parse(line);
          } catch (e) {
            return null;
          }
        })
        .filter(Boolean);

      const revealedData = rows.filter(row => {
        const key = `${row.companyName}|${row.category}|${row.technology}|${row.purchasePrediction}`;
        return revealedRowKeys.has(key);
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
    } catch (err) {
      alert('Failed to export NTP. Please try again.');
    }
  };

  const fetchPage = async (pageNum, retries = 3, delay = 500) => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', pageNum);
      queryParams.append('limit', rowsPerPage);

      if (filters.companyName.length > 0) {
        filters.companyName.forEach(name => queryParams.append('companyName', name));
      }
      if (filters.technology.length > 0) {
        filters.technology.forEach(tech => queryParams.append('technology', tech));
      }
      if (filters.purchasePrediction.length > 0) {
        filters.purchasePrediction.forEach(pred => queryParams.append('prediction', pred));
      }
      if (filters.category.length > 0) {
        filters.category.forEach(cat => queryParams.append('category', cat));
      }

      const response = await fetch(`/api/ntp?${queryParams.toString()}`);
      const data = await response.json();

      if (response.status === 503 && retries > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchPage(pageNum, retries - 1, Math.min(delay * 1.5, 5000));
      }

      setTableData(data.data || []);
      setTotalRecords(data.total || 0);
      setTotalPages(data.pages || 0);
      return data;
    } catch (err) {
      return null;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [metadataResponse, summaryResponse] = await Promise.all([
          fetch('/api/ntp/metadata'),
          fetch('/api/ntp/summary')
        ]);

        const metadataData = await metadataResponse.json();
        const summaryData = await summaryResponse.json();

        setMetadata(metadataData);
        setSummary(summaryData);

        await fetchPage(1);
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
    if (currentPage === 1) return;
    fetchPage(currentPage);
  }, [currentPage]);

  useEffect(() => {
    setCurrentPage(1);
    fetchPage(1);
  }, [filters]);

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
    if (key === 'companyName') return summary.companies || [];
    if (key === 'technology') return (summary.technologies || []).map(t => t.label);
    if (key === 'category') return (summary.categories || []).map(c => c.label);
    if (key === 'purchasePrediction') return (summary.predictions || []).map(p => p.label);

    if (!tableData) return [];
    const allValues = tableData.map(item => item[key]);
    return [...new Set(allValues)].sort();
  };

  const getCountFromSummary = (list, label) => {
    const match = (list || []).find(item => item.label === label);
    return match ? match.value : 0;
  };

  const getCompanyCountByCategory = (category) => getCountFromSummary(summary.categories, category);
  const getCompanyCountByTechnology = (technology) => getCountFromSummary(summary.technologies, technology);
  const getCompanyCountByPurchasePrediction = (prediction) => getCountFromSummary(summary.predictions, prediction);

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

  const handleCopyCompanyName = (companyName) => {
    navigator.clipboard.writeText(companyName);
    setCopiedCompany(companyName);
    setTimeout(() => setCopiedCompany(null), 2000);
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
    <div className="ntp-page-wrapper">
      <div className={`ntp-container ${chatbotOpen && isFirstLoad ? 'ntp-blur-active' : ''}`}>
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
        <h2>Next Tech Purchase (NTP®) </h2>
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
              >
                <span>Purchase Prediction <span className="ntp-filter-required-badge">*</span></span>
              </button>
            </div>
          )}

          {activeFilterMenu === 'companyName' && (
            <div className="ntp-filter-button-wrapper">
              <div className="ntp-filter-active-badge">
                <span>Company Name</span>
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
                <span>Purchase Prediction <span className="ntp-filter-required-badge">*</span></span>
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
                  className="ntp-filter-option-item"
                >
                  <input
                    type="checkbox"
                    checked={Array.isArray(filters.purchasePrediction) && filters.purchasePrediction.length === getUniqueOptions('purchasePrediction').filter(option => option !== 'NOT detected').length && getUniqueOptions('purchasePrediction').filter(option => option !== 'NOT detected').length > 0}
                    onChange={() => {}}
                    className="ntp-filter-option-item-checkbox"
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
                      className={`ntp-filter-option-item ${isSelected ? 'selected' : ''}`}
                    >
                      <div className="ntp-filter-option-item-content">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="ntp-filter-option-item-checkbox"
                        />
                        {option}
                      </div>
                      <span className="ntp-filter-option-item-count">
                        {getCompanyCountByPurchasePrediction(option)}
                      </span>
                    </div>
                  );
                })}

                {}
                <div className="ntp-filter-footer-container">
                  <button
                    onClick={() => {
                      setActiveFilterMenu(null);
                    }}
                    className="ntp-filter-footer-save-button"
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
              >
                <span>Category <span className="ntp-filter-required-badge">*</span></span>
              </button>
            </div>
          )}

          {}
          {activeFilterMenu === 'category' && (
            <div className="ntp-filter-button-wrapper">
              <div className="ntp-filter-active-badge selected">
                <span>Category <span className="ntp-filter-required-badge">*</span></span>
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
                  className="ntp-filter-option-item"
                >
                  <input
                    type="checkbox"
                    checked={Array.isArray(filters.category) && filters.category.length === getUniqueOptions('category').filter(option => option !== 'NOT detected').length && getUniqueOptions('category').filter(option => option !== 'NOT detected').length > 0}
                    onChange={() => {}}
                    className="ntp-filter-option-item-checkbox"
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
                      className={`ntp-filter-option-item ${isSelected ? 'selected' : ''}`}
                    >
                      <div className="ntp-filter-option-item-content">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="ntp-filter-option-item-checkbox"
                        />
                        <span className="ntp-category-tech-logo-span">
                          {renderTechLogo(option)}
                          {option}
                        </span>
                      </div>
                      <span className="ntp-filter-option-item-count">
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
                <span>Technology</span>
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
                  className="ntp-filter-option-item"
                >
                  <input
                    type="checkbox"
                    checked={Array.isArray(filters.technology) && filters.technology.length === getUniqueOptions('technology').length && getUniqueOptions('technology').length > 0}
                    onChange={() => {}}
                    className="ntp-filter-option-item-checkbox"
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
                      className={`ntp-filter-option-item ${isSelected ? 'selected' : ''}`}
                    >
                      <div className="ntp-filter-option-item-content">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="ntp-filter-option-item-checkbox"
                        />
                        {renderTechLogo(option)}
                        {option}
                      </div>
                      <span className="ntp-filter-option-item-count">
                        {getCompanyCountByTechnology(option)}
                      </span>
                    </div>
                  );
                })}

                {}
                <div className="ntp-filter-footer-container">
                  <button
                    onClick={() => {
                      setActiveFilterMenu(null);
                    }}
                    className="ntp-filter-footer-save-button"
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
              <span>
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
                        <td rowSpan={companyRowSpan} className="ntp-table-cell-checkbox">
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
                              <button
                                onClick={() => handleCopyCompanyName(company.companyName)}
                                className="ntp-copy-btn"
                                title="Copy company name"
                              >
                                <FaCopy size={14} />
                              </button>
                              {copiedCompany === company.companyName && (
                                <span className="ntp-copy-feedback">Copied!</span>
                              )}
                            </div>
                            <div className="ntp-company-links">
                              {company.domain && (
                                <a
                                    href={`https://${company.domain}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ntp-company-domain-link"
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
                                    className="ntp-company-linkedin-link"
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
                          <span className="ntp-table-cell-category">
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
        const totalPagesCount = Math.max(1, totalPages || Math.ceil((totalRecords || 0) / rowsPerPage));
        const startIndex = (currentPage - 1) * rowsPerPage + 1;
        const endIndex = Math.min(currentPage * rowsPerPage, totalRecords || 0);

        return totalPagesCount > 1 ? (
          <div className="ntp-pagination-wrapper">
            <div className="ntp-pagination-info">
              Page {currentPage} of {totalPagesCount.toLocaleString()}
            </div>

            {}
            <div className="ntp-pagination-controls">
              {(() => {
                const maxPagesToShow = 5;
                let startPage = 1;
                let endPage = Math.min(maxPagesToShow, totalPagesCount);

                if (currentPage > maxPagesToShow) {
                  startPage = currentPage - Math.floor(maxPagesToShow / 2);
                  endPage = startPage + maxPagesToShow - 1;

                  if (endPage > totalPagesCount) {
                    endPage = totalPagesCount;
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
                      >
                        {i}
                      </button>
                    ))}

                    {endPage < totalPagesCount && (
                      <>
                        {endPage < totalPagesCount - 1 && <span className="ntp-pagination-ellipsis">...</span>}
                        <button
                          key={totalPagesCount}
                          onClick={() => setCurrentPage(totalPagesCount)}
                          className="ntp-pagination-last-button"
                        >
                          {totalPagesCount}
                        </button>
                      </>
                    )}

                    {}
                    <button
                      key="next"
                      onClick={() => setCurrentPage(Math.min(totalPagesCount, currentPage + 1))}
                      disabled={currentPage === totalPagesCount}
                      className="ntp-pagination-button"
                      title="Next page"
                    >
                      ›
                    </button>

                    {}
                    <button
                      key="last"
                      onClick={() => setCurrentPage(totalPagesCount)}
                      disabled={currentPage === totalPagesCount}
                      className="ntp-pagination-button"
                      title="Last page"
                    >
                      ≫
                    </button>
                  </>
                );
              })()}
            </div>

            <div className="ntp-pagination-results">
              Showing {startIndex}-{endIndex} of {(totalRecords || 0).toLocaleString()} results
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

      </div>
      <ChatBot isAuthenticated={true} revealedRows={revealedRows} tableData={tableData} isOpen={chatbotOpen} setIsOpen={setChatbotOpen} />
    </div>
  );
};

export default NTP;
