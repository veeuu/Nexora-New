import React, { useState, useEffect } from 'react';
import { rowMatchesSearch, highlightText, Tooltip, createTooltipHandlers } from '../../../utils/tableUtils';
import * as SiIcons from 'react-icons/si';

// Generic Custom Dropdown Component (without icons)
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
        <span style={{ fontSize: '12px' }}>▼</span>
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

// Custom Dropdown Component with Icons for Technology/Category
const CustomTechDropdown = ({ value, onChange, options, renderIcon }) => {
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
        <span style={{ fontSize: '12px' }}>▼</span>
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
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
              onMouseLeave={(e) => e.target.style.backgroundColor = value === option ? '#dbeafe' : 'white'}
            >
              {renderIcon(option)}
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
  const [filters, setFilters] = useState({
    companyName: '',
    technology: '',
    purchasePrediction: '',
    category: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [modalContent, setModalContent] = useState(null);
  const [tooltip, setTooltip] = useState({ show: false, text: '', x: 0, y: 0 });

  // Icon mapping for technologies and categories
  const getTechIcon = (techName) => {
    if (!techName) return null;
    
    const techLower = techName.toLowerCase();
    
    // Check for SAP or VMware anywhere in the name (priority check)
    if (techLower.includes('sap')) {
      return 'SiSap';
    }
    if (techLower.includes('vmware')) {
      return 'SiVmware';
    }
    
    // Map technology names to react-icons component names
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
    
    const iconName = iconMap[techLower];
    return iconName;
  };

  // Render icon component
  const renderTechIcon = (techName) => {
    const iconName = getTechIcon(techName);
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
        title={techName}
      />
    );
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const handleDownloadCSV = () => {
    if (filteredData.length === 0) return;

    const headers = [
      'companyName', 'domain', 'category', 'technology',
      'purchaseProbability', 'purchasePrediction', 'ntpAnalysis'
    ];

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
    link.setAttribute('download', 'ntp_data.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/ntp');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setTableData(data);
      } catch (e) {
        setError(e.message);
        console.error("Failed to fetch NTP data:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getUniqueOptions = (key) => {
    if (!tableData) return [];
    const allValues = tableData.map(item => item[key]);
    return [...new Set(allValues)].sort();
  };

  const { handleMouseEnter, handleMouseLeave } = createTooltipHandlers(setTooltip);

  const filteredData = tableData
    .filter(row => {
      const filterMatches = Object.keys(filters).every(key => {
        if (!filters[key]) return true;
        const rowKey = key === 'companyName' ? 'companyName' : key;
        return String(row[rowKey]) === filters[key];
      });

      const searchMatches = !searchTerm || Object.values(row).some(value =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      );

      return filterMatches && searchMatches;
    })
    .sort((a, b) => {
      const aMatches = rowMatchesSearch(a, searchTerm);
      const bMatches = rowMatchesSearch(b, searchTerm);
      if (aMatches && !bMatches) return -1;
      if (!aMatches && bMatches) return 1;
      return 0;
    });

  const handleAnalysisClick = (analysis) => {
    setModalContent(analysis);
  };

  if (loading) {
    return <div></div>;
  }

  if (error) {
    return <div>Error fetching data: {error}</div>;
  }

  return (
    <div className="ntp-container">
      <div className="header-actions">
        <h2>NTP®</h2>
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
          <CustomDropdown
            value={filters.companyName}
            onChange={(value) => handleFilterChange('companyName', value)}
            options={getUniqueOptions('companyName')}
          />
        </div>
        
        <div className="filter-group">
          <label>Purchase Prediction</label>
          <CustomDropdown
            value={filters.purchasePrediction}
            onChange={(value) => handleFilterChange('purchasePrediction', value)}
            options={getUniqueOptions('purchasePrediction')}
          />
        </div>
        
        <div className="filter-group">
          <label>Category</label>
          <CustomTechDropdown
            value={filters.category}
            onChange={(value) => handleFilterChange('category', value)}
            options={getUniqueOptions('category')}
            renderIcon={renderTechIcon}
          />
        </div>

        <div className="filter-group">
          <label>Technology</label>
          <CustomTechDropdown
            value={filters.technology}
            onChange={(value) => handleFilterChange('technology', value)}
            options={getUniqueOptions('technology')}
            renderIcon={renderTechIcon}
          />
        </div>

      </div>
      
      <div className="table-container">
        <table>
          <thead className="sticky-header">
            <tr>
              <th>Company Name</th>
              <th>Domain</th> {/* Domain column remains */}
              <th>Category</th>
              <th>Technology</th>
              <th>Purchase Propensity (%)</th>
              <th>Purchase Prediction</th>
              <th>NTP Analysis</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, index) => {
              const isHighlighted = rowMatchesSearch(row, searchTerm);
              return (
                <tr key={index} style={{ backgroundColor: isHighlighted ? '#fefce8' : 'transparent' }}>
                  <td onMouseEnter={(e) => handleMouseEnter(e, row.companyName)} onMouseLeave={handleMouseLeave}>
                    {highlightText(row.companyName, searchTerm)}
                  </td>
                  <td onMouseEnter={(e) => handleMouseEnter(e, row.domain)} onMouseLeave={handleMouseLeave}>
                    {highlightText(row.domain, searchTerm)}
                  </td>
                  <td onMouseEnter={(e) => handleMouseEnter(e, row.category)} onMouseLeave={handleMouseLeave}>
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                      {renderTechIcon(row.category)}
                      {highlightText(row.category, searchTerm)}
                    </span>
                  </td>
                  <td onMouseEnter={(e) => handleMouseEnter(e, row.technology)} onMouseLeave={handleMouseLeave}>
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                      {renderTechIcon(row.technology)}
                      {highlightText(row.technology, searchTerm)}
                    </span>
                  </td>
                  <td onMouseEnter={(e) => handleMouseEnter(e, row.purchaseProbability)} onMouseLeave={handleMouseLeave}>
                    {highlightText(row.purchaseProbability, searchTerm)}
                  </td>
                  <td onMouseEnter={(e) => handleMouseEnter(e, row.purchasePrediction)} onMouseLeave={handleMouseLeave}>
                    {highlightText(row.purchasePrediction, searchTerm)}
                  </td>
                  <td 
                    onClick={() => handleAnalysisClick(row.ntpAnalysis)}
                    style={{ cursor: 'pointer', color: '#010810ff', textDecoration: 'underline' }}
                  >
                    {row.ntpAnalysis ? highlightText(`${row.ntpAnalysis.substring(0, 30)}...`, searchTerm) : 'N/A'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

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

            <style jsx>{`
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
        
        th:nth-child(1), td:nth-child(1) { width: 15%; }
        th:nth-child(2), td:nth-child(2) { width: 15%; }
        th:nth-child(3), td:nth-child(3) { width: 12%; }
        th:nth-child(4), td:nth-child(4) { width: 12%; }
        th:nth-child(5), td:nth-child(5) { width: 12%; }
        th:nth-child(6), td:nth-child(6) { width: 12%; }
        th:nth-child(7), td:nth-child(7) { width: 22%; }
        
        td { position: relative; }
        td:hover { background-color: #f9fafb; }
        
        th {
          background-color: #f8f9fa;
          font-weight: 600;
        }
        
        tr:hover {
          background-color: #f5f5f5;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          padding: 20px;
          border-radius: 8px;
          max-width: 500px;
          width: 90%;
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }

        .modal-content h3 {
          margin-top: 0;
        }

        .modal-content p {
          white-space: pre-wrap; /* Allows text to wrap inside the modal */
          word-break: break-word;
        }

        .modal-content button {
          margin-top: 15px;
          padding: 8px 16px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .modal-content button:hover {
          background-color: #0056b3;
        }
      `}</style>
    </div>
  );
};

export default NTP;
