import apiFetch from '../../utils/apiFetch';
import { useState, useEffect, useRef } from 'react';
import { FaLinkedin, FaTimes, FaInfoCircle, FaLock, FaUnlock } from 'react-icons/fa';
import loadingGif from '../../assets/Data Loading GIF - Without Starhub.gif';
import { deductCredit } from '../../utils/credits';
import { markRevealed, getRevealedLocal, syncRevealedFromServer } from '../../utils/revealed';
import '../../styles/buyingGroup.css';

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
    } catch { /* show success regardless */ } finally {
      try {
        const existing = JSON.parse(localStorage.getItem('onDemandHistory') || '[]');
        const entry = {
          id: Date.now(),
          query: requestedName,
          filterType,
          section: sourcePage || 'Buying Group',
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
      style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.5)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(2px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: '460px', boxShadow: '0 24px 64px rgba(0,0,0,0.18)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ height: '4px', background: 'linear-gradient(90deg, #3b82f6, #6366f1)' }} />
        <div style={{ padding: '32px' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', width: '28px', height: '28px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '18px' }}>×</button>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '12px 0 8px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#f0fdf4', border: '2px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>Request Submitted</h3>
              <p style={{ margin: '0 0 24px', color: '#64748b', fontSize: '14px', lineHeight: '1.6' }}>We'll get back to you within <span style={{ fontWeight: '600', color: '#0f172a' }}>48 hours</span>.</p>
              <button onClick={onClose} style={{ padding: '9px 28px', backgroundColor: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>Close</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h3 style={{ margin: '0 0 6px', fontSize: '20px', fontWeight: '700', color: '#0f172a' }}>Request on Demand</h3>
              <p style={{ margin: '0 0 24px', color: '#64748b', fontSize: '14px', lineHeight: '1.6' }}>Can't find the company you're looking for? Submit a request and we'll add it.</p>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Company Domain</label>
              <input
                type="text"
                value={requestedName}
                onChange={(e) => setRequestedName(e.target.value)}
                placeholder="Enter company domain..."
                required
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: '20px', outline: 'none' }}
              />
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={onClose} style={{ padding: '9px 20px', backgroundColor: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>Cancel</button>
                <button type="submit" disabled={submitting || !requestedName.trim()} style={{ padding: '9px 24px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', opacity: submitting ? 0.7 : 1 }}>
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

const BuyingGroup = () => {
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedCategories, setSelectedCategories] = useState(new Set());
    const [orgChartHtml, setOrgChartHtml] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPanel, setShowPanel] = useState(false);
    const [showOrgLockPopup, setShowOrgLockPopup] = useState(false);
    const [personDetailsData, setPersonDetailsData] = useState({});
    const [orgChartUrl, setOrgChartUrl] = useState('');
    const [zoomLevel, setZoomLevel] = useState(80);
    const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
    const [revealedEmails, setRevealedEmails] = useState(() => {
        const data = getRevealedLocal();
        return new Set(Array.isArray(data.buyingGroupEmails) ? data.buyingGroupEmails : []);
    });
    const [revealedMobileDIDs, setRevealedMobileDIDs] = useState(() => {
        const data = getRevealedLocal();
        return new Set(Array.isArray(data.buyingGroupMobileDIDs) ? data.buyingGroupMobileDIDs : []);
    });
    const [orgChartRevealed, setOrgChartRevealed] = useState(() => {
        const data = getRevealedLocal();
        return new Set(Array.isArray(data.buyingGroupOrgCharts) ? data.buyingGroupOrgCharts : []);
    });
    const [onDemandModal, setOnDemandModal] = useState(null);
    const [exportToast, setExportToast] = useState(false);
    const iframeRef = useRef(null);
    const dropdownRef = useRef(null);

    // Cleanup blob URLs on unmount
    useEffect(() => {
        const onUpdate = () => {
            const data = getRevealedLocal();
            setRevealedEmails(new Set(Array.isArray(data.buyingGroupEmails) ? data.buyingGroupEmails : []));
            setRevealedMobileDIDs(new Set(Array.isArray(data.buyingGroupMobileDIDs) ? data.buyingGroupMobileDIDs : []));
            setOrgChartRevealed(new Set(Array.isArray(data.buyingGroupOrgCharts) ? data.buyingGroupOrgCharts : []));
        };
        window.addEventListener('revealedUpdated', onUpdate);
        syncRevealedFromServer().then(data => {
            if (data) {
                if (Array.isArray(data.buyingGroupEmails)) setRevealedEmails(new Set(data.buyingGroupEmails));
                if (Array.isArray(data.buyingGroupMobileDIDs)) setRevealedMobileDIDs(new Set(data.buyingGroupMobileDIDs));
                if (Array.isArray(data.buyingGroupOrgCharts)) setOrgChartRevealed(new Set(data.buyingGroupOrgCharts));
            }
        });
        return () => window.removeEventListener('revealedUpdated', onUpdate);
    }, []);

    useEffect(() => {
        return () => {
            if (orgChartUrl && orgChartUrl.startsWith('blob:')) {
                URL.revokeObjectURL(orgChartUrl);
            }
        };
    }, [orgChartUrl]);

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const response = await apiFetch('/api/buying-groups/companies');
                const data = await response.json();
                setCompanies(data.companies || []);
                if (data.companies && data.companies.length > 0) {
                    setSelectedCompany(data.companies[0]);
                }
            } catch (err) {
                setError('Failed to load companies');
            }
        };
        fetchCompanies();
    }, []);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await apiFetch('/api/buying-groups/categories');
                const data = await response.json();
                let fetchedCategories = data.categories || [];

                fetchedCategories = fetchedCategories.map(cat => cat === 'AI' ? 'AI/ML' : cat);

                const desiredOrder = ['AI/ML', 'CRM', 'Database', 'Cloud'];

                setCategories(desiredOrder);
            } catch (err) {
                setCategories(['AI/ML', 'CRM', 'Database', 'Cloud']);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchPersonDetails = async () => {
            try {
                const response = await apiFetch('/api/buying-groups/person-details');
                if (response.ok) {
                    const data = await response.json();
                    setPersonDetailsData(data);
                }
            } catch (err) {
                // Handle error silently
            }
        };
        fetchPersonDetails();
    }, []);

    useEffect(() => {
        if (!selectedCompany) return;

        // Revoke previous blob URL to avoid memory leaks
        if (orgChartUrl && orgChartUrl.startsWith('blob:')) {
            URL.revokeObjectURL(orgChartUrl);
        }

        const fetchOrgChart = async () => {
            setLoading(true);
            setError('');
            setOrgChartUrl('');
            try {
                const encodedCompanyName = encodeURIComponent(selectedCompany);
                const response = await apiFetch(`/api/buying-groups/${encodedCompanyName}/org-chart`);
                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(result.error || 'Failed to load org chart');
                }

                if (result.s3Url) {
                    // S3 URLs are public  load directly in iframe
                    setOrgChartUrl(result.s3Url);
                } else if (result.html) {
                    // Fallback: create a blob URL from the HTML string
                    const blob = new Blob([result.html], { type: 'text/html' });
                    setOrgChartUrl(URL.createObjectURL(blob));
                } else {
                    throw new Error('No chart data returned');
                }
            } catch (err) {
                setError('Failed to load org chart. Please try again.');
                setOrgChartUrl('');
            } finally {
                setTimeout(() => {
                    setLoading(false);
                }, 500);
            }
        };

        fetchOrgChart();
    }, [selectedCompany]);

    useEffect(() => {
        if (!iframeRef.current || !orgChartUrl) return;

        const handleMessage = (event) => {
            // Disabled auto-zoom calculation to respect user's default 80% zoom
        };

        window.addEventListener('message', handleMessage);

        const iframe = iframeRef.current;
        const onLoad = () => {
            // Apply zoom
            try {
                iframe.contentWindow.postMessage({ type: 'setZoom', zoomLevel }, '*');
            } catch {}
            // Re-apply active category highlight after iframe loads
            try {
                iframe.contentWindow.postMessage({
                    type: 'highlightCategory',
                    category: selectedCategory || 'ALL'
                }, '*');
            } catch {}
        };
        iframe.addEventListener('load', onLoad);

        return () => {
            window.removeEventListener('message', handleMessage);
            iframe.removeEventListener('load', onLoad);
        };
    }, [orgChartUrl]);

    useEffect(() => {
        if (!iframeRef.current || !orgChartUrl) return;

        const applyZoom = () => {
            try {
                iframeRef.current.contentWindow.postMessage({
                    type: 'setZoom',
                    zoomLevel: zoomLevel
                }, '*');
            } catch (err) {
                // Handle error silently
            }
        };

        setTimeout(applyZoom, 500);
    }, [zoomLevel, orgChartUrl]);

    useEffect(() => {
        if (!iframeRef.current || !orgChartUrl) return;

        try {
            iframeRef.current.contentWindow.postMessage({
                type: 'highlightCategory',
                category: selectedCategory || 'ALL'
            }, '*');
        } catch (err) {
            // Handle error silently
        }
    }, [selectedCategory, orgChartUrl]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsCompanyDropdownOpen(false);
            }
        };

        if (isCompanyDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isCompanyDropdownOpen]);

    const handleImageClick = () => {
        if (!orgChartRevealed.has(selectedCompany)) {
            setShowOrgLockPopup(true);
            return;
        }
        setShowPanel(true);
    };

    const handleClosePanel = () => {
        setShowPanel(false);
    };

    const handleZoomIn = () => {
        setZoomLevel(prev => Math.min(prev + 10, 200));
    };

    const handleZoomOut = () => {
        setZoomLevel(prev => Math.max(prev - 10, 30));
    };

    const handleResetZoom = () => {
        setZoomLevel(100);
    };

    const toggleEmailReveal = async (personIndex) => {
        const key = `${selectedCompany}-${personIndex}`;
        if (!revealedEmails.has(key)) {
            const ok = await deductCredit('buyingGroup', 1);
            if (!ok) return;
            markRevealed('buyingGroupEmails', key);
            setRevealedEmails(prev => new Set(prev).add(key));
        }
    };

    const toggleMobileDIDReveal = async (personIndex) => {
        const key = `${selectedCompany}-${personIndex}`;
        if (!revealedMobileDIDs.has(key)) {
            const ok = await deductCredit('buyingGroup', 1);
            if (!ok) return;
            markRevealed('buyingGroupMobileDIDs', key);
            setRevealedMobileDIDs(prev => new Set(prev).add(key));
        }
    };

    const isEmailRevealed = (personIndex) => {
        return revealedEmails.has(`${selectedCompany}-${personIndex}`);
    };

    const isMobileDIDRevealed = (personIndex) => {
        return revealedMobileDIDs.has(`${selectedCompany}-${personIndex}`);
    };

    const getCompanyPersons = () => {
        if (!selectedCompany || !personDetailsData[selectedCompany]) {
            return [];
        }

        let persons = personDetailsData[selectedCompany];

        if (selectedCategories.size > 0) {
            persons = persons.filter(person => {
                const personCategories = (person.category || '')
                    .split(',')
                    .map(cat => cat.trim())
                    .filter(cat => cat.length > 0);

                return personCategories.some(cat => selectedCategories.has(cat));
            });
        }

        return persons;
    };

    const companyPersons = getCompanyPersons();

    if (loading) {
        return (
            <div className="loading-container">
                <div className="skeleton-background">
                    <div className="skeleton-title" />

                    <div className="skeleton-filter-bar">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={`filter-${i}`} className="skeleton-filter-item" />
                        ))}
                    </div>

                    <div className="skeleton-divider" />

                    <div className="skeleton-table-header">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={`header-${i}`} className="skeleton-header-cell" />
                        ))}
                    </div>

                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(row => (
                        <div key={`row-${row}`} className={`skeleton-table-rows ${row % 2 === 0 ? 'even' : 'odd'}`}>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(col => (
                                <div key={`cell-${row}-${col}`} className="skeleton-cell" />
                            ))}
                        </div>
                    ))}
                </div>

                <div className="loading-gif-container">
                    <img 
                        src={loadingGif} 
                        alt="Loading" 
                        className="loading-gif"
                    />
                </div>
            </div>
        );
    }

    return (
        <>
        {onDemandModal && (
            <OnDemandModal
                filterType={onDemandModal.filterType}
                searchValue={onDemandModal.searchValue}
                sourcePage="Buying Group"
                onClose={() => setOnDemandModal(null)}
            />
        )}
        <div className="buying-group-container">
            <h1>Buying Group</h1>

            <div className="section-subtle-divider"></div>

            <div className="filters">
                <div className="filter-group">
                    <label>Company Name</label>
                    <div ref={dropdownRef} className="dropdown-container">
                        <button
                            onClick={() => setIsCompanyDropdownOpen(!isCompanyDropdownOpen)}
                            disabled={companies.length === 0}
                            className="dropdown-button"
                        >
                            <span>{selectedCompany || 'Search companies...'}</span>
                            <span className="dropdown-arrow">▼</span>
                        </button>
                        
                        {isCompanyDropdownOpen && (
                            <div className="dropdown-menu">
                                <input
                                    type="text"
                                    placeholder="Search companies..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="dropdown-search"
                                    autoFocus
                                />
                                {companies
                                    .filter(company => 
                                        company.toLowerCase().includes(searchQuery.toLowerCase())
                                    )
                                    .map((company, index) => (
                                        <div
                                            key={index}
                                            onClick={() => {
                                                setSelectedCompany(company);
                                                setIsCompanyDropdownOpen(false);
                                                setSearchQuery('');
                                            }}
                                            className={`dropdown-item ${selectedCompany === company ? 'selected' : ''}`}
                                        >
                                            <span>{company}</span>
                                            <FaLock size={14} style={{ color: '#9ca3af', marginLeft: '8px' }} />
                                        </div>
                                    ))}
                                {companies.filter(c => c.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                                    <>
                                        <div style={{ padding: '10px 12px', textAlign: 'center', color: '#999', fontSize: '13px' }}>
                                            Can't find it?
                                        </div>
                                        {searchQuery.trim() && (
                                            <div style={{ padding: '12px', borderTop: '1px solid #e5e7eb', textAlign: 'center' }}>
                                                <button
                                                    onClick={() => {
                                                        setOnDemandModal({ filterType: 'Company Domain', searchValue: searchQuery.trim() });
                                                        setIsCompanyDropdownOpen(false);
                                                        setSearchQuery('');
                                                    }}
                                                    style={{ padding: '7px 16px', backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}
                                                >
                                                    + Request on Demand
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                <div className="filter-group filter-group-highlight">
                    <div className="highlight-roles-box">Highlight Roles</div>
                    <div className="buying-group-filters">
                        <button
                            onClick={() => {
                                setSelectedCategories(new Set());
                                setSelectedCategory('ALL');
                            }}
                            className={`category-button ${selectedCategories.size === categories.length && categories.length > 0 ? 'active' : ''}`}
                        >
                            Reset
                        </button>
                        {categories.map((category, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    if (selectedCategories.has(category)) {
                                        setSelectedCategories(new Set());
                                        setSelectedCategory('All');
                                    } else {
                                        setSelectedCategories(new Set([category]));
                                        setSelectedCategory(category);
                                    }
                                }}
                                className={`category-button ${selectedCategories.has(category) ? 'active' : ''}`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="zoom-controls">
                <button
                    onClick={handleZoomOut}
                    className="zoom-button"
                    title="Zoom Out"
                >
                    −
                </button>

                <span className="zoom-display">
                    {zoomLevel}%
                </span>

                <button
                    onClick={handleZoomIn}
                    className="zoom-button"
                    title="Zoom In"
                >
                    +
                </button>

                <button
                    onClick={handleResetZoom}
                    className="reset-zoom-button"
                    title="Reset Zoom"
                >
                    Reset
                </button>

                <button
                    onClick={handleImageClick}
                    className="more-info-button"
                    title="View Team Details"
                >
                    <span className="more-info-button-span">
                        Contact Data
                        <FaInfoCircle size={14} />
                    </span>
                </button>
            </div>

            <div className="org-chart-container" style={{ position: 'relative' }}>
                {loading && (
                    <div className="org-chart-loading">
                        <p>Generating org chart...</p>
                    </div>
                )}

                {error && (
                    <div className="org-chart-error">
                        <p>{error}</p>
                    </div>
                )}

                {!loading && !error && orgChartUrl && (
                    <>
                        <iframe
                            ref={iframeRef}
                            src={orgChartUrl}
                            className="org-chart-iframe"
                            style={!orgChartRevealed.has(selectedCompany) ? { filter: 'blur(8px)', pointerEvents: 'none', userSelect: 'none' } : {}}
                            title={`Org Chart for ${selectedCompany}`}
                        />
                        {!orgChartRevealed.has(selectedCompany) && (
                            <div style={{
                                position: 'absolute', inset: 0,
                                display: 'flex', flexDirection: 'column',
                                alignItems: 'center', justifyContent: 'center',
                                gap: '12px', zIndex: 10
                            }}>
                                <div style={{
                                    background: 'rgba(255,255,255,0.92)',
                                    borderRadius: '12px', padding: '24px 32px',
                                    textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
                                    border: '1px solid #e2e8f0'
                                }}>
                                    <FaLock size={24} style={{ color: '#64748b', marginBottom: '10px' }} />
                                    <p style={{ margin: '0 0 4px', fontWeight: '700', fontSize: '15px', color: '#0f172a' }}>Org Chart Locked</p>
                                    <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#64748b' }}>Unlock to view the org chart for <strong>{selectedCompany}</strong></p>
                                    <button
                                        onClick={async () => {
                                            const ok = await deductCredit('buyingGroup', 1);
                                            if (!ok) return;
                                            markRevealed('buyingGroupOrgCharts', selectedCompany);
                                            setOrgChartRevealed(prev => { const s = new Set(prev); s.add(selectedCompany); return s; });
                                        }}
                                        style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '8px',
                                            padding: '10px 22px', background: '#2563eb', color: 'white',
                                            border: 'none', borderRadius: '8px', fontSize: '14px',
                                            fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit'
                                        }}
                                    >
                                        <FaUnlock size={14} /> Unlock Org Chart
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {!loading && !error && !orgChartUrl && (
                    <div className="org-chart-empty">
                        <p>Select a company to view org chart</p>
                    </div>
                )}
            </div>

            {showPanel && (
                <>
                    <div
                        onClick={handleClosePanel}
                        className="side-panel-overlay"
                    />

                    <div className="side-panel">
                        <div className="side-panel-header">
                            <div className="side-panel-title">
                                <h2>Organization</h2>
                                <p>Team Structure & Contacts</p>
                            </div>
                            <button
                                onClick={handleClosePanel}
                                className="side-panel-close-button"
                            >
                                <FaTimes size={20} />
                            </button>
                        </div>

                        <div className="side-panel-content">
                            <div className="company-info-box">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                    <div>
                                        <h3 className="company-info-label">Company Name</h3>
                                        <p className="company-name">{selectedCompany}</p>
                                    </div>
                                    {personDetailsData[selectedCompany]?.[0]?.linkedinProfile && personDetailsData[selectedCompany][0].linkedinProfile !== '-' && (
                                        <a 
                                            href={personDetailsData[selectedCompany][0].linkedinProfile}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ 
                                                color: '#0A66C2', 
                                                textDecoration: 'none',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                            }}
                                        >
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.475-2.236-1.986-2.236-1.081 0-1.722.722-2.004 1.418-.103.249-.129.597-.129.946v5.441h-3.554s.05-8.81 0-9.728h3.554v1.375c.427-.659 1.191-1.595 2.897-1.595 2.117 0 3.704 1.385 3.704 4.362v5.586zM5.337 8.855c-1.144 0-1.915-.759-1.915-1.71 0-.955.77-1.71 1.954-1.71 1.184 0 1.915.755 1.915 1.71 0 .951-.731 1.71-1.954 1.71zm1.575 11.597H3.762V9.624h3.15v10.828zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/>
                                            </svg>
                                        </a>
                                    )}
                                </div>

                                <div className="company-details-grid">
                                    {personDetailsData[selectedCompany]?.[0]?.employeeSize && (
                                        <div className="company-detail-item">
                                            <p className="company-detail-label">Employee Size</p>
                                            <p className="company-detail-value">
                                                {personDetailsData[selectedCompany][0].employeeSize}
                                            </p>
                                        </div>
                                    )}

                                    {personDetailsData[selectedCompany]?.[0]?.country && (
                                        <div className="company-detail-item">
                                            <p className="company-detail-label">Country</p>
                                            <p className="company-detail-value">
                                                {personDetailsData[selectedCompany][0].country}
                                            </p>
                                        </div>
                                    )}

                                    {personDetailsData[selectedCompany]?.[0]?.revenue && (
                                        <div className="company-detail-item">
                                            <p className="company-detail-label">Revenue</p>
                                            <p className="company-detail-value">
                                                {personDetailsData[selectedCompany][0].revenue}
                                            </p>
                                        </div>
                                    )}

                                    {personDetailsData[selectedCompany]?.[0]?.industry && (
                                        <div className="company-detail-item">
                                            <p className="company-detail-label">Industry</p>
                                            <p className="company-detail-value">
                                                {personDetailsData[selectedCompany][0].industry}
                                            </p>
                                        </div>
                                    )}

                                    {personDetailsData[selectedCompany]?.[0]?.companyPhone && (
                                        <div className="company-detail-item">
                                            <p className="company-detail-label">Company Phone</p>
                                            <p className="company-detail-value">
                                                {personDetailsData[selectedCompany][0].companyPhone}
                                            </p>
                                        </div>
                                    )}

                                    {personDetailsData[selectedCompany]?.[0]?.domain && (
                                        <div className="company-detail-item">
                                            <p className="company-detail-label">Domain</p>
                                            <p className="company-detail-value">
                                                {personDetailsData[selectedCompany][0].domain}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="panel-divider" />

                            <div className="team-members-section">
                                {exportToast && (
                                    <div className="export-toast">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10" />
                                            <line x1="12" y1="8" x2="12" y2="12" />
                                            <line x1="12" y1="16" x2="12.01" y2="16" />
                                        </svg>
                                        Reveal both email &amp; Phone Number for at least one contact first.
                                    </div>
                                )}
                                <div className="team-members-section-header">
                                    <h3>
                                        Team Members {selectedCategories.size > 0 ? `(${Array.from(selectedCategories).join(', ')})` : ''} ({companyPersons.length})
                                    </h3>
                                    {companyPersons.length > 0 && (
                                        <button
                                            className="contact-download-btn"
                                            title="Export only fully revealed contacts (email + Phone Number)"
                                            onClick={() => {
                                                const fullyRevealed = companyPersons.filter((_, i) =>
                                                    isEmailRevealed(i) && isMobileDIDRevealed(i)
                                                );
                                                if (fullyRevealed.length === 0) {
                                                    setExportToast(true);
                                                    setTimeout(() => setExportToast(false), 3000);
                                                    return;
                                                }
                                                const headers = ['Name', 'Designation', 'Email', 'Phone Number', 'LinkedIn', 'Company'];
                                                const rows = fullyRevealed.map(p => {
                                                    let url = p.linkedin || '';
                                                    url = url.replace(/^["']|["']$/g, '').trim();
                                                    if (url && !url.startsWith('http')) url = `https://linkedin.com/in/${url}`;
                                                    return [p.name || '', p.fullRole || p.designation || '', p.email || '', p.mobileDID || '', url, selectedCompany || '']
                                                        .map(v => `"${String(v).replace(/"/g, '""')}"`);
                                                });
                                                const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
                                                const blob = new Blob([csv], { type: 'text/csv' });
                                                const url = URL.createObjectURL(blob);
                                                const a = document.createElement('a');
                                                a.href = url;
                                                a.download = `${(selectedCompany || 'contacts').replace(/\s+/g, '_')}_contacts.csv`;
                                                a.click();
                                                URL.revokeObjectURL(url);
                                            }}
                                        >
                                            Export
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                <polyline points="7 10 12 15 17 10" />
                                                <line x1="12" y1="15" x2="12" y2="3" />
                                            </svg>
                                        </button>
                                    )}
                                </div>

                                <div className="team-members-list">
                                    {companyPersons.map((person, index) => {
                                        let linkedinUrl = person.linkedin || '';
                                        linkedinUrl = linkedinUrl.replace(/^["']|["']$/g, '').trim();
                                        if (linkedinUrl && !linkedinUrl.startsWith('http')) {
                                            linkedinUrl = `https://linkedin.com/in/${linkedinUrl}`;
                                        }

                                        const emailRevealed = isEmailRevealed(index);
                                        const mobileDIDRevealed = isMobileDIDRevealed(index);

                                        return (
                                            <div
                                                key={index}
                                                className="team-member-card"
                                            >
                                                <div className="team-member-header">
                                                    <div className="team-member-info">
                                                        <p className="team-member-name">{person.name}</p>
                                                        <p className="team-member-designation">{person.fullRole || person.designation}</p>
                                                    </div>
                                                    {linkedinUrl && (
                                                        <a
                                                            href={linkedinUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="linkedin-button"
                                                            title="Visit LinkedIn Profile"
                                                        >
                                                            <FaLinkedin size={14} color="white" />
                                                        </a>
                                                    )}
                                                </div>
                                                <div className="team-member-detail">
                                                    <div className="team-member-detail-header">
                                                        <p className="team-member-detail-label">Email</p>
                                                        <button
                                                            onClick={() => toggleEmailReveal(index)}
                                                            className="reveal-button"
                                                            title={emailRevealed ? "Email revealed" : "Click to reveal email"}
                                                            disabled={emailRevealed}
                                                        >
                                                            <FaLock size={12} />
                                                        </button>
                                                    </div>
                                                    <p className={`team-member-detail-value team-member-email ${emailRevealed ? 'revealed' : ''}`}>
                                                        {person.email}
                                                    </p>
                                                </div>
                                                {person.mobileDID && person.mobileDID !== '-' && (
                                                    <div className="team-member-detail">
                                                        <div className="team-member-detail-header">
                                                            <p className="team-member-detail-label">Phone Number</p>
                                                            <button
                                                                onClick={() => toggleMobileDIDReveal(index)}
                                                                className="reveal-button"
                                                                title={mobileDIDRevealed ? "Phone Number revealed" : "Click to reveal Phone Number"}
                                                                disabled={mobileDIDRevealed}
                                                            >
                                                                <FaLock size={12} />
                                                            </button>
                                                        </div>
                                                        <p className={`team-member-detail-value team-member-phone ${mobileDIDRevealed ? 'revealed' : ''}`}>
                                                            {person.mobileDID}
                                                        </p>
                                                    </div>
                                                )}
                                                {(!person.mobileDID || person.mobileDID === '-') && (
                                                    <div className="team-member-detail">
                                                        <p className="team-member-detail-label">Phone Number</p>
                                                        <p className="team-member-detail-value">
                                                            -
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>

        {/* Org Chart Lock Popup */}
        {showOrgLockPopup && (
            <div
                style={{
                    position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)',
                    zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backdropFilter: 'blur(2px)'
                }}
                onClick={() => setShowOrgLockPopup(false)}
            >
                <div
                    style={{
                        background: '#fff', borderRadius: '14px', width: '100%', maxWidth: '400px',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.15)', overflow: 'hidden'
                    }}
                    onClick={e => e.stopPropagation()}
                >
                    <div style={{ height: '4px', background: 'linear-gradient(90deg, #1a1f2e, #0891b2)' }} />
                    <div style={{ padding: '28px 28px 24px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: '0 0 10px' }}>
                            Org Chart Not Revealed
                        </h3>
                        <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6', margin: '0 0 22px' }}>
                            To access Contact Data for <strong>{selectedCompany}</strong>, you must first reveal the org chart. Click the unlock button on the org chart to proceed.
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setShowOrgLockPopup(false)}
                                style={{
                                    padding: '9px 22px', background: '#1a1f2e', color: '#fff',
                                    border: 'none', borderRadius: '8px', fontSize: '14px',
                                    fontWeight: '600', cursor: 'pointer'
                                }}
                            >
                                Got it
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
        </>
    );
};

export default BuyingGroup;
