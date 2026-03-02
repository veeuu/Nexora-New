/**
 * Performance Monitoring Utility
 * Tracks latency for different stages of data loading and rendering
 */

class PerformanceMonitor {
  constructor() {
    this.marks = {};
    this.measurements = {};
  }

  /**
   * Mark the start of an operation
   * @param {string} label - Unique identifier for the operation
   */
  start(label) {
    this.marks[label] = performance.now();
  }

  /**
   * Mark the end of an operation and calculate duration
   * @param {string} label - Unique identifier for the operation
   * @returns {number} Duration in milliseconds
   */
  end(label) {
    if (!this.marks[label]) {
      return 0;
    }

    const duration = performance.now() - this.marks[label];
    this.measurements[label] = duration;
    return duration;
  }

  /**
   * Get duration of a completed measurement
   * @param {string} label - Unique identifier for the operation
   * @returns {number} Duration in milliseconds
   */
  getDuration(label) {
    return this.measurements[label] || 0;
  }

  /**
   * Get all measurements
   * @returns {object} All recorded measurements
   */
  getAllMeasurements() {
    return { ...this.measurements };
  }

  /**
   * Get a summary of all measurements
   * @returns {object} Summary with total time and breakdown
   */
  getSummary() {
    const measurements = this.getAllMeasurements();
    const total = Object.values(measurements).reduce((sum, val) => sum + val, 0);

    return {
      total: total.toFixed(2),
      breakdown: Object.entries(measurements).map(([label, duration]) => ({
        label,
        duration: duration.toFixed(2),
        percentage: ((duration / total) * 100).toFixed(1)
      })),
      measurements
    };
  }

  /**
   * Log a summary to console
   */
  logSummary() {
    // Summary logging disabled
  }

  /**
   * Reset all measurements
   */
  reset() {
    this.marks = {};
    this.measurements = {};
  }

  /**
   * Get formatted summary for display in UI
   * @returns {string} Formatted summary text
   */
  getFormattedSummary() {
    const summary = this.getSummary();
    const lines = [
      `Total Load Time: ${summary.total}ms`,
      '',
      'Breakdown:'
    ];

    summary.breakdown.forEach(item => {
      lines.push(`  ${item.label}: ${item.duration}ms (${item.percentage}%)`);
    });

    return lines.join('\n');
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

export default PerformanceMonitor;
