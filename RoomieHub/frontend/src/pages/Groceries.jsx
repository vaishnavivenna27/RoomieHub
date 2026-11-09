import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Loading from '../components/Loading';
import '../css/Groceries.css';

const Groceries = () => {
  const [groceries, setGroceries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Add Item State
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [category, setCategory] = useState('General');
  const [filterTab, setFilterTab] = useState('all'); // 'all', 'needed', 'purchased'

  const categories = ['Produce', 'Dairy', 'Snacks', 'Beverages', 'Pantry', 'Cleaning', 'Personal Care', 'General'];

  const fetchGroceries = async () => {
    try {
      setLoading(true);
      const res = await api.get('/groceries');
      if (res.success) {
        setGroceries(res.groceries || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load grocery list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroceries();
  }, []);

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!itemName.trim()) {
      setError('Please enter a grocery item name.');
      return;
    }

    try {
      setError('');
      const res = await api.post('/groceries', {
        itemName: itemName.trim(),
        quantity: quantity.trim() || '1',
        category
      });

      if (res.success) {
        setSuccess('Item added to grocery list!');
        setItemName('');
        setQuantity('1');
        setGroceries([res.grocery, ...groceries]);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.message || 'Error adding grocery item');
    }
  };

  const handleTogglePurchased = async (groceryId, currentStatus) => {
    try {
      const res = await api.put(`/groceries/${groceryId}`, {
        isPurchased: !currentStatus
      });

      if (res.success) {
        setGroceries(groceries.map((g) => (g._id === groceryId ? res.grocery : g)));
      }
    } catch (err) {
      setError(err.message || 'Failed to update item');
    }
  };

  const handleDeleteItem = async (groceryId) => {
    try {
      const res = await api.delete(`/groceries/${groceryId}`);
      if (res.success) {
        setGroceries(groceries.filter((g) => g._id !== groceryId));
      }
    } catch (err) {
      setError(err.message || 'Failed to delete grocery item');
    }
  };

  const filteredGroceries = groceries.filter((item) => {
    if (filterTab === 'needed') return !item.isPurchased;
    if (filterTab === 'purchased') return item.isPurchased;
    return true;
  });

  const neededCount = groceries.filter((g) => !g.isPurchased).length;
  const purchasedCount = groceries.filter((g) => g.isPurchased).length;

  if (loading) {
    return <Loading message="Loading grocery checklist..." />;
  }

  return (
    <div className="groceries-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Shared Grocery List</h1>
          <p className="page-subtitle">Add needed items, plan shopping trips, and check off purchased goods.</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Quick Add Form */}
      <div className="card grocery-add-card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem' }}>
          + Add Item to Shopping List
        </h3>
        <form onSubmit={handleAddItem} className="grocery-add-form">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Item Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Oat Milk, Dish Soap, Eggs, Bread"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Quantity</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. 2, 1 pack, 500g"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn btn-primary" style={{ height: '42px' }}>
            Add Item
          </button>
        </form>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <button
          className={`btn btn-sm ${filterTab === 'all' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setFilterTab('all')}
        >
          All Items ({groceries.length})
        </button>
        <button
          className={`btn btn-sm ${filterTab === 'needed' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setFilterTab('needed')}
        >
          To Buy ({neededCount})
        </button>
        <button
          className={`btn btn-sm ${filterTab === 'purchased' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setFilterTab('purchased')}
        >
          Purchased ({purchasedCount})
        </button>
      </div>

      {/* Grocery Items List */}
      <div className="grocery-list-container">
        {filteredGroceries.map((item) => (
          <div
            key={item._id}
            className={`grocery-item-row ${item.isPurchased ? 'purchased' : ''}`}
          >
            <div className="grocery-left">
              <input
                type="checkbox"
                className="grocery-checkbox"
                checked={item.isPurchased}
                onChange={() => handleTogglePurchased(item._id, item.isPurchased)}
                title={item.isPurchased ? "Mark as needed" : "Mark as purchased"}
              />
              <div>
                <span className="grocery-item-title">{item.itemName}</span>
                <div className="grocery-item-meta">
                  Category: <strong>{item.category}</strong> • Added by {item.addedBy?.name || 'Roommate'}
                </div>
              </div>
            </div>

            <div className="grocery-right">
              <span className="grocery-qty-badge">Qty: {item.quantity}</span>
              <button
                onClick={() => handleDeleteItem(item._id)}
                className="btn btn-sm btn-danger"
                title="Remove item"
              >
                &times;
              </button>
            </div>
          </div>
        ))}

        {filteredGroceries.length === 0 && (
          <div className="card empty-state">
            <div className="empty-state-icon">🛒</div>
            <h3>Your grocery list is empty</h3>
            <p>Add anything you need from the supermarket above!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Groceries;
