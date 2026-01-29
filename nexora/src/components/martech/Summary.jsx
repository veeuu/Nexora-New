import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { useIndustry } from '../../context/IndustryContext';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/scale.css';

// --- Color Manipulation Utility ---
const hexToHsl = (hex) => {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
        r = parseInt(hex[1] + hex[2], 16);
        g = parseInt(hex[3] + hex[4], 16);
        b = parseInt(hex[5] + hex[6], 16);
    }
    r /= 255; g /= 255; b /= 255;
    let cmin = Math.min(r, g, b),
        cmax = Math.max(r, g, b),
        delta = cmax - cmin,
        h = 0,
        s = 0,
        l = 0;

    if (delta === 0) h = 0;
    else if (cmax === r) h = ((g - b) / delta) % 6;
    else if (cmax === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;

    h = Math.round(h * 60);
    if (h < 0) h += 360;

    l = (cmax + cmin) / 2;
    s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);

    return { h, s, l };
};

const adjustColor = (hex, deltaL, deltaS) => {
    let { h, s, l } = hexToHsl(hex);
    l = Math.max(0, Math.min(100, l + deltaL));
    s = Math.max(0, Math.min(100, s + deltaS));
    return `hsl(${h}, ${s}%, ${l}%)`;
};

// Removed fake data - using only real data from API

// Function to generate Sankey data from real technographics data
const getSankeyData = (technographicsData, selectedCategories = []) => {
    if (!technographicsData || technographicsData.length === 0) {
        // Return empty structure if no data
        return { nodes: [], links: [], allCategories: [] };
    }

    // Get all unique categories first
    const allCategoriesSet = new Set();
    technographicsData.forEach(row => {
        const category = row.category || 'Other';
        allCategoriesSet.add(category);
    });
    const allCategories = Array.from(allCategoriesSet).sort();

    // Filter data by selected categories if any are selected
    let filteredData = technographicsData;
    if (selectedCategories.length > 0) {
        filteredData = technographicsData.filter(row => {
            const category = row.category || 'Other';
            return selectedCategories.includes(category);
        });
    }

    // Aggregate data by category and technology
    const categoryMap = {};
    const technologyMap = {};

    filteredData.forEach(row => {
        const category = row.category || 'Other';
        const technology = row.technology || 'Unknown';

        // Count categories
        if (!categoryMap[category]) {
            categoryMap[category] = 0;
        }
        categoryMap[category]++;

        // Count technologies per category
        const key = `${category}|${technology}`;
        if (!technologyMap[key]) {
            technologyMap[key] = 0;
        }
        technologyMap[key]++;
    });

    // Calculate total technologies
    const totalTechnologies = filteredData.length;

    // Create nodes and links
    const nodes = [];
    const links = [];

    // Add root node
    nodes.push({ id: 'Technologies', value: totalTechnologies, color: '#1f2937' });

    // Add category nodes and links from Technologies to Categories
    Object.entries(categoryMap).forEach(([category, count]) => {
        nodes.push({ id: category, value: count, color: '#3b82f6' });
        links.push({ source: 'Technologies', target: category, value: count });
    });

    // Add technology nodes and links from Categories to Technologies
    Object.entries(technologyMap).forEach(([key, count]) => {
        const [category, technology] = key.split('|');
        nodes.push({ id: technology, value: count, color: '#3b82f6' });
        links.push({ source: category, target: technology, value: count });
    });

    return { nodes, links, allCategories };
};

// Removed unused aggregateWorldMapData function

const CHART_HEIGHT = 280;
const COLUMN_X = {
    Technologies: 50,
    Category: 200,
    Products: 420,
};
const NODE_WIDTH = 150;
const NODE_VERTICAL_SPACING = 28;

const LINK_STROKE_WIDTH = 2;

// Generate Sankey-style path with proper curves
const generateSankeyLinkPath = (x1, y1, x2, y2, width = 2) => {
    const midX = (x1 + x2) / 2;
    const halfWidth = width / 2;

    // Create a path that represents the flow with variable width
    const topPath = `M ${x1} ${y1 - halfWidth} C ${midX} ${y1 - halfWidth}, ${midX} ${y2 - halfWidth}, ${x2} ${y2 - halfWidth}`;
    const bottomPath = `L ${x2} ${y2 + halfWidth} C ${midX} ${y2 + halfWidth}, ${midX} ${y1 + halfWidth}, ${x1} ${y1 + halfWidth} Z`;

    return topPath + bottomPath;
};

const SankeyGraph = ({ data }) => {
    const [hoveredNode, setHoveredNode] = useState(null);
    const [expandedCategories, setExpandedCategories] = useState(new Set());
    const { nodes, links } = data;

    const rawNodeMap = useMemo(() => new Map(nodes.map(node => [node.id, node])), [nodes]);

    // Dynamically identify categories: nodes that have Technologies as source
    const categoryIds = useMemo(() => {
        return new Set(links.filter(l => l.source === 'Technologies').map(l => l.target));
    }, [links]);

    const techNode = nodes.find(n => n.id === 'Technologies');
    const categories = nodes.filter(n => categoryIds.has(n.id));

    // Products are nodes that are not Technologies and not categories
    const products = nodes.filter(n => n.id !== 'Technologies' && !categoryIds.has(n.id));

    const totalTechnologies = techNode?.value || 1;
    const maxCategoryValue = Math.max(...categories.map(c => c.value), 1);
    const maxProductValue = Math.max(...products.map(p => p.value), 1);

    const nodePositions = useMemo(() => {
        const positions = new Map();

        let currentY = 50;

        categories.forEach(cat => {
            const outgoingLinks = links.filter(l => l.source === cat.id);
            const categoryStartBlockY = currentY;

            let productYSum = 0;
            let productCount = 0;

            outgoingLinks.forEach(link => {
                const productCenterY = currentY + NODE_VERTICAL_SPACING / 2;

                positions.set(link.target, {
                    ...rawNodeMap.get(link.target),
                    y: productCenterY,
                    linkThickness: 20,
                });

                productYSum += productCenterY;
                productCount++;
                currentY += NODE_VERTICAL_SPACING;
            });

            const categoryCenterY = productCount > 0
                ? productYSum / productCount
                : categoryStartBlockY;

            positions.set(cat.id, {
                ...cat,
                y: categoryCenterY,
                linkThickness: 20,
            });

            // Add spacing between categories - more if no products, less if products exist
            currentY += productCount > 0 ? NODE_VERTICAL_SPACING * 0.3 : NODE_VERTICAL_SPACING * 1.2;
        });

        const categoryNodes = categories.map(c => positions.get(c.id)).filter(n => n);
        const totalYSum = categoryNodes.reduce((sum, n) => sum + n.y, 0);
        const technologiesCenterY = categoryNodes.length > 0 ? totalYSum / categoryNodes.length : CHART_HEIGHT / 2;

        positions.set('Technologies', {
            ...techNode,
            y: technologiesCenterY,
            linkThickness: 20,
        });

        return positions;
    }, [nodes, links, rawNodeMap, categories, techNode]);

    const isLinkHighlighted = (sourceId, targetId) => {
        return hoveredNode === sourceId || hoveredNode === targetId;
    };

    const renderLink = (link) => {
        const sourceNode = nodePositions.get(link.source);
        const targetNode = nodePositions.get(link.target);

        if (!sourceNode || !targetNode) return null;

        const sourceX = link.source === 'Technologies'
            ? COLUMN_X.Technologies + 50
            : COLUMN_X.Category + NODE_WIDTH;

        // Check if target is a category (dynamically)
        const targetX = categoryIds.has(link.target)
            ? COLUMN_X.Category : COLUMN_X.Products;

        const sourceY = sourceNode.y;
        const targetY = targetNode.y;

        // Calculate link width based on value (min 3, max 20)
        const maxValue = Math.max(...links.map(l => l.value));
        const linkWidth = Math.max(3, Math.min(20, (link.value / maxValue) * 15));

        const color = targetNode.color;

        const path = generateSankeyLinkPath(sourceX, sourceY, targetX, targetY, linkWidth);

        const highlighted = isLinkHighlighted(link.source, link.target);

        return (
            <path
                key={`${link.source}-${link.target}`}
                d={path}
                fill={color}
                opacity={highlighted ? 0.7 : 0.4}
                style={{
                    transition: 'opacity 0.2s ease-out',
                    cursor: 'pointer'
                }}
                onMouseEnter={() => {
                    setHoveredNode(link.source);
                }}
                onMouseLeave={() => {
                    setHoveredNode(null);
                }}
            />
        );
    };

    const toggleCategory = (categoryId) => {
        const newExpanded = new Set(expandedCategories);
        if (newExpanded.has(categoryId)) {
            newExpanded.delete(categoryId);
        } else {
            newExpanded.add(categoryId);
        }
        setExpandedCategories(newExpanded);
    };

    const renderNode = (node, max, column, align = 'left') => {
        const nodePos = nodePositions.get(node.id);
        if (!nodePos) return null;

        let x;

        if (column === 'Technologies') {
            x = COLUMN_X.Technologies - 40;
        } else if (column === 'Category') {
            x = COLUMN_X.Category;
        } else {
            x = COLUMN_X.Products;
        }

        const barWidth = column === 'Technologies' ? '80px' : `${NODE_WIDTH}px`;
        const isCategory = column === 'Category';
        const isExpanded = expandedCategories.has(node.id);

        return (
            <div
                key={node.id}
                style={{
                    ...sankeyStyles.nodeWrapper(x, nodePos.y),
                    width: column === 'Products' ? '280px' : barWidth,
                    transform: hoveredNode === node.id ? 'translateY(-50%) scale(1.02)' : 'translateY(-50%) scale(1)',
                    boxShadow: hoveredNode === node.id ? `0 0 8px -2px ${node.color}` : 'none',
                    cursor: isCategory ? 'pointer' : 'default',
                }}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => isCategory && toggleCategory(node.id)}
            >
                {column !== 'Products' && (
                    <>
                        <div style={{ ...sankeyStyles.nodeLabel(align), display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {node.id}
                            {isCategory && (
                                <span style={{ fontSize: '10px', color: '#9ca3af' }}>
                                    {isExpanded ? '▼' : '▶'}
                                </span>
                            )}
                        </div>
                        <div style={sankeyStyles.nodeBarContainer}>
                            <div style={sankeyStyles.nodeBar(node.value, max, node.color)} />
                        </div>
                        <div style={sankeyStyles.nodeValue(align)}>{node.value}</div>
                    </>
                )}

                {column === 'Products' && (
                    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <div style={{ flex: 1, ...sankeyStyles.nodeLabel('left') }}>{node.id}</div>
                        <div style={{ flex: 2, ...sankeyStyles.nodeBarContainer }}>
                            <div style={sankeyStyles.nodeBar(node.value, max, node.color)} />
                        </div>
                        <div style={{ flex: 1, ...sankeyStyles.nodeValue('left') }}>{node.value}</div>
                    </div>
                )}
            </div>
        );
    };

    const sankeyStyles = {
        container: {
            position: 'relative',
            height: `${CHART_HEIGHT}px`,
            width: '100%',
            maxWidth: '100%',
            padding: '20px 10px',
            overflow: 'auto',
        },
        svgOverlay: {
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 5,
        },
        nodeWrapper: (x, y) => ({
            position: 'absolute',
            width: `${NODE_WIDTH}px`,
            top: `${y}px`,
            left: `${x}px`,
            transform: 'translateY(-50%)',
            pointerEvents: 'auto',
            transition: 'transform 0.15s ease-out, box-shadow 0.15s ease-out',
            zIndex: 10,
        }),
        nodeBarContainer: {
            height: '20px',
            backgroundColor: '#e5e7eb',
            borderRadius: '3px',
            overflow: 'hidden',
        },
        nodeBar: (value, max, color) => ({
            height: '100%',
            width: `${(value / max) * 100}%`,
            backgroundColor: color,
            transition: 'width 0.3s ease',
        }),
        nodeLabel: (align) => ({
            fontSize: '13px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '2px',
            textAlign: align,
        }),
        nodeValue: (align) => ({
            fontSize: '11px',
            color: '#6b7280',
            marginTop: '2px',
            textAlign: align,
        }),
    };


    // Filter products and links based on expanded categories
    const visibleProducts = products.filter(prod => {
        const parentLink = links.find(l => l.target === prod.id && categoryIds.has(l.source));
        return parentLink && expandedCategories.has(parentLink.source);
    });

    const visibleLinks = links.filter(link => {
        // Always show links from Technologies to Categories
        if (link.source === 'Technologies') return true;
        // Only show links from Category to Products if category is expanded
        if (categoryIds.has(link.source)) {
            return expandedCategories.has(link.source);
        }
        return false;
    });

    // Calculate dynamic height based on number of visible products
    const baseHeight = 280;
    // Calculate actual content height
    const extraHeight = visibleProducts.length > 0 ? visibleProducts.length * NODE_VERTICAL_SPACING : 0;
    const contentHeight = baseHeight + extraHeight;
    // Set max height for scrolling
    const maxHeight = 400;
    const shouldScroll = contentHeight > maxHeight;

    return (
        <div style={{
            ...sankeyStyles.container,
            height: `${contentHeight}px`,
            transition: 'height 0.3s ease',
        }}
        >
            <svg style={{ ...sankeyStyles.svgOverlay, height: `${contentHeight}px` }}>
                <defs>
                    {/* Add subtle gradient for links */}
                    <linearGradient id="linkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 0.6 }} />
                        <stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 0.4 }} />
                    </linearGradient>
                </defs>
                {visibleLinks.map(renderLink)}
            </svg>

            <h3 style={{ position: 'absolute', top: '10px', left: `${COLUMN_X.Category}px`, fontSize: '14px', fontWeight: '600', color: '#6b7280' }}>Category</h3>
            <h3 style={{ position: 'absolute', top: '10px', left: `${COLUMN_X.Products}px`, fontSize: '14px', fontWeight: '600', color: '#6b7280' }}>Products</h3>

            {techNode && renderNode(techNode, totalTechnologies, 'Technologies', 'center')}
            {categories.map(cat => renderNode(cat, maxCategoryValue, 'Category', 'left'))}
            {visibleProducts.map(prod => renderNode(prod, maxProductValue, 'Products', 'left'))}
        </div>
    );
};

const chartStyle = {
    height: '350px',
    padding: '15px',
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2 rgb(0 0 0 / 0.1)',
    backgroundColor: 'white',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    border: '1px solid #e5e7eb',
};

// Removed unused WorldMap component

// Updated HeatMap Component
const HeatMap = () => {
    const { technologyData, availableRegions } = useIndustry();

    // Initialize state with India as default
    const [country, setCountry] = useState('India');

    // Update country when regions become available, prefer India if available
    React.useEffect(() => {
        if (availableRegions.length > 0 && !country) {
            // Check if India is in the list, otherwise use first region
            const defaultRegion = availableRegions.includes('India') ? 'India' : availableRegions[0];
            setCountry(defaultRegion);
        }
    }, [availableRegions, country]);

    // Function to return constant color
    const getColor = (value) => {
        // Use constant blue color for all values
        return 'rgb(59, 130, 246)';
    };

    // Use only real data from Technographics
    const countryData = technologyData[country] || null;
    const regions = availableRegions;

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 w-full" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif' }}>

            {/* Region Dropdown */}
            <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <label htmlFor="country-select" style={{ fontSize: '14px', fontWeight: '500', color: '#374151', minWidth: 'fit-content' }}>
                    Select Region:
                </label>
                <select
                    id="country-select"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    style={{
                        flex: '1',
                        padding: '8px 32px 8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        backgroundColor: 'white',
                        fontSize: '14px',
                        color: '#1f2937',
                        cursor: 'pointer',
                        outline: 'none',
                        transition: 'all 0.2s ease',
                        backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23374151' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 10px center',
                        WebkitAppearance: 'none',
                        appearance: 'none'
                    }}
                    onFocus={(e) => {
                        e.target.style.borderColor = '#3b82f6';
                        e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                    }}
                    onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.boxShadow = 'none';
                    }}
                    disabled={regions.length === 0}
                >
                    {regions.length === 0 ? (
                        <option value="">Loading regions...</option>
                    ) : (
                        regions.map((countryName) => (
                            <option key={countryName} value={countryName}>
                                {countryName}
                            </option>
                        ))
                    )}
                </select>
            </div>

            {/* Heatmap Display */}
            {countryData ? (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-3">
                        {Object.entries(countryData)
                            .sort(([, valueA], [, valueB]) => valueB - valueA) // Sort by value descending (high to low)
                            .map(([tech, value]) => {
                                // Constant blue color
                                const color = getColor(value);

                                // text color for percentage on right: keep dark to be readable
                                const pctStyle = { fontWeight: 700, color: '#0f172a' };

                                return (
                                    <div key={tech} className="p-2 rounded-md transition-all duration-150" title={`${tech}: ${value}% adoption`}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div style={{ fontWeight: 600, color: '#0f172a' }}>{tech}</div>
                                            <div style={pctStyle}>{value}%</div>
                                        </div>
                                        <div style={{ height: '10px', width: '100%', backgroundColor: '#e6f0ff', borderRadius: 6, marginTop: 8, overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: `${value}%`, backgroundColor: color, transition: 'width 0.4s ease' }} />
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>
            ) : (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <div className="text-gray-400 mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <p className="text-gray-600">
                        {regions.length === 0
                            ? ''
                            : country
                                ? `No technology data available for "${country}".`
                                : 'Select a region to see technology adoption.'}
                    </p>
                </div>
            )}
        </div>
    );
};

// --- Chart Constants ---
const PIE_RADIUS = 95;
const SVG_SIZE = 300;
const PIE_CENTER = SVG_SIZE / 2;

// NEW CONSTANTS FOR RADIAL LABELS
const LABEL_LINE_LENGTH = 15; // Length of the short radial line
const LABEL_TEXT_OFFSET = 5;  // Space between the line end and the text

// --- Component for the SVG Pie Annotations ---
const PieAnnotations = React.memo(({ data, total, hoveredLabel }) => {
    let cumulativeAngle = 0;

    return (
        <svg
            viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
            style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible', pointerEvents: 'none' }}
        >
            {data.map((segment, index) => {
                const segmentAngle = (segment.value / total) * 360;
                const midAngle = cumulativeAngle + segmentAngle / 2;

                // Adjust angle so 0 is at 12 o'clock (top)
                const midAngleRad = (midAngle - 90) * (Math.PI / 180);

                // Start of the line (just outside the pie slice)
                const startX = PIE_CENTER + Math.cos(midAngleRad) * PIE_RADIUS;
                const startY = PIE_CENTER + Math.sin(midAngleRad) * PIE_RADIUS;

                // End of the line (radial distance out)
                const endRadius = PIE_RADIUS + LABEL_LINE_LENGTH;
                const endX = PIE_CENTER + Math.cos(midAngleRad) * endRadius;
                const endY = PIE_CENTER + Math.sin(midAngleRad) * endRadius;

                // Position for the text label
                const textRadius = endRadius + LABEL_TEXT_OFFSET;
                const textX = PIE_CENTER + Math.cos(midAngleRad) * textRadius;
                const textY = PIE_CENTER + Math.sin(midAngleRad) * textRadius;


                const pathData = `M ${startX} ${startY} L ${endX} ${endY}`;

                cumulativeAngle += segmentAngle;

                // Don't draw line for very small segments
                if (segmentAngle < 3) return null;

                const isDimmed = hoveredLabel && hoveredLabel !== segment.label;
                const lineColor = isDimmed ? '#d1d5db' : segment.color;
                const textColor = isDimmed ? '#9ca3af' : '#1f2937';

                // Determine text anchor based on angle for clean placement
                let textAnchor = 'middle';
                if (midAngle > 20 && midAngle < 160) {
                    textAnchor = 'start'; // Right side
                } else if (midAngle > 200 && midAngle < 340) {
                    textAnchor = 'end'; // Left side
                }

                return (
                    <g key={index}>
                        <path
                            d={pathData}
                            stroke={lineColor}
                            strokeWidth="2"
                            fill="none"
                            opacity={isDimmed ? 0.8 : 1}
                            strokeLinecap="round"
                        />
                        {/* Display the value (Count) near the slice */}
                        <text
                            x={textX}
                            y={textY}
                            textAnchor={textAnchor}
                            fontSize="11px"
                            fill={textColor}
                            fontWeight="600"
                            dominantBaseline="middle"
                            style={{ pointerEvents: 'none', transition: 'fill 0.1s ease' }}
                        >
                            {segment.value}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
});

const Summary = () => {
    const { industryData, setIndustryData, setTechnologyData, setAvailableRegions } = useIndustry();
    const [technographicsData, setTechnographicsData] = useState([]);
    const [loadingSankey, setLoadingSankey] = useState(true);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [selectedIndustries, setSelectedIndustries] = useState([]);
    const [showIndustryDropdown, setShowIndustryDropdown] = useState(false);
    const [intentCounts, setIntentCounts] = useState({ High: 0, 'High-Medium': 0, Medium: 0, Low: 0, 'Green Field Account': 0, Total: 0 });

    // Fetch technographics data and update context
    useEffect(() => {
        const fetchTechnographicsData = async () => {
            try {
                setLoadingSankey(true);
                const response = await fetch('/api/technographics');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setTechnographicsData(data);

                // Calculate industry counts from the table data
                const industryCounts = {};
                data.forEach(row => {
                    const industry = row.industry || 'Other';
                    industryCounts[industry] = (industryCounts[industry] || 0) + 1;
                });

                // Convert to array format for pie chart
                const industryArray = Object.entries(industryCounts).map(([label, value]) => ({
                    label,
                    value
                }));

                // Update the shared context with real industry data
                setIndustryData(industryArray);

                // Calculate technology adoption by region and category
                const techByRegion = {};
                const regions = new Set();

                data.forEach(row => {
                    const region = row.region || 'Unknown';
                    const category = row.category || 'Other';

                    regions.add(region);

                    if (!techByRegion[region]) {
                        techByRegion[region] = {};
                    }

                    if (!techByRegion[region][category]) {
                        techByRegion[region][category] = 0;
                    }

                    techByRegion[region][category]++;
                });

                // Calculate percentages for each region
                const techDataWithPercentages = {};
                Object.keys(techByRegion).forEach(region => {
                    const total = Object.values(techByRegion[region]).reduce((sum, count) => sum + count, 0);
                    techDataWithPercentages[region] = {};

                    Object.keys(techByRegion[region]).forEach(category => {
                        const percentage = total > 0 ? Math.round((techByRegion[region][category] / total) * 100) : 0;
                        techDataWithPercentages[region][category] = percentage;
                    });
                });

                setTechnologyData(techDataWithPercentages);
                setAvailableRegions(Array.from(regions).sort());
            } catch (e) {
                console.error("Failed to fetch Technographics data:", e);
            } finally {
                setLoadingSankey(false);
            }
        };

        fetchTechnographicsData();
    }, [setIndustryData, setTechnologyData, setAvailableRegions]);

    // Fetch intent data for the summary table
    useEffect(() => {
        const fetchIntentData = async () => {
            try {
                const response = await fetch('/api/intent');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();

                // Calculate intent counts
                const counts = { High: 0, 'High-Medium': 0, Medium: 0, Low: 0, 'Green Field Account': 0 };
                data.forEach(item => {
                    const status = item.intentStatus;
                    if (status === 'High') counts.High++;
                    else if (status === 'High-Medium') counts['High-Medium']++;
                    else if (status === 'Medium') counts.Medium++;
                    else if (status === 'Low') counts.Low++;
                    else if (status === 'Green Field Account') counts['Green Field Account']++;
                });
                counts.Total = data.length;
                setIntentCounts(counts);
            } catch (e) {
                console.error("Failed to fetch Intent data for summary:", e);
            }
        };
        fetchIntentData();
    }, []);

    const sankeyDataResult = useMemo(() => getSankeyData(technographicsData, selectedCategories), [technographicsData, selectedCategories]);
    const overallSankeyData = { nodes: sankeyDataResult.nodes, links: sankeyDataResult.links };
    const availableCategories = sankeyDataResult.allCategories || [];

    // Set default categories when data is loaded
    useEffect(() => {
        if (availableCategories.length > 0 && selectedCategories.length === 0) {
            const defaultCategories = ['AI/ML', 'Big Data', 'Blockchain'];
            const categoriesToSelect = defaultCategories.filter(cat => availableCategories.includes(cat));
            if (categoriesToSelect.length > 0) {
                setSelectedCategories(categoriesToSelect);
            }
        }
    }, [availableCategories, selectedCategories.length]);

    const [hoveredPieData, setHoveredPieData] = useState(null);
    const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });

    // Handle category selection (max 3)
    const handleCategoryToggle = (category) => {
        setSelectedCategories(prev => {
            if (prev.includes(category)) {
                return prev.filter(c => c !== category);
            } else if (prev.length < 3) {
                return [...prev, category];
            }
            return prev;
        });
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showCategoryDropdown && !event.target.closest('.category-dropdown-container')) {
                setShowCategoryDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showCategoryDropdown]);

    // Color palette for industries
    const colorPalette = [
        '#64B5F6', // Light Blue
        '#1565C0', // Dark Blue
        '#4CAF50', // Green
        '#FF9800', // Orange
        '#FDD835', // Yellow
        '#00897B', // Teal
        '#673AB7', // Purple
        '#E91E63', // Pink
        '#FF5722', // Deep Orange
        '#9C27B0', // Deep Purple
    ];

    // Get all available industries for the filter dropdown
    const availableIndustries = useMemo(() => {
        if (industryData && industryData.length > 0) {
            const filteredData = industryData.filter(item =>
                item.label !== 'N/A' &&
                item.label !== 'Not found' &&
                item.label.toLowerCase() !== 'n/a' &&
                item.label.toLowerCase() !== 'not found'
            );
            return filteredData.sort((a, b) => b.value - a.value).map(item => item.label);
        }
        return [];
    }, [industryData]);

    // Handle industry selection (max 10)
    const handleIndustryToggle = (industry) => {
        setSelectedIndustries(prev => {
            if (prev.includes(industry)) {
                return prev.filter(i => i !== industry);
            } else if (prev.length < 10) {
                return [...prev, industry];
            }
            return prev;
        });
    };

    // Close industry dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showIndustryDropdown && !event.target.closest('.industry-dropdown-container')) {
                setShowIndustryDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showIndustryDropdown]);

    // Use only real data from Technographics - no fallback
    // Filter by selected industries or show top 10
    const overallIndustryPieData = useMemo(() => {
        if (!industryData || industryData.length === 0) {
            return [];
        }

        // Filter out N/A and Not found
        const filteredData = industryData.filter(item =>
            item.label !== 'N/A' &&
            item.label !== 'Not found' &&
            item.label.toLowerCase() !== 'n/a' &&
            item.label.toLowerCase() !== 'not found'
        );

        // If industries are selected, filter by them, otherwise show top 10
        let dataToShow;
        if (selectedIndustries.length > 0) {
            dataToShow = filteredData.filter(item => selectedIndustries.includes(item.label));
        } else {
            const sortedData = filteredData.sort((a, b) => b.value - a.value);
            dataToShow = sortedData.slice(0, 10);
        }

        return dataToShow.map((item, index) => ({
            ...item,
            color: colorPalette[index % colorPalette.length]
        }));
    }, [industryData, selectedIndustries, colorPalette]);

    const totalValue = overallIndustryPieData.reduce((sum, s) => sum + s.value, 0) || 1;

    // Function to get the color for the pie segment or legend
    // Updated logic: Initially all segments are dark, when hovering only the hovered segment is dark
    const getSegmentColor = useCallback((item, isHovered) => {
        if (hoveredPieData) {
            // When any segment is hovered
            if (isHovered) {
                return item.color; // Keep the hovered segment dark
            } else {
                // Make non-hovered segments lighter
                return adjustColor(item.color, 20, -20);
            }
        } else {
            // No segment is hovered, so all segments are dark
            return item.color;
        }
    }, [hoveredPieData]);

    const pieBackground = useMemo(() => {
        let current = 0;
        const segments = overallIndustryPieData.map((s) => {
            const start = (current / totalValue) * 360;
            current += s.value;
            const end = (current / totalValue) * 360;

            const isThisSegmentHovered = s.label === hoveredPieData?.label;
            const color = getSegmentColor(s, isThisSegmentHovered);

            return `${color} ${start}deg ${end}deg`;
        }).join(', ');
        return `conic-gradient(${segments})`;
    }, [overallIndustryPieData, totalValue, hoveredPieData, getSegmentColor]);

    const handlePieMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const x = e.clientX - rect.left - centerX;
        const y = e.clientY - rect.top - centerY;

        setHoverPosition({ x: e.clientX, y: e.clientY });

        const distance = Math.sqrt(x * x + y * y);
        if (distance > PIE_RADIUS) {
            setHoveredPieData(null);
            return;
        }

        let angle = Math.atan2(y, x) * 180 / Math.PI;
        angle = (angle + 90 + 360) % 360;

        let currentAngle = 0;
        for (let i = 0; i < overallIndustryPieData.length; i++) {
            const segmentAngle = (overallIndustryPieData[i].value / totalValue) * 360;
            if (angle >= currentAngle && angle < currentAngle + segmentAngle) {
                setHoveredPieData({
                    ...overallIndustryPieData[i],
                    percentage: ((overallIndustryPieData[i].value / totalValue) * 100).toFixed(0),
                });
                return;
            }
            currentAngle += segmentAngle;
        }
        setHoveredPieData(null);
    };

    const handlePieMouseLeave = () => {
        setHoveredPieData(null);
    };

    const styles = {
        overallSummary: {
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
            padding: '20px',
            backgroundColor: '#ffffff',
        },
        title: {
            fontSize: 'clamp(1.2rem, 2vw, 1.4rem)',
            fontWeight: '700',
            color: '#1f2937',
            marginBottom: '5px',
        },
        divider: {
            height: '1px',
            backgroundColor: '#e5e7eb',
            margin: '10px 0 15px 0',
        },
        grid2up: {
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '20px',
            marginBottom: '20px',
        },
        summaryPanel: {
            padding: '24px',
            borderRadius: '8px',
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4 rgb(0 0 0 / 0.1)',
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            minHeight: 'auto',
            maxHeight: '400px',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'scroll',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
        },
        panelTitle: {
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '15px',
            borderBottom: '1px solid #f3f4f6',
            paddingBottom: '10px',
        },
        summaryPie: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '30px',
            padding: '10px',
            minHeight: '300px',
        },
        pieContainer: {
            width: `${SVG_SIZE}px`,
            height: `${SVG_SIZE}px`,
            position: 'relative',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'visible',
        },
        pieGraphic: {
            width: `${PIE_RADIUS * 2}px`,
            height: `${PIE_RADIUS * 2}px`,
            borderRadius: '50%',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            transition: 'all 0.1s ease-in-out',
            border: '2px solid white',
            boxShadow: '0 0 5px rgba(0,0,0,0.1)',
        },
        pieOverlay: {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: `${PIE_RADIUS * 2}px`,
            height: `${PIE_RADIUS * 2}px`,
            borderRadius: '50%',
            cursor: 'pointer',
        },
        summaryLegend: {
            listStyle: 'none',
            padding: '0',
            margin: '0',
            flexGrow: 1,
            maxHeight: '300px',
            overflowY: 'auto',
            paddingLeft: '10px',
        },
        legendItem: {
            display: 'flex',
            alignItems: 'center',
            marginBottom: '5px',
            fontSize: '14px',
            color: '#4b5563',
            padding: '2px 0',
            cursor: 'default',
            transition: 'color 0.1s ease, font-weight 0.1s ease',
        },
        dot: (color) => ({
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            marginRight: '8px',
            backgroundColor: color,
            border: '1px solid rgba(0,0,0,0.2)',
        }),
        label: {
            flexGrow: 1,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
        },
        value: {
            fontWeight: '600',
            color: '#1f2937',
            marginLeft: '10px',
        },
    };

    return (
        <div style={styles.overallSummary}>
            <h2 style={styles.title}>Insights Panel</h2>
            <div style={styles.divider} />

            <div style={styles.grid2up}>
                <div style={styles.summaryPanel}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid #f3f4f6', paddingBottom: '10px' }}>
                        <div style={styles.panelTitle} className="m-0 border-0 pb-0">Technology Stack Breakdown</div>

                        {/* Category Filter Dropdown */}
                        {availableCategories.length > 0 && (
                            <div className="category-dropdown-container" style={{ position: 'relative' }}>
                                <button
                                    onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                                    style={{
                                        padding: '6px 12px',
                                        backgroundColor: 'white',
                                        color: '#374151',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        fontWeight: '500',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        transition: 'all 0.15s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#f9fafb';
                                        e.currentTarget.style.borderColor = '#9ca3af';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'white';
                                        e.currentTarget.style.borderColor = '#d1d5db';
                                    }}
                                >
                                    Filter {selectedCategories.length > 0 && `(${selectedCategories.length})`}
                                    <span style={{ fontSize: '10px', color: '#6b7280' }}>▼</span>
                                </button>

                                {showCategoryDropdown && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '100%',
                                        right: 0,
                                        marginTop: '8px',
                                        backgroundColor: 'white',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                        zIndex: 1000,
                                        minWidth: '250px',
                                        maxHeight: '400px',
                                        overflowY: 'auto'
                                    }}>
                                        <div style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                                            <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                                                Select Categories (Max 3)
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                                {selectedCategories.length}/3 selected
                                            </div>
                                            {selectedCategories.length > 0 && (
                                                <button
                                                    onClick={() => setSelectedCategories([])}
                                                    style={{
                                                        marginTop: '8px',
                                                        padding: '4px 8px',
                                                        fontSize: '12px',
                                                        backgroundColor: '#ef4444',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    Clear All
                                                </button>
                                            )}
                                        </div>
                                        <div style={{ padding: '8px' }}>
                                            {availableCategories.map(category => (
                                                <label
                                                    key={category}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        padding: '10px 12px',
                                                        cursor: selectedCategories.includes(category) || selectedCategories.length < 3 ? 'pointer' : 'not-allowed',
                                                        borderRadius: '6px',
                                                        transition: 'background-color 0.15s',
                                                        backgroundColor: selectedCategories.includes(category) ? '#eff6ff' : 'transparent',
                                                        opacity: !selectedCategories.includes(category) && selectedCategories.length >= 3 ? 0.5 : 1
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        if (selectedCategories.includes(category) || selectedCategories.length < 3) {
                                                            e.currentTarget.style.backgroundColor = '#f3f4f6';
                                                        }
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.backgroundColor = selectedCategories.includes(category) ? '#eff6ff' : 'transparent';
                                                    }}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedCategories.includes(category)}
                                                        onChange={() => handleCategoryToggle(category)}
                                                        disabled={!selectedCategories.includes(category) && selectedCategories.length >= 3}
                                                        style={{
                                                            marginRight: '10px',
                                                            width: '16px',
                                                            height: '16px',
                                                            cursor: selectedCategories.includes(category) || selectedCategories.length < 3 ? 'pointer' : 'not-allowed'
                                                        }}
                                                    />
                                                    <span style={{ fontSize: '14px', color: '#374151', fontWeight: selectedCategories.includes(category) ? '600' : '400' }}>
                                                        {category}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {loadingSankey ? (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '380px', color: '#6b7280' }}>
                            
                        </div>
                    ) : overallSankeyData.nodes.length === 0 ? (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '380px', color: '#6b7280' }}>
                            No technology data available.
                        </div>
                    ) : (
                        <SankeyGraph data={overallSankeyData} />
                    )}
                </div>

                <div style={styles.summaryPanel}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid #f3f4f6', paddingBottom: '10px' }}>
                        <div style={styles.panelTitle} className="m-0 border-0 pb-0">Industry Wise Distribution</div>

                        {/* Industry Filter Dropdown */}
                        {availableIndustries.length > 0 && (
                            <div className="industry-dropdown-container" style={{ position: 'relative' }}>
                                <button
                                    onClick={() => setShowIndustryDropdown(!showIndustryDropdown)}
                                    style={{
                                        padding: '6px 12px',
                                        backgroundColor: 'white',
                                        color: '#374151',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        fontWeight: '500',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        transition: 'all 0.15s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#f9fafb';
                                        e.currentTarget.style.borderColor = '#9ca3af';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'white';
                                        e.currentTarget.style.borderColor = '#d1d5db';
                                    }}
                                >
                                    Filter {selectedIndustries.length > 0 && `(${selectedIndustries.length})`}
                                    <span style={{ fontSize: '10px', color: '#6b7280' }}>▼</span>
                                </button>

                                {showIndustryDropdown && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '100%',
                                        right: 0,
                                        marginTop: '8px',
                                        backgroundColor: 'white',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                        zIndex: 1000,
                                        minWidth: '250px',
                                        maxHeight: '400px',
                                        overflowY: 'auto'
                                    }}>
                                        <div style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                                            <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                                                Select Industries (Max 10)
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                                {selectedIndustries.length}/10 selected
                                            </div>
                                            {selectedIndustries.length > 0 && (
                                                <button
                                                    onClick={() => setSelectedIndustries([])}
                                                    style={{
                                                        marginTop: '8px',
                                                        padding: '4px 8px',
                                                        fontSize: '12px',
                                                        backgroundColor: '#ef4444',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    Clear All
                                                </button>
                                            )}
                                        </div>
                                        <div style={{ padding: '8px' }}>
                                            {availableIndustries.map(industry => (
                                                <label
                                                    key={industry}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        padding: '10px 12px',
                                                        cursor: selectedIndustries.includes(industry) || selectedIndustries.length < 10 ? 'pointer' : 'not-allowed',
                                                        borderRadius: '6px',
                                                        transition: 'background-color 0.15s',
                                                        backgroundColor: selectedIndustries.includes(industry) ? '#eff6ff' : 'transparent',
                                                        opacity: !selectedIndustries.includes(industry) && selectedIndustries.length >= 10 ? 0.5 : 1
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        if (selectedIndustries.includes(industry) || selectedIndustries.length < 10) {
                                                            e.currentTarget.style.backgroundColor = '#f3f4f6';
                                                        }
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.backgroundColor = selectedIndustries.includes(industry) ? '#eff6ff' : 'transparent';
                                                    }}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIndustries.includes(industry)}
                                                        onChange={() => handleIndustryToggle(industry)}
                                                        disabled={!selectedIndustries.includes(industry) && selectedIndustries.length >= 10}
                                                        style={{
                                                            marginRight: '10px',
                                                            width: '16px',
                                                            height: '16px',
                                                            cursor: selectedIndustries.includes(industry) || selectedIndustries.length < 10 ? 'pointer' : 'not-allowed'
                                                        }}
                                                    />
                                                    <span style={{ fontSize: '14px', color: '#374151', fontWeight: selectedIndustries.includes(industry) ? '600' : '400' }}>
                                                        {industry}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <div style={styles.summaryPie}>
                        {/* PIE CHART SECTION */}
                        <div style={styles.pieContainer}>
                            {/* SVG for Annotations (Lines and Values) */}
                            <PieAnnotations data={overallIndustryPieData} total={totalValue} hoveredLabel={hoveredPieData?.label} />

                            <div
                                style={{ ...styles.pieGraphic, backgroundImage: pieBackground }}
                                onMouseMove={handlePieMouseMove}
                                onMouseLeave={handlePieMouseLeave}
                            >
                                {/* Center circle removed - no total number displayed */}
                            </div>
                        </div>



                        {/* TOOLTIP (Conditional rendering based on hoveredPieData) */}
                        {hoveredPieData && (
                            <div
                                style={{
                                    position: 'fixed', // Use fixed to ensure it appears over everything
                                    top: hoverPosition.y + 15,
                                    left: hoverPosition.x + 15,
                                    padding: '8px 12px',
                                    backgroundColor: 'rgba(0,0,0,0.85)',
                                    color: 'white',
                                    borderRadius: '4px',
                                    fontSize: '13px',
                                    pointerEvents: 'none',
                                    zIndex: 100,
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                <strong>{hoveredPieData.label}</strong> ({hoveredPieData.percentage}%)
                            </div>
                        )}
                    </div>
                </div>

                <div style={styles.summaryPanel}>
                    <div style={styles.panelTitle}>Intent distribution</div>
                    {/* Intent distribution table */}
                    <div style={{ padding: '15px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', border: 'none' }}>
                            <thead>
                                <tr style={{ backgroundColor: 'rgb(59, 130, 246)' }}>
                                    <th style={{ padding: '10px 12px', color: 'black', fontWeight: '600', fontSize: '13px', border: 'none' }}>Intent Status</th>
                                    <th style={{ padding: '10px 12px', color: 'black', fontWeight: '600', fontSize: '13px', border: 'none' }}>Total Accounts</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr
                                    style={{ transition: 'background-color 0.2s ease', cursor: 'pointer' }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.3)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                                >
                                    <td style={{ padding: '10px 12px', color: '#4b5563', fontWeight: '600', fontSize: '14px', border: 'none' }}>High</td>
                                    <td style={{ padding: '10px 12px', color: '#1f2937', fontWeight: '600', fontSize: '15px', border: 'none' }}>{intentCounts.High}</td>
                                </tr>
                                <tr
                                    style={{ transition: 'background-color 0.2s ease', cursor: 'pointer' }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.3)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                                >
                                    <td style={{ padding: '10px 12px', color: '#4b5563', fontWeight: '500', fontSize: '14px', border: 'none' }}>High-Medium</td>
                                    <td style={{ padding: '10px 12px', color: '#1f2937', fontWeight: '600', fontSize: '15px', border: 'none' }}>{intentCounts['High-Medium']}</td>
                                </tr>
                                <tr
                                    style={{ transition: 'background-color 0.2s ease', cursor: 'pointer' }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.3)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                                >
                                    <td style={{ padding: '10px 12px', color: '#4b5563', fontWeight: '500', fontSize: '14px', border: 'none' }}>Medium</td>
                                    <td style={{ padding: '10px 12px', color: '#1f2937', fontWeight: '600', fontSize: '15px', border: 'none' }}>{intentCounts.Medium}</td>
                                </tr>
                                <tr
                                    style={{ transition: 'background-color 0.2s ease', cursor: 'pointer' }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.3)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                                >
                                    <td style={{ padding: '10px 12px', color: '#4b5563', fontWeight: '500', fontSize: '14px', border: 'none' }}>Low</td>
                                    <td style={{ padding: '10px 12px', color: '#1f2937', fontWeight: '600', fontSize: '15px', border: 'none' }}>{intentCounts.Low}</td>
                                </tr>
                                <tr
                                    style={{ transition: 'background-color 0.2s ease', cursor: 'pointer' }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.3)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                                >
                                    <td style={{ padding: '10px 12px', color: '#4b5563', fontWeight: '500', fontSize: '14px', border: 'none' }}>Green Field Account</td>
                                    <td style={{ padding: '10px 12px', color: '#1f2937', fontWeight: '600', fontSize: '15px', border: 'none' }}>{intentCounts['Green Field Account']}</td>
                                </tr>
                                <tr
                                    style={{ transition: 'background-color 0.2s ease', cursor: 'pointer' }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.3)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                                >
                                    <td style={{ padding: '10px 12px', color: '#1f2937', fontWeight: '700', fontSize: '14px', border: 'none' }}>Total</td>
                                    <td style={{ padding: '10px 12px', color: '#1f2937', fontWeight: '700', fontSize: '16px', border: 'none' }}>{intentCounts.Total}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div style={styles.summaryPanel}>
                    <div style={styles.panelTitle}>Technology Adoption</div>
                    <HeatMap />
                </div>
            </div>
            <style>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                [style*="overflowY: scroll"]::-webkit-scrollbar,
                [style*="overflowY: auto"]::-webkit-scrollbar,
                [style*="overflow: scroll"]::-webkit-scrollbar,
                [style*="overflow: auto"]::-webkit-scrollbar {
                    display: none;
                    width: 0;
                    height: 0;
                }
                * {
                    scrollbar-width: none;
                }
                *::-webkit-scrollbar {
                    display: none;
                    width: 0;
                    height: 0;
                }
                @media (max-width: 768px) {
                    [style*="display: flex"][style*="gap: 30px"][style*="minHeight: 300px"] {
                        flex-direction: column !important;
                        align-items: center !important;
                        padding: 40px 20px !important;
                        min-height: auto !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default Summary;