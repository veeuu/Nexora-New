import apiFetch from '../../utils/apiFetch';
import { useState, useEffect, useRef, useMemo } from 'react';
import { deductCredit } from '../../utils/credits';
import { markRevealed, getRevealedLocal, syncRevealedFromServer } from '../../utils/revealed';
import { rowMatchesSearch, highlightText, Tooltip, createTooltipHandlers } from '../../utils/tableUtils';
import loadingGif from '../../assets/Data Loading GIF - Without Starhub.gif';
import IntentPieChart from './IntentPieChart';
import { FaLock, FaUnlock, FaGlobe, FaLinkedin } from 'react-icons/fa';
import '../../styles/intent.css';

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
          section: sourcePage || 'Intent Data',
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

const IntentStatusVisualizer = ({ status }) => {
  const getStatusConfig = (status) => {
    const statusLower = String(status || '').toLowerCase().trim();
    
    // Greenfield: flat line in blue
    if (statusLower === 'greenfield' || statusLower === 'green field account') {
      return {
        type: 'line',
        color: '#3b82f6',
        bgColor: '#eff6ff',
        label: 'Greenfield'
      };
    } else if (statusLower === 'high') {
      return {
        type: 'bars',
        bars: 4,
        color: '#10b981',
        bgColor: '#ecfdf5',
        label: 'High'
      };
    } else if (statusLower === 'high-medium') {
      return {
        type: 'bars',
        bars: 3,
        color: '#34d399',
        bgColor: '#ecfdf5',
        label: 'High-Medium'
      };
    } else if (statusLower === 'medium') {
      return {
        type: 'bars',
        bars: 2,
        color: '#fbbf24',
        bgColor: '#fffbeb',
        label: 'Medium'
      };
    } else if (statusLower === 'low') {
      return {
        type: 'bars',
        bars: 1,
        color: '#f87171',
        bgColor: '#fef2f2',
        label: 'Low'
      };
    }
    
    return {
      type: 'bars',
      bars: 0,
      color: '#d1d5db',
      bgColor: '#f9fafb',
      label: 'Unknown'
    };
  };

  const config = getStatusConfig(status);

  return (
    <div
      className="status-visualizer"
      title={config.label}
    >
      {config.type === 'line' ? (
        <div
          className="status-visualizer-line"
          style={{
            backgroundColor: config.color,
            boxShadow: `0 2px 4px ${config.color}40`
          }}
        />
      ) : (
        [1, 2, 3, 4, 5].map((bar) => (
          <div
            key={bar}
            className="status-bar"
            style={{
              height: bar <= config.bars ? `${6 + bar * 4}px` : '4px',
              backgroundColor: bar <= config.bars ? config.color : '#e5e7eb',
              boxShadow: bar <= config.bars ? `0 2px 4px ${config.color}40` : 'none'
            }}
          />
        ))
      )}
    </div>
  );
};

const CustomDropdown = ({ value, onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="custom-dropdown-container">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="custom-dropdown-button"
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
      >
        <span>{value || 'All'}</span>
        <span className="custom-dropdown-arrow">▼</span>
      </button>

      {isOpen && (
        <div className="custom-dropdown-menu">
          <div
            onClick={() => {
              onChange('');
              setIsOpen(false);
            }}
            className={`custom-dropdown-item ${value === '' ? 'selected' : ''}`}
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
              className={`custom-dropdown-item ${value === option ? 'selected' : ''}`}
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

const Intent = () => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    accountName: [],
    intentStatus: []
  });
  const [tooltip, setTooltip] = useState({ show: false, text: '', x: 0, y: 0 });
  const [showFilters, setShowFilters] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [activeFilterMenu, setActiveFilterMenu] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [revealedRows, setRevealedRows] = useState(() => {
    const data = getRevealedLocal();
    return new Set(Array.isArray(data.intent) ? data.intent : []);
  });
  const [companySearchTerm, setCompanySearchTerm] = useState('');
  const [onDemandModal, setOnDemandModal] = useState(null);
  const rowsPerPage = 10;
  const filterRef = useRef(null);
  const [companyDetailsMap, setCompanyDetailsMap] = useState({});

  useEffect(() => {
    const onUpdate = () => {
      const data = getRevealedLocal();
      setRevealedRows(new Set(Array.isArray(data.intent) ? data.intent : []));
    };
    window.addEventListener('revealedUpdated', onUpdate);
    syncRevealedFromServer().then(data => {
      if (data && Array.isArray(data.intent)) {
        setRevealedRows(new Set(data.intent));
      }
    });
    return () => window.removeEventListener('revealedUpdated', onUpdate);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [intentRes, detailsRes] = await Promise.all([
          apiFetch('/api/intent'),
          apiFetch('/api/company-details')
        ]);
        if (!intentRes.ok) throw new Error(`HTTP error! status: ${intentRes.status}`);
        const data = await intentRes.json();
        setTableData(data);
        if (detailsRes.ok) {
          const details = await detailsRes.json();
          setCompanyDetailsMap(details);
        }
      } catch (e) {
        setError(e.message);
        setTableData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const { handleMouseEnter, handleMouseLeave } = createTooltipHandlers(setTooltip);

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => {
      const currentValues = prev[filterName];
      if (currentValues.includes(value)) {

        return { ...prev, [filterName]: currentValues.filter(v => v !== value) };
      } else {

        return { ...prev, [filterName]: [...currentValues, value] };
      }
    });
    setCurrentPage(1);
  };

  const goToPage = (page) => {
    setLoading(true);
    setCurrentPage(page);
    setTimeout(() => setLoading(false), 0);
  };
  const uniqueCompanies = useMemo(() => {
    if (!tableData || tableData.length === 0) return [];
    const seen = new Set();
    const result = [];
    for (const item of tableData) {
      const v = item.companyName;
      if (v && v.trim() && !seen.has(v)) {
        seen.add(v);
        result.push(v);
      }
    }
    return result.sort();
  }, [tableData]);

  const getUniqueOptions = (key) => {
    if (key === 'companyName') return uniqueCompanies;
    if (!tableData) return [];
    const allValues = tableData.map(item => item[key]);
    return [...new Set(allValues)].filter(v => v && v.trim()).sort();
  };

const getAccountCountByIntentStatus = (intentStatus) => {
    if (!tableData) return 0;
    const uniqueAccounts = new Set();
    tableData.forEach(row => {
      if (String(row.intentStatus).toLowerCase() === String(intentStatus).toLowerCase()) {
        uniqueAccounts.add(row.companyName);
      }
    });
    return uniqueAccounts.size;
  };

  const getPieChartData = () => {
    if (!tableData || tableData.length === 0) return [];
    
    const statusCounts = {};
    tableData.forEach(row => {
      // Only count rows with valid intent status (not null, undefined, or empty)
      if (row.intentStatus && String(row.intentStatus).trim()) {
        const status = String(row.intentStatus).trim();
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      }
    });

    const total = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);
    
    return Object.entries(statusCounts).map(([name, value]) => ({
      name,
      value,
      percentage: ((value / total) * 100).toFixed(1)
    }));
  };

  const hasMandatoryFilters = filters.intentStatus.length > 0;

  const filteredData = tableData
    .filter(row => {

      // Show all data by default (no mandatory filters required)
      if (filters.intentStatus.length > 0 && !filters.intentStatus.some(status => String(row.intentStatus).toLowerCase() === String(status).toLowerCase())) {
        return false;
      }

      if (filters.accountName.length > 0 && !filters.accountName.some(name => String(row.companyName).toLowerCase() === String(name).toLowerCase())) {
        return false;
      }

      const searchMatches = !searchTerm || Object.values(row).some(value =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      );

      return searchMatches;
    })
    .sort((a, b) => {
      // Revealed rows always first — match by company name
      const aRevealed = Array.from(revealedRows).some(k => k.endsWith(`-${a.companyName}`));
      const bRevealed = Array.from(revealedRows).some(k => k.endsWith(`-${b.companyName}`));
      if (aRevealed && !bRevealed) return -1;
      if (!aRevealed && bRevealed) return 1;

      // Sort by Intent Status (High > Medium > Low)
      const intentStatusOrder = { 'high': 0, 'medium': 1, 'low': 2 };
      const aStatus = String(a.intentStatus || '').toLowerCase();
      const bStatus = String(b.intentStatus || '').toLowerCase();
      const aOrder = intentStatusOrder[aStatus] !== undefined ? intentStatusOrder[aStatus] : 3;
      const bOrder = intentStatusOrder[bStatus] !== undefined ? intentStatusOrder[bStatus] : 3;
      if (aOrder !== bOrder) return aOrder - bOrder;

      const aMatches = rowMatchesSearch(a, searchTerm);
      const bMatches = rowMatchesSearch(b, searchTerm);
      if (aMatches && !bMatches) return -1;
      if (!aMatches && bMatches) return 1;
      return 0;
    });

  useEffect(() => {

  }, []);

  const handleDownloadCSV = () => {
    let dataToDownload = selectedRows.size > 0 
      ? filteredData.filter((_, index) => selectedRows.has(index))
      : filteredData;

    // Filter to only include revealed companies
    dataToDownload = dataToDownload.filter((row) => {
      // Find the actual index in filteredData to create the correct rowKey
      const actualIndex = filteredData.indexOf(row);
      const rowKey = `${actualIndex}-${row.companyName}`;
      return revealedRows.has(rowKey);
    });

    if (dataToDownload.length === 0) {
      alert('No revealed companies to download. Please reveal company details first.');
      return;
    }

    const headers = ['companyName', 'intentStatus'];
    const csvContent = [
      headers.join(','),
      ...dataToDownload.map(row => headers.map(h => `"${String(row[h] ?? '').replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'intent_data.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

  if (loading) {
    return (
      <div className="loading-container">
        {/* Background Full Page Skeleton (blurred) */}
        <div className="loading-skeleton-bg">
          {/* Title Skeleton */}
          <div className="skeleton-title" />

          {/* Filter Bar Skeleton */}
          <div className="skeleton-filter-bar">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={`filter-${i}`} className="skeleton-filter-item" />
            ))}
          </div>

          {/* Divider */}
          <div className="skeleton-divider" />

          {/* Table Header Skeleton */}
          <div className="skeleton-table-header">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={`header-${i}`} className="skeleton-header-cell" />
            ))}
          </div>

          {/* Table Rows Skeleton */}
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(row => (
            <div key={`row-${row}`} className={`skeleton-table-row ${row % 2 === 0 ? 'even' : 'odd'}`}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(col => (
                <div key={`cell-${row}-${col}`} className="skeleton-cell" />
              ))}
            </div>
          ))}
        </div>

        {/* Centered Loading GIF */}
        <div className="loading-gif-container">
          <img 
            src={loadingGif} 
            alt="Loading" 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="intent-container">
      {onDemandModal && (
        <OnDemandModal
          filterType={onDemandModal.filterType}
          searchValue={onDemandModal.searchValue}
          sourcePage="Intent"
          onClose={() => setOnDemandModal(null)}
        />
      )}
      {showSummary && (
        <div className="modal-overlay" onClick={() => setShowSummary(false)}>
          <div className="summary-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="summary-modal-header">
              <h2>Intent Data Summary - Analytics Overview</h2>
              <button
                className="close-button"
                onClick={() => setShowSummary(false)}
              >
                ✕
              </button>
            </div>
            <div className="summary-charts-grid">
              <div className="chart-item">
                {/* <h3 style={{ textAlign: 'center', marginBottom: '16px' }}>Intent Status Percentage Breakdown</h3> */}
                <IntentPieChart data={getPieChartData()} />
              </div>
            </div>
          </div>
        </div>
      )}
      {}
      {error && (
        <div className="error-message">
          <div className="error-icon">⚠</div>
          <div className="error-text">
            Error fetching data: {error}. Showing UI with no data.
          </div>
          <button
            onClick={() => setError(null)}
            className="error-close-btn"
          >
            ✕
          </button>
        </div>
      )}

      <div className="header-actions-fixed">
        <h2>Intent</h2>
        <div className="actions-right">
        </div>
      </div>

      <div style={{ marginBottom: '20px' }} ref={filterRef}>
        <div className="filter-controls-container">
          <div className="filter-controls-left">

          {}
          {activeFilterMenu !== 'intentStatus' && (
            <div className="intent-status-filter-button">
              <button
                onClick={() => setActiveFilterMenu('intentStatus')}
                className="filter-button"
              >
                <span>Intent Status <span style={{ color: '#ef4444', fontWeight: '600' }}>*</span></span>
              </button>
            </div>
          )}

          {}
          {activeFilterMenu !== 'accountName' && (
            <div className="filter-dropdown-wrapper-relative">
              <button
                onClick={() => setActiveFilterMenu('accountName')}
                className="filter-button"
              >
                <span>Company Name</span>
              </button>
            </div>
          )}

          {}
          {activeFilterMenu === 'accountName' && (
            <div className="filter-dropdown-wrapper">
              <div className="filter-dropdown-label">
                <span>Company Name</span>
                <button
                  onClick={() => {
                    setActiveFilterMenu(null);
                    setCompanySearchTerm('');
                    setFilters(prev => ({ ...prev, accountName: [] }));
                  }}
                  className="filter-close-button"
                >
                  ✕
                </button>
              </div>
              <div className="filter-dropdown-content">
                <div className="filter-dropdown-search">
                  <input
                    type="text"
                    placeholder="Search companies..."
                    value={companySearchTerm}
                    onChange={(e) => setCompanySearchTerm(e.target.value)}
                    className="company-search-input"
                  />
                </div>
                {(() => {
                  const allCompanies = getUniqueOptions('companyName');
                  const filtered = allCompanies.filter(company =>
                    company.toLowerCase().includes(companySearchTerm.toLowerCase())
                  );
                  const visible = filtered.slice(0, 100);
                  const hasMore = filtered.length > 100;
                  return (
                    <>
                      {visible.map((option, idx) => {
                        const isSelected = Array.isArray(filters.accountName) && filters.accountName.includes(option);
                        return (
                          <div
                            key={idx}
                            onClick={() => handleFilterChange('accountName', option)}
                            className={`filter-option ${isSelected ? 'selected' : ''}`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="filter-option-checkbox"
                            />
                            <span style={{ color: '#1f2937' }}>{option}</span>
                          </div>
                        );
                      })}
                      {hasMore && (
                        <div style={{ padding: '8px 12px', textAlign: 'center', color: '#6b7280', fontSize: '12px', background: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
                          Loading more
                        </div>
                      )}
                      {filtered.length === 0 && allCompanies.length > 0 && (
                        <div className="no-companies-found">Can't find it?</div>
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
                })()}

                {}
                <div className="filter-dropdown-footer">
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

          {}
          {activeFilterMenu === 'intentStatus' && (
            <div className="filter-dropdown-wrapper">
              <div className="filter-dropdown-label active">
                <span>Intent Status <span style={{ color: '#ef4444', fontWeight: '600' }}>*</span></span>
                <button
                  onClick={() => {
                    setActiveFilterMenu(null);
                    setFilters(prev => ({ ...prev, intentStatus: [] }));
                  }}
                  className="filter-close-button"
                >
                  ✕
                </button>
              </div>
              <div className="filter-dropdown-content">
                {getUniqueOptions('intentStatus')
                  .sort((a, b) => {
                    const countA = getAccountCountByIntentStatus(a);
                    const countB = getAccountCountByIntentStatus(b);
                    return countB - countA;
                  })
                  .map((option, idx) => {
                  const isSelected = Array.isArray(filters.intentStatus) && filters.intentStatus.includes(option);
                  return (
                    <div
                      key={idx}
                      onClick={() => handleFilterChange('intentStatus', option)}
                      className={`filter-option ${isSelected ? 'selected' : ''}`}
                      style={{ justifyContent: 'space-between' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="filter-option-checkbox"
                        />
                        {option}
                      </div>
                    </div>
                  );
                })}

                {}
                <div className="filter-dropdown-footer">
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

          {}
          {filters.accountName.length > 0 && activeFilterMenu !== 'accountName' && (
            <div className="filter-badge" onClick={() => setActiveFilterMenu('accountName')}>
              <span>Company Name: {filters.accountName.length} selected</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFilters(prev => ({ ...prev, accountName: [] }));
                }}
                className="filter-close-button"
              >
                ✕
              </button>
            </div>
          )}

          <div className="filter-controls-right">
            {/* <button className="download-csv-button download-csv-button-wrapper" onClick={handleDownloadCSV}>
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
      {/* Table always shows by default, no mandatory filter required */}

      <div className="table-container" style={{ maxHeight: '600px', height: '600px' }}>
        <table>
          <thead className="sticky-header">
            <tr>
              <th style={{ width: '40px', textAlign: 'center' }}>
                <input
                  type="checkbox"
                  checked={(() => {
                    const startIndex = (currentPage - 1) * rowsPerPage;
                    const endIndex = startIndex + rowsPerPage;
                    const currentPageRows = filteredData.slice(startIndex, endIndex);
                    return currentPageRows.length > 0 && currentPageRows.every((_, idx) => selectedRows.has(startIndex + idx));
                  })()}
                  onChange={(e) => {
                    const startIndex = (currentPage - 1) * rowsPerPage;
                    const endIndex = startIndex + rowsPerPage;
                    const currentPageRows = filteredData.slice(startIndex, endIndex);
                    
                    if (e.target.checked) {
                      const newSelected = new Set(selectedRows);
                      currentPageRows.forEach((_, idx) => newSelected.add(startIndex + idx));
                      setSelectedRows(newSelected);
                    } else {
                      const newSelected = new Set(selectedRows);
                      currentPageRows.forEach((_, idx) => newSelected.delete(startIndex + idx));
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

                    const actualAmount = await deductCredit('intent', toReveal.length);
                    if (!actualAmount) return;

                    const canReveal = toReveal.slice(0, actualAmount);
                    const blocked = toReveal.length - canReveal.length;

                    canReveal.forEach(rowKey => markRevealed('intent', rowKey));
                    setRevealedRows(prev => {
                      const newSet = new Set(prev);
                      canReveal.forEach(rowKey => newSet.add(rowKey));
                      return newSet;
                    });

                    if (blocked > 0) {
                      window.dispatchEvent(new CustomEvent('creditExhausted', {
                        detail: { section: 'intent', label: 'Intent', partial: true, revealed: canReveal.length, blocked }
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
              <th>Company Name</th>
              <th>Intent Status</th>
              <th>Intent Level</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              const totalPages = Math.ceil(filteredData.length / rowsPerPage);
              const startIndex = (currentPage - 1) * rowsPerPage;
              const endIndex = startIndex + rowsPerPage;
              const paginatedData = filteredData.slice(startIndex, endIndex);

              return paginatedData.map((row, idx) => {
                const isHighlighted = rowMatchesSearch(row, searchTerm);
                const actualIndex = startIndex + idx;
                const rowKey = `${actualIndex}-${row.companyName}`;
                const isRevealed = revealedRows.has(rowKey);
                return (
                  <tr key={idx} className={isHighlighted ? 'table-row-highlighted' : 'table-row-normal'}>
                    <td style={{ width: '40px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={selectedRows.has(actualIndex)}
                        onChange={(e) => {
                          const newSet = new Set(selectedRows);
                          if (e.target.checked) {
                            newSet.add(actualIndex);
                          } else {
                            newSet.delete(actualIndex);
                          }
                          setSelectedRows(newSet);
                        }}
                        style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                      />
                    </td>
                    <td style={{ textAlign: 'center', width: '80px' }}>
                      <button
                        onClick={async () => {
                          if (!isRevealed) {
                            const ok = await deductCredit('intent', 1);
                            if (!ok) return;
                            markRevealed('intent', rowKey);
                            setRevealedRows(prev => { const s = new Set(prev); s.add(rowKey); return s; });
                          }
                        }}
                        className={`reveal-button ${isRevealed ? 'reveal-button-unlocked' : 'reveal-button-locked'}`}
                        onMouseEnter={(e) => {
                          if (!isRevealed) {
                            e.currentTarget.style.backgroundColor = '#f3f4f6';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isRevealed) {
                            e.currentTarget.style.backgroundColor = 'transparent';
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
                    <td onMouseEnter={(e) => isRevealed && handleMouseEnter(e, row.companyName)} onMouseLeave={handleMouseLeave}>
                      {isRevealed ? (
                        <div className="company-name-revealed">
                          <div style={{ fontWeight: '600', color: '#1f2937' }}>{row.companyName}</div>
                          <div style={{ fontSize: '13px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                            {companyDetailsMap[row.companyName]?.domain && companyDetailsMap[row.companyName].domain !== 'N/A' && (
                              <a
                                href={companyDetailsMap[row.companyName].domain.startsWith('http') ? companyDetailsMap[row.companyName].domain : `https://${companyDetailsMap[row.companyName].domain}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: '#3b82f6', textDecoration: 'none', transition: 'opacity 0.2s' }}
                                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                                title={`Visit ${companyDetailsMap[row.companyName].domain}`}
                              >
                                <FaGlobe size={16} />
                              </a>
                            )}
                            {companyDetailsMap[row.companyName]?.linkedinUrl && (
                              <a
                                href={companyDetailsMap[row.companyName].linkedinUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: '#0a66c2', textDecoration: 'none', transition: 'opacity 0.2s' }}
                                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                                title="View LinkedIn Profile"
                              >
                                <FaLinkedin size={18} />
                              </a>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="company-name-blurred">
                          <FaLock size={14} style={{ color: '#6b7280', filter: 'blur(0px)' }} />
                          <span>••••••••••••••••••</span>
                        </div>
                      )}
                    </td>
                    <td onMouseEnter={(e) => handleMouseEnter(e, row.intentStatus)} onMouseLeave={handleMouseLeave}>
                      {highlightText(row.intentStatus, searchTerm)}
                    </td>
                    <td className="table-cell-center">
                      <IntentStatusVisualizer status={row.intentStatus} />
                    </td>
                  </tr>
                );
              });
            })()}
          </tbody>
        </table>
      </div>

      {}
      {filteredData.length > rowsPerPage && (
      <div className="pagination-container">
          <div className="pagination-info">
              Page {currentPage} of {Math.ceil(filteredData.length / rowsPerPage).toLocaleString()}
          </div>

          {}
          <div className="pagination-controls">
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
                              onClick={() => goToPage(1)}
                              disabled={currentPage === 1}
                              className={`pagination-button ${currentPage === 1 ? 'disabled' : ''}`}
                              title="First page"
                          >
                              &laquo;
                              </button>

                          {}
                          <button
                              key="prev"
                              onClick={() => goToPage(Math.max(1, currentPage - 1))}
                              disabled={currentPage === 1}
                              className={`pagination-button ${currentPage === 1 ? 'disabled' : ''}`}
                              title="Previous page"
                          >
                              &lsaquo;
                              </button>

                          {}
                          {startPage > 1 && (
                              <>
                                  <button
                                      key={1}
                                      onClick={() => goToPage(1)}
                                      className="pagination-button"
                                  >
                                      1
                                  </button>
                                  {startPage > 2 && <span className="pagination-ellipsis">...</span>}
                              </>
                          )}

                          {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(i => (
                              <button
                                  key={i}
                                  onClick={() => goToPage(i)}
                                  className={`pagination-button ${i === currentPage ? 'active' : ''}`}
                              >
                                  {i}
                              </button>
                          ))}

                          {endPage < totalPages && (
                              <>
                                  {endPage < totalPages - 1 && <span className="pagination-ellipsis">...</span>}
                                  <button
                                      key={totalPages}
                                      onClick={() => goToPage(totalPages)}
                                      className="pagination-button"
                                  >
                                      {totalPages}
                                  </button>
                              </>
                          )}

                          {}
                          <button
                              key="next"
                              onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
                              disabled={currentPage === totalPages}
                              className={`pagination-button ${currentPage === totalPages ? 'disabled' : ''}`}
                              title="Next page"
                          >
                              &rsaquo;
                              </button>

                          {}
                          <button
                              key="last"
                              onClick={() => goToPage(totalPages)}
                              disabled={currentPage === totalPages}
                              className={`pagination-button ${currentPage === totalPages ? 'disabled' : ''}`}
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

      <Tooltip tooltip={tooltip} />

    </div>
  );
};

export default Intent;