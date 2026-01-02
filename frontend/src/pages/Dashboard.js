import React, { useState, useEffect } from 'react';
import { carbonAPI, reportAPI } from '../services/api';
import CarbonEntryForm from '../components/CarbonEntryForm';
import CarbonEntryList from '../components/CarbonEntryList';
import Analytics from '../components/Analytics';
import './Dashboard.css';

function Dashboard() {
  const [entries, setEntries] = useState([]);
  const [totalStats, setTotalStats] = useState(null);
  const [categoryStats, setCategoryStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('entries');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [entriesRes, totalRes, categoriesRes] = await Promise.all([
        carbonAPI.getEntries(),
        reportAPI.getTotal(),
        reportAPI.getCategories(),
      ]);
      setEntries(entriesRes.data);
      setTotalStats(totalRes.data);
      setCategoryStats(categoriesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEntry = async (entry) => {
    try {
      await carbonAPI.addEntry(entry);
      fetchData();
    } catch (error) {
      console.error('Error adding entry:', error);
      alert('Failed to add entry: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDeleteEntry = async (id) => {
    try {
      await carbonAPI.deleteEntry(id);
      fetchData();
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome, {localStorage.getItem('userName')}!</h1>
        <p>Track and manage your carbon footprint</p>
      </div>

      <div className="dashboard-tabs">
        <button
          className={`tab ${activeTab === 'entries' ? 'active' : ''}`}
          onClick={() => setActiveTab('entries')}
        >
          My Entries
        </button>
        <button
          className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
      </div>

      {activeTab === 'entries' && (
        <div className="entries-section">
          <CarbonEntryForm onSubmit={handleAddEntry} />
          {loading ? (
            <p className="loading-text">Loading entries...</p>
          ) : (
            <CarbonEntryList entries={entries} onDelete={handleDeleteEntry} />
          )}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="analytics-section">
          <Analytics stats={totalStats} categoryStats={categoryStats} />
        </div>
      )}
    </div>
  );
}

export default Dashboard;
