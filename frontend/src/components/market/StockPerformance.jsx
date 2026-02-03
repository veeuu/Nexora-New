import React, { useState, useEffect } from 'react';

const StockPerformance = () => {
  const [filters, setFilters] = useState({
    stockPerformance: '',
    buyerHolder: '',
    mutualFundHolders: '',
    growth: ''
  });
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activePerformanceType, setActivePerformanceType] = useState('Daily');

  const [searchTerm, setSearchTerm] = useState('');

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/financial/long');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setTableData(data);
      } catch (e) {
        setError(e.message);
        console.error("Failed to fetch Financial data:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDownloadCSV = () => {
    const headers = [
      'ID', 'Company Name', 'Domain', 'Industry', 'Performance Type',
      'Date', 'Open', 'High', 'Low', 'Close', 'Volume', 'Adj. Close', 'Dividends'
    ];

    const csvContent = [
      headers.join(','),
      ...filteredData.map(row => {
        const performance = row.performance || {};
        const data = [
          row.id, row.companyName, row.domain, row.industry, row.performanceType,
          performance.Date, performance.Open, performance.High, performance.Low,
          performance.Close, performance.Volume, performance.Adjclose, performance.Dividends
        ];
        return data.map(value => `"${value || ''}"`).join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'stock_performance_data.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const filteredData = tableData.filter(row => {
    const matchesPerformanceType = row.performanceType === activePerformanceType;

    const matchesSearchTerm = Object.values(row).some(value => {
      if (typeof value === 'string' || typeof value === 'number') {
        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
      }
      if (typeof value === 'object' && value !== null) {
        // Search within nested objects like performance
        return Object.values(value).some(nestedValue =>
          String(nestedValue).toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      return false;
    });

    const matchesFilters =
      (filters.stockPerformance === '' ||
        (filters.stockPerformance === 'High' && row.revenueGrowth && parseFloat(row.revenueGrowth) > 10) ||
        (filters.stockPerformance === 'Medium' && row.revenueGrowth && parseFloat(row.revenueGrowth) <= 10 && parseFloat(row.revenueGrowth) > 5) ||
        (filters.stockPerformance === 'Low' && row.revenueGrowth && parseFloat(row.revenueGrowth) <= 5)) &&
      (filters.buyerHolder === '' ||
        (filters.buyerHolder === 'Institutional' && row.marketCap && parseFloat(row.marketCap) > 10) ||
        (filters.buyerHolder === 'Retail' && row.marketCap && parseFloat(row.marketCap) <= 10)) &&
      (filters.mutualFundHolders === '' ||
        (filters.mutualFundHolders === 'High' && row.marketCap && parseFloat(row.marketCap) > 20) ||
        (filters.mutualFundHolders === 'Medium' && row.marketCap && parseFloat(row.marketCap) <= 20 && parseFloat(row.marketCap) > 5) ||
        (filters.mutualFundHolders === 'Low' && row.marketCap && parseFloat(row.marketCap) <= 5)) &&
      (filters.growth === '' ||
        (filters.growth === 'High' && row.profitGrowth && parseFloat(row.profitGrowth) > 15) ||
        (filters.growth === 'Medium' && row.profitGrowth && parseFloat(row.profitGrowth) <= 15 && parseFloat(row.profitGrowth) > 8) ||
        (filters.growth === 'Low' && row.profitGrowth && parseFloat(row.profitGrowth) <= 8));

    return matchesPerformanceType && matchesSearchTerm && matchesFilters;
  });

  if (loading) {
    return <div>Loading Stock Performance data...</div>;
  }

  if (error) {
    return <div>Error fetching data: {error}</div>;
  }

  return (
    <div className="financial-section-container">
      <div className="header-controls">
        <h2>Stock Performance</h2>
        <div className="action-items">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <span className="search-icon">🔍</span>
          </div>
          <button className="download-csv-btn" onClick={handleDownloadCSV}>
            Download CSV
          </button>
        </div>
        <div className="performance-type-filters">
          {['Daily', 'Weekly', 'Monthly', 'Quarterly'].map(type => (
            <button
              key={type}
              onClick={() => setActivePerformanceType(type)}
              className={activePerformanceType === type ? 'active' : ''}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="section-subtle-divider" />
      <div className="filters">
        {/* same filters */}
      </div>

      <div className="table-container" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>
            <tr>
              <th>ID</th>
              <th>Company Name</th>
              <th>Domain</th>
              <th>Industry</th>
              <th>Date</th>
              <th>Open</th>
              <th>High</th>
              <th>Low</th>
              <th>Close</th>
              <th>Volume</th>
              <th>Adj. Close</th>
              <th>Dividends</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, index) => (
              <tr key={index}>
                <td>{row.id}</td>
                <td>{row.companyName}</td>
                <td>{row.domain}</td>
                <td>{row.industry}</td>
                <td>{row.performance?.Date || 'N/A'}</td>
                <td>{row.performance?.Open || 'N/A'}</td>
                <td>{row.performance?.High || 'N/A'}</td>
                <td>{row.performance?.Low || 'N/A'}</td>
                <td>{row.performance?.Close || 'N/A'}</td>
                <td>{row.performance?.Volume || 'N/A'}</td>
                <td>{row.performance?.Adjclose || 'N/A'}</td>
                <td>{row.performance?.Dividends || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <style jsx>{`
        .header-controls {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }
        .action-items {
          display: flex;
          gap: 10px;
          margin-left: auto;
        }
        .performance-type-filters {
          display: flex;
          gap: 10px;
        }
        .performance-type-filters button {
          padding: 8px 16px;
          border: 1px solid #ccc;
          background-color: #f5f5f5;
          color: #333;
          cursor: pointer;
          border-radius: 5px;
          font-weight: 500;
        }
        .performance-type-filters button.active {
          background-color: #1e90ff;
          color: white;
          border-color: #1e90ff;
        }
      `}</style>
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
        }
        
        th, td {
          padding: 12px 15px;
          text-align: left;
          border-bottom: 1px solid #ddd;
          white-space: nowrap;
        }
        
        th {
          background-color: #f8f9fa;
          font-weight: 600;
        }
        
        tr:hover {
          background-color: #f5f5f5;
        }
      `}</style>l
    </div>
  );
};

export default StockPerformance;