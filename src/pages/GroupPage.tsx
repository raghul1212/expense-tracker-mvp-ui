import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { groupsAPI, expensesAPI, type Group, type Expense, type Balance, type Settlement } from '../lib/api';
import AddExpenseModal from '../components/AddExpenseModal';
import AddMemberModal from '../components/AddMemberModal';
import { formatDateToLocalDate } from '../utils/DateTimeUtils';

export default function GroupPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  
  const [group, setGroup] = useState<Group | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'expenses' | 'balances' | 'settle'>('expenses');
  
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);

  useEffect(() => {
    loadGroupData();
  }, [groupId]);

  const loadGroupData = async () => {
    if (!groupId) return;
    
    setLoading(true);
    try {
      const [groupData, expensesData, balancesData, settlementsData] = await Promise.all([
        groupsAPI.getById(groupId),
        expensesAPI.getByGroup(groupId),
        groupsAPI.getBalances(groupId),
        groupsAPI.getSettlements(groupId),
      ]);

      setGroup(groupData);
      setExpenses(expensesData);
      setBalances(balancesData);
      setSettlements(settlementsData);
    } catch (error) {
      console.error('Error loading group:', error);
      alert('Failed to load group');
    } finally {
      setLoading(false);
    }
  };

  const handleExpenseAdded = () => {
    setShowAddExpense(false);
    loadGroupData();
  };

  const handleMemberAdded = () => {
    setShowAddMember(false);
    loadGroupData();
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    try {
      await expensesAPI.delete(expenseId);
      loadGroupData();
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Failed to delete expense');
    }
  };

  const copyGroupLink = () => {
    const link = window.location.href;
    navigator.clipboard.writeText(link);
    alert('Group link copied to clipboard!');
  };

  const getCurrencySymbol = (currency: string) => {
    const symbols: Record<string, string> = {
      INR: '₹',
      USD: '$',
      EUR: '€',
      GBP: '£',
    };
    return symbols[currency] || currency;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading group...</p>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Group not found</h2>
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-700"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  const currencySymbol = getCurrencySymbol(group.currency);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/')}
              className="text-blue-600 hover:text-blue-700"
            >
              ← Home
            </button>
            <button
              onClick={copyGroupLink}
              className="text-sm bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition"
            >
              📋 Copy Link
            </button>
          </div>

          <h1 className="text-3xl font-bold text-gray-800">{group.name}</h1>
          {group.description && (
            <p className="text-gray-600 mt-1">{group.description}</p>
          )}

          <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
            <span>{group.members?.length || 0} members</span>
            <span>•</span>
            <span>{expenses.length} expenses</span>
            <span>•</span>
            <span>Currency: {group.currency}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Actions & Members */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setShowAddExpense(true)}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  + Add Expense
                </button>
                <button
                  onClick={() => setShowAddMember(true)}
                  className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition"
                >
                  + Add Member
                </button>
              </div>
            </div>

            {/* Members List */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-800 mb-4">
                Members ({group.members?.length || 0})
              </h3>
              <div className="space-y-3">
                {group.members?.map((member) => (
                  <div key={member.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">{member.name}</p>
                      <p className="text-sm text-gray-500 truncate">{member.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Tabs */}
          <div className="lg:col-span-2">
            {/* Tab Navigation */}
            <div className="bg-white rounded-t-xl shadow-sm border-b">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('expenses')}
                  className={`flex-1 py-4 px-6 font-medium transition ${
                    activeTab === 'expenses'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Expenses ({expenses.length})
                </button>
                <button
                  onClick={() => setActiveTab('balances')}
                  className={`flex-1 py-4 px-6 font-medium transition ${
                    activeTab === 'balances'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Balances
                </button>
                <button
                  onClick={() => setActiveTab('settle')}
                  className={`flex-1 py-4 px-6 font-medium transition ${
                    activeTab === 'settle'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Settle Up
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-b-xl shadow-sm p-6 min-h-[500px]">
              {activeTab === 'expenses' && (
                <div className="space-y-4">
                  {expenses.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500 mb-4">No expenses yet</p>
                      <button
                        onClick={() => setShowAddExpense(true)}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Add your first expense
                      </button>
                    </div>
                  ) : (
                    expenses.map((expense) => (
                      <div
                        key={expense.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800">
                              {expense.description}
                            </h4>
                            <p className="text-sm text-gray-500">
                              Paid by {expense.paid_by.name}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-gray-800">
                              {currencySymbol}{parseFloat(expense.amount).toFixed(2)}
                            </p>
                            <span className="inline-block px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600 capitalize">
                              {expense.category}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-sm text-gray-600 mb-2">
                            Split among {expense.splits.length} people:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {expense.splits.map((split) => (
                              <div
                                key={split.user_id}
                                className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full"
                              >
                                {split.user_name}: {currencySymbol}{parseFloat(split.amount).toFixed(2)}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between text-sm">
                          <span className="text-gray-500">
                            {formatDateToLocalDate(expense.expenseDate)}
                          </span>
                          <button
                            onClick={() => handleDeleteExpense(expense.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'balances' && (
                <div className="space-y-3">
                  {balances.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500">No balances to show</p>
                    </div>
                  ) : (
                    balances.map((balance) => {
                      const netBalance = parseFloat(balance.net_balance);
                      const isPositive = netBalance > 0;
                      const isZero = Math.abs(netBalance) < 0.01;

                      return (
                        <div
                          key={balance.user_id}
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                        >
                          <div>
                            <p className="font-semibold text-gray-800">{balance.user_name}</p>
                            <p className="text-sm text-gray-500">
                              Paid: {currencySymbol}{parseFloat(balance.total_paid).toFixed(2)} | 
                              Owes: {currencySymbol}{parseFloat(balance.total_owed).toFixed(2)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p
                              className={`text-lg font-bold ${
                                isZero
                                  ? 'text-gray-400'
                                  : isPositive
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }`}
                            >
                              {isZero
                                ? 'Settled'
                                : `${isPositive ? '+' : ''}${currencySymbol}${Math.abs(netBalance).toFixed(2)}`}
                            </p>
                            <p className="text-xs text-gray-500">
                              {isZero ? 'All clear' : isPositive ? 'Gets back' : 'Owes'}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {activeTab === 'settle' && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-blue-800">
                      💡 Here's how to settle all debts with minimum transactions
                    </p>
                  </div>

                  {settlements.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500 mb-2">🎉 All settled up!</p>
                      <p className="text-sm text-gray-400">No pending settlements</p>
                    </div>
                  ) : (
                    settlements.map((settlement, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">
                            {settlement.from_user_name}
                          </p>
                        </div>
                        <div className="text-center px-4">
                          <div className="text-sm text-gray-500">pays</div>
                          <div className="text-xl font-bold text-blue-600">
                            {currencySymbol}{parseFloat(settlement.amount).toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-500">to</div>
                        </div>
                        <div className="flex-1 text-right">
                          <p className="font-medium text-gray-800">
                            {settlement.to_user_name}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAddExpense && group && (
        <AddExpenseModal
          group={group}
          onClose={() => setShowAddExpense(false)}
          onSuccess={handleExpenseAdded}
        />
      )}

      {showAddMember && group && (
        <AddMemberModal
          groupId={group.id}
          onClose={() => setShowAddMember(false)}
          onSuccess={handleMemberAdded}
        />
      )}
    </div>
  );
}