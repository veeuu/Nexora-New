import { useState, useEffect, useRef } from 'react';
import * as SiIcons from 'react-icons/si';
import { getLogoPath, getTechIcon } from '../../utils/logoMap';
import nexoraLogo from '../../assets/nexora-logo.png';
import '../../styles/RenewalIntelligence.css';
import '../../styles.css';

// Generic Custom Dropdown Component (without icons)
const CustomDropdown = ({ value, onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="custom-dropdown">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="dropdown-button"
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
      >
        <span>{value || 'All'}</span>
        <span style={{ fontSize: '12px' }}>▼</span>
      </button>

      {isOpen && (
        <div className="dropdown-menu">
          <div
            onClick={() => {
              onChange('');
              setIsOpen(false);
            }}
            className={`dropdown-menu-item ${value === '' ? 'selected' : ''}`}
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
              className={`dropdown-menu-item ${value === option ? 'selected' : ''}`}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Custom Dropdown Component with Icons for Products
const CustomProductDropdown = ({ value, onChange, options, renderIcon }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="custom-dropdown">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="dropdown-button"
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
      >
        <span className="dropdown-button-content">
          {value && renderIcon(value)}
          {value || 'All'}
        </span>
        <span style={{ fontSize: '12px' }}>▼</span>
      </button>

      {isOpen && (
        <div className="dropdown-menu">
          <div
            onClick={() => {
              onChange('');
              setIsOpen(false);
            }}
            className={`dropdown-menu-item ${value === '' ? 'selected' : ''}`}
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
              className={`dropdown-menu-item ${value === option ? 'selected' : ''}`}
            >
              {renderIcon(option)}
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const RenewalIntelligence = () => {
    const [filters, setFilters] = useState({
        companyName: [],
        product: [],
        qtr: []
    });
    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [tooltip, setTooltip] = useState({ show: false, text: '', x: 0, y: 0 });
    const [showFilters, setShowFilters] = useState(false);
    const [activeFilterMenu, setActiveFilterMenu] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 9;
    const filterRef = useRef(null);

    // Icon mapping for products
    const getProductIcon = (productName) => {
        if (!productName) return null;
        
        const productLower = productName.toLowerCase();
        
        // Check for SAP or VMware anywhere in the name (priority check)
        if (productLower.includes('sap')) {
            return 'SiSap';
        }
        if (productLower.includes('vmware')) {
            return 'SiVmware';
        }
        
        // Map product names to react-icons component names
        const iconMap = {
            'aws': 'SiAmazonaws',
            'amazon': 'SiAmazonaws',
            'azure': 'SiMicrosoftazure',
            'microsoft': 'SiMicrosoft',
            'google cloud': 'SiGooglecloud',
            'gcp': 'SiGooglecloud',
            'docker': 'SiDocker',
            'kubernetes': 'SiKubernetes',
            'jenkins': 'SiJenkins',
            'git': 'SiGit',
            'github': 'SiGithub',
            'gitlab': 'SiGitlab',
            'python': 'SiPython',
            'java': 'SiJava',
            'javascript': 'SiJavascript',
            'react': 'SiReact',
            'nodejs': 'SiNodedotjs',
            'node.js': 'SiNodedotjs',
            'mongodb': 'SiMongodb',
            'postgresql': 'SiPostgresql',
            'mysql': 'SiMysql',
            'redis': 'SiRedis',
            'elasticsearch': 'SiElasticsearch',
            'kafka': 'SiApachekafka',
            'spark': 'SiApachespark',
            'hadoop': 'SiApachehadoop',
            'tensorflow': 'SiTensorflow',
            'pytorch': 'SiPytorch',
            'ai': 'SiOpenai',
            'ml': 'SiTensorflow',
            'machine learning': 'SiTensorflow',
            'salesforce': 'SiSalesforce',
            'oracle': 'SiOracle',
            'linux': 'SiLinux',
            'windows': 'SiWindows',
            'macos': 'SiApple',
            'ios': 'SiApple',
            'android': 'SiAndroid',
            'nginx': 'SiNginx',
            'apache': 'SiApache',
            'tomcat': 'SiApachetomcat',
            'esxi': 'SiVmware',
            'esx': 'SiVmware',
            'aria': 'SiVmware',
            'horizon': 'SiVmware',
            'nsx': 'SiVmware',
            'carbon black': 'SiVmware',
            'generative ai': 'SiOpenai',
            'ai / cloud + ai': 'SiOpenai',
            'oracle cloud': 'SiOracle',
            'oracle erp': 'SiOracle',
            'oracle cloud applications': 'SiOracle'
        };
        
        const iconName = iconMap[productLower];
        return iconName;
    };

    // Render icon component
    const renderProductIcon = (productName) => {
        if (!productName) return null;
        
        // First try to get logo image
        const logoPath = getLogoPath(productName);
        
        if (logoPath) {
            return (
                <img
                    src={logoPath}
                    alt={productName}
                    title={productName}
                    className="product-icon"
                    onError={(e) => {
                        e.target.style.display = 'none';
                    }}
                />
            );
        }
        
        // Try to get colored icon (includes robot icon for AI/ML)
        const iconData = getTechIcon(productName);
        if (iconData) {
            const { component: IconComponent, color } = iconData;
            return (
                <IconComponent
                    size={16}
                    className="product-icon-component"
                    style={{ color: color }}
                    title={productName}
                />
            );
        }
        
        // Fallback to SI icon if no logo or tech icon found
        const iconName = getProductIcon(productName);
        if (!iconName) return null;
        
        const IconComponent = SiIcons[iconName];
        if (!IconComponent) return null;
        
        return (
            <IconComponent
                size={16}
                className="product-icon-component"
                title={productName}
            />
        );
    };

    // Fetch renewal data once on component mount
    useEffect(() => {
        setLoading(true);
        const fetchRenewalData = async () => {
            try {
                const response = await fetch('/api/renewal-intelligence');
                const data = await response.json();
                setTableData(data);
            } catch (error) {
                console.error('Error fetching renewal data:', error);
                setTableData([]);
            } finally {
                // Add 2-second delay before hiding loading screen
                setTimeout(() => {
                    setLoading(false);
                }, 1000);
            }
        };
        fetchRenewalData();
    }, []);

    // Handle click outside to close dropdowns
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

    const handleFilterChange = (name, value) => {
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
        setCurrentPage(1);
    };

    const downloadCSV = (dataToDownload) => {
        if (dataToDownload.length === 0) {
            alert('No data to download');
            return;
        }

        // Create CSV header
        const headers = ['Company Name', 'Product', 'Renewal Intelligence'];
        const csvContent = [
            headers.join(','),
            ...dataToDownload.map(row =>
                [row.companyName, row.product, row.qtr]
                    .map(field => `"${field}"`)
                    .join(',')
            )
        ].join('\n');

        // Create blob and download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `renewal-intelligence-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getUniqueCompanies = () => {
        if (!tableData) return [];
        const allCompanies = tableData.map(item => item.companyName);
        return [...new Set(allCompanies)].sort();
    };

    const getUniqueProducts = () => {
        if (!tableData) return [];
        const allProducts = tableData.map(item => item.product);
        return [...new Set(allProducts)].sort();
    };

    const getUniqueQtrs = () => {
        if (!tableData) return [];
        const allQtrs = tableData.map(item => item.qtr);
        return [...new Set(allQtrs)].sort();
    };

    // Helper function to count accounts by product
    const getAccountCountByProduct = (product) => {
        if (!tableData) return 0;
        const uniqueAccounts = new Set();
        tableData.forEach(row => {
            if (row.product === product) {
                uniqueAccounts.add(row.companyName);
            }
        });
        return uniqueAccounts.size;
    };

    // Helper function to count accounts by renewal timeline (qtr)
    const getAccountCountByQtr = (qtr) => {
        if (!tableData) return 0;
        const uniqueAccounts = new Set();
        tableData.forEach(row => {
            if (row.qtr === qtr) {
                uniqueAccounts.add(row.companyName);
            }
        });
        return uniqueAccounts.size;
    };

    // Check if mandatory filters are selected
    const hasMandatoryFilters = filters.companyName.length > 0 && filters.product.length > 0 && filters.qtr.length > 0;

    const filteredData = tableData.filter(row => {
        // Mandatory filters - must have all three: company name, product, and qtr
        if (!hasMandatoryFilters) return false;

        const companyMatch = filters.companyName.includes(row.companyName);
        const productMatch = filters.product.includes(row.product);
        const qtrMatch = filters.qtr.includes(row.qtr);
        return companyMatch && productMatch && qtrMatch;
    });

    // Calculate chart data from filtered data
    const getChartData = () => {
        const qtrCounts = {};
        const colors = {
            'Q1 2025': '#06b6d4',
            'Q2 2025': '#00432cff',
            'Q3 2025': '#f59e0b',
            'Q4 2025': '#4497efff',
            'Q1 2026': '#8b5cf6',
            'Q2 2026': '#001f3f9f'
        };

        filteredData.forEach(row => {
            const qtr = row.qtr || 'Unknown';
            qtrCounts[qtr] = (qtrCounts[qtr] || 0) + 1;
        });

        const chartArray = Object.entries(qtrCounts).map(([qtr, count]) => ({
            label: qtr,
            value: count,
            color: colors[qtr] || '#9ca3af'
        }));

        // Sort quarters from future to past (2026 first, then 2025, etc.)
        // Within each year, sort Q1, Q2, Q3, Q4
        chartArray.sort((a, b) => {
            const parseQtr = (qtrStr) => {
                const match = qtrStr.match(/Q(\d+)\s(\d{4})/);
                if (!match) return { year: 0, quarter: 0 };
                return { year: parseInt(match[2]), quarter: parseInt(match[1]) };
            };

            const aQtr = parseQtr(a.label);
            const bQtr = parseQtr(b.label);

            // Sort by year descending (future first), then by quarter ascending (Q1, Q2, Q3, Q4)
            if (aQtr.year !== bQtr.year) {
                return bQtr.year - aQtr.year;
            }
            return aQtr.quarter - bQtr.quarter;
        });

        return chartArray;
    };

    const chartData = getChartData();
    const maxChartValue = chartData.length > 0 ? Math.max(...chartData.map(d => d.value)) : 0;

    if (loading) {
      return (
        <div className="loading-container">
          {/* Nexora Logo */}
          <img src={nexoraLogo} alt="Nexora Logo" className="loading-logo" />

          {/* Subtext */}
          <p className="loading-subtext">
            Fetching and processing renewal data...
          </p>

          {/* Progress Dots */}
          <div className="loading-dots">
            <div className="loading-dot" style={{ animation: 'bounce 1.4s infinite' }} />
            <div className="loading-dot" style={{ animation: 'bounce 1.4s infinite 0.2s' }} />
            <div className="loading-dot" style={{ animation: 'bounce 1.4s infinite 0.4s' }} />
          </div>
        </div>
      );
    }

    return (
        <div className="renewal-intelligence-container">
            <div className="header-actions">
                <h2 style={{ fontSize: '32px', fontWeight: '700' }}>Renewal Intelligence</h2>
                <div className="actions-right" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: 'auto' }}>
                </div>
            </div>

            <div className="section-subtle-divider" />

            <div className="filter-container" ref={filterRef}>
              <div className="filter-row">
                <div className="filter-chips">
                {/* Filter Button - Always visible */}
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="filter-button"
                  >
                    <span>+ Filter</span>
                  </button>

                {/* Filter Menu Dropdown */}
                {showFilters && (
                  <div className="filter-menu">
                    {[
                      { label: 'Account Name', key: 'companyName', mandatory: true },
                      { label: 'Product', key: 'product', mandatory: true },
                      { label: 'Renewal Timeline', key: 'qtr', mandatory: true }
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
                          <span className="mandatory-indicator">*</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

                {/* Account Name Filter Chip */}
                {activeFilterMenu === 'companyName' && (
                  <div style={{ position: 'relative' }}>
                    <div className="filter-chip">
                      <span>Account Name ({filters.companyName.length}) <span className="mandatory-indicator">*</span></span>
                      <button
                        onClick={() => {
                          setActiveFilterMenu(null);
                          setFilters(prev => ({ ...prev, companyName: [] }));
                        }}
                        className="filter-chip-close"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="filter-dropdown">
                      <div
                        onClick={() => {
                          if (filters.companyName.length === getUniqueCompanies().length && filters.companyName.length > 0) {
                            // If all are selected, deselect all
                            handleFilterChange('companyName', []);
                          } else {
                            // Otherwise select all
                            handleFilterChange('companyName', getUniqueCompanies());
                          }
                        }}
                        className={`filter-option ${filters.companyName.length === getUniqueCompanies().length && filters.companyName.length > 0 ? 'filter-option-selected' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={filters.companyName.length === getUniqueCompanies().length && filters.companyName.length > 0}
                          onChange={() => {}}
                          className="filter-checkbox"
                        />
                        All
                      </div>
                      {getUniqueCompanies().map((option, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            const newCompanies = filters.companyName.includes(option)
                              ? filters.companyName.filter(c => c !== option)
                              : [...filters.companyName, option];
                            handleFilterChange('companyName', newCompanies);
                          }}
                          className={`filter-option ${filters.companyName.includes(option) ? 'filter-option-selected' : ''}`}
                        >
                          <input
                            type="checkbox"
                            checked={filters.companyName.includes(option)}
                            onChange={() => {}}
                            className="filter-checkbox"
                          />
                          {option}
                        </div>
                      ))}

                      {/* Save Button */}
                      <div className="filter-footer">
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

                {/* Product Filter Chip */}
                {activeFilterMenu === 'product' && (
                  <div style={{ position: 'relative' }}>
                    <div className="filter-chip">
                      <span>Product ({filters.product.length}) <span className="mandatory-indicator">*</span></span>
                      <button
                        onClick={() => {
                          setActiveFilterMenu(null);
                          setFilters(prev => ({ ...prev, product: [] }));
                        }}
                        className="filter-chip-close"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="filter-dropdown">
                      <div
                        onClick={() => {
                          if (filters.product.length === getUniqueProducts().length && filters.product.length > 0) {
                            // If all are selected, deselect all
                            handleFilterChange('product', []);
                          } else {
                            // Otherwise select all
                            handleFilterChange('product', getUniqueProducts());
                          }
                        }}
                        className={`filter-option ${filters.product.length === getUniqueProducts().length && filters.product.length > 0 ? 'filter-option-selected' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={filters.product.length === getUniqueProducts().length && filters.product.length > 0}
                          onChange={() => {}}
                          className="filter-checkbox"
                        />
                        All
                      </div>
                      {getUniqueProducts().map((option, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            const newProducts = filters.product.includes(option)
                              ? filters.product.filter(p => p !== option)
                              : [...filters.product, option];
                            handleFilterChange('product', newProducts);
                          }}
                          className={`filter-option ${filters.product.includes(option) ? 'filter-option-selected' : ''}`}
                        >
                          <div className="filter-option-text">
                            <input
                              type="checkbox"
                              checked={filters.product.includes(option)}
                              onChange={() => {}}
                              className="filter-checkbox"
                            />
                            {renderProductIcon(option)}
                            {option}
                          </div>
                          <span className="filter-option-count">
                            {getAccountCountByProduct(option)}
                          </span>
                        </div>
                      ))}

                      {/* Save Button */}
                      <div className="filter-footer">
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

                {/* Renewal Timeline Filter Chip */}
                {activeFilterMenu === 'qtr' && (
                  <div style={{ position: 'relative' }}>
                    <div className="filter-chip">
                      <span>Renewal Timeline ({filters.qtr.length}) <span className="mandatory-indicator">*</span></span>
                      <button
                        onClick={() => {
                          setActiveFilterMenu(null);
                          setFilters(prev => ({ ...prev, qtr: [] }));
                        }}
                        className="filter-chip-close"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="filter-dropdown">
                      <div
                        onClick={() => {
                          if (filters.qtr.length === getUniqueQtrs().length && filters.qtr.length > 0) {
                            // If all are selected, deselect all
                            handleFilterChange('qtr', []);
                          } else {
                            // Otherwise select all
                            handleFilterChange('qtr', getUniqueQtrs());
                          }
                        }}
                        className={`filter-option ${filters.qtr.length === getUniqueQtrs().length && filters.qtr.length > 0 ? 'filter-option-selected' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={filters.qtr.length === getUniqueQtrs().length && filters.qtr.length > 0}
                          onChange={() => {}}
                          className="filter-checkbox"
                        />
                        All
                      </div>
                      {getUniqueQtrs().map((option, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            const newQtrs = filters.qtr.includes(option)
                              ? filters.qtr.filter(q => q !== option)
                              : [...filters.qtr, option];
                            handleFilterChange('qtr', newQtrs);
                          }}
                          className={`filter-option ${filters.qtr.includes(option) ? 'filter-option-selected' : ''}`}
                        >
                          <div className="filter-option-text">
                            <input
                              type="checkbox"
                              checked={filters.qtr.includes(option)}
                              onChange={() => {}}
                              className="filter-checkbox"
                            />
                            <span>{option}</span>
                          </div>
                          <span className="filter-option-count">
                            {getAccountCountByQtr(option)}
                          </span>
                        </div>
                      ))}

                      {/* Save Button */}
                      <div className="filter-footer">
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

                {/* Display saved filter tags */}
                {filters.companyName.length > 0 && activeFilterMenu !== 'companyName' && (
                  <div className="warning-chip">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      Account Name ({filters.companyName.length}) <span className="mandatory-indicator">*</span>
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFilters(prev => ({ ...prev, companyName: [] }));
                      }}
                      className="warning-chip-close"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {filters.product.length > 0 && activeFilterMenu !== 'product' && (
                  <div className="warning-chip">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      Product ({filters.product.length}) <span className="mandatory-indicator">*</span>
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFilters(prev => ({ ...prev, product: [] }));
                      }}
                      className="warning-chip-close"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {filters.qtr.length > 0 && activeFilterMenu !== 'qtr' && (
                  <div className="warning-chip">
                    <span>Renewal Timeline ({filters.qtr.length}) <span className="mandatory-indicator">*</span></span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFilters(prev => ({ ...prev, qtr: [] }));
                      }}
                      className="warning-chip-close"
                    >
                      ✕
                    </button>
                  </div>
                )}
                </div>
                
                {/* Download CSV Button - Show in filter row only when warning message is hidden */}
                {filters.companyName.length > 0 && filters.product.length > 0 && filters.qtr.length > 0 && (
                  <button
                    onClick={() => downloadCSV(filteredData)}
                    className="download-csv-button"
                  >
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

            {/* Main Content Container */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', minWidth: 0 }}>
                {/* Table Section - Left */}
                <div style={{ minWidth: 0 }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            Loading data...
                        </div>
                    ) : !hasMandatoryFilters ? (
                        <div className="table-container">
                            <table>
                                <thead className="sticky-header">
                                    <tr>
                                        <th style={{ textAlign: 'left' }}>Company Name</th>
                                        <th style={{ textAlign: 'left' }}>Product</th>
                                        <th style={{ textAlign: 'left' }}>Renewal Intelligence</th>
                                    </tr>
                                </thead>
                            </table>
                        </div>
                    ) : (
                        <div className="table-container">
                            <table>
                                <thead className="sticky-header">
                                    <tr>
                                        <th style={{ textAlign: 'left' }}>Company Name</th>
                                        <th style={{ textAlign: 'left' }}>Product</th>
                                        <th style={{ textAlign: 'left' }}>Renewal Intelligence</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.length === 0 ? (
                                        <tr>
                                            <td colSpan="3" style={{ textAlign: 'center', padding: '40px', color: '#9ca3af', height: '400px', verticalAlign: 'middle' }}>
                                                No data available for the selected filters
                                            </td>
                                        </tr>
                                    ) : (
                                        (() => {
                                            const totalPages = Math.ceil(filteredData.length / rowsPerPage);
                                            const startIndex = (currentPage - 1) * rowsPerPage;
                                            const endIndex = startIndex + rowsPerPage;
                                            const paginatedData = filteredData.slice(startIndex, endIndex);

                                            return paginatedData.map((row, index) => (
                                                <tr key={index}>
                                                    <td style={{ textAlign: 'left' }} onMouseEnter={(e) => {
                                                        const rect = e.target.getBoundingClientRect();
                                                        setTooltip({
                                                            show: true,
                                                            text: row.companyName,
                                                            x: rect.right - 20,
                                                            y: rect.bottom + 20
                                                        });
                                                    }} onMouseLeave={() => setTooltip({ show: false, text: '', x: 0, y: 0 })}>
                                                        {row.companyName}
                                                    </td>
                                                    <td onMouseEnter={(e) => {
                                                        const rect = e.target.getBoundingClientRect();
                                                        setTooltip({
                                                            show: true,
                                                            text: row.product,
                                                            x: rect.right - 20,
                                                            y: rect.bottom + 20
                                                        });
                                                    }} onMouseLeave={() => setTooltip({ show: false, text: '', x: 0, y: 0 })}>
                                                        <span style={{ display: 'flex', alignItems: 'center' }}>
                                                            {renderProductIcon(row.product)}
                                                            {row.product}
                                                        </span>
                                                    </td>
                                                    <td onMouseEnter={(e) => {
                                                        const rect = e.target.getBoundingClientRect();
                                                        setTooltip({
                                                            show: true,
                                                            text: row.qtr,
                                                            x: rect.right - 20,
                                                            y: rect.bottom + 20
                                                        });
                                                    }} onMouseLeave={() => setTooltip({ show: false, text: '', x: 0, y: 0 })}>
                                                        {row.qtr}
                                                    </td>
                                                </tr>
                                            ));
                                        })()
                                    )}
                                </tbody>
                            </table>

                            {/* Pagination Controls */}
                            {filteredData.length > rowsPerPage && (
                            <div className="pagination-container">
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
                                                className="pagination-button"
                                            >
                                                ← Prev
                                            </button>

                                            {startPage > 1 && (
                                                <>
                                                    <button
                                                        key={1}
                                                        onClick={() => setCurrentPage(1)}
                                                        className="pagination-page"
                                                    >
                                                        1
                                                    </button>
                                                    {startPage > 2 && <span className="pagination-dots">...</span>}
                                                </>
                                            )}

                                            {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setCurrentPage(i)}
                                                    className={`pagination-page ${i === currentPage ? 'active' : ''}`}
                                                >
                                                    {i}
                                                </button>
                                            ))}

                                            {endPage < totalPages && (
                                                <>
                                                    {endPage < totalPages - 1 && <span className="pagination-dots">...</span>}
                                                    <button
                                                        key={totalPages}
                                                        onClick={() => setCurrentPage(totalPages)}
                                                        className="pagination-page"
                                                    >
                                                        {totalPages}
                                                    </button>
                                                </>
                                            )}

                                            <button
                                                key="next"
                                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                                disabled={currentPage === totalPages}
                                                className="pagination-button"
                                            >
                                                Next →
                                            </button>
                                        </>
                                    );
                                })()}
                            </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Custom Tooltip */}
            {tooltip.show && (
                <div
                    className="tooltip"
                    style={{
                        left: `${tooltip.x}px`,
                        top: `${tooltip.y}px`,
                    }}
                >
                    {tooltip.text}
                </div>
            )}
        </div>
    );
};

export default RenewalIntelligence;