import { useState } from 'react';

export default function FinancePage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Finance Department</h1>
          <p className="text-gray-600 mt-2">Manage patient billing and financial records</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-600 text-sm font-medium">Total Patients</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">0</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-600 text-sm font-medium">Pending Payments</div>
            <div className="text-3xl font-bold text-red-600 mt-2">0</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-600 text-sm font-medium">Completed Payments</div>
            <div className="text-3xl font-bold text-green-600 mt-2">0</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-600 text-sm font-medium">Total Revenue</div>
            <div className="text-3xl font-bold text-blue-600 mt-2">$0</div>
          </div>
        </div>

        {/* Billing Records */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Billing Records</h2>
          </div>
          <div className="p-6">
            <div className="text-center text-gray-500 py-8">
              <p>No billing records yet</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
