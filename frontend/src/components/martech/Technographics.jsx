import { useState, useEffect, useRef } from 'react';
import { useIndustry } from '../../context/IndustryContext';
import Flag from 'country-flag-icons/react/3x2';
import { getLogoPath, getTechIcon } from '../../utils/logoMap';
import nexoraLogo from '../../assets/nexora-logo.png';
import { FaLinkedin } from 'react-icons/fa';
import '../../styles/technographics.css';
import '../../styles.css';

// Country name to country code mapping
const countryCodeMap = {
  'United States': 'US', 'USA': 'US', 'UNITED STATES': 'US',
  'Canada': 'CA', 'CANADA': 'CA',
  'United Kingdom': 'GB', 'UK': 'GB', 'UNITED KINGDOM': 'GB',
  'Germany': 'DE', 'GERMANY': 'DE',
  'France': 'FR', 'FRANCE': 'FR',
  'India': 'IN', 'INDIA': 'IN',
  'Japan': 'JP', 'JAPAN': 'JP',
  'Australia': 'AU', 'AUSTRALIA': 'AU',
  'Brazil': 'BR', 'BRAZIL': 'BR',
  'Mexico': 'MX', 'MEXICO': 'MX',
  'China': 'CN', 'CHINA': 'CN',
  'Singapore': 'SG', 'SINGAPORE': 'SG',
  'South Korea': 'KR', 'KOREA': 'KR', 'SOUTH KOREA': 'KR',
  'Netherlands': 'NL', 'NETHERLANDS': 'NL',
  'Sweden': 'SE', 'SWEDEN': 'SE',
  'Switzerland': 'CH', 'SWITZERLAND': 'CH',
  'Spain': 'ES', 'SPAIN': 'ES',
  'Italy': 'IT', 'ITALY': 'IT',
  'Ireland': 'IE', 'IRELAND': 'IE',
  'New Zealand': 'NZ', 'NEW ZEALAND': 'NZ',
  'UAE': 'AE', 'UNITED ARAB EMIRATES': 'AE',
  'Saudi Arabia': 'SA', 'SAUDI ARABIA': 'SA',
  'Israel': 'IL', 'ISRAEL': 'IL',
  'South Africa': 'ZA', 'SOUTH AFRICA': 'ZA',
  'Russia': 'RU', 'RUSSIA': 'RU',
  'Poland': 'PL', 'POLAND': 'PL',
  'Belgium': 'BE', 'BELGIUM': 'BE',
  'Austria': 'AT', 'AUSTRIA': 'AT',
  'Denmark': 'DK', 'DENMARK': 'DK',
  'Norway': 'NO', 'NORWAY': 'NO',
  'Finland': 'FI', 'FINLAND': 'FI',
  'Portugal': 'PT', 'PORTUGAL': 'PT',
  'Greece': 'GR', 'GREECE': 'GR',
  'Czech Republic': 'CZ', 'CZECHIA': 'CZ',
  'Hungary': 'HU', 'HUNGARY': 'HU',
  'Romania': 'RO', 'ROMANIA': 'RO',
  'Thailand': 'TH', 'THAILAND': 'TH',
  'Malaysia': 'MY', 'MALAYSIA': 'MY',
  'Indonesia': 'ID', 'INDONESIA': 'ID',
  'Philippines': 'PH', 'PHILIPPINES': 'PH',
  'Vietnam': 'VN', 'VIETNAM': 'VN',
  'Pakistan': 'PK', 'PAKISTAN': 'PK',
  'Bangladesh': 'BD', 'BANGLADESH': 'BD',
  'Argentina': 'AR', 'ARGENTINA': 'AR',
  'Chile': 'CL', 'CHILE': 'CL',
  'Colombia': 'CO', 'COLOMBIA': 'CO',
  'Peru': 'PE', 'PERU': 'PE',
  'Turkey': 'TR', 'TURKEY': 'TR',
  'Egypt': 'EG', 'EGYPT': 'EG',
  'Nigeria': 'NG', 'NIGERIA': 'NG',
  'Kenya': 'KE', 'KENYA': 'KE',
  'Hong Kong': 'HK', 'HONG KONG': 'HK',
  'Taiwan': 'TW', 'TAIWAN': 'TW',
};

const extractCountryCode = (region) => {
  if (!region) return '';
  const trimmed = region.trim();
  
  // First try exact match
  if (countryCodeMap[trimmed]) {
    return countryCodeMap[trimmed];
  }
  
  // Try uppercase match
  const upper = trimmed.toUpperCase();
  if (countryCodeMap[upper]) {
    return countryCodeMap[upper];
  }
  
  // If it's already a 2-letter code, return it
  if (trimmed.length === 2) {
    return trimmed.toUpperCase();
  }
  
  return '';
};

const renderCountryFlag = (region) => {
  const code = extractCountryCode(region);
  if (!code) return null;
  
  const FlagComponent = Flag[code];
  if (!FlagComponent) return null;
  
  return (
    <div className="country-flag">
      <FlagComponent style={{ width: '20px', height: '13px' }} />
    </div>
  );
};

// Custom Dropdown Component with Logos
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
        top: rect.bottom,
        left: rect.left,
        width: rect.width
      });
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="custom-dropdown">
      <button
        ref={buttonRef}
        onClick={handleButtonClick}
        className="dropdown-button"
      >
        <span className="dropdown-button-content">
          {value && renderLogo(value)}
          {value || 'All'}
        </span>
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="dropdown-menu"
          style={{
            position: 'absolute',
            top: `${dropdownPos.top}px`,
            left: `${dropdownPos.left}px`,
            width: `${dropdownPos.width}px`,
          }}
        >
          <div
            onClick={() => {
              onChange('');
              setIsOpen(false);
            }}
            className="dropdown-menu-item"
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
              className="dropdown-menu-item"
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

// Multi-Select Dropdown Component with Search
const MultiSelectDropdown = ({ value, onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const searchInputRef = useRef(null);

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

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleButtonClick = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom,
        left: rect.left,
        width: rect.width
      });
    }
    setIsOpen(!isOpen);
  };

  const handleToggleCompany = (company) => {
    if (value.includes(company)) {
      onChange(value.filter(c => c !== company));
    } else {
      onChange([...value, company]);
    }
  };

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="custom-dropdown">
      <button
        ref={buttonRef}
        onClick={handleButtonClick}
        className="dropdown-button"
      >
        <span className="dropdown-button-content">
          {value.length === 0 ? (
            'Select Company Name'
          ) : (
            <span className="selected-items">
              {value.slice(0, 2).map((company, idx) => (
                <span key={idx} className="selected-item">
                  {company}
                </span>
              ))}
              {value.length > 2 && (
                <span className="selected-item">
                  +{value.length - 2}
                </span>
              )}
            </span>
          )}
        </span>
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="dropdown-menu"
          style={{
            position: 'absolute',
            top: `${dropdownPos.top}px`,
            left: `${dropdownPos.left}px`,
            width: `${dropdownPos.width}px`,
          }}
        >
          <div className="filter-search">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="filter-search-input"
            />
          </div>

          <div
            onClick={() => {
              onChange([]);
              setSearchTerm('');
            }}
            className="dropdown-menu-item"
          >
            NULL
          </div>

          {filteredOptions.map((option, idx) => (
            <div
              key={idx}
              onClick={() => handleToggleCompany(option)}
              className="dropdown-menu-item"
            >
              <input
                type="checkbox"
                checked={value.includes(option)}
                onChange={() => {}}
                className="filter-checkbox"
              />
              {option}
            </div>
          ))}

          {filteredOptions.length === 0 && (
            <div className="no-options">
              No companies found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Generic Custom Dropdown Component (without icons)
const CustomDropdown = ({ value, onChange, options, showFlags = false, isCompanyFilter = false }) => {
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
        top: rect.bottom,
        left: rect.left,
        width: rect.width
      });
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="custom-dropdown">
      <button
        ref={buttonRef}
        onClick={handleButtonClick}
        className="dropdown-button"
      >
        <span className="dropdown-button-content">
          {showFlags && value && renderCountryFlag(value)}
          {value || (isCompanyFilter ? 'Select Company Name' : 'All')}
        </span>
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="dropdown-menu"
          style={{
            position: 'absolute',
            top: `${dropdownPos.top}px`,
            left: `${dropdownPos.left}px`,
            width: `${dropdownPos.width}px`,
          }}
        >
          <div
            onClick={() => {
              onChange('');
              setIsOpen(false);
            }}
            className="dropdown-menu-item"
          >
            {isCompanyFilter ? 'NULL' : 'All'}
          </div>
          {options.map((option, idx) => (
            <div
              key={idx}
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              className="dropdown-menu-item"
            >
              {showFlags && renderCountryFlag(option)}
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const employeeSizeRanges = [
  { label: '1-10', min: 1, max: 10 },
  { label: '11-50', min: 11, max: 50 },
  { label: '51-200', min: 51, max: 200 },
  { label: '201-500', min: 201, max: 500 },
  { label: '501-1000', min: 501, max: 1000 },
  { label: '1000-5000', min: 1000, max: 5000 },
  { label: '5000-10,000', min: 5000, max: 10000 },
  { label: '10k+', min: 10000, max: Infinity }
];

const revenueRanges = [
  { label: '$0–$1M', min: 0, max: 1000000 },
  { label: '$1M–$5M', min: 1000000, max: 5000000 },
  { label: '$5M–$10M', min: 5000000, max: 10000000 },
  { label: '$10M–$25M', min: 10000000, max: 25000000 },
  { label: '$25M–$50M', min: 25000000, max: 50000000 },
  { label: '$50M–$100M', min: 50000000, max: 100000000 },
  { label: '$100M–$250M', min: 100000000, max: 250000000 },
  { label: '$250M–$500M', min: 250000000, max: 500000000 },
  { label: '$500M–$1B', min: 500000000, max: 1000000000 },
  { label: '$1B–$10B', min: 1000000000, max: 10000000000 },
  { label: '$10B+', min: 10000000000, max: Infinity }
];

const formatEmployeeSize = (value) => {
  if (!value || value === 'N/A') return value;
  
  const num = parseInt(value);
  if (isNaN(num)) return value;
  
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return num.toString();
};

const getEmployeeSizeRange = (value) => {
  if (!value || value === 'N/A') return null;
  
  const num = parseInt(value);
  if (isNaN(num)) return null;
  
  return employeeSizeRanges.find(range => num >= range.min && num <= range.max);
};

const getRevenueRange = (value) => {
  if (!value || value === 'N/A') return null;
  
  // Remove currency symbols and convert to number
  const cleanValue = String(value).replace(/[$,]/g, '');
  const num = parseFloat(cleanValue);
  if (isNaN(num)) return null;
  
  return revenueRanges.find(range => num >= range.min && num <= range.max);
};

const isEmployeeSizeInRange = (employeeSize, rangeLabel) => {
  if (!employeeSize || employeeSize === 'N/A') return false;
  
  const num = parseInt(employeeSize);
  if (isNaN(num)) return false;
  
  const range = employeeSizeRanges.find(r => r.label === rangeLabel);
  if (!range) return false;
  
  return num >= range.min && num <= range.max;
};

const isRevenueInRange = (revenue, rangeLabel) => {
  if (!revenue || revenue === 'N/A') return false;
  
  // Remove currency symbols and convert to number
  const cleanValue = String(revenue).replace(/[$,]/g, '');
  const num = parseFloat(cleanValue);
  if (isNaN(num)) return false;
  
  const range = revenueRanges.find(r => r.label === rangeLabel);
  if (!range) return false;
  
  return num >= range.min && num <= range.max;
};

const Speedometer = ({ value }) => {
  // Parse the value to get just the number
  const numValue = parseInt(value) || 0;
  const clampedValue = Math.min(Math.max(numValue, 0), 100);
  
  // Calculate rotation based on 5 zones (180 degree arc):
  let rotation;
  if (clampedValue <= 20) {
    rotation = -90;
  } else if (clampedValue <= 40) {
    rotation = -45;
  } else if (clampedValue <= 60) {
    rotation = 0;
  } else if (clampedValue <= 80) {
    rotation = 45;
  } else {
    rotation = 90;
  }

  return (
    <div className="speedometer-container">
      <div className="speedometer-svg" style={{ position: 'relative', width: '50px', height: '28px' }}>
        <svg width="50" height="28" viewBox="0 0 100 55" style={{ position: 'absolute', top: 0, left: 0 }}>
          <defs>
            {/* Gradient for smooth color transition */}
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="20%" stopColor="#f97316" />
              <stop offset="40%" stopColor="#fbbf24" />
              <stop offset="60%" stopColor="#86efac" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
          
          {/* Single smooth gradient arc - inner position */}
          <path
            d="M 8 50 A 45 45 0 0 1 92 50"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="10"
            strokeLinecap="round"
          />
          
          {/* Black needle - smaller and inside the gauge */}
          <g style={{ transform: `rotate(${rotation}deg)`, transformOrigin: '50px 50px', transition: 'transform 0.3s ease' }}>
            <line x1="50" y1="50" x2="50" y2="20" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="50" cy="50" r="2" fill="#000000" />
          </g>
          
          {/* Center pointer dot - smaller */}
          <circle cx="50" cy="50" r="3.5" fill="#ffffff" stroke="#000000" strokeWidth="1.5" />
        </svg>
      </div>
      
      {/* Percentage value below the chart */}
      <div className="speedometer-value">
        {clampedValue}%
      </div>
    </div>
  );
};

const Technographics = () => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { setIndustryData, setTechnologyData, setAvailableRegions } = useIndustry();
  const [tooltip, setTooltip] = useState({ show: false, text: '', x: 0, y: 0 });
  const [filters, setFilters] = useState({
    companyName: [],
    region: [],
    technology: [],
    category: [],
    industry: [],
    employeeSize: [],
    revenue: []
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilterMenu, setActiveFilterMenu] = useState(null);
  const [openFilterDropdown, setOpenFilterDropdown] = useState(null);
  const [companySearchTerm, setCompanySearchTerm] = useState('');
  const filterRef = useRef(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [ntpData, setNtpData] = useState([]);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 7;

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
          className="tech-logo"
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
          className="tech-icon"
          style={{ color: color }}
          title={techName}
        />
      );
    }
    
    return null;
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
    setCurrentPage(1);
  };

  const handleDownloadCSV = () => {
    const dataToDownload = selectedRows.size > 0 
      ? groupedDataArray.filter((_, index) => selectedRows.has(index))
      : groupedDataArray;

    if (dataToDownload.length === 0) return;

    const headers = ['companyName', 'domain', 'industry', 'region', 'employeeSize', 'revenue', 'technologies'];
    const csvContent = [
      headers.join(','),
      ...dataToDownload.map(row =>
        headers.map(header => {
          let value = row[header];
          if (header === 'technologies') {
            value = Array.isArray(value) ? value.join('; ') : value;
          }
          return `"${String(value ?? '').replace(/"/g, '""')}"`;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'technographics_data.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle click outside to close filter dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside the filter container
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        // Also check if the click is not on any dropdown that might be positioned absolutely
        const dropdowns = document.querySelectorAll('[data-filter-dropdown]');
        let isClickOnDropdown = false;
        
        dropdowns.forEach(dropdown => {
          if (dropdown.contains(event.target)) {
            isClickOnDropdown = true;
          }
        });
        
        if (!isClickOnDropdown) {
          setOpenFilterDropdown(null);
          setShowFilters(false);
        }
      }
    };

    if (openFilterDropdown || showFilters) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [openFilterDropdown, showFilters]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/technographics');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setTableData(data);

        // Fetch NTP data
        const ntpResponse = await fetch('/api/ntp');
        if (ntpResponse.ok) {
          const ntpDataFetched = await ntpResponse.json();
          setNtpData(ntpDataFetched);
        }

        // Calculate industry counts from the table data
        const industryCounts = {};
        data.forEach(row => {
          const industry = row.industry || 'Other';
          industryCounts[industry] = (industryCounts[industry] || 0) + 1;
        });

        // Convert to array format for pie chart
        const industryArray = Object.entries(industryCounts).map(([label, value]) => ({
          label,
          value
        }));

        // Update the shared context with real industry data
        setIndustryData(industryArray);

        // Calculate technology adoption by region and category
        const techByRegion = {};
        const regions = new Set();

        data.forEach(row => {
          const region = row.region || 'Unknown';
          const category = row.category || 'Other';

          regions.add(region);

          if (!techByRegion[region]) {
            techByRegion[region] = {};
          }

          if (!techByRegion[region][category]) {
            techByRegion[region][category] = 0;
          }

          techByRegion[region][category]++;
        });

        // Calculate percentages for each region
        const techDataWithPercentages = {};
        Object.keys(techByRegion).forEach(region => {
          const total = Object.values(techByRegion[region]).reduce((sum, count) => sum + count, 0);
          techDataWithPercentages[region] = {};

          Object.keys(techByRegion[region]).forEach(category => {
            const percentage = total > 0 ? Math.round((techByRegion[region][category] / total) * 100) : 0;
            techDataWithPercentages[region][category] = percentage;
          });
        });

        setTechnologyData(techDataWithPercentages);
        setAvailableRegions(Array.from(regions).sort());
      } catch (e) {
        setError(e.message);
        console.error("Failed to fetch Technographics data:", e);
        setTableData([]); // Set empty data on error
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [setIndustryData, setTechnologyData, setAvailableRegions]);

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

  // Helper function to count companies by region
  const getCompanyCountByRegion = (region) => {
    if (!tableData) return 0;
    const uniqueCompanies = new Set();
    tableData.forEach(row => {
      if (row.region === region) {
        uniqueCompanies.add(row.companyName);
      }
    });
    return uniqueCompanies.size;
  };

  // Helper function to count companies by industry
  const getCompanyCountByIndustry = (industry) => {
    if (!tableData) return 0;
    const uniqueCompanies = new Set();
    tableData.forEach(row => {
      if (row.industry === industry) {
        uniqueCompanies.add(row.companyName);
      }
    });
    return uniqueCompanies.size;
  };

  // Helper function to count companies by revenue
  const getCompanyCountByRevenue = (revenue) => {
    if (!tableData) return 0;
    const uniqueCompanies = new Set();
    tableData.forEach(row => {
      if (row.revenue === revenue) {
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

  // Helper function to count companies by employee size
  const getCompanyCountByEmployeeSize = (rangeLabel) => {
    if (!tableData) return 0;
    const uniqueCompanies = new Set();
    tableData.forEach(row => {
      if (isEmployeeSizeInRange(row.employeeSize, rangeLabel)) {
        uniqueCompanies.add(row.companyName);
      }
    });
    return uniqueCompanies.size;
  };

  const getNtpDataForCompany = (companyName) => {
    if (!companyName || !ntpData || ntpData.length === 0) {
      return [];
    }
    
    // Normalize company name for comparison
    const normalizedCompanyName = String(companyName).trim().toLowerCase();
    
    let data = ntpData.filter(row => {
      const rowCompanyName = String(row.companyName || '').trim().toLowerCase();
      return rowCompanyName === normalizedCompanyName;
    });
    
    // Filter by selected category if one is chosen (category is an array)
    if (filters.category && Array.isArray(filters.category) && filters.category.length > 0) {
      data = data.filter(row => {
        const rowCategory = String(row.category || '').trim().toLowerCase();
        return filters.category.some(cat => String(cat).trim().toLowerCase() === rowCategory);
      });
    }
    
    return data;
  };

  // Helper function to check if a row matches search term
  const rowMatchesSearch = (row) => {
    if (!searchTerm) return false;
    return Object.values(row).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Helper function to highlight matching text
  const highlightText = (text, search) => {
    if (!search || !text) return text;
    const textStr = String(text);
    const searchLower = search.toLowerCase();
    const textLower = textStr.toLowerCase();
    const index = textLower.indexOf(searchLower);

    if (index === -1) return textStr;

    const before = textStr.substring(0, index);
    const match = textStr.substring(index, index + search.length);
    const after = textStr.substring(index + search.length);

    return (
      <>
        {before}
        <span className="highlight-text">
          {match}
        </span>
        {after}
      </>
    );
  };

  // Check if mandatory filters are selected
  const hasMandatoryFilters = filters.companyName.length > 0 && filters.category.length > 0;

  const filteredData = tableData
    .filter(row => {
      // Mandatory filters - must have both company name and category
      if (!hasMandatoryFilters) return false;

      // Apply company name filter
      if (!filters.companyName.includes(String(row.companyName))) return false;

      // Apply category filter
      if (filters.category.length > 0 && !filters.category.includes(String(row.category))) return false;

      // Apply region filter if selected
      if (filters.region.length > 0 && !filters.region.includes(String(row.region))) return false;

      // Apply technology filter if selected
      if (filters.technology.length > 0 && !filters.technology.includes(String(row.technology))) return false;

      // Apply industry filter if selected
      if (filters.industry.length > 0 && !filters.industry.includes(String(row.industry))) return false;

      // Apply employee size filter if selected
      if (filters.employeeSize.length > 0 && !filters.employeeSize.some(range => isEmployeeSizeInRange(row.employeeSize, range))) return false;

      // Apply revenue filter if selected (using ranges)
      if (filters.revenue.length > 0) {
        const matchesRevenue = filters.revenue.some(rangeLabel => isRevenueInRange(row.revenue, rangeLabel));
        if (!matchesRevenue) return false;
      }

      // Apply search term if present
      const searchMatches = !searchTerm || Object.values(row).some(value =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      );

      return searchMatches;
    })
    .sort((a, b) => {
      // Sort: matching rows first, then others
      const aMatches = rowMatchesSearch(a);
      const bMatches = rowMatchesSearch(b);

      if (aMatches && !bMatches) return -1;
      if (!aMatches && bMatches) return 1;
      return 0;
    });

  // Group rows by company and combine technologies
  const groupedData = filteredData.reduce((acc, row) => {
    const key = `${row.companyName}|${row.domain}|${row.industry}|${row.region}|${row.employeeSize}|${row.revenue}`;
    
    if (!acc[key]) {
      acc[key] = {
        ...row,
        technologies: [row.technology]
      };
    } else {
      if (!acc[key].technologies.includes(row.technology)) {
        acc[key].technologies.push(row.technology);
      }
    }
    
    return acc;
  }, {});

  const groupedDataArray = Object.values(groupedData);

  if (loading) {
    return (
      <div className="loading-container">
        {/* Nexora Logo */}
        <img 
          src={nexoraLogo} 
          alt="Nexora Logo" 
          className="loading-logo"
        />

        {/* Subtext */}
        <p className="loading-subtext">
          Fetching and processing company technology data...
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
    <div className="technographics-container">
      {/* Error Banner */}
      {error && (
        <div className="error-banner">
          <div className="error-icon">
            ⚠
          </div>
          <div className="error-text">
            Error fetching data: {error}. Showing UI with no data.
          </div>
          <button
            onClick={() => setError(null)}
            className="error-close"
          >
            ✕
          </button>
        </div>
      )}
      
      <div className="header-actions">
        <h2 className="header-title">Technographics</h2>
      </div>

      <div className="section-subtle-divider" />
      
      {/* Filter UI - Similar to the reference image */}
      <div className="filter-container" ref={filterRef}>
        <div className="filter-row">
          <div className="filter-chips">
          {/* Filter Button with Dropdown Menu */}
          <div className="filter-button-container">
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
                  { label: 'Region', key: 'region', mandatory: false },
                  { label: 'Industry', key: 'industry', mandatory: false },
                  { label: 'Employee Size', key: 'employeeSize', mandatory: false },
                  { label: 'Revenue', key: 'revenue', mandatory: false },
                  { label: 'Technology', key: 'technology', mandatory: false }
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

          {/* Company Name Filter - Always Visible (Mandatory) */}
          {activeFilterMenu !== 'companyName' && (
            <div className="filter-button-container">
              <button
                onClick={() => setActiveFilterMenu('companyName')}
                className="filter-button"
              >
                <span>Company Name {Array.isArray(filters.companyName) && filters.companyName.length > 0 && `(${filters.companyName.length})`} <span className="mandatory-indicator">*</span></span>
              </button>
            </div>
          )}

          {/* Category Filter - Always Visible (Mandatory) */}
          {activeFilterMenu !== 'category' && (
            <div className="filter-button-container">
              <button
                onClick={() => setActiveFilterMenu('category')}
                className="filter-button"
              >
                <span>Category {Array.isArray(filters.category) && filters.category.length > 0 && `(${filters.category.length})`} <span className="mandatory-indicator">*</span></span>
              </button>
            </div>
          )}

          {/* Filter Type Chip - Show selected filter type with dropdown */}
          {activeFilterMenu === 'companyName' && (
            <div className="filter-button-container">
              <div className="filter-chip">
                <span>Company Name <span className="mandatory-indicator">*</span></span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveFilterMenu(null);
                    setCompanySearchTerm('');
                  }}
                  className="filter-chip-close"
                >
                  ✕
                </button>
              </div>
              
              {/* Dropdown with search and checkboxes for company options */}
              <div
                data-filter-dropdown="companyName"
                className="filter-dropdown"
              >
                {/* Search Box */}
                <div className="filter-search">
                  <input
                    type="text"
                    placeholder="Search companies..."
                    value={companySearchTerm}
                    onChange={(e) => setCompanySearchTerm(e.target.value)}
                    className="filter-search-input"
                  />
                </div>

                {/* ALL Option */}
                <div
                  onClick={() => {
                    if (filters.companyName.length === getUniqueOptions('companyName').length && filters.companyName.length > 0) {
                      // If all are selected, deselect all
                      handleFilterChange('companyName', []);
                    } else {
                      // Otherwise, select all
                      handleFilterChange('companyName', getUniqueOptions('companyName'));
                    }
                  }}
                  className="filter-option"
                >
                  <input
                    type="checkbox"
                    checked={filters.companyName.length === getUniqueOptions('companyName').length && getUniqueOptions('companyName').length > 0}
                    onChange={() => {
                      if (filters.companyName.length === getUniqueOptions('companyName').length && filters.companyName.length > 0) {
                        // If all are selected, deselect all
                        handleFilterChange('companyName', []);
                      } else {
                        // Otherwise, select all
                        handleFilterChange('companyName', getUniqueOptions('companyName'));
                      }
                    }}
                    className="filter-checkbox"
                  />
                  All
                </div>

                {/* Company Options with Checkboxes */}
                {getUniqueOptions('companyName')
                  .filter(company => company.toLowerCase().includes(companySearchTerm.toLowerCase()))
                  .map((company, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      const newCompanies = filters.companyName.includes(company)
                        ? filters.companyName.filter(c => c !== company)
                        : [...filters.companyName, company];
                      handleFilterChange('companyName', newCompanies);
                    }}
                    className="filter-option"
                  >
                    <div className="filter-option-text">
                      <input
                        type="checkbox"
                        checked={filters.companyName.includes(company)}
                        onChange={() => {}}
                        className="filter-checkbox"
                      />
                      <span>{company}</span>
                    </div>
                  </div>
                ))}

                {getUniqueOptions('companyName').filter(company => company.toLowerCase().includes(companySearchTerm.toLowerCase())).length === 0 && (
                  <div className="no-options">
                    No companies found
                  </div>
                )}

                {/* Save Button */}
                <div className="filter-footer">
                  <button
                    onClick={() => {
                      setActiveFilterMenu(null);
                      setCompanySearchTerm('');
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
          {activeFilterMenu === 'region' && (
            <div className="filter-button-container">
              <div className="filter-chip">
                <span>Region</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveFilterMenu(null);
                  }}
                  className="filter-chip-close"
                >
                  ✕
                </button>
              </div>
              
              {/* Dropdown with all region options - only show when clicked */}
              {openFilterDropdown === 'region' && (
                <div
                  data-filter-dropdown="region"
                  className="filter-dropdown"
                >
                  <div
                    onClick={() => {
                      if (filters.region.length === getUniqueOptions('region').length && filters.region.length > 0) {
                        // If all are selected, deselect all
                        handleFilterChange('region', []);
                      } else {
                        // Otherwise, select all
                        handleFilterChange('region', getUniqueOptions('region'));
                      }
                    }}
                    className={`filter-option ${filters.region.length === getUniqueOptions('region').length && filters.region.length > 0 ? 'filter-option-selected' : ''} filter-option-all`}
                  >
                    <input
                      type="checkbox"
                      checked={filters.region.length === getUniqueOptions('region').length && filters.region.length > 0}
                      onChange={() => {}}
                      className="filter-checkbox"
                    />
                    <span>ALL</span>
                  </div>
                  {getUniqueOptions('region').map((region) => (
                    <div
                      key={region}
                      onClick={() => {
                        const newRegions = filters.region.includes(region)
                          ? filters.region.filter(r => r !== region)
                          : [...filters.region, region];
                        handleFilterChange('region', newRegions);
                      }}
                      className={`filter-option ${filters.region.includes(region) ? 'filter-option-selected' : ''}`}
                    >
                      <div className="filter-option-text">
                        <input
                          type="checkbox"
                          checked={filters.region.includes(region)}
                          onChange={() => {}}
                          className="filter-checkbox"
                        />
                        {renderCountryFlag(region)}
                        <span>{region}</span>
                      </div>
                      <span className="filter-option-count">
                        {getCompanyCountByRegion(region)}
                      </span>
                    </div>
                  ))}

                  {/* Save Button */}
                  <div className="filter-footer">
                    <button
                      onClick={() => {
                        setOpenFilterDropdown(null);
                        setActiveFilterMenu(null);
                      }}
                      className="filter-save-button"
                    >
                      Save
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Display saved filter tag */}
          {filters.region.length > 0 && activeFilterMenu !== 'region' && (
            <div className="filter-chip">
              <span>Region ({filters.region.length})</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleFilterChange('region', []);
                }}
                className="filter-chip-close"
              >
                ✕
              </button>
            </div>
          )}

          {activeFilterMenu === 'category' && (
            <div className="filter-button-container">
              <div className="filter-chip">
                <span>Category <span className="mandatory-indicator">*</span></span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveFilterMenu(null);
                  }}
                  className="filter-chip-close"
                >
                  ✕
                </button>
              </div>
              <div className="filter-dropdown">
                <div
                  onClick={() => {
                    const allOptions = getUniqueOptions('category');
                    // Toggle: if all selected, deselect all; otherwise select all
                    if (filters.category.length === allOptions.length) {
                      handleFilterChange('category', []);
                    } else {
                      handleFilterChange('category', allOptions);
                    }
                  }}
                  className="filter-option"
                >
                  <input
                    type="checkbox"
                    checked={filters.category.length === getUniqueOptions('category').length && getUniqueOptions('category').length > 0}
                    onChange={() => {
                      const allOptions = getUniqueOptions('category');
                      // Toggle: if all selected, deselect all; otherwise select all
                      if (filters.category.length === allOptions.length) {
                        handleFilterChange('category', []);
                      } else {
                        handleFilterChange('category', allOptions);
                      }
                    }}
                    className="filter-checkbox"
                  />
                  All
                </div>
                {getUniqueOptions('category').map((option, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleFilterChange('category', option)}
                    className={`filter-option ${filters.category.includes(option) ? 'filter-option-selected' : ''}`}
                  >
                    <div className="filter-option-text">
                      <input
                        type="checkbox"
                        checked={filters.category.includes(option)}
                        onChange={() => handleFilterChange('category', option)}
                        className="filter-checkbox"
                      />
                      {renderTechLogo(option)}
                      <span>{option}</span>
                    </div>
                    <span className="filter-option-count">
                      {getCompanyCountByCategory(option)}
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

          {/* Display saved filter tag */}
          {activeFilterMenu === 'industry' && (
            <div className="filter-button-container">
              <div className="filter-chip">
                <span>Industry</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveFilterMenu(null);
                  }}
                  className="filter-chip-close"
                >
                  ✕
                </button>
              </div>
              
              {openFilterDropdown === 'industry' && (
                <div
                  data-filter-dropdown="industry"
                  className="filter-dropdown"
                >
                  <div
                    onClick={() => {
                      if (filters.industry.length === getUniqueOptions('industry').length && filters.industry.length > 0) {
                        // If all are selected, deselect all
                        handleFilterChange('industry', []);
                      } else {
                        // Otherwise, select all
                        handleFilterChange('industry', getUniqueOptions('industry'));
                      }
                    }}
                    className={`filter-option ${filters.industry.length === getUniqueOptions('industry').length && filters.industry.length > 0 ? 'filter-option-selected' : ''} filter-option-all`}
                  >
                    <input
                      type="checkbox"
                      checked={filters.industry.length === getUniqueOptions('industry').length && filters.industry.length > 0}
                      onChange={() => {}}
                      className="filter-checkbox"
                    />
                    <span>ALL</span>
                  </div>
                  {getUniqueOptions('industry').map((industry) => (
                    <div
                      key={industry}
                      onClick={() => {
                        const newIndustries = filters.industry.includes(industry)
                          ? filters.industry.filter(i => i !== industry)
                          : [...filters.industry, industry];
                        handleFilterChange('industry', newIndustries);
                      }}
                      className={`filter-option ${filters.industry.includes(industry) ? 'filter-option-selected' : ''}`}
                    >
                      <div className="filter-option-text">
                        <input
                          type="checkbox"
                          checked={filters.industry.includes(industry)}
                          onChange={() => {}}
                          className="filter-checkbox"
                        />
                        <span>{industry}</span>
                      </div>
                      <span className="filter-option-count">
                        {getCompanyCountByIndustry(industry)}
                      </span>
                    </div>
                  ))}

                  <div className="filter-footer">
                    <button
                      onClick={() => {
                        setOpenFilterDropdown(null);
                        setActiveFilterMenu(null);
                      }}
                      className="filter-save-button"
                    >
                      Save
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {filters.industry.length > 0 && activeFilterMenu !== 'industry' && (
            <div className="filter-chip">
              <span>Industry ({filters.industry.length})</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleFilterChange('industry', []);
                }}
                className="filter-chip-close"
              >
                ✕
              </button>
            </div>
          )}

          {activeFilterMenu === 'employeeSize' && (
            <div className="filter-button-container">
              <div className="filter-chip">
                <span>Employee Size</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveFilterMenu(null);
                  }}
                  className="filter-chip-close"
                >
                  ✕
                </button>
              </div>
              
              {openFilterDropdown === 'employeeSize' && (
                <div
                  data-filter-dropdown="employeeSize"
                  className="filter-dropdown"
                >
                  <div
                    onClick={() => {
                      if (filters.employeeSize.length === employeeSizeRanges.length && filters.employeeSize.length > 0) {
                        // If all are selected, deselect all
                        handleFilterChange('employeeSize', []);
                      } else {
                        // Otherwise, select all
                        handleFilterChange('employeeSize', employeeSizeRanges.map(r => r.label));
                      }
                    }}
                    className={`filter-option ${filters.employeeSize.length === employeeSizeRanges.length && filters.employeeSize.length > 0 ? 'filter-option-selected' : ''} filter-option-all`}
                  >
                    <input
                      type="checkbox"
                      checked={filters.employeeSize.length === employeeSizeRanges.length && filters.employeeSize.length > 0}
                      onChange={() => {}}
                      className="filter-checkbox"
                    />
                    <span>ALL</span>
                  </div>
                  {employeeSizeRanges.map((range) => (
                    <div
                      key={range.label}
                      onClick={() => {
                        const newSizes = filters.employeeSize.includes(range.label)
                          ? filters.employeeSize.filter(s => s !== range.label)
                          : [...filters.employeeSize, range.label];
                        handleFilterChange('employeeSize', newSizes);
                      }}
                      className={`filter-option ${filters.employeeSize.includes(range.label) ? 'filter-option-selected' : ''}`}
                    >
                      <div className="filter-option-text">
                        <input
                          type="checkbox"
                          checked={filters.employeeSize.includes(range.label)}
                          onChange={() => {}}
                          className="filter-checkbox"
                        />
                        <span>{range.label}</span>
                      </div>
                      <span className="filter-option-count">
                        {getCompanyCountByEmployeeSize(range.label)}
                      </span>
                    </div>
                  ))}

                  <div className="filter-footer">
                    <button
                      onClick={() => {
                        setOpenFilterDropdown(null);
                        setActiveFilterMenu(null);
                      }}
                      className="filter-save-button"
                    >
                      Save
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {filters.employeeSize.length > 0 && activeFilterMenu !== 'employeeSize' && (
            <div className="filter-chip">
              <span>Employee Size ({filters.employeeSize.length})</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleFilterChange('employeeSize', []);
                }}
                className="filter-chip-close"
              >
                ✕
              </button>
            </div>
          )}

          {activeFilterMenu === 'revenue' && (
            <div className="filter-button-container">
              <div className="filter-chip">
                <span>Revenue</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveFilterMenu(null);
                  }}
                  className="filter-chip-close"
                >
                  ✕
                </button>
              </div>
              
              {openFilterDropdown === 'revenue' && (
                <div
                  data-filter-dropdown="revenue"
                  className="filter-dropdown"
                >
                  <div
                    onClick={() => {
                      if (filters.revenue.length === revenueRanges.length && filters.revenue.length > 0) {
                        // If all are selected, deselect all
                        handleFilterChange('revenue', []);
                      } else {
                        // Otherwise, select all
                        handleFilterChange('revenue', revenueRanges.map(r => r.label));
                      }
                    }}
                    className={`filter-option ${filters.revenue.length === revenueRanges.length && filters.revenue.length > 0 ? 'filter-option-selected' : ''} filter-option-all`}
                  >
                    <input
                      type="checkbox"
                      checked={filters.revenue.length === revenueRanges.length && filters.revenue.length > 0}
                      onChange={() => {}}
                      className="filter-checkbox"
                    />
                    <span>ALL</span>
                  </div>
                  {revenueRanges.map((range) => (
                    <div
                      key={range.label}
                      onClick={() => {
                        const newRevenues = filters.revenue.includes(range.label)
                          ? filters.revenue.filter(r => r !== range.label)
                          : [...filters.revenue, range.label];
                        handleFilterChange('revenue', newRevenues);
                      }}
                      className={`filter-option ${filters.revenue.includes(range.label) ? 'filter-option-selected' : ''}`}
                    >
                      <div className="filter-option-text">
                        <input
                          type="checkbox"
                          checked={filters.revenue.includes(range.label)}
                          onChange={() => {}}
                          className="filter-checkbox"
                        />
                        <span>{range.label}</span>
                      </div>
                    </div>
                  ))}

                  <div className="filter-footer">
                    <button
                      onClick={() => {
                        setOpenFilterDropdown(null);
                        setActiveFilterMenu(null);
                      }}
                      className="filter-save-button"
                    >
                      Save
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {filters.revenue.length > 0 && activeFilterMenu !== 'revenue' && (
            <div className="filter-chip">
              <span>Revenue ({filters.revenue.length})</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleFilterChange('revenue', []);
                }}
                className="filter-chip-close"
              >
                ✕
              </button>
            </div>
          )}

          {activeFilterMenu === 'technology' && (
            <div className="filter-button-container">
              <div className="filter-chip">
                <span>Technology</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveFilterMenu(null);
                  }}
                  className="filter-chip-close"
                >
                  ✕
                </button>
              </div>
              
              {/* Dropdown with all technology options - only show when clicked */}
              {openFilterDropdown === 'technology' && (
                <div
                  data-filter-dropdown="technology"
                  className="filter-dropdown"
                >
                  <div
                    onClick={() => {
                      if (filters.technology.length === getUniqueOptions('technology').length && filters.technology.length > 0) {
                        // If all are selected, deselect all
                        handleFilterChange('technology', []);
                      } else {
                        // Otherwise, select all
                        handleFilterChange('technology', getUniqueOptions('technology'));
                      }
                    }}
                    className={`filter-option ${filters.technology.length === getUniqueOptions('technology').length && filters.technology.length > 0 ? 'filter-option-selected' : ''} filter-option-all`}
                  >
                    <input
                      type="checkbox"
                      checked={filters.technology.length === getUniqueOptions('technology').length && filters.technology.length > 0}
                      onChange={() => {}}
                      className="filter-checkbox"
                    />
                    <span>ALL</span>
                  </div>
                  {getUniqueOptions('technology').map((tech) => (
                    <div
                      key={tech}
                      onClick={() => {
                        const newTechs = filters.technology.includes(tech)
                          ? filters.technology.filter(t => t !== tech)
                          : [...filters.technology, tech];
                        handleFilterChange('technology', newTechs);
                      }}
                      className={`filter-option ${filters.technology.includes(tech) ? 'filter-option-selected' : ''}`}
                    >
                      <div className="filter-option-text">
                        <input
                          type="checkbox"
                          checked={filters.technology.includes(tech)}
                          onChange={() => {}}
                          className="filter-checkbox"
                        />
                        {renderTechLogo(tech)}
                        <span>{tech}</span>
                      </div>
                      <span className="filter-option-count">
                        {getCompanyCountByTechnology(tech)}
                      </span>
                    </div>
                  ))}

                  {/* Save Button */}
                  <div className="filter-footer">
                    <button
                      onClick={() => {
                        setOpenFilterDropdown(null);
                        setActiveFilterMenu(null);
                      }}
                      className="filter-save-button"
                    >
                      Save
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Display saved filter tag */}
          {filters.technology.length > 0 && activeFilterMenu !== 'technology' && (
            <div className="filter-chip">
              <span>Technology ({filters.technology.length})</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleFilterChange('technology', []);
                }}
                className="filter-chip-close"
              >
                ✕
              </button>
            </div>
          )}

          {/* Applied Filters Display */}
          {(filters.companyName.length > 0 || filters.region || filters.category || filters.technology) && !activeFilterMenu && (
            <>
            </>
          )}
          </div>
          
          {/* Download CSV Button - Show in filter row only when warning message is hidden */}
          {hasMandatoryFilters && (
            <button className="download-csv-button" onClick={() => handleDownloadCSV(groupedDataArray)}>
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
      {!hasMandatoryFilters && (
        <div className="warning-message">
          <div className="warning-box">
            <div className="warning-icon">
              ⓘ
            </div>
            <div className="warning-text">
              {filters.companyName.length === 0 && filters.category.length > 0 ? (
                'Please select a Company Name to view data'
              ) : filters.companyName.length > 0 && filters.category.length === 0 ? (
                'Please select a Category to view data'
              ) : (
                'Please select both Company Name and Category to view data'
              )}
            </div>
          </div>
          <button className="download-csv-button" onClick={() => handleDownloadCSV(groupedDataArray)}>
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
          <thead className="technographics-sticky-header">
            <tr>
              <th className="table-checkbox">
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
                  className="table-row-checkbox"
                />
              </th>
              <th className="table-header">Company Name</th>
              <th className="table-header">Industry</th>
              <th className="table-header">Region</th>
              <th className="table-header">Employee Size</th>
              <th className="table-header">Revenue</th>
              <th className="table-header">Technology</th>
            </tr>
          </thead>
          <tbody>
            {hasMandatoryFilters ? (
              filteredData.length > 0 ? (
                (() => {
                  const totalPages = Math.ceil(groupedDataArray.length / rowsPerPage);
                  const startIndex = (currentPage - 1) * rowsPerPage;
                  const endIndex = startIndex + rowsPerPage;
                  const paginatedData = groupedDataArray.slice(startIndex, endIndex);

                  return paginatedData.map((row, index) => {
                    const actualIndex = startIndex + index;
                    const isHighlighted = rowMatchesSearch(row);

                  const handleMouseEnter = (e, text) => {
                    const rect = e.target.getBoundingClientRect();
                    setTooltip({
                      show: true,
                      text: text,
                      x: rect.right - 20,
                      y: rect.bottom + 20
                    });
                  };

                  const handleMouseLeave = () => {
                    setTooltip({ show: false, text: '', x: 0, y: 0 });
                  };

                  const handleCompanyNameMouseEnter = (e, companyName) => {
                    const rect = e.target.getBoundingClientRect();
                    setTooltip({
                      show: true,
                      text: companyName,
                      hint: 'Click to view NTP Analysis',
                      x: rect.right - 20,
                      y: rect.bottom + 20,
                      isCompanyName: true
                    });
                  };

                  return (
                    <tr 
                      key={index} 
                      style={{ backgroundColor: isHighlighted ? '#fefce8' : 'transparent', cursor: 'pointer' }}
                      onClick={() => setSelectedCompany(row.companyName)}
                    >
                      <td className="table-checkbox" onClick={(e) => e.stopPropagation()}>
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
                          className="table-row-checkbox"
                        />
                      </td>
                      <td onMouseEnter={(e) => handleCompanyNameMouseEnter(e, row.companyName)} onMouseLeave={handleMouseLeave}>
                        <div className="company-name-cell">
                          <div className="company-name">
                            {highlightText(row.companyName, searchTerm)}
                          </div>
                          <div className="company-domain">
                            <span>{highlightText(row.domain, searchTerm)}</span>
                            {row.linkedinUrl && (
                              <a
                                href={row.linkedinUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="linkedin-link"
                                title="View LinkedIn Profile"
                              >
                                <FaLinkedin size={20} />
                              </a>
                            )}
                          </div>
                        </div>
                      </td>
                      <td onMouseEnter={(e) => handleMouseEnter(e, row.industry)} onMouseLeave={handleMouseLeave}>
                        {highlightText(row.industry, searchTerm)}
                      </td>
                      <td onMouseEnter={(e) => handleMouseEnter(e, row.region)} onMouseLeave={handleMouseLeave}>
                        <span className="region-cell">
                          {renderCountryFlag(row.region)}
                          {highlightText(row.region, searchTerm)}
                        </span>
                      </td>
                      <td style={{ paddingLeft: '40px' }} onMouseEnter={(e) => handleMouseEnter(e, row.employeeSize)} onMouseLeave={handleMouseLeave}>
                        {highlightText(formatEmployeeSize(row.employeeSize), searchTerm)}
                      </td>
                      <td style={{ paddingLeft: '20px' }} onMouseEnter={(e) => handleMouseEnter(e, row.revenue)} onMouseLeave={handleMouseLeave}>
                        {highlightText(row.revenue, searchTerm)}
                      </td>
                      <td style={{ paddingLeft: '8px' }}>
                        <div className="tech-cell">
                          {(row.technologies || [row.technology]).map((tech, idx) => (
                            <span key={idx} className="tech-item">
                              {renderTechLogo(tech)}
                              {highlightText(tech, searchTerm)}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                  });
                })()
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                    No data found for the selected company
                  </td>
                </tr>
              )
            ) : null}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {hasMandatoryFilters && groupedDataArray.length > rowsPerPage && (
        <div className="pagination-container">
          {(() => {
            const totalPages = Math.ceil(groupedDataArray.length / rowsPerPage);
            const pages = [];
            const maxPagesToShow = 5;

            // Previous button
            pages.push(
              <button
                key="prev"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="pagination-button"
              >
                ←
              </button>
            );

            // Calculate page range
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

            // Show first page if not in range
            if (startPage > 1) {
              pages.push(
                <button
                  key={1}
                  onClick={() => setCurrentPage(1)}
                  className="pagination-page"
                >
                  1
                </button>
              );

              if (startPage > 2) {
                pages.push(
                  <span key="dots1" className="pagination-dots">
                    ...
                  </span>
                );
              }
            }

            // Page numbers
            for (let i = startPage; i <= endPage; i++) {
              pages.push(
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  className={`pagination-page ${i === currentPage ? 'active' : ''}`}
                >
                  {i}
                </button>
              );
            }

            // Show last page if not in range
            if (endPage < totalPages) {
              if (endPage < totalPages - 1) {
                pages.push(
                  <span key="dots2" className="pagination-dots">
                    ...
                  </span>
                );
              }

              pages.push(
                <button
                  key={totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                  className="pagination-page"
                >
                  {totalPages}
                </button>
              );
            }

            // Next button
            pages.push(
              <button
                key="next"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="pagination-button"
              >
                →
              </button>
            );

            return pages;
          })()}
        </div>
      )}

      {/* Custom Tooltip */}
      {tooltip.show && (
        <div
          className="tooltip"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
          }}
        >
          <div className="tooltip-title">
            {tooltip.text}
          </div>
          {tooltip.hint && (
            <div className="tooltip-hint">
              💡 {tooltip.hint}
            </div>
          )}
          <div className="tooltip-arrow" />
        </div>
      )}

      {/* Side Panel for NTP Details */}
      {selectedCompany && (
        <>
          <div 
            className="side-panel-overlay"
            onClick={() => setSelectedCompany(null)}
          />
          <div className="side-panel">
            <div className="side-panel-header">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="side-panel-title">{selectedCompany}</h3>
                <button
                  onClick={() => setSelectedCompany(null)}
                  className="side-panel-close"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="side-panel-content">
              {getNtpDataForCompany(selectedCompany).length > 0 ? (
                <div>
                  <h4 className="ntp-section-title">Technologies & Purchase Probability</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {getNtpDataForCompany(selectedCompany).map((item, idx) => (
                      <div 
                        key={idx}
                        className="ntp-item"
                      >
                        <div className="ntp-item-header">
                          <div className="ntp-item-info">
                            <p className="ntp-technology">
                              {renderTechLogo(item.technology)}
                              {item.technology}
                            </p>
                            <p className="ntp-category">{item.category}</p>
                          </div>
                          <div style={{ textAlign: 'center', flexShrink: 0 }}>
                            <Speedometer value={item.purchaseProbability} />
                          </div>
                        </div>
                        <p className="ntp-prediction">
                          <strong>Prediction:</strong> {item.purchasePrediction}
                        </p>
                        <div className="ntp-analysis">
                          <p className="ntp-analysis-title">NTP Analysis:</p>
                          <p className="ntp-analysis">
                            {item.ntpAnalysis || 'N/A'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="no-ntp-data">No NTP data available</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Technographics;