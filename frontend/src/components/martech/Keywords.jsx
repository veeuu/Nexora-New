import apiFetch from '../../utils/apiFetch';
import { useState, useEffect, useRef } from 'react';
import loadingGif from '../../assets/Data Loading GIF - Without Starhub.gif';
import '../../styles/keywords.css';

const FilterPill = ({ label, selected, options, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isActive = selected.length > 0;

  const toggle = (opt) => {
    if (selected.includes(opt)) {
      onChange(selected.filter(v => v !== opt));
    } else {
      onChange([...selected, opt]);
    }
  };

  return (
    <div style={{ position: 'relative' }} ref={ref}>
      {isActive ? (
        <div style={{
          backgroundColor: '#dbeafe', border: '1px solid #93c5fd',
          padding: '6px 12px', borderRadius: '6px', fontSize: '13px',
          display: 'flex', alignItems: 'center', gap: '8px', color: '#1e40af', cursor: 'pointer'
        }} onClick={() => setOpen(o => !o)}>
          <span>{label}</span>
          <button
            onClick={(e) => { e.stopPropagation(); onChange([]); setOpen(false); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '0', color: '#1e40af', lineHeight: '1' }}
          >✕</button>
        </div>
      ) : (
        <button
          onClick={() => setOpen(o => !o)}
          style={{
            padding: '8px 14px', backgroundColor: 'white', color: '#3b82f6',
            border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer',
            fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px'
          }}
        >
          <span>{label}</span>
        </button>
      )}

      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, marginTop: '8px',
          backgroundColor: 'white', border: '1px solid #d1d5db', borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 1000,
          minWidth: '220px', maxHeight: '300px', overflowY: 'auto'
        }}>
          {options.map(opt => {
            const isSelected = selected.includes(opt);
            return (
              <div
                key={opt}
                onClick={() => toggle(opt)}
                style={{
                  padding: '10px 12px', cursor: 'pointer',
                  backgroundColor: isSelected ? '#dbeafe' : 'white',
                  borderBottom: '1px solid #e5e7eb', fontSize: '14px',
                  display: 'flex', alignItems: 'center', gap: '8px',
                  transition: 'background-color 0.15s'
                }}
                onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = '#f9fafb'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = isSelected ? '#dbeafe' : 'white'; }}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => {}}
                  style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#3b82f6' }}
                />
                {opt}
              </div>
            );
          })}
          <div style={{
            padding: '10px 12px', borderTop: '1px solid #e5e7eb',
            display: 'flex', justifyContent: 'flex-end', background: '#f9fafb',
            position: 'sticky', bottom: 0
          }}>
            <button
              onClick={() => setOpen(false)}
              style={{
                padding: '6px 16px', backgroundColor: '#3b82f6', color: 'white',
                border: 'none', borderRadius: '6px', cursor: 'pointer',
                fontSize: '13px', fontWeight: '500'
              }}
            >Save</button>
          </div>
        </div>
      )}
    </div>
  );
};

const Keywords = () => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showGlossary, setShowGlossary] = useState(false);
  const [glossaryData, setGlossaryData] = useState(null);
  const [filterStageRank, setFilterStageRank] = useState([]);
  const [filterPrimaryCategory, setFilterPrimaryCategory] = useState([]);
  const rowsPerPage = 10;

  useEffect(() => {
    setLoading(true);
    apiFetch('/api/keywords-data')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setTableData(data.data.masterTable || []);
          setGlossaryData(data.data.glossary || null);
        } else {
          setTableData([]);
        }
      })
      .catch(() => {
        setTableData([]);
      })
      .finally(() => {
        // Show loading gif for 1.5 seconds
        setTimeout(() => {
          setLoading(false);
        }, 1500);
      });
  }, []);

  const getUniqueOptions = (key) => {
    if (!tableData) return [];
    const allValues = tableData.map(item => item[key]);
    return [...new Set(allValues)].filter(v => v && v.trim()).sort();
  };

  if (loading) {
    return (
      <div className="loading-overlay">
        <img src={loadingGif} alt="Loading" />
      </div>
    );
  }

  const filteredData = tableData.filter(row => {
    const stageMatch = filterStageRank.length === 0 || filterStageRank.includes(String(row['Current Stage']));
    const catMatch = filterPrimaryCategory.length === 0 || filterPrimaryCategory.includes(row['Primary Category (Products/Services Keywords)']);
    return stageMatch && catMatch;
  });
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
        <button className="view-summary-button" onClick={() => setShowGlossary(true)}>
          <svg className="summary-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          Glossary
        </button>
      </div>

      <div className="keywords-divider" />

      <div className="keywords-controls">
        <div className="keywords-filters">
          <FilterPill
            label="Stage Rank"
            selected={filterStageRank}
            options={[...new Set(tableData.map(r => r['Current Stage']))].filter(v => v != null).sort((a, b) => a - b).map(String)}
            onChange={v => { setFilterStageRank(v); setCurrentPage(1); }}
          />
          <FilterPill
            label="Primary Category"
            selected={filterPrimaryCategory}
            options={[...new Set(tableData.map(r => r['Primary Category (Products/Services Keywords)']))].filter(Boolean).sort()}
            onChange={v => { setFilterPrimaryCategory(v); setCurrentPage(1); }}
          />
        </div>
      </div>

      <div className="table-wrapper">
        <table className="keywords-table">
          <thead>
            <tr className="table-master-header">
              {/* <th colSpan="6" className="table-master-header-cell">PRODUCTS & SERVICES MASTER TABLE — 100 Products · Renamed Lifecycle Stages · Deep Metadata</th> */}
            </tr>
            <tr className="table-column-headers">
              <th>Product / Service</th>
              <th>Primary Category</th>
              <th>Secondary Category</th>
              <th>First Detected</th>
              <th>Lifecycle Stage</th>
              <th>Stage Rank(1-4)</th>
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
            &laquo;
                    </button>

                  <button
                    key="prev"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`pagination-button ${currentPage === 1 ? 'disabled' : ''}`}
                    title="Previous page"
                  >
                    &lsaquo;
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
                    &rsaquo;
                    </button>

                  <button
                    key="last"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className={`pagination-button ${currentPage === totalPages ? 'disabled' : ''}`}
                    title="Last page"
                  >
                    &raquo;
                    </button>
                </>
              );
            })()}
          </div>

          <div style={{ minWidth: '120px' }} />
        </div>
      )}
    </div>
  );
};

export default Keywords;