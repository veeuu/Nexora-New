import React, { useState, useEffect } from 'react';
import { rowMatchesSearch, highlightText, Tooltip, createTooltipHandlers } from '../../utils/tableUtils.jsx';
import nexoraLogo from '../../assets/nexora-logo.png';

const ProductCatalogue = () => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState('2025');
  const [filters, setFilters] = useState({
    category: []
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [modalContent, setModalContent] = useState(null);
  const [tooltip, setTooltip] = useState({ show: false, text: '', x: 0, y: 0 });
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilterMenu, setActiveFilterMenu] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 9;

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => {
      const currentValues = prev[filterName];
      if (currentValues.includes(value)) {
        return { ...prev, [filterName]: currentValues.filter(v => v !== value) };
      } else {
        return { ...prev, [filterName]: [...currentValues, value] };
      }
    });
    setCurrentPage(1);
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
        setError(null);
        const response = await fetch(`/api/product-catalogue?year=${selectedYear}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setTableData(data);
      } catch (e) {
        setError(e.message);
        console.error("Failed to fetch Product Catalogue data:", e);
        setTableData([]); // Set empty data on error
      } finally {
        // Add 2-second delay before hiding loading screen
        setTimeout(() => {
          setLoading(false);
        }, 2000);
      }
    };

    fetchData();
  }, [selectedYear]);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      const filterContainer = document.querySelector('.filter-container');
      if (filterContainer && !filterContainer.contains(event.target)) {
        setActiveFilterMenu(null);
        setShowFilters(false);
      }
    };

    if (activeFilterMenu || showFilters) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [activeFilterMenu, showFilters]);

  const getUniqueOptions = (key) => {
    if (!tableData) return [];
    const allValues = tableData.map(item => item[key]);
    return [...new Set(allValues)].sort();
  };

  // Helper function to count products by category
  const getProductCountByCategory = (category) => {
    if (!tableData) return 0;
    const uniqueProducts = new Set();
    tableData.forEach(row => {
      if (row.category === category) {
        uniqueProducts.add(row.prodName);
      }
    });
    return uniqueProducts.size;
  };

  // Helper function to count products by subcategory
  const getProductCountBySubCategory = (subCategory) => {
    if (!tableData) return 0;
    const uniqueProducts = new Set();
    tableData.forEach(row => {
      if (row.subCategory === subCategory) {
        uniqueProducts.add(row.prodName);
      }
    });
    return uniqueProducts.size;
  };

  const { handleMouseEnter, handleMouseLeave } = createTooltipHandlers(setTooltip);

  const filteredData = tableData
    .filter(row => {
      const filterMatches = Object.keys(filters).every(key => {
        if (filters[key].length === 0) return true;
        return filters[key].includes(String(row[key]));
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
        minHeight: '800px',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        padding: '40px 20px'
      }}>
        {/* Nexora Logo */}
        <img src={nexoraLogo} alt="Nexora Logo" style={{width: '250px', height: 'auto', marginBottom: '30px', objectFit: 'contain'}} />

        {/* Loading Text */}
        <h3 style={{
          margin: '0 0 10px 0',
          color: '#1f2937',
          fontSize: '18px',
          fontWeight: '600'
        }}>
          
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

  return (
    <div className="product-catalogue-container">
      {/* Error Banner */}
      {error && (
        <div style={{
          backgroundColor: '#fee2e2',
          border: '1px solid #fca5a5',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            fontSize: '18px',
            color: '#dc2626',
            flexShrink: 0
          }}>
            ⚠
          </div>
          <div style={{
            fontSize: '14px',
            color: '#991b1b',
            fontWeight: '500'
          }}>
            Error fetching data: {error}. Showing UI with no data.
          </div>
          <button
            onClick={() => setError(null)}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '18px',
              color: '#991b1b',
              padding: '0',
              lineHeight: '1'
            }}
          >
            ✕
          </button>
        </div>
      )}
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: '700' }}>Product Catalogue</h2>
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
      <div className="section-subtle-divider" />
      
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <div className="filter-container" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          
          {/* Category Filter Chip */}
          {activeFilterMenu !== 'category' && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setActiveFilterMenu('category')}
                style={{
                  padding: '8px 14px',
                  backgroundColor: 'white',
                  color: '#3b82f6',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f3f4f6';
                  e.target.style.borderColor = '#3b82f6';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'white';
                  e.target.style.borderColor = '#d1d5db';
                }}
              >
                <span>Category {filters.category.length > 0 && `(${filters.category.length})`}</span>
              </button>
            </div>
          )}

          {activeFilterMenu === 'category' && (
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
                <span>Category</span>
                <button
                  onClick={() => {
                    setActiveFilterMenu(null);
                    setFilters(prev => ({ ...prev, category: [] }));
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '16px',
                    padding: '0',
                    color: '#1e40af',
                    lineHeight: '1'
                  }}
                >
                  ✕
                </button>
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
                <div
                  onClick={() => {
                    const allOptions = getUniqueOptions('category');
                    // Toggle: if all selected, deselect all; otherwise select all
                    if (filters.category.length === allOptions.length) {
                      setFilters(prev => ({ ...prev, category: [] }));
                    } else {
                      setFilters(prev => ({ ...prev, category: allOptions }));
                    }
                  }}
                  style={{
                    padding: '10px 12px',
                    cursor: 'pointer',
                    backgroundColor: 'white',
                    borderBottom: '1px solid #e5e7eb',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                >
                  <input
                    type="checkbox"
                    checked={filters.category.length === getUniqueOptions('category').length && getUniqueOptions('category').length > 0}
                    onChange={() => {
                      const allOptions = getUniqueOptions('category');
                      // Toggle: if all selected, deselect all; otherwise select all
                      if (filters.category.length === allOptions.length) {
                        setFilters(prev => ({ ...prev, category: [] }));
                      } else {
                        setFilters(prev => ({ ...prev, category: allOptions }));
                      }
                    }}
                    style={{ cursor: 'pointer' }}
                  />
                  All
                </div>
                {getUniqueOptions('category').map((option, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleFilterChange('category', option)}
                    style={{
                      padding: '10px 12px',
                      cursor: 'pointer',
                      backgroundColor: filters.category.includes(option) ? '#dbeafe' : 'white',
                      borderBottom: '1px solid #e5e7eb',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      justifyContent: 'space-between'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = filters.category.includes(option) ? '#dbeafe' : 'white'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="checkbox"
                        checked={filters.category.includes(option)}
                        onChange={() => handleFilterChange('category', option)}
                        style={{ cursor: 'pointer' }}
                      />
                      {option}
                    </div>
                    <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
                      {getProductCountByCategory(option)}
                    </span>
                  </div>
                ))}

                {/* Save Button */}
                <div style={{
                  padding: '12px',
                  borderTop: '1px solid #e5e7eb',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '8px',
                  backgroundColor: '#f9fafb',
                  position: 'sticky',
                  bottom: 0
                }}>
                  <button
                    onClick={() => {
                      setActiveFilterMenu(null);
                    }}
                    style={{
                      padding: '6px 16px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '500',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
          </div>
          
          {/* Download CSV Button */}
          <button className="download-csv-button" onClick={() => handleDownloadCSV(filteredData)} style={{ flexShrink: 0 }}>
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
            {(() => {
              const totalPages = Math.ceil(filteredData.length / rowsPerPage);
              const startIndex = (currentPage - 1) * rowsPerPage;
              const endIndex = startIndex + rowsPerPage;
              const paginatedData = filteredData.slice(startIndex, endIndex);

              return paginatedData.map((row, index) => {
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
              });
            })()}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {filteredData.length > rowsPerPage && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
          marginTop: '20px',
          marginBottom: '20px'
        }}>
          {(() => {
            const totalPages = Math.ceil(filteredData.length / rowsPerPage);
            const pages = [];
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
                  key="prev"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  style={{
                    padding: '8px 12px',
                    border: 'none',
                    borderRadius: '6px',
                    backgroundColor: currentPage === 1 ? '#f3f4f6' : '#f9fafb',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    fontSize: '16px',
                    color: currentPage === 1 ? '#d1d5db' : '#6b7280',
                    fontWeight: '600',
                    transition: 'all 0.2s',
                    opacity: currentPage === 1 ? 0.5 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (currentPage > 1) {
                      e.target.style.backgroundColor = '#e5e7eb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentPage > 1) {
                      e.target.style.backgroundColor = '#f9fafb';
                    }
                  }}
                >
                  ← Prev
                </button>

                {startPage > 1 && (
                  <>
                    <button
                      key={1}
                      onClick={() => setCurrentPage(1)}
                      style={{
                        padding: '8px 14px',
                        border: 'none',
                        borderRadius: '8px',
                        backgroundColor: '#f3f4f6',
                        cursor: 'pointer',
                        fontSize: '14px',
                        color: '#6b7280',
                        fontWeight: '500',
                        minWidth: '40px',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#e5e7eb'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                    >
                      1
                    </button>
                    {startPage > 2 && <span style={{ color: '#d1d5db' }}>...</span>}
                  </>
                )}

                {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(i => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    style={{
                      padding: '8px 14px',
                      border: 'none',
                      borderRadius: '8px',
                      backgroundColor: i === currentPage ? '#dbeafe' : '#f3f4f6',
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
                        e.target.style.backgroundColor = '#e5e7eb';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (i !== currentPage) {
                        e.target.style.backgroundColor = '#f3f4f6';
                      }
                    }}
                  >
                    {i}
                  </button>
                ))}

                {endPage < totalPages && (
                  <>
                    {endPage < totalPages - 1 && <span style={{ color: '#d1d5db' }}>...</span>}
                    <button
                      key={totalPages}
                      onClick={() => setCurrentPage(totalPages)}
                      style={{
                        padding: '8px 14px',
                        border: 'none',
                        borderRadius: '8px',
                        backgroundColor: '#f3f4f6',
                        cursor: 'pointer',
                        fontSize: '14px',
                        color: '#6b7280',
                        fontWeight: '500',
                        minWidth: '40px',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#e5e7eb'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                    >
                      {totalPages}
                    </button>
                  </>
                )}

                <button
                  key="next"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '8px 12px',
                    border: 'none',
                    borderRadius: '6px',
                    backgroundColor: currentPage === totalPages ? '#f3f4f6' : '#f9fafb',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    fontSize: '16px',
                    color: currentPage === totalPages ? '#d1d5db' : '#6b7280',
                    fontWeight: '600',
                    transition: 'all 0.2s',
                    opacity: currentPage === totalPages ? 0.5 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (currentPage < totalPages) {
                      e.target.style.backgroundColor = '#e5e7eb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentPage < totalPages) {
                      e.target.style.backgroundColor = '#f9fafb';
                    }
                  }}
                >
                  Next →
                </button>
              </>
            );
          })()}
        </div>
      )}

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
          max-height: 550px;
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
        
        th:nth-child(1), td:nth-child(1) { width: 25%; }
        th:nth-child(2), td:nth-child(2) { width: 25%; }
        th:nth-child(3), td:nth-child(3) { width: 25%; }
        th:nth-child(4), td:nth-child(4) { width: 25%; }
        
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