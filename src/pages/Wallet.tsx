import { useState } from 'react';
import { Wallet as WalletIcon, Plus, Camera, Receipt, Filter, DollarSign, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import Navigation from '../components/Navigation';
import BackButton from '../components/BackButton';

interface Expense {
  id: string;
  date: Date;
  category: string;
  description: string;
  amount: number;
  currency: string;
  addedBy: string;
  parent1Share: number;
  parent2Share: number;
  receiptUrl?: string;
}

export default function Wallet() {
  const [splitRatio, setSplitRatio] = useState(50);
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [tempSplitRatio, setTempSplitRatio] = useState(50);

  // Mock data
  const expenses: Expense[] = generateMockExpenses();
  const balance = calculateBalance(expenses);

  const handleSplitChange = (value: number) => {
    setTempSplitRatio(value);
  };

  const confirmSplitChange = () => {
    setSplitRatio(tempSplitRatio);
    setShowSplitModal(false);
    // TODO: Update in Firestore and notify other parent
    alert(`Split ratio updated to ${tempSplitRatio}/${100 - tempSplitRatio}`);
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <BackButton />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Balance & Controls */}
          <div className="space-y-6">
            {/* Balance Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <WalletIcon className="w-6 h-6 text-primary-600" />
                <h2 className="text-lg font-semibold text-zinc-800">Current Balance</h2>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-bold text-zinc-800">
                    ${Math.abs(balance).toFixed(2)}
                  </span>
                  <span className="text-zinc-600">{expenses[0]?.currency || 'USD'}</span>
                </div>
                <p className="text-sm text-zinc-600">
                  {balance > 0 ? 'Parent A owes you' : 'You owe Parent A'}
                </p>
              </div>

              <button className="w-full py-3 bg-secondary-500 text-white rounded-md hover:bg-secondary-600 transition-colors flex items-center justify-center gap-2">
                <DollarSign className="w-5 h-5" />
                Settle Up
              </button>
            </div>

            {/* Split Ratio Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-6 h-6 text-primary-600" />
                <h2 className="text-lg font-semibold text-zinc-800">Expense Split</h2>
              </div>

              <div className="mb-6">
                <div className="flex justify-between mb-3">
                  <span className="text-sm font-medium text-zinc-700">Parent A</span>
                  <span className="text-sm font-medium text-zinc-700">Parent B</span>
                </div>

                {/* Split Slider Visualization */}
                <div className="relative h-8 bg-zinc-200 rounded-full overflow-hidden mb-3">
                  <div
                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-secondary-400 to-secondary-500 transition-all duration-300"
                    style={{ width: `${splitRatio}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-zinc-800 mix-blend-difference">
                      {splitRatio}% / {100 - splitRatio}%
                    </span>
                  </div>
                </div>

                <p className="text-xs text-zinc-500 text-center">
                  All future expenses will be split according to this ratio
                </p>
              </div>

              <button
                onClick={() => {
                  setTempSplitRatio(splitRatio);
                  setShowSplitModal(true);
                }}
                className="w-full py-2 border border-zinc-300 text-zinc-700 rounded-md hover:bg-zinc-50 transition-colors"
              >
                Adjust Split Ratio
              </button>
            </div>

            {/* Recurring Payments */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-zinc-800 mb-4">Recurring Payments</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-zinc-50 rounded-md">
                  <div>
                    <p className="font-medium text-zinc-700">Child Support</p>
                    <p className="text-xs text-zinc-500">Monthly • CPI Linked</p>
                  </div>
                  <p className="font-semibold text-zinc-800">$2,000</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Expense Ledger */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-zinc-800">Expense Ledger</h2>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-zinc-100 rounded-md transition-colors">
                    <Filter className="w-5 h-5 text-zinc-600" />
                  </button>
                  <button
                    onClick={() => setShowAddExpense(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Add Expense
                  </button>
                </div>
              </div>

              {/* Expense List */}
              <div className="space-y-3">
                {expenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between p-4 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-2 bg-primary-100 rounded-lg">
                        <Receipt className="w-5 h-5 text-primary-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-zinc-800">{expense.description}</h3>
                          <span className="px-2 py-0.5 text-xs bg-zinc-100 text-zinc-600 rounded">
                            {expense.category}
                          </span>
                        </div>
                        <p className="text-sm text-zinc-500">
                          {format(expense.date, 'MMM d, yyyy')} • Added by {expense.addedBy}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1">
                          Split: ${expense.parent1Share.toFixed(2)} / ${expense.parent2Share.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-semibold text-zinc-800">
                        ${expense.amount.toFixed(2)}
                      </p>
                      <p className="text-sm text-zinc-500">{expense.currency}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Split Ratio Modal */}
      {showSplitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-zinc-800 mb-4">Adjust Expense Split</h3>

            <div className="mb-6">
              <div className="flex justify-between mb-4">
                <span className="text-sm font-medium text-zinc-700">Parent A: {tempSplitRatio}%</span>
                <span className="text-sm font-medium text-zinc-700">Parent B: {100 - tempSplitRatio}%</span>
              </div>

              {/* Slider */}
              <input
                type="range"
                min="0"
                max="100"
                value={tempSplitRatio}
                onChange={(e) => handleSplitChange(Number(e.target.value))}
                className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-secondary-500"
              />

              {/* Visual Bar */}
              <div className="relative h-12 bg-zinc-200 rounded-lg overflow-hidden mt-4">
                <div
                  className="absolute left-0 top-0 h-full bg-secondary-500 flex items-center justify-center transition-all duration-200"
                  style={{ width: `${tempSplitRatio}%` }}
                >
                  {tempSplitRatio > 20 && (
                    <span className="text-sm font-bold text-white">{tempSplitRatio}%</span>
                  )}
                </div>
                <div
                  className="absolute right-0 top-0 h-full bg-primary-500 flex items-center justify-center transition-all duration-200"
                  style={{ width: `${100 - tempSplitRatio}%` }}
                >
                  {100 - tempSplitRatio > 20 && (
                    <span className="text-sm font-bold text-white">{100 - tempSplitRatio}%</span>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 bg-alert-50 border border-alert-200 rounded-lg mb-6">
              <p className="text-sm text-alert-800">
                ⚠️ Changing the expense split will affect all future transactions. The other parent will be notified.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowSplitModal(false)}
                className="flex-1 px-4 py-2 border border-zinc-300 text-zinc-700 rounded-md hover:bg-zinc-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmSplitChange}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {showAddExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-zinc-800 mb-4">Add New Expense</h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">Description</label>
                <input
                  type="text"
                  placeholder="Doctor visit, school supplies, etc."
                  className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">Category</label>
                <select className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-primary-500">
                  <option>Medical</option>
                  <option>Education</option>
                  <option>Clothing</option>
                  <option>Extracurricular</option>
                  <option>Childcare</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">Amount</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="flex-1 px-3 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-primary-500"
                  />
                  <select className="px-3 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-primary-500">
                    <option>USD</option>
                    <option>EUR</option>
                    <option>ILS</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">Receipt (Optional)</label>
                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-zinc-300 rounded-md hover:border-primary-400 transition-colors">
                  <Camera className="w-5 h-5 text-zinc-400" />
                  <span className="text-zinc-600">Upload Receipt</span>
                </button>
              </div>

              <div className="p-3 bg-zinc-50 rounded-md">
                <p className="text-sm text-zinc-700">
                  This expense will be split <span className="font-semibold">{splitRatio}/{100 - splitRatio}</span>
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowAddExpense(false)}
                className="flex-1 px-4 py-2 border border-zinc-300 text-zinc-700 rounded-md hover:bg-zinc-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // TODO: Add expense logic
                  alert('Expense added!');
                  setShowAddExpense(false);
                }}
                className="flex-1 px-4 py-2 bg-secondary-500 text-white rounded-md hover:bg-secondary-600 transition-colors"
              >
                Add Expense
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Mock data
function generateMockExpenses(): Expense[] {
  return [
    {
      id: '1',
      date: new Date(2025, 0, 15),
      category: 'Medical',
      description: 'Doctor visit - annual checkup',
      amount: 400,
      currency: 'USD',
      addedBy: 'Parent A',
      parent1Share: 200,
      parent2Share: 200,
    },
    {
      id: '2',
      date: new Date(2025, 0, 10),
      category: 'Education',
      description: 'School supplies',
      amount: 150,
      currency: 'USD',
      addedBy: 'Parent B',
      parent1Share: 75,
      parent2Share: 75,
    },
    {
      id: '3',
      date: new Date(2025, 0, 5),
      category: 'Extracurricular',
      description: 'Soccer registration fee',
      amount: 250,
      currency: 'USD',
      addedBy: 'Parent A',
      parent1Share: 125,
      parent2Share: 125,
    },
  ];
}

function calculateBalance(expenses: Expense[]): number {
  // Mock calculation: Parent A owes
  return expenses.reduce((acc, exp) => acc + exp.parent1Share, 0);
}
