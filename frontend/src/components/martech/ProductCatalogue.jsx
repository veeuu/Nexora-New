import apiFetch from '../../utils/apiFetch';
import React, { useState, useEffect } from 'react';
import { rowMatchesSearch, highlightText, Tooltip, createTooltipHandlers } from '../../utils/tableUtils.jsx';
import loadingGif from '../../assets/Data Loading GIF - Without Starhub.gif';
import '../../styles/productCatalogue.css';

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
  const rowsPerPage = 10;

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
        const response = await apiFetch(`/api/product-catalogue?year=${selectedYear}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setTableData(data);
      } catch (e) {
        setError(e.message);

        setTableData([]);
      } finally {

        setTimeout(() => {
          setLoading(false);
        }, 2000);
      }
    };

    fetchData();
  }, [selectedYear]);

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
      <div className="loading-container">
        <div className="loading-skeleton">
          <div className="skeleton-title" />
          <div className="skeleton-filters">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={`filter-${i}`} className="skeleton-filter-item" />
            ))}
          </div>
          <div className="skeleton-divider" />
          <div className="skeleton-table-header">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={`header-${i}`} className="skeleton-header-cell" />
            ))}
          </div>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(row => (
            <div key={`row-${row}`} className={`skeleton-table-row ${row % 2 === 0 ? 'even' : 'odd'}`}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(col => (
                <div key={`cell-${row}-${col}`} className="skeleton-cell" />
              ))}
            </div>
          ))}
        </div>
        <div className="loading-gif-container">
          <img 
            src={loadingGif} 
            alt="Loading" 
            className="loading-gif"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="product-catalogue-container">
      {error && (
        <div className="error-message">
          <div className="error-icon">⚠</div>
          <div className="error-text">
            Error fetching data: {error}. Showing UI with no data.
          </div>
          <button
            onClick={() => setError(null)}
            className="error-close-btn"
          >
            ✕
          </button>
        </div>
      )}

      <div className="catalogue-header">
        <h2 className="catalogue-title">Product Catalogue</h2>
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

      <div className="filter-section">
        <div className="filter-controls">
          <div className="filter-container">
            {activeFilterMenu !== 'category' && (
              <div className="filter-container-relative">
                <button
                  onClick={() => setActiveFilterMenu('category')}
                  className="filter-button"
                >
                  <span>Category {filters.category.length > 0 && `(${filters.category.length})`}</span>
                </button>
              </div>
            )}

            {activeFilterMenu === 'category' && (
              <div className="filter-container-relative">
                <div className="filter-active">
                  <span>Category</span>
                  <button
                    onClick={() => {
                      setActiveFilterMenu(null);
                      setFilters(prev => ({ ...prev, category: [] }));
                    }}
                    className="filter-close-btn"
                  >
                    ✕
                  </button>
                </div>
                <div className="filter-dropdown">
                  <div
                    onClick={() => {
                      const allOptions = getUniqueOptions('category');
                      if (filters.category.length === allOptions.length) {
                        setFilters(prev => ({ ...prev, category: [] }));
                      } else {
                        setFilters(prev => ({ ...prev, category: allOptions }));
                      }
                    }}
                    className="filter-option"
                  >
                    <input
                      type="checkbox"
                      checked={filters.category.length === getUniqueOptions('category').length && getUniqueOptions('category').length > 0}
                      onChange={() => {
                        const allOptions = getUniqueOptions('category');
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
                  {getUniqueOptions('category')
                    .sort((a, b) => {
                      const countA = getProductCountByCategory(a);
                      const countB = getProductCountByCategory(b);
                      return countB - countA;
                    })
                    .map((option, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleFilterChange('category', option)}
                      className={`filter-option ${filters.category.includes(option) ? 'selected' : ''}`}
                    >
                      <div className="filter-option-content">
                        <div className="filter-option-flex">
                          <input
                            type="checkbox"
                            checked={filters.category.includes(option)}
                            onChange={() => handleFilterChange('category', option)}
                            style={{ cursor: 'pointer' }}
                          />
                          {option}
                        </div>
                        <span className="filter-option-count">
                          {getProductCountByCategory(option)}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div className="filter-footer">
                    <button
                      onClick={() => {
                        setActiveFilterMenu(null);
                      }}
                      className="filter-save-btn"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button className="download-csv-button download-csv-button-wrapper" onClick={() => handleDownloadCSV(filteredData)}>
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
                  <tr key={index} className={isHighlighted ? 'table-row-highlighted' : ''}>
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
                      className="table-cell-description"
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
                              className="pagination-button nav"
                              title="First page"
                          >
                              &laquo;
                              </button>

                          <button
                              key="prev"
                              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                              disabled={currentPage === 1}
                              className="pagination-button nav"
                              title="Previous page"
                          >
                              &lsaquo;
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
                              className="pagination-button nav"
                              title="Next page"
                          >
                              &rsaquo;
                              </button>

                          <button
                              key="last"
                              onClick={() => setCurrentPage(totalPages)}
                              disabled={currentPage === totalPages}
                              className="pagination-button nav"
                              title="Last page"
                          >
                              &raquo;
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
    </div>
  );
};

export default ProductCatalogue;