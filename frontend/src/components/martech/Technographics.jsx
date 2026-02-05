import { useState, useEffect, useRef } from 'react';
import { useIndustry } from '../../context/IndustryContext';
import Flag from 'country-flag-icons/react/3x2';
import { getLogoPath, getTechIcon } from '../../utils/logoMap';

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
        <span style={{ fontSize: '12px', flexShrink: 0 }}>▼</span>
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
                style={{ cursor: 'pointer' }}
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
        <span style={{ fontSize: '12px', flexShrink: 0 }}>▼</span>
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
    region: '',
    technology: '',
    category: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [ntpData, setNtpData] = useState([]);

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
  };

  const handleDownloadCSV = () => {
    if (filteredData.length === 0) return;

    const headers = Object.keys(filteredData[0]);
    const csvContent = [
      headers.join(','),
      ...filteredData.map(row =>
        headers.map(header => `"${String(row[header] ?? '').replace(/"/g, '""')}"`).join(',')
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

  const getNtpDataForCompany = (companyName) => {
    let data = ntpData.filter(row => row.companyName === companyName);
    
    // Filter by selected category if one is chosen
    if (filters.category) {
      data = data.filter(row => row.category === filters.category);
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

  // Check if any filter is active (other than company name)
  const hasOtherFilters = filters.region || filters.technology || filters.category;

  const filteredData = tableData
    .filter(row => {
      // If no filters are selected at all, show nothing
      if (!hasOtherFilters && filters.companyName.length === 0) return false;

      // Apply company name filter if selected
      if (filters.companyName.length > 0) {
        if (!filters.companyName.includes(String(row.companyName))) return false;
      }

      // Apply region filter if selected
      if (filters.region && String(row.region) !== filters.region) return false;

      // Apply technology filter if selected
      if (filters.technology && String(row.technology) !== filters.technology) return false;

      // Apply category filter if selected
      if (filters.category && String(row.category) !== filters.category) return false;

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

  if (loading) {
    return <div></div>;
  }

  if (error) {
    return <div>Error fetching data: {error}</div>;
  }

  return (
    <div className="technographics-container">
      <div className="header-actions">
        <h2>Technographics</h2>
        <div className="actions-right">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search by Company Name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>
          <button className="download-csv-button" onClick={handleDownloadCSV}>
            Download CSV
          </button>
        </div>
      </div>

      <div className="section-subtle-divider" />
      <div className="filters">
        <div className="filter-group">
          <label>Company Name</label>
          <MultiSelectDropdown
            value={filters.companyName}
            onChange={(value) => handleFilterChange('companyName', value)}
            options={getUniqueOptions('companyName')}
          />
        </div>

        <div className="filter-group">
          <label>Region</label>
          <CustomDropdown
            value={filters.region}
            onChange={(value) => handleFilterChange('region', value)}
            options={getUniqueOptions('region')}
            showFlags={true}
          />
        </div>

        <div className="filter-group">
          <label>Category</label>
          <CustomTechDropdown
            value={filters.category}
            onChange={(value) => handleFilterChange('category', value)}
            options={getUniqueOptions('category')}
            renderLogo={renderTechLogo}
          />
        </div>

        <div className="filter-group">
          <label>Technology</label>
          <CustomTechDropdown
            value={filters.technology}
            onChange={(value) => handleFilterChange('technology', value)}
            options={getUniqueOptions('technology')}
            renderLogo={renderTechLogo}
          />
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead className="sticky-header">
            <tr>
              <th>Company Name</th>
              <th>Domain</th>
              <th>Industry</th>
              <th>Region</th>
              {/* <th>Category</th> */}
              <th>Technology</th>
              {/* <th>Previous Detected Date</th> */}
              {/* <th>Latest Detected Date</th> */}
            </tr>
          </thead>
          <tbody>
            {(filters.companyName.length > 0 || hasOtherFilters) ? (
              filteredData.length > 0 ? (
                filteredData.map((row, index) => {
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
                      <td onMouseEnter={(e) => handleCompanyNameMouseEnter(e, row.companyName)} onMouseLeave={handleMouseLeave}>
                        {highlightText(row.companyName, searchTerm)}
                      </td>
                      <td onMouseEnter={(e) => handleMouseEnter(e, row.domain)} onMouseLeave={handleMouseLeave}>
                        {highlightText(row.domain, searchTerm)}
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
                      {/* <td onMouseEnter={(e) => handleMouseEnter(e, row.category)} onMouseLeave={handleMouseLeave}>
                        <span style={{ display: 'flex', alignItems: 'center' }}>
                          {renderTechLogo(row.category)}
                          {highlightText(row.category, searchTerm)}
                        </span>
                      </td> */}
                      <td onMouseEnter={(e) => handleMouseEnter(e, row.technology)} onMouseLeave={handleMouseLeave}>
                        <span style={{ display: 'flex', alignItems: 'center' }}>
                          {renderTechLogo(row.technology)}
                          {highlightText(row.technology, searchTerm)}
                        </span>
                      </td>
                      {/* <td onMouseEnter={(e) => handleMouseEnter(e, row.previousDetectedDate)} onMouseLeave={handleMouseLeave}>
                        {highlightText(row.previousDetectedDate, searchTerm)}
                      </td> */}
                      {/* <td onMouseEnter={(e) => handleMouseEnter(e, row.latestDetectedDate)} onMouseLeave={handleMouseLeave}>
                        {highlightText(row.latestDetectedDate, searchTerm)}
                      </td> */}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                    No data found for the selected company
                  </td>
                </tr>
              )
            ) : null}
          </tbody>
        </table>
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
        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        .table-container {
          max-height: 400px;
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
        th:nth-child(1), td:nth-child(1) { width: 150px; } /* Company Name */
        th:nth-child(2), td:nth-child(2) { width: 180px; } /* Domain */
        th:nth-child(3), td:nth-child(3) { width: 150px; } /* Industry */
        th:nth-child(4), td:nth-child(4) { width: 120px; } /* Region */
        th:nth-child(5), td:nth-child(5) { width: 150px; } /* Technology */
        {/* th:nth-child(6), td:nth-child(6) { width: 150px; } Category - COMMENTED OUT */}
        {/* th:nth-child(7), td:nth-child(7) { width: 140px; } Previous Detected Date - COMMENTED OUT */}
        {/* th:nth-child(8), td:nth-child(8) { width: 140px; } Latest Detected Date - COMMENTED OUT */}
        
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
