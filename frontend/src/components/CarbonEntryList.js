import React from 'react';
import './CarbonEntryList.css';

function CarbonEntryList({ entries, onDelete }) {
  if (entries.length === 0) {
    return (
      <div className="entry-list-card">
        <h2>Carbon Entries</h2>
        <p className="empty-message">No carbon entries yet. Add one to get started!</p>
      </div>
    );
  }

  return (
    <div className="entry-list-card">
      <h2>Carbon Entries</h2>
      <div className="entries-table">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Description</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id}>
                <td>{new Date(entry.date).toLocaleDateString()}</td>
                <td>
                  <span className={`category-badge ${entry.category.toLowerCase()}`}>
                    {entry.category}
                  </span>
                </td>
                <td>{entry.amount} {entry.unit}</td>
                <td>{entry.description || '-'}</td>
                <td>
                  <button
                    className="delete-btn"
                    onClick={() => onDelete(entry.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CarbonEntryList;
