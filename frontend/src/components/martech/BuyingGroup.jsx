import apiFetch from '../../utils/apiFetch';
import { useState, useEffect, useRef } from 'react';
import { FaLinkedin, FaTimes, FaInfoCircle, FaLock } from 'react-icons/fa';
import loadingGif from '../../assets/Data Loading GIF - Without Starhub.gif';
import '../../styles/buyingGroup.css';

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
    const [personDetailsData, setPersonDetailsData] = useState({});
    const [orgChartUrl, setOrgChartUrl] = useState('');
    const [zoomLevel, setZoomLevel] = useState(80);
    const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
    const [revealedEmails, setRevealedEmails] = useState(new Set());
    const [revealedMobileDIDs, setRevealedMobileDIDs] = useState(new Set());
    const iframeRef = useRef(null);
    const dropdownRef = useRef(null);

    // Cleanup blob URLs on unmount
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

        // Scroll iframe content to horizontal center after load
        const iframe = iframeRef.current;
        const scrollToCenter = () => {
            try {
                const doc = iframe.contentDocument || iframe.contentWindow?.document;
                if (doc && doc.documentElement) {
                    const scrollWidth = doc.documentElement.scrollWidth;
                    const clientWidth = doc.documentElement.clientWidth;
                    doc.documentElement.scrollLeft = (scrollWidth - clientWidth) / 2;
                    doc.body.scrollLeft = (scrollWidth - clientWidth) / 2;
                }
            } catch (err) {
                // cross-origin fallback  ignore
            }
        };
        iframe.addEventListener('load', scrollToCenter);

        return () => {
            window.removeEventListener('message', handleMessage);
            iframe.removeEventListener('load', scrollToCenter);
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

        const highlightCategory = () => {
            try {
                iframeRef.current.contentWindow.postMessage({
                    type: 'highlightCategory',
                    category: selectedCategory || 'ALL'
                }, '*');
            } catch (err) {
                // Handle error silently
            }
        };

        const timer = setTimeout(highlightCategory, 1000);
        return () => clearTimeout(timer);
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

    const toggleEmailReveal = (personIndex) => {
        const key = `${selectedCompany}-${personIndex}`;
        setRevealedEmails(prev => new Set(prev).add(key));
    };

    const toggleMobileDIDReveal = (personIndex) => {
        const key = `${selectedCompany}-${personIndex}`;
        setRevealedMobileDIDs(prev => new Set(prev).add(key));
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
                        More
                        <FaInfoCircle size={14} />
                    </span>
                </button>
            </div>

            <div className="org-chart-container">
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
                    <iframe
                        ref={iframeRef}
                        src={orgChartUrl}
                        className="org-chart-iframe"
                        title={`Org Chart for ${selectedCompany}`}
                    />
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
                                <h3>
                                    Team Members {selectedCategories.size > 0 ? `(${Array.from(selectedCategories).join(', ')})` : ''} ({companyPersons.length})
                                </h3>

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
                                                            <FaLinkedin size={18} color="white" />
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
                                                            <p className="team-member-detail-label">Mobile DID</p>
                                                            <button
                                                                onClick={() => toggleMobileDIDReveal(index)}
                                                                className="reveal-button"
                                                                title={mobileDIDRevealed ? "Mobile DID revealed" : "Click to reveal mobile DID"}
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
                                                        <p className="team-member-detail-label">Mobile DID</p>
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
    );
};

export default BuyingGroup;
