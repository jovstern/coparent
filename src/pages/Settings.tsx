import { useState } from 'react';
import { User, Bell, Shield, Palette, Globe, Calendar as CalendarIcon, Mail } from 'lucide-react';
import Navigation from '../components/Navigation';
import BackButton from '../components/BackButton';
import { useAuth } from '../hooks/useAuth';

export default function Settings() {
  const { user } = useAuth();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [calendarSync, setCalendarSync] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('light');
  const [language, setLanguage] = useState('en');

  return (
    <div className="min-h-screen bg-zinc-50">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <BackButton />
        </div>

        <div className="max-w-4xl">
          <h1 className="text-3xl font-bold text-zinc-800 mb-8">Settings</h1>

          <div className="space-y-6">
            {/* Account Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3 mb-6">
                <User className="w-6 h-6 text-primary-600" />
                <h2 className="text-xl font-semibold text-zinc-800">Account</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-4 py-2 border border-zinc-300 rounded-md bg-zinc-50 text-zinc-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">Display Name</label>
                  <input
                    type="text"
                    defaultValue={user?.email?.split('@')[0]}
                    className="w-full px-4 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <button className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors">
                  Update Profile
                </button>
              </div>
            </div>

            {/* Notifications Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3 mb-6">
                <Bell className="w-6 h-6 text-primary-600" />
                <h2 className="text-xl font-semibold text-zinc-800">Notifications</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-zinc-800">Email Notifications</p>
                    <p className="text-sm text-zinc-600">Receive updates via email</p>
                  </div>
                  <button
                    onClick={() => setEmailNotifications(!emailNotifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      emailNotifications ? 'bg-secondary-500' : 'bg-zinc-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        emailNotifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-zinc-800">Push Notifications</p>
                    <p className="text-sm text-zinc-600">Browser notifications for important events</p>
                  </div>
                  <button
                    onClick={() => setPushNotifications(!pushNotifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      pushNotifications ? 'bg-secondary-500' : 'bg-zinc-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        pushNotifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="pt-4 border-t border-zinc-200">
                  <p className="text-sm font-medium text-zinc-700 mb-3">Notify me about:</p>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-sm text-zinc-700">New expenses</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-sm text-zinc-700">Schedule swap requests</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-sm text-zinc-700">Split ratio changes</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm text-zinc-700">Upcoming pickups/dropoffs</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Calendar Integration */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3 mb-6">
                <CalendarIcon className="w-6 h-6 text-primary-600" />
                <h2 className="text-xl font-semibold text-zinc-800">Calendar Integration</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-zinc-800">Google Calendar Sync</p>
                    <p className="text-sm text-zinc-600">Sync custody schedule with Google Calendar</p>
                  </div>
                  <button
                    onClick={() => setCalendarSync(!calendarSync)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      calendarSync ? 'bg-secondary-500' : 'bg-zinc-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        calendarSync ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {calendarSync && (
                  <div className="p-3 bg-secondary-50 border border-secondary-200 rounded-lg">
                    <p className="text-sm text-secondary-800">
                      ✓ Connected to calendar@example.com
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Appearance */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3 mb-6">
                <Palette className="w-6 h-6 text-primary-600" />
                <h2 className="text-xl font-semibold text-zinc-800">Appearance</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">Theme</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setTheme('light')}
                      className={`p-3 border rounded-md transition-colors ${
                        theme === 'light'
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-zinc-300 hover:bg-zinc-50'
                      }`}
                    >
                      <p className="text-sm font-medium">Light</p>
                    </button>
                    <button
                      onClick={() => setTheme('dark')}
                      className={`p-3 border rounded-md transition-colors ${
                        theme === 'dark'
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-zinc-300 hover:bg-zinc-50'
                      }`}
                    >
                      <p className="text-sm font-medium">Dark</p>
                    </button>
                    <button
                      onClick={() => setTheme('auto')}
                      className={`p-3 border rounded-md transition-colors ${
                        theme === 'auto'
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-zinc-300 hover:bg-zinc-50'
                      }`}
                    >
                      <p className="text-sm font-medium">Auto</p>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Language */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3 mb-6">
                <Globe className="w-6 h-6 text-primary-600" />
                <h2 className="text-xl font-semibold text-zinc-800">Language & Region</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-4 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="en">English</option>
                    <option value="he">עברית (Hebrew)</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">Currency</label>
                  <select className="w-full px-4 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-primary-500">
                    <option value="USD">USD ($)</option>
                    <option value="ILS">ILS (₪)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Privacy & Security */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-6 h-6 text-primary-600" />
                <h2 className="text-xl font-semibold text-zinc-800">Privacy & Security</h2>
              </div>

              <div className="space-y-3">
                <button className="w-full text-left px-4 py-3 border border-zinc-200 rounded-md hover:bg-zinc-50 transition-colors">
                  Change Password
                </button>
                <button className="w-full text-left px-4 py-3 border border-zinc-200 rounded-md hover:bg-zinc-50 transition-colors">
                  Two-Factor Authentication
                </button>
                <button className="w-full text-left px-4 py-3 border border-zinc-200 rounded-md hover:bg-zinc-50 transition-colors">
                  Privacy Settings
                </button>
                <button className="w-full text-left px-4 py-3 border border-zinc-200 rounded-md hover:bg-zinc-50 transition-colors">
                  Download My Data
                </button>
              </div>
            </div>

            {/* Email Preferences */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3 mb-6">
                <Mail className="w-6 h-6 text-primary-600" />
                <h2 className="text-xl font-semibold text-zinc-800">Email Preferences</h2>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm text-zinc-700">Weekly summary emails</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm text-zinc-700">Product updates and news</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm text-zinc-700">Tips and best practices</span>
                </label>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white rounded-lg shadow-md p-6 border-2 border-red-200">
              <h2 className="text-xl font-semibold text-red-600 mb-4">Danger Zone</h2>
              <div className="space-y-3">
                <button className="w-full text-left px-4 py-3 border border-red-200 text-red-600 rounded-md hover:bg-red-50 transition-colors">
                  Leave Agreement
                </button>
                <button className="w-full text-left px-4 py-3 border border-red-200 text-red-600 rounded-md hover:bg-red-50 transition-colors">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
