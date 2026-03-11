import { useState, useEffect, useRef } from 'react';
import loadingGif from '../../assets/Loading GIF - Clients.gif';
import '../../styles/keywords.css';

const Keywords = () => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    lifecycleStage: []
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showGlossary, setShowGlossary] = useState(false);
  const [glossaryData, setGlossaryData] = useState(null);
  const [activeFilterMenu, setActiveFilterMenu] = useState(null);
  const filterRef = useRef(null);
  const rowsPerPage = 10;

  useEffect(() => {
    setLoading(true);
    fetch('/api/keywords')
      .then(res => res.json())
      .then(data => {
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

    // Fetch glossary data
    fetch('/api/glossary')
      .then(res => res.json())
      .then(data => {
        setGlossaryData(data);
      })
      .catch(err => {
        console.error('Failed to fetch glossary:', err);
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

  let filteredData = tableData;

  if (filters.lifecycleStage.length > 0) {
    filteredData = filteredData.filter(item => filters.lifecycleStage.includes(item['Expansion Phase']));
  }

  if (loading) {
    return (
      <div className="loading-overlay">
        <img src={loadingGif} alt="Loading" />
      </div>
    );
  }

  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + rowsPerPage);

  return (
    <div className="keywords-container">
      {showGlossary && glossaryData && (
        <div className="modal-overlay" onClick={() => setShowGlossary(false)}>
          <div className="glossary-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="glossary-modal-header">
              <h2>Glossary</h2>
              <button className="close-button" onClick={() => setShowGlossary(false)}>✕</button>
            </div>
            
            <div className="glossary-modal-body">
              {/* Column Definitions Section */}
              <div className="glossary-section">
                <h3 className="glossary-section-title">Column Definitions</h3>
                <div className="glossary-definitions">
                  {glossaryData.columnDefinitions && glossaryData.columnDefinitions.map((def, idx) => (
                    <div key={idx} className="glossary-definition-item">
                      <div className="glossary-def-header">
                        <span className="glossary-number">{idx + 1}</span>
                        <span className="glossary-column-name">{def.columnName}</span>
                      </div>
                      <p className="glossary-meaning">{def.meaning}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lifecycle Stages Section */}
              <div className="glossary-section">
                <h3 className="glossary-section-title">Lifecycle Stages</h3>
                <div className="glossary-definitions">
                  {glossaryData.lifecycleStages && glossaryData.lifecycleStages.map((stage, idx) => (
                    <div key={idx} className="glossary-definition-item">
                      <div className="glossary-def-header">
                        <span className="glossary-number">{idx + 1}</span>
                        <span className="glossary-stage-name">{stage.stage}</span>
                      </div>
                      <p className="glossary-meaning">{stage.meaning}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="keywords-header">
        <h2>Keywords Surge</h2>
      </div>

      <div className="keywords-divider" />

      <div className="keywords-controls">
        <div style={{ position: 'relative' }} ref={filterRef}>
          <button onClick={() => setShowFilters(!showFilters)} className="filter-button">
            <span>+ Filter</span>
          </button>

          {showFilters && (
            <div className="filter-menu">
              {[{ label: 'Lifecycle Stage', key: 'lifecycleStage', mandatory: false }].map((filterOption) => (
                <div
                  key={filterOption.key}
                  onClick={() => {
                    setActiveFilterMenu(filterOption.key);
                    setShowFilters(false);
                  }}
                  className="filter-menu-item"
                >
                  {filterOption.label}
                  {filterOption.mandatory && <span className="filter-menu-item mandatory-indicator">*</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        <button className="view-summary-button" onClick={() => setShowGlossary(true)}>
          <svg className="summary-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          Glossary
        </button>

        {activeFilterMenu === 'lifecycleStage' && (
          <div className="filter-dropdown-wrapper">
            <div className="filter-dropdown-label">
              <span>Lifecycle Stage {Array.isArray(filters.lifecycleStage) && filters.lifecycleStage.length > 0 && `(${filters.lifecycleStage.length})`}</span>
              <button
                onClick={() => {
                  setActiveFilterMenu(null);
                  setFilters(prev => ({ ...prev, lifecycleStage: [] }));
                }}
                className="filter-close-button"
              >
                ✕
              </button>
            </div>
            <div className="filter-dropdown-content">
              <div
                onClick={() => {
                  if (Array.isArray(filters.lifecycleStage) && filters.lifecycleStage.length === getUniqueOptions('Expansion Phase').length && getUniqueOptions('Expansion Phase').length > 0) {
                    setFilters(prev => ({ ...prev, lifecycleStage: [] }));
                  } else {
                    setFilters(prev => ({ ...prev, lifecycleStage: getUniqueOptions('Expansion Phase') }));
                  }
                }}
                className="filter-option"
              >
                <input
                  type="checkbox"
                  checked={Array.isArray(filters.lifecycleStage) && filters.lifecycleStage.length === getUniqueOptions('Expansion Phase').length && getUniqueOptions('Expansion Phase').length > 0}
                  onChange={() => {}}
                  className="filter-option-checkbox"
                />
                All
              </div>
              {getUniqueOptions('Expansion Phase').map((option, idx) => {
                const isSelected = Array.isArray(filters.lifecycleStage) && filters.lifecycleStage.includes(option);
                return (
                  <div
                    key={idx}
                    onClick={() => handleFilterChange('lifecycleStage', option)}
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
                <button onClick={() => setActiveFilterMenu(null)} className="filter-save-button">Save</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="table-wrapper">
        <table className="keywords-table">
          <thead>
            <tr className="table-master-header">
              <th colSpan="6" className="table-master-header-cell">PRODUCTS & SERVICES MASTER TABLE — 100 Products · Renamed Lifecycle Stages · Deep Metadata</th>
            </tr>
            <tr className="table-column-headers">
              <th>PRODUCT / SERVICE ★</th>
              <th>PRIMARY CATEGORY</th>
              <th>SECONDARY CATEGORY</th>
              <th>FIRST DETECTED</th>
              <th>LIFECYCLE STAGE</th>
              <th>STAGE RANK(1-4)</th>
            </tr>
          </thead>
          <tbody>
            {tableData.length === 0 ? (
              <tr><td colSpan="6" className="no-data-message">No data loaded</td></tr>
            ) : filteredData.length === 0 ? (
              <tr><td colSpan="6" className="no-data-message">No data matches filters</td></tr>
            ) : (
              paginatedData.map((row, idx) => (
                <tr key={idx}>
                  <td>{row['Products / Services']}</td>
                  <td>{row['Primary Category (Products/Services Keywords)']}</td>
                  <td>{row['Secondary Category Keywords']}</td>
                  <td>{row['First Detected (Timeline Start)'] || '-'}</td>
                  <td>{row['Expansion Phase']}</td>
                  <td className="stage-rank-cell">
                    <div className="stage-rank-container">
                      <div className="stage-rank-bar-wrapper">
                        <div 
                          className="stage-rank-bar-filled"
                          style={{ width: `${(row['Current Stage'] || 0) * 25}%` }}
                        />
                        <div className="stage-rank-bar-empty" style={{ width: `${100 - ((row['Current Stage'] || 0) * 25)}%` }} />
                        <span className="stage-rank-value">{row['Current Stage']}</span>
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filteredData.length > rowsPerPage && (
        <div className="pagination-container">
          <div className="pagination-info">
            Page {currentPage} of {Math.ceil(filteredData.length / rowsPerPage).toLocaleString()}
          </div>

          <div className="pagination-controls">
            {(() => {
              const totalPages = Math.ceil(filteredData.length / rowsPerPage);
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
                      <button key={1} onClick={() => setCurrentPage(1)} className="pagination-button">1</button>
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
                      <button key={totalPages} onClick={() => setCurrentPage(totalPages)} className="pagination-button">{totalPages}</button>
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
            Showing {((currentPage - 1) * rowsPerPage) + 1}-{Math.min(currentPage * rowsPerPage, filteredData.length)} of {filteredData.length.toLocaleString()} results
          </div>
        </div>
      )}
    </div>
  );
};

export default Keywords;
