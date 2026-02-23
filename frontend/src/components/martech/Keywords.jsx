import { useState, useEffect, useRef } from 'react';
import loadingGif from '../../assets/Loading GIF - Clients.gif';
import '../../styles/keywords.css';

const Keywords = () => {
  const [filters, setFilters] = useState({ company: '', product: '' });
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
    const companyMatch = !filters.company || row.Company === filters.company;
    const productMatch = !filters.product || row['Products / Services'] === filters.product;
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
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10 }}>
        <img src={loadingGif} alt="Loading" style={{ width: '600px', height: '600px', objectFit: 'contain' }} />
      </div>
    );
  }

  const totalPages = Math.ceil(groupedDataArray.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = groupedDataArray.slice(startIndex, startIndex + rowsPerPage);

  return (
    <div className="keywords-container">
      <div className="header-actions" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
        <h2 style={{ fontSize: '25px', fontWeight: '700', margin: 0 }}>Keywords</h2>
      </div>

      <div className="section-subtle-divider" />

      <div style={{ marginBottom: '20px' }} ref={filterRef}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                padding: '8px 14px',
                backgroundColor: 'white',
                color: '#3b82f6',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              + Filter
            </button>

            {showFilters && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: '8px',
                backgroundColor: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                zIndex: 1000,
                minWidth: '200px'
              }}>
                {[
                  { label: 'Company Name', key: 'company' },
                  { label: 'Products / Services', key: 'product' }
                ].map((opt) => (
                  <div
                    key={opt.key}
                    onClick={() => { setActiveFilterMenu(opt.key); setShowFilters(false); }}
                    style={{
                      padding: '12px 16px',
                      cursor: 'pointer',
                      borderBottom: '1px solid #e5e7eb',
                      fontSize: '14px'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                  >
                    {opt.label}
                  </div>
                ))}
              </div>
            )}

            {activeFilterMenu === 'company' && (
              <div style={{ position: 'relative' }}>
                <div style={{
                  backgroundColor: '#dbeafe',
                  border: '1px solid #93c5fd',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#1e40af'
                }}>
                  <span>Company</span>
                  <button onClick={() => { setActiveFilterMenu(null); setFilters(prev => ({ ...prev, company: '' })); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1e40af' }}>✕</button>
                </div>
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: '8px',
                  backgroundColor: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  zIndex: 1000,
                  minWidth: '250px',
                  maxHeight: '300px',
                  overflowY: 'auto'
                }}>
                  <div onClick={() => { setFilters(prev => ({ ...prev, company: '' })); setActiveFilterMenu(null); }} style={{ padding: '10px 12px', cursor: 'pointer', borderBottom: '1px solid #e5e7eb', fontSize: '14px' }} onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'} onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}>All</div>
                  {getUniqueCompanies().map((opt, idx) => (
                    <div key={idx} onClick={() => { setFilters(prev => ({ ...prev, company: opt })); setActiveFilterMenu(null); }} style={{ padding: '10px 12px', cursor: 'pointer', backgroundColor: filters.company === opt ? '#dbeafe' : 'white', borderBottom: '1px solid #e5e7eb', fontSize: '14px' }} onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'} onMouseLeave={(e) => e.target.style.backgroundColor = filters.company === opt ? '#dbeafe' : 'white'}>{opt}</div>
                  ))}
                </div>
              </div>
            )}

            {activeFilterMenu === 'product' && (
              <div style={{ position: 'relative' }}>
                <div style={{
                  backgroundColor: '#dbeafe',
                  border: '1px solid #93c5fd',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#1e40af'
                }}>
                  <span>Product</span>
                  <button onClick={() => { setActiveFilterMenu(null); setFilters(prev => ({ ...prev, product: '' })); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1e40af' }}>✕</button>
                </div>
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: '8px',
                  backgroundColor: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  zIndex: 1000,
                  minWidth: '250px',
                  maxHeight: '300px',
                  overflowY: 'auto'
                }}>
                  <div onClick={() => { setFilters(prev => ({ ...prev, product: '' })); setActiveFilterMenu(null); }} style={{ padding: '10px 12px', cursor: 'pointer', borderBottom: '1px solid #e5e7eb', fontSize: '14px' }} onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'} onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}>All</div>
                  {getUniqueProducts().map((opt, idx) => (
                    <div key={idx} onClick={() => { setFilters(prev => ({ ...prev, product: opt })); setActiveFilterMenu(null); }} style={{ padding: '10px 12px', cursor: 'pointer', backgroundColor: filters.product === opt ? '#dbeafe' : 'white', borderBottom: '1px solid #e5e7eb', fontSize: '14px' }} onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'} onMouseLeave={(e) => e.target.style.backgroundColor = filters.product === opt ? '#dbeafe' : 'white'}>{opt}</div>
                  ))}
                </div>
              </div>
            )}

            {filters.company && activeFilterMenu !== 'company' && (
              <div style={{ backgroundColor: '#fef3c7', border: '1px solid #fcd34d', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', color: '#92400e' }}>
                <span>Company: {filters.company}</span>
                <button onClick={() => setFilters(prev => ({ ...prev, company: '' }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#92400e' }}>✕</button>
              </div>
            )}

            {filters.product && activeFilterMenu !== 'product' && (
              <div style={{ backgroundColor: '#fef3c7', border: '1px solid #fcd34d', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', color: '#92400e' }}>
                <span>Product: {filters.product}</span>
                <button onClick={() => setFilters(prev => ({ ...prev, product: '' }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#92400e' }}>✕</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', minWidth: 0 }}>
        <div style={{ minWidth: 0 }}>
          <div className="table-container">
            <table>
              <thead className="sticky-header">
                <tr>
                  <th style={{ textAlign: 'left', padding: '12px 8px' }}>Company</th>
                  <th style={{ textAlign: 'left', padding: '12px 8px' }}>Products / Services</th>
                  <th style={{ textAlign: 'left', padding: '12px 8px' }}>Primary Category</th>
                  <th style={{ textAlign: 'left', padding: '12px 8px' }}>Secondary Category</th>
                  <th style={{ textAlign: 'left', padding: '12px 8px' }}>First Detected</th>
                  <th style={{ textAlign: 'left', padding: '12px 8px' }}>Expansion Phase</th>
                  <th style={{ textAlign: 'left', padding: '12px 8px' }}>Current Stage</th>
                </tr>
              </thead>
              <tbody>
                {tableData.length === 0 ? (
                  <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>No data loaded</td></tr>
                ) : groupedDataArray.length === 0 ? (
                  <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>No data matches filters</td></tr>
                ) : (
                  paginatedData.map((groupedRow, groupIdx) => {
                    const items = groupedRow.items || [groupedRow];
                    return (
                      <tr key={groupIdx} style={{ borderBottom: '2px solid #e5e7eb' }}>
                        <td style={{ padding: '12px 8px', fontWeight: '600', backgroundColor: 'white', verticalAlign: 'top' }}>
                          {groupedRow.Company}
                        </td>
                        <td style={{ padding: '12px 8px' }}>
                          <div style={{ maxHeight: '96px', overflowY: 'auto', paddingRight: '4px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                            {items.map((row, idx) => (
                              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', marginBottom: idx < items.length - 1 ? '4px' : '0' }}>
                                {row['Products / Services']}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td style={{ padding: '12px 8px' }}>
                          <div style={{ maxHeight: '96px', overflowY: 'auto', paddingRight: '4px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                            {items.map((row, idx) => (
                              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', marginBottom: idx < items.length - 1 ? '4px' : '0' }}>
                                {row['Primary Category (Products/Services Keywords)']}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td style={{ padding: '12px 8px' }}>
                          <div style={{ maxHeight: '96px', overflowY: 'auto', paddingRight: '4px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                            {items.map((row, idx) => (
                              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', marginBottom: idx < items.length - 1 ? '4px' : '0' }}>
                                {row['Secondary Category Keywords ']}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td style={{ padding: '12px 8px' }}>
                          <div style={{ maxHeight: '96px', overflowY: 'auto', paddingRight: '4px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                            {items.map((row, idx) => (
                              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', marginBottom: idx < items.length - 1 ? '4px' : '0' }}>
                                {row['First Detected (Timeline Start)'] || 'N/A'}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td style={{ padding: '12px 8px' }}>
                          <div style={{ maxHeight: '96px', overflowY: 'auto', paddingRight: '4px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                            {items.map((row, idx) => (
                              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', marginBottom: idx < items.length - 1 ? '4px' : '0' }}>
                                {row['Expansion Phase']}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td style={{ padding: '12px 8px' }}>
                          <div style={{ maxHeight: '96px', overflowY: 'auto', paddingRight: '4px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                            {items.map((row, idx) => (
                              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', marginBottom: idx < items.length - 1 ? '4px' : '0' }}>
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
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '20px',
              marginBottom: '20px',
              paddingBottom: '15px',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <div style={{
                fontSize: '14px',
                color: '#1f2937',
                fontWeight: '600'
              }}>
                Page {currentPage} of {totalPages}
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px'
              }}>
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    backgroundColor: currentPage === 1 ? '#f3f4f6' : 'white',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    fontSize: '16px',
                    color: currentPage === 1 ? '#d1d5db' : '#6b7280',
                    fontWeight: '600',
                    transition: 'all 0.2s',
                    opacity: currentPage === 1 ? 0.5 : 1
                  }}
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
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    backgroundColor: currentPage === 1 ? '#f3f4f6' : 'white',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    fontSize: '16px',
                    color: currentPage === 1 ? '#d1d5db' : '#6b7280',
                    fontWeight: '600',
                    transition: 'all 0.2s',
                    opacity: currentPage === 1 ? 0.5 : 1
                  }}
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
                    style={{
                      padding: '8px 12px',
                      border: i === currentPage ? '1px solid #3b82f6' : '1px solid #d1d5db',
                      borderRadius: '6px',
                      backgroundColor: i === currentPage ? '#dbeafe' : 'white',
                      cursor: 'pointer',
                      fontSize: '14px',
                      color: i === currentPage ? '#1e40af' : '#6b7280',
                      fontWeight: i === currentPage ? '600' : '500',
                      minWidth: '40px',
                      transition: 'all 0.2s',
                      boxShadow: i === currentPage ? '0 2px 4px rgba(30, 64, 175, 0.2)' : 'none'
                    }}
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
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    backgroundColor: currentPage === totalPages ? '#f3f4f6' : 'white',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    fontSize: '16px',
                    color: currentPage === totalPages ? '#d1d5db' : '#6b7280',
                    fontWeight: '600',
                    transition: 'all 0.2s',
                    opacity: currentPage === totalPages ? 0.5 : 1
                  }}
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
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    backgroundColor: currentPage === totalPages ? '#f3f4f6' : 'white',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    fontSize: '16px',
                    color: currentPage === totalPages ? '#d1d5db' : '#6b7280',
                    fontWeight: '600',
                    transition: 'all 0.2s',
                    opacity: currentPage === totalPages ? 0.5 : 1
                  }}
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
