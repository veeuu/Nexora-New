import apiFetch from '../../utils/apiFetch';
import { useState, useEffect, useMemo, useRef } from 'react';
import { deductCredit } from '../../utils/credits';
import { markRevealed, getRevealedLocal, syncRevealedFromServer } from '../../utils/revealed';
import * as SiIcons from 'react-icons/si';
import { getLogoPath, getTechIcon } from '../../utils/logoMap';
import loadingGif from '../../assets/Data Loading GIF - Without Starhub.gif';
import { FaGlobe, FaLinkedin, FaLock, FaUnlock } from 'react-icons/fa';
import RenewalDashboard from './RenewalDashboard';

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
      try {
        const existing = JSON.parse(localStorage.getItem('onDemandHistory') || '[]');
        const entry = {
          id: Date.now(),
          query: requestedName,
          filterType,
          section: sourcePage || 'Renewal Intelligence',
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
        <div style={{ height: '4px', background: 'linear-gradient(90deg, #3b82f6, #6366f1)' }} />
        <div style={{ padding: '32px' }}>
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
          >×</button>

          {submitted ? (
            <div style={{ textAlign: 'center', padding: '12px 0 8px' }}>
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
        <span style={{ fontSize: '12px' }}>?</span>
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
    
    // If past or current quarter, return 100 (darkest/rightmost - Immediate)
    if (quarterDiff <= 0) return 100;
    
    // Map quarters to proximity (0-100)
    // 0 quarters = 100% (darkest/right - Immediate), 8+ quarters = 0% (lightest/left - Long-term)
    const maxQuarters = 8;
    return Math.min(100, Math.max(0, 100 - (quarterDiff / maxQuarters) * 100));
  };

  const getStatusLabel = (proximity) => {
    if (proximity >= 86) return '<1 year';
    if (proximity >= 46) return '1-2 years';
    return '2+ years';
  };

  const proximity = calculateProximity();
  const statusLabel = getStatusLabel(proximity);
  
  // Calculate arrow rotation based on proximity
  // For Immediate (proximity 100): should point right (90)
  // For Long-term (proximity 0): should point left (-90)
  const rotation = -90 + (proximity * 1.8);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
      <div style={{ position: 'relative', width: '50px', height: '28px' }}>
        <svg width="50" height="28" viewBox="0 0 100 55" style={{ position: 'absolute', top: 0, left: 0 }}>
          <defs>
            {/* Gradient from light (Immediate) to dark (Long-term) */}
            <linearGradient id="renewalGaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#e0f2fe" />
              <stop offset="25%" stopColor="#0ea5e9" />
              <stop offset="50%" stopColor="#0284c7" />
              <stop offset="75%" stopColor="#0369a1" />
              <stop offset="100%" stopColor="#0c4a6e" />
            </linearGradient>
          </defs>
          
          {/* Arc with gradient from light (Immediate) to dark (Long-term) */}
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
        <span style={{ fontSize: '12px' }}>?</span>
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
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
            onMouseLeave={(e) => e.target.style.backgroundColor = value === '' ? '#f3f4f6' : 'white'}
          >
            {renderIcon(option)}
            {option}
          </div>
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
    const [isFetching, setIsFetching] = useState(false);
    const [metadata, setMetadata] = useState(null);
    const [companyDetailsMap, setCompanyDetailsMap] = useState(null);
    const [totalRecords, setTotalRecords] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [tooltip, setTooltip] = useState({ show: false, text: '', x: 0, y: 0, isRevealed: true });
    const [showFilters, setShowFilters] = useState(false);
    const [activeFilterMenu, setActiveFilterMenu] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [revealedRows, setRevealedRows] = useState(() => {
        const data = getRevealedLocal();
        return new Set(Array.isArray(data.renewal) ? data.renewal : []);
    });
    const [selectedRows, setSelectedRows] = useState(new Set());
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [measurements, setMeasurements] = useState({});
    const [companySearchTerm, setCompanySearchTerm] = useState('');
    const [onDemandModal, setOnDemandModal] = useState(null);
    const [showDashboard, setShowDashboard] = useState(false);
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
    const onUpdate = () => {
        const data = getRevealedLocal();
        setRevealedRows(new Set(Array.isArray(data.renewal) ? data.renewal : []));
    };
    window.addEventListener('revealedUpdated', onUpdate);
    syncRevealedFromServer().then(data => {
        if (data && Array.isArray(data.renewal)) {
            setRevealedRows(new Set(data.renewal));
        }
    });
    return () => window.removeEventListener('revealedUpdated', onUpdate);
}, []);

useEffect(() => {
        const fetchMetadataAndDetails = async () => {
            try {
                setLoading(true);

                const [companyDetailsResponse, metadataResponse] = await Promise.all([
                    apiFetch('/api/company-details'),
                    apiFetch('/api/renewal-intelligence/metadata')
                ]);

                const companyDetails = await companyDetailsResponse.json();
                const meta = await metadataResponse.json();

                setCompanyDetailsMap(companyDetails);
                setMetadata(meta);
                setCategories(meta.categories || []);
                setProducts(meta.products || []);
            } catch (error) {
                setTableData([]);
            } finally {
                setLoading(false);
            }
        };
        fetchMetadataAndDetails();
    }, []);

    useEffect(() => {
        if (!metadata || !companyDetailsMap) return;

        const fetchPage = async () => {
            try {
                setLoading(true);
                await fetchRenewalPage(currentPage, companyDetailsMap, metadata);
            } finally {
                setLoading(false);
            }
        };

        fetchPage();
    }, [metadata, companyDetailsMap, currentPage, filters]);

useEffect(() => {
        const handleClickOutside = (event) => {
            if (filterRef.current && !filterRef.current.contains(event.target)) {
                setActiveFilterMenu(null);
                setCompanySearchTerm('');
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

        const headers = ['Company Name', 'Product', 'Renewal Timelines'];
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

    const buildQtrFilter = (meta) => {
        const hasQtrFilter = filters.qtr.length > 0;
        const hasProximityFilter = filters.renewalProximity.length > 0;

        if (!hasQtrFilter && !hasProximityFilter) {
            return [];
        }

        let qtrs = (meta?.quarters || []).filter(Boolean);

        if (hasQtrFilter) {
            qtrs = qtrs.filter(q => filters.qtr.includes(q));
        }

        if (hasProximityFilter) {
            const statusLabels = getUniqueRenewalProximity();
            const allowed = new Set();

            qtrs.forEach(qtr => {
                const proximity = getProximityValue(qtr);
                const status = getRenewalStatus(proximity);
                const label = statusLabels[status];
                if (filters.renewalProximity.includes(label)) {
                    allowed.add(qtr);
                }
            });

            qtrs = Array.from(allowed);
        }

        return qtrs;
    };

    const fetchRenewalPage = async (pageNum, detailsMap = companyDetailsMap, meta = metadata, retries = 3, delay = 500) => {
        try {
            const queryParams = new URLSearchParams();
            queryParams.append('page', pageNum);
            queryParams.append('limit', rowsPerPage);

            if (filters.companyName.length > 0) {
                filters.companyName.forEach(name => queryParams.append('companyName', name));
            }
            if (filters.category.length > 0) {
                filters.category.forEach(cat => queryParams.append('category', cat));
            }
            if (filters.product.length > 0) {
                filters.product.forEach(prod => queryParams.append('product', prod));
            }

            const qtrFilter = buildQtrFilter(meta);
            if (qtrFilter.length > 0) {
                qtrFilter.forEach(qtr => queryParams.append('qtr', qtr));
            }

            const response = await apiFetch(`/api/renewal-intelligence?${queryParams.toString()}`);
            const data = await response.json();

            if (response.status === 503 && retries > 0) {
                await new Promise(resolve => setTimeout(resolve, delay));
                return fetchRenewalPage(pageNum, detailsMap, meta, retries - 1, Math.min(delay * 1.5, 5000));
            }

            const pageData = data.data || data || [];
            const total = data.total ?? pageData.length;
            const pages = data.pages ?? Math.ceil(total / rowsPerPage);

            const map = detailsMap || {};
            const dataWithDetails = pageData.map(row => {
                const companyDetails = map[row.companyName] || {};
                return {
                    ...row,
                    domain: companyDetails.domain || 'N/A',
                    linkedinUrl: companyDetails.linkedinUrl || ''
                };
            });

            setTableData(dataWithDetails);
            setTotalRecords(total);
            setTotalPages(pages);
            setSelectedRows(new Set());
            // Restore revealed rows from localStorage instead of resetting
            const revealedData = getRevealedLocal();
            setRevealedRows(new Set(Array.isArray(revealedData.renewal) ? revealedData.renewal : []));

            return data;
        } catch (error) {
            setTableData([]);
            setTotalRecords(0);
            setTotalPages(0);
            return null;
        }
    };

    const getUniqueCompanies = () => {
        if (metadata?.companies?.length) return metadata.companies;
        if (!tableData) return [];
        const allCompanies = tableData.map(item => item.companyName);
        return [...new Set(allCompanies)].sort();
    };

    const getUniqueProducts = () => {
        if (metadata?.products?.length) return metadata.products;
        if (!tableData) return [];
        const allProducts = tableData.map(item => item.product);
        return [...new Set(allProducts)].sort();
    };

    const getUniqueQtrs = () => {
      const source = metadata?.quarters?.length ? metadata.quarters : (tableData || []).map(item => item.qtr);
      if (!source) return [];
      const cleaned = source
        .filter(Boolean)
        .filter(q => {
          if (typeof q !== 'string') return true;
          const lower = q.trim().toLowerCase();
          if (lower === 'n/a' || lower === 'unknown') return false;
          if (lower.includes('not detected')) return false;
          return true;
        });
      return [...new Set(cleaned)].sort();
    };

    const getUniqueRenewalProximity = () => {
        return ['<1 year', '1-2 years', '2+ years'];
    };

    const getUniqueCategories = () => {
        if (metadata?.categories?.length) return metadata.categories;
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

const categoryCountMap = useMemo(() => {
        const map = new Map();
        (metadata?.categoryCounts || []).forEach((item) => {
            if (!item) return;
            const label = item.label ?? item.category ?? item.name ?? item._id;
            if (label !== undefined && label !== null) {
                map.set(label, item.value ?? item.count ?? 0);
            }
        });
        return map;
    }, [metadata]);

const productCountMap = useMemo(() => {
        const map = new Map();
        (metadata?.productCounts || []).forEach((item) => {
            if (!item) return;
            const label = item.label ?? item.product ?? item.name ?? item._id;
            if (label !== undefined && label !== null) {
                map.set(label, item.value ?? item.count ?? 0);
            }
        });
        return map;
    }, [metadata]);

const qtrCountMap = useMemo(() => {
        const map = new Map();
        (metadata?.quarterCounts || []).forEach((item) => {
            if (!item) return;
            const label = item.label ?? item.qtr ?? item.name ?? item._id;
            if (label !== undefined && label !== null) {
                map.set(label, item.value ?? item.count ?? 0);
            }
        });
        return map;
    }, [metadata]);

const getAccountCountByCategory = (category) => {
        if (categoryCountMap && categoryCountMap.size > 0) {
            return categoryCountMap.get(category) || 0;
        }
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
        if (productCountMap && productCountMap.size > 0) {
            return productCountMap.get(product) || 0;
        }
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
        if (qtrCountMap && qtrCountMap.size > 0) {
            return qtrCountMap.get(qtr) || 0;
        }
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

        // Exclude Not Detected values
        if (row.category === 'Not Detected' || row.category === 'NOT detected' || row.category === 'not detected') return false;

        // Show all data by default (no mandatory filters required)
        const companyMatch = filters.companyName.length === 0 || filters.companyName.includes(row.companyName);
        const categoryMatch = filters.category.length === 0 || filters.category.includes(row.category);
        const productMatch = filters.product.length === 0 || filters.product.includes(row.product);
        const qtrMatch = filters.qtr.length === 0 || filters.qtr.includes(row.qtr);
        
        let renewalProximityMatch = true;
        if (filters.renewalProximity.length > 0) {
            const proximity = getProximityValue(row.qtr);
            const status = getRenewalStatus(proximity);
            const statusLabels = ['<1 year', '1-2 years', '2+ years'];
            renewalProximityMatch = filters.renewalProximity.includes(statusLabels[status]);
        }
        
        return companyMatch && categoryMatch && productMatch && qtrMatch && renewalProximityMatch;
    }).sort((a, b) => {
        // previously revealed rows were prioritized here — removed per request

        const proximityA = getProximityValue(a.qtr);
        const proximityB = getProximityValue(b.qtr);
        const statusA = getRenewalStatus(proximityA);
        const statusB = getRenewalStatus(proximityB);
        if (statusA !== statusB) return statusA - statusB;
        return proximityB - proximityA;
    });

const getChartData = () => {
        const qtrCounts = {};
        const colors = {
            'Q1 2025': '#dbeafe',
            'Q2 2025': '#bfdbfe',
            'Q3 2025': '#93c5fd',
            'Q4 2025': '#60a5fa',
            'Q1 2026': '#3b82f6',
            'Q2 2026': '#1d4ed8'
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
        {onDemandModal && (
          <OnDemandModal
            filterType={onDemandModal.filterType}
            searchValue={onDemandModal.searchValue}
            sourcePage="Renewal Intelligence"
            onClose={() => setOnDemandModal(null)}
          />
        )}
        <div className="renewal-intelligence-container">
            <div className="header-actions" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: '0', backgroundColor: '#ffffff', zIndex: '100', paddingBottom: '15px', paddingTop: '15px', paddingLeft: '16px', paddingRight: '16px' }}>
                <h2 style={{ fontSize: '25px', fontWeight: '700', margin: '0' }}>Renewal Intelligence</h2>
                <div className="actions-right" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {}
                </div>
            </div>

            <div className="section-subtle-divider" />

            <div style={{ marginBottom: '20px', paddingTop: '40px' }} ref={filterRef}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                {}
                {/* Filters in order: Company Name, Category, Product, Renewal Timeline, Renewal Tracker */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  {/* Company Name */}
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
                    >
                      <span>Company Name</span>
                    </button>
                  </div>

                  {/* Category */}
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

                  {/* Product */}
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={() => setActiveFilterMenu('product')}
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
                      <span>Product</span>
                    </button>
                  </div>
                </div>

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
                    <span>Renewal Timelines <span style={{ color: '#ef4444', fontWeight: '600' }}>*</span></span>
                  </button>
                </div>
              )}

              {}
              {activeFilterMenu !== 'renewalProximity' && filters.renewalProximity.length === 0 && (
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setActiveFilterMenu('renewalProximity')}
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
                    <span>Renewal Tracker</span>
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
                      <span>Company Name</span>
                      <button
                        onClick={() => {
                          setActiveFilterMenu(null);
                          setCompanySearchTerm('');
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
                        ×
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
                      {(() => {
                        const allFiltered = getUniqueCompanies()
                          .filter(company => company.toLowerCase().includes(companySearchTerm.toLowerCase()));
                        const visible = allFiltered.slice(0, 100);
                        const hasMore = allFiltered.length > 100;
                        return (
                          <>
                            {visible.map((option, idx) => (
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
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = filters.companyName.includes(option) ? '#dbeafe' : 'white'}
                              >
                                <input
                                  type="checkbox"
                                  checked={filters.companyName.includes(option)}
                                  onChange={() => {}}
                                  style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                                />
                                <span style={{ color: '#1f2937' }}>{option}</span>
                              </div>
                            ))}
                            {hasMore && (
                              <div style={{ padding: '8px 12px', textAlign: 'center', color: '#6b7280', fontSize: '12px', background: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
                                Loading more
                              </div>
                            )}
                            {allFiltered.length === 0 && getUniqueCompanies().length > 0 && (
                              <div style={{ padding: '10px 12px', textAlign: 'center', color: '#999', fontSize: '13px' }}>
                                Can't find it?
                              </div>
                            )}
                            {allFiltered.length === 0 && companySearchTerm.trim() && (
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
                      <span>Category <span style={{ color: '#ef4444', fontWeight: '600' }}>*</span></span>
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
                        ×
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
                      {getUniqueCategories()
                        .filter(option => option !== 'Not Detected' && option !== 'NOT detected' && option !== 'not detected')
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
                      <span>Product</span>
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
                        ×
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
                      <span>Renewal Timelines <span style={{ color: '#ef4444', fontWeight: '600' }}>*</span></span>
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
                        ×
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
                      {getUniqueQtrs()
                        .sort((a, b) => {
                          const parseQtr = (q) => {
                            const m = String(q).match(/Q(\d+)\s+(\d{4})/i);
                            return m ? parseInt(m[2]) * 10 + parseInt(m[1]) : 0;
                          };
                          return parseQtr(a) - parseQtr(b);
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
                      <span>Renewal Tracker</span>
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
                        ×
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
                      Company Name
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
                      ×
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
                      Category <span style={{ color: '#ef4444', fontWeight: '600' }}>*</span>
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
                      ×
                    </button>
                  </div>
                )}

                {}
                {filters.product.length > 0 && activeFilterMenu !== 'product' && (
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
                  onClick={() => setActiveFilterMenu('product')}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      Product
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
                      ×
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
                      Renewal Tracker
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
                      ×
                    </button>
                  </div>
                )}
                </div>

                {}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                  {/* <button
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
                  </button> */}
                </div>
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
                        <div className="table-container" style={{ maxHeight: '600px', height: '600px' }}>
                            <table>
                                <thead className="sticky-header">
                                    <tr>
                                        <th style={{ textAlign: 'center', padding: '12px 8px', width: '50px' }}>
                                          <input
                                            type="checkbox"
                                            checked={(() => {
                                              const currentPageRows = filteredData;
                                              return currentPageRows.length > 0 && currentPageRows.every((_, idx) => selectedRows.has(idx));
                                            })()}
                                            onChange={(e) => {
                                              const currentPageRows = filteredData;
                                              if (e.target.checked) {
                                                const newSelected = new Set(selectedRows);
                                                currentPageRows.forEach((_, idx) => newSelected.add(idx));
                                                setSelectedRows(newSelected);
                                              } else {
                                                const newSelected = new Set(selectedRows);
                                                currentPageRows.forEach((_, idx) => newSelected.delete(idx));
                                                setSelectedRows(newSelected);
                                              }
                                            }}
                                            style={{ cursor: 'pointer', width: '16px', height: '16px' }}
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
                                              selectedRows.forEach(rowIndex => {
                                                const rowData = filteredData[rowIndex];
                                                if (rowData) {
                                                  const rowKey = `${rowIndex}-${rowData.companyName}`;
                                                  if (!currentRevealed.has(rowKey)) toReveal.push(rowKey);
                                                }
                                              });
                                              if (toReveal.length === 0) return;

                                              const actualAmount = await deductCredit('renewal', toReveal.length);
                                              if (!actualAmount) return;

                                              const canReveal = toReveal.slice(0, actualAmount);
                                              const blocked = toReveal.length - canReveal.length;

                                              canReveal.forEach(rowKey => markRevealed('renewal', rowKey));
                                              setRevealedRows(prev => {
                                                const newSet = new Set(prev);
                                                canReveal.forEach(rowKey => newSet.add(rowKey));
                                                return newSet;
                                              });

                                              if (blocked > 0) {
                                                window.dispatchEvent(new CustomEvent('creditExhausted', {
                                                  detail: { section: 'renewal', label: 'Renewal Intelligence', partial: true, revealed: canReveal.length, blocked }
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
                                        <th style={{ textAlign: 'left', flex: 1, padding: '12px 8px' }}>Company Name</th>
                                        <th style={{ textAlign: 'left', flex: 1, padding: '12px 8px' }}>Product</th>
                                        <th style={{ textAlign: 'left', flex: 1, padding: '12px 8px' }}>Renewal Timelines</th>
                                        <th style={{ textAlign: 'center', padding: '12px 8px', width: '100px' }}>Renewal Tracker</th>
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
                                            const paginatedData = filteredData;

                                            return paginatedData.map((row, index) => {
                                                const actualIndex = index;
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
                                                                onClick={async () => {
                                                                    if (!isRevealed) {
                                                                        const ok = await deductCredit('renewal', 1);
                                                                        if (!ok) return;
                                                                        markRevealed('renewal', rowKey);
                                                                        setRevealedRows(prev => { const s = new Set(prev); s.add(rowKey); return s; });
                                                                    }
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
                                                        <td style={{ textAlign: 'left', flex: 1, padding: '12px 8px' }}>
                                                            {isRevealed ? (
                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                                    <div style={{ fontWeight: '600', color: '#1f2937' }}>
                                                                        {row.companyName}
                                                                    </div>
                                                                    <div style={{ fontSize: '13px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                        {row.domain && row.domain !== 'N/A' && (
                                                                            <a
                                                                                href={row.domain.startsWith('http') ? row.domain : `https://${row.domain}`}
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
                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                                    <div style={{ fontWeight: '600', color: '#1f2937', filter: 'blur(4px)', userSelect: 'none', pointerEvents: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                        <span>------------------</span>
                                                                    </div>
                                                                    <div style={{ fontSize: '13px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '8px', filter: 'blur(4px)', userSelect: 'none', pointerEvents: 'none' }}>
                                                                        <span>----------</span>
                                                                    </div>
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
                        <div className="table-container" style={{ maxHeight: '600px', height: '600px' }}>
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
                                        <th style={{ textAlign: 'center', padding: '12px 8px', width: '80px' }}>Unlock</th>
                                        <th style={{ textAlign: 'left', flex: 1, padding: '12px 8px' }}>Company Name</th>
                                        <th style={{ textAlign: 'left', flex: 1, padding: '12px 8px' }}>Product</th>
                                        <th style={{ textAlign: 'left', flex: 1, padding: '12px 8px' }}>Renewal Timelines</th>
                                        <th style={{ textAlign: 'center', padding: '12px 8px', width: '100px' }}>Renewal Tracker</th>
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
                                            const paginatedData = filteredData;

                                            return paginatedData.map((row, index) => {
                                                const actualIndex = index;
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
                                                                onClick={async () => {
                                                                    if (!isRevealed) {
                                                                        const ok = await deductCredit('renewal', 1);
                                                                        if (!ok) return;
                                                                        markRevealed('renewal', rowKey);
                                                                        setRevealedRows(prev => { const s = new Set(prev); s.add(rowKey); return s; });
                                                                    }
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
                                                                                href={row.domain.startsWith('http') ? row.domain : `https://${row.domain}`}
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
                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                                    <div style={{ fontWeight: '600', color: '#1f2937', filter: 'blur(8px)', userSelect: 'none', pointerEvents: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                        <span>------------------</span>
                                                                    </div>
                                                                    <div style={{ fontSize: '13px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '8px', filter: 'blur(6px)', userSelect: 'none', pointerEvents: 'none' }}>
                                                                        <span>----------</span>
                                                                    </div>
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
                    {shouldShowTable && totalPages > 1 && (
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

                        {}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            {(() => {
                                const totalPagesCount = totalPages;
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
                                            &laquo;
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
                                            &lsaquo;
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

                                        {endPage < totalPagesCount && (
                                            <>
                                                {endPage < totalPagesCount - 1 && <span style={{ color: '#d1d5db', padding: '0 4px' }}>...</span>}
                                                <button
                                                    key={totalPagesCount}
                                                    onClick={() => setCurrentPage(totalPagesCount)}
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
                                                    {totalPagesCount}
                                                </button>
                                            </>
                                        )}

                                        {}
                                        <button
                                            key="next"
                                            onClick={() => setCurrentPage(Math.min(totalPagesCount, currentPage + 1))}
                                            disabled={currentPage === totalPagesCount}
                                            style={{
                                                padding: '8px 12px',
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
                                            onMouseEnter={(e) => {
                                                if (currentPage < totalPagesCount) {
                                                    e.target.style.backgroundColor = '#f9fafb';
                                                    e.target.style.borderColor = '#9ca3af';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (currentPage < totalPagesCount) {
                                                    e.target.style.backgroundColor = 'white';
                                                    e.target.style.borderColor = '#d1d5db';
                                                }
                                            }}
                                            title="Next page"
                                        >
                                            &rsaquo;
                                            </button>

                                        {}
                                        <button
                                            key="last"
                                            onClick={() => setCurrentPage(totalPagesCount)}
                                            disabled={currentPage === totalPagesCount}
                                            style={{
                                                padding: '8px 12px',
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
                                            onMouseEnter={(e) => {
                                                if (currentPage < totalPagesCount) {
                                                    e.target.style.backgroundColor = '#f9fafb';
                                                    e.target.style.borderColor = '#9ca3af';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (currentPage < totalPagesCount) {
                                                    e.target.style.backgroundColor = 'white';
                                                    e.target.style.borderColor = '#d1d5db';
                                                }
                                            }}
                                            title="Last page"
                                        >
                                            &raquo;
                                            </button>
                                    </>
                                );
                            })()}
                        </div>

                        <div style={{ minWidth: '120px' }} />
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

            <style>{`
                .renewal-intelligence-container {
                    background: linear-gradient(180deg, #ffffff, #fafbff);
                    border-radius: 12px;
                    padding: 1.25rem 0.9rem 1.5rem;
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

                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
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
        {showDashboard && <RenewalDashboard onClose={() => setShowDashboard(false)} />}
        </>
    );
};

export default RenewalIntelligence;
