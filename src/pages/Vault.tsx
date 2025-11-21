import { useState } from 'react';
import { FileText, Search, Home, Clock, AlertCircle, Heart, Phone, Upload } from 'lucide-react';
import Navigation from '../components/Navigation';

interface Asset {
  id: string;
  name: string;
  type: string;
  description: string;
  estimatedValue?: number;
  saleDeadline?: Date;
  status: string;
}

interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  isPrimary: boolean;
}

export default function Vault() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'agreement' | 'assets' | 'medical'>('agreement');

  // Mock data
  const assets: Asset[] = [
    {
      id: '1',
      name: 'Kfar Saba Apartment',
      type: 'property',
      description: '3 bedroom apartment in Kfar Saba',
      estimatedValue: 450000,
      saleDeadline: new Date('2026-05-15'),
      status: 'active',
    },
  ];

  const emergencyContacts: EmergencyContact[] = [
    {
      name: 'Dr. Sarah Cohen',
      relationship: 'Pediatrician',
      phone: '+972-50-123-4567',
      isPrimary: true,
    },
    {
      name: 'Michael Levi',
      relationship: 'Grandfather',
      phone: '+972-50-765-4321',
      isPrimary: false,
    },
  ];

  const agreementText = `
DIVORCE AGREEMENT

This agreement is made between Parent A and Parent B regarding the custody and support of their children.

SECTION 1: CHILD CUSTODY
The parties agree to a shared custody arrangement with alternating weekly custody. Pickup and dropoff shall occur at 5:00 PM on Sundays at the children's school.

SECTION 2: CHILD SUPPORT (MEZONOT)
Parent A shall pay Parent B child support in the amount of 2,000 ILS per month. This amount is linked to the Consumer Price Index (CPI) and shall be adjusted annually.

SECTION 3: EXPENSE SHARING
All extraordinary expenses for the children, including but not limited to medical, educational, and extracurricular activities, shall be split 50/50 between the parents.

SECTION 4: HOLIDAY SCHEDULE
The parents shall alternate major holidays. The specific schedule for Jewish holidays is as follows:
- Passover: Years ending in odd numbers to Parent A, even numbers to Parent B
- Rosh Hashanah: Alternating years
- Hanukkah: First 4 nights to one parent, last 4 nights to the other, alternating each year

SECTION 5: PROPERTY DIVISION
The marital apartment located in Kfar Saba shall be sold within 18 months of this agreement. Proceeds shall be split 50/50 between the parties.
  `.trim();

  const daysUntilDeadline = assets[0]?.saleDeadline
    ? Math.ceil((assets[0].saleDeadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="min-h-screen bg-zinc-50">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Quick Access */}
          <div className="space-y-6">
            {/* Medical ID Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <Heart className="w-6 h-6 text-red-500" />
                <h2 className="text-lg font-semibold text-zinc-800">Medical ID</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-zinc-700 mb-2">Child 1</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-zinc-600">Blood Type:</span>
                      <span className="font-medium">A+</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-600">Health Insurance:</span>
                      <span className="font-medium">Maccabi</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-200">
                  <h4 className="font-medium text-zinc-700 mb-3">Emergency Contacts</h4>
                  <div className="space-y-2">
                    {emergencyContacts.map((contact, idx) => (
                      <div key={idx} className="p-2 bg-zinc-50 rounded-md">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-zinc-800">{contact.name}</p>
                          {contact.isPrimary && (
                            <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded">
                              Primary
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-600">{contact.relationship}</p>
                        <a
                          href={`tel:${contact.phone}`}
                          className="text-xs text-primary-600 hover:underline flex items-center gap-1 mt-1"
                        >
                          <Phone className="w-3 h-3" />
                          {contact.phone}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Asset Tracker */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <Home className="w-6 h-6 text-primary-600" />
                <h2 className="text-lg font-semibold text-zinc-800">Asset Tracker</h2>
              </div>

              {assets.map((asset) => (
                <div key={asset.id} className="space-y-3">
                  <div>
                    <h3 className="font-medium text-zinc-800 mb-1">{asset.name}</h3>
                    <p className="text-sm text-zinc-600">{asset.description}</p>
                  </div>

                  {asset.estimatedValue && (
                    <div className="p-3 bg-zinc-50 rounded-md">
                      <p className="text-xs text-zinc-600 mb-1">Estimated Value</p>
                      <p className="text-lg font-semibold text-zinc-800">
                        ${asset.estimatedValue.toLocaleString()}
                      </p>
                    </div>
                  )}

                  {asset.saleDeadline && (
                    <div className="p-3 bg-alert-50 border border-alert-200 rounded-md">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-alert-600" />
                        <p className="text-sm font-medium text-alert-800">Sale Deadline</p>
                      </div>
                      <p className="text-2xl font-bold text-alert-900 mb-1">{daysUntilDeadline}</p>
                      <p className="text-xs text-alert-700">days remaining</p>
                      <p className="text-xs text-zinc-600 mt-2">
                        {asset.saleDeadline.toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Main Content - Documents */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              {/* Tabs */}
              <div className="flex items-center gap-4 mb-6 border-b border-zinc-200">
                <button
                  onClick={() => setSelectedTab('agreement')}
                  className={`pb-3 px-2 font-medium transition-colors ${
                    selectedTab === 'agreement'
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-zinc-600 hover:text-zinc-800'
                  }`}
                >
                  Agreement
                </button>
                <button
                  onClick={() => setSelectedTab('assets')}
                  className={`pb-3 px-2 font-medium transition-colors ${
                    selectedTab === 'assets'
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-zinc-600 hover:text-zinc-800'
                  }`}
                >
                  Assets
                </button>
                <button
                  onClick={() => setSelectedTab('medical')}
                  className={`pb-3 px-2 font-medium transition-colors ${
                    selectedTab === 'medical'
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-zinc-600 hover:text-zinc-800'
                  }`}
                >
                  Medical Records
                </button>
              </div>

              {/* Agreement Tab */}
              {selectedTab === 'agreement' && (
                <div>
                  {/* Search */}
                  <div className="mb-6">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search agreement text..."
                        className="w-full pl-10 pr-4 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>

                  {/* Agreement Text */}
                  <div className="prose prose-sm max-w-none">
                    <div className="p-6 bg-zinc-50 rounded-lg border border-zinc-200">
                      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-zinc-300">
                        <FileText className="w-6 h-6 text-primary-600" />
                        <div>
                          <h3 className="font-semibold text-zinc-800">Divorce Agreement.pdf</h3>
                          <p className="text-sm text-zinc-600">Uploaded 2 weeks ago</p>
                        </div>
                      </div>

                      <div className="whitespace-pre-wrap text-zinc-700 leading-relaxed">
                        {agreementText}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Assets Tab */}
              {selectedTab === 'assets' && (
                <div>
                  <div className="mb-6 flex justify-between items-center">
                    <p className="text-zinc-600">Manage shared assets and property</p>
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors">
                      <Upload className="w-4 h-4" />
                      Upload Document
                    </button>
                  </div>

                  <div className="space-y-4">
                    {assets.map((asset) => (
                      <div key={asset.id} className="p-4 border border-zinc-200 rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-zinc-800 mb-1">{asset.name}</h3>
                            <p className="text-sm text-zinc-600">{asset.description}</p>
                          </div>
                          <span className="px-3 py-1 bg-secondary-100 text-secondary-700 text-sm rounded-full">
                            {asset.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div className="p-3 bg-zinc-50 rounded-md">
                            <p className="text-xs text-zinc-600 mb-1">Type</p>
                            <p className="font-medium text-zinc-800 capitalize">{asset.type}</p>
                          </div>
                          <div className="p-3 bg-zinc-50 rounded-md">
                            <p className="text-xs text-zinc-600 mb-1">Estimated Value</p>
                            <p className="font-medium text-zinc-800">
                              ${asset.estimatedValue?.toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {asset.saleDeadline && (
                          <div className="mt-4 p-3 bg-alert-50 rounded-md flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-alert-600" />
                            <p className="text-sm text-alert-800">
                              Must be sold by {asset.saleDeadline.toLocaleDateString()} ({daysUntilDeadline} days)
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Medical Tab */}
              {selectedTab === 'medical' && (
                <div>
                  <div className="mb-6 flex justify-between items-center">
                    <p className="text-zinc-600">Medical records and health information</p>
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors">
                      <Upload className="w-4 h-4" />
                      Upload Record
                    </button>
                  </div>

                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-zinc-300" />
                    <p className="text-zinc-600 mb-4">No medical records uploaded yet</p>
                    <button className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors">
                      Upload First Record
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
