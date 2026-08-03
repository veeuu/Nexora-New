import apiFetch from '../../utils/apiFetch';
import { useState, useEffect, useRef, useMemo } from 'react';
import { deductCredit } from '../../utils/credits';
import { markRevealed, getRevealedLocal, syncRevealedFromServer } from '../../utils/revealed';
import { rowMatchesSearch, highlightText, Tooltip, createTooltipHandlers } from '../../utils/tableUtils';
import { getLogoPath, getTechIcon, getCategoryLogoPath } from '../../utils/logoMap';
import loadingGif from '../../assets/Data Loading GIF - Without Starhub.gif';
import { FaLinkedin, FaGlobe, FaRobot, FaLock, FaUnlock, FaCopy } from 'react-icons/fa';
import ChatBot from '../ChatBot';
import '../../styles/ntp.css';

// ── On-Demand Request Modal ──────────────────────────────────────────────────
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
          section: sourcePage || 'Next Tech Purchase®',
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
  const [onDemandModal, setOnDemandModal] = useState(null);
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
  const [revealedRows, setRevealedRows] = useState(() => {
    const data = getRevealedLocal();
    return new Set(Array.isArray(data.ntp) ? data.ntp : []);
  });
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
    const onUpdate = () => {
      const data = getRevealedLocal();
      setRevealedRows(new Set(Array.isArray(data.ntp) ? data.ntp : []));
    };
    window.addEventListener('revealedUpdated', onUpdate);
    syncRevealedFromServer().then(data => {
      if (data && Array.isArray(data.ntp)) {
        setRevealedRows(new Set(data.ntp));
      }
    });
    return () => window.removeEventListener('revealedUpdated', onUpdate);
  }, []);

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
      // If rows are selected, download only those rows from filteredData
      if (selectedRows.size > 0) {
        const selectedData = filteredData.filter((_, index) => selectedRows.has(index));
        const headers = [
          'companyName', 'domain', 'category', 'technology',
          'purchaseProbability', 'purchasePrediction'
        ];
        const csvContent = [
          headers.join(','),
          ...selectedData.map(row =>
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

      const response = await apiFetch(`/api/ntp/export?${queryParams.toString()}`);
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

      if (rows.length === 0) {
        alert('No data to download. Please apply filters and try again.');
        return;
      }

      const headers = [
        'companyName', 'domain', 'category', 'technology',
        'purchaseProbability', 'purchasePrediction'
      ];

      const csvContent = [
        headers.join(','),
        ...rows.map(row =>
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
      const response = await apiFetch(`/api/ntp?${queryParams.toString()}`);
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
          apiFetch('/api/ntp/metadata'),
          apiFetch('/api/ntp/summary')
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

  const PREDICTION_ORDER = { High: 0, Medium: 1, Low: 2 };

  const filteredData = useMemo(() => {
    // "Not Detected" records are now excluded server-side
    return tableData
      .sort((a, b) => {
        const pa = PREDICTION_ORDER[a.purchasePrediction] ?? 99;
        const pb = PREDICTION_ORDER[b.purchasePrediction] ?? 99;
        return pa - pb;
      });
  }, [tableData]);

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
      {onDemandModal && (
        <OnDemandModal
          filterType={onDemandModal.filterType}
          searchValue={onDemandModal.searchValue}
          sourcePage="NTP"
          onClose={() => setOnDemandModal(null)}
        />
      )}
      <div className={`header-actions${chatbotOpen && isFirstLoad ? ' ntp-blur-active' : ''}`}>
        <h2>Next Tech Purchase - NTP® </h2>
        <div className="actions-right">
        </div>
      </div>
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
      
      <div className="ntp-filters-wrapper" ref={filterRef}>
        <div className="ntp-filters-container">
          <div className="ntp-filters-left">
          
          {}
          {/* Filters in order: Company Name, Category, Technology, Purchase Prediction */}
          <div className="ntp-filter-button-wrapper">
            <button
              onClick={() => setActiveFilterMenu('companyName')}
              className="ntp-filter-button"
            >
              <span>Company Name</span>
            </button>
          </div>

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

          <div className="ntp-filter-button-wrapper">
            <button
              onClick={() => setActiveFilterMenu('technology')}
              className="ntp-filter-button"
            >
              <span>Technology</span>
            </button>
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
                {(() => {
                  const allFiltered = getUniqueOptions('companyName')
                    .filter(option => option.toLowerCase().includes(companyNameSearch.toLowerCase()));
                  const visible = allFiltered.slice(0, 100);
                  const hasMore = allFiltered.length > 100;
                  return (
                    <>
                      {visible.map((option, idx) => {
                        const isSelected = Array.isArray(filters.companyName) && filters.companyName.includes(option);
                        return (
                          <div
                            key={idx}
                            onClick={() => handleFilterChange('companyName', option)}
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
                      {hasMore && (
                        <div style={{ padding: '8px 12px', textAlign: 'center', color: '#6b7280', fontSize: '12px', background: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
                          Loading more
                        </div>
                      )}
                      {allFiltered.length === 0 && (
                        <div style={{ padding: '10px 12px', textAlign: 'center', color: '#999', fontSize: '13px' }}>
                          Can't find it?
                        </div>
                      )}
                      {allFiltered.length === 0 && companyNameSearch.trim() && (
                        <div style={{ padding: '12px', borderTop: '1px solid #e5e7eb', textAlign: 'center' }}>
                          <button
                            onClick={() => {
                              setOnDemandModal({ filterType: 'Company Domain', searchValue: companyNameSearch.trim() });
                              setActiveFilterMenu(null);
                              setCompanyNameSearch('');
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
                {getUniqueOptions('purchasePrediction')
                  .filter(option => option !== 'Not Detected')
                  .sort((a, b) => {
                    const pa = PREDICTION_ORDER[a] ?? 99;
                    const pb = PREDICTION_ORDER[b] ?? 99;
                    return pa - pb;
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
                          {(() => {
                            const catLogo = getCategoryLogoPath(option);
                            return catLogo ? (
                              <img src={catLogo} alt={option} style={{ width: '16px', height: '16px', objectFit: 'contain', marginRight: '4px', verticalAlign: 'middle' }} />
                            ) : renderTechLogo(option);
                          })()}
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
                {getUniqueOptions('technology')
                  .filter(option => option !== 'Not Detected' && option !== 'NOT detected' && option !== 'not detected')
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
          {/* <button className="download-csv-button" onClick={handleDownloadCSV}>
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
              <th style={{ textAlign: 'center' }}>
                <button
                  onClick={async () => {
                    if (selectedRows.size === 0) return;
                    const companiesMapBulk = new Map();
                    filteredData.forEach(row => {
                      if (!companiesMapBulk.has(row.companyName)) {
                        companiesMapBulk.set(row.companyName, { companyName: row.companyName });
                      }
                    });
                    const allCompaniesBulk = Array.from(companiesMapBulk.values()).sort((a, b) => {
                      // previously revealed rows were prioritized here — removed per request
                      return 0;
                    });
                    const currentRevealed = new Set(revealedRows);
                    const toReveal = [];
                    selectedRows.forEach(rowIndex => {
                      const company = allCompaniesBulk[rowIndex];
                      if (company) {
                        const rowKey = `${rowIndex}-${company.companyName}`;
                        if (!currentRevealed.has(rowKey)) toReveal.push(rowKey);
                      }
                    });
                    if (toReveal.length === 0) return;

                    const actualAmount = await deductCredit('ntp', toReveal.length);
                    if (!actualAmount) return;

                    const canReveal = toReveal.slice(0, actualAmount);
                    const blocked = toReveal.length - canReveal.length;

                    canReveal.forEach(rowKey => markRevealed('ntp', rowKey));
                    setRevealedRows(prev => {
                      const newSet = new Set(prev);
                      canReveal.forEach(rowKey => newSet.add(rowKey));
                      return newSet;
                    });

                    if (blocked > 0) {
                      window.dispatchEvent(new CustomEvent('creditExhausted', {
                        detail: { section: 'ntp', label: 'Next Tech Purchase®', partial: true, revealed: canReveal.length, blocked }
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
                  onMouseEnter={(e) => { if (selectedRows.size > 0) e.currentTarget.style.backgroundColor = '#1d4ed8'; }}
                  onMouseLeave={(e) => { if (selectedRows.size > 0) e.currentTarget.style.backgroundColor = '#3b82f6'; }}
                  title={selectedRows.size > 0 ? `Reveal ${selectedRows.size} selected companies` : 'Select companies to reveal'}
                >
                  Unlock
                </button>
              </th>
              <th style={{ textAlign: 'center' }}>Company Name</th>
              {/* <th>Category</th> */}
              <th>Technology</th>
              <th>Purchase Prediction</th>
              <th>Purchase Propensity (%)</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              // Group filteredData by company (backend already paginated)
              const companiesMap = new Map();
              filteredData.forEach(row => {
                if (!companiesMap.has(row.companyName)) {
                  companiesMap.set(row.companyName, {
                    companyName: row.companyName,
                    domain: row.domain,
                    linkedinUrl: row.linkedinUrl,
                    category: row.category,
                    purchasePrediction: row.purchasePrediction,
                    technologies: []
                  });
                }
                companiesMap.get(row.companyName).technologies.push({
                  technology: row.technology,
                  purchaseProbability: row.purchaseProbability,
                  purchasePrediction: row.purchasePrediction,
                  ntpAnalysis: row.ntpAnalysis
                });
              });

              const allCompanies = Array.from(companiesMap.values()).sort((a, b) => {
                // previously revealed rows were prioritized here — removed per request
                return 0;
              });

              return allCompanies.map((company, companyIndex) => {
                const actualIndex = companyIndex;
                const companyRowSpan = 1;

                // Only render one row per company  all techs stacked in the cell
                const tech = company.technologies[0] || {};
                const isFirstTechRow = true;

                  const rowKey = `${actualIndex}-${company.companyName}`;
                  const isRevealed = revealedRows.has(rowKey);

                  return [(
                    <tr key={`${companyIndex}-0`} className="company-separator">
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
                        <td rowSpan={companyRowSpan} style={{ textAlign: 'center', width: '80px' }}>
                          <button
                            onClick={async () => {
                              if (!isRevealed) {
                                const ok = await deductCredit('ntp', 1);
                                if (!ok) return;
                                markRevealed('ntp', rowKey);
                                setRevealedRows(prev => { const s = new Set(prev); s.add(rowKey); return s; });
                              }
                            }}
                            className={`reveal-button ${isRevealed ? 'reveal-button-unlocked' : 'reveal-button-locked'}`}
                            onMouseEnter={(e) => { if (!isRevealed) e.currentTarget.style.backgroundColor = '#f3f4f6'; }}
                            onMouseLeave={(e) => { if (!isRevealed) e.currentTarget.style.backgroundColor = 'transparent'; }}
                            title={isRevealed ? 'Company revealed' : 'Click to reveal company'}
                          >
                            {isRevealed
                              ? <FaUnlock size={16} style={{ color: '#9ca3af' }} />
                              : <FaLock size={16} style={{ color: '#1f2937' }} />}
                          </button>
                        </td>
                      )}

                      {isFirstTechRow && (
                        <td rowSpan={companyRowSpan} style={{ textAlign: 'center' }}>
                          <div className="ntp-company-cell">
                            <div className="ntp-company-name" style={!isRevealed ? { filter: 'blur(6px)', userSelect: 'none', pointerEvents: 'none' } : {}}>
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
                            <div className="ntp-company-links" style={!isRevealed ? { filter: 'blur(6px)', userSelect: 'none', pointerEvents: 'none' } : {}}>
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

                      {/* Category column hidden */}

                      {}
                      {isFirstTechRow && (
                        <td className="ntp-tech-cell" rowSpan={companyRowSpan}>
                          <div
                            className="ntp-tech-scroll-container"
                            data-sync-index={companyIndex}
                            data-sync-role="tech"
                            onScroll={(e) => {
                              ['propensity', 'prediction'].forEach(role => {
                                const paired = document.querySelector(
                                  `.ntp-tech-scroll-container[data-sync-index="${companyIndex}"][data-sync-role="${role}"]`
                                );
                                if (paired) paired.scrollTop = e.target.scrollTop;
                              });
                            }}
                          >
                            {company.technologies.map((t, idx) => (
                              <span key={idx} className="ntp-tech-item">
                                <span className="ntp-tech-icon-slot">{renderTechLogo(t.technology)}</span>
                                {t.technology}
                              </span>
                            ))}
                          </div>
                        </td>
                      )}

                      {}
                      {isFirstTechRow && (
                        <td rowSpan={companyRowSpan} style={{ textAlign: 'center' }}>
                          <div
                            className="ntp-tech-scroll-container"
                            data-sync-index={companyIndex}
                            data-sync-role="prediction"
                            onScroll={(e) => {
                              ['tech', 'propensity'].forEach(role => {
                                const paired = document.querySelector(
                                  `.ntp-tech-scroll-container[data-sync-index="${companyIndex}"][data-sync-role="${role}"]`
                                );
                                if (paired) paired.scrollTop = e.target.scrollTop;
                              });
                            }}
                          >
                            {company.technologies.map((t, idx) => (
                              <span key={idx} style={{ height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {t.purchasePrediction || company.purchasePrediction}
                              </span>
                            ))}
                          </div>
                        </td>
                      )}

                      {}
                      {isFirstTechRow && (
                        <td className="ntp-propensity-cell" rowSpan={companyRowSpan}>
                          <div
                            className="ntp-tech-scroll-container"
                            data-sync-index={companyIndex}
                            data-sync-role="propensity"
                            onScroll={(e) => {
                              ['tech', 'prediction'].forEach(role => {
                                const paired = document.querySelector(
                                  `.ntp-tech-scroll-container[data-sync-index="${companyIndex}"][data-sync-role="${role}"]`
                                );
                                if (paired) paired.scrollTop = e.target.scrollTop;
                              });
                            }}
                          >
                            {company.technologies.map((t, idx) => (
                              <span key={idx} className="ntp-propensity-item" style={{ height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {(() => {
                                  const val = String(t.purchaseProbability || '0').replace('%', '');
                                  return `${parseFloat(val).toFixed(2)}%`;
                                })()}
                              </span>
                            ))}
                          </div>
                        </td>
                      )}
                    </tr>
                  )];
              });
            })()}
          </tbody>
        </table>
      </div>

      {}
      {filteredData.length > 0 && (() => {
        const totalPagesCount = Math.max(1, totalPages || Math.ceil((totalRecords || filteredData.length) / rowsPerPage));
        const startIndex = (currentPage - 1) * rowsPerPage + 1;
        const endIndex = Math.min(currentPage * rowsPerPage, totalRecords || filteredData.length);

        return (
          <div className="ntp-pagination-wrapper">
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
                      &laquo;
                      </button>

                    {}
                    <button
                      key="prev"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="ntp-pagination-button"
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
                      <span className="ntp-pagination-ellipsis">...</span>
                    )}

                    {}
                    <button
                      key="next"
                      onClick={() => setCurrentPage(Math.min(totalPagesCount, currentPage + 1))}
                      disabled={currentPage === totalPagesCount}
                      className="ntp-pagination-button"
                      title="Next page"
                    >
                      &rsaquo;
                      </button>

                    {}
                    <button
                      key="last"
                      onClick={() => setCurrentPage(totalPagesCount)}
                      disabled={currentPage === totalPagesCount}
                      className="ntp-pagination-button"
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
        );
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