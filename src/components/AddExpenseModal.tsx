import { useState } from 'react';
import { expensesAPI, type Group } from '../lib/api';

interface AddExpenseModalProps {
  group: Group;
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORIES = [
  { value: 'food', label: '🍔 Food' },
  { value: 'transport', label: '🚗 Transport' },
  { value: 'entertainment', label: '🎬 Entertainment' },
  { value: 'accommodation', label: '🏨 Accommodation' },
  { value: 'shopping', label: '🛍️ Shopping' },
  { value: 'other', label: '📌 Other' },
];

export default function AddExpenseModal({ group, onClose, onSuccess }: AddExpenseModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'other',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    paidByEmail: '',
    splitWith: [] as string[],
  });

  // Select all members by default
  useState(() => {
    if (group.members) {
      setFormData(prev => ({
        ...prev,
        splitWith: group.members!.map(m => m.email),
      }));
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.paidByEmail) {
      alert('Please select who paid');
      return;
    }

    if (formData.splitWith.length === 0) {
      alert('Please select at least one person to split with');
      return;
    }

    setLoading(true);

    try {
      await expensesAPI.create({
        group_id: group.id,
        description: formData.description,
        amount: parseFloat(formData.amount),
        category: formData.category,
        expenseDate: formData.date,
        notes: formData.notes || undefined,
        paid_by_email: formData.paidByEmail,
        split_with_emails: formData.splitWith,
      });

      onSuccess();
    } catch (error) {
      console.error('Error creating expense:', error);
      alert('Failed to create expense');
    } finally {
      setLoading(false);
    }
  };

  const toggleMember = (email: string) => {
    setFormData(prev => ({
      ...prev,
      splitWith: prev.splitWith.includes(email)
        ? prev.splitWith.filter(e => e !== email)
        : [...prev.splitWith, email],
    }));
  };

  const selectAll = () => {
    setFormData(prev => ({
      ...prev,
      splitWith: group.members!.map(m => m.email),
    }));
  };

  const selectNone = () => {
    setFormData(prev => ({ ...prev, splitWith: [] }));
  };

  const splitAmount = formData.amount && formData.splitWith.length > 0
    ? (parseFloat(formData.amount) / formData.splitWith.length).toFixed(2)
    : '0.00';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Add Expense</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <input
              type="text"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g., Dinner at restaurant"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount * ({group.currency})
            </label>
            <input
              type="number"
              required
              step="0.01"
              min="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.00"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: cat.value })}
                  className={`py-2 px-3 rounded-lg border-2 text-sm font-medium transition ${
                    formData.category === cat.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Paid By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Paid By *
            </label>
            <select
              required
              value={formData.paidByEmail}
              onChange={(e) => setFormData({ ...formData, paidByEmail: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select member</option>
              {group.members?.map((member) => (
                <option key={member.id} value={member.email}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          {/* Split With */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Split With * ({formData.splitWith.length} selected)
              </label>
              <div className="space-x-2">
                <button
                  type="button"
                  onClick={selectAll}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={selectNone}
                  className="text-xs text-gray-600 hover:text-gray-700"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="border border-gray-300 rounded-lg p-4 space-y-2 max-h-48 overflow-y-auto">
              {group.members?.map((member) => (
                <label
                  key={member.id}
                  className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.splitWith.includes(member.email)}
                    onChange={() => toggleMember(member.email)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="flex-1 text-gray-800">{member.name}</span>
                  {formData.amount && formData.splitWith.includes(member.email) && (
                    <span className="text-sm text-gray-500">
                      {group.currency === 'INR' ? '₹' : '$'}{splitAmount}
                    </span>
                  )}
                </label>
              ))}
            </div>

            {formData.amount && formData.splitWith.length > 0 && (
              <p className="text-sm text-gray-600 mt-2">
                Each person pays: {group.currency === 'INR' ? '₹' : '$'}{splitAmount}
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional details..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding...' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}