import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Calendar, Wallet, FileText, Users, UserPlus } from 'lucide-react';
import Navigation from '../components/Navigation';
import InviteCoParentModal from '../components/InviteCoParentModal';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showInviteModal, setShowInviteModal] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-50">
      <Navigation />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Greeting & Actions */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-zinc-800 mb-2">
              Hi, {user?.email?.split('@')[0]}
            </h2>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-secondary-500"></div>
              <span className="text-zinc-600">Currently with Parent A</span>
            </div>
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            <UserPlus className="w-5 h-5" />
            <span className="hidden sm:inline">Invite Co-Parent</span>
          </button>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Timeline Widget */}
          <button
            onClick={() => navigate('/calendar')}
            className="bg-white rounded-lg shadow-md p-6 text-left hover:shadow-lg transition-shadow cursor-pointer"
          >
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
            <div className="mt-4 text-sm text-primary-600 font-medium">View Calendar →</div>
          </button>

          {/* Financial Widget */}
          <button
            onClick={() => navigate('/wallet')}
            className="bg-white rounded-lg shadow-md p-6 text-left hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="flex items-center gap-3 mb-4">
              <Wallet className="w-6 h-6 text-primary-600" />
              <h3 className="text-lg font-semibold text-zinc-800">Balance</h3>
            </div>
            <div className="mb-4">
              <p className="text-3xl font-bold text-zinc-800">$450</p>
              <p className="text-sm text-zinc-500">Parent A owes you</p>
            </div>
            <div className="w-full py-2 bg-secondary-100 text-secondary-700 rounded-md text-center font-medium">
              View Wallet
            </div>
            <div className="mt-4 text-sm text-primary-600 font-medium">Manage Expenses →</div>
          </button>

          {/* Documents Widget */}
          <button
            onClick={() => navigate('/vault')}
            className="bg-white rounded-lg shadow-md p-6 text-left hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-primary-600" />
              <h3 className="text-lg font-semibold text-zinc-800">Documents</h3>
            </div>
            <div className="space-y-2">
              <div className="p-2 bg-zinc-50 rounded-md">
                <p className="text-sm font-medium text-zinc-700">Divorce Agreement</p>
                <p className="text-xs text-zinc-500">Uploaded 2 weeks ago</p>
              </div>
              <div className="p-2 bg-zinc-50 rounded-md">
                <p className="text-sm font-medium text-zinc-700">Medical Records</p>
                <p className="text-xs text-zinc-500">Updated yesterday</p>
              </div>
            </div>
            <div className="mt-4 text-sm text-primary-600 font-medium">Open Vault →</div>
          </button>

          {/* Children Widget */}
          <button
            onClick={() => navigate('/vault')}
            className="bg-white rounded-lg shadow-md p-6 text-left hover:shadow-lg transition-shadow cursor-pointer"
          >
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
            <div className="mt-4 text-sm text-primary-600 font-medium">View Medical Info →</div>
          </button>
        </div>

        {/* Coming Soon Notice */}
        <div className="mt-8 p-6 bg-primary-50 border border-primary-200 rounded-lg">
          <p className="text-primary-800 text-center">
            💡 Tip: Click on any card to navigate to that section!
          </p>
        </div>
      </main>

      {/* Invite Modal */}
      <InviteCoParentModal isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} />
    </div>
  );
}
