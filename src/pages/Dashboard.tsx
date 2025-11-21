import { useAuth } from '../hooks/useAuth';
import { LogOut, Calendar, Wallet, FileText, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/signin');
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-primary-600">CoParent</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-zinc-600">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 rounded-md transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Greeting */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-zinc-800 mb-2">
            Hi, {user?.email?.split('@')[0]}
          </h2>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-secondary-500"></div>
            <span className="text-zinc-600">Currently with Parent A</span>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Timeline Widget */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-6 h-6 text-primary-600" />
              <h3 className="text-lg font-semibold text-zinc-800">Upcoming Schedule</h3>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-zinc-50 rounded-md">
                <p className="text-sm font-medium text-zinc-700">Tomorrow, 5:00 PM</p>
                <p className="text-xs text-zinc-500">Pick-up at School</p>
              </div>
              <div className="p-3 bg-zinc-50 rounded-md">
                <p className="text-sm font-medium text-zinc-700">Friday, 3:00 PM</p>
                <p className="text-xs text-zinc-500">Drop-off at Home</p>
              </div>
            </div>
          </div>

          {/* Financial Widget */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <Wallet className="w-6 h-6 text-primary-600" />
              <h3 className="text-lg font-semibold text-zinc-800">Balance</h3>
            </div>
            <div className="mb-4">
              <p className="text-3xl font-bold text-zinc-800">$450</p>
              <p className="text-sm text-zinc-500">Parent A owes you</p>
            </div>
            <button className="w-full py-2 bg-secondary-500 text-white rounded-md hover:bg-secondary-600 transition-colors">
              Settle Up
            </button>
          </div>

          {/* Documents Widget */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-primary-600" />
              <h3 className="text-lg font-semibold text-zinc-800">Documents</h3>
            </div>
            <div className="space-y-2">
              <div className="p-2 hover:bg-zinc-50 rounded-md cursor-pointer">
                <p className="text-sm font-medium text-zinc-700">Divorce Agreement</p>
                <p className="text-xs text-zinc-500">Uploaded 2 weeks ago</p>
              </div>
              <div className="p-2 hover:bg-zinc-50 rounded-md cursor-pointer">
                <p className="text-sm font-medium text-zinc-700">Medical Records</p>
                <p className="text-xs text-zinc-500">Updated yesterday</p>
              </div>
            </div>
          </div>

          {/* Children Widget */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-6 h-6 text-primary-600" />
              <h3 className="text-lg font-semibold text-zinc-800">Children</h3>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-zinc-50 rounded-md">
                <p className="font-medium text-zinc-700">Child 1</p>
                <p className="text-sm text-zinc-500">Age 8 • Blood Type A+</p>
              </div>
              <div className="p-3 bg-zinc-50 rounded-md">
                <p className="font-medium text-zinc-700">Child 2</p>
                <p className="text-sm text-zinc-500">Age 5 • Blood Type O+</p>
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon Notice */}
        <div className="mt-8 p-6 bg-primary-50 border border-primary-200 rounded-lg">
          <p className="text-primary-800 text-center">
            🚧 More features coming soon: Calendar view, Expense tracking, Document vault, and more!
          </p>
        </div>
      </main>
    </div>
  );
}
