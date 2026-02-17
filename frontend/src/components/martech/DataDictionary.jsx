import { useState, useEffect } from 'react';
import nexoraLogo from '../../assets/nexora-logo.png';

const DataDictionary = () => {
  const [dataDictionary, setDataDictionary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All'); // All, Standard, Special

  useEffect(() => {
    const fetchDataDictionary = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/data-dictionary');
        const data = await response.json();
        setDataDictionary(data);
      } catch (error) {
        console.error('Error fetching data dictionary:', error);
        setDataDictionary([]);
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      }
    };

    fetchDataDictionary();
  }, []);

  // Filter data based on search term and type
  const filteredData = dataDictionary.filter(item => {
    const matchesSearch = 
      (item['Data Attribute'] || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item['Definition'] || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = 
      filterType === 'All' || 
      (item['Standard / Special'] || '').toLowerCase() === filterType.toLowerCase();
    
    return matchesSearch && matchesType;
  });

  // Separate standard and special attributes
  const standardAttributes = filteredData.filter(item => 
    (item['Standard / Special'] || '').toLowerCase() === 'standard'
  );
  const specialAttributes = filteredData.filter(item => 
    (item['Standard / Special'] || '').toLowerCase() === 'special'
  );

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '800px',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        padding: '40px 20px'
      }}>
        <img 
          src={nexoraLogo} 
          alt="Nexora Logo" 
          style={{
            width: '250px',
            height: 'auto',
            marginBottom: '30px',
            objectFit: 'contain'
          }}
        />
        <h3 style={{
          margin: '0 0 10px 0',
          color: '#1f2937',
          fontSize: '18px',
          fontWeight: '600'
        }}>
          Loading Data Dictionary
        </h3>
        <p style={{
          margin: '0 0 30px 0',
          color: '#6b7280',
          fontSize: '14px',
          textAlign: 'center',
          maxWidth: '300px'
        }}>
          Fetching data attribute definitions...
        </p>
        <div style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center'
        }}>
          {[0, 0.2, 0.4].map((delay, i) => (
            <div key={i} style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#3b82f6',
              animation: `bounce 1.4s infinite ${delay}s`
            }} />
          ))}
        </div>
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
    <div style={{ padding: '0' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <div>
          <h2 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#1f2937',
            margin: '0 0 8px 0'
          }}>
            Data Dictionary
          </h2>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            margin: 0
          }}>
            Comprehensive definitions of all data attributes
          </p>
        </div>
      </div>

      <div style={{
        height: '1px',
        background: 'linear-gradient(to right, #e5e7eb 0%, #d1d5db 50%, #e5e7eb 100%)',
        margin: '20px 0'
      }} />

      {/* Search and Filter Bar */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '24px',
        flexWrap: 'wrap'
      }}>
        {/* Search Input */}
        <div style={{ flex: '1', minWidth: '300px', position: 'relative' }}>
          <input
            type="text"
            placeholder="Search attributes or definitions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 40px 10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
          />
          <svg
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '20px',
              height: '20px',
              color: '#9ca3af'
            }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="10" cy="10" r="7"></circle>
            <path d="m20 20-4.5-4.5"></path>
          </svg>
        </div>

        {/* Filter Buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {['All', 'Standard', 'Special'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              style={{
                padding: '10px 20px',
                border: filterType === type ? '2px solid #3b82f6' : '1px solid #d1d5db',
                borderRadius: '6px',
                backgroundColor: filterType === type ? '#dbeafe' : 'white',
                color: filterType === type ? '#1e40af' : '#6b7280',
                fontSize: '14px',
                fontWeight: filterType === type ? '600' : '500',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (filterType !== type) {
                  e.target.style.backgroundColor = '#f9fafb';
                }
              }}
              onMouseLeave={(e) => {
                if (filterType !== type) {
                  e.target.style.backgroundColor = 'white';
                }
              }}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div style={{
        marginBottom: '16px',
        fontSize: '14px',
        color: '#6b7280'
      }}>
        Showing {filteredData.length} of {dataDictionary.length} attributes
      </div>

      {/* Data Dictionary Cards */}
      {filterType === 'All' ? (
        <>
          {/* Standard Attributes Section */}
          {standardAttributes.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981'
                }}></span>
                Standard Attributes ({standardAttributes.length})
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
                gap: '16px'
              }}>
                {standardAttributes.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '20px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      backgroundColor: 'white',
                      transition: 'all 0.2s',
                      cursor: 'default'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                      e.currentTarget.style.borderColor = '#10b981';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = '#e5e7eb';
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '12px'
                    }}>
                      <h4 style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#1f2937',
                        margin: 0
                      }}>
                        {item['Data Attribute']}
                      </h4>
                      <span style={{
                        padding: '4px 8px',
                        backgroundColor: '#d1fae5',
                        color: '#065f46',
                        fontSize: '12px',
                        fontWeight: '500',
                        borderRadius: '4px'
                      }}>
                        Standard
                      </span>
                    </div>
                    <p style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      lineHeight: '1.6',
                      margin: 0
                    }}>
                      {item['Definition']}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Special Attributes Section */}
          {specialAttributes.length > 0 && (
            <div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#f59e0b'
                }}></span>
                Special Attributes ({specialAttributes.length})
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
                gap: '16px'
              }}>
                {specialAttributes.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '20px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      backgroundColor: 'white',
                      transition: 'all 0.2s',
                      cursor: 'default'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                      e.currentTarget.style.borderColor = '#f59e0b';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = '#e5e7eb';
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '12px'
                    }}>
                      <h4 style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#1f2937',
                        margin: 0
                      }}>
                        {item['Data Attribute']}
                      </h4>
                      <span style={{
                        padding: '4px 8px',
                        backgroundColor: '#fef3c7',
                        color: '#92400e',
                        fontSize: '12px',
                        fontWeight: '500',
                        borderRadius: '4px'
                      }}>
                        Special
                      </span>
                    </div>
                    <p style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      lineHeight: '1.6',
                      margin: 0
                    }}>
                      {item['Definition']}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        /* Filtered View */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
          gap: '16px'
        }}>
          {filteredData.map((item, index) => (
            <div
              key={index}
              style={{
                padding: '20px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                backgroundColor: 'white',
                transition: 'all 0.2s',
                cursor: 'default'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.borderColor = filterType === 'Standard' ? '#10b981' : '#f59e0b';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = '#e5e7eb';
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px'
              }}>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: 0
                }}>
                  {item['Data Attribute']}
                </h4>
                <span style={{
                  padding: '4px 8px',
                  backgroundColor: (item['Standard / Special'] || '').toLowerCase() === 'standard' ? '#d1fae5' : '#fef3c7',
                  color: (item['Standard / Special'] || '').toLowerCase() === 'standard' ? '#065f46' : '#92400e',
                  fontSize: '12px',
                  fontWeight: '500',
                  borderRadius: '4px'
                }}>
                  {item['Standard / Special']}
                </span>
              </div>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                lineHeight: '1.6',
                margin: 0
              }}>
                {item['Definition']}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* No Results */}
      {filteredData.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: '#9ca3af'
        }}>
          <p style={{ fontSize: '16px', marginBottom: '8px' }}>No attributes found</p>
          <p style={{ fontSize: '14px' }}>Try adjusting your search or filter</p>
        </div>
      )}
    </div>
  );
};

export default DataDictionary;
