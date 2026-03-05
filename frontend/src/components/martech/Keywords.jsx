import { useState, useEffect, useRef } from 'react';
import loadingGif from '../../assets/Loading GIF - Clients.gif';
import '../../styles/keywords.css';

const Keywords = () => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    setLoading(true);
    fetch('/api/keywords')
      .then(res => res.json())
      .then(data => {
        setTableData(data.data || []);
      })
      .catch(err => {
        setTableData([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Group data by company name
  const groupedData = tableData.reduce((acc, row) => {
    const companyKey = row.Company;
    
    if (!acc[companyKey]) {
      acc[companyKey] = {
        ...row,
        items: [row]
      };
    } else {
      acc[companyKey].items.push(row);
    }
    
    return acc;
  }, {});

  const groupedDataArray = Object.values(groupedData);

  if (loading) {
    return (
      <div className="loading-overlay">
        <img src={loadingGif} alt="Loading" />
      </div>
    );
  }

  const totalPages = Math.ceil(groupedDataArray.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = groupedDataArray.slice(startIndex, startIndex + rowsPerPage);

  return (
    <div className="keywords-container">
      <div className="keywords-header">
        <h2>Keywords Surge</h2>
      </div>

      <div className="section-subtle-divider" />

      <div className="table-grid">
        <div className="table-grid-item">
          <div className="table-container">
            <table>
              <thead className="sticky-header">
                <tr>
                  <th className="table-cell-header">Company</th>
                  <th className="table-cell-header">Products / Services</th>
                  <th className="table-cell-header">Primary Category</th>
                  <th className="table-cell-header">Secondary Category</th>
                  <th className="table-cell-header">First Detected</th>
                  <th className="table-cell-header">Expansion Phase</th>
                  <th className="table-cell-header">Current Stage</th>
                </tr>
              </thead>
              <tbody>
                {tableData.length === 0 ? (
                  <tr><td colSpan="7" className="no-data-message">No data loaded</td></tr>
                ) : groupedDataArray.length === 0 ? (
                  <tr><td colSpan="7" className="no-data-message">No data matches filters</td></tr>
                ) : (
                  paginatedData.flatMap((groupedRow, groupIdx) => {
                    const items = groupedRow.items || [groupedRow];
                    return items.map((row, itemIdx) => (
                      <tr key={`${groupIdx}-${itemIdx}`} className={itemIdx === 0 ? "table-row-grouped" : "table-row-item"}>
                        {itemIdx === 0 && (
                          <td className="table-cell-company" rowSpan={items.length}>
                            {groupedRow.Company}
                          </td>
                        )}
                        <td className="table-cell">
                          {row['Products / Services']}
                        </td>
                        <td className="table-cell">
                          {row['Primary Category (Products/Services Keywords)']}
                        </td>
                        <td className="table-cell">
                          {row['Secondary Category Keywords ']}
                        </td>
                        <td className="table-cell">
                          {row['First Detected (Timeline Start)'] || '-'}
                        </td>
                        <td className="table-cell">
                          {row['Expansion Phase']}
                        </td>
                        <td className="table-cell">
                          {row['Current Stage']}
                        </td>
                      </tr>
                    ));
                  })
                )}
              </tbody>
            </table>
          </div>

          {groupedDataArray.length > 0 && (
            <div className="pagination-container">
              <div className="pagination-info">
                Page {currentPage} of {totalPages}
              </div>

              <div className="pagination-buttons">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="pagination-btn"
                  onMouseEnter={(e) => {
                    if (currentPage > 1) {
                      e.target.style.backgroundColor = '#f9fafb';
                      e.target.style.borderColor = '#9ca3af';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentPage > 1) {
                      e.target.style.backgroundColor = 'white';
                      e.target.style.borderColor = '#d1d5db';
                    }
                  }}
                  title="First page"
                >
                  ≪
                </button>

                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="pagination-btn"
                  onMouseEnter={(e) => {
                    if (currentPage > 1) {
                      e.target.style.backgroundColor = '#f9fafb';
                      e.target.style.borderColor = '#9ca3af';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentPage > 1) {
                      e.target.style.backgroundColor = 'white';
                      e.target.style.borderColor = '#d1d5db';
                    }
                  }}
                  title="Previous page"
                >
                  ‹
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(i => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    className={`pagination-btn-number ${i === currentPage ? 'active' : ''}`}
                    onMouseEnter={(e) => {
                      if (i !== currentPage) {
                        e.target.style.backgroundColor = '#f9fafb';
                        e.target.style.borderColor = '#9ca3af';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (i !== currentPage) {
                        e.target.style.backgroundColor = 'white';
                        e.target.style.borderColor = '#d1d5db';
                      }
                    }}
                  >
                    {i}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                  onMouseEnter={(e) => {
                    if (currentPage < totalPages) {
                      e.target.style.backgroundColor = '#f9fafb';
                      e.target.style.borderColor = '#9ca3af';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentPage < totalPages) {
                      e.target.style.backgroundColor = 'white';
                      e.target.style.borderColor = '#d1d5db';
                    }
                  }}
                  title="Next page"
                >
                  ›
                </button>

                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                  onMouseEnter={(e) => {
                    if (currentPage < totalPages) {
                      e.target.style.backgroundColor = '#f9fafb';
                      e.target.style.borderColor = '#9ca3af';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentPage < totalPages) {
                      e.target.style.backgroundColor = 'white';
                      e.target.style.borderColor = '#d1d5db';
                    }
                  }}
                  title="Last page"
                >
                  ≫
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Keywords;
