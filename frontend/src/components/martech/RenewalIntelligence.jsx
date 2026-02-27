import { useState, useEffect, useRef } from 'react';
import * as SiIcons from 'react-icons/si';
import { getLogoPath, getTechIcon } from '../../utils/logoMap';
import loadingGif from '../../assets/Loading GIF - Clients.gif';
import { FaGlobe, FaLinkedin, FaLock, FaUnlock } from 'react-icons/fa';

import { performanceMonitor } from '../../utils/performanceMonitor';

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

const RenewalMeter = ({ renewalDate }) => {
  const calculateProximity = () => {
    if (!renewalDate) return 0;
    
    // Parse the renewal date (format: "Q4 2025", "Q1 2026", etc.)
    const match = renewalDate.match(/Q(\d+)\s(\d{4})/);
    if (!match) return 0;
    
    const quarter = parseInt(match[1]);
    const year = parseInt(match[2]);
    
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const currentQuarter = Math.ceil(currentMonth / 3);
    
    // Calculate quarters difference
    const yearDiff = year - currentYear;
    const quarterDiff = (yearDiff * 4) + (quarter - currentQuarter);
    
    // If past or current quarter, return 100 (darkest/leftmost)
    if (quarterDiff <= 0) return 100;
    
    // Map quarters to proximity (0-100)
    // 0 quarters = 100% (darkest/left), 8+ quarters = 0% (lightest/right)
    const maxQuarters = 8;
    return Math.min(100, Math.max(0, 100 - (quarterDiff / maxQuarters) * 100));
  };

  const getStatusLabel = (proximity) => {
    if (proximity >= 86) return 'Upcoming ';
    if (proximity >= 46) return 'Mid-Term ';
    return 'Long-Term ';
  };

  const proximity = calculateProximity();
  const statusLabel = getStatusLabel(proximity);
  
  // Calculate arrow rotation based on proximity
  // 100% = -90 (left/dark), 0% = 90 (right/light)
  const rotation = 90 - (proximity * 1.8);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
      <div style={{ position: 'relative', width: '50px', height: '28px' }}>
        <svg width="50" height="28" viewBox="0 0 100 55" style={{ position: 'absolute', top: 0, left: 0 }}>
          <defs>
            {/* Gradient from dark blue (left) to light blue (right) */}
            <linearGradient id="renewalGaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0c4a6e" />
              <stop offset="25%" stopColor="#0369a1" />
              <stop offset="50%" stopColor="#0284c7" />
              <stop offset="75%" stopColor="#0ea5e9" />
              <stop offset="100%" stopColor="#e0f2fe" />
            </linearGradient>
          </defs>
          
          {/* Arc with gradient from dark to light */}
          <path
            d="M 8 50 A 45 45 0 0 1 92 50"
            fill="none"
            stroke="url(#renewalGaugeGradient)"
            strokeWidth="10"
            strokeLinecap="round"
          />
          
          {/* Arrow needle that rotates based on proximity */}
          <g style={{ transform: `rotate(${rotation}deg)`, transformOrigin: '50px 50px', transition: 'transform 0.3s ease' }}>
            <line x1="50" y1="50" x2="50" y2="20" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="50" cy="50" r="2" fill="#000000" />
          </g>
          
          {/* Center circle */}
          <circle cx="50" cy="50" r="3.5" fill="#ffffff" stroke="#000000" strokeWidth="1.5" />
        </svg>
      </div>
      
      <div style={{ fontSize: '11px', fontWeight: '700', color: '#1f2937', textAlign: 'center' }}>
        {statusLabel}
      </div>
    </div>
  );
};

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
        category: [],
        product: [],
        qtr: [],
        renewalProximity: []
    });
    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [tooltip, setTooltip] = useState({ show: false, text: '', x: 0, y: 0, isRevealed: true });
    const [showFilters, setShowFilters] = useState(false);
    const [activeFilterMenu, setActiveFilterMenu] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [revealedRows, setRevealedRows] = useState(new Set());
    const [selectedRows, setSelectedRows] = useState(new Set());
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [measurements, setMeasurements] = useState({});
    const rowsPerPage = 9;
    const filterRef = useRef(null);

const renderCategoryLogo = (categoryName) => {
      if (!categoryName) return null;

      const logoPath = getLogoPath(categoryName);

      if (logoPath) {
        return (
          <img
            src={logoPath}
            alt={categoryName}
            title={categoryName}
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

      const iconData = getTechIcon(categoryName);
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
            title={categoryName}
          />
        );
      }

      return null;
    };

const getProductIcon = (productName) => {
        if (!productName) return null;

        const productLower = productName.toLowerCase();

if (productLower.includes('sap')) {
            return 'SiSap';
        }
        if (productLower.includes('vmware')) {
            return 'SiVmware';
        }

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

const renderProductIcon = (productName) => {
        if (!productName) return null;

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

useEffect(() => {
        setLoading(true);
        performanceMonitor.reset();
        performanceMonitor.start('total-load');

        const fetchRenewalData = async () => {
            try {
                setLoading(true);

performanceMonitor.start('api-fetch');
                const [renewalResponse, companyDetailsResponse, metadataResponse] = await Promise.all([
                    fetch('/api/renewal-intelligence?page=1&limit=500'),
                    fetch('/api/company-details'),
                    fetch('/api/renewal-intelligence/metadata')
                ]);
                performanceMonitor.end('api-fetch');

                performanceMonitor.start('parse-json');
                const renewalData = await renewalResponse.json();
                const companyDetailsMap = await companyDetailsResponse.json();
                const metadata = await metadataResponse.json();
                performanceMonitor.end('parse-json');

                performanceMonitor.start('process-data');

                const data = renewalData.data || renewalData;

const uniqueCategories = metadata.categories || [];
                const uniqueProducts = metadata.products || [];

                setCategories(uniqueCategories);
                setProducts(uniqueProducts);

const dataWithDetails = data.map(row => {
                    const companyDetails = companyDetailsMap[row.companyName] || {};
                    return {
                        ...row,
                        domain: companyDetails.domain || 'N/A',
                        linkedinUrl: companyDetails.linkedinUrl || ''
                    };
                });
                performanceMonitor.end('process-data');

                performanceMonitor.start('state-update');
                setTableData(dataWithDetails);
                performanceMonitor.end('state-update');

                performanceMonitor.end('total-load');
                setMeasurements(performanceMonitor.getAllMeasurements());
                performanceMonitor.logSummary();
            } catch (error) {

                setTableData([]);
            } finally {
                setLoading(false);
            }
        };
        fetchRenewalData();
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

    const handleFilterChange = (name, value) => {
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
        setCurrentPage(1);
    };

    const downloadCSV = (dataToDownload) => {
        // Filter to only include revealed companies
        const revealedData = dataToDownload.filter(row => {
            const rowKey = `${dataToDownload.indexOf(row)}-${row.companyName}`;
            return revealedRows.has(rowKey);
        });

        if (revealedData.length === 0) {
            alert('No revealed companies to download. Please reveal company details first.');
            return;
        }

        const headers = ['Company Name', 'Product', 'Renewal Intelligence'];
        const csvContent = [
            headers.join(','),
            ...revealedData.map(row =>
                [row.companyName, row.product, row.qtr]
                    .map(field => `"${field}"`)
                    .join(',')
            )
        ].join('\n');

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

    const getUniqueRenewalProximity = () => {
        return ['Upcoming ', 'Mid-Term', 'Long-Term '];
    };

    const getUniqueCategories = () => {
        if (!tableData) return [];
        const allCategories = tableData.map(item => item.category);
        return [...new Set(allCategories)].sort();
    };

const getProductsByCategory = (category) => {
        if (!tableData) return [];
        const products = tableData
            .filter(item => item.category === category)
            .map(item => item.product);
        return [...new Set(products)].sort();
    };

const getAccountCountByCategory = (category) => {
        if (!tableData) return 0;
        const uniqueAccounts = new Set();
        tableData.forEach(row => {
            if (row.category === category) {
                uniqueAccounts.add(row.companyName);
            }
        });
        return uniqueAccounts.size;
    };

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

const hasMandatoryFilters = filters.category.length > 0 && filters.qtr.length > 0;
    const shouldShowTable = true; // Always show table by default like Technographics

    const getProximityValue = (renewalDate) => {
        if (!renewalDate) return 0;
        
        const match = renewalDate.match(/Q(\d+)\s(\d{4})/);
        if (!match) return 0;
        
        const quarter = parseInt(match[1]);
        const year = parseInt(match[2]);
        
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth() + 1;
        const currentQuarter = Math.ceil(currentMonth / 3);
        
        const yearDiff = year - currentYear;
        const quarterDiff = (yearDiff * 4) + (quarter - currentQuarter);
        
        if (quarterDiff <= 0) return 100;
        
        const maxQuarters = 8;
        return Math.min(100, Math.max(0, 100 - (quarterDiff / maxQuarters) * 100));
    };

    const getRenewalStatus = (proximity) => {
        if (proximity >= 86) return 0; // Approaching (highest priority)
        if (proximity >= 46) return 1; // Mid-Term
        return 2; // Long-Term (lowest priority)
    };

    const filteredData = tableData.filter(row => {

        // Show all data by default (no mandatory filters required)
        const companyMatch = filters.companyName.length === 0 || filters.companyName.includes(row.companyName);
        const categoryMatch = filters.category.length === 0 || filters.category.includes(row.category);
        const productMatch = filters.product.length === 0 || filters.product.includes(row.product);
        const qtrMatch = filters.qtr.length === 0 || filters.qtr.includes(row.qtr);
        
        let renewalProximityMatch = true;
        if (filters.renewalProximity.length > 0) {
            const proximity = getProximityValue(row.qtr);
            const status = getRenewalStatus(proximity);
            const statusLabels = ['Upcoming ', 'Mid-Term ', 'Long-Term '];
            renewalProximityMatch = filters.renewalProximity.includes(statusLabels[status]);
        }
        
        return companyMatch && categoryMatch && productMatch && qtrMatch && renewalProximityMatch;
    }).sort((a, b) => {
        const proximityA = getProximityValue(a.qtr);
        const proximityB = getProximityValue(b.qtr);
        const statusA = getRenewalStatus(proximityA);
        const statusB = getRenewalStatus(proximityB);
        
        // Sort by status first (Approaching first, then Midterm, then Long-term)
        if (statusA !== statusB) {
            return statusA - statusB;
        }
        
        // If same status, sort by proximity (descending - higher proximity first)
        return proximityB - proximityA;
    });

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

chartArray.sort((a, b) => {
            const parseQtr = (qtrStr) => {
                const match = qtrStr.match(/Q(\d+)\s(\d{4})/);
                if (!match) return { year: 0, quarter: 0 };
                return { year: parseInt(match[2]), quarter: parseInt(match[1]) };
            };

            const aQtr = parseQtr(a.label);
            const bQtr = parseQtr(b.label);

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
          position: 'relative',
          minHeight: '100vh',
          backgroundColor: '#ffffffff',
          padding: '40px 20px'
        }}>
          {/* Background Full Page Skeleton (blurred) */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            padding: '40px 20px',
            filter: 'blur(4px)',
            opacity: 0.6,
            pointerEvents: 'none',
            overflow: 'hidden'
          }}>
            {/* Title Skeleton */}
            <div style={{
              height: '32px',
              backgroundColor: '#e5e7eb',
              borderRadius: '4px',
              marginBottom: '24px',
              width: '200px'
            }} />

            {/* Filter Bar Skeleton */}
            <div style={{
              display: 'flex',
              gap: '12px',
              marginBottom: '20px',
              flexWrap: 'wrap'
            }}>
              {[1, 2, 3, 4, 5].map(i => (
                <div key={`filter-${i}`} style={{
                  height: '36px',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '6px',
                  width: '120px'
                }} />
              ))}
            </div>

            {/* Divider */}
            <div style={{
              height: '1px',
              backgroundColor: '#e5e7eb',
              marginBottom: '20px'
            }} />

            {/* Table Header Skeleton */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(8, 1fr)',
              gap: '12px',
              marginBottom: '16px',
              padding: '16px',
              backgroundColor: '#f9fafb',
              borderRadius: '6px'
            }}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={`header-${i}`} style={{
                  height: '18px',
                  backgroundColor: '#e5e7eb',
                  borderRadius: '4px'
                }} />
              ))}
            </div>

            {/* Table Rows Skeleton */}
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(row => (
              <div key={`row-${row}`} style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(8, 1fr)',
                gap: '12px',
                padding: '16px',
                borderBottom: '1px solid #e5e7eb',
                backgroundColor: row % 2 === 0 ? '#ffffff' : '#f9fafb'
              }}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(col => (
                  <div key={`cell-${row}-${col}`} style={{
                    height: '14px',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '4px'
                  }} />
                ))}
              </div>
            ))}
          </div>

          {/* Centered Loading GIF */}
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10
          }}>
            <img 
              src={loadingGif} 
              alt="Loading" 
              style={{
                width: '600px',
                height: '600px',
                objectFit: 'contain'
              }}
            />
          </div>

          <style>{`
            @keyframes pulse {
              0%, 100% {
                opacity: 1;
              }
              50% {
                opacity: 0.5;
              }
            }
          `}</style>
        </div>
      );
    }

    return (
        <>
        <div className="renewal-intelligence-container">
            <div className="header-actions" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                <h2 style={{ fontSize: '25px', fontWeight: '700' }}>Renewal Intelligence</h2>
                <div className="actions-right" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {}
                </div>
            </div>

            <div className="section-subtle-divider" />

            <div style={{ marginBottom: '20px' }} ref={filterRef}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                {}
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

                {}
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
                      { label: 'Product', key: 'product', mandatory: false },
                      { label: 'Renewal Proximity', key: 'renewalProximity', mandatory: false }
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

              {}
              {activeFilterMenu !== 'category' && filters.category.length === 0 && (
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
                    <span>Category <span style={{ color: '#ef4444', fontWeight: '600' }}>*</span></span>
                  </button>
                </div>
              )}

              {}
              {activeFilterMenu !== 'qtr' && (
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setActiveFilterMenu('qtr')}
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
                    <span>Renewal Timeline {Array.isArray(filters.qtr) && filters.qtr.length > 0 && `(${filters.qtr.length})`} <span style={{ color: '#ef4444', fontWeight: '600' }}>*</span></span>
                  </button>
                </div>
              )}

                {}
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
                      <span>Company Name ({filters.companyName.length})</span>
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

                            handleFilterChange('companyName', []);
                          } else {

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
                          <span style={{ filter: 'blur(4px)', userSelect: 'none' }}>{option}</span>
                        </div>
                      ))}

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
                      <span>Category ({filters.category.length}) <span style={{ color: '#ef4444', fontWeight: '600' }}>*</span></span>
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
                          if (filters.category.length === getUniqueCategories().length && filters.category.length > 0) {
                            handleFilterChange('category', []);
                          } else {
                            handleFilterChange('category', getUniqueCategories());
                          }
                        }}
                        style={{
                          padding: '10px 12px',
                          cursor: 'pointer',
                          backgroundColor: filters.category.length === getUniqueCategories().length && filters.category.length > 0 ? '#f3f4f6' : 'white',
                          borderBottom: '1px solid #e5e7eb',
                          fontSize: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = filters.category.length === getUniqueCategories().length && filters.category.length > 0 ? '#f3f4f6' : 'white'}
                      >
                        <input
                          type="checkbox"
                          checked={filters.category.length === getUniqueCategories().length && filters.category.length > 0}
                          onChange={() => {}}
                          style={{
                            cursor: 'pointer',
                            width: '16px',
                            height: '16px'
                          }}
                        />
                        All
                      </div>
                      {getUniqueCategories()
                        .sort((a, b) => {
                          const countA = getAccountCountByCategory(a);
                          const countB = getAccountCountByCategory(b);
                          return countB - countA;
                        })
                        .map((option, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            const newCategories = filters.category.includes(option)
                              ? filters.category.filter(c => c !== option)
                              : [...filters.category, option];
                            handleFilterChange('category', newCategories);
                          }}
                          style={{
                            padding: '10px 12px',
                            cursor: 'pointer',
                            backgroundColor: filters.category.includes(option) ? '#dbeafe' : 'white',
                            borderBottom: '1px solid #e5e7eb',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            justifyContent: 'space-between'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = filters.category.includes(option) ? '#dbeafe' : 'white'}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input
                              type="checkbox"
                              checked={filters.category.includes(option)}
                              onChange={() => {}}
                              style={{
                                cursor: 'pointer',
                                width: '16px',
                                height: '16px'
                              }}
                            />
                            {renderCategoryLogo(option)}
                            {option}
                          </div>
                          <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
                            {getAccountCountByCategory(option)}
                          </span>
                        </div>
                      ))}

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
                      <span>Product ({filters.product.length})</span>
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
                      maxHeight: '400px',
                      overflowY: 'auto'
                    }}>
                      <div
                        onClick={() => {
                          if (filters.product.length === getUniqueProducts().length && filters.product.length > 0) {
                            handleFilterChange('product', []);
                          } else {
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

                      {}
                      {getUniqueProducts()
                        .sort((a, b) => {
                          const countA = getAccountCountByProduct(a);
                          const countB = getAccountCountByProduct(b);
                          return countB - countA;
                        })
                        .map((option, idx) => (
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

                            handleFilterChange('qtr', []);
                          } else {

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
                      {getUniqueQtrs()
                        .sort((a, b) => {
                          const countA = getAccountCountByQtr(a);
                          const countB = getAccountCountByQtr(b);
                          return countB - countA;
                        })
                        .map((option, idx) => (
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
                {activeFilterMenu === 'renewalProximity' && (
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
                      <span>Renewal Proximity ({filters.renewalProximity.length})</span>
                      <button
                        onClick={() => {
                          setActiveFilterMenu(null);
                          setFilters(prev => ({ ...prev, renewalProximity: [] }));
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
                      <div style={{
                        padding: '10px 12px',
                        fontSize: '11px',
                        color: '#6b7280',
                        borderBottom: '1px solid #e5e7eb',
                        backgroundColor: '#f9fafb'
                      }}>
                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>Renewal Ranges:</div>
                        <div>• Upcoming (&lt;1 year)</div>
                        <div>• Mid-Term (1–2 years)</div>
                        <div>• Long-Term (2+ years)</div>
                      </div>
                      <div
                        onClick={() => {
                          if (filters.renewalProximity.length === getUniqueRenewalProximity().length && filters.renewalProximity.length > 0) {
                            handleFilterChange('renewalProximity', []);
                          } else {
                            handleFilterChange('renewalProximity', getUniqueRenewalProximity());
                          }
                        }}
                        style={{
                          padding: '10px 12px',
                          cursor: 'pointer',
                          backgroundColor: filters.renewalProximity.length === getUniqueRenewalProximity().length && filters.renewalProximity.length > 0 ? '#f3f4f6' : 'white',
                          borderBottom: '1px solid #e5e7eb',
                          fontSize: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = filters.renewalProximity.length === getUniqueRenewalProximity().length && filters.renewalProximity.length > 0 ? '#f3f4f6' : 'white'}
                      >
                        <input
                          type="checkbox"
                          checked={filters.renewalProximity.length === getUniqueRenewalProximity().length && filters.renewalProximity.length > 0}
                          onChange={() => {}}
                          style={{
                            cursor: 'pointer',
                            width: '16px',
                            height: '16px'
                          }}
                        />
                        All
                      </div>
                      {getUniqueRenewalProximity().map((option, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            const newProximity = filters.renewalProximity.includes(option)
                              ? filters.renewalProximity.filter(p => p !== option)
                              : [...filters.renewalProximity, option];
                            handleFilterChange('renewalProximity', newProximity);
                          }}
                          style={{
                            padding: '10px 12px',
                            cursor: 'pointer',
                            backgroundColor: filters.renewalProximity.includes(option) ? '#dbeafe' : 'white',
                            borderBottom: '1px solid #e5e7eb',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = filters.renewalProximity.includes(option) ? '#dbeafe' : 'white'}
                        >
                          <input
                            type="checkbox"
                            checked={filters.renewalProximity.includes(option)}
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
                      Company Name ({filters.companyName.length})
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

                {}
                {filters.category.length > 0 && activeFilterMenu !== 'category' && (
                  <div style={{
                    backgroundColor: '#dbeafe',
                    border: '1px solid #93c5fd',
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
                      Category ({filters.category.length}) <span style={{ color: '#ef4444', fontWeight: '600' }}>*</span>
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

                {}
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
                      Product ({filters.product.length})
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

                {}
                {filters.renewalProximity.length > 0 && activeFilterMenu !== 'renewalProximity' && (
                  <div style={{
                    backgroundColor: '#dbeafe',
                    border: '1px solid #93c5fd',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#1e40af',
                    cursor: 'pointer'
                  }}
                  onClick={() => setActiveFilterMenu('renewalProximity')}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      Renewal Proximity ({filters.renewalProximity.length})
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFilters(prev => ({ ...prev, renewalProximity: [] }));
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

                {}
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
              </div>
            </div>

            {}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', minWidth: 0 }}>
                {}
                <div style={{ minWidth: 0 }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            Loading data...
                        </div>
                    ) : shouldShowTable ? (
                        <div className="table-container">
                            <table>
                                <thead className="sticky-header">
                                    <tr>
                                        <th style={{ textAlign: 'center', padding: '12px 8px', width: '50px' }}>
                                          <input
                                            type="checkbox"
                                            checked={selectedRows.size > 0 && selectedRows.size === tableData.length}
                                            onChange={(e) => {
                                              if (e.target.checked) {
                                                const newSelected = new Set();
                                                tableData.forEach((_, idx) => newSelected.add(idx));
                                                setSelectedRows(newSelected);
                                              } else {
                                                setSelectedRows(new Set());
                                              }
                                            }}
                                            style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                                          />
                                        </th>
                                        <th style={{ textAlign: 'center', padding: '12px 8px', width: '80px' }}>Reveal</th>
                                        <th style={{ textAlign: 'left', flex: 1, padding: '12px 8px' }}>Company Name</th>
                                        <th style={{ textAlign: 'left', flex: 1, padding: '12px 8px' }}>Product</th>
                                        <th style={{ textAlign: 'left', flex: 1, padding: '12px 8px' }}>Renewal Intelligence</th>
                                        <th style={{ textAlign: 'center', padding: '12px 8px', width: '100px' }}>Renewal Proximity</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#9ca3af', height: '400px', verticalAlign: 'middle' }}>
                                                No data available for the selected filters
                                            </td>
                                        </tr>
                                    ) : (
                                        (() => {
                                            const totalPages = Math.ceil(filteredData.length / rowsPerPage);
                                            const startIndex = (currentPage - 1) * rowsPerPage;
                                            const endIndex = startIndex + rowsPerPage;
                                            const paginatedData = filteredData.slice(startIndex, endIndex);

                                            return paginatedData.map((row, index) => {
                                                const actualIndex = startIndex + index;
                                                const rowKey = `${actualIndex}-${row.companyName}`;
                                                const isRevealed = revealedRows.has(rowKey);

                                                return (
                                                    <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                                        <td style={{ textAlign: 'center', padding: '12px 8px', width: '50px' }}>
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
                                                        <td style={{ textAlign: 'center', padding: '12px 8px' }}>
                                                            <button
                                                                onClick={() => {
                                                                    setRevealedRows(prev => {
                                                                        const newSet = new Set(prev);
                                                                        newSet.add(rowKey);
                                                                        return newSet;
                                                                    });
                                                                }}
                                                                style={{
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    gap: '6px',
                                                                    padding: '8px 10px',
                                                                    backgroundColor: isRevealed ? '#f3f4f6' : '#f0fdf4',
                                                                    border: isRevealed ? '1px solid #d1d5db' : '1px solid #bbf7d0',
                                                                    borderRadius: '6px',
                                                                    cursor: 'pointer',
                                                                    transition: 'all 0.2s'
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    if (!isRevealed) {
                                                                        e.currentTarget.style.backgroundColor = '#a7f3d0';
                                                                        e.currentTarget.style.borderColor = '#6ee7b7';
                                                                    }
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    if (!isRevealed) {
                                                                        e.currentTarget.style.backgroundColor = '#d1fae5';
                                                                        e.currentTarget.style.borderColor = '#a7f3d0';
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
                                                        <td style={{ textAlign: 'left', flex: 1, padding: '12px 8px' }}>
                                                            {isRevealed ? (
                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                                    <div style={{ fontWeight: '600', color: '#1f2937' }}>
                                                                        {row.companyName}
                                                                    </div>
                                                                    <div style={{ fontSize: '13px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                        {row.domain && row.domain !== 'N/A' && (
                                                                            <a
                                                                                href={`https://${row.domain}`}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                style={{
                                                                                    color: '#3b82f6',
                                                                                    textDecoration: 'none',
                                                                                    opacity: 1,
                                                                                    transition: 'opacity 0.2s'
                                                                                }}
                                                                                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                                                                                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                                                                                title={`Visit ${row.domain}`}
                                                                            >
                                                                                <FaGlobe size={16} />
                                                                            </a>
                                                                        )}
                                                                        {row.linkedinUrl && (
                                                                            <a
                                                                                href={row.linkedinUrl}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                style={{
                                                                                    color: '#0a66c2',
                                                                                    textDecoration: 'none',
                                                                                    opacity: 1,
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
                                                                </div>
                                                            ) : (
                                                                <div style={{ fontWeight: '600', color: '#1f2937', filter: 'blur(8px)', userSelect: 'none', pointerEvents: 'none' }}>
                                                                    ••••••••••••••••••
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td style={{ textAlign: 'left', flex: 1, padding: '12px 8px' }}>
                                                            <span style={{ display: 'flex', alignItems: 'center' }}>
                                                                {renderProductIcon(row.product)}
                                                                {row.product}
                                                            </span>
                                                        </td>
                                                        <td style={{ textAlign: 'left', flex: 1, padding: '12px 8px' }}>
                                                            {row.qtr}
                                                        </td>
                                                        <td style={{ textAlign: 'center', padding: '12px 8px', width: '100px' }}>
                                                            <RenewalMeter renewalDate={row.qtr} />
                                                        </td>
                                                    </tr>
                                                );
                                            });
                                        })()
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="table-container">
                            <table>
                                <thead className="sticky-header">
                                    <tr>
                                        <th style={{ textAlign: 'center', padding: '12px 8px', width: '50px' }}>
                                          <input
                                            type="checkbox"
                                            checked={selectedRows.size > 0 && selectedRows.size === filteredData.length}
                                            onChange={(e) => {
                                              if (e.target.checked) {
                                                const newSelected = new Set();
                                                filteredData.forEach((_, idx) => newSelected.add(idx));
                                                setSelectedRows(newSelected);
                                              } else {
                                                setSelectedRows(new Set());
                                              }
                                            }}
                                            style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                                          />
                                        </th>
                                        <th style={{ textAlign: 'center', padding: '12px 8px', width: '80px' }}>Reveal</th>
                                        <th style={{ textAlign: 'left', flex: 1, padding: '12px 8px' }}>Company Name</th>
                                        <th style={{ textAlign: 'left', flex: 1, padding: '12px 8px' }}>Product</th>
                                        <th style={{ textAlign: 'left', flex: 1, padding: '12px 8px' }}>Renewal Intelligence</th>
                                        <th style={{ textAlign: 'center', padding: '12px 8px', width: '100px' }}>Renewal Proximity</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#9ca3af', height: '400px', verticalAlign: 'middle' }}>
                                                No data available for the selected filters
                                            </td>
                                        </tr>
                                    ) : (
                                        (() => {
                                            const totalPages = Math.ceil(filteredData.length / rowsPerPage);
                                            const startIndex = (currentPage - 1) * rowsPerPage;
                                            const endIndex = startIndex + rowsPerPage;
                                            const paginatedData = filteredData.slice(startIndex, endIndex);

                                            return paginatedData.map((row, index) => {
                                                const actualIndex = startIndex + index;
                                                const rowKey = `${actualIndex}-${row.companyName}`;
                                                const isRevealed = revealedRows.has(rowKey);

                                                return (
                                                    <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                                        <td style={{ textAlign: 'center', padding: '12px 8px', width: '50px' }}>
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
                                                        <td style={{ textAlign: 'center', padding: '12px 8px' }}>
                                                            <button
                                                                onClick={() => {
                                                                    setRevealedRows(prev => {
                                                                        const newSet = new Set(prev);
                                                                        newSet.add(rowKey);
                                                                        return newSet;
                                                                    });
                                                                }}
                                                                style={{
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    gap: '6px',
                                                                    padding: '8px 10px',
                                                                    backgroundColor: isRevealed ? '#f3f4f6' : '#f0fdf4',
                                                                    border: isRevealed ? '1px solid #d1d5db' : '1px solid #bbf7d0',
                                                                    borderRadius: '6px',
                                                                    cursor: 'pointer',
                                                                    transition: 'all 0.2s',
                                                                    justifyContent: 'center',
                                                                    alignItems: 'center'
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    if (!isRevealed) {
                                                                        e.currentTarget.style.backgroundColor = '#a7f3d0';
                                                                        e.currentTarget.style.borderColor = '#6ee7b7';
                                                                    }
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    if (!isRevealed) {
                                                                        e.currentTarget.style.backgroundColor = '#d1fae5';
                                                                        e.currentTarget.style.borderColor = '#a7f3d0';
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
                                                        <td style={{ textAlign: 'left', flex: 1, padding: '12px 8px' }}
                                                            // onMouseEnter={(e) => {
                                                            //     const rect = e.target.getBoundingClientRect();
                                                            //     setTooltip({
                                                            //         show: true,
                                                            //         text: row.companyName,
                                                            //         x: rect.right - 20,
                                                            //         y: rect.bottom + 20,
                                                            //         isRevealed: isRevealed
                                                            //     });
                                                            // }} 
                                                            // onMouseLeave={() => setTooltip({ show: false, text: '', x: 0, y: 0, isRevealed: true })}
                                                        >
                                                            {isRevealed ? (
                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                                    <div style={{ fontWeight: '600', color: '#1f2937' }}>
                                                                        {row.companyName}
                                                                    </div>
                                                                    <div style={{ fontSize: '13px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                        {row.domain && row.domain !== 'N/A' && (
                                                                            <a
                                                                                href={`https://${row.domain}`}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                style={{
                                                                                    color: '#3b82f6',
                                                                                    textDecoration: 'none',
                                                                                    opacity: 1,
                                                                                    transition: 'opacity 0.2s'
                                                                                }}
                                                                                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                                                                                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                                                                                title={`Visit ${row.domain}`}
                                                                            >
                                                                                <FaGlobe size={16} />
                                                                            </a>
                                                                        )}
                                                                        {row.linkedinUrl && (
                                                                            <a
                                                                                href={row.linkedinUrl}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                style={{
                                                                                    color: '#0a66c2',
                                                                                    textDecoration: 'none',
                                                                                    opacity: 1,
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
                                                                </div>
                                                            ) : (
                                                                <div style={{ fontWeight: '600', color: '#1f2937', filter: 'blur(8px)', userSelect: 'none', pointerEvents: 'none' }}>
                                                                    ••••••••••••••••••
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td style={{ textAlign: 'left', flex: 1, padding: '12px 8px' }}>
                                                            <span style={{ display: 'flex', alignItems: 'center' }}>
                                                                {renderProductIcon(row.product)}
                                                                {row.product}
                                                            </span>
                                                        </td>
                                                        <td style={{ textAlign: 'left', flex: 1, padding: '12px 8px' }}>
                                                            {row.qtr}
                                                        </td>
                                                        <td style={{ textAlign: 'center', padding: '12px 8px', width: '100px' }}>
                                                            <RenewalMeter renewalDate={row.qtr} />
                                                        </td>
                                                    </tr>
                                                );
                                            });
                                        })()
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {}
                    {shouldShowTable && filteredData.length > rowsPerPage && (
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
                            Page {currentPage} of {Math.ceil(filteredData.length / rowsPerPage).toLocaleString()}
                        </div>

                        {}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
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

                                        {}
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

                                        {}
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

                                        {}
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

                                        {}
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
                            Showing {((currentPage - 1) * rowsPerPage) + 1}-{Math.min(currentPage * rowsPerPage, filteredData.length)} of {filteredData.length.toLocaleString()} results
                        </div>
                    </div>
                    )}
                </div>

                {}
                {}
            </div>

            {}
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
                        lineHeight: '1.4',
                        filter: !tooltip.isRevealed ? 'blur(8px)' : 'none'
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
                    height:750px;
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
                    max-height: 470px;
                    overflow-x: auto;
                    overflow-y: auto;
                    position: relative;
                    border: 1px solid #e5e7eb;
                    border-radius: 10px;
                    background-color: #fff;
                    padding-bottom: 0;
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

td:nth-child(1), th:nth-child(1) { width: 50px !important; }
                td:nth-child(2), th:nth-child(2) { width: 100px !important; }
                td:nth-child(3), th:nth-child(3) { width: 140px !important; }
                td:nth-child(4), th:nth-child(4) { width: 140px !important; }
                td:nth-child(5), th:nth-child(5) { width: 120px !important; }

td:nth-child(2), th:nth-child(2) {
                  padding-right: 30px !important;
                }

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
            {}
        </div>
        </>
    );
};

export default RenewalIntelligence;