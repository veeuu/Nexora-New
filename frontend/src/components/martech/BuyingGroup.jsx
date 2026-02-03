import { useState, useEffect } from 'react';
import { FaLinkedin } from 'react-icons/fa';

const BuyingGroup = () => {
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState('');
    const [orgChartHtml, setOrgChartHtml] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Fetch list of companies on component mount
    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/org-chart/companies');
                const data = await response.json();
                setCompanies(data.companies || []);
                if (data.companies && data.companies.length > 0) {
                    setSelectedCompany(data.companies[0]);
                }
            } catch (err) {
                console.error('Error fetching companies:', err);
                setError('Failed to load companies');
            }
        };
        fetchCompanies();
    }, []);

    // Fetch org chart when company changes
    useEffect(() => {
        if (!selectedCompany) return;

        const fetchOrgChart = async () => {
            setLoading(true);
            setError('');
            try {
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
        setSelectedCompany(e.target.value);
    };

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
                    <iframe
                        srcDoc={orgChartHtml}
                        style={{
                            width: '920px',
                            height: '520px',
                            border: 'none',
                            borderRadius: '6px',
                            display: 'block'
                        }}
                        title={`Org Chart for ${selectedCompany}`}
                    />
                )}
                
                {!loading && !error && !orgChartHtml && (
                    <p style={{ color: '#9ca3af', fontSize: '16px' }}>Select a company to view org chart</p>
                )}
            </div>

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
