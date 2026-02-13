import { useState, useEffect, useRef } from 'react';
import * as SiIcons from 'react-icons/si';
import { getLogoPath, getTechIcon } from '../../utils/logoMap';
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

// Custom Dropdown Component with Icons for Products
const CustomProductDropdown = ({ value, onChange, options, renderIcon }) => {
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
          gap: '8px',
          justifyContent: 'space-between'
        }}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {value && renderIcon(value)}
          {value || 'All'}
        </span>
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
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
              onMouseLeave={(e) => e.target.style.backgroundColor = value === option ? '#dbeafe' : 'white'}
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
                    style={{
                        width: '16px',
                        height: '16px',
                        marginRight: '6px',
                        display: 'inline-block',
                        verticalAlign: 'middle',
                        objectFit: 'contain'
                    }}
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
                    style={{
                        marginRight: '6px',
                        display: 'inline-block',
                        verticalAlign: 'middle',
                        color: color,
                        opacity: 0.85,
                        filter: 'drop-shadow(0 0 0.5px rgba(0,0,0,0.1))'
                    }}
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
                style={{
                    marginRight: '6px',
                    display: 'inline-block',
                    verticalAlign: 'middle'
                }}
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
            Fetching and processing renewal data...
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
        <div className="renewal-intelligence-container">
            <div className="header-actions">
                <h2 style={{ fontSize: '32px', fontWeight: '700' }}>Renewal Intelligence</h2>
                <div className="actions-right" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: 'auto' }}>
                  {/* <div className="search-bar">
                    <svg className="search-folder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <input 
                      type="text" 
                      placeholder="Search accounts..." 
                      value={filters.companyName}
                      onChange={(e) => handleFilterChange('companyName', e.target.value)}
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
                {/* Filter Button - Always visible */}
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

                {/* Account Name Filter Chip */}
                {activeFilterMenu === 'companyName' && (
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
                      <span>Account Name ({filters.companyName.length}) <span style={{ color: '#ef4444', fontWeight: '600' }}>*</span></span>
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
                          if (filters.companyName.length === getUniqueCompanies().length && filters.companyName.length > 0) {
                            // If all are selected, deselect all
                            handleFilterChange('companyName', []);
                          } else {
                            // Otherwise select all
                            handleFilterChange('companyName', getUniqueCompanies());
                          }
                        }}
                        style={{
                          padding: '10px 12px',
                          cursor: 'pointer',
                          backgroundColor: filters.companyName.length === getUniqueCompanies().length && filters.companyName.length > 0 ? '#f3f4f6' : 'white',
                          borderBottom: '1px solid #e5e7eb',
                          fontSize: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = filters.companyName.length === getUniqueCompanies().length && filters.companyName.length > 0 ? '#f3f4f6' : 'white'}
                      >
                        <input
                          type="checkbox"
                          checked={filters.companyName.length === getUniqueCompanies().length && filters.companyName.length > 0}
                          onChange={() => {}}
                          style={{
                            cursor: 'pointer',
                            width: '16px',
                            height: '16px'
                          }}
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
                          style={{
                            padding: '10px 12px',
                            cursor: 'pointer',
                            backgroundColor: filters.companyName.includes(option) ? '#dbeafe' : 'white',
                            borderBottom: '1px solid #e5e7eb',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = filters.companyName.includes(option) ? '#dbeafe' : 'white'}
                        >
                          <input
                            type="checkbox"
                            checked={filters.companyName.includes(option)}
                            onChange={() => {}}
                            style={{
                              cursor: 'pointer',
                              width: '16px',
                              height: '16px'
                            }}
                          />
                          {option}
                        </div>
                      ))}

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

                {/* Product Filter Chip */}
                {activeFilterMenu === 'product' && (
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
                      <span>Product ({filters.product.length}) <span style={{ color: '#ef4444', fontWeight: '600' }}>*</span></span>
                      <button
                        onClick={() => {
                          setActiveFilterMenu(null);
                          setFilters(prev => ({ ...prev, product: [] }));
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
                          if (filters.product.length === getUniqueProducts().length && filters.product.length > 0) {
                            // If all are selected, deselect all
                            handleFilterChange('product', []);
                          } else {
                            // Otherwise select all
                            handleFilterChange('product', getUniqueProducts());
                          }
                        }}
                        style={{
                          padding: '10px 12px',
                          cursor: 'pointer',
                          backgroundColor: filters.product.length === getUniqueProducts().length && filters.product.length > 0 ? '#f3f4f6' : 'white',
                          borderBottom: '1px solid #e5e7eb',
                          fontSize: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = filters.product.length === getUniqueProducts().length && filters.product.length > 0 ? '#f3f4f6' : 'white'}
                      >
                        <input
                          type="checkbox"
                          checked={filters.product.length === getUniqueProducts().length && filters.product.length > 0}
                          onChange={() => {}}
                          style={{
                            cursor: 'pointer',
                            width: '16px',
                            height: '16px'
                          }}
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
                          style={{
                            padding: '10px 12px',
                            cursor: 'pointer',
                            backgroundColor: filters.product.includes(option) ? '#dbeafe' : 'white',
                            borderBottom: '1px solid #e5e7eb',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            justifyContent: 'space-between'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = filters.product.includes(option) ? '#dbeafe' : 'white'}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input
                              type="checkbox"
                              checked={filters.product.includes(option)}
                              onChange={() => {}}
                              style={{
                                cursor: 'pointer',
                                width: '16px',
                                height: '16px'
                              }}
                            />
                            {renderProductIcon(option)}
                            {option}
                          </div>
                          <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
                            {getAccountCountByProduct(option)}
                          </span>
                        </div>
                      ))}

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

                {/* Renewal Timeline Filter Chip */}
                {activeFilterMenu === 'qtr' && (
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
                      <span>Renewal Timeline ({filters.qtr.length}) <span style={{ color: '#ef4444', fontWeight: '600' }}>*</span></span>
                      <button
                        onClick={() => {
                          setActiveFilterMenu(null);
                          setFilters(prev => ({ ...prev, qtr: [] }));
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
                          if (filters.qtr.length === getUniqueQtrs().length && filters.qtr.length > 0) {
                            // If all are selected, deselect all
                            handleFilterChange('qtr', []);
                          } else {
                            // Otherwise select all
                            handleFilterChange('qtr', getUniqueQtrs());
                          }
                        }}
                        style={{
                          padding: '10px 12px',
                          cursor: 'pointer',
                          backgroundColor: filters.qtr.length === getUniqueQtrs().length && filters.qtr.length > 0 ? '#f3f4f6' : 'white',
                          borderBottom: '1px solid #e5e7eb',
                          fontSize: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = filters.qtr.length === getUniqueQtrs().length && filters.qtr.length > 0 ? '#f3f4f6' : 'white'}
                      >
                        <input
                          type="checkbox"
                          checked={filters.qtr.length === getUniqueQtrs().length && filters.qtr.length > 0}
                          onChange={() => {}}
                          style={{
                            cursor: 'pointer',
                            width: '16px',
                            height: '16px'
                          }}
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
                          style={{
                            padding: '10px 12px',
                            cursor: 'pointer',
                            backgroundColor: filters.qtr.includes(option) ? '#dbeafe' : 'white',
                            borderBottom: '1px solid #e5e7eb',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            justifyContent: 'space-between'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = filters.qtr.includes(option) ? '#dbeafe' : 'white'}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input
                              type="checkbox"
                              checked={filters.qtr.includes(option)}
                              onChange={() => {}}
                              style={{
                                cursor: 'pointer',
                                width: '16px',
                                height: '16px'
                              }}
                            />
                            <span>{option}</span>
                          </div>
                          <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
                            {getAccountCountByQtr(option)}
                          </span>
                        </div>
                      ))}

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
                {filters.companyName.length > 0 && activeFilterMenu !== 'companyName' && (
                  <div style={{
                    backgroundColor: '#fef3c7',
                    border: '1px solid #fcd34d',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#92400e',
                    cursor: 'pointer'
                  }}
                  onClick={() => setActiveFilterMenu('companyName')}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      Account Name ({filters.companyName.length}) <span style={{ color: '#ef4444', fontWeight: '600' }}>*</span>
                    </span>
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
                        color: '#92400e',
                        lineHeight: '1'
                      }}
                    >
                      ✕
                    </button>
                  </div>
                )}

                {filters.product.length > 0 && activeFilterMenu !== 'product' && (
                  <div style={{
                    backgroundColor: '#fef3c7',
                    border: '1px solid #fcd34d',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#92400e',
                    cursor: 'pointer'
                  }}
                  onClick={() => setActiveFilterMenu('product')}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      Product ({filters.product.length}) <span style={{ color: '#ef4444', fontWeight: '600' }}>*</span>
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFilters(prev => ({ ...prev, product: [] }));
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '16px',
                        padding: '0',
                        color: '#92400e',
                        lineHeight: '1'
                      }}
                    >
                      ✕
                    </button>
                  </div>
                )}

                {filters.qtr.length > 0 && activeFilterMenu !== 'qtr' && (
                  <div style={{
                    backgroundColor: '#fef3c7',
                    border: '1px solid #fcd34d',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#92400e',
                    cursor: 'pointer'
                  }}
                  onClick={() => setActiveFilterMenu('qtr')}
                  >
                    <span>Renewal Timeline ({filters.qtr.length}) <span style={{ color: '#ef4444', fontWeight: '600' }}>*</span></span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFilters(prev => ({ ...prev, qtr: [] }));
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '16px',
                        padding: '0',
                        color: '#92400e',
                        lineHeight: '1'
                      }}
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
                    style={{ flexShrink: 0 }}
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
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '8px',
                                marginTop: '20px',
                                padding: '16px'
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
                                                    {startPage > 2 && <span style={{ color: '#9ca3af' }}>...</span>}
                                                </>
                                            )}

                                            {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((i) => (
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
                                                    {endPage < totalPages - 1 && <span style={{ color: '#9ca3af' }}>...</span>}
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
                    )}
                </div>

                {/* Bar Chart Section - Right */}
                {/* <div style={{
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    padding: '15px',
                    border: '1px solid #d1d5db',
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: 0,
                    flexShrink: 0,
                    height: '400px'
                }}>
                    <h2 style={{ fontSize: '0.9rem', fontWeight: '600', color: '#374151', marginBottom: '15px', margin: 0 }}>
                        Renewal Distribution
                    </h2>
                    {filteredData.length === 0 ? (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flex: 1,
                            color: '#9ca3af',
                            fontSize: '12px'
                        }}>
                            Select filters
                        </div>
                    ) : chartData.length === 0 ? (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flex: 1,
                            color: '#9ca3af',
                            fontSize: '12px'
                        }}>
                            No data
                        </div>
                    ) : (
                        <div style={{
                            display: 'flex',
                            alignItems: 'flex-end',
                            justifyContent: 'space-between',
                            flex: 1,
                            gap: '4px',
                            minWidth: 0
                        }}>
                            {chartData.map((item, idx) => (
                                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: 0 }}>
                                    <div style={{
                                        fontSize: '10px',
                                        fontWeight: '600',
                                        color: '#1f2937',
                                        marginBottom: '4px',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {item.value}
                                    </div>
                                    <div style={{
                                        width: '100%',
                                        maxWidth: '30px',
                                        height: maxChartValue > 0 ? `${(item.value / maxChartValue) * 250}px` : '0px',
                                        backgroundColor: item.color,
                                        borderRadius: '2px 2px 0 0',
                                        transition: 'all 0.3s ease',
                                        cursor: 'pointer'
                                    }}
                                        onMouseEnter={(e) => {
                                            e.target.style.opacity = '0.8';
                                            e.target.style.transform = 'scaleY(1.05)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.opacity = '1';
                                            e.target.style.transform = 'scaleY(1)';
                                        }}
                                    ></div>
                                    <div style={{
                                        fontSize: '8px',
                                        color: '#6b7280',
                                        marginTop: '4px',
                                        textAlign: 'center',
                                        maxWidth: '50px',
                                        wordWrap: 'break-word',
                                        lineHeight: '1.1'
                                    }}>
                                        {item.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div> */}
            </div>

            {/* Custom Tooltip */}
            {tooltip.show && (
                <div
                    style={{
                        position: 'fixed',
                        left: `${tooltip.x}px`,
                        top: `${tooltip.y}px`,
                        transform: 'translate(-50%, -100%)',
                        backgroundColor: '#ffffffff',
                        color: 'black',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '500',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        zIndex: 1000,
                        pointerEvents: 'none',
                        maxWidth: '300px',
                        wordWrap: 'break-word',
                        whiteSpace: 'normal',
                        lineHeight: '1.4'
                    }}
                >
                    {tooltip.text}
                </div>
            )}

            <style jsx>{`
                .renewal-intelligence-container {
                    background: linear-gradient(180deg, #ffffff, #fafbff);
                    border-radius: 12px;
                    padding: 1.25rem 1.5rem 1.5rem;
                    width: 100%;
                    height:800px;
                    max-width: 100%;
                    overflow-x: hidden;
                }

                .header-actions {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                }

                .header-actions h2 {
                    margin: 0;
                    font-size: 1.4rem;
                    font-weight: 700;
                    color: #0f172a;
                }

                .table-container {
                    max-height: 700px;
                    overflow-x: auto;
                    overflow-y: auto;
                    position: relative;
                    border: 1px solid #e5e7eb;
                    border-radius: 10px;
                    background-color: #fff;
                }

                .sticky-header {
                    position: sticky;
                    top: 0;
                    background-color: #fff;
                    z-index: 10;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }

                /* keep THs non-sticky individually to avoid width/offset misalignment */
                .sticky-header th {
                    position: sticky;
                    top: 0;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    table-layout: fixed;
                    min-width: 0;
                    box-sizing: border-box;
                }

                th, td {
                    padding: 12px 15px;
                    font-size: 13px;
                    text-align: left;
                    border-bottom: 1px solid #ddd;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    cursor: default;
                    box-sizing: border-box;
                }

                /* Explicitly enforce column width constraints so Renewal Intelligence is visible */
                td:nth-child(1), th:nth-child(1) { width: 33.33%; }
                td:nth-child(2), th:nth-child(2) { width: 33.33%; }
                td:nth-child(3), th:nth-child(3) { width: 33.34%; }

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
            `}</style>
        </div>
    );
};

export default RenewalIntelligence;