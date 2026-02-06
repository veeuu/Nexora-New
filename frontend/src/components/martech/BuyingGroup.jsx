import { useState, useEffect, useRef } from 'react';
import { FaLinkedin, FaTimes, FaInfoCircle } from 'react-icons/fa';

const BuyingGroup = () => {
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState('');
    const [selectedCompanyId, setSelectedCompanyId] = useState(null);
    const [orgChartHtml, setOrgChartHtml] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPanel, setShowPanel] = useState(false);
    const [personDetailsData, setPersonDetailsData] = useState({});
    const [infoIconHovered, setInfoIconHovered] = useState(false);
    const iframeRef = useRef(null);

    // Parse CSV data
    const parseCSV = (csvText) => {
        const lines = csvText.trim().split('\n');
        const headers = lines[0].split(',');
        const data = {};

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',');
            const row = {};
            headers.forEach((header, index) => {
                row[header.trim()] = values[index]?.trim();
            });

            const companyId = parseInt(row.companyId);
            if (!data[companyId]) {
                data[companyId] = [];
            }

            // Helper function to remove quotes from values
            const cleanValue = (value) => {
                if (!value) return value;
                return value.replace(/^["']|["']$/g, '').trim();
            };

            data[companyId].push({
                id: row.personName.toLowerCase().replace(/\s+/g, '-'),
                name: cleanValue(row.personName),
                designation: cleanValue(row.designation),
                email: cleanValue(row.email),
                linkedin: cleanValue(row.linkedin),
                position: {
                    x: parseInt(row.positionX),
                    y: parseInt(row.positionY),
                    width: parseInt(row.positionWidth),
                    height: parseInt(row.positionHeight)
                }
            });
        }

        return data;
    };

    // Fetch list of companies on component mount
    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/org-chart/companies');
                const data = await response.json();
                setCompanies(data.companies || []);
                if (data.companies && data.companies.length > 0) {
                    setSelectedCompany(data.companies[0]);
                    setSelectedCompanyId(1); // First company has ID 1
                }
            } catch (err) {
                console.error('Error fetching companies:', err);
                setError('Failed to load companies');
            }
        };
        fetchCompanies();
    }, []);

    // Fetch person details CSV on component mount
    useEffect(() => {
        const fetchPersonDetails = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/org-chart/person-details');
                if (response.ok) {
                    const csvText = await response.text();
                    const parsedData = parseCSV(csvText);
                    setPersonDetailsData(parsedData);
                }
            } catch (err) {
                console.error('Error loading person details:', err);
            }
        };
        fetchPersonDetails();
    }, []);

    // Fetch org chart when company changes
    useEffect(() => {
        if (!selectedCompany) return;

        const fetchOrgChart = async () => {
            setLoading(true);
            setError('');
            try {
                // First, request to generate the org chart for this specific company
                const generateResponse = await fetch('http://localhost:5000/api/org-chart/generate-selected', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ companies: [selectedCompany] })
                });

                if (!generateResponse.ok) {
                    console.warn('Could not pre-generate chart, will fetch on-demand');
                }

                // Then fetch the org chart
                const encodedCompanyName = encodeURIComponent(selectedCompany);
                const response = await fetch(`http://localhost:5000/api/org-chart/${encodedCompanyName}`);
                
                if (!response.ok) {
                    throw new Error('Failed to generate org chart');
                }
                
                const html = await response.text();
                setOrgChartHtml(html);
            } catch (err) {
                console.error('Error fetching org chart:', err);
                setError('Failed to generate org chart. Please try again.');
                setOrgChartHtml('');
            } finally {
                setLoading(false);
            }
        };

        fetchOrgChart();
    }, [selectedCompany]);

    const handleCompanyChange = (e) => {
        const companyName = e.target.value;
        setSelectedCompany(companyName);
        // Find the index of the selected company to use as ID
        const companyIndex = companies.indexOf(companyName);
        setSelectedCompanyId(companyIndex >= 0 ? companyIndex + 1 : null);
        setShowPanel(false);
    };

    const handleImageClick = () => {
        setShowPanel(true);
    };

    const handleClosePanel = () => {
        setShowPanel(false);
    };

    // Get persons for selected company
    const getCompanyPersons = () => {
        if (!selectedCompanyId || !personDetailsData[selectedCompanyId]) {
            return [];
        }
        return personDetailsData[selectedCompanyId];
    };

    const companyPersons = getCompanyPersons();

    return (
        <div className="buying-group-container" style={{ padding: '20px', backgroundColor: 'white', minHeight: '100vh' }}>
            <h1 style={{ fontSize: 'clamp(1.2rem, 2vw, 1.4rem)', fontWeight: '700', color: '#1f2937', marginBottom: '20px' }}>
                Buying Group
            </h1>

            {/* Filter Section */}
            <div className="filters" style={{ marginBottom: '20px' }}>
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
            </div>

            {/* Org Chart Container */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                border: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '520px',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Info Icon */}
                <div
                    style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        zIndex: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '40px',
                        height: '40px',
                        backgroundColor: infoIconHovered ? '#0a66c2' : '#f0f0f0',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: infoIconHovered ? '0 4px 12px rgba(10, 102, 194, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.1)'
                    }}
                    onMouseEnter={() => setInfoIconHovered(true)}
                    onMouseLeave={() => setInfoIconHovered(false)}
                    title="Click on the org chart to view team details"
                >
                    <FaInfoCircle
                        size={20}
                        style={{
                            color: infoIconHovered ? '#ffffff' : '#666',
                            transition: 'color 0.2s ease'
                        }}
                    />
                </div>

                {loading && (
                    <div style={{ textAlign: 'center', color: '#6b7280' }}>
                        <p>Generating org chart...</p>
                    </div>
                )}
                
                {error && (
                    <div style={{ textAlign: 'center', color: '#dc2626' }}>
                        <p>{error}</p>
                    </div>
                )}
                
                {!loading && !error && orgChartHtml && (
                    <div
                        ref={iframeRef}
                        onClick={handleImageClick}
                        style={{
                            position: 'relative',
                            width: '920px',
                            height: '520px',
                            cursor: 'pointer'
                        }}
                    >
                        <iframe
                            srcDoc={orgChartHtml}
                            style={{
                                width: '100%',
                                height: '100%',
                                border: 'none',
                                borderRadius: '6px',
                                display: 'block',
                                pointerEvents: 'none'
                            }}
                            title={`Org Chart for ${selectedCompany}`}
                        />
                    </div>
                )}
                
                {!loading && !error && !orgChartHtml && (
                    <p style={{ color: '#9ca3af', fontSize: '16px' }}>Select a company to view org chart</p>
                )}
            </div>

            {/* Side Panel */}
            {showPanel && (
                <>
                    {/* Overlay */}
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

                    {/* Panel */}
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
                        {/* Panel Header */}
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

                        {/* Panel Content */}
                        <div style={{
                            flex: 1,
                            overflowY: 'auto',
                            padding: '28px',
                            backgroundColor: '#ffffff'
                        }}>
                            {/* Company Name Section */}
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

                            {/* Divider */}
                            <div style={{
                                height: '1px',
                                backgroundColor: '#e8e8e8',
                                marginBottom: '28px'
                            }} />

                            {/* Team Members */}
                            <div>
                                <h3 style={{
                                    margin: '0 0 20px 0',
                                    fontSize: '11px',
                                    fontWeight: '700',
                                    color: '#666',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px'
                                }}>
                                    Team Members ({companyPersons.length})
                                </h3>

                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '14px'
                                }}>
                                    {companyPersons.map((person, index) => {
                                        // Clean LinkedIn URL - remove quotes and ensure proper format
                                        let linkedinUrl = person.linkedin || '';
                                        linkedinUrl = linkedinUrl.replace(/^["']|["']$/g, '').trim();
                                        if (linkedinUrl && !linkedinUrl.startsWith('http')) {
                                            linkedinUrl = 'https://' + linkedinUrl;
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
