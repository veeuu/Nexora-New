import { useState, useEffect, useRef } from 'react';
import loadingGif from '../../assets/Loading GIF - Clients.gif';
import '../../styles/keywords.css';

const Keywords = () => {
  const [filters, setFilters] = useState({ company: [], product: [] });
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilterMenu, setActiveFilterMenu] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 9;
  const filterRef = useRef(null);

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setActiveFilterMenu(null);
        setShowFilters(false);
      }
    };
    if (activeFilterMenu || showFilters) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [activeFilterMenu, showFilters]);

  const getUniqueCompanies = () => {
    return [...new Set(tableData.map(item => item.Company))].sort();
  };

  const getUniqueProducts = () => {
    return [...new Set(tableData.map(item => item['Products / Services']))].sort();
  };

  const filteredData = tableData.filter(row => {
    const companyMatch = filters.company.length === 0 || filters.company.includes(row.Company);
    const productMatch = filters.product.length === 0 || filters.product.includes(row['Products / Services']);
    return companyMatch && productMatch;
  });

  // Group data by company name
  const groupedData = filteredData.reduce((acc, row) => {
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
        <h2>Keywords</h2>
      </div>

      <div className="section-subtle-divider" />

      <div className="filter-section" ref={filterRef}>
        <div className="filter-wrapper">
          <div className="filter-group">
            <div className="filter-button-container">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="filter-button"
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f3f4f6';
                  e.target.style.borderColor = '#3b82f6';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'white';
                  e.target.style.borderColor = '#d1d5db';
                }}
              >
                <span>+ Filter</span>
              </button>

              {showFilters && (
                <div className="filter-dropdown">
                  {[
                    { label: 'Company Name', key: 'company' },
                    { label: 'Products / Services', key: 'product' }
                  ].map((opt) => (
                    <div
                      key={opt.key}
                      onClick={() => { setActiveFilterMenu(opt.key); setShowFilters(false); }}
                      className="filter-dropdown-item"
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                    >
                      {opt.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {activeFilterMenu === 'company' && (
              <div className="filter-menu">
                <div className="filter-menu-header">
                  <span>Company {filters.company.length > 0 && `(${filters.company.length})`}</span>
                  <button onClick={() => { setActiveFilterMenu(null); setFilters(prev => ({ ...prev, company: [] })); }} className="filter-menu-close-btn">✕</button>
                </div>
                <div className="filter-menu-dropdown">
                  <div onClick={() => { setFilters(prev => { const allCompanies = getUniqueCompanies(); return { ...prev, company: prev.company.length === allCompanies.length ? [] : allCompanies }; }); }} className={`filter-menu-option ${filters.company.length === getUniqueCompanies().length && filters.company.length > 0 ? 'selected' : ''}`} onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'} onMouseLeave={(e) => e.target.style.backgroundColor = filters.company.length === getUniqueCompanies().length && filters.company.length > 0 ? '#f3f4f6' : 'white'}>
                    <input type="checkbox" checked={filters.company.length === getUniqueCompanies().length && filters.company.length > 0} onChange={() => {}} />
                    All
                  </div>
                  {getUniqueCompanies().map((opt, idx) => (
                    <div key={idx} onClick={() => { setFilters(prev => { const updated = prev.company.includes(opt) ? prev.company.filter(c => c !== opt) : [...prev.company, opt]; return { ...prev, company: updated }; }); }} className={`filter-menu-option ${filters.company.includes(opt) ? 'selected' : ''}`} onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'} onMouseLeave={(e) => e.target.style.backgroundColor = filters.company.includes(opt) ? '#dbeafe' : 'white'}>
                      <input type="checkbox" checked={filters.company.includes(opt)} onChange={() => {}} />
                      {opt}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeFilterMenu === 'product' && (
              <div className="filter-menu">
                <div className="filter-menu-header">
                  <span>Product {filters.product.length > 0 && `(${filters.product.length})`}</span>
                  <button onClick={() => { setActiveFilterMenu(null); setFilters(prev => ({ ...prev, product: [] })); }} className="filter-menu-close-btn">✕</button>
                </div>
                <div className="filter-menu-dropdown">
                  <div onClick={() => { setFilters(prev => { const allProducts = getUniqueProducts(); return { ...prev, product: prev.product.length === allProducts.length ? [] : allProducts }; }); }} className={`filter-menu-option ${filters.product.length === getUniqueProducts().length && filters.product.length > 0 ? 'selected' : ''}`} onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'} onMouseLeave={(e) => e.target.style.backgroundColor = filters.product.length === getUniqueProducts().length && filters.product.length > 0 ? '#f3f4f6' : 'white'}>
                    <input type="checkbox" checked={filters.product.length === getUniqueProducts().length && filters.product.length > 0} onChange={() => {}} />
                    All
                  </div>
                  {getUniqueProducts().map((opt, idx) => (
                    <div key={idx} onClick={() => { setFilters(prev => { const updated = prev.product.includes(opt) ? prev.product.filter(p => p !== opt) : [...prev.product, opt]; return { ...prev, product: updated }; }); }} className={`filter-menu-option ${filters.product.includes(opt) ? 'selected' : ''}`} onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'} onMouseLeave={(e) => e.target.style.backgroundColor = filters.product.includes(opt) ? '#dbeafe' : 'white'}>
                      <input type="checkbox" checked={filters.product.includes(opt)} onChange={() => {}} />
                      {opt}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {filters.company.length > 0 && activeFilterMenu !== 'company' && (
              <div className="filter-tag">
                <span>Company: {filters.company.length} selected</span>
                <button onClick={() => setFilters(prev => ({ ...prev, company: [] }))} className="filter-tag-close-btn">✕</button>
              </div>
            )}

            {filters.product.length > 0 && activeFilterMenu !== 'product' && (
              <div className="filter-tag">
                <span>Product: {filters.product.length} selected</span>
                <button onClick={() => setFilters(prev => ({ ...prev, product: [] }))} className="filter-tag-close-btn">✕</button>
              </div>
            )}
          </div>
        </div>
      </div>

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
                  paginatedData.map((groupedRow, groupIdx) => {
                    const items = groupedRow.items || [groupedRow];
                    return (
                      <tr key={groupIdx} className="table-row-grouped">
                        <td className="table-cell-company">
                          {groupedRow.Company}
                        </td>
                        <td className="table-cell">
                          <div className="table-cell-content">
                            {items.map((row, idx) => (
                              <div key={idx} className="table-cell-item">
                                {row['Products / Services']}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="table-cell">
                          <div className="table-cell-content">
                            {items.map((row, idx) => (
                              <div key={idx} className="table-cell-item">
                                {row['Primary Category (Products/Services Keywords)']}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="table-cell">
                          <div className="table-cell-content">
                            {items.map((row, idx) => (
                              <div key={idx} className="table-cell-item">
                                {row['Secondary Category Keywords ']}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="table-cell">
                          <div className="table-cell-content">
                            {items.map((row, idx) => (
                              <div key={idx} className="table-cell-item">
                                {row['First Detected (Timeline Start)'] || 'N/A'}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="table-cell">
                          <div className="table-cell-content">
                            {items.map((row, idx) => (
                              <div key={idx} className="table-cell-item">
                                {row['Expansion Phase']}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="table-cell">
                          <div className="table-cell-content">
                            {items.map((row, idx) => (
                              <div key={idx} className="table-cell-item">
                                {row['Current Stage']}
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
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
