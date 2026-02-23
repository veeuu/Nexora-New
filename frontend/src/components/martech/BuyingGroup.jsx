import { useState, useEffect, useRef } from 'react';
import { FaLinkedin, FaTimes, FaInfoCircle } from 'react-icons/fa';
import loadingGif from '../../assets/Loading GIF - Clients.gif';

const BuyingGroup = () => {
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState('');
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
    const iframeRef = useRef(null);

useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const response = await fetch('/api/org-chart/companies');
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
                const response = await fetch('/api/org-chart/categories');
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
                const response = await fetch('/api/org-chart/person-details');
                if (response.ok) {
                    const data = await response.json();

                    setPersonDetailsData(data);
                } else {

                }
            } catch (err) {

            }
        };
        fetchPersonDetails();
    }, []);

useEffect(() => {
        if (!selectedCompany) return;

        const fetchOrgChart = async () => {
            setLoading(true);
            setError('');
            try {
                
                const generateResponse = await fetch('/api/org-chart/generate-selected', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ companies: [selectedCompany] })
                });

                if (!generateResponse.ok) {
                    console.warn('Could not pre-generate chart, will fetch on-demand');
                }

const encodedCompanyName = encodeURIComponent(selectedCompany);
                const chartUrl = `/api/org-chart/${encodedCompanyName}`;
                setOrgChartUrl(chartUrl);
                setOrgChartHtml('');
            } catch (err) {

                setError('Failed to generate org chart. Please try again.');
                setOrgChartUrl('');
            } finally {

                setTimeout(() => {
                    setLoading(false);
                }, 2000);
            }
        };

        fetchOrgChart();
    }, [selectedCompany]);

useEffect(() => {
        if (!iframeRef.current || !orgChartUrl) return;

        const iframe = iframeRef.current;

        const handleMessage = (event) => {
            // Disabled auto-zoom calculation to respect user's default 80% zoom
            // if (event.data && event.data.type === 'optimalZoomCalculated') {
            //     setZoomLevel(event.data.zoomLevel);
            // }
        };

        window.addEventListener('message', handleMessage);

        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, [orgChartUrl]);

useEffect(() => {
        if (!iframeRef.current || !orgChartUrl) return;

        const iframe = iframeRef.current;

const applyZoom = () => {
            try {
                iframe.contentWindow.postMessage({
                    type: 'setZoom',
                    zoomLevel: zoomLevel
                }, '*');
            } catch (err) {

            }
        };

setTimeout(applyZoom, 500);
    }, [zoomLevel, orgChartUrl]);

useEffect(() => {
        if (!iframeRef.current || !orgChartUrl) return;

        const iframe = iframeRef.current;

        const highlightCategory = () => {
            try {
                iframe.contentWindow.postMessage({
                    type: 'highlightCategory',
                    category: selectedCategory || 'All'
                }, '*');
            } catch (err) {

            }
        };

const timer = setTimeout(highlightCategory, 1000);
        return () => clearTimeout(timer);
    }, [selectedCategory, orgChartUrl]);

    const handleCompanyChange = (e) => {
        const companyName = e.target.value;
        setSelectedCompany(companyName);
        setShowPanel(false);
    };

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
        <div className="buying-group-container" style={{ padding: '20px', backgroundColor: 'white', minHeight: '100vh' }}>
            <h1 style={{ fontSize: 'clamp(2.0rem, 3vw, 2.0rem)', fontWeight: '700', color: '#1f2937', marginBottom: '20px' }}>
                Buying Group
            </h1>

            {}
            <div className="filters" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '20px' }}>
                <div className="filter-group">
                    <label>Company Name</label>
                    <select
                        value={selectedCompany}
                        onChange={handleCompanyChange}
                        disabled={companies.length === 0}
                    >
                        <option value="">Select a company...</option>
                        {companies.map((company, index) => (
                            <option key={index} value={company}>
                                {company}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="filter-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                    {}
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        <button
                            onClick={() => {
                                if (selectedCategories.size === categories.length) {
                                    setSelectedCategories(new Set());
                                    setSelectedCategory('');
                                } else {
                                    setSelectedCategories(new Set(categories));
                                    setSelectedCategory('');
                                }
                            }}
                            style={{
                                padding: '10px 16px',
                                border: selectedCategories.size === categories.length && categories.length > 0 ? '2px solid #3b82f6' : '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '14px',
                                fontWeight: selectedCategories.size === categories.length && categories.length > 0 ? '600' : '500',
                                backgroundColor: selectedCategories.size === categories.length && categories.length > 0 ? '#3b82f6' : 'white',
                                color: selectedCategories.size === categories.length && categories.length > 0 ? 'white' : '#374151',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                                if (selectedCategories.size !== categories.length || categories.length === 0) {
                                    e.target.style.borderColor = '#9ca3af';
                                    e.target.style.backgroundColor = '#f9fafb';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (selectedCategories.size !== categories.length || categories.length === 0) {
                                    e.target.style.borderColor = '#d1d5db';
                                    e.target.style.backgroundColor = 'white';
                                }
                            }}
                            >
                            All
                        </button>
                        {categories.map((category, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    const newSelected = new Set(selectedCategories);
                                    if (newSelected.has(category)) {
                                        newSelected.delete(category);
                                    } else {
                                        newSelected.add(category);
                                    }
                                    setSelectedCategories(newSelected);
                                    setSelectedCategory('');
                                }}
                                style={{
                                    padding: '10px 16px',
                                    border: selectedCategories.has(category) ? '2px solid #3b82f6' : '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    fontWeight: selectedCategories.has(category) ? '600' : '500',
                                    backgroundColor: selectedCategories.has(category) ? '#3b82f6' : 'white',
                                    color: selectedCategories.has(category) ? 'white' : '#374151',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={(e) => {
                                    if (!selectedCategories.has(category)) {
                                        e.target.style.borderColor = '#9ca3af';
                                        e.target.style.backgroundColor = '#f9fafb';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!selectedCategories.has(category)) {
                                        e.target.style.borderColor = '#d1d5db';
                                        e.target.style.backgroundColor = 'white';
                                    }
                                }}
                                >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {}
            <div style={{
                display: 'flex',
                gap: '10px',
                marginBottom: '15px',
                alignItems: 'center'
            }}>
                <button
                    onClick={handleZoomOut}
                    style={{
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        backgroundColor: 'white',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#374151',
                        transition: 'all 0.2s',
                        minWidth: '40px'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#f3f4f6';
                        e.target.style.borderColor = '#9ca3af';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'white';
                        e.target.style.borderColor = '#d1d5db';
                    }}
                    title="Zoom Out"
                >
                    −
                </button>

                <span style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    minWidth: '50px',
                    textAlign: 'center'
                }}>
                    {zoomLevel}%
                </span>

                <button
                    onClick={handleZoomIn}
                    style={{
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        backgroundColor: 'white',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#374151',
                        transition: 'all 0.2s',
                        minWidth: '40px'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#f3f4f6';
                        e.target.style.borderColor = '#9ca3af';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'white';
                        e.target.style.borderColor = '#d1d5db';
                    }}
                    title="Zoom In"
                >
                    +
                </button>

                <button
                    onClick={handleResetZoom}
                    style={{
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        backgroundColor: 'white',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '500',
                        color: '#374151',
                        transition: 'all 0.2s',
                        marginLeft: '10px'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#f3f4f6';
                        e.target.style.borderColor = '#9ca3af';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'white';
                        e.target.style.borderColor = '#d1d5db';
                    }}
                    title="Reset Zoom"
                >
                    Reset
                </button>

                <button
                    onClick={handleImageClick}
                    style={{
                        padding: '0',
                        border: 'none',
                        borderRadius: '50%',
                        backgroundColor: 'transparent',
                        cursor: 'pointer',
                        fontSize: '18px',
                        color: '#9ca3af',
                        transition: 'all 0.2s',
                        marginLeft: 'auto',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '40px',
                        height: '40px'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.color = '#6b7280';
                        e.target.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.color = '#9ca3af';
                        e.target.style.transform = 'scale(1)';
                    }}
                    title="View Team Details"
                >
                    <FaInfoCircle size={20} />
                </button>
            </div>

            {}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                border: '1px solid #e5e7eb',
                height: '520px',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {loading && (
                    <div style={{ textAlign: 'center', color: '#6b7280', padding: '40px 20px' }}>
                        <p>Generating org chart...</p>
                    </div>
                )}

                {error && (
                    <div style={{ textAlign: 'center', color: '#dc2626', padding: '40px 20px' }}>
                        <p>{error}</p>
                    </div>
                )}

                {!loading && !error && orgChartUrl && (
                    <iframe
                        ref={iframeRef}
                        src={orgChartUrl}
                        style={{
                            width: '100%',
                            height: '100%',
                            border: 'none',
                            borderRadius: '6px'
                        }}
                        title={`Org Chart for ${selectedCompany}`}
                    />
                )}

                {!loading && !error && !orgChartUrl && (
                    <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: '16px', padding: '40px 20px' }}>
                        <p>Select a company to view org chart</p>
                    </div>
                )}
            </div>

            {}
            {showPanel && (
                <>
                    {}
                    <div
                        onClick={handleClosePanel}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            zIndex: 9998,
                            animation: 'fadeIn 0.3s ease-in-out'
                        }}
                    />

                    {}
                    <div
                        style={{
                            position: 'fixed',
                            right: 0,
                            top: 0,
                            bottom: 0,
                            width: '520px',
                            backgroundColor: '#ffffff',
                            boxShadow: '-12px 0 40px rgba(0, 0, 0, 0.15)',
                            zIndex: 9999,
                            display: 'flex',
                            flexDirection: 'column',
                            animation: 'slideIn 0.3s ease-in-out'
                        }}
                    >
                        {}
                        <div style={{
                            padding: '32px 28px',
                            background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                            borderBottom: '1px solid #e8e8e8',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start'
                        }}>
                            <div style={{ flex: 1 }}>
                                <h2 style={{
                                    margin: 0,
                                    fontSize: '26px',
                                    fontWeight: '800',
                                    color: '#1a1a1a',
                                    letterSpacing: '-0.5px'
                                }}>
                                    Organization
                                </h2>
                                <p style={{
                                    margin: '6px 0 0 0',
                                    fontSize: '13px',
                                    color: '#888',
                                    fontWeight: '500'
                                }}>
                                    Team Structure & Contacts
                                </p>
                            </div>
                            <button
                                onClick={handleClosePanel}
                                style={{
                                    background: '#f0f0f0',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#666',
                                    transition: 'all 0.2s ease',
                                    borderRadius: '8px',
                                    marginLeft: '12px',
                                    flexShrink: 0
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = '#e0e0e0';
                                    e.target.style.color = '#1a1a1a';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = '#f0f0f0';
                                    e.target.style.color = '#666';
                                }}
                            >
                                <FaTimes size={20} />
                            </button>
                        </div>

                        {}
                        <div style={{
                            flex: 1,
                            overflowY: 'auto',
                            padding: '28px',
                            backgroundColor: '#ffffff'
                        }}>
                            {}
                            <div style={{
                                marginBottom: '28px',
                                padding: '16px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '10px',
                                border: '1px solid #e8e8e8'
                            }}>
                                <h3 style={{
                                    margin: '0 0 10px 0',
                                    fontSize: '11px',
                                    fontWeight: '700',
                                    color: '#666',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px'
                                }}>
                                    Company Name
                                </h3>
                                <p style={{
                                    margin: 0,
                                    fontSize: '17px',
                                    fontWeight: '700',
                                    color: '#1a1a1a',
                                    lineHeight: '1.6',
                                    wordBreak: 'break-word'
                                }}>
                                    {selectedCompany}
                                </p>
                            </div>

                            {}
                            <div style={{
                                height: '1px',
                                backgroundColor: '#e8e8e8',
                                marginBottom: '28px'
                            }} />

                            {}
                            <div>
                                <h3 style={{
                                    margin: '0 0 20px 0',
                                    fontSize: '11px',
                                    fontWeight: '700',
                                    color: '#666',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px'
                                }}>
                                    Team Members {selectedCategories.size > 0 ? `(${Array.from(selectedCategories).join(', ')})` : ''} ({companyPersons.length})
                                </h3>

                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '14px'
                                }}>
                                    {companyPersons.map((person, index) => {

                                        let linkedinUrl = person.linkedin || '';
                                        linkedinUrl = linkedinUrl.replace(/^["']|["']$/g, '').trim();
                                        if (linkedinUrl && !linkedinUrl.startsWith('http')) {
                                            linkedinUrl = `https://linkedin.com/in/${linkedinUrl}`;
                                        }

                                        return (
                                            <div
                                                key={index}
                                                style={{
                                                    padding: '16px',
                                                    backgroundColor: '#ffffff',
                                                    borderRadius: '10px',
                                                    border: '1px solid #e8e8e8',
                                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                                                    cursor: 'default'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = '#ffffff';
                                                    e.currentTarget.style.borderColor = '#d0d0d0';
                                                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.1)';
                                                    e.currentTarget.style.transform = 'translateY(-3px)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = '#ffffff';
                                                    e.currentTarget.style.borderColor = '#e8e8e8';
                                                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                }}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                                    <div style={{ flex: 1 }}>
                                                        <p style={{
                                                            margin: '0 0 6px 0',
                                                            fontSize: '15px',
                                                            fontWeight: '700',
                                                            color: '#1a1a1a'
                                                        }}>
                                                            {person.name}
                                                        </p>
                                                        <p style={{
                                                            margin: '0',
                                                            fontSize: '11px',
                                                            color: '#0a66c2',
                                                            fontWeight: '700',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.5px'
                                                        }}>
                                                            {person.designation}
                                                        </p>
                                                    </div>
                                                    {linkedinUrl && (
                                                        <a
                                                            href={linkedinUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            style={{
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                width: '36px',
                                                                height: '36px',
                                                                backgroundColor: '#0a66c2',
                                                                borderRadius: '8px',
                                                                textDecoration: 'none',
                                                                transition: 'all 0.2s ease',
                                                                cursor: 'pointer',
                                                                boxShadow: '0 2px 6px rgba(10, 102, 194, 0.25)',
                                                                marginLeft: '10px',
                                                                flexShrink: 0
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.target.style.backgroundColor = '#084a94';
                                                                e.target.style.transform = 'scale(1.15)';
                                                                e.target.style.boxShadow = '0 4px 12px rgba(10, 102, 194, 0.4)';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.target.style.backgroundColor = '#0a66c2';
                                                                e.target.style.transform = 'scale(1)';
                                                                e.target.style.boxShadow = '0 2px 6px rgba(10, 102, 194, 0.25)';
                                                            }}
                                                            title="Visit LinkedIn Profile"
                                                        >
                                                            <FaLinkedin size={18} color="white" />
                                                        </a>
                                                    )}
                                                </div>
                                                <p style={{
                                                    margin: '10px 0 0 0',
                                                    fontSize: '12px',
                                                    color: '#666',
                                                    wordBreak: 'break-all',
                                                    lineHeight: '1.5'
                                                }}>
                                                    {person.email}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    <style>{`
                        @keyframes fadeIn {
                            from {
                                opacity: 0;
                            }
                            to {
                                opacity: 1;
                            }
                        }

                        @keyframes slideIn {
                            from {
                                transform: translateX(100%);
                            }
                            to {
                                transform: translateX(0);
                            }
                        }
                    `}</style>
                </>
            )}

            <style>{`
                .filters {
                    display: flex;
                    gap: 15px;
                    flex-wrap: wrap;
                }

                .filter-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .filter-group label {
                    font-size: 14px;
                    font-weight: 500;
                    color: #374151;
                }

                .filter-group select {
                    padding: 10px 12px;
                    border: 1px solid #d1d5db;
                    border-radius: 6px;
                    font-size: 14px;
                    font-family: inherit;
                    background-color: white;
                    cursor: pointer;
                    transition: border-color 0.2s;
                }

                .filter-group select:focus {
                    outline: none;
                    border-color: #3b82f6;
                }

                .filter-group select:hover {
                    border-color: #9ca3af;
                }

                .filter-group select:disabled {
                    background-color: #f3f4f6;
                    cursor: not-allowed;
                    opacity: 0.6;
                }
            `}</style>
        </div>
    );
};

export default BuyingGroup;
