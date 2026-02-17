import { useState } from 'react';
import '../../styles/dataDictionary.css';

const DataDictionary = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Hardcoded data dictionary with additional details
  const dataDictionary = [
    {
      'Data Attribute': 'Technographics',
      'Definition': 'The technology product(s) the company uses',
      'Standard / Special': 'Standard',
      'Example': 'Salesforce, Microsoft 365, AWS',
      'Use Case': 'Identify what technologies a company is using'
    },
    {
      'Data Attribute': 'Intent',
      'Definition': 'A measure of the intensity of the signal for a given product and the likelihood of the existence of a product',
      'Standard / Special': 'Standard',
      'Example': 'High, Medium, Low, High-Medium, Greenfield ',
      'Use Case': 'Understand buying signals and product interest levels'
    },
    {
      'Data Attribute': 'First discovered',
      'Definition': 'Date when technology usage was first discovered',
      'Standard / Special': 'Standard',
      'Example': '2023-01-15',
      'Use Case': 'Track when a company started using a technology'
    },
    {
      'Data Attribute': 'Last discovered',
      'Definition': 'Last date the technology usage was discovered',
      'Standard / Special': 'Standard',
      'Example': '2024-02-10',
      'Use Case': 'Determine if technology is still actively used'
    },
    {
      'Data Attribute': 'Vendor',
      'Definition': 'Company that makes the product',
      'Standard / Special': 'Standard',
      'Example': 'Salesforce Inc., Microsoft Corp',
      'Use Case': 'Identify technology vendors for outreach'
    },
    {
      'Data Attribute': 'Category',
      'Definition': 'Classification of common products',
      'Standard / Special': 'Standard',
      'Example': 'Cloud, AI/ML, Database, CRM',
      'Use Case': 'Group technologies by business function'
    },
    {
      'Data Attribute': 'SubCategory',
      'Definition': 'Sub-classification of the product',
      'Standard / Special': 'Standard',
      'Example': 'Sales Automation, Email Marketing',
      'Use Case': 'Narrow down specific technology types'
    },
    {
      'Data Attribute': 'Description',
      'Definition': 'Brief summary of the product description',
      'Standard / Special': 'Standard',
      'Example': 'Cloud-based CRM platform for sales teams',
      'Use Case': 'Understand what a technology does'
    },
    {
      'Data Attribute': 'Renewal Intelligence',
      'Definition': 'Renewal Cycle of a product',
      'Standard / Special': 'Special',
      'Example': 'Annual, Monthly, Multi-year',
      'Use Case': 'Predict renewal dates for sales opportunities'
    },
    {
      'Data Attribute': 'Skills Matrix',
      'Definition': 'Relative percentage of resources discovered in an organization skilled in given technologies',
      'Standard / Special': 'Special',
      'Example': '45% of team skilled in Python',
      'Use Case': 'Identify skill gaps and training needs'
    },
    {
      'Data Attribute': 'Adoption/De-adoption Matrix',
      'Definition': 'Technology platforms being adopted or de-adopted at an organization level',
      'Standard / Special': 'Special',
      'Example': 'Adopting: Kubernetes, De-adopting: Legacy systems',
      'Use Case': 'Track technology migration trends'
    },
    {
      'Data Attribute': 'Actively used (in-project) technologies',
      'Definition': 'List of technologies detected as being used in current and recent projects',
      'Standard / Special': 'Special',
      'Example': 'React, Node.js, PostgreSQL',
      'Use Case': 'Find companies actively using specific tech stacks'
    }
  ];

  // Filter data based on search term
  const searchFilteredData = dataDictionary.filter(item => {
    const matchesSearch = 
      (item['Data Attribute'] || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item['Definition'] || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Separate into categories
  const standardItems = searchFilteredData.filter(item => 
    (item['Standard / Special'] || '').toLowerCase() === 'standard'
  );
  const specialItems = searchFilteredData.filter(item => 
    (item['Standard / Special'] || '').toLowerCase() === 'special'
  );

  // Render items grid
  const renderItemsGrid = (items, type) => (
    <div className="data-items-grid">
      {items.length > 0 ? (
        items.map((item, index) => (
          <div
            key={`${type}-${index}`}
            className={`data-card ${type}`}
          >
            <div className="card-header">
              <h3 className="card-title">
                {item['Data Attribute']}
              </h3>
            </div>

            <div className="card-content">
              <div className="content-block">
                <h4 className="block-label">Definition</h4>
                <p className="block-text">
                  {item['Definition']}
                </p>
              </div>

              <div className="content-block">
                <h4 className="block-label">Example</h4>
                <p className="block-text example">
                  {item['Example']}
                </p>
              </div>

              <div className="content-block">
                <h4 className="block-label">Use Case</h4>
                <p className="block-text">
                  {item['Use Case']}
                </p>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="no-results-grid">
          <p className="no-results-title">No {type} attributes found</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="data-dictionary-container">
      {/* Header */}
      <div className="data-dictionary-header">
        <div>
          <h2 className="data-dictionary-title">
            📚 Data Dictionary
          </h2>
          <p className="data-dictionary-subtitle">
            Complete guide to all data attributes and their meanings
          </p>
        </div>
      </div>

      <div className="data-dictionary-divider" />

      {/* Search Bar */}
      <div className="data-dictionary-controls">
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder="Search attributes or definitions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <svg
            className="search-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="10" cy="10" r="7"></circle>
            <path d="m20 20-4.5-4.5"></path>
          </svg>
        </div>
      </div>

      {/* Standard Attributes Section */}
      {standardItems.length > 0 && (
        <div className="category-section standard-section">
          <div className="category-header">
            <div className="category-icon standard">✓</div>
            <div className="category-info">
              <h3 className="category-title">Standard Attributes</h3>
              <p className="category-description">Core data attributes available with every technographic list</p>
            </div>
            <span className="category-count">{standardItems.length}</span>
          </div>
          {renderItemsGrid(standardItems, 'standard')}
        </div>
      )}

      {/* Special Attributes Section */}
      {specialItems.length > 0 && (
        <div className="category-section special-section">
          <div className="category-header">
            <div className="category-icon special">⭐</div>
            <div className="category-info">
              <h3 className="category-title">Special Attributes</h3>
              <p className="category-description">Premium attributes available for additional costs</p>
            </div>
            <span className="category-count">{specialItems.length}</span>
          </div>
          {renderItemsGrid(specialItems, 'special')}
        </div>
      )}

      {/* No Results */}
      {standardItems.length === 0 && specialItems.length === 0 && (
        <div className="no-results-container">
          <p className="no-results-title">No attributes found</p>
          <p className="no-results-subtitle">Try adjusting your search</p>
        </div>
      )}
    </div>
  );
};

export default DataDictionary;
