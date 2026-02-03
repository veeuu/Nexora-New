import React from 'react';

/**
 * Check if a row matches the search term
 * @param {Object} row - The row object to check
 * @param {string} searchTerm - The search term to match against
 * @returns {boolean} - True if any value in the row matches the search term
 */
export const rowMatchesSearch = (row, searchTerm) => {
  if (!searchTerm) return false;
  return Object.values(row).some(value =>
    String(value).toLowerCase().includes(searchTerm.toLowerCase())
  );
};

/**
 * Highlight matching text within a string
 * @param {string|number} text - The text to highlight
 * @param {string} search - The search term to highlight
 * @returns {JSX.Element|string} - JSX with highlighted text or original text
 */
export const highlightText = (text, search) => {
  if (!search || !text) return text;
  
  const textStr = String(text);
  const searchLower = search.toLowerCase();
  const textLower = textStr.toLowerCase();
  
  if (!textLower.includes(searchLower)) {
    return text;
  }

  const parts = [];
  let lastIndex = 0;
  let index = textLower.indexOf(searchLower);

  while (index !== -1) {
    if (index > lastIndex) {
      parts.push(textStr.substring(lastIndex, index));
    }
    parts.push(
      <mark key={`${index}-${search}`} style={{ backgroundColor: '#fbbf24', fontWeight: 'bold' }}>
        {textStr.substring(index, index + search.length)}
      </mark>
    );
    lastIndex = index + search.length;
    index = textLower.indexOf(searchLower, lastIndex);
  }

  if (lastIndex < textStr.length) {
    parts.push(textStr.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
};

/**
 * Tooltip component for displaying text on hover
 * @param {Object} props - Component props
 * @param {Object} props.tooltip - Tooltip state object
 * @param {boolean} props.tooltip.show - Whether to show the tooltip
 * @param {string} props.tooltip.text - The text to display
 * @param {number} props.tooltip.x - X position
 * @param {number} props.tooltip.y - Y position
 * @returns {JSX.Element|null} - Tooltip JSX or null
 */
export const Tooltip = ({ tooltip }) => {
  if (!tooltip || !tooltip.show) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        left: `${tooltip.x}px`,
        top: `${tooltip.y}px`,
        transform: 'translate(-50%, -100%)',
        backgroundColor: '#ffffffff',
        color: 'black',
        padding: '8px 12px',
        borderRadius: '6px',
        fontSize: '13px',
        fontWeight: '500',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        zIndex: 1000,
        pointerEvents: 'none',
        whiteSpace: 'nowrap',
        maxWidth: '300px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
    >
      {tooltip.text}
    </div>
  );
};

/**
 * Create tooltip event handlers
 * @param {Function} setTooltip - State setter for tooltip
 * @returns {Object} - Object with handleMouseEnter and handleMouseLeave functions
 */
export const createTooltipHandlers = (setTooltip) => {
  const handleMouseEnter = (e, text) => {
    const rect = e.target.getBoundingClientRect();
    setTooltip({
      show: true,
      text: text,
      x: rect.left + rect.width / 2,
      y: rect.top,
    });
  };

  const handleMouseLeave = () => {
    setTooltip({ show: false, text: '', x: 0, y: 0 });
  };

  return { handleMouseEnter, handleMouseLeave };
};
