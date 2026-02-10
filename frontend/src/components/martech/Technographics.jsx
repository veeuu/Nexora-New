import { useState, useEffect, useRef } from 'react';
import { useIndustry } from '../../context/IndustryContext';
import Flag from 'country-flag-icons/react/3x2';
import { getLogoPath, getTechIcon } from '../../utils/logoMap';
import nexoraLogo from '../../assets/nexora-logo.png';

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
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '16px', borderRadius: '2px', overflow: 'hidden', flexShrink: 0 }}>
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
            maxHeight: '400px',
            overflowY: 'auto',
            zIndex: 10000,
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
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
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
          justifyContent: 'space-between',
          minHeight: '40px'
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
          {value.length === 0 ? (
            'Select Company Name'
          ) : (
            <span style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {value.slice(0, 2).map((company, idx) => (
                <span key={idx} style={{
                  backgroundColor: '#dbeafe',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  whiteSpace: 'nowrap'
                }}>
                  {company}
                </span>
              ))}
              {value.length > 2 && (
                <span style={{
                  backgroundColor: '#dbeafe',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}>
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
          style={{
            position: 'fixed',
            top: `${dropdownPos.top}px`,
            left: `${dropdownPos.left}px`,
            width: `${dropdownPos.width}px`,
            backgroundColor: 'white',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            marginTop: '4px',
            maxHeight: '400px',
            overflowY: 'auto',
            zIndex: 10000,
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}
        >
          <div style={{ padding: '8px', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, backgroundColor: 'white' }}>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '13px',
                fontFamily: 'inherit',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div
            onClick={() => {
              onChange([]);
              setSearchTerm('');
            }}
            style={{
              padding: '10px 12px',
              cursor: 'pointer',
              backgroundColor: value.length === 0 ? '#f3f4f6' : 'white',
              borderBottom: '1px solid #e5e7eb',
              fontSize: '14px'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
            onMouseLeave={(e) => e.target.style.backgroundColor = value.length === 0 ? '#f3f4f6' : 'white'}
          >
            NULL
          </div>

          {filteredOptions.map((option, idx) => (
            <div
              key={idx}
              onClick={() => handleToggleCompany(option)}
              style={{
                padding: '10px 12px',
                cursor: 'pointer',
                backgroundColor: value.includes(option) ? '#dbeafe' : 'white',
                borderBottom: '1px solid #e5e7eb',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                whiteSpace: 'normal',
                wordWrap: 'break-word'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
              onMouseLeave={(e) => e.target.style.backgroundColor = value.includes(option) ? '#dbeafe' : 'white'}
            >
              <input
                type="checkbox"
                checked={value.includes(option)}
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

          {filteredOptions.length === 0 && (
            <div style={{ padding: '10px 12px', color: '#999', textAlign: 'center' }}>
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
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {showFlags && value && renderCountryFlag(value)}
          {value || (isCompanyFilter ? 'Select Company Name' : 'All')}
        </span>
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
            maxHeight: '400px',
            overflowY: 'auto',
            zIndex: 10000,
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
              fontSize: '14px',
              whiteSpace: 'normal',
              wordWrap: 'break-word'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
            onMouseLeave={(e) => e.target.style.backgroundColor = value === '' ? '#f3f4f6' : 'white'}
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
              style={{
                padding: '10px 12px',
                cursor: 'pointer',
                backgroundColor: value === option ? '#dbeafe' : 'white',
                borderBottom: '1px solid #e5e7eb',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                whiteSpace: 'normal',
                wordWrap: 'break-word'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
              onMouseLeave={(e) => e.target.style.backgroundColor = value === option ? '#dbeafe' : 'white'}
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

const isEmployeeSizeInRange = (employeeSize, rangeLabel) => {
  if (!employeeSize || employeeSize === 'N/A') return false;
  
  const num = parseInt(employeeSize);
  if (isNaN(num)) return false;
  
  const range = employeeSizeRanges.find(r => r.label === rangeLabel);
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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
      <div style={{ position: 'relative', width: '50px', height: '28px' }}>
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
      <div style={{ fontSize: '12px', fontWeight: '700', color: '#1f2937' }}>
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
        <span style={{ backgroundColor: '#fef08a', fontWeight: '600', padding: '2px 4px', borderRadius: '2px' }}>
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

      // Apply revenue filter if selected
      if (filters.revenue.length > 0 && !filters.revenue.includes(String(row.revenue))) return false;

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
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        padding: '40px 20px'
      }}>
        {/* Nexora Logo */}
        <img 
          src={nexoraLogo} 
          alt="Nexora Logo" 
          style={{
            width: '250px',
            height: 'auto',
            marginBottom: '30px',
            objectFit: 'contain'
          }}
        />

        {/* Loading Text */}
        {/* <h3 style={{
          margin: '0 0 10px 0',
          color: '#1f2937',
          fontSize: '18px',
          fontWeight: '600'
        }}>
          Loading Technographics Data
        </h3> */}

        {/* Subtext */}
        <p style={{
          margin: '0 0 30px 0',
          color: '#6b7280',
          fontSize: '14px',
          textAlign: 'center',
          maxWidth: '300px'
        }}>
          Fetching and processing company technology data...
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

  if (error) {
    return <div>Error fetching data: {error}</div>;
  }

  return (
    <div className="technographics-container">
      <div className="header-actions">
        <h2 style={{ fontSize: '32px', fontWeight: '700' }}>Technographics</h2>
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
      </div>

      <div className="section-subtle-divider" />
      
      {/* Filter UI - Similar to the reference image */}
      <div style={{ marginBottom: '20px' }} ref={filterRef}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Filter Button with Dropdown Menu */}
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
                  { label: 'Company Name', key: 'companyName', mandatory: true },
                  { label: 'Category', key: 'category', mandatory: true },
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

          {/* Filter Type Chip - Show selected filter type with dropdown */}
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
                color: '#1e40af',
                cursor: 'pointer'
              }}
              onClick={() => setOpenFilterDropdown(openFilterDropdown === 'companyName' ? null : 'companyName')}
              >
                <span>Company Name <span style={{ color: '#ef4444', fontWeight: '600' }}>*</span></span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveFilterMenu(null);
                    setCompanySearchTerm('');
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
              
              {/* Dropdown with search and checkboxes for company options */}
              {openFilterDropdown === 'companyName' && (
                <div
                  data-filter-dropdown="companyName"
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
                    minWidth: '300px',
                    maxHeight: '400px',
                    overflowY: 'auto'
                  }}
                >
                  {/* Search Box */}
                  <div style={{
                    padding: '12px',
                    borderBottom: '1px solid #e5e7eb',
                    position: 'sticky',
                    top: 0,
                    backgroundColor: 'white'
                  }}>
                    <input
                      type="text"
                      placeholder="Search companies..."
                      value={companySearchTerm}
                      onChange={(e) => setCompanySearchTerm(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontFamily: 'inherit',
                        boxSizing: 'border-box'
                      }}
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
                    style={{
                      padding: '12px 16px',
                      cursor: 'pointer',
                      borderBottom: '1px solid #e5e7eb',
                      fontSize: '14px',
                      color: '#1f2937',
                      backgroundColor: filters.companyName.length === getUniqueOptions('companyName').length && filters.companyName.length > 0 ? '#f0f9ff' : 'white',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      transition: 'background-color 0.2s',
                      fontWeight: '600'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = filters.companyName.length === getUniqueOptions('companyName').length && filters.companyName.length > 0 ? '#f0f9ff' : 'white'}
                  >
                    <input
                      type="checkbox"
                      checked={filters.companyName.length === getUniqueOptions('companyName').length && filters.companyName.length > 0}
                      onChange={() => {}}
                      style={{
                        cursor: 'pointer',
                        width: '16px',
                        height: '16px'
                      }}
                    />
                    <span>ALL</span>
                  </div>

                  {/* Company Options with Checkboxes */}
                  {getUniqueOptions('companyName')
                    .filter(company => company.toLowerCase().includes(companySearchTerm.toLowerCase()))
                    .map((company) => (
                    <div
                      key={company}
                      onClick={() => {
                        const newCompanies = filters.companyName.includes(company)
                          ? filters.companyName.filter(c => c !== company)
                          : [...filters.companyName, company];
                        handleFilterChange('companyName', newCompanies);
                      }}
                      style={{
                        padding: '12px 16px',
                        cursor: 'pointer',
                        borderBottom: '1px solid #e5e7eb',
                        fontSize: '14px',
                        color: '#1f2937',
                        backgroundColor: filters.companyName.includes(company) ? '#f0f9ff' : 'white',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = filters.companyName.includes(company) ? '#f0f9ff' : 'white'}
                    >
                      <input
                        type="checkbox"
                        checked={filters.companyName.includes(company)}
                        onChange={() => {}}
                        style={{
                          cursor: 'pointer',
                          width: '16px',
                          height: '16px'
                        }}
                      />
                      <span>{company}</span>
                    </div>
                  ))}

                  {getUniqueOptions('companyName').filter(company => company.toLowerCase().includes(companySearchTerm.toLowerCase())).length === 0 && (
                    <div style={{
                      padding: '12px 16px',
                      textAlign: 'center',
                      color: '#999',
                      fontSize: '13px'
                    }}>
                      No companies found
                    </div>
                  )}

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
                        setOpenFilterDropdown(null);
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
              )}
            </div>
          )}

          {/* Display saved filter tags */}
          {filters.companyName.length > 0 && activeFilterMenu !== 'companyName' && (
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
              <span>Company Name <span style={{ color: '#ef4444', fontWeight: '600' }}>*</span></span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleFilterChange('companyName', []);
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

          {activeFilterMenu === 'region' && (
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
                color: '#1e40af',
                cursor: 'pointer'
              }}
              onClick={() => setOpenFilterDropdown(openFilterDropdown === 'region' ? null : 'region')}
              >
                <span>Region</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveFilterMenu(null);
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
              
              {/* Dropdown with all region options - only show when clicked */}
              {openFilterDropdown === 'region' && (
                <div
                  data-filter-dropdown="region"
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
                    minWidth: '250px',
                    maxHeight: '300px',
                    overflowY: 'auto'
                  }}
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
                    style={{
                      padding: '12px 16px',
                      cursor: 'pointer',
                      borderBottom: '1px solid #e5e7eb',
                      fontSize: '14px',
                      color: '#1f2937',
                      backgroundColor: filters.region.length === getUniqueOptions('region').length && filters.region.length > 0 ? '#f0f9ff' : 'white',
                      fontWeight: filters.region.length === getUniqueOptions('region').length && filters.region.length > 0 ? '600' : '400',
                      transition: 'background-color 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = filters.region.length === getUniqueOptions('region').length && filters.region.length > 0 ? '#f0f9ff' : 'white'}
                  >
                    <input
                      type="checkbox"
                      checked={filters.region.length === getUniqueOptions('region').length && filters.region.length > 0}
                      onChange={() => {}}
                      style={{
                        cursor: 'pointer',
                        width: '16px',
                        height: '16px'
                      }}
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
                      style={{
                        padding: '12px 16px',
                        cursor: 'pointer',
                        borderBottom: '1px solid #e5e7eb',
                        fontSize: '14px',
                        color: '#1f2937',
                        backgroundColor: filters.region.includes(region) ? '#f0f9ff' : 'white',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        transition: 'background-color 0.2s',
                        justifyContent: 'space-between'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = filters.region.includes(region) ? '#f0f9ff' : 'white'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                          type="checkbox"
                          checked={filters.region.includes(region)}
                          onChange={() => {}}
                          style={{
                            cursor: 'pointer',
                            width: '16px',
                            height: '16px'
                          }}
                        />
                        {renderCountryFlag(region)}
                        <span>{region}</span>
                      </div>
                      <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
                        {getCompanyCountByRegion(region)}
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
                        setOpenFilterDropdown(null);
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
              )}
            </div>
          )}

          {/* Display saved filter tag */}
          {filters.region.length > 0 && activeFilterMenu !== 'region' && (
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
            onClick={() => setActiveFilterMenu('region')}
            >
              <span>Region ({filters.region.length})</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleFilterChange('region', []);
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
                color: '#1e40af',
                cursor: 'pointer'
              }}
              onClick={() => setOpenFilterDropdown(openFilterDropdown === 'category' ? null : 'category')}
              >
                <span>Category <span style={{ color: '#ef4444', fontWeight: '600' }}>*</span></span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveFilterMenu(null);
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
              
              {/* Dropdown with all category options - only show when clicked */}
              {openFilterDropdown === 'category' && (
                <div
                  data-filter-dropdown="category"
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
                    minWidth: '250px',
                    maxHeight: '300px',
                    overflowY: 'auto'
                  }}
                >
                  <div
                    onClick={() => {
                      if (filters.category.length === getUniqueOptions('category').length && filters.category.length > 0) {
                        // If all are selected, deselect all
                        handleFilterChange('category', []);
                      } else {
                        // Otherwise, select all
                        handleFilterChange('category', getUniqueOptions('category'));
                      }
                    }}
                    style={{
                      padding: '12px 16px',
                      cursor: 'pointer',
                      borderBottom: '1px solid #e5e7eb',
                      fontSize: '14px',
                      color: '#1f2937',
                      backgroundColor: filters.category.length === getUniqueOptions('category').length && filters.category.length > 0 ? '#f0f9ff' : 'white',
                      fontWeight: filters.category.length === getUniqueOptions('category').length && filters.category.length > 0 ? '600' : '400',
                      transition: 'background-color 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = filters.category.length === getUniqueOptions('category').length && filters.category.length > 0 ? '#f0f9ff' : 'white'}
                  >
                    <input
                      type="checkbox"
                      checked={filters.category.length === getUniqueOptions('category').length && filters.category.length > 0}
                      onChange={() => {}}
                      style={{
                        cursor: 'pointer',
                        width: '16px',
                        height: '16px'
                      }}
                    />
                    <span>ALL</span>
                  </div>
                  {getUniqueOptions('category').map((category) => (
                    <div
                      key={category}
                      onClick={() => {
                        const newCategories = filters.category.includes(category)
                          ? filters.category.filter(c => c !== category)
                          : [...filters.category, category];
                        handleFilterChange('category', newCategories);
                      }}
                      style={{
                        padding: '12px 16px',
                        cursor: 'pointer',
                        borderBottom: '1px solid #e5e7eb',
                        fontSize: '14px',
                        color: '#1f2937',
                        backgroundColor: filters.category.includes(category) ? '#f0f9ff' : 'white',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        transition: 'background-color 0.2s',
                        justifyContent: 'space-between'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = filters.category.includes(category) ? '#f0f9ff' : 'white'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                          type="checkbox"
                          checked={filters.category.includes(category)}
                          onChange={() => {}}
                          style={{
                            cursor: 'pointer',
                            width: '16px',
                            height: '16px'
                          }}
                        />
                        {renderTechLogo(category)}
                        <span>{category}</span>
                      </div>
                      <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
                        {getCompanyCountByCategory(category)}
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
                        setOpenFilterDropdown(null);
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
              )}
            </div>
          )}

          {/* Display saved filter tag */}
          {filters.category.length > 0 && activeFilterMenu !== 'category' && (
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
              <span>Category <span style={{ color: '#ef4444', fontWeight: '600' }}>*</span></span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleFilterChange('category', []);
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

          {activeFilterMenu === 'industry' && (
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
                color: '#1e40af',
                cursor: 'pointer'
              }}
              onClick={() => setOpenFilterDropdown(openFilterDropdown === 'industry' ? null : 'industry')}
              >
                <span>Industry</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveFilterMenu(null);
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
              
              {openFilterDropdown === 'industry' && (
                <div
                  data-filter-dropdown="industry"
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
                    minWidth: '250px',
                    maxHeight: '300px',
                    overflowY: 'auto'
                  }}
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
                    style={{
                      padding: '12px 16px',
                      cursor: 'pointer',
                      borderBottom: '1px solid #e5e7eb',
                      fontSize: '14px',
                      color: '#1f2937',
                      backgroundColor: filters.industry.length === getUniqueOptions('industry').length && filters.industry.length > 0 ? '#f0f9ff' : 'white',
                      fontWeight: filters.industry.length === getUniqueOptions('industry').length && filters.industry.length > 0 ? '600' : '400',
                      transition: 'background-color 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = filters.industry.length === getUniqueOptions('industry').length && filters.industry.length > 0 ? '#f0f9ff' : 'white'}
                  >
                    <input
                      type="checkbox"
                      checked={filters.industry.length === getUniqueOptions('industry').length && filters.industry.length > 0}
                      onChange={() => {}}
                      style={{
                        cursor: 'pointer',
                        width: '16px',
                        height: '16px'
                      }}
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
                      style={{
                        padding: '12px 16px',
                        cursor: 'pointer',
                        borderBottom: '1px solid #e5e7eb',
                        fontSize: '14px',
                        color: '#1f2937',
                        backgroundColor: filters.industry.includes(industry) ? '#f0f9ff' : 'white',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        transition: 'background-color 0.2s',
                        justifyContent: 'space-between'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = filters.industry.includes(industry) ? '#f0f9ff' : 'white'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                          type="checkbox"
                          checked={filters.industry.includes(industry)}
                          onChange={() => {}}
                          style={{
                            cursor: 'pointer',
                            width: '16px',
                            height: '16px'
                          }}
                        />
                        <span>{industry}</span>
                      </div>
                      <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
                        {getCompanyCountByIndustry(industry)}
                      </span>
                    </div>
                  ))}

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
                        setOpenFilterDropdown(null);
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
              )}
            </div>
          )}

          {filters.industry.length > 0 && activeFilterMenu !== 'industry' && (
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
            onClick={() => setActiveFilterMenu('industry')}
            >
              <span>Industry ({filters.industry.length})</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleFilterChange('industry', []);
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

          {activeFilterMenu === 'employeeSize' && (
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
                color: '#1e40af',
                cursor: 'pointer'
              }}
              onClick={() => setOpenFilterDropdown(openFilterDropdown === 'employeeSize' ? null : 'employeeSize')}
              >
                <span>Employee Size</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveFilterMenu(null);
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
              
              {openFilterDropdown === 'employeeSize' && (
                <div
                  data-filter-dropdown="employeeSize"
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
                    minWidth: '250px',
                    maxHeight: '300px',
                    overflowY: 'auto'
                  }}
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
                    style={{
                      padding: '12px 16px',
                      cursor: 'pointer',
                      borderBottom: '1px solid #e5e7eb',
                      fontSize: '14px',
                      color: '#1f2937',
                      backgroundColor: filters.employeeSize.length === employeeSizeRanges.length && filters.employeeSize.length > 0 ? '#f0f9ff' : 'white',
                      fontWeight: filters.employeeSize.length === employeeSizeRanges.length && filters.employeeSize.length > 0 ? '600' : '400',
                      transition: 'background-color 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = filters.employeeSize.length === employeeSizeRanges.length && filters.employeeSize.length > 0 ? '#f0f9ff' : 'white'}
                  >
                    <input
                      type="checkbox"
                      checked={filters.employeeSize.length === employeeSizeRanges.length && filters.employeeSize.length > 0}
                      onChange={() => {}}
                      style={{
                        cursor: 'pointer',
                        width: '16px',
                        height: '16px'
                      }}
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
                      style={{
                        padding: '12px 16px',
                        cursor: 'pointer',
                        borderBottom: '1px solid #e5e7eb',
                        fontSize: '14px',
                        color: '#1f2937',
                        backgroundColor: filters.employeeSize.includes(range.label) ? '#f0f9ff' : 'white',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        transition: 'background-color 0.2s',
                        justifyContent: 'space-between'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = filters.employeeSize.includes(range.label) ? '#f0f9ff' : 'white'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                          type="checkbox"
                          checked={filters.employeeSize.includes(range.label)}
                          onChange={() => {}}
                          style={{
                            cursor: 'pointer',
                            width: '16px',
                            height: '16px'
                          }}
                        />
                        <span>{range.label}</span>
                      </div>
                      <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
                        {getCompanyCountByEmployeeSize(range.label)}
                      </span>
                    </div>
                  ))}

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
                        setOpenFilterDropdown(null);
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
              )}
            </div>
          )}

          {filters.employeeSize.length > 0 && activeFilterMenu !== 'employeeSize' && (
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
            onClick={() => setActiveFilterMenu('employeeSize')}
            >
              <span>Employee Size ({filters.employeeSize.length})</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleFilterChange('employeeSize', []);
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

          {activeFilterMenu === 'revenue' && (
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
                color: '#1e40af',
                cursor: 'pointer'
              }}
              onClick={() => setOpenFilterDropdown(openFilterDropdown === 'revenue' ? null : 'revenue')}
              >
                <span>Revenue</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveFilterMenu(null);
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
              
              {openFilterDropdown === 'revenue' && (
                <div
                  data-filter-dropdown="revenue"
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
                    minWidth: '250px',
                    maxHeight: '300px',
                    overflowY: 'auto'
                  }}
                >
                  <div
                    onClick={() => {
                      if (filters.revenue.length === getUniqueOptions('revenue').length && filters.revenue.length > 0) {
                        // If all are selected, deselect all
                        handleFilterChange('revenue', []);
                      } else {
                        // Otherwise, select all
                        handleFilterChange('revenue', getUniqueOptions('revenue'));
                      }
                    }}
                    style={{
                      padding: '12px 16px',
                      cursor: 'pointer',
                      borderBottom: '1px solid #e5e7eb',
                      fontSize: '14px',
                      color: '#1f2937',
                      backgroundColor: filters.revenue.length === getUniqueOptions('revenue').length && filters.revenue.length > 0 ? '#f0f9ff' : 'white',
                      fontWeight: filters.revenue.length === getUniqueOptions('revenue').length && filters.revenue.length > 0 ? '600' : '400',
                      transition: 'background-color 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = filters.revenue.length === getUniqueOptions('revenue').length && filters.revenue.length > 0 ? '#f0f9ff' : 'white'}
                  >
                    <input
                      type="checkbox"
                      checked={filters.revenue.length === getUniqueOptions('revenue').length && filters.revenue.length > 0}
                      onChange={() => {}}
                      style={{
                        cursor: 'pointer',
                        width: '16px',
                        height: '16px'
                      }}
                    />
                    <span>ALL</span>
                  </div>
                  {getUniqueOptions('revenue').map((rev) => (
                    <div
                      key={rev}
                      onClick={() => {
                        const newRevenues = filters.revenue.includes(rev)
                          ? filters.revenue.filter(r => r !== rev)
                          : [...filters.revenue, rev];
                        handleFilterChange('revenue', newRevenues);
                      }}
                      style={{
                        padding: '12px 16px',
                        cursor: 'pointer',
                        borderBottom: '1px solid #e5e7eb',
                        fontSize: '14px',
                        color: '#1f2937',
                        backgroundColor: filters.revenue.includes(rev) ? '#f0f9ff' : 'white',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        transition: 'background-color 0.2s',
                        justifyContent: 'space-between'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = filters.revenue.includes(rev) ? '#f0f9ff' : 'white'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                          type="checkbox"
                          checked={filters.revenue.includes(rev)}
                          onChange={() => {}}
                          style={{
                            cursor: 'pointer',
                            width: '16px',
                            height: '16px'
                          }}
                        />
                        <span>{rev}</span>
                      </div>
                      <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
                        {getCompanyCountByRevenue(rev)}
                      </span>
                    </div>
                  ))}

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
                        setOpenFilterDropdown(null);
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
              )}
            </div>
          )}

          {filters.revenue.length > 0 && activeFilterMenu !== 'revenue' && (
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
            onClick={() => setActiveFilterMenu('revenue')}
            >
              <span>Revenue ({filters.revenue.length})</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleFilterChange('revenue', []);
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
                color: '#1e40af',
                cursor: 'pointer'
              }}
              onClick={() => setOpenFilterDropdown(openFilterDropdown === 'technology' ? null : 'technology')}
              >
                <span>Technology</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveFilterMenu(null);
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
              
              {/* Dropdown with all technology options - only show when clicked */}
              {openFilterDropdown === 'technology' && (
                <div
                  data-filter-dropdown="technology"
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
                    minWidth: '250px',
                    maxHeight: '300px',
                    overflowY: 'auto'
                  }}
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
                    style={{
                      padding: '12px 16px',
                      cursor: 'pointer',
                      borderBottom: '1px solid #e5e7eb',
                      fontSize: '14px',
                      color: '#1f2937',
                      backgroundColor: filters.technology.length === getUniqueOptions('technology').length && filters.technology.length > 0 ? '#f0f9ff' : 'white',
                      fontWeight: filters.technology.length === getUniqueOptions('technology').length && filters.technology.length > 0 ? '600' : '400',
                      transition: 'background-color 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = filters.technology.length === getUniqueOptions('technology').length && filters.technology.length > 0 ? '#f0f9ff' : 'white'}
                  >
                    <input
                      type="checkbox"
                      checked={filters.technology.length === getUniqueOptions('technology').length && filters.technology.length > 0}
                      onChange={() => {}}
                      style={{
                        cursor: 'pointer',
                        width: '16px',
                        height: '16px'
                      }}
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
                      style={{
                        padding: '12px 16px',
                        cursor: 'pointer',
                        borderBottom: '1px solid #e5e7eb',
                        fontSize: '14px',
                        color: '#1f2937',
                        backgroundColor: filters.technology.includes(tech) ? '#f0f9ff' : 'white',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        transition: 'background-color 0.2s',
                        justifyContent: 'space-between'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = filters.technology.includes(tech) ? '#f0f9ff' : 'white'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                          type="checkbox"
                          checked={filters.technology.includes(tech)}
                          onChange={() => {}}
                          style={{
                            cursor: 'pointer',
                            width: '16px',
                            height: '16px'
                          }}
                        />
                        {renderTechLogo(tech)}
                        <span>{tech}</span>
                      </div>
                      <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
                        {getCompanyCountByTechnology(tech)}
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
                        setOpenFilterDropdown(null);
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
              )}
            </div>
          )}

          {/* Display saved filter tag */}
          {filters.technology.length > 0 && activeFilterMenu !== 'technology' && (
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
              <span>Technology ({filters.technology.length})</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleFilterChange('technology', []);
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

          {/* Applied Filters Display */}
          {(filters.companyName.length > 0 || filters.region || filters.category || filters.technology) && !activeFilterMenu && (
            <>
            </>
          )}
          </div>
          
          {/* Download CSV Button - Show in filter row only when warning message is hidden */}
          {hasMandatoryFilters && (
            <button className="download-csv-button" onClick={() => handleDownloadCSV(groupedDataArray)} style={{ flexShrink: 0 }}>
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
            flex: 1,
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
              fontWeight: '500',
              whiteSpace: 'nowrap'
            }}>
              {filters.companyName.length === 0 && filters.category.length > 0 ? (
                'Please select a Company Name to view data'
              ) : filters.companyName.length > 0 && filters.category.length === 0 ? (
                'Please select a Category to view data'
              ) : (
                'Please select both Company Name and Category to view data'
              )}
            </div>
          </div>
          <button className="download-csv-button" onClick={() => handleDownloadCSV(groupedDataArray)} style={{ flexShrink: 0, marginLeft: 'auto' }}>
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
              <th style={{ width: '40px', textAlign: 'center', padding: '12px 8px' }}>
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
                  style={{
                    cursor: 'pointer',
                    width: '16px',
                    height: '16px',
                    accentColor: '#3b82f6'
                  }}
                />
              </th>
              <th style={{ textAlign: 'left', padding: '12px 8px' }}>Company Name</th>
              <th style={{ textAlign: 'left', padding: '12px 8px' }}>Industry</th>
              <th style={{ textAlign: 'left', padding: '12px 8px' }}>Region</th>
              <th style={{ textAlign: 'left', padding: '12px 8px' }}>Employee Size</th>
              <th style={{ textAlign: 'left', padding: '12px 8px' }}>Revenue</th>
              <th style={{ textAlign: 'left', padding: '12px 8px' }}>Technology</th>
              {/* <th>Previous Detected Date</th> */}
              {/* <th>Latest Detected Date</th> */}
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
                      <td style={{ width: '40px', textAlign: 'center', padding: '12px 8px' }} onClick={(e) => e.stopPropagation()}>
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
                          style={{
                            cursor: 'pointer',
                            width: '16px',
                            height: '16px',
                            accentColor: '#3b82f6'
                          }}
                        />
                      </td>
                      <td onMouseEnter={(e) => handleCompanyNameMouseEnter(e, row.companyName)} onMouseLeave={handleMouseLeave}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ fontWeight: '600', color: '#1f2937' }}>
                            {highlightText(row.companyName, searchTerm)}
                          </div>
                          <div style={{ fontSize: '13px', color: '#6b7280' }}>
                            {highlightText(row.domain, searchTerm)}
                          </div>
                        </div>
                      </td>
                      <td onMouseEnter={(e) => handleMouseEnter(e, row.industry)} onMouseLeave={handleMouseLeave}>
                        {highlightText(row.industry, searchTerm)}
                      </td>
                      <td onMouseEnter={(e) => handleMouseEnter(e, row.region)} onMouseLeave={handleMouseLeave}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                      {/* <td onMouseEnter={(e) => handleMouseEnter(e, row.category)} onMouseLeave={handleMouseLeave}>
                        <span style={{ display: 'flex', alignItems: 'center' }}>
                          {renderTechLogo(row.category)}
                          {highlightText(row.category, searchTerm)}
                        </span>
                      </td> */}
                      <td style={{ paddingLeft: '8px' }}>
                        <div style={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          gap: '8px',
                          maxHeight: '96px',
                          overflowY: 'auto',
                          paddingRight: '4px',
                          width: '100%'
                        }}>
                          {(row.technologies || [row.technology]).map((tech, idx) => (
                            <span key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                              {renderTechLogo(tech)}
                              {highlightText(tech, searchTerm)}
                            </span>
                          ))}
                        </div>
                      </td>
                      {/* <td onMouseEnter={(e) => handleMouseEnter(e, row.previousDetectedDate)} onMouseLeave={handleMouseLeave}>
                        {highlightText(row.previousDetectedDate, searchTerm)}
                      </td> */}
                      {/* <td onMouseEnter={(e) => handleMouseEnter(e, row.latestDetectedDate)} onMouseLeave={handleMouseLeave}>
                        {highlightText(row.latestDetectedDate, searchTerm)}
                      </td> */}
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
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
          marginTop: '24px',
          padding: '0 20px',
          marginBottom: '20px'
        }}>
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
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#e5e7eb';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#f3f4f6';
                  }}
                >
                  1
                </button>
              );

              if (startPage > 2) {
                pages.push(
                  <span key="dots1" style={{ color: '#9ca3af', fontSize: '16px', fontWeight: '600', padding: '0 4px' }}>
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
              );
            }

            // Show last page if not in range
            if (endPage < totalPages) {
              if (endPage < totalPages - 1) {
                pages.push(
                  <span key="dots2" style={{ color: '#9ca3af', fontSize: '16px', fontWeight: '600', padding: '0 4px' }}>
                    ...
                  </span>
                );
              }

              pages.push(
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
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#e5e7eb';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#f3f4f6';
                  }}
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
          style={{
            position: 'fixed',
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            transform: 'translate(-50%, -100%)',
            backgroundColor: '#ffffffff',
            color: 'black',
            padding: tooltip.isCompanyName ? '10px 12px' : '8px 12px',
            borderRadius: '6px',
            fontSize: tooltip.isCompanyName ? '13px' : '13px',
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
          <div style={{ fontWeight: '600', marginBottom: tooltip.hint ? '6px' : '0' }}>
            {tooltip.text}
          </div>
          {tooltip.hint && (
            <div style={{ fontSize: '11px', color: 'rgb(0, 102, 204)', fontWeight: '400', fontStyle: 'italic' }}>
              💡 {tooltip.hint}
            </div>
          )}
          <div
            style={{
              position: 'absolute',
              top: '-5px',
              right: '20px',
              width: 0,
              height: 0,
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderBottom: '5px solid white'
            }}
          />
        </div>
      )}

      {/* Side Panel for NTP Details */}
      {selectedCompany && (
        <>
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              zIndex: 999
            }}
            onClick={() => setSelectedCompany(null)}
          />
          <div 
            style={{
              position: 'fixed',
              right: 0,
              top: 0,
              bottom: 0,
              width: '500px',
              backgroundColor: 'white',
              boxShadow: '-2px 0 8px rgba(0, 0, 0, 0.15)',
              zIndex: 1000,
              overflowY: 'auto',
              animation: 'slideIn 0.3s ease-out'
            }}
          >
            <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, color: '#010810' }}>{selectedCompany}</h3>
                <button
                  onClick={() => setSelectedCompany(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: '#666'
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            <div style={{ padding: '20px' }}>
              {getNtpDataForCompany(selectedCompany).length > 0 ? (
                <div>
                  <h4 style={{ marginTop: 0, color: '#010810', marginBottom: '15px' }}>Technologies & Purchase Probability</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {getNtpDataForCompany(selectedCompany).map((item, idx) => (
                      <div 
                        key={idx}
                        style={{
                          padding: '12px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                          backgroundColor: '#f9fafb'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', gap: '12px' }}>
                          <div style={{ flex: 1 }}>
                            <p style={{ margin: '0 0 4px 0', fontWeight: '600', color: '#010810', display: 'flex', alignItems: 'center' }}>
                              {renderTechLogo(item.technology)}
                              {item.technology}
                            </p>
                            <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>{item.category}</p>
                          </div>
                          <div style={{ textAlign: 'center', flexShrink: 0 }}>
                            <Speedometer value={item.purchaseProbability} />
                          </div>
                        </div>
                        <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#666' }}>
                          <strong>Prediction:</strong> {item.purchasePrediction}
                        </p>
                        <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e5e7eb' }}>
                          <p style={{ margin: '0 0 4px 0', fontSize: '11px', fontWeight: '600', color: '#010810' }}>NTP Analysis:</p>
                          <p style={{ margin: '0', fontSize: '12px', color: '#555', lineHeight: '1.5' }}>
                            {item.ntpAnalysis || 'N/A'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p style={{ color: '#999', textAlign: 'center', padding: '20px 0' }}>No NTP data available</p>
              )}
            </div>
          </div>
        </>
      )}

      <style>{`
        .technographics-container {
          background: #ffffff;
          border-radius: 12px;
          padding: 0.4rem 0.5rem 0.5rem;
          margin-bottom: 0.5rem;
          margin-left: 2.5rem;
          margin-top: 0;
          width: calc(100% - 3rem);
          max-width: calc(100% - 3rem);
          overflow-x: hidden;
          min-height: 800px;
          position: relative;
          top: 0;
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        .table-container {
          max-height: 550px;
          overflow-x: auto;
          overflow-y: auto;
          position: relative;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .table-container::-webkit-scrollbar {
          display: none;
        }

        .table-container::-webkit-scrollbar-track {
          display: none;
        }

        .table-container::-webkit-scrollbar-thumb {
          display: none;
        }
        
        .technographics-sticky-header {
          position: sticky;
          top: 0;
          background-color: #fff;
          z-index: 10;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .technographics-sticky-header th {
          position: sticky;
          top: 0;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
        }
        
        th, td {
          padding: 12px 15px;
          text-align: left;
          border-bottom: 1px solid #ddd;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          cursor: default;
        }
        
        td {
          position: relative;
        }
        
        td:hover {
          background-color: #f9fafb;
        }
        
        /* Set specific column widths */
        th:nth-child(1), td:nth-child(1) { width: 40px; } /* Checkbox */
        th:nth-child(2), td:nth-child(2) { width: 150px; } /* Company Name */
        th:nth-child(3), td:nth-child(3) { width: 150px; } /* Industry */
        th:nth-child(4), td:nth-child(4) { width: 120px; } /* Region */
        th:nth-child(5), td:nth-child(5) { width: 150px; } /* Employee Size */
        th:nth-child(6), td:nth-child(6) { width: 120px; } /* Revenue */
        th:nth-child(7), td:nth-child(7) { width: 150px; } /* Technology */
        {/* th:nth-child(8), td:nth-child(8) { width: 150px; } Category - COMMENTED OUT */}
        {/* th:nth-child(9), td:nth-child(9) { width: 140px; } Previous Detected Date - COMMENTED OUT */}
        {/* th:nth-child(10), td:nth-child(10) { width: 140px; } Latest Detected Date - COMMENTED OUT */}
        
        /* Technology column padding for desktop */
        @media (min-width: 1024px) {
          td:nth-child(7) {
            padding-left: 8px !important;
          }
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

export default Technographics;
