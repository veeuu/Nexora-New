import React, { useState, useEffect } from 'react';
import { rowMatchesSearch, highlightText, Tooltip, createTooltipHandlers } from '../../utils/tableUtils';

const Financial = () => {
  const [filters, setFilters] = useState({
    stockPerformance: '',
    buyerHolder: '',
    mutualFundHolders: '',
    growth: ''
  });
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tooltip, setTooltip] = useState({ show: false, text: '', x: 0, y: 0 });

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDownloadCSV = () => {
    const headers = [
      'ID', 'Company Name', 'Domain', 'Industry',
      'Full Time Employees', 'Investor Website', 'Exchange', 'Address', 'City',
      'State', 'Country', 'Contact', 'Date & Time', 'Current Price', 'Market Cap',
      'Total Revenue', 'Revenue Growth', 'Profit Growth'
    ];

    const csvContent = [
      headers.join(','),
      ...filteredData.map(row => [
        row.id,
        row.companyName,
        row.domain,
        row.industry,
        row.fullTimeEmployees,
        row.investorWebsite,
        row.exchange,
        row.address,
        row.city,
        row.state,
        row.country,
        row.contact,
        row.dateTime,
        row.currentPrice,
        row.marketCap,
        row.totalRevenue,
        row.revenueGrowth,
        row.profitGrowth
      ].map(value => `"${String(value).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'financial_data.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/financial/wide');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // Ensure every row has the performance objects to prevent runtime errors
        const sanitizedData = data.map(row => ({
          ...row,
          dailyPerformance: row.dailyPerformance || {},
          weeklyPerformance: row.weeklyPerformance || {},
          monthlyPerformance: row.monthlyPerformance || {},
          quarterlyPerformance: row.quarterlyPerformance || {},
        }));
        setTableData(sanitizedData);
      } catch (e) {
        setError(e.message);
        console.error("Failed to fetch Financial data:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  const { handleMouseEnter, handleMouseLeave } = createTooltipHandlers(setTooltip);

  const filteredData = tableData
    .filter(row => {
      const matchesSearchTerm = !searchTerm || Object.values(row).some(value => {
        if (typeof value === 'string' || typeof value === 'number') {
          return String(value).toLowerCase().includes(searchTerm.toLowerCase());
        }
        if (typeof value === 'object' && value !== null) {
          return Object.values(value).some(nestedValue =>
            String(nestedValue).toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        return false;
      });

      const matchesFilters =
        (filters.stockPerformance === '' || (filters.stockPerformance === 'High' && row.revenueGrowth && parseFloat(row.revenueGrowth) > 10) || (filters.stockPerformance === 'Medium' && row.revenueGrowth && parseFloat(row.revenueGrowth) <= 10 && parseFloat(row.revenueGrowth) > 5) || (filters.stockPerformance === 'Low' && row.revenueGrowth && parseFloat(row.revenueGrowth) <= 5)) &&
        (filters.buyerHolder === '' || (filters.buyerHolder === 'Institutional' && row.marketCap && parseFloat(row.marketCap) > 10) || (filters.buyerHolder === 'Retail' && row.marketCap && parseFloat(row.marketCap) <= 10)) &&
        (filters.mutualFundHolders === '' || (filters.mutualFundHolders === 'High' && row.marketCap && parseFloat(row.marketCap) > 20) || (filters.mutualFundHolders === 'Medium' && row.marketCap && parseFloat(row.marketCap) <= 20 && parseFloat(row.marketCap) > 5) || (filters.mutualFundHolders === 'Low' && row.marketCap && parseFloat(row.marketCap) <= 5)) &&
        (filters.growth === '' || (filters.growth === 'High' && row.profitGrowth && parseFloat(row.profitGrowth) > 15) || (filters.growth === 'Medium' && row.profitGrowth && parseFloat(row.profitGrowth) <= 15 && parseFloat(row.profitGrowth) > 8) || (filters.growth === 'Low' && row.profitGrowth && parseFloat(row.profitGrowth) <= 8));

      return matchesSearchTerm && matchesFilters;
    })
    .sort((a, b) => {
      const aMatches = rowMatchesSearch(a, searchTerm);
      const bMatches = rowMatchesSearch(b, searchTerm);
      if (aMatches && !bMatches) return -1;
      if (!aMatches && bMatches) return 1;
      return 0;
    });

  if (loading) {
    return <div>Loading Financial data...</div>;
  }

  if (error) {
    return <div>Error fetching data: {error}</div>;
  }

  return (
    <div className="financial-section-container">
      <div className="header-controls">
        <h2>Financial</h2>
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
      </div>
      
      <div className="section-subtle-divider" />
      <div className="filters">
        {/* same filters */}
      </div>
      
      <div className="table-container" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>
            <tr>
              <th colSpan="6">About</th>
              <th colSpan="6">Location</th>
              <th colSpan="7">Finance</th>
            </tr>
            <tr>
              <th>ID</th>
              <th>Company Name</th>
              <th>Domain</th>
              <th>Industry</th>
              <th>Full Time employees</th>
              <th>Investor Website</th>
              
              <th>Exchange</th>
              <th>Address</th>
              <th>City</th>
              <th>State</th>
              <th>Country</th>
              <th>Contact</th>
              
              <th>Date & Time</th>
              <th>Current Price</th>
              <th>Market Cap</th>
              <th>Total Revenue</th>
              <th>Revenue Growth</th>
              <th>Profit Growth</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, index) => {
              const isHighlighted = rowMatchesSearch(row, searchTerm);
              return (
                <tr key={index} style={{ backgroundColor: isHighlighted ? '#fefce8' : 'transparent' }}>
                  <td onMouseEnter={(e) => handleMouseEnter(e, row.id)} onMouseLeave={handleMouseLeave}>
                    {highlightText(row.id, searchTerm)}
                  </td>
                  <td onMouseEnter={(e) => handleMouseEnter(e, row.companyName)} onMouseLeave={handleMouseLeave}>
                    {highlightText(row.companyName, searchTerm)}
                  </td>
                  <td onMouseEnter={(e) => handleMouseEnter(e, row.domain)} onMouseLeave={handleMouseLeave}>
                    {highlightText(row.domain, searchTerm)}
                  </td>
                  <td onMouseEnter={(e) => handleMouseEnter(e, row.industry)} onMouseLeave={handleMouseLeave}>
                    {highlightText(row.industry, searchTerm)}
                  </td>
                  <td onMouseEnter={(e) => handleMouseEnter(e, row.fullTimeEmployees)} onMouseLeave={handleMouseLeave}>
                    {highlightText(row.fullTimeEmployees, searchTerm)}
                  </td>
                  <td onMouseEnter={(e) => handleMouseEnter(e, row.investorWebsite)} onMouseLeave={handleMouseLeave}>
                    {highlightText(row.investorWebsite, searchTerm)}
                  </td>
                  <td onMouseEnter={(e) => handleMouseEnter(e, row.exchange)} onMouseLeave={handleMouseLeave}>
                    {highlightText(row.exchange, searchTerm)}
                  </td>
                  <td onMouseEnter={(e) => handleMouseEnter(e, row.address)} onMouseLeave={handleMouseLeave}>
                    {highlightText(row.address, searchTerm)}
                  </td>
                  <td onMouseEnter={(e) => handleMouseEnter(e, row.city)} onMouseLeave={handleMouseLeave}>
                    {highlightText(row.city, searchTerm)}
                  </td>
                  <td onMouseEnter={(e) => handleMouseEnter(e, row.state)} onMouseLeave={handleMouseLeave}>
                    {highlightText(row.state, searchTerm)}
                  </td>
                  <td onMouseEnter={(e) => handleMouseEnter(e, row.country)} onMouseLeave={handleMouseLeave}>
                    {highlightText(row.country, searchTerm)}
                  </td>
                  <td onMouseEnter={(e) => handleMouseEnter(e, row.contact)} onMouseLeave={handleMouseLeave}>
                    {highlightText(row.contact, searchTerm)}
                  </td>
                  <td onMouseEnter={(e) => handleMouseEnter(e, row.dateTime)} onMouseLeave={handleMouseLeave}>
                    {highlightText(row.dateTime, searchTerm)}
                  </td>
                  <td onMouseEnter={(e) => handleMouseEnter(e, row.currentPrice)} onMouseLeave={handleMouseLeave}>
                    {highlightText(row.currentPrice, searchTerm)}
                  </td>
                  <td onMouseEnter={(e) => handleMouseEnter(e, row.marketCap)} onMouseLeave={handleMouseLeave}>
                    {highlightText(row.marketCap, searchTerm)}
                  </td>
                  <td onMouseEnter={(e) => handleMouseEnter(e, row.totalRevenue)} onMouseLeave={handleMouseLeave}>
                    {highlightText(row.totalRevenue, searchTerm)}
                  </td>
                  <td onMouseEnter={(e) => handleMouseEnter(e, row.revenueGrowth)} onMouseLeave={handleMouseLeave}>
                    {highlightText(row.revenueGrowth, searchTerm)}
                  </td>
                  <td onMouseEnter={(e) => handleMouseEnter(e, row.profitGrowth)} onMouseLeave={handleMouseLeave}>
                    {highlightText(row.profitGrowth, searchTerm)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Tooltip tooltip={tooltip} />

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
        
        th:nth-child(1), td:nth-child(1) { width: 4%; }
        th:nth-child(2), td:nth-child(2) { width: 8%; }
        th:nth-child(3), td:nth-child(3) { width: 8%; }
        th:nth-child(4), td:nth-child(4) { width: 7%; }
        th:nth-child(5), td:nth-child(5) { width: 6%; }
        th:nth-child(6), td:nth-child(6) { width: 8%; }
        th:nth-child(7), td:nth-child(7) { width: 6%; }
        th:nth-child(8), td:nth-child(8) { width: 8%; }
        th:nth-child(9), td:nth-child(9) { width: 6%; }
        th:nth-child(10), td:nth-child(10) { width: 5%; }
        th:nth-child(11), td:nth-child(11) { width: 6%; }
        th:nth-child(12), td:nth-child(12) { width: 6%; }
        th:nth-child(13), td:nth-child(13) { width: 7%; }
        th:nth-child(14), td:nth-child(14) { width: 5%; }
        th:nth-child(15), td:nth-child(15) { width: 5%; }
        th:nth-child(16), td:nth-child(16) { width: 5%; }
        th:nth-child(17), td:nth-child(17) { width: 5%; }
        th:nth-child(18), td:nth-child(18) { width: 5%; }
        
        td { position: relative; }
        td:hover { background-color: #f9fafb; }
        
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

export default Financial;
