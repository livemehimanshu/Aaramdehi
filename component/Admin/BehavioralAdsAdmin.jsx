import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiToggleLeft, FiRefreshCw } from 'react-icons/fi';
import toast from 'react-hot-toast';

const BehavioralAdsAdmin = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState(null);
  const [formData, setFormData] = useState({
    ruleName: '',
    category: 'global',
    scoreThreshold: 10,
    discountCode: '',
    discountValue: '',
    bannerLayout: 'sticky-bottom',
    bannerText: '',
    bannerColor: '#FF6B6B',
    isActive: true
  });

  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');

  /**
   * Fetch all rules
   */
  const fetchRules = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/analytics/admin/retargeting-rules', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setRules(data.rules);
      }
    } catch (error) {
      console.error('Error fetching rules:', error);
      toast.error('Failed to fetch rules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  /**
   * Create or Update rule
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.ruleName || !formData.discountCode || !formData.discountValue) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const method = editingRuleId ? 'PUT' : 'POST';
      const url = editingRuleId
        ? `/api/analytics/admin/retargeting-rules/${editingRuleId}`
        : '/api/analytics/admin/retargeting-rules';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        toast.success(editingRuleId ? 'Rule updated successfully' : 'Rule created successfully');
        setFormData({
          ruleName: '',
          category: 'global',
          scoreThreshold: 10,
          discountCode: '',
          discountValue: '',
          bannerLayout: 'sticky-bottom',
          bannerText: '',
          bannerColor: '#FF6B6B',
          isActive: true
        });
        setEditingRuleId(null);
        setShowForm(false);
        fetchRules();
      } else {
        toast.error(data.message || 'Failed to save rule');
      }
    } catch (error) {
      console.error('Error saving rule:', error);
      toast.error('Error saving rule');
    }
  };

  /**
   * Edit rule
   */
  const handleEdit = (rule) => {
    setFormData(rule);
    setEditingRuleId(rule.ruleId);
    setShowForm(true);
  };

  /**
   * Delete rule
   */
  const handleDelete = async (ruleId) => {
    if (!window.confirm('Are you sure you want to delete this rule?')) return;

    try {
      const response = await fetch(`/api/analytics/admin/retargeting-rules/${ruleId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Rule deleted successfully');
        fetchRules();
      } else {
        toast.error('Failed to delete rule');
      }
    } catch (error) {
      console.error('Error deleting rule:', error);
      toast.error('Error deleting rule');
    }
  };

  /**
   * Toggle rule active status
   */
  const handleToggleActive = async (rule) => {
    try {
      const response = await fetch(`/api/analytics/admin/retargeting-rules/${rule.ruleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !rule.isActive })
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Rule ${!rule.isActive ? 'activated' : 'deactivated'}`);
        fetchRules();
      }
    } catch (error) {
      console.error('Error toggling rule:', error);
      toast.error('Error updating rule');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Behavioral Ads & Targeting</h1>
            <p className="text-gray-600 mt-1">Manage retargeting rules and dynamic offers</p>
          </div>
          <button
            onClick={() => {
              setFormData({
                ruleName: '',
                category: 'global',
                scoreThreshold: 10,
                discountCode: '',
                discountValue: '',
                bannerLayout: 'sticky-bottom',
                bannerText: '',
                bannerColor: '#FF6B6B',
                isActive: true
              });
              setEditingRuleId(null);
              setShowForm(!showForm);
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            <FiPlus size={20} />
            New Rule
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">
              {editingRuleId ? 'Edit Rule' : 'Create New Rule'}
            </h2>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Rule Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rule Name *
                </label>
                <input
                  type="text"
                  value={formData.ruleName}
                  onChange={(e) => setFormData({ ...formData, ruleName: e.target.value })}
                  placeholder="e.g., High Intent Pillow Retargeting"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="global">Global (All Products)</option>
                  <option value="pillows">Pillows</option>
                  <option value="mattresses">Mattresses</option>
                  <option value="bedding">Bedding</option>
                </select>
              </div>

              {/* Score Threshold */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Score Threshold (trigger when user reaches this score) *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.scoreThreshold}
                  onChange={(e) => setFormData({ ...formData, scoreThreshold: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Discount Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  value={formData.discountCode}
                  onChange={(e) => setFormData({ ...formData, discountCode: e.target.value.toUpperCase() })}
                  placeholder="e.g., PILLOW10"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Discount Value */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Value *
                </label>
                <input
                  type="text"
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                  placeholder="e.g., ₹150 OFF or 10% OFF"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Banner Layout */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Banner Layout *
                </label>
                <select
                  value={formData.bannerLayout}
                  onChange={(e) => setFormData({ ...formData, bannerLayout: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="sticky-bottom">Sticky Bottom Bar</option>
                  <option value="exit-intent">Exit-Intent Pop-up</option>
                  <option value="top-announcement">Top Announcement Banner</option>
                </select>
              </div>

              {/* Banner Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Banner Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.bannerColor}
                    onChange={(e) => setFormData({ ...formData, bannerColor: e.target.value })}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.bannerColor}
                    onChange={(e) => setFormData({ ...formData, bannerColor: e.target.value })}
                    placeholder="#FF6B6B"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Banner Text */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Banner Message
                </label>
                <textarea
                  value={formData.bannerText}
                  onChange={(e) => setFormData({ ...formData, bannerText: e.target.value })}
                  placeholder="Custom message for the banner..."
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Submit Buttons */}
              <div className="md:col-span-2 flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  {editingRuleId ? 'Update Rule' : 'Create Rule'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Rules List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              All Retargeting Rules ({rules.length})
            </h2>
            <button
              onClick={fetchRules}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition"
            >
              <FiRefreshCw size={18} />
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading rules...</div>
          ) : rules.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No rules created yet. Create your first rule to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Rule Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Threshold
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Coupon / Offer
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Layout
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {rules.map((rule) => (
                    <tr key={rule.ruleId} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {rule.ruleName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                          {rule.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {rule.scoreThreshold} points
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div>{rule.discountCode}</div>
                        <div className="text-xs text-gray-500">{rule.discountValue}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {rule.bannerLayout}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleToggleActive(rule)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                            rule.isActive
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          }`}
                        >
                          {rule.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => handleEdit(rule)}
                            className="text-blue-600 hover:text-blue-700 transition"
                            title="Edit"
                          >
                            <FiEdit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(rule.ruleId)}
                            className="text-red-600 hover:text-red-700 transition"
                            title="Delete"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BehavioralAdsAdmin;
