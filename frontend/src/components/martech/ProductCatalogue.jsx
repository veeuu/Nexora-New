import React, { useState, useEffect } from 'react';
import { rowMatchesSearch, highlightText, Tooltip, createTooltipHandlers } from '../../utils/tableUtils.jsx';

const ProductCatalogue = () => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState('2025');
  const [filters, setFilters] = useState({
    prodName: '',
    category: '',
    subCategory: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [modalContent, setModalContent] = useState(null);
  const [tooltip, setTooltip] = useState({ show: false, text: '', x: 0, y: 0 });

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const handleYearChange = (year) => {
    setSelectedYear(year);
  };

  const handleDownloadCSV = (dataToDownload) => {
    if (dataToDownload.length === 0) return;

    const headers = ['prodName', 'category', 'subCategory', 'description'];

    const csvContent = [
      headers.join(','),
      ...dataToDownload.map(row =>
        headers.map(header => `"${String(row[header] ?? '').replace(/"/g, '""')}"`).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `product_catalogue_${selectedYear}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/product-catalogue?year=${selectedYear}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setTableData(data);
      } catch (e) {
        setError(e.message);
        console.error("Failed to fetch Product Catalogue data:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedYear]);

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
        return String(row[key]) === filters[key];
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

  const handleDescriptionClick = (description) => {
    setModalContent(description);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '600px',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        padding: '40px 20px'
      }}>
        {/* Loading Text */}
        <h3 style={{
          margin: '0 0 10px 0',
          color: '#1f2937',
          fontSize: '18px',
          fontWeight: '600'
        }}>
          Loading Product Catalogue
        </h3>

        {/* Subtext */}
        <p style={{
          margin: '0 0 30px 0',
          color: '#6b7280',
          fontSize: '14px',
          textAlign: 'center',
          maxWidth: '300px'
        }}>
          Fetching and processing product information...
        </p>

        {/* Progress Dots */}
        <div style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#3b82f6',
            animation: 'bounce 1.4s infinite'
          }} />
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#3b82f6',
            animation: 'bounce 1.4s infinite 0.2s'
          }} />
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#3b82f6',
            animation: 'bounce 1.4s infinite 0.4s'
          }} />
        </div>

        {/* Styles for animations */}
        <style>{`
          @keyframes bounce {
            0%, 80%, 100% {
              opacity: 0.3;
              transform: translateY(0);
            }
            40% {
              opacity: 1;
              transform: translateY(-10px);
            }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return <div>Error fetching data: {error}</div>;
  }

  return (
    <div className="product-catalogue-container">
      <h2>Product Catalogue</h2>
      <div className="header-actions">
        <div className="actions-left">
          <div className="search-bar">
            <svg className="search-folder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            </svg>
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="10" cy="10" r="7"></circle>
              <path d="m20 20-4.5-4.5"></path>
            </svg>
          </div>
          <button className="download-csv-button" onClick={() => handleDownloadCSV(filteredData)}>
            <svg className="csv-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="12" y1="13" x2="12" y2="17"></line>
              <line x1="8" y1="13" x2="8" y2="17"></line>
              <line x1="16" y1="13" x2="16" y2="17"></line>
            </svg>
            Download CSV
          </button>
        </div>
        <div className="actions-right">
          <div className="year-dropdown">
            <label className="year-label">Year :</label>
            <select 
              value={selectedYear}
              onChange={(e) => handleYearChange(e.target.value)}
              className="year-select"
            >
              <option value="2025">2025</option>
              <option value="2026">2026</option>
            </select>
          </div>
        </div>
      </div>
      <div className="section-subtle-divider" />
      
      <div className="filters">
        <div className="filter-group">
          <label>Product Name</label>
          <select 
            value={filters.prodName}
            onChange={(e) => handleFilterChange('prodName', e.target.value)}
          >
            <option value="">All</option>
            {getUniqueOptions('prodName').map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <label>Category</label>
          <select 
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            <option value="">All</option>
            {getUniqueOptions('category').map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Sub Category</label>
          <select 
            value={filters.subCategory}
            onChange={(e) => handleFilterChange('subCategory', e.target.value)}
          >
            <option value="">All</option>
            {getUniqueOptions('subCategory').map(subCat => (
              <option key={subCat} value={subCat}>{subCat}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="table-container">
        <table>
          <thead className="sticky-header">
            <tr>
              <th>Product Name</th>
              <th>Category</th>
              <th>Sub Category</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, index) => {
              const isHighlighted = rowMatchesSearch(row, searchTerm);
              return (
                <tr key={index} style={{ backgroundColor: isHighlighted ? '#fefce8' : 'transparent' }}>
                  <td onMouseEnter={(e) => handleMouseEnter(e, row.prodName)} onMouseLeave={handleMouseLeave}>
                    {highlightText(row.prodName, searchTerm)}
                  </td>
                  <td onMouseEnter={(e) => handleMouseEnter(e, row.category)} onMouseLeave={handleMouseLeave}>
                    {highlightText(row.category, searchTerm)}
                  </td>
                  <td onMouseEnter={(e) => handleMouseEnter(e, row.subCategory)} onMouseLeave={handleMouseLeave}>
                    {highlightText(row.subCategory, searchTerm)}
                  </td>
                  <td 
                    onClick={() => handleDescriptionClick(row.description)}
                    style={{ cursor: 'pointer', color: '#010810ff', textDecoration: 'underline' }}
                  >
                    {row.description ? highlightText(`${row.description.substring(0, 30)}...`, searchTerm) : 'N/A'}
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
            <h3>Product Description</h3>
            <p>{modalContent}</p>
            <button onClick={() => setModalContent(null)}>Close</button>
          </div>
        </div>
      )}

      <style jsx>{`
        h2 {
          margin: 0 0 15px 0;
        }

        .header-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
          gap: 15px;
        }

        .actions-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .actions-right {
          display: flex;
          gap: 15px;
          align-items: center;
        }

        .search-bar {
          position: relative;
          display: flex;
          align-items: center;
          width: 250px;
        }

        .search-folder-icon {
          position: absolute;
          left: 10px;
          width: 18px;
          height: 18px;
          color: #999;
          pointer-events: none;
        }

        .search-bar input {
          padding: 8px 12px 8px 35px;
          border: 1px solid #ddd;
          border-radius: 4px;
          width: 100%;
          font-size: 14px;
          transition: border-color 0.2s;
        }

        .search-bar input:focus {
          outline: none;
          border-color: #4CAF50;
          box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.1);
        }

        .search-icon {
          position: absolute;
          right: 10px;
          width: 18px;
          height: 18px;
          color: #999;
          cursor: pointer;
          transition: color 0.2s;
        }

        .search-icon:hover {
          color: #4CAF50;
        }

        .year-dropdown {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .year-label {
          font-weight: 600;
          font-size: 14px;
          margin: 0;
        }

        .year-select {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background-color: white;
          cursor: pointer;
          font-size: 14px;
        }

        .year-select:hover {
          border-color: #999;
        }

        .download-csv-button {
          padding: 8px 16px;
          background-color: #4CAF50;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: background-color 0.2s, box-shadow 0.2s;
        }

        .download-csv-button:hover {
          background-color: #45a049;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .download-csv-button:active {
          background-color: #3d8b40;
        }

        .csv-icon {
          width: 18px;
          height: 18px;
        }

        .section-subtle-divider {
          height: 1px;
          background-color: #e0e0e0;
          margin-bottom: 20px;
        }

        .filters {
          display: flex;
          gap: 15px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .filter-group label {
          font-weight: 600;
          font-size: 14px;
        }

        .filter-group select {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background-color: white;
          cursor: pointer;
        }

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
        
        th:nth-child(1), td:nth-child(1) { width: 20%; }
        th:nth-child(2), td:nth-child(2) { width: 20%; }
        th:nth-child(3), td:nth-child(3) { width: 20%; }
        th:nth-child(4), td:nth-child(4) { width: 40%; }
        
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
          white-space: pre-wrap;
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

export default ProductCatalogue;
