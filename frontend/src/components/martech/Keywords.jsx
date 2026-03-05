import { useState, useEffect, useRef } from 'react';
import loadingGif from '../../assets/Loading GIF - Clients.gif';
import KeywordsStageChart from './KeywordsStageChart';
import '../../styles/keywords.css';

const Keywords = () => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    currentStage: []
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [activeFilterMenu, setActiveFilterMenu] = useState(null);
  const filterRef = useRef(null);
  const rowsPerPage = 10;

  useEffect(() => {
    setLoading(true);
    fetch('/api/keywords')
      .then(res => res.json())
      .then(data => {
        // Normalize column names to handle trailing spaces
        const normalizedData = (data.data || []).map(row => {
          const normalized = {};
          Object.keys(row).forEach(key => {
            normalized[key.trim()] = row[key];
          });
          return normalized;
        });
        setTableData(normalizedData);
      })
      .catch(() => {
        setTableData([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => {
      const currentValues = prev[filterName];
      if (currentValues.includes(value)) {
        return { ...prev, [filterName]: currentValues.filter(v => v !== value) };
      } else {
        return { ...prev, [filterName]: [...currentValues, value] };
      }
    });
  };

  const getUniqueOptions = (key) => {
    if (!tableData) return [];
    const allValues = tableData.map(item => item[key]);
    return [...new Set(allValues)].filter(v => v && v.trim()).sort();
  };

  const getSummaryData = () => {
    return {
      totalCompanies: groupedDataArray.length,
      stageBreakdown: getUniqueOptions('Current Stage').map(stage => ({
        stage,
        count: groupedDataArray.filter(group => 
          (group.items || []).some(item => item['Current Stage'] === stage)
        ).length
      }))
    };
  };

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

  let groupedDataArray = Object.values(groupedData);

  // Apply filters
  if (filters.currentStage.length > 0) {
    groupedDataArray = groupedDataArray.map(group => ({
      ...group,
      items: group.items.filter(item => filters.currentStage.includes(item['Current Stage']))
    })).filter(group => group.items.length > 0);
  }

  if (loading) {
    return (
      <div className="loading-overlay">
        <img src={loadingGif} alt="Loading" />
      </div>
    );
  }

  const summaryData = getSummaryData();

  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = groupedDataArray.slice(startIndex, startIndex + rowsPerPage);

  return (
    <div className="keywords-container">
      {showSummary && (
        <div className="modal-overlay" onClick={() => setShowSummary(false)}>
          <div className="summary-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="summary-modal-header">
              <h2>Keywords Surge Summary - Analytics Overview</h2>
              <button
                className="close-button"
                onClick={() => setShowSummary(false)}
              >
                ✕
              </button>
            </div>
            <div className="summary-charts-grid" style={{ padding: '20px' }}>
              <div className="chart-item">
                <KeywordsStageChart data={summaryData.stageBreakdown} />
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="keywords-header">
        <h2>Keywords Surge</h2>
      </div>

      <div className="section-subtle-divider" />

      <div style={{ marginBottom: '0px' }} ref={filterRef}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="filter-button"
            >
              <span>+ Filter</span>
            </button>

            {showFilters && (
              <div className="filter-menu">
                {[
                  { label: 'Current Stage', key: 'currentStage', mandatory: false }
                ].map((filterOption) => (
                  <div
                    key={filterOption.key}
                    onClick={() => {
                      setActiveFilterMenu(filterOption.key);
                      setShowFilters(false);
                    }}
                    className="filter-menu-item"
                  >
                    {filterOption.label}
                    {filterOption.mandatory && (
                      <span className="filter-menu-item mandatory-indicator">*</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button className="view-summary-button" onClick={() => setShowSummary(true)}>
            <svg className="summary-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            View Summary
          </button>

          {activeFilterMenu === 'currentStage' && (
            <div className="filter-dropdown-wrapper">
              <div className="filter-dropdown-label">
                <span>Current Stage {Array.isArray(filters.currentStage) && filters.currentStage.length > 0 && `(${filters.currentStage.length})`}</span>
                <button
                  onClick={() => {
                    setActiveFilterMenu(null);
                    setFilters(prev => ({ ...prev, currentStage: [] }));
                  }}
                  className="filter-close-button"
                >
                  ✕
                </button>
              </div>
              <div className="filter-dropdown-content">
                <div
                  onClick={() => {
                    if (Array.isArray(filters.currentStage) && filters.currentStage.length === getUniqueOptions('Current Stage').length && getUniqueOptions('Current Stage').length > 0) {
                      setFilters(prev => ({ ...prev, currentStage: [] }));
                    } else {
                      setFilters(prev => ({ ...prev, currentStage: getUniqueOptions('Current Stage') }));
                    }
                  }}
                  className="filter-option"
                >
                  <input
                    type="checkbox"
                    checked={Array.isArray(filters.currentStage) && filters.currentStage.length === getUniqueOptions('Current Stage').length && getUniqueOptions('Current Stage').length > 0}
                    onChange={() => {}}
                    className="filter-option-checkbox"
                  />
                  All
                </div>
                {getUniqueOptions('Current Stage').map((option, idx) => {
                  const isSelected = Array.isArray(filters.currentStage) && filters.currentStage.includes(option);
                  return (
                    <div
                      key={idx}
                      onClick={() => handleFilterChange('currentStage', option)}
                      className={`filter-option ${isSelected ? 'selected' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="filter-option-checkbox"
                      />
                      <span style={{ color: '#1f2937' }}>{option}</span>
                    </div>
                  );
                })}

                <div className="filter-dropdown-footer">
                  <button
                    onClick={() => {
                      setActiveFilterMenu(null);
                    }}
                    className="filter-save-button"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
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
                          {row['Secondary Category Keywords']}
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

          {groupedDataArray.length > rowsPerPage && (
            <div className="pagination-container">
              <div className="pagination-info">
                Page {currentPage} of {Math.ceil(groupedDataArray.length / rowsPerPage).toLocaleString()}
              </div>

              <div className="pagination-controls">
                {(() => {
                  const totalPages = Math.ceil(groupedDataArray.length / rowsPerPage);
                  const maxPagesToShow = 5;
                  let startPage = 1;
                  let endPage = Math.min(maxPagesToShow, totalPages);

                  if (currentPage > maxPagesToShow) {
                    startPage = currentPage - Math.floor(maxPagesToShow / 2);
                    endPage = startPage + maxPagesToShow - 1;

                    if (endPage > totalPages) {
                      endPage = totalPages;
                      startPage = Math.max(1, endPage - maxPagesToShow + 1);
                    }
                  }

                  return (
                    <>
                      <button
                        key="first"
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className={`pagination-button ${currentPage === 1 ? 'disabled' : ''}`}
                        title="First page"
                      >
                        «
                      </button>

                      <button
                        key="prev"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className={`pagination-button ${currentPage === 1 ? 'disabled' : ''}`}
                        title="Previous page"
                      >
                        ‹
                      </button>

                      {startPage > 1 && (
                        <>
                          <button
                            key={1}
                            onClick={() => setCurrentPage(1)}
                            className="pagination-button"
                          >
                            1
                          </button>
                          {startPage > 2 && <span className="pagination-ellipsis">...</span>}
                        </>
                      )}

                      {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(i => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i)}
                          className={`pagination-button ${i === currentPage ? 'active' : ''}`}
                        >
                          {i}
                        </button>
                      ))}

                      {endPage < totalPages && (
                        <>
                          {endPage < totalPages - 1 && <span className="pagination-ellipsis">...</span>}
                          <button
                            key={totalPages}
                            onClick={() => setCurrentPage(totalPages)}
                            className="pagination-button"
                          >
                            {totalPages}
                          </button>
                        </>
                      )}

                      <button
                        key="next"
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className={`pagination-button ${currentPage === totalPages ? 'disabled' : ''}`}
                        title="Next page"
                      >
                        ›
                      </button>

                      <button
                        key="last"
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className={`pagination-button ${currentPage === totalPages ? 'disabled' : ''}`}
                        title="Last page"
                      >
                        »
                      </button>
                    </>
                  );
                })()}
              </div>

              <div className="pagination-results">
                Showing {((currentPage - 1) * rowsPerPage) + 1}-{Math.min(currentPage * rowsPerPage, groupedDataArray.length)} of {groupedDataArray.length.toLocaleString()} results
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Keywords;
