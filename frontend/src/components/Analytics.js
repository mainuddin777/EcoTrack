import React from 'react';
import './Analytics.css';

function Analytics({ stats, categoryStats }) {
  return (
    <div className="analytics-container">
      <div className="stats-card">
        <h2>Statistics</h2>
        {stats ? (
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-label">Total Carbon</div>
              <div className="stat-value">
                {stats.total ? stats.total.toFixed(2) : 0} kg
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Average Entry</div>
              <div className="stat-value">
                {stats.average ? stats.average.toFixed(2) : 0} kg
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Total Entries</div>
              <div className="stat-value">{stats.count || 0}</div>
            </div>
          </div>
        ) : (
          <p>Loading statistics...</p>
        )}
      </div>

      <div className="category-card">
        <h2>By Category</h2>
        {categoryStats && categoryStats.length > 0 ? (
          <div className="category-list">
            {categoryStats.map((cat) => (
              <div key={cat.category} className="category-item">
                <div className="category-info">
                  <span className={`category-badge ${cat.category.toLowerCase()}`}>
                    {cat.category}
                  </span>
                  <span className="category-amount">{cat.total.toFixed(2)} kg</span>
                </div>
                <div className="category-bar">
                  <div
                    className={`category-fill ${cat.category.toLowerCase()}`}
                    style={{
                      width: `${
                        (cat.total / Math.max(...categoryStats.map((c) => c.total))) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No category data available</p>
        )}
      </div>
    </div>
  );
}

export default Analytics;
