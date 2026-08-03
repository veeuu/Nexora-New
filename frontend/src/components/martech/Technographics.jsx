import apiFetch from '../../utils/apiFetch';
import { useState, useEffect, useRef, useMemo } from 'react';
import { deductCredit } from '../../utils/credits';
import { isRevealed as isRevealedPersisted, markRevealed, getRevealedLocal, syncRevealedFromServer } from '../../utils/revealed';
import { useIndustry } from '../../context/IndustryContext';
import Flag from 'country-flag-icons/react/3x2';
import { getLogoPath, getTechIcon, getCategoryLogoPath, getCountryLogoPath } from '../../utils/logoMap';
import loadingGif from '../../assets/Data Loading GIF - Without Starhub.gif';
import { FaLinkedin, FaGlobe, FaEye, FaEyeSlash, FaLock, FaUnlock, FaLightbulb } from 'react-icons/fa';

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
  'Iceland': 'IS', 'ICELAND': 'IS',
  'Brunei': 'BN', 'BRUNEI': 'BN', 'Brunei Darussalam': 'BN',
  'Cambodia': 'KH', 'CAMBODIA': 'KH',
  'Myanmar': 'MM', 'MYANMAR': 'MM', 'Burma': 'MM',
  'Sri Lanka': 'LK', 'SRI LANKA': 'LK',
};

const extractCountryCode = (region) => {
  if (!region) return '';
  const trimmed = String(region).trim();
  if (!trimmed) return '';

  // Direct exact match
  if (countryCodeMap[trimmed]) return countryCodeMap[trimmed];

  // Case-insensitive match against map keys
  const lower = trimmed.toLowerCase();
  for (const key of Object.keys(countryCodeMap)) {
    if (String(key).toLowerCase() === lower) {
      return countryCodeMap[key];
    }
  }

  // Accept two-letter codes directly
  if (trimmed.length === 2) return trimmed.toUpperCase();

  return '';
};

const formatRegionLabel = (region) => {
  if (!region) return '';
  const trimmed = String(region).trim();
  if (!trimmed) return '';
  const upper = trimmed.toUpperCase();
  if (upper === 'UNITED STATES' || upper === 'UNITED STATES OF AMERICA' || upper === 'US' || upper === 'U.S.' || upper === 'USA')
    return 'USA';
  return trimmed;
};

const renderCountryFlag = (region) => {
  if (!region) return null;
  const trimmed = String(region).trim();
  if (!trimmed) return null;

  // Try SVG country logo first
  const svgPath = getCountryLogoPath(trimmed);
  if (svgPath) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '16px', borderRadius: '2px', overflow: 'hidden', flexShrink: 0 }}>
        <img src={svgPath} alt={trimmed} style={{ width: '20px', height: '13px', objectFit: 'cover' }} />
      </div>
    );
  }

  // Fallback to react country-flag-icons
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
  { label: '5000-10,000+', min: 5000, max: Infinity },
];

const revenueRanges = [
  { label: '<$1M', min: 0, max: 1000000 },
  { label: '$1M-$5M', min: 1000000, max: 5000000 },
  { label: '$5M-$10M', min: 5000000, max: 10000000 },
  { label: '$10M-$25M', min: 10000000, max: 25000000 },
  { label: '$25M-$50M', min: 25000000, max: 50000000 },
  { label: '$50M-$100M', min: 50000000, max: 100000000 },
  { label: '$100M-$250M', min: 100000000, max: 250000000 },
  { label: '$250M-$500M', min: 250000000, max: 500000000 },
  { label: '$500M-$1B', min: 500000000, max: 1000000000 },
  { label: '$1B-$10B', min: 1000000000, max: 10000000000 },
  { label: '$10B+', min: 10000000000, max: Infinity }
];

const formatEmployeeSize = (value) => {
  if (!value || value === 'N/A') return value;

  const strValue = String(value);
  if (strValue.includes('+') || strValue.includes('-') || strValue.includes(',')) {
    return strValue;
  }
  
  const num = parseInt(strValue);
  if (isNaN(num)) return strValue;
  
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return num.toString();
};

const getEmployeeSizeRange = (value) => {
  if (!value || value === 'N/A') return null;
  
  // Remove commas and + sign, then parse
  const cleanValue = String(value).replace(/[,+]/g, '').trim();
  const num = parseInt(cleanValue);
  if (isNaN(num)) return null;
  
  return employeeSizeRanges.find(range => num >= range.min && num <= range.max);
};

const getRevenueRange = (value) => {
  if (!value || value === 'N/A') return null;

  let num = 0;
  const revenueStr = String(value).trim().toUpperCase();
  
  // Handle different revenue formats
  if (revenueStr.includes('B')) {
    // Handle billions: "$1.5B" or "1.5B"
    const billionMatch = revenueStr.match(/(\d+\.?\d*)\s*B/);
    if (billionMatch) {
      num = parseFloat(billionMatch[1]) * 1000000000;
    }
  } else if (revenueStr.includes('M')) {
    // Handle millions: "$1.5M" or "1.5M"
    const millionMatch = revenueStr.match(/(\d+\.?\d*)\s*M/);
    if (millionMatch) {
      num = parseFloat(millionMatch[1]) * 1000000;
    }
  } else if (revenueStr.includes('K')) {
    // Handle thousands: "$1.5K" or "1.5K"
    const thousandMatch = revenueStr.match(/(\d+\.?\d*)\s*K/);
    if (thousandMatch) {
      num = parseFloat(thousandMatch[1]) * 1000;
    }
  } else {
    // Handle plain numbers with or without $ and commas
    const cleanValue = revenueStr.replace(/[$,]/g, '');
    num = parseFloat(cleanValue);
  }
  
  if (isNaN(num)) return null;
  
  return revenueRanges.find(range => num >= range.min && num <= range.max);
};

const isEmployeeSizeInRange = (employeeSize, rangeLabel) => {
  if (!employeeSize || employeeSize === 'N/A') return false;
  
  // Remove commas and + sign, then parse
  const cleanValue = String(employeeSize).replace(/[,+]/g, '').trim();
  const num = parseInt(cleanValue);
  if (isNaN(num)) return false;
  
  const range = employeeSizeRanges.find(r => r.label === rangeLabel);
  if (!range) return false;
  
  return num >= range.min && num <= range.max;
};

const isRevenueInRange = (revenue, rangeLabel) => {
  if (!revenue || revenue === 'N/A') return false;

  let num = 0;
  const revenueStr = String(revenue).trim().toUpperCase();
  
  // Handle different revenue formats
  if (revenueStr.includes('B')) {
    // Handle billions: "$1.5B" or "1.5B"
    const billionMatch = revenueStr.match(/(\d+\.?\d*)\s*B/);
    if (billionMatch) {
      num = parseFloat(billionMatch[1]) * 1000000000;
    }
  } else if (revenueStr.includes('M')) {
    // Handle millions: "$1.5M" or "1.5M"
    const millionMatch = revenueStr.match(/(\d+\.?\d*)\s*M/);
    if (millionMatch) {
      num = parseFloat(millionMatch[1]) * 1000000;
    }
  } else if (revenueStr.includes('K')) {
    // Handle thousands: "$1.5K" or "1.5K"
    const thousandMatch = revenueStr.match(/(\d+\.?\d*)\s*K/);
    if (thousandMatch) {
      num = parseFloat(thousandMatch[1]) * 1000;
    }
  } else {
    // Handle plain numbers with or without $ and commas
    const cleanValue = revenueStr.replace(/[$,]/g, '');
    num = parseFloat(cleanValue);
  }
  
  if (isNaN(num)) return false;
  
  const range = revenueRanges.find(r => r.label === rangeLabel);
  if (!range) return false;
  
  return num >= range.min && num <= range.max;
};

const Speedometer = ({ value }) => {
  
  const numValue = parseInt(value) || 0;
  const clampedValue = Math.min(Math.max(numValue, 0), 100);

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
            {}
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="20%" stopColor="#f97316" />
              <stop offset="40%" stopColor="#fbbf24" />
              <stop offset="60%" stopColor="#86efac" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
          
          {}
          <path
            d="M 8 50 A 45 45 0 0 1 92 50"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="10"
            strokeLinecap="round"
          />
          
          {}
          <g style={{ transform: `rotate(${rotation}deg)`, transformOrigin: '50px 50px', transition: 'transform 0.3s ease' }}>
            <line x1="50" y1="50" x2="50" y2="20" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="50" cy="50" r="2" fill="#000000" />
          </g>
          
          {}
          <circle cx="50" cy="50" r="3.5" fill="#ffffff" stroke="#000000" strokeWidth="1.5" />
        </svg>
      </div>
      
      {}
      <div style={{ fontSize: '12px', fontWeight: '700', color: '#1f2937' }}>
        {clampedValue}%
      </div>
    </div>
  );
};

// -- On-Demand Request Modal --------------------------------------------------
const OnDemandModal = ({ filterType, searchValue, sourcePage, onClose }) => {
  const [requestedName, setRequestedName] = useState(searchValue);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiFetch('/api/on-demand-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestedName, filterType, searchValue, sourcePage })
      });
    } catch {
      // still show success
    } finally {
      // Save to localStorage for profile panel history
      try {
        const existing = JSON.parse(localStorage.getItem('onDemandHistory') || '[]');
        const entry = {
          id: Date.now(),
          query: requestedName,
          filterType,
          section: sourcePage || 'Technographics',
          status: 'Pending',
          date: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        };
        localStorage.setItem('onDemandHistory', JSON.stringify([entry, ...existing].slice(0, 50)));
      } catch (_) {}
      setSubmitted(true);
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.5)',
        zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(2px)'
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        backgroundColor: 'white', borderRadius: '16px',
        width: '100%', maxWidth: '460px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
        position: 'relative', overflow: 'hidden'
      }}>
        {/* Top accent bar */}
        <div style={{ height: '4px', background: 'linear-gradient(90deg, #3b82f6, #6366f1)' }} />

        <div style={{ padding: '32px' }}>
          {/* Close button */}
          <button onClick={onClose} style={{
            position: 'absolute', top: '20px', right: '20px',
            background: 'none', border: 'none', cursor: 'pointer',
            width: '28px', height: '28px', borderRadius: '6px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#94a3b8', fontSize: '18px', lineHeight: 1,
            transition: 'background 0.15s, color 0.15s'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#475569'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#94a3b8'; }}
          >�</button>

          {submitted ? (
            <div style={{ textAlign: 'center', padding: '12px 0 8px' }}>
              {/* SVG checkmark icon */}
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%',
                background: '#f0fdf4', border: '2px solid #bbf7d0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px'
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13l4 4L19 7" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>
                Request Submitted
              </h3>
              <p style={{ margin: '0 0 24px', color: '#64748b', fontSize: '14px', lineHeight: '1.6' }}>
                We'll get back to you within <span style={{ fontWeight: '600', color: '#0f172a' }}>48 hours</span>.
              </p>
              <button
                onClick={onClose}
                style={{
                  padding: '9px 28px', backgroundColor: '#f8fafc', color: '#475569',
                  border: '1px solid #e2e8f0', borderRadius: '8px',
                  fontSize: '14px', fontWeight: '500', cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Icon + title */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  background: '#eff6ff', border: '1px solid #bfdbfe',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" fill="#3b82f6"/>
                  </svg>
                </div>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: '#0f172a' }}>
                  Request Data on Demand
                </h3>
              </div>

              <p style={{ margin: '0 0 24px', fontSize: '13px', color: '#64748b', lineHeight: '1.6', paddingLeft: '52px' }}>
                Can't find what you're looking for in <span style={{ fontWeight: '600', color: '#334155' }}>{filterType}</span>? Enter the company domain and our team will reach out.
              </p>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block', fontSize: '12px', fontWeight: '600',
                  color: '#475569', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.4px'
                }}>
                  {filterType} 
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder={`e.g. ${searchValue}`}
                  value={requestedName}
                  onChange={(e) => setRequestedName(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 14px',
                    border: '1.5px solid #e2e8f0', borderRadius: '8px',
                    fontSize: '14px', fontFamily: 'inherit', boxSizing: 'border-box',
                    outline: 'none', color: '#0f172a', transition: 'border-color 0.15s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: '100%', padding: '11px',
                  background: submitting ? '#93c5fd' : 'linear-gradient(135deg, #3b82f6, #6366f1)',
                  color: 'white', border: 'none', borderRadius: '8px',
                  fontSize: '14px', fontWeight: '600',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  letterSpacing: '0.2px', transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.opacity = '0.92'; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
              >
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

const Technographics = () => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { setIndustryData, setTechnologyData, setAvailableRegions } = useIndustry();
  const [metadata, setMetadata] = useState({
    regions: [],
    industries: [],
    categories: [],
    employeeSizes: [],
    revenues: [],
    totalRecords: 0
  });
  const [summary, setSummary] = useState({
    regions: [],
    industries: [],
    categories: [],
    employeeSizes: [],
    revenues: [],
    technologies: [],
    companies: [],
    regionCategoryCounts: {},
    totalRecords: 0
  });
  const [filterOptions, setFilterOptions] = useState([]);
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
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const [technologySearchTerm, setTechnologySearchTerm] = useState('');
  const [regionSearchTerm, setRegionSearchTerm] = useState('');
  const [industrySearchTerm, setIndustrySearchTerm] = useState('');
  const [onDemandModal, setOnDemandModal] = useState(null); 
  const filterRef = useRef(null);
  const containerRef = useRef(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [ntpDataByCompany, setNtpDataByCompany] = useState({});
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1); 
  const [revealedRows, setRevealedRows] = useState(() => {
    const data = getRevealedLocal();
    return new Set(Array.isArray(data.technographics) ? data.technographics : []);
  });
  const [measurements, setMeasurements] = useState({});
  const [pageCache, setPageCache] = useState({}); 
  const [totalPages, setTotalPages] = useState(0);
  const [pageLoading, setPageLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0); 
  const [totalGroupedRecords, setTotalGroupedRecords] = useState(0);
  const isInitialMount = useRef(true); // skip currentPage effect on first render
  const rowsPerPage = 100;
  const scrollRefsMap = useRef(new Map()); 

  const normalizeKey = (value) => String(value || '').trim().toLowerCase();

  const isCategorySelected = (opt) => {
    if (!filters || !Array.isArray(filters.category)) return false;
    return filters.category.some(c => normalizeKey(c) === normalizeKey(opt));
  };

  const categoryTechMap = useMemo(() => {
    const map = new Map();
    (filterOptions || []).forEach((item) => {
      const categoryRaw = item?.Category ?? item?.category;
      const techRaw = item?.['Normalized Keyword'] ?? item?.normalizedKeyword ?? item?.normalized_keyword ?? item?.normalized;
      const categoryKey = normalizeKey(categoryRaw);
      const techKey = normalizeKey(techRaw);
      if (!categoryKey || !techKey) return;

      if (!map.has(categoryKey)) {
        map.set(categoryKey, new Set());
      }
      map.get(categoryKey).add(techKey);
    });
    return map;
  }, [filterOptions]);

  const renderTechLogo = (techName) => {
    if (!techName) return null;
    
    const techNameLower = techName.toLowerCase().trim();
    
    // Debug log
    if (techNameLower.includes('generative')) {
      console.log('DEBUG renderTechLogo:', { techName, techNameLower });
    }
    
    const logoPath = getLogoPath(techName);
    console.log(`- renderTechLogo called for "${techName}":`, logoPath ? '? Logo found' : '? No logo');

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
            console.error(`? Failed to load logo image for "${techName}":`, logoPath);
            e.target.style.display = 'none';
          }}
          onLoad={() => {
            console.log(`? Logo image loaded successfully for "${techName}"`);
          }}
        />
      );
    }

    const iconData = getTechIcon(techName);
    if (iconData) {
      const { component: IconComponent, color } = iconData;
      console.log(`?? Using icon for "${techName}"`);
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
    
    console.warn(`?? No logo or icon available for "${techName}"`);
    return null;
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => {
      const currentFilter = prev[filterName];
      
      // For multi-select filters (category, technology, region, etc.)
      if (Array.isArray(currentFilter)) {
        if (currentFilter.includes(value)) {
          // Remove if already selected
          return { ...prev, [filterName]: currentFilter.filter(item => item !== value) };
        } else {
          // Add if not selected
          return { ...prev, [filterName]: [...currentFilter, value] };
        }
      }
      
      // For single-select filters
      return { ...prev, [filterName]: value };
    });
    setCurrentPage(1); 
    setPageCache({}); 
    setTotalRecords(0); 
  };

  const handleDownloadCSV = async () => {
    try {
      const selectedCompanyNames = new Set(
        selectedRows.size > 0
          ? groupedDataArray.filter((_, index) => selectedRows.has(index)).map(row => row.companyName)
          : []
      );

      const revealedCompanyNames = new Set();
      groupedDataArray.forEach((row, index) => {
        const rowKey = `reveal-${row.companyName}`;
        if (revealedRows.has(rowKey)) {
          revealedCompanyNames.add(row.companyName);
        }
      });

      if (revealedCompanyNames.size === 0) {
        alert('No revealed companies to download. Please reveal company details first.');
        return;
      }

      const exportCompanyNames = selectedCompanyNames.size > 0
        ? Array.from(selectedCompanyNames)
        : Array.from(revealedCompanyNames);

      const queryParams = new URLSearchParams();
      if (exportCompanyNames.length > 0) {
        exportCompanyNames.forEach(name => queryParams.append('companyName', name));
      } else if (filters.companyName.length > 0) {
        filters.companyName.forEach(name => queryParams.append('companyName', name));
      }
      if (filters.region.length > 0) filters.region.forEach(region => queryParams.append('region', region));
      if (filters.technology.length > 0) filters.technology.forEach(tech => queryParams.append('technology', tech));
      if (filters.category.length > 0) filters.category.forEach(cat => queryParams.append('category', cat));
      if (filters.industry.length > 0) {
        const allIndustries = getUniqueOptions('industry');
        const isAllSelected = allIndustries.length > 0 && filters.industry.length >= allIndustries.length;
        if (!isAllSelected) filters.industry.forEach(ind => queryParams.append('industry', ind));
      }
      if (filters.employeeSize.length > 0) filters.employeeSize.forEach(size => queryParams.append('employeeSize', size));
      if (filters.revenue.length > 0) filters.revenue.forEach(rev => queryParams.append('revenue', rev));

      const response = await apiFetch(`/api/technographics/export?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to export technographics');
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

    const grouped = {};
    rows.forEach(row => {
      const key = `${row.companyName}|${row.domain}|${row.industry}|${row.region}|${row.employeeSize}|${row.revenue}`;
      if (!grouped[key]) {
        grouped[key] = {
          companyName: row.companyName,
          domain: row.domain,
          industry: row.industry,
          region: row.region,
          employeeSize: row.employeeSize,
          revenue: row.revenue,
          technologies: []
        };
      }
      if (row.technology && !grouped[key].technologies.includes(row.technology)) {
        grouped[key].technologies.push(row.technology);
      }
    });

    let dataToDownload = Object.values(grouped);
    if (selectedCompanyNames.size > 0) {
      dataToDownload = dataToDownload.filter(row => selectedCompanyNames.has(row.companyName));
    }
    if (revealedCompanyNames.size > 0) {
      dataToDownload = dataToDownload.filter(row => revealedCompanyNames.has(row.companyName));
    }

    if (dataToDownload.length === 0) {
      alert('No revealed companies to download. Please reveal company details first.');
      return;
    }

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
    } catch (err) {
      alert('Failed to export technographics. Please try again.');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        
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

  const goToPage = (page) => {
    setCurrentPage(page);
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const fetchPage = async (pageNum, retries = 3, delay = 500) => {
    const cached = pageCache[pageNum];
    if (cached) {
      setTableData(cached.data || []);
      setTotalRecords(cached.total || 0);
      setTotalPages(cached.pages || 0);
      return cached;
    }

    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', pageNum);
      queryParams.append('limit', rowsPerPage);

      if (filters.companyName.length > 0) {
        filters.companyName.forEach(name => queryParams.append('companyName', name));
      }
      if (filters.region.length > 0) {
        filters.region.forEach(region => queryParams.append('region', region));
      }
      if (filters.technology.length > 0) {
        filters.technology.forEach(tech => queryParams.append('technology', tech));
      }
      if (filters.category.length > 0) {
        filters.category.forEach(cat => queryParams.append('category', cat));
      }
      if (filters.industry.length > 0) {
        // Only send industry filter if NOT all industries selected (all = no filter needed)
        const allIndustries = getUniqueOptions('industry');
        const isAllSelected = allIndustries.length > 0 && filters.industry.length >= allIndustries.length;
        if (!isAllSelected) {
          filters.industry.forEach(ind => queryParams.append('industry', ind));
        }
      }
      if (filters.employeeSize.length > 0) {
        filters.employeeSize.forEach(size => queryParams.append('employeeSize', size));
      }
      if (filters.revenue.length > 0) {
        filters.revenue.forEach(rev => queryParams.append('revenue', rev));
      }

      const response = await apiFetch(`/api/technographics?${queryParams.toString()}`);
      const data = await response.json();

      if (response.status === 503 && retries > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchPage(pageNum, retries - 1, Math.min(delay * 1.5, 5000)); 
      }

      setTableData(data.data || []);
      setTotalRecords(data.total || 0);
      setTotalPages(data.pages || 0);

      setPageCache(prev => ({
        ...prev,
        [pageNum]: data
      }));

      return data;
    } catch (err) {
      return null;
    }
  };

  // Removed prefetchAdjacentPages - it caused data overwriting when prefetch
  // called setTableData and replaced the currently displayed page's data

  // Sync revealed rows when server data arrives
  useEffect(() => {
    const onUpdate = () => {
      const data = getRevealedLocal();
      setRevealedRows(new Set(Array.isArray(data.technographics) ? data.technographics : []));
    };
    window.addEventListener('revealedUpdated', onUpdate);
    // Also fetch fresh from server on mount
    syncRevealedFromServer().then(data => {
      if (data && Array.isArray(data.technographics)) {
        setRevealedRows(new Set(data.technographics));
      }
    });
    return () => window.removeEventListener('revealedUpdated', onUpdate);
  }, []);

  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [metadataResponse, summaryResponse, filterOptionsResponse] = await Promise.all([
          apiFetch('/api/technographics/metadata'),
          apiFetch('/api/technographics/summary'),
          apiFetch('/api/technographics/filter-options')
        ]);

        const metadataData = await metadataResponse.json();
        const summaryRaw = summaryResponse.ok ? await summaryResponse.json() : {};
        const summaryData = summaryRaw.error ? {} : summaryRaw;
        let filterOptionsData = [];
        if (filterOptionsResponse && filterOptionsResponse.ok) {
          const raw = await filterOptionsResponse.json();
          filterOptionsData = Array.isArray(raw) ? raw : (raw?.data || []);
        }

        // Ensure regions are sorted alphabetically for consistent UI
        const metaRegions = Array.isArray(metadataData.regions) ? metadataData.regions.slice() : [];
        metaRegions.sort((a, b) => String(a || '').localeCompare(String(b || '')));
        const metadataSorted = { ...metadataData, regions: metaRegions };
        setMetadata(metadataSorted);
        setSummary(summaryData);
        setFilterOptions(filterOptionsData);

        setIndustryData(summaryData.industries || []);

        const regionCategoryCounts = summaryData.regionCategoryCounts || {};
        const techDataWithPercentages = {};
        Object.keys(regionCategoryCounts).forEach(region => {
          const total = Object.values(regionCategoryCounts[region]).reduce((sum, count) => sum + count, 0);
          techDataWithPercentages[region] = {};
          Object.keys(regionCategoryCounts[region]).forEach(category => {
            const percentage = total > 0 ? Math.round((regionCategoryCounts[region][category] / total) * 100) : 0;
            techDataWithPercentages[region][category] = percentage;
          });
        });

        setTechnologyData(techDataWithPercentages);
        const regionList = (summaryData.regions || []).map(r => r.label).filter(Boolean);
        const combined = regionList.length > 0 ? regionList : (metaRegions || []);
        const sortedRegions = Array.from(new Set(combined)).slice().sort((a, b) => String(a).localeCompare(String(b)));
        setAvailableRegions(sortedRegions);

        await fetchPage(1);
      } catch (e) {
        setError(e.message);
        setTableData([]);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [setIndustryData, setTechnologyData, setAvailableRegions]);

  useEffect(() => {
    setPageCache({});
    setCurrentPage(1);
    setSelectedRows(new Set());
    setRevealedRows(new Set(Array.isArray(getRevealedLocal().technographics) ? getRevealedLocal().technographics : []));
    setTableData([]);
    setLoading(true);
    fetchPage(1).finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    // Check frontend cache first - instant, no flash
    if (pageCache[currentPage]) {
      const cached = pageCache[currentPage];
      setTableData(cached.data || []);
      setTotalRecords(cached.total || 0);
      setTotalPages(cached.pages || 0);
      setSelectedRows(new Set());
      setRevealedRows(new Set(Array.isArray(getRevealedLocal().technographics) ? getRevealedLocal().technographics : []));
      return;
    }
    // Not cached - keep old data visible while fetching (like NTP does)
    setSelectedRows(new Set());
    setRevealedRows(new Set(Array.isArray(getRevealedLocal().technographics) ? getRevealedLocal().technographics : []));
    setLoading(true);
    fetchPage(currentPage).finally(() => setLoading(false));
  }, [currentPage]);

  const getAvailableTechnologies = () => {
    const summaryTechs = (summary.technologies || []).map(t => t.label).filter(Boolean);
    const fallbackTechs = (filterOptions || [])
      .map(item => item?.['Normalized Keyword'] ?? item?.normalizedKeyword ?? item?.normalized_keyword ?? item?.normalized)
      .filter(Boolean);
    const allTechs = summaryTechs.length > 0 ? summaryTechs : Array.from(new Set(fallbackTechs));

    if (!filterOptions || filterOptions.length === 0) return allTechs;
    if (!filters.category || filters.category.length === 0) return allTechs;

    const allowed = new Set();
    filters.category.forEach((cat) => {
      const set = categoryTechMap.get(normalizeKey(cat));
      if (set) {
        set.forEach(t => allowed.add(t));
      }
    });

    if (allowed.size === 0) return [];
    return allTechs.filter(tech => allowed.has(normalizeKey(tech)));
  };

  useEffect(() => {
    if (!filters.category || filters.category.length === 0) return;
    const available = getAvailableTechnologies();
    const allowed = new Set(available.map(t => normalizeKey(t)));
    const nextTech = filters.technology.filter(t => allowed.has(normalizeKey(t)));
    if (nextTech.length !== filters.technology.length) {
      setFilters(prev => ({ ...prev, technology: nextTech }));
      setCurrentPage(1);
      setPageCache({});
      setTotalRecords(0);
    }
  }, [filters.category, filters.technology, filterOptions, summary.technologies, categoryTechMap]);

  const getUniqueOptions = (key) => {
    if (key === 'companyName') return summary.companies || [];
    if (key === 'region') return (summary.regions || []).map(r => r.label);
    if (key === 'category') return (summary.categories || []).map(c => c.label);
    if (key === 'industry') return (summary.industries || []).map(i => i.label);
    if (key === 'technology') return getAvailableTechnologies();
    if (key === 'employeeSize') return (summary.employeeSizes || []).map(e => e.label);
    if (key === 'revenue') return (summary.revenues || []).map(r => r.label);

    if (!tableData || tableData.length === 0) {
      return [];
    }

    const allValues = tableData
      .map(item => item[key])
      .filter(val => val !== undefined && val !== null);

    return [...new Set(allValues)].sort();
  };

  // Get available categories for selected companies
  const getAvailableCategoriesForCompanies = () => {
    if (filters.companyName.length === 0 || !tableData) {
      return getUniqueOptions('category');
    }
    
    const availableCategories = new Set();
    tableData.forEach(row => {
      if (filters.companyName.includes(String(row.companyName)) && row.category) {
        availableCategories.add(row.category);
      }
    });
    
    return Array.from(availableCategories).sort();
  };

  const getCountFromSummary = (list, label) => {
    const match = (list || []).find(item => item.label === label);
    return match ? match.value : 0;
  };

  const getCompanyCountByCategory = (category) => getCountFromSummary(summary.categories, category);
  const getCompanyCountByRegion = (region) => getCountFromSummary(summary.regions, region);
  const getCompanyCountByIndustry = (industry) => getCountFromSummary(summary.industries, industry);
  const getCompanyCountByRevenue = (revenue) => getCountFromSummary(summary.revenues, revenue);
  const getCompanyCountByTechnology = (technology) => getCountFromSummary(summary.technologies, technology);
  const getCompanyCountByEmployeeSize = (rangeLabel) => getCountFromSummary(summary.employeeSizes, rangeLabel);

  const getNtpDataForCompany = (companyName) => {
    if (!companyName) {
      return [];
    }

    let data = ntpDataByCompany[companyName] || [];

    if (filters.category && Array.isArray(filters.category) && filters.category.length > 0) {
      data = data.filter(row => {
        const rowCategory = String(row.category || '').trim().toLowerCase();
        return filters.category.some(cat => String(cat).trim().toLowerCase() === rowCategory);
      });
    }
    
    return data;
  };

  useEffect(() => {
    if (!selectedCompany) return;
    if (ntpDataByCompany[selectedCompany]) return;

    const fetchCompanyNtp = async () => {
      try {
        const params = new URLSearchParams();
        params.append('companyName', selectedCompany);
        params.append('page', '1');
        params.append('limit', '500');

        const response = await apiFetch(`/api/ntp?${params.toString()}`);
        const result = await response.json();

        setNtpDataByCompany(prev => ({
          ...prev,
          [selectedCompany]: result.data || []
        }));
      } catch (err) {
      }
    };

    fetchCompanyNtp();
  }, [selectedCompany, ntpDataByCompany]);

  const rowMatchesSearch = (row) => {
    if (!searchTerm) return false;
    return Object.values(row).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

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

  const hasMandatoryFilters = filters.companyName.length > 0 && filters.category.length > 0;

  const filteredData = tableData
    .filter(row => {
      
      if (filters.companyName.length > 0 && !filters.companyName.includes(String(row.companyName))) return false;

      if (filters.category.length > 0 && !filters.category.some(cat => normalizeKey(cat) === normalizeKey(row.category))) return false;

      if (filters.region.length > 0 && !filters.region.includes(String(row.region))) return false;

      if (filters.technology.length > 0 && !filters.technology.includes(String(row.technology))) return false;

      if (filters.industry.length > 0 && !filters.industry.includes(String(row.industry))) return false;

      if (filters.employeeSize.length > 0 && !filters.employeeSize.some(range => isEmployeeSizeInRange(row.employeeSize, range))) return false;

      if (filters.revenue.length > 0) {
        const matchesRevenue = filters.revenue.some(rangeLabel => isRevenueInRange(row.revenue, rangeLabel));
        if (!matchesRevenue) return false;
      }

      const searchMatches = !searchTerm || Object.values(row).some(value =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      );

      return searchMatches;
    })
    .sort((a, b) => {
      // Helper function to check if a row has complete data
      const isRowComplete = (row) => {
        // Check if all key fields have values (not empty, not 'N/A', not null/undefined)
        const hasCompanyName = row.companyName && String(row.companyName).trim() !== '';
        const hasIndustry = row.industry && String(row.industry).trim() !== '' && String(row.industry).toLowerCase() !== 'n/a';
        const hasRegion = row.region && String(row.region).trim() !== '' && String(row.region).toLowerCase() !== 'n/a';
        const hasEmployeeSize = row.employeeSize && String(row.employeeSize).trim() !== '' && String(row.employeeSize).toLowerCase() !== 'n/a';
        const hasRevenue = row.revenue && String(row.revenue).trim() !== '' && String(row.revenue).toLowerCase() !== 'n/a';
        const hasTechnology = (row.technologies && row.technologies.length > 0) || (row.technology && String(row.technology).trim() !== '');
        const hasPreviousDate = row.technologyDates && row.technologyDates.length > 0 && row.technologyDates.some(td => td.previousDetectedDate && String(td.previousDetectedDate).trim() !== '');
        const hasLatestDate = row.technologyDates && row.technologyDates.length > 0 && row.technologyDates.some(td => td.latestDetectedDate && String(td.latestDetectedDate).trim() !== '');

        return hasCompanyName && hasIndustry && hasRegion && hasEmployeeSize && hasRevenue && hasTechnology && hasPreviousDate && hasLatestDate;
      };

      const aComplete = isRowComplete(a);
      const bComplete = isRowComplete(b);

      // Complete rows first, incomplete rows last
      if (aComplete && !bComplete) return -1;
      if (!aComplete && bComplete) return 1;

      // If both complete or both incomplete, sort by search match
      const aMatches = rowMatchesSearch(a);
      const bMatches = rowMatchesSearch(b);

      if (aMatches && !bMatches) return -1;
      if (!aMatches && bMatches) return 1;
      return 0;
    });

  const ND = (v) => v === 'Not Detected' || v === 'NOT detected' || v === 'not detected';

  const groupedData = filteredData.reduce((acc, row) => {
    const key = `${row.companyName}|${row.domain}|${row.industry}|${row.region}|${row.employeeSize}|${row.revenue}`;
    
    if (!acc[key]) {
      acc[key] = {
        ...row,
        technologies: ND(row.technology) ? [] : [row.technology],
        technologyDates: ND(row.technology) ? [] : [
          {
            technology: row.technology,
            previousDetectedDate: row.previousDetectedDate,
            latestDetectedDate: row.latestDetectedDate
          }
        ]
      };
    } else {
      if (!ND(row.technology) && !acc[key].technologies.includes(row.technology)) {
        acc[key].technologies.push(row.technology);
        acc[key].technologyDates.push({
          technology: row.technology,
          previousDetectedDate: row.previousDetectedDate,
          latestDetectedDate: row.latestDetectedDate
        });
      }
    }
    
    return acc;
  }, {});

  const groupedDataArray = Object.values(groupedData).sort((a, b) => {
    // previously revealed rows were prioritized here — removed per request

    // Helper function to check if a row has complete data
    const isRowComplete = (row) => {
      const hasCompanyName = row.companyName && String(row.companyName).trim() !== '';
      const hasIndustry = row.industry && String(row.industry).trim() !== '' && String(row.industry).toLowerCase() !== 'n/a';
      const hasRegion = row.region && String(row.region).trim() !== '' && String(row.region).toLowerCase() !== 'n/a';
      const hasEmployeeSize = row.employeeSize && String(row.employeeSize).trim() !== '' && String(row.employeeSize).toLowerCase() !== 'n/a';
      const hasRevenue = row.revenue && String(row.revenue).trim() !== '' && String(row.revenue).toLowerCase() !== 'n/a';
      const hasTechnology = (row.technologies && row.technologies.length > 0) || (row.technology && String(row.technology).trim() !== '');
      const hasPreviousDate = row.technologyDates && row.technologyDates.length > 0 && row.technologyDates.some(td => td.previousDetectedDate && String(td.previousDetectedDate).trim() !== '');
      const hasLatestDate = row.technologyDates && row.technologyDates.length > 0 && row.technologyDates.some(td => td.latestDetectedDate && String(td.latestDetectedDate).trim() !== '');
      return hasCompanyName && hasIndustry && hasRegion && hasEmployeeSize && hasRevenue && hasTechnology && hasPreviousDate && hasLatestDate;
    };

    const aComplete = isRowComplete(a);
    const bComplete = isRowComplete(b);
    if (aComplete && !bComplete) return -1;
    if (!aComplete && bComplete) return 1;
    return 0;
  });

  useEffect(() => {
    setTotalGroupedRecords(groupedDataArray.length);

    const calculatedPages = Math.ceil((totalRecords || 0) / rowsPerPage);
    setTotalPages(calculatedPages);
  }, [groupedDataArray.length, totalRecords, rowsPerPage]);

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
          zIndex: 20
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
    {onDemandModal && (
      <OnDemandModal
        filterType={onDemandModal.filterType}
        searchValue={onDemandModal.searchValue}
        sourcePage="Technographics"
        onClose={() => setOnDemandModal(null)}
      />
    )}
    <div className="technographics-container" ref={containerRef}>
      {}
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
            !
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
            {'\u00d7'}
          </button>
        </div>
      )}
      
      <div className="header-actions" style={{ marginBottom: '16px', position: 'sticky', top: '0', backgroundColor: '#ffffff', zIndex: '100', paddingBottom: '24px', paddingTop: '24px', paddingLeft: '16px', paddingRight: '16px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', margin: '0' }}>Technographics</h2>
        {

}
      </div>

      <div className="section-subtle-divider" />
      
      {}
      <div style={{ marginBottom: '16px' }} ref={filterRef}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: '60px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {}
          {/* Filters in order: Company Name, Industry, Region, Employee Size, Revenue, Category, Technology */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Company Name */}
            {activeFilterMenu !== 'companyName' && (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setActiveFilterMenu('companyName')}
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
                  <span>Company Name</span>
                </button>
              </div>
            )}

            {/* Industry */}
            {activeFilterMenu !== 'industry' && (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => { setActiveFilterMenu('industry'); setOpenFilterDropdown('industry'); }}
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
                >
                  <span>Industry</span>
                </button>
              </div>
            )}

            {/* Region */}
            {activeFilterMenu !== 'region' && (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => { setActiveFilterMenu('region'); setOpenFilterDropdown('region'); }}
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
                >
                  <span>Region</span>
                </button>
              </div>
            )}

            {/* Employee Size */}
            {activeFilterMenu !== 'employeeSize' && (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => { setActiveFilterMenu('employeeSize'); setOpenFilterDropdown('employeeSize'); }}
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
                >
                  <span>Employee Size</span>
                </button>
              </div>
            )}

            {/* Revenue */}
            {activeFilterMenu !== 'revenue' && (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => { setActiveFilterMenu('revenue'); setOpenFilterDropdown('revenue'); }}
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
                >
                  <span>Revenue</span>
                </button>
              </div>
            )}
          </div>

          {}
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
                <span>Category <span style={{ color: '#ef4444', fontWeight: '600' }}>*</span></span>
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
                  {'\u00d7'}
                </button>
              </div>
              
              {}
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
                {}
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

                {}
                {getUniqueOptions('companyName').length === 0 ? (
                  <div style={{
                    padding: '20px 12px',
                    textAlign: 'center',
                    color: '#9ca3af',
                    fontSize: '13px'
                  }}>
                    {loading ? 'Loading companies...' : 'No companies found'}
                  </div>
                ) : (
                  (() => {
                    const allCompanies = getUniqueOptions('companyName');
                    const filtered = allCompanies.filter(company =>
                      company.toLowerCase().includes(companySearchTerm.toLowerCase())
                    );
                    // Only render first 100 to prevent browser freeze
                    const visible = filtered.slice(0, 100);
                    const hasMore = filtered.length > 100;

                    return (
                      <>
                        {visible.map((company, idx) => (
                          <div
                            key={idx}
                            onClick={() => handleFilterChange('companyName', company)}
                            style={{
                              padding: '10px 12px',
                              cursor: 'pointer',
                              borderBottom: '1px solid #e5e7eb',
                              fontSize: '14px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              justifyContent: 'space-between'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <input
                                type="checkbox"
                                checked={filters.companyName.includes(company)}
                                onChange={() => {}}
                                style={{ cursor: 'pointer' }}
                              />
                              <span style={{ color: '#1f2937' }}>{company}</span>
                            </div>
                          </div>
                        ))}
                        {hasMore && (
                          <div style={{
                            padding: '10px 12px',
                            textAlign: 'center',
                            color: '#6b7280',
                            fontSize: '12px',
                            background: '#f9fafb',
                            borderTop: '1px solid #e5e7eb'
                          }}>
                            Loading more
                          </div>
                        )}
                        {filtered.length === 0 && (
                          <div style={{ padding: '10px 12px', textAlign: 'center', color: '#999', fontSize: '13px' }}>
                            Can't find it?
                          </div>
                        )}
                        {filtered.length === 0 && companySearchTerm.trim() && (
                          <div style={{ padding: '12px', borderTop: '1px solid #e5e7eb', textAlign: 'center' }}>
                            <button
                              onClick={() => {
                                setOnDemandModal({ filterType: 'Company Domain', searchValue: companySearchTerm.trim() });
                                setActiveFilterMenu(null);
                                setCompanySearchTerm('');
                              }}
                              style={{
                                padding: '7px 16px', backgroundColor: '#eff6ff', color: '#1d4ed8',
                                border: '1px solid #bfdbfe', borderRadius: '6px', cursor: 'pointer',
                                fontSize: '13px', fontWeight: '500'
                              }}
                            >
                              + Request on Demand
                            </button>
                          </div>
                        )}
                      </>
                    );
                  })()
                )}

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
                      setCompanySearchTerm('');
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
          {activeFilterMenu === 'region' && (
            <div style={{ position: 'relative', order: 10 }}>
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
                  {'\u00d7'}
                </button>
              </div>
              
              {}
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
                  <div style={{ padding: '8px', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, backgroundColor: 'white' }}>
                    <input
                      type="text"
                      placeholder="Search regions..."
                      value={regionSearchTerm}
                      onChange={(e) => setRegionSearchTerm(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        width: '100%', padding: '8px 10px', border: '1px solid #d1d5db',
                        borderRadius: '4px', fontSize: '13px', fontFamily: 'inherit', boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  {getUniqueOptions('region')
                    .slice()
                    .sort((a, b) => String(a || '').localeCompare(String(b || '')))
                    .filter(r => String(r || '').toLowerCase().includes(regionSearchTerm.toLowerCase()))
                    .map((region) => (
                    <div
                      key={region}
                      onClick={() => {
                        handleFilterChange('region', region);
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
                        <span>{formatRegionLabel(region)}</span>
                      </div>
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

          {}
          {false && filters.region.length > 0 && activeFilterMenu !== 'region' && (
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
              <span>Region</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFilters(prev => ({ ...prev, region: [] }));
                  setCurrentPage(1);
                  setPageCache({});
                  setTotalRecords(0);
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
                {'\u00d7'}
              </button>
            </div>
          )}

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
                  {'\u00d7'}
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
                {/* Category search input */}
                <div style={{ padding: '8px', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, backgroundColor: 'white' }}>
                  <input
                    type="text"
                    placeholder="Search categories..."
                    value={categorySearchTerm}
                    onChange={(e) => setCategorySearchTerm(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      width: '100%', padding: '8px 10px', border: '1px solid #d1d5db',
                      borderRadius: '4px', fontSize: '13px', fontFamily: 'inherit', boxSizing: 'border-box'
                    }}
                  />
                </div>
                {(() => {
                  const allCats = getAvailableCategoriesForCompanies()
                    .filter(a => a !== 'Not Detected' && a !== 'NOT detected' && a !== 'not detected')
                    .sort((a, b) => getCompanyCountByCategory(b) - getCompanyCountByCategory(a));
                  const filtered = allCats.filter(c => c.toLowerCase().includes(categorySearchTerm.toLowerCase()));
                  return (
                    <>
                      {filtered.map((option, idx) => (
                        <div
                          key={idx}
                          onClick={(e) => { e.stopPropagation(); handleFilterChange('category', option); }}
                          style={{
                            padding: '10px 12px', cursor: 'pointer',
                            backgroundColor: isCategorySelected(option) ? '#dbeafe' : 'white',
                            borderBottom: '1px solid #e5e7eb', fontSize: '14px',
                            display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'space-between'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = isCategorySelected(option) ? '#dbeafe' : 'white'}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input type="checkbox" checked={isCategorySelected(option)}
                              onChange={(e) => { e.stopPropagation(); handleFilterChange('category', option); }}
                              style={{ cursor: 'pointer' }} />
                            {(() => {
                              const catLogo = getCategoryLogoPath(option);
                              return catLogo ? (
                                <img src={catLogo} alt={option} style={{ width: '16px', height: '16px', objectFit: 'contain', flexShrink: 0 }} />
                              ) : renderTechLogo(option);
                            })()}
                            <span>{option}</span>
                          </div>
                        </div>
                      ))}
                      {filtered.length === 0 && (
                        <div style={{ padding: '10px 12px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
                          No categories match "{categorySearchTerm}"
                        </div>
                      )}
                    </>
                  );
                })()}

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
                      setCategorySearchTerm('');
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
          {activeFilterMenu === 'industry' && (
            <div style={{ position: 'relative', order: 10 }}>
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
                  {'\u00d7'}
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
                  <div style={{ padding: '8px', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, backgroundColor: 'white' }}>
                    <input
                      type="text"
                      placeholder="Search industries..."
                      value={industrySearchTerm}
                      onChange={(e) => setIndustrySearchTerm(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        width: '100%', padding: '8px 10px', border: '1px solid #d1d5db',
                        borderRadius: '4px', fontSize: '13px', fontFamily: 'inherit', boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  {getUniqueOptions('industry')
                    .sort((a, b) => {
                      const countA = getCompanyCountByIndustry(a);
                      const countB = getCompanyCountByIndustry(b);
                      return countB - countA;
                    })
                    .filter(i => String(i || '').toLowerCase().includes(industrySearchTerm.toLowerCase()))
                    .map((industry) => (
                    <div
                      key={industry}
                      onClick={() => {
                        handleFilterChange('industry', industry);
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

          {activeFilterMenu === 'employeeSize' && (
            <div style={{ position: 'relative', order: 10 }}>
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
                  {'\u00d7'}
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
                  {employeeSizeRanges.map((range) => (
                    <div
                      key={range.label}
                      onClick={() => {
                        handleFilterChange('employeeSize', range.label);
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

          {false && filters.employeeSize.length > 0 && activeFilterMenu !== 'employeeSize' && (
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
              <span>Employee Size</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFilters(prev => ({ ...prev, employeeSize: [] }));
                  setCurrentPage(1);
                  setPageCache({});
                  setTotalRecords(0);
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
                {'\u00d7'}
              </button>
            </div>
          )}

          {activeFilterMenu === 'revenue' && (
            <div style={{ position: 'relative', order: 10 }}>
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
                  {'\u00d7'}
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
                  {revenueRanges.map((range) => (
                    <div
                      key={range.label}
                      onClick={() => {
                        handleFilterChange('revenue', range.label);
                      }}
                      style={{
                        padding: '12px 16px',
                        cursor: 'pointer',
                        borderBottom: '1px solid #e5e7eb',
                        fontSize: '14px',
                        color: '#1f2937',
                        backgroundColor: filters.revenue.includes(range.label) ? '#f0f9ff' : 'white',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        transition: 'background-color 0.2s',
                        justifyContent: 'space-between'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = filters.revenue.includes(range.label) ? '#f0f9ff' : 'white'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                          type="checkbox"
                          checked={filters.revenue.includes(range.label)}
                          onChange={() => {}}
                          style={{
                            cursor: 'pointer',
                            width: '16px',
                            height: '16px'
                          }}
                        />
                        <span>{range.label}</span>
                      </div>
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

          {false && filters.revenue.length > 0 && activeFilterMenu !== 'revenue' && (
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
              <span>Revenue</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFilters(prev => ({ ...prev, revenue: [] }));
                  setCurrentPage(1);
                  setPageCache({});
                  setTotalRecords(0);
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
                {'\u00d7'}
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
                <span>Technology <span style={{ color: '#ef4444', fontWeight: '600' }}>*</span></span>
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
                  {'\u00d7'}
                </button>
              </div>
              
              {}
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
                  {/* Technology search input */}
                  <div style={{ padding: '8px', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, backgroundColor: 'white' }}>
                    <input
                      type="text"
                      placeholder="Search technologies..."
                      value={technologySearchTerm}
                      onChange={(e) => setTechnologySearchTerm(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        width: '100%', padding: '8px 10px', border: '1px solid #d1d5db',
                        borderRadius: '4px', fontSize: '13px', fontFamily: 'inherit', boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  {(() => {
                    const allTechs = getUniqueOptions('technology')
                      .filter(t => t !== 'Not Detected' && t !== 'NOT detected' && t !== 'not detected')
                      .sort((a, b) => getCompanyCountByTechnology(b) - getCompanyCountByTechnology(a));
                    const filtered = allTechs.filter(t => t.toLowerCase().includes(technologySearchTerm.toLowerCase()));
                    return (
                      <>
                        {filtered.map((tech) => (
                          <div
                            key={tech}
                            onClick={() => handleFilterChange('technology', tech)}
                            style={{
                              padding: '12px 16px', cursor: 'pointer',
                              borderBottom: '1px solid #e5e7eb', fontSize: '14px', color: '#1f2937',
                              backgroundColor: filters.technology.includes(tech) ? '#f0f9ff' : 'white',
                              display: 'flex', alignItems: 'center', gap: '10px',
                              transition: 'background-color 0.2s', justifyContent: 'space-between'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = filters.technology.includes(tech) ? '#f0f9ff' : 'white'}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <input type="checkbox" checked={filters.technology.includes(tech)} onChange={() => {}}
                                style={{ cursor: 'pointer', width: '16px', height: '16px' }} />
                              {renderTechLogo(tech)}
                              <span>{tech}</span>
                            </div>
                          </div>
                        ))}
                        {filtered.length === 0 && (
                          <div style={{ padding: '10px 12px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
                            No technologies match "{technologySearchTerm}"
                          </div>
                        )}
                      </>
                    );
                  })()}

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
                        setOpenFilterDropdown(null);
                        setActiveFilterMenu(null);
                        setTechnologySearchTerm('');
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

          {}
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
            onClick={() => {
              setActiveFilterMenu('technology');
              setOpenFilterDropdown('technology');
            }}
            >
              <span>Technology <span style={{ color: '#ef4444', fontWeight: '600' }}>*</span></span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFilters(prev => ({ ...prev, technology: [] }));
                  setCurrentPage(1);
                  setPageCache({});
                  setTotalRecords(0);
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
                {'\u00d7'}
              </button>
            </div>
          )}

          {}
          {filters.technology.length === 0 && activeFilterMenu !== 'technology' && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => {
                  setActiveFilterMenu('technology');
                  setOpenFilterDropdown('technology');
                }}
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
                <span>Technology <span style={{ color: '#ef4444', fontWeight: '600' }}>*</span></span>
              </button>
            </div>
          )}

          {}
          {(filters.companyName.length > 0 || filters.region || filters.category || filters.technology) && !activeFilterMenu && (
            <>
            </>
          )}

          {/* Additional optional filter badges  always render after mandatory filters */}
          {filters.industry.length > 0 && activeFilterMenu !== 'industry' && (
            <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #bfdbfe', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', color: '#1e40af', cursor: 'pointer' }}
            onClick={() => setActiveFilterMenu('industry')}>
              <span>Industry</span>
              <button onClick={(e) => { e.stopPropagation(); setFilters(prev => ({ ...prev, industry: [] })); setCurrentPage(1); setPageCache({}); setTotalRecords(0); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '0', color: '#1e40af', lineHeight: '1' }}>{'\u00d7'}</button>
            </div>
          )}
          {filters.region.length > 0 && activeFilterMenu !== 'region' && (
            <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #bfdbfe', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', color: '#1e40af', cursor: 'pointer' }}
            onClick={() => setActiveFilterMenu('region')}>
              <span>Region</span>
              <button onClick={(e) => { e.stopPropagation(); setFilters(prev => ({ ...prev, region: [] })); setCurrentPage(1); setPageCache({}); setTotalRecords(0); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '0', color: '#1e40af', lineHeight: '1' }}>{'\u00d7'}</button>
            </div>
          )}
          {filters.employeeSize.length > 0 && activeFilterMenu !== 'employeeSize' && (
            <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #bfdbfe', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', color: '#1e40af', cursor: 'pointer' }}
            onClick={() => setActiveFilterMenu('employeeSize')}>
              <span>Employee Size</span>
              <button onClick={(e) => { e.stopPropagation(); setFilters(prev => ({ ...prev, employeeSize: [] })); setCurrentPage(1); setPageCache({}); setTotalRecords(0); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '0', color: '#1e40af', lineHeight: '1' }}>{'\u00d7'}</button>
            </div>
          )}
          {filters.revenue.length > 0 && activeFilterMenu !== 'revenue' && (
            <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #bfdbfe', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', color: '#1e40af', cursor: 'pointer' }}
            onClick={() => setActiveFilterMenu('revenue')}>
              <span>Revenue</span>
              <button onClick={(e) => { e.stopPropagation(); setFilters(prev => ({ ...prev, revenue: [] })); setCurrentPage(1); setPageCache({}); setTotalRecords(0); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '0', color: '#1e40af', lineHeight: '1' }}>{'\u00d7'}</button>
            </div>
          )}
          </div>
          
          {}
          {/* <button className="download-csv-button" onClick={handleDownloadCSV} style={{ flexShrink: 0, marginLeft: 'auto' }}>
            <svg className="csv-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="12" y1="13" x2="12" y2="17"></line>
              <line x1="8" y1="13" x2="8" y2="17"></line>
              <line x1="16" y1="13" x2="16" y2="17"></line>
            </svg>
            Download CSV
          </button> */}
        </div>
      </div>

      <div className="table-container" style={{ maxHeight: '600px', height: '600px' }}>
        <table>
          <thead className="technographics-sticky-header">
            <tr>
              <th style={{ width: '40px', textAlign: 'center', padding: '12px 8px' }}>
                <input
                  type="checkbox"
                  checked={groupedDataArray.length > 0 && groupedDataArray.every(row => selectedRows.has(row.companyName))}
                  onChange={(e) => {
                    if (e.target.checked) {
                      const newSelected = new Set();
                      groupedDataArray.forEach(row => newSelected.add(row.companyName));
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
              <th style={{ textAlign: 'center', padding: '12px 8px', width: '120px' }}>
                <button
                  onClick={async () => {
                    if (selectedRows.size === 0) {
                      alert('Please select at least one company to reveal');
                      return;
                    }
                    const currentRevealed = new Set(revealedRows);
                    const toReveal = [];
                    selectedRows.forEach(companyName => {
                      const rowKey = `reveal-${companyName}`;
                      if (!currentRevealed.has(rowKey)) toReveal.push(rowKey);
                    });
                    if (toReveal.length === 0) return;

                    // deductCredit internally caps to available — returns actualAmount deducted or false
                    const actualAmount = await deductCredit('technographics', toReveal.length);
                    if (!actualAmount) return; // fully exhausted, popup already shown

                    const canReveal = toReveal.slice(0, actualAmount);
                    const blocked = toReveal.length - canReveal.length;

                    canReveal.forEach(rowKey => markRevealed('technographics', rowKey));
                    setRevealedRows(prev => {
                      const newSet = new Set(prev);
                      canReveal.forEach(rowKey => newSet.add(rowKey));
                      return newSet;
                    });

                    // Show popup if some were blocked by credit limit
                    if (blocked > 0) {
                      window.dispatchEvent(new CustomEvent('creditExhausted', {
                        detail: { section: 'technographics', label: 'Technographics', partial: true, revealed: canReveal.length, blocked }
                      }));
                    }
                  }}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: selectedRows.size > 0 ? '#3b82f6' : '#d1d5db',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: selectedRows.size > 0 ? 'pointer' : 'not-allowed',
                    fontSize: '13px',
                    fontWeight: '600',
                    transition: 'all 0.2s',
                    opacity: selectedRows.size > 0 ? 1 : 0.6
                  }}
                  onMouseEnter={(e) => {
                    if (selectedRows.size > 0) {
                      e.currentTarget.style.backgroundColor = '#1d4ed8';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedRows.size > 0) {
                      e.currentTarget.style.backgroundColor = '#3b82f6';
                    }
                  }}
                  title={selectedRows.size > 0 ? `Reveal ${selectedRows.size} selected companies` : 'Select companies to reveal'}
                >
                  Unlock
                </button>
              </th>
              <th style={{ textAlign: 'left', padding: '12px 8px' }}>Company Name</th>
              <th style={{ textAlign: 'left', padding: '12px 8px' }}>Industry</th>
              <th style={{ textAlign: 'left', padding: '12px 8px' }}>Region</th>
              <th style={{ textAlign: 'center', padding: '12px 8px' }}>Employee Size</th>
              <th style={{ textAlign: 'left', padding: '12px 8px' }}>Revenue</th>
              <th style={{ textAlign: 'left', padding: '12px 8px' }}>Technology</th>
              <th style={{ textAlign: 'center', padding: '12px 8px' }}>Previous Detected</th>
              <th style={{ textAlign: 'center', padding: '12px 8px' }}>Latest Detected</th>
            </tr>
          </thead>
          <tbody>
            {groupedDataArray.length > 0 ? (
              (() => {
                
                const rowsPerPageConst = rowsPerPage;
                const pageNum = currentPage || 1;
                const paginatedData = groupedDataArray;
                const totalPagesCount = totalPages || Math.ceil((totalRecords || 0) / rowsPerPageConst);

                return paginatedData.map((row, index) => {
                    const actualIndex = index;  // always 0-based since backend paginates
                    const isHighlighted = rowMatchesSearch(row);
                    const rowKey = `reveal-${row.companyName}`;  // stable key — company name only

                    if (!scrollRefsMap.current.has(rowKey)) {
                      scrollRefsMap.current.set(rowKey, {
                        tech: null,
                        prevDate: null,
                        latestDate: null
                      });
                    }
                    const refs = scrollRefsMap.current.get(rowKey);

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
                      hint: 'Click to view Tech Purchase Probability',
                      x: rect.right - 20,
                      y: rect.bottom + 20,
                      isCompanyName: true,
                      isBlurred: !revealedRows.has(`reveal-${row.companyName}`)
                    });
                  };

                  const handleTechScroll = (e) => {
                    if (refs.prevDate) {
                      refs.prevDate.scrollTop = e.target.scrollTop;
                    }
                    if (refs.latestDate) {
                      refs.latestDate.scrollTop = e.target.scrollTop;
                    }
                  };

                  const handleDateScroll = (e) => {
                    if (refs.tech) {
                      refs.tech.scrollTop = e.target.scrollTop;
                    }
                    if (refs.prevDate && refs.latestDate) {
                      if (e.target === refs.prevDate) {
                        refs.latestDate.scrollTop = e.target.scrollTop;
                      } else {
                        refs.prevDate.scrollTop = e.target.scrollTop;
                      }
                    }
                  };

                  return (
                    <tr 
                      key={index} 
                      style={{ backgroundColor: isHighlighted ? '#fefce8' : 'transparent', cursor: 'pointer', borderBottom: '1px solid #e5e7eb' }}
                    >
                      <td style={{ width: '40px', textAlign: 'center', padding: '12px 8px' }} onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedRows.has(row.companyName)}
                          onChange={(e) => {
                            e.stopPropagation();
                            const newSelected = new Set(selectedRows);
                            if (e.target.checked) {
                              newSelected.add(row.companyName);
                            } else {
                              newSelected.delete(row.companyName);
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
                      <td style={{ width: '80px', textAlign: 'center', padding: '12px 8px' }} onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={async () => {
                            const rowKey = `reveal-${row.companyName}`;
                            if (!revealedRows.has(rowKey)) {
                              const ok = await deductCredit('technographics', 1);
                              if (!ok) return; // credit exhausted — popup already shown, don't reveal
                              markRevealed('technographics', rowKey);
                              setRevealedRows(prev => {
                                const newSet = new Set(prev);
                                newSet.add(rowKey);
                                return newSet;
                              });
                            }
                          }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            padding: '8px 10px',
                            backgroundColor: revealedRows.has(`reveal-${row.companyName}`) ? '#f3f4f6' : '#f0fdf4',
                            border: revealedRows.has(`reveal-${row.companyName}`) ? '1px solid #d1d5db' : '1px solid #bbf7d0',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            if (!revealedRows.has(`reveal-${row.companyName}`)) {
                              e.currentTarget.style.backgroundColor = '#a7f3d0';
                              e.currentTarget.style.borderColor = '#6ee7b7';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!revealedRows.has(`reveal-${row.companyName}`)) {
                              e.currentTarget.style.backgroundColor = '#d1fae5';
                              e.currentTarget.style.borderColor = '#a7f3d0';
                            }
                          }}
                          title={revealedRows.has(`reveal-${row.companyName}`) ? 'Company details revealed' : 'Reveal company details'}
                        >
                          {revealedRows.has(`reveal-${row.companyName}`) ? (
                            <FaUnlock size={16} style={{ color: '#9ca3af' }} title="Company details revealed" />
                          ) : (
                            <FaLock size={16} style={{ color: '#1f2937' }} title="Click to reveal company details" />
                          )}
                        </button>
                      </td>
                      <td style={{ overflow: 'visible', whiteSpace: 'normal' }} onMouseEnter={(e) => handleCompanyNameMouseEnter(e, row.companyName)} onMouseLeave={handleMouseLeave}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {revealedRows.has(`reveal-${row.companyName}`) ? (
                            <>
                              <div 
                                style={{ fontWeight: '600', color: '#1f2937', cursor: 'pointer' }}
                                onClick={() => setSelectedCompany(row.companyName)}
                              >
                                {highlightText(row.companyName, searchTerm)}
                              </div>
                              <div style={{ fontSize: '13px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {row.domain && (
                                  <a
                                    href={`https://${row.domain}`}
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
                              <div style={{ fontWeight: '600', color: '#1f2937', filter: 'blur(8px)', userSelect: 'none', pointerEvents: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <FaLock size={14} style={{ color: '#6b7280', filter: 'blur(0px)' }} />
                                <span>------------------</span>
                              </div>
                              <div style={{ fontSize: '13px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '8px', filter: 'blur(6px)', userSelect: 'none', pointerEvents: 'none', marginTop: '4px' }}>
                                <span>----------</span>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                      <td onMouseEnter={(e) => handleMouseEnter(e, row.industry)} onMouseLeave={handleMouseLeave}>
                        {highlightText(row.industry, searchTerm)}
                      </td>
                      <td onMouseEnter={(e) => handleMouseEnter(e, row.region)} onMouseLeave={handleMouseLeave}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {renderCountryFlag(row.region)}
                          {highlightText(formatRegionLabel(row.region), searchTerm)}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center', padding: '12px 8px' }} onMouseEnter={(e) => handleMouseEnter(e, row.employeeSize)} onMouseLeave={handleMouseLeave}>
                        {highlightText(formatEmployeeSize(row.employeeSize), searchTerm)}
                      </td>
                      <td style={{ paddingLeft: '20px' }} onMouseEnter={(e) => handleMouseEnter(e, row.revenue)} onMouseLeave={handleMouseLeave}>
                        {highlightText(row.revenue, searchTerm)}
                      </td>
                      {

}
                      <td style={{ paddingLeft: '8px' }}>
                        <div 
                          ref={(el) => { if (el) refs.tech = el; }}
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
                          {(row.technologies || [row.technology]).map((tech, idx) => (
                            <span key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                              {renderTechLogo(tech)}
                              {highlightText(tech, searchTerm)}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ paddingLeft: '8px', textAlign: 'center' }}>
                        <div 
                          ref={(el) => { if (el) refs.prevDate = el; }}
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
                          onScroll={handleDateScroll}
                        >
                          {(row.technologyDates || []).map((dateInfo, idx) => (
                            <span key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', minHeight: '24px', justifyContent: 'center' }} onMouseEnter={(e) => handleMouseEnter(e, dateInfo.previousDetectedDate)} onMouseLeave={handleMouseLeave}>
                              {highlightText(dateInfo.previousDetectedDate && String(dateInfo.previousDetectedDate).trim() !== '' && String(dateInfo.previousDetectedDate).toLowerCase() !== 'n/a' ? dateInfo.previousDetectedDate : '-', searchTerm)}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ paddingLeft: '8px', textAlign: 'center' }}>
                        <div 
                          ref={(el) => { if (el) refs.latestDate = el; }}
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
                          onScroll={handleDateScroll}
                        >
                          {(row.technologyDates || []).map((dateInfo, idx) => (
                            <span key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', minHeight: '24px', justifyContent: 'center' }} onMouseEnter={(e) => handleMouseEnter(e, dateInfo.latestDetectedDate)} onMouseLeave={handleMouseLeave}>
                              {highlightText(dateInfo.latestDetectedDate && String(dateInfo.latestDetectedDate).trim() !== '' && String(dateInfo.latestDetectedDate).toLowerCase() !== 'n/a' ? dateInfo.latestDetectedDate : '-', searchTerm)}
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
                  <td colSpan="9" style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                    No data found
                  </td>
                </tr>
              )
            }
          </tbody>
        </table>
      </div>

      {}
      {groupedDataArray.length > 0 && (() => {
        const rowsPerPageConst = rowsPerPage;
        const totalPagesCount = Math.max(1, totalPages || Math.ceil((totalRecords || 0) / rowsPerPageConst));
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

        const startIndex = (currentPage - 1) * rowsPerPageConst;
        const endIndex = Math.min(startIndex + rowsPerPageConst, totalRecords || 0);

        return (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: '20px',
            marginBottom: '20px',
            paddingBottom: '15px',
            borderBottom: '1px solid #e5e7eb'
          }}>
            {}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px'
            }}>
              {(() => {
                return (
                  <>
                    <button
                      key="prev"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      style={{
                        padding: '8px 14px',
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
                      title="Previous page"
                    >
                      &lsaquo;
                    </button>
                    <button
                      key="next"
                      onClick={() => setCurrentPage(Math.min(totalPagesCount, currentPage + 1))}
                      disabled={currentPage === totalPagesCount}
                      style={{
                        padding: '8px 14px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        backgroundColor: currentPage === totalPagesCount ? '#f3f4f6' : 'white',
                        cursor: currentPage === totalPagesCount ? 'not-allowed' : 'pointer',
                        fontSize: '16px',
                        color: currentPage === totalPagesCount ? '#d1d5db' : '#6b7280',
                        fontWeight: '600',
                        transition: 'all 0.2s',
                        opacity: currentPage === totalPagesCount ? 0.5 : 1
                      }}
                      title="Next page"
                    >
                      &rsaquo;
                    </button>
                  </>
                );
              })()}
            </div>

            <div style={{ minWidth: '120px' }} />

          </div>
        );
      })()}

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
          <div style={{ fontWeight: '600', marginBottom: tooltip.hint ? '6px' : '0', filter: tooltip.isBlurred ? 'blur(6px)' : 'none' }}>
            {tooltip.text}
          </div>
          {tooltip.hint && (
            <div
              style={{
                fontSize: '11px',
                color: 'rgb(0, 102, 204)',
                fontWeight: '400',
                fontStyle: 'italic',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#f59e0b',
                  animation: 'ntpBulbFlicker 1.8s ease-in-out infinite',
                  filter: 'drop-shadow(0 0 4px rgba(245, 158, 11, 0.45))'
                }}
              >
                <FaLightbulb size={11} />
              </span>
              <span>{tooltip.hint}</span>
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

      {}
      {selectedCompany && (() => {
        
        const isRevealed = Array.from(revealedRows).some(key => key.endsWith(`-${selectedCompany}`));

        return isRevealed ? (
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
                  {'\u00d7'}
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
                        {/* NTP Analysis hidden - uncomment to restore
                        <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e5e7eb' }}>
                          <p style={{ margin: '0 0 4px 0', fontSize: '11px', fontWeight: '600', color: '#010810' }}>NTP Analysis:</p>
                          <p style={{ margin: '0', fontSize: '12px', color: '#555', lineHeight: '1.5' }}>
                            {item.ntpAnalysis || 'N/A'}
                          </p>
                        </div>
                        */}
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
        ) : null;
      })()}

      <style>{`
        .technographics-container {
          background: #ffffff;
          border-radius: 12px;
          padding: 0.4rem 0.9rem 0 1.75rem;
          margin-bottom: 0;
          margin-left: 0.0rem;
          margin-top: 0;
          width: calc(100% - 3rem);
          max-width: calc(100% - 3rem);
          overflow: visible;
          min-height: 750px !important;
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
          height: 600px !important;
          max-height: 600px !important;
          overflow-x: auto;
          overflow-y: scroll;
          position: relative;
          scrollbar-width: thin;
          -ms-overflow-style: auto;
        }

        .table-container::-webkit-scrollbar {
          width: 0 !important;
          height: 0 !important;
          display: none !important;
        }

        .table-container::-webkit-scrollbar-track {
          background: transparent !important;
          display: none !important;
        }

        .table-container::-webkit-scrollbar-thumb {
          background: transparent !important;
          display: none !important;
        }

        .tech-scroll-container::-webkit-scrollbar {
          width: 0 !important;
          height: 0 !important;
          display: none !important;
        }

        .tech-scroll-container::-webkit-scrollbar-track {
          background: transparent !important;
          display: none !important;
        }

        .tech-scroll-container::-webkit-scrollbar-thumb {
          background: transparent !important;
          display: none !important;
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
          min-width: 1400px;
          border-collapse: collapse;
          table-layout: fixed;
              overflow: auto;              /* keep scrolling enabled */
          scrollbar-width: none;       /* Firefox */
          -ms-overflow-style: none;    /* IE and Edge */

        }

        .table-container table {
          min-width: 1400px !important;
        }
        
        th, td {
          padding: 12px 15px;
          text-align: left;
          border-bottom: 1px solid #ddd;
          white-space: normal;
          overflow: visible;
          text-overflow: clip;
          cursor: default;
        }
        
        td {
          position: relative;
          overflow: visible;
        }
        
        td:hover {
          background-color: #f9fafb;
        }
        
        /* Set specific column widths */
        th:nth-child(1), td:nth-child(1) { width: 50px !important; } /* Checkbox */
        th:nth-child(2), td:nth-child(2) { width: 120px !important; } /* Unlock */
        th:nth-child(3), td:nth-child(3) { width: 180px !important; } /* Company Name */
        th:nth-child(4), td:nth-child(4) { width: 120px !important; } /* Industry */
        th:nth-child(5), td:nth-child(5) { width: 140px !important; } /* Region */
        th:nth-child(6), td:nth-child(6) { width: 140px !important; text-align: center !important; } /* Employee Size */
        th:nth-child(7), td:nth-child(7) { width: 110px !important; } /* Revenue */
        th:nth-child(8), td:nth-child(8) { width: 140px !important; } /* Technology */
        th:nth-child(9), td:nth-child(9) { width: 140px !important; } /* Category */
        th:nth-child(10), td:nth-child(10) { width: 160px !important; white-space: nowrap; } /* Previous Detected Date */
        th:nth-child(11), td:nth-child(11) { width: 160px !important; white-space: nowrap; } /* Latest Detected Date */
        
        /* Technology column padding for desktop */
        @media (min-width: 1024px) {
          th:nth-child(1), td:nth-child(1) { width: 50px !important; } /* Checkbox */
          th:nth-child(2), td:nth-child(2) { width: 120px !important; } /* Unlock */
          th:nth-child(3), td:nth-child(3) { width: 180px !important; } /* Company Name */
          th:nth-child(4), td:nth-child(4) { width: 120px !important; } /* Industry */
          th:nth-child(5), td:nth-child(5) { width: 95px !important; } /* Region */
          th:nth-child(6), td:nth-child(6) { width: 140px !important; text-align: center !important; } /* Employee Size */
          th:nth-child(7), td:nth-child(7) { width: 110px !important; } /* Revenue */
          th:nth-child(8), td:nth-child(8) { width: 140px !important; } /* Technology */
          th:nth-child(9), td:nth-child(9) { width: 140px !important; } /* Category */
          th:nth-child(10), td:nth-child(10) { width: 160px !important; white-space: nowrap; } /* Previous Detected Date */
          th:nth-child(11), td:nth-child(11) { width: 160px !important; white-space: nowrap; } /* Latest Detected Date */
          
          td:nth-child(7) {
            padding-left: 8px !important;
          }
        }
        
        @keyframes ntpBulbFlicker {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          15% {
            opacity: 0.75;
          }
          30% {
            opacity: 1;
            transform: scale(1.08);
          }
          45% {
            opacity: 0.82;
          }
          60% {
            opacity: 1;
          }
          75% {
            opacity: 0.9;
            transform: scale(1.04);
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
    </>
  );
};

export default Technographics;

